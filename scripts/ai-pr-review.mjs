import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const REVIEW_MARKER = '<!-- local-ai-review:v1 -->';
const DEFAULT_MODEL = 'openai/gpt-5-mini';
const MAX_DIFF_CHARS = 140_000;

function fail(message) {
  console.error(`[ai-pr-review] ${message}`);
  process.exit(1);
}

function readText(relativePath, maxChars = 24_000) {
  try {
    const text = fs.readFileSync(relativePath, 'utf8');
    if (text.length <= maxChars) return text;
    return `${text.slice(0, maxChars)}\n\n[truncated by reviewer]`;
  } catch {
    return '';
  }
}

function findTaskContext(pr) {
  const hint = [pr.title, pr.body || '', pr.head?.ref || ''].join('\n');
  const match = hint.match(/\bT\d{3}\b/i);
  if (!match) return null;

  const taskId = match[0].toUpperCase();
  const taskDir = path.join('docs', 'workbench', 'tasks');
  try {
    const filename = fs.readdirSync(taskDir).find((name) => name.startsWith(`${taskId}-`));
    if (!filename) return null;
    return {
      taskId,
      path: path.join(taskDir, filename),
      content: readText(path.join(taskDir, filename), 24_000),
    };
  } catch {
    return null;
  }
}

function normalizeModelContent(content) {
  if (typeof content === 'string') return content.trim();
  if (Array.isArray(content)) {
    return content
      .map((part) => (typeof part === 'string' ? part : part?.text || part?.content || ''))
      .filter(Boolean)
      .join('\n')
      .trim();
  }
  return '';
}

async function githubRequest(url, options = {}) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) fail('GITHUB_TOKEN is missing.');

  const response = await fetch(url, {
    ...options,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const body = await response.text();
    fail(`GitHub API ${response.status}: ${body.slice(0, 1200)}`);
  }
  if (response.status === 204) return null;
  return response.json();
}

async function main() {
  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath) fail('GITHUB_EVENT_PATH is missing.');

  const event = JSON.parse(fs.readFileSync(eventPath, 'utf8'));
  const pr = event.pull_request;
  if (!pr) fail('This script must run from a pull_request event.');

  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  if (!apiKey) {
    fail(
      'OPENROUTER_API_KEY is not configured. Add it in GitHub Settings > Secrets and variables > Actions > Repository secrets.',
    );
  }

  const repo = process.env.GITHUB_REPOSITORY;
  if (!repo) fail('GITHUB_REPOSITORY is missing.');

  const baseSha = pr.base?.sha;
  const headSha = pr.head?.sha;
  if (!baseSha || !headSha) fail('Pull request base/head SHA is missing.');

  let diff = '';
  try {
    diff = execFileSync(
      'git',
      ['diff', '--no-ext-diff', '--unified=40', `${baseSha}...${headSha}`],
      { encoding: 'utf8', maxBuffer: 12 * 1024 * 1024 },
    );
  } catch (error) {
    fail(`Unable to build PR diff: ${error.message}`);
  }

  if (!diff.trim()) {
    fail('The pull request diff is empty.');
  }

  const fullDiffLength = diff.length;
  const diffWasTruncated = fullDiffLength > MAX_DIFF_CHARS;
  if (diffWasTruncated) {
    diff = `${diff.slice(0, MAX_DIFF_CHARS)}\n\n[diff truncated by reviewer: ${fullDiffLength} chars total]`;
  }

  const changedFiles = (() => {
    try {
      return execFileSync('git', ['diff', '--name-only', `${baseSha}...${headSha}`], {
        encoding: 'utf8',
      }).trim();
    } catch {
      return '';
    }
  })();

  const task = findTaskContext(pr);
  const contexts = [
    ['AGENTS.md', readText('AGENTS.md', 28_000)],
    ['Product brief', readText('docs/product/00-product-brief.md', 18_000)],
    ['Work ledger', readText('docs/workbench/00-work-ledger.md', 18_000)],
    task ? [`Task ${task.taskId} (${task.path})`, task.content] : null,
  ].filter((item) => item && item[1]);

  const projectContext = contexts
    .map(([label, content]) => `### ${label}\n${content}`)
    .join('\n\n');

  const systemPrompt = `You are an independent pull-request reviewer for a prototype repository.
Review for correctness, regressions, violated product/contracts, broken flows, state/data inconsistencies, unsafe CI changes, and missing validation that could hide a real defect.

Rules:
- Prioritize actionable defects over style.
- Do not invent requirements that are not present in the supplied project context or diff.
- Separate Observation, Inference, and Judgment for each finding.
- Use severity P0/P1/P2/P3. Only report P0-P2 by default; use P3 only when it materially affects maintainability or validation.
- If evidence is incomplete, say so under Review gaps instead of turning uncertainty into a bug.
- CI/typecheck/build passing does not equal product acceptance.
- Never claim the project task is PASS. This review is advisory and non-blocking during the experiment.
- Give file paths and line/function/component references when the diff makes them available.
- Do not include the HTML marker "${REVIEW_MARKER}" in your answer.

Return Markdown using exactly these top-level headings:
## Verdict
Choose one: NO_BLOCKING_FINDINGS, CHANGES_NEEDED, or HUMAN_CHECK_NEEDED. Add one short sentence.
## Findings
For every finding:
### [P1] Short title
- Observation:
- Inference:
- Judgment:
- Location:
- Suggested fix:
If there are no actionable findings, write "No high-confidence P0-P2 findings."
## Review gaps
List anything important that could not be verified from the diff/context, or "None identified."`;

  const userPrompt = `Repository: ${repo}
PR: #${pr.number} ${pr.title}
Base: ${pr.base?.ref} (${baseSha})
Head: ${pr.head?.ref} (${headSha})
Author: ${pr.user?.login || 'unknown'}
Changed files:
${changedFiles || '(unknown)'}
Diff truncated: ${diffWasTruncated ? 'yes' : 'no'}

PR body:
${pr.body || '(none)'}

PROJECT CONTEXT
${projectContext}

PULL REQUEST DIFF
\`\`\`diff
${diff}
\`\`\``;

  const model = process.env.AI_REVIEW_MODEL?.trim() || DEFAULT_MODEL;
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': `https://github.com/${repo}`,
      'X-OpenRouter-Title': `${repo} experimental PR review`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    fail(`OpenRouter ${response.status}: ${body.slice(0, 1600)}`);
  }

  const data = await response.json();
  const reviewBody = normalizeModelContent(data?.choices?.[0]?.message?.content);
  if (!reviewBody) fail('The review model returned an empty response.');

  const runUrl = process.env.GITHUB_RUN_ID
    ? `https://github.com/${repo}/actions/runs/${process.env.GITHUB_RUN_ID}`
    : null;
  const generatedAt = new Date().toISOString();

  const commentBody = [
    REVIEW_MARKER,
    '# Experimental AI PR Review',
    '',
    '> Advisory only. This does **not** approve the PR, mark a task PASS, or replace human/product validation.',
    '',
    `- Model: \`${model}\``,
    `- Head SHA: \`${headSha}\``,
    `- Generated: \`${generatedAt}\``,
    runUrl ? `- Workflow run: ${runUrl}` : null,
    diffWasTruncated ? '- Diff note: review input was truncated; check **Review gaps** carefully.' : null,
    '',
    reviewBody,
    '',
    '---',
    'Local agent handoff: run `npm run review:pull` on the PR branch, then read `.ai/reviews/latest.md`.',
  ]
    .filter((line) => line !== null)
    .join('\n');

  fs.writeFileSync('ai-review.md', `${commentBody}\n`, 'utf8');

  const commentsUrl = `https://api.github.com/repos/${repo}/issues/${pr.number}/comments?per_page=100`;
  const comments = await githubRequest(commentsUrl);
  const previous = Array.isArray(comments)
    ? comments.find(
        (comment) =>
          typeof comment?.body === 'string' &&
          comment.body.includes(REVIEW_MARKER) &&
          comment?.user?.login === 'github-actions[bot]',
      )
    : null;

  if (previous?.id) {
    await githubRequest(`https://api.github.com/repos/${repo}/issues/comments/${previous.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ body: commentBody }),
    });
    console.log(`[ai-pr-review] Updated review comment ${previous.id} on PR #${pr.number}.`);
  } else {
    await githubRequest(`https://api.github.com/repos/${repo}/issues/${pr.number}/comments`, {
      method: 'POST',
      body: JSON.stringify({ body: commentBody }),
    });
    console.log(`[ai-pr-review] Created review comment on PR #${pr.number}.`);
  }
}

await main();

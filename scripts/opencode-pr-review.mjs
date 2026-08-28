import fs from 'node:fs';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';

const REVIEW_MARKER = '<!-- local-ai-review:v1 -->';
const DEFAULT_MODEL = 'opencode-go/deepseek-v4-pro';
const MAX_DIFF_CHARS = 140_000;

function fail(message) {
  console.error(`[opencode-pr-review] ${message}`);
  process.exit(1);
}

function readText(relativePath, maxChars = 24_000) {
  try {
    const text = fs.readFileSync(relativePath, 'utf8');
    return text.length <= maxChars ? text : `${text.slice(0, maxChars)}\n\n[truncated by reviewer]`;
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
    const taskPath = path.join(taskDir, filename);
    return { taskId, path: taskPath, content: readText(taskPath, 24_000) };
  } catch {
    return null;
  }
}

function stripAnsi(text) {
  return text.replace(/[\u001B\u009B][[\]()#;?]*(?:(?:(?:[a-zA-Z\d]*(?:;[-a-zA-Z\d\/#&.:=?%@~_]+)*)?\u0007)|(?:(?:\d{1,4}(?:;\d{0,4})*)?[\dA-PR-TZcf-nq-uy=><~]))/g, '');
}

const eventPath = process.env.GITHUB_EVENT_PATH;
if (!eventPath) fail('GITHUB_EVENT_PATH is missing.');
if (!process.env.OPENCODE_API_KEY?.trim()) fail('OPENCODE_API_KEY is missing.');

const event = JSON.parse(fs.readFileSync(eventPath, 'utf8'));
const pr = event.pull_request;
if (!pr) fail('This script must run from a pull_request event.');

const baseSha = pr.base?.sha;
const headSha = pr.head?.sha;
if (!baseSha || !headSha) fail('Pull request base/head SHA is missing.');

let diff;
try {
  diff = execFileSync('git', ['diff', '--no-ext-diff', '--unified=40', `${baseSha}...${headSha}`], {
    encoding: 'utf8',
    maxBuffer: 12 * 1024 * 1024,
  });
} catch (error) {
  fail(`Unable to build PR diff: ${error.message}`);
}

if (!diff.trim()) fail('The pull request diff is empty.');

const fullDiffLength = diff.length;
const diffWasTruncated = fullDiffLength > MAX_DIFF_CHARS;
if (diffWasTruncated) {
  diff = `${diff.slice(0, MAX_DIFF_CHARS)}\n\n[diff truncated: ${fullDiffLength} chars total]`;
}

let changedFiles = '';
try {
  changedFiles = execFileSync('git', ['diff', '--name-only', `${baseSha}...${headSha}`], {
    encoding: 'utf8',
  }).trim();
} catch {
  // Review can continue without the compact filename list because the diff remains available.
}

const task = findTaskContext(pr);
const contexts = [
  ['AGENTS.md', readText('AGENTS.md', 28_000)],
  ['Product brief', readText('docs/product/00-product-brief.md', 18_000)],
  ['Work ledger', readText('docs/workbench/00-work-ledger.md', 18_000)],
  task ? [`Task ${task.taskId} (${task.path})`, task.content] : null,
].filter((item) => item && item[1]);

const projectContext = contexts.map(([label, content]) => `### ${label}\n${content}`).join('\n\n');

const prompt = `You are an independent, read-only reviewer for a pull request in a prototype repository.
All required PR metadata, project contracts, and the diff are supplied below. You may read repository files if useful, but do not edit files or run shell commands.

Review for high-confidence, actionable defects only:
- correctness and regressions
- violated product or repository contracts
- broken user flows, state/data inconsistencies, and permission boundaries
- unsafe CI/workflow changes
- missing validation that could hide a real defect

Rules:
- Prioritize defects over style.
- Do not invent requirements absent from the supplied contracts or diff.
- Separate Observation, Inference, and Judgment for every finding.
- Use severity P0/P1/P2/P3 and normally report only actionable P0-P2 findings.
- Put incomplete evidence under Review gaps instead of turning uncertainty into a bug.
- CI/typecheck/build passing does not equal product acceptance.
- Never claim a task is PASS.
- This review is advisory and must not request merge/approval or modify repository state.
- Your final response MUST contain ${REVIEW_MARKER} exactly once.

Return Markdown using exactly these top-level headings:
${REVIEW_MARKER}
# Experimental OpenCode PR Review
## Verdict
Choose one: NO_BLOCKING_FINDINGS, CHANGES_NEEDED, or HUMAN_CHECK_NEEDED, followed by one short sentence.
## Findings
For every finding:
### [P1] Short title
- Observation:
- Inference:
- Judgment:
- Location:
- Suggested fix:
If there are no actionable findings, write: No high-confidence P0-P2 findings.
## Review gaps
List important things that could not be verified, or write: None identified.
## Local handoff
Write: Run \`npm run review:pull\` on the PR branch, then read \`.ai/reviews/latest.md\`.

Repository: ${process.env.GITHUB_REPOSITORY || 'unknown'}
PR: #${pr.number} ${pr.title}
Base: ${pr.base?.ref} (${baseSha})
Head: ${pr.head?.ref} (${headSha})
Author: ${pr.user?.login || 'unknown'}
Changed files:\n${changedFiles || '(unknown)'}
Diff truncated: ${diffWasTruncated ? 'yes' : 'no'}

PR body:\n${pr.body || '(none)'}

PROJECT CONTEXT\n${projectContext}

PULL REQUEST DIFF\n\`\`\`diff\n${diff}\n\`\`\``;

const model = process.env.OPENCODE_REVIEW_MODEL?.trim() || DEFAULT_MODEL;
const result = spawnSync(
  'opencode',
  ['run', '--model', model, '--format', 'default', '--dir', process.cwd(), prompt],
  {
    encoding: 'utf8',
    maxBuffer: 16 * 1024 * 1024,
    env: {
      ...process.env,
      OPENCODE_PERMISSION:
        process.env.OPENCODE_PERMISSION ||
        '{"edit":"deny","bash":"deny","task":"deny","webfetch":"deny","websearch":"deny"}',
    },
  },
);

if (result.error) fail(`Unable to start OpenCode: ${result.error.message}`);
if (result.status !== 0) {
  const details = stripAnsi(`${result.stderr || ''}\n${result.stdout || ''}`).trim();
  fail(`OpenCode exited with status ${result.status}. ${details.slice(-4000)}`);
}

const reviewBody = stripAnsi(result.stdout || '').trim();
if (!reviewBody) fail('OpenCode returned an empty response.');

const markerCount = reviewBody.split(REVIEW_MARKER).length - 1;
if (markerCount !== 1) fail(`OpenCode response must contain the review marker exactly once; got ${markerCount}.`);

const review = [
  `<!-- local-ai-review-metadata:v1 head=${headSha} model=${model} -->`,
  reviewBody,
  '',
].join('\n');

fs.writeFileSync('ai-review.md', review, 'utf8');
console.log(`[opencode-pr-review] Review generated for PR #${pr.number} with ${model}.`);

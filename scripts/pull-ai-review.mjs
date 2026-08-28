import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const REVIEW_MARKER = '<!-- local-ai-review:v1 -->';

function fail(message) {
  console.error(`[review:pull] ${message}`);
  process.exit(1);
}

function repoFromConfig() {
  try {
    const config = JSON.parse(fs.readFileSync('prototype.config.json', 'utf8'));
    const url = config?.repository?.url;
    if (!url) return null;
    const parsed = new URL(url);
    const parts = parsed.pathname.replace(/^\/|\.git$/g, '').split('/').filter(Boolean);
    return parts.length >= 2 ? `${parts[0]}/${parts[1]}` : null;
  } catch {
    return null;
  }
}

function tryGh(args) {
  try {
    return execFileSync('gh', args, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return '';
  }
}

async function main() {
  const repo = process.env.GITHUB_REPOSITORY || repoFromConfig();
  if (!repo) {
    fail('Cannot determine repository. Set GITHUB_REPOSITORY=owner/name or configure prototype.config.json.');
  }

  let prNumber = process.argv.slice(2).find((value) => /^\d+$/.test(value));
  if (!prNumber) {
    prNumber = tryGh(['pr', 'view', '--json', 'number', '--jq', '.number']);
  }
  if (!prNumber) {
    fail('Cannot determine the PR for the current branch. Run `npm run review:pull -- <PR_NUMBER>` or authenticate GitHub CLI.');
  }

  const token =
    process.env.GH_TOKEN ||
    process.env.GITHUB_TOKEN ||
    tryGh(['auth', 'token']);

  const headers = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const comments = [];
  for (let page = 1; page <= 10; page += 1) {
    const response = await fetch(
      `https://api.github.com/repos/${repo}/issues/${prNumber}/comments?per_page=100&page=${page}`,
      { headers },
    );
    if (!response.ok) {
      const body = await response.text();
      fail(`GitHub API ${response.status}: ${body.slice(0, 1200)}`);
    }

    const batch = await response.json();
    if (!Array.isArray(batch)) fail('GitHub returned an unexpected comments payload.');
    comments.push(...batch);
    if (batch.length < 100) break;
  }

  const candidates = comments
    .filter((comment) => typeof comment?.body === 'string' && comment.body.includes(REVIEW_MARKER))
    .sort((a, b) => new Date(a.updated_at || a.created_at) - new Date(b.updated_at || b.created_at));

  const botCandidate =
    candidates.filter((comment) => comment?.user?.login === 'github-actions[bot]').at(-1) ||
    candidates.at(-1);

  if (!botCandidate) {
    fail(`No experimental AI review comment found for ${repo}#${prNumber}.`);
  }

  const directory = '.ai/reviews';
  fs.mkdirSync(directory, { recursive: true });

  const sourceUrl =
    botCandidate.html_url ||
    `https://github.com/${repo}/pull/${prNumber}#issuecomment-${botCandidate.id}`;
  const content = [
    '<!-- local-ai-review-local-copy:v1 -->',
    `# Synced PR Review #${prNumber}`,
    '',
    `- Source: ${sourceUrl}`,
    `- Synced: ${new Date().toISOString()}`,
    '',
    botCandidate.body,
    '',
  ].join('\n');

  const prPath = `${directory}/pr-${prNumber}.md`;
  const latestPath = `${directory}/latest.md`;
  fs.writeFileSync(prPath, content, 'utf8');
  fs.writeFileSync(latestPath, content, 'utf8');

  console.log(`[review:pull] Synced PR #${prNumber}`);
  console.log(`[review:pull] ${prPath}`);
  console.log(`[review:pull] ${latestPath}`);
}

await main();

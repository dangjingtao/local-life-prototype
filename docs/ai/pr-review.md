# Experimental OpenCode PR Review

Status: `EXPERIMENTAL`

## Goal

When a pull request targets `dev`, run a lightweight independent review through OpenCode and hand the result back to both GitHub and local coding agents.

This is a review aid only. It does not approve the PR, merge code, move a work item to `PASS`, or replace browser/product validation.

## Trigger

Workflow: `.github/workflows/ai-pr-review.yml`

The workflow runs for non-draft, same-repository pull requests targeting `dev` on:

- opened
- synchronize (new commits pushed)
- reopened
- ready_for_review

Fork pull requests are intentionally skipped in the first version so repository secrets are never exposed to untrusted code.

## OpenCode configuration

Required repository secret:

- `OPENCODE_API_KEY`

Create the key from the OpenCode account / Zen authentication flow and store it only under GitHub repository Settings → Secrets and variables → Actions → Repository secrets.

The workflow uses the official `anomalyco/opencode/github` action and runs OpenCode in GitHub Actions. It does not call OpenRouter or another model gateway directly.

Default experiment model:

- `opencode/gpt-5.4-mini`

The model can be changed without editing the workflow by setting the repository Actions variable:

- `OPENCODE_REVIEW_MODEL`

The value must use OpenCode's `provider/model` format. If the variable is absent, the default above is used.

The OpenCode review job is intentionally read-only:

- GitHub token: repository contents read, pull requests read, issues write only for the PR conversation comment
- GitHub token has no `contents: write` or `pull-requests: write`, so the workflow cannot push code or submit an APPROVE / REQUEST_CHANGES review state
- OpenCode `edit`: denied
- OpenCode `bash`: denied
- OpenCode subagent/task: denied
- OpenCode web fetch/search: denied
- session sharing: disabled

The reviewer is instructed to read `AGENTS.md`, relevant product/workbench contracts, and the matching `T###` task card when the task id is visible in PR metadata.

## Review output contract

The final OpenCode response must contain:

`<!-- local-ai-review:v1 -->`

The review uses these verdicts:

- `NO_BLOCKING_FINDINGS`
- `CHANGES_NEEDED`
- `HUMAN_CHECK_NEEDED`

Findings separate Observation / Inference / Judgment and use P0-P3 severity. The experiment should normally surface only actionable P0-P2 findings.

These verdicts are advisory. They are deliberately not mapped to GitHub APPROVE / REQUEST_CHANGES in V1.

OpenCode owns the GitHub-side reply behavior in this version. The local handoff always consumes the newest PR conversation comment containing the marker, so repeated review runs do not require a second local protocol.

## Local agent handoff

From a local checkout on the PR branch, run:

```bash
npm run review:pull
```

The command uses GitHub CLI to infer the current branch PR when available. A PR number can be supplied explicitly:

```bash
npm run review:pull -- 123
```

It writes:

- `.ai/reviews/pr-123.md`
- `.ai/reviews/latest.md`

The local copy also records the current PR Head SHA, so a coding agent can reject stale review output before acting on it.

`.ai/reviews/` is gitignored. Local agents should read `.ai/reviews/latest.md`, verify each finding against the current code and project contracts, then decide whether to fix, reject, or escalate the finding.

For this public repository, reading PR comments can work without a token when the PR number is supplied. GitHub CLI authentication or `GH_TOKEN` / `GITHUB_TOKEN` is still preferred to avoid API rate limits and is required if the repository becomes private.

## Current boundaries

- No direct OpenRouter integration.
- No automatic merge.
- No automatic GitHub approval or change request.
- No automatic task `PASS`.
- No code modification by the reviewer workflow.
- No shell execution by the reviewer workflow.
- No secret exposure to fork PRs.
- No claim that CI success equals product acceptance.

The first acceptance test is one real feature/task PR into `dev`: workflow succeeds, an OpenCode review comment containing the marker appears, a subsequent PR update triggers another review, and `npm run review:pull` materializes the newest marked review locally.

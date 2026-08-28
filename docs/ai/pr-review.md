# Experimental OpenCode PR Review

Status: `EXPERIMENTAL`

## Goal

When a same-repository pull request targets `dev`, run a lightweight independent review through OpenCode and hand the result back to both GitHub and local coding agents.

This is a review aid only. It does not approve the PR, request changes through GitHub review state, merge code, move a work item to `PASS`, or replace browser/product validation.

## Trigger

Workflow: `.github/workflows/ai-pr-review.yml`

The workflow runs for non-draft, same-repository pull requests targeting `dev` on:

- opened
- synchronize (new commits pushed)
- reopened
- ready_for_review

Fork pull requests are intentionally skipped in V1 so repository secrets are never exposed to untrusted code.

## OpenCode configuration

Required repository secret:

- `OPENCODE_API_KEY`

Store it only under GitHub repository Settings → Secrets and variables → Actions → Repository secrets.

Default experiment model:

- `opencode/mimo-v2.5-free`

The model can be changed without editing the workflow by setting the repository Actions variable:

- `OPENCODE_REVIEW_MODEL`

The value uses OpenCode's `provider/model` format.

`opencode/gpt-5.4-mini` was exercised during the smoke test and reached the OpenCode API successfully, but the configured Zen workspace had insufficient balance. The experiment therefore defaults to a free OpenCode model until a paid review model is deliberately selected.

## Security boundary

The workflow deliberately separates model execution from GitHub publishing.

### `review` job

- checks out the PR head with persisted Git credentials disabled
- receives only `contents: read`
- loads the trusted reviewer script from the PR base branch (`dev`), not from the PR branch
- installs the OpenCode CLI and runs non-interactive `opencode run`
- gives OpenCode no GitHub write token
- denies OpenCode `edit`, `bash`, `task`, `webfetch`, and `websearch`
- produces `ai-review.md` and uploads it as a short-lived artifact

### `publish` job

- does not run OpenCode
- checks out the trusted base branch only for the local-handoff helper
- receives PR/issue write permission only to create or update the review conversation comment
- keeps one marked review comment current instead of appending a new comment on every synchronize event
- runs the same local handoff script after publishing and verifies that `.ai/reviews/latest.md` contains the current PR Head SHA and review marker

This separation keeps the model-side review read-only even though the publishing stage needs GitHub write permission.

## Review input and output contract

`scripts/opencode-pr-review.mjs` supplies OpenCode with:

- PR title/body/base/head metadata
- changed filenames and PR diff
- `AGENTS.md`
- Product Brief
- Work Ledger
- matching `T###` task card when the task id is visible in PR metadata

Large diffs are capped and must be treated as an explicit review gap.

The final review must contain exactly one:

`<!-- local-ai-review:v1 -->`

The review uses these advisory verdicts:

- `NO_BLOCKING_FINDINGS`
- `CHANGES_NEEDED`
- `HUMAN_CHECK_NEEDED`

Findings separate Observation / Inference / Judgment and use P0-P3 severity. The experiment should normally surface only actionable P0-P2 findings.

## Local agent handoff

From a local checkout on the PR branch, run:

```bash
npm run review:pull
```

If the current branch cannot be mapped automatically, pass the PR number:

```bash
npm run review:pull -- 123
```

It writes:

- `.ai/reviews/pr-123.md`
- `.ai/reviews/latest.md`

The local copy records repository, PR, base/head branch, current Head SHA, review source and full marked review. `.ai/reviews/` is gitignored.

Local agents should read `.ai/reviews/latest.md`, reject stale output whose Head SHA does not match the current PR, then verify every finding against current code and project contracts before fixing, rejecting, or escalating it.

The GitHub Actions `publish` job runs this same handoff script after every successful review and validates the Head SHA + marker, so local-agent consumability is continuously smoke-tested rather than documented only on paper.

## Current boundaries

- No direct OpenRouter integration.
- No automatic merge.
- No automatic GitHub approval or change request.
- No automatic task `PASS`.
- No model-side code modification or shell execution.
- No secret exposure to fork PRs.
- No claim that CI success equals product acceptance.

## Smoke-test evidence

PR #1 (`test: T014 OpenCode PR review smoke`) exercised the real `pull_request -> dev` path.

Validated behavior:

- `OPENCODE_API_KEY` was present and accepted by OpenCode.
- OpenCode generated a review with `opencode/mimo-v2.5-free`.
- the review and publisher jobs succeeded independently.
- repeated synchronize events updated the existing marked PR comment rather than creating a comment stream.
- review metadata tracked the current PR Head SHA.
- the publisher successfully ran `scripts/pull-ai-review.mjs` and verified `.ai/reviews/latest.md` against the current Head SHA and marker.
- normal `Verify Prototype` continued to run successfully alongside the review workflow.

This moves T014 to `REVIEW`; the experimental reviewer still cannot mark itself `PASS`.

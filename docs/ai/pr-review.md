# Experimental PR AI Review

Status: `EXPERIMENTAL`

## Goal

When a pull request targets `dev`, run a lightweight independent AI review and hand the result back to both GitHub and local coding agents.

This is a review aid only. It does not approve the PR, merge code, move a work item to `PASS`, or replace browser/product validation.

## Trigger

Workflow: `.github/workflows/ai-pr-review.yml`

The workflow runs for non-draft, same-repository pull requests targeting `dev` on:

- opened
- synchronize (new commits pushed)
- reopened
- ready_for_review

Fork pull requests are intentionally skipped in the first version so repository secrets are never exposed to untrusted code.

## Model configuration

Required repository secret:

- `OPENROUTER_API_KEY`

Current experiment model:

- `openai/gpt-5-mini`

The model name is configured in `.github/workflows/ai-pr-review.yml` as `AI_REVIEW_MODEL`, so changing the experiment model does not require rewriting the review protocol.

The reviewer reads:

- PR title/body/base/head metadata
- changed filenames and diff
- `AGENTS.md`
- Product Brief
- Work Ledger
- the matching `T###` task card when the task id is visible in PR title/body/branch name

Large diffs are capped before sending to the model. A truncated review must call out the verification gap.

## Review output contract

The workflow maintains one PR conversation comment identified by:

`<!-- local-ai-review:v1 -->`

When new commits are pushed, the same comment is updated instead of adding another review comment.

The model is asked to return:

- `NO_BLOCKING_FINDINGS`
- `CHANGES_NEEDED`
- `HUMAN_CHECK_NEEDED`

Findings separate Observation / Inference / Judgment and use P0-P3 severity. The experiment should normally surface only actionable P0-P2 findings.

These verdicts are advisory. They are deliberately not mapped to GitHub APPROVE / REQUEST_CHANGES in V1.

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

`.ai/reviews/` is gitignored. Local agents should read `.ai/reviews/latest.md`, verify each finding against the current code and project contracts, then decide whether to fix, reject, or escalate the finding.

For this public repository, reading PR comments can work without a token when the PR number is supplied. GitHub CLI authentication or `GH_TOKEN` / `GITHUB_TOKEN` is still preferred to avoid API rate limits and is required if the repository becomes private.

## Current boundaries

- No automatic merge.
- No automatic GitHub approval or change request.
- No automatic task `PASS`.
- No code modification by the reviewer workflow.
- No secret exposure to fork PRs.
- No claim that CI success equals product acceptance.

The first acceptance test is one real feature/task PR into `dev`: workflow succeeds, one review comment appears, a second push updates that same comment, and `npm run review:pull` materializes it locally.

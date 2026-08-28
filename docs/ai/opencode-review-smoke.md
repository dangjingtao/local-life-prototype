# OpenCode PR Review Smoke Fixture

This file exists only to trigger the T014 experimental OpenCode PR review workflow.

Expected behavior:

- PR targets `dev`.
- `Experimental OpenCode PR Review` runs.
- The OpenCode review result includes `<!-- local-ai-review:v1 -->`.
- The PR is not merged and no task is marked PASS from the review alone.
- A synchronize event after the workflow fix triggers the isolated review/publish pipeline.
- The free OpenCode model completes the end-to-end smoke test without Zen balance.

Delete or ignore this branch after the smoke test.

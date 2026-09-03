# T034 — CodeRabbit PR AI Review 迁移

- Status: `REVIEW`
- Type: CI / Review / AI Collaboration
- Target version: `0.2.0`
- Base branch: `dev`

## 背景与目标

用户于 2026-09-03 明确要求将当前 PR AI Review 从自建 OpenCode + DeepSeek GitHub Actions 方案切换为 CodeRabbit。

目标是减少项目自维护 reviewer 的模型 Key、CLI、publisher 与本地 handoff 复杂度，同时保留“PR 自动独立评审、增量复审、施工方必须复核 finding、AI Review 不替代产品验收”的治理原则。

## 范围

- 在仓库根目录增加 `.coderabbit.yaml`，版本化管理 CodeRabbit Review 配置。
- 自动 review 非 draft PR，并在新 commit push 后执行增量 review。
- CodeRabbit Review 使用中文、`chill` profile，优先高置信 P0-P2 可执行问题，避免无关风格挑刺。
- 让 reviewer 优先遵循 `AGENTS.md`、匹配的 `T###` 任务卡、Product Brief / PRD / Work Ledger。
- 保持 `request_changes_workflow: false`：不允许 CodeRabbit 自动 APPROVE / REQUEST_CHANGES 形成项目验收事实。
- 退役 `.github/workflows/ai-pr-review.yml`、`scripts/opencode-pr-review.mjs`、`scripts/pull-ai-review.mjs` 与 `npm run review:pull`。
- 更新 `AGENTS.md`、`docs/ai/pr-review.md`、`docs/ai/skills.md` 的当前 review 合同。
- 保留 T014 及历史任务卡中的 OpenCode 证据，不篡改历史。

## 非范围

- 不改变 Verify Prototype、Browser Quality、部署等既有 CI。
- 不自动 merge。
- 不根据 CodeRabbit 结论自动把任务改成 `PASS`。
- 不把 CodeRabbit 当真实浏览器 / UX / 产品验收替代品。
- 不清洗历史 PR 中已经存在的 OpenCode review 评论与证据。

## 验收标准

1. 根目录存在有效 `.coderabbit.yaml`，自动 review 开启、draft review 关闭、incremental review 开启。
2. `request_changes_workflow` 保持关闭，AI review 不能自动制造项目 PASS / merge 结论。
3. 旧 OpenCode GitHub Actions reviewer 不再运行。
4. 仓库不再依赖 `OPENCODE_API_KEY` / `OPENCODE_REVIEW_MODEL` 才能进行 PR AI Review。
5. 本地 Agent 不再依赖 `.ai/reviews/latest.md`；处理 review 时直接读取当前 PR 的 CodeRabbit review threads / comments，并回到代码与项目合同复核。
6. 既有 Verify / Browser / deploy workflow 不受迁移影响。
7. CodeRabbit GitHub App 对 `dangjingtao/local-life-prototype` 获得访问权限后，一个真实非 draft PR -> `dev` 能产生 CodeRabbit review；push 新 commit 后能产生增量复审。

## 当前施工结果

仓库侧迁移已完成并进入 `REVIEW`：

- 已增加 `.coderabbit.yaml`。
- 已准备退役旧 OpenCode workflow / scripts / npm handoff。
- 已更新当前 AI Review 协作合同。
- T014 作为 OpenCode 实验历史保留，但不再作为当前 reviewer。

外部依赖：CodeRabbit 是 GitHub App。仅提交 `.coderabbit.yaml` 不会自行安装 App；需要仓库所有者在 CodeRabbit / GitHub 安装流程中授权 `dangjingtao/local-life-prototype`。真实 smoke review 以安装后的首个 PR 结果为最终激活证据。

## Review

- Reviewer: pending CodeRabbit GitHub App activation + first real PR smoke
- Result: `REVIEW`
- Conclusion: repository-side migration is ready; service activation still requires CodeRabbit GitHub App access to this repository.

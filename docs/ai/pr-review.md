# CodeRabbit PR Review

Status: `ACTIVE_AFTER_APP_INSTALL`

## Goal

对目标为 `dev` 的非 draft PR 使用 CodeRabbit 做独立 AI Review，并在新 commit push 后进行增量复审。

AI Review 只作为独立评审证据。它不替代 Verify / Browser Quality / 真实浏览器检查 / 产品验收，也不能单独把任务推进到 `PASS` 或触发 merge。

## Current implementation

仓库根目录：

- `.coderabbit.yaml`

CodeRabbit 通过 GitHub App 工作，不再由本仓库 GitHub Actions 自行安装模型 CLI、读取模型 Key 或发布 review comment。

因此旧的以下链路已退役：

- `.github/workflows/ai-pr-review.yml`
- `scripts/opencode-pr-review.mjs`
- `scripts/pull-ai-review.mjs`
- `npm run review:pull`
- `OPENCODE_API_KEY`
- `OPENCODE_REVIEW_MODEL`

T014 及历史 PR 中的 OpenCode review 证据继续作为历史记录保留，不回写、不抹除。

## CodeRabbit configuration

`.coderabbit.yaml` 当前约束：

- Review language: `zh-CN`
- Profile: `chill`
- Automatic review: enabled
- Draft PR review: disabled
- Incremental review after new commits: enabled
- `request_changes_workflow`: disabled
- Review output优先高置信、可复现、可执行的 P0-P2 问题
- 避免把纯风格偏好或低置信猜测伪装成阻塞 finding
- 先读取并遵守 `AGENTS.md`
- PR 含 `T###` 时，读取对应任务卡并以 Product Brief / PRD / Work Ledger 为合同上下文
- CI 通过不等于产品验收通过
- 不建议引入当前原型范围之外的生产级基础设施

CodeRabbit 官方会把 `AGENTS.md` 识别为 coding guideline 文档，因此当前项目不需要再维护一套重复的 reviewer prompt。

## Activation dependency

`.coderabbit.yaml` 只负责仓库内配置，不能自行安装第三方 GitHub App。

要真正启用 review，仓库所有者必须让 CodeRabbit GitHub App 获得 `dangjingtao/local-life-prototype` 的访问权限。

激活后的 smoke 标准：

1. 一个真实、非 draft PR 目标为 `dev`。
2. CodeRabbit 自动产生 review / walkthrough。
3. push 新 commit 后产生增量复审。
4. 既有 Verify / Browser / deploy workflow 正常运行。
5. CodeRabbit 不自动制造项目 `PASS` / merge 结论。

## Agent handling rules

当用户要求“检查 AI review / 修 review / 继续处理 PR”时：

1. 直接读取当前 PR 最新的 CodeRabbit review threads / comments；不再运行本地 `review:pull`。
2. 确认 review 对应当前 PR latest head；旧 commit 上已经失效的 finding 不继续机械返工。
3. 对每条 finding 回到当前代码、`AGENTS.md`、任务卡与产品真相源复核。
4. 明确区分 Observation / Inference / Judgment；模型意见不是事实本身。
5. 高置信缺陷才进入修复；证据不足、与当前合同冲突或纯偏好项应明确拒绝或交人工判断。
6. 修复后 push，等待 CodeRabbit 对新 head 做增量复审。
7. AI Review 不能单独触发 GitHub APPROVE / REQUEST_CHANGES、任务 `PASS` 或自动 merge。

## Historical migration

2026-09-03，用户明确要求将 PR AI Review 从自建 OpenCode + DeepSeek GitHub Actions 方案切换为 CodeRabbit。

迁移任务：`T034`。

旧方案任务：`T014`，保留其 smoke test 与历史证据，但不再作为当前 reviewer。

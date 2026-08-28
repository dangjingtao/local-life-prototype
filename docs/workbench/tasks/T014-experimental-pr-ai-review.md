# T014 — 实验性 PR AI Review

- Status: `BLOCKED`
- Type: CI / Review / AI Collaboration
- Target version: `0.1.0`
- Base branch: `dev`

## 背景与目标

为当前原型项目建立一条最小可用的 PR AI Review 链路：同仓库 feature/task/fix 等短分支向 `dev` 创建 PR 后自动触发独立 AI review，并把结果同时暴露给 GitHub 上的人和本地施工 Agent。

该能力处于试验阶段，目标是验证 review 是否真的有助于发现回归和合同问题，而不是直接建立强制门禁。

## 范围

- `pull_request -> dev` 自动触发 review。
- PR 新增 commit 时自动重跑。
- 使用 OpenRouter 调用实验模型。
- Review 读取 PR diff、`AGENTS.md`、Product Brief、Work Ledger，并尽量关联 `T###` 任务卡。
- Review 结果维护为单个 PR conversation comment。
- 本地提供 `npm run review:pull`，把最新 review 同步到 `.ai/reviews/latest.md`。
- `AGENTS.md` 明确本地 Agent 如何消费和复核 review。

## 非范围

- 不自动 GitHub `APPROVE`。
- 不自动 `REQUEST_CHANGES`。
- 不自动 merge。
- 不自动修改业务代码。
- 不根据 AI review 自动把任务改成 `PASS`。
- V1 不处理 fork PR 的 secret 注入。

## 验收标准

1. Repository secret `OPENROUTER_API_KEY` 已配置。
2. 一个同仓库 PR 目标为 `dev`，在 opened / synchronize / reopened / ready_for_review 时触发 `Experimental AI PR Review`。
3. Workflow 成功后 PR 出现且只维护一条带 `<!-- local-ai-review:v1 -->` marker 的 review 评论。
4. PR push 新 commit 后，原 review 评论被更新，而不是新增一串评论。
5. 本地 PR 分支执行 `npm run review:pull` 后生成 `.ai/reviews/pr-<n>.md` 与 `.ai/reviews/latest.md`。
6. 本地 Agent 能依据 `AGENTS.md` 读取该文件，并对 finding 逐条回查代码，不把模型结论直接当事实。
7. Review 不触发自动 merge / PASS / GitHub approval。

## 风险 / 依赖

- 依赖 repository secret `OPENROUTER_API_KEY`；未配置前 workflow 会明确失败。
- Fork PR 默认跳过，避免把 secret 暴露给不可信代码。
- 大 diff 会截断 review 输入，因此不能把 AI review 当完整代码审计。
- 模型可能误报 / 漏报；输出要求分离 Observation / Inference / Judgment，并保持非阻塞。
- GitHub API / OpenRouter 短暂故障会导致 review workflow 失败，但不应影响现有 Verify Prototype。

## 当前施工结果

已落地：

- `.github/workflows/ai-pr-review.yml`
- `scripts/ai-pr-review.mjs`
- `scripts/pull-ai-review.mjs`
- `docs/ai/pr-review.md`
- `AGENTS.md` 本地 review 收件箱规则
- `package.json` → `npm run review:pull`
- `.gitignore` → `.ai/reviews/`
- `docs/ai/skills.md` → 实验性 PR Review 权限边界

关键提交：

- `1c63f1e` workflow
- `3559509` review runner
- `adec3c6` local review inbox
- `55c0a30` local command
- `ea45095` review protocol docs
- `ed53120` AGENTS handoff
- `b76159b` AI skill scope

## 验证方式

当前已完成静态脚本语法检查和仓库文件落地核对。

待 `OPENROUTER_API_KEY` 配置后，用首个真实 PR 完成 smoke test，满足全部验收标准后再从 `BLOCKED` 推进到 `REVIEW`。AI review 本身不能把 T014 自动推进为 `PASS`。

## Review 结论

待首个真实 PR smoke test。

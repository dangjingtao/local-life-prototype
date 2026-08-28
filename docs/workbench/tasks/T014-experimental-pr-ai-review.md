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
- 使用 OpenCode 官方 GitHub Action 执行 review，不直接调用 OpenRouter 或其他模型网关。
- OpenCode 读取 PR 上下文、`AGENTS.md`、项目合同与相关任务卡进行独立评审。
- Review 结果回写到 PR conversation，并携带 `<!-- local-ai-review:v1 -->` marker。
- 本地提供 `npm run review:pull`，把最新带 marker 的 review 同步到 `.ai/reviews/latest.md`。
- `AGENTS.md` 明确本地 Agent 如何消费和复核 review。

## 非范围

- 不自动 GitHub `APPROVE`。
- 不自动 `REQUEST_CHANGES`。
- 不自动 merge。
- 不自动修改业务代码。
- 不根据 AI review 自动把任务改成 `PASS`。
- V1 不处理 fork PR 的 secret 注入。
- V1 不要求 review Agent 执行 shell、修改文件或启动子 Agent。

## 验收标准

1. Repository secret `OPENCODE_API_KEY` 已配置。
2. 一个同仓库 PR 目标为 `dev`，在 opened / synchronize / reopened / ready_for_review 时触发 `Experimental OpenCode PR Review`。
3. Workflow 成功后 PR 出现包含 `<!-- local-ai-review:v1 -->` marker 的 OpenCode review 评论。
4. PR push 新 commit 后再次触发 review，并能识别最新 head 的问题。
5. 本地 PR 分支执行 `npm run review:pull` 后生成 `.ai/reviews/pr-<n>.md` 与 `.ai/reviews/latest.md`。
6. 本地 Agent 能依据 `AGENTS.md` 读取该文件，并对 finding 逐条回查代码，不把模型结论直接当事实。
7. Review 不触发自动 merge / PASS / GitHub approval。
8. Review Agent 无 edit / bash / task / web 权限，且 session share 关闭。

## 风险 / 依赖

- 依赖 repository secret `OPENCODE_API_KEY`；未配置前 workflow 会明确失败。
- 默认模型为 `opencode/gpt-5.4-mini`；可通过 repository Actions variable `OPENCODE_REVIEW_MODEL` 更换。
- Fork PR 默认跳过，避免把 secret 暴露给不可信代码。
- OpenCode / GitHub Action 版本升级可能改变评论形态，因此本地收件箱只依赖稳定 marker，不绑定具体 bot 用户名。
- 模型可能误报 / 漏报；输出要求分离 Observation / Inference / Judgment，并保持非阻塞。
- GitHub / OpenCode 短暂故障会导致 review workflow 失败，但不应影响现有 Verify Prototype。

## 当前施工结果

已落地：

- `.github/workflows/ai-pr-review.yml` → OpenCode 官方 GitHub Action
- `scripts/pull-ai-review.mjs`
- `docs/ai/pr-review.md`
- `AGENTS.md` 本地 review 收件箱规则
- `package.json` → `npm run review:pull`
- `.gitignore` → `.ai/reviews/`
- `docs/ai/skills.md` → 实验性 PR Review 权限边界

已移除：

- 直接 OpenRouter HTTP 调用
- `scripts/ai-pr-review.mjs`
- `OPENROUTER_API_KEY` 依赖

关键调整提交：

- `b4b2c3e` workflow 改为 OpenCode
- `f833093` 删除 direct OpenRouter runner
- `2a5329a` 更新 review 协议

## 验证方式

当前已完成 workflow / 协议落地核对。

待 `OPENCODE_API_KEY` 配置后，用首个真实 PR 完成 smoke test，满足全部验收标准后再从 `BLOCKED` 推进到 `REVIEW`。AI review 本身不能把 T014 自动推进为 `PASS`。

## Review 结论

待首个真实 PR smoke test。

# T014 — 实验性 PR AI Review

- Status: `REVIEW`
- Type: CI / Review / AI Collaboration
- Target version: `0.1.0`
- Base branch: `dev`

## 背景与目标

为当前原型项目建立一条最小可用的 PR AI Review 链路：同仓库 feature/task/fix 等短分支向 `dev` 创建 PR 后自动触发独立 AI review，并把结果同时暴露给 GitHub 上的人和本地施工 Agent。

该能力处于试验阶段，目标是验证 review 是否真的有助于发现回归和合同问题，而不是直接建立强制门禁。

## 范围

- `pull_request -> dev` 自动触发 review。
- PR 新增 commit 时自动重跑。
- 使用 OpenCode CLI 在 GitHub Actions 中执行独立 review，不直接调用 OpenRouter 或其他模型网关。
- Review 读取 PR diff、`AGENTS.md`、Product Brief、Work Ledger 与匹配的 `T###` 任务卡。
- Review 结果回写到 PR conversation，并携带 `<!-- local-ai-review:v1 -->` marker 与当前 Head SHA metadata。
- 同一 PR 后续 synchronize 更新原 marked comment，不制造评论流。
- 本地提供 `npm run review:pull`，把最新带 marker 的 review 同步到 `.ai/reviews/latest.md`。
- publisher 每轮运行同一 handoff 脚本并校验 `.ai/reviews/latest.md` 的 Head SHA + marker。
- `AGENTS.md` 明确本地 Agent 如何消费和复核 review。

## 非范围

- 不自动 GitHub `APPROVE`。
- 不自动 `REQUEST_CHANGES`。
- 不自动 merge。
- 不自动修改业务代码。
- 不根据 AI review 自动把任务改成 `PASS`。
- V1 不处理 fork PR 的 secret 注入。
- V1 不允许 review Agent 执行 shell、修改文件、启动子 Agent或访问 web。

## 验收标准

1. Repository secret `OPENCODE_API_KEY` 已配置并能真实通过 OpenCode 鉴权。
2. 一个同仓库 PR 目标为 `dev`，在 opened / synchronize / reopened / ready_for_review 时触发 `Experimental OpenCode PR Review`。
3. Workflow 成功后 PR 出现包含 `<!-- local-ai-review:v1 -->` marker 的 review 评论。
4. PR push 新 commit 后再次触发 review，并更新同一 marked comment；metadata Head SHA 更新为当前 PR head。
5. `npm run review:pull` 能生成 `.ai/reviews/pr-<n>.md` 与 `.ai/reviews/latest.md`。
6. CI publisher 使用同一 `pull-ai-review.mjs` 自检本地 handoff，并验证当前 Head SHA + marker。
7. 本地 Agent 能依据 `AGENTS.md` 读取该文件，并对 finding 逐条回查代码，不把模型结论直接当事实。
8. Review 不触发自动 merge / PASS / GitHub approval / REQUEST_CHANGES。
9. OpenCode review job 只有 `contents: read`，不持有 GitHub 写权限；OpenCode `edit` / `bash` / `task` / `webfetch` / `websearch` 均 denied。
10. 既有 `Verify Prototype` 继续与 review workflow 并行工作，不因 review 引入回归。

## 风险 / 依赖

- 依赖 repository secret `OPENCODE_API_KEY`。
- 默认实验模型为 `opencode/mimo-v2.5-free`；可通过 repository Actions variable `OPENCODE_REVIEW_MODEL` 更换。
- `opencode/gpt-5.4-mini` 已验证能到达真实 OpenCode 模型调用，但当前 Zen workspace 余额不足，因此不是实验默认模型。
- Fork PR 默认跳过，避免 secret 暴露给不可信代码。
- 大 diff 会截断模型输入，因此不能把实验 review 当完整代码审计。
- 模型可能误报 / 漏报；输出要求分离 Observation / Inference / Judgment，并保持非阻塞。
- GitHub / OpenCode 短暂故障会导致 review workflow 失败，但不应影响现有 Verify Prototype。

## 当前施工结果

已落地：

- `.github/workflows/ai-pr-review.yml`
  - `review`：只读 OpenCode CLI review
  - `publish`：独立 GitHub comment publisher + local handoff self-check
- `scripts/opencode-pr-review.mjs`
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

## Smoke test 证据

真实测试 PR：#1 `test: T014 OpenCode PR review smoke`，目标 `dev`。

关键过程：

- run #1 `33138730089`：成功验证 PR trigger 与 `OPENCODE_API_KEY` 存在；暴露 OpenCode 官方 GitHub Action 会因当前 token 回写 reaction/comment 触发 403，因此没有把扩大模型 job 写权限作为修复。
- run #2 `33138873705`：拆分 read-only review / publisher 后成功进入真实 OpenCode 模型调用；`opencode/gpt-5.4-mini` 返回 Zen `Insufficient balance`，证明 Key/鉴权链路正常，失败原因是余额。
- run #3 `33138945438`：默认切到 `opencode/mimo-v2.5-free`，read-only review 与 publisher 均 success；PR 出现 marked review comment。
- run #4 `33139017390`：再次 synchronize 后 workflow success；原 review comment id `5448033638` 被更新而不是新增，metadata Head SHA 更新到 `19aabf62...`。
- run #5 `33139159277`：read-only review success；publisher success；`Validate local agent handoff` success，真实运行 `scripts/pull-ai-review.mjs` 并校验 `.ai/reviews/latest.md` 的当前 Head SHA `4b9c15f2...` 与 marker。
- 同轮普通 `Verify Prototype` 继续触发，证明 review workflow 没有替代原有验证链路。

## Review 结论

施工与 smoke test 已满足进入独立评审的条件，状态从 `BLOCKED` 推进到 `REVIEW`。

仍保持实验边界：OpenCode review 的 `NO_BLOCKING_FINDINGS` 不能把 T014 自动推进为 `PASS`；是否正式接受这套基础版由用户 / 独立评审决定。

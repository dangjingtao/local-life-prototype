# T011 · PC 数据驾驶舱

- Status: REVIEW
- Target version: 0.1.0
- Impact: PC / Shared
- Owner: Mira

## Background

驾驶舱用于表达私域超级中台的数据沉淀价值，不应把模拟指标描述成真实实时数据。

## Goal

完成全局经营总览、用户会员、合作规模、区域覆盖、场景对比和交易/核销指标视图。

## Product facts

- 核心指标包括用户、合作商、门店、区域、交易行为和交易额。
- 三个业务场景需要分别展示经营数据。
- 指标定义、统计周期和数据权限仍待确认。

## Scope

- FR-701 至 FR-706。
- 指标卡、趋势、区域覆盖、场景对比、会员/积分/券核销概念。
- 模拟数据、统计周期和待确认口径的显式标识。

## Out of scope

- 真实数据仓库、实时计算、钻取查询、导出与预测模型。

## Acceptance

- [x] AC-007 所列指标均有可理解的展示。
- [x] 三大场景可比较且模拟数值口径不冲突。
- [x] 页面明确标注模拟数据、周期和待确认口径。
- [ ] 1440px 与 1024px 完成视觉检查。
- [x] `npm run build:pc` 通过（PR 首轮 Verify #74；返工后当前 Head 需再次通过 Verify）。

## Risks / Dependencies

- 前置：T002、T008。
- 风险：缺少最终指标口径，图表仅能验证信息结构。
- 技术债：当前 `Service` 领域只包含 detection / experience / care_package，均属于现有智慧抗衰服务语义，因此服务核销按 care 展示在当前 fixtures 下成立；若未来加入非抗衰服务，必须为 Service / Redemption 增加显式 scene，不能继续依赖该语义归类。

## Implementation record

- Commit / PR: PR #3 `feat: T011 PC data dashboard`; work branch `task/T011-pc-data-dashboard`
- Changed paths: `apps/pc/src/ManagementDashboard.tsx`; `apps/pc/src/main.tsx`; `apps/pc/src/App.tsx`; `docs/workbench/tasks/T011-pc-data-dashboard.md`; `docs/workbench/00-work-ledger.md`
- Notes: 管理层从 T008 占位驾驶舱拆出独立只读页面；可从共享 fixtures 推导的指标直接汇总，无法可靠推导的“新增用户”明确显示待确认，不伪造增长数据。首轮独立 Review 暴露店主壳角色切换仍可进入旧 DashboardShell，返工后 App 只负责店主，运营 / 管理层切换统一通过 URL 进入各自独立控制台，并删除旧管理层占位路径。

## Verification evidence

- CI: PR 首轮 `Verify Prototype #74`（run `33142887282`）success；版本合同、全仓 typecheck、全仓 build 均通过。返工 push 后等待当前 Head 的新一轮 Verify。
- AI Review: 首轮 `Experimental OpenCode PR Review #8`（run `33142887276`）success，Head `d2e639f3fb45fd4ee9110c458e7a0e25a7b35a98`，verdict `CHANGES_NEEDED`；高置信 P2 为店主端角色切换仍渲染旧 T011 placeholder。另有 Codex P2 指出任务卡 DOING 与总台账 TODO 不一致。两项均判定成立并返工。
- Page / Route: `?role=management`; `?role=management&view=permission`；从 `?role=merchant` 切换平台运营 / 平台管理层会进入对应独立控制台。
- Screenshot / Browser result: 当前执行环境尚未形成 1440px / 1024px 浏览器视觉证据，留待 Review 补证。
- Other evidence: 样本趋势只按现有订单 `createdAt` 聚合；区域覆盖只使用合作商 `region` 字段，不伪造地图坐标；会员、积分、券与核销均直接消费 `@prototype/shared`。

## Review

- Reviewer: Tomz
- Result: REVIEW
- Conclusion: 首轮 AI Review 判定返工；高置信角色切换 P2 与台账状态 P2 已处理。等待返工 Head 的最新 marked review 与 Verify，若无新的阻塞 finding 则可合入 `dev`；1440px / 1024px 视觉复核仍阻止任务自动提升为 PASS。
- Follow-up: 只接受 metadata Head SHA 与当前 PR Head 一致的 `local-ai-review:v1` comment；旧 review 作为历史证据保留。
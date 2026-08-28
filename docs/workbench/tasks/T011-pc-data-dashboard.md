# T011 · PC 数据驾驶舱

- Status: DOING
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

- [ ] AC-007 所列指标均有可理解的展示。
- [ ] 三大场景可比较且模拟数值口径不冲突。
- [ ] 页面明确标注模拟数据、周期和待确认口径。
- [ ] 1440px 与 1024px 完成视觉检查。
- [ ] `npm run build:pc` 通过。

## Risks / Dependencies

- 前置：T002、T008。
- 风险：缺少最终指标口径，图表仅能验证信息结构。

## Implementation record

- Commit / PR: work branch `task/T011-pc-data-dashboard`; PR pending
- Changed paths: `apps/pc/src/ManagementDashboard.tsx`; `apps/pc/src/main.tsx`
- Notes: 管理层从 T008 占位驾驶舱拆出独立只读页面；可从共享 fixtures 推导的指标直接汇总，无法可靠推导的“新增用户”明确显示待确认，不伪造增长数据。

## Verification evidence

- CI: pending PR verify
- Page / Route: `?role=management`; `?role=management&view=permission`
- Screenshot / Browser result: pending 1440px / 1024px review
- Other evidence: 样本趋势只按现有订单 `createdAt` 聚合；区域覆盖只使用合作商 `region` 字段，不伪造地图坐标。

## Review

- Reviewer: Tomz
- Result: REVIEW / PASS / BLOCKED
- Conclusion: 等待 PR 独立 AI review、CI 与视觉复核。
- Follow-up: 根据最新带 `local-ai-review:v1` marker 的 review comment 回查后决定返工或合并。
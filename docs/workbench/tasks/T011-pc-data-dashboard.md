# T011 · PC 数据驾驶舱

- Status: TODO
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

- Commit / PR:
- Changed paths:
- Notes:

## Verification evidence

- CI:
- Page / Route:
- Screenshot / Browser result:
- Other evidence:

## Review

- Reviewer: Tomz
- Result: REVIEW / PASS / BLOCKED
- Conclusion:
- Follow-up:

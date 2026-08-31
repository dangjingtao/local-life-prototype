# T025 · PC V0.2 数据驾驶舱升级

- Status: TODO
- Target version: 0.2.0
- Impact: PC / Shared
- Owner: -

## Background

V0.1 已有数据驾驶舱。V0.2 新增便利店自提 / 短配、商城渠道和智慧抗衰预约 / 核销 / 报告转化，需要在既有驾驶舱上补充新的经营视角，而不是重做一套纯展示大屏。

## Goal

升级既有 PC 数据驾驶舱，使 V0.2 三大业务域的新状态和经营结果可被汇总查看，并达到中高保真的数据产品完成度。

## Product facts

- V0.2 仍使用模拟数据，不要求真实指标平台。
- 驾驶舱需要区分便利店自提、便利店短配、商城订单、智慧抗衰预约 / 核销 / 完成和检测后转化概念。
- 指标正式统计口径仍未确认。

## Scope

- 在 V0.1 驾驶舱上增量补充 V0.2 指标和场景对比。
- 便利店：自提订单、短配订单、完成状态。
- 商城：订单、来源渠道 / Storefront 概念。
- 智慧抗衰：预约量、核销量 / 完成量、报告后套餐 / 权益转化概念。
- 提升指标层级、趋势 / 对比和图表完成度，保持成熟数据产品感。
- 使用 T015 及后续各域共享 fixtures，避免驾驶舱数字与业务页完全脱节。

## Out of scope

- 真实 BI、实时数据、正式指标口径、复杂钻取分析。
- 重做 V0.1 全部驾驶舱信息架构。

## Acceptance

- [ ] 驾驶舱能明确区分三大业务域及 V0.2 新增履约 / 预约状态。
- [ ] 至少有便利店自提 vs 短配、商城渠道、智慧抗衰预约 / 核销 / 转化的可读表达。
- [ ] 图表与指标使用逻辑一致的模拟数据，不出现明显自相矛盾。
- [ ] 1024px / 1440px 浏览器验证无明显溢出，并达到中高保真数据产品观感。
- [ ] `npm run typecheck`、`npm run build` 通过。

## Risks / Dependencies

- 前置：T015、T022、T023、T024。
- 所有统计数字均为原型 mock，不得包装为正式经营口径。

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

- Reviewer:
- Result: REVIEW / PASS / BLOCKED
- Conclusion:
- Follow-up:

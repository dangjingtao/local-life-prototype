# T010 · PC 平台运营中台

- Status: TODO
- Target version: 0.1.0
- Impact: PC / Shared
- Owner: Mira

## Background

平台运营需要从统一中台理解用户、合作商、门店、商品/服务、订单/核销和会员营销之间的关系。

## Goal

完成运营总览及六类核心管理模块的可浏览结构，并支持按三大业务场景区分数据。

## Product facts

- 用户详情需关联来源、会员、订单、积分和报告。
- 订单及经营数据需区分线下门店、线上商城和智慧抗衰。
- V0.1 只表现管理结构，不实现生产配置与数据写入。

## Scope

- FR-601 至 FR-606。
- 用户、合作商/门店、商品/服务、订单/核销、会员营销管理。
- 列表、详情和筛选的概念交互。

## Out of scope

- 真实增删改、批处理、审批、审计日志与外部接口。

## Acceptance

- [ ] 六类核心模块均有清晰入口和代表性详情。
- [ ] 用户 LL-8888 的跨场景数据关联可查看。
- [ ] 订单与经营数据可按三大场景区分。
- [ ] 1440px 与 1024px 完成视觉检查。
- [ ] `npm run build:pc` 通过。

## Risks / Dependencies

- 前置：T002、T008。
- 风险：管理操作若无概念边界，容易被误解为已实现。

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

# T005 · Mobile 线上商城一件代发闭环

- Status: DOING
- Target version: 0.1.0
- Impact: Mobile / Shared
- Owner: Mira

## Background

线上商城需要表达自有私域商城与外部电商候选关系，同时具备完整的一件代发演示流程。

## Goal

完成商城浏览、商品详情、购物车、结算、配送选择及订单详情的连续动线。

## Product facts

- 支持全国配送到家，并可按商品表达送店/自提。
- 外部电商导流和自建商城均为候选方案。
- 不承诺真实供应链、物流、支付或外部平台数据打通。

## Scope

- FR-201 至 FR-206。
- 商品分类/推荐、规格、价格、优惠权益、地址和配送方式。
- 待付款、待发货、配送中、待自提和已完成等概念状态。

## Out of scope

- 真实购物车持久化、支付、库存、物流跟踪和抖音接口。

## Acceptance

- [ ] 一件代发流程从商城首页连续到订单详情。
- [ ] 到家与到店方式能被用户区分。
- [ ] 渠道候选方案有“待确认”边界。
- [ ] 完成 390px 视觉与交互检查。
- [ ] `npm run build:mobile` 通过。

## Risks / Dependencies

- 前置：T002、T003。
- 风险：渠道、售后与责任主体尚未决策。

## Implementation record

- Commit / PR:
- Changed paths:
- Notes:

## Verification evidence

- CI:
- Page / Route:
- Screenshot / Browser result:
- Other evidence:

## Status history

- 2026-08-28 `TODO → DOING`：用户明确要求从最新 `dev` 新建功能分支施工 T005，并向 `dev` 发起 PR，接收 Experimental OpenCode review 后复核 finding、必要时返工，直到最新 review 无阻塞项。
- Work branch: `feature/T005-mobile-mall-flow`（base: `dev@e21ff937ec421769d65c2af76302b2d9585a0e96`）。

## Review

- Reviewer: Tomz
- Result: REVIEW / PASS / BLOCKED
- Conclusion:
- Follow-up:

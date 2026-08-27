# T004 · Mobile 线下门店自提闭环

- Status: TODO
- Target version: 0.1.0
- Impact: Mobile / Shared
- Owner: Mira

## Background

门店自提是三条 P0 核心演示流程之一，需要从选店到核销和私域承接形成连续动线。

## Goal

完成门店列表、门店详情、商品、自提确认、自提凭证和核销结果的可点击流程。

## Product facts

- 门店载体可包括便利店、养生馆、洗护店和会所。
- 流程为选店/商品、提交订单、自提凭证、到店核销、奖励与私域承接。
- V0.1 不接真实库存、支付或核销系统。

## Scope

- FR-101 至 FR-106。
- 门店距离、营业状态、自提/服务能力与商品权益展示。
- 自提订单、提货码、核销结果、积分/赠品概念反馈。

## Out of scope

- 定位 SDK、真实支付、库存锁定、扫码器和门店系统接入。

## Acceptance

- [ ] 自提主流程从门店入口连续到核销结果。
- [ ] 订单、提货码和核销关联同一用户与门店。
- [ ] 多载体表达不被限定为便利店。
- [ ] 完成 390px 视觉与交互检查。
- [ ] `npm run build:mobile` 通过。

## Risks / Dependencies

- 前置：T002、T003。
- 风险：奖励值仅为演示占位，不得固化积分规则。

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

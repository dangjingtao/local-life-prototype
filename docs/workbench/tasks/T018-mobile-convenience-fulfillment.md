# T018 · Mobile 便利店结算、自提与 3 公里短距配送

- Status: TODO
- Target version: 0.2.0
- Impact: Mobile / Shared
- Owner: -

## Background

V0.2 明确要求便利店同时具备自提和外卖式短距配送，并在结算页一次算清会员价、优惠券、积分和费用明细。

## Goal

完成便利店从购物车到订单完成的两条即时履约闭环：到店自提和约 3 公里短距配送。

## Product facts

- 自提与短距配送共用当前门店购物车，在结算阶段选择履约方式。
- 自提最早约 15 分钟后，时段按 15 分钟间隔表达。
- 短距配送约 3 公里，需表现地址是否在配送范围。
- 取货码 / 配送状态属于订单凭证与履约状态。

## Scope

- 结算页：商品金额、会员优惠、优惠券、积分抵扣、履约费用、应付金额分项。
- 自提：选择取货时段、支付成功状态、备货中、待取货、取货码、核销完成。
- 短距配送：地址、范围判断、配送费用位置、门店接单 / 备货、配送中、送达、完成。
- 自提订单详情和配送订单详情。
- 使用共享 fixtures 验证同一门店不同履约方式以及超出配送范围状态。

## Out of scope

- 真实支付、地图、骑手调度、配送 ETA、配送费算法。
- PC 端履约处理，交给 T022。

## Acceptance

- [ ] 自提流程可连续演示至取货码核销完成。
- [ ] 3 公里短配流程可连续演示至送达完成。
- [ ] 至少存在一个可配送地址和一个超范围地址状态。
- [ ] 结算页同时表达会员价、券、积分、履约费用和应付金额。
- [ ] 自提 / 配送切换不会产生跨店或商城混单。
- [ ] 关键订单状态可被 Prototype Runtime / mock 触发。
- [ ] 390px Mobile 真实浏览器验证通过。
- [ ] `npm run typecheck`、`npm run build` 通过。

## Risks / Dependencies

- 前置：T017。
- 配送费、起送价、主体、预计时长仍未确认，只做可追踪 mock。

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

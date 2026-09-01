# T018 · Mobile 便利店结算、自提与 3 公里短距配送

- Status: REVIEW
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

- [x] 自提流程可连续演示至取货码核销完成。
- [x] 3 公里短配流程可连续演示至送达完成。
- [x] 至少存在一个可配送地址和一个超范围地址状态。
- [x] 结算页同时表达会员价、券、积分、履约费用和应付金额。
- [x] 自提 / 配送切换不会产生跨店或商城混单。
- [x] 关键订单状态可被 Prototype Runtime / mock 触发。
- [x] 390px Mobile 真实浏览器验证通过。
- [x] `npm run typecheck`、`npm run build` 通过。

## Risks / Dependencies

- 前置：T017。
- 配送费、起送价、主体、预计时长仍未确认，只做可追踪 mock。

## Implementation record

- Commit / PR: `8c9b8cb`（主体施工，已提交 `dev`，尚未 push）/ PR 待开
- Changed paths: `packages/shared/src/domain.ts`；`packages/shared/src/fixtures.ts`；`packages/shared/src/selectors.ts`；`apps/mobile/src/StoreFlowScreen.tsx`；`tests/browser/t018-mobile-convenience-fulfillment.spec.mjs`；`tests/browser/t017-mobile-convenience-cart.spec.mjs`
- Notes: 共享层新增 `StoreDeliveryAddress`（按门店 + 估算距离）与可配送 / 超范围地址 fixtures，并补充 fixture 关系校验（每家短配门店必须同时有界内与超范围样本）。`StoreFlowScreen` 将 T017 的去结算 handoff 升级为真实结算页：履约方式（自提 / 约 3 km 短配）切换、15 分钟间隔取货时段（最早约 15 分钟后）、地址范围判断（超范围不可选）、会员价 / 优惠券 / 积分抵扣 / 履约费 / 应付分项；提交后生成 `CONV-*` Mock 订单并消费当前门店购物车。自提状态机（备货中 → 待取货 + 取货码 → 核销完成）与短配状态机（门店接单 / 备货 → 配送中 → 送达）均可由页面 mock 按钮推进。券金额沿用 fixture 标题"门店 10 元优惠券"、积分沿用 `prototypeRules.pointsToCash`（100 积分 = 1 元）候选示例，配送费为未确认示例，均在 UI 标注。

## Verification evidence

- CI: 本地 `npm run verify`（typecheck + build）success
- Page / Route: Mobile 便利店 → 门店购物车 → 结算 → 自提 / 短配订单详情，`/?demoAuth=1`
- Screenshot / Browser result: Playwright 390px 全量 41 项 success（含 T018 5 项：结算分项、自提核销闭环、短配范围状态、短配送达闭环、履约切换不混单）
- Other evidence: T017 两条 handoff 断言随真实结算页接管同步更新

## Review

- Reviewer:
- Result: REVIEW / PASS / BLOCKED
- Conclusion:
- Follow-up:

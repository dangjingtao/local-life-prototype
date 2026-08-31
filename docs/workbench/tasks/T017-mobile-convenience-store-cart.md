# T017 · Mobile 便利店门店页、商品浏览与独立购物车

- Status: TODO
- Target version: 0.2.0
- Impact: Mobile / Shared
- Owner: -

## Background

V0.2 要把便利店从概念商品页升级为成熟即时零售体验，并明确“先选店、门店独立购物车、不同门店不混单”。

## Goal

完成便利店从选店到加购的中高保真购物体验，为后续自提 / 短配结算提供稳定购物车上下文。

## Product facts

- 用户先选线下门店再浏览 / 购买便利店商品。
- 一个门店一个购物车；不同门店不能混单。
- 便利店 UI 参考成熟便利零售小程序的信息组织和即时消费感，但不复制 7-ELEVEN 品牌视觉。
- 商品可售、价格、活动与门店上下文相关。

## Scope

- 门店选择 / 切换：距离、营业状态、自提 / 短配能力等必要信息。
- 门店首页：当前门店、分类、门店内搜索、促销 / 推荐、商品列表。
- 商品详情：规格、价格、会员价、促销、当前门店可售状态。
- 门店独立购物车：加减数量、删除、金额摘要、结算入口。
- 切换门店后各店购物车按 PRD 默认策略独立保留。
- 使用 T015 真实感商品和门店 fixtures 完成中高保真界面。

## Out of scope

- 自提时段、短距配送地址与完整结算流程，交给 T018。
- 真实库存、定位、距离计算、促销引擎。

## Acceptance

- [ ] 未选店时不能以确定库存直接购买便利店商品。
- [ ] 至少 3 个门店在商品可售 / 履约能力上存在可观察差异。
- [ ] 商品支持连续加购、多件商品留在当前门店购物车。
- [ ] 切换门店不产生跨店混单。
- [ ] 商品卡、价格、会员价、数量控制、购物车入口达到中高保真零售体验。
- [ ] 390px Mobile 下完成浏览、详情、加购和切店真实浏览器验证。
- [ ] `npm run typecheck`、`npm run build` 通过。

## Risks / Dependencies

- 前置：T015、T016。
- 不得为了模拟成熟零售而引入 PRD 未确认的生产规则。

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

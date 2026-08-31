# T019 · Mobile 线上商城中高保真购买闭环

- Status: TODO
- Target version: 0.2.0
- Impact: Mobile / Shared
- Owner: -

## Background

V0.2 要求线上商城呈现成熟、可信的电商体验，并与便利店即时履约彻底隔离，同时预留一端多 Storefront / Channel 的产品语义。

## Goal

完成线上商城从聚合首页到签收的中高保真购买闭环，并清晰表达线上店铺 / 渠道来源。

## Product facts

- 商城全国快递，不依赖线下便利店。
- 商城拥有独立购物车，不与便利店混单。
- 产品 / 数据结构需预留 Storefront / Channel，不写死单店。
- V0.2 不做真实外部商城 API。

## Scope

- 商城聚合首页 / 当前 Storefront、渠道标识、品类频道、推荐商品。
- 商品列表 / 筛选 / 搜索、商品详情、规格、优惠和购买 CTA。
- 商城独立购物车。
- 地址、结算、包邮 / 满额包邮等可追踪 mock 表达。
- 商城订单详情、待发货、运输中、已签收 / 已完成状态。
- 至少用两种 Storefront / Channel 语义样本证明模型未锁死单店。
- 中高保真电商视觉，不复用便利店页面结构冒充商城。

## Out of scope

- 真实物流、支付、外部电商平台接口。
- 复杂多店切换产品和店铺经营后台，PC 承接见 T024。

## Acceptance

- [ ] 商城首页、商品详情、购物车、结算、订单 / 物流可连续演示。
- [ ] 全程不出现便利店门店库存、自提或 3 公里短配逻辑。
- [ ] Storefront / Channel 来源可被用户感知，但不过度增加 V0.2 操作负担。
- [ ] 商品图、规格、价格、优惠、包邮信息和 CTA 达到成熟商城中高保真观感。
- [ ] 至少覆盖待发货、运输中、签收三类订单状态。
- [ ] 390px Mobile 真实浏览器验证通过。
- [ ] `npm run typecheck`、`npm run build` 通过。

## Risks / Dependencies

- 前置：T015、T016。
- 不得把“抖音店”示例误做成真实外部集成。

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

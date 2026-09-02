# T019 · Mobile 线上商城中高保真购买闭环

- Status: REVIEW
- Target version: 0.2.0
- Impact: Mobile / Shared
- Owner: Mira

## Background

V0.2 要求线上商城呈现成熟、可信的电商体验，并与便利店即时履约彻底隔离，同时预留一端多 Storefront / Channel 的产品语义。

2026-09-02 用户对现有 T019 做视觉复审，明确结论为 `CHANGES_NEEDED`。原 PR #13 的功能闭环、CI、购物车隔离、全国快递和订单状态证据继续有效，但旧 PASS 不再代表当前中高保真视觉通过。返工按已确认五屏 UI 稿拆为 T019-R1～R5，视觉 SSOT 为 `docs/design/t019-mall-ui-baseline.md` 与 `docs/design/assets/t019-mall-ui-reference.webp`。

## Goal

完成线上商城从聚合首页到签收的中高保真购买闭环，并清晰表达线上店铺 / 渠道来源。

## Product facts

- 商城全国快递，不依赖线下便利店。
- 商城拥有独立购物车，不与便利店混单。
- 产品 / 数据结构需预留 Storefront / Channel，不写死单店。
- V0.2 不做真实外部商城 API。
- 返工只改变消费者视觉表达，不回滚已确认业务模型。

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

- [x] 商城首页、商品详情、购物车、结算、订单 / 物流可连续演示。
- [x] 全程不出现便利店门店库存、自提或 3 公里短配逻辑。
- [x] Storefront / Channel 业务语义可被用户感知但消费者界面不直接暴露工程术语。
- [ ] 商品图、规格、价格、优惠、包邮信息和 CTA 达到确认 UI 稿要求的成熟商城中高保真观感；由 T019-R1～R5 重新验收。
- [x] 至少覆盖待发货、运输中、签收三类订单状态。
- [ ] 390×844 Mobile 五屏真实视觉复审通过；由 T019-R5 收口。
- [x] 原功能基线 `npm run typecheck`、`npm run build` 通过；返工后需重新回归。

## Risks / Dependencies

- 前置：T015、T016。
- 不得把“抖音店”示例误做成真实外部集成。
- R1 → R2 → R3 → R4 默认串行，R5 独立视觉验收。

## Implementation record

- Original implementation: PR #13；merge `c9aa08342e81199934feff95be5045d925c38ea6`。
- Visual rework: T019-R1～R5，2026-09-02 起。

## Verification evidence

- 原功能证据：Verify Prototype #187、T012 Browser Quality #44、Experimental OpenCode #65 success。
- 原产品验收：2026-08-31 用户功能/当时视觉验收通过。
- 新视觉结论：2026-09-02 用户明确视觉验收不通过；确认五屏 UI 稿作为返工基准。

## Status history

- 2026-08-31 `TODO → DOING → REVIEW → PASS`：PR #13 完成功能闭环并经用户验收。
- 2026-09-02 `PASS → REVIEW`：用户视觉复审 `CHANGES_NEEDED`；保留旧功能证据，进入 T019-R1～R5 视觉返工链。

## Review

- Reviewer: Tomz / T019-R5 pending
- Result: REVIEW
- Conclusion: 功能闭环有效，但当前视觉 PASS 已被 2026-09-02 明确复审结论替代；只有 T019-R5 Visual PASS 后才恢复 T019 PASS。
- Follow-up: T019-R1 商城首页 → R2 商详 → R3 购物车 → R4 结算/物流 → R5 五屏复审。

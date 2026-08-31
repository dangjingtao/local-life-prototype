# T019 · Mobile 线上商城中高保真购买闭环

- Status: REVIEW
- Target version: 0.2.0
- Impact: Mobile / Shared
- Owner: Mira

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

- [x] 商城首页、商品详情、购物车、结算、订单 / 物流可连续演示。
- [x] 全程不出现便利店门店库存、自提或 3 公里短配逻辑。
- [x] Storefront / Channel 来源可被用户感知，但不过度增加 V0.2 操作负担。
- [x] 商品图、规格、价格、优惠、包邮信息和 CTA 达到成熟商城中高保真观感。
- [x] 至少覆盖待发货、运输中、签收三类订单状态。
- [ ] 390px Mobile 真实浏览器验证通过。
- [ ] `npm run typecheck`、`npm run build` 通过。

## Risks / Dependencies

- 前置：T015、T016。
- 不得把“抖音店”示例误做成真实外部集成。

## Implementation record

- Commit / PR: branch `task/T019-mobile-mall-purchase-loop`；PR pending
- Changed paths:
  - `apps/mobile/src/MallFlowScreen.tsx`
  - `tests/browser/t019-mobile-mall-purchase-loop.spec.mjs`
  - `docs/workbench/tasks/T019-mobile-mall-medium-high-fidelity.md`
  - `docs/workbench/00-work-ledger.md`
- Notes:
  - 使用 T015 已存在的 `Channel` / `OnlineStorefront` / `parcel_delivery` 领域语义，不为了页面重复造 Shared 模型。
  - 商城首页显式提供多 Storefront / Channel 来源切换；`planned` 外部渠道只作为语义样本展示，明确不跳转、不调用真实外部平台 API。
  - 每个 Storefront 维护自己的商城购物车状态，与便利店购物车完全隔离；切换 Storefront 不跨来源混单。
  - 商城内提供搜索、分类、商品图形视觉、规格、会员价 / 原价、促销、全国快递与满额包邮 Mock 规则。
  - 结算使用可追踪演示地址和固定 Mock 运费规则：满 ¥99 包邮，否则 ¥8；不将该规则冒充正式后端业务事实。
  - 提交订单后可连续推进 `待发货 → 运输中 → 已签收 / 已完成`，运输中展示明确 Mock 运单与轨迹。
  - 已移除 V0.1 商城中的“送至合作门店 / 到店自提”履约方向，T019 商城只表达全国包裹快递。

## Verification evidence

- CI: pending PR workflows
- Page / Route: Mobile `/?demoAuth=1` → 一级导航 `商城`
- Screenshot / Browser result: pending `T019` 390px Playwright smoke
- Other evidence:
  - 新增 `tests/browser/t019-mobile-mall-purchase-loop.spec.mjs`，覆盖多 Storefront、无便利店履约语义、商品信息、独立购物车、结算与三段订单状态。

## Status history

- 2026-08-31 `TODO → DOING`：用户要求阅读项目约定并完成 T019，通过 PR 评审后合并；确认 T015 / T016 已合入 `dev` 后从 `dev` 独立开卡施工。
- 2026-08-31 `DOING → REVIEW`：核心实现与 T019 390px browser smoke 已提交任务分支；等待 GitHub Actions 与实验性 PR AI Review 实际结果，不以代码提交本身宣称 PASS。

## Review

- Reviewer: Experimental OpenCode PR Review / Tomz
- Result: REVIEW
- Conclusion: 施工完成，等待 PR 自动验证与评审结论。
- Follow-up: 若 reviewer 有明确 finding，修复后重新验证；评审接受后按用户本次明确授权合并 PR。任务 `PASS` 仍以产品验收口径为准，不由 advisory AI review 自动代替。

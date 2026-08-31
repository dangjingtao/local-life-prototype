# T019 · Mobile 线上商城中高保真购买闭环

- Status: PASS
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
- [x] 390px Mobile 真实浏览器验证通过。
- [x] `npm run typecheck`、`npm run build` 通过。

## Risks / Dependencies

- 前置：T015、T016。
- 不得把“抖音店”示例误做成真实外部集成。

## Implementation record

- Commit / PR: branch `task/T019-mobile-mall-purchase-loop`；PR #13；merge `c9aa08342e81199934feff95be5045d925c38ea6`
- Changed paths:
  - `apps/mobile/src/App.tsx`
  - `apps/mobile/src/MallFlowScreen.tsx`
  - `tests/browser/t012-quality.spec.mjs`
  - `tests/browser/t019-mobile-mall-purchase-loop.spec.mjs`
  - `docs/workbench/tasks/T019-mobile-mall-medium-high-fidelity.md`
  - `docs/workbench/00-work-ledger.md`
- Notes:
  - 使用 T015 已存在的 `Channel` / `OnlineStorefront` / `parcel_delivery` 领域语义，不为了页面重复造 Shared 模型。
  - 商城首页显式提供多 Storefront / Channel 来源切换；`planned` 外部渠道只作为语义样本展示，明确不跳转、不调用真实外部平台 API。
  - 每个 Storefront 维护自己的商城购物车状态，与便利店购物车完全隔离；切换 Storefront 不跨来源混单；购物车提升至 App 会话层后跨一级 Tab 切换仍保留。
  - 全局搜索进入商城时会消费 handoff，直接落到目标商品详情，不只显示“已定位”提示。
  - 商城内提供搜索、分类、商品图形视觉、规格、会员价 / 原价、促销、全国快递与满额包邮 Mock 规则。
  - 结算使用可追踪演示地址和固定 Mock 运费规则：满 ¥99 包邮，否则 ¥8；不将该规则冒充正式后端业务事实。
  - 提交订单后先生成订单快照并消费当前 Storefront 购物车，再连续推进 `待发货 → 运输中 → 已签收 / 已完成`；运输中展示明确 Mock 运单与轨迹。
  - 已移除 V0.1 商城中的“送至合作门店 / 到店自提”履约方向，T019 商城只表达全国包裹快递。

## Verification evidence

- CI: `Verify Prototype #187` success；`T012 Browser Quality #44` success；`Experimental OpenCode PR Review #65` success。
- Page / Route: Mobile `/?demoAuth=1` → 一级导航 `商城`
- Screenshot / Browser result: `tests/browser/t019-mobile-mall-purchase-loop.spec.mjs` 390px Playwright smoke 通过，并纳入 Browser Quality。
- Review:
  - Codex 首轮发现 P1/P1/P2：全局搜索目标未消费、商城跨 Tab 丢购物车、下单后购物车未清空；均已修复并补回归测试。
  - Codex 对最终 head `a6f3e31b57` 重审：`Didn't find any major issues`。
  - Experimental OpenCode 对最终 head：`NO_BLOCKING_FINDINGS`，无高置信 P0–P2；仅留非阻塞 P3“订单详情可进一步展开商品行项目”。
- Product acceptance: 2026-08-31 用户明确“通过”，据此由 `REVIEW → PASS`。

## Status history

- 2026-08-31 `TODO → DOING`：用户要求阅读项目约定并完成 T019，通过 PR 评审后合并；确认 T015 / T016 已合入 `dev` 后从 `dev` 独立开卡施工。
- 2026-08-31 `DOING → REVIEW`：核心实现与 T019 390px browser smoke 已提交任务分支；等待 GitHub Actions 与实验性 PR AI Review 实际结果，不以代码提交本身宣称 PASS。
- 2026-08-31 `REVIEW → PASS`：PR #13 经 Codex / Experimental OpenCode 评审与 CI / 390px Browser Quality 验证后合入 `dev`；用户随后明确验收通过。

## Review

- Reviewer: Experimental OpenCode PR Review / Codex / Tomz
- Result: PASS
- Conclusion: PR #13 已合入 `dev`；阻塞级 review finding 已全部修复，CI 与 390px 浏览器验证通过，用户明确验收 T019。
- Follow-up: OpenCode P3“订单详情展开商品行项目”为非阻塞体验增强，不影响 T019 PASS；如后续需要，可在商城体验迭代或 T024 中单独处理。

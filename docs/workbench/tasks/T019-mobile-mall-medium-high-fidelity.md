# T019 · Mobile 线上商城中高保真购买闭环

- Status: REVIEW
- Target version: 0.2.0
- Impact: Mobile / Shared
- Owner: Mira

## Background

V0.2 要求线上商城呈现成熟、可信的电商体验，并与便利店即时履约彻底隔离，同时预留一端多 Storefront / Channel 的产品语义。

T019 原功能闭环于 2026-08-31 完成并曾经用户验收为 PASS。2026-09-02 用户重新进行视觉验收并明确判定不通过；内部复审确认现有实现虽然功能、CI 和 browser regression 成立，但商品视觉、消费者语言、首页商业层级和深层页面完成度没有兑现 V0.2 中高保真标准。因此保留原功能验收历史，当前状态重新打开为 `REVIEW`，进入 T019-R1～R5 视觉返工链。

## Goal

完成线上商城从聚合首页到签收的中高保真购买闭环，并清晰表达线上店铺 / 渠道来源；在不改变既有功能事实的前提下，达到 2026-09-02 用户确认商城 UI 基准。

## Product facts

- 商城全国快递，不依赖线下便利店。
- 商城拥有独立购物车，不与便利店混单。
- 产品 / 数据结构需预留 Storefront / Channel，不写死单店。
- V0.2 不做真实外部商城 API。
- Storefront / Channel 是数据语义；消费者页面必须映射为正常店铺 / 商城来源语言，不直接暴露工程模型。
- 2026-09-02 确认的五屏 UI 稿交互与布局作为当前视觉基准；**除颜色改用项目 Design Token 外，交互、模块顺序、关键宽高比例不得自行修改。**

## Visual baseline

- `docs/design/t019-mall-ui-baseline.md`
- Canonical viewport: `390 × 844`
- 覆盖：商城首页 / 商品详情 / 商城购物车 / 结算确认 / 订单物流。
- 颜色：只使用 `@prototype/design-system/tokens.css` semantic tokens，不抄确认稿橙色。

## Scope

- 商城聚合首页 / 当前 Storefront、渠道标识、品类频道、推荐商品。
- 商品列表 / 筛选 / 搜索、商品详情、规格、优惠和购买 CTA。
- 商城独立购物车。
- 地址、结算、包邮 / 满额包邮等可追踪 mock 表达。
- 商城订单详情、待发货、运输中、已签收 / 已完成状态。
- 至少用两种 Storefront / Channel 语义样本证明模型未锁死单店。
- 中高保真电商视觉，不复用便利店页面结构冒充商城。
- 消费者 UI 不暴露 T019 / Mock / Storefront / Channel / Shared 等工程说明。

## Out of scope

- 真实物流、支付、外部电商平台接口。
- 复杂多店切换产品和店铺经营后台，PC 承接见 T024。
- 因视觉返工新增评论、直播、售后、支付方式、真实地址簿、真实 SKU 库存等未确认功能。

## Acceptance

### Functional baseline — previously verified, must remain green

- [x] 商城首页、商品详情、购物车、结算、订单 / 物流可连续演示。
- [x] 全程不出现便利店门店库存、自提或 3 公里短配逻辑。
- [x] Storefront / Channel 来源可被用户感知，但不过度增加 V0.2 操作负担。
- [x] 至少覆盖待发货、运输中、签收三类订单状态。
- [x] 390px Mobile 功能浏览器验证通过。
- [x] `npm run typecheck`、`npm run build` 通过。

### Visual baseline — reopened 2026-09-02

- [ ] 商城首页严格符合确认稿的模块顺序、首屏密度和关键宽高布局；颜色只替换为项目 token。
- [ ] 商品使用真实感演示图 / 包装图，不再用“色块 + 商品名”冒充商品图片。
- [ ] 商品详情以商品主图、标题、价格、规格、优惠和购买 CTA 为主层级，不被工程解释 Card 抢占。
- [ ] 商城购物车按确认稿密度呈现商品行、数量控制、金额汇总和固定结算栏。
- [ ] 结算确认按确认稿呈现地址、来源、配送、商品摘要、金额与提交订单。
- [ ] 订单物流按确认稿呈现状态 Hero、三段进度、正常格式虚拟物流信息、轨迹和订单信息。
- [ ] 正常消费者路径无 `T019` / `Mock` / `fixture` / `Storefront` / `Channel` / `Shared 未定义` / `MOCK-SF-*` 等工程术语泄漏。
- [ ] 五个 canonical ready state 均完成真实 Chromium `390 × 844` 对照验收，关键几何满足 `docs/design/t019-mall-ui-baseline.md`。
- [ ] T019-R5 独立视觉复审明确给出 PASS 后，本卡才可恢复 PASS。

## Rework chain

1. `T019-R1` · 商城首页视觉返工
2. `T019-R2` · 商品详情视觉返工
3. `T019-R3` · 商城购物车视觉返工
4. `T019-R4` · 结算确认与订单物流视觉返工
5. `T019-R5` · 商城视觉复审与验收

默认串行 R1 → R2 → R3 → R4 → R5，原因是当前主要实现集中在 `MallFlowScreen.tsx`，并行修改容易产生文件与视觉基线竞态。

## Risks / Dependencies

- 前置：T015、T016。
- 不得把“抖音店”示例误做成真实外部集成。
- 视觉返工不得回滚已通过的 Storefront 隔离、独立购物车、全国快递、全局搜索 handoff、checkout 和订单状态功能。
- T024 可继续消费 T019 已确认的业务模型；但 T026 在商城中高保真验收上必须等待 T019-R5，不再引用旧 PASS 结论。

## Implementation record

- Original Commit / PR: branch `task/T019-mobile-mall-purchase-loop`；PR #13；merge `c9aa08342e81199934feff95be5045d925c38ea6`
- Original changed paths:
  - `apps/mobile/src/App.tsx`
  - `apps/mobile/src/MallFlowScreen.tsx`
  - `tests/browser/t012-quality.spec.mjs`
  - `tests/browser/t019-mobile-mall-purchase-loop.spec.mjs`
  - `docs/workbench/tasks/T019-mobile-mall-medium-high-fidelity.md`
  - `docs/workbench/00-work-ledger.md`
- Original functional notes:
  - 使用 T015 已存在的 `Channel` / `OnlineStorefront` / `parcel_delivery` 领域语义，不为了页面重复造 Shared 模型。
  - 每个 Storefront 维护自己的商城购物车状态，与便利店购物车完全隔离；切换 Storefront 不跨来源混单；购物车提升至 App 会话层后跨一级 Tab 切换仍保留。
  - 全局搜索进入商城时会消费 handoff，直接落到目标商品详情。
  - 结算使用可追踪演示地址和固定 Mock 运费规则：满 ¥99 包邮，否则 ¥8。
  - 提交订单后先生成订单快照并消费当前 Storefront 购物车，再连续推进 `待发货 → 运输中 → 已签收 / 已完成`。
  - 已移除 V0.1 商城中的“送至合作门店 / 到店自提”履约方向，T019 商城只表达全国包裹快递。
- 2026-09-02 visual review observations:
  - `ProductVisual` 仍是品牌色色块 + 商品名，不构成中高保真商品视觉。
  - Home / Detail / Cart / Checkout / Order 多处直接暴露 Storefront / Channel / Mock / T019 / Shared 等工程说明。
  - 首页内容重心偏数据模型说明，成熟商城的商品、活动、价格与促销层级不足。
  - 原 T019 Playwright 多项断言固化了工程说明文案，只证明功能语义存在，不能证明视觉成熟度。

## Verification evidence

### Original functional evidence

- CI: `Verify Prototype #187` success；`T012 Browser Quality #44` success；`Experimental OpenCode PR Review #65` success。
- Page / Route: Mobile `/?demoAuth=1` → 一级导航 `商城`
- Original Screenshot / Browser result: `tests/browser/t019-mobile-mall-purchase-loop.spec.mjs` 390px Playwright smoke 通过，并纳入 Browser Quality。
- Original review:
  - Codex 首轮发现 P1/P1/P2：全局搜索目标未消费、商城跨 Tab 丢购物车、下单后购物车未清空；均已修复并补回归测试。
  - Codex 对最终 head `a6f3e31b57` 重审：`Didn't find any major issues`。
  - Experimental OpenCode 对最终 head：`NO_BLOCKING_FINDINGS`。

### Current visual evidence

- 2026-09-02 用户明确：`T19 视觉验收不通过`。
- 2026-09-02 五屏商城 UI 交互 / 布局稿确认：交互认可，要求仅替换项目颜色 token，其余交互与宽高布局严格执行。
- Durable visual contract: `docs/design/t019-mall-ui-baseline.md`。

## Status history

- 2026-08-31 `TODO → DOING`：用户要求完成 T019，通过 PR 评审后合并。
- 2026-08-31 `DOING → REVIEW`：核心实现与 T019 390px browser smoke 已提交任务分支；等待评审。
- 2026-08-31 `REVIEW → PASS`：PR #13 经 Codex / Experimental OpenCode 评审与 CI / 390px Browser Quality 验证后合入 `dev`；用户随后明确验收 T019。
- 2026-09-02 `PASS → REVIEW`：用户重新进行视觉验收并明确不通过；内部复审确认功能证据仍成立，但视觉未兑现 V0.2 中高保真标准。创建 T019-R1～R5 返工链，旧 PASS 作为历史功能验收结论保留，不再代表当前视觉验收状态。

## Review

- Reviewer: Tomz / internal visual review
- Result: CHANGES_NEEDED
- Conclusion: T019 功能闭环保留，但当前视觉验收失败；必须完成 R1-R4，并由 R5 真实 390×844 独立复审后才能恢复 PASS。
- Follow-up: 按 `docs/design/t019-mall-ui-baseline.md` 串行执行 T019-R1 → R2 → R3 → R4 → R5。

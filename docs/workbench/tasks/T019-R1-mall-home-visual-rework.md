# T019-R1 · 商城首页视觉返工

- Status: REVIEW
- Target version: 0.2.0
- Impact: Mobile / UX
- Parent: T019
- Owner: -

## Background

T019 功能闭环已经完成，但 2026-09-02 视觉复审判定 `CHANGES_NEEDED`：现有商城首页更像展示 Storefront / Channel 数据模型的 Demo 页，没有达到 V0.2 “靠谱的成熟商城”中高保真标准。用户已确认新的五屏商城 UI 稿，要求除颜色使用项目现有 Design Token 外，严格按确认稿的交互、模块顺序和关键宽高布局返工。

统一视觉合同：`docs/design/t019-mall-ui-baseline.md`；Visual SSOT：`docs/design/assets/t019-mall-ui-reference.webp`。

## Goal

把商城首页改造成确认稿中的成熟电商首页，同时完整保留 T019 已有商城来源切换、商城内搜索、分类、推荐商品、购物车入口和全国快递业务语义。

## Product facts

- 商城全国快递，与便利店门店库存、自提、3 公里短配隔离。
- 商城购物车独立。
- Storefront / Channel 数据模型继续保留，但消费者不直接看到工程术语。
- 商城首页可以承载现有商城 Campaign / 推荐商品，不新增 CMS 或真实推荐系统。
- T016 的产品级全局搜索仍然有效；本卡只调整 Mall Home 展示 chrome，不修改全局搜索业务语义。

## Scope

- 商城专属 92px 头部：线上商城、全国快递提示、购物车入口 / 数量。
- 108px 商城来源选择区：消费语言映射现有 storefront fixtures，保持现有切换逻辑和各来源独立购物车。
- 44px 商城内搜索。
- 36px 横向分类视觉轨，触控目标仍保持 44px。
- 使用现有 mall campaign / fixture 构造 112px 活动 Banner。
- 推荐商品双列布局：商品本地非品牌包装插画、商品名、规格、价格 / 原价、促销 / 全国快递轻标签。
- 52px 满额包邮说明条，继续使用现有 `满 ¥99 包邮，否则 ¥8` T019 mock 规则。
- Mall Home 保留一级底部导航；仅 Mall Home 隐藏通用 `LOCAL LIFE · V0.2 PREVIEW` 顶栏，深层页面在 R2-R4 前保持原 chrome。

## Geometry contract

严格遵守 `docs/design/t019-mall-ui-baseline.md` Screen A：

- 390×844 canonical viewport。
- 头部 92px。
- 来源选择 108px。
- 搜索 44px。
- 分类视觉轨 36px。
- Banner 112px。
- 双列 gap 10px；单卡宽约 174px。
- 商品图 122px；商品卡 220px。
- 包邮说明 52px。
- 一级导航 64px。
- 关键块高度容差 ±4px。

## Hard constraints

- **除颜色 token 替换外，不得自行修改确认稿的交互、模块顺序、关键宽高比例、首屏密度和信息层级。**
- 不把来源选择改成弹层、下拉或独立页面。
- 不删活动 Banner，不把推荐双列改成单列。
- 不显示 `Storefront`、`Channel`、`Mock`、`planned`、`integrationStatus`、`T019` 等内部术语。
- 不增加真实外部商城 API、支付、评论、直播、收藏持久化等功能。
- 不修改 T019 独立购物车业务逻辑。
- 商品视觉不得退回“品牌色色块 + 商品名”的占位方案。
- 颜色从现有 Com Design semantic tokens 派生；不抄确认稿橙色值，不新增业务品牌色常量。

## Out of scope

- 商品详情、购物车、结算、订单物流的页面结构重构，由 R2-R4 承接。
- 新增商城业务规则或 Shared 模型。
- PC 商城后台 T024。

## Acceptance

- [x] 390×844 首页按视觉基准的顺序和显式几何完成，无设计结构漂移。
- [x] 首屏优先展示商城消费内容，不再由模型解释 Card 占据主视觉。
- [x] 当前 storefront fixtures 可切换，独立购物车状态逻辑未改写。
- [x] 商城内搜索 / 分类仍可用。
- [x] 活动 Banner 使用现有 `CAMPAIGN-MALL-CARE` 数据，不创造新业务规则或假 CTA。
- [x] 推荐商品使用仓库内可追踪、非品牌包装插画，双列密度符合基准。
- [x] 购物车入口继续读取当前 Storefront cart count。
- [x] 正常 Mall Home 无工程术语泄漏。
- [x] 颜色均消费 / 派生项目现有 semantic tokens。
- [ ] `npm run typecheck`、`npm run build` 与 T016 / T019 / T019-R1 browser regression：等待 PR CI 实际结果，不伪造。

## Risks / Dependencies

- 前置：T015、T016、T019 已有功能语义。
- R2-R4 都可能继续修改 `MallFlowScreen.tsx`，必须以本卡最终合入候选为基线串行。
- Mall Home chrome 通过 `MallStep` 回调最小化影响范围；深层 flow 仍保持旧布局，等待后续卡处理。

## Implementation record

- Branch: `task/T019-R1-mall-home-visual-rework`
- Base: 从当时最新 `dev @ 314e1e7` 开出；随后提交视觉 SSOT 与本任务施工。
- Changed paths:
  - `apps/mobile/src/App.tsx`：仅 Mall Home 隐藏通用 header，消费 `MallStep`。
  - `apps/mobile/src/MallFlowScreen.tsx`：重构 Home，保留深层购买闭环。
  - `apps/mobile/src/MallProductArtwork.tsx`：新增可复用、本地、非品牌商品包装插画。
  - `tests/browser/t019-mobile-mall-purchase-loop.spec.mjs`：移除要求工程术语可见的旧断言。
  - `tests/browser/t019-r1-mall-home-visual.spec.mjs`：新增 390×844 几何与消费者语言 gate。
  - `docs/design/t019-mall-ui-baseline.md` / `docs/design/assets/t019-mall-ui-reference.webp`：随施工分支固化 Visual SSOT。

## Verification evidence

- Code evidence: 关键几何均使用显式尺寸，R1 专项 Playwright 以 ±4px 验证 92 / 108 / 44 / 36 / 112 / 174 / 122 / 220 / 52px 合同。
- CI: pending PR gates。
- Screenshot / Browser result: pending GitHub Browser Quality / Playwright gate。
- Other evidence: T019 原有 source switch、跨 Tab cart persistence、商城内搜索、全局搜索 detail handoff、checkout / order 回归测试继续保留。

## Review

- Reviewer: pending CI / Experimental OpenCode / human visual review
- Result: REVIEW
- Conclusion: R1 施工已完成并进入评审；不能以代码提交替代 390×844 实屏和 CI 结果。
- Follow-up: R1 通过并成为最新 `dev` 候选后，R2 才继续商品详情视觉返工。

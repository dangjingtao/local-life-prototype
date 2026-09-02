# T019-R1 · 商城首页视觉返工

- Status: TODO
- Target version: 0.2.0
- Impact: Mobile / UX
- Parent: T019
- Owner: -

## Background

T019 功能闭环已经完成，但 2026-09-02 视觉复审判定 `CHANGES_NEEDED`：现有商城首页更像展示 Storefront / Channel 数据模型的 Demo 页，没有达到 V0.2 “靠谱的成熟商城”中高保真标准。用户已确认新的五屏商城 UI 稿，要求除颜色使用项目现有 Design Token 外，严格按确认稿的交互、模块顺序和关键宽高布局返工。

统一视觉合同：`docs/design/t019-mall-ui-baseline.md`。

## Goal

把商城首页改造成确认稿中的成熟电商首页，同时完整保留 T019 已有商城来源切换、商城内搜索、分类、推荐商品、购物车入口和全国快递业务语义。

## Product facts

- 商城全国快递，与便利店门店库存、自提、3 公里短配隔离。
- 商城购物车独立。
- Storefront / Channel 数据模型继续保留，但消费者不直接看到工程术语。
- 商城首页可以承载现有商城 Campaign / 推荐商品，不新增 CMS 或真实推荐系统。
- T016 的产品级全局搜索仍然有效；本卡只调整 Mall 展示 chrome，不修改全局搜索业务语义。

## Scope

- 商城专属头部：线上商城、全国快递提示、购物车入口 / 数量。
- 商城来源选择区：消费语言映射现有 storefront fixtures，保持现有切换逻辑和各来源独立购物车。
- 商城内搜索。
- 横向分类轨。
- 使用现有 mall campaign / fixture 构造确认稿位置的活动 Banner。
- 推荐商品双列布局：商品真实感演示图 / 包装图、商品名、规格、价格 / 原价、优惠 / 全国快递轻标签。
- 满额包邮说明条，继续使用现有 `满 ¥99 包邮，否则 ¥8` T019 mock 规则。
- Mall Home 保留一级底部导航；必要时在 `App.tsx` 为 mall chrome 做最小调整。

## Geometry contract

严格遵守 `docs/design/t019-mall-ui-baseline.md` Screen A：

- 390×844 canonical viewport。
- 头部 92px。
- 来源选择 108px。
- 搜索 44px。
- 分类轨 36px。
- Banner 112px。
- 双列 gap 10px；单卡宽约 174px。
- 商品图 122px；商品卡总高约 216–224px。
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
- 颜色必须从 `@prototype/design-system/tokens.css` 消费，不抄确认稿的橙色值。

## Out of scope

- 商品详情、购物车、结算、订单物流的页面重构，由 R2-R4 承接。
- 新增商城业务规则或 Shared 模型。
- PC 商城后台 T024。

## Acceptance

- [ ] 390×844 首页按视觉基准的顺序和高度完成，无横向溢出。
- [ ] 首屏优先展示商城消费内容，不再由模型解释 Card 占据主视觉。
- [ ] 当前 storefront fixtures 可切换，独立购物车状态不回归。
- [ ] 商城内搜索 / 分类仍可用。
- [ ] 活动 Banner 使用现有业务数据或可追踪本地素材，不创造新业务规则。
- [ ] 推荐商品使用真实感商品图 / 包装图，双列密度符合基准。
- [ ] 购物车入口数量正确。
- [ ] 正常消费者路径无工程术语泄漏。
- [ ] 所有颜色使用项目现有 semantic tokens。
- [ ] `npm run typecheck`、`npm run build` 与相关 T016 / T019 browser regression 通过。

## Risks / Dependencies

- 前置：T015、T016、T019 已有功能语义。
- 本卡与 R2-R4 都可能修改 `MallFlowScreen.tsx`；默认按 R1 → R2 → R3 → R4 串行，避免同文件竞态。
- 如 App chrome 调整影响其它一级业务域，必须限制条件只作用于 Mall 深层状态并补回归。

## Dispatch Context

- Repo: `dangjingtao/local-life-prototype`
- Base: 派卡时最新 `dev`；施工前必须重新同步。
- Suggested branch: `task/T019-R1-mall-home-visual-rework`
- Must Read: `AGENTS.md`、T019、T016、`docs/product/01-v0.2-prd.md`、`docs/design/t019-mall-ui-baseline.md`、`apps/mobile/src/App.tsx`、`apps/mobile/src/MallFlowScreen.tsx`、T019 browser tests。
- Execution entry: `/?demoAuth=1` → 一级导航 `商城`。

## Verification evidence

- CI:
- Screenshot / Browser result:
- Other evidence:

## Review

- Reviewer:
- Result: REVIEW / CHANGES_NEEDED
- Conclusion:
- Follow-up: R1 进入 REVIEW 并合入候选后，R2 才以最新实现继续。

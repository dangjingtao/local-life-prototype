# T019-R2 · 商城商品详情视觉返工

- Status: TODO
- Target version: 0.2.0
- Impact: Mobile / UX
- Parent: T019
- Owner: -

## Background

T019 现有商品详情功能成立，但视觉层级仍以解释型 Card 为主，商品图仅为色块占位，无法满足 V0.2 中高保真商城标准。用户已确认新的商品详情稿，要求除颜色使用项目现有 Design Token 外，严格按确认稿的交互、模块顺序和关键宽高布局施工。

统一视觉合同：`docs/design/t019-mall-ui-baseline.md`。

## Goal

把商品详情页重构为以商品主图、标题、价格、规格、促销和购买 CTA 为中心的成熟商城商详，同时保持 T019 现有商品实体、优惠、包邮、加购和立即购买逻辑。

## Product facts

- 商品实体、价格、规格、促销、商城优惠继续读取现有 Shared fixtures。
- 当前商城来源仍需可感知，但不能以技术模型标签抢占主视觉。
- 商城只走全国快递；保留满 ¥99 包邮 / 未满 ¥8 的可追踪 T019 mock 规则。
- 加入购物车与立即购买两种动作保留；购物车按 storefront 隔离。
- 全局搜索进入指定商城商品时必须直接落到该商品详情。

## Scope

- 48px 商品详情 top bar：返回、辅助操作 / 购物车入口。
- 286px 左右的商品大图区域，复用与首页一致的真实感演示图 / 包装图。
- 商品分类 / 来源轻标签、标题、卖点、当前价、原价 / 立省层级。
- 规格、促销、配送 / 运费、可用优惠券。
- 72px 固定购买栏；包含辅助入口与“加入购物车 / 立即购买”。
- 必要时调整 Mall 深层页 app chrome，使一级导航不与固定购买栏冲突。

## Geometry contract

严格遵守 `docs/design/t019-mall-ui-baseline.md` Screen B：

- Top bar 48px。
- 商品主图 286px，高度容差 ±4px。
- 标题 / 价格主信息区约 132px。
- 规格 44px。
- 促销 52px。
- 配送 / 运费 72px。
- 优惠券 76px。
- 固定购买栏 72px；主按钮高度 48px。

## Hard constraints

- **除颜色 token 替换外，不得自行修改确认稿的交互、模块顺序、关键宽高比例和购买栏位置。**
- 商品主图必须成为第一视觉中心，不得继续使用色块 + 商品名代替图片。
- 不把商详拆回大量同权重通用 Card。
- 不删除“加入购物车 / 立即购买”并列动作，也不自行新增 SKU 弹层、收藏持久化、客服系统等未实现能力。
- `Storefront` / `Channel` 只允许映射为消费者可理解的店铺来源语言。
- 不出现 `Mock`、`Shared 未定义`、`不读取便利店库存`、`T019` 等工程说明。
- 颜色全部使用项目 semantic tokens。

## Out of scope

- 商城首页由 R1 承接。
- 购物车、结算、订单物流由 R3 / R4 承接。
- 新增真实 SKU 库存、真实优惠计算、支付、客服、收藏后端。

## Acceptance

- [ ] 390×844 商详按视觉基准完成，关键高度 ±4px。
- [ ] 商品主图为真实感本地演示资产，并与首页同商品一致。
- [ ] 标题 / 价格 / 原价 / 规格 / 促销 / 配送 / 优惠层级可在一屏连续扫读。
- [ ] 加入购物车后数量正确；返回首页购物车 badge 正确。
- [ ] 立即购买进入当前 storefront 的购物车 / 后续链路，行为与 T019 基线一致。
- [ ] 全局搜索 handoff 仍能直接打开指定商品详情。
- [ ] 深层页固定购买栏不与一级导航 / safe area 冲突。
- [ ] 正常消费者路径无工程术语泄漏。
- [ ] 颜色只取 Design Token。
- [ ] typecheck / build / T016 搜索 handoff / T019 商详 browser regression 通过。

## Risks / Dependencies

- 前置：T019-R1 至少完成共享商品视觉资产与 Mall chrome 基础，并以最新候选为施工基线。
- 若 R1 未改 App chrome，本卡允许做仅作用于 Mall detail 的最小条件化调整，不影响其他一级业务域。

## Dispatch Context

- Repo: `dangjingtao/local-life-prototype`
- Suggested branch: `task/T019-R2-mall-product-detail-visual-rework`
- Must Read: `AGENTS.md`、T019、T019-R1、`docs/design/t019-mall-ui-baseline.md`、T016、`apps/mobile/src/App.tsx`、`apps/mobile/src/MallFlowScreen.tsx`、T019 browser tests。
- Start from: 已整合 R1 的最新 `dev` / approved candidate，不从旧 T019 head 单独施工。

## Verification evidence

- CI:
- Screenshot / Browser result:
- Other evidence:

## Review

- Reviewer:
- Result: REVIEW / CHANGES_NEEDED
- Conclusion:
- Follow-up: R2 进入 REVIEW 并整合后再进入 R3。

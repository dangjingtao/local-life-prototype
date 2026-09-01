# T028 · Mobile 便利店商品浏览与零售密度 UX 返工

- Status: DOING
- Target version: 0.2.0
- Impact: Mobile / UX / Assets
- Owner: -

## Background

T017 功能性实现能正确展示门店商品、价格、会员价与库存状态，但当前浏览页主要由完整 bordered Card、分类文字占位图和解释型活动卡组成。内部 UX 复审认为它更像领域模型 / 验收数据展示器，而不是成熟便利零售的快速扫货界面。

## Goal

重构门店商品浏览层，使用户在 390px 手机上能快速看到商品、价格、促销和加购动作，并建立真正的即时零售视觉密度与固定购物车反馈。

## Product facts

- 当前门店决定商品价格、可售状态、促销与履约能力。
- 商品支持连续加购，多件商品留在当前门店购物车。
- 便利店购物车与商城购物车独立。
- 本项目是中高保真产品型原型，不要求接真实商品 CDN，但正常用户路径不能继续用“分类文字块”冒充商品主图。

## Scope

- 为便利店商品提供可追踪的中高保真 demo 主图 / 包装图素材；可使用仓库内自制 / 非品牌化素材，但不得继续只显示分类文字占位。
- 采用**左侧分类栏 + 右侧商品列表**的双栏布局，分类支持一级分组（如"鲜食系列""经典系列"），选中态左侧色条 + 文字变色；分类与商品列表联动滚动。
- 商品列表提供**套餐 / 单品双态切换**：套餐模式走视觉化大图卡片（适合组合商品、早餐 / 下午茶套餐），单品模式走紧凑列表（适合快速扫货）。
- **单品模式商品行**采用左图右文的紧凑结构，同一行内清晰表达：主图（方形 / 包装图）、商品名、规格 / 搭配推荐文案、当前门店价格 / 会员价、促销标签（如"2件¥12.9""预估单价¥6.45"）、售罄状态、加购按钮（+ 号 / 数量控件）。
- 促销信息直接嵌入商品行，用醒目的胶囊 / 价格牌标签展示多件优惠、预估单价等，用户无需进入详情即可感知优惠并触发冲动购买。
- 搜索与分类保持高频可达，避免用户滚过大量说明卡才能看到商品。
- 门店活动位保留但改为消费者视角：顶部轮播 banner（当期活动、超值卡、新品推荐），替换解释型活动卡和"mock 活动位""fixture 标签"等内部语言。
- 底部**常驻购物栏**：左侧购物车图标（带数量徽标）+ 合计金额 + 主 CTA"去结算"，任意滚动位置都可达；加购后金额和数量有即时视觉反馈。
- 左下角悬浮**可用券入口**：以优惠券 icon + 数量提示，与促销商品形成呼应，引导用户关注可用优惠。
- 保持 44px 触控目标、无横向溢出、Com Design token / icon 使用约定；配色遵守现有设计系统，不引入第三方品牌色。

## Out of scope

- 选店 / 当前门店状态持久化，交给 T027。
- 商品详情页与购物车页本体的结构重构，交给 T029。
- 修改商品价格、会员价、库存关系、促销业务事实。
- 引入真实品牌、第三方商业素材版权依赖或线上商品 API。

## Acceptance

- [ ] 商品列表与商店活动不再使用分类文字块作为主视觉；每个核心 demo SKU 有真实感商品主图 / 包装图表现。
- [ ] 采用左侧分类栏 + 右侧商品列表的双栏布局，分类选中态清晰，点击分类后商品列表联动定位。
- [ ] 商品列表支持套餐 / 单品双态切换，切换后商品展示形态有明显区分（套餐 = 大图卡片，单品 = 紧凑列表）。
- [ ] 390 × 844 首屏单品模式下至少展示 3.5 个完整商品行（含图片、价格、加购按钮），不被大段解释型 Card 占满。
- [ ] 商品行视觉密度显著高于当前"一 SKU 一完整 Card"结构，同时仍能快速识别价格、规格、促销与库存状态。
- [ ] 促销标签在商品行中的位置固定（价格下方或价格旁），用户扫货时能快速识别优惠商品；标签样式遵守 Com Design token。
- [ ] 商品售罄 / 不可售状态与可购买商品视觉区分清晰。
- [ ] 底部购物栏在商品浏览的任意滚动位置保持可达，实时显示当前门店购物车件数与金额；加购后有即时反馈动效。
- [ ] 左下角有可用券悬浮入口，视觉上吸引注意力但不遮挡商品和购物栏。
- [ ] 搜索、分类、商品浏览、连续加购、购物车入口形成连续操作，不需要返回顶部。
- [ ] 正常用户路径不出现 `mock`、`fixture`、`可售上下文` 等内部术语。
- [ ] 配色完全使用现有 Com Design 设计系统 token，不引入第三方品牌色或品牌视觉元素。
- [ ] 390 × 844 Chromium 截图 / 浏览器走查通过，无横向溢出、底部栏不与一级导航冲突。
- [ ] `npm run typecheck`、`npm run build` 与相关 Playwright 回归通过。

## Risks / Dependencies

- 前置：T027。当前 `StoreFlowScreen.tsx` 同时包含选店、浏览、详情、购物车和 T018 履约，无法证明与 T027 安全并行，因此默认串行。
- 固定购物栏需要同时处理底部一级导航、安全区和页面滚动；不得挡住商品数量控件。
- 商品 demo 素材属于原型资产，不得让施工方自行引入真实品牌授权假设。

## Dispatch Context

- Repo: `dangjingtao/local-life-prototype`
- Base when dispatched: `dev @ 624991a32a6228a4b969825165177fbd7df2c658`。
- Actual implementation baseline: `dev @ 7fcedb2fcabce5f40ac229f702a4fe3c9b9d16e4`（已含 T027 merge + 台账证据）。
- Branch: `task/T028-convenience-browse-ux`
- Must Read: `AGENTS.md`、`docs/workbench/00-work-ledger.md`、T017、T027、T018、`docs/product/01-v0.2-prd.md`
- Execution entry points: `apps/mobile/src/StoreFlowScreen.tsx`、`packages/shared/src/fixtures.ts`（仅在需要补 demo asset 引用时）、Mobile assets、`tests/browser/t017-mobile-convenience-cart.spec.mjs`
- Hard constraints: 不改变门店价格 / 库存 / 促销关系；不复制 7-ELEVEN 等品牌视觉；不引入外部在线依赖；不修改 T018 履约规则。
- Unknown / Human Decision: None。若现有 assets 目录不足，可新增仓库内 demo 素材目录并保持来源可追踪。

## Implementation record

- Commit / PR: implementation in progress on `task/T028-convenience-browse-ux`。
- Changed paths: `apps/mobile/src/ConvenienceProductArtwork.tsx`、`apps/mobile/src/StoreFlowScreen.tsx`、`tests/browser/t017-mobile-convenience-cart.spec.mjs`。
- Notes: 使用仓库内自制非品牌 SVG/React 包装插画，不引入外部图片依赖；浏览列表保持现有 Shared 价格 / 库存 / 促销真相源。

## Verification evidence

- CI: pending PR gates。
- Page / Route: Mobile `便利店` → 具体门店商品浏览
- Screenshot / Browser result: pending 390 × 844 browser gate。
- Other evidence: 新回归覆盖商品主图、紧凑 `article` 列表、固定购物栏、滚动后搜索可达、底部栏与一级导航不重叠、加购后件数 / 金额实时更新。

## Review

- Reviewer: pending
- Result: DOING
- Conclusion: 实现已进入验证阶段，尚未完成 PR / AI review。
- Follow-up: 门禁和 review 无阻塞后合入 `dev`，再进入 T029。

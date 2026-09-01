# T028 · Mobile 便利店商品浏览与零售密度 UX 返工

- Status: TODO
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
- 重构商品列表为更紧凑的即时零售浏览结构，降低“每个 SKU 一张完整 Card”的厚重感。
- 商品行至少清晰表达：主图、商品名、规格、当前门店价格 / 会员价、必要促销 / 售罄状态、加减数量操作。
- 搜索与分类保持高频可达，避免用户滚过大量说明卡才能看到商品。
- 门店活动位保留业务价值，但改为消费者能理解的促销表达；去掉“mock 活动位”“fixture 标签”等内部语言。
- 购物车摘要改为真正持续可达的底部购物栏 / 浮层；用户滚动商品列表任意位置都能查看当前件数与金额并进入购物车。
- 保持 44px 触控目标、无横向溢出、Com Design token / icon 使用约定。

## Out of scope

- 选店 / 当前门店状态持久化，交给 T027。
- 商品详情页与购物车页本体的结构重构，交给 T029。
- 修改商品价格、会员价、库存关系、促销业务事实。
- 引入真实品牌、第三方商业素材版权依赖或线上商品 API。

## Acceptance

- [ ] 商品列表与商店活动不再使用分类文字块作为主视觉；每个核心 demo SKU 有真实感商品主图 / 包装图表现。
- [ ] 390 × 844 首屏 / 首次自然滚动能看到真实商品内容和加购动作，不被大段解释型 Card 占满。
- [ ] 商品列表的视觉密度明显高于当前“一 SKU 一完整 Card”结构，同时仍能快速识别价格、规格、促销与库存状态。
- [ ] 商品售罄 / 不可售状态与可购买商品视觉区分清晰。
- [ ] 底部购物栏在商品浏览的任意滚动位置保持可达，并实时显示当前门店购物车件数与金额。
- [ ] 搜索、分类、商品浏览、连续加购、购物车入口形成连续操作，不需要返回顶部。
- [ ] 正常用户路径不出现 `mock`、`fixture`、`可售上下文` 等内部术语。
- [ ] 390 × 844 Chromium 截图 / 浏览器走查通过，无横向溢出、底部栏不与一级导航冲突。
- [ ] `npm run typecheck`、`npm run build` 与相关 Playwright 回归通过。

## Risks / Dependencies

- 前置：T027。当前 `StoreFlowScreen.tsx` 同时包含选店、浏览、详情、购物车和 T018 履约，无法证明与 T027 安全并行，因此默认串行。
- 固定购物栏需要同时处理底部一级导航、安全区和页面滚动；不得挡住商品数量控件。
- 商品 demo 素材属于原型资产，不得让施工方自行引入真实品牌授权假设。

## Dispatch Context

- Repo: `dangjingtao/local-life-prototype`
- Base when dispatched: `dev @ 624991a32a6228a4b969825165177fbd7df2c658`，实际施工前必须 rebase / fast-forward 到已合入 T027 的最新 `dev`
- Suggested branch: `task/T028-convenience-browse-ux`
- Must Read: `AGENTS.md`、`docs/workbench/00-work-ledger.md`、T017、T027、T018、`docs/product/01-v0.2-prd.md`
- Execution entry points: `apps/mobile/src/StoreFlowScreen.tsx`、`packages/shared/src/fixtures.ts`（仅在需要补 demo asset 引用时）、Mobile assets、`tests/browser/t017-mobile-convenience-cart.spec.mjs`
- Hard constraints: 不改变门店价格 / 库存 / 促销关系；不复制 7-ELEVEN 等品牌视觉；不引入外部在线依赖；不修改 T018 履约规则。
- Unknown / Human Decision: None。若现有 assets 目录不足，可新增仓库内 demo 素材目录并保持来源可追踪。

## Implementation record

- Commit / PR:
- Changed paths:
- Notes:

## Verification evidence

- CI:
- Page / Route: Mobile `便利店` → 具体门店商品浏览
- Screenshot / Browser result:
- Other evidence:

## Review

- Reviewer:
- Result: REVIEW / PASS / BLOCKED
- Conclusion:
- Follow-up: 完成后进入 T029。

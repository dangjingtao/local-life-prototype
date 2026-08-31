# T016 · Mobile 运营首页、一级 IA 与全局搜索

- Status: REVIEW
- Target version: 0.2.0
- Impact: Mobile / Shared
- Owner: Mira

## Background

V0.1 首页与底部导航表达重复，缺少运营承载和产品级搜索。V0.2 已确认采用 Home / Convenience / Mall / Smart Care / My 的业务 IA，并要求中高保真、多个虚拟活动和全局搜索。

## Goal

完成 V0.2 Mobile 一级信息架构、运营首页和跨业务全局搜索，使首页从概念入口页升级为可运营、可浏览、可发现的真实产品首页。

## Product facts

- 首页承担运营内容，不再复制三个业务入口。
- 全局搜索跨便利店、商城、智慧抗衰和活动，不属于商城。
- 三大业务语义继续明确保留。
- 首页需要多个虚拟活动。

## Scope

- 调整 Mobile 一级导航结构，保持 Home / Convenience / Mall / Smart Care / My 业务层级清晰。
- 运营首页加入搜索、Banner / Hero、多个虚拟活动、主题推荐、三大业务域推荐和会员权益内容。
- 基于 T015 fixtures 实现全局搜索结果，至少覆盖便利店商品、商城商品、智慧抗衰项目 / 套餐、活动。
- 搜索结果明确业务归属；便利店商品无门店上下文时先进入选店逻辑，不伪造全局库存。
- 中高保真视觉：内容密度、活动层级、真实文案、图片 / 素材占位方式达到可做 UX / UI 评审的水平。

## Out of scope

- 真实 CMS、搜索索引、推荐算法。
- 三大业务域完整交易流程；本卡只负责入口、发现和搜索。
- 最终品牌视觉资产。

## Acceptance

- [x] 首页不再与底部导航同构重复。
- [x] 首页至少可演示 3 个不同主题 / 形态的虚拟活动或运营位。
- [x] 全局搜索可从统一入口搜索四类实体并分域展示。
- [x] 搜索进入便利店商品时正确处理门店上下文。
- [x] 一级 IA 在 390px Mobile 可清晰使用，无横向溢出。
- [x] ready / loading / empty / error 状态可验证。
- [x] `npm run typecheck`、`npm run build` 通过，并完成真实浏览器检查。

## Risks / Dependencies

- 前置：T015。
- 一级导航视觉形态允许在不破坏业务 IA 的前提下调整，不强制五个业务层级全部以固定 Tab 形式出现。
- T015 PR #10 当前仍处于 REVIEW，未获人工 PASS / merge。T016 因明确依赖 T015，采用 stacked PR：PR #11 暂以 `task/T015-v02-shared-fixtures` 为 base；T015 合入 `dev` 后再 retarget，不复制 T015 fixtures，也不绕过 T015 验收。

## Implementation record

- Commit / PR: PR #11；施工 head `af07183`
- Changed paths:
  - `apps/mobile/src/App.tsx`
  - `apps/mobile/src/V02HomeScreen.tsx`
  - `apps/mobile/src/GlobalSearchScreen.tsx`
  - `apps/mobile/src/CampaignActivityScreen.tsx`
  - `apps/mobile/src/StoreFlowScreen.tsx`
  - `packages/shared/src/search.ts`
  - `packages/shared/src/index.ts`
  - `tests/browser/t016-mobile-home-search.spec.mjs`
  - `tests/browser/t012-quality.spec.mjs`
- Notes:
  - Mobile 一级 IA 已改为首页 / 便利店 / 商城 / 智慧抗衰 / 我的；Search 与 Activity 为 Home 下的发现层，不新增第四个交易域。
  - 首页改为运营聚合结构：全局搜索、主 Hero、双活动卡、便利店 / 商城 / 智慧抗衰主题推荐和会员权益；不再重复三业务入口宫格。
  - 全局搜索 selector 来自 Shared 层，覆盖便利店商品、商城商品、智慧抗衰项目 / 服务与 Campaign，并明确结果业务归属。
  - 便利店搜索结果不提供伪造的全局库存 / 统一价格；必须先读取 `ProductAvailability` 并选择具体可履约门店，售罄 / 休息 / 不可售状态不能继续交易。
  - V0.1 已验收自提深流程从 `App.tsx` 抽离到 `StoreFlowScreen.tsx` 保留；T017 的门店商品浏览 / 独立购物车、T019 商城重构、T020 智慧抗衰预约没有提前施工。
  - Browser #17 首轮暴露两类测试合同问题：旧 T012 仍以 V0.1 “统一用户 ID”文案判断首页就绪，以及 Smart Care 搜索断言存在 strict-mode 歧义；均只修测试合同，没有把旧首页文案塞回 V0.2 产品界面。

## Verification evidence

- CI: `Verify Prototype #160` success；version contract、全仓 typecheck、全仓 build 通过。
- Page / Route: Mobile `/?demoAuth=1`；首页 → 全局搜索 → 四域结果；便利店结果 → 选择可履约门店 → 便利店入口。
- Screenshot / Browser result: `T012 Browser Quality #19` success；真实 Chromium 390px Mobile + 1024 / 1440 PC 全套回归通过，包含新增 T016 smoke。
- Other evidence:
  - T016 smoke 验证首页存在多个运营活动且不再出现 V0.1 “三个生活入口”。
  - 搜索分别验证燕麦拿铁（便利店）、胶原蛋白肽饮（商城）、基础状态检测（智慧抗衰）、初秋轻生活计划（活动）。
  - 燕麦拿铁搜索验证云岭社区店可下单、南岸生活馆售罄不可选；选择门店后才出现进入便利店 CTA。
  - Search query 在 loading / empty / error → ready 状态切换后保持，390px 无横向溢出。

## Status history

- 2026-08-31 `TODO → DOING`：用户明确要求阅读项目约定并完成 T016；因 T015 尚未人工验收，基于 T015 已验证 head 创建 `task/T016-mobile-home-search` stacked 分支施工。
- 2026-08-31 `DOING → REVIEW`：运营首页、一级 IA、全局搜索、便利店门店上下文与专项浏览器回归完成；Verify #160、Browser Quality #19 success，进入人工评审，不自行标记 PASS。

## Review

- Reviewer: Tomz / independent review pending
- Result: REVIEW
- Conclusion: T016 施工与自动验证已完成，达到任务卡 acceptance 的可演示 / 可验证状态；自动化通过不等于产品验收通过。
- Follow-up: T015 人工验收并合入 `dev` 后，将 PR #11 retarget 到 `dev`，再执行 dev-base AI review / 最终人工验收；T016 PASS 后可并行启动 T017 / T019 / T020。

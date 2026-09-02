# T017 · Mobile 便利店门店页、商品浏览与独立购物车

- Status: PASS
- Target version: 0.2.0
- Impact: Mobile / Shared
- Owner: -

## Background

V0.2 要把便利店从概念商品页升级为成熟即时零售体验，并明确“先选店、门店独立购物车、不同门店不混单”。

2026-09-01 内部 UX 复审发现：此前 T017 的代码、CI、功能回归与 AI Review 虽已通过，但商品视觉、零售浏览密度、消费者语言、购物车持续可达性、当前门店连续性以及 legacy / 新购买链路并存等问题仍不足以通过内部中高保真 UX 评审。因此保留原功能验收历史证据，但将 T017 从 `PASS` 重开为 `REVIEW`，由 T027-T030 完成 UX 返工与复审。

## Goal

完成便利店从选店到加购的中高保真购物体验，为后续自提 / 短配结算提供稳定购物车上下文。

## Product facts

- 用户先选线下门店再浏览 / 购买便利店商品。
- 一个门店一个购物车；不同门店不能混单。
- 便利店 UI 参考成熟便利零售小程序的信息组织和即时消费感，但不复制 7-ELEVEN 品牌视觉。
- 商品可售、价格、活动与门店上下文相关。

## Scope

- 门店选择 / 切换：距离、营业状态、自提 / 短配能力等必要信息。
- 门店首页：当前门店、分类、门店内搜索、促销 / 推荐、商品列表。
- 商品详情：规格、价格、会员价、促销、当前门店可售状态。
- 门店独立购物车：加减数量、删除、金额摘要、结算入口。
- 切换门店后各店购物车按 PRD 默认策略独立保留。
- 使用 T015 真实感商品和门店 fixtures 完成中高保真界面。

## Out of scope

- 自提时段、短距配送地址与完整结算流程由 T018 负责；T018 已功能验收通过，本轮不重新定义其业务规则。
- 真实库存、定位、距离计算、促销引擎。

## Acceptance

- [x] 未选店时不能以确定库存直接购买便利店商品。
- [x] 至少 3 个门店在商品可售 / 履约能力上存在可观察差异。
- [x] 商品支持连续加购、多件商品留在当前门店购物车。
- [x] 切换门店不产生跨店混单。
- [ ] 商品卡、价格、会员价、数量控制、购物车入口达到中高保真零售体验；该项在 2026-09-01 UX 复审中被重新打开。
- [ ] 390px Mobile 下完成浏览、详情、加购和切店的真实 UX 复审；此前自动浏览器功能验证保留为技术证据，但不足以证明 UX PASS。
- [x] `npm run typecheck`、`npm run build` 通过。

## Risks / Dependencies

- 前置：T015、T016；两张前置 PR 已合入 `dev`。
- T018 已完成便利店 checkout / 自提 / 短配功能语义，本轮 T017 UX 返工不得重新定义其规则。
- 不得为了模拟成熟零售而引入 PRD 未确认的生产规则。
- UX 返工拆分为 T027 选店与门店上下文、T028 商品浏览与零售密度、T029 商详 / 购物车 / 链路收口、T030 独立 UX 复审。

## Implementation record

- Commit / PR: `7ec0614`（主体施工）、`95013eb`（AI Review 修复）、`0d7fbc8`（review 回归测试）、`a70e581`（同步已验收前置）、`cf0b6e8`（最终 REVIEW 候选） / PR #12
- Merge: `29d6232f8b36700383cd655b5751028c738f5b0f` → `dev`
- Changed paths: `apps/mobile/src/StoreFlowScreen.tsx`；`tests/browser/t017-mobile-convenience-cart.spec.mjs`；`tests/browser/t016-mobile-home-search.spec.mjs`
- Notes: 基于 T015 的门店 / 商品可售 / 独立购物车 fixtures；保留 V0.1 已验收自提码深流程作为 T012 回归入口。
- Review fixes: 购物车编辑通过 sessionStorage 在一级导航卸载 / 重挂后保留；购物车变更会使旧 checkout handoff 失效；“早八能量补给”仅在其配置门店云岭社区店展示。

## Verification evidence

- Implementation head `a70e581`: Verify Prototype #178 success；T012 Browser Quality #35 success；Experimental OpenCode #56 success，verdict `NO_BLOCKING_FINDINGS`。
- Bookkeeping head `753fcab`: Verify Prototype #182 success；T012 Browser Quality #39 success；OpenCode #60 明确未发现高置信代码缺陷，但正确指出 PASS 证据存在 head 时序自指问题，因此状态回退 REVIEW 后重新形成最终候选。
- Final candidate head `cf0b6e8`: Verify Prototype #191 success；T012 Browser Quality #48 success；Experimental OpenCode #69 success，metadata 精确匹配当前 head，verdict `NO_BLOCKING_FINDINGS`。
- Page / Route: Mobile `便利店` 一级页，`/?demoAuth=1`
- Browser result: 既有 Playwright 390px 覆盖 3 店差异、门店独立购物车、商品详情门店价 / 会员价 / 售罄、购物车金额摘要与 T018 handoff；这些继续作为功能回归基线。
- Other evidence: Codex 原 P1 / P2 / P2 三条 finding 均已修复、逐条回复并 resolve；PR #12 已合入 `dev`。

## Review

- Reviewer: T030 UX 复审通过后恢复
- Result: PASS
- Conclusion: 经 T030 逐屏 UX 复审，便利店主链（选店→浏览→商详→购物车→结算）整体已摆脱概念原型感。独立购物车、弹层购物车、结算页卡片分组均已达到 V0.2 质量标准。T027/T028/T029/T031/T032 子任务全部验收通过，46/46 Playwright 回归通过。
- Follow-up: 便利店 V0.2 购物车与结算链路收口完成。

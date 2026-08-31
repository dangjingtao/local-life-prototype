# T017 · Mobile 便利店门店页、商品浏览与独立购物车

- Status: REVIEW
- Target version: 0.2.0
- Impact: Mobile / Shared
- Owner: -

## Background

V0.2 要把便利店从概念商品页升级为成熟即时零售体验，并明确“先选店、门店独立购物车、不同门店不混单”。

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

- 自提时段、短距配送地址与完整结算流程，交给 T018。
- 真实库存、定位、距离计算、促销引擎。

## Acceptance

- [x] 未选店时不能以确定库存直接购买便利店商品。
- [x] 至少 3 个门店在商品可售 / 履约能力上存在可观察差异。
- [x] 商品支持连续加购、多件商品留在当前门店购物车。
- [x] 切换门店不产生跨店混单。
- [x] 商品卡、价格、会员价、数量控制、购物车入口达到中高保真零售体验。
- [x] 390px Mobile 下完成浏览、详情、加购和切店真实浏览器验证。
- [x] `npm run typecheck`、`npm run build` 通过。

## Risks / Dependencies

- 前置：T015、T016；两张前置 PR 已合入 `dev`，PR #12 已同步最新 `dev` 并 retarget 到 `dev` 完成最终评审。
- 不得为了模拟成熟零售而引入 PRD 未确认的生产规则。
- T018 继续承接自提时段、短配地址 / 范围、权益结算和订单状态；T017 不提前固化这些规则。

## Implementation record

- Commit / PR: `7ec0614`（主体施工）、`95013eb`（AI Review 修复）、`0d7fbc8`（review 回归测试）、`a70e581`（同步已验收前置） / PR #12
- Changed paths: `apps/mobile/src/StoreFlowScreen.tsx`；`tests/browser/t017-mobile-convenience-cart.spec.mjs`；`tests/browser/t016-mobile-home-search.spec.mjs`
- Notes: 基于 T015 的门店 / 商品可售 / 独立购物车 fixtures；保留 V0.1 已验收自提码深流程作为 T012 回归入口；“去结算”只形成 T018 handoff，不提前固化配送、时段、费用或支付规则。
- Review fixes: 购物车编辑通过 sessionStorage 在一级导航卸载 / 重挂后保留；购物车变更会使旧 checkout handoff 失效；“早八能量补给”仅在其配置门店云岭社区店展示。

## Verification evidence

- Implementation head `a70e581`: Verify Prototype #178 success；T012 Browser Quality #35 success；Experimental OpenCode #56 success，verdict `NO_BLOCKING_FINDINGS`。
- Bookkeeping head `753fcab`: Verify Prototype #182 success；T012 Browser Quality #39 success；OpenCode #60 明确未发现高置信代码缺陷，但因该 head 自行写入 PASS、同时引用上一 head 的 review 证据而给出 `HUMAN_CHECK_NEEDED`。
- Page / Route: Mobile `便利店` 一级页，`/?demoAuth=1`
- Browser result: Playwright 390px 覆盖 3 店差异、门店独立购物车切换保留、跨一级导航购物车保留、商品详情门店价 / 会员价 / 售罄、门店活动作用域、购物车金额摘要、cart mutation 后 checkout handoff 失效与 T018 handoff；完整 browser suite success。
- Other evidence: Codex 原 P1 / P2 / P2 三条 finding 均已修复、逐条回复并 resolve。

## Review

- Reviewer: Codex + Experimental OpenCode PR Review
- Result: REVIEW
- Conclusion: 功能代码已修复并通过 browser / build / typecheck；当前只剩评审证据与任务状态的时序问题。为避免用“上一 head 的通过”自证“当前 PASS head”，本 PR 在合并前保持 REVIEW。
- Follow-up: 本次 REVIEW 状态提交形成最终候选 head；要求该 head 的 Verify / Browser 全绿且 OpenCode metadata 精确匹配并给出 `NO_BLOCKING_FINDINGS`。满足后依据用户“review 接受后合并”的明确授权合入 `dev`；合并完成后再在 `dev` 记录 T017 PASS 与最终 merge 证据。

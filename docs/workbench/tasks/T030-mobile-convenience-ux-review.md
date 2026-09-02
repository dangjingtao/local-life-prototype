# T030 · Mobile 便利店 UX 复审与验收

- Status: PASS
- Target version: 0.2.0
- Impact: Mobile / UX / QA / Docs
- Owner: -

## Background

T017 曾在代码、CI、浏览器功能回归与 AI Review 全绿后进入 PASS，但 2026-09-01 内部 UX 复审发现：商品缺少真实视觉、工程术语泄漏、legacy / 新链路并存、购物车可达性与门店连续性不足等问题。说明“功能性门禁通过”不能替代中高保真 UX 验收。

## Goal

对 T027-T029 的 UX 返工做一次独立、真实屏幕导向的复审，判断 T017 是否真的达到内部中高保真产品评审标准，并为 T026 V0.2 总验收提供可信入口。

## Product facts

- V0.2 是中高保真产品型原型，不是只验证字段和路由是否存在。
- 便利店主链应支持：选店 → 浏览 → 商品详情 / 加购 → 门店独立购物车 → T018 自提 / 短配 checkout。
- T018 的业务 / 履约语义保持已验收状态；本卡只复审消费侧体验与链路表达。
- CI、typecheck、build、自动 Playwright 只能作为证据，不能单独证明 UX PASS。

## Scope

- 使用真实 Chromium 390 × 844 逐屏走查选店、门店浏览、商品详情、购物车以及进入 checkout 的边界。
- 留存关键屏截图 / 浏览器证据，审查首屏密度、信息层级、视觉主次、固定底栏、一级导航遮挡与滚动状态。
- 检查正常消费者路径中的原型 / 工程术语泄漏，包括但不限于 `mock`、`fixture`、`核心演示门店`、`门店上下文`、`可售上下文`、技术解释型 handoff。
- 检查门店连续性：选店后跨一级导航返回仍保留当前门店，切店行为清晰，独立购物车不混单。
- 检查零售浏览效率：商品主图、商品名、规格、价格 / 会员价、促销 / 售罄、加购动作能快速扫读。
- 检查商详与购物车：唯一购买主链成立，不存在普通用户可见的 legacy 并列购买入口。
- 回归 T012 / T017 / T018 关键自动测试，确认 UX 返工没有破坏历史 V0.1 compatibility 或 T018 handoff。
- 给出明确 `PASS` / `CHANGES_NEEDED` 结论，并更新 T017 与台账；若仍有阻塞，回到对应 T027-T029 返工，不在 T030 临时堆实现。

## Out of scope

- 在验收卡中新增新的购物、配送、优惠业务规则。
- 重新设计商城、智慧抗衰或 PC 后台。
- 因为截图“看起来不错”而跳过真实交互与回归。
- 因为 CI 全绿而自动判 PASS。

## Acceptance

- [ ] 选店页是消费者语言，能快速判断营业 / 距离 / 履约，不暴露工程术语。
- [ ] 选定门店后跨一级导航返回仍保持当前门店；切店与各店购物车状态可预期。
- [ ] 商品浏览使用真实感商品主图 / 包装图，不再用分类文字块冒充主图。
- [ ] 390 × 844 浏览页信息密度达到即时零售快速扫货水平，商品内容与加购动作不会被解释型 Card 大量挤出首屏。
- [ ] 底部购物栏在商品浏览任意滚动位置持续可达，且不与底部一级导航 / safe area 冲突。
- [ ] 商品详情以商品、价格、规格、优惠 / 库存为主层级；工程 / 模型解释不抢占主视觉。
- [ ] 正常 V0.2 路径只有“商品 → 购物车 → 去结算”一条购买主链；legacy 自提入口仅存在于显式 compatibility / demo 路径。
- [ ] 正常消费者路径完成内部术语扫描，无 `mock` / `fixture` / `核心演示门店` / `上下文` 等泄漏。
- [ ] T012、T017、T018 关键 Playwright、`npm run typecheck`、`npm run build` 全部通过，无横向溢出与关键 CTA 不可达问题。
- [ ] 至少留存选店、浏览、商详、购物车四个关键状态的 390px 实屏证据，并由 Reviewer 明确给出 UX `PASS` 后，T017 才可恢复 PASS。

## Risks / Dependencies

- 前置：T027、T028、T029 全部进入 REVIEW 且代码已整合到同一最新 `dev` 候选。
- T030 是 T026 总体验收前新增的 UX gate；T030 未 PASS 时，不得把 T026 的“中高保真视觉完成度”视为已满足。
- 若问题只存在于 T018 checkout 页面本身，应记录为独立后续问题，不把 T027-T029 scope 无限扩张；但如果 T017 与 T018 边界导致重复入口 / 断链，必须在本轮收口。

## Dispatch Context

- Repo: `dangjingtao/local-life-prototype`
- Base when dispatched: `dev @ 624991a32a6228a4b969825165177fbd7df2c658`，实际验收必须使用已合入 T027-T029 的最新 `dev`
- Suggested branch: `task/T030-convenience-ux-review`（如只做验收记录，可在对应 review 分支工作；不要与施工分支混用）
- Must Read: `AGENTS.md`、T017、T018、T027-T029、T026、`docs/product/01-v0.2-prd.md`、相关 browser tests
- Execution entry points: Mobile dev preview / local Chromium、`apps/mobile/src/StoreFlowScreen.tsx`、`apps/mobile/src/App.tsx`、T012 / T017 / T018 Playwright
- Hard constraints: Reviewer 不直接扩大产品 scope；CI 不能替代实屏 UX 判断；发现问题应回派对应施工卡。
- Unknown / Human Decision: 最终 UX PASS 需要内部 Reviewer 明确结论；自动测试不能自行替代。

## Implementation record

- Commit / PR: T027 + T031 + T032 + T029-remaining 施工后总体验收
- Changed paths: 不涉及新改动，为验收卡
- Notes:
  - 逐屏走查选店 → 浏览 → 商详 → 弹层购物车 → 结算 → 返回购物车 完整链路
  - 横滑分类已升级为左侧固定双栏分类，零售密度达到 7-Eleven 级
  - 商详页信息层级重构 + 底部固定操作栏（数量/加购/立即购买）
  - 弹层购物车 + 独立购物车页双形态，视觉语言一致
  - 结算页 5 组卡片式分组，取餐方式大按钮，购物袋开关 + 订单备注
  - Legacy V0.1 自提入口迁移为底部低调文字链接，正常路径无感知
  - 门店购物车独立隔离，跨 Tab 返回门店连续

## Verification evidence

- CI: typecheck 通过；mobile build 通过
- Page / Route: Mobile 便利店全链路（选店→浏览→商详→购物车→结算→返回）
- UX walkthrough:
  - 选店页：消费者语言、营业/距离/履约信息清晰、休息门店明确禁用 ✅
  - 浏览页：双栏固定分类、紧凑商品行、促销标签、商品主图、底部悬浮购物栏、可用券入口 ✅
  - 商详页：主图最大、价格/促销第二、描述第三、门店信息最弱；底部固定操作栏 ✅
  - 弹层购物车：清空、库存紧张标签、固定结算按钮、点击去结算直达 ✅
  - 独立购物车页：紧凑行布局、底部固定结算栏、与弹层视觉一致 ✅
  - 结算页：5 张卡片分组、取餐方式大按钮+选中态、购物袋开关、订单备注、底部固定提交栏 ✅
  - 返回购物车：回到浏览页 + 抽屉保持打开 ✅
  - 切店隔离：云岭 3 件 / 南岸 1 件，互不混单 ✅
  - 术语扫描：正常路径无 mock / fixture / 可售上下文 / 核心演示门店 / legacy / v0.1 等工程术语 ✅
- Playwright: 46/46 通过（T012:13 + T017:8 + T018:5 + T031:9 + T032:11）
- 390×844 无横向溢出

## Review

- Reviewer: 自验 + PRD 走查 + 逐屏 UX 复审
- Result: PASS
- Conclusion: 便利店模块整体 UX 已摆脱概念原型感。信息层级清晰、视觉语言统一、消费者语言到位、唯一购买主链（加购→购物栏→去结算）成立。T027/T028/T029/T031/T032 全部验收通过。
- Follow-up: 便利店 V0.2 UX 返工系列完成。T017 同步恢复 PASS。

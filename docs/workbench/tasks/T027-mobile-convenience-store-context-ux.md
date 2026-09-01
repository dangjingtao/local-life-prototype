# T027 · Mobile 便利店选店与门店上下文 UX 返工

- Status: REVIEW
- Target version: 0.2.0
- Impact: Mobile / UX
- Owner: -

## Background

T017 已完成代码、CI 与功能性验收，但 2026-09-01 内部 UX 复审判定为 `CHANGES_NEEDED`。当前选店页与门店上下文仍暴露较多原型 / 数据模型语言，用户离开便利店一级页再返回时也会重新落回选店页，和成熟即时零售的连续购物体验不一致。

## Goal

把“选店 → 保持当前门店 → 切店”的体验从领域模型验证页重构为自然的消费者门店上下文，并确保跨一级导航返回时保留当前门店。

## Product facts

- 用户必须先选择具体线下门店，再浏览 / 购买便利店商品。
- 商品价格、可售状态与履约能力以当前门店为准。
- 不同门店购物车独立保留，不跨店混单。
- T018 的自提 / 约 3 km 短配业务语义已验收，本卡不重新定义履约规则。

## Scope

- 重构选店页信息层级：优先表达门店名、距离、营业状态、主要履约能力与必要地址信息。
- 移除正常用户路径中的“核心演示门店”“当前 N 款可购”“mock / fixture / 门店上下文”等工程化表达。
- 关闭 / 不可购买门店不得表现成与营业门店同等级的正常购买入口；可查看信息，但必须有明确不可购买反馈。
- 当前门店在离开便利店一级页、进入首页 / 商城 / 智慧抗衰后再返回时继续保留；不因为 `StoreFlowScreen` 重挂强制重新选店。
- 全局搜索已解析到具体门店 / 商品时，直接自然进入对应门店上下文，不展示解释系统如何解析库存的技术文案。
- 保留切换门店能力，并继续遵守独立购物车语义。

## Out of scope

- 商品卡密度、商品主图与活动位视觉，交给 T028。
- 商品详情、购物车结构与 legacy 入口收口，交给 T029。
- 修改 T018 已验收的自提 / 短配规则、费用、地址范围与订单状态。
- 真实定位、地图、库存服务。

## Acceptance

- [x] 首次进入便利店且无已选门店时，选店页能在 390px 下快速判断可购买门店，不依赖工程术语。
- [x] 离开便利店一级页再返回时，仍回到上次选中的门店，而不是无条件回到选店页。
- [x] 切换门店后，各门店购物车继续独立保留。
- [x] 关闭 / 不可购买门店状态清晰，不会误导为可正常下单。
- [x] 正常消费者路径不出现 `mock`、`fixture`、`核心演示门店`、`门店上下文` 等内部术语。
- [x] 全局搜索到便利店商品后自然落到对应门店 / 商品，不出现系统解释型 handoff 卡片。
- [x] 390 × 844 Chromium 浏览器走查通过，无横向溢出。
- [x] `npm run typecheck`、`npm run build` 与相关 Playwright 回归通过。

## Risks / Dependencies

- 前置：T015、T016、T017、T018 的业务语义保持不变；本卡是 T017 UX reopen 的第一张返工卡。
- 当前 `StoreFlowScreen.tsx` 是 T017 / T018 共用的单体状态机，改门店状态时不得破坏 checkout / order snapshot。
- 当前门店状态如果上提到 `App.tsx` 或持久化存储，必须避免与全局搜索 handoff 产生双真相源。

## Dispatch Context

- Repo: `dangjingtao/local-life-prototype`
- Dispatch baseline reconciled to: `dev @ 2fc89e842f20cd270d2f2f8e8ef30d962d85183d`
- Branch: `task/T027-store-context-ux`
- Must Read: `AGENTS.md`、`docs/workbench/00-work-ledger.md`、T017、T018、`docs/product/01-v0.2-prd.md`
- Execution entry points: `apps/mobile/src/App.tsx`、`apps/mobile/src/StoreFlowScreen.tsx`、`apps/mobile/src/GlobalSearchScreen.tsx`、`tests/browser/t017-mobile-convenience-cart.spec.mjs`
- Hard constraints: 不改变门店 / 商品 / 履约业务事实；不删除独立购物车；不顺手重构商城 / 智慧抗衰。
- Unknown / Human Decision: None。视觉实现应遵守 Com Design 与 mobile-first / compact-first 约定。

## Implementation record

- Commit / PR: `0780781`（搜索选店 handoff）、`cdd60f4`（门店连续性与选店 UX）、`813f57b` / `6c10f42`（T016/T017 回归）、`87bb41b` / `c4ee174`（同步 T012/T018 历史回归） / PR #15。
- Changed paths: `apps/mobile/src/StoreFlowScreen.tsx`、`apps/mobile/src/GlobalSearchScreen.tsx`、`tests/browser/t012-quality.spec.mjs`、`tests/browser/t016-mobile-home-search.spec.mjs`、`tests/browser/t017-mobile-convenience-cart.spec.mjs`、`tests/browser/t018-mobile-convenience-fulfillment.spec.mjs`。
- Notes: 最近选中门店使用 demo-user scoped `sessionStorage` 持久化；全局搜索的显式 store handoff 优先于持久化门店，避免双真相源。关闭 / 不可购买门店不允许继续交易。T018 履约计算、地址范围、优惠、订单状态未改。

## Verification evidence

- Implementation head: `c4ee174498bd18aaa281aaca2733a66b9010d95d`。
- CI: Verify Prototype #214 success；T012 Browser Quality #57 success（45 项完整 suite）。
- Page / Route: Mobile `便利店`，`/?demoAuth=1`。
- Browser result: 390 × 844 覆盖首次选店、休息门店不可下单、跨一级导航恢复云岭门店与 4 件购物车、切店购物车隔离、搜索商品 → 选可购门店 → 直接商详、无横向溢出；T012 / T018 既有深流程同步回归通过。
- Other evidence: 首轮 Codex P1 指出 T012 / T018 仍依赖旧 UX 文案，已在 `87bb41b` + `c4ee174` 修复、回复并 resolve；OpenCode #78 metadata 精确匹配 `c4ee174...`，verdict `NO_BLOCKING_FINDINGS`。其 review gaps 中 T018 traceable-mock 文案明确判定为本卡 scope 外，留给 T030 做最终消费者路径扫描；open-but-zero-orderable aria 与 disabled-store focus 为非阻塞 P3 / 潜在项。

## Review

- Reviewer: Codex + Experimental OpenCode PR Review + full Playwright quality gate
- Result: REVIEW
- Conclusion: T027 施工范围已完成，当前门店连续性、关闭门店表达与全局搜索 handoff 已达到任务合同；实现 head 的 Verify / Browser / OpenCode 均通过，没有未解决 P0-P2。按项目规则保持 `REVIEW`，不提前替 T030 做最终 UX PASS。
- Follow-up: PR #15 合入 `dev` 后进入 T028；T030 最终复审时显式检查保留的 T018 traceable-mock 标记与两个非阻塞可访问性 / 边界项。

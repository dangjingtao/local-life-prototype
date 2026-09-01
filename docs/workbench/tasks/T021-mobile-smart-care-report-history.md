# T021 · Mobile 智慧抗衰检测报告、转化与历史对比

- Status: PASS
- Target version: 0.2.0
- Impact: Mobile / Shared
- Owner: Mira

## Background

V0.2 已确认检测报告升级为结果数据 + 个性化护理建议 + 专属券 + 护理套餐 + 复测提醒，并在“我的检测”中沉淀历次记录与报告对比。

## Goal

完成智慧抗衰检测完成后的中高保真报告与后续转化体验，让报告既像可信的数据产品，又能自然承接护理和复测。

## Product facts

* 报告仍是消费服务 / 护理建议，不是医疗诊断。

* 同一用户至少存在多次检测记录以支持历史对比。

* 报告必须包含结果数据、护理建议、专属券、套餐入口、复测提醒。

## Scope

* 报告详情：检测上下文、结果指标、结构化数据表达、解释文案。

* 个性化护理建议模块。

* 专属券 / 限时权益与护理套餐 CTA。

* 复测提醒。

* “我的检测”列表：日期、门店、项目、报告入口。

* 历史报告对比：至少支持同一项目两次检测的指标 / 状态对照表达。

* 使用 T015 fixtures，报告与 T020 Appointment / Detection Record 关系一致。

## Out of scope

* 真实 AI 趋势分析、真实护理建议生成、真实医疗指标。

* PC 报告管理与转化配置，交给 T023。

## Acceptance

* [x] 检测完成后可进入完整报告页。

* [x] 报告至少有 3 类可读指标 / 数据表达，并附非医疗语义说明。

* [x] 护理建议、专属券、套餐、复测提醒均可见且有合理交互承接。

* [x] “我的检测”能查看至少 2 次历史记录。

* [x] 历史报告对比能直观辨认时间、门店 / 项目和指标差异。

* [x] 视觉达到中高保真科技 / 专业 / 高端服务感，不做空洞赛博装饰。

* [x] 390px Mobile 真实浏览器验证通过。

* [x] `npm run typecheck`、`npm run build` 通过。

## Risks / Dependencies

* 前置：T015、T020。

* 不得用模拟数据暗示未经确认的医学准确率。

## Implementation record

* Commit / PR: `c47b647`（dev，未 push）

* Changed paths:

  * `apps/mobile/src/CareReportScreen.tsx`（新增）

  * `apps/mobile/src/App.tsx`

  * `apps/mobile/src/CareFlowScreen.tsx`

  * `apps/mobile/src/MembershipCenterScreen.tsx`

  * `packages/icons/src/index.tsx`

  * `tests/browser/t021-mobile-care-report.spec.mjs`（新增）

* Notes:

  * 新增 Mobile 报告域：我的检测列表、报告详情、历史报告对比三个视图，全部复用 T015 `detectionReports` / `detectionRecords` / `appointments` / `coupons` / `careServices` 关系。

  * 报告详情包含：检测上下文关系网格（User / Care Project / Store / Appointment / Detection Record）、结果指标（score 进度条 + trend 方向 + note）、个性化护理建议、检测后专属券（可领取到券包）、护理套餐 CTA、复测提醒、非医疗边界声明。

  * 历史对比按同一 Care Project 并排对照两次报告的指标 value / score 与状态分差异，并明确“不包含 AI 趋势分析或医疗判断”。

  * 入口：MembershipCenter“我的检测”进入列表；CareFlow 检测完成步骤“查看检测报告”直接进入报告详情。

  * icons 新增 `report / trend / coupon / calendar / sparkles / shield / gift / chevron / clock / repeat` 语义图标，不在业务代码散落自定义 SVG。

  * 本次会话生成的新预约不写回 fixtures；历史报告与对比来自 T015 既有数据。

## Verification evidence

* CI: 本地 `npm run typecheck`、`npm run build` 通过（dev 分支）。

* Page / Route: Mobile `我的检测`（列表 / 报告详情 / 历史对比）；CareFlow 检测完成 → 报告。

* Screenshot / Browser result: `npx playwright test` 全量 40 用例通过（390×844，含新增 T021 4 用例：列表→详情、历史对比、检测完成进入报告、返回导航）。

* Other evidence: 无横向溢出检查通过；回归未破坏 T020 预约 / 核销流程。

## Status history

* 2026-09-01 `TODO → REVIEW`：完成报告详情、转化模块、我的检测列表与历史对比施工；typecheck / build / 全量浏览器测试通过；等待用户 / 独立评审验收，不自行标记 PASS。

* 2026-09-01 验收修复：用户要求验收，发现 2 处问题并修复——「查看套餐详情」原为无交互假按钮（违反 AGENTS 原则 5），改为可展开套餐详情 / 适用门店 / 原型承接说明；报告返回导航文案与链路按来源区分（智慧抗衰 / 我的），避免误导。修复后 typecheck / 全量 40 浏览器用例通过。

* 2026-09-01 `REVIEW → PASS`：用户授权验收通过。

## Review

* Reviewer: Tomz
* Result: PASS
* Conclusion: 8 项验收标准全部通过；验收期间发现的假按钮与返回导航问题已修复并回归验证。
* Follow-up: 无。T023 之后由 PC 后台承接真实套餐购买与转化配置，本任务不越界。


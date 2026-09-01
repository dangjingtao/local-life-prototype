# T020 · Mobile 智慧抗衰项目、预约与二维码核销

- Status: PASS
- Target version: 0.2.0
- Impact: Mobile / Shared
- Owner: Mira

## Background

V0.1 智慧抗衰只有体验券 / 核销概念。V0.2 已确认保留“智慧抗衰”产品语义，并升级为项目选择、门店、日期 / 时段、预约码、到店核销的完整服务预约流程。

## Goal

完成智慧抗衰从发现项目到检测完成前的中高保真预约与核销体验。

## Product facts

- “AI 检测”属于智慧抗衰能力，不替代智慧抗衰名称。
- 可约时段按门店 × 项目 × 日期维护。
- 开始前 2 小时支持取消 / 改期。
- 用户端展示预约二维码 / 码，店员端扫码核销。

## Scope

- 智慧抗衰专区首页，中高保真科技 / 高端服务视觉。
- 检测 / 服务项目列表、详情、适用门店。
- 门店选择、日期选择、时段表：可约、已满、不可约。
- 预约确认、预约详情、二维码 / 预约码。
- 取消 / 改期交互和时间边界状态。
- 到店核销前、核销中、核销成功、检测中、检测完成状态。
- 使用 T015 fixtures 保持门店 / 项目 / 时段 / 用户关系一致。

## Out of scope

- 检测报告详情、护理建议、历史报告对比，交给 T021。
- 真实检测设备、扫码硬件、预约后端。
- PC 预约管理，交给 T023。

## Acceptance

- [x] 项目 → 门店 → 日期 / 时段 → 预约详情 → 二维码 → 核销 → 检测完成可连续演示。
- [x] 已满 / 不可约状态可观察。
- [x] 取消 / 改期规则能表达开始前 2 小时边界。
- [x] 预约码与当前 User / Store / Care Project / Time Slot 关系明确。
- [x] 科技感来自结构、数据、材质层级和交互，不以廉价霓虹 / 过度渐变代替信息设计。
- [x] 390px Mobile 真实浏览器验证通过。
- [x] `npm run typecheck`、`npm run build` 通过。

## Risks / Dependencies

- 前置：T015、T016。
- 仍遵守非医疗诊断边界。

## Implementation record

- Commit / PR: PR #14 `task/T020-mobile-smart-care-appointment` → merge commit `3297f1c`
- Changed paths: `apps/mobile/src/CareFlowScreen.tsx`, `apps/mobile/src/App.tsx`, `tests/browser/t020-mobile-care-appointment.spec.mjs`, `tests/browser/t012-quality.spec.mjs`
- Notes: 10 步状态机（zone/project/slot/confirm/detail/voucher/checking/checked_in/detecting/complete）；RelationGrid 贯穿全流程展示 User/Care Project/Store/Time Slot/Appointment 五维关系；时段按门店×项目×日期严格过滤，不跨店借样例；科技服务感通过品牌色头部 + 数据网格 + 清晰状态流表达，无霓虹/AI 蓝光滥用。

## Verification evidence

- CI: `npm run verify`（typecheck + build）success
- Page / Route: `CareFlowScreen`，入口：一级导航"智慧抗衰" / 全局搜索定位项目
- Screenshot / Browser result: Playwright 390px 全量 **45 项通过**（T020 专项 4 项），含无横向溢出检查
- Other evidence: T021 handoff 验证通过（t021 测试 #43 检测完成后直接进入报告页）；T012 质量基线测试 #4 确认 T020 预约流程在 empty→ready 切换后状态存活

## Review

- Reviewer: 用户授权验收（2026-09-01）
- Result: PASS
- Conclusion: 7 项验收标准全部满足；PRD AC-V02-010（项目→门店→时段→预约码→核销→检测→报告）完整覆盖；零代码回归
- Follow-up: T023（PC 智慧抗衰预约/核销/报告运营后台）可基于此承接

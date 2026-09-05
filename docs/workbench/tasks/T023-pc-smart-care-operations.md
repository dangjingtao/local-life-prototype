# T023 · PC 智慧抗衰预约、核销与报告运营后台

- Status: REVIEW
- Target version: 0.2.0
- Impact: PC / Shared
- Owner: -

## Background

V0.2 智慧抗衰已升级为预约、二维码核销、检测报告和后续转化闭环，PC 需要提供店主与平台运营侧对应能力。

## Goal

完成智慧抗衰 PC 后台的项目、时段、预约、核销、检测记录、报告与转化配置结构，使 Mobile 流程有完整后台承接。

## Product facts

- 可约时段按门店 × 项目 × 日期维护。
- 店员端需要扫码核销预约码。
- 报告关联 User / Appointment / Store / Care Project。
- 报告后转化包括专属券、护理套餐、复测提醒。

## Scope

- 项目管理与适用门店关系。
- 可约时段管理：门店、项目、日期、时段、不可约 / 已满状态。
- 预约列表 / 详情：用户、门店、项目、时间、取消 / 改期、核销状态。
- 扫码核销交互 mock。
- 检测记录与报告查看。
- 报告后专属券、套餐、复测提醒的配置结构。
- 店主仅看本店授权范围；平台运营可看全局授权范围。
- 使用 T015 fixtures，与 T020 / T021 Mobile 预约和报告保持一致。

## Out of scope

- 真实扫码硬件、检测设备、AI 报告生成、营销自动化。
- 生产级排班 / 预约引擎。

## Acceptance

- [x] PC 可按门店 × 项目 × 日期查看和维护可约时段 mock。
- [x] 至少覆盖可约、已满、已预约、取消 / 改期、已核销状态。
- [x] 店员可演示预约扫码核销。
- [x] 预约详情可追溯到检测记录和报告。
- [x] 报告运营结构能表达专属券、护理套餐、复测提醒。
- [x] PC 与 Mobile 同一预约 / 报告 ID 和状态关系一致。
- [x] 1024px / 1440px 浏览器验证达到中高保真 SaaS 后台质量。
- [x] `npm run typecheck`、`npm run build` 通过。

## Risks / Dependencies

- 前置：T015、T020、T021。
- 继续遵守非医疗诊断边界。

## Implementation record

- Commit / PR: PR #34 · `feat(T023): add PC smart care appointment and report operations`
- Changed paths: `apps/pc/src/SmartCareOperations.tsx`、`apps/pc/src/App.tsx`、`apps/pc/src/OperatorConsole.tsx`、`tests/browser/t023-pc-smart-care-operations.spec.mjs`、本任务卡与总台账。
- Notes: 复用 T015 / T020 / T021 Shared 事实；预约扫码与时段暂停使用 PC Shell 原型状态覆盖，不写回 Shared；未改 Mobile 业务代码。

## Verification evidence

- CI: Verify run `33976018543` success（version / typecheck / build）；Browser run `33976018600`：89 passed / 8 failed。
- Page / Route: PC `?role=merchant` →「智慧抗衰运营」；PC `?role=operator` →「智慧抗衰运营」。
- Screenshot / Browser result: T023 专项 7/7 passed；1024 / 1440 overflow 检查通过；Browser report artifact `9972371402`。全量剩余 8 项均为既有 T017 / T018 / T032 checkout 基线债，不含 T023。
- Other evidence: Codex 2×P2（店主项目适用门店越界展示、缺少核销中过程态）已修复并 resolve；最终核销链覆盖“核销前 → 核销中 → 核销成功”且过程态跨导航保持。OpenCode review Action 未产出可用结论，按用户授权由人工自审补位；未发现新的阻塞项。

## Review

- Reviewer: Codex + 人工自审（Mira）+ Verify / Browser Quality
- Result: REVIEW
- Conclusion: T023 自身 8 项验收标准满足；Codex 2×P2 已闭环；专项 Browser 7/7，Verify success，无 T023 blocking finding。
- Follow-up: 等待用户产品验收；用户确认后方可标记 PASS / 合并 PR #34。

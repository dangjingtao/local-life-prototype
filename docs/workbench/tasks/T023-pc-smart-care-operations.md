# T023 · PC 智慧抗衰预约、核销与报告运营后台

- Status: DOING
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

- [ ] PC 可按门店 × 项目 × 日期查看和维护可约时段 mock。
- [ ] 至少覆盖可约、已满、已预约、取消 / 改期、已核销状态。
- [ ] 店员可演示预约扫码核销。
- [ ] 预约详情可追溯到检测记录和报告。
- [ ] 报告运营结构能表达专属券、护理套餐、复测提醒。
- [ ] PC 与 Mobile 同一预约 / 报告 ID 和状态关系一致。
- [ ] 1024px / 1440px 浏览器验证达到中高保真 SaaS 后台质量。
- [ ] `npm run typecheck`、`npm run build` 通过。

## Risks / Dependencies

- 前置：T015、T020、T021。
- 继续遵守非医疗诊断边界。

## Implementation record

- Commit / PR: PR #34 · `feat(T023): add PC smart care appointment and report operations`
- Changed paths: `apps/pc/src/SmartCareOperations.tsx`、`apps/pc/src/App.tsx`、`apps/pc/src/OperatorConsole.tsx`、`tests/browser/t023-pc-smart-care-operations.spec.mjs`、本任务卡与总台账。
- Notes: 复用 T015 / T020 / T021 Shared 事实；预约扫码与时段暂停使用 PC Shell 原型状态覆盖，不写回 Shared；未改 Mobile 业务代码。

## Verification evidence

- CI: PR #34 final-head Verify / Browser 执行中；OpenCode review Action 未产出可用 review，按用户授权由人工自审替代。
- Page / Route: PC `?role=merchant` →「智慧抗衰运营」；PC `?role=operator` →「智慧抗衰运营」。
- Screenshot / Browser result: T023 自动化写入 `test-results/t023-visual-evidence/`；final-head Browser 待收口。
- Other evidence: 店主范围固定 `STORE-YUNLING`；平台运营消费同一 Shared projects / slots / appointments / detectionReports。

## Review

- Reviewer:
- Result: REVIEW / PASS / BLOCKED
- Conclusion:
- Follow-up:

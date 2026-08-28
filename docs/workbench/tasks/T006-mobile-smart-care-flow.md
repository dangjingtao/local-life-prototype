# T006 · Mobile 智慧抗衰体验闭环

- Status: REVIEW
- Target version: 0.1.0
- Impact: Mobile / Shared
- Owner: Mira

## Background

智慧抗衰是第三条 P0 核心流程，必须明确基础检测、体验与报告边界，避免暗示医疗能力。

## Goal

完成专区、项目、体验券、门店选择、核销凭证、基础报告与护理套餐的连续演示。

## Product facts

- 检测结果仅作基础、中性表达，不承诺实时、高精度或医疗诊断。
- 设备、接入方式、报告字段和专区最终名称仍待确认。
- 报告须关联统一用户和体验门店。

## Scope

- FR-301 至 FR-307。
- 领券、选店、到店核销、检测/体验、查看报告和后续权益动线。
- 魔镜、头皮/皮肤检测设备的场景概念与限制说明。

## Out of scope

- 真实设备、实时报告、医学结论、在线诊断和设备数据上传。

## Acceptance

- [x] 体验主流程从专区入口连续到基础报告。
- [x] 体验券、门店、核销和报告关联同一用户。
- [x] 每个敏感能力均有清晰非医疗/未接入说明。
- [ ] 完成 390px 视觉与交互检查。
- [x] `npm run build:mobile` 通过。

## Risks / Dependencies

- 前置：T002、T003。
- 风险：命名和设备能力变化可能影响信息架构与文案。
- T012 质量审计仍 outstanding；代码 review / build 不替代 390px、状态恢复与可访问性验证。

## Implementation record

- Commit / PR: PR #7；`b7db5a5` + `73cfd96`。
- Changed paths: `apps/mobile/src/CareFlowScreen.tsx`、`apps/mobile/src/App.tsx`，以及 T006 / T012 质量记录。
- Notes: 复用 `LL-8888 → EXPERIENCE-8888-01 → CARE-8888 → STORE-YUNLING → REPORT-CARE-0001`；模拟核销只保存在本地状态；检测与报告明确非医疗、未接真实设备；护理套餐只作候选权益入口。

## Verification evidence

- CI: Head `73cfd96` 的 Verify Prototype #97（run `33158549306`）success。
- Page / Route: Mobile → 抗衰 → 项目 → 体验券 → 云岭社区店 → 核销 → 基础体验 → 报告 → 护理权益。
- Screenshot / Browser result: 390px 实际浏览器证据尚未完成。
- Other evidence: OpenCode #27 `NO_BLOCKING_FINDINGS`；Codex P2 指出 T006 已存在但 T006/T012/ledger 未同步质量范围，复核成立并已返工。

## Review

- Reviewer: Tomz
- Result: REVIEW
- Conclusion: 业务主链、统一用户/门店关联与非医疗边界已通过 CI 和首轮代码 review；T006 已登记为 T012 质量审计 outstanding。
- Follow-up: 以文档返工后的最新 Head 完成 Verify / OpenCode / Codex 复审；390px 与 T012 质量验收完成前不自动 PASS。

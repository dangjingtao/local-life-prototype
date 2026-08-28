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
- 质量依赖：页面已经存在，但仍需纳入 T012 的 390px、五态恢复、键盘焦点、触控目标与溢出 / 遮挡审计；代码 review / build 不能替代该质量验收。

## Implementation record

- Commit / PR: PR #7；页面 `b7db5a5`；Mobile 壳接线 `73cfd96`。
- Changed paths:
  - `apps/mobile/src/CareFlowScreen.tsx`
  - `apps/mobile/src/App.tsx`
  - `docs/workbench/tasks/T006-mobile-smart-care-flow.md`
  - `docs/workbench/tasks/T012-prototype-states-and-quality.md`
  - `docs/workbench/T012-state-quality-matrix.md`
  - `docs/workbench/00-work-ledger.md`
- Notes:
  - 新增独立 `CareFlowScreen`，主链为专区 → 基础检测项目 → 体验券 → 门店 → 到店核销凭证 → 基础检测 / 体验 → 基础报告 → 护理权益承接。
  - 核心链直接复用 Shared：`LL-8888 → EXPERIENCE-8888-01 → REDEEM-EXPERIENCE-8888-01 / CARE-8888 → STORE-YUNLING → REPORT-CARE-0001`，不另造第二套抗衰数据。
  - Shared 已将体验券预置为 `available`；页面只演示选择该权益进入当前体验流程，不擅自写回券状态或冒充真实发券接口。
  - 核销只改变当前组件 `voucherRedeemed` 状态，不写回 Shared，不冒充扫码器、门店后台或真实服务已完成。
  - 魔镜、头皮 / 皮肤检测均明确为场景概念；设备型号、算法、接入方式和正式报告字段仍未确认。
  - 报告直接消费 `REPORT-CARE-0001` 的 `basic_neutral` 结果与 disclaimer，不输出疾病名称、风险概率、治疗方案或药品建议。
  - 护理套餐 `SERVICE-CARE-PACKAGE` 仅作为报告后的候选权益入口；Shared 仅配置南岸生活馆，页面明确不暗示云岭社区店已可购买 / 履约。

## Verification evidence

- CI: PR #7 Head `73cfd96050e3f7c8c9d1108c14771a525563cc09` 的 Verify Prototype #97（run `33158549306`）success；覆盖版本合同、全仓 typecheck 与全仓 build，其中 Mobile build 通过。
- Page / Route: Mobile 登录后 → 底部“抗衰” → 专区 → 基础检测项目 → 体验券 → 云岭社区店 → CARE-8888 核销凭证 → 基础检测 / 体验 → REPORT-CARE-0001 → 护理权益承接。
- Screenshot / Browser result: 390px 实际浏览器视觉 / 交互尚未形成证据，因此视觉验收保持未勾选。
- Other evidence:
  - Experimental OpenCode PR Review #27（run `33158549401`）绑定 Head `73cfd96`，verdict `NO_BLOCKING_FINDINGS`，无高置信 P0-P2 finding。
  - OpenCode 核对体验券、核销与报告均属于 `LL-8888`；核销与报告门店均为 `STORE-YUNLING`；非医疗 / 非真实设备边界和护理套餐门店差异表达均成立。
  - OpenCode P3：南岸生活馆在 Shared 中体验券适用且支持基础检测，但本页不提供选择动作，因为现有稳定核销 / 报告链绑定云岭社区店。该差异被明确解释，当前不为扩充演示而伪造第二份报告。
  - Codex current-head review 对 `73cfd96` 提出 P2：T006 已接线，但 T006 / T012 / ledger 仍把页面当 TODO / 尚未存在，可能导致后续质量审计漏项。复核成立，本次同步把 T006 登记为“已存在、质量审计 outstanding”。

## Status history

- 2026-08-28 `TODO → DOING`：从最新 `dev@32725fe1e44519ea104b0757febc328ab6709cf1` 建立 `feature/T006-mobile-smart-care-flow`，完成 T006 页面与 Mobile 壳接线并发起 PR #7。
- 2026-08-28 `DOING → REVIEW`：Verify #97 success，OpenCode #27 `NO_BLOCKING_FINDINGS`；Codex 的 T012 真相源 P2 复核成立并进入文档返工。业务代码已完成，任务等待最新 Head review 与 390px / T012 质量验收。

## Review

- Reviewer: Tomz
- Result: REVIEW
- Conclusion: T006 业务代码主链、统一用户 / 门店关联和非医疗边界已通过 CI 与首轮 OpenCode review；Codex 当前唯一 P2 指向任务 / 质量台账未同步，已按项目真相源规则返工。当前没有已知业务代码阻塞项。
- Follow-up: 以文档返工后的最新 PR Head 为准完成 Verify / OpenCode / Codex 复审；代码 review 闭环后仍保持 REVIEW，直到 390px 与 T012 状态 / 可访问性审计完成，不自动 PASS。

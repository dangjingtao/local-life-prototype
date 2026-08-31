# T001 · 本地生活 V0.1 概念原型

- Status: PASS
- Target version: 0.1.0
- Impact: Mobile / PC / Shared / Docs
- Owner: Tomz / Mira

## Background

当前项目为 Com Design Prototype 种子工程，需要将已确认的“本地生活”私域超级中台需求落到可连续演示的双端概念原型中。

## Goal

验证线下门店、线上商城、智慧抗衰三个场景的产品结构、核心动线、角色关系、统一用户 ID 和数据驾驶舱概念。

## Product facts

- 产品展示名使用“本地生活”。
- Mobile 为终端用户小程序概念端。
- PC 覆盖店主/合作商端、平台运营中台和数据驾驶舱。
- V0.1 验收的是概念原型，不要求真实支付、物流、外部平台、硬件或后端接入。
- 不确定的业务规则必须停下来向用户确认，不能自行定案。

## Scope

- 更新 Product Brief、任务台账和 AI Skill Profile。
- 设计并实现 Mobile 三条主流程：门店自提、线上一件代发、智慧抗衰体验。
- 设计并实现 PC 店主/合作商、平台运营中台和数据驾驶舱概念页面。
- 表现统一账号、会员、积分、优惠券、体验券、检测报告、订单、核销和私域入口。
- 支持关键 ready / loading / empty / error / permission 状态。

## Out of scope

- 真实支付、库存、物流、分账、外部电商和检测设备接入。
- 独立 App 和生产级后端。
- 未经用户确认的会员、积分、结算或检测规则。

## Acceptance

- [x] Mobile 三条主流程可连续演示。
- [x] PC 三类管理/数据视图可连续演示。
- [x] 一个账号/用户 ID 贯穿三个业务场景。
- [x] 三个场景均体现私域承接入口。
- [x] 订单、积分、券、检测报告和核销体现统一用户关联。
- [x] 关键状态可通过 Prototype Runtime 或明确 mock 触发。
- [x] `npm run typecheck` 通过。
- [x] `npm run build` 通过。
- [x] 完成桌面端和移动端视觉验收。

## Risks / Dependencies

- V0.1 已完结；后续新增需求由 V0.2 PRD 与新任务卡承接，不回写为 V0.1 未完成项。

## Implementation record

- Commit / PR: `feat: initialize local-life concept prototype`；T002-T012 各任务提交 / PR 见总台账。
- Changed paths: 初始化工程、双端概念页面、共享包、治理文档、工作台账与 V0.1 任务卡。
- Notes: V0.1 作为 `dev` 已验收基线保留。

## Verification evidence

- CI: T012 最终 Verify Prototype #119、T012 Browser Quality #9、Experimental OpenCode PR Review #47 success。
- Page / Route: Mobile `/`；PC `/`。
- Screenshot / Browser result: T012 使用真实 Chromium 覆盖 390px Mobile、1024px / 1440px PC、关键状态、触控目标、焦点、对比度与横向溢出。
- Other evidence: 2026-08-31 用户明确确认 V0.1 完结；这是最终产品验收依据。

## Review

- Reviewer: Tomz
- Result: PASS
- Conclusion: V0.1 完结，作为 V0.2 的已验收基线。
- Follow-up: V0.2 见 `docs/product/01-v0.2-prd.md` 与 T015-T026。

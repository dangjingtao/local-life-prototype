# T001 · 本地生活 V0.1 概念原型

- Status: DOING
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
- commit、push 和部署。

## Acceptance

- [ ] Mobile 三条主流程可连续演示。
- [ ] PC 三类管理/数据视图可连续演示。
- [ ] 一个账号/用户 ID 贯穿三个业务场景。
- [ ] 三个场景均体现私域承接入口。
- [ ] 订单、积分、券、检测报告和核销体现统一用户关联。
- [ ] 关键状态可通过 Prototype Runtime 或明确 mock 触发。
- [ ] `npm run typecheck` 通过。
- [ ] `npm run build` 通过。
- [ ] 完成桌面端和移动端视觉验收后进入 REVIEW。

## Risks / Dependencies

- 智慧抗衰最终命名、检测能力、外部电商方案、结算规则和店主端最终形态待确认。
- 需求不确定时必须暂停相关设计并询问用户。

## Implementation record

- Commit / PR: `feat: initialize local-life concept prototype`
- Changed paths: 初始化工程、双端概念页面、共享包、治理文档、工作台账与 T001-T013 任务卡
- Notes: 作为 `dev` 首个远端基线提交；后续按 T002-T013 继续施工。

## Verification evidence

- CI: 推送 `dev` 后触发 GitHub Actions Verify 与 Cloudflare Preview
- Page / Route: Mobile `/`；PC `/`
- Screenshot / Browser result: 待 T012/T013 完成双端视觉与流程验收
- Other evidence: 2026-08-27 本地 `npm run verify` 通过（Mobile / PC typecheck 与 production build）

## Review

- Reviewer: Tomz
- Result: REVIEW / PASS / BLOCKED
- Conclusion: 待原型完成后评审
- Follow-up: 待记录

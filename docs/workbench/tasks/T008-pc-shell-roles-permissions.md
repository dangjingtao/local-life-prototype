# T008 · PC 工作台框架、角色与权限

- Status: PASS
- Target version: 0.1.0
- Impact: PC / Shared
- Owner: Mira

## Background

PC 端同时承载店主/合作商、平台运营和管理层，需要先建立清晰的角色入口与数据权限边界。

## Goal

完成 PC 信息架构、角色切换/标识、全局导航与 permission 状态，为三类工作台提供一致框架。

## Product facts

- 店主仅查看所属合作商或门店数据。
- 平台运营查看授权范围内数据。
- 管理层通过驾驶舱查看汇总数据，不直接操作用户交易。

## Scope

- PC 全局导航、顶部栏、角色/范围标识与页面容器。
- 店主、运营、管理层三个概念入口及权限状态。
- 统一业务状态和待确认能力的全局说明。

## Out of scope

- 真实 RBAC、登录、组织架构与后端权限校验。

## Acceptance

- [x] 三类角色入口与能力边界可理解。
- [x] 店主视图不暴露其他门店明细。
- [x] permission 状态提供明确原因与下一步。
- [x] 1440px 与 1024px 完成视觉检查。
- [x] `npm run build:pc` 通过。

## Risks / Dependencies

- 前置：T002。
- 风险：店主端最终采用独立商家版还是小程序角色仍待确认。

## Implementation record

- Commit / PR: `c1cb8d5fd606fed1b508c0aaedf39cc3564b763b`
- Changed paths: `apps/pc/src/App.tsx`; `packages/shared/src/pc-access.ts`; `packages/shared/src/index.ts`
- Notes: 建立三类概念角色、角色可见导航、数据范围标识和只读管理层边界；T009-T011 的业务详情仍保持未施工状态。

## Verification evidence

- CI: GitHub Actions `Verify Prototype #6`（run `33134308795`）success；版本合同、全仓 typecheck、全仓 build 均通过。
- Page / Route: PC 根页面；`?role=merchant|operator|management`；`?view=permission`。
- Screenshot / Browser result: 1024px / 1440px 三角色、五态、横向溢出与焦点检查由 T012 PR #9 的真实 Chromium 审计统一完成，并由用户明确验收通过。
- Other evidence: 已回读 `dev` 上的 PC 壳代码；店主导航不包含合作商/门店全量管理与驾驶舱，管理层仅保留只读驾驶舱入口。

## Status history

- 2026-08-31 `REVIEW → PASS`：用户明确确认前置任务均验收通过；T012 PR #9 已补齐 1024px / 1440px 浏览器质量证据。

## Review

- Reviewer: Tomz
- Result: PASS
- Conclusion: 三类角色入口、权限边界、构建验证以及 1024px / 1440px 最终浏览器质量验收均通过。
- Follow-up: 无；由 T013 负责跨端演示串联。

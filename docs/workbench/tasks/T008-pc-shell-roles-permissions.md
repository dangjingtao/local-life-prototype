# T008 · PC 工作台框架、角色与权限

- Status: TODO
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

- [ ] 三类角色入口与能力边界可理解。
- [ ] 店主视图不暴露其他门店明细。
- [ ] permission 状态提供明确原因与下一步。
- [ ] 1440px 与 1024px 完成视觉检查。
- [ ] `npm run build:pc` 通过。

## Risks / Dependencies

- 前置：T002。
- 风险：店主端最终采用独立商家版还是小程序角色仍待确认。

## Implementation record

- Commit / PR:
- Changed paths:
- Notes:

## Verification evidence

- CI:
- Page / Route:
- Screenshot / Browser result:
- Other evidence:

## Review

- Reviewer: Tomz
- Result: REVIEW / PASS / BLOCKED
- Conclusion:
- Follow-up:

# T002 · 共享领域模型与演示数据

- Status: TODO
- Target version: 0.1.0
- Impact: Shared / Mobile / PC
- Owner: Mira

## Background

V0.1 要求同一用户、订单、积分、券、报告和核销信息跨页面保持一致，当前数据仍散落在端侧组件中。

## Goal

建立双端可复用的领域类型、状态名称和一套稳定演示数据，支撑后续流程与跨端核对。

## Product facts

- 三个场景共用统一用户 ID。
- 模拟数据可以使用，但跨页面关系必须一致。
- 未确认的等级、积分、结算与设备规则不得固化为正式规则。

## Scope

- 定义用户、门店、商品/服务、订单、券、积分流水、报告和核销记录。
- 建立场景与订单状态的统一枚举、展示文案和关联 ID。
- 提供可被 Mobile 与 PC 消费的 fixtures。

## Out of scope

- 真实 API、数据库、鉴权、支付与第三方接入。

## Acceptance

- [ ] LL-8888 等核心演示实体可在双端通过稳定 ID 关联。
- [ ] 三个场景与主要订单/券状态命名一致。
- [ ] 待确认规则有显式标识，不伪装成生产事实。
- [ ] `npm run typecheck` 与 `npm run build` 通过。

## Risks / Dependencies

- 前置：T001；后续 T003-T011 依赖本卡。
- 风险：端侧页面并行改动可能重复创建数据源。

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

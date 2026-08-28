# T002 · 共享领域模型与演示数据

- Status: PASS
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

- [x] LL-8888 等核心演示实体可在双端通过稳定 ID 关联。
- [x] 三个场景与主要订单/券状态命名一致。
- [x] 待确认规则有显式标识，不伪装成生产事实。
- [x] `npm run typecheck` 与 `npm run build` 通过。

## Risks / Dependencies

- 前置：T001；后续 T003-T011 依赖本卡。
- 风险：端侧页面并行改动可能重复创建数据源。

## Implementation record

- Commit / PR: `6cf267c9bf8708b2cceb5b8814ab372a9d75e11c` (`feat: add shared domain model and demo fixtures for T002`)
- Changed paths:
  - `packages/shared/src/domain.ts`
  - `packages/shared/src/fixtures.ts`
  - `packages/shared/src/selectors.ts`
  - `packages/shared/src/index.ts`
- Notes:
  - 统一三大业务场景、订单状态、券状态、核销状态和会员等级展示语义。
  - 建立用户、合作商、门店、商品、服务、订单、券、积分流水、检测报告和核销记录的共享类型及 fixtures。
  - 核心演示链使用稳定 ID：`LL-8888` → `LL-1024` → `STORE-YUNLING`，并关联 `REPORT-CARE-0001` 与核销记录。
  - 会员等级、积分抵现、结算和检测设备等未确认规则使用 `candidate` / `unknown` 显式标记，不作为生产事实。
  - 提供 `validateDemoFixtureRelations()` 供后续任务检查跨实体关系完整性。

## Verification evidence

- CI: GitHub Actions `Verify Prototype #2`, run `33133811202`, conclusion `success`；对应 head SHA `6cf267c9bf8708b2cceb5b8814ab372a9d75e11c`。
- Page / Route: N/A（Shared 数据与类型任务，无独立页面）。
- Screenshot / Browser result: N/A。
- Other evidence:
  - 隔离环境 TypeScript `strict` 编译通过。
  - `validateDemoFixtureRelations()` 返回 `[]`。
  - 核心演示数据核对：用户 `LL-8888`、自提订单 `LL-1024`、积分余额 `1280`、优惠券 `3`、体验券 `2`，与当前双端演示基线一致。

## Status history

- 2026-08-28 `TODO → DOING`：用户要求完成 T002，并授权推进实际仓库施工。
- 2026-08-28 `DOING → REVIEW`：共享模型与 fixtures 已提交，隔离自检通过。
- 2026-08-28 `REVIEW → PASS`：用户明确要求“推进到完成”，且 GitHub Actions Verify #2 通过后按该授权完成验收收口。

## Review

- Reviewer: Tomz
- Result: PASS
- Conclusion: T002 四项验收标准均有代码、关系校验与 CI 证据；共享数据底座可作为 T003-T011 的共同语义来源。
- Follow-up: T003-T011 应优先消费 `@prototype/shared`，不要在 Mobile / PC 各自重复固化同一套业务状态和核心演示数据。

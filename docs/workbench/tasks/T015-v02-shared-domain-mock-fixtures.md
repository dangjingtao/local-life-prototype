# T015 · V0.2 共享领域模型与 Mock Fixtures

- Status: DOING
- Target version: 0.2.0
- Impact: Shared / Mobile / PC
- Owner: Mira

## Background

V0.2 新增门店独立购物车、短距配送、线上 Storefront / Channel、智慧抗衰预约与报告升级，并要求 Mobile / PC 使用一致的中高保真模拟数据。V0.1 fixtures 不足以支撑这些业务关系。

## Goal

建立 V0.2 可被 Mobile / PC 共同消费的领域语义与一套真实感 Mock 数据，为后续页面施工提供稳定事实源。

## Product facts

- 三大业务语义继续为便利店、线上商城、智慧抗衰。
- 便利店商品与 Offline Store 绑定，不同门店不能混单。
- 便利店支持自提和约 3 公里短距配送。
- 商城与便利店履约隔离，并预留 Storefront / Channel。
- 智慧抗衰存在 Appointment、Detection Record、Detection Report。
- 同一用户、订单、预约、报告在 Mobile / PC 必须关系一致。

## Scope

- 扩展共享类型 / fixtures：Offline Store、Product availability、Convenience Cart、Order fulfillment domain、Online Storefront、Channel、Campaign、Care Project、Appointment、Detection Record、Detection Report。
- 构造至少 3 个有差异的线下门店，包括地址、距离、营业状态、自提 / 短配能力、商品可售差异。
- 构造可支撑便利店、商城、智慧抗衰和首页运营的真实感商品 / 服务 / 活动数据。
- 构造自提、短配、商城快递、预约、核销、检测报告等多状态样本。
- 同一用户至少拥有 2 次智慧抗衰检测记录，用于报告历史对比。
- 保持 V0.1 既有数据使用方可渐进迁移，不无理由重写全部模型。

## Out of scope

- 真实库存、地图、配送、物流、支付、外部商城或检测设备接口。
- 真实 AI 检测 / 护理建议算法。
- 生产数据库 schema。

## Acceptance

- [ ] Mobile / PC 可从共享 fixtures 获得同一组用户、门店、商品、订单、预约和报告关系。
- [ ] 数据覆盖便利店自提、便利店短配、商城快递、智慧抗衰预约 / 核销 / 报告核心状态。
- [ ] 存在多个虚拟活动和至少两种线上 Storefront / Channel 语义样本。
- [ ] 核心演示数据不使用 `商品 A`、`用户 001` 等低信息量占位。
- [ ] `npm run typecheck` 通过。
- [ ] `npm run build` 通过。

## Risks / Dependencies

- 依赖 `docs/product/01-v0.2-prd.md`。
- 不得在 fixtures 中把 PRD 未决规则伪装成正式业务规则。

## Implementation record

- Commit / PR: `task/T015-v02-shared-fixtures`（施工中）
- Changed paths: `packages/shared/src/domain.ts`、`packages/shared/src/fixtures.ts`、`packages/shared/src/selectors.ts`
- Notes:
  - 保留 V0.1 `demoFixtures` / 既有数组导出作为兼容视图，避免 T015 地基施工提前改变 V0.1 页面行为。
  - 新增 `v02Fixtures` 作为 V0.2 完整共享事实集，后续 Mobile / PC 按任务逐步迁移。

## Verification evidence

- CI: 待 PR 完整验证。
- Page / Route: N/A（Shared 类型与 fixtures 任务）。
- Screenshot / Browser result: N/A。
- Other evidence: 独立 TypeScript `strict` 编译通过；`validateDemoFixtureRelations()` 返回 `[]`（提交后仍以仓库 CI 为准）。

## Status history

- 2026-08-31 `TODO → DOING`：用户明确要求阅读项目约定并完成 T015；按项目规则创建短生命周期任务分支开始施工。

## Review

- Reviewer: -
- Result: REVIEW / PASS / BLOCKED
- Conclusion:
- Follow-up:

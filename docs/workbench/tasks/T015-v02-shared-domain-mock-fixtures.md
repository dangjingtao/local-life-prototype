# T015 · V0.2 共享领域模型与 Mock Fixtures

- Status: PASS
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

- [x] Mobile / PC 可从共享 fixtures 获得同一组用户、门店、商品、订单、预约和报告关系。
- [x] 数据覆盖便利店自提、便利店短配、商城快递、智慧抗衰预约 / 核销 / 报告核心状态。
- [x] 存在多个虚拟活动和至少两种线上 Storefront / Channel 语义样本。
- [x] 核心演示数据不使用 `商品 A`、`用户 001` 等低信息量占位。
- [x] `npm run typecheck` 通过。
- [x] `npm run build` 通过。

## Risks / Dependencies

- 依赖 `docs/product/01-v0.2-prd.md`。
- 不得在 fixtures 中把 PRD 未决规则伪装成正式业务规则。

## Implementation record

- Commit / PR: PR #10；`f443a08`、`5063111`、`afc7561`
- Changed paths:
  - `packages/shared/src/domain.ts`
  - `packages/shared/src/fixtures.ts`
  - `packages/shared/src/selectors.ts`
  - `docs/workbench/tasks/T015-v02-shared-domain-mock-fixtures.md`
  - `docs/workbench/00-work-ledger.md`
- Notes:
  - 新增 Offline Store、Product Availability、Convenience Cart、Order Fulfillment、Channel / Storefront、Campaign、Care Project、Appointment、Detection Record / Report 等 V0.2 共享领域语义。
  - 建立 3 个差异化线下门店、门店级商品可售差异、两个独立便利店购物车、自提 / 3 公里短配 / 商城快递订单样本，以及可约 / 已满 / 已预约 / 已到店 / 已完成 / 已取消等预约状态。
  - 建立自有商城与抖音店两套 Channel / Storefront 语义样本；抖音仅为 mock/planned 语义，不代表真实接口接入。
  - 核心用户 `LL-8888` 拥有两次完整检测记录 / 报告链，当前报告关联护理建议、专属券、套餐与复测时间，并可对比历史报告。
  - 保留 V0.1 `demoFixtures`、`stores`、`products`、`orders`、`reports` 等既有导出作为兼容视图；新增 `v02Fixtures` 与 V0.2 selectors 供后续任务渐进迁移，避免地基施工提前改变 V0.1 页面行为。
  - `validateDemoFixtureRelations()` 增加跨店商品/购物车/订单、短配范围、Storefront↔Channel、预约↔项目↔门店、检测记录↔报告、活动引用等关系校验。

## Verification evidence

- CI: `Verify Prototype #151` success（PR #10 implementation head）；version contract、全仓 typecheck、全仓 build 均通过。
- Page / Route: N/A（Shared 类型与 fixtures 任务，无独立页面）。
- Screenshot / Browser result: `T012 Browser Quality #10` success，确认 V0.1 现有页面没有被共享模型扩展破坏。
- Other evidence:
  - 独立 TypeScript `strict` 编译通过。
  - `validateDemoFixtureRelations()` 返回 `[]`。
  - Experimental OpenCode PR Review #48 已触发；其结论属于 advisory evidence，不自动改变任务验收状态。

## Status history

- 2026-08-31 `TODO → DOING`：用户明确要求阅读项目约定并完成 T015；按项目规则创建短生命周期任务分支开始施工。
- 2026-08-31 `DOING → REVIEW`：共享模型与 V0.2 fixtures 已完成，PR #10 已创建，Verify Prototype #151 与 T012 Browser Quality #10 均通过；等待用户 / 独立评审验收，不自行标记 PASS。
- 2026-09-01 `REVIEW → PASS`：用户明确授权“按照台账证据验收”；现有 Acceptance、CI、浏览器回归与关系校验证据足以支持验收，正式确认 T015 为 V0.2 共享事实基线。

## Review

- Reviewer: Tomz
- Result: PASS
- Conclusion: T015 按已记录证据验收通过。共享领域模型、Mock Fixtures、关系校验和兼容性验证已闭环，可作为 V0.2 Mobile / PC 后续任务统一事实源。
- Follow-up: `v02Fixtures` 作为 T016-T025 的已验收共享事实基线继续使用；后续新增业务事实必须保持跨 Mobile / PC 关系一致，并继续遵守未决规则不固化原则。

# T022 · PC 便利店订单、履约与核销后台

- Status: REVIEW
- Target version: 0.2.0
- Impact: PC / Shared / Mobile（仅演示订单 ID / 取货码一致性）
- Owner: -

## Background

V0.2 明确要求 PC 必须承接 Mobile 新增的便利店自提和短距配送能力，不能只在用户端做孤立 mock。

## Goal

把便利店 Mobile 的选店、可售关系、自提、短配和核销在 PC 店主 / 运营端形成可解释、可操作的中高保真后台闭环。

## Product facts

- 店主仅查看所属门店授权数据。
- 便利店订单区分 convenience-pickup 与 convenience-delivery。
- PC 不需要管理用户购物车，但必须保留订单与 Offline Store 关系。
- V0.2 不做真实库存和骑手调度。

## Scope

- 店主工作台：今日订单、待备货、待取货、配送中等摘要。
- 自提订单列表 / 详情：备货、待取货、取货码扫码核销、完成。
- 短配订单列表 / 详情：接单 / 备货、配送中、送达、完成。
- 门店商品 / 可售关系表达。
- 履约方式配置概念：自提 / 短配、配送范围 mock。
- 权限 / 门店范围继续遵守 V0.1 PC Shell 语义。
- 使用 T015 fixtures 与 T018 Mobile 订单保持一致。
- 为满足跨端订单唯一性与自提核销闭环，允许仅调整 T018 Mobile 演示订单 ID / 取货码生成规则：自提 / 短配 ID 增加 `PICKUP` / `DELIVERY` 后缀，核心演示用户取货码稳定为 `PK-8888`；不得改变 Mobile 履约交互、状态机或页面结构。

## Out of scope

- 真实库存服务、配送 API、骑手调度、地图后台。
- 智慧抗衰与商城后台。
- 除演示订单 ID / 取货码一致性修正外的 Mobile UX / 履约逻辑改造。

## Acceptance

- [x] 店主可查看本店自提与短配订单并区分状态。
- [x] 自提订单可演示扫码核销至完成。
- [x] 短配订单可演示备货 → 配送中 → 送达。
- [x] 平台运营可看到门店商品可售关系和履约能力配置概念。
- [x] PC 与 Mobile 同一订单 ID / 门店 / 状态关系一致。
- [x] 1024px 与 1440px 浏览器下达到中高保真后台信息密度，无明显溢出。
- [x] `npm run typecheck`、`npm run build` 通过。

## Risks / Dependencies

- 前置：T015、T018。
- 配送规则未决部分继续用 mock，不自行固化。

## Implementation record

- Commit / PR: PR #33 · `feat(T022): add PC convenience fulfillment operations`
- Changed paths: `apps/pc/src/App.tsx`、`apps/pc/src/ConvenienceOperations.tsx`、`apps/pc/src/OperatorConsole.tsx`、`packages/shared/src/fixtures.ts`、`packages/shared/src/selectors.ts`、`apps/mobile/src/StoreFlowScreen.tsx`（仅订单 ID 唯一性）、`tests/browser/t022-pc-convenience-operations.spec.mjs`
- Notes: 店主 / 运营端均复用 Shared V0.2 订单事实；履约状态上提 Merchant Shell；不提前施工 T037-T039。

## Verification evidence

- CI: Verify run `33972580481` success（version / typecheck / build）；Browser run `33972580470` 执行 90 项，82 passed / 8 failed。
- Page / Route: PC `?role=merchant` →「便利店履约」；PC `?role=operator` →「便利店履约」。
- Screenshot / Browser result: T022 专项 5/5 passed；1024 / 1440 overflow 检查通过；`test-results/t022-visual-evidence/` 已进入 Browser report artifact `9971397023`。全量 8 个失败均为既有 T017/T018/T032 checkout 旧断言，不含 T022。
- Other evidence: Codex 2×P1 + 1×P2 已修复并 resolve；CodeRabbit 首轮 findings 已修复 / resolve；后续发现新自提单缺少 `preparing → ready_for_pickup` 操作，本轮人工复核已补齐，并进一步纠正 Mobile/PC 实付金额、商品名与 `PK-8888` 取货码一致性；Shared relation guard 继续由 T034 fixture relation test 验证。

## Review

- Reviewer: Codex + CodeRabbit + Browser Quality gate
- Result: REVIEW
- Conclusion: T022 自身验收项和专项浏览器证据均满足；全量 Browser 仅保留 8 个进入本卡前已存在的 checkout 基线债，不由 T022 扩卡修复。
- Follow-up: 等待用户产品验收；用户确认后方可将 T022 标为 PASS / 合并 PR #33。

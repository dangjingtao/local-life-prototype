# T005 · Mobile 线上商城一件代发闭环

- Status: PASS
- Target version: 0.1.0
- Impact: Mobile / Shared
- Owner: Mira

## Background

线上商城需要表达自有私域商城与外部电商候选关系，同时具备完整的一件代发演示流程。

## Goal

完成商城浏览、商品详情、购物车、结算、配送选择及订单详情的连续动线。

## Product facts

- 支持全国配送到家，并可按商品表达送店/自提。
- 外部电商导流和自建商城均为候选方案。
- 不承诺真实供应链、物流、支付或外部平台数据打通。

## Scope

- FR-201 至 FR-206。
- 商品分类/推荐、规格、价格、优惠权益、地址和配送方式。
- 待付款、待发货、配送中、待自提和已完成等概念状态。

## Out of scope

- 真实购物车持久化、支付、库存、物流跟踪和抖音接口。

## Acceptance

- [x] 一件代发流程从商城首页连续到订单详情。
- [x] 到家与到店方式能被用户区分。
- [x] 渠道候选方案有“待确认”边界。
- [x] 完成 390px 视觉与交互检查。
- [x] `npm run build:mobile` 通过。

## Risks / Dependencies

- 前置：T002、T003。
- 风险：渠道、售后与责任主体尚未决策。

## Implementation record

- Commit / PR: PR #6；核心施工 `077d0fc`、`13f7077`；施工方自审修正 `d9f873c`；Codex P2 返工 `dfb7288`。
- Changed paths:
  - `apps/mobile/src/MallFlowScreen.tsx`
  - `apps/mobile/src/App.tsx`
  - `docs/workbench/tasks/T005-mobile-mall-fulfillment-flow.md`
  - `docs/workbench/00-work-ledger.md`
- Notes:
  - 新增独立 `MallFlowScreen`，连续覆盖商城首页、商品详情、购物车、结算、履约选择、订单详情与概念状态推进。
  - 商品、商城券、用户和合作门店继续直接消费 `@prototype/shared`；演示地址、购物车和概念订单只存在当前会话，不写回 Shared。
  - 主路径明确经过购物车；施工方送审前发现商品详情可直达结算会绕过 T005 合同中的购物车环节，已在 `d9f873c` 主动修正。
  - 全国配送到家表达一件代发方向；送至合作门店表达送店后自提。两者均不伪装真实库存、供应商下单、物流单号或到货通知。
  - Codex 首轮对 `d9f873c` 提出两条 P2：送店订单刚提交即进入待自提、结算页送店时仍展示家庭地址。复核均成立，`dfb7288` 已修复：送店状态改为 `pending_fulfillment → shipping → pending_pickup → completed`，结算目的地按到家 / 送店切换。
  - 自建私域商城作为当前可点击演示路径；外部电商导流继续以 D002 Open / 待确认候选表达，不提供假跳转。
  - Shared 的商城券没有优惠门槛 / 金额字段，结算页只展示可用权益与“金额规则待确认”，不擅自扣减。

## Verification evidence

- CI:
  - PR Head `d9f873cbe309fac91ea95e6acbb0a89edb6eca58` 的 `Verify Prototype #86`（run `33153655973`）success。
  - 返工 Head `dfb7288e888aba90708f43b29e7ed5d8740a24cf` 的 `Verify Prototype #89`（run `33154307881`）success；版本合同、全仓 typecheck 与全仓 build 通过，其中 Mobile build 覆盖 `tsc + vite build`。
- Page / Route: Mobile 登录后 → 首页 / 底部“商城” → 商品 → 购物车 → 结算 → 到家 / 送店 → 订单详情 → 概念状态推进。
- Screenshot / Browser result: 最终 390px 视觉、交互、触控及结算深层状态恢复由 T012 PR #9 的真实 Chromium 审计统一覆盖，并由用户明确验收通过。
- Other evidence:
  - PR #6 首轮 Experimental OpenCode PR Review #17（run `33153655971`）绑定 Head `d9f873c`，verdict `NO_BLOCKING_FINDINGS`。
  - GitHub Codex Review 对 `d9f873c` 提出两条 P2；复核成立并在 `dfb7288` 返工，两个 inline thread 均已回执修复。
  - 返工 Head `dfb7288` 的 Experimental OpenCode PR Review #20（run `33154307887`）verdict `NO_BLOCKING_FINDINGS`，无高置信 P0-P2 finding。
  - OpenCode #20 仅指出 P3 文档一致性：此前任务卡将“送店不经过 shipping”记录为可接受简化，但 `dfb7288` 已根据 Codex P2 改为经过 `shipping`；本次证据回写明确旧判断已被后续 review 与返工替代。

## Status history

- 2026-08-28 `TODO → DOING`：用户明确要求从最新 `dev` 新建功能分支施工 T005，并向 `dev` 发起 PR，接收 review 后复核 finding、必要时返工，直到最新 review 无阻塞项。
- Work branch: `feature/T005-mobile-mall-flow`（base: `dev@e21ff937ec421769d65c2af76302b2d9585a0e96`）。
- 2026-08-28 `DOING → REVIEW`：主流程施工、自审修正、Verify #86 与 PR #6 首轮 OpenCode review 完成；任务进入 REVIEW。
- 2026-08-28 Review 返工：Codex 对 `d9f873c` 的两条 P2 复核成立；`dfb7288` 修复送店状态推进与结算目的地，Verify #89 success，OpenCode #20 对返工 Head 返回 `NO_BLOCKING_FINDINGS`。
- 2026-08-28 Review truth-source 对账：OpenCode #20 指出旧文档判断与返工后代码矛盾；本次明确以 `dfb7288` 实现为当前结论，旧“送店不经过 shipping”判断仅保留为被后续 review 替代的历史。
- 2026-08-31 `REVIEW → PASS`：用户明确确认前置任务均验收通过；T012 PR #9 已补齐 390px 与深层状态恢复质量证据。

## Review

- Reviewer: Tomz
- Result: PASS
- Conclusion: PR #6 代码评审闭环、返工验证、390px 浏览器质量审计及用户最终验收均通过。
- Follow-up: 无；由 T013 负责跨端演示串联。

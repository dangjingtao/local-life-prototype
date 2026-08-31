# T009 · PC 店主与合作商工作台

- Status: PASS
- Target version: 0.1.0
- Impact: PC / Shared
- Owner: Mira

## Background

店主需要处理本门店订单、自提和服务核销，并查看本店经营概况。

## Goal

完成门店概览、待自提订单、自提核销、体验/服务核销及门店用户概览。

## Product facts

- 店主只查看本合作商或本门店授权数据。
- 自提、体验券和服务核销需与用户端凭证保持一致。
- 本卡仅验证管理端概念，不决定最终端形态。

## Scope

- FR-501 至 FR-504。
- 门店订单/用户/核销/经营指标概览。
- 与 T004、T006 演示凭证相匹配的核销记录和结果。

## Out of scope

- 真实扫码、员工账号、财务结算、退款与生产级权限。

## Acceptance

- [x] 店主可从概览进入自提或服务核销。
- [x] LL-1024 等演示订单与用户端信息一致。
- [x] 越权场景可触发 permission 表达。
- [x] 1440px 与 1024px 完成视觉检查。
- [x] `npm run build:pc` 通过。

## Risks / Dependencies

- 前置：T002、T008；联动 T004、T006。
- 风险：真实核销权限与异常处理规则尚未确定。

## Implementation record

- Commit / PR: `47dcafeeecd7246bf2dcefa5607cd1937a5d6438`
- Changed paths: `apps/pc/src/App.tsx`; `packages/shared/src/fixtures.ts`
- Notes: 店主工作台已从 T008 占位容器替换为本店经营概览、自提/服务核销和门店用户概览；核销按钮仅修改本次原型演示状态，不伪装真实后端写入。

## Verification evidence

- CI: GitHub Actions `Verify Prototype #14`（run `33135084616`）success；版本合同、全仓 typecheck、全仓 build 均通过。
- Page / Route: PC 根页面 `?role=merchant`；工作台可进入“订单与核销”“门店用户”；`?role=merchant&view=permission` 可验证越权表达。
- Screenshot / Browser result: 1024px / 1440px 视觉、角色权限与五态质量检查由 T012 PR #9 的真实 Chromium 审计统一完成，并由用户明确验收通过。
- Other evidence: `LL-8888` / `LL-1024` / `STORE-YUNLING` / `REDEEM-LL-1024` 继续复用 T002/T004 数据链；新增 `REDEEM-EXPERIENCE-8888-01` 将同一用户的基础检测体验券与云岭社区店服务核销关联，供 T006 后续复用。

## Status history

- 2026-08-31 `REVIEW → PASS`：用户明确确认前置任务均验收通过；T012 PR #9 已补齐 1024px / 1440px 浏览器质量证据。

## Review

- Reviewer: Tomz
- Result: PASS
- Conclusion: 店主工作台、自提 / 服务核销、跨端凭证一致性、权限边界及最终 PC 浏览器质量验收均通过。
- Follow-up: 无；由 T013 负责跨端演示串联。

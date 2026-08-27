# T009 · PC 店主与合作商工作台

- Status: TODO
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

- [ ] 店主可从概览进入自提或服务核销。
- [ ] LL-1024 等演示订单与用户端信息一致。
- [ ] 越权场景可触发 permission 表达。
- [ ] 1440px 与 1024px 完成视觉检查。
- [ ] `npm run build:pc` 通过。

## Risks / Dependencies

- 前置：T002、T008；联动 T004、T006。
- 风险：真实核销权限与异常处理规则尚未确定。

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

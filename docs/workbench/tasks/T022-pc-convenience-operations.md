# T022 · PC 便利店订单、履约与核销后台

- Status: TODO
- Target version: 0.2.0
- Impact: PC / Shared
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

## Out of scope

- 真实库存服务、配送 API、骑手调度、地图后台。
- 智慧抗衰与商城后台。

## Acceptance

- [ ] 店主可查看本店自提与短配订单并区分状态。
- [ ] 自提订单可演示扫码核销至完成。
- [ ] 短配订单可演示备货 → 配送中 → 送达。
- [ ] 平台运营可看到门店商品可售关系和履约能力配置概念。
- [ ] PC 与 Mobile 同一订单 ID / 门店 / 状态关系一致。
- [ ] 1024px 与 1440px 浏览器下达到中高保真后台信息密度，无明显溢出。
- [ ] `npm run typecheck`、`npm run build` 通过。

## Risks / Dependencies

- 前置：T015、T018。
- 配送规则未决部分继续用 mock，不自行固化。

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

- Reviewer:
- Result: REVIEW / PASS / BLOCKED
- Conclusion:
- Follow-up:

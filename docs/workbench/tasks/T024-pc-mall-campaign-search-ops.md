# T024 · PC 商城渠道、活动与搜索运营后台

- Status: TODO
- Target version: 0.2.0
- Impact: PC / Shared
- Owner: -

## Background

V0.2 线上商城需要预留一端多 Storefront / Channel，首页需要多个虚拟活动，全局搜索需要跨业务实体；这些能力都需要 PC 端有可解释的运营结构。

## Goal

完成线上商城 Storefront / Channel、商品来源、商城订单，以及首页活动 / 推荐位 / 搜索关联的中高保真运营后台。

## Product facts

- 商城与便利店履约隔离。
- V0.2 不做真实外部平台接口，但不能把商城模型锁死单店。
- 首页支持多个虚拟活动。
- 全局搜索跨便利店、商城、智慧抗衰和活动。

## Scope

- Storefront 列表 / 详情结构。
- Channel 列表 / 来源语义。
- 商品 / 分类与 Storefront / Channel 关系表达。
- 商城订单及来源渠道展示。
- 首页 Banner / 虚拟活动 / 推荐位配置概念。
- 活动关联商品、服务、权益和跳转目标。
- 全局搜索关联管理概念：实体类型、业务域、展示 / 可用状态。
- 使用 T015 fixtures，与 T016 / T019 Mobile 展示保持一致。

## Out of scope

- 抖音等真实外部接口。
- 真实 CMS、搜索索引、推荐算法、内容审核系统。
- 复杂多店商家经营工具。

## Acceptance

- [ ] PC 可表达至少两种 Storefront / Channel 来源。
- [ ] 商品和商城订单可追溯到来源渠道。
- [ ] 可演示至少 3 个首页虚拟活动 / 推荐位的配置关系。
- [ ] 搜索运营结构能关联便利店商品、商城商品、智慧抗衰项目 / 套餐和活动。
- [ ] PC 与 Mobile 的活动、渠道、商品关系一致。
- [ ] 1024px / 1440px 浏览器验证达到中高保真运营后台质量。
- [ ] `npm run typecheck`、`npm run build` 通过。

## Risks / Dependencies

- 前置：T015、T016、T019。
- 不得把渠道结构误表达为已接通外部平台。

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

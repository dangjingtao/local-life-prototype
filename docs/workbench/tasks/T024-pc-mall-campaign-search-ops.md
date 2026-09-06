# T024 · PC 商城渠道、活动与搜索运营后台

- Status: REVIEW
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

- [x] PC 可表达至少两种 Storefront / Channel 来源。
- [x] 商品和商城订单可追溯到来源渠道。
- [x] 可演示至少 3 个首页虚拟活动 / 推荐位的配置关系。
- [x] 搜索运营结构能关联便利店商品、商城商品、智慧抗衰项目 / 套餐和活动。
- [x] PC 与 Mobile 的活动、渠道、商品关系一致。
- [x] 1024px / 1440px 浏览器验证达到中高保真运营后台质量。
- [x] `npm run typecheck`、`npm run build` 通过。

## Risks / Dependencies

- 前置：T015、T016、T019。
- 不得把渠道结构误表达为已接通外部平台。

## Implementation record

- Commit / PR: PR #35 · `feat(T024): add PC mall channel campaign and search operations`；final verified code head `0fc9e3d48233308e3a6cfe022319fcadf1867802`。
- Changed paths: `apps/pc/src/MallCampaignSearchOperations.tsx`、`apps/pc/src/OperatorConsole.tsx`、`packages/shared/src/domain.ts`、`packages/shared/src/fixtures.ts`、`packages/shared/src/selectors.ts`、`tests/browser/t024-pc-mall-campaign-search-ops.spec.mjs`、本任务卡与总台账。
- Notes: 新增 `MallProductListing` 显式表达商品 × Storefront × Channel；Campaign 增加真实 Mobile 承接一致的 `campaign_detail` target；CampaignRef 类型禁止 Storefront，避免内部渠道语义回漏消费者侧。渠道 / 商品关系均为 V0.2 原型配置，不代表真实外部平台接入。

## Verification evidence

- CI: Verify run `34002301123` success（version / typecheck / build）。
- Page / Route: PC `?role=operator` →「商城 / 内容运营」→「商城渠道 / 活动与推荐位 / 搜索关联」。
- Screenshot / Browser result: Browser run `34002301128`：95 passed / 8 failed；T024 专项 6/6 passed，1024 / 1440 overflow 检查通过；Browser report artifact `9979880429`，其中包含 `test-results/t024-visual-evidence/`。
- Other evidence: Shared `validateDemoFixtureRelations()` 在 T024 / T034 回归中保持空问题集；Mobile 商城与活动详情继续隐藏 Storefront / Channel / 店铺来源。CodeRabbit 1×Minor（1024 截图实际在 1440 视口截取）已修复并 resolve；OpenCode review Action 仍为既有基础设施失败，无可用评审结论。

## Review

- Reviewer: CodeRabbit + 人工自审（Mira）+ Verify / Browser Quality
- Result: REVIEW
- Conclusion: T024 7 项验收标准均满足；专项 Browser 6/6，Verify success，0 个未解决 review thread，无 T024 blocking finding。全量剩余 8 项均为既有 T017 / T018 / T032 checkout 基线债。
- Follow-up: 等待用户产品验收；用户确认后方可标记 PASS / 合并 PR #35。

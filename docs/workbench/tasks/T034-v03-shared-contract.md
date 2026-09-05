# T034 · V0.3 Shared 合同与 Mock

- Status: DOING
- Target version: 0.3.0
- Type: Shared / Product Contract
- Predecessors: V0.2 Shared 基线（T015）、便利店商品 type 基线（T031）、自提语义（T018）
- Related PRD: `docs/product/02-v0.3-prd.md`

## Unique deliverable

只完成 V0.3 四类新增语义的 Shared 合同与可追踪 Mock：连续浏览排序、双凭证、消费积分倍率 / 预计获得、社群频控。**不改任何 Mobile / PC UI。**

## Product facts

- 商品已存在 `single / combo` 类型，本卡补足稳定排序 / 锚点所需语义，不重复发明第二个商品类型字段。
- 同一自提订单拥有二维码与数字码，两者共享同一 redemption 状态。
- 便利店 / 商城消费 1 元 = 1 积分；智慧抗衰消费 1 元 = 2 积分。
- `100 积分 = ¥1` 继续是 Candidate，不升级为正式业务规则。
- 社群只做 Mock；7 天频控需能被后续页面稳定计算 / 触发。

## Changed paths whitelist

业务代码只允许：
- `packages/shared/src/domain.ts`
- `packages/shared/src/fixtures.ts`
- `packages/shared/src/selectors.ts`
- `packages/shared/src/index.ts`（仅新增导出时）

本卡任务卡 / 台账和必要测试证据文件不计入业务代码白名单。

## Out of scope

- 不改 `apps/mobile/**`。
- 不改 `apps/pc/**`。
- 不接真实二维码、企微、积分服务。
- 不改变 T018 自提 / 短配状态机。
- 不确定积分计分基数、抵现上限、正式兑换比例。

## Acceptance

- [ ] Shared 能稳定表达商品分类内 `single → combo` 顺序和跨大类锚点。
- [ ] 同一自提订单的二维码 / 数字码共享单一核销状态。
- [ ] Shared 存在三场景消费积分倍率，并提供统一预计获得计算入口或等价语义。
- [ ] 社群 Mock 与 7 天频控状态可被 UI 消费。
- [ ] 未确认积分规则保持 Candidate / Unknown。
- [ ] `validateDemoFixtureRelations()` 返回 `[]`。
- [ ] `npm run typecheck`、`npm run build` 通过。

## Execution baseline

- Branch: `task/T034-v03-shared-contract`
- Started from: `dev@f42a3e97672e7daed6184997ad44babb33775013`
- Started at: 2026-09-05

## Evidence required

- commit / PR；
- Shared relation validation；
- typecheck / build；
- 明确列出新增 / 修改的 domain 字段与 selector，证明没有同义重复模型。

## Stop conditions

如实现需要改变已确认的订单状态、购物车隔离、商城消费者语义或积分正式兑换规则，立即 BLOCKED 并回到产品决策，不得在本卡内自行扩权。

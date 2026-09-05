# T034 · V0.3 Shared 合同与 Mock

- Status: PASS
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

- [x] Shared 能稳定表达商品分类内 `single → combo` 顺序和跨大类锚点。
- [x] 同一自提订单的二维码 / 数字码共享单一核销状态。
- [x] Shared 存在三场景消费积分倍率，并提供统一预计获得计算入口或等价语义。
- [x] 社群 Mock 与 7 天频控状态可被 UI 消费。
- [x] 未确认积分规则保持 Candidate / Unknown。
- [x] `validateDemoFixtureRelations()` 返回 `[]`。
- [x] `npm run typecheck`、`npm run build` 通过。

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


## Implementation record

- PR: #30 `feat(T034): add V0.3 shared contract and mock data`
- Branch: `task/T034-v03-shared-contract`
- Candidate head before evidence write-back: `e6ea46b9d3c7b93f5b763c60039972e4703b5da7`
- Business changed paths:
  - `packages/shared/src/domain.ts`
  - `packages/shared/src/fixtures.ts`
  - `packages/shared/src/selectors.ts`
- Test evidence:
  - `tests/browser/t034-shared-contract.spec.mjs`
- No `apps/mobile/**` / `apps/pc/**` changes.

### Contract additions

- Browse: `ConvenienceBrowseCategory` + `Product.browseCategoryId / browseOrder` + `getConvenienceBrowseSections()`; `Product.type` 继续使用原有 single / combo 语义。
- Pickup: `PickupCredential` 只保存 credential 本身，通过 `redemptionId` 绑定现有 `RedemptionRecord`；不复制 redemption status。
- Points: `purchasePointsEarnRate` 确认 store=1 / mall=1 / care=2；`getPurchasePointProjection(scene, eligibleYuan)` 不替业务决定计分基数或取整。
- Community: `CommunityGroup` + `CommunityNudgeState` + 7 天 cooldown selector；最终平台统一群 / 门店群范围继续 Unknown。

## Verification evidence

- Verify Prototype #311: **success**；version contract、全仓 typecheck、全仓 build 通过。
- T012 Browser Quality #112: 81 项中 **73 passed / 8 failed**。
  - T034 新增 3 项合同测试 **3/3 passed**。
  - `validateDemoFixtureRelations()` 在真实 Vite / Chromium 运行环境返回 `[]`。
  - 8 个失败全部为既有 T017 / T018 / T032 旧断言，与进入本卡前已记录的便利店浏览器基线债一致；本卡未修改 Mobile。
- CodeRabbit status: success；当前 PR 无 review thread。
- Changed-path review: 业务修改只落在本卡 Shared 白名单；另有任务卡 / 台账和 T034 测试证据文件。

## Review

- Result: PASS
- Merge: PR #30 squash merge `18ea9e8b442ebcda85500dcc2ad7c337d407c8a8` → `dev`
- AI Review: Codex 在 reviewed head `63c0d7afe3` 提出 2 个 P2，均复核成立并修复：① 凭证 active 必须受订单 `pending_pickup / ready_for_pickup` 与时段共同约束；② 7 天社群提示频控必须按用户全局生效而非 user × community。两个 thread 已回复并 resolve。
- Self review: 额外发现“订单仍备货但取货时段已结束”应为 `expired` 而非 `inactive`，已修复并补回归。
- Final candidate: `d1cb656fd06cd067b30ea887fd7eaa94d774abc5`
- Final Verify Prototype #314: **success**。
- Final T012 Browser Quality #115: **73/81**；T034 专项 **3/3 passed**，`validateDemoFixtureRelations()` 返回 `[]`；8 个失败仍全部为进入本卡前已存在的 T017 / T018 / T032 旧基线断言，本卡未修改 Mobile / PC。
- Conclusion: 用户在 2026-09-05 明确授权“AI review；无阻塞则自行 review merge”。AI findings 已闭环，自审无剩余阻塞，按授权合并并记录 PASS。

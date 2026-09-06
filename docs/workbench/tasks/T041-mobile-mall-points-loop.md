# T041 · Mobile 商城积分消费闭环

- Status: PASS
- Target version: 0.3.0
- Type: Mobile / Mall / Benefits
- Predecessors: T034、T019 / T033 当前 storefront-free 消费者基线
- Related PRD: R03

## Unique deliverable

商城购物车显示可得积分；商城结算增加积分抵现、金额联动与可得积分，形成商城侧完整积分消费闭环。

## Changed paths whitelist

- `apps/mobile/src/MallFlowScreen.tsx`
- `apps/mobile/src/MallCartView.tsx`
- `apps/mobile/src/MallCheckoutView.tsx`
- 如订单快照必须记录抵扣明细，可最小修改 `apps/mobile/src/MallOrderView.tsx`
- `tests/browser/t041-mall-points-loop.spec.mjs`
- 必要时最小更新 T019-R3 / R4 / R5 相关断言。

## Out of scope

- 不恢复 Storefront / Channel / 店铺来源消费者 UI。
- 不改便利店积分。
- 不改商城全国快递语义。
- 不自行固化 Candidate 抵现汇率为正式规则。

## Acceptance

- [x] 商城购物车显示本单预计可得积分。
- [x] 商城结算显示当前积分余额 / 使用入口 / 抵现金额。
- [x] 开启 / 关闭积分抵现时应付金额实时联动。
- [x] 结算仍保持商品、运费、商城优惠、积分抵扣、应付的清晰层级。
- [x] 预计获得积分来自 Shared 1:1 场景倍率。
- [x] 商城页面不出现 Storefront / Channel / 店铺来源心智回归。
- [x] 390×844 五屏相关布局无溢出。
- [x] T019 / T033 关键回归、typecheck、build、browser test 通过。

## Stop conditions

如果当前 T019 视觉基线在开工前发生用户级变更，先同步本卡白名单 / AC，再施工，不覆盖最新视觉决策。


## Execution baseline

- Branch: `task/T041-mobile-mall-points-loop`
- Started from `dev@cfecad1` after T040 PASS.
- Preserve current T019 / T033 storefront-free consumer baseline.
- Earn projection consumes Shared `getPurchasePointProjection("mall", subtotal)`.
- Redemption uses Shared `prototypeRules.pointsToCash` only as its existing Candidate example; UI must explicitly keep candidate / actual-rule wording.
- No Shared changes; no convenience-store points changes.


## Implementation record

- PR: #40 `feat(T041): add mall points earn and redemption loop`
- Reviewed implementation head: `c87839dbe8f6e7c87ab3aa6de5320485e139c464`
- Business paths:
  - `apps/mobile/src/MallFlowScreen.tsx`
  - `apps/mobile/src/MallCartView.tsx`
  - `apps/mobile/src/MallCheckoutView.tsx`
- T019 compatibility: only `tests/browser/t019-r4-mall-checkout-order-visual.spec.mjs` amount-section height updated from 132 → 164 for the added points row.
- Shared / convenience-store points / MallOrder structure unchanged.

### Delivered behavior

- 商城购物车显示“本单预计可得积分”，倍率来自 Shared `getPurchasePointProjection("mall", subtotal)`。
- 商品数量变化后预计积分同步变化。
- 结算展示当前积分余额、积分抵现开关、演示可抵金额、预计可得积分。
- 开启 / 关闭积分抵现时应付金额实时联动；关闭后恢复原金额。
- 抵现计算消费 Shared 现有 `prototypeRules.pointsToCash` Candidate 值；消费者文案明确“当前抵现比例为示例 / 实际规则为准”，未升级为正式规则。
- 提交订单后 snapshot 保留抵扣后的实付金额。
- 全程保持全国快递与 storefront-free 消费者语义；未恢复店铺 / 来源 / Channel 心智。

## Review / verification

- Verify Prototype #34007147259: **success**，version / typecheck / build 全绿。
- T012 Browser Quality #34007147233: **116 passed / 8 failed（124 total）**。
  - T041 专项 **4/4 passed**。
  - T019-R4 **2/2 passed**。
  - T019-R5 五屏链路 **1/1 passed**，artifact `9981352268`。
  - 剩余 8 项均为进入 T041 前已存在的 T017 / T018 / T032 checkout 基线债。
- 首轮 Browser 曾新增 1 个 T012 失败：新积分 switch 为 48×28，低于 44px touch target；已修为 56×44，latest-head T012 对应回归恢复通过。
- CodeRabbit latest-head: **success**；No actionable comments；0 unresolved review thread。
- Codex review：额度耗尽，无实质 finding。
- Experimental OpenCode：仍为 advisory / non-blocking。
- Self review：Candidate 边界、订单实付继承、消费者术语、390×844 触控目标均复核，无剩余阻塞。

## Review

- Result: PASS
- Conclusion: T041 AC 满足；latest-head Verify success、专项 4/4、商城视觉关键回归通过，AI review 无阻塞项。2026-09-06 按用户既有授权由 Mira 自审验收；PR #40 squash merge `5cb269e143d065e9a2b3310ed2cb6fe18833561a`。

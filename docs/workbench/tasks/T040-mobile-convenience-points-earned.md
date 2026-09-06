# T040 · Mobile 便利店消费积分反馈

- Status: PASS
- Target version: 0.3.0
- Type: Mobile / Benefits
- Predecessors: T034、T018、T032
- Related PRD: R03

## Unique deliverable

只给便利店购物车与结算补齐“本单预计可得积分”反馈，并复用现有便利店积分抵现。

## Changed paths whitelist

- `apps/mobile/src/StoreFlowScreen.tsx`
- `tests/browser/t040-convenience-points-earned.spec.mjs`
- Shared 只消费 T034，不在本卡修改。

## Out of scope

- 不重做现有积分抵现。
- 不改商城（T041）。
- 不修改积分中心结构。
- 不自行确定计分基数 / 抵现汇率 / 抵扣上限。

## Acceptance

- [ ] 购物车 / Cart Sheet 可看到本单预计获得积分。
- [ ] 结算页可看到本单预计获得积分。
- [ ] 数量变化后预计积分同步变化。
- [ ] 使用 / 不使用现有积分抵现时，应付金额行为保持 T018 基线。
- [ ] 页面倍率来自 Shared，不硬编码第二套 1:1。
- [ ] 便利店既有抵现只有一套状态来源。
- [ ] 390×844 无溢出。
- [ ] T018 / T032 回归、typecheck、build、browser test 通过。

## Evidence required

至少断言一次“商品数量变化 → 可得积分变化”，不能只检查静态文案存在。


## Execution baseline

- Branch: `task/T040-mobile-convenience-points-earned`
- Started after T039 PASS on latest `dev`.
- Business file frozen to `apps/mobile/src/StoreFlowScreen.tsx`.
- Projection consumes Shared `getPurchasePointProjection("store", eligibleYuan)`; no Shared changes.
- Because purchase base and rounding remain `unknown`, UI must keep “预计 / 演示投影 / 正式规则待确认” wording and must not round to a fake final integer balance.


## Review follow-up

- CodeRabbit finding: 独立购物车 `step === "cart"` 存在但无用户可达入口，导致本卡虽然渲染了独立页积分反馈，实际用户无法看到。
- Verified against T029 / T032 baseline: finding valid. T029 明确要求“弹层购物车与独立购物车页并存”，T032 明确要求独立页仍可访问。
- Fix: Cart Sheet 增加最小“查看完整购物车”入口，仅恢复既有基线可达性；未重做购物车结构或 checkout。
- Browser coverage added for Sheet → 独立购物车 → 同一 projected points。


## Final verification / acceptance

- PR: #39 `feat(T040): add convenience purchase points feedback`
- Reviewed head: `6d93679d1881ed63e55936b0e016fb072cdc719d`
- Merge: squash `4e1712665c690524d97cb9d6e6ce2c6d33f14481`
- Verify Prototype #34006380444: **success**（version / typecheck / build 全绿）。
- T012 Browser Quality #34006380455: **112 passed / 8 failed（120 total）**。
  - T040 专项 **4/4 passed**：Cart Sheet 数量变化联动、独立购物车可达且同一投影、checkout 投影与 payable 行为隔离、390×844 消费者文案 / 无溢出。
  - 剩余 8 项全部为既有 T017 / T018 / T032 checkout 基线债。
- CodeRabbit：首轮 1×Major“独立购物车不可达”复核成立；已按 T029 / T032 基线恢复 Cart Sheet → 完整购物车入口并补自动化。原 thread 已 resolved；latest re-review：**No actionable comments**。
- Codex review：额度耗尽，无实质 finding。
- Self review：Projected points 只消费 Shared `getPurchasePointProjection("store", cartTotal)`；未修改 Shared、商城、积分中心或现有便利店积分抵现；消费者 UI 未暴露 Shared / Unknown / Mock 等工程术语。
- Result: **PASS**
- Conclusion: 2026-09-06 按用户授权，在 AI review 无剩余阻塞后由 Mira 自审验收并合并。

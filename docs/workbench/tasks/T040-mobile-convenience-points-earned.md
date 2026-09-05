# T040 · Mobile 便利店消费积分反馈

- Status: TODO
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

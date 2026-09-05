# T041 · Mobile 商城积分消费闭环

- Status: TODO
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

- [ ] 商城购物车显示本单预计可得积分。
- [ ] 商城结算显示当前积分余额 / 使用入口 / 抵现金额。
- [ ] 开启 / 关闭积分抵现时应付金额实时联动。
- [ ] 结算仍保持商品、运费、商城优惠、积分抵扣、应付的清晰层级。
- [ ] 预计获得积分来自 Shared 1:1 场景倍率。
- [ ] 商城页面不出现 Storefront / Channel / 店铺来源心智回归。
- [ ] 390×844 五屏相关布局无溢出。
- [ ] T019 / T033 关键回归、typecheck、build、browser test 通过。

## Stop conditions

如果当前 T019 视觉基线在开工前发生用户级变更，先同步本卡白名单 / AC，再施工，不覆盖最新视觉决策。

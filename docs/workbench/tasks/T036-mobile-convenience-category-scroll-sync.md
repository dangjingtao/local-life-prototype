# T036 · Mobile 便利店分类滚动联动

- Status: DOING
- Target version: 0.3.0
- Type: Mobile / Interaction
- Predecessors: T035
- Related PRD: R01

## Unique deliverable

只完成左侧大类导航与 T035 连续商品流的双向联动：

**点击分类 → 右侧定位；右侧滚动跨区 → 左侧自动高亮。**

## Changed paths whitelist

- `apps/mobile/src/StoreFlowScreen.tsx`
- `tests/browser/t036-convenience-category-scroll-sync.spec.mjs`
- 必要时最小更新 T035 browser spec，不改其他业务代码。

## Out of scope

- 不改变商品排序规则。
- 不重做分类栏视觉。
- 不改购物车 / 商详 / 结算 / 门店状态。
- 不新增滚动状态到 Shared。

## Acceptance

- [ ] 点击左侧任一大类可准确定位到右侧该大类起点。
- [ ] 自然滚动进入下一大类时左侧选中态自动更新。
- [ ] 反向滚动回上一大类时选中态正确回退。
- [ ] 程序化滚动与 observer / scroll listener 不发生选中态抖动。
- [ ] 连续快速点击不同分类后最终状态与可见区域一致。
- [ ] 390×844 分类栏始终可用且不遮挡底部购物栏。
- [ ] typecheck / build / browser test 通过。

## Execution baseline

- Branch: `task/T036-mobile-convenience-category-scroll-sync`
- Started from: `dev@ecb1a484735684e75ade70e48c12c84aa4b50000`
- Started at: 2026-09-05

## Evidence required

Browser test 必须断言“点击驱动”和“滚动驱动”两个方向，不接受只截图证明。

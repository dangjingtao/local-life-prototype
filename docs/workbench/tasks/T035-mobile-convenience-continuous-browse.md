# T035 · Mobile 便利店连续浏览结构

- Status: TODO
- Target version: 0.3.0
- Type: Mobile / UX
- Predecessors: T034、T031
- Related PRD: R01

## Unique deliverable

只把右侧商品区从“单品 / 套餐二选一过滤”改为：**当前大类单品 → 套餐 → 下一大类**连续内容结构。

本卡不负责左侧分类的滚动反向联动；该行为由 T036 单独完成。

## Changed paths whitelist

- `apps/mobile/src/StoreFlowScreen.tsx`
- `tests/browser/t035-convenience-continuous-browse.spec.mjs`
- 如既有 T031 / T017 断言因结构变化必须同步，只允许最小修改对应 browser spec。

## Out of scope

- 不改 Shared（由 T034 完成）。
- 不改商品卡视觉、购物车 Sheet、商详、结算。
- 不改左侧分类选中算法。
- 不改门店选择、搜索、库存 / 可售规则。

## Acceptance

- [ ] 默认无需点击“单品 / 套餐”即可看到两类商品。
- [ ] 同一大类顺序严格为 single → combo。
- [ ] 当前大类结束后继续下滑可进入下一大类。
- [ ] 向上滚动时内容顺序自然回退。
- [ ] 商品搜索仍可正常使用，搜索结果不被强行分段导致重复。
- [ ] 加购、商品详情、购物栏 / Sheet 仍可用。
- [ ] 390×844 无横向溢出。
- [ ] T031 / T032 关键购物链路无回归。
- [ ] typecheck / build / 本卡 browser test 通过。

## Evidence required

390×844 至少保留三个实屏证据：大类单品尾部、套餐衔接、跨入下一大类。

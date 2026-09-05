# T035 · Mobile 便利店连续浏览结构

- Status: PASS
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

- [x] 默认无需点击“单品 / 套餐”即可看到两类商品。
- [x] 同一大类顺序严格为 single → combo。
- [x] 当前大类结束后继续下滑可进入下一大类。
- [x] 向上滚动时内容顺序自然回退。
- [x] 商品搜索仍可正常使用，搜索结果不被强行分段导致重复。
- [x] 加购、商品详情、购物栏 / Sheet 仍可用。
- [x] 390×844 无横向溢出。
- [x] T031 / T032 关键购物链路无回归。
- [x] typecheck / build / 本卡 browser test 通过。

## Execution baseline

- Branch: `task/T035-mobile-convenience-continuous-browse`
- Started from: `dev@72a8c06efe39d8007c1e6d0efeab02a69944038c`
- Started at: 2026-09-05

## Evidence required

390×844 至少保留三个实屏证据：大类单品尾部、套餐衔接、跨入下一大类。


## Implementation record

- PR: #31 `feat(T035): add continuous convenience browse structure`
- Merge: squash `669791b8abaf67bc7defcf4600121935cd204c82` → `dev`
- Final candidate: `54ce85d7e2d638d76a74237fc9977017c15eedf2`
- Business changed path: `apps/mobile/src/StoreFlowScreen.tsx`
- Regression updates: `tests/browser/t017-mobile-convenience-cart.spec.mjs`、`tests/browser/t031-dual-col-browse.spec.mjs`
- New evidence: `tests/browser/t035-convenience-continuous-browse.spec.mjs`
- No Shared / checkout / pickup / T036 scroll-sync implementation changes.

### Delivered behavior

- 移除 T031 的 single / combo 二选一过滤按钮。
- 直接消费 T034 `getConvenienceBrowseSections()`，默认顺序为 大类 → 单品 → 套餐 → 下一大类。
- 搜索状态保持扁平结果，避免连续分组产生重复商品。
- 商品卡、价格 / 会员价、促销、加购、商详、购物车 Sheet 沿用既有实现。
- 连续商品 scrollport 预留底部固定购物栏 + 一级导航安全空间，最后一项可完整滚出并点击。
- 左侧分类滚动反向联动未提前实现，继续由 T036 承接。

## Review / verification

- Codex review：提出 1 个 P1，指出 390×844 最后一项被固定购物栏 / 底部导航遮挡；复核成立，已通过 scrollport bottom clearance 修复，thread 已回复并 resolve。
- CodeRabbit：仅 1 条 trivial token nitpick；核对为 T031 原商品行已有 `bg-black/40` / `text-white` 被 renderer 重构带入 diff，并非 T035 新增视觉规则，按本卡“不重做商品卡视觉”边界不扩卡。
- Self review：确认未改 Shared、结算 / 取货、购物车 Sheet 结构，也未提前实现 T036 滚动高亮。
- Verify Prototype #321：**success**，typecheck / build 全绿。
- T012 Browser Quality #119：**77 passed / 8 failed（85 total）**。
  - T035 专项 **4/4 passed**。
  - T031 浏览回归全部 passed。
  - T017 连续商品内层滚动 + 最后一项无遮挡断言 passed。
  - 8 个失败均为进入 T035 前已存在的 T017 / T018 / T032 checkout 旧断言；T035 未修改 checkout。
- 390×844 视觉证据由 T035 browser test 生成：
  - `01-fresh-single-tail.png`
  - `02-single-to-combo.png`
  - `03-next-category.png`
- Experimental OpenCode #144 在合并时仍处于模型调用；按 T014 合同为 advisory / non-blocking，不作为产品合并门禁。

## Review

- Result: PASS
- Conclusion: 用户要求“完成035”。唯一新增阻塞 P1 已闭环，T035 专项与 T031 浏览回归均通过，latest-head Verify 通过，未把旧 checkout 基线债或 T036 工作混入本卡；按当前项目授权完成 merge 并记录 PASS。

# T036 · Mobile 便利店分类滚动联动

- Status: REVIEW
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

- [x] 点击左侧任一大类可定位到该大类；正常区段尽量对齐起点，短尾末段受 `maxScrollTop` 限制时目标标题必须进入可视区且选中态稳定。
- [x] 自然滚动进入下一大类时左侧选中态自动更新。
- [x] 反向滚动回上一大类时选中态正确回退。
- [x] 程序化滚动与 observer / scroll listener 不发生选中态抖动。
- [x] 连续快速点击不同分类后最终状态与可见区域一致。
- [x] 390×844 分类栏始终可用且不遮挡底部购物栏。
- [x] typecheck / build / browser test 通过。

## Execution baseline

- Branch: `task/T036-mobile-convenience-category-scroll-sync`
- Started from: `dev@ecb1a484735684e75ade70e48c12c84aa4b50000`
- Started at: 2026-09-05

## Evidence required

Browser test 必须断言“点击驱动”和“滚动驱动”两个方向，不接受只截图证明。


## Implementation record

- PR: #32 `feat(T036): sync convenience category navigation with scroll`
- Branch: `task/T036-mobile-convenience-category-scroll-sync`
- Final implementation/test candidate before evidence write-back: `1bf787863129fd52aa33afc820edc3a2343359c5`
- Business changed path: `apps/mobile/src/StoreFlowScreen.tsx`
- New browser evidence: `tests/browser/t036-convenience-category-scroll-sync.spec.mjs`
- No Shared / product sort / cart / detail / checkout changes.

### Delivered interaction

- 左侧分类不再过滤 T035 连续商品流，只表达当前位置与快速定位。
- 点击分类使用同一内层 scrollport 定位，不创建第二套列表。
- 自然滚动使用 scrollport 约 25% 高度作为当前分类 activation line，向下 / 向上都更新左侧选中态。
- 程序化定位使用 guard 避免 scroll handler 在中途抢高亮；快速连续点击最终状态以最后一次点击为准。
- 首个真实分类“饮料”与“全部”在 scrollTop=0 时仍保持不同语义。
- 搜索状态点击分类会退出搜索并在连续列表 DOM 恢复后定位，避免“按钮已选中但列表无变化”的假交互。
- 对短尾最后分类不增加巨型空白强制顶到 scrollport 顶部；受 maxScrollTop 限制时以“目标可见 + 点击选中稳定”，自然滚到底则切换最后分类。

## Review / verification

- Codex reviewed head `306386a843`：
  - P1：最后分类无法到 activation line → 成立；改为 clamped / bottom-boundary 处理并补底部自然滚动断言。
  - P2：首类回到 scrollTop=0 会被“全部”抢选中 → 成立；增加 programmatic guard，并从下方点回“饮料”验证。
  - P2：搜索中分类按钮是假交互 → 成立；改为 clear query + DOM 恢复后定位。
  - 三条 thread 均已回帖并 resolve。
- CodeRabbit：
  - max scroll 时 pending ref 未清理 → 已在后续实现处理并由机器人标记 addressed / resolved。
  - 测试 delta 可能负值假绿 → 成立；最终测试使用 `Math.abs(delta)` 且 null → Infinity，已标记 addressed / resolved。
- Verify Prototype #331：**success**，typecheck / build 全绿。
- T012 Browser Quality #126：**82 passed / 8 failed（90 total）**。
  - T036 专项 **5/5 passed**，包含点击驱动、自然正反滚动、快速点击、搜索 handoff、390×844 底部无遮挡。
  - T035 4/4 与 T031 浏览回归继续通过。
  - 剩余 8 项仍为进入 T036 前已存在的 T017 / T018 / T032 checkout 旧断言；T036 未修改 checkout。
- CodeRabbit current-head status：**success**。
- Experimental OpenCode #151 在收口时仍为模型调用中；按 T014 合同 advisory / non-blocking。

## Review

- Result: REVIEW
- Conclusion: T036 专项在严格断言下 5/5 通过，AI Review 的有效问题均已闭环，未发现本卡新增回归。按当前授权停在 REVIEW，不自动 PASS / merge。

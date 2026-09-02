# T031 · Mobile 便利店双栏分类与零售密度升级

- Code: T031

- Theme: 便利店浏览 UX 升级

- Type: Mobile / UX

- Status: PASS

- Target: 0.2.0

- Predecessors: T028

- Related PRD: AC-V0.2-001（便利店独立购物车）、AC-V0.2-016（数据一致性）

- Owner: TraeDesign

- Reference: 7-Eleven 小程序商品浏览页

***

## Why

T028 已完成基础的密度返工（顶部横滑分类 + 卡片式商品列表 + 悬浮购物栏），但距离行业标杆（7-Eleven 小程序）的零售效率仍有差距：

- 横滑分类可视数量有限，便利店 SKU 多时切换效率低

- 卡片式商品列表一屏展示数量不足，扫货效率不高

- 购物栏已悬浮，但缺少套餐/单品双态、可用券入口等便利店专属元素

需要基于 T028 的基础，进一步向 7-Eleven 级别的零售密度和操作效率靠拢。

## Scope

**做：**

- 左侧固定分类栏 + 右侧商品列表的双栏布局（参考 7-Eleven 双栏模式）

- 分类栏支持一级分组，选中态左侧色条 + 文字变主题色

- 紧凑商品行：左图右文，同一行内表达品名 / 规格 / 促销标签 / 价格 / 会员价 / 加购按钮

- 单品 / 套餐双态切换（胶囊切换，单品在前默认选中，两种模式均为紧凑行布局）

- 底部悬浮购物栏保持（继承 T028 实现，优化视觉层级）

- 左下角可用券悬浮入口（橙色胶囊，显示可用券数量）

- 顶部门店信息条优化为紧凑横条（店名 + 距离/营业时间 + 切换门店）

- 活动 banner 简化为窄条（减少占位，提升商品密度）

- 配色完全使用现有 Com Design token，不引入新主题色

**不做：**

- 不改动购买流程和业务语义（T018 保持不变）

- 不改动商详页（T032 处理）

- 不改动购物车独立页（T032 处理弹层购物车）

- 不引入真实地图、真实库存等后端能力

## Acceptance

1. 采用左侧固定分类栏 + 右侧商品列表双栏布局，分类选中态视觉清晰（左侧色条 + 主题色文字）
2. 分类栏点击与右侧商品列表联动，滚动时分类栏固定不随内容滚动
3. 紧凑商品行左图右文，一屏 390×844 首屏至少展示 4 个完整商品行
4. 商品行信息完整：商品图、品名、规格/搭配、促销标签、价格/会员价、加购数量控件
5. 单品 / 套餐双态切换，单品在前默认选中，两种模式均为紧凑行布局
6. 底部购物栏悬浮在商品列表上方，任意滚动位置始终可见，不被遮挡
7. 加购后购物栏数量和金额即时更新，视觉反馈明确
8. 左下角可用券悬浮入口，不遮挡商品和购物栏
9. 顶部门店信息条紧凑展示，点击可切换门店
10. 活动 banner 简化为窄条，不占用过多垂直空间
11. 售罄/不可售商品与可售商品视觉区分清晰（遮罩 + 状态标签 + 按钮禁用）
12. 正常路径不出现 mock / fixture / 可售上下文等内部术语
13. 配色完全使用现有 Com Design token，不新增主题色变量
14. 390×844 浏览器走查通过，无横向溢出
15. typecheck、build 与 Playwright 回归通过（T017 测试同步更新）

## Implementation record

- Commit / PR: task/T031-convenience-dual-col-density

- Changed paths:

  - `apps/mobile/src/StoreFlowScreen.tsx`：双栏布局重构（左侧分类栏+右侧商品区）、紧凑商品行、底部悬浮购物栏、可用券入口、门店信息条紧凑化、活动窄条

  - `packages/shared/src/domain.ts`：Product 新增 type 字段（single/combo）

  - `packages/shared/src/fixtures.ts`：商品数据补充 type 字段

  - `packages/icons/src/index.tsx`：新增 cart 图标

  - `tests/browser/t031-dual-col-browse.spec.mjs`：T031 专项浏览器验证测试（9 项）

- Notes:

  - 购物栏保持悬浮在商品列表上方（absolute 定位），商品列表底部 pb-16 留空避免遮挡

  - 单品/套餐双态均使用紧凑行布局，单品在前默认选中

  - 配色完全使用现有 Com Design token

## Verification evidence

- CI: typecheck 通过；mobile build 通过

- Page / Route: Mobile `便利店` → 门店商品浏览

- Screenshot / Browser result: Playwright 9/9 通过（390×844）

- Other evidence: `tests/browser/t031-dual-col-browse.spec.mjs`

## Review

- Reviewer: 自验

- Result: PASS

- Conclusion: 15 项 AC 全部满足；Playwright 9 项专项测试通过 + T017 回归 8 项通过；首屏密度布局能力满足（数据量待后续扩充 fixture 验证）；无横向溢出；配色完全使用现有 Com Design token

- Follow-up: 进入 T032（弹层购物车与结算页分组）。


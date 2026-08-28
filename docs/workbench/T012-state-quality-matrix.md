# T012 · 状态与原型质量验证矩阵

> 本文是 T012 的执行清单，不替代任务卡或 Product Brief。CI 通过不等于视觉、可访问性或产品验收通过。

## 1. 当前覆盖范围

### 已有页面，可进入本轮质量基线

- Mobile：T003 登录 / 首页 / 统一身份；T004 门店自提闭环。
- PC：T008 角色 / 权限壳；T009 店主工作台；T010 平台运营中台；T011 管理层数据驾驶舱。

### 尚未存在，不能伪造验收

- T005 线上商城一件代发闭环。
- T006 智慧抗衰体验闭环。
- T007 会员、积分与权益中心。

因此本轮 PR 可以合入共享质量基线，但 T012 任务本身继续保持 `DOING`。

## 2. 五态语义与切换方式

| view | 语义 | 必须表现 | 当前基线 |
| --- | --- | --- | --- |
| ready | 正常可用 | 业务内容与主操作 | 由各页面负责 |
| loading | 数据读取中 | 明确等待原因；`aria-busy` | Runtime 原地切换；业务 children 保持挂载 |
| empty | 当前无内容 | 原因 + 下一步 | Runtime 原地切换并提供“返回可用数据” |
| error | 加载失败 | 错误原因 + 恢复动作 | Runtime 原地切换；使用 alert 语义并提供“重新加载演示” |
| permission | 越权 / 无权限 | 边界原因 + 返回允许范围 | PC 使用角色专属 permission；因根级角色边界页需要重新读取 URL，进入 / 离开 permission 仍采用文档导航 |

### 为什么 loading / empty / error 不再刷新文档

T012 PR #4 首轮 review 发现：原来的 `setPrototypeView()` 使用 `window.location.assign`，从 Mobile 门店详情 / 确认页或 PC 非默认模块触发 error / empty 后，恢复 ready 会把 React 局部导航状态重置到首页 / 总览。

返工后：

- `usePrototypeView()` 基于 `useSyncExternalStore` 订阅原型状态变化。
- ready / loading / empty / error 使用 `history.replaceState` + `prototype:viewchange` 事件在当前文档内切换。
- `PrototypeState` 在非 ready 时隐藏业务 children，但不卸载它们；恢复 ready 后门店 step、选中模块等局部 state 继续保留。
- permission 仍保留文档导航，因为 PC 三角色已有独立业务级 permission 壳，需要根组件重新读取 `?view=permission`。

## 3. 可复现路由

### Mobile

演示登录完成后会在当前 URL 保留 `demoAuth=1`。这是纯原型参数，只为直接状态链接、页面刷新和 permission 文档跳转时维持演示登录，不代表真实登录或鉴权。

- ready：`?demoAuth=1`
- loading：`?demoAuth=1&view=loading`
- empty：`?demoAuth=1&view=empty`
- error：`?demoAuth=1&view=error`
- permission：`?demoAuth=1&view=permission`

从已登录页面通过 PrototypePanel 切 ready / loading / empty / error 不刷新文档；permission 会重新读取页面边界，`demoAuth=1` 保证不会退回登录页。

### PC 店主

- ready：`?role=merchant`
- loading：`?role=merchant&view=loading`
- empty：`?role=merchant&view=empty`
- error：`?role=merchant&view=error`
- permission：`?role=merchant&view=permission`

### PC 平台运营

- ready：`?role=operator`
- loading：`?role=operator&view=loading`
- empty：`?role=operator&view=empty`
- error：`?role=operator&view=error`
- permission：`?role=operator&view=permission`

### PC 平台管理层

- ready：`?role=management`
- loading：`?role=management&view=loading`
- empty：`?role=management&view=empty`
- error：`?role=management&view=error`
- permission：`?role=management&view=permission`

## 4. 基础可访问性基线

本轮代码级基线：

- Design System `Button` / `SecondaryButton` 最小高度保持 44px，并使用组件级 `focus-visible` ring。
- 双端 CSS 在 `@layer base` 对 `button`、`a[href]`、`summary`、`[role=button]` 提供全局可见焦点 fallback；组件级 Tailwind utility 可正常覆盖 fallback，不叠加双焦点。
- PrototypePanel 的 summary 与状态按钮提升到 44px 级交互目标，并用 `aria-pressed` 标记当前状态。
- loading 使用 `aria-busy`；error 使用 `role=alert`；其余非 ready 状态使用 status / live region 表达。
- loading skeleton 只在 `motion-safe` 时播放 pulse，尊重 reduced-motion。
- Mobile 顶部消息按钮维持 44×44px；底部 Tab 维持 52px 高度。

这些只能证明实现基线，不能代替真实浏览器 Tab 顺序、读屏、颜色对比或触控体验验证。

## 5. 必须补的人工 / 浏览器证据

### 390px Mobile

- [ ] 登录页无横向溢出。
- [ ] 登录后首页五态切换不丢失演示身份。
- [ ] 门店详情 / 确认 / 凭证等局部 step 在 loading / empty / error 切换和恢复后保持原 step。
- [ ] 门店列表 / 详情 / 确认 / 凭证 / 成功页无横向溢出或底部导航遮挡。
- [ ] PrototypePanel 展开后不遮住关键恢复按钮。
- [ ] 键盘或等价焦点检查：场景入口、消息入口、门店、商品、提交、核销、底部 Tab 均有单一且清晰的可见焦点。

### 1024px PC

- [ ] 店主 / 运营 / 管理层导航、表格与卡片无明显横向溢出。
- [ ] 五态中心内容与 PrototypePanel 不互相遮挡。
- [ ] 从运营非默认模块切 loading / empty / error 后恢复，仍停留原模块。
- [ ] 角色切换、模块入口、筛选 Tabs、恢复按钮均有单一且清晰的可见焦点。

### 1440px PC

- [ ] 信息密度与最大宽度合理，无异常空洞或超宽行长。
- [ ] 驾驶舱趋势、区域、场景比较表无截断。
- [ ] 管理层 / 运营 / 店主三套角色路由在状态切换后仍保持正确角色。

### 颜色与语义

- [ ] 关键正文 / 状态 / 按钮文本做一次真实浏览器对比度抽查。
- [ ] error / permission 不只依赖颜色表达。
- [ ] 禁用按钮仍可理解，且不会被键盘误触发。

## 6. PR #4 首轮 Review 记录

- Codex P2：empty / error 从嵌套页面触发与恢复会因整页刷新丢失当前 page / step。判定成立，已用 Runtime 原地切换 + children 保持挂载返工。
- OpenCode #12：组件 ring 与未分层全局 outline 在 Tailwind v3 cascade 下会形成双焦点。判定成立，fallback 已移入 `@layer base`。
- 首轮 Head `21a1296` Verify Prototype #79 success；返工 Head 仍需新的 Verify 与 marked OpenCode review。

## 7. 完成条件

T012 只有在以下条件同时满足后才能进入 `REVIEW`：

1. T005、T006、T007 页面已存在并纳入同一状态 / 可访问性抽查。
2. `npm run verify` / 对应 PR Verify 通过。
3. 390px、1024px、1440px 实际浏览器检查有证据。
4. 关键按钮完成键盘焦点抽查；颜色对比至少完成一次浏览器级检查。
5. 发现的高置信问题已修复或明确记录为阻塞 / 技术债。

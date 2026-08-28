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

## 2. 五态语义

| view | 语义 | 必须表现 | 当前基线 |
| --- | --- | --- | --- |
| ready | 正常可用 | 业务内容与主操作 | 由各页面负责 |
| loading | 数据读取中 | 明确等待原因；`aria-busy` | Prototype Runtime 统一提供 |
| empty | 当前无内容 | 原因 + 下一步 | Runtime 提供“返回可用数据” |
| error | 加载失败 | 错误原因 + 恢复动作 | Runtime 使用 alert 语义并提供“重新加载演示” |
| permission | 越权 / 无权限 | 边界原因 + 返回允许范围 | Runtime 提供通用状态；PC 角色页保留业务级 permission 说明 |

## 3. 可复现路由

### Mobile

演示登录完成后会在当前 URL 保留 `demoAuth=1`。这是纯原型参数，只为刷新 / 切换状态时维持演示登录，不代表真实登录或鉴权。

- ready：`?demoAuth=1`
- loading：`?demoAuth=1&view=loading`
- empty：`?demoAuth=1&view=empty`
- error：`?demoAuth=1&view=error`
- permission：`?demoAuth=1&view=permission`

PrototypePanel 从已登录页面切换状态时会保留 `demoAuth=1`，因此不会重新掉回登录页。

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

- Design System `Button` / `SecondaryButton` 最小高度保持 44px，并新增 `focus-visible` 焦点环。
- 双端 CSS 对 `button`、`a[href]`、`summary`、`[role=button]` 统一提供可见键盘焦点兜底。
- PrototypePanel 的 summary 与状态按钮提升到 44px 级交互目标，并用 `aria-pressed` 标记当前状态。
- loading 使用 `aria-busy`；error 使用 `role=alert`；其余非 ready 状态使用 status / live region 表达。
- Mobile 顶部消息按钮维持 44×44px；底部 Tab 维持 52px 高度。

这些只能证明实现基线，不能代替真实浏览器 Tab 顺序、读屏、颜色对比或触控体验验证。

## 5. 必须补的人工 / 浏览器证据

### 390px Mobile

- [ ] 登录页无横向溢出。
- [ ] 登录后首页五态切换不丢失演示身份。
- [ ] 门店列表 / 详情 / 确认 / 凭证 / 成功页无横向溢出或底部导航遮挡。
- [ ] PrototypePanel 展开后不遮住关键恢复按钮。
- [ ] 键盘或等价焦点检查：场景入口、消息入口、门店、商品、提交、核销、底部 Tab 均有可见焦点。

### 1024px PC

- [ ] 店主 / 运营 / 管理层导航、表格与卡片无明显横向溢出。
- [ ] 五态中心内容与 PrototypePanel 不互相遮挡。
- [ ] 角色切换、模块入口、筛选 Tabs、恢复按钮均有可见焦点。

### 1440px PC

- [ ] 信息密度与最大宽度合理，无异常空洞或超宽行长。
- [ ] 驾驶舱趋势、区域、场景比较表无截断。
- [ ] 管理层 / 运营 / 店主三套角色路由在状态切换后仍保持正确角色。

### 颜色与语义

- [ ] 关键正文 / 状态 / 按钮文本做一次真实浏览器对比度抽查。
- [ ] error / permission 不只依赖颜色表达。
- [ ] 禁用按钮仍可理解，且不会被键盘误触发。

## 6. 完成条件

T012 只有在以下条件同时满足后才能进入 `REVIEW`：

1. T005、T006、T007 页面已存在并纳入同一状态 / 可访问性抽查。
2. `npm run verify` / 对应 PR Verify 通过。
3. 390px、1024px、1440px 实际浏览器检查有证据。
4. 关键按钮完成键盘焦点抽查；颜色对比至少完成一次浏览器级检查。
5. 发现的高置信问题已修复或明确记录为阻塞 / 技术债。

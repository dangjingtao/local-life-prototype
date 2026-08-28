# T012 · 关键状态、可访问性与原型质量

- Status: DOING
- Target version: 0.1.0
- Impact: Mobile / PC / Shared
- Owner: Mira

## Background

当前 Prototype Runtime 能全局切换状态，但还需验证状态与各业务页面匹配，并补齐恢复路径和基础可访问性。

## Goal

让关键页面可验证 ready、loading、empty、error、permission，并完成交互与可访问性基础检查。

## Product facts

- 关键状态必须可由 URL `?view=` 或 PrototypePanel 触发。
- 状态需要说明原因和下一步，不应只有占位文字。
- CI 通过不等于视觉或产品验收通过。

## Scope

- 双端关键页面的五态覆盖与恢复动作。
- 键盘焦点、语义标签、触控目标、颜色对比和溢出检查。
- 状态触发说明与验证清单。

## Out of scope

- 完整 WCAG 认证、自动化视觉平台和生产级监控。

## Acceptance

- [ ] 双端关键页面五态均可稳定触发。
- [x] error 有恢复动作，empty 有下一步，permission 有边界说明。
- [ ] 关键按钮可键盘操作且移动端触控目标合格。
- [ ] 390px、1024px、1440px 无明显溢出或遮挡。
- [x] `npm run verify` 通过（第二次返工 Head Verify Prototype #81 success）。

## Risks / Dependencies

- 前置：T003-T011 的对应页面完成。
- 风险：全局状态不能替代业务级状态，需按关键流程抽查。
- 当前依赖缺口：T005、T006 页面均已完成业务代码施工并进入 `REVIEW`，但仍未完成 T012 的 390px 状态 / 可访问性 / 恢复路径审计；T007 仍为 `TODO`。因此 T012 继续保持 `DOING`，不得因为 T005/T006 build / code review 已通过就把它们从质量待办中移除，也不得在 T007 完成及浏览器质量证据补齐前进入 `REVIEW` / `PASS`。
- 轻微技术债：OpenCode 最终复审指出 `PrototypeState` 仍保留已不参与渲染控制的 `view` prop；当前无运行时影响，后续可在不破坏调用合同的前提下清理。

## Implementation record

- Commit / PR: PR #4 `feat: T012 prototype states and accessibility baseline`; work branch `task/T012-prototype-states-quality`; merge commit `d6a10b5ef248bbd2405d308a98843bc0bffefa42`
- Changed paths: `packages/prototype-runtime/src/index.tsx`; `packages/design-system/src/ui.tsx`; `apps/mobile/src/App.tsx`; `apps/mobile/src/styles.css`; `apps/pc/src/styles.css`; `docs/workbench/T012-state-quality-matrix.md`; 本任务卡与总台账。
- Notes:
  - Prototype Runtime 的 loading / empty / error / permission 增加可理解原因；empty / error / permission 增加返回 ready 的明确恢复动作；loading 增加 `aria-busy`，error 使用 alert 语义。
  - PrototypePanel 的交互目标提升到 44px 级并增加键盘焦点；Design System Button / SecondaryButton 与双端普通按钮统一补 `focus-visible` 可见焦点。
  - Mobile 演示登录把 `demoAuth=1` 保留在 URL。该参数只用于直接状态链接和 permission 文档跳转后的演示身份复现，不代表真实鉴权。
  - ready / loading / empty / error 使用 `useSyncExternalStore` + history 事件在当前文档内切换；permission 因 PC 有角色专属边界页，仍使用文档导航。
  - 首轮返工后，OpenCode 二审继续发现 React reconciliation P1：ready 与非 ready 返回结构不同仍会卸载业务 children。第二次返工改为 `PrototypeState` 始终返回同一 Fragment，业务 children 始终位于第一个稳定 wrapper；ready 时 wrapper 使用 `display: contents`，非 ready 时用 `hidden` 从布局、焦点和可访问树移除，因此 nested React state 不因质量状态切换而卸载。
  - loading 动画使用 `motion-safe:animate-pulse`；全局焦点 fallback 放入 `@layer base`，由组件级 Tailwind ring 正常覆盖，避免双焦点。
  - T005 已在 PR #6 新增 `MallFlowScreen`，T006 已在 PR #7 新增 `CareFlowScreen`；两者业务 code review / build 证据都不能替代 T012 的状态、键盘、触控与 390px 浏览器检查。

## Verification evidence

- CI:
  - 初始 Head `21a1296d8829e97da7b6d03e807c46c2d69050d1`：Verify Prototype #79（run `33144289370`）success。
  - 首轮返工 Head `8e3e64bcc3d9f481c0efb25e9836956bb1b171a3`：Verify Prototype #80（run `33144696578`）success。
  - 第二次返工 Head `6f3f2973b6f0046c5b835d344f6f7b381b8c449c`：Verify Prototype #81（run `33145171233`）success；版本合同、全仓 typecheck、全仓 build 均通过。
- AI Review:
  - Codex P2：`setPrototypeView("ready")` 整页导航导致 Mobile 深层门店 step / PC 非默认模块恢复后掉回默认页面。复核成立，改为非 permission 状态无刷新切换。
  - OpenCode #12 verdict `CHANGES_NEEDED`：组件 ring 与未分层全局 outline 在 Tailwind v3 cascade 下可能形成双焦点。复核成立，fallback 改为 `@layer base`。
  - OpenCode #13 verdict `CHANGES_NEEDED`：首轮返工虽然不刷新文档，但 ready / non-ready 的 React 返回树不同，业务 children 仍会卸载重挂，门店局部 step 无法真正保持。复核为高置信 P1，第二次返工改为稳定 wrapper 始终处于同一 React tree position。
  - OpenCode #14（run `33145171238`）review success，metadata Head 与 `6f3f297` 一致，最终 verdict `NO_BLOCKING_FINDINGS`；未发现新的高置信 P0-P2。
  - T005 PR #6 复审指出商城页面虽已存在，但尚无 T012 质量审计证据；该 finding 复核成立，本任务与矩阵已恢复 T005 为明确 outstanding 项。
  - T006 PR #7 Codex current-head review 指出 T006 页面已经接入，但本任务 / 矩阵 / ledger 仍把它视为 TODO / 尚未存在，可能导致 T012 漏审。该 P2 复核成立，本次将 T006 同样登记为“已存在、质量审计 outstanding”。
- Page / Route:
  - Mobile：登录后 URL 自动带 `demoAuth=1`；可组合 `?demoAuth=1&view=loading|empty|error|permission`。
  - PC 店主：`?role=merchant&view=loading|empty|error|permission`。
  - PC 运营：`?role=operator&view=loading|empty|error|permission`。
  - PC 管理层：`?role=management&view=loading|empty|error|permission`。
- Screenshot / Browser result: 390px / 1024px / 1440px 实际浏览器视觉、键盘 Tab 顺序与对比度抽查尚未形成证据；T005 商城与 T006 智慧抗衰均尚未完成 390px 质量审计。
- Other evidence: `docs/workbench/T012-state-quality-matrix.md` 记录当前状态语义、路由和剩余人工验证项，并明确 T005/T006 已存在但仍待审计。

## Review

- Reviewer: Tomz
- Result: DOING
- Conclusion: PR #4 经两轮有效返工后，共享质量基线已合入 `dev`；T005/T006 现已存在，但状态 / 可访问性 / 390px 质量证据仍未补齐，T007 仍未施工，因此 T012 继续保持 `DOING`，不提前进入 `REVIEW`。
- Follow-up: 将 T005 商城与 T006 智慧抗衰纳入 Mobile 五态恢复、键盘焦点、触控目标与 390px 溢出 / 遮挡抽查；待 T007 完成后同样补入，再完成 390/1024/1440 实际浏览器、颜色对比验收并决定进入 `REVIEW`。

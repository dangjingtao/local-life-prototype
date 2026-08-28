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
- [ ] `npm run verify` 通过。

## Risks / Dependencies

- 前置：T003-T011 的对应页面完成。
- 风险：全局状态不能替代业务级状态，需按关键流程抽查。
- 当前依赖缺口：T005、T006、T007 仍为 `TODO`，因此本轮只能先完成 Runtime 与现有 T003/T004、T008-T011 页面质量基线；T012 在这些 Mobile 页面施工并复核前不得进入 `REVIEW` / `PASS`。

## Implementation record

- Commit / PR: PR #4 `feat: T012 prototype states and accessibility baseline`; work branch `task/T012-prototype-states-quality`
- Changed paths: `packages/prototype-runtime/src/index.tsx`; `packages/design-system/src/ui.tsx`; `apps/mobile/src/App.tsx`; `apps/mobile/src/styles.css`; `apps/pc/src/styles.css`; `docs/workbench/T012-state-quality-matrix.md`; 本任务卡与总台账。
- Notes:
  - Prototype Runtime 的 loading / empty / error / permission 增加可理解原因；empty / error / permission 增加返回 ready 的明确恢复动作；loading 增加 `aria-busy`，error 使用 alert 语义。
  - PrototypePanel 的交互目标提升到 44px 级并增加键盘焦点；Design System Button / SecondaryButton 与双端普通按钮统一补 `focus-visible` 可见焦点。
  - Mobile 演示登录把 `demoAuth=1` 保留在 URL。该参数只用于直接状态链接和 permission 文档跳转后的演示身份复现，不代表真实鉴权。
  - ready / loading / empty / error 使用 `useSyncExternalStore` + history 事件在当前文档内切换；permission 因 PC 有角色专属边界页，仍使用文档导航。
  - 首轮返工后，OpenCode 二审继续发现 React reconciliation P1：ready 与非 ready 返回结构不同仍会卸载业务 children。第二次返工改为 `PrototypeState` 始终返回同一 Fragment，业务 children 始终位于第一个稳定 wrapper；ready 时 wrapper 使用 `display: contents`，非 ready 时用 `hidden` 从布局、焦点和可访问树移除，因此 nested React state 不因质量状态切换而卸载。
  - loading 动画使用 `motion-safe:animate-pulse`；全局焦点 fallback 放入 `@layer base`，由组件级 Tailwind ring 正常覆盖，避免双焦点。

## Verification evidence

- CI:
  - 初始 Head `21a1296d8829e97da7b6d03e807c46c2d69050d1`：Verify Prototype #79（run `33144289370`）success。
  - 首轮返工 Head `8e3e64bcc3d9f481c0efb25e9836956bb1b171a3`：Verify Prototype #80（run `33144696578`）success。
  - 第二次返工后的当前 Head 仍需再次 Verify。
- AI Review:
  - Codex P2：`setPrototypeView("ready")` 整页导航导致 Mobile 深层门店 step / PC 非默认模块恢复后掉回默认页面。复核成立，改为非 permission 状态无刷新切换。
  - OpenCode #12 verdict `CHANGES_NEEDED`：组件 ring 与未分层全局 outline 在 Tailwind v3 cascade 下可能形成双焦点。复核成立，fallback 改为 `@layer base`。
  - OpenCode #13 verdict `CHANGES_NEEDED`：首轮返工虽然不刷新文档，但 ready / non-ready 的 React 返回树不同，业务 children 仍会卸载重挂，门店局部 step 无法真正保持。复核为高置信 P1，第二次返工改为稳定 wrapper 始终处于同一 React tree position。
- Page / Route:
  - Mobile：登录后 URL 自动带 `demoAuth=1`；可组合 `?demoAuth=1&view=loading|empty|error|permission`。
  - PC 店主：`?role=merchant&view=loading|empty|error|permission`。
  - PC 运营：`?role=operator&view=loading|empty|error|permission`。
  - PC 管理层：`?role=management&view=loading|empty|error|permission`。
- Screenshot / Browser result: 390px / 1024px / 1440px 实际浏览器视觉、键盘 Tab 顺序与对比度抽查尚未形成证据。
- Other evidence: `docs/workbench/T012-state-quality-matrix.md` 记录当前状态语义、路由和剩余人工验证项。

## Review

- Reviewer: Tomz
- Result: DOING
- Conclusion: PR #4 已经历两轮有效返工：首轮发现页面恢复与双焦点 P2；二审进一步发现 React 树结构仍会导致局部 state 重置的 P1。第二次返工已保持业务 children 的 React tree position 稳定。由于 T005-T007 尚未施工，T012 即使本 PR 最终合入仍继续保持 `DOING`。
- Follow-up: 等待第二次返工 Head 的最新 Verify 与 `local-ai-review:v1` 复审。通过后可合并本轮质量基线；待 T005-T007 完成后补全双端关键页面、390/1024/1440 实际浏览器与键盘/对比度验收，再决定进入 `REVIEW`。

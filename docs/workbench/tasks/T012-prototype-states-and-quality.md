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
  - 首轮 review 后 Runtime 改为 `useSyncExternalStore` 驱动：ready / loading / empty / error 使用 history + 事件在当前文档内切换；非 ready 时业务 children 继续挂载但隐藏，因此门店 step、运营模块等 React 局部状态在 error / empty 恢复后不丢失。permission 因 PC 有角色专属边界页，仍使用文档导航。
  - loading 动画使用 `motion-safe:animate-pulse`；全局焦点 fallback 放入 `@layer base`，由组件级 Tailwind ring 正常覆盖，避免双焦点。

## Verification evidence

- CI: 首轮 PR Head `21a1296d8829e97da7b6d03e807c46c2d69050d1` 的 `Verify Prototype #79`（run `33144289370`）success；版本合同、全仓 typecheck、全仓 build 均通过。返工 Head 需再次 Verify。
- AI Review:
  - Codex P2：`setPrototypeView("ready")` 整页导航导致 Mobile 深层门店 step / PC 非默认模块恢复后掉回默认页面。复核成立，改为非 permission 状态无刷新切换并保持 children 挂载。
  - OpenCode #12 verdict `CHANGES_NEEDED`：组件 ring 与未分层全局 outline 在 Tailwind v3 cascade 下可能形成双焦点。复核成立，fallback 改为 `@layer base`。
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
- Conclusion: PR #4 首轮独立 review 真实发现两项 P2：关键页面恢复丢失局部导航状态、焦点机制重复；两项均判定成立并返工。由于 T005-T007 尚未施工，T012 即使本 PR 最终合入仍继续保持 `DOING`。
- Follow-up: 等待返工 Head 最新 Verify 与 `local-ai-review:v1` 二审。通过后可合并本轮质量基线；待 T005-T007 完成后补全双端关键页面、390/1024/1440 实际浏览器与键盘/对比度验收，再决定进入 `REVIEW`。

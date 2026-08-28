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

- Commit / PR: work branch `task/T012-prototype-states-quality`; PR pending
- Changed paths: `packages/prototype-runtime/src/index.tsx`; `packages/design-system/src/ui.tsx`; `apps/mobile/src/App.tsx`; `apps/mobile/src/styles.css`; `apps/pc/src/styles.css`; `docs/workbench/T012-state-quality-matrix.md`; 本任务卡与总台账。
- Notes:
  - Prototype Runtime 的 loading / empty / error / permission 增加可理解原因；empty / error / permission 增加返回 ready 的明确恢复动作；loading 增加 `aria-busy`，error 使用 alert 语义。
  - PrototypePanel 的交互目标提升到 44px 级并增加键盘焦点；Design System Button / SecondaryButton 与双端普通按钮统一补 `:focus-visible` 可见焦点。
  - Mobile 演示登录把 `demoAuth=1` 保留在 URL。PrototypePanel 切换 `?view=` 后不再因为整页跳转丢失演示登录，从而可在已登录关键页面稳定复现五态。该参数只用于原型状态复现，不代表真实鉴权。

## Verification evidence

- CI: pending PR `Verify Prototype`; 本轮目标为 `npm run verify` / PR Verify 通过。
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
- Conclusion: 本轮先施工共享状态与已存在页面的质量基线；由于 T005-T007 尚未施工，不能把 T012 提前包装成完整完成。
- Follow-up: 代码质量 PR 经独立 review 后可合入 `dev`；T012 状态继续保持 `DOING`，待 T005-T007 完成后补全双端关键页面、390/1024/1440 实际浏览器与键盘/对比度验收，再决定进入 `REVIEW`。

# T012 · 关键状态、可访问性与原型质量

- Status: PASS
- Target version: 0.1.0
- Impact: Mobile / PC / Shared
- Owner: Mira

## Background

Prototype Runtime 已具备全局五态与恢复基线；T003-T011 对应业务页面均已完成施工。T012 统一验证状态恢复、响应式布局、键盘焦点、触控目标与颜色对比。

## Goal

让双端关键页面可稳定验证 ready、loading、empty、error、permission，并形成可重复的浏览器级质量证据。

## Product facts

- 关键状态必须可由 URL `?view=` 或 PrototypePanel 触发。
- 状态需要说明原因和下一步，不应只有占位文字。
- CI 通过不等于产品验收通过；T012 需要真实浏览器执行证据。
- T005、T006、T007 已完成业务施工，不是 T012 的外部阻塞或待施工前置。

## Scope

- 双端关键页面的五态覆盖与恢复动作。
- 键盘焦点、语义标签、触控目标、颜色对比和溢出检查。
- 390px Mobile、1024px / 1440px PC 的真实 Chromium 审计。
- T004-T007 深层 React 局部状态在 quality-state 往返后的保持性。
- 状态触发说明、自动化验证清单和失败报告。

## Out of scope

- 完整 WCAG 认证、生产级监控、跨浏览器矩阵。
- 把业务 code review 或普通 build 当作浏览器质量验收。

## Acceptance

- [x] 双端关键页面五态均可稳定触发。
- [x] error 有恢复动作，empty 有下一步，permission 有边界说明。
- [x] 关键按钮可键盘操作且移动端触控目标合格。
- [x] 390px、1024px、1440px 无明显横向溢出；关键恢复路径不被固定导航 / PrototypePanel 阻断。
- [x] T004-T007 深层 step / 子视图在 loading / empty / error 往返后保持局部状态。
- [x] 关键文本 / 主按钮颜色对比浏览器计算通过。
- [x] `npm run verify` 通过。

## Risks / Dependencies

- 前置：T003-T011 对应页面均已完成施工。
- 当前无外部阻塞。
- 风险：自动化浏览器检查能验证 DOM、布局尺寸、焦点、对比度和状态保持，但不能替代用户最终的产品视觉判断；本任务已获得用户明确最终验收。
- 轻微技术债：`PrototypeState` 仍保留已不参与渲染控制的 `view` prop；当前无运行时影响，后续可在不破坏调用合同的前提下清理。

## Implementation record

- 共享质量基线：PR #4 `feat: T012 prototype states and accessibility baseline`，merge `d6a10b5ef248bbd2405d308a98843bc0bffefa42`。
- 浏览器质量审计：PR #9 `test: T012 browser quality audit`，work branch `task/T012-browser-quality-audit`，merge `5ddd6c622cc2d5691b606ea9ea69b7b0ae7d719a`。
- 新增：`playwright.config.mjs`、`tests/browser/t012-quality.spec.mjs`、`.github/workflows/t012-browser-quality.yml`。
- Notes:
  - Prototype Runtime 的 loading / empty / error / permission 有可理解原因；empty / error / permission 有恢复动作；loading 有 `aria-busy`，error 使用 alert 语义。
  - ready / loading / empty / error 使用 `useSyncExternalStore` + history 事件在当前文档内切换；业务 children 位于稳定 wrapper，避免 React reconciliation 卸载深层 state。
  - 浏览器审计真实启动 Mobile / PC 两个 Vite 服务并使用 Chromium，不通过静态 grep 冒充浏览器证据。
  - 390px Mobile 覆盖五态、键盘可见焦点、44px 触控目标、核心颜色对比、T004 门店凭证、T005 商城结算、T006 体验券核销状态、T007 会员子视图 / replay / 券筛选恢复。
  - 1024px / 1440px PC 覆盖三角色五态横向溢出，并验证运营非默认“订单 / 核销”模块 error → ready 后保持当前模块。
  - 首轮真实 Chromium 审计抓到 Mobile PrototypePanel 遮挡 TabBar / CTA 与实际点击目标不足，均按真实产品缺陷修复，没有通过放宽断言绕过。
  - Browser Quality workflow 覆盖 `packages/shared/**` 与 `packages/icons/**`，共享 fixtures / icon 输入变化也会触发质量审计。

## Verification evidence

- 共享基线 CI：Verify Prototype #79 / #80 / #81 均 success；最终 OpenCode #14 `NO_BLOCKING_FINDINGS`。
- T007 收口证据：PR #8 merged；最终 Head `161c513` 的 Verify Prototype #109 success；OpenCode #38 `NO_BLOCKING_FINDINGS`。
- 浏览器质量中间证据：Head `349fef9` 的 T012 Browser Quality #6 13/13 Chromium tests success；同 Head Verify Prototype #116 success。
- 最终 PR #9 Head `1876dbe752083a2efe55869a2bf764c134f4c82c`：Verify Prototype #119 success；T012 Browser Quality #9 success；Experimental OpenCode PR Review #47 success，marked verdict `NO_BLOCKING_FINDINGS`。
- PR #9 已合入 `dev`，merge commit `5ddd6c622cc2d5691b606ea9ea69b7b0ae7d719a`。
- Page / Route：
  - Mobile：`?demoAuth=1&view=loading|empty|error|permission`；ready 为 `?demoAuth=1`。
  - PC 店主：`?role=merchant&view=...`。
  - PC 运营：`?role=operator&view=...`。
  - PC 管理层：`?role=management&view=...`。
- Other evidence: `docs/workbench/T012-state-quality-matrix.md` 记录详细审计矩阵。

## Status history

- 2026-08-31 `REVIEW → PASS`：PR #9 已以 latest-head Verify、真实 Chromium Browser Quality 与 marked OpenCode review 完成收口并合入 `dev`；用户随后明确确认前置任务全部验收通过。

## Review

- Reviewer: Tomz
- Result: PASS
- Conclusion: T012 的 390px / 1024px / 1440px、五态、深层状态恢复、触控目标、焦点、对比度和横向溢出均形成真实 Chromium 证据；latest-head CI / AI review 通过，PR #9 已合入 `dev`，用户最终验收通过。
- Follow-up: 无；T013 可直接开始跨端串联与 V0.1 总验收准备。

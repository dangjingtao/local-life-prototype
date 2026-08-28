# T012 · 关键状态、可访问性与原型质量

- Status: DOING
- Target version: 0.1.0
- Impact: Mobile / PC / Shared
- Owner: Mira

## Background

Prototype Runtime 已具备全局五态与恢复基线；T003-T011 对应业务页面现均已完成施工并进入可审计状态。T012 当前工作不再等待页面施工，而是统一验证状态恢复、响应式布局、键盘焦点、触控目标与颜色对比。

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

- [ ] 双端关键页面五态均可稳定触发。
- [x] error 有恢复动作，empty 有下一步，permission 有边界说明。
- [ ] 关键按钮可键盘操作且移动端触控目标合格。
- [ ] 390px、1024px、1440px 无明显横向溢出；关键恢复路径不被固定导航 / PrototypePanel 阻断。
- [ ] T004-T007 深层 step / 子视图在 loading / empty / error 往返后保持局部状态。
- [ ] 关键文本 / 主按钮颜色对比浏览器计算通过。
- [x] `npm run verify` 基线通过（PR #4 第二次返工 Head Verify Prototype #81 success）。

## Risks / Dependencies

- 前置：T003-T011 对应页面均已完成施工；T005、T006、T007 已进入业务 review / merge 状态。
- 当前无外部阻塞。未完成项属于 T012 自身质量施工与验收，不再表述为“等待 T005-T007”。
- 风险：全局状态不能替代业务级状态，因此必须进入门店、商城、抗衰、会员中心的深层流程抽查。
- 风险：自动化浏览器检查能验证 DOM、布局尺寸、焦点、对比度和状态保持，但不能替代用户最终的产品视觉判断。
- 轻微技术债：`PrototypeState` 仍保留已不参与渲染控制的 `view` prop；当前无运行时影响，后续可在不破坏调用合同的前提下清理。

## Implementation record

- 共享质量基线：PR #4 `feat: T012 prototype states and accessibility baseline`，merge `d6a10b5ef248bbd2405d308a98843bc0bffefa42`。
- 当前浏览器审计分支：`task/T012-browser-quality-audit`，基于 `dev@3dca4ef9ecb1ceaf856adc5e0732947cb84163ae`。
- 新增：`playwright.config.mjs`、`tests/browser/t012-quality.spec.mjs`、`.github/workflows/t012-browser-quality.yml`。
- Notes:
  - Prototype Runtime 的 loading / empty / error / permission 已有可理解原因；empty / error / permission 有恢复动作；loading 有 `aria-busy`，error 使用 alert 语义。
  - ready / loading / empty / error 使用 `useSyncExternalStore` + history 事件在当前文档内切换；业务 children 位于稳定 wrapper，避免 React reconciliation 卸载深层 state。
  - 浏览器审计真实启动 Mobile / PC 两个 Vite 服务并使用 Chromium，不通过静态 grep 冒充浏览器证据。
  - 390px Mobile 覆盖五态、键盘可见焦点、44px 触控目标、核心颜色对比、T004 门店凭证、T005 商城结算、T006 体验券核销状态、T007 会员子视图 / replay / 券筛选恢复。
  - 1024px / 1440px PC 覆盖三角色五态横向溢出，并验证运营非默认“订单 / 核销”模块 error → ready 后保持当前模块。
  - T007 已有 PR #8 merge `3dca4ef`、最终 Head `161c513`、Verify #109 success、OpenCode #38 `NO_BLOCKING_FINDINGS`；T007 任务卡在本分支同步推进到 `REVIEW`。

## Verification evidence

- 既有 CI：
  - 初始 Head `21a1296d8829e97da7b6d03e807c46c2d69050d1`：Verify Prototype #79 success。
  - 首轮返工 Head `8e3e64bcc3d9f481c0efb25e9836956bb1b171a3`：Verify Prototype #80 success。
  - 第二次返工 Head `6f3f2973b6f0046c5b835d344f6f7b381b8c449c`：Verify Prototype #81 success。
- 既有 AI Review：OpenCode #14 metadata Head 与 `6f3f297` 一致，最终 verdict `NO_BLOCKING_FINDINGS`。
- T007 收口证据：PR #8 merged；最终 Head `161c513` 的 Verify Prototype #109（run `33162212350`）success；Experimental OpenCode PR Review #38（run `33162212398`）success，verdict `NO_BLOCKING_FINDINGS`。
- 当前浏览器证据：等待本分支 `T012 Browser Quality` 的 current-head Chromium run；未运行前本卡不提前勾选浏览器验收项。
- Page / Route：
  - Mobile：`?demoAuth=1&view=loading|empty|error|permission`；ready 为 `?demoAuth=1`。
  - PC 店主：`?role=merchant&view=...`。
  - PC 运营：`?role=operator&view=...`。
  - PC 管理层：`?role=management&view=...`。
- Other evidence: `docs/workbench/T012-state-quality-matrix.md` 记录详细审计矩阵。

## Review

- Reviewer: Tomz
- Result: DOING
- Conclusion: 所有业务页面已具备审计对象，当前不存在“等待 T005-T007 施工”的阻塞。T012 已进入真实 Chromium 质量审计阶段。
- Follow-up: current-head 浏览器审计 + Verify + 独立 review 通过后，施工方可将 T012 推进到 `REVIEW`；是否 `PASS` 仍由用户验收决定。

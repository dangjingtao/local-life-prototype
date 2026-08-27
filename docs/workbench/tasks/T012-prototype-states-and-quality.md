# T012 · 关键状态、可访问性与原型质量

- Status: TODO
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
- [ ] error 有恢复动作，empty 有下一步，permission 有边界说明。
- [ ] 关键按钮可键盘操作且移动端触控目标合格。
- [ ] 390px、1024px、1440px 无明显溢出或遮挡。
- [ ] `npm run verify` 通过。

## Risks / Dependencies

- 前置：T003-T011 的对应页面完成。
- 风险：全局状态不能替代业务级状态，需按关键流程抽查。

## Implementation record

- Commit / PR:
- Changed paths:
- Notes:

## Verification evidence

- CI:
- Page / Route:
- Screenshot / Browser result:
- Other evidence:

## Review

- Reviewer: Tomz
- Result: REVIEW / PASS / BLOCKED
- Conclusion:
- Follow-up:

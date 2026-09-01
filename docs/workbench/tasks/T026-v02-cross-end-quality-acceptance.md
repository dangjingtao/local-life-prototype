# T026 · V0.2 跨端串联、中高保真质量与验收准备

- Status: TODO
- Target version: 0.2.0
- Impact: Mobile / PC / Shared / QA / Docs
- Owner: -

## Background

V0.2 不再是概念原型，最终需要证明 Mobile / PC 在业务、模拟数据和中高保真视觉上形成完整产品，而不是一组彼此独立的页面。

2026-09-01 T017 内部 UX 复审发现，既有 CI / 功能回归通过并不足以证明便利店已达到中高保真产品体验，因此新增 T027-T030 作为 T017 UX 返工与独立复审 gate。T030 未 PASS 前，本卡不得把便利店的“中高保真视觉完成度”视为已满足。

## Goal

完成 V0.2 跨端串联、状态与浏览器质量检查、PRD AC 对账，并把版本推进到可供用户总体验收的 REVIEW 状态。

## Product facts

- V0.2 要求 Mobile / PC 使用同一业务语义和共享模拟数据。
- 三条主流程为便利店即时履约、线上商城全国履约、智慧抗衰预约检测。
- V0.2 视觉目标为中高保真产品型原型。
- CI 通过不自动等于产品 PASS。

## Scope

- 串联并验证便利店：选店 → 加购 → 自提 / 短配 → PC 履约 / 核销。
- 串联并验证商城：Storefront / 商品 → 购物车 → 结算 / 物流 → PC 渠道 / 订单。
- 串联并验证智慧抗衰：项目 → 预约 → 核销 → 报告 / 历史 → PC 时段 / 预约 / 报告。
- 核对首页活动、全局搜索与 PC 活动 / 搜索运营关系。
- 核对同一 User / Store / Order / Appointment / Report 在两端的 fixture 一致性。
- 对 V0.2 新页面做 390px Mobile、1024px / 1440px PC 真实 Chromium 检查。
- 覆盖 ready / loading / empty / error / permission 及关键业务状态。
- 检查焦点、触控目标、对比度、横向溢出和关键 CTA 可达性。
- 逐项核对 `docs/product/01-v0.2-prd.md` 的 AC-V02 验收标准，并回写证据。

## Out of scope

- 在验收卡中偷偷新增业务范围或重构已通过模块。
- 真实后端 / 外部接口验证。
- AI 自行把 V0.2 总版本标为 PASS。

## Acceptance

- [ ] 三条 Mobile 主流程均可连续演示并找到对应 PC 承接。
- [ ] 首页活动、全局搜索、会员 / 权益等跨域能力不存在明显断链。
- [ ] 共享模拟数据在关键页面跨端一致。
- [ ] 390px、1024px、1440px 浏览器质量检查完成。
- [ ] V0.2 新页面关键状态、可访问性和中高保真视觉完成度完成评审；便利店部分必须引用 T030 的独立 UX `PASS` 证据。
- [ ] `npm run typecheck`、`npm run build` 以及项目已有验证脚本通过。
- [ ] PRD AC-V02-001 至当前全部验收项有可追踪证据或明确阻塞说明。
- [ ] 完成后只推进到 REVIEW，等待用户最终验收。

## Risks / Dependencies

- 前置：T016-T025 全部施工完成并至少进入 REVIEW / PASS 可验证状态；此外 T030 必须完成便利店 UX 复审并 `PASS`。
- 发现真实缺陷时优先回到对应业务卡修复，不在本卡无限扩张施工范围。

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

- Reviewer:
- Result: REVIEW / PASS / BLOCKED
- Conclusion:
- Follow-up:

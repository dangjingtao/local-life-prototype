# Prototype Work Ledger

> 统一记录产品决策、施工、评审和验证。路由存在不等于产品闭环存在；页面能看不等于业务已确认；CI 通过不等于产品验收通过。

## 当前基线

- Product Brief：`docs/product/00-product-brief.md`
- AI Skills：`docs/ai/skills.md`
- Daily Report Skill：`docs/ai/skills/daily-report.md`
- 日报目录：`docs/reports/daily/`
- 版本：`VERSION`
- 默认施工分支：`dev`
- 验收 / 发布分支：`prod`
- 业务项目不使用 `main` 作为工作分支
- 2026-08-31 验收前完整历史台账：`docs/workbench/archive/00-work-ledger-before-2026-08-31-acceptance.md`

## 默认规则

1. 可执行工作使用稳定编号，如 `T001`；编号创建后永久保留，不复用。
2. 简单、低风险任务可以只在总台账记录；跨端、多步骤、产品决策、明显风险 / 依赖或独立验收工作必须创建独立任务卡。
3. 默认状态流：`TODO → DOING → REVIEW → PASS`；任意执行态可进入 `BLOCKED`，取消使用 `CANCELLED`。
4. AI 可以推进到 `REVIEW`；除非用户明确授权验收，否则不得自行改成 `PASS`。
5. 每次状态变化至少留一个可追踪证据：commit / PR / 页面路径 / 浏览器证据 / CI run / 明确评审结论之一。
6. 产品事实变化时同步更新 Product Brief / 决策记录 / 任务卡中的至少一个真相源。
7. CI 通过、代码合并、页面存在都不单独等于产品验收通过。
8. 历史结论不得静默删除；主台账过长时允许原样归档，并在当前台账留下可追踪路径。

## 总状态

| 卡片 | 主题 | 类型 | 状态 | 目标版本 | 前置 | 证据 / 结果 |
| --- | --- | --- | --- | --- | --- | --- |
| T001 | 本地生活 V0.1 概念原型 | 产品 / 施工 | DOING | 0.1.0 | Product Brief、AI Skill Profile | T002-T012 前置已完成；等待 T013 跨端串联后进入总体验收 |
| T002 | 共享领域模型与演示数据 | Shared | PASS | 0.1.0 | T001 | `6cf267c`；Verify Prototype #2 success；统一实体、状态名称和跨端 fixtures |
| T003 | Mobile 登录、首页与统一账号入口 | Mobile | PASS | 0.1.0 | T002 | `1e35cec`；Verify #5；T012 390px Chromium 质量证据；2026-08-31 用户验收通过 |
| T004 | Mobile 线下门店自提闭环 | Mobile | PASS | 0.1.0 | T002、T003 | `7946292`；Verify #11；T012 深层状态 / 390px 质量证据；2026-08-31 用户验收通过 |
| T005 | Mobile 线上商城一件代发闭环 | Mobile | PASS | 0.1.0 | T002、T003 | PR #6；`dfb7288`；Verify #89；OpenCode #20 `NO_BLOCKING_FINDINGS`；T012 质量证据；用户验收通过 |
| T006 | Mobile 智慧抗衰体验闭环 | Mobile | PASS | 0.1.0 | T002、T003 | PR #7 merge `bdb4c6c`；Verify #104；OpenCode #34 `NO_BLOCKING_FINDINGS`；T012 质量证据；用户验收通过 |
| T007 | Mobile 会员、积分与权益中心 | Mobile | PASS | 0.1.0 | T002、T003 | PR #8 merge `3dca4ef`；Verify #109；OpenCode #38 `NO_BLOCKING_FINDINGS`；T012 质量证据；用户验收通过 |
| T008 | PC 工作台框架、角色与权限 | PC | PASS | 0.1.0 | T002 | `c1cb8d5`；Verify #6；T012 1024px / 1440px Chromium 质量证据；用户验收通过 |
| T009 | PC 店主与合作商工作台 | PC | PASS | 0.1.0 | T002、T008 | `47dcafe`；Verify #14；T012 PC 质量证据；用户验收通过 |
| T010 | PC 平台运营中台 | PC | PASS | 0.1.0 | T002、T008 | `5c07411` + `bdc9662`；Verify #37；T012 非默认模块状态保持 / PC 质量证据；用户验收通过 |
| T011 | PC 数据驾驶舱 | PC | PASS | 0.1.0 | T002、T008 | PR #3 merge `8b068c5`；Verify #77；marked OpenCode `NO_BLOCKING_FINDINGS`；T012 PC 质量证据；用户验收通过 |
| T012 | 关键状态、可访问性与原型质量 | QA / Shared | PASS | 0.1.0 | T003-T011 | PR #9 merge `5ddd6c6`；Head `1876dbe`：Verify #119、Browser Quality #9、OpenCode #47 全部 success；用户验收通过 |
| T013 | 跨端演示串联与 V0.1 验收准备 | Review / Docs | TODO | 0.1.0 | T002-T012 | 前置现已全部 PASS；待串联三条主流程、核对 AC-001 至 AC-010 并准备 T001 REVIEW |
| T014 | 实验性 PR AI Review | CI / Review | REVIEW | 0.1.0 | GitHub Actions、`OPENCODE_API_KEY` | 实验性、非 V0.1 产品验收阻塞项；保持独立 REVIEW |

## 状态约定

- `TODO`：目标与范围已足够进入施工，但尚未开始
- `DOING`：正在执行
- `BLOCKED`：依赖产品决定、外部条件或前置任务
- `REVIEW`：施工方已完成自检，等待独立评审 / 用户确认
- `PASS`：验收通过；必须有明确验收证据
- `CANCELLED`：任务不再执行，但历史继续保留

## 2026-08-31 验收记录

- PR #9 `test: T012 browser quality audit` 已合入 `dev`，merge `5ddd6c622cc2d5691b606ea9ea69b7b0ae7d719a`。
- PR #9 最终 Head `1876dbe752083a2efe55869a2bf764c134f4c82c` 的 Verify Prototype #119、T012 Browser Quality #9、Experimental OpenCode PR Review #47 均成功；marked OpenCode verdict 为 `NO_BLOCKING_FINDINGS`。
- T012 Browser Quality 使用真实 Chromium 覆盖 390px Mobile、1024px / 1440px PC、五态、T004-T007 深层状态恢复、可见焦点、44px 触控目标、核心颜色对比与横向溢出。
- 用户明确确认“前面所有任务都通过了”；据此将已经完成施工并处于 REVIEW 的 T003-T012 统一验收为 `PASS`。这是一条用户验收证据，不是由 CI 或 AI review 自动推导 PASS。
- T002 原本已为 `PASS`；T001 是 V0.1 总卡，仍等待 T013 串联与总体验收；T014 为独立实验性 Review，不纳入本次前置产品任务批量 PASS。
- T003-T012 各独立任务卡已同步最终状态、视觉 / 浏览器证据和 Review 结论，避免任务卡与总台账状态漂移。

## 历史记录

2026-08-27 至 2026-08-28 的完整逐项施工、返工、CI、OpenCode / Codex Review 与状态变更记录未删除，已原样归档到：

`docs/workbench/archive/00-work-ledger-before-2026-08-31-acceptance.md`

后续需要追溯某一张卡的细节时，优先读取该任务卡；需要追溯此前全项目时间线时读取归档台账。

## 下一步

1. T002-T012 已全部 `PASS`。
2. 直接执行 T013：串联门店自提、线上商城一件代发、智慧抗衰三条主流程，并核对 AC-001 至 AC-010。
3. T013 完成后把 T001 推进到 `REVIEW`；未经用户最终总体验收，不自动将 T001 标为 `PASS`。
4. T014 继续作为实验性 PR AI Review 独立观察，不阻塞 V0.1 产品收口。

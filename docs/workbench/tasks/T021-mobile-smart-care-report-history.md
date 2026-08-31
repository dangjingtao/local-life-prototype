# T021 · Mobile 智慧抗衰检测报告、转化与历史对比

- Status: TODO
- Target version: 0.2.0
- Impact: Mobile / Shared
- Owner: -

## Background

V0.2 已确认检测报告升级为结果数据 + 个性化护理建议 + 专属券 + 护理套餐 + 复测提醒，并在“我的检测”中沉淀历次记录与报告对比。

## Goal

完成智慧抗衰检测完成后的中高保真报告与后续转化体验，让报告既像可信的数据产品，又能自然承接护理和复测。

## Product facts

- 报告仍是消费服务 / 护理建议，不是医疗诊断。
- 同一用户至少存在多次检测记录以支持历史对比。
- 报告必须包含结果数据、护理建议、专属券、套餐入口、复测提醒。

## Scope

- 报告详情：检测上下文、结果指标、结构化数据表达、解释文案。
- 个性化护理建议模块。
- 专属券 / 限时权益与护理套餐 CTA。
- 复测提醒。
- “我的检测”列表：日期、门店、项目、报告入口。
- 历史报告对比：至少支持同一项目两次检测的指标 / 状态对照表达。
- 使用 T015 fixtures，报告与 T020 Appointment / Detection Record 关系一致。

## Out of scope

- 真实 AI 趋势分析、真实护理建议生成、真实医疗指标。
- PC 报告管理与转化配置，交给 T023。

## Acceptance

- [ ] 检测完成后可进入完整报告页。
- [ ] 报告至少有 3 类可读指标 / 数据表达，并附非医疗语义说明。
- [ ] 护理建议、专属券、套餐、复测提醒均可见且有合理交互承接。
- [ ] “我的检测”能查看至少 2 次历史记录。
- [ ] 历史报告对比能直观辨认时间、门店 / 项目和指标差异。
- [ ] 视觉达到中高保真科技 / 专业 / 高端服务感，不做空洞赛博装饰。
- [ ] 390px Mobile 真实浏览器验证通过。
- [ ] `npm run typecheck`、`npm run build` 通过。

## Risks / Dependencies

- 前置：T015、T020。
- 不得用模拟数据暗示未经确认的医学准确率。

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

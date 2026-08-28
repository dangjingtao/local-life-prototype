# T010 · PC 平台运营中台

- Status: REVIEW
- Target version: 0.1.0
- Impact: PC / Shared
- Owner: Mira

## Background

平台运营需要从统一中台理解用户、合作商、门店、商品/服务、订单/核销和会员营销之间的关系。

## Goal

完成运营总览及六类核心管理模块的可浏览结构，并支持按三大业务场景区分数据。

## Product facts

- 用户详情需关联来源、会员、订单、积分和报告。
- 订单及经营数据需区分线下门店、线上商城和智慧抗衰。
- V0.1 只表现管理结构，不实现生产配置与数据写入。

## Scope

- FR-601 至 FR-606。
- 用户、合作商/门店、商品/服务、订单/核销、会员营销管理。
- 列表、详情和筛选的概念交互。

## Out of scope

- 真实增删改、批处理、审批、审计日志与外部接口。

## Acceptance

- [x] 六类核心模块均有清晰入口和代表性详情。
- [x] 用户 LL-8888 的跨场景数据关联可查看。
- [x] 订单与经营数据可按三大场景区分。
- [ ] 1440px 与 1024px 完成视觉检查。
- [x] `npm run build:pc` 通过。

## Risks / Dependencies

- 前置：T002、T008。
- 风险：管理操作若无概念边界，容易被误解为已实现。

## Implementation record

- Commit / PR: `5c07411f6acc5c277fd9c9227b7af48e7a546f41`; fix `bdc966279b99a85507eb37d638f54afda8b03b43`
- Changed paths: `apps/pc/src/OperatorConsole.tsx`; `apps/pc/src/main.tsx`
- Notes: 运营端从 T008 占位结构拆出独立中台，覆盖运营总览、用户、合作商/门店、商品/服务、订单/核销、会员、营销六类模块；默认/`?role=operator` 进入运营中台，`merchant` / `management` 继续使用既有 T009 / T011 壳，降低跨任务竞态。

## Verification evidence

- CI: 首轮 `Verify Prototype #36`（run `33138072750`）在 PC typecheck 暴露用户选择 state 字面量推导错误；修复后 `Verify Prototype #37`（run `33138195893`）success，版本合同、全仓 typecheck、全仓 build 均通过。
- Page / Route: PC 默认入口或 `?role=operator`；`?role=operator&view=permission` 可验证运营越权状态；模块内可切换全部 / 线下门店 / 线上商城 / 智慧抗衰场景。
- Screenshot / Browser result: 当前执行环境无法完成 1440px / 1024px 浏览器视觉检查，留待 Review 补证。
- Other evidence: `LL-8888` 详情直接关联来源、会员、积分、订单、优惠券 / 体验券、常用门店与检测报告；营销模块仅展示共享数据已建模的券资产，未虚构活动编排、自动化营销、人群包或发送渠道。

## Review

- Reviewer: Tomz
- Result: REVIEW
- Conclusion: 六类运营模块、代表性用户详情与三场景筛选已完成，自动验证通过；等待 1440px / 1024px 视觉复核与用户验收，未自动提升为 PASS。
- Follow-up: 视觉确认后收口 T010；T011 继续保持管理层只读驾驶舱独立施工，不把运营写入能力扩进驾驶舱。

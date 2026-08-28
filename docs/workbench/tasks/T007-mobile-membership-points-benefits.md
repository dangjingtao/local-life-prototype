# T007 · Mobile 会员、积分与权益中心

- Status: REVIEW
- Target version: 0.1.0
- Impact: Mobile / Shared
- Owner: Mira

## Background

会员、积分和券是三个业务场景共同的私域承接层，需要统一展示但不能固化未确认的规则。

## Goal

完成会员中心、等级、积分明细/兑换、优惠券、体验券和主动任务的概念闭环。

## Product facts

- 候选等级为普通、银卡、金卡、黑卡、黑金卡。
- 积分可来自注册、消费、到店、自提、检测、体验和任务。
- 比例、倍率、有效期和成本承担机制均待确认。

## Scope

- FR-401 至 FR-406，并承接 FR-003、FR-004、FR-005。
- 权益的可用、已用、过期、核销及积分流水状态。
- 抵现、兑换、积分加现金、抽奖和权益包的候选表达。

## Out of scope

- 固定积分汇率、真实权益库存、广告任务、抽奖或第三方权益供应链。

## Acceptance

- [x] 用户可查看积分、券、订单和报告入口。
- [x] 至少一条积分获取与一条兑换状态变化可演示。
- [x] 未确认规则明确标注为候选或待确认。
- [ ] 完成 390px 视觉与交互检查（转入 T012 统一质量审计）。
- [x] `npm run build:mobile` / 全仓 Verify 对应 Mobile build 通过。

## Risks / Dependencies

- 前置：T002、T003；与 T004-T006 共享奖励结果。
- 风险：展示示例容易被误读为正式会员规则。

## Implementation record

- Commit / PR: `ff8aee1` 新增会员中心；`ef128c6` 接入 Mobile “我的” Tab；PR #8；最终 Head `161c513f7f169122ee84c9263da57787ae813b6e`；merge `3dca4ef9ecb1ceaf856adc5e0732947cb84163ae`。
- Changed paths: `apps/mobile/src/MembershipCenterScreen.tsx`；`apps/mobile/src/App.tsx`。
- Notes:
  - 会员、等级、积分、券、订单、报告和核销均直接消费 `@prototype/shared` 的 `LL-8888` 数据。
  - 积分获取与兑换交互只重放 Shared 已存在的 `POINT-8888-003` / `POINT-8888-004` 历史流水，不新增固定奖励或兑换规则，也不修改 1280 当前余额。
  - Codex 首轮 P2 指出 replay 不能依赖“最新 earn / exchange”或 fixture 顺序；复核成立，已改为显式固定上述两条历史流水 ID。
  - 当前账号没有 expired 券 fixture，因此“已过期”保持真实空态；主动任务只有来源能力被确认，任务内容 / 奖励额度未建模，因此只表达能力占位。

## Verification evidence

- CI: 最终 Head `161c513f7f169122ee84c9263da57787ae813b6e` 的 Verify Prototype #109（run `33162212350`）success；全仓 typecheck / build 通过。
- AI Review: Experimental OpenCode PR Review #38（run `33162212398`）success；marked comment Head 与 `161c513` 一致，verdict `NO_BLOCKING_FINDINGS`。Codex replay P2 已返工并复核。
- Page / Route: 登录后底部“我的” → 会员中心 → 积分 / 券 / 统一账号记录。
- Screenshot / Browser result: 390px 实际浏览器检查转入 T012 统一执行，不在 T007 重复造一套验收流程。
- Other evidence: PR #8 已合入 `dev`，merge `3dca4ef`。

## Review

- Reviewer: Tomz
- Result: REVIEW
- Conclusion: T007 业务施工、CI 与独立代码 review 已完成并合入 `dev`；不再作为 T012 的“未施工前置”。390px、状态恢复、键盘焦点、触控目标和对比度由 T012 统一质量审计收口。
- Follow-up: 等待 T012 浏览器质量证据；本卡不自动进入 `PASS`。

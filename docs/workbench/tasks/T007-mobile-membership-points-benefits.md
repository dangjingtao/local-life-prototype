# T007 · Mobile 会员、积分与权益中心

- Status: TODO
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

- [ ] 用户可查看积分、券、订单和报告入口。
- [ ] 至少一条积分获取与一条兑换状态变化可演示。
- [ ] 未确认规则明确标注为候选或待确认。
- [ ] 完成 390px 视觉与交互检查。
- [ ] `npm run build:mobile` 通过。

## Risks / Dependencies

- 前置：T002、T003；与 T004-T006 共享奖励结果。
- 风险：展示示例容易被误读为正式会员规则。

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

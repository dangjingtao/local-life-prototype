# Task Cards

任务卡按稳定编号保存，例如 `T001-login.md`。编号创建后永久保留，不复用。

任务卡不是为了制造流程，而是为了让产品、AI、代码和评审对同一份合同说话。

## 什么时候必须建独立任务卡

出现以下任一情况时，不要只写总台账：

- 跨 PC / Mobile
- 多步骤施工
- 涉及产品规则或重要决策
- 存在依赖、风险或迁移
- 需要明确验收标准
- 需要独立 Review

简单、低风险、单点调整可以只记录在 `00-work-ledger.md`。

## 标准模板

```md
# T001 · 任务名

- Status: TODO
- Target version: 0.1.0
- Impact: Mobile / PC / Shared / CI/CD / Docs
- Owner: -

## Background

为什么做这件事。

## Goal

这张卡要验证 / 完成什么。

## Product facts

已经确认的事实。不要把推断写进这里。

## Scope

本卡包含什么。

## Out of scope

本卡明确不做什么。

## Acceptance

- [ ] 可观察、可判断的验收条件
- [ ] 关键状态 / 动线已验证
- [ ] 必要的 typecheck / build / test 已完成

## Risks / Dependencies

- -

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
```

## 状态规则

默认状态流：

```text
TODO → DOING → REVIEW → PASS
          ↘ BLOCKED ↗
```

取消使用 `CANCELLED`，不删除历史。

AI 默认可以创建任务、更新施工记录、补验证证据并推进到 `REVIEW`。除非用户在 `docs/ai/skills.md` 明确授权自动验收，AI 不得自行把任务从 `REVIEW` 改为 `PASS`。

CI / build / test 通过只能作为 Review evidence，不能单独证明产品验收通过。

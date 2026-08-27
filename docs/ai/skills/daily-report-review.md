# Skill · Daily Report Review

## 目的

对已经生成的项目日报进行独立查收和复核，确认日报是否真实反映了当天 GitHub、任务台账、任务卡和验证结果。

本 Skill 不负责重新写一份日报。它负责回答：**这份日报能不能信、漏了什么、错了什么、项目负责人现在最需要看什么。**

## 触发方式

用户说以下任一意思时执行：

- 查收今天日报
- 审一下今天日报
- 看看日报有没有漏
- 帮我收一下今天项目日报

## 输入

默认读取：

1. `docs/reports/daily/YYYY-MM-DD.md`
2. `prototype.config.json`
3. `docs/governance/contributors.md`
4. `docs/workbench/00-work-ledger.md`
5. 当天相关 `docs/workbench/tasks/T*.md`
6. `dev` 当天 GitHub commits
7. 当天如有发布的 `prod` commits
8. 相关 PR / CI / Review / Preview / Production 证据

如果 `prototype.config.json.repository.url` 已配置，优先通过实际 GitHub repository 回查，不只依赖本地 Git 历史。

## 身份核验

对日报中涉及人的归属做以下检查：

1. 优先读取 GitHub API / Connector 返回的 `author.login` / PR author。
2. 对照 `prototype.config.json.contributors[].github.login`。
3. 只有 verified GitHub login 才可以显示为 `Name (@login)`。
4. 如果只能获得 Git name/email，标记为 `unverified Git identity`。
5. bot / automation 不得归为 human contributor。
6. Mira 没有真实 GitHub 身份时，不得把 GitHub commit 归为 Mira。

## 查收检查

### A. 完整性

检查当天实际 commits / PR / CI / task changes 是否都进入日报。

### B. 真实性

检查日报中的“完成 / 修复 / 发布 / PASS”等词是否有对应证据。

### C. 台账一致性

检查日报、总台账和任务卡状态是否一致。

### D. Contributor 归属

检查每个关键改动是否能关联实际 GitHub contributor；无法验证时明确标记。

### E. 发布状态

检查 Preview / Production / CI 的实际状态，不能把“workflow 存在”写成“发布成功”。

## 查收结论

只允许使用以下三个结论：

- `ACCEPTED`：日报与可核验证据一致，没有影响理解的遗漏。
- `ACCEPTED_WITH_NOTES`：主体可信，但存在轻微遗漏、未验证身份或台账小偏差。
- `NEEDS_CORRECTION`：存在错误完成状态、重要漏报、错误 contributor 归属、虚假验证或关键台账偏差。

## 默认输出

在对话中给用户一个简洁查收结果：

```md
# 日报查收 · YYYY-MM-DD

结论：ACCEPTED / ACCEPTED_WITH_NOTES / NEEDS_CORRECTION

## 今天真正发生的事
- Txxx · ... · Tomz (@dangjingtao) · commit abcd123

## 需要关注
- ...

## 日报偏差
- 无 / ...

## 发布与验证
- CI: ...
- Preview: ...
- Production: ...

## 建议动作
1. ...
```

如果用户要求把查收结果落档，可在原日报底部追加：

```md
## Daily Report Review

- Reviewed at: ...
- Result: ACCEPTED_WITH_NOTES
- Reviewer: ...
- Notes: ...
```

默认不另建 `*.review.md`，避免同一天产生两套日报真相源。

## 权限

除非 Skill Profile 已明确授权，否则本 Skill：

- 不修改任务状态
- 不把 REVIEW 改成 PASS
- 不改 VERSION / CHANGELOG
- 不部署
- 不自动 commit / push
- 不静默修改原日报

发现日报错误时，先向用户指出；用户要求修正时再更新同一个日报文件。

# Skill · Daily Report

## 目的

根据项目当天真实发生的 GitHub / Git 提交、工作台账、任务卡和可验证结果，生成一份可追溯的项目日报。

日报不是聊天摘要，也不是根据记忆补写。它必须回答：**今天这个项目实际改了什么，哪些任务推进了，谁在 GitHub 上产生了这些改动，证据是什么，还有什么没有闭环。**

## 启用方式

本 Skill 随 Seed 提供，但是否作为当前项目的常用技能，应在 `docs/ai/skills.md` 的 AI Skill Interview 中由用户确认。

用户说“生成日报 / 写今天日报 / 整理今日项目改动”等等，即可执行。

日报查收和复核由独立 Skill `docs/ai/skills/daily-report-review.md` 负责。

## 数据范围

默认读取当前项目在“当天本地时间”内的以下信息：

1. `dev` 分支当天 commit；如当天 `prod` 有发布或合并，也读取 `prod`。
2. `prototype.config.json` 中 repository 与 contributors 身份配置。
3. `docs/governance/contributors.md`。
4. `docs/workbench/00-work-ledger.md`。
5. 当天涉及或状态发生变化的 `docs/workbench/tasks/T*.md`。
6. 与上述任务相关、当前可访问的 PR / CI / 页面验证证据。
7. 工作区未提交变化可以作为 `WIP / 未提交` 提示，但不得算作已完成成果。

如果 GitHub repository URL 已记录在 `prototype.config.json.repository.url`，优先用实际 GitHub repository 校验远端 commit / PR / CI 信息；没有 URL 时使用当前 Git remote / 本地 Git 历史。

## Contributor 身份归属

日报不能只读取 commit message 或 Git author 字符串后就断言“谁做了”。

按以下优先级识别 contributor：

1. 优先读取 GitHub API / Connector 返回的 commit `author.login`、PR author 等平台身份。
2. 对照 `prototype.config.json.contributors[].github.login`。
3. verified login 匹配后，可以显示为 `Name (@login)`。
4. 如果 GitHub 未关联账号，只能退回 Git commit author name/email，并标记 `unverified Git identity`。
5. bot / automation 不得归给 human contributor。
6. Mira 没有真实 GitHub Bot / App 账号时，不得把 GitHub commit 归为 Mira。

Contributor 信息用于可追溯归属，不用于按 commit 数、行数或工作量评价人员。

## 证据优先级

日报中的“已完成 / 已实现 / 已修复”必须至少有一种实际证据：

- commit
- merged PR
- CI / build / test 结果
- 可定位页面 / 功能验证记录
- 用户明确验收结论

任务卡的文字本身不是“完成”的充分证据。

## 对账规则

生成日报前必须做一次 commit ↔ task ledger ↔ contributor 对账。

### 有 commit，有任务卡

把实际 diff / commit 内容与任务卡目标对齐后总结，不照抄 commit message；能验证 GitHub login 时记录 contributor。

### 有 commit，没有任务卡

日报中列为 `未归档改动`，说明 commit、实际变化和 contributor，并建议是否回补任务卡 / 台账。

### 任务卡标记完成，但没有可验证证据

不得写成“已完成”；列为 `状态待核验`。

### 任务卡仍 DOING / REVIEW，但 commit 已经产生

按实际进度描述，并保留任务卡当前状态，不擅自改成 PASS。

### commit 与任务卡描述不一致

优先报告实际代码 / 文档变化，并把差异列入 `台账偏差`。

### contributor 无法验证

不要猜 GitHub 用户；写为 `unverified Git identity`，并在需要时建议补 contributor identity。

## 输出位置

```text
docs/reports/daily/YYYY-MM-DD.md
```

同一天重复生成时更新同一个文件，不创建 `-v2` / `final` 等重复日报。

## 默认格式

```md
# 项目日报 · YYYY-MM-DD

## 今日结论

用 2–5 条说明今天真正推进了什么。

## 实际改动

### Txxx · 任务标题
- 实际变化：
- Contributor: Tomz (@dangjingtao) / unverified Git identity
- 影响范围：Mobile / PC / Shared / Docs / CI/CD
- 状态：DOING / REVIEW / PASS / ...
- 证据：commit / PR / CI / review

## 未归档改动

- commit xxxx · Contributor: ... · ...

## 验证与发布

- Typecheck / Build / Test / Preview / Production 的实际结果。

## 台账偏差

- 任务卡与实际 commit 不一致的地方。
- 没有则写“无”。

## 身份待核验

- 无法映射到 verified GitHub contributor 的提交。
- 没有则写“无”。

## 阻塞与风险

- 只写当前仍真实存在的阻塞 / 风险。

## 下一步

- 根据当前任务状态提出 1–5 个下一步，不把尚未决定的事项写成既定任务。
```

## 写作要求

- 简洁、事实优先，适合直接给项目负责人或管理者阅读。
- 每个关键结论尽量带 `Txxx`、短 commit SHA 和可验证 contributor。
- 不把“讨论过 / 想过 / AI 建议过”写成“已实现”。
- 不根据 commit 数量评价工作量或人员表现。
- 不为了让日报显得充实而扩写无实际变化的内容。
- 如果当天确实没有项目改动，可以生成一份明确写“无已提交实际改动”的日报。

## 权限

Daily Report Skill 默认只读取与整理事实，并写入 `docs/reports/daily/`。

除非 `docs/ai/skills.md` 已明确授权，否则生成日报时：

- 不修改任务状态
- 不把 REVIEW 改成 PASS
- 不修改 VERSION
- 不触发部署
- 不自动 commit / push
- 不静默修改 contributor identity

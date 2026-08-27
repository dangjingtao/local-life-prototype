# Com Design Prototype · AI 协作完整说明书

> 适用于由 `mira create prototype` 生成的业务原型项目。
>
> Authors: Tomz <dangjingtao@gmail.com> & Mira <mira@tomz.io>
>
> GitHub identity: Tomz → `@dangjingtao` (verified)；Mira → AI collaborator, no GitHub account.

## 1. 这套项目是怎么工作的

Com Design Prototype 不是普通前端脚手架。它把产品讨论、AI 协作、任务台账、版本控制、贡献者身份、双端原型、Review、日报、日报查收和 CI/CD 放在同一个 Git 项目里。

默认工作闭环：

```text
项目初始化
→ AI Skill Interview
→ GitHub / Contributor Identity
→ 产品事实 / Product Brief
→ 任务台账 / Txxx
→ dev 施工
→ 本地验证 / CI / Preview
→ REVIEW
→ 用户或授权评审者验收
→ PASS
→ 日报
→ 日报查收
→ prod
```

这套流程的核心原则只有一句：**聊天不是事实源，任务卡不是完成证据，Git name/email 不是 GitHub 身份，CI 绿也不等于产品验收通过。**

---

## 2. 新项目第一次怎么开始

### 2.1 创建项目

```bash
mira create prototype
```

也可以参数化：

```bash
mira create prototype demo \
  --title="Demo Product" \
  --targets=mobile,pc \
  --deploy=github,cloudflare
```

CLI 初始化阶段会确认：

- Project name：目录 / npm / 工程名
- Product title：面向人的产品展示名
- Targets：Mobile / PC
- Deployment：GitHub Pages / Cloudflare

生成后的业务项目默认从自己的 `0.1.0` 开始，并以 `dev` 作为初始工作分支。

### 2.2 第一次把项目交给 AI

对 AI 说：

```text
请先按 AGENTS.md 初始化这个项目。
先读取项目规则和现状，不要施工。
通过交互式问答和我确认 AI Skills、项目名、GitHub 仓库和 Contributors；如果项目已有 GitHub 仓库，我会直接把地址贴给你。
```

AI 应先读取：

1. `prototype.config.json`
2. `VERSION`
3. `docs/product/00-product-brief.md`
4. `docs/workbench/00-work-ledger.md`
5. `docs/governance/contributors.md`
6. `docs/ai/skills.md`
7. 当前任务卡（如有）
8. 本说明书

如果 AI 没读规则就直接开始改代码，应立即叫停。

---

## 3. AI Skill Interview

`docs/ai/skills.md` 初始状态是 `PENDING`。

Skill Interview 的目的不是填表，而是让 AI 与用户确认：**这个项目是谁、在哪个仓库、有哪些贡献者、AI 到底能做什么、不能做什么、需要什么工具。**

AI 应采用自然问答，每次只确认 1–2 个关键问题，不要一次抛几十项。

### 3.1 Project name / title

AI 先核对：

```json
{
  "project": {
    "name": "demo",
    "title": "Demo Product"
  }
}
```

如果初始化时名字已经正确，不要重复要求用户填写。

如果用户修改展示名称，区分：

- `project.name`：工程标识，谨慎改动
- `project.title`：产品展示名称，可以按产品决定修改

### 3.2 GitHub repository

如果已有仓库，用户直接在聊天里粘贴 URL：

```text
https://github.com/example/demo
```

AI 应校验后写入：

```json
{
  "repository": {
    "provider": "github",
    "url": "https://github.com/example/demo"
  }
}
```

如果还没有仓库，保持 `url: null` 即可，不阻塞产品工作。

### 3.3 Contributors / GitHub Identity

身份规则见：

```text
docs/governance/contributors.md
```

默认 Seed 作者身份：

```text
Tomz <dangjingtao@gmail.com>
→ type: human
→ role: owner
→ GitHub: @dangjingtao
→ verified: true

Mira <mira@tomz.io>
→ type: ai-collaborator
→ role: co-author
→ GitHub: none
```

AI 应询问这是否仍适用于当前业务项目；如果还有其他 human contributor，要求用户提供 GitHub login 或 profile URL。

只有实际校验过 GitHub 账号后，才能把 `github.verified` 写为 `true`。

**Git commit 的 name/email 不是 GitHub identity。** 不允许因为名字一样或邮箱一样就声明账号已验证。

Mira 当前没有真实 GitHub Bot / App 账号，因此 `github` 必须保持 `null`；不得伪造 Mira GitHub 账号，也不得把其他人的 commit 归给 Mira。

### 3.4 AI 角色

按项目实际情况确认，例如：

- Product Discovery / PRD
- Requirement Review
- UI / Interaction Design
- Frontend Implementation
- PC / Mobile Adaptation
- Design System Compliance
- Test / Regression
- Code Review
- Documentation
- Git / Release
- CI/CD / Deployment
- Daily Report
- Daily Report Review

### 3.5 工具与连接

确认允许使用哪些外部能力，例如：

- GitHub
- 浏览器 / Web Research
- Figma / Penpot
- Cloudflare
- GitHub Pages
- MCP / Connector
- 其他项目工具

### 3.6 AI 自主权限

逐项确认 AI 是否可以：

- 修改代码
- 修改产品文档
- 创建 / 更新任务卡
- 更新总台账
- 更新 contributor identity
- commit / push
- 创建 PR
- 合并 PR
- 修改 VERSION / CHANGELOG
- 配置 CI/CD
- 部署 Preview
- 部署 Production
- 生成日报
- 自动 commit / push 日报
- 查收 / 复核日报
- 把查收结果追加到原日报

### 3.7 验证目标和禁区

确认这个项目现在最重要的是验证什么，以及哪些事情明确不要做。

例如：

- 只验证核心闭环，不建设生产后端
- 不新增未经确认的业务需求
- 不更换设计系统
- 不自行改变业务规则
- 不自动发布 Production

用户确认后，AI 才把 `docs/ai/skills.md` 改为 `CONFIRMED`。

如果后续权限、工具、repository、contributors 或项目阶段发生明显变化，应改为 `REVIEW_REQUIRED` 并重新确认。

---

## 4. GitHub 与分支规则

业务项目只有两条长期分支：

```text
dev  → 日常施工 / 集成 / CI / Preview
prod → 已验收基线 / Production
```

**业务项目不使用 `main` 作为工作、集成或发布分支。**

短生命周期分支可以使用：

```text
task/T023-team-flow
fix/T031-empty-state
```

但最终都回到 `dev`。

### 4.1 dev

用于：

- 产品施工
- PC / Mobile 联调
- 日常提交
- CI
- Preview deployment
- Review 前集成

### 4.2 prod

用于：

- 已明确验收的版本
- Production deployment
- 发布基线

不要直接在 `prod` 上做日常开发。

### 4.3 main

如果 GitHub 平台因为默认行为创建了一个空 `main`，它不进入本项目工作流。是否删除由用户决定。

---

## 5. Contributor Identity 怎么工作

项目贡献者真相源：

```text
prototype.config.json.contributors
docs/governance/contributors.md
```

日报和 Review 判断“谁产生了这次 GitHub 改动”时，按以下顺序：

1. GitHub API / Connector 返回的 commit `author.login`、PR author 等平台身份。
2. 与 `contributors[].github.login` 对照。
3. verified login 匹配后，可显示为 `Name (@login)`。
4. GitHub 没有关联 login 时，才退回 Git commit author name/email。
5. 回退结果必须标记 `unverified Git identity`。
6. bot / automation 不得归给 human contributor。

Contributor 信息只做事实追溯，不用于按 commit 数、代码行数评价个人工作量。

---

## 6. 用户提出新需求时怎么和 AI 说

最简单的说法：

```text
新需求：……
先评审，不施工。
```

AI 应先做三件事：

1. 找到相关 Product Brief、任务卡、代码和已有规则。
2. 区分事实、推断、待确认事项。
3. 只询问那些无法从项目中查出、并且会改变产品结论的问题。

不要为了“走流程”重复问已经写在项目里的信息。

如果需求已经足够明确，AI 应直接给出影响范围和建议落档位置。

---

## 7. 什么时候建任务卡

工作总入口：

```text
docs/workbench/00-work-ledger.md
```

任务使用稳定编号：

```text
T001
T002
T003
```

编号一旦创建，不复用、不因为排序变化而改变。

简单低风险事项可以只进总台账。

出现以下任一情况，必须创建独立任务卡：

- 跨 PC / Mobile
- 多步骤施工
- 涉及产品规则变化
- 有风险或外部依赖
- 有明确独立验收标准
- 需要独立 Review

任务卡位于：

```text
docs/workbench/tasks/
```

最低应包含：

- ID / 标题
- 背景与目标
- Product facts
- Scope
- Out of scope
- Acceptance
- 影响端
- 风险 / 依赖
- 验证方式
- Implementation record
- Evidence
- Review

---

## 8. 任务状态规则

默认状态流：

```text
TODO → DOING → REVIEW → PASS
```

另外允许：

```text
BLOCKED
CANCELLED
```

含义：

- `TODO`：范围和目标已经足够施工
- `DOING`：正在执行
- `BLOCKED`：被决策、依赖或外部条件阻塞
- `REVIEW`：施工完成自检，等待独立评审或用户确认
- `PASS`：已经明确验收通过
- `CANCELLED`：不再执行，但历史保留

默认情况下，AI 可以推进到 `REVIEW`，但**不能自己从 `REVIEW` 改成 `PASS`**，除非用户已经在 Skill Profile 中明确授权自动验收。

CI 通过、build 成功、代码已提交，都只是证据，不自动等于 PASS。

---

## 9. 让 AI 开始施工

确认方案后可以说：

```text
按刚才确认的方案施工。
工作分支 dev，同步任务卡和台账。
完成后做真实验证并进入 REVIEW，不要自行 PASS。
```

AI 开工前应检查：

- 当前 Git 分支
- 当前任务卡
- 产品事实
- 相关代码现状
- 是否有并行未合并工作
- Skill Profile 是否允许当前操作

施工中遵循最小必要改动，不主动扩大需求。

---

## 10. 验证要求

AI 不得伪造验证结果。

能执行时，应按任务需要做：

- typecheck
- build
- test
- browser / UI verify
- Preview verify
- API / mock flow verify

如果某项无法执行，要明确写：

```text
未验证：xxx
原因：xxx
```

而不是写“应该没问题”。

关键页面至少考虑：

- ready
- loading
- empty
- error
- permission

Prototype Runtime 可用于切换这些状态。

---

## 11. 用户如何评审 AI 的施工

可以直接说：

```text
评审 T023。
先看任务卡、commit、实际代码和验证证据，不要先下结论。
```

AI 的评审应尽量按这个顺序组织：

1. **观察**：实际代码 / 文档 / 行为是什么
2. **推断**：可能造成什么影响
3. **判断**：是否符合任务合同
4. **问题**：原因、范围、严重度
5. **建议**：需要修什么，哪些不必动

不要为了显得严格而制造问题，也不要因为“整体不错”跳过真实缺陷。

如果评审发现 bug，先讨论 bug 的原因、范围和严重度，再决定是否新建修复任务卡。

---

## 12. 需求中途变化怎么办

对 AI 说：

```text
T023 的需求改了：……
先评估影响，不要直接改代码。
```

AI 应：

1. 保留旧需求和旧结论。
2. 写清新结论替代了什么。
3. 说明影响任务、页面、数据或版本的范围。
4. 更新 Product Brief / 决策记录 / 任务卡中的真相源。
5. 再进入施工。

不要静默覆盖旧内容，让以后无法知道为什么改。

---

## 13. 版本控制

详细规则见：

```text
docs/governance/version-control.md
```

项目使用 SemVer：

```text
MAJOR.MINOR.PATCH
```

版本真相源：

```text
VERSION
package.json.version
prototype.config.json.versioning.currentVersion
CHANGELOG.md
```

前三者必须一致。

常见判断：

- PATCH：修复、文案、样式微调、文档完善、无合同变化的工程调整
- MINOR：新增页面、流程、状态、Skill 或明显可验证能力
- MAJOR：稳定后出现不兼容的产品 / API / 数据 / 工程合同变化

形成明确验收基线后可打 tag：

```bash
git tag v0.4.0
git push origin v0.4.0
```

---

## 14. CI/CD

生成项目的 CI 只围绕 `dev` / `prod`。

默认：

```text
PR → version contract + typecheck + build
push dev → CI + Cloudflare Preview
push prod → CI + Cloudflare Production + GitHub Pages Production
```

如果项目启用了 Cloudflare：

```bash
export CLOUDFLARE_ACCOUNT_ID="..."
export CLOUDFLARE_API_TOKEN="..."
```

然后：

```bash
mira setup cicd
```

它负责：

- 检测 GitHub repository
- 创建 preview / production environments
- 设置 GitHub Pages 发布源
- 写 GitHub Actions Secrets
- 创建 PC / Mobile Cloudflare Pages project

凭据只从当前 shell 读取，不写入仓库。

### 14.1 准备发布

对 AI 说：

```text
检查当前版本是否可以进入 prod。
```

AI 应检查：

- VERSION / package / config 是否一致
- CHANGELOG 是否完整
- 目标任务是否 PASS
- 是否仍有 BLOCKED / REVIEW 项
- CI 是否通过
- Preview 是否验证
- 是否存在已知未接受风险

只有这些信息清楚后，才建议进入 prod。

---

## 15. Daily Report Skill

Skill 文件：

```text
docs/ai/skills/daily-report.md
```

用户只需要说：

```text
生成今天的项目日报。
```

AI 默认读取当天本地时间内：

- `dev` GitHub commits
- 当天如有发布的 `prod` commits
- repository + contributors
- 总台账
- 当天涉及的 Txxx 任务卡
- PR / CI / Review / 页面验证证据
- 未提交工作区变化（只作为 WIP）

然后做：

```text
commit ↔ task card ↔ contributor
```

三向对账。

### 15.1 Contributor 归属

如果 GitHub 返回：

```text
author.login = dangjingtao
```

并且配置中 `dangjingtao` 为 verified contributor，则日报可写：

```text
Contributor: Tomz (@dangjingtao)
```

如果只能拿到 Git author name/email，则必须写：

```text
Contributor: ... (unverified Git identity)
```

### 15.2 对账规则

**有 commit + 有任务卡**  
按实际 diff 和任务目标总结，不照抄 commit message。

**有 commit + 没任务卡**  
列入 `未归档改动`。

**任务卡写完成 + 没证据**  
列入 `状态待核验`，不能写成已完成。

**任务卡仍 DOING / REVIEW + 已有 commit**  
如实描述进展，不擅自 PASS。

**commit 与任务卡不一致**  
优先报告真实改动，并列入 `台账偏差`。

**GitHub identity 无法验证**  
列入 `身份待核验`，不猜账号。

日报输出：

```text
docs/reports/daily/YYYY-MM-DD.md
```

同一天重复生成时更新同一个文件。

默认不会自动 commit / push，除非 Skill Profile 已明确授权。

---

## 16. Daily Report Review Skill

Skill 文件：

```text
docs/ai/skills/daily-report-review.md
```

用户只需要说：

```text
查收今天日报。
```

这个 Skill 不重新生成第二份日报，而是独立回查：

- 当天原日报
- GitHub commits / PR
- Contributor identity
- 台账 / Txxx
- CI / Preview / Production

检查五个方面：

1. 完整性
2. 真实性
3. 台账一致性
4. Contributor 归属
5. 发布 / 验证状态

只允许三种查收结论：

```text
ACCEPTED
ACCEPTED_WITH_NOTES
NEEDS_CORRECTION
```

默认只在对话里给负责人一份简洁查收摘要。

如果用户要求落档，则在**同一天原日报底部**追加 `Daily Report Review`，不默认创建 `YYYY-MM-DD.review.md`，避免第二套日报真相源。

如果发现日报错误，先指出，不在未授权情况下静默改日报。

---

## 17. 常用对话指令

日常基本只需要记住这些：

```text
先按 AGENTS.md 初始化项目，通过问答确认项目名、GitHub、Contributors 和 AI Skills。
```

```text
GitHub 地址是：https://github.com/xxx/xxx
请校验后绑定到项目。
```

```text
新需求：…… 先评审，不施工。
```

```text
按确认方案施工，同步任务卡和台账，完成后进入 REVIEW。
```

```text
评审 Txxx，先看任务卡、commit、代码和验证证据。
```

```text
Txxx 需求改了：…… 先评估影响，不要直接施工。
```

```text
生成今天的项目日报。
```

```text
查收今天日报。
```

```text
检查当前版本是否可以进入 prod。
```

```text
把当前实际进度和台账做一次对账。
```

---

## 18. AI 应该主动做什么

在权限允许范围内，AI 应主动：

- 读取足够上下文再施工
- 找到相关任务卡和产品事实
- 检查当前分支
- 维护台账一致性
- 真实执行可执行的验证
- 报告未验证项
- 用实际 GitHub login 做 contributor 对账
- 发现 commit / 台账 / identity 偏差
- 在需求变化时保留历史
- 在发布前检查版本和验收状态
- 在日报里只写有证据的事实
- 查收日报时独立回查，不照抄日报结论

---

## 19. AI 不应该做什么

默认禁止：

- 把 `main` 引入业务工作流
- 未确认就新增业务需求
- 未确认就改变产品规则
- 未授权扩大 Git / 部署权限
- 因 CI 绿自动把任务改 PASS
- 把讨论、计划或 WIP 写成已完成
- 伪造 build / test / browser verify
- 根据 Git name/email 猜 GitHub identity
- 把 bot / automation 提交算作 human contributor
- 为 Mira 伪造 GitHub 账号
- 用 commit 数量评价人员工作量
- 删除历史任务来“整理台账”
- 静默覆盖旧需求结论
- 把 Cloudflare / GitHub Token 写入仓库
- 未授权自动发布 production
- 查收日报时静默修改原日报

---

## 20. 项目出现混乱时怎么恢复

如果项目已经经历多人 / 多 AI 并行，台账和代码对不上，可以对 AI 说：

```text
暂停新增施工。
请按 AGENTS.md 对当前项目做一次基线恢复：
核对 project name、repository、contributors、dev/prod、VERSION、Product Brief、台账、所有活跃任务卡、最近 commits 和 CI。
把“事实、偏差、风险、待确认项”分开列出，不要直接重写历史。
```

恢复顺序建议：

1. 确认当前 project name / title
2. 确认 repository
3. 确认 contributors / GitHub identity
4. 确认 dev/prod
5. 确认 VERSION
6. 确认真实 commits
7. 对账任务卡
8. 对账 Product Brief
9. 找出未归档改动
10. 找出无证据 PASS
11. 找出未验证 contributor 归属
12. 给出需要用户确认的最小问题集
13. 用户确认后再修台账

---

## 21. 一次完整工作日示例

```text
上午：
用户提出需求
→ AI 先评审
→ 更新 Product Brief / T023
→ 用户确认
→ dev 施工
→ typecheck / build / preview
→ T023 = REVIEW

下午：
用户评审
→ 发现问题则修复
→ 再验证
→ 用户确认 PASS

下班前：
用户说“生成今天的项目日报”
→ AI 回查 GitHub @login + commits + ledger + T023
→ docs/reports/daily/YYYY-MM-DD.md

用户说“查收今天日报”
→ AI 独立回查 GitHub / contributors / task / CI
→ ACCEPTED / ACCEPTED_WITH_NOTES / NEEDS_CORRECTION

准备发布时：
用户说“检查是否可以进入 prod”
→ AI 检查版本 / PASS / CI / Preview
→ 用户确认
→ prod
```

---

## 22. 最终原则

这套项目不是为了让 AI 多写文档，而是为了保证：

- 项目名和仓库身份清楚
- 作者 / contributor 与 GitHub 账号能真实对应
- 产品决定有地方落
- AI 知道边界
- 代码变化有任务来源
- 任务状态有证据
- 每天实际发生了什么可以追溯到 GitHub contributor
- 日报有人能独立查收，而不是生成完就算结束
- 发布前知道自己发布的是哪一版
- 换一个 AI 也能接着干，而不是重新听一遍故事

当流程本身开始比产品工作更重时，应优先简化流程，而不是继续增加模板。

# AI Skill Profile

Status: `CONFIRMED`

> 本文件不由 Seed 预设最终答案。项目第一次进入实质性 AI 协作前，应由 AI 与用户通过交互式问答确认，再更新为 `CONFIRMED`。

## 为什么存在

不同原型对 AI 的要求不一样。有的项目需要产品拆解 + 双端 UI + 前端施工，有的只需要快速页面验证；有的允许 AI 直接提交和部署，有的只允许给建议。

因此技能不是模板里的固定开关，而是一份经过用户确认的项目协作合同。

## AI Skill Interview

AI 应自然地逐步确认，不要一次抛出长表单。优先围绕当前项目最关键的 1–2 个问题开始。

### 0. 项目身份与仓库

先确认项目本身：

- `prototype.config.json.project.name` 是否是正确项目名。
- `prototype.config.json.project.title` 是否是正确产品展示名。

如果项目使用 GitHub，询问用户是否已有仓库。

- 已有：允许用户直接在对话中粘贴 GitHub repository URL。
- 尚无：保留 `prototype.config.json.repository.url = null`，不要强迫用户先创建仓库。

拿到 URL 后：

1. 校验它确实指向预期 GitHub repository。
2. 写入 `prototype.config.json.repository.url`。
3. 只有在用户允许修改 Git 配置时，才设置 / 更新 `origin`。
4. 业务项目长期分支只使用 `dev` / `prod`，不建立 `main` 工作流。

### 0.1 Contributors / GitHub Identity

读取 `prototype.config.json.contributors` 与 `docs/governance/contributors.md`，然后通过问答确认当前项目贡献者。

默认 Seed 作者身份：

- Tomz <dangjingtao@gmail.com> → human owner → GitHub `@dangjingtao`（verified）
- Mira <mira@tomz.io> → AI collaborator → GitHub account: none

如果项目有其他 human contributor，询问其 GitHub login 或 profile URL；AI 应实际校验后再把 `github.verified` 写成 `true`。

不要因为 Git commit name/email 相同就自行宣称 GitHub 身份已验证。

### 1. AI 角色

可选但不限于：

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

### 2. 工具与连接

确认是否允许使用：

- GitHub
- 浏览器 / Web Research
- Figma / Penpot / 设计源
- Cloudflare
- GitHub Pages
- 其他项目工具 / MCP / Connector

### 3. AI 自主权限

逐项确认 AI 是否可以：

- 修改代码
- 修改产品文档
- 创建 / 更新任务卡与台账
- 更新 contributor identity
- commit / push
- 创建 PR
- 合并 PR
- 修改版本号 / CHANGELOG
- 触发或配置 CI/CD
- 部署 preview
- 部署 production
- 生成日报
- 查收 / 复核日报
- 把日报或查收结果写回项目

### 4. 验证目标

记录当前项目最重要的验证目标，例如：

- 核心业务闭环
- 信息架构
- 运营活动规则
- 双端一致性
- 视觉方向
- 数据状态
- 用户测试

### 5. 禁止越界

记录明确禁止事项，例如：

- 不建设生产级后端
- 不自行改变产品规则
- 不新增未经确认的业务需求
- 不更换设计系统
- 不直接发布 production

### 6. 项目专属技能

Seed 内置可供确认的 Skill：

- `daily-report`：根据当天 GitHub commit + 台账 / 任务卡实际情况生成项目日报，规则见 `docs/ai/skills/daily-report.md`。
- `daily-report-review`：回查日报与 GitHub / 任务卡 / CI 的一致性，规则见 `docs/ai/skills/daily-report-review.md`。

也可以根据项目需要增加其他稳定名称，例如：

- `product-review`
- `mobile-prototype`
- `pc-console`
- `com-design-review`
- `regression-check`
- `release-guard`

除了 Seed 已提供的能力外，其余名字只是建议，不代表默认启用。

对于日报相关能力，至少确认：

- 是否启用 `daily-report`
- 是否启用 `daily-report-review`
- 日报面向谁阅读
- 是否允许 AI 仅生成 Markdown，还是也允许自动 commit / push
- 查收结果只在对话返回，还是允许追加到原日报
- 如本地日期 / 工作时区不明确，使用哪个时区作为“当天”边界

---

## Confirmed Profile

> 由 AI 在用户确认后填写。

- Status: `CONFIRMED`
- Confirmed at: 2026-08-27
- Extended at: 2026-08-28（实验性 PR AI Review）
- Confirmed by: Tomz
- Project name: `comuilty`
- Project title: `本地生活`
- Project goal: V0.1 概念原型验证线下门店、线上商城、智慧抗衰三大场景及统一私域中台结构
- GitHub repository: `https://github.com/dangjingtao/local-life-prototype`
- Confirmed human contributors: Tomz (@dangjingtao, verified)
- Confirmed AI collaborators: Mira (no GitHub account)

### Confirmed skills

- Product Discovery / PRD
- Requirement Review
- UI / Interaction Design
- Frontend Implementation
- PC / Mobile Adaptation
- Design System Compliance
- Test / Regression
- Code Review
- Documentation
- Experimental PR AI Review / CI integration

### Allowed tools

- Local repository, local browser visual validation, Prototype Runtime, Com Design system and Lucide icons
- GitHub repository / Pull Request API and GitHub Actions for the experimental PR review flow
- OpenCode CLI in the read-only GitHub Actions review job, authenticated with repository secret `OPENCODE_API_KEY`; GitHub-side publishing is isolated in a separate non-model job

### Allowed autonomous actions

- Modify product documents
- Create / update task cards and work ledger
- Modify prototype code
- Run local typecheck, build and browser validation
- Configure and run the experimental OpenCode review workflow for same-repository PRs targeting `dev`
- Post advisory OpenCode review output to the PR and expose it to local agents through the review inbox

### Requires explicit approval

- `commit` / `push` outside the explicitly requested PR review setup work
- Deployment to preview or production
- Changing confirmed business rules without user confirmation
- Building production backend or real external integrations in V0.1
- Automatic PR approval, `REQUEST_CHANGES`, merge, or task `PASS` based only on experimental AI review

### Project-specific constraints

- V0.1 focuses on concept prototype completeness, core flows, information architecture, cross-end semantics and visual direction.
- Product display name is `本地生活`.
- Mobile covers terminal user flows; PC covers store/partner, platform operations and dashboard concepts.
- Experimental PR AI Review is advisory only: it may identify findings and hand them to local agents, but it must not silently change product acceptance state or merge code.
- The experimental reviewer runs read-only: no code edit, shell execution, subagent launch, external web fetch/search, or shared OpenCode session.

### AI recommendations not yet confirmed

- -

## Re-confirmation

出现以下情况时，把 Status 改为 `REVIEW_REQUIRED` 并重新问答：

- 产品阶段明显变化
- AI 获得新的写入 / 发布权限
- 新接入外部工具或账号
- GitHub repository / contributor identity / 分支策略发生变化
- 从 prototype 进入 production engineering
- 用户明确要求重做技能配置

AI 不得在没有用户确认的情况下静默扩大权限或新增关键技能。

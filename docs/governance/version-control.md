# Version Control

## 目标

版本控制不是发布时才补的数字。Prototype 从第一天开始保留可追踪的产品基线，让需求、任务、代码、评审和部署都能回答：**这是哪一版？为什么变？从哪一版开始生效？**

## 版本号

使用 Semantic Versioning：`MAJOR.MINOR.PATCH`。

原型项目默认从 `0.1.0` 开始：

- `PATCH`：修复、文案、样式微调、无合同变化的工程调整
- `MINOR`：新增可验证能力、页面、流程、状态或明显产品能力
- `MAJOR`：进入稳定版后发生不兼容的产品 / 数据 / API / 工程合同变化

`0.x` 阶段允许快速迭代，但仍要记录破坏性变化。

## 真相源

- `VERSION`：当前版本号，人类和脚本都可直接读取
- `package.json.version`：npm / Node 工程版本，必须与 `VERSION` 一致
- `CHANGELOG.md`：为什么变化
- `docs/workbench/00-work-ledger.md`：哪些任务进入哪一版
- Git tag：已经形成明确发布 / 验收基线的版本

任何一个版本升级都至少同时修改：

1. `VERSION`
2. `package.json.version`
3. `prototype.config.json.versioning.currentVersion`
4. `CHANGELOG.md`

## Repository

业务项目可以先在本地生成，不要求预先创建 GitHub repository。

如果项目需要接入 GitHub：

- 在 AI Skill Interview 中直接向 AI 提供 repository URL 即可。
- URL 记录到 `prototype.config.json.repository.url`。
- 设置 / 修改 Git `origin` 属于写操作，应遵循 AI Skill Profile 中的授权。

## 分支合同

生成后的业务项目只有两条长期分支：

```text
dev  → 日常施工 / 集成 / CI / preview
prod → 验收基线 / production deployment
```

**不使用 `main` 参与业务项目的开发、集成或发布。**

GitHub repository 即使初始默认创建了 `main`，也不应把它引入实际工作流。项目初始化完成后，应以 `dev` 作为日常工作分支，以 `prod` 作为正式发布分支；是否删除远端空 `main` 由用户决定。

### `dev`

日常集成与验证分支：

- 产品施工
- PC / Mobile 联调
- CI
- preview deployment
- AI / 人工 review 前的集成

允许直接推进快速原型，但高风险、并行或跨端任务建议使用短生命周期任务分支，例如：

```text
task/T023-campus-team
fix/T031-empty-state
```

完成后合回 `dev`。

### `prod`

明确验收后的发布 / 正式预览分支：

- 不作为日常施工分支
- 进入 `prod` 的内容应已有 `REVIEW → PASS` 证据
- CI 绿只是必要条件，不是充分验收条件
- production deployment 从该分支产生

### 不使用 `main`

对于生成后的业务项目：

- CI 不监听 `main`
- preview 不从 `main` 部署
- production 不从 `main` 部署
- 任务不以 `main` 为目标分支
- 日报默认根据 `dev`，以及当天有发布时的 `prod`，整理实际改动

Seed 仓库自身如何维护不改变上述业务项目合同。

## 发布与 Tag

当某个版本形成可复现的验收基线：

```bash
git tag v0.3.0
git push origin v0.3.0
```

Tag 名必须与 `VERSION` 一致。

## Commit 约定

建议使用简洁前缀：

- `feat:` 新能力
- `fix:` 修复
- `docs:` 文档
- `refactor:` 不改变产品行为的重构
- `test:` 测试 / 回归
- `chore:` 工具链 / 基础设施维护

任务相关提交建议在正文或标题中带稳定任务号，例如：

```text
feat: T023 add team performance prototype
```

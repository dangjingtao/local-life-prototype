# Contributor Identity

## 目的

项目需要区分三个概念：

1. 文档署名是谁。
2. Git commit 中写了什么 name / email。
3. GitHub 实际把 commit / PR 关联到了哪个账号。

这三者不能默认等价。

`prototype.config.json.contributors` 是项目贡献者身份合同。它用于日报归属、Review、发布记录和多人协作，不用于评价个人工作量。

## 默认贡献者

### Tomz

- Name: `Tomz`
- Email: `dangjingtao@gmail.com`
- Type: `human`
- Role: `owner`
- GitHub login: `dangjingtao`
- GitHub profile: `https://github.com/dangjingtao`
- Identity status: verified

### Mira

- Name: `Mira`
- Email: `mira@tomz.io`
- Type: `ai-collaborator`
- Role: `co-author`
- GitHub login: none

Mira 在没有真实 GitHub Bot / GitHub App 身份前，不得伪造 GitHub login，也不得把其他人的提交归为 Mira。

## 初始化与变更

AI Skill Interview 应确认：

- 当前项目 Owner / Contributors 是否仍为配置中的人。
- 每个 human contributor 的 GitHub login 或 profile URL。
- 是否允许 AI 校验 GitHub 账号并更新 `prototype.config.json.contributors`。

新增 contributor 时，优先记录：

```json
{
  "name": "Name",
  "email": "name@example.com",
  "type": "human",
  "role": "contributor",
  "github": {
    "login": "github-login",
    "profile": "https://github.com/github-login",
    "verified": true
  }
}
```

如果 GitHub 身份尚未验证，`verified` 必须是 `false`；不要因为 Git name/email 看起来相似就自动标记为 true。

## GitHub 归属规则

日报和 Review 判断“谁提交了这次改动”时按以下优先级：

1. GitHub API / Connector 返回的 commit `author.login`、PR author login 等平台身份。
2. 与 `prototype.config.json.contributors[].github.login` 对照。
3. 如果 GitHub 没有关联账号，才回退到 Git commit author name/email。
4. 回退结果必须标记为 `unverified identity`，不得伪装成 GitHub 账号。

### 示例

GitHub 返回：

```text
author.login = dangjingtao
```

并且 contributors 中存在 verified `dangjingtao`，则日报可以写：

```text
Contributor: Tomz (@dangjingtao)
```

如果只能读取到：

```text
Author: Tomz <some-mail@example.com>
```

而 GitHub 没有关联 login，则只能写：

```text
Contributor: Tomz <some-mail@example.com> (unverified Git identity)
```

## 禁止事项

- 不通过 commit 数量、行数或 contributor 数量评价人员绩效。
- 不把 committer 和 author 强行视为同一个人。
- 不把 bot / automation 的提交归给 human contributor。
- 不因为邮箱相同或名字相似就宣称 GitHub identity 已验证。
- 不创建不存在的 Mira GitHub 账号。

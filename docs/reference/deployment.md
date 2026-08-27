# Deployment

## GitHub Pages

工作流：`.github/workflows/deploy-github-pages.yml`

- 一个 Pages 站点同时承载 `/mobile/` 与 `/pc/`。
- 在仓库 Settings → Pages 中选择 **GitHub Actions** 作为 Source。
- `prod` push 或手动运行 workflow 后发布。

## Cloudflare Pages

工作流：`.github/workflows/deploy-cloudflare.yml`

需要仓库 Secrets：

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

默认项目名：

- `<repo>-mobile`
- `<repo>-pc`

请先在 Cloudflare 创建对应 Pages Project。`dev` 和 `prod` push 会分别作为 branch deploy 上传。

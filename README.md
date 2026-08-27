# 本地生活

Generated from **Com Design Prototype** by Mira.

> Mira plants. Com Design shapes. Prototype proves.

Authors: Tomz <dangjingtao@gmail.com> & Mira <mira@tomz.io>

## Start

```bash
npm install
npm run dev:mobile
npm run dev:pc
```

## First AI review

Before substantial AI work, read `AGENTS.md` and confirm `docs/ai/skills.md` through an interactive AI interview. If a GitHub repository already exists, paste its URL in that conversation; the AI records it in `prototype.config.json.repository.url`.

## Branches

Long-lived product branches are `dev` and `prod` only. `main` is not part of the product workflow.

## Daily report

Use `docs/ai/skills/daily-report.md` to reconcile same-day commits with ledger/task-card reality and write `docs/reports/daily/YYYY-MM-DD.md`.

## Version control

Current version: `0.1.0`. Keep `VERSION`, `package.json.version` and `CHANGELOG.md` in sync. See `docs/governance/version-control.md`.

## CI/CD

After the GitHub repository is confirmed, run:

```bash
export CLOUDFLARE_ACCOUNT_ID=...
export CLOUDFLARE_API_TOKEN=...
mira setup cicd
```

`dev` continuously publishes preview deployments. `prod` publishes production.

Read `docs/product/00-product-brief.md`, then keep work in `docs/workbench/00-work-ledger.md`.

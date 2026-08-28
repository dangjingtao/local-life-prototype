# T003 · Mobile 登录、首页与统一账号入口

- Status: REVIEW
- Target version: 0.1.0
- Impact: Mobile / Shared
- Owner: Mira

## Background

用户端需要先建立统一身份和三个业务场景的清晰入口，才能连续进入后续主流程。

## Goal

完成小程序概念端的登录/授权、首页、消息/活动入口及底部导航，明确统一会员身份。

## Product facts

- Mobile 面向终端用户。
- 首页必须能识别门店自提、线上商城、智慧抗衰三个入口。
- 登录仅表现微信授权/手机号概念，不接真实认证。

## Scope

- 登录/授权演示和进入首页的动线。
- 首页、消息/活动入口、底部导航与统一用户 ID 展示。
- 私域入口的概念提示与必要的待确认说明。

## Out of scope

- 真实微信登录、手机号校验、消息推送或用户数据持久化。

## Acceptance

- [x] 登录到首页可连续演示。
- [x] 三个业务场景入口清晰可点击。
- [x] 统一用户 ID 与会员身份在主要入口可识别。
- [ ] 390px 移动视口完成视觉检查。
- [x] `npm run build:mobile` 通过。

## Risks / Dependencies

- 前置：T002。
- 风险：私域承接方式仅做概念表达，不承诺真实进群或触达。

## Implementation record

- Commit / PR: `1e35cec32dd3f47f06c74ba300c6f87bb2284c63` (`feat: complete T003 mobile login and home shell`)
- Changed paths:
  - `apps/mobile/src/App.tsx`
- Notes:
  - 新增微信授权 / 手机号快捷登录概念页，两种入口均只切换本地演示状态，不接真实认证。
  - 首页建立门店自提、线上商城、智慧抗衰三个清晰入口，并保留底部导航与消息 / 活动入口。
  - 统一身份、会员等级、积分和可用券数量直接消费 `@prototype/shared` 的 `coreDemoUser` / `coreUserCoupons`，不在 Mobile 重复维护 T002 数据。
  - 三个业务场景在本卡只进入后续任务边界页，分别交给 T004 / T005 / T006，不提前实现自提、结算或检测闭环。
  - 私域入口明确标注为概念表达，不承诺真实进群、消息推送或二次触达。
  - “我的”仅保留统一身份概览，完整会员 / 积分 / 权益中心继续由 T007 完成。

## Verification evidence

- CI: GitHub Actions `Verify Prototype #5`，run `33134306194`，conclusion `success`；对应 head SHA `1e35cec32dd3f47f06c74ba300c6f87bb2284c63`。`npm install`、版本合同、`npm run typecheck`、`npm run build` 全部通过；根级 build 包含 `@prototype/mobile` 的 `tsc + vite build`。
- Page / Route: Mobile root `/`；登录 → 首页；首页 → 门店 / 商城 / 抗衰入口；Header → 消息与活动；底部导航 → 首页 / 门店 / 商城 / 抗衰 / 我的。
- Screenshot / Browser result: 未执行独立 390px 浏览器截图；当前代码已将登录页、Header、Main、Bottom Nav 统一约束为 `max-w-[390px]`，实际 390px 视觉检查留给 Review。
- Other evidence:
  - 主施工 commit 仅修改 `apps/mobile/src/App.tsx`。
  - 统一用户 ID `LL-8888`、会员“银卡”、积分 `1280` 与活动页可用券数量均来自 T002 shared fixtures。
  - 未新增真实认证、真实进群、支付 / 履约 / 检测等越界实现。

## Status history

- 2026-08-28 `TODO → DOING`：用户要求以 `dev` 为分支完成 T003，并授权本任务实际仓库施工。
- 2026-08-28 `DOING → REVIEW`：Mobile 登录 / 首页壳层已提交，Verify Prototype #5 成功；390px 实际视觉检查留给 Reviewer。

## Review

- Reviewer: Tomz
- Result: REVIEW
- Conclusion: 登录、首页、三场景入口、统一身份、消息 / 活动与底部导航已完成并通过 CI；等待 390px 实际视觉检查后决定是否 PASS。
- Follow-up: 视觉验收通过后，T004-T007 可在该壳层上继续实现各自闭环，并继续消费 `@prototype/shared`。

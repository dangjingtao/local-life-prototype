# T003 · Mobile 登录、首页与统一账号入口

- Status: TODO
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

- [ ] 登录到首页可连续演示。
- [ ] 三个业务场景入口清晰可点击。
- [ ] 统一用户 ID 与会员身份在主要入口可识别。
- [ ] 390px 移动视口完成视觉检查。
- [ ] `npm run build:mobile` 通过。

## Risks / Dependencies

- 前置：T002。
- 风险：私域承接方式仅做概念表达，不承诺真实进群或触达。

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

- Reviewer: Tomz
- Result: REVIEW / PASS / BLOCKED
- Conclusion:
- Follow-up:

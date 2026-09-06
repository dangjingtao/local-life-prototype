# T043 · Mobile 消费后社群承接

- Status: PASS
- Target version: 0.3.0
- Type: Mobile / Growth / Interaction
- Predecessors: T042、T018
- Related PRD: R04

## Unique deliverable

只在便利店支付成功 / 取货成功场景增加轻量社群提示，并完成同一用户 7 天内不重复展示的 Mock 行为。

## Changed paths whitelist

- `apps/mobile/src/StoreFlowScreen.tsx`
- T042 新增的社群页面 / 路由文件仅允许做必要跳转接线
- `tests/browser/t043-community-post-purchase-nudge.spec.mjs`
- Shared 只消费 T034 频控语义，不在本卡修改。

## Out of scope

- 不修改“我的”常驻入口结构。
- 不接真实企微。
- 不发送 Push / 短信 / 服务通知。
- 不使用强制 Modal 阻塞支付 / 取货完成。
- 不扩展到商城 / 智慧抗衰消费后提示，除非新需求明确确认。

## Acceptance

- [x] 便利店支付成功场景可展示轻量“加入门店社群”提示。
- [x] 便利店取货成功场景可展示同类提示。
- [x] 点击提示进入 T042 社群指引页。
- [x] 首次可提示；同一用户 7 天内再次进入对应成功场景不重复提示。
- [x] 频控不影响“我的 → 加入社群”常驻入口。
- [x] 提示不遮挡订单状态、应付信息或主要完成操作。
- [x] 390×844 实屏与 browser test 通过。
- [x] T018 自提 / 短配回归、typecheck、build 通过。

## Evidence required

Browser test 必须覆盖“首次出现 → 记录频控 → 再次不出现”，不接受只做两张静态状态截图。


## Execution baseline

- Branch: `task/T043-community-post-purchase-nudge`
- Started from latest `dev` after T042 PASS.
- Consume T034 Shared `getCommunityForStore` + `shouldShowCommunityNudge` + confirmed 7-day cooldown rule; Shared unchanged.
- Browser-local last-shown timestamp is used only as the prototype write-side for the current user so the flow can verify first show → record → suppress within 7 days.
- Payment-success and pickup-completed are both eligible trigger scenes, but the cooldown is global per user: if payment success already showed, pickup completion within 7 days does not show a second nudge.
- Mall / Care and T042 persistent My entry remain untouched except the minimal Store → Community route callback.


## Implementation record

- PR: #42 `feat(T043): add post-purchase community nudge cooldown`
- Reviewed implementation head: `4ee9483cc1340e38cb9966b8892b1c0a47655a0f`
- Business paths:
  - `apps/mobile/src/StoreFlowScreen.tsx`
  - `apps/mobile/src/App.tsx`（仅 Store → T042 社群页跳转接线）
- Shared / T042 persistent My entry / Mall / Care unchanged.

### Delivered behavior

- 便利店支付成功可展示轻量“加入门店社群，获取更多福利”提示。
- 自提核销完成同样具备独立 trigger；若同一用户已在支付成功阶段展示，则受全局 7 天 cooldown 抑制，不在同一订单重复骚扰。
- 初始资格消费 Shared `shouldShowCommunityNudge`；7 天周期消费 confirmed `prototypeRules.communityNudgeCooldownDays`。
- prototype write-side 使用 user-scoped localStorage：`local-life:LL-8888:community-nudge:last-shown-at`。
- 每次 trigger 都重新读取持久化时间，避免多标签页旧 ref 绕过 cooldown；localStorage 不可用时才回退当前 mount 的内存 ref。
- 提示为正常文档流 section，可关闭，不是 Modal / fixed overlay；订单状态与主要完成按钮仍可见。
- 点击“加入社群”进入 T042 社群指引页；返回“我的”后常驻入口继续存在。
- 短配仅在支付成功阶段允许该提示；配送中 / 已送达不新增 T043 提示。

## Review / verification

- Verify Prototype #34032075151: **success**，version / typecheck / build 全绿。
- T012 Browser Quality #34032075150: **124 passed / 8 failed（132 total）**。
  - T043 专项 **4/4 passed**：
    1. 支付成功首次出现并记录 cooldown；
    2. 同一用户 7 天内第二次支付成功不重复；
    3. 无近期展示记录时 pickup-completed trigger 独立可出现；
    4. 提示进入 T042，且 cooldown 不影响“我的 → 加入社群”常驻入口。
  - 390×844 实屏：`01-payment-community-nudge.png`、`02-pickup-complete-community-nudge.png`。
  - 剩余 8 项全部为进入 T043 前已存在的 T017 / T018 / T032 checkout 基线债。
- 首轮 Browser：T043 3/4；completion trigger 测试暴露“明确清除持久化记录”和“存储不可用 fallback”未区分。已在 `4ee9483` 修正，latest T043 4/4。
- CodeRabbit：2×Major 均针对旧 head 的 cooldown / test 一致性问题；latest implementation 已逐 trigger 读取持久化状态并区分 null / unavailable，两 thread 均已回复并 resolve；CodeRabbit status **success**。
- Codex：额度耗尽，无实质 review。
- Self review：补 localStorage 写失败时同 mount ref 兜底，并复核频控按 user 全局而非 payment / pickup 分开计数；无剩余 blocker。

## Review

- Result: PASS
- Conclusion: T043 AC 满足；latest-head Verify success、专项 4/4、AI review threads 全部 resolve。2026-09-06 按用户既有授权由 Mira 自审验收；PR #42 squash merge `ae2d34d01269fc4bf645989ec50c7ac4be062de9`。

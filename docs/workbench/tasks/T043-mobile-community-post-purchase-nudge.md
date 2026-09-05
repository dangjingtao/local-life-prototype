# T043 · Mobile 消费后社群承接

- Status: TODO
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

- [ ] 便利店支付成功场景可展示轻量“加入门店社群”提示。
- [ ] 便利店取货成功场景可展示同类提示。
- [ ] 点击提示进入 T042 社群指引页。
- [ ] 首次可提示；同一用户 7 天内再次进入对应成功场景不重复提示。
- [ ] 频控不影响“我的 → 加入社群”常驻入口。
- [ ] 提示不遮挡订单状态、应付信息或主要完成操作。
- [ ] 390×844 实屏与 browser test 通过。
- [ ] T018 自提 / 短配回归、typecheck、build 通过。

## Evidence required

Browser test 必须覆盖“首次出现 → 记录频控 → 再次不出现”，不接受只做两张静态状态截图。

# T019-R5 · 商城五屏独立视觉复审

- Status: DOING
- Target version: 0.2.0
- Impact: Mobile / UX / QA
- Parent: T019
- Owner: Mira

## Background

T019-R1～R4 已依次完成商城首页、商品详情、购物车、结算确认和订单 / 物流视觉返工并合入 `dev`。R5 不再新增业务能力，而是从完整购买链重新独立检查五屏整合效果，避免单屏测试全部通过但全链仍存在密度、层级、固定栏或视觉一致性问题。

视觉基础为 `docs/design/t019-mall-ui-baseline.md` 与 `docs/design/assets/t019-mall-ui-reference.webp`；已经经过用户明确纠正并由 R1～R4 当前回归锁定的布局，视为后续确认事实，不回滚到更早的草案状态。

## Goal

在真实 Chromium `390 × 844` 下完成商城五屏 canonical ready state 独立复审，留存可追踪实屏证据，并对完整购买链的视觉连续性和消费者语义作最终判断。

## Review screens

1. Mall Home
2. Product Detail
3. Cart
4. Checkout
5. Order / Shipping

## Review dimensions

### 全链一致性

- 五屏模块顺序与当前确认交互一致。
- 页面 chrome、返回路径和底部导航 / 固定操作栏切换连续。
- 商品视觉、字号层级、Card 密度、边距节奏在五屏之间没有明显断裂。
- 颜色只使用项目 Design Token，不追随参考稿橙色值。

### 消费者语义

- 正常 ready state 不出现 `Storefront`、`Channel`、`Mock`、`T019`、`演示数据` 等工程解释。
- 商城只表达全国快递，不泄漏便利店自提 / 3 km 短配语义。
- 优惠、包邮、来源和物流文案不夸大现有 fixture 能力。

### 几何与可用性

- canonical viewport：390×844。
- 关键块继续由 R1～R4 专项几何回归锁定，容差 ±4px。
- 无横向溢出。
- 固定购买 / 结算 / 订单操作区不与 safe area、一级导航或 Prototype Runtime 遮挡。
- 首屏主视觉优先级清晰，不重新退化为 Demo / 解释型页面。

## Evidence contract

- 新增 R5 Playwright review flow，在真实 Chromium 390×844 顺序走完 Home → Detail → Cart → Checkout → Order。
- 必须输出五张 viewport screenshot：
  - `01-home.png`
  - `02-detail.png`
  - `03-cart.png`
  - `04-checkout.png`
  - `05-order.png`
- CI 无论全量 Browser Quality 是否被便利店既有旧基线拖红，都必须上传 `t019-r5-visual-evidence` artifact。
- R5 的视觉结论必须基于这五张图本身，而不是只根据 DOM / test green 推断。

## Acceptance

- [ ] 五张 390×844 canonical ready state 实屏证据已生成并逐屏复审。
- [ ] 五屏无阻塞级视觉结构漂移、拥挤、遮挡或明显层级问题。
- [ ] R1～R4 商城专项回归与 T019 全购买链回归保持通过。
- [ ] 商城消费者界面无内部术语和便利店履约语义泄漏。
- [ ] Verify Prototype 通过。
- [ ] UX independent review 给出明确结论与证据链接。
- [ ] 若需要修复，修复后重新生成整套五屏证据，不复用旧截图。

## Out of scope

- 不新增商城功能。
- 不修改 Shared 业务模型、包邮规则或订单状态机。
- 不处理便利店 T017 / T018 / T032 的既有 Browser Quality 基线债；仅记录其是否影响全量 CI 状态。
- 不以 R5 自审替代用户明确要求的人类验收权限；父卡 T019 是否恢复 PASS 仍遵守仓库状态规则。

## Verification evidence

- Branch: `task/T019-R5-mall-visual-independent-review`
- Base: `dev @ 247299010e4ef26b316234b6e31c7f1067db6311`
- Screenshot evidence: pending CI artifact
- Verify: pending
- Browser: pending
- Independent UX review: pending

## Review

- Reviewer: Mira independent UX review
- Result: pending
- Conclusion: pending
- Follow-up: 若无阻塞问题，R5 推进到 REVIEW 并把完整证据交给 T019 最终验收；若有问题直接在本分支修复并重跑五屏证据。

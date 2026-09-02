# T019-R5 · 商城五屏独立视觉复审

- Status: REVIEW
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

- [x] 五张 390×844 canonical ready state 实屏证据已生成并逐屏复审。
- [x] 五屏无阻塞级视觉结构漂移、拥挤、遮挡或明显层级问题。
- [x] R1～R4 商城专项回归与 T019 全购买链回归保持通过。
- [x] 商城消费者界面无内部术语和便利店履约语义泄漏。
- [x] Verify Prototype 通过。
- [x] UX independent review 给出明确结论与证据链接。
- [x] 首轮发现订单进度条横向溢出后已修复，并重新生成整套五屏证据，没有复用旧截图。

## Out of scope

- 不新增商城功能。
- 不修改 Shared 业务模型、包邮规则或订单状态机。
- 不处理便利店 T017 / T018 / T032 的既有 Browser Quality 基线债；仅记录其是否影响全量 CI 状态。
- 不以 R5 自审替代用户明确要求的人类验收权限；父卡 T019 是否恢复 PASS 仍遵守仓库状态规则。

## Verification evidence

- Branch: `task/T019-R5-mall-visual-independent-review`
- Base: `dev @ 247299010e4ef26b316234b6e31c7f1067db6311`
- First visual run: Browser Quality #96 / artifact `9854954411`。首轮只生成 4 张图；R5 在 Order 页发现 `scrollWidth 409 > viewport 390`，定位为三段物流进度连接线布局溢出，因此不接受首轮证据。
- Fix: `MallOrderView.tsx` 将三段物流步骤改为真正等分；连接线从当前节点中心连接到下一节点中心。并在 R4 回归中增加 pending / shipping / completed 三态横向溢出 gate。
- Final candidate: `4f6f3b899fa8b7e7d00553ba51ff9a1c157cb334`。
- Verify: Verify Prototype #280 `success`。
- Browser: Browser Quality #98 共 78 项，70 passed / 8 failed。T012 mall、T016 mall handoff、T019、R1、R2、R3、R4、R5 全部通过；剩余 8 项均为既有便利店 T017 / T018 / T032 旧基线，不属于本卡回归。
- Final screenshot artifact: `t019-r5-visual-evidence` artifact `9855267147`，5 files，digest `sha256:671a088a2ac4e947bd02fc24705c8c3b72dcb88e06358c01f72638c17300532c`。
- Final screenshots reviewed: `01-home.png`、`02-detail.png`、`03-cart.png`、`04-checkout.png`、`05-order.png`。

## Independent visual findings

- Home：首屏搜索 → 活动 → 分类 → 精选店铺 → 推荐商品的信息优先级清楚；此前用户指出的顶部拥挤未复现；双列商品和底部一级导航稳定。
- Detail：商品主视觉、价格、规格、促销、配送 / 包邮、商城优惠与固定购买栏层级连续；抽象商品背景符合用户允许的视觉策略，没有退回伪包装插画。
- Cart：两商品列表、数量控件、金额 / 包邮进度和固定结算栏无挤压或遮挡；一级导航与结算栏相邻但不重叠。
- Checkout：地址、来源 / 配送 / 备注、商品摘要、金额与固定提交栏层级清楚；无横向溢出。
- Order：首轮发现并修复物流三段进度横向溢出；最终三节点等分、连线正确，状态 Hero / 订单号 / 物流轨迹 / 订单信息 / 固定操作栏完整且无遮挡。
- 五屏正常消费者视图未发现 `Storefront`、`Channel`、`Mock`、`T019`、`演示数据` 或便利店自提 / 3 km 履约语义泄漏。

## Review

- Reviewer: Mira independent UX review
- Result: `PASS FOR HUMAN / REVIEW`
- Conclusion: R5 执行层独立视觉复审通过；本轮确实发现并修复 1 个 Order 横向溢出问题，最终五屏实屏未发现新的阻塞级 UX / Visual 缺陷。
- Follow-up: PR 合入 `dev` 后交给 Tomz 最终人类视觉确认。按照仓库状态规则，在用户明确确认前 R5 与父卡 T019 均保持 `REVIEW`；用户确认后才可恢复正式 `PASS`。

# T019-R4 · 商城结算确认与订单物流视觉返工

- Status: REVIEW
- Target version: 0.2.0
- Impact: Mobile / UX
- Parent: T019
- Owner: -

## Background

T019 已完成 checkout、订单快照和 `待发货 → 运输中 → 已签收 / 已完成` 状态推进，但原页面持续暴露“演示数据 / Mock order / Mock 仓配”等工程说明，且结算与物流视觉更像验证页面而非成熟商城。用户已确认新的结算与订单物流稿，要求除颜色采用项目现有 Design Token 外，严格按确认稿交互、模块顺序和关键宽高布局施工。

统一视觉合同：`docs/design/t019-mall-ui-baseline.md`。

## Goal

把 T019 后半段重构为确认稿中的成熟商城 checkout 与物流详情，在不改变现有 mock 业务逻辑的前提下，让用户看到正常的地址、商品、金额、配送和物流信息，而不是工程解释。

## Product facts

- 继续使用现有演示收货地址数据，不新增真实地址管理。
- 商城全国快递；现有满 ¥99 包邮 / 未满 ¥8 规则保持。
- 商城优惠继续消费现有 mall coupon；Shared 未定义的金额不得在本卡擅自创造新规则。
- 提交订单仍生成当前会话内订单快照并清空当前 storefront 购物车。
- 订单状态仍按 `待发货 → 运输中 → 已签收 / 已完成` 推进。
- 物流仍为演示数据，不接真实物流 API；消费者页面只使用正常虚拟运单表达，不显示工程命名。

## Scope

### Checkout

- 52px top bar。
- 收货地址卡。
- 店铺来源 / 全国快递配送 / 订单备注信息区。
- 商品摘要列表。
- 商品金额、运费、商城优惠、应付金额。
- 72px 固定提交订单区。

### Order / Shipping

- 52px top bar。
- 订单状态 Hero。
- 订单号。
- 待发货 / 运输中 / 已签收三段状态进度。
- 物流公司 / 虚拟运单号 / 时间线轨迹。
- 订单 / 收货信息。
- 底部操作保留现有状态推进与返回商城能力，但使用消费者可理解文案。

## Geometry contract

严格遵守 `docs/design/t019-mall-ui-baseline.md` Screen D / E。

### Checkout

- Top bar 52px。
- 地址卡 104px。
- 来源 / 配送 / 备注组合区 116px。
- 单商品摘要行 72px；缩略图 56×56px。
- 金额区 132px。
- 固定提交区 72px。

### Order / Shipping

- Top bar 52px。
- 状态 Hero 112px。
- 订单号区 44px。
- 三段进度 72px。
- 物流信息与时间线约 228px。
- 订单信息约 136px。
- 底部操作栏 72px。
- canonical ready state 关键块高度容差 ±4px。

## Hard constraints

- **除颜色 token 替换外，不得自行修改确认稿的交互、模块顺序、关键宽高比例、金额层级、物流步骤位置和底部操作区。**
- Checkout 正常主界面不得出现 `T019`、`Mock`、`演示数据`、`不发起真实支付`、`外部平台` 等工程解释。
- Order 正常主界面不得出现 `Mock order`、`MOCK-SF-*`、`Mock 仓配` 等工程命名；允许使用格式正常、明确属于原型数据的虚拟订单 / 运单号。
- 不新增真实支付方式、地址簿、发票、退款 / 售后、真实物流 API。
- 不擅自创造 mall coupon 减免金额；如果现有数据没有金额，视觉上只表达现有可确认优惠状态，金额计算保持当前业务事实。
- 商品缩略图复用前序商城商品资产。
- Product Detail / Checkout / Order 深层页不显示一级底部导航，避免和固定操作栏冲突；返回路径必须完整。
- 颜色只使用现有 Design Token。

## Acceptance

- [x] Checkout 390×844 与 Screen D 布局基准一致，关键块高度 ±4px。
- [x] 地址、来源、配送、商品摘要、运费 / 优惠 / 应付金额层级清晰。
- [x] 提交订单继续生成 snapshot、清空当前 storefront cart，并进入订单详情。
- [x] Order 390×844 与 Screen E 布局基准一致，关键块高度 ±4px。
- [x] `待发货 → 运输中 → 已签收 / 已完成` 可连续推进。
- [x] 运输中状态展示正常格式的虚拟物流公司 / 运单 / 时间线；无工程命名泄漏。
- [x] 已签收状态仍可返回商城继续购物。
- [x] 深层固定操作栏不与 safe area / 一级导航冲突。
- [x] 所有颜色使用项目 Design Token。
- [x] typecheck / build / T019 checkout + order browser regression 通过。

## Verification evidence

- CI: Verify Prototype #274 success（final head `f836edf7`）。
- Browser: T012 Browser Quality #93 共 77 项，69 passed / 8 failed；商城 T012/T016/T019/R1/R2/R3/R4 全部通过，8 个失败均为既有便利店 T017/T018/T032 旧基线断言，不属于 R4 回归。
- R4 geometry: Screen D / E 两条 390×844 专项回归均通过，固定栏 / 一级导航隐藏 / PrototypePanel 避让均有实际几何断言。
- Codex review: 优惠券“已关联”误表达已改为事实准确的“可用”；台账同步问题已修复；两条 P2 thread 均已 resolve。
- UX self-review: PASS FOR MERGE（2026-09-02）。重点复核信息层级、首屏密度、固定栏、安全区、消费者文案、优惠券语义与状态连续性，无 R4 阻塞项。
- Human visual review: pending；统一进入 T019-R5 五屏独立视觉复审。

## Review

- Reviewer: AI UX self-review + PR automated review
- Result: REVIEW
- Conclusion: R4 施工与 UX 自审通过，可合入 `dev`；不单独冒充最终视觉 PASS。
- Follow-up: 合入后进入 T019-R5 独立视觉复审；R5 PASS 后才能恢复父卡 T019 PASS。

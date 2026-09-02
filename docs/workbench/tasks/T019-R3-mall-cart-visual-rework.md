# T019-R3 · 商城购物车视觉返工

- Status: REVIEW
- Target version: 0.2.0
- Impact: Mobile / UX
- Parent: T019
- Owner: -

## Goal

按 `docs/design/t019-mall-ui-baseline.md` Screen C 与已确认商城五屏 UI 稿重构商城购物车。颜色继续使用项目 Design Token；模块顺序、关键几何、商品行密度和固定结算栏按确认稿施工，不做二次设计。

## Product facts

- 每个 storefront 继续保留独立商城购物车，不跨来源混单。
- 商城购物车与便利店购物车完全隔离。
- 商品价格、规格、数量和金额继续读取现有 T019 状态。
- 满 ¥99 包邮，否则 ¥8 的商城运费规则保持不变。
- 不新增部分商品勾选、删除 / 批量管理、凑单推荐、优惠券自动选择等未确认功能。
- R1/R2 已确认的抽象商品视觉语言继续复用，不重新画伪包装。

## Geometry contract

Canonical viewport：390×844；关键块容差 ±4px。

- 标题区：56px。
- 当前商城来源：44px。
- 单商品行：128px。
- 商品缩略图：82×82px。
- 数量 stepper 单按钮触控尺寸：≥44px。
- 金额汇总区：116px。
- 固定结算栏：68px。
- 一级导航：64px；结算栏必须固定在一级导航上方，不互相覆盖。

## Hard constraints

- 除颜色 token 外，不自行改变确认稿的模块顺序、商品行高度、缩略图比例、金额区结构与固定结算栏位置。
- ready state 不再使用通用 Demo Card 堆叠。
- 当前商城来源只用一行消费者语言表达，不显示 `Storefront`、`Channel`、`Mock`、`独立模型`、`不与便利店混单` 等工程说明。
- Cart 保留一级底部导航；不改 R4 checkout / order 展示层。

## Acceptance

- [x] 390×844 购物车关键几何符合 Screen C。
- [x] 多商品连续展示，无横向溢出。
- [x] 商品名、规格、单价、数量和行小计主次清楚。
- [x] +/- 数量行为与数量归零语义不回归。
- [x] storefront 购物车隔离保持原 T019 行为。
- [x] 商品小计、运费、包邮提示与应付金额保持现有规则。
- [x] 去结算继续进入 checkout。
- [x] 固定结算栏与一级导航不重叠。
- [x] 正常消费者路径无工程术语。
- [x] typecheck / build / T019 cart regression / R3 geometry browser tests 通过。

## Verification evidence

- PR: #24；merge commit `43ccd84c816e9f47e75f3c060008874e9404c73a` 已进入 `dev`。
- CI: Verify Prototype #264 `success`。
- Browser: T019 原闭环 6/6、R1 3/3、R2 3/3、R3 3/3，共 15/15 商城用例通过；全仓 Browser Quality 仍有 8 条既有便利店 checkout 旧断言失败，不由 R3 引入。
- UX self-review: PASS；修正商品行内部拥挤，并处理 PrototypePanel 遮挡“去结算”点击区问题；对应 Codex P2 已修复并 resolve。
- Human visual review: pending。

## Review

- Reviewer: human pending
- Result: REVIEW
- Conclusion: 已合入 `dev` 供实屏复审；用户明确视觉 PASS 前不进入 `PASS`。

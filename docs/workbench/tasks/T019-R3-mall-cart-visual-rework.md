# T019-R3 · 商城购物车视觉返工

- Status: TODO
- Target version: 0.2.0
- Impact: Mobile / UX
- Parent: T019
- Owner: -

## Background

T019 已有独立商城购物车、数量调整、金额汇总和结算 handoff，但当前页面仍以 Demo 说明和通用 Card 堆叠为主，视觉密度与确认稿不一致。用户要求除颜色改用项目现有 Design Token 外，严格按照确认稿的交互、模块顺序和宽高布局返工。

统一视觉合同：`docs/design/t019-mall-ui-baseline.md`。

## Goal

把商城购物车重构为确认稿中的紧凑电商购物车：商品列表为主，数量控制、行小计、运费 / 包邮提示清晰，并保持当前 storefront 独立购物车语义和结算逻辑不变。

## Product facts

- 每个 storefront 保留独立商城购物车，不跨来源混单。
- 商城购物车与便利店购物车完全隔离。
- 商品价格、规格与当前购物车数量继续使用现有 T019 数据与状态。
- 满 ¥99 包邮，否则 ¥8 的 T019 mock 运费规则保持不变。
- 当前功能没有“勾选部分商品结算”的正式产品合同；确认稿中的选择视觉不得被实现成新的结算业务规则，除非只是现有购物车整体状态的静态视觉映射。

## Scope

- 购物车标题区与当前商城来源一行表达。
- 商品列表：缩略图、名称、规格、单价、数量 stepper、行小计。
- 商品小计、预计运费、距离包邮门槛的提示 / 进度表达。
- 固定结算栏：合计金额 + 去结算。
- Cart 页面保留一级底部导航，且固定结算栏与一级导航不互相覆盖。
- 空购物车状态继续可用，但 ready canonical state 以有商品的确认稿为主。

## Geometry contract

严格遵守 `docs/design/t019-mall-ui-baseline.md` Screen C：

- 390×844 canonical viewport。
- 标题区 56px。
- 来源提示 44px。
- 单商品行 128px。
- 商品缩略图 82×82px。
- 数量 stepper 每个按钮触控尺寸 ≥44px。
- 金额汇总区 116px。
- 固定结算栏 68px。
- 一级导航 64px。
- 关键块高度容差 ±4px。

## Hard constraints

- **除颜色 token 替换外，不得自行修改确认稿的交互、模块顺序、商品行高度、缩略图比例、金额区结构与固定结算栏位置。**
- 不新增“部分商品选择结算”业务逻辑；确认稿中的选中图形若保留，只能作为不改变现有结算语义的视觉元素。
- 不把购物车改成便利店式浮动小购物栏。
- 不显示“Storefront 独立购物车模型”“不与任何便利店混单”等解释段落；只允许用一行正常消费者语言标注当前商城来源。
- 不新增删除、批量管理、优惠券自动选择、凑单推荐等未确认功能。
- 商品缩略图必须复用 R1 / R2 的真实感演示资产，不允许色块占位。
- 颜色必须使用现有 semantic tokens。

## Out of scope

- 商城首页、商详由 R1 / R2 承接。
- 结算与订单物流由 R4 承接。
- 修改 Shared 商品 / 订单规则。

## Acceptance

- [ ] 390×844 ready state 与视觉基准结构、宽高一致，关键高度 ±4px。
- [ ] 多商品购物车可连续展示，无横向溢出。
- [ ] 缩略图、商品名、规格、价格、数量和行小计主次清楚。
- [ ] + / - 数量行为与现有逻辑一致；数量归零行为不回归。
- [ ] 当前 storefront 切换后的购物车隔离语义仍通过原 T019 regression。
- [ ] 商品小计、运费、应付金额继续使用现有 T019 规则。
- [ ] 去结算进入 R4 对应 checkout，不改变订单语义。
- [ ] 固定结算栏与 64px 一级导航不重叠。
- [ ] 正常消费者路径无内部工程术语。
- [ ] 所有颜色使用项目 Design Token。
- [ ] typecheck / build / T019 cart isolation + checkout handoff browser tests 通过。

## Risks / Dependencies

- 前置：R1、R2 已整合到最新候选。
- `MallFlowScreen.tsx` 单体文件仍是主要竞态点；本卡不得与 R2 / R4 同时从不同旧基线改同一区域。

## Dispatch Context

- Repo: `dangjingtao/local-life-prototype`
- Suggested branch: `task/T019-R3-mall-cart-visual-rework`
- Must Read: `AGENTS.md`、T019、T019-R1、T019-R2、`docs/design/t019-mall-ui-baseline.md`、`apps/mobile/src/MallFlowScreen.tsx`、T019 browser tests。
- Start from: 已整合 R1 / R2 的最新 `dev` / approved candidate。

## Verification evidence

- CI:
- Screenshot / Browser result:
- Other evidence:

## Review

- Reviewer:
- Result: REVIEW / CHANGES_NEEDED
- Conclusion:
- Follow-up: R3 进入 REVIEW 并整合后再进入 R4。

# T019-R5 · 商城视觉复审与验收

- Status: TODO
- Target version: 0.2.0
- Impact: Mobile / UX / QA / Docs
- Parent: T019
- Owner: -

## Background

T019 曾在功能、CI、browser regression 和 AI Review 全绿后进入 PASS，但 2026-09-02 用户视觉验收明确不通过。复审发现：商品视觉为色块占位、消费者界面泄漏 Storefront / Channel / Mock / T019 等工程术语、首页和深层页以解释型 Card 为主，未达到 V0.2 中高保真成熟商城标准。

用户已经确认新的五屏商城 UI 稿，并要求：交互保持；除颜色改为项目 Design Token 外，严格按照该稿的交互、模块顺序、关键宽高布局施工。

统一视觉合同：`docs/design/t019-mall-ui-baseline.md`。

## Goal

独立复审 T019-R1-R4 的最终整合结果，确认商城是否真正达到用户已确认的 UI 基准，并决定 T019 是否可以从 `REVIEW` 恢复 `PASS`。

## Product facts

- R5 不新增功能、不改业务规则，只做独立 UX / Visual / Regression 验收。
- CI / typecheck / build / Playwright 只能作为证据，不能替代真实屏幕视觉判断。
- 颜色必须来自项目现有 Design Token，因此不按确认稿橙色做像素匹配。
- 除颜色外，确认稿的交互、模块顺序、关键宽高比例、首屏密度、固定操作栏位置是强制基准。
- T019 原有全国快递、独立购物车、Storefront 隔离、搜索 handoff、checkout、订单状态等功能必须全部保留。

## Scope

- 使用真实 Chromium `390 × 844` 逐屏检查：商城首页、商品详情、购物车、结算确认、订单 / 物流详情。
- 对照 `docs/design/t019-mall-ui-baseline.md` 逐项测量 canonical ready state 关键区块。
- 检查 App chrome：Mall Home / Cart 一级导航、Detail / Checkout / Order 深层操作栏和返回路径。
- 检查商品视觉是否使用真实感演示图 / 包装图，而非文字色块。
- 检查消费者语言：禁止工程术语泄漏。
- 检查商城来源切换、各 storefront 独立购物车、商城内搜索 / 分类、全局搜索 handoff、加购 / 立即购买、结算、订单状态推进。
- 回归 T016 / T019 / T012 相关 browser tests、typecheck、build。
- 给出明确 `PASS` / `CHANGES_NEEDED`；如有阻塞，回派 R1-R4 对应责任卡，不在 R5 临时施工。

## Visual acceptance matrix

### A. 商城首页

- [ ] 模块顺序：商城头部 → 来源选择 → 搜索 → 分类 → Banner → 双列推荐 → 包邮条 → 一级导航。
- [ ] 头部 92px、来源 108px、搜索 44px、分类 36px、Banner 112px、包邮 52px、底栏 64px；关键块 ±4px。
- [ ] 商品双列 gap 10px、单卡约 174px、商品图 122px、卡高约 216–224px。
- [ ] 首屏消费内容密度与确认稿一致，不被模型解释占据。

### B. 商品详情

- [ ] Top bar 48px；主图 286px ±4px；购买栏 72px。
- [ ] 商品主图 / 标题 / 价格是主要视觉，规格、促销、配送、优惠层级与确认稿一致。
- [ ] 加入购物车 / 立即购买并列 CTA 位置与尺寸一致。

### C. 购物车

- [ ] 标题 56px、来源 44px、单商品行 128px、缩略图 82×82、汇总 116px、结算栏 68px、一级导航 64px。
- [ ] 固定结算栏与一级导航无重叠。
- [ ] 未新增“部分商品选择结算”等未确认业务。

### D. 结算确认

- [ ] Top bar 52px、地址 104px、来源 / 配送 / 备注 116px、商品行 72px、金额区 132px、提交区 72px。
- [ ] 地址、店铺来源、配送、商品、运费 / 优惠 / 应付金额层级与确认稿一致。

### E. 订单 / 物流

- [ ] Top bar 52px、状态 Hero 112px、订单号 44px、三段进度 72px、物流区约 228px、订单信息约 136px、底部 72px。
- [ ] 待发货 / 运输中 / 已签收三段状态清楚，物流时间线结构与确认稿一致。

## Language / visual guard

正常消费者路径必须无以下字符串或等价工程表达：

- `T019`
- `Mock` / `mock`
- `fixture`
- `Storefront`
- `Channel`（作为模型术语）
- `planned`
- `integrationStatus`
- `Shared 未定义`
- `不读取便利店库存`
- `不发起真实支付`
- `MOCK-SF-`

允许文档、测试代码、Prototype Runtime 内存在上述说明，但不能进入 canonical consumer UI。

## Functional regression acceptance

- [ ] 商城来源切换仍读取实际 fixtures，未硬编码单店。
- [ ] 每个来源购物车隔离；跨一级 Tab 返回仍保持。
- [ ] 商城内搜索 / 分类仍工作。
- [ ] 全局搜索指定商城商品仍能打开实际商品详情。
- [ ] 加入购物车 / 立即购买 / 数量调整 / 去结算连续可用。
- [ ] 提交订单消费当前购物车并生成订单快照。
- [ ] `待发货 → 运输中 → 已签收 / 已完成` 可连续推进。
- [ ] 商城全程无便利店自提 / 3 公里短配语义。
- [ ] 无横向溢出，固定操作栏可达。
- [ ] `npm run typecheck`、`npm run build`、相关 browser suite 通过。

## Hard constraints

- Reviewer 不得以“颜色和 UI 稿不同”为失败理由；颜色必须以 Design Token 为准。
- Reviewer 也不得以“响应式差异”为由放宽 canonical 390×844 的关键几何合同。
- 自动测试不能自己把 R5 或 T019 改为 PASS。
- 任何阻塞项必须明确归属 R1 / R2 / R3 / R4；R5 不堆临时实现。
- 必须保留五个 canonical ready state 的真实屏幕证据。

## Risks / Dependencies

- 前置：T019-R1-R4 全部进入 REVIEW 且已整合到同一最新 `dev` 候选。
- 若 R1-R4 尚未整合，不允许用各自分支截图拼成“整体通过”。
- T026 V0.2 总验收不能再引用旧 T019 PASS 作为商城中高保真完成证据；必须引用 R5 的最终结论。

## Dispatch Context

- Repo: `dangjingtao/local-life-prototype`
- Suggested branch: `task/T019-R5-mall-visual-review`（若仅落验收记录，可使用 review 分支；不得与施工分支混用）
- Must Read: `AGENTS.md`、T019、T019-R1-R4、`docs/design/t019-mall-ui-baseline.md`、T016、T026、`docs/product/01-v0.2-prd.md`、相关 browser tests。
- Page / Route: `/?demoAuth=1` → 商城全链路。

## Verification evidence

- CI:
- Screenshot / Browser result:
- Other evidence:

## Review

- Reviewer:
- Result: PASS / CHANGES_NEEDED
- Conclusion:
- Follow-up: 只有用户 / 授权 Reviewer 明确确认 R5 PASS 后，才能恢复 T019 PASS，并把新证据交给 T026。

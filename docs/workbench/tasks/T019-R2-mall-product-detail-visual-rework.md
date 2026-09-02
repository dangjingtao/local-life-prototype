# T019-R2 · 商城商品详情视觉返工

- Status: REVIEW
- Target version: 0.2.0
- Impact: Mobile / UX
- Parent: T019
- Owner: -

## Goal

按 `docs/design/t019-mall-ui-baseline.md` Screen B 与已确认商城五屏 UI 稿重构商品详情页。颜色继续使用项目 Design Token；交互、模块顺序、关键几何与固定购买栏按确认稿施工，不做二次设计。

## Product facts

- 商品实体、价格、规格、促销和商城优惠继续读取现有 Shared fixtures。
- 商城只走全国快递；保留满 ¥99 包邮 / 未满 ¥8 的 T019 规则。
- 加入购物车与立即购买并列保留；购物车继续按 storefront 隔离。
- 全局搜索进入指定商城商品时必须直接落到商品详情。
- 不新增真实 SKU、支付、客服、收藏持久化或外部平台能力。

## Geometry contract

- Top bar：48px 内容行；iPhone 顶部 safe-area 额外保留，不侵占内容行。
- 商品主视觉：286px。
- 标题 / 价格主信息区：约 132px。
- 规格：44px。
- 促销：52px。
- 配送 / 运费：72px。
- 优惠券：76px。
- 固定购买栏：72px；主按钮高 48px。
- Canonical viewport：390×844；关键块容差 ±4px。

## Hard constraints

- 除颜色 token 外，不得自行改变确认稿的交互、模块顺序、关键宽高比例与购买栏位置。
- 商品主视觉必须是详情页第一视觉中心；本轮继续使用抽象商品视觉语言，不画伪包装、不用文字块冒充商品图。
- 不把页面拆回大量同权重 Card。
- 不显示 Storefront / Channel / Mock / Shared 未定义 / T019 等工程术语。
- 不发明 fixtures 中不存在的优惠金额、物流品牌、SKU 或业务规则。
- Product Detail 隐藏一级底部导航，固定购买栏处理 bottom safe-area，Top Bar 处理 top safe-area；返回、全局搜索和购物车入口保持可达。

## Acceptance

- [x] 390×844 商详关键几何符合 Screen B。
- [x] 标题、价格、原价、规格、促销、配送、优惠连续可扫读。
- [x] 加入购物车数量正确，返回商城后 badge 正确。
- [x] 立即购买进入当前 storefront 的购物车。
- [x] 全局搜索 handoff 仍直达指定商品详情，并可继续打开全局搜索。
- [x] 固定购买栏不与 safe-area / 一级导航冲突；Top Bar 已补 iPhone 顶部 safe-area。
- [x] 正常消费者商详路径无工程术语泄漏。
- [x] typecheck / build / T016 handoff / T019 / R1 / R2 detail regression 已通过 R2 专项范围。

## UX self-review · 2026-09-02

### Observation

- 首屏层级已从旧版“Card 堆叠 + 工程说明”转为明确的电商商详：Top Bar → 主视觉 → 商品主信息 → 规格 / 促销 / 配送 / 优惠 → 固定购买栏。
- 286px 主视觉在第一轮实屏中信息量偏空；已仅针对 Detail 增强抽象渐变、几何层次和展台感，不改 R1 首页商品卡。
- 价格、原价、已省金额与促销形成清晰购买决策层级；商城来源退为辅助标签，不再抢主视觉。
- 加购 / 立即购买固定在底部，购物车数量和全局搜索保持可达；一级导航不与购买栏争抢空间。
- 工程术语已从商详正常路径移除；物流、优惠金额等未新增未定义事实。

### Inference

- 当前商详已达到“可作为中高保真原型继续人工视觉验收”的水平；核心剩余风险不在 R2 商详，而在 T019 后续购物车 / 结算 / 订单页面仍有历史工程文案，需要由后续 R3 / R4 收口。

### Judgment

- R2 自审结果：`PASS FOR MERGE / KEEP T019 IN REVIEW`。
- 可以合入 `dev` 作为商城商详新基线，但父卡 T019 不恢复 PASS，等待后续商城全链 UX 返工与用户最终视觉确认。

## Verification evidence

- PR: #23
- Verify Prototype #256: success（修复前一轮）；最终 head 需以 PR checks 为准。
- Browser Quality #78: R2 相关范围全部通过：T016 连续搜索、原 T019 6/6、R1 3/3、R2 3/3；全仓剩余 8 条失败属于便利店既有基线，不由本 PR 引入。
- Codex review: P1 台账登记与 P2 iPhone top safe-area 均已接受并修复。
- UX self-review: PASS FOR MERGE；用户最终视觉验收 pending。

## Review

- Reviewer: AI UX self-review + PR automated review
- Result: REVIEW
- Conclusion: R2 可合入 `dev`；T019 保持 REVIEW，等待后续商城链路和用户视觉验收。
# T019-R2 · 商城商品详情视觉返工

- Status: DOING
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

- Top bar：48px。
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
- 商品主视觉必须是详情页第一视觉中心；本轮继续使用 R1 已稳定的抽象商品视觉语言，不画伪包装。
- 不把页面拆回大量同权重 Card。
- 不显示 Storefront / Channel / Mock / Shared 未定义 / T019 等工程术语。
- 不发明 fixtures 中不存在的优惠金额、物流品牌、SKU 或业务规则。
- Product Detail 隐藏一级底部导航，固定购买栏处理 safe-area；返回路径和购物车入口保持可达。

## Acceptance

- [ ] 390×844 商详关键几何符合 Screen B。
- [ ] 标题、价格、原价、规格、促销、配送、优惠连续可扫读。
- [ ] 加入购物车数量正确，返回商城后 badge 正确。
- [ ] 立即购买进入当前 storefront 的购物车。
- [ ] 全局搜索 handoff 仍直达指定商品详情。
- [ ] 固定购买栏不与 safe-area / 一级导航冲突。
- [ ] 正常消费者路径无工程术语泄漏。
- [ ] typecheck / build / T016 handoff / T019 detail regression 通过。

## Verification evidence

- CI: pending
- Browser: pending
- Human visual review: pending

## Review

- Reviewer: pending
- Result: REVIEW / CHANGES_NEEDED
- Conclusion: pending

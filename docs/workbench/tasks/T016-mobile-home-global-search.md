# T016 · Mobile 运营首页、一级 IA 与全局搜索

- Status: TODO
- Target version: 0.2.0
- Impact: Mobile / Shared
- Owner: -

## Background

V0.1 首页与底部导航表达重复，缺少运营承载和产品级搜索。V0.2 已确认采用 Home / Convenience / Mall / Smart Care / My 的业务 IA，并要求中高保真、多个虚拟活动和全局搜索。

## Goal

完成 V0.2 Mobile 一级信息架构、运营首页和跨业务全局搜索，使首页从概念入口页升级为可运营、可浏览、可发现的真实产品首页。

## Product facts

- 首页承担运营内容，不再复制三个业务入口。
- 全局搜索跨便利店、商城、智慧抗衰和活动，不属于商城。
- 三大业务语义继续明确保留。
- 首页需要多个虚拟活动。

## Scope

- 调整 Mobile 一级导航结构，保持 Home / Convenience / Mall / Smart Care / My 业务层级清晰。
- 运营首页加入搜索、Banner / Hero、多个虚拟活动、主题推荐、三大业务域推荐和会员权益内容。
- 基于 T015 fixtures 实现全局搜索结果，至少覆盖便利店商品、商城商品、智慧抗衰项目 / 套餐、活动。
- 搜索结果明确业务归属；便利店商品无门店上下文时先进入选店逻辑，不伪造全局库存。
- 中高保真视觉：内容密度、活动层级、真实文案、图片 / 素材占位方式达到可做 UX / UI 评审的水平。

## Out of scope

- 真实 CMS、搜索索引、推荐算法。
- 三大业务域完整交易流程；本卡只负责入口、发现和搜索。
- 最终品牌视觉资产。

## Acceptance

- [ ] 首页不再与底部导航同构重复。
- [ ] 首页至少可演示 3 个不同主题 / 形态的虚拟活动或运营位。
- [ ] 全局搜索可从统一入口搜索四类实体并分域展示。
- [ ] 搜索进入便利店商品时正确处理门店上下文。
- [ ] 一级 IA 在 390px Mobile 可清晰使用，无横向溢出。
- [ ] ready / loading / empty / error 状态可验证。
- [ ] `npm run typecheck`、`npm run build` 通过，并完成真实浏览器检查。

## Risks / Dependencies

- 前置：T015。
- 一级导航视觉形态允许在不破坏业务 IA 的前提下调整，不强制五个业务层级全部以固定 Tab 形式出现。

## Implementation record

- Commit / PR:
- Changed paths:
- Notes:

## Verification evidence

- CI:
- Page / Route:
- Screenshot / Browser result:
- Other evidence:

## Review

- Reviewer:
- Result: REVIEW / PASS / BLOCKED
- Conclusion:
- Follow-up:

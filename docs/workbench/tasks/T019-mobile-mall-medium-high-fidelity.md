# T019 · Mobile 线上商城中高保真购买闭环

- Status: REVIEW
- Target version: 0.2.0
- Impact: Mobile / Shared
- Owner: Mira

## Background

V0.2 要求线上商城呈现成熟、可信的电商体验，并与便利店即时履约彻底隔离，同时预留一端多 Storefront / Channel 的产品语义。

2026-09-02 用户对现有 T019 做视觉复审，明确结论为 `CHANGES_NEEDED`。原 PR #13 的功能闭环、CI、购物车隔离、全国快递和订单状态证据继续有效，但旧 PASS 不再代表当前中高保真视觉通过。返工按已确认五屏 UI 稿拆为 T019-R1～R5，视觉 SSOT 为 `docs/design/t019-mall-ui-baseline.md` 与 `docs/design/assets/t019-mall-ui-reference.webp`。

## Goal

完成线上商城从聚合首页到签收的中高保真购买闭环，并清晰表达线上店铺 / 渠道来源。

## Product facts

- 商城全国快递，不依赖线下便利店。
- 商城拥有独立购物车，不与便利店混单。
- 产品 / 数据结构需预留 Storefront / Channel，不写死单店。
- V0.2 不做真实外部商城 API。
- 返工只改变消费者视觉表达，不回滚已确认业务模型。

## Scope

- 商城聚合首页 / 当前 Storefront、渠道标识、品类频道、推荐商品。
- 商品列表 / 筛选 / 搜索、商品详情、规格、优惠和购买 CTA。
- 商城独立购物车。
- 地址、结算、包邮 / 满额包邮等可追踪 mock 表达。
- 商城订单详情、待发货、运输中、已签收 / 已完成状态。
- 至少用两种 Storefront / Channel 语义样本证明模型未锁死单店。
- 中高保真电商视觉，不复用便利店页面结构冒充商城。

## Out of scope

- 真实物流、支付、外部电商平台接口。
- 复杂多店切换产品和店铺经营后台，PC 承接见 T024。

## Acceptance

- [x] 商城首页、商品详情、购物车、结算、订单 / 物流可连续演示。
- [x] 全程不出现便利店门店库存、自提或 3 公里短配逻辑。
- [x] Storefront / Channel 业务语义可被用户感知但消费者界面不直接暴露工程术语。
- [x] 商品图、规格、价格、优惠、包邮信息和 CTA 已由 T019-R1～R5 按确认稿完成返工；R5 独立五屏复审结论为 `PASS FOR HUMAN / REVIEW`。
- [x] 至少覆盖待发货、运输中、签收三类订单状态。
- [x] 390×844 Mobile 五屏真实视觉证据已由 T019-R5 生成并逐屏独立复审；正式人类 PASS 仍待用户确认。
- [x] 返工最终候选 Verify Prototype #280 success；商城专项与 T019 全购买链浏览器回归通过。

## Risks / Dependencies

- 前置：T015、T016。
- 不得把“抖音店”示例误做成真实外部集成。
- R1 → R2 → R3 → R4 默认串行，R5 独立视觉验收。

## Implementation record

- Original implementation: PR #13；merge `c9aa08342e81199934feff95be5045d925c38ea6`。
- Visual rework: T019-R1～R5，2026-09-02 起。
- R2: PR #23 merge `da635596`。
- R3: PR #24 merge `43ccd84c`。
- R4: PR #25 merge `247299010e4ef26b316234b6e31c7f1067db6311`。
- R5: PR #26；首轮发现订单物流进度区产生 19px 横向溢出，已在 R5 修复并补充 R4 三状态横向溢出回归。

## Verification evidence

- 原功能证据：Verify Prototype #187、T012 Browser Quality #44、Experimental OpenCode #65 success。
- 原产品验收：2026-08-31 用户功能/当时视觉验收通过。
- 视觉重开：2026-09-02 用户明确视觉验收不通过；确认五屏 UI 稿作为返工基准。
- R5 final candidate: `4f6f3b899fa8b7e7d00553ba51ff9a1c157cb334`。
- R5 Verify Prototype #280: `success`。
- R5 Browser Quality #98: 78 项中 70 passed / 8 failed；商城 T012 / T016 handoff / T019 / R1 / R2 / R3 / R4 / R5 全部通过，8 项失败均为既有便利店 T017 / T018 / T032 旧基线。
- R5 final five-screen artifact: `9855267147`，digest `sha256:671a088a2ac4e947bd02fc24705c8c3b72dcb88e06358c01f72638c17300532c`。
- R5 visual conclusion: 五屏实图无新的阻塞级结构、密度、遮挡或消费者语义问题；订单三段进度横向溢出已在最终证据前修复。

## Status history

- 2026-08-31 `TODO → DOING → REVIEW → PASS`：PR #13 完成功能闭环并经用户验收。
- 2026-09-02 `PASS → REVIEW`：用户视觉复审 `CHANGES_NEEDED`；保留旧功能证据，进入 T019-R1～R5 视觉返工链。
- 2026-09-02 R5 execution complete：独立视觉复审 `PASS FOR HUMAN / REVIEW`；根据仓库规则，在用户明确确认前父卡继续保持 `REVIEW`。

## Review

- Reviewer: Mira independent UX review completed / Tomz final visual confirmation pending
- Result: REVIEW
- Conclusion: R1～R5 返工链已完成，R5 真实五屏复审执行层通过并修复 1 个实际横向溢出缺陷；当前仅等待用户在 `dev` 部署预览上做最终视觉确认。
- Follow-up: PR #26 合入 `dev` → 用户最终视觉确认 → 若确认通过，将 T019-R5 与 T019 正式恢复 `PASS`。

# T019 · Mobile 线上商城中高保真购买闭环

- Status: REVIEW
- Target version: 0.2.0
- Impact: Mobile / Shared
- Owner: Mira

## Background

V0.2 要求线上商城呈现成熟、可信的电商体验，并与便利店即时履约彻底隔离。Shared / PC 继续预留一端多 Storefront / Channel 的数据与运营结构，但根据 2026-09-03 用户在 `dev` 部署预览上的明确视觉纠正，**商城消费者前台不再展示“精选店铺 / 官方商城 / 合作渠道 / 店铺来源 / Storefront / Channel 切换”等店铺或来源心智**。

2026-09-02 用户对现有 T019 做视觉复审，明确结论为 `CHANGES_NEEDED`。原 PR #13 的功能闭环、CI、购物车隔离、全国快递和订单状态证据继续有效，但旧 PASS 不再代表当前中高保真视觉通过。返工按已确认五屏 UI 稿拆为 T019-R1～R5；其中 Screen A 的“精选店铺”段已被 2026-09-03 最新用户结论明确废弃，后续以 T033 / PR #28 的消费者语义收口为准。

## Goal

完成线上商城从商品发现到签收的中高保真购买闭环。消费者只感知商品、活动、优惠、购物车、全国快递、结算与物流；Storefront / Channel 仅作为内部数据模型和 PC 运营后台能力存在。

## Product facts

- 商城全国快递，不依赖线下便利店。
- 商城拥有独立购物车，不与便利店混单。
- Shared / PC 数据结构继续预留 Storefront / Channel，不把后台渠道模型锁死为唯一单店。
- Mobile 消费端不展示店铺选择、店铺来源、Storefront / Channel 或其消费者化替代文案。
- V0.2 不做真实外部商城 API。
- 2026-09-03 用户最新视觉结论优先于旧五屏 Screen A 中的“精选店铺”模块和旧“来源可感知”要求。

## Scope

- 商城首页：活动、品类、推荐商品；不提供店铺 / 来源选择。
- 商品列表 / 筛选 / 搜索、商品详情、规格、优惠和购买 CTA。
- 商城独立购物车。
- 地址、结算、包邮 / 满额包邮等可追踪 mock 表达。
- 商城订单详情、待发货、运输中、已签收 / 已完成状态。
- Shared / PC 至少保留两种 Storefront / Channel 样本，证明后台模型未锁死；该证明不通过 Mobile 消费端切换 UI 完成。
- 中高保真电商视觉，不复用便利店页面结构冒充商城。

## Out of scope

- 真实物流、支付、外部电商平台接口。
- Mobile 多店 / 多渠道切换产品。
- 店铺经营与渠道管理后台，PC 承接见 T024。

## Acceptance

- [x] 商城首页、商品详情、购物车、结算、订单 / 物流可连续演示。
- [x] 全程不出现便利店门店库存、自提或 3 公里短配逻辑。
- [x] Storefront / Channel 不在消费者前台暴露；商城 Home / Detail / Cart / Checkout / Order 不出现“精选店铺 / 店铺来源 / 官方商城 / 合作渠道专场”等店铺来源心智。
- [x] Shared / PC 仍保留 Storefront / Channel 数据与运营语义，消费者前台去店铺化不等于删除后台渠道模型。
- [x] 商品图、规格、价格、优惠、包邮信息和 CTA 已由 T019-R1～R5 形成中高保真基础；PR #28 按最新用户结论重排 Home / Cart / Checkout / Order 中受店铺来源影响的结构。
- [x] 至少覆盖待发货、运输中、签收三类订单状态。
- [x] 390×844 Mobile 五屏真实视觉证据可由 T019-R5 生成并逐屏独立复审；PR #28 会在 storefront-free 候选上重新生成五屏证据。
- [x] PR #28 final head 的 T019 / R1-R5 商城浏览器回归全部通过；整体 Browser Quality 剩余失败仅为既有便利店旧断言时，不视为商城回归失败。

## Risks / Dependencies

- 前置：T015、T016。
- 不得把“抖音店”示例误做成真实外部集成。
- Storefront / Channel 的后台扩展能力与 Mobile 消费端信息架构必须分离，不能再把内部模型直接投射成消费者“选店”。
- R1 → R2 → R3 → R4 默认串行，R5 独立视觉验收。

## Implementation record

- Original implementation: PR #13；merge `c9aa08342e81199934feff95be5045d925c38ea6`。
- Visual rework: T019-R1～R5，2026-09-02 起。
- R2: PR #23 merge `da635596`。
- R3: PR #24 merge `43ccd84c`。
- R4: PR #25 merge `247299010e4ef26b316234b6e31c7f1067db6311`。
- R5: PR #26；首轮发现订单物流进度区产生 19px 横向溢出，已在 R5 修复并补充 R4 三状态横向溢出回归。
- Consumer storefront removal: T033 follow-up PR #28；删除 Home“精选店铺”、Detail 来源标签、Cart 来源条、Checkout / Order“店铺来源”行，Storefront / Channel 仅保留内部模型。

## Verification evidence

- 原功能证据：Verify Prototype #187、T012 Browser Quality #44、Experimental OpenCode #65 success。
- 原产品验收：2026-08-31 用户功能/当时视觉验收通过。
- 视觉重开：2026-09-02 用户明确视觉验收不通过；确认五屏 UI 稿作为返工基准。
- R5 final candidate: `4f6f3b899fa8b7e7d00553ba51ff9a1c157cb334`。
- R5 Verify Prototype #280: `success`。
- R5 Browser Quality #98: 78 项中 70 passed / 8 failed；商城 T012 / T016 handoff / T019 / R1 / R2 / R3 / R4 / R5 全部通过，8 项失败均为既有便利店 T017 / T018 / T032 旧基线。
- R5 historical five-screen artifact: `9855267147`，digest `sha256:671a088a2ac4e947bd02fc24705c8c3b72dcb88e06358c01f72638c17300532c`。
- 2026-09-03 storefront-free follow-up: PR #28，Verify #292 success；Browser #108 为 70/78，T019 / R1-R5 全部通过，8 项失败仍全部来自既有便利店旧基线；新五屏 artifact `9874364184`。

## Status history

- 2026-08-31 `TODO → DOING → REVIEW → PASS`：PR #13 完成功能闭环并经用户验收。
- 2026-09-02 `PASS → REVIEW`：用户视觉复审 `CHANGES_NEEDED`；保留旧功能证据，进入 T019-R1～R5 视觉返工链。
- 2026-09-02 R5 execution complete：独立视觉复审 `PASS FOR HUMAN / REVIEW`；根据仓库规则，在用户明确确认前父卡继续保持 `REVIEW`。
- 2026-09-03：用户在 `dev` 部署预览明确要求删除商城“店铺概念”；T033 / PR #28 将该结论提升为消费者侧正式语义，旧“来源可感知”要求作废。

## Review

- Reviewer: user visual correction / Mira implementation review / Tomz final visual confirmation pending
- Result: REVIEW
- Conclusion: 商城业务闭环继续有效；消费者侧 Storefront / Channel 选择心智已被用户明确否决并在 PR #28 移除。Shared / PC 继续保留渠道模型。PR #28 合入 `dev` 后等待用户重新看 storefront-free 五屏，再决定 T019-R5 / T019 是否正式 PASS。

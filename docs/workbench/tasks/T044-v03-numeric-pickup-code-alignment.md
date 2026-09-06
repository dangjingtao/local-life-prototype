# T044 · V0.3 数字取货码语义整改

- Status: PASS
- Target version: 0.3.0
- Type: Shared / Mobile / PC / Fulfillment / Release Gate
- Predecessors: T034、T037、T038、T039
- Related PRD: V0.3 R02、Release Gate

## Why

V0.3 PRD R02 明确要求“二维码 + 数字取货码”双凭证。

当前实现虽然完成了同一订单 / 同一 redemption / 双通道互斥，但 Shared 核心自提订单 `LL-1024` 的 `pickupCode` 仍为 `LL-1024`，属于订单号式字母数字串；Mobile 页面却以“数字取货码”展示，PC 也以取货码输入核销。

按 V0.3 PRD 反向验收，这属于真实语义偏差，必须在进入人类最终验收前收口。

## Unique deliverable

把 V0.3 核心自提订单的取货码收口为**稳定、纯数字的 pickupCode**，并证明 Mobile / PC / Shared / redemption 继续引用同一个码、同一订单、同一核销状态。

本卡只改“取货码值与输入 / 展示语义”，不重做二维码、订单状态机或核销流程。

## Product contract

- `orderId` 继续是 `LL-1024`，不得因为数字码整改改订单 ID。
- `redemptionId` 继续是 `REDEEM-LL-1024`，不得创建第二条 redemption。
- `pickupCode` 必须满足纯数字：`/^\d+$/`。
- PRD 未确认数字码长度，因此本卡**不得擅自固化“必须 4 位 / 6 位”等业务规则**；只要求演示值纯数字、稳定、跨端一致。
- `v02Orders[].fulfillmentDetail.pickupCode`、`pickupCredentials[].pickupCode`、对应 `redemptions[].code` 必须同值。
- QR `qrPayload` 不需要改成数字码；二维码与数字码仍是两种凭证，共享同一 redemption。

## Changed paths whitelist

业务代码优先限制为：

- `packages/shared/src/fixtures.ts`
- 如需加强关系校验，可最小修改 `packages/shared/src/selectors.ts`
- 如 PC 输入控件需要补充纯数字输入语义，可最小修改 `apps/pc/src/ConvenienceOperations.tsx`

回归 / 证据允许：

- `tests/browser/t034-shared-contract.spec.mjs`
- `tests/browser/t022-pc-convenience-operations.spec.mjs`
- `tests/browser/t037-mobile-pickup-dual-credential.spec.mjs`
- `tests/browser/t038-pc-qr-redemption.spec.mjs`（仅验证 QR 通道未回归时）
- `tests/browser/t039-pc-pickup-code-redemption.spec.mjs`

不得修改其他 Mobile 业务 UI；`StoreFlowScreen.tsx` 已消费 Shared `pickupCode`，除非实际施工证明存在无法通过 Shared 收口的硬阻塞，否则不进入白名单。

## Out of scope

- 不改订单 ID / redemption ID。
- 不新建第二张 pickup 订单。
- 不改二维码 UI / qrPayload。
- 不接真实扫码硬件。
- 不实现动态 Token、防截屏、防转发。
- 不重做 PC 核销页面。
- 不把“数字码长度”升级成未经确认的新业务规则。

## Acceptance

- [x] Shared 核心自提 `pickupCode` 为纯数字，且与订单 ID 明确分离。
- [x] order fulfillment / PickupCredential / RedemptionRecord 三处 code 同值。
- [x] `validateDemoFixtureRelations()` 返回 `[]`，并新增或保留能防止 code 三处漂移的关系断言。
- [x] Mobile “数字取货码”展示的是 Shared 同一纯数字码。
- [x] PC 输入正确纯数字码可命中 `LL-1024` / `REDEEM-LL-1024`。
- [x] 错误码不改变订单 / redemption。
- [x] code → QR、QR → code 双向互斥继续成立。
- [x] T022 / T037 / T038 / T039 相关回归全部通过。
- [x] typecheck / build 通过。
- [x] 本卡新增 / 修改的数字取货码展示与店员输入不引入 Shared、fixture 等工程术语；既有 Mobile 订单页的历史工程术语由 T045 Release Gate 文案收口统一处理。

## Evidence required

至少提供以下自动化因果证据：

1. Mobile 显示纯数字码，并与同一 `data-redemption-id` 的 QR 并存；
2. PC 正确数字码核销成功；
3. 错误码被拒绝；
4. QR 先核销后数字码被拒绝，或数字码先核销后 QR 被拒绝；
5. Shared 关系校验明确验证 order / credential / redemption code 三处一致。

## Stop conditions

- 如果实现必须修改订单状态定义、二维码合同、redemption 结构或数字码长度规则，立即 BLOCKED，回到产品决策。
- 不允许为了“看起来像数字码”只改 UI 标签而保留 `LL-1024`。


## Execution baseline

- Branch: `task/T044-v03-numeric-pickup-code-alignment`
- Started from: `dev@7460e6752200e02c44349df5844c8d6c751325e1`
- Started at: 2026-09-07
- Scope clarification: T044 只整改数字取货码事实与跨端核销一致性；PRD 反审发现的既有 Mobile `Mock order` / `Shared` 消费者术语已经明确归入 T045，不在本卡静默扩 `StoreFlowScreen.tsx` 白名单。


## Implementation record

- PR: #43 `fix(T044): align numeric pickup code semantics`
- Reviewed implementation head: `5dafa47b648ddf523a5298c1c2c451efd03bef6f`
- Core pickup code: `482731`（纯数字演示值；没有把长度升级成业务规则）。
- `orderId` 保持 `LL-1024`；`redemptionId` 保持 `REDEEM-LL-1024`。
- `v02Orders[].fulfillmentDetail.pickupCode`、`PickupCredential.pickupCode`、`RedemptionRecord.code` 统一消费同一 `CORE_DEMO_PICKUP_CODE`。
- QR payload 保持 `locallife://pickup/LL-1024?credential=PICKUP-CREDENTIAL-LL-1024`，未修改二维码合同或状态机。
- PC 数字码输入补 `inputMode="numeric"` + `pattern="[0-9]*"`；核销逻辑仍消费 Shared credential。
- Mobile 业务代码未修改，既有 T037 页面自动消费新的 Shared 数字码。

## Review / verification

- Verify Prototype #34047758811: **success**（version / typecheck / build 全绿）。
- T012 Browser Quality #34047758808: **124 passed / 8 failed（132 total）**。
  - T022：本卡引入的数字码按钮断言已对齐，latest run 恢复通过。
  - T034：3/3 passed；包含纯数字、order / credential / redemption 三处同值，以及空订单码必须报 `code-mismatch-order` 的关系回归；正常基线 `validateDemoFixtureRelations()` 仍为 `[]`。
  - T037：3/3 passed；Mobile 同一订单同时显示 QR + 数字码 `482731`。
  - T038：2/2 passed；QR 通道未回归。
  - T039：3/3 passed；正确数字码、错误数字码、code→QR / QR→code 互斥均通过。
  - 剩余 8 项**严格等于 T044 开工前**的 T017 / T018 / T032 checkout 旧回归；无 T044 新增失败，统一由 T045 Release Gate 收口到 0。
- CodeRabbit：1×Major“空 / 缺失 order pickupCode 可绕过三方一致性校验”复核成立；已移除 truthy guard、补空字符串关系回归，thread resolved；latest combined status **success**。
- CodeRabbit docstring coverage 为通用非项目合同 warning，不改变本卡结论。
- Codex：仅自动返回额度耗尽提示，按用户当前要求不使用 Codex Review。
- Experimental OpenCode：advisory / non-blocking。
- Self review：没有修改订单 ID、redemption ID、QR payload、Mobile 业务 UI 或履约状态机；数字码值与订单号已真正分离。

## Review

- Result: PASS
- Conclusion: T044 唯一交付物满足；数字取货码语义与三方数据合同闭环，无新增 Browser regression。2026-09-07 按用户既有授权由 Mira 自审验收；PR #43 squash merge `049c5332b839c6f76f072b0363c24e07c725f059`。T045 前置已满足。

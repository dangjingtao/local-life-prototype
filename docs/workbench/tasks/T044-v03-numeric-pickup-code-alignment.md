# T044 · V0.3 数字取货码语义整改

- Status: TODO
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

- [ ] Shared 核心自提 `pickupCode` 为纯数字，且与订单 ID 明确分离。
- [ ] order fulfillment / PickupCredential / RedemptionRecord 三处 code 同值。
- [ ] `validateDemoFixtureRelations()` 返回 `[]`，并新增或保留能防止 code 三处漂移的关系断言。
- [ ] Mobile “数字取货码”展示的是 Shared 同一纯数字码。
- [ ] PC 输入正确纯数字码可命中 `LL-1024` / `REDEEM-LL-1024`。
- [ ] 错误码不改变订单 / redemption。
- [ ] code → QR、QR → code 双向互斥继续成立。
- [ ] T022 / T037 / T038 / T039 相关回归全部通过。
- [ ] typecheck / build 通过。
- [ ] 正常消费者 / 店员页面不出现 Shared、fixture 等工程术语。

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

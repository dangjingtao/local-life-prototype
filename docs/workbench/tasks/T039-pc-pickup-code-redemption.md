# T039 · PC 数字取货码核销

- Status: TODO
- Target version: 0.3.0
- Type: PC / Fulfillment
- Predecessors: T034、T037、T022
- Related PRD: R02

## Unique deliverable

在 T022 便利店履约后台中增加**数字取货码输入核销**，并证明它与 T038 扫码通道操作的是同一订单 / redemption。

## Start gate

与 T038 相同：T022 未稳定不得开工；开工前冻结实际 PC 文件白名单。

## Changed paths whitelist

- T022 已稳定的便利店订单 / 核销模块；
- `tests/browser/t039-pc-pickup-code-redemption.spec.mjs`；
- 如需验证与 T038 互斥，允许最小更新 T038 spec；
- 不允许修改 Mobile。

## Out of scope

- 不接真实门店硬件。
- 不修改二维码 UI。
- 不新增第二套核销状态。
- 不做员工权限 / 审计后台。

## Acceptance

- [ ] PC 可输入数字取货码并匹配订单。
- [ ] 正确码可完成核销。
- [ ] 错误码有明确失败反馈且不改变订单。
- [ ] 已由二维码核销的订单，再输入数字码不得重复核销。
- [ ] 已由数字码核销的订单，再模拟扫码不得重复核销。
- [ ] 两个通道最终状态完全一致。
- [ ] 桌面端 browser test、typecheck、build 通过。

## Evidence required

自动化必须至少包含一次“QR 先核销 → code 被拒绝”或反向互斥验证。

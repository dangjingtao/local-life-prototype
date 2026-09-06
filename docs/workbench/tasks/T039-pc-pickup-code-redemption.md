# T039 · PC 数字取货码核销

- Status: PASS
- Target version: 0.3.0
- Type: PC / Fulfillment
- Predecessors: T034、T037、T022
- Related PRD: R02

## Unique deliverable

在 T022 便利店履约后台中增加**数字取货码输入核销**，并证明它与 T038 扫码通道操作的是同一订单 / redemption。

## Start gate

与 T038 相同：T022 未稳定不得开工；开工前冻结实际 PC 文件白名单。

## Changed paths whitelist

冻结为：
- `apps/pc/src/ConvenienceOperations.tsx`；
- `tests/browser/t039-pc-pickup-code-redemption.spec.mjs`；
- 如需验证与 T038 互斥，允许最小更新 `tests/browser/t038-pc-qr-redemption.spec.mjs`；
- 不允许修改 Mobile / Shared / PC Shell。

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


## Execution baseline

- Branch: `task/T039-pc-pickup-code-redemption`
- Started from latest `dev` after T038 merge.
- Reuse T038 QR channel and the same Shared pickup credential / redemption.
- Shared `pickupCode` current demo value is `LL-1024`; T039 consumes it as-is and does not redefine the contract.


## Implementation record

- PR: #38 `feat(T039): add PC pickup code redemption`
- Final implementation candidate: `e2fa0ece7f9f4bcbf70918e48479266d0f0022f0`
- PC business path: `apps/pc/src/ConvenienceOperations.tsx`
- Browser evidence: `tests/browser/t039-pc-pickup-code-redemption.spec.mjs`
- Mobile / Shared / PC Shell unchanged.

### Delivered behavior

- 在 T022 既有便利店履约后台新增取货码输入、匹配、确认核销流程。
- 正确码消费 Shared `pickupCode`，命中 `LL-1024` / `REDEEM-LL-1024`。
- 错码明确“未匹配”，订单与 redemption 不变化。
- 数字码与 T038 QR 通道共用同一 fulfillment override + redemption override，不创建第二套状态。
- code → QR、QR → code 两个方向均互斥；任一通道确认完成后，另一已匹配通道立即变为“不可重复核销”。
- 重置履约演示同步清理 QR / code 本地交互状态。
- Shared 当前 `pickupCode` 演示值为 `LL-1024`（字母数字混合）；T039 严格消费现有合同，没有擅自改 Shared。

## Review / verification

- Verify Prototype #34005515901: **success**，version / typecheck / build 全绿。
- T012 Browser Quality #34005515921: **108 passed / 8 failed（116 total）**。
  - T039 专项 **3/3 passed**。
  - T038 专项 **2/2 passed**。
  - T022 专项 **5/5 passed**。
  - 剩余 8 项全部为既有 T017 / T018 / T032 checkout 基线债。
- Codex review：额度耗尽，无实质 finding。
- CodeRabbit：仅 processing，无 substantive finding；0 unresolved review thread。
- Self review：发现并修复“双通道都先匹配时，一方核销后另一方 UI 仍显示待确认”的互斥状态同步问题；复核后无阻塞项。

## Review

- Result: PASS
- Conclusion: T039 AC 满足；专项 3/3、T038 2/2、T022 5/5、Verify success，自审无阻塞项。2026-09-06 按用户授权由 Mira 自审验收；PR #38 squash merge `893bdddec66b3da705c67719e2b292090741a77c`。

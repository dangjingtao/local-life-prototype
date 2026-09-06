# T038 · PC 二维码扫码核销

- Status: PASS
- Target version: 0.3.0
- Type: PC / Fulfillment
- Predecessors: T034、T037、T022
- Related PRD: R02

## Unique deliverable

在 T022 已稳定的便利店履约后台中增加**二维码扫码 Mock 核销**，命中 T037 的同一自提订单 / redemption。

## Start gate

T022 尚未稳定时本卡不得 DOING。T022 进入可消费的稳定状态后，开工前必须从 T022 的 Changed paths 中冻结本卡 PC 业务文件白名单；不得为了提前施工另造第二套便利店 PC 后台。

## Changed paths whitelist

开工前必须补全为 T022 的实际便利店履约模块路径。

冻结为：
- `apps/pc/src/ConvenienceOperations.tsx`（T022 已稳定便利店履约模块）；
- `tests/browser/t038-pc-qr-redemption.spec.mjs`；
- `tests/browser/t022-pc-convenience-operations.spec.mjs`（仅把被 V0.3 R02 淘汰的“第二张 Mobile pickup 订单”跨端断言对齐到 Shared `LL-1024`）；
- 不允许修改 Mobile / Shared / `apps/pc/src/App.tsx`。

## Out of scope

- 不接摄像头。
- 不实现真实扫码 SDK。
- 不增加数字码输入流程（T039）。
- 不改变订单状态定义。

## Acceptance

- [x] PC 有明确“扫码核销”入口。
- [x] Mock 扫码可解析到 T037 同一订单。
- [x] 已失效 / 已核销二维码不可再次成功。
- [x] 核销成功更新同一 redemption，不复制记录。
- [x] 页面没有“真实扫码已接入”之类误导表达。
- [x] 桌面端 browser test、typecheck、build 通过。

## Evidence required

至少覆盖：有效扫码成功、重复扫码失败 / 已完成两条自动化路径。


## Execution baseline

- Branch: `task/T038-pc-qr-redemption`
- Started from: `dev@0919fb6e342e989c9ffc702695e3d6ef595edee7`
- Frozen PC business path: `apps/pc/src/ConvenienceOperations.tsx`
- Started at: 2026-09-06


## Implementation record

- PR: #37 `feat(T038): add PC pickup QR redemption`
- Final implementation candidate: `b5db88c17667654d8a051e623ec1c4508118983d`
- PC business path: `apps/pc/src/ConvenienceOperations.tsx`
- Browser evidence: `tests/browser/t038-pc-qr-redemption.spec.mjs`
- T022 regression alignment: `tests/browser/t022-pc-convenience-operations.spec.mjs`
- Mobile / Shared / App shell unchanged.

### Delivered behavior

- T022 既有便利店履约页新增明确“扫码核销”入口。
- Mock 扫码解析 T037 同一 `qrPayload`，命中 Shared 自提订单 `LL-1024` 与 redemption `REDEEM-LL-1024`。
- 流程为：模拟扫码 → 显示命中订单 / redemption → 确认核销 → 同一订单履约完成。
- 核销完成后再次扫码返回“不可重复核销”，不创建第二条 redemption。
- 明确标注二维码 Mock / 未接摄像头与真实扫码 SDK。
- 未增加数字码输入流程，保留给 T039。
- T022 跨端 pickup 回归已从被 V0.3 R02 淘汰的第二张 `CONV-YUNLING-8888-PICKUP` 订单，对齐为 Shared `LL-1024`。

## Review / verification

- Verify Prototype #34005128300: **success**，version / typecheck / build 全绿。
- T012 Browser Quality #34005128283: **105 passed / 8 failed（113 total）**。
  - T038 专项 **2/2 passed**。
  - T022 专项 **5/5 passed**，T037 留下的旧 pickup 跨端断言已收口。
  - 剩余 8 项均为既有 T017 / T018 / T032 checkout 基线债。
- Codex review：额度耗尽，无实质 finding。
- CodeRabbit：仅停留在 processing，无 substantive finding；0 unresolved review thread。
- Self review：未发现阻塞项；未提前施工 T039；单次扫码成功后重复扫码明确失败，复用同一 redemption override。

## Review

- Result: PASS
- Conclusion: T038 唯一交付物满足；专项 2/2、T022 5/5、Verify success，自审无阻塞项。2026-09-06 按用户授权由 Mira 自审验收；PR #37 squash merge `08a0ecac1ec2d124c35da06f005c198ecc96275e`。

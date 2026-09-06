# T038 · PC 二维码扫码核销

- Status: DOING
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

- [ ] PC 有明确“扫码核销”入口。
- [ ] Mock 扫码可解析到 T037 同一订单。
- [ ] 已失效 / 已核销二维码不可再次成功。
- [ ] 核销成功更新同一 redemption，不复制记录。
- [ ] 页面没有“真实扫码已接入”之类误导表达。
- [ ] 桌面端 browser test、typecheck、build 通过。

## Evidence required

至少覆盖：有效扫码成功、重复扫码失败 / 已完成两条自动化路径。


## Execution baseline

- Branch: `task/T038-pc-qr-redemption`
- Started from: `dev@0919fb6e342e989c9ffc702695e3d6ef595edee7`
- Frozen PC business path: `apps/pc/src/ConvenienceOperations.tsx`
- Started at: 2026-09-06

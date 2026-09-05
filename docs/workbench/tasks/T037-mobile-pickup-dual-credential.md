# T037 · Mobile 自提双凭证

- Status: TODO
- Target version: 0.3.0
- Type: Mobile / Fulfillment
- Predecessors: T034、T018
- Related PRD: R02

## Unique deliverable

在现有自提状态机上，为**同一订单**增加二维码 + 数字取货码双凭证，并完成未生效 / 可核销 / 已失效状态展示。

## Changed paths whitelist

- `apps/mobile/src/StoreFlowScreen.tsx`
- Shared 只消费 T034 导出，不在本卡修改。
- `tests/browser/t037-mobile-pickup-dual-credential.spec.mjs`
- 必要时最小更新 T018 自提 browser regression。

## Out of scope

- 不改 PC。
- 不重做订单状态机。
- 不接真实二维码生成服务。
- 不实现动态 Token / 防截屏安全。
- 不改短距配送流程。

## Acceptance

- [ ] 自提订单同时显示二维码和数字取货码。
- [ ] 备货 / 待取货 / 核销完成状态沿用 T018。
- [ ] 凭证至少可演示未生效、可核销、已失效。
- [ ] 订单详情 / 后续返回路径可再次查看同一凭证。
- [ ] 核销完成后二维码与数字码同时表现为不可再次使用。
- [ ] 原取货码信息不丢失、不生成第二个订单。
- [ ] 390×844 实屏无溢出、二维码不会挤压核心订单信息。
- [ ] T018 自提与短配回归通过。
- [ ] typecheck / build / browser test 通过。

## Evidence required

至少保存待取货双凭证和核销完成失效两个实屏状态。

# T037 · Mobile 自提双凭证

- Status: REVIEW
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


## Execution baseline

- Branch: `task/T037-mobile-pickup-dual-credential`
- Started from: `dev@5d7b36956f1cb372446c099d8efbad0614ea6f70`
- Started at: 2026-09-06


## Implementation record

- PR: #36 `feat(T037): add mobile pickup dual credentials`
- Final candidate: `f6cdb71aefdeeaeef344f697cfc885e269b3aba9`
- Business changed path: `apps/mobile/src/StoreFlowScreen.tsx`
- New browser evidence: `tests/browser/t037-mobile-pickup-dual-credential.spec.mjs`
- Shared / PC code unchanged.

### Delivered behavior

- Mobile 自提凭证对齐 T034 Shared 核心订单 `LL-1024` 与 `REDEEM-LL-1024`，不再制造第二张 pickup 订单作为凭证来源。
- 同一页面同时展示二维码 Mock + 数字取货码，两块凭证携带相同 redemptionId。
- 备货中 → `未生效`；待取货 → `可核销`；核销完成 → `已失效`。
- 核销完成后二维码与数字码同时不可再次使用。
- 返回便利店后可通过“最近自提订单”重新打开同一 `LL-1024` 凭证并保留状态。
- 短距配送仍保持原 `CONV-YUNLING-8888-DELIVERY` 路径。
- 自审发现 Mobile 临时购物车金额 / 件数不应冒充 Shared `LL-1024` 的跨端订单事实，已从 T037 履约详情移除这些临时金额展示，只保留门店 / 时段 / 凭证 / 核销状态。

## Review / verification

- Verify Prototype #34004467423: **success**，version / typecheck / build 全绿。
- T012 Browser Quality #34004467392: **102 passed / 9 failed（111 total）**。
  - T037 专项 **3/3 passed**。
  - 其中 8 项为进入 T037 前已存在的 T017 / T018 / T032 checkout 旧断言。
  - 新增 1 项 T022 失败：旧测试仍要求 Mobile 生成 `CONV-YUNLING-8888-PICKUP` 第二张 pickup 订单；V0.3 R02 已明确改为 Shared 同一订单 `LL-1024` + 同一 redemption。T037 按 Out of scope 不改 PC / T022，后续由 T038 / T039 在 PC 双通道核销施工时收口旧断言。
- Codex review：额度耗尽，无实质 review。
- CodeRabbit：仅返回 processing 状态，未给出 substantive finding；按用户授权转人工自审。
- Self review：未发现 T037 新增阻塞缺陷；Shared / PC 未改，二维码为明确 Mock，不宣称生产级防截屏 / 动态 Token。

## Review

- Result: REVIEW
- Conclusion: T037 唯一交付物满足；专项 3/3、Verify success，自审无阻塞项。按用户授权可由 Mira 自审验收并合并。

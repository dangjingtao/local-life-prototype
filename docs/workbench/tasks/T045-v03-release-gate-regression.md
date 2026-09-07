# T045 · V0.3 Release Gate 浏览器回归收口

- Status: PASS
- Target version: 0.3.0
- Type: QA / Regression / Release Gate
- Predecessors: T044、T034-T043
- Related PRD: V0.3 §12 Release Gate

## Why

T043 latest Browser Quality 为 124 / 132，仍有 8 条历史 T017 / T018 / T032 checkout 回归失败。

复核当前日志后，已确认这些失败首先命中**旧 UI 断言**：

- 仍寻找 checkout heading `云岭社区店`；
- 仍寻找旧标题 `选择履约方式并确认订单`；
- 当前已确认 UI 为 `确认订单` + 卡片内门店名 / 取餐方式 / 商品清单 / 更多选项 / 金额明细。

但 V0.3 PRD Release Gate 明确要求“相关 Browser Regression 全部通过”。因此不能继续把 8 条红灯永久记为“旧债”后直接进入最终人类验收。

## Unique deliverable

对齐 T017 / T018 / T032 回归到**当前已经验收的 T029 / T030 / T032 checkout UX 真相源**，并把 V0.3 全量 Browser Regression 收到全绿。

本卡是 Release Gate QA 收口，不重做产品 UI。

### 已知真实产品缺口

PRD 反向审查同时确认，当前便利店订单状态页仍存在消费者可见工程术语：

- `Mock order · 支付成功`
- `凭证与核销状态以 Shared 履约记录为准`

这两处不是“旧测试断言”，属于正常消费者路径的产品文案缺口。T045 必须最小清理为消费者可理解表达。

`二维码 Mock` / “当前二维码仅为界面演示”等用于明确原型能力边界的提示可以保留；禁止把生产级扫码能力伪装成已接入。

## Frozen product baseline

当前便利店 checkout 以以下消费者结构为准：

- 顶部：`确认订单`
- 门店信息卡：门店名 / 地址 / 营业状态
- 取餐方式：到店自提 / 约 3 km 短配
- 商品清单
- 更多选项：购物袋 / 订单备注
- 金额明细：商品金额、会员优惠、优惠券、履约费用、购物袋、V0.3 预计可得积分、应付金额
- 底部固定提交栏

不得把测试改回旧 UI，也不得为了让旧断言通过而恢复已淘汰标题 / 页面结构。

## Changed paths whitelist

第一阶段允许更新：

- `tests/browser/t017-mobile-convenience-cart.spec.mjs`
- `tests/browser/t018-mobile-convenience-fulfillment.spec.mjs`
- `tests/browser/t032-cart-sheet-checkout.spec.mjs`
- `apps/mobile/src/StoreFlowScreen.tsx`（**仅**清理上述已知消费者工程术语；不得借机重做订单页）

Follow-up 复验确认 Mobile checkout → Mobile order → PC Shared 同一配送订单存在金额事实不一致后，按本卡“真实产品缺陷可最小扩白名单”规则新增：

- `packages/shared/src/fixtures.ts`（**仅**把 `CONV-YUNLING-8888-DELIVERY` 的演示订单金额与当前 checkout 默认购物袋费后的最终应付对齐）
- `tests/browser/t022-pc-convenience-operations.spec.mjs`（**仅**同步同一配送订单的 Mobile / PC 金额对账断言）

允许新增一个明确命名的 V0.3 release-gate spec，用于跨卡总对账，例如：

- `tests/browser/t045-v03-release-gate.spec.mjs`

如果更新旧断言后暴露**真实产品行为缺陷**：

- 不得删除 / 降级断言把 CI 做绿；
- 必须先在本卡 Implementation record 中记录缺陷、PRD / 已确认 UX 依据和必要业务文件；
- 只有与 V0.3 Release Gate 直接相关的最小业务修复才允许扩白名单；
- 超出范围则 BLOCKED，不静默扩卡。

## Out of scope

- 不重设计 checkout。
- 不修改已确认的 T018 自提 / 短配业务规则。
- 不重做 T035 / T036 连续浏览。
- 不重做 T037-T043 功能。
- 不用 skip / fixme / 删除测试 / 降低断言质量制造“全绿”。

## Acceptance

- [ ] T017 checkout handoff 回归对齐当前 checkout 真相源并通过。
- [ ] T018 会员优惠 / 券 / 积分 / 履约费 / 应付联动回归通过。
- [ ] T018 自提流程可连续到双凭证 / 核销完成。
- [ ] T018 3 km 短配范围内 / 超范围、配送到完成回归通过。
- [ ] T018 履约切换不跨店、不混商城购物车。
- [ ] T032 商详固定底栏 + 立即购买进入当前 checkout 回归通过。
- [ ] T032 checkout 卡片分组回归通过。
- [ ] 便利店支付成功 / 自提订单正常消费者页面不再出现 `Mock order`、`Shared`、`fixture` 等工程术语；二维码原型能力边界提示除外。
- [ ] T034 `validateDemoFixtureRelations()` 返回 `[]`。
- [ ] T034-T044 专项回归全部通过。
- [ ] Mobile 390×844 主链无横向溢出、底部 fixed UI 不遮挡核心 CTA。
- [ ] PC T038/T039 核销在 1024 / 1440 桌面视口仍通过。
- [ ] `npm run typecheck` / `npm run build` 通过。
- [ ] **全量 Browser Quality 0 failed**；不得再保留“已知 8 个 checkout 旧债”。

## Evidence required

- latest-head Verify run；
- latest-head Browser Quality run，必须明确记录 total / passed / failed，并要求 failed = 0；
- T034 relation `[]`；
- Mobile 390×844 主链实屏证据；
- PC 核销桌面端证据；
- 如本卡发现真实产品缺陷，必须单独记录“旧测试偏差”与“真实缺陷”两类，不能混写。
- 至少新增一条正常消费者订单状态页术语扫描，防止 `Mock order` / `Shared` 回归。

## Stop conditions

- 任何一条失败若无法证明是过时断言，必须按真实缺陷处理。
- 如果需要改变已确认产品规则 / UX 才能通过测试，停止施工并回到产品决策。


## Implementation record · 2026-09-07

- 旧测试偏差：T017 / T018 / T032 仍断言已淘汰的 checkout 标题、旧门店 heading、旧提交按钮、旧订单号 / 取货码和旧配送状态文案；已按 T029 / T030 / T032 与 V0.3 当前实现对齐。
- 真实产品缺陷：T032 卡片化 checkout 重构后，T018 已验收的“积分抵现”交互控件被遗漏，但 `usePoints` / `pointsDiscount` 计算状态仍存在。依据 T018 PASS 语义、T040“不得重做现有积分抵现”以及本卡 AC，按最小改动把积分抵现控件恢复到“金额明细”，不改变积分候选比例。
- 消费者文案缺陷：自提 / 短配订单状态页的 `Mock order` 与 `Shared` 工程术语已改为消费者可理解表达；二维码 Mock 的原型能力边界保留。
- 当前改动仅触及本卡白名单业务 / 测试文件；等待 PR latest-head Verify / Browser Quality 真实结果后再决定是否进入 REVIEW。


## Final review · 2026-09-07（首轮，后被 follow-up 重开）

- Self-review: PASS；未发现改变已确认 checkout / 自提 / 短配业务规则的越界改动。
- Verify Prototype #34070001125：success；version contract、Mobile / PC typecheck、build 全部通过。
- Browser Quality #34070001122：132 / 132 passed，0 failed。
- T034 relation gate：`fixture relations remain valid...` 在同一 latest implementation head 通过，断言为 `expect(data.issues).toEqual([])`。
- T017 / T018 / T032 的 8 条历史 checkout 红灯已消除；没有通过 skip / fixme / 删除测试制造全绿。
- 真实缺陷“便利店积分抵现控件遗漏”已恢复，并由 T018 金额联动回归验证；Candidate 比例仍明确标注为候选示例。
- 自提 / 短配订单正常消费者路径新增工程术语扫描；`Mock order` / `Shared` / `fixture` 不再暴露，二维码 Mock 原型边界保留。
- CodeRabbit 在上述实现 head 上仍为 processing，未返回 actionable finding；依据用户既有授权执行 Mira 自审收口。最终合并前仍以 PR latest-head CI 为硬门禁。


## Follow-up review · 2026-09-07

- 自动审查指出一个低严重度但真实的金额一致性缺口：checkout 的默认购物袋 ¥0.50 已计入页面“应付”，但原订单 snapshot 只保存不含购物袋的 `payable`，导致配送订单状态页比结算页少 ¥0.50。
- 该问题直接违反本卡“应付联动 / 订单流程一致性”的 Release Gate 目标，因此不作为 out-of-scope 旧债放过。
- 最小修复：snapshot 新增 `bagFee`，保存 `checkoutTotal` 为最终 payable；配送完成金额明细同步展示购物袋费用。
- 同时恢复配送订单 ID 的精确断言 `CONV-YUNLING-8888-DELIVERY`，避免相较旧测试降低识别强度。
- 前述 132/132 证据仅证明上一 implementation head；本卡重新进入 DOING，必须等待本 follow-up latest-head Verify / Browser Quality 全绿后才能再次 PASS。


## Follow-up Browser finding · 2026-09-07

- Browser Quality #34070408321：131 / 132 passed，唯一失败为 T022 跨端配送订单金额仍断言 Mobile / PC `¥31.60`。
- 失败不是新 Mobile 修复回归：Mobile 现在正确显示含默认购物袋费的 `¥32.10`；真正未同步的是 Shared 中同一订单 `CONV-YUNLING-8888-DELIVERY` 仍为 `amountYuan: 31.6`，PC 因此继续展示 `¥31.60`。
- 该订单在 Mobile 与 PC 使用同一 order id，属于 Release Gate 的跨端单一事实，不能允许两端金额分叉。
- 处理：先扩白名单，再把 Shared 该订单金额最小调整为 `32.1`，并把 T022 双端断言同时锁定为 `¥32.10`；不改变商品、优惠、配送费或购物袋业务规则。


## Release Gate closeout · 2026-09-07

- Final implementation head: `ad3dbc493dc7703915c264fb749881f051eed793`。
- Verify Prototype #34070641100：success；version contract、Mobile / PC typecheck、build 全部通过。
- Browser Quality #34070641068：**132 / 132 passed，0 failed**。
- T034 relation gate 在同一全量 Browser 中通过；其断言为 `expect(data.issues).toEqual([])`，因此 relation = `[]`。
- T022 Mobile / PC 同一配送订单 `CONV-YUNLING-8888-DELIVERY` 已统一为 `¥32.10`；默认购物袋 ¥0.50 进入 Mobile checkout、订单 snapshot、配送完成金额明细和 Shared / PC 同一订单金额。
- 配送订单 ID 仍为精确断言，未通过降低测试强度制造全绿。
- CodeRabbit 在旧 follow-up head 指出的唯一 actionable（T022 仍期待 `¥31.60`）已由 `ad3dbc4` 修复；latest Browser 全绿验证该问题已闭环。
- Experimental OpenCode 最新一次 workflow 因 runner `spawnSync opencode E2BIG` 失败，属于审查基础设施失败，不是产品 / 代码失败；T014 本就不阻塞版本。
- Mira 最终自审：未发现剩余 Release Gate 阻塞项。T045 → PASS；T046 可重新解锁给用户做人类产品 / 视觉最终验收。

# T045 · V0.3 Release Gate 浏览器回归收口

- Status: DOING
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

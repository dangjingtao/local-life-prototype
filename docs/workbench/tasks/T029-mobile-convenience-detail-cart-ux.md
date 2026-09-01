# T029 · Mobile 便利店商详、购物车与链路收口 UX 返工

- Status: TODO
- Target version: 0.2.0
- Impact: Mobile / UX
- Owner: -

## Background

当前便利店商品详情仍以大面积分类占位视觉和“门店可售上下文”解释卡为核心；购物车虽然功能完整，但与浏览页之间的入口、legacy 自提兼容入口和 T018 checkout 形成多套并存路径。内部 UX 复审认为这会让用户理解成本高于正常即时零售产品。

## Goal

把“商品详情 → 加购 → 购物车 → 去结算”收成一条清晰、连续、消费者可理解的购买链路，同时保留已经验收的独立购物车与 T018 履约语义。

## Product facts

- 当前门店决定商品价格、会员价、库存与促销状态。
- 一个门店一个便利店购物车；不同门店不混单。
- T018 已确认购物车之后进入自提 / 约 3 km 短配 checkout；本卡不重新定义 checkout 业务规则。
- V0.1 legacy 自提深流程仍有历史回归价值，但不应在正常 V0.2 消费者路径里形成第二套购买入口。

## Scope

- 重构商品详情信息层级：主图区域 → 商品名 / 规格 → 价格 / 会员价 / 促销标签 → 商品描述 → 门店信息（退到辅助层级）；第一视觉层级是商品本身而非门店模型或分类占位。
- 去除"门店可售上下文""CONVENIENCE"等原型解释型主视觉，换店行为保留但不抢占商品主体。
- 商详底部固定操作栏：加购数量控件 + 加入购物车 + 立即购买，与浏览页购物栏视觉语言一致。
- 浏览页与商详页都持续提供一致的购物车反馈 / 入口；加减数量后的反馈不依赖返回上一页确认。
- **弹层购物车**：点击底部购物栏从底部滑出半屏抽屉（Sheet），展示商品清单、数量控制、全选 / 清空、库存紧张提示（如"仅剩2件"）、合计金额与"去结算"主 CTA；用户无需离开商品浏览页即可确认购物车内容。
- 弹层购物车与独立购物车页并存：弹层用于快速查看 / 调整，"去结算"按钮统一进入 T018 checkout 流程；购物车页仍可通过弹层"查看完整购物车"或其他入口访问。
- 重构购物车页为紧凑清晰的商品清单、数量控制、删除、金额摘要与唯一主 CTA"去结算"。
- **结算页卡片式分组**：自提点信息 → 联系人 / 手机号 → 取餐方式（自提 / 短配切换，大按钮二选一）→ 商品清单 → 金额明细（商品金额 / 配送费 / 优惠券 / 小计），每组有明确的卡片边界和视觉层级。
- 结算页补充便利店高频辅助选项：购物袋开关、订单备注、号码保护等。
- 移除正常 V0.2 路径中与购物车 / checkout 并列的 `选择此门店自提` legacy CTA，避免双入口。
- 如果 T004 / T012 仍需回归 legacy 自提流程，将兼容入口迁移到显式 demo / compatibility 触发方式，不得继续暴露给普通 V0.2 用户。
- 保证从浏览、商详、购物车进入 T018 checkout 时仍只携带当前门店购物车，不跨店、不混商城。
- 配色完全使用现有 Com Design 设计系统 token，不引入第三方品牌色或品牌视觉元素。

## Out of scope

- 修改 T018 checkout、自提时段、配送地址、配送范围、优惠计算与订单状态语义。
- 重做 T018 checkout 页面视觉；仅保证 handoff 和入口不被破坏。
- 修改商城购物车、智慧抗衰或 PC 后台。
- 删除历史 V0.1 回归能力本身。

## Acceptance

- [ ] 商品详情第一视觉层级是商品本身，而不是分类占位、工程术语或门店模型解释。
- [ ] 商详清晰显示当前门店的价格 / 会员价、规格、促销、可售状态，并能直接加减数量。
- [ ] 商详底部有固定操作栏（加购数量 + 加入购物车 + 立即购买），与浏览页购物栏视觉语言一致。
- [ ] 浏览与商详任意位置均能明确看到 / 进入当前门店购物车。
- [ ] 点击底部购物栏可唤起弹层购物车（半屏 Sheet），展开 / 收起交互流畅；弹层内可查看商品清单、调整数量、全选 / 清空。
- [ ] 弹层购物车内库存紧张商品有"仅剩 N 件"等醒目标识，视觉上区别于正常库存商品。
- [ ] 弹层购物车内加减数量后，底部购物栏金额和数量同步更新，无延迟或错位。
- [ ] 弹层购物车的"去结算"直接进入 T018 checkout，与独立购物车页的结算行为一致。
- [ ] 购物车页以商品清单、数量、单价 / 小计、合计和"去结算"为核心，没有大段业务规则解释抢占主层级。
- [ ] 结算页采用卡片式分组（自提点 / 联系人 / 取餐方式 / 商品 / 金额明细），每组边界清晰，用户从上往下扫描能快速定位信息。
- [ ] 结算页取餐方式（自提 / 短配）使用大按钮二选一切换，状态明确。
- [ ] 结算页包含购物袋开关、订单备注等便利店高频辅助选项。
- [ ] 正常 V0.2 用户路径只存在一条购买主链：商品 → 购物车（弹层或独立页）→ 去结算；不再出现并列 legacy 自提 CTA。
- [ ] legacy V0.1 自提回归仍可通过显式 compatibility / demo 入口验证，T012 不因 UX 收口失去历史回归能力。
- [ ] 切店后不会把别店购物车带入当前结算；商城购物车继续独立。
- [ ] 配色完全使用现有 Com Design 设计系统 token，不引入第三方品牌色或品牌视觉元素。
- [ ] 390 × 844 Chromium 截图 / 浏览器走查通过，无横向溢出、底部操作与一级导航无遮挡。
- [ ] `npm run typecheck`、`npm run build`、T012 / T017 / T018 相关 Playwright 回归通过。

## Risks / Dependencies

- 前置：T027、T028。
- 当前 legacy 与 V0.2 流程共处 `StoreFlowScreen.tsx`，迁移 compatibility 入口时必须先确认 T004 / T012 的真实测试依赖，不能简单删除旧逻辑。
- 不允许为了视觉简化而破坏 `sessionStorage` 独立购物车、当前门店价格或 T018 order snapshot。

## Dispatch Context

- Repo: `dangjingtao/local-life-prototype`
- Base when dispatched: `dev @ 624991a32a6228a4b969825165177fbd7df2c658`，实际施工前必须同步已合入 T027 / T028 的最新 `dev`
- Suggested branch: `task/T029-convenience-detail-cart-ux`
- Must Read: `AGENTS.md`、T004、T012、T017、T018、T027、T028、`docs/workbench/00-work-ledger.md`
- Execution entry points: `apps/mobile/src/StoreFlowScreen.tsx`、`tests/browser/t012-mobile-pickup.spec.mjs`（以仓库实际文件为准）、`tests/browser/t017-mobile-convenience-cart.spec.mjs`、T018 相关 browser tests
- Hard constraints: legacy 能力可迁移但不可静默删除；T018 业务语义冻结；便利店与商城购物车不得合并；不扩张到 checkout 规则重做。
- Unknown / Human Decision: None。若 legacy 兼容入口的最佳触发方式存在多个等价方案，优先使用 Prototype Runtime / 显式 demo query，不在正常 UI 暴露第二 CTA。

## Implementation record

- Commit / PR:
- Changed paths:
- Notes:

## Verification evidence

- CI:
- Page / Route: Mobile `便利店` → 商品详情 → 购物车 → checkout handoff
- Screenshot / Browser result:
- Other evidence:

## Review

- Reviewer:
- Result: REVIEW / PASS / BLOCKED
- Conclusion:
- Follow-up: 完成后进入 T030 UX 复审；不得仅凭 CI 绿灯把 T017 恢复 PASS。

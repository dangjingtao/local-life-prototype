# Prototype Work Ledger

> 统一记录产品决策、施工、评审和验证。路由存在不等于产品闭环存在；页面能看不等于业务已确认；CI 通过不等于产品验收通过。

## 当前基线

- V0.1 Product Brief：`docs/product/00-product-brief.md`
- V0.2 PRD / IA / 功能地图：`docs/product/01-v0.2-prd.md`
- AI Skills：`docs/ai/skills.md`
- Daily Report Skill：`docs/ai/skills/daily-report.md`
- 日报目录：`docs/reports/daily/`
- 当前已验收版本基线：`0.1.0`
- V0.2 施工目标版本：`0.2.0`
- 默认施工分支：`dev`
- 验收 / 发布分支：`prod`
- 业务项目不使用 `main` 作为工作分支
- 2026-08-31 验收前完整历史台账：`docs/workbench/archive/00-work-ledger-before-2026-08-31-acceptance.md`

## 默认规则

1. 可执行工作使用稳定编号，如 `T001`；编号创建后永久保留，不复用。
2. 简单、低风险任务可以只在总台账记录；跨端、多步骤、产品决策、明显风险 / 依赖或独立验收工作必须创建独立任务卡。
3. 默认状态流：`TODO → DOING → REVIEW → PASS`；任意执行态可进入 `BLOCKED`，取消使用 `CANCELLED`。
4. AI 可以推进到 `REVIEW`；除非用户明确授权验收，否则不得自行改成 `PASS`。
5. 每次状态变化至少留一个可追踪证据：commit / PR / 页面路径 / 浏览器证据 / CI run / 明确评审结论之一。
6. 产品事实变化时同步更新 Product Brief / PRD / 决策记录 / 任务卡中的至少一个真相源。
7. CI 通过、代码合并、页面存在都不单独等于产品验收通过。
8. 历史结论不得静默删除；主台账过长时允许原样归档，并在当前台账留下可追踪路径。
9. V0.2 为中高保真产品型原型；不得把明确排除的真实支付、真实配送接口、外部商城 API、真实 AI 检测算法等偷偷塞入任务卡。
10. 已通过功能验收的任务如果后续视觉 / UX 复审失败，应保留原功能证据并重新打开为 `REVIEW`，使用返工子卡收口；不得用旧 PASS 覆盖新的明确评审结论。

## 总状态

| 卡片 | 主题 | 类型 | 状态 | 目标版本 | 前置 | 证据 / 结果 |
| --- | --- | --- | --- | --- | --- | --- |
| T001 | 本地生活 V0.1 概念原型 | 产品 / 施工 | PASS | 0.1.0 | Product Brief、AI Skill Profile | 2026-08-31 用户明确确认 V0.1 完结；V0.1 作为 V0.2 已验收基线 |
| T002 | 共享领域模型与演示数据 | Shared | PASS | 0.1.0 | T001 | `6cf267c`；Verify Prototype #2 success |
| T003 | Mobile 登录、首页与统一账号入口 | Mobile | PASS | 0.1.0 | T002 | `1e35cec`；用户验收通过 |
| T004 | Mobile 线下门店自提闭环 | Mobile | PASS | 0.1.0 | T002、T003 | `7946292`；用户验收通过 |
| T005 | Mobile 线上商城一件代发闭环 | Mobile | PASS | 0.1.0 | T002、T003 | PR #6；`dfb7288`；用户验收通过 |
| T006 | Mobile 智慧抗衰体验闭环 | Mobile | PASS | 0.1.0 | T002、T003 | PR #7 merge `bdb4c6c`；用户验收通过 |
| T007 | Mobile 会员、积分与权益中心 | Mobile | PASS | 0.1.0 | T002、T003 | PR #8 merge `3dca4ef`；用户验收通过 |
| T008 | PC 工作台框架、角色与权限 | PC | PASS | 0.1.0 | T002 | `c1cb8d5`；用户验收通过 |
| T009 | PC 店主与合作商工作台 | PC | PASS | 0.1.0 | T002、T008 | `47dcafe`；用户验收通过 |
| T010 | PC 平台运营中台 | PC | PASS | 0.1.0 | T002、T008 | `5c07411` + `bdc9662`；用户验收通过 |
| T011 | PC 数据驾驶舱 | PC | PASS | 0.1.0 | T002、T008 | PR #3 merge `8b068c5`；用户验收通过 |
| T012 | 关键状态、可访问性与原型质量 | QA / Shared | PASS | 0.1.0 | T003-T011 | PR #9 merge `5ddd6c6`；Verify #119、Browser Quality #9、OpenCode #47 success |
| T013 | 跨端演示串联与 V0.1 验收准备 | Review / Docs | CANCELLED | 0.1.0 | T002-T012 | 被 2026-08-31 用户直接总体验收取代；不属于失败或 V0.2 阻塞 |
| T014 | 实验性 PR AI Review | CI / Review | REVIEW | 0.1.0 | GitHub Actions、`OPENCODE_API_KEY` | 独立实验性 Review，不阻塞产品版本 |
| T015 | V0.2 共享领域模型与 Mock Fixtures | Shared | PASS | 0.2.0 | V0.2 PRD | PR #10 已合入 `dev`；Verify #151、Browser Quality #10、关系校验通过；2026-09-01 用户授权按台账证据验收 |
| T016 | Mobile 运营首页、一级 IA 与全局搜索 | Mobile | PASS | 0.2.0 | T015 | PR #11 已合入 `dev`；Verify #172、Browser Quality #31、Codex 返工闭环；2026-09-01 用户授权按台账证据验收 |
| T017 | Mobile 便利店门店页、商品浏览与独立购物车 | Mobile | REVIEW | 0.2.0 | T015、T016 | 原 PR #12 / CI / AI Review 功能证据保留；2026-09-01 内部 UX 复审 `CHANGES_NEEDED`，拆 T027-T030 返工后再恢复 PASS |
| T018 | Mobile 便利店结算、自提与 3 公里短距配送 | Mobile | PASS | 0.2.0 | T017（业务语义） | `8c9b8cb` + `d97eb53` 已进入 `dev`；`80d93a2` 记录验收；`npm run verify` success；Playwright 390px 全量 41 项 success；本轮仅消费侧 UX 返工，不回滚 T018 业务语义 |
| T019 | Mobile 线上商城中高保真购买闭环 | Mobile | REVIEW | 0.2.0 | T015、T016 | 原 PR #13 / CI / AI Review 功能证据保留；2026-09-02 用户视觉验收不通过，按确认五屏 UI 稿拆 T019-R1～R5；仅颜色改用项目 token，其余交互 / 布局严格返工 |
| T020 | Mobile 智慧抗衰项目、预约与二维码核销 | Mobile | PASS | 0.2.0 | T015、T016 | PR #14 merge `3297f1c`；`a2f68b1` 记录验收；`npm run verify` success；Playwright 390px 全量 45 项通过（T020 专项 4 项）；7 项验收标准全部满足 |
| T021 | Mobile 智慧抗衰检测报告、转化与历史对比 | Mobile | PASS | 0.2.0 | T015、T020 | `6adfc0d` 记录验收；8 项标准全部满足；假按钮与返回导航问题已修复回归；typecheck / build / 全量 40 浏览器用例通过 |
| T022 | PC 便利店订单、履约与核销后台 | PC | TODO | 0.2.0 | T015、T018 | 自提 / 短配订单、核销、门店可售关系、履约配置 mock |
| T023 | PC 智慧抗衰预约、核销与报告运营后台 | PC | TODO | 0.2.0 | T015、T020、T021 | 项目 / 时段 / 预约 / 核销 / 报告 / 转化配置 |
| T024 | PC 商城渠道、活动与搜索运营后台 | PC | TODO | 0.2.0 | T015、T016、T019 业务语义 | Storefront / Channel、商城订单、活动 / 推荐位、搜索关联；T019 视觉 reopen 不回滚已确认商城业务模型 |
| T025 | PC V0.2 数据驾驶舱升级 | PC / Data | TODO | 0.2.0 | T015、T022-T024 | 自提 / 短配 / 商城 / 预约 / 核销 / 转化的增量数据视角 |
| T026 | V0.2 跨端串联、中高保真质量与验收准备 | QA / Shared | TODO | 0.2.0 | T016-T025、T030、T019-R5 | 三主流程跨端对账、390/1024/1440 浏览器质量、PRD AC 对账；便利店需 T030 UX PASS，商城需 T019-R5 Visual PASS |
| T027 | Mobile 便利店选店与门店上下文 UX 返工 | Mobile / UX | REVIEW | 0.2.0 | T017、T018 业务语义 | PR #15 merge `fd1631c9b425ad68c0e54c8072e8dc1fd84dab87`；final head `ee7969b`：Verify #217、Browser #60、OpenCode #81 success / `NO_BLOCKING_FINDINGS`；Codex P1 已修复并 resolve；T028 可接续 |
| T028 | Mobile 便利店商品浏览与零售密度 UX 返工 | Mobile / UX | DOING | 0.2.0 | T027 | PR #16 已 merge `c77c637052769fa1ba92fe34ad2ccea93a001a39`；当前 follow-up PR #17 head `8e993f72d09afdc95eb2f354ebf2f2db4ab55af8`，Verify / Review / Publish success，但 Browser Quality failure；分类滚动坐标 P1 仍需修复 |
| T029 | Mobile 便利店商详、购物车与链路收口 UX 返工 | Mobile / UX | TODO | 0.2.0 | T027、T028 | 商详信息层级、购物车收口、唯一购买主链、legacy 自提兼容入口迁出正常路径 |
| T030 | Mobile 便利店 UX 复审与验收 | UX / QA | TODO | 0.2.0 | T027-T029 | 390×844 实屏复审、内部术语扫描、门店连续性 / 购物栏 / 唯一购买主链、T012/T017/T018 回归；UX PASS 后恢复 T017 PASS |
| T019-R1 | 商城首页视觉返工 | Mobile / UX | TODO | 0.2.0 | T019 功能基线 | 严格按确认稿：首页头部 / 来源 / 搜索 / 分类 / Banner / 双列推荐 / 包邮条；颜色只用现有 token |
| T019-R2 | 商城商品详情视觉返工 | Mobile / UX | TODO | 0.2.0 | T019-R1 | 大商品图、标题价格、规格促销、配送优惠、固定加购 / 购买栏；保持搜索 handoff / cart 逻辑 |
| T019-R3 | 商城购物车视觉返工 | Mobile / UX | TODO | 0.2.0 | T019-R2 | 128px 商品行、82×82 缩略图、数量控制、金额汇总、固定结算栏；不新增部分选择结算业务 |
| T019-R4 | 商城结算确认与订单物流视觉返工 | Mobile / UX | TODO | 0.2.0 | T019-R3 | 地址 / 来源 / 商品 / 金额 / 提交；状态 Hero / 三段物流 / 时间线 / 订单信息；移除消费者界面工程说明 |
| T019-R5 | 商城视觉复审与验收 | UX / QA | TODO | 0.2.0 | T019-R1-R4 | 五屏 390×844 实屏对照 `docs/design/t019-mall-ui-baseline.md`；颜色只验 token，布局关键块 ±4px；PASS 后恢复 T019 PASS |

## V0.1 收口记录

- T002-T012 已全部 `PASS`。
- 2026-08-31 用户明确确认 V0.1 完结；据此 T001 记录为 `PASS`。
- T013 原本只是 V0.1 总体验收前的准备卡。由于用户已直接完成总体验收，该卡记录为 `CANCELLED`，避免把未单独执行的准备工作伪装为已完成。
- T014 继续作为实验性 PR AI Review 独立观察，不阻塞 V0.2。

## V0.2 当前进度

- Wave 0-2 的业务 / 功能施工已完成；T015、T016、T018、T020、T021 保持 `PASS`。
- T017 因 2026-09-01 内部 UX 复审 `CHANGES_NEEDED` 重开为 `REVIEW`；T027-T030 负责便利店消费侧 UX 返工与独立复审。
- T019 因 2026-09-02 用户视觉验收不通过重开为 `REVIEW`；旧 PR #13 的功能闭环 / CI / AI Review 证据保留，但不再代表当前中高保真视觉通过。新增 T019-R1～R5，视觉合同为 `docs/design/t019-mall-ui-baseline.md`。
- T027 已完成施工、review gate 并合入 `dev`；T028 的原 PR #16 已 merge，当前 follow-up PR #17 仍在处理分类滚动 P1 与 Browser Quality failure。T028 → T029 → T030 继续串行。
- 商城返工默认 T019-R1 → R2 → R3 → R4 → R5 串行，避免当前 `MallFlowScreen.tsx` 产生文件 / 视觉竞态。
- Wave 3 PC 后台 T022、T023、T024 的业务前置仍已满足，可与两条 Mobile UX 返工 lane 并行施工；T024 继续消费 T019 已确认业务模型，不等待商城视觉完成。
- T025 必须等待 T022-T024 的 PC 业务语义稳定后施工。
- T026 现在有两个人工体验 gate：便利店 T030 与商城 T019-R5；任一未 PASS 时，不得宣称 V0.2 Mobile 中高保真整体完成。

## V0.2 派卡原则

本轮只派当前原型工程能够真实完成和验证的工作：

- 做：共享 mock、Mobile 中高保真页面与完整交互、PC 对应后台、跨端一致性、浏览器验证。
- 不做：真实支付、真实库存、真实地图 / 骑手调度、真实物流、抖音等外部商城 API、真实检测硬件、真实 AI 检测 / 护理算法、生产级 BI / CMS / 搜索索引。
- 业务未决规则只用可追踪 mock，不作为正式事实固化。
- 已确认视觉稿进入返工合同后，施工 Agent 不得重新设计；除明确允许的 token 替换外，以任务卡 / 视觉基准约束交互、模块顺序与关键几何。

## V0.2 施工波次

### Wave 0 · 地基 — PASS

1. T015 共享领域模型与 Mock Fixtures。
2. T016 Mobile 一级 IA、运营首页与全局搜索。

### Wave 1 · 三大 Mobile 业务域

- T017 便利店浏览 / 独立购物车 — `REVIEW`（UX reopen）。
- T019 线上商城购买闭环 — `REVIEW`（Visual reopen；原功能验收历史保留）。
- T020 智慧抗衰预约 / 核销 — `PASS`。

### Wave 2 · 深层流程 — PASS

- T018 便利店自提 / 短配。
- T021 智慧抗衰报告 / 历史对比。

### Wave 2.5 · 便利店 UX 返工 — IN PROGRESS

1. T027 选店与门店上下文 — `REVIEW`，PR #15 已合入 `dev`。
2. T028 商品浏览与零售密度 — `DOING`，当前 follow-up PR #17 有 Browser Quality / 分类滚动阻塞。
3. T029 商详、购物车与购买链路收口 — `TODO`。
4. T030 独立 UX 复审 — `TODO`；通过后恢复 T017 PASS。

### Wave 2.6 · 商城 Visual 返工 — TODO

统一视觉基准：`docs/design/t019-mall-ui-baseline.md`。

1. T019-R1 商城首页视觉返工。
2. T019-R2 商品详情视觉返工。
3. T019-R3 商城购物车视觉返工。
4. T019-R4 结算确认与订单物流视觉返工。
5. T019-R5 独立视觉复审；通过后恢复 T019 PASS。

R1-R4 不重新定义功能；颜色以现有 Design Token 为唯一例外，其余交互、模块顺序、关键宽高布局按确认稿执行。

### Wave 3 · PC 后台并行 — NEXT

- T022 便利店后台。
- T023 智慧抗衰后台。
- T024 商城渠道 / 活动 / 搜索运营后台。

三张 PC 卡可与 Wave 2.5 / 2.6 作为不同 lane 并行；必须继续消费已确认 Shared / T018 / T019 业务语义。

### Wave 4 · 数据与总验收

1. T025 数据驾驶舱增量。
2. T026 跨端串联、中高保真质量与 V0.2 验收准备；前置包含 T030 UX PASS 与 T019-R5 Visual PASS。

## 历史记录

2026-08-27 至 2026-08-31 的 V0.1 逐项施工、返工、CI、OpenCode / Codex Review 与状态变更仍保留在各任务卡和：

`docs/workbench/archive/00-work-ledger-before-2026-08-31-acceptance.md`

## 下一步

1. 便利店 lane：修复 T028 PR #17 的分类滚动 P1 / Browser Quality，随后 T029 → T030。
2. 商城 lane：按确认稿从 T019-R1 开始，严格串行 R1 → R2 → R3 → R4 → R5；R5 未 PASS 前 T019 保持 REVIEW。
3. T022 / T023 / T024 可与两条 Mobile UX lane 并行推进；不得因为视觉 reopen 回滚已确认的 T018 / T019 / Shared 业务事实。
4. T022-T024 稳定后进入 T025；T025、T030、T019-R5 全部完成后再执行 T026 总体跨端验收准备。

# Prototype Work Ledger

> 统一记录产品决策、施工、评审和验证。路由存在不等于产品闭环存在；页面能看不等于业务已确认；CI 通过不等于产品验收通过。

## 当前基线

- V0.1 Product Brief：`docs/product/00-product-brief.md`
- V0.2 PRD / IA / 功能地图：`docs/product/01-v0.2-prd.md`
- V0.3 PRD / 设计基线：`docs/product/02-v0.3-prd.md`
- AI Skills：`docs/ai/skills.md`
- Daily Report Skill：`docs/ai/skills/daily-report.md`
- 日报目录：`docs/reports/daily/`
- 当前已验收版本基线：`0.1.0`
- V0.2 施工目标版本：`0.2.0`
- V0.3 已完成设计与派卡，目标版本：`0.3.0`；不得绕过 V0.2 未稳定前置
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
9. V0.2 / V0.3 均为中高保真产品型原型；不得把明确排除的真实支付、真实配送接口、外部商城 API、真实 AI 检测算法等偷偷塞入任务卡。
10. V0.3 T034-T043 使用“唯一交付物 + Changed paths 白名单 + Out of scope + AC + Evidence”硬边界；超出卡片范围必须先回写卡片 / 台账，不得静默扩卡。

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
| T017 | Mobile 便利店门店页、商品浏览与独立购物车 | Mobile | PASS | 0.2.0 | T015、T016 | T030 逐屏 UX 复审通过后恢复 PASS；便利店主链选店→浏览→商详→购物车→结算收口；T027/T028/T029/T031/T032 全部验收通过；46/46 Playwright 回归通过 |
| T018 | Mobile 便利店结算、自提与 3 公里短距配送 | Mobile | PASS | 0.2.0 | T017（业务语义） | `8c9b8cb` + `d97eb53` 已进入 `dev`；`80d93a2` 记录验收；`npm run verify` success；Playwright 390px 全量 41 项 success；本轮仅消费侧 UX 返工，不回滚 T018 业务语义 |
| T019 | Mobile 线上商城中高保真购买闭环 | Mobile / UX | REVIEW | 0.2.0 | T015、T016 | 原 PR #13 / CI / 2026-08-31 验收证据保留；2026-09-02 用户视觉验收重开。R1-R4 已整合；R5 PR #26 完成五屏 390×844 独立视觉复审，首轮发现并修复订单进度横向溢出；最终 artifact `9855267147` 五屏齐全，R5 结论 `PASS FOR HUMAN / REVIEW`。父卡等待用户最终视觉确认，不自行恢复 PASS |
| T020 | Mobile 智慧抗衰项目、预约与二维码核销 | Mobile | PASS | 0.2.0 | T015、T016 | PR #14 merge `3297f1c`；`a2f68b1` 记录验收；`npm run verify` success；Playwright 390px 全量 45 项通过（T020 专项 4 项）；7 项验收标准全部满足 |
| T021 | Mobile 智慧抗衰检测报告、转化与历史对比 | Mobile | PASS | 0.2.0 | T015、T020 | `6adfc0d` 记录验收；8 项标准全部满足；假按钮与返回导航问题已修复回归；typecheck / build / 全量 40 浏览器用例通过 |
| T022 | PC 便利店订单、履约与核销后台 | PC | PASS | 0.2.0 | T015、T018 | PR #33 merged；人工自审 PASS；Verify success；T022 Browser 5/5；全量仅保留既有 T017/T018/T032 checkout 基线债 |
| T023 | PC 智慧抗衰预约、核销与报告运营后台 | PC | PASS | 0.2.0 | T015、T020、T021 | 用户 2026-09-06 验收通过；PR #34；Verify #33976018543 success；Browser #33976018600：T023 7/7、全量 89/97，8 项均为既有 T017/T018/T032 基线债；Codex 2×P2 已修复并 resolve；人工自审无阻塞项 |
| T024 | PC 商城渠道、活动与搜索运营后台 | PC | PASS | 0.2.0 | T015、T016、T019 | 2026-09-06 用户验收并授权合并；PR #35 squash merge `1309260`；Verify #34002301123 success；Browser #34002301128：T024 6/6、全量 95/103，8 项均为既有 T017/T018/T032 基线债；CodeRabbit 1×Minor 已修复并 resolve；人工自审无阻塞项 |
| T025 | PC V0.2 数据驾驶舱升级 | PC / Data | TODO | 0.2.0 | T015、T022-T024 | 自提 / 短配 / 商城 / 预约 / 核销 / 转化的增量数据视角 |
| T026 | V0.2 跨端串联、中高保真质量与验收准备 | QA / Shared | TODO | 0.2.0 | T016-T025、T030 | 三主流程跨端对账、390/1024/1440 浏览器质量、PRD AC 对账；便利店中高保真必须引用 T030 UX PASS |
| T027 | Mobile 便利店选店与门店上下文 UX 返工 | Mobile / UX | PASS | 0.2.0 | T017、T018 业务语义 | T030 UX 复审确认 PASS；门店连续性、关闭门店表达、切店购物车隔离、全局搜索 handoff 均通过；正常消费者路径无工程术语 |
| T028 | Mobile 便利店商品浏览与零售密度 UX 返工 | Mobile / UX | PASS | 0.2.0 | T027 | PR #16 已 merge（`c77c637`）；核心 scope 后由 T031 以更高标准完成并验收：双栏分类、紧凑商品行、悬浮购物栏、可用券入口、单品/套餐双态 |
| T029 | Mobile 便利店商详、购物车与链路收口 UX 返工 | Mobile / UX | PASS | 0.2.0 | T027、T028 | 商详固定操作栏、弹层购物车、独立购物车、卡片式结算与 legacy compatibility 入口迁移完成；T012/T017/T031/T032 回归通过 |
| T030 | Mobile 便利店 UX 复审与验收 | UX / QA | PASS | 0.2.0 | T027-T029 | 390×844 逐屏 UX 复审 PASS；选店/浏览/商详/弹层购物车/独立购物车/结算全链通过；术语扫描通过；46/46 Playwright；T017 同步恢复 PASS |
| T031 | Mobile 便利店双栏分类与零售密度升级 | Mobile / UX | PASS | 0.2.0 | T028 | 左侧固定分类 + 紧凑商品行 + 单品/套餐双态 + 悬浮购物栏；390×844；T031 专项 9/9 + T017 回归 8/8；任务卡验收 PASS |
| T032 | Mobile 便利店弹层购物车与结算页分组 | Mobile / UX | PASS | 0.2.0 | T031 | 弹层购物车、商详固定操作栏、5 组卡片式结算完成；Playwright 28/28、390×844 无横向溢出；任务卡 Status 为 PASS（Review 区仍保留未清理模板） |
| T033 | Mobile 顶栏、首页搜索与商城语义收口 | Mobile / UX / QA | REVIEW | 0.2.0 | T016、T019 | PR #27 已 merge；PR #28 已于 2026-09-03 merge `fec30c6`，删除消费者侧店铺 / 来源 / 切换心智，并同步 PRD / T019 真相源；任务卡仍为 REVIEW，等待最终视觉确认 |
| T034 | V0.3 Shared 合同与 Mock | Shared / Product | PASS | 0.3.0 | T015、T031、T018 | PR #30 squash merge `18ea9e8`；Codex 2×P2 已修复并 resolve；自审补 1 个凭证过时段边界；final `d1cb656` Verify #314 success；Browser #115 T034 3/3 passed、relation `[]`，其余 8 项仍为既有 T017/T018/T032 基线债 |
| T035 | Mobile 便利店连续浏览结构 | Mobile / UX | PASS | 0.3.0 | T034、T031 | PR #31 squash merge `669791b`；Codex P1 底部遮挡已修复并 resolve；final `54ce85d` Verify #321 success；Browser #119 T035 4/4 + T031 浏览回归通过，77/85，其余 8 项为既有 T017/T018/T032 checkout 旧债；未提前做 T036 |
| T036 | Mobile 便利店分类滚动联动 | Mobile / Interaction | PASS | 0.3.0 | T035 | 2026-09-06 用户授权 AI review 无新回复时自审验收；latest-head Verify #34003981393 success；Browser #34003981401：T036 5/5、全量 100/108，8 项均为既有 T017/T018/T032 checkout 旧债；PR #32 squash merge `3dd5309` |
| T037 | Mobile 自提双凭证 | Mobile / Fulfillment | PASS | 0.3.0 | T034、T018 | 2026-09-06 Mira 按用户授权自审验收；PR #36 squash merge `e05c2ff`；final `f6cdb71` Verify #34004467423 success；Browser #34004467392：T037 3/3、全量 102/111；8 项既有 checkout 旧债 + 1 项 T022 旧“第二张 pickup 订单”断言由 T038/T039 收口 |
| T038 | PC 二维码扫码核销 | PC / Fulfillment | PASS | 0.3.0 | T034、T037、T022 | 2026-09-06 Mira 按用户授权自审验收；PR #37 squash merge `08a0eca`；Verify #34005128300 success；Browser #34005128283：T038 2/2、T022 5/5、全量 105/113，余 8 项为既有 checkout 债 |
| T039 | PC 数字取货码核销 | PC / Fulfillment | PASS | 0.3.0 | T034、T037、T022 | 2026-09-06 Mira 按用户授权自审验收；PR #38 squash merge `893bddd`；Verify #34005515901 success；Browser #34005515921：T039 3/3、T038 2/2、T022 5/5、全量 108/116，余 8 项为既有 checkout 债 |
| T040 | Mobile 便利店消费积分反馈 | Mobile / Benefits | PASS | 0.3.0 | T034、T018、T032 | 2026-09-06 Mira 按用户授权自审验收；PR #39 squash merge `4e17126`；Verify #34006380444 success；Browser #34006380455：T040 4/4、全量 112/120，余 8 项为既有 checkout 债；CodeRabbit 1×Major 已修复并 resolved，latest re-review 无 actionable comment |
| T041 | Mobile 商城积分消费闭环 | Mobile / Mall / Benefits | TODO | 0.3.0 | T034、T019/T033 当前消费者基线 | 商城可得积分 + 结算积分抵现 + 金额联动；不得恢复店铺 / 来源心智 |
| T042 | Mobile 社群基础入口 | Mobile / Private-domain | TODO | 0.3.0 | T034 | 我的 → 加入社群 → 指引页；不做消费后提示 |
| T043 | Mobile 消费后社群承接 | Mobile / Growth | TODO | 0.3.0 | T042、T018 | 支付成功 / 取货成功轻提示 + 7 天频控 Mock；不扩到商城 / 智慧抗衰 |

## V0.1 收口记录

- T002-T012 已全部 `PASS`。
- 2026-08-31 用户明确确认 V0.1 完结；据此 T001 记录为 `PASS`。
- T013 原本只是 V0.1 总体验收前的准备卡。由于用户已直接完成总体验收，该卡记录为 `CANCELLED`，避免把未单独执行的准备工作伪装为已完成。
- T014 继续作为实验性 PR AI Review 独立观察，不阻塞 V0.2。

## V0.2 当前进度

- Wave 0-2 的业务语义施工已完成；T015-T018、T020、T021 当前均为 `PASS`。T019 保留原业务闭环证据，但因 2026-09-02 视觉验收重开为 `REVIEW`。
- 便利店消费侧 UX 返工已收口：T027-T032 与独立复审 T030 均为 `PASS`，T017 已按 T030 结论恢复 `PASS`；390×844 全链 UX 复审通过，46/46 Playwright 回归通过。
- T019 商城 UX 返工已完成 R1-R4 与 R5 独立复审执行；五屏 artifact `9855267147` 已逐屏复审。消费者侧 Storefront / Channel 语义又由 T033 / PR #28 收口并已合入 `dev`，但 T019 与 T033 任务卡仍保持 `REVIEW`，等待用户最终视觉确认。
- Wave 3 PC 后台 T022、T023、T024 均已 `PASS`；PC 业务语义稳定。
- T025 前置已满足，可以开始数据驾驶舱增量施工。
- T026 的便利店 UX gate（T030）已经满足；当前仍需 T025 完成，并等待 T019 商城最终视觉验收收口后再执行总体跨端验收准备。

## V0.2 派卡原则

本轮只派当前原型工程能够真实完成和验证的工作：

- 做：共享 mock、Mobile 中高保真页面与完整交互、PC 对应后台、跨端一致性、浏览器验证。
- 不做：真实支付、真实库存、真实地图 / 骑手调度、真实物流、抖音等外部商城 API、真实检测硬件、真实 AI 检测 / 护理算法、生产级 BI / CMS / 搜索索引。
- 业务未决规则只用可追踪 mock，不作为正式事实固化。

## V0.2 施工波次

### Wave 0 · 地基 — PASS

1. T015 共享领域模型与 Mock Fixtures。
2. T016 Mobile 一级 IA、运营首页与全局搜索。

### Wave 1 · 三大 Mobile 业务域

- T017 便利店浏览 / 独立购物车 — `PASS`（T030 UX 复审后恢复）。
- T019 线上商城购买闭环 — `REVIEW`（R5 独立视觉复审执行通过，等待用户最终确认）。
- T020 智慧抗衰预约 / 核销 — `PASS`。

### Wave 2 · 深层流程 — PASS

- T018 便利店自提 / 短配。
- T021 智慧抗衰报告 / 历史对比。

### Wave 2.5 · 便利店 UX 返工 — PASS

1. T027 选店与门店上下文 — `PASS`。
2. T028 商品浏览与零售密度 — `PASS`；后续由 T031 以更高标准完成双栏密度升级。
3. T029 商详、购物车与购买链路收口 — `PASS`。
4. T031 双栏分类与零售密度升级 — `PASS`。
5. T032 弹层购物车与结算页分组 — `PASS`。
6. T030 独立 UX 复审 — `PASS`；T017 已恢复 PASS。

### Wave 2.6 · 商城 UX 返工 — REVIEW

- T019-R1 商城首页视觉返工 — 已形成稳定 browsing-first 首页基线；PR #28 follow-up 删除“精选店铺”段后继续以商品浏览为主。
- T019-R2 商品详情视觉返工 — PR #23 已 merge `dev`，UX 自审 `PASS FOR MERGE`；PR #28 follow-up 删除来源标签。
- T019-R3 商城购物车视觉返工 — `REVIEW`，PR #24 merge `43ccd84c`；PR #28 follow-up 删除来源条。
- T019-R4 结算确认 + 订单物流视觉返工 — `REVIEW`，PR #25；PR #28 follow-up 删除结算 / 订单“店铺来源”行。
- T019-R5 商城视觉独立复审 — `REVIEW`；五屏证据已生成。T033 / PR #28 已删除消费者侧“店铺 / 官方商城 / 合作渠道”等来源心智并合入 `dev`；等待用户最终视觉确认。

### Wave 3 · PC 后台并行 — PASS

- T022 便利店后台 — `PASS`。
- T023 智慧抗衰后台 — `PASS`。
- T024 商城渠道 / 活动 / 搜索运营后台 — `PASS`，PR #35 squash merge `1309260`。

三张 PC 卡与消费侧 UX 返工可作为不同 lane 并行；必须继续消费已确认的 Shared / T018 业务语义。

### Wave 4 · 数据与总验收

1. T025 数据驾驶舱增量。
2. T026 跨端串联、中高保真质量与 V0.2 验收准备；除 T030 外，商城视觉还必须等待用户正式确认 T019-R5 PASS。

## V0.3 设计与派卡基线

- 2026-09-05 已基于《便利店动线改造需求说明 2.0》、V0.2 PRD、现有 T018 / T031 / T032 / T019 实现基线完成 V0.3 设计 PRD：`docs/product/02-v0.3-prd.md`。
- V0.3 固定使用 T034-T043 共 10 张施工卡；本轮派卡本身不代表任何卡自动进入 DOING。
- V0.3 不重做 V0.2 已有能力：便利店现有积分抵现继续复用；自提继续沿用 T018 状态机；便利店连续浏览直接替换 T031 的“单品 / 套餐过滤式切换”。
- T038 / T039 明确依赖 T022。T022 未稳定前不得为了 V0.3 另造第二套 PC 便利店订单 / 核销后台。
- V0.3 最终 Release Gate 不占新的施工卡号，只检查 T034-T043 证据、Shared 一致性、Mobile / PC 浏览器质量和 V0.2 关键回归；Release Gate 不负责补施工。

### V0.3 波次

1. **Wave 0**：T034 Shared 合同与 Mock。
2. **Wave 1（T034 后可并行）**：T035、T037、T040、T041、T042。
3. **Wave 2**：T036（依赖 T035）；T038 / T039（依赖 T022 + T037）；T043（依赖 T042 + T018）。
4. **Release Gate**：T034-T043 全部具备独立验收证据后执行；不另派“万能收尾卡”。

### V0.3 可控施工原则

- 一张卡只接受任务卡中写明的唯一交付物。
- Changed paths 白名单之外的业务代码改动视为范围变化，先更新任务卡 / 台账再继续。
- 自动化验收优先验证状态变化和交互因果，不以“页面有这行字”代替流程成立。
- UI 卡至少有对应真实尺寸浏览器证据；Shared 卡必须有关系校验；PC 核销卡必须验证双通道指向同一 redemption。
- AI 最多推进到 REVIEW；用户未授权时不得把 V0.3 卡自行标记 PASS。

## 历史记录

2026-08-27 至 2026-08-31 的 V0.1 逐项施工、返工、CI、OpenCode / Codex Review 与状态变更仍保留在各任务卡和：

`docs/workbench/archive/00-work-ledger-before-2026-08-31-acceptance.md`

## 下一步

1. V0.2：T025 已解锁，可直接开始 PC 数据驾驶舱增量；T025 完成后，仍需 T019 / T033 商城最终视觉验收收口，再进入 T026 总体跨端验收准备。
2. V0.2：便利店 UX lane 已全部收口，T017、T027-T032、T030 均为 PASS，不再作为后续施工阻塞。
3. V0.3：T034-T040 当前已完成已施工链路；下一批可直接启动 T041、T042。
4. V0.3：T037-T039 双凭证 / 双通道核销已 PASS；T042 完成后解锁 T043。
5. T022 / T023 / T024 已全部 PASS；后续不得另造第二套 PC 便利店履约 / 核销后台，也不得回滚已确认的 Shared / T018 业务事实。

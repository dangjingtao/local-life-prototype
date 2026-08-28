# Prototype Work Ledger

> 统一记录产品决策、施工、评审和验证。路由存在不等于产品闭环存在；页面能看不等于业务已确认；CI 通过不等于产品验收通过。

## 当前基线

- Product Brief：`docs/product/00-product-brief.md`
- AI Skills：`docs/ai/skills.md`
- Daily Report Skill：`docs/ai/skills/daily-report.md`
- 日报目录：`docs/reports/daily/`
- 版本：`VERSION`
- 默认施工分支：`dev`
- 验收 / 发布分支：`prod`
- 业务项目不使用 `main` 作为工作分支

## 默认规则

1. 可执行工作使用稳定编号，如 `T001`；编号创建后永久保留，不复用。
2. 简单、低风险任务可以只在总台账记录；出现以下任一情况必须创建独立任务卡：
   - 跨 PC / Mobile
   - 多步骤施工
   - 涉及产品决策或规则变化
   - 存在明显风险 / 依赖
   - 需要独立验收标准
3. 默认状态流：`TODO → DOING → REVIEW → PASS`。
4. 任意执行态均可进入 `BLOCKED`；取消任务使用 `CANCELLED`，不得删除历史。
5. AI 可以创建任务、更新进度并推进到 `REVIEW`；除非用户明确授权自动验收，否则 AI 不得自行把任务改成 `PASS`。
6. 每次状态变化至少留一个证据：commit / PR / 页面路径 / 截图说明 / CI run / 明确评审结论之一。
7. 需求变化不得覆盖旧结论；在“变更记录”中写明旧结论、替代结论和影响范围。
8. 产品事实变化时同步更新 Product Brief / 决策记录 / 任务卡中的至少一个真相源。
9. 版本变化遵循 `docs/governance/version-control.md`，并同步 `VERSION` 与 `CHANGELOG.md`。
10. 日报是“实际改动的聚合视图”，不是新的任务真相源；日报发现 commit 与台账不一致时，应记录偏差，而不是静默改写历史。

## 总状态

| 卡片 | 主题 | 类型 | 状态 | 目标版本 | 前置 | 证据 / 结果 |
| --- | --- | --- | --- | --- | --- | --- |
| T001 | 本地生活 V0.1 概念原型 | 产品 / 施工 | DOING | 0.1.0 | Product Brief、AI Skill Profile | 已确认产品名、双端范围和 AI 施工授权；任务卡已建立 |
| T002 | 共享领域模型与演示数据 | Shared | PASS | 0.1.0 | T001 | `6cf267c`；Verify Prototype #2 success；统一实体、状态名称和跨端 fixtures |
| T003 | Mobile 登录、首页与统一账号入口 | Mobile | REVIEW | 0.1.0 | T002 | `1e35cec`；Verify Prototype #5 success；登录、三场景入口与统一身份已落地，待 390px 视觉复核 |
| T004 | Mobile 线下门店自提闭环 | Mobile | REVIEW | 0.1.0 | T002、T003 | `7946292`；Verify Prototype #11 success；门店→商品→自提凭证→核销→私域承接已落地，待 390px 视觉复核 |
| T005 | Mobile 线上商城一件代发闭环 | Mobile | TODO | 0.1.0 | T002、T003 | FR-201 至 FR-206；商城到订单详情 |
| T006 | Mobile 智慧抗衰体验闭环 | Mobile | TODO | 0.1.0 | T002、T003 | FR-301 至 FR-307；领券到基础报告 |
| T007 | Mobile 会员、积分与权益中心 | Mobile | TODO | 0.1.0 | T002、T003 | FR-401 至 FR-406；积分与券状态 |
| T008 | PC 工作台框架、角色与权限 | PC | REVIEW | 0.1.0 | T002 | `c1cb8d5`；Verify Prototype #6 success；三类角色、范围导航与 permission 边界已落地，待多视口视觉复核 |
| T009 | PC 店主与合作商工作台 | PC | REVIEW | 0.1.0 | T002、T008 | `47dcafe`；Verify Prototype #14 success；本店概览、自提/服务核销、门店用户与越权状态已落地，待多视口视觉复核 |
| T010 | PC 平台运营中台 | PC | TODO | 0.1.0 | T002、T008 | FR-601 至 FR-606；六类管理模块 |
| T011 | PC 数据驾驶舱 | PC | TODO | 0.1.0 | T002、T008 | FR-701 至 FR-706；经营指标与场景对比 |
| T012 | 关键状态、可访问性与原型质量 | QA / Shared | TODO | 0.1.0 | T003-T011 | 五态、恢复路径与多视口质量检查 |
| T013 | 跨端演示串联与 V0.1 验收准备 | Review / Docs | TODO | 0.1.0 | T002-T012 | AC-001 至 AC-010 证据与 T001 REVIEW 准备 |
| T014 | 实验性 PR AI Review | CI / Review | BLOCKED | 0.1.0 | GitHub Actions、`OPENROUTER_API_KEY` | 基础 workflow、本地 review inbox 与 Agent handoff 已落地；待 secret + 首个真实 PR smoke test |

## 状态约定

- `TODO`：目标与范围已足够进入施工，但尚未开始
- `DOING`：正在执行
- `BLOCKED`：依赖产品决定、外部条件或前置任务
- `REVIEW`：施工方已完成自检，等待独立评审 / 用户确认
- `PASS`：验收通过；必须有明确验收证据
- `CANCELLED`：任务不再执行，但历史继续保留

## 任务卡最低内容

独立任务卡至少包含：

- ID / 标题
- 背景与目标
- 范围 / 非范围
- 验收标准
- 影响端：PC / Mobile / Shared / CI/CD / Docs
- 风险 / 依赖
- 验证方式
- 施工结果与证据
- Review 结论

## 日报对账

执行 Daily Report Skill 时：

- 默认以当天 `dev` commit 为实际施工主线。
- 当天 `prod` 有发布 / 合并时同时纳入。
- commit 有改动但没有任务归属：记为“未归档改动”。
- 任务卡标记完成但缺少实际证据：记为“状态待核验”。
- commit 与任务卡内容不一致：记为“台账偏差”。
- 日报不得自行把任务从 `REVIEW` 提升为 `PASS`。

## 变更记录

### 2026-08-28

- T014 施工：新增 `Experimental AI PR Review`，同仓库非 draft PR 目标为 `dev` 时，在 opened / synchronize / reopened / ready_for_review 触发；新 commit 会取消旧 run 并重跑。
- T014 Review handoff：workflow 维护单条带 `local-ai-review:v1` marker 的 PR 评论；本地 `npm run review:pull` 将评论同步到 `.ai/reviews/latest.md`，`AGENTS.md` 要求施工 Agent 逐条回查 finding，不把模型结论直接当事实。
- T014 安全边界：V1 使用 OpenRouter `openai/gpt-5-mini`，只允许 same-repository PR 使用 secret；fork PR 跳过；不自动 APPROVE / REQUEST_CHANGES / merge / PASS。当前等待 `OPENROUTER_API_KEY` 与首个真实 PR smoke test，因此状态为 `BLOCKED`。
- T009 施工：将 T008 的店主占位容器替换为云岭社区店经营工作台，完成本店经营概览、自提/服务核销入口、门店订单和门店用户概览。
- T009 数据权限：店主视图只从 `STORE-YUNLING` 关联订单和核销记录派生用户，不展示南岸生活馆等其他门店明细；越权入口继续复用 `permission` 状态表达。
- T009 跨端数据：继续复用 T004 的 `LL-8888` → `LL-1024` → `STORE-YUNLING` → `REDEEM-LL-1024`；新增 `REDEEM-EXPERIENCE-8888-01` / `CARE-8888`，将 `EXPERIENCE-8888-01` 与同一用户、同一门店关联，供 T006 后续复用。
- T009 原型边界：自提和服务“确认核销”只修改当前页面演示状态，不伪装真实扫码、库存、财务、退款或后端核销已经接入。
- T009 验证：代码提交 `47dcafeeecd7246bf2dcefa5607cd1937a5d6438`；GitHub Actions `Verify Prototype #14`（run `33135084616`）通过版本合同、全仓 typecheck 与全仓 build。
- T009 评审：施工方推进到 `REVIEW`；1440px / 1024px 实际浏览器视觉检查尚未形成证据，因此未自动标记 `PASS`。
- T004 施工：在 T003 Mobile 壳层内完成线下门店自提闭环，覆盖门店列表、门店详情、商品选择、自提确认、提货凭证、模拟核销、核销结果和私域承接。
- T004 数据链：核心流程固定复用 T002 `LL-8888` → `LL-1024` → `STORE-YUNLING` → `REDEEM-LL-1024`；非核心门店仅用于多载体结构演示，不另造冲突订单 / 核销数据。
- T004 多载体：fixtures 中同时展示便利店与会所，代码保留养生馆 / 洗护店映射；页面不把“线下门店”限定为便利店。
- T004 规则边界：到店奖励仅表达积分、赠品、优惠券等候选反馈，不固定奖励数值，不接真实定位、支付、库存、扫码器、核销或积分发放系统。
- T004 验证：代码提交 `7946292f1b90dae65c8a31dbafcbed03a408d118`；GitHub Actions `Verify Prototype #11`（run `33134899859`）通过版本合同、全仓 typecheck 与全仓 build；Cloudflare Pages dev run `33134899891` success，Mobile preview 已发布。
- T004 评审：施工方推进到 `REVIEW`；390px 实际移动视口视觉 / 交互检查尚未形成浏览器证据，因此未自动标记 `PASS`。
- T003 施工：Mobile 壳层新增概念登录 / 授权、首页三场景入口、消息 / 活动私域提示、底部导航和统一身份展示。
- T003 数据收口：统一身份、会员等级、积分和可用券数量改为直接消费 `@prototype/shared`；门店、商城、抗衰入口分别交给 T004 / T005 / T006，完整会员权益中心交给 T007，不提前重复固化后续任务数据与闭环。
- T003 验证：代码提交 `1e35cec32dd3f47f06c74ba300c6f87bb2284c63`；GitHub Actions `Verify Prototype #5`（run `33134306194`）通过版本合同、全仓 typecheck 与全仓 build。
- T003 评审：施工方推进到 `REVIEW`；390px 实际移动视口视觉检查尚未形成浏览器证据，因此未自动标记 `PASS`。
- T008 施工：PC 壳改为角色感知结构，店主/合作商、平台运营、平台管理层分别拥有独立可见导航和数据范围标识。
- T008 权限边界：店主仅展示云岭社区店授权范围；平台运营展示授权业务范围；管理层仅保留平台汇总数据只读驾驶舱入口，不暴露交易、核销或营销配置入口。
- T008 状态：`?view=permission` 提供当前拒绝原因、当前数据范围与下一步；真实 RBAC、登录、组织架构继续保持 V0.1 范围外。
- T008 验证：代码提交 `c1cb8d5fd606fed1b508c0aaedf39cc3564b763b`；GitHub Actions `Verify Prototype #6`（run `33134308795`）通过版本合同、全仓 typecheck 与全仓 build。
- T008 评审：施工方推进到 `REVIEW`；当前执行环境无法完成 1440px / 1024px 浏览器视觉复核，因此未自动标记 `PASS`。
- T002 施工：在 `@prototype/shared` 新增领域模型、稳定演示 fixtures、查询选择器和跨实体关系校验。
- T002 数据基线：核心演示用户 `LL-8888` 关联自提订单 `LL-1024`、云岭社区店、积分、优惠券、体验券、检测报告和核销记录。
- T002 规则边界：会员等级、积分抵现标记为 `candidate`；结算和检测设备接入标记为 `unknown`，未固化为生产规则。
- T002 验证：代码提交 `6cf267c9bf8708b2cceb5b8814ab372a9d75e11c`；GitHub Actions `Verify Prototype #2`（run `33133811202`）通过。
- T002 验收：用户明确要求“推进到完成”；在 Verify 通过后由 `REVIEW` 收口为 `PASS`。
- 依赖解锁：T003-T011 可基于 `@prototype/shared` 并行施工，端侧不应重复创建同义数据源。

### 2026-08-27

- 新增：T001 本地生活 V0.1 概念原型任务卡。
- 初始化修正：AI Skill Profile 顶部状态由 `PENDING` 修正为与已确认档案一致的 `CONFIRMED`。
- Git 初始化：校验 `https://github.com/dangjingtao/local-life-prototype` 可访问，并配置为本地 `origin`；未 commit、push 或部署。
- 交付准备：本地 `npm run verify` 通过，准备将完整初始化基线提交并推送至 `origin/dev`，由 GitHub Actions 触发 Verify 与 Cloudflare Preview。
- 任务拆分：在 T001 总卡下派发 T002-T013 共 12 张执行卡，覆盖共享数据、Mobile 四个工作包、PC 四个工作包、原型质量与跨端验收准备。
- 决策：产品展示名为“本地生活”；Mobile 为终端用户端，PC 为店主/合作商、运营中台和驾驶舱；授权 AI 进行产品、设计、文档和代码施工，不含 commit、push、部署。
- 施工：补充 Product Brief 和 AI Skill Profile，准备进入双端原型设计。
- 评审：待原型完成后进入 REVIEW。
- 风险：智慧抗衰命名、检测能力、外部电商、结算规则和店主端形态仍待确认。
- 版本：保持 0.1.0。

## 下一步

1. T014 等待配置 `OPENROUTER_API_KEY`；随后用首个真实 feature/task/fix PR → `dev` 完成 workflow、单评论更新和本地 `review:pull` smoke test。
2. T002 已完成；以 `@prototype/shared` 作为后续跨端语义和演示数据基线。
3. T003、T004 已进入 REVIEW；完成 390px 移动视口视觉 / 交互检查后，由 Tomz 给出 PASS / BLOCKED 结论。
4. T008、T009 已进入 REVIEW；T010-T011 可继续复用 PC 角色壳与权限边界，T008/T009 正式 PASS 仍需补 1440px / 1024px 视觉验收。
5. Mobile T005-T007 可继续复用 T003 壳、T004 已接入的门店入口结构和 `@prototype/shared`；T006 应复用 `EXPERIENCE-8888-01` / `CARE-8888` 跨端凭证，不另造同义数据。
6. 页面完成后执行 T012 五态、可访问性和多视口质量检查。
7. 由 T013 串联三条主流程并核对 AC-001 至 AC-010，再将 T001 推进到 REVIEW。
8. 未确认的产品规则在施工中暂停并向用户确认。

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
| T005 | Mobile 线上商城一件代发闭环 | Mobile | REVIEW | 0.1.0 | T002、T003 | PR #6；返工 `dfb7288`；Verify Prototype #89 success；OpenCode #20 `NO_BLOCKING_FINDINGS`；Codex 两条 P2 已修复，待 390px 视觉复核 |
| T006 | Mobile 智慧抗衰体验闭环 | Mobile | TODO | 0.1.0 | T002、T003 | FR-301 至 FR-307；领券到基础报告 |
| T007 | Mobile 会员、积分与权益中心 | Mobile | TODO | 0.1.0 | T002、T003 | FR-401 至 FR-406；积分与券状态 |
| T008 | PC 工作台框架、角色与权限 | PC | REVIEW | 0.1.0 | T002 | `c1cb8d5`；Verify Prototype #6 success；三类角色、范围导航与 permission 边界已落地，待多视口视觉复核 |
| T009 | PC 店主与合作商工作台 | PC | REVIEW | 0.1.0 | T002、T008 | `47dcafe`；Verify Prototype #14 success；本店概览、自提/服务核销、门店用户与越权状态已落地，待多视口视觉复核 |
| T010 | PC 平台运营中台 | PC | REVIEW | 0.1.0 | T002、T008 | `5c07411` + `bdc9662`；Verify Prototype #37 success；六类运营模块、LL-8888 关联详情与三场景筛选已落地，待多视口视觉复核 |
| T011 | PC 数据驾驶舱 | PC | REVIEW | 0.1.0 | T002、T008 | PR #3 已合入 `dev`，merge `8b068c5`；返工 Head Verify #77 success；最新 marked OpenCode review `NO_BLOCKING_FINDINGS`；待 1440px / 1024px 视觉复核 |
| T012 | 关键状态、可访问性与原型质量 | QA / Shared | DOING | 0.1.0 | T003-T011 | PR #4 已合入 `dev`，merge `d6a10b5`；第二次返工 Head Verify #81 success；最新 marked OpenCode review `NO_BLOCKING_FINDINGS`；T006-T007 与浏览器质量证据仍待补 |
| T013 | 跨端演示串联与 V0.1 验收准备 | Review / Docs | TODO | 0.1.0 | T002-T012 | AC-001 至 AC-010 证据与 T001 REVIEW 准备 |
| T014 | 实验性 PR AI Review | CI / Review | REVIEW | 0.1.0 | GitHub Actions、`OPENCODE_API_KEY` | PR #1 / OpenCode run #5；只读 review、单评论更新与本地 Agent handoff self-check 已真实通过；PR #3 首个真实业务施工 smoke 完成“发现 P2→返工→二审→合并”闭环 |

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

- T005 开工：从最新 `dev@e21ff937ec421769d65c2af76302b2d9585a0e96` 建立 `feature/T005-mobile-mall-flow`，按用户要求通过 PR → Experimental OpenCode review → 复核 finding → 必要返工的流程施工。
- T005 商城闭环：新增独立 `MallFlowScreen`，覆盖分类/推荐、商品详情、演示购物车、结算、全国配送到家 / 送至合作门店、概念订单详情与状态推进；继续复用 T003 Mobile 壳和 T012 PrototypeState。
- T005 数据边界：商品与商城券直接消费 `@prototype/shared`；当前会话的演示地址、购物车和概念订单不写入 Shared，不伪装真实支付、库存、供应商下单、物流单号或持久化。
- T005 渠道边界：自建私域商城作为当前可点击演示路径；外部电商导流保留为 D002 Open 候选，不提供假跳转。商城券没有减免金额字段，因此只展示“可用 / 金额规则待确认”，结算金额不擅自扣减。
- T005 施工方自审：商品详情最初存在“立即结算”可绕过购物车的路径，与任务卡要求的购物车主链不够严谨；送审前主动修正为商品详情 → 购物车 → 结算，修正提交 `d9f873c`。
- T005 首轮验证：PR #6 Head `d9f873cbe309fac91ea95e6acbb0a89edb6eca58` 的 Verify Prototype #86（run `33153655973`）success；Experimental OpenCode PR Review #17（run `33153655971`）使用 `opencode-go/deepseek-v4-pro` 返回 `NO_BLOCKING_FINDINGS`，无高置信 P0-P2 finding。
- T005 首轮 review 初判：OpenCode 将“送店订单未经过 `shipping`”列为 gap 而非缺陷；施工方当时据此判断合同未强制要求在途状态，暂不返工。该判断随后被更具体的 Codex P2 证据替代，保留这里只作为历史，不再代表当前结论。
- T005 Codex 返工：GitHub Codex Review 对 `d9f873c` 提出两条 P2——送店订单刚提交即显示待自提，以及送店结算仍展示家庭地址。复核均成立；`dfb7288` 将送店状态修正为 `pending_fulfillment → shipping → pending_pickup → completed`，并让结算目的地随到家 / 送店切换。两个 review thread 均已回执修复。
- T005 返工验证：Head `dfb7288e888aba90708f43b29e7ed5d8740a24cf` 的 Verify Prototype #89（run `33154307881`）success；Experimental OpenCode PR Review #20（run `33154307887`）返回 `NO_BLOCKING_FINDINGS`，无高置信 P0-P2。OpenCode #20 仅指出旧文档判断与返工后代码矛盾的 P3，本次对账明确以 `dfb7288` 为当前事实。
- T005 状态：代码 review 闭环已完成并保持 `REVIEW`；当前唯一明确的任务验收缺口为 390px 实际浏览器视觉 / 交互检查。当前执行环境无法解析 `github.com`，无法拉取仓库启动本地 Vite，因此不得伪造视觉证据，也不自动 PASS。
- T012 开工：从 `dev@8b068c5` 拉取 `task/T012-prototype-states-quality`。本轮先施工共享 Runtime 与现有 T003/T004、T008-T011 页面质量基线；由于 T005-T007 仍为 `TODO`，T012 保持 `DOING`，不提前进入 `REVIEW`。
- T012 五态：Prototype Runtime 为 loading / empty / error / permission 补充原因和下一步；empty / error / permission 提供明确恢复到 ready 的动作；loading 增加 `aria-busy`，error 使用 alert 语义，PrototypePanel 当前状态使用 `aria-pressed`。
- T012 可访问性基线：Design System Button / SecondaryButton 保持 44px 最小高度并新增 `focus-visible`；双端 CSS 对普通 button、link、summary、role=button 统一提供可见焦点兜底；PrototypePanel 状态按钮提升到 44px 级目标。首轮 OpenCode 指出组件 ring 与未分层全局 outline 可能形成双焦点，复核成立后将 fallback 放入 `@layer base`。
- T012 Mobile 状态复现：登录后 URL 写入纯原型参数 `demoAuth=1`，用于直接状态链接和 permission 文档跳转后的演示身份复现；ready / loading / empty / error 最终改为 Runtime 内无刷新切换，该参数不代表真实鉴权。
- T012 状态恢复返工：Codex 首轮指出整页导航会让 Mobile 深层门店 step / PC 非默认模块恢复后掉回默认页面，复核成立；随后 OpenCode 二审进一步发现 ready / non-ready React 返回树不同仍会卸载业务 children，判定 P1。第二次返工让业务 children 始终处于同一稳定 wrapper，非 ready 只隐藏而不卸载，修复局部 state 丢失。
- T012 验证矩阵：新增 `docs/workbench/T012-state-quality-matrix.md`，记录 Mobile / PC 五态路由、当前代码级无障碍基线和必须补的 390px / 1024px / 1440px 浏览器、键盘与对比度证据。
- T012 基线收口：第二次返工 Head `6f3f297` 的 Verify Prototype #81（run `33145171233`）success；Experimental OpenCode PR Review #14（run `33145171238`）最终 `NO_BLOCKING_FINDINGS`，随后 PR #4 合入 `dev`，merge `d6a10b5`。T012 仍为 `DOING`，等待 T005-T007 与实际浏览器质量证据。
- T011 收口：PR #3 已完成真实业务 PR Review smoke。首轮 OpenCode `CHANGES_NEEDED` 的角色切换 P2 与 Codex 台账状态 P2 均返工；返工 Head `dc12a53` 的 Verify #77 success，最新 marked OpenCode verdict `NO_BLOCKING_FINDINGS`，随后合入 `dev`，merge commit `8b068c5`。T011 仍为 REVIEW，等待 1440px / 1024px 视觉验收。
- T011 施工：从最新 `dev` 拉取 `task/T011-pc-data-dashboard`，新增独立 `ManagementDashboard`，通过 PR #3 向 `dev` 送审；管理层只读查看经营总览、三场景对比、会员/积分/券/核销汇总，不提供经营写入、钻取、导出或预测。
- T011 数据口径：累计用户、交易用户、合作商、门店、区域、订单、交易额和核销均从 `@prototype/shared` fixtures 汇总；由于 User 缺少创建时间，“新增用户”明确显示待确认；趋势只按现有订单 `createdAt` 聚合，不伪造同比 / 环比；区域只有 `region` 时不伪造地图。
- T011 首轮验证：PR Head `d2e639f3fb45fd4ee9110c458e7a0e25a7b35a98` 的 `Verify Prototype #74`（run `33142887282`）通过版本合同、全仓 typecheck 与全仓 build；`Experimental OpenCode PR Review #8`（run `33142887276`）使用 `opencode-go/deepseek-v4-pro` 成功发布当前 Head marked comment。
- T011 Review 返工：OpenCode 首轮 verdict `CHANGES_NEEDED`，高置信 P2 指出店主 `App` 内角色切换仍会落入旧 T011 `DashboardShell`；复核成立，返工后 `App` 只负责店主，运营 / 管理层切换统一通过 URL 进入独立 `OperatorConsole` / `ManagementDashboard`，旧管理层 placeholder 删除。Codex 同时指出任务卡 DOING 与总台账 TODO 不一致，复核成立并同步修正为 REVIEW。
- T011 Review gap：OpenCode 提醒服务核销场景依赖当前领域语义。现有 `Service` 只包含 detection / experience / care_package，均属于当前智慧抗衰服务域，因此当前 fixtures 下归入 care 有事实基础；若未来新增非抗衰 Service，需给 Service / Redemption 增加显式 scene，记录为技术债，不在本轮扩张领域模型。
- T011 评审状态：首轮 review 已真实触发返工；当前等待返工 Head 的第二轮 marked review 与 Verify。1440px / 1024px 浏览器视觉证据仍未完成，因此即使 PR 可合并也只进入 `REVIEW`，不自动 `PASS`。
- T010 施工：新增独立 `OperatorConsole`，默认 / `?role=operator` 进入平台运营中台；店主与管理层继续使用既有 T009 / T011 壳，减少 PC 多任务并行时的代码竞态。
- T010 模块：运营总览下建立用户、合作商/门店、商品/服务、订单/核销、会员、营销六类核心模块，提供列表、代表性详情和概念筛选；不实现真实写入。
- T010 数据关联：核心用户 `LL-8888` 详情关联来源、会员、积分、订单、优惠券/体验券、常用门店与检测报告；订单/核销按线下门店、线上商城、智慧抗衰三场景筛选，继续直接消费 `@prototype/shared`。
- T010 事实边界：营销模块仅展示共享 fixtures 已建模的优惠券 / 体验券；活动编排、自动化营销、人群包和发送渠道尚未建模，因此不虚构配置能力。
- T010 验证：首轮 `Verify Prototype #36`（run `33138072750`）真实暴露 PC 用户选择 state 的 TypeScript 字面量推导错误；修复提交 `bdc966279b99a85507eb37d638f54afda8b03b43` 后，`Verify Prototype #37`（run `33138195893`）通过版本合同、全仓 typecheck 与全仓 build。
- T010 评审：施工方推进到 `REVIEW`；1440px / 1024px 实际浏览器视觉检查尚未形成证据，因此未自动标记 `PASS`。
- T014 施工：新增 `Experimental OpenCode PR Review`，同仓库非 draft PR 目标为 `dev` 时，在 opened / synchronize / reopened / ready_for_review 触发；新 commit 会取消旧 run 并重跑。
- T014 Review handoff：OpenCode 的最终评审输出携带 `local-ai-review:v1` marker；本地 `npm run review:pull` 选择最新带 marker 的 PR 评论并同步到 `.ai/reviews/latest.md`，同时记录当前 PR Head SHA；`AGENTS.md` 要求施工 Agent 逐条回查 finding，不把模型结论直接当事实。
- T014 安全边界：review 与 publish 拆成两个 job；OpenCode review job 只有 `contents: read`，不持有 GitHub 写权限，并禁止 edit / bash / task / webfetch / websearch；独立 publisher 只负责回写 marked comment 与运行 local handoff self-check；fork PR 跳过，不自动 APPROVE / REQUEST_CHANGES / merge / PASS。
- T014 模型：`OPENCODE_API_KEY` 已真实通过鉴权；`opencode/gpt-5.4-mini` 因当前 Zen workspace 余额不足未作为实验默认值，基础版改用 `opencode/mimo-v2.5-free`，仍可由 `OPENCODE_REVIEW_MODEL` 覆盖。
- T014 验证：真实 PR #1 经多轮 synchronize smoke；OpenCode run #3/#4/#5 success；同一 review comment id `5448033638` 持续更新到最新 Head SHA；run #5 `33139159277` 的 `Validate local agent handoff` success，真实运行 `pull-ai-review.mjs` 并校验 `.ai/reviews/latest.md` Head SHA + marker；状态由 `BLOCKED` 推进到 `REVIEW`，不自动 `PASS`。
- T014 方案替代：撤销最初的 OpenRouter 直连 runner 与 `OPENROUTER_API_KEY` 依赖，不再由项目脚本直接调用模型网关。
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

1. T014 已完成基础 smoke 并进入 `REVIEW`；PR #3 已验证首个真实业务施工“发现问题→返工→二审→合并”闭环，后续继续观察误报、漏报与耗时，不自动转 `PASS`。
2. T002 已完成；以 `@prototype/shared` 作为后续跨端语义和演示数据基线。
3. T003-T005 已进入 REVIEW；完成 390px 移动视口视觉 / 交互检查后，由 Tomz 给出 PASS / BLOCKED 结论。T005 的 PR #6 代码 review 闭环已完成，当前不再有已知高置信 P0-P2 finding。
4. T008-T011 均已进入 REVIEW；PC 四张卡正式 PASS 仍需补 1440px / 1024px 视觉验收。
5. T012 共享五态、恢复动作与可访问性基线已通过 PR #4 合入 `dev`；当前已覆盖 T003/T004，T005 已完成代码施工并处于 REVIEW，待 T006-T007 页面完成后补全最终质量矩阵并进入 REVIEW。
6. T006-T007 后续继续复用 T003 壳、T004 已接入的门店入口结构和 `@prototype/shared`；T006 应复用 `EXPERIENCE-8888-01` / `CARE-8888` 跨端凭证，不另造同义数据。
7. 由 T013 串联三条主流程并核对 AC-001 至 AC-010，再将 T001 推进到 REVIEW。
8. 未确认的产品规则在施工中暂停并向用户确认。

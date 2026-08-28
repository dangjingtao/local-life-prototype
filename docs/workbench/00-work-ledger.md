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
| T003 | Mobile 登录、首页与统一账号入口 | Mobile | TODO | 0.1.0 | T002 | 登录/首页/三场景入口与统一用户 ID |
| T004 | Mobile 线下门店自提闭环 | Mobile | TODO | 0.1.0 | T002、T003 | FR-101 至 FR-106；自提到核销 |
| T005 | Mobile 线上商城一件代发闭环 | Mobile | TODO | 0.1.0 | T002、T003 | FR-201 至 FR-206；商城到订单详情 |
| T006 | Mobile 智慧抗衰体验闭环 | Mobile | TODO | 0.1.0 | T002、T003 | FR-301 至 FR-307；领券到基础报告 |
| T007 | Mobile 会员、积分与权益中心 | Mobile | TODO | 0.1.0 | T002、T003 | FR-401 至 FR-406；积分与券状态 |
| T008 | PC 工作台框架、角色与权限 | PC | TODO | 0.1.0 | T002 | 三类角色入口和权限边界 |
| T009 | PC 店主与合作商工作台 | PC | TODO | 0.1.0 | T002、T008 | FR-501 至 FR-504；订单与核销 |
| T010 | PC 平台运营中台 | PC | TODO | 0.1.0 | T002、T008 | FR-601 至 FR-606；六类管理模块 |
| T011 | PC 数据驾驶舱 | PC | TODO | 0.1.0 | T002、T008 | FR-701 至 FR-706；经营指标与场景对比 |
| T012 | 关键状态、可访问性与原型质量 | QA / Shared | TODO | 0.1.0 | T003-T011 | 五态、恢复路径与多视口质量检查 |
| T013 | 跨端演示串联与 V0.1 验收准备 | Review / Docs | TODO | 0.1.0 | T002-T012 | AC-001 至 AC-010 证据与 T001 REVIEW 准备 |

## 状态约定

- `TODO`：目标与范围已足够进入施工，但尚未开始
- `DOING`：正在施工
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
- 风险与依赖
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

1. T002 已完成；以 `@prototype/shared` 作为后续跨端语义和演示数据基线。
2. 可并行推进 Mobile 的 T003-T007 与 PC 的 T008-T011；其中 T004-T007 仍需各自满足 T003 前置，T009-T011 仍需满足 T008 前置。
3. 页面完成后执行 T012 五态、可访问性和多视口质量检查。
4. 由 T013 串联三条主流程并核对 AC-001 至 AC-010，再将 T001 推进到 REVIEW。
5. 未确认的产品规则在施工中暂停并向用户确认。

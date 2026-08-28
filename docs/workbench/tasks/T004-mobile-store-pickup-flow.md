# T004 · Mobile 线下门店自提闭环

- Status: REVIEW
- Target version: 0.1.0
- Impact: Mobile / Shared
- Owner: Mira

## Background

门店自提是三条 P0 核心演示流程之一，需要从选店到核销和私域承接形成连续动线。

## Goal

完成门店列表、门店详情、商品、自提确认、自提凭证和核销结果的可点击流程。

## Product facts

- 门店载体可包括便利店、养生馆、洗护店和会所。
- 流程为选店/商品、提交订单、自提凭证、到店核销、奖励与私域承接。
- V0.1 不接真实库存、支付或核销系统。

## Scope

- FR-101 至 FR-106。
- 门店距离、营业状态、自提/服务能力与商品权益展示。
- 自提订单、提货码、核销结果、积分/赠品概念反馈。

## Out of scope

- 定位 SDK、真实支付、库存锁定、扫码器和门店系统接入。

## Acceptance

- [x] 自提主流程从门店入口连续到核销结果。
- [x] 订单、提货码和核销关联同一用户与门店。
- [x] 多载体表达不被限定为便利店。
- [ ] 完成 390px 视觉与交互检查。
- [x] `npm run build:mobile` 通过。

## Risks / Dependencies

- 前置：T002、T003。
- 风险：奖励值仅为演示占位，不得固化积分规则。

## Implementation record

- Commit / PR: `7946292f1b90dae65c8a31dbafcbed03a408d118` (`feat: complete T004 mobile store pickup flow`)
- Changed paths:
  - `apps/mobile/src/App.tsx`
- Notes:
  - 在 T003 的“门店”入口内接入完整 T004 自提子流程，不改变商城、智慧抗衰和会员中心边界。
  - 门店列表直接消费 T002 `stores` / `partners`，展示距离、营业状态、自提 / 检测 / 服务能力和合作载体类型。
  - 当前 fixtures 同时展示便利店“云岭社区店”和会所“南岸生活馆”，页面结构不把线下门店限定为便利店；养生馆 / 洗护店继续由同一载体映射结构支持。
  - 核心连续演示链固定复用 T002 稳定数据：`LL-8888` → `LL-1024` → `STORE-YUNLING` → `REDEEM-LL-1024`，避免端侧另造冲突订单 / 核销数据。
  - 核心门店详情支持选择共享商品、自提确认、提交演示订单、显示提货码、模拟店员核销、核销完成反馈和私域承接入口。
  - 非核心门店允许浏览门店详情、载体与商品结构，但明确提示核心订单 / 核销数据链仍绑定云岭社区店，不伪造第二套共享订单。
  - 到店奖励只表达“积分 / 赠品 / 优惠券”候选反馈，不固定积分数值或成本承担规则。
  - 全流程明确不接真实定位、支付、库存、扫码器、门店核销或积分发放系统。

## Verification evidence

- CI: GitHub Actions `Verify Prototype #11`，run `33134899859`，conclusion `success`；对应 head SHA `7946292f1b90dae65c8a31dbafcbed03a408d118`。版本合同、全仓 `npm run typecheck`、全仓 `npm run build` 全部通过。
- Page / Route: Mobile dev root `/`；登录 → 首页 → 门店 → 门店列表 → 云岭社区店 → 商品选择 → 自提确认 → 提货凭证 → 模拟核销 → 核销结果 → 私域承接。
- Screenshot / Browser result: 未执行独立 390px 浏览器截图 / 点击录制；现有 Mobile Shell 继续使用 `max-w-[390px]`，实际 390px 视觉与交互检查留给 Review。
- Other evidence:
  - Cloudflare Pages dev preview 部署 run `33134899891` success；Mobile job `98732566735` success，实际执行 `npm run build --workspace @prototype/mobile`（`tsc + vite build`）。Cloudflare Pages 项目命名已于 2026-08-28 统一迁移，当前 canonical dev preview 为 `https://dev.local-life-mobile.pages.dev`。
  - 提货凭证显示订单 `LL-1024` 与核销 code `LL-1024`；两者均关联用户 `LL-8888` 与门店 `STORE-YUNLING`。
  - 本地隔离容器尝试 clone 仓库用于额外视觉验证时因环境无法解析 `github.com` DNS 失败，因此未将其计为验证证据。

## Status history

- 2026-08-28 `TODO → DOING`：用户在 T003 进入 REVIEW 后明确要求“继续004开发”；以已通过 CI 的 T003 功能壳作为施工基线继续 T004，未等待 T003 视觉 PASS。
- 2026-08-28 `DOING → REVIEW`：自提闭环代码提交完成，Verify Prototype #11 与 Cloudflare dev preview 均成功；390px 实际视觉 / 交互检查留给 Reviewer。

## Review

- Reviewer: Tomz
- Result: REVIEW
- Conclusion: FR-101 至 FR-106 的主要概念能力、自提连续动线、统一数据关联和多载体表达已落地并通过 CI；等待 390px 实际视觉与交互检查后决定 PASS / BLOCKED。
- Follow-up: 视觉验收时重点检查门店列表信息密度、商品选择态、自提凭证提货码可读性、核销完成反馈与底部导航在 390px 下是否遮挡；后续 T005-T007 继续复用 T003 壳和 T002 shared 数据。

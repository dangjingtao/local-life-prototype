# T042 · Mobile 社群基础入口

- Status: PASS
- Target version: 0.3.0
- Type: Mobile / Private-domain
- Predecessors: T034
- Related PRD: R04

## Unique deliverable

只完成“我的 → 加入社群 → 社群指引页”的常驻入口与页面，不做支付 / 取货后的主动提示。

## Changed paths whitelist

- `apps/mobile/src/MembershipCenterScreen.tsx`
- 如现有 App 路由需要独立页面挂载，可最小修改 `apps/mobile/src/App.tsx`
- 新增一个明确命名的社群指引页面文件（如 `apps/mobile/src/CommunityGuideScreen.tsx`）
- `tests/browser/t042-mobile-community-entry.spec.mjs`

## Out of scope

- 不做消费后条幅（T043）。
- 不接真实企业微信 API。
- 不做社群 CMS。
- 不修改积分 / 订单 / 核销状态。
- 不把社群做成新的一级 Tab。

## Acceptance

- [x] “我的”存在常驻“加入社群”入口。
- [x] 点击可进入社群指引页并可正常返回。
- [x] 页面展示二维码 Mock。
- [x] 页面展示专属优惠、上新通知、直播优惠三类权益。
- [x] 页面清楚表达长按识别 / 保存图片能力，不伪装真实活码接口。
- [x] 常驻入口不受 7 天频控状态影响。
- [x] 390×844 页面无溢出，正常路径无 Mock / fixture 工程术语泄漏。
- [x] typecheck / build / browser test 通过。

## Evidence required

至少保留“我的入口”和“社群指引页”两张 390×844 实屏证据。


## Execution baseline

- Branch: `task/T042-mobile-community-entry`
- Started from latest `dev` after T041 PASS.
- Consume Shared `getCommunityForStore(coreDemoUser.usualStoreId)`; no duplicate community fixture.
- Business paths frozen to MembershipCenter + App route + new CommunityGuideScreen.
- T043 post-purchase nudge / 7-day trigger is explicitly not implemented here.


## Implementation record

- PR: #41 `feat(T042): add persistent community entry and guide`
- Reviewed implementation head: `b76ebb112c56e706784a3eb1951b4a24e4a09d1d`
- Business paths:
  - `apps/mobile/src/MembershipCenterScreen.tsx`
  - `apps/mobile/src/App.tsx`
  - `apps/mobile/src/CommunityGuideScreen.tsx`
- Shared unchanged; T043 post-purchase nudge / 7-day frequency control not implemented.

### Delivered behavior

- “我的”新增常驻“加入社群”入口，不受消费后提示频控影响。
- 独立社群指引页消费 Shared `getCommunityForStore`，使用 `COMMUNITY-YUNLING-DEMO` / `community-yunling-demo`。
- 页面展示 Shared 三类权益：专属优惠、上新通知、直播优惠。
- 页面展示稳定二维码示意，表达长按识别 / 保存图片；保存动作实际导出 SVG。
- 消费者文案明确二维码当前仅用于界面演示、暂不能实际入群，不伪装企业微信活码服务。
- 社群页保持“我的”为当前一级 Tab，不新增社群一级导航。
- “我的”页一处历史 `fixture` 消费者文案已清理。

## Review / verification

- Verify Prototype #34029073161: **success**，version / typecheck / build 全绿。
- T012 Browser Quality #34029073148: **120 passed / 8 failed（128 total）**。
  - T042 专项 **4/4 passed**。
  - 390×844 两张实屏证据由专项生成：`01-my-community-entry.png`、`02-community-guide.png`。
  - 剩余 8 项均为进入 T042 前已存在的 T017 / T018 / T032 checkout 基线债。
- Codex：1×P2“community 独立页继承 main pt-5 导致顶部下沉”复核成立；已把 community 纳入 zero-padding dedicated layout，并补 topbar `y <= 1` 几何断言；thread resolved。
- CodeRabbit：1×Major“QR 使用硬编码颜色”复核成立；屏幕 QR 改为 design tokens，下载 SVG 从同一 token 解析颜色；最新 review **success / No actionable comments**，0 unresolved thread。
- Self review：Shared community 单一真相源、T043 范围隔离、一级导航边界、消费者术语与 390×844 均复核，无剩余阻塞。

## Review

- Result: PASS
- Conclusion: T042 AC 满足；latest-head Verify success、专项 4/4、两项 AI review finding 均修复并 resolve。2026-09-06 按用户既有授权由 Mira 自审验收；PR #41 squash merge `27b717bd36427a018152a1df4605335073e908af`。T043 前置已满足。

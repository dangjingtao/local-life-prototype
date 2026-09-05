# T042 · Mobile 社群基础入口

- Status: TODO
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

- [ ] “我的”存在常驻“加入社群”入口。
- [ ] 点击可进入社群指引页并可正常返回。
- [ ] 页面展示二维码 Mock。
- [ ] 页面展示专属优惠、上新通知、直播优惠三类权益。
- [ ] 页面清楚表达长按识别 / 保存图片能力，不伪装真实活码接口。
- [ ] 常驻入口不受 7 天频控状态影响。
- [ ] 390×844 页面无溢出，正常路径无 Mock / fixture 工程术语泄漏。
- [ ] typecheck / build / browser test 通过。

## Evidence required

至少保留“我的入口”和“社群指引页”两张 390×844 实屏证据。

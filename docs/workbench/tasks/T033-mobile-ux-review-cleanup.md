# T033 · Mobile 顶栏、首页搜索与商城语义收口

- Status: DOING
- Target version: 0.2.0
- Impact: Mobile / UX / QA
- Owner: Mira

## Background

V0.2 动线评审中，用户明确提出三条消费者侧 UX 修订：

1. 首页搜索入口重复：保留顶栏右侧全局搜索图标，删除首页内容区的大搜索框。
2. Mobile 顶栏去掉 `LOCAL LIFE · V0.2 PREVIEW` 等英文 / 调试表述；汉字页面标题独占一行并垂直居中。
3. 商城频道全程不得出现线下“门店”概念；商城只表达线上店铺 / 来源、全国快递、包邮、物流等商城语义。

本卡只处理以上评审结论，不扩展其它 V0.2 功能。

## Product facts

- 全局搜索能力继续保留，只减少首页重复入口。
- 顶栏只承担当前页面汉字标题和必要操作，不展示版本 / Preview 调试文案。
- 商城与便利店履约语义继续严格隔离。
- 商城允许消费者化的“店铺 / 来源”表达，但不得出现当前门店、门店库存、到店自提、3 km 短配、门店配送等线下履约概念。

## Scope

- `apps/mobile/src/App.tsx`
  - 删除正常登录后全局顶栏英文 Preview 眉题。
  - 汉字标题独占一行并在顶栏垂直居中。
  - 保留右侧全局搜索与活动入口。
- `apps/mobile/src/V02HomeScreen.tsx`
  - 删除首页内容区的大搜索框。
  - 保留顶栏全局搜索入口。
  - 不改变首页其它运营模块和活动搜索 CTA。
- Mall regression
  - 五屏 Mall Home / Detail / Cart / Checkout / Order 均锁定不得出现线下门店履约语义。

## Acceptance

- [ ] 首页正常态只有一个“打开全局搜索”入口，即顶栏搜索图标。
- [ ] 首页内容区不再出现“搜索便利店、商城、智慧抗衰或活动”大搜索框。
- [ ] 正常登录后全局顶栏不出现 `LOCAL LIFE · V0.2 PREVIEW`。
- [ ] 顶栏汉字标题独占单行且保持可读、垂直居中。
- [ ] Mall Home / Detail / Cart / Checkout / Order 页面主体不出现“门店 / 当前门店 / 到店自提 / 3km / 短配 / 门店配送”等线下履约语义。
- [ ] T016 首页 / 搜索回归通过。
- [ ] T019-R5 商城五屏回归通过。
- [ ] Verify Prototype 通过。

## Out of scope

- 不修改登录页的原型边界说明。
- 不改变商城 Storefront / Channel 数据模型。
- 不改便利店自身的门店语义。
- 不处理本轮动线评审中的 PC 后台、我的订单 / 我的预约等其它缺口。

## Review

- Reviewer: pending
- Result: DOING
- Conclusion: 用户评审结论已转为单卡施工；完成 CI / 浏览器回归后进入 REVIEW。

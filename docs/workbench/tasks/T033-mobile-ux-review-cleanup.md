# T033 · Mobile 顶栏、首页搜索与商城语义收口

- Status: REVIEW
- Target version: 0.2.0
- Impact: Mobile / UX / QA
- Owner: Mira

## Background

V0.2 动线评审中，用户明确提出消费者侧 UX 修订：

1. 首页搜索入口重复：保留顶栏右侧全局搜索图标，删除首页内容区的大搜索框。
2. Mobile 顶栏去掉 `LOCAL LIFE · V0.2 PREVIEW` 等英文 / 调试表述；汉字页面标题独占一行并垂直居中。
3. 商城频道不得出现便利店式线下“门店”履约语义。
4. PR #27 合入 `dev` 后，用户在实际预览中进一步明确否决商城首页“精选店铺 / 官方商城 / 合作渠道”模块：消费端不应承担 Storefront / Channel 选择心智，商城前台删除“店铺 / 来源”概念。

第 4 条是对第 3 条的产品语义修正，以用户最新明确结论为准。

## Product facts

- 全局搜索能力继续保留，只减少首页重复入口。
- 顶栏只承担当前页面汉字标题和必要操作，不展示版本 / Preview 调试文案。
- 商城与便利店履约语义继续严格隔离。
- **商城消费端不展示店铺、来源、Storefront / Channel 切换。**
- Storefront / Channel 仍可保留在 Shared 数据模型和后续 PC 运营后台，用于内部渠道组织；不得直接转化为消费者侧“选店”交互。
- 商城消费端只表达商品、活动、搜索、优惠、全国快递、包邮、购物车、结算与物流。

## Scope

- `apps/mobile/src/App.tsx`
  - 删除正常登录后全局顶栏英文 Preview 眉题。
  - 汉字标题独占一行并在顶栏垂直居中。
  - 保留右侧全局搜索与活动入口。
- `apps/mobile/src/V02HomeScreen.tsx`
  - 删除首页内容区的大搜索框。
  - 保留顶栏全局搜索入口。
  - 不改变首页其它运营模块和活动搜索 CTA。
- Mall frontend
  - 首页删除“精选店铺 / 官方商城 / 合作渠道”选择模块。
  - 商品详情删除来源标签。
  - 购物车删除来源条。
  - 结算与订单删除“店铺来源”行。
  - 五屏 Mall Home / Detail / Cart / Checkout / Order 增加店铺概念硬回归。

## Acceptance

- [x] 首页正常态只有一个“打开全局搜索”入口，即顶栏搜索图标。
- [x] 首页内容区不再出现“搜索便利店、商城、智慧抗衰或活动”大搜索框。
- [x] 正常登录后全局顶栏不出现 `LOCAL LIFE · V0.2 PREVIEW`。
- [x] 顶栏汉字标题独占单行且保持可读、垂直居中。
- [x] 商城首页不展示“精选店铺”、商城切换按钮或“几家可选”。
- [x] 商品详情 / 购物车 / 结算 / 订单不展示“官方商城 / 合作渠道专场 / 店铺来源”等 Storefront / Channel 消费端文案。
- [x] Mall Home / Detail / Cart / Checkout / Order 五屏逐文本节点硬门禁覆盖“门店 / 店铺 / 官方商城 / 合作渠道专场 / 到店自提 / 3km / 短配”等概念。
- [ ] T016 首页 / 搜索回归在 PR #28 final head 通过。
- [ ] T019 / R1-R5 商城回归在 PR #28 final head 通过。
- [ ] Verify Prototype 在 PR #28 final head 通过。

## Out of scope

- 不修改登录页的原型边界说明。
- 不删除 Shared / PC 后台需要的 Storefront / Channel 数据模型。
- 不改便利店自身的门店语义。
- 不处理本轮动线评审中的 PC 后台、我的订单 / 我的预约等其它缺口。

## Review

- Reviewer: user visual correction / Mira implementation review / CI pending
- Result: REVIEW
- Conclusion: PR #27 已合入 `dev`，但用户实际预览明确否决商城“精选店铺”模块。PR #28 按最新产品结论移除商城消费端全部显式店铺 / 来源心智，并重写商城五屏回归；等待 final head Verify / Browser / review 后合入 `dev`。

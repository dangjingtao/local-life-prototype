import { expect, test } from "@playwright/test";

const MOBILE = "http://127.0.0.1:4173";
const TOLERANCE = 4;

async function openMall(page) {
  await page.goto(`${MOBILE}/?demoAuth=1`);
  await page.getByRole("navigation", { name: "一级导航" }).getByRole("button", { name: "商城", exact: true }).click();
  await expect(page.getByRole("heading", { name: "线上商城", exact: true })).toBeVisible();
}

async function openCheckoutWithTwoProducts(page) {
  await openMall(page);
  const products = page.getByRole("button", { name: /查看商品：/ });
  await products.nth(0).click();
  await page.getByRole("button", { name: "加入购物车", exact: true }).click();
  await page.getByRole("button", { name: "返回商城", exact: true }).click();
  await page.getByRole("button", { name: /查看商品：/ }).nth(1).click();
  await page.getByRole("button", { name: "立即购买", exact: true }).click();
  await page.getByRole("button", { name: "去结算", exact: true }).click();
  await expect(page.getByTestId("mall-checkout")).toBeVisible();
}

async function expectHeight(locator, expected) {
  const box = await locator.boundingBox();
  expect(box).not.toBeNull();
  expect(Math.abs(box.height - expected), JSON.stringify(box)).toBeLessThanOrEqual(TOLERANCE);
}

async function expectSize(locator, width, height) {
  const box = await locator.boundingBox();
  expect(box).not.toBeNull();
  expect(Math.abs(box.width - width), JSON.stringify(box)).toBeLessThanOrEqual(TOLERANCE);
  expect(Math.abs(box.height - height), JSON.stringify(box)).toBeLessThanOrEqual(TOLERANCE);
}

async function expectNoHorizontalOverflow(page) {
  const metrics = await page.evaluate(() => ({
    viewport: window.innerWidth,
    html: document.documentElement.scrollWidth,
    body: document.body.scrollWidth,
  }));
  expect(Math.max(metrics.html, metrics.body), JSON.stringify(metrics)).toBeLessThanOrEqual(metrics.viewport + 1);
}

async function expectPrototypeClearOfButton(page, button) {
  const panel = page.locator("details").filter({ has: page.locator('summary[aria-label^="Prototype ·"]') }).last();
  const panelBox = await panel.boundingBox();
  const buttonBox = await button.boundingBox();
  expect(panelBox).not.toBeNull();
  expect(buttonBox).not.toBeNull();
  const separated = panelBox.y + panelBox.height <= buttonBox.y - 8 || panelBox.x >= buttonBox.x + buttonBox.width + 8 || panelBox.x + panelBox.width <= buttonBox.x - 8;
  expect(separated, JSON.stringify({ panelBox, buttonBox })).toBeTruthy();
}

test.describe("T019-R4 · mall checkout and order approved UI", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("checkout keeps consumer hierarchy without storefront/source rows", async ({ page }) => {
    await openCheckoutWithTwoProducts(page);

    await expect(page.getByRole("navigation", { name: "一级导航" })).toHaveCount(0);
    await expect(page.getByText("LOCAL LIFE · V0.2 PREVIEW", { exact: true })).toHaveCount(0);

    await expectHeight(page.getByTestId("mall-checkout-topbar"), 52);
    await expectHeight(page.getByTestId("mall-checkout-address"), 104);
    await expectHeight(page.getByTestId("mall-checkout-fulfillment"), 78);

    const items = page.getByTestId("mall-checkout-item");
    expect(await items.count()).toBeGreaterThanOrEqual(2);
    await expectHeight(items.nth(0), 72);
    await expectHeight(items.nth(1), 72);
    await expectSize(items.nth(0).getByRole("img"), 56, 56);

    await expectHeight(page.getByTestId("mall-checkout-amounts"), 132);
    await expectHeight(page.getByTestId("mall-checkout-submitbar"), 72);

    const checkout = page.getByTestId("mall-checkout");
    await expect(checkout).toContainText("收货地址");
    await expect(checkout).toContainText("全国快递 · 送货上门");
    await expect(checkout).toContainText("订单备注");
    await expect(checkout).toContainText("应付金额");
    await expect(checkout).not.toContainText(/店铺来源|精选店铺|官方商城|合作渠道专场/i);
    await expect(checkout).not.toContainText(/T019|Mock|演示数据|不发起真实支付|Storefront|Channel|外部平台/i);

    await expectPrototypeClearOfButton(page, page.getByRole("button", { name: "提交订单", exact: true }));
    await expectNoHorizontalOverflow(page);
  });

  test("order keeps logistics hierarchy without storefront/source rows", async ({ page }) => {
    await openCheckoutWithTwoProducts(page);
    await page.getByRole("button", { name: "提交订单", exact: true }).click();

    await expect(page.getByTestId("mall-order")).toBeVisible();
    await expect(page.getByRole("navigation", { name: "一级导航" })).toHaveCount(0);
    await expect(page.getByText("LOCAL LIFE · V0.2 PREVIEW", { exact: true })).toHaveCount(0);

    await expectHeight(page.getByTestId("mall-order-topbar"), 52);
    await expectHeight(page.getByTestId("mall-order-hero"), 112);
    await expectHeight(page.getByTestId("mall-order-number"), 44);
    await expectHeight(page.getByTestId("mall-order-progress"), 72);
    await expectHeight(page.getByTestId("mall-order-logistics"), 228);
    await expectHeight(page.getByTestId("mall-order-info"), 108);
    await expectHeight(page.getByTestId("mall-order-actionbar"), 72);

    const order = page.getByTestId("mall-order");
    await expect(order).toContainText("待发货");
    await expect(order).toContainText(/订单编号\s*LL\d+/);
    await expect(order).not.toContainText(/店铺来源|精选店铺|官方商城|合作渠道专场/i);
    await expect(order).not.toContainText(/Mock|MOCK-|T019|演示物流|演示数据|Storefront|Channel/i);
    await expectNoHorizontalOverflow(page);

    await page.getByRole("button", { name: "刷新物流", exact: true }).click();
    await expect(page.getByText("运输中", { exact: true }).first()).toBeVisible();
    await expect(order).toContainText(/安心速运 · AN\d+/);
    await expect(order).toContainText("包裹已离开华南分拨中心");
    await expectNoHorizontalOverflow(page);

    await page.getByRole("button", { name: "确认收货", exact: true }).click();
    await expect(page.getByText("已签收 / 已完成", { exact: true })).toBeVisible();
    const returnButton = page.getByRole("button", { name: "返回商城继续购物", exact: true });
    await expect(returnButton).toBeVisible();
    await expectPrototypeClearOfButton(page, returnButton);
    await expectNoHorizontalOverflow(page);

    await returnButton.click();
    await expect(page.getByRole("button", { name: "商城购物车，共 0 件", exact: true })).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });
});

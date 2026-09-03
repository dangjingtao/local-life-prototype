import { expect, test } from "@playwright/test";

const MOBILE = "http://127.0.0.1:4173";
const TOLERANCE = 4;

async function openMall(page) {
  await page.goto(`${MOBILE}/?demoAuth=1`);
  await page.getByRole("navigation", { name: "一级导航" }).getByRole("button", { name: "商城", exact: true }).click();
  await expect(page.getByRole("heading", { name: "线上商城", exact: true })).toBeVisible();
}

async function openCartWithTwoProducts(page) {
  await openMall(page);
  const products = page.getByRole("button", { name: /查看商品：/ });
  await products.nth(0).click();
  await page.getByRole("button", { name: "加入购物车", exact: true }).click();
  await page.getByRole("button", { name: "返回商城", exact: true }).click();
  await page.getByRole("button", { name: /查看商品：/ }).nth(1).click();
  await page.getByRole("button", { name: "立即购买", exact: true }).click();
  await expect(page.getByTestId("mall-cart")).toBeVisible();
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

test.describe("T019-R3 · mall cart approved UI", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("cart follows Screen C geometry and keeps the primary navigation", async ({ page }) => {
    await openCartWithTwoProducts(page);

    await expect(page.getByText("LOCAL LIFE · V0.2 PREVIEW", { exact: true })).toHaveCount(0);
    const nav = page.getByRole("navigation", { name: "一级导航" });
    await expect(nav).toBeVisible();

    await expectHeight(page.getByTestId("mall-cart-title"), 56);
    await expect(page.getByTestId("mall-cart-source")).toHaveCount(0);

    const rows = page.getByTestId("mall-cart-row");
    expect(await rows.count()).toBeGreaterThanOrEqual(2);
    await expectHeight(rows.nth(0), 128);
    await expectHeight(rows.nth(1), 128);
    await expectSize(rows.nth(0).getByRole("img"), 82, 82);

    const decrement = rows.nth(0).getByRole("button", { name: /^减少/ });
    const increment = rows.nth(0).getByRole("button", { name: /^增加/ });
    await expectHeight(decrement, 44);
    await expectHeight(increment, 44);

    await expectHeight(page.getByTestId("mall-cart-summary"), 116);
    await expectHeight(page.getByTestId("mall-cart-checkoutbar"), 68);
    await expectHeight(nav, 64);

    const checkoutBar = await page.getByTestId("mall-cart-checkoutbar").boundingBox();
    const navBox = await nav.boundingBox();
    expect(checkoutBar).not.toBeNull();
    expect(navBox).not.toBeNull();
    expect(Math.abs(checkoutBar.y + checkoutBar.height - navBox.y), JSON.stringify({ checkoutBar, navBox })).toBeLessThanOrEqual(TOLERANCE);
    expect(Math.abs(navBox.y + navBox.height - 844), JSON.stringify(navBox)).toBeLessThanOrEqual(TOLERANCE);

    const checkoutButton = page.getByRole("button", { name: "去结算", exact: true });
    const prototypePanel = page.locator("details").filter({ hasText: /Prototype ·/ }).last();
    const checkoutButtonBox = await checkoutButton.boundingBox();
    const prototypePanelBox = await prototypePanel.boundingBox();
    expect(checkoutButtonBox).not.toBeNull();
    expect(prototypePanelBox).not.toBeNull();
    expect(prototypePanelBox.y + prototypePanelBox.height, JSON.stringify({ checkoutButtonBox, prototypePanelBox })).toBeLessThanOrEqual(checkoutButtonBox.y - 8);

    const cart = page.getByTestId("mall-cart");
    await expect(cart).toContainText("商品小计");
    await expect(cart).toContainText("预计运费");
    await expect(cart).toContainText("满 ¥99");
    await expect(cart).not.toContainText(/店铺来源|精选店铺|官方商城|合作渠道专场/i);
    await expect(cart).not.toContainText(/Storefront|Channel|Mock|独立购物车模型|不与任何便利店购物车混单/i);
    await expectNoHorizontalOverflow(page);
  });

  test("quantity controls preserve existing cart semantics including zero removal", async ({ page }) => {
    await openMall(page);
    await page.getByRole("button", { name: /查看商品：/ }).first().click();
    await page.getByRole("button", { name: "立即购买", exact: true }).click();

    const row = page.getByTestId("mall-cart-row").first();
    const increment = row.getByRole("button", { name: /^增加/ });
    const decrement = row.getByRole("button", { name: /^减少/ });

    await increment.click();
    await expect(page.getByTestId("mall-cart-title")).toContainText("共 2 件");
    await decrement.click();
    await expect(page.getByTestId("mall-cart-title")).toContainText("共 1 件");
    await decrement.click();

    await expect(page.getByText("购物车还是空的", { exact: true })).toBeVisible();
    await expect(page.getByTestId("mall-cart-checkoutbar")).toHaveCount(0);
    await expectNoHorizontalOverflow(page);
  });

  test("checkout bar hands off without exposing storefront semantics", async ({ page }) => {
    await openMall(page);
    await page.getByRole("button", { name: /查看商品：/ }).first().click();
    await page.getByRole("button", { name: "立即购买", exact: true }).click();

    await page.getByRole("button", { name: "去结算", exact: true }).click();
    const checkout = page.getByTestId("mall-checkout");
    await expect(page.getByRole("heading", { name: "确认收货与订单", exact: true })).toBeVisible();
    await expect(checkout).not.toContainText(/店铺来源|精选店铺|官方商城|合作渠道专场/i);
    await expect(page.getByText(/满 ¥99 包邮|¥8\.00/).first()).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });
});

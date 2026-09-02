import { expect, test } from "@playwright/test";

const MOBILE = "http://127.0.0.1:4173";

async function openApp(page) {
  await page.goto(`${MOBILE}/?demoAuth=1`);
  await expect(page.getByRole("navigation", { name: "一级导航" })).toBeVisible();
}

async function openMall(page) {
  await openApp(page);
  await page.getByRole("navigation", { name: "一级导航" }).getByRole("button", { name: "商城", exact: true }).click();
  await expect(page.getByRole("heading", { name: "线上商城" })).toBeVisible();
}

async function expectNoHorizontalOverflow(page) {
  const metrics = await page.evaluate(() => ({
    viewport: window.innerWidth,
    html: document.documentElement.scrollWidth,
    body: document.body.scrollWidth,
  }));
  expect(Math.max(metrics.html, metrics.body), JSON.stringify(metrics)).toBeLessThanOrEqual(metrics.viewport + 1);
}

test.describe("T019 · Mobile mall medium-high fidelity purchase loop", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("mall exposes multiple consumer-facing sources without convenience fulfillment", async ({ page }) => {
    await openMall(page);

    const storefrontSwitches = page.getByRole("button", { name: /切换商城：/ });
    expect(await storefrontSwitches.count()).toBeGreaterThanOrEqual(2);
    await storefrontSwitches.nth(1).click();
    await expect(storefrontSwitches.nth(1)).toHaveAttribute("aria-pressed", "true");

    await expect(page.getByText("全国快递配送 · 送货上门", { exact: true })).toBeVisible();
    const mallHome = page.getByTestId("mall-home");
    await expect(mallHome).not.toContainText(/Storefront|Channel|Mock|planned|integrationStatus|T019/i);
    await expect(mallHome.getByText("门店自提", { exact: true })).toHaveCount(0);
    await expect(mallHome.getByText(/3\s*公里短配|3\s*km\s*短配/i)).toHaveCount(0);
    await expectNoHorizontalOverflow(page);
  });

  test("global search target opens the actual mall product detail", async ({ page }) => {
    await openApp(page);
    await page.getByRole("button", { name: "打开全局搜索" }).first().click();
    const search = page.getByRole("textbox", { name: "全局搜索" });
    await search.fill("胶原");
    await page.getByRole("button", { name: /线上商城结果：胶原蛋白肽饮/ }).click();

    await expect(page.getByText("来自全局搜索", { exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "胶原蛋白肽饮", exact: true })).toBeVisible();
    await expect(page.getByRole("img", { name: "胶原蛋白肽饮 商品图", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "立即购买", exact: true })).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test("product search and detail show mature mall purchase information", async ({ page }) => {
    await openMall(page);

    const search = page.getByRole("textbox", { name: "商城内搜索" });
    await search.fill("胶原");
    const result = page.getByRole("button", { name: /查看商品：胶原蛋白肽饮/ });
    await expect(result).toBeVisible();
    await result.click();

    await expect(page.getByRole("img", { name: /胶原蛋白肽饮 商品图/ })).toBeVisible();
    await expect(page.getByText("配送与包邮")).toBeVisible();
    await expect(page.getByText(/满 ¥99 包邮/).first()).toBeVisible();
    await expect(page.getByRole("button", { name: "加入购物车", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "立即购买", exact: true })).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test("storefront carts stay isolated and survive leaving the mall tab", async ({ page }) => {
    await openMall(page);

    const storefrontSwitches = page.getByRole("button", { name: /切换商城：/ });
    const firstStorefrontName = await storefrontSwitches.first().getAttribute("aria-label");
    await page.getByRole("button", { name: /查看商品：/ }).first().click();
    await page.getByRole("button", { name: "加入购物车", exact: true }).click();
    await page.getByRole("button", { name: "返回商城", exact: true }).click();
    await expect(page.getByRole("button", { name: "商城购物车，共 1 件", exact: true })).toBeVisible();

    await storefrontSwitches.nth(1).click();
    await expect(page.getByRole("button", { name: "商城购物车，共 0 件", exact: true })).toBeVisible();
    if (firstStorefrontName) {
      await page.getByRole("button", { name: firstStorefrontName, exact: true }).click();
      await expect(page.getByRole("button", { name: "商城购物车，共 1 件", exact: true })).toBeVisible();
    }

    await page.getByRole("navigation", { name: "一级导航" }).getByRole("button", { name: "首页", exact: true }).click();
    await page.getByRole("navigation", { name: "一级导航" }).getByRole("button", { name: "商城", exact: true }).click();
    await expect(page.getByRole("button", { name: "商城购物车，共 1 件", exact: true })).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test("mall cart remains independent and reaches checkout", async ({ page }) => {
    await openMall(page);

    await page.getByRole("button", { name: /查看商品：/ }).first().click();
    await page.getByRole("button", { name: "立即购买", exact: true }).click();

    const cart = page.getByTestId("mall-cart");
    await expect(page.getByRole("heading", { name: "购物车" })).toBeVisible();
    await expect(cart).toContainText("全国快递");
    await expect(cart).not.toContainText(/Storefront|Channel|Mock|不与任何便利店购物车混单|独立购物车模型/i);
    await expect(page.getByText(/预计运费/)).toBeVisible();
    await page.getByRole("button", { name: "去结算", exact: true }).click();

    const checkout = page.getByTestId("mall-checkout");
    await expect(page.getByRole("heading", { name: "确认收货与订单" })).toBeVisible();
    await expect(checkout).toContainText("收货地址");
    await expect(checkout).toContainText("店铺来源");
    await expect(checkout).toContainText("全国快递 · 送货上门");
    await expect(checkout).not.toContainText(/Mock|演示数据|Storefront|Channel|T019/i);
    await expectNoHorizontalOverflow(page);
  });

  test("order consumes its cart and advances through shipment states", async ({ page }) => {
    await openMall(page);

    await page.getByRole("button", { name: /查看商品：/ }).first().click();
    await page.getByRole("button", { name: "立即购买", exact: true }).click();
    await page.getByRole("button", { name: "去结算", exact: true }).click();
    await page.getByRole("button", { name: "提交订单", exact: true }).click();

    const order = page.getByTestId("mall-order");
    await expect(page.getByRole("heading", { name: "订单详情", exact: true })).toBeVisible();
    await expect(order).toContainText(/订单编号\s*LL\d+/);
    await expect(page.getByText("待发货", { exact: true }).first()).toBeVisible();
    await page.getByRole("button", { name: "刷新物流", exact: true }).click();
    await expect(page.getByText("运输中", { exact: true }).first()).toBeVisible();
    await expect(order).toContainText(/安心速运 · AN\d+/);
    await page.getByRole("button", { name: "确认收货", exact: true }).click();
    await expect(page.getByText("已签收 / 已完成", { exact: true })).toBeVisible();
    await expect(order).not.toContainText(/Mock|MOCK-|T019|演示物流|Storefront|Channel/i);

    await page.getByRole("button", { name: "返回商城继续购物", exact: true }).click();
    await expect(page.getByRole("button", { name: "商城购物车，共 0 件", exact: true })).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });
});

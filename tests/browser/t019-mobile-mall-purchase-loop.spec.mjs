import { expect, test } from "@playwright/test";

const MOBILE = "http://127.0.0.1:4173";

async function openMall(page) {
  await page.goto(`${MOBILE}/?demoAuth=1`);
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

  test("mall exposes multiple storefront/channel samples without convenience fulfillment", async ({ page }) => {
    await openMall(page);

    const storefrontSwitches = page.getByRole("button", { name: /切换商城：/ });
    expect(await storefrontSwitches.count()).toBeGreaterThanOrEqual(2);
    await storefrontSwitches.nth(1).click();
    await expect(storefrontSwitches.nth(1)).toHaveAttribute("aria-pressed", "true");

    await expect(page.getByText("全国快递", { exact: true }).first()).toBeVisible();
    await expect(page.getByText(/不与便利店库存或履约混用/)).toBeVisible();
    await expect(page.getByText("门店自提", { exact: true })).toHaveCount(0);
    await expect(page.getByText(/3\s*公里短配|3\s*km\s*短配/i)).toHaveCount(0);
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

  test("mall cart remains independent and reaches checkout", async ({ page }) => {
    await openMall(page);

    await page.getByRole("button", { name: /查看商品：/ }).first().click();
    await page.getByRole("button", { name: "立即购买", exact: true }).click();

    await expect(page.getByRole("heading", { name: "购物车" })).toBeVisible();
    await expect(page.getByText(/不与任何便利店购物车混单/)).toBeVisible();
    await expect(page.getByText(/预计运费/)).toBeVisible();
    await page.getByRole("button", { name: /去结算/ }).click();

    await expect(page.getByRole("heading", { name: "确认收货与订单" })).toBeVisible();
    await expect(page.getByText("收货地址 · 演示数据", { exact: true })).toBeVisible();
    await expect(page.getByText("店铺 / 渠道", { exact: true })).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test("order advances through pending shipment, shipping and signed states", async ({ page }) => {
    await openMall(page);

    await page.getByRole("button", { name: /查看商品：/ }).first().click();
    await page.getByRole("button", { name: "立即购买", exact: true }).click();
    await page.getByRole("button", { name: /去结算/ }).click();
    await page.getByRole("button", { name: "提交演示订单", exact: true }).click();

    await expect(page.getByRole("heading", { name: /MALL-/ })).toBeVisible();
    await expect(page.getByText("待发货", { exact: true }).first()).toBeVisible();
    await page.getByRole("button", { name: "模拟发货", exact: true }).click();
    await expect(page.getByText("运输中", { exact: true }).first()).toBeVisible();
    await expect(page.getByText(/MOCK-SF-20260831/)).toBeVisible();
    await page.getByRole("button", { name: "模拟签收", exact: true }).click();
    await expect(page.getByText("已签收 / 已完成", { exact: true })).toBeVisible();
    await expect(page.getByText("订单已签收", { exact: true })).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });
});

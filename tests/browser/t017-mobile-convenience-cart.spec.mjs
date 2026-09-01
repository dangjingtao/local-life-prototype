import { expect, test } from "@playwright/test";

const MOBILE = "http://127.0.0.1:4173";

async function openConvenience(page) {
  await page.goto(`${MOBILE}/?demoAuth=1`);
  await page.getByRole("navigation", { name: "一级导航" }).getByRole("button", { name: "便利店", exact: true }).click();
  await expect(page.getByRole("heading", { name: "选择购买门店" })).toBeVisible();
}

async function expectNoHorizontalOverflow(page) {
  const metrics = await page.evaluate(() => ({
    viewport: window.innerWidth,
    html: document.documentElement.scrollWidth,
    body: document.body.scrollWidth,
  }));
  expect(Math.max(metrics.html, metrics.body), JSON.stringify(metrics)).toBeLessThanOrEqual(metrics.viewport + 1);
}

test.describe("T017 · Mobile convenience store browsing and independent cart", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("store selection exposes clear fulfillment and closed-store states without internal copy", async ({ page }) => {
    await openConvenience(page);
    await expect(page.getByRole("button", { name: "选择门店：云岭社区店" })).toContainText("约 3 km 短配");
    await expect(page.getByRole("button", { name: "选择门店：南岸生活馆" })).toContainText("约 3 km 短配");

    const closedStore = page.getByRole("button", { name: "门店休息中：星河社区店" });
    await expect(closedStore).toBeDisabled();
    await expect(closedStore).toContainText("当前休息");
    await expect(closedStore).toContainText("当前暂不可下单");

    for (const internalTerm of ["核心演示门店", "当前 0 款可购", "mock", "fixture", "门店上下文"]) {
      await expect(page.getByText(internalTerm, { exact: false })).toHaveCount(0);
    }
    await expectNoHorizontalOverflow(page);
  });

  test("each store keeps a separate cart and switching stores does not mix items", async ({ page }) => {
    await openConvenience(page);
    await page.getByRole("button", { name: "选择门店：云岭社区店" }).click();
    await expect(page.getByRole("heading", { name: "云岭社区店" })).toBeVisible();
    await expect(page.getByRole("button", { name: /打开购物车，3 件商品/ })).toBeVisible();

    await page.getByRole("button", { name: "加入购物车：青柠气泡水" }).click();
    await expect(page.getByRole("button", { name: /打开购物车，4 件商品/ })).toBeVisible();

    await page.getByRole("button", { name: "切换门店" }).click();
    await page.getByRole("button", { name: "选择门店：南岸生活馆" }).click();
    await expect(page.getByRole("button", { name: /打开购物车，1 件商品/ })).toBeVisible();
    await page.getByRole("button", { name: "加入购物车：青柠气泡水" }).click();
    await expect(page.getByRole("button", { name: /打开购物车，2 件商品/ })).toBeVisible();

    await page.getByRole("button", { name: "切换门店" }).click();
    await page.getByRole("button", { name: "选择门店：云岭社区店" }).click();
    await expect(page.getByRole("button", { name: /打开购物车，4 件商品/ })).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test("store and cart continuity survive leaving the convenience tab and returning", async ({ page }) => {
    await openConvenience(page);
    await page.getByRole("button", { name: "选择门店：云岭社区店" }).click();
    await page.getByRole("button", { name: "加入购物车：青柠气泡水" }).click();
    await expect(page.getByRole("button", { name: /打开购物车，4 件商品/ })).toBeVisible();

    const navigation = page.getByRole("navigation", { name: "一级导航" });
    await navigation.getByRole("button", { name: "首页", exact: true }).click();
    await navigation.getByRole("button", { name: "便利店", exact: true }).click();

    await expect(page.getByRole("heading", { name: "云岭社区店" })).toBeVisible();
    await expect(page.getByRole("button", { name: /打开购物车，4 件商品/ })).toBeVisible();
    await expect(page.getByRole("heading", { name: "选择购买门店" })).toHaveCount(0);
    await expectNoHorizontalOverflow(page);
  });

  test("featured convenience campaign is scoped to the configured store", async ({ page }) => {
    await openConvenience(page);
    await page.getByRole("button", { name: "选择门店：云岭社区店" }).click();
    await expect(page.getByRole("button", { name: "查看便利店活动" })).toContainText("早八能量补给");
    await expect(page.getByRole("button", { name: "查看便利店活动" })).not.toContainText(/mock|fixture/i);

    await page.getByRole("button", { name: "切换门店" }).click();
    await page.getByRole("button", { name: "选择门店：南岸生活馆" }).click();
    await expect(page.getByRole("button", { name: "查看便利店活动" })).toHaveCount(0);
  });

  test("product detail uses the selected store price, member price and sellable state", async ({ page }) => {
    await openConvenience(page);
    await page.getByRole("button", { name: "选择门店：云岭社区店" }).click();
    await page.getByRole("button", { name: "查看商品：燕麦拿铁" }).click();
    await expect(page.getByRole("heading", { name: "燕麦拿铁" })).toBeVisible();
    await expect(page.getByText("¥11.90")).toBeVisible();
    await expect(page.getByText("会员价", { exact: true })).toBeVisible();
    await expect(page.getByText("第二件 8 折")).toBeVisible();
    await expect(page.getByText("门店可售上下文", { exact: true })).toHaveCount(0);
    await expect(page.getByText("当前门店", { exact: true })).toBeVisible();

    await page.getByRole("button", { name: "换店" }).click();
    await page.getByRole("button", { name: "选择门店：南岸生活馆" }).click();
    const oat = page.getByRole("button", { name: "查看商品：燕麦拿铁" });
    await expect(oat).toBeVisible();
    await expect(page.getByText("今日售罄")).toBeVisible();
    await expect(page.getByRole("button", { name: "加入购物车：燕麦拿铁" })).toBeDisabled();
  });

  test("cart opens the T018 checkout with fulfillment selection without mixing carts", async ({ page }) => {
    await openConvenience(page);
    await page.getByRole("button", { name: "选择门店：云岭社区店" }).click();
    await page.getByRole("button", { name: /打开购物车，3 件商品/ }).click();
    await expect(page.getByRole("heading", { name: "门店独立购物车" })).toBeVisible();
    await expect(page.getByText("商品合计")).toBeVisible();
    await page.getByRole("button", { name: "去结算" }).click();
    await expect(page.getByRole("heading", { name: "选择履约方式并确认订单" })).toBeVisible();
    await expect(page.getByRole("button", { name: /到店自提/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /约 3 km 短配/ })).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test("checkout stays scoped to the selected store cart", async ({ page }) => {
    await openConvenience(page);
    await page.getByRole("button", { name: "选择门店：云岭社区店" }).click();
    await page.getByRole("button", { name: /打开购物车，3 件商品/ }).click();
    await page.getByRole("button", { name: "去结算" }).click();
    await expect(page.getByText(/云岭社区店 · 结算/)).toBeVisible();
    await expect(page.getByText(/不跨店、不与商城混单/)).toBeVisible();
    await expect(page.getByText(/线上商城/)).toHaveCount(0);
    await expectNoHorizontalOverflow(page);
  });
});

import { expect, test } from "@playwright/test";

const MOBILE = "http://127.0.0.1:4173";
const TOLERANCE = 4;

async function openMallDetail(page, productPattern = /查看商品：/) {
  await page.goto(`${MOBILE}/?demoAuth=1`);
  await page.getByRole("navigation", { name: "一级导航" }).getByRole("button", { name: "商城", exact: true }).click();
  await page.getByRole("button", { name: productPattern }).first().click();
  await expect(page.getByTestId("mall-detail")).toBeVisible();
}

async function expectHeight(locator, expected) {
  const box = await locator.boundingBox();
  expect(box).not.toBeNull();
  expect(Math.abs(box.height - expected), JSON.stringify(box)).toBeLessThanOrEqual(TOLERANCE);
}

async function expectNoHorizontalOverflow(page) {
  const metrics = await page.evaluate(() => ({
    viewport: window.innerWidth,
    html: document.documentElement.scrollWidth,
    body: document.body.scrollWidth,
  }));
  expect(Math.max(metrics.html, metrics.body), JSON.stringify(metrics)).toBeLessThanOrEqual(metrics.viewport + 1);
}

test.describe("T019-R2 · mall product detail approved UI", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("detail follows Screen B geometry and dedicated chrome", async ({ page }) => {
    await openMallDetail(page, /查看商品：胶原蛋白肽饮/);

    await expect(page.getByText("LOCAL LIFE · V0.2 PREVIEW", { exact: true })).toHaveCount(0);
    await expect(page.getByRole("navigation", { name: "一级导航" })).toHaveCount(0);

    await expectHeight(page.getByTestId("mall-detail-topbar"), 48);
    await expectHeight(page.getByRole("img", { name: "胶原蛋白肽饮 商品图", exact: true }), 286);
    await expectHeight(page.getByTestId("mall-detail-main-info"), 132);
    await expectHeight(page.getByTestId("mall-detail-spec"), 44);
    await expectHeight(page.getByTestId("mall-detail-promotion"), 52);
    await expectHeight(page.getByTestId("mall-detail-shipping"), 72);
    await expectHeight(page.getByTestId("mall-detail-coupon"), 76);
    await expectHeight(page.getByTestId("mall-detail-buybar"), 72);

    const buybar = await page.getByTestId("mall-detail-buybar").boundingBox();
    expect(buybar).not.toBeNull();
    expect(Math.abs(buybar.y + buybar.height - 844), JSON.stringify(buybar)).toBeLessThanOrEqual(TOLERANCE);
    await expectHeight(page.getByRole("button", { name: "加入购物车", exact: true }), 48);
    await expectHeight(page.getByRole("button", { name: "立即购买", exact: true }), 48);

    const detail = page.getByTestId("mall-detail");
    await expect(detail).toContainText("30ml × 10 瓶");
    await expect(detail).toContainText("商城包邮");
    await expect(detail).toContainText("配送与包邮");
    await expect(detail).toContainText("满 ¥99 包邮");
    await expect(detail).not.toContainText(/Storefront|Channel|Mock|Shared 未定义|T019|不读取便利店库存/i);
    await expectNoHorizontalOverflow(page);
  });

  test("add-to-cart and buy-now keep the existing storefront cart behavior", async ({ page }) => {
    await openMallDetail(page, /查看商品：胶原蛋白肽饮/);

    await page.getByRole("button", { name: "加入购物车", exact: true }).click();
    await expect(page.getByRole("button", { name: "商城购物车，共 1 件", exact: true })).toBeVisible();
    await page.getByRole("button", { name: "返回商城", exact: true }).click();
    await expect(page.getByRole("button", { name: "商城购物车，共 1 件", exact: true })).toBeVisible();

    await page.getByRole("button", { name: /查看商品：胶原蛋白肽饮/ }).click();
    await page.getByRole("button", { name: "立即购买", exact: true }).click();
    await expect(page.getByRole("heading", { name: "购物车", exact: true })).toBeVisible();
    await expect(page.getByText("胶原蛋白肽饮", { exact: true }).first()).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test("global search still hands off directly into the consumer detail", async ({ page }) => {
    await page.goto(`${MOBILE}/?demoAuth=1`);
    await page.getByRole("button", { name: "打开全局搜索" }).first().click();
    const search = page.getByRole("textbox", { name: "全局搜索" });
    await search.fill("胶原");
    await page.getByRole("button", { name: /线上商城结果：胶原蛋白肽饮/ }).click();

    const detail = page.getByTestId("mall-detail");
    await expect(detail).toBeVisible();
    await expect(detail).toContainText("来自全局搜索");
    await expect(detail.getByRole("heading", { name: "胶原蛋白肽饮", exact: true })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "一级导航" })).toHaveCount(0);
    await expectNoHorizontalOverflow(page);
  });
});

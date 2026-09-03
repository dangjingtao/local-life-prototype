import { mkdir } from "node:fs/promises";
import { expect, test } from "@playwright/test";

const MOBILE = "http://127.0.0.1:4173";
const EVIDENCE_DIR = "test-results/t019-r5-visual-evidence";
const OFFLINE_STORE_TERMS = /门店|到店自提|3\s*km|短配|门店配送|当前门店/i;

async function screenshot(page, filename) {
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(120);
  await page.screenshot({ path: `${EVIDENCE_DIR}/${filename}`, fullPage: false });
}

async function expectNoHorizontalOverflow(page) {
  const metrics = await page.evaluate(() => ({
    viewport: window.innerWidth,
    html: document.documentElement.scrollWidth,
    body: document.body.scrollWidth,
  }));
  expect(Math.max(metrics.html, metrics.body), JSON.stringify(metrics)).toBeLessThanOrEqual(metrics.viewport + 1);
}

test.describe("T019-R5 · five-screen independent visual review evidence", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test.beforeAll(async () => {
    await mkdir(EVIDENCE_DIR, { recursive: true });
  });

  test("captures the canonical Home → Detail → Cart → Checkout → Order chain", async ({ page }) => {
    await page.goto(`${MOBILE}/?demoAuth=1`);
    await page.getByRole("navigation", { name: "一级导航" }).getByRole("button", { name: "商城", exact: true }).click();

    const home = page.getByTestId("mall-home");
    await expect(home).toBeVisible();
    await expect(home).not.toContainText(/Storefront|Channel|Mock|T019|演示数据/i);
    await expect(home).not.toContainText(OFFLINE_STORE_TERMS);
    await expectNoHorizontalOverflow(page);
    await screenshot(page, "01-home.png");

    const products = page.getByRole("button", { name: /查看商品：/ });
    await products.first().click();
    const detail = page.getByTestId("mall-detail");
    await expect(detail).toBeVisible();
    await expect(page.getByRole("navigation", { name: "一级导航" })).toHaveCount(0);
    await expect(detail).not.toContainText(/Storefront|Channel|Mock|T019|演示数据/i);
    await expect(detail).not.toContainText(OFFLINE_STORE_TERMS);
    await expectNoHorizontalOverflow(page);
    await screenshot(page, "02-detail.png");

    await page.getByRole("button", { name: "加入购物车", exact: true }).click();
    await page.getByRole("button", { name: "返回商城", exact: true }).click();
    await page.getByRole("button", { name: /查看商品：/ }).nth(1).click();
    await page.getByRole("button", { name: "立即购买", exact: true }).click();

    const cart = page.getByTestId("mall-cart");
    await expect(cart).toBeVisible();
    await expect(page.getByRole("navigation", { name: "一级导航" })).toBeVisible();
    await expect(cart).not.toContainText(/Storefront|Channel|Mock|T019|演示数据/i);
    await expect(cart).not.toContainText(OFFLINE_STORE_TERMS);
    await expectNoHorizontalOverflow(page);
    await screenshot(page, "03-cart.png");

    await page.getByRole("button", { name: "去结算", exact: true }).click();
    const checkout = page.getByTestId("mall-checkout");
    await expect(checkout).toBeVisible();
    await expect(page.getByRole("navigation", { name: "一级导航" })).toHaveCount(0);
    await expect(checkout).toContainText("全国快递 · 送货上门");
    await expect(checkout).not.toContainText(/Storefront|Channel|Mock|T019|演示数据/i);
    await expect(checkout).not.toContainText(OFFLINE_STORE_TERMS);
    await expectNoHorizontalOverflow(page);
    await screenshot(page, "04-checkout.png");

    await page.getByRole("button", { name: "提交订单", exact: true }).click();
    const order = page.getByTestId("mall-order");
    await expect(order).toBeVisible();
    await expect(page.getByRole("navigation", { name: "一级导航" })).toHaveCount(0);
    await expect(order).toContainText("待发货");
    await expect(order).not.toContainText(/Storefront|Channel|Mock|T019|演示数据/i);
    await expect(order).not.toContainText(OFFLINE_STORE_TERMS);
    await expectNoHorizontalOverflow(page);
    await screenshot(page, "05-order.png");
  });
});

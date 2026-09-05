import { expect, test } from "@playwright/test";

const MOBILE = "http://127.0.0.1:4173";

async function openYunling(page) {
  await page.goto(`${MOBILE}/?demoAuth=1`);
  await page.getByRole("navigation", { name: "一级导航" }).getByRole("button", { name: "便利店", exact: true }).click();
  await expect(page.getByRole("heading", { name: "选择购买门店" })).toBeVisible();
  await page.getByRole("button", { name: "选择门店：云岭社区店" }).click();
  await expect(page.getByRole("button", { name: /切换门店，当前门店：云岭社区店/ })).toBeVisible();
}

async function expectNoHorizontalOverflow(page) {
  const metrics = await page.evaluate(() => ({
    viewport: window.innerWidth,
    html: document.documentElement.scrollWidth,
    body: document.body.scrollWidth,
  }));
  expect(Math.max(metrics.html, metrics.body), JSON.stringify(metrics)).toBeLessThanOrEqual(metrics.viewport + 1);
}

test.describe("T035 · convenience continuous browse", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("renders category sections continuously with single before combo and no mode filter", async ({ page }) => {
    await openYunling(page);

    await expect(page.getByRole("button", { name: "单品", exact: true })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "套餐", exact: true })).toHaveCount(0);

    const sections = page.getByTestId("convenience-continuous-sections").locator(":scope > section");
    await expect(sections).toHaveCount(4);
    await expect(sections.nth(0)).toHaveAttribute("data-testid", "convenience-section-CONV-CAT-DRINKS");
    await expect(sections.nth(1)).toHaveAttribute("data-testid", "convenience-section-CONV-CAT-FRESH");
    await expect(sections.nth(2)).toHaveAttribute("data-testid", "convenience-section-CONV-CAT-DAILY");
    await expect(sections.nth(3)).toHaveAttribute("data-testid", "convenience-section-CONV-CAT-LIFESTYLE");

    const fresh = page.getByTestId("convenience-section-CONV-CAT-FRESH");
    const freshOrder = await fresh.locator("[data-product-id]").evaluateAll((nodes) => nodes.map((node) => node.getAttribute("data-product-id")));
    expect(freshOrder).toEqual(["PRODUCT-EGG-SANDWICH", "PRODUCT-BREAKFAST-COMBO"]);

    const allProductIds = await page.locator("[data-product-id]").evaluateAll((nodes) => nodes.map((node) => node.getAttribute("data-product-id")));
    expect(new Set(allProductIds).size).toBe(allProductIds.length);

    await expectNoHorizontalOverflow(page);
  });

  test("one scroll surface reaches combo and the next category in both directions", async ({ page }) => {
    await openYunling(page);

    const scroll = page.getByTestId("convenience-product-scroll");
    const freshSingle = page.getByTestId("convenience-segment-CONV-CAT-FRESH-single");
    const freshCombo = page.getByTestId("convenience-segment-CONV-CAT-FRESH-combo");
    const daily = page.getByTestId("convenience-section-CONV-CAT-DAILY");

    await freshSingle.scrollIntoViewIfNeeded();
    await expect(freshSingle).toBeVisible();
    await page.screenshot({ path: "test-results/t035-visual-evidence/01-fresh-single-tail.png", fullPage: false });

    await freshCombo.scrollIntoViewIfNeeded();
    await expect(freshCombo).toBeVisible();
    await expect(freshCombo.getByRole("button", { name: "查看商品：早餐能量组合" })).toBeVisible();
    await page.screenshot({ path: "test-results/t035-visual-evidence/02-single-to-combo.png", fullPage: false });

    await daily.scrollIntoViewIfNeeded();
    await expect(daily.getByRole("heading", { name: "日用洗护" })).toBeVisible();
    await page.screenshot({ path: "test-results/t035-visual-evidence/03-next-category.png", fullPage: false });

    const downward = await scroll.evaluate((node) => node.scrollTop);
    expect(downward).toBeGreaterThan(0);

    await scroll.evaluate((node) => { node.scrollTop = 0; });
    await expect.poll(() => scroll.evaluate((node) => node.scrollTop)).toBe(0);
    await expect(page.getByTestId("convenience-section-CONV-CAT-DRINKS").getByRole("heading", { name: "饮料" })).toBeVisible();
  });

  test("search stays flat and does not duplicate products across continuous sections", async ({ page }) => {
    await openYunling(page);

    const search = page.getByRole("textbox", { name: "搜索当前门店商品" });
    await search.fill("燕麦");

    const results = page.getByTestId("convenience-search-results");
    await expect(results).toBeVisible();
    await expect(page.getByTestId("convenience-continuous-sections")).toHaveCount(0);

    const ids = await results.locator("[data-product-id]").evaluateAll((nodes) => nodes.map((node) => node.getAttribute("data-product-id")));
    expect(ids).toEqual(["PRODUCT-OAT-LATTE", "PRODUCT-BREAKFAST-COMBO"]);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test("continuous list preserves product detail, add-to-cart and cart sheet", async ({ page }) => {
    await openYunling(page);

    await page.getByRole("button", { name: "加入购物车：青柠气泡水" }).click();
    await expect(page.getByRole("button", { name: /打开购物车，4 件商品/ })).toBeVisible();

    await page.getByRole("button", { name: "查看商品：早餐能量组合" }).click();
    await expect(page.getByRole("heading", { name: "早餐能量组合" })).toBeVisible();

    await page.getByRole("button", { name: "返回商品列表" }).click();
    await page.getByRole("button", { name: /打开购物车，4 件商品/ }).click();
    await expect(page.getByRole("dialog", { name: "购物车" })).toBeVisible();
  });
});

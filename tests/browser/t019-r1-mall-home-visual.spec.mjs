import { expect, test } from "@playwright/test";

const MOBILE = "http://127.0.0.1:4173";
const TOLERANCE = 4;

async function openMall(page) {
  await page.goto(`${MOBILE}/?demoAuth=1`);
  await page.getByRole("navigation", { name: "一级导航" }).getByRole("button", { name: "商城", exact: true }).click();
  await expect(page.getByTestId("mall-home")).toBeVisible();
}

async function expectHeight(locator, expected) {
  const box = await locator.boundingBox();
  expect(box, `missing geometry for ${await locator.getAttribute("data-testid")}`).not.toBeNull();
  expect(Math.abs(box.height - expected), JSON.stringify(box)).toBeLessThanOrEqual(TOLERANCE);
}

async function expectVerticalGap(before, after, expected) {
  const beforeBox = await before.boundingBox();
  const afterBox = await after.boundingBox();
  expect(beforeBox).not.toBeNull();
  expect(afterBox).not.toBeNull();
  expect(Math.abs(afterBox.y - (beforeBox.y + beforeBox.height) - expected), JSON.stringify({ beforeBox, afterBox })).toBeLessThanOrEqual(TOLERANCE);
}

async function expectNoHorizontalOverflow(page) {
  const metrics = await page.evaluate(() => ({
    viewport: window.innerWidth,
    html: document.documentElement.scrollWidth,
    body: document.body.scrollWidth,
  }));
  expect(Math.max(metrics.html, metrics.body), JSON.stringify(metrics)).toBeLessThanOrEqual(metrics.viewport + 1);
}

test.describe("T019-R1 · mall home approved UI composition", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("canonical mall home follows approved browsing-first layout", async ({ page }) => {
    await openMall(page);

    await expect(page.getByText("LOCAL LIFE · V0.2 PREVIEW", { exact: true })).toHaveCount(0);

    const header = page.getByTestId("mall-home-header");
    const search = page.getByTestId("mall-search");
    const banner = page.getByTestId("mall-campaign-banner");
    const categoryTrack = page.getByTestId("mall-category-track");
    const source = page.getByTestId("mall-source-section");

    await expectHeight(header, 92);
    await expectHeight(search, 48);
    await expectHeight(banner, 148);
    await expectHeight(categoryTrack, 44);
    await expectHeight(categoryTrack.getByRole("button").first(), 44);

    const headerBox = await header.boundingBox();
    expect(headerBox).not.toBeNull();
    expect(Math.abs(headerBox.y), JSON.stringify(headerBox)).toBeLessThanOrEqual(1);

    // Approved UI order: Header → Search → Banner → Category → Featured stores.
    await expectVerticalGap(header, search, 12);
    await expectVerticalGap(search, banner, 12);
    await expectVerticalGap(banner, categoryTrack, 12);
    await expectVerticalGap(categoryTrack, source, 16);

    const sourceBox = await source.boundingBox();
    expect(sourceBox).not.toBeNull();
    expect(sourceBox.height).toBeGreaterThanOrEqual(104);
    expect(sourceBox.height).toBeLessThanOrEqual(124);

    const productCards = page.getByTestId("mall-product-grid").locator(":scope > button");
    expect(await productCards.count()).toBeGreaterThanOrEqual(2);
    const firstCard = await productCards.nth(0).boundingBox();
    const secondCard = await productCards.nth(1).boundingBox();
    expect(firstCard).not.toBeNull();
    expect(secondCard).not.toBeNull();
    expect(Math.abs(firstCard.width - 174), JSON.stringify(firstCard)).toBeLessThanOrEqual(TOLERANCE);
    expect(Math.abs(firstCard.height - 208), JSON.stringify(firstCard)).toBeLessThanOrEqual(TOLERANCE);
    expect(Math.abs(secondCard.x - firstCard.x - firstCard.width - 10), JSON.stringify({ firstCard, secondCard })).toBeLessThanOrEqual(TOLERANCE);

    const firstArtwork = productCards.nth(0).getByRole("img");
    const artworkBox = await firstArtwork.boundingBox();
    expect(artworkBox).not.toBeNull();
    expect(Math.abs(artworkBox.height - 110), JSON.stringify(artworkBox)).toBeLessThanOrEqual(TOLERANCE);

    await page.getByTestId("mall-shipping-strip").scrollIntoViewIfNeeded();
    await expectHeight(page.getByTestId("mall-shipping-strip"), 56);
    await expectNoHorizontalOverflow(page);
  });

  test("home expresses multi-store shopping as consumer store discovery", async ({ page }) => {
    await openMall(page);

    const home = page.getByTestId("mall-home");
    await expect(home.getByRole("heading", { name: "线上商城", exact: true })).toBeVisible();
    await expect(home.getByRole("textbox", { name: "商城内搜索" })).toBeVisible();
    await expect(home.getByTestId("mall-campaign-banner")).toContainText("秋日护理精选");
    await expect(home.getByTestId("mall-category-track")).toBeVisible();
    await expect(home.getByText("精选店铺", { exact: true })).toBeVisible();
    await expect(home.getByText("选择商城来源", { exact: true })).toHaveCount(0);
    await expect(home.getByText("为你推荐", { exact: true })).toBeVisible();
    await expect(home.getByTestId("mall-shipping-strip")).toContainText("满 ¥99 包邮");
    await expect(home).not.toContainText(/Storefront|Channel|Mock|planned|integrationStatus|T019/i);

    const storefrontSwitches = home.getByRole("button", { name: /切换商城：/ });
    expect(await storefrontSwitches.count()).toBe(2);
    await storefrontSwitches.nth(1).click();
    await expect(storefrontSwitches.nth(1)).toHaveAttribute("aria-pressed", "true");

    const search = home.getByRole("textbox", { name: "商城内搜索" });
    await search.fill("胶原");
    await expect(home.getByRole("button", { name: /查看商品：胶原蛋白肽饮/ })).toBeVisible();
    await expect(home.getByRole("img", { name: "胶原蛋白肽饮 商品图", exact: true })).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test("returning from the dedicated detail restores mall home chrome", async ({ page }) => {
    await openMall(page);

    await page.getByRole("button", { name: /查看商品：/ }).first().click();
    await expect(page.getByRole("button", { name: "返回商城", exact: true })).toBeVisible();
    await expect(page.getByText("LOCAL LIFE · V0.2 PREVIEW", { exact: true })).toHaveCount(0);
    await expect(page.getByRole("navigation", { name: "一级导航" })).toHaveCount(0);

    await page.getByRole("button", { name: "返回商城", exact: true }).click();
    await expect(page.getByTestId("mall-home")).toBeVisible();
    await expect(page.getByText("LOCAL LIFE · V0.2 PREVIEW", { exact: true })).toHaveCount(0);
    await expect(page.getByRole("navigation", { name: "一级导航" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "线上商城", exact: true })).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });
});

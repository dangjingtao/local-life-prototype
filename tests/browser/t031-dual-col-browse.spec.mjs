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

test.describe("T031 · Dual-column convenience browse UX", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("left category sidebar with selected indicator", async ({ page }) => {
    await openConvenience(page);
    await page.getByRole("button", { name: "选择门店：云岭社区店" }).click();

    const categoryNav = page.getByRole("navigation", { name: "商品分类" });
    await expect(categoryNav).toBeVisible();
    const buttons = categoryNav.getByRole("button");
    expect(await buttons.count()).toBeGreaterThanOrEqual(3);

    const first = buttons.first();
    await expect(first).toHaveAttribute("aria-pressed", "true");

    const second = buttons.nth(1);
    await second.click();
    await expect(second).toHaveAttribute("aria-pressed", "true");
    await expect(first).toHaveAttribute("aria-pressed", "false");
  });

  test("compact product rows with promo label, price and qty control", async ({ page }) => {
    await openConvenience(page);
    await page.getByRole("button", { name: "选择门店：云岭社区店" }).click();

    const productViewButtons = page.getByRole("button", { name: /查看商品：/ });
    const count = await productViewButtons.count();
    expect(count).toBeGreaterThanOrEqual(3);

    // 加购按钮或数量控件存在（已加购的商品显示数量控件）
    const addButtons = page.getByRole("button", { name: /加入购物车：/ });
    const qtyButtons = page.getByRole("button", { name: /减少/ });
    const totalInteractive = (await addButtons.count()) + (await qtyButtons.count());
    expect(totalInteractive).toBeGreaterThanOrEqual(2);

    await expect(page.getByText("第二件 8 折").first()).toBeVisible();
  });

  test("single/combo mode switch with single as default", async ({ page }) => {
    await openConvenience(page);
    await page.getByRole("button", { name: "选择门店：云岭社区店" }).click();

    const singleBtn = page.getByRole("button", { name: "单品", exact: true });
    const comboBtn = page.getByRole("button", { name: "套餐", exact: true });

    await expect(singleBtn).toBeVisible();
    await expect(comboBtn).toBeVisible();
    await expect(singleBtn).toHaveAttribute("aria-pressed", "true");
    await expect(comboBtn).toHaveAttribute("aria-pressed", "false");

    await comboBtn.click();
    await expect(comboBtn).toHaveAttribute("aria-pressed", "true");
    await expect(singleBtn).toHaveAttribute("aria-pressed", "false");
  });

  test("floating cart bar updates on add", async ({ page }) => {
    await openConvenience(page);
    await page.getByRole("button", { name: "选择门店：云岭社区店" }).click();

    const cartBar = page.getByRole("button", { name: /打开购物车，3 件商品/ });
    await expect(cartBar).toBeVisible();
    await expect(cartBar).toContainText("合计");
    await expect(cartBar).toContainText("去结算");

    await page.getByRole("button", { name: "加入购物车：青柠气泡水" }).click();
    const updated = page.getByRole("button", { name: /打开购物车，4 件商品/ });
    await expect(updated).toBeVisible();
    await expect(updated).toContainText("¥43.10");

    await expectNoHorizontalOverflow(page);
  });

  test("available coupon floating entry exists", async ({ page }) => {
    await openConvenience(page);
    await page.getByRole("button", { name: "选择门店：云岭社区店" }).click();
    await expect(page.getByRole("button", { name: /可用券/ })).toBeVisible();
  });

  test("store info bar compact and clickable to switch store", async ({ page }) => {
    await openConvenience(page);
    await page.getByRole("button", { name: "选择门店：云岭社区店" }).click();

    const storeBar = page.getByRole("button", { name: /切换门店，当前门店：/ });
    await expect(storeBar).toBeVisible();
    await expect(storeBar).toContainText("云岭社区店");

    await storeBar.click();
    await expect(page.getByRole("heading", { name: "选择购买门店" })).toBeVisible();
  });

  test("activity banner is narrow strip", async ({ page }) => {
    await openConvenience(page);
    await page.getByRole("button", { name: "选择门店：云岭社区店" }).click();

    const activity = page.getByRole("button", { name: "查看便利店活动" });
    await expect(activity).toBeVisible();
    await expect(activity).toContainText("早八能量补给");

    const box = await activity.boundingBox();
    expect(box).not.toBeNull();
    expect(box.height).toBeLessThan(40);
  });

  test("sold out product has overlay and disabled button", async ({ page }) => {
    await openConvenience(page);
    await page.getByRole("button", { name: "选择门店：南岸生活馆" }).click();

    const oat = page.getByRole("button", { name: "查看商品：燕麦拿铁" });
    await expect(oat).toBeVisible();
    await expect(page.getByText("今日售罄").first()).toBeVisible();

    const addBtn = page.getByRole("button", { name: "加入购物车：燕麦拿铁" });
    await expect(addBtn).toBeDisabled();
  });

  test("no internal terms on browse page", async ({ page }) => {
    await openConvenience(page);
    await page.getByRole("button", { name: "选择门店：云岭社区店" }).click();

    for (const term of ["mock", "fixture", "门店上下文", "可售上下文", "核心演示"]) {
      await expect(page.getByText(term, { exact: false })).toHaveCount(0);
    }
  });
});

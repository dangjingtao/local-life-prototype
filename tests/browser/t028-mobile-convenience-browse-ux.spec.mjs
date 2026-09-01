import { expect, test } from "@playwright/test";

const MOBILE = "http://127.0.0.1:4173";

async function openYunling(page) {
  await page.goto(`${MOBILE}/?demoAuth=1`);
  const navigation = page.getByRole("navigation", { name: "一级导航" });
  await navigation.getByRole("button", { name: "便利店", exact: true }).click();
  await page.getByRole("button", { name: "选择门店：云岭社区店" }).click();
  await expect(page.getByRole("heading", { name: "云岭社区店" })).toBeVisible();
}

async function expectNoHorizontalOverflow(page) {
  const metrics = await page.evaluate(() => ({
    viewport: window.innerWidth,
    html: document.documentElement.scrollWidth,
    body: document.body.scrollWidth,
  }));
  expect(Math.max(metrics.html, metrics.body), JSON.stringify(metrics)).toBeLessThanOrEqual(metrics.viewport + 1);
}

async function expectAtLeast44Px(locator) {
  const box = await locator.boundingBox();
  expect(box).not.toBeNull();
  expect(box.width).toBeGreaterThanOrEqual(44);
  expect(box.height).toBeGreaterThanOrEqual(44);
}

test.describe("T028 · expanded convenience browse UX", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("single mode uses a linked category rail and keeps at least 3.5 product rows in the browse viewport", async ({ page }) => {
    await openYunling(page);

    await expect(page.getByRole("region", { name: "单品双栏浏览" })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "商品分类栏" })).toBeVisible();
    await expect(page.getByRole("button", { name: "饮品系列", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "鲜食系列", exact: true })).toBeVisible();

    const visibleRowEquivalent = await page.getByRole("region", { name: "单品双栏浏览" }).evaluate((region) => {
      const list = region.querySelector('[aria-label="商品列表"]');
      if (!(list instanceof HTMLElement)) return 0;
      const viewport = list.getBoundingClientRect();
      return [...list.querySelectorAll("article")].reduce((sum, row) => {
        const rect = row.getBoundingClientRect();
        const overlap = Math.max(0, Math.min(rect.bottom, viewport.bottom) - Math.max(rect.top, viewport.top));
        return sum + overlap / Math.max(1, rect.height);
      }, 0);
    });
    expect(visibleRowEquivalent).toBeGreaterThanOrEqual(3.5);

    const productList = page.getByLabel("商品列表");
    const before = await productList.evaluate((node) => node.scrollTop);
    await page.getByRole("button", { name: "鲜食系列", exact: true }).click();
    await page.waitForTimeout(350);
    const after = await productList.evaluate((node) => node.scrollTop);
    expect(after).toBeGreaterThan(before);
    await expect(page.getByRole("button", { name: "鲜食系列", exact: true })).toHaveAttribute("aria-pressed", "true");
    await expectNoHorizontalOverflow(page);
  });

  test("bundle and single modes have clearly different product presentations and 44px controls", async ({ page }) => {
    await openYunling(page);

    const singleMode = page.getByRole("button", { name: "单品", exact: true });
    const bundleMode = page.getByRole("button", { name: "套餐", exact: true });
    await expect(singleMode).toHaveAttribute("aria-pressed", "true");
    await expectAtLeast44Px(singleMode);
    await expectAtLeast44Px(bundleMode);
    await expect(page.getByRole("region", { name: "单品双栏浏览" })).toBeVisible();

    await bundleMode.click();
    await expect(bundleMode).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("region", { name: "套餐商品浏览" })).toBeVisible();
    await expect(page.getByRole("button", { name: /查看套餐：轻盈生活组合/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /查看套餐：头皮养护套装/ })).toBeVisible();
  });

  test("activity carousel and coupon entry are consumer-facing, interactive and touch-safe", async ({ page }) => {
    await openYunling(page);

    const carousel = page.getByRole("region", { name: "门店活动轮播" });
    await expect(carousel).toContainText("早八能量补给");
    const slide2 = page.getByRole("button", { name: "切换到活动 2" });
    await expectAtLeast44Px(slide2);
    await slide2.click();
    await expect(carousel).toContainText("门店 10 元优惠券");

    const couponButton = page.getByRole("button", { name: /查看可用优惠券，1 张/ });
    await expect(couponButton).toBeVisible();
    await expectAtLeast44Px(couponButton);
    await couponButton.click();
    await expect(page.getByText("当前门店可用券", { exact: true })).toBeVisible();
    await expect(page.getByText("门店 10 元优惠券", { exact: true }).last()).toBeVisible();

    for (const internalTerm of ["mock", "fixture", "可售上下文"]) {
      await expect(page.getByText(internalTerm, { exact: false })).toHaveCount(0);
    }
  });

  test("fixed cart bar uses checkout-oriented retail feedback and updates immediately after add", async ({ page }) => {
    await openYunling(page);

    const initialCart = page.getByRole("button", { name: /打开购物车，3 件商品/ });
    await expect(initialCart).toBeVisible();
    await expect(initialCart).toHaveCSS("position", "fixed");
    await expect(initialCart).toContainText("去结算");
    await expect(initialCart).toContainText("¥36.60");

    await page.getByRole("button", { name: "加入购物车：青柠气泡水" }).click();
    const updatedCart = page.getByRole("button", { name: /打开购物车，4 件商品/ });
    await expect(updatedCart).toBeVisible();
    await expect(updatedCart).toContainText("¥43.10");

    const navigation = page.getByRole("navigation", { name: "一级导航" });
    const [cartBox, navBox] = await Promise.all([updatedCart.boundingBox(), navigation.boundingBox()]);
    expect(cartBox).not.toBeNull();
    expect(navBox).not.toBeNull();
    expect(cartBox.y + cartBox.height).toBeLessThanOrEqual(navBox.y + 1);
    await expectNoHorizontalOverflow(page);
  });

  test("store promotions remain scoped to availability after the visual rework", async ({ page }) => {
    await openYunling(page);
    const yunlingOat = page.locator("article").filter({ hasText: "燕麦拿铁" }).first();
    await expect(yunlingOat).toContainText("第二件 8 折");

    await page.getByRole("button", { name: "切换门店" }).click();
    await page.getByRole("button", { name: "选择门店：南岸生活馆" }).click();
    const nananOat = page.locator("article").filter({ hasText: "燕麦拿铁" }).first();
    await expect(nananOat).toBeVisible();
    await expect(nananOat).toContainText("今日售罄");
    await expect(nananOat).not.toContainText("第二件 8 折");
    await expect(page.getByRole("button", { name: "加入购物车：燕麦拿铁" })).toBeDisabled();
  });
});

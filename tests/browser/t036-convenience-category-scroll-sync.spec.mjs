import { expect, test } from "@playwright/test";

const MOBILE = "http://127.0.0.1:4173";

async function openYunling(page) {
  await page.goto(`${MOBILE}/?demoAuth=1`);
  await page.getByRole("navigation", { name: "一级导航" }).getByRole("button", { name: "便利店", exact: true }).click();
  await expect(page.getByRole("heading", { name: "选择购买门店" })).toBeVisible();
  await page.getByRole("button", { name: "选择门店：云岭社区店" }).click();
  await expect(page.getByRole("button", { name: /切换门店，当前门店：云岭社区店/ })).toBeVisible();
}

async function sectionDeltaFromScrollTop(page, testId) {
  return page.evaluate((id) => {
    const scroll = document.querySelector('[data-testid="convenience-product-scroll"]');
    const section = document.querySelector(`[data-testid="${id}"]`);
    if (!(scroll instanceof HTMLElement) || !(section instanceof HTMLElement)) return null;
    return section.getBoundingClientRect().top - scroll.getBoundingClientRect().top;
  }, testId);
}

async function scrollSectionToTop(page, testId, extra = 0) {
  await page.evaluate(({ id, extraOffset }) => {
    const scroll = document.querySelector('[data-testid="convenience-product-scroll"]');
    const section = document.querySelector(`[data-testid="${id}"]`);
    if (!(scroll instanceof HTMLElement) || !(section instanceof HTMLElement)) throw new Error("missing scroll target");
    const top = scroll.scrollTop + section.getBoundingClientRect().top - scroll.getBoundingClientRect().top + extraOffset;
    scroll.scrollTop = top;
  }, { id: testId, extraOffset: extra });
}

test.describe("T036 · convenience category scroll sync", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("category click anchors the existing continuous list instead of filtering it", async ({ page }) => {
    await openYunling(page);

    const nav = page.getByRole("navigation", { name: "商品分类" });
    const freshButton = nav.getByRole("button", { name: "鲜食", exact: true });
    const sections = page.getByTestId("convenience-continuous-sections").locator(":scope > section");

    await expect(sections).toHaveCount(4);

    const targets = [
      ["饮料", "convenience-section-CONV-CAT-DRINKS"],
      ["鲜食", "convenience-section-CONV-CAT-FRESH"],
      ["日用洗护", "convenience-section-CONV-CAT-DAILY"],
      ["生活方式", "convenience-section-CONV-CAT-LIFESTYLE"],
    ];

    for (const [label, testId] of targets) {
      const button = nav.getByRole("button", { name: label, exact: true });
      await button.click();
      await expect(button).toHaveAttribute("aria-pressed", "true");
      await expect(sections).toHaveCount(4);
      await expect.poll(() => sectionDeltaFromScrollTop(page, testId)).toBeLessThanOrEqual(1);
      await expect.poll(() => sectionDeltaFromScrollTop(page, testId)).toBeGreaterThanOrEqual(-1);
    }

    await freshButton.click();
    await expect(freshButton).toHaveAttribute("aria-pressed", "true");
  });

  test("natural forward and reverse scrolling updates the left category highlight", async ({ page }) => {
    await openYunling(page);

    const nav = page.getByRole("navigation", { name: "商品分类" });
    const fresh = nav.getByRole("button", { name: "鲜食", exact: true });
    const daily = nav.getByRole("button", { name: "日用洗护", exact: true });

    await scrollSectionToTop(page, "convenience-section-CONV-CAT-DAILY", 2);
    await expect.poll(async () => daily.getAttribute("aria-pressed")).toBe("true");
    await expect(fresh).toHaveAttribute("aria-pressed", "false");

    await scrollSectionToTop(page, "convenience-section-CONV-CAT-FRESH", 2);
    await expect.poll(async () => fresh.getAttribute("aria-pressed")).toBe("true");
    await expect(daily).toHaveAttribute("aria-pressed", "false");
  });

  test("rapid category clicks settle on the final target without highlight jitter", async ({ page }) => {
    await openYunling(page);

    const nav = page.getByRole("navigation", { name: "商品分类" });
    const fresh = nav.getByRole("button", { name: "鲜食", exact: true });
    const daily = nav.getByRole("button", { name: "日用洗护", exact: true });
    const lifestyle = nav.getByRole("button", { name: "生活方式", exact: true });

    await fresh.click();
    await lifestyle.click();
    await daily.click();

    await expect(daily).toHaveAttribute("aria-pressed", "true");
    await expect(fresh).toHaveAttribute("aria-pressed", "false");
    await expect(lifestyle).toHaveAttribute("aria-pressed", "false");
    await expect.poll(() => sectionDeltaFromScrollTop(page, "convenience-section-CONV-CAT-DAILY")).toBeLessThanOrEqual(1);
    await expect.poll(() => sectionDeltaFromScrollTop(page, "convenience-section-CONV-CAT-DAILY")).toBeGreaterThanOrEqual(-1);

    await page.waitForTimeout(150);
    await expect(daily).toHaveAttribute("aria-pressed", "true");
  });

  test("390px sidebar remains usable while the cart bar stays clear of the continuous list", async ({ page }) => {
    await openYunling(page);

    const nav = page.getByRole("navigation", { name: "商品分类" });
    await expect(nav).toBeVisible();
    await expect(nav.getByRole("button", { name: "生活方式", exact: true })).toBeVisible();

    const scroll = page.getByTestId("convenience-product-scroll");
    await scroll.evaluate((node) => { node.scrollTop = node.scrollHeight; });

    const lastAdd = page.getByRole("button", { name: /加入购物车：/ }).last();
    const cart = page.getByRole("button", { name: /打开购物车，3 件商品/ });
    await expect(lastAdd).toBeVisible();

    const lastBox = await lastAdd.boundingBox();
    const cartBox = await cart.boundingBox();
    expect(lastBox).not.toBeNull();
    expect(cartBox).not.toBeNull();
    expect(lastBox.y + lastBox.height).toBeLessThanOrEqual(cartBox.y + 2);
  });
});

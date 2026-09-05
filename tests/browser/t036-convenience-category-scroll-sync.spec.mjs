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

async function expectSectionAlignedToScrollTop(page, testId, tolerance = 1) {
  await expect.poll(async () => {
    const delta = await sectionDeltaFromScrollTop(page, testId);
    return delta === null ? Number.POSITIVE_INFINITY : Math.abs(delta);
  }).toBeLessThanOrEqual(tolerance);
}

async function scrollSectionToActivationLine(page, testId, extra = 0) {
  await page.evaluate(({ id, extraOffset }) => {
    const scroll = document.querySelector('[data-testid="convenience-product-scroll"]');
    const section = document.querySelector(`[data-testid="${id}"]`);
    if (!(scroll instanceof HTMLElement) || !(section instanceof HTMLElement)) throw new Error("missing scroll target");
    const scrollRect = scroll.getBoundingClientRect();
    const activationOffset = scroll.clientHeight * 0.25;
    const requestedTop = scroll.scrollTop + section.getBoundingClientRect().top - scrollRect.top - activationOffset + extraOffset;
    const maxScrollTop = Math.max(0, scroll.scrollHeight - scroll.clientHeight);
    scroll.scrollTop = Math.max(0, Math.min(requestedTop, maxScrollTop));
  }, { id: testId, extraOffset: extra });
}

async function expectSectionVisibleInScrollport(page, testId) {
  const state = await page.evaluate((id) => {
    const scroll = document.querySelector('[data-testid="convenience-product-scroll"]');
    const section = document.querySelector(`[data-testid="${id}"]`);
    if (!(scroll instanceof HTMLElement) || !(section instanceof HTMLElement)) return null;
    const scrollRect = scroll.getBoundingClientRect();
    const sectionRect = section.getBoundingClientRect();
    return {
      sectionTop: sectionRect.top,
      sectionBottom: sectionRect.bottom,
      scrollTop: scrollRect.top,
      scrollBottom: scrollRect.bottom,
    };
  }, testId);
  expect(state).not.toBeNull();
  expect(state.sectionBottom).toBeGreaterThan(state.scrollTop);
  expect(state.sectionTop).toBeLessThan(state.scrollBottom);
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
      await expectSectionVisibleInScrollport(page, testId);
    }

    const drinks = nav.getByRole("button", { name: "饮料", exact: true });
    await drinks.click();
    await expect(drinks).toHaveAttribute("aria-pressed", "true");
    await expectSectionAlignedToScrollTop(page, "convenience-section-CONV-CAT-DRINKS");

    await freshButton.click();
    await expect(freshButton).toHaveAttribute("aria-pressed", "true");
  });

  test("natural forward and reverse scrolling updates the left category highlight", async ({ page }) => {
    await openYunling(page);

    const nav = page.getByRole("navigation", { name: "商品分类" });
    const fresh = nav.getByRole("button", { name: "鲜食", exact: true });
    const daily = nav.getByRole("button", { name: "日用洗护", exact: true });

    await scrollSectionToActivationLine(page, "convenience-section-CONV-CAT-DAILY", 2);
    await expect.poll(async () => daily.getAttribute("aria-pressed")).toBe("true");
    await expect(fresh).toHaveAttribute("aria-pressed", "false");

    await scrollSectionToActivationLine(page, "convenience-section-CONV-CAT-FRESH", 2);
    await expect.poll(async () => fresh.getAttribute("aria-pressed")).toBe("true");
    await expect(daily).toHaveAttribute("aria-pressed", "false");

    const scroll = page.getByTestId("convenience-product-scroll");
    await scroll.evaluate((node) => { node.scrollTop = node.scrollHeight; });
    await expect.poll(async () => nav.getByRole("button", { name: "生活方式", exact: true }).getAttribute("aria-pressed")).toBe("true");
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
    await expectSectionVisibleInScrollport(page, "convenience-section-CONV-CAT-DAILY");

    await page.waitForTimeout(150);
    await expect(daily).toHaveAttribute("aria-pressed", "true");
  });

  test("category click remains functional during search by returning to browse and locating the category", async ({ page }) => {
    await openYunling(page);

    const search = page.getByRole("textbox", { name: "搜索当前门店商品" });
    const nav = page.getByRole("navigation", { name: "商品分类" });
    await search.fill("燕麦");
    await expect(page.getByTestId("convenience-search-results")).toBeVisible();

    const fresh = nav.getByRole("button", { name: "鲜食", exact: true });
    await fresh.click();

    await expect(search).toHaveValue("");
    await expect(page.getByTestId("convenience-continuous-sections")).toBeVisible();
    await expect(fresh).toHaveAttribute("aria-pressed", "true");
    await expectSectionAlignedToScrollTop(page, "convenience-section-CONV-CAT-FRESH");
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

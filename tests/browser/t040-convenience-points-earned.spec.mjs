import { mkdir } from "node:fs/promises";
import { expect, test } from "@playwright/test";

const MOBILE = "http://127.0.0.1:4173";

async function openStore(page) {
  await page.goto(`${MOBILE}/?demoAuth=1`);
  await page.getByRole("navigation", { name: "一级导航" }).getByRole("button", { name: "便利店", exact: true }).click();
  await page.getByRole("button", { name: "选择门店：云岭社区店" }).click();
}

async function openCartSheet(page) {
  const cartBar = page.getByRole("button", { name: /打开购物车，\d+ 件商品/ });
  await expect(cartBar).toBeVisible();
  await cartBar.click();
  const dialog = page.getByRole("dialog", { name: "购物车" });
  await expect(dialog).toBeVisible();
  return dialog;
}

function extractProjectedPoints(text) {
  const match = text.match(/\+(\d+(?:\.\d+)?)\s*积分/);
  if (!match) throw new Error(`Projected points not found in: ${text}`);
  return Number(match[1]);
}

async function expectNoHorizontalOverflow(page) {
  const metrics = await page.evaluate(() => ({
    viewport: window.innerWidth,
    html: document.documentElement.scrollWidth,
    body: document.body.scrollWidth,
  }));
  expect(Math.max(metrics.html, metrics.body), JSON.stringify(metrics)).toBeLessThanOrEqual(metrics.viewport + 1);
}

test.describe("T040 · convenience purchase points feedback", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("cart sheet projection uses Shared rate and updates after quantity change", async ({ page }) => {
    await openStore(page);
    const dialog = await openCartSheet(page);
    const points = page.getByTestId("t040-cart-sheet-points");

    await expect(points).toBeVisible();
    await expect(points).toHaveAttribute("data-earn-rate", "1");
    await expect(points).toContainText("本单预计可得");
    await expect(points).toContainText("实际到账以积分规则为准");

    const before = extractProjectedPoints(await points.innerText());
    const addButton = dialog.getByRole("button", { name: /^增加/ }).first();
    await expect(addButton).toBeVisible();
    await addButton.click();

    await expect.poll(async () => extractProjectedPoints(await points.innerText())).toBeGreaterThan(before);
    const after = extractProjectedPoints(await points.innerText());
    expect(after).toBeGreaterThan(before);
    await expectNoHorizontalOverflow(page);
  });

  test("standalone cart remains reachable and shows the same projected points", async ({ page }) => {
    await openStore(page);
    const dialog = await openCartSheet(page);
    const sheetPoints = extractProjectedPoints(await page.getByTestId("t040-cart-sheet-points").innerText());

    await dialog.getByRole("button", { name: "查看完整购物车" }).click();

    await expect(page.getByRole("heading", { name: "购物车", exact: true })).toBeVisible();
    const cartPagePoints = page.getByTestId("t040-cart-page-points");
    await expect(cartPagePoints).toBeVisible();
    await expect(cartPagePoints).toHaveAttribute("data-earn-rate", "1");
    expect(extractProjectedPoints(await cartPagePoints.innerText())).toBe(sheetPoints);
    await expectNoHorizontalOverflow(page);
  });

  test("checkout carries the updated projection without changing existing payable flow", async ({ page }) => {
    await openStore(page);
    const dialog = await openCartSheet(page);
    const cartPoints = page.getByTestId("t040-cart-sheet-points");

    const addButton = dialog.getByRole("button", { name: /^增加/ }).first();
    await addButton.click();
    const expectedPoints = extractProjectedPoints(await cartPoints.innerText());

    await dialog.getByRole("button", { name: "去结算" }).click();

    const checkoutPoints = page.getByTestId("t040-checkout-points");
    await expect(checkoutPoints).toBeVisible();
    await expect(checkoutPoints).toHaveAttribute("data-earn-rate", "1");
    expect(extractProjectedPoints(await checkoutPoints.innerText())).toBe(expectedPoints);

    const submitBar = page.locator("div.fixed").filter({ has: page.getByRole("button", { name: "提交订单" }) });
    const totalBefore = await submitBar.innerText();
    const bagSwitch = page.getByRole("switch", { name: "需要购物袋" });
    await expect(bagSwitch).toHaveAttribute("aria-checked", "true");
    await bagSwitch.click();
    await expect(bagSwitch).toHaveAttribute("aria-checked", "false");
    const totalAfter = await submitBar.innerText();

    expect(totalAfter).not.toBe(totalBefore);
    expect(extractProjectedPoints(await checkoutPoints.innerText())).toBe(expectedPoints);
    await expectNoHorizontalOverflow(page);
  });

  test("points feedback stays consumer-facing at 390x844", async ({ page }) => {
    await openStore(page);
    const dialog = await openCartSheet(page);
    const points = page.getByTestId("t040-cart-sheet-points");

    for (const term of ["Shared", "unknown", "fixture", "mock"]) {
      await expect(points.getByText(term, { exact: false })).toHaveCount(0);
    }

    await mkdir("test-results/t040-visual-evidence", { recursive: true });
    await page.screenshot({ path: "test-results/t040-visual-evidence/01-cart-sheet-points.png", fullPage: false });

    await dialog.getByRole("button", { name: "去结算" }).click();
    await expect(page.getByTestId("t040-checkout-points")).toBeVisible();
    await page.screenshot({ path: "test-results/t040-visual-evidence/02-checkout-points.png", fullPage: false });
    await expectNoHorizontalOverflow(page);
  });
});

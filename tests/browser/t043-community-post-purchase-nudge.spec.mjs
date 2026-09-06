import { mkdir } from "node:fs/promises";
import { expect, test } from "@playwright/test";

const MOBILE = "http://127.0.0.1:4173";
const NUDGE_KEY = "local-life:LL-8888:community-nudge:last-shown-at";
const EVIDENCE_DIR = "test-results/t043-visual-evidence";

async function openStore(page) {
  await page.goto(`${MOBILE}/?demoAuth=1`);
  await page.getByRole("navigation", { name: "一级导航" }).getByRole("button", { name: "便利店", exact: true }).click();
  const storeButton = page.getByRole("button", { name: "选择门店：云岭社区店" });
  if (await storeButton.count()) await storeButton.click();
}

async function submitPickupOrder(page) {
  await openStore(page);
  const cartBar = page.getByRole("button", { name: /打开购物车，\d+ 件商品/ });
  await expect(cartBar).toBeVisible();
  await cartBar.click();
  const dialog = page.getByRole("dialog", { name: "购物车" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "去结算" }).click();
  await expect(page.getByText("确认订单", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "提交订单" }).click();
  await expect(page.getByRole("heading", { name: "LL-1024", exact: true })).toBeVisible();
}

async function expectNoHorizontalOverflow(page) {
  const metrics = await page.evaluate(() => ({
    viewport: window.innerWidth,
    html: document.documentElement.scrollWidth,
    body: document.body.scrollWidth,
  }));
  expect(Math.max(metrics.html, metrics.body), JSON.stringify(metrics)).toBeLessThanOrEqual(metrics.viewport + 1);
}

test.describe("T043 · post-purchase community nudge", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test.beforeAll(async () => {
    await mkdir(EVIDENCE_DIR, { recursive: true });
  });

  test.beforeEach(async ({ page }) => {
    await page.goto(`${MOBILE}/?demoAuth=1`);
    await page.evaluate((key) => localStorage.removeItem(key), NUDGE_KEY);
    await page.evaluate(() => sessionStorage.clear());
  });

  test("payment success shows a lightweight nudge and records the user cooldown", async ({ page }) => {
    await submitPickupOrder(page);

    const nudge = page.getByTestId("t043-community-nudge");
    await expect(nudge).toBeVisible();
    await expect(nudge).toHaveAttribute("data-nudge-stage", "payment");
    await expect(nudge).toContainText("加入门店社群，获取更多福利");
    await expect(page.getByText("备货中", { exact: true }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: "模拟备货完成" })).toBeVisible();

    const position = await nudge.evaluate((element) => getComputedStyle(element).position);
    expect(position).not.toBe("fixed");
    expect(position).not.toBe("absolute");

    const storedAt = await page.evaluate((key) => localStorage.getItem(key), NUDGE_KEY);
    expect(storedAt).toBeTruthy();
    expect(Number.isFinite(Date.parse(storedAt))).toBe(true);

    await expectNoHorizontalOverflow(page);
    await page.screenshot({ path: `${EVIDENCE_DIR}/01-payment-community-nudge.png`, fullPage: false });
  });

  test("a second payment success within seven days is suppressed for the same user", async ({ page }) => {
    await submitPickupOrder(page);
    await expect(page.getByTestId("t043-community-nudge")).toBeVisible();

    const firstShownAt = await page.evaluate((key) => localStorage.getItem(key), NUDGE_KEY);
    expect(firstShownAt).toBeTruthy();

    await page.evaluate(() => sessionStorage.clear());
    await page.reload();
    await submitPickupOrder(page);

    await expect(page.getByTestId("t043-community-nudge")).toHaveCount(0);
    const secondShownAt = await page.evaluate((key) => localStorage.getItem(key), NUDGE_KEY);
    expect(secondShownAt).toBe(firstShownAt);
    await expect(page.getByText("备货中", { exact: true }).first()).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test("pickup completion is independently eligible when there is no recent nudge", async ({ page }) => {
    await submitPickupOrder(page);
    const paymentNudge = page.getByTestId("t043-community-nudge");
    await expect(paymentNudge).toBeVisible();

    // Isolate the pickup-completed trigger: remove the simulated prior exposure,
    // then leave the payment-success state before completing pickup.
    await page.evaluate((key) => localStorage.removeItem(key), NUDGE_KEY);
    await paymentNudge.getByRole("button", { name: "稍后再说" }).click();
    await page.getByRole("button", { name: "模拟备货完成" }).click();
    await expect(page.getByText("待取货", { exact: true }).first()).toBeVisible();
    await expect(page.getByTestId("t043-community-nudge")).toHaveCount(0);

    await page.getByRole("button", { name: "模拟店员核销" }).click();

    const completionNudge = page.getByTestId("t043-community-nudge");
    await expect(page.getByText("核销完成", { exact: true }).first()).toBeVisible();
    await expect(completionNudge).toBeVisible();
    await expect(completionNudge).toHaveAttribute("data-nudge-stage", "pickup_completed");
    await expect(completionNudge).toContainText("本次取货已完成");
    await expect(page.getByRole("button", { name: "返回便利店继续选购" })).toBeVisible();

    const storedAt = await page.evaluate((key) => localStorage.getItem(key), NUDGE_KEY);
    expect(storedAt).toBeTruthy();
    await expectNoHorizontalOverflow(page);
    await page.screenshot({ path: `${EVIDENCE_DIR}/02-pickup-complete-community-nudge.png`, fullPage: false });
  });

  test("nudge opens the T042 guide and cooldown does not remove the persistent My entry", async ({ page }) => {
    await submitPickupOrder(page);
    const nudge = page.getByTestId("t043-community-nudge");
    await nudge.getByRole("button", { name: "加入社群", exact: true }).click();

    await expect(page.getByTestId("community-guide")).toBeVisible();
    await expect(page.getByRole("heading", { name: "加入社群", exact: true })).toBeVisible();

    await page.getByRole("button", { name: "返回我的", exact: true }).click();
    await expect(page.getByRole("heading", { name: "我的", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: /加入社群/ })).toBeVisible();

    const storedAt = await page.evaluate((key) => localStorage.getItem(key), NUDGE_KEY);
    expect(storedAt).toBeTruthy();
    await expectNoHorizontalOverflow(page);
  });
});

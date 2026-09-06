import { mkdir } from "node:fs/promises";
import { expect, test } from "@playwright/test";

const MOBILE = "http://127.0.0.1:4173";
const SOURCE_TERMS = /店铺来源|精选店铺|官方商城|合作渠道专场|Storefront|Channel/i;

async function openMall(page) {
  await page.goto(`${MOBILE}/?demoAuth=1`);
  await page.getByRole("navigation", { name: "一级导航" }).getByRole("button", { name: "商城", exact: true }).click();
  await expect(page.getByRole("heading", { name: "线上商城", exact: true })).toBeVisible();
}

async function openCart(page) {
  await openMall(page);
  await page.getByRole("button", { name: /查看商品：/ }).first().click();
  await page.getByRole("button", { name: "立即购买", exact: true }).click();
  await expect(page.getByTestId("mall-cart")).toBeVisible();
}

function extractPoints(text) {
  const match = text.match(/\+(\d+(?:\.\d+)?)\s*积分/);
  if (!match) throw new Error(`Projected points not found in: ${text}`);
  return Number(match[1]);
}

function extractMoney(text) {
  const match = text.match(/¥(\d+(?:\.\d+)?)/);
  if (!match) throw new Error(`Money not found in: ${text}`);
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

test.describe("T041 · mall points earn and redemption loop", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("mall cart projected points use Shared mall rate and update with quantity", async ({ page }) => {
    await openCart(page);

    const points = page.getByTestId("t041-mall-cart-points");
    await expect(points).toBeVisible();
    await expect(points).toHaveAttribute("data-earn-rate", "1");
    await expect(points).toContainText("本单预计可得");
    await expect(points).toContainText("实际到账以积分规则为准");

    const before = extractPoints(await points.innerText());
    await page.getByTestId("mall-cart-row").first().getByRole("button", { name: /^增加/ }).click();

    await expect.poll(async () => extractPoints(await points.innerText())).toBeGreaterThan(before);
    expect(extractPoints(await points.innerText())).toBeGreaterThan(before);
    await expect(page.getByTestId("mall-cart")).not.toContainText(SOURCE_TERMS);
    await expectNoHorizontalOverflow(page);
  });

  test("checkout points switch changes payable and toggling off restores it", async ({ page }) => {
    await openCart(page);
    const cartPoints = extractPoints(await page.getByTestId("t041-mall-cart-points").innerText());
    await page.getByRole("button", { name: "去结算", exact: true }).click();

    const checkout = page.getByTestId("mall-checkout");
    const pointsPanel = page.getByTestId("t041-mall-checkout-points");
    const amounts = page.getByTestId("mall-checkout-amounts");
    const submitBar = page.getByTestId("mall-checkout-submitbar");
    const switcher = page.getByRole("switch", { name: "使用商城积分抵现" });

    await expect(pointsPanel).toContainText(/当前积分 \d+/);
    await expect(pointsPanel).toHaveAttribute("data-earn-rate", "1");
    expect(extractPoints(await pointsPanel.innerText())).toBe(cartPoints);
    await expect(pointsPanel).toContainText("当前抵现比例为示例");
    await expect(switcher).toHaveAttribute("aria-checked", "false");

    for (const label of ["商品金额", "运费", "商城优惠", "积分抵扣", "应付金额"]) {
      await expect(amounts).toContainText(label);
    }

    const before = extractMoney(await submitBar.innerText());
    await switcher.click();
    await expect(switcher).toHaveAttribute("aria-checked", "true");
    await expect(amounts).toContainText(/积分抵扣 · \d+ 积分/);
    await expect(amounts).toContainText(/-¥\d+\.\d{2}/);
    const after = extractMoney(await submitBar.innerText());
    expect(after).toBeLessThan(before);

    await switcher.click();
    await expect(switcher).toHaveAttribute("aria-checked", "false");
    expect(extractMoney(await submitBar.innerText())).toBe(before);
    await expect(checkout).not.toContainText(SOURCE_TERMS);
    await expectNoHorizontalOverflow(page);
  });

  test("discounted payable survives order submission without restoring source semantics", async ({ page }) => {
    await openCart(page);
    await page.getByRole("button", { name: "去结算", exact: true }).click();

    const switcher = page.getByRole("switch", { name: "使用商城积分抵现" });
    await switcher.click();
    const submitBar = page.getByTestId("mall-checkout-submitbar");
    const expectedPayable = extractMoney(await submitBar.innerText());

    await page.getByRole("button", { name: "提交订单", exact: true }).click();

    const order = page.getByTestId("mall-order");
    await expect(order).toBeVisible();
    const paidRow = order.getByText("实付金额", { exact: true }).locator("..");
    await expect(paidRow).toContainText(`¥${expectedPayable.toFixed(2)}`);
    await expect(order).not.toContainText(SOURCE_TERMS);
    await expectNoHorizontalOverflow(page);
  });

  test("390x844 cart and checkout points surfaces remain usable", async ({ page }) => {
    await openCart(page);
    await expect(page.getByTestId("t041-mall-cart-points")).toBeVisible();
    await expectNoHorizontalOverflow(page);

    await mkdir("test-results/t041-visual-evidence", { recursive: true });
    await page.screenshot({ path: "test-results/t041-visual-evidence/01-mall-cart-points.png", fullPage: false });

    await page.getByRole("button", { name: "去结算", exact: true }).click();
    await expect(page.getByTestId("t041-mall-checkout-points")).toBeVisible();
    await expect(page.getByRole("button", { name: "提交订单", exact: true })).toBeVisible();
    await expectNoHorizontalOverflow(page);
    await page.screenshot({ path: "test-results/t041-visual-evidence/02-mall-checkout-points.png", fullPage: false });
  });
});

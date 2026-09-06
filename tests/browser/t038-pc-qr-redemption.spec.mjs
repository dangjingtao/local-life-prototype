import { mkdir } from "node:fs/promises";
import { expect, test } from "@playwright/test";

const PC = "http://127.0.0.1:4174";

async function openMerchantFulfillment(page) {
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.goto(`${PC}/?role=merchant`);
  await page.getByRole("button", { name: "便利店履约", exact: true }).first().click();
  await expect(page.getByRole("heading", { name: "便利店订单与履约" })).toBeVisible();
}

async function expectNoHorizontalOverflow(page) {
  const metrics = await page.evaluate(() => ({
    viewport: window.innerWidth,
    html: document.documentElement.scrollWidth,
    body: document.body.scrollWidth,
  }));
  expect(Math.max(metrics.html, metrics.body), JSON.stringify(metrics)).toBeLessThanOrEqual(metrics.viewport + 1);
}

test.describe("T038 · PC pickup QR redemption", () => {
  test("mock QR scan resolves the T037 Shared order and completes the same redemption", async ({ page }) => {
    await openMerchantFulfillment(page);

    const scanner = page.getByTestId("t038-qr-redemption");
    await expect(scanner).toContainText("二维码 Mock");
    await scanner.getByRole("button", { name: "模拟扫码" }).click();

    const match = page.getByTestId("t038-qr-match");
    await expect(match).toContainText("LL-1024");
    await expect(match).toContainText("REDEEM-LL-1024");
    await expect(match).toContainText("locallife://pickup/LL-1024?credential=PICKUP-CREDENTIAL-LL-1024");
    await expect(match).toContainText("待确认核销");

    await match.getByRole("button", { name: "确认核销 LL-1024" }).click();

    await expect(match).toContainText("核销完成");
    await expect(match).toContainText("同一 redemption 已完成");
    await expect(page.getByTestId("t022-order-LL-1024")).toContainText("已完成");
    await expectNoHorizontalOverflow(page);

    await mkdir("test-results/t038-visual-evidence", { recursive: true });
    await page.screenshot({ path: "test-results/t038-visual-evidence/01-qr-redemption-completed.png", fullPage: true });
  });

  test("repeated QR scan is rejected after the shared redemption is completed", async ({ page }) => {
    await openMerchantFulfillment(page);

    const scanner = page.getByTestId("t038-qr-redemption");
    await scanner.getByRole("button", { name: "模拟扫码" }).click();
    await page.getByTestId("t038-qr-match").getByRole("button", { name: "确认核销 LL-1024" }).click();

    await scanner.getByRole("button", { name: "再次模拟扫码" }).click();

    await expect(scanner).toContainText("不可重复核销");
    await expect(scanner).toContainText("二维码已核销 / 凭证已失效");
    await expect(scanner).toContainText("同一 redemption 只能成功一次");
    await expect(page.getByTestId("t022-order-LL-1024")).toContainText("已完成");
    await expectNoHorizontalOverflow(page);
  });
});

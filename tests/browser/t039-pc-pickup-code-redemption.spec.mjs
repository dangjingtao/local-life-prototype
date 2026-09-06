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

test.describe("T039 · PC pickup code redemption", () => {
  test("wrong pickup code is rejected without changing the shared order", async ({ page }) => {
    await openMerchantFulfillment(page);

    const codeCard = page.getByTestId("t039-code-redemption");
    const pickup = page.getByTestId("t022-order-LL-1024");
    await expect(pickup).toContainText("待取货");

    await codeCard.getByLabel("数字取货码").fill("WRONG-CODE");
    await codeCard.getByRole("button", { name: "匹配订单" }).click();

    await expect(codeCard).toContainText("取货码错误或不存在");
    await expect(codeCard).toContainText("订单与核销状态未发生变化");
    await expect(pickup).toContainText("待取货");
    await expectNoHorizontalOverflow(page);
  });

  test("pickup code completes the same redemption and immediately disables QR redemption", async ({ page }) => {
    await openMerchantFulfillment(page);

    const codeCard = page.getByTestId("t039-code-redemption");
    await codeCard.getByLabel("数字取货码").fill("LL-1024");
    await codeCard.getByRole("button", { name: "匹配订单" }).click();

    const match = page.getByTestId("t039-code-match");
    await expect(match).toContainText("LL-1024");
    await expect(match).toContainText("REDEEM-LL-1024");
    await expect(match).toContainText("待确认核销");

    const qrCard = page.getByTestId("t038-qr-redemption");
    await qrCard.getByRole("button", { name: "模拟扫码" }).click();
    await expect(page.getByTestId("t038-qr-match")).toContainText("待确认核销");

    await match.getByRole("button", { name: "确认数字码核销 LL-1024" }).click();

    await expect(match).toContainText("核销完成");
    await expect(match).toContainText("二维码通道也立即失效");
    await expect(page.getByTestId("t022-order-LL-1024")).toContainText("已完成");
    await expect(qrCard).toContainText("不可重复核销");
    await expect(qrCard).toContainText("二维码已核销 / 凭证已失效");
    await expectNoHorizontalOverflow(page);

    await mkdir("test-results/t039-visual-evidence", { recursive: true });
    await page.screenshot({ path: "test-results/t039-visual-evidence/01-code-complete-qr-rejected.png", fullPage: true });
  });

  test("QR completion prevents the same pickup code from redeeming again", async ({ page }) => {
    await openMerchantFulfillment(page);

    const codeCard = page.getByTestId("t039-code-redemption");
    await codeCard.getByLabel("数字取货码").fill("LL-1024");
    await codeCard.getByRole("button", { name: "匹配订单" }).click();
    await expect(page.getByTestId("t039-code-match")).toContainText("待确认核销");

    const qrCard = page.getByTestId("t038-qr-redemption");
    await qrCard.getByRole("button", { name: "模拟扫码" }).click();
    await page.getByTestId("t038-qr-match").getByRole("button", { name: "确认核销 LL-1024" }).click();
    await expect(page.getByTestId("t022-order-LL-1024")).toContainText("已完成");

    await expect(codeCard).toContainText("不可重复核销");
    await expect(codeCard).toContainText("该订单已通过另一通道完成核销");
    await expect(codeCard).toContainText("只允许成功一次");
    await expectNoHorizontalOverflow(page);
  });
});

import { mkdir } from "node:fs/promises";
import { expect, test } from "@playwright/test";

const MOBILE = "http://127.0.0.1:4173";

async function openPickupOrder(page) {
  await page.goto(`${MOBILE}/?demoAuth=1`);
  await page.getByRole("navigation", { name: "一级导航" }).getByRole("button", { name: "便利店", exact: true }).click();
  await page.getByRole("button", { name: "选择门店：云岭社区店" }).click();
  await page.getByRole("button", { name: /打开购物车，3 件商品/ }).click();
  await page.getByRole("button", { name: "去结算" }).click();
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

test.describe("T037 · mobile pickup dual credential", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("same pickup order shows QR and numeric credential with synchronized state", async ({ page }) => {
    await openPickupOrder(page);

    const dual = page.getByTestId("pickup-dual-credential");
    const qr = page.getByTestId("pickup-qr-credential");
    const code = page.getByTestId("pickup-code-credential");

    await expect(dual).toBeVisible();
    await expect(page.getByText("未生效", { exact: true })).toBeVisible();
    await expect(page.getByRole("img", { name: "取货二维码，状态：未生效" })).toBeVisible();
    await expect(page.getByText("LL-1024", { exact: true }).last()).toBeVisible();
    await expect(qr).toHaveAttribute("data-redemption-id", "REDEEM-LL-1024");
    await expect(code).toHaveAttribute("data-redemption-id", "REDEEM-LL-1024");
    await expect(code.getByText("482731", { exact: true })).toBeVisible();
    await expect(code).not.toContainText("LL-1024");
    await expectNoHorizontalOverflow(page);

    await mkdir("test-results/t037-visual-evidence", { recursive: true });
    await page.getByRole("button", { name: "模拟备货完成" }).click();

    await expect(page.getByText("待取货", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("可核销", { exact: true })).toBeVisible();
    await expect(page.getByRole("img", { name: "取货二维码，状态：可核销" })).toBeVisible();
    await page.screenshot({ path: "test-results/t037-visual-evidence/01-ready-dual-credential.png", fullPage: false });
  });

  test("redemption completion expires both credentials together and remains reopenable", async ({ page }) => {
    await openPickupOrder(page);
    await page.getByRole("button", { name: "模拟备货完成" }).click();
    await page.getByRole("button", { name: "模拟店员核销" }).click();

    const qr = page.getByTestId("pickup-qr-credential");
    const code = page.getByTestId("pickup-code-credential");
    await expect(page.getByText("核销完成", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("已失效", { exact: true })).toBeVisible();
    await expect(page.getByRole("img", { name: "取货二维码，状态：已失效" })).toBeVisible();
    await expect(qr).toHaveAttribute("data-redemption-id", "REDEEM-LL-1024");
    await expect(code).toHaveAttribute("data-redemption-id", "REDEEM-LL-1024");
    await expect(page.getByText("LL-1024", { exact: true }).last()).toBeVisible();

    await mkdir("test-results/t037-visual-evidence", { recursive: true });
    await page.screenshot({ path: "test-results/t037-visual-evidence/02-completed-expired.png", fullPage: false });

    await page.getByRole("button", { name: "返回便利店继续选购" }).click();
    const recent = page.getByRole("button", { name: "查看最近自提订单 LL-1024" });
    await expect(recent).toBeVisible();
    await recent.click();

    await expect(page.getByRole("heading", { name: "LL-1024", exact: true })).toBeVisible();
    await expect(page.getByText("已失效", { exact: true })).toBeVisible();
    await expect(page.getByRole("img", { name: "取货二维码，状态：已失效" })).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test("short delivery still creates its existing delivery order path", async ({ page }) => {
    await page.goto(`${MOBILE}/?demoAuth=1`);
    await page.getByRole("navigation", { name: "一级导航" }).getByRole("button", { name: "便利店", exact: true }).click();
    await page.getByRole("button", { name: "选择门店：云岭社区店" }).click();
    await page.getByRole("button", { name: /打开购物车，3 件商品/ }).click();
    await page.getByRole("button", { name: "去结算" }).click();
    await page.getByRole("button", { name: /约 3 km 短配/ }).click();
    await page.getByRole("button", { name: "提交订单" }).click();

    await expect(page.getByRole("heading", { name: /CONV-YUNLING-8888-DELIVERY/ })).toBeVisible();
    await expect(page.getByText("门店接单 / 备货中", { exact: true })).toBeVisible();
    await expect(page.getByTestId("pickup-dual-credential")).toHaveCount(0);
  });
});

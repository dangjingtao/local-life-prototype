import { expect, test } from "@playwright/test";

const MOBILE = "http://127.0.0.1:4173";

async function openConvenience(page) {
  await page.goto(`${MOBILE}/?demoAuth=1`);
  await page.getByRole("navigation", { name: "一级导航" }).getByRole("button", { name: "便利店", exact: true }).click();
  await expect(page.getByRole("heading", { name: "先选门店，再开始选购" })).toBeVisible();
}

async function openCheckout(page) {
  await openConvenience(page);
  await page.getByRole("button", { name: "选择门店：云岭社区店" }).click();
  await page.getByRole("button", { name: /打开购物车，3 件商品/ }).click();
  await page.getByRole("button", { name: "去结算" }).click();
  await expect(page.getByRole("heading", { name: "选择履约方式并确认订单" })).toBeVisible();
}

async function expectNoHorizontalOverflow(page) {
  const metrics = await page.evaluate(() => ({
    viewport: window.innerWidth,
    html: document.documentElement.scrollWidth,
    body: document.body.scrollWidth,
  }));
  expect(Math.max(metrics.html, metrics.body), JSON.stringify(metrics)).toBeLessThanOrEqual(metrics.viewport + 1);
}

test.describe("T018 · Mobile convenience settlement, pickup and 3km short delivery", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("settlement expresses member savings, coupon, points, fulfillment fee and payable", async ({ page }) => {
    await openCheckout(page);

    await expect(page.getByText("商品金额", { exact: true })).toBeVisible();
    await expect(page.getByText("会员优惠（3 件）", { exact: true })).toBeVisible();
    await expect(page.getByText("-¥4.00", { exact: true })).toBeVisible();
    await expect(page.getByText("门店 10 元优惠券 · 已使用 -¥10.00", { exact: true })).toBeVisible();
    await expect(page.getByText(/积分抵扣/)).toBeVisible();
    await expect(page.getByText("自提 ¥0", { exact: true })).toBeVisible();
    await expect(page.getByText("应付金额", { exact: true })).toBeVisible();
    await expect(page.getByText("¥26.60", { exact: true })).toBeVisible();

    await page.getByRole("button", { name: "使用积分" }).click();
    await expect(page.getByText("¥24.60", { exact: true })).toBeVisible();
    await expect(page.getByText(/使用 200 积分抵 ¥2.00/)).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test("pickup flow runs continuously to pickup-code redemption", async ({ page }) => {
    await openCheckout(page);

    await expect(page.getByRole("button", { name: /到店自提/ })).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("button", { name: /今天 \d{2}:\d{2}-\d{2}:\d{2}/ }).first()).toBeVisible();
    await page.getByRole("button", { name: "提交演示订单" }).click();

    await expect(page.getByRole("heading", { name: /CONV-YUNLING-8888/ })).toBeVisible();
    await expect(page.getByText("备货中", { exact: true }).first()).toBeVisible();
    await page.getByRole("button", { name: "模拟备货完成" }).click();

    await expect(page.getByText("待取货", { exact: true }).first()).toBeVisible();
    await expect(page.getByText(/PK-\d{4}/)).toBeVisible();
    await expect(page.getByText("取货码", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "模拟店员核销" }).click();

    await expect(page.getByText("核销完成", { exact: true }).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: "商品已完成自提" })).toBeVisible();
    await page.getByRole("button", { name: "返回便利店继续选购" }).click();
    await expect(page.getByRole("button", { name: /打开购物车，0 件商品/ })).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test("short delivery exposes an in-range and an out-of-range address state", async ({ page }) => {
    await openCheckout(page);

    await page.getByRole("button", { name: /约 3 km 短配/ }).click();
    await expect(page.getByRole("button", { name: /可配送 · 1.2 km/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /超出配送范围 · 4.5 km/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /超出配送范围 · 4.5 km/ })).toBeDisabled();
    await expect(page.getByText("短配示例 ¥5.00", { exact: true })).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test("short delivery flow runs continuously to delivered", async ({ page }) => {
    await openCheckout(page);

    await page.getByRole("button", { name: /约 3 km 短配/ }).click();
    await expect(page.getByRole("button", { name: /可配送 · 1.2 km/ })).toHaveAttribute("aria-pressed", "true");
    await page.getByRole("button", { name: "提交演示订单" }).click();

    await expect(page.getByRole("heading", { name: /CONV-YUNLING-8888/ })).toBeVisible();
    await expect(page.getByText("门店接单 / 备货中", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "模拟开始配送" }).click();

    await expect(page.getByText("配送中", { exact: true }).first()).toBeVisible();
    await expect(page.getByText(/约 1.2 km/)).toBeVisible();
    await page.getByRole("button", { name: "模拟送达" }).click();

    await expect(page.getByText("已送达", { exact: true }).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: "短距配送已完成" })).toBeVisible();
    await expect(page.getByText("配送费", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "返回便利店继续选购" }).click();
    await expect(page.getByRole("button", { name: /打开购物车，0 件商品/ })).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test("fulfillment switch keeps the same store cart and never mixes mall carts", async ({ page }) => {
    await openCheckout(page);

    await page.getByRole("button", { name: /约 3 km 短配/ }).click();
    await expect(page.getByText(/云岭社区店 · 结算/)).toBeVisible();
    await expect(page.getByText(/不跨店、不与商城混单/)).toBeVisible();
    await expect(page.getByText(/线上商城/)).toHaveCount(0);

    await page.getByRole("button", { name: /到店自提/ }).click();
    await expect(page.getByText("自提 ¥0", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: /今天 \d{2}:\d{2}-\d{2}:\d{2}/ }).first()).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });
});

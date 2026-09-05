import { mkdir } from "node:fs/promises";
import { expect, test } from "@playwright/test";

const MOBILE = "http://127.0.0.1:4173";
const PC = "http://127.0.0.1:4174";

async function expectNoHorizontalOverflow(page) {
  const metrics = await page.evaluate(() => ({
    viewport: window.innerWidth,
    html: document.documentElement.scrollWidth,
    body: document.body.scrollWidth,
  }));
  expect(Math.max(metrics.html, metrics.body), JSON.stringify(metrics)).toBeLessThanOrEqual(metrics.viewport + 1);
}

async function openMerchantFulfillment(page, width = 1024, height = 768) {
  await page.setViewportSize({ width, height });
  await page.goto(`${PC}/?role=merchant`);
  await page.getByRole("button", { name: "便利店履约", exact: true }).first().click();
  await expect(page.getByRole("heading", { name: "便利店订单与履约" })).toBeVisible();
}

async function openOperatorFulfillment(page, width = 1440, height = 900) {
  await page.setViewportSize({ width, height });
  await page.goto(`${PC}/?role=operator`);
  await page.getByRole("button", { name: "便利店履约", exact: true }).first().click();
  await expect(page.getByRole("main").getByRole("heading", { name: "便利店履约", exact: true })).toBeVisible();
}

async function openMobileShortDelivery(page) {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${MOBILE}/?demoAuth=1`);
  await page.getByRole("navigation", { name: "一级导航" }).getByRole("button", { name: "便利店", exact: true }).click();
  await page.getByRole("button", { name: "选择门店：云岭社区店" }).click();
  await page.getByRole("button", { name: /打开购物车，\d+ 件商品/ }).click();
  await page.getByRole("dialog", { name: "购物车" }).getByRole("button", { name: "去结算" }).click();
  await page.getByRole("button", { name: "约 3 km 短配" }).click();
  await page.getByRole("button", { name: "提交订单" }).click();
  await expect(page.getByRole("heading", { name: /CONV-YUNLING-8888-DELIVERY/ })).toBeVisible();
}

async function openMobilePickup(page) {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${MOBILE}/?demoAuth=1`);
  await page.getByRole("navigation", { name: "一级导航" }).getByRole("button", { name: "便利店", exact: true }).click();
  await page.getByRole("button", { name: "选择门店：云岭社区店" }).click();
  await page.getByRole("button", { name: /打开购物车，\d+ 件商品/ }).click();
  await page.getByRole("dialog", { name: "购物车" }).getByRole("button", { name: "去结算" }).click();
  await page.getByRole("button", { name: "提交订单" }).click();
  await expect(page.getByRole("heading", { name: /CONV-YUNLING-8888-PICKUP/ })).toBeVisible();
}

test.describe("T022 · PC convenience fulfillment operations", () => {
  test("merchant handles own-store pickup redemption and short-delivery state flow at 1024", async ({ page }) => {
    await openMerchantFulfillment(page, 1024, 768);

    const pickup = page.getByTestId("t022-order-LL-1024");
    const delivery = page.getByTestId("t022-order-CONV-YUNLING-8888-DELIVERY");

    await expect(pickup).toContainText("云岭社区店");
    await expect(pickup).toContainText("到店自提");
    await expect(pickup).toContainText("待取货");
    await expect(delivery).toContainText("云岭社区店");
    await expect(delivery).toContainText("约 3 km 短配");
    await expect(delivery).toContainText("备货中");

    await pickup.getByRole("button", { name: "扫码核销 LL-1024" }).click();
    await expect(pickup).toContainText("已完成");
    await expect(pickup.getByRole("button", { name: "已完成核销" })).toBeDisabled();

    await delivery.getByRole("button", { name: "开始配送 CONV-YUNLING-8888-DELIVERY" }).click();
    await expect(delivery).toContainText("配送中");
    await delivery.getByRole("button", { name: "确认送达 CONV-YUNLING-8888-DELIVERY" }).click();
    await expect(delivery).toContainText("已完成");

    await expect(page.getByText("南岸生活馆")).toHaveCount(0);
    await expectNoHorizontalOverflow(page);

    await page.getByRole("button", { name: "工作台", exact: true }).first().click();
    await expect(page.getByText("演示业务日 2026-09-05")).toBeVisible();
    await page.getByRole("button", { name: "便利店履约", exact: true }).first().click();
    await expect(page.getByTestId("t022-order-LL-1024")).toContainText("已完成");
    await expect(page.getByTestId("t022-order-CONV-YUNLING-8888-DELIVERY")).toContainText("已完成");

    await mkdir("test-results/t022-visual-evidence", { recursive: true });
    await page.screenshot({ path: "test-results/t022-visual-evidence/01-merchant-1024.png", fullPage: true });
  });

  test("operator sees cross-store fulfillment, availability and capability concepts at 1440", async ({ page }) => {
    await openOperatorFulfillment(page, 1440, 900);

    await expect(page.getByText("门店履约能力配置（Mock）")).toBeVisible();
    await expect(page.getByText("门店商品可售关系")).toBeVisible();
    await expect(page.getByText("云岭社区店").first()).toBeVisible();
    await expect(page.getByText("南岸生活馆").first()).toBeVisible();
    await expect(page.getByText("星河社区店").first()).toBeVisible();

    const coreDelivery = page.getByTestId("t022-operator-order-CONV-YUNLING-8888-DELIVERY");
    const nananDelivery = page.getByTestId("t022-operator-order-LL-1030");
    await expect(coreDelivery).toContainText("约 3 km 短配");
    await expect(coreDelivery).toContainText("1.2 km");
    await expect(nananDelivery).toContainText("南岸生活馆");
    await expect(nananDelivery).toContainText("配送中");

    await expect(page.getByText("3 km").first()).toBeVisible();
    await expect(page.getByText("仅表达履约能力和范围").first()).toBeVisible();
    await expectNoHorizontalOverflow(page);

    await mkdir("test-results/t022-visual-evidence", { recursive: true });
    await page.screenshot({ path: "test-results/t022-visual-evidence/02-operator-1440.png", fullPage: true });
  });

  test("Mobile short-delivery order matches PC order id, store and initial status", async ({ page }) => {
    await openMobileShortDelivery(page);

    await expect(page.getByText("云岭社区店").first()).toBeVisible();
    await expect(page.getByText("门店接单 / 备货中", { exact: true })).toBeVisible();

    await openMerchantFulfillment(page, 1024, 768);
    const delivery = page.getByTestId("t022-order-CONV-YUNLING-8888-DELIVERY");
    await expect(delivery).toContainText("云岭社区店");
    await expect(delivery).toContainText("备货中");
    await expectNoHorizontalOverflow(page);
  });

  test("Mobile pickup order matches PC pickup id, store and initial status", async ({ page }) => {
    await openMobilePickup(page);

    await expect(page.getByText("云岭社区店").first()).toBeVisible();
    await expect(page.getByText("门店正在备货", { exact: true })).toBeVisible();

    await openMerchantFulfillment(page, 1024, 768);
    const pickup = page.getByTestId("t022-order-CONV-YUNLING-8888-PICKUP");
    await expect(pickup).toContainText("云岭社区店");
    await expect(pickup).toContainText("备货中");
    await expectNoHorizontalOverflow(page);
  });

  test("merchant and operator views remain overflow-free at both acceptance widths", async ({ page }) => {
    for (const width of [1024, 1440]) {
      await openMerchantFulfillment(page, width, 900);
      await expectNoHorizontalOverflow(page);
      await openOperatorFulfillment(page, width, 900);
      await expectNoHorizontalOverflow(page);
    }
  });
});

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

async function openMerchantCare(page, width = 1024, height = 900) {
  await page.setViewportSize({ width, height });
  await page.goto(`${PC}/?role=merchant`);
  await page.getByRole("button", { name: "智慧抗衰运营", exact: true }).first().click();
  await expect(page.getByRole("main").getByRole("heading", { name: "智慧抗衰预约与报告运营" })).toBeVisible();
}

async function openOperatorCare(page, width = 1440, height = 900) {
  await page.setViewportSize({ width, height });
  await page.goto(`${PC}/?role=operator`);
  await page.getByRole("button", { name: "智慧抗衰运营", exact: true }).first().click();
  await expect(page.getByRole("main").getByRole("heading", { name: "智慧抗衰运营", exact: true })).toBeVisible();
  await expect(page.getByRole("main").getByRole("heading", { name: "智慧抗衰预约与报告运营" })).toBeVisible();
}

async function openMobileCare(page) {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${MOBILE}/?demoAuth=1`);
  await page.getByRole("navigation", { name: "一级导航" }).getByRole("button", { name: "智慧抗衰", exact: true }).click();
  await expect(page.getByRole("heading", { name: "先预约，再到店完成检测与服务。" })).toBeVisible();
}

async function openMobileLatestReport(page) {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${MOBILE}/?demoAuth=1`);
  await page.getByRole("navigation", { name: "一级导航" }).getByRole("button", { name: "我的", exact: true }).click();
  await page.getByRole("button", { name: /我的检测/ }).click();
  await page.getByRole("button", { name: /基础状态检测/ }).first().click();
  await expect(page.getByText("检测结果指标")).toBeVisible();
}

test.describe("T023 · PC smart care operations", () => {
  test("merchant maintains own-store slots and state persists across navigation at 1024", async ({ page }) => {
    await openMerchantCare(page, 1024, 900);

    const slot = page.getByTestId("t023-slot-SLOT-YUNLING-0901-1500");
    await expect(slot).toContainText("云岭社区店");
    await expect(slot).toContainText("基础状态检测");
    await expect(slot).toContainText("可约");

    await slot.getByRole("button", { name: "暂停开放" }).click();
    await expect(slot).toContainText("不可约 · 已暂停");

    await page.getByRole("button", { name: "工作台", exact: true }).first().click();
    await page.getByRole("button", { name: "智慧抗衰运营", exact: true }).first().click();
    await expect(page.getByTestId("t023-slot-SLOT-YUNLING-0901-1500")).toContainText("不可约 · 已暂停");

    await page.getByTestId("t023-slot-SLOT-YUNLING-0901-1500").getByRole("button", { name: "恢复开放" }).click();
    await expect(page.getByTestId("t023-slot-SLOT-YUNLING-0901-1500")).toContainText("可约");
    await expect(page.getByTestId("t023-project-CARE-PROJECT-BASIC")).not.toContainText("南岸生活馆");
    await expect(page.getByTestId("t023-project-CARE-PROJECT-SOOTHING")).toHaveCount(0);
    await expect(page.getByTestId("t023-slot-SLOT-NANAN-0901-1400")).toHaveCount(0);
    await expectNoHorizontalOverflow(page);
  });

  test("merchant scans scheduled appointment and keeps checked-in status across navigation", async ({ page }) => {
    await openMerchantCare(page, 1024, 900);

    const scheduled = page.getByTestId("t023-appointment-APPOINTMENT-8888-01");
    await expect(scheduled).toContainText("已预约");
    await expect(page.getByTestId("t023-appointment-detail")).toContainText("CARE-APPT-8888");
    await expect(page.getByTestId("t023-appointment-detail")).toContainText("核销前 · 待扫码");

    await page.getByRole("button", { name: "扫码核销 CARE-APPT-8888" }).click();
    await expect(page.getByTestId("t023-appointment-detail")).toContainText("核销中");
    await expect(page.getByTestId("t023-appointment-APPOINTMENT-8888-01")).toContainText("已预约");

    await page.getByRole("button", { name: "工作台", exact: true }).first().click();
    await page.getByRole("button", { name: "智慧抗衰运营", exact: true }).first().click();
    await expect(page.getByTestId("t023-appointment-detail")).toContainText("核销中");

    await page.getByRole("button", { name: "完成模拟核销" }).click();
    await expect(page.getByTestId("t023-appointment-detail")).toContainText("核销成功");
    await expect(page.getByTestId("t023-appointment-APPOINTMENT-8888-01")).toContainText("已到店");
    await expectNoHorizontalOverflow(page);
  });

  test("appointment history covers checked-in, cancelled and rescheduled and traces completed visit to report", async ({ page }) => {
    await openMerchantCare(page, 1024, 900);

    await expect(page.getByTestId("t023-appointment-APPOINTMENT-8892-CHECKIN")).toContainText("已到店");
    await expect(page.getByTestId("t023-appointment-APPOINTMENT-8893-CANCELLED")).toContainText("已取消");
    await expect(page.getByTestId("t023-appointment-APPOINTMENT-8893-RESCHEDULED")).toContainText("已改期");

    await page.getByTestId("t023-appointment-APPOINTMENT-8888-RECENT").getByRole("button", { name: "查看详情" }).click();
    const detail = page.getByTestId("t023-appointment-detail");
    await expect(detail).toContainText("APPOINTMENT-8888-RECENT");
    await expect(detail).toContainText("DETECTION-8888-01");
    await expect(detail).toContainText("REPORT-CARE-0001");
    await expectNoHorizontalOverflow(page);
  });

  test("report operations expose coupon package retest and non-medical boundary", async ({ page }) => {
    await openMerchantCare(page, 1440, 900);

    const report = page.getByTestId("t023-report-REPORT-CARE-0001");
    await expect(report).toContainText("APPOINTMENT-8888-RECENT");
    await expect(report).toContainText("DETECTION-8888-01");
    await expect(report).toContainText("检测后专属护理 30 元券");
    await expect(report).toContainText("COUPON-CARE-8888-REPORT");
    await expect(report).toContainText("基础护理套餐");
    await expect(report).toContainText("SERVICE-CARE-PACKAGE");
    await expect(report).toContainText("2026");
    await expect(report).toContainText("非医疗诊断边界");
    await expectNoHorizontalOverflow(page);

    await mkdir("test-results/t023-visual-evidence", { recursive: true });
    await page.screenshot({ path: "test-results/t023-visual-evidence/01-merchant-care-1440.png", fullPage: true });
  });

  test("operator sees global projects stores full slot and can maintain available slot", async ({ page }) => {
    await openOperatorCare(page, 1440, 900);

    await expect(page.getByTestId("t023-project-CARE-PROJECT-BASIC")).toContainText("云岭社区店");
    await expect(page.getByTestId("t023-project-CARE-PROJECT-SOOTHING")).toContainText("南岸生活馆");

    const fullSlot = page.getByTestId("t023-slot-SLOT-NANAN-0901-1400");
    await expect(fullSlot).toContainText("南岸生活馆");
    await expect(fullSlot).toContainText("已满");
    await expect(fullSlot.getByText("由预约占用状态决定")).toBeVisible();

    const available = page.getByTestId("t023-slot-SLOT-YUNLING-0901-1500");
    await available.getByRole("button", { name: "暂停开放" }).click();
    await expect(available).toContainText("不可约 · 已暂停");

    await page.getByRole("button", { name: "运营总览", exact: true }).first().click();
    await page.getByRole("button", { name: "智慧抗衰运营", exact: true }).first().click();
    await expect(page.getByTestId("t023-slot-SLOT-YUNLING-0901-1500")).toContainText("不可约 · 已暂停");
    await expectNoHorizontalOverflow(page);

    await mkdir("test-results/t023-visual-evidence", { recursive: true });
    await page.screenshot({ path: "test-results/t023-visual-evidence/02-operator-care-1440.png", fullPage: true });
  });

  test("Mobile and PC preserve the same appointment and report business facts", async ({ page }) => {
    await openMobileCare(page);
    await expect(page.getByText("基础状态检测").first()).toBeVisible();
    await expect(page.getByText(/10:30.*云岭社区店/)).toBeVisible();

    await openMerchantCare(page, 1024, 900);
    const appointment = page.getByTestId("t023-appointment-APPOINTMENT-8888-01");
    await expect(appointment).toContainText("基础状态检测");
    await expect(appointment).toContainText("云岭社区店");
    await expect(appointment).toContainText("10:30");
    await expect(appointment).toContainText("已预约");

    await openMobileLatestReport(page);
    await expect(page.getByText("检测后专属护理 30 元券")).toBeVisible();
    await expect(page.getByText("基础护理套餐")).toBeVisible();

    await openMerchantCare(page, 1024, 900);
    const report = page.getByTestId("t023-report-REPORT-CARE-0001");
    await expect(report).toContainText("检测后专属护理 30 元券");
    await expect(report).toContainText("基础护理套餐");
    await expectNoHorizontalOverflow(page);
  });

  test("merchant and operator smart care views stay overflow-free at 1024 and 1440", async ({ page }) => {
    for (const width of [1024, 1440]) {
      await openMerchantCare(page, width, 900);
      await expectNoHorizontalOverflow(page);
      await openOperatorCare(page, width, 900);
      await expectNoHorizontalOverflow(page);
    }
  });
});

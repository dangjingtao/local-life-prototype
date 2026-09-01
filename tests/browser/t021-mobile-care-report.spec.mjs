import { expect, test } from "@playwright/test";

const MOBILE = "http://127.0.0.1:4173";

async function openMobile(page) {
  await page.goto(`${MOBILE}/?demoAuth=1`);
  await expect(page.getByRole("navigation", { name: "一级导航" })).toBeVisible();
}

async function openMyReports(page) {
  await openMobile(page);
  await page.getByRole("navigation").getByRole("button", { name: "我的", exact: true }).click();
  await page.getByRole("button", { name: /我的检测/ }).click();
  await expect(page.getByRole("heading", { name: "历次检测报告" })).toBeVisible();
}

async function openLatestReport(page) {
  await openMyReports(page);
  await page.getByRole("button", { name: /基础状态检测/ }).first().click();
  await expect(page.getByRole("heading", { name: "基础状态检测" }).first()).toBeVisible();
}

async function expectNoHorizontalOverflow(page) {
  const metrics = await page.evaluate(() => ({
    viewport: window.innerWidth,
    html: document.documentElement.scrollWidth,
    body: document.body.scrollWidth,
  }));
  expect(Math.max(metrics.html, metrics.body), JSON.stringify(metrics)).toBeLessThanOrEqual(metrics.viewport + 1);
}

test.describe("T021 · Mobile 智慧抗衰检测报告、转化与历史对比", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("我的检测列表展示历次记录，报告详情包含指标、建议、专属券、套餐、复测与对比入口", async ({ page }) => {
    await openMyReports(page);

    await expect(page.getByText("2 次检测")).toBeVisible();

    await page.getByRole("button", { name: /基础状态检测/ }).first().click();
    await expect(page.getByRole("heading", { name: "基础状态检测" }).first()).toBeVisible();

    await expect(page.getByText("检测结果指标")).toBeVisible();
    await expect(page.getByText("头皮油脂表现")).toBeVisible();
    await expect(page.getByText("肌肤含水表现")).toBeVisible();
    await expect(page.getByText("个性化护理建议")).toBeVisible();
    await expect(page.getByText("检测后专属护理 30 元券")).toBeVisible();
    await expect(page.getByText("基础护理套餐")).toBeVisible();
    await expect(page.getByRole("heading", { name: "复测提醒" })).toBeVisible();
    await expect(page.getByRole("button", { name: "查看历史对比" })).toBeVisible();
    await expect(page.getByText("非医疗诊断边界")).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test("历史报告对比表达两次检测的指标与状态差异", async ({ page }) => {
    await openLatestReport(page);
    await page.getByRole("button", { name: "查看历史对比" }).click();

    await expect(page.getByRole("heading", { name: /两次对照/ })).toBeVisible();
    await expect(page.getByText("指标对照")).toBeVisible();
    await expect(page.getByText("头皮油脂表现")).toBeVisible();
    await expect(page.getByText(/历次 ·/).first()).toBeVisible();
    await expect(page.getByText(/最近 ·/).first()).toBeVisible();
    await expect(page.getByText(/对比仅用于产品结构演示/)).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test("检测完成后可从智慧抗衰流程直接进入报告页", async ({ page }) => {
    await openMobile(page);
    await page.getByRole("navigation").getByRole("button", { name: "智慧抗衰", exact: true }).click();
    await page.getByRole("button", { name: "查看项目并预约" }).first().click();
    await page.getByRole("button", { name: "选择此门店" }).first().click();
    await page.getByRole("button", { name: /15:00.*可约/ }).click();
    await page.getByRole("button", { name: "确认预约" }).click();
    await page.getByRole("button", { name: "查看预约二维码 / 预约码" }).click();
    await page.getByRole("button", { name: "模拟店员扫码核销" }).click();
    await page.getByRole("button", { name: "完成模拟核销" }).click();
    await page.getByRole("button", { name: "开始检测" }).click();
    await page.getByRole("button", { name: "完成模拟检测" }).click();
    await expect(page.getByRole("heading", { name: "本次到店流程已完成" })).toBeVisible();

    await page.getByRole("button", { name: "查看检测报告" }).click();
    await expect(page.getByRole("heading", { name: "基础状态检测" }).first()).toBeVisible();
    await expect(page.getByText("检测结果指标")).toBeVisible();
    await expect(page.getByText(/个性化护理建议/)).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test("我的检测返回导航按入口回到对应一级页", async ({ page }) => {
    await openMyReports(page);
    await page.getByRole("button", { name: /返回我的/ }).click();
    await expect(page.getByRole("heading", { name: "本地生活" })).not.toBeVisible();
    await expect(page.getByText("我的权益")).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });
});

import { expect, test } from "@playwright/test";

const MOBILE = "http://127.0.0.1:4173";

async function openMobile(page) {
  await page.goto(`${MOBILE}/?demoAuth=1`);
  await expect(page.getByRole("navigation", { name: "一级导航" })).toBeVisible();
}

async function openSmartCare(page) {
  await openMobile(page);
  await page.getByRole("navigation").getByRole("button", { name: "智慧抗衰", exact: true }).click();
  await expect(page.getByRole("heading", { name: "先预约，再到店完成检测与服务。" })).toBeVisible();
}

async function expectNoHorizontalOverflow(page) {
  const metrics = await page.evaluate(() => ({
    viewport: window.innerWidth,
    html: document.documentElement.scrollWidth,
    body: document.body.scrollWidth,
  }));
  expect(Math.max(metrics.html, metrics.body), JSON.stringify(metrics)).toBeLessThanOrEqual(metrics.viewport + 1);
}

test.describe("T020 · Mobile 智慧抗衰预约与核销", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("project → store → slot → appointment → QR → check-in → detection complete", async ({ page }) => {
    await openSmartCare(page);

    await expect(page.getByText("2 小时内已锁定")).toBeVisible();
    await expect(page.getByRole("button", { name: "改期" }).first()).toBeDisabled();
    await expect(page.getByRole("button", { name: "取消预约" }).first()).toBeDisabled();

    await page.getByRole("button", { name: "查看项目并预约" }).first().click();
    await expect(page.getByRole("heading", { name: "基础状态检测" })).toBeVisible();
    await page.getByRole("button", { name: "选择此门店" }).first().click();

    await expect(page.getByText(/已满：/)).toBeVisible();
    await expect(page.getByText(/不可约：/)).toBeVisible();
    await expect(page.getByRole("button", { name: /10:30/ })).toBeDisabled();

    await page.getByRole("button", { name: /15:00/ }).click();
    await expect(page.getByRole("heading", { name: "确认本次到店安排" })).toBeVisible();
    await expect(page.getByText("LL-8888")).toBeVisible();
    await expect(page.getByText("CARE-PROJECT-BASIC")).toBeVisible();
    await expect(page.getByText("STORE-YUNLING")).toBeVisible();
    await expect(page.getByText("SLOT-YUNLING-0901-1500")).toBeVisible();

    await page.getByRole("button", { name: "确认预约" }).click();
    await expect(page.getByRole("heading", { name: "预约已确认" })).toBeVisible();
    await expect(page.getByText("可修改", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "改期" })).toBeEnabled();
    await expect(page.getByRole("button", { name: "取消预约" })).toBeEnabled();

    await page.getByRole("button", { name: "查看预约二维码 / 预约码" }).click();
    await expect(page.getByRole("heading", { name: "出示预约二维码" })).toBeVisible();
    await expect(page.getByText("CARE-APPT-8888-T020")).toBeVisible();

    await page.getByRole("button", { name: "模拟店员扫码核销" }).click();
    await expect(page.getByRole("heading", { name: "核销中" })).toBeVisible();
    await page.getByRole("button", { name: "完成模拟核销" }).click();
    await expect(page.getByText("核销成功", { exact: true })).toBeVisible();

    await page.getByRole("button", { name: "开始检测" }).click();
    await expect(page.getByRole("heading", { name: "检测中" })).toBeVisible();
    await page.getByRole("button", { name: "完成模拟检测" }).click();
    await expect(page.getByRole("heading", { name: "本次到店流程已完成" })).toBeVisible();
    await expect(page.getByText("T021 handoff")).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test("global search carries Care Project into appointment flow", async ({ page }) => {
    await openMobile(page);
    await page.getByRole("button", { name: "打开全局搜索" }).click();
    await page.getByLabel("全局搜索").fill("基础状态检测");
    await page.getByRole("button", { name: "查看智慧抗衰结果：基础状态检测" }).click();

    await expect(page.getByRole("heading", { name: "基础状态检测" })).toBeVisible();
    await expect(page.getByText("搜索已直接定位到项目")).toBeVisible();
    await expect(page.getByText("CARE-PROJECT-BASIC")).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });
});

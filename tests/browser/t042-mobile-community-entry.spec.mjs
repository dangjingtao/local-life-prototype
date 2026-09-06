import { mkdir } from "node:fs/promises";
import { expect, test } from "@playwright/test";

const MOBILE = "http://127.0.0.1:4173";
const EVIDENCE_DIR = "test-results/t042-visual-evidence";

async function openMy(page) {
  await page.goto(`${MOBILE}/?demoAuth=1`);
  await page.getByRole("navigation", { name: "一级导航" }).getByRole("button", { name: "我的", exact: true }).click();
  await expect(page.getByRole("heading", { name: "我的", exact: true })).toBeVisible();
}

async function expectNoHorizontalOverflow(page) {
  const metrics = await page.evaluate(() => ({
    viewport: window.innerWidth,
    html: document.documentElement.scrollWidth,
    body: document.body.scrollWidth,
  }));
  expect(Math.max(metrics.html, metrics.body), JSON.stringify(metrics)).toBeLessThanOrEqual(metrics.viewport + 1);
}

test.describe("T042 · mobile persistent community entry", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test.beforeAll(async () => {
    await mkdir(EVIDENCE_DIR, { recursive: true });
  });

  test("My keeps a persistent Join Community entry and opens the guide", async ({ page }) => {
    await openMy(page);

    const entry = page.getByRole("button", { name: /加入社群/ });
    await expect(entry).toBeVisible();
    await expect(entry).toContainText("门店福利 · 社群动态");
    await expect(page.locator("body")).not.toContainText(/Mock|fixture/i);
    await expectNoHorizontalOverflow(page);
    await page.screenshot({ path: `${EVIDENCE_DIR}/01-my-community-entry.png`, fullPage: false });

    await entry.click();

    const guide = page.getByTestId("community-guide");
    await expect(guide).toBeVisible();
    await expect(page.getByRole("heading", { name: "加入社群", exact: true })).toBeVisible();
    const topbarBox = await page.getByTestId("community-guide-topbar").boundingBox();
    expect(topbarBox).not.toBeNull();
    expect(topbarBox.y, JSON.stringify(topbarBox)).toBeLessThanOrEqual(1);
    await expectNoHorizontalOverflow(page);
  });

  test("guide consumes Shared QR identity and the three community benefits", async ({ page }) => {
    await openMy(page);
    await page.getByRole("button", { name: /加入社群/ }).click();

    const qr = page.getByTestId("community-qr");
    await expect(qr).toBeVisible();
    await expect(qr).toHaveAttribute("data-qr-asset-key", "community-yunling-demo");
    await expect(qr).toHaveAttribute("aria-label", "加入社群二维码示意");

    const benefits = page.getByTestId("community-benefits");
    for (const label of ["专属优惠", "上新通知", "直播优惠"]) {
      await expect(benefits).toContainText(label);
    }

    await expect(page.getByText("长按识别二维码", { exact: true })).toBeVisible();
    await expect(page.getByText(/也可以先保存图片/)).toBeVisible();
    await expect(page.getByText(/暂不能实际入群/)).toBeVisible();
    await expect(page.locator("body")).not.toContainText(/Mock|fixture/i);
    await expectNoHorizontalOverflow(page);
    await page.screenshot({ path: `${EVIDENCE_DIR}/02-community-guide.png`, fullPage: false });
  });

  test("QR image can be saved and the guide returns normally to My", async ({ page }) => {
    await openMy(page);
    await page.getByRole("button", { name: /加入社群/ }).click();

    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "保存二维码图片", exact: true }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe("加入社群二维码.svg");

    await page.getByRole("button", { name: "返回我的", exact: true }).click();
    await expect(page.getByRole("heading", { name: "我的", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: /加入社群/ })).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test("community guide stays an inner page instead of becoming a first-level tab", async ({ page }) => {
    await openMy(page);
    const nav = page.getByRole("navigation", { name: "一级导航" });
    await expect(nav.getByRole("button", { name: "加入社群", exact: true })).toHaveCount(0);

    await page.getByRole("button", { name: /加入社群/ }).click();
    await expect(page.getByTestId("community-guide")).toBeVisible();
    await expect(nav.getByRole("button", { name: "加入社群", exact: true })).toHaveCount(0);
    await expect(nav.getByRole("button", { name: "我的", exact: true })).toHaveAttribute("aria-current", "page");
  });
});

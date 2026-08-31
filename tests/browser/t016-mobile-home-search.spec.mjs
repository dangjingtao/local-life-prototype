import { expect, test } from "@playwright/test";

const MOBILE = "http://127.0.0.1:4173";

async function openMobile(page) {
  await page.goto(`${MOBILE}/?demoAuth=1`);
  await expect(page.getByRole("navigation", { name: "一级导航" })).toBeVisible();
}

async function expectNoHorizontalOverflow(page) {
  const metrics = await page.evaluate(() => ({
    viewport: window.innerWidth,
    html: document.documentElement.scrollWidth,
    body: document.body.scrollWidth,
  }));
  expect(Math.max(metrics.html, metrics.body), JSON.stringify(metrics)).toBeLessThanOrEqual(metrics.viewport + 1);
}

async function openPrototypePanel(page) {
  const panel = page.locator("details").filter({ hasText: /Prototype ·/ }).last();
  if (!(await panel.evaluate((element) => element.open))) await panel.locator("summary").click();
  return panel;
}

async function setPrototypeView(page, view) {
  const panel = await openPrototypePanel(page);
  await panel.getByRole("button", { name: view, exact: true }).click();
}

async function search(page, query) {
  const input = page.getByRole("textbox", { name: "全局搜索" });
  await input.fill(query);
  return input;
}

test.describe("T016 · Mobile operations home and global search", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("home is an operations layer instead of duplicating the five primary tabs", async ({ page }) => {
    await openMobile(page);
    const nav = page.getByRole("navigation", { name: "一级导航" });
    for (const label of ["首页", "便利店", "商城", "智慧抗衰", "我的"]) {
      await expect(nav.getByRole("button", { name: label, exact: true })).toBeVisible();
    }

    await expect(page.getByRole("button", { name: "打开全局搜索" }).first()).toBeVisible();
    await expect(page.getByText("初秋轻生活计划")).toBeVisible();
    await expect(page.getByText("早八能量补给")).toBeVisible();
    await expect(page.getByText("秋日护理精选")).toBeVisible();
    await expect(page.getByText("三个生活入口")).toHaveCount(0);
    await expectNoHorizontalOverflow(page);
  });

  test("global search returns store, mall, care and campaign entities", async ({ page }) => {
    await openMobile(page);
    await page.getByRole("button", { name: "打开全局搜索" }).first().click();

    await search(page, "燕麦");
    await expect(page.getByRole("button", { name: /便利店结果：燕麦拿铁/ })).toBeVisible();

    await search(page, "胶原");
    await expect(page.getByRole("button", { name: /线上商城结果：胶原蛋白肽饮/ })).toBeVisible();

    await search(page, "基础状态检测");
    await expect(page.getByRole("button", { name: "查看智慧抗衰结果：基础状态检测", exact: true })).toBeVisible();

    await search(page, "初秋");
    await expect(page.getByRole("button", { name: /活动结果：初秋轻生活计划/ })).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test("convenience search carries the chosen store and product into the domain", async ({ page }) => {
    await openMobile(page);
    await page.getByRole("button", { name: "打开全局搜索" }).first().click();
    await search(page, "燕麦");
    await page.getByRole("button", { name: /便利店结果：燕麦拿铁/ }).click();

    await expect(page.getByRole("heading", { name: "先选择可履约门店" })).toBeVisible();
    const yunling = page.getByRole("button", { name: /云岭社区店/ });
    const nanan = page.getByRole("button", { name: /南岸生活馆/ });
    await expect(yunling).toBeEnabled();
    await expect(nanan).toBeDisabled();

    await yunling.click();
    await expect(page.getByText("已确认门店上下文")).toBeVisible();
    await expect(page.getByText(/云岭社区店 · 燕麦拿铁/)).toBeVisible();
    await page.getByRole("button", { name: "进入便利店" }).click();
    await expect(page.getByText("来自全局搜索 · 门店上下文已保留")).toBeVisible();
    await expect(page.getByRole("heading", { name: "云岭社区店" })).toBeVisible();

    const selectedOat = page.locator("main button").filter({ hasText: "燕麦拿铁" }).filter({ hasText: "现货" }).first();
    await expect(selectedOat).toBeVisible();
    await expect(selectedOat).toContainText("已选择");
    await expect(selectedOat).toContainText("¥11.9");
    await expect(page.getByText("搜索商品已定位到具体门店")).toBeVisible();
    await expect(page.getByRole("button", { name: "选择此门店自提" })).toHaveCount(0);
    await expectNoHorizontalOverflow(page);
  });

  test("mall and care results preserve the selected entity on domain handoff", async ({ page }) => {
    await openMobile(page);
    await page.getByRole("button", { name: "打开全局搜索" }).first().click();
    await search(page, "胶原");
    await page.getByRole("button", { name: /线上商城结果：胶原蛋白肽饮/ }).click();
    await expect(page.getByText("来自全局搜索", { exact: true })).toBeVisible();
    await expect(page.getByText("胶原蛋白肽饮", { exact: true }).first()).toBeVisible();

    await page.getByRole("button", { name: "打开全局搜索" }).first().click();
    await search(page, "基础状态检测");
    await page.getByRole("button", { name: "查看智慧抗衰结果：基础状态检测", exact: true }).click();
    await expect(page.getByText("来自全局搜索", { exact: true })).toBeVisible();
    await expect(page.getByText("基础状态检测", { exact: true }).first()).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test("home activity CTA opens a preset that has real search results", async ({ page }) => {
    await openMobile(page);
    await page.getByRole("button", { name: "看看今天有哪些活动与精选" }).click();
    const input = page.getByRole("textbox", { name: "全局搜索" });
    await expect(input).toHaveValue("初秋");
    await expect(page.getByRole("button", { name: /活动结果：初秋轻生活计划/ })).toBeVisible();
  });

  test("search preserves its query across loading and error prototype states", async ({ page }) => {
    await openMobile(page);
    await page.getByRole("button", { name: "打开全局搜索" }).first().click();
    const input = await search(page, "护理");
    await expect(page.getByText(/找到 .* 条结果/)).toBeVisible();

    await setPrototypeView(page, "loading");
    await expect(page.getByRole("heading", { name: "正在加载" })).toBeVisible();
    await setPrototypeView(page, "ready");
    await expect(input).toHaveValue("护理");

    await setPrototypeView(page, "empty");
    await page.getByRole("button", { name: "返回可用数据" }).click();
    await expect(input).toHaveValue("护理");

    await setPrototypeView(page, "error");
    await page.getByRole("button", { name: "重新加载演示" }).click();
    await expect(input).toHaveValue("护理");
    await expectNoHorizontalOverflow(page);
  });
});
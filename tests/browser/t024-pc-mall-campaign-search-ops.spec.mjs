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

async function openCommerce(page, width = 1440, height = 900) {
  await page.setViewportSize({ width, height });
  await page.goto(`${PC}/?role=operator`);
  await page.getByRole("button", { name: "商城 / 内容运营", exact: true }).first().click();
  await expect(page.getByRole("main").getByRole("heading", { name: "商城渠道、活动与搜索运营", exact: true })).toBeVisible();
}

async function readShared(page) {
  await page.goto(MOBILE, { waitUntil: "domcontentloaded" });
  const moduleUrl = `/@fs/${process.cwd()}/packages/shared/src/index.ts`;
  return page.evaluate(async (url) => {
    const shared = await import(url);
    const mallProducts = shared.catalogProducts.filter((item) => item.scenes.includes("mall"));
    return {
      issues: shared.validateDemoFixtureRelations(),
      channels: shared.channels.map((item) => ({ id: item.id, integrationStatus: item.integrationStatus })),
      storefronts: shared.storefronts.map((item) => ({ id: item.id, channelId: item.channelId })),
      listings: shared.mallProductListings.map((item) => ({
        productId: item.productId,
        storefrontId: item.storefrontId,
        channelId: item.channelId,
        status: item.status,
      })),
      mallProductIds: mallProducts.map((item) => item.id),
      campaigns: shared.campaigns.map((item) => ({
        id: item.id,
        target: item.target,
        refs: item.refs,
      })),
    };
  }, moduleUrl);
}

test.describe("T024 · PC mall channel campaign search operations", () => {
  test("Shared models valid multi-channel listings and campaign landing targets", async ({ page }) => {
    const data = await readShared(page);

    expect(data.issues).toEqual([]);
    expect(data.channels.length).toBeGreaterThanOrEqual(2);
    expect(data.storefronts.length).toBeGreaterThanOrEqual(2);
    expect(data.channels).toContainEqual({ id: "CHANNEL-OWNED", integrationStatus: "mock" });
    expect(data.channels).toContainEqual({ id: "CHANNEL-DOUYIN", integrationStatus: "planned" });

    for (const productId of data.mallProductIds) {
      expect(data.listings.some((item) => item.productId === productId), `missing listing for ${productId}`).toBe(true);
    }

    expect(data.campaigns.length).toBeGreaterThanOrEqual(3);
    for (const campaign of data.campaigns) {
      expect(campaign.target).toEqual({ type: "campaign_detail", campaignId: campaign.id });
    }
    const mallCampaign = data.campaigns.find((item) => item.id === "CAMPAIGN-MALL-CARE");
    expect(mallCampaign?.refs.some((ref) => ref.type === "storefront")).toBe(false);
  });

  test("operator sees two channel/storefront sources, product relations and source-traceable mall orders", async ({ page }) => {
    await openCommerce(page, 1440, 900);

    const owned = page.getByTestId("t024-channel-CHANNEL-OWNED");
    const douyin = page.getByTestId("t024-channel-CHANNEL-DOUYIN");
    await expect(owned).toContainText("本地生活私域商城");
    await expect(owned).toContainText("Mock 可用");
    await expect(owned).toContainText("本地生活精选商城");
    await expect(douyin).toContainText("抖音店渠道");
    await expect(douyin).toContainText("Planned · 未接入");
    await expect(douyin).toContainText("抖音店商品橱窗");

    const ownedListing = page.getByTestId("t024-listing-MALL-LISTING-PRIVATE-COLLAGEN");
    await expect(ownedListing).toContainText("胶原蛋白肽饮");
    await expect(ownedListing).toContainText("STOREFRONT-PRIVATE");
    await expect(ownedListing).toContainText("CHANNEL-OWNED");

    const plannedListing = page.getByTestId("t024-listing-MALL-LISTING-DOUYIN-SCALP");
    await expect(plannedListing).toContainText("头皮养护套装");
    await expect(plannedListing).toContainText("计划关系");

    const ownedOrder = page.getByTestId("t024-mall-order-LL-1031");
    await expect(ownedOrder).toContainText("本地生活精选商城");
    await expect(ownedOrder).toContainText("本地生活私域商城");
    const douyinOrder = page.getByTestId("t024-mall-order-LL-1023");
    await expect(douyinOrder).toContainText("抖音店商品橱窗");
    await expect(douyinOrder).toContainText("抖音店渠道");
    await expectNoHorizontalOverflow(page);

    await mkdir("test-results/t024-visual-evidence", { recursive: true });
    await page.screenshot({ path: "test-results/t024-visual-evidence/01-channel-orders-1440.png", fullPage: true });
  });

  test("campaign operations expose multiple placements, refs and the real campaign-detail landing", async ({ page }) => {
    await openCommerce(page, 1440, 900);
    await page.getByRole("button", { name: "活动与推荐位", exact: true }).click();

    for (const id of ["CAMPAIGN-AUTUMN-HERO", "CAMPAIGN-STORE-BREAKFAST", "CAMPAIGN-MALL-CARE", "CAMPAIGN-CARE-RETEST"]) {
      await expect(page.getByTestId(`t024-campaign-${id}`)).toBeVisible();
    }

    const hero = page.getByTestId("t024-campaign-CAMPAIGN-AUTUMN-HERO");
    await expect(hero).toContainText("首页 Hero");
    await expect(hero).toContainText("初秋轻生活计划");
    await expect(hero).toContainText("活动详情 · CAMPAIGN-AUTUMN-HERO");
    await expect(hero).toContainText("溏心蛋火腿三明治");
    await expect(hero).toContainText("基础状态检测");

    const care = page.getByTestId("t024-campaign-CAMPAIGN-CARE-RETEST");
    await expect(care).toContainText("智慧抗衰推荐位");
    await expect(care).toContainText("检测后专属护理 30 元券");
    await expect(care).toContainText("基础状态检测体验");
    await expectNoHorizontalOverflow(page);

    await mkdir("test-results/t024-visual-evidence", { recursive: true });
    await page.screenshot({ path: "test-results/t024-visual-evidence/02-campaigns-1440.png", fullPage: true });
  });

  test("search operations cover store, mall, care project/package and campaign and verify Mobile-shared recall", async ({ page }) => {
    await openCommerce(page, 1440, 900);
    await page.getByRole("button", { name: "搜索关联", exact: true }).click();

    await expect(page.getByTestId("t024-search-row-store-PRODUCT-OAT-LATTE")).toContainText("便利店");
    await expect(page.getByTestId("t024-search-row-mall-PRODUCT-COLLAGEN-DRINK")).toContainText("线上商城");
    await expect(page.getByTestId("t024-search-row-care-project-CARE-PROJECT-BASIC")).toContainText("智慧抗衰项目");
    await expect(page.getByTestId("t024-search-row-care-service-SERVICE-CARE-PACKAGE")).toContainText("护理套餐");
    await expect(page.getByTestId("t024-search-row-campaign-CAMPAIGN-AUTUMN-HERO")).toContainText("初秋轻生活计划");

    const probe = page.getByRole("textbox", { name: "全局搜索词验证" });
    await probe.fill("胶原");
    await expect(page.getByTestId("t024-search-probe-mall-PRODUCT-COLLAGEN-DRINK")).toContainText("线上商城 · 胶原蛋白肽饮");

    await probe.fill("基础状态检测");
    await expect(page.getByTestId("t024-search-probe-care-project-CARE-PROJECT-BASIC")).toContainText("智慧抗衰 · 基础状态检测");

    await probe.fill("初秋");
    await expect(page.getByTestId("t024-search-probe-campaign-CAMPAIGN-AUTUMN-HERO")).toContainText("活动 · 初秋轻生活计划");

    const filter = page.getByRole("textbox", { name: "搜索关联筛选" });
    await filter.fill("护理套餐");
    await expect(page.getByTestId("t024-search-row-care-service-SERVICE-CARE-PACKAGE")).toBeVisible();
    await expect(page.getByTestId("t024-search-row-store-PRODUCT-OAT-LATTE")).toHaveCount(0);
    await expectNoHorizontalOverflow(page);
  });

  test("Mobile keeps Storefront and Channel internal while consuming the same mall campaign facts", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${MOBILE}/?demoAuth=1`);
    const nav = page.getByRole("navigation", { name: "一级导航" });
    await nav.getByRole("button", { name: "商城", exact: true }).click();

    const mall = page.getByTestId("mall-home");
    await expect(mall).not.toContainText(/Storefront|Channel|精选店铺|店铺来源|抖音店商品橱窗|本地生活精选商城/i);
    await expect(mall.getByTestId("mall-campaign-banner")).toContainText("秋日护理精选");

    await nav.getByRole("button", { name: "首页", exact: true }).click();
    const mallCampaignButton = page.getByRole("button").filter({ hasText: "秋日护理精选" }).first();
    await expect(mallCampaignButton).toBeVisible();
    await mallCampaignButton.click();
    await expect(page.getByRole("heading", { name: "秋日护理精选", exact: true })).toBeVisible();
    await expect(page.locator("main")).not.toContainText(/Storefront|Channel|本地生活精选商城|抖音店商品橱窗|店铺来源/i);
    await expect(page.getByText("头皮养护套装", { exact: true })).toBeVisible();
    await expect(page.getByText("胶原蛋白肽饮", { exact: true })).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test("all T024 tabs remain overflow-free at 1024 and 1440", async ({ page }) => {
    for (const width of [1024, 1440]) {
      await openCommerce(page, width, 900);
      await expectNoHorizontalOverflow(page);
      await page.getByRole("button", { name: "活动与推荐位", exact: true }).click();
      await expectNoHorizontalOverflow(page);
      await page.getByRole("button", { name: "搜索关联", exact: true }).click();
      await expectNoHorizontalOverflow(page);
    }

    await mkdir("test-results/t024-visual-evidence", { recursive: true });
    await page.screenshot({ path: "test-results/t024-visual-evidence/03-search-1024.png", fullPage: true });
  });
});

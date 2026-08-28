import { expect, test } from "@playwright/test";

const MOBILE = "http://127.0.0.1:4173";
const PC = "http://127.0.0.1:4174";

async function openPrototypePanel(page) {
  const panel = page.locator("details").filter({ hasText: /Prototype ·/ }).last();
  if (!(await panel.evaluate((element) => element.open))) {
    await panel.locator("summary").click();
  }
  return panel;
}

async function setPrototypeView(page, view) {
  const panel = await openPrototypePanel(page);
  await panel.getByRole("button", { name: view, exact: true }).click();
}

async function expectNoHorizontalOverflow(page) {
  const metrics = await page.evaluate(() => ({
    viewport: window.innerWidth,
    html: document.documentElement.scrollWidth,
    body: document.body.scrollWidth,
  }));
  expect(Math.max(metrics.html, metrics.body), JSON.stringify(metrics)).toBeLessThanOrEqual(metrics.viewport + 1);
}

async function expectVisibleFocus(page) {
  await page.keyboard.press("Tab");
  const focus = await page.evaluate(() => {
    const element = document.activeElement;
    if (!(element instanceof HTMLElement)) return null;
    const style = getComputedStyle(element);
    return {
      tag: element.tagName,
      outlineStyle: style.outlineStyle,
      outlineWidth: Number.parseFloat(style.outlineWidth || "0"),
      boxShadow: style.boxShadow,
    };
  });
  expect(focus).not.toBeNull();
  const visible = focus.outlineStyle !== "none" && focus.outlineWidth > 0 || focus.boxShadow !== "none";
  expect(visible, JSON.stringify(focus)).toBeTruthy();
}

async function expectMobileTouchTargets(page) {
  const offenders = await page.locator("button:visible, a[href]:visible, summary:visible").evaluateAll((elements) => elements
    .map((element) => {
      const rect = element.getBoundingClientRect();
      return {
        text: (element.getAttribute("aria-label") || element.textContent || element.tagName).trim().replace(/\s+/g, " ").slice(0, 80),
        width: rect.width,
        height: rect.height,
      };
    })
    .filter((item) => item.width < 44 || item.height < 44));
  expect(offenders, JSON.stringify(offenders, null, 2)).toEqual([]);
}

async function contrastRatio(page, foreground, background) {
  return page.evaluate(({ foreground, background }) => {
    const probe = document.createElement("span");
    probe.style.color = `var(${foreground})`;
    probe.style.backgroundColor = `var(${background})`;
    probe.style.position = "fixed";
    probe.style.left = "-9999px";
    document.body.appendChild(probe);
    const style = getComputedStyle(probe);
    const parse = (value) => {
      const match = value.match(/[\d.]+/g);
      if (!match || match.length < 3) throw new Error(`Unable to parse color ${value}`);
      return match.slice(0, 3).map(Number);
    };
    const luminance = (rgb) => {
      const channels = rgb.map((value) => {
        const channel = value / 255;
        return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
    };
    const fg = luminance(parse(style.color));
    const bg = luminance(parse(style.backgroundColor));
    probe.remove();
    return (Math.max(fg, bg) + 0.05) / (Math.min(fg, bg) + 0.05);
  }, { foreground, background });
}

async function expectCoreContrast(page) {
  expect(await contrastRatio(page, "--color-text-primary", "--color-background")).toBeGreaterThanOrEqual(4.5);
  expect(await contrastRatio(page, "--color-text-secondary", "--color-background")).toBeGreaterThanOrEqual(4.5);
  expect(await contrastRatio(page, "--color-on-primary", "--color-primary")).toBeGreaterThanOrEqual(4.5);
}

async function openMobile(page) {
  await page.goto(`${MOBILE}/?demoAuth=1`);
  await expect(page.getByText(/统一用户 ID/).first()).toBeVisible();
}

async function mobileTab(page, label) {
  await page.getByRole("navigation").getByRole("button", { name: label, exact: true }).click();
}

test.describe("T012 · 390px Mobile", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("ready/loading/empty/error/permission are recoverable and baseline a11y is visible", async ({ page }) => {
    await openMobile(page);
    await expectNoHorizontalOverflow(page);
    await expectVisibleFocus(page);
    await expectMobileTouchTargets(page);
    await expectCoreContrast(page);

    await setPrototypeView(page, "loading");
    await expect(page.getByRole("heading", { name: "正在加载" })).toBeVisible();
    await expectNoHorizontalOverflow(page);
    await setPrototypeView(page, "ready");

    await setPrototypeView(page, "empty");
    await expect(page.getByRole("heading", { name: "暂时没有内容" })).toBeVisible();
    await page.getByRole("button", { name: "返回可用数据" }).click();

    await setPrototypeView(page, "error");
    await expect(page.getByRole("alert")).toContainText("加载失败");
    await page.getByRole("button", { name: "重新加载演示" }).click();

    await setPrototypeView(page, "permission");
    await page.waitForLoadState("domcontentloaded");
    await expect(page.getByRole("heading", { name: "暂无权限" })).toBeVisible();
    await expect(page.getByText("当前角色或身份不在此视图的演示授权范围内")).toBeVisible();
    await page.getByRole("button", { name: "返回允许范围" }).click();
    await page.waitForLoadState("domcontentloaded");
    await expect(page.getByRole("navigation")).toBeVisible();
  });

  test("T004 store deep step survives empty → ready", async ({ page }) => {
    await openMobile(page);
    await mobileTab(page, "门店");
    await page.locator("main button").filter({ hasText: "核心演示门店" }).first().click();
    await page.getByRole("button", { name: "选择此门店自提" }).click();
    await page.getByRole("button", { name: "提交演示订单" }).click();
    await expect(page.getByRole("heading", { name: "到店出示提货码" })).toBeVisible();

    await setPrototypeView(page, "empty");
    await page.getByRole("button", { name: "返回可用数据" }).click();
    await expect(page.getByRole("heading", { name: "到店出示提货码" })).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test("T005 mall checkout selection survives error → ready", async ({ page }) => {
    await openMobile(page);
    await mobileTab(page, "商城");
    await page.locator("main button").filter({ hasText: "共享商品" }).first().click();
    await page.getByRole("button", { name: "加入购物车" }).click();
    await page.getByRole("button", { name: "去结算" }).click();
    await expect(page.getByRole("heading", { name: "选择配送方式" })).toBeVisible();

    const storeDelivery = page.getByRole("button", { name: /送至合作门店/ });
    if (await storeDelivery.count()) await storeDelivery.first().click();

    await setPrototypeView(page, "error");
    await page.getByRole("button", { name: "重新加载演示" }).click();
    await expect(page.getByRole("heading", { name: "选择配送方式" })).toBeVisible();
    if (await storeDelivery.count()) await expect(storeDelivery.first()).toHaveAttribute("aria-pressed", "true");
    await expectNoHorizontalOverflow(page);
    await expectMobileTouchTargets(page);
  });

  test("T006 care voucher state survives empty → ready", async ({ page }) => {
    await openMobile(page);
    await mobileTab(page, "抗衰");
    await page.getByRole("button", { name: "开始体验流程" }).click();
    await page.getByRole("button", { name: "查看体验券" }).click();
    await page.getByRole("button", { name: "使用体验券并选择门店" }).click();
    await page.getByRole("button", { name: "选择此门店" }).click();
    await page.getByRole("button", { name: "模拟店员核销体验券" }).click();
    await expect(page.getByRole("button", { name: "进入基础检测 / 体验" })).toBeVisible();

    await setPrototypeView(page, "empty");
    await page.getByRole("button", { name: "返回可用数据" }).click();
    await expect(page.getByRole("button", { name: "进入基础检测 / 体验" })).toBeVisible();
    await expect(page.getByText("不是医疗诊断")).toHaveCount(0);
    await expectNoHorizontalOverflow(page);
  });

  test("T007 member view, replay and coupon filter survive quality states", async ({ page }) => {
    await openMobile(page);
    await mobileTab(page, "我的");
    await page.getByRole("button", { name: /积分中心/ }).click();
    await page.getByRole("button", { name: "开始重放" }).first().click();
    await expect(page.getByText("处理中", { exact: true })).toBeVisible();

    await setPrototypeView(page, "loading");
    await setPrototypeView(page, "ready");
    await expect(page.getByRole("heading", { name: /积分$/ })).toBeVisible();
    await expect(page.getByText("处理中", { exact: true })).toBeVisible();

    await page.getByRole("button", { name: "返回会员中心" }).click();
    await page.getByRole("button", { name: /我的券/ }).click();
    const expired = page.getByRole("button", { name: /^已过期 ·/ });
    await expired.click();
    await expect(page.getByText(/当前没有“已过期”样例/)).toBeVisible();

    await setPrototypeView(page, "error");
    await page.getByRole("button", { name: "重新加载演示" }).click();
    await expect(expired).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByText(/当前没有“已过期”样例/)).toBeVisible();
    await expect(page.getByText("Candidate", { exact: true })).toBeVisible();
    await expectNoHorizontalOverflow(page);
    await expectMobileTouchTargets(page);
  });
});

for (const viewport of [{ width: 1024, height: 768 }, { width: 1440, height: 900 }]) {
  test.describe(`T012 · ${viewport.width}px PC`, () => {
    test.use({ viewport });

    for (const role of ["merchant", "operator", "management"]) {
      test(`${role} ready/loading/empty/error/permission has no horizontal overflow`, async ({ page }) => {
        for (const view of ["ready", "loading", "empty", "error", "permission"]) {
          const suffix = view === "ready" ? "" : `&view=${view}`;
          await page.goto(`${PC}/?role=${role}${suffix}`);
          await expectNoHorizontalOverflow(page);
          if (view === "error") await expect(page.getByText("加载失败")).toBeVisible();
          if (view === "permission") await expect(page.getByText(/permission|权限/i).first()).toBeVisible();
        }
      });
    }

    test("operator non-default module survives error → ready and focus is visible", async ({ page }) => {
      await page.goto(`${PC}/?role=operator`);
      await page.getByRole("button", { name: /订单 \/ 核销/ }).first().click();
      await expect(page.getByRole("heading", { name: "订单 / 核销", exact: true }).first()).toBeVisible();
      await setPrototypeView(page, "error");
      await page.getByRole("button", { name: "重新加载演示" }).click();
      await expect(page.getByRole("heading", { name: "订单 / 核销", exact: true }).first()).toBeVisible();
      await expectVisibleFocus(page);
      await expectCoreContrast(page);
      await expectNoHorizontalOverflow(page);
    });
  });
}

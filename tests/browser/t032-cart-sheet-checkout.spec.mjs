import { expect, test } from "@playwright/test";

const MOBILE = "http://127.0.0.1:4173";

async function openConvenience(page) {
  await page.goto(`${MOBILE}/?demoAuth=1`);
  await page.getByRole("navigation", { name: "一级导航" }).getByRole("button", { name: "便利店", exact: true }).click();
  await expect(page.getByRole("heading", { name: "选择购买门店" })).toBeVisible();
}

async function expectNoHorizontalOverflow(page) {
  const metrics = await page.evaluate(() => ({
    viewport: window.innerWidth,
    html: document.documentElement.scrollWidth,
    body: document.body.scrollWidth,
  }));
  expect(Math.max(metrics.html, metrics.body), JSON.stringify(metrics)).toBeLessThanOrEqual(metrics.viewport + 1);
}

async function enterStoreAndOpenCart(page, storeName = "云岭社区店") {
  await page.getByRole("button", { name: `选择门店：${storeName}` }).click();
  const cartBar = page.getByRole("button", { name: /打开购物车，\d+ 件商品/ });
  await expect(cartBar).toBeVisible();
  await cartBar.click();
}

test.describe("T032 · Cart sheet & checkout card layout", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("cart sheet has clear button and close button in header", async ({ page }) => {
    await openConvenience(page);
    await enterStoreAndOpenCart(page);

    await expect(page.getByRole("button", { name: "清空购物车" })).toBeVisible();
    await expect(page.getByRole("button", { name: "关闭购物车" })).toBeVisible();
  });

  test("cart sheet clear button empties the cart", async ({ page }) => {
    await openConvenience(page);
    await enterStoreAndOpenCart(page);

    await page.getByRole("button", { name: "清空购物车" }).click();
    // 清空后抽屉关闭，购物栏应处于禁用状态（空车）
    const cartBar = page.getByRole("button", { name: /购物车，0 件商品/ });
    await expect(cartBar).toBeVisible();
    await expect(cartBar).toBeDisabled();
  });

  test("low stock product shows red label in cart sheet", async ({ page }) => {
    await openConvenience(page);
    // 云岭社区店的鸡蛋三明治是 low_stock
    await page.getByRole("button", { name: "选择门店：云岭社区店" }).click();
    // 确保鸡蛋三明治在购物车里
    const eggSandwich = page.getByRole("button", { name: "查看商品：鸡蛋三明治" });
    if (await eggSandwich.count() === 0) {
      // 可能需要切换分类，先尝试直接找加购按钮
      const addBtn = page.getByRole("button", { name: "加入购物车：鸡蛋三明治" });
      if (await addBtn.count() > 0) {
        await addBtn.click();
      }
    } else {
      // 如果已经在购物车列表里能看到，或有数量控件，说明已加购
      const qtyBtn = page.getByRole("button", { name: /减少鸡蛋三明治/ });
      if (await qtyBtn.count() === 0) {
        const addBtn = page.getByRole("button", { name: "加入购物车：鸡蛋三明治" });
        if (await addBtn.count() > 0) await addBtn.click();
      }
    }
    // 打开购物车抽屉
    const cartBar = page.getByRole("button", { name: /打开购物车，\d+ 件商品/ });
    await cartBar.click();

    // 库存紧张标签可见
    await expect(page.getByText("库存紧张").first()).toBeVisible();
  });

  test("cart sheet checkout button is sticky at bottom", async ({ page }) => {
    await openConvenience(page);
    await enterStoreAndOpenCart(page);

    // 去结算按钮固定在抽屉底部
    const checkoutBtn = page.getByRole("button", { name: "去结算" });
    await expect(checkoutBtn).toBeVisible();
    const box = await checkoutBtn.boundingBox();
    expect(box).not.toBeNull();
    // 按钮应在视口下半部分
    expect(box.y + box.height).toBeGreaterThan(500);
  });

  test("product detail has fixed bottom bar with add + buy now", async ({ page }) => {
    await openConvenience(page);
    await page.getByRole("button", { name: "选择门店：云岭社区店" }).click();
    await page.getByRole("button", { name: "查看商品：青柠气泡水" }).click();

    await expect(page.getByRole("heading", { name: "青柠气泡水" })).toBeVisible();

    // 底部固定操作栏：加入购物车 + 立即购买
    const addBtn = page.getByRole("button", { name: "加入购物车" });
    const buyNowBtn = page.getByRole("button", { name: "立即购买" });
    await expect(addBtn).toBeVisible();
    await expect(buyNowBtn).toBeVisible();

    // 立即购买直接进入结算页
    await buyNowBtn.click();
    await expect(page.getByRole("heading", { name: "云岭社区店" })).toBeVisible();
  });

  test("product detail shows description section", async ({ page }) => {
    await openConvenience(page);
    await page.getByRole("button", { name: "选择门店：云岭社区店" }).click();
    await page.getByRole("button", { name: "查看商品：青柠气泡水" }).click();

    await expect(page.getByText("商品描述")).toBeVisible();
  });

  test("checkout page uses card-based groups", async ({ page }) => {
    await openConvenience(page);
    await page.getByRole("button", { name: "选择门店：云岭社区店" }).click();
    await page.getByRole("button", { name: /打开购物车，\d+ 件商品/ }).click();
    await page.getByRole("button", { name: "去结算" }).click();

    // 确认订单标题
    await expect(page.getByRole("heading", { name: "云岭社区店" })).toBeVisible();

    // 取餐方式分组标题
    await expect(page.getByText("取餐方式")).toBeVisible();

    // 商品清单分组
    await expect(page.getByText("商品清单")).toBeVisible();

    // 更多选项（购物袋+备注）
    await expect(page.getByText("更多选项")).toBeVisible();

    // 金额明细分组
    await expect(page.getByText("金额明细")).toBeVisible();
  });

  test("checkout pickup/delivery large button toggle", async ({ page }) => {
    await openConvenience(page);
    await page.getByRole("button", { name: "选择门店：云岭社区店" }).click();
    await page.getByRole("button", { name: /打开购物车，\d+ 件商品/ }).click();
    await page.getByRole("button", { name: "去结算" }).click();

    const pickupBtn = page.getByRole("button", { name: "到店自提" });
    const deliveryBtn = page.getByRole("button", { name: "约 3 km 短配" });

    await expect(pickupBtn).toHaveAttribute("aria-pressed", "true");
    await expect(deliveryBtn).toHaveAttribute("aria-pressed", "false");

    await deliveryBtn.click();
    await expect(deliveryBtn).toHaveAttribute("aria-pressed", "true");
    await expect(pickupBtn).toHaveAttribute("aria-pressed", "false");
  });

  test("checkout has bag switch and remark input", async ({ page }) => {
    await openConvenience(page);
    await page.getByRole("button", { name: "选择门店：云岭社区店" }).click();
    await page.getByRole("button", { name: /打开购物车，\d+ 件商品/ }).click();
    await page.getByRole("button", { name: "去结算" }).click();

    // 购物袋开关
    const bagSwitch = page.getByRole("switch", { name: "需要购物袋" });
    await expect(bagSwitch).toBeVisible();
    await expect(bagSwitch).toHaveAttribute("aria-checked", "true");
    await bagSwitch.click();
    await expect(bagSwitch).toHaveAttribute("aria-checked", "false");

    // 订单备注输入
    const remark = page.getByPlaceholder("选填，如有特殊需求请告知门店");
    await expect(remark).toBeVisible();
    await remark.fill("少放冰，谢谢");
    await expect(remark).toHaveValue("少放冰，谢谢");
  });

  test("checkout has fixed bottom submit bar with total", async ({ page }) => {
    await openConvenience(page);
    await page.getByRole("button", { name: "选择门店：云岭社区店" }).click();
    await page.getByRole("button", { name: /打开购物车，\d+ 件商品/ }).click();
    await page.getByRole("button", { name: "去结算" }).click();

    // 底部固定提交栏含合计金额和提交按钮
    await expect(page.getByText("合计")).toBeVisible();
    const submitBtn = page.getByRole("button", { name: "提交订单" });
    await expect(submitBtn).toBeVisible();

    const box = await submitBtn.boundingBox();
    expect(box).not.toBeNull();
    // 按钮应靠近视口底部
    expect(box.y).toBeGreaterThan(700);
  });

  test("no internal terms on checkout and product pages", async ({ page }) => {
    await openConvenience(page);
    await page.getByRole("button", { name: "选择门店：云岭社区店" }).click();
    await page.getByRole("button", { name: "查看商品：青柠气泡水" }).click();

    for (const term of ["mock", "fixture", "可售上下文", "核心演示"]) {
      await expect(page.getByText(term, { exact: false })).toHaveCount(0);
    }

    // 去结算页也检查
    await page.getByRole("button", { name: "立即购买" }).click();
    for (const term of ["mock", "fixture", "可售上下文", "核心演示"]) {
      await expect(page.getByText(term, { exact: false })).toHaveCount(0);
    }

    await expectNoHorizontalOverflow(page);
  });
});

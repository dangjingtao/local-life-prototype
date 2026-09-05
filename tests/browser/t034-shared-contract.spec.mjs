import { expect, test } from "@playwright/test";

const MOBILE = "http://127.0.0.1:4173";

async function readShared(page) {
  await page.goto(MOBILE, { waitUntil: "domcontentloaded" });
  const moduleUrl = `/@fs/${process.cwd()}/packages/shared/src/index.ts`;
  return page.evaluate(async (url) => {
    const shared = await import(url);
    const sections = shared.getConvenienceBrowseSections(shared.CORE_DEMO_IDS.store);
    const pickup = shared.getPickupCredentialForOrder(shared.CORE_DEMO_IDS.pickupOrder);
    const community = shared.getCommunityForStore(shared.CORE_DEMO_IDS.store);
    return {
      issues: shared.validateDemoFixtureRelations(),
      sections: sections.map((section) => ({
        id: section.category.id,
        anchorId: section.anchorId,
        types: section.products.map((product) => product.type),
        singleCount: section.single.length,
        comboCount: section.combo.length,
      })),
      pointProjection: {
        store: shared.getPurchasePointProjection("store", 10),
        mall: shared.getPurchasePointProjection("mall", 10),
        care: shared.getPurchasePointProjection("care", 10),
      },
      rules: {
        pointsToCash: shared.prototypeRules.pointsToCash.status,
        purchaseBase: shared.prototypeRules.purchasePointsBase.status,
        rounding: shared.prototypeRules.purchasePointsRounding.status,
        redemptionLimit: shared.prototypeRules.pointsRedemptionLimit.status,
      },
      pickup: pickup ? (() => {
        const order = shared.v02Orders.find((item) => item.id === pickup.orderId);
        const originalOrderStatus = order?.status;
        const originalFulfillmentStatus = order?.fulfillmentDetail?.status;
        const inactive = shared.getPickupCredentialStatus(pickup, "2026-09-05T12:00:00+08:00");
        const active = shared.getPickupCredentialStatus(pickup, "2026-09-05T12:45:00+08:00");
        const expired = shared.getPickupCredentialStatus(pickup, "2026-09-05T13:30:00+08:00");

        let preparing = null;
        let preparingAfterWindow = null;
        let cancelled = null;
        if (order?.fulfillmentDetail) {
          order.status = "pending_fulfillment";
          order.fulfillmentDetail.status = "preparing";
          preparing = shared.getPickupCredentialStatus(pickup, "2026-09-05T12:45:00+08:00");
          preparingAfterWindow = shared.getPickupCredentialStatus(pickup, "2026-09-05T13:30:00+08:00");
          order.status = "cancelled";
          order.fulfillmentDetail.status = "cancelled";
          cancelled = shared.getPickupCredentialStatus(pickup, "2026-09-05T12:45:00+08:00");
          order.status = originalOrderStatus;
          order.fulfillmentDetail.status = originalFulfillmentStatus;
        }

        return {
          id: pickup.id,
          orderId: pickup.orderId,
          redemptionId: pickup.redemptionId,
          inactive,
          active,
          expired,
          preparing,
          preparingAfterWindow,
          cancelled,
        };
      })() : null,
      community: community ? {
        id: community.id,
        benefits: community.benefits,
        firstShow: shared.shouldShowCommunityNudge(shared.CORE_DEMO_IDS.user, community.id, "2026-09-05T10:00:00+08:00"),
        recentSuppressed: shared.shouldShowCommunityNudge("LL-8893", community.id, "2026-09-05T10:00:00+08:00"),
        recentSuppressedAcrossCommunity: shared.shouldShowCommunityNudge("LL-8893", "COMMUNITY-OTHER-DEMO", "2026-09-05T10:00:00+08:00"),
        afterCooldown: shared.shouldShowCommunityNudge("LL-8893", "COMMUNITY-OTHER-DEMO", "2026-09-11T10:00:00+08:00"),
      } : null,
    };
  }, moduleUrl);
}

test.describe("T034 · V0.3 shared contract", () => {
  test("fixture relations remain valid and browse order is single before combo", async ({ page }) => {
    const data = await readShared(page);
    expect(data.issues).toEqual([]);
    expect(data.sections.length).toBeGreaterThanOrEqual(2);
    expect(new Set(data.sections.map((section) => section.anchorId)).size).toBe(data.sections.length);
    expect(data.sections.some((section) => section.singleCount > 0 && section.comboCount > 0)).toBe(true);
    for (const section of data.sections) {
      const firstCombo = section.types.indexOf("combo");
      const lastSingle = section.types.lastIndexOf("single");
      if (firstCombo >= 0 && lastSingle >= 0) expect(lastSingle).toBeLessThan(firstCombo);
    }
  });

  test("purchase point rates are confirmed while unconfirmed redemption rules stay unresolved", async ({ page }) => {
    const data = await readShared(page);
    expect(data.pointProjection.store.exactPoints).toBe(10);
    expect(data.pointProjection.mall.exactPoints).toBe(10);
    expect(data.pointProjection.care.exactPoints).toBe(20);
    expect(data.pointProjection.store.earnRate).toBe(1);
    expect(data.pointProjection.care.earnRate).toBe(2);
    expect(data.rules.pointsToCash).toBe("candidate");
    expect(data.rules.purchaseBase).toBe("unknown");
    expect(data.rules.rounding).toBe("unknown");
    expect(data.rules.redemptionLimit).toBe("unknown");
  });

  test("pickup credential and community cooldown expose deterministic state transitions", async ({ page }) => {
    const data = await readShared(page);
    expect(data.pickup).not.toBeNull();
    expect(data.pickup.orderId).toBe("LL-1024");
    expect(data.pickup.inactive).toBe("inactive");
    expect(data.pickup.active).toBe("active");
    expect(data.pickup.expired).toBe("expired");
    expect(data.pickup.preparing).toBe("inactive");
    expect(data.pickup.preparingAfterWindow).toBe("expired");
    expect(data.pickup.cancelled).toBe("expired");

    expect(data.community).not.toBeNull();
    expect(data.community.benefits).toEqual(["专属优惠", "上新通知", "直播优惠"]);
    expect(data.community.firstShow).toBe(true);
    expect(data.community.recentSuppressed).toBe(false);
    expect(data.community.recentSuppressedAcrossCommunity).toBe(false);
    expect(data.community.afterCooldown).toBe(true);
  });
});

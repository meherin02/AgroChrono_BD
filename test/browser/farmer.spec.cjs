const { test, expect } = require("@playwright/test"),
  fs = require("fs");
test("desktop farmer: bilingual account → analysis → activity → revision → report → persistence", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "প্রবেশ করুন", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Switch to English" }).click();
  await page
    .getByRole("button", { name: "Create farmer account", exact: true })
    .click();
  await expect(page.locator('input[name="username"]')).toHaveCount(0);
  await page.getByLabel("Your name", { exact: true }).fill("বাংলা কৃষক");

  await page
    .getByLabel("Password (10–128 characters)", { exact: true })
    .fill("browser-test-password");
  await page
    .getByRole("button", { name: "Create farmer account", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "My farm", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "New calendar", exact: true })
    .first()
    .click();
  await page.getByRole("button", { name: "Load example dates" }).click();
  await page
    .getByLabel("Variety (optional)", { exact: true })
    .fill("নিজস্ব জাত");
  await page.getByRole("button", { name: "বাংলায় পড়ুন" }).click();
  await expect(page.getByLabel("জাত (ঐচ্ছিক)", { exact: true })).toHaveValue(
    "নিজস্ব জাত",
  );
  await expect(page.locator("html")).toHaveAttribute("lang", "bn");
  await page.screenshot({
    path: ".local/evidence/calendar-bn-desktop.png",
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "সংরক্ষণ ও মূল্যায়ন করুন", exact: true })
    .click();
  await expect(page.locator("#assessment-report")).toBeVisible({
    timeout: 45000,
  });
  await expect(page.locator("#assessment-report")).toContainText(
    "isolation-forest-v1.0",
  );
  await expect(page.locator("#assessment-report")).not.toContainText(
    "ML assessment unavailable",
  );
  await page.screenshot({
    path: ".local/evidence/result-bn-desktop.png",
    fullPage: true,
  });
  const originalUrl = page.url();
  await page
    .getByRole("button", { name: "সম্পন্ন করুন", exact: true })
    .first()
    .click();
  await expect(
    page.getByRole("button", { name: "আবার চালু করুন", exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "আবার চালু করুন", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "আবার চালু করুন", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "আবার চালু করুন", exact: true }),
  ).toHaveCount(0);
  await page
    .getByRole("button", {
      name: "প্রস্তাবিত সংশোধন দেখুন ও সম্পাদনা করুন",
      exact: true,
    })
    .click();
  await expect(
    page.getByRole("button", {
      name: "সংশোধিত মূল্যায়ন সংরক্ষণ করুন",
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "সংশোধিত মূল্যায়ন সংরক্ষণ করুন", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "সংশোধনের তুলনা", exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "সংশোধনের তুলনা", exact: true }),
  ).toBeVisible();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "সিএসভি নামান", exact: true }).click();
  const file = await (await download).path();
  expect(fs.readFileSync(file, "utf8")).toContain("ফসল ক্যালেন্ডার");
  await page.getByRole("button", { name: "Switch to English" }).click();
  await expect(
    page.getByRole("heading", { name: "Revision comparison", exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: ".local/evidence/result-en-desktop.png",
    fullPage: true,
  });
  await page.emulateMedia({ media: "print" });
  await page.screenshot({
    path: ".local/evidence/print-en.png",
    fullPage: true,
  });
  await page.pdf({
    path: ".local/evidence/report-en.pdf",
    format: "A4",
    printBackground: true,
  });
  await page.emulateMedia({ media: "screen" });
  await page.getByRole("button", { name: "বাংলায় পড়ুন" }).click();
  await page.emulateMedia({ media: "print" });
  await page.pdf({
    path: ".local/evidence/report-bn.pdf",
    format: "A4",
    printBackground: true,
  });
  await page.screenshot({
    path: ".local/evidence/print-bn.png",
    fullPage: true,
  });
  await page.emulateMedia({ media: "screen" });
  await page
    .getByRole("button", { name: "আমার ক্যালেন্ডার", exact: true })
    .click();
  await expect(page.getByRole("button", { name: /নিজস্ব জাত/ })).toHaveCount(0);
  await expect(page.locator(".history-row")).toHaveCount(2);
  await page.goto(originalUrl);
  await expect(page.locator("#assessment-report")).toBeVisible();
  expect(errors).toEqual([]);
});
test("mobile farmer: keyboard navigation, input retained on validation error and language reload", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page
    .getByRole("button", { name: "কৃষক অ্যাকাউন্ট খুলুন", exact: true })
    .click();
  await page.getByLabel("আপনার নাম", { exact: true }).fill("মোবাইল কৃষক");

  await page
    .getByLabel("পাসওয়ার্ড (১০–১২৮ অক্ষর)", { exact: true })
    .fill("browser-test-password");
  await page
    .getByRole("button", { name: "কৃষক অ্যাকাউন্ট খুলুন", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "আমার খামার", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "নতুন ক্যালেন্ডার", exact: true })
    .first()
    .click();
  await page.getByRole("button", { name: "উদাহরণের তারিখ নিন" }).click();
  await page.getByLabel("বপন শুরুর তারিখ", { exact: true }).fill("২০২৫-০২-৩০");
  await page
    .getByRole("button", { name: "সংরক্ষণ ও মূল্যায়ন করুন", exact: true })
    .click();
  await expect(page.getByRole("alert")).toBeVisible();
  await expect(page.getByLabel("বপন শুরুর তারিখ", { exact: true })).toHaveValue(
    "২০২৫-০২-৩০",
  );
  await page.getByRole("button", { name: "Switch to English" }).click();
  await expect(page.getByLabel("Planting start", { exact: true })).toHaveValue(
    "2025-02-30",
  );
  await expect(page.getByRole("alert")).toContainText("Enter a real date");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await page
    .getByRole("button", { name: "New calendar", exact: true })
    .first()
    .click();
  await expect(page.getByLabel("Planting start", { exact: true })).toHaveValue(
    "2025-02-30",
  );
  await page.keyboard.press("Tab");
  await page.screenshot({
    path: ".local/evidence/mobile-en-retained-input.png",
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBeTruthy();
  await page
    .getByRole("button", { name: "Crop information", exact: true })
    .click();
  await expect(page.locator(".reference-card")).toHaveCount(10);
  await page.getByRole("button", { name: "বাংলায় পড়ুন" }).click();
  await page.screenshot({
    path: ".local/evidence/mobile-bn-crops.png",
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBeTruthy();
});

test("farmer profile/plot and persisted in-app forecast alerts", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Switch to English" }).click();
  await page
    .getByRole("button", { name: "Create farmer account", exact: true })
    .click();
  await page.getByLabel("Your name", { exact: true }).fill("Plan Farmer");

  await page
    .getByLabel("Password (10–128 characters)", { exact: true })
    .fill("browser-test-password");
  await page
    .getByRole("button", { name: "Create farmer account", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "My farm", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "My profile", exact: true }).click();
  await page.getByLabel("Plot name", { exact: true }).fill("পূর্বের জমি");
  await page.getByLabel("Land area (optional)", { exact: true }).fill("১.২৫");
  await page.getByRole("button", { name: "Add plot", exact: true }).click();
  await expect(page.locator(".card")).toContainText(["পূর্বের জমি"]);
  await page
    .getByRole("button", { name: "New calendar", exact: true })
    .first()
    .click();
  const date = (d) =>
    new Date(Date.now() + d * 86400000).toISOString().slice(0, 10);
  await page
    .getByRole("combobox", { name: "Plot (optional)", exact: true })
    .selectOption({ label: "পূর্বের জমি" });
  for (const [field, offset] of [
    ["Planting start", 0],
    ["Planting end", 10],
    ["Growth start", 11],
    ["Growth end", 100],
    ["Harvest start", 101],
    ["Harvest end", 115],
  ])
    await page.getByLabel(field, { exact: true }).fill(date(offset));
  await page
    .getByRole("button", { name: "Save & assess calendar", exact: true })
    .click();
  await expect(page.locator("#assessment-report")).toBeVisible();
  await expect(page.locator("#assessment-report")).toContainText(
    "ML assessment unavailable",
  );
  await page
    .getByRole("button", { name: "Weather alerts", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Refresh weather alerts", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Mark read", exact: true }).first(),
  ).toBeVisible();
  const count = await page
    .getByRole("button", { name: "Dismiss", exact: true })
    .count();
  expect(count).toBeGreaterThan(0);
  await page
    .getByRole("button", { name: "Mark read", exact: true })
    .first()
    .click();
  await expect(
    page.getByRole("button", { name: "Mark read", exact: true }),
  ).toHaveCount(count - 1);
  await page
    .getByRole("button", { name: "Dismiss", exact: true })
    .first()
    .click();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Weather alerts", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Dismiss", exact: true }),
  ).toHaveCount(count - 1);
  await page
    .getByRole("button", { name: "Refresh weather alerts", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Dismiss", exact: true }),
  ).toHaveCount(count - 1);
  await page.screenshot({
    path: ".local/evidence/forecast-alerts-en.png",
    fullPage: true,
  });
});

test("shared-device account changes clear private UI caches and isolate drafts", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Switch to English" }).click();
  await page
    .getByRole("button", { name: "Create farmer account", exact: true })
    .click();
  const a = "private_a_" + Date.now(),
    b = "private_b_" + Date.now();
  async function register(name) {
    await page.getByLabel("Your name", { exact: true }).fill(name);

    await page
      .getByLabel("Password (10–128 characters)", { exact: true })
      .fill("browser-test-password");
    await page
      .getByRole("button", { name: "Create farmer account", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: "My farm", exact: true }),
    ).toBeVisible();
  }
  await register(a);
  await page
    .getByRole("button", { name: "New calendar", exact: true })
    .first()
    .click();
  await page.getByRole("button", { name: "Load example dates" }).click();
  await page
    .getByLabel("Variety (optional)", { exact: true })
    .fill("PRIVATE-FARMER-A");
  await page
    .getByRole("button", { name: "Save & assess calendar", exact: true })
    .click();
  await expect(page.locator("#assessment-report")).toBeVisible();
  await page.getByRole("button", { name: "My calendars", exact: true }).click();
  await expect(page.locator(".history-row")).toHaveCount(1);
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await register(b);
  await page.getByRole("button", { name: "My calendars", exact: true }).click();
  await expect(page.locator(".history-row")).toHaveCount(0);
  await expect(page.locator("main")).not.toContainText("PRIVATE-FARMER-A");
  await page
    .getByRole("button", { name: "New calendar", exact: true })
    .first()
    .click();
  await expect(
    page.getByLabel("Variety (optional)", { exact: true }),
  ).toHaveValue("");
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await page.getByLabel("Your name", { exact: true }).fill(a);
  await page
    .getByLabel("Password (10–128 characters)", { exact: true })
    .fill("browser-test-password");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "My farm", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "New calendar", exact: true })
    .first()
    .click();
  await expect(
    page.getByLabel("Variety (optional)", { exact: true }),
  ).toHaveValue("PRIVATE-FARMER-A");
});

test("lost analysis response retries the same saved result and printed report includes suggestions", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Switch to English" }).click();
  await page
    .getByRole("button", { name: "Create farmer account", exact: true })
    .click();
  await page
    .getByLabel("Your name", { exact: true })
    .fill("Retry Farmer " + Date.now());
  await page
    .getByLabel("Password (10–128 characters)", { exact: true })
    .fill("browser-test-password");
  await page
    .getByRole("button", { name: "Create farmer account", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "My farm", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "New calendar", exact: true })
    .first()
    .click();
  await page.getByRole("button", { name: "Load example dates" }).click();
  let first = true;
  const keys = [];
  await page.route("**/api/analyze", async (route) => {
    keys.push(route.request().headers()["idempotency-key"]);
    if (first) {
      first = false;
      const saved = await route.fetch();
      expect(saved.status()).toBe(201);
      await route.abort("failed");
    } else await route.continue();
  });
  await page
    .getByRole("button", { name: "Save & assess calendar", exact: true })
    .click();
  await expect(page.getByRole("alert")).toBeVisible();
  await expect(page.getByLabel("Planting start", { exact: true })).toHaveValue(
    "2025-07-20",
  );
  await page.getByRole("button", { name: "Try again", exact: true }).click();
  await expect(page.locator("#assessment-report")).toBeVisible();
  expect(keys).toHaveLength(2);
  expect(keys[0]).toBe(keys[1]);
  await page.emulateMedia({ media: "print" });
  await expect(
    page.getByRole("heading", {
      name: "Suggested dates to review",
      exact: true,
    }),
  ).toBeVisible();
  await page.emulateMedia({ media: "screen" });
  await page.getByRole("button", { name: "My calendars", exact: true }).click();
  await expect(page.locator(".history-row")).toHaveCount(1);
});

test("calendar controls cover all six stage dates, revisions and history with Bengali manual input retained", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Switch to English" }).click();
  await page
    .getByRole("button", { name: "Create farmer account", exact: true })
    .click();
  await page
    .getByLabel("Your name", { exact: true })
    .fill("Calendar Farmer " + Date.now());
  await page
    .getByLabel("Password (10–128 characters)", { exact: true })
    .fill("browser-test-password");
  await page
    .getByRole("button", { name: "Create farmer account", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "My farm", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "New calendar", exact: true })
    .first()
    .click();
  await expect(page.locator('input[type="date"]')).toHaveCount(6);
  const dates = [
    ["Planting start", "2025-07-20"],
    ["Planting end", "2025-07-30"],
    ["Growth start", "2025-08-01"],
    ["Growth end", "2025-11-01"],
    ["Harvest start", "2025-11-15"],
    ["Harvest end", "2025-11-30"],
  ];
  for (const [label, value] of dates) {
    await page.getByLabel("Choose date: " + label, { exact: true }).fill(value);
    await expect(page.getByLabel(label, { exact: true })).toHaveValue(value);
  }
  await page.getByRole("button", { name: "বাংলায় পড়ুন" }).click();
  await expect(page.getByLabel("বপন শুরুর তারিখ", { exact: true })).toHaveValue(
    "২০২৫-০৭-২০",
  );
  await page.getByLabel("বপন শুরুর তারিখ", { exact: true }).fill("২০২৫-০৭-২১");
  await expect(
    page.getByLabel("ক্যালেন্ডার থেকে তারিখ বাছুন: বপন শুরুর তারিখ", {
      exact: true,
    }),
  ).toHaveValue("2025-07-21");
  await page.screenshot({
    path: ".local/evidence/calendar-picker-bn.png",
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "সংরক্ষণ ও মূল্যায়ন করুন", exact: true })
    .click();
  await expect(page.locator("#assessment-report")).toBeVisible();
  await page
    .getByRole("button", {
      name: "প্রস্তাবিত সংশোধন দেখুন ও সম্পাদনা করুন",
      exact: true,
    })
    .click();
  await expect(page.locator('input[type="date"]')).toHaveCount(6);
  await page
    .getByRole("button", { name: "আমার ক্যালেন্ডার", exact: true })
    .click();
  await expect(page.locator('input[type="date"]')).toHaveCount(1);
  const native = page.locator('input[type="date"]');
  await native.fill("2025-07-21");
  await expect(page.locator('input[name="historyDate"]')).toHaveValue(
    "২০২৫-০৭-২১",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBeTruthy();
});

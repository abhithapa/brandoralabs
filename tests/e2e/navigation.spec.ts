import { expect, test } from "@playwright/test";
import { SOLUTION_SLUGS } from "../../src/features/categories";

const pages = ["/", "/solutions", "/who-we-serve", "/how-we-work", "/partners", "/about", "/contact", "/privacy", "/terms"];

test.describe("public pages", () => {
  for (const path of pages) {
    test(`${path} renders one h1 without horizontal overflow`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      await expect(page.locator("h1")).toHaveCount(1);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }

  for (const slug of SOLUTION_SLUGS) {
    test(`solution ${slug} links to a preselected inquiry`, async ({ page }) => {
      await page.goto(`/solutions/${slug}`);
      await page.getByRole("link", { name: /talk to an expert about/i }).click();
      await expect(page).toHaveURL(new RegExp(`/contact\\?service=${slug}$`));
      await expect(page.getByLabel("Which service do you need?")).not.toHaveValue("");
    });
  }

  test("unknown solution returns a real 404", async ({ page }) => {
    const response = await page.goto("/solutions/does-not-exist");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("couldn't find");
  });

  test("skip link moves focus to main content", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "Skip to main content" })).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.locator("main#main")).toBeFocused();
  });
});

test.describe("mobile menu", () => {
  test.use({ viewport: { width: 360, height: 780 } });

  test("opens, closes with Escape and returns focus", async ({ page }) => {
    await page.goto("/");
    const toggle = page.getByRole("button", { name: "Menu" });
    await toggle.click();
    await expect(page.getByRole("button", { name: "Close" })).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Solutions" }).last()).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("button", { name: "Menu" })).toBeFocused();
    await expect(page.getByRole("button", { name: "Menu" })).toHaveAttribute("aria-expanded", "false");
  });
});

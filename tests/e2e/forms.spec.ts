import { expect, test } from "@playwright/test";

test.describe("requirement form", () => {
  test("shows all errors at once, then submits and shows a reference", async ({ page }) => {
    await page.goto("/contact");
    await page.getByRole("radio", { name: "WhatsApp" }).check();
    await page.getByRole("button", { name: "Send requirement" }).click();

    const summary = page.getByRole("alert").filter({ hasText: "There are problems" });
    await expect(summary).toBeFocused();
    for (const field of ["Full name", "Email", "Phone", "Service", "Your requirement"]) {
      await expect(summary).toContainText(field);
    }

    await page.getByRole("textbox", { name: "Full name" }).fill("Playwright Visitor");
    await page.getByRole("textbox", { name: "Email" }).fill("playwright.visitor@example.com");
    await page.getByRole("textbox", { name: /^Phone/ }).fill("+977 9800000000");
    await page.getByLabel("Which service do you need?").selectOption("not_sure");
    await page.getByLabel("Your requirement").fill("End-to-end test requirement. Not a real request.");
    await page.getByRole("button", { name: "Send requirement" }).click();

    await expect(page.getByRole("heading", { name: "We've received your requirement" })).toBeFocused();
    await expect(page.getByText(/BL-[0-9A-Z]{4}-[0-9A-Z]{4}-[0-9A-Z]{2}/)).toBeVisible();
  });

  test("online meeting is described as a follow-up, not a booking", async ({ page }) => {
    await page.goto("/contact?service=cybersecurity");
    await page.getByRole("textbox", { name: "Full name" }).fill("Meeting Visitor");
    await page.getByRole("textbox", { name: "Email" }).fill("meeting.visitor@example.com");
    await page.getByLabel("Your requirement").fill("Would like to discuss a security review. Test only.");
    await page.getByRole("radio", { name: "Online meeting" }).check();
    await page.getByRole("button", { name: "Send requirement" }).click();
    await expect(page.getByText("No meeting is booked yet.")).toBeVisible();
  });
});

test("partner application", async ({ page }) => {
  await page.goto("/partners#apply");
  await page.getByRole("textbox", { name: "Your name" }).fill("Playwright Partner");
  await page.getByRole("textbox", { name: "Email" }).fill("playwright.partner@example.com");
  await page.getByLabel("What describes you best?").selectOption("agency");
  await page.getByLabel("Digital Marketing").check();
  await page.getByLabel("Your capabilities").fill("End-to-end test application. Not a real partner.");
  await page.getByRole("button", { name: "Send application" }).click();
  await expect(page.getByRole("heading", { name: "We've received your application" })).toBeVisible();
});

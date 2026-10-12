const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    args: ["--no-sandbox"]
  });
  const page = await browser.newPage({ viewport: { width: 1365, height: 900 } });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const base = "http://127.0.0.1:3100";
  await page.goto(base);
  await page.getByRole("button", { name: /Explore FitBooking/ }).click();
  await page.getByRole("heading", { name: /Good morning, Alex/ }).waitFor();

  const jump = async (name) => {
    await page.getByRole("button", { name: /Preview screens/ }).click();
    await page.getByRole("button", { name }).last().click();
  };
  const expectHeading = async (name) => {
    const text = await page.locator("h1").first().innerText();
    if (!text.includes(name)) throw new Error(`Expected heading "${name}", got "${text}"`);
  };

  await page.locator(".coach-card-copy").first().click();
  await expectHeading("Tan Chaiyaporn");
  await page.getByRole("button", { name: "Add to favorites" }).click();
  await page.getByRole("button", { name: "Remove from favorites" }).waitFor();
  await page.getByRole("button", { name: /Choose a session/ }).click();
  await expectHeading("Choose your kind of strong");
  await page.getByRole("button", { name: "Cardio", exact: true }).click();
  if (!(await page.getByText("HIIT", { exact: true }).count())) throw new Error("Course filter failed");
  await page.getByRole("button", { name: "All sessions", exact: true }).click();
  await page.locator(".course-card").first().click();
  await expectHeading("Make some time for you");
  await page.getByRole("button", { name: /Thu, Apr 18/ }).click();
  await page.getByRole("button", { name: "03:20 PM" }).click();
  await page.getByRole("button", { name: "At home" }).click();
  await page.locator("#district").selectOption("OLD CITY");
  await page.getByRole("button", { name: /Continue to checkout/ }).click();
  await expectHeading("Your time is waiting");
  await page.getByRole("button", { name: /Silver Member/ }).click();
  await page.getByRole("button", { name: /13 Sessions/ }).click();
  await page.getByRole("button", { name: /Credit \/ Debit Card/ }).click();
  await page.getByRole("button", { name: /Confirm booking/ }).click();
  await expectHeading("You’re booked, Alex");
  await page.getByRole("button", { name: /View my bookings/ }).click();
  await expectHeading("My bookings");
  await page.getByRole("button", { name: "Past", exact: true }).click();
  if (!(await page.getByText("Mobility & Flexibility").count())) throw new Error("Past bookings tab failed");

  await jump("Packages & membership");
  await expectHeading("More sessions");
  await page.getByRole("button", { name: /Choose package/ }).first().click();
  await page.getByRole("status").waitFor();
  await jump("Reviews");
  await expectHeading("How did training with Tan feel");
  await page.getByRole("button", { name: "3 stars" }).click();
  await page.getByText("It was good").waitFor();
  await page.getByRole("button", { name: "Friendly", exact: true }).click();
  await page.getByRole("button", { name: /Share your review/ }).click();
  await page.getByRole("status").waitFor();
  await jump("Fitness profile & progress");
  await expectHeading("Look how far you’ve come");
  await page.getByRole("button", { name: "Complete demo goal" }).click();
  await page.getByText("Goal complete · nice work!").waitFor();
  await page.getByRole("button", { name: "Goals", exact: true }).click();
  await page.getByText("Move more each week").waitFor();
  await jump("Member profile & settings");
  await expectHeading("Your profile");
  await page.getByRole("button", { name: "Notifications", exact: true }).click();
  const toggle = page.getByRole("button", { name: "Toggle session reminders" });
  if ((await toggle.getAttribute("aria-pressed")) !== "true") throw new Error("Notifications initial state failed");
  await toggle.click();
  if ((await toggle.getAttribute("aria-pressed")) !== "false") throw new Error("Notification toggle failed");
  await jump("Coach & admin portal");
  await expectHeading("A healthier week starts here");
  await page.getByRole("button", { name: "Manage courses" }).click();
  await expectHeading("Manage courses");
  await jump("Explore coaches");
  await expectHeading("The right coach changes everything");
  await page.getByRole("textbox", { name: "Search coaches" }).fill("Ploy");
  if (!(await page.getByText("Coach Ploy", { exact: true }).count())) throw new Error("Coach search failed");

  const screens = [
    ["Home dashboard", "Good morning, Alex"],
    ["Explore coaches", "The right coach changes everything"],
    ["Coach profile", "Tan Chaiyaporn"],
    ["Courses & training types", "Choose your kind of strong"],
    ["Booking flow", "Make some time for you"],
    ["Booking checkout", "Your time is waiting"],
    ["Booking success", "You’re booked, Alex"],
    ["My bookings", "My bookings"],
    ["Packages & membership", "More sessions"],
    ["Reviews", "How did training with Tan feel"],
    ["Fitness profile & progress", "Look how far you’ve come"],
    ["Member profile & settings", "Your profile"],
    ["Coach & admin portal", "A healthier week starts here"]
  ];
  for (const [label, heading] of screens) {
    await jump(label);
    await expectHeading(heading);
  }
  const mobile = await browser.newPage({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true
  });
  await mobile.goto(`${base}#home`);
  await mobile.getByRole("heading", { name: /Good morning, Alex/ }).waitFor();
  const widths = await mobile.evaluate(() => ({
    inner: innerWidth,
    document: document.documentElement.scrollWidth
  }));
  if (widths.document > widths.inner) throw new Error(`Mobile overflow: ${JSON.stringify(widths)}`);
  await mobile.getByRole("button", { name: "Explore" }).last().click();
  await mobile.getByRole("heading", { name: /The right coach changes everything/ }).waitFor();
  if (errors.length) throw new Error(`Browser runtime errors: ${errors.join(" | ")}`);
  console.log("PASS: all screens, core prototype interactions, mobile navigation, and narrow-screen overflow check.");
  await browser.close();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});

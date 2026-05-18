import { chromium } from '@playwright/test';
import dotenv from 'dotenv';
dotenv.config();

export default async function globalSetup() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto(process.env.SHOPIFY_STORE_URL!);

  const passwordInput = page.locator('input[name="password"]');
  if (await passwordInput.isVisible({ timeout: 5000 }).catch(() => false)) {
    await passwordInput.fill(process.env.SHOPIFY_STORE_PASSWORD!);
    await page.locator('button[type="submit"]').click();
    await page.waitForLoadState('networkidle');
  }

  await page.context().storageState({ path: 'storageState.json' });
  await browser.close();
}
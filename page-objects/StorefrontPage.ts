import { Page } from '@playwright/test';

export class StorefrontPage {
  constructor(private page: Page) {}

  async navigate() {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
  }

  async navigateToProduct(productHandle: string) {
    await this.page.goto(`/products/${productHandle}`);
    await this.page.waitForLoadState('networkidle');
  }

  async dismissConsentBanner() {
    const banner = this.page.locator('button:has-text("Accept"), button:has-text("I accept")');
    if (await banner.isVisible({ timeout: 3000 }).catch(() => false)) {
      await banner.click();
    }
  }
}
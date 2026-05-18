import { Page } from '@playwright/test';

export class ProductPage {
    constructor(private page: Page) {}

    async selectVariantOption(optionName: string, value: string) {
    // Target radio inputs by name (option group) and value (option value)
    // These attributes are stable across theme updates
    await this.page
        .locator(`input[type="radio"][name="${optionName}"][value="${value}"]`)
        .click({ force: true });
    }

    async addToCart() {
    await Promise.all([
        this.page.waitForResponse(r => r.url().includes('/cart/add') && r.status() === 200),
        this.page.getByRole('button', { name: 'Add to cart' }).click(),
    ]);
    }

    async getPrice(): Promise<string> {
    // Target the specific sale price span rather than the whole price block
    return this.page
        .locator('.price__sale .price-item--sale, .price__regular .price-item--regular')
        .first()
        .innerText();
    }

    async getInventoryMessage(): Promise<string> {
    const msg = this.page.locator('.product__inventory, [class*="inventory"]');
    if (await msg.isVisible({ timeout: 2000 }).catch(() => false)) {
        return msg.innerText();
    }
    return '';
    }

    async getAddToCartButtonText(): Promise<string> {
    return this.page
    .getByRole('button', { name: /Add to cart|Sold out/i })
    .first()
    .innerText();
    }

    async isSizeGroupVisible(): Promise<boolean> {
    return this.page
        .getByRole('group', { name: 'Size' })
        .isVisible({ timeout: 5000 })
        .catch(() => false);
    }

    async isColorGroupVisible(): Promise<boolean> {
    return this.page
        .getByRole('group', { name: 'Color' })
        .isVisible({ timeout: 5000 })
        .catch(() => false);
    }
}
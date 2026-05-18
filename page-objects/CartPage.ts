import { Page } from '@playwright/test';

export class CartPage {
    constructor(private page: Page) {}

    async navigate() {
        await this.page.goto('/cart');
        await this.page.waitForLoadState('networkidle');
    }

    async getCartItems(): Promise<string[]> {
        const items = this.page.locator('.cart-item__name, [class*="cart-item"] a');
        return items.allInnerTexts();
    }

    async getCartTotal(): Promise<string> {
        return this.page.locator('.totals__total-value, [class*="cart-total"]').innerText();
    }

    async applyDiscountCode(code: string) {
        const input = this.page.locator('[name="discount"], #discount-code, input[placeholder*="iscount"]');
        await input.fill(code);
        await Promise.all([
            this.page.waitForResponse(r => r.url().includes('/cart') && r.status() === 200).catch(() => {}),
            this.page.locator('button:has-text("Apply")').click(),
        ]);
    }

    async getDiscountMessage(): Promise<string> {
        const msg = this.page.locator('.cart-discount, [class*="discount-message"], .discount__applied');
        if (await msg.isVisible({ timeout: 3000 }).catch(() => false)) {
            return msg.innerText();
        }
        return '';
    }

    async proceedToCheckout() {
        await this.page.locator('button:has-text("Check out"), a:has-text("Check out")').click();
        await this.page.waitForLoadState('networkidle');
    }

    async updateItemQuantity(productTitle: string, quantity: number) {
        const row = this.page.locator(`[class*="cart-item"]:has-text("${productTitle}")`);
        const input = row.locator('input[type="number"], input[name*="quantity"]');
        await input.fill(String(quantity));
        await Promise.all([
            this.page.waitForResponse(r => r.url().includes('/cart') && r.status() === 200),
            input.press('Enter'),
        ]);
    }

    async removeItem(productTitle: string) {
        const row = this.page.locator(`[class*="cart-item"]:has-text("${productTitle}")`);
        await row.locator('a:has-text("Remove"), button:has-text("Remove")').click();
        await row.waitFor({ state: 'hidden' });
    }

    async clearCart() {
        await this.navigate();
        // Check if cart has items
        const items = this.page.locator('.cart-item, [class*="cart-item"]');
        const count = await items.count();
        if (count === 0) return;

        // Remove each item
        const removeButtons = this.page.locator('a[href*="/cart/change"], button:has-text("Remove")');
        const buttonCount = await removeButtons.count();
        for (let i = 0; i < buttonCount; i++) {
        await removeButtons.first().click();
        await this.page.waitForTimeout(500);
        }
    }
}
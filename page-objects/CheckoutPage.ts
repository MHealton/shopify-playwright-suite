import { Page } from '@playwright/test';

export class CheckoutPage {
  constructor(private page: Page) {}

  // ─── Contact ──────────────────────────────────────────────────────────────

  async fillEmail(email: string) {
    await this.page.locator('#email, input[type="email"]').fill(email);
  }

  // ─── Shipping Address ─────────────────────────────────────────────────────

  async fillShippingAddress(address: {
    firstName: string;
    lastName: string;
    address1: string;
    city: string;
    state: string;
    zip: string;
    country?: string;
  }) {
    await this.page.locator('#shipping-address1, input[name="address1"]').fill(address.address1);
    await this.page.locator('#shipping-city, input[name="city"]').fill(address.city);
    await this.page.locator('input[name="first_name"]').fill(address.firstName);
    await this.page.locator('input[name="last_name"]').fill(address.lastName);
    await this.page.locator('input[name="zip"]').fill(address.zip);

    // State/province is usually a select
    const stateSelect = this.page.locator('select[name="province"]');
    if (await stateSelect.isVisible({ timeout: 2000 }).catch(() => false)) {
      await stateSelect.selectOption({ label: address.state });
    }
  }

  async continueToShipping() {
    await this.page.locator('button:has-text("Continue to shipping")').click();
    await this.page.waitForLoadState('networkidle');
  }

  // ─── Shipping Method ──────────────────────────────────────────────────────

  async getShippingOptions(): Promise<string[]> {
    const options = this.page.locator('.radio-wrapper__label, [class*="shipping-method"]');
    return options.allInnerTexts();
  }

  async selectShippingOption(label: string) {
    await this.page.locator(`label:has-text("${label}")`).click();
  }

  async continueToPayment() {
    await this.page.locator('button:has-text("Continue to payment")').click();
    await this.page.waitForLoadState('networkidle');
  }

  // ─── Payment ──────────────────────────────────────────────────────────────

  /**
   * Fills in the Bogus Gateway payment fields.
   * card: '1' = success, '2' = declined, '3' = gateway error
   */
  async fillBogusPayment(card: '1' | '2' | '3') {
    await this.page.locator('[placeholder*="card number"], input[id*="card-number"]').fill(card);
    await this.page.locator('[placeholder*="expiration"], input[id*="expiry"]').fill('12/30');
    await this.page.locator('[placeholder*="security"], input[id*="cvv"]').fill('123');
  }

  async applyDiscountCode(code: string) {
    const toggle = this.page.locator('button:has-text("Discount code"), a:has-text("discount")');
    if (await toggle.isVisible({ timeout: 2000 }).catch(() => false)) {
      await toggle.click();
    }
    await this.page.locator('#checkout_reduction_code, input[name*="discount"]').fill(code);
    await this.page.locator('button:has-text("Apply")').click();
    await this.page.waitForTimeout(1000);
  }

  async getDiscountError(): Promise<string> {
    const err = this.page.locator('.reduction-code__error, [class*="discount-error"]');
    if (await err.isVisible({ timeout: 3000 }).catch(() => false)) {
      return err.innerText();
    }
    return '';
  }

  async completeOrder() {
    await this.page.locator('button:has-text("Pay now"), button:has-text("Complete order")').click();
    await this.page.waitForLoadState('networkidle');
  }

  // ─── Confirmation ─────────────────────────────────────────────────────────

  async isOrderConfirmationVisible(): Promise<boolean> {
    return this.page
      .locator('h2:has-text("Your order is confirmed"), h1:has-text("Thank you")')
      .isVisible({ timeout: 10000 })
      .catch(() => false);
  }

  async getOrderNumber(): Promise<string> {
    const el = this.page.locator('[class*="order-number"], h2:has-text("Order")');
    if (await el.isVisible({ timeout: 3000 }).catch(() => false)) {
      return el.innerText();
    }
    return '';
  }
}
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
    await this.page.getByRole('textbox', { name: 'First name' }).fill(address.firstName);
    await this.page.getByRole('textbox', { name: 'Last name' }).fill(address.lastName);
    await this.page.getByRole('combobox', { name: 'Address' }).fill(address.address1);
    await this.page.getByRole('textbox', { name: 'City' }).fill(address.city);
    await this.page.getByRole('textbox', { name: 'ZIP code' }).fill(address.zip);

    const stateSelect = this.page.getByRole('combobox', { name: 'State' });
    if (await stateSelect.isVisible({ timeout: 2000 }).catch(() => false)) {
      await stateSelect.selectOption({ label: address.state });
    }

    if (address.country) {
      const countrySelect = this.page.getByRole('combobox', { name: 'Country/Region' });
      if (await countrySelect.isVisible({ timeout: 2000 }).catch(() => false)) {
        await countrySelect.selectOption({ label: address.country });
      }
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
  await this.page
    .getByRole('textbox', { name: 'Discount code or gift card' })
    .fill(code);
  await this.page
    .getByRole('button', { name: 'Apply Discount Code' })
    .click();
  await Promise.race([
    this.page.getByText(/Enter a valid discount code/i).first().waitFor({ timeout: 5000 }).catch(() => undefined),
    this.page.getByText(/Discount code applied/i).first().waitFor({ timeout: 5000 }).catch(() => undefined),
  ]);
}

  async getDiscountError(): Promise<string> {
    const err = this.page.getByText(/Enter a valid discount code/i).first();
    if (await err.isVisible({ timeout: 5000 }).catch(() => false)) {
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
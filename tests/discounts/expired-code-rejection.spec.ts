import { test, expect } from '../../lib/fixtures/base.fixture';
import { PRODUCTS, DISCOUNTS, TEST_ADDRESS, BOGUS_CARD } from '../../lib/testData';

test.describe('Discount Code Rejection', () => {
    test.beforeEach(async ({ storefrontPage, productPage, cartPage }) => {
        // Start each test with a clean cart and a product added
        await cartPage.clearCart();
        await storefrontPage.navigateToProduct(PRODUCTS.mug.handle);
        await storefrontPage.dismissConsentBanner();
        await productPage.addToCart();
        await cartPage.proceedToCheckout();
    });

    test('expired code should return a validation error', async ({ checkoutPage }) => {
        // Shopify returns the same "Enter a valid discount code" message for
        // expired and invalid codes — documented here intentionally
        await checkoutPage.applyDiscountCode(DISCOUNTS.expired);

        const error = await checkoutPage.getDiscountError();
        expect(error).toContain('Enter a valid discount code');
    });

    test('nonexistent code should return a validation error', async ({ checkoutPage }) => {
        await checkoutPage.applyDiscountCode('DOESNOTEXIST');

        const error = await checkoutPage.getDiscountError();
        expect(error).toContain('Enter a valid discount code');
    });

    test('valid code should apply without error', async ({ checkoutPage }) => {
        await checkoutPage.applyDiscountCode(DISCOUNTS.save20);

        const error = await checkoutPage.getDiscountError();
        expect(error).toBe('');
    });
});
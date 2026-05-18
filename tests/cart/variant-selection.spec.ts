import { test, expect } from '../../lib/fixtures/base.fixture';
import { PRODUCTS } from '../../lib/testData';
import { CartPage } from '../../page-objects/CartPage';

test.describe('Variant Selection', () => {
  test.beforeEach(async ({ storefrontPage, cartPage }) => {
    await cartPage.clearCart();
    await storefrontPage.navigateToProduct(PRODUCTS.tShirt.handle);
    await storefrontPage.dismissConsentBanner();
  });

  test('should display Size and Color option groups', async ({ productPage }) => {
    expect(await productPage.isSizeGroupVisible()).toBeTruthy();
    expect(await productPage.isColorGroupVisible()).toBeTruthy();
  });

  test('should add the correct variant to cart', async ({
    productPage,
    cartPage,
  }) => {
    await productPage.selectVariantOption('Size', 'M');
    await productPage.selectVariantOption('Color', 'White');
    await productPage.addToCart();

    await cartPage.navigate();
    const items = await cartPage.getCartItems();
    expect(items.some((i) => i.includes('Classic T-Shirt'))).toBeTruthy();
  });

  test('should display a price after selecting a variant', async ({ productPage }) => {
    await productPage.selectVariantOption('Size', 'M');
    await productPage.selectVariantOption('Color', 'White');

    const price = await productPage.getPrice();
    expect(price).toContain('$29.99');
  });

    test('should allow adding Small / Black to cart when qty is 1', async ({
    productPage,
    cartPage,
    }) => {
    await productPage.selectVariantOption('Size', 'S');
    await productPage.selectVariantOption('Color', 'Black');

    const buttonText = await productPage.getAddToCartButtonText();
    expect(buttonText.trim()).toContain('Add to cart');

    await productPage.addToCart();
    await cartPage.navigate();
    const items = await cartPage.getCartItems();
    expect(items.some((i) => i.includes('Classic T-Shirt'))).toBeTruthy();
    });
});
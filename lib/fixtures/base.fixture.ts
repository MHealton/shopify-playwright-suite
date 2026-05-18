import { test as base } from '@playwright/test';
import { StorefrontPage } from '../../page-objects/StorefrontPage';
import { ProductPage } from '../../page-objects/ProductPage';
import { CartPage } from '../../page-objects/CartPage';
import { CheckoutPage } from '../../page-objects/CheckoutPage';

type ShopifyFixtures = {
  storefrontPage: StorefrontPage;
  productPage: ProductPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
};

export const test = base.extend<ShopifyFixtures>({
  storefrontPage: async ({ page }, use) => {
    const storefrontPage = new StorefrontPage(page);
    await use(storefrontPage);
  },

  productPage: async ({ page }, use) => {
    const productPage = new ProductPage(page);
    await use(productPage);
  },

  cartPage: async ({ page }, use) => {
    const cartPage = new CartPage(page);
    await use(cartPage);
  },

  checkoutPage: async ({ page }, use) => {
    const checkoutPage = new CheckoutPage(page);
    await use(checkoutPage);
  },
});

export { expect } from '@playwright/test';
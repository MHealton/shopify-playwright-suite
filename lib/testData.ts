export const PRODUCTS = {
  tShirt: {
    handle: 'classic-t-shirt',
    title: 'Classic T-Shirt',
    price: 29.99,
    concurrencyVariant: {
      name: 'Small / Black',
      size: 'Small',
      color: 'Black',
    },
  },
  mug: {
    handle: 'coffee-mug',
    title: 'Coffee Mug',
    price: 14.99,
  },
  keyboard: {
    handle: 'mechanical-keyboard',
    title: 'Mechanical Keyboard',
    price: 89.99,
  },
  limitedPrint: {
    handle: 'limited-edition-print',
    title: 'Limited Edition Print',
    price: 39.99,
  },
  pdf: {
    handle: 'qa-checklist-pdf',
    title: 'QA Checklist PDF',
    price: 4.99,
  },
};

export const DISCOUNTS = {
  save20: 'SAVE20',
  threshold15: 'THRESHOLD15',
  apparel10: 'APPAREL10',
  oneUse: 'ONEUSE',
  perCustomer: 'PERCUSTOMER',
  expired: 'EXPIRED',
  freeShip: 'FREESHIP',
};

export const BOGUS_CARD = {
  success: '1',
  declined: '2',
  error: '3',
  expiry: '12/30',
  cvv: '123',
};

export const TEST_ADDRESS = {
  firstName: 'Test',
  lastName: 'User',
  address1: '123 Test Street',
  city: 'Denver',
  state: 'Colorado',
  zip: '80202',
  country: 'United States',
};

export const TEST_USERS = {
  one: {
    email: process.env.TEST_USER_1_EMAIL!,
    password: process.env.TEST_USER_1_PASSWORD!,
  },
  two: {
    email: process.env.TEST_USER_2_EMAIL!,
    password: process.env.TEST_USER_2_PASSWORD!,
  },
};
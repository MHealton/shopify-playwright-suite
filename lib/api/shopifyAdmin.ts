import dotenv from 'dotenv';
dotenv.config();

const STORE_URL = process.env.SHOPIFY_STORE_URL!;
const CLIENT_ID = process.env.SHOPIFY_CLIENT_ID!;
const CLIENT_SECRET = process.env.SHOPIFY_CLIENT_SECRET!;

// ─── Token Management ────────────────────────────────────────────────────────

let cachedToken: string | null = null;
let tokenExpiry: number = 0;

export async function getAdminToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  const response = await fetch(`${STORE_URL}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch admin token: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  cachedToken = data.access_token;
  // tokens expire after 24hrs — refresh 5 minutes early
  tokenExpiry = Date.now() + (data.expires_in - 300) * 1000;

  return cachedToken!;
}

// ─── Shared Request Helper ───────────────────────────────────────────────────

async function adminRequest(
  method: string,
  path: string,
  body?: object
): Promise<any> {
  const token = await getAdminToken();

  const response = await fetch(`${STORE_URL}/admin/api/2025-01/${path}`, {
    method,
    headers: {
      'X-Shopify-Access-Token': token,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Admin API ${method} ${path} failed: ${response.status} — ${text}`);
  }

  return response.json();
}

// ─── Inventory ───────────────────────────────────────────────────────────────

/**
 * Resets the inventory of a specific variant back to a target quantity.
 * Used before concurrency tests to restore Small/Black T-Shirt to qty 1.
 */
export async function resetVariantInventory(
  inventoryItemId: string,
  locationId: string,
  quantity: number
): Promise<void> {
  await adminRequest('POST', 'inventory_levels/set.json', {
    inventory_item_id: inventoryItemId,
    location_id: locationId,
    available: quantity,
  });
}

/**
 * Fetches inventory item ID and location ID for a given variant ID.
 * Call this once during test setup to get the IDs needed for resetVariantInventory.
 */
export async function getVariantInventoryInfo(variantId: string): Promise<{
  inventoryItemId: string;
  locationId: string;
}> {
  const data = await adminRequest('GET', `variants/${variantId}.json`);
  const inventoryItemId = String(data.variant.inventory_item_id);

  const levelsData = await adminRequest(
    'GET',
    `inventory_levels.json?inventory_item_ids=${inventoryItemId}`
  );
  const locationId = String(levelsData.inventory_levels[0].location_id);

  return { inventoryItemId, locationId };
}

// ─── Discounts ───────────────────────────────────────────────────────────────

/**
 * Fetches all discount codes matching a given code string.
 * Returns the discount's current usage count and ID.
 */
export async function getDiscountByCode(code: string): Promise<{
  id: string;
  usageCount: number;
} | null> {
  const data = await adminRequest(
    'GET',
    `price_rules.json?limit=250`
  );

  for (const rule of data.price_rules) {
    const codesData = await adminRequest(
      'GET',
      `price_rules/${rule.id}/discount_codes.json`
    );
    const match = codesData.discount_codes.find(
      (c: any) => c.code.toUpperCase() === code.toUpperCase()
    );
    if (match) {
      return {
        id: match.id,
        usageCount: match.usage_count,
      };
    }
  }

  return null;
}

// ─── Orders ──────────────────────────────────────────────────────────────────

/**
 * Cancels all open test orders to keep the store clean between runs.
 */
export async function cancelAllOpenOrders(): Promise<void> {
  const data = await adminRequest('GET', 'orders.json?status=open&limit=250');

  for (const order of data.orders) {
    await adminRequest('POST', `orders/${order.id}/cancel.json`, {});
  }
}

/**
 * Returns all orders placed by a specific customer email.
 */
export async function getOrdersByEmail(email: string): Promise<any[]> {
  const data = await adminRequest(
    'GET',
    `orders.json?status=any&limit=250`
  );
  return data.orders.filter((o: any) => o.email === email);
}
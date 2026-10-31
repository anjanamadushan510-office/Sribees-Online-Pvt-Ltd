import { test as baseTest } from '@playwright/test';
import {
  mockUser,
  mockTokens,
  mockAddresses,
  mockProducts,
  mockInitialCart,
  mockPaymentMethods,
  mockWallet,
  mockQuoteResponse,
  mockCreatedOrderResponse,
  mockSessions,
  mockNotificationPreferences,
} from './mockData';

export interface ApiMockController {
  setCartItems: (items: any[]) => void;
  getPlacedOrderPayload: () => any;
  setQuoteDiscount: (discount: number, couponCode?: string) => void;
}

export type CustomTestFixtures = {
  mockApi: ApiMockController;
  setupAuthenticatedUser: () => Promise<void>;
  setupGuestUser: () => Promise<void>;
};

export const test = baseTest.extend<CustomTestFixtures>({
  setupAuthenticatedUser: async ({ page }, use) => {
    const setup = async () => {
      await page.addInitScript(
        ({ user, tokens }) => {
          window.localStorage.setItem('sribees_access_token', tokens.accessToken);
          window.localStorage.setItem('sribees_refresh_token', tokens.refreshToken);
          window.localStorage.setItem('sribees_user_data', JSON.stringify(user));
          window.localStorage.setItem(
            'sribees_user_location',
            JSON.stringify({ province: 'Western', district: 'Kalutara', postalCity: 'Matugama' })
          );
          window.localStorage.setItem('sribees_user_location_label', 'Matugama, Kalutara');
          window.localStorage.setItem('sribees_mobile_app_banner_dismissed', 'true');
          window.localStorage.setItem('sribees_cookie_consent_v1', 'accepted');
        },
        { user: mockUser, tokens: mockTokens }
      );
    };
    await use(setup);
  },

  setupGuestUser: async ({ page }, use) => {
    const setup = async () => {
      await page.addInitScript(() => {
        window.localStorage.removeItem('sribees_access_token');
        window.localStorage.removeItem('sribees_refresh_token');
        window.localStorage.removeItem('sribees_user_data');
        window.localStorage.setItem(
          'sribees_user_location',
          JSON.stringify({ province: 'Western', district: 'Kalutara', postalCity: 'Matugama' })
        );
        window.localStorage.setItem('sribees_user_location_label', 'Matugama, Kalutara');
        window.localStorage.setItem('sribees_mobile_app_banner_dismissed', 'true');
        window.localStorage.setItem('sribees_cookie_consent_v1', 'accepted');
      });
    };
    await use(setup);
  },

  mockApi: async ({ page }, use) => {
    let currentCart = JSON.parse(JSON.stringify(mockInitialCart));
    let lastOrderPayload: any = null;
    let quoteDiscount = 0;

    const controller: ApiMockController = {
      setCartItems: (items: any[]) => {
        currentCart.items = items;
        const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        currentCart.totals.subtotal = subtotal;
        currentCart.totals.total = Math.max(0, subtotal + currentCart.totals.shipping - (currentCart.totals.discount || 0));
      },
      getPlacedOrderPayload: () => lastOrderPayload,
      setQuoteDiscount: (discount: number) => {
        quoteDiscount = discount;
      },
    };

    const useLiveApi = process.env.E2E_USE_LIVE_API === 'true';

    if (!useLiveApi) {
      // 1. Auth endpoints
      await page.route('**/api/v1/auth/**', async (route) => {
        const url = route.request().url();
        const method = route.request().method();

        if (url.includes('/auth/account/deletion/request-otp')) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              success: true,
              message: 'OTP sent for account deletion verification.',
              expiresInSeconds: 180,
            }),
          });
          return;
        }

        if (url.includes('/auth/account/deletion/confirm')) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              success: true,
              message: 'Your account has been closed.',
            }),
          });
          return;
        }

        if (url.includes('/auth/sessions')) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              success: true,
              data: mockSessions,
            }),
          });
          return;
        }

        if ((method === 'PUT' || method === 'PATCH') && url.includes('/auth/me')) {
          const postData = route.request().postDataJSON() || {};
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              success: true,
              data: { ...mockUser, ...postData },
              user: { ...mockUser, ...postData },
            }),
          });
          return;
        }

        if (url.includes('/auth/me')) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              success: true,
              data: mockUser,
              user: mockUser,
            }),
          });
          return;
        }

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              tokens: mockTokens,
              user: mockUser,
            },
          }),
        });
      });

      // 2. Session endpoints
      await page.route('**/api/v1/session/**', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              postalCity: 'Colombo 03',
              district: 'Colombo',
              branchId: 'br_colombo_01',
              branchName: 'Colombo Branch',
            },
          }),
        });
      });

      // 3. Branch endpoints
      await page.route('**/api/v1/branch/**', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              branch_id: 'br_colombo_01',
              branch_name: 'Colombo Branch',
              delivery_available: true,
              is_serviceable: true,
            },
          }),
        });
      });

      // 4. Products endpoint
      await page.route('**/api/v1/products*', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              products: mockProducts,
              pagination: { total: mockProducts.length, page: 1, limit: 20, pages: 1 },
            },
          }),
        });
      });

      // 5. Addresses endpoint (/user/addresses)
      await page.route(/.*\/api\/v1\/.*addresses.*/, async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: mockAddresses,
          }),
        });
      });

      // 6. Payment methods endpoint (Must return { success: true, data: { methods: [...] } })
      await page.route('**/api/v1/payment-methods*', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: mockPaymentMethods,
          }),
        });
      });

      // 7. Wallet balance and loyalty endpoints
      await page.route(/.*\/api\/v1\/wallet.*/, async (route) => {
        const url = route.request().url();
        if (url.includes('/wallet/loyalty')) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              success: true,
              data: {
                points: 150,
                tier: { name: 'Silver', color: '#9CA3AF' },
                next_tier: { name: 'Gold', points_needed: 250 },
              },
            }),
          });
          return;
        }

        if (url.includes('/wallet/transactions')) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              success: true,
              data: {
                transactions: [],
                total: 0,
              },
            }),
          });
          return;
        }

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockWallet),
        });
      });

      // 8. Cart endpoints
      await page.route('**/api/v1/cart**', async (route) => {
        const method = route.request().method();
        const url = route.request().url();

        if (method === 'GET') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              success: true,
              data: currentCart,
            }),
          });
        } else if (method === 'POST') {
          if (url.includes('/clear')) {
            currentCart.items = [];
            currentCart.totals.subtotal = 0;
            currentCart.totals.total = 0;
          } else {
            const postData = route.request().postDataJSON() || {};
            const existing = currentCart.items.find((i: any) => i.product_id === postData.product_id);
            if (existing) {
              existing.quantity += postData.quantity || 1;
            } else {
              currentCart.items.push({
                product_id: postData.product_id,
                quantity: postData.quantity || 1,
                price: postData.price || 500,
                name: postData.name || 'Test Product',
                image: postData.image || '',
                sku: postData.sku || '',
              });
            }
          }
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              success: true,
              data: currentCart,
            }),
          });
        } else if (method === 'PUT') {
          const putData = route.request().postDataJSON() || {};
          const matched = currentCart.items.find((i: any) => i.product_id === putData.product_id);
          if (matched) {
            matched.quantity = putData.quantity;
          }
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              success: true,
              data: currentCart,
            }),
          });
        } else if (method === 'DELETE') {
          const parts = url.split('/');
          const productId = parts[parts.length - 1];
          currentCart.items = currentCart.items.filter((i: any) => i.product_id !== productId);
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              success: true,
              data: currentCart,
            }),
          });
        } else {
          await route.continue();
        }
      });

      // 9. Order Quote endpoint
      await page.route('**/api/v1/orders/quote*', async (route) => {
        const payload = route.request().postDataJSON() || {};
        const subtotal = currentCart.totals.subtotal || 2150;
        const deliveryFee = 350;
        const discount = payload.coupon_code ? 200 : quoteDiscount;
        const walletUsed = payload.wallet_amount || 0;
        const total = Math.max(0, subtotal + deliveryFee - discount - walletUsed);

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              ...mockQuoteResponse,
              subtotal,
              delivery_fee: deliveryFee,
              discount,
              wallet_deduction: walletUsed,
              total,
              coupon: payload.coupon_code
                ? {
                    code: payload.coupon_code,
                    applied: true,
                    discount: 200,
                  }
                : null,
            },
          }),
        });
      });

      // 10. Order Placement and Listing endpoints
      await page.route(/.*\/api\/v1\/orders(\?.*)?$/, async (route) => {
        if (route.request().method() === 'POST') {
          lastOrderPayload = route.request().postDataJSON();
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              success: true,
              message: 'Order created successfully',
              data: {
                ...mockCreatedOrderResponse,
                payment_method: lastOrderPayload?.payment_method || 'COD',
                delivery_address_id: lastOrderPayload?.delivery_address_id,
              },
            }),
          });
        } else {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              success: true,
              data: {
                orders: [],
                total: 0,
              },
            }),
          });
        }
      });

      // 11. Wishlist and Notifications
      await page.route('**/api/v1/wishlist**', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: { items: [] } }),
        });
      });

      await page.route(/.*\/api\/v1\/notifications.*/, async (route) => {
        const url = route.request().url();
        if (url.includes('/preferences')) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ success: true, data: mockNotificationPreferences }),
          });
          return;
        }
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: { count: 0, notifications: [] } }),
        });
      });

      // 12. Support Info endpoint
      await page.route(/.*\/api\/v1\/app\/support-info.*/, async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              supportPhone: '+94 11 234 5678',
              supportEmail: 'support@sribees.com',
            },
          }),
        });
      });
    }

    await use(controller);
  },
});

export { expect } from '@playwright/test';

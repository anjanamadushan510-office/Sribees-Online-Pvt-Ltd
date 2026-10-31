import { test, expect } from '../fixtures/testFixtures';
import { CheckoutPage } from '../pages/CheckoutPage';
import { mockCreatedOrderResponse } from '../fixtures/mockData';

test.describe('Checkout - Payments, Coupons & Wallet Split Flow', () => {

  test('TC-CHK-01: [Coupon Flow] Apply and remove discount coupon in checkout', async ({
    page,
    setupAuthenticatedUser,
    mockApi,
  }) => {
    await setupAuthenticatedUser();

    const checkoutPage = new CheckoutPage(page);
    await checkoutPage.goto();
    await expect(page).toHaveURL(/.*checkoutView/, { timeout: 10000 });

    // 1. Apply coupon code
    await checkoutPage.applyCoupon('SAVE200');

    // 2. Verify coupon badge is displayed
    const couponAppliedBadge = page.locator("text='SAVE200' Applied!");
    await expect(couponAppliedBadge).toBeVisible({ timeout: 5000 });

    // 3. Remove coupon
    await checkoutPage.removeCoupon();

    // 4. Verify coupon badge is removed
    await expect(couponAppliedBadge).not.toBeVisible({ timeout: 3000 });
  });

  test('TC-CHK-02: [Wallet & Split Payment] Checkout with partial wallet and secondary COD method', async ({
    page,
    setupAuthenticatedUser,
    mockApi,
  }) => {
    await setupAuthenticatedUser();

    const checkoutPage = new CheckoutPage(page);
    await checkoutPage.goto();
    await expect(page).toHaveURL(/.*checkoutView/, { timeout: 10000 });

    // 1. Select Wallet Payment
    await checkoutPage.selectPayment('wallet');

    // 2. Set partial wallet amount (e.g. 1000 LKR while total is 2500 LKR)
    await checkoutPage.walletAmountInput.fill('1000');
    await checkoutPage.walletAmountInput.blur();

    // 3. Verify secondary split payment prompt appears
    const splitPaymentPrompt = page.locator('text=Pay remaining').first();
    await expect(splitPaymentPrompt).toBeVisible({ timeout: 5000 });

    // 4. Select secondary payment method (Cash on Delivery)
    await checkoutPage.selectSecondaryPayment('cod');

    // 5. Submit order
    await checkoutPage.placeOrder();

    // 6. Assert Order Success Modal is displayed with split payment label
    await checkoutPage.expectOrderSuccessModal({
      orderNumber: mockCreatedOrderResponse.order_number,
    });

    // Check payload passed to backend
    const placedPayload = mockApi.getPlacedOrderPayload();
    expect(placedPayload).toBeTruthy();
    expect(placedPayload.use_wallet).toBe(true);
    expect(placedPayload.wallet_amount).toBe(1000);
  });

});

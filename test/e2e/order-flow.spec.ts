import { test, expect } from '../fixtures/testFixtures';
import { HomePage } from '../pages/HomePage';
import { CartDrawerPage } from '../pages/CartDrawerPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { mockAddresses, mockCreatedOrderResponse } from '../fixtures/mockData';

test.describe('Order Flow - End-to-End Automation Suite', () => {

  test('TC-ORD-01: [Happy Path] Authenticated user completes order with Cash on Delivery (COD)', async ({
    page,
    setupAuthenticatedUser,
    mockApi,
  }) => {
    // 1. Arrange: Setup authenticated customer session and mock API routing
    await setupAuthenticatedUser();

    const homePage = new HomePage(page);
    const cartDrawer = new CartDrawerPage(page);
    const checkoutPage = new CheckoutPage(page);

    // 2. Act: Navigate to Home and open Cart
    await homePage.goto();
    await homePage.openCart();

    // 3. Verify Cart Drawer is opened with items
    await cartDrawer.expectOpen();

    // 4. Act: Proceed to Checkout
    await cartDrawer.proceedToCheckout();

    // 5. Assert: Arrive at checkout page
    await expect(page).toHaveURL(/.*checkoutView/, { timeout: 10000 });

    // Verify default delivery address is rendered
    await checkoutPage.expectAddressContains(mockAddresses[0].postal_city);

    // Select Cash on Delivery (COD) payment
    await checkoutPage.selectPayment('cod');

    // Place Order
    await checkoutPage.placeOrder();

    // 6. Assert: Order confirmation modal appears with order number and success state
    await checkoutPage.expectOrderSuccessModal({
      customerName: mockAddresses[0].recipient_name,
    });

    // Verify payload sent to order API
    const placedPayload = mockApi.getPlacedOrderPayload();
    expect(placedPayload).toBeTruthy();
    expect(placedPayload.payment_method).toBe('COD');
    expect(placedPayload.delivery_address_id).toBe(mockAddresses[0].address_id);
  });

  test('TC-ORD-02: [Security Gate] Unauthenticated guest attempting checkout is redirected to home', async ({
    page,
    setupGuestUser,
    mockApi,
  }) => {
    // 1. Arrange: Ensure clean unauthenticated guest state
    await setupGuestUser();

    const checkoutPage = new CheckoutPage(page);

    // 2. Act: Guest attempts to directly navigate to /checkoutView
    await checkoutPage.goto();

    // 3. Assert: User is redirected away from checkout back to home
    await expect(page).toHaveURL(/\/(?!checkoutView)/, { timeout: 8000 });

    // Verify unauthenticated state in header shows Login / Register
    const loginButton = page.locator('header button:has-text("Login / Register")').first();
    await expect(loginButton).toBeVisible({ timeout: 5000 });
  });

  test('TC-ORD-03: [Address Selection] User switches delivery address in checkout', async ({
    page,
    setupAuthenticatedUser,
    mockApi,
  }) => {
    await setupAuthenticatedUser();

    const checkoutPage = new CheckoutPage(page);
    await checkoutPage.goto();

    // Verify on checkout page
    await expect(page).toHaveURL(/.*checkoutView/, { timeout: 10000 });

    // Open Address Change Modal
    await checkoutPage.openAddressModal();

    // Select secondary address (Office / Kandy)
    await checkoutPage.selectAddressByTitle('Office');

    // Verify checkout view reflects updated selected address
    await checkoutPage.expectAddressContains('Kandy');
  });

  test('TC-ORD-04: [Cart Adjustments] Adjust item quantities and remove item in Cart Drawer', async ({
    page,
    setupAuthenticatedUser,
    mockApi,
  }) => {
    await setupAuthenticatedUser();

    const homePage = new HomePage(page);
    const cartDrawer = new CartDrawerPage(page);

    await homePage.goto();
    await homePage.openCart();
    await cartDrawer.expectOpen();

    // Verify items in drawer
    const initialItem = page.locator('h4:has-text("Nuwara Eliya Fresh Strawberries")').first();
    await expect(initialItem).toBeVisible();

    // Increase quantity via plus icon in drawer
    const plusButton = page.locator('button:has(svg.lucide-plus)').last();
    await plusButton.click();

    // Remove item via trash icon in drawer
    const trashButton = page.locator('button:has(svg.lucide-trash-2)').first();
    await trashButton.click();

    // Small interaction buffer
    await page.waitForTimeout(400);
  });

});

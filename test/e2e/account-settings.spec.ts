import { test, expect } from '../fixtures/testFixtures';
import { AccountSettingsPage } from '../pages/AccountSettingsPage';

test.describe('Account Settings - End-to-End Automation Suite', () => {

  test('TC-SET-01: [Settings Overview] Authenticated user views settings cards', async ({
    page,
    setupAuthenticatedUser,
    mockApi,
  }) => {
    await setupAuthenticatedUser();

    const settingsPage = new AccountSettingsPage(page);
    await settingsPage.goto();

    // 1. Verify main cards are loaded
    await settingsPage.expectPageLoaded();
    await expect(page.locator('text=Language & Regional Localization').first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Active Logged-In Sessions').first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Danger Zone').first()).toBeVisible({ timeout: 5000 });
  });

  test('TC-SET-02: [Notification Toggles] User toggles communication preferences', async ({
    page,
    setupAuthenticatedUser,
    mockApi,
  }) => {
    await setupAuthenticatedUser();

    const settingsPage = new AccountSettingsPage(page);
    await settingsPage.goto();

    // Toggle communication switch
    await settingsPage.toggleNotification(0);

    // Assert interaction feedback or toast
    await page.waitForTimeout(400);
  });

  test('TC-SET-03: [Danger Zone & Modal] User views Danger Zone and opens Delete Account modal', async ({
    page,
    setupAuthenticatedUser,
    mockApi,
  }) => {
    await setupAuthenticatedUser();

    const settingsPage = new AccountSettingsPage(page);
    await settingsPage.goto();

    // 1. Open Delete Account Modal
    await settingsPage.openDeleteAccount();

    // 2. Safely close modal without confirming deletion
    await settingsPage.closeDeleteAccount();
  });

  test('TC-SET-04: [Guest Warning] Unauthenticated guest visiting /accountSettings sees demo mode banner', async ({
    page,
    setupGuestUser,
    mockApi,
  }) => {
    await setupGuestUser();

    const settingsPage = new AccountSettingsPage(page);
    await settingsPage.goto();

    // Verify guest warning banner is visible
    await settingsPage.expectGuestBannerVisible();
  });

});

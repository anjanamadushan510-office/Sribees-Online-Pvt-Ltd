import { test, expect } from '../fixtures/testFixtures';
import { MyAccountPage } from '../pages/MyAccountPage';
import { mockUser, mockAddresses } from '../fixtures/mockData';

test.describe('My Account - End-to-End Automation Suite', () => {

  test('TC-ACC-01: [Profile & Tab Navigation] Authenticated customer views profile and switches tabs', async ({
    page,
    setupAuthenticatedUser,
    mockApi,
  }) => {
    await setupAuthenticatedUser();

    const myAccountPage = new MyAccountPage(page);
    await myAccountPage.goto();

    // 1. Verify Profile information is displayed
    await myAccountPage.expectProfileName(mockUser.fullName);

    // 2. Switch to Saved Addresses Tab
    await myAccountPage.switchTab('saved_addresses');
    await myAccountPage.expectAddressVisible(mockAddresses[0].postal_city);

    // 3. Switch to Cashback History Tab
    await myAccountPage.switchTab('wallet');
    const walletBalanceElement = page.locator('text=Available Cash Back').or(page.locator('text=3,000')).first();
    await expect(walletBalanceElement).toBeVisible({ timeout: 5000 });

    // 4. Switch back to Personal Info Tab
    await myAccountPage.switchTab('personal_info');
    await expect(page.locator(`text=${mockUser.fullName}`).first()).toBeVisible();
  });

  test('TC-ACC-02: [Edit Profile] Customer updates display name via Edit Profile Modal', async ({
    page,
    setupAuthenticatedUser,
    mockApi,
  }) => {
    await setupAuthenticatedUser();

    const myAccountPage = new MyAccountPage(page);
    await myAccountPage.goto();

    // 1. Open Edit Profile Modal
    await myAccountPage.openEditProfile();

    // 2. Update display name
    await myAccountPage.updateDisplayName('Tharushi Perera Updated');

    // 3. Verify modal closes
    await expect(myAccountPage.editProfileModal).not.toBeVisible({ timeout: 5000 });
  });

  test('TC-ACC-03: [Address Listing] Customer views saved delivery addresses', async ({
    page,
    setupAuthenticatedUser,
    mockApi,
  }) => {
    await setupAuthenticatedUser();

    const myAccountPage = new MyAccountPage(page);
    await myAccountPage.goto();

    // Switch to Saved Addresses tab
    await myAccountPage.switchTab('saved_addresses');

    // Verify both mock addresses are listed
    await expect(page.locator(`text=${mockAddresses[0].title}`).first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator(`text=${mockAddresses[1].title}`).first()).toBeVisible({ timeout: 5000 });
  });

  test('TC-ACC-04: [Guest Warning] Unauthenticated guest visiting /myAccount sees warning banner', async ({
    page,
    setupGuestUser,
    mockApi,
  }) => {
    await setupGuestUser();

    const myAccountPage = new MyAccountPage(page);
    await myAccountPage.goto();

    // Verify unauthenticated guest warning banner is visible
    await myAccountPage.expectGuestBannerVisible();
  });

});

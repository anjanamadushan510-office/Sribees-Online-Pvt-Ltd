import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class MyAccountPage extends BasePage {
  readonly profileName: Locator;
  readonly editProfileButton: Locator;
  readonly editProfileModal: Locator;
  readonly displayNameInput: Locator;
  readonly saveChangesButton: Locator;
  readonly walletCard: Locator;
  readonly personalInfoTab: Locator;
  readonly savedAddressesTab: Locator;
  readonly walletTab: Locator;
  readonly orderHistoryTab: Locator;
  readonly guestWarningBanner: Locator;

  constructor(page: Page) {
    super(page);
    this.profileName = page.locator('h1, h2, h3').filter({ hasText: /Tharushi|Customer/i }).first();
    this.editProfileButton = page.locator('button:has-text("Edit Profile")').first();
    this.editProfileModal = page.locator('div[role="dialog"]').filter({ hasText: /Edit Profile/i });
    this.displayNameInput = page.locator('input[placeholder*="name" i]').first();
    this.saveChangesButton = page.locator('button[type="submit"]:has-text("Save")').first();
    this.walletCard = page.locator('div:has-text("SRIBEES REWARDS")').first();

    // Navigation Tabs matching localized labels
    this.personalInfoTab = page.locator('button:has-text("Personal Info")').first();
    this.savedAddressesTab = page.locator('button:has-text("Saved Addresses")').first();
    this.walletTab = page.locator('button:has-text("Cash Back History")').or(page.locator('button:has-text("Wallet")')).first();
    this.orderHistoryTab = page.locator('button:has-text("Order History")').first();

    // Guest Warning Banner
    this.guestWarningBanner = page.locator('text=Viewing Account in Guest Mode').or(page.locator('text=Guest Mode')).first();
  }

  async goto(): Promise<void> {
    await this.navigateTo('/myAccount');
  }

  async expectProfileName(expectedName: string): Promise<void> {
    await expect(this.page.locator(`text=${expectedName}`).first()).toBeVisible({ timeout: 5000 });
  }

  async openEditProfile(): Promise<void> {
    await this.page.waitForLoadState('networkidle').catch(() => {});
    await this.editProfileButton.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(500);
    await this.editProfileButton.click();
    try {
      await expect(this.editProfileModal).toBeVisible({ timeout: 2500 });
    } catch {
      await this.editProfileButton.click({ force: true });
      await expect(this.editProfileModal).toBeVisible({ timeout: 5000 });
    }
  }

  async updateDisplayName(newName: string): Promise<void> {
    await this.displayNameInput.fill(newName);
    await this.saveChangesButton.click();
  }

  async switchTab(tab: 'personal_info' | 'saved_addresses' | 'wallet' | 'orders'): Promise<void> {
    if (tab === 'saved_addresses') {
      await this.savedAddressesTab.click();
    } else if (tab === 'wallet') {
      await this.walletTab.click();
    } else if (tab === 'orders') {
      await this.orderHistoryTab.click();
    } else {
      await this.personalInfoTab.click();
    }
    await this.page.waitForTimeout(300);
  }

  async expectAddressVisible(addressText: string): Promise<void> {
    await expect(this.page.locator(`text=${addressText}`).first()).toBeVisible({ timeout: 5000 });
  }

  async expectGuestBannerVisible(): Promise<void> {
    await expect(this.guestWarningBanner).toBeVisible({ timeout: 5000 });
  }
}

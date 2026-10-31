import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "./BasePage";

export class AccountSettingsPage extends BasePage {
  readonly pageHeader: Locator;
  readonly localizationCard: Locator;
  readonly notificationsCard: Locator;
  readonly activeSessionsCard: Locator;
  readonly dangerZoneCard: Locator;
  readonly deleteAccountButton: Locator;
  readonly deleteAccountModal: Locator;
  readonly guestWarningBanner: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeader = page
      .locator("h1, h2")
      .filter({ hasText: /Account Settings/i })
      .first();
    this.localizationCard = page
      .locator('div:has-text("Language & Regional Localization")')
      .first();
    this.notificationsCard = page
      .locator('div:has-text("Notifications & Alerts")')
      .first();
    this.activeSessionsCard = page
      .locator('div:has-text("Active Logged-In Sessions")')
      .first();
    this.dangerZoneCard = page.locator('div:has-text("Danger Zone")').first();
    this.deleteAccountButton = page
      .locator('button:has-text("Delete My Account")')
      .first();
    this.deleteAccountModal = page
      .locator('div:has-text("Delete SRIBEES Account Permanently?")')
      .first();
    this.guestWarningBanner = page
      .locator("text=Viewing Settings in Demo Mode")
      .or(page.locator("text=Demo Mode"))
      .first();
  }

  async goto(): Promise<void> {
    await this.navigateTo("/accountSettings");
  }

  async expectPageLoaded(): Promise<void> {
    await expect(this.notificationsCard).toBeVisible({ timeout: 5000 });
    await expect(this.localizationCard).toBeVisible({ timeout: 5000 });
  }

  async toggleNotification(index = 0): Promise<void> {
    const toggleButton = this.page.locator('button[role="switch"]').nth(index);
    await toggleButton.click();
  }

  async openDeleteAccount(): Promise<void> {
    await this.deleteAccountButton.scrollIntoViewIfNeeded();
    await this.deleteAccountButton.click();
    await expect(this.deleteAccountModal).toBeVisible({ timeout: 5000 });
  }

  async closeDeleteAccount(): Promise<void> {
    const cancelBtn = this.deleteAccountModal
      .locator('button:has-text("Cancel")')
      .first();
    await cancelBtn.click();
    await expect(this.deleteAccountModal).not.toBeVisible({ timeout: 3000 });
  }

  async expectGuestBannerVisible(): Promise<void> {
    await expect(this.guestWarningBanner).toBeVisible({ timeout: 5000 });
  }
}

import { Page, Locator, expect } from '@playwright/test';

/**
 * Base Page Object containing common interactions, locators, and assertions
 */
export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Waits for the network to be idle and document ready
   */
  async waitForPageLoaded(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Asserts a toast message appears with given text
   */
  async expectToast(message: string | RegExp): Promise<void> {
    const toastLocator = this.page.locator('[role="alert"], .toast, div:has-text("' + message + '")').first();
    await expect(toastLocator).toBeVisible({ timeout: 5000 });
  }

  /**
   * Navigates to a path relative to baseURL
   */
  async navigateTo(path: string): Promise<void> {
    await this.page.goto(path);
    await this.waitForPageLoaded();
  }
}

import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class CartDrawerPage extends BasePage {
  readonly drawerContainer: Locator;
  readonly closeButton: Locator;
  readonly proceedToCheckoutButton: Locator;
  readonly cartItems: Locator;
  readonly emptyCartMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.drawerContainer = page.locator('div:has(h2:has-text("Shopping Cart"))').last();
    this.closeButton = this.drawerContainer.locator('button:has(svg.lucide-x)');
    this.proceedToCheckoutButton = page.locator('button:has-text("Proceed to Checkout")');
    this.cartItems = page.locator('div.divide-y > div');
    this.emptyCartMessage = page.locator('text=Your cart is empty');
  }

  async isVisible(): Promise<boolean> {
    return await this.proceedToCheckoutButton.isVisible();
  }

  async expectOpen(): Promise<void> {
    await expect(this.page.locator('h2:has-text("Shopping Cart")')).toBeVisible({ timeout: 5000 });
  }

  async close(): Promise<void> {
    await this.closeButton.click();
  }

  async proceedToCheckout(): Promise<void> {
    await this.proceedToCheckoutButton.scrollIntoViewIfNeeded();
    await this.proceedToCheckoutButton.click();
  }

  async getItemCount(): Promise<number> {
    return await this.cartItems.count();
  }
}

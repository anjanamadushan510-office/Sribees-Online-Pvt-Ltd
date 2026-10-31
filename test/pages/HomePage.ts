import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  readonly navbarCartButton: Locator;
  readonly productCards: Locator;

  constructor(page: Page) {
    super(page);
    // Navbar cart button containing the shopping bag icon & total count
    this.navbarCartButton = page.locator('header button:has(svg.lucide-shopping-bag)');
    this.productCards = page.locator('div[class*="group relative bg-white rounded-2xl"]');
  }

  async goto(): Promise<void> {
    await this.navigateTo('/shop');
  }

  async openCart(): Promise<void> {
    await this.navbarCartButton.click();
  }

  async addFirstProductToCart(): Promise<void> {
    // Find the first product card's Add to Cart button
    const firstAddButton = this.page.locator('button:has(svg.lucide-plus)').first();
    await firstAddButton.scrollIntoViewIfNeeded();
    await firstAddButton.click();
  }

  async getCartCountText(): Promise<string> {
    return (await this.navbarCartButton.textContent()) || '';
  }
}

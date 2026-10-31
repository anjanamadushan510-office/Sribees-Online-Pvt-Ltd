import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class CheckoutPage extends BasePage {
  readonly addressCard: Locator;
  readonly changeAddressButton: Locator;
  readonly cartItems: Locator;
  readonly couponInput: Locator;
  readonly applyCouponButton: Locator;
  readonly removeCouponButton: Locator;
  readonly placeOrderButton: Locator;
  readonly codPaymentRadio: Locator;
  readonly cardPaymentRadio: Locator;
  readonly walletPaymentRadio: Locator;
  readonly applyMaxWalletButton: Locator;
  readonly walletAmountInput: Locator;
  readonly orderSuccessModal: Locator;

  constructor(page: Page) {
    super(page);
    this.addressCard = page.locator('div:has-text("Delivery Address")').first();
    this.changeAddressButton = page.locator('button:has-text("Change")').first();
    this.cartItems = page.locator('div[class*="CartItemCard"], div.space-y-4 > div.bg-white.rounded-3xl');
    this.couponInput = page.locator('input[placeholder*="code" i], input[placeholder*="coupon" i], form input[type="text"]').first();
    this.applyCouponButton = page.locator('button[type="submit"]:has-text("Apply")');
    this.removeCouponButton = page.locator('button:has-text("Remove")');
    this.placeOrderButton = page.locator('button:has(svg.lucide-lock)');
    this.codPaymentRadio = page.locator('input[name="payment"][type="radio"]').nth(1);
    this.cardPaymentRadio = page.locator('div:has-text("Credit / Debit Card") input[type="radio"]').first();
    this.walletPaymentRadio = page.locator('div:has-text("Wallet") input[type="radio"]').first();
    this.applyMaxWalletButton = page.locator('button:has-text("Apply Max")');
    this.walletAmountInput = page.locator('input[inputmode="decimal"]');
    this.orderSuccessModal = page.locator('h1:has-text("Order Placed Successfully!")');
  }

  async goto(): Promise<void> {
    await this.navigateTo('/checkoutView');
  }

  async expectAddressContains(text: string): Promise<void> {
    await expect(this.page.locator(`text=${text}`).first()).toBeVisible({ timeout: 5000 });
  }

  async openAddressModal(): Promise<void> {
    await this.changeAddressButton.click();
    await expect(this.page.locator('h3:has-text("Select Delivery Address")')).toBeVisible({ timeout: 5000 });
  }

  async selectAddressByTitle(title: string): Promise<void> {
    const dialog = this.page.locator('div[role="dialog"]').last();
    const addressOption = dialog.locator(`text=${title}`).first();
    await addressOption.click();
    await this.page.waitForTimeout(300);
  }

  async applyCoupon(code: string): Promise<void> {
    await this.couponInput.fill(code);
    await this.applyCouponButton.click();
  }

  async removeCoupon(): Promise<void> {
    await this.removeCouponButton.click();
  }

  async selectPayment(method: 'cod' | 'card' | 'wallet'): Promise<void> {
    if (method === 'cod') {
      await this.page.locator('text="Cash on Delivery (COD)"').first().click();
    } else if (method === 'card') {
      await this.page.locator('text="Credit / Debit Card"').first().click();
    } else if (method === 'wallet') {
      await this.page.locator('text="SRIBEES Wallet"').first().click();
    }
  }

  async selectSecondaryPayment(method: 'cod' | 'card'): Promise<void> {
    if (method === 'cod') {
      const secondaryCod = this.page.locator('div:has-text("Pay when delivered")').last();
      await secondaryCod.click();
    } else {
      const secondaryCard = this.page.locator('div:has-text("Visa, Mastercard, LankaQR")').last();
      await secondaryCard.click();
    }
  }

  async clickApplyMaxWallet(): Promise<void> {
    await this.applyMaxWalletButton.click();
  }

  async placeOrder(): Promise<void> {
    await this.placeOrderButton.scrollIntoViewIfNeeded();
    await this.placeOrderButton.click();
  }

  async expectOrderSuccessModal(expected?: {
    orderNumber?: string;
    customerName?: string;
    totalAmountText?: string;
  }): Promise<void> {
    await expect(this.orderSuccessModal).toBeVisible({ timeout: 10000 });

    if (expected?.customerName) {
      await expect(this.page.locator(`text=${expected.customerName}`).first()).toBeVisible({ timeout: 5000 });
    }
  }

  async closeSuccessModal(): Promise<void> {
    const closeBtn = this.page.locator('button:has-text("Close")').first();
    await closeBtn.click();
  }
}

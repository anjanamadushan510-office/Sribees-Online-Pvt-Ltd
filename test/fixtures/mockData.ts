/**
 * Mock Data Fixtures for SRIBEES Online E2E Automation
 * Provides realistic responses matching the API contracts defined in WEB_STOREFRONT_API.md
 */

export const mockUser = {
  id: "usr_qa_test_001",
  email: "qa.tester@sribees.com",
  fullName: "Tharushi Perera",
  phone: "0771234567",
  alternatePhone: "0719876543",
  role: "customer",
  profilePictureUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
};

export const mockTokens = {
  accessToken: "mock_jwt_access_token_qa_tester_secure_payload",
  refreshToken: "mock_jwt_refresh_token_qa_tester",
};

export const mockAddresses = [
  {
    address_id: "addr_colombo_001",
    title: "Home",
    recipient_name: "Tharushi Perera",
    phone: "0771234567",
    address_line1: "42/3 Alfred House Gardens",
    address_line2: "Apt 4B",
    province: "Western Province",
    district: "Colombo",
    postal_city: "Colombo 03",
    postal_code: "00300",
    is_default: true,
    is_serviceable: true,
    delivery_available: true,
  },
  {
    address_id: "addr_kandy_002",
    title: "Office",
    recipient_name: "Tharushi Perera",
    phone: "0771234567",
    address_line1: "15 Temple Road",
    address_line2: null,
    province: "Central Province",
    district: "Kandy",
    postal_city: "Kandy",
    postal_code: "20000",
    is_default: false,
    is_serviceable: true,
    delivery_available: true,
  },
];

export const mockProducts = [
  {
    id: "prod_strawberries_001",
    product_id: "prod_strawberries_001",
    title: "Nuwara Eliya Fresh Strawberries",
    name: "Nuwara Eliya Fresh Strawberries",
    slug: "nuwara-eliya-fresh-strawberries",
    price: 850,
    compare_at_price: 950,
    originalPrice: 950,
    unit: "250g pack",
    sku: "FRU-STR-250",
    image: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=600&q=80",
    images: [{ image_url: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=600&q=80" }],
    in_stock: true,
    category_id: "cat_fruits",
    cashback_percentage: 5,
  },
  {
    id: "prod_milk_002",
    product_id: "prod_milk_002",
    title: "Highland Fresh Full Cream Milk",
    name: "Highland Fresh Full Cream Milk",
    slug: "highland-fresh-full-cream-milk",
    price: 450,
    compare_at_price: 500,
    originalPrice: 500,
    unit: "1L carton",
    sku: "DAI-MLK-1L",
    image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80",
    images: [{ image_url: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80" }],
    in_stock: true,
    category_id: "cat_dairy",
    cashback_percentage: 3,
  },
];

export const mockInitialCart = {
  items: [
    {
      product_id: "prod_strawberries_001",
      quantity: 2,
      price: 850,
      name: "Nuwara Eliya Fresh Strawberries",
      image: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=600&q=80",
      sku: "FRU-STR-250",
      original_price: 950,
      cashback_percentage: 5,
    },
    {
      product_id: "prod_milk_002",
      quantity: 1,
      price: 450,
      name: "Highland Fresh Full Cream Milk",
      image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80",
      sku: "DAI-MLK-1L",
      original_price: 500,
      cashback_percentage: 3,
    },
  ],
  totals: {
    subtotal: 2150, // 850*2 + 450*1
    discount: 0,
    tax: 0,
    shipping: 350,
    cashback_earned: 98.5,
    total: 2500,
  },
  coupon: null,
  delivery: {
    status: "quoted",
    available: true,
    fee: 350,
    message: null,
    address_id: "addr_colombo_001",
    postal_city: "Colombo 03",
  },
  updated_at: Date.now(),
};

export const mockPaymentMethods = {
  methods: [
    {
      code: "COD",
      name: "Cash on Delivery",
      description: "Pay with cash when your items arrive",
      icon: "cash",
      kind: "offline",
    },
    {
      code: "MARX_OTHER",
      name: "Credit / Debit Card",
      description: "Pay securely via Visa, Mastercard, or LankaQR",
      icon: "card",
      kind: "online",
    },
    {
      code: "WALLET",
      name: "SRIBEES Wallet",
      description: "Pay using available store cash balance",
      icon: "wallet",
      kind: "wallet",
    },
  ],
};

export const mockWallet = {
  balance: 3000,
  currency: "LKR",
  cashback_rate: 2,
  pending_cashback: 120,
  points: 450,
  tier: {
    tier_id: "tier_gold",
    name: "Gold Member",
    color: "#EAB308",
  },
};

export const mockQuoteResponse = {
  subtotal: 2150,
  delivery_fee: 350,
  discount: 0,
  tax: 0,
  wallet_deduction: 0,
  cashback_earned: 98.5,
  total: 2500,
  currency: "LKR",
  delivery_status: "quoted",
  delivery_available: true,
  delivery_message: null,
  coupon: null,
};

export const mockCreatedOrderResponse = {
  order_id: "ord_qa_test_98421",
  order_number: "SRB-98421",
  status: "pending",
  status_label: "Order Placed",
  payment_status: "unpaid",
  payment_method: "COD",
  subtotal: 2150,
  shipping_amount: 350,
  delivery_fee: 350,
  discount_amount: 0,
  wallet_deduction: 0,
  cashback_earned: 98.5,
  total_amount: 2500,
  item_count: 3,
  created_at: new Date().toISOString(),
  delivery_address: {
    address_id: "addr_colombo_001",
    recipient_name: "Tharushi Perera",
    phone: "0771234567",
    address_line1: "42/3 Alfred House Gardens",
    address_line2: "Apt 4B",
    postal_city: "Colombo 03",
    district: "Colombo",
    province: "Western Province",
  },
  items: [
    {
      product_id: "prod_strawberries_001",
      product_name: "Nuwara Eliya Fresh Strawberries",
      quantity: 2,
      unit_price: 850,
      subtotal: 1700,
    },
    {
      product_id: "prod_milk_002",
      product_name: "Highland Fresh Full Cream Milk",
      quantity: 1,
      unit_price: 450,
      subtotal: 450,
    },
  ],
};

export const mockSessions = [
  {
    sessionId: "sess_curr_01",
    deviceName: "Chrome on Windows",
    ipAddress: "192.168.1.100",
    isCurrent: true,
    lastActive: new Date().toISOString(),
  },
  {
    sessionId: "sess_mobile_02",
    deviceName: "iPhone 15 Pro",
    ipAddress: "112.134.55.20",
    isCurrent: false,
    lastActive: new Date(Date.now() - 3600000).toISOString(),
  },
];

export const mockNotificationPreferences = {
  offers: true,
  promotions: true,
  general: true,
};


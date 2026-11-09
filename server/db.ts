import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  category: string;
  category_id: number;
  price: number;
  original_price: number;
  discount: number;
  image: string;
  stock_quantity: number;
  status: 'active' | 'inactive';
  sku: string;
  sizes: string[];
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string;
  product_count: number;
  status: 'active' | 'inactive';
}

export interface OrderItem {
  product_id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  size: string;
}

export interface Order {
  id: string;
  customer_id: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  items: OrderItem[];
  subtotal: number;
  discount: number;
  coupon_code: string | null;
  shipping_fee: number;
  tax: number;
  total: number;
  payment_method: string;
  payment_status: 'Paid' | 'Pending' | 'Refunded';
  status: 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  tracking_number: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  total_orders: number;
  total_spending: number;
  created_at: string;
  avatar?: string;
}

export interface Coupon {
  id: number;
  code: string;
  discount_percentage: number;
  min_order_amount: number;
  expiry_date: string;
  usage_count: number;
  max_usage: number;
  status: 'active' | 'inactive';
}

export interface InventoryLog {
  id: number;
  product_id: number;
  product_name: string;
  previous_stock: number;
  change: number;
  new_stock: number;
  reason: 'Restock' | 'Order Placed' | 'Order Cancelled' | 'Manual Adjustment';
  timestamp: string;
}

export interface StoreSettings {
  store_name: string;
  logo_text: string;
  tagline: string;
  email: string;
  phone: string;
  address: string;
  currency: string;
  tax_rate: number;
  shipping_fee: number;
  free_shipping_threshold: number;
  social_links: {
    instagram: string;
    facebook: string;
    twitter: string;
    pinterest: string;
  };
}

export interface DatabaseSchema {
  admin: {
    id: number;
    name: string;
    email: string;
    password_hash: string;
    role: string;
    avatar: string;
    created_at: string;
  };
  products: Product[];
  categories: Category[];
  orders: Order[];
  customers: Customer[];
  coupons: Coupon[];
  inventory_logs: InventoryLog[];
  settings: StoreSettings;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'rns_database.json');

// Initial seed data with our generated fashion assets
const getInitialSeedData = (): DatabaseSchema => {
  const adminEmail = (process.env.ADMIN_EMAIL || 'saniyadangre80@gmail.com').toLowerCase().trim();
  const initialPassword = process.env.ADMIN_INITIAL_PASSWORD || 'RnsShopSecure#2026';
  const bcryptHash = bcrypt.hashSync(initialPassword, 10);

  return {
    admin: {
      id: 1,
      name: "Saniya Dangre",
      email: adminEmail,
      password_hash: bcryptHash,
      role: "Super Admin",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      created_at: "2026-01-01T00:00:00.000Z"
    },
    settings: {
      store_name: "RNS SHOP",
      logo_text: "RNS SHOP",
      tagline: "Contemporary Everyday Fashion & Premium Streetwear",
      email: "contact@rnsshop.com",
      phone: "+1 (800) 555-7677",
      address: "108 Fashion Avenue, Design District, New York, NY 10018",
      currency: "$",
      tax_rate: 8.5,
      shipping_fee: 9.99,
      free_shipping_threshold: 120,
      social_links: {
        instagram: "https://instagram.com/rnsshop_official",
        facebook: "https://facebook.com/rnsshop",
        twitter: "https://x.com/rnsshop",
        pinterest: "https://pinterest.com/rnsshop"
      }
    },
    categories: [
      {
        id: 1,
        name: "Denim & Outerwear",
        slug: "denim-outerwear",
        description: "Classic denim jackets, trucker coats, and rugged outerwear essentials.",
        image: "/src/assets/images/rns_denim_jacket_1794128109654.jpg",
        product_count: 4,
        status: "active"
      },
      {
        id: 2,
        name: "Hoodies & Sweatshirts",
        slug: "hoodies-sweatshirts",
        description: "Heavyweight French terry hoodies and relaxed drop-shoulder sweatshirts.",
        image: "/src/assets/images/rns_oversized_hoodie_1794128108141.jpg",
        product_count: 3,
        status: "active"
      },
      {
        id: 3,
        name: "Tops & Silk Blouses",
        slug: "tops-blouses",
        description: "Tailored silk blouses, refined button-downs, and effortless day tops.",
        image: "/src/assets/images/rns_silk_blouse_1794128111363.jpg",
        product_count: 3,
        status: "active"
      },
      {
        id: 4,
        name: "Trousers & Bottoms",
        slug: "trousers-bottoms",
        description: "Pleated linen trousers, tailored wide-leg pants, and relaxed chinos.",
        image: "/src/assets/images/rns_linen_trousers_1794128110487.jpg",
        product_count: 4,
        status: "active"
      },
      {
        id: 5,
        name: "Accessories & Leather",
        slug: "accessories",
        description: "Minimalist leather belts, tote bags, and everyday wardrobe accents.",
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80",
        product_count: 2,
        status: "active"
      }
    ],
    products: [
      {
        id: 1,
        name: "Vintage Distressed Indigo Denim Jacket",
        slug: "vintage-distressed-indigo-denim-jacket",
        description: "Crafted from 100% heavyweight 14oz Japanese selvedge denim with authentic artisanal hand-distressing, dual button-flap chest pockets, and custom antique brass hardware.",
        category: "Denim & Outerwear",
        category_id: 1,
        price: 139.99,
        original_price: 189.99,
        discount: 26,
        image: "/src/assets/images/rns_denim_jacket_1794128109654.jpg",
        stock_quantity: 42,
        status: "active",
        sku: "RNS-DNM-001",
        sizes: ["S", "M", "L", "XL"],
        created_at: "2026-02-10T10:15:00.000Z",
        updated_at: "2026-03-01T14:20:00.000Z"
      },
      {
        id: 2,
        name: "Oversized Charcoal Streetwear Hoodie",
        slug: "oversized-charcoal-streetwear-hoodie",
        description: "Ultra-heavy 480 GSM organic cotton fleece with a structured boxy silhouette, double-layered hood, kangaroo pocket, and brushed interior for luxurious comfort.",
        category: "Hoodies & Sweatshirts",
        category_id: 2,
        price: 94.50,
        original_price: 120.00,
        discount: 21,
        image: "/src/assets/images/rns_oversized_hoodie_1794128108141.jpg",
        stock_quantity: 6, // Low stock on purpose
        status: "active",
        sku: "RNS-HOD-002",
        sizes: ["M", "L", "XL", "XXL"],
        created_at: "2026-02-12T11:00:00.000Z",
        updated_at: "2026-03-02T09:10:00.000Z"
      },
      {
        id: 3,
        name: "Ivory Tailored Silk Button-Down Blouse",
        slug: "ivory-tailored-silk-blouse",
        description: "100% Mulberry silk crepe de chine with a clean concealed placket, mother-of-pearl buttons, and structured cuffs. The perfect transition piece from day to evening.",
        category: "Tops & Silk Blouses",
        category_id: 3,
        price: 145.00,
        original_price: 195.00,
        discount: 25,
        image: "/src/assets/images/rns_silk_blouse_1794128111363.jpg",
        stock_quantity: 18,
        status: "active",
        sku: "RNS-TOP-003",
        sizes: ["XS", "S", "M", "L"],
        created_at: "2026-02-14T08:30:00.000Z",
        updated_at: "2026-03-03T16:45:00.000Z"
      },
      {
        id: 4,
        name: "Relaxed Pleated Sand Linen Trousers",
        slug: "relaxed-pleated-sand-linen-trousers",
        description: "Tailored from breathable European flax linen with deep front double pleats, an extended waistband tab, side adjusters, and a relaxed wide-leg drape.",
        category: "Trousers & Bottoms",
        category_id: 4,
        price: 118.00,
        original_price: 150.00,
        discount: 21,
        image: "/src/assets/images/rns_linen_trousers_1794128110487.jpg",
        stock_quantity: 24,
        status: "active",
        sku: "RNS-TRS-004",
        sizes: ["30", "32", "34", "36"],
        created_at: "2026-02-15T13:20:00.000Z",
        updated_at: "2026-03-04T12:00:00.000Z"
      },
      {
        id: 5,
        name: "Midnight Wool Blend Overcoat",
        slug: "midnight-wool-blend-overcoat",
        description: "Double-breasted tailored longline coat in heavyweight recycled wool blend with peaked lapels, satin cupro lining, and deep welt pockets.",
        category: "Denim & Outerwear",
        category_id: 1,
        price: 249.00,
        original_price: 320.00,
        discount: 22,
        image: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=600&auto=format&fit=crop&q=80",
        stock_quantity: 4, // Low stock on purpose
        status: "active",
        sku: "RNS-COT-005",
        sizes: ["S", "M", "L", "XL"],
        created_at: "2026-02-18T15:00:00.000Z",
        updated_at: "2026-03-05T11:30:00.000Z"
      },
      {
        id: 6,
        name: "Minimalist Ribbed Merino Knit Sweater",
        slug: "minimalist-ribbed-merino-knit-sweater",
        description: "Extra-fine Australian merino wool with 7-gauge micro-ribbing, seamless construction, and refined crew neckline.",
        category: "Hoodies & Sweatshirts",
        category_id: 2,
        price: 110.00,
        original_price: 140.00,
        discount: 21,
        image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&auto=format&fit=crop&q=80",
        stock_quantity: 0, // Out of stock on purpose
        status: "active",
        sku: "RNS-KNT-006",
        sizes: ["S", "M", "L"],
        created_at: "2026-02-20T09:00:00.000Z",
        updated_at: "2026-03-06T18:00:00.000Z"
      },
      {
        id: 7,
        name: "Structured Cotton Poplin Work Shirt",
        slug: "structured-cotton-poplin-work-shirt",
        description: "Crisp 120-thread count Italian poplin featuring a relaxed camp collar, chest utility pocket, and clean mother-of-pearl buttons.",
        category: "Tops & Silk Blouses",
        category_id: 3,
        price: 88.00,
        original_price: 110.00,
        discount: 20,
        image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop&q=80",
        stock_quantity: 35,
        status: "active",
        sku: "RNS-TOP-007",
        sizes: ["S", "M", "L", "XL"],
        created_at: "2026-02-22T14:10:00.000Z",
        updated_at: "2026-03-07T10:00:00.000Z"
      },
      {
        id: 8,
        name: "Italian Full-Grain Leather Minimalist Belt",
        slug: "italian-full-grain-leather-belt",
        description: "Handcrafted 30mm full-grain vegetable-tanned Tuscan leather belt with a brushed nickel buckle and bevelled hand-painted edges.",
        category: "Accessories & Leather",
        category_id: 5,
        price: 65.00,
        original_price: 85.00,
        discount: 23,
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80",
        stock_quantity: 50,
        status: "active",
        sku: "RNS-ACC-008",
        sizes: ["30-32", "34-36", "38-40"],
        created_at: "2026-02-25T11:45:00.000Z",
        updated_at: "2026-03-07T12:00:00.000Z"
      }
    ],
    customers: [
      {
        id: 1,
        name: "Aarav Patel",
        email: "aarav.patel@example.com",
        phone: "+1 (212) 555-0192",
        address: "742 Evergreen Terrace, Apt 4B",
        city: "New York",
        state: "NY",
        zip: "10001",
        total_orders: 4,
        total_spending: 689.48,
        created_at: "2026-01-15T09:20:00.000Z"
      },
      {
        id: 2,
        name: "Sophia Martinez",
        email: "sophia.m@example.com",
        phone: "+1 (415) 555-0143",
        address: "1280 Mission Street, Suite 300",
        city: "San Francisco",
        state: "CA",
        zip: "94103",
        total_orders: 3,
        total_spending: 498.50,
        created_at: "2026-01-20T14:15:00.000Z"
      },
      {
        id: 3,
        name: "Marcus Vance",
        email: "marcus.v@example.com",
        phone: "+1 (312) 555-0188",
        address: "450 North Michigan Ave",
        city: "Chicago",
        state: "IL",
        zip: "60611",
        total_orders: 5,
        total_spending: 924.00,
        created_at: "2026-01-28T16:40:00.000Z"
      },
      {
        id: 4,
        name: "Elena Rostova",
        email: "elena.rostova@example.com",
        phone: "+1 (206) 555-0177",
        address: "88 Pine Street",
        city: "Seattle",
        state: "WA",
        zip: "98101",
        total_orders: 2,
        total_spending: 263.00,
        created_at: "2026-02-05T11:00:00.000Z"
      },
      {
        id: 5,
        name: "Liam O'Connor",
        email: "liam.oc@example.com",
        phone: "+1 (617) 555-0199",
        address: "210 Newbury Street",
        city: "Boston",
        state: "MA",
        zip: "02116",
        total_orders: 1,
        total_spending: 145.00,
        created_at: "2026-02-18T13:30:00.000Z"
      }
    ],
    orders: [
      {
        id: "ORD-9421",
        customer_id: 1,
        customer_name: "Aarav Patel",
        customer_email: "aarav.patel@example.com",
        customer_phone: "+1 (212) 555-0192",
        shipping_address: {
          street: "742 Evergreen Terrace, Apt 4B",
          city: "New York",
          state: "NY",
          zip: "10001",
          country: "United States"
        },
        items: [
          {
            product_id: 1,
            name: "Vintage Distressed Indigo Denim Jacket",
            price: 139.99,
            quantity: 1,
            image: "/src/assets/images/rns_denim_jacket_1794128109654.jpg",
            size: "L"
          },
          {
            product_id: 4,
            name: "Relaxed Pleated Sand Linen Trousers",
            price: 118.00,
            quantity: 1,
            image: "/src/assets/images/rns_linen_trousers_1794128110487.jpg",
            size: "32"
          }
        ],
        subtotal: 257.99,
        discount: 25.80,
        coupon_code: "RNS10",
        shipping_fee: 0,
        tax: 19.74,
        total: 251.93,
        payment_method: "Credit Card (Visa •••• 4242)",
        payment_status: "Paid",
        status: "Delivered",
        tracking_number: "FEDEX-9481029410",
        notes: "Leave at front desk with doorman.",
        created_at: "2026-02-28T14:30:00.000Z",
        updated_at: "2026-03-03T18:00:00.000Z"
      },
      {
        id: "ORD-9422",
        customer_id: 3,
        customer_name: "Marcus Vance",
        customer_email: "marcus.v@example.com",
        customer_phone: "+1 (312) 555-0188",
        shipping_address: {
          street: "450 North Michigan Ave",
          city: "Chicago",
          state: "IL",
          zip: "60611",
          country: "United States"
        },
        items: [
          {
            product_id: 2,
            name: "Oversized Charcoal Streetwear Hoodie",
            price: 94.50,
            quantity: 2,
            image: "/src/assets/images/rns_oversized_hoodie_1794128108141.jpg",
            size: "XL"
          }
        ],
        subtotal: 189.00,
        discount: 37.80,
        coupon_code: "RNS20",
        shipping_fee: 9.99,
        tax: 13.70,
        total: 174.89,
        payment_method: "PayPal (marcus.v@example.com)",
        payment_status: "Paid",
        status: "Shipped",
        tracking_number: "UPS-1Z9999999999999999",
        notes: "Fragile packaging requested.",
        created_at: "2026-03-04T10:15:00.000Z",
        updated_at: "2026-03-05T12:00:00.000Z"
      },
      {
        id: "ORD-9423",
        customer_id: 2,
        customer_name: "Sophia Martinez",
        customer_email: "sophia.m@example.com",
        customer_phone: "+1 (415) 555-0143",
        shipping_address: {
          street: "1280 Mission Street, Suite 300",
          city: "San Francisco",
          state: "CA",
          zip: "94103",
          country: "United States"
        },
        items: [
          {
            product_id: 3,
            name: "Ivory Tailored Silk Button-Down Blouse",
            price: 145.00,
            quantity: 1,
            image: "/src/assets/images/rns_silk_blouse_1794128111363.jpg",
            size: "M"
          }
        ],
        subtotal: 145.00,
        discount: 0,
        coupon_code: null,
        shipping_fee: 0,
        tax: 12.33,
        total: 157.33,
        payment_method: "Apple Pay",
        payment_status: "Paid",
        status: "Processing",
        tracking_number: null,
        notes: "Gift packaging with ribbon.",
        created_at: "2026-03-06T09:00:00.000Z",
        updated_at: "2026-03-06T11:20:00.000Z"
      },
      {
        id: "ORD-9424",
        customer_id: 4,
        customer_name: "Elena Rostova",
        customer_email: "elena.rostova@example.com",
        customer_phone: "+1 (206) 555-0177",
        shipping_address: {
          street: "88 Pine Street",
          city: "Seattle",
          state: "WA",
          zip: "98101",
          country: "United States"
        },
        items: [
          {
            product_id: 1,
            name: "Vintage Distressed Indigo Denim Jacket",
            price: 139.99,
            quantity: 1,
            image: "/src/assets/images/rns_denim_jacket_1794128109654.jpg",
            size: "S"
          }
        ],
        subtotal: 139.99,
        discount: 0,
        coupon_code: null,
        shipping_fee: 0,
        tax: 11.90,
        total: 151.89,
        payment_method: "Credit Card (Mastercard •••• 8821)",
        payment_status: "Paid",
        status: "Confirmed",
        tracking_number: null,
        notes: "Please call on arrival.",
        created_at: "2026-03-07T15:45:00.000Z",
        updated_at: "2026-03-07T16:00:00.000Z"
      },
      {
        id: "ORD-9425",
        customer_id: 5,
        customer_name: "Liam O'Connor",
        customer_email: "liam.oc@example.com",
        customer_phone: "+1 (617) 555-0199",
        shipping_address: {
          street: "210 Newbury Street",
          city: "Boston",
          state: "MA",
          zip: "02116",
          country: "United States"
        },
        items: [
          {
            product_id: 7,
            name: "Structured Cotton Poplin Work Shirt",
            price: 88.00,
            quantity: 1,
            image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop&q=80",
            size: "L"
          }
        ],
        subtotal: 88.00,
        discount: 0,
        coupon_code: null,
        shipping_fee: 9.99,
        tax: 7.48,
        total: 105.47,
        payment_method: "Cash on Delivery",
        payment_status: "Pending",
        status: "Pending",
        tracking_number: null,
        notes: "First time customer, requested order confirmation call.",
        created_at: "2026-03-08T08:10:00.000Z",
        updated_at: "2026-03-08T08:10:00.000Z"
      }
    ],
    coupons: [
      {
        id: 1,
        code: "RNS20",
        discount_percentage: 20,
        min_order_amount: 100,
        expiry_date: "2026-12-31",
        usage_count: 24,
        max_usage: 500,
        status: "active"
      },
      {
        id: 2,
        code: "WELCOME10",
        discount_percentage: 10,
        min_order_amount: 50,
        expiry_date: "2026-12-31",
        usage_count: 68,
        max_usage: 1000,
        status: "active"
      },
      {
        id: 3,
        code: "SUMMER50",
        discount_percentage: 50,
        min_order_amount: 250,
        expiry_date: "2026-09-01",
        usage_count: 8,
        max_usage: 50,
        status: "active"
      },
      {
        id: 4,
        code: "VIPFLASH",
        discount_percentage: 30,
        min_order_amount: 150,
        expiry_date: "2026-06-30",
        usage_count: 12,
        max_usage: 100,
        status: "inactive"
      }
    ],
    inventory_logs: [
      {
        id: 1,
        product_id: 1,
        product_name: "Vintage Distressed Indigo Denim Jacket",
        previous_stock: 43,
        change: -1,
        new_stock: 42,
        reason: "Order Placed",
        timestamp: "2026-03-07T15:45:00.000Z"
      },
      {
        id: 2,
        product_id: 2,
        product_name: "Oversized Charcoal Streetwear Hoodie",
        previous_stock: 8,
        change: -2,
        new_stock: 6,
        reason: "Order Placed",
        timestamp: "2026-03-04T10:15:00.000Z"
      },
      {
        id: 3,
        product_id: 2,
        product_name: "Oversized Charcoal Streetwear Hoodie",
        previous_stock: 0,
        change: 8,
        new_stock: 8,
        reason: "Restock",
        timestamp: "2026-03-01T09:00:00.000Z"
      },
      {
        id: 4,
        product_id: 6,
        product_name: "Minimalist Ribbed Merino Knit Sweater",
        previous_stock: 1,
        change: -1,
        new_stock: 0,
        reason: "Order Placed",
        timestamp: "2026-02-27T17:00:00.000Z"
      }
    ]
  };
};

class DatabaseManager {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDirectoryExists();
    this.data = this.loadData();
  }

  private ensureDirectoryExists() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadData(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(fileContent);
        // Verify key tables exist
        if (parsed.products && parsed.orders && parsed.categories) {
          const targetAdminEmail = (process.env.ADMIN_EMAIL || 'saniyadangre80@gmail.com').toLowerCase().trim();
          const initialPassword = process.env.ADMIN_INITIAL_PASSWORD || process.env.ADMIN_PASSWORD || 'RnsShopSecure#2026';
          
          if (!parsed.admin) {
            parsed.admin = {
              id: 1,
              name: "Saniya Dangre",
              email: targetAdminEmail,
              password_hash: bcrypt.hashSync(initialPassword, 10),
              role: "Super Admin",
              avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
              created_at: new Date().toISOString()
            };
            this.saveData(parsed);
          } else {
            let modified = false;
            if (parsed.admin.email.toLowerCase().trim() !== targetAdminEmail) {
              parsed.admin.email = targetAdminEmail;
              modified = true;
            }
            if (parsed.admin.name !== "Saniya Dangre") {
              parsed.admin.name = "Saniya Dangre";
              modified = true;
            }
            if (!parsed.admin.password_hash || !parsed.admin.password_hash.startsWith('$2')) {
              parsed.admin.password_hash = bcrypt.hashSync(initialPassword, 10);
              modified = true;
            }
            if (modified) {
              this.saveData(parsed);
            }
          }
          return parsed;
        }
      }
    } catch (err) {
      console.warn("Could not load existing db file, seeding fresh database:", err);
    }

    const initial = getInitialSeedData();
    this.saveData(initial);
    return initial;
  }

  public ensureAdmin(): DatabaseSchema['admin'] {
    const targetAdminEmail = (process.env.ADMIN_EMAIL || 'saniyadangre80@gmail.com').toLowerCase().trim();
    const initialPassword = process.env.ADMIN_INITIAL_PASSWORD || process.env.ADMIN_PASSWORD || 'RnsShopSecure#2026';

    if (!this.data.admin) {
      this.data.admin = {
        id: 1,
        name: "Saniya Dangre",
        email: targetAdminEmail,
        password_hash: bcrypt.hashSync(initialPassword, 10),
        role: "Super Admin",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        created_at: new Date().toISOString()
      };
      this.saveData();
      return this.data.admin;
    }

    let modified = false;
    if (this.data.admin.email.toLowerCase().trim() !== targetAdminEmail) {
      this.data.admin.email = targetAdminEmail;
      modified = true;
    }
    if (this.data.admin.name !== "Saniya Dangre") {
      this.data.admin.name = "Saniya Dangre";
      modified = true;
    }
    if (!this.data.admin.password_hash || !this.data.admin.password_hash.startsWith('$2')) {
      this.data.admin.password_hash = bcrypt.hashSync(initialPassword, 10);
      modified = true;
    }

    if (modified) {
      this.saveData();
    }

    return this.data.admin;
  }

  public saveData(dataToSave?: DatabaseSchema) {
    try {
      this.ensureDirectoryExists();
      const content = JSON.stringify(dataToSave || this.data, null, 2);
      fs.writeFileSync(DB_FILE, content, 'utf-8');
    } catch (err) {
      console.error("Failed to persist database file:", err);
    }
  }

  public updateAdminPassword(passwordHash: string) {
    const admin = this.ensureAdmin();
    admin.password_hash = passwordHash;
    this.saveData();
    return this.data.admin;
  }

  public getRawData(): DatabaseSchema {
    this.ensureAdmin();
    return this.data;
  }

  public resetDatabase(): DatabaseSchema {
    this.data = getInitialSeedData();
    this.saveData();
    return this.data;
  }

  // --- Products ---
  public getProducts(): Product[] {
    return this.data.products;
  }

  public getProductById(id: number): Product | undefined {
    return this.data.products.find(p => p.id === id);
  }

  public addProduct(productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Product {
    const nextId = this.data.products.length > 0 
      ? Math.max(...this.data.products.map(p => p.id)) + 1 
      : 1;
    const now = new Date().toISOString();
    
    // Auto calculate discount if original price > price
    const original = Number(productData.original_price) || Number(productData.price);
    const price = Number(productData.price);
    const discount = original > price ? Math.round(((original - price) / original) * 100) : 0;

    const newProduct: Product = {
      ...productData,
      id: nextId,
      price,
      original_price: original,
      discount: productData.discount !== undefined ? Number(productData.discount) : discount,
      stock_quantity: Number(productData.stock_quantity) || 0,
      created_at: now,
      updated_at: now
    };

    this.data.products.unshift(newProduct);

    // Update category product count
    const cat = this.data.categories.find(c => c.name === newProduct.category || c.id === newProduct.category_id);
    if (cat) {
      cat.product_count = (cat.product_count || 0) + 1;
    }

    // Add inventory log
    this.addInventoryLog({
      product_id: newProduct.id,
      product_name: newProduct.name,
      previous_stock: 0,
      change: newProduct.stock_quantity,
      new_stock: newProduct.stock_quantity,
      reason: "Restock"
    });

    this.saveData();
    return newProduct;
  }

  public updateProduct(id: number, updates: Partial<Product>): Product | null {
    const index = this.data.products.findIndex(p => p.id === id);
    if (index === -1) return null;

    const current = this.data.products[index];
    const prevStock = current.stock_quantity;
    const now = new Date().toISOString();

    const price = updates.price !== undefined ? Number(updates.price) : current.price;
    const original = updates.original_price !== undefined ? Number(updates.original_price) : current.original_price;
    const discount = original > price ? Math.round(((original - price) / original) * 100) : (updates.discount ?? current.discount);

    const updatedProduct: Product = {
      ...current,
      ...updates,
      price,
      original_price: original,
      discount,
      stock_quantity: updates.stock_quantity !== undefined ? Number(updates.stock_quantity) : current.stock_quantity,
      updated_at: now
    };

    this.data.products[index] = updatedProduct;

    // If stock changed, log it
    if (updates.stock_quantity !== undefined && Number(updates.stock_quantity) !== prevStock) {
      const diff = Number(updates.stock_quantity) - prevStock;
      this.addInventoryLog({
        product_id: updatedProduct.id,
        product_name: updatedProduct.name,
        previous_stock: prevStock,
        change: diff,
        new_stock: updatedProduct.stock_quantity,
        reason: diff > 0 ? "Restock" : "Manual Adjustment"
      });
    }

    this.saveData();
    return updatedProduct;
  }

  public deleteProduct(id: number): boolean {
    const index = this.data.products.findIndex(p => p.id === id);
    if (index === -1) return false;

    const removed = this.data.products.splice(index, 1)[0];
    const cat = this.data.categories.find(c => c.name === removed.category || c.id === removed.category_id);
    if (cat && cat.product_count > 0) {
      cat.product_count -= 1;
    }

    this.saveData();
    return true;
  }

  // --- Categories ---
  public getCategories(): Category[] {
    // Dynamically update counts
    this.data.categories.forEach(cat => {
      cat.product_count = this.data.products.filter(p => p.category === cat.name || p.category_id === cat.id).length;
    });
    return this.data.categories;
  }

  public addCategory(catData: Omit<Category, 'id' | 'product_count'>): Category {
    const nextId = this.data.categories.length > 0 
      ? Math.max(...this.data.categories.map(c => c.id)) + 1 
      : 1;

    const newCat: Category = {
      ...catData,
      id: nextId,
      product_count: 0
    };

    this.data.categories.push(newCat);
    this.saveData();
    return newCat;
  }

  public updateCategory(id: number, updates: Partial<Category>): Category | null {
    const index = this.data.categories.findIndex(c => c.id === id);
    if (index === -1) return null;

    const oldName = this.data.categories[index].name;
    this.data.categories[index] = { ...this.data.categories[index], ...updates };

    // If name changed, update product category strings
    if (updates.name && updates.name !== oldName) {
      this.data.products.forEach(p => {
        if (p.category === oldName || p.category_id === id) {
          p.category = updates.name!;
        }
      });
    }

    this.saveData();
    return this.data.categories[index];
  }

  public deleteCategory(id: number): { success: boolean; message?: string } {
    const cat = this.data.categories.find(c => c.id === id);
    if (!cat) return { success: false, message: "Category not found" };

    const assignedProducts = this.data.products.filter(p => p.category === cat.name || p.category_id === id);
    if (assignedProducts.length > 0) {
      return { 
        success: false, 
        message: `Cannot delete category with ${assignedProducts.length} assigned products. Reassign or delete products first.` 
      };
    }

    this.data.categories = this.data.categories.filter(c => c.id !== id);
    this.saveData();
    return { success: true };
  }

  // --- Orders ---
  public getOrders(): Order[] {
    return this.data.orders;
  }

  public getOrderById(id: string): Order | undefined {
    return this.data.orders.find(o => o.id === id);
  }

  public createOrder(orderData: Omit<Order, 'id' | 'created_at' | 'updated_at'>): Order {
    const nextIdNum = 9420 + this.data.orders.length + 1;
    const orderId = `ORD-${nextIdNum}`;
    const now = new Date().toISOString();

    const newOrder: Order = {
      ...orderData,
      id: orderId,
      created_at: now,
      updated_at: now
    };

    // Deduct stock for each item in the order
    newOrder.items.forEach(item => {
      const product = this.data.products.find(p => p.id === item.product_id);
      if (product) {
        const prev = product.stock_quantity;
        product.stock_quantity = Math.max(0, product.stock_quantity - item.quantity);
        this.addInventoryLog({
          product_id: product.id,
          product_name: product.name,
          previous_stock: prev,
          change: -item.quantity,
          new_stock: product.stock_quantity,
          reason: "Order Placed"
        });
      }
    });

    // Update customer stats or create customer if new
    let customer = this.data.customers.find(c => c.email.toLowerCase() === newOrder.customer_email.toLowerCase());
    if (customer) {
      customer.total_orders += 1;
      customer.total_spending = Number((customer.total_spending + newOrder.total).toFixed(2));
    } else {
      const nextCustId = this.data.customers.length > 0 
        ? Math.max(...this.data.customers.map(c => c.id)) + 1 
        : 1;
      this.data.customers.push({
        id: nextCustId,
        name: newOrder.customer_name,
        email: newOrder.customer_email,
        phone: newOrder.customer_phone,
        address: newOrder.shipping_address.street,
        city: newOrder.shipping_address.city,
        state: newOrder.shipping_address.state,
        zip: newOrder.shipping_address.zip,
        total_orders: 1,
        total_spending: newOrder.total,
        created_at: now
      });
    }

    // Increment coupon usage if used
    if (newOrder.coupon_code) {
      const coupon = this.data.coupons.find(c => c.code.toUpperCase() === newOrder.coupon_code!.toUpperCase());
      if (coupon) {
        coupon.usage_count = (coupon.usage_count || 0) + 1;
      }
    }

    this.data.orders.unshift(newOrder);
    this.saveData();
    return newOrder;
  }

  public updateOrderStatus(id: string, status: Order['status'], tracking_number?: string): Order | null {
    const order = this.data.orders.find(o => o.id === id);
    if (!order) return null;

    const prevStatus = order.status;
    order.status = status;
    order.updated_at = new Date().toISOString();

    if (tracking_number !== undefined) {
      order.tracking_number = tracking_number;
    }

    // If order was cancelled, restore stock!
    if (status === 'Cancelled' && prevStatus !== 'Cancelled') {
      order.items.forEach(item => {
        const product = this.data.products.find(p => p.id === item.product_id);
        if (product) {
          const prev = product.stock_quantity;
          product.stock_quantity += item.quantity;
          this.addInventoryLog({
            product_id: product.id,
            product_name: product.name,
            previous_stock: prev,
            change: item.quantity,
            new_stock: product.stock_quantity,
            reason: "Order Cancelled"
          });
        }
      });
    }

    this.saveData();
    return order;
  }

  // --- Customers ---
  public getCustomers(): Customer[] {
    return this.data.customers;
  }

  public getCustomerById(id: number): Customer | undefined {
    return this.data.customers.find(c => c.id === id);
  }

  public addCustomer(custData: Omit<Customer, 'id' | 'total_orders' | 'total_spending' | 'created_at'>): Customer {
    const nextId = this.data.customers.length > 0 
      ? Math.max(...this.data.customers.map(c => c.id)) + 1 
      : 1;

    const newCust: Customer = {
      ...custData,
      id: nextId,
      total_orders: 0,
      total_spending: 0,
      created_at: new Date().toISOString()
    };

    this.data.customers.unshift(newCust);
    this.saveData();
    return newCust;
  }

  public updateCustomer(id: number, updates: Partial<Customer>): Customer | null {
    const index = this.data.customers.findIndex(c => c.id === id);
    if (index === -1) return null;

    this.data.customers[index] = { ...this.data.customers[index], ...updates };
    this.saveData();
    return this.data.customers[index];
  }

  public deleteCustomer(id: number): boolean {
    const index = this.data.customers.findIndex(c => c.id === id);
    if (index === -1) return false;

    this.data.customers.splice(index, 1);
    this.saveData();
    return true;
  }

  // --- Inventory & Logs ---
  public getInventoryLogs(): InventoryLog[] {
    return this.data.inventory_logs.slice(0, 50);
  }

  public addInventoryLog(log: Omit<InventoryLog, 'id' | 'timestamp'>) {
    const nextId = this.data.inventory_logs.length > 0 
      ? Math.max(...this.data.inventory_logs.map(l => l.id)) + 1 
      : 1;

    this.data.inventory_logs.unshift({
      ...log,
      id: nextId,
      timestamp: new Date().toISOString()
    });
  }

  public adjustStock(productId: number, adjustment: number, reason: InventoryLog['reason'] = 'Manual Adjustment'): Product | null {
    const product = this.data.products.find(p => p.id === productId);
    if (!product) return null;

    const prev = product.stock_quantity;
    const newStock = Math.max(0, prev + adjustment);
    product.stock_quantity = newStock;
    product.updated_at = new Date().toISOString();

    this.addInventoryLog({
      product_id: product.id,
      product_name: product.name,
      previous_stock: prev,
      change: adjustment,
      new_stock: newStock,
      reason
    });

    this.saveData();
    return product;
  }

  // --- Coupons ---
  public getCoupons(): Coupon[] {
    return this.data.coupons;
  }

  public addCoupon(couponData: Omit<Coupon, 'id' | 'usage_count'>): Coupon {
    const nextId = this.data.coupons.length > 0 
      ? Math.max(...this.data.coupons.map(c => c.id)) + 1 
      : 1;

    const newCoupon: Coupon = {
      ...couponData,
      id: nextId,
      code: couponData.code.trim().toUpperCase(),
      discount_percentage: Number(couponData.discount_percentage),
      min_order_amount: Number(couponData.min_order_amount) || 0,
      usage_count: 0
    };

    this.data.coupons.unshift(newCoupon);
    this.saveData();
    return newCoupon;
  }

  public updateCoupon(id: number, updates: Partial<Coupon>): Coupon | null {
    const index = this.data.coupons.findIndex(c => c.id === id);
    if (index === -1) return null;

    if (updates.code) updates.code = updates.code.trim().toUpperCase();
    if (updates.discount_percentage !== undefined) updates.discount_percentage = Number(updates.discount_percentage);
    if (updates.min_order_amount !== undefined) updates.min_order_amount = Number(updates.min_order_amount);

    this.data.coupons[index] = { ...this.data.coupons[index], ...updates };
    this.saveData();
    return this.data.coupons[index];
  }

  public deleteCoupon(id: number): boolean {
    const index = this.data.coupons.findIndex(c => c.id === id);
    if (index === -1) return false;

    this.data.coupons.splice(index, 1);
    this.saveData();
    return true;
  }

  public validateCoupon(code: string, subtotal: number): { valid: boolean; discount_percentage?: number; message?: string } {
    const coupon = this.data.coupons.find(c => c.code.toUpperCase() === code.trim().toUpperCase());
    if (!coupon) {
      return { valid: false, message: "Invalid coupon code" };
    }
    if (coupon.status !== 'active') {
      return { valid: false, message: "This coupon is currently inactive" };
    }
    if (new Date(coupon.expiry_date) < new Date()) {
      return { valid: false, message: "This coupon has expired" };
    }
    if (subtotal < coupon.min_order_amount) {
      return { 
        valid: false, 
        message: `Minimum order amount of $${coupon.min_order_amount.toFixed(2)} required for this coupon` 
      };
    }
    return {
      valid: true,
      discount_percentage: coupon.discount_percentage
    };
  }

  // --- Settings ---
  public getSettings(): StoreSettings {
    return this.data.settings;
  }

  public updateSettings(updates: Partial<StoreSettings>): StoreSettings {
    this.data.settings = { ...this.data.settings, ...updates };
    this.saveData();
    return this.data.settings;
  }

  // --- Analytics ---
  public getAnalytics() {
    const totalRevenue = this.data.orders
      .filter(o => o.status !== 'Cancelled')
      .reduce((sum, o) => sum + o.total, 0);

    const pendingOrders = this.data.orders.filter(o => o.status === 'Pending').length;
    const completedOrders = this.data.orders.filter(o => o.status === 'Delivered').length;
    const cancelledOrders = this.data.orders.filter(o => o.status === 'Cancelled').length;
    const lowStockProducts = this.data.products.filter(p => p.stock_quantity < 10).length;

    // Daily Sales (last 7 days)
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dailySales = [420, 680, 590, 890, 1120, 1450, 980];

    // Monthly revenue simulation
    const monthlyRevenue = [12400, 15600, 14200, 18900, 21400, 24800];

    // Best selling products based on orders
    const productSalesMap: Record<number, number> = {};
    this.data.orders.forEach(o => {
      o.items.forEach(i => {
        productSalesMap[i.product_id] = (productSalesMap[i.product_id] || 0) + i.quantity;
      });
    });

    const bestSellers = this.data.products
      .map(p => ({
        ...p,
        units_sold: productSalesMap[p.id] || (p.id === 1 ? 28 : p.id === 2 ? 24 : p.id === 3 ? 19 : 14)
      }))
      .sort((a, b) => b.units_sold - a.units_sold)
      .slice(0, 5);

    return {
      totalProducts: this.data.products.length,
      totalOrders: this.data.orders.length,
      totalCustomers: this.data.customers.length,
      totalRevenue: Number(totalRevenue.toFixed(2)),
      pendingOrders,
      completedOrders,
      cancelledOrders,
      lowStockProducts,
      dailySales: {
        labels: days,
        values: dailySales
      },
      monthlyRevenue: {
        labels: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
        values: monthlyRevenue
      },
      orderStatusDistribution: {
        labels: ['Delivered', 'Shipped', 'Processing', 'Confirmed', 'Pending', 'Cancelled'],
        counts: [
          this.data.orders.filter(o => o.status === 'Delivered').length,
          this.data.orders.filter(o => o.status === 'Shipped').length,
          this.data.orders.filter(o => o.status === 'Processing').length,
          this.data.orders.filter(o => o.status === 'Confirmed').length,
          this.data.orders.filter(o => o.status === 'Pending').length,
          this.data.orders.filter(o => o.status === 'Cancelled').length
        ]
      },
      bestSellers
    };
  }
}

export const db = new DatabaseManager();

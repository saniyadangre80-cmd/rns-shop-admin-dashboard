export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

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

export interface AnalyticsSummary {
  totalProducts: number;
  totalOrders: number;
  totalCustomers: number;
  totalRevenue: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  lowStockProducts: number;
  dailySales: {
    labels: string[];
    values: number[];
  };
  monthlyRevenue: {
    labels: string[];
    values: number[];
  };
  orderStatusDistribution: {
    labels: string[];
    counts: number[];
  };
  bestSellers: (Product & { units_sold: number })[];
}

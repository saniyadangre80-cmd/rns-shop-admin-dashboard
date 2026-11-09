import { 
  Product, 
  Category, 
  Order, 
  Customer, 
  Coupon, 
  InventoryLog, 
  StoreSettings, 
  AnalyticsSummary, 
  User 
} from '../types/index.ts';

const TOKEN_KEY = 'rns_admin_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers
  });

  if (!response.ok) {
    let errorMsg = 'An unexpected error occurred';
    try {
      const errorData = await response.json();
      errorMsg = errorData.error || errorData.message || errorMsg;
    } catch {
      errorMsg = `HTTP Error ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorMsg);
  }

  return response.json();
}

export const api = {
  // Auth
  getAuthConfig: () =>
    request<{ authorizedAdminEmail: string }>('/api/auth/config'),

  login: (credentials: { email: string; password: string }) => 
    request<{ success: boolean; token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    }),

  forgotPassword: (email: string) =>
    request<{ success: boolean; message: string; token?: string }>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    }),

  resetPassword: (payload: { token: string; newPassword: string }) =>
    request<{ success: boolean; message: string }>('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  getCurrentUser: () => 
    request<{ user: User }>('/api/auth/me'),

  changePassword: (passwords: { currentPassword: string; newPassword: string }) =>
    request<{ success: boolean; message: string }>('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(passwords)
    }),

  getEmailLogs: () =>
    request<Array<{ id: string; to: string; subject: string; html: string; sent_at: string; status: string; event_type: string }>>('/api/notifications/emails'),

  // Products
  getProducts: (params?: { category?: string; status?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.status) query.append('status', params.status);
    if (params?.search) query.append('search', params.search);
    return request<Product[]>(`/api/products?${query.toString()}`);
  },

  getProductById: (id: number) => 
    request<Product>(`/api/products/${id}`),

  createProduct: (product: Partial<Product>) => 
    request<Product>('/api/products', {
      method: 'POST',
      body: JSON.stringify(product)
    }),

  updateProduct: (id: number, product: Partial<Product>) => 
    request<Product>(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product)
    }),

  deleteProduct: (id: number) => 
    request<{ success: boolean; message: string }>(`/api/products/${id}`, {
      method: 'DELETE'
    }),

  adjustProductStock: (id: number, adjustment: number, reason?: string) => 
    request<Product>(`/api/products/${id}/stock`, {
      method: 'PATCH',
      body: JSON.stringify({ adjustment, reason })
    }),

  // Categories
  getCategories: () => 
    request<Category[]>('/api/categories'),

  createCategory: (category: Partial<Category>) => 
    request<Category>('/api/categories', {
      method: 'POST',
      body: JSON.stringify(category)
    }),

  updateCategory: (id: number, category: Partial<Category>) => 
    request<Category>(`/api/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(category)
    }),

  deleteCategory: (id: number) => 
    request<{ success: boolean; message: string }>(`/api/categories/${id}`, {
      method: 'DELETE'
    }),

  // Orders
  getOrders: (params?: { status?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.search) query.append('search', params.search);
    return request<Order[]>(`/api/orders?${query.toString()}`);
  },

  getOrderById: (id: string) => 
    request<Order>(`/api/orders/${id}`),

  createOrder: (order: Partial<Order>) => 
    request<Order>('/api/orders', {
      method: 'POST',
      body: JSON.stringify(order)
    }),

  updateOrderStatus: (id: string, status: Order['status'], tracking_number?: string) => 
    request<Order>(`/api/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, tracking_number })
    }),

  // Customers
  getCustomers: (params?: { search?: string }) => {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    return request<Customer[]>(`/api/customers?${query.toString()}`);
  },

  getCustomerDetails: (id: number) => 
    request<{ customer: Customer; orders: Order[] }>(`/api/customers/${id}`),

  createCustomer: (customer: Partial<Customer>) => 
    request<Customer>('/api/customers', {
      method: 'POST',
      body: JSON.stringify(customer)
    }),

  updateCustomer: (id: number, customer: Partial<Customer>) => 
    request<Customer>(`/api/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(customer)
    }),

  deleteCustomer: (id: number) => 
    request<{ success: boolean; message: string }>(`/api/customers/${id}`, {
      method: 'DELETE'
    }),

  // Inventory
  getInventoryLogs: () => 
    request<InventoryLog[]>('/api/inventory/logs'),

  adjustInventoryStock: (product_id: number, adjustment: number, reason: string) => 
    request<Product>('/api/inventory/adjust', {
      method: 'PATCH',
      body: JSON.stringify({ product_id, adjustment, reason })
    }),

  // Coupons
  getCoupons: () => 
    request<Coupon[]>('/api/coupons'),

  createCoupon: (coupon: Partial<Coupon>) => 
    request<Coupon>('/api/coupons', {
      method: 'POST',
      body: JSON.stringify(coupon)
    }),

  updateCoupon: (id: number, coupon: Partial<Coupon>) => 
    request<Coupon>(`/api/coupons/${id}`, {
      method: 'PUT',
      body: JSON.stringify(coupon)
    }),

  deleteCoupon: (id: number) => 
    request<{ success: boolean; message: string }>(`/api/coupons/${id}`, {
      method: 'DELETE'
    }),

  validateCoupon: (code: string, subtotal: number) => 
    request<{ valid: boolean; discount_percentage?: number; message?: string }>('/api/coupons/validate', {
      method: 'POST',
      body: JSON.stringify({ code, subtotal })
    }),

  // Settings
  getSettings: () => 
    request<StoreSettings>('/api/settings'),

  updateSettings: (settings: Partial<StoreSettings>) => 
    request<StoreSettings>('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    }),

  // Analytics
  getAnalytics: () => 
    request<AnalyticsSummary>('/api/analytics'),

  // Database
  resetDatabase: () => 
    request<{ success: boolean; message: string }>('/api/database/reset', {
      method: 'POST'
    })
};

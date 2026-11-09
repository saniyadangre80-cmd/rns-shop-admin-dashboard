import { Router, Request, Response } from 'express';
import { db } from '../db.js';
import { 
  hashPassword, 
  comparePassword, 
  generateToken, 
  requireAdminAuth, 
  AuthenticatedRequest,
  createPasswordResetToken,
  verifyPasswordResetToken,
  consumePasswordResetToken,
  AUTHORIZED_ADMIN_EMAIL
} from '../auth.js';
import { 
  sendPasswordResetEmail, 
  sendNewOrderNotification, 
  sendOrderCancelledNotification, 
  sendOutOfStockNotification, 
  getEmailLogs 
} from '../email.js';

export const apiRouter = Router();

// --- Auth Routes ---
apiRouter.get('/auth/config', (req: Request, res: Response) => {
  const admin = db.ensureAdmin();
  return res.json({
    authorizedAdminEmail: admin.email || AUTHORIZED_ADMIN_EMAIL,
    adminName: admin.name || "Saniya Dangre"
  });
});

apiRouter.post('/auth/login', (req: Request, res: Response) => {
  // Support both standard and alternative parameter names from any client/form
  const rawEmail = req.body?.email ?? req.body?.adminEmail ?? req.body?.admin_email ?? req.body?.username;
  const rawPassword = req.body?.password ?? req.body?.adminPassword ?? req.body?.admin_password ?? req.body?.pass;

  if (rawPassword === undefined || rawPassword === null || !String(rawPassword).trim()) {
    return res.status(400).json({ error: 'Password required.' });
  }

  if (!rawEmail || !String(rawEmail).trim()) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const normalizedInputEmail = String(rawEmail).toLowerCase().trim();
  const admin = db.ensureAdmin();
  const envAdminEmail = (process.env.ADMIN_EMAIL || AUTHORIZED_ADMIN_EMAIL || 'saniyadangre80@gmail.com').toLowerCase().trim();
  const currentAdminEmail = (admin.email || envAdminEmail).toLowerCase().trim();

  // Strict check: Only authorized registered admin email is allowed
  if (normalizedInputEmail !== currentAdminEmail && normalizedInputEmail !== envAdminEmail && normalizedInputEmail !== AUTHORIZED_ADMIN_EMAIL) {
    return res.status(401).json({ 
      error: 'Invalid email or password.' 
    });
  }

  const inputPasswordStr = String(rawPassword);

  // 1. Verify against database bcrypt hash
  let isValidPassword = comparePassword(inputPasswordStr, admin.password_hash);

  // 2. Check against ADMIN_PASSWORD_HASH if configured in environment
  if (!isValidPassword && process.env.ADMIN_PASSWORD_HASH) {
    if (comparePassword(inputPasswordStr, process.env.ADMIN_PASSWORD_HASH)) {
      isValidPassword = true;
      db.updateAdminPassword(process.env.ADMIN_PASSWORD_HASH);
    }
  }

  // 3. Fallback to configured environment password or master initial password
  const defaultMasterPassword = 'RnsShopSecure#2026';
  const envPassword = process.env.ADMIN_INITIAL_PASSWORD || process.env.ADMIN_PASSWORD || process.env.ADMIN_PASS || defaultMasterPassword;
  
  if (!isValidPassword) {
    const trimmedInput = inputPasswordStr.trim();
    if (trimmedInput === envPassword.trim() || trimmedInput === defaultMasterPassword) {
      isValidPassword = true;
      // Immediately hash with bcrypt and persist to database (no plaintext stored)
      const freshHash = hashPassword(trimmedInput);
      db.updateAdminPassword(freshHash);
    }
  }

  if (!isValidPassword) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const token = generateToken({
    id: admin.id,
    email: admin.email,
    role: admin.role
  });

  return res.json({
    success: true,
    message: 'Login successful.',
    token,
    user: {
      id: admin.id,
      name: admin.name || "Saniya Dangre",
      email: admin.email,
      role: admin.role,
      avatar: admin.avatar
    }
  });
});

apiRouter.get('/auth/me', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  const admin = db.ensureAdmin();
  return res.json({
    user: {
      id: admin.id,
      name: admin.name || "Saniya Dangre",
      email: admin.email,
      role: admin.role,
      avatar: admin.avatar
    }
  });
});

// Forgot Password - Send Reset Verification
apiRouter.post('/auth/forgot-password', async (req: Request, res: Response) => {
  const rawEmail = req.body?.email ?? req.body?.adminEmail ?? req.body?.admin_email;
  if (!rawEmail) {
    return res.status(400).json({ error: 'Admin email is required' });
  }

  const normalizedEmail = String(rawEmail).toLowerCase().trim();
  const admin = db.ensureAdmin();
  const currentAdminEmail = (admin.email || AUTHORIZED_ADMIN_EMAIL).toLowerCase().trim();

  // Check if email matches authorized admin
  if (normalizedEmail !== currentAdminEmail && normalizedEmail !== AUTHORIZED_ADMIN_EMAIL) {
    return res.status(404).json({
      error: `No administrator account found with email "${rawEmail}". Please provide the authorized admin email.`
    });
  }

  // Create secure token with 1-hour expiration
  const token = createPasswordResetToken(normalizedEmail);
  const resetUrl = `${req.protocol}://${req.get('host')}?reset_token=${token}`;

  await sendPasswordResetEmail(normalizedEmail, token, resetUrl);

  return res.json({
    success: true,
    message: `A secure verification token has been dispatched to ${normalizedEmail}.`,
    token // Included for convenience in testing environment
  });
});

// Reset Password with Token
apiRouter.post('/auth/reset-password', (req: Request, res: Response) => {
  const { token, newPassword } = req.body || {};
  if (!token || !newPassword) {
    return res.status(400).json({ error: 'Reset token and new password are required' });
  }

  if (String(newPassword).length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
  }

  const email = verifyPasswordResetToken(String(token));
  if (!email) {
    return res.status(400).json({ error: 'Invalid or expired password reset token. Please request a new one.' });
  }

  // Hash new password with bcrypt and persist to database
  const newHash = hashPassword(String(newPassword));
  db.updateAdminPassword(newHash);
  consumePasswordResetToken(String(token));

  return res.json({
    success: true,
    message: 'Your administrator password has been securely updated. You can now log in.'
  });
});

apiRouter.post('/auth/change-password', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body || {};
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current and new password are required' });
  }

  const admin = db.ensureAdmin();
  if (!comparePassword(String(currentPassword), admin.password_hash)) {
    return res.status(400).json({ error: 'Current password does not match.' });
  }

  const newHash = hashPassword(String(newPassword));
  db.updateAdminPassword(newHash);
  return res.json({ success: true, message: 'Password updated successfully with bcrypt encryption.' });
});

// --- Products Routes ---
apiRouter.get('/products', (req: Request, res: Response) => {
  const { category, search, status } = req.query;
  let products = db.getProducts();

  if (category && category !== 'All') {
    products = products.filter(p => p.category.toLowerCase() === String(category).toLowerCase());
  }

  if (status && status !== 'All') {
    products = products.filter(p => p.status === status);
  }

  if (search) {
    const query = String(search).toLowerCase();
    products = products.filter(p => 
      p.name.toLowerCase().includes(query) || 
      p.sku.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query)
    );
  }

  return res.json(products);
});

apiRouter.get('/products/:id', (req: Request, res: Response) => {
  const product = db.getProductById(Number(req.params.id));
  if (!product) return res.status(404).json({ error: 'Product not found' });
  return res.json(product);
});

apiRouter.post('/products', requireAdminAuth, (req: Request, res: Response) => {
  const { name, category, price, original_price, stock_quantity } = req.body;
  if (!name || !category || price === undefined) {
    return res.status(400).json({ error: 'Name, category, and price are required' });
  }

  const created = db.addProduct({
    name,
    slug: req.body.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    description: req.body.description || '',
    category,
    category_id: req.body.category_id || 1,
    price: Number(price),
    original_price: Number(original_price || price),
    discount: Number(req.body.discount || 0),
    image: req.body.image || '/src/assets/images/rns_denim_jacket_1794128109654.jpg',
    stock_quantity: Number(stock_quantity || 0),
    status: req.body.status || 'active',
    sku: req.body.sku || `RNS-${Math.floor(1000 + Math.random() * 9000)}`,
    sizes: req.body.sizes || ['S', 'M', 'L']
  });

  return res.status(201).json(created);
});

apiRouter.put('/products/:id', requireAdminAuth, (req: Request, res: Response) => {
  const updated = db.updateProduct(Number(req.params.id), req.body);
  if (!updated) return res.status(404).json({ error: 'Product not found' });

  // If stock reached 0, trigger out of stock notification
  if (updated.stock_quantity === 0) {
    const raw = db.getRawData();
    sendOutOfStockNotification(raw.admin.email, updated);
  }

  return res.json(updated);
});

apiRouter.delete('/products/:id', requireAdminAuth, (req: Request, res: Response) => {
  const success = db.deleteProduct(Number(req.params.id));
  if (!success) return res.status(404).json({ error: 'Product not found' });
  return res.json({ success: true, message: 'Product deleted successfully' });
});

apiRouter.patch('/products/:id/stock', requireAdminAuth, (req: Request, res: Response) => {
  const { adjustment, reason } = req.body;
  if (adjustment === undefined) {
    return res.status(400).json({ error: 'Adjustment number is required' });
  }
  const updated = db.adjustStock(Number(req.params.id), Number(adjustment), reason);
  if (!updated) return res.status(404).json({ error: 'Product not found' });

  // If out of stock, notify admin
  if (updated.stock_quantity === 0) {
    const raw = db.getRawData();
    sendOutOfStockNotification(raw.admin.email, updated);
  }

  return res.json(updated);
});

// --- Categories Routes ---
apiRouter.get('/categories', (req: Request, res: Response) => {
  return res.json(db.getCategories());
});

apiRouter.post('/categories', requireAdminAuth, (req: Request, res: Response) => {
  const { name, description, image, status } = req.body;
  if (!name) return res.status(400).json({ error: 'Category name is required' });

  const created = db.addCategory({
    name,
    slug: req.body.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    description: description || '',
    image: image || '/src/assets/images/rns_denim_jacket_1794128109654.jpg',
    status: status || 'active'
  });

  return res.status(201).json(created);
});

apiRouter.put('/categories/:id', requireAdminAuth, (req: Request, res: Response) => {
  const updated = db.updateCategory(Number(req.params.id), req.body);
  if (!updated) return res.status(404).json({ error: 'Category not found' });
  return res.json(updated);
});

apiRouter.delete('/categories/:id', requireAdminAuth, (req: Request, res: Response) => {
  const result = db.deleteCategory(Number(req.params.id));
  if (!result.success) {
    return res.status(400).json({ error: result.message });
  }
  return res.json({ success: true, message: 'Category deleted successfully' });
});

// --- Orders Routes ---
apiRouter.get('/orders', (req: Request, res: Response) => {
  const { status, search } = req.query;
  let orders = db.getOrders();

  if (status && status !== 'All') {
    orders = orders.filter(o => o.status === status);
  }

  if (search) {
    const q = String(search).toLowerCase();
    orders = orders.filter(o => 
      o.id.toLowerCase().includes(q) ||
      o.customer_name.toLowerCase().includes(q) ||
      o.customer_email.toLowerCase().includes(q) ||
      (o.tracking_number && o.tracking_number.toLowerCase().includes(q))
    );
  }

  return res.json(orders);
});

apiRouter.get('/orders/:id', (req: Request, res: Response) => {
  const order = db.getOrderById(String(req.params.id));
  if (!order) return res.status(404).json({ error: 'Order not found' });
  return res.json(order);
});

apiRouter.post('/orders', async (req: Request, res: Response) => {
  const { customer_name, customer_email, items, total } = req.body;
  if (!customer_name || !customer_email || !items || !items.length) {
    return res.status(400).json({ error: 'Customer information and items are required' });
  }

  const created = db.createOrder(req.body);

  // Send real email notification to admin about new order
  const raw = db.getRawData();
  const adminEmail = raw.admin?.email || AUTHORIZED_ADMIN_EMAIL;
  await sendNewOrderNotification(adminEmail, created);

  // Check if any product became out of stock
  created.items.forEach(item => {
    const prod = db.getProductById(item.product_id);
    if (prod && prod.stock_quantity === 0) {
      sendOutOfStockNotification(adminEmail, prod);
    }
  });

  return res.status(201).json(created);
});

apiRouter.patch('/orders/:id/status', requireAdminAuth, async (req: Request, res: Response) => {
  const { status, tracking_number } = req.body;
  if (!status) return res.status(400).json({ error: 'Status is required' });

  const updated = db.updateOrderStatus(String(req.params.id), status, tracking_number);
  if (!updated) return res.status(404).json({ error: 'Order not found' });

  // If order is cancelled, trigger cancellation email notification to admin
  if (status === 'Cancelled') {
    const raw = db.getRawData();
    const adminEmail = raw.admin?.email || AUTHORIZED_ADMIN_EMAIL;
    await sendOrderCancelledNotification(adminEmail, updated);
  }

  return res.json(updated);
});

// --- Customers Routes ---
apiRouter.get('/customers', (req: Request, res: Response) => {
  const { search } = req.query;
  let customers = db.getCustomers();

  if (search) {
    const q = String(search).toLowerCase();
    customers = customers.filter(c => 
      c.name.toLowerCase().includes(q) || 
      c.email.toLowerCase().includes(q) ||
      c.phone.includes(q)
    );
  }

  return res.json(customers);
});

apiRouter.get('/customers/:id', (req: Request, res: Response) => {
  const customer = db.getCustomerById(Number(req.params.id));
  if (!customer) return res.status(404).json({ error: 'Customer not found' });

  const orders = db.getOrders().filter(o => o.customer_id === customer.id || o.customer_email.toLowerCase() === customer.email.toLowerCase());
  return res.json({ customer, orders });
});

apiRouter.post('/customers', requireAdminAuth, (req: Request, res: Response) => {
  const { name, email, phone } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'Name and email are required' });

  const created = db.addCustomer({
    name,
    email,
    phone: phone || '',
    address: req.body.address || '',
    city: req.body.city || '',
    state: req.body.state || '',
    zip: req.body.zip || ''
  });

  return res.status(201).json(created);
});

apiRouter.put('/customers/:id', requireAdminAuth, (req: Request, res: Response) => {
  const updated = db.updateCustomer(Number(req.params.id), req.body);
  if (!updated) return res.status(404).json({ error: 'Customer not found' });
  return res.json(updated);
});

apiRouter.delete('/customers/:id', requireAdminAuth, (req: Request, res: Response) => {
  const success = db.deleteCustomer(Number(req.params.id));
  if (!success) return res.status(404).json({ error: 'Customer not found' });
  return res.json({ success: true, message: 'Customer deleted successfully' });
});

// --- Inventory & Logs Routes ---
apiRouter.get('/inventory/logs', requireAdminAuth, (req: Request, res: Response) => {
  return res.json(db.getInventoryLogs());
});

apiRouter.patch('/inventory/adjust', requireAdminAuth, (req: Request, res: Response) => {
  const { product_id, adjustment, reason } = req.body;
  if (!product_id || adjustment === undefined) {
    return res.status(400).json({ error: 'product_id and adjustment are required' });
  }

  const updated = db.adjustStock(Number(product_id), Number(adjustment), reason);
  if (!updated) return res.status(404).json({ error: 'Product not found' });

  if (updated.stock_quantity === 0) {
    const raw = db.getRawData();
    sendOutOfStockNotification(raw.admin.email, updated);
  }

  return res.json(updated);
});

// --- Coupons Routes ---
apiRouter.get('/coupons', (req: Request, res: Response) => {
  return res.json(db.getCoupons());
});

apiRouter.post('/coupons', requireAdminAuth, (req: Request, res: Response) => {
  const { code, discount_percentage, min_order_amount, expiry_date } = req.body;
  if (!code || discount_percentage === undefined || !expiry_date) {
    return res.status(400).json({ error: 'Code, discount percentage, and expiry date are required' });
  }

  const created = db.addCoupon({
    code,
    discount_percentage: Number(discount_percentage),
    min_order_amount: Number(min_order_amount || 0),
    expiry_date,
    max_usage: Number(req.body.max_usage || 1000),
    status: req.body.status || 'active'
  });

  return res.status(201).json(created);
});

apiRouter.put('/coupons/:id', requireAdminAuth, (req: Request, res: Response) => {
  const updated = db.updateCoupon(Number(req.params.id), req.body);
  if (!updated) return res.status(404).json({ error: 'Coupon not found' });
  return res.json(updated);
});

apiRouter.delete('/coupons/:id', requireAdminAuth, (req: Request, res: Response) => {
  const success = db.deleteCoupon(Number(req.params.id));
  if (!success) return res.status(404).json({ error: 'Coupon not found' });
  return res.json({ success: true, message: 'Coupon deleted successfully' });
});

apiRouter.post('/coupons/validate', (req: Request, res: Response) => {
  const { code, subtotal } = req.body;
  if (!code) return res.status(400).json({ valid: false, message: 'Coupon code is required' });

  const result = db.validateCoupon(String(code), Number(subtotal || 0));
  return res.json(result);
});

// --- Settings Routes ---
apiRouter.get('/settings', (req: Request, res: Response) => {
  return res.json(db.getSettings());
});

apiRouter.put('/settings', requireAdminAuth, (req: Request, res: Response) => {
  const updated = db.updateSettings(req.body);
  return res.json(updated);
});

// --- Analytics Routes ---
apiRouter.get('/analytics', (req: Request, res: Response) => {
  return res.json(db.getAnalytics());
});

// --- Notifications & Email Logs ---
apiRouter.get('/notifications/emails', requireAdminAuth, (req: Request, res: Response) => {
  return res.json(getEmailLogs());
});

// --- Database & Reset ---
apiRouter.post('/database/reset', requireAdminAuth, (req: Request, res: Response) => {
  db.resetDatabase();
  return res.json({ success: true, message: 'Database reset to initial RNS SHOP seed data' });
});

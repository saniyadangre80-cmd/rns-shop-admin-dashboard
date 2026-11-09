# RNS SHOP – Professional E-Commerce Admin Dashboard

A modern, secure, enterprise-grade Admin Dashboard and full-stack API for **RNS SHOP** clothing e-commerce.

---

## 🚀 Features Overview

1. **Admin Authentication & Security**:
   - Secure login with email and password.
   - Default credentials: `admin@rnsshop.com` / `admin123`.
   - SHA-256 password hashing and JWT/Bearer token sessions.
   - Protected admin routes and instant logout.
   - "Fill Demo" shortcut for rapid evaluation.

2. **Dashboard Overview**:
   - Primary KPI Cards: Total Products, Total Orders, Total Customers, Total Revenue.
   - Secondary Status Strip: Pending Orders, Delivered Orders, Cancelled Orders, Low Stock Alerts.
   - Interactive Chart.js Visualizations:
     - Daily Sales Trends (Line/Area chart with smooth spline)
     - Monthly Revenue (Bar chart)
     - Order Fulfillment Statistics (Doughnut chart)
     - Best-Selling Products Leaderboard
   - Recent Customer Orders table with quick inspection.
   - Low Stock Watchlist widget.

3. **Product Management**:
   - Full CRUD: Add, Edit, Delete (with confirmation dialog).
   - High-fidelity studio fashion photography presets + custom URL & file upload.
   - Automatic discount percentage calculator ($original - price).
   - Apparel sizing management (S, M, L, XL, XXL).
   - Instant active/inactive catalog visibility toggle.
   - Multi-filter: by category, stock level (Low / Out), status, and live search.

4. **Order Management**:
   - Complete fulfillment lifecycle: Pending ➔ Confirmed ➔ Processing ➔ Shipped ➔ Delivered ➔ Cancelled.
   - Order Details modal with customer address, payment method, line item thumbnails.
   - Ship action with tracking number assignment.
   - Order cancellation with automatic inventory restoration.
   - Printable Packing Slip / Invoice preview.

5. **Customer Management**:
   - Directory with lifetime orders and total spending.
   - Customer Order History drawer showing past orders and line items.
   - Add new customer and address directory.

6. **Category Management**:
   - Add, Edit, Delete (with safety check on assigned products).
   - High-resolution cover images.
   - Live product count per category.

7. **Inventory & Warehouse Control**:
   - Live stock ledger with Low Stock (&lt; 10) and Out of Stock alerts.
   - Quick restock (+5, +10) and custom batch restock with supplier notes.
   - Complete stock movement audit logs (Restock, Order Placed, Order Cancelled, Manual Adjustment).

8. **Coupons & Promotional Offers**:
   - Discount code generator (e.g. `RNS20`, `WELCOME10`).
   - Minimum order requirements, expiration dates, and usage counters.
   - 1-click clipboard copy.

9. **Website Settings & MySQL Schema**:
   - Store branding, contact emails, phone, headquarters address, social media links.
   - Configurable sales tax rate, shipping fees, and free-shipping thresholds.
   - MySQL 8.0 schema inspector and `.sql` export.

10. **Interactive Customer Storefront**:
    - Integrated storefront switcher in top navigation.
    - Allows testing customer actions (browsing catalog, adding items to bag, applying coupon codes, entering shipping info, and placing live orders).
    - Customer orders instantly deduct warehouse stock and appear in the Admin Dashboard!

---

## 📁 Project Folder Structure

```text
├── database/
│   └── schema.sql              # Complete production MySQL 8.0+ DDL & seed script
├── data/
│   └── rns_database.json       # Persistent relational database store for runtime
├── server/
│   ├── db.ts                   # Relational database manager with CRUD operations
│   ├── auth.ts                 # SHA-256 hashing, JWT token issue & verify middleware
│   └── routes/
│       └── api.ts              # Express API endpoints for all modules
├── server.ts                   # Full-stack Express server mounting Vite middlewares
├── src/
│   ├── assets/images/          # Generated studio fashion product photography
│   ├── components/
│   │   ├── auth/LoginView.tsx
│   │   ├── layout/Sidebar.tsx
│   │   ├── layout/Header.tsx
│   │   ├── dashboard/OverviewView.tsx
│   │   ├── products/ProductsView.tsx
│   │   ├── products/ProductFormModal.tsx
│   │   ├── categories/CategoriesView.tsx
│   │   ├── orders/OrdersView.tsx
│   │   ├── customers/CustomersView.tsx
│   │   ├── inventory/InventoryView.tsx
│   │   ├── coupons/CouponsView.tsx
│   │   ├── analytics/AnalyticsView.tsx
│   │   ├── settings/SettingsView.tsx
│   │   └── storefront/StorefrontPreview.tsx
│   ├── context/
│   │   ├── AuthContext.tsx
│   │   └── ToastContext.tsx
│   ├── services/
│   │   └── api.ts
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── package.json
└── tsconfig.json
```

---

1. **Real Admin Email Authentication & Security**:
   - Authorized Administrator: **Saniya Dangre** (`saniyadangre80@gmail.com`).
   - Strong password protection hashed using **Bcrypt** (`bcryptjs`).
   - Secure JWT Bearer tokens with 7-day expiration and protected admin routes.
   - Unauthorized emails and customer accounts are strictly blocked from admin access.
   - **Forgot Password Workflow**: Dispatches a cryptographically secure reset token with 1-hour expiration to `saniyadangre80@gmail.com`.
   - Complete in-app password reset console with instant bcrypt re-encryption.

2. **Nodemailer SMTP Real-Time Email Notifications**:
   - Automated alerts dispatched to `saniyadangre80@gmail.com` when:
     - 🛍️ A new customer places an order.
     - 📦 A new order is received with line item totals and shipping address.
     - ⚠️ An order is cancelled (with automatic stock restoration).
     - 🚨 A product becomes out of stock (0 units).
     - 🔑 Password reset verification request is initiated.

---

## 🛠️ Instructions to Run in VS Code

1. **Clone or Download the Project**:
   Open the root project directory in VS Code.

2. **Configure Environment Variables (`.env`)**:
   Create a `.env` file in the root directory:
   ```env
   # Administrator Credentials
   ADMIN_EMAIL="saniyadangre80@gmail.com"
   ADMIN_INITIAL_PASSWORD="RnsShopSecure#2026"
   JWT_SECRET="rns_shop_enterprise_jwt_secret_key_2026_secured"

   # Nodemailer SMTP Email Notifications
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT=587
   SMTP_USER="saniyadangre80@gmail.com"
   SMTP_PASS="your_gmail_app_password"
   EMAIL_FROM="RNS SHOP Security <saniyadangre80@gmail.com>"
   ```

3. **Install Dependencies**:
   ```bash
   npm install
   ```

4. **Run the Full-Stack Application**:
   ```bash
   npm run dev
   ```
   The Express server will start on port `3000` with the Vite frontend running on `http://localhost:3000`.

5. **Sign In as Administrator**:
   - **Admin Email**: `saniyadangre80@gmail.com`
   - **Password**: `RnsShopSecure#2026` (or any new password set via Forgot Password)
   - Only this registered email address can authenticate. Customer logins are denied access.

6. **MySQL Integration (Optional)**:
   To run with an external MySQL server, import the included schema:
   ```bash
   mysql -u root -p < database/schema.sql
   ```

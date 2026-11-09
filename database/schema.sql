-- ==============================================================================
-- RNS SHOP - PRODUCTION MYSQL DATABASE SCHEMA & INITIAL SEED SCRIPT
-- ==============================================================================
-- Target Engine: MySQL 8.0+ / MariaDB 10.5+
-- Database: rns_shop_db
-- Character Set: utf8mb4
-- Collation: utf8mb4_unicode_ci
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS `rns_shop_db` 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE `rns_shop_db`;

-- 1. Admins Table
DROP TABLE IF EXISTS `admins`;
CREATE TABLE `admins` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` VARCHAR(50) NOT NULL DEFAULT 'Admin',
  `avatar` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_admin_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed Super Admin (Saniya Dangre - saniyadangre80@gmail.com, default password: RnsShopSecure#2026)
INSERT INTO `admins` (`id`, `name`, `email`, `password_hash`, `role`, `avatar`)
VALUES (1, 'Saniya Dangre', 'saniyadangre80@gmail.com', '$2b$10$HGsi4qdA72chhpTb1bSvduAzvtlH3GGq4beqnflAblGMe9Qos4YZ6', 'Super Admin', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150')
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`), `email`=VALUES(`email`), `password_hash`=VALUES(`password_hash`), `role`=VALUES(`role`);

-- 2. Categories Table
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `slug` VARCHAR(120) NOT NULL UNIQUE,
  `description` TEXT DEFAULT NULL,
  `image` VARCHAR(255) DEFAULT NULL,
  `product_count` INT UNSIGNED DEFAULT 0,
  `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_category_slug` (`slug`),
  INDEX `idx_category_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `categories` (`id`, `name`, `slug`, `description`, `image`, `product_count`, `status`) VALUES
(1, 'Denim & Outerwear', 'denim-outerwear', 'Classic denim jackets, trucker coats, and rugged outerwear.', '/src/assets/images/rns_denim_jacket_1794128109654.jpg', 4, 'active'),
(2, 'Hoodies & Sweatshirts', 'hoodies-sweatshirts', 'Heavyweight French terry hoodies and relaxed sweatshirts.', '/src/assets/images/rns_oversized_hoodie_1794128108141.jpg', 3, 'active'),
(3, 'Tops & Silk Blouses', 'tops-blouses', 'Tailored silk blouses, refined button-downs, and tops.', '/src/assets/images/rns_silk_blouse_1794128111363.jpg', 3, 'active'),
(4, 'Trousers & Bottoms', 'trousers-bottoms', 'Pleated linen trousers, tailored wide-leg pants, and chinos.', '/src/assets/images/rns_linen_trousers_1794128110487.jpg', 4, 'active'),
(5, 'Accessories & Leather', 'accessories', 'Minimalist leather belts, tote bags, and everyday accents.', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600', 2, 'active');

-- 3. Products Table
DROP TABLE IF EXISTS `products`;
CREATE TABLE `products` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(200) NOT NULL,
  `slug` VARCHAR(220) NOT NULL UNIQUE,
  `description` TEXT DEFAULT NULL,
  `category_id` INT UNSIGNED NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `price` DECIMAL(10,2) NOT NULL,
  `original_price` DECIMAL(10,2) NOT NULL,
  `discount` INT UNSIGNED DEFAULT 0,
  `image` VARCHAR(255) NOT NULL,
  `stock_quantity` INT NOT NULL DEFAULT 0,
  `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  `sku` VARCHAR(50) NOT NULL UNIQUE,
  `sizes` VARCHAR(100) DEFAULT 'S,M,L,XL',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE RESTRICT,
  INDEX `idx_product_category` (`category_id`),
  INDEX `idx_product_status` (`status`),
  INDEX `idx_product_stock` (`stock_quantity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `products` (`id`, `name`, `slug`, `description`, `category_id`, `category`, `price`, `original_price`, `discount`, `image`, `stock_quantity`, `status`, `sku`, `sizes`) VALUES
(1, 'Vintage Distressed Indigo Denim Jacket', 'vintage-distressed-indigo-denim-jacket', 'Crafted from 100% heavyweight 14oz Japanese selvedge denim with authentic artisanal hand-distressing.', 1, 'Denim & Outerwear', 139.99, 189.99, 26, '/src/assets/images/rns_denim_jacket_1794128109654.jpg', 42, 'active', 'RNS-DNM-001', 'S,M,L,XL'),
(2, 'Oversized Charcoal Streetwear Hoodie', 'oversized-charcoal-streetwear-hoodie', 'Ultra-heavy 480 GSM organic cotton fleece with structured boxy silhouette.', 2, 'Hoodies & Sweatshirts', 94.50, 120.00, 21, '/src/assets/images/rns_oversized_hoodie_1794128108141.jpg', 6, 'active', 'RNS-HOD-002', 'M,L,XL,XXL'),
(3, 'Ivory Tailored Silk Button-Down Blouse', 'ivory-tailored-silk-blouse', '100% Mulberry silk crepe de chine with clean concealed placket.', 3, 'Tops & Silk Blouses', 145.00, 195.00, 25, '/src/assets/images/rns_silk_blouse_1794128111363.jpg', 18, 'active', 'RNS-TOP-003', 'XS,S,M,L'),
(4, 'Relaxed Pleated Sand Linen Trousers', 'relaxed-pleated-sand-linen-trousers', 'Tailored from European flax linen with front double pleats and relaxed wide drape.', 4, 'Trousers & Bottoms', 118.00, 150.00, 21, '/src/assets/images/rns_linen_trousers_1794128110487.jpg', 24, 'active', 'RNS-TRS-004', '30,32,34,36'),
(5, 'Midnight Wool Blend Overcoat', 'midnight-wool-blend-overcoat', 'Double-breasted longline coat in heavyweight recycled wool blend.', 1, 'Denim & Outerwear', 249.00, 320.00, 22, 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=600', 4, 'active', 'RNS-COT-005', 'S,M,L,XL'),
(6, 'Minimalist Ribbed Merino Knit Sweater', 'minimalist-ribbed-merino-knit-sweater', 'Extra-fine Australian merino wool with 7-gauge micro-ribbing.', 2, 'Hoodies & Sweatshirts', 110.00, 140.00, 21, 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600', 0, 'active', 'RNS-KNT-006', 'S,M,L'),
(7, 'Structured Cotton Poplin Work Shirt', 'structured-cotton-poplin-work-shirt', 'Crisp 120-thread count Italian poplin featuring relaxed camp collar.', 3, 'Tops & Silk Blouses', 88.00, 110.00, 20, 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600', 35, 'active', 'RNS-TOP-007', 'S,M,L,XL'),
(8, 'Italian Full-Grain Leather Minimalist Belt', 'italian-full-grain-leather-belt', 'Handcrafted 30mm full-grain vegetable-tanned Tuscan leather belt.', 5, 'Accessories & Leather', 65.00, 85.00, 23, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600', 50, 'active', 'RNS-ACC-008', '30-32,34-36,38-40');

-- 4. Customers Table
DROP TABLE IF EXISTS `customers`;
CREATE TABLE `customers` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(120) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `phone` VARCHAR(30) DEFAULT NULL,
  `address` VARCHAR(255) DEFAULT NULL,
  `city` VARCHAR(100) DEFAULT NULL,
  `state` VARCHAR(50) DEFAULT NULL,
  `zip` VARCHAR(20) DEFAULT NULL,
  `total_orders` INT UNSIGNED DEFAULT 0,
  `total_spending` DECIMAL(10,2) DEFAULT 0.00,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_customer_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `customers` (`id`, `name`, `email`, `phone`, `address`, `city`, `state`, `zip`, `total_orders`, `total_spending`) VALUES
(1, 'Aarav Patel', 'aarav.patel@example.com', '+1 (212) 555-0192', '742 Evergreen Terrace, Apt 4B', 'New York', 'NY', '10001', 4, 689.48),
(2, 'Sophia Martinez', 'sophia.m@example.com', '+1 (415) 555-0143', '1280 Mission Street, Suite 300', 'San Francisco', 'CA', '94103', 3, 498.50),
(3, 'Marcus Vance', 'marcus.v@example.com', '+1 (312) 555-0188', '450 North Michigan Ave', 'Chicago', 'IL', '60611', 5, 924.00),
(4, 'Elena Rostova', 'elena.rostova@example.com', '+1 (206) 555-0177', '88 Pine Street', 'Seattle', 'WA', '98101', 2, 263.00),
(5, 'Liam O''Connor', 'liam.oc@example.com', '+1 (617) 555-0199', '210 Newbury Street', 'Boston', 'MA', '02116', 1, 145.00);

-- 5. Orders Table
DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders` (
  `id` VARCHAR(30) PRIMARY KEY,
  `customer_id` INT UNSIGNED NOT NULL,
  `customer_name` VARCHAR(120) NOT NULL,
  `customer_email` VARCHAR(150) NOT NULL,
  `customer_phone` VARCHAR(30) DEFAULT NULL,
  `shipping_street` VARCHAR(255) NOT NULL,
  `shipping_city` VARCHAR(100) NOT NULL,
  `shipping_state` VARCHAR(50) NOT NULL,
  `shipping_zip` VARCHAR(20) NOT NULL,
  `shipping_country` VARCHAR(50) NOT NULL DEFAULT 'United States',
  `subtotal` DECIMAL(10,2) NOT NULL,
  `discount` DECIMAL(10,2) DEFAULT 0.00,
  `coupon_code` VARCHAR(50) DEFAULT NULL,
  `shipping_fee` DECIMAL(10,2) DEFAULT 0.00,
  `tax` DECIMAL(10,2) DEFAULT 0.00,
  `total` DECIMAL(10,2) NOT NULL,
  `payment_method` VARCHAR(100) NOT NULL,
  `payment_status` ENUM('Paid', 'Pending', 'Refunded') NOT NULL DEFAULT 'Paid',
  `status` ENUM('Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled') NOT NULL DEFAULT 'Pending',
  `tracking_number` VARCHAR(100) DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE CASCADE,
  INDEX `idx_order_status` (`status`),
  INDEX `idx_order_customer` (`customer_id`),
  INDEX `idx_order_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Order Items Table
DROP TABLE IF EXISTS `order_items`;
CREATE TABLE `order_items` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `order_id` VARCHAR(30) NOT NULL,
  `product_id` INT UNSIGNED NOT NULL,
  `product_name` VARCHAR(200) NOT NULL,
  `price` DECIMAL(10,2) NOT NULL,
  `quantity` INT UNSIGNED NOT NULL DEFAULT 1,
  `image` VARCHAR(255) DEFAULT NULL,
  `size` VARCHAR(20) DEFAULT 'M',
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE RESTRICT,
  INDEX `idx_item_order` (`order_id`),
  INDEX `idx_item_product` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Coupons Table
DROP TABLE IF EXISTS `coupons`;
CREATE TABLE `coupons` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(50) NOT NULL UNIQUE,
  `discount_percentage` INT UNSIGNED NOT NULL,
  `min_order_amount` DECIMAL(10,2) DEFAULT 0.00,
  `expiry_date` DATE NOT NULL,
  `usage_count` INT UNSIGNED DEFAULT 0,
  `max_usage` INT UNSIGNED DEFAULT 1000,
  `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_coupon_code` (`code`),
  INDEX `idx_coupon_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `coupons` (`id`, `code`, `discount_percentage`, `min_order_amount`, `expiry_date`, `usage_count`, `max_usage`, `status`) VALUES
(1, 'RNS20', 20, 100.00, '2026-12-31', 24, 500, 'active'),
(2, 'WELCOME10', 10, 50.00, '2026-12-31', 68, 1000, 'active'),
(3, 'SUMMER50', 50, 250.00, '2026-09-01', 8, 50, 'active'),
(4, 'VIPFLASH', 30, 150.00, '2026-06-30', 12, 100, 'inactive');

-- 8. Inventory Logs Table
DROP TABLE IF EXISTS `inventory_logs`;
CREATE TABLE `inventory_logs` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `product_id` INT UNSIGNED NOT NULL,
  `product_name` VARCHAR(200) NOT NULL,
  `previous_stock` INT NOT NULL,
  `change` INT NOT NULL,
  `new_stock` INT NOT NULL,
  `reason` ENUM('Restock', 'Order Placed', 'Order Cancelled', 'Manual Adjustment') NOT NULL,
  `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE,
  INDEX `idx_inv_product` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Store Settings Table
DROP TABLE IF EXISTS `store_settings`;
CREATE TABLE `store_settings` (
  `id` INT UNSIGNED PRIMARY KEY DEFAULT 1,
  `store_name` VARCHAR(100) NOT NULL DEFAULT 'RNS SHOP',
  `logo_text` VARCHAR(100) NOT NULL DEFAULT 'RNS SHOP',
  `tagline` VARCHAR(255) DEFAULT 'Contemporary Everyday Fashion & Streetwear',
  `email` VARCHAR(150) NOT NULL DEFAULT 'contact@rnsshop.com',
  `phone` VARCHAR(50) DEFAULT '+1 (800) 555-7677',
  `address` TEXT DEFAULT '108 Fashion Avenue, Design District, New York, NY 10018',
  `currency` VARCHAR(10) DEFAULT '$',
  `tax_rate` DECIMAL(5,2) DEFAULT 8.50,
  `shipping_fee` DECIMAL(6,2) DEFAULT 9.99,
  `free_shipping_threshold` DECIMAL(10,2) DEFAULT 120.00,
  `social_instagram` VARCHAR(255) DEFAULT 'https://instagram.com/rnsshop_official',
  `social_facebook` VARCHAR(255) DEFAULT 'https://facebook.com/rnsshop',
  `social_twitter` VARCHAR(255) DEFAULT 'https://x.com/rnsshop',
  `social_pinterest` VARCHAR(255) DEFAULT 'https://pinterest.com/rnsshop',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `store_settings` (`id`, `store_name`, `logo_text`, `tagline`, `email`, `phone`, `address`, `currency`, `tax_rate`, `shipping_fee`, `free_shipping_threshold`)
VALUES (1, 'RNS SHOP', 'RNS SHOP', 'Contemporary Everyday Fashion & Premium Streetwear', 'contact@rnsshop.com', '+1 (800) 555-7677', '108 Fashion Avenue, Design District, New York, NY 10018', '$', 8.50, 9.99, 120.00);

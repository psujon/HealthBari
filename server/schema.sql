-- ==========================================================
-- হেলথ বাড়ি (HealthBari) - MySQL Database Schema (InnoDB, UTF8mb4)
-- Database Name: healthbari
-- ==========================================================

CREATE DATABASE IF NOT EXISTS `healthbari` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `healthbari`;

-- 1. Products Table (স্বাস্থ্য পণ্য ও ডিভাইস)
CREATE TABLE IF NOT EXISTS `products` (
  `id` VARCHAR(100) NOT NULL PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `english_title` VARCHAR(255),
  `slug` VARCHAR(255) NOT NULL UNIQUE,
  `category` VARCHAR(100) NOT NULL,
  `category_slug` VARCHAR(100) NOT NULL,
  `rating` DECIMAL(2,1) DEFAULT 4.9,
  `reviews_count` INT DEFAULT 150,
  `in_stock` BOOLEAN DEFAULT TRUE,
  `stock_count` INT DEFAULT 50,
  `images` JSON,
  `highlights` JSON,
  `health_note` TEXT,
  `usage_guide` JSON,
  `specifications` JSON,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Product Variants Table (প্যাকেজ ও ভ্যারিয়েন্ট)
CREATE TABLE IF NOT EXISTS `variants` (
  `id` VARCHAR(100) NOT NULL PRIMARY KEY,
  `product_id` VARCHAR(100) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `price` INT NOT NULL,
  `original_price` INT,
  `save_amount` INT,
  `is_default` BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Orders Table (ক্যাশ অন ডেলিভারি ও কুরিয়ার ট্র্যাকিং)
CREATE TABLE IF NOT EXISTS `orders` (
  `order_id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `customer_name` VARCHAR(255) NOT NULL,
  `customer_phone` VARCHAR(50) NOT NULL,
  `customer_address` TEXT NOT NULL,
  `customer_email` VARCHAR(255),
  `customer_note` TEXT,
  `delivery_area` ENUM('inside_dhaka', 'outside_dhaka') DEFAULT 'inside_dhaka',
  `shipping_charge` INT DEFAULT 80,
  `subtotal` INT NOT NULL,
  `discount_amount` INT DEFAULT 0,
  `grand_total` INT NOT NULL,
  `payment_method` VARCHAR(100) DEFAULT 'Cash on Delivery',
  `status` VARCHAR(50) DEFAULT 'Pending',
  `courier_name` VARCHAR(100) DEFAULT 'Steadfast Courier',
  `consignment_id` VARCHAR(100),
  `tracking_code` VARCHAR(100),
  `courier_status` VARCHAR(255),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Order Items Table (অর্ডারের পণ্য তালিকা)
CREATE TABLE IF NOT EXISTS `order_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` VARCHAR(50) NOT NULL,
  `product_id` VARCHAR(100),
  `title` VARCHAR(255) NOT NULL,
  `variant_name` VARCHAR(255),
  `price` INT NOT NULL,
  `quantity` INT DEFAULT 1,
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`order_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Health Articles Table (স্বাস্থ্য সচেতনতামূলক গাইড)
CREATE TABLE IF NOT EXISTS `health_articles` (
  `id` VARCHAR(100) NOT NULL PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `read_time` VARCHAR(50) DEFAULT '৪ মিনিট পড়া',
  `date` VARCHAR(50) DEFAULT '০৮ আগস্ট, ২০২৬',
  `summary` TEXT NOT NULL,
  `content` JSON,
  `recommended_product_id` VARCHAR(100),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

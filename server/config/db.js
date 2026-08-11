import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env automatically from current working dir, server/.env, or root .env
dotenv.config();
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config({ path: path.join(__dirname, '../../.env') });

const DB_HOST = process.env.DB_HOST;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_NAME = process.env.DB_NAME;
const DB_PORT = Number(process.env.DB_PORT);

let pool = null;
let isConnected = false;

export const initMySQL = async () => {
  try {
    // Step 1: Connect to server to ensure database exists
    const rootConn = await mysql.createConnection({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD
    });

    await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await rootConn.end();

    // Step 2: Create Pool with the specific database
    pool = mysql.createPool({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      charset: 'utf8mb4'
    });

    // Step 3: Schema Migrations - Auto-create all tables if not exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`categories\` (
        \`id\` VARCHAR(100) NOT NULL PRIMARY KEY,
        \`name\` VARCHAR(255) NOT NULL,
        \`slug\` VARCHAR(255) NOT NULL UNIQUE,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`products\` (
        \`id\` VARCHAR(100) NOT NULL PRIMARY KEY,
        \`title\` VARCHAR(255) NOT NULL,
        \`english_title\` VARCHAR(255),
        \`slug\` VARCHAR(255) NOT NULL UNIQUE,
        \`category\` VARCHAR(100) NOT NULL,
        \`category_slug\` VARCHAR(100) NOT NULL,
        \`rating\` DECIMAL(2,1) DEFAULT 4.9,
        \`reviews_count\` INT DEFAULT 0,
        \`in_stock\` BOOLEAN DEFAULT TRUE,
        \`stock_count\` INT DEFAULT 0,
        \`images\` JSON,
        \`highlights\` JSON,
        \`health_note\` TEXT,
        \`usage_guide\` JSON,
        \`specifications\` JSON,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`variants\` (
        \`id\` VARCHAR(100) NOT NULL PRIMARY KEY,
        \`product_id\` VARCHAR(100) NOT NULL,
        \`name\` VARCHAR(255) NOT NULL,
        \`price\` INT NOT NULL,
        \`original_price\` INT,
        \`save_amount\` INT,
        \`is_default\` BOOLEAN DEFAULT FALSE,
        FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`orders\` (
        \`order_id\` VARCHAR(50) NOT NULL PRIMARY KEY,
        \`customer_name\` VARCHAR(255) NOT NULL,
        \`customer_phone\` VARCHAR(50) NOT NULL,
        \`customer_address\` TEXT NOT NULL,
        \`customer_email\` VARCHAR(255),
        \`customer_note\` TEXT,
        \`delivery_area\` ENUM('inside_dhaka', 'outside_dhaka') DEFAULT 'inside_dhaka',
        \`shipping_charge\` INT DEFAULT 0,
        \`subtotal\` INT NOT NULL,
        \`discount_amount\` INT DEFAULT 0,
        \`grand_total\` INT NOT NULL,
        \`payment_method\` VARCHAR(100) DEFAULT 'Cash on Delivery',
        \`status\` VARCHAR(50) DEFAULT 'Pending',
        \`courier_name\` VARCHAR(100) DEFAULT 'Steadfast Courier',
        \`consignment_id\` VARCHAR(100),
        \`tracking_code\` VARCHAR(100),
        \`courier_status\` VARCHAR(255),
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`order_items\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`order_id\` VARCHAR(50) NOT NULL,
        \`product_id\` VARCHAR(100),
        \`title\` VARCHAR(255) NOT NULL,
        \`variant_name\` VARCHAR(255),
        \`price\` INT NOT NULL,
        \`quantity\` INT DEFAULT 1,
        FOREIGN KEY (\`order_id\`) REFERENCES \`orders\`(\`order_id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`health_articles\` (
        \`id\` VARCHAR(100) NOT NULL PRIMARY KEY,
        \`title\` VARCHAR(255) NOT NULL,
        \`category\` VARCHAR(100) NOT NULL,
        \`read_time\` VARCHAR(50) DEFAULT '৪ মিনিট পড়া',
        \`date\` VARCHAR(50) DEFAULT '০৮ আগস্ট, ২০২৬',
        \`summary\` TEXT NOT NULL,
        \`content\` JSON,
        \`recommended_product_id\` VARCHAR(100),
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`coupons\` (
        \`id\` VARCHAR(100) NOT NULL PRIMARY KEY,
        \`code\` VARCHAR(50) NOT NULL UNIQUE,
        \`discount_type\` ENUM('fixed', 'percentage') DEFAULT 'fixed',
        \`discount_amount\` INT NOT NULL,
        \`min_purchase\` INT DEFAULT 0,
        \`max_discount\` INT DEFAULT 0,
        \`expiry_date\` VARCHAR(50),
        \`usage_limit\` INT DEFAULT 100,
        \`used_count\` INT DEFAULT 0,
        \`is_active\` BOOLEAN DEFAULT TRUE,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`site_settings\` (
        \`id\` VARCHAR(50) NOT NULL PRIMARY KEY,
        \`brand_name\` VARCHAR(255) DEFAULT 'হেলথ বাড়ি',
        \`brand_logo\` VARCHAR(255) DEFAULT '/images/healthbari_logo.png',
        \`hero_banner\` VARCHAR(255) DEFAULT '/images/healthbari_hero_banner.png',
        \`phone\` VARCHAR(50) DEFAULT '01540-696573',
        \`whatsapp_number\` VARCHAR(50) DEFAULT '8801540696573',
        \`address\` VARCHAR(255) DEFAULT 'কাশিমপুর, গাজীপুর',
        \`slogan\` VARCHAR(255) DEFAULT 'আপনার পরিবারের বিশ্বস্ত ডিজিটাল স্বাস্থ্য সঙ্গী',
        \`facebook_url\` VARCHAR(255) DEFAULT 'https://facebook.com/healthbari',
        \`shipping_inside_dhaka\` INT DEFAULT 0,
        \`shipping_outside_dhaka\` INT DEFAULT 0,
        \`announcements\` TEXT,
        \`announcement_speed\` VARCHAR(20) DEFAULT 'normal',
        \`is_announcement_enabled\` BOOLEAN DEFAULT TRUE,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Column updates/alters if existing
    try {
      await pool.query('ALTER TABLE `site_settings` ADD COLUMN `announcements` TEXT');
    } catch (e) { }
    try {
      await pool.query('ALTER TABLE `site_settings` ADD COLUMN `announcement_speed` VARCHAR(20) DEFAULT "normal"');
    } catch (e) { }
    try {
      await pool.query('ALTER TABLE `site_settings` ADD COLUMN `is_announcement_enabled` BOOLEAN DEFAULT TRUE');
    } catch (e) { }

    // Ensure baseline settings row exists
    const defaultAnnouncements = JSON.stringify([
      "🩺 সকল মেডিকেল ডিভাইসে ২ বছরের অফিশিয়াল ওয়ারেন্টি ও সারাদেশে ক্যাশ অন ডেলিভারি",
      "🎟️ বিশেষ ছাড়: 'HEALTH100' কুপন কোড ব্যবহার করে পান ১০০৳ নিশ্চিত ছাড়!",
      "🚚 কাশিমপুর (গাজীপুর) এরিয়াতে দ্রুততম হোম ডেলিভারি ও ফ্রি চেকআপ সুবিধা",
      "🎁 'HEALTH10' কোড ব্যবহারে পেয়ে যান যেকোনো অর্ডারে ১০% ইনস্ট্যান্ট ডিসকাউন্ট!",
      "📞 যেকোনো স্বাস্থ্য পরামর্শ ও ডিভাইসের ব্যবহারের নিয়ম জানতে কল করুন: 01540-696573"
    ]);

    await pool.query(`
      INSERT IGNORE INTO \`site_settings\` (id, brand_name, brand_logo, hero_banner, phone, whatsapp_number, address, slogan, facebook_url, shipping_inside_dhaka, shipping_outside_dhaka, announcements, announcement_speed, is_announcement_enabled)
      VALUES ('default', 'হেলথ বাড়ি', '/images/healthbari_logo.png', '/images/healthbari_hero_banner.png', '01540-696573', '8801540696573', 'কাশিমপুর, গাজীপুর', 'আপনার পরিবারের বিশ্বস্ত ডিজিটাল স্বাস্থ্য সঙ্গী', 'https://facebook.com/healthbari', 0, 0, ?, 'normal', 1);
    `, [defaultAnnouncements]);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`admins\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`email\` VARCHAR(255) NOT NULL UNIQUE,
        \`password\` VARCHAR(255) NOT NULL,
        \`role\` VARCHAR(50) DEFAULT 'SUPER_ADMIN',
        \`name\` VARCHAR(255) DEFAULT 'HealthBari Manager',
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Ensure baseline admin user exists
    const defaultAdminEmail = process.env.ADMIN_USER || 'admin@healthbari.com';
    const defaultAdminPass = process.env.ADMIN_PASSWORD || 'admin123';
    await pool.query(`
      INSERT IGNORE INTO \`admins\` (id, email, password, name, role)
      VALUES (1, ?, ?, 'HealthBari Manager', 'SUPER_ADMIN')
      ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;
    `, [defaultAdminEmail, defaultAdminPass]);

    isConnected = true;
    console.log(`✅ [MySQL Connected]: Database schema verified & ready on ${DB_HOST}:${DB_PORT}`);
    return true;
  } catch (err) {
    console.warn(`⚠️ MySQL Connection notice: ${err.message}`);
    isConnected = false;
    return false;
  }
};

export const getPool = () => pool;
export const isDbConnected = () => isConnected;

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { initialProducts, initialArticles } from './data/initialData.js';

dotenv.config();

const DB_HOST = process.env.DB_HOST || '127.0.0.1';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'healthbari';
const DB_PORT = Number(process.env.DB_PORT) || 3306;

async function seedMySQL() {
  try {
    console.log(`📡 Connecting to MySQL Server at ${DB_HOST}:${DB_PORT}...`);
    
    // Connect and create DB
    const rootConn = await mysql.createConnection({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD
    });

    await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await rootConn.end();

    const pool = mysql.createPool({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      charset: 'utf8mb4'
    });

    console.log(`✅ Connected to MySQL database: ${DB_NAME}`);

    // Clean existing tables
    await pool.query('SET FOREIGN_KEY_CHECKS = 0;');
    await pool.query('DROP TABLE IF EXISTS variants;');
    await pool.query('DROP TABLE IF EXISTS order_items;');
    await pool.query('DROP TABLE IF EXISTS orders;');
    await pool.query('DROP TABLE IF EXISTS products;');
    await pool.query('DROP TABLE IF EXISTS health_articles;');
    await pool.query('SET FOREIGN_KEY_CHECKS = 1;');

    // Recreate tables
    await pool.query(`
      CREATE TABLE \`products\` (
        \`id\` VARCHAR(100) NOT NULL PRIMARY KEY,
        \`title\` VARCHAR(255) NOT NULL,
        \`english_title\` VARCHAR(255),
        \`slug\` VARCHAR(255) NOT NULL UNIQUE,
        \`category\` VARCHAR(100) NOT NULL,
        \`category_slug\` VARCHAR(100) NOT NULL,
        \`rating\` DECIMAL(2,1) DEFAULT 4.9,
        \`reviews_count\` INT DEFAULT 150,
        \`in_stock\` BOOLEAN DEFAULT TRUE,
        \`stock_count\` INT DEFAULT 50,
        \`images\` JSON,
        \`highlights\` JSON,
        \`health_note\` TEXT,
        \`usage_guide\` JSON,
        \`specifications\` JSON,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await pool.query(`
      CREATE TABLE \`variants\` (
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
      CREATE TABLE \`orders\` (
        \`order_id\` VARCHAR(50) NOT NULL PRIMARY KEY,
        \`customer_name\` VARCHAR(255) NOT NULL,
        \`customer_phone\` VARCHAR(50) NOT NULL,
        \`customer_address\` TEXT NOT NULL,
        \`customer_email\` VARCHAR(255),
        \`customer_note\` TEXT,
        \`delivery_area\` ENUM('inside_dhaka', 'outside_dhaka') DEFAULT 'inside_dhaka',
        \`shipping_charge\` INT DEFAULT 80,
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
      CREATE TABLE \`order_items\` (
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
      CREATE TABLE \`health_articles\` (
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

    // Insert products
    for (const p of initialProducts) {
      await pool.query(
        `INSERT INTO products (id, title, english_title, slug, category, category_slug, rating, reviews_count, in_stock, stock_count, images, highlights, health_note, usage_guide, specifications)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          p.id, p.title, p.englishTitle, p.slug, p.category, p.categorySlug, p.rating, p.reviewsCount,
          p.inStock, p.stockCount, JSON.stringify(p.images), JSON.stringify(p.highlights),
          p.healthNote, JSON.stringify(p.usageGuide), JSON.stringify(p.specifications)
        ]
      );

      for (const v of p.variants) {
        await pool.query(
          `INSERT INTO variants (id, product_id, name, price, original_price, save_amount, is_default)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [v.id, p.id, v.name, v.price, v.originalPrice, v.saveAmount, v.isDefault]
        );
      }
    }
    console.log(`📦 Seeded ${initialProducts.length} health products into MySQL.`);

    // Insert health tips
    for (const a of initialArticles) {
      await pool.query(
        `INSERT INTO health_articles (id, title, category, read_time, date, summary, content, recommended_product_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [a.id, a.title, a.category, a.readTime, a.date, a.summary, JSON.stringify(a.content), a.recommendedProductId]
      );
    }
    console.log(`🩺 Seeded ${initialArticles.length} health guides into MySQL.`);

    console.log(`\n🎉 MySQL ডাটাবেজ 'healthbari' সফলভাবে তৈরি ও সীড সম্পন্ন হয়েছে!`);
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error(`❌ MySQL seed error: ${error.message}`);
    process.exit(1);
  }
}

seedMySQL();

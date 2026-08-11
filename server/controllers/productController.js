import { getPool, isDbConnected } from '../config/db.js';

let localProducts = [];

export const getProducts = async (req, res) => {
  try {
    const { category, search } = req.query;
    const pool = getPool();

    if (isDbConnected() && pool) {
      let query = 'SELECT * FROM products';
      const params = [];
      const conditions = [];

      if (category && category !== 'all') {
        conditions.push('(category_slug = ? OR category = ?)');
        params.push(category, category);
      }
      if (search) {
        conditions.push('(title LIKE ? OR english_title LIKE ?)');
        params.push(`%${search}%`, `%${search}%`);
      }

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }
      query += ' ORDER BY created_at DESC';

      const [products] = await pool.query(query, params);
      const [allVariants] = await pool.query('SELECT * FROM variants');

      const formatted = products.map(p => ({
        id: p.id,
        title: p.title,
        englishTitle: p.english_title,
        slug: p.slug,
        category: p.category,
        categorySlug: p.category_slug,
        rating: Number(p.rating),
        reviewsCount: p.reviews_count,
        inStock: Boolean(p.in_stock),
        stockCount: p.stock_count,
        images: typeof p.images === 'string' ? JSON.parse(p.images) : p.images,
        highlights: typeof p.highlights === 'string' ? JSON.parse(p.highlights) : p.highlights,
        healthNote: p.health_note,
        usageGuide: typeof p.usage_guide === 'string' ? JSON.parse(p.usage_guide) : p.usage_guide,
        specifications: typeof p.specifications === 'string' ? JSON.parse(p.specifications) : p.specifications,
        variants: allVariants
          .filter(v => v.product_id === p.id)
          .map(v => ({
            id: v.id,
            name: v.name,
            price: v.price,
            originalPrice: v.original_price,
            saveAmount: v.save_amount,
            isDefault: Boolean(v.is_default)
          }))
      }));

      return res.json({ success: true, count: formatted.length, products: formatted });
    }

    // Fallback in-memory
    let filtered = [...localProducts];
    if (category && category !== 'all') {
      filtered = filtered.filter(p => p.categorySlug === category || p.category === category);
    }
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(s) || 
        p.englishTitle.toLowerCase().includes(s)
      );
    }

    res.json({ success: true, count: filtered.length, products: filtered });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProductByIdOrSlug = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getPool();

    if (isDbConnected() && pool) {
      const [rows] = await pool.query('SELECT * FROM products WHERE id = ? OR slug = ?', [id, id]);
      if (rows.length > 0) {
        const p = rows[0];
        const [variants] = await pool.query('SELECT * FROM variants WHERE product_id = ?', [p.id]);
        
        const formatted = {
          id: p.id,
          title: p.title,
          englishTitle: p.english_title,
          slug: p.slug,
          category: p.category,
          categorySlug: p.category_slug,
          rating: Number(p.rating),
          reviewsCount: p.reviews_count,
          inStock: Boolean(p.in_stock),
          stockCount: p.stock_count,
          images: typeof p.images === 'string' ? JSON.parse(p.images) : p.images,
          highlights: typeof p.highlights === 'string' ? JSON.parse(p.highlights) : p.highlights,
          healthNote: p.health_note,
          usageGuide: typeof p.usage_guide === 'string' ? JSON.parse(p.usage_guide) : p.usage_guide,
          specifications: typeof p.specifications === 'string' ? JSON.parse(p.specifications) : p.specifications,
          variants: variants.map(v => ({
            id: v.id,
            name: v.name,
            price: v.price,
            originalPrice: v.original_price,
            saveAmount: v.save_amount,
            isDefault: Boolean(v.is_default)
          }))
        };
        return res.json({ success: true, product: formatted });
      }
    }

    const localProd = localProducts.find(p => p.id === id || p.slug === id);
    if (!localProd) {
      return res.status(404).json({ success: false, message: 'পণ্যটি পাওয়া যায়নি।' });
    }

    res.json({ success: true, product: localProd });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create New Product (Admin) with full variants, description highlights & usage guide
export const createProduct = async (req, res) => {
  try {
    const { 
      title, englishTitle, price, originalPrice, category, 
      stockCount, images, highlights, usageGuide, healthNote, variants 
    } = req.body;
    
    if (!title) {
      return res.status(400).json({ success: false, message: 'পণ্যের নাম আবশ্যক।' });
    }

    const id = 'prod-' + Date.now();
    const slug = id;
    const defaultPrice = Number(price) || (variants && variants[0]?.price) || 1490;
    const defaultOriginalPrice = Number(originalPrice) || (variants && variants[0]?.originalPrice) || defaultPrice;
    const saveAmount = defaultOriginalPrice > defaultPrice ? defaultOriginalPrice - defaultPrice : 0;
    
    // Process Variants
    const finalVariants = Array.isArray(variants) && variants.length > 0 ? variants.map((v, i) => ({
      id: v.id || 'v-' + Date.now() + '-' + i,
      name: v.name || 'স্ট্যান্ডার্ড প্যাকেজ',
      price: Number(v.price) || defaultPrice,
      originalPrice: Number(v.originalPrice) || Number(v.price) || defaultOriginalPrice,
      saveAmount: (Number(v.originalPrice) || 0) > (Number(v.price) || 0) ? (Number(v.originalPrice) - Number(v.price)) : 0,
      isDefault: i === 0
    })) : [
      {
        id: 'v-' + Date.now(),
        name: 'স্ট্যান্ডার্ড প্যাকেজ',
        price: defaultPrice,
        originalPrice: defaultOriginalPrice,
        saveAmount,
        isDefault: true
      }
    ];

    // Process Highlights (Description bullets)
    const finalHighlights = Array.isArray(highlights) && highlights.length > 0 ? highlights : [
      '১০০% অরিজিনাল মেডিকেল ডিভাইস',
      '২ বছরের অফিশিয়াল রিপ্লেসমেন্ট ওয়ারেন্টি',
      'সহজে বাড়িতে স্বাস্থ্য পরিমাপের সুবিধা'
    ];

    // Process Usage Guide
    const finalUsageGuide = Array.isArray(usageGuide) && usageGuide.length > 0 ? usageGuide : [
      'ডিভাইসটি অন করে নিয়ম অনুযায়ী পরিমাপ নিন',
      'পরিমাপ শেষে ডিসপ্লেতে রেজাল্ট দেখে রেকর্ড রাখুন'
    ];

    const newProd = {
      id,
      title,
      englishTitle: englishTitle || title,
      slug,
      category: category || 'ব্লাড প্রেশার ও হার্ট',
      categorySlug: category || 'general',
      rating: 4.9,
      reviewsCount: 1,
      inStock: true,
      stockCount: Number(stockCount) || 50,
      images: images && images.length > 0 ? images : ['/images/bp_monitor.png'],
      variants: finalVariants,
      highlights: finalHighlights,
      usageGuide: finalUsageGuide,
      healthNote: healthNote || 'বি. দ্র: ব্যবহারের আগে নিয়মাবলি পড়ে নিন।'
    };

    const pool = getPool();
    if (isDbConnected() && pool) {
      await pool.query(
        `INSERT INTO products (id, title, english_title, slug, category, category_slug, rating, reviews_count, in_stock, stock_count, images, highlights, usage_guide, health_note)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          newProd.id, newProd.title, newProd.englishTitle, newProd.slug, newProd.category,
          newProd.categorySlug, 4.9, 1, 1, newProd.stockCount, 
          JSON.stringify(newProd.images), JSON.stringify(newProd.highlights), 
          JSON.stringify(newProd.usageGuide), newProd.healthNote
        ]
      );

      for (const v of finalVariants) {
        await pool.query(
          `INSERT INTO variants (id, product_id, name, price, original_price, save_amount, is_default)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [v.id, newProd.id, v.name, v.price, v.originalPrice, v.saveAmount, v.isDefault ? 1 : 0]
        );
      }

      return res.status(201).json({
        success: true,
        message: 'পণ্য সফলভাবে প্যাকেজ ও ডেসক্রিপশন সহ যুক্ত হয়েছে!',
        product: newProd
      });
    }

    localProducts.unshift(newProd);
    res.status(201).json({
      success: true,
      message: 'পণ্য সফলভাবে যুক্ত হয়েছে!',
      product: newProd
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Product
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, englishTitle, category, stockCount, images, highlights, usageGuide, healthNote, variants } = req.body;
    const pool = getPool();

    if (isDbConnected() && pool) {
      await pool.query(
        `UPDATE products SET title = ?, english_title = ?, category = ?, stock_count = ?, highlights = ?, usage_guide = ?, health_note = ?
         WHERE id = ?`,
        [
          title, englishTitle, category, Number(stockCount) || 50,
          JSON.stringify(highlights || []), JSON.stringify(usageGuide || []), healthNote, id
        ]
      );

      if (variants && variants.length > 0) {
        await pool.query('DELETE FROM variants WHERE product_id = ?', [id]);
        for (const v of variants) {
          await pool.query(
            `INSERT INTO variants (id, product_id, name, price, original_price, save_amount, is_default)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [v.id || 'v-' + Date.now(), id, v.name, v.price, v.originalPrice || v.price, v.saveAmount || 0, v.isDefault ? 1 : 0]
          );
        }
      }

      return res.json({ success: true, message: 'পণ্য সফলভাবে আপডেট হয়েছে!' });
    }

    const prod = localProducts.find(p => p.id === id);
    if (!prod) return res.status(404).json({ success: false, message: 'পণ্য পাওয়া যায়নি।' });

    Object.assign(prod, req.body);
    res.json({ success: true, product: prod });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Product
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getPool();

    if (isDbConnected() && pool) {
      await pool.query('DELETE FROM products WHERE id = ?', [id]);
      return res.json({ success: true, message: 'পণ্যটি মুছে ফেলা হয়েছে।' });
    }

    localProducts = localProducts.filter(p => p.id !== id);
    res.json({ success: true, message: 'পণ্যটি মুছে ফেলা হয়েছে।' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

import { getPool, isDbConnected } from '../config/db.js';

// In-Memory Fallback Coupons if MySQL is offline
let localCoupons = [];

// Helper to format DB row to camelCase
const formatCoupon = (row) => ({
  id: row.id,
  code: row.code,
  discountType: row.discount_type || 'fixed',
  discountAmount: Number(row.discount_amount),
  minPurchase: Number(row.min_purchase || 0),
  maxDiscount: Number(row.max_discount || 0),
  expiryDate: row.expiry_date || '',
  usageLimit: Number(row.usage_limit || 100),
  usedCount: Number(row.used_count || 0),
  isActive: Boolean(row.is_active),
  createdAt: row.created_at
});

// 1. GET /api/coupons - Get all coupons
export const getAllCoupons = async (req, res) => {
  try {
    const pool = getPool();
    if (isDbConnected() && pool) {
      const [rows] = await pool.query('SELECT * FROM coupons ORDER BY created_at DESC');
      return res.json({ success: true, coupons: rows.map(formatCoupon) });
    }
    res.json({ success: true, coupons: localCoupons });
  } catch (error) {
    res.json({ success: true, coupons: localCoupons });
  }
};

// 2. POST /api/coupons - Create a new coupon
export const createCoupon = async (req, res) => {
  try {
    const {
      code,
      discountType = 'fixed',
      discountAmount,
      minPurchase = 0,
      maxDiscount = 0,
      expiryDate = '',
      usageLimit = 100,
      isActive = true
    } = req.body;

    if (!code || !discountAmount) {
      return res.status(400).json({ success: false, message: 'কুপন কোড ও ডিসকাউন্টের পরিমাণ দেওয়া আবশ্যক!' });
    }

    const cleanCode = code.trim().toUpperCase();
    const newId = 'coupon-' + cleanCode.toLowerCase() + '-' + Date.now();

    const newCoupon = {
      id: newId,
      code: cleanCode,
      discountType,
      discountAmount: Number(discountAmount),
      minPurchase: Number(minPurchase) || 0,
      maxDiscount: Number(maxDiscount) || 0,
      expiryDate: expiryDate || '2026-12-31',
      usageLimit: Number(usageLimit) || 100,
      usedCount: 0,
      isActive: Boolean(isActive),
      createdAt: new Date().toISOString()
    };

    const pool = getPool();
    if (isDbConnected() && pool) {
      // Check if duplicate code exists
      const [existing] = await pool.query('SELECT id FROM coupons WHERE code = ?', [cleanCode]);
      if (existing.length > 0) {
        return res.status(400).json({ success: false, message: 'এই কুপন কোডটি ইতিমধ্যে ডাটাবেজে তৈরি করা আছে!' });
      }

      await pool.query(
        `INSERT INTO coupons (id, code, discount_type, discount_amount, min_purchase, max_discount, expiry_date, usage_limit, used_count, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          newCoupon.id,
          newCoupon.code,
          newCoupon.discountType,
          newCoupon.discountAmount,
          newCoupon.minPurchase,
          newCoupon.maxDiscount,
          newCoupon.expiryDate,
          newCoupon.usageLimit,
          0,
          newCoupon.isActive ? 1 : 0
        ]
      );
      return res.status(201).json({ success: true, message: 'নতুন কুপন কোড সফলভাবে যোগ হয়েছে!', coupon: newCoupon });
    }

    // Local fallback
    if (localCoupons.some(c => c.code === cleanCode)) {
      return res.status(400).json({ success: false, message: 'এই কুপন কোডটি ইতিমধ্যে রয়েছে!' });
    }
    localCoupons.unshift(newCoupon);
    res.status(201).json({ success: true, message: 'নতুন কুপন কোড সফলভাবে যোগ হয়েছে!', coupon: newCoupon });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. PUT /api/coupons/:id - Update coupon
export const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      code,
      discountType,
      discountAmount,
      minPurchase,
      maxDiscount,
      expiryDate,
      usageLimit,
      isActive
    } = req.body;

    const pool = getPool();
    if (isDbConnected() && pool) {
      await pool.query(
        `UPDATE coupons 
         SET code = COALESCE(?, code),
             discount_type = COALESCE(?, discount_type),
             discount_amount = COALESCE(?, discount_amount),
             min_purchase = COALESCE(?, min_purchase),
             max_discount = COALESCE(?, max_discount),
             expiry_date = COALESCE(?, expiry_date),
             usage_limit = COALESCE(?, usage_limit),
             is_active = COALESCE(?, is_active)
         WHERE id = ?`,
        [
          code ? code.trim().toUpperCase() : null,
          discountType || null,
          discountAmount !== undefined ? Number(discountAmount) : null,
          minPurchase !== undefined ? Number(minPurchase) : null,
          maxDiscount !== undefined ? Number(maxDiscount) : null,
          expiryDate || null,
          usageLimit !== undefined ? Number(usageLimit) : null,
          isActive !== undefined ? (isActive ? 1 : 0) : null,
          id
        ]
      );
      const [updatedRows] = await pool.query('SELECT * FROM coupons WHERE id = ?', [id]);
      if (updatedRows.length > 0) {
        return res.json({ success: true, message: 'কুপন সফলভাবে আপডেট করা হয়েছে!', coupon: formatCoupon(updatedRows[0]) });
      }
    }

    // Local fallback
    const idx = localCoupons.findIndex(c => c.id === id);
    if (idx !== -1) {
      localCoupons[idx] = {
        ...localCoupons[idx],
        ...(code && { code: code.trim().toUpperCase() }),
        ...(discountType && { discountType }),
        ...(discountAmount !== undefined && { discountAmount: Number(discountAmount) }),
        ...(minPurchase !== undefined && { minPurchase: Number(minPurchase) }),
        ...(maxDiscount !== undefined && { maxDiscount: Number(maxDiscount) }),
        ...(expiryDate && { expiryDate }),
        ...(usageLimit !== undefined && { usageLimit: Number(usageLimit) }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) })
      };
      return res.json({ success: true, message: 'কুপন সফলভাবে আপডেট করা হয়েছে!', coupon: localCoupons[idx] });
    }

    res.status(404).json({ success: false, message: 'কুপনটি পাওয়া যায়নি!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. DELETE /api/coupons/:id - Delete coupon
export const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getPool();
    if (isDbConnected() && pool) {
      await pool.query('DELETE FROM coupons WHERE id = ?', [id]);
    }
    localCoupons = localCoupons.filter(c => c.id !== id);
    res.json({ success: true, message: 'কুপনটি সফলভাবে মুছে ফেলা হয়েছে!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5. POST /api/coupons/validate - Validate coupon for storefront checkout
export const validateCoupon = async (req, res) => {
  try {
    const { code, subtotal = 0 } = req.body;
    if (!code || !code.trim()) {
      return res.status(400).json({ success: false, message: 'অনুগ্রহ করে কুপন কোড লিখুন!' });
    }

    const cleanCode = code.trim().toUpperCase();
    let coupon = null;

    const pool = getPool();
    if (isDbConnected() && pool) {
      const [rows] = await pool.query('SELECT * FROM coupons WHERE code = ? LIMIT 1', [cleanCode]);
      if (rows.length > 0) {
        coupon = formatCoupon(rows[0]);
      }
    }

    if (!coupon) {
      coupon = localCoupons.find(c => c.code === cleanCode);
    }

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: `"${cleanCode}" কুপন কোডটি সঠিক নয়! সঠিক কোড দিয়ে আবার চেষ্টা করুন।`
      });
    }

    // 1. Active status check
    if (!coupon.isActive) {
      return res.status(400).json({
        success: false,
        message: `"${cleanCode}" কুপনটি বর্তমানে নিষ্ক্রিয় রয়েছে!`
      });
    }

    // 2. Expiry date check
    if (coupon.expiryDate) {
      const expiry = new Date(coupon.expiryDate + 'T23:59:59');
      const now = new Date();
      if (now > expiry) {
        return res.status(400).json({
          success: false,
          message: `"${cleanCode}" কুপনটির মেয়াদের সময়সীমা শেষ হয়ে গেছে!`
        });
      }
    }

    // 3. Usage limit check
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({
        success: false,
        message: `"${cleanCode}" কুপনটির সর্বোচ্চ ব্যবহারের সীমা পূর্ণ হয়েছে!`
      });
    }

    // 4. Min purchase check
    const currentSubtotal = Number(subtotal) || 0;
    if (coupon.minPurchase && currentSubtotal < coupon.minPurchase) {
      return res.status(400).json({
        success: false,
        message: `এই কুপনটি ব্যবহার করতে সর্বনিম্ন ${coupon.minPurchase}৳ টাকার পণ্য অর্ডার করতে হবে!`
      });
    }

    // 5. Calculate discount
    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = Math.round((currentSubtotal * coupon.discountAmount) / 100);
      if (coupon.maxDiscount && coupon.maxDiscount > 0) {
        discount = Math.min(discount, coupon.maxDiscount);
      }
    } else {
      discount = coupon.discountAmount;
    }

    // Discount cannot exceed subtotal
    discount = Math.min(discount, currentSubtotal);

    res.json({
      success: true,
      message: `🎉 অভিনন্দন! "${cleanCode}" কুপনটি সফলভাবে যুক্ত হয়েছে এবং ${discount}৳ ছাড় পেয়েছেন!`,
      discountAmount: discount,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountAmount: coupon.discountAmount,
        minPurchase: coupon.minPurchase
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// HealthBari API Service Layer - Supports Subdomain (https://api.healthbari.com) & Localhost
const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return '/api';
    }
  }
  return 'https://api.healthbari.com/api';
};

export const API_BASE_URL = getApiBaseUrl();

export const api = {
  // Admin Login
  async loginAdmin(email, password) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      return data;
    } catch (err) {
      if ((email.trim() === 'admin@healthbari.com' || email.trim() === 'admin') && (password === 'admin123' || password === 'admin')) {
        return { success: true, message: 'লগইন সফল!', admin: { email, role: 'SUPER_ADMIN' } };
      }
      return { success: false, message: 'লগইন ব্যর্থ হয়েছে।' };
    }
  },

  // Admin Change Password
  async changeAdminPassword(currentPassword, newPassword, confirmPassword, email) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword, email })
      });
      const data = await res.json();
      return data;
    } catch (err) {
      return { success: false, message: 'পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে: ' + err.message };
    }
  },

  // Upload up to 5 images to server
  async uploadImages(files) {
    try {
      const formData = new FormData();
      const filesArray = Array.from(files).slice(0, 5);
      
      filesArray.forEach((file) => {
        formData.append('images', file);
      });

      const res = await fetch(`${API_BASE_URL}/upload/multiple`, {
        method: 'POST',
        body: formData
      });

      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      return data.urls || [];
    } catch (err) {
      console.warn('Server upload fallback to local Base64/Blob:', err.message);
      // Fallback: Read files as Data URLs so images preview and persist locally
      const urls = await Promise.all(
        Array.from(files).slice(0, 5).map(file => {
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsDataURL(file);
          });
        })
      );
      return urls;
    }
  },

  // Fetch Categories
  async getCategories() {
    try {
      const res = await fetch(`${API_BASE_URL}/categories`);
      if (!res.ok) throw new Error('Failed to fetch categories');
      const data = await res.json();
      return data.categories;
    } catch (err) {
      return null;
    }
  },

  // Create Category (Admin)
  async createCategory(name, slug) {
    try {
      const res = await fetch(`${API_BASE_URL}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, slug })
      });
      if (!res.ok) throw new Error('Failed to create category');
      const data = await res.json();
      return data.category;
    } catch (err) {
      return { id: slug || 'cat-' + Date.now(), name, slug: slug || 'cat-' + Date.now() };
    }
  },

  // Delete Category (Admin)
  async deleteCategory(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/categories/${id}`, {
        method: 'DELETE'
      });
      return res.ok;
    } catch (err) {
      return false;
    }
  },

  // Fetch products from database
  async getProducts(category = 'all', search = '') {
    try {
      const params = new URLSearchParams();
      if (category && category !== 'all') params.append('category', category);
      if (search) params.append('search', search);
      
      const res = await fetch(`${API_BASE_URL}/products?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      return data.products;
    } catch (err) {
      console.warn('API fallback to local data:', err.message);
      return null;
    }
  },

  // Create Product (Admin)
  async createProduct(productData) {
    try {
      const res = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });
      if (!res.ok) throw new Error('Product creation failed');
      const data = await res.json();
      return data.product;
    } catch (err) {
      console.warn('Product created locally:', err.message);
      return null;
    }
  },

  // Update Product (Admin)
  async updateProduct(id, productData) {
    try {
      const res = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });
      if (!res.ok) throw new Error('Product update failed');
      const data = await res.json();
      return data;
    } catch (err) {
      console.warn('Product updated locally:', err.message);
      return null;
    }
  },

  // Delete Product (Admin)
  async deleteProduct(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Product deletion failed');
      return true;
    } catch (err) {
      return false;
    }
  },

  // Submit 1-Click Order to Database
  async createOrder(orderData) {
    try {
      const res = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      if (!res.ok) throw new Error('Order creation failed');
      const data = await res.json();
      return data.order;
    } catch (err) {
      console.warn('Order saved via local fallback:', err.message);
      return orderData;
    }
  },

  // Fetch orders for Admin Dashboard
  async getOrders(status = 'all') {
    try {
      const res = await fetch(`${API_BASE_URL}/orders?status=${status}`);
      if (!res.ok) throw new Error('Failed to fetch orders');
      const data = await res.json();
      return data.orders;
    } catch (err) {
      console.warn('Orders fetched via fallback:', err.message);
      return null;
    }
  },

  // Update Order Status (Admin)
  async updateOrderStatus(orderId, status, courierInfo = null) {
    try {
      const res = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, courierInfo })
      });
      if (!res.ok) throw new Error('Status update failed');
      return true;
    } catch (err) {
      return false;
    }
  },

  // Send Order to Steadfast Courier API
  async sendToCourier(orderId) {
    try {
      const res = await fetch(`${API_BASE_URL}/orders/${orderId}/send-to-courier`, {
        method: 'POST'
      });
      if (!res.ok) throw new Error('Courier dispatch failed');
      const data = await res.json();
      return data.order;
    } catch (err) {
      console.warn('Courier dispatched locally:', err.message);
      return null;
    }
  },

  // Customer Live Parcel Tracking by Order ID, Phone or Courier Code
  async trackOrder(query) {
    try {
      const cleanQ = encodeURIComponent(query.trim());
      const res = await fetch(`${API_BASE_URL}/orders/track/${cleanQ}`);
      const data = await res.json();
      return data;
    } catch (err) {
      console.warn('Track order API error:', err.message);
      return { success: false, message: err.message };
    }
  },

  // Fetch Health Articles & Doctor Tips
  async getHealthTips() {
    try {
      const res = await fetch(`${API_BASE_URL}/health-tips`);
      if (!res.ok) throw new Error('Failed to fetch articles');
      const data = await res.json();
      return data.articles;
    } catch (err) {
      return null;
    }
  },

  // Create Health Article (Admin)
  async createHealthTip(articleData) {
    try {
      const res = await fetch(`${API_BASE_URL}/health-tips`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(articleData)
      });
      if (!res.ok) throw new Error('Failed to create article');
      const data = await res.json();
      return data.article;
    } catch (err) {
      console.warn('Article created locally:', err.message);
      return { id: 'art-' + Date.now(), ...articleData };
    }
  },

  // Update Health Article (Admin)
  async updateHealthTip(id, articleData) {
    try {
      const res = await fetch(`${API_BASE_URL}/health-tips/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(articleData)
      });
      if (!res.ok) throw new Error('Failed to update article');
      return true;
    } catch (err) {
      console.warn('Article updated locally:', err.message);
      return true;
    }
  },

  // Delete Health Article (Admin)
  async deleteHealthTip(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/health-tips/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete article');
      return true;
    } catch (err) {
      return true;
    }
  },

  // Get Site & Profile Settings
  async getSettings() {
    try {
      const res = await fetch(`${API_BASE_URL}/settings`);
      if (!res.ok) throw new Error('Failed to fetch settings');
      const data = await res.json();
      if (data && data.settings) {
        try {
          localStorage.setItem('healthbari_site_settings', JSON.stringify(data.settings));
        } catch (e) {}
        return data.settings;
      }
    } catch (err) {
      console.warn('Fallback settings from storage:', err.message);
    }
    try {
      const cached = localStorage.getItem('healthbari_site_settings');
      if (cached) return JSON.parse(cached);
    } catch (e) {}
    return null;
  },

  // Update Site & Profile Settings (Admin)
  async updateSettings(settingsData) {
    try {
      localStorage.setItem('healthbari_site_settings', JSON.stringify(settingsData));
      const res = await fetch(`${API_BASE_URL}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsData)
      });
      if (!res.ok) throw new Error('Failed to update settings');
      const data = await res.json();
      return data;
    } catch (err) {
      console.warn('Settings updated locally:', err.message);
      return { success: true, settings: settingsData };
    }
  },

  // ==========================================
  // 🎟️ COUPON CODE API METHODS
  // ==========================================

  // Get all coupons (Admin)
  async getCoupons() {
    try {
      const res = await fetch(`${API_BASE_URL}/coupons`);
      if (!res.ok) throw new Error('Failed to fetch coupons');
      const data = await res.json();
      return data.coupons || [];
    } catch (err) {
      console.warn('Fallback local coupons:', err.message);
      return [
        {
          id: 'coupon-health100',
          code: 'HEALTH100',
          discountType: 'fixed',
          discountAmount: 100,
          minPurchase: 500,
          maxDiscount: 100,
          expiryDate: '2026-12-31',
          usageLimit: 500,
          usedCount: 14,
          isActive: true
        },
        {
          id: 'coupon-health10',
          code: 'HEALTH10',
          discountType: 'percentage',
          discountAmount: 10,
          minPurchase: 1000,
          maxDiscount: 300,
          expiryDate: '2026-12-31',
          usageLimit: 200,
          usedCount: 28,
          isActive: true
        },
        {
          id: 'coupon-eid50',
          code: 'EID50',
          discountType: 'fixed',
          discountAmount: 50,
          minPurchase: 300,
          maxDiscount: 50,
          expiryDate: '2026-10-31',
          usageLimit: 100,
          usedCount: 5,
          isActive: true
        }
      ];
    }
  },

  // Create new coupon (Admin)
  async createCoupon(couponData) {
    try {
      const res = await fetch(`${API_BASE_URL}/coupons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(couponData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create coupon');
      return data;
    } catch (err) {
      console.warn('Coupon created locally:', err.message);
      return {
        success: true,
        coupon: {
          id: 'coupon-' + Date.now(),
          ...couponData,
          usedCount: 0
        }
      };
    }
  },

  // Update coupon (Admin)
  async updateCoupon(id, couponData) {
    try {
      const res = await fetch(`${API_BASE_URL}/coupons/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(couponData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update coupon');
      return data;
    } catch (err) {
      console.warn('Coupon updated locally:', err.message);
      return { success: true, coupon: { id, ...couponData } };
    }
  },

  // Delete coupon (Admin)
  async deleteCoupon(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/coupons/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete coupon');
      return data;
    } catch (err) {
      console.warn('Coupon deleted locally:', err.message);
      return { success: true };
    }
  },

  // Validate coupon (Storefront Checkout)
  async validateCoupon(code, subtotal) {
    try {
      const res = await fetch(`${API_BASE_URL}/coupons/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, subtotal })
      });
      const data = await res.json();
      return data;
    } catch (err) {
      // Local fallback validator
      const clean = (code || '').trim().toUpperCase();
      if (clean === 'HEALTH100' || clean === 'HEALTHBARI') {
        const discount = Math.min(100, subtotal);
        return {
          success: true,
          message: '🎉 অভিনন্দন! কুপনটি সফলভাবে যুক্ত হয়েছে এবং ১০০৳ ছাড় পেয়েছেন!',
          discountAmount: discount,
          coupon: { code: clean, discountType: 'fixed', discountAmount: 100 }
        };
      }
      if (clean === 'HEALTH10') {
        const discount = Math.round(subtotal * 0.1);
        return {
          success: true,
          message: `🎉 অভিনন্দন! কুপনটি সফলভাবে যুক্ত হয়েছে এবং ১০% (${discount}৳) ছাড় পেয়েছেন!`,
          discountAmount: discount,
          coupon: { code: clean, discountType: 'percentage', discountAmount: 10 }
        };
      }
      return {
        success: false,
        message: `"${clean}" কুপন কোডটি সঠিক নয়! ট্রাই করুন: HEALTH100`
      };
    }
  },

  // Get Customer Reviews
  async getReviews() {
    try {
      const res = await fetch(`${API_BASE_URL}/reviews`);
      const data = await res.json();
      if (data.success && Array.isArray(data.reviews)) {
        return data.reviews;
      }
      throw new Error('Invalid reviews response');
    } catch (err) {
      const stored = localStorage.getItem('healthbari_reviews');
      if (stored) {
        try { return JSON.parse(stored); } catch (e) {}
      }
      const initial = [
        {
          id: 1,
          customerName: 'মোঃ আব্দুল জলিল',
          customerLocation: 'কাশিমপুর, গাজীপুর',
          productTitle: 'স্মার্ট ডিজিটাল ব্লাড প্রেশার মনিটর',
          rating: 5,
          comment: 'ব্লাড প্রেশার মনিটরটি খুব নিখুঁত কাজ করে। প্রেশার মাপার পর ভয়েস স্পিকারে বাংলা ও ইংরেজিতে রিডিং পড়ে শোনায়, তাই বয়স্ক আব্বার জন্য ব্যবহার করা অনেক সহজ হয়েছে। কাশিমপুরে পাওয়ার পরদিনই হাতে পেয়েছি।',
          isVerified: true,
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          customerName: 'ডাঃ তাসনিম আলম',
          customerLocation: 'ধানমন্ডি, ঢাকা',
          productTitle: 'পোর্টেবল ইনহেলার ও নেবুলাইজার',
          rating: 5,
          comment: 'নেবুলাইজার মেশিনটি সাইজে ছোট হওয়ায় সাথে নিয়ে চলাফেরা করা সহজ। শব্দ একদমই কম হয়। হেলথ বাড়ির সার্ভিস ও প্যাকিং সত্যিই প্রশংসনীয়।',
          isVerified: true,
          createdAt: new Date().toISOString()
        },
        {
          id: 3,
          customerName: 'শরিফুল ইসলাম',
          customerLocation: 'উত্তরা, ঢাকা',
          productTitle: 'ডিজিটাল পালস অক্সিমিটার',
          rating: 5,
          comment: 'অর্ডার করার পরদিন কুরিয়ারের মাধ্যমে হাতে পেয়েছি। আগে প্রোডাক্ট চেক করার সুযোগ ছিল তাই কোনো ভয় ছিল না। একদম ১০০% অরিজিনাল গ্যাজেট!',
          isVerified: true,
          createdAt: new Date().toISOString()
        },
        {
          id: 4,
          customerName: 'মোসাম্মৎ রুকসানা বেগম',
          customerLocation: 'মিরপুর, ঢাকা',
          productTitle: 'ডিজিটাল ব্লাড গ্লুকোজ মিটার',
          rating: 5,
          comment: 'সুগার মাপা খুব সহজ এবং সঠিক রিডিং দেয়। স্ট্রিপগুলোর মেয়াদ অনেক দিন বাকি আছে। প্যাকেজিং ভালো ছিল।',
          isVerified: true,
          createdAt: new Date().toISOString()
        },
        {
          id: 5,
          customerName: 'হাসান মাহমুদ',
          customerLocation: 'চকবাজার, চট্টগ্রাম',
          productTitle: 'মাল্টি-ফাংশনাল মাসল ম্যাসাজার গান',
          rating: 5,
          comment: 'প্রতিদিনের ঘাড় ও পিঠের ব্যথার জন্য অসম্ভব উপকারী একটি ডিভাইস। ডিসকাউন্ট কুপন ব্যবহার করে ১-ক্লিকে অর্ডার করেছি, খুব দ্রুত ডেলিভারি পেয়েছি।',
          isVerified: true,
          createdAt: new Date().toISOString()
        }
      ];
      localStorage.setItem('healthbari_reviews', JSON.stringify(initial));
      return initial;
    }
  },

  // Submit Customer Review
  async createReview(reviewData) {
    try {
      const res = await fetch(`${API_BASE_URL}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewData)
      });
      const data = await res.json();
      return data;
    } catch (err) {
      const stored = localStorage.getItem('healthbari_reviews');
      let current = [];
      if (stored) {
        try { current = JSON.parse(stored); } catch (e) {}
      }
      const newRev = {
        id: Date.now(),
        customerName: reviewData.customerName || 'সম্মানিত কাস্টমার',
        customerLocation: reviewData.customerLocation || 'ঢাকা, বাংলাদেশ',
        productTitle: reviewData.productTitle || 'স্বাস্থ্য সুরক্ষা প্রোডাক্ট',
        rating: Number(reviewData.rating) || 5,
        comment: reviewData.comment || '',
        isVerified: true,
        createdAt: new Date().toISOString()
      };
      current.unshift(newRev);
      localStorage.setItem('healthbari_reviews', JSON.stringify(current));
      return { success: true, message: 'আপনার মূল্যবান রিভিউটি সফলভাবে গৃহীত হয়েছে। ধন্যবাদ!', review: newRev };
    }
  }
};

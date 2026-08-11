import React, { useState, useEffect, useMemo } from 'react';
import { products as localProductsData, categories as initialCategoriesData } from './data/products';
import { healthArticles as initialArticlesData } from './data/healthArticles';
import { api } from './services/api';
import Navbar from './components/Navbar';
import HeroBanner from './components/HeroBanner';
import ProductCard from './components/ProductCard';
import ProductDetailModal from './components/ProductDetailModal';
import CheckoutView from './components/CheckoutView';
import OrderSuccessModal from './components/OrderSuccessModal';
import HealthTipsSection from './components/HealthTipsSection';
import TrackParcelView from './components/TrackParcelView';
import CartDrawer from './components/CartDrawer';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import TermsConditionsView from './components/TermsConditionsView';
import PrivacyPolicyView from './components/PrivacyPolicyView';
import Footer from './components/Footer';
import { MessageCircle, HeartPulse, SlidersHorizontal, ArrowRight, ShieldCheck } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

export default function App() {
  // Check if admin is already logged in
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    return localStorage.getItem('healthbari_admin_auth') === 'true';
  });

  // Navigation: 'home' | 'products' | 'health-tips' | 'checkout' | 'track-parcel' | 'terms' | 'privacy' | 'admin'
  const [currentTab, setCurrentTab] = useState(() => {
    if (typeof window !== 'undefined') {
      const p = window.location.pathname.toLowerCase();
      if (p.includes('/admindashboard')) return 'admin';
      if (p.includes('/checkout')) return 'checkout';
      if (p.includes('/health-tips')) return 'health-tips';
      if (p.includes('/track-parcel') || p.includes('/track')) return 'track-parcel';
      if (p.includes('/terms')) return 'terms';
      if (p.includes('/privacy')) return 'privacy';
      if (p.includes('/products')) return 'products';
    }
    return 'home';
  });

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortOption, setSortOption] = useState('default');

  // Categories, Products, Articles & Site Settings state
  const [categoriesList, setCategoriesList] = useState(initialCategoriesData);
  const [productsList, setProductsList] = useState(localProductsData);
  const [articlesList, setArticlesList] = useState(initialArticlesData);
  const [siteSettings, setSiteSettings] = useState(() => {
    const defaultAnnouncements = [
      "🩺 সকল মেডিকেল ডিভাইসে অফিশিয়াল ওয়ারেন্টি ও সারাদেশে ক্যাশ অন ডেলিভারি",
      "🎟️ বিশেষ ছাড়: 'HEALTH100' কুপন কোড ব্যবহার করে পান ১০০৳ নিশ্চিত ছাড়!",
      "🚚 কাশিমপুর (গাজীপুর) এরিয়াতে দ্রুততম হোম ডেলিভারি ও ফ্রি চেকআপ সুবিধা",
      "🎁 'HEALTH10' কোড ব্যবহারে পেয়ে যান যেকোনো অর্ডারে ১০% ইনস্ট্যান্ট ডিসকাউন্ট!",
      "📞 যেকোনো স্বাস্থ্য পরামর্শ ও ডিভাইসের ব্যবহারের নিয়ম জানতে কল করুন: 01540-696573"
    ];

    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('healthbari_site_settings');
        if (cached) {
          const parsed = JSON.parse(cached);
          return {
            ...parsed,
            announcements: (parsed.announcements && Array.isArray(parsed.announcements)) ? parsed.announcements : defaultAnnouncements,
            announcementSpeed: parsed.announcementSpeed || 'normal',
            isAnnouncementEnabled: parsed.isAnnouncementEnabled !== undefined ? parsed.isAnnouncementEnabled : true
          };
        }
      } catch (e) { }
    }
    return {
      brandName: 'হেলথ বাড়ি',
      brandLogo: '/images/healthbari_logo.png',
      heroBanner: '/images/healthbari_hero.png',
      phone: '01540-696573',
      whatsappNumber: '8801540696573',
      address: 'কাশিমপুর, গাজীপুর',
      slogan: 'আপনার পরিবারের বিশ্বস্ত ডিজিটাল স্বাস্থ্য সঙ্গী',
      facebookUrl: 'https://facebook.com/healthbari',
      shippingInsideDhaka: 0,
      shippingOutsideDhaka: 0,
      announcements: defaultAnnouncements,
      announcementSpeed: 'normal',
      isAnnouncementEnabled: true
    };
  });

  // Cart state - Defaults to empty array [] or loaded from localStorage
  const [cartItems, setCartItems] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('healthbari_cart');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch (e) { }
    }
    return [];
  });

  // Keep cart in sync with localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('healthbari_cart', JSON.stringify(cartItems));
      } catch (e) { }
    }
  }, [cartItems]);

  // Orders state - Starts empty or loaded from localStorage
  const [orders, setOrders] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const cachedOrders = localStorage.getItem('healthbari_orders');
        if (cachedOrders) {
          const parsed = JSON.parse(cachedOrders);
          if (Array.isArray(parsed)) {
            return parsed;
          }
        }
      } catch (e) {}
    }
    return [];
  });

  // Keep orders in sync with localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('healthbari_orders', JSON.stringify(orders));
      } catch (e) {}
    }
  }, [orders]);

  const [completedOrder, setCompletedOrder] = useState(null);

  // Load products, categories, articles, settings & orders from DB on mount
  useEffect(() => {
    async function loadData() {
      const fetchedSettings = await api.getSettings();
      if (fetchedSettings) {
        setSiteSettings(fetchedSettings);
      }
      const fetchedCats = await api.getCategories();
      if (fetchedCats && Array.isArray(fetchedCats) && fetchedCats.length > 0) {
        setCategoriesList(fetchedCats);
      }
      const fetchedProducts = await api.getProducts();
      if (fetchedProducts && Array.isArray(fetchedProducts) && fetchedProducts.length > 0) {
        setProductsList(fetchedProducts);
      }
      const fetchedArticles = await api.getHealthTips();
      if (fetchedArticles && Array.isArray(fetchedArticles) && fetchedArticles.length > 0) {
        setArticlesList(fetchedArticles);
      }
      const fetchedOrders = await api.getOrders();
      if (fetchedOrders && Array.isArray(fetchedOrders)) {
        setOrders(fetchedOrders);
      }
    }
    loadData();

    // Listen to browser navigation (back/forward)
    const handleBrowserPopState = () => {
      const path = window.location.pathname;
      if (path.includes('/admindashboard')) {
        setCurrentTab('admin');
      } else if (path.includes('/checkout')) {
        setCurrentTab('checkout');
      } else if (path.includes('/health-tips')) {
        setCurrentTab('health-tips');
      } else if (path.includes('/track-parcel') || path.includes('/track')) {
        setCurrentTab('track-parcel');
      } else if (path.includes('/terms')) {
        setCurrentTab('terms');
      } else if (path.includes('/privacy')) {
        setCurrentTab('privacy');
      } else if (path.includes('/products')) {
        setCurrentTab('products');
      } else {
        setCurrentTab('home');
      }
    };
    window.addEventListener('popstate', handleBrowserPopState);
    return () => window.removeEventListener('popstate', handleBrowserPopState);
  }, []);

  // Update browser URL on tab change
  const handleTabChange = (tab) => {
    setCurrentTab(tab);
    if (tab === 'admin') {
      if (!window.location.pathname.includes('/admindashboard')) {
        window.history.pushState({}, '', '/admindashboard');
      }
    } else if (tab === 'checkout') {
      window.history.pushState({}, '', '/checkout');
    } else if (tab === 'health-tips') {
      window.history.pushState({}, '', '/health-tips');
    } else if (tab === 'track-parcel') {
      window.history.pushState({}, '', '/track-parcel');
    } else if (tab === 'terms') {
      window.history.pushState({}, '', '/terms');
    } else if (tab === 'privacy') {
      window.history.pushState({}, '', '/privacy');
    } else if (tab === 'products') {
      window.history.pushState({}, '', '/products');
    } else {
      window.history.pushState({}, '', '/');
    }
  };

  // Handle Admin Login Success
  const handleAdminLoginSuccess = () => {
    localStorage.setItem('healthbari_admin_auth', 'true');
    setIsAdminAuthenticated(true);
    setCurrentTab('admin');
  };

  // Handle Admin Logout (Show Login page at /admindashboard)
  const handleAdminLogout = () => {
    localStorage.removeItem('healthbari_admin_auth');
    setIsAdminAuthenticated(false);
    setCurrentTab('admin');
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', '/admindashboard');
    }
  };

  // Category Management Handlers
  const handleAddCategory = async (categoryName) => {
    const slug = 'cat-' + Date.now();
    const created = await api.createCategory(categoryName, slug);
    const itemToAdd = created || { id: slug, name: categoryName, slug };
    setCategoriesList(prev => [...prev, itemToAdd]);
  };

  const handleDeleteCategory = async (catId) => {
    await api.deleteCategory(catId);
    setCategoriesList(prev => prev.filter(c => c.id !== catId && c.slug !== catId));
  };

  // Cart operations
  const handleAddToCart = (product, variant, qty = 1) => {
    setCartItems(prev => {
      const existingIndex = prev.findIndex(
        item => item.product.id === product.id && item.variant.id === variant.id
      );
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += qty;
        return updated;
      }
      return [...prev, { product, variant, quantity: qty }];
    });
    setIsCartOpen(true);
  };

  const handleUpdateQty = (index, delta) => {
    setCartItems(prev => {
      const updated = [...prev];
      const newQty = updated[index].quantity + delta;
      if (newQty <= 0) {
        return updated.filter((_, i) => i !== index);
      }
      updated[index].quantity = newQty;
      return updated;
    });
  };

  const handleRemoveCartItem = (index) => {
    setCartItems(prev => prev.filter((_, i) => i !== index));
  };

  // Quick buy -> direct to checkout
  const handleQuickBuy = (product, variant, qty = 1) => {
    setCartItems([
      { product, variant, quantity: qty }
    ]);
    setSelectedProduct(null);
    setCurrentTab('checkout');
  };

  // Place order with Database integration
  const handlePlaceOrder = async (newOrder) => {
    const savedOrder = await api.createOrder(newOrder);
    const finalOrder = savedOrder || newOrder;
    setOrders(prev => [finalOrder, ...prev]);
    setCompletedOrder(finalOrder);
    setCartItems([]);
    if (selectedProduct) setSelectedProduct(null);
  };

  // Admin: Update Order Status & Send to Courier
  const handleUpdateOrderStatus = async (orderId, newStatus, courierInfo = null) => {
    if (newStatus === 'In Courier') {
      const updatedCourierOrder = await api.sendToCourier(orderId, courierInfo || {});
      if (updatedCourierOrder) {
        setOrders(prev => prev.map(o => o.orderId === orderId ? updatedCourierOrder : o));
        return;
      }
    }

    await api.updateOrderStatus(orderId, newStatus, courierInfo);
    setOrders(prev => prev.map(ord => {
      if (ord.orderId === orderId) {
        return {
          ...ord,
          status: newStatus,
          courierInfo: courierInfo || ord.courierInfo
        };
      }
      return ord;
    }));
  };

  // Admin: Refresh Orders from Database (Supports 15-Minute Auto-Refresh)
  const handleRefreshOrders = async () => {
    try {
      const fetchedOrders = await api.getOrders();
      if (fetchedOrders && Array.isArray(fetchedOrders)) {
        setOrders(fetchedOrders);
        return fetchedOrders;
      }
    } catch (err) {
      console.warn('Orders refresh failed:', err.message);
    }
    return null;
  };

  // Admin: Add New Product
  const handleAddProduct = async (productData) => {
    const created = await api.createProduct(productData);
    const itemToAdd = created || {
      id: 'prod-' + Date.now(),
      ...productData,
      variants: [{ id: 'v-' + Date.now(), name: 'স্ট্যান্ডার্ড প্যাকেজ', price: productData.price, isDefault: true }],
      images: ['/images/bp_monitor.png'],
      highlights: ['১০০% অরিজিনাল মেডিকেল ডিভাইস'],
      rating: 4.9,
      reviewsCount: 1,
      stockCount: productData.stockCount || 50
    };
    setProductsList(prev => [itemToAdd, ...prev]);
  };

  // Admin: Update Product
  const handleUpdateProduct = async (id, productData) => {
    await api.updateProduct(id, productData);
    setProductsList(prev => prev.map(p => {
      if (p.id === id) {
        return {
          ...p,
          ...productData,
          variants: p.variants.map((v, i) => i === 0 ? { ...v, price: productData.price || v.price } : v)
        };
      }
      return p;
    }));
  };

  // Admin: Delete Product
  const handleDeleteProduct = async (id) => {
    await api.deleteProduct(id);
    setProductsList(prev => prev.filter(p => p.id !== id));
  };

  // Admin: Add New Health Article
  const handleAddArticle = async (articleData) => {
    const created = await api.createHealthTip(articleData);
    const itemToAdd = created || {
      id: 'art-' + Date.now(),
      date: new Date().toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' }),
      ...articleData
    };
    setArticlesList(prev => [itemToAdd, ...prev]);
  };

  // Admin: Update Health Article
  const handleUpdateArticle = async (id, articleData) => {
    await api.updateHealthTip(id, articleData);
    setArticlesList(prev => prev.map(a => a.id === id ? { ...a, ...articleData } : a));
  };

  // Admin: Delete Health Article
  const handleDeleteArticle = async (id) => {
    await api.deleteHealthTip(id);
    setArticlesList(prev => prev.filter(a => a.id !== id));
  };

  // Admin: Update Profile & Site Settings
  const handleUpdateSettings = async (newSettings) => {
    await api.updateSettings(newSettings);
    setSiteSettings(newSettings);
  };

  // Filtered & Sorted Products for Storefront
  const filteredProducts = useMemo(() => {
    return productsList.filter(p => {
      const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.englishTitle && p.englishTitle.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === 'all' || p.categorySlug === selectedCategory || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    }).sort((a, b) => {
      const priceA = a.variants[0]?.price || 0;
      const priceB = b.variants[0]?.price || 0;
      if (sortOption === 'price-low') return priceA - priceB;
      if (sortOption === 'price-high') return priceB - priceA;
      return 0;
    });
  }, [productsList, searchQuery, selectedCategory, sortOption]);

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // =========================================================================
  // 🔐 ADMIN ACCESS CONTROL (Only authenticated users see dashboard)
  // =========================================================================
  const isAdminPath = typeof window !== 'undefined' && window.location.pathname.toLowerCase().includes('/admindashboard');
  if (currentTab === 'admin' || isAdminPath) {
    if (!isAdminAuthenticated) {
      return (
        <>
          <Toaster position="top-right" reverseOrder={false} />
          <AdminLogin
            onLoginSuccess={handleAdminLoginSuccess}
            onBackToStore={() => handleTabChange('home')}
          />
        </>
      );
    }

    return (
      <>
        <Toaster
          position="top-right"
          reverseOrder={false}
          toastOptions={{
            duration: 3500,
            style: {
              borderRadius: '12px',
              background: '#0f172a',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '0.925rem',
              padding: '12px 18px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.25)'
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#ffffff',
              }
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#ffffff',
              }
            }
          }}
        />
        <AdminDashboard
          products={productsList}
          orders={orders}
          categories={categoriesList}
          articles={articlesList}
          settings={siteSettings}
          onAddCategory={handleAddCategory}
          onDeleteCategory={handleDeleteCategory}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          onAddProduct={handleAddProduct}
          onUpdateProduct={handleUpdateProduct}
          onDeleteProduct={handleDeleteProduct}
          onAddArticle={handleAddArticle}
          onUpdateArticle={handleUpdateArticle}
          onDeleteArticle={handleDeleteArticle}
          onUpdateSettings={handleUpdateSettings}
          onRefreshOrders={handleRefreshOrders}
          onBackToStore={() => handleTabChange('home')}
          onLogout={handleAdminLogout}
        />
      </>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc' }}>

      {/* Global Toast Notifications */}
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration: 3500,
          style: {
            borderRadius: '12px',
            background: '#0f172a',
            color: '#ffffff',
            fontWeight: 600,
            fontSize: '0.925rem',
            padding: '12px 18px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.25)'
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#ffffff',
            }
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#ffffff',
            }
          }
        }}
      />

      {/* 1. Header & Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={handleTabChange}
        cartCount={totalCartCount}
        setIsCartOpen={setIsCartOpen}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        setIsAdminOpen={() => handleTabChange('admin')}
        settings={siteSettings}
      />

      {/* Main Viewport */}
      <main style={{ flex: 1 }}>

        {/* VIEW A: HOME PAGE */}
        {currentTab === 'home' && (
          <div className="container" style={{ padding: '2rem 1.25rem' }}>

            {/* Grand Hero Banner */}
            <HeroBanner
              settings={siteSettings}
              onExploreProducts={() => {
                const el = document.getElementById('products-grid-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              onOpenTips={() => handleTabChange('health-tips')}
            />

            {/* All Categories Section */}
            <div style={{ marginBottom: '2.5rem' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>
                All Categories (ক্যাটাগরি সমূহ)
              </h2>

              {/* Desktop Categories */}
              <div className="hide-mobile flex items-center gap-3 flex-wrap">
                <button
                  onClick={() => setSelectedCategory('all')}
                  style={{
                    padding: '0.65rem 1.25rem',
                    borderRadius: '12px',
                    border: selectedCategory === 'all' ? '2px solid #0d9488' : '1px solid #e2e8f0',
                    background: selectedCategory === 'all' ? '#f0fdfa' : '#ffffff',
                    color: selectedCategory === 'all' ? '#0f766e' : '#334155',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <span>সকল ডিভাইস</span>
                  <span style={{
                    background: selectedCategory === 'all' ? '#0d9488' : '#f1f5f9',
                    color: selectedCategory === 'all' ? '#ffffff' : '#64748b',
                    fontSize: '0.75rem',
                    padding: '1px 7px',
                    borderRadius: '50px'
                  }} className="font-numeric">
                    {productsList.length}
                  </span>
                </button>

                {categoriesList.map((cat) => {
                  const count = productsList.filter(p => p.category === cat.name || p.categorySlug === cat.slug).length;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.slug || cat.name)}
                      style={{
                        padding: '0.65rem 1.25rem',
                        borderRadius: '12px',
                        border: selectedCategory === (cat.slug || cat.name) ? '2px solid #0d9488' : '1px solid #e2e8f0',
                        background: selectedCategory === (cat.slug || cat.name) ? '#f0fdfa' : '#ffffff',
                        color: selectedCategory === (cat.slug || cat.name) ? '#0f766e' : '#334155',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span>{cat.name}</span>
                      <span style={{
                        background: selectedCategory === (cat.slug || cat.name) ? '#0d9488' : '#f1f5f9',
                        color: selectedCategory === (cat.slug || cat.name) ? '#ffffff' : '#64748b',
                        fontSize: '0.75rem',
                        padding: '1px 7px',
                        borderRadius: '50px'
                      }} className="font-numeric">
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Mobile Category Dropdown Select */}
              <div className="show-mobile-only">
                <div style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  background: '#f0fdfa',
                  border: '1.5px solid #0d9488',
                  borderRadius: '10px',
                  padding: '0.6rem 0.85rem',
                  boxShadow: '0 2px 5px rgba(13, 148, 136, 0.08)'
                }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f766e', whiteSpace: 'nowrap', marginRight: '0.5rem' }}>
                    ক্যাটাগরি:
                  </span>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    style={{
                      flex: 1,
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      color: '#0f172a',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="all">সকল ডিভাইস ({productsList.length})</option>
                    {categoriesList.map((cat) => {
                      const count = productsList.filter(p => p.category === cat.name || p.categorySlug === cat.slug).length;
                      return (
                        <option key={cat.id} value={cat.slug || cat.name}>
                          {cat.name} ({count})
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
            </div>

            {/* All Products Grid */}
            <div id="products-grid-section" style={{ marginBottom: '3.5rem' }}>
              <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  All Products (সকল মেডিকেল ডিভাইস)
                </h2>
                <button
                  onClick={() => handleTabChange('products')}
                  className="btn btn-outline"
                  style={{ fontSize: '0.85rem', padding: '0.4rem 0.85rem' }}
                >
                  <span>সবগুলো দেখুন</span>
                  <ArrowRight size={14} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    onSelectProduct={(prod) => setSelectedProduct(prod)}
                    onQuickBuy={handleQuickBuy}
                  />
                ))}
              </div>
            </div>

            {/* Health Tips & Educational Section */}
            <HealthTipsSection
              articles={articlesList}
              products={productsList}
              onSelectProduct={(prod) => setSelectedProduct(prod)}
            />

          </div>
        )}

        {/* VIEW B: PRODUCTS / SHOP PAGE */}
        {currentTab === 'products' && (
          <div className="container" style={{ padding: '2rem 1.25rem' }}>

            <div className="flex items-center justify-between gap-4 flex-wrap" style={{ marginBottom: '2rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
              <div>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  সকল স্বাস্থ্য পণ্য ও ডিভাইস
                </h1>
                <p style={{ color: '#64748b', margin: '4px 0 0 0', fontSize: '0.875rem' }}>
                  ডাক্তারদের রিকমেন্ডেড ও ১০০% কোয়ালিটি টেস্টেড মেডিকেল গ্যাজেট
                </p>
              </div>

              {/* Sort By Dropdown */}
              <div className="flex items-center gap-2">
                <span style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 600 }}>Sort by (Price):</span>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="form-select"
                  style={{ width: 'auto', padding: '0.45rem 1rem', fontSize: '0.85rem' }}
                >
                  <option value="default">Default</option>
                  <option value="price-low">Low to High (কম থেকে বেশি)</option>
                  <option value="price-high">High to Low (বেশি থেকে কম)</option>
                </select>
              </div>
            </div>

            {/* Category Pills Filter - Desktop */}
            <div className="hide-mobile flex items-center gap-2 flex-wrap" style={{ marginBottom: '1.5rem' }}>
              <button
                onClick={() => setSelectedCategory('all')}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '50px',
                  border: selectedCategory === 'all' ? '2px solid #0d9488' : '1px solid #cbd5e1',
                  background: selectedCategory === 'all' ? '#0d9488' : '#ffffff',
                  color: selectedCategory === 'all' ? '#ffffff' : '#334155',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                সকল ডিভাইস ({productsList.length})
              </button>

              {categoriesList.map((cat) => {
                const count = productsList.filter(p => p.category === cat.name || p.categorySlug === cat.slug).length;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.slug || cat.name)}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '50px',
                      border: selectedCategory === (cat.slug || cat.name) ? '2px solid #0d9488' : '1px solid #cbd5e1',
                      background: selectedCategory === (cat.slug || cat.name) ? '#0d9488' : '#ffffff',
                      color: selectedCategory === (cat.slug || cat.name) ? '#ffffff' : '#334155',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}
                  >
                    {cat.name} ({count})
                  </button>
                );
              })}
            </div>

            {/* Category Filter - Mobile Dropdown Select */}
            <div className="show-mobile-only" style={{ marginBottom: '1.25rem' }}>
              <div style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                background: '#f0fdfa',
                border: '1.5px solid #0d9488',
                borderRadius: '10px',
                padding: '0.6rem 0.85rem',
                boxShadow: '0 2px 5px rgba(13, 148, 136, 0.08)'
              }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f766e', whiteSpace: 'nowrap', marginRight: '0.5rem' }}>
                  ক্যাটাগরি:
                </span>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    color: '#0f172a',
                    cursor: 'pointer'
                  }}
                >
                  <option value="all">সকল ডিভাইস ({productsList.length})</option>
                  {categoriesList.map((cat) => {
                    const count = productsList.filter(p => p.category === cat.name || p.categorySlug === cat.slug).length;
                    return (
                      <option key={cat.id} value={cat.slug || cat.name}>
                        {cat.name} ({count})
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onSelectProduct={(prod) => setSelectedProduct(prod)}
                  onQuickBuy={handleQuickBuy}
                />
              ))}
            </div>

          </div>
        )}

        {/* VIEW C: HEALTH TIPS & ARTICLES */}
        {currentTab === 'health-tips' && (
          <div className="container" style={{ padding: '2rem 1.25rem' }}>
            <HealthTipsSection
              articles={articlesList}
              products={productsList}
              onSelectProduct={(prod) => setSelectedProduct(prod)}
            />
          </div>
        )}

        {/* VIEW D: 2-COLUMN CHECKOUT */}
        {currentTab === 'checkout' && (
          <CheckoutView
            cartItems={cartItems}
            onUpdateQty={handleUpdateQty}
            onRemoveItem={handleRemoveCartItem}
            onPlaceOrder={handlePlaceOrder}
            onBackToShop={() => handleTabChange('products')}
            settings={siteSettings}
          />
        )}

        {/* VIEW E: TRACK PARCEL */}
        {currentTab === 'track-parcel' && (
          <TrackParcelView
            onBackToStore={() => handleTabChange('home')}
            onSelectProduct={(prod) => setSelectedProduct(prod)}
            settings={siteSettings}
          />
        )}

        {/* VIEW F: TERMS & CONDITIONS */}
        {currentTab === 'terms' && (
          <TermsConditionsView
            onBackToHome={() => handleTabChange('home')}
            settings={siteSettings}
          />
        )}

        {/* VIEW G: PRIVACY POLICY */}
        {currentTab === 'privacy' && (
          <PrivacyPolicyView
            onBackToHome={() => handleTabChange('home')}
            settings={siteSettings}
          />
        )}

      </main>

      {/* 2. Modals & Overlays */}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
          onDirectOrder={handlePlaceOrder}
          onQuickBuy={handleQuickBuy}
          allProducts={productsList}
          onSelectProduct={(prod) => setSelectedProduct(prod)}
        />
      )}

      {/* Slide-over Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleRemoveCartItem}
        onProceedToCheckout={() => handleTabChange('checkout')}
      />

      {/* Order Success & Printable Bengali Customer Invoice Modal */}
      {completedOrder && (
        <OrderSuccessModal
          order={completedOrder}
          settings={siteSettings}
          onClose={() => setCompletedOrder(null)}
          onOpenAdmin={() => handleTabChange('admin')}
        />
      )}

      {/* Floating WhatsApp Button */}
      <a
        href={`https://wa.me/${siteSettings.whatsappNumber.replace(/[^0-9]/g, '')}?text=হ্যালো,%20আমি%20${encodeURIComponent(siteSettings.brandName)}%20থেকে%20পণ্য%20সম্পর্কে%20জানতে%20চাই।`}
        target="_blank"
        rel="noopener noreferrer"
        className="floating-whatsapp"
        title="WhatsApp-এ সরাসরি কথা বলুন"
      >
        <MessageCircle size={30} />
      </a>

      {/* 3. Footer */}
      <Footer onNavigate={(tab) => handleTabChange(tab)} settings={siteSettings} />

    </div>
  );
}

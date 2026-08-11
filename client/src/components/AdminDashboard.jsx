import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, ShoppingBag, Package, Truck, HeartPulse,
  ArrowLeft, Plus, Edit2, Trash2, CheckCircle2, Clock,
  Printer, Search, ExternalLink, ShieldCheck, Eye, EyeOff, Lock, Key, X, Filter, RefreshCw, LogOut, Tags, Upload, UploadCloud, BookOpen, FileText,
  Settings, User, Save, Globe, Image as ImageIcon, Sparkles, PhoneCall, Phone,
  Ticket, Tag, Percent, Copy, Calendar, AlertCircle, RotateCcw, XCircle, Check,
  Boxes, AlertTriangle, ArrowUpRight, TrendingUp, Layers, Archive, Menu,
  ChevronDown, ChevronUp, ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import CustomerInvoiceModal from './CustomerInvoiceModal';
import { api } from '../services/api';
import OrderChalanModal from './OrderChalanModal';

export const ADMIN_ROUTES = {
  overview: '/admindashboard',
  orders: '/admindashboard/ordermanagement',
  products: '/admindashboard/productsmanagement',
  stock: '/admindashboard/stockmanagement',
  categories: '/admindashboard/categoriesmanagement',
  coupons: '/admindashboard/couponmanagement',
  articles: '/admindashboard/healthtips',
  profile: '/admindashboard/profilesetup',
  password: '/admindashboard/changepassword',
  courier: '/admindashboard/couriermanagement'
};

export const getAdminTabFromPath = (pathname) => {
  if (typeof window === 'undefined') return 'overview';
  const p = (pathname || window.location.pathname).toLowerCase().replace(/\/+$/, '');
  if (p.includes('/ordermanagement') || p.includes('/orders')) return 'orders';
  if (p.includes('/stockmanagement') || p.includes('/stock') || p.includes('/inventory')) return 'stock';
  if (p.includes('/productsmanagement') || p.includes('/products')) return 'products';
  if (p.includes('/categoriesmanagement') || p.includes('/categories')) return 'categories';
  if (p.includes('/couponmanagement') || p.includes('/coupons')) return 'coupons';
  if (p.includes('/healthtips') || p.includes('/articles')) return 'articles';
  if (p.includes('/changepassword') || p.includes('/password')) return 'password';
  if (p.includes('/profilesetup') || p.includes('/profile')) return 'profile';
  if (p.includes('/couriermanagement') || p.includes('/courier')) return 'courier';
  return 'overview';
};

export const COURIER_OPTIONS = [
  { id: 'Steadfast Courier', name: 'Steadfast Courier (স্টিডফাস্ট কুরিয়ার)', icon: '🚚', prefix: 'ST-' },
  { id: 'Pathao Courier', name: 'Pathao Courier (পাঠাও কুরিয়ার)', icon: '📦', prefix: 'PTH-' },
  { id: 'RedX Courier', name: 'RedX Courier (রেডেক্স কুরিয়ার)', icon: '🔴', prefix: 'RDX-' },
  { id: 'Sundarban Courier', name: 'Sundarban Courier (সুন্দরবন কুরিয়ার)', icon: '🏢', prefix: 'SND-' },
  { id: 'Paperfly Courier', name: 'Paperfly (পেপারফ্লাই কুরিয়ার)', icon: '🚴', prefix: 'PFL-' },
  { id: 'SA Paribahan', name: 'SA Paribahan (এস এ পরিবহন)', icon: '🛵', prefix: 'SAP-' },
  { id: 'নিজস্ব লোকাল রাইডার ডেলিভারি', name: 'নিজস্ব লোকাল রাইডার ডেলিভারি (In-house Rider)', icon: '🚲', prefix: 'RDR-' },
  { id: 'custom', name: 'অন্যান্য / কাস্টম কুরিয়ার সার্ভিস (Custom)', icon: '✏️', prefix: 'TRK-' }
];

export default function AdminDashboard({
  products = [],
  orders = [],
  categories = [],
  articles = [],
  settings = {},
  onAddCategory,
  onDeleteCategory,
  onUpdateOrderStatus,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onAddArticle,
  onUpdateArticle,
  onDeleteArticle,
  onUpdateSettings,
  onRefreshOrders,
  onBackToStore,
  onLogout
}) {
  // Sidebar active tab with URL sync
  const [activeTab, setActiveTab] = useState(() => {
    return getAdminTabFromPath(typeof window !== 'undefined' ? window.location.pathname : '');
  });

  // Mobile Sidebar Menu Toggle State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Profile & Settings Dropdown Open State (Defaults to true if activeTab is profile or password)
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(() => {
    const initialTab = getAdminTabFromPath(typeof window !== 'undefined' ? window.location.pathname : '');
    return initialTab === 'profile' || initialTab === 'password';
  });

  // Keep dropdown expanded if user navigates to profile or password
  useEffect(() => {
    if (activeTab === 'profile' || activeTab === 'password') {
      setIsProfileDropdownOpen(true);
    }
  }, [activeTab]);

  // Handle Tab Switch & URL Update
  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    setIsMobileMenuOpen(false); // Close mobile drawer upon tab selection
    const targetPath = ADMIN_ROUTES[tabKey] || '/admindashboard';
    if (typeof window !== 'undefined' && window.location.pathname !== targetPath) {
      window.history.pushState({ tab: tabKey }, '', targetPath);
    }
  };

  // Sync on browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const tabFromPath = getAdminTabFromPath(window.location.pathname);
      setActiveTab(tabFromPath);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Orders filter (defaults to 'Pending' so 1. রিসিভড orders show by default) & detail modal
  const [orderFilter, setOrderFilter] = useState('Pending');
  const [orderSearch, setOrderSearch] = useState('');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [selectedChalanOrder, setSelectedChalanOrder] = useState(null);

  // Modal Courier Selection & Booking State
  const [modalCourierType, setModalCourierType] = useState('Steadfast Courier');
  const [modalCustomCourierName, setModalCustomCourierName] = useState('');
  const [modalTrackingCode, setModalTrackingCode] = useState('');
  const [modalConsignmentId, setModalConsignmentId] = useState('');
  const [isBookingCourier, setIsBookingCourier] = useState(false);

  // Step-by-step Modal Pipeline State (1: Received, 2: Packaging, 3: Courier Booking, 4: Delivery/Return)
  const [modalActiveStep, setModalActiveStep] = useState(1);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);

  const getStepFromOrder = (order) => {
    if (!order) return 1;
    if (order.status === 'Delivered' || order.status === 'Returned') return 4;
    if (order.status === 'In Courier' || order.courierInfo?.trackingCode) return 4;
    if (order.status === 'Processing') return 2;
    return 1; // 'Pending'
  };

  // Sync courier state & active step when selectedOrderDetails opens
  useEffect(() => {
    if (selectedOrderDetails) {
      const step = getStepFromOrder(selectedOrderDetails);
      setModalActiveStep(step);

      const existingCourier = selectedOrderDetails.courierInfo?.courierName || 'Steadfast Courier';
      const isKnown = COURIER_OPTIONS.some(c => c.id === existingCourier);
      if (isKnown) {
        setModalCourierType(existingCourier);
        setModalCustomCourierName('');
      } else {
        setModalCourierType('custom');
        setModalCustomCourierName(existingCourier);
      }
      setModalTrackingCode(selectedOrderDetails.courierInfo?.trackingCode || '');
      setModalConsignmentId(selectedOrderDetails.courierInfo?.consignmentId || '');
    }
  }, [selectedOrderDetails]);

  const handleGenerateTrackingCode = () => {
    const selectedOpt = COURIER_OPTIONS.find(c => c.id === modalCourierType);
    const prefix = selectedOpt?.prefix || 'TRK-';
    const randCode = prefix + Math.floor(100000 + Math.random() * 900000);
    setModalTrackingCode(randCode);
    if (!modalConsignmentId) {
      setModalConsignmentId('CSG-' + Math.floor(10000 + Math.random() * 90000));
    }
  };

  // Step 1 -> Step 2: Proceed to Packaging
  const handleAdvanceToPackaging = async () => {
    if (!selectedOrderDetails) return;
    await onUpdateOrderStatus(selectedOrderDetails.orderId, 'Processing');
    setSelectedOrderDetails(prev => prev ? { ...prev, status: 'Processing' } : null);
    setModalActiveStep(2);
    toast.success('📦 অর্ডারটি সফলভাবে প্যাকেজিং ও প্রসেসিং ধাপে স্থানান্তর করা হয়েছে!');
  };

  // Step 2 -> Step 3: Proceed to Courier Booking
  const handleAdvanceToCourierBooking = () => {
    setModalActiveStep(3);
  };

  // Step 3 -> Step 4: Book & Dispatch to Courier
  const handleBookCourierInModal = async () => {
    if (!selectedOrderDetails) return;
    setIsBookingCourier(true);
    try {
      const finalCourierName = modalCourierType === 'custom'
        ? (modalCustomCourierName.trim() || 'অন্যান্য কুরিয়ার')
        : modalCourierType;

      const selectedOpt = COURIER_OPTIONS.find(c => c.id === modalCourierType);
      const prefix = selectedOpt?.prefix || 'TRK-';
      const finalTrackingCode = modalTrackingCode.trim() || (prefix + Math.floor(100000 + Math.random() * 900000));
      const finalConsignmentId = modalConsignmentId.trim() || ('CSG-' + Math.floor(10000 + Math.random() * 90000));

      const courierInfo = {
        courierName: finalCourierName,
        trackingCode: finalTrackingCode,
        consignmentId: finalConsignmentId,
        courierStatus: 'In Transit (পার্সেল কুরিয়ারে গ্রহণ করা হয়েছে)',
        bookedAt: new Date().toISOString()
      };

      await onUpdateOrderStatus(selectedOrderDetails.orderId, 'In Courier', courierInfo);
      toast.success(`অর্ডারটি সফলভাবে ${finalCourierName} এ বুক করা হয়েছে!`);
      setSelectedOrderDetails(prev => prev ? {
        ...prev,
        status: 'In Courier',
        courierInfo
      } : null);
      setModalActiveStep(4);
    } catch (err) {
      toast.error('কুরিয়ার বুকিং করতে সমস্যা হয়েছে।');
    } finally {
      setIsBookingCourier(false);
    }
  };

  // Step 4 Outcome A: Mark as Delivered
  const handleMarkDelivered = async () => {
    if (!selectedOrderDetails) return;
    await onUpdateOrderStatus(selectedOrderDetails.orderId, 'Delivered');
    setSelectedOrderDetails(prev => prev ? { ...prev, status: 'Delivered' } : null);
    toast.success('🎉 অর্ডারটি সফলভাবে Delivered (ডেলিভার্ড) সম্পন্ন হয়েছে!');
  };

  // Step 4 Outcome B: Mark as Returned
  const handleMarkReturned = async () => {
    if (!selectedOrderDetails) return;
    await onUpdateOrderStatus(selectedOrderDetails.orderId, 'Returned');
    setSelectedOrderDetails(prev => prev ? { ...prev, status: 'Returned' } : null);
    toast.error('⚠️ অর্ডারটি Returned (রিটার্ন) হিসেবে চিহ্নিত করা হয়েছে!');
  };

  // ⏱️ Auto-Refresh Orders every 15 Minutes (15 * 60 * 1000 = 900,000 ms)
  const [isRefreshingOrders, setIsRefreshingOrders] = useState(false);
  const [lastOrderRefreshTime, setLastOrderRefreshTime] = useState(() => {
    return new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  });

  const handleManualRefreshOrders = async (silent = false) => {
    if (isRefreshingOrders) return;
    setIsRefreshingOrders(true);
    try {
      if (onRefreshOrders) {
        await onRefreshOrders();
      }
      const nowStr = new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastOrderRefreshTime(nowStr);
      if (!silent) {
        toast.success('🔄 অর্ডার তালিকা সফলভাবে রিফ্রেশ ও আপডেট হয়েছে!');
      }
    } catch (err) {
      if (!silent) toast.error('অর্ডার রিফ্রেশ করতে সমস্যা হয়েছে।');
    } finally {
      setIsRefreshingOrders(false);
    }
  };

  useEffect(() => {
    // Set 15-minute background auto-refresh interval (15 * 60 * 1000 ms)
    const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;
    const intervalId = setInterval(() => {
      handleManualRefreshOrders(true);
    }, FIFTEEN_MINUTES_MS);

    return () => clearInterval(intervalId);
  }, [onRefreshOrders]);

  // Category creation form
  const [newCatName, setNewCatName] = useState('');
  const [catError, setCatError] = useState('');

  // Coupon Management State
  const [couponsList, setCouponsList] = useState([]);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [cpCode, setCpCode] = useState('');
  const [cpDiscountType, setCpDiscountType] = useState('fixed');
  const [cpDiscountAmount, setCpDiscountAmount] = useState('');
  const [cpMinPurchase, setCpMinPurchase] = useState('');
  const [cpMaxDiscount, setCpMaxDiscount] = useState('');
  const [cpExpiryDate, setCpExpiryDate] = useState('2026-12-31');
  const [cpUsageLimit, setCpUsageLimit] = useState(100);
  const [cpIsActive, setCpIsActive] = useState(true);
  const [couponSearch, setCouponSearch] = useState('');
  const [couponFilter, setCouponFilter] = useState('all');
  const [isSavingCoupon, setIsSavingCoupon] = useState(false);

  // Load coupons from API
  useEffect(() => {
    async function loadCoupons() {
      const data = await api.getCoupons();
      if (data && Array.isArray(data)) {
        setCouponsList(data);
      }
    }
    loadCoupons();
  }, []);

  // Health Guide / Articles State
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [artTitle, setArtTitle] = useState('');
  const [artCategory, setArtCategory] = useState('হার্ট ও ব্লাড প্রেশার');
  const [artReadTime, setArtReadTime] = useState('৪ মিনিট পড়া');
  const [artSummary, setArtSummary] = useState('');
  const [artContentText, setArtContentText] = useState('');
  const [artRecommendedProduct, setArtRecommendedProduct] = useState(products[0]?.id || 'bp-monitor-pro');
  const [articleSearch, setArticleSearch] = useState('');

  // Profile & Site Settings State
  const DEFAULT_ANNOUNCEMENTS = [
    "🩺 সকল মেডিকেল ডিভাইসে ২ বছরের অফিশিয়াল ওয়ারেন্টি ও সারাদেশে ক্যাশ অন ডেলিভারি",
    "🎟️ বিশেষ ছাড়: 'HEALTH100' কুপন কোড ব্যবহার করে পান ১০০৳ নিশ্চিত ছাড়!",
    "🚚 কাশিমপুর (গাজীপুর) এরিয়াতে দ্রুততম হোম ডেলিভারি ও ফ্রি চেকআপ সুবিধা",
    "🎁 'HEALTH10' কোড ব্যবহারে পেয়ে যান যেকোনো অর্ডারে ১০% ইনস্ট্যান্ট ডিসকাউন্ট!",
    "📞 যেকোনো স্বাস্থ্য পরামর্শ ও ডিভাইসের ব্যবহারের নিয়ম জানতে কল করুন: 01540-696573"
  ];

  const [profBrandName, setProfBrandName] = useState(settings?.brandName || 'হেলথ বাড়ি');
  const [profBrandLogo, setProfBrandLogo] = useState(settings?.brandLogo || '/images/healthbari_logo.png');
  const [profHeroBanner, setProfHeroBanner] = useState(settings?.heroBanner || '/images/healthbari_hero.png');
  const [profPhone, setProfPhone] = useState(settings?.phone || '01540-696573');
  const [profWhatsapp, setProfWhatsapp] = useState(settings?.whatsappNumber || '8801540696573');
  const [profAddress, setProfAddress] = useState(settings?.address || 'কাশিমপুর, গাজীপুর');
  const [profSlogan, setProfSlogan] = useState(settings?.slogan || 'আপনার পরিবারের বিশ্বস্ত ডিজিটাল স্বাস্থ্য সঙ্গী');
  const [profFacebook, setProfFacebook] = useState(settings?.facebookUrl || 'https://facebook.com/healthbari');
  const [profShippingInside, setProfShippingInside] = useState(
    settings?.shippingInsideDhaka !== undefined && settings?.shippingInsideDhaka !== null ? settings.shippingInsideDhaka : 0
  );
  const [profShippingOutside, setProfShippingOutside] = useState(
    settings?.shippingOutsideDhaka !== undefined && settings?.shippingOutsideDhaka !== null ? settings.shippingOutsideDhaka : 0
  );

  // Topbar Moving Announcements state
  const [profAnnouncements, setProfAnnouncements] = useState(() => {
    if (settings?.announcements && Array.isArray(settings.announcements) && settings.announcements.length > 0) {
      return settings.announcements;
    }
    return DEFAULT_ANNOUNCEMENTS;
  });
  const [profAnnouncementSpeed, setProfAnnouncementSpeed] = useState(settings?.announcementSpeed || 'normal');
  const [profIsAnnouncementEnabled, setProfIsAnnouncementEnabled] = useState(
    settings?.isAnnouncementEnabled !== undefined ? settings.isAnnouncementEnabled : true
  );
  const [newAnnouncementText, setNewAnnouncementText] = useState('');

  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [directLogoUrl, setDirectLogoUrl] = useState('');
  const [directBannerUrl, setDirectBannerUrl] = useState('');
  const [settingsSaveMsg, setSettingsSaveMsg] = useState('');

  // 🔐 Admin Password Change State
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [passwordChangeLoading, setPasswordChangeLoading] = useState(false);
  const [passwordChangeMsg, setPasswordChangeMsg] = useState('');
  const [passwordChangeError, setPasswordChangeError] = useState('');

  // Handle Admin Password Change
  const handleAdminPasswordChange = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setPasswordChangeMsg('');
    setPasswordChangeError('');

    if (!currentPasswordInput.trim() || !newPasswordInput.trim()) {
      setPasswordChangeError('অনুগ্রহ করে বর্তমান পাসওয়ার্ড এবং নতুন পাসওয়ার্ড উভয়টি পূরণ করুন।');
      return;
    }

    if (newPasswordInput.trim().length < 6) {
      setPasswordChangeError('নতুন পাসওয়ার্ডটি কমপক্ষে ৬ অক্ষরের হতে হবে।');
      return;
    }

    if (newPasswordInput.trim() !== confirmPasswordInput.trim()) {
      setPasswordChangeError('নতুন পাসওয়ার্ড এবং কনফার্ম পাসওয়ার্ড মিলছে না।');
      return;
    }

    setPasswordChangeLoading(true);
    const toastId = toast.loading('পাসওয়ার্ড পরিবর্তন করা হচ্ছে...');
    try {
      const res = await api.changeAdminPassword(
        currentPasswordInput.trim(),
        newPasswordInput.trim(),
        confirmPasswordInput.trim()
      );
      setPasswordChangeLoading(false);

      if (res && res.success) {
        setPasswordChangeMsg(res.message || '🎉 পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!');
        setCurrentPasswordInput('');
        setNewPasswordInput('');
        setConfirmPasswordInput('');
        toast.success(res.message || 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!', { id: toastId });
      } else {
        setPasswordChangeError(res?.message || 'পাসওয়ার্ড পরিবর্তন করা যায়নি। সঠিক তথ্য দিন।');
        toast.error(res?.message || 'পাসওয়ার্ড পরিবর্তন করা যায়নি', { id: toastId });
      }
    } catch (err) {
      setPasswordChangeLoading(false);
      setPasswordChangeError('সার্ভার ত্রুটি: ' + err.message);
      toast.error('সমস্যা হয়েছে: ' + err.message, { id: toastId });
    }
  };

  // Sync state if settings prop changes
  useEffect(() => {
    if (settings && Object.keys(settings).length > 0) {
      if (settings.brandName) setProfBrandName(settings.brandName);
      if (settings.brandLogo) setProfBrandLogo(settings.brandLogo);
      if (settings.heroBanner) setProfHeroBanner(settings.heroBanner);
      if (settings.phone) setProfPhone(settings.phone);
      if (settings.whatsappNumber) setProfWhatsapp(settings.whatsappNumber);
      if (settings.address) setProfAddress(settings.address);
      if (settings.slogan) setProfSlogan(settings.slogan);
      if (settings.facebookUrl) setProfFacebook(settings.facebookUrl);
      if (settings.shippingInsideDhaka !== undefined && settings.shippingInsideDhaka !== null) {
        setProfShippingInside(settings.shippingInsideDhaka);
      }
      if (settings.shippingOutsideDhaka !== undefined && settings.shippingOutsideDhaka !== null) {
        setProfShippingOutside(settings.shippingOutsideDhaka);
      }
      if (settings.announcements && Array.isArray(settings.announcements)) {
        setProfAnnouncements(settings.announcements);
      }
      if (settings.announcementSpeed) {
        setProfAnnouncementSpeed(settings.announcementSpeed);
      }
      if (settings.isAnnouncementEnabled !== undefined) {
        setProfIsAnnouncementEnabled(settings.isAnnouncementEnabled);
      }
    }
  }, [settings]);

  // Handle Logo Upload
  const handleLogoUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploadingLogo(true);
    const toastId = toast.loading('লোগো আপলোড হচ্ছে...');
    try {
      const urls = await api.uploadImages(files);
      setIsUploadingLogo(false);
      if (urls && urls.length > 0) {
        setProfBrandLogo(urls[0]);
        toast.success('🎉 লোগো সফলভাবে আপলোড হয়েছে!', { id: toastId });
      } else {
        toast.error('লোগো আপলোড করা যায়নি। আবার চেষ্টা করুন।', { id: toastId });
      }
    } catch (err) {
      setIsUploadingLogo(false);
      toast.error('লোগো আপলোডে সমস্যা হয়েছে।', { id: toastId });
    }
  };

  // Handle Hero Banner Upload
  const handleBannerUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploadingBanner(true);
    const toastId = toast.loading('হিরো ব্যানার আপলোড হচ্ছে...');
    try {
      const urls = await api.uploadImages(files);
      setIsUploadingBanner(false);
      if (urls && urls.length > 0) {
        setProfHeroBanner(urls[0]);
        toast.success('🎉 হিরো ব্যানার সফলভাবে আপলোড হয়েছে!', { id: toastId });
      } else {
        toast.error('ব্যানার আপলোড করা যায়নি।', { id: toastId });
      }
    } catch (err) {
      setIsUploadingBanner(false);
      toast.error('ব্যানার আপলোডে সমস্যা হয়েছে।', { id: toastId });
    }
  };

  // Handle Save Profile Settings
  const handleSaveProfileSettings = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const saveToastId = toast.loading('প্রোফাইল সেটিংস সংরক্ষণ হচ্ছে...');
    try {
      const insideVal = profShippingInside !== '' && !isNaN(Number(profShippingInside))
        ? Number(profShippingInside)
        : 0;
      const outsideVal = profShippingOutside !== '' && !isNaN(Number(profShippingOutside))
        ? Number(profShippingOutside)
        : 0;

      const payload = {
        brandName: profBrandName.trim() || 'হেলথ বাড়ি',
        brandLogo: profBrandLogo.trim() || '/images/healthbari_logo.png',
        heroBanner: profHeroBanner.trim() || '/images/healthbari_hero_banner.png',
        phone: profPhone.trim() || '01540-696573',
        whatsappNumber: profWhatsapp.trim() || '8801540696573',
        address: profAddress.trim() || 'কাশিমপুর, গাজীপুর',
        slogan: profSlogan.trim() || 'আপনার পরিবারের বিশ্বস্ত ডিজিটাল স্বাস্থ্য সঙ্গী',
        facebookUrl: profFacebook.trim() || 'https://facebook.com/healthbari',
        shippingInsideDhaka: insideVal,
        shippingOutsideDhaka: outsideVal,
        announcements: profAnnouncements,
        announcementSpeed: profAnnouncementSpeed,
        isAnnouncementEnabled: profIsAnnouncementEnabled
      };

      if (onUpdateSettings) {
        await onUpdateSettings(payload);
      }
      toast.success('🎉 প্রোফাইল ও সাইট সেটিংস সফলভাবে সংরক্ষিত হয়েছে!', { id: saveToastId, duration: 4000 });
      setSettingsSaveMsg('🎉 প্রোফাইল ও সাইট সেটিংস সফলভাবে সংরক্ষিত হয়েছে এবং মূল হোমপেজে লাইভ আপডেট হয়েছে!');
      setTimeout(() => setSettingsSaveMsg(''), 4000);
    } catch (err) {
      toast.error('সেটিংস সেভ করতে সমস্যা হয়েছে।', { id: saveToastId });
    }
  };

  // Announcement Handlers
  const handleAddAnnouncement = () => {
    if (!newAnnouncementText.trim()) {
      toast.error('অনুগ্রহ করে নোটিশের লেখা লিখুন!');
      return;
    }
    setProfAnnouncements(prev => [...prev, newAnnouncementText.trim()]);
    setNewAnnouncementText('');
    toast.success('নতুন নোটিশ লাইনটি যোগ হয়েছে!');
  };

  const handleRemoveAnnouncement = (index) => {
    setProfAnnouncements(prev => prev.filter((_, i) => i !== index));
    toast.success('নোটিশটি মুছে ফেলা হয়েছে!');
  };

  const handleUpdateAnnouncementText = (index, val) => {
    setProfAnnouncements(prev => {
      const updated = [...prev];
      updated[index] = val;
      return updated;
    });
  };

  const handleAddTemplateAnnouncement = (templateText) => {
    setProfAnnouncements(prev => [...prev, templateText]);
    toast.success('টেমপ্লেট লাইন যোগ হয়েছে!');
  };

  // Product Add / Edit Modal
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Form fields for Product
  const [prodTitle, setProdTitle] = useState('');
  const [prodEnglishTitle, setProdEnglishTitle] = useState('');
  const [prodImages, setProdImages] = useState(['/images/glucometer.png']);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [directImageLink, setDirectImageLink] = useState('');
  const [prodCategory, setProdCategory] = useState(categories[0]?.name || 'ব্লাড প্রেশার ও হার্ট');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryName, setCustomCategoryName] = useState('');
  const [prodStockCount, setProdStockCount] = useState('50');
  const [prodHealthNote, setProdHealthNote] = useState('');

  // Multi-variant packages state
  const [prodVariants, setProdVariants] = useState([
    { name: 'ফুল কিট (মেশিন + ৫০টি টেস্ট স্ট্রিপ + ৫০টি ল্যানসেট)', price: '1390', originalPrice: '1800' },
    { name: 'মেগা সেভার প্যাক (মেশিন + ১০০টি স্ট্রিপ + ১০০টি ল্যানসেট)', price: '1990', originalPrice: '2500' }
  ]);

  // Description & Highlights (bullets)
  const [prodHighlightsText, setProdHighlightsText] = useState(
    '• মাত্র ৫ সেকেন্ডে এবং মাত্র ০.৬ মাইক্রোলিটার রক্তে সঠিক ফলাফল\n• কোনো কোডিং এর ঝামেলা নেই - অটোমেটিক স্ট্রিপ রিকগনিশন\n• অটো স্ট্রিপ ইজেকশন সিস্টেম - রক্তমাখা স্ট্রিপ না ছুঁয়েই ফেলা যায়\n• ৫০০ টেস্ট মেমোরি ও ৭, ১৪ এবং ৩০ দিনের গড় সুগার হিসাব\n• লাইফটাইম ডিভাইস রিপ্লেসমেন্ট গ্যারান্টি'
  );

  // Usage guidelines
  const [prodUsageText, setProdUsageText] = useState(
    '১. হাত সাবান ও কুসুম গরম পানিতে ধুয়ে ভালো করে শুকিয়ে নিন।\n২. ল্যানসিং ডিভাইসে নতুন জীবাণুমুক্ত ল্যানসেট সেট করুন।\n৩. টেস্ট স্ট্রিপ মেশিনে প্রবেশ করান এবং রক্ত স্পর্শ করুন।\n৪. ৫ সেকেন্ডে ডিসপ্লেতে সঠিক ফলাফল দেখুন ও রেকর্ড রাখুন।'
  );

  // Statistics Calculations
  const deliveredOrders = orders.filter(o => o.status === 'Delivered');
  const deliveredRevenue = deliveredOrders.reduce((sum, o) => sum + (Number(o.grandTotal) || 0), 0);
  const totalRevenue = deliveredRevenue;

  const pendingOrders = orders.filter(o => o.status === 'Pending');
  const pendingAmount = pendingOrders.reduce((sum, o) => sum + (Number(o.grandTotal) || 0), 0);

  const processingOrders = orders.filter(o => o.status === 'Processing');
  const processingAmount = processingOrders.reduce((sum, o) => sum + (Number(o.grandTotal) || 0), 0);

  const inCourierOrders = orders.filter(o => o.status === 'In Courier');
  const inCourierAmount = inCourierOrders.reduce((sum, o) => sum + (Number(o.grandTotal) || 0), 0);

  const cancelledOrders = orders.filter(o => o.status === 'Cancelled' || o.status === 'Returned');
  const cancelledAmount = cancelledOrders.reduce((sum, o) => sum + (Number(o.grandTotal) || 0), 0);
  const returnedOrders = orders.filter(o => o.status === 'Returned');

  // Courier Charge Calculations
  const getOrderShippingCharge = (o) => {
    if (o.shippingCharge !== undefined && o.shippingCharge !== null) return Number(o.shippingCharge) || 0;
    if (o.shipping_charge !== undefined && o.shipping_charge !== null) return Number(o.shipping_charge) || 0;
    return 0;
  };

  const totalCourierCharge = orders.reduce((sum, o) => sum + getOrderShippingCharge(o), 0);
  const deliveredCourierCharge = deliveredOrders.reduce((sum, o) => sum + getOrderShippingCharge(o), 0);
  const inCourierCharge = inCourierOrders.reduce((sum, o) => sum + getOrderShippingCharge(o), 0);
  const pendingCourierCharge = pendingOrders.reduce((sum, o) => sum + getOrderShippingCharge(o), 0);
  const courierOrdersCount = orders.filter(o => o.courierInfo?.trackingCode || o.tracking_code || o.status === 'In Courier' || o.status === 'Delivered').length;

  // ========================================================
  // 📦 STOCK & INVENTORY MANAGEMENT STATE & COMPUTATIONS
  // ========================================================
  const [stockSearch, setStockSearch] = useState('');
  const [stockFilter, setStockFilter] = useState('all'); // 'all', 'in_stock', 'low_stock', 'out_of_stock'
  const [stockInModalProduct, setStockInModalProduct] = useState(null);
  const [stockInQty, setStockInQty] = useState(20);
  const [stockInNote, setStockInNote] = useState('');
  const [isStockInSubmitting, setIsStockInSubmitting] = useState(false);

  // Helper to compute sold quantity from valid orders
  const getProductSoldUnits = (productId) => {
    let count = 0;
    orders.forEach(ord => {
      if (ord.status !== 'Cancelled') {
        (ord.items || []).forEach(item => {
          if (item.productId === productId || item.id === productId || item.title === productId) {
            count += (Number(item.quantity) || 1);
          }
        });
      }
    });
    return count;
  };

  // Stock inventory dynamic list
  const stockInventoryList = products.map(p => {
    const soldUnits = getProductSoldUnits(p.id);
    const remainingStock = Number(p.stockCount !== undefined ? p.stockCount : 0);
    const totalStock = Number(p.totalStock || (remainingStock + soldUnits));
    const isOutOfStock = remainingStock <= 0;
    const isLowStock = remainingStock > 0 && remainingStock <= 10;
    return {
      ...p,
      soldUnits,
      remainingStock,
      totalStock,
      isOutOfStock,
      isLowStock
    };
  });

  const totalInventoryStock = stockInventoryList.reduce((sum, p) => sum + p.totalStock, 0);
  const totalSoldStock = stockInventoryList.reduce((sum, p) => sum + p.soldUnits, 0);
  const totalRemainingStock = stockInventoryList.reduce((sum, p) => sum + p.remainingStock, 0);
  const lowStockCount = stockInventoryList.filter(p => p.remainingStock <= 10).length;

  // Filtered Stock List for Table
  const filteredStockList = stockInventoryList.filter(p => {
    let matchesFilter = true;
    if (stockFilter === 'in_stock') {
      matchesFilter = p.remainingStock > 10;
    } else if (stockFilter === 'low_stock') {
      matchesFilter = p.isLowStock;
    } else if (stockFilter === 'out_of_stock') {
      matchesFilter = p.isOutOfStock;
    }
    const q = stockSearch.toLowerCase().trim();
    const matchesSearch = !q ||
      p.title.toLowerCase().includes(q) ||
      (p.englishTitle && p.englishTitle.toLowerCase().includes(q)) ||
      (p.category && p.category.toLowerCase().includes(q));
    return matchesFilter && matchesSearch;
  });

  // Handle Stock In Submit
  const handleStockInSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!stockInModalProduct) return;
    const qtyToAdd = Math.max(1, Number(stockInQty) || 0);
    if (qtyToAdd <= 0) {
      toast.error('অনুগ্রহ করে সঠিক স্টক সংখ্যা লিখুন!');
      return;
    }

    setIsStockInSubmitting(true);
    try {
      const prod = stockInModalProduct;
      const currentRemaining = Number(prod.stockCount !== undefined ? prod.stockCount : 0);
      const newRemaining = currentRemaining + qtyToAdd;
      const currentTotal = Number(prod.totalStock || (currentRemaining + getProductSoldUnits(prod.id)));
      const newTotal = currentTotal + qtyToAdd;

      const payload = {
        ...prod,
        stockCount: newRemaining,
        totalStock: newTotal,
        inStock: true
      };

      if (onUpdateProduct) {
        await onUpdateProduct(prod.id, payload);
      }

      toast.success(`🎉 '${prod.title}'-এ +${qtyToAdd}টি নতুন স্টক সফলভাবে যুক্ত হয়েছে! বর্তমান অবশিষ্ট স্টক: ${newRemaining}টি`);
      setStockInModalProduct(null);
      setStockInQty(20);
      setStockInNote('');
    } catch (err) {
      toast.error('স্টক আপডেট করতে সমস্যা হয়েছে।');
    } finally {
      setIsStockInSubmitting(false);
    }
  };

  // Quick 1-Click Stock In (+10, +25, +50, +100)
  const handleQuickStockIn = async (prod, qtyToAdd) => {
    const currentRemaining = Number(prod.stockCount !== undefined ? prod.stockCount : 0);
    const newRemaining = currentRemaining + qtyToAdd;
    const currentTotal = Number(prod.totalStock || (currentRemaining + getProductSoldUnits(prod.id)));
    const newTotal = currentTotal + qtyToAdd;

    const payload = {
      ...prod,
      stockCount: newRemaining,
      totalStock: newTotal,
      inStock: true
    };

    if (onUpdateProduct) {
      await onUpdateProduct(prod.id, payload);
    }
    toast.success(`🎉 '${prod.title}'-এ +${qtyToAdd}টি স্টক ইন হয়েছে! (অবশিষ্ট: ${newRemaining}টি)`);
  };

  // Filtered Orders
  const filteredOrders = orders.filter(o => {
    let matchesFilter = true;
    if (orderFilter !== 'all') {
      matchesFilter = o.status === orderFilter;
    }
    const q = orderSearch.toLowerCase().trim();
    const matchesSearch = !q ||
      (o.orderId && o.orderId.toLowerCase().includes(q)) ||
      (o.customer?.name && o.customer.name.toLowerCase().includes(q)) ||
      (o.customer?.phone && o.customer.phone.includes(q)) ||
      (o.courierInfo?.trackingCode && o.courierInfo.trackingCode.toLowerCase().includes(q));
    return matchesFilter && matchesSearch;
  });

  // Status Badge Renderer with Distinct Background Colors
  const renderOrderStatusBadge = (status) => {
    switch (status) {
      case 'Returned':
      case 'Cancelled':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 10px',
            borderRadius: '50px',
            fontSize: '0.78rem',
            fontWeight: 800,
            background: '#ffe4e6', // 🔴 Red Background
            color: '#be123c', // 🔴 Red Text
            border: '1.5px solid #fecdd3'
          }}>
            ● রিটার্ন
          </span>
        );
      case 'Processing':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 10px',
            borderRadius: '50px',
            fontSize: '0.78rem',
            fontWeight: 800,
            background: '#fef9c3', // 🟡 Yellow Background
            color: '#854d0e', // 🟡 Yellow/Amber Text
            border: '1.5px solid #fde047'
          }}>
            ● প্যাকেজিং
          </span>
        );
      case 'Pending':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 10px',
            borderRadius: '50px',
            fontSize: '0.78rem',
            fontWeight: 800,
            background: '#fef3c7', // 🟡 Amber/Yellow Background
            color: '#b45309', // 🟡 Amber Text
            border: '1.5px solid #fde68a'
          }}>
            ● রিসিভড
          </span>
        );
      case 'In Courier':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 10px',
            borderRadius: '50px',
            fontSize: '0.78rem',
            fontWeight: 800,
            background: '#e0f2fe', // 🔵 Blue Background
            color: '#0369a1', // 🔵 Blue Text
            border: '1.5px solid #bae6fd'
          }}>
            ● কুরিয়ারে
          </span>
        );
      case 'Delivered':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 10px',
            borderRadius: '50px',
            fontSize: '0.78rem',
            fontWeight: 800,
            background: '#dcfce7', // 🟢 Green Background
            color: '#15803d', // 🟢 Green Text
            border: '1.5px solid #86efac'
          }}>
            ✓ ডেলিভার্ড
          </span>
        );
      default:
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 10px',
            borderRadius: '50px',
            fontSize: '0.78rem',
            fontWeight: 800,
            background: '#f1f5f9',
            color: '#475569',
            border: '1.5px solid #cbd5e1'
          }}>
            {status}
          </span>
        );
    }
  };

  // Render Delivery Type / Charge Badge
  const renderDeliveryType = (o) => {
    const charge = (o.shippingCharge !== undefined && o.shippingCharge !== null)
      ? Number(o.shippingCharge)
      : (o.shipping_charge !== undefined && o.shipping_charge !== null ? Number(o.shipping_charge) : 0);

    if (charge === 0) {
      return (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '3px',
          padding: '3px 8px',
          borderRadius: '50px',
          background: '#dcfce7',
          color: '#15803d',
          fontWeight: 800,
          fontSize: '0.75rem',
          border: '1px solid #bbf7d0',
          whiteSpace: 'nowrap'
        }}>
          🎁 ফ্রি ডেলিভারি
        </span>
      );
    }

    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '3px',
        padding: '3px 8px',
        borderRadius: '50px',
        background: '#f0fdfa',
        color: '#0f766e',
        fontWeight: 800,
        fontSize: '0.78rem',
        border: '1px solid #99f6e4',
        whiteSpace: 'nowrap'
      }} className="font-numeric">
        🚚 {charge}৳
      </span>
    );
  };

  // Filtered Health Articles
  const filteredArticles = articles.filter(art => {
    const s = articleSearch.toLowerCase();
    return art.title?.toLowerCase().includes(s) ||
      art.category?.toLowerCase().includes(s) ||
      art.summary?.toLowerCase().includes(s);
  });

  // Article Handlers (Add, Edit, Delete)
  const handleOpenAddArticle = () => {
    setEditingArticle(null);
    setArtTitle('');
    setArtCategory('হার্ট ও ব্লাড প্রেশার');
    setArtReadTime('৪ মিনিট পড়া');
    setArtSummary('');
    setArtContentText('• নিয়মিত স্বাস্থ্য পরিমাপ নিন এবং চিকিৎসকের পরামর্শ অনুযায়ী ডাটা রেকর্ড রাখুন।\n• সঠিক স্বাস্থ্যবিধির মাধ্যমে পরিবারকে যে কোনো মেডিকেল ইমার্জেন্সি থেকে নিরাপদ রাখুন।');
    setArtRecommendedProduct(products[0]?.id || 'bp-monitor-pro');
    setIsArticleModalOpen(true);
  };

  const handleOpenEditArticle = (art) => {
    setEditingArticle(art);
    setArtTitle(art.title || '');
    setArtCategory(art.category || 'হার্ট ও ব্লাড প্রেশার');
    setArtReadTime(art.readTime || '৪ মিনিট পড়া');
    setArtSummary(art.summary || '');
    setArtContentText(Array.isArray(art.content) ? art.content.join('\n') : (art.content || ''));
    setArtRecommendedProduct(art.recommendedProductId || products[0]?.id || '');
    setIsArticleModalOpen(true);
  };

  const handleSaveArticle = (e) => {
    e.preventDefault();
    if (!artTitle.trim() || !artSummary.trim()) return;

    const parsedContent = artContentText
      .split('\n')
      .map(s => s.trim().replace(/^[•\-\*✔]\s*/, ''))
      .filter(s => s.length > 0);

    const payload = {
      title: artTitle.trim(),
      category: artCategory.trim(),
      readTime: artReadTime.trim() || '৪ মিনিট পড়া',
      summary: artSummary.trim(),
      content: parsedContent,
      recommendedProductId: artRecommendedProduct || null
    };

    if (editingArticle) {
      if (onUpdateArticle) onUpdateArticle(editingArticle.id, payload);
      toast.success('স্বাস্থ্য তথ্য সফলভাবে আপডেট হয়েছে!');
    } else {
      if (onAddArticle) onAddArticle(payload);
      toast.success('🎉 নতুন স্বাস্থ্য তথ্য সফলভাবে পাবলিশ হয়েছে!');
    }

    setIsArticleModalOpen(false);
  };

  const handleDeleteArticleClick = (artId) => {
    if (window.confirm('আপনি কি নিশ্চিত যে এই স্বাস্থ্য তথ্যটি মুছে ফেলতে চান?')) {
      if (onDeleteArticle) onDeleteArticle(artId);
      toast.success('স্বাস্থ্য তথ্যটি মুছে ফেলা হয়েছে!');
    }
  };

  // Handle Category Add
  const handleCreateCategorySubmit = (e) => {
    e.preventDefault();
    if (!newCatName.trim()) {
      setCatError('ক্যাটাগরির নাম লিখুন।');
      toast.error('ক্যাটাগরির নাম লিখুন।');
      return;
    }
    setCatError('');
    onAddCategory(newCatName.trim());
    toast.success(`'${newCatName.trim()}' ক্যাটাগরি তৈরি হয়েছে!`);
    setNewCatName('');
  };

  // ==========================================
  // 🎟️ COUPON ACTION HANDLERS
  // ==========================================
  const handleOpenAddCoupon = () => {
    setEditingCoupon(null);
    setCpCode('');
    setCpDiscountType('fixed');
    setCpDiscountAmount('');
    setCpMinPurchase('');
    setCpMaxDiscount('');
    setCpExpiryDate('2026-12-31');
    setCpUsageLimit(100);
    setCpIsActive(true);
    setIsCouponModalOpen(true);
  };

  const handleOpenEditCoupon = (cp) => {
    setEditingCoupon(cp);
    setCpCode(cp.code);
    setCpDiscountType(cp.discountType || 'fixed');
    setCpDiscountAmount(cp.discountAmount);
    setCpMinPurchase(cp.minPurchase || '');
    setCpMaxDiscount(cp.maxDiscount || '');
    setCpExpiryDate(cp.expiryDate || '');
    setCpUsageLimit(cp.usageLimit || 100);
    setCpIsActive(cp.isActive !== undefined ? cp.isActive : true);
    setIsCouponModalOpen(true);
  };

  const handleSaveCoupon = async (e) => {
    e.preventDefault();
    if (!cpCode.trim()) {
      toast.error('কুপন কোড লিখুন!');
      return;
    }
    if (!cpDiscountAmount || Number(cpDiscountAmount) <= 0) {
      toast.error('সঠিক ডিসকাউন্ট পরিমাণ দিন!');
      return;
    }
    setIsSavingCoupon(true);
    const toastId = toast.loading(editingCoupon ? 'কুপন আপডেট হচ্ছে...' : 'নতুন কুপন তৈরি হচ্ছে...');
    try {
      const payload = {
        code: cpCode.trim().toUpperCase(),
        discountType: cpDiscountType,
        discountAmount: Number(cpDiscountAmount),
        minPurchase: cpMinPurchase ? Number(cpMinPurchase) : 0,
        maxDiscount: cpMaxDiscount ? Number(cpMaxDiscount) : 0,
        expiryDate: cpExpiryDate || '',
        usageLimit: cpUsageLimit ? Number(cpUsageLimit) : 100,
        isActive: cpIsActive
      };

      if (editingCoupon) {
        const res = await api.updateCoupon(editingCoupon.id, payload);
        setIsSavingCoupon(false);
        if (res.success) {
          setCouponsList(prev => prev.map(c => c.id === editingCoupon.id ? (res.coupon || { ...c, ...payload }) : c));
          toast.success('🎉 কুপন সফলভাবে আপডেট হয়েছে!', { id: toastId });
          setIsCouponModalOpen(false);
        } else {
          toast.error(res.message || 'কুপন আপডেট করা যায়নি।', { id: toastId });
        }
      } else {
        const res = await api.createCoupon(payload);
        setIsSavingCoupon(false);
        if (res.success) {
          setCouponsList(prev => [res.coupon || { id: 'cp-' + Date.now(), ...payload, usedCount: 0 }, ...prev]);
          toast.success('🎉 নতুন কুপন সফলভাবে তৈরি হয়েছে!', { id: toastId });
          setIsCouponModalOpen(false);
        } else {
          toast.error(res.message || 'কুপন তৈরি করা যায়নি।', { id: toastId });
        }
      }
    } catch (err) {
      setIsSavingCoupon(false);
      toast.error('সমস্যা হয়েছে: ' + err.message, { id: toastId });
    }
  };

  const handleToggleCouponStatus = async (cp) => {
    const newStatus = !cp.isActive;
    const toastId = toast.loading(`${cp.code} ${newStatus ? 'সক্রিয়' : 'নিষ্ক্রিয়'} করা হচ্ছে...`);
    try {
      const res = await api.updateCoupon(cp.id, { isActive: newStatus });
      if (res.success) {
        setCouponsList(prev => prev.map(c => c.id === cp.id ? { ...c, isActive: newStatus } : c));
        toast.success(`কুপনটি এখন ${newStatus ? 'সক্রিয় (Active)' : 'বন্ধ (Inactive)'}!`, { id: toastId });
      } else {
        toast.error('স্ট্যাটাস পরিবর্তন করা যায়নি।', { id: toastId });
      }
    } catch (err) {
      toast.error('ত্রুটি: ' + err.message, { id: toastId });
    }
  };

  const handleDeleteCoupon = async (id, code) => {
    if (!window.confirm(`আপনি কি নিশ্চিত যে "${code}" কুপনটি ডিলিট করতে চান?`)) return;
    const toastId = toast.loading('কুপন ডিলিট হচ্ছে...');
    try {
      const res = await api.deleteCoupon(id);
      if (res.success) {
        setCouponsList(prev => prev.filter(c => c.id !== id));
        toast.success('কুপনটি সফলভাবে মুছে ফেলা হয়েছে!', { id: toastId });
      } else {
        toast.error('কুপন ডিলিট করা যায়নি।', { id: toastId });
      }
    } catch (err) {
      toast.error('ত্রুটি: ' + err.message, { id: toastId });
    }
  };

  const handleCopyCouponCode = (code) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code);
    }
    toast.success(`📋 "${code}" কোডটি কপি করা হয়েছে!`);
  };

  const filteredCoupons = couponsList.filter(c => {
    const matchesSearch = c.code.toLowerCase().includes(couponSearch.toLowerCase());
    if (couponFilter === 'active') return matchesSearch && c.isActive;
    if (couponFilter === 'inactive') return matchesSearch && !c.isActive;
    if (couponFilter === 'percentage') return matchesSearch && c.discountType === 'percentage';
    if (couponFilter === 'fixed') return matchesSearch && c.discountType === 'fixed';
    return matchesSearch;
  });

  // Image Upload Handlers (Max 5 Images)
  const handleImageFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingImage(true);
    const uploadedUrls = await api.uploadImages(files);
    setIsUploadingImage(false);

    if (uploadedUrls && uploadedUrls.length > 0) {
      setProdImages(prev => {
        const combined = [...prev.filter(u => u !== '/images/glucometer.png' || prev.length > 1), ...uploadedUrls];
        return combined.slice(0, 5);
      });
    }
  };

  const handleRemoveUploadedImage = (index) => {
    setProdImages(prev => {
      const updated = prev.filter((_, i) => i !== index);
      return updated.length === 0 ? ['/images/glucometer.png'] : updated;
    });
  };

  const handleAddDirectLink = () => {
    if (!directImageLink.trim()) return;
    setProdImages(prev => {
      const combined = [...prev.filter(u => u !== '/images/glucometer.png' || prev.length > 1), directImageLink.trim()];
      return combined.slice(0, 5);
    });
    setDirectImageLink('');
  };

  // Variant Rows Handlers
  const handleAddVariantRow = () => {
    setProdVariants(prev => [
      ...prev,
      { name: 'নতুন প্যাকেজ / সাইজ', price: '1490', originalPrice: '1900' }
    ]);
  };

  const handleUpdateVariantRow = (index, field, value) => {
    setProdVariants(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleRemoveVariantRow = (index) => {
    setProdVariants(prev => prev.filter((_, i) => i !== index));
  };

  // Open Edit Product Modal
  const handleOpenEdit = (p) => {
    setEditingProduct(p);
    setProdTitle(p.title);
    setProdEnglishTitle(p.englishTitle || '');
    setProdImages(p.images && p.images.length > 0 ? p.images : ['/images/glucometer.png']);
    setProdCategory(p.category || categories[0]?.name || 'ব্লাড প্রেশার ও হার্ট');
    setIsCustomCategory(false);
    setCustomCategoryName('');
    setProdStockCount(p.stockCount?.toString() || '50');
    setProdHealthNote(p.healthNote || '');

    // Populate variants
    if (p.variants && p.variants.length > 0) {
      setProdVariants(p.variants.map(v => ({
        name: v.name,
        price: v.price?.toString() || '',
        originalPrice: v.originalPrice?.toString() || ''
      })));
    } else {
      setProdVariants([{ name: 'স্ট্যান্ডার্ড প্যাকেজ', price: '1490', originalPrice: '1900' }]);
    }

    // Populate Highlights
    if (p.highlights && p.highlights.length > 0) {
      setProdHighlightsText(p.highlights.join('\n'));
    } else {
      setProdHighlightsText('• ১০০% অরিজিনাল মেডিকেল ডিভাইস\n• ২ বছরের রিপ্লেসমেন্ট ওয়ারেন্টি');
    }

    // Populate Usage Guide
    if (p.usageGuide && p.usageGuide.length > 0) {
      setProdUsageText(p.usageGuide.join('\n'));
    } else {
      setProdUsageText('১. ডিভাইসটি অন করে নির্দেশিকা অনুযায়ী মাপ নিন।\n২. ব্যবহারের পর নিরাপদে সংরক্ষণ করুন।');
    }

    setIsProductModalOpen(true);
  };

  // Open Add Product Modal
  const handleOpenAdd = () => {
    setEditingProduct(null);
    setProdTitle('');
    setProdEnglishTitle('');
    setProdImages(['/images/glucometer.png']);
    setDirectImageLink('');
    setProdCategory(categories[0]?.name || 'ব্লাড প্রেশার ও হার্ট');
    setIsCustomCategory(false);
    setCustomCategoryName('');
    setProdStockCount('50');
    setProdHealthNote('বি. দ্র: সকালে খালি পেটে (Fasting) এবং খাওয়ার ২ ঘণ্টা পর নিয়মিত সুগার রেকর্ড রাখুন।');

    // Set 2 default combo package variants
    setProdVariants([
      { name: 'ফুল কিট (মেশিন + ৫০টি টেস্ট স্ট্রিপ + ৫০টি ল্যানসেট + ল্যানসিং পেন)', price: '1390', originalPrice: '1800' },
      { name: 'মেগা সেভার প্যাক (মেশিন + ১০০টি স্ট্রিপ + ১০০টি ল্যানসেট)', price: '1990', originalPrice: '2500' }
    ]);

    setProdHighlightsText(
      '• মাত্র ৫ সেকেন্ডে এবং মাত্র ০.৬ মাইক্রোলিটার রক্তে সঠিক ফলাফল\n• কোনো কোডিং এর ঝামেলা নেই - অটোমেটিক স্ট্রিপ রিকগনিশন\n• অটো স্ট্রিপ ইজেকশন সিস্টেম - রক্তমাখা স্ট্রিপ না ছুঁয়েই ফেলা যায়\n• ৫০০ টেস্ট মেমোরি ও ৭, ১৪ এবং ৩০ দিনের গড় সুগার হিসাব\n• হাই এবং লো সুগার ওয়ার্নিং অ্যালার্ম ফিচার\n• লাইফটাইম ডিভাইস রিপ্লেসমেন্ট গ্যারান্টি'
    );

    setProdUsageText(
      '১. হাত সাবান ও কুসুম গরম পানিতে ভালোভাবে ধুয়ে শুকিয়ে নিন।\n২. ল্যানসিং ডিভাইসে নতুন জীবাণুমুক্ত ল্যানসেট প্রবেশ করান।\n৩. টেস্ট স্ট্রিপটি গ্লুকোমিটার মেশিনে প্রবেশ করালে স্বয়ংক্রিয়ভাবে অন হবে।\n৪. আঙুলের মাথায় হালকা চাপ দিয়ে এক ফোঁটা রক্ত স্ট্রিপের মাথায় স্পর্শ করুন।'
    );

    setIsProductModalOpen(true);
  };

  // Save Product (Add or Edit)
  const handleSaveProduct = (e) => {
    e.preventDefault();
    if (!prodTitle.trim() || prodVariants.length === 0) return;

    // Final selected or custom category
    let finalCategory = prodCategory;
    if (isCustomCategory && customCategoryName.trim()) {
      finalCategory = customCategoryName.trim();
      onAddCategory(finalCategory);
    }

    // Parse Highlights array from text
    const parsedHighlights = prodHighlightsText
      .split('\n')
      .map(s => s.trim().replace(/^[•\-\*]\s*/, ''))
      .filter(s => s.length > 0);

    // Parse Usage Guide array from text
    const parsedUsageGuide = prodUsageText
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    // Parse Variants
    const parsedVariants = prodVariants.map((v, idx) => ({
      id: 'v-' + Date.now() + '-' + idx,
      name: v.name,
      price: Number(v.price) || 1490,
      originalPrice: Number(v.originalPrice) || Number(v.price) || 1900,
      saveAmount: (Number(v.originalPrice) || 0) > (Number(v.price) || 0) ? (Number(v.originalPrice) - Number(v.price)) : 0,
      isDefault: idx === 0
    }));

    const primaryPrice = parsedVariants[0]?.price || 1490;
    const primaryOriginalPrice = parsedVariants[0]?.originalPrice || 1900;

    const productPayload = {
      title: prodTitle,
      englishTitle: prodEnglishTitle || prodTitle,
      price: primaryPrice,
      originalPrice: primaryOriginalPrice,
      category: finalCategory,
      stockCount: Number(prodStockCount) || 50,
      images: prodImages.length > 0 ? prodImages : ['/images/glucometer.png'],
      variants: parsedVariants,
      highlights: parsedHighlights,
      usageGuide: parsedUsageGuide,
      healthNote: prodHealthNote
    };

    if (editingProduct) {
      onUpdateProduct(editingProduct.id, productPayload);
      toast.success('পণ্য সফলভাবে আপডেট করা হয়েছে!');
    } else {
      onAddProduct(productPayload);
      toast.success('🎉 নতুন পণ্য সফলভাবে যুক্ত করা হয়েছে!');
    }

    setIsProductModalOpen(false);
  };

  return (
    <div className="admin-dashboard-container">

      {/* Mobile Drawer Backdrop Overlay */}
      {isMobileMenuOpen && (
        <div
          className="admin-mobile-backdrop"
          onClick={() => setIsMobileMenuOpen(false)}
          title="মেনু বন্ধ করতে ক্লিক করুন"
        />
      )}

      {/* ========================================================= */}
      {/* 👈 বাম পাশের মেনু (LEFT SIDEBAR NAVIGATION) */}
      {/* ========================================================= */}
      <aside className={`admin-sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
        <div>
          {/* Brand Header: Click to go to Home Page + Mobile Close Button */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: '1.25rem',
              borderBottom: '1px solid #334155',
              marginBottom: '1.25rem'
            }}
          >
            <div
              onClick={() => {
                setIsMobileMenuOpen(false);
                onBackToStore();
              }}
              title="হোম পেজে ফিরে যান"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                cursor: 'pointer',
                userSelect: 'none',
                transition: 'opacity 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.85'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              <div style={{ width: 40, height: 40, borderRadius: '10px', background: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
                <HeartPulse size={22} />
              </div>
              <div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#5eead4', lineHeight: 1.1 }}>হেলথ বাড়ি</div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>এডমিন প্যানেল</div>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(false)}
              className="show-mobile-flex"
              style={{
                background: '#1e293b',
                border: '1px solid #334155',
                color: '#cbd5e1',
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              title="মেনু বন্ধ করুন"
            >
              <X size={18} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>

            <button
              onClick={() => handleTabChange('overview')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                border: 'none',
                background: activeTab === 'overview' ? '#0d9488' : 'transparent',
                color: activeTab === 'overview' ? '#ffffff' : '#cbd5e1',
                fontWeight: 600,
                fontSize: '0.95rem',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease'
              }}
            >
              <LayoutDashboard size={18} />
              <span>ড্যাশবোর্ড ওভারভিউ</span>
            </button>

            <button
              onClick={() => handleTabChange('orders')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                border: 'none',
                background: activeTab === 'orders' ? '#0d9488' : 'transparent',
                color: activeTab === 'orders' ? '#ffffff' : '#cbd5e1',
                fontWeight: 600,
                fontSize: '0.95rem',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <ShoppingBag size={18} />
                <span>অর্ডার ম্যানেজমেন্ট</span>
              </div>
              {pendingOrders.length > 0 && (
                <span style={{ background: '#ea580c', color: '#ffffff', fontSize: '0.75rem', padding: '2px 7px', borderRadius: '50px', fontWeight: 800 }}>
                  {pendingOrders.length}
                </span>
              )}
            </button>

            <button
              onClick={() => handleTabChange('products')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                border: 'none',
                background: activeTab === 'products' ? '#0d9488' : 'transparent',
                color: activeTab === 'products' ? '#ffffff' : '#cbd5e1',
                fontWeight: 600,
                fontSize: '0.95rem',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease'
              }}
            >
              <Package size={18} />
              <span>পণ্য ম্যানেজমেন্ট</span>
            </button>

            {/* Stock / Inventory Management Tab */}
            <button
              onClick={() => handleTabChange('stock')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                border: 'none',
                background: activeTab === 'stock' ? '#0d9488' : 'transparent',
                color: activeTab === 'stock' ? '#ffffff' : '#cbd5e1',
                fontWeight: 600,
                fontSize: '0.95rem',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Boxes size={18} />
                <span>স্টক ম্যানেজমেন্ট</span>
              </div>
              {lowStockCount > 0 && (
                <span style={{ background: '#e11d48', color: '#ffffff', fontSize: '0.72rem', padding: '2px 7px', borderRadius: '50px', fontWeight: 800 }}>
                  {lowStockCount} লো স্টক
                </span>
              )}
            </button>

            {/* Categories Management Tab */}
            <button
              onClick={() => handleTabChange('categories')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                border: 'none',
                background: activeTab === 'categories' ? '#0d9488' : 'transparent',
                color: activeTab === 'categories' ? '#ffffff' : '#cbd5e1',
                fontWeight: 600,
                fontSize: '0.95rem',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease'
              }}
            >
              <Tags size={18} />
              <span>ক্যাটাগরি ম্যানেজমেন্ট</span>
            </button>

            {/* Coupon Code Management Tab */}
            <button
              onClick={() => handleTabChange('coupons')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                border: 'none',
                background: activeTab === 'coupons' ? '#0d9488' : 'transparent',
                color: activeTab === 'coupons' ? '#ffffff' : '#cbd5e1',
                fontWeight: 600,
                fontSize: '0.95rem',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Ticket size={18} />
                <span>কুপন ম্যানেজমেন্ট</span>
              </div>
              {couponsList.filter(c => c.isActive).length > 0 && (
                <span style={{ background: '#059669', color: '#ffffff', fontSize: '0.75rem', padding: '2px 7px', borderRadius: '50px', fontWeight: 800 }}>
                  {couponsList.filter(c => c.isActive).length}
                </span>
              )}
            </button>

            {/* Health Guides & Doctor Tips Tab */}
            <button
              onClick={() => handleTabChange('articles')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                border: 'none',
                background: activeTab === 'articles' ? '#0d9488' : 'transparent',
                color: activeTab === 'articles' ? '#ffffff' : '#cbd5e1',
                fontWeight: 600,
                fontSize: '0.95rem',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease'
              }}
            >
              <BookOpen size={18} />
              <span>স্বাস্থ্য গাইড ও টিপস</span>
            </button>

            {/* Profile & Site Settings Dropdown with Sub-menus */}
            <div>
              <button
                type="button"
                onClick={() => setIsProfileDropdownOpen(prev => !prev)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  border: 'none',
                  background: (activeTab === 'profile' || activeTab === 'password') ? 'rgba(13, 148, 136, 0.25)' : 'transparent',
                  color: (activeTab === 'profile' || activeTab === 'password') ? '#5eead4' : '#cbd5e1',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Settings size={18} />
                  <span>প্রোফাইল ও সাইট সেটআপ</span>
                </div>
                {isProfileDropdownOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {/* Sub-menu Items Container */}
              {isProfileDropdownOpen && (
                <div style={{
                  paddingLeft: '1.25rem',
                  marginTop: '0.35rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.3rem',
                  borderLeft: '2px solid rgba(13, 148, 136, 0.4)',
                  marginLeft: '1.1rem'
                }}>

                  {/* 1. Sub-menu: প্রোফাইল সেটাপ */}
                  <button
                    type="button"
                    onClick={() => handleTabChange('profile')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.65rem',
                      padding: '0.6rem 0.85rem',
                      borderRadius: '8px',
                      border: 'none',
                      background: activeTab === 'profile' ? '#0d9488' : 'transparent',
                      color: activeTab === 'profile' ? '#ffffff' : '#cbd5e1',
                      fontWeight: activeTab === 'profile' ? 700 : 500,
                      fontSize: '0.88rem',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <User size={15} />
                    <span>প্রোফাইল সেটাপ</span>
                  </button>

                  {/* 2. Sub-menu: পাসওয়ার্ড পরিবর্তন */}
                  <button
                    type="button"
                    onClick={() => handleTabChange('password')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.65rem',
                      padding: '0.6rem 0.85rem',
                      borderRadius: '8px',
                      border: 'none',
                      background: activeTab === 'password' ? '#0d9488' : 'transparent',
                      color: activeTab === 'password' ? '#ffffff' : '#cbd5e1',
                      fontWeight: activeTab === 'password' ? 700 : 500,
                      fontSize: '0.88rem',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <Key size={15} />
                    <span>পাসওয়ার্ড পরিবর্তন</span>
                  </button>

                </div>
              )}
            </div>

            <button
              onClick={() => handleTabChange('courier')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                border: 'none',
                background: activeTab === 'courier' ? '#0d9488' : 'transparent',
                color: activeTab === 'courier' ? '#ffffff' : '#cbd5e1',
                fontWeight: 600,
                fontSize: '0.95rem',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease'
              }}
            >
              <Truck size={18} />
              <span>Steadfast কুরিয়ার</span>
            </button>

          </nav>
        </div>

        {/* Bottom Switcher: Back to Store & Logout */}
        <div style={{ borderTop: '1px solid #334155', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>

          <button
            onClick={onBackToStore}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.65rem',
              borderRadius: '8px',
              border: '1px solid #475569',
              background: '#1e293b',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            <ArrowLeft size={15} />
            <span>মূল স্টোরে ফিরে যান</span>
          </button>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.65rem',
              borderRadius: '8px',
              border: '1px solid #7f1d1d',
              background: '#450a0a',
              color: '#fca5a5',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'background 0.15s ease'
            }}
          >
            <LogOut size={15} />
            <span>লগআউট করুন</span>
          </button>

        </div>
      </aside>


      {/* ========================================================= */}
      {/* 👉 ডান পাশের কনটেন্ট (RIGHT MAIN CONTENT AREA) */}
      {/* ========================================================= */}
      <main className="admin-main-wrapper">

        {/* Top Action Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', background: '#ffffff', padding: '0.85rem 1.25rem', borderRadius: '14px', border: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0, flex: 1 }}>
            {/* Mobile Menu Toggle Button (Icon-only) */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="show-mobile-flex"
              style={{
                display: 'none',
                alignItems: 'center',
                justifyContent: 'center',
                width: '38px',
                height: '38px',
                minWidth: '38px',
                borderRadius: '8px',
                border: '1.5px solid #0d9488',
                background: '#f0fdfa',
                color: '#0d9488',
                cursor: 'pointer',
                padding: 0
              }}
              title="মেনু খুলুন/বন্ধ করুন"
            >
              <Menu size={20} />
            </button>

            <div style={{ minWidth: 0, flex: 1 }}>
              <h1 className="admin-page-title" style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {activeTab === 'overview' && '📊 এডমিন ড্যাশবোর্ড ওভারভিউ'}
                {activeTab === 'orders' && '📦 সকল কাস্টমার অর্ডার তালিকা'}
                {activeTab === 'products' && '🩺 মেডিকেল ডিভাইস ও পণ্য কন্ট্রোল'}
                {activeTab === 'stock' && '📦 পণ্য ইনভেন্টরি ও স্টক ম্যানেজমেন্ট'}
                {activeTab === 'categories' && '🏷️ পণ্যের ক্যাটাগরি এন্ট্রি ও ম্যানেজমেন্ট'}
                {activeTab === 'coupons' && '🎟️ ডিসকাউন্ট কুপন ও প্রোমো কোড কন্ট্রোল'}
                {activeTab === 'articles' && '📝 হেলথ গাইড ও স্বাস্থ্য টিপস'}
                {activeTab === 'profile' && '⚙️ প্রোফাইল ও ব্র্যান্ডিং সেটআপ'}
                {activeTab === 'password' && '🔐 এডমিন সিকিউরিটি ও পাসওয়ার্ড পরিবর্তন'}
                {activeTab === 'courier' && '🚚 Steadfast কুরিয়ার ইন্টিগ্রেশন ও বুকিং'}
              </h1>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                হেলথ বাড়ি সিকিউর ডাটাবেজ কন্ট্রোল প্যানেল
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {activeTab === 'products' && (
              <button
                onClick={handleOpenAdd}
                className="btn btn-buy-now"
                style={{ padding: '0.55rem 1rem', fontSize: '0.875rem' }}
              >
                <Plus size={16} />
                <span>নতুন পণ্য যোগ করুন</span>
              </button>
            )}
          </div>
        </div>


        {/* ------------------------------------------------------------- */}
        {/* TAB 1: OVERVIEW & ANALYTICS */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'overview' && (
          <div>
            {/* 6 Metric Cards in Responsive Grid */}
            <div className="admin-metrics-grid">

              {/* 1. Delivered Revenue & Count */}
              <div className="card" style={{ padding: '1.25rem', background: '#ffffff', borderLeft: '4px solid #0d9488' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>মোট সফল বিক্রয় (ডেলিভার্ড)</span>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f766e', margin: '4px 0' }} className="font-numeric">
                  {deliveredRevenue} ৳
                </div>
                <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 700 }}>✔ সফল ডেলিভারি: {deliveredOrders.length} টি</span>
              </div>

              {/* 2. Pending Orders Amount & Count */}
              <div className="card" style={{ padding: '1.25rem', background: '#ffffff', borderLeft: '4px solid #f59e0b' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>পেন্ডিং অর্ডার এমাউন্ট</span>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#d97706', margin: '4px 0' }} className="font-numeric">
                  {pendingAmount} ৳
                </div>
                <span style={{ fontSize: '0.75rem', color: '#b45309', fontWeight: 700 }}>⏳ নতুন রিসিভড: {pendingOrders.length} টি</span>
              </div>

              {/* 3. In Courier Orders Amount & Count */}
              <div className="card" style={{ padding: '1.25rem', background: '#ffffff', borderLeft: '4px solid #0284c7' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>কুরিয়ারে চলমান পার্সেল</span>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0284c7', margin: '4px 0' }} className="font-numeric">
                  {inCourierAmount} ৳
                </div>
                <span style={{ fontSize: '0.75rem', color: '#0369a1', fontWeight: 700 }}>🚚 ইন-ট্রানজিট: {inCourierOrders.length} টি</span>
              </div>

              {/* 4. Cancelled & Returned Orders Amount & Count */}
              <div className="card" style={{ padding: '1.25rem', background: '#ffffff', borderLeft: '4px solid #e11d48' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>ক্যানসেল / রিটার্ন এমাউন্ট</span>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#e11d48', margin: '4px 0' }} className="font-numeric">
                  {cancelledAmount} ৳
                </div>
                <span style={{ fontSize: '0.75rem', color: '#be123c', fontWeight: 700 }}>✖ ক্যানসেল/রিটার্ন: {cancelledOrders.length} টি</span>
              </div>

              {/* 5. Courier Charge Stat Card */}
              <div className="card" style={{ padding: '1.25rem', background: '#ffffff', borderLeft: '4px solid #8b5cf6' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>মোট কুরিয়ার চার্জ</span>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#7c3aed', margin: '4px 0' }} className="font-numeric">
                  {totalCourierCharge} ৳
                </div>
                <span style={{ fontSize: '0.75rem', color: '#6d28d9', fontWeight: 700 }}>
                  🚚 আদায়কৃত: <span className="font-numeric">{deliveredCourierCharge}৳</span> | পার্সেল: <span className="font-numeric">{orders.length}টি</span>
                </span>
              </div>

              {/* 6. Total Active Products */}
              <div className="card" style={{ padding: '1.25rem', background: '#ffffff', borderLeft: '4px solid #10b981' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>মোট সক্রিয় প্রোডাক্ট</span>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#10b981', margin: '4px 0' }} className="font-numeric">
                  {products.length} টি
                </div>
                <span style={{ fontSize: '0.75rem', color: '#047857', fontWeight: 700 }}>📦 স্টকে উপলব্ধ</span>
              </div>

            </div>

            {/* Recent Orders Preview Box */}
            <div className="card" style={{ padding: '1.5rem', background: '#ffffff', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  সাম্প্রতিক অর্ডার সমূহ (সর্বশেষ ২০টি অর্ডার)
                </h3>
                <button
                  onClick={() => setActiveTab('orders')}
                  style={{ background: 'none', border: 'none', color: '#0d9488', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem' }}
                >
                  সবগুলো অর্ডার দেখুন →
                </button>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', textAlign: 'left' }}>
                  <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <tr>
                      <th style={{ padding: '0.75rem 1rem' }}>অর্ডার আইডি</th>
                      <th style={{ padding: '0.75rem 1rem' }}>গ্রাহকের নাম ও ফোন</th>
                      <th style={{ padding: '0.75rem 1rem' }}>পণ্য</th>
                      <th style={{ padding: '0.75rem 1rem' }}>ডেলিভারী টাইপ</th>
                      <th style={{ padding: '0.75rem 1rem' }}>টোটাল</th>
                      <th style={{ padding: '0.75rem 1rem' }}>স্ট্যাটাস</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>একশন</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 20).map(o => (
                      <tr key={o.orderId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '0.75rem 1rem', fontWeight: 800, color: '#0d9488' }} className="font-numeric">
                          #{o.orderId}
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <div style={{ fontWeight: 700 }}>{o.customer?.name || o.customer_name || 'সম্মানিত গ্রাহক'}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }} className="font-numeric">{o.customer?.phone || o.customer_phone || 'N/A'}</div>
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          {o.items?.[0]?.title || 'মেডিকেল পণ্য'} ({o.items?.length || 1} আইটেম)
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          {renderDeliveryType(o)}
                        </td>
                        <td style={{ padding: '0.75rem 1rem', fontWeight: 800 }} className="font-numeric">
                          {o.grandTotal}৳
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          {renderOrderStatusBadge(o.status)}
                        </td>
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                            <button
                              onClick={() => setSelectedChalanOrder(o)}
                              className="btn btn-outline"
                              style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', borderColor: '#0d9488', color: '#0d9488' }}
                              title="চালান কপি দেখুন ও প্রিন্ট করুন"
                            >
                              <Printer size={13} />
                              <span>চালান</span>
                            </button>
                            <button
                              onClick={() => setSelectedOrderDetails(o)}
                              className="btn btn-outline"
                              style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                            >
                              <Eye size={13} />
                              <span>ডিটেইলস</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}


        {/* ------------------------------------------------------------- */}
        {/* TAB 2: ORDERS PAGE & DETAILS */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'orders' && (
          <div className="card" style={{ padding: '1.5rem', background: '#ffffff' }}>

            {/* Filter and Search Bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>

              {/* Status Filter Buttons */}
              {/* Left Side: Order Status Filter Buttons (1. Received first, All Orders last) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setOrderFilter('Pending')}
                  className={`btn ${orderFilter === 'Pending' ? 'btn-primary' : 'btn-outline'}`}
                  style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}
                >
                  ১. রিসিভড ({pendingOrders.length})
                </button>
                <button
                  onClick={() => setOrderFilter('Processing')}
                  className={`btn ${orderFilter === 'Processing' ? 'btn-primary' : 'btn-outline'}`}
                  style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}
                >
                  ২. প্যাকেজিং ({processingOrders.length})
                </button>
                <button
                  onClick={() => setOrderFilter('In Courier')}
                  className={`btn ${orderFilter === 'In Courier' ? 'btn-primary' : 'btn-outline'}`}
                  style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}
                >
                  ৩. কুরিয়ারে আছে ({inCourierOrders.length})
                </button>
                <button
                  onClick={() => setOrderFilter('Delivered')}
                  className={`btn ${orderFilter === 'Delivered' ? 'btn-primary' : 'btn-outline'}`}
                  style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}
                >
                  ৪. ডেলিভার্ড ({deliveredOrders.length})
                </button>
                <button
                  onClick={() => setOrderFilter('Returned')}
                  className={`btn ${orderFilter === 'Returned' ? 'btn-primary' : 'btn-outline'}`}
                  style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem', color: orderFilter === 'Returned' ? '#ffffff' : '#be123c', borderColor: '#fecdd3' }}
                >
                  রিটার্ন ({returnedOrders.length})
                </button>
                <button
                  onClick={() => setOrderFilter('all')}
                  className={`btn ${orderFilter === 'all' ? 'btn-primary' : 'btn-outline'}`}
                  style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}
                >
                  সকল অর্ডার ({orders.length})
                </button>
              </div>

              {/* Right Side: 15-Min Auto-Refresh Status + Manual Refresh + Search */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>

                {/* 15-Minute Auto-Refresh Live Status Indicator */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#f0fdfa',
                  border: '1px solid #99f6e4',
                  color: '#0f766e',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '8px',
                  fontSize: '0.78rem',
                  fontWeight: 700
                }}>
                  <Clock size={13} color="#0d9488" />
                  <span>১৫ মিনিট পর পর অটো-রিফ্রেশ সক্রিয় (সর্বশেষ: <span className="font-numeric">{lastOrderRefreshTime}</span>)</span>
                </div>

                {/* Manual Refresh Button */}
                <button
                  type="button"
                  onClick={() => handleManualRefreshOrders(false)}
                  disabled={isRefreshingOrders}
                  className="btn btn-outline"
                  style={{
                    padding: '0.45rem 0.85rem',
                    fontSize: '0.85rem',
                    borderColor: '#0d9488',
                    color: '#0d9488',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: isRefreshingOrders ? 'not-allowed' : 'pointer'
                  }}
                  title="এখনই নতুন অর্ডারের জন্য রিফ্রেশ করুন"
                >
                  <RefreshCw size={14} className={isRefreshingOrders ? 'spin' : ''} />
                  <span>{isRefreshingOrders ? 'রিফ্রেশ হচ্ছে...' : 'রিফ্রেশ করুন'}</span>
                </button>

                {/* Search Order */}
                <div style={{ position: 'relative', width: '220px' }}>
                  <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="text"
                    placeholder="অর্ডার আইডি বা ফোন..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: '32px', height: '38px', fontSize: '0.85rem' }}
                  />
                </div>

              </div>

            </div>

            {/* Full Orders Table */}
            <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', textAlign: 'left' }}>
                <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <tr>
                    <th style={{ padding: '0.85rem 1rem' }}>অর্ডার আইডি</th>
                    <th style={{ padding: '0.85rem 1rem' }}>গ্রাহকের নাম ও ফোন</th>
                    <th style={{ padding: '0.85rem 1rem' }}>ডেলিভারি ঠিকানা</th>
                    <th style={{ padding: '0.85rem 1rem' }}>পণ্যের বিবরণ</th>
                    <th style={{ padding: '0.85rem 1rem' }}>ডেলিভারী টাইপ</th>
                    <th style={{ padding: '0.85rem 1rem' }}>টোটাল</th>
                    <th style={{ padding: '0.85rem 1rem' }}>স্ট্যাটাস</th>
                    <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>একশন</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ padding: '3rem 1.5rem', textAlign: 'center', color: '#64748b' }}>
                        <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>📭</div>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#334155' }}>
                          {orderFilter === 'Pending'
                            ? 'বর্তমানে কোনো নতুন রিসিভড অর্ডার নেই।'
                            : orderFilter === 'Processing'
                            ? 'বর্তমানে প্যাকেজিং বা প্রসেসিং তালিকায় কোনো অর্ডার নেই।'
                            : orderFilter === 'In Courier'
                            ? 'কুরিয়ারে হস্তান্তর করা কোনো অর্ডার নেই।'
                            : orderFilter === 'Delivered'
                            ? 'কোনো সফল ডেলিভার্ড অর্ডার পাওয়া যায়নি।'
                            : orderFilter === 'Returned'
                            ? 'কোনো রিটার্ন অর্ডার নেই।'
                            : 'কোনো অর্ডার পাওয়া যায়নি।'}
                        </div>
                        {orderFilter !== 'all' && (
                          <button
                            type="button"
                            onClick={() => setOrderFilter('all')}
                            style={{ marginTop: '0.75rem', background: 'none', border: 'none', color: '#0d9488', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline', fontSize: '0.85rem' }}
                          >
                            সকল অর্ডার ({orders.length} টি) দেখতে এখানে ক্লিক করুন
                          </button>
                        )}
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map(o => (
                      <tr key={o.orderId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '0.85rem 1rem', fontWeight: 800, color: '#0d9488' }} className="font-numeric">
                          #{o.orderId}
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{o.customer?.name || o.customer_name || 'সম্মানিত গ্রাহক'}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }} className="font-numeric">{o.customer?.phone || o.customer_phone || 'N/A'}</div>
                        </td>
                        <td style={{ padding: '0.85rem 1rem', maxWidth: '200px', fontSize: '0.8rem', color: '#334155' }}>
                          {o.customer?.address || o.customer_address || 'ঠিকানা দেওয়া হয়নি'}
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          {(o.items || []).map((it, idx) => (
                            <div key={idx} style={{ fontSize: '0.8rem' }}>
                              • {it.title} ({it.quantity || 1}x)
                            </div>
                          ))}
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          {renderDeliveryType(o)}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', fontWeight: 800, color: '#0f172a' }} className="font-numeric">
                          {o.grandTotal}৳
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          {renderOrderStatusBadge(o.status)}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                            <button
                              onClick={() => setSelectedChalanOrder(o)}
                              className="btn btn-outline"
                              style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', borderColor: '#0d9488', color: '#0d9488', fontWeight: 600 }}
                              title="চালান কপি প্রিন্ট"
                            >
                              <Printer size={14} />
                              <span>চালান প্রিন্ট</span>
                            </button>
                            <button
                              onClick={() => setSelectedOrderDetails(o)}
                              className="btn btn-outline"
                              style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                            >
                              <Eye size={14} />
                              <span>ডিটেইলস দেখুন</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

          </div>
        )}


        {/* ------------------------------------------------------------- */}
        {/* TAB 3: PRODUCT MANAGEMENT */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'products' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {products.map(p => {
                const defVariant = p.variants[0] || {};
                return (
                  <div key={p.id} className="card" style={{ padding: '1.25rem', background: '#ffffff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                        <span className="badge badge-teal">{p.category}</span>
                        <span className="badge badge-success">স্টক: {p.stockCount} টি</span>
                      </div>

                      <div style={{ textAlign: 'center', background: '#f8fafc', borderRadius: '10px', padding: '1rem', marginBottom: '1rem' }}>
                        <img
                          src={p.images[0]}
                          alt={p.title}
                          style={{ maxWidth: '100%', height: '140px', objectFit: 'contain' }}
                        />
                      </div>

                      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
                        {p.title}
                      </h3>

                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '1rem' }}>
                        <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0d9488' }} className="font-numeric">
                          {defVariant.price}৳
                        </span>
                        {defVariant.originalPrice && (
                          <span style={{ fontSize: '0.9rem', color: '#94a3b8', textDecoration: 'line-through' }} className="font-numeric">
                            {defVariant.originalPrice}৳
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem' }}>
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="btn btn-outline"
                        style={{ flex: 1, padding: '0.45rem', fontSize: '0.85rem' }}
                      >
                        <Edit2 size={14} />
                        <span>আপডেট করুন</span>
                      </button>

                      <button
                        onClick={() => {
                          if (window.confirm(`আপনি কি '${p.title}' পণ্যটি মুছে ফেলতে চান?`)) {
                            onDeleteProduct(p.id);
                          }
                        }}
                        style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: '8px', padding: '0.45rem 0.75rem', cursor: 'pointer' }}
                        title="মুছে ফেলুন"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        )}


        {/* ------------------------------------------------------------- */}
        {/* TAB 3.5: STOCK & INVENTORY MANAGEMENT (স্টক ইনভেন্টরি কন্ট্রোল) */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'stock' && (
          <div>
            {/* 4 Inventory Metric Summary Cards */}
            <div className="admin-metrics-grid">
              
              <div className="card" style={{ padding: '1.25rem', background: '#ffffff', borderLeft: '4px solid #0d9488' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>মোট ইনভেন্টরি স্টক (Total)</span>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: '4px 0' }} className="font-numeric">
                  {totalInventoryStock} টি
                </div>
                <span style={{ fontSize: '0.75rem', color: '#0f766e', fontWeight: 700 }}>📦 সর্বমোট স্টকে আসা ইউনিট</span>
              </div>

              <div className="card" style={{ padding: '1.25rem', background: '#ffffff', borderLeft: '4px solid #0284c7' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>মোট বিক্রিত স্টক (Sold)</span>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0284c7', margin: '4px 0' }} className="font-numeric">
                  {totalSoldStock} টি
                </div>
                <span style={{ fontSize: '0.75rem', color: '#0369a1', fontWeight: 700 }}>🛍️ সফল অর্ডারে বিক্রিত পরিমাণ</span>
              </div>

              <div className="card" style={{ padding: '1.25rem', background: '#ffffff', borderLeft: '4px solid #10b981' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>বর্তমান অবশিষ্ট স্টক (In-Stock)</span>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#047857', margin: '4px 0' }} className="font-numeric">
                  {totalRemainingStock} টি
                </div>
                <span style={{ fontSize: '0.75rem', color: '#047857', fontWeight: 700 }}>✔ বিক্রির জন্য প্রস্তুত ইউনিট</span>
              </div>

              <div className="card" style={{ padding: '1.25rem', background: '#ffffff', borderLeft: '4px solid #e11d48' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>লো স্টক ও স্টক-আউট অ্যালার্ট</span>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#e11d48', margin: '4px 0' }} className="font-numeric">
                  {lowStockCount} টি পণ্য
                </div>
                <span style={{ fontSize: '0.75rem', color: '#be123c', fontWeight: 700 }}>⚠️ ১০ বা তার কম স্টক অবশিষ্ট</span>
              </div>

            </div>

            {/* Inventory Table Card */}
            <div className="card" style={{ padding: '1.5rem', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px' }}>

              {/* Toolbar: Search & Stock Filter Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                
                {/* Filter Pills */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => setStockFilter('all')}
                    className={`btn ${stockFilter === 'all' ? 'btn-primary' : 'btn-outline'}`}
                    style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}
                  >
                    সকল পণ্য ({stockInventoryList.length})
                  </button>
                  <button
                    onClick={() => setStockFilter('in_stock')}
                    className={`btn ${stockFilter === 'in_stock' ? 'btn-primary' : 'btn-outline'}`}
                    style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}
                  >
                    🟢 পর্যাপ্ত স্টক ({stockInventoryList.filter(p => p.remainingStock > 10).length})
                  </button>
                  <button
                    onClick={() => setStockFilter('low_stock')}
                    className={`btn ${stockFilter === 'low_stock' ? 'btn-primary' : 'btn-outline'}`}
                    style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem', color: stockFilter === 'low_stock' ? '#ffffff' : '#b45309', borderColor: '#fde68a' }}
                  >
                    🟡 লো স্টক ({stockInventoryList.filter(p => p.isLowStock).length})
                  </button>
                  <button
                    onClick={() => setStockFilter('out_of_stock')}
                    className={`btn ${stockFilter === 'out_of_stock' ? 'btn-primary' : 'btn-outline'}`}
                    style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem', color: stockFilter === 'out_of_stock' ? '#ffffff' : '#be123c', borderColor: '#fecdd3' }}
                  >
                    🔴 স্টক শেষ ({stockInventoryList.filter(p => p.isOutOfStock).length})
                  </button>
                </div>

                {/* Search Box */}
                <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
                  <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="text"
                    placeholder="পণ্য বা ক্যাটাগরি সার্চ করুন..."
                    value={stockSearch}
                    onChange={(e) => setStockSearch(e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: '34px', height: '38px', fontSize: '0.85rem' }}
                  />
                </div>

              </div>

              {/* Table */}
              <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', textAlign: 'left' }}>
                  <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <tr>
                      <th style={{ padding: '0.85rem 1rem' }}>পণ্য ও ক্যাটাগরি</th>
                      <th style={{ padding: '0.85rem 1rem' }}>মূল্য (প্যাকেজ)</th>
                      <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>মোট স্টক</th>
                      <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>সোল্ড স্টক</th>
                      <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>অবশিষ্ট স্টক</th>
                      <th style={{ padding: '0.85rem 1rem' }}>স্টক অবস্থা</th>
                      <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>স্টক ইন অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStockList.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ padding: '3rem 1.5rem', textAlign: 'center', color: '#64748b' }}>
                          <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>📦</div>
                          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#334155' }}>
                            কোনো পণ্য বা স্টক রেকর্ড পাওয়া যায়নি।
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredStockList.map(prod => {
                        const defVariant = prod.variants?.[0] || {};
                        const soldPercent = prod.totalStock > 0 ? Math.min(100, Math.round((prod.soldUnits / prod.totalStock) * 100)) : 0;
                        return (
                          <tr key={prod.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            {/* Product Info */}
                            <td style={{ padding: '0.85rem 1rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ width: 44, height: 44, borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                                  <img
                                    src={prod.images?.[0] || '/images/bp_monitor.png'}
                                    alt={prod.title}
                                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                    onError={(e) => { e.target.src = '/images/bp_monitor.png'; }}
                                  />
                                </div>
                                <div>
                                  <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>{prod.title}</div>
                                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{prod.category}</div>
                                </div>
                              </div>
                            </td>

                            {/* Price */}
                            <td style={{ padding: '0.85rem 1rem', fontWeight: 800, color: '#0d9488' }} className="font-numeric">
                              {defVariant.price || prod.price || 'N/A'}৳
                            </td>

                            {/* Total Stock */}
                            <td style={{ padding: '0.85rem 1rem', textAlign: 'center', fontWeight: 700, color: '#334155' }} className="font-numeric">
                              {prod.totalStock} টি
                            </td>

                            {/* Sold Stock */}
                            <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                              <div style={{ fontWeight: 700, color: '#0284c7' }} className="font-numeric">
                                {prod.soldUnits} টি
                              </div>
                              <div style={{ width: '80px', height: '5px', background: '#e2e8f0', borderRadius: '4px', margin: '4px auto 0', overflow: 'hidden' }}>
                                <div style={{ width: `${soldPercent}%`, height: '100%', background: '#0284c7', borderRadius: '4px' }} />
                              </div>
                              <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{soldPercent}% সোল্ড</span>
                            </td>

                            {/* Remaining Stock */}
                            <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '4px 12px',
                                borderRadius: '50px',
                                fontWeight: 800,
                                fontSize: '0.95rem',
                                background: prod.isOutOfStock ? '#ffe4e6' : prod.isLowStock ? '#fef9c3' : '#dcfce7',
                                color: prod.isOutOfStock ? '#be123c' : prod.isLowStock ? '#854d0e' : '#15803d',
                                border: `1.5px solid ${prod.isOutOfStock ? '#fecdd3' : prod.isLowStock ? '#fde047' : '#86efac'}`
                              }} className="font-numeric">
                                {prod.remainingStock} টি
                              </span>
                            </td>

                            {/* Status Badge */}
                            <td style={{ padding: '0.85rem 1rem' }}>
                              {prod.isOutOfStock ? (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 800, background: '#fee2e2', color: '#991b1b' }}>
                                  🔴 স্টক আউট (Out of Stock)
                                </span>
                              ) : prod.isLowStock ? (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 800, background: '#fef3c7', color: '#92400e' }}>
                                  ⚠️ লো স্টক (পুনরায় স্টক ইন করুন)
                                </span>
                              ) : (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 800, background: '#ecfdf5', color: '#047857' }}>
                                  🟢 পর্যাপ্ত স্টক উপলব্ধ
                                </span>
                              )}
                            </td>

                            {/* Action: Stock In Button */}
                            <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setStockInModalProduct(prod);
                                    setStockInQty(20);
                                    setStockInNote('');
                                  }}
                                  className="btn btn-buy-now"
                                  style={{ padding: '0.45rem 0.9rem', fontSize: '0.825rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px' }}
                                >
                                  <Plus size={15} />
                                  <span>+ স্টক ইন</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          </div>
        )}


        {/* ------------------------------------------------------------- */}
        {/* TAB 4: CATEGORY MANAGEMENT (ক্যাটাগরি এন্ট্রি ও পরিচালনা) */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'categories' && (
          <div className="grid md:grid-cols-3 gap-6 items-start">

            {/* Left: Add Category Form */}
            <div className="card" style={{ padding: '1.5rem', background: '#ffffff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Tags size={20} color="#0d9488" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  নতুন ক্যাটাগরি যোগ করুন
                </h3>
              </div>

              {catError && (
                <div style={{ background: '#fee2e2', color: '#991b1b', padding: '0.5rem', borderRadius: '6px', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                  {catError}
                </div>
              )}

              <form onSubmit={handleCreateCategorySubmit}>
                <div className="form-group">
                  <label className="form-label">ক্যাটাগরির নাম (বাংলা) *</label>
                  <input
                    type="text"
                    placeholder="যেমন: ফিজিওথেরাপি ডিভাইস"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-buy-now btn-full"
                  style={{ padding: '0.7rem' }}
                >
                  <Plus size={16} />
                  <span>ক্যাটাগরি তৈরি করুন</span>
                </button>
              </form>
            </div>

            {/* Right: Existing Categories List */}
            <div className="card md:col-span-2" style={{ padding: '1.5rem', background: '#ffffff' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>
                বিদ্যমান ক্যাটাগরি তালিকা ({categories.length})
              </h3>

              <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', textAlign: 'left' }}>
                  <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <tr>
                      <th style={{ padding: '0.75rem 1rem' }}>ক্যাটাগরির নাম</th>
                      <th style={{ padding: '0.75rem 1rem' }}>যুক্ত পণ্য সংখ্যা</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>একশন</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((c) => {
                      const count = products.filter(p => p.category === c.name || p.categorySlug === c.slug).length;
                      return (
                        <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#0f172a' }}>
                            {c.name}
                          </td>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <span className="badge badge-teal font-numeric">{count} টি পণ্য</span>
                          </td>
                          <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                            <button
                              onClick={() => {
                                if (window.confirm(`আপনি কি '${c.name}' ক্যাটাগরি মুছে ফেলতে চান?`)) {
                                  onDeleteCategory(c.id);
                                }
                              }}
                              style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#dc2626', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer' }}
                              title="মুছে ফেলুন"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}


        {/* ------------------------------------------------------------- */}
        {/* TAB 4.5: COUPON CODE MANAGEMENT (কুপন কোড ও প্রমোশন কন্ট্রোল) */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'coupons' && (
          <div>
            {/* 4 Coupon Metric Cards */}
            <div className="admin-metrics-grid">
              <div className="card" style={{ padding: '1.25rem', background: '#ffffff', borderLeft: '4px solid #0d9488' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>মোট কুপন সংখ্যা</span>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: '4px 0' }} className="font-numeric">
                  {couponsList.length} টি
                </div>
                <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>সবগুলো তৈরি করা কুপন</span>
              </div>

              <div className="card" style={{ padding: '1.25rem', background: '#ffffff', borderLeft: '4px solid #10b981' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>সক্রিয় কুপন (Active)</span>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#10b981', margin: '4px 0' }} className="font-numeric">
                  {couponsList.filter(c => c.isActive).length} টি
                </div>
                <span style={{ fontSize: '0.75rem', color: '#059669' }}>কাস্টমাররা ব্যবহার করতে পারছে</span>
              </div>

              <div className="card" style={{ padding: '1.25rem', background: '#ffffff', borderLeft: '4px solid #0284c7' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>মোট ব্যবহার সংখ্যা (Used)</span>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0284c7', margin: '4px 0' }} className="font-numeric">
                  {couponsList.reduce((sum, c) => sum + (c.usedCount || 0), 0)} বার
                </div>
                <span style={{ fontSize: '0.75rem', color: '#0369a1' }}>অর্ডারে সফল রিডিম সংখ্যা</span>
              </div>

              <div className="card" style={{ padding: '1.25rem', background: '#ffffff', borderLeft: '4px solid #f59e0b' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>শতকরা ছাড় কুপন (%)</span>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#d97706', margin: '4px 0' }} className="font-numeric">
                  {couponsList.filter(c => c.discountType === 'percentage').length} টি
                </div>
                <span style={{ fontSize: '0.75rem', color: '#b45309' }}>পার্সেন্টেজ ডিসকাউন্ট অফার</span>
              </div>
            </div>

            {/* Coupons Table Card */}
            <div className="card" style={{ padding: '1.5rem', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px' }}>

              {/* Toolbar: Search, Filters & Action */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>

                {/* Search Bar */}
                <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.4rem 0.75rem', minWidth: '240px' }}>
                  <Search size={16} color="#64748b" style={{ marginRight: '6px' }} />
                  <input
                    type="text"
                    placeholder="কুপন কোড দিয়ে খুঁজুন..."
                    value={couponSearch}
                    onChange={(e) => setCouponSearch(e.target.value)}
                    style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.85rem', width: '100%' }}
                  />
                  {couponSearch && (
                    <button onClick={() => setCouponSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Filter Pills */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {[
                    { id: 'all', label: 'সব কুপন' },
                    { id: 'active', label: 'সক্রিয় কুপন' },
                    { id: 'inactive', label: 'নিষ্ক্রিয়' },
                    { id: 'fixed', label: 'ফিক্সড (৳)' },
                    { id: 'percentage', label: 'পার্সেন্টেজ (%)' }
                  ].map(f => (
                    <button
                      key={f.id}
                      onClick={() => setCouponFilter(f.id)}
                      style={{
                        padding: '0.4rem 0.85rem',
                        borderRadius: '50px',
                        border: couponFilter === f.id ? '2px solid #0d9488' : '1px solid #cbd5e1',
                        background: couponFilter === f.id ? '#0d9488' : '#ffffff',
                        color: couponFilter === f.id ? '#ffffff' : '#475569',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                {/* Create Coupon Button */}
                <button
                  onClick={handleOpenAddCoupon}
                  className="btn btn-buy-now"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                >
                  <Plus size={16} />
                  <span>নতুন কুপন যোগ করুন</span>
                </button>
              </div>

              {/* Coupons Data Table */}
              <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', textAlign: 'left' }}>
                  <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <tr>
                      <th style={{ padding: '0.85rem 1rem' }}>কুপন কোড</th>
                      <th style={{ padding: '0.85rem 1rem' }}>ছাড়ের পরিমাণ</th>
                      <th style={{ padding: '0.85rem 1rem' }}>শর্তাবলি ও ক্রয়সীমা</th>
                      <th style={{ padding: '0.85rem 1rem' }}>মেয়াদ শেষ</th>
                      <th style={{ padding: '0.85rem 1rem' }}>ব্যবহার ট্র্যাকার</th>
                      <th style={{ padding: '0.85rem 1rem' }}>স্ট্যাটাস</th>
                      <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>একশন</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCoupons.length > 0 ? (
                      filteredCoupons.map((cp) => {
                        const isExpired = cp.expiryDate && new Date(cp.expiryDate + 'T23:59:59') < new Date();
                        const percentUsed = Math.min(100, Math.round(((cp.usedCount || 0) / (cp.usageLimit || 100)) * 100));

                        return (
                          <tr key={cp.id} style={{ borderBottom: '1px solid #f1f5f9' }}>

                            {/* 1. Coupon Code & Copy */}
                            <td style={{ padding: '0.85rem 1rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span className="font-numeric" style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f766e', background: '#f0fdfa', border: '1px dashed #99f6e4', padding: '3px 8px', borderRadius: '6px' }}>
                                  {cp.code}
                                </span>
                                <button
                                  onClick={() => handleCopyCouponCode(cp.code)}
                                  style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '2px' }}
                                  title="কোডটি কপি করুন"
                                >
                                  <Copy size={14} />
                                </button>
                              </div>
                            </td>

                            {/* 2. Discount Amount & Type */}
                            <td style={{ padding: '0.85rem 1rem' }}>
                              {cp.discountType === 'percentage' ? (
                                <div>
                                  <span className="badge badge-teal font-numeric" style={{ fontWeight: 800 }}>
                                    {cp.discountAmount}% ছাড়
                                  </span>
                                  {cp.maxDiscount > 0 && (
                                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                                      সর্বোচ্চ {cp.maxDiscount}৳
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span className="badge badge-success font-numeric" style={{ fontWeight: 800 }}>
                                  {cp.discountAmount}৳ ফিক্সড ছাড়
                                </span>
                              )}
                            </td>

                            {/* 3. Conditions (Min purchase) */}
                            <td style={{ padding: '0.85rem 1rem', fontSize: '0.825rem', color: '#334155' }}>
                              {cp.minPurchase > 0 ? (
                                <div>সর্বনিম্ন ক্রয়: <strong className="font-numeric">{cp.minPurchase}৳</strong></div>
                              ) : (
                                <span style={{ color: '#059669', fontWeight: 600 }}>যেকোনো অর্ডারে প্রযোজ্য</span>
                              )}
                            </td>

                            {/* 4. Expiry Date */}
                            <td style={{ padding: '0.85rem 1rem', fontSize: '0.825rem' }}>
                              {cp.expiryDate ? (
                                <div style={{ color: isExpired ? '#dc2626' : '#334155' }}>
                                  <div className="font-numeric" style={{ fontWeight: 600 }}>{cp.expiryDate}</div>
                                  {isExpired ? (
                                    <span style={{ fontSize: '0.72rem', color: '#dc2626', fontWeight: 700 }}>● মেয়াদ শেষ</span>
                                  ) : (
                                    <span style={{ fontSize: '0.72rem', color: '#059669' }}>● সচল</span>
                                  )}
                                </div>
                              ) : (
                                <span style={{ color: '#64748b' }}>আজীবন</span>
                              )}
                            </td>

                            {/* 5. Usage Tracker */}
                            <td style={{ padding: '0.85rem 1rem', minWidth: '130px' }}>
                              <div style={{ fontSize: '0.78rem', color: '#475569', display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                                <span className="font-numeric">{cp.usedCount || 0} বার ব্যবহৃত</span>
                                <span className="font-numeric" style={{ color: '#64748b' }}>লিমিট: {cp.usageLimit || 100}</span>
                              </div>
                              <div style={{ width: '100%', height: '6px', background: '#f1f5f9', borderRadius: '50px', overflow: 'hidden' }}>
                                <div style={{ width: `${percentUsed}%`, height: '100%', background: percentUsed > 80 ? '#ea580c' : '#0d9488', borderRadius: '50px' }} />
                              </div>
                            </td>

                            {/* 6. Active Toggle */}
                            <td style={{ padding: '0.85rem 1rem' }}>
                              <button
                                onClick={() => handleToggleCouponStatus(cp)}
                                style={{
                                  background: cp.isActive ? '#ecfdf5' : '#f1f5f9',
                                  border: cp.isActive ? '1px solid #10b981' : '1px solid #cbd5e1',
                                  color: cp.isActive ? '#047857' : '#64748b',
                                  padding: '4px 10px',
                                  borderRadius: '50px',
                                  fontSize: '0.75rem',
                                  fontWeight: 800,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                <span>{cp.isActive ? '● সক্রিয়' : '○ বন্ধ'}</span>
                              </button>
                            </td>

                            {/* 7. Actions */}
                            <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                                <button
                                  onClick={() => handleOpenEditCoupon(cp)}
                                  style={{ background: '#f0fdfa', border: '1px solid #99f6e4', color: '#0d9488', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer' }}
                                  title="কুপন এডিট করুন"
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button
                                  onClick={() => handleDeleteCoupon(cp.id, cp.code)}
                                  style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#dc2626', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer' }}
                                  title="কুপন মুছুন"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>

                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
                          <Ticket size={40} color="#cbd5e1" style={{ margin: '0 auto 0.5rem auto' }} />
                          <div style={{ fontWeight: 700, color: '#334155', fontSize: '1rem' }}>কোনো কুপন কোড পাওয়া যায়নি!</div>
                          <p style={{ fontSize: '0.825rem', marginTop: '4px' }}>নতুন কুপন যোগ করতে উপরের "নতুন কুপন যোগ করুন" বাটনে ক্লিক করুন।</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          </div>
        )}


        {/* ------------------------------------------------------------- */}
        {/* TAB 5: STEADFAST COURIER AUTOMATION */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'courier' && (
          <div className="card" style={{ padding: '2rem', background: '#ffffff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ width: 50, height: 50, borderRadius: '12px', background: '#f0fdfa', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0d9488' }}>
                <Truck size={28} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Steadfast Courier API ইন্টিগ্রেশন
                </h2>
                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
                  ১-ক্লিকে পার্সেল বুকিং, ট্র্যাকিং কোড ও ডেলিভারি স্ট্যাটাস সিঙ্ক
                </p>
              </div>
            </div>

            {/* Courier Charge Metric Summary */}
            <div className="admin-metrics-grid" style={{ marginBottom: '1.5rem' }}>
              <div style={{ padding: '1rem', background: '#f5f3ff', borderRadius: '10px', border: '1px solid #ddd6fe' }}>
                <span style={{ fontSize: '0.8rem', color: '#6d28d9', fontWeight: 600 }}>মোট কুরিয়ার চার্জ</span>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#7c3aed', margin: '4px 0' }} className="font-numeric">
                  {totalCourierCharge} ৳
                </div>
                <span style={{ fontSize: '0.75rem', color: '#8b5cf6' }}>সকল অর্ডারের চার্জ</span>
              </div>
              <div style={{ padding: '1rem', background: '#ecfdf5', borderRadius: '10px', border: '1px solid #a7f3d0' }}>
                <span style={{ fontSize: '0.8rem', color: '#047857', fontWeight: 600 }}>ডেলিভার্ড কুরিয়ার চার্জ</span>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#059669', margin: '4px 0' }} className="font-numeric">
                  {deliveredCourierCharge} ৳
                </div>
                <span style={{ fontSize: '0.75rem', color: '#10b981' }}>সফল ডেলিভারি থেকে আদায়</span>
              </div>
              <div style={{ padding: '1rem', background: '#f0f9ff', borderRadius: '10px', border: '1px solid #bae6fd' }}>
                <span style={{ fontSize: '0.8rem', color: '#0369a1', fontWeight: 600 }}>চলমান কুরিয়ার চার্জ</span>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0284c7', margin: '4px 0' }} className="font-numeric">
                  {inCourierCharge} ৳
                </div>
                <span style={{ fontSize: '0.75rem', color: '#38bdf8' }}>কুরিয়ারে ইন-ট্রানজিট পার্সেল</span>
              </div>
              <div style={{ padding: '1rem', background: '#fffbeb', borderRadius: '10px', border: '1px solid #fde68a' }}>
                <span style={{ fontSize: '0.8rem', color: '#b45309', fontWeight: 600 }}>পেন্ডিং কুরিয়ার চার্জ</span>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#d97706', margin: '4px 0' }} className="font-numeric">
                  {pendingCourierCharge} ৳
                </div>
                <span style={{ fontSize: '0.75rem', color: '#f59e0b' }}>নতুন রিসিভড অর্ডারের চার্জ</span>
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
              <h4 style={{ color: '#0f766e', marginBottom: '0.5rem' }}>⚡ কিভাবে কাজ করে:</h4>
              <ul style={{ paddingLeft: '1.25rem', fontSize: '0.9rem', color: '#334155', lineHeight: 1.8 }}>
                <li>গ্রাহক অর্ডার প্লেস করার সাথে সাথে সেটি <strong>অর্ডার পেইজে (Pending)</strong> জমা হয়।</li>
                <li>এডমিন <strong>"Steadfast এ পাঠান"</strong> বাটনে ক্লিক করলেই স্বয়ংক্রিয়ভাবে কুরিয়ার পার্সেল আইডি তৈরি হয়।</li>
                <li>গ্রাহক ও এডমিন উভয়েই ট্র্যাকিং কোড (যেমন: <code>ST-928410</code>) দিয়ে পার্সেল ট্র্যাক করতে পারেন।</li>
              </ul>
            </div>
          </div>
        )}


        {/* ------------------------------------------------------------- */}
        {/* TAB 6: HEALTH GUIDES & DOCTOR TIPS (স্বাস্থ্য সম্পর্কিত তথ্য ও সচেতনতা) */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'articles' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  স্বাস্থ্য সম্পর্কিত তথ্য ও সচেতনতা ম্যানেজমেন্ট
                </h2>
                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '3px 0 0 0' }}>
                  হোমপেজে প্রদর্শিত স্বাস্থ্য পরামর্শ, ডক্টরস গাইড পোস্ট তৈরি, এডিট এবং ডিলিট করুন
                </p>
              </div>

              <button
                onClick={handleOpenAddArticle}
                className="btn btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Plus size={16} />
                <span>+ নতুন স্বাস্থ্য তথ্য যোগ করুন</span>
              </button>
            </div>

            {/* Search filter for articles */}
            <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="text"
                  placeholder="শিরোনাম, ক্যাটাগরি বা বিষয় লিখে খুঁজুন..."
                  value={articleSearch}
                  onChange={(e) => setArticleSearch(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '38px', height: '42px', fontSize: '0.9rem' }}
                />
              </div>
            </div>

            {/* Articles Grid Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map((art) => {
                const linkedProduct = products.find(p => p.id === art.recommendedProductId);
                const points = Array.isArray(art.content) ? art.content : [];

                return (
                  <div
                    key={art.id}
                    className="card flex flex-col justify-between"
                    style={{ padding: '1.5rem', background: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: '16px', position: 'relative' }}
                  >
                    <div>
                      <div className="flex items-center justify-between" style={{ marginBottom: '0.75rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f766e', background: '#f0fdfa', padding: '3px 10px', borderRadius: '6px' }}>
                          {art.category}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{art.readTime || '৪ মিনিট পড়া'}</span>
                      </div>

                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.4, marginBottom: '0.75rem' }}>
                        {art.title}
                      </h3>

                      <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.6, marginBottom: '1rem' }}>
                        {art.summary}
                      </p>

                      {points.length > 0 && (
                        <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', borderLeft: '3px solid #0d9488' }}>
                          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f766e', marginBottom: '4px' }}>
                            জরুরি পরামর্শ ({points.length}টি পয়েন্ট):
                          </div>
                          <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.78rem', color: '#334155' }}>
                            {points.slice(0, 3).map((pt, idx) => (
                              <li key={idx} style={{ marginBottom: '3px' }}>✔ {pt}</li>
                            ))}
                            {points.length > 3 && (
                              <li style={{ color: '#64748b', fontStyle: 'italic' }}>+ আরও {points.length - 3}টি পরামর্শ...</li>
                            )}
                          </ul>
                        </div>
                      )}

                      {linkedProduct && (
                        <div style={{ background: '#f0fdfa', border: '1px solid #ccfbf1', borderRadius: '8px', padding: '0.5rem 0.75rem', marginBottom: '1rem' }}>
                          <span style={{ fontSize: '0.7rem', color: '#0f766e', fontWeight: 700 }}>প্রস্তাবিত ডিভাইস: </span>
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a' }}>{linkedProduct.title}</span>
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.85rem' }}>
                      <button
                        onClick={() => handleOpenEditArticle(art)}
                        className="btn btn-outline"
                        style={{ flex: 1, padding: '0.45rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                      >
                        <Edit2 size={13} />
                        <span>আপডেট / এডিট</span>
                      </button>

                      <button
                        onClick={() => handleDeleteArticleClick(art.id)}
                        style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#dc2626', padding: '0.45rem 0.75rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        title="স্বাস্থ্য তথ্য মুছুন"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>

            {filteredArticles.length === 0 && (
              <div style={{ textAlign: 'center', padding: '3rem', background: '#ffffff', borderRadius: '12px', color: '#64748b' }}>
                <BookOpen size={44} color="#cbd5e1" style={{ margin: '0 auto 0.75rem auto' }} />
                <h4 style={{ fontWeight: 700, color: '#334155' }}>কোনো স্বাস্থ্য তথ্য পাওয়া যায়নি</h4>
                <p style={{ fontSize: '0.85rem' }}>নতুন স্বাস্থ্য তথ্য যোগ করতে উপরের বাটনে ক্লিক করুন।</p>
              </div>
            )}
          </div>
        )}


        {/* ------------------------------------------------------------- */}
        {/* TAB 7: PROFILE & SITE SETTINGS (প্রোফাইল ও সাইট সেটআপ) */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'profile' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  প্রোফাইল ও সাইট ব্র্যান্ডিং সেটআপ
                </h2>
                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '3px 0 0 0' }}>
                  ব্র্যান্ড লোগো, হোমপেজ হিরো ব্যানার, শপের নাম, হেল্পলাইন ও ডেলিভারি চার্জ পরিবর্তন করুন
                </p>
              </div>

              <button
                type="button"
                onClick={handleSaveProfileSettings}
                className="btn btn-buy-now"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.65rem 1.25rem', fontSize: '0.95rem' }}
              >
                <Save size={16} />
                <span>সেটিংস সংরক্ষণ করুন</span>
              </button>
            </div>

            {/* Success Toast / Notification */}
            {settingsSaveMsg && (
              <div style={{ background: '#ecfdf5', border: '1.5px solid #6ee7b7', color: '#065f46', padding: '1rem 1.25rem', borderRadius: '12px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.95rem', fontWeight: 700 }}>
                <CheckCircle2 size={22} color="#059669" />
                <span>{settingsSaveMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfileSettings}>

              {/* 1. BRANDING & MEDIA IMAGES SETUP (লোগো ও হিরো ব্যানার ইমেজ) */}
              <div className="card" style={{ padding: '1.75rem', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
                  <ImageIcon size={20} color="#0d9488" />
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    ১. ব্র্যান্ডিং ইমেজ অপশন (Logo & Hero Banner)
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* A. Brand Logo Setup */}
                  <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <label className="form-label" style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f766e', marginBottom: '0.5rem' }}>
                      🏪 ব্র্যান্ড লোগো (Brand Logo Image)
                    </label>
                    <p style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '0.75rem' }}>
                      এটি হোমপেজ হেডার, ফুটার এবং অ্যাডমিন প্যানেলে লাইভ প্রদর্শিত হবে।
                    </p>

                    {/* Logo Live Preview */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', background: '#ffffff', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1' }}>
                      <div style={{ width: 64, height: 64, borderRadius: '12px', background: '#f0fdfa', border: '1.5px solid #99f6e4', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: '4px' }}>
                        <img
                          src={profBrandLogo || '/images/healthbari_logo.png'}
                          alt="Brand Logo Preview"
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                          onError={(e) => { e.target.src = '/images/healthbari_logo.png'; }}
                        />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>{profBrandName || 'হেলথ বাড়ি'}</div>
                        <div style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 600 }}>● বর্তমান সক্রিয় লোগো প্রিভিউ</div>
                      </div>
                    </div>

                    {/* File Upload Button */}
                    <div style={{ marginBottom: '0.75rem' }}>
                      <label style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '0.5rem 1rem',
                        backgroundColor: '#0d9488',
                        color: '#ffffff',
                        borderRadius: '8px',
                        fontSize: '0.825rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'background 0.15s ease'
                      }}>
                        <Upload size={14} />
                        <span>{isUploadingLogo ? 'লোগো আপলোড হচ্ছে...' : '📁 ফাইল থেকে লোগো আপলোড করুন'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          disabled={isUploadingLogo}
                          style={{ display: 'none' }}
                        />
                      </label>
                    </div>

                    {/* Direct Image URL input */}
                    <div style={{ marginTop: '0.5rem' }}>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '3px' }}>অথবা সরাসরি লোগো ইমেজ পাথ / লিংক দিন:</div>
                      <input
                        type="text"
                        value={profBrandLogo}
                        onChange={(e) => setProfBrandLogo(e.target.value)}
                        className="form-input"
                        placeholder="/images/healthbari_logo.png"
                        style={{ height: '36px', fontSize: '0.825rem' }}
                      />
                    </div>

                    {/* Note */}
                    <div style={{ marginTop: '0.75rem', fontSize: '0.725rem', color: '#64748b', background: '#ecfdf5', padding: '6px 10px', borderRadius: '6px', borderLeft: '3px solid #059669' }}>
                      💡 <strong>সাইজ টিপস:</strong> স্কয়ার রেশিও <code>200 × 200 px</code> বা <code>300 × 300 px</code> ট্রান্সপারেন্ট PNG/SVG লোগো ব্যবহারে সেরা রেজাল্ট পাওয়া যাবে।
                    </div>
                  </div>

                  {/* B. Hero Banner Setup */}
                  <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <label className="form-label" style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f766e', marginBottom: '0.5rem' }}>
                      🖼️ হোমপেইজ হিরো ব্যানার (Hero Banner Image)
                    </label>
                    <p style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '0.75rem' }}>
                      হোমপেজের মূল হেডার সেকশনের ডানপাশে বড় ব্যানারে এই ছবিটি প্রদর্শিত হবে।
                    </p>

                    {/* Banner Live Preview */}
                    <div style={{ width: '100%', height: '140px', borderRadius: '12px', background: '#042f2e', border: '1px solid #cbd5e1', overflow: 'hidden', marginBottom: '1rem', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img
                        src={profHeroBanner || '/images/healthbari_hero.png'}
                        alt="Hero Banner Preview"
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        onError={(e) => { e.target.src = '/images/healthbari_hero.png'; }}
                      />
                      <div style={{ position: 'absolute', bottom: 6, right: 8, background: 'rgba(0,0,0,0.6)', color: '#ffffff', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                        লাইভ ব্যানার প্রিভিউ
                      </div>
                    </div>

                    {/* File Upload Button */}
                    <div style={{ marginBottom: '0.75rem' }}>
                      <label style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '0.5rem 1rem',
                        backgroundColor: '#0d9488',
                        color: '#ffffff',
                        borderRadius: '8px',
                        fontSize: '0.825rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'background 0.15s ease'
                      }}>
                        <Upload size={14} />
                        <span>{isUploadingBanner ? 'ব্যানার আপলোড হচ্ছে...' : '📁 ফাইল থেকে ব্যানার আপলোড করুন'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleBannerUpload}
                          disabled={isUploadingBanner}
                          style={{ display: 'none' }}
                        />
                      </label>
                    </div>

                    {/* Direct Image URL input */}
                    <div style={{ marginTop: '0.5rem' }}>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '3px' }}>অথবা সরাসরি ব্যানার ইমেজ পাথ / লিংক দিন:</div>
                      <input
                        type="text"
                        value={profHeroBanner}
                        onChange={(e) => setProfHeroBanner(e.target.value)}
                        className="form-input"
                        placeholder="/images/healthbari_hero.png"
                        style={{ height: '36px', fontSize: '0.825rem' }}
                      />
                    </div>

                    {/* Note */}
                    <div style={{ marginTop: '0.75rem', fontSize: '0.725rem', color: '#64748b', background: '#ecfdf5', padding: '6px 10px', borderRadius: '6px', borderLeft: '3px solid #059669' }}>
                      💡 <strong>সাইজ টিপস:</strong> <code>1200 × 600 px</code> বা <code>800 × 600 px</code> ল্যান্ডস্কেপ ইমেজ ব্যবহারে ব্যানার নিখুঁতভাবে ফিট হবে।
                    </div>
                  </div>

                </div>
              </div>


              {/* 2. STORE BRANDING & GENERAL INFO (দোকান ও ব্র্যান্ডের তথ্য) */}
              <div className="card" style={{ padding: '1.75rem', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
                  <Globe size={20} color="#0d9488" />
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    ২. ব্র্যান্ড ও ওয়েবসাইটের সাধারণ তথ্য
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">ব্র্যান্ড / শপের নাম (বাংলা) *</label>
                    <input
                      type="text"
                      value={profBrandName}
                      onChange={(e) => setProfBrandName(e.target.value)}
                      className="form-input"
                      placeholder="যেমন: হেলথ বাড়ি"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">ট্যাগলাইন / স্লোগান (Slogan) *</label>
                    <input
                      type="text"
                      value={profSlogan}
                      onChange={(e) => setProfSlogan(e.target.value)}
                      className="form-input"
                      placeholder="যেমন: আপনার পরিবারের বিশ্বস্ত ডিজিটাল স্বাস্থ্য সঙ্গী"
                      required
                    />
                  </div>
                </div>
              </div>


              {/* 3. CONTACT & SOCIAL CHANNELS (যোগাযোগ ও কাস্টমার সাপোর্ট) */}
              <div className="card" style={{ padding: '1.75rem', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
                  <PhoneCall size={20} color="#0d9488" />
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    ৩. যোগাযোগ, কাস্টমার হেল্পলাইন ও সোশ্যাল মিডিয়া
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">📞 হেল্পলাইন ফোন নম্বর *</label>
                    <input
                      type="text"
                      value={profPhone}
                      onChange={(e) => setProfPhone(e.target.value)}
                      className="form-input font-numeric"
                      placeholder="01540-696573"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">💬 হোয়াটসঅ্যাপ নম্বর (কান্ট্রি কোড সহ) *</label>
                    <input
                      type="text"
                      value={profWhatsapp}
                      onChange={(e) => setProfWhatsapp(e.target.value)}
                      className="form-input font-numeric"
                      placeholder="8801540696573"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">📍 অফিসের ঠিকানা (Address) *</label>
                    <input
                      type="text"
                      value={profAddress}
                      onChange={(e) => setProfAddress(e.target.value)}
                      className="form-input"
                      placeholder="কাশিমপুর, গাজীপুর"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">🌐 ফেইসবুক পেজ লিংক</label>
                    <input
                      type="text"
                      value={profFacebook}
                      onChange={(e) => setProfFacebook(e.target.value)}
                      className="form-input"
                      placeholder="https://facebook.com/healthbari"
                    />
                  </div>
                </div>
              </div>


              {/* 4. TOPBAR MOVING ANNOUNCEMENT & PROMO TICKER (টপবার এনাউন্সমেন্ট ও মুভিং অফার) */}
              <div className="card" style={{ padding: '1.75rem', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', marginBottom: '1.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Sparkles size={20} color="#0d9488" />
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      ৪. টপবার এনাউন্সমেন্ট ও মুভিং অফার স্ক্রলার (Top Notice / Moving Ticker)
                    </h3>
                  </div>

                  {/* Enable / Disable Ticker Toggle */}
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', background: profIsAnnouncementEnabled ? '#ecfdf5' : '#f1f5f9', padding: '5px 12px', borderRadius: '50px', border: profIsAnnouncementEnabled ? '1px solid #10b981' : '1px solid #cbd5e1' }}>
                    <input
                      type="checkbox"
                      checked={profIsAnnouncementEnabled}
                      onChange={(e) => setProfIsAnnouncementEnabled(e.target.checked)}
                      style={{ width: '16px', height: '16px', accentColor: '#0d9488' }}
                    />
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: profIsAnnouncementEnabled ? '#047857' : '#64748b' }}>
                      {profIsAnnouncementEnabled ? '● মুভিং নোটিশ চালু আছে' : '○ নোটিশ বন্ধ'}
                    </span>
                  </label>
                </div>

                <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.25rem' }}>
                  এখানে আপনি মেডিকেল ওয়ারেন্টি নোটিশ, কুপন অফার কোড, ডেলিভারি আপডেট এবং ফ্রি স্বাস্থ্য পরামর্শ সংক্রান্ত যেকোনো লেখা যুক্ত বা পরিবর্তন করতে পারবেন। এগুলো হোমপেজের সর্বউপরে আকর্ষণীয়ভাবে স্ক্রল করবে।
                </p>

                {/* LIVE PREVIEW BOX */}
                <div style={{ marginBottom: '1.5rem', background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f766e', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Eye size={14} />
                    <span>লাইভ স্ক্রলার প্রিভিউ (Live Preview):</span>
                  </div>

                  {/* Preview Banner */}
                  <div style={{ backgroundColor: '#0f766e', color: '#ffffff', borderRadius: '8px', padding: '0.45rem 0.85rem', overflow: 'hidden', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="badge badge-teal" style={{ background: '#134e4a', color: '#5eead4', border: 'none', padding: '0.12rem 0.45rem', fontSize: '0.72rem', fontWeight: 700, flexShrink: 0 }}>
                      অফিশিয়াল হেলথ কেয়ার
                    </span>

                    {profIsAnnouncementEnabled ? (
                      <div className="topbar-ticker-wrapper" style={{ '--ticker-duration': profAnnouncementSpeed === 'slow' ? '38s' : profAnnouncementSpeed === 'fast' ? '16s' : '26s' }}>
                        <div className="topbar-ticker-track">
                          {[...profAnnouncements, ...profAnnouncements].map((t, i) => (
                            <span key={i} className="ticker-item" style={{ fontSize: '0.8rem' }}>
                              <span>{t}</span>
                              <span className="ticker-separator">✦</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>মুভিং নোটিশ বর্তমানে বন্ধ রাখা হয়েছে।</span>
                    )}
                  </div>
                </div>

                {/* Speed Controls */}
                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label className="form-label" style={{ fontWeight: 700 }}>
                    ⚡ স্ক্রল করার গতি (Animation Speed)
                  </label>
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    {[
                      { id: 'slow', label: '🐢 ধীর গতি (Slow - 38s)' },
                      { id: 'normal', label: '🚶 স্বাভাবিক গতি (Normal - 26s)' },
                      { id: 'fast', label: '⚡ দ্রুত গতি (Fast - 16s)' }
                    ].map(sp => (
                      <button
                        key={sp.id}
                        type="button"
                        onClick={() => setProfAnnouncementSpeed(sp.id)}
                        style={{
                          padding: '0.45rem 1rem',
                          borderRadius: '8px',
                          border: profAnnouncementSpeed === sp.id ? '2px solid #0d9488' : '1px solid #cbd5e1',
                          background: profAnnouncementSpeed === sp.id ? '#f0fdfa' : '#ffffff',
                          color: profAnnouncementSpeed === sp.id ? '#0d9488' : '#475569',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          cursor: 'pointer'
                        }}
                      >
                        {sp.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Add Templates */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>
                    💡 দ্রুত রেডিমেড নোটিশ টেমপ্লেট যোগ করুন:
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => handleAddTemplateAnnouncement("🎟️ বিশেষ ছাড়: 'HEALTH100' কুপন কোড ব্যবহার করে পান ১০০৳ নিশ্চিত ছাড়!")}
                      className="btn btn-outline"
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', borderColor: '#0d9488', color: '#0d9488' }}
                    >
                      + 🏷️ ১০০৳ কুপন অফার
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddTemplateAnnouncement("🎁 'HEALTH10' কোড ব্যবহারে পেয়ে যান যেকোনো অর্ডারে ১০% ইনস্ট্যান্ট ডিসকাউন্ট!")}
                      className="btn btn-outline"
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', borderColor: '#0d9488', color: '#0d9488' }}
                    >
                      + 🎁 ১০% ডিসকাউন্ট অফার
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddTemplateAnnouncement("🩺 সকল মেডিকেল ডিভাইসে ২ বছরের অফিশিয়াল ওয়ারেন্টি ও সারাদেশে ক্যাশ অন ডেলিভারি")}
                      className="btn btn-outline"
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', borderColor: '#0d9488', color: '#0d9488' }}
                    >
                      + 🩺 ২ বছরের ওয়ারেন্টি
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddTemplateAnnouncement("🚚 কাশিমপুর (গাজীপুর) এরিয়াতে দ্রুততম হোম ডেলিভারি ও ফ্রি চেকআপ সুবিধা")}
                      className="btn btn-outline"
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', borderColor: '#0d9488', color: '#0d9488' }}
                    >
                      + 🚚 হোম ডেলিভারি সুবিধা
                    </button>
                  </div>
                </div>

                {/* Add New Line Input */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
                  <input
                    type="text"
                    placeholder="নতুন নোটিশ বা অফার লাইন লিখুন (যেমন: ⚡ সীমিত সময়ের অফার...)"
                    value={newAnnouncementText}
                    onChange={(e) => setNewAnnouncementText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddAnnouncement(); } }}
                    className="form-input"
                    style={{ fontSize: '0.875rem' }}
                  />
                  <button
                    type="button"
                    onClick={handleAddAnnouncement}
                    className="btn btn-buy-now"
                    style={{ whiteSpace: 'nowrap', padding: '0.55rem 1.25rem', fontSize: '0.875rem' }}
                  >
                    <Plus size={16} />
                    <span>যোগ করুন</span>
                  </button>
                </div>

                {/* Existing Announcement Items List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>
                    বর্তমান সক্রিয় নোটিশ তালিকা ({profAnnouncements.length} টি):
                  </div>

                  {profAnnouncements.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        background: '#f8fafc',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '10px',
                        border: '1px solid #e2e8f0'
                      }}
                    >
                      <span className="font-numeric" style={{ fontWeight: 800, color: '#0d9488', fontSize: '0.85rem', width: '22px' }}>
                        #{idx + 1}
                      </span>
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => handleUpdateAnnouncementText(idx, e.target.value)}
                        className="form-input"
                        style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem', background: '#ffffff' }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveAnnouncement(idx)}
                        style={{
                          background: '#fee2e2',
                          border: '1px solid #fca5a5',
                          color: '#dc2626',
                          padding: '6px 10px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                        title="নোটিশটি মুছুন"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>

              </div>

              {/* 5. DELIVERY CHARGE CONFIGURATION (ডেলিভারি চার্জ) */}
              <div className="card" style={{ padding: '1.75rem', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', marginBottom: '1.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
                  <Truck size={20} color="#0d9488" />
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    ৫. ক্যাশ অন ডেলিভারি চার্জ সেটিংস
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">🚚 কাশিমপুর (গাজীপুর) এরিয়ার ভেতরে ডেলিভারি চার্জ (৳) *</label>
                    <input
                      type="number"
                      value={profShippingInside}
                      onChange={(e) => setProfShippingInside(e.target.value)}
                      className="form-input font-numeric"
                      placeholder=""
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">🚛 কাশিমপুর (গাজীপুর) এর বাইরে ডেলিভারি চার্জ (৳) *</label>
                    <input
                      type="number"
                      value={profShippingOutside}
                      onChange={(e) => setProfShippingOutside(e.target.value)}
                      className="form-input font-numeric"
                      placeholder=""
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                className="btn btn-buy-now btn-large btn-full"
                style={{ fontSize: '1.05rem', padding: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <Save size={18} />
                <span>প্রোফাইল ও সাইট সেটিংস সংরক্ষণ করুন</span>
              </button>

            </form>
          </div>
        )}


        {/* ------------------------------------------------------------- */}
        {/* TAB 8: ADMIN PASSWORD CHANGE (পাসওয়ার্ড পরিবর্তন সাব-মেনু) */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'password' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  এডমিন একাউন্ট সিকিউরিটি ও পাসওয়ার্ড পরিবর্তন
                </h2>
                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '3px 0 0 0' }}>
                  আপনার হেলথ বাড়ি এডমিন প্যানেলের লগইন পাসওয়ার্ড নিরাপদে পরিবর্তন করুন
                </p>
              </div>

              <button
                type="button"
                onClick={handleAdminPasswordChange}
                disabled={passwordChangeLoading}
                className="btn btn-buy-now"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.65rem 1.25rem', fontSize: '0.95rem' }}
              >
                <Key size={16} />
                <span>{passwordChangeLoading ? 'আপডেট হচ্ছে...' : 'পাসওয়ার্ড সংরক্ষণ করুন'}</span>
              </button>
            </div>

            {/* Password Change Success Message */}
            {passwordChangeMsg && (
              <div style={{ background: '#ecfdf5', border: '1.5px solid #6ee7b7', color: '#065f46', padding: '1rem 1.25rem', borderRadius: '12px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.95rem', fontWeight: 700 }}>
                <CheckCircle2 size={22} color="#059669" />
                <span>{passwordChangeMsg}</span>
              </div>
            )}

            {/* Password Change Error Message */}
            {passwordChangeError && (
              <div style={{ background: '#fef2f2', border: '1.5px solid #fca5a5', color: '#b91c1c', padding: '1rem 1.25rem', borderRadius: '12px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.95rem', fontWeight: 700 }}>
                <AlertCircle size={22} color="#dc2626" />
                <span>{passwordChangeError}</span>
              </div>
            )}

            {/* Password Change Form Card */}
            <form onSubmit={handleAdminPasswordChange}>
              <div className="card" style={{ padding: '2rem', background: '#ffffff', border: '1.5px solid #ccfbf1', borderRadius: '16px', marginBottom: '1.75rem', boxShadow: '0 4px 20px rgba(13, 148, 136, 0.06)', maxWidth: '800px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '10px', background: '#f0fdfa', border: '1px solid #99f6e4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Lock size={20} color="#0d9488" />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                        লগইন পাসওয়ার্ড আপডেট ফর্ম
                      </h3>
                      <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 0 0' }}>
                        নিচের তথ্যগুলো সতর্কতার সাথে পূরণ করুন
                      </p>
                    </div>
                  </div>
                  <span className="badge badge-teal" style={{ fontSize: '0.75rem' }}>
                    🔐 সিকিউর এনক্রিপশন
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '1.75rem' }}>

                  {/* 1. Current Password */}
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                      🔑 বর্তমান পাসওয়ার্ড (Current Password) *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showCurrentPass ? 'text' : 'password'}
                        value={currentPasswordInput}
                        onChange={(e) => setCurrentPasswordInput(e.target.value)}
                        placeholder="আপনার বর্তমান পাসওয়ার্ড লিখুন"
                        className="form-input"
                        style={{ paddingRight: '42px', height: '46px', fontSize: '0.95rem' }}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPass(!showCurrentPass)}
                        style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                        title={showCurrentPass ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখুন'}
                      >
                        {showCurrentPass ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* 2. New Password */}
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                      🔒 নতুন পাসওয়ার্ড (New Password) *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showNewPass ? 'text' : 'password'}
                        value={newPasswordInput}
                        onChange={(e) => setNewPasswordInput(e.target.value)}
                        placeholder="কমপক্ষে ৬ অক্ষরের একটি শক্তিশালী নতুন পাসওয়ার্ড দিন"
                        className="form-input"
                        style={{ paddingRight: '42px', height: '46px', fontSize: '0.95rem' }}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPass(!showNewPass)}
                        style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                        title={showNewPass ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখুন'}
                      >
                        {showNewPass ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* 3. Confirm New Password */}
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                      🔒 নতুন পাসওয়ার্ড নিশ্চিত করুন (Confirm New Password) *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showConfirmPass ? 'text' : 'password'}
                        value={confirmPasswordInput}
                        onChange={(e) => setConfirmPasswordInput(e.target.value)}
                        placeholder="পুনরায় হুবহু নতুন পাসওয়ার্ড লিখুন"
                        className="form-input"
                        style={{ paddingRight: '42px', height: '46px', fontSize: '0.95rem' }}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPass(!showConfirmPass)}
                        style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                        title={showConfirmPass ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখুন'}
                      >
                        {showConfirmPass ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem' }}>
                  <button
                    type="submit"
                    disabled={passwordChangeLoading}
                    className="btn btn-buy-now"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '0.75rem 1.75rem',
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      borderRadius: '10px'
                    }}
                  >
                    <Key size={18} />
                    <span>{passwordChangeLoading ? 'আপডেট করা হচ্ছে...' : '🔑 নতুন পাসওয়ার্ড সংরক্ষণ করুন'}</span>
                  </button>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    💡 সফলভাবে পরিবর্তনের পর পরবর্তী লগইনে এই নতুন পাসওয়ার্ডটি ব্যবহার করবেন।
                  </span>
                </div>

              </div>
            </form>
          </div>
        )}

      </main>


      {/* ========================================================= */}
      {/* 🔍 অর্ডার ডিটেইলস মোডাল (ORDER DETAILS STEP-BY-STEP MODAL) */}
      {/* ========================================================= */}
      {selectedOrderDetails && (
        <div className="modal-overlay" onClick={() => setSelectedOrderDetails(null)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '700px', maxHeight: '92vh', overflowY: 'auto', padding: '2rem' }}
          >
            {/* 1. Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="badge badge-teal">অর্ডার ডিটেইলস</span>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '50px',
                    background: selectedOrderDetails.status === 'Delivered' ? '#dcfce7' : selectedOrderDetails.status === 'Returned' ? '#ffe4e6' : selectedOrderDetails.status === 'In Courier' ? '#e0f2fe' : selectedOrderDetails.status === 'Processing' ? '#f0fdf4' : '#fef3c7',
                    color: selectedOrderDetails.status === 'Delivered' ? '#15803d' : selectedOrderDetails.status === 'Returned' ? '#be123c' : selectedOrderDetails.status === 'In Courier' ? '#0369a1' : selectedOrderDetails.status === 'Processing' ? '#0f766e' : '#b45309',
                    border: '1px solid currentColor'
                  }}>
                    {selectedOrderDetails.status === 'Pending' && '● ১. নতুন রিসিভড'}
                    {selectedOrderDetails.status === 'Processing' && '● ২. প্যাকেজিং চলমান'}
                    {selectedOrderDetails.status === 'In Courier' && '● ৩. কুরিয়ারে হস্তান্তর'}
                    {selectedOrderDetails.status === 'Delivered' && '● ৪. সফল ডেলিভার্ড'}
                    {selectedOrderDetails.status === 'Returned' && '● ৪. রিটার্ন পার্সেল'}
                  </span>
                </div>
                <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#0f172a', margin: '4px 0 0 0' }} className="font-numeric">
                  #{selectedOrderDetails.orderId}
                </h2>
              </div>
              <button
                onClick={() => setSelectedOrderDetails(null)}
                style={{ background: '#f1f5f9', border: 'none', width: 34, height: 34, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* 2. Visual Stepper Progress Bar (৪টি ধাপ) */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
              gap: '6px',
              marginBottom: '1.5rem',
              background: '#f8fafc',
              padding: '0.65rem',
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}>
              {/* Step 1 */}
              <div
                onClick={() => setModalActiveStep(1)}
                style={{
                  textAlign: 'center',
                  padding: '8px 4px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  background: modalActiveStep === 1 ? '#0f766e' : (getStepFromOrder(selectedOrderDetails) >= 1 ? '#f0fdfa' : '#f1f5f9'),
                  color: modalActiveStep === 1 ? '#ffffff' : (getStepFromOrder(selectedOrderDetails) >= 1 ? '#0d9488' : '#94a3b8'),
                  border: modalActiveStep === 1 ? '1.5px solid #0f766e' : '1px solid transparent',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ fontSize: '0.75rem', fontWeight: 800 }}>১. রিসিভড</div>
                <div style={{ fontSize: '0.65rem', marginTop: '2px' }}>{getStepFromOrder(selectedOrderDetails) > 1 ? '✓ সম্পন্ন' : 'অর্ডার গ্রহণ'}</div>
              </div>

              {/* Step 2 */}
              <div
                onClick={() => setModalActiveStep(2)}
                style={{
                  textAlign: 'center',
                  padding: '8px 4px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  background: modalActiveStep === 2 ? '#0f766e' : (getStepFromOrder(selectedOrderDetails) >= 2 ? '#f0fdfa' : '#f1f5f9'),
                  color: modalActiveStep === 2 ? '#ffffff' : (getStepFromOrder(selectedOrderDetails) >= 2 ? '#0d9488' : '#94a3b8'),
                  border: modalActiveStep === 2 ? '1.5px solid #0f766e' : '1px solid transparent',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ fontSize: '0.75rem', fontWeight: 800 }}>২. প্যাকেজিং</div>
                <div style={{ fontSize: '0.65rem', marginTop: '2px' }}>{getStepFromOrder(selectedOrderDetails) > 2 ? '✓ সম্পন্ন' : modalActiveStep === 2 ? 'প্যাকিং' : 'প্রস্তুত'}</div>
              </div>

              {/* Step 3 */}
              <div
                onClick={() => setModalActiveStep(3)}
                style={{
                  textAlign: 'center',
                  padding: '8px 4px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  background: modalActiveStep === 3 ? '#0f766e' : (getStepFromOrder(selectedOrderDetails) >= 3 ? '#f0fdfa' : '#f1f5f9'),
                  color: modalActiveStep === 3 ? '#ffffff' : (getStepFromOrder(selectedOrderDetails) >= 3 ? '#0d9488' : '#94a3b8'),
                  border: modalActiveStep === 3 ? '1.5px solid #0f766e' : '1px solid transparent',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ fontSize: '0.75rem', fontWeight: 800 }}>৩. কুরিয়ার বুকিং</div>
                <div style={{ fontSize: '0.65rem', marginTop: '2px' }}>{getStepFromOrder(selectedOrderDetails) >= 4 ? '✓ বুকড' : 'কুরিয়ার বুক'}</div>
              </div>

              {/* Step 4 */}
              <div
                onClick={() => setModalActiveStep(4)}
                style={{
                  textAlign: 'center',
                  padding: '8px 4px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  background: modalActiveStep === 4 ? (selectedOrderDetails.status === 'Returned' ? '#be123c' : '#15803d') : (getStepFromOrder(selectedOrderDetails) >= 4 ? '#f0fdf4' : '#f1f5f9'),
                  color: modalActiveStep === 4 ? '#ffffff' : (getStepFromOrder(selectedOrderDetails) >= 4 ? '#16a34a' : '#94a3b8'),
                  border: modalActiveStep === 4 ? '1.5px solid currentColor' : '1px solid transparent',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ fontSize: '0.75rem', fontWeight: 800 }}>৪. ডেলিভারি / রিটার্ন</div>
                <div style={{ fontSize: '0.65rem', marginTop: '2px' }}>
                  {selectedOrderDetails.status === 'Delivered' ? '✓ ডেলিভার্ড' : selectedOrderDetails.status === 'Returned' ? '✖ রিটার্ন' : 'ফলাফল'}
                </div>
              </div>
            </div>

            {/* 3. Customer Info Box */}
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f766e', marginBottom: '0.5rem' }}>গ্রাহকের বিবরণ:</div>
              <div style={{ fontSize: '0.9rem', color: '#1e293b', lineHeight: 1.6 }}>
                <div><strong>নাম:</strong> {selectedOrderDetails.customer?.name || selectedOrderDetails.customer_name || 'সম্মানিত গ্রাহক'}</div>
                <div><strong>ফোন:</strong> <span className="font-numeric">{selectedOrderDetails.customer?.phone || selectedOrderDetails.customer_phone || 'N/A'}</span></div>
                <div><strong>ডেলিভারি ঠিকানা:</strong> {selectedOrderDetails.customer?.address || selectedOrderDetails.customer_address || 'ঠিকানা দেওয়া হয়নি'}</div>
                {(selectedOrderDetails.customer?.note || selectedOrderDetails.customer_note) && (
                  <div><strong>কাস্টমার নোট:</strong> {selectedOrderDetails.customer?.note || selectedOrderDetails.customer_note}</div>
                )}
              </div>
            </div>

            {/* 4. Ordered Products */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b', marginBottom: '0.5rem' }}>অর্ডারকৃত পণ্য:</div>
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                {(selectedOrderDetails.items || []).map((it, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', borderBottom: idx < (selectedOrderDetails.items?.length || 1) - 1 ? '1px solid #f1f5f9' : 'none' }}>
                    <div>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{it.title}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{it.variantName || 'স্ট্যান্ডার্ড'} × {it.quantity || 1} টি</div>
                    </div>
                    <div style={{ fontWeight: 800, color: '#0d9488' }} className="font-numeric">
                      {(it.price || 0) * (it.quantity || 1)}৳
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 5. Complete Itemized Financial Calculation Card */}
            {(() => {
              const modalSubtotal = (selectedOrderDetails?.items || []).reduce((sum, it) => sum + (Number(it.price) * (Number(it.quantity) || 1)), 0);
              const modalDeliveryArea = selectedOrderDetails?.deliveryArea || selectedOrderDetails?.delivery_area || 'inside_dhaka';
              const modalIsInside = (modalDeliveryArea === 'inside_dhaka' || modalDeliveryArea === 'inside' || String(modalDeliveryArea || '').includes('ভেতরে')) && modalDeliveryArea !== 'outside_dhaka';
              const modalAreaText = modalIsInside ? 'কাশিমপুর (গাজীপুর) এরিয়ার ভেতরে' : 'কাশিমপুর (গাজীপুর) এরিয়ার বাহিরে';

              let modalShippingCharge = 0;
              if (selectedOrderDetails?.shippingCharge !== undefined && selectedOrderDetails?.shippingCharge !== null && !isNaN(Number(selectedOrderDetails.shippingCharge))) {
                modalShippingCharge = Number(selectedOrderDetails.shippingCharge);
              } else if (selectedOrderDetails?.shipping_charge !== undefined && selectedOrderDetails?.shipping_charge !== null && !isNaN(Number(selectedOrderDetails.shipping_charge))) {
                modalShippingCharge = Number(selectedOrderDetails.shipping_charge);
              } else {
                modalShippingCharge = modalIsInside ? (Number(settings?.shippingInsideDhaka) || 0) : (Number(settings?.shippingOutsideDhaka) || 0);
              }

              const modalDiscount = Number(selectedOrderDetails?.discountAmount || selectedOrderDetails?.discount_amount || 0);
              const modalGrandTotal = (selectedOrderDetails?.grandTotal !== undefined && selectedOrderDetails?.grandTotal !== null && !isNaN(Number(selectedOrderDetails.grandTotal)))
                ? Number(selectedOrderDetails.grandTotal)
                : Math.max(0, modalSubtotal + modalShippingCharge - modalDiscount);

              return (
                <div style={{
                  background: '#f8fafc',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  marginBottom: '1.5rem'
                }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f766e', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>💰 পেমেন্ট ও সর্বমোট বিলের হিসাব:</span>
                    <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>পেমেন্ট মাধ্যম: ক্যাশ অন ডেলিভারি</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem', color: '#334155' }}>
                    {/* Subtotal */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span>পণ্য সাবটোটাল ({selectedOrderDetails?.items?.length || 1} টি আইটেম):</span>
                      <span className="font-numeric" style={{ fontWeight: 700 }}>
                        {modalSubtotal}৳
                      </span>
                    </div>

                    {/* Delivery Area & Charge */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f0fdfa', padding: '6px 10px', borderRadius: '8px', border: '1px solid #ccfbf1' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Truck size={15} color="#0d9488" />
                        <span>ডেলিভারি চার্জ ({modalAreaText}):</span>
                      </div>
                      <span className="font-numeric" style={{ fontWeight: 800, color: '#0f766e' }}>
                        {modalShippingCharge === 0 ? '০৳ (ফ্রি ডেলিভারি)' : `+${modalShippingCharge}৳`}
                      </span>
                    </div>

                    {/* Discount (if any) */}
                    {modalDiscount > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#be123c', background: '#fff1f2', padding: '6px 10px', borderRadius: '8px', border: '1px solid #fecdd3' }}>
                        <span>🎟️ কুপন / স্পেশাল ডিসকাউন্ট ছাড়:</span>
                        <span className="font-numeric" style={{ fontWeight: 800 }}>
                          -{modalDiscount}৳
                        </span>
                      </div>
                    )}

                    {/* Grand Total Final Line */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1.5px dashed #cbd5e1', paddingTop: '8px', marginTop: '4px' }}>
                      <span style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>সর্বমোট প্রদেয় বিল (COD Total):</span>
                      <span className="font-numeric" style={{ fontSize: '1.45rem', fontWeight: 900, color: '#047857' }}>
                        {modalGrandTotal}৳
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* ========================================================= */}
            {/* 6. STEP-BY-STEP DYNAMIC ACTION BOX */}
            {/* ========================================================= */}

            {/* 🌟 STEP 1: অর্ডার রিসিভড (ORDER RECEIVED) */}
            {modalActiveStep === 1 && (
              <div style={{ background: '#fffbeb', border: '1.5px solid #fde68a', borderRadius: '12px', padding: '1.25rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem', color: '#b45309', fontWeight: 800, fontSize: '0.95rem' }}>
                  <Clock size={18} />
                  <span>ধাপ ১: নতুন অর্ডার রিসিভড (Pending)</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: '#78350f', margin: '0 0 1rem 0', lineHeight: 1.5 }}>
                  গ্রাহকের অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে। কাস্টমারের সাথে কথা বলে বা ঠিকানা যাচাই করে পার্সেল প্যাকেজিং শুরু করতে নিচের বাটনে ক্লিক করুন।
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={handleAdvanceToPackaging}
                    className="btn btn-buy-now"
                    style={{ flex: 1, padding: '0.75rem', fontSize: '0.95rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <Package size={17} />
                    <span>১. অর্ডার কনফার্ম ও প্যাকেজিং শুরু করুন →</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedChalanOrder(selectedOrderDetails)}
                    className="btn btn-outline"
                    style={{ padding: '0.75rem 1rem', borderColor: '#0d9488', color: '#0d9488', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Printer size={16} />
                    <span>চালান প্রিন্ট</span>
                  </button>
                </div>
              </div>
            )}

            {/* 🌟 STEP 2: প্যাকেজিং চলমান (PACKAGING & QC) */}
            {modalActiveStep === 2 && (
              <div style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: '12px', padding: '1.25rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem', color: '#15803d', fontWeight: 800, fontSize: '0.95rem' }}>
                  <Package size={18} />
                  <span>ধাপ ২: অর্ডার প্যাকেজিং ও কোয়ালিটি চেক</span>
                </div>

                {/* Packaging Checklist */}
                <div style={{ background: '#ffffff', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid #dcfce7', marginBottom: '1rem', fontSize: '0.85rem', color: '#334155' }}>
                  <div style={{ fontWeight: 700, color: '#0f766e', marginBottom: '4px' }}>প্যাকেজিং চেকলিস্ট:</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#059669', marginBottom: '3px' }}>✓ পণ্য স্টক থেকে প্রস্তুত ও ওয়ারেন্টি সিল নিশ্চিত</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#059669', marginBottom: '3px' }}>✓ বাবল র‍্যাপ ও সিকিউরিটি প্যাকেজিং সম্পন্ন</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#059669' }}>✓ পার্সেল চালান ও ক্যাশ অন ডেলিভারি ইনভয়েস রেডি</div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={handleAdvanceToCourierBooking}
                    className="btn btn-buy-now"
                    style={{ flex: 1, padding: '0.75rem', fontSize: '0.95rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <Truck size={17} />
                    <span>২. কুরিয়ার নির্বাচন ও বুকিং এ যান →</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedChalanOrder(selectedOrderDetails)}
                    className="btn btn-outline"
                    style={{ padding: '0.75rem 1rem', borderColor: '#0d9488', color: '#0d9488', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Printer size={16} />
                    <span>চালান প্রিন্ট</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setModalActiveStep(1)}
                    style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    ← রিসিভড ধাপে ফেরত
                  </button>
                </div>
              </div>
            )}

            {/* 🌟 STEP 3: কুরিয়ার বুকিং (COURIER BOOKING) */}
            {modalActiveStep === 3 && (
              <div style={{ background: '#f0fdfa', border: '1.5px solid #99f6e4', borderRadius: '14px', padding: '1.25rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid #ccfbf1', paddingBottom: '0.75rem' }}>
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0f766e', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Truck size={20} color="#0d9488" />
                    <span>ধাপ ৩: কুরিয়ার সার্ভিস নির্বাচন ও পার্সেল বুকিং</span>
                  </div>
                  <span className="badge badge-teal" style={{ fontSize: '0.75rem', padding: '4px 10px' }}>
                    পার্সেল ডিসপ্যাচ
                  </span>
                </div>

                {/* 🚚 Quick Select Courier Grid Cards */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>
                    কুরিয়ার সার্ভিস নির্বাচন করুন (ক্লিক করুন):
                  </label>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(135px, 1fr))',
                    gap: '8px',
                    marginBottom: '0.85rem'
                  }}>
                    {COURIER_OPTIONS.map(c => {
                      const isSelected = modalCourierType === c.id;
                      return (
                        <div
                          key={c.id}
                          onClick={() => {
                            setModalCourierType(c.id);
                            if (c.id !== 'custom') {
                              const prefix = c.prefix || 'TRK-';
                              setModalTrackingCode(prefix + Math.floor(100000 + Math.random() * 900000));
                              if (!modalConsignmentId) {
                                setModalConsignmentId('CSG-' + Math.floor(10000 + Math.random() * 90000));
                              }
                            }
                          }}
                          style={{
                            padding: '10px 8px',
                            borderRadius: '10px',
                            border: isSelected ? '2px solid #0d9488' : '1.5px solid #cbd5e1',
                            background: isSelected ? '#ffffff' : '#f8fafc',
                            boxShadow: isSelected ? '0 4px 12px rgba(13, 148, 136, 0.15)' : 'none',
                            cursor: 'pointer',
                            textAlign: 'center',
                            transition: 'all 0.15s ease',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px'
                          }}
                        >
                          <span style={{ fontSize: '1.4rem' }}>{c.icon}</span>
                          <span style={{ fontSize: '0.78rem', fontWeight: isSelected ? 800 : 600, color: isSelected ? '#0f766e' : '#334155', lineHeight: 1.2 }}>
                            {c.id === 'custom' ? 'কাস্টম / অন্যান্য' : c.id.replace(' Courier', '')}
                          </span>
                          {isSelected ? (
                            <span style={{ fontSize: '0.65rem', color: '#0d9488', fontWeight: 800 }}>✓ সিলেক্টেড</span>
                          ) : (
                            <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>সিলেক্ট করুন</span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Dropdown Select Option (Proper Height & Line-Height, Zero Clipping) */}
                  <select
                    value={modalCourierType}
                    onChange={(e) => {
                      setModalCourierType(e.target.value);
                      const opt = COURIER_OPTIONS.find(c => c.id === e.target.value);
                      if (opt && opt.id !== 'custom') {
                        const prefix = opt.prefix || 'TRK-';
                        setModalTrackingCode(prefix + Math.floor(100000 + Math.random() * 900000));
                        if (!modalConsignmentId) {
                          setModalConsignmentId('CSG-' + Math.floor(10000 + Math.random() * 90000));
                        }
                      }
                    }}
                    style={{
                      width: '100%',
                      minHeight: '48px',
                      padding: '10px 14px',
                      fontSize: '0.92rem',
                      fontWeight: 700,
                      color: '#0f172a',
                      background: '#ffffff',
                      border: '1.5px solid #0d9488',
                      borderRadius: '8px',
                      outline: 'none',
                      cursor: 'pointer',
                      lineHeight: '1.5',
                      boxSizing: 'border-box'
                    }}
                  >
                    {COURIER_OPTIONS.map(c => (
                      <option key={c.id} value={c.id} style={{ padding: '8px', fontSize: '0.9rem' }}>
                        {c.icon} {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* If Custom Courier */}
                {modalCourierType === 'custom' && (
                  <div style={{ marginBottom: '1rem', background: '#ffffff', padding: '0.85rem', borderRadius: '8px', border: '1.5px solid #99f6e4' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#0f766e', marginBottom: '6px' }}>
                      ✏️ আপনার কুরিয়ার সার্ভিসের নাম লিখুন:
                    </label>
                    <input
                      type="text"
                      placeholder="যেমন: করতোয়া কুরিয়ার, জননী কুরিয়ার, ইত্যাদি..."
                      value={modalCustomCourierName}
                      onChange={(e) => setModalCustomCourierName(e.target.value)}
                      style={{
                        width: '100%',
                        minHeight: '42px',
                        padding: '8px 12px',
                        fontSize: '0.875rem',
                        border: '1.5px solid #cbd5e1',
                        borderRadius: '6px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                )}

                {/* Tracking Code & Consignment Inputs */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155' }}>
                        ট্র্যাকিং কোড / মেমো নং:
                      </label>
                      <button
                        type="button"
                        onClick={handleGenerateTrackingCode}
                        style={{ background: 'none', border: 'none', color: '#0d9488', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 800, textDecoration: 'underline' }}
                      >
                        🎲 অটো কোড
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="যেমন: ST-948210 বা মেমো নং"
                      value={modalTrackingCode}
                      onChange={(e) => setModalTrackingCode(e.target.value)}
                      className="font-numeric"
                      style={{
                        width: '100%',
                        minHeight: '42px',
                        padding: '8px 12px',
                        fontSize: '0.9rem',
                        fontWeight: 800,
                        color: '#0f766e',
                        background: '#ffffff',
                        border: '1.5px solid #cbd5e1',
                        borderRadius: '8px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      কনসাইনমেন্ট / মেমো আইডি:
                    </label>
                    <input
                      type="text"
                      placeholder="যেমন: CSG-48201"
                      value={modalConsignmentId}
                      onChange={(e) => setModalConsignmentId(e.target.value)}
                      className="font-numeric"
                      style={{
                        width: '100%',
                        minHeight: '42px',
                        padding: '8px 12px',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        color: '#334155',
                        background: '#ffffff',
                        border: '1.5px solid #cbd5e1',
                        borderRadius: '8px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                {/* Courier Dispatch CTA Button */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={handleBookCourierInModal}
                    disabled={isBookingCourier}
                    className="btn btn-buy-now"
                    style={{
                      flex: 1,
                      padding: '0.85rem',
                      fontSize: '1rem',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      borderRadius: '10px'
                    }}
                  >
                    {isBookingCourier ? (
                      <>
                        <RefreshCw size={18} className="spin" />
                        <span>বুকিং হচ্ছে...</span>
                      </>
                    ) : (
                      <>
                        <Truck size={18} />
                        <span>
                          {`৩. ${modalCourierType === 'custom' ? (modalCustomCourierName || 'কাস্টম কুরিয়ার') : modalCourierType} এ বুক ও হ্যান্ডওভার করুন →`}
                        </span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setModalActiveStep(2)}
                    style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.85rem', cursor: 'pointer', textDecoration: 'underline', fontWeight: 600 }}
                  >
                    ← প্যাকেজিং ধাপে ফেরত
                  </button>
                </div>
              </div>
            )}

            {/* 🌟 STEP 4: ডেলিভারি রেজাল্ট (DELIVERY OUTCOME: SUCCESS / RETURN) */}
            {modalActiveStep === 4 && (
              <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', marginBottom: '1rem' }}>

                {/* Booked Courier Information Summary */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
                  <div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>কুরিয়ার বুকিং ইনফো:</div>
                    <div style={{ fontWeight: 800, color: '#0f766e', fontSize: '0.95rem' }}>
                      {selectedOrderDetails.courierInfo?.courierName || 'Steadfast Courier'}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>ট্র্যাকিং কোড:</div>
                    <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }} className="font-numeric">
                      {selectedOrderDetails.courierInfo?.trackingCode || 'N/A'}
                    </div>
                  </div>
                </div>

                {/* Outcome Display: Pending Delivery vs Delivered vs Returned */}
                {selectedOrderDetails.status === 'Delivered' ? (
                  <div style={{ background: '#ecfdf5', border: '1.5px solid #86efac', borderRadius: '10px', padding: '1rem', marginBottom: '1rem', textAlign: 'center' }}>
                    <CheckCircle2 size={32} color="#16a34a" style={{ margin: '0 auto 6px auto' }} />
                    <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#15803d' }}>
                      🎉 সফল ডেলিভারি সম্পন্ন হয়েছে! (Delivered)
                    </div>
                    <p style={{ fontSize: '0.825rem', color: '#166534', margin: '4px 0 0 0' }}>
                      গ্রাহক পার্সেল গ্রহণ করেছেন এবং ক্যাশ অন ডেলিভারির সম্পূর্ণ মূল্য পরিশোধিত হয়েছে।
                    </p>
                  </div>
                ) : selectedOrderDetails.status === 'Returned' ? (
                  <div style={{ background: '#fff1f2', border: '1.5px solid #fecdd3', borderRadius: '10px', padding: '1rem', marginBottom: '1rem', textAlign: 'center' }}>
                    <XCircle size={32} color="#be123c" style={{ margin: '0 auto 6px auto' }} />
                    <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#9f1239' }}>
                      ⚠️ পার্সেলটি রিটার্ন এসেছে (Returned)
                    </div>
                    <p style={{ fontSize: '0.825rem', color: '#881337', margin: '4px 0 0 0' }}>
                      গ্রাহক পার্সেল রিসিভ করেননি বা কুরিয়ার থেকে রিটার্ন পাঠানো হয়েছে।
                    </p>
                  </div>
                ) : (
                  <div style={{ marginBottom: '1.25rem' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f766e', marginBottom: '6px' }}>
                      🚚 পার্সেল ডেলিভারি ফলাফল নির্বাচন করুন:
                    </div>
                    <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 1rem 0' }}>
                      পার্সেলটি বর্তমানে কুরিয়ারে আছে। গ্রাহক পার্সেল গ্রহণ করলে <strong>"সফল ডেলিভারি"</strong> অথবা ফেরত আসলে <strong>"রিটার্ন পার্সেল"</strong> বাটনে ক্লিক করুন।
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      {/* Success Delivery Button */}
                      <button
                        type="button"
                        onClick={handleMarkDelivered}
                        className="btn"
                        style={{
                          background: '#15803d',
                          color: '#ffffff',
                          padding: '0.85rem',
                          fontSize: '0.95rem',
                          fontWeight: 800,
                          borderRadius: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          boxShadow: '0 4px 12px rgba(21,128,61,0.25)'
                        }}
                      >
                        <CheckCircle2 size={18} />
                        <span>✓ সফল ডেলিভারি সম্পন্ন</span>
                      </button>

                      {/* Return Parcel Button */}
                      <button
                        type="button"
                        onClick={handleMarkReturned}
                        className="btn"
                        style={{
                          background: '#be123c',
                          color: '#ffffff',
                          padding: '0.85rem',
                          fontSize: '0.95rem',
                          fontWeight: 800,
                          borderRadius: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          boxShadow: '0 4px 12px rgba(190,18,60,0.25)'
                        }}
                      >
                        <XCircle size={18} />
                        <span>✖ রিটার্ন পার্সেল</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 4 Footer Actions */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '0.85rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setSelectedChalanOrder(selectedOrderDetails)}
                      className="btn btn-outline"
                      style={{ padding: '0.5rem 0.85rem', fontSize: '0.8rem', borderColor: '#0d9488', color: '#0d9488', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Printer size={14} />
                      <span>চালান প্রিন্ট</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedInvoiceOrder(selectedOrderDetails)}
                      className="btn btn-outline"
                      style={{ padding: '0.5rem 0.85rem', fontSize: '0.8rem', borderColor: '#0f766e', color: '#0f766e', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <FileText size={14} />
                      <span>ইনভয়েস</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setModalActiveStep(3)}
                    style={{ background: 'none', border: 'none', color: '#0d9488', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline', fontWeight: 600 }}
                  >
                    🔄 কুরিয়ার রি-বুকিং / পরিবর্তন করুন
                  </button>
                </div>

              </div>
            )}

          </div>
        </div>
      )}

      {/* 🖨️ কাস্টমার ইনভয়েস মোডাল (CUSTOMER INVOICE MODAL FOR ADMIN) */}
      {selectedInvoiceOrder && (
        <CustomerInvoiceModal
          order={selectedInvoiceOrder}
          settings={settings}
          onClose={() => setSelectedInvoiceOrder(null)}
        />
      )}

      {/* 🖨️ অর্ডার ডেলিভারি চালান মোডাল (ORDER DELIVERY CHALAN MODAL) */}
      {selectedChalanOrder && (
        <OrderChalanModal
          order={selectedChalanOrder}
          settings={settings}
          onClose={() => setSelectedChalanOrder(null)}
        />
      )}


      {/* ========================================================= */}
      {/* ✏️ পণ্য যোগ ও আপডেট মোডাল (ADD / EDIT PRODUCT MODAL) */}
      {/* ========================================================= */}
      {isProductModalOpen && (
        <div className="modal-overlay" onClick={() => setIsProductModalOpen(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '750px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <span className="badge badge-teal">পণ্য এন্ট্রি ও এডিটর</span>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: '4px 0 0 0' }}>
                  {editingProduct ? 'পণ্য আপডেট করুন' : 'নতুন মেডিকেল ডিভাইস যোগ করুন'}
                </h2>
              </div>
              <button
                onClick={() => setIsProductModalOpen(false)}
                style={{ background: '#f1f5f9', border: 'none', width: 34, height: 34, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct}>

              {/* 1. Basic Info */}
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1.25rem' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem' }}>
                  ১. পণ্যের সাধারণ তথ্য
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">পণ্যের নাম (বাংলা) *</label>
                    <input
                      type="text"
                      placeholder="যেমন: স্মার্ট ডিজিটাল গ্লুকোমিটার কিট"
                      value={prodTitle}
                      onChange={(e) => setProdTitle(e.target.value)}
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">English Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Smart Digital Glucometer"
                      value={prodEnglishTitle}
                      onChange={(e) => setProdEnglishTitle(e.target.value)}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{ marginTop: '0.75rem' }}>
                  {/* Category */}
                  <div className="form-group" style={{ margin: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                      <label className="form-label" style={{ margin: 0 }}>ক্যাটাগরি *</label>
                      <button
                        type="button"
                        onClick={() => setIsCustomCategory(!isCustomCategory)}
                        style={{ background: 'none', border: 'none', color: '#0d9488', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                      >
                        {isCustomCategory ? '← বিদ্যমান তালিকা' : '+ নতুন ক্যাটাগরি'}
                      </button>
                    </div>

                    {!isCustomCategory ? (
                      <select
                        value={prodCategory}
                        onChange={(e) => setProdCategory(e.target.value)}
                        className="form-select"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        placeholder="নতুন ক্যাটাগরি লিখুন"
                        value={customCategoryName}
                        onChange={(e) => setCustomCategoryName(e.target.value)}
                        className="form-input"
                        style={{ border: '2px solid #0d9488', background: '#f0fdfa' }}
                        required={isCustomCategory}
                      />
                    )}
                  </div>

                  {/* Stock Count & Image */}
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">স্টক পরিমাণ (Stock Count)</label>
                    <input
                      type="number"
                      value={prodStockCount}
                      onChange={(e) => setProdStockCount(e.target.value)}
                      className="form-input"
                    />
                  </div>
                </div>

                {/* Multi-Image Upload Dropzone & Gallery (Max 5 Images) */}
                <div className="form-group" style={{ marginTop: '1rem', marginBottom: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <label className="form-label" style={{ margin: 0, fontWeight: 700 }}>
                      📸 পণ্যের ছবি আপলোড (সর্বোচ্চ ৫টি ছবি) *
                    </label>
                    <span style={{ fontSize: '0.78rem', color: prodImages.length >= 5 ? '#ea580c' : '#0d9488', fontWeight: 700 }}>
                      {prodImages.length}/৫টি ছবি যুক্ত হয়েছে
                    </span>
                  </div>

                  {/* Upload Box */}
                  <div style={{
                    border: '2px dashed #99f6e4',
                    background: '#f0fdfa',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    textAlign: 'center',
                    cursor: prodImages.length >= 5 ? 'not-allowed' : 'pointer',
                    position: 'relative',
                    marginBottom: '0.75rem',
                    transition: 'all 0.15s ease'
                  }}>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      disabled={prodImages.length >= 5 || isUploadingImage}
                      onChange={handleImageFileUpload}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        opacity: 0,
                        cursor: prodImages.length >= 5 ? 'not-allowed' : 'pointer'
                      }}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#ccfbf1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0d9488' }}>
                        <Upload size={22} />
                      </div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f766e' }}>
                        {isUploadingImage ? 'ছবি আপলোড হচ্ছে...' : prodImages.length >= 5 ? 'সর্বোচ্চ ৫টি ছবি সম্পূর্ণ হয়েছে' : 'কম্পিউটার/মোবাইল থেকে ছবি সিলেক্ট করুন'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        ক্লিক করুন বা ড্র্যাগ করে ড্রপ করুন (PNG, JPG, WEBP)
                      </div>
                    </div>
                  </div>

                  {/* Uploaded Images Thumbnail Grid */}
                  {prodImages.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '0.65rem', marginBottom: '0.75rem' }}>
                      {prodImages.map((imgUrl, index) => (
                        <div
                          key={index}
                          style={{
                            position: 'relative',
                            background: '#ffffff',
                            borderRadius: '10px',
                            border: index === 0 ? '2px solid #0d9488' : '1px solid #cbd5e1',
                            padding: '4px',
                            textAlign: 'center'
                          }}
                        >
                          <img
                            src={imgUrl}
                            alt={`Preview ${index + 1}`}
                            style={{ width: '100%', height: '80px', objectFit: 'contain', borderRadius: '6px' }}
                          />

                          {/* Main Cover Badge */}
                          {index === 0 && (
                            <div style={{ position: 'absolute', top: 4, left: 4, background: '#0d9488', color: '#ffffff', fontSize: '0.65rem', fontWeight: 800, padding: '1px 5px', borderRadius: '4px' }}>
                              কভার ছবি
                            </div>
                          )}

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => handleRemoveUploadedImage(index)}
                            style={{
                              position: 'absolute',
                              top: 4,
                              right: 4,
                              background: '#fee2e2',
                              border: '1px solid #fca5a5',
                              color: '#dc2626',
                              width: 22,
                              height: 22,
                              borderRadius: '50%',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: 0
                            }}
                            title="ছবি মুছুন"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Image Path Quick Input */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <input
                      type="text"
                      placeholder="অথবা সরাসরি ইমেজ লিংক লিখুন (যেমন: /images/glucometer.png)"
                      value={directImageLink}
                      onChange={(e) => setDirectImageLink(e.target.value)}
                      className="form-input font-numeric"
                      style={{ height: '36px', fontSize: '0.82rem' }}
                    />
                    <button
                      type="button"
                      onClick={handleAddDirectLink}
                      style={{
                        background: '#1e293b',
                        color: '#ffffff',
                        border: 'none',
                        padding: '0 12px',
                        height: '36px',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      + লিংক যোগ
                    </button>
                  </div>

                  {/* 💡 Essential Image Size & Aspect Ratio Guideline Note */}
                  <div style={{
                    background: '#fffbeb',
                    border: '1px solid #fde68a',
                    borderRadius: '10px',
                    padding: '0.75rem 1rem',
                    fontSize: '0.78rem',
                    color: '#92400e',
                    lineHeight: 1.6
                  }}>
                    <div style={{ fontWeight: 800, color: '#b45309', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span>💡 ছবি আপলোড সাইজ ও পারফেক্ট ফিটিং নির্দেশিকা:</span>
                    </div>
                    <div>• <strong>সুপারিশকৃত সাইজ (Recommended Size):</strong> <code>৬০০ × ৬০০ পিক্সেল</code> অথবা <code>৮০০ × ৮০০ পিক্সেল</code> (১:১ স্কয়ার রেশিও)।</div>
                    <div>• <strong>ফরম্যাট:</strong> PNG (ট্রান্সপারেন্ট ব্যাকগ্রাউন্ড সবচেয়ে সুন্দর দেখাবে), JPG বা WebP।</div>
                    <div>• <strong>সর্বোচ্চ সাইজ:</strong> প্রতিটি ছবি সর্বোচ্চ ৫MB এবং মোট ৫টি ছবি সার্ভারে সংরক্ষিত থাকবে।</div>
                    <div>• <strong>ফিটিং সুবিধা:</strong> এই সাইজের ছবি দিলে হোমপেজ, কার্ড ও প্রোডাক্ট ডিটেইল মোডালে সব জায়গায় ছবি ১০০% নিখুঁতভাবে ফিট থাকবে।</div>
                  </div>

                </div>
              </div>

              {/* 2. Packages / Sizes / Variants */}
              <div style={{ background: '#f0fdfa', padding: '1rem', borderRadius: '12px', border: '1.5px solid #99f6e4', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f766e', margin: 0 }}>
                      ২. প্যাকেজ / সাইজ নির্বাচন করুন (Multiple Combo Packages)
                    </h4>
                    <span style={{ fontSize: '0.75rem', color: '#134e4a' }}>
                      গ্রাহক যে প্যাকেজ নির্বাচন করবেন সেই অনুযায়ী দাম অটো পরিবর্তন হবে।
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddVariantRow}
                    style={{
                      background: '#0d9488',
                      color: '#ffffff',
                      border: 'none',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Plus size={13} />
                    <span>প্যাকেজ যোগ করুন</span>
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {prodVariants.map((v, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#ffffff', padding: '0.65rem', borderRadius: '8px', border: '1px solid #ccfbf1' }}>
                      <input
                        type="text"
                        placeholder="প্যাকেজের নাম (যেমন: ফুল কিট + ৫০টি স্ট্রিপ)"
                        value={v.name}
                        onChange={(e) => handleUpdateVariantRow(idx, 'name', e.target.value)}
                        className="form-input"
                        style={{ flex: 2, height: '36px', fontSize: '0.85rem' }}
                        required
                      />
                      <input
                        type="number"
                        placeholder="বিক্রয় মূল্য ৳"
                        value={v.price}
                        onChange={(e) => handleUpdateVariantRow(idx, 'price', e.target.value)}
                        className="form-input font-numeric"
                        style={{ flex: 1, height: '36px', fontSize: '0.85rem' }}
                        required
                      />
                      <input
                        type="number"
                        placeholder="আসল মূল্য ৳"
                        value={v.originalPrice}
                        onChange={(e) => handleUpdateVariantRow(idx, 'originalPrice', e.target.value)}
                        className="form-input font-numeric"
                        style={{ flex: 1, height: '36px', fontSize: '0.85rem' }}
                      />
                      {prodVariants.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveVariantRow(idx)}
                          style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#dc2626', width: 32, height: 32, borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          title="প্যাকেজ মুছুন"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Description (Highlights) & Usage Guidelines */}
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1.25rem' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem' }}>
                  ৩. Description (বিস্তারিত বিবরণ) ও ব্যবহারের নিয়মাবলি
                </h4>

                <div className="form-group">
                  <label className="form-label">
                    📋 Description (পণ্যের মূল বৈশিষ্ট্যসমূহ - প্রতি লাইনে একটি পয়েন্ট লিখুন)
                  </label>
                  <textarea
                    placeholder={'• মাত্র ৫ সেকেন্ডে এবং মাত্র ০.৬ মাইক্রোলিটার রক্তে সঠিক ফলাফল\n• কোনো কোডিং এর ঝামেলা নেই - অটোমেটিক স্ট্রিপ রিকগনিশন\n• অটো স্ট্রিপ ইজেকশন সিস্টেম - রক্তমাখা স্ট্রিপ না ছুঁয়েই ফেলা যায়\n• ৫০০ টেস্ট মেমোরি ও ৭, ১৪ এবং ৩০ দিনের গড় সুগার হিসাব'}
                    value={prodHighlightsText}
                    onChange={(e) => setProdHighlightsText(e.target.value)}
                    className="form-textarea"
                    rows={4}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">
                    🩺 ব্যবহারের নিয়মাবলি ও স্বাস্থ্য টিপস (প্রতি লাইনে একটি করে ধাপ লিখুন)
                  </label>
                  <textarea
                    placeholder={'১. হাত সাবান ও কুসুম গরম পানিতে ভালোভাবে ধুয়ে শুকিয়ে নিন।\n২. ল্যানসিং ডিভাইসে নতুন জীবাণুমুক্ত ল্যানসেট প্রবেশ করান।\n৩. টেস্ট স্ট্রিপটি গ্লুকোমিটার মেশিনে প্রবেশ করালে স্বয়ংক্রিয়ভাবে অন হবে।'}
                    value={prodUsageText}
                    onChange={(e) => setProdUsageText(e.target.value)}
                    className="form-textarea"
                    rows={3}
                  />
                </div>
              </div>

              {/* 4. Special Health Note */}
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">⚠️ বিশেষ স্বাস্থ্য নির্দেশিকা / সতর্কবার্তা (বি. দ্র:)</label>
                <input
                  type="text"
                  placeholder="বি. দ্র: সকালে খালি পেটে (Fasting) এবং খাওয়ার ২ ঘণ্টা পর নিয়মিত সুগার রেকর্ড রাখুন।"
                  value={prodHealthNote}
                  onChange={(e) => setProdHealthNote(e.target.value)}
                  className="form-input"
                />
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                className="btn btn-buy-now btn-large btn-full"
                style={{ fontSize: '1rem', padding: '0.85rem' }}
              >
                <span>{editingProduct ? 'পরিবর্তন সংরক্ষণ করুন' : 'সম্পূর্ণ প্যাকেজ ও বিবরণ সহ পণ্য সেভ করুন'}</span>
              </button>

            </form>
          </div>
        </div>
      )}


      {/* ========================================================= */}
      {/* 📖 স্বাস্থ্য তথ্য যোগ ও আপডেট মোডাল (ARTICLE MODAL) */}
      {/* ========================================================= */}
      {isArticleModalOpen && (
        <div className="modal-overlay" onClick={() => setIsArticleModalOpen(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <span className="badge badge-teal">হেলথ গাইড এডিটর</span>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: '4px 0 0 0' }}>
                  {editingArticle ? 'স্বাস্থ্য তথ্য আপডেট করুন' : 'নতুন স্বাস্থ্য তথ্য / পরামর্শ যোগ করুন'}
                </h2>
              </div>
              <button
                onClick={() => setIsArticleModalOpen(false)}
                style={{ background: '#f1f5f9', border: 'none', width: 34, height: 34, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveArticle}>

              {/* Title */}
              <div className="form-group">
                <label className="form-label">শিরোনাম (Title) *</label>
                <input
                  type="text"
                  placeholder="যেমন: উচ্চ রক্তচাপ কি? ঘরে বসে সঠিক নিয়মে প্রেশার মাপার ৫টি নিয়ম"
                  value={artTitle}
                  onChange={(e) => setArtTitle(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              {/* Category & Read Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">ক্যাটাগরি *</label>
                  <input
                    type="text"
                    placeholder="যেমন: হার্ট ও ব্লাড প্রেশার, ডায়াবেটিস নিয়ন্ত্রণ"
                    value={artCategory}
                    onChange={(e) => setArtCategory(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">পড়ার সময় (Read Time)</label>
                  <input
                    type="text"
                    placeholder="যেমন: ৪ মিনিট পড়া"
                    value={artReadTime}
                    onChange={(e) => setArtReadTime(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              {/* Summary */}
              <div className="form-group">
                <label className="form-label">সংক্ষিপ্ত বিবরণ (Summary / Overview) *</label>
                <textarea
                  placeholder="নীরব ঘাতক উচ্চ রক্তচাপ নিয়ন্ত্রণে রাখতে নিয়মিত ঘরে প্রেশার মাপা ও সঠিক ডাটা রাখা প্রতিটি পরিবারের জন্য কেন অপরিহার্য।"
                  value={artSummary}
                  onChange={(e) => setArtSummary(e.target.value)}
                  className="form-textarea"
                  rows={3}
                  required
                />
              </div>

              {/* Key Tips Bullet points */}
              <div className="form-group">
                <label className="form-label">
                  🩺 জরুরি পরামর্শ ও নির্দেশিকা (প্রতি লাইনে একটি করে পরামর্শ লিখুন) *
                </label>
                <textarea
                  placeholder={'• ব্লাড প্রেশার মাপার অন্তত ৩০ মিনিট আগে ধূমপান বা চা-কফি পরিহার করুন।\n• মাপার আগে ৫ মিনিট আরামদায়ক চেয়ারে সোজা হয়ে বসে বিশ্রাম নিন।\n• কাফটি সবসময় হৃদপিণ্ড বা হার্টের সমান্তরালে রাখুন।\n• প্রতিবার ২ মিনিটের ব্যবধানে দুবার মেপে গড় ফলাফলটি রেকর্ড করুন।'}
                  value={artContentText}
                  onChange={(e) => setArtContentText(e.target.value)}
                  className="form-textarea"
                  rows={4}
                  required
                />
              </div>

              {/* Linked Product Selection */}
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">প্রস্তাবিত মেডিকেল ডিভাইস (পরামর্শের সাথে যুক্ত পণ্য)</label>
                <select
                  value={artRecommendedProduct}
                  onChange={(e) => setArtRecommendedProduct(e.target.value)}
                  className="form-select"
                >
                  <option value="">-- কোনো পণ্য লিংক করবেন না --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn btn-buy-now btn-large btn-full"
                style={{ fontSize: '1rem', padding: '0.85rem' }}
              >
                <span>{editingArticle ? 'পরিবর্তন সংরক্ষণ করুন' : 'স্বাস্থ্য তথ্য পাবলিশ করুন'}</span>
              </button>

            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 🎟️ কুপন কোড তৈরি ও এডিট মোডাল (COUPON MODAL) */}
      {/* ========================================================= */}
      {isCouponModalOpen && (
        <div className="modal-overlay" onClick={() => setIsCouponModalOpen(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '600px', padding: '2rem', borderRadius: '16px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: 40, height: 40, borderRadius: '10px', background: '#f0fdfa', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0d9488' }}>
                  <Ticket size={22} />
                </div>
                <div>
                  <span className="badge badge-teal">ডিসকাউন্ট প্রমোশন</span>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: '2px 0 0 0' }}>
                    {editingCoupon ? 'কুপন কোড আপডেট করুন' : 'নতুন কুপন কোড তৈরি করুন'}
                  </h2>
                </div>
              </div>
              <button
                onClick={() => setIsCouponModalOpen(false)}
                style={{ background: '#f1f5f9', border: 'none', width: 34, height: 34, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveCoupon}>

              {/* 1. Coupon Code */}
              <div className="form-group">
                <label className="form-label">🎟️ কুপন কোড (Coupon Code) *</label>
                <input
                  type="text"
                  placeholder="যেমন: HEALTH100 বা EID2026"
                  value={cpCode}
                  onChange={(e) => setCpCode(e.target.value.toUpperCase())}
                  className="form-input font-numeric"
                  style={{ textTransform: 'uppercase', fontWeight: 800, letterSpacing: '1px', fontSize: '1.05rem', color: '#0f766e' }}
                  required
                />
                <small style={{ color: '#64748b', fontSize: '0.78rem', marginTop: '3px', display: 'block' }}>
                  ইংরেজি বড় হাতের অক্ষরে কুপন কোড লিখুন (স্বয়ংক্রিয়ভাবে বড় হাতের হবে)।
                </small>
              </div>

              {/* 2. Discount Type & Amount */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">💰 ডিসকাউন্টের ধরন *</label>
                  <select
                    value={cpDiscountType}
                    onChange={(e) => setCpDiscountType(e.target.value)}
                    className="form-select"
                  >
                    <option value="fixed">ফিক্সড টাকা ছাড় (Fixed Amount ৳)</option>
                    <option value="percentage">শতকরা ছাড় (Percentage %)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    {cpDiscountType === 'fixed' ? 'ছাড়ের পরিমাণ (৳) *' : 'ছাড়ের হার (%) *'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder={cpDiscountType === 'fixed' ? 'যেমন: 100' : 'যেমন: 10'}
                    value={cpDiscountAmount}
                    onChange={(e) => setCpDiscountAmount(e.target.value)}
                    className="form-input font-numeric"
                    required
                  />
                </div>
              </div>

              {/* 3. Min Purchase & Max Discount */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">🛒 সর্বনিম্ন ক্রয়ের পরিমাণ (৳)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0 (যেকোনো অর্ডারে)"
                    value={cpMinPurchase}
                    onChange={(e) => setCpMinPurchase(e.target.value)}
                    className="form-input font-numeric"
                  />
                  <small style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '2px', display: 'block' }}>
                    কত টাকার কেনাকাটায় কুপনটি প্রযোজ্য হবে
                  </small>
                </div>

                <div className="form-group">
                  <label className="form-label">🛡️ সর্বোচ্চ ছাড়ের সীমা (৳)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="যেমন: 300 (অপশনাল)"
                    value={cpMaxDiscount}
                    onChange={(e) => setCpMaxDiscount(e.target.value)}
                    className="form-input font-numeric"
                    disabled={cpDiscountType === 'fixed'}
                  />
                  <small style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '2px', display: 'block' }}>
                    শতকরা ছাড়ের ক্ষেত্রে সর্বোচ্চ ছাড় ক্যাপ
                  </small>
                </div>
              </div>

              {/* 4. Expiry Date & Usage Limit */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">📅 মেয়াদ শেষ হওয়ার তারিখ *</label>
                  <input
                    type="date"
                    value={cpExpiryDate}
                    onChange={(e) => setCpExpiryDate(e.target.value)}
                    className="form-input font-numeric"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">👥 মোট ব্যবহারের সর্বোচ্চ সীমা (Usage Limit)</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="100"
                    value={cpUsageLimit}
                    onChange={(e) => setCpUsageLimit(e.target.value)}
                    className="form-input font-numeric"
                  />
                </div>
              </div>

              {/* 5. Active Toggle */}
              <div style={{ background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>কুপনটি অবিলম্বে সক্রিয় রাখবেন?</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>সক্রিয় থাকলে কাস্টমাররা চেকআউট পেজে কুপনটি প্রয়োগ করতে পারবেন।</div>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={cpIsActive}
                    onChange={(e) => setCpIsActive(e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: '#0d9488' }}
                  />
                </label>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSavingCoupon}
                className="btn btn-buy-now btn-large btn-full"
                style={{ fontSize: '1rem', padding: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <Save size={18} />
                <span>{editingCoupon ? 'কুপন পরিবর্তন সংরক্ষণ করুন' : 'নতুন কুপন পাবলিশ করুন'}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 📦 RESTOCK / STOCK IN MODAL (স্টক ইন পপআপ) */}
      {/* ======================================================== */}
      {stockInModalProduct && (
        <div className="modal-overlay" onClick={() => setStockInModalProduct(null)}>
          <div className="modal-content" style={{ maxWidth: '520px', padding: '1.75rem' }} onClick={(e) => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ width: 38, height: 38, borderRadius: '10px', background: '#ecfdf5', border: '1px solid #a7f3d0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#047857' }}>
                  <Boxes size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    পণ্য স্টক ইন করুন (Restock)
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>ইনভেন্টরিতে নতুন লট বা স্টক সংখ্যা যোগ করুন</p>
                </div>
              </div>

              <button
                onClick={() => setStockInModalProduct(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Target Product Summary Box */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '0.85rem 1rem', marginBottom: '1.25rem' }}>
              <div style={{ width: 48, height: 48, borderRadius: '8px', background: '#ffffff', border: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                <img
                  src={stockInModalProduct.images?.[0] || '/images/bp_monitor.png'}
                  alt={stockInModalProduct.title}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  onError={(e) => { e.target.src = '/images/bp_monitor.png'; }}
                />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {stockInModalProduct.title}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  ক্যাটাগরি: <strong>{stockInModalProduct.category}</strong>
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>বর্তমান অবশিষ্ট</div>
                <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0d9488' }} className="font-numeric">
                  {stockInModalProduct.stockCount || 0} টি
                </div>
              </div>
            </div>

            <form onSubmit={handleStockInSubmit}>

              {/* Quick Preset Buttons */}
              <div style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>
                  ⚡ কুইক স্টক ইন অপশন
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {[10, 20, 50, 100, 200].map(qty => (
                    <button
                      key={qty}
                      type="button"
                      onClick={() => setStockInQty(qty)}
                      style={{
                        padding: '0.4rem 0.85rem',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        border: Number(stockInQty) === qty ? '2px solid #0d9488' : '1px solid #cbd5e1',
                        background: Number(stockInQty) === qty ? '#f0fdfa' : '#ffffff',
                        color: Number(stockInQty) === qty ? '#0f766e' : '#334155',
                        cursor: 'pointer'
                      }}
                    >
                      +{qty} টি
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity Input Field */}
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">
                  🔢 স্টক ইন পরিমাণ (কাস্টম সংখ্যা লিখুন) *
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setStockInQty(prev => Math.max(1, (Number(prev) || 0) - 5))}
                    style={{ width: 42, height: 42, borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', fontSize: '1.2rem', fontWeight: 800, cursor: 'pointer' }}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={stockInQty}
                    onChange={(e) => setStockInQty(e.target.value)}
                    className="form-input font-numeric"
                    style={{ height: '42px', textAlign: 'center', fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setStockInQty(prev => (Number(prev) || 0) + 5)}
                    style={{ width: 42, height: 42, borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', fontSize: '1.2rem', fontWeight: 800, cursor: 'pointer' }}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Optional Restock / Source Note */}
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">📝 স্টক ইন নোট / সাপ্লায়ার রেফারেন্স (ঐচ্ছিক)</label>
                <input
                  type="text"
                  placeholder="যেমন: নতুন লট রিসিভড / সাপ্লায়ার চালান #১২"
                  value={stockInNote}
                  onChange={(e) => setStockInNote(e.target.value)}
                  className="form-input"
                />
              </div>

              {/* Live Preview Box */}
              <div style={{ background: '#ecfdf5', border: '1.5px solid #a7f3d0', borderRadius: '10px', padding: '0.85rem 1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#065f46', fontWeight: 600 }}>স্টক ইন পরবর্তী মোট অবশিষ্ট:</div>
                  <div style={{ fontSize: '0.75rem', color: '#047857' }}>
                    {stockInModalProduct.stockCount || 0} টি + {Number(stockInQty) || 0} টি
                  </div>
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#047857' }} className="font-numeric">
                  = {(Number(stockInModalProduct.stockCount || 0) + (Number(stockInQty) || 0))} টি
                </div>
              </div>

              {/* Submit CTA */}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setStockInModalProduct(null)}
                  className="btn btn-outline"
                  style={{ flex: 1, padding: '0.75rem' }}
                >
                  বাতিল করুন
                </button>
                <button
                  type="submit"
                  disabled={isStockInSubmitting}
                  className="btn btn-buy-now"
                  style={{ flex: 2, padding: '0.75rem', fontSize: '0.95rem', fontWeight: 800 }}
                >
                  {isStockInSubmitting ? 'আপডেট হচ্ছে...' : `✔ +${stockInQty || 0} টি স্টক ইন কনফার্ম করুন`}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}


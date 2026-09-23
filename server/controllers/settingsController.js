import { getPool, isDbConnected } from '../config/db.js';

const defaultAnnouncements = [
  "🩺 সকল মেডিকেল ডিভাইসে ২ বছরের অফিশিয়াল ওয়ারেন্টি ও সারাদেশে ক্যাশ অন ডেলিভারি",
  "🎟️ বিশেষ ছাড়: 'HEALTH100' কুপন কোড ব্যবহার করে পান ১০০৳ নিশ্চিত ছাড়!",
  "🚚 কাশিমপুর (গাজীপুর) এরিয়াতে দ্রুততম হোম ডেলিভারি ও ফ্রি চেকআপ সুবিধা",
  "🎁 'HEALTH10' কোড ব্যবহারে পেয়ে যান যেকোনো অর্ডারে ১০% ইনস্ট্যান্ট ডিসকাউন্ট!",
  "📞 যেকোনো স্বাস্থ্য পরামর্শ ও ডিভাইসের ব্যবহারের নিয়ম জানতে কল করুন: 01540-696573"
];

let localSettings = {
  brandName: 'হেলথ বাড়ি',
  brandLogo: '/images/healthbari_logo.png',
  heroBanner: '/images/healthbari_hero_banner.png',
  phone: '01540-696573',
  whatsappNumber: '8801540696573',
  address: 'কাশিমপুর, গাজীপুর',
  slogan: 'আপনার পরিবারের বিশ্বস্ত ডিজিটাল স্বাস্থ্য সঙ্গী',
  facebookUrl: 'https://facebook.com/healthbari',
  shippingInsideDhaka: 0,
  shippingOutsideDhaka: 0,
  announcements: defaultAnnouncements,
  announcementSpeed: 'normal',
  isAnnouncementEnabled: true,
  heroBadgeTag: '১০০% অরিজিনাল হেলথ, হারবাল ও মেডিকেল পণ্য',
  heroTitle: 'ঘরে বসেই রাখুন পরিবারের',
  heroTitleHighlight: 'স্বাস্থ্যের নিখুঁত যত্ন',
  heroSubtitle: 'সুস্বাস্থ্য রক্ষায় সঠিক যত্নই একমাত্র সুরক্ষা। হেলথ বাড়ি-এর ১০০% অরিজিনাল হেলথ, হারবাল ও মেডিকেল পণ্য দিয়ে খুব সহজেই নিজের ও পরিবারের হেলথ ট্র্যাক করুন।'
};

export const getSettings = async (req, res) => {
  try {
    const pool = getPool();
    if (isDbConnected() && pool) {
      const [rows] = await pool.query('SELECT * FROM site_settings WHERE id = "default" LIMIT 1');
      if (rows.length > 0) {
        const s = rows[0];
        let parsedAnnouncements = defaultAnnouncements;
        if (s.announcements) {
          try {
            parsedAnnouncements = typeof s.announcements === 'string' ? JSON.parse(s.announcements) : s.announcements;
          } catch (e) {
            parsedAnnouncements = s.announcements.split('\n').map(l => l.trim()).filter(Boolean);
          }
        }

        const formatted = {
          brandName: s.brand_name || 'হেলথ বাড়ি',
          brandLogo: s.brand_logo || '/images/healthbari_logo.png',
          heroBanner: s.hero_banner || '/images/healthbari_hero_banner.png',
          phone: s.phone || '01540-696573',
          whatsappNumber: s.whatsapp_number || '8801540696573',
          address: s.address || 'কাশিমপুর, গাজীপুর',
          slogan: s.slogan || 'আপনার পরিবারের বিশ্বস্ত ডিজিটাল স্বাস্থ্য সঙ্গী',
          facebookUrl: s.facebook_url || 'https://facebook.com/healthbari',
          shippingInsideDhaka: (s.shipping_inside_dhaka !== null && s.shipping_inside_dhaka !== undefined && !isNaN(Number(s.shipping_inside_dhaka))) ? Number(s.shipping_inside_dhaka) : 0,
          shippingOutsideDhaka: (s.shipping_outside_dhaka !== null && s.shipping_outside_dhaka !== undefined && !isNaN(Number(s.shipping_outside_dhaka))) ? Number(s.shipping_outside_dhaka) : 0,
          announcements: Array.isArray(parsedAnnouncements) ? parsedAnnouncements : defaultAnnouncements,
          announcementSpeed: s.announcement_speed || 'normal',
          isAnnouncementEnabled: s.is_announcement_enabled !== undefined ? Boolean(s.is_announcement_enabled) : true,
          heroBadgeTag: s.hero_badge_tag || '১০০% অরিজিনাল হেলথ, হারবাল ও মেডিকেল পণ্য',
          heroTitle: s.hero_title !== undefined ? s.hero_title : 'ঘরে বসেই রাখুন পরিবারের',
          heroTitleHighlight: s.hero_title_highlight !== undefined ? s.hero_title_highlight : 'স্বাস্থ্যের নিখুঁত যত্ন',
          heroSubtitle: s.hero_subtitle || 'সুস্বাস্থ্য রক্ষায় সঠিক যত্নই একমাত্র সুরক্ষা। হেলথ বাড়ি-এর ১০০% অরিজিনাল হেলথ, হারবাল ও মেডিকেল পণ্য দিয়ে খুব সহজেই নিজের ও পরিবারের হেলথ ট্র্যাক করুন।'
        };
        return res.json({ success: true, settings: formatted });
      }
    }
    res.json({ success: true, settings: localSettings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const {
      brandName,
      brandLogo,
      heroBanner,
      phone,
      whatsappNumber,
      address,
      slogan,
      facebookUrl,
      shippingInsideDhaka,
      shippingOutsideDhaka,
      announcements,
      announcementSpeed,
      isAnnouncementEnabled,
      heroBadgeTag,
      heroTitle,
      heroTitleHighlight,
      heroSubtitle
    } = req.body;

    const insideCharge = (shippingInsideDhaka !== undefined && shippingInsideDhaka !== null && shippingInsideDhaka !== '' && !isNaN(Number(shippingInsideDhaka)))
      ? Number(shippingInsideDhaka)
      : 0;
    const outsideCharge = (shippingOutsideDhaka !== undefined && shippingOutsideDhaka !== null && shippingOutsideDhaka !== '' && !isNaN(Number(shippingOutsideDhaka)))
      ? Number(shippingOutsideDhaka)
      : 0;

    let announcementsArray = defaultAnnouncements;
    if (Array.isArray(announcements)) {
      announcementsArray = announcements.filter(Boolean);
    } else if (typeof announcements === 'string') {
      try {
        announcementsArray = JSON.parse(announcements);
      } catch (e) {
        announcementsArray = announcements.split('\n').map(s => s.trim()).filter(Boolean);
      }
    }

    const announcementsJson = JSON.stringify(announcementsArray);

    const finalBadgeTag = heroBadgeTag || '১০০% অরিজিনাল হেলথ, হারবাল ও মেডিকেল পণ্য';
    const finalTitle = heroTitle !== undefined ? heroTitle : 'ঘরে বসেই রাখুন পরিবারের';
    const finalTitleHighlight = heroTitleHighlight !== undefined ? heroTitleHighlight : 'স্বাস্থ্যের নিখুঁত যত্ন';
    const finalSubtitle = heroSubtitle || 'সুস্বাস্থ্য রক্ষায় সঠিক যত্নই একমাত্র সুরক্ষা। হেলথ বাড়ি-এর ১০০% অরিজিনাল হেলথ, হারবাল ও মেডিকেল পণ্য দিয়ে খুব সহজেই নিজের ও পরিবারের হেলথ ট্র্যাক করুন।';

    const pool = getPool();
    if (isDbConnected() && pool) {
      await pool.query(
        `INSERT INTO site_settings (id, brand_name, brand_logo, hero_banner, phone, whatsapp_number, address, slogan, facebook_url, shipping_inside_dhaka, shipping_outside_dhaka, announcements, announcement_speed, is_announcement_enabled, hero_badge_tag, hero_title, hero_title_highlight, hero_subtitle)
         VALUES ('default', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           brand_name = VALUES(brand_name),
           brand_logo = VALUES(brand_logo),
           hero_banner = VALUES(hero_banner),
           phone = VALUES(phone),
           whatsapp_number = VALUES(whatsapp_number),
           address = VALUES(address),
           slogan = VALUES(slogan),
           facebook_url = VALUES(facebook_url),
           shipping_inside_dhaka = VALUES(shipping_inside_dhaka),
           shipping_outside_dhaka = VALUES(shipping_outside_dhaka),
           announcements = VALUES(announcements),
           announcement_speed = VALUES(announcement_speed),
           is_announcement_enabled = VALUES(is_announcement_enabled),
           hero_badge_tag = VALUES(hero_badge_tag),
           hero_title = VALUES(hero_title),
           hero_title_highlight = VALUES(hero_title_highlight),
           hero_subtitle = VALUES(hero_subtitle)`,
        [
          brandName || 'হেলথ বাড়ি',
          brandLogo || '/images/healthbari_logo.png',
          heroBanner || '/images/healthbari_hero_banner.png',
          phone || '01540-696573',
          whatsappNumber || '8801540696573',
          address || 'কাশিমপুর, গাজীপুর',
          slogan || 'আপনার পরিবারের বিশ্বস্ত ডিজিটাল স্বাস্থ্য সঙ্গী',
          facebookUrl || 'https://facebook.com/healthbari',
          insideCharge,
          outsideCharge,
          announcementsJson,
          announcementSpeed || 'normal',
          isAnnouncementEnabled !== undefined ? (isAnnouncementEnabled ? 1 : 0) : 1,
          finalBadgeTag,
          finalTitle,
          finalTitleHighlight,
          finalSubtitle
        ]
      );

      const formattedSettings = {
        brandName: brandName || 'হেলথ বাড়ি',
        brandLogo: brandLogo || '/images/healthbari_logo.png',
        heroBanner: heroBanner || '/images/healthbari_hero_banner.png',
        phone: phone || '01540-696573',
        whatsappNumber: whatsappNumber || '8801540696573',
        address: address || 'কাশিমপুর, গাজীপুর',
        slogan: slogan || 'আপনার পরিবারের বিশ্বস্ত ডিজিটাল স্বাস্থ্য সঙ্গী',
        facebookUrl: facebookUrl || 'https://facebook.com/healthbari',
        shippingInsideDhaka: insideCharge,
        shippingOutsideDhaka: outsideCharge,
        announcements: announcementsArray,
        announcementSpeed: announcementSpeed || 'normal',
        isAnnouncementEnabled: isAnnouncementEnabled !== undefined ? Boolean(isAnnouncementEnabled) : true,
        heroBadgeTag: finalBadgeTag,
        heroTitle: finalTitle,
        heroTitleHighlight: finalTitleHighlight,
        heroSubtitle: finalSubtitle
      };

      return res.json({
        success: true,
        message: 'প্রোফাইল ও সাইট সেটিংস সফলভাবে সংরক্ষিত হয়েছে!',
        settings: formattedSettings
      });
    }

    localSettings = {
      ...localSettings,
      brandName: brandName || 'হেলথ বাড়ি',
      brandLogo: brandLogo || '/images/healthbari_logo.png',
      heroBanner: heroBanner || '/images/healthbari_hero_banner.png',
      phone: phone || '01540-696573',
      whatsappNumber: whatsappNumber || '8801540696573',
      address: address || 'কাশিমপুর, গাজীপুর',
      slogan: slogan || 'আপনার পরিবারের বিশ্বস্ত ডিজিটাল স্বাস্থ্য সঙ্গী',
      facebookUrl: facebookUrl || 'https://facebook.com/healthbari',
      shippingInsideDhaka: insideCharge,
      shippingOutsideDhaka: outsideCharge,
      announcements: announcementsArray,
      announcementSpeed: announcementSpeed || 'normal',
      isAnnouncementEnabled: isAnnouncementEnabled !== undefined ? Boolean(isAnnouncementEnabled) : true,
      heroBadgeTag: finalBadgeTag,
      heroTitle: finalTitle,
      heroTitleHighlight: finalTitleHighlight,
      heroSubtitle: finalSubtitle
    };

    res.json({
      success: true,
      message: 'প্রোফাইল ও সাইট সেটিংস লোকালি সংরক্ষিত হয়েছে!',
      settings: localSettings
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

import { getPool, isDbConnected } from '../config/db.js';

// Fallback in-memory reviews if DB is unavailable
let localReviews = [
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

export const getReviews = async (req, res) => {
  try {
    if (isDbConnected()) {
      const pool = getPool();
      const [rows] = await pool.query('SELECT * FROM `reviews` ORDER BY id DESC');
      const formatted = rows.map(r => ({
        id: r.id,
        customerName: r.customer_name,
        customerLocation: r.customer_location,
        productTitle: r.product_title,
        rating: r.rating,
        comment: r.comment,
        isVerified: Boolean(r.is_verified),
        createdAt: r.created_at
      }));
      return res.json({ success: true, reviews: formatted });
    }
    return res.json({ success: true, reviews: localReviews });
  } catch (err) {
    console.error('Error fetching reviews:', err);
    return res.json({ success: true, reviews: localReviews });
  }
};

export const createReview = async (req, res) => {
  try {
    const { customerName, customerLocation, productTitle, rating, comment } = req.body;
    
    if (!customerName || !comment) {
      return res.status(400).json({ success: false, message: 'কাস্টমার নাম ও আপনার মতামত দেওয়া আবশ্যক।' });
    }

    const name = customerName.trim();
    const location = (customerLocation && customerLocation.trim()) ? customerLocation.trim() : 'ঢাকা, বাংলাদেশ';
    const prod = (productTitle && productTitle.trim()) ? productTitle.trim() : 'হেলথ বাড়ি মেডিকেল গ্যাজেট';
    const rat = Number(rating) || 5;
    const comm = comment.trim();

    if (isDbConnected()) {
      const pool = getPool();
      const [result] = await pool.query(
        'INSERT INTO `reviews` (customer_name, customer_location, product_title, rating, comment, is_verified) VALUES (?, ?, ?, ?, ?, 1)',
        [name, location, prod, rat, comm]
      );
      
      const newReview = {
        id: result.insertId,
        customerName: name,
        customerLocation: location,
        productTitle: prod,
        rating: rat,
        comment: comm,
        isVerified: true,
        createdAt: new Date().toISOString()
      };
      
      return res.json({ success: true, message: 'আপনার মূল্যবান রিভিুটি জমা দেওয়া হয়েছে। ধন্যবাদ!', review: newReview });
    } else {
      const newReview = {
        id: Date.now(),
        customerName: name,
        customerLocation: location,
        productTitle: prod,
        rating: rat,
        comment: comm,
        isVerified: true,
        createdAt: new Date().toISOString()
      };
      localReviews.unshift(newReview);
      return res.json({ success: true, message: 'আপনার মূল্যবান রিভিউটি জমা দেওয়া হয়েছে। ধন্যবাদ!', review: newReview });
    }
  } catch (err) {
    console.error('Error creating review:', err);
    return res.status(500).json({ success: false, message: 'রিভিউ সংরক্ষণ করতে ত্রুটি হয়েছে: ' + err.message });
  }
};

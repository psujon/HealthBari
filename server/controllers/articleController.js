import { getPool, isDbConnected } from '../config/db.js';

let localArticles = [];

export const getArticles = async (req, res) => {
  try {
    const pool = getPool();
    if (isDbConnected() && pool) {
      const [rows] = await pool.query('SELECT * FROM health_articles ORDER BY created_at DESC');
      const formatted = rows.map(r => ({
        id: r.id,
        title: r.title,
        category: r.category,
        readTime: r.read_time,
        date: r.date,
        summary: r.summary,
        content: typeof r.content === 'string' ? JSON.parse(r.content) : r.content,
        recommendedProductId: r.recommended_product_id
      }));
      return res.json({ success: true, count: formatted.length, articles: formatted });
    }
    res.json({ success: true, count: localArticles.length, articles: localArticles });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createArticle = async (req, res) => {
  try {
    const { title, category, readTime, date, summary, content, recommendedProductId } = req.body;
    
    if (!title || !summary) {
      return res.status(400).json({ success: false, message: 'শিরোনাম ও সংক্ষিপ্ত বিবরণ আবশ্যক।' });
    }

    const id = 'art-' + Date.now();
    const finalContent = Array.isArray(content) && content.length > 0 ? content : [
      'সঠিক নিয়ম অনুযায়ী নিয়মিত স্বাস্থ্য পরিমাপ নিন।',
      'প্রয়োজনে রেজিস্টার্ড ডাক্তারের পরামর্শ গ্রহণ করুন।'
    ];

    const newArticle = {
      id,
      title,
      category: category || 'সাধারণ স্বাস্থ্য',
      readTime: readTime || '৪ মিনিট পড়া',
      date: date || new Date().toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' }),
      summary,
      content: finalContent,
      recommendedProductId: recommendedProductId || 'bp-monitor-pro'
    };

    const pool = getPool();
    if (isDbConnected() && pool) {
      await pool.query(
        `INSERT INTO health_articles (id, title, category, read_time, date, summary, content, recommended_product_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          newArticle.id, newArticle.title, newArticle.category, newArticle.readTime,
          newArticle.date, newArticle.summary, JSON.stringify(newArticle.content),
          newArticle.recommendedProductId
        ]
      );
      return res.status(201).json({
        success: true,
        message: 'স্বাস্থ্য তথ্য সফলভাবে যুক্ত হয়েছে!',
        article: newArticle
      });
    }

    localArticles.unshift(newArticle);
    res.status(201).json({
      success: true,
      message: 'স্বাস্থ্য তথ্য সফলভাবে যুক্ত হয়েছে!',
      article: newArticle
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, category, readTime, date, summary, content, recommendedProductId } = req.body;
    const pool = getPool();

    const finalContent = Array.isArray(content) ? content : [];

    if (isDbConnected() && pool) {
      await pool.query(
        `UPDATE health_articles 
         SET title = ?, category = ?, read_time = ?, summary = ?, content = ?, recommended_product_id = ?
         WHERE id = ?`,
        [
          title, category, readTime || '৪ মিনিট পড়া', summary,
          JSON.stringify(finalContent), recommendedProductId || null, id
        ]
      );
      return res.json({ success: true, message: 'স্বাস্থ্য তথ্য সফলভাবে আপডেট হয়েছে!' });
    }

    const art = localArticles.find(a => a.id === id);
    if (!art) return res.status(404).json({ success: false, message: 'স্বাস্থ্য তথ্য পাওয়া যায়নি।' });

    Object.assign(art, {
      title: title || art.title,
      category: category || art.category,
      readTime: readTime || art.readTime,
      summary: summary || art.summary,
      content: finalContent.length > 0 ? finalContent : art.content,
      recommendedProductId: recommendedProductId || art.recommendedProductId
    });

    res.json({ success: true, article: art });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getPool();

    if (isDbConnected() && pool) {
      await pool.query('DELETE FROM health_articles WHERE id = ?', [id]);
      return res.json({ success: true, message: 'স্বাস্থ্য তথ্য মুছে ফেলা হয়েছে।' });
    }

    localArticles = localArticles.filter(a => a.id !== id);
    res.json({ success: true, message: 'স্বাস্থ্য তথ্য মুছে ফেলা হয়েছে।' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

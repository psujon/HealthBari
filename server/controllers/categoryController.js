import { getPool, isDbConnected } from '../config/db.js';

let localCategories = [];

export const getCategories = async (req, res) => {
  try {
    const pool = getPool();
    if (isDbConnected() && pool) {
      const [rows] = await pool.query('SELECT * FROM categories ORDER BY created_at ASC');
      return res.json({ success: true, categories: rows });
    }
    res.json({ success: true, categories: localCategories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name, slug } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'ক্যাটাগরির নাম দেওয়া আবশ্যক।' });
    }

    const catSlug = slug?.trim() || 'cat-' + Date.now();
    const id = catSlug;
    const newCategory = { id, name: name.trim(), slug: catSlug };

    const pool = getPool();
    if (isDbConnected() && pool) {
      await pool.query(
        'INSERT IGNORE INTO categories (id, name, slug) VALUES (?, ?, ?)',
        [id, newCategory.name, newCategory.slug]
      );
      return res.status(201).json({ success: true, message: 'ক্যাটাগরি সফলভাবে তৈরি হয়েছে!', category: newCategory });
    }

    localCategories.push(newCategory);
    res.status(201).json({ success: true, message: 'ক্যাটাগরি সফলভাবে তৈরি হয়েছে!', category: newCategory });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getPool();
    if (isDbConnected() && pool) {
      await pool.query('DELETE FROM categories WHERE id = ? OR slug = ?', [id, id]);
      return res.json({ success: true, message: 'ক্যাটাগরি মুছে ফেলা হয়েছে।' });
    }

    localCategories = localCategories.filter(c => c.id !== id && c.slug !== id);
    res.json({ success: true, message: 'ক্যাটাগরি মুছে ফেলা হয়েছে।' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

import { getPool, isDbConnected } from '../config/db.js';

let localOrders = [];

export const createOrder = async (req, res) => {
  try {
    const body = req.body || {};
    const customer = body.customer || {
      name: body.name || 'সম্মানিত গ্রাহক',
      phone: body.phone || '01700000000',
      address: body.address || 'ঢাকা, বাংলাদেশ',
      email: body.email || '',
      note: body.note || ''
    };

    const orderId = body.orderId || ('HB-' + Math.floor(1000 + Math.random() * 9000));
    const items = Array.isArray(body.items) && body.items.length > 0 ? body.items : [
      {
        productId: body.productId || 'bp-monitor-pro',
        title: body.title || 'স্মার্ট ডিজিটাল ব্লাড প্রেশার মনিটর',
        variantName: body.variantName || 'স্ট্যান্ডার্ড',
        price: Number(body.price) || 1490,
        quantity: Number(body.quantity) || 1
      }
    ];

    const deliveryArea = body.deliveryArea || 'inside_dhaka';
    const shippingCharge = (body.shippingCharge !== undefined && body.shippingCharge !== null && !isNaN(Number(body.shippingCharge)))
      ? Number(body.shippingCharge)
      : (deliveryArea === 'inside_dhaka' ? 0 : 0);
    const subtotal = (body.subtotal !== undefined && body.subtotal !== null && !isNaN(Number(body.subtotal)))
      ? Number(body.subtotal)
      : items.reduce((sum, it) => sum + (Number(it.price) * (Number(it.quantity) || 1)), 0);
    const discountAmount = Number(body.discountAmount) || 0;
    const grandTotal = (body.grandTotal !== undefined && body.grandTotal !== null && !isNaN(Number(body.grandTotal)))
      ? Number(body.grandTotal)
      : Math.max(0, subtotal + shippingCharge - discountAmount);

    const orderData = {
      orderId,
      createdAt: new Date().toISOString(),
      customer,
      items,
      deliveryArea,
      shippingCharge,
      subtotal,
      discountAmount,
      grandTotal,
      paymentMethod: body.paymentMethod || 'Cash on Delivery',
      status: 'Pending'
    };

    const pool = getPool();
    if (isDbConnected() && pool) {
      const conn = await pool.getConnection();
      try {
        await conn.beginTransaction();

        await conn.query(
          `INSERT INTO orders (order_id, customer_name, customer_phone, customer_address, customer_email, customer_note, delivery_area, shipping_charge, subtotal, discount_amount, grand_total, payment_method, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            orderId, customer.name, customer.phone, customer.address,
            customer.email || null, customer.note || null,
            orderData.deliveryArea, orderData.shippingCharge, orderData.subtotal,
            orderData.discountAmount, orderData.grandTotal, 'Cash on Delivery', 'Pending'
          ]
        );

        if (items && items.length > 0) {
          for (const it of items) {
            await conn.query(
              `INSERT INTO order_items (order_id, product_id, title, variant_name, price, quantity)
               VALUES (?, ?, ?, ?, ?, ?)`,
              [orderId, it.productId || null, it.title || 'পণ্য', it.variantName || null, it.price || 0, it.quantity || 1]
            );
          }
        }

        await conn.commit();
        return res.status(201).json({
          success: true,
          message: 'অর্ডার সফলভাবে MySQL ডাটাবেজে সংরক্ষিত হয়েছে!',
          order: orderData
        });
      } catch (sqlErr) {
        await conn.rollback();
        console.warn('MySQL order error, using fallback:', sqlErr.message);
      } finally {
        conn.release();
      }
    }

    // Local fallback
    localOrders.unshift(orderData);
    res.status(201).json({
      success: true,
      message: 'অর্ডার সফলভাবে সম্পন্ন হয়েছে!',
      order: orderData
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getOrders = async (req, res) => {
  try {
    const { status } = req.query;
    const pool = getPool();

    if (isDbConnected() && pool) {
      let query = 'SELECT * FROM orders';
      const params = [];
      if (status && status !== 'all') {
        query += ' WHERE status = ?';
        params.push(status);
      }
      query += ' ORDER BY created_at DESC';

      const [orders] = await pool.query(query, params);
      const [items] = await pool.query('SELECT * FROM order_items');

      const formatted = orders.map(o => ({
        orderId: o.order_id,
        createdAt: o.created_at,
        customer: {
          name: o.customer_name,
          phone: o.customer_phone,
          address: o.customer_address,
          email: o.customer_email,
          note: o.customer_note
        },
        deliveryArea: o.delivery_area,
        shippingCharge: o.shipping_charge,
        subtotal: o.subtotal,
        discountAmount: o.discount_amount,
        grandTotal: o.grand_total,
        paymentMethod: o.payment_method,
        status: o.status,
        courierInfo: o.tracking_code ? {
          courierName: o.courier_name,
          consignmentId: o.consignment_id,
          trackingCode: o.tracking_code,
          courierStatus: o.courier_status
        } : null,
        items: items
          .filter(it => it.order_id === o.order_id)
          .map(it => ({
            productId: it.product_id,
            title: it.title,
            variantName: it.variant_name,
            price: it.price,
            quantity: it.quantity
          }))
      }));

      return res.json({ success: true, count: formatted.length, orders: formatted });
    }

    let filtered = [...localOrders];
    if (status && status !== 'all') {
      filtered = filtered.filter(o => o.status === status);
    }
    res.json({ success: true, count: filtered.length, orders: filtered });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, courierInfo } = req.body;
    const pool = getPool();

    if (isDbConnected() && pool) {
      if (courierInfo) {
        await pool.query(
          `UPDATE orders SET status = ?, courier_name = ?, tracking_code = ?, consignment_id = ?, courier_status = ?
           WHERE order_id = ?`,
          [
            status,
            courierInfo?.courierName || null,
            courierInfo?.trackingCode || null,
            courierInfo?.consignmentId || null,
            courierInfo?.courierStatus || null,
            orderId
          ]
        );
      } else {
        await pool.query(
          `UPDATE orders SET status = ? WHERE order_id = ?`,
          [status, orderId]
        );
      }
      return res.json({ success: true, message: 'স্ট্যাটাস আপডেট সফল হয়েছে।' });
    }

    const order = localOrders.find(o => o.orderId === orderId);
    if (!order) return res.status(404).json({ success: false, message: 'অর্ডার পাওয়া যায়নি।' });

    order.status = status || order.status;
    if (courierInfo) order.courierInfo = courierInfo;

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const sendToSteadfastCourier = async (req, res) => {
  try {
    const { orderId } = req.params;
    const body = req.body || {};
    const courierName = body.courierName || 'Steadfast Courier';
    
    const prefix = courierName.includes('Pathao') ? 'PTH-' 
      : courierName.includes('RedX') ? 'RDX-'
      : courierName.includes('Sundarban') ? 'SND-'
      : courierName.includes('Paperfly') ? 'PFL-'
      : courierName.includes('SA') ? 'SAP-'
      : courierName.includes('নিজস্ব') ? 'RDR-'
      : courierName.includes('Steadfast') ? 'ST-'
      : 'TRK-';

    const trackingCode = (body.trackingCode && body.trackingCode.trim()) ? body.trackingCode.trim() : (prefix + Math.floor(100000 + Math.random() * 900000));
    const consignmentId = (body.consignmentId && body.consignmentId.trim()) ? body.consignmentId.trim() : ('CSG-' + Math.floor(10000 + Math.random() * 90000));
    const courierStatus = body.courierStatus || 'In Transit (পার্সেল কুরিয়ারে গ্রহণ করা হয়েছে)';

    const courierData = {
      courierName,
      consignmentId,
      trackingCode,
      courierStatus,
      bookedAt: new Date().toISOString()
    };

    const pool = getPool();
    if (isDbConnected() && pool) {
      await pool.query(
        `UPDATE orders SET status = 'In Courier', courier_name = ?, consignment_id = ?, tracking_code = ?, courier_status = ?
         WHERE order_id = ?`,
        [courierData.courierName, consignmentId, trackingCode, courierData.courierStatus, orderId]
      );

      return res.json({
        success: true,
        message: `অর্ডারটি ${courierName} এ সফলভাবে বুক হয়েছে! ট্র্যাকিং কোড: ${trackingCode}`,
        order: { orderId, status: 'In Courier', courierInfo: courierData }
      });
    }

    const order = localOrders.find(o => o.orderId === orderId);
    if (!order) return res.status(404).json({ success: false, message: 'অর্ডার পাওয়া যায়নি।' });

    order.status = 'In Courier';
    order.courierInfo = courierData;

    res.json({
      success: true,
      message: `অর্ডারটি ${courierName} এ বুকিং হয়েছে! ট্র্যাকিং কোড: ${trackingCode}`,
      order
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Customer Live Parcel Tracking by Order ID, Phone or Courier Code
export const trackOrder = async (req, res) => {
  try {
    const rawQuery = (req.params.query || req.query.q || '').trim();
    if (!rawQuery) {
      return res.status(400).json({
        success: false,
        message: 'অনুগ্রহ করে সঠিক অর্ডার আইডি বা মোবাইল নম্বর লিখুন।'
      });
    }

    const query = rawQuery.replace(/^#/, '').trim();
    const pool = getPool();

    if (isDbConnected() && pool) {
      const [orders] = await pool.query(
        `SELECT * FROM orders 
         WHERE order_id = ? OR customer_phone LIKE ? OR tracking_code = ? OR consignment_id = ?
         ORDER BY created_at DESC LIMIT 5`,
        [query, `%${query}%`, query, query]
      );

      if (!orders || orders.length === 0) {
        return res.status(404).json({
          success: false,
          message: `"${rawQuery}" দিয়ে কোনো পার্সেল বা অর্ডার পাওয়া যায়নি। সঠিক অর্ডার আইডি (যেমন: #HB-1048) বা মোবাইল নম্বর দিন।`
        });
      }

      const orderIds = orders.map(o => o.order_id);
      const [items] = await pool.query('SELECT * FROM order_items WHERE order_id IN (?)', [orderIds]);

      const formatted = orders.map(o => ({
        orderId: o.order_id,
        createdAt: o.created_at,
        customer: {
          name: o.customer_name,
          phone: o.customer_phone,
          address: o.customer_address,
          email: o.customer_email,
          note: o.customer_note
        },
        deliveryArea: o.delivery_area,
        shippingCharge: o.shipping_charge,
        subtotal: o.subtotal,
        discountAmount: o.discount_amount,
        grandTotal: o.grand_total,
        paymentMethod: o.payment_method,
        status: o.status,
        courierInfo: o.tracking_code ? {
          courierName: o.courier_name,
          consignmentId: o.consignment_id,
          trackingCode: o.tracking_code,
          courierStatus: o.courier_status
        } : null,
        items: items
          .filter(it => it.order_id === o.order_id)
          .map(it => ({
            productId: it.product_id,
            title: it.title,
            variantName: it.variant_name,
            price: it.price,
            quantity: it.quantity
          }))
      }));

      return res.json({
        success: true,
        order: formatted[0],
        orders: formatted
      });
    }

    // Local in-memory search fallback
    const qLower = query.toLowerCase();
    const matched = localOrders.filter(o => {
      const oid = (o.orderId || o.order_id || '').toLowerCase();
      const phone = (o.customer?.phone || o.customerPhone || '').toLowerCase();
      const trk = (o.courierInfo?.trackingCode || o.tracking_code || '').toLowerCase();
      return oid.includes(qLower) || phone.includes(qLower) || trk.includes(qLower);
    });

    if (matched.length === 0) {
      return res.status(404).json({
        success: false,
        message: `"${rawQuery}" দিয়ে কোনো পার্সেল বা অর্ডার পাওয়া যায়নি। সঠিক অর্ডার আইডি বা মোবাইল নম্বর দিন।`
      });
    }

    res.json({
      success: true,
      order: matched[0],
      orders: matched
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

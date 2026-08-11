import express from 'express';
import { 
  createOrder, 
  getOrders, 
  updateOrderStatus, 
  sendToSteadfastCourier,
  trackOrder
} from '../controllers/orderController.js';

const router = express.Router();

router.post('/', createOrder);
router.get('/', getOrders);
router.get('/track/:query', trackOrder);
router.put('/:orderId/status', updateOrderStatus);
router.post('/:orderId/send-to-courier', sendToSteadfastCourier);

export default router;

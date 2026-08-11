import express from 'express';
import { 
  getProducts, 
  getProductByIdOrSlug, 
  createProduct, 
  updateProduct, 
  deleteProduct 
} from '../controllers/productController.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/:id', getProductByIdOrSlug);
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

export default router;

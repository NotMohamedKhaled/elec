// routes/admin.js

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authenticateToken, authorizeAdmin } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/upload');
const {
  createProduct,
  updateProduct,
  deleteProduct,
  getAllOrders,
  updateOrderStatus,
  getAllUsers,
  deleteUser,
} = require('../controllers/adminController');


// POST /api/admin/products — Create product (with image upload)
router.post(
  '/products',
  authenticateToken,
  authorizeAdmin,
  upload.single('image'),
  [
    body('title').notEmpty().withMessage('Title is required').trim(),
    body('category').notEmpty().withMessage('Category is required').trim(),
    body('price').notEmpty().withMessage('Price is required').trim(),
    body('specs').notEmpty().withMessage('Specs is required').trim(),
    body('description').notEmpty().withMessage('Description is required'),
  ],
  createProduct
);

// PUT /api/admin/products/:id — Update product
router.put(
  '/products/:id',
  authenticateToken,
  authorizeAdmin,
  [
    body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
    body('category').optional().trim().notEmpty().withMessage('Category cannot be empty'),
  ],
  updateProduct
);

router.delete('/products/:id', authenticateToken, authorizeAdmin, deleteProduct);

router.get('/orders', authenticateToken, authorizeAdmin, getAllOrders);

router.put(
  '/orders/:id/status',
  authenticateToken,
  authorizeAdmin,
  [
    body('status')
      .isIn(['Pending', 'Paid', 'Completed', 'Shipped', 'Delivered', 'Cancelled'])
      .withMessage('Invalid status value'),
  ],
  updateOrderStatus
);


router.get('/users', authenticateToken, authorizeAdmin, getAllUsers);

router.delete('/users/:id', authenticateToken, authorizeAdmin, deleteUser);

module.exports = router;

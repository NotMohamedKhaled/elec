
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/authMiddleware');
const { placeOrder, getUserOrders, cancelOrder } = require('../controllers/orderController');

router.post('/', authenticateToken, placeOrder);

router.get('/', authenticateToken, getUserOrders);

router.delete('/:orderId', authenticateToken, cancelOrder);

// Mock payment — marks order as Paid (no Stripe needed)
// router.put('/:orderId/pay', authenticateToken, mockPay);

module.exports = router;

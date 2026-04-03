const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

router.get('/', orderController.getOrderHistory);
router.post('/checkout', orderController.checkout);
router.post('/buy-now', orderController.buyNow);
router.get('/:orderId', orderController.getOrderDetail);
router.put('/:orderId/cancel', orderController.cancelOrder);

module.exports = router;
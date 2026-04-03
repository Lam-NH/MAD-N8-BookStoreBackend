const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

router.get('/', cartController.getCart);
router.post('/add', cartController.addToCart);
router.put('/item/:cartItemId', cartController.updateCartItemQuantity);
router.delete('/item/:cartItemId', cartController.removeCartItem);

module.exports = router;
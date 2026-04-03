const express = require('express');
const router = express.Router();
const checkoutDataController = require('../controllers/checkoutDataController');

router.get('/vouchers', checkoutDataController.getVouchers);
router.post('/vouchers/validate', checkoutDataController.validateVoucher);
router.get('/shipments', checkoutDataController.getShipments);

module.exports = router;

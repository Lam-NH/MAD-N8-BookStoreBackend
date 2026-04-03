const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');

router.get('/', profileController.getProfile);
router.put('/', profileController.updateProfile);

router.get('/address', profileController.getAddresses);
router.post('/address', profileController.addAddress);
router.put('/address/:addressId', profileController.updateAddress);
router.delete('/address/:addressId', profileController.deleteAddress);

router.get('/payment', profileController.getPaymentMethods);
router.post('/payment', profileController.addPaymentMethod);
router.put('/payment/:paymentId', profileController.updatePaymentMethod);
router.delete('/payment/:paymentId', profileController.deletePaymentMethod);

module.exports = router;
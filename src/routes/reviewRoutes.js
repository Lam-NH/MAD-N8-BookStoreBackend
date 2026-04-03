const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');

router.get('/book/:bookId', reviewController.getReviewsByBook);
router.post('/', reviewController.addReview);

module.exports = router;

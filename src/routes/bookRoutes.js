const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');

router.get('/categories', bookController.getCategories);
router.get('/', bookController.getBooks);
router.get('/for-you', bookController.getBooksForYou);
router.get('/search', bookController.searchBooks);
router.get('/author/:id', bookController.getAuthorDetail);
router.get('/author/:id/books', bookController.getBooksByAuthor);
router.get('/publisher/:id/books', bookController.getBooksByPublisher);
router.get('/:id', bookController.getBookDetail); // Các route động (:id) nên để dưới cùng

module.exports = router;
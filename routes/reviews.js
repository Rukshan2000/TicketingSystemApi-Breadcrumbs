const express = require('express');
const ReviewsController = require('../controllers/reviewsController');

const router = express.Router();

// Create a new review for a ticket
router.post('/', ReviewsController.createReview);

// Get all reviews with pagination
router.get('/', ReviewsController.getAllReviews);

// Get average rating (optionally filtered by ticket)
router.get('/stats/average', ReviewsController.getAverageRating);

// Get reviews by status
router.get('/status/:status', ReviewsController.getReviewsByStatus);

// Get reviews by rating
router.get('/rating/:rating', ReviewsController.getReviewsByRating);

// Get reviews by customer
router.get('/customer/:customerId', ReviewsController.getReviewsByCustomerId);

// Get review by ticket ID
router.get('/ticket/:ticketId', ReviewsController.getReviewsByTicketId);

// Get review by ID
router.get('/:id', ReviewsController.getReviewById);

// Update review
router.put('/:id', ReviewsController.updateReview);

// Delete review
router.delete('/:id', ReviewsController.deleteReview);

// Mark review as helpful
router.post('/:id/helpful', ReviewsController.markHelpful);

// Mark review as unhelpful
router.post('/:id/unhelpful', ReviewsController.markUnhelpful);

module.exports = router;

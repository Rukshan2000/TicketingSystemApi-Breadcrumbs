const ReviewsModel = require('../models/Reviews');

class ReviewsController {
  static async createReview(req, res) {
    try {
      const { ticket_id, customer_id, rating, review_text } = req.body;

      // Validate required fields
      if (!ticket_id || !customer_id || !rating) {
        return res.status(400).json({
          error: 'Missing required fields: ticket_id, customer_id, rating',
        });
      }

      // Validate rating is between 1-5
      if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
        return res.status(400).json({
          error: 'Rating must be an integer between 1 and 5',
        });
      }

      const review = await ReviewsModel.create({
        ticket_id,
        customer_id,
        rating,
        review_text: review_text || null,
      });

      return res.status(201).json({
        success: true,
        message: 'Review created successfully',
        data: review,
      });
    } catch (error) {
      console.error('Error creating review:', error);
      return res.status(500).json({
        error: 'Failed to create review',
        details: error.message,
      });
    }
  }

  static async getAllReviews(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 50;
      const offset = parseInt(req.query.offset) || 0;

      if (limit < 1 || limit > 500) {
        return res.status(400).json({ error: 'Limit must be between 1 and 500' });
      }

      if (offset < 0) {
        return res.status(400).json({ error: 'Offset must be non-negative' });
      }

      const reviews = await ReviewsModel.getAll(limit, offset);
      const totalCount = await ReviewsModel.getAllCount();

      return res.status(200).json({
        success: true,
        data: reviews,
        pagination: {
          limit,
          offset,
          total: totalCount,
        },
      });
    } catch (error) {
      console.error('Error retrieving reviews:', error);
      return res.status(500).json({
        error: 'Failed to retrieve reviews',
        details: error.message,
      });
    }
  }

  static async getReviewById(req, res) {
    try {
      const { id } = req.params;

      const review = await ReviewsModel.getById(id);

      if (!review) {
        return res.status(404).json({
          error: 'Review not found',
        });
      }

      return res.status(200).json({
        success: true,
        data: review,
      });
    } catch (error) {
      console.error('Error retrieving review:', error);
      return res.status(500).json({
        error: 'Failed to retrieve review',
        details: error.message,
      });
    }
  }

  static async getReviewsByTicketId(req, res) {
    try {
      const { ticketId } = req.params;

      const review = await ReviewsModel.getByTicketId(ticketId);

      return res.status(200).json({
        success: true,
        data: review || null,
        message: review ? 'Review found' : 'No review found for this ticket',
      });
    } catch (error) {
      console.error('Error retrieving review by ticket:', error);
      return res.status(500).json({
        error: 'Failed to retrieve review',
        details: error.message,
      });
    }
  }

  static async getReviewsByCustomerId(req, res) {
    try {
      const { customerId } = req.params;
      const limit = parseInt(req.query.limit) || 50;
      const offset = parseInt(req.query.offset) || 0;

      if (limit < 1 || limit > 500) {
        return res.status(400).json({ error: 'Limit must be between 1 and 500' });
      }

      if (offset < 0) {
        return res.status(400).json({ error: 'Offset must be non-negative' });
      }

      const reviews = await ReviewsModel.getByCustomerId(customerId, limit, offset);

      return res.status(200).json({
        success: true,
        data: reviews,
        pagination: {
          limit,
          offset,
          count: reviews.length,
        },
      });
    } catch (error) {
      console.error('Error retrieving customer reviews:', error);
      return res.status(500).json({
        error: 'Failed to retrieve reviews',
        details: error.message,
      });
    }
  }

  static async getReviewsByRating(req, res) {
    try {
      const { rating } = req.params;
      const limit = parseInt(req.query.limit) || 50;
      const offset = parseInt(req.query.offset) || 0;

      // Validate rating
      const ratingNum = parseInt(rating);
      if (ratingNum < 1 || ratingNum > 5) {
        return res.status(400).json({
          error: 'Rating must be between 1 and 5',
        });
      }

      if (limit < 1 || limit > 500) {
        return res.status(400).json({ error: 'Limit must be between 1 and 500' });
      }

      if (offset < 0) {
        return res.status(400).json({ error: 'Offset must be non-negative' });
      }

      const reviews = await ReviewsModel.getByRating(ratingNum, limit, offset);

      return res.status(200).json({
        success: true,
        data: reviews,
        pagination: {
          limit,
          offset,
          count: reviews.length,
        },
      });
    } catch (error) {
      console.error('Error retrieving reviews by rating:', error);
      return res.status(500).json({
        error: 'Failed to retrieve reviews',
        details: error.message,
      });
    }
  }

  static async getReviewsByStatus(req, res) {
    try {
      const { status } = req.params;
      const limit = parseInt(req.query.limit) || 50;
      const offset = parseInt(req.query.offset) || 0;

      const validStatuses = ['Pending', 'Approved', 'Rejected'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          error: 'Status must be one of: Pending, Approved, Rejected',
        });
      }

      if (limit < 1 || limit > 500) {
        return res.status(400).json({ error: 'Limit must be between 1 and 500' });
      }

      if (offset < 0) {
        return res.status(400).json({ error: 'Offset must be non-negative' });
      }

      const reviews = await ReviewsModel.getByStatus(status, limit, offset);

      return res.status(200).json({
        success: true,
        data: reviews,
        pagination: {
          limit,
          offset,
          count: reviews.length,
        },
      });
    } catch (error) {
      console.error('Error retrieving reviews by status:', error);
      return res.status(500).json({
        error: 'Failed to retrieve reviews',
        details: error.message,
      });
    }
  }

  static async updateReview(req, res) {
    try {
      const { id } = req.params;
      const { rating, review_text, status, helpful_count, unhelpful_count } = req.body;

      // Validate rating if provided
      if (rating !== undefined) {
        if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
          return res.status(400).json({
            error: 'Rating must be an integer between 1 and 5',
          });
        }
      }

      // Validate status if provided
      if (status !== undefined) {
        const validStatuses = ['Pending', 'Approved', 'Rejected'];
        if (!validStatuses.includes(status)) {
          return res.status(400).json({
            error: 'Status must be one of: Pending, Approved, Rejected',
          });
        }
      }

      const updates = {};
      if (rating !== undefined) updates.rating = rating;
      if (review_text !== undefined) updates.review_text = review_text;
      if (status !== undefined) updates.status = status;
      if (helpful_count !== undefined) updates.helpful_count = helpful_count;
      if (unhelpful_count !== undefined) updates.unhelpful_count = unhelpful_count;

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      const updatedReview = await ReviewsModel.update(id, updates);

      if (!updatedReview) {
        return res.status(404).json({ error: 'Review not found' });
      }

      return res.status(200).json({
        success: true,
        message: 'Review updated successfully',
        data: updatedReview,
      });
    } catch (error) {
      console.error('Error updating review:', error);
      return res.status(500).json({
        error: 'Failed to update review',
        details: error.message,
      });
    }
  }

  static async deleteReview(req, res) {
    try {
      const { id } = req.params;

      const deletedReview = await ReviewsModel.delete(id);

      if (!deletedReview) {
        return res.status(404).json({ error: 'Review not found' });
      }

      return res.status(200).json({
        success: true,
        message: 'Review deleted successfully',
        data: deletedReview,
      });
    } catch (error) {
      console.error('Error deleting review:', error);
      return res.status(500).json({
        error: 'Failed to delete review',
        details: error.message,
      });
    }
  }

  static async getAverageRating(req, res) {
    try {
      const { ticketId } = req.query;

      const stats = await ReviewsModel.getAverageRating(ticketId || null);

      return res.status(200).json({
        success: true,
        data: {
          average_rating: parseFloat(stats.average_rating) || 0,
          total_reviews: parseInt(stats.total_reviews),
        },
      });
    } catch (error) {
      console.error('Error getting average rating:', error);
      return res.status(500).json({
        error: 'Failed to get average rating',
        details: error.message,
      });
    }
  }

  static async markHelpful(req, res) {
    try {
      const { id } = req.params;

      const updatedReview = await ReviewsModel.markHelpful(id);

      if (!updatedReview) {
        return res.status(404).json({ error: 'Review not found' });
      }

      return res.status(200).json({
        success: true,
        message: 'Review marked as helpful',
        data: updatedReview,
      });
    } catch (error) {
      console.error('Error marking review as helpful:', error);
      return res.status(500).json({
        error: 'Failed to mark review as helpful',
        details: error.message,
      });
    }
  }

  static async markUnhelpful(req, res) {
    try {
      const { id } = req.params;

      const updatedReview = await ReviewsModel.markUnhelpful(id);

      if (!updatedReview) {
        return res.status(404).json({ error: 'Review not found' });
      }

      return res.status(200).json({
        success: true,
        message: 'Review marked as unhelpful',
        data: updatedReview,
      });
    } catch (error) {
      console.error('Error marking review as unhelpful:', error);
      return res.status(500).json({
        error: 'Failed to mark review as unhelpful',
        details: error.message,
      });
    }
  }
}

module.exports = ReviewsController;

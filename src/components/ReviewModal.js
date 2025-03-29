import { useState, useRef } from 'react'
import PocketBase from 'pocketbase'

const pocketbaseUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090'

export default function ReviewModal({ gameId, onClose, onReviewAdded }) {
  const [formData, setFormData] = useState({
    name: '',
    comment: '',
    rating: 0,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [reviews, setReviews] = useState([])
  const pb = useRef(new PocketBase(pocketbaseUrl))

  const fetchReviews = async () => {
    try {
      console.log('Fetching reviews for gameId:', gameId)
      const reviews = await pb.current.collection('wap_games_comments').getList(1, 50, {
        filter: `wap_game = "${gameId}"`,
        sort: '-created',
      })
      console.log('Fetched reviews:', reviews.items)
      setReviews(reviews.items)
    } catch (err) {
      // Only show error if it's not a cancellation error
      if (!err.message?.includes('autocancelled')) {
        console.error('Error fetching reviews:', err)
        console.error('Error details:', {
          message: err.message,
          status: err.status,
          data: err.data,
          url: err.url
        })
        setError(`Failed to load reviews: ${err.message}`)
        setReviews([])
      }
    }
  }

  // Fetch reviews when component mounts
  if (reviews.length === 0 && gameId) {
    fetchReviews()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError(null)

      // Validate the form data
      if (!formData.name.trim()) {
        throw new Error('Name is required')
      }
      if (!formData.rating) {
        throw new Error('Rating is required')
      }
      if (!formData.comment.trim()) {
        throw new Error('Comment is required')
      }

      // Create the review
      const reviewData = {
        name: formData.name.trim(),
        comment: formData.comment.trim(),
        rating: parseInt(formData.rating),
        wap_game: gameId,
      }

      console.log('Submitting review:', reviewData)
      const result = await pb.current.collection('wap_games_comments').create(reviewData)
      console.log('Review submitted:', result)

      // Reset form
      setFormData({
        name: '',
        comment: '',
        rating: 0,
      })

      // Refresh reviews
      await fetchReviews()
      onReviewAdded()
    } catch (err) {
      console.error('Error submitting review:', err)
      console.error('Error details:', {
        message: err.message,
        status: err.status,
        data: err.data,
        url: err.url
      })
      setError(`Failed to submit review: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-3xl">
        <h3 className="font-bold text-lg mb-4">Add a Review</h3>
        
        {error && (
          <div className="alert alert-error mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">Your Name</span>
              <span className="label-text-alt text-error">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="input input-bordered w-full"
              required
              disabled={loading}
            />
          </div>

          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">Rating</span>
              <span className="label-text-alt text-error">*</span>
            </label>
            <div className="rating rating-lg">
              {[1, 2, 3, 4, 5].map((star) => (
                <input
                  key={star}
                  type="radio"
                  name="rating"
                  className="mask mask-star-2 bg-orange-400"
                  checked={formData.rating === star}
                  onChange={() => setFormData(prev => ({ ...prev, rating: star }))}
                  required
                  disabled={loading}
                />
              ))}
            </div>
          </div>

          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">Comment</span>
              <span className="label-text-alt text-error">*</span>
            </label>
            <textarea
              name="comment"
              value={formData.comment}
              onChange={handleChange}
              className="textarea textarea-bordered h-24"
              required
              disabled={loading}
            />
          </div>

          <div className="modal-action">
            <button 
              type="button" 
              className="btn" 
              onClick={onClose}
              disabled={loading}>
              Close
            </button>
            <button
              type="submit"
              className={`btn btn-primary ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>

        {/* Reviews Section */}
        <div className="divider my-8"></div>
        <h4 className="font-bold text-lg mb-4">Reviews</h4>
        {reviews.length > 0 ? (
          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {reviews.map((review) => (
              <div key={review.id} className="card bg-base-200 shadow-xl">
                <div className="card-body">
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="font-semibold">{review.name}</h5>
                      <div className="rating rating-sm mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <input
                            key={star}
                            type="radio"
                            className="mask mask-star-2 bg-orange-400"
                            checked={review.rating === star}
                            readOnly
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-sm text-base-content/70">
                      {new Date(review.created).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap">{review.comment}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-base-content/70">No reviews yet. Be the first to review!</p>
        )}
      </div>
    </div>
  )
} 
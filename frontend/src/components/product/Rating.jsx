export default function Rating({
  rating = 0,
  reviews = 0
}) {
  const numericRating = Math.max(
    0,
    Math.min(5, Number(rating) || 0)
  )

  const reviewCount = Number(reviews) || 0

  const fullStars = Math.floor(numericRating)

  const hasHalfStar =
    numericRating - fullStars >= 0.5

  const emptyStars =
    5 - fullStars - (hasHalfStar ? 1 : 0)

  return (
    <span
      className="rating"
      aria-label={`${numericRating} out of 5 stars, ${reviewCount} reviews`}
    >
      <span className="rating-stars">
        {'★'.repeat(fullStars)}

        {hasHalfStar && '★'}

        {'☆'.repeat(emptyStars)}
      </span>

      <span className="rating-value">
        {numericRating > 0
          ? numericRating.toFixed(1)
          : 'No rating'}
      </span>

      {reviewCount > 0 && (
        <small>
          ({reviewCount})
        </small>
      )}
    </span>
  )
}
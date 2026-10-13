import { Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useStore } from '../../context/StoreContext'
import { money } from '../../utils/formatters'
import Rating from './Rating'

export default function ProductCard({ product }) {
  const { add, wish, toggleWish } = useStore()

  const liked = wish.includes(product.id)

  return (
    <article className="product-card">
      {/* Product Image */}
      <div className="product-image">
        <Link to={`/product/${product.id}`}>
          <img
            src={product.image}
            alt={product.name}
          />
        </Link>

        <span className="tag">
          {product.tag}
        </span>

        <button
          type="button"
          className={`heart ${liked ? 'liked' : ''}`}
          onClick={() => toggleWish(product.id)}
          aria-label={
            liked
              ? 'Remove from wishlist'
              : 'Add to wishlist'
          }
        >
          <Heart
            size={17}
            fill={liked ? 'currentColor' : 'none'}
          />
        </button>
      </div>

      {/* Product Details */}
      <div className="product-copy">
        <Link to={`/product/${product.id}`}>
          <h3>{product.name}</h3>
        </Link>

        <p>{product.category}</p>

        {/* Product Rating & Reviews */}
        <Rating
          rating={product.rating}
          reviews={product.reviewCount}
        />

        {/* Price */}
        <div className="price">
          <strong>
            {money(product.price)}
          </strong>

          {product.old != null && (
            <del>
              {money(product.old)}
            </del>
          )}
        </div>

        {/* Add to Cart */}
        <button
          type="button"
          className="add"
          onClick={() => add(product)}
        >
          Add to cart
        </button>
      </div>
    </article>
  )
}
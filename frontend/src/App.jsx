// ============================================================
// IMPORTS
// ============================================================

import React, { useEffect, useRef, useState } from 'react'

import {
  BrowserRouter,
  Link,
  Navigate,
  useLocation,
  useNavigate
} from 'react-router-dom'

import {
  ArrowRight,
  ChevronDown,
  Heart,
  Menu,
  Search,
  ShoppingBag,
  UserRound,
  X,
  Star,
  Minus,
  Plus,
  Check,
  Mail,
  MessageCircle,

  // Trust / Service section icons
  Gem,
  Truck,
  Package,
  ShieldCheck
} from 'lucide-react'

// Instagram icon
import { FaInstagram, FaWhatsapp } from 'react-icons/fa'

import './styles.css'

// API
import { apiRequest, productService, orderService, reviewService, cmsService, newsletterService, contactService } from './services/api'

// Authentication / Context
import {
  AuthProvider,
  useAuth
} from './context/AuthContext'

// Store / Context
import {
  StoreProvider,
  useStore
} from './context/StoreContext'

// Admin page
import Admin from './pages/Admin'

// Product data
import {
  images,
  products
} from './data/products'

// Category data
import {
  categories
} from './data/categories'

// Currency formatter — WOODISTRY US storefront
const money = value => new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
}).format(Number(value) || 0)


// ============================================================
// IMAGE URLs
// ============================================================

const logoUrl = '/logo.png'
const heroImage = '/woodistry-images/hero-living.png'
const tableImage = '/woodistry-images/hero-dining.png'

const defaultHeroSlides = [
  {
    image: '/woodistry-images/hero-living.png',
    alt: 'Sunlit living room with warm contemporary furniture'
  },
  {
    image: '/woodistry-images/hero-dining.png',
    alt: 'Premium dining room with a solid wood dining table'
  },
  {
    image: '/woodistry-images/hero-bedroom.png',
    alt: 'Calm luxury bedroom with natural wood furniture'
  }
]

const woodistrySampleProducts = [
  { name: 'Oak Lounge Chair', material: 'Oak & linen', price: '$64,900', image: '' },
  { name: 'Walnut Dining Table', material: 'Solid walnut', price: '$108,500', image: '' },
  { name: 'Ridgewood Sofa', material: 'Belgian linen', price: '$154,900', image: '' },
  { name: 'Mason Coffee Table', material: 'Natural oak', price: '$48,900', image: '' },
  { name: 'Edison Sideboard', material: 'American walnut', price: '$89,900', image: '' }
]

const woodistrySpaces = [
  { name: 'Living Room', image: '/woodistry-images/space-living-room.png', query: 'living-room' },
  { name: 'Dining', image: '/woodistry-images/space-dining.png', query: 'dining' },
  { name: 'Bedroom', image: '/woodistry-images/space-bedroom.png', query: 'bedroom' },
  { name: 'Storage', image: '/woodistry-images/space-storage.png', query: 'storage' }
]


// ============================================================
// WOODISTRY IMAGE — BRAND SHIMMER WHILE LOADING
// ============================================================
function WoodistryImage({ src, alt = '', className = '', imageClassName = '', loading = 'lazy' }) {
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setLoaded(false)
    setFailed(false)
  }, [src])

  return (
    <span
      className={`woodistry-image-shell${loaded ? ' is-loaded' : ''}${failed ? ' has-error' : ''} ${className}`.trim()}
      aria-busy={!loaded && !failed}
    >
      {!loaded && !failed && (
        <span className="woodistry-image-shimmer" aria-hidden="true">
          <span className="woodistry-shimmer-wordmark">WOODISTRY</span>
        </span>
      )}
      {src && !failed && (
        <img
          src={src}
          alt={alt}
          loading={loading}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={`woodistry-image-content${loaded ? ' is-visible' : ''} ${imageClassName}`.trim()}
        />
      )}
      {(!src || failed) && (
        <span className="woodistry-image-shimmer woodistry-image-fallback" aria-label="WOODISTRY image unavailable">
          <span className="woodistry-shimmer-wordmark">WOODISTRY</span>
        </span>
      )}
    </span>
  )
}

// ============================================================
// WOODISTRY HEADER + MEGA MENU
// ============================================================

function Header() {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [announcementText, setAnnouncementText] = useState('Complimentary delivery on orders over $1,500')
  const [announcementEnabled, setAnnouncementEnabled] = useState(true)
  const { user } = useAuth()
  const { count } = useStore()
  const navigate = useNavigate()

  useEffect(() => {
    let cancelled = false
    async function loadAnnouncement() {
      try {
        const result = await apiRequest('/cms/announcement')
        const data = result?.data || result?.announcement || result || {}
        if (cancelled) return
        if (data?.text || data?.message) setAnnouncementText(data.text || data.message)
        if (data?.enabled !== undefined) setAnnouncementEnabled(Boolean(data.enabled))
      } catch (error) {
        console.error('Announcement load error:', error)
      }
    }
    loadAnnouncement()
    return () => { cancelled = true }
  }, [])

  const navItems = [
    { label: 'Shop', to: '/shop' },
    { label: 'Living', to: '/shop?category=Living%20Room' },
    { label: 'Dining', to: '/shop?category=Dining' },
    { label: 'Bedroom', to: '/shop?category=Bedroom' },
    { label: 'Gift', to: '/shop?category=Gift' },
    { label: 'About', to: '/about' }
  ]

  return (
    <>
      {announcementEnabled && announcementText && (
        <div className="wood-announcement">
          <span>{announcementText}</span>
        </div>
      )}
      <header className="wood-header" onMouseLeave={() => setMenuOpen(false)}>
        <button className="wood-mobile-menu" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
        <Link to="/" className="wood-wordmark" aria-label="Woodistry home">
          <img
            src={logoUrl}
            alt="WOODISTRY"
            onError={(event) => {
              event.currentTarget.style.display = 'none'
              const fallback = event.currentTarget.nextElementSibling
              if (fallback) fallback.style.display = 'inline-block'
            }}
          />
          <span className="wood-wordmark-text">WOODISTRY</span>
        </Link>
        <nav className={`wood-nav ${open ? 'is-open' : ''}`}>
          {navItems.map(item => (
            <Link key={item.label} to={item.to}
              onMouseEnter={() => setMenuOpen(item.label === 'Shop')}
              onClick={() => { setOpen(false); setMenuOpen(false) }}>
              {item.label}{item.label === 'Shop' && <ChevronDown size={12} />}
            </Link>
          ))}
        </nav>
        <div className="wood-header-actions">
          <button className="wood-action-search" onClick={() => setSearch(!search)} aria-label="Search"><Search size={20}/><span>Search</span></button>
          <button onClick={() => navigate(user?.role === 'admin' ? '/admin' : '/account')} aria-label="Account"><UserRound size={21}/></button>
          <button onClick={() => navigate('/wishlist')} aria-label="Wishlist"><Heart size={22}/></button>
          <button className="wood-bag" onClick={() => navigate('/cart')} aria-label="Shopping bag"><ShoppingBag size={22}/><b>{count || 0}</b></button>
        </div>
        {menuOpen && (
          <div className="wood-mega-menu">
            <div className="wood-mega-links">
              <span className="wood-kicker">Explore collections</span>
              <Link to="/shop">All furniture</Link>
              <Link to="/shop?category=Living%20Room">Living room</Link>
              <Link to="/shop?category=Dining">Dining room</Link>
              <Link to="/shop?category=Bedroom">Bedroom</Link>
              <Link to="/shop?filter=new">New arrivals</Link>
            </div>
            <Link to="/shop?category=Living%20Room" className="wood-mega-feature">
              <WoodistryImage className="wood-mega-feature-image" src={woodistrySpaces[0].image} alt="Living room collection"/>
              <span><small>THE LIVING EDIT</small><strong>Make room for living.</strong><em>Shop now →</em></span>
            </Link>
            <Link to="/shop?filter=new" className="wood-mega-feature">
              <WoodistryImage className="wood-mega-feature-image" src={woodistrySpaces[1].image} alt="Dining collection"/>
              <span><small>SEASONAL COLLECTION</small><strong>Gather beautifully.</strong><em>Discover →</em></span>
            </Link>
            <button className="wood-mega-close" onClick={() => setMenuOpen(false)} aria-label="Close menu"><X size={19}/></button>
          </div>
        )}
      </header>
      {search && (
        <form className="wood-search-panel" onSubmit={e => { e.preventDefault(); navigate(`/shop?search=${encodeURIComponent(e.target.q.value)}`); setSearch(false) }}>
          <Search size={20}/><input name="q" autoFocus placeholder="Search furniture, materials and collections..."/><button type="submit">Search <ArrowRight size={15}/></button><button type="button" onClick={() => setSearch(false)} aria-label="Close search"><X size={18}/></button>
        </form>
      )}
    </>
  )
}


// ============================================================
// BUTTON COMPONENT
// ============================================================

function Button({
  children,
  to,
  onClick,
  light = false,
  className = ''
}) {

  // If "to" exists, use Link.
  // Otherwise use normal button.
  const Tag = to ? Link : 'button'

  return (
    <Tag
      to={to}
      onClick={onClick}
      className={`button ${
        light ? 'button-light' : ''
      } ${className}`}
    >

      {children}

      <ArrowRight size={15} />

    </Tag>
  )
}


// ============================================================
// RATING COMPONENT
// ============================================================

function Rating({
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
      aria-label={`${numericRating.toFixed(1)} out of 5 stars, ${reviewCount} reviews`}
    >
      <span className="rating-stars">
        {'★'.repeat(fullStars)}
        {hasHalfStar && '★'}
        {'☆'.repeat(emptyStars)}
      </span>

      {reviewCount > 0 ? (
        <small>
          {numericRating.toFixed(1)} ({reviewCount})
        </small>
      ) : (
        <small>
          No reviews yet
        </small>
      )}
    </span>
  )
}


// ============================================================
// PRODUCT CARD — PREMIUM REDESIGN
// ============================================================

let adminPreviewSessionActive = false

const isAdminPreviewMode = () => {
  try {
    return (
      new URLSearchParams(window.location.search).get('xaajPreview') === '1' ||
      adminPreviewSessionActive
    )
  } catch {
    return adminPreviewSessionActive
  }
}

function ProductCard({
  product
}) {
  const {
    add,
    wish,
    toggleWish
  } = useStore()

  const [wishlistPulse, setWishlistPulse] = useState(false)
  const [cartPulse, setCartPulse] = useState(false)

  // Always prefer the normalized id, with _id as a safe fallback.
  const productId = product.id || product._id

  const liked = wish.includes(productId)

  // Second product image for hover.
  const secondaryImage =
    product.images?.[1] ||
    product.image ||
    ''

  // ----------------------------------------------------------
  // Wishlist
  // ----------------------------------------------------------

  const handleWishlist = event => {
    event.preventDefault()
    event.stopPropagation()

    if (!productId) return

    toggleWish(productId)

    setWishlistPulse(true)

    window.setTimeout(() => {
      setWishlistPulse(false)
    }, 500)
  }

  // ----------------------------------------------------------
  // Add to cart
  // ----------------------------------------------------------

  const handleAddToCart = event => {
    event.preventDefault()
    event.stopPropagation()

    if (isAdminPreviewMode()) {
      window.alert(
        'Admin Preview Mode: adding products to cart is disabled.'
      )
      return
    }

    const card =
      event.currentTarget.closest('.product-card')

    const image =
      card?.querySelector('.product-image-primary')

    const cartTarget =
      document.querySelector(
        '[data-xaaj-cart-target="true"]'
      )

    const imageRect =
      image?.getBoundingClientRect()

    const cartRect =
      cartTarget?.getBoundingClientRect()

    add(product)

    setCartPulse(true)

    window.setTimeout(() => {
      setCartPulse(false)
    }, 520)

    window.dispatchEvent(
      new CustomEvent('xaaj:cart-added')
    )

    if (!imageRect || !cartRect) return

    const clone = image.cloneNode(true)

    const startX = imageRect.left
    const startY = imageRect.top

    const endX =
      cartRect.left +
      cartRect.width / 2 -
      25

    const endY =
      cartRect.top +
      cartRect.height / 2 -
      25

    Object.assign(clone.style, {
      position: 'fixed',
      left: `${startX}px`,
      top: `${startY}px`,
      width: `${Math.min(imageRect.width, 82)}px`,
      height: `${Math.min(imageRect.height, 82)}px`,
      objectFit: 'cover',
      borderRadius: '50%',
      zIndex: '20000',
      pointerEvents: 'none',
      margin: '0',
      boxShadow: '0 14px 40px rgba(41,40,37,.20)',
      transform: 'translate3d(0,0,0) scale(1)',
      opacity: '1',
      transition:
        'transform .78s cubic-bezier(.22,1,.36,1), opacity .78s ease'
    })

    document.body.appendChild(clone)

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        clone.style.transform =
          `translate3d(${endX - startX}px, ${endY - startY}px, 0) scale(.12)`

        clone.style.opacity = '0'
      })
    })

    window.setTimeout(() => {
      clone.remove()
    }, 850)
  }

  return (
    <article className="product-card">

      {/* ======================================================
          PRODUCT IMAGE
          ====================================================== */}

      <div className="product-image">

        <Link
          to={`/product/${product.slug}`}
          className="product-image-link"
          aria-label={`View ${product.name}`}
        >

          {/* Original image */}
          <img
            className="product-image-primary"
            src={product.image}
            alt={product.name}
            loading="lazy"
          />

          {/* Second image appears smoothly on hover */}
          {secondaryImage && (
            <img
              className="product-image-secondary"
              src={secondaryImage}
              alt=""
              aria-hidden="true"
              loading="lazy"
            />
          )}

        </Link>

        {/* Product tag */}
        {product.tag && (
          <span className="tag">
            {product.tag}
          </span>
        )}

        {/* Wishlist */}
        <button
          type="button"
          className={`heart ${
            liked ? 'liked' : ''
          } ${
            wishlistPulse ? 'wishlist-pop' : ''
          }`}
          onClick={handleWishlist}
          aria-label={
            liked
              ? `Remove ${product.name} from wishlist`
              : `Add ${product.name} to wishlist`
          }
          aria-pressed={liked}
        >
          <Heart
            size={18}
            strokeWidth={1.45}
            fill={
              liked
                ? 'currentColor'
                : 'none'
            }
          />

          <span className="heart-tooltip">
            {liked
              ? 'Saved'
              : 'Add to wishlist'}
          </span>
        </button>

        {/* Add to cart — kept in the original product-card position */}
        <span className="product-image-bottom-spacer" aria-hidden="true" />

      </div>

      {/* ======================================================
          PRODUCT INFORMATION
          ====================================================== */}

      <div className="product-copy">

        <div className="product-meta">
          <span className="product-category">
            {product.category}
          </span>
        </div>

        <Link
          to={`/product/${product.slug}`}
          className="product-title-link"
        >
          <h3>{product.name}</h3>
        </Link>

        <p className="product-description">
          {product.description ||
            product.desc ||
            product.shortDescription ||
            'Beautifully crafted for everyday use.'}
        </p>

        <Rating
          rating={product.rating}
          reviews={
            product.reviewCount ??
            product.reviews ??
            0
          }
        />

        <div className="product-bottom-row">
          <div className="price">
            <strong>{money(product.price)}</strong>

            {Number(product.old || 0) > Number(product.price || 0) && (
              <del>{money(product.old)}</del>
            )}

            {Number(product.old || 0) > Number(product.price || 0) && (
              <span className="save-badge">
                {Math.round(
                  ((Number(product.old) - Number(product.price)) /
                    Number(product.old)) *
                    100
                )}% off
              </span>
            )}
          </div>

          <button
            type="button"
            className={`add ${cartPulse ? 'add-success' : ''}`}
            onClick={handleAddToCart}
            disabled={Number(product.stock ?? 0) <= 0}
            aria-label={
              Number(product.stock ?? 0) <= 0
                ? 'Out of stock'
                : `Add ${product.name} to cart`
            }
          >
            <span className="add-label">
              {Number(product.stock ?? 0) <= 0
                ? 'Out of stock'
                : cartPulse
                  ? 'Added to cart'
                  : 'Add to Cart'}
            </span>

            <span className="add-icon" aria-hidden="true">
              {Number(product.stock ?? 0) <= 0
                ? null
                : cartPulse
                  ? <Check size={15} />
                  : null}
            </span>

            <span className="add-shine" aria-hidden="true" />
          </button>
        </div>

        {/* Subtle stock cue */}
        {Number(product.stock ?? 0) > 0 &&
          Number(product.stock ?? 0) <= 5 && (
            <span className="low-stock">
              Only {product.stock} left
            </span>
          )}

      </div>

    </article>
  )
}


// ============================================================
// HOMEPAGE BEST SELLER CARD — EDITORIAL WOODISTRY STYLE
// Used only in the homepage Best Sellers row. Shop/product pages
// continue using the existing ProductCard and its full functionality.
// ============================================================
function WoodistryBestSellerCard({ product }) {
  const { wish, toggleWish } = useStore()
  const productId = product.id || product._id
  const liked = wish.includes(productId)
  const image = product.image || product.images?.[0] || ''
  const material = product.material || product.materials || product.subtitle || product.category || ''

  return (
    <article className="wood-home-product">
      <div className="wood-home-product-image">
        <Link to={`/product/${product.slug}`} className="wood-home-product-image-link" aria-label={`View ${product.name}`}>
          <img className="wood-home-product-image-primary" src={image} alt={product.name} loading="lazy" />
          <span className="wood-home-product-quick">Quick view <ArrowRight size={14} /></span>
        </Link>
        <button type="button" className={`wood-home-product-heart${liked ? ' liked' : ''}`}
          onClick={event => { event.preventDefault(); event.stopPropagation(); if (productId) toggleWish(productId) }}
          aria-label={liked ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          aria-pressed={liked}>
          <Heart size={22} strokeWidth={1.7} fill={liked ? 'currentColor' : 'none'} />
        </button>
      </div>
      <div className="wood-home-product-details">
        <div className="wood-home-product-title-row">
          <Link to={`/product/${product.slug}`} className="wood-home-product-name">{product.name}</Link>
          <strong className="wood-home-product-price">{money(product.price)}</strong>
        </div>
        {material && <p className="wood-home-product-material">{material}</p>}
      </div>
    </article>
  )
}


// ============================================================
// SECTION HEADING
// ============================================================

function SectionHeading({
  eyebrow,
  title,
  action
}) {

  return (
    <div className="section-heading">

      <div>

        <span className="eyebrow">
          {eyebrow}
        </span>

        <h2>
          {title}
        </h2>

      </div>


      {/* Optional Action Link */}
      {action && (
        <Link to={action.to}>

          {action.label}

          <ArrowRight
            size={14}
          />

        </Link>
      )}

    </div>
  )
}


// ============================================================
// WOODISTRY HOME PAGE
// ============================================================

function Home() {
  const { bestSellingProducts, newArrivals } = useStore()
  const [heroSlides, setHeroSlides] = useState(defaultHeroSlides)
  const [heroIndex, setHeroIndex] = useState(0)
  const [heroPaused, setHeroPaused] = useState(false)
  const heroTouchStart = useRef(null)
  const [sectionImages, setSectionImages] = useState({
    brandStory: '',
    spaces: {}
  })

  useEffect(() => {
    let cancelled = false
    async function loadSectionImages() {
      try {
        const result = await apiRequest('/cms/section-images')
        const payload = result?.data?.sectionImages || result?.data?.data || result?.data || result?.sectionImages || result || {}
        const spaces = payload.spaces || payload.shopBySpace || payload.sectionImages?.spaces || {}
        if (!cancelled) {
          setSectionImages({
            brandStory: payload.brandStory || payload.brandStoryImage || payload.brandStoryUrl || '',
            spaces: Array.isArray(spaces)
              ? spaces.reduce((acc, item) => {
                  const image = item?.image || item?.imageUrl || item?.url || item?.src || ''
                  if (item?.name && image) acc[item.name] = image
                  return acc
                }, {})
              : (spaces && typeof spaces === 'object' ? spaces : {})
          })
        }
      } catch (error) {
        // The site keeps its built-in images if the CMS endpoint is not configured yet.
        console.warn('Section images CMS is not available yet:', error?.message || error)
      }
    }
    loadSectionImages()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    let cancelled = false
    async function loadHeroSlides() {
      try {
        const result = await cmsService.getHero()
        const slides =
          result?.data?.slides ||
          result?.slides ||
          result?.data?.data?.slides ||
          result?.data?.hero?.slides ||
          []
        const enabledSlides = Array.isArray(slides)
          ? slides.filter(slide => slide && slide.enabled !== false)
          : []
        const normalizedSlides = enabledSlides.map((slide, index) => {
          const fallback = defaultHeroSlides[index % defaultHeroSlides.length]
          const image = slide.image || slide.imageUrl || slide.desktopImage || slide.url || slide.src || fallback.image
          return {
            ...fallback,
            ...slide,
            image,
            fallbackImage: fallback.image,
            mediaType: slide.mediaType === 'video' ? 'video' : 'image',
            mobileImage: slide.mobileImage || slide.mobileImageUrl || image,
            alt: slide.alt || fallback.alt || 'Woodistry furniture collection'
          }
        })
        // Keep all three homepage hero slides available even if CMS has fewer entries.
        while (normalizedSlides.length < 3) {
          normalizedSlides.push(defaultHeroSlides[normalizedSlides.length])
        }
        if (!cancelled) setHeroSlides(normalizedSlides.length ? normalizedSlides : defaultHeroSlides)
      } catch (error) { console.error('Hero CMS load error:', error) }
    }
    loadHeroSlides()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (heroPaused || heroSlides.length < 2) return undefined
    const timer = window.setInterval(() => setHeroIndex(current => (current + 1) % heroSlides.length), 3000)
    return () => window.clearInterval(timer)
  }, [heroPaused, heroSlides.length])

  const goToHero = index => setHeroIndex(((index % heroSlides.length) + heroSlides.length) % heroSlides.length)

  useEffect(() => {
    const elements = document.querySelectorAll('[data-xaaj-reveal]')
    if (!elements.length || !('IntersectionObserver' in window)) return undefined
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('xaaj-revealed'); observer.unobserve(entry.target) }
    }), { threshold: 0.12 })
    elements.forEach(element => observer.observe(element))
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <Header />
      <main className="wood-home">
        <section className="wood-hero" onMouseEnter={() => setHeroPaused(true)} onMouseLeave={() => setHeroPaused(false)}
          onTouchStart={event => { heroTouchStart.current = event.touches[0]?.clientX ?? null }}
          onTouchEnd={event => { const start = heroTouchStart.current; const finish = event.changedTouches[0]?.clientX ?? null; if (start !== null && finish !== null && Math.abs(start - finish) > 45) goToHero(heroIndex + (start > finish ? 1 : -1)); heroTouchStart.current = null }}>
          <style>{`
            .wood-hero { isolation:isolate; }
            .wood-hero-media { position:absolute; inset:0; overflow:hidden; z-index:0; background:#777064; }
            .wood-hero-media .wood-hero-slide-image,
            .wood-hero-media .wood-hero-slide-video { position:absolute; inset:0; display:block; width:100%; height:100%; object-fit:cover; opacity:0; visibility:hidden; transition:opacity .65s ease, visibility .65s ease; }
            .wood-hero-media .wood-hero-slide-image.is-active,
            .wood-hero-media .wood-hero-slide-video.is-active { opacity:1; visibility:visible; }
            .wood-hero-shade { position:absolute; inset:0; z-index:1; pointer-events:none; }
            .wood-hero-copy { z-index:2; }
            .wood-hero-pagination { z-index:3; }
          `}</style>
          <div className="wood-hero-media">
            {heroSlides.map((slide, index) => {
              const active = index === heroIndex
              const fallbackImage = slide.fallbackImage || defaultHeroSlides[index % defaultHeroSlides.length].image
              if (slide.mediaType === 'video' && slide.image) {
                return <video key={`${slide.image}-${index}`} className={`wood-hero-slide-video${active ? ' is-active' : ''}`} src={slide.image} autoPlay muted loop playsInline onError={event => { event.currentTarget.style.display = 'none' }} />
              }
              return <img
                key={`${slide.image || fallbackImage}-${index}`}
                className={`wood-hero-slide-image${active ? ' is-active' : ''}`}
                src={slide.image || fallbackImage}
                alt={slide.alt || 'Woodistry furniture'}
                loading={index === 0 ? 'eager' : 'lazy'}
                onError={event => {
                  const image = event.currentTarget
                  if (fallbackImage && image.src !== new URL(fallbackImage, window.location.href).href) {
                    image.src = fallbackImage
                  } else {
                    image.style.display = 'none'
                  }
                }}
              />
            })}
          </div>
          <div className="wood-hero-shade" />
          <div className="wood-hero-copy">
            <span className="wood-kicker">Furniture that belongs</span>
            <h1>Crafted for<br/>Living.</h1>
            <p>Furniture shaped by natural materials,<br className="desktop-only"/> thoughtful design and timeless craft.</p>
            <Link className="wood-primary-button" to="/shop">Explore Collection <ArrowRight size={17}/></Link>
          </div>
          <div className="wood-hero-pagination">
            <div className="wood-hero-numbers">{heroSlides.map((slide, index) => <button key={index} className={heroIndex === index ? 'active' : ''} onClick={() => goToHero(index)} aria-label={`Go to slide ${index + 1}`}>{String(index + 1).padStart(2, '0')}</button>)}</div>
            <div className="wood-hero-arrows"><button onClick={() => goToHero(heroIndex - 1)} aria-label="Previous slide">←</button><button onClick={() => goToHero(heroIndex + 1)} aria-label="Next slide">→</button></div>
          </div>
        </section>

        <section className="wood-space-section" data-xaaj-reveal="up">
          <div className="wood-section-intro"><h2>Shop by<br/>Space</h2><p>Thoughtfully designed for<br/>every room in your home.</p><Link to="/shop">View All <ArrowRight size={14}/></Link></div>
          <div className="wood-space-grid">{woodistrySpaces.map(space => <Link className="wood-space-card" key={space.name} to={`/shop?category=${encodeURIComponent(space.name)}`}><WoodistryImage className="wood-space-card-image" src={sectionImages.spaces?.[space.name] || sectionImages.spaces?.[space.query] || sectionImages.spaces?.[space.name.replace(/\s+/g, '').toLowerCase()] || space.image} alt={`${space.name} furniture`} loading="lazy"/><span>{space.name} <ArrowRight size={16}/></span></Link>)}</div>
        </section>

        <section className="wood-products-section" data-xaaj-reveal="up">
          <div className="wood-products-intro"><h2>Best Sellers</h2><p>Timeless pieces, loved by<br/>designers and homemakers<br/>alike.</p><Link to="/shop">Shop All Best Sellers <ArrowRight size={15}/></Link></div>
          <div className="wood-products-content"><div className="wood-mobile-section-heading"><h2>Best Sellers</h2><Link to="/shop">View all <ArrowRight size={14}/></Link></div><div className="wood-product-grid">
            {(bestSellingProducts.length ? bestSellingProducts.slice(0, 5) : newArrivals.slice(0, 5)).length > 0
              ? (bestSellingProducts.length ? bestSellingProducts.slice(0, 5) : newArrivals.slice(0, 5)).map(product => <WoodistryBestSellerCard product={product} key={product.id || product._id || product.slug}/>)
              : woodistrySampleProducts.map(product => <article className="wood-demo-product" key={product.name}><Link to="/shop" className="wood-demo-image"><WoodistryImage className="wood-demo-product-image" src={product.image} alt={product.name} loading="lazy"/><span className="wood-demo-heart"><Heart size={19}/></span><span className="wood-demo-quick">Explore collection</span></Link><Link to="/shop" className="wood-demo-name">{product.name}</Link><p>{product.material}</p><strong>{product.price}</strong></article>)}
          </div></div>
        </section>

        <section className="wood-editorial wood-brand-story" data-xaaj-reveal="up">
          <style>{`
            .wood-brand-story { background:#eee7dc; color:#29231d; } .wood-auth-visual-image-shell { position:absolute; inset:0; width:100%; height:100%; } .wood-auth-visual-image { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
            .wood-space-card { position:relative; overflow:hidden; }
            .wood-space-card .wood-space-card-image { position:absolute; inset:0; width:100%; height:100%; min-height:100%; }
            .wood-space-card .wood-space-card-image .woodistry-image-content { transition:opacity .55s ease,transform .8s cubic-bezier(.2,.65,.3,1); }
            .wood-space-card:hover .wood-space-card-image .woodistry-image-content { transform:scale(1.04); }
            .wood-hero-image-shell { position:absolute; inset:0; width:100%; height:100%; opacity:0; transition:opacity .65s ease; } .wood-hero-image-shell.is-active { opacity:1; } .wood-hero-image { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; } .wood-hero-image-shell .woodistry-image-shimmer { z-index:0; } .woodistry-image-shell { position:relative; display:block; width:100%; height:100%; min-height:inherit; overflow:hidden; background:#e9e1d5; isolation:isolate; }
            .woodistry-image-content { position:absolute; inset:0; width:100%; height:100%; min-height:inherit; object-fit:cover; display:block; opacity:0; transition:opacity .55s ease, transform .8s cubic-bezier(.2,.65,.3,1); }
            .woodistry-image-content.is-visible { opacity:1; }
            .woodistry-image-shimmer { position:absolute; inset:0; z-index:1; display:flex; align-items:center; justify-content:center; overflow:hidden; background:linear-gradient(110deg,#e9e1d5 8%,#f5f0e8 18%,#e9e1d5 33%); background-size:220% 100%; animation:woodistry-shimmer 1.45s linear infinite; }
            .woodistry-shimmer-wordmark { color:#806b53; font-family:Georgia,"Times New Roman",serif; font-size:clamp(11px,1.2vw,15px); letter-spacing:.32em; font-weight:500; opacity:.72; }
            .woodistry-image-fallback { min-height:inherit; }
            @keyframes woodistry-shimmer { to { background-position-x:-220%; } }
            @media(prefers-reduced-motion:reduce) { .woodistry-image-shimmer { animation:none; } .woodistry-image-content { transition:none; } }
            .wood-brand-story .wood-editorial-copy { padding:clamp(34px,6vw,92px); }
            .wood-brand-story .wood-kicker { font-family:Gotham,"Gotham SSm",Arial,sans-serif; font-size:10px; font-weight:700; letter-spacing:.22em; text-transform:uppercase; color:#806344; }
            .wood-brand-story .wood-editorial-copy h2 { margin:18px 0 22px; font-family:Gotham,"Gotham SSm",Arial,sans-serif; font-size:clamp(34px,4.3vw,64px); font-weight:400; letter-spacing:-.055em; line-height:1.05; }
            .wood-brand-story .wood-editorial-copy h2 em { color:#967653; font-style:normal; }
            .wood-brand-story .wood-story-preview { max-width:520px; margin:0; color:#655d53; font-family:Gotham,"Gotham SSm",Arial,sans-serif; font-size:14px; line-height:1.95; }
            .wood-brand-story .wood-outline-button { margin-top:30px; display:inline-flex; align-items:center; gap:12px; min-height:48px; padding:0 20px; border:1px solid #b5a48e; color:#29231d; text-decoration:none; font-family:Gotham,"Gotham SSm",Arial,sans-serif; font-size:11px; letter-spacing:.04em; transition:background .25s ease,color .25s ease,border-color .25s ease; }
            .wood-brand-story .wood-outline-button:hover { background:#30251b; color:#fffaf3; border-color:#30251b; }
            .wood-brand-story .wood-editorial-image { min-height:100%; overflow:hidden; }
            .wood-brand-story .wood-editorial-image { min-height:460px; }
            .wood-brand-story .wood-editorial-image .woodistry-image-shell { min-height:460px; }
            .wood-brand-story .wood-editorial-image .woodistry-image-content { min-height:460px; }
            .wood-brand-story:hover .wood-editorial-image .woodistry-image-content { transform:scale(1.025); }
            @media(max-width:760px) {
              .wood-brand-story { grid-template-columns:1fr; }
              .wood-brand-story .wood-editorial-copy { padding:38px 24px 42px; }
              .wood-brand-story .wood-editorial-copy h2 { font-size:clamp(34px,9vw,48px); }
              .wood-brand-story .wood-story-preview { font-size:13px; line-height:1.85; }
              .wood-brand-story .wood-editorial-image { min-height:280px; max-height:360px; }
              .wood-brand-story .wood-editorial-image .woodistry-image-shell,
              .wood-brand-story .wood-editorial-image .woodistry-image-content { min-height:280px; max-height:360px; }
            }
          `}</style>
          <div className="wood-editorial-copy">
            <span className="wood-kicker">The WOODISTRY story</span>
            <h2>A home is more<br/>than a place.<br/><em>It is a feeling.</em></h2>
            <p className="wood-story-preview">
              At WOODISTRY, we believe the spaces we live in shape the way we feel and the memories we make.
              Our story begins with a simple idea: furniture should do more than fill a room — it should bring
              warmth, balance and a sense of belonging. We bring together natural character, thoughtful details
              and timeless silhouettes to create pieces that feel at home in everyday life. From slow mornings
              to long conversations around the table, every piece should leave room for life to happen.
              We believe good design is not just how something looks, but how it lives with you.
            </p>
            <Link className="wood-outline-button" to="/about">Read our story <ArrowRight size={15}/></Link>
          </div>
          <div className="wood-editorial-image">
            <WoodistryImage
              src={sectionImages.brandStory || '/woodistry-images/brand-story.png'}
              alt="Warm contemporary interior with natural materials and considered furniture"
              loading="lazy"
            />
          </div>
        </section>

        <section className="wood-service-strip"><div><Gem size={23}/><span><strong>Thoughtful Materials</strong><small>Made with care</small></span></div><div><Truck size={23}/><span><strong>Reliable Delivery</strong><small>From us to your home</small></span></div><div><Package size={23}/><span><strong>Considered Packaging</strong><small>Handled with care</small></span></div><div><ShieldCheck size={23}/><span><strong>Secure Checkout</strong><small>Shop with confidence</small></span></div></section>
        <BlogSection />
        <Newsletter />
      </main>
      <Footer />
    </>
  )
}


// ============================================================
// NEWSLETTER
// ============================================================

function Newsletter() {

  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [popup, setPopup] = useState(null)

  const closePopup = () => {
    setPopup(null)
  }

  const handleSubmit = async event => {
    event.preventDefault()

    const cleanEmail = email.trim().toLowerCase()

    if (!cleanEmail) {
      setPopup({
        type: 'error',
        title: 'Email required',
        message: 'Please enter your email address to subscribe.'
      })
      return
    }

    setLoading(true)

    try {
      const result = await newsletterService.subscribe(cleanEmail)

      setEmail('')

      setPopup({
        type: 'success',
        title: 'Welcome to WOODISTRY',
        message:
          result?.message ||
          'You’re on the list. We’ll share considered collections, design notes and inspiration for a more thoughtful home.'
      })

    } catch (error) {

      const code = error?.data?.code

      if (
        code === 'ALREADY_SUBSCRIBED' ||
        error?.status === 409
      ) {
        setPopup({
          type: 'already',
          title: 'You’re already on the list',
          message:
            'This email is already subscribed to WOODISTRY notes. We’re glad to have you with us.'
        })
      } else {
        setPopup({
          type: 'error',
          title: 'Something went wrong',
          message:
            error?.data?.message ||
            error?.message ||
            'We could not complete your subscription right now. Please try again.'
        })
      }

    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <section className="newsletter" data-xaaj-reveal="up">

        <span className="eyebrow">
          A little note from us
        </span>

        <h2>
          Come, stay awhile.
        </h2>

        <p>
          Thoughtful collections, quiet inspiration
          and little stories from XAAJ — shared with care,
          never too often.
        </p>

        <form onSubmit={handleSubmit}>

          <input
            type="email"
            value={email}
            onChange={event => setEmail(event.target.value)}
            required
            autoComplete="email"
            placeholder="Your email address"
            disabled={loading}
            aria-label="Your email address"
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'wait' : 'pointer'
            }}
          >
            {loading ? 'Subscribing...' : 'Subscribe'}

            {!loading && (
              <ArrowRight size={14} />
            )}
          </button>

        </form>

      </section>


      {/* ========================================================
          NEWSLETTER POPUP
      ======================================================== */}

      {popup && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="xaaj-newsletter-popup-title"
          onClick={event => {
            if (event.target === event.currentTarget) {
              closePopup()
            }
          }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            background: 'rgba(35, 32, 28, 0.48)',
            backdropFilter: 'blur(8px)'
          }}
        >

          <div
            style={{
              position: 'relative',
              width: 'min(100%, 480px)',
              padding: '42px 34px 34px',
              textAlign: 'center',
              background: '#fffdf9',
              border: '1px solid #e8e0d5',
              borderRadius: '24px',
              boxShadow: '0 30px 80px rgba(41,40,37,.22)'
            }}
          >

            <button
              type="button"
              onClick={closePopup}
              aria-label="Close newsletter popup"
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                width: '36px',
                height: '36px',
                display: 'grid',
                placeItems: 'center',
                padding: 0,
                border: '1px solid #e5ddd2',
                borderRadius: '50%',
                background: '#fff',
                color: '#292824',
                cursor: 'pointer'
              }}
            >
              <X size={17} strokeWidth={1.5} />
            </button>


            <div
              style={{
                width: '54px',
                height: '54px',
                margin: '0 auto 20px',
                display: 'grid',
                placeItems: 'center',
                borderRadius: '50%',
                background:
                  popup.type === 'error'
                    ? '#f6ebe6'
                    : '#f5eee4',
                color: '#b84d32',
                fontFamily: 'Georgia, serif',
                fontSize: '23px'
              }}
            >
              {popup.type === 'error' ? '!' : '♡'}
            </div>


            <span
              style={{
                display: 'block',
                marginBottom: '10px',
                fontSize: '11px',
                letterSpacing: '3px',
                textTransform: 'uppercase',
                color: '#b84d32',
                fontWeight: 600
              }}
            >
              XAAJ
            </span>


            <h3
              id="xaaj-newsletter-popup-title"
              style={{
                margin: '0 0 14px',
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontSize: '30px',
                lineHeight: 1.2,
                fontWeight: 400,
                color: '#292824'
              }}
            >
              {popup.title}
            </h3>


            <p
              style={{
                maxWidth: '390px',
                margin: '0 auto',
                fontSize: '15px',
                lineHeight: 1.75,
                color: '#706d67'
              }}
            >
              {popup.message}
            </p>


            <div
              style={{
                width: '54px',
                height: '1px',
                margin: '25px auto 24px',
                background: '#d9d0c5'
              }}
            />


            <button
              type="button"
              onClick={closePopup}
              style={{
                minWidth: '150px',
                padding: '13px 24px',
                border: '1px solid #292824',
                borderRadius: '999px',
                background: '#292824',
                color: '#fff',
                fontSize: '13px',
                letterSpacing: '.5px',
                cursor: 'pointer'
              }}
            >
              Continue shopping
            </button>

          </div>

        </div>
      )}
    </>
  )
}


// ============================================================
// CONTACT FORM
// ============================================================

function ContactForm() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  })

  const [loading, setLoading] = useState(false)
  const [popup, setPopup] = useState(null)

  const handleChange = event => {
    const { name, value } = event.target
    setForm(current => ({
      ...current,
      [name]: value
    }))
  }

  const handleSubmit = async event => {
    event.preventDefault()

    const name = form.name.trim()
    const email = form.email.trim().toLowerCase()
    const phone = form.phone.trim()
    const message = form.message.trim()

    if (!name || !email || !message) {
      setPopup({
        type: 'error',
        title: 'A few details are missing',
        message: 'Please enter your name, email address and message.'
      })
      return
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setPopup({
        type: 'error',
        title: 'Invalid email address',
        message: 'Please enter a valid email address and try again.'
      })
      return
    }

    setLoading(true)

    try {
      const result = await contactService.send({
        name,
        email,
        phone,
        message
      })

      setForm({
        name: '',
        email: '',
        phone: '',
        message: ''
      })

      setPopup({
        type: 'success',
        title: 'Message received',
        message:
          result?.message ||
          'Thank you for reaching out to XAAJ. Our team will get back to you shortly.'
      })
    } catch (error) {
      setPopup({
        type: 'error',
        title: 'Something went wrong',
        message:
          error?.data?.message ||
          error?.message ||
          'We could not send your message right now. Please try again or contact us directly.'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div
        className="xaaj-contact-layout"
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.05fr) minmax(320px, .75fr)',
          gap: '34px',
          marginTop: '54px',
          alignItems: 'stretch'
        }}
      >
        <form
          onSubmit={handleSubmit}
          style={{
            padding: '34px',
            border: '1px solid #e7dfd4',
            borderRadius: '24px',
            background: '#fffdf9',
            boxShadow: '0 18px 55px rgba(41,40,37,.06)'
          }}
        >
          <div style={{ marginBottom: '26px' }}>
            <span className="eyebrow">Send a message</span>
            <h2
              style={{
                margin: '9px 0 0',
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontSize: '30px',
                lineHeight: 1.2,
                fontWeight: 400
              }}
            >
              Tell us how we can help.
            </h2>
          </div>

          <div
            className="xaaj-contact-fields"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: '18px'
            }}
          >
            <label style={{ display: 'grid', gap: '8px' }}>
              <span className="eyebrow">Name *</span>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                maxLength={80}
                autoComplete="name"
                placeholder="Your name"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '14px 15px',
                  border: '1px solid #ddd4c8',
                  borderRadius: '12px',
                  background: '#fff',
                  color: '#292824',
                  outline: 'none'
                }}
              />
            </label>

            <label style={{ display: 'grid', gap: '8px' }}>
              <span className="eyebrow">Email *</span>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                maxLength={254}
                autoComplete="email"
                placeholder="you@example.com"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '14px 15px',
                  border: '1px solid #ddd4c8',
                  borderRadius: '12px',
                  background: '#fff',
                  color: '#292824',
                  outline: 'none'
                }}
              />
            </label>

            <label
              style={{
                display: 'grid',
                gap: '8px',
                gridColumn: '1 / -1'
              }}
            >
              <span className="eyebrow">Phone</span>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                maxLength={15}
                autoComplete="tel"
                placeholder="Your phone number"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '14px 15px',
                  border: '1px solid #ddd4c8',
                  borderRadius: '12px',
                  background: '#fff',
                  color: '#292824',
                  outline: 'none'
                }}
              />
            </label>

            <label
              style={{
                display: 'grid',
                gap: '8px',
                gridColumn: '1 / -1'
              }}
            >
              <span className="eyebrow">Message *</span>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                required
                maxLength={2000}
                rows={7}
                placeholder="Tell us what you need help with..."
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '14px 15px',
                  border: '1px solid #ddd4c8',
                  borderRadius: '12px',
                  background: '#fff',
                  color: '#292824',
                  outline: 'none',
                  resize: 'vertical',
                  minHeight: '150px',
                  fontFamily: 'inherit'
                }}
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '24px',
              width: '100%',
              minHeight: '50px',
              border: '1px solid #292824',
              borderRadius: '999px',
              background: '#292824',
              color: '#fff',
              fontSize: '13px',
              letterSpacing: '.4px',
              cursor: loading ? 'wait' : 'pointer',
              opacity: loading ? .7 : 1
            }}
          >
            {loading ? 'Sending message...' : 'Send message'}
          </button>
        </form>

        <div
          style={{
            padding: '34px',
            border: '1px solid #e7dfd4',
            borderRadius: '24px',
            background: '#f8f4ed',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <span className="eyebrow">XAAJ Care</span>
            <h2
              style={{
                margin: '12px 0 14px',
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontSize: '30px',
                lineHeight: 1.2,
                fontWeight: 400
              }}
            >
              We're here for you.
            </h2>
            <p
              style={{
                margin: 0,
                fontSize: '15px',
                lineHeight: 1.8,
                color: '#706d67'
              }}
            >
              Need help with an order, delivery, product or anything else?
              Reach out directly and our team will be happy to help.
            </p>
          </div>

          <div style={{ display: 'grid', gap: '24px', marginTop: '42px' }}>
            <div>
              <span className="eyebrow">Phone / WhatsApp</span>
              <p style={{ margin: '7px 0 0' }}>
                <a href="tel:+919899446117">+91-9899446117</a>
              </p>
            </div>

            <div>
              <span className="eyebrow">Email</span>
              <p style={{ margin: '7px 0 0' }}>
                <a href="mailto:customercare@xaaj.in">
                  customercare@xaaj.in
                </a>
              </p>
            </div>

            <div>
              <span className="eyebrow">Business address</span>
              <p style={{ margin: '7px 0 0', lineHeight: 1.7 }}>
                G6/4C DLF Garden City, Sector 92, Gurugram 122505
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="xaaj-contact-response-note">
        We usually respond within 1–2 working days. For urgent order support,
        you can reach us directly by phone or WhatsApp.
      </div>

      {popup && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="xaaj-contact-popup-title"
          onClick={event => {
            if (event.target === event.currentTarget) {
              setPopup(null)
            }
          }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            background: 'rgba(35,32,28,.48)',
            backdropFilter: 'blur(8px)'
          }}
        >
          <div
            style={{
              position: 'relative',
              width: 'min(100%, 480px)',
              padding: '42px 34px 34px',
              textAlign: 'center',
              background: '#fffdf9',
              border: '1px solid #e8e0d5',
              borderRadius: '24px',
              boxShadow: '0 30px 80px rgba(41,40,37,.22)'
            }}
          >
            <button
              type="button"
              onClick={() => setPopup(null)}
              aria-label="Close contact popup"
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                width: '36px',
                height: '36px',
                display: 'grid',
                placeItems: 'center',
                padding: 0,
                border: '1px solid #e5ddd2',
                borderRadius: '50%',
                background: '#fff',
                color: '#292824',
                cursor: 'pointer'
              }}
            >
              <X size={17} strokeWidth={1.5} />
            </button>

            <div
              style={{
                width: '54px',
                height: '54px',
                margin: '0 auto 20px',
                display: 'grid',
                placeItems: 'center',
                borderRadius: '50%',
                background: popup.type === 'error' ? '#f6ebe6' : '#f5eee4',
                color: '#b84d32',
                fontFamily: 'Georgia, serif',
                fontSize: '23px'
              }}
            >
              {popup.type === 'error' ? '!' : '♡'}
            </div>

            <span
              style={{
                display: 'block',
                marginBottom: '10px',
                fontSize: '11px',
                letterSpacing: '3px',
                textTransform: 'uppercase',
                color: '#b84d32',
                fontWeight: 600
              }}
            >
              XAAJ
            </span>

            <h3
              id="xaaj-contact-popup-title"
              style={{
                margin: '0 0 14px',
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontSize: '30px',
                lineHeight: 1.2,
                fontWeight: 400,
                color: '#292824'
              }}
            >
              {popup.title}
            </h3>

            <p
              style={{
                maxWidth: '390px',
                margin: '0 auto',
                fontSize: '15px',
                lineHeight: 1.75,
                color: '#706d67'
              }}
            >
              {popup.message}
            </p>

            <div
              style={{
                width: '54px',
                height: '1px',
                margin: '25px auto 24px',
                background: '#d9d0c5'
              }}
            />

            <button
              type="button"
              onClick={() => setPopup(null)}
              style={{
                minWidth: '150px',
                padding: '13px 24px',
                border: '1px solid #292824',
                borderRadius: '999px',
                background: '#292824',
                color: '#fff',
                fontSize: '13px',
                letterSpacing: '.5px',
                cursor: 'pointer'
              }}
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </>
  )
}


// ============================================================
// FOOTER — WOODISTRY WALNUT EDITION
// Footer-only redesign. Existing routes and interactions are preserved.
// ============================================================

function Footer() {
  return (
    <>
      <style>{`
        .wood-footer {
          --footer-bg: #211811;
          --footer-panel: #2b2017;
          --footer-text: #f4eee5;
          --footer-muted: #bdb0a0;
          --footer-accent: #b78a5c;
          position: relative;
          overflow: hidden;
          background: var(--footer-bg);
          color: var(--footer-text);
          padding: 76px max(6%, calc((100% - 1440px) / 2)) 24px;
          isolation: isolate;
        }
        .wood-footer::before {
          content: '';
          position: absolute;
          z-index: -1;
          top: -180px;
          right: -100px;
          width: 480px;
          height: 480px;
          border: 1px solid rgba(183,138,92,.12);
          border-radius: 50%;
          box-shadow: 0 0 0 42px rgba(183,138,92,.025), 0 0 0 84px rgba(183,138,92,.02);
          pointer-events: none;
        }
        .wood-footer-main {
          display: grid;
          grid-template-columns: minmax(230px, 1.45fr) repeat(3, minmax(125px, .75fr));
          gap: clamp(28px, 5vw, 82px);
          padding-bottom: 62px;
        }
        .wood-footer-brand { display: inline-flex; color: inherit; text-decoration: none; align-items: center; }
        .wood-footer-logo { display: block; width: min(225px, 100%); height: 62px; object-fit: contain; object-position: left center; filter: brightness(0) invert(1); }
        .wood-footer-fallback { display: block; font: 500 25px/1.2 var(--wood-serif, Georgia, serif); letter-spacing: .13em; }
        .wood-footer-tagline { max-width: 310px; margin: 20px 0 26px; color: var(--footer-muted); font: 400 15px/1.85 var(--wood-serif, Georgia, serif); }
        .wood-footer-brand-note { display: flex; align-items: center; gap: 10px; margin: 0 0 24px; color: #d4c2ac; font-size: 9px; font-weight: 600; letter-spacing: .2em; text-transform: uppercase; }
        .wood-footer-brand-note::before { content: ''; width: 28px; height: 1px; background: var(--footer-accent); }
        .wood-footer-kicker { display: block; margin: 8px 0 23px; color: #f4eee5; font-size: 10px; font-weight: 700; letter-spacing: .2em; text-transform: uppercase; }
        .wood-footer-column { display: flex; flex-direction: column; align-items: flex-start; gap: 15px; }
        .wood-footer-column a { position: relative; color: var(--footer-muted); text-decoration: none; font-size: 12px; line-height: 1.5; transition: color .22s ease, transform .22s ease; }
        .wood-footer-column a:hover { color: #fffaf3; transform: translateX(3px); }
        .wood-footer-social { display: flex; align-items: center; gap: 10px; margin-top: 4px; }
        .wood-footer-social a { display: grid; place-items: center; width: 42px; height: 42px; border: 1px solid rgba(221,199,173,.28); border-radius: 50%; color: #f4eee5; transition: background .22s ease, border-color .22s ease, transform .22s ease; }
        .wood-footer-social a:hover { background: #493323; border-color: var(--footer-accent); transform: translateY(-2px); }
        .wood-footer-bottom { display: flex; align-items: center; justify-content: space-between; gap: 20px; border-top: 1px solid rgba(221,199,173,.2); padding-top: 22px; color: #a99b8b; font-size: 10px; letter-spacing: .035em; }
        .wood-footer-legal { display: flex; flex-wrap: wrap; gap: 22px; }
        .wood-footer-legal a { color: inherit; text-decoration: none; transition: color .2s ease; }
        .wood-footer-legal a:hover { color: #fffaf3; }
        @media (max-width: 900px) {
          .wood-footer { padding: 58px 5% 22px; }
          .wood-footer-main { grid-template-columns: minmax(200px, 1.2fr) repeat(2, minmax(120px, .8fr)); gap: 38px 30px; }
          .wood-footer-brand-block { grid-column: 1 / -1; }
          .wood-footer-tagline { max-width: 440px; }
        }
        @media (max-width: 560px) {
          .wood-footer { padding: 44px 22px 20px; }
          .wood-footer-main { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 34px 22px; padding-bottom: 36px; }
          .wood-footer-brand-block { grid-column: 1 / -1; }
          .wood-footer-logo { width: 190px; height: 52px; }
          .wood-footer-tagline { max-width: 330px; margin: 14px 0 20px; font-size: 14px; }
          .wood-footer-brand-note { margin-bottom: 20px; font-size: 8px; }
          .wood-footer-kicker { margin: 0 0 17px; font-size: 9px; }
          .wood-footer-column { gap: 13px; }
          .wood-footer-column a { font-size: 12px; }
          .wood-footer-social a { width: 40px; height: 40px; }
          .wood-footer-bottom { align-items: flex-start; flex-direction: column; gap: 15px; line-height: 1.7; }
          .wood-footer-legal { gap: 17px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .wood-footer-column a, .wood-footer-social a, .wood-footer-legal a { transition: none; }
        }
      `}</style>
      <footer className="wood-footer">
        <div className="wood-footer-main">
          <div className="wood-footer-brand-block">
            <Link to="/" className="wood-footer-brand" aria-label="WOODISTRY home">
              <img className="wood-footer-logo" src={logoUrl} alt="WOODISTRY"
                onError={event => { event.currentTarget.style.display = 'none'; const fallback = event.currentTarget.nextElementSibling; if (fallback) fallback.style.display = 'block' }} />
              <span className="wood-footer-fallback" style={{ display: 'none' }}>WOODISTRY</span>
            </Link>
            <p className="wood-footer-brand-note">Considered furniture for living</p>
            <p className="wood-footer-tagline">Timeless furniture for a more considered home. Thoughtfully designed, beautifully made, and built for living.</p>
            <div className="wood-footer-social" aria-label="Follow Woodistry">
              <a href="https://www.instagram.com/" target="_blank" rel="noreferrer" aria-label="Instagram" title="Instagram"><FaInstagram size={18} /></a>
              <a href="mailto:customercare@xaaj.in" aria-label="Email Woodistry" title="Email"><Mail size={18} /></a>
              <a href="https://wa.me/919899446117" target="_blank" rel="noreferrer" aria-label="WhatsApp" title="WhatsApp"><FaWhatsapp size={18} /></a>
            </div>
          </div>
          <nav className="wood-footer-column" aria-label="Explore">
            <span className="wood-footer-kicker">Explore</span>
            <Link to="/shop">Shop all</Link>
            <Link to="/shop?filter=new">New arrivals</Link>
            <Link to="/shop?category=Living%20Room">Living room</Link>
            <Link to="/shop?category=Dining">Dining</Link>
            <Link to="/shop?category=Bedroom">Bedroom</Link>
            <Link to="/about">Our story</Link>
          </nav>
          <nav className="wood-footer-column" aria-label="Customer care">
            <span className="wood-footer-kicker">Customer care</span>
            <Link to="/contact">Contact us</Link>
            <Link to="/faq">FAQs</Link>
            <Link to="/shipping">Shipping &amp; delivery</Link>
            <Link to="/returns">Returns &amp; refunds</Link>
            <Link to="/cancellation">Cancellation policy</Link>
          </nav>
          <nav className="wood-footer-column" aria-label="Company and legal">
            <span className="wood-footer-kicker">Company</span>
            <Link to="/about">About Woodistry</Link>
            <Link to="/journal">Journal</Link>
            <Link to="/privacy">Privacy policy</Link>
            <Link to="/terms">Terms &amp; conditions</Link>
          </nav>
        </div>
        <div className="wood-footer-bottom">
          <span>© {new Date().getFullYear()} WOODISTRY. Crafted for living.</span>
          <div className="wood-footer-legal">
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
            <Link to="/shipping">Shipping</Link>
            <Link to="/returns">Returns</Link>
          </div>
        </div>
      </footer>
    </>
  )
}


// CATEGORY / INTERNAL SHOP CARD — matches the compact editorial card shown in the reference.
function ShopProductCard({ product }) {
  const { add, wish, toggleWish } = useStore()
  const [added, setAdded] = useState(false)
  const productId = product.id || product._id
  const liked = wish.includes(productId)
  const image = product.image || product.images?.[0] || ''
  const oldPrice = Number(product.old || product.compareAtPrice || 0)
  const price = Number(product.price || 0)

  const handleAdd = event => {
    event.preventDefault()
    event.stopPropagation()
    if (isAdminPreviewMode()) {
      window.alert('Admin Preview Mode: adding products to cart is disabled.')
      return
    }
    if (Number(product.stock ?? 0) <= 0) return
    add(product)
    setAdded(true)
    window.setTimeout(() => setAdded(false), 900)
    window.dispatchEvent(new CustomEvent('xaaj:cart-added'))
  }

  return (
    <article className="wood-shop-product-card">
      <div className="wood-shop-product-media">
        <Link to={`/product/${product.slug}`} className="wood-shop-product-image-link" aria-label={`View ${product.name}`}>
          <img src={image} alt={product.name} loading="lazy" />
          {product.images?.[1] && <img className="wood-shop-product-hover-image" src={product.images[1]} alt="" aria-hidden="true" loading="lazy" />}
        </Link>
        {(product.tag || product.isNew) && <span className="wood-shop-product-tag">{product.tag || 'NEW'}</span>}
        <button
          type="button"
          className={`wood-shop-product-heart${liked ? ' is-liked' : ''}`}
          onClick={event => { event.preventDefault(); event.stopPropagation(); if (productId) toggleWish(productId) }}
          aria-label={liked ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          aria-pressed={liked}
        >
          <Heart size={18} strokeWidth={1.5} fill={liked ? 'currentColor' : 'none'} />
        </button>
        <button
          type="button"
          className={`wood-shop-product-add${added ? ' is-added' : ''}`}
          onClick={handleAdd}
          disabled={Number(product.stock ?? 0) <= 0}
          aria-label={Number(product.stock ?? 0) <= 0 ? 'Out of stock' : `Add ${product.name} to cart`}
        >
          {Number(product.stock ?? 0) <= 0 ? <span>—</span> : added ? <Check size={17} /> : <Plus size={17} />}
        </button>
      </div>
      <div className="wood-shop-product-copy">
        {product.category && <span className="wood-shop-product-category">{product.category}</span>}
        <Link to={`/product/${product.slug}`} className="wood-shop-product-name">{product.name}</Link>
        <div className="wood-shop-product-price">
          <strong>{money(price)}</strong>
          {oldPrice > price && <del>{money(oldPrice)}</del>}
        </div>
      </div>
    </article>
  )
}

const WOODISTRY_SHOP_CARD_CSS = `
.wood-shop-page .wood-shop-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  column-gap: 20px;
  row-gap: 42px;
  align-items: start;
}
.wood-shop-page .wood-shop-product-card { min-width: 0; color: #292823; }
.wood-shop-page .wood-shop-product-media {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 5;
  overflow: hidden;
  background: #e9e4dc;
}
.wood-shop-page .wood-shop-product-image-link { position: absolute; inset: 0; display: block; overflow: hidden; }
.wood-shop-page .wood-shop-product-image-link img {
  display: block; width: 100%; height: 100%; object-fit: cover;
  transition: opacity .35s ease, transform .65s cubic-bezier(.2,.7,.2,1);
}
.wood-shop-page .wood-shop-product-image-link .wood-shop-product-hover-image {
  position: absolute; inset: 0; opacity: 0;
}
.wood-shop-page .wood-shop-product-media:hover .wood-shop-product-image-link > img:first-child { transform: scale(1.035); }
.wood-shop-page .wood-shop-product-media:hover .wood-shop-product-image-link .wood-shop-product-hover-image { opacity: 1; }
.wood-shop-page .wood-shop-product-tag {
  position: absolute; z-index: 2; top: 10px; left: 10px; padding: 7px 9px;
  background: #fbf9f5; color: #39342d; font: 600 8px/1 var(--wood-sans);
  letter-spacing: .12em; text-transform: uppercase;
}
.wood-shop-page .wood-shop-product-heart {
  position: absolute; z-index: 3; top: 10px; right: 10px; display: grid; place-items: center;
  width: 34px; height: 34px; padding: 0; border: 0; border-radius: 50%;
  color: #302d27; background: rgba(251,249,245,.94); cursor: pointer;
  transition: transform .2s ease, background .2s ease, color .2s ease;
}
.wood-shop-page .wood-shop-product-heart:hover { transform: scale(1.06); }
.wood-shop-page .wood-shop-product-heart.is-liked { color: #8b442d; }
.wood-shop-page .wood-shop-product-add {
  position: absolute; z-index: 3; right: 10px; bottom: 10px; display: grid; place-items: center;
  width: 38px; height: 38px; padding: 0; border: 0; background: rgba(251,249,245,.97);
  color: #292823; cursor: pointer; transition: background .2s ease, color .2s ease;
}
.wood-shop-page .wood-shop-product-add:hover, .wood-shop-page .wood-shop-product-add.is-added { background: #29372e; color: #fffaf3; }
.wood-shop-page .wood-shop-product-add:disabled { cursor: not-allowed; opacity: .55; }
.wood-shop-page .wood-shop-product-copy { padding-top: 12px; display: grid; gap: 6px; }
.wood-shop-page .wood-shop-product-category {
  color: #92897d; font: 500 8px/1.3 var(--wood-sans); letter-spacing: .15em; text-transform: uppercase;
}
.wood-shop-page .wood-shop-product-name {
  display: block; width: fit-content; max-width: 100%; overflow: hidden; text-overflow: ellipsis;
  color: #292823; text-decoration: none; white-space: nowrap;
  font: 400 14px/1.45 var(--wood-serif, Georgia, serif);
}
.wood-shop-page .wood-shop-product-name:hover { text-decoration: underline; text-underline-offset: 3px; }
.wood-shop-page .wood-shop-product-price { display: flex; flex-wrap: wrap; align-items: baseline; gap: 9px; margin-top: 1px; }
.wood-shop-page .wood-shop-product-price strong { color: #292823; font: 500 12px/1.4 var(--wood-sans); }
.wood-shop-page .wood-shop-product-price del { color: #999186; font: 400 10px/1.4 var(--wood-sans); }
@media (max-width: 900px) {
  .wood-shop-page .wood-shop-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 30px 15px; }
}
@media (max-width: 600px) {
  .wood-shop-page .wood-shop-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 26px 11px; }
  .wood-shop-page .wood-shop-product-tag { top: 7px; left: 7px; padding: 6px 7px; font-size: 7px; }
  .wood-shop-page .wood-shop-product-heart { top: 7px; right: 7px; width: 31px; height: 31px; }
  .wood-shop-page .wood-shop-product-add { right: 7px; bottom: 7px; width: 34px; height: 34px; }
  .wood-shop-page .wood-shop-product-copy { padding-top: 9px; gap: 5px; }
  .wood-shop-page .wood-shop-product-name { font-size: 12px; }
  .wood-shop-page .wood-shop-product-price strong { font-size: 11px; }
}
`

// SHOP PAGE
// ============================================================

function Shop() {
  const { products: liveProducts } = useStore()
  const location = useLocation()
  const query = new URLSearchParams(location.search)
  const [sort, setSort] = useState('featured')
  const category = query.get('category') || ''
  const search = query.get('search') || ''

  const shopCategories = [
    { label: 'All Furniture', value: '' },
    { label: 'Living Room', value: 'Living Room' },
    { label: 'Sofas & Chairs', value: 'Sofas & Chairs' },
    { label: 'Dining', value: 'Dining' },
    { label: 'Bedroom', value: 'Bedroom' },
    { label: 'Tables', value: 'Tables' },
    { label: 'Storage', value: 'Storage' }
  ]

  const normalized = value => String(value || '').trim().toLowerCase()
  const categoryMatches = (product, selected) => {
    if (!selected) return true
    const target = normalized(selected)
    const fields = [
      product.category, product.room, product.collection,
      product.subcategory, product.type, product.name
    ].map(normalized).filter(Boolean)
    if (fields.some(value => value.includes(target))) return true

    const aliases = {
      'living room': ['living', 'sofa', 'chair', 'coffee table', 'sideboard', 'lounge'],
      'sofas & chairs': ['sofa', 'chair', 'armchair', 'lounge'],
      'dining': ['dining', 'dining table', 'dining chair'],
      'bedroom': ['bedroom', 'bed', 'nightstand', 'dresser'],
      'tables': ['table', 'desk', 'coffee table', 'side table'],
      'storage': ['storage', 'cabinet', 'sideboard', 'shelf', 'bookcase']
    }
    return (aliases[target] || []).some(alias =>
      fields.some(value => value.includes(alias))
    )
  }

  let list = (liveProducts || []).filter(product =>
    categoryMatches(product, category) &&
    (!search || normalized(product.name).includes(normalized(search)) ||
      normalized(product.description || product.desc).includes(normalized(search)))
  )

  if (sort === 'low') list = [...list].sort((a, b) => Number(a.price || 0) - Number(b.price || 0))
  if (sort === 'high') list = [...list].sort((a, b) => Number(b.price || 0) - Number(a.price || 0))

  const heading = category || (search ? `Search: ${search}` : 'Furniture for considered living')

  return (
    <>
      <style>{WOODISTRY_SHOP_CARD_CSS}</style>
      <Header />
      <main className="page wood-shop-page">
        <div className="wrap">
          <div className="breadcrumbs">
            <Link to="/">Home</Link><span>/</span><span>Shop</span>
            {category && <><span>/</span><span>{category}</span></>}
          </div>

          <div className="shop-title wood-shop-title">
            <div>
              <span className="eyebrow">THE WOODISTRY COLLECTION</span>
              <h1>{heading}</h1>
              <p>Thoughtfully crafted furniture. Natural materials. Pieces made to feel at home.</p>
            </div>
            <label className="wood-shop-sort-label">
              <span className="sr-only">Sort products</span>
              <select value={sort} onChange={event => setSort(event.target.value)} aria-label="Sort products">
                <option value="featured">Sort: Featured</option>
                <option value="low">Price: Low to High</option>
                <option value="high">Price: High to Low</option>
              </select>
            </label>
          </div>

          <nav className="filter-row wood-shop-filters" aria-label="Furniture categories">
            {shopCategories.map(item => {
              const active = item.value
                ? normalized(category) === normalized(item.value)
                : !category
              return (
                <Link
                  className={active ? 'active' : ''}
                  to={item.value ? `/shop?category=${encodeURIComponent(item.value)}` : '/shop'}
                  key={item.label}
                  aria-current={active ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className="wood-shop-result-count">
            {list.length} {list.length === 1 ? 'piece' : 'pieces'}
            {category ? ` in ${category}` : ' in the collection'}
          </div>

          <div id="shop-products" className="product-grid shop-grid wood-shop-grid" style={{ scrollMarginTop: '120px' }}>
            {list.length ? list.map(product => (
              <ShopProductCard product={product} key={product.id || product._id || product.slug} />
            )) : (
              <div className="wood-shop-empty">
                <span className="eyebrow">A little room to explore</span>
                <h2>{search ? 'No pieces found' : 'No furniture in this collection yet'}</h2>
                <p>{search
                  ? 'Try another search term or browse the full Woodistry collection.'
                  : 'This collection is being curated. Explore all furniture to discover the pieces currently available.'}</p>
                <Link className="wood-shop-reset" to="/shop">Explore all furniture <ArrowRight size={15} /></Link>
              </div>
            )}
          </div>
        </div>
      </main>
      <Newsletter />
      <Footer />
    </>
  )
}


// ============================================================
// PRODUCT DETAILS PAGE
// ============================================================

function Product() {

  const {
    add,
    products: liveProducts
  } = useStore()
  const { pathname } = useLocation()

  // This app uses manual pathname routing (not <Route> components),
  // so useParams() cannot read /product/:id here.
  const slug = decodeURIComponent(
    pathname.split('/product/')[1] || ''
  )

  const [product, setProduct] = useState(null)
  const [loadingProduct, setLoadingProduct] = useState(true)
  const [selectedImage, setSelectedImage] = useState('')
  const [qty, setQty] = useState(1)
  const [detailCartPulse, setDetailCartPulse] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function loadProduct() {
      if (!slug) {
        setProduct(null)
        setLoadingProduct(false)
        return
      }

      setLoadingProduct(true)

      try {
        // Always fetch the exact product by slug. This also works
        // when the user opens/refreses the product URL directly.
        const result = await productService.get(slug)
        const raw = result?.data

        if (cancelled) return

        if (!raw) {
          setProduct(null)
          return
        }

        const productImages = Array.isArray(raw.images)
          ? raw.images.filter(Boolean)
          : []

        setProduct({
          ...raw,
          id: raw._id,
          image: productImages[0] || '',
          images: productImages,
          old: raw.mrp ?? raw.compareAtPrice ?? null,
          tag: raw.tags?.[0] || 'New',
          rating: Number(raw.rating || 0),
          reviews: Number(raw.reviewCount || 0),
          reviewCount: Number(raw.reviewCount || 0)
        })

        setSelectedImage(productImages[0] || '')
      } catch (error) {
        if (!cancelled) {
          console.error('Product load error:', error)
          setProduct(null)
        }
      } finally {
        if (!cancelled) setLoadingProduct(false)
      }
    }

    loadProduct()

    return () => {
      cancelled = true
    }
  }, [slug])

  const relatedProducts = liveProducts
    .filter(item => {
      const sameCategory =
        String(item.category || '').toLowerCase() ===
        String(product?.category || '').toLowerCase()

      const differentProduct =
        String(item.id || item._id) !==
        String(product?.id || product?._id)

      return sameCategory && differentProduct
    })
    .slice(0, 4)

  if (loadingProduct) {
    return (
      <>
        <Header />

        <main className="page">
          <div className="wrap narrow">
            <span className="eyebrow">
              Product
            </span>

            <h1>
              Loading product...
            </h1>

            <p className="lead">
              Please wait while we load the product details.
            </p>
          </div>
        </main>

        <Footer />
      </>
    )
  }

  if (!product) {
    return (
      <>
        <Header />

        <main className="page">
          <div className="wrap narrow">
            <span className="eyebrow">
              Product
            </span>

            <h1>
              Product not found
            </h1>

            <p className="lead">
              This product may be unavailable or the link may be incorrect.
            </p>

            <Button to="/shop">
              Back to shop
            </Button>
          </div>
        </main>

        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />

      <main className="page">
        <div className="wrap">

          {/* Breadcrumbs */}
          <div className="breadcrumbs">
            Home
            <span>/</span>
            Shop
            <span>/</span>
            {product.name}
          </div>

          {/* Product Details */}
          <div className="detail">

            {/* Product Images */}
            <div>
              <div
                className="detail-image"
                style={{
                  position: 'relative',
                  marginBottom: '14px'
                }}
              >
                <img
                  src={selectedImage || product.images?.[0] || product.image}
                  alt={product.name}
                />
              </div>

              {/* Thumbnail Gallery */}
              {product.images?.length > 1 && (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 88px))',
                    gap: '10px'
                  }}
                >
                  {product.images.map((image, index) => (
                    <button
                      type="button"
                      key={`${image}-${index}`}
                      onClick={() => setSelectedImage(image)}
                      aria-label={`View product image ${index + 1}`}
                      style={{
                        padding: 0,
                        border: image === selectedImage
                          ? '2px solid currentColor'
                          : '1px solid #ddd',
                        background: 'transparent',
                        cursor: 'pointer',
                        aspectRatio: '1 / 1',
                        overflow: 'hidden'
                      }}
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block'
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Information */}
            <div className="detail-copy">

              <span className="eyebrow">
                {product.category}
              </span>

              <h1>
                {product.name}
              </h1>

              {/* Rating */}
              <Rating
                rating={Number(product.rating) || 0}
                reviews={Number(
                  product.reviewCount ??
                  product.reviews ??
                  0
                )}
              />

              {/* Selling Price + MRP */}
              <div className="detail-price">
                <strong>
                  {money(product.price)}
                </strong>

                {Number(product.old || 0) > Number(product.price || 0) && (
                  <del style={{ marginLeft: '10px' }}>
                    MRP {money(product.old)}
                  </del>
                )}
              </div>

              {/* Main Product Description */}
              <p>
                {product.description ||
                  product.desc ||
                  'Beautifully crafted for everyday use.'}
              </p>

              <hr />

              {/* Quantity */}
              <label>
                Quantity
              </label>

              <div className="quantity">
                <button
                  type="button"
                  onClick={() =>
                    setQty(Math.max(1, qty - 1))
                  }
                >
                  <Minus size={15} />
                </button>

                <span>
                  {qty}
                </span>

                <button
                  type="button"
                  onClick={() => setQty(qty + 1)}
                >
                  <Plus size={15} />
                </button>
              </div>

              {/* Add To Cart — reference-style button with premium animation */}
              <button
                type="button"
                className={`detail-add-button ${
                  detailCartPulse ? 'detail-add-success' : ''
                }`}
                onClick={event => {
                  event.preventDefault()

                  if (isAdminPreviewMode()) {
                    window.alert(
                      'Admin Preview Mode: adding products to cart is disabled.'
                    )
                    return
                  }

                  for (let i = 0; i < qty; i++) {
                    add(product)
                  }

                  // Premium image-to-cart animation.
                  const image = document.querySelector('.detail-image img')
                  const cartTarget = document.querySelector(
                    '[data-xaaj-cart-target="true"]'
                  )
                  const imageRect = image?.getBoundingClientRect()
                  const cartRect = cartTarget?.getBoundingClientRect()

                  if (imageRect && cartRect) {
                    const flyingImage = image.cloneNode(true)
                    const startX = imageRect.left + imageRect.width / 2 - 30
                    const startY = imageRect.top + imageRect.height / 2 - 30
                    const endX = cartRect.left + cartRect.width / 2 - 30
                    const endY = cartRect.top + cartRect.height / 2 - 30

                    flyingImage.className = 'xaaj-flying-cart-image'
                    flyingImage.style.left = `${startX}px`
                    flyingImage.style.top = `${startY}px`
                    flyingImage.style.setProperty('--xaaj-x', `${endX - startX}px`)
                    flyingImage.style.setProperty('--xaaj-y', `${endY - startY}px`)

                    document.body.appendChild(flyingImage)
                    flyingImage.addEventListener(
                      'animationend',
                      () => flyingImage.remove(),
                      { once: true }
                    )
                  }

                  window.dispatchEvent(new CustomEvent('xaaj:cart-added'))
                  setDetailCartPulse(true)
                  window.setTimeout(() => setDetailCartPulse(false), 650)
                }}
              >
                <span className="detail-add-label">
                  ADD TO CART
                </span>
                <span className="detail-add-shine" aria-hidden="true" />
              </button>

              {/* Product Information Accordions */}
              <div
                className="faq-list"
                style={{ marginTop: '28px' }}
              >
                <details open>
                  <summary>
                    Description
                  </summary>
                  <p>
                    {product.description ||
                      product.desc ||
                      'Beautifully crafted for everyday use.'}
                  </p>
                </details>

                <details>
                  <summary>
                    Product Details &amp; Care
                  </summary>
                  <p style={{ whiteSpace: 'pre-line' }}>
                    {product.productDetails ||
                      'Product details and care instructions will be updated soon.'}
                  </p>
                </details>

                <details>
                  <summary>
                    Shipping &amp; Payment
                  </summary>
                  <p style={{ whiteSpace: 'pre-line' }}>
                    {product.shippingPayment ||
                      'Secure online payments. Shipping details will be provided at checkout.'}
                  </p>
                </details>

                <details>
                  <summary>
                    Return &amp; Exchange
                  </summary>
                  <p style={{ whiteSpace: 'pre-line' }}>
                    {product.returnExchange ||
                      'Return and exchange information will be updated soon.'}
                  </p>
                </details>
              </div>

              <div className="detail-note">
                Free shipping on orders of $100 or more
                <br />
              Secure packaging · 48-hour damage reporting
              </div>

            </div>

          </div>

          {relatedProducts.length > 0 && (
            <section
              className="wrap"
              style={{
                marginTop: '90px',
                marginBottom: '30px'
              }}
            >
              <SectionHeading
                eyebrow="You may also like"
                title="Related products"
              />

              <div className="product-grid">
                {relatedProducts.map(relatedProduct => (
                  <ProductCard
                    key={relatedProduct.id || relatedProduct._id}
                    product={relatedProduct}
                  />
                ))}
              </div>
            </section>
          )}

        </div>
      </main>

      <Footer />
    </>
  )
}

// ============================================================
// CART / WISHLIST PAGE
// ============================================================

function Cart({
  wishlist = false
}) {
  const {
    products: liveProducts,
    cart,
    remove,
    change,
    total,
    wish,
    toggleWish,
    add
  } = useStore()

  const items = wishlist
    ? liveProducts.filter(product => wish.includes(product.id || product._id))
    : cart

  const getProduct = item =>
    liveProducts.find(
      product =>
        String(product.id || product._id) === String(item.id || item._id)
    ) || item

  const getProductUrl = item => {
    const product = getProduct(item)
    const identifier = product.slug || item.slug || product.id || product._id
    return `/product/${encodeURIComponent(String(identifier || ''))}`
  }

  const shippingFee = total >= 1000 ? 0 : 99
  const grandTotal = total + shippingFee
  const freeShippingProgress = Math.min(100, (total / 1000) * 100)
  const remainingForFreeShipping = Math.max(0, 1000 - total)

  return (
    <>
      <Header />

      <main className={`page xaaj-cart-page ${wishlist ? 'xaaj-wishlist-page' : ''}`}>
        <div className="wrap">
          <div className="breadcrumbs">
            Home <span>/</span> {wishlist ? 'Wishlist' : 'Your cart'}
          </div>

          <header className="xaaj-cart-heading">
            <div>
              <span className="eyebrow">
                {wishlist ? 'Saved with intention' : 'Your selections'}
              </span>
              <h1>{wishlist ? 'Your wishlist' : 'Your cart'}</h1>
              <p>
                {wishlist
                  ? 'Pieces you loved enough to keep close.'
                  : 'A considered collection of pieces for your table.'}
              </p>
            </div>
            <div className="xaaj-cart-count">
              <span>{items.length}</span>
              <small>{items.length === 1 ? 'piece' : 'pieces'}</small>
            </div>
          </header>

          {items.length === 0 ? (
            <div className="xaaj-empty-state">
              <div className="xaaj-empty-mark">
                {wishlist ? <Heart size={25} strokeWidth={1.25} /> : <ShoppingBag size={25} strokeWidth={1.25} />}
              </div>
              <span className="eyebrow">
                {wishlist ? 'Nothing saved yet' : 'Your collection is waiting'}
              </span>
              <h2>
                {wishlist ? 'Keep something beautiful close.' : 'Start with something beautiful.'}
              </h2>
              <p>
                Explore XAAJ and find pieces made to become part of everyday rituals.
              </p>
              <Button to="/shop">Explore the collection</Button>
            </div>
          ) : (
            <div className="xaaj-shopping-layout">
              <section className="xaaj-shopping-items">
                {!wishlist && (
                  <div className="xaaj-shipping-progress">
                    <div className="xaaj-shipping-copy">
                      <span>
                        {remainingForFreeShipping > 0
                          ? <>Add <strong>{money(remainingForFreeShipping)}</strong> more for complimentary shipping.</>
                          : <>Your order qualifies for <strong>complimentary shipping.</strong></>}
                      </span>
                      <span>{Math.round(freeShippingProgress)}%</span>
                    </div>
                    <div className="xaaj-progress-track">
                      <span style={{ width: `${freeShippingProgress}%` }} />
                    </div>
                  </div>
                )}

                <div className="xaaj-items-header">
                  <span>{wishlist ? 'Saved pieces' : 'Your pieces'}</span>
                  <span>{items.length} {items.length === 1 ? 'item' : 'items'}</span>
                </div>

                <div className="xaaj-item-list">
                  {items.map(item => {
                    const product = getProduct(item)
                    const qty = item.qty || 1
                    const productUrl = getProductUrl(item)
                    const image = product.image || item.image
                    const name = product.name || item.name
                    const category = product.category || item.category
                    const price = Number(product.price ?? item.price ?? 0)

                    return (
                      <article className="xaaj-shopping-item" key={item.id || item._id}>
                        <Link
                          to={productUrl}
                          className="xaaj-shopping-image"
                          aria-label={`View ${name}`}
                        >
                          <img src={image} alt={name} />
                          <span>View piece <ArrowRight size={13} /></span>
                        </Link>

                        <div className="xaaj-shopping-info">
                          <div className="xaaj-item-topline">
                            <span>{category || 'XAAJ Collection'}</span>
                            <button
                              type="button"
                              className="xaaj-item-remove"
                              aria-label={`Remove ${name}`}
                              onClick={() => wishlist ? toggleWish(item.id || item._id) : remove(item.id || item._id)}
                            >
                              <X size={16} />
                            </button>
                          </div>

                          <Link to={productUrl} className="xaaj-shopping-title">
                            <h2>{name}</h2>
                          </Link>

                          <p className="xaaj-item-price">{money(price)}</p>

                          <div className="xaaj-item-actions">
                            {!wishlist ? (
                              <div className="xaaj-quantity-control" aria-label={`Quantity for ${name}`}>
                                <button type="button" onClick={() => change(item.id || item._id, -1)} aria-label="Decrease quantity">
                                  <Minus size={13} />
                                </button>
                                <span>{qty}</span>
                                <button type="button" onClick={() => change(item.id || item._id, 1)} aria-label="Increase quantity">
                                  <Plus size={13} />
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                className="xaaj-text-action"
                                onClick={() => {
                                 if (isAdminPreviewMode()) {
                                   window.alert(
                                     'Admin Preview Mode: adding products to cart is disabled.'
                                   )
                                   return
                                 }

                                 add(product)
                               }}
                              >
                                <ShoppingBag size={14} /> Add to cart
                              </button>
                            )}

                            <Link to={productUrl} className="xaaj-view-link">
                              View details <ArrowRight size={14} />
                            </Link>
                          </div>
                        </div>

                        <strong className="xaaj-item-total">
                          {money(price * qty)}
                        </strong>
                      </article>
                    )
                  })}
                </div>
              </section>

              {!wishlist && (
                <aside className="xaaj-order-summary">
                  <div className="xaaj-summary-kicker">XAAJ / ORDER</div>
                  <h2>Order summary</h2>
                  <p className="xaaj-summary-intro">Thoughtfully packed and prepared for its journey to you.</p>

                  <div className="xaaj-summary-lines">
                    <div><span>Subtotal</span><strong>{money(total)}</strong></div>
                    <div>
                      <span>Shipping</span>
                      <strong>{shippingFee === 0 ? 'Complimentary' : money(shippingFee)}</strong>
                    </div>
                  </div>

                  <div className="xaaj-summary-total">
                    <span>Total</span>
                    <strong>{money(grandTotal)}</strong>
                  </div>

                  <Button to="/checkout" className="xaaj-checkout-button">
                    Continue to checkout
                  </Button>

                  <div className="xaaj-summary-note">
                    <ShieldCheck size={16} />
                    <span>Secure checkout · Carefully packed · Damage support within 48 hours</span>
                  </div>
                </aside>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  )
}


// ============================================================
// PREMIUM POLICY ACCORDION
// ============================================================

function PolicyAccordion({ sections }) {
  return (
    <div className="policy-accordion">
      {sections.map((section, index) => (
        <details className="policy-item" key={section.title} open={index === 0}>
          <summary>
            <span>{section.title}</span>
            <span className="policy-plus" aria-hidden="true">+</span>
          </summary>
          <div className="policy-answer">
            {section.content}
          </div>
        </details>
      ))}
    </div>
  )
}

const policyAccordionStyles = `
  .policy-page {
    background: #f7f3ed;
  }
  .policy-page .wrap.narrow {
    max-width: 900px;
  }
  .policy-hero {
    padding: 78px 0 46px;
  }
  .policy-hero .eyebrow {
    display: block;
    margin-bottom: 18px;
    letter-spacing: .24em;
  }
  .policy-hero h1 {
    max-width: 760px;
    margin: 0 0 20px;
    font-family: Georgia, 'Times New Roman', serif;
    font-size: clamp(48px, 7vw, 82px);
    line-height: .98;
    font-weight: 400;
    letter-spacing: -.035em;
  }
  .policy-hero .policy-intro {
    max-width: 720px;
    margin: 0;
    font-family: Georgia, 'Times New Roman', serif;
    font-size: clamp(20px, 2.2vw, 27px);
    line-height: 1.45;
    color: #393632;
  }
  .policy-effective {
    margin-top: 18px;
    font-family: Arial, sans-serif;
    font-size: 13px;
    color: #77716a;
  }
  .policy-accordion {
    border-top: 1px solid rgba(45, 42, 38, .16);
    margin: 10px 0 80px;
  }
  .policy-item {
    border-bottom: 1px solid rgba(45, 42, 38, .16);
  }
  .policy-item summary {
    list-style: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    padding: 27px 0;
    font-family: Georgia, 'Times New Roman', serif;
    font-size: clamp(22px, 2.2vw, 29px);
    line-height: 1.25;
    color: #292724;
    transition: opacity .25s ease;
  }
  .policy-item summary::-webkit-details-marker { display: none; }
  .policy-item summary:hover { opacity: .68; }
  .policy-plus {
    flex: 0 0 auto;
    width: 28px;
    height: 28px;
    display: grid;
    place-items: center;
    font-family: Arial, sans-serif;
    font-size: 24px;
    font-weight: 300;
    line-height: 1;
    transition: transform .3s ease;
  }
  .policy-item[open] .policy-plus {
    transform: rotate(45deg);
  }
  .policy-answer {
    max-width: 790px;
    padding: 0 46px 30px 0;
    color: #68635d;
    font-family: Arial, sans-serif;
    font-size: 15px;
    line-height: 1.8;
    animation: policyReveal .35s ease both;
  }
  .policy-answer p { margin: 0 0 16px; }
  .policy-answer p:last-child { margin-bottom: 0; }
  .policy-answer ul { margin: 0 0 16px; padding-left: 22px; }
  .policy-answer li { margin: 0 0 8px; }
  .policy-answer strong { color: #36322e; }
  .policy-answer a { color: inherit; text-decoration: underline; text-underline-offset: 3px; }
  @keyframes policyReveal {
    from { opacity: 0; transform: translateY(-5px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @media (max-width: 700px) {
    .policy-hero { padding: 54px 0 34px; }
    .policy-hero h1 { font-size: 48px; }
    .policy-item summary { padding: 22px 0; font-size: 23px; }
    .policy-answer { padding: 0 0 25px; font-size: 14px; }
  }
`

// ============================================================
// SIMPLE PAGE
// ============================================================

function SimplePage({
  title,
  eyebrow,
  children,
  policy = false,
  intro = '',
  effectiveDate = ''
}) {

  if (policy) {
    return (
      <>
        <Header />
        <style>{policyAccordionStyles}</style>
        <main className="page simple policy-page">
          <div className="wrap narrow">
            <div className="policy-hero">
              <span className="eyebrow">{eyebrow}</span>
              <h1>{title}</h1>
              <p className="policy-intro">{intro}</p>
              {effectiveDate && (
                <p className="policy-effective">Effective date: {effectiveDate}</p>
              )}
            </div>
            {children}
          </div>
        </main>
        <Newsletter />
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="page simple">
        <div className="wrap narrow">
          <span className="eyebrow">{eyebrow}</span>
          <h1>{title}</h1>
          {children}
        </div>
      </main>
      <Newsletter />
      <Footer />
    </>
  )
}


// ============================================================
// BLOG — PREMIUM EDITORIAL DESIGN
// ============================================================

const fallbackBlogPosts = [
  {
    id: 'blog-1',
    title: '5 Ways to Create a Beautiful Dining Table',
    slug: '5-ways-to-create-a-beautiful-dining-table',
    coverImage: '',
    category: 'Table Styling',
    excerpt: 'Simple ideas to elevate your dining experience with timeless crockery, thoughtful placement and beautiful details.',
    content: 'A beautiful dining table is not only about the food you serve. The right crockery, placement and small details can completely transform the experience.\n\nStart with the right dinnerware. Choose pieces that complement your table and the occasion, while keeping the setting practical enough for everyday use.\n\nAdd layers with plates, bowls and serving pieces to create visual depth. Keep colours balanced and let natural textures do the talking.\n\nFinally, leave a little room for imperfection. A table should feel lived in, warm and inviting — never overly precious.',
    author: 'XAAJ Editorial',
    publishDate: '2026-09-15',
    isPublished: true
  },
  {
    id: 'blog-2',
    title: 'How to Care for Your Ceramic Dinnerware',
    slug: 'how-to-care-for-your-ceramic-dinnerware',
    coverImage: '',
    category: 'Crockery Care',
    excerpt: 'Keep your favourite XAAJ pieces beautiful for years with a few simple care habits.',
    content: 'Good ceramic dinnerware is made to be used. With a little everyday care, your favourite pieces can remain part of your table for years.\n\nWash pieces gently and avoid sudden temperature changes wherever possible. Stack thoughtfully and give delicate rims a little extra space.\n\nFor daily meals, use your pieces freely. Their beauty comes from becoming part of the rituals and moments that make a home feel like yours.',
    author: 'XAAJ Editorial',
    publishDate: '2026-09-12',
    isPublished: true
  },
  {
    id: 'blog-3',
    title: 'Creating a Cozy Corner at Home',
    slug: 'creating-a-cozy-corner-at-home',
    coverImage: '',
    category: 'Home Decor',
    excerpt: 'Small styling ideas to make an everyday corner feel warmer, calmer and more inviting.',
    content: 'A home does not need a complete makeover to feel different. Sometimes, a few thoughtful objects are enough.\n\nStart with one useful piece you genuinely love, then build around it with natural textures, soft light and a little greenery.\n\nThe goal is not perfection. It is creating a corner that feels comfortable enough to pause, gather and stay awhile.',
    author: 'XAAJ Editorial',
    publishDate: '2026-09-10',
    isPublished: true
  }
]

function normalizeBlogPost(post, index = 0) {
  if (!post || typeof post !== 'object') return null

  return {
    ...post,
    id: post.id || post._id || `blog-${index}`,
    title: post.title || 'XAAJ Story',
    slug: post.slug || '',
    coverImage: post.coverImage || post.image || post.featuredImage || '',
    category: post.category || 'XAAJ Stories',
    excerpt: post.excerpt || post.shortExcerpt || '',
    content: post.content || post.article || '',
    author: post.author || 'XAAJ Editorial',
    publishDate: post.publishDate || post.publishedAt || post.createdAt || '',
    isPublished: post.isPublished !== false && post.published !== false
  }
}

function formatBlogDate(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

function BlogDesignStyles() {
  return (
    <style>{`
      .xaaj-blog-shell,
      .xaaj-blog-article-shell {
        --blog-ink: #292825;
        --blog-muted: #77736b;
        --blog-line: rgba(41,40,37,.14);
        --blog-soft: #f4f1eb;
        --blog-paper: #faf9f6;
        --blog-serif: Georgia, 'Times New Roman', serif;
      }

      .xaaj-blog-shell {
        position: relative;
        overflow: hidden;
        background: var(--blog-paper);
        padding: 0 0 110px;
      }

      .xaaj-blog-hero {
        position: relative;
        min-height: 520px;
        display: flex;
        align-items: flex-end;
        overflow: hidden;
        background: #292825;
      }

      .xaaj-blog-hero-bg {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        opacity: .62;
        transform: scale(1.02);
        transition: transform 1.2s cubic-bezier(.22,1,.36,1);
      }

      .xaaj-blog-hero:hover .xaaj-blog-hero-bg { transform: scale(1.06); }

      .xaaj-blog-hero::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(180deg, rgba(25,24,22,.05) 15%, rgba(25,24,22,.74) 100%);
      }

      .xaaj-blog-hero-content {
        position: relative;
        z-index: 1;
        width: min(1180px, calc(100% - 44px));
        margin: 0 auto;
        padding: 92px 0 74px;
        color: #fff;
      }

      .xaaj-blog-kicker {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 20px;
        font-size: 10px;
        letter-spacing: .2em;
        text-transform: uppercase;
        font-weight: 700;
      }

      .xaaj-blog-kicker::before {
        content: '';
        width: 34px;
        height: 1px;
        background: currentColor;
        opacity: .7;
      }

      .xaaj-blog-hero h1 {
        max-width: 780px;
        margin: 0;
        font-family: var(--blog-serif);
        font-size: clamp(48px, 7vw, 88px);
        font-weight: 400;
        line-height: .96;
        letter-spacing: -.045em;
      }

      .xaaj-blog-hero p {
        max-width: 570px;
        margin: 26px 0 0;
        font-size: 15px;
        line-height: 1.75;
        color: rgba(255,255,255,.82);
      }

      .xaaj-blog-feature-wrap {
        width: min(1180px, calc(100% - 44px));
        margin: -62px auto 0;
        position: relative;
        z-index: 3;
      }

      .xaaj-blog-feature {
        display: grid;
        grid-template-columns: minmax(0, 1.18fr) minmax(360px, .82fr);
        min-height: 440px;
        background: #fff;
        box-shadow: 0 24px 70px rgba(36,34,30,.13);
      }

      .xaaj-blog-feature-image {
        position: relative;
        min-height: 440px;
        overflow: hidden;
      }

      .xaaj-blog-feature-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        transition: transform 1s cubic-bezier(.22,1,.36,1);
      }

      .xaaj-blog-feature:hover .xaaj-blog-feature-image img { transform: scale(1.045); }

      .xaaj-blog-feature-copy {
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: 54px clamp(30px, 5vw, 70px);
      }

      .xaaj-blog-category {
        display: inline-flex;
        width: fit-content;
        color: var(--blog-muted);
        font-size: 10px;
        line-height: 1;
        font-weight: 700;
        letter-spacing: .16em;
        text-transform: uppercase;
      }

      .xaaj-blog-feature-copy h2 {
        margin: 20px 0 18px;
        font-family: var(--blog-serif);
        color: var(--blog-ink);
        font-size: clamp(31px, 4vw, 49px);
        font-weight: 400;
        line-height: 1.04;
        letter-spacing: -.035em;
      }

      .xaaj-blog-feature-copy p {
        margin: 0;
        color: var(--blog-muted);
        font-size: 14px;
        line-height: 1.8;
      }

      .xaaj-blog-meta {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-top: 28px;
        color: #98938a;
        font-size: 11px;
      }

      .xaaj-blog-read {
        position: relative;
        display: inline-flex;
        align-items: center;
        gap: 12px;
        width: fit-content;
        margin-top: 34px;
        color: var(--blog-ink);
        font-size: 11px;
        font-weight: 700;
        letter-spacing: .13em;
        text-transform: uppercase;
        text-decoration: none;
      }

      .xaaj-blog-read svg { transition: transform .35s ease; }
      .xaaj-blog-read:hover svg { transform: translateX(6px); }
      .xaaj-blog-read::after {
        content: '';
        position: absolute;
        left: 0;
        right: 28px;
        bottom: -8px;
        height: 1px;
        background: var(--blog-ink);
        transform-origin: left;
        transition: transform .35s ease;
      }
      .xaaj-blog-read:hover::after { transform: scaleX(.55); }

      .xaaj-blog-content {
        width: min(1180px, calc(100% - 44px));
        margin: 108px auto 0;
      }

      .xaaj-blog-content-head {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        gap: 30px;
        margin-bottom: 34px;
      }

      .xaaj-blog-content-head h2 {
        margin: 8px 0 0;
        font-family: var(--blog-serif);
        font-size: clamp(30px, 4vw, 46px);
        font-weight: 400;
        line-height: 1;
        letter-spacing: -.035em;
        color: var(--blog-ink);
      }

      .xaaj-blog-content-head p {
        max-width: 410px;
        margin: 10px 0 0;
        color: var(--blog-muted);
        font-size: 13px;
        line-height: 1.7;
      }

      .xaaj-blog-filters {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-bottom: 42px;
        padding-bottom: 18px;
        border-bottom: 1px solid var(--blog-line);
      }

      .xaaj-blog-filter {
        border: 1px solid var(--blog-line);
        background: transparent;
        color: #6f6b64;
        padding: 10px 17px;
        border-radius: 999px;
        font: inherit;
        font-size: 10px;
        letter-spacing: .11em;
        text-transform: uppercase;
        cursor: pointer;
        transition: all .3s ease;
      }

      .xaaj-blog-filter:hover,
      .xaaj-blog-filter.active {
        background: var(--blog-ink);
        color: #fff;
        border-color: var(--blog-ink);
        transform: translateY(-1px);
      }

      .xaaj-blog-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 30px;
      }

      .xaaj-blog-card {
        min-width: 0;
        background: #fff;
        border: 1px solid rgba(44,42,38,.06);
        box-shadow: 0 8px 30px rgba(44,42,38,.07);
        overflow: hidden;
        transition: transform .45s cubic-bezier(.22,1,.36,1), box-shadow .45s ease;
      }

      .xaaj-blog-card:hover {
        transform: translateY(-7px);
        box-shadow: 0 18px 46px rgba(44,42,38,.13);
      }

      .xaaj-blog-card-image {
        position: relative;
        display: block;
        aspect-ratio: 1.58 / 1;
        overflow: hidden;
        background: #eeeae3;
      }

      .xaaj-blog-card-image img,
      .xaaj-blog-card-placeholder {
        width: 100%;
        height: 100%;
        display: block;
        object-fit: cover;
        transition: transform .8s cubic-bezier(.22,1,.36,1);
      }

      .xaaj-blog-card:hover .xaaj-blog-card-image img { transform: scale(1.045); }

      .xaaj-blog-card-number {
        display: none;
      }

      .xaaj-blog-card-copy {
        padding: 24px 27px 27px;
      }

      .xaaj-blog-category {
        display: inline-block;
        color: #b96f60;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: .13em;
        line-height: 1.2;
        text-transform: uppercase;
      }

      .xaaj-blog-card-copy h3 {
        margin: 12px 0 12px;
        font-family: var(--blog-serif);
        color: var(--blog-ink);
        font-size: 26px;
        font-weight: 400;
        line-height: 1.12;
        letter-spacing: -.025em;
      }

      .xaaj-blog-card-copy h3 a {
        color: inherit;
        text-decoration: none;
      }

      .xaaj-blog-card-copy p {
        margin: 0;
        color: #77736d;
        font-size: 14px;
        line-height: 1.55;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .xaaj-blog-card-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 14px;
        margin-top: 18px;
        padding-top: 0;
        border-top: 0;
        color: #8b867e;
        font-size: 12px;
      }

      .xaaj-blog-card-footer .xaaj-blog-read {
        margin-top: 0;
        color: #b96f60;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0;
        text-transform: none;
      }

      .xaaj-blog-skeleton {
        aspect-ratio: 1.12 / 1;
        background: linear-gradient(100deg,#eeeae3 20%,#f7f5f1 40%,#eeeae3 60%);
        background-size: 200% 100%;
        animation: xaajBlogShimmer 1.5s linear infinite;
      }

      @keyframes xaajBlogShimmer { to { background-position: -200% 0; } }

      .xaaj-blog-empty {
        padding: 80px 20px;
        border-top: 1px solid var(--blog-line);
        text-align: center;
      }

      .xaaj-blog-empty h2 {
        margin: 0 0 10px;
        font-family: var(--blog-serif);
        font-weight: 400;
        font-size: 34px;
      }
      .xaaj-blog-empty p { color: var(--blog-muted); font-size: 13px; }

      .xaaj-blog-article-shell {
        background: var(--blog-paper);
        padding: 45px 0 110px;
      }

      .xaaj-blog-article {
        width: min(1040px, calc(100% - 44px));
        margin: 0 auto;
      }

      .xaaj-blog-breadcrumbs {
        display: flex;
        gap: 9px;
        flex-wrap: wrap;
        margin-bottom: 62px;
        color: #9b968e;
        font-size: 10px;
      }
      .xaaj-blog-breadcrumbs a { color: inherit; text-decoration: none; }
      .xaaj-blog-breadcrumbs a:hover { color: var(--blog-ink); }

      .xaaj-blog-article-header {
        max-width: 860px;
        margin: 0 auto 45px;
        text-align: center;
      }

      .xaaj-blog-article-header h1 {
        margin: 17px 0 20px;
        font-family: var(--blog-serif);
        font-size: clamp(42px, 6vw, 76px);
        font-weight: 400;
        line-height: 1;
        letter-spacing: -.045em;
        color: var(--blog-ink);
      }

      .xaaj-blog-article-meta {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 10px;
        color: #918c84;
        font-size: 11px;
      }

      .xaaj-blog-article-cover {
        width: 100%;
        aspect-ratio: 1.8 / 1;
        overflow: hidden;
        background: var(--blog-soft);
      }

      .xaaj-blog-article-cover img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }

      .xaaj-blog-article-body {
        max-width: 720px;
        margin: 58px auto 0;
      }

      .xaaj-blog-article-excerpt {
        margin: 0 0 42px;
        font-family: var(--blog-serif);
        font-size: 23px;
        line-height: 1.55;
        color: var(--blog-ink);
      }

      .xaaj-blog-article-content p {
        margin: 0 0 25px;
        color: #5f5b54;
        font-size: 15px;
        line-height: 2;
      }

      .xaaj-blog-article-content h2 {
        margin: 48px 0 18px;
        font-family: var(--blog-serif);
        color: var(--blog-ink);
        font-size: 30px;
        font-weight: 400;
      }

      .xaaj-blog-article-back {
        max-width: 720px;
        margin: 58px auto 0;
        padding-top: 24px;
        border-top: 1px solid var(--blog-line);
      }

      .xaaj-blog-article-back a {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        color: var(--blog-ink);
        font-size: 10px;
        font-weight: 700;
        letter-spacing: .12em;
        text-transform: uppercase;
        text-decoration: none;
      }

      .xaaj-blog-fade {
        animation: xaajBlogFade .8s cubic-bezier(.22,1,.36,1) both;
      }
      .xaaj-blog-fade-delay { animation-delay: .1s; }

      @keyframes xaajBlogFade {
        from { opacity: 0; transform: translateY(22px); }
        to { opacity: 1; transform: translateY(0); }
      }

      @media (max-width: 900px) {
        .xaaj-blog-hero { min-height: 460px; }
        .xaaj-blog-feature { grid-template-columns: 1fr; }
        .xaaj-blog-feature-image { min-height: 390px; }
        .xaaj-blog-grid { grid-template-columns: repeat(2, minmax(0,1fr)); gap: 24px; }
      }

      @media (max-width: 620px) {
        .xaaj-blog-shell { padding-bottom: 72px; }
        .xaaj-blog-hero { min-height: 470px; }
        .xaaj-blog-hero-content { width: min(100% - 30px,1180px); padding: 70px 0 62px; }
        .xaaj-blog-hero h1 { font-size: clamp(46px, 14vw, 68px); }
        .xaaj-blog-feature-wrap,
        .xaaj-blog-content,
        .xaaj-blog-article { width: min(100% - 30px,1180px); }
        .xaaj-blog-feature-wrap { margin-top: -36px; }
        .xaaj-blog-feature-image { min-height: 300px; }
        .xaaj-blog-feature-copy { padding: 35px 26px 38px; }
        .xaaj-blog-content { margin-top: 72px; }
        .xaaj-blog-content-head { display: block; }
        .xaaj-blog-filters { margin-bottom: 30px; }
        .xaaj-blog-grid { grid-template-columns: 1fr; gap: 42px; }
        .xaaj-blog-card-image { aspect-ratio: 1.5 / 1; }
        .xaaj-blog-card-copy { padding: 21px 20px 23px; }
        .xaaj-blog-card-copy h3 { font-size: 23px; }
        .xaaj-blog-article-shell { padding-top: 28px; }
        .xaaj-blog-breadcrumbs { margin-bottom: 44px; }
        .xaaj-blog-article-header { margin-bottom: 34px; }
        .xaaj-blog-article-cover { aspect-ratio: 1.08 / 1; }
        .xaaj-blog-article-body { margin-top: 38px; }
        .xaaj-blog-article-excerpt { font-size: 20px; }
      }

      @media (prefers-reduced-motion: reduce) {
        .xaaj-blog-hero-bg,
        .xaaj-blog-feature-image img,
        .xaaj-blog-card-image img,
        .xaaj-blog-read svg,
        .xaaj-blog-filter { transition: none; }
        .xaaj-blog-fade { animation: none; }
      }
    `}</style>
  )
}

function BlogCard({ post, index = 0 }) {
  return (
    <article className="xaaj-blog-card xaaj-blog-fade" style={{ animationDelay: `${Math.min(index * 70, 350)}ms` }}>
      <Link to={`/blog/${post.slug}`} className="xaaj-blog-card-image" aria-label={`Read ${post.title}`}>
        {post.coverImage ? (
          <WoodistryImage className="wood-blog-cover-shell" src={post.coverImage} alt={post.title} loading="lazy" />
        ) : (
          <div className="xaaj-blog-card-placeholder" />
        )}
        <span className="xaaj-blog-card-number">{String(index + 1).padStart(2, '0')}</span>
      </Link>

      <div className="xaaj-blog-card-copy">
        <span className="xaaj-blog-category">{post.category}</span>
        <h3><Link to={`/blog/${post.slug}`}>{post.title}</Link></h3>
        {post.excerpt && <p>{post.excerpt}</p>}

        <div className="xaaj-blog-card-footer">
          <span>{formatBlogDate(post.publishDate)}</span>
          <Link to={`/blog/${post.slug}`} className="xaaj-blog-read">
            Read article <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </article>
  )
}

function useBlogPosts() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function loadBlogs() {
      try {
        const result = await apiRequest('/blogs')
        const rawPosts = result?.data?.blogs || result?.blogs || result?.data || []
        const livePosts = Array.isArray(rawPosts)
          ? rawPosts.map((post, index) => normalizeBlogPost(post, index)).filter(post => post && post.isPublished)
          : []

        if (!cancelled) setPosts(livePosts.length ? livePosts : fallbackBlogPosts)
      } catch (error) {
        if (!cancelled) {
          console.error('Blog load error:', error)
          setPosts(fallbackBlogPosts)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadBlogs()
    return () => { cancelled = true }
  }, [])

  return { posts, loading }
}

function BlogSection() {
  const { posts, loading } = useBlogPosts()
  const visiblePosts = posts.filter(post => post?.isPublished !== false).slice(0, 3)

  return (
    <section className="xaaj-blog-shell" data-xaaj-reveal="up">
      <BlogDesignStyles />

      <div className="xaaj-blog-content xaaj-blog-home-content">
        <div className="xaaj-blog-content-head">
          <div>
            <span className="xaaj-blog-kicker" style={{ color: '#77736b' }}>From our blog</span>
            <h2>Stories for beautiful living</h2>
            <p>Ideas, inspiration and thoughtful rituals for a more beautiful everyday.</p>
          </div>
          <Link to="/blog" className="xaaj-blog-read">View all stories <ArrowRight size={14} /></Link>
        </div>

        {loading ? (
          <div className="xaaj-blog-grid">
            {[1, 2, 3].map(item => <div className="xaaj-blog-skeleton" key={item} />)}
          </div>
        ) : visiblePosts.length ? (
          <div className="xaaj-blog-grid">
            {visiblePosts.map((post, index) => (
              <BlogCard key={post.id || post.slug || index} post={post} index={index} />
            ))}
          </div>
        ) : (
          <div className="xaaj-blog-empty">
            <h2>No stories yet.</h2>
            <p>New XAAJ stories will appear here soon.</p>
          </div>
        )}
      </div>
    </section>
  )
}

function BlogPage() {
  const { posts, loading } = useBlogPosts()
  const [category, setCategory] = useState('All')

  const categoryList = [
    'All',
    ...Array.from(new Set(posts.map(post => post.category).filter(Boolean)))
  ]

  const filteredPosts = category === 'All'
    ? posts
    : posts.filter(post => post.category === category)

  const heroPost = filteredPosts[0] || posts[0]

  return (
    <>
      <Header />
      <BlogDesignStyles />

      <main className="xaaj-blog-shell">
        <section className="xaaj-blog-hero">
          <img
            className="xaaj-blog-hero-bg"
            src={heroImage}
            alt="Handcrafted XAAJ tableware arranged for an everyday table"
            aria-hidden="true"
          />
          <div className="xaaj-blog-hero-content xaaj-blog-fade">
            <span className="xaaj-blog-kicker">The XAAJ Blog</span>
            <h1>Beautiful things.<br />Thoughtfully lived.</h1>
            <p>Stories, inspiration and practical rituals for tables, homes and the everyday objects we choose to live with.</p>
          </div>
        </section>

        <div className="xaaj-blog-content">
          <div className="xaaj-blog-filters" aria-label="Blog categories">
            {categoryList.map(item => (
              <button
                type="button"
                key={item}
                className={`xaaj-blog-filter ${category === item ? 'active' : ''}`}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="xaaj-blog-grid">
              {[1, 2, 3].map(item => <div className="xaaj-blog-skeleton" key={item} />)}
            </div>
          ) : filteredPosts.length ? (
            <div className="xaaj-blog-grid xaaj-blog-page-grid">
              {filteredPosts.map((post, index) => (
                <BlogCard key={post.id || post.slug || index} post={post} index={index} />
              ))}
            </div>
          ) : (
            <div className="xaaj-blog-empty">
              <h2>No stories yet.</h2>
              <p>New XAAJ stories will appear here soon.</p>
            </div>
          )}
        </div>
      </main>

      <Newsletter />
      <Footer />
    </>
  )
}

function BlogArticle({ slug }) {
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function loadBlog() {
      try {
        const result = await apiRequest(`/blogs/${encodeURIComponent(slug)}`)
        const rawPost = result?.data?.blog || result?.blog || result?.data || result
        const livePost = normalizeBlogPost(rawPost)

        if (!cancelled && livePost?.title) {
          setPost(livePost)
          return
        }

        const fallback = fallbackBlogPosts.find(item => item.slug === slug)
        if (!cancelled) setPost(fallback || null)
      } catch (error) {
        if (!cancelled) {
          console.error('Blog article load error:', error)
          const fallback = fallbackBlogPosts.find(item => item.slug === slug)
          setPost(fallback || null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadBlog()
    return () => { cancelled = true }
  }, [slug])

  if (loading) {
    return (
      <>
        <Header />
        <BlogDesignStyles />
        <main className="xaaj-blog-article-shell">
          <div className="xaaj-blog-article"><span className="xaaj-blog-category">Blog</span><h1 style={{ fontFamily: 'Georgia, serif', fontWeight: 400 }}>Loading story...</h1></div>
        </main>
        <Footer />
      </>
    )
  }

  if (!post) {
    return (
      <>
        <Header />
        <BlogDesignStyles />
        <main className="xaaj-blog-article-shell">
          <div className="xaaj-blog-article">
            <span className="xaaj-blog-category">Blog</span>
            <h1 style={{ fontFamily: 'Georgia, serif', fontWeight: 400 }}>Story not found.</h1>
            <p style={{ color: '#77736b', marginTop: 14 }}>This story may have been unpublished or the link may be incorrect.</p>
            <Button to="/blog">Back to blog</Button>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  const contentParts = String(post.content || '').split(/\n{2,}/).map(part => part.trim()).filter(Boolean)

  return (
    <>
      <Header />
      <BlogDesignStyles />

      <main className="xaaj-blog-article-shell">
        <article className="xaaj-blog-article">
          <div className="xaaj-blog-breadcrumbs">
            <Link to="/">Home</Link><span>/</span><Link to="/blog">Blog</Link><span>/</span><span>{post.title}</span>
          </div>

          <header className="xaaj-blog-article-header xaaj-blog-fade">
            <span className="xaaj-blog-category">{post.category}</span>
            <h1>{post.title}</h1>
            <div className="xaaj-blog-article-meta">
              <span>By {post.author}</span><span>•</span><span>{formatBlogDate(post.publishDate)}</span>
            </div>
          </header>

          {post.coverImage && (
            <div className="xaaj-blog-article-cover xaaj-blog-fade xaaj-blog-fade-delay">
              <WoodistryImage className="wood-blog-cover-shell" src={post.coverImage} alt={post.title} />
            </div>
          )}

          <div className="xaaj-blog-article-body">
            {post.excerpt && <p className="xaaj-blog-article-excerpt">{post.excerpt}</p>}
            <div className="xaaj-blog-article-content">
              {contentParts.map((paragraph, index) => (
                <div key={index}>
                  {paragraph.split('\n').map((line, lineIndex) => {
                    const trimmed = line.trim()
                    if (!trimmed) return null
                    if (/^#{1,3}\s/.test(trimmed)) {
                      return <h2 key={lineIndex}>{trimmed.replace(/^#{1,3}\s/, '')}</h2>
                    }
                    return <p key={lineIndex}>{trimmed}</p>
                  })}
                </div>
              ))}
            </div>
          </div>

          <div className="xaaj-blog-article-back">
            <Link to="/blog"><ArrowRight size={14} style={{ transform: 'rotate(180deg)' }} /> Back to all stories</Link>
          </div>
        </article>
      </main>

      <Newsletter />
      <Footer />
    </>
  )
}

// ============================================================
// MAIN APP ROUTING
// ============================================================

function App() {

  // Authentication context
  const {
    login,
    register,
    verifyEmail,
    resendVerification,
    forgotPassword,
    verifyResetOtp,
    resetPassword,
    logout,
    user
  } = useAuth()

  const { cart, total, clearCart, loadProducts } = useStore()
  const location = useLocation()
  const path = location.pathname
  const navigate = useNavigate()

  const previewQueryActive =
    new URLSearchParams(location.search).get('xaajPreview') === '1'

  const isAdminPreview =
    previewQueryActive || adminPreviewSessionActive

  useEffect(() => {
    if (previewQueryActive) {
      // Preview state is kept only in this loaded app instance.
      // It does not persist to normal users or other browser tabs.
      adminPreviewSessionActive = true
    }
  }, [previewQueryActive])

  // ==========================================================
  // LOGIN STATE
  // ==========================================================

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // ==========================================================
  // REGISTRATION STATE
  // ==========================================================

  const [registerName, setRegisterName] = useState('')
  const [registerEmail, setRegisterEmail] = useState('')
  const [registerPassword, setRegisterPassword] = useState('')
  const [registerCountryCode, setRegisterCountryCode] = useState('+1')
  const [registerPhone, setRegisterPhone] = useState('')
  const [registerAddress, setRegisterAddress] = useState('')
  const [registerCity, setRegisterCity] = useState('')
  const [registerState, setRegisterState] = useState('')
  const [registerPin, setRegisterPin] = useState('')
  const [registerLoading, setRegisterLoading] = useState(false)
  const [registerError, setRegisterError] = useState('')

  // ==========================================================
  // EMAIL OTP STATE
  // ==========================================================

  const [otpEmail, setOtpEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [otpLoading, setOtpLoading] = useState(false)
  const [otpResending, setOtpResending] = useState(false)
  const [otpMessage, setOtpMessage] = useState('')
  const [otpError, setOtpError] = useState('')

  // ==========================================================
  // FORGOT PASSWORD / RESET PASSWORD STATE
  // ==========================================================

  const [resetEmail, setResetEmail] = useState('')
  const [resetOtp, setResetOtp] = useState('')
  const [resetToken, setResetToken] = useState(() =>
    window.sessionStorage.getItem('xaaj-reset-token') || ''
  )
  const [resetPasswordValue, setResetPasswordValue] = useState('')
  const [resetConfirmPassword, setResetConfirmPassword] = useState('')
  const [resetLoading, setResetLoading] = useState(false)
  const [resetError, setResetError] = useState('')
  const [resetMessage, setResetMessage] = useState('')

  // ==========================================================
  // CHECKOUT STATE
  // ==========================================================

  const [checkoutEmail, setCheckoutEmail] = useState('')
  const [checkoutName, setCheckoutName] = useState('')
  const [checkoutPhone, setCheckoutPhone] = useState('')
  const [checkoutAddress, setCheckoutAddress] = useState('')
  const [checkoutCity, setCheckoutCity] = useState('')
  const [checkoutState, setCheckoutState] = useState('')
  const [checkoutPin, setCheckoutPin] = useState('')
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [paymentError, setPaymentError] = useState('')

  // ==========================================================
  // PAYMENT METHOD
  // ==========================================================
  // razorpay = Online Payment
  // cod = Cash on Delivery
  // ==========================================================

  const [paymentMethod, setPaymentMethod] = useState('razorpay')

  // ==========================================================
  // MY ORDERS STATE
  // ==========================================================

  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [ordersError, setOrdersError] = useState('')
  const [cancellingOrderId, setCancellingOrderId] = useState('')

  // ==========================================================
  // PRODUCT REVIEW / FEEDBACK STATE
  // ==========================================================

  const [reviewingItem, setReviewingItem] = useState(null)
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewLoading, setReviewLoading] = useState(false)
  const [reviewError, setReviewError] = useState('')
  const [reviewMessage, setReviewMessage] = useState('')

  const openReviewForm = (order, item) => {
    setReviewingItem({
      orderId: order?._id || order?.id,
      productId: item?.product,
      productName: item?.name || 'Product',
      image: item?.image || ''
    })
    setReviewRating(0)
    setReviewComment('')
    setReviewError('')
    setReviewMessage('')
  }

  const closeReviewForm = () => {
    if (reviewLoading) return
    setReviewingItem(null)
    setReviewRating(0)
    setReviewComment('')
    setReviewError('')
    setReviewMessage('')
  }

  const handleSubmitReview = async event => {
    event.preventDefault()

    if (!reviewingItem?.orderId || !reviewingItem?.productId) return

    if (!reviewRating) {
      setReviewError('Please select a rating from 1 to 5 stars.')
      return
    }

    try {
      setReviewLoading(true)
      setReviewError('')
      setReviewMessage('')

      const result = await reviewService.create({
        orderId: reviewingItem.orderId,
        productId: reviewingItem.productId,
        rating: reviewRating,
        comment: reviewComment
      })

      setOrders(currentOrders =>
        currentOrders.map(order => {
          const orderId = order?._id || order?.id
          if (String(orderId) !== String(reviewingItem.orderId)) return order

          return {
            ...order,
            items: Array.isArray(order.items)
              ? order.items.map(item =>
                  String(item.product) === String(reviewingItem.productId)
                    ? {
                        ...item,
                        reviewSubmitted: true,
                        reviewId: result?.review?._id || result?.data?.review?._id || null,
                        reviewedAt: new Date().toISOString()
                      }
                    : item
                )
              : order.items
          }
        })
      )

      // Refresh products so the latest rating/review count appears immediately
      // on Product Cards and Best-selling/New Arrivals sections.
      await loadProducts()

      setReviewMessage(result?.message || 'Thank you. Your review has been submitted.')

      window.setTimeout(() => {
        setReviewingItem(null)
        setReviewRating(0)
        setReviewComment('')
        setReviewMessage('')
      }, 900)
    } catch (error) {
      console.error('Review submission error:', error)
      setReviewError(
        error?.data?.message ||
        error?.message ||
        'Unable to submit your review. Please try again.'
      )
    } finally {
      setReviewLoading(false)
    }
  }

  // ==========================================================
  // CANCEL ORDER
  // ==========================================================

  const handleCancelOrder = async order => {
    const orderId = order?._id || order?.id

    if (!orderId) return

    if (order.status !== 'pending') {
      window.alert(
        'This order can no longer be cancelled online.\n\nPlease contact Customer Care at customercare@xaaj.in or +91 9899446117.'
      )
      return
    }

    const confirmed = window.confirm(
      `Are you sure you want to cancel Order #${String(orderId).slice(-8).toUpperCase()}?`
    )

    if (!confirmed) return

    try {
      setCancellingOrderId(orderId)
      setOrdersError('')

      const result = await apiRequest(`/orders/${orderId}/cancel`, {
        method: 'PATCH'
      })

      const updatedOrder = result?.data || result?.order

      setOrders(currentOrders =>
        currentOrders.map(item =>
          String(item._id || item.id) === String(orderId)
            ? updatedOrder || { ...item, status: 'cancelled' }
            : item
        )
      )

      window.alert('Order cancelled successfully.')
    } catch (error) {
      console.error('Order cancellation error:', error)

      window.alert(
        error?.message ||
        'Unable to cancel this order. Please contact Customer Care at customercare@xaaj.in or +91 9899446117.'
      )
    } finally {
      setCancellingOrderId('')
    }
  }

  useEffect(() => {
    if (!user) {
      setOrders([])
      return
    }

    let cancelled = false

    async function loadOrders() {
      try {
        setOrdersLoading(true)
        setOrdersError('')

        const result = await orderService.list()
        const orderList = result?.data || result?.orders || []

        if (!cancelled) {
          setOrders(Array.isArray(orderList) ? orderList : [])
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Orders load error:', error)
          setOrdersError(
            error?.message ||
            'Unable to load your orders.'
          )
        }
      } finally {
        if (!cancelled) {
          setOrdersLoading(false)
        }
      }
    }

    loadOrders()

    return () => {
      cancelled = true
    }
  }, [user])

  // ==========================================================
  // PREFILL CHECKOUT FROM SAVED USER ADDRESS
  // ==========================================================

  useEffect(() => {
    if (!user) return

    const savedAddress = user.addresses?.[0]

    if (user.email) setCheckoutEmail(user.email)
    if (user.name && !checkoutName) setCheckoutName(user.name)

    if (savedAddress) {
      if (savedAddress.name && !checkoutName) {
        setCheckoutName(savedAddress.name)
      }
      if (savedAddress.phone && !checkoutPhone) {
        setCheckoutPhone(savedAddress.phone)
      }
      if (savedAddress.line1 && !checkoutAddress) {
        setCheckoutAddress(savedAddress.line1)
      }
      if (savedAddress.city && !checkoutCity) {
        setCheckoutCity(savedAddress.city)
      }
      if (savedAddress.state && !checkoutState) {
        setCheckoutState(savedAddress.state)
      }
      if (savedAddress.postalCode && !checkoutPin) {
        setCheckoutPin(savedAddress.postalCode)
      }
    }
  }, [user])

  // ==========================================================
  // RAZORPAY
  // ==========================================================

  const loadRazorpay = () => new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve()

    const existing = document.querySelector('script[data-razorpay-checkout]')

    if (existing) {
      existing.addEventListener('load', resolve, { once: true })
      existing.addEventListener('error', reject, { once: true })
      return
    }

    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.dataset.razorpayCheckout = 'true'
    script.onload = resolve
    script.onerror = () => reject(new Error('Unable to load Razorpay.'))
    document.body.appendChild(script)
  })

  // ==========================================================
  // CHECKOUT PAYMENT
  // ==========================================================

  const handleCheckoutPayment = async e => {
    e.preventDefault()

    if (isAdminPreview) {
      setPaymentError(
        'Admin Preview Mode: checkout and ordering are disabled.'
      )
      return
    }

    setPaymentError('')

    // --------------------------------------------------------
    // Login required
    // --------------------------------------------------------

    if (!user) {
      navigate('/account')
      return
    }

    // --------------------------------------------------------
    // Cart validation
    // --------------------------------------------------------

    if (!cart.length) {
      setPaymentError('Your cart is empty.')
      return
    }

    // --------------------------------------------------------
    // Checkout validation
    // --------------------------------------------------------

    if (
      !checkoutEmail.trim() ||
      !checkoutName.trim() ||
      !checkoutPhone.trim() ||
      !checkoutAddress.trim() ||
      !checkoutCity.trim() ||
      !checkoutState.trim() ||
      !checkoutPin.trim()
    ) {
      setPaymentError('Please fill in all checkout details.')
      return
    }

    // --------------------------------------------------------
    // Phone validation
    // --------------------------------------------------------

    if (
      checkoutPhone
        .replace(/\D/g, '')
        .length !== 10
    ) {
      setPaymentError(
        'Please enter a valid 10-digit phone number.'
      )
      return
    }

    // --------------------------------------------------------
    // PIN validation
    // --------------------------------------------------------

    if (!/^\d{6}$/.test(checkoutPin.trim())) {
      setPaymentError(
        'Please enter a valid 6-digit PIN code.'
      )
      return
    }

    try {
      setPaymentLoading(true)

      // ======================================================
      // COMMON ORDER DATA
      // ======================================================

      const orderData = {
        items: cart.map(item => ({
          product: item.id,
          quantity: item.qty || 1
        })),

        paymentMethod,

        shippingAddress: {
          name: checkoutName.trim(),
          email: checkoutEmail.trim().toLowerCase(),
          phone: checkoutPhone.trim(),
          address: checkoutAddress.trim(),
          city: checkoutCity.trim(),
          state: checkoutState.trim(),
          pin: checkoutPin.trim()
        }
      }

      // ======================================================
      // CASH ON DELIVERY
      // ======================================================

      if (paymentMethod === 'cod') {
        const orderResult = await apiRequest(
          '/orders',
          {
            method: 'POST',
            body: JSON.stringify(orderData)
          }
        )

        if (!orderResult?.success) {
          throw new Error(
            orderResult?.message ||
            'Unable to place COD order.'
          )
        }

        // Save latest order for confirmation page.
        window.sessionStorage.setItem(
          'xaaj-payment-success',
          'true'
        )

        window.sessionStorage.setItem(
          'xaaj-last-order',
          JSON.stringify(orderResult.data)
        )

        // Clear cart only after the COD order is successfully created.
        clearCart()

        navigate('/order-confirmation')
        return
      }

      // ======================================================
      // ONLINE PAYMENT - RAZORPAY
      // ======================================================

      await loadRazorpay()

      const orderResult = await apiRequest(
        '/payment/create-order',
        {
          method: 'POST',
          body: JSON.stringify({
            ...orderData,
            paymentMethod: 'razorpay'
          })
        }
      )

      const razorpayOrder = orderResult?.data

      if (
        !razorpayOrder?.id ||
        !razorpayOrder?.keyId
      ) {
        throw new Error(
          orderResult?.message ||
          'Unable to create Razorpay order.'
        )
      }

      // ======================================================
      // RAZORPAY OPTIONS
      // ======================================================

      const options = {
        key: razorpayOrder.keyId,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency || 'INR',
        name: 'XAAJ',
        description: 'XAAJ Store Order',
        order_id: razorpayOrder.id,

        prefill: {
          name: checkoutName.trim(),
          email: checkoutEmail.trim().toLowerCase(),
          contact: checkoutPhone.trim()
        },

        notes: {
          address: checkoutAddress.trim(),
          city: checkoutCity.trim(),
          state: checkoutState.trim(),
          pin: checkoutPin.trim()
        },

        theme: {
          color: '#2b2a27'
        },

        // ====================================================
        // PAYMENT SUCCESS
        // ====================================================

        handler: async response => {
          try {
            const verifyResult = await apiRequest(
              '/payment/verify',
              {
                method: 'POST',
                body: JSON.stringify(response)
              }
            )

            if (!verifyResult?.success) {
              throw new Error(
                verifyResult?.message ||
                'Payment verification failed.'
              )
            }

            window.sessionStorage.setItem(
              'xaaj-payment-success',
              'true'
            )

            window.sessionStorage.setItem(
              'xaaj-last-order',
              JSON.stringify(verifyResult.data)
            )

            // Clear cart only after Razorpay payment is verified successfully.
            clearCart()

            navigate('/order-confirmation')
          } catch (verifyError) {
            console.error(
              'Payment verification error:',
              verifyError
            )

            setPaymentError(
              verifyError?.message ||
              'Payment verification failed. Please contact support.'
            )
          } finally {
            setPaymentLoading(false)
          }
        },

        // ====================================================
        // RAZORPAY MODAL CLOSED
        // ====================================================

        modal: {
          ondismiss: () => {
            setPaymentLoading(false)
          }
        }
      }

      // ======================================================
      // OPEN RAZORPAY
      // ======================================================

      const razorpay = new window.Razorpay(options)

      // ======================================================
      // PAYMENT FAILED
      // ======================================================

      razorpay.on(
        'payment.failed',
        response => {
          console.error(
            'Razorpay payment failed:',
            response?.error
          )

          setPaymentError(
            response?.error?.description ||
            'Payment failed. Please try again.'
          )

          setPaymentLoading(false)
        }
      )

      razorpay.open()
    } catch (paymentErr) {
      console.error(
        'Checkout error:',
        paymentErr
      )

      setPaymentError(
        paymentErr?.message ||
        'Unable to process your order. Please try again.'
      )

      setPaymentLoading(false)
    }
  }

  // ==========================================================
  // LOGIN
  // ==========================================================

  const handleLogin = async e => {
    e.preventDefault()
    setError('')

    if (!email.trim() || !password) {
      setError('Please enter your email and password.')
      return
    }

    try {
      setLoading(true)

      const result = await login(email.trim(), password)

      if (!result?.success) {
        if (result?.requiresEmailVerification) {
          setOtpEmail(result.email || email.trim())
          setOtp('')
          setOtpError('')
          setOtpMessage('Please verify your email before signing in.')
          navigate(
            `/verify-email?email=${encodeURIComponent(
              result.email || email.trim()
            )}`
          )
          return
        }

        setError(
          result?.message ||
          'Invalid email or password.'
        )
        return
      }

      if (result?.requiresEmailVerification) {
        const verificationEmail =
          result.email || email.trim()

        setOtpEmail(verificationEmail)
        setOtp('')
        setOtpError('')
        setOtpMessage('Please verify your email first.')

        navigate(
          `/verify-email?email=${encodeURIComponent(
            verificationEmail
          )}`
        )

        return
      }

      const loggedInUser = result?.user || null

      if (loggedInUser?.role === 'admin') {
        // Replace /account in browser history so
        // Back does not return to the customer account page.
        navigate('/admin', { replace: true })
      } else {
        navigate('/', { replace: true })
      }
    } catch (err) {
      console.error('Login error:', err)

      setError(
        err?.message ||
        'Unable to login. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  // ==========================================================
  // REGISTER
  // ==========================================================

  const handleRegister = async e => {
    e.preventDefault()
    setRegisterError('')

    if (
      !registerName.trim() ||
      !registerEmail.trim() ||
      !registerPassword ||
      !registerPhone.trim() ||
      !registerAddress.trim() ||
      !registerCity.trim() ||
      !registerState.trim() ||
      !registerPin.trim()
    ) {
      setRegisterError('Please fill in all registration details.')
      return
    }

    if (registerPassword.length < 8) {
      setRegisterError(
        'Password must be at least 8 characters.'
      )
      return
    }

    if (registerPhone.replace(/\D/g, '').length < 7 || registerPhone.replace(/\D/g, '').length > 15) {
      setRegisterError('Please enter a valid phone number, including area code.')
      return
    }

    if (!/^\d{6}$/.test(registerPin)) {
      setRegisterError('PIN code must be 6 digits.')
      return
    }

    try {
      setRegisterLoading(true)

      const result = await register({
        name: registerName.trim(),
        email: registerEmail.trim(),
        password: registerPassword,
        phone: `${registerCountryCode === '+1-CA' ? '+1' : registerCountryCode}${registerPhone.trim()}`,
        address: registerAddress.trim(),
        city: registerCity.trim(),
        state: registerState.trim(),
        pin: registerPin.trim()
      })

      if (!result?.success) {
        setRegisterError(
          result?.message ||
          'Unable to create your account.'
        )
        return
      }

      const verificationEmail =
        result.email || registerEmail.trim()

      setOtpEmail(verificationEmail)
      setOtp('')
      setOtpError('')
      setOtpMessage(
        'We sent a 6-digit verification code to your email. It is valid for 10 minutes.'
      )

      navigate(
        `/verify-email?email=${encodeURIComponent(
          verificationEmail
        )}`
      )
    } catch (err) {
      console.error('Registration error:', err)

      setRegisterError(
        err?.message ||
        'Unable to create your account. Please try again.'
      )
    } finally {
      setRegisterLoading(false)
    }
  }

  // ==========================================================
  // VERIFY EMAIL OTP
  // ==========================================================

  const handleVerifyEmail = async e => {
    e.preventDefault()
    setOtpError('')
    setOtpMessage('')

    const verificationEmail =
      otpEmail.trim() ||
      new URLSearchParams(location.search).get('email') ||
      ''

    if (!verificationEmail) {
      setOtpError('Email address is required.')
      return
    }

    if (!/^\d{6}$/.test(otp)) {
      setOtpError('Please enter the 6-digit OTP.')
      return
    }

    try {
      setOtpLoading(true)

      const result = await verifyEmail(
        verificationEmail,
        otp
      )

      if (!result?.success) {
        setOtpError(
          result?.message ||
          'Invalid or expired OTP.'
        )
        return
      }

      // Backend returns a token and user after verification.
      // AuthContext saves both and logs the user in.
      navigate('/')
    } catch (err) {
      console.error(
        'Email verification error:',
        err
      )

      setOtpError(
        err?.message ||
        'Unable to verify email. Please try again.'
      )
    } finally {
      setOtpLoading(false)
    }
  }

  // ==========================================================
  // RESEND OTP
  // ==========================================================

  const handleResendOtp = async () => {
    setOtpError('')
    setOtpMessage('')

    const verificationEmail =
      otpEmail.trim() ||
      new URLSearchParams(location.search).get('email') ||
      ''

    if (!verificationEmail) {
      setOtpError('Email address is required.')
      return
    }

    try {
      setOtpResending(true)

      const result = await resendVerification(
        verificationEmail
      )

      if (!result?.success) {
        setOtpError(
          result?.message ||
          'Unable to resend OTP.'
        )
        return
      }

      setOtpMessage(
        'A new OTP has been sent to your email. It is valid for 10 minutes.'
      )
    } catch (err) {
      console.error('Resend OTP error:', err)

      setOtpError(
        err?.message ||
        'Unable to resend OTP. Please try again.'
      )
    } finally {
      setOtpResending(false)
    }
  }

  // ==========================================================
  // FORGOT PASSWORD - SEND OTP
  // ==========================================================

  const handleForgotPassword = async e => {
    e.preventDefault()
    setResetError('')
    setResetMessage('')

    const emailValue = resetEmail.trim().toLowerCase()

    if (!emailValue) {
      setResetError('Please enter your email address.')
      return
    }

    try {
      setResetLoading(true)

      const result = await forgotPassword(emailValue)

      if (!result?.success) {
        setResetError(
          result?.message ||
          'Unable to send password reset OTP.'
        )
        return
      }

      setResetEmail(emailValue)
      setResetOtp('')
      setResetToken('')
      window.sessionStorage.removeItem('xaaj-reset-token')

      setResetMessage(
        'If the account exists, a 6-digit OTP has been sent to your email. It is valid for 10 minutes.'
      )

      navigate(
        `/reset-password?email=${encodeURIComponent(emailValue)}`
      )
    } catch (err) {
      console.error(
        'Forgot password error:',
        err
      )

      setResetError(
        err?.message ||
        'Unable to send password reset OTP. Please try again.'
      )
    } finally {
      setResetLoading(false)
    }
  }


  // ==========================================================
  // VERIFY PASSWORD RESET OTP
  // ==========================================================

  const handleVerifyResetOtp = async e => {
    e.preventDefault()
    setResetError('')
    setResetMessage('')

    const emailValue =
      resetEmail.trim() ||
      new URLSearchParams(location.search).get('email') ||
      ''

    if (!emailValue) {
      setResetError('Email address is required.')
      return
    }

    if (!/^\d{6}$/.test(resetOtp)) {
      setResetError('Please enter the 6-digit OTP.')
      return
    }

    try {
      setResetLoading(true)

      const result = await verifyResetOtp(
        emailValue,
        resetOtp
      )

      if (!result?.success || !result?.resetToken) {
        setResetError(
          result?.message ||
          'Invalid or expired OTP.'
        )
        return
      }

      setResetEmail(emailValue)
      setResetToken(result.resetToken)

      window.sessionStorage.setItem(
        'xaaj-reset-token',
        result.resetToken
      )

      setResetOtp('')
      setResetMessage(
        'OTP verified. Please create your new password.'
      )
    } catch (err) {
      console.error(
        'Reset OTP verification error:',
        err
      )

      setResetError(
        err?.message ||
        'Unable to verify OTP. Please try again.'
      )
    } finally {
      setResetLoading(false)
    }
  }


  // ==========================================================
  // SAVE NEW PASSWORD
  // ==========================================================

  const handleResetPassword = async e => {
    e.preventDefault()
    setResetError('')
    setResetMessage('')

    const emailValue =
      resetEmail.trim() ||
      new URLSearchParams(location.search).get('email') ||
      ''

    const tokenValue =
      resetToken ||
      window.sessionStorage.getItem('xaaj-reset-token') ||
      ''

    if (!emailValue || !tokenValue) {
      setResetError(
        'Your password reset session is missing. Please request a new OTP.'
      )
      return
    }

    if (resetPasswordValue.length < 8) {
      setResetError(
        'Password must be at least 8 characters.'
      )
      return
    }

    if (
      resetPasswordValue !==
      resetConfirmPassword
    ) {
      setResetError(
        'Passwords do not match.'
      )
      return
    }

    try {
      setResetLoading(true)

      const result = await resetPassword(
        emailValue,
        tokenValue,
        resetPasswordValue,
        resetConfirmPassword
      )

      if (!result?.success) {
        setResetError(
          result?.message ||
          'Unable to reset your password.'
        )
        return
      }

      window.sessionStorage.removeItem(
        'xaaj-reset-token'
      )

      setResetToken('')
      setResetOtp('')
      setResetPasswordValue('')
      setResetConfirmPassword('')
      setResetMessage(
        'Password updated successfully. You can now login.'
      )

      setEmail(emailValue)
      setPassword('')

      navigate('/account')
    } catch (err) {
      console.error(
        'Reset password error:',
        err
      )

      setResetError(
        err?.message ||
        'Unable to reset your password. Please try again.'
      )
    } finally {
      setResetLoading(false)
    }
  }


  // ==========================================================
  // BLOG
  // ==========================================================

  if (path === '/blog') {
    return <BlogPage />
  }

  if (path.startsWith('/blog/')) {
    const blogSlug = decodeURIComponent(
      path.slice('/blog/'.length)
    )

    return <BlogArticle slug={blogSlug} />
  }

  // ==========================================================
  // ADMIN
  // ==========================================================

  if (path === '/admin') {
    return <Admin />
  }

  // ==========================================================
  // SHOP
  // ==========================================================

  if (path === '/shop') {
    return <Shop />
  }

  // ==========================================================
  // PRODUCT DETAILS
  // ==========================================================

  if (path.startsWith('/product/')) {
    return <Product />
  }

  // ==========================================================
  // CART
  // ==========================================================

  if (path === '/cart') {
    return <Cart />
  }

  // ==========================================================
  // WISHLIST
  // ==========================================================

  if (path === '/wishlist') {
    return <Cart wishlist />
  }

  // ==========================================================
  // ==========================================================
  // ABOUT US — PREMIUM BRAND EXPERIENCE
  // ==========================================================

  if (path === '/about') {
    return (
      <>
        <Header />

        <style>{`
          .xaaj-about {
            --ink: #25231f;
            --muted: #756f66;
            --paper: #f5f1e9;
            --paper-2: #ebe5da;
            --line: rgba(37,35,31,.14);
            --accent: #a84d35;
            background: var(--paper);
            color: var(--ink);
            overflow: hidden;
          }

          .xaaj-about *,
          .xaaj-about *::before,
          .xaaj-about *::after {
            box-sizing: border-box;
          }

          /* ================= HERO ================= */

          .xaaj-about-hero {
            width: min(1380px, calc(100% - 32px));
            min-height: 720px;
            margin: 16px auto 0;
            display: grid;
            grid-template-columns: .84fr 1.16fr;
            background: #e9e1d5;
            overflow: hidden;
          }

          .xaaj-about-hero-copy {
            position: relative;
            display: flex;
            flex-direction: column;
            justify-content: center;
            padding: 74px clamp(34px, 6vw, 92px);
          }

          .xaaj-about-eyebrow {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 28px;
            color: var(--accent);
            font-size: 10px;
            font-weight: 700;
            letter-spacing: .28em;
            text-transform: uppercase;
          }

          .xaaj-about-eyebrow::before {
            content: '';
            width: 30px;
            height: 1px;
            background: currentColor;
          }

          .xaaj-about-hero h1 {
            max-width: 620px;
            margin: 0;
            font-family: Georgia, 'Times New Roman', serif;
            font-size: clamp(55px, 6.5vw, 94px);
            font-weight: 400;
            line-height: .91;
            letter-spacing: -.06em;
          }

          .xaaj-about-hero h1 em {
            color: var(--accent);
            font-style: italic;
          }

          .xaaj-about-hero-description {
            max-width: 475px;
            margin: 31px 0 0;
            color: #666057;
            font-size: 14px;
            line-height: 1.9;
          }

          .xaaj-about-hero-link {
            display: inline-flex;
            align-items: center;
            gap: 9px;
            width: fit-content;
            margin-top: 32px;
            padding-bottom: 9px;
            border-bottom: 1px solid var(--ink);
            color: var(--ink);
            text-decoration: none;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: .12em;
            text-transform: uppercase;
          }

          .xaaj-about-hero-link svg {
            transition: transform .25s ease;
          }

          .xaaj-about-hero-link:hover svg {
            transform: translateX(4px);
          }

          .xaaj-about-hero-number {
            position: absolute;
            right: 30px;
            bottom: 25px;
            color: rgba(37,35,31,.20);
            font-family: Georgia, 'Times New Roman', serif;
            font-size: 74px;
            line-height: 1;
          }

          .xaaj-about-hero-visual {
            position: relative;
            min-height: 720px;
            overflow: hidden;
          }

          .xaaj-about-hero-visual img {
            width: 100%;
            height: 100%;
            display: block;
            object-fit: cover;
            object-position: center;
            filter: saturate(.82);
            transition: transform 1.2s cubic-bezier(.22,1,.36,1);
          }

          .xaaj-about-hero:hover .xaaj-about-hero-visual img {
            transform: scale(1.035);
          }

          .xaaj-about-hero-badge {
            position: absolute;
            left: 28px;
            bottom: 28px;
            width: 112px;
            height: 112px;
            display: grid;
            place-items: center;
            border: 1px solid rgba(255,255,255,.58);
            border-radius: 50%;
            background: rgba(37,35,31,.78);
            color: #fff;
            text-align: center;
            font-size: 8px;
            line-height: 1.55;
            letter-spacing: .14em;
            text-transform: uppercase;
            backdrop-filter: blur(7px);
          }

          .xaaj-about-hero-badge strong {
            display: block;
            margin-bottom: 2px;
            font-family: Georgia, 'Times New Roman', serif;
            font-size: 20px;
            font-weight: 400;
            letter-spacing: 0;
          }

          /* ================= INTRO ================= */

          .xaaj-about-intro {
            width: min(1180px, calc(100% - 42px));
            margin: 0 auto;
            padding: 125px 0 118px;
            display: grid;
            grid-template-columns: .55fr 1.45fr;
            gap: 55px;
          }

          .xaaj-about-section-label {
            padding-top: 8px;
            color: var(--accent);
            font-size: 9px;
            font-weight: 700;
            letter-spacing: .25em;
            text-transform: uppercase;
          }

          .xaaj-about-intro h2 {
            max-width: 870px;
            margin: 0;
            font-family: Georgia, 'Times New Roman', serif;
            font-size: clamp(40px, 5.4vw, 72px);
            font-weight: 400;
            line-height: .99;
            letter-spacing: -.055em;
          }

          .xaaj-about-intro h2 em {
            font-style: italic;
          }

          .xaaj-about-intro-text {
            max-width: 620px;
            margin-top: 30px;
            color: var(--muted);
            font-size: 15px;
            line-height: 1.9;
          }

          .xaaj-about-stat-row {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            margin-top: 52px;
            border-top: 1px solid var(--line);
            border-bottom: 1px solid var(--line);
          }

          .xaaj-about-stat {
            padding: 24px 22px 25px 0;
            border-right: 1px solid var(--line);
          }

          .xaaj-about-stat:not(:first-child) {
            padding-left: 22px;
          }

          .xaaj-about-stat:last-child {
            border-right: 0;
          }

          .xaaj-about-stat strong {
            display: block;
            font-family: Georgia, 'Times New Roman', serif;
            font-size: 25px;
            font-weight: 400;
          }

          .xaaj-about-stat span {
            display: block;
            margin-top: 7px;
            color: #817a70;
            font-size: 10px;
            line-height: 1.55;
            letter-spacing: .08em;
            text-transform: uppercase;
          }

          /* ================= STORY IMAGE STRIP ================= */

          .xaaj-about-story {
            background: var(--ink);
            color: #fff;
            padding: 0;
          }

          .xaaj-about-story-grid {
            width: min(1380px, 100%);
            margin: 0 auto;
            display: grid;
            grid-template-columns: 1.08fr .92fr;
            min-height: 690px;
          }

          .xaaj-about-story-image {
            min-height: 690px;
            overflow: hidden;
          }

          .xaaj-about-story-image img {
            width: 100%;
            height: 100%;
            display: block;
            object-fit: cover;
            filter: saturate(.75);
          }

          .xaaj-about-story-copy {
            display: flex;
            flex-direction: column;
            justify-content: center;
            padding: 80px clamp(38px, 7vw, 100px);
          }

          .xaaj-about-story-copy .xaaj-about-section-label {
            color: #d58b76;
          }

          .xaaj-about-story-copy h2 {
            max-width: 590px;
            margin: 22px 0 0;
            font-family: Georgia, 'Times New Roman', serif;
            font-size: clamp(42px, 5vw, 68px);
            font-weight: 400;
            line-height: .98;
            letter-spacing: -.055em;
          }

          .xaaj-about-story-copy h2 em {
            font-style: italic;
          }

          .xaaj-about-story-copy p {
            max-width: 530px;
            margin: 27px 0 0;
            color: rgba(255,255,255,.61);
            font-size: 14px;
            line-height: 1.9;
          }

          .xaaj-about-story-signature {
            margin-top: 38px;
            color: rgba(255,255,255,.38);
            font-family: Georgia, 'Times New Roman', serif;
            font-size: 22px;
            font-style: italic;
          }

          /* ================= VALUES ================= */

          .xaaj-about-values {
            width: min(1180px, calc(100% - 42px));
            margin: 0 auto;
            padding: 125px 0 130px;
          }

          .xaaj-about-values-head {
            display: flex;
            justify-content: space-between;
            align-items: end;
            gap: 50px;
            padding-bottom: 48px;
            border-bottom: 1px solid var(--line);
          }

          .xaaj-about-values h2 {
            max-width: 760px;
            margin: 18px 0 0;
            font-family: Georgia, 'Times New Roman', serif;
            font-size: clamp(43px, 5.5vw, 73px);
            font-weight: 400;
            line-height: .97;
            letter-spacing: -.055em;
          }

          .xaaj-about-values-head p {
            max-width: 250px;
            margin: 0;
            color: var(--muted);
            font-size: 12px;
            line-height: 1.75;
          }

          .xaaj-about-value-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
          }

          .xaaj-about-value {
            position: relative;
            min-height: 280px;
            padding: 30px 38px 25px 0;
            border-right: 1px solid var(--line);
          }

          .xaaj-about-value:not(:first-child) {
            padding-left: 38px;
          }

          .xaaj-about-value:last-child {
            border-right: 0;
          }

          .xaaj-about-value-number {
            color: var(--accent);
            font-size: 9px;
            font-weight: 700;
            letter-spacing: .2em;
          }

          .xaaj-about-value h3 {
            margin: 80px 0 11px;
            font-family: Georgia, 'Times New Roman', serif;
            font-size: 27px;
            font-weight: 400;
          }

          .xaaj-about-value p {
            max-width: 270px;
            margin: 0;
            color: var(--muted);
            font-size: 13px;
            line-height: 1.8;
          }

          /* ================= CTA ================= */

          .xaaj-about-cta {
            position: relative;
            padding: 120px 20px 130px;
            background: #e8e0d4;
            text-align: center;
            overflow: hidden;
          }

          .xaaj-about-cta::before {
            content: 'XAAJ';
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -53%);
            color: rgba(37,35,31,.045);
            font-family: Georgia, 'Times New Roman', serif;
            font-size: clamp(150px, 27vw, 400px);
            line-height: 1;
            white-space: nowrap;
            pointer-events: none;
          }

          .xaaj-about-cta-inner {
            position: relative;
            z-index: 1;
          }

          .xaaj-about-cta h2 {
            max-width: 850px;
            margin: 20px auto 0;
            font-family: Georgia, 'Times New Roman', serif;
            font-size: clamp(48px, 6.3vw, 84px);
            font-weight: 400;
            line-height: .94;
            letter-spacing: -.06em;
          }

          .xaaj-about-cta h2 em {
            color: var(--accent);
            font-style: italic;
          }

          .xaaj-about-cta p {
            max-width: 500px;
            margin: 25px auto 0;
            color: var(--muted);
            font-size: 13px;
            line-height: 1.8;
          }

          .xaaj-about-cta-links {
            display: flex;
            justify-content: center;
            flex-wrap: wrap;
            gap: 9px;
            margin-top: 34px;
          }

          .xaaj-about-cta-links a {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-height: 46px;
            padding: 0 20px;
            border: 1px solid rgba(37,35,31,.22);
            border-radius: 999px;
            color: var(--ink);
            text-decoration: none;
            font-size: 10px;
            font-weight: 700;
            letter-spacing: .08em;
            text-transform: uppercase;
            transition: .25s ease;
          }

          .xaaj-about-cta-links a:hover {
            background: var(--ink);
            border-color: var(--ink);
            color: #fff;
            transform: translateY(-2px);
          }

          /* ================= MOBILE ================= */

          @media (max-width: 800px) {
            .xaaj-about-hero {
              width: calc(100% - 20px);
              margin-top: 10px;
              min-height: auto;
              grid-template-columns: 1fr;
            }

            .xaaj-about-hero-copy {
              min-height: 520px;
              padding: 65px 28px 55px;
            }

            .xaaj-about-hero h1 {
              font-size: clamp(51px, 15vw, 70px);
            }

            .xaaj-about-hero-visual {
              min-height: 430px;
            }

            .xaaj-about-hero-badge {
              left: 20px;
              bottom: 20px;
            }

            .xaaj-about-intro {
              width: calc(100% - 30px);
              padding: 78px 0 75px;
              grid-template-columns: 1fr;
              gap: 28px;
            }

            .xaaj-about-intro h2 {
              font-size: clamp(40px, 12vw, 55px);
            }

            .xaaj-about-stat-row {
              grid-template-columns: 1fr;
            }

            .xaaj-about-stat,
            .xaaj-about-stat:not(:first-child) {
              padding: 20px 0;
              border-right: 0;
              border-bottom: 1px solid var(--line);
            }

            .xaaj-about-stat:last-child {
              border-bottom: 0;
            }

            .xaaj-about-story-grid {
              grid-template-columns: 1fr;
            }

            .xaaj-about-story-image {
              min-height: 480px;
            }

            .xaaj-about-story-copy {
              min-height: 560px;
              padding: 72px 28px;
            }

            .xaaj-about-story-copy h2 {
              font-size: clamp(42px, 12vw, 56px);
            }

            .xaaj-about-values {
              width: calc(100% - 30px);
              padding: 78px 0 82px;
            }

            .xaaj-about-values-head {
              display: block;
            }

            .xaaj-about-values-head p {
              margin-top: 25px;
            }

            .xaaj-about-value-grid {
              grid-template-columns: 1fr;
            }

            .xaaj-about-value,
            .xaaj-about-value:not(:first-child) {
              min-height: auto;
              padding: 27px 0 32px;
              border-right: 0;
              border-bottom: 1px solid var(--line);
            }

            .xaaj-about-value:last-child {
              border-bottom: 0;
            }

            .xaaj-about-value h3 {
              margin-top: 35px;
            }

            .xaaj-about-cta {
              padding: 82px 18px 90px;
            }
          }
        `}</style>

        <main className="xaaj-about">

          {/* HERO */}
          <section className="xaaj-about-hero">

            <div className="xaaj-about-hero-copy">
              <span className="xaaj-about-eyebrow">
                The XAAJ story
              </span>

              <h1>
                Everyday
                <br />
                objects,
                <br />
                <em>beautifully lived.</em>
              </h1>

              <p className="xaaj-about-hero-description">
                We believe the objects around your table should
                bring a little more warmth to ordinary moments.
                XAAJ creates thoughtful crockery for the way
                people actually live, gather and celebrate.
              </p>

              <Link className="xaaj-about-hero-link" to="/shop">
                Explore the collection
                <ArrowRight size={14} />
              </Link>

              <span className="xaaj-about-hero-number">
                01
              </span>
            </div>

            <div className="xaaj-about-hero-visual">
              <img
                src={heroImage}
                alt="XAAJ tableware arranged on a warm dining table"
              />

              <div className="xaaj-about-hero-badge">
                <div>
                  <strong>XAAJ</strong>
                  Made for
                  <br />
                  everyday rituals
                </div>
              </div>
            </div>

          </section>

          {/* PHILOSOPHY */}
          <section className="xaaj-about-intro">

            <div className="xaaj-about-section-label">
              02 — Our philosophy
            </div>

            <div>
              <h2>
                The everyday deserves
                <em> beautiful things.</em>
              </h2>

              <p className="xaaj-about-intro-text">
                XAAJ began with a simple idea: beauty should not
                be reserved for special occasions. From the first
                cup of tea in the morning to a table shared with
                people you love, the pieces we use every day
                can make ordinary rituals feel meaningful.
              </p>

              <div className="xaaj-about-stat-row">

                <div className="xaaj-about-stat">
                  <strong>01</strong>
                  <span>Thoughtful design</span>
                </div>

                <div className="xaaj-about-stat">
                  <strong>02</strong>
                  <span>Indian craft</span>
                </div>

                <div className="xaaj-about-stat">
                  <strong>03</strong>
                  <span>Made to be lived with</span>
                </div>

              </div>
            </div>

          </section>

          {/* STORY */}
          <section className="xaaj-about-story">

            <div className="xaaj-about-story-grid">

              <div className="xaaj-about-story-image">
                <img
                  src={tableImage}
                  alt="Warm table setting with handcrafted crockery"
                />
              </div>

              <div className="xaaj-about-story-copy">

                <span className="xaaj-about-section-label">
                  03 — The XAAJ way
                </span>

                <h2>
                  For morning tea,
                  <br />
                  long lunches &
                  <br />
                  <em>everything between.</em>
                </h2>

                <p>
                  We work with makers and draw inspiration from
                  the textures, colours and quiet character of
                  Indian craft. Our collections are designed
                  to feel contemporary while still carrying
                  a sense of warmth and familiarity.
                </p>

                <p>
                  Small variations in colour, texture and form
                  are part of the charm. They are little reminders
                  that the objects on your table have a human story.
                </p>

                <div className="xaaj-about-story-signature">
                  — with care, XAAJ
                </div>

              </div>

            </div>

          </section>

          {/* VALUES */}
          <section className="xaaj-about-values">

            <div className="xaaj-about-values-head">

              <div>
                <span className="xaaj-about-section-label">
                  04 — What we believe
                </span>

                <h2>
                  Less clutter.
                  <br />
                  More <em>meaning.</em>
                </h2>
              </div>

              <p>
                Every collection starts with the same question:
                will this make the everyday table feel a little
                more special?
              </p>

            </div>

            <div className="xaaj-about-value-grid">

              <div className="xaaj-about-value">
                <span className="xaaj-about-value-number">
                  01
                </span>

                <h3>
                  Craft over clutter
                </h3>

                <p>
                  Thoughtful pieces that earn their place
                  at your table.
                </p>
              </div>

              <div className="xaaj-about-value">
                <span className="xaaj-about-value-number">
                  02
                </span>

                <h3>
                  Beauty with purpose
                </h3>

                <p>
                  Form, texture and function working together
                  naturally.
                </p>
              </div>

              <div className="xaaj-about-value">
                <span className="xaaj-about-value-number">
                  03
                </span>

                <h3>
                  Made to keep
                </h3>

                <p>
                  Objects you reach for often, share freely
                  and enjoy for years.
                </p>
              </div>

            </div>

          </section>

          {/* CTA */}
          <section className="xaaj-about-cta">

            <div className="xaaj-about-cta-inner">

              <span className="xaaj-about-section-label">
                05 — Come say hello
              </span>

              <h2>
                Your table tells a story.
                <br />
                <em>Make it yours.</em>
              </h2>

              <p>
                Questions about an order, a product or simply
                want to say hello? Our team is always happy to help.
              </p>

              <div className="xaaj-about-cta-links">

                <a href="mailto:customercare@xaaj.in">
                  Email us
                </a>

                <a href="tel:+919899446117">
                  +91 9899446117
                </a>

                <Link to="/contact">
                  Contact us
                  <ArrowRight
                    size={13}
                    style={{ marginLeft: 7 }}
                  />
                </Link>

              </div>

            </div>

          </section>

        </main>

        <Newsletter />
        <Footer />
      </>
    )
  }


  // ==========================================================
  // CHECKOUT
  // ==========================================================

  if (path === '/checkout') {

    if (isAdminPreview) {
      return (
        <SimplePage
          eyebrow="Admin Preview Mode"
          title="Checkout is disabled."
        >
          <p className="lead">
            You are viewing the XAAJ storefront from the
            Admin Live Store preview. Product purchasing,
            checkout and payment are disabled in this mode.
          </p>

          <Button
            to="/"
            onClick={() => {
              window.sessionStorage.removeItem(
                'xaaj-admin-preview'
              )
            }}
          >
            Back to store
          </Button>
        </SimplePage>
      )
    }

    // Checkout requires login.
    if (!user) {
      return (
        <SimplePage
          eyebrow="Sign in required"
          title="Please sign in to checkout."
        >
          <p className="lead">
            Your cart is saved. Sign in to continue
            securely with your order and saved address.
          </p>

          <Button to="/account">
            Sign in to continue
          </Button>
        </SimplePage>
      )
    }

    return (
      <SimplePage
        eyebrow="Almost home"
        title="Checkout"
      >
        <form
          className="checkout-form"
          onSubmit={handleCheckoutPayment}
        >

          <input
            value={checkoutEmail}
            onChange={e => setCheckoutEmail(e.target.value)}
            placeholder="Email address"
            type="email"
            autoComplete="email"
            required
          />

          <input
            value={checkoutName}
            onChange={e => setCheckoutName(e.target.value)}
            placeholder="Full name"
            autoComplete="name"
            required
          />

          <input
            value={checkoutPhone}
            onChange={e =>
              setCheckoutPhone(
                e.target.value.replace(/\D/g, '').slice(0, 10)
              )
            }
            placeholder="Phone number"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            required
          />

          <input
            value={checkoutAddress}
            onChange={e => setCheckoutAddress(e.target.value)}
            placeholder="Full address"
            autoComplete="street-address"
            required
          />

          <div>
            <input
              value={checkoutCity}
              onChange={e => setCheckoutCity(e.target.value)}
              placeholder="City"
              autoComplete="address-level2"
              required
            />

            <input
              value={checkoutState}
              onChange={e => setCheckoutState(e.target.value)}
              placeholder="State"
              autoComplete="address-level1"
              required
            />
          </div>

          <input
            value={checkoutPin}
            onChange={e =>
              setCheckoutPin(
                e.target.value.replace(/\D/g, '').slice(0, 6)
              )
            }
            placeholder="PIN code"
            inputMode="numeric"
            autoComplete="postal-code"
            required
          />

          {/* ==========================================================
              PAYMENT METHOD
          ========================================================== */}

          <div className="checkout-payment-method">

            <h3>
              Payment Method
            </h3>

            {/* Online Payment */}
            <label
              className={`payment-option ${
                paymentMethod === 'razorpay'
                  ? 'selected'
                  : ''
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value="razorpay"
                checked={
                  paymentMethod === 'razorpay'
                }
                onChange={() =>
                  setPaymentMethod('razorpay')
                }
              />

              <span>
                <strong>
                  Online Payment
                </strong>

                <small>
                  Pay securely using Razorpay
                </small>
              </span>
            </label>

            {/* Cash on Delivery */}
            <label
              className={`payment-option ${
                paymentMethod === 'cod'
                  ? 'selected'
                  : ''
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value="cod"
                checked={
                  paymentMethod === 'cod'
                }
                onChange={() =>
                  setPaymentMethod('cod')
                }
              />

              <span>
                <strong>
                  Cash on Delivery
                </strong>

                <small>
                  Pay when your order is delivered
                </small>
              </span>
            </label>

          </div>

          {paymentError && (
            <p style={{ color: '#b42318', margin: '0' }}>
              {paymentError}
            </p>
          )}

          <button
            type="submit"
            className="button"
            disabled={paymentLoading}
          >
            {paymentLoading
              ? paymentMethod === 'cod'
                ? 'Placing Order...'
                : 'Opening Razorpay...'
              : paymentMethod === 'cod'
                ? 'Place Order - COD'
                : 'Pay securely'}
            <ArrowRight size={15} />
          </button>

        </form>
      </SimplePage>
    )
  }

  // ==========================================================
  // ORDER CONFIRMATION
  // ==========================================================

  if (path === '/order-confirmation') {
    return (
      <SimplePage
        eyebrow="Thank you"
        title="Your order is on its way."
      >
        <p className="lead">
          We have sent a confirmation to your email.
          Your pieces will be carefully packed
          and dispatched soon.
        </p>

        <Button to="/shop">
          Continue shopping
        </Button>
      </SimplePage>
    )
  }

  // ==========================================================
  // EMAIL VERIFICATION
  // ==========================================================

  if (path === '/verify-email') {

    const queryEmail =
      new URLSearchParams(location.search).get('email') || ''

    const verificationEmail =
      otpEmail || queryEmail

    return (
      <SimplePage
        eyebrow="Email verification"
        title="Verify your email."
      >
        <p className="lead">
          Enter the 6-digit OTP sent to{' '}
          <strong>{verificationEmail || 'your email'}</strong>.
          The OTP is valid for 10 minutes.
        </p>

        <form
          className="checkout-form"
          onSubmit={handleVerifyEmail}
        >

          <input
            value={verificationEmail}
            onChange={e => {
              setOtpEmail(e.target.value)
            }}
            type="email"
            placeholder="Email address"
            autoComplete="email"
            required
          />

          <input
            value={otp}
            onChange={e =>
              setOtp(
                e.target.value.replace(/\D/g, '').slice(0, 6)
              )
            }
            placeholder="6-digit OTP"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            required
          />

          {otpError && (
            <p style={{ color: '#b42318', margin: '0' }}>
              {otpError}
            </p>
          )}

          {otpMessage && (
            <p style={{ margin: '0' }}>
              {otpMessage}
            </p>
          )}

          <button
            type="submit"
            className="button"
            disabled={otpLoading}
          >
            {otpLoading
              ? 'Verifying...'
              : 'Verify email'}
            <ArrowRight size={15} />
          </button>

          <button
            type="button"
            className="button button-light"
            onClick={handleResendOtp}
            disabled={otpResending}
          >
            {otpResending
              ? 'Sending OTP...'
              : 'Resend OTP'}
            <ArrowRight size={15} />
          </button>

        </form>
      </SimplePage>
    )
  }

  // ==========================================================
  // FORGOT PASSWORD / RESET PASSWORD
  // ==========================================================

  if (path === '/forgot-password') {
    const queryEmail =
      new URLSearchParams(location.search).get('email') || ''

    const currentEmail =
      resetEmail || queryEmail

    return (
      <SimplePage
        eyebrow="Account security"
        title="Forgot your password?"
      >
        <p className="lead">
          Enter your registered email address and we will
          send you a 6-digit OTP to reset your password.
        </p>

        <form
          className="checkout-form"
          onSubmit={handleForgotPassword}
        >
          <input
            value={currentEmail}
            onChange={e => setResetEmail(e.target.value)}
            type="email"
            placeholder="Email address"
            autoComplete="email"
            required
          />

          {resetError && (
            <p style={{ color: '#b42318', margin: '0' }}>
              {resetError}
            </p>
          )}

          {resetMessage && (
            <p style={{ margin: '0' }}>
              {resetMessage}
            </p>
          )}

          <button
            type="submit"
            className="button"
            disabled={resetLoading}
          >
            {resetLoading
              ? 'Sending OTP...'
              : 'Send OTP'}
            <ArrowRight size={15} />
          </button>

          <button
            type="button"
            className="button button-light"
            onClick={() => navigate('/account')}
          >
            Back to login
            <ArrowRight size={15} />
          </button>
        </form>
      </SimplePage>
    )
  }


  if (path === '/reset-password') {
    const queryEmail =
      new URLSearchParams(location.search).get('email') || ''

    const currentEmail =
      resetEmail || queryEmail

    const hasResetToken =
      Boolean(
        resetToken ||
        window.sessionStorage.getItem('xaaj-reset-token')
      )

    if (!hasResetToken) {
      return (
        <SimplePage
          eyebrow="Password reset"
          title="Verify your email."
        >
          <p className="lead">
            Enter the 6-digit OTP sent to{' '}
            <strong>{currentEmail || 'your email'}</strong>.
            The OTP is valid for 10 minutes.
          </p>

          <form
            className="checkout-form"
            onSubmit={handleVerifyResetOtp}
          >
            <input
              value={currentEmail}
              onChange={e => setResetEmail(e.target.value)}
              type="email"
              placeholder="Email address"
              autoComplete="email"
              required
            />

            <input
              value={resetOtp}
              onChange={e =>
                setResetOtp(
                  e.target.value
                    .replace(/\D/g, '')
                    .slice(0, 6)
                )
              }
              placeholder="6-digit OTP"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              required
            />

            {resetError && (
              <p style={{ color: '#b42318', margin: '0' }}>
                {resetError}
              </p>
            )}

            {resetMessage && (
              <p style={{ margin: '0' }}>
                {resetMessage}
              </p>
            )}

            <button
              type="submit"
              className="button"
              disabled={resetLoading}
            >
              {resetLoading
                ? 'Verifying...'
                : 'Verify OTP'}
              <ArrowRight size={15} />
            </button>

            <button
              type="button"
              className="button button-light"
              onClick={() => navigate('/forgot-password')}
            >
              Request new OTP
              <ArrowRight size={15} />
            </button>
          </form>
        </SimplePage>
      )
    }

    return (
      <SimplePage
        eyebrow="Password reset"
        title="Create a new password."
      >
        <p className="lead">
          Create a new password for{' '}
          <strong>{currentEmail}</strong>.
        </p>

        <form
          className="checkout-form"
          onSubmit={handleResetPassword}
        >
          <input
            value={resetPasswordValue}
            onChange={e =>
              setResetPasswordValue(e.target.value)
            }
            type="password"
            placeholder="New password (minimum 8 characters)"
            autoComplete="new-password"
            required
          />

          <input
            value={resetConfirmPassword}
            onChange={e =>
              setResetConfirmPassword(e.target.value)
            }
            type="password"
            placeholder="Confirm new password"
            autoComplete="new-password"
            required
          />

          {resetError && (
            <p style={{ color: '#b42318', margin: '0' }}>
              {resetError}
            </p>
          )}

          {resetMessage && (
            <p style={{ margin: '0' }}>
              {resetMessage}
            </p>
          )}

          <button
            type="submit"
            className="button"
            disabled={resetLoading}
          >
            {resetLoading
              ? 'Updating password...'
              : 'Update password'}
            <ArrowRight size={15} />
          </button>
        </form>
      </SimplePage>
    )
  }


  // ==========================================================
  // ACCOUNT / LOGIN
  // ==========================================================

      const authStyles = `
      .wood-auth-page{min-height:100vh;display:grid;grid-template-columns:minmax(0,1.08fr) minmax(460px,.82fr);background:#f7f5f0;color:#28251f}
      .wood-auth-visual{position:relative;min-height:100vh;overflow:hidden;background:#39291c}
      .wood-auth-visual:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(18,17,14,.18),rgba(18,17,14,.02) 35%,rgba(18,17,14,.72))}
      .wood-auth-visual img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center}
      .wood-auth-brand{position:absolute;z-index:1;top:42px;left:clamp(24px,5vw,76px);color:#fff;text-decoration:none;font-family:Georgia,serif;font-size:24px;letter-spacing:.24em}
      .wood-auth-brand small{display:block;margin-top:10px;font:9px/1.5 Arial,sans-serif;letter-spacing:.24em;text-transform:uppercase}
      .wood-auth-story{position:absolute;z-index:1;left:clamp(24px,5vw,76px);right:34px;bottom:clamp(42px,9vh,100px);color:#fff}
      .wood-auth-kicker{font:10px Arial,sans-serif;letter-spacing:.25em;text-transform:uppercase;color:#e5d5bf}
      .wood-auth-story h2{max-width:520px;margin:20px 0;font:400 clamp(44px,5vw,76px)/.99 Georgia,serif;letter-spacing:-.045em}
      .wood-auth-story p{font:11px/2 Arial,sans-serif;letter-spacing:.22em;text-transform:uppercase;color:#e6ded2}
      .wood-auth-panel{display:flex;align-items:center;justify-content:center;padding:48px clamp(28px,5vw,82px);min-width:0;background:radial-gradient(ellipse at top right,rgba(221,209,190,.22),transparent 42%),#f7f5f0}
      .wood-auth-inner{width:100%;max-width:470px}
      .wood-auth-back{display:flex;justify-content:flex-end;margin-bottom:34px}
      .wood-auth-back a{font:12px Arial,sans-serif;color:#514536;text-decoration:none}
      .wood-auth-mark{text-align:center;margin-bottom:30px}
      .wood-auth-mark strong{font:400 25px Georgia,serif;letter-spacing:.28em}
      .wood-auth-mark span{display:block;margin-top:9px;font:9px Arial,sans-serif;letter-spacing:.23em;text-transform:uppercase;color:#827564}
      .wood-auth-rule{width:46px;height:1px;background:#a68c6c;margin:22px auto}
      .wood-auth-heading{margin:0;text-align:center;font:400 clamp(34px,3.4vw,48px)/1.12 Georgia,serif;letter-spacing:-.035em;color:#2d261e}
      .wood-auth-intro{max-width:410px;margin:12px auto 30px;text-align:center;font:15px/1.65 Georgia,serif;color:#887b6b}
      .wood-auth-form{display:grid;gap:17px}
      .wood-auth-phone-row{display:grid;grid-template-columns:minmax(0, .82fr) minmax(0, 1.18fr);gap:10px;width:100%;align-items:stretch}
      .wood-auth-phone-row select{display:block;width:100%;min-width:0;max-width:100%;box-sizing:border-box;height:52px;padding:0 12px;border:1px solid #d8d0c4;border-radius:0;background:#fffdf9;font:12px Arial,sans-serif;color:#30291f;outline:none;white-space:nowrap;text-overflow:ellipsis;overflow:hidden}
      .wood-auth-phone-row select:focus{border-color:#6d5438;box-shadow:0 0 0 3px rgba(109,84,56,.08)}
      .wood-auth-phone-row input{display:block;width:100%;min-width:0;max-width:100%;box-sizing:border-box;height:52px;padding:0 15px;border:1px solid #d8d0c4;border-radius:0;background:#fffdf9;font:13px Arial,sans-serif;color:#30291f;outline:none;transition:border-color .2s,background .2s,box-shadow .2s}
      .wood-auth-phone-row input:focus{border-color:#6d5438;background:#fff;box-shadow:0 0 0 3px rgba(109,84,56,.08)}
      .wood-auth-fields-two{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
      /* Registration name and phone use separate full-width rows so the phone controls never get squeezed. */
      .wood-auth-register-top{grid-template-columns:minmax(0,1fr)}
      .wood-auth-register-top .wood-auth-field{width:100%;min-width:0}
      .wood-auth-field{display:grid;gap:8px;min-width:0}
      .wood-auth-field label{font:9px Arial,sans-serif;letter-spacing:.19em;text-transform:uppercase;color:#5c5145}
      .wood-auth-field input{width:100%;min-width:0;box-sizing:border-box;height:51px;padding:0 15px;border:1px solid #d8d0c4;border-radius:0;background:rgba(255,255,255,.72);font:13px Arial,sans-serif;color:#30291f;outline:none;transition:border-color .2s,background .2s,box-shadow .2s}
      .wood-auth-field input:focus{border-color:#6d5438;background:#fff;box-shadow:0 0 0 3px rgba(109,84,56,.08)}
      .wood-auth-submit{display:flex;align-items:center;justify-content:center;gap:12px;min-height:54px;width:100%;margin-top:3px;border:1px solid #292923;border-radius:0;background:#292923;color:#fff;font:10px Arial,sans-serif;letter-spacing:.2em;text-transform:uppercase;cursor:pointer;transition:background .2s}
      .wood-auth-submit:hover{background:#4a4032;border-color:#4a4032}
      .wood-auth-submit:disabled{opacity:.65;cursor:wait}
      .wood-auth-links{display:flex;justify-content:space-between;gap:14px;margin-top:17px;font:12px Arial,sans-serif;color:#766a5a}
      .wood-auth-links a{color:#3b2b1b;text-underline-offset:3px}
      .wood-auth-bottom{text-align:center;margin:26px 0 0;font:13px Georgia,serif;color:#766a5a}
      .wood-auth-bottom a{margin-left:5px;color:#30271d;text-underline-offset:4px}
      .wood-auth-error{margin:0;padding:12px 14px;background:#f7eae6;border:1px solid #e5c8bd;color:#a23b28;font:12px/1.5 Arial,sans-serif}
      .wood-auth-legal{margin:18px 0 0;text-align:center;font:10px/1.7 Arial,sans-serif;color:#988b7a}
      @media(max-width:900px){.wood-auth-page{grid-template-columns:minmax(0,.82fr) minmax(420px,1fr)}.wood-auth-panel{padding:34px 28px}.wood-auth-story h2{font-size:46px}}
      @media(max-width:680px){.wood-auth-page{display:block}.wood-auth-visual{min-height:230px;height:28vh;max-height:290px}.wood-auth-brand{top:22px;left:24px;font-size:19px}.wood-auth-brand small{font-size:8px}.wood-auth-story{left:24px;bottom:22px}.wood-auth-story h2{font-size:34px;margin:9px 0}.wood-auth-story p{display:none}.wood-auth-kicker{font-size:8px}.wood-auth-panel{padding:30px 22px 42px}.wood-auth-back{margin-bottom:22px}.wood-auth-mark{margin-bottom:24px}.wood-auth-mark strong{font-size:21px}.wood-auth-heading{font-size:36px}.wood-auth-intro{font-size:14px;margin-bottom:24px}.wood-auth-fields-two{gap:10px}.wood-auth-phone-row{grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr);gap:8px}.wood-auth-phone-row select{padding:0 8px;font-size:11px}.wood-auth-phone-row input{padding:0 11px}.wood-auth-form{gap:14px}}
    `

    const authVisual = (
      <div className="wood-auth-visual">
        <WoodistryImage
          className="wood-auth-visual-image-shell"
          imageClassName="wood-auth-visual-image"
          src=""
          alt="Warm, sunlit living room with natural wood furniture"
        />
        <Link to="/" className="wood-auth-brand">
          WOODISTRY
          <small>Considered furniture for living</small>
        </Link>
        <div className="wood-auth-story">
          <span className="wood-auth-kicker">DESIGNED WITH INTENTION</span>
          <h2>A more thoughtful<br />way to live.</h2>
          <p>Honest materials. Enduring forms.<br />Made for the moments that matter.</p>
        </div>
      </div>
    )

if (path === '/account') {

    // ----------------------------------------------------------
    // ADMIN GUARD
    // ----------------------------------------------------------
    // Admin accounts must never see the customer account page
    // or its My Orders section.
    if (user?.role === 'admin') {
      return <Navigate to="/admin" replace />
    }

    if (user) {
      return (
        <SimplePage
          eyebrow="Your XAAJ account"
          title={`Welcome, ${user.name || 'Customer'}.`}
        >
          <p className="lead">
            Your account is verified and ready for checkout.
          </p>

          {user.email && (
            <p>
              <strong>Email:</strong> {user.email}
            </p>
          )}

          {user.addresses?.[0] && (
            <p>
              <strong>Saved address:</strong>{' '}
              {user.addresses[0].line1},{' '}
              {user.addresses[0].city},{' '}
              {user.addresses[0].state} -{' '}
              {user.addresses[0].postalCode}
            </p>
          )}

          <style>{`
            .xaaj-account-actions {
              display: flex;
              align-items: center;
              gap: 12px;
              flex-wrap: wrap;
              margin-top: 24px;
            }

            .xaaj-account-action {
              min-height: 46px;
              padding: 0 19px !important;
              border-radius: 999px !important;
              border: 1px solid rgba(41,40,37,.14) !important;
              box-shadow: 0 6px 18px rgba(41,40,37,.06);
              transition: transform .2s ease, box-shadow .2s ease, background .2s ease, border-color .2s ease;
            }

            .xaaj-account-action:hover {
              transform: translateY(-1px);
              box-shadow: 0 10px 24px rgba(41,40,37,.10);
            }

            .xaaj-account-action-light {
              background: #fff !important;
            }

            .xaaj-account-action-danger {
              color: #b42318 !important;
              border-color: rgba(180,35,24,.20) !important;
              background: #fff !important;
            }

            .xaaj-account-action-danger:hover {
              color: #fff !important;
              background: #b42318 !important;
              border-color: #b42318 !important;
            }

            .xaaj-orders-heading {
              display: flex;
              align-items: flex-end;
              justify-content: space-between;
              gap: 20px;
              flex-wrap: wrap;
            }

            .xaaj-orders-heading h2 { margin-bottom: 0; }

            .xaaj-orders-count {
              display: inline-flex;
              align-items: center;
              min-height: 30px;
              padding: 0 11px;
              border-radius: 999px;
              background: rgba(41,40,37,.055);
              border: 1px solid rgba(41,40,37,.08);
              font-size: 11px;
              font-weight: 700;
              letter-spacing: .06em;
              text-transform: uppercase;
            }

            @media (max-width: 640px) {
              .xaaj-account-actions {
                display: grid;
                grid-template-columns: 1fr;
              }

              .xaaj-account-action {
                width: 100%;
                justify-content: center;
              }
            }
          `}</style>

          <div className="xaaj-account-actions">
            <Button to="/checkout" className="xaaj-account-action">
              Continue to checkout
            </Button>

            <button
              type="button"
              className="button button-light xaaj-account-action xaaj-account-action-light"
              onClick={() => {
                window.scrollTo({
                  top: document.body.scrollHeight,
                  behavior: 'smooth'
                })
              }}
            >
              My Orders
              <ArrowRight size={15} />
            </button>

            <button
              type="button"
              className="button button-light xaaj-account-action xaaj-account-action-danger"
              onClick={async () => {
                await logout()
                navigate('/account')
              }}
            >
              Logout
            </button>
          </div>

          <div
            style={{
              marginTop: '40px',
              paddingTop: '28px',
              borderTop: '1px solid rgba(0,0,0,.12)'
            }}
          >
            <span className="eyebrow">
              Order history
            </span>

            <div className="xaaj-orders-heading">
              <h2 style={{ marginTop: '8px' }}>
                My Orders
              </h2>
              <span className="xaaj-orders-count">
                {orders.length} {orders.length === 1 ? 'Order' : 'Orders'}
              </span>
            </div>

            {ordersLoading && (
              <p>Loading your orders...</p>
            )}

            {ordersError && (
              <p style={{ color: '#b42318' }}>
                {ordersError}
              </p>
            )}

            {!ordersLoading &&
              !ordersError &&
              orders.length === 0 && (
                <p>
                  You haven't placed any orders yet.
                </p>
              )}

            {!ordersLoading &&
              orders.length > 0 && (
                <>
                  <style>{`
                    .xaaj-account-actions {
                      display: flex;
                      align-items: center;
                      gap: 12px;
                      flex-wrap: wrap;
                      margin-top: 24px;
                    }

                    .xaaj-account-action {
                      min-height: 46px;
                      padding: 0 19px;
                      border-radius: 999px !important;
                      border: 1px solid rgba(41,40,37,.14);
                      box-shadow: 0 6px 18px rgba(41,40,37,.06);
                      transition: transform .2s ease, box-shadow .2s ease, background .2s ease, border-color .2s ease;
                    }

                    .xaaj-account-action:hover {
                      transform: translateY(-1px);
                      box-shadow: 0 10px 24px rgba(41,40,37,.10);
                    }

                    .xaaj-account-action-light {
                      background: #fff;
                    }

                    .xaaj-account-action-danger {
                      color: #b42318;
                      border-color: rgba(180,35,24,.20);
                      background: #fff;
                    }

                    .xaaj-account-action-danger:hover {
                      color: #fff;
                      background: #b42318;
                      border-color: #b42318;
                    }

                    .xaaj-orders-heading {
                      display: flex;
                      align-items: flex-end;
                      justify-content: space-between;
                      gap: 20px;
                      flex-wrap: wrap;
                    }

                    .xaaj-orders-heading h2 {
                      margin-bottom: 0;
                    }

                    .xaaj-orders-count {
                      display: inline-flex;
                      align-items: center;
                      min-height: 30px;
                      padding: 0 11px;
                      border-radius: 999px;
                      background: rgba(41,40,37,.055);
                      border: 1px solid rgba(41,40,37,.08);
                      font-size: 11px;
                      font-weight: 700;
                      letter-spacing: .06em;
                      text-transform: uppercase;
                    }

                    .xaaj-orders-grid {
                      display: grid;
                      grid-template-columns: 1fr;
                      gap: 20px;
                      margin-top: 22px;
                    }

                    .xaaj-order-card {
                      position: relative;
                      overflow: hidden;
                      padding: 24px;
                      border: 1px solid rgba(41,40,37,.10);
                      border-radius: 20px;
                      background: linear-gradient(145deg, #ffffff 0%, #faf9f6 100%);
                      box-shadow: 0 12px 35px rgba(41,40,37,.07);
                      transition: transform .25s ease, box-shadow .25s ease, border-color .25s ease;
                    }

                    .xaaj-order-card:hover {
                      transform: translateY(-2px);
                      border-color: rgba(41,40,37,.16);
                      box-shadow: 0 18px 45px rgba(41,40,37,.10);
                    }

                    .xaaj-order-card::before {
                      content: '';
                      position: absolute;
                      inset: 0 0 auto 0;
                      height: 3px;
                      background: currentColor;
                      opacity: .12;
                    }

                    .xaaj-order-top {
                      display: flex;
                      align-items: flex-start;
                      justify-content: space-between;
                      gap: 18px;
                      padding-bottom: 18px;
                      border-bottom: 1px solid rgba(0,0,0,.07);
                    }

                    .xaaj-order-number {
                      margin: 0;
                      font-size: 14px;
                      letter-spacing: .07em;
                      text-transform: uppercase;
                    }

                    .xaaj-order-total {
                      margin: 0;
                      font-size: 19px;
                      letter-spacing: -.02em;
                      white-space: nowrap;
                    }

                    .xaaj-order-meta {
                      display: grid;
                      grid-template-columns: repeat(3, minmax(0, 1fr));
                      gap: 10px;
                      margin-top: 18px;
                    }

                    .xaaj-order-meta-item {
                      min-width: 0;
                      padding: 13px 14px;
                      border: 1px solid rgba(0,0,0,.065);
                      border-radius: 14px;
                      background: rgba(255,255,255,.68);
                    }

                    .xaaj-order-meta-label {
                      display: block;
                      margin-bottom: 5px;
                      font-size: 10px;
                      letter-spacing: .10em;
                      text-transform: uppercase;
                      opacity: .55;
                    }

                    .xaaj-order-meta-value {
                      font-size: 13px;
                      font-weight: 600;
                      text-transform: capitalize;
                    }

                    .xaaj-order-summary {
                      margin-top: 18px;
                      padding: 16px 17px;
                      border-radius: 15px;
                      background: rgba(41,40,37,.035);
                    }

                    .xaaj-order-summary-row {
                      display: flex;
                      align-items: center;
                      justify-content: space-between;
                      gap: 15px;
                      padding: 6px 0;
                      font-size: 13px;
                    }

                    .xaaj-order-summary-row.total {
                      margin-top: 7px;
                      padding-top: 12px;
                      border-top: 1px solid rgba(0,0,0,.09);
                      font-size: 15px;
                    }

                    .xaaj-free-shipping {
                      font-weight: 700;
                    }

                    .xaaj-order-tracking {
                      display: flex;
                      align-items: center;
                      gap: 10px;
                      margin-top: 16px;
                      padding: 12px 14px;
                      border: 1px solid rgba(0,0,0,.07);
                      border-radius: 14px;
                      font-size: 12px;
                    }

                    .xaaj-order-actions {
                      display: flex;
                      align-items: center;
                      gap: 10px;
                      flex-wrap: wrap;
                      margin-top: 18px;
                    }

                    .xaaj-cancel-button {
                      min-height: 44px;
                      padding: 0 18px;
                      border: 1px solid rgba(180,35,24,.28);
                      border-radius: 999px;
                      background: #fff;
                      color: #b42318;
                      font: inherit;
                      font-size: 12px;
                      font-weight: 700;
                      letter-spacing: .02em;
                      cursor: pointer;
                      transition: all .2s ease;
                    }

                    .xaaj-cancel-button:hover:not(:disabled) {
                      background: #b42318;
                      color: #fff;
                      border-color: #b42318;
                      transform: translateY(-1px);
                    }

                    .xaaj-cancel-button:disabled {
                      cursor: wait;
                      opacity: .55;
                    }

                    .xaaj-cancel-help {
                      margin: 0;
                      padding: 13px 15px;
                      border: 1px solid rgba(0,0,0,.07);
                      border-radius: 14px;
                      background: rgba(0,0,0,.025);
                      font-size: 12px;
                      line-height: 1.55;
                    }

                    .xaaj-cancel-help strong {
                      display: block;
                      margin-bottom: 3px;
                      font-size: 12px;
                    }

                    .xaaj-cancel-help a {
                      color: inherit;
                      font-weight: 600;
                    }

                    .xaaj-feedback-list {
                      display: grid;
                      gap: 10px;
                      width: 100%;
                      margin-top: 4px;
                      padding-top: 4px;
                    }

                    .xaaj-feedback-item {
                      display: flex;
                      align-items: center;
                      justify-content: space-between;
                      gap: 14px;
                      padding: 12px 13px;
                      border: 1px solid rgba(41,40,37,.08);
                      border-radius: 15px;
                      background: rgba(255,255,255,.72);
                    }

                    .xaaj-feedback-product {
                      display: flex;
                      align-items: center;
                      gap: 11px;
                      min-width: 0;
                    }

                    .xaaj-feedback-product img,
                    .xaaj-feedback-placeholder {
                      width: 46px;
                      height: 46px;
                      flex: 0 0 46px;
                      border-radius: 10px;
                      object-fit: cover;
                      background: #f0ece5;
                    }

                    .xaaj-feedback-placeholder {
                      display: grid;
                      place-items: center;
                      font-size: 9px;
                      letter-spacing: .12em;
                      color: #77736b;
                    }

                    .xaaj-feedback-product strong {
                      display: block;
                      max-width: 280px;
                      overflow: hidden;
                      text-overflow: ellipsis;
                      white-space: nowrap;
                      font-size: 13px;
                    }

                    .xaaj-feedback-product small {
                      display: block;
                      margin-top: 3px;
                      color: #77736b;
                      font-size: 11px;
                    }

                    .xaaj-feedback-button {
                      display: inline-flex;
                      align-items: center;
                      justify-content: center;
                      gap: 7px;
                      min-height: 38px;
                      padding: 0 14px;
                      border: 1px solid rgba(41,40,37,.18);
                      border-radius: 999px;
                      background: #292824;
                      color: #fff;
                      font: inherit;
                      font-size: 11px;
                      font-weight: 700;
                      cursor: pointer;
                      white-space: nowrap;
                    }

                    .xaaj-reviewed-badge {
                      display: inline-flex;
                      align-items: center;
                      gap: 6px;
                      min-height: 36px;
                      padding: 0 12px;
                      border: 1px solid rgba(61,105,77,.18);
                      border-radius: 999px;
                      background: rgba(61,105,77,.07);
                      color: #3d694d;
                      font-size: 11px;
                      font-weight: 700;
                      white-space: nowrap;
                    }

                    @media (max-width: 640px) {
                      .xaaj-order-card {
                        padding: 18px;
                        border-radius: 17px;
                      }

                      .xaaj-order-top {
                        gap: 10px;
                      }

                      .xaaj-order-total {
                        font-size: 17px;
                      }

                      .xaaj-order-meta {
                        grid-template-columns: 1fr 1fr;
                      }

                      .xaaj-order-meta-item:last-child {
                        grid-column: 1 / -1;
                      }
                    }
                  `}</style>

                  <div className="xaaj-orders-grid">
                    {orders.map(order => {
                      const orderId = order._id || order.id
                      const subtotal = Number(order.subtotal || 0)
                      const shippingFee =
                        order.shippingFee !== undefined &&
                        order.shippingFee !== null
                          ? Number(order.shippingFee)
                          : subtotal >= 1000
                            ? 0
                            : 99
                      const total = Number(
                        order.total ?? subtotal + shippingFee - Number(order.discount || 0)
                      )
                      const status = String(order.status || 'pending')
                      const statusLabel = status.replaceAll('_', ' ')
                      const paymentLabel = String(
                        order.paymentStatus || 'pending'
                      ).replaceAll('_', ' ')

                      return (
                        <article
                          key={orderId}
                          className="xaaj-order-card"
                        >
                          <div className="xaaj-order-top">
                            <div>
                              <p className="xaaj-order-number">
                                Order #{String(orderId || '').slice(-8).toUpperCase()}
                              </p>
                              <small style={{ opacity: .58 }}>
                                {order.createdAt
                                  ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                                      day: '2-digit',
                                      month: 'short',
                                      year: 'numeric'
                                    })
                                  : ''}
                              </small>
                            </div>

                            <strong className="xaaj-order-total">
                              {money(total)}
                            </strong>
                          </div>

                          <div className="xaaj-order-meta">
                            <div className="xaaj-order-meta-item">
                              <span className="xaaj-order-meta-label">Status</span>
                              <span className="xaaj-order-meta-value">
                                {statusLabel}
                              </span>
                            </div>

                            <div className="xaaj-order-meta-item">
                              <span className="xaaj-order-meta-label">Payment</span>
                              <span className="xaaj-order-meta-value">
                                {paymentLabel}
                              </span>
                            </div>

                            <div className="xaaj-order-meta-item">
                              <span className="xaaj-order-meta-label">Items</span>
                              <span className="xaaj-order-meta-value">
                                {order.items?.length || 0} item(s)
                              </span>
                            </div>
                          </div>

                          <div className="xaaj-order-summary">
                            <div className="xaaj-order-summary-row">
                              <span>Subtotal</span>
                              <strong>{money(subtotal)}</strong>
                            </div>

                            <div className="xaaj-order-summary-row">
                              <span>Shipping</span>
                              <strong className={shippingFee === 0 ? 'xaaj-free-shipping' : ''}>
                                {shippingFee === 0 ? 'FREE' : money(shippingFee)}
                              </strong>
                            </div>

                            {Number(order.discount || 0) > 0 && (
                              <div className="xaaj-order-summary-row">
                                <span>Discount</span>
                                <strong>-{money(order.discount)}</strong>
                              </div>
                            )}

                            <div className="xaaj-order-summary-row total">
                              <strong>Total paid / payable</strong>
                              <strong>{money(total)}</strong>
                            </div>
                          </div>

                          {order.trackingNumber && (
                            <div className="xaaj-order-tracking">
                              <Package size={16} strokeWidth={1.5} />
                              <span>
                                Tracking: <strong>{order.trackingNumber}</strong>
                                {order.courierName ? ` · ${order.courierName}` : ''}
                              </span>
                            </div>
                          )}

                          <div className="xaaj-order-actions">
                            {status === 'pending' && (
                              <button
                                type="button"
                                className="xaaj-cancel-button"
                                onClick={() => handleCancelOrder(order)}
                                disabled={cancellingOrderId === orderId}
                              >
                                {cancellingOrderId === orderId
                                  ? 'Cancelling...'
                                  : 'Cancel Order'}
                              </button>
                            )}

                            {status !== 'pending' && status !== 'cancelled' && (
                              <p className="xaaj-cancel-help">
                                <strong>Cancellation unavailable online</strong>
                                This order has moved beyond the pending stage. Please contact Customer Care for assistance.<br />
                                <a href="mailto:customercare@xaaj.in">customercare@xaaj.in</a>
                                {' · '}
                                <a href="tel:+919899446117">+91 9899446117</a>
                              </p>
                            )}

                            {status === 'delivered' && Array.isArray(order.items) && (
                              <div className="xaaj-feedback-list">
                                {order.items.map((item, itemIndex) => (
                                  <div className="xaaj-feedback-item" key={`${orderId}-${item.product || itemIndex}`}>
                                    <div className="xaaj-feedback-product">
                                      {item.image ? (
                                        <img src={item.image} alt={item.name || 'Product'} />
                                      ) : (
                                        <div className="xaaj-feedback-placeholder">XAAJ</div>
                                      )}
                                      <div>
                                        <strong>{item.name || 'Product'}</strong>
                                        <small>Qty: {item.quantity || 1}</small>
                                      </div>
                                    </div>

                                    {item.reviewSubmitted ? (
                                      <span className="xaaj-reviewed-badge">
                                        <Check size={14} />
                                        Reviewed
                                      </span>
                                    ) : (
                                      <button
                                        type="button"
                                        className="xaaj-feedback-button"
                                        onClick={() => openReviewForm(order, item)}
                                      >
                                        <Star size={14} />
                                        Give Feedback
                                      </button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </article>
                      )
                    })}
                  </div>
                </>
              )}
          </div>

          {reviewingItem && (
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="xaaj-review-title"
              onClick={event => {
                if (event.target === event.currentTarget) closeReviewForm()
              }}
              style={{
                position: 'fixed', inset: 0, zIndex: 99999, display: 'flex',
                alignItems: 'center', justifyContent: 'center', padding: '20px',
                background: 'rgba(35,32,28,.48)', backdropFilter: 'blur(8px)'
              }}
            >
              <div style={{
                position: 'relative', width: 'min(100%, 480px)', padding: '30px',
                border: '1px solid #e8e0d5', borderRadius: '24px',
                background: '#fffdf9', boxShadow: '0 30px 80px rgba(41,40,37,.22)'
              }}>
                <button
                  type="button" onClick={closeReviewForm} disabled={reviewLoading}
                  aria-label="Close review"
                  style={{
                    position: 'absolute', top: '15px', right: '15px', width: '35px', height: '35px',
                    display: 'grid', placeItems: 'center', border: '1px solid #e5ddd2',
                    borderRadius: '50%', background: '#fff', color: '#292824', cursor: 'pointer'
                  }}
                >
                  <X size={16} strokeWidth={1.5} />
                </button>

                <span className="eyebrow">Your experience</span>
                <h2 id="xaaj-review-title" style={{
                  margin: '9px 45px 8px 0', fontFamily: 'Georgia, "Times New Roman", serif',
                  fontSize: '30px', lineHeight: 1.2, fontWeight: 400
                }}>
                  How did you like it?
                </h2>
                <p style={{ margin: '0 0 20px', color: '#706d67', fontSize: '14px' }}>
                  {reviewingItem.productName}
                </p>

                <form onSubmit={handleSubmitReview}>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', margin: '8px 0 18px' }}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star} type="button" onClick={() => setReviewRating(star)}
                        aria-label={`${star} star${star > 1 ? 's' : ''}`}
                        style={{
                          width: '42px', height: '42px', border: 0, background: 'transparent',
                          color: star <= reviewRating ? '#b84d32' : '#c9c1b7',
                          cursor: 'pointer', fontSize: '29px', lineHeight: 1
                        }}
                      >★</button>
                    ))}
                  </div>

                  <p style={{ minHeight: '20px', margin: '-5px 0 16px', textAlign: 'center', fontSize: '12px', color: '#77736b' }}>
                    {reviewRating ? `${reviewRating} out of 5` : 'Select your rating'}
                  </p>

                  <textarea
                    value={reviewComment}
                    onChange={event => setReviewComment(event.target.value)}
                    maxLength={1000} rows={5}
                    placeholder="Tell us a little about your experience (optional)"
                    disabled={reviewLoading}
                    style={{
                      width: '100%', boxSizing: 'border-box', padding: '14px 15px',
                      border: '1px solid #ddd4c8', borderRadius: '14px', background: '#fff',
                      color: '#292824', outline: 'none', resize: 'vertical', font: 'inherit', lineHeight: 1.6
                    }}
                  />

                  {reviewError && <p style={{ margin: '12px 0 0', color: '#b42318', fontSize: '13px' }}>{reviewError}</p>}
                  {reviewMessage && <p style={{ margin: '12px 0 0', color: '#3d694d', fontSize: '13px' }}>{reviewMessage}</p>}

                  <button type="submit" className="button" disabled={reviewLoading} style={{ width: '100%', marginTop: '18px', justifyContent: 'center' }}>
                    {reviewLoading ? 'Submitting...' : 'Submit review'}
                    {!reviewLoading && <ArrowRight size={15} />}
                  </button>
                </form>
              </div>
            </div>
          )}
        </SimplePage>
      )
    }

    return (
        <>
          <style>{authStyles}</style>
          <main className="wood-auth-page">
            {authVisual}
            <section className="wood-auth-panel">
              <div className="wood-auth-inner">
                <div className="wood-auth-back">
                  <Link to="/">← Back to store</Link>
                </div>
                <div className="wood-auth-mark">
                  <strong>WOODISTRY</strong>
                  <span>Considered furniture for living</span>
                  <div className="wood-auth-rule" />
                </div>
                <h1 className="wood-auth-heading">Welcome back.</h1>
                <p className="wood-auth-intro">Sign in to save your favorite pieces, track deliveries, and pick up where you left off.</p>
                <form className="wood-auth-form" onSubmit={handleLogin}>
                  <div className="wood-auth-field">
                    <label htmlFor="wood-login-email">Email address</label>
                    <input id="wood-login-email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" type="email" autoComplete="email" required />
                  </div>
                  <div className="wood-auth-field">
                    <label htmlFor="wood-login-password">Password</label>
                    <input id="wood-login-password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" type="password" autoComplete="current-password" required />
                  </div>
                  {error && <p className="wood-auth-error" role="alert">{error}</p>}
                  <button type="submit" className="wood-auth-submit" disabled={loading}>
                    {loading ? 'Signing in…' : 'Sign in to your account'} {!loading && <ArrowRight size={15} />}
                  </button>
                </form>
                <div className="wood-auth-links">
                  <Link to="/forgot-password">Forgot password?</Link>
                  <span>Private & secure checkout</span>
                </div>
                <p className="wood-auth-bottom">New to WOODISTRY? <Link to="/register">Create an account</Link></p>
                <p className="wood-auth-legal">Your details are protected. By continuing, you agree to our Terms of Service and Privacy Policy.</p>
              </div>
            </section>
          </main>
        </>
      )
    }

  if (path === '/register') {
    return (
      <>
        <style>{authStyles}</style>
        <main className="wood-auth-page">
          {authVisual}
          <section className="wood-auth-panel">
            <div className="wood-auth-inner">
              <div className="wood-auth-back">
                <Link to="/account">← Back to sign in</Link>
              </div>
              <div className="wood-auth-mark">
                <strong>WOODISTRY</strong>
                <span>Considered furniture for living</span>
                <div className="wood-auth-rule" />
              </div>
              <h1 className="wood-auth-heading">Make yourself at home.</h1>
              <p className="wood-auth-intro">Create an account for a more personal shopping experience, saved favorites, and easy order tracking.</p>
              <form className="wood-auth-form" onSubmit={handleRegister}>
                <div className="wood-auth-fields-two wood-auth-register-top">
                  <div className="wood-auth-field">
                    <label htmlFor="wood-register-name">Full name</label>
                    <input id="wood-register-name" value={registerName} onChange={e => setRegisterName(e.target.value)} placeholder="Your full name" autoComplete="name" required />
                  </div>
                  <div className="wood-auth-field">
                    <label htmlFor="wood-register-phone">Phone number</label>
                    <div className="wood-auth-phone-row">
                      <select
                        id="wood-register-country-code"
                        value={registerCountryCode}
                        onChange={e => setRegisterCountryCode(e.target.value)}
                        aria-label="Country calling code"
                        autoComplete="tel-country-code"
                        required
                      >
                        <option value="+1">🇺🇸 US (+1)</option>
                        <option value="+1-CA">🇨🇦 Canada (+1)</option>
                        <option value="+44">🇬🇧 UK (+44)</option>
                        <option value="+61">🇦🇺 Australia (+61)</option>
                        <option value="+91">🇮🇳 India (+91)</option>
                        <option value="+64">🇳🇿 NZ (+64)</option>
                        <option value="+353">🇮🇪 Ireland (+353)</option>
                      </select>
                      <input
                        id="wood-register-phone"
                        value={registerPhone}
                        onChange={e => setRegisterPhone(e.target.value.replace(/\D/g, '').slice(0, 15))}
                        placeholder="555 123 4567"
                        type="tel"
                        inputMode="numeric"
                        autoComplete="tel-national"
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="wood-auth-field">
                  <label htmlFor="wood-register-email">Email address</label>
                  <input id="wood-register-email" value={registerEmail} onChange={e => setRegisterEmail(e.target.value)} placeholder="you@example.com" type="email" autoComplete="email" required />
                </div>
                <div className="wood-auth-field">
                  <label htmlFor="wood-register-password">Create password</label>
                  <input id="wood-register-password" value={registerPassword} onChange={e => setRegisterPassword(e.target.value)} placeholder="At least 8 characters" type="password" autoComplete="new-password" minLength={8} required />
                </div>
                <div className="wood-auth-field">
                  <label htmlFor="wood-register-address">Street address</label>
                  <input id="wood-register-address" value={registerAddress} onChange={e => setRegisterAddress(e.target.value)} placeholder="Street and house number" autoComplete="street-address" required />
                </div>
                <div className="wood-auth-fields-two">
                  <div className="wood-auth-field">
                    <label htmlFor="wood-register-city">City</label>
                    <input id="wood-register-city" value={registerCity} onChange={e => setRegisterCity(e.target.value)} placeholder="City" autoComplete="address-level2" required />
                  </div>
                  <div className="wood-auth-field">
                    <label htmlFor="wood-register-state">State</label>
                    <input id="wood-register-state" value={registerState} onChange={e => setRegisterState(e.target.value)} placeholder="State" autoComplete="address-level1" required />
                  </div>
                </div>
                <div className="wood-auth-field">
                  <label htmlFor="wood-register-pin">ZIP code</label>
                  <input id="wood-register-pin" value={registerPin} onChange={e => setRegisterPin(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="ZIP code" inputMode="numeric" autoComplete="postal-code" maxLength={6} required />
                </div>
                {registerError && <p className="wood-auth-error" role="alert">{registerError}</p>}
                <button type="submit" className="wood-auth-submit" disabled={registerLoading}>
                  {registerLoading ? 'Creating account…' : 'Create your account'} {!registerLoading && <ArrowRight size={15} />}
                </button>
              </form>
              <p className="wood-auth-legal">We’ll send a one-time verification code to your email.</p>
              <p className="wood-auth-bottom">Already have an account? <Link to="/account">Sign in</Link></p>
            </div>
          </section>
        </main>
      </>
    )
  }


  // ==========================================================
  // SHIPPING POLICY — PREMIUM ACCORDION
  // ==========================================================

  if (path === '/shipping') {
    const sections = [
      {
        title: 'How long does delivery take?',
        content: (
          <>
            <p>Because every XAAJ piece is handmade, hand-glazed and individually quality-checked, please allow a short window to prepare your order with care before it ships.</p>
            <ul>
              <li><strong>In-stock items:</strong> Dispatched within 2–4 business days of order confirmation and payment realisation.</li>
              <li><strong>Made-to-order / pre-order collections:</strong> Dispatch timelines are specified on the product page, typically 2–4 weeks.</li>
              <li><strong>Custom or personalised orders:</strong> Timelines are confirmed separately in writing and are non-cancellable once production has commenced.</li>
              <li>Orders are not processed, packed or dispatched on Sundays and gazetted national holidays.</li>
            </ul>
            <p>You will receive an order confirmation email/SMS immediately, and a dispatch confirmation with tracking details once your order leaves our facility.</p>
            <p><strong>Estimated delivery after dispatch:</strong> Metro cities 3–5 business days; Rest of India 5–8 business days; Remote / hilly / North-East regions 7–12 business days.</p>
          </>
        )
      },
      {
        title: 'What is the shipping charge?',
        content: (
          <>
            <p>All shipping charges, if any, are displayed transparently at checkout before payment and included in the total payable amount shown before order confirmation.</p>
            <ul>
              <li><strong>Above $100:</strong> Free shipping.</li>
              <li><strong>Below $99.99:</strong> Shipping charge calculated at checkout.</li>
              <li><strong>Express / Priority:</strong> Available at checkout for eligible pin codes and products; charges are dynamically calculated.</li>
            </ul>
            <p>Express or priority delivery may not be available for fragile, oversized or heavy items. Express timelines are estimates and can be affected by courier delays, weather, regional restrictions, strikes and other events beyond XAAJ's reasonable control.</p>
          </>
        )
      },
      {
        title: 'Where do you deliver?',
        content: (
          <>
            <p>We currently ship to all serviceable pin codes across India through our logistics partners.</p>
            <p>International shipping is currently unavailable.</p>
          </>
        )
      },
      {
        title: 'How are fragile ceramics packed?',
        content: (
          <>
            <p>Every order is packed using multi-layer protective wrapping, corner reinforcement and cushioning material designed for breakage-resistant transit.</p>
            <ul>
              <li>Inspect the outer packaging at delivery and note visible damage to the delivery executive where possible.</li>
              <li>Record an unboxing video without pause/edit from the moment the sealed package is opened. This is strongly recommended for any damage-related claim.</li>
              <li>Retain the original packaging until you have inspected all items.</li>
            </ul>
          </>
        )
      },
      {
        title: 'How do I track my order?',
        content: (
          <p>Once dispatched, a tracking link will be shared via email/SMS/WhatsApp. You may also track your order by logging into your XAAJ account or by contacting us with your order number.</p>
        )
      },
      {
        title: 'What if delivery fails or is delayed?',
        content: (
          <>
            <ul>
              <li>If delivery fails due to an incorrect/incomplete address or recipient unavailability, the courier partner will typically make up to 2–3 re-attempts before returning the shipment.</li>
              <li>Shipments returned as undeliverable through no fault of XAAJ may be re-shipped at an additional delivery charge, or refunded after deducting original outbound and return shipping costs, at XAAJ's discretion.</li>
              <li>Please ensure your shipping address, pin code and phone number are accurate at checkout.</li>
            </ul>
          </>
        )
      },
      {
        title: 'What if my order arrives damaged, broken or incomplete?',
        content: (
          <p>Please report transit damage, breakage or missing items within <strong>48 hours of delivery</strong> by writing to <strong>customercare@xaaj.in</strong> with your order number and photographs/video of the damaged item and outer packaging. Full resolution details are set out in our Return & Refund Policy.</p>
        )
      },
      {
        title: 'When does risk in the product pass to me?',
        content: (
          <p>Title and risk in the goods, including risk of loss or damage, passes to the customer only upon delivery to the address provided at checkout, except where damage is reported and substantiated in accordance with the damaged-item process.</p>
        )
      },
      {
        title: 'How do I contact the Grievance Officer?',
        content: (
          <p><strong>Mr Ashish Chaudhary</strong><br />Email: grievance@xaaj.in<br />Phone: 989946117, Mon–Sat, 10:00 AM – 6:00 PM IST</p>
        )
      }
    ]

    return (
      <SimplePage
        policy
        eyebrow="Shipping Policy"
        title="Shipping made simple."
        intro="We carefully pack every XAAJ order and deliver across India."
        effectiveDate="12/09/2026"
      >
        <PolicyAccordion sections={sections} />
      </SimplePage>
    )
  }

  // ==========================================================
  // RETURN & REFUND POLICY — PREMIUM ACCORDION
  // ==========================================================

  if (path === '/returns') {
    const sections = [
      {
        title: 'When is my order eligible for a return or replacement?',
        content: (
          <>
            <p>You may request a return, replacement or refund when:</p>
            <ul>
              <li>The product arrives broken, cracked or chipped due to shipping/handling.</li>
              <li>The wrong item is delivered, including wrong design, size, quantity or colour.</li>
              <li>Part of a set, such as a dinner set, is missing from the package.</li>
            </ul>
          </>
        )
      },
      {
        title: 'How quickly do I need to report a problem?',
        content: (
          <>
            <p>Damage, wrong-item and missing-item claims must be reported <strong>within 48 hours of delivery</strong>.</p>
            <p>Email <strong>customercare@xaaj.in</strong> or WhatsApp <strong>+91-9899446117</strong> with your order number.</p>
            <p>Please provide clear photos of the damaged/defective item, shipping label and outer packaging. An unboxing video is preferred. Resolution is communicated within 5–7 business days of receiving complete evidence.</p>
            <p>Claims after 48 hours, or without adequate photographic/video evidence, may not be eligible except where the issue is a latent manufacturing defect covered by the policy.</p>
          </>
        )
      },
      {
        title: 'Which items are not eligible for return?',
        content: (
          <ul>
            <li>Products that have been used, washed, or show signs of handling beyond inspection.</li>
            <li>Clearance/final-sale products marked "non-returnable" on the product page.</li>
            <li>Customised, personalised or made-to-order pieces.</li>
            <li>Minor glaze, texture, hand-painted pattern or size variations inherent to handmade ceramics.</li>
            <li>Products without original packaging, tags or accompanying documentation, where applicable.</li>
            <li>Change-of-mind returns on made-to-order or bespoke items once production has commenced.</li>
          </ul>
        )
      },
      {
        title: 'Do you offer change-of-mind returns?',
        content: (
          <p>For ready-to-ship, unused products in original condition and packaging, XAAJ <strong>[offers / does not offer]</strong> change-of-mind returns within <strong>[7]</strong> days of delivery. Where offered, return shipping costs are borne by the customer, and the item will be inspected before a refund or store credit is issued. Qualifying items should be stated clearly on the product page.</p>
        )
      },
      {
        title: 'Are handmade variations considered defects?',
        content: (
          <p>XAAJ products are handmade using traditional techniques. Minor irregularities in shape, glaze pooling, colour depth, surface texture or size are intentional characteristics of handcrafted ceramics and are not treated as manufacturing defects.</p>
        )
      },
      {
        title: 'How and when will I receive my refund?',
        content: (
          <>
            <ul>
              <li>Refunds are processed to the original payment method used at checkout, or as store credit where opted by the customer.</li>
              <li>Once a return is approved and, where applicable, the item is received and inspected, refunds are initiated within 7 business days.</li>
              <li>After initiation, funds typically reflect in 10–15 business days depending on the bank or card issuer.</li>
              <li>COD orders are refunded via bank transfer/UPI to an account provided by the customer, or as store credit.</li>
            </ul>
          </>
        )
      },
      {
        title: 'Can I get a replacement instead of a refund?',
        content: (
          <p>For damaged, defective or wrongly delivered items, XAAJ may, at the customer's choice and subject to stock availability, offer a free replacement instead of a refund. If the item is out of stock, a full refund or store credit valid for 12 months will be offered.</p>
        )
      },
      {
        title: 'Who pays for return shipping?',
        content: (
          <ul>
            <li>For approved damage/defect/wrong-item claims, XAAJ will arrange a free reverse pickup where serviceable.</li>
            <li>Where reverse pickup is unavailable in your pin code, XAAJ will reimburse reasonable actual courier charges for self-shipping.</li>
            <li>For permitted change-of-mind returns, return shipping is borne by the customer unless stated otherwise.</li>
          </ul>
        )
      },
      {
        title: 'How do I request a return?',
        content: (
          <>
            <p>Email <strong>customercare@xaaj.in</strong> or use the 'Returns' section of your account with your order number, reason for return and supporting photos/video.</p>
            <p>Our team will review and respond with a resolution or request for further information within 2 business days. Once approved, we will share pickup/drop-off instructions.</p>
          </>
        )
      },
      {
        title: 'How do I contact the Grievance Officer?',
        content: (
          <p><strong>Ashish Chaudhary</strong><br />Email: grievance@xaaj.in<br />Phone: +91-9899446117, Mon–Fri, 10:00 AM – 5:00 PM IST</p>
        )
      }
    ]

    return (
      <SimplePage
        policy
        eyebrow="Return & Refund Policy"
        title="Returns made simple."
        intro="If something isn't right with your XAAJ order, here's exactly what to do."
        effectiveDate="12/09/2026"
      >
        <PolicyAccordion sections={sections} />
      </SimplePage>
    )
  }

  // ==========================================================
  // CANCELLATION POLICY — PREMIUM ACCORDION
  // ==========================================================

  if (path === '/cancellation') {
    const sections = [
      {
        title: 'Can I cancel my order before dispatch?',
        content: (
          <>
            <p>Ready-to-ship items may be cancelled free of charge any time before the order status changes to <strong>"Dispatched"</strong>.</p>
            <p>Write to <strong>customercare@xaaj.in</strong> or use the "Cancel Order" option in your account where available.</p>
            <p>100% of the amount paid, including shipping charges if any, will be refunded to the original payment method within 10–15 business days.</p>
          </>
        )
      },
      {
        title: 'Can I cancel after my order has been dispatched?',
        content: (
          <p>Once an order has been dispatched, it cannot be cancelled. You may refuse delivery or initiate a return after delivery in accordance with the Return & Refund Policy, where eligible. For prepaid orders refused after dispatch, the refund will be processed after deducting actual outbound and return shipping costs.</p>
        )
      },
      {
        title: 'When can XAAJ cancel an order?',
        content: (
          <>
            <p>XAAJ may cancel an order, in whole or in part, with a full refund of the amount paid for the cancelled portion when:</p>
            <ul>
              <li>The product is out of stock or discontinued after order placement.</li>
              <li>There are pricing or product-information inaccuracies due to technical or human error.</li>
              <li>A fraudulent transaction is suspected, or payment/delivery details cannot be verified.</li>
              <li>The delivery address falls outside the current serviceable area.</li>
              <li>Force majeure events prevent fulfilment.</li>
            </ul>
            <p>XAAJ will notify you by email/SMS promptly and any amount paid will be refunded within 7 business days.</p>
          </>
        )
      },
      {
        title: 'What happens with repeated COD cancellations?',
        content: (
          <p>Repeated non-acceptance or cancellation of COD orders may result in COD being disabled for your account, at XAAJ's discretion, to prevent misuse.</p>
        )
      },
      {
        title: 'Can I modify my order before dispatch?',
        content: (
          <p>Requests to modify an order, including address, item or quantity, can only be accommodated before dispatch, subject to feasibility. Contact <strong>customercare@xaaj.in</strong> with your order number as soon as possible.</p>
        )
      },
      {
        title: 'How do I request a cancellation?',
        content: (
          <ul>
            <li><strong>Email:</strong> customercare@xaaj.in with subject line "Cancel Order – [Order Number]".</li>
            <li><strong>Phone/WhatsApp:</strong> 9899446117, Mon–Fri, 10:00 AM – 5:00 PM IST.</li>
            <li><strong>My Orders:</strong> Use your XAAJ account where the self-service option is available.</li>
          </ul>
        )
      },
      {
        title: 'How do I contact the Grievance Officer?',
        content: (
          <p><strong>Mr Ashish Chuadhary</strong><br />Email: grievance@xaaj.in<br />Complaints regarding cancellations are acknowledged within 48 hours and resolved within one month, in accordance with the Consumer Protection (E-Commerce) Rules, 2020.</p>
        )
      }
    ]

    return (
      <SimplePage
        policy
        eyebrow="Cancellation Policy"
        title="Cancellation made simple."
        intro="Need to cancel an order? Here's when and how you can do it."
        effectiveDate="12/09/2026"
      >
        <PolicyAccordion sections={sections} />
      </SimplePage>
    )
  }

  // ==========================================================
  // PRIVACY POLICY
  // ==========================================================

  if (path === '/privacy') {
    return (
      <SimplePage
        eyebrow="Privacy"
        title="Your privacy matters."
      >
        <p className="lead">
          We use your information only to provide
          a smooth and secure shopping experience.
        </p>

        <p>
          Information such as your name, email, phone number
          and delivery address may be used to process orders,
          payments, delivery and customer support.
        </p>

        <p>
          For privacy questions, contact us at customercare@xaaj.in.
        </p>
      </SimplePage>
    )
  }

  // ==========================================================
  // TERMS & CONDITIONS
  // ==========================================================

  if (path === '/terms') {
    return (
      <SimplePage
        eyebrow="Legal"
        title="Terms & conditions."
      >
        <p className="lead">
          Please read carefully before using xaaj.in.
        </p>

        <p>
          <strong>Effective date:</strong> 12/09/2026
        </p>

        <p>
          These Terms and Conditions ("Terms") govern your access to and use
          of www.xaaj.in and any related mobile application (together, the
          "Platform"), owned and operated by APNP Ventures Pvt Ltd, having its
          registered office at G6/4C DLF GARDEN CITY SECTOR 92 GURGAON 122505
          Haryana and GSTIN 06ABGCA0842A1ZC ("XAAJ", "we", "us", "our").
        </p>

        <p>
          By accessing or using the Platform, placing an order, or creating an
          account, you agree to be bound by these Terms, our Privacy Policy,
          Shipping Policy, Return &amp; Refund Policy and Cancellation Policy.
        </p>

        <h2>1. Eligibility</h2>
        <p>
          You must be at least 18 years of age and competent to contract under
          the Indian Contract Act, 1872 to use the Platform and place orders.
          If you are using the Platform on behalf of an entity, you represent
          that you have authority to bind that entity.
        </p>

        <h2>2. Account Registration</h2>
        <ul>
          <li>You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.</li>
          <li>You agree to provide accurate, current and complete information at registration and checkout, and to update it as necessary.</li>
          <li>XAAJ reserves the right to suspend or terminate accounts found to be fraudulent, abusive, or in breach of these Terms.</li>
        </ul>

        <h2>3. Products and Product Descriptions</h2>
        <ul>
          <li>XAAJ sells handcrafted ceramic tableware and home products. As each piece is handmade, minor variation in colour, glaze, texture, weight and dimensions between the product image and the item received is normal and not a defect.</li>
          <li>We make reasonable efforts to display product colours, dimensions and details accurately; however, actual colours may vary slightly due to screen/display settings and the handcrafted, hand-glazed nature of the products.</li>
          <li>Country of origin, materials used and care instructions are provided on individual product pages, in accordance with applicable Legal Metrology and consumer protection requirements.</li>
          <li>Products are microwave/dishwasher safe only where expressly stated on the product page; please follow the specific care instructions provided with your order.</li>
        </ul>

        <h2>4. Pricing and Payment</h2>
        <ul>
          <li>All prices are listed in US Dollars (USD). Any applicable taxes and charges are displayed at checkout before you confirm payment. The total price payable, including all applicable charges, is displayed at checkout before you confirm payment.</li>
          <li>We accept payment via credit/debit cards, UPI, net banking, wallets and Cash on Delivery (where available), processed through third-party payment gateways. XAAJ does not store your full card details.</li>
          <li>In the event of a pricing or product-information error due to technical glitch or human error, XAAJ reserves the right to cancel the affected order and issue a full refund, even after order confirmation.</li>
          <li>XAAJ reserves the right to modify prices at any time; changes will not affect orders already confirmed.</li>
        </ul>

        <h2>5. Order Acceptance</h2>
        <p>
          Your order constitutes an offer to purchase. A contract of sale is
          formed only when XAAJ sends a dispatch confirmation for the relevant
          item(s); an order confirmation email/SMS is an acknowledgment of
          receipt of your order, not acceptance. XAAJ reserves the right to
          refuse or cancel any order for reasons including product
          unavailability, pricing errors, suspected fraud, or delivery-area
          restrictions, as detailed in our Cancellation Policy.
        </p>

        <h2>6. Shipping, Cancellation, Return &amp; Refunds</h2>
        <p>
          Shipping timelines, cancellation windows and return/refund
          eligibility are governed by our Shipping Policy, Cancellation Policy
          and Return &amp; Refund Policy, which form an integral part of these
          Terms.
        </p>

        <h2>7. Intellectual Property</h2>
        <p>
          All content on the Platform — including the XAAJ name, logo, product
          designs, photography, graphics, text and layout — is the exclusive
          property of XAAJ or its licensors and is protected under applicable
          intellectual property laws. You may not reproduce, distribute,
          modify, or create derivative works from any Platform content without
          our prior written consent.
        </p>

        <h2>8. User Conduct</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Use the Platform for any unlawful purpose or in violation of these Terms.</li>
          <li>Post or transmit any content that is defamatory, obscene, infringing, or otherwise objectionable.</li>
          <li>Attempt to gain unauthorised access to the Platform, other users' accounts, or our systems.</li>
          <li>Use any automated means (bots, scrapers) to access or extract data from the Platform without permission.</li>
          <li>Engage in fraudulent transactions, chargebacks without valid cause, or misuse of promotional offers.</li>
        </ul>

        <h2>9. Reviews and User-Generated Content</h2>
        <p>
          If you submit reviews, photos or other content, you grant XAAJ a
          non-exclusive, royalty-free, worldwide licence to use, reproduce and
          display such content for marketing and promotional purposes. XAAJ
          does not permit fake or incentivised reviews that misrepresent
          genuine user experience.
        </p>

        <h2>10. Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by law, XAAJ's aggregate liability
          arising from your use of the Platform or purchase of products shall
          not exceed the amount paid by you for the specific order giving rise
          to the claim. XAAJ shall not be liable for any indirect, incidental
          or consequential damages. Nothing in these Terms limits any liability
          that cannot be excluded under the Consumer Protection Act, 2019, or
          excludes your statutory rights as a consumer.
        </p>

        <h2>11. Indemnity</h2>
        <p>
          You agree to indemnify and hold XAAJ, its directors, employees and
          affiliates harmless from any claims, losses or damages arising from
          your breach of these Terms or misuse of the Platform.
        </p>

        <h2>12. Force Majeure</h2>
        <p>
          XAAJ shall not be liable for any delay or failure to perform
          resulting from causes beyond its reasonable control, including
          natural disasters, strikes, pandemics, government action, or
          logistics/network disruptions.
        </p>

        <h2>13. Grievance Redressal Mechanism</h2>
        <p>
          In accordance with applicable law, the name and contact details of
          our Grievance Officer are:
        </p>
        <ul>
          <li><strong>Name:</strong> Ashish Chaudhary</li>
          <li><strong>Designation:</strong> Director</li>
          <li><strong>Email:</strong> grievance@xaaj.in</li>
          <li><strong>Address:</strong> G6/4C DLF GARDEN CITY SECTOR 92 GURGAON 122505 HARYANA</li>
          <li><strong>Working hours:</strong> Mon–Fri, 10:00 AM – 5:00 PM IST</li>
        </ul>
        <p>
          The Grievance Officer will acknowledge complaints within 48 hours
          and resolve them within one month of receipt.
        </p>

        <h2>14. Governing Law and Jurisdiction</h2>
        <p>
          These Terms are governed by the laws of India. Subject to the
          dispute-resolution mechanisms available under the Consumer
          Protection Act, 2019, the courts at Gurugram, Haryana shall have
          exclusive jurisdiction over disputes not resolved through such
          consumer fora.
        </p>

        <h2>15. Amendments</h2>
        <p>
          XAAJ may revise these Terms from time to time. Continued use of the
          Platform after changes are posted constitutes acceptance of the
          revised Terms. Material changes will be highlighted via the Platform
          or email where feasible.
        </p>

        <h2>16. Contact Us</h2>
        <ul>
          <li><strong>Email:</strong> customercare@xaaj.in</li>
          <li><strong>Phone:</strong> 9899446117</li>
          <li><strong>Registered Address:</strong> G6/4C DLF GARDEN CITY SECTOR 92 GURGAON 122505 HARYANA</li>
        </ul>
      </SimplePage>
    )
  }

  // ==========================================================
  // CONTACT — PREMIUM CONTACT EXPERIENCE
  // ==========================================================

  if (path === '/contact') {
    return (
      <>
        <Header />

        <style>{`
          /* ==========================================================
             XAAJ CONTACT — COMPACT PREMIUM REDESIGN
             ========================================================== */

          .xaaj-contact-page {
            background: #f7f4ee;
            color: #292825;
            overflow: hidden;
          }

          .xaaj-contact-hero {
            width: min(1180px, calc(100% - 48px));
            margin: 0 auto;
            padding: 68px 0 52px;
            display: grid;
            grid-template-columns: minmax(0, 1.08fr) minmax(360px, .82fr);
            gap: 72px;
            align-items: center;
            border-bottom: 1px solid rgba(41,40,37,.10);
          }

          .xaaj-contact-kicker {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            color: #b54d36;
            font-size: 10px;
            font-weight: 700;
            letter-spacing: .25em;
            line-height: 1;
            text-transform: uppercase;
          }

          .xaaj-contact-kicker::before {
            content: '';
            width: 26px;
            height: 1px;
            background: currentColor;
          }

          .xaaj-contact-hero h1 {
            max-width: 690px;
            margin: 18px 0 0;
            font-family: Georgia, 'Times New Roman', serif;
            font-size: clamp(48px, 5.8vw, 78px);
            font-weight: 400;
            line-height: .94;
            letter-spacing: -.052em;
          }

          .xaaj-contact-hero h1 em {
            font-weight: 400;
          }

          .xaaj-contact-hero-copy {
            max-width: 500px;
          }

          .xaaj-contact-hero-copy p {
            margin: 0;
            font-size: 15px;
            line-height: 1.75;
            color: #6e6961;
          }

          .xaaj-contact-mini {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 10px;
            margin-top: 22px;
          }

          .xaaj-contact-mini a {
            min-height: 78px;
            padding: 15px 16px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            border: 1px solid rgba(41,40,37,.11);
            background: rgba(255,255,255,.42);
            color: #292825;
            text-decoration: none;
            transition: transform .22s ease, background .22s ease, border-color .22s ease;
          }

          .xaaj-contact-mini a:hover {
            background: #fffdf9;
            border-color: rgba(41,40,37,.20);
            transform: translateY(-2px);
          }

          .xaaj-contact-mini small {
            font-size: 9px;
            text-transform: uppercase;
            letter-spacing: .16em;
            color: #999187;
          }

          .xaaj-contact-mini strong {
            font-family: Georgia, 'Times New Roman', serif;
            font-size: 16px;
            font-weight: 400;
          }

          .xaaj-contact-content {
            width: min(1180px, calc(100% - 48px));
            margin: 0 auto;
            padding: 42px 0 58px;
          }

          .xaaj-contact-content .xaaj-contact-layout {
            margin-top: 0 !important;
            grid-template-columns: minmax(0, 1.18fr) minmax(310px, .82fr) !important;
            gap: 22px !important;
            align-items: start !important;
          }

          .xaaj-contact-content .xaaj-contact-layout > form {
            padding: 32px !important;
            border-radius: 18px !important;
            background: #fffdf9 !important;
            border: 1px solid rgba(41,40,37,.10) !important;
            box-shadow: 0 18px 55px rgba(41,40,37,.055) !important;
          }

          .xaaj-contact-content .xaaj-contact-layout > form h2,
          .xaaj-contact-content .xaaj-contact-layout > div h2 {
            font-size: 28px !important;
            letter-spacing: -.025em;
          }

          .xaaj-contact-content .xaaj-contact-layout > div {
            padding: 32px !important;
            border-radius: 18px !important;
            background: #292825 !important;
            border: 1px solid #292825 !important;
            color: #fff !important;
            min-height: 0 !important;
          }

          .xaaj-contact-content .xaaj-contact-layout > div p,
          .xaaj-contact-content .xaaj-contact-layout > div a {
            color: rgba(255,255,255,.74) !important;
          }

          .xaaj-contact-content .xaaj-contact-layout > div .eyebrow {
            color: #d58b76 !important;
          }

          .xaaj-contact-content .xaaj-contact-layout > div > div:last-child {
            margin-top: 30px !important;
            gap: 20px !important;
          }

          .xaaj-contact-content .xaaj-contact-fields {
            gap: 14px !important;
          }

          .xaaj-contact-content .xaaj-contact-fields input,
          .xaaj-contact-content .xaaj-contact-fields textarea {
            border-radius: 10px !important;
            border-color: #ded6cb !important;
            transition: border-color .2s ease, box-shadow .2s ease;
          }

          .xaaj-contact-content .xaaj-contact-fields input:focus,
          .xaaj-contact-content .xaaj-contact-fields textarea:focus {
            border-color: #292825 !important;
            box-shadow: 0 0 0 3px rgba(41,40,37,.06);
          }

          .xaaj-contact-content .xaaj-contact-fields textarea {
            min-height: 120px !important;
          }

          .xaaj-contact-content .xaaj-contact-layout > form > button {
            margin-top: 18px !important;
            min-height: 48px !important;
          }

          .xaaj-contact-response-note {
            margin-top: 22px;
            padding-top: 16px;
            border-top: 1px solid rgba(41,40,37,.10);
            color: #918b82;
            font-size: 11px;
            line-height: 1.65;
          }

          @media (max-width: 900px) {
            .xaaj-contact-hero {
              grid-template-columns: 1fr;
              gap: 34px;
              padding: 56px 0 44px;
            }

            .xaaj-contact-hero h1 {
              max-width: 620px;
            }

            .xaaj-contact-hero-copy {
              max-width: 650px;
            }

            .xaaj-contact-content {
              padding: 34px 0 48px;
            }

            .xaaj-contact-content .xaaj-contact-layout {
              grid-template-columns: 1fr !important;
            }
          }

          @media (max-width: 560px) {
            .xaaj-contact-hero,
            .xaaj-contact-content {
              width: min(100% - 30px, 1180px);
            }

            .xaaj-contact-hero {
              padding: 44px 0 36px;
              gap: 28px;
            }

            .xaaj-contact-hero h1 {
              font-size: clamp(43px, 13vw, 58px);
              line-height: .95;
            }

            .xaaj-contact-hero-copy p {
              font-size: 14px;
              line-height: 1.7;
            }

            .xaaj-contact-mini {
              grid-template-columns: 1fr;
              gap: 8px;
              margin-top: 18px;
            }

            .xaaj-contact-mini a {
              min-height: 70px;
            }

            .xaaj-contact-content {
              padding: 26px 0 38px;
            }

            .xaaj-contact-content .xaaj-contact-layout {
              gap: 14px !important;
            }

            .xaaj-contact-content .xaaj-contact-layout > form,
            .xaaj-contact-content .xaaj-contact-layout > div {
              padding: 22px !important;
              border-radius: 14px !important;
            }

            .xaaj-contact-content .xaaj-contact-layout > form h2,
            .xaaj-contact-content .xaaj-contact-layout > div h2 {
              font-size: 25px !important;
            }

            .xaaj-contact-content .xaaj-contact-fields {
              grid-template-columns: 1fr !important;
              gap: 12px !important;
            }

            .xaaj-contact-content .xaaj-contact-fields label {
              grid-column: 1 / -1 !important;
            }

            .xaaj-contact-content .xaaj-contact-fields textarea {
              min-height: 115px !important;
            }
          }
        `}</style>

        <main className="xaaj-contact-page">
          <section className="xaaj-contact-hero">
            <div>
              <span className="xaaj-contact-kicker">Contact XAAJ</span>
              <h1>Let’s make <em>something clear.</em></h1>
            </div>

            <div className="xaaj-contact-hero-copy">
              <p>
                Have a question about an order, a product, delivery, or simply
                want to say hello? Our team is here and happy to help.
              </p>

              <div className="xaaj-contact-mini">
                <a href="mailto:customercare@xaaj.in">
                  <small>Email</small>
                  <strong>Write to us ↗</strong>
                </a>

                <a href="tel:+919899446117">
                  <small>Phone / WhatsApp</small>
                  <strong>Talk to us ↗</strong>
                </a>
              </div>
            </div>
          </section>

          <section className="xaaj-contact-content">
            <ContactForm />
          </section>
        </main>

        <Newsletter />
        <Footer />
      </>
    )
  }

  // FAQ content is kept unchanged until the client supplies final copy.
  if (path === '/faq') {
    return (
      <SimplePage
        eyebrow="We are here"
        title="How can we help?"
      >
        <p className="lead">
          Questions about an order, a piece
          or the making process? Write to
          customercare@xaaj.in and we’ll get back
          to you within two working days.
        </p>

        <div className="faq-list">
          <details open>
            <summary>How long does delivery take?</summary>
            <p>
              Most orders arrive within
              3–7 working days across India.
            </p>
          </details>

          <details>
            <summary>Are the pieces dishwasher safe?</summary>
            <p>
              Yes. Our tableware is made for
              everyday use and is dishwasher safe.
            </p>
          </details>

          <details>
            <summary>Can I return my order?</summary>
            <p>
              Absolutely. We offer easy returns
              within 7 days of delivery.
            </p>
          </details>
        </div>
      </SimplePage>
    )
  }

  // ==========================================================
  // DEFAULT ROUTE
  // ==========================================================

  return <Home />
}


// Woodistry styles are embedded here so App.jsx is self-contained.
const WOODISTRY_CSS = "@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@400;500;600&display=swap');\n\n:root{--wood-paper:#f5f2ec;--wood-white:#fbf9f5;--wood-ink:#292823;--wood-muted:#716b62;--wood-line:#ded8ce;--wood-serif:'Playfair Display',Georgia,serif;--wood-sans:'DM Sans',Arial,sans-serif}\nbody{font-family:var(--wood-sans);color:var(--wood-ink);background:var(--wood-paper)}\n.wood-announcement{height:35px;background:#292821;color:#f8f5ef;display:flex;align-items:center;justify-content:center;gap:13px;padding:0 5.8%;font-size:10px;letter-spacing:.01em;position:relative;z-index:1001}\n.wood-announcement i{height:13px;width:1px;background:#827e74}.wood-announcement-right{position:absolute;right:5.8%;display:flex;gap:28px;color:#d4d0c8}\n.wood-header{height:63px;background:#fbf9f5;border-bottom:1px solid #e4dfd7;display:grid;grid-template-columns:1fr auto 1fr;align-items:center;padding:0 5.8%;position:sticky;top:0;z-index:1000;color:var(--wood-ink)}\n.wood-wordmark{justify-self:start;display:flex;align-items:center;justify-content:flex-start;text-decoration:none!important;color:var(--wood-ink)!important;width:clamp(150px,17vw,245px);height:54px;white-space:nowrap;overflow:hidden}.wood-wordmark img{display:block;max-width:100%;width:100%;height:100%;object-fit:contain;object-position:left center}.wood-wordmark-text{display:none;font-size:22px;letter-spacing:.23em;font-weight:500;white-space:nowrap}\n.wood-nav{display:flex;align-items:center;gap:clamp(17px,2.2vw,36px);height:100%}.wood-nav>a{height:100%;display:flex;align-items:center;gap:5px;text-decoration:none;color:var(--wood-ink);font-size:12px;white-space:nowrap;transition:opacity .2s}.wood-nav>a:hover{opacity:.58}\n.wood-header-actions{justify-self:end;display:flex;align-items:center;gap:18px}.wood-header-actions button,.wood-mobile-menu{border:0;background:transparent;color:inherit;padding:3px;display:inline-flex;align-items:center;justify-content:center;cursor:pointer}.wood-header-actions button:hover{opacity:.6}.wood-action-search{gap:8px!important;font-size:12px}.wood-bag{position:relative}.wood-bag b{position:absolute;top:-8px;right:-8px;min-width:16px;height:16px;border-radius:50%;background:#292823;color:#fff;font-size:9px;font-weight:500;display:grid;place-items:center}.wood-mobile-menu{display:none}\n.wood-mega-menu{position:absolute;top:100%;left:0;width:100%;min-height:280px;background:#f8f5ef;box-shadow:0 18px 32px #211e1714;border-top:1px solid #e9e3da;display:grid;grid-template-columns:.8fr 1fr 1fr;gap:38px;padding:38px 12.2% 36px;z-index:1005}.wood-mega-links{display:flex;flex-direction:column;align-items:flex-start;gap:15px}.wood-mega-links>a{font-size:12px;text-decoration:none;color:var(--wood-ink);text-transform:uppercase;letter-spacing:.07em}.wood-kicker{display:block;font-size:10px;line-height:1.4;letter-spacing:.22em;text-transform:uppercase;font-weight:700;color:#756e62}.wood-mega-feature{display:grid;grid-template-columns:42% 1fr;gap:16px;align-items:center;text-decoration:none;color:var(--wood-ink);min-width:0}.wood-mega-feature img{width:100%;height:126px;object-fit:cover}.wood-mega-feature span{display:flex;flex-direction:column;align-items:flex-start;gap:8px}.wood-mega-feature small{font-size:9px;letter-spacing:.16em}.wood-mega-feature strong{font:500 22px/1.1 var(--wood-serif)}.wood-mega-feature em{font-size:11px;font-style:normal}.wood-mega-close{position:absolute;top:20px;right:5.8%;border:0;background:none;cursor:pointer}\n.wood-search-panel{position:sticky;top:63px;z-index:999;background:#fbf9f5;padding:18px 6%;display:flex;align-items:center;gap:16px;border-bottom:1px solid var(--wood-line)}.wood-search-panel input{flex:1;border:0;border-bottom:1px solid var(--wood-line);background:transparent;padding:12px 4px;font:14px var(--wood-sans);outline:none}.wood-search-panel button{display:flex;align-items:center;gap:8px;border:0;background:transparent;cursor:pointer;font-size:12px}\n.wood-home{background:var(--wood-paper);overflow:hidden}.wood-hero{height:440px;min-height:0;position:relative;overflow:hidden;background:#777064;color:#fff}.wood-hero-media,.wood-hero-shade{position:absolute;inset:0}.wood-hero-media img,.wood-hero-media video{position:absolute;width:100%;height:100%;inset:0;object-fit:cover;opacity:0;transition:opacity .9s ease;display:block}.wood-hero-media img.is-active,.wood-hero-media video.is-active{opacity:1}.wood-hero-shade{background:linear-gradient(90deg,rgba(25,23,19,.68) 0%,rgba(25,23,19,.43) 32%,rgba(25,23,19,.08) 70%,rgba(25,23,19,0) 100%)}.wood-hero-copy{position:absolute;top:50%;left:9.6%;transform:translateY(-51%);max-width:540px}.wood-hero-copy .wood-kicker{color:#fff;font-size:10px;letter-spacing:.24em;margin-bottom:17px}.wood-hero-copy h1{font:400 clamp(54px,5.1vw,78px)/.96 var(--wood-serif);letter-spacing:-.055em;margin:0 0 24px;color:#fff}.wood-hero-copy p{font-size:15px;line-height:1.75;margin:0 0 23px;color:#f4f0e9}.wood-primary-button{display:inline-flex;align-items:center;gap:26px;padding:16px 19px;background:#fbf9f5;color:#292823;text-decoration:none;font-size:12px;min-height:48px;transition:background .25s,color .25s}.wood-primary-button:hover{background:#292823;color:#fff}.wood-hero-pagination{position:absolute;left:9.6%;right:9.6%;bottom:22px;display:flex;align-items:center;justify-content:space-between}.wood-hero-numbers{display:flex;align-items:center;gap:24px}.wood-hero-numbers button{border:0;background:transparent;color:#fff;padding:4px 0;font:11px var(--wood-sans);cursor:pointer;opacity:.72;position:relative}.wood-hero-numbers button.active{opacity:1}.wood-hero-numbers button.active:after{content:'';position:absolute;left:29px;top:50%;width:24px;height:1px;background:#fff}.wood-hero-arrows{display:flex;gap:8px}.wood-hero-arrows button{width:40px;height:40px;border:1px solid #ffffff9c;border-radius:50%;color:#fff;background:transparent;font-size:19px;cursor:pointer;transition:background .2s}.wood-hero-arrows button:hover{background:#ffffff2b}\n.wood-space-section{padding:20px 5.8% 64px;display:grid;grid-template-columns:clamp(205px,14.2vw,290px) minmax(0,1fr);gap:40px;align-items:center;min-width:0}.wood-section-intro{min-width:0;align-self:center}.wood-section-intro h2{display:block;overflow:visible;line-height:1.12;padding-block:2px;margin-top:0}.wood-section-intro h2,.wood-products-intro h2,.wood-mobile-section-heading h2{font:500 32px/1.12 var(--wood-serif);letter-spacing:-.04em;margin:0 0 13px}.wood-section-intro p,.wood-products-intro p{font-size:13px;line-height:1.65;color:var(--wood-muted);margin:0 0 22px}.wood-section-intro>a,.wood-products-intro>a,.wood-mobile-section-heading>a{display:inline-flex;align-items:center;gap:8px;text-decoration:none;color:var(--wood-ink);font-size:11px;border-bottom:1px solid #777064;padding-bottom:6px}.wood-space-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.wood-space-card{height:clamp(190px,13.8vw,285px);position:relative;overflow:hidden;display:block;background:#d5cec2;color:#fff;text-decoration:none}.wood-space-card:after{content:'';position:absolute;inset:30% 0 0;background:linear-gradient(transparent,rgba(22,20,17,.58))}.wood-space-card img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .7s cubic-bezier(.2,.7,.2,1)}.wood-space-card:hover img{transform:scale(1.045)}.wood-space-card>span{position:absolute;z-index:1;left:16px;bottom:16px;display:flex;align-items:center;gap:7px;font:500 clamp(18px,1.65vw,25px)/1 var(--wood-serif);color:#fff}.wood-space-card>span svg{stroke-width:1.5}\n.wood-products-section{padding:5px 5.8% 82px;display:grid;grid-template-columns:205px minmax(0,1fr);gap:40px}.wood-products-intro{padding-top:4px}.wood-products-content{min-width:0}.wood-product-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:18px 16px;align-items:start}.wood-product-grid .product-card{min-width:0;background:transparent;border:0;border-radius:0;box-shadow:none;overflow:visible;display:flex;flex-direction:column}.wood-product-grid .product-image{position:relative;aspect-ratio: .78 / 1;overflow:hidden;background:#e4dfd7;border-radius:0;margin:0}.wood-product-grid .product-image-link{display:block;width:100%;height:100%;position:absolute;inset:0}.wood-product-grid .product-image-primary,.wood-product-grid .product-image-secondary{width:100%;height:100%;object-fit:cover;display:block;transition:opacity .45s ease,transform .7s ease}.wood-product-grid .product-image-primary{position:relative}.wood-product-grid .product-image-secondary{position:absolute;inset:0;opacity:0}.wood-product-grid .product-card:hover .product-image-primary{transform:scale(1.025)}.wood-product-grid .product-card:hover .product-image-secondary{opacity:1}.wood-product-grid .heart{position:absolute;top:12px;right:12px;width:30px;height:30px;border:0;background:transparent;color:#292823;padding:4px;z-index:2}.wood-product-grid .heart svg{width:20px;height:20px}.wood-product-grid .heart-tooltip{display:none}.wood-product-grid .product-image-bottom-spacer{display:none}.wood-product-grid .product-copy{padding:11px 0 0;display:flex;flex-direction:column;gap:4px}.wood-product-grid .product-meta{display:none}.wood-product-grid .product-title-link{text-decoration:none;color:var(--wood-ink)}.wood-product-grid .product-title-link h3{font:400 13px/1.4 var(--wood-sans);margin:0;color:var(--wood-ink)}.wood-product-grid .product-description{font-size:11px;line-height:1.4;color:#827b70;margin:0;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden}.wood-product-grid .rating{display:none}.wood-product-grid .product-bottom-row{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:1px}.wood-product-grid .price{display:flex;align-items:center;gap:6px;flex-wrap:wrap}.wood-product-grid .price strong{font-size:12px;font-weight:500;color:var(--wood-ink)}.wood-product-grid .price del,.wood-product-grid .save-badge{display:none}.wood-product-grid .add{border:1px solid #d4cec4;background:transparent;color:var(--wood-ink);border-radius:0;min-height:30px;padding:5px 8px;font-size:10px;opacity:0;transition:opacity .2s,background .2s;white-space:nowrap}.wood-product-grid .product-card:hover .add,.wood-product-grid .add:focus{opacity:1}.wood-product-grid .add:hover{background:var(--wood-ink);color:#fff}.wood-product-grid .add-label{font-size:10px}.wood-product-grid .add-icon,.wood-product-grid .add-shine{display:none}.wood-empty-products{grid-column:1/-1;color:var(--wood-muted);font-size:13px;padding:35px 0}.wood-mobile-section-heading{display:none}\n.wood-editorial{display:grid;grid-template-columns:.78fr 1.22fr;min-height:470px;background:#e9e3d9}.wood-editorial-copy{padding:70px clamp(30px,8vw,120px);display:flex;flex-direction:column;align-items:flex-start;justify-content:center}.wood-editorial-copy h2{font:400 clamp(42px,4.5vw,65px)/1.02 var(--wood-serif);letter-spacing:-.05em;margin:18px 0 20px}.wood-editorial-copy h2 em{font-weight:400;color:#8d6f54}.wood-editorial-copy p{max-width:390px;font-size:13px;line-height:1.85;color:#716b62;margin:0 0 24px}.wood-outline-button{display:inline-flex;align-items:center;gap:18px;padding:13px 17px;border:1px solid #a9a094;color:var(--wood-ink);text-decoration:none;font-size:11px}.wood-outline-button:hover{background:#292823;color:#fff;border-color:#292823}.wood-editorial-image{min-height:420px;overflow:hidden}.wood-editorial-image img{width:100%;height:100%;object-fit:cover;display:block}.wood-service-strip{padding:30px 5.8%;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:24px;border-bottom:1px solid var(--wood-line)}.wood-service-strip>div{display:flex;align-items:center;justify-content:center;gap:13px}.wood-service-strip svg{flex-shrink:0;stroke-width:1.25}.wood-service-strip span{display:flex;flex-direction:column;gap:4px}.wood-service-strip strong{font-size:11px;font-weight:600}.wood-service-strip small{font-size:10px;color:var(--wood-muted)}\n/* Footer keeps the original links and newsletter integrations, with the new visual language. */\n.footer{background:#292823!important;color:#f6f2ea!important;padding-top:54px!important}.footer .footer-main{max-width:none!important;padding-left:5.8%!important;padding-right:5.8%!important}.footer .wood-footer-wordmark{display:flex!important;flex-direction:column;align-items:flex-start;gap:12px;text-decoration:none!important;color:#f6f2ea!important}.footer .wood-footer-wordmark span{font-size:21px;letter-spacing:.2em;font-weight:500}.footer .footer-main h4{font-size:11px!important;letter-spacing:.14em;text-transform:uppercase}.footer a{color:inherit}.footer .footer-bottom{padding-left:5.8%!important;padding-right:5.8%!important}\n/* Reuse the existing newsletter and content pages without changing their data flow. */\n.newsletter{background:#e9e3d9!important;color:var(--wood-ink)!important}.newsletter .eyebrow{color:#796d5d!important}.newsletter h2{font-family:var(--wood-serif)!important}.newsletter form input{border-radius:0!important}.newsletter form button{border-radius:0!important}\n@media(max-width:1100px){.wood-header{padding:0 3.5%}.wood-wordmark{font-size:19px;letter-spacing:.18em}.wood-wordmark-text{font-size:19px;letter-spacing:.18em}.wood-nav{gap:14px}.wood-nav>a{font-size:11px}.wood-header-actions{gap:12px}.wood-space-section,.wood-products-section{padding-left:4%;padding-right:4%;grid-template-columns:170px minmax(0,1fr);gap:25px}.wood-product-grid{grid-template-columns:repeat(4,minmax(0,1fr))}.wood-product-grid .product-card:nth-child(n+5){display:none}.wood-announcement-right{right:3.5%}}\n@media(max-width:780px){.wood-announcement{height:32px;font-size:9px;padding:0 12px;gap:8px}.wood-announcement-right{display:none}.wood-header{height:62px;padding:0 18px;grid-template-columns:36px 1fr auto;gap:10px}.wood-mobile-menu{display:inline-flex;justify-self:start}.wood-wordmark{justify-self:center;width:clamp(120px,38vw,170px);font-size:18px;letter-spacing:.18em}.wood-wordmark img{object-position:center}.wood-wordmark-text{font-size:18px;letter-spacing:.18em}.wood-nav{display:none;position:absolute;top:100%;left:0;right:0;height:auto;background:#fbf9f5;padding:12px 22px 24px;box-shadow:0 16px 20px #211e1714;align-items:stretch;flex-direction:column;gap:0}.wood-nav.is-open{display:flex}.wood-nav>a{min-height:47px;border-bottom:1px solid #e9e3da;justify-content:space-between;font-size:13px}.wood-header-actions{gap:11px}.wood-action-search span{display:none}.wood-header-actions button svg{width:19px;height:19px}.wood-header-actions button:first-child{display:inline-flex}.wood-header-actions button:nth-child(2){display:none}.wood-bag b{top:-6px;right:-6px}.wood-mega-menu{display:none}.wood-search-panel{top:62px;padding:12px 18px;gap:10px}.wood-search-panel input{min-width:0}.wood-hero{height:615px;min-height:0;max-height:none}.wood-hero-shade{background:linear-gradient(90deg,rgba(25,23,19,.62),rgba(25,23,19,.12)),linear-gradient(0deg,rgba(25,23,19,.28),transparent 50%)}.wood-hero-copy{left:7%;right:6%;top:49%;max-width:460px}.wood-hero-copy h1{font-size:clamp(52px,12vw,72px)}.wood-hero-copy p{font-size:13px}.wood-hero-pagination{left:7%;right:7%;bottom:18px}.wood-space-section{padding:42px 18px 48px;display:block}.wood-section-intro{display:grid;grid-template-columns:1fr auto;align-items:end;margin-bottom:20px}.wood-section-intro h2{font-size:29px;margin:0}.wood-section-intro p{grid-column:1;grid-row:2;margin:8px 0 0;font-size:12px}.wood-section-intro>a{grid-column:2;grid-row:1/3;align-self:end}.wood-space-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.wood-space-card{height:clamp(175px,51vw,260px)}.wood-space-card>span{left:12px;bottom:13px;font-size:21px}.wood-products-section{padding:5px 18px 55px;display:block}.wood-products-intro{display:none}.wood-mobile-section-heading{display:flex;align-items:center;justify-content:space-between;margin-bottom:17px}.wood-mobile-section-heading h2{font-size:29px;margin:0}.wood-mobile-section-heading>a{font-size:11px}.wood-product-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:26px 12px}.wood-product-grid .product-card:nth-child(n+5){display:flex}.wood-product-grid .product-image{aspect-ratio:.79/1}.wood-product-grid .product-copy{padding-top:9px}.wood-product-grid .product-title-link h3{font-size:12px}.wood-product-grid .product-description{font-size:10px}.wood-product-grid .price strong{font-size:12px}.wood-product-grid .add{opacity:1;padding:5px 6px;min-height:27px}.wood-product-grid .add-label{font-size:9px}.wood-product-grid .heart{top:8px;right:8px}.wood-editorial{grid-template-columns:1fr}.wood-editorial-copy{padding:48px 24px 42px;order:2}.wood-editorial-copy h2{font-size:48px}.wood-editorial-image{min-height:290px;height:65vw;order:1}.wood-service-strip{grid-template-columns:repeat(2,minmax(0,1fr));gap:23px 12px;padding:25px 18px}.wood-service-strip>div{justify-content:flex-start;gap:10px}.wood-service-strip svg{width:20px}.wood-service-strip strong{font-size:10px}.wood-service-strip small{font-size:9px}.footer .footer-main{padding-left:22px!important;padding-right:22px!important}.footer .footer-bottom{padding-left:22px!important;padding-right:22px!important}.footer .wood-footer-wordmark span{font-size:18px}}\n@media(max-width:390px){.wood-wordmark{font-size:15px;letter-spacing:.16em}.wood-wordmark-text{font-size:15px;letter-spacing:.16em}.wood-header-actions{gap:8px}.wood-header-actions button svg{width:18px;height:18px}.wood-hero{height:540px}.wood-hero-copy h1{font-size:49px}.wood-space-card>span{font-size:18px}.wood-product-grid .product-bottom-row{align-items:flex-start;flex-direction:column}.wood-product-grid .add{width:100%}.wood-service-strip{grid-template-columns:1fr 1fr}}\n.wood-demo-product{min-width:0;display:flex;flex-direction:column;align-items:stretch}.wood-demo-image{aspect-ratio:.78/1;position:relative;display:block;overflow:hidden;background:#e4dfd7;color:var(--wood-ink)}.wood-demo-image img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .7s ease}.wood-demo-product:hover .wood-demo-image img{transform:scale(1.035)}.wood-demo-heart{position:absolute;right:12px;top:12px}.wood-demo-quick{position:absolute;bottom:0;left:0;right:0;padding:11px 6px;text-align:center;background:#fbf9f5eF;color:var(--wood-ink);font-size:11px;transform:translateY(100%);transition:transform .25s}.wood-demo-product:hover .wood-demo-quick{transform:translateY(0)}.wood-demo-name{margin-top:11px;font-size:13px;line-height:1.4;text-decoration:none;color:var(--wood-ink)}.wood-demo-product p{margin:3px 0 5px;font-size:11px;color:#827b70}.wood-demo-product>strong{font-size:12px;font-weight:500}@media(max-width:780px){.wood-demo-heart{top:8px;right:8px}.wood-demo-name{font-size:12px}.wood-demo-quick{transform:none;font-size:10px;padding:8px 4px}}\n@media(min-width:781px){.wood-hero{height:440px;min-height:0}.wood-space-section{padding-top:24px}.wood-section-intro{overflow:visible;align-self:center}.wood-section-intro h2{display:block;overflow:visible;line-height:1.12;margin:0 0 13px;padding:2px 0}}\n/* Homepage Best Sellers: clean editorial product layout matching the Oak Lounge reference. */\n.wood-product-grid .wood-home-product{min-width:0;display:flex;flex-direction:column;background:transparent;border:0;border-radius:0;box-shadow:none;overflow:visible}\n/* Best Sellers image ratio matches reference: 206 x 265 */.wood-product-grid .wood-home-product-image{position:relative;width:100%;aspect-ratio:206/265;height:auto;min-height:0;overflow:hidden;background:#e4dfd7;border-radius:0}\n.wood-product-grid .wood-home-product-image>a{position:absolute;inset:0;display:block;width:100%;height:100%;overflow:hidden}\n.wood-product-grid .wood-home-product-image img{display:block;width:100%;height:100%;object-fit:cover;transition:transform .65s ease}\n.wood-product-grid .wood-home-product:hover .wood-home-product-image img{transform:scale(1.045)}\n.wood-product-grid .wood-home-product-quick{position:absolute;left:0;right:0;bottom:0;z-index:2;display:flex;align-items:center;justify-content:center;gap:8px;min-height:42px;padding:10px 8px;background:rgba(251,249,245,.94);color:var(--wood-ink);font-size:12px;letter-spacing:.01em;transform:translateY(101%);opacity:0;transition:transform .28s ease,opacity .28s ease}\n.wood-product-grid .wood-home-product:hover .wood-home-product-quick,.wood-product-grid .wood-home-product:focus-within .wood-home-product-quick{transform:translateY(0);opacity:1}\n.wood-product-grid .wood-home-product-image-link:focus-visible{outline:2px solid var(--wood-ink);outline-offset:-3px}\n.wood-product-grid .wood-home-product-heart{position:absolute;top:10px;right:10px;width:30px;height:30px;display:grid;place-items:center;padding:0;border:0;background:transparent;color:#292823;cursor:pointer}\n.wood-product-grid .wood-home-product-details{padding:11px 0 0;min-width:0}\n.wood-product-grid .wood-home-product-title-row{display:flex;align-items:baseline;justify-content:space-between;gap:8px;min-width:0}\n.wood-product-grid .wood-home-product-name{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-decoration:none;color:var(--wood-ink);font-size:13px;line-height:1.4}\n.wood-product-grid .wood-home-product-price{flex-shrink:0;color:var(--wood-ink);font-size:12px;font-weight:500;white-space:nowrap}\n.wood-product-grid .wood-home-product-material{margin:7px 0 0;color:#827b70;font-size:11px;line-height:1.4}\n@media(max-width:780px){.wood-product-grid .wood-home-product-image{aspect-ratio:.78/1}.wood-product-grid .wood-home-product-heart{top:8px;right:8px}.wood-product-grid .wood-home-product-name{font-size:12px}.wood-product-grid .wood-home-product-price{font-size:12px}.wood-product-grid .wood-home-product-material{font-size:10px;margin-top:5px}.wood-product-grid .wood-home-product-title-row{gap:5px}}\n\n\n\n/* WOODISTRY SHOP COLLECTION */\n.wood-shop-page .breadcrumbs a{color:inherit;text-decoration:none}\n.wood-shop-title{align-items:flex-end;gap:32px}\n.wood-shop-title h1{max-width:900px}\n.wood-shop-title p{max-width:620px}\n.wood-shop-sort-label select{min-width:170px}\n.wood-shop-filters{display:flex;gap:30px;align-items:center;overflow-x:auto;white-space:nowrap;scrollbar-width:none}\n.wood-shop-filters::-webkit-scrollbar{display:none}\n.wood-shop-filters a{flex:0 0 auto;text-decoration:none}\n.wood-shop-filters a.active{color:#292824;border-bottom-color:#292824}\n.wood-shop-result-count{margin:22px 0 18px;color:#777167;font-size:12px;letter-spacing:.04em}\n.wood-shop-grid{align-items:start}\n.wood-shop-empty{grid-column:1/-1;min-height:300px;display:flex;flex-direction:column;align-items:flex-start;justify-content:center;padding:48px 0 64px;border-top:1px solid #e5dfd5}\n.wood-shop-empty h2{margin:12px 0;font-family:Georgia,\"Times New Roman\",serif;font-size:clamp(28px,3vw,42px);font-weight:400;line-height:1.12;color:#292824}\n.wood-shop-empty p{max-width:470px;margin:0;color:#777167;font-size:15px;line-height:1.8}\n.wood-shop-reset{display:inline-flex;align-items:center;gap:12px;margin-top:24px;padding:13px 0;border-bottom:1px solid #292824;color:#292824;text-decoration:none;font-size:13px}\n.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}\n@media(max-width:780px){.wood-shop-title{align-items:flex-start;flex-direction:column;gap:20px}.wood-shop-title h1{font-size:clamp(42px,11vw,64px)}.wood-shop-filters{gap:22px}.wood-shop-empty{min-height:240px;padding:34px 0 48px}.wood-shop-result-count{margin:18px 0 14px}}"


const WOODISTRY_FOOTER_CSS = `
.newsletter {
  position: relative;
  overflow: hidden;
  padding: clamp(62px, 7.5vw, 108px) 24px clamp(68px, 7vw, 96px);
  text-align: center;
  background: #e9e2d6;
  color: #292823;
  border-top: 1px solid #ded5c8;
}
.newsletter:before, .newsletter:after {
  content: "";
  position: absolute;
  top: 50%;
  width: min(18vw, 240px);
  height: 1px;
  background: #c8bba8;
  opacity: .7;
}
.newsletter:before { left: 0; }
.newsletter:after { right: 0; }
.newsletter .eyebrow { color: #776b58; font-size: 10px; letter-spacing: .25em; }
.newsletter h2 {
  margin: 17px 0 14px;
  font: 400 clamp(38px, 4.2vw, 62px)/1.12 var(--wood-serif);
  letter-spacing: -.045em;
}
.newsletter p {
  max-width: 590px;
  margin: 0 auto 28px;
  color: #716b62;
  font-size: 14px;
  line-height: 1.8;
}
.newsletter form {
  display: flex;
  width: min(100%, 540px);
  min-height: 54px;
  margin: 0 auto;
  border: 1px solid #d5cabb;
  background: #fbf9f5;
}
.newsletter form input {
  flex: 1;
  min-width: 0;
  border: 0;
  outline: 0;
  padding: 0 20px;
  background: transparent;
  color: #292823;
  font: 13px var(--wood-sans);
}
.newsletter form input:focus-visible { box-shadow: inset 0 0 0 1px #9b8b73; }
.newsletter form button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  min-width: 150px;
  padding: 0 22px;
  border: 0;
  background: #29372e;
  color: #fbf9f5;
  font: 500 12px var(--wood-sans);
  transition: background .2s ease;
}
.newsletter form button:hover:not(:disabled) { background: #405044; }
.newsletter form button:disabled { opacity: .7; }
@media(max-width:780px) {
  .newsletter { padding: 54px 20px 60px; }
  .newsletter:before, .newsletter:after { display: none; }
  .newsletter h2 { margin-top: 14px; font-size: clamp(36px, 9vw, 48px); }
  .newsletter p { max-width: 390px; margin-bottom: 24px; font-size: 13px; }
  .newsletter form { flex-direction: column; gap: 0; border: 0; background: transparent; }
  .newsletter form input { min-height: 52px; width: 100%; box-sizing: border-box; border: 1px solid #d5cabb; background: #fbf9f5; padding: 0 15px; }
  .newsletter form button { min-height: 50px; width: 100%; margin-top: 9px; }
}
`;

// ============================================================
// APP ROOT
// ============================================================

export default function AppRoot() {
  return (
    <>
      <style data-woodistry-styles>{WOODISTRY_CSS}</style>
      <style data-woodistry-footer-styles>{WOODISTRY_FOOTER_CSS}</style>
      <AuthProvider>
        <StoreProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </StoreProvider>
      </AuthProvider>
    </>
  )


}
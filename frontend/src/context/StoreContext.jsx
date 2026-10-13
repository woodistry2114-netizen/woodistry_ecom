import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react'

import { productService } from '../services/api'

const StoreContext = createContext(null)

// =====================================================
// Read data from localStorage
// =====================================================

function readStorage(key, fallback) {
  try {
    const value = window.localStorage.getItem(key)

    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

// =====================================================
// Normalize Product
// =====================================================

function normalizeProduct(product) {
  return {
    ...product,

    id: product._id,

    image: product.images?.[0] || '',

    // MRP is the proper old/display price
    old:
      product.mrp ??
      product.compareAtPrice ??
      null,

    tag:
      product.tags?.[0] ||
      'New',

    // Product rating from backend
    rating:
      Number(product.rating || 0),

    // Product review count from backend
    reviews:
      Number(product.reviewCount || 0),

    reviewCount:
      Number(product.reviewCount || 0)
  }
}

// =====================================================
// Store Provider
// =====================================================

export function StoreProvider({ children }) {
  const [cart, setCart] = useState(() =>
    readStorage('xaaj-cart', [])
  )

  const [wish, setWish] = useState(() =>
    readStorage('xaaj-wishlist', [])
  )

  const [products, setProducts] = useState([])

  // ===================================================
  // Load Products
  // ===================================================

  const loadProducts = async () => {
    try {
      const result = await productService.list({
        limit: 48
      })

      const productList = Array.isArray(result?.data)
        ? result.data
        : []

      setProducts(
        productList.map(normalizeProduct)
      )
    } catch (error) {
      console.error(
        'Products load error:',
        error
      )
    }
  }

  // ===================================================
  // Initial Product Load
  // ===================================================

  useEffect(() => {
    let cancelled = false

    async function initialLoad() {
      try {
        const result = await productService.list({
          limit: 48
        })

        const productList = Array.isArray(result?.data)
          ? result.data
          : []

        if (cancelled) return

        setProducts(
          productList.map(normalizeProduct)
        )
      } catch (error) {
        if (!cancelled) {
          console.error(
            'Products load error:',
            error
          )

          setProducts([])
        }
      }
    }

    initialLoad()

    return () => {
      cancelled = true
    }
  }, [])

  // ===================================================
  // NEW ARRIVALS
  // ===================================================
  // Latest products first.
  //
  // Admin jaise hi new product add karega aur backend
  // createdAt save karega, product automatically
  // New Arrivals me upar aa jayega.
  // ===================================================

  const newArrivals = useMemo(() => {
    return [...products]
      .sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime()
        const dateB = new Date(b.createdAt || 0).getTime()

        return dateB - dateA
      })
      .slice(0, 4)
  }, [products])

  // ===================================================
  // BEST-SELLING PRODUCTS
  // ===================================================
  // Products with good customer feedback.
  //
  // Current rule:
  //
  // rating >= 4
  // reviewCount > 0
  //
  // Pehle rating ke according,
  // phir review count ke according,
  // phir latest product.
  //
  // Jaise-jaise reviews aayenge aur rating update hogi,
  // ye section automatically update hoga.
  // ===================================================

  const bestSellingProducts = useMemo(() => {
    return [...products]
      .filter(product => {
        const rating = Number(product.rating || 0)
        const reviewCount = Number(
          product.reviewCount ||
          product.reviews ||
          0
        )

        return (
          rating >= 4 &&
          reviewCount > 0
        )
      })
      .sort((a, b) => {
        const ratingA = Number(a.rating || 0)
        const ratingB = Number(b.rating || 0)

        if (ratingB !== ratingA) {
          return ratingB - ratingA
        }

        const reviewsA = Number(
          a.reviewCount ||
          a.reviews ||
          0
        )

        const reviewsB = Number(
          b.reviewCount ||
          b.reviews ||
          0
        )

        if (reviewsB !== reviewsA) {
          return reviewsB - reviewsA
        }

        const dateA = new Date(
          a.createdAt || 0
        ).getTime()

        const dateB = new Date(
          b.createdAt || 0
        ).getTime()

        return dateB - dateA
      })
      .slice(0, 4)
  }, [products])

  // ===================================================
  // ADD TO CART
  // ===================================================

  const add = product => {
    setCart(items => {
      const found = items.find(
        item => item.id === product.id
      )

      const stock = Number(
        product.stock ?? 0
      )

      // Product out of stock
      if (stock <= 0) {
        return items
      }

      // Product already exists in cart
      if (found) {
        // Already reached available stock
        if (found.qty >= stock) {
          return items
        }

        return items.map(item =>
          item.id === product.id
            ? {
                ...item,
                qty: item.qty + 1
              }
            : item
        )
      }

      // Add new product
      return [
        ...items,
        {
          ...product,
          qty: 1
        }
      ]
    })
  }

  // ===================================================
  // REMOVE FROM CART
  // ===================================================

  const remove = id => {
    setCart(items =>
      items.filter(
        item => item.id !== id
      )
    )
  }

  // ===================================================
  // CHANGE CART QUANTITY
  // ===================================================

  const change = (id, delta) => {
    setCart(items =>
      items.map(item => {
        if (item.id !== id) {
          return item
        }

        const stock = Number(
          item.stock ?? 0
        )

        const currentQty = Number(
          item.qty || 1
        )

        const newQty =
          currentQty + delta

        // Minimum quantity = 1
        if (newQty < 1) {
          return {
            ...item,
            qty: 1
          }
        }

        // Maximum quantity = available stock
        if (
          stock > 0 &&
          newQty > stock
        ) {
          return {
            ...item,
            qty: stock
          }
        }

        return {
          ...item,
          qty: newQty
        }
      })
    )
  }

  // ===================================================
  // CLEAR CART
  // ===================================================

  const clearCart = () => {
    setCart([])
  }

  // ===================================================
  // WISHLIST
  // ===================================================

  const toggleWish = id => {
    setWish(items =>
      items.includes(id)
        ? items.filter(
            item => item !== id
          )
        : [...items, id]
    )
  }

  // ===================================================
  // SAVE CART
  // ===================================================

  useEffect(() => {
    window.localStorage.setItem(
      'xaaj-cart',
      JSON.stringify(cart)
    )
  }, [cart])

  // ===================================================
  // SAVE WISHLIST
  // ===================================================

  useEffect(() => {
    window.localStorage.setItem(
      'xaaj-wishlist',
      JSON.stringify(wish)
    )
  }, [wish])

  // ===================================================
  // STORE VALUES
  // ===================================================

  const value = useMemo(
    () => ({
      // -----------------------------------------------
      // Products
      // -----------------------------------------------

      products,

      // Latest products
      newArrivals,

      // Products with good ratings/reviews
      bestSellingProducts,

      // Manually refresh latest products
      // Useful after submitting a review.
      loadProducts,

      // -----------------------------------------------
      // Cart
      // -----------------------------------------------

      cart,

      add,

      remove,

      change,

      clearCart,

      // -----------------------------------------------
      // Wishlist
      // -----------------------------------------------

      wish,

      toggleWish,

      // -----------------------------------------------
      // Cart count
      // -----------------------------------------------

      count: cart.reduce(
        (total, item) =>
          total +
          Number(item.qty || 0),
        0
      ),

      // -----------------------------------------------
      // Cart subtotal
      // -----------------------------------------------

      total: cart.reduce(
        (total, item) =>
          total +
          Number(item.price || 0) *
            Number(item.qty || 0),
        0
      )
    }),
    [
      products,
      newArrivals,
      bestSellingProducts,
      cart,
      wish
    ]
  )

  return (
    <StoreContext.Provider
      value={value}
    >
      {children}
    </StoreContext.Provider>
  )
}

// =====================================================
// useStore Hook
// =====================================================

export const useStore = () =>
  useContext(StoreContext)
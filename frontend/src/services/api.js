// ============================================================
// XAAJ API CONFIGURATION
// ============================================================

const API_URL = (
  import.meta.env.VITE_API_URL ||
  'http://localhost:7100/api'
).replace(/\/$/, '')


// ============================================================
// COMMON API REQUEST
// ============================================================

export async function apiRequest(
  path,
  options = {}
) {
  const token =
    window.localStorage.getItem(
      'xaaj_token'
    )

  const headers = new Headers(
    options.headers || {}
  )

  // JSON Content-Type only when body exists
  if (
    !headers.has('Content-Type') &&
    options.body
  ) {
    headers.set(
      'Content-Type',
      'application/json'
    )
  }

  // Add JWT token when user is logged in
  if (token) {
    headers.set(
      'Authorization',
      `Bearer ${token}`
    )
  }

  const response = await fetch(
    `${API_URL}${path}`,
    {
      ...options,
      headers,
      credentials: 'include'
    }
  )

  const body =
    await response
      .json()
      .catch(() => ({}))

  if (!response.ok) {
    const error = new Error(
      body.message ||
      body.error ||
      `Request failed with status ${response.status}`
    )

    error.status =
      response.status

    error.data = body

    throw error
  }

  return body
}


// ============================================================
// AUTH SERVICES
// ============================================================

export const authService = {

  // ----------------------------------------------------------
  // Register new customer
  // ----------------------------------------------------------

  register: data =>
    apiRequest(
      '/auth/register',
      {
        method: 'POST',
        body: JSON.stringify(data)
      }
    ),


  // ----------------------------------------------------------
  // Normal login
  // ----------------------------------------------------------

  login: data =>
    apiRequest(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify(data)
      }
    ),


  // ----------------------------------------------------------
  // Verify registration email OTP
  // ----------------------------------------------------------

  verifyEmail: data =>
    apiRequest(
      '/auth/verify-email',
      {
        method: 'POST',
        body: JSON.stringify(data)
      }
    ),


  // ----------------------------------------------------------
  // Resend registration email OTP
  // ----------------------------------------------------------

  resendVerification: data =>
    apiRequest(
      '/auth/resend-verification',
      {
        method: 'POST',
        body: JSON.stringify(data)
      }
    ),


  // ----------------------------------------------------------
  // Forgot password
  // ----------------------------------------------------------

  forgotPassword: data =>
    apiRequest(
      '/auth/forgot-password',
      {
        method: 'POST',
        body: JSON.stringify(data)
      }
    ),


  // ----------------------------------------------------------
  // Verify password reset OTP
  // ----------------------------------------------------------

  verifyResetOtp: data =>
    apiRequest(
      '/auth/verify-reset-otp',
      {
        method: 'POST',
        body: JSON.stringify(data)
      }
    ),


  // ----------------------------------------------------------
  // Reset password
  // ----------------------------------------------------------

  resetPassword: data =>
    apiRequest(
      '/auth/reset-password',
      {
        method: 'POST',
        body: JSON.stringify(data)
      }
    ),


  // ----------------------------------------------------------
  // Get currently logged-in user
  // ----------------------------------------------------------

  me: () =>
    apiRequest('/auth/me'),


  // ----------------------------------------------------------
  // Logout
  // ----------------------------------------------------------

  logout: () =>
    apiRequest(
      '/auth/logout',
      {
        method: 'POST'
      }
    )
}


// ============================================================
// PRODUCT SERVICES
// ============================================================

export const productService = {

  // ----------------------------------------------------------
  // Get product list
  // ----------------------------------------------------------

  list: params => {
    const query =
      new URLSearchParams(
        params || {}
      ).toString()

    return apiRequest(
      `/products${
        query
          ? `?${query}`
          : ''
      }`
    )
  },


  // ----------------------------------------------------------
  // Get single product by slug / identifier
  // ----------------------------------------------------------

  get: identifier =>
    apiRequest(
      `/products/${encodeURIComponent(
        identifier
      )}`
    )
}


// ============================================================
// CMS SERVICES
// ============================================================

export const cmsService = {

  // ----------------------------------------------------------
  // Get announcement
  // ----------------------------------------------------------

  getAnnouncement: () =>
    apiRequest(
      '/cms/announcement'
    ),


  // ----------------------------------------------------------
  // Get active hero slider slides
  // ----------------------------------------------------------

  getHero: () =>
    apiRequest('/cms/hero'),


  // ----------------------------------------------------------
  // Get complete home CMS data
  // ----------------------------------------------------------

  getHome: () =>
    apiRequest('/cms/home'),


  // ----------------------------------------------------------
  // Admin: get all CMS content
  // ----------------------------------------------------------

  getAll: type =>
    apiRequest(
      `/cms${
        type
          ? `?type=${encodeURIComponent(
              type
            )}`
          : ''
      }`
    ),


  // ----------------------------------------------------------
  // Admin: create CMS content
  // ----------------------------------------------------------

  create: data =>
    apiRequest(
      '/cms',
      {
        method: 'POST',
        body: JSON.stringify(data)
      }
    ),


  // ----------------------------------------------------------
  // Admin: update CMS content
  // ----------------------------------------------------------

  update: (id, data) =>
    apiRequest(
      `/cms/${id}`,
      {
        method: 'PATCH',
        body: JSON.stringify(data)
      }
    ),


  // ----------------------------------------------------------
  // Admin: delete CMS content
  // ----------------------------------------------------------

  remove: id =>
    apiRequest(
      `/cms/${id}`,
      {
        method: 'DELETE'
      }
    ),


  // ----------------------------------------------------------
  // Admin: update hero slides
  // ----------------------------------------------------------

  updateHero: slides =>
    apiRequest(
      '/cms/hero',
      {
        method: 'PUT',
        body: JSON.stringify({
          slides
        })
      }
    ),


  // ----------------------------------------------------------
  // Admin: update announcement
  // ----------------------------------------------------------

  updateAnnouncement: data =>
    apiRequest(
      '/cms/announcement',
      {
        method: 'PUT',
        body: JSON.stringify(data)
      }
    )
}


// ============================================================
// BLOG SERVICES
// ============================================================

export const blogService = {

  // ----------------------------------------------------------
  // Get all published blogs
  // GET /api/blogs
  // ----------------------------------------------------------

  list: params => {
    const query =
      new URLSearchParams(
        params || {}
      ).toString()

    return apiRequest(
      `/blogs${
        query
          ? `?${query}`
          : ''
      }`
    )
  },


  // ----------------------------------------------------------
  // Get single published blog by slug
  // GET /api/blogs/:slug
  // ----------------------------------------------------------

  get: slug =>
    apiRequest(
      `/blogs/${encodeURIComponent(
        slug
      )}`
    ),


  // ----------------------------------------------------------
  // Admin: get all blogs
  // GET /api/blogs/admin
  // ----------------------------------------------------------

  adminList: () =>
    apiRequest('/blogs/admin'),


  // ----------------------------------------------------------
  // Admin: create blog
  // POST /api/blogs
  // ----------------------------------------------------------

  create: data =>
    apiRequest(
      '/blogs',
      {
        method: 'POST',
        body: JSON.stringify(data)
      }
    ),


  // ----------------------------------------------------------
  // Admin: update blog
  // PATCH /api/blogs/:id
  // ----------------------------------------------------------

  update: (id, data) =>
    apiRequest(
      `/blogs/${id}`,
      {
        method: 'PATCH',
        body: JSON.stringify(data)
      }
    ),


  // ----------------------------------------------------------
  // Admin: delete blog
  // DELETE /api/blogs/:id
  // ----------------------------------------------------------

  remove: id =>
    apiRequest(
      `/blogs/${id}`,
      {
        method: 'DELETE'
      }
    ),


  // ----------------------------------------------------------
  // Admin: publish / unpublish blog
  // PATCH /api/blogs/:id/publish
  // ----------------------------------------------------------

  publish: (
    id,
    isPublished
  ) =>
    apiRequest(
      `/blogs/${id}/publish`,
      {
        method: 'PATCH',
        body: JSON.stringify({
          isPublished
        })
      }
    )
}


// ============================================================
// NEWSLETTER SERVICES
// ============================================================

export const newsletterService = {

  // ----------------------------------------------------------
  // Subscribe to XAAJ newsletter
  // POST /api/newsletter/subscribe
  // ----------------------------------------------------------

  subscribe: email =>
    apiRequest(
      '/newsletter/subscribe',
      {
        method: 'POST',
        body: JSON.stringify({
          email: String(
            email || ''
          )
            .trim()
            .toLowerCase()
        })
      }
    )
}


// ============================================================
// CONTACT SERVICES
// ============================================================

export const contactService = {

  // ----------------------------------------------------------
  // Send customer contact enquiry
  // POST /api/contact
  // ----------------------------------------------------------

  send: data =>
    apiRequest(
      '/contact',
      {
        method: 'POST',

        body: JSON.stringify({
          name: String(
            data?.name || ''
          ).trim(),

          email: String(
            data?.email || ''
          )
            .trim()
            .toLowerCase(),

          phone: String(
            data?.phone || ''
          ).trim(),

          message: String(
            data?.message || ''
          ).trim()
        })
      }
    )
}


// ============================================================
// CART SERVICES
// ============================================================

export const cartService = {

  // ----------------------------------------------------------
  // Get cart
  // ----------------------------------------------------------

  get: () =>
    apiRequest(
      '/commerce/cart'
    ),


  // ----------------------------------------------------------
  // Update cart
  // ----------------------------------------------------------

  update: items =>
    apiRequest(
      '/commerce/cart',
      {
        method: 'PUT',
        body: JSON.stringify({
          items
        })
      }
    )
}


// ============================================================
// WISHLIST SERVICES
// ============================================================

export const wishlistService = {

  // ----------------------------------------------------------
  // Get wishlist
  // ----------------------------------------------------------

  get: () =>
    apiRequest(
      '/commerce/wishlist'
    ),


  // ----------------------------------------------------------
  // Add product to wishlist
  // ----------------------------------------------------------

  add: id =>
    apiRequest(
      `/commerce/wishlist/${id}`,
      {
        method: 'POST'
      }
    ),


  // ----------------------------------------------------------
  // Remove product from wishlist
  // ----------------------------------------------------------

  remove: id =>
    apiRequest(
      `/commerce/wishlist/${id}`,
      {
        method: 'DELETE'
      }
    )
}


// ============================================================
// ORDER SERVICES
// ============================================================

export const orderService = {

  // ----------------------------------------------------------
  // Get logged-in user's orders
  // ----------------------------------------------------------

  list: params =>
    apiRequest(
      `/orders${
        params
          ? `?${new URLSearchParams(
              params
            )}`
          : ''
      }`
    ),


  // ----------------------------------------------------------
  // Create order
  //
  // Used for:
  // - COD
  // - General order creation
  // ----------------------------------------------------------

  create: data =>
    apiRequest(
      '/orders',
      {
        method: 'POST',
        body: JSON.stringify(data)
      }
    ),


  // ----------------------------------------------------------
  // Get single order
  // ----------------------------------------------------------

  get: id =>
    apiRequest(
      `/orders/${encodeURIComponent(
        id
      )}`
    ),


  // ----------------------------------------------------------
  // Cancel order
  //
  // Backend allows cancellation only
  // while order status is "pending".
  // ----------------------------------------------------------

  cancel: id =>
    apiRequest(
      `/orders/${encodeURIComponent(
        id
      )}/cancel`,
      {
        method: 'PATCH'
      }
    )
}


// ============================================================
// REVIEW SERVICES
// ============================================================

export const reviewService = {

  // ----------------------------------------------------------
  // Submit product review
  //
  // POST /api/reviews
  //
  // Only delivered orders can be reviewed.
  // ----------------------------------------------------------

  create: data =>
    apiRequest(
      '/reviews',
      {
        method: 'POST',
        body: JSON.stringify({
          orderId: data?.orderId,
          productId: data?.productId,
          rating: Number(data?.rating),
          comment: String(
            data?.comment || ''
          ).trim()
        })
      }
    ),


  // ----------------------------------------------------------
  // Get all reviews for a product
  //
  // GET /api/reviews/product/:productId
  // ----------------------------------------------------------

  getProductReviews: productId =>
    apiRequest(
      `/reviews/product/${encodeURIComponent(
        productId
      )}`
    ),


  // ----------------------------------------------------------
  // Get reviews for a particular order
  //
  // Used by My Orders page to determine:
  // - which products can be reviewed
  // - which products are already reviewed
  // ----------------------------------------------------------

  getOrderReviews: orderId =>
    apiRequest(
      `/reviews/order/${encodeURIComponent(
        orderId
      )}`
    )
}


// ============================================================
// PAYMENT SERVICES
// ============================================================

export const paymentService = {

  // ----------------------------------------------------------
  // Create Razorpay + MongoDB pending order
  //
  // paymentMethod:
  // "razorpay"
  // ----------------------------------------------------------

  createOrder: data =>
    apiRequest(
      '/payment/create-order',
      {
        method: 'POST',
        body: JSON.stringify({
          ...data,

          paymentMethod:
            data?.paymentMethod ||
            'razorpay'
        })
      }
    ),


  // ----------------------------------------------------------
  // Verify Razorpay payment
  // ----------------------------------------------------------

  verify: data =>
    apiRequest(
      '/payment/verify',
      {
        method: 'POST',
        body: JSON.stringify(data)
      }
    )
}


// ============================================================
// EXPORT
// ============================================================

export {
  API_URL
}
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { env } from '../config/env.js'

// ============================================================
// WOODISTRY PRODUCT CATEGORIES
// ============================================================

// Current Woodistry storefront categories.
const WOODISTRY_CATEGORY_MAP = {
  'Dining & Serving': [
    'Serving Trays',
    'Serving Platters',
    'Platters',
    'Cake Stands',
    'Tea Coasters',
    'Cups & Mugs',
    'Salad Bowls',
    'Napkin Holders'
  ],
  'Kitchen Essentials': [
    'Spice Boxes',
    'Chopping Boards',
    'Mortar & Pestle',
    'Serving & Cooking Spoons',
    'Cutlery Holders',
    'Kitchen Organisers'
  ],
  'Storage & Containers': [
    'Dry Fruit Boxes',
    'Bowls & Jars',
    'Refreshment Jars',
    'Casseroles',
    'Folding & Fruit Baskets'
  ]
}

// Keep legacy furniture categories accepted so older product data and
// existing update flows are not rejected while the catalogue is migrated.
const LEGACY_WOODISTRY_CATEGORIES = [
  'Living Room',
  'Sofas & Chairs',
  'Dining',
  'Bedroom',
  'Tables',
  'Storage'
]

const WOODISTRY_CATEGORIES = [
  ...Object.keys(WOODISTRY_CATEGORY_MAP),
  ...LEGACY_WOODISTRY_CATEGORIES
]

// ============================================================
// ASYNC HANDLER
// ============================================================

export function asyncHandler(fn) {
  return (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next)
}

// ============================================================
// AUTH PROTECTION
// ============================================================

export function protect(req, res, next) {
  const token =
    req.cookies?.token ||
    req.headers.authorization?.replace(/^Bearer\s+/i, '')

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    })
  }

  try {
    req.user = jwt.verify(token, env.jwtSecret)
    next()
  } catch {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    })
  }
}

// ============================================================
// ADMIN PROTECTION
// ============================================================

export function adminOnly(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    })
  }

  next()
}

// ============================================================
// VALIDATION MIDDLEWARE
// ============================================================

export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query
    })

    if (!result.success) {
      return res.status(422).json({
        success: false,
        message: 'Validation failed',
        errors: result.error.flatten()
      })
    }

    req.validated = result.data
    next()
  }
}

// ============================================================
// REGISTER VALIDATION
// ============================================================

export const registerSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, 'Name must be at least 2 characters')
      .max(80, 'Name cannot exceed 80 characters'),

    email: z
      .string()
      .trim()
      .email('Please enter a valid email address'),

    password: z
      .string()
      .min(8, 'Password must be at least 8 characters'),

    phone: z
      .string()
      .trim()
      .min(10, 'Please enter a valid phone number')
      .max(15, 'Please enter a valid phone number'),

    address: z
      .string()
      .trim()
      .min(5, 'Please enter your full address')
      .max(250, 'Address is too long'),

    city: z
      .string()
      .trim()
      .min(2, 'Please enter your city')
      .max(80, 'City name is too long'),

    state: z
      .string()
      .trim()
      .min(2, 'Please enter your state')
      .max(80, 'State name is too long'),

    pin: z
      .string()
      .trim()
      .regex(/^\d{6}$/, 'PIN code must be 6 digits')
  }),

  params: z.object({}),
  query: z.object({})
})

// ============================================================
// LOGIN VALIDATION
// ============================================================

export const loginSchema = z.object({
  body: z.object({
    email: z
      .string()
      .trim()
      .email('Please enter a valid email address'),

    password: z
      .string()
      .min(1, 'Password is required')
  }),

  params: z.object({}),
  query: z.object({})
})

// ============================================================
// PRODUCT VALIDATION
// ============================================================

export const productSchema = z.object({
  body: z
    .object({
      // ------------------------------------------------------
      // PRODUCT NAME
      // ------------------------------------------------------

      name: z
        .string()
        .trim()
        .min(
          2,
          'Product name must be at least 2 characters'
        )
        .max(
          150,
          'Product name cannot exceed 150 characters'
        ),

      // ------------------------------------------------------
      // SEO-FRIENDLY PRODUCT SLUG
      // Example: premium-oak-lounge-chair
      // ------------------------------------------------------

      slug: z
        .string()
        .trim()
        .min(2, 'Product slug is required')
        .max(
          180,
          'Product slug cannot exceed 180 characters'
        )
        .regex(
          /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
          'Product slug can contain only lowercase letters, numbers and hyphens'
        ),

      // ------------------------------------------------------
      // PRODUCT DESCRIPTION
      // ------------------------------------------------------

      description: z
        .string()
        .trim()
        .min(
          10,
          'Product description must be at least 10 characters'
        ),

      // ------------------------------------------------------
      // WOODISTRY CATEGORY
      // ------------------------------------------------------

      category: z
        .string()
        .trim()
        .refine(
          category => WOODISTRY_CATEGORIES.includes(category),
          {
            message:
              'Please select a valid Woodistry category'
          }
        ),

      // Subcategory must belong to the selected current category.
      // It remains optional for legacy furniture products during migration.
      subcategory: z
        .string()
        .trim()
        .max(100, 'Subcategory cannot exceed 100 characters')
        .optional(),

      // HSN is stored as a string to preserve any leading zeroes.
      hsnCode: z
        .string()
        .trim()
        .min(1, 'HSN code is required')
        .max(20, 'HSN code cannot exceed 20 characters'),

      // ------------------------------------------------------
      // MRP / ORIGINAL PRICE
      // ------------------------------------------------------

      mrp: z
        .coerce
        .number()
        .finite('MRP must be a valid number')
        .nonnegative('MRP cannot be negative'),

      // ------------------------------------------------------
      // SELLING PRICE
      // ------------------------------------------------------

      price: z
        .coerce
        .number()
        .finite('Selling price must be a valid number')
        .nonnegative('Selling price cannot be negative'),

      // Discount data sent by the Admin Add/Edit Product form.
      discountPercent: z
        .coerce
        .number()
        .finite('Discount must be a valid number')
        .min(0, 'Discount cannot be negative')
        .max(100, 'Discount cannot exceed 100%')
        .optional(),

      showDiscountPercent: z
        .boolean()
        .optional(),

      // ------------------------------------------------------
      // BACKWARD COMPATIBILITY
      // ------------------------------------------------------

      compareAtPrice: z
        .coerce
        .number()
        .finite()
        .nonnegative()
        .optional(),

      // ------------------------------------------------------
      // STOCK
      // ------------------------------------------------------

      stock: z
        .coerce
        .number()
        .int('Stock must be a whole number')
        .nonnegative('Stock cannot be negative')
        .optional(),

      // ------------------------------------------------------
      // SHIPPING PACKAGE DETAILS
      //
      // weight  = KG
      // length  = CM
      // breadth = CM
      // height  = CM
      //
      // These fields are required by Product.js.
      // ------------------------------------------------------

      shipping: z.object({
        weight: z
          .coerce
          .number()
          .finite('Weight must be a valid number')
          .min(0.001, 'Weight must be greater than 0'),

        length: z
          .coerce
          .number()
          .finite('Length must be a valid number')
          .min(0.1, 'Length must be greater than 0'),

        breadth: z
          .coerce
          .number()
          .finite('Breadth must be a valid number')
          .min(0.1, 'Breadth must be greater than 0'),

        height: z
          .coerce
          .number()
          .finite('Height must be a valid number')
          .min(0.1, 'Height must be greater than 0')
      }),

      // ------------------------------------------------------
      // PRODUCT IMAGES
      // ------------------------------------------------------

      images: z
        .array(
          z
            .string()
            .trim()
            .url('Each product image must be a valid URL')
        )
        .min(
          1,
          'At least one product image is required'
        )
        .max(
          10,
          'A maximum of 10 product images is allowed'
        )
        .optional(),

      // ------------------------------------------------------
      // PRODUCT DETAILS & CARE
      // ------------------------------------------------------

      productDetails: z
        .string()
        .trim()
        .max(
          5000,
          'Product details cannot exceed 5000 characters'
        )
        .optional(),

      // ------------------------------------------------------
      // SHIPPING & PAYMENT INFORMATION
      // ------------------------------------------------------

      shippingPayment: z
        .string()
        .trim()
        .max(
          5000,
          'Shipping & payment information cannot exceed 5000 characters'
        )
        .optional(),

      // ------------------------------------------------------
      // RETURN & EXCHANGE
      // ------------------------------------------------------

      returnExchange: z
        .string()
        .trim()
        .max(
          5000,
          'Return & exchange information cannot exceed 5000 characters'
        )
        .optional(),

      // ------------------------------------------------------
      // PRODUCT TAGS
      // ------------------------------------------------------

      tags: z
        .array(
          z
            .string()
            .trim()
            .min(1, 'Tag cannot be empty')
            .max(50, 'Tag cannot exceed 50 characters')
        )
        .max(20, 'Maximum 20 tags are allowed')
        .optional()
    })

    // --------------------------------------------------------
    // PRICE VALIDATION
    // Selling price must not be greater than MRP.
    // --------------------------------------------------------

    .superRefine((data, ctx) => {
      if (data.price > data.mrp) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['price'],
          message:
            'Selling price cannot be higher than MRP'
        })
      }

      // Validate category/subcategory combinations for Woodistry's current
      // catalogue. Legacy category values remain accepted for old products.
      const allowedSubcategories = WOODISTRY_CATEGORY_MAP[data.category]
      if (allowedSubcategories) {
        if (!data.subcategory) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['subcategory'],
            message: 'Please select a subcategory'
          })
        } else if (!allowedSubcategories.includes(data.subcategory)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['subcategory'],
            message: 'Subcategory does not belong to the selected category'
          })
        }
      }

      // When the Admin UI supplies a discount, ensure the price matches it.
      // Older clients that omit discountPercent retain the legacy price rule.
      if (data.discountPercent !== undefined) {
        const expectedPrice = Number(
          (data.mrp * (1 - data.discountPercent / 100)).toFixed(2)
        )
        if (Math.abs(data.price - expectedPrice) > 0.01) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['price'],
            message: 'Selling price must match MRP after applying the discount'
          })
        }
      }
    }),

  params: z.object({}),
  query: z.object({})
})

// ============================================================
// NOT FOUND
// ============================================================

export function notFound(req, res) {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  })
}

// ============================================================
// ERROR HANDLER
// ============================================================

export function errorHandler(err, req, res, next) {
  console.error('[WOODISTRY API]', err)

  const status =
    err.name === 'ValidationError'
      ? 422
      : err.code === 11000
        ? 409
        : err.statusCode || 500

  res.status(status).json({
    success: false,
    message:
      status === 500
        ? 'Internal server error'
        : err.message
  })
}
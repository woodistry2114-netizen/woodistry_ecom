import mongoose from 'mongoose'

const productSchema = new mongoose.Schema(
  {
    // ==========================================================
    // PRODUCT NAME
    // ==========================================================

    name: {
      type: String,
      required: true,
      trim: true,
      index: true
    },

    // ==========================================================
    // SEO-FRIENDLY PRODUCT URL
    // ==========================================================

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },

    // ==========================================================
    // PRODUCT DESCRIPTION
    // ==========================================================

    description: {
      type: String,
      required: true,
      trim: true
    },

    // ==========================================================
    // PRODUCT DETAILS & CARE
    // ==========================================================

    productDetails: {
      type: String,
      trim: true,
      default: ''
    },

    // ==========================================================
    // SHIPPING & PAYMENT
    // ==========================================================

    shippingPayment: {
      type: String,
      trim: true,
      default: ''
    },

    // ==========================================================
    // RETURN & EXCHANGE
    // ==========================================================

    returnExchange: {
      type: String,
      trim: true,
      default: ''
    },

    // ==========================================================
    // PRODUCT CATEGORY — WOODISTRY
    // ==========================================================

    category: {
      type: String,
      required: true,
      enum: [
        'Living Room',
        'Sofas & Chairs',
        'Dining',
        'Bedroom',
        'Tables',
        'Storage'
      ],
      index: true
    },

    // ==========================================================
    // MRP / ORIGINAL PRICE
    // ==========================================================

    mrp: {
      type: Number,
      required: true,
      min: 0
    },

    // ==========================================================
    // SELLING PRICE
    // ==========================================================

    price: {
      type: Number,
      required: true,
      min: 0
    },

    // ==========================================================
    // OLD FIELD - COMPATIBILITY
    // compareAtPrice ko rakha gaya hai taaki purane
    // products/data break na ho.
    // ==========================================================

    compareAtPrice: {
      type: Number,
      min: 0
    },

    // ==========================================================
    // PRODUCT IMAGES
    // Multiple images allowed
    // First image = main product image
    // ==========================================================

    images: [
      {
        type: String,
        trim: true
      }
    ],

    // ==========================================================
    // AVAILABLE STOCK
    // ==========================================================

    stock: {
      type: Number,
      min: 0,
      default: 0
    },

    // ==========================================================
    // SHIPPING PACKAGE DETAILS
    //
    // Used for Velocity Shipping
    //
    // weight  = KG
    // length  = CM
    // breadth = CM
    // height  = CM
    // ==========================================================

    shipping: {
      weight: {
        type: Number,
        required: true,
        min: 0.001
      },

      length: {
        type: Number,
        required: true,
        min: 0.1
      },

      breadth: {
        type: Number,
        required: true,
        min: 0.1
      },

      height: {
        type: Number,
        required: true,
        min: 0.1
      }
    },

    // ==========================================================
    // PRODUCT TAGS
    // Example:
    // featured, bestseller, new
    // ==========================================================

    tags: [
      {
        type: String,
        lowercase: true,
        trim: true
      }
    ],

    // ==========================================================
    // PRODUCT RATING
    // ==========================================================

    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },

    // ==========================================================
    // NUMBER OF REVIEWS
    // ==========================================================

    reviewCount: {
      type: Number,
      min: 0,
      default: 0
    },

    // ==========================================================
    // PRODUCT ACTIVE / INACTIVE
    // ==========================================================

    isActive: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  {
    timestamps: true
  }
)

// ==========================================================
// VALIDATE PRICE
// Selling price MRP se zyada nahi honi chahiye
// ==========================================================

productSchema.pre(
  'validate',
  function validatePrices() {
    if (
      this.mrp !== undefined &&
      this.price !== undefined &&
      Number(this.price) > Number(this.mrp)
    ) {
      this.invalidate(
        'price',
        'Selling price cannot be greater than MRP.'
      )
    }
  }
)

// ==========================================================
// TEXT SEARCH INDEX
// ==========================================================

productSchema.index({
  name: 'text',
  description: 'text',
  productDetails: 'text',
  tags: 'text'
})

// ==========================================================
// PRODUCT INDEXES
// ==========================================================

productSchema.index({
  category: 1,
  isActive: 1
})

productSchema.index({
  createdAt: -1
})

// ==========================================================
// MODEL
// ==========================================================

export default mongoose.model(
  'Product',
  productSchema
)
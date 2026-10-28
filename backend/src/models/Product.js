import mongoose from 'mongoose'

// WOODISTRY product categories shown in the Admin Add/Edit Product form.
// Legacy furniture categories are retained so existing records remain valid.
const WOODISTRY_CATEGORIES = [
  'Dining & Serving',
  'Kitchen Essentials',
  'Storage & Containers',

  // Legacy categories retained for compatibility with older products.
  'Living Room',
  'Sofas & Chairs',
  'Dining',
  'Bedroom',
  'Tables',
  'Storage'
]

const PRODUCT_SUBCATEGORIES = {
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

const productSchema = new mongoose.Schema(
  {
    // PRODUCT NAME
    name: {
      type: String,
      required: true,
      trim: true,
      index: true
    },

    // SEO-FRIENDLY PRODUCT URL
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },

    // PRODUCT DESCRIPTION
    description: {
      type: String,
      required: true,
      trim: true
    },

    // PRODUCT DETAILS & CARE
    productDetails: {
      type: String,
      trim: true,
      default: ''
    },

    // SHIPPING & PAYMENT
    shippingPayment: {
      type: String,
      trim: true,
      default: ''
    },

    // RETURN & EXCHANGE
    returnExchange: {
      type: String,
      trim: true,
      default: ''
    },

    // PRODUCT CATEGORY
    category: {
      type: String,
      required: true,
      enum: {
        values: WOODISTRY_CATEGORIES,
        message: 'Please select a valid Woodistry product category.'
      },
      index: true,
      trim: true
    },

    // PRODUCT SUBCATEGORY
    subcategory: {
      type: String,
      trim: true,
      default: '',
      validate: {
        validator(value) {
          if (!value) return true

          // New Woodistry category values must use a matching subcategory.
          const validSubcategories = PRODUCT_SUBCATEGORIES[this.category]
          if (!validSubcategories) return true // Preserve legacy product data.

          return validSubcategories.includes(value)
        },
        message: 'The selected subcategory does not belong to this product category.'
      }
    },

    // HSN CODE
    // Kept as a string to preserve formatting/leading zeroes.
    // New products require an HSN code; legacy products without one can still be edited.
    hsnCode: {
      type: String,
      trim: true,
      default: '',
      required: function hsnRequiredForNewProducts() {
        return this.isNew || Boolean(this.hsnCode)
      }
    },

    // MRP / ORIGINAL PRICE
    mrp: {
      type: Number,
      required: true,
      min: 0
    },

    // DISCOUNT PERCENTAGE
    discountPercent: {
      type: Number,
      min: [0, 'Discount cannot be less than 0%.'],
      max: [100, 'Discount cannot be greater than 100%.'],
      default: 0
    },

    // SELLING PRICE
    // Admin calculates this from MRP and discount before sending it to the API.
    price: {
      type: Number,
      required: true,
      min: 0
    },

    // Whether the discount percentage should be displayed to customers.
    showDiscountPercent: {
      type: Boolean,
      default: false
    },

    // OLD FIELD - COMPATIBILITY
    // Keep compareAtPrice so older products/data and existing integrations continue to work.
    compareAtPrice: {
      type: Number,
      min: 0
    },

    // PRODUCT IMAGES: first image is the main product image.
    images: [
      {
        type: String,
        trim: true
      }
    ],

    // AVAILABLE STOCK
    stock: {
      type: Number,
      min: 0,
      default: 0
    },

    // SHIPPING PACKAGE DETAILS
    // weight = KG; length, breadth, height = CM
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

    // PRODUCT TAGS: featured, bestseller, new, etc.
    tags: [
      {
        type: String,
        lowercase: true,
        trim: true
      }
    ],

    // PRODUCT RATING
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },

    // NUMBER OF REVIEWS
    reviewCount: {
      type: Number,
      min: 0,
      default: 0
    },

    // PRODUCT ACTIVE / INACTIVE
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

// VALIDATE PRICE: selling price must not exceed MRP.
productSchema.pre('validate', function validatePrices() {
  if (
    this.mrp !== undefined &&
    this.price !== undefined &&
    Number(this.price) > Number(this.mrp)
  ) {
    this.invalidate('price', 'Selling price cannot be greater than MRP.')
  }

  if (
    this.discountPercent !== undefined &&
    (!Number.isFinite(Number(this.discountPercent)) ||
      Number(this.discountPercent) < 0 ||
      Number(this.discountPercent) > 100)
  ) {
    this.invalidate('discountPercent', 'Discount must be between 0 and 100%.')
  }
})

// TEXT SEARCH INDEX
productSchema.index({
  name: 'text',
  description: 'text',
  productDetails: 'text',
  tags: 'text'
})

// PRODUCT INDEXES
productSchema.index({
  category: 1,
  subcategory: 1,
  isActive: 1
})

productSchema.index({ createdAt: -1 })

export default mongoose.model('Product', productSchema)

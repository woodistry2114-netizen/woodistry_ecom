import { Router } from 'express'
import Content from '../models/CMS.js'
import Product from '../models/Product.js'

import {
  asyncHandler,
  adminOnly,
  protect,
} from '../middleware/index.js'

const router = Router()

// ==========================================================
// ACTIVE CONTENT FILTER
// ==========================================================

const activeFilter = {
  isActive: true,
  $and: [
    {
      $or: [
        { startsAt: null },
        { startsAt: { $lte: new Date() } },
      ],
    },
    {
      $or: [
        { endsAt: null },
        { endsAt: { $gte: new Date() } },
      ],
    },
  ],
}

// ==========================================================
// ANNOUNCEMENT - PUBLIC GET
// GET /api/cms/announcement
// ==========================================================

router.get(
  '/announcement',
  asyncHandler(async (_req, res) => {
    const announcement = await Content.findOne({
      type: 'announcement',
    }).sort({ updatedAt: -1 })

    if (!announcement) {
      return res.json({
        success: true,
        data: {
          text: '',
          enabled: false,
        },
      })
    }

    res.json({
      success: true,
      data: {
        id: announcement._id,
        text:
          announcement.text ||
          announcement.message ||
          '',
        enabled: Boolean(
          announcement.enabled !== undefined
            ? announcement.enabled
            : announcement.isActive
        ),
      },
    })
  })
)

// ==========================================================
// ANNOUNCEMENT - ADMIN UPDATE
// PUT /api/cms/announcement
// ==========================================================

router.put(
  '/announcement',
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const text = String(
      req.body?.text ||
      req.body?.message ||
      ''
    ).trim()

    const enabled = req.body?.enabled !== false

    if (!text) {
      return res.status(422).json({
        success: false,
        message: 'Announcement message is required.',
      })
    }

    if (text.length > 200) {
      return res.status(422).json({
        success: false,
        message:
          'Announcement message cannot exceed 200 characters.',
      })
    }

    const announcement = await Content.findOneAndUpdate(
      { type: 'announcement' },
      {
        $set: {
          type: 'announcement',
          text,
          enabled,
          isActive: enabled,
          order: 0,
          startsAt: null,
          endsAt: null,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    )

    res.json({
      success: true,
      message: 'Announcement updated successfully.',
      data: {
        id: announcement._id,
        text: announcement.text || text,
        enabled: Boolean(
          announcement.enabled !== undefined
            ? announcement.enabled
            : announcement.isActive
        ),
      },
    })
  })
)

// ==========================================================
// HERO SLIDER - PUBLIC GET
// GET /api/cms/hero
// ==========================================================

router.get(
  '/hero',
  asyncHandler(async (_req, res) => {
    const slides = await Content.find({
      type: 'hero',
      ...activeFilter,
    })
      .sort({
        order: 1,
        createdAt: 1,
      })
      .lean()

    res.json({
      success: true,
      data: {
        slides: slides.map((slide) => ({
          id: slide._id,
          image: slide.image || '',
          mediaType:
            slide.mediaType === 'video'
              ? 'video'
              : 'image',
          mobileImage:
            slide.mobileImage ||
            slide.image ||
            '',
          alt:
            slide.metadata?.alt ||
            slide.title ||
            'WOODISTRY',
          order: Number.isFinite(slide.order)
            ? slide.order
            : 0,
          enabled:
            slide.enabled !== false &&
            slide.isActive !== false,
        })),
      },
    })
  })
)

// ==========================================================
// HERO SLIDER - ADMIN GET
// GET /api/cms/hero/admin
// ==========================================================

router.get(
  '/hero/admin',
  protect,
  adminOnly,
  asyncHandler(async (_req, res) => {
    const slides = await Content.find({
      type: 'hero',
    })
      .sort({
        order: 1,
        createdAt: 1,
      })
      .lean()

    res.json({
      success: true,
      data: {
        slides: slides.map((slide) => ({
          id: slide._id,
          image: slide.image || '',
          mediaType:
            slide.mediaType === 'video'
              ? 'video'
              : 'image',
          mobileImage:
            slide.mobileImage ||
            slide.image ||
            '',
          alt:
            slide.metadata?.alt ||
            slide.title ||
            'WOODISTRY',
          order: Number.isFinite(slide.order)
            ? slide.order
            : 0,
          enabled:
            slide.enabled !== false &&
            slide.isActive !== false,
        })),
      },
    })
  })
)

// ==========================================================
// HERO SLIDER - ADMIN UPDATE
// PUT /api/cms/hero
// ==========================================================

router.put(
  '/hero',
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const incomingSlides = Array.isArray(req.body?.slides)
      ? req.body.slides
      : null

    if (!incomingSlides) {
      return res.status(422).json({
        success: false,
        message: 'Hero slides must be provided as an array.',
      })
    }

    const slides = incomingSlides
      .map((slide, index) => {
        const image = String(
          slide?.image || ''
        ).trim()

        const mediaType =
          slide?.mediaType === 'video'
            ? 'video'
            : 'image'

        const mobileImage = String(
          slide?.mobileImage || image
        ).trim()

        const alt = String(
          slide?.alt || `WOODISTRY Hero ${index + 1}`
        ).trim()

        return {
          image,
          mediaType,
          mobileImage,
          alt,
          enabled: slide?.enabled !== false,
          order: index,
        }
      })
      .filter((slide) => slide.image)

    if (slides.length > 10) {
      return res.status(422).json({
        success: false,
        message: 'Maximum 10 hero slides are allowed.',
      })
    }

    if (
      incomingSlides.length > 0 &&
      slides.length === 0
    ) {
      return res.status(422).json({
        success: false,
        message:
          'At least one valid hero media URL is required.',
      })
    }

    await Content.deleteMany({ type: 'hero' })

    let savedSlides = []

    if (slides.length > 0) {
      savedSlides = await Content.insertMany(
        slides.map((slide) => ({
          type: 'hero',
          image: slide.image,
          mediaType: slide.mediaType,
          mobileImage: slide.mobileImage,
          title: slide.alt,
          enabled: slide.enabled,
          isActive: slide.enabled,
          order: slide.order,
          startsAt: null,
          endsAt: null,
          metadata: {
            alt: slide.alt,
          },
        }))
      )
    }

    res.json({
      success: true,
      message: 'Hero slides updated successfully.',
      data: {
        slides: savedSlides
          .sort((a, b) => a.order - b.order)
          .map((slide) => ({
            id: slide._id,
            image: slide.image || '',
            mediaType:
              slide.mediaType === 'video'
                ? 'video'
                : 'image',
            mobileImage:
              slide.mobileImage ||
              slide.image ||
              '',
            alt:
              slide.metadata?.alt ||
              slide.title ||
              'WOODISTRY',
            order: slide.order,
            enabled:
              slide.enabled !== false &&
              slide.isActive !== false,
          })),
      },
    })
  })
)

// ==========================================================
// SECTION IMAGES - PUBLIC GET
// GET /api/cms/section-images
// ==========================================================

const defaultSectionSpaces = {
  'New Arrivals': '',
  'Dining & Serving': '',
  'Kitchen Essentials': '',
  'Storage & Containers': '',
}

// Normalize current and legacy Shop by Space keys to the exact labels used by
// the Woodistry admin panel and homepage. Older versions may store spaces as an array.
const normalizeSectionSpaces = (rawSpaces = {}) => {
  const spaces = Array.isArray(rawSpaces)
    ? rawSpaces.reduce((acc, item) => {
        if (item?.name) acc[item.name] = item.image ?? item.imageUrl ?? item.url ?? ''
        return acc
      }, {})
    : (rawSpaces && typeof rawSpaces === 'object' ? rawSpaces : {})

  const pick = (...keys) => {
    for (const key of keys) {
      const value = spaces[key]
      if (typeof value === 'string' && value.trim()) return value.trim()
      if (value && typeof value === 'object') {
        const url = value.url || value.secure_url || value.src || value.imageUrl || value.image || ''
        if (typeof url === 'string' && url.trim()) return url.trim()
      }
    }
    return ''
  }

  return {
    'New Arrivals': pick('New Arrivals', 'newArrivals', 'new-arrivals', 'new_arrivals'),
    'Dining & Serving': pick('Dining & Serving', 'Dining', 'dining', 'diningAndServing', 'dining-and-serving', 'dining_serving'),
    'Kitchen Essentials': pick('Kitchen Essentials', 'Kitchen', 'kitchen', 'kitchenEssentials', 'kitchen-essentials', 'kitchen_essentials'),
    'Storage & Containers': pick('Storage & Containers', 'Storage', 'storage', 'storageAndContainers', 'storage-and-containers', 'storage_containers'),
  }
}

const normalizeSectionImageUrl = (value, fieldName) => {
  const url = String(value ?? '').trim()
  if (!url) return ''

  try {
    const parsed = new URL(url)
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error('Invalid protocol')
    }
  } catch {
    const error = new Error(`${fieldName} must be a valid HTTP or HTTPS URL.`)
    error.statusCode = 422
    throw error
  }

  return url
}

router.get(
  '/section-images',
  asyncHandler(async (_req, res) => {
    // Sort newest-first because older versions may have created duplicate documents.
    const content = await Content.findOne({ type: 'section-images' })
      .sort({ updatedAt: -1, createdAt: -1 })
      .lean()

    const saved = content?.metadata?.sectionImages || content?.metadata || {}
    const savedSpaces = saved.spaces || saved.shopBySpace || {}
    const data = {
      brandStory: String(saved.brandStory || saved.brandStoryImage || '').trim(),
      spaces: normalizeSectionSpaces(savedSpaces),
    }

    // Prevent stale CMS responses from being cached by the browser/CDN.
    res.set('Cache-Control', 'no-store')
    return res.status(200).json({ success: true, data })
  })
)

// ==========================================================
// SECTION IMAGES - ADMIN UPDATE
// PUT /api/cms/section-images
// ==========================================================

router.put(
  '/section-images',
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const body = req.body || {}

    // Preserve existing values when an older client sends only one field.
    const existingContent = await Content.findOne({ type: 'section-images' })
      .sort({ updatedAt: -1, createdAt: -1 })
      .lean()
    const existing = existingContent?.metadata?.sectionImages || existingContent?.metadata || {}
    const existingSpaces = existing.spaces || existing.shopBySpace || {}
    const incomingSpaces = body.spaces || body.shopBySpace || {}

    const brandStoryInput = body.brandStory ?? body.brandStoryImage ?? existing.brandStory ?? existing.brandStoryImage ?? ''
    const brandStory = normalizeSectionImageUrl(brandStoryInput, 'Brand Story image')

    // Normalize current and legacy labels before validating and saving.
    // Incoming values take precedence over stored values, including intentional empty strings.
    const normalizedIncoming = normalizeSectionSpaces(incomingSpaces)
    const normalizedExisting = normalizeSectionSpaces(existingSpaces)
    const spaces = {
      'New Arrivals': normalizeSectionImageUrl(
        (['New Arrivals', 'newArrivals', 'new-arrivals', 'new_arrivals'].some(key => Object.prototype.hasOwnProperty.call(incomingSpaces, key)))
          ? normalizedIncoming['New Arrivals']
          : normalizedExisting['New Arrivals'],
        'New Arrivals image'
      ),
      'Dining & Serving': normalizeSectionImageUrl(
        (Object.prototype.hasOwnProperty.call(incomingSpaces, 'Dining & Serving') || Object.prototype.hasOwnProperty.call(incomingSpaces, 'Dining') || Object.prototype.hasOwnProperty.call(incomingSpaces, 'dining'))
          ? normalizedIncoming['Dining & Serving']
          : normalizedExisting['Dining & Serving'],
        'Dining & Serving image'
      ),
      'Kitchen Essentials': normalizeSectionImageUrl(
        (Object.prototype.hasOwnProperty.call(incomingSpaces, 'Kitchen Essentials') || Object.prototype.hasOwnProperty.call(incomingSpaces, 'Kitchen') || Object.prototype.hasOwnProperty.call(incomingSpaces, 'kitchen'))
          ? normalizedIncoming['Kitchen Essentials']
          : normalizedExisting['Kitchen Essentials'],
        'Kitchen Essentials image'
      ),
      'Storage & Containers': normalizeSectionImageUrl(
        (Object.prototype.hasOwnProperty.call(incomingSpaces, 'Storage & Containers') || Object.prototype.hasOwnProperty.call(incomingSpaces, 'Storage') || Object.prototype.hasOwnProperty.call(incomingSpaces, 'storage'))
          ? normalizedIncoming['Storage & Containers']
          : normalizedExisting['Storage & Containers'],
        'Storage & Containers image'
      ),
    }

    const sectionImages = { brandStory, spaces }

    const savedContent = await Content.findOneAndUpdate(
      { type: 'section-images' },
      {
        $set: {
          type: 'section-images',
          title: 'Brand Story and Homepage Collection Images',
          metadata: { sectionImages },
          isActive: true,
          enabled: true,
          order: 0,
          startsAt: null,
          endsAt: null,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    ).lean()

    res.set('Cache-Control', 'no-store')
    return res.status(200).json({
      success: true,
      message: 'Brand Story and homepage collection images saved successfully.',
      data: savedContent?.metadata?.sectionImages || sectionImages,
    })
  })
)

// ==========================================================
// HOME CMS DATA
// GET /api/cms/home
// ==========================================================

router.get(
  '/home',
  asyncHandler(async (_req, res) => {
    const [
      content,
      categories,
      featured,
      bestsellers,
      newArrivals,
    ] = await Promise.all([
      Content.find(activeFilter).sort({
        order: 1,
      }),

      Product.distinct('category', {
        isActive: true,
      }),

      Product.find({
        isActive: true,
        tags: 'featured',
      })
        .sort({ createdAt: -1 })
        .limit(8),

      Product.find({
        isActive: true,
        tags: 'bestseller',
      })
        .sort({ createdAt: -1 })
        .limit(8),

      Product.find({
        isActive: true,
        tags: 'new',
      })
        .sort({ createdAt: -1 })
        .limit(8),
    ])

    res.json({
      success: true,
      data: {
        content,
        categories,
        featured,
        bestsellers,
        newArrivals,
      },
    })
  })
)

// ==========================================================
// ADMIN - GET ALL CMS CONTENT
// GET /api/cms
// ==========================================================

router.get(
  '/',
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const filter = req.query.type
      ? { type: req.query.type }
      : {}

    const content = await Content.find(filter).sort({
      order: 1,
    })

    res.json({
      success: true,
      data: content,
    })
  })
)

// ==========================================================
// ADMIN - CREATE CMS CONTENT
// POST /api/cms
// ==========================================================

router.post(
  '/',
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const content = await Content.create(req.body)

    res.status(201).json({
      success: true,
      data: content,
    })
  })
)

// ==========================================================
// ADMIN - UPDATE CMS CONTENT
// PATCH /api/cms/:id
// ==========================================================

router.patch(
  '/:id',
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const content = await Content.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    )

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'CMS content not found.',
      })
    }

    res.json({
      success: true,
      data: content,
    })
  })
)

// ==========================================================
// ADMIN - DELETE CMS CONTENT
// DELETE /api/cms/:id
// ==========================================================

router.delete(
  '/:id',
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const content = await Content.findByIdAndDelete(
      req.params.id
    )

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'CMS content not found.',
      })
    }

    res.json({
      success: true,
      message: 'CMS content deleted successfully.',
    })
  })
)

// ==========================================================
// EXPORT ROUTER
// ==========================================================

export default router
import React, { useEffect, useState } from 'react'
import {
  FiGrid,
  FiBell,
  FiImage,
  FiEdit3,
  FiClock,
  FiPackage,
  FiLogOut,
  FiExternalLink,
  FiPlus,
  FiRefreshCw
} from 'react-icons/fi'
import { adminService } from '../services/adminService'
import { apiRequest } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function Admin() {
  const [activeSection, setActiveSection] = useState('dashboard')

  const { user, logout } = useAuth()

  // =========================
  // Dashboard State
  // =========================
  const [dashboard, setDashboard] = useState(null)

  // =========================
  // Product State
  // =========================
  const [products, setProducts] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(false)

  // =========================
  // Order State
  // =========================
  const [orders, setOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [updatingOrderId, setUpdatingOrderId] = useState(null)
  const [courierName, setCourierName] = useState('')
  const [trackingNumber, setTrackingNumber] = useState('')

  // =========================
  // General State
  // =========================
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  // =========================
  // Announcement Bar State
  // =========================
  const [announcementText, setAnnouncementText] = useState('')
  const [announcementEnabled, setAnnouncementEnabled] = useState(true)
  const [loadingAnnouncement, setLoadingAnnouncement] = useState(false)
  const [savingAnnouncement, setSavingAnnouncement] = useState(false)

  // =========================
  // Hero Slides State
  // =========================
  const [heroSlides, setHeroSlides] = useState([])
  const [loadingHeroSlides, setLoadingHeroSlides] = useState(false)
  const [savingHeroSlides, setSavingHeroSlides] = useState(false)

  // =========================
  // Brand Story + Homepage Collection Images
  // =========================
  const defaultSectionImages = {
    brandStory: '',
    spaces: {
      'New Arrivals': '',
      'Dining & Serving': '',
      'Kitchen Essentials': '',
      'Storage & Containers': ''
    }
  }
  const [sectionImages, setSectionImages] = useState(defaultSectionImages)
  const [loadingSectionImages, setLoadingSectionImages] = useState(false)
  const [savingSectionImages, setSavingSectionImages] = useState(false)

  // =========================
  // Blog Management State
  // =========================
  const emptyBlog = {
    title: '',
    slug: '',
    coverImage: '',
    category: 'Table Styling',
    excerpt: '',
    content: '',
    author: 'XAAJ Editorial',
    publishDate: new Date().toISOString().slice(0, 10),
    isPublished: false
  }

  const [blogs, setBlogs] = useState([])
  const [loadingBlogs, setLoadingBlogs] = useState(false)
  const [savingBlog, setSavingBlog] = useState(false)
  const [blogForm, setBlogForm] = useState(emptyBlog)
  const [editingBlogId, setEditingBlogId] = useState(null)
  const [showBlogForm, setShowBlogForm] = useState(false)
  const [previewBlog, setPreviewBlog] = useState(null)

  // =========================
  // Product Form State
  // =========================
  // Woodistry product taxonomy used by the Add / Edit Product form.
  const productCategoryMap = {
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

  const formatUSD = value => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Number(value) || 0)

  const getDiscountFromPrices = (mrp, price) => {
    const original = Number(mrp)
    const selling = Number(price)
    if (!original || original <= 0 || selling >= original) return 0
    return Math.min(100, Math.max(0, Number((((original - selling) / original) * 100).toFixed(2))))
  }

  const calculateSellingPrice = (mrp, discountPercent) => {
    const original = Number(mrp)
    const discount = Number(discountPercent)
    if (!Number.isFinite(original) || original < 0 || !Number.isFinite(discount) || discount < 0 || discount > 100) return ''
    return Number((original * (1 - discount / 100)).toFixed(2))
  }

  const emptyProduct = {
    name: '',
    slug: '',
    description: '',
    category: '',
    subcategory: '',
    hsnCode: '',
    mrp: '',
    discountPercent: '0',
    price: '',
    showDiscountPercent: false,
    stock: '',
    shipping: { weight: '', length: '', breadth: '', height: '' },
    images: [''],
    productDetails: '',
    shippingPayment: '',
    returnExchange: ''
  }

  const [form, setForm] = useState(emptyProduct)
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)

  // =========================
  // Load Dashboard
  // =========================
  useEffect(() => {
    if (user?.role !== 'admin') return

    loadDashboard()
    loadProducts()
    loadOrders()
    loadAnnouncement()
    loadHeroSlides()
    loadSectionImages()
    loadBlogs()
  }, [user])

  // =========================
  // Dashboard API
  // =========================
  const loadDashboard = async () => {
    try {
      setError('')

      const result = await adminService.dashboard()

      setDashboard(result.data)
    } catch (err) {
      setError(err.message || 'Unable to load dashboard')
    }
  }

  // =========================
  // Announcement API
  // =========================
  const loadAnnouncement = async () => {
    try {
      setLoadingAnnouncement(true)
      const result = await apiRequest('/cms/announcement')
      const data = result?.data || result?.announcement || result || {}

      setAnnouncementText(data?.text || data?.message || '')
      setAnnouncementEnabled(
        data?.enabled !== undefined ? Boolean(data.enabled) : true
      )
    } catch (err) {
      setError(err.message || 'Unable to load announcement')
    } finally {
      setLoadingAnnouncement(false)
    }
  }

  const handleSaveAnnouncement = async e => {
    e.preventDefault()

    const text = announcementText.trim()

    if (!text) {
      setError('Announcement message is required.')
      return
    }

    try {
      setSavingAnnouncement(true)
      setError('')
      setMessage('')

      const result = await apiRequest('/cms/announcement', {
        method: 'PUT',
        body: JSON.stringify({
          text,
          enabled: announcementEnabled
        })
      })

      const data = result?.data || result?.announcement || result || {}

      setAnnouncementText(data?.text || data?.message || text)
      setAnnouncementEnabled(
        data?.enabled !== undefined
          ? Boolean(data.enabled)
          : announcementEnabled
      )

      setMessage('Announcement bar updated successfully.')
    } catch (err) {
      setError(err.message || 'Unable to update announcement')
    } finally {
      setSavingAnnouncement(false)
    }
  }

  // =========================
  // Hero Slides API
  // =========================

  // Automatically detect whether the URL is an image or video.
  // Existing image URLs continue to work normally.
  const getHeroMediaType = url => {
    const value = String(url || '').trim()

    return /\.(mp4|webm|ogg|mov)(?:[?#].*)?$/i.test(value)
      ? 'video'
      : 'image'
  }

  const loadHeroSlides = async () => {
    try {
      setLoadingHeroSlides(true)

      const result = await apiRequest('/cms/hero/admin')
      const data =
        result?.data?.slides ||
        result?.slides ||
        result?.data ||
        []

      setHeroSlides(
        Array.isArray(data)
          ? data.map((slide, index) => ({
              image: slide?.image || slide?.imageUrl || '',
              mediaType:
                slide?.mediaType === 'video'
                  ? 'video'
                  : getHeroMediaType(
                      slide?.image || slide?.imageUrl || ''
                    ),
              alt:
                slide?.alt ||
                slide?.title ||
                `Hero slide ${index + 1}`,
              enabled:
                slide?.enabled !== undefined
                  ? Boolean(slide.enabled)
                  : true
            }))
          : []
      )
    } catch (err) {
      setError(err.message || 'Unable to load hero slides')
    } finally {
      setLoadingHeroSlides(false)
    }
  }

  const addHeroSlide = () => {
    setHeroSlides(prev => [
      ...prev,
      {
        image: '',
        mediaType: 'image',
        alt: `Hero slide ${prev.length + 1}`,
        enabled: true
      }
    ])
  }

  const updateHeroSlide = (index, field, value) => {
    setHeroSlides(prev =>
      prev.map((slide, slideIndex) => {
        if (slideIndex !== index) return slide

        if (field === 'image') {
          return {
            ...slide,
            image: value,
            mediaType: getHeroMediaType(value)
          }
        }

        return {
          ...slide,
          [field]: value
        }
      })
    )
  }

  const removeHeroSlide = index => {
    setHeroSlides(prev =>
      prev.filter((_, slideIndex) => slideIndex !== index)
    )
  }

  const moveHeroSlide = (index, direction) => {
    setHeroSlides(prev => {
      const targetIndex = index + direction

      if (
        targetIndex < 0 ||
        targetIndex >= prev.length
      ) {
        return prev
      }

      const next = [...prev]
      const [moved] = next.splice(index, 1)
      next.splice(targetIndex, 0, moved)

      return next
    })
  }

  const handleSaveHeroSlides = async () => {
    const cleanedSlides = heroSlides
      .map(slide => {
        const image = String(slide.image || '').trim()

        return {
          image,
          mediaType:
            slide.mediaType === 'video'
              ? 'video'
              : getHeroMediaType(image),
          alt: String(slide.alt || '').trim(),
          enabled: Boolean(slide.enabled)
        }
      })
      .filter(slide => slide.image)

    if (!cleanedSlides.length) {
      setError('Please add at least one hero media URL.')
      return
    }

    try {
      setSavingHeroSlides(true)
      setError('')
      setMessage('')

      const result = await apiRequest('/cms/hero', {
        method: 'PUT',
        body: JSON.stringify({
          slides: cleanedSlides
        })
      })

      const data =
        result?.data?.slides ||
        result?.slides ||
        result?.data ||
        cleanedSlides

      setHeroSlides(
        Array.isArray(data)
          ? data.map((slide, index) => ({
              image: slide?.image || slide?.imageUrl || '',
              mediaType:
                slide?.mediaType === 'video'
                  ? 'video'
                  : getHeroMediaType(
                      slide?.image || slide?.imageUrl || ''
                    ),
              alt:
                slide?.alt ||
                slide?.title ||
                `Hero slide ${index + 1}`,
              enabled:
                slide?.enabled !== undefined
                  ? Boolean(slide.enabled)
                  : true
            }))
          : cleanedSlides
      )

      setMessage('Hero media updated successfully.')
    } catch (err) {
      setError(err.message || 'Unable to update hero images')
    } finally {
      setSavingHeroSlides(false)
    }
  }

  // =========================
  // Brand Story + Homepage Collection Images API
  // =========================
  const normalizeSectionSpaces = rawSpaces => {
    const entries = Array.isArray(rawSpaces)
      ? rawSpaces.reduce((acc, item) => {
          if (item?.name) {
            acc[item.name] =
              item.image ??
              item.imageUrl ??
              item.url ??
              item.secure_url ??
              item.src ??
              ''
          }
          return acc
        }, {})
      : (rawSpaces && typeof rawSpaces === 'object' ? rawSpaces : {})

    // Support canonical labels and legacy keys returned by older CMS data.
    const getImageValue = value => {
      if (typeof value === 'string') return value.trim()
      if (value && typeof value === 'object') {
        const candidate =
          value.url ??
          value.secure_url ??
          value.src ??
          value.imageUrl ??
          value.image ??
          ''
        return typeof candidate === 'string' ? candidate.trim() : ''
      }
      return ''
    }

    const pick = (...keys) => {
      for (const key of keys) {
        const value = getImageValue(entries[key])
        if (value) return value
      }
      return ''
    }

    return {
      'New Arrivals': pick(
        'New Arrivals',
        'newArrivals',
        'new-arrivals',
        'new_arrivals'
      ),
      'Dining & Serving': pick(
        'Dining & Serving',
        'Dining',
        'dining',
        'diningAndServing',
        'dining-and-serving',
        'dining_serving'
      ),
      'Kitchen Essentials': pick(
        'Kitchen Essentials',
        'Kitchen',
        'kitchen',
        'kitchenEssentials',
        'kitchen-essentials',
        'kitchen_essentials'
      ),
      'Storage & Containers': pick(
        'Storage & Containers',
        'Storage',
        'storage',
        'storageAndContainers',
        'storage-and-containers',
        'storage_containers'
      )
    }
  }

  const loadSectionImages = async () => {
    try {
      setLoadingSectionImages(true)
      const result = await apiRequest('/cms/section-images')
      const data = result?.data || result?.sectionImages || result || {}
      const rawSpaces = data?.spaces || data?.shopBySpace || data?.collections || {}
      setSectionImages({
        brandStory: data?.brandStory || data?.brandStoryImage || '',
        spaces: normalizeSectionSpaces(rawSpaces)
      })
    } catch (err) {
      // A missing CMS endpoint should not block the rest of the admin panel.
      console.warn('Unable to load section images:', err.message)
    } finally {
      setLoadingSectionImages(false)
    }
  }

  const handleSectionImageChange = (field, value, spaceName = '') => {
    setSectionImages(prev => field === 'brandStory'
      ? { ...prev, brandStory: value }
      : { ...prev, spaces: { ...prev.spaces, [spaceName]: value } }
    )
  }

  const handleSaveSectionImages = async e => {
    e.preventDefault()
    try {
      setSavingSectionImages(true)
      setError('')
      setMessage('')
      const payload = {
        brandStory: sectionImages.brandStory.trim(),
        spaces: Object.fromEntries(
          Object.entries(sectionImages.spaces).map(([name, image]) => [name, String(image || '').trim()])
        )
      }
      const result = await apiRequest('/cms/section-images', {
        method: 'PUT',
        body: JSON.stringify(payload)
      })
      const data = result?.data || result?.sectionImages || result || payload
      const savedSpaces = data?.spaces || data?.shopBySpace || payload.spaces
      setSectionImages({
        brandStory: data?.brandStory || data?.brandStoryImage || payload.brandStory,
        spaces: normalizeSectionSpaces(savedSpaces)
      })
      setMessage('Brand Story and homepage collection images updated successfully.')
    } catch (err) {
      setError(err.message || 'Unable to save section images. Confirm the backend /cms/section-images endpoint is implemented.')
    } finally {
      setSavingSectionImages(false)
    }
  }

  // =========================
  // Blog API
  // =========================
  const loadBlogs = async () => {
    try {
      setLoadingBlogs(true)
      const result = await apiRequest('/blogs/admin')
      const data = result?.data?.blogs || result?.blogs || result?.data || []
      setBlogs(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message || 'Unable to load blogs')
    } finally {
      setLoadingBlogs(false)
    }
  }

  const handleBlogChange = e => {
    const { name, value, type, checked } = e.target
    setBlogForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const makeBlogSlug = value =>
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

  const handleBlogTitleChange = e => {
    const value = e.target.value
    setBlogForm(prev => ({
      ...prev,
      title: value,
      ...(editingBlogId || prev.slug ? {} : { slug: makeBlogSlug(value) })
    }))
  }

  const handleAddBlog = () => {
    setEditingBlogId(null)
    setBlogForm({
      ...emptyBlog,
      publishDate: new Date().toISOString().slice(0, 10)
    })
    setPreviewBlog(null)
    setError('')
    setMessage('')
    setShowBlogForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleEditBlog = blog => {
    setEditingBlogId(blog._id)
    setBlogForm({
      title: blog.title || '',
      slug: blog.slug || '',
      coverImage: blog.coverImage || blog.image || '',
      category: blog.category || 'Table Styling',
      excerpt: blog.excerpt || '',
      content: blog.content || '',
      author: blog.author || 'XAAJ Editorial',
      publishDate: blog.publishDate
        ? new Date(blog.publishDate).toISOString().slice(0, 10)
        : new Date().toISOString().slice(0, 10),
      isPublished: Boolean(blog.isPublished ?? blog.published)
    })
    setError('')
    setMessage('')
    setShowBlogForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCancelBlog = () => {
    setShowBlogForm(false)
    setEditingBlogId(null)
    setBlogForm(emptyBlog)
  }

  const handlePreviewBlog = blog => {
    setPreviewBlog(blog)
  }

  const handleSaveBlog = async e => {
    e.preventDefault()

    const payload = {
      title: blogForm.title.trim(),
      slug: makeBlogSlug(blogForm.slug || blogForm.title),
      coverImage: blogForm.coverImage.trim(),
      category: blogForm.category.trim(),
      excerpt: blogForm.excerpt.trim(),
      content: blogForm.content.trim(),
      author: blogForm.author.trim(),
      publishDate: blogForm.publishDate,
      isPublished: Boolean(blogForm.isPublished)
    }

    if (!payload.title) return setError('Blog title is required.')
    if (!payload.coverImage) return setError('Blog cover image URL is required.')
    if (!payload.excerpt) return setError('Blog short excerpt is required.')
    if (!payload.content) return setError('Blog article content is required.')
    if (!payload.author) return setError('Blog author is required.')
    if (!payload.publishDate) return setError('Publish date is required.')

    try {
      setSavingBlog(true)
      setError('')
      setMessage('')

      if (editingBlogId) {
        await apiRequest(`/blogs/${editingBlogId}`, {
          method: 'PATCH',
          body: JSON.stringify(payload)
        })
        setMessage('Blog updated successfully.')
      } else {
        await apiRequest('/blogs', {
          method: 'POST',
          body: JSON.stringify(payload)
        })
        setMessage('Blog created successfully.')
      }

      setShowBlogForm(false)
      setEditingBlogId(null)
      setBlogForm(emptyBlog)
      await loadBlogs()
    } catch (err) {
      setError(err.message || 'Unable to save blog.')
    } finally {
      setSavingBlog(false)
    }
  }

  const handleToggleBlog = async blog => {
    try {
      setError('')
      setMessage('')
      await apiRequest(`/blogs/${blog._id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          isPublished: !Boolean(blog.isPublished ?? blog.published)
        })
      })
      setMessage(
        `${Boolean(blog.isPublished ?? blog.published) ? 'Blog unpublished.' : 'Blog published.'}`
      )
      await loadBlogs()
    } catch (err) {
      setError(err.message || 'Unable to change blog status.')
    }
  }

  const handleDeleteBlog = async blog => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${blog.title}"? This action cannot be undone.`
    )
    if (!confirmed) return

    try {
      setError('')
      setMessage('')
      await apiRequest(`/blogs/${blog._id}`, { method: 'DELETE' })
      setMessage('Blog deleted successfully.')
      if (previewBlog?._id === blog._id) setPreviewBlog(null)
      await loadBlogs()
    } catch (err) {
      setError(err.message || 'Unable to delete blog.')
    }
  }

  const formatBlogDate = value => {
    if (!value) return '—'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return '—'
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  // =========================
  // Products API
  // =========================
  const loadProducts = async () => {
    try {
      setLoadingProducts(true)
      setError('')

      const result = await adminService.products()

      setProducts(
        result?.data ||
        result?.products ||
        []
      )
    } catch (err) {
      setError(err.message || 'Unable to load products')
    } finally {
      setLoadingProducts(false)
    }
  }

  // =========================
  // Orders API
  // =========================
  const loadOrders = async () => {
    try {
      setLoadingOrders(true)
      setError('')

      const result = await apiRequest('/orders?all=true')
      setOrders(result?.data || [])
    } catch (err) {
      setError(err.message || 'Unable to load orders')
    } finally {
      setLoadingOrders(false)
    }
  }

  // =========================
  // Update Order Status
  // =========================
  const handleOrderStatus = async (orderId, status, courier = courierName, tracking = trackingNumber) => {
    try {
      setUpdatingOrderId(orderId)
      setError('')
      setMessage('')

      const result = await apiRequest(`/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({
          status,
          courierName: courier.trim(),
          trackingNumber: tracking.trim()
        })
      })

      if (!result?.success) {
        throw new Error(result?.message || 'Unable to update order')
      }

      const updatedOrder = result.data

      setOrders(prev =>
        prev.map(order =>
          order._id === orderId ? updatedOrder : order
        )
      )

      setSelectedOrder(prev =>
        prev?._id === orderId ? updatedOrder : prev
      )

      setMessage(`Order status changed to ${status.replace(/_/g, ' ')}.`)

      setCourierName(updatedOrder?.courierName || courier.trim())
      setTrackingNumber(updatedOrder?.trackingNumber || tracking.trim())
    } catch (err) {
      setError(err.message || 'Unable to update order status')
    } finally {
      setUpdatingOrderId(null)
    }
  }

  // =========================
  // Order Helpers
  // =========================
  const formatDate = value => {
    if (!value) return '—'
    return new Date(value).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short'
    })
  }

  const orderCustomer = order =>
    order?.shippingAddress?.name ||
    order?.user?.name ||
    'Customer'

  const orderEmail = order =>
    order?.shippingAddress?.email ||
    order?.user?.email ||
    '—'

  const orderPhone = order =>
    order?.shippingAddress?.phone || '—'

  const statusOptions = [
    'pending',
    'confirmed',
    'processing',
    'packed',
    'shipped',
    'out_for_delivery',
    'delivered',
    'cancelled'
  ]

  const statusLabel = status =>
    status
      .replace(/_/g, ' ')
      .replace(/\b\w/g, char => char.toUpperCase())

  // =========================
  // Form Input Handler
  // =========================
  const handleChange = e => {
    const { name, value, type, checked } = e.target

    setForm(prev => {
      const next = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }

      // A changed category clears a subcategory from the previous category.
      if (name === 'category') next.subcategory = ''

      // Selling price is always calculated from MRP and discount.
      if (name === 'mrp' || name === 'discountPercent') {
        const nextMrp = name === 'mrp' ? value : prev.mrp
        const nextDiscount = name === 'discountPercent' ? value : prev.discountPercent
        next.price = calculateSellingPrice(nextMrp, nextDiscount)
      }

      return next
    })
  }

  const handleShippingChange = e => {
    const { name, value } = e.target

    setForm(prev => ({
      ...prev,
      shipping: {
        ...prev.shipping,
        [name]: value
      }
    }))
  }

  // =========================
  // Multiple Product Images
  // =========================
  const handleImageChange = (index, value) => {
    setForm(prev => ({
      ...prev,
      images: prev.images.map((image, imageIndex) =>
        imageIndex === index ? value : image
      )
    }))
  }

  const addImageField = () => {
    setForm(prev => ({
      ...prev,
      images: [...prev.images, '']
    }))
  }

  const removeImageField = index => {
    setForm(prev => {
      const images = prev.images.filter((_, imageIndex) => imageIndex !== index)
      return {
        ...prev,
        images: images.length ? images : ['']
      }
    })
  }

  // =========================
  // Open Add Product Form
  // =========================
  const handleAddProduct = () => {
    setEditingId(null)
    setForm(emptyProduct)
    setError('')
    setMessage('')
    setShowForm(true)
  }

  // =========================
  // Open Edit Product Form
  // =========================
  const handleEditProduct = product => {
    setEditingId(product._id)

    const originalPrice = product.mrp ?? product.compareAtPrice ?? product.price ?? ''
    const currentSellingPrice = product.price ?? ''
    const existingDiscount = product.discountPercent ?? getDiscountFromPrices(originalPrice, currentSellingPrice)

    setForm({
      name: product.name || '',
      slug: product.slug || '',
      description: product.description || '',
      category: product.category || '',
      subcategory: product.subcategory || '',
      hsnCode: product.hsnCode || product.hsn || '',
      mrp: originalPrice,
      discountPercent: String(existingDiscount ?? 0),
      price: calculateSellingPrice(originalPrice, existingDiscount) !== ''
        ? calculateSellingPrice(originalPrice, existingDiscount)
        : currentSellingPrice,
      showDiscountPercent: Boolean(product.showDiscountPercent),
      stock: product.stock ?? '',
      shipping: {
        weight: product.shipping?.weight ?? '',
        length: product.shipping?.length ?? '',
        breadth: product.shipping?.breadth ?? '',
        height: product.shipping?.height ?? ''
      },
      images: Array.isArray(product.images) && product.images.length
        ? product.images
        : [''],
      productDetails: product.productDetails || '',
      shippingPayment: product.shippingPayment || '',
      returnExchange: product.returnExchange || ''
    })

    setError('')
    setMessage('')
    setShowForm(true)

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  // =========================
  // Close Product Form
  // =========================
  const handleCancel = () => {
    setShowForm(false)
    setEditingId(null)
    setForm(emptyProduct)
    setError('')
  }

  // =========================
  // Submit Product
  // =========================
  const handleSubmit = async e => {
    e.preventDefault()

    setError('')
    setMessage('')

    // Basic validation
    if (!form.name.trim()) {
      setError('Product name is required.')
      return
    }

    if (!form.slug.trim()) {
      setError('Product slug is required.')
      return
    }

    if (!form.description.trim()) {
      setError('Product description is required.')
      return
    }

    if (!form.category.trim()) {
      setError('Product category is required.')
      return
    }

    if (!String(form.hsnCode || '').trim()) {
      setError('HSN code is required.')
      return
    }

    if (form.mrp === '' || !Number.isFinite(Number(form.mrp)) || Number(form.mrp) < 0) {
      setError('Please enter a valid MRP.')
      return
    }

    if (form.discountPercent === '' || !Number.isFinite(Number(form.discountPercent)) || Number(form.discountPercent) < 0 || Number(form.discountPercent) > 100) {
      setError('Discount must be between 0 and 100%.')
      return
    }

    const sellingPrice = calculateSellingPrice(form.mrp, form.discountPercent)
    if (sellingPrice === '' || !Number.isFinite(sellingPrice) || sellingPrice < 0) {
      setError('Unable to calculate the selling price. Check MRP and discount.')
      return
    }

    if (form.stock !== '' && Number(form.stock) < 0) {
      setError('Stock cannot be negative.')
      return
    }

    if (form.shipping.weight === '' || Number(form.shipping.weight) <= 0) {
      setError('Please enter a valid shipping weight.')
      return
    }

    if (form.shipping.length === '' || Number(form.shipping.length) <= 0) {
      setError('Please enter a valid package length.')
      return
    }

    if (form.shipping.breadth === '' || Number(form.shipping.breadth) <= 0) {
      setError('Please enter a valid package breadth.')
      return
    }

    if (form.shipping.height === '' || Number(form.shipping.height) <= 0) {
      setError('Please enter a valid package height.')
      return
    }

    const productImages = form.images
      .map(url => url.trim())
      .filter(Boolean)

    if (!productImages.length) {
      setError('Please add at least one product image URL.')
      return
    }

    // Convert form data to backend format
    const productData = {
      name: form.name.trim(),
      slug: form.slug.trim().toLowerCase(),
      description: form.description.trim(),
      category: form.category.trim(),
      subcategory: String(form.subcategory || '').trim(),
      hsnCode: String(form.hsnCode || '').trim(),
      mrp: Number(form.mrp),
      compareAtPrice: Number(form.mrp),
      discountPercent: Number(form.discountPercent),
      price: sellingPrice,
      showDiscountPercent: Boolean(form.showDiscountPercent),
      stock:
        form.stock === ''
          ? 0
          : Number(form.stock),
      shipping: {
        weight: Number(form.shipping.weight),
        length: Number(form.shipping.length),
        breadth: Number(form.shipping.breadth),
        height: Number(form.shipping.height)
      },
      images: productImages,
      productDetails: form.productDetails.trim(),
      shippingPayment: form.shippingPayment.trim(),
      returnExchange: form.returnExchange.trim()
    }

    try {
      setSaving(true)

      if (editingId) {
        // Update existing product
        await adminService.updateProduct(
          editingId,
          productData
        )

        setMessage('Product updated successfully.')
      } else {
        // Create new product
        await adminService.createProduct(
          productData
        )

        setMessage('Product added successfully.')
      }

      setForm(emptyProduct)
      setEditingId(null)
      setShowForm(false)

      await loadProducts()
      await loadDashboard()
    } catch (err) {
      setError(
        err.message ||
        'Unable to save product.'
      )
    } finally {
      setSaving(false)
    }
  }

  // =========================
  // Archive Product
  // =========================
  const handleArchive = async product => {
    const confirmed = window.confirm(
      `Are you sure you want to archive "${product.name}"?`
    )

    if (!confirmed) return

    try {
      setError('')
      setMessage('')

      await adminService.archiveProduct(
        product._id
      )

      setMessage(
        'Product archived successfully.'
      )

      await loadProducts()
      await loadDashboard()
    } catch (err) {
      setError(
        err.message ||
        'Unable to archive product.'
      )
    }
  }

  // =========================
  // Admin Access Check
  // =========================
  if (user?.role !== 'admin') {
    return (
      <main className="page xaaj-admin-v2">
<style>{`
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@500;600&display=swap');
.xaaj-admin-v2{--ink:#24221f;--muted:#777169;--line:#e9e3da;--paper:#fffdf9;--cream:#f5f1ea;--accent:#8b6a43;--dark:#26231f;max-width:1500px!important;margin:0 auto!important;padding:34px 38px 90px!important;background:radial-gradient(circle at 85% 0%,rgba(139,106,67,.08),transparent 30%),#f8f5ef!important;font-family:'DM Sans',sans-serif;color:var(--ink)}
.xaaj-admin-v2 *{box-sizing:border-box}.xaaj-admin-v2 h1,.xaaj-admin-v2 h2,.xaaj-admin-v2 h3{font-family:'Playfair Display',serif;letter-spacing:-.025em}.xaaj-admin-v2 h1{font-size:42px!important;margin:4px 0 8px!important}.xaaj-admin-v2 h2{font-size:28px!important}.xaaj-admin-v2 p{color:var(--muted);line-height:1.65}.xaaj-admin-v2 .wrap{max-width:none!important}
/* header */
.xaaj-admin-v2 .admin-header,.xaaj-admin-v2 header:first-child{background:linear-gradient(135deg,#292620,#40382f)!important;color:#fff!important;border:0!important;border-radius:24px!important;padding:30px 34px!important;box-shadow:0 22px 55px rgba(38,35,31,.16)!important;position:relative;overflow:hidden}.xaaj-admin-v2 .admin-header:after,.xaaj-admin-v2 header:first-child:after{content:'';position:absolute;right:-90px;top:-100px;width:280px;height:280px;border:1px solid rgba(255,255,255,.12);border-radius:50%;box-shadow:0 0 0 45px rgba(255,255,255,.035),0 0 0 90px rgba(255,255,255,.025)}
/* buttons */
.xaaj-admin-v2 button,.xaaj-admin-v2 .button{appearance:none!important;border:1px solid #d8d0c4!important;background:#fff!important;color:#292621!important;border-radius:12px!important;padding:11px 17px!important;font:600 13px 'DM Sans',sans-serif!important;letter-spacing:.01em!important;cursor:pointer!important;transition:all .2s ease!important;box-shadow:0 2px 0 rgba(0,0,0,.02)!important}.xaaj-admin-v2 button:hover:not(:disabled){transform:translateY(-2px)!important;border-color:#b7a58e!important;box-shadow:0 9px 22px rgba(49,41,31,.10)!important}.xaaj-admin-v2 button.button,.xaaj-admin-v2 button[type=submit]{background:#292621!important;color:#fff!important;border-color:#292621!important;box-shadow:0 8px 20px rgba(41,38,33,.18)!important}.xaaj-admin-v2 button.button:hover,.xaaj-admin-v2 button[type=submit]:hover{background:#8b6a43!important;border-color:#8b6a43!important}.xaaj-admin-v2 button:disabled{opacity:.45!important;cursor:not-allowed!important;transform:none!important}
/* sections */
.xaaj-admin-v2 section{background:rgba(255,253,249,.92)!important;border:1px solid var(--line)!important;border-radius:22px!important;padding:30px!important;margin-bottom:28px!important;box-shadow:0 12px 35px rgba(63,53,41,.055)!important;backdrop-filter:blur(8px)}
.xaaj-admin-v2 section:hover{box-shadow:0 18px 45px rgba(63,53,41,.075)!important}.xaaj-admin-v2 .summary{position:relative!important;background:linear-gradient(145deg,#fffefa,#f4eee5)!important;border:1px solid #e5ddd2!important;border-radius:20px!important;padding:24px!important;min-height:125px!important;box-shadow:0 12px 28px rgba(57,47,35,.07)!important;overflow:hidden}.xaaj-admin-v2 .summary:after{content:'';position:absolute;right:-28px;bottom:-38px;width:100px;height:100px;border:1px solid rgba(139,106,67,.16);border-radius:50%}.xaaj-admin-v2 .summary strong{display:block!important;font-size:31px!important;font-family:'Playfair Display',serif!important}.xaaj-admin-v2 .summary span{display:block!important;margin-top:8px!important;color:var(--muted)!important;font-size:12px!important;text-transform:uppercase!important;letter-spacing:.12em!important}
/* controls */
.xaaj-admin-v2 input:not([type=checkbox]),.xaaj-admin-v2 textarea,.xaaj-admin-v2 select{background:#fffefa!important;border:1px solid #ded7cd!important;border-radius:11px!important;padding:12px 14px!important;color:#2c2925!important;outline:none!important;transition:.2s!important;box-shadow:inset 0 1px 2px rgba(0,0,0,.025)!important}.xaaj-admin-v2 input:not([type=checkbox]):focus,.xaaj-admin-v2 textarea:focus,.xaaj-admin-v2 select:focus{border-color:#9b7c58!important;box-shadow:0 0 0 4px rgba(139,106,67,.10)!important}.xaaj-admin-v2 label{font-weight:600!important;font-size:13px!important;color:#4c4741!important}
/* lists/cards */
.xaaj-admin-v2 img{border-radius:14px}.xaaj-admin-v2 [style*="border: '1px solid #e5e5e5'"]{border-color:#e7dfd5!important;border-radius:15px!important;background:#fffefa!important}.xaaj-admin-v2 small{color:#8b857d!important}.xaaj-admin-v2 .eyebrow{text-transform:uppercase!important;letter-spacing:.16em!important;font-size:10px!important;font-weight:700!important;color:#9a7954!important}
/* status */
.xaaj-admin-v2 [style*="borderRadius: '999px'"]{box-shadow:0 2px 8px rgba(0,0,0,.04)!important}
/* message */
.xaaj-admin-v2 div[style*="background: '#edf7ed'"]{border:1px solid #cfe2d0!important;border-radius:13px!important;box-shadow:0 8px 20px rgba(56,95,60,.07)!important}.xaaj-admin-v2 div[style*="background: '#fff1f0'"]{border:1px solid #edd0cd!important;border-radius:13px!important}
@media(max-width:900px){.xaaj-admin-v2{padding:20px 14px 60px!important}.xaaj-admin-v2 h1{font-size:32px!important}.xaaj-admin-v2 section{padding:21px!important;border-radius:18px!important}}
`}</style>
        <div className="wrap narrow">
          <h1>Admin access required</h1>

          <p>
            Sign in with an administrator
            account to manage the store.
          </p>
        </div>
      </main>
    )
  }

  // =========================
  // Admin UI
  // =========================
  return (
    <main className="page xaaj-admin-v2" data-active-section={activeSection}>
      <style>{`.xaaj-admin-v2{--ink:#25231f;--muted:#777169;--line:#e7e0d6;min-height:100vh!important;max-width:none!important;margin:0!important;padding:0!important;background:radial-gradient(circle at 82% 0%,rgba(154,116,72,.09),transparent 28%),#f7f4ee!important;font-family:'DM Sans',sans-serif;color:var(--ink)}
.xaaj-admin-v2 *{box-sizing:border-box}.xaaj-admin-v2 .admin-shell{display:grid;grid-template-columns:250px minmax(0,1fr);min-height:100vh}.xaaj-admin-v2 .admin-sidebar{position:sticky;top:0;height:100vh;background:linear-gradient(180deg,#10271c,#0b1f16);color:#fff;padding:28px 18px;display:flex;flex-direction:column;z-index:20;box-shadow:14px 0 45px rgba(34,29,23,.12)}.xaaj-admin-v2 .brand-mark{padding:6px 12px 30px;border-bottom:1px solid rgba(255,255,255,.1);margin-bottom:22px}.xaaj-admin-v2 .brand-mark strong{font-family:'Playfair Display',serif;font-size:27px;letter-spacing:.08em;font-weight:500}.xaaj-admin-v2 .brand-mark span{display:block;margin-top:5px;color:#bdb5aa;font-size:9px;letter-spacing:.18em;text-transform:uppercase}.xaaj-admin-v2 .side-label{font-size:9px;text-transform:uppercase;letter-spacing:.18em;color:#8f887d;padding:0 12px 10px}.xaaj-admin-v2 .side-nav{display:grid;gap:5px}.xaaj-admin-v2 .side-nav button{width:100%!important;border:0!important;background:transparent!important;color:#bdb7ae!important;box-shadow:none!important;border-radius:12px!important;padding:12px 13px!important;display:flex!important;align-items:center!important;gap:12px!important;text-align:left!important;font:600 12px 'DM Sans',sans-serif!important;transform:none!important}.xaaj-admin-v2 .side-nav button:hover{background:rgba(47,112,72,.28)!important;color:#fff!important;border-color:rgba(82,157,105,.45)!important;transform:translateX(3px)!important}.xaaj-admin-v2 .side-nav button.active{background:linear-gradient(90deg,#2f7048,#245d3b)!important;color:#fff!important;box-shadow:0 8px 22px rgba(47,112,72,.28),inset 3px 0 #8bd19d!important}.xaaj-admin-v2 .side-nav button.active:hover{background:linear-gradient(90deg,#398356,#2f7048)!important}.xaaj-admin-v2 .side-icon{width:25px;height:25px;border:1px solid rgba(255,255,255,.13);border-radius:8px;display:grid;place-items:center;font-size:11px;color:#9dd5aa;flex:none}.xaaj-admin-v2 .side-footer{margin-top:auto;padding:15px 0 4px}.xaaj-admin-v2 .sidebar-logout{width:100%!important;display:flex!important;align-items:center!important;justify-content:center!important;gap:10px!important;background:rgba(255,255,255,.045)!important;color:#d8ddd9!important;border:1px solid rgba(255,255,255,.13)!important;border-radius:12px!important;padding:11px 14px!important;box-shadow:none!important}.xaaj-admin-v2 .sidebar-logout:hover{background:#2f7048!important;border-color:#4d9666!important;color:#fff!important;transform:translateY(-1px)!important;box-shadow:0 8px 20px rgba(47,112,72,.25)!important}.xaaj-admin-v2 .sidebar-logout span:first-child{font-size:15px;color:#9bcda7}.xaaj-admin-v2 .admin-main{min-width:0;padding:28px 34px 70px}.xaaj-admin-v2 .content-width{max-width:1320px;margin:0 auto}.xaaj-admin-v2 .topbar{display:flex;justify-content:space-between;align-items:center;gap:20px;margin-bottom:26px;padding:22px 26px;background:rgba(255,253,249,.88);border:1px solid var(--line);border-radius:20px;box-shadow:0 12px 35px rgba(63,53,41,.055);backdrop-filter:blur(10px)}.xaaj-admin-v2 .topbar h1,.xaaj-admin-v2 h1,.xaaj-admin-v2 h2,.xaaj-admin-v2 h3{font-family:'Playfair Display',serif;letter-spacing:-.025em}.xaaj-admin-v2 .topbar h1{font-size:32px!important;margin:3px 0 4px!important}.xaaj-admin-v2 .topbar p{margin:0;color:var(--muted);font-size:13px}.xaaj-admin-v2 .top-actions{display:flex;gap:9px;align-items:center;flex-wrap:wrap}.xaaj-admin-v2 .live-store-btn{display:inline-flex!important;align-items:center!important;gap:9px!important;background:#fff!important;color:#205c36!important;border:1px solid #a9c9b1!important;border-radius:999px!important;padding:10px 15px!important;box-shadow:0 5px 16px rgba(47,112,72,.10)!important}.xaaj-admin-v2 .live-store-btn:hover{background:#2f7048!important;color:#fff!important;border-color:#2f7048!important;box-shadow:0 9px 22px rgba(47,112,72,.24)!important}.xaaj-admin-v2 .live-dot{width:9px;height:9px;border-radius:50%;background:#35a85a;box-shadow:0 0 0 0 rgba(53,168,90,.55);animation:xaaj-live-pulse 1.25s infinite}.xaaj-admin-v2 .live-store-btn:hover .live-dot{background:#fff;box-shadow:0 0 0 0 rgba(255,255,255,.55)}@keyframes xaaj-live-pulse{0%{box-shadow:0 0 0 0 rgba(53,168,90,.55);opacity:1}70%{box-shadow:0 0 0 7px rgba(53,168,90,0);opacity:.72}100%{box-shadow:0 0 0 0 rgba(53,168,90,0);opacity:1}}.xaaj-admin-v2 button,.xaaj-admin-v2 .button{appearance:none!important;border:1px solid #d8d0c4!important;background:#fff!important;color:#292621!important;border-radius:11px!important;padding:10px 15px!important;font:600 12px 'DM Sans',sans-serif!important;cursor:pointer!important;transition:all .2s ease!important;box-shadow:0 2px 0 rgba(0,0,0,.02)!important}.xaaj-admin-v2 button:hover:not(:disabled){transform:translateY(-1px)!important;border-color:#3b8758!important;background:#eef8f1!important;color:#1f5c35!important;box-shadow:0 8px 18px rgba(47,112,72,.12)!important}.xaaj-admin-v2 button.button,.xaaj-admin-v2 button[type=submit]{background:#292621!important;color:#fff!important;border-color:#292621!important;box-shadow:0 7px 18px rgba(41,38,33,.18)!important}.xaaj-admin-v2 button.button:hover,.xaaj-admin-v2 button[type=submit]:hover{background:#2f7048!important;border-color:#2f7048!important;color:#fff!important;box-shadow:0 9px 22px rgba(47,112,72,.24)!important}.xaaj-admin-v2 button:disabled{opacity:.45!important;cursor:not-allowed!important;transform:none!important}.xaaj-admin-v2 section{background:rgba(255,253,249,.94)!important;border:1px solid var(--line)!important;border-radius:20px!important;padding:28px!important;margin-bottom:26px!important;box-shadow:0 12px 35px rgba(63,53,41,.055)!important}.xaaj-admin-v2 .summary{background:linear-gradient(145deg,#fffefa,#f2ece2)!important;border:1px solid #e4dcd1!important;border-radius:18px!important;padding:23px!important;min-height:120px!important;box-shadow:0 10px 25px rgba(57,47,35,.065)!important}.xaaj-admin-v2 .summary strong{font-family:'Playfair Display',serif!important;font-size:30px!important}.xaaj-admin-v2 .summary span{display:block!important;margin-top:7px!important;color:var(--muted)!important;font-size:11px!important;text-transform:uppercase!important;letter-spacing:.12em!important}.xaaj-admin-v2 input:not([type=checkbox]),.xaaj-admin-v2 textarea,.xaaj-admin-v2 select{background:#fffefa!important;border:1px solid #ded7cd!important;border-radius:10px!important;padding:11px 13px!important;color:#2c2925!important;outline:none!important;transition:.2s!important}.xaaj-admin-v2 input:not([type=checkbox]):focus,.xaaj-admin-v2 textarea:focus,.xaaj-admin-v2 select:focus{border-color:#9b7c58!important;box-shadow:0 0 0 4px rgba(139,106,67,.10)!important}.xaaj-admin-v2 label{font-weight:600!important;font-size:12px!important;color:#4c4741!important}.xaaj-admin-v2 img{border-radius:13px}.xaaj-admin-v2 .eyebrow{text-transform:uppercase!important;letter-spacing:.16em!important;font-size:9px!important;font-weight:700!important;color:#9a7954!important}.xaaj-admin-v2 small{color:#8b857d!important}.xaaj-admin-v2[data-active-section=dashboard] [data-admin-section]:not([data-admin-section=dashboard]),.xaaj-admin-v2[data-active-section=announcement] [data-admin-section]:not([data-admin-section=announcement]),.xaaj-admin-v2[data-active-section=hero] [data-admin-section]:not([data-admin-section=hero]),.xaaj-admin-v2[data-active-section=blog] [data-admin-section]:not([data-admin-section=blog]),.xaaj-admin-v2[data-active-section=orders] [data-admin-section]:not([data-admin-section=orders]),.xaaj-admin-v2[data-active-section=products] [data-admin-section]:not([data-admin-section=products]),.xaaj-admin-v2[data-active-section=section-images] [data-admin-section]:not([data-admin-section=section-images]){display:none!important}.xaaj-admin-v2 .side-icon svg{display:block}.xaaj-admin-v2 .sidebar-logout svg{color:#9bcda7;flex:none}.xaaj-admin-v2 .sidebar-logout:hover svg{color:#fff}.xaaj-admin-v2 .live-store-btn svg{flex:none}.xaaj-admin-v2 .product-header-actions{display:flex;align-items:center;gap:9px;flex-wrap:wrap}.xaaj-admin-v2 .product-header-actions button{display:inline-flex!important;align-items:center!important;justify-content:center!important;gap:8px!important;min-height:39px!important}.xaaj-admin-v2 .product-add-btn{background:#292621!important;color:#fff!important;border-color:#292621!important;box-shadow:0 7px 18px rgba(41,38,33,.14)!important}.xaaj-admin-v2 .product-add-btn:hover{background:#2f7048!important;border-color:#2f7048!important;color:#fff!important;box-shadow:0 9px 22px rgba(47,112,72,.22)!important}.xaaj-admin-v2 .product-refresh-btn{background:#fff!important;color:#3f3a34!important}.xaaj-admin-v2 .product-refresh-btn:hover{background:#eef8f1!important;color:#1f5c35!important;border-color:#3b8758!important}.xaaj-admin-v2 .is-spinning{animation:xaaj-spin .8s linear infinite}@keyframes xaaj-spin{to{transform:rotate(360deg)}}
.xaaj-admin-v2 #product-subcategory:disabled{opacity:.62;cursor:not-allowed;background:#f3efe9!important}.xaaj-admin-v2 #show-discount-percent{padding:0!important;border:0!important;box-shadow:none!important}.xaaj-admin-v2 #product-selling-price{background:#f4f0e9!important;color:#5e5144!important;font-weight:700!important}.xaaj-admin-v2 #product-mrp,.xaaj-admin-v2 #product-discount{width:100%;min-width:0}
@media(max-width:620px){.xaaj-admin-v2 #product-subcategory{grid-column:1 / -1}.xaaj-admin-v2 #product-subcategory + small{grid-column:1 / -1}.xaaj-admin-v2 [data-product-pricing-grid]{grid-template-columns:1fr!important}}
@media(max-width:900px){.xaaj-admin-v2 .admin-shell{grid-template-columns:1fr}.xaaj-admin-v2 .admin-sidebar{position:sticky;top:0;height:auto;padding:13px 12px}.xaaj-admin-v2 .brand-mark,.xaaj-admin-v2 .side-label{display:none}.xaaj-admin-v2 .side-footer{display:block;margin:0 0 0 8px;padding:0;flex:none}.xaaj-admin-v2 .sidebar-logout{width:auto!important;padding:9px 12px!important}.xaaj-admin-v2 .side-nav{display:flex;overflow-x:auto;gap:5px}.xaaj-admin-v2 .side-nav button{width:auto!important;white-space:nowrap;padding:9px 11px!important}.xaaj-admin-v2 .side-icon{display:none}.xaaj-admin-v2 .admin-main{padding:18px 14px 50px}.xaaj-admin-v2 .topbar{padding:18px}.xaaj-admin-v2 .topbar h1{font-size:27px!important}}
/* WOODISTRY luxury furniture admin theme — visual overrides only */
.xaaj-admin-v2{--ink:#241b14!important;--muted:#796d60!important;--line:#e9dfd2!important;background:#f4efe7!important;color:#241b14!important;font-family:'DM Sans',sans-serif!important}
.xaaj-admin-v2 .admin-shell{grid-template-columns:246px minmax(0,1fr)!important}
.xaaj-admin-v2 .admin-sidebar{background:linear-gradient(180deg,#352516 0%,#24180f 65%,#1b130d 100%)!important;box-shadow:10px 0 38px rgba(42,27,15,.14)!important;padding:28px 14px 20px!important}
.xaaj-admin-v2 .brand-mark{padding:8px 10px 28px!important;border-bottom-color:rgba(233,216,190,.18)!important}
.xaaj-admin-v2 .brand-mark strong{font-family:'Playfair Display',serif!important;font-size:23px!important;letter-spacing:.13em!important;color:#f4e7d3!important;white-space:nowrap}
.xaaj-admin-v2 .brand-mark span{color:#c6ae8e!important;font-size:8px!important;letter-spacing:.15em!important}
.xaaj-admin-v2 .side-label{color:#aa9276!important}
.xaaj-admin-v2 .side-nav button{color:#dfd0bd!important;border-radius:10px!important;font-size:12px!important;padding:12px 11px!important}
.xaaj-admin-v2 .side-nav button:hover{background:rgba(196,151,99,.14)!important;color:#fff7ec!important;border-color:transparent!important;transform:translateX(2px)!important}
.xaaj-admin-v2 .side-nav button.active{background:linear-gradient(110deg,#65472b,#49301d)!important;color:#fff7ec!important;box-shadow:inset 3px 0 #d9b58b,0 8px 20px rgba(15,9,4,.15)!important}
.xaaj-admin-v2 .side-icon{color:#d6b38a!important;border-color:rgba(225,196,161,.24)!important}
.xaaj-admin-v2 .sidebar-logout{background:rgba(255,255,255,.035)!important;border-color:rgba(225,196,161,.23)!important;color:#eadbc7!important}
.xaaj-admin-v2 .sidebar-logout svg{color:#d4b28a!important}
.xaaj-admin-v2 .sidebar-logout:hover{background:#65472b!important;border-color:#8b6847!important;color:#fff!important}
.xaaj-admin-v2 .admin-main{padding:22px 28px 60px!important;background:radial-gradient(ellipse at 88% 0%,rgba(178,139,95,.10),transparent 32%),#f4efe7!important}
.xaaj-admin-v2 .content-width{max-width:1600px!important}
.xaaj-admin-v2 .topbar{background:rgba(255,252,247,.82)!important;border:1px solid #e8ded1!important;border-radius:18px!important;padding:17px 22px!important;box-shadow:0 7px 24px rgba(65,44,25,.045)!important;margin-bottom:20px!important}
.xaaj-admin-v2 .topbar h1{font-size:30px!important;color:#261b12!important}
.xaaj-admin-v2 .eyebrow{color:#92704b!important;letter-spacing:.19em!important}
.xaaj-admin-v2 .topbar p{color:#837568!important}
.xaaj-admin-v2 button.button,.xaaj-admin-v2 button[type=submit],.xaaj-admin-v2 .product-add-btn{background:#49301d!important;border-color:#49301d!important;color:#fff8ef!important}
.xaaj-admin-v2 button.button:hover,.xaaj-admin-v2 button[type=submit]:hover,.xaaj-admin-v2 .product-add-btn:hover{background:#6a4b2e!important;border-color:#6a4b2e!important;color:#fff!important}
.xaaj-admin-v2 button:hover:not(:disabled){border-color:#b99b79!important;background:#f4eadc!important;color:#49301d!important;box-shadow:0 7px 18px rgba(80,53,29,.10)!important}
.xaaj-admin-v2 section{background:rgba(255,252,247,.9)!important;border-color:#e9dfd2!important;border-radius:18px!important;box-shadow:0 8px 28px rgba(65,44,25,.045)!important;padding:24px!important;margin-bottom:20px!important}
.xaaj-admin-v2 .summary{background:linear-gradient(145deg,#fffdf9,#f0e7db)!important;border-color:#e6d9c8!important;border-radius:16px!important;box-shadow:0 6px 20px rgba(65,44,25,.055)!important;min-height:116px!important}
.xaaj-admin-v2 .summary strong{font-size:29px!important;color:#261b12!important}
.xaaj-admin-v2 .summary span{color:#87735f!important;letter-spacing:.14em!important}
.xaaj-admin-v2 input:not([type=checkbox]),.xaaj-admin-v2 textarea,.xaaj-admin-v2 select{background:#fffdf9!important;border-color:#e2d6c8!important;border-radius:9px!important}
.xaaj-admin-v2 input:not([type=checkbox]):focus,.xaaj-admin-v2 textarea:focus,.xaaj-admin-v2 select:focus{border-color:#a78661!important;box-shadow:0 0 0 3px rgba(167,134,97,.12)!important}
.xaaj-admin-v2 .woodistry-dashboard-hero{position:relative;display:flex;align-items:center;justify-content:space-between;gap:24px;min-height:250px;overflow:hidden;margin:0 0 18px!important;padding:30px 34px!important;border:0!important;border-radius:16px!important;background:linear-gradient(90deg,rgba(224,207,184,.97) 0%,rgba(224,207,184,.90) 31%,rgba(224,207,184,.18) 57%,rgba(45,29,16,.08) 100%),url('https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1800&q=85') center 54%/cover!important;box-shadow:0 12px 30px rgba(65,44,25,.10)!important}
.xaaj-admin-v2 .woodistry-hero-copy{position:relative;z-index:2;max-width:460px}
.xaaj-admin-v2 .woodistry-hero-eyebrow{font-size:10px;font-weight:700;letter-spacing:.22em;color:#6e4d2e}
.xaaj-admin-v2 .woodistry-dashboard-hero h2{font-size:clamp(30px,3vw,43px)!important;line-height:1.05!important;margin:12px 0 10px!important;color:#24180f!important}
.xaaj-admin-v2 .woodistry-dashboard-hero p{max-width:390px;margin:0 0 17px!important;color:#4f4032!important;font-size:13px;line-height:1.65}
.xaaj-admin-v2 .woodistry-dashboard-hero .woodistry-hero-cta{display:inline-flex!important;align-items:center!important;gap:9px!important;background:#49301d!important;color:#fff8ef!important;border-color:#49301d!important;border-radius:8px!important;padding:12px 17px!important}
.xaaj-admin-v2 .woodistry-dashboard-hero .woodistry-hero-cta:hover{background:#6a4b2e!important;color:#fff!important}
.xaaj-admin-v2 .woodistry-hero-quote{position:relative;z-index:2;align-self:flex-start;margin:8px 10px 0 auto;color:#332216;font-family:'Playfair Display',serif;font-size:clamp(19px,2vw,27px);font-style:italic;line-height:1.3;text-align:right;text-shadow:0 1px 10px rgba(255,255,255,.4)}
.xaaj-admin-v2 .product-grid{display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:12px!important}
.xaaj-admin-v2 [data-admin-section=dashboard]{margin-bottom:18px!important}
.xaaj-admin-v2 h2{color:#2b2017!important}
.xaaj-admin-v2 img{border-radius:10px!important}
@media(max-width:1100px){.xaaj-admin-v2 .admin-shell{grid-template-columns:220px minmax(0,1fr)!important}.xaaj-admin-v2 .admin-main{padding:18px 18px 50px!important}.xaaj-admin-v2 .product-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}.xaaj-admin-v2 .woodistry-dashboard-hero{min-height:220px;padding:24px!important}}
@media(max-width:900px){.xaaj-admin-v2 .admin-shell{grid-template-columns:1fr!important}.xaaj-admin-v2 .admin-sidebar{background:#2c1e12!important;padding:12px!important}.xaaj-admin-v2 .side-nav button.active{background:#65472b!important}.xaaj-admin-v2 .admin-main{padding:14px 12px 40px!important}.xaaj-admin-v2 .woodistry-dashboard-hero{min-height:250px;padding:22px!important;background-position:58% center!important}.xaaj-admin-v2 .woodistry-hero-quote{display:none}.xaaj-admin-v2 .woodistry-dashboard-hero h2{font-size:32px!important}.xaaj-admin-v2 .topbar{align-items:flex-start!important;gap:12px!important;flex-wrap:wrap!important}.xaaj-admin-v2 .topbar h1{font-size:26px!important}}
@media(max-width:520px){.xaaj-admin-v2 .product-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:9px!important}.xaaj-admin-v2 .summary{padding:15px!important;min-height:100px!important}.xaaj-admin-v2 .summary strong{font-size:23px!important}.xaaj-admin-v2 .woodistry-dashboard-hero{min-height:260px!important;background-position:62% center!important}.xaaj-admin-v2 .woodistry-dashboard-hero p{max-width:250px}.xaaj-admin-v2 section{padding:17px!important}}
`}</style>
      <div className="admin-shell">
        <aside className="admin-sidebar">
          <div className="brand-mark"><strong>WOODISTRY</strong><span>Furniture for a better home</span></div>
          <div className="side-label">Store Management</div>
          <nav className="side-nav">
            {[
              ['dashboard', 'Overview', FiGrid],
              ['announcement', 'Announcement', FiBell],
              ['hero', 'Hero Media', FiImage],
              ['section-images', 'Section Images', FiImage],
              ['blog', 'Blog', FiEdit3],
              ['orders', 'Orders', FiClock],
              ['products', 'Products', FiPackage]
            ].map(([key, label, Icon]) => (
              <button
                key={key}
                type="button"
                className={activeSection === key ? 'active' : ''}
                onClick={() => {
                  setActiveSection(key)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
              >
                <span className="side-icon">
                  <Icon size={15} strokeWidth={1.8} />
                </span>
                <span>{label}</span>
              </button>
            ))}
          </nav>
          <div className="side-footer">
            <button
              type="button"
              className="sidebar-logout"
              onClick={async () => {
                await logout()
                window.location.href = '/account'
              }}
            >
              <FiLogOut size={15} strokeWidth={1.8} />
              <span>Logout</span>
            </button>
          </div>
        </aside>
        <div className="admin-main">
          <div className="content-width">


        <div className="topbar">
          <div>
            <span className="eyebrow">WOODISTRY / ADMIN</span>
            <h1>{activeSection === 'dashboard' ? 'Store overview' : activeSection === 'announcement' ? 'Announcement bar' : activeSection === 'hero' ? 'Hero media' : activeSection === 'section-images' ? 'Section images' : activeSection === 'blog' ? 'Blog management' : activeSection === 'orders' ? 'Customer orders' : 'Product management'}</h1>
            <p>Manage your Woodistry store, products and customer orders.</p>
          </div>
          <div className="top-actions">
            <button
              type="button"
              className="live-store-btn"
              onClick={() =>
  window.open(
    '/?xaajPreview=1',
    '_blank',
    'noopener,noreferrer'
  )
}
              title="Open live store"
            >
              <span className="live-dot" />
              <FiExternalLink size={14} strokeWidth={1.8} />
              <span>Live Store</span>
            </button>
          </div>
        </div>

        {/* =========================
            Success Message
        ========================== */}
        {message && (
          <div
            style={{
              padding: '14px 16px',
              marginBottom: '20px',
              borderRadius: '8px',
              background: '#edf7ed',
              color: '#246b2a'
            }}
          >
            {message}
          </div>
        )}

        {/* =========================
            Error Message
        ========================== */}
        {error && (
          <div
            style={{
              padding: '14px 16px',
              marginBottom: '20px',
              borderRadius: '8px',
              background: '#fff1f0',
              color: '#b42318'
            }}
          >
            {error}
          </div>
        )}

        {/* =========================
            WOODISTRY Dashboard Hero (visual only)
        ========================== */}
        <section className="woodistry-dashboard-hero" data-admin-section="dashboard">
          <div className="woodistry-hero-copy">
            <span className="woodistry-hero-eyebrow">WELCOME BACK</span>
            <h2>Manage your<br />Woodistry store</h2>
            <p>Create beautiful products, manage orders and grow your furniture business.</p>
            <button type="button" className="woodistry-hero-cta" onClick={handleAddProduct}>
              <FiPlus size={16} /> Add New Product
            </button>
          </div>
          <div className="woodistry-hero-quote">“Good design<br />lives longer.”</div>
        </section>

        {/* =========================
            Dashboard Stats
        ========================== */}
        {dashboard && (
          <section data-admin-section="dashboard"
            style={{
              marginBottom: '50px'
            }}
          >
            <div className="product-grid">

              <div className="summary">
                <strong>
                  ${Number(dashboard.sales ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </strong>

                <span>
                  Total sales
                </span>
              </div>

              <div className="summary">
                <strong>
                  {dashboard.orders ?? 0}
                </strong>

                <span>
                  Orders
                </span>
              </div>

              <div className="summary">
                <strong>
                  {dashboard.customers ?? 0}
                </strong>

                <span>
                  Customers
                </span>
              </div>

              <div className="summary">
                <strong>
                  {dashboard.lowStock ?? 0}
                </strong>

                <span>
                  Low stock
                </span>
              </div>

            </div>
          </section>
        )}

        {/* =========================
            Announcement Bar Management
        ========================== */}
        <section data-admin-section="announcement"
          style={{
            marginBottom: '50px',
            padding: '28px',
            border: '1px solid #e5e5e5',
            borderRadius: '12px'
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: '20px',
              flexWrap: 'wrap',
              marginBottom: '24px'
            }}
          >
            <div>
              <span className="eyebrow">Website Content</span>
              <h2>Announcement Bar</h2>
              <p>
                Update the message shown in the announcement bar on the
                customer website.
              </p>
            </div>

            <div
              style={{
                padding: '8px 12px',
                borderRadius: '999px',
                background: announcementEnabled ? '#edf7ed' : '#f5f5f5',
                color: announcementEnabled ? '#246b2a' : '#666',
                fontSize: '13px',
                fontWeight: 600
              }}
            >
              {announcementEnabled ? 'Live on website' : 'Hidden'}
            </div>
          </div>

          {loadingAnnouncement ? (
            <p>Loading announcement...</p>
          ) : (
            <form onSubmit={handleSaveAnnouncement}>
              <label
                htmlFor="announcement-text"
                style={{ display: 'block', marginBottom: '8px' }}
              >
                Announcement Message *
              </label>

              <textarea
                id="announcement-text"
                value={announcementText}
                onChange={e => setAnnouncementText(e.target.value)}
                placeholder="Example: Free shipping on orders over $100"
                rows={3}
                maxLength={200}
                style={{
                  width: '100%',
                  marginBottom: '8px',
                  resize: 'vertical'
                }}
                required
              />

              <small>
                Maximum 200 characters.
              </small>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginTop: '18px',
                  cursor: 'pointer'
                }}
              >
                <input
                  type="checkbox"
                  checked={announcementEnabled}
                  onChange={e => setAnnouncementEnabled(e.target.checked)}
                />
                Show announcement on website
              </label>

              <div
                style={{
                  display: 'flex',
                  gap: '12px',
                  flexWrap: 'wrap',
                  marginTop: '18px'
                }}
              >
                <button
                  type="submit"
                  className="button"
                  disabled={savingAnnouncement || loadingAnnouncement}
                >
                  {savingAnnouncement ? 'Saving...' : 'Save Announcement'}
                </button>

                <button
                  type="button"
                  onClick={loadAnnouncement}
                  disabled={savingAnnouncement || loadingAnnouncement}
                >
                  Refresh
                </button>
              </div>
            </form>
          )}
        </section>

        {/* =========================
            Hero Images Management
        ========================== */}
        <section data-admin-section="hero"
          style={{
            marginBottom: '50px',
            padding: '28px',
            border: '1px solid #e5e5e5',
            borderRadius: '12px'
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: '20px',
              flexWrap: 'wrap',
              marginBottom: '24px'
            }}
          >
            <div>
              <span className="eyebrow">Website Content</span>
              <h2>Hero Media</h2>
              <p>
                Change the homepage hero image or video using a URL.
                The existing hero text and button remain unchanged.
              </p>
            </div>

            <div
              style={{
                padding: '8px 12px',
                borderRadius: '999px',
                background: '#f5f5f5',
                color: '#555',
                fontSize: '13px',
                fontWeight: 600
              }}
            >
              {heroSlides.length} slide{heroSlides.length === 1 ? '' : 's'}
            </div>
          </div>

          {loadingHeroSlides ? (
            <p>Loading hero media...</p>
          ) : (
            <>
              {heroSlides.length > 0 && (
                <div
                  style={{
                    display: 'grid',
                    gap: '16px'
                  }}
                >
                  {heroSlides.map((slide, index) => (
                    <div
                      key={`hero-slide-${index}`}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '140px 1fr auto',
                        gap: '18px',
                        alignItems: 'start',
                        padding: '16px',
                        border: '1px solid #e5e5e5',
                        borderRadius: '10px'
                      }}
                    >
                      <div
                        style={{
                          width: '140px',
                          height: '90px',
                          borderRadius: '7px',
                          overflow: 'hidden',
                          background: '#f5f5f5'
                        }}
                      >
                        {slide.image ? (
                          slide.mediaType === 'video' ? (
                            <video
                              src={slide.image}
                              muted
                              autoPlay
                              loop
                              playsInline
                              controls
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                              }}
                            />
                          ) : (
                            <img
                              src={slide.image}
                              alt={slide.alt || `Hero slide ${index + 1}`}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                              }}
                            />
                          )
                        ) : (
                          <div
                            style={{
                              width: '100%',
                              height: '100%',
                              display: 'grid',
                              placeItems: 'center',
                              fontSize: '11px',
                              color: '#777'
                            }}
                          >
                            Media preview
                          </div>
                        )}
                      </div>

                      <div
                        style={{
                          display: 'grid',
                          gap: '9px'
                        }}
                      >
                        <strong>Slide {index + 1}</strong>

                        <input
                          value={slide.image}
                          onChange={e =>
                            updateHeroSlide(
                              index,
                              'image',
                              e.target.value
                            )
                          }
                          placeholder="Hero image or video URL"
                        />

                        <input
                          value={slide.alt}
                          onChange={e =>
                            updateHeroSlide(
                              index,
                              'alt',
                              e.target.value
                            )
                          }
                          placeholder="Image alt text (for images)"
                        />

                        <label
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={slide.enabled}
                            onChange={e =>
                              updateHeroSlide(
                                index,
                                'enabled',
                                e.target.checked
                              )
                            }
                          />
                          Active on website
                        </label>
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '7px'
                        }}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            moveHeroSlide(index, -1)
                          }
                          disabled={index === 0}
                          title="Move slide up"
                        >
                          ↑
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            moveHeroSlide(index, 1)
                          }
                          disabled={
                            index === heroSlides.length - 1
                          }
                          title="Move slide down"
                        >
                          ↓
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            removeHeroSlide(index)
                          }
                          title="Remove slide"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {heroSlides.length === 0 && (
                <div
                  style={{
                    padding: '30px 20px',
                    textAlign: 'center',
                    border: '1px dashed #d9d3ca',
                    borderRadius: '10px',
                    marginBottom: '15px'
                  }}
                >
                  <p style={{ marginTop: 0 }}>
                    No hero media configured yet.
                  </p>
                </div>
              )}

              <small
                style={{
                  display: 'block',
                  marginTop: '14px',
                  color: '#777'
                }}
              >
                The homepage hero text and “Explore the collection”
                button remain unchanged. Only the hero image/video media are
                managed here.
              </small>

              <div
                style={{
                  display: 'flex',
                  gap: '12px',
                  flexWrap: 'wrap',
                  marginTop: '18px'
                }}
              >
                <button
                  type="button"
                  onClick={addHeroSlide}
                  disabled={savingHeroSlides}
                >
                  + Add Hero Media
                </button>

                <button
                  type="button"
                  className="button"
                  onClick={handleSaveHeroSlides}
                  disabled={
                    savingHeroSlides ||
                    loadingHeroSlides
                  }
                >
                  {savingHeroSlides
                    ? 'Saving...'
                    : 'Save Hero Media'}
                </button>

                <button
                  type="button"
                  onClick={loadHeroSlides}
                  disabled={
                    savingHeroSlides ||
                    loadingHeroSlides
                  }
                >
                  Refresh
                </button>
              </div>
            </>
          )}
        </section>

        {/* =========================
            Brand Story + Homepage Collection Image Management
        ========================== */}
        <section data-admin-section="section-images" style={{ marginBottom: '50px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap', marginBottom: '22px' }}>
            <div>
              <span className="eyebrow">HOMEPAGE CONTENT</span>
              <h2 style={{ margin: '8px 0' }}>Brand Story & Explore Collections</h2>
              <p style={{ margin: 0, maxWidth: '680px' }}>Manage the four homepage collection cards. Add a publicly accessible image URL for each collection and save to update the storefront.</p>
            </div>
            <button type="button" onClick={loadSectionImages} disabled={loadingSectionImages}>
              <FiRefreshCw size={13} style={{ marginRight: 7 }} />
              {loadingSectionImages ? 'Refreshing…' : 'Refresh'}
            </button>
          </div>

          <form onSubmit={handleSaveSectionImages}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '18px' }}>
              <div style={{ border: '1px solid #e9dfd2', borderRadius: '14px', padding: '16px', minWidth: 0 }}>
                <label htmlFor="brandStoryImageUrl" style={{ display: 'block', marginBottom: '9px' }}>Brand Story image URL</label>
                <input
                  id="brandStoryImageUrl"
                  type="url"
                  value={sectionImages.brandStory}
                  onChange={e => handleSectionImageChange('brandStory', e.target.value)}
                  placeholder="https://example.com/brand-story.jpg"
                  style={{ width: '100%', marginBottom: '12px' }}
                />
                <div style={{ aspectRatio: '4 / 3', overflow: 'hidden', borderRadius: '10px', background: 'linear-gradient(110deg,#eee5d9 8%,#f8f4ed 18%,#eee5d9 33%)', backgroundSize: '200% 100%' }}>
                  {sectionImages.brandStory
                    ? <img src={sectionImages.brandStory} alt="Brand Story preview" onError={e => { e.currentTarget.style.visibility = 'hidden' }} onLoad={e => { e.currentTarget.style.visibility = 'visible' }} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ height: '100%', display: 'grid', placeItems: 'center', color: '#92704b', fontFamily: 'Playfair Display,serif', letterSpacing: '0.12em' }}>WOODISTRY</div>}
                </div>
                <small style={{ display: 'block', marginTop: '8px' }}>Leave blank to use the storefront fallback image.</small>
              </div>

              {['New Arrivals', 'Dining & Serving', 'Kitchen Essentials', 'Storage & Containers'].map(spaceName => (
                <div key={spaceName} style={{ border: '1px solid #e9dfd2', borderRadius: '14px', padding: '16px', minWidth: 0 }}>
                  <label htmlFor={`spaceImage-${spaceName}`} style={{ display: 'block', marginBottom: '9px' }}>{spaceName} image URL</label>
                  <input
                    id={`spaceImage-${spaceName}`}
                    type="url"
                    value={sectionImages.spaces[spaceName] || ''}
                    onChange={e => handleSectionImageChange('space', e.target.value, spaceName)}
                    placeholder="https://example.com/collection-image.jpg"
                    style={{ width: '100%', marginBottom: '12px' }}
                  />
                  <div style={{ aspectRatio: '4 / 3', overflow: 'hidden', borderRadius: '10px', background: 'linear-gradient(110deg,#eee5d9 8%,#f8f4ed 18%,#eee5d9 33%)', backgroundSize: '200% 100%' }}>
                    {sectionImages.spaces[spaceName]
                      ? <img src={sectionImages.spaces[spaceName]} alt={`${spaceName} preview`} onError={e => { e.currentTarget.style.visibility = 'hidden' }} onLoad={e => { e.currentTarget.style.visibility = 'visible' }} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ height: '100%', display: 'grid', placeItems: 'center', color: '#92704b', fontFamily: 'Playfair Display,serif', letterSpacing: '0.12em' }}>WOODISTRY</div>}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', flexWrap: 'wrap', marginTop: '22px' }}>
              <button type="button" onClick={() => setSectionImages(defaultSectionImages)}>Clear custom URLs</button>
              <button type="submit" className="button" disabled={savingSectionImages}>
                {savingSectionImages ? 'Saving images…' : 'Save section images'}
              </button>
            </div>
          </form>
        </section>

        {/* =========================
            Blog Management
        ========================== */}
        <section data-admin-section="blog"
          style={{
            marginBottom: '50px',
            padding: '28px',
            border: '1px solid #e5e5e5',
            borderRadius: '12px'
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: '20px',
              flexWrap: 'wrap',
              marginBottom: '24px'
            }}
          >
            <div>
              <span className="eyebrow">Website Content</span>
              <h2>Blog Management</h2>
              <p>
                Publish stories, styling ideas and care guides for the XAAJ website.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="button"
                onClick={handleAddBlog}
              >
                + Add New Blog
              </button>
              <button
                type="button"
                onClick={loadBlogs}
                disabled={loadingBlogs || savingBlog}
              >
                {loadingBlogs ? 'Loading...' : 'Refresh'}
              </button>
            </div>
          </div>

          {showBlogForm && (
            <form
              onSubmit={handleSaveBlog}
              style={{
                padding: '22px',
                marginBottom: '28px',
                border: '1px solid #e5e5e5',
                borderRadius: '10px',
                background: '#faf9f6'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '15px',
                  marginBottom: '22px',
                  flexWrap: 'wrap'
                }}
              >
                <div>
                  <span className="eyebrow">Blog Editor</span>
                  <h3 style={{ margin: '5px 0 0' }}>
                    {editingBlogId ? 'Edit Blog' : 'Add New Blog'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={handleCancelBlog}
                  disabled={savingBlog}
                >
                  Cancel
                </button>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                  gap: '16px'
                }}
              >
                <div>
                  <label htmlFor="blog-title">Title *</label>
                  <input
                    id="blog-title"
                    name="title"
                    value={blogForm.title}
                    onChange={handleBlogTitleChange}
                    placeholder="5 Ways to Style Your Dining Table"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="blog-slug">Slug *</label>
                  <input
                    id="blog-slug"
                    name="slug"
                    value={blogForm.slug}
                    onChange={handleBlogChange}
                    placeholder="5-ways-to-style-your-dining-table"
                    required
                  />
                  <small>Used in the blog URL.</small>
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label htmlFor="blog-cover-image">Cover Image URL *</label>
                  <input
                    id="blog-cover-image"
                    name="coverImage"
                    value={blogForm.coverImage}
                    onChange={handleBlogChange}
                    placeholder="https://..."
                    required
                  />
                  {blogForm.coverImage && (
                    <img
                      src={blogForm.coverImage}
                      alt="Blog cover preview"
                      style={{
                        display: 'block',
                        width: '220px',
                        height: '130px',
                        objectFit: 'cover',
                        marginTop: '12px',
                        borderRadius: '8px'
                      }}
                    />
                  )}
                  <small>
                    Use a high-quality landscape image URL. Image upload can be connected to the existing media service next.
                  </small>
                </div>

                <div>
                  <label htmlFor="blog-category">Category *</label>
                  <select
                    id="blog-category"
                    name="category"
                    value={blogForm.category}
                    onChange={handleBlogChange}
                    required
                  >
                    <option>Table Styling</option>
                    <option>Crockery Care</option>
                    <option>Home Decor</option>
                    <option>Dining</option>
                    <option>Entertaining</option>
                    <option>Lifestyle</option>
                    <option>XAAJ Stories</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="blog-author">Author *</label>
                  <input
                    id="blog-author"
                    name="author"
                    value={blogForm.author}
                    onChange={handleBlogChange}
                    placeholder="XAAJ Editorial"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="blog-date">Publish Date *</label>
                  <input
                    id="blog-date"
                    type="date"
                    name="publishDate"
                    value={blogForm.publishDate}
                    onChange={handleBlogChange}
                    required
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      cursor: 'pointer',
                      marginTop: '28px'
                    }}
                  >
                    <input
                      type="checkbox"
                      name="isPublished"
                      checked={blogForm.isPublished}
                      onChange={handleBlogChange}
                    />
                    Published on website
                  </label>
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label htmlFor="blog-excerpt">Short Excerpt *</label>
                  <textarea
                    id="blog-excerpt"
                    name="excerpt"
                    value={blogForm.excerpt}
                    onChange={handleBlogChange}
                    placeholder="A short introduction that appears on the blog card..."
                    rows={3}
                    maxLength={320}
                    required
                  />
                  <small>Keep this concise for the homepage card.</small>
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label htmlFor="blog-content">Full Article / Content *</label>
                  <textarea
                    id="blog-content"
                    name="content"
                    value={blogForm.content}
                    onChange={handleBlogChange}
                    placeholder="Write the complete article here..."
                    rows={14}
                    required
                  />
                  <small>
                    For now this accepts plain text. Rich-text formatting can be added without changing the blog data structure.
                  </small>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: '12px',
                  flexWrap: 'wrap',
                  marginTop: '20px'
                }}
              >
                <button
                  type="submit"
                  className="button"
                  disabled={savingBlog}
                >
                  {savingBlog
                    ? 'Saving...'
                    : editingBlogId
                      ? 'Update Blog'
                      : 'Save Blog'}
                </button>

                <button
                  type="button"
                  onClick={() => setPreviewBlog(blogForm)}
                  disabled={!blogForm.title || !blogForm.content}
                >
                  Preview
                </button>

                <button
                  type="button"
                  onClick={handleCancelBlog}
                  disabled={savingBlog}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {loadingBlogs ? (
            <p>Loading blogs...</p>
          ) : blogs.length === 0 ? (
            <div
              style={{
                padding: '40px 20px',
                textAlign: 'center',
                border: '1px dashed #d9d3ca',
                borderRadius: '10px'
              }}
            >
              <h3>No blogs yet</h3>
              <p>Create your first blog and publish it to the website.</p>
              <button
                type="button"
                className="button"
                onClick={handleAddBlog}
              >
                + Add New Blog
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '14px' }}>
              {blogs.map(blog => {
                const published = Boolean(blog.isPublished ?? blog.published)

                return (
                  <article
                    key={blog._id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '150px 1fr auto',
                      gap: '18px',
                      alignItems: 'center',
                      padding: '16px',
                      border: '1px solid #e5e5e5',
                      borderRadius: '10px'
                    }}
                  >
                    <div
                      style={{
                        width: '150px',
                        height: '100px',
                        overflow: 'hidden',
                        borderRadius: '8px',
                        background: '#f5f5f5'
                      }}
                    >
                      {blog.coverImage ? (
                        <img
                          src={blog.coverImage}
                          alt={blog.title || 'Blog'}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            height: '100%',
                            display: 'grid',
                            placeItems: 'center',
                            fontSize: '12px'
                          }}
                        >
                          No image
                        </div>
                      )}
                    </div>

                    <div>
                      <div
                        style={{
                          display: 'flex',
                          gap: '10px',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          marginBottom: '6px'
                        }}
                      >
                        <span className="eyebrow">
                          {blog.category || 'XAAJ Stories'}
                        </span>
                        <span
                          style={{
                            padding: '5px 9px',
                            borderRadius: '999px',
                            background: published ? '#edf7ed' : '#f5f5f5',
                            color: published ? '#246b2a' : '#666',
                            fontSize: '12px',
                            fontWeight: 600
                          }}
                        >
                          {published ? 'Published' : 'Draft'}
                        </span>
                      </div>

                      <h3 style={{ margin: '0 0 6px' }}>
                        {blog.title}
                      </h3>

                      <p style={{ margin: '0 0 7px' }}>
                        {blog.excerpt || 'No excerpt added.'}
                      </p>

                      <small>
                        By {blog.author || 'XAAJ Editorial'} · {formatBlogDate(blog.publishDate)}
                      </small>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        gap: '8px',
                        flexWrap: 'wrap',
                        justifyContent: 'flex-end'
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => handlePreviewBlog(blog)}
                      >
                        Preview
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEditBlog(blog)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleBlog(blog)}
                      >
                        {published ? 'Unpublish' : 'Publish'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteBlog(blog)}
                      >
                        Delete
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          )}

          {previewBlog && (
            <div
              role="dialog"
              aria-modal="true"
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 1200,
                background: 'rgba(0,0,0,.5)',
                padding: '24px',
                overflowY: 'auto'
              }}
              onClick={() => setPreviewBlog(null)}
            >
              <article
                style={{
                  maxWidth: '900px',
                  margin: '30px auto',
                  background: '#fff',
                  padding: '32px',
                  borderRadius: '14px'
                }}
                onClick={e => e.stopPropagation()}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '15px',
                    alignItems: 'flex-start',
                    marginBottom: '22px'
                  }}
                >
                  <div>
                    <span className="eyebrow">
                      {previewBlog.category || 'XAAJ Stories'}
                    </span>
                    <h2 style={{ margin: '7px 0' }}>
                      {previewBlog.title}
                    </h2>
                    <small>
                      By {previewBlog.author || 'XAAJ Editorial'} · {formatBlogDate(previewBlog.publishDate)}
                    </small>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPreviewBlog(null)}
                  >
                    Close
                  </button>
                </div>

                {previewBlog.coverImage && (
                  <img
                    src={previewBlog.coverImage}
                    alt={previewBlog.title || 'Blog cover'}
                    style={{
                      width: '100%',
                      maxHeight: '480px',
                      objectFit: 'cover',
                      borderRadius: '10px',
                      marginBottom: '24px'
                    }}
                  />
                )}

                {previewBlog.excerpt && (
                  <p style={{ fontSize: '18px', lineHeight: 1.6 }}>
                    {previewBlog.excerpt}
                  </p>
                )}

                <div
                  style={{
                    whiteSpace: 'pre-wrap',
                    lineHeight: 1.8
                  }}
                >
                  {previewBlog.content}
                </div>
              </article>
            </div>
          )}
        </section>

        {/* =========================
            Add / Edit Product Form — Woodistry Premium
        ========================== */}
        {showForm && (
          <section className="woodistry-product-form-panel">
            <style>{`
              .woodistry-product-form-panel{padding:0!important;overflow:hidden;margin-bottom:34px!important;border:1px solid #e4d7c7!important;border-radius:22px!important;background:#fbf8f2!important;box-shadow:0 22px 58px rgba(58,39,22,.09)!important}
              .woodistry-product-form-panel *{box-sizing:border-box}
              .woodistry-product-form-header{display:flex;justify-content:space-between;align-items:center;gap:20px;padding:28px 32px;background:linear-gradient(115deg,#302116 0%,#4a3321 58%,#60462d 100%);color:#fff8ef;position:relative;overflow:hidden}
              .woodistry-product-form-header:after{content:'';position:absolute;width:260px;height:260px;border:1px solid rgba(238,211,173,.16);border-radius:50%;right:-68px;top:-160px;box-shadow:0 0 0 32px rgba(238,211,173,.035),0 0 0 66px rgba(238,211,173,.025);pointer-events:none}
              .woodistry-product-form-header-copy{position:relative;z-index:1;min-width:0}
              .woodistry-product-form-eyebrow{display:flex;align-items:center;gap:9px;color:#d2b18a;font:700 10px/1.4 'DM Sans',sans-serif;letter-spacing:.2em;text-transform:uppercase}
              .woodistry-product-form-eyebrow:before{content:'';height:1px;width:26px;background:#c7a277}
              .woodistry-product-form-header h2{margin:9px 0 5px!important;color:#fff8ef!important;font:500 clamp(26px,3vw,35px)/1.12 'Playfair Display',Georgia,serif!important;letter-spacing:-.035em!important}
              .woodistry-product-form-header p{margin:0!important;color:#d9c9b6!important;font:400 12px/1.65 'DM Sans',sans-serif!important}
              .woodistry-product-form-header-actions{position:relative;z-index:1;display:flex;align-items:center;gap:10px;flex-shrink:0}
              .woodistry-product-form-status{display:inline-flex;align-items:center;gap:7px;padding:8px 11px;border:1px solid rgba(236,212,181,.24);border-radius:999px;color:#ead9c3;background:rgba(255,255,255,.06);font:600 10px 'DM Sans',sans-serif;letter-spacing:.05em;white-space:nowrap}
              .woodistry-product-form-status:before{content:'';width:6px;height:6px;background:#d8b58a;border-radius:50%}
              .woodistry-product-form-header .woodistry-form-cancel{padding:10px 14px!important;border:1px solid rgba(239,220,196,.35)!important;border-radius:9px!important;background:transparent!important;color:#fff8ef!important;box-shadow:none!important}
              .woodistry-product-form-header .woodistry-form-cancel:hover{background:rgba(255,255,255,.1)!important;border-color:#d6b48c!important;color:#fff!important;transform:none!important}
              .woodistry-product-form{display:flex!important;flex-direction:column;gap:17px!important;padding:24px 28px 28px!important;margin:0!important;max-width:none!important}
              .woodistry-form-card{min-width:0;padding:22px 23px;border:1px solid #e9e0d5;border-radius:15px;background:rgba(255,254,251,.93);box-shadow:0 5px 18px rgba(57,39,22,.025)}
              .woodistry-form-card-heading{display:flex;align-items:flex-start;gap:13px;margin:0 0 19px;padding:0 0 15px;border-bottom:1px solid #eee6dc}
              .woodistry-form-step{display:grid;place-items:center;flex:0 0 32px;width:32px;height:32px;border-radius:9px;background:#f0e7da;color:#80613e;font:700 11px 'DM Sans',sans-serif;letter-spacing:.04em}
              .woodistry-form-card-heading h3{margin:0!important;font:500 20px/1.2 'Playfair Display',Georgia,serif!important;letter-spacing:-.02em!important;color:#302317!important}
              .woodistry-form-card-heading p{margin:5px 0 0!important;color:#8b7c6c!important;font:400 12px/1.55 'DM Sans',sans-serif!important}
              .woodistry-form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:17px 18px;align-items:start;min-width:0}
              .woodistry-field{display:flex;flex-direction:column;gap:8px;min-width:0}
              .woodistry-field label{display:flex;align-items:center;gap:5px;margin:0!important;color:#514438!important;font:700 11px/1.4 'DM Sans',sans-serif!important;letter-spacing:.035em}
              .woodistry-field label span{color:#a1978a;font-weight:400;letter-spacing:0}
              .woodistry-field input:not([type=checkbox]),.woodistry-field select,.woodistry-field textarea{display:block;width:100%;min-width:0;min-height:46px;padding:12px 13px!important;border:1px solid #e1d7ca!important;border-radius:9px!important;background:#fffdfa!important;color:#322920!important;font:400 13px/1.5 'DM Sans',sans-serif!important;box-shadow:0 1px 2px rgba(45,31,19,.025)!important;transition:border-color .2s ease,box-shadow .2s ease,background .2s ease!important}
              .woodistry-field textarea{min-height:132px;resize:vertical}
              .woodistry-field input::placeholder,.woodistry-field textarea::placeholder{color:#b0a497}
              .woodistry-field input:focus,.woodistry-field select:focus,.woodistry-field textarea:focus{outline:none!important;border-color:#a98965!important;background:#fff!important;box-shadow:0 0 0 3px rgba(158,121,79,.12)!important}
              .woodistry-field small,.woodistry-field-hint{display:block;color:#918477!important;font:400 11px/1.6 'DM Sans',sans-serif!important}
              .woodistry-form-span-2{grid-column:1/-1}
              .woodistry-subcategory-box{padding:17px;border:1px solid #e7dccf;border-radius:12px;background:#f8f3eb;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;align-items:start}
              .woodistry-subcategory-note{grid-column:1/-1;margin:0;color:#8c7d6d;font:400 11px/1.6 'DM Sans',sans-serif}
              .woodistry-pricing-card{background:linear-gradient(145deg,#f8f3eb,#f3ece1);border-color:#e5d8c7}
              .woodistry-pricing-card .woodistry-form-card-heading{border-bottom-color:#e3d5c3}
              .woodistry-price-field{position:relative}
              .woodistry-price-field .woodistry-price-symbol{position:absolute;left:13px;top:14px;color:#9c876f;font:600 13px 'DM Sans',sans-serif;pointer-events:none}
              .woodistry-price-field input{padding-left:29px!important}
              .woodistry-selling-price input{background:#eee5d8!important;border-color:#ddcbb5!important;color:#4a3420!important;font-weight:700!important}
              .woodistry-discount-toggle{display:flex;align-items:center;gap:10px;padding:13px 14px;border:1px solid #e2d6c6;border-radius:10px;background:rgba(255,253,249,.8);min-height:46px}
              .woodistry-discount-toggle input[type=checkbox]{width:16px;height:16px;margin:0;accent-color:#62452b;flex-shrink:0}
              .woodistry-discount-toggle label{cursor:pointer;margin:0!important;color:#584938!important;font:600 11px/1.5 'DM Sans',sans-serif!important}
              .woodistry-customer-preview{grid-column:1/-1;display:flex;justify-content:space-between;align-items:center;gap:18px;padding:17px 19px;border:1px solid #e5d4bd;border-radius:12px;background:#fffdfa;box-shadow:0 6px 18px rgba(67,43,22,.045)}
              .woodistry-customer-preview-label{margin-bottom:5px;color:#897764;font:700 9px/1.4 'DM Sans',sans-serif;letter-spacing:.16em;text-transform:uppercase}
              .woodistry-customer-preview-title{color:#352719;font:500 17px/1.25 'Playfair Display',Georgia,serif}
              .woodistry-customer-prices{display:flex;justify-content:flex-end;align-items:baseline;gap:9px;flex-wrap:wrap;text-align:right}
              .woodistry-customer-prices strong{color:#342519;font:700 21px/1.2 'DM Sans',sans-serif;letter-spacing:-.035em}
              .woodistry-customer-prices del{color:#9c9082;font:400 12px 'DM Sans',sans-serif}
              .woodistry-discount-badge{display:inline-flex;align-items:center;padding:5px 8px;border-radius:5px;background:#e9ddcc;color:#6e4825;font:700 9px 'DM Sans',sans-serif;letter-spacing:.04em}
              .woodistry-product-image-row{display:grid;grid-template-columns:38px minmax(0,1fr) auto;align-items:center;gap:10px;margin-bottom:10px;padding:9px;border:1px solid #eee5da;border-radius:11px;background:#fffdfa}
              .woodistry-product-image-index{display:grid;place-items:center;width:30px;height:30px;border-radius:7px;background:#f1e8dc;color:#876746;font:700 10px 'DM Sans',sans-serif}
              .woodistry-product-image-row input{width:100%;min-width:0}
              .woodistry-product-image-preview{display:block;width:44px;height:44px;object-fit:cover;border-radius:7px;border:1px solid #e6dacb;background:#f4eee5}
              .woodistry-product-image-placeholder{display:grid;place-items:center;width:44px;height:44px;border:1px dashed #d9cbbb;border-radius:7px;color:#a08b72;font:500 8px 'DM Sans',sans-serif;text-align:center}
              .woodistry-add-image{display:inline-flex!important;align-items:center!important;gap:8px!important;margin-top:3px!important;padding:10px 13px!important;border:1px solid #d7c5ae!important;border-radius:8px!important;background:#f6efe5!important;color:#65472b!important;font:700 11px 'DM Sans',sans-serif!important;box-shadow:none!important}
              .woodistry-add-image:hover{background:#eee2d2!important;border-color:#b99b79!important;transform:translateY(-1px)!important}
              .woodistry-product-form-footer{position:sticky;bottom:0;z-index:5;display:flex;justify-content:space-between;align-items:center;gap:16px;padding:17px 21px;margin:0 -28px -28px;border-top:1px solid #e7dccf;background:rgba(251,248,242,.96);backdrop-filter:blur(12px)}
              .woodistry-product-form-footer-note{color:#928270;font:400 11px/1.5 'DM Sans',sans-serif}
              .woodistry-product-form-footer-actions{display:flex;align-items:center;justify-content:flex-end;gap:10px}
              .woodistry-product-form-footer .woodistry-save-product{display:inline-flex!important;justify-content:center!important;align-items:center!important;gap:9px!important;min-height:44px!important;padding:12px 19px!important;border:1px solid #49301d!important;border-radius:9px!important;background:#49301d!important;color:#fff8ef!important;font:700 11px 'DM Sans',sans-serif!important;letter-spacing:.04em!important;box-shadow:0 8px 18px rgba(73,48,29,.16)!important}
              .woodistry-product-form-footer .woodistry-save-product:hover:not(:disabled){background:#694a2d!important;border-color:#694a2d!important;color:#fff!important;transform:translateY(-1px)!important}
              .woodistry-product-form-footer .woodistry-cancel-product{min-height:44px!important;padding:11px 16px!important;border:1px solid #dfd3c4!important;border-radius:9px!important;background:transparent!important;color:#6e5d4b!important;font:700 11px 'DM Sans',sans-serif!important;box-shadow:none!important}
              .woodistry-product-form-footer .woodistry-cancel-product:hover:not(:disabled){background:#f0e7da!important;color:#49301d!important;transform:none!important}
              @media(max-width:760px){.woodistry-product-form-header{padding:23px 20px;align-items:flex-start}.woodistry-product-form-header-actions{flex-direction:column;align-items:flex-end}.woodistry-product-form-status{font-size:9px}.woodistry-product-form{padding:17px 14px 22px!important;gap:13px!important}.woodistry-form-card{padding:17px 15px}.woodistry-form-grid{grid-template-columns:1fr;gap:14px}.woodistry-form-span-2,.woodistry-customer-preview{grid-column:1}.woodistry-subcategory-box{grid-template-columns:1fr}.woodistry-subcategory-note{grid-column:1}.woodistry-customer-preview{align-items:flex-start;flex-direction:column}.woodistry-customer-prices{justify-content:flex-start;text-align:left}.woodistry-product-form-footer{margin:0 -14px -22px;padding:14px;align-items:flex-start;flex-direction:column}.woodistry-product-form-footer-actions{width:100%}.woodistry-product-form-footer-actions button{flex:1}.woodistry-product-form-footer-note{display:none}}
              @media(max-width:420px){.woodistry-product-form-header{gap:10px}.woodistry-product-form-header p{max-width:230px}.woodistry-product-form-status{display:none}.woodistry-product-form-image-row{grid-template-columns:30px minmax(0,1fr) 36px}.woodistry-product-image-preview,.woodistry-product-image-placeholder{width:36px;height:36px}.woodistry-product-form-footer-actions{gap:7px}}
              @media(prefers-reduced-motion:reduce){.woodistry-product-form-panel *{scroll-behavior:auto!important;transition:none!important}}
              /* Layout correction: isolate this form from legacy checkout/admin form rules. */
              .xaaj-admin-v2 .woodistry-product-form-panel{display:block!important;width:100%!important;max-width:none!important;min-width:0!important;grid-column:1 / -1!important;align-self:stretch!important;}
              .xaaj-admin-v2 .woodistry-product-form-panel > .woodistry-product-form-header{width:100%!important;}
              .xaaj-admin-v2 form.woodistry-product-form{display:flex!important;flex:1 1 auto!important;flex-direction:column!important;align-items:stretch!important;justify-content:flex-start!important;width:100%!important;max-width:none!important;min-width:0!important;}
              .xaaj-admin-v2 .woodistry-product-form > .woodistry-form-card{display:block!important;flex:0 0 auto!important;align-self:stretch!important;width:100%!important;max-width:none!important;min-width:0!important;}
              .xaaj-admin-v2 .woodistry-product-form .woodistry-form-grid{display:grid!important;width:100%!important;max-width:none!important;min-width:0!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;align-items:start!important;gap:18px 20px!important;}
              .xaaj-admin-v2 .woodistry-product-form .woodistry-field{display:flex!important;flex-direction:column!important;align-items:stretch!important;justify-content:flex-start!important;gap:8px!important;width:100%!important;max-width:none!important;min-width:0!important;}
              .xaaj-admin-v2 .woodistry-product-form .woodistry-field label{display:flex!important;width:100%!important;max-width:none!important;white-space:normal!important;}
              .xaaj-admin-v2 .woodistry-product-form .woodistry-field input:not([type=checkbox]),.xaaj-admin-v2 .woodistry-product-form .woodistry-field select,.xaaj-admin-v2 .woodistry-product-form .woodistry-field textarea{display:block!important;width:100%!important;max-width:none!important;min-width:0!important;}
              .xaaj-admin-v2 .woodistry-product-form .woodistry-form-span-2{grid-column:1 / -1!important;}
              .xaaj-admin-v2 .woodistry-product-form .woodistry-subcategory-box{display:grid!important;grid-column:1 / -1!important;grid-template-columns:minmax(0,1fr)!important;width:100%!important;max-width:none!important;min-width:0!important;}
              .xaaj-admin-v2 .woodistry-product-form .woodistry-subcategory-note{grid-column:1!important;width:100%!important;}
              .xaaj-admin-v2 .woodistry-product-form .woodistry-pricing-card .woodistry-form-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important;}
              .xaaj-admin-v2 .woodistry-product-form .woodistry-discount-toggle{display:flex!important;align-items:center!important;align-self:start!important;gap:10px!important;width:100%!important;min-width:0!important;}
              .xaaj-admin-v2 .woodistry-product-form .woodistry-discount-toggle label{display:block!important;min-width:0!important;line-height:1.5!important;}
              .xaaj-admin-v2 .woodistry-product-form .woodistry-customer-preview{display:flex!important;grid-column:1 / -1!important;width:100%!important;max-width:none!important;min-width:0!important;justify-content:space-between!important;align-items:center!important;gap:18px!important;}
              .xaaj-admin-v2 .woodistry-product-form .woodistry-customer-prices{display:flex!important;flex-wrap:wrap!important;align-items:baseline!important;gap:10px!important;max-width:100%!important;}
              .xaaj-admin-v2 .woodistry-product-form .woodistry-product-image-row{display:grid!important;grid-template-columns:38px minmax(0,1fr) auto!important;width:100%!important;max-width:none!important;min-width:0!important;}
              .xaaj-admin-v2 .woodistry-product-form .woodistry-product-image-row input{width:100%!important;min-width:0!important;}
              @media(max-width:760px){
                .xaaj-admin-v2 form.woodistry-product-form{padding:17px 14px 22px!important;gap:13px!important;}
                .xaaj-admin-v2 .woodistry-product-form .woodistry-form-card{padding:17px 15px!important;}
                .xaaj-admin-v2 .woodistry-product-form .woodistry-form-grid,.xaaj-admin-v2 .woodistry-product-form .woodistry-pricing-card .woodistry-form-grid{grid-template-columns:minmax(0,1fr)!important;gap:14px!important;}
                .xaaj-admin-v2 .woodistry-product-form .woodistry-form-span-2,.xaaj-admin-v2 .woodistry-product-form .woodistry-customer-preview,.xaaj-admin-v2 .woodistry-product-form .woodistry-subcategory-box{grid-column:1!important;}
                .xaaj-admin-v2 .woodistry-product-form .woodistry-subcategory-box{grid-template-columns:minmax(0,1fr)!important;}
                .xaaj-admin-v2 .woodistry-product-form .woodistry-subcategory-note{grid-column:1!important;}
                .xaaj-admin-v2 .woodistry-product-form .woodistry-customer-preview{align-items:flex-start!important;flex-direction:column!important;}
                .xaaj-admin-v2 .woodistry-product-form .woodistry-customer-prices{justify-content:flex-start!important;text-align:left!important;}
                .xaaj-admin-v2 .woodistry-product-form .woodistry-product-form-footer{margin:0 -14px -22px!important;padding:14px!important;align-items:flex-start!important;flex-direction:column!important;}
                .xaaj-admin-v2 .woodistry-product-form .woodistry-product-form-footer-actions{width:100%!important;}
                .xaaj-admin-v2 .woodistry-product-form .woodistry-product-form-footer-actions button{flex:1 1 0!important;}
              }
              @media(max-width:420px){
                .xaaj-admin-v2 .woodistry-product-form-header{gap:10px!important;align-items:flex-start!important;}
                .xaaj-admin-v2 .woodistry-product-form-header-actions{flex-direction:column!important;align-items:flex-end!important;}
                .xaaj-admin-v2 .woodistry-product-form .woodistry-product-image-row{grid-template-columns:30px minmax(0,1fr) 36px!important;gap:7px!important;}
                .xaaj-admin-v2 .woodistry-product-form .woodistry-product-image-preview,.xaaj-admin-v2 .woodistry-product-form .woodistry-product-image-placeholder{width:36px!important;height:36px!important;}
                .xaaj-admin-v2 .woodistry-product-form .woodistry-product-form-footer-actions{gap:7px!important;}
              }
              /* Higher-specificity admin overrides keep the product composer isolated from legacy section/form styles. */
              .xaaj-admin-v2 .woodistry-product-form-panel{padding:0!important;margin-bottom:34px!important;overflow:hidden!important;border:1px solid #e4d7c7!important;border-radius:22px!important;background:#fbf8f2!important;box-shadow:0 22px 58px rgba(58,39,22,.09)!important}
              .xaaj-admin-v2 form.woodistry-product-form{display:flex!important;flex-direction:column!important;gap:17px!important;padding:24px 28px 28px!important;margin:0!important;width:100%!important;max-width:none!important;background:transparent!important;border:0!important;box-shadow:none!important}
              .xaaj-admin-v2 .woodistry-product-form .woodistry-form-card{display:block!important;min-width:0!important;padding:22px 23px!important;margin:0!important;border:1px solid #e9e0d5!important;border-radius:15px!important;background:rgba(255,254,251,.97)!important;box-shadow:0 5px 18px rgba(57,39,22,.025)!important}
              .xaaj-admin-v2 .woodistry-product-form .woodistry-pricing-card{background:linear-gradient(145deg,#f8f3eb,#f3ece1)!important;border-color:#e5d8c7!important}
              .xaaj-admin-v2 .woodistry-product-form .woodistry-form-card-heading h3{font:500 20px/1.2 'Playfair Display',Georgia,serif!important;color:#302317!important;margin:0!important}
              .xaaj-admin-v2 .woodistry-product-form .woodistry-field input:not([type=checkbox]),.xaaj-admin-v2 .woodistry-product-form .woodistry-field select,.xaaj-admin-v2 .woodistry-product-form .woodistry-field textarea{width:100%!important;min-width:0!important;min-height:46px!important;padding:12px 13px!important;border:1px solid #e1d7ca!important;border-radius:9px!important;background:#fffdfa!important;color:#322920!important;font:400 13px/1.5 'DM Sans',sans-serif!important;box-shadow:0 1px 2px rgba(45,31,19,.025)!important}
              .xaaj-admin-v2 .woodistry-product-form .woodistry-field textarea{min-height:132px!important;resize:vertical!important}
              .xaaj-admin-v2 .woodistry-product-form .woodistry-field input:focus,.xaaj-admin-v2 .woodistry-product-form .woodistry-field select:focus,.xaaj-admin-v2 .woodistry-product-form .woodistry-field textarea:focus{outline:none!important;border-color:#a98965!important;background:#fff!important;box-shadow:0 0 0 3px rgba(158,121,79,.12)!important}
              .xaaj-admin-v2 .woodistry-product-form .woodistry-field label{display:flex!important;align-items:center!important;gap:5px!important;margin:0!important;color:#514438!important;font:700 11px/1.4 'DM Sans',sans-serif!important;letter-spacing:.035em!important}
              .xaaj-admin-v2 .woodistry-product-form .woodistry-form-card-heading{margin:0 0 19px!important;padding:0 0 15px!important;border-bottom:1px solid #eee6dc!important}
              .xaaj-admin-v2 .woodistry-product-form .woodistry-product-form-footer{margin:0 -28px -28px!important}
              @media(max-width:760px){.xaaj-admin-v2 form.woodistry-product-form{padding:17px 14px 22px!important;gap:13px!important}.xaaj-admin-v2 .woodistry-product-form .woodistry-form-card{padding:17px 15px!important}.xaaj-admin-v2 .woodistry-product-form .woodistry-form-grid{grid-template-columns:minmax(0,1fr)!important}.xaaj-admin-v2 .woodistry-product-form .woodistry-form-span-2,.xaaj-admin-v2 .woodistry-product-form .woodistry-customer-preview{grid-column:1!important}.xaaj-admin-v2 .woodistry-product-form .woodistry-subcategory-box{grid-template-columns:minmax(0,1fr)!important}.xaaj-admin-v2 .woodistry-product-form .woodistry-subcategory-note{grid-column:1!important}.xaaj-admin-v2 .woodistry-product-form .woodistry-product-form-footer{margin:0 -14px -22px!important;padding:14px!important}}
            `}</style>

            <div className="woodistry-product-form-header">
              <div className="woodistry-product-form-header-copy">
                <span className="woodistry-product-form-eyebrow">Product workspace</span>
                <h2>{editingId ? 'Edit Product' : 'Add a Product'}</h2>
                <p>Manage product details, pricing and fulfilment for the Woodistry store.</p>
              </div>
              <div className="woodistry-product-form-header-actions">
                <span className="woodistry-product-form-status">{editingId ? 'Editing existing item' : 'New product draft'}</span>
                <button type="button" className="woodistry-form-cancel" onClick={handleCancel}>Close</button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="woodistry-product-form">
              <section className="woodistry-form-card">
                <div className="woodistry-form-card-heading">
                  <span className="woodistry-form-step">01</span>
                  <div><h3>Product information</h3><p>Start with a clear name and customer-friendly description.</p></div>
                </div>
                <div className="woodistry-form-grid">
                  <div className="woodistry-field">
                    <label htmlFor="product-name">Product name *</label>
                    <input id="product-name" name="name" value={form.name} onChange={handleChange} placeholder="Example: Indigo Lace Pasta Plate" required />
                  </div>
                  <div className="woodistry-field">
                    <label htmlFor="product-slug">Product slug *</label>
                    <input id="product-slug" name="slug" value={form.slug} onChange={handleChange} placeholder="indigo-lace-pasta-plate" required />
                    <small>Used in the product page URL.</small>
                  </div>
                  <div className="woodistry-field woodistry-form-span-2">
                    <label htmlFor="product-description">Product description *</label>
                    <textarea id="product-description" name="description" value={form.description} onChange={handleChange} placeholder="Describe the product, its design and how it can be used..." rows={4} required />
                  </div>
                </div>
              </section>

              <section className="woodistry-form-card">
                <div className="woodistry-form-card-heading">
                  <span className="woodistry-form-step">02</span>
                  <div><h3>Category & product classification</h3><p>Organise this item so customers can find it in the right collection.</p></div>
                </div>
                <div className="woodistry-form-grid">
                  <div className="woodistry-field woodistry-form-span-2">
                    <label htmlFor="product-category">Category *</label>
                    <select id="product-category" name="category" value={form.category} onChange={handleChange} required>
                      <option value="">Select category</option>
                      {Object.keys(productCategoryMap).map(category => <option value={category} key={category}>{category}</option>)}
                      {form.category && !Object.prototype.hasOwnProperty.call(productCategoryMap, form.category) && <option value={form.category}>{form.category}</option>}
                    </select>
                  </div>
                  <div className="woodistry-subcategory-box woodistry-form-span-2">
                    <div className="woodistry-field">
                      <label htmlFor="product-subcategory">Subcategory <span>(Optional)</span></label>
                      <select id="product-subcategory" name="subcategory" value={form.subcategory} onChange={handleChange} disabled={!form.category || !productCategoryMap[form.category]}>
                        <option value="">Select subcategory</option>
                        {(productCategoryMap[form.category] || []).map(subcategory => <option value={subcategory} key={subcategory}>{subcategory}</option>)}
                        {form.subcategory && !(productCategoryMap[form.category] || []).includes(form.subcategory) && <option value={form.subcategory}>{form.subcategory}</option>}
                      </select>
                    </div>
                    <p className="woodistry-subcategory-note">{form.category ? `Choose a subcategory within ${form.category}.` : 'Choose a category first to see available subcategories.'}</p>
                  </div>
                  <div className="woodistry-field woodistry-form-span-2">
                    <label htmlFor="product-hsn-code">HSN code *</label>
                    <input id="product-hsn-code" name="hsnCode" value={form.hsnCode} onChange={handleChange} placeholder="Enter product HSN code" autoComplete="off" required />
                    <small>Use the HSN code applicable to this specific product.</small>
                  </div>
                </div>
              </section>

              <section className="woodistry-form-card woodistry-pricing-card">
                <div className="woodistry-form-card-heading">
                  <span className="woodistry-form-step">03</span>
                  <div><h3>Product pricing</h3><p>Set the original price and discount. The selling price is calculated automatically.</p></div>
                </div>
                <div className="woodistry-form-grid">
                  <div className="woodistry-field">
                    <label htmlFor="product-mrp">MRP *</label>
                    <div className="woodistry-price-field"><span className="woodistry-price-symbol">$</span><input id="product-mrp" name="mrp" value={form.mrp} onChange={handleChange} type="number" min="0" step="0.01" placeholder="149.00" required /></div>
                    <small>Original retail price in USD.</small>
                  </div>
                  <div className="woodistry-field">
                    <label htmlFor="product-discount">Discount (%)</label>
                    <input id="product-discount" name="discountPercent" value={form.discountPercent} onChange={handleChange} type="number" min="0" max="100" step="0.01" placeholder="0" />
                    <small>Enter 0 if the product is not discounted. Maximum 100%.</small>
                  </div>
                  <div className="woodistry-field woodistry-selling-price">
                    <label htmlFor="product-selling-price">Selling price · Auto-calculated</label>
                    <div className="woodistry-price-field"><span className="woodistry-price-symbol">$</span><input id="product-selling-price" value={form.price === '' ? '' : Number(form.price).toFixed(2)} type="text" readOnly aria-readonly="true" placeholder="Calculated automatically" /></div>
                    <small>Calculated from MRP minus the selected discount.</small>
                  </div>
                  <div className="woodistry-discount-toggle">
                    <input id="show-discount-percent" name="showDiscountPercent" type="checkbox" checked={Boolean(form.showDiscountPercent)} onChange={handleChange} />
                    <label htmlFor="show-discount-percent">Show discount percentage to customers</label>
                  </div>
                  <div className="woodistry-customer-preview">
                    <div><div className="woodistry-customer-preview-label">Storefront preview</div><div className="woodistry-customer-preview-title">Customer price display</div></div>
                    <div className="woodistry-customer-prices">
                      <strong>{formatUSD(calculateSellingPrice(form.mrp, form.discountPercent) === '' ? 0 : calculateSellingPrice(form.mrp, form.discountPercent))}</strong>
                      {Number(form.mrp) > Number(calculateSellingPrice(form.mrp, form.discountPercent)) && <del>{formatUSD(form.mrp)} MRP</del>}
                      {form.showDiscountPercent && Number(form.discountPercent) > 0 && <span className="woodistry-discount-badge">{Number(form.discountPercent)}% OFF</span>}
                    </div>
                  </div>
                </div>
              </section>

              <section className="woodistry-form-card">
                <div className="woodistry-form-card-heading">
                  <span className="woodistry-form-step">04</span>
                  <div><h3>Inventory & shipping</h3><p>Keep stock and parcel measurements ready for fulfilment.</p></div>
                </div>
                <div className="woodistry-form-grid">
                  <div className="woodistry-field">
                    <label htmlFor="product-stock">Available stock</label>
                    <input id="product-stock" name="stock" value={form.stock} onChange={handleChange} type="number" min="0" step="1" placeholder="20" />
                    <small>Enter the number of units available to sell.</small>
                  </div>
                  <div className="woodistry-field"><label>Shipping units</label><div style={{ minHeight: 46, display: 'flex', alignItems: 'center', padding: '0 13px', border: '1px solid #e5dbcf', borderRadius: 9, background: '#f6f0e7', color: '#87745e', fontSize: 12 }}>Weight in kg · Dimensions in cm</div></div>
                  <div className="woodistry-field"><label htmlFor="product-weight">Package weight (kg) *</label><input id="product-weight" type="number" name="weight" value={form.shipping.weight} onChange={handleShippingChange} placeholder="Example: 2.5" min="0.001" step="0.001" required /></div>
                  <div className="woodistry-field"><label htmlFor="product-length">Package length (cm) *</label><input id="product-length" type="number" name="length" value={form.shipping.length} onChange={handleShippingChange} placeholder="Example: 35" min="0.1" step="0.1" required /></div>
                  <div className="woodistry-field"><label htmlFor="product-breadth">Package breadth (cm) *</label><input id="product-breadth" type="number" name="breadth" value={form.shipping.breadth} onChange={handleShippingChange} placeholder="Example: 30" min="0.1" step="0.1" required /></div>
                  <div className="woodistry-field"><label htmlFor="product-height">Package height (cm) *</label><input id="product-height" type="number" name="height" value={form.shipping.height} onChange={handleShippingChange} placeholder="Example: 15" min="0.1" step="0.1" required /></div>
                </div>
              </section>

              <section className="woodistry-form-card">
                <div className="woodistry-form-card-heading">
                  <span className="woodistry-form-step">05</span>
                  <div><h3>Details, care & policies</h3><p>Add useful product information and after-sales details.</p></div>
                </div>
                <div className="woodistry-form-grid">
                  <div className="woodistry-field woodistry-form-span-2"><label htmlFor="product-details">Product details & care</label><textarea id="product-details" name="productDetails" value={form.productDetails} onChange={handleChange} placeholder="Material, size, dimensions, care instructions, what's included..." rows={4} /></div>
                  <div className="woodistry-field"><label htmlFor="product-shipping-payment">Shipping & payment</label><textarea id="product-shipping-payment" name="shippingPayment" value={form.shippingPayment} onChange={handleChange} placeholder="Delivery time, shipping charges, payment information..." rows={4} /></div>
                  <div className="woodistry-field"><label htmlFor="product-return-exchange">Returns & exchanges</label><textarea id="product-return-exchange" name="returnExchange" value={form.returnExchange} onChange={handleChange} placeholder="Return window, exchange conditions and process..." rows={4} /></div>
                </div>
              </section>

              <section className="woodistry-form-card">
                <div className="woodistry-form-card-heading">
                  <span className="woodistry-form-step">06</span>
                  <div><h3>Product imagery</h3><p>Use clear, high-quality images. The first image becomes the main product image.</p></div>
                </div>
                {form.images.map((image, index) => (
                  <div key={index} className="woodistry-product-image-row">
                    <span className="woodistry-product-image-index">{String(index + 1).padStart(2, '0')}</span>
                    <input aria-label={`Product image URL ${index + 1}`} value={image} onChange={e => handleImageChange(index, e.target.value)} placeholder={index === 0 ? 'Main product image URL *' : `Additional image URL ${index + 1}`} />
                    {image.trim() ? <img className="woodistry-product-image-preview" src={image.trim()} alt={`Product image ${index + 1} preview`} loading="lazy" onError={e => { e.currentTarget.style.visibility = 'hidden' }} /> : <span className="woodistry-product-image-placeholder">Preview</span>}
                    <button type="button" onClick={() => removeImageField(index)} disabled={form.images.length === 1} title="Remove image" aria-label={`Remove image ${index + 1}`}>Remove</button>
                  </div>
                ))}
                <button type="button" className="woodistry-add-image" onClick={addImageField}><FiPlus size={14} /> Add another image</button>
                <small className="woodistry-field-hint" style={{ marginTop: 10 }}>Add at least one working image URL. Use alternate angles and detail shots where available.</small>
              </section>

              <div className="woodistry-product-form-footer">
                <div className="woodistry-product-form-footer-note">Fields marked * are required before saving.</div>
                <div className="woodistry-product-form-footer-actions">
                  <button type="button" className="woodistry-cancel-product" onClick={handleCancel} disabled={saving}>Cancel</button>
                  <button type="submit" className="woodistry-save-product" disabled={saving}>{saving ? 'Saving product…' : editingId ? 'Save product changes' : 'Add product to store'} <FiPlus size={14} /></button>
                </div>
              </div>
            </form>
          </section>
        )}

        {/* =========================
            Order Management
        ========================== */}
        <section data-admin-section="orders" style={{ marginBottom: '50px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              gap: '20px',
              flexWrap: 'wrap'
            }}
          >
            <div>
              <span className="eyebrow">Sales</span>
              <h2>Customer Orders</h2>
              <p>View incoming orders and update their status.</p>
            </div>

            <button
              type="button"
              onClick={loadOrders}
              disabled={loadingOrders}
            >
              {loadingOrders ? 'Loading...' : 'Refresh Orders'}
            </button>
          </div>

          {loadingOrders && <p>Loading customer orders...</p>}

          {!loadingOrders && orders.length === 0 && (
            <div
              style={{
                padding: '40px 20px',
                textAlign: 'center',
                border: '1px solid #e5e5e5',
                borderRadius: '12px'
              }}
            >
              <h3>No orders yet</h3>
              <p>Customer orders will appear here after checkout.</p>
            </div>
          )}

          {!loadingOrders && orders.length > 0 && (
            <div style={{ display: 'grid', gap: '14px' }}>
              {orders.map(order => (
                <div
                  key={order._id}
                  style={{
                    border: '1px solid #e5e5e5',
                    borderRadius: '12px',
                    padding: '18px',
                    display: 'grid',
                    gap: '14px'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: '16px',
                      flexWrap: 'wrap'
                    }}
                  >
                    <div>
                      <strong>
                        Order #{String(order._id).slice(-8).toUpperCase()}
                      </strong>
                      <p style={{ margin: '6px 0 0' }}>
                        {orderCustomer(order)} · {orderEmail(order)}
                      </p>
                      <small>
                        {formatDate(order.createdAt)}
                      </small>
                    </div>

                    <strong>${Number(order.total || 0).toLocaleString('en-US')}</strong>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                      gap: '10px'
                    }}
                  >
                    <div>
                      <small>Payment</small>
                      <div>
                        {order.paymentStatus || 'pending'}
                      </div>
                    </div>

                    <div>
                      <small>Items</small>
                      <div>
                        {order.items?.reduce(
                          (sum, item) => sum + Number(item.quantity || 0),
                          0
                        ) || 0}
                      </div>
                    </div>

                    <div>
                      <small>Phone</small>
                      <div>{orderPhone(order)}</div>
                    </div>

                    <div>
                      <small>Status</small>
                      <select
                        value={order.status || 'pending'}
                        disabled={updatingOrderId === order._id}
                        onChange={e =>
                          handleOrderStatus(order._id, e.target.value)
                        }
                      >
                        {statusOptions.map(status => (
                          <option key={status} value={status}>
                            {statusLabel(status)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      gap: '10px',
                      flexWrap: 'wrap'
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedOrder(order)
                        setCourierName(order.courierName || '')
                        setTrackingNumber(order.trackingNumber || '')
                      }}
                    >
                      Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedOrder && (
            <div
              role="dialog"
              aria-modal="true"
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,.45)',
                zIndex: 1000,
                padding: '24px',
                overflowY: 'auto'
              }}
              onClick={() => setSelectedOrder(null)}
            >
              <div
                style={{
                  maxWidth: '760px',
                  margin: '30px auto',
                  background: '#fff',
                  borderRadius: '14px',
                  padding: '28px',
                  boxShadow: '0 20px 60px rgba(0,0,0,.18)'
                }}
                onClick={e => e.stopPropagation()}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '20px',
                    marginBottom: '24px'
                  }}
                >
                  <div>
                    <span className="eyebrow">Order details</span>
                    <h2 style={{ marginBottom: '6px' }}>
                      #{String(selectedOrder._id).slice(-8).toUpperCase()}
                    </h2>
                    <small>{formatDate(selectedOrder.createdAt)}</small>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedOrder(null)}
                  >
                    Close
                  </button>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gap: '18px'
                  }}
                >
                  <div>
                    <h3>Customer</h3>
                    <p style={{ margin: '6px 0' }}>
                      <strong>Name:</strong> {orderCustomer(selectedOrder)}
                    </p>
                    <p style={{ margin: '6px 0' }}>
                      <strong>Email:</strong> {orderEmail(selectedOrder)}
                    </p>
                    <p style={{ margin: '6px 0' }}>
                      <strong>Phone:</strong> {orderPhone(selectedOrder)}
                    </p>
                  </div>

                  <div>
                    <h3>Shipping Address</h3>
                    <p style={{ margin: '6px 0' }}>
                      {selectedOrder.shippingAddress?.address || '—'}
                    </p>
                    <p style={{ margin: '6px 0' }}>
                      {selectedOrder.shippingAddress?.city || '—'},
                      {' '}
                      {selectedOrder.shippingAddress?.state || '—'}
                      {' '}
                      {selectedOrder.shippingAddress?.pin || '—'}
                    </p>
                  </div>

                  <div>
                    <h3>Products</h3>
                    <div style={{ display: 'grid', gap: '10px' }}>
                      {selectedOrder.items?.map((item, index) => (
                        <div
                          key={`${item.product}-${index}`}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            gap: '16px',
                            borderBottom: '1px solid #eee',
                            paddingBottom: '10px'
                          }}
                        >
                          <span>
                            {item.name} × {item.quantity}
                          </span>
                          <strong>
                            ${Number(item.price * item.quantity).toLocaleString('en-US')}
                          </strong>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3>Payment</h3>
                    <p style={{ margin: '6px 0' }}>
                      <strong>Status:</strong>{' '}
                      {selectedOrder.paymentStatus || 'pending'}
                    </p>
                    <p style={{ margin: '6px 0' }}>
                      <strong>Provider:</strong>{' '}
                      {selectedOrder.paymentProvider || '—'}
                    </p>
                    <p style={{ margin: '6px 0', wordBreak: 'break-all' }}>
                      <strong>Razorpay Order ID:</strong>{' '}
                      {selectedOrder.razorpayOrderId || '—'}
                    </p>
                    <p style={{ margin: '6px 0', wordBreak: 'break-all' }}>
                      <strong>Razorpay Payment ID:</strong>{' '}
                      {selectedOrder.razorpayPaymentId || '—'}
                    </p>
                  </div>

                  <div>
                    <h3>Order Total</h3>
                    <p style={{ margin: '6px 0' }}>
                      <strong>Subtotal:</strong> ${Number(selectedOrder.subtotal || 0).toLocaleString('en-US')}
                    </p>
                    <p style={{ margin: '6px 0' }}>
                      <strong>Shipping:</strong> ${Number(selectedOrder.shippingFee || 0).toLocaleString('en-US')}
                    </p>
                    <p style={{ margin: '6px 0', fontSize: '18px' }}>
                      <strong>Total:</strong> ${Number(selectedOrder.total || 0).toLocaleString('en-US')}
                    </p>
                  </div>

                  <div>
                    <h3>Delivery & Status</h3>

                    <label style={{ display: 'block', marginBottom: '6px' }}>
                      Courier Name
                    </label>
                    <input
                      value={courierName}
                      onChange={e => setCourierName(e.target.value)}
                      placeholder="Example: Delhivery"
                      style={{ width: '100%', marginBottom: '14px' }}
                    />

                    <label style={{ display: 'block', marginBottom: '6px' }}>
                      Tracking Number
                    </label>
                    <input
                      value={trackingNumber}
                      onChange={e => setTrackingNumber(e.target.value)}
                      placeholder="Example: DL123456789"
                      style={{ width: '100%', marginBottom: '14px' }}
                    />

                    <label style={{ display: 'block', marginBottom: '6px' }}>
                      Order Status
                    </label>
                    <select
                      value={selectedOrder.status || 'pending'}
                      disabled={updatingOrderId === selectedOrder._id}
                      onChange={e =>
                        handleOrderStatus(
                          selectedOrder._id,
                          e.target.value,
                          courierName,
                          trackingNumber
                        )
                      }
                    >
                      {statusOptions.map(status => (
                        <option key={status} value={status}>
                          {statusLabel(status)}
                        </option>
                      ))}
                    </select>

                    {(selectedOrder.courierName || selectedOrder.trackingNumber) && (
                      <div style={{ marginTop: '14px', padding: '12px', background: '#f7f7f7', borderRadius: '8px' }}>
                        <small>Current delivery details</small>
                        <p style={{ margin: '6px 0' }}>
                          <strong>Courier:</strong> {selectedOrder.courierName || '—'}
                        </p>
                        <p style={{ margin: 0 }}>
                          <strong>Tracking:</strong> {selectedOrder.trackingNumber || '—'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* =========================
            Product Management
        ========================== */}
        <section data-admin-section="products">

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              gap: '20px',
              flexWrap: 'wrap'
            }}
          >
            <div>
              <span className="eyebrow">
                Inventory
              </span>

              <h2>
                Products
              </h2>
            </div>

            <div className="product-header-actions">
              <button
                type="button"
                className="product-add-btn"
                onClick={handleAddProduct}
              >
                <FiPlus size={15} strokeWidth={2} />
                <span>Add Product</span>
              </button>

              <button
                type="button"
                className="product-refresh-btn"
                onClick={loadProducts}
                disabled={loadingProducts}
              >
                <FiRefreshCw
                  size={14}
                  strokeWidth={1.9}
                  className={loadingProducts ? 'is-spinning' : ''}
                />
                <span>{loadingProducts ? 'Loading...' : 'Refresh'}</span>
              </button>
            </div>
          </div>

          {/* Loading */}
          {loadingProducts && (
            <p>
              Loading products...
            </p>
          )}

          {/* Empty State */}
          {!loadingProducts &&
            products.length === 0 && (
              <div
                style={{
                  padding: '40px 20px',
                  textAlign: 'center',
                  border: '1px solid #e5e5e5',
                  borderRadius: '12px'
                }}
              >
                <h3>
                  No products yet
                </h3>

                <p>
                  Add your first product to
                  start selling.
                </p>

                <button
                  type="button"
                  className="button"
                  onClick={handleAddProduct}
                >
                  + Add Product
                </button>
              </div>
            )}

          {/* Product List */}
          {!loadingProducts &&
            products.length > 0 && (
              <div
                style={{
                  display: 'grid',
                  gap: '16px'
                }}
              >
                {products.map(product => (
                  <div
                    key={product._id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns:
                        '90px 1fr auto',
                      gap: '20px',
                      alignItems: 'center',
                      padding: '18px',
                      border:
                        '1px solid #e5e5e5',
                      borderRadius: '12px'
                    }}
                  >

                    {/* Product Image */}
                    <div
                      style={{
                        width: '90px',
                        height: '90px',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        background: '#f5f5f5'
                      }}
                    >
                      {product.images?.[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            height: '100%',
                            display: 'grid',
                            placeItems: 'center',
                            fontSize: '12px'
                          }}
                        >
                          No image
                        </div>
                      )}
                    </div>

                    {/* Product Information */}
                    <div>
                      <h3
                        style={{
                          margin:
                            '0 0 6px'
                        }}
                      >
                        {product.name}
                      </h3>

                      <p
                        style={{
                          margin:
                            '0 0 6px'
                        }}
                      >
                        {product.category}
                      </p>

                      <div>
                        <strong>
                          ${Number(product.price || 0).toLocaleString('en-US')}
                        </strong>

                        {Number(product.mrp ?? product.compareAtPrice ?? 0) > Number(product.price || 0) && (
                          <del style={{ marginLeft: '10px' }}>
                            ${Number(product.mrp ?? product.compareAtPrice).toLocaleString('en-US')}
                          </del>
                        )}

                        <span
                          style={{
                            marginLeft: '15px'
                          }}
                        >
                          Stock:{' '}
                          {product.stock ?? 0}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div
                      style={{
                        display: 'flex',
                        gap: '8px',
                        flexWrap: 'wrap'
                      }}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          handleEditProduct(
                            product
                          )
                        }
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleArchive(
                            product
                          )
                        }
                      >
                        Archive
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}

        </section>

          </div>
        </div>
      </div>
    </main>
  )
}
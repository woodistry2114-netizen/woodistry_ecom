
import mongoose from 'mongoose'

const contentSchema = new mongoose.Schema(
  {
    // ==========================================================
    // CONTENT TYPE
    // ==========================================================

    type: {
      type: String,
      enum: [
        'announcement',
        'hero',
        'promotion',
        'testimonial',
        'gallery',
        'settings',
        'section-images',
      ],
      required: true,
      index: true,
    },

    // ==========================================================
    // COMMON CONTENT FIELDS
    // ==========================================================

    title: {
      type: String,
      trim: true,
    },

    eyebrow: {
      type: String,
      trim: true,
    },

    body: {
      type: String,
      trim: true,
    },

    // ==========================================================
    // ANNOUNCEMENT
    // ==========================================================

    text: {
      type: String,
      trim: true,
      maxlength: 200,
      default: '',
    },

    enabled: {
      type: Boolean,
      default: true,
    },

    // ==========================================================
    // HERO MEDIA
    // ==========================================================

    // Image URL OR Video URL
    image: {
      type: String,
      trim: true,
    },

    // image = JPG, PNG, WEBP etc.
    // video = MP4, WEBM etc.
    mediaType: {
      type: String,
      enum: ['image', 'video'],
      default: 'image',
    },

    mobileImage: {
      type: String,
      trim: true,
    },

    // ==========================================================
    // BUTTON / LINK
    // ==========================================================

    buttonText: {
      type: String,
      trim: true,
    },

    link: {
      type: String,
      trim: true,
    },

    // ==========================================================
    // ORDER
    // ==========================================================

    order: {
      type: Number,
      default: 0,
    },

    // ==========================================================
    // ACTIVE STATUS
    // ==========================================================

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    // ==========================================================
    // SCHEDULE
    // ==========================================================

    startsAt: {
      type: Date,
      default: null,
    },

    endsAt: {
      type: Date,
      default: null,
    },

    // ==========================================================
    // EXTRA DATA
    // ==========================================================

    // Stores additional data, including section images.
    // Example:
    // metadata: {
    //   sectionImages: {
    //     brandStory: 'https://example.com/story.webp',
    //     spaces: {
    //       'Living Room': 'https://example.com/living.webp',
    //       Dining: 'https://example.com/dining.webp',
    //       Bedroom: 'https://example.com/bedroom.webp',
    //       Storage: 'https://example.com/storage.webp'
    //     }
    //   }
    // }

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: undefined,
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.model(
  'Content',
  contentSchema
)

import { Router } from 'express'
import multer from 'multer'

import {
  asyncHandler,
  adminOnly,
  protect
} from '../middleware/index.js'

import {
  uploadImage
} from '../services/integrations.js'

const router = Router()


// ============================================================
// MULTER CONFIGURATION
// ============================================================

const upload = multer({

  storage:
    multer.memoryStorage(),

  limits: {
    // Maximum 5 MB
    fileSize:
      5 * 1024 * 1024
  },

  fileFilter:
    (_req, file, callback) => {

      // ------------------------------------------------------
      // Only image files allowed
      // ------------------------------------------------------

      if (
        !file.mimetype ||
        !file.mimetype.startsWith(
          'image/'
        )
      ) {
        return callback(
          new Error(
            'Only image files are allowed'
          )
        )
      }

      callback(null, true)
    }
})


// ============================================================
// UPLOAD PRODUCT / CMS IMAGE
//
// POST /api/uploads/image
//
// Field name:
// image
//
// Optional:
// folder
//
// Admin only
// ============================================================

router.post(
  '/image',

  protect,
  adminOnly,

  upload.single('image'),

  asyncHandler(
    async (req, res) => {

      // ------------------------------------------------------
      // File required
      // ------------------------------------------------------

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message:
            'Image is required'
        })
      }


      // ------------------------------------------------------
      // Convert image to Data URI
      // ------------------------------------------------------

      const dataUri =
        `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`


      // ------------------------------------------------------
      // Safe folder
      // ------------------------------------------------------

      const requestedFolder =
        String(
          req.body?.folder ||
          'xaaj'
        )
          .trim()
          .replace(
            /[^a-zA-Z0-9/_-]/g,
            ''
          )


      const folder =
        requestedFolder ||
        'xaaj'


      // ------------------------------------------------------
      // Upload to Cloudinary
      // ------------------------------------------------------

      const data =
        await uploadImage(
          dataUri,
          folder
        )


      // ------------------------------------------------------
      // Response
      // ------------------------------------------------------

      res.status(201).json({

        success: true,

        message:
          'Image uploaded successfully',

        data
      })
    }
  )
)


// ============================================================
// MULTER ERROR HANDLER
// ============================================================

router.use(
  (err, _req, res, next) => {

    if (
      err instanceof
      multer.MulterError
    ) {

      if (
        err.code ===
        'LIMIT_FILE_SIZE'
      ) {
        return res.status(400).json({
          success: false,
          message:
            'Image size cannot exceed 5 MB'
        })
      }

      return res.status(400).json({
        success: false,
        message:
          err.message ||
          'Image upload failed'
      })
    }


    if (
      err?.message ===
      'Only image files are allowed'
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Only image files are allowed'
      })
    }


    next(err)
  }
)


// ============================================================
// EXPORT
// ============================================================

export default router
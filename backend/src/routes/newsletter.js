import { Router } from 'express'

import Subscriber from '../models/Subscriber.js'

import {
  asyncHandler
} from '../middleware/index.js'

import { sendEmail } from '../services/integrations.js'

const router = Router()

// ============================================================
// EMAIL VALIDATION
// ============================================================

const isValidEmail = email => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// ============================================================
// SEND WELCOME EMAIL
// ============================================================

const sendWelcomeEmail = async email => {
  await sendEmail({
    to: email,

    subject: 'Welcome to XAAJ — We’re glad you’re here',

    html: `
      <div style="
        margin:0;
        padding:40px 20px;
        background:#f6f2eb;
        font-family:Arial,Helvetica,sans-serif;
        color:#292824;
      ">

        <div style="
          max-width:600px;
          margin:0 auto;
          background:#ffffff;
          border:1px solid #e8e1d7;
          border-radius:20px;
          overflow:hidden;
        ">

          <!-- HEADER -->

          <div style="
            padding:34px 30px;
            text-align:center;
            border-bottom:1px solid #eee8df;
          ">

            <div style="
              font-size:13px;
              letter-spacing:5px;
              color:#b84d32;
              font-weight:600;
            ">
              XAAJ
            </div>

            <div style="
              margin-top:8px;
              font-size:10px;
              letter-spacing:3px;
              color:#77736c;
            ">
              STORES CRAFTED IN EARTH
            </div>

          </div>

          <!-- CONTENT -->

          <div style="
            padding:45px 35px;
            text-align:center;
          ">

            <div style="
              font-size:12px;
              letter-spacing:4px;
              text-transform:uppercase;
              color:#b84d32;
              font-weight:600;
            ">
              A little note from us
            </div>

            <h1 style="
              margin:18px 0 16px;
              font-family:Georgia,'Times New Roman',serif;
              font-size:38px;
              line-height:1.15;
              font-weight:400;
              color:#292824;
            ">
              Welcome to XAAJ.
            </h1>

            <p style="
              margin:0 auto;
              max-width:470px;
              font-size:16px;
              line-height:1.8;
              color:#706d67;
            ">
              We’re happy to have you here.
              Expect thoughtful collections, beautiful
              tableware and little stories from XAAJ —
              shared with care, never too often.
            </p>

            <div style="
              margin:32px auto;
              width:70px;
              height:1px;
              background:#d8d0c5;
            "></div>

            <p style="
              margin:0;
              font-size:15px;
              line-height:1.7;
              color:#55514b;
            ">
              Here’s to making everyday moments
              a little more beautiful.
            </p>

            <p style="
              margin:30px 0 0;
              font-family:Georgia,'Times New Roman',serif;
              font-size:20px;
              color:#292824;
            ">
              With warmth,<br />
              <strong style="font-weight:400;">
                Team XAAJ
              </strong>
            </p>

          </div>

          <!-- FOOTER -->

          <div style="
            padding:22px 30px;
            text-align:center;
            background:#f8f5ef;
            border-top:1px solid #eee8df;
            font-size:12px;
            line-height:1.6;
            color:#8a857d;
          ">
            You’re receiving this because you subscribed
            to XAAJ updates.
          </div>

        </div>

      </div>
    `
  })
}

// ============================================================
// SUBSCRIBE
// ============================================================

router.post(
  '/subscribe',

  asyncHandler(async (req, res) => {

    // --------------------------------------------------------
    // GET EMAIL
    // --------------------------------------------------------

    const email = String(
      req.body.email || ''
    )
      .trim()
      .toLowerCase()

    // --------------------------------------------------------
    // VALIDATE EMAIL
    // --------------------------------------------------------

    if (!email) {
      return res.status(400).json({
        success: false,
        code: 'EMAIL_REQUIRED',
        message: 'Please enter your email address.'
      })
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        code: 'INVALID_EMAIL',
        message: 'Please enter a valid email address.'
      })
    }

    // --------------------------------------------------------
    // CHECK EXISTING SUBSCRIBER
    // --------------------------------------------------------

    const existingSubscriber =
      await Subscriber.findOne({ email })

    if (existingSubscriber) {

      // ------------------------------------------------------
      // ALREADY SUBSCRIBED
      // ------------------------------------------------------

      if (existingSubscriber.isSubscribed) {
        return res.status(409).json({
          success: false,
          code: 'ALREADY_SUBSCRIBED',
          message:
            'You’re already subscribed. This email is already part of the XAAJ family.'
        })
      }

      // ------------------------------------------------------
      // RE-SUBSCRIBE
      // ------------------------------------------------------

      existingSubscriber.isSubscribed = true
      existingSubscriber.subscribedAt = new Date()
      existingSubscriber.unsubscribedAt = null

      await existingSubscriber.save()

      // Send welcome email again after re-subscription
      try {
        await sendWelcomeEmail(email)
      } catch (emailError) {
        console.error(
          '[Newsletter] Welcome email failed:',
          emailError
        )
      }

      return res.status(200).json({
        success: true,
        code: 'RESUBSCRIBED',
        message:
          'Welcome back to XAAJ. You’re subscribed again.'
      })
    }

    // --------------------------------------------------------
    // CREATE NEW SUBSCRIBER
    // --------------------------------------------------------

    const subscriber =
      await Subscriber.create({
        email,
        isSubscribed: true,
        subscribedAt: new Date()
      })

    // --------------------------------------------------------
    // SEND WELCOME EMAIL
    // --------------------------------------------------------

    try {

      await sendWelcomeEmail(email)

    } catch (emailError) {

      console.error(
        '[Newsletter] Welcome email failed:',
        emailError
      )

      // Remove subscription if welcome email
      // could not be sent successfully.
      await Subscriber.deleteOne({
        _id: subscriber._id
      })

      return res.status(500).json({
        success: false,
        code: 'WELCOME_EMAIL_FAILED',
        message:
          'We could not complete your subscription right now. Please try again.'
      })
    }

    // --------------------------------------------------------
    // SUCCESS
    // --------------------------------------------------------

    return res.status(201).json({
      success: true,
      code: 'SUBSCRIBED',
      message:
        'Welcome to XAAJ! You’re now part of our little circle.'
    })
  })
)

// ============================================================
// EXPORT ROUTER
// ============================================================

export default router
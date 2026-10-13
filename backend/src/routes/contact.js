import { Router } from 'express'
import { asyncHandler } from '../middleware/index.js'
import { sendEmail } from '../services/integrations.js'

const router = Router()

const CUSTOMER_CARE_EMAIL = 'customercare@xaaj.in'

const isValidEmail = email =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const name = String(req.body.name || '').trim()
    const email = String(req.body.email || '').trim().toLowerCase()
    const phone = String(req.body.phone || '').trim()
    const message = String(req.body.message || '').trim()

    // ----------------------------------------------------------
    // VALIDATION
    // ----------------------------------------------------------

    if (!name) {
      return res.status(400).json({
        success: false,
        code: 'NAME_REQUIRED',
        message: 'Please enter your name.'
      })
    }

    if (name.length > 80) {
      return res.status(400).json({
        success: false,
        code: 'NAME_TOO_LONG',
        message: 'Name must be less than 80 characters.'
      })
    }

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

    if (phone && phone.length > 20) {
      return res.status(400).json({
        success: false,
        code: 'PHONE_TOO_LONG',
        message: 'Please enter a valid phone number.'
      })
    }

    if (!message) {
      return res.status(400).json({
        success: false,
        code: 'MESSAGE_REQUIRED',
        message: 'Please enter your message.'
      })
    }

    if (message.length > 2000) {
      return res.status(400).json({
        success: false,
        code: 'MESSAGE_TOO_LONG',
        message: 'Message must be less than 2000 characters.'
      })
    }

    // ----------------------------------------------------------
    // EMAIL TO XAAJ CUSTOMER CARE
    // ----------------------------------------------------------

    await sendEmail({
      to: CUSTOMER_CARE_EMAIL,
      subject: `XAAJ Contact Form — ${name}`,
      html: `
        <div style="
          margin:0;
          padding:40px 20px;
          background:#f6f2eb;
          font-family:Arial,Helvetica,sans-serif;
          color:#292824;
        ">
          <div style="
            max-width:650px;
            margin:0 auto;
            background:#ffffff;
            border:1px solid #e8e1d7;
            border-radius:20px;
            overflow:hidden;
          ">

            <div style="
              padding:30px;
              text-align:center;
              border-bottom:1px solid #eee8df;
            ">
              <div style="
                font-size:14px;
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
                CONTACT FORM
              </div>
            </div>

            <div style="padding:35px 30px;">

              <h2 style="
                margin:0 0 25px;
                font-family:Georgia,'Times New Roman',serif;
                font-size:30px;
                font-weight:400;
                color:#292824;
              ">
                New customer enquiry
              </h2>

              <div style="
                padding:20px;
                background:#f8f5ef;
                border-radius:14px;
              ">

                <p style="margin:0 0 14px;">
                  <strong>Name:</strong><br />
                  ${escapeHtml(name)}
                </p>

                <p style="margin:0 0 14px;">
                  <strong>Email:</strong><br />
                  <a
                    href="mailto:${escapeHtml(email)}"
                    style="color:#b84d32;"
                  >
                    ${escapeHtml(email)}
                  </a>
                </p>

                ${
                  phone
                    ? `
                      <p style="margin:0 0 14px;">
                        <strong>Phone:</strong><br />
                        ${escapeHtml(phone)}
                      </p>
                    `
                    : ''
                }

                <p style="margin:0;">
                  <strong>Message:</strong><br />
                  ${escapeHtml(message).replace(/\n/g, '<br />')}
                </p>

              </div>

              <p style="
                margin:28px 0 0;
                font-size:12px;
                color:#8a857d;
              ">
                This message was submitted through the XAAJ website contact form.
              </p>

            </div>

          </div>
        </div>
      `
    })

    // ----------------------------------------------------------
    // CUSTOMER ACKNOWLEDGEMENT EMAIL
    // ----------------------------------------------------------

    try {
      await sendEmail({
        to: email,
        subject: 'XAAJ — We received your message',
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

              <div style="
                padding:32px 30px;
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

              <div style="
                padding:42px 30px;
                text-align:center;
              ">

                <div style="
                  font-size:11px;
                  letter-spacing:3px;
                  text-transform:uppercase;
                  color:#b84d32;
                  font-weight:600;
                ">
                  Thank you for reaching out
                </div>

                <h1 style="
                  margin:16px 0;
                  font-family:Georgia,'Times New Roman',serif;
                  font-size:34px;
                  line-height:1.2;
                  font-weight:400;
                  color:#292824;
                ">
                  We received your message.
                </h1>

                <p style="
                  max-width:470px;
                  margin:0 auto;
                  font-size:15px;
                  line-height:1.8;
                  color:#706d67;
                ">
                  Hi ${escapeHtml(name)}, thank you for getting in touch
                  with XAAJ. Our team has received your message and will
                  get back to you as soon as possible.
                </p>

                <div style="
                  width:55px;
                  height:1px;
                  margin:28px auto;
                  background:#d8d0c5;
                "></div>

                <p style="
                  margin:0;
                  font-family:Georgia,'Times New Roman',serif;
                  font-size:19px;
                  color:#292824;
                ">
                  With warmth,<br />
                  Team XAAJ
                </p>

              </div>

              <div style="
                padding:20px 30px;
                text-align:center;
                background:#f8f5ef;
                border-top:1px solid #eee8df;
                font-size:12px;
                color:#8a857d;
              ">
                customercare@xaaj.in · +91 9899446117
              </div>

            </div>
          </div>
        `
      })
    } catch (customerEmailError) {
      // Customer acknowledgement fail hone par bhi
      // main contact enquiry successfully process ho chuki hai.
      console.error(
        '[Contact] Customer acknowledgement email failed:',
        customerEmailError
      )
    }

    return res.status(200).json({
      success: true,
      message:
        'Thank you for contacting XAAJ. We have received your message and will get back to you soon.'
    })
  })
)

// ----------------------------------------------------------
// HTML ESCAPE
// ----------------------------------------------------------

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

// IMPORTANT: default export
export default router
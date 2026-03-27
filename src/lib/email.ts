import { Resend } from 'resend'

let _resend: Resend | null = null
function getResend() {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY ?? 'placeholder')
  return _resend
}

interface EmailOptions {
  to: string
  subject: string
  welcomeText?: string
  h1: string
  body: string
  buttonText?: string
  buttonUrl?: string
}

export async function sendEmail({
  to,
  subject,
  welcomeText = 'Seguridad Digital',
  h1,
  body,
  buttonText,
  buttonUrl,
}: EmailOptions) {
  const logoUrl = `${process.env.NEXT_PUBLIC_APP_URL}/logo.png`

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #000; margin: 0; padding: 0; color: #ffffff; }
        .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
        .header { text-align: center; padding-bottom: 40px; }
        .logo { width: 180px; }
        .content { background-color: #111; padding: 40px; border-radius: 16px; border: 1px solid #222; text-align: center; }
        .welcome { font-size: 14px; color: #f59e0b; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 8px; }
        h1 { font-size: 24px; margin: 0 0 20px; color: #fff; }
        p { font-size: 16px; line-height: 1.6; color: #999; margin-bottom: 30px; }
        .button { background-color: #f59e0b; color: #000 !important; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block; }
        .footer { text-align: center; padding-top: 40px; font-size: 12px; color: #444; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="${logoUrl}" alt="BikeVzla 888" class="logo">
        </div>
        <div class="content">
          <div class="welcome">${welcomeText}</div>
          <h1>${h1}</h1>
          <p>${body}</p>
          ${buttonText && buttonUrl ? `<a href="${buttonUrl}" class="button">${buttonText}</a>` : ''}
        </div>
        <div class="footer">
          © 2026 BikeVzla 888. El mundo completo de tu moto.
        </div>
      </div>
    </body>
    </html>
  `

  try {
    const { data, error } = await getResend().emails.send({
      from: 'BikeVzla 888 <info@bikevzla888.com>',
      to,
      subject,
      html,
    })

    if (error) {
      console.error('Error enviando email:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (err) {
    console.error('Error sending email:', err)
    return { success: false, error: err }
  }
}

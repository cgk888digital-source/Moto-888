const { Resend } = require('resend');
require('dotenv').config({ path: '.env.local' });

const resend = new Resend(process.env.RESEND_API_KEY);

async function test() {
  console.log('--- Iniciando prueba de email (Simple JS) ---');
  
  const logoUrl = `${process.env.NEXT_PUBLIC_APP_URL}/logo.png`;
  const to = 'cgk888digital@gmail.com'; 

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
          <div class="welcome">Prueba de Diseño</div>
          <h1>¡Tu sistema BikeVzla está activo!</h1>
          <p>Este es un mensaje de prueba para verificar que el logo y el diseño premium se visualizan correctamente.</p>
          <a href="http://localhost:3000" class="button">Explorar mi App →</a>
        </div>
        <div class="footer">
          © 2026 BikeVzla 888. El mundo completo de tu moto.
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev', // Usar el dominio de prueba de Resend al inicio
      to,
      subject: '🏍️ Prueba de Diseño - BikeVzla 888',
      html,
    });

    if (error) {
      console.error('❌ Error enviando email:', error);
    } else {
      console.log('✅ Email enviado con éxito id:', data.id);
    }
  } catch (err) {
    console.error('❌ Error fatal:', err);
  }
}

test();

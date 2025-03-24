import nodemailer from 'nodemailer';

type EmailOptions = {
  to: string;
  subject: string;
  html: string;
};

// Nodemailer transport
let transport: nodemailer.Transporter;

// Geliştirme ortamında sahte e-posta gönderici oluştur
if (process.env.NODE_ENV === 'development') {
  // Konsola yazdıracak bir sahte transport
  transport = nodemailer.createTransport({
    jsonTransport: true,
  });
} else {
  // Gerçek ortam için yapılandırma
  transport = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: Number(process.env.EMAIL_SERVER_PORT),
    secure: Boolean(process.env.EMAIL_SERVER_SECURE === 'true'),
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  });
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  if (!to || !subject || !html) {
    throw new Error('E-posta göndermek için gerekli alanlar eksik');
  }

  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@todobus.app',
      to,
      subject,
      html,
    };

    const info = await transport.sendMail(mailOptions);

    // Geliştirme ortamında konsola yazdır
    if (process.env.NODE_ENV === 'development') {
      console.log('E-posta gönderildi (DEV):', JSON.parse(info.message));
    }

    return info;
  } catch (error) {
    console.error('E-posta gönderme hatası:', error);
    throw error;
  }
} 
import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn("⚠️ EMAIL_USER or EMAIL_PASS not configured in .env. Email sending skipped.");
      return;
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail', 
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Surprise Sutra" <${process.env.EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email successfully sent to ${options.to}`);
  } catch (error) {
    console.error(`❌ Error sending email to ${options.to}:`, error.message);
  }
};

export default sendEmail;

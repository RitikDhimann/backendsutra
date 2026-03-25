// utils/whatsappService.js
import twilio from 'twilio';

/**
 * Sends a WhatsApp message (Mock implementation)
 * @param {string} phone - Recipient's phone number
 * @param {string} message - Message content
 */
export const sendWhatsAppMessage = async (phone, message) => {
  try {

    const sid = (process.env.TWILIO_ACCOUNT_SID || '').trim();
    const token = (process.env.TWILIO_AUTH_TOKEN || '').trim();

    if (!sid || !token) {
      throw new Error("Twilio credentials missing in Environment Variables");
    }

    const client = twilio(sid, token);
    await client.messages.create({
      from: 'whatsapp:+14155238886',
      to: `whatsapp:${phone}`,
      body: message
    });

    console.log(`[WhatsApp Service] Sending message to ${phone}: ${message}`);
    return { success: true };
  } catch (error) {
    console.error(`[WhatsApp Service] Error sending message to ${phone}:`, {
      message: error.message,
      code: error.code,
      status: error.status,
      moreInfo: error.moreInfo
    });
    return { success: false, error: error.message };
  }
};

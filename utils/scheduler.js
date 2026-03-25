// utils/scheduler.js
import cron from "node-cron";
import Order from "../models/orderSchemma.js";
import { sendWhatsAppMessage } from "./whatsappService.js";

/**
 * Initializes the automated messaging scheduler.
 * Runs every day at 00:00 (midnight).
 */
export const initScheduler = () => {
  cron.schedule("0 0 * * *", async () => {
    console.log("[Scheduler] Checking for upcoming events...");
    try {
      // Find orders with eventDate exactly 7 days from now
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + 7);
      targetDate.setHours(0, 0, 0, 0);

      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);

      const orders = await Order.find({
        eventDate: {
          $gte: targetDate,
          $lt: nextDay,
        },
      }).populate("user");

      console.log(`[Scheduler] Found ${orders.length} orders with events in 7 days.`);

      for (const order of orders) {
        const phone = order.shippingAddress?.phone || order.user?.phone;
        const name = order.shippingAddress?.name || order.user?.name || "there";

        if (phone) {
          const message = `🎉 Hi ${name}! Just a quick shout-out from Surprise Sutra! 🎈 Your big day is just ONE WEEK away on ${order.eventDate.toDateString()}! ✨ We're already getting the magic ready to make your celebration unforgettable. Can't wait! 🎊🥳`;
          await sendWhatsAppMessage(phone, message);
        } else {
          console.warn(`[Scheduler] No phone found for order ${order._id}`);
        }
      }
    } catch (error) {
      console.error("[Scheduler] Error during task execution:", error.message);
    }
  });

  console.log("[Scheduler] Daily reminder job scheduled.");
};

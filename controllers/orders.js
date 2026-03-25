import Order from "../models/orderSchemma.js";
import Product from "../models/ProductScheema.js";
import User from "../models/user.js";
import sendEmail from "../utils/sendEmail.js";
import { sendWhatsAppMessage } from "../utils/whatsappService.js";

// Create new order
export const createOrder = async (req, res) => {
  try {
    const { userId, orderItems, shippingAddress, paymentMethod, shippingPrice, eventDate, occasion, eventTime, paymentStatus } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: "No order items provided" });
    }

    // Loop through order items and deduct inventory
    // Skip inventory deduction for Event Bookings (identified by 'occasion')
    if (!occasion) {
      for (const item of orderItems) {
        const product = await Product.findById(item.product);
        if (!product) throw new Error(`Product ${item.title} not found`);

        let variant = product.variants.find(v => 
          (item.variant?.sku && v.sku === item.variant.sku) || 
          ((v.option1 || null) === (item.variant?.option1Value || null) && 
           (v.option2 || null) === (item.variant?.option2Value || null))
        );

        if (!variant && product.variants.length === 1) {
          variant = product.variants[0];
        }

        if (!variant) throw new Error(`Variant for ${item.title} not found. Please try re-adding to cart.`);
        
        if (variant.inventoryQty < item.quantity) {
          throw new Error(`Insufficient stock for ${item.title}. Only ${variant.inventoryQty} left.`);
        }

        variant.inventoryQty -= item.quantity;
        await product.save();
      }
    }

    // Calculate total price
    let totalPrice = 0;
    orderItems.forEach(item => {
      totalPrice += (item.price || 0) * item.quantity;
    });

    const order = await Order.create({
      user: userId,
      orderItems,
      shippingAddress,
      paymentMethod,
      paymentStatus: paymentStatus || "pending",
      shippingPrice: shippingPrice || 0,
      totalPrice: totalPrice + (shippingPrice || 0),
      eventDate: eventDate || null,
      eventTime: eventTime || null,
      occasion: occasion || null,
    });

    res.status(201).json({ message: occasion ? "Booking confirmed! Magic is brewing. ✨" : "Order placed successfully! Magic is brewing. ✨", order });

    // Send WhatsApp Confirmation (Async)
    const phone = order.shippingAddress?.phone || order.user?.phone;
    if (phone) {
      const message = occasion 
        ? `✨ Hi ${order.shippingAddress?.name || "there"}! Your ${occasion} celebration has been BOOKED! 🎊 We've received your data for ${new Date(eventDate).toLocaleDateString()} at ${eventTime}. Our team will contact you shortly to make it magical! 🪄✨`
        : `🎉 Hi ${order.shippingAddress?.name || "there"}! Your order #${order._id.slice(-8).toUpperCase()} has been placed successfully! 📦 We're preparing your magic. Track it in your profile! ✨`;
      
      sendWhatsAppMessage(phone, message);
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get all orders (admin)
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("user", "name email");
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get orders for a single user
export const getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;
    const orders = await Order.find({ user: userId }).populate("user", "name email");
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get order by ID
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id).populate("user", "name email");
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.status(200).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus, paymentStatus } = req.body;

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Update payment status if provided
    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }

    // Handle order status updates
    if (orderStatus) {
      // Restrict cancellation to "processing" only if it's a user request (implicit here)
      if (orderStatus === "cancelled") {
        if (order.orderStatus !== "processing") {
          return res.status(400).json({ message: "Order cannot be cancelled once it is shipped or delivered." });
        }

        // Restock inventory
        for (const item of order.orderItems) {
          const product = await Product.findById(item.product);
          if (product) {
            const variant = product.variants.find(v => 
              (item.variant?.sku && v.sku === item.variant.sku) || 
              (v.option1 === item.variant?.option1Value && v.option2 === item.variant?.option2Value)
            );
            if (variant) {
              variant.inventoryQty += item.quantity;
              await product.save();
            }
          }
        }
      }

      // Prevention of invalid transitions (once delivered or cancelled, status is final)
      if (order.orderStatus === "delivered" || order.orderStatus === "cancelled") {
        return res.status(400).json({ message: `Status is final. Cannot change from ${order.orderStatus}.` });
      }

      order.orderStatus = orderStatus;
      if (orderStatus === "delivered") order.deliveredAt = Date.now();
      if (orderStatus === "cancelled") order.cancelledAt = Date.now();
    }

    await order.save();
    res.status(200).json({ message: `Order updated successfully.`, order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete an order
export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findByIdAndDelete(id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.status(200).json({ message: "Order deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Send Order Status Email Notification
export const sendOrderStatusEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id).populate("user");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (!order.user || !order.user.email) {
      return res.status(400).json({ message: "User email not found" });
    }

    const statusLabels = {
      processing: "Brewing Magic (Preparing)",
      shipped: "In Flight (Shipped)",
      out_for_delivery: "On Your Way (Out for Delivery)",
      delivered: "Magic Delivered",
      cancelled: "Magic Fumbled (Cancelled)"
    };

    const statusLabel = statusLabels[order.orderStatus] || order.orderStatus;

    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #FF2D55;">Surprise Sutra Status Update! ✨</h2>
        <p>Hi <b>${order.user.name}</b>,</p>
        <p>Your order <b>#${order._id.slice(-8).toUpperCase()}</b> has a new update:</p>
        <div style="background-color: #FDF2F4; padding: 15px; border-radius: 8px; border-left: 4px solid #FF2D55; margin: 20px 0;">
          <p style="margin: 0; font-size: 18px; font-weight: bold; color: #333;">Status: ${statusLabel}</p>
        </div>
        <p>You can track your order details on our website.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #999; text-align: center;">Stay Magical,<br/>Team Surprise Sutra</p>
      </div>
    `;

    await sendEmail({
      to: order.user.email,
      subject: `Order Update: #${order._id.slice(-8).toUpperCase()} is ${statusLabel}`,
      html: emailHtml,
    });

    res.status(200).json({ message: "Status notification email sent successfully!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Send manual WhatsApp reminder
export const sendOrderReminder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id).populate("user");
    
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (!order.user || !order.user.phone) {
      return res.status(400).json({ message: "User phone number not found" });
    }

    const message = `🎉 Hi ${order.user.name}! Just a quick shout-out from Surprise Sutra! 🎈 Your big day is coming up on ${order.eventDate ? order.eventDate.toDateString() : 'soon'}! ✨ We're almost ready to make it magical! 🎊🥳`;
    
    const result = await sendWhatsAppMessage(order.user.phone, message);
    
    if (result.success) {
      res.status(200).json({ message: "Reminder sent successfully" });
    } else {
      res.status(500).json({ message: "Failed to send reminder", error: result.error });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Dashboard Stats
export const getDashboardStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    
    const revenueResult = await Order.aggregate([
      { $group: { _id: null, totalRevenue: { $sum: "$totalPrice" } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;
    
    const newCustomers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    
    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5).populate("user", "name email");

    const pendingShipments = await Order.countDocuments({ orderStatus: "processing" }); 
    const completedOrders = await Order.countDocuments({ orderStatus: "delivered" });
    
    const outOfStock = await Product.countDocuments({ "variants.inventoryQty": 0 });

    res.status(200).json({
      totalRevenue,
      totalOrders,
      newCustomers,
      totalProducts,
      recentOrders,
      storeOverview: {
        pendingShipments,
        completedOrders,
        outOfStock
      }
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

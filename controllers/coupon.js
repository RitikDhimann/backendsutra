import Coupon from "../models/couponSchemma.js";

// Create a new coupon (Admin)
export const createCoupon = async (req, res) => {
    try {
        const { code, discountType, discountValue, minOrderAmount, expiryDate } = req.body;
        
        const existing = await Coupon.findOne({ code: code.toUpperCase() });
        if (existing) {
            return res.status(400).json({ message: "Coupon code already exists!" });
        }

        const coupon = new Coupon({
            code,
            discountType,
            discountValue,
            minOrderAmount,
            expiryDate
        });

        await coupon.save();
        res.status(201).json({ message: "Coupon created successfully!", coupon });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get all coupons (Admin)
export const getCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find().sort({ createdAt: -1 });
        res.status(200).json(coupons);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Delete a coupon (Admin)
export const deleteCoupon = async (req, res) => {
    try {
        await Coupon.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Coupon deleted!" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Verify coupon (Client)
export const verifyCoupon = async (req, res) => {
    try {
        const { code, cartTotal } = req.body;
        const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

        if (!coupon) {
            return res.status(404).json({ message: "Invalid or inactive coupon code" });
        }

        // Check expiry
        if (new Date() > new Date(coupon.expiryDate)) {
            return res.status(400).json({ message: "Coupon has expired" });
        }

        // Check min order amount
        if (cartTotal < coupon.minOrderAmount) {
            return res.status(400).json({ 
                message: `Minimum order of ₹${coupon.minOrderAmount} required for this coupon` 
            });
        }

        res.status(200).json({
            message: "Coupon applied!",
            discountType: coupon.discountType,
            discountValue: coupon.discountValue
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

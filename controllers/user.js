// controllers/user.js
import User from "../models/user.js";
import jwt from "jsonwebtoken";
import sendEmail from "../utils/sendEmail.js";

// Register User
export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already exists" });

    const user = await User.create({ name, email, password });
    res.status(201).json({ message: "User registered successfully", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login User
export const loginUser = async (req, res) => {
  const { email, password, isAdminLogin } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

    // Enforce admin role if logging into admin panel
    if (isAdminLogin && user.role !== "admin") {
        return res.status(403).json({ message: "Access denied. Admin privileges required." });
    }

    // Generate JWT Token
    const token = jwt.sign({ id: user._id, role: user.role }, "surprisesutra@12345", {
      expiresIn: "7d",
    });

    // Send Welcome Email (Skip for admin panel logins)
    if (!isAdminLogin) {
        const emailSubject = "Welcome Back to the Magic! ✨";
        const emailHtml = `
          <div style="background-color: #fff5f8; padding: 40px 20px; font-family: 'Plus Jakarta Sans', Helvetica, Arial, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 32px; overflow: hidden; box-shadow: 0 20px 40px rgba(221, 42, 123, 0.1); border: 1px solid #fce4f3;">
              <!-- Header -->
              <div style="background: linear-gradient(135deg, #DD2A7B 0%, #8134AF 100%); padding: 40px 20px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">Surprise <span style="color: #FEDA77;">Sutra!</span></h1>
              </div>
              
              <!-- Content -->
              <div style="padding: 40px; text-align: center;">
                <div style="background: #fff0f6; width: 60px; height: 60px; border-radius: 20px; line-height: 60px; font-size: 30px; margin: 0 auto 24px;">✨</div>
                <h2 style="color: #3D1A47; margin: 0 0 16px; font-size: 24px; font-weight: 800;">Welcome Back, ${user.name || 'Friend'}!</h2>
                <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 32px;">
                  You've successfully summoned the magic! We're thrilled to have you back in your space. Ready to discover your next big surprise?
                </p>
                
                <a href="https://surprisesutra.com" style="display: inline-block; background: #DD2A7B; color: #ffffff; padding: 16px 40px; border-radius: 100px; text-decoration: none; font-weight: 800; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 10px 20px rgba(221, 42, 123, 0.3);">
                  Enter the Party
                </a>
              </div>
              
              <!-- Footer -->
              <div style="background: #fafafa; padding: 24px; text-align: center; border-top: 1px solid #eeeeee;">
                <p style="color: #999999; font-size: 12px; margin: 0; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                  Made with 💖 by Surprise Sutra Team
                </p>
              </div>
            </div>
            
            <p style="text-align: center; color: #bbbbbb; font-size: 12px; margin-top: 24px;">
              If this wasn't you, please secure your magic key immediately.
            </p>
          </div>
        `;
        
        // We intentionally don't await this so it doesn't delay the login response
        sendEmail({ to: user.email, subject: emailSubject, html: emailHtml });
    }

    res.status(200).json({ message: "Login successful", token, user: { _id: user._id, name: user.name, email: user.email, role: user.role }, });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ✅ Get user by ID
export const getUserById = async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await User.findById(userId).select("-password"); // remove password from response

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User fetched successfully", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// ✅ Update user info (name, email, password)
export const updateUser = async (req, res) => {
  const { name, email, password } = req.body;
  const userId = req.params.id;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (name) user.name = name;
    if (email) user.email = email;
    if (password) {
      user.password = password; // pre-save hook in models/user.js will handle hashing
    }

    await user.save();
    res.status(200).json({ message: "User updated successfully", user: { _id: user._id, name: user.name, email: user.email, addresses: user.addresses } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Check if email exists
export const checkEmail = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: "Email not found in our records" });
    }
    res.status(200).json({ message: "Email verified" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Reset password
export const resetPassword = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.password = password; // pre-save hook will handle hashing
    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Add a new address
export const addAddress = async (req, res) => {
  const userId = req.params.id;
  const newAddress = req.body; // {street, city, state, zip, country, isDefault}

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // If isDefault is true, reset other addresses
    if (newAddress.isDefault) {
      user.addresses.forEach(addr => addr.isDefault = false);
    }

    user.addresses.push(newAddress);
    await user.save();

    res.status(200).json({ message: "Address added successfully", addresses: user.addresses });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Update an existing address
export const updateAddress = async (req, res) => {
  const userId = req.params.id;
  const { index, address } = req.body; // index of address in addresses array, address object with new data

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (index < 0 || index >= user.addresses.length)
      return res.status(400).json({ message: "Invalid address index" });

    // If isDefault is true, reset other addresses
    if (address.isDefault) {
      user.addresses.forEach(addr => addr.isDefault = false);
    }

    user.addresses[index] = { ...user.addresses[index]._doc, ...address };
    await user.save();

    res.status(200).json({ message: "Address updated successfully", addresses: user.addresses });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Delete an address
export const deleteAddress = async (req, res) => {
  const userId = req.params.id;
  const { index } = req.body; // index of address to delete

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (index < 0 || index >= user.addresses.length)
      return res.status(400).json({ message: "Invalid address index" });

    user.addresses.splice(index, 1);
    await user.save();

    res.status(200).json({ message: "Address deleted successfully", addresses: user.addresses });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Toggle product in wishlist
export const toggleWishlist = async (req, res) => {
  const { userId, productId } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const index = user.wishlist.indexOf(productId);
    if (index === -1) {
      user.wishlist.push(productId);
    } else {
      user.wishlist.splice(index, 1);
    }

    await user.save();
    res.status(200).json({ message: "Wishlist updated", wishlist: user.wishlist });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Get user wishlist (populated)
export const getWishlist = async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await User.findById(userId).populate("wishlist");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "Wishlist fetched", wishlist: user.wishlist });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

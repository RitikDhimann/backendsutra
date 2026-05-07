import Banner from "../models/Banner.js";

// ✅ Get all banners (for Admin)
export const getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, banners });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ Get active banner (for Client)
export const getActiveBanner = async (req, res) => {
  try {
    const banner = await Banner.findOne({ isActive: true });
    res.status(200).json({ success: true, banner });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ Create new banner
export const createBanner = async (req, res) => {
  try {
    const { text, link, backgroundColor, textColor, isActive } = req.body;
    let imagePath = "";

    if (req.file) {
      imagePath = `/uploads/banners/${req.file.filename}`;
    }

    // If this one is set to active, deactivate others
    if (isActive === "true" || isActive === true) {
      await Banner.updateMany({}, { isActive: false });
    }

    const banner = new Banner({
      text,
      link,
      backgroundColor,
      textColor,
      isActive: isActive === "true" || isActive === true,
      image: imagePath,
    });

    await banner.save();
    res.status(201).json({ success: true, banner });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ Update banner
export const updateBanner = async (req, res) => {
  try {
    const { text, link, backgroundColor, textColor, isActive } = req.body;
    const banner = await Banner.findById(req.params.id);

    if (!banner) return res.status(404).json({ success: false, message: "Banner not found" });

    let imagePath = banner.image;
    if (req.file) {
      imagePath = `/uploads/banners/${req.file.filename}`;
    }

    // If we are setting this one to active, deactivate all others
    if ((isActive === "true" || isActive === true) && !banner.isActive) {
      await Banner.updateMany({}, { isActive: false });
    }

    banner.text = text || banner.text;
    banner.link = link !== undefined ? link : banner.link;
    banner.backgroundColor = backgroundColor || banner.backgroundColor;
    banner.textColor = textColor || banner.textColor;
    banner.isActive = isActive !== undefined ? (isActive === "true" || isActive === true) : banner.isActive;
    banner.image = imagePath;

    await banner.save();
    res.status(200).json({ success: true, banner });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ Toggle active status
export const toggleBannerActive = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return res.status(404).json({ success: false, message: "Banner not found" });

    const newStatus = !banner.isActive;

    if (newStatus) {
      // If we are activating this one, deactivate all others
      await Banner.updateMany({}, { isActive: false });
    }

    banner.isActive = newStatus;
    await banner.save();

    res.status(200).json({ success: true, banner });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ Delete banner
export const deleteBanner = async (req, res) => {
  try {
    await Banner.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Banner deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

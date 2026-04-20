import Review from "../models/Review.js";

// ✅ Get all reviews
export const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.status(200).json(reviews);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// ✅ Create a new review
export const createReview = async (req, res) => {
  try {
    const { name, occasion, rating, text, image, published } = req.body;
    
    // Automatic properties
    const curatedColors = ['#fff9f9', '#f9fff9', '#f9f9ff', '#fffdf9', '#fdf9ff'];
    const randomColor = curatedColors[Math.floor(Math.random() * curatedColors.length)];
    const randomRotation = (Math.random() * 6 - 3).toFixed(1); // -3 to +3 degrees

    // Handle image upload path
    let imageUrl = image;
    if (req.file) {
      imageUrl = `/${req.file.path.replace(/\\/g, '/')}`; // Ensure proper path formatting
    }

    const newReview = new Review({
      name,
      occasion,
      rating,
      text,
      image: imageUrl,
      bg: req.body.bg || randomColor,
      rotation: req.body.rotation || randomRotation,
      published,
    });
    await newReview.save();
    res.status(201).json({ message: "Review added successfully", review: newReview });
  } catch (err) {
    res.status(400).json({ message: "Failed to add review", error: err.message });
  }
};

// ✅ Update a review
export const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    if (req.file) {
      updateData.image = `/${req.file.path.replace(/\\/g, '/')}`;
    }

    const updatedReview = await Review.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
    if (!updatedReview) {
      return res.status(404).json({ message: "Review not found" });
    }
    res.status(200).json({ message: "Review updated successfully", review: updatedReview });
  } catch (err) {
    res.status(400).json({ message: "Update failed", error: err.message });
  }
};

// ✅ Delete a review
export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedReview = await Review.findByIdAndDelete(id);
    if (!deletedReview) {
      return res.status(404).json({ message: "Review not found" });
    }
    res.status(200).json({ message: "Review deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed", error: err.message });
  }
};

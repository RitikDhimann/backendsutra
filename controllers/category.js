import Category from "../models/categoriesSchemma.js";
import Product from "../models/ProductScheema.js";

// ✅ Create new category
export const createCategory = async (req, res) => {
  try {
    const { name, products, parent, type } = req.body;

    // 🧩 Validate category name
    if (!name)
      return res.status(400).json({ success: false, message: "Category name is required" });

    // 🧠 Check if category already exists
    const existingCategory = await Category.findOne({ name });
    if (existingCategory)
      return res.status(400).json({ success: false, message: "Category already exists" });

    // ✅ If products provided, validate all exist
    let validProducts = [];
    if (products && products.length > 0) {
      const foundProducts = await Product.find({ _id: { $in: products } });

      if (foundProducts.length !== products.length) {
        const missingIds = products.filter(
          (id) => !foundProducts.some((p) => p._id.toString() === id)
        );
        return res.status(400).json({
          success: false,
          message: "Some products not found",
          missingProductIds: missingIds,
        });
      }

      validProducts = foundProducts.map((p) => p._id);
    }

    // 🆕 Create category
    const category = new Category({
      name,
      products: validProducts,
      parent: parent || null,
      type: type || "product",
    });

    await category.save();

    // 🔄 Sync products: Update productCategory for all added products
    if (validProducts.length > 0) {
      await Product.updateMany(
        { _id: { $in: validProducts } },
        { $set: { productCategory: name } }
      );
    }

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      category,
    });
  } catch (err) {
    console.error("Error creating category:", err);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: err.message,
    });
  }
};


// ✅ Get all categories with products populated
export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find()
      .populate("products")
      .populate("parent", "name")
      .lean();
    res.status(200).json({ success: true, total: categories.length, categories });
  } catch (err) {
    console.error("Error fetching categories:", err);
    res.status(500).json({ success: false, message: "Server Error", error: err.message });
  }
};

// ✅ Get single category by ID
export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id).populate("products");
    if (!category) return res.status(404).json({ success: false, message: "Category not found" });

    res.status(200).json({ success: true, category });
  } catch (err) {
    console.error("Error fetching category:", err);
    res.status(500).json({ success: false, message: "Server Error", error: err.message });
  }
};

// ✅ Update category (name or products)
export const updateCategory = async (req, res) => {
  try {
    const { name, products, parent, type } = req.body;
    const category = await Category.findById(req.params.id);

    if (!category) return res.status(404).json({ success: false, message: "Category not found" });

    const oldName = category.name;
    const oldProducts = category.products.map(p => p.toString());

    if (name) category.name = name;
    if (products) category.products = products;
    if (parent !== undefined) category.parent = parent || null;
    if (type) category.type = type;

    await category.save();

    // 🔄 Sync products
    const newName = category.name;
    const newProducts = category.products.map(p => p.toString());

    // 1. If name changed, update ALL products that are CURRENTLY in this category
    if (newName !== oldName) {
      await Product.updateMany(
        { _id: { $in: newProducts } },
        { $set: { productCategory: newName } }
      );
    }

    // 2. If products list changed
    if (products) {
      // Products added to this category
      const added = newProducts.filter(id => !oldProducts.includes(id));
      if (added.length > 0) {
        await Product.updateMany(
          { _id: { $in: added } },
          { $set: { productCategory: newName } }
        );
      }

      // Products removed from this category
      const removed = oldProducts.filter(id => !newProducts.includes(id));
      if (removed.length > 0) {
        // Only clear productCategory if it currently matches this category name (to avoid overwriting if assigned elsewhere)
        await Product.updateMany(
          { _id: { $in: removed, productCategory: oldName } },
          { $set: { productCategory: "" } }
        );
      }
    }

    res.status(200).json({ success: true, message: "Category updated successfully", category });
  } catch (err) {
    console.error("Error updating category:", err);
    res.status(500).json({ success: false, message: "Server Error", error: err.message });
  }
};

// ✅ Delete category
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: "Category not found" });

    const categoryName = category.name;
    const productIds = category.products;

    await Category.findByIdAndDelete(req.params.id);

    // 🔄 Sync products: Clear productCategory for all products that were in this category
    if (productIds && productIds.length > 0) {
      await Product.updateMany(
        { _id: { $in: productIds }, productCategory: categoryName },
        { $set: { productCategory: "" } }
      );
    }

    res.status(200).json({ success: true, message: "Category deleted successfully" });
  } catch (err) {
    console.error("Error deleting category:", err);
    res.status(500).json({ success: false, message: "Server Error", error: err.message });
  }
};

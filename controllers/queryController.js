import Query from "../models/Query.js";

// ✅ Get all queries
export const getQueries = async (req, res) => {
  try {
    const queries = await Query.find().sort({ createdAt: -1 });
    res.status(200).json(queries);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// ✅ Create a new query (from website)
export const createQuery = async (req, res) => {
  try {
    const newQuery = new Query(req.body);
    await newQuery.save();
    res.status(201).json({ message: "Magic request sent successfully!", query: newQuery });
  } catch (err) {
    res.status(400).json({ message: "Submission failed", error: err.message });
  }
};

// ✅ Update query status (from admin)
export const updateQueryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updatedQuery = await Query.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );
    if (!updatedQuery) {
      return res.status(404).json({ message: "Query not found" });
    }
    res.status(200).json({ message: "Status updated successfully", query: updatedQuery });
  } catch (err) {
    res.status(400).json({ message: "Update failed", error: err.message });
  }
};

// ✅ Delete a query
export const deleteQuery = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedQuery = await Query.findByIdAndDelete(id);
    if (!deletedQuery) {
      return res.status(404).json({ message: "Query not found" });
    }
    res.status(200).json({ message: "Query deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed", error: err.message });
  }
};

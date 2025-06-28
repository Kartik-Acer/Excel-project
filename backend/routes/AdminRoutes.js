const express = require("express");
const User = require("../models/user");
const FileUpload = require("../models/upload");
const auth = require("../middleware/auth");

const router = express.Router();

// Get dashboard statistics
router.get("/statistics", auth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: "user" });
    const totalUploads = await FileUpload.countDocuments();
    const activeUsers = await User.countDocuments({
      role: "user",
    });

    // Get recent uploads
    const recentUploads = await FileUpload.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .limit(10);

    // Get upload statistics by month
    const uploadStats = await FileUpload.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
      { $limit: 12 },
    ]);

    res.json({
      totalUsers,
      totalUploads,
      activeUsers,
      recentUploads,
      uploadStats,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching stats", error: error.message });
  }
});

// Get all users
router.get("/users", auth, async (req, res) => {
  try {
    const users = await User.find({ role: "user" })
      .select("-password")
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching users", error: error.message });
  }
});

// Toggle user active status
router.patch("/users/:userId", auth, async (req, res) => {
  try {
    console.log(req);
    const user = await User.findById(req.params.userId);

    if (!user || user.role === "admin") {
      return res.status(404).json({ message: "User not found" });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      message: `User ${
        user.isActive ? "activated" : "deactivated"
      } successfully`,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Error updating user", error: error.message });
  }
});

// Delete user
router.delete("/users/:userId", auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user || user.role === "admin") {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete user's files
    await FileUpload.deleteMany({ userId: user._id });

    // Delete user
    await User.findByIdAndDelete(user._id);

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting user", error: error.message });
  }
});

module.exports = router;

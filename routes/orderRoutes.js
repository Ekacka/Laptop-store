const express = require("express");
const Order = require("../models/Order");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// Get orders (Protected)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.userId });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

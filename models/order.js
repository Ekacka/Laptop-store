const express = require("express");
const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
    userId: String,
    laptops: [{ name: String, price: Number }],
    total: Number,
});

const Order = mongoose.model("Order", OrderSchema);

const router = express.Router();

router.post("/orders", async (req, res) => {
    try {
        const { userId, laptops, total } = req.body;

        if (!userId || !laptops.length) {
            return res.status(400).json({ error: "Invalid order data." }); // ✅ Ensures one response
        }

        const newOrder = new Order({ userId, laptops, total });
        await newOrder.save();

        return res.json({ message: "Order placed successfully!" }); // ✅ Ensures one response
    } catch (error) {
        console.error("Order error:", error);
        return res.status(500).json({ error: "Server error" }); // ✅ Ensures one response
    }
});

module.exports = router;

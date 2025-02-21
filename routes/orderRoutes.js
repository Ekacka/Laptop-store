const express = require("express");
const Order = require("../models/Order");
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/orders", auth, async (req, res, next) => {
    try {
        const { username, laptops, total } = req.body;

        if (!username || !laptops.length) {
            return res.status(400).json({ error: "Invalid order data." });
        }

        // Создать новый заказ только с username
        const newOrder = new Order({ 
            username,
            laptops, 
            total 
        });

        await newOrder.save();
        return res.json({ message: "Order placed successfully!" });
    } catch (error) {
        next(error);
    }
});

module.exports = router;

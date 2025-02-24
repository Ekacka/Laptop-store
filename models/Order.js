const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
    username: { type: String, required: true },
    laptops: [{ name: String, price: Number }],
    total: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.Order || mongoose.model("Order", OrderSchema);

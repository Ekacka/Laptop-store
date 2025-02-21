const mongoose = require("mongoose");

const LaptopSchema = new mongoose.Schema({
    brand: String,
    model: String,
    price: Number,
    processor: String,
    ram: String,
    storage: String,
    graphics: String,
    availability: Boolean
});

module.exports = mongoose.model("Laptop", LaptopSchema);

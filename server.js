require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("./models/User");
const Laptop = require("./models/Laptop");

const app = express();
app.use(express.json());
app.use(cors());
app.use(cookieParser());

mongoose.connect(process.env.MONGO_URI, {

}).then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/users/register", async (req, res) => {
    console.log("📩 Incoming request:", req.body);
    if (!req.body.username || !req.body.password) {
        console.log("❌ Missing fields:", req.body);
        return res.status(400).json({ error: "Username and password are required" });
    }

    const { username, password } = req.body;

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            console.log("⚠️ User already exists:", username);
            return res.status(400).json({ error: "Username already exists" });
        }

        // ❌ Don't hash manually! Let Mongoose middleware handle it
        const newUser = new User({ username, password });

        await newUser.save();
        console.log("✅ User registered successfully!");
        res.json({ message: "User registered successfully!" });
    } catch (err) {
        console.error("❌ Registration error:", err);
        res.status(400).json({ error: "Registration failed", details: err.message });
    }
});




app.post("/users/login", async (req, res) => {
    const { username, password } = req.body;
    
    console.log("📩 Login attempt:", req.body); // Debug: Check received input

    const user = await User.findOne({ username });
    
    console.log("🔍 User found:", user); // Debug: Check if user is found

    if (!user) {
        return res.status(401).json({ error: "Invalid credentials (User not found)" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    
    console.log("🔑 Password match:", isMatch); // Debug: Check password comparison

    if (!isMatch) {
        return res.status(401).json({ error: "Invalid credentials (Password incorrect)" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    
    console.log("✅ Login successful! Token generated.");
    
    res.json({ token });
});


// Fetch all laptops
app.get("/api/laptops", async (req, res) => {
    const laptops = await Laptop.find();
    res.json(laptops);
});

const PORT = process.env.PORT || 3030;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Models
const User = require("./models/User");
const Laptop = require("./models/Laptop");

// Routes
const orderRoutes = require("./routes/orderRoutes");
const adminRoutes = require("./admin");  // 🔹 Import Admin Routes

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}));
app.use(cookieParser());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {})
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err));

// Serve static files
app.use(express.static(__dirname));

// Use Routes
app.use("/api", orderRoutes);
app.use("/admin", adminRoutes);  // 🔹 Enable Admin Routes

// Serve the main HTML file
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// Admin Dashboard UI
app.get("/admin", (req, res) => {
    res.sendFile(path.join(__dirname, "admin.html"));  // 🔹 Serve Admin Panel UI
});

// User Registration
app.post("/users/register", async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: "Username and password are required" });
        }

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: "Username already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        console.log("🔍 Обычный пароль:", password);
        console.log("🔍 Хешированный пароль:", hashedPassword);

        const newUser = new User({ username, password: hashedPassword });
        console.log("✅ Сохранение в БД:", newUser);
        await newUser.save();

        return res.json({ message: "User registered successfully!" });
    } catch (error) {
        console.error("❌ Ошибка регистрации:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// Логин
app.post("/users/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: "Username and password are required" });
        }

        const user = await User.findOne({ username });

        if (!user) {
            return res.status(401).json({ error: "User not found" });
        }



        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ error: "Incorrect password" });
        }

        if (!process.env.JWT_SECRET) {
            return res.status(500).json({ error: "JWT_SECRET is not set in environment variables" });
        }

        const token = jwt.sign({ userId: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.cookie("token", token, { httpOnly: true, secure: false });

        return res.json({ 
            token, 
            userId: user._id.toString()
        });
    } catch (error) {
        console.error("❌ Ошибка логина:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// Get Laptops
app.get("/api/laptops", async (req, res, next) => {
    try {
        const laptops = await Laptop.find();
        return res.json(laptops);
    } catch (error) {
        next(error);
    }
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error("🔥 Server Error:", err);
    if (!res.headersSent) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});


// Start Server
const PORT = process.env.PORT || 3030;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
    
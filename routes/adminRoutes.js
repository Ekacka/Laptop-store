const express = require("express");
const session = require("express-session");
const path = require("path");
const Laptop = require("./models/Laptop");
const Order = require("./models/order");

const router = express.Router();

// 🔹 Admin Credentials (Plain Text)
const ADMIN_USER = "admin";
const ADMIN_PASS = "admin123"; // Stored as plain text

// 🔹 Session Middleware
router.use(session({
    secret: "adminSecretKey",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// 🔹 Serve Admin Page
router.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "admin.html"));
});

// 🔹 Check Authentication
router.get("/check-auth", (req, res) => {
    if (req.session.admin) {
        res.status(200).send("Authenticated");
    } else {
        res.status(403).send("Unauthorized");
    }
});

// 🔹 Admin Login (Plain Text Check)
router.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (username === ADMIN_USER && password === ADMIN_PASS) {
        req.session.admin = true;
        res.status(200).send("Login successful");
    } else {
        res.status(401).send("Invalid credentials");
    }
});

// 🔹 Admin Logout
router.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.status(200).send("Logged out");
    });
});

// 🔹 Middleware to Check Admin Authentication
const requireAdmin = (req, res, next) => {
    if (!req.session.admin) {
        return res.status(403).send("Unauthorized: Please log in first");
    }
    next();
};

// 🔹 Fetch All Laptops
router.get("/laptops", requireAdmin, async (req, res) => {
    try {
        const laptops = await Laptop.find();
        res.json(laptops);
    } catch (error) {
        res.status(500).json({ error: "Error fetching laptops" });
    }
});

// 🔹 Add a New Laptop
router.post("/add", requireAdmin, async (req, res) => {
    try {
        const { brand, model, price, processor, ram, storage, graphics, availability } = req.body;
        const newLaptop = new Laptop({ brand, model, price, processor, ram, storage, graphics, availability });
        await newLaptop.save();
        res.json({ message: "Laptop added successfully!" });
    } catch (error) {
        res.status(500).json({ error: "Error adding laptop" });
    }
});

// 🔹 Update a Laptop
router.post("/update/:id", requireAdmin, async (req, res) => {
    try {
        const updatedLaptop = await Laptop.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedLaptop);
    } catch (error) {
        res.status(500).json({ error: "Error updating laptop" });
    }
});

// 🔹 Delete a Laptop
router.post("/delete/:id", requireAdmin, async (req, res) => {
    try {
        await Laptop.findByIdAndDelete(req.params.id);
        res.json({ message: "Laptop deleted successfully!" });
    } catch (error) {
        res.status(500).json({ error: "Error deleting laptop" });
    }
});
router.get("/best-selling", async (req, res) => {
    try {
        const bestSelling = await Order.aggregate([
            { $unwind: "$laptops" },
            { $group: { _id: "$laptops.name", totalSold: { $sum: 1 } } },
            { $sort: { totalSold: -1 } },
            { $limit: 10 },
            { $project: { _id: 0, laptop: "$_id", totalSold: 1 } }
        ]);

        res.json(bestSelling);
    } catch (error) {
        console.error("Error fetching best-selling laptops:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


module.exports = router;

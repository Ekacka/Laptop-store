const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const User = require("../models/User");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

const passwordSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  password: Joi.string()
    .min(8)
    .max(30)
    .pattern(new RegExp("(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}"))
    .required()
    .messages({
      "string.pattern.base": "Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character.",
      "string.min": "Password must be at least 8 characters long.",
      "string.max": "Password must be no more than 30 characters long."
    })
});

router.post("/register", async (req, res) => {
  try {
    const { error } = passwordSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { username, password } = req.body;

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    return res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ error: "JWT_SECRET is not set in environment variables" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, { httpOnly: true, secure: false });

    return res.json({
      token,
      userName: user.username.toString()
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("token").json({ message: "Logged out successfully" });
});

router.get("/profile", authMiddleware, async (req, res) => {
  try {
      const user = await User.findById(req.userId).select("-password");
      if (!user) {
          return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
  } catch (error) {
      console.error("🔥 Profile Error:", error);
      res.status(500).json({ error: "Server error" });
  }
});

// Update User Profile
router.put("/profile", authMiddleware, async (req, res) => {
  try {
      const { username } = req.body;
      const user = await User.findByIdAndUpdate(
          req.userId,
          { username },
          { new: true, runValidators: true }
      ).select("-password");

      if (!user) {
          return res.status(404).json({ error: "User not found" });
      }

      res.json({ message: "Profile updated successfully", user });
  } catch (error) {
      console.error("🔥 Profile Update Error:", error);
      res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;

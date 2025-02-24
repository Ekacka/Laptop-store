const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    console.log("Cookies:", req.cookies);
    console.log("Headers:", req.headers.authorization);

    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Decoded Token:", decoded);  // Debug: Check extracted ID
        req.userId = decoded.id;
        next();
    } catch (error) {
        console.error("JWT Error:", error);
        res.status(401).json({ error: "Invalid token" });
    }
};

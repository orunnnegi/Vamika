const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const router = express.Router();

// 📌 Helper function to validate email format
const isValidEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
};

// 📌 Helper function to validate mobile numbers (India format)
const isValidPhoneNumber = (number) => {
    const phoneRegex = /^\+91[6-9]\d{9}$/;  // Indian phone numbers starting with 6,7,8,9
    return phoneRegex.test(number);
};

// 🔹 Signup Route
router.post("/signup", async (req, res) => {
    try {
        console.log("🔹 Signup request received:", req.body);

        const { name, age, email, password, securityNumbers } = req.body;

        // ✅ Validate all fields
        if (!name || !age || !email || !password || !securityNumbers) {
            return res.status(400).json({ message: "All fields are required!" });
        }

        // ✅ Ensure age is a valid number
        if (isNaN(age) || age < 10 || age > 100) {
            return res.status(400).json({ message: "Invalid age! Must be between 10 and 100." });
        }

        // ✅ Validate email format
        if (!isValidEmail(email)) {
            return res.status(400).json({ message: "Invalid email format!" });
        }

        // ✅ Check if email already exists
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: "User already exists with this email!" });

        // ✅ Ensure exactly 3 security numbers are provided
        if (!Array.isArray(securityNumbers) || securityNumbers.length !== 3) {
            return res.status(400).json({ message: "Exactly 3 security numbers are required!" });
        }

        // ✅ Validate each security number
        for (let number of securityNumbers) {
            if (!isValidPhoneNumber(number)) {
                return res.status(400).json({ message: `Invalid phone number: ${number}. Use +91XXXXXXXXXX format.` });
            }
        }

        // ✅ Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // ✅ Create and save user
        user = new User({ name, age, email, password: hashedPassword, securityNumbers });
        await user.save();

        console.log("✅ User registered successfully:", user);
        res.status(201).json({ message: "User registered successfully" });

    } catch (error) {
        console.error("🔥 Signup error:", error);
        res.status(500).json({ message: "Server error", error });
    }
});

// 🔹 Login Route
router.post("/login", async (req, res) => {
    try {
        console.log("🔹 Login request received:", req.body);

        const { email, password } = req.body;

        // ✅ Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            console.log("❌ User not found");
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // ✅ Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log("❌ Incorrect password");
            return res.status(400).json({ message: "Invalid credentials" });
        }

        console.log("✅ Login successful for:", user.email);
        res.status(200).json({ message: "Login successful", user });

    } catch (error) {
        console.error("🔥 Login error:", error);
        res.status(500).json({ message: "Server error", error });
    }
});

module.exports = router;

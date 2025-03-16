const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");


const router = express.Router();

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

// Helper function to validate email format
const isValidEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
};

// Signup route
router.post("/signup", async (req, res) => {
    try {
        const { name, age, email, password } = req.body;

        // Validate input fields
        if (!name || !Number(age) || !email || !password) {
            return res.status(400).json({ message: "All fields are required!" });
        }

        const ageNum = Number(age);
        if (isNaN(ageNum) || ageNum < 10 || ageNum > 100) {
            return res.status(400).json({ message: "Invalid age! Must be between 10 and 100." });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({ message: "Invalid email format!" });
        }

        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists!" });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const user = new User({ name, age: ageNum, email, password: hashedPassword });
        await user.save();

        res.status(201).json({ message: "User registered successfully" });

    } catch (error) {
        console.error("🔥 Signup Error:", error);
        res.status(500).json({ message: "Server Error", error });
    }
});

// Login route
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input fields
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required!" });
        }

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Generate JWT token
        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });

        res.status(200).json({ message: "Login successful", token });

    } catch (error) {
        console.error("🔥 Login Error:", error);
        res.status(500).json({ message: "Server Error", error });
    }
});

module.exports = router;

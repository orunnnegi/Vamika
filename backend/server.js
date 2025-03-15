const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const axios = require("axios"); // Make sure axios is installed (npm install axios)

// ✅ Google News RSS Proxy Route
app.get("/api/proxy", async (req, res) => {
    try {
        const newsUrl = req.query.url;
        if (!newsUrl) {
            return res.status(400).json({ error: "Missing URL parameter" });
        }

        // Fetch the RSS feed from Google News
        const response = await axios.get(newsUrl, {
            headers: { "User-Agent": "Mozilla/5.0" } // Mimic a browser request
        });

        res.send(response.data); // Send raw RSS feed data to the frontend
    } catch (error) {
        console.error("🔥 Error fetching RSS feed:", error.message);
        res.status(500).json({ error: "Failed to fetch RSS feed", details: error.message });
    }
});

mongoose.connect("mongodb://localhost:27017/Vamika", {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB Connected..."))
.catch(err => console.error("❌ MongoDB Connection Error:", err));

const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

// 🔹 Global Error Handling Middleware
app.use((err, req, res, next) => {
    console.error("🔥 Unexpected Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

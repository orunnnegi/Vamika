const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    age: { type: Number, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    securityNumbers: { type: [String], required: true },  // ✅ Ensure this is present
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("User", UserSchema);

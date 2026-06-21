const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const Expense = require("./models/Expense");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../")));

// Routes
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../index.html"));
});

// 🔥 IMPORTANT: MongoDB Atlas Connection
mongoose.connect("mongodb+srv://varshini:varshini2007@cluster0.sb231xe.mongodb.net/expenseTracker?retryWrites=true&w=majority")
.then(() => {
    console.log("Database Connected");
})
.catch((err) => {
    console.log("MongoDB Error:", err.message);
});

// 🔥 IMPORTANT: Server MUST run independently (FIX)
app.listen(3000, () => {
    console.log("Server running on port 3000");
});

// ---------------- API ROUTES ----------------

// Add Expense
app.post("/addExpense", async (req, res) => {
    try {
        const expense = new Expense(req.body);
        await expense.save();

        res.json({
            message: "Expense Saved Successfully"
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// Get Expenses
app.get("/getExpenses", async (req, res) => {
    try {
        const expenses = await Expense.find();
        res.json(expenses);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});
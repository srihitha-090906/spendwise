require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json());

// --- MongoDB connection (cached so it also works on Vercel serverless) ---
let connection = null;
async function connectDB() {
  if (!connection) connection = mongoose.connect(process.env.MONGO_URI);
  return connection;
}
app.use(async (req, res, next) => {
  try { await connectDB(); next(); }
  catch (err) { connection = null; res.status(500).json({ message: 'Database connection failed' }); }
});

// --- Model ---
const expenseSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Title is required'], trim: true },
    amount: { type: Number, required: [true, 'Amount is required'], min: [0.01, 'Amount must be above 0'] },
    category: {
      type: String,
      enum: ['Food', 'Transport', 'Rent', 'Shopping', 'Health', 'Education', 'Other'],
      default: 'Other',
    },
    date: { type: Date, default: Date.now },
    note: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);
const Expense = mongoose.models.Expense || mongoose.model('Expense', expenseSchema);

// --- REST API ---
app.get('/', (req, res) => res.json({ message: 'SpendWise API is running' }));

// READ all (optional ?category=Food)
app.get('/api/expenses', async (req, res) => {
  const filter = req.query.category ? { category: req.query.category } : {};
  res.json(await Expense.find(filter).sort({ date: -1 }));
});

// CREATE
app.post('/api/expenses', async (req, res) => {
  try { res.status(201).json(await Expense.create(req.body)); }
  catch (err) { res.status(400).json({ message: err.message }); }
});

// UPDATE
app.put('/api/expenses/:id', async (req, res) => {
  try {
    const updated = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ message: 'Expense not found' });
    res.json(updated);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// DELETE
app.delete('/api/expenses/:id', async (req, res) => {
  try {
    const removed = await Expense.findByIdAndDelete(req.params.id);
    if (!removed) return res.status(404).json({ message: 'Expense not found' });
    res.json({ message: 'Expense deleted' });
  } catch (err) { res.status(400).json({ message: err.message }); }
});

const PORT = process.env.PORT || 5000;
if (!process.env.VERCEL) app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

module.exports = app;

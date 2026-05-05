const mongoose = require('mongoose');
const { Schema } = mongoose;

// ── Crop ──────────────────────────────────────────────────────────────────────
const cropSchema = new Schema({
  name:        { type: String, required: true, trim: true },
  season:      { type: String, required: true },
  stage:       { type: String, enum: ['Sowing','Growing','Flowering','Harvest','Done'], default: 'Sowing' },
  sowDate:     { type: String, default: '' },
}, { timestamps: true });

// ── Expense ───────────────────────────────────────────────────────────────────
const expenseSchema = new Schema({
  cropId:   { type: Schema.Types.ObjectId, ref: 'Crop', default: null },
  category: { type: String, required: true },
  amount:   { type: Number, required: true, min: 0 },
  date:     { type: String, required: true },
  desc:     { type: String, required: true, trim: true },
  notes:    { type: String, default: '' },
}, { timestamps: true });

// ── Income ────────────────────────────────────────────────────────────────────
const incomeSchema = new Schema({
  cropId:   { type: Schema.Types.ObjectId, ref: 'Crop', default: null },
  source:   { type: String, required: true, trim: true },   // e.g. "Paddy sale", "Subsidy"
  amount:   { type: Number, required: true, min: 0 },
  date:     { type: String, required: true },
  qty:      { type: String, default: '' },                  // e.g. "12 bags", "500 kg"
  notes:    { type: String, default: '' },
}, { timestamps: true });

// ── Organic Input (made on farm) ──────────────────────────────────────────────
const inputSchema = new Schema({
  cropId:      { type: Schema.Types.ObjectId, ref: 'Crop', default: null },
  name:        { type: String, required: true, trim: true },  // e.g. "Panchakavya"
  type:        { type: String, required: true },               // from INPUT_TYPES
  date:        { type: String, required: true },
  quantity:    { type: String, required: true },               // e.g. "10 litres", "3 bags"
  costMade:    { type: Number, default: 0 },                  // cost to make
  marketValue: { type: Number, default: 0 },                  // market equivalent value
  notes:       { type: String, default: '' },
}, { timestamps: true });

module.exports = {
  Crop:    mongoose.model('Crop',    cropSchema),
  Expense: mongoose.model('Expense', expenseSchema),
  Income:  mongoose.model('Income',  incomeSchema),
  Input:   mongoose.model('Input',   inputSchema),
};

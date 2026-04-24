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

module.exports = {
  Crop:    mongoose.model('Crop',    cropSchema),
  Expense: mongoose.model('Expense', expenseSchema),
};

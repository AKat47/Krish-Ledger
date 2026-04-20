const mongoose = require('mongoose');
const { Schema } = mongoose;

// ── Plot ──────────────────────────────────────────────────────────────────────
const plotSchema = new Schema({
  name:  { type: String, required: true, trim: true },
  acres: { type: Number, required: true, min: 0 },
}, { timestamps: true });

// ── Crop ──────────────────────────────────────────────────────────────────────
const cropSchema = new Schema({
  name:        { type: String, required: true, trim: true },
  plotId:      { type: Schema.Types.ObjectId, ref: 'Plot', required: true },
  season:      { type: String, required: true },
  stage:       { type: String, enum: ['Sowing','Growing','Flowering','Harvest','Done'], default: 'Sowing' },
  sowDate:     { type: String },
  harvestDate: { type: String, default: null },
}, { timestamps: true });

// ── Expense ───────────────────────────────────────────────────────────────────
const expenseSchema = new Schema({
  cropId:   { type: Schema.Types.ObjectId, ref: 'Crop', required: true },
  category: { type: String, enum: ['Labour','Inputs','Irrigation','Misc'], required: true },
  amount:   { type: Number, required: true, min: 0 },
  date:     { type: String, required: true },
  note:     { type: String, default: '' },
}, { timestamps: true });

// ── Labour Log ────────────────────────────────────────────────────────────────
const labourSchema = new Schema({
  cropId:     { type: Schema.Types.ObjectId, ref: 'Crop', required: true },
  date:       { type: String, required: true },
  workers:    { type: Number, required: true, min: 1 },
  hours:      { type: Number, default: 8 },
  wagePerDay: { type: Number, required: true, min: 0 },
  task:       { type: String, required: true, trim: true },
}, { timestamps: true });

// ── Material / Inventory ──────────────────────────────────────────────────────
const materialSchema = new Schema({
  name:        { type: String, required: true, trim: true },
  category:    { type: String, enum: ['Seeds','Fertilizer','Pesticide','Tools','Other'], required: true },
  qty:         { type: Number, required: true, min: 0 },
  unit:        { type: String, required: true },
  costPerUnit: { type: Number, required: true, min: 0 },
}, { timestamps: true });

// ── Manure / Biofertilizer Log ────────────────────────────────────────────────
const manureSchema = new Schema({
  plotId:   { type: Schema.Types.ObjectId, ref: 'Plot', required: true },
  type:     { type: String, enum: ['FYM','Vermicompost','Green Manure','Compost','Liquid Biofertilizer'], required: true },
  quantity: { type: Number, required: true, min: 0 },
  unit:     { type: String, required: true },
  date:     { type: String, required: true },
  notes:    { type: String, default: '' },
}, { timestamps: true });

// ── Yield ─────────────────────────────────────────────────────────────────────
const yieldSchema = new Schema({
  cropId:    { type: Schema.Types.ObjectId, ref: 'Crop', required: true },
  quantity:  { type: Number, required: true, min: 0 },
  unit:      { type: String, required: true },
  salePrice: { type: Number, required: true, min: 0 },
  date:      { type: String, required: true },
}, { timestamps: true });

module.exports = {
  Plot:     mongoose.model('Plot',     plotSchema),
  Crop:     mongoose.model('Crop',     cropSchema),
  Expense:  mongoose.model('Expense',  expenseSchema),
  Labour:   mongoose.model('Labour',   labourSchema),
  Material: mongoose.model('Material', materialSchema),
  Manure:   mongoose.model('Manure',   manureSchema),
  Yield:    mongoose.model('Yield',    yieldSchema),
};

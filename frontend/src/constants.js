// ── Tamil seasons ─────────────────────────────────────────────────────────────
export const SEASONS = [
  'சித்திரை (Chitirai)',
  'வைகாசி (Vaikasi)',
  'ஆனி (Aani)',
  'ஆடி (Aadi)',
  'ஆவணி (Aavani)',
  'புரட்டாசி (Purattasi)',
  'ஐப்பசி (Aippasi)',
  'கார்த்திகை (Karthigai)',
  'மார்கழி (Margazhi)',
  'தை (Thai)',
  'மாசி (Maasi)',
  'பங்குனி (Panguni)',
];

// ── Expense categories ────────────────────────────────────────────────────────
export const EXP_CATS = [
  'Farm Setup',
  'Farm Maintenance',
  'Labour',
  'Travel',
  'Electricity',
  'Seeds & Inputs',
  'Tractor Rent',
  'Organic Inputs',
  'Other',
];

export const EXP_CAT_COLORS = {
  'Farm Setup':       '#3B6D11',
  'Farm Maintenance': '#1D9E75',
  'Labour':           '#BA7517',
  'Travel':           '#D85A30',
  'Electricity':      '#185FA5',
  'Seeds & Inputs':   '#639922',
  'Tractor Rent':     '#854F0B',
  'Organic Inputs':   '#059669',
  'Other':            '#888780',
};

// ── Organic input types (made on farm) ───────────────────────────────────────
export const INPUT_TYPES = [
  'Panchakavya',
  'Jeevamrutham',
  'Beejamrutham',
  'Compost Tea',
  'Vermicompost',
  'Fish Amino Acid',
  'Neem Extract',
  'Cow Urine Spray',
  'FYM',
  'Green Manure',
  'Other',
];

// Approximate market savings per litre/kg for each input type
export const INPUT_MARKET_RATE = {
  'Panchakavya':      80,   // ₹/litre
  'Jeevamrutham':     30,
  'Beejamrutham':     50,
  'Compost Tea':      40,
  'Vermicompost':     12,   // ₹/kg
  'Fish Amino Acid':  150,
  'Neem Extract':     120,
  'Cow Urine Spray':  25,
  'FYM':              5,    // ₹/kg
  'Green Manure':     8,
  'Other':            0,
};

// ── Income sources ────────────────────────────────────────────────────────────
export const INCOME_SOURCES = [
  'Crop Sale',
  'Subsidy / Scheme',
  'Compost / Input Sale',
  'Contract Farming',
  'Rental Income',
  'Other',
];

// ── Crop stages ───────────────────────────────────────────────────────────────
export const STAGES = ['Sowing', 'Growing', 'Flowering', 'Harvest', 'Done'];

// ── Tabs ──────────────────────────────────────────────────────────────────────
export const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'expenses',  label: 'Expenses',  icon: '💸' },
  { id: 'income',    label: 'Income',    icon: '📈' },
  { id: 'inputs',    label: 'Inputs',    icon: '🌿' },
  { id: 'crops',     label: 'Crops',     icon: '🌾' },
];

// ── Design tokens ─────────────────────────────────────────────────────────────
export const C = {
  green900: '#173404',
  green800: '#27500A',
  green700: '#3B6D11',
  green600: '#4a8515',
  green400: '#639922',
  green200: '#97C459',
  green100: '#C0DD97',
  green50:  '#EAF3DE',
  amber400: '#BA7517',
  amber200: '#EF9F27',
  amber50:  '#FAEEDA',
  teal400:  '#1D9E75',
  teal50:   '#E1F5EE',
  coral400: '#D85A30',
  coral50:  '#FAECE7',
  blue400:  '#185FA5',
  blue50:   '#E8F0FA',
  gray900:  '#2C2C2A',
  gray700:  '#5F5E5A',
  gray400:  '#888780',
  gray200:  '#B4B2A9',
  gray100:  '#D3D1C7',
  gray50:   '#F1EFE8',
  surface:  '#fff',
  bg:       '#F7F5F0',
  text:     '#2C2C2A',
  muted:    '#5F5E5A',
  border:   'rgba(44,44,42,0.12)',
  borderSt: 'rgba(44,44,42,0.22)',
};

// ── Helpers ───────────────────────────────────────────────────────────────────
export const fmt     = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');
export const getId   = (d) => d?._id || d?.id;
export const fmtDate = (s) => {
  if (!s) return '';
  return new Date(s).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' });
};
export const thisMonthKey = () => {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}`;
};
export const monthKey = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

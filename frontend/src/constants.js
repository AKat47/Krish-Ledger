// ── Tamil seasons (12 months) ─────────────────────────────────────────────────
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
export const CATS = [
  'Farm Setup',
  'Farm Maintenance',
  'Labour',
  'Travel',
  'Electricity',
  'Seeds & Inputs',
  'Tractor Rent',
  'Other',
];

export const CAT_COLORS = {
  'Farm Setup':        '#3B6D11',
  'Farm Maintenance':  '#1D9E75',
  'Labour':            '#BA7517',
  'Travel':            '#D85A30',
  'Electricity':       '#185FA5',
  'Seeds & Inputs':    '#639922',
  'Tractor Rent':      '#854F0B',
  'Other':             '#888780',
};

// ── Crop stage lifecycle ──────────────────────────────────────────────────────
export const STAGES = ['Sowing', 'Growing', 'Flowering', 'Harvest', 'Done'];

// ── Design tokens (matches reference palette) ─────────────────────────────────
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
export const fmt    = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');
export const getId  = (d) => d?._id || d?.id;
export const fmtDate = (s) => {
  if (!s) return '';
  const d = new Date(s);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' });
};

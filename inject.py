"""
Usage: python inject.py Ayapakkam.xlsx https://krish-ledger.onrender.com
"""
import pandas as pd, requests, sys, re
from datetime import datetime, timedelta

if len(sys.argv) < 3:
    print("Usage: python inject.py <xlsx_file> <api_base_url>")
    sys.exit(1)

XLSX_FILE    = sys.argv[1]
API_BASE     = sys.argv[2].rstrip('/')
EXPENSES_URL = f"{API_BASE}/api/expenses"

def categorize(desc):
    d = str(desc).lower()
    if any(x in d for x in ['fuel','breakfast','meals']):          return 'Travel'
    if any(x in d for x in ['labour','worker','lineman']):         return 'Labour'
    if any(x in d for x in ['electricity','electricty','electric board']): return 'Electricity'
    if any(x in d for x in ['tractor']):                           return 'Tractor Rent'
    if any(x in d for x in ['seed','sowing','dhaincha','plant','bio fertilizer',
        'seaweed','decomposer','bicompost','vam','ghee','jaggery','neem',
        'fish amino','gypsum','weed','phospho']):                   return 'Seeds & Inputs'
    if any(x in d for x in ['bore','pipe','piping','hose','rod','cement','shed',
        'shade net','fence','iron','installation','material','soil',
        'levelling','puddling','red soil']):                        return 'Farm Setup'
    if any(x in d for x in ['spray','pongal']):                    return 'Farm Maintenance'
    return 'Other'

def parse_date(val, fallback_year=2025):
    if pd.isna(val):
        return None
    s = re.sub(r'\s+', ' ', str(val)).strip()

    # Excel serial number (e.g. 45707.0)
    if re.match(r'^\d{5}\.?0?$', s):
        try:
            n = int(float(s))
            if 40000 < n < 50000:
                return (datetime(1899, 12, 30) + timedelta(days=n)).strftime('%Y-%m-%d')
        except:
            pass

    # Remove ordinal suffixes: 6th -> 6, 1st -> 1, etc.
    clean = re.sub(r'(\d+)(st|nd|rd|th)', r'\1', s).strip()

    # Has a 4-digit year
    if re.search(r'\b\d{4}\b', clean):
        for fmt in ['%d %B %Y', '%d %b %Y', '%d/%m/%Y', '%Y-%m-%d', '%d-%m-%Y']:
            try:
                return datetime.strptime(clean, fmt).strftime('%Y-%m-%d')
            except:
                pass
        try:
            return pd.to_datetime(clean, dayfirst=True, format='mixed').strftime('%Y-%m-%d')
        except:
            pass

    # Partial date without year e.g. "15 August", "9 Dec"
    # Explicitly construct with fallback year to avoid Python 3.15 ambiguity warning
    for fmt in ['%d %B', '%d %b']:
        try:
            parsed = datetime.strptime(clean + f' {fallback_year}', fmt + ' %Y')
            return parsed.strftime('%Y-%m-%d')
        except:
            pass

    return None

# ── Load workbook ─────────────────────────────────────────────────────────────
print(f"\nReading {XLSX_FILE} ...")
xl = pd.read_excel(XLSX_FILE, sheet_name=None, header=None)
print(f"Sheets found: {list(xl.keys())}\n")

records = []

# ── Expenses sheet ────────────────────────────────────────────────────────────
if 'Expenses' in xl:
    for i, row in xl['Expenses'].iterrows():
        if i == 0:
            continue  # skip header
        try:
            raw_date = row.iloc[1] if len(row) > 1 else None
            raw_amt  = row.iloc[2] if len(row) > 2 else None
            raw_desc = row.iloc[3] if len(row) > 3 else None
            if pd.isna(raw_amt) or pd.isna(raw_date):
                continue
            amount = float(raw_amt)
            if amount <= 0:
                continue
            date = parse_date(raw_date)
            if not date:
                continue
            desc = str(raw_desc).strip() if not pd.isna(raw_desc) else 'Miscellaneous'
            if desc in ('nan', '??', ''):
                desc = 'Miscellaneous'
            records.append({
                'date': date, 'amount': amount, 'desc': desc,
                'category': categorize(desc), 'notes': '', 'cropId': None
            })
        except:
            continue

# ── Rice Cultivation sheet ────────────────────────────────────────────────────
if 'Rice Cultivation' in xl:
    for _, row in xl['Rice Cultivation'].iterrows():
        try:
            raw_date = row.iloc[0] if len(row) > 0 else None
            raw_desc = row.iloc[1] if len(row) > 1 else None
            raw_amt  = row.iloc[2] if len(row) > 2 else None
            raw_note = row.iloc[3] if len(row) > 3 else ''
            if pd.isna(raw_amt) or pd.isna(raw_date):
                continue
            amount = float(raw_amt)
            if amount <= 0:
                continue
            date = parse_date(raw_date)
            if not date:
                continue
            desc  = str(raw_desc).strip() if not pd.isna(raw_desc) else 'Rice expense'
            notes = str(raw_note).strip() if not pd.isna(raw_note) else ''
            if notes == 'nan':
                notes = ''
            records.append({
                'date': date, 'amount': amount, 'desc': desc,
                'category': categorize(desc), 'notes': notes, 'cropId': None
            })
        except:
            continue

# ── Preview ───────────────────────────────────────────────────────────────────
print(f"{'─'*72}")
print(f"  {len(records)} records  ·  ₹{sum(r['amount'] for r in records):,.0f} total")
print(f"  Posting to: {EXPENSES_URL}")
print(f"{'─'*72}")
print(f"{'DATE':<13} {'AMOUNT':>10}  {'CATEGORY':<20} DESCRIPTION")
print(f"{'─'*72}")
for r in records:
    print(f"  {r['date']:<13} ₹{r['amount']:>8,.0f}  {r['category']:<20} {r['desc'][:32]}")
print(f"{'─'*72}\n")

confirm = input("Proceed with import? (y/n): ").strip().lower()
if confirm != 'y':
    print("Aborted.")
    sys.exit(0)

# ── POST to API ───────────────────────────────────────────────────────────────
print()
ok = fail = 0
for r in records:
    try:
        res = requests.post(EXPENSES_URL, json=r, timeout=20)
        if res.status_code == 201:
            ok += 1
            print(f"  ✅  {r['date']}  ₹{r['amount']:>8,.0f}  {r['category']:<20} {r['desc'][:28]}")
        else:
            fail += 1
            print(f"  ❌  {r['date']}  ₹{r['amount']:>8,.0f}  → HTTP {res.status_code}: {res.text[:60]}")
    except Exception as e:
        fail += 1
        print(f"  ❌  ERROR: {e}")

print(f"\n{'─'*72}")
print(f"  ✅  Inserted : {ok}")
print(f"  ❌  Failed   : {fail}")
print(f"  💰  Total    : ₹{sum(r['amount'] for r in records):,.0f}")
print(f"{'─'*72}\n")

# WZ Code Translation Maintenance Guide

## Quick Reference

Your WZ code translation system is **semi-automated** for easy maintenance as your database grows.

## Current Status

- ✅ **40 WZ codes** fully translated (German + English)
- 🔄 Semi-automated detection of new codes
- 📝 Ready-to-use templates for adding translations

---

## How to Check for New WZ Codes

Whenever you add new companies to the database, run:

```bash
npm run check-wz-codes
```

This will show you:
- ✅ Which codes are already translated
- ⚠️  Which codes need translation
- 📝 A ready-to-paste template for new codes

---

## How to Add New Translations

### Step 1: Run the Check Script

```bash
cd frontend
npm run check-wz-codes
```

### Step 2: Copy the Template

The script will output something like:

```typescript
'47.99.9': {
  de: 'TODO: Add German translation',
  en: 'Other retail sale not in stores n.e.c.',
},
```

### Step 3: Find Official German Translation

**Option A: Use Official WZ 2008 Classification**
1. Visit: https://www.klassifikationsserver.de/klassService/jsp/variant/variantList.jsf?nodeid=WZ2008
2. Search for the WZ code
3. Copy the official German description

**Option B: Quick Translation Tools**
- DeepL Translator (recommended for business terminology)
- Google Translate

### Step 4: Add to wz-codes.ts

1. Open `frontend/lib/wz-codes.ts`
2. Find the appropriate sector comment (Construction, Retail, etc.)
3. Paste the code entry with the German translation
4. Save the file

### Step 5: Verify

```bash
npm run check-wz-codes
```

Should show: `🎉 All WZ codes are translated!`

---

## Example Workflow

```bash
# 1. Add 50 new companies to database
# ...companies added via Supabase...

# 2. Check for new WZ codes
npm run check-wz-codes

# Output:
# ⚠️ Missing translations: 2
#
# '62.01.0': {
#   de: 'TODO: Add German translation',
#   en: 'Computer programming activities',
# },

# 3. Look up official translation
# 62.01.0 → "Programmierungstätigkeiten"

# 4. Add to wz-codes.ts:
'62.01.0': {
  de: 'Programmierungstätigkeiten',
  en: 'Computer programming activities',
},

# 5. Verify
npm run check-wz-codes
# 🎉 All WZ codes are translated!

# 6. Commit and deploy
git add lib/wz-codes.ts
git commit -m "Add WZ code 62.01.0 translation"
git push
```

---

## Frequency of Updates

**Recommended Schedule:**
- **Monthly**: Run `npm run check-wz-codes` to catch new codes
- **After bulk imports**: Always check when adding 10+ companies
- **Ad-hoc**: When you notice missing translations in the UI

**Typical Effort:**
- 2-5 minutes per new code
- Most updates will be 0-2 new codes

---

## Fallback Behavior

If a WZ code is not in the translation mapping:
1. The system falls back to the English description from northdata.com
2. In development, you'll see a console warning
3. The company will still display correctly (just in English)

**This means:** You can add new companies anytime. Translations can be added at your convenience.

---

## Industry Sectors Covered

Your current 40 codes cover:
- 🏗️ **Construction** (8 codes)
- 🛒 **Wholesale & Retail** (10 codes)
- 🏭 **Manufacturing** (3 codes)
- 🚚 **Transportation** (3 codes)
- 🏨 **Hospitality** (3 codes)
- 💻 **IT & Communication** (2 codes)
- 💼 **Professional Services** (3 codes)
- 🏥 **Healthcare & Social** (2 codes)
- 🏢 **Real Estate & Finance** (2 codes)
- 🚒 **Public Services** (1 code)
- 🎯 **Other Services** (3 codes)

---

## Migration to Database (Future Option)

If you find yourself:
- Adding 10+ new codes per month
- Updating translations frequently
- Needing non-technical users to manage codes

Consider migrating to the **database table approach** (documented in the plan file).

**Current approach is perfect for:**
- ✅ Stable WZ code set (40 codes)
- ✅ Infrequent new codes (0-5 per month)
- ✅ Developer-managed translations

---

## Troubleshooting

**Script not working?**
```bash
npm install --save-dev tsx dotenv
npm run check-wz-codes
```

**Missing .env.local?**
- Make sure you have `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`

**Code shows in English on German site?**
1. Run `npm run check-wz-codes`
2. Add the missing translation
3. Restart dev server: `npm run dev`

---

## Files

- **Translation mapping**: `frontend/lib/wz-codes.ts`
- **Check script**: `frontend/scripts/extract-wz-codes.ts`
- **npm command**: `npm run check-wz-codes`

---

**Last Updated**: All 40 codes translated (Feb 2026)

# 🚀 Quick Setup Guide - Shop Registration Fix

## ✅ What This Script Fixes

Based on your Google Sheet analysis, here are the issues that will be fixed:

### Issue 1: Column A - Timestamp ✅
- **Problem:** Only showing date, missing time
- **Fix:** Ensures format `M/d/yyyy H:mm:ss` (e.g., 12/5/2024 18:40:37)

### Issue 2: Column H - Business Details ✅
- **Problem:** Showing "Slot Time" instead of "Business Details"
- **Fix:** This is a **Google Form issue** - see Form Fix section below

### Issue 3: Column L - Verified ✅
- **Problem:** Not defaulting to FALSE
- **Fix:** Auto-sets to FALSE on form submission

### Issue 4: Column N - QR Image ✅
- **Problem:** Showing `#NAME?` errors, not blank by default
- **Fix:** Clears on submission, generates correct IMAGE formula when verified

### Issue 5: Column O - Shop ID ✅
- **Problem:** Sometimes appearing in Column Y
- **Fix:** Always generates in Column O (correct location)

### Issue 6: Columns AA & AB ✅
- **Problem:** Duplicate data
- **Fix:** Auto-clears these columns

### Issue 7: Columns R-X ✅
- **Problem:** Not defaulting to 0
- **Fix:** Sets all booking counters to 0

---

## 📥 Installation (5 Minutes)

### Step 1: Open Apps Script
1. Open your sheet: https://docs.google.com/spreadsheets/d/1aZ26GJtxYCCSrNkHlAXfPEN5E4IwBHqK6C9MioA121s/edit
2. Click **Extensions** → **Apps Script**

### Step 2: Replace Code
1. **Select ALL existing code** in the editor (Ctrl+A)
2. **Delete it** (Delete key)
3. Open file: `ShopRegistrationScript_FINAL.gs`
4. **Copy ALL the code**
5. **Paste** into Apps Script editor
6. Click **Save** (💾 icon)

### Step 3: Run Installation
1. In the function dropdown (top), select **`installTriggers`**
2. Click **Run** (▶️ icon)
3. **Authorization popup will appear:**
   - Click "Review Permissions"
   - Select your Google account
   - Click "Advanced"
   - Click "Go to [Project Name] (unsafe)"
   - Click "Allow"
4. Wait for success message

### Step 4: Fix Existing Data (Optional but Recommended)
1. In function dropdown, select **`fixAllExistingRows`**
2. Click **Run**
3. Click "Yes" when prompted
4. Wait for completion

### Step 5: Fix Broken QR Codes (If you have #NAME? errors)
1. In function dropdown, select **`fixBrokenQRCodes`**
2. Click **Run**
3. Wait for completion

---

## 🧪 Testing

### Test 1: Submit New Form
1. Submit a test entry through your form
2. Check the new row:
   - ✅ Column A: Has date AND time
   - ✅ Column L: Shows FALSE
   - ✅ Column N: Is blank
   - ✅ Columns R-X: All show 0
   - ✅ Columns AA, AB: Empty

### Test 2: Verify a Shop
1. Find a test row
2. Click Column L checkbox (set to TRUE)
3. Wait 2-3 seconds
4. Check:
   - ✅ Column O: Has Shop ID (SHOP0002)
   - ✅ Column M: Has form link
   - ✅ Column N: Has QR code image (no #NAME? error)
   - ✅ Email sent

---

## 🔧 Fix Column H Issue (Google Form)

**This is NOT a script issue** - it's how your form is configured.

### Option 1: Check Form Question Order
1. Open your Google Form
2. Check the order of questions
3. Make sure "Business Details" comes BEFORE "Slot Time"
4. The form sends data to columns in the order questions appear

### Option 2: Rearrange Form Questions
1. In your form, drag questions to reorder them
2. Ensure this order:
   - Shop Name → Column C
   - Email → Column D
   - Phone → Column E
   - Address → Column F
   - City → Column G
   - **Business Details** → Column H ⚠️
   - Min Service Charge → Column I
   - Slot questions → Columns J, K, etc.

### Option 3: Check Pre-filled Link
1. In your form, click ⋮ → "Get pre-filled link"
2. Fill out the form
3. Check which column each answer goes to
4. This will show you the current mapping

---

## 🎯 What Happens Now

### When Form is Submitted:
```
✅ Timestamp → Date + Time format
✅ Verified (L) → FALSE
✅ QR Image (N) → Cleared/Blank
✅ Counters (R-X) → All set to 0
✅ Duplicates (AA, AB) → Cleared
```

### When You Check "Verified" (Column L):
```
✅ Shop ID → Generated in Column O (SHOP0001, SHOP0002, etc.)
✅ Form Link → Generated in Column M
✅ QR Code → Generated in Column N (proper IMAGE formula)
✅ Email → Sent to shopkeeper with QR code attached
```

---

## 🛠️ Utility Functions

### Fix All Existing Rows
Fixes timestamp, counters, duplicates for all historical data
```
Function: fixAllExistingRows
```

### Fix Broken QR Codes
Repairs all #NAME? errors in QR column
```
Function: fixBrokenQRCodes
```

### Test Specific Row
Test verification on any row
```
Function: testVerification
```

### View Configuration
See current column mappings
```
Function: showConfig
```

---

## 📊 Your Column Structure

| Col | Name | What Happens |
|-----|------|--------------|
| A | Timestamp | ✅ Auto-formatted with date + time |
| C | Shop Name | From form |
| D | Email | From form |
| H | Business Details | ⚠️ Fix form question order |
| L | Verified | ✅ Defaults to FALSE, check to verify |
| M | Form Link | ✅ Auto-generated when verified |
| N | QR Image | ✅ Auto-generated when verified |
| O | Shop ID | ✅ Auto-generated (SHOP0001, etc.) |
| R-X | Counters | ✅ Default to 0 |
| Y | - | ✅ Cleared (was duplicate Shop ID) |
| AA-AB | - | ✅ Cleared (duplicates) |

---

## ❓ Troubleshooting

### QR Code Shows #NAME?
**Solution:** Run `fixBrokenQRCodes` function

### Timestamp Still Only Date
**Solution:** Run `fixAllExistingRows` function

### Column H Still Wrong
**Solution:** This is a form issue, not script. Reorder form questions.

### Email Not Sending
**Check:**
- Email address is valid
- Gmail quota (100/day for free accounts)
- Spam folder
- Execution log for errors

### Shop ID in Wrong Column
**Solution:** The script now explicitly uses Column O (15). If still wrong, check CONFIG.COL.SHOP_ID in the script.

---

## 📧 Email Preview

Shopkeepers will receive a beautiful HTML email with:
- ✅ Shop name and ID
- ✅ Booking form link (clickable button)
- ✅ QR code (inline + attached)
- ✅ Professional formatting

---

## 🔍 Check Installation

### Verify Triggers Are Active:
1. Apps Script → Triggers (clock icon on left)
2. You should see:
   - `onFormSubmit` - On form submit
   - `onEdit` - On edit

### Check Execution Log:
1. Apps Script → Executions (left sidebar)
2. See all script runs and any errors

---

## ✨ Next Steps

1. ✅ Install the script (Steps 1-3)
2. ✅ Fix existing data (Step 4)
3. ✅ Fix broken QR codes (Step 5)
4. ✅ Test with a new form submission
5. ✅ Test verification by checking Column L
6. ⚠️ Fix Column H by reordering form questions

---

## 📞 Need Help?

If something doesn't work:

1. **Check Execution Log:**
   - Extensions > Apps Script > Executions
   - Look for red error messages

2. **Re-run Installation:**
   - Run `installTriggers` again

3. **Test Specific Row:**
   - Run `testVerification`
   - Enter row number
   - Check log for details

---

**Installation Time:** ~5 minutes  
**Tested On:** Your actual Google Sheet  
**Last Updated:** December 6, 2024

---

## 🎉 You're All Set!

Once installed, the script will:
- ✅ Automatically fix all new form submissions
- ✅ Generate Shop IDs when you verify shops
- ✅ Send beautiful emails with QR codes
- ✅ Keep your data clean and organized

**Just check the "Verified" box in Column L to activate a shop!**

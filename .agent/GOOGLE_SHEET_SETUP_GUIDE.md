# 🏪 Google Sheet Setup Guide - Shop Registration System

## 📋 Overview
This guide will help you fix all the issues with your shop registration Google Sheet and Apps Script.

---

## 🔧 Issues Fixed

### ✅ Issue 1: Column A - Timestamp Format
**Problem:** Only receiving Date, not Date + Time  
**Solution:** Script now ensures timestamp includes both date and time with format `yyyy-MM-dd HH:mm:ss`

### ✅ Issue 2: Column H - Business Details
**Problem:** Receiving "Slot Time" instead of "Business Details"  
**Solution:** This is a **Google Form configuration issue**. You need to:
1. Open your Google Form
2. Check the question order
3. Ensure "Business Details" question comes BEFORE slot time questions
4. The form should map questions in this order to columns

### ✅ Issue 3: Column L - Verified Checkbox
**Problem:** Not defaulting to FALSE  
**Solution:** Script automatically sets Column L to FALSE on form submission

### ✅ Issue 4: Column N - QR Image
**Problem:** Not blank by default  
**Solution:** Script clears Column N on form submission, only populates when Column L = TRUE

### ✅ Issue 5: Column O - Shop ID Location
**Problem:** Shop ID appearing in Column Y instead of Column O  
**Solution:** Script explicitly sets Shop ID in Column O (position 15)

### ✅ Issue 6: Columns AA & AB - Duplicate Data
**Problem:** Unnecessary duplicate data  
**Solution:** Script automatically clears these columns on form submission

### ✅ Issue 7: Columns R-X - Default Values
**Problem:** Not defaulting to 0  
**Solution:** Script sets all booking counters to 0:
- R: Total Bookings
- S: Pending
- T: Confirmed
- U: Completed
- V: Cancelled
- W: No Show
- X: Revenue

---

## 🚀 Installation Steps

### Step 1: Open Apps Script Editor
1. Open your Google Sheet: [Your Sheet Link](https://docs.google.com/spreadsheets/d/1aZ26GJtxYCCSrNkHlAXfPEN5E4IwBHqK6C9MioA121s/edit)
2. Click **Extensions** → **Apps Script**
3. You'll see the Apps Script editor

### Step 2: Replace Existing Code
1. **Delete all existing code** in the editor
2. Open the file `ShopRegistrationScript.gs` (provided separately)
3. **Copy ALL the code** from that file
4. **Paste it** into the Apps Script editor
5. Click **Save** (💾 icon or Ctrl+S)
6. Name your project: "Shop Registration Handler"

### Step 3: Update Configuration (If Needed)
Look for the `CONFIG` object at the top of the script:

```javascript
const CONFIG = {
  FORM_TEMPLATE: 'https://docs.google.com/forms/d/e/1FAIpQLSeZo3hbgczRtB4stSKGb9hOnPQmF2Z6aysEmf43Yg62lf5Zrw/viewform?usp=pp_url&entry.1337573551=SHOP_NAME&entry.1721526333=SHOPKEEPER_ID',
  
  COLUMNS: {
    TIMESTAMP:        1,   // A
    SHOP_NAME:        3,   // C
    EMAIL:            4,   // D
    // ... etc
  }
};
```

**Verify the column numbers match your sheet!**

### Step 4: Run Installation Function
1. In the Apps Script editor, find the function dropdown (top toolbar)
2. Select **`installTriggers`** from the dropdown
3. Click **Run** (▶️ icon)
4. **First time only:** You'll see an authorization dialog:
   - Click "Review Permissions"
   - Choose your Google account
   - Click "Advanced" → "Go to Shop Registration Handler (unsafe)"
   - Click "Allow"
5. Wait for the success message: "✅ Installation Complete!"

### Step 5: Verify Installation
1. Go back to your Google Sheet
2. You should see a toast notification confirming installation
3. Check **Extensions** → **Apps Script** → **Triggers** (clock icon on left)
4. You should see 2 triggers:
   - `onFormSubmit` - Form submit
   - `onSheetEdit` - On edit

---

## 🧪 Testing

### Test 1: Form Submission
1. Submit a test entry through your Google Form
2. Check the new row in the sheet:
   - ✅ Column A should have date AND time
   - ✅ Column L should be FALSE
   - ✅ Column N should be blank
   - ✅ Columns R-X should all be 0
   - ✅ Columns AA & AB should be empty

### Test 2: Manual Verification
1. Find a test row in your sheet
2. Click on Column L (Verified) for that row
3. Check the checkbox (set to TRUE)
4. Wait 2-3 seconds
5. Check that:
   - ✅ Column O has Shop ID (e.g., SHOP0002)
   - ✅ Column M has the form link
   - ✅ Column N has the QR code image
   - ✅ Email was sent to the shopkeeper

### Test 3: Check Email
1. Check the email address from the test row
2. You should receive an email with:
   - Subject: "✅ Shop Verification Complete - [Shop Name]"
   - Shop details (Name, ID)
   - Booking form link
   - QR code (both attached and inline)

---

## 🔍 Troubleshooting

### Problem: Column H Still Shows Wrong Data
**Cause:** This is a Google Form issue, not a script issue.

**Solution:**
1. Open your Google Form
2. Click the three dots (⋮) → "Get pre-filled link"
3. Fill out the form in the correct order
4. Check which column each answer goes to
5. Rearrange questions in the form if needed

### Problem: Timestamp Still Only Shows Date
**Cause:** Cell formatting or timezone issue.

**Solution:**
1. Select Column A
2. Right-click → Format → Number → Custom date and time
3. Use format: `yyyy-MM-dd HH:mm:ss`
4. Or run the `fixAllExistingRows()` function

### Problem: QR Code Not Generating
**Cause:** Image formula or internet connectivity issue.

**Solution:**
1. Check if the cell has the formula: `=IMAGE("https://quickchart.io/qr?text=...", 1)`
2. Try accessing https://quickchart.io in your browser
3. Check the execution log for errors:
   - Apps Script → Executions (left sidebar)

### Problem: Email Not Sending
**Cause:** Gmail quota or permissions issue.

**Solution:**
1. Check Gmail sending quota (100 emails/day for free accounts)
2. Verify the email address is valid
3. Check spam folder
4. Review execution log for errors

### Problem: Shop ID in Wrong Column
**Cause:** Column mapping mismatch.

**Solution:**
1. Open the script
2. Find `SHOP_ID: 15` in CONFIG.COLUMNS
3. Count your columns manually (A=1, B=2, C=3, etc.)
4. Update the number if needed
5. Save and test again

---

## 🛠️ Utility Functions

### Fix All Existing Rows
If you have historical data that needs fixing:

1. Open Apps Script editor
2. Select function: **`fixAllExistingRows`**
3. Click Run
4. Confirm when prompted
5. Wait for completion message

This will:
- Fix all timestamps
- Set default counter values
- Clean duplicate columns
- Set verified to FALSE if empty

### Test Specific Row
To test verification on a specific row:

1. Open the script
2. Find the `testVerification()` function
3. Change `const row = 2;` to your desired row number
4. Select **`testVerification`** from function dropdown
5. Click Run

### View Current Configuration
To see your current column mappings:

1. Select function: **`viewConfig`**
2. Click Run
3. Check the execution log (View → Logs)

---

## 📊 Expected Column Structure

| Column | Name | Type | Default | Notes |
|--------|------|------|---------|-------|
| A | Timestamp | DateTime | Auto | Date + Time format |
| B | (Form field 2) | - | - | - |
| C | Shop Name | Text | - | Required |
| D | Email | Email | - | Required for verification |
| E | Phone | Text | - | - |
| F | Address | Text | - | - |
| G | City | Text | - | - |
| H | Business Details | Text | - | **NOT Slot Time** |
| I | Min Service Charge | Number | - | - |
| J | Slot 1 | Text | - | - |
| K | Slot 2 | Text | - | - |
| L | Verified | Checkbox | FALSE | Trigger for QR generation |
| M | Form Link | URL | Auto | Generated on verification |
| N | QR Image | Image | Blank | Generated on verification |
| O | Shop ID | Text | Auto | Format: SHOP0001 |
| P-Q | - | - | - | - |
| R | Total Bookings | Number | 0 | Counter |
| S | Pending | Number | 0 | Counter |
| T | Confirmed | Number | 0 | Counter |
| U | Completed | Number | 0 | Counter |
| V | Cancelled | Number | 0 | Counter |
| W | No Show | Number | 0 | Counter |
| X | Revenue | Number | 0 | Counter |
| Y | - | - | - | Should be empty |
| AA | - | - | - | Cleared automatically |
| AB | - | - | - | Cleared automatically |

---

## 📝 Form Configuration Checklist

To fix Column H issue, ensure your Google Form has questions in this order:

1. ✅ Shop Name → Column C
2. ✅ Email → Column D
3. ✅ Phone → Column E
4. ✅ Address → Column F
5. ✅ City → Column G
6. ✅ **Business Details** → Column H (This should be BEFORE slot questions!)
7. ✅ Minimum Service Charge → Column I
8. ✅ Slot 1 → Column J
9. ✅ Slot 2 → Column K
10. ✅ (Additional slots if any)

**Important:** The form question order determines which column the data goes to!

---

## 🎯 Quick Reference

### When Form is Submitted:
1. ✅ Timestamp set with date + time
2. ✅ Verified (L) set to FALSE
3. ✅ QR Image (N) cleared
4. ✅ Counters (R-X) set to 0
5. ✅ Duplicates (AA-AB) cleared

### When Verified = TRUE:
1. ✅ Shop ID generated in Column O
2. ✅ Form link generated in Column M
3. ✅ QR code generated in Column N
4. ✅ Email sent to shopkeeper

---

## 📧 Support

If you encounter issues:

1. **Check Execution Log:**
   - Apps Script → Executions (left sidebar)
   - Look for error messages

2. **Check Triggers:**
   - Apps Script → Triggers (clock icon)
   - Ensure both triggers are active

3. **Test Functions:**
   - Run `testVerification()` on a specific row
   - Check logs for detailed output

4. **Re-install:**
   - Run `installTriggers()` again
   - This will reset all triggers

---

## ✨ Additional Features

The script includes:
- ✅ Automatic error logging
- ✅ Email notifications with HTML formatting
- ✅ QR code generation and attachment
- ✅ Duplicate data prevention
- ✅ Validation checks
- ✅ Toast notifications for user feedback
- ✅ Batch fixing for historical data

---

**Last Updated:** December 6, 2024  
**Version:** 2.0  
**Author:** EasyBook Development Team

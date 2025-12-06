/**************************************************
 * 🏪 SHOP REGISTRATION SCRIPT - FIXED VERSION
 * Google Apps Script for Shop Registration Form
 * 
 * INSTALLATION INSTRUCTIONS:
 * 1. Open your Google Sheet
 * 2. Go to Extensions > Apps Script
 * 3. Delete any existing code
 * 4. Paste this entire script
 * 5. Save the project (Ctrl+S)
 * 6. Run 'installTriggers' function once
 * 7. Authorize the script when prompted
 **************************************************/

// ============================================
// CONFIGURATION - ADJUST THESE AS NEEDED
// ============================================
const CONFIG = {
  // Form Link Template (Update with your actual form URL)
  FORM_TEMPLATE: 'https://docs.google.com/forms/d/e/1FAIpQLSeZo3hbgczRtB4stSKGb9hOnPQmF2Z6aysEmf43Yg62lf5Zrw/viewform?usp=pp_url&entry.1337573551=SHOP_NAME&entry.1721526333=SHOPKEEPER_ID',
  
  // Column Mappings (1-indexed)
  COLUMNS: {
    TIMESTAMP:        1,   // A - Timestamp (Date + Time)
    SHOP_NAME:        3,   // C - Shop Name
    EMAIL:            4,   // D - Email
    PHONE:            5,   // E - Phone
    ADDRESS:          6,   // F - Address
    CITY:             7,   // G - City
    BUSINESS_DETAILS: 8,   // H - Business Details (NOT Slot Time)
    MIN_CHARGE:       9,   // I - Minimum Service Charge
    SLOT_1:          10,   // J - Slot 1
    SLOT_2:          11,   // K - Slot 2
    VERIFIED:        12,   // L - Verified (TRUE/FALSE checkbox)
    FORM_LINK:       13,   // M - Generated Form Link
    QR_IMAGE:        14,   // N - QR Code Image
    SHOP_ID:         15,   // O - Shop ID (SHOULD BE HERE, NOT COLUMN Y)
    // Booking counters
    TOTAL_BOOKINGS:  18,   // R - Default 0
    PENDING:         19,   // S - Default 0
    CONFIRMED:       20,   // T - Default 0
    COMPLETED:       21,   // U - Default 0
    CANCELLED:       22,   // V - Default 0
    NO_SHOW:         23,   // W - Default 0
    REVENUE:         24,   // X - Default 0
  },
  
  // Sheet name (change if different)
  SHEET_NAME: 'Form Responses 1'
};

// ============================================
// INSTALLATION FUNCTION - RUN THIS ONCE
// ============================================
function installTriggers() {
  // Remove all existing triggers
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => ScriptApp.deleteTrigger(trigger));
  
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Install Form Submit Trigger
  ScriptApp.newTrigger('onFormSubmit')
    .forSpreadsheet(ss)
    .onFormSubmit()
    .create();
  
  // Install Edit Trigger (for manual verification)
  ScriptApp.newTrigger('onSheetEdit')
    .forSpreadsheet(ss)
    .onEdit()
    .create();
  
  SpreadsheetApp.getUi().alert(
    '✅ Installation Complete!\n\n' +
    'Triggers installed:\n' +
    '1. Form Submit Handler\n' +
    '2. Manual Edit Handler\n\n' +
    'You can now test the form submission.'
  );
}

// ============================================
// FORM SUBMIT HANDLER
// ============================================
function onFormSubmit(e) {
  try {
    const sheet = e.range.getSheet();
    const row = e.range.getRow();
    
    Logger.log('Form submitted - Processing row: ' + row);
    
    // Fix 1: Ensure Timestamp has both Date AND Time
    fixTimestamp(sheet, row);
    
    // Fix 2: Set default values for booking counters (R-X = 0)
    setDefaultCounters(sheet, row);
    
    // Fix 3: Set Verified column (L) to FALSE by default
    sheet.getRange(row, CONFIG.COLUMNS.VERIFIED).setValue(false);
    
    // Fix 4: Ensure QR Image column (N) is blank initially
    sheet.getRange(row, CONFIG.COLUMNS.QR_IMAGE).clearContent();
    
    // Fix 5: Clean up duplicate data in AA and AB if present
    cleanupDuplicateColumns(sheet, row);
    
    Logger.log('Form submission processed successfully for row: ' + row);
    
  } catch (error) {
    Logger.log('Error in onFormSubmit: ' + error.toString());
    // Send error notification to admin (optional)
    sendErrorNotification(error, 'Form Submit Handler');
  }
}

// ============================================
// MANUAL EDIT HANDLER (FOR VERIFICATION)
// ============================================
function onSheetEdit(e) {
  try {
    const range = e.range;
    const sheet = range.getSheet();
    const row = range.getRow();
    const col = range.getColumn();
    
    // Only process if editing the Verified column (L)
    if (col === CONFIG.COLUMNS.VERIFIED && range.getValue() === true) {
      Logger.log('Shop verification triggered for row: ' + row);
      processShopVerification(sheet, row);
    }
    
  } catch (error) {
    Logger.log('Error in onSheetEdit: ' + error.toString());
    sendErrorNotification(error, 'Edit Handler');
  }
}

// ============================================
// VERIFICATION PROCESSOR
// ============================================
function processShopVerification(sheet, row) {
  try {
    // 1. Generate Shop ID if missing (Column O, NOT Y)
    const shopIdCell = sheet.getRange(row, CONFIG.COLUMNS.SHOP_ID);
    let shopId = shopIdCell.getValue();
    
    if (!shopId) {
      shopId = 'SHOP' + String(row).padStart(4, '0');
      shopIdCell.setValue(shopId);
      Logger.log('Generated Shop ID: ' + shopId);
    }
    
    // 2. Get shop details
    const shopName = sheet.getRange(row, CONFIG.COLUMNS.SHOP_NAME).getValue();
    const email = sheet.getRange(row, CONFIG.COLUMNS.EMAIL).getValue();
    
    if (!shopName) {
      throw new Error('Shop name is missing for row ' + row);
    }
    
    // 3. Generate Form Link
    const formLink = CONFIG.FORM_TEMPLATE
      .replace('SHOPKEEPER_ID', encodeURIComponent(shopId))
      .replace('SHOP_NAME', encodeURIComponent(shopName));
    
    sheet.getRange(row, CONFIG.COLUMNS.FORM_LINK).setValue(formLink);
    Logger.log('Generated form link: ' + formLink);
    
    // 4. Generate QR Code Image
    const qrUrl = 'https://quickchart.io/qr?text=' + encodeURIComponent(formLink) + '&size=300';
    const qrFormula = '=IMAGE("' + qrUrl + '", 1)';
    sheet.getRange(row, CONFIG.COLUMNS.QR_IMAGE).setFormula(qrFormula);
    Logger.log('Generated QR code');
    
    // 5. Send Email with QR Code
    if (email && validateEmail(email)) {
      sendVerificationEmail(email, shopId, shopName, formLink, qrUrl);
      Logger.log('Verification email sent to: ' + email);
    } else {
      Logger.log('Invalid or missing email, skipping email notification');
    }
    
    // 6. Add verification timestamp
    const verificationTime = new Date();
    // You can add this to a new column if needed
    
    SpreadsheetApp.getActiveSpreadsheet().toast(
      '✅ Shop verified successfully!\nShop ID: ' + shopId,
      'Verification Complete',
      5
    );
    
  } catch (error) {
    Logger.log('Error in processShopVerification: ' + error.toString());
    SpreadsheetApp.getActiveSpreadsheet().toast(
      '❌ Verification failed: ' + error.message,
      'Error',
      5
    );
    throw error;
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Fix 1: Ensure timestamp includes both date and time
 */
function fixTimestamp(sheet, row) {
  const timestampCell = sheet.getRange(row, CONFIG.COLUMNS.TIMESTAMP);
  const currentValue = timestampCell.getValue();
  
  // If timestamp is missing or only has date, set current date+time
  if (!currentValue || !isDateTime(currentValue)) {
    const now = new Date();
    timestampCell.setValue(now);
    
    // Format the cell to show both date and time
    timestampCell.setNumberFormat('yyyy-MM-dd HH:mm:ss');
    
    Logger.log('Fixed timestamp for row ' + row + ': ' + now);
  }
}

/**
 * Check if a value contains time component
 */
function isDateTime(value) {
  if (!(value instanceof Date)) return false;
  
  // Check if time component exists (not midnight)
  const hours = value.getHours();
  const minutes = value.getMinutes();
  const seconds = value.getSeconds();
  
  return hours !== 0 || minutes !== 0 || seconds !== 0;
}

/**
 * Fix 7: Set default values (0) for booking counter columns R-X
 */
function setDefaultCounters(sheet, row) {
  const counterColumns = [
    CONFIG.COLUMNS.TOTAL_BOOKINGS,  // R
    CONFIG.COLUMNS.PENDING,         // S
    CONFIG.COLUMNS.CONFIRMED,       // T
    CONFIG.COLUMNS.COMPLETED,       // U
    CONFIG.COLUMNS.CANCELLED,       // V
    CONFIG.COLUMNS.NO_SHOW,         // W
    CONFIG.COLUMNS.REVENUE          // X
  ];
  
  counterColumns.forEach(col => {
    const cell = sheet.getRange(row, col);
    if (!cell.getValue()) {
      cell.setValue(0);
    }
  });
  
  Logger.log('Set default counter values for row: ' + row);
}

/**
 * Fix 6: Clean up duplicate data in columns AA and AB
 */
function cleanupDuplicateColumns(sheet, row) {
  // Column AA = 27, AB = 28
  sheet.getRange(row, 27).clearContent();
  sheet.getRange(row, 28).clearContent();
  
  Logger.log('Cleaned duplicate columns AA and AB for row: ' + row);
}

/**
 * Validate email address
 */
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Send verification email with QR code
 */
function sendVerificationEmail(email, shopId, shopName, formLink, qrUrl) {
  try {
    // Fetch QR code image
    const qrBlob = UrlFetchApp.fetch(qrUrl).getBlob().setName('QR_' + shopId + '.png');
    
    // Email subject
    const subject = '✅ Shop Verification Complete - ' + shopName;
    
    // Email body (plain text)
    const body = 
      'Dear Shopkeeper,\n\n' +
      'Congratulations! Your shop has been verified successfully.\n\n' +
      '📋 SHOP DETAILS:\n' +
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
      'Shop Name: ' + shopName + '\n' +
      'Shop ID: ' + shopId + '\n\n' +
      '🔗 BOOKING FORM LINK:\n' +
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
      formLink + '\n\n' +
      '📱 QR CODE:\n' +
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
      'Please find your QR code attached. Customers can scan this to book appointments.\n\n' +
      'Thank you for registering with us!\n\n' +
      'Best regards,\n' +
      'EasyBook Team';
    
    // Email body (HTML)
    const htmlBody = 
      '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">' +
      '<h2 style="color: #4CAF50;">✅ Shop Verification Complete</h2>' +
      '<p>Dear Shopkeeper,</p>' +
      '<p>Congratulations! Your shop has been verified successfully.</p>' +
      
      '<div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">' +
      '<h3 style="margin-top: 0; color: #333;">📋 Shop Details</h3>' +
      '<p><strong>Shop Name:</strong> ' + shopName + '</p>' +
      '<p><strong>Shop ID:</strong> ' + shopId + '</p>' +
      '</div>' +
      
      '<div style="background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0;">' +
      '<h3 style="margin-top: 0; color: #1976D2;">🔗 Booking Form Link</h3>' +
      '<p><a href="' + formLink + '" style="color: #1976D2; word-break: break-all;">' + formLink + '</a></p>' +
      '</div>' +
      
      '<div style="background-color: #fff3e0; padding: 15px; border-radius: 5px; margin: 20px 0;">' +
      '<h3 style="margin-top: 0; color: #F57C00;">📱 QR Code</h3>' +
      '<p>Please find your QR code attached. Customers can scan this to book appointments.</p>' +
      '<img src="cid:qrcode" style="max-width: 300px; margin: 10px 0;" alt="QR Code">' +
      '</div>' +
      
      '<p>Thank you for registering with us!</p>' +
      '<p style="color: #666;">Best regards,<br><strong>EasyBook Team</strong></p>' +
      '</div>';
    
    // Send email with attachment
    GmailApp.sendEmail(email, subject, body, {
      htmlBody: htmlBody,
      attachments: [qrBlob],
      inlineImages: {
        qrcode: qrBlob
      },
      name: 'EasyBook Registration'
    });
    
    return true;
    
  } catch (error) {
    Logger.log('Error sending verification email: ' + error.toString());
    return false;
  }
}

/**
 * Send error notification to admin
 */
function sendErrorNotification(error, context) {
  try {
    const adminEmail = Session.getActiveUser().getEmail();
    const subject = '⚠️ EasyBook Script Error - ' + context;
    const body = 
      'An error occurred in the EasyBook registration script.\n\n' +
      'Context: ' + context + '\n' +
      'Error: ' + error.toString() + '\n' +
      'Stack: ' + error.stack + '\n' +
      'Time: ' + new Date().toString();
    
    GmailApp.sendEmail(adminEmail, subject, body);
  } catch (e) {
    Logger.log('Failed to send error notification: ' + e.toString());
  }
}

// ============================================
// UTILITY FUNCTIONS FOR TESTING
// ============================================

/**
 * Test function - Run this to test verification on a specific row
 */
function testVerification() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const row = 2; // Change this to test different rows
  
  Logger.log('Testing verification for row: ' + row);
  processShopVerification(sheet, row);
  Logger.log('Test complete - check logs for details');
}

/**
 * Fix all existing rows - Run this ONCE to fix historical data
 */
function fixAllExistingRows() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAME);
  const lastRow = sheet.getLastRow();
  
  if (lastRow < 2) {
    SpreadsheetApp.getUi().alert('No data rows to fix');
    return;
  }
  
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert(
    'Fix All Rows',
    'This will fix ' + (lastRow - 1) + ' rows. Continue?',
    ui.ButtonSet.YES_NO
  );
  
  if (response !== ui.Button.YES) {
    return;
  }
  
  let fixed = 0;
  
  for (let row = 2; row <= lastRow; row++) {
    try {
      // Fix timestamp
      fixTimestamp(sheet, row);
      
      // Set default counters
      setDefaultCounters(sheet, row);
      
      // Clean duplicates
      cleanupDuplicateColumns(sheet, row);
      
      // Set verified to FALSE if empty
      const verifiedCell = sheet.getRange(row, CONFIG.COLUMNS.VERIFIED);
      if (!verifiedCell.getValue()) {
        verifiedCell.setValue(false);
      }
      
      fixed++;
      
    } catch (error) {
      Logger.log('Error fixing row ' + row + ': ' + error.toString());
    }
  }
  
  ui.alert('✅ Fixed ' + fixed + ' rows successfully!');
}

/**
 * View current configuration
 */
function viewConfig() {
  Logger.log('Current Configuration:');
  Logger.log(JSON.stringify(CONFIG, null, 2));
  
  SpreadsheetApp.getUi().alert(
    'Configuration logged to execution log.\n' +
    'View: Extensions > Apps Script > Execution log'
  );
}

/**************************************************
 * 🏪 SHOP REGISTRATION SCRIPT - FINAL VERSION
 * Customized for: Next AppointmentApp Google Sheet
 * 
 * INSTALLATION:
 * 1. Open your Google Sheet
 * 2. Extensions > Apps Script
 * 3. Delete existing code
 * 4. Paste this entire script
 * 5. Save (Ctrl+S)
 * 6. Run 'installTriggers' function
 * 7. Authorize when prompted
 **************************************************/

// ============================================
// CONFIGURATION
// ============================================
const CONFIG = {
  // Your Form Link Template - UPDATE THIS WITH YOUR ACTUAL FORM URL
  FORM_TEMPLATE: 'https://docs.google.com/forms/d/e/1FAIpQLSeZo3hbgczRtB4stSKGb9hOnPQmF2Z6aysEmf43Yg62lf5Zrw/viewform?usp=pp_url&entry.1337573551=SHOP_NAME&entry.1721526333=SHOPKEEPER_ID',
  
  // Column Numbers (verified from your sheet)
  COL: {
    TIMESTAMP:        1,   // A
    SHOP_NAME:        3,   // C
    EMAIL:            4,   // D
    PHONE:            5,   // E
    ADDRESS:          6,   // F
    CITY:             7,   // G
    BUSINESS_DETAILS: 8,   // H
    MIN_CHARGE:       9,   // I
    VERIFIED:        12,   // L - Checkbox for verification
    FORM_LINK:       13,   // M - Generated link
    QR_IMAGE:        14,   // N - QR code image
    SHOP_ID:         15,   // O - Shop ID (CORRECT LOCATION)
    
    // Booking Counters (should default to 0)
    TOTAL_BOOKINGS:  18,   // R
    PENDING:         19,   // S
    CONFIRMED:       20,   // T
    COMPLETED:       21,   // U
    CANCELLED:       22,   // V
    NO_SHOW:         23,   // W
    REVENUE:         24,   // X
    
    // Duplicate columns to clear
    SHOP_ID_DUP:     25,   // Y - Duplicate Shop ID (should be empty)
    DUPLICATE_AA:    27,   // AA - Clear this
    DUPLICATE_AB:    28,   // AB - Clear this
  }
};

// ============================================
// INSTALLATION - RUN THIS ONCE
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
  
  // Install Edit Trigger
  ScriptApp.newTrigger('onEdit')
    .forSpreadsheet(ss)
    .onEdit()
    .create();
  
  SpreadsheetApp.getUi().alert(
    '✅ INSTALLATION COMPLETE!\n\n' +
    'Triggers installed:\n' +
    '• Form Submit Handler\n' +
    '• Edit Handler (for verification)\n\n' +
    'Test by:\n' +
    '1. Submitting a form\n' +
    '2. Checking a Verified checkbox (column L)'
  );
  
  Logger.log('Triggers installed successfully');
}

// ============================================
// FORM SUBMIT HANDLER
// ============================================
function onFormSubmit(e) {
  try {
    const sheet = e.range.getSheet();
    const row = e.range.getRow();
    
    Logger.log('📝 Form submitted - Row: ' + row);
    
    // FIX 1: Ensure timestamp has date AND time
    const timestampCell = sheet.getRange(row, CONFIG.COL.TIMESTAMP);
    const timestamp = timestampCell.getValue();
    
    if (!timestamp || !(timestamp instanceof Date)) {
      timestampCell.setValue(new Date());
    }
    
    // Format to show both date and time
    timestampCell.setNumberFormat('M/d/yyyy H:mm:ss');
    Logger.log('✅ Timestamp fixed: ' + timestampCell.getValue());
    
    // FIX 3: Set Verified to FALSE by default
    sheet.getRange(row, CONFIG.COL.VERIFIED).setValue(false);
    Logger.log('✅ Verified set to FALSE');
    
    // FIX 4: Clear QR Image column (should be blank until verified)
    sheet.getRange(row, CONFIG.COL.QR_IMAGE).clearContent();
    Logger.log('✅ QR Image cleared');
    
    // FIX 7: Set booking counters to 0
    const counterCols = [
      CONFIG.COL.TOTAL_BOOKINGS,
      CONFIG.COL.PENDING,
      CONFIG.COL.CONFIRMED,
      CONFIG.COL.COMPLETED,
      CONFIG.COL.CANCELLED,
      CONFIG.COL.NO_SHOW,
      CONFIG.COL.REVENUE
    ];
    
    counterCols.forEach(col => {
      const cell = sheet.getRange(row, col);
      if (!cell.getValue()) {
        cell.setValue(0);
      }
    });
    Logger.log('✅ Counters set to 0');
    
    // FIX 6: Clear duplicate columns
    sheet.getRange(row, CONFIG.COL.SHOP_ID_DUP).clearContent();  // Y
    sheet.getRange(row, CONFIG.COL.DUPLICATE_AA).clearContent(); // AA
    sheet.getRange(row, CONFIG.COL.DUPLICATE_AB).clearContent(); // AB
    Logger.log('✅ Duplicates cleared');
    
    // Send confirmation email to shopkeeper
    const shopName = sheet.getRange(row, CONFIG.COL.SHOP_NAME).getValue();
    const email = sheet.getRange(row, CONFIG.COL.EMAIL).getValue();
    
    if (email && isValidEmail(email)) {
      sendConfirmationEmail(email, shopName);
      Logger.log('✅ Confirmation email sent to: ' + email);
    }
    
    Logger.log('✅ Form submission processed successfully');
    
  } catch (error) {
    Logger.log('❌ Error in onFormSubmit: ' + error.toString());
    Logger.log('Stack: ' + error.stack);
  }
}

// ============================================
// EDIT HANDLER (VERIFICATION)
// ============================================
function onEdit(e) {
  try {
    const range = e.range;
    const sheet = range.getSheet();
    const row = range.getRow();
    const col = range.getColumn();
    
    // Only process if Verified column (L) is checked
    if (col === CONFIG.COL.VERIFIED && range.getValue() === true) {
      Logger.log('🔍 Verification triggered - Row: ' + row);
      processVerification(sheet, row);
    }
    
  } catch (error) {
    Logger.log('❌ Error in onEdit: ' + error.toString());
    Logger.log('Stack: ' + error.stack);
  }
}

// ============================================
// VERIFICATION PROCESSOR
// ============================================
function processVerification(sheet, row) {
  try {
    Logger.log('🚀 Starting verification for row: ' + row);
    
    // 1. Generate Shop ID if missing (Column O)
    const shopIdCell = sheet.getRange(row, CONFIG.COL.SHOP_ID);
    let shopId = shopIdCell.getValue();
    
    if (!shopId) {
      shopId = 'SHOP' + String(row).padStart(4, '0');
      shopIdCell.setValue(shopId);
      Logger.log('✅ Generated Shop ID: ' + shopId);
    } else {
      Logger.log('ℹ️ Using existing Shop ID: ' + shopId);
    }
    
    // 2. Get shop details
    const shopName = sheet.getRange(row, CONFIG.COL.SHOP_NAME).getValue();
    const email = sheet.getRange(row, CONFIG.COL.EMAIL).getValue();
    
    if (!shopName) {
      throw new Error('Shop name is missing');
    }
    
    Logger.log('📋 Shop Name: ' + shopName);
    Logger.log('📧 Email: ' + email);
    
    // 3. Generate Form Link
    const formLink = CONFIG.FORM_TEMPLATE
      .replace('SHOPKEEPER_ID', encodeURIComponent(shopId))
      .replace('SHOP_NAME', encodeURIComponent(shopName));
    
    sheet.getRange(row, CONFIG.COL.FORM_LINK).setValue(formLink);
    Logger.log('✅ Form link generated');
    
    // 4. Generate QR Code
    const qrUrl = 'https://quickchart.io/qr?text=' + encodeURIComponent(formLink) + '&size=300';
    
    // Use proper IMAGE formula (this was causing #NAME? error)
    const qrFormula = '=IMAGE("' + qrUrl + '",1)';
    sheet.getRange(row, CONFIG.COL.QR_IMAGE).setFormula(qrFormula);
    
    Logger.log('✅ QR code formula set');
    Logger.log('QR URL: ' + qrUrl);
    
    // 5. Send Email
    if (email && isValidEmail(email)) {
      sendVerificationEmail(email, shopId, shopName, formLink, qrUrl);
      Logger.log('✅ Email sent to: ' + email);
    } else {
      Logger.log('⚠️ Invalid or missing email, skipping email');
    }
    
    // 6. Show success message
    SpreadsheetApp.getActiveSpreadsheet().toast(
      'Shop verified!\nID: ' + shopId + '\nEmail sent to: ' + email,
      '✅ Verification Complete',
      5
    );
    
    Logger.log('🎉 Verification completed successfully');
    
  } catch (error) {
    Logger.log('❌ Verification failed: ' + error.toString());
    Logger.log('Stack: ' + error.stack);
    
    SpreadsheetApp.getActiveSpreadsheet().toast(
      'Verification failed: ' + error.message,
      '❌ Error',
      5
    );
    
    throw error;
  }
}

// ============================================
// EMAIL SENDER
// ============================================
function sendVerificationEmail(email, shopId, shopName, formLink, qrUrl) {
  try {
    // Fetch QR code image
    const response = UrlFetchApp.fetch(qrUrl);
    const qrBlob = response.getBlob().setName('QR_' + shopId + '.png');
    
    // Email subject
    const subject = '✅ Shop Verification Complete - ' + shopName;
    
    // Plain text body
    const body = 
      'Dear Shopkeeper,\n\n' +
      'Congratulations! Your shop has been verified.\n\n' +
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
      'SHOP DETAILS\n' +
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
      'Shop Name: ' + shopName + '\n' +
      'Shop ID: ' + shopId + '\n\n' +
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
      'BOOKING FORM LINK\n' +
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
      formLink + '\n\n' +
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
      'QR CODE\n' +
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
      'Your QR code is attached. Customers can scan it to book appointments.\n\n' +
      'Thank you for registering!\n\n' +
      'Best regards,\n' +
      'EasyBook Team';
    
    // HTML body - Using HTML entities instead of Unicode emojis
    const htmlBody = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">&#10004; Shop Verified!</h1>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <p style="font-size: 16px; color: #333;">Dear Shopkeeper,</p>
          <p style="font-size: 16px; color: #333;">Congratulations! Your shop has been successfully verified and is now active in our system.</p>
          
          <div style="background: #f0f4ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
            <h3 style="margin: 0 0 15px 0; color: #667eea; font-size: 18px;">
              <span style="display: inline-block; width: 24px; height: 24px; background: #667eea; color: white; border-radius: 50%; text-align: center; line-height: 24px; margin-right: 8px; font-size: 14px;">&#9998;</span>
              Shop Details
            </h3>
            <p style="margin: 5px 0; color: #333;"><strong>Shop Name:</strong> ${shopName}</p>
            <p style="margin: 5px 0; color: #333;"><strong>Shop ID:</strong> <code style="background: #e0e7ff; padding: 2px 8px; border-radius: 4px; color: #667eea;">${shopId}</code></p>
          </div>
          
          <div style="background: #fff4e6; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ff9800;">
            <h3 style="margin: 0 0 15px 0; color: #ff9800; font-size: 18px;">
              <span style="display: inline-block; width: 24px; height: 24px; background: #ff9800; color: white; border-radius: 50%; text-align: center; line-height: 24px; margin-right: 8px; font-size: 14px;">&#128279;</span>
              Booking Form Link
            </h3>
            <p style="margin: 5px 0; color: #666; font-size: 14px;">Share this link with your customers:</p>
            <a href="${formLink}" style="display: inline-block; margin-top: 10px; padding: 12px 24px; background: #ff9800; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">Open Booking Form</a>
            <p style="margin-top: 15px; font-size: 12px; color: #999; word-break: break-all;">${formLink}</p>
          </div>
          
          <div style="background: #e8f5e9; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4caf50; text-align: center;">
            <h3 style="margin: 0 0 15px 0; color: #4caf50; font-size: 18px;">
              <span style="display: inline-block; width: 24px; height: 24px; background: #4caf50; color: white; border-radius: 50%; text-align: center; line-height: 24px; margin-right: 8px; font-size: 14px;">&#9733;</span>
              Your QR Code
            </h3>
            <p style="margin: 5px 0 15px 0; color: #666; font-size: 14px;">Print this QR code and display it at your shop. Customers can scan it to book appointments instantly!</p>
            <img src="cid:qrcode" style="max-width: 250px; border: 3px solid #4caf50; border-radius: 8px; padding: 10px; background: white;" alt="QR Code">
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #f0f0f0;">
            <p style="color: #666; font-size: 14px; margin: 5px 0;">Thank you for joining EasyBook!</p>
            <p style="color: #999; font-size: 12px; margin: 5px 0;">If you have any questions, please don't hesitate to contact us.</p>
          </div>
          
          <div style="text-align: center; margin-top: 20px;">
            <p style="color: #999; font-size: 12px; margin: 0;">Best regards,</p>
            <p style="color: #667eea; font-size: 16px; font-weight: bold; margin: 5px 0;">EasyBook Team</p>
          </div>
        </div>
      </div>
    `;
    
    // Send email
    GmailApp.sendEmail(email, subject, body, {
      htmlBody: htmlBody,
      attachments: [qrBlob],
      inlineImages: {
        qrcode: qrBlob
      },
      name: 'EasyBook Registration'
    });
    
    Logger.log('📧 Email sent successfully');
    return true;
    
  } catch (error) {
    Logger.log('❌ Email send failed: ' + error.toString());
    return false;
  }
}


// ============================================
// CONFIRMATION EMAIL (ON FORM SUBMIT)
// ============================================
function sendConfirmationEmail(email, shopName) {
  try {
    // Email subject
    const subject = 'Registration Received - ' + shopName;
    
    // Plain text body
    const body = 
      'Dear Shopkeeper,\n\n' +
      'Thank you for registering with EasyBook!\n\n' +
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
      'REGISTRATION RECEIVED\n' +
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
      'Shop Name: ' + shopName + '\n' +
      'Status: Pending Verification\n\n' +
      'Your registration has been received and is currently under review.\n\n' +
      'You will receive another email with your:\n' +
      '• Shop ID\n' +
      '• Booking Form Link\n' +
      '• QR Code\n\n' +
      'once your shop has been verified by our team.\n\n' +
      'This usually takes 24-48 hours.\n\n' +
      'Thank you for your patience!\n\n' +
      'Best regards,\n' +
      'EasyBook Team';
    
    // HTML body
    const htmlBody = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Registration Received</h1>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <p style="font-size: 16px; color: #333;">Dear Shopkeeper,</p>
          <p style="font-size: 16px; color: #333;">Thank you for registering with EasyBook!</p>
          
          <div style="background: #f0f4ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
            <h3 style="margin: 0 0 15px 0; color: #667eea; font-size: 18px;">
              <span style="display: inline-block; width: 24px; height: 24px; background: #667eea; color: white; border-radius: 50%; text-align: center; line-height: 24px; margin-right: 8px; font-size: 14px;">&#9998;</span>
              Registration Details
            </h3>
            <p style="margin: 5px 0; color: #333;"><strong>Shop Name:</strong> ${shopName}</p>
            <p style="margin: 5px 0; color: #333;"><strong>Status:</strong> <span style="background: #fff4e6; color: #ff9800; padding: 4px 12px; border-radius: 4px; font-weight: bold;">Pending Verification</span></p>
          </div>
          
          <div style="background: #fff4e6; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ff9800;">
            <h3 style="margin: 0 0 15px 0; color: #ff9800; font-size: 18px;">
              <span style="display: inline-block; width: 24px; height: 24px; background: #ff9800; color: white; border-radius: 50%; text-align: center; line-height: 24px; margin-right: 8px; font-size: 14px;">&#9200;</span>
              What's Next?
            </h3>
            <p style="margin: 5px 0; color: #666; font-size: 14px;">Your registration has been received and is currently under review.</p>
            <p style="margin: 15px 0 5px 0; color: #666; font-size: 14px;"><strong>You will receive another email with:</strong></p>
            <ul style="margin: 10px 0; padding-left: 20px; color: #666;">
              <li style="margin: 5px 0;">Shop ID</li>
              <li style="margin: 5px 0;">Booking Form Link</li>
              <li style="margin: 5px 0;">QR Code for your shop</li>
            </ul>
            <p style="margin: 15px 0 5px 0; color: #666; font-size: 14px;">once your shop has been verified by our team.</p>
          </div>
          
          <div style="background: #e8f5e9; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4caf50; text-align: center;">
            <h3 style="margin: 0 0 10px 0; color: #4caf50; font-size: 18px;">
              <span style="display: inline-block; width: 24px; height: 24px; background: #4caf50; color: white; border-radius: 50%; text-align: center; line-height: 24px; margin-right: 8px; font-size: 14px;">&#9200;</span>
              Verification Time
            </h3>
            <p style="margin: 5px 0; color: #666; font-size: 16px; font-weight: bold;">24-48 hours</p>
            <p style="margin: 5px 0; color: #999; font-size: 14px;">Thank you for your patience!</p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #f0f0f0;">
            <p style="color: #666; font-size: 14px; margin: 5px 0;">We'll notify you as soon as your shop is verified.</p>
            <p style="color: #999; font-size: 12px; margin: 5px 0;">If you have any questions, please don't hesitate to contact us.</p>
          </div>
          
          <div style="text-align: center; margin-top: 20px;">
            <p style="color: #999; font-size: 12px; margin: 0;">Best regards,</p>
            <p style="color: #667eea; font-size: 16px; font-weight: bold; margin: 5px 0;">EasyBook Team</p>
          </div>
        </div>
      </div>
    `;
    
    // Send email
    GmailApp.sendEmail(email, subject, body, {
      htmlBody: htmlBody,
      name: 'EasyBook Registration'
    });
    
    Logger.log('📧 Confirmation email sent successfully');
    return true;
    
  } catch (error) {
    Logger.log('❌ Confirmation email send failed: ' + error.toString());
    return false;
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Fix all existing rows in the sheet
 * Run this ONCE to fix historical data
 */
function fixAllExistingRows() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const lastRow = sheet.getLastRow();
  
  if (lastRow < 2) {
    SpreadsheetApp.getUi().alert('No data to fix');
    return;
  }
  
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert(
    'Fix All Rows',
    'This will fix ' + (lastRow - 1) + ' rows.\n\nContinue?',
    ui.ButtonSet.YES_NO
  );
  
  if (response !== ui.Button.YES) {
    return;
  }
  
  let fixed = 0;
  const errors = [];
  
  for (let row = 2; row <= lastRow; row++) {
    try {
      // Fix timestamp format
      const timestampCell = sheet.getRange(row, CONFIG.COL.TIMESTAMP);
      timestampCell.setNumberFormat('M/d/yyyy H:mm:ss');
      
      // Set counters to 0 if empty
      const counterCols = [
        CONFIG.COL.TOTAL_BOOKINGS, CONFIG.COL.PENDING, CONFIG.COL.CONFIRMED,
        CONFIG.COL.COMPLETED, CONFIG.COL.CANCELLED, CONFIG.COL.NO_SHOW, CONFIG.COL.REVENUE
      ];
      
      counterCols.forEach(col => {
        const cell = sheet.getRange(row, col);
        if (!cell.getValue()) {
          cell.setValue(0);
        }
      });
      
      // Clear duplicates
      sheet.getRange(row, CONFIG.COL.SHOP_ID_DUP).clearContent();
      sheet.getRange(row, CONFIG.COL.DUPLICATE_AA).clearContent();
      sheet.getRange(row, CONFIG.COL.DUPLICATE_AB).clearContent();
      
      // Set Verified to FALSE if empty
      const verifiedCell = sheet.getRange(row, CONFIG.COL.VERIFIED);
      if (verifiedCell.getValue() !== true && verifiedCell.getValue() !== false) {
        verifiedCell.setValue(false);
      }
      
      fixed++;
      
    } catch (error) {
      errors.push('Row ' + row + ': ' + error.message);
      Logger.log('Error fixing row ' + row + ': ' + error.toString());
    }
  }
  
  let message = '✅ Fixed ' + fixed + ' rows successfully!';
  if (errors.length > 0) {
    message += '\n\n⚠️ Errors:\n' + errors.join('\n');
  }
  
  ui.alert(message);
  Logger.log('Fix complete: ' + fixed + ' rows fixed, ' + errors.length + ' errors');
}

/**
 * Test verification on a specific row
 */
function testVerification() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt('Test Verification', 'Enter row number to test:', ui.ButtonSet.OK_CANCEL);
  
  if (response.getSelectedButton() === ui.Button.OK) {
    const row = parseInt(response.getResponseText());
    
    if (isNaN(row) || row < 2) {
      ui.alert('Invalid row number');
      return;
    }
    
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    try {
      processVerification(sheet, row);
      ui.alert('✅ Test completed!\n\nCheck execution log for details:\nExtensions > Apps Script > Executions');
    } catch (error) {
      ui.alert('❌ Test failed:\n' + error.message);
    }
  }
}

/**
 * View current configuration
 */
function showConfig() {
  const config = JSON.stringify(CONFIG, null, 2);
  Logger.log('Current Configuration:\n' + config);
  
  SpreadsheetApp.getUi().alert(
    'Configuration Details',
    'Configuration has been logged.\n\nView it at:\nExtensions > Apps Script > Executions',
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

/**
 * Fix broken QR formulas in existing rows
 */
function fixBrokenQRCodes() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const lastRow = sheet.getLastRow();
  
  if (lastRow < 2) {
    SpreadsheetApp.getUi().alert('No data rows found');
    return;
  }
  
  let fixed = 0;
  
  for (let row = 2; row <= lastRow; row++) {
    const qrCell = sheet.getRange(row, CONFIG.COL.QR_IMAGE);
    const cellValue = qrCell.getValue();
    const formula = qrCell.getFormula();
    
    // Check if cell has #NAME? error or broken formula
    if (cellValue === '#NAME?' || (formula && formula.includes('IMAGE'))) {
      const verified = sheet.getRange(row, CONFIG.COL.VERIFIED).getValue();
      
      if (verified === true) {
        // Regenerate QR code
        const shopId = sheet.getRange(row, CONFIG.COL.SHOP_ID).getValue();
        const shopName = sheet.getRange(row, CONFIG.COL.SHOP_NAME).getValue();
        
        if (shopId && shopName) {
          const formLink = CONFIG.FORM_TEMPLATE
            .replace('SHOPKEEPER_ID', encodeURIComponent(shopId))
            .replace('SHOP_NAME', encodeURIComponent(shopName));
          
          const qrUrl = 'https://quickchart.io/qr?text=' + encodeURIComponent(formLink) + '&size=300';
          const qrFormula = '=IMAGE("' + qrUrl + '",1)';
          
          qrCell.setFormula(qrFormula);
          fixed++;
          Logger.log('Fixed QR for row ' + row);
        }
      } else {
        // Clear if not verified
        qrCell.clearContent();
      }
    }
  }
  
  SpreadsheetApp.getUi().alert('✅ Fixed ' + fixed + ' QR codes!');
  Logger.log('QR fix complete: ' + fixed + ' codes fixed');
}

/**** CONFIG: Fill these before running ****/
const CONFIG = {
    ADMIN_EMAIL: 'hkhinchi.trellance@gmail.com',// Your email for admin notifications
    TIMEZONE: 'Asia/Kolkata',                   // India timezone
    FREE_BOOKINGS_PER_MONTH: 4,                 // Default; Settings sheet can override
    APPOINTMENT_DURATION_MINUTES: 60,           // Default; Settings sheet can override

    // Google Sheets IDs: open each spreadsheet and copy the long ID from its URL
    SHEETS: {
        // Note: Only the unique ID string is used here.
        SHOPKEEPERS_ID: '1aZ26GJtxYCCSrNkHlAXfPEN5E4IwBHqK6C9MioA121s',
        SHOPKEEPERS_TAB: 'Shopkeeper',
        APPOINTMENTS_ID: '1aZ26GJtxYCCSrNkHlAXfPEN5E4IwBHqK6C9MioA121s',
        APPOINTMENTS_TAB: 'Appointments',
        REVIEWS_ID: '1iSO7i3z22AZy6-ao30p4Zd5JvBxBoGwPCY5Jw_5dIAw',
        REVIEWS_TAB: 'Form Responses 1',
        SETTINGS_ID: '1bKZVoKGUcUj0qQyqTAAR5il6C0jBOs7aKdceHx_vWBE',
        SETTINGS_TAB: 'Settings'
    },

    // From Appointment Form → Get pre-filled link (where Shopkeeper ID was set to SHOPKEEPER_ID)
    BOOKING_FORM_PREFILLED_TEMPLATE: 'https://docs.google.com/forms/d/e/1FAIpQLSdZ8lz3hWkeeTgfaHtc7lAveHPzJjRHWq8Ns5cwvlkwoyDsIQ/viewform?usp=pp_url&entry.347594425=SHOPKEEPER_ID',

    // Optional: If you have a generic Razorpay Payment Link, paste it here (can be blank)
    PAYMENTS: {
        RAZORPAY_LINK: '' // e.g., https://rzp.io/l/your-link
    },

    // Web App URL: **UPDATE THIS AFTER YOU DEPLOY THE SCRIPT**
    WEBAPP_URL: 'https://script.google.com/macros/s/AKfycbyDEanJnZFA9rzVppha-nQVYeiH69jdVX_O0OkZ6cqW4vDzPsQ1t01HyXo4x8TgiYD6KA/exec'
};

/**** Column headers used in your Sheets ****/
const HEADERS = {
    // Shopkeepers form
    SK: {
        TIMESTAMP: 'Timestamp',
        OWNER: 'Owner Name',
        SHOP: 'Shop Name',
        EMAIL: 'Gmail (shop)',
        PHONE: 'Mobile',
        ADDRESS: 'Address',
        MAP: 'Google Map Link',
        DETAILS: 'Business Details',
        HOURS: 'Shop Timing',
        UPI: 'UPI ID',
        TELEGRAM: 'Telegram Username',
        VERIFIED: 'Verified',
        FOLDER_URL: 'Google drive link',
        QR_LINK: 'QR',
        ID: 'Shop ID',

        // New Time Slot Columns (P-X)
        SLOT1_START: 'Shop Time Start-1',
        SLOT1_END: 'Shop Time End-1',
        SLOT2_START: 'Shop Time Start-2',
        SLOT2_END: 'Shop Time End-2',
        SLOT3_START: 'Shop Time Start-3',
        SLOT3_END: 'Shop Time End-3',
        SLOT4_START: 'Shop Time Start-4',
        SLOT4_END: 'Shop Time End-4',
        BREAK_TIME: 'Break-Time',

        // Extra columns (appended if not present)
        MIN_CHARGE: 'Minimun services Charge',
        BOOKING_LINK: 'Booking Link',
        ONBOARDED_AT: 'Onboarded At'
    },

    // Appointments form
    APPT: {
        TIMESTAMP: 'Timestamp',
        SK_ID: 'Shopkeeper ID',
        NAME: 'Name',
        EMAIL: 'Gmail',
        PHONE: 'Phone number',
        ADDRESS: 'Address',
        DATE: 'Appointment date',
        TIME: 'Appointment time',

        // extra columns we add
        ID: 'Appointment ID',
        STATUS: 'Status',                 // pending_approval | awaiting_payment | approved | rejected
        PAID: 'Paid',                     // TRUE/FALSE
        APPROVAL_TOKEN: 'Approval Token',
        APPROVED_AT: 'Approved At',
        CAL_EVENT_ID: 'Calendar Event ID',
        LAST_ERROR: 'Last Error'
    },

    // Reviews form (optional)
    REV: {
        TIMESTAMP: 'Timestamp',
        SK_ID: 'Shopkeeper ID',
        RATING: 'Rating',
        TEXT: 'Review text',
        USER: 'Reviewer Gmail'
    }
};

/**** INSTALL/TRIGGERS ****/
function installAllTriggers() {
    ScriptApp.getProjectTriggers().forEach(t => ScriptApp.deleteTrigger(t));

    ScriptApp.newTrigger('onShopkeeperFormSubmit')
        .forSpreadsheet(CONFIG.SHEETS.SHOPKEEPERS_ID)
        .onFormSubmit()
        .create();

    ScriptApp.newTrigger('onAppointmentFormSubmit')
        .forSpreadsheet(CONFIG.SHEETS.APPOINTMENTS_ID)
        .onFormSubmit()
        .create();

    if (CONFIG.SHEETS.REVIEWS_ID && CONFIG.SHEETS.REVIEWS_ID !== 'PUT_REVIEWS_SHEET_ID_HERE') {
        ScriptApp.newTrigger('onReviewFormSubmit')
            .forSpreadsheet(CONFIG.SHEETS.REVIEWS_ID)
            .onFormSubmit()
            .create();
    }

    ensureAllColumns();
    Logger.log('Triggers installed and columns ensured.');
}

function ensureAllColumns() {
    const sk = getSheet(CONFIG.SHEETS.SHOPKEEPERS_ID, CONFIG.SHEETS.SHOPKEEPERS_TAB);
    // Ensure all SK headers exist
    ensureColumns(sk, Object.values(HEADERS.SK));

    const appt = getSheet(CONFIG.SHEETS.APPOINTMENTS_ID, CONFIG.SHEETS.APPOINTMENTS_TAB);
    ensureColumns(appt, [HEADERS.APPT.ID, HEADERS.APPT.STATUS, HEADERS.APPT.PAID, HEADERS.APPT.APPROVAL_TOKEN, HEADERS.APPT.APPROVED_AT, HEADERS.APPT.CAL_EVENT_ID, HEADERS.APPT.LAST_ERROR]);
}

/**** WEB APP HANDLER FOR REACT FORM ****/
function doPost(e) {
    const lock = LockService.getScriptLock();
    lock.tryLock(10000);

    try {
        // 1. Parse Data
        const data = JSON.parse(e.postData.contents);

        // 2. Get Sheet
        const sheet = getSheet(CONFIG.SHEETS.SHOPKEEPERS_ID, CONFIG.SHEETS.SHOPKEEPERS_TAB);
        if (!sheet) throw new Error("Shopkeepers sheet not found");

        // 3. Ensure Headers
        const neededHeaders = Object.values(HEADERS.SK);
        ensureColumns(sheet, neededHeaders);

        const headers = headerMap(sheet);

        // 4. Create Folder
        const parentFolder = getOrCreateFolder('EasyBook Shops');
        const shopFolder = parentFolder.createFolder(`${data.shopName} - ${data.phone}`);
        const folderUrl = shopFolder.getUrl();

        // 5. Prepare Data Row
        const row = sheet.getLastRow() + 1;

        // Format Business Details & Timing
        const timeSlotsString = data.timeSlots.map(slot => `${slot.start}-${slot.end}`).join(', ');
        const businessDetails = `Slots: ${timeSlotsString} | Break: ${data.breakDuration} mins | Min Charge: ${data.minCharge}`;

        // Set Basic Values
        setValue(sheet, row, headers, HEADERS.SK.TIMESTAMP, new Date());
        setValue(sheet, row, headers, HEADERS.SK.OWNER, data.ownerName);
        setValue(sheet, row, headers, HEADERS.SK.SHOP, data.shopName);
        setValue(sheet, row, headers, HEADERS.SK.EMAIL, data.email);
        setValue(sheet, row, headers, HEADERS.SK.PHONE, data.phone);
        setValue(sheet, row, headers, HEADERS.SK.ADDRESS, data.address);
        setValue(sheet, row, headers, HEADERS.SK.MAP, data.mapLink);
        setValue(sheet, row, headers, HEADERS.SK.DETAILS, businessDetails); // Or just leave empty if user wants specific columns only
        setValue(sheet, row, headers, HEADERS.SK.HOURS, timeSlotsString);
        setValue(sheet, row, headers, HEADERS.SK.MIN_CHARGE, data.minCharge);
        setValue(sheet, row, headers, HEADERS.SK.UPI, data.upiId);
        setValue(sheet, row, headers, HEADERS.SK.TELEGRAM, data.telegram);
        setValue(sheet, row, headers, HEADERS.SK.FOLDER_URL, folderUrl);

        // Set Time Slots (P-W)
        if (data.timeSlots && Array.isArray(data.timeSlots)) {
            if (data.timeSlots[0]) {
                setValue(sheet, row, headers, HEADERS.SK.SLOT1_START, data.timeSlots[0].start);
                setValue(sheet, row, headers, HEADERS.SK.SLOT1_END, data.timeSlots[0].end);
            }
            if (data.timeSlots[1]) {
                setValue(sheet, row, headers, HEADERS.SK.SLOT2_START, data.timeSlots[1].start);
                setValue(sheet, row, headers, HEADERS.SK.SLOT2_END, data.timeSlots[1].end);
            }
            if (data.timeSlots[2]) {
                setValue(sheet, row, headers, HEADERS.SK.SLOT3_START, data.timeSlots[2].start);
                setValue(sheet, row, headers, HEADERS.SK.SLOT3_END, data.timeSlots[2].end);
            }
            if (data.timeSlots[3]) {
                setValue(sheet, row, headers, HEADERS.SK.SLOT4_START, data.timeSlots[3].start);
                setValue(sheet, row, headers, HEADERS.SK.SLOT4_END, data.timeSlots[3].end);
            }
        }

        // Set Break Time (X)
        setValue(sheet, row, headers, HEADERS.SK.BREAK_TIME, data.breakDuration);

        // Generate ID and Links (Manual Onboarding)
        const shopId = 'SHP-' + Utilities.getUuid().slice(0, 8).toUpperCase();
        setValue(sheet, row, headers, HEADERS.SK.ID, shopId);
        setValue(sheet, row, headers, HEADERS.SK.VERIFIED, 'FALSE');

        const bookingLink = CONFIG.BOOKING_FORM_PREFILLED_TEMPLATE.replace('SHOPKEEPER_ID', encodeURIComponent(shopId));
        setValue(sheet, row, headers, HEADERS.SK.BOOKING_LINK, bookingLink);

        const qrLink = 'https://quickchart.io/qr?size=300&format=png&text=' + encodeURIComponent(bookingLink);
        // Use setFormula to ensure it renders as an image
        const qrCol = headers[HEADERS.SK.QR_LINK];
        if (qrCol) sheet.getRange(row, qrCol).setFormula(`=IMAGE("${qrLink}", 1)`);

        setValue(sheet, row, headers, HEADERS.SK.ONBOARDED_AT, new Date());

        // Send Email
        const subject = `Your booking QR and link for ${data.shopName}`;
        const htmlBody = `
            <p>Hi,</p>
            <p>Share this link and QR with customers to take appointments:</p>
            <p><strong>Booking link:</strong> <a href="${bookingLink}">${bookingLink}</a></p>
            <p><strong>QR Code:</strong></p>
            <img src="${qrLink}" alt="QR Code" width="300" height="300" />
            <p>Note: Approvals will start working after Admin verifies your shop.</p>
            <p>Thanks!</p>
        `;

        MailApp.sendEmail({ to: data.email, subject, htmlBody: htmlBody });

        return ContentService.createTextOutput(JSON.stringify({ status: 'success', message: 'Data saved', folderUrl: folderUrl }))
            .setMimeType(ContentService.MimeType.JSON);

    } catch (e) {
        return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: e.toString() }))
            .setMimeType(ContentService.MimeType.JSON);
    } finally {
        lock.releaseLock();
    }
}

/**** SHOPKEEPER REGISTRATION: create ID, booking link, QR, email ****/
function onShopkeeperFormSubmit(e) {
    const sheet = e.range.getSheet();
    if (sheet.getName() !== CONFIG.SHEETS.SHOPKEEPERS_TAB) return;

    const row = e.range.getRow();
    const headers = headerMap(sheet);
    const email = getValue(sheet, row, headers, HEADERS.SK.EMAIL);
    const shop = getValue(sheet, row, headers, HEADERS.SK.SHOP);

    const shopId = 'SHP-' + Utilities.getUuid().slice(0, 8).toUpperCase();
    setValue(sheet, row, headers, HEADERS.SK.ID, shopId);
    setValue(sheet, row, headers, HEADERS.SK.VERIFIED, 'FALSE'); // Admin flips to TRUE after review

    const bookingLink = CONFIG.BOOKING_FORM_PREFILLED_TEMPLATE.replace('SHOPKEEPER_ID', encodeURIComponent(shopId));
    setValue(sheet, row, headers, HEADERS.SK.BOOKING_LINK, bookingLink);

    // *** UPDATED: Using QuickChart.io QR API as Google Chart is deprecated ***
    // Parameters: size=300, format=png, text=<URL>
    const qrLink = 'https://quickchart.io/qr?size=300&format=png&text=' + encodeURIComponent(bookingLink);
    const qrCol = headers[HEADERS.SK.QR_LINK];
    if (qrCol) sheet.getRange(row, qrCol).setFormula(`=IMAGE("${qrLink}", 1)`);

    setValue(sheet, row, headers, HEADERS.SK.ONBOARDED_AT, new Date());

    const subject = `Your booking QR and link for ${shop}`;
    const htmlBody = `
        <p>Hi,</p>
        <p>Share this link and QR with customers to take appointments:</p>
        <p><strong>Booking link:</strong> <a href="${bookingLink}">${bookingLink}</a></p>
        <p><strong>QR Code:</strong></p>
        <img src="${qrLink}" alt="QR Code" width="300" height="300" />
        <p>Note: Approvals will start working after Admin verifies your shop.</p>
        <p>Thanks!</p>
    `;

    MailApp.sendEmail({ to: email, subject, htmlBody: htmlBody });
}

/**** APPOINTMENT SUBMISSION: enforce free limit, send approve/reject to shopkeeper ****/
function onAppointmentFormSubmit(e) {
    const sheet = e.range.getSheet();
    if (sheet.getName() !== CONFIG.SHEETS.APPOINTMENTS_TAB) return;

    const row = e.range.getRow();
    const headers = headerMap(sheet);

    const apptId = 'APT-' + Utilities.getUuid().slice(0, 8).toUpperCase();
    setValue(sheet, row, headers, HEADERS.APPT.ID, apptId);
    setValue(sheet, row, headers, HEADERS.APPT.PAID, 'FALSE');

    const skId = getValue(sheet, row, headers, HEADERS.APPT.SK_ID);
    const sk = findShopkeeperById(skId);
    if (!sk) {
        setValue(sheet, row, headers, HEADERS.APPT.STATUS, 'rejected');
        setValue(sheet, row, headers, HEADERS.APPT.LAST_ERROR, 'Invalid Shopkeeper ID');
        return;
    }

    const settings = getSettings();
    const freeLimit = parseInt(settings.freeBookingsPerMonth || CONFIG.FREE_BOOKINGS_PER_MONTH, 10);

    const userEmail = getValue(sheet, row, headers, HEADERS.APPT.EMAIL);
    const alreadyApproved = countApprovedThisMonth(userEmail);

    if (!sk.verified) {
        setValue(sheet, row, headers, HEADERS.APPT.STATUS, 'pending_approval');
        MailApp.sendEmail(CONFIG.ADMIN_EMAIL, 'Shopkeeper not verified yet', `Appointment ${apptId} for SK ${skId} submitted but shopkeeper not verified.`);
        MailApp.sendEmail(userEmail, 'Booking received - pending shop verification', `We received your booking but the shop is not verified yet. You will be notified after verification.`);
        return;
    }

    if (alreadyApproved >= freeLimit) {
        // Payment required → email user with UPI and optional Razorpay link
        setValue(sheet, row, headers, HEADERS.APPT.STATUS, 'awaiting_payment');
        const upi = sk.upi || '';
        const upiUri = upi ? buildUpiUri(upi, sk.shopName, apptId) : '';
        const payLines = [];
        payLines.push(`You have used your ${freeLimit} free bookings this month.`);
        payLines.push(`Please pay half the service charges to confirm your appointment.`);
        if (upi) {
            payLines.push('');
            payLines.push(`Pay via UPI: ${upi}`);
            if (upiUri) payLines.push(`One-tap UPI link (mobile): ${upiUri}`);
        }
        if (CONFIG.PAYMENTS.RAZORPAY_LINK) {
            payLines.push('');
            payLines.push(`Or pay using this link: ${CONFIG.PAYMENTS.RAZORPAY_LINK}`);
        }
        payLines.push('');
        payLines.push(`After payment, reply to this email with your UTR/receipt.`);
        payLines.push(`Appointment ID: ${apptId}`);
        payLines.push(`Shop: ${sk.shopName}`);

        MailApp.sendEmail({
            to: userEmail,
            subject: 'Payment required to confirm your appointment',
            htmlBody: payLines.join('<br>')
        });
        return;
    }

    // Within free limit → send approve/reject to shopkeeper
    const token = sign(apptId);
    setValue(sheet, row, headers, HEADERS.APPT.APPROVAL_TOKEN, token);
    setValue(sheet, row, headers, HEADERS.APPT.STATUS, 'pending_approval');

    const approveUrl = webappUrl() + `?action=approve&id=${encodeURIComponent(apptId)}&t=${encodeURIComponent(token)}`;
    const rejectUrl = webappUrl() + `?action=reject&id=${encodeURIComponent(apptId)}&t=${encodeURIComponent(token)}`;

    const userName = getValue(sheet, row, headers, HEADERS.APPT.NAME);
    const apptDate = getValue(sheet, row, headers, HEADERS.APPT.DATE);
    const apptTime = getValue(sheet, row, headers, HEADERS.APPT.TIME);

    const subject = `New appointment request: ${userName} on ${fmt(apptDate)} ${fmt(apptTime)}`;
    const body = [
        `Hi ${sk.ownerName || sk.shopName},`,
        ``,
        `New request from ${userName} (${userEmail})`,
        `When: ${fmt(apptDate)} ${fmt(apptTime)}`,
        ``,
        `Approve: ${approveUrl}`,
        `Reject: ${rejectUrl}`,
        ``,
        `Appointment ID: ${apptId}`,
        `Thanks!`
    ].join('\n');

    MailApp.sendEmail({ to: sk.email, subject, htmlBody: body.replace(/\n/g, '<br>') });
}

/**** APPROVE/REJECT HANDLER (Web App) ****/
function doGet(e) {
    try {
        const action = (e.parameter.action || '').toLowerCase();
        const apptId = e.parameter.id;
        const token = e.parameter.t;

        if (!apptId || !token || !verify(apptId, token)) {
            return html('Invalid or expired link.');
        }

        const apptSheet = getSheet(CONFIG.SHEETS.APPOINTMENTS_ID, CONFIG.SHEETS.APPOINTMENTS_TAB);
        const headers = headerMap(apptSheet);

        const row = findRowByValue(apptSheet, headers, HEADERS.APPT.ID, apptId);
        if (row <= 0) return html('Appointment not found.');
        const status = (getValue(apptSheet, row, headers, HEADERS.APPT.STATUS) || '').toString();

        if (action === 'reject') {
            setValue(apptSheet, row, headers, HEADERS.APPT.STATUS, 'rejected');
            return html('Appointment rejected.');
        }
        if (action !== 'approve') return html('Unknown action.');

        const paid = (getValue(apptSheet, row, headers, HEADERS.APPT.PAID) || '').toString().toUpperCase() === 'TRUE';
        if (status === 'awaiting_payment' && !paid) {
            return html('Payment required before approval. Please confirm payment and try again.');
        }

        // Build start/end time
        const dateVal = getValue(apptSheet, row, headers, HEADERS.APPT.DATE);
        const timeVal = getValue(apptSheet, row, headers, HEADERS.APPT.TIME);
        const start = parseDateTime(dateVal, timeVal, CONFIG.TIMEZONE);
        if (!start) return html('Could not parse date/time. Please ensure form fields are Date and Time types, and sheet timezone is Asia/Kolkata.');
        const durationMin = parseInt(getSettings().appointmentDurationMinutes || CONFIG.APPOINTMENT_DURATION_MINUTES, 10);
        const end = new Date(start.getTime() + durationMin * 60000);

        const userName = getValue(apptSheet, row, headers, HEADERS.APPT.NAME);
        const userEmail = getValue(apptSheet, row, headers, HEADERS.APPT.EMAIL);
        const skId = getValue(apptSheet, row, headers, HEADERS.APPT.SK_ID);
        const sk = findShopkeeperById(skId);
        const title = `Appointment with ${userName}${sk ? ' - ' + sk.shopName : ''}`;

        // Create event on approver's default calendar (since web app runs as the user accessing)
        const event = CalendarApp.getDefaultCalendar().createEvent(title, start, end, {
            guests: userEmail,
            sendInvites: true
        });

        setValue(apptSheet, row, headers, HEADERS.APPT.STATUS, 'approved');
        setValue(apptSheet, row, headers, HEADERS.APPT.APPROVED_AT, new Date());
        setValue(apptSheet, row, headers, HEADERS.APPT.CAL_EVENT_ID, event.getId());

        return html(`Appointment approved and added to your calendar.<br>Event ID: ${event.getId()}`);
    } catch (err) {
        return html('Error: ' + err);
    }
}

/**** Optional: Reviews submission handler (respects Settings) ****/
function onReviewFormSubmit(e) {
    const settings = getSettings();
    const enabled = (settings.reviewsEnabled || 'TRUE').toString().toUpperCase() === 'TRUE';
    if (!enabled) return;
    // Extend if needed: dedupe reviews, notify admin, etc.
}

/************* Utilities *************/
function getSheet(ssId, tab) {
    const ss = SpreadsheetApp.openById(ssId);
    return ss.getSheetByName(tab);
}

function headerMap(sheet) {
    const headers = (sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0] || []);
    const map = {};
    headers.forEach((h, i) => map[h] = i + 1);
    return map;
}

function ensureColumns(sheet, needed) {
    const map = headerMap(sheet);
    let lastCol = sheet.getLastColumn();
    needed.forEach(colName => {
        if (!map[colName]) {
            lastCol += 1;
            sheet.getRange(1, lastCol).setValue(colName);
            map[colName] = lastCol;
        }
    });
}

function getValue(sheet, row, headers, colName) {
    const col = headers[colName];
    return col ? sheet.getRange(row, col).getValue() : '';
}

function setValue(sheet, row, headers, colName, value) {
    const col = headers[colName];
    if (!col) return;
    sheet.getRange(row, col).setValue(value);
}

function findRowByValue(sheet, headers, colName, value) {
    const col = headers[colName];
    if (!col) return -1;
    const values = sheet.getRange(2, col, Math.max(sheet.getLastRow() - 1, 0)).getValues().flat();
    const idx = values.findIndex(v => (v || '').toString() === (value || '').toString());
    return idx >= 0 ? idx + 2 : -1;
}

function findShopkeeperById(skId) {
    if (!skId) return null;
    const sheet = getSheet(CONFIG.SHEETS.SHOPKEEPERS_ID, CONFIG.SHEETS.SHOPKEEPERS_TAB);
    const headers = headerMap(sheet);
    const row = findRowByValue(sheet, headers, HEADERS.SK.ID, skId);
    if (row <= 0) return null;
    return {
        row,
        id: skId,
        email: getValue(sheet, row, headers, HEADERS.SK.EMAIL),
        shopName: getValue(sheet, row, headers, HEADERS.SK.SHOP),
        ownerName: getValue(sheet, row, headers, HEADERS.SK.OWNER),
        upi: getValue(sheet, row, headers, HEADERS.SK.UPI),
        verified: (getValue(sheet, row, headers, HEADERS.SK.VERIFIED) || '').toString().toUpperCase() === 'TRUE',
        bookingLink: getValue(sheet, row, headers, HEADERS.SK.BOOKING_LINK),
        qr: getValue(sheet, row, headers, HEADERS.SK.QR_LINK)
    };
}

function countApprovedThisMonth(userEmail) {
    const sheet = getSheet(CONFIG.SHEETS.APPOINTMENTS_ID, CONFIG.SHEETS.APPOINTMENTS_TAB);
    const headers = headerMap(sheet);
    const emailCol = headers[HEADERS.APPT.EMAIL];
    const statusCol = headers[HEADERS.APPT.STATUS];
    const timestampCol = headers[HEADERS.APPT.TIMESTAMP];
    if (!emailCol || !statusCol || !timestampCol) return 0;

    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return 0;

    const emails = sheet.getRange(2, emailCol, lastRow - 1).getValues().flat();
    const statuses = sheet.getRange(2, statusCol, lastRow - 1).getValues().flat();
    const times = sheet.getRange(2, timestampCol, lastRow - 1).getValues().flat();

    const now = new Date();
    const thisMonthKey = keyMonth(now);
    let count = 0;
    for (let i = 0; i < emails.length; i++) {
        if ((emails[i] || '').toString().toLowerCase() !== (userEmail || '').toString().toLowerCase()) continue;
        if ((statuses[i] || '').toString().toLowerCase() !== 'approved') continue;
        const ts = times[i] instanceof Date ? times[i] : new Date(times[i]);
        if (keyMonth(ts) === thisMonthKey) count++;
    }
    return count;
}

function keyMonth(d) {
    return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2);
}

// Parse Date + Time from Sheets (works with Date objects, strings, or time numbers)
function parseDateTime(dateVal, timeVal, tz) {
    let y, m, d;

    // Date part
    if (dateVal instanceof Date) {
        y = dateVal.getFullYear();
        m = dateVal.getMonth() + 1;
        d = dateVal.getDate();
    } else if (typeof dateVal === 'string') {
        const s = dateVal.trim();
        if (s.includes('-')) { // YYYY-MM-DD
            const [Y, M, D] = s.split('-').map(n => parseInt(n, 10));
            y = Y; m = M; d = D;
        } else if (s.includes('/')) { // DD/MM/YYYY or MM/DD/YYYY; assume DD/MM/YYYY for India
            const [a, b, c] = s.split('/').map(n => parseInt(n, 10));
            if (a > 12) { d = a; m = b; y = c; } else { m = a; d = b; y = c; }
        } else {
            return null;
        }
    } else {
        return null;
    }

    // Time part
    let hours = 9, mins = 0;
    if (timeVal instanceof Date) {
        hours = timeVal.getHours();
        mins = timeVal.getMinutes();
    } else if (typeof timeVal === 'number') {
        const totalMinutes = Math.round(timeVal * 24 * 60);
        hours = Math.floor(totalMinutes / 60);
        mins = totalMinutes % 60;
    } else if (typeof timeVal === 'string') {
        const t = timeVal.trim().toUpperCase();
        const ampm = t.endsWith('AM') || t.endsWith('PM') ? t.slice(-2) : '';
        const num = t.replace(/[^\d:]/g, '');
        const [hh, mm] = num.split(':').map(s => parseInt(s, 10));
        if (!isNaN(hh)) hours = hh;
        if (!isNaN(mm)) mins = mm;
        if (ampm === 'PM' && hours < 12) hours += 12;
        if (ampm === 'AM' && hours === 12) hours = 0;
    }

    const dt = new Date();
    dt.setFullYear(y, (m - 1), d);
    dt.setHours(hours, mins, 0, 0);
    return dt;
}

function buildUpiUri(upiId, shopName, apptId) {
    if (!upiId) return '';
    const params = [
        'pa=' + encodeURIComponent(upiId),
        'pn=' + encodeURIComponent(shopName || 'Shop'),
        'cu=INR',
        'tn=' + encodeURIComponent('Appointment ' + apptId)
        // Note: skipping am= so user can enter amount manually
    ].join('&');
    return 'upi://pay?' + params;
}

function fmt(val) {
    if (val instanceof Date) {
        return Utilities.formatDate(val, CONFIG.TIMEZONE, 'dd/MM/yyyy HH:mm');
    }
    return String(val);
}

/**** Token helpers for approve/reject links ****/
function getSecret() {
    const props = PropertiesService.getScriptProperties();
    let secret = props.getProperty('HMAC_SECRET');
    if (!secret) {
        secret = Utilities.getUuid() + Utilities.getUuid();
        props.setProperty('HMAC_SECRET', secret);
    }
    return secret;
}
function sign(apptId) {
    const mac = Utilities.computeHmacSha256Signature(apptId, getSecret());
    return Utilities.base64EncodeWebSafe(mac);
}
function verify(apptId, token) {
    return token === sign(apptId);
}

function html(msg) {
    return HtmlService.createHtmlOutput(`<div style="font-family:system-ui;line-height:1.5;padding:24px;">${msg}</div>`);
}

function webappUrl() {
    return CONFIG.WEBAPP_URL && CONFIG.WEBAPP_URL.length > 0 ? CONFIG.WEBAPP_URL : ScriptApp.getService().getUrl();
}

// Optional helper to rebuild links for already-verified shopkeepers
function onboardAllVerifiedShopkeepers() {
    const sheet = getSheet(CONFIG.SHEETS.SHOPKEEPERS_ID, CONFIG.SHEETS.SHOPKEEPERS_TAB);
    const headers = headerMap(sheet);
    const lastRow = sheet.getLastRow();
    for (let row = 2; row <= lastRow; row++) {
        const verified = (getValue(sheet, row, headers, HEADERS.SK.VERIFIED) || '').toString().toUpperCase() === 'TRUE';
        const id = getValue(sheet, row, headers, HEADERS.SK.ID);
        if (!verified || !id) continue;

        const bookingLinkCell = getValue(sheet, row, headers, HEADERS.SK.BOOKING_LINK);
        if (!bookingLinkCell) {
            const link = CONFIG.BOOKING_FORM_PREFILLED_TEMPLATE.replace('SHOPKEEPER_ID', encodeURIComponent(id));
            setValue(sheet, row, headers, HEADERS.SK.BOOKING_LINK, link);
            // *** UPDATED: Using QuickChart.io QR API ***
            const qr = 'https://quickchart.io/qr?size=300&format=png&text=' + encodeURIComponent(link);
            const qrCol = headers[HEADERS.SK.QR_LINK];
            if (qrCol) sheet.getRange(row, qrCol).setFormula(`=IMAGE("${qr}", 1)`);

            setValue(sheet, row, headers, HEADERS.SK.ONBOARDED_AT, new Date());
        }
    }
}

/**** Settings loader ****/
function getSettings() {
    const out = {
        reviewsEnabled: 'TRUE',
        freeBookingsPerMonth: CONFIG.FREE_BOOKINGS_PER_MONTH,
        appointmentDurationMinutes: CONFIG.APPOINTMENT_DURATION_MINUTES
    };
    try {
        const s = getSheet(CONFIG.SHEETS.SETTINGS_ID, CONFIG.SHEETS.SETTINGS_TAB);
        const map = headerMap(s);
        const keyCol = map['key'];
        const valCol = map['value'];
        if (!keyCol || !valCol) return out;
        const last = s.getLastRow();
        if (last < 2) return out;
        const keys = s.getRange(2, keyCol, last - 1).getValues().flat();
        const vals = s.getRange(2, valCol, last - 1).getValues().flat();
        for (let i = 0; i < keys.length; i++) {
            const k = (keys[i] || '').toString();
            if (!k) continue;
            out[k] = vals[i];
        }
    } catch (e) { }
    return out;
}

function getOrCreateFolder(folderName) {
    const folders = DriveApp.getFoldersByName(folderName);
    if (folders.hasNext()) {
        return folders.next();
    } else {
        return DriveApp.createFolder(folderName);
    }
}

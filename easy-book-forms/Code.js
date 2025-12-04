function doPost(e) {
    const lock = LockService.getScriptLock();
    lock.tryLock(10000);

    try {
        const doc = SpreadsheetApp.getActiveSpreadsheet();
        const sheet = doc.getSheetByName('Shops') || doc.insertSheet('Shops');

        // Parse the data
        // We expect the data to be sent as a JSON string in the post body
        const data = JSON.parse(e.postData.contents);

        // Create headers if they don't exist
        if (sheet.getLastRow() === 0) {
            sheet.appendRow([
                'Timestamp',
                'Owner Name',
                'Shop Name',
                'Gmail (shop)',
                'Mobile',
                'Address',
                'Google Map Link',
                'Business Details',
                'Minimun services Charge',
                'UPI ID',
                'Telegram Username',
                'Verified',
                'Folder URL'
            ]);
        }

        // Create the clone folder
        // We'll create a folder named after the shop or a generic "EasyBook Shops" folder with subfolders
        const parentFolder = getOrCreateFolder('EasyBook Shops');
        const shopFolder = parentFolder.createFolder(`${data.shopName} - ${data.phone}`);
        const folderUrl = shopFolder.getUrl();

        // Format time slots and break duration for Business Details
        const timeSlotsString = data.timeSlots.map(slot => `${slot.start}-${slot.end}`).join(', ');
        const businessDetails = `Slots: ${timeSlotsString} | Break: ${data.breakDuration} mins`;

        // Append the data
        sheet.appendRow([
            new Date(),           // Timestamp
            data.ownerName,       // Owner Name
            data.shopName,        // Shop Name
            data.email,           // Gmail (shop)
            data.phone,           // Mobile
            data.address,         // Address
            data.mapLink,         // Google Map Link
            businessDetails,      // Business Details
            data.minCharge,       // Minimun services Charge
            data.upiId,           // UPI ID
            data.telegram,        // Telegram Username
            false,                // Verified (Default FALSE)
            folderUrl             // Folder URL
        ]);

        return ContentService.createTextOutput(JSON.stringify({ status: 'success', message: 'Data saved', folderUrl: folderUrl }))
            .setMimeType(ContentService.MimeType.JSON);

    } catch (e) {
        return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: e.toString() }))
            .setMimeType(ContentService.MimeType.JSON);
    } finally {
        lock.releaseLock();
    }
}

function getOrCreateFolder(folderName) {
    const folders = DriveApp.getFoldersByName(folderName);
    if (folders.hasNext()) {
        return folders.next();
    } else {
        return DriveApp.createFolder(folderName);
    }
}

function setup() {
    const doc = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = doc.getSheetByName('Shops') || doc.insertSheet('Shops');
    if (sheet.getLastRow() === 0) {
        sheet.appendRow([
            'Timestamp',
            'Owner Name',
            'Shop Name',
            'Gmail (shop)',
            'Mobile',
            'Address',
            'Google Map Link',
            'Business Details',
            'Minimun services Charge',
            'UPI ID',
            'Telegram Username',
            'Verified',
            'Folder URL'
        ]);
    }
}

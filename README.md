# Employee Registration Form

A simple, clean employee registration form that collects essential employee data and sends it to Google Sheets for contract generation.

## Features

- ✅ Responsive design using Bootstrap 5
- ✅ Real-time form validation
- ✅ Integration with Google Sheets
- ✅ Modern UI with professional styling
- ✅ Required field validation
- ✅ Email and phone number validation
- ✅ Date validation (birth date and start date)
- ✅ Salary validation
- ✅ Success/error messaging

## Form Fields

### Personal Information
- First Name (required)
- Last Name (required)
- Email Address (required)
- Phone Number (required)
- Date of Birth (required)
- ID Number (required)

### Employment Information
- Position (required)
- Department (required)
- Proposed Start Date (required)
- Employment Type (required)
- Expected Annual Salary (required)

### Address Information
- Street Address (required)
- City (required)
- State (required)
- ZIP Code (required)

### Emergency Contact
- Full Name (required)
- Relationship (required)
- Phone Number (required)
- Email Address (optional)

### Additional Information
- Additional Comments (optional)

## Setup Instructions

### 1. Google Sheets Setup

1. Create a new Google Sheet
2. Set up columns with the following headers in the first row:
   ```
   Timestamp | First Name | Last Name | Email | Phone | Birth Date | ID Number | Position | Department | Start Date | Employment Type | Salary | Street Address | City | ZIP Code | Additional Info | Agreement | Data Processing Consent
   ```

### 2. Google Apps Script Setup

1. In your Google Sheet, go to `Extensions > Apps Script`
2. Replace the default code with the following:

```javascript
function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSheet();
    const data = JSON.parse(e.postData.contents);
      // Prepare row data in the same order as headers
    const rowData = [
      data.timestamp || new Date().toISOString(),
      data.firstName || '',
      data.lastName || '',
      data.email || '',
      data.phone || '',
      data.birthDate || '',
      data.idNumber || '',
      data.position || '',
      data.department || '',
      data.startDate || '',
      data.employmentType || '',
      data.salary || '',      data.streetAddress || '',
      data.city || '',
      data.zipCode || '',
      data.additionalInfo || '',
      data.agreement || 'false',
      data.dataProcessingConsent || 'false'
    ];
    
    // Append the data to the sheet
    sheet.appendRow(rowData);
    
    return ContentService
      .createTextOutput(JSON.stringify({result: 'success'}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({result: 'error', error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

3. Save the script
4. Click `Deploy > New Deployment`
5. Choose `Web app` as the type
6. Set `Execute as` to "Me"
7. Set `Who has access` to "Anyone"
8. Click `Deploy`
9. Copy the Web App URL

### 3. Update the Form

1. Open `registration-form.js`
2. Replace `YOUR_SCRIPT_ID_HERE` in the `GOOGLE_SHEET_SCRIPT_URL` variable with your actual Web App URL

### 4. Testing

1. Open `index.html` in a web browser
2. Fill out the form and submit
3. Check your Google Sheet to verify the data was received

## File Structure

```
demo-form-for-document-generator/
├── index.html                 # Main HTML form
├── registration-form.css      # Custom styles
├── registration-form.js       # Form functionality and validation
├── README.md                  # This file
└── images/
    ├── background-normal.jpg  # Background image
    └── favicon.ico           # Website icon
```

## Customization

### Adding New Fields
1. Add the field to `index.html`
2. Add validation logic in `registration-form.js` if needed
3. Update the Google Apps Script to handle the new field
4. Add the new column header to your Google Sheet

### Styling
- Modify `registration-form.css` to change colors, fonts, or layout
- Bootstrap classes can be modified directly in the HTML

### Validation Rules
- Update the validation functions in `registration-form.js`
- Add new validation rules as needed

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Security Notes

- The form uses HTTPS for Google Sheets submission
- Personal data is transmitted securely
- Consider implementing additional server-side validation for production use
- Add CAPTCHA for public-facing forms to prevent spam

## License

This project is open source and available under the MIT License.

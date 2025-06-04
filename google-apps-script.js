/**
 * Google Apps Script for Employee Registration Form
 * 
 * This script handles POST requests from the employee registration form
 * and saves the data to a Google Sheet for contract generation.
 * 
 * Setup Instructions:
 * 1. Create a new Google Sheet
 * 2. Add headers in the first row (see README.md for column list)
 * 3. Open Extensions > Apps Script
 * 4. Replace default code with this script
 * 5. Deploy as Web App with access set to "Anyone"
 * 6. Copy the Web App URL to your JavaScript file
 */

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSheet();
    const data = JSON.parse(e.postData.contents);
      // Log the received data for debugging
    console.log('Received data:', data);
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
      data.salary || '',
      data.streetAddress || '',
      data.city || '',
      data.zipCode || '',
      data.additionalInfo || '',
      data.agreement || 'false',
      data.dataProcessingConsent || 'false'
    ];
    
    // Append the data to the sheet
    sheet.appendRow(rowData);
    
    // Optional: Send confirmation email
    if (data.email) {
      sendConfirmationEmail(data);
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({result: 'success', message: 'Registration received successfully'}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error processing registration:', error);
    return ContentService
      .createTextOutput(JSON.stringify({result: 'error', error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Optional: Send confirmation email to the employee
 */
function sendConfirmationEmail(data) {
  try {
    const subject = 'Employee Registration Confirmation';
    const body = `
Dear ${data.firstName} ${data.lastName},

Thank you for submitting your employee registration form. We have received your information and will process your employment contract shortly.

Registration Details:
- Position: ${data.position}
- Department: ${data.department}
- Start Date: ${data.startDate}
- Employment Type: ${data.employmentType}

You will receive your employment contract via email within 2-3 business days.

If you have any questions, please contact our HR department.

Best regards,
HR Department
    `;
    
    MailApp.sendEmail(data.email, subject, body);
    console.log('Confirmation email sent to:', data.email);
  } catch (error) {
    console.error('Error sending confirmation email:', error);
  }
}

/**
 * Optional: Test function to verify the script works
 */
function testScript() {  const testData = {    timestamp: new Date().toISOString(),
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '555-1234',
    birthDate: '1990-01-01',
    idNumber: 'DL123456789',
    position: 'Software Developer',
    department: 'Information Technology',
    startDate: '2025-07-01',
    employmentType: 'Full-time',
    salary: '75000',
    streetAddress: '123 Main St',
    city: 'Anytown',
    zipCode: '12345',
    additionalInfo: 'Test registration',
    agreement: 'true',
    dataProcessingConsent: 'true'
  };
  
  const mockEvent = {
    postData: {
      contents: JSON.stringify(testData)
    }
  };
  
  const result = doPost(mockEvent);
  console.log('Test result:', result.getContent());
}

document.addEventListener('DOMContentLoaded', function () {
    const registrationForm = document.getElementById('registrationForm');
      // Configuration - Replace with your actual Google Apps Script Web App URL
    const GOOGLE_SHEET_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwYppDQoB0BYmhyADnrpSG9SXvn07R22167wpAse0rlN6ltLGYYicPbuUpZSkpqQSNk/exec";
    
    // Form validation and submission
    registrationForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validateForm()) {
            submitForm();
        }
    });
    
    // Form validation
    function validateForm() {
        const form = registrationForm;
        let isValid = true;
        
        // Remove previous validation feedback
        const invalidFeedbacks = form.querySelectorAll('.invalid-feedback');
        invalidFeedbacks.forEach(feedback => feedback.remove());
        
        const invalidInputs = form.querySelectorAll('.is-invalid');
        invalidInputs.forEach(input => input.classList.remove('is-invalid'));
          // Required fields validation
        const requiredFields = form.querySelectorAll('[required]');
        requiredFields.forEach(field => {
            if (field.type === 'checkbox') {
                if (!field.checked) {
                    showFieldError(field, getTranslatedText('validation.checkboxRequired'));
                    isValid = false;
                }
            } else if (!field.value.trim()) {
                showFieldError(field, getTranslatedText('validation.fieldRequired'));
                isValid = false;
            }
        });
          // Email validation
        const emailField = document.getElementById('email');
        if (emailField.value && !isValidEmail(emailField.value)) {
            showFieldError(emailField, getTranslatedText('validation.emailInvalid'));
            isValid = false;
        }
          // Phone validation
        const phoneField = document.getElementById('phone');
        if (phoneField.value && !isValidPhone(phoneField.value)) {
            showFieldError(phoneField, getTranslatedText('validation.phoneInvalid'));
            isValid = false;
        }
        
        // Date validations
        const birthDate = document.getElementById('birthDate');
        const startDate = document.getElementById('startDate');
        
        if (birthDate.value) {
            const birthDateValue = new Date(birthDate.value);
            const today = new Date();
            const minAge = new Date();
            minAge.setFullYear(today.getFullYear() - 16); // Minimum 16 years old
              if (birthDateValue > minAge) {
                showFieldError(birthDate, getTranslatedText('validation.ageMinimum'));
                isValid = false;
            }
        }
        
        if (startDate.value) {
            const startDateValue = new Date(startDate.value);
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Reset time to compare dates only
              if (startDateValue < today) {
                showFieldError(startDate, getTranslatedText('validation.startDatePast'));
                isValid = false;
            }
        }
          // Salary validation
        const salaryField = document.getElementById('salary');
        if (salaryField.value) {
            const salary = parseFloat(salaryField.value);
            if (salary <= 0) {
                showFieldError(salaryField, getTranslatedText('validation.salaryMinimum'));
                isValid = false;
            }
        }
        
        return isValid;
    }
    
    // Show field error
    function showFieldError(field, message) {
        field.classList.add('is-invalid');
        
        const feedback = document.createElement('div');
        feedback.className = 'invalid-feedback';
        feedback.textContent = message;
        
        field.parentNode.appendChild(feedback);
    }
    
    // Email validation
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }    // Phone validation (very loose format check for international compatibility)
    function isValidPhone(phone) {
        // Remove all non-digit characters except + for international format
        const cleanPhone = phone.replace(/[\s\-\(\)\.\+]/g, '');
        
        // Very loose validation:
        // - Must contain at least 7 digits (minimum for any valid phone)
        // - Can be up to 15 digits (international standard maximum)
        // - Allows any combination of digits
        return /^\d{7,15}$/.test(cleanPhone);
    }
    
    // Submit form data to Google Sheets
    function submitForm() {
        const formData = collectFormData();
        const submitButton = registrationForm.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.innerHTML;
        
        // Show loading state
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status"></span>Submitting...';
        
        // Prepare data for Google Sheets
        const payload = {
            timestamp: new Date().toISOString(),
            ...formData
        };
        
        // Submit to Google Sheets
        fetch(GOOGLE_SHEET_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        })
        .then(() => {
            // Success - show success message
            showSuccessMessage();
            registrationForm.reset();
        })        .catch(error => {
            console.error('Error submitting form:', error);
            showErrorMessage(getTranslatedText('error.submission'));
        })
        .finally(() => {
            // Reset button state
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonText;
        });
        
        // Note: Due to CORS policy with Google Apps Script, we can't get a direct response
        // The form will show success immediately. In production, you might want to implement
        // a webhook or alternative confirmation method.
    }
    
    // Collect form data
    function collectFormData() {
        const formData = new FormData(registrationForm);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        return data;
    }
      // Show success message
    function showSuccessMessage() {
        const alertHtml = `
            <div class="alert alert-success alert-dismissible fade show" role="alert">
                <i class="bi bi-check-circle-fill me-2"></i>
                <strong>${getTranslatedText('success.title')}</strong> ${getTranslatedText('success.message')}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
        
        insertAlert(alertHtml);
    }
    
    // Show error message
    function showErrorMessage(message) {
        const alertHtml = `
            <div class="alert alert-danger alert-dismissible fade show" role="alert">
                <i class="bi bi-exclamation-triangle-fill me-2"></i>
                <strong>Error!</strong> ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
        
        insertAlert(alertHtml);
    }
    
    // Insert alert at the top of the form
    function insertAlert(alertHtml) {
        const cardBody = document.querySelector('.card-body');
        const existingAlert = cardBody.querySelector('.alert');
        
        if (existingAlert) {
            existingAlert.remove();
        }
        
        cardBody.insertAdjacentHTML('afterbegin', alertHtml);
        
        // Scroll to top to show the alert
        cardBody.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    // Set minimum date for start date (today)
    const startDateField = document.getElementById('startDate');
    if (startDateField) {
        const today = new Date();
        const todayString = today.toISOString().split('T')[0];
        startDateField.min = todayString;
        
        // Set default start date to next Monday
        const nextMonday = getNextMonday();
        startDateField.value = nextMonday.toISOString().split('T')[0];
    }
    
    // Set maximum date for birth date (16 years ago)
    const birthDateField = document.getElementById('birthDate');
    if (birthDateField) {
        const maxDate = new Date();
        maxDate.setFullYear(maxDate.getFullYear() - 16);
        birthDateField.max = maxDate.toISOString().split('T')[0];
    }
    
    // Helper function to get next Monday
    function getNextMonday() {
        const today = new Date();
        const dayOfWeek = today.getDay();
        const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek; // If Sunday, next Monday is 1 day away
        
        const nextMonday = new Date(today);
        nextMonday.setDate(today.getDate() + daysUntilMonday);
        
        return nextMonday;
    }
    
    // Real-time validation feedback
    const inputs = registrationForm.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
        
        input.addEventListener('input', function() {
            if (this.classList.contains('is-invalid')) {
                validateField(this);
            }
        });
    });
      // Validate individual field
    function validateField(field) {
        const existingFeedback = field.parentNode.querySelector('.invalid-feedback');
        if (existingFeedback) {
            existingFeedback.remove();
        }
        field.classList.remove('is-invalid');
        
        // Required field validation
        if (field.hasAttribute('required')) {
            if (field.type === 'checkbox') {
                if (!field.checked) {
                    showFieldError(field, getTranslatedText('validation.checkboxRequired'));
                    return false;
                }
            } else if (!field.value.trim()) {
                showFieldError(field, getTranslatedText('validation.fieldRequired'));
                return false;
            }
        }
        
        // Specific field validations
        if (field.type === 'email' && field.value && !isValidEmail(field.value)) {
            showFieldError(field, getTranslatedText('validation.emailInvalid'));
            return false;
        }
        
        if (field.type === 'tel' && field.value && !isValidPhone(field.value)) {
            showFieldError(field, getTranslatedText('validation.phoneInvalid'));
            return false;
        }
        
        if (field.id === 'salary' && field.value) {
            const salary = parseFloat(field.value);
            if (salary <= 0) {
                showFieldError(field, getTranslatedText('validation.salaryMinimum'));
                return false;
            }
        }
        
        return true;
    }
    
    // Translation functionality
const translations = {
    en: {
        // Form titles
        'form.title': 'Employee Registration Form',
        'form.subtitle': 'Please fill out all required fields to generate your employment contract',
        
        // Section headers
        'section.personal': 'Personal Information',
        'section.employment': 'Employment Information',
        'section.address': 'Address Information',
        'section.additional': 'Additional Information',
        
        // Field labels
        'field.firstName': 'First Name <span class="text-danger">*</span>',
        'field.lastName': 'Last Name <span class="text-danger">*</span>',
        'field.email': 'Email Address <span class="text-danger">*</span>',
        'field.phone': 'Phone Number <span class="text-danger">*</span>',
        'field.birthDate': 'Date of Birth <span class="text-danger">*</span>',
        'field.idNumber': 'ID Number <span class="text-danger">*</span>',
        'field.position': 'Position <span class="text-danger">*</span>',
        'field.department': 'Department <span class="text-danger">*</span>',
        'field.startDate': 'Proposed Start Date <span class="text-danger">*</span>',
        'field.employmentType': 'Employment Type <span class="text-danger">*</span>',
        'field.salary': 'Expected Annual Salary <span class="text-danger">*</span>',
        'field.streetAddress': 'Street Address <span class="text-danger">*</span>',
        'field.city': 'City <span class="text-danger">*</span>',
        'field.zipCode': 'ZIP Code <span class="text-danger">*</span>',
        'field.additionalInfo': 'Additional Comments or Special Requirements',
        
        // Options
        'option.selectPosition': 'Select a position',
        'option.selectDepartment': 'Select a department',
        'option.selectEmploymentType': 'Select employment type',
        
        // Positions
        'position.softwareDeveloper': 'Software Developer',
        'position.projectManager': 'Project Manager',
        'position.designer': 'Designer',
        'position.dataAnalyst': 'Data Analyst',
        'position.marketingSpecialist': 'Marketing Specialist',
        'position.salesRepresentative': 'Sales Representative',        'position.customerSupport': 'Customer Support',
        'position.adminAssistant': 'Administrative Assistant',
        'position.other': 'Other',
        
        // Departments
        'department.it': 'Information Technology',
        'department.hr': 'Human Resources',
        'department.finance': 'Finance',
        'department.marketing': 'Marketing',
        'department.sales': 'Sales',
        'department.operations': 'Operations',
        'department.customerService': 'Customer Service',
        'department.administration': 'Administration',
        
        // Employment Types
        'employmentType.fullTime': 'Full-time',
        'employmentType.partTime': 'Part-time',
        'employmentType.contract': 'Contract',
        'employmentType.temporary': 'Temporary',
        'employmentType.internship': 'Internship',
          // Placeholders
        'placeholder.idNumber': 'e.g., Driver\'s License, Passport',
        'placeholder.salary': '50000',
        'placeholder.streetAddress': '123 Main Street, Apt 4B',
        'placeholder.zipCode': '12345',
        'placeholder.additionalInfo': 'Any additional information you\'d like to share...',
        
        // Currency
        'currency.symbol': '$',
        
        // Help text
        'help.idNumber': 'Enter your driver\'s license, passport, or other government-issued ID number',
        'help.additionalInfo': 'Optional: Include any special accommodations, certifications, or other relevant information.',
        
        // Agreements
        'agreement.electronic': 'I agree to receive employment documents electronically <span class="text-danger">*</span>',
        'agreement.dataProcessing': 'I consent to the processing of my personal data for employment purposes <span class="text-danger">*</span>',
          // Button
        'button.submit': 'Submit Registration',
          // Validation messages
        'validation.fieldRequired': 'This field is required.',
        'validation.checkboxRequired': 'You must agree to this to continue.',
        'validation.emailInvalid': 'Please enter a valid email address.',
        'validation.phoneInvalid': 'Please enter a valid phone number.',
        'validation.ageMinimum': 'Employee must be at least 16 years old.',
        'validation.startDatePast': 'Start date cannot be in the past.',
        'validation.salaryMinimum': 'Salary must be greater than 0.',
          // Success messages
        'success.title': 'Registration Successful!',
        'success.message': 'Your employee registration has been submitted successfully. You will receive a confirmation email shortly, and your employment contract will be generated and sent to you.',
        
        // Error messages
        'error.submission': 'There was an error submitting your registration. Please try again.'
    },
    pl: {
        // Form titles
        'form.title': 'Formularz Rejestracji Pracownika',
        'form.subtitle': 'Proszę wypełnić wszystkie wymagane pola w celu wygenerowania umowy o pracę',
        
        // Section headers
        'section.personal': 'Informacje Osobiste',
        'section.employment': 'Informacje o Zatrudnieniu',
        'section.address': 'Informacje Adresowe',
        'section.additional': 'Informacje Dodatkowe',
        
        // Field labels
        'field.firstName': 'Imię <span class="text-danger">*</span>',
        'field.lastName': 'Nazwisko <span class="text-danger">*</span>',
        'field.email': 'Adres E-mail <span class="text-danger">*</span>',
        'field.phone': 'Numer Telefonu <span class="text-danger">*</span>',
        'field.birthDate': 'Data Urodzenia <span class="text-danger">*</span>',
        'field.idNumber': 'Numer Dokumentu <span class="text-danger">*</span>',
        'field.position': 'Stanowisko <span class="text-danger">*</span>',
        'field.department': 'Dział <span class="text-danger">*</span>',
        'field.startDate': 'Proponowana Data Rozpoczęcia <span class="text-danger">*</span>',
        'field.employmentType': 'Typ Zatrudnienia <span class="text-danger">*</span>',
        'field.salary': 'Oczekiwane Wynagrodzenie Roczne <span class="text-danger">*</span>',
        'field.streetAddress': 'Adres <span class="text-danger">*</span>',
        'field.city': 'Miasto <span class="text-danger">*</span>',
        'field.zipCode': 'Kod Pocztowy <span class="text-danger">*</span>',
        'field.additionalInfo': 'Dodatkowe Komentarze lub Specjalne Wymagania',
        
        // Options
        'option.selectPosition': 'Wybierz stanowisko',
        'option.selectDepartment': 'Wybierz dział',
        'option.selectEmploymentType': 'Wybierz typ zatrudnienia',
        
        // Positions
        'position.softwareDeveloper': 'Programista',
        'position.projectManager': 'Kierownik Projektu',
        'position.designer': 'Projektant',
        'position.dataAnalyst': 'Analityk Danych',
        'position.marketingSpecialist': 'Specjalista ds. Marketingu',
        'position.salesRepresentative': 'Przedstawiciel Handlowy',        'position.customerSupport': 'Obsługa Klienta',
        'position.adminAssistant': 'Asystent Administracyjny',
        'position.other': 'Inne',
        
        // Departments
        'department.it': 'Technologie Informatyczne',
        'department.hr': 'Zasoby Ludzkie',
        'department.finance': 'Finanse',
        'department.marketing': 'Marketing',
        'department.sales': 'Sprzedaż',
        'department.operations': 'Operacje',
        'department.customerService': 'Obsługa Klienta',
        'department.administration': 'Administracja',
        
        // Employment Types
        'employmentType.fullTime': 'Pełny etat',
        'employmentType.partTime': 'Część etatu',
        'employmentType.contract': 'Kontrakt',
        'employmentType.temporary': 'Tymczasowe',
        'employmentType.internship': 'Staż',
          // Placeholders
        'placeholder.idNumber': 'np. Prawo jazdy, Paszport',
        'placeholder.salary': '150000',
        'placeholder.streetAddress': 'ul. Główna 123, mieszkanie 4B',
        'placeholder.zipCode': '00-000',
        'placeholder.additionalInfo': 'Wszelkie dodatkowe informacje, które chciałbyś/chciałabyś przekazać...',
        
        // Currency
        'currency.symbol': 'zł',
        
        // Help text
        'help.idNumber': 'Wprowadź numer prawa jazdy, paszportu lub innego dokumentu wydanego przez rząd',
        'help.additionalInfo': 'Opcjonalne: Uwzględnij wszelkie specjalne przystosowania, certyfikaty lub inne istotne informacje.',
        
        // Agreements
        'agreement.electronic': 'Zgadzam się na otrzymywanie dokumentów związanych z zatrudnieniem drogą elektroniczną <span class="text-danger">*</span>',
        'agreement.dataProcessing': 'Wyrażam zgodę na przetwarzanie moich danych osobowych w celach związanych z zatrudnieniem <span class="text-danger">*</span>',        // Button
        'button.submit': 'Zarejestruj się',
          // Validation messages
        'validation.fieldRequired': 'To pole jest wymagane.',
        'validation.checkboxRequired': 'Musisz zaakceptować te warunki, aby kontynuować.',
        'validation.emailInvalid': 'Wprowadź prawidłowy adres e-mail.',
        'validation.phoneInvalid': 'Wprowadź prawidłowy numer telefonu.',
        'validation.ageMinimum': 'Pracownik musi mieć co najmniej 16 lat.',
        'validation.startDatePast': 'Data rozpoczęcia nie może być w przeszłości.',
        'validation.salaryMinimum': 'Wynagrodzenie musi być większe niż 0.',
          // Success messages
        'success.title': 'Rejestracja Zakończona Pomyślnie!',
        'success.message': 'Twoja rejestracja pracownika została pomyślnie przesłana. Wkrótce otrzymasz e-mail z potwierdzeniem, a Twoja umowa o pracę zostanie wygenerowana i wysłana do Ciebie.',
        
        // Error messages
        'error.submission': 'Wystąpił błąd podczas przesyłania rejestracji. Spróbuj ponownie.'
    }
};

// Helper function to get translated text
function getTranslatedText(key) {
    if (translations[currentLanguage] && translations[currentLanguage][key]) {
        return translations[currentLanguage][key];
    }
    // Fallback to English if current language doesn't have the translation
    if (translations['en'] && translations['en'][key]) {
        return translations['en'][key];
    }
    return key; // Return the key itself if no translation found
}

// Current language state
let currentLanguage = 'en';

// Language switching functionality
function initializeLanguageSwitch() {
    const languageSelector = document.getElementById('languageSelector');
    
    if (languageSelector) {
        languageSelector.addEventListener('change', function() {
            currentLanguage = this.value;
            translatePage(currentLanguage);
            localStorage.setItem('preferredLanguage', currentLanguage);
        });
        
        // Load saved language preference
        const savedLanguage = localStorage.getItem('preferredLanguage');
        if (savedLanguage && translations[savedLanguage]) {
            currentLanguage = savedLanguage;
            languageSelector.value = currentLanguage;
            translatePage(currentLanguage);
        }
    }
}

// Translate the entire page
function translatePage(language) {
    const elements = document.querySelectorAll('[data-translate]');
    elements.forEach(element => {
        const key = element.getAttribute('data-translate');
        if (translations[language] && translations[language][key]) {
            element.innerHTML = translations[language][key];
        }
    });
    
    // Translate placeholders
    const placeholderElements = document.querySelectorAll('[data-translate-placeholder]');
    placeholderElements.forEach(element => {
        const key = element.getAttribute('data-translate-placeholder');
        if (translations[language] && translations[language][key]) {
            element.placeholder = translations[language][key];
        }
    });
    
    // Update currency symbol
    const currencySymbol = document.getElementById('currencySymbol');
    if (currencySymbol && translations[language] && translations[language]['currency.symbol']) {
        currencySymbol.textContent = translations[language]['currency.symbol'];
    }
}

// Initialize language switcher
initializeLanguageSwitch();

    console.log('Employee Registration Form initialized successfully!');
    console.log('Don\'t forget to update the GOOGLE_SHEET_SCRIPT_URL with your actual Google Apps Script URL.');
});
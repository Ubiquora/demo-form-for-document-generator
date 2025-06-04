document.addEventListener('DOMContentLoaded', function () {
    // Cache DOM elements for better performance
    const DOM = {
        // Form element
        form: document.getElementById('registrationForm'),
        
        // Student information fields
        firstName: document.getElementById('firstName'),
        lastName: document.getElementById('lastName'),
        pesel: document.getElementById('pesel'),
        grade: document.getElementById('grade'),
        birthDate: document.getElementById('birthDate'),
        birthPlace: document.getElementById('birthPlace'),
        
        // Residence address fields
        resStreetWithNumber: document.getElementById('resStreetWithNumber'),
        resPostalCode: document.getElementById('resPostalCode'),
        resCity: document.getElementById('resCity'),
        resVoivodeship: document.getElementById('resVoivodeship'),
        resCounty: document.getElementById('resCounty'),
        resCommune: document.getElementById('resCommune'),
        
        // Registered address fields
        sameAddress: document.getElementById('sameAddress'),
        registeredAddressSection: document.getElementById('registeredAddressSection'),
        regStreetWithNumber: document.getElementById('regStreetWithNumber'),
        regPostalCode: document.getElementById('regPostalCode'),
        regCity: document.getElementById('regCity'),
        
        // School information fields
        noCurrentSchool: document.getElementById('noCurrentSchool'),
        currentSchoolSection: document.getElementById('currentSchoolSection'),
        currentSchoolName: document.getElementById('currentSchoolName'),
        currentSchoolAddress: document.getElementById('currentSchoolAddress'),
        districtSchoolSection: document.getElementById('districtSchoolSection'),
        districtSchoolName: document.getElementById('districtSchoolName'),
        districtSchoolAddress: document.getElementById('districtSchoolAddress'),
        districtSchoolEmail: document.getElementById('districtSchoolEmail'),
        
        // Mother data fields
        noMother: document.getElementById('noMother'),
        motherDataSection: document.getElementById('motherDataSection'),
        motherAddressSection: document.getElementById('motherAddressSection'),
        motherSameAddress: document.getElementById('motherSameAddress'),
        motherFirstName: document.getElementById('motherFirstName'),
        motherLastName: document.getElementById('motherLastName'),
        motherPhone: document.getElementById('motherPhone'),
        motherEmail: document.getElementById('motherEmail'),
        motherId: document.getElementById('motherId'),
        motherStreetWithNumber: document.getElementById('motherStreetWithNumber'),
        motherPostalCode: document.getElementById('motherPostalCode'),
        motherCity: document.getElementById('motherCity'),
        noMotherDisabledHint: document.getElementById('noMotherDisabledHint'),
        
        // Father data fields
        noFather: document.getElementById('noFather'),
        fatherDataSection: document.getElementById('fatherDataSection'),
        fatherAddressSection: document.getElementById('fatherAddressSection'),
        fatherSameAddress: document.getElementById('fatherSameAddress'),
        fatherFirstName: document.getElementById('fatherFirstName'),
        fatherLastName: document.getElementById('fatherLastName'),
        fatherPhone: document.getElementById('fatherPhone'),
        fatherEmail: document.getElementById('fatherEmail'),
        fatherId: document.getElementById('fatherId'),
        fatherStreetWithNumber: document.getElementById('fatherStreetWithNumber'),
        fatherPostalCode: document.getElementById('fatherPostalCode'),
        fatherCity: document.getElementById('fatherCity'),
        noFatherDisabledHint: document.getElementById('noFatherDisabledHint'),
        
        // Consents
        agreement: document.getElementById('agreement'),
        dataProcessingConsent: document.getElementById('dataProcessingConsent'),
    };
    
    const registrationForm = DOM.form;

    // Configuration
    const GOOGLE_SHEET_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwZJBpP5An4M0MdDYPeGopx7dvk-5-NerMa-9-dRg1kab85Zz9gU9sUIP6Qb99pnx5N/exec";

    /**
     * General-purpose function to toggle section visibility based on checkbox state
     * @param {HTMLElement} checkbox - The checkbox element that controls visibility
     * @param {HTMLElement[]} sections - Array of sections to toggle visibility
     * @param {Function} [onCheck] - Optional callback when checkbox is checked
     * @param {Function} [onUncheck] - Optional callback when checkbox is unchecked
     */
    function setupCheckboxToggle(checkbox, sections, onCheck, onUncheck) {
        if (!checkbox) return;
        
        checkbox.addEventListener('change', function() {
            const isChecked = this.checked;
            
            // Toggle sections visibility
            sections.forEach(section => {
                if (section) {
                    section.style.display = isChecked ? 'none' : 'block';
                }
            });
            
            // Execute callbacks if provided
            if (isChecked && typeof onCheck === 'function') {
                onCheck();
            } else if (!isChecked && typeof onUncheck === 'function') {
                onUncheck();
            }
        });
    }
    
    // Constants and patterns that will be reused
    const PATTERNS = {
        POSTAL_CODE: /^\d{2}-\d{3}$/,
        EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        PHONE: /^[\d\s+\-()\[\]]{6,25}$/
    };
    
    // Set up event handler for the noCurrentSchool checkbox
    const noCurrentSchoolCheckbox = DOM.noCurrentSchool;
    const currentSchoolSection = DOM.currentSchoolSection;
    
    setupCheckboxToggle(
        noCurrentSchoolCheckbox, 
        [currentSchoolSection],
        // On check callback - clear fields
        function() {
            ['currentSchoolName', 'currentSchoolAddress'].forEach(id => {
                const field = DOM[id];
                if (field) field.value = '';
            });
        }
    );

    // Set up event handler for the parent availability checkboxes
    const noMotherCheckbox = DOM.noMother;
    const noFatherCheckbox = DOM.noFather;
    const motherDataSection = DOM.motherDataSection;
    const fatherDataSection = DOM.fatherDataSection;
    const motherAddressSection = DOM.motherAddressSection;
    const fatherAddressSection = DOM.fatherAddressSection;
    const noMotherDisabledHint = DOM.noMotherDisabledHint;
    const noFatherDisabledHint = DOM.noFatherDisabledHint;
    
    // Setup parent checkbox toggle functionality
    function setupParentCheckbox(checkbox, dataSections, clearPrefix, otherCheckbox, otherHint) {
        setupCheckboxToggle(
            checkbox,
            dataSections,
            // On check callback
            function() {
                // Clear fields
                clearParentFields(clearPrefix);
                
                // Disable other checkbox (need at least one parent)
                if (otherCheckbox) {
                    otherCheckbox.disabled = true;
                    
                    // Show hint
                    if (otherHint) {
                        otherHint.classList.remove('d-none');
                    }
                }
            },
            // On uncheck callback
            function() {
                // Re-enable other checkbox
                if (otherCheckbox) {
                    otherCheckbox.disabled = false;
                    
                    // Hide hint
                    if (otherHint) {
                        otherHint.classList.add('d-none');
                    }
                }
            }
        );
    }
    
    // Setup parent checkboxes with DRY implementation
    setupParentCheckbox(
        noMotherCheckbox, 
        [motherDataSection, motherAddressSection],
        'mother',
        noFatherCheckbox,
        noFatherDisabledHint
    );
    
    setupParentCheckbox(
        noFatherCheckbox,
        [fatherDataSection, fatherAddressSection],
        'father',
        noMotherCheckbox,
        noMotherDisabledHint
    );
    
    // Helper function to clear parent fields
    function clearParentFields(parentType) {
        const fieldPrefixes = ['FirstName', 'LastName', 'Phone', 'Email', 'Id', 'StreetWithNumber', 'PostalCode', 'City'];
        
        fieldPrefixes.forEach(prefix => {
            const fieldId = parentType + prefix;
            const field = DOM[fieldId];            if (field) {
                field.value = '';
                field.disabled = false; // Ensure fields are not disabled
                field.classList.remove('is-invalid', 'is-valid');
            }
        });
        
        // Uncheck the same address checkbox if it exists
        const sameAddressCheckbox = DOM[parentType + 'SameAddress'];
        if (sameAddressCheckbox) {
            sameAddressCheckbox.checked = false;
        }
        
        // Remove auto-filled styling from parent address section
        const addressSection = DOM[parentType + 'AddressSection'];
        if (addressSection) {
            addressSection.classList.remove('auto-filled');
        }
    }
    
    /**
     * Generic function to setup input validation and formatting
     * @param {string} fieldId - ID of the field to set up
     * @param {Object} options - Configuration options
     */
    function setupInputValidation(fieldId, options) {
        const field = DOM[fieldId];
        if (!field) return;

        field.addEventListener('input', function(e) {
            let inputValue = e.target.value;
            
            // Apply input transformation if provided
            if (typeof options.transform === 'function') {
                inputValue = options.transform(inputValue);
                e.target.value = inputValue;
            }
            
            // Check validation if provided
            if (typeof options.validate === 'function') {
                options.validate(e.target, inputValue);
            }
        });
    }    /**
     * Validates a PESEL number according to Polish national ID regulations
     * @param {string} pesel - The PESEL number to validate
     * @returns {Object} - Validation result with status and message
     */
    function validatePesel(pesel) {
        // Check if it's exactly 11 digits
        if (!pesel || !/^\d{11}$/.test(pesel)) {
            return { 
                isValid: false, 
                message: 'PESEL musi składać się dokładnie z 11 cyfr' 
            };
        }
        
        // Extract date components from PESEL
        const year = parseInt(pesel.substring(0, 2), 10);
        let month = parseInt(pesel.substring(2, 4), 10);
        const day = parseInt(pesel.substring(4, 6), 10);
        
        // Determine century based on month coding
        let fullYear;
        if (month > 80) {
            fullYear = 1800 + year;
            month -= 80;
        } else if (month > 60) {
            fullYear = 2200 + year;
            month -= 60;
        } else if (month > 40) {
            fullYear = 2100 + year;
            month -= 40;
        } else if (month > 20) {
            fullYear = 2000 + year;
            month -= 20;
        } else {
            fullYear = 1900 + year;
        }
          // Check if the date is valid - using UTC to avoid timezone issues
        const birthDate = new Date(Date.UTC(fullYear, month - 1, day));
        if (
            birthDate.getUTCFullYear() !== fullYear ||
            birthDate.getUTCMonth() !== month - 1 ||
            birthDate.getUTCDate() !== day
        ) {
            return {
                isValid: false,
                message: 'PESEL zawiera nieprawidłową datę urodzenia'
            };
        }
        
        // Verify check digit using the weighted sum algorithm
        const weights = [1, 3, 7, 9, 1, 3, 7, 9, 1, 3, 1];
        let sum = 0;
        
        for (let i = 0; i < 11; i++) {
            sum += parseInt(pesel.charAt(i), 10) * weights[i];
        }
        
        if (sum % 10 !== 0) {
            return {
                isValid: false,
                message: 'Nieprawidłowa cyfra kontrolna PESEL'
            };
        }
        
        // Optional: Check if birth date matches the form's birthDate input
        const birthDateInput = DOM.birthDate;
        if (birthDateInput && birthDateInput.value) {
            const formBirthDate = new Date(birthDateInput.value);
            
            // Compare only year, month, and day
            if (
                formBirthDate.getFullYear() !== birthDate.getFullYear() ||
                formBirthDate.getMonth() !== birthDate.getMonth() ||
                formBirthDate.getDate() !== birthDate.getDate()
            ) {
                return {
                    isValid: false,
                    warning: true,
                    message: 'Data urodzenia w PESEL nie zgadza się z podaną datą urodzenia'
                };
            }
        }
        
        return { 
            isValid: true,
            birthDate: birthDate,
            gender: parseInt(pesel.charAt(9), 10) % 2 === 0 ? 'K' : 'M' // Female if even, Male if odd
        };
    }    // Set up enhanced validation for PESEL field
    setupInputValidation('pesel', {
        transform: function(value) {
            // Replace any non-digit characters and limit to 11 characters
            let cleaned = value.replace(/[^0-9]/g, '');
            return cleaned.length > 11 ? cleaned.slice(0, 11) : cleaned;
        },
        validate: function(field, value) {
            // Remove existing feedback
            const peselFeedback = document.getElementById('pesel-feedback');
            if (peselFeedback) {
                peselFeedback.remove();
            }
            
            field.classList.remove('is-invalid', 'is-valid');
            
            // Skip validation if empty
            if (!value) return;
            
            // Perform full PESEL validation
            const validationResult = validatePesel(value);
            
            if (!validationResult.isValid) {
                // Create feedback element
                const feedbackEl = document.createElement('div');
                feedbackEl.id = 'pesel-feedback';
                feedbackEl.className = validationResult.warning ? 'text-warning d-block' : 'invalid-feedback d-block';
                feedbackEl.textContent = validationResult.message;
                
                if (!validationResult.warning) {
                    field.classList.add('is-invalid');
                } else {
                    field.classList.add('is-valid'); // Still valid but with a warning
                }
                
                field.parentNode.appendChild(feedbackEl);
            } else {
                // Valid PESEL
                field.classList.add('is-valid');
                
                // Optional: Auto-fill birth date if it's empty and we have a valid PESEL
                if (DOM.birthDate && !DOM.birthDate.value && validationResult.birthDate) {
                    const formattedDate = validationResult.birthDate.toISOString().split('T')[0];
                    DOM.birthDate.value = formattedDate;
                }
            }
        }
    });

    // Add listener to birthDate to re-validate PESEL if it changes
    const birthDateField = DOM.birthDate;
    if (birthDateField) {
        birthDateField.addEventListener('change', function() {
            const peselField = DOM.pesel;
            if (peselField && peselField.value) {
                // Trigger the input event manually to re-run validation logic
                peselField.dispatchEvent(new Event('input'));
            }
        });
    }

    /**
     * Reusable function to format postal code in XX-XXX format
     * @param {string} value - The input value to format
     * @returns {string} - Formatted postal code
     */
    function formatPostalCode(value) {
        // Remove all non-digit characters except hyphen
        let cleaned = value.replace(/[^\d-]/g, '');

        // Handle case where user entered hyphen manually
        if (cleaned.length > 2 && cleaned.charAt(2) === '-') {
            // Keep the manually entered hyphen and continue formatting
            const firstPart = cleaned.substring(0, 3); // Keep XX-
            const secondPart = cleaned.substring(3).replace(/\D/g, '').substring(0, 3); // Get up to 3 digits after hyphen
            return firstPart + secondPart;
        } else {
            // No manual hyphen - format automatically
            const digits = cleaned.replace(/\D/g, '');

            // Limit to 5 digits total
            const limitedDigits = digits.substring(0, 5);

            // Format as XX-XXX if we have 2 or more digits
            if (limitedDigits.length > 2) {
                return limitedDigits.substring(0, 2) + '-' + limitedDigits.substring(2);
            } else {
                return limitedDigits;
            }
        }
    }

    /**
     * Sets up a "same address" checkbox to copy address fields from source to target
     * @param {string} checkboxId - ID of the checkbox element
     * @param {string} targetSectionId - ID of the section containing target fields
     * @param {Object} fieldMap - Mapping of source field IDs to target field IDs
     */
    function setupAddressCopyFeature(checkboxId, targetSectionId, fieldMap) {
        const checkbox = DOM[checkboxId];
        const targetSection = DOM[targetSectionId];

        if (!checkbox || !targetSection) return;

        // Handle checkbox change event
        checkbox.addEventListener('change', function () {
            const isChecked = this.checked;

            // For each field in the mapping
            Object.entries(fieldMap).forEach(([sourceId, targetId]) => {
                const sourceElement = DOM[sourceId];
                const targetElement = DOM[targetId];

                if (sourceElement && targetElement) {
                    // Copy and format value if checkbox is checked
                    if (isChecked) {
                        // Special handling for postal code fields
                        if (targetId.includes('PostalCode')) {
                            targetElement.value = formatPostalCode(sourceElement.value);
                        } else {
                            targetElement.value = sourceElement.value;
                        }

                        // Disable target fields
                        targetElement.disabled = true;
                    } else {
                        // Enable target fields when unchecked
                        targetElement.disabled = false;
                    }
                }
            });

            // Toggle visual class
            if (isChecked) {
                targetSection.classList.add('auto-filled');
            } else {
                targetSection.classList.remove('auto-filled');
            }
        });

        // Set up source field input listeners to update target fields when changed
        const sourceFields = Object.keys(fieldMap);
        sourceFields.forEach(sourceId => {
            DOM[sourceId]?.addEventListener('input', function () {
                if (checkbox.checked) {
                    const targetId = fieldMap[sourceId];
                    const targetElement = DOM[targetId];

                    if (targetElement) {
                        // Special handling for postal code
                        if (targetId.includes('PostalCode')) {
                            targetElement.value = formatPostalCode(this.value);
                        } else {
                            targetElement.value = this.value;
                        }
                    }
                }
            });
        });
    }

    // Set up address copying features with a common field mapping function
    function setupAllAddressCopyFeatures() {
        // 1. Registered address copy from residence address
        setupAddressCopyFeature('sameAddress', 'registeredAddressSection', {
            'resStreetWithNumber': 'regStreetWithNumber',
            'resPostalCode': 'regPostalCode',
            'resCity': 'regCity'
        });

        // 2. Mother's address copy from residence address
        setupAddressCopyFeature('motherSameAddress', 'motherAddressSection', {
            'resStreetWithNumber': 'motherStreetWithNumber',
            'resPostalCode': 'motherPostalCode',
            'resCity': 'motherCity'
        });

        // 3. Father's address copy from residence address
        setupAddressCopyFeature('fatherSameAddress', 'fatherAddressSection', {
            'resStreetWithNumber': 'fatherStreetWithNumber',
            'resPostalCode': 'fatherPostalCode',
            'resCity': 'fatherCity'
        });
    }
    
    // Call the function to set up all address copy features
    setupAllAddressCopyFeatures();    // Helper function to reset address sections after form submission or when needed
    function resetAddressSection(checkboxId, sectionId, fieldIds) {
        DOM[checkboxId].checked = false;
        DOM[sectionId].classList.remove('auto-filled');

        fieldIds.forEach(fieldId => {
            const field = DOM[fieldId];
            if (field) {
                field.disabled = false;
            }
        });
    }    // Helper function to reset school section visibility after form submission
    function resetSchoolSection() {
        // Reset the "no current school" checkbox
        DOM.noCurrentSchool.checked = false;
        
        // Make sure the current school section is visible
        DOM.currentSchoolSection.style.display = 'block';
    }

    // Helper function to reset parent sections visibility after form submission
    function resetParentSections() {
        // Reset mother section
        DOM.noMother.checked = false;
        DOM.noMother.disabled = false;
        DOM.motherDataSection.style.display = 'block';
        if (DOM.motherAddressSection) {
            DOM.motherAddressSection.style.display = 'block';
        }
        if (DOM.noMotherDisabledHint) {
            DOM.noMotherDisabledHint.classList.add('d-none');
        }

        // Reset father section
        DOM.noFather.checked = false;
        DOM.noFather.disabled = false;
        DOM.fatherDataSection.style.display = 'block';
        if (DOM.fatherAddressSection) {
            DOM.fatherAddressSection.style.display = 'block';
        }
        if (DOM.noFatherDisabledHint) {
            DOM.noFatherDisabledHint.classList.add('d-none');
        }
    }

    // Add district school visibility based on grade selection
    const gradeSelect = DOM.grade;
    const districtSchoolSection = DOM.districtSchoolSection;
    
    // Function to toggle district school section visibility based on grade
    function toggleDistrictSchoolVisibility() {
        const selectedGrade = parseInt(gradeSelect.value);
        
        // Only show district school fields for grade 0 (zerówka) or grade 1
        if (selectedGrade <= 1) {
            districtSchoolSection.style.display = 'block';
        } else {
            districtSchoolSection.style.display = 'none';
            
            // Clear district school fields when hidden
            DOM.districtSchoolName.value = '';
            DOM.districtSchoolAddress.value = '';
            DOM.districtSchoolEmail.value = '';
            
            // Remove any validation errors
            ['districtSchoolName', 'districtSchoolAddress', 'districtSchoolEmail'].forEach(fieldId => {
                const field = DOM[fieldId];
                field.classList.remove('is-invalid', 'is-valid');
                
                // Remove feedback elements
                const feedback = field.nextElementSibling;
                if (feedback && feedback.classList.contains('invalid-feedback')) {
                    feedback.remove();
                }
            });
        }
    }
    
    // Set initial visibility when page loads
    toggleDistrictSchoolVisibility();
    
    // Update visibility when grade changes
    gradeSelect.addEventListener('change', toggleDistrictSchoolVisibility);

    // Form validation and submission
    registrationForm.addEventListener('submit', function (event) {
        // Prevent default submission
        event.preventDefault();

        // Only use our custom validation
        if (!validateForm()) {
            return false;
        }

        // Temporarily re-enable any disabled fields to ensure their data is included in the form submission
        const disabledFields = registrationForm.querySelectorAll('input:disabled, select:disabled');
        disabledFields.forEach(field => {
            field.disabled = false;
        });

        // If form is valid, collect the data
        const formData = new FormData(registrationForm);
        
        // Format the birth date value to DD.MM.YYYY before submission
        const birthDateInput = DOM.birthDate;
        if (birthDateInput && birthDateInput.value) {
            // Convert YYYY-MM-DD to DD.MM.YYYY
            const formattedDate = birthDateInput.value.split('-').reverse().join('.');
            formData.set('birthDate', formattedDate);
        }
        
        // Format phone numbers for Google Sheets
        formatPhoneNumbersForSubmission(formData);

        // Re-disable the fields that were previously disabled
        disabledFields.forEach(field => {
            field.disabled = true;
        });

        // URL for Google Sheets script
        const sheetScriptURL = GOOGLE_SHEET_SCRIPT_URL; // Use the constant        // Show loading indicator and prevent multiple submissions
        const submitBtn = document.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        
        // Disable submit button
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Wysyłanie...';
        
        // Add a timer to re-enable the button after 30 seconds in case of network timeout
        const buttonTimeout = setTimeout(() => {
            if (submitBtn.disabled) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
                showErrorMessage("Wystąpił problem z połączeniem. Spróbuj ponownie.");
            }
        }, 30000); // 30 seconds timeout
        
        // Store the timeout ID so it can be cleared on successful submission
        submitBtn.dataset.timeoutId = buttonTimeout;
        
        // Send data to Google Sheets
        sendFormDataWithRetry(sheetScriptURL, formData, submitBtn, originalBtnText, 0);
    });
    
    /**
     * Sends form data to Google Sheets with improved error handling and retry capability
     * @param {string} url - The URL to send data to
     * @param {FormData} formData - The form data to send
     * @param {HTMLElement} submitBtn - The submit button (for UI updates)
     * @param {string} originalBtnText - Original text of the button
     * @param {number} retryCount - Current retry attempt count
     */
    function sendFormDataWithRetry(url, formData, submitBtn, originalBtnText, retryCount) {
        const MAX_RETRIES = 2; // Maximum number of retry attempts
        const RETRY_DELAY = 2000; // Delay between retries in ms

        fetch(url, {
            method: 'POST',
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams(formData)
        })
        .then(response => {
            return response.text().then(text => {
                // Process based on response status
                if (response.ok) {
                    if (text.includes("error") || text.includes("błąd")) {
                        // Google Apps Script may return 200 but contain error message
                        throw new Error(`Script error: ${text}`);
                    }
                    return text;
                } else if (response.status === 429) {
                    throw new Error("TOO_MANY_REQUESTS");
                } else if (response.status >= 500) {
                    throw new Error("SERVER_ERROR");
                } else if (response.status === 403) {
                    throw new Error("FORBIDDEN");
                } else if (response.status === 401) {
                    throw new Error("UNAUTHORIZED");
                } else {
                    throw new Error(`HTTP error ${response.status}: ${text}`);
                }
            });
        })
        .then(data => {
            console.log('Form data submitted successfully');

            // Display confirmation message
            showConfirmationMessage();            // Reset form after successful submission
            registrationForm.reset();

            // Reset school section visibility
            resetSchoolSection();

            // Reset parent sections visibility
            resetParentSections();

            // Reset address sections
            resetAddressSection('sameAddress', 'registeredAddressSection', [
                'regStreetWithNumber', 'regPostalCode', 'regCity'
            ]);

            resetAddressSection('motherSameAddress', 'motherAddressSection', [
                'motherStreetWithNumber', 'motherPostalCode', 'motherCity'
            ]);

            resetAddressSection('fatherSameAddress', 'fatherAddressSection', [
                'fatherStreetWithNumber', 'fatherPostalCode', 'fatherCity'
            ]);
        })
        .catch(error => {
            console.error('Error submitting form:', error);
            
            // Handle specific error types
            if (error.message === "TOO_MANY_REQUESTS" && retryCount < MAX_RETRIES) {
                // Retry with exponential backoff for rate limiting
                const waitTime = RETRY_DELAY * (retryCount + 1);
                showErrorMessage("System jest obecnie przeciążony. Ponawiam próbę za kilka sekund...");
                
                setTimeout(() => {
                    sendFormDataWithRetry(url, formData, submitBtn, originalBtnText, retryCount + 1);
                }, waitTime);
                return;
            } else if (error.message === "SERVER_ERROR" && retryCount < MAX_RETRIES) {
                // Retry server errors once
                showErrorMessage("Serwer jest chwilowo niedostępny. Ponawiam próbę za kilka sekund...");
                
                setTimeout(() => {
                    sendFormDataWithRetry(url, formData, submitBtn, originalBtnText, retryCount + 1);
                }, RETRY_DELAY);
                return;
            }
            
            // Show appropriate error message based on error type
            if (error.message === "TOO_MANY_REQUESTS") {
                showErrorMessage("Zbyt wiele zgłoszeń w tym momencie. Proszę spróbować później.");
            } else if (error.message === "SERVER_ERROR") {
                showErrorMessage("Serwer jest chwilowo niedostępny. Proszę spróbować później.");
            } else if (error.message === "FORBIDDEN") {
                showErrorMessage("Brak dostępu do systemu rejestracji. Proszę skontaktować się z sekretariatem szkoły.");
            } else if (error.message === "UNAUTHORIZED") {
                showErrorMessage("Autoryzacja do systemu wygasła. Proszę odświeżyć stronę i spróbować ponownie.");
            } else if (error.message.includes("Script error")) {
                showErrorMessage("Wystąpił błąd podczas przetwarzania formularza. Prosimy o kontakt z sekretariatem szkoły.");
            } else {
                // Generic error for network issues or other problems
                showErrorMessage("Wystąpił błąd podczas wysyłania formularza. Sprawdź połączenie z internetem i spróbuj ponownie później.");
            }        })
        .finally(() => {
            // Always reset the submit button - retrying is handled in the catch block
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
        });
    }
    
    /**
     * Displays an error message to the user
     * @param {string} message - The error message to display
     */
    function showErrorMessage(message) {
        if (typeof bootstrap !== 'undefined') {
            // Remove existing error modal if present
            const existingModal = document.getElementById('errorModal');
            if (existingModal) {
                existingModal.remove();
            }
            
            // Create a Bootstrap modal with the error message
            const modalHTML = `
                <div class="modal fade" id="errorModal" tabindex="-1" aria-labelledby="errorModalLabel" aria-hidden="true">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header bg-danger text-white">
                                <h5 class="modal-title" id="errorModalLabel">Błąd</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                <div class="d-flex align-items-center mb-3">
                                    <i class="bi bi-exclamation-triangle-fill text-danger fs-1 me-3"></i>
                                    <p class="mb-0">${message}</p>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Zamknij</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Append modal to body and show it
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            const errorModal = new bootstrap.Modal(document.getElementById('errorModal'));
            errorModal.show();
        } else {
            // Fallback to alert if Bootstrap is not available
            alert(message);
        }
    }

    /**
     * Format phone numbers to standardized format for Google Sheets
     * @param {FormData} formData - The form data object
     */
    function formatPhoneNumbersForSubmission(formData) {
        ['motherPhone', 'fatherPhone'].forEach(fieldId => {
            const phoneInput = DOM[fieldId];
            if (phoneInput && phoneInput.value) {
                // Keep plus sign for international numbers, remove all other non-digit characters
                let formattedNumber = phoneInput.value;
                const startsWithPlus = formattedNumber.startsWith('+');
                
                // For Google Sheets, prepend with a single quote (') if it has a plus sign
                // This forces Google Sheets to treat it as text and not a formula
                if (startsWithPlus) {
                    // Remove non-digits except the plus sign
                    formattedNumber = '+' + formattedNumber.substring(1).replace(/[^\d]/g, '');
                    // Add single quote at the beginning to prevent Google Sheets formula interpretation
                    formattedNumber = "'" + formattedNumber;
                } else {
                    // Not international format, just remove formatting characters
                    formattedNumber = formattedNumber.replace(/[^\d]/g, '');
                }
                
                // Update the value in the form data
                formData.set(fieldId, formattedNumber);
            }
        });
    }

    // Validate form fields
    function validateForm() {
        let isValid = true;        // Clear previous validation indicators - using more efficient selectors
        document.querySelectorAll('.is-invalid, .is-valid').forEach(field => {
            field.classList.remove('is-invalid', 'is-valid');
        });
        document.querySelectorAll('.invalid-feedback').forEach(feedback => {
            feedback.remove();
        });

        // Helper function to mark a field as invalid with feedback
        function markInvalid(field, message) {
            field.classList.add('is-invalid');

            // Create feedback element if it doesn't exist
            let feedbackElement = field.nextElementSibling;
            if (!feedbackElement || !feedbackElement.classList.contains('invalid-feedback')) {
                feedbackElement = document.createElement('div');
                feedbackElement.className = 'invalid-feedback';
                field.parentNode.appendChild(feedbackElement);
            }

            feedbackElement.textContent = message;
            feedbackElement.style.display = 'block';

            isValid = false;

            // Scroll to the first invalid field
            if (isValid === false && field === document.querySelector('.is-invalid')) {
                field.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }

        // Utility function for field validation with common patterns
        function validateField(id, options = {}) {
            const field = DOM[id];
            if (!field) return;

            const value = field.value.trim();

            // Required field validation
            if (options.required && !value) {
                markInvalid(field, options.requiredMessage || 'To pole jest wymagane');
                return false;
            }

            // Pattern validation (if field has value)
            if (value && options.pattern && !options.pattern.test(value)) {
                markInvalid(field, options.patternMessage || 'Wartość nie spełnia wymagań');
                return false;
            }

            return true;
        }

        // Validate basic student information
        validateField('pesel', {
            required: true,
            pattern: /^\d{11}$/,
            requiredMessage: 'Proszę podać numer PESEL',
            patternMessage: 'PESEL musi składać się dokładnie z 11 cyfr'
        });

        // Validate name fields
        validateField('firstName', { required: true, requiredMessage: 'Proszę podać imię ucznia' });
        validateField('lastName', { required: true, requiredMessage: 'Proszę podać nazwisko ucznia' });
        validateField('birthDate', { required: true, requiredMessage: 'Proszę podać datę urodzenia' });
        validateField('birthPlace', { required: true, requiredMessage: 'Proszę podać miejsce urodzenia' });        // Validate address fields
        validateField('resStreetWithNumber', { required: true, requiredMessage: 'Proszę podać ulicę wraz z numerem domu' });
        validateField('resPostalCode', {
            required: true,
            pattern: PATTERNS.POSTAL_CODE,
            requiredMessage: 'Proszę podać kod pocztowy',
            patternMessage: 'Kod pocztowy powinien być w formacie XX-XXX (np. 00-000)'
        });
        validateField('resCity', { required: true, requiredMessage: 'Proszę podać miejscowość' });
        validateField('resVoivodeship', { required: true, requiredMessage: 'Proszę podać województwo' });
        validateField('resCounty', { required: true, requiredMessage: 'Proszę podać powiat' });
        validateField('resCommune', { required: true, requiredMessage: 'Proszę podać gminę' });

        // Validate registered address fields if "same address" is not checked
        const sameAddressCheckbox = DOM.sameAddress;
        if (!sameAddressCheckbox.checked) {
            validateField('regStreetWithNumber', {
                required: true,
                requiredMessage: 'Proszę podać ulicę wraz z numerem domu w adresie zameldowania'
            });
            validateField('regPostalCode', {
                required: true,
                pattern: PATTERNS.POSTAL_CODE,
                requiredMessage: 'Proszę podać kod pocztowy',
                patternMessage: 'Kod pocztowy powinien być w formacie XX-XXX (np. 00-000)'
            });
            validateField('regCity', { required: true, requiredMessage: 'Proszę podać miejscowość' });
        }        // Validate school information
        const noCurrentSchoolCheckbox = DOM.noCurrentSchool;
        
        // Only validate current school fields if the "no current school" checkbox is NOT checked
        if (!noCurrentSchoolCheckbox.checked) {
            validateField('currentSchoolName', {
                required: true,
                requiredMessage: 'Proszę podać nazwę obecnej szkoły ucznia'
            });
            validateField('currentSchoolAddress', {
                required: true,
                requiredMessage: 'Proszę podać adres obecnej szkoły ucznia'
            });
        }
        
        // Only validate district school fields for grades 0 and 1
        const selectedGrade = parseInt(DOM.grade.value);
        if (selectedGrade <= 1) {
            validateField('districtSchoolName', {
                required: true,
                requiredMessage: 'Proszę podać nazwę szkoły rejonowej'
            });
            validateField('districtSchoolAddress', {
                required: true,
                requiredMessage: 'Proszę podać adres szkoły rejonowej'
            });
            validateField('districtSchoolEmail', {
                required: true,
                pattern: PATTERNS.EMAIL,
                requiredMessage: 'Proszę podać adres e-mail szkoły rejonowej',
                patternMessage: 'Proszę podać prawidłowy adres e-mail szkoły rejonowej'
            });
        }

        // Validate parent information using centralized validation
        validateParentInfo('mother', noMotherCheckbox);
        validateParentInfo('father', noFatherCheckbox);        // Helper function to validate checkboxes
        function validateCheckbox(checkbox, errorMessage) {
            if (!checkbox.checked) {
                // Special case for checkbox
                checkbox.classList.add('is-invalid');
                let checkboxContainer = checkbox.closest('.form-check');
                let feedbackElement = checkboxContainer.querySelector('.invalid-feedback');

                if (!feedbackElement) {
                    feedbackElement = document.createElement('div');
                    feedbackElement.className = 'invalid-feedback';
                    checkboxContainer.appendChild(feedbackElement);
                }

                feedbackElement.textContent = errorMessage;
                feedbackElement.style.display = 'block';
                isValid = false;
                
                // Scroll to the first invalid field
                if (checkbox === document.querySelector('.is-invalid')) {
                    checkbox.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                
                return false;
            }
            return true;
        }
        
        // Validate electronic documents agreement
        const agreement = DOM.agreement;
        validateCheckbox(agreement, 'Musisz wyrazić zgodę na otrzymywanie dokumentów w formie elektronicznej');
        
        // Validate data processing consent (required)
        const dataProcessingConsent = DOM.dataProcessingConsent;
        validateCheckbox(dataProcessingConsent, 'Musisz wyrazić zgodę na przetwarzanie danych osobowych');

        return isValid;
        
        // Helper function to validate parent information
        function validateParentInfo(parentType, checkboxElement) {
            if (!checkboxElement || !checkboxElement.checked) {
                // Only validate if parent data should be provided
                validateField(parentType + 'FirstName', { 
                    required: true, 
                    requiredMessage: 'Proszę podać imię ' + (parentType === 'mother' ? 'mamy' : 'taty') 
                });
                
                validateField(parentType + 'LastName', {
                    required: true,
                    requiredMessage: 'Proszę podać nazwisko ' + (parentType === 'mother' ? 'mamy' : 'taty')
                });
                
                validateField(parentType + 'Phone', {
                    required: true,
                    pattern: PATTERNS.PHONE,
                    requiredMessage: 'Proszę podać numer telefonu ' + (parentType === 'mother' ? 'mamy' : 'taty'),
                    patternMessage: 'Proszę podać prawidłowy numer telefonu'
                });
                
                validateField(parentType + 'Email', {
                    required: true,
                    pattern: PATTERNS.EMAIL,
                    requiredMessage: 'Proszę podać adres e-mail ' + (parentType === 'mother' ? 'mamy' : 'taty'),
                    patternMessage: 'Proszę podać prawidłowy adres e-mail ' + (parentType === 'mother' ? 'mamy' : 'taty')
                });
                
                validateField(parentType + 'Id', { 
                    required: true, 
                    requiredMessage: 'Proszę podać numer dokumentu tożsamości ' + (parentType === 'mother' ? 'mamy' : 'taty')
                });

                // Validate parent's address if "same address" checkbox is not checked
                const sameAddressCheckbox = DOM[parentType + 'SameAddress'];
                if (!sameAddressCheckbox.checked) {
                    validateField(parentType + 'StreetWithNumber', {
                        required: true,
                        requiredMessage: 'Proszę podać ulicę wraz z numerem domu ' + (parentType === 'mother' ? 'mamy' : 'taty')
                    });
                    
                    validateField(parentType + 'PostalCode', {
                        required: true,
                        pattern: PATTERNS.POSTAL_CODE,
                        requiredMessage: 'Proszę podać kod pocztowy',
                        patternMessage: 'Kod pocztowy powinien być w formacie XX-XXX (np. 00-000)'
                    });
                    
                    validateField(parentType + 'City', { 
                        required: true, 
                        requiredMessage: 'Proszę podać miejscowość' 
                    });
                }
            }
        }
    }

    // Set up input formatting for phone and postal code fields
    function setupInputFormatters() {
        // Phone number input formatting
        ['motherPhone', 'fatherPhone'].forEach(function (fieldId) {
            setupInputValidation(fieldId, {
                transform: function(value) {
                    // Allow digits, plus sign, spaces, dashes, and brackets
                    let cleaned = value.replace(/[^\d\s+\-()]/g, '');
                    
                    // Ensure plus sign is only at the beginning if present
                    if (cleaned.indexOf('+') > 0) {
                        cleaned = cleaned.replace(/\+/g, '');
                        if (!cleaned.startsWith('+')) {
                            cleaned = '+' + cleaned;
                        }
                    }
                    
                    // Limit to reasonable length
                    return cleaned.length > 25 ? cleaned.slice(0, 25) : cleaned;
                }
            });
        });

        // Postal code input formatting
        ['resPostalCode', 'regPostalCode', 'motherPostalCode', 'fatherPostalCode'].forEach(function (fieldId) {
            setupInputValidation(fieldId, {
                transform: formatPostalCode
            });
        });
    }
      // Call setup for input formatters
    setupInputFormatters();
    
    // Display confirmation message after form submission
    function showConfirmationMessage() {
        // Create a modal with bootstrap if available
        if (typeof bootstrap !== 'undefined') {
            // Check if there's already a confirmation modal
            let confirmationModal = document.getElementById('confirmationModal');

            if (confirmationModal) {
                // Remove existing modal
                confirmationModal.remove();
            }

            // Create modal HTML with generic thank you message
            const modalHTML = `
                <div class="modal fade" id="confirmationModal" tabindex="-1" aria-labelledby="confirmationModalLabel" aria-hidden="true">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header bg-success text-white">
                                <h5 class="modal-title" id="confirmationModalLabel">Potwierdzenie Rejestracji</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                <p>Dziękujemy za wypełnienie formularza rejestracyjnego!</p>
                                <p>Zgłoszenie zostało przyjęte.</p>
                                <p>Skontaktujemy się z Państwem w najbliższym czasie.</p>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Zamknij</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Append modal to body
            document.body.insertAdjacentHTML('beforeend', modalHTML);

            // Show the modal
            const modal = new bootstrap.Modal(document.getElementById('confirmationModal'));
            modal.show();
        } else {
            // Fallback if Bootstrap is not available
            alert(`Dziękujemy za wypełnienie formularza rejestracyjnego!
Zgłoszenie zostało przyjęte.
Skontaktujemy się z Państwem w najbliższym czasie.`);
        }
    }
});
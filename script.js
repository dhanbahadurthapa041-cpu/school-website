document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contactForm');
    const formResponse = document.getElementById('formResponse');
    const submitBtn = document.getElementById('submitBtn');

    let currentLang = 'en';

    // Language Toggle Logic
    const langToggle = document.getElementById('langToggle');
    if (langToggle) {
        langToggle.addEventListener('click', () => {
            currentLang = currentLang === 'en' ? 'np' : 'en';
            langToggle.textContent = currentLang === 'en' ? 'नेपाली' : 'English';
            
            const translatableElements = document.querySelectorAll('[data-en][data-np]');
            translatableElements.forEach(el => {
                el.textContent = el.getAttribute(`data-${currentLang}`);
            });
        });
    }

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Disable button and show loading text
            submitBtn.disabled = true;
            submitBtn.textContent = currentLang === 'en' ? 'Sending...' : 'पठाउँदै...';
            formResponse.textContent = '';
            formResponse.style.color = 'inherit';

            // Gather form data
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                message: document.getElementById('message').value
            };

            try {
                // Send POST request to the backend
                const response = await fetch('/send-email', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();

                if (response.ok) {
                    // Success message
                    formResponse.textContent = currentLang === 'en' ? 'Message sent successfully!' : 'सन्देश सफलतापूर्वक पठाइयो!';
                    formResponse.style.color = 'green';
                    contactForm.reset();
                } else {
                    // Error from server
                    formResponse.textContent = result.message || (currentLang === 'en' ? 'Failed to send message.' : 'सन्देश पठाउन असफल भयो।');
                    formResponse.style.color = 'red';
                }
            } catch (error) {
                // Network error
                console.error('Error sending message:', error);
                formResponse.textContent = currentLang === 'en' ? 'An error occurred. Please try again.' : 'त्रुटि भयो। कृपया फेरि प्रयास गर्नुहोस्।';
                formResponse.style.color = 'red';
            } finally {
                // Re-enable the button
                submitBtn.disabled = false;
                submitBtn.textContent = submitBtn.getAttribute(`data-${currentLang}`) || 'Send Message';
            }
        });
    }
});

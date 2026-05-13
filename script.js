document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contactForm');
    const formResponse = document.getElementById('formResponse');
    const submitBtn = document.getElementById('submitBtn');

    let currentLang = 'en';

    // Language Toggle Logic
    const langToggle = document.getElementById('langToggle');
    const translatableElements = document.querySelectorAll('[data-en][data-np]');
    
    if (langToggle) {
        langToggle.addEventListener('click', () => {
            currentLang = currentLang === 'en' ? 'np' : 'en';
            langToggle.textContent = currentLang === 'en' ? 'नेपाली' : 'English';
            
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
                // NOTE: Replace 'YOUR_SERVICE_ID' and 'YOUR_TEMPLATE_ID' with actual EmailJS IDs!
                const templateParams = {
                    from_name: formData.name,
                    from_email: formData.email,
                    message: formData.message
                };
                
                await emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', templateParams);

                // Success message
                formResponse.textContent = currentLang === 'en' ? 'Message sent successfully!' : 'सन्देश सफलतापूर्वक पठाइयो!';
                formResponse.style.color = 'green';
                contactForm.reset();
            } catch (error) {
                // Error from EmailJS or network
                console.error('Error sending message:', error);
                formResponse.textContent = currentLang === 'en' ? 'Failed to send message. Please try again.' : 'सन्देश पठाउन असफल भयो। कृपया फेरि प्रयास गर्नुहोस्।';
                formResponse.style.color = 'red';
            } finally {
                // Re-enable the button
                submitBtn.disabled = false;
                submitBtn.textContent = submitBtn.getAttribute(`data-${currentLang}`) || 'Send Message';
            }
        });
    }
});

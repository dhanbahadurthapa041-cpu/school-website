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

            document.querySelectorAll('[data-en][data-np]').forEach(el => {
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

                await emailjs.send('service_s8k01w8', 'template_igust48', templateParams);

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

    // Fetch and render dynamic content (Phase 2)
    const loadDynamicContent = async () => {
        try {
            const response = await fetch('/data.json');
            if (!response.ok) throw new Error('Failed to load data.json');
            const data = await response.json();

            // Render Notices
            const tickerContent = document.getElementById('tickerContent');
            if (tickerContent && data.notices) {
                tickerContent.innerHTML = data.notices.map(notice => `
                    <span class="notice-item">
                        <i class="fa-solid fa-bullhorn"></i>
                        <span data-en="${notice.en}" data-np="${notice.np}">${notice[currentLang] || notice.en}</span>
                    </span>
                `).join('');
            }

            // Render Gallery
            const galleryGrid = document.getElementById('galleryGrid');
            if (galleryGrid && data.gallery) {
                galleryGrid.innerHTML = data.gallery.map(img => `
                    <img src="${img.src}" alt="${img.alt}" class="gallery-img" loading="lazy">
                `).join('');
            }
        } catch (error) {
            console.error('Error loading dynamic content:', error);
        }
    };

    loadDynamicContent();
});

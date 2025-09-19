// ===== APP.JS - Fundly Landing Page ===== //

     document.addEventListener('DOMContentLoaded', function() {
         // Check for reduced motion preference
         const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

         // ===== NAVIGATION SCROLL SHADOW ===== //
         const navbar = document.querySelector('.navbar');

         function handleScroll() {
             if (window.scrollY > 10) {
                 navbar.classList.add('scrolled');
             } else {
                 navbar.classList.remove('scrolled');
             }
         }

         window.addEventListener('scroll', handleScroll);

         // ===== SMOOTH SCROLL FOR NAVIGATION ===== //
         const navLinks = document.querySelectorAll('a[href^="#"]');

         navLinks.forEach(link => {
             link.addEventListener('click', function(e) {
                 e.preventDefault();

                 const targetId = this.getAttribute('href');
                 const targetElement = document.querySelector(targetId);

                 if (targetElement) {
                     if (prefersReducedMotion) {
                         // Jump directly without smooth scroll
                         targetElement.scrollIntoView();
                     } else {
                         // Smooth scroll
                         targetElement.scrollIntoView({
                             behavior: 'smooth',
                             block: 'start'
                         });
                     }
                 }
             });
         });

         // ===== EMAIL VALIDATION ===== //
         function isValidEmail(email) {
             const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
             return emailRegex.test(email);
         }

         // ===== FORM MESSAGE DISPLAY ===== //
         function showFormMessage(form, message, type) {
             // Remove any existing message
             const existingMessage = form.querySelector('.form-message');
             if (existingMessage) {
                 existingMessage.remove();
             }

             // Create new message element
             const messageElement = document.createElement('div');
             messageElement.className = `form-message ${type}`;
             messageElement.textContent = message;

             // Insert after form group
             const formGroup = form.querySelector('.form-group');
             formGroup.insertAdjacentElement('afterend', messageElement);

             // Auto-remove success messages after 5 seconds
             if (type === 'success') {
                 setTimeout(() => {
                     if (messageElement.parentNode) {
                         messageElement.remove();
                     }
                 }, 5000);
             }
         }

         // ===== WAITLIST FORM HANDLER ===== //
         function handleWaitlistForm(form) {
             form.addEventListener('submit', async function(e) {
                 e.preventDefault();

                 const emailInput = form.querySelector('input[type="email"]');
                 const submitButton = form.querySelector('button[type="submit"]');
                 const email = emailInput.value.trim();

                 // Validate email
                 if (!email) {
                     showFormMessage(form, 'Please enter your email address.', 'error');
                     emailInput.focus();
                     return;
                 }

                 if (!isValidEmail(email)) {
                     showFormMessage(form, 'Please enter a valid email address.', 'error');
                     emailInput.focus();
                     return;
                 }

                 // Show loading state
                 const originalButtonText = submitButton.textContent;
                 submitButton.textContent = 'Joining...';
                 submitButton.disabled = true;

                 try {
                     // Get form action URL
                     const formAction = form.getAttribute('action');

                     // Create form data
                     const formData = new FormData();
                     formData.append('email', email);

                     // Submit to Getform
                     const response = await fetch(formAction, {
                         method: 'POST',
                         body: formData,
                         headers: {
                             'Accept': 'application/json'
                         }
                     });

                     if (response.ok) {
                         // Success
                         showFormMessage(form, '✅ Thanks for signing up! Please check your email.',
      'success');
                         emailInput.value = '';

                         // Track successful signup (if analytics available)
                         if (typeof gtag !== 'undefined') {
                             gtag('event', 'signup', {
                                 event_category: 'waitlist',
                                 event_label: 'email'
                             });
                         }
                     } else {
                         // Server error
                         throw new Error(`Server responded with status: ${response.status}`);
                     }

                 } catch (error) {
                     // Network or other error
                     console.error('Form submission error:', error);
                     showFormMessage(form, '❌ Something went wrong saving your signup. Please try 
     again in a moment.', 'error');
                 } finally {
                     // Reset button state
                     submitButton.textContent = originalButtonText;
                     submitButton.disabled = false;
                 }
             });
         }

         // ===== INITIALIZE FORMS ===== //
         const waitlistForms = document.querySelectorAll('.waitlist-form, .waitlist-form-final');
         waitlistForms.forEach(form => {
             handleWaitlistForm(form);
         });

         // ===== EMAIL INPUT REAL-TIME VALIDATION ===== //
         const emailInputs = document.querySelectorAll('input[type="email"]');
         emailInputs.forEach(input => {
             input.addEventListener('input', function() {
                 const form = this.closest('form');
                 const existingMessage = form.querySelector('.form-message.error');

                 // Remove error message when user starts typing
                 if (existingMessage && this.value.length > 0) {
                     existingMessage.remove();
                 }
             });

             input.addEventListener('blur', function() {
                 const form = this.closest('form');
                 const email = this.value.trim();

                 // Only show validation error if there's content and it's invalid
                 if (email && !isValidEmail(email)) {
                     showFormMessage(form, 'Please enter a valid email address.', 'error');
                 }
             });
         });

         // ===== INTERSECTION OBSERVER FOR ANIMATIONS ===== //
         if (!prefersReducedMotion) {
             const observerOptions = {
                 threshold: 0.1,
                 rootMargin: '0px 0px -50px 0px'
             };

             const observer = new IntersectionObserver((entries) => {
                 entries.forEach(entry => {
                     if (entry.isIntersecting) {
                         entry.target.style.opacity = '1';
                         entry.target.style.transform = 'translateY(0)';
                     }
                 });
             }, observerOptions);

             // Observe sections for fade-in animation
             const sections = document.querySelectorAll('.step, .benefit, .faq-item');
             sections.forEach((section, index) => {
                 section.style.opacity = '0';
                 section.style.transform = 'translateY(20px)';
                 section.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease 
     ${index * 0.1}s`;
                 observer.observe(section);
             });
         }

         // ===== KEYBOARD NAVIGATION ENHANCEMENT ===== //
         document.addEventListener('keydown', function(e) {
             // Enable Enter key to submit forms when button is focused
             if (e.key === 'Enter') {
                 const activeElement = document.activeElement;
                 if (activeElement && activeElement.classList.contains('submit-button')) {
                     activeElement.click();
                 }
             }
         });

         // ===== FORM ACCESSIBILITY ENHANCEMENTS ===== //
         emailInputs.forEach(input => {
             // Add ARIA attributes
             input.setAttribute('aria-describedby', 'email-help');
             input.setAttribute('autocomplete', 'email');
             input.setAttribute('spellcheck', 'false');

             // Create hidden help text for screen readers
             if (!document.getElementById('email-help')) {
                 const helpText = document.createElement('span');
                 helpText.id = 'email-help';
                 helpText.className = 'sr-only';
                 helpText.textContent = 'Enter your email address to join the Fundly waitlist';
                 document.body.appendChild(helpText);
             }
         });

         // ===== PERFORMANCE OPTIMIZATION ===== //
         // Debounce scroll events
         let scrollTimeout;
         const originalScrollHandler = handleScroll;

         function debouncedScrollHandler() {
             if (scrollTimeout) {
                 clearTimeout(scrollTimeout);
             }
             scrollTimeout = setTimeout(originalScrollHandler, 10);
         }

         // Replace original scroll handler with debounced version
         window.removeEventListener('scroll', handleScroll);
         window.addEventListener('scroll', debouncedScrollHandler, { passive: true });

         // ===== ERROR HANDLING ===== //
         window.addEventListener('error', function(e) {
             console.error('JavaScript error:', e.error);
             // Could send error to analytics service here
         });

         // ===== UTILITY: Screen Reader Only Class ===== //
         const style = document.createElement('style');
         style.textContent = `
             .sr-only {
                 position: absolute;
                 width: 1px;
                 height: 1px;
                 padding: 0;
                 margin: -1px;
                 overflow: hidden;
                 clip: rect(0, 0, 0, 0);
                 white-space: nowrap;
                 border: 0;
             }
         `;
         document.head.appendChild(style);

         console.log('🚀 Fundly landing page initialized successfully!');
     });

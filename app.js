// ===== FUNDLY LANDING PAGE - APP.JS ===== //

  document.addEventListener('DOMContentLoaded', function() {
      // Check for reduced motion preference
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // ===== STICKY HEADER SCROLL SHADOW ===== //
      const header = document.querySelector('.header');

      function handleScroll() {
          if (window.scrollY > 10) {
              header.classList.add('scrolled');
          } else {
              header.classList.remove('scrolled');
          }
      }

      // Debounced scroll handler for better performance
      let scrollTimeout;
      function debouncedScrollHandler() {
          if (scrollTimeout) {
              clearTimeout(scrollTimeout);
          }
          scrollTimeout = setTimeout(handleScroll, 10);
      }

      window.addEventListener('scroll', debouncedScrollHandler, { passive: true });

      // ===== MOBILE NAVIGATION TOGGLE ===== //
      const navToggle = document.querySelector('.nav-toggle');
      const navLinks = document.querySelector('.nav-links');

      if (navToggle && navLinks) {
          navToggle.addEventListener('click', function() {
              const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
              navToggle.setAttribute('aria-expanded', !isExpanded);
              navLinks.classList.toggle('nav-open');
          });

          // Close nav when clicking outside
          document.addEventListener('click', function(e) {
              if (!navToggle.contains(e.target) && !navLinks.contains(e.target)) {
                  navToggle.setAttribute('aria-expanded', 'false');
                  navLinks.classList.remove('nav-open');
              }
          });
      }

      // ===== SMOOTH SCROLL FOR NAVIGATION ===== //
      const navLinksItems = document.querySelectorAll('a[href^="#"]');

      navLinksItems.forEach(link => {
          link.addEventListener('click', function(e) {
              e.preventDefault();

              const targetId = this.getAttribute('href');
              const targetElement = document.querySelector(targetId);

              if (targetElement) {
                  // Close mobile nav if open
                  if (navToggle && navLinks) {
                      navToggle.setAttribute('aria-expanded', 'false');
                      navLinks.classList.remove('nav-open');
                  }

                  if (prefersReducedMotion) {
                      // Jump directly without smooth scroll
                      targetElement.scrollIntoView();
                  } else {
                      // Smooth scroll with offset for sticky header
                      const headerHeight = header ? header.offsetHeight : 0;
                      const targetPosition = targetElement.offsetTop - headerHeight - 20;

                      window.scrollTo({
                          top: targetPosition,
                          behavior: 'smooth'
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

      // ===== FORM STATUS MESSAGES (INLINE) ===== //
      function showFormStatus(form, message, type) {
          const statusElement = form.querySelector('.form-status');

          if (statusElement) {
              statusElement.textContent = message;
              statusElement.className = `form-status ${type}`;
              statusElement.style.display = 'block';

              // Auto-hide success messages after 5 seconds
              if (type === 'success') {
                  setTimeout(() => {
                      statusElement.style.display = 'none';
                  }, 5000);
              }
          }
      }

      function hideFormStatus(form) {
          const statusElement = form.querySelector('.form-status');
          if (statusElement) {
              statusElement.style.display = 'none';
          }
      }

      // ===== WAITLIST FORM HANDLER ===== //
      function handleWaitlistForm(form) {
          const emailInput = form.querySelector('input[type="email"]');
          const submitButton = form.querySelector('button[type="submit"]');

          // Real-time validation feedback
          emailInput.addEventListener('input', function() {
              hideFormStatus(form);
          });

          emailInput.addEventListener('blur', function() {
              const email = this.value.trim();
              if (email && !isValidEmail(email)) {
                  showFormStatus(form, 'Please enter a valid email address.', 'error');
              }
          });

          // Form submission
          form.addEventListener('submit', async function(e) {
              e.preventDefault();

              const email = emailInput.value.trim();

              // Validate email
              if (!email) {
                  showFormStatus(form, 'Please enter your email address.', 'error');
                  emailInput.focus();
                  return;
              }

              if (!isValidEmail(email)) {
                  showFormStatus(form, 'Please enter a valid email address.', 'error');
                  emailInput.focus();
                  return;
              }

              // Show loading state
              const originalButtonText = submitButton.querySelector('span').textContent;
              submitButton.querySelector('span').textContent = 'Joining...';
              submitButton.disabled = true;
              hideFormStatus(form);

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
                      // Success - inline message
                      showFormStatus(form, 'Thanks for signing up! Please check your email.',
  'success');
                      emailInput.value = '';

                      // Track successful signup (if analytics available)
                      if (typeof gtag !== 'undefined') {
                          gtag('event', 'signup', {
                              event_category: 'waitlist',
                              event_label: 'email'
                          });
                      }

                      // Track with Facebook Pixel if available
                      if (typeof fbq !== 'undefined') {
                          fbq('track', 'Lead');
                      }
                  } else {
                      // Server error
                      throw new Error(`Server responded with status: ${response.status}`);
                  }

              } catch (error) {
                  // Network or other error - inline message
                  console.error('Form submission error:', error);
                  showFormStatus(form, 'Something went wrong saving your signup. Please try again in 
  a moment.', 'error');
              } finally {
                  // Reset button state
                  submitButton.querySelector('span').textContent = originalButtonText;
                  submitButton.disabled = false;
              }
          });
      }

      // ===== INITIALIZE FORMS ===== //
      const waitlistForms = document.querySelectorAll('.waitlist-form');
      waitlistForms.forEach(form => {
          handleWaitlistForm(form);
      });

      // ===== FAQ ACCORDION ENHANCEMENT ===== //
      const faqItems = document.querySelectorAll('.faq-item');

      faqItems.forEach(item => {
          const summary = item.querySelector('summary');

          // Add keyboard navigation
          summary.addEventListener('keydown', function(e) {
              if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  item.open = !item.open;
              }
          });

          // Close other FAQs when opening one (accordion behavior)
          item.addEventListener('toggle', function() {
              if (this.open) {
                  faqItems.forEach(otherItem => {
                      if (otherItem !== this && otherItem.open) {
                          otherItem.open = false;
                      }
                  });
              }
          });
      });

      // ===== STICKY CTA VISIBILITY ===== //
      const stickyCta = document.querySelector('.sticky-cta');
      const heroSection = document.querySelector('.hero');
      const finalCtaSection = document.querySelector('#waitlist');

      if (stickyCta && heroSection && finalCtaSection) {
          const observer = new IntersectionObserver((entries) => {
              entries.forEach(entry => {
                  if (entry.target === heroSection) {
                      // Hide sticky CTA when hero is visible
                      stickyCta.style.display = entry.isIntersecting ? 'none' : 'block';
                  } else if (entry.target === finalCtaSection) {
                      // Hide sticky CTA when final CTA is visible
                      stickyCta.style.display = entry.isIntersecting ? 'none' : 'block';
                  }
              });
          }, {
              threshold: 0.1
          });

          observer.observe(heroSection);
          observer.observe(finalCtaSection);
      }

      // ===== LIGHT FADE/TRANSLATE ANIMATIONS ===== //
      if (!prefersReducedMotion) {
          const observerOptions = {
              threshold: 0.1,
              rootMargin: '0px 0px -50px 0px'
          };

          const fadeInObserver = new IntersectionObserver((entries) => {
              entries.forEach(entry => {
                  if (entry.isIntersecting) {
                      entry.target.style.opacity = '1';
                      entry.target.style.transform = 'translateY(0)';
                  }
              });
          }, observerOptions);

          // Observe cards for fade-in animation
          const cards = document.querySelectorAll('.card');
          cards.forEach((card, index) => {
              card.style.opacity = '0';
              card.style.transform = 'translateY(20px)';
              card.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index
   * 0.1}s`;
              fadeInObserver.observe(card);
          });

          // Observe FAQ items
          const faqElements = document.querySelectorAll('.faq-item');
          faqElements.forEach((item, index) => {
              item.style.opacity = '0';
              item.style.transform = 'translateY(20px)';
              item.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index
   * 0.1}s`;
              fadeInObserver.observe(item);
          });
      }

      // ===== KEYBOARD NAVIGATION ENHANCEMENT ===== //
      document.addEventListener('keydown', function(e) {
          // Enable Enter key to submit forms when button is focused
          if (e.key === 'Enter') {
              const activeElement = document.activeElement;
              if (activeElement && activeElement.classList.contains('btn')) {
                  activeElement.click();
              }
          }

          // Escape key to close mobile nav
          if (e.key === 'Escape' && navToggle && navLinks) {
              navToggle.setAttribute('aria-expanded', 'false');
              navLinks.classList.remove('nav-open');
          }
      });

      // ===== FORM ACCESSIBILITY ENHANCEMENTS ===== //
      const emailInputs = document.querySelectorAll('input[type="email"]');
      emailInputs.forEach(input => {
          // Add ARIA attributes for better accessibility
          input.setAttribute('spellcheck', 'false');
          input.setAttribute('autocapitalize', 'none');
          input.setAttribute('autocorrect', 'off');

          // Improve mobile experience
          if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
              input.setAttribute('inputmode', 'email');
          }
      });

      // ===== PERFORMANCE OPTIMIZATIONS ===== //

      // Preload critical images
      function preloadImage(src) {
          const img = new Image();
          img.src = src;
      }

      // Preload app icons if they exist
      const appIcons = document.querySelectorAll('.nav-logo, .app-icon');
      appIcons.forEach(icon => {
          if (icon.src) {
              preloadImage(icon.src);
          }
      });

      // ===== ERROR HANDLING ===== //
      window.addEventListener('error', function(e) {
          console.error('JavaScript error:', e.error);

          // Could send error to analytics service here
          if (typeof gtag !== 'undefined') {
              gtag('event', 'exception', {
                  description: e.error.message,
                  fatal: false
              });
          }
      });

      // ===== UTILITY FUNCTIONS ===== //

      // Detect if user is on mobile device
      function isMobileDevice() {
          return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera 
  Mini/i.test(navigator.userAgent);
      }

      // Add mobile class to body if needed
      if (isMobileDevice()) {
          document.body.classList.add('mobile-device');
      }

      // ===== CONSOLE BRANDING ===== //
      if (console && console.log) {
          console.log('%cFundly Landing Page', 'color: #2d6a4f; font-size: 18px; font-weight: 
  bold;');
          console.log('%cMaking Saving Social.', 'color: #1b4332; font-size: 14px;');
          console.log('%cLanding page initialized successfully!', 'color: #666; font-size: 12px;');
      }
  });

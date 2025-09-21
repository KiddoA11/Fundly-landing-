  document.addEventListener('DOMContentLoaded', function() {
      // Mobile Navigation Toggle
      const navToggle = document.querySelector('.nav-toggle');
      const navLinks = document.querySelector('.nav-links');

      if (navToggle && navLinks) {
          navToggle.addEventListener('click', function() {
              const isExpanded = navToggle.getAttribute('aria-expanded') ===
   'true';
              navToggle.setAttribute('aria-expanded', !isExpanded);
              navLinks.classList.toggle('nav-open');
          });

          // Close nav when clicking outside
          document.addEventListener('click', function(e) {
              if (!navToggle.contains(e.target) &&
  !navLinks.contains(e.target)) {
                  navToggle.setAttribute('aria-expanded', 'false');
                  navLinks.classList.remove('nav-open');
              }
          });
      }

      // Header scroll effect
      const header = document.querySelector('.header');
      if (header) {
          window.addEventListener('scroll', function() {
              if (window.scrollY > 10) {
                  header.classList.add('scrolled');
              } else {
                  header.classList.remove('scrolled');
              }
          });
      }

      // Smooth scroll for navigation links
      const navLinksItems = document.querySelectorAll('a[href^="#"]');
      navLinksItems.forEach(function(link) {
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

                  // Smooth scroll to target
                  const headerHeight = header ? header.offsetHeight : 0;
                  const targetPosition = targetElement.offsetTop -
  headerHeight - 20;

                  window.scrollTo({
                      top: targetPosition,
                      behavior: 'smooth'
                  });
              }
          });
      });

      // Email validation
      function isValidEmail(email) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(email);
      }

      // Form status messages
      function showFormStatus(form, message, type) {
          const statusElement = form.querySelector('.form-status');
          if (statusElement) {
              statusElement.textContent = message;
              statusElement.className = 'form-status ' + type;
              statusElement.style.display = 'block';

              if (type === 'success') {
                  setTimeout(function() {
                      statusElement.style.display = 'none';
                  }, 5000);
              }
          }
      }

      // Waitlist form handling
      const waitlistForms = document.querySelectorAll('.waitlist-form');
      waitlistForms.forEach(function(form) {
          const emailInput = form.querySelector('input[type="email"]');
          const submitButton = form.querySelector('button[type="submit"]');

          form.addEventListener('submit', function(e) {
              e.preventDefault();

              const email = emailInput.value.trim();

              if (!email) {
                  showFormStatus(form, 'Please enter your email address.',
  'error');
                  emailInput.focus();
                  return;
              }

              if (!isValidEmail(email)) {
                  showFormStatus(form, 'Please enter a valid email 
  address.', 'error');
                  emailInput.focus();
                  return;
              }

              // Show loading state
              const originalButtonText =
  submitButton.querySelector('span').textContent;
              submitButton.querySelector('span').textContent = 'Joining...';
              submitButton.disabled = true;

              // Submit form
              const formData = new FormData();
              formData.append('email', email);

              fetch(form.getAttribute('action'), {
                  method: 'POST',
                  body: formData,
                  headers: {
                      'Accept': 'application/json'
                  }
              })
              .then(function(response) {
                  if (response.ok) {
                      showFormStatus(form, 'Thanks for signing up! Please 
  check your email.', 'success');
                      emailInput.value = '';
                  } else {
                      throw new Error('Network response was not ok');
                  }
              })
              .catch(function(error) {
                  console.error('Form submission error:', error);
                  showFormStatus(form, 'Something went wrong. Please try 
  again in a moment.', 'error');
              })
              .finally(function() {
                  submitButton.querySelector('span').textContent =
  originalButtonText;
                  submitButton.disabled = false;
              });
          });
      });

      // FAQ accordion
      const faqItems = document.querySelectorAll('.faq-item');
      faqItems.forEach(function(item) {
          item.addEventListener('toggle', function() {
              if (this.open) {
                  faqItems.forEach(function(otherItem) {
                      if (otherItem !== item && otherItem.open) {
                          otherItem.open = false;
                      }
                  });
              }
          });
      });

      // Keyboard navigation
      document.addEventListener('keydown', function(e) {
          if (e.key === 'Escape' && navToggle && navLinks) {
              navToggle.setAttribute('aria-expanded', 'false');
              navLinks.classList.remove('nav-open');
          }
      });

      // Add click functionality to logo and brand name to scroll to top
      const navLogo = document.querySelector('.nav-logo');
      const navWordmark = document.querySelector('.nav-wordmark');
      const navBrand = document.querySelector('.nav-brand');

      function scrollToTop() {
          window.scrollTo({
              top: 0,
              behavior: 'smooth'
          });
      }

      // Add click handlers to both logo and wordmark
      if (navLogo) {
          navLogo.addEventListener('click', scrollToTop);
          navLogo.style.cursor = 'pointer';
      }

      if (navWordmark) {
          navWordmark.addEventListener('click', scrollToTop);
          navWordmark.style.cursor = 'pointer';
      }

      // Also add click handler to the entire brand container for better UX
      if (navBrand) {
          navBrand.addEventListener('click', scrollToTop);
          navBrand.style.cursor = 'pointer';
      }

      console.log('Fundly Landing Page - JavaScript loaded successfully!');
  });

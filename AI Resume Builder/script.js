// Landing Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
  // Smooth scrolling for navigation links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
          e.preventDefault();
          const target = document.querySelector(this.getAttribute('href'));
          if (target) {
              target.scrollIntoView({
                  behavior: 'smooth',
                  block: 'start'
              });
          }
      });
  });

  // Navbar background change on scroll
  window.addEventListener('scroll', function() {
      const navbar = document.querySelector('.navbar');
      if (window.scrollY > 50) {
          navbar.style.backgroundColor = 'rgba(13, 17, 23, 0.95)';
          navbar.style.backdropFilter = 'blur(10px)';
      } else {
          navbar.style.backgroundColor = '';
          navbar.style.backdropFilter = '';
      }
  });

  // Animate stats on scroll
  const observerOptions = {
      threshold: 0.5,
      rootMargin: '0px 0px -100px 0px'
  };

  const observer = new IntersectionObserver(function(entries) {
      entries.forEach(entry => {
          if (entry.isIntersecting) {
              animateStats();
              observer.unobserve(entry.target);
          }
      });
  }, observerOptions);

  const statsSection = document.querySelector('.hero-stats');
  if (statsSection) {
      observer.observe(statsSection);
  }

  function animateStats() {
      const stats = document.querySelectorAll('.hero-stats h3');
      stats.forEach(stat => {
          const finalValue = stat.textContent;
          const numericValue = parseInt(finalValue.replace(/\D/g, ''));
          const suffix = finalValue.replace(/\d/g, '');
          
          let currentValue = 0;
          const increment = numericValue / 50;
          
          const timer = setInterval(() => {
              currentValue += increment;
              if (currentValue >= numericValue) {
                  stat.textContent = finalValue;
                  clearInterval(timer);
              } else {
                  stat.textContent = Math.floor(currentValue) + suffix;
              }
          }, 30);
      });
  }

  // Template hover effects
  document.querySelectorAll('.template-card').forEach(card => {
      card.addEventListener('mouseenter', function() {
          this.style.transform = 'translateY(-10px) scale(1.02)';
      });
      
      card.addEventListener('mouseleave', function() {
          this.style.transform = 'translateY(0) scale(1)';
      });
  });

  // Feature card animations
  const featureObserver = new IntersectionObserver(function(entries) {
      entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
              setTimeout(() => {
                  entry.target.style.opacity = '1';
                  entry.target.style.transform = 'translateY(0)';
              }, index * 100);
          }
      });
  }, { threshold: 0.1 });

  document.querySelectorAll('.feature-card').forEach(card => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(30px)';
      card.style.transition = 'all 0.6s ease';
      featureObserver.observe(card);
  });
});

// Utility functions for navigation
function navigateTo(page) {
  window.location.href = page;
}

// Form validation (if needed for future contact forms)
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Local storage utilities for user preferences
function saveUserPreference(key, value) {
  localStorage.setItem(`aiResumeBuilder_${key}`, JSON.stringify(value));
}

function getUserPreference(key, defaultValue = null) {
  const stored = localStorage.getItem(`aiResumeBuilder_${key}`);
  return stored ? JSON.parse(stored) : defaultValue;
}

// Theme toggle functionality (for future implementation)
function toggleTheme() {
  const body = document.body;
  const currentTheme = body.classList.contains('dark-theme') ? 'dark' : 'light';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  body.classList.remove(`${currentTheme}-theme`);
  body.classList.add(`${newTheme}-theme`);
  
  saveUserPreference('theme', newTheme);
}

// Initialize theme from user preference
function initializeTheme() {
  const savedTheme = getUserPreference('theme', 'dark');
  document.body.classList.add(`${savedTheme}-theme`);
}

// Call theme initialization
initializeTheme();
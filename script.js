/* ==========================================================================
   0. Tell CSS that JS is running
   ========================================================================== */
document.documentElement.classList.add('js');

const prefersReducedMotion =
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ==========================================================================
   1. SCROLL REVEAL ANIMATIONS
   ========================================================================== */
function initScrollAnimations() {
  const items = document.querySelectorAll('.reveal');

  if (!('IntersectionObserver' in window) || prefersReducedMotion) {
    items.forEach(el => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  });

  items.forEach(el => observer.observe(el));
}

/* ==========================================================================
   2. SCROLL EFFECTS (progress bar + sticky header shrink + back-to-top)
   One listener, three jobs.
   ========================================================================== */
function initScrollEffects() {
  const progress = document.querySelector('.scroll-progress-fill');
  const backBtn  = document.getElementById('back-to-top');
  const header   = document.getElementById('main-header');

  function onScroll() {
    const y   = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;

    if (progress) {
      progress.style.width = max > 0 ? (y / max) * 100 + '%' : '0%';
    }
    if (backBtn) {
      backBtn.classList.toggle('is-visible', y > 300);
    }
    if (header) {
      header.classList.toggle('is-scrolled', y > 20);
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion ? 'auto' : 'smooth'
      });
    });
  }
}

/* ==========================================================================
   3. ACTIVE NAV LINK (highlights whichever section is in view)
   ========================================================================== */
function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.nav-menu a');
  if (!sections.length || !links.length) return;

  if (!('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        links.forEach(link => {
          link.classList.toggle('is-active', link.getAttribute('href') === '#' + id);
        });
      }
    });
  }, {
    // Only trigger when the section sits in the upper-middle of the viewport
    rootMargin: '-40% 0px -55% 0px'
  });

  sections.forEach(section => observer.observe(section));
}

/* ==========================================================================
   4. TYPING EFFECT (hero roles)
   ========================================================================== */
function initTyping() {
  const el = document.getElementById('typed');
  if (!el) return;

  const roles = ['Front-end Developer', 'UI/UX Designer', 'HCI Student', 'Python Programmer'];

  // Reduced motion: just show one role, no animation
  if (prefersReducedMotion) {
    el.textContent = roles[0];
    return;
  }

  let roleIndex = 0;
  let charIndex = 0;
  let deleting  = false;

  function tick() {
    const role = roles[roleIndex];

    if (!deleting) {
      el.textContent = role.slice(0, charIndex + 1);
      charIndex++;
      if (charIndex === role.length) {
        setTimeout(() => { deleting = true; tick(); }, 1500);
        return;
      }
    } else {
      el.textContent = role.slice(0, charIndex - 1);
      charIndex--;
      if (charIndex === 0) {
        deleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
      }
    }

    setTimeout(tick, deleting ? 45 : 90);
  }

  tick();
}

/* ==========================================================================
   5. STAT COUNTERS (count up when scrolled into view)
   ========================================================================== */
function initCounters() {
  const counters = document.querySelectorAll('.stat-number');
  if (!counters.length) return;

  function animate(el) {
    const target  = parseInt(el.dataset.target, 10) || 0;
    const suffix  = el.dataset.suffix || '';
    const duration = 1200;
    const start   = performance.now();

    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      // easeOutQuad for a nicer finish
      const eased = 1 - (1 - progress) * (1 - progress);
      el.textContent = Math.round(eased * target) + (progress === 1 ? suffix : '');
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  if (!('IntersectionObserver' in window) || prefersReducedMotion) {
    counters.forEach(el => {
      el.textContent = el.dataset.target + (el.dataset.suffix || '');
    });
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animate(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
}

/* ==========================================================================
   6. PROJECT FILTERING
   ========================================================================== */
function initProjectFiltering() {
  const buttons  = document.querySelectorAll('.filter-btn');
  const projects = document.querySelectorAll('.project-item');
  const counter  = document.getElementById('filter-count');

  if (!buttons.length || !projects.length) return;

  function applyFilter(filter) {
    let visible = 0;

    projects.forEach(project => {
      const match = filter === 'all' || project.dataset.category === filter;
      project.classList.toggle('is-hidden', !match);
      if (match) project.classList.add('is-visible');
      if (match) visible++;
    });

    buttons.forEach(btn => {
      const isActive = btn.dataset.filter === filter;
      btn.classList.toggle('is-active', isActive);
      btn.setAttribute('aria-pressed', String(isActive));
    });

    if (counter) {
      counter.textContent = filter === 'all'
        ? `Showing all ${visible} projects`
        : `Showing ${visible} project${visible === 1 ? '' : 's'} in this category`;
    }
  }

  buttons.forEach(btn => {
    btn.addEventListener('click', () => applyFilter(btn.dataset.filter));
  });

  applyFilter('all');
}

/* ==========================================================================
   7. TOAST HELPER
   ========================================================================== */
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('is-visible'));

  setTimeout(() => {
    toast.classList.remove('is-visible');
    setTimeout(() => toast.remove(), 350);
  }, 3000);
}

/* ==========================================================================
   8. COPY EMAIL BUTTON
   ========================================================================== */
function initCopyEmail() {
  const btn = document.getElementById('copy-email');
  const link = document.getElementById('email-link');
  if (!btn || !link) return;

  btn.addEventListener('click', async () => {
    const email = link.textContent.trim();

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(email);
      } else {
        // Fallback for older browsers
        const ta = document.createElement('textarea');
        ta.value = email;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
      }
      showToast('Email copied to clipboard', 'success');
    } catch {
      showToast('Could not copy — please copy manually', 'error');
    }
  });
}

/* ==========================================================================
   9. CONTACT FORM VALIDATION
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const status = document.getElementById('form-status');

  const rules = {
    name: value => {
      if (!value.trim()) return 'Please enter your name.';
      if (value.trim().length < 2) return 'Name must be at least 2 characters.';
      return '';
    },
    email: value => {
      if (!value.trim()) return 'Please enter your email.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim())) {
        return 'Please enter a valid email address.';
      }
      return '';
    },
    message: value => {
      if (!value.trim()) return 'Please enter a message.';
      if (value.trim().length < 10) return 'Message must be at least 10 characters.';
      return '';
    }
  };

  function showError(field, message) {
    const errorEl = document.getElementById(`${field.name}-error`);
    field.classList.toggle('invalid', Boolean(message));
    field.setAttribute('aria-invalid', message ? 'true' : 'false');
    if (errorEl) errorEl.textContent = message;
  }

  function validateField(field) {
    const rule = rules[field.name];
    if (!rule) return true;
    const message = rule(field.value);
    showError(field, message);
    return !message;
  }

  form.querySelectorAll('input, textarea').forEach(field => {
    if (!rules[field.name]) return;
    field.addEventListener('blur', () => validateField(field));
    field.addEventListener('input', () => {
      if (field.classList.contains('invalid')) validateField(field);
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (form.company.value !== '') return;

    const fields = [...form.querySelectorAll('input, textarea')]
      .filter(f => rules[f.name]);

    const results = fields.map(validateField);

    if (results.includes(false)) {
      status.textContent = 'Please fix the highlighted fields.';
      status.className = 'form-status error';
      form.querySelector('.invalid')?.focus();
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    status.textContent = 'Sending…';
    status.className = 'form-status';

    try {
      /* ------------------------------------------------------------------
         REPLACE THIS BLOCK WITH YOUR REAL ENDPOINT.
         Formspree example:
         const res = await fetch('https://formspree.io/f/YOUR_ID', {
           method: 'POST',
           headers: { 'Accept': 'application/json' },
           body: new FormData(form)
         });
         if (!res.ok) throw new Error('Request failed');
         ------------------------------------------------------------------ */

      await new Promise(r => setTimeout(r, 800)); // DEMO ONLY

      form.reset();
      fields.forEach(f => showError(f, ''));
      status.textContent = 'Thanks! Your message has been sent.';
      status.className = 'form-status success';
      showToast('Message sent successfully', 'success');
    } catch {
      status.textContent = 'Something went wrong. Please email me directly.';
      status.className = 'form-status error';
      showToast('Could not send — try again later', 'error');
    } finally {
      submitBtn.disabled = false;
    }
  });
}

/* ==========================================================================
   10. HAMBURGER MENU
   ========================================================================== */
function initHamburger() {
  const toggle = document.querySelector('.nav-toggle');
  const header = document.querySelector('.header-flex');
  if (!toggle || !header) return;

  function setOpen(open) {
    header.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
  }

  toggle.addEventListener('click', () => {
    setOpen(!header.classList.contains('is-open'));
  });

  header.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => setOpen(false));
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && header.classList.contains('is-open')) {
      setOpen(false);
      toggle.focus();
    }
  });

  document.addEventListener('click', (e) => {
    if (header.classList.contains('is-open') && !header.contains(e.target)) {
      setOpen(false);
    }
  });
}

/* ==========================================================================
   11. ENHANCED MODALS (close on Escape or backdrop click)
   ========================================================================== */
function initModalEnhancements() {
  const modals = document.querySelectorAll('.modal-overlay, .image-modal');
  if (!modals.length) return;

  function closeModal() {
    location.replace('#!');
  }

  // Click the dark backdrop (not the content) → close
  modals.forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  });

  // Escape → close
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const hash = location.hash;
    if (hash === '#login-modal' || hash === '#figma-modal') closeModal();
  });
}

/* ==========================================================================
   INIT
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  initScrollAnimations();
  initScrollEffects();
  initActiveNav();
  initTyping();
  initCounters();
  initProjectFiltering();
  initCopyEmail();
  initContactForm();
  initHamburger();
  initModalEnhancements();
});
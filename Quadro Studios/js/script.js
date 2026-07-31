/* ================================================================
   QUADRO STUDIOS — MAIN JAVASCRIPT FILE
   This file controls all the interactive behavior on the page:
   the navbar scroll effect, mobile menu, cursor glow, scroll
   animations, animated counters, button ripples, and the FAQ
   accordion. Comments explain each function in beginner-friendly
   terms since this project is a learning project too.
================================================================ */


/* ----------------------------------------------------------------
   Wait until the whole HTML document has loaded before running
   any code. This avoids errors from trying to grab elements that
   don't exist in the page yet.
---------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {

  initLoadingScreen();
  initNavbarScroll();
  initMobileMenu();
  initCursorGlow();
  initScrollReveal();
  initAnimatedCounters();
  initButtonRipple();
  initAccordion();

});


/* ================================================================
   FUNCTION: initLoadingScreen
   What it does: Hides the fullscreen loading overlay once the page
   is actually ready. It waits for the browser's "load" event (all
   images, fonts, and other resources finished), then fades the
   screen out and removes it completely so it can't block clicks
   or show up for screen readers. As a safety net, it also hides
   the screen after 2.5 seconds no matter what — so a slow network
   or a resource that never finishes loading can't strand someone
   looking at a loading screen forever.
================================================================ */
function initLoadingScreen() {
  const loadingScreen = document.getElementById('loadingScreen');
  if (!loadingScreen) return;

  let hasHidden = false;

  function hideLoadingScreen() {
    if (hasHidden) return; // avoid running the hide logic twice
    hasHidden = true;

    loadingScreen.classList.add('is-loaded');
    document.body.classList.remove('is-loading');

    // Wait for the fade-out transition to finish, then remove the
    // overlay from the page entirely so it's fully out of the way.
    loadingScreen.addEventListener('transitionend', () => {
      loadingScreen.remove();
    }, { once: true });
  }

  // Safety net: never make someone wait more than 2.5s to see the site
  const safetyTimer = setTimeout(hideLoadingScreen, 2500);

  window.addEventListener('load', () => {
    clearTimeout(safetyTimer);
    hideLoadingScreen();
  });
}


/* ================================================================
   FUNCTION: initNavbarScroll
   What it does: Watches how far the user has scrolled down the
   page. Once they scroll past 40 pixels, it adds a class called
   "is-scrolled" to the navbar, which (in our CSS) turns on the
   frosted glass background. This keeps the navbar transparent at
   the very top of the hero, and readable once you scroll down.
================================================================ */
function initNavbarScroll() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  const SCROLL_THRESHOLD = 40; // pixels scrolled before navbar becomes solid

  function handleScroll() {
    if (window.scrollY > SCROLL_THRESHOLD) {
      navbar.classList.add('is-scrolled');
    } else {
      navbar.classList.remove('is-scrolled');
    }
  }

  // Run once on page load in case the page is already scrolled
  handleScroll();

  // Run every time the user scrolls
  window.addEventListener('scroll', handleScroll);
}


/* ================================================================
   FUNCTION: initMobileMenu
   What it does: Handles opening and closing the mobile navigation
   menu when the hamburger icon (three lines) is clicked. It also
   turns the hamburger icon into an "X" shape using a CSS class,
   and closes the menu automatically if a link inside it is clicked.
================================================================ */
function initMobileMenu() {
  const burgerBtn = document.getElementById('burgerBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  if (!burgerBtn || !mobileMenu) return;

  function toggleMenu() {
    const isOpen = mobileMenu.classList.toggle('is-open');
    burgerBtn.classList.toggle('is-open', isOpen);
    // Update aria-expanded so screen readers announce the state correctly
    burgerBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  }

  burgerBtn.addEventListener('click', toggleMenu);

  // Close the menu whenever a link inside it is clicked
  const menuLinks = mobileMenu.querySelectorAll('a');
  menuLinks.forEach((link) => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('is-open');
      burgerBtn.classList.remove('is-open');
      burgerBtn.setAttribute('aria-expanded', 'false');
    });
  });
}


/* ================================================================
   FUNCTION: initCursorGlow
   What it does: Creates a soft gold glow that follows the mouse
   as it moves around the screen. This is a purely decorative
   effect that adds to the "futuristic" feel of the site. It's
   automatically skipped on touch devices because there's no mouse.
================================================================ */
function initCursorGlow() {
  const glow = document.getElementById('cursorGlow');
  if (!glow) return;

  // Only run this effect if the device actually supports hovering
  // (i.e. it has a mouse, not just a touchscreen)
  const supportsHover = window.matchMedia('(hover: hover)').matches;
  if (!supportsHover) return;

  document.addEventListener('mousemove', (event) => {
    // Move the glow element to follow the cursor position
    glow.style.left = `${event.clientX}px`;
    glow.style.top = `${event.clientY}px`;
    glow.classList.add('is-active');
  });

  // Hide the glow when the mouse leaves the browser window
  document.addEventListener('mouseleave', () => {
    glow.classList.remove('is-active');
  });
}


/* ================================================================
   FUNCTION: initScrollReveal
   What it does: Finds every element with the class "fade-up" and
   watches to see when it scrolls into view. Once visible, it adds
   the "is-visible" class, which (in our CSS) triggers a smooth
   fade + slide-up animation. This uses the IntersectionObserver
   browser API, which is efficient because it doesn't have to
   constantly check scroll position manually.
================================================================ */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.fade-up');
  if (revealElements.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          // Stop watching this element once it has appeared —
          // we don't need to animate it again.
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15, // trigger when 15% of the element is visible
      rootMargin: '0px 0px -60px 0px', // trigger slightly before it's fully in view
    }
  );

  revealElements.forEach((el) => observer.observe(el));
}


/* ================================================================
   FUNCTION: initAnimatedCounters
   What it does: Finds every element with the class "stats__number"
   and animates its value counting up from 0 to its target number
   (stored in the "data-target" attribute) once it scrolls into
   view. This creates the "animated counter" effect in the stats
   section.
================================================================ */
function initAnimatedCounters() {
  const counters = document.querySelectorAll('.stats__number');
  if (counters.length === 0) return;

  const COUNT_DURATION = 1800; // total animation time in milliseconds

  // This function performs the actual counting animation for one element
  function animateCounter(counterEl) {
    const target = parseInt(counterEl.getAttribute('data-target'), 10) || 0;
    const suffix = counterEl.getAttribute('data-suffix') || '';
    const startTime = performance.now();

    function updateFrame(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / COUNT_DURATION, 1);

      // Ease-out effect so the counting slows down near the end
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.round(eased * target);

      counterEl.textContent = `${currentValue}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(updateFrame);
      }
    }

    requestAnimationFrame(updateFrame);
  }

  // Only start counting once the stats section scrolls into view
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.6 }
  );

  counters.forEach((counter) => observer.observe(counter));
}


/* ================================================================
   FUNCTION: initButtonRipple
   What it does: Adds a "ripple" click effect to every button with
   the class "btn--ripple". When clicked, it records exactly where
   on the button the click happened (using CSS variables --x and
   --y), then briefly adds a class that plays the ripple animation
   defined in the CSS file.
================================================================ */
function initButtonRipple() {
  const rippleButtons = document.querySelectorAll('.btn--ripple');
  if (rippleButtons.length === 0) return;

  rippleButtons.forEach((button) => {
    button.addEventListener('click', (event) => {
      const rect = button.getBoundingClientRect();

      // Calculate the click position relative to the button itself
      const clickX = event.clientX - rect.left;
      const clickY = event.clientY - rect.top;

      // Pass those coordinates into CSS so the ripple starts at the click point
      button.style.setProperty('--x', `${clickX}px`);
      button.style.setProperty('--y', `${clickY}px`);

      // Restart the ripple animation by toggling the class off and on
      button.classList.remove('is-rippling');
      // Force the browser to acknowledge the removal before re-adding it
      void button.offsetWidth;
      button.classList.add('is-rippling');
    });
  });
}


/* ================================================================
   FUNCTION: initAccordion
   What it does: Powers the FAQ accordion. When a question button
   is clicked, it smoothly expands its answer panel by setting an
   exact pixel max-height (calculated from the content itself), and
   closes any other open panel so only one question is open at a
   time. Also updates aria-expanded for screen reader accessibility.
================================================================ */
function initAccordion() {
  const accordionItems = document.querySelectorAll('.accordion__item');
  if (accordionItems.length === 0) return;

  accordionItems.forEach((item) => {
    const trigger = item.querySelector('.accordion__trigger');
    const panel = item.querySelector('.accordion__panel');
    if (!trigger || !panel) return;

    trigger.addEventListener('click', () => {
      const isCurrentlyOpen = trigger.getAttribute('aria-expanded') === 'true';

      // First, close every accordion item on the page
      accordionItems.forEach((otherItem) => {
        const otherTrigger = otherItem.querySelector('.accordion__trigger');
        const otherPanel = otherItem.querySelector('.accordion__panel');
        otherTrigger.setAttribute('aria-expanded', 'false');
        otherPanel.style.maxHeight = null;
      });

      // Then, if the clicked item was NOT already open, open it.
      // (If it WAS already open, we leave it closed — this creates
      // a toggle effect.)
      if (!isCurrentlyOpen) {
        trigger.setAttribute('aria-expanded', 'true');
        // Set max-height to the panel's actual content height so the
        // CSS transition can animate smoothly to that exact value.
        panel.style.maxHeight = `${panel.scrollHeight}px`;
      }
    });
  });
}

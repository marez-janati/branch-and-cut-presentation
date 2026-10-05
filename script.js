/**
 * BRANCH & CUT PRESENTATION ORCHESTRATOR
 * Slide Fetching, Dynamic Ledger State Sync, & Keyboard Navigation
 */

(function () {
  'use strict';

  // State Management
  const TOTAL_SLIDES = 9;
  let currentSlideIndex = 0;

  // DOM Elements
  const slideStage = document.getElementById('slideStage');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const currentSlideNum = document.getElementById('currentSlideNum');
  const totalSlidesNum = document.getElementById('totalSlidesNum');
  const progressBar = document.getElementById('progressBar');
  const dotContainer = document.getElementById('dotContainer');

  // Ledger Elements
  const ledgerLB = document.getElementById('ledgerLB');
  const ledgerUB = document.getElementById('ledgerUB');
  const ledgerGap = document.getElementById('ledgerGap');
  const ledgerQueue = document.getElementById('ledgerQueue');

  /**
   * Initialize Presentation Shell
   */
  function init() {
    totalSlidesNum.textContent = TOTAL_SLIDES;
    createDots();
    attachEventListeners();
    loadSlide(currentSlideIndex);
  }

  /**
   * Create Dot Indicators
   */
  function createDots() {
    dotContainer.innerHTML = '';
    for (let i = 0; i < TOTAL_SLIDES; i++) {
      const dot = document.createElement('button');
      dot.className = 'dot-btn';
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      if (i === 0) dot.classList.add('active');
      
      dot.addEventListener('click', () => {
        if (currentSlideIndex !== i) {
          currentSlideIndex = i;
          loadSlide(currentSlideIndex);
        }
      });
      dotContainer.appendChild(dot);
    }
  }

  /**
   * Fetch and Inject Slide Content
   * @param {number} index - 0-based slide index
   */
  async function loadSlide(index) {
    const slideNumber = index + 1;
    const slidePath = `slides/slide${slideNumber}.html`;

    try {
      slideStage.style.opacity = '0.5';
      const response = await fetch(slidePath);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status} loading ${slidePath}`);
      }

      const htmlContent = await response.text();
      slideStage.innerHTML = htmlContent;
      slideStage.style.opacity = '1';

      // Update Header & Footer Navigation States
      updateNavigationUI(index);

      // Synchronize Global Ledger State from Slide Data Attributes
      syncLedgerFromSlide();

    } catch (error) {
      console.error('Slide loading failure:', error);
      slideStage.innerHTML = `
        <div class="callout-box alert" style="margin: 40px auto; max-width: 600px;">
          <h3>⚠️ Slide File Missing or Local Fetch Blocked</h3>
          <p>Could not load <strong>${slidePath}</strong>.</p>
          <p style="margin-top: 8px; font-size: 0.9rem;">
            If viewing locally via <code>file://</code>, modern browsers restrict <code>fetch()</code> requests. 
            Host this on <strong>GitHub Pages</strong> or run a simple local web server (e.g. <code>python -m http.server</code>).
          </p>
        </div>
      `;
      slideStage.style.opacity = '1';
    }
  }

  /**
   * Reads data-attributes from the injected slide root element
   * to automatically keep the 3-Point Ledger in sync.
   */
  function syncLedgerFromSlide() {
    const slideRoot = slideStage.firstElementChild;
    if (!slideRoot) return;

    const lb = slideRoot.getAttribute('data-lb');
    const ub = slideRoot.getAttribute('data-ub');
    const gap = slideRoot.getAttribute('data-gap');
    const queue = slideRoot.getAttribute('data-queue');

    if (lb !== null) ledgerLB.innerHTML = lb;
    if (ub !== null) ledgerUB.innerHTML = ub;
    if (gap !== null) ledgerGap.innerHTML = gap;
    if (queue !== null) ledgerQueue.innerHTML = queue;
  }

  /**
   * Update Header Counters, Progress Bar, Buttons, and Active Dots
   * @param {number} index 
   */
  function updateNavigationUI(index) {
    // Slide Numbers
    currentSlideNum.textContent = index + 1;

    // Progress Bar Fill
    const progressPercent = ((index + 1) / TOTAL_SLIDES) * 100;
    progressBar.style.width = `${progressPercent}%`;

    // Button States
    prevBtn.disabled = index === 0;
    if (index === TOTAL_SLIDES - 1) {
      nextBtn.innerHTML = 'Restart Presentation &#8634;';
    } else {
      nextBtn.innerHTML = 'Next Step <span class="arrow">&rarr;</span>';
    }

    // Dot Highlights
    const dots = dotContainer.querySelectorAll('.dot-btn');
    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === index);
    });
  }

  /**
   * Navigation Handlers
   */
  function nextSlide() {
    if (currentSlideIndex < TOTAL_SLIDES - 1) {
      currentSlideIndex++;
    } else {
      currentSlideIndex = 0; // Loop back to start
    }
    loadSlide(currentSlideIndex);
  }

  function prevSlide() {
    if (currentSlideIndex > 0) {
      currentSlideIndex--;
      loadSlide(currentSlideIndex);
    }
  }

  /**
   * Attach Keyboard Listeners & Button Click Handlers
   */
  function attachEventListeners() {
    nextBtn.addEventListener('click', nextSlide);
    prevBtn.addEventListener('click', prevSlide);

    document.addEventListener('keydown', (e) => {
      // Ignore if user is inside an input/textarea if added later
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevSlide();
      }
    });
  }

  // Start Orchestrator on DOM Load
  document.addEventListener('DOMContentLoaded', init);
})();
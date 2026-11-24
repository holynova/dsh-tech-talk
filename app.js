(() => {
  const slides = Array.from(document.querySelectorAll('.slide'));
  const total = slides.length;
  let current = 0;

  const progressFill = document.getElementById('progressFill');
  const slideCounter = document.getElementById('slideCounter');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const slideDots = document.getElementById('slideDots');
  const notesBtn = document.getElementById('notesBtn');
  const notesDrawer = document.getElementById('notesDrawer');
  const notesTime = document.getElementById('notesTime');
  const notesText = document.getElementById('notesText');
  const overviewBtn = document.getElementById('overviewBtn');
  const overviewOverlay = document.getElementById('overviewOverlay');
  const overviewGrid = document.getElementById('overviewGrid');
  const closeOverview = document.getElementById('closeOverview');
  const qaBtn = document.getElementById('qaBtn');
  const qaOverlay = document.getElementById('qaOverlay');
  const closeQa = document.getElementById('closeQa');
  const openQaFromLast = document.getElementById('openQaFromLast');
  const restartBtn = document.getElementById('restartBtn');
  const themeBtn = document.getElementById('themeBtn');
  const fullscreenBtn = document.getElementById('fullscreenBtn');
  const timerBtn = document.getElementById('timerBtn');
  const timerDisplay = document.getElementById('timerDisplay');

  const pad = (n) => String(n).padStart(2, '0');

  slides.forEach((slide, idx) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'dot-btn';
    dot.ariaLabel = `跳转到第 ${idx + 1} 页`;
    dot.title = `${pad(idx + 1)}. ${slide.dataset.title || ''}`;
    dot.addEventListener('click', () => goTo(idx));
    slideDots.appendChild(dot);

    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'overview-item';
    card.innerHTML = `
      <span class="overview-num">${pad(idx + 1)} / ${pad(total)}</span>
      <span class="overview-title">${slide.dataset.title || ''}</span>
      <span class="overview-time tabular">${slide.dataset.time || ''}</span>
    `;
    card.addEventListener('click', () => {
      goTo(idx);
      toggleOverlay(overviewOverlay, false);
    });
    overviewGrid.appendChild(card);
  });

  const dotButtons = Array.from(slideDots.children);
  const overviewItems = Array.from(overviewGrid.children);

  function goTo(index, updateHash = true) {
    const target = Math.max(0, Math.min(total - 1, index));
    current = target;

    slides.forEach((s, i) => s.classList.toggle('is-active', i === current));
    dotButtons.forEach((d, i) => d.classList.toggle('is-active', i === current));
    overviewItems.forEach((o, i) => o.classList.toggle('is-current', i === current));

    const pct = ((current + 1) / total) * 100;
    progressFill.style.width = `${pct}%`;
    slideCounter.textContent = `${pad(current + 1)} / ${pad(total)}`;
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current === total - 1;

    const activeSlide = slides[current];
    notesTime.textContent = activeSlide.dataset.time || '';
    notesText.textContent = activeSlide.dataset.note || '';

    if (updateHash) {
      history.replaceState(null, '', `#slide-${current + 1}`);
    }
  }

  function next() { if (current < total - 1) goTo(current + 1); }
  function prev() { if (current > 0) goTo(current - 1); }

  prevBtn.addEventListener('click', prev);
  nextBtn.addEventListener('click', next);
  restartBtn?.addEventListener('click', () => goTo(0));

  const hashMatch = location.hash.match(/^#slide-(\d+)$/);
  if (hashMatch) {
    goTo(parseInt(hashMatch[1], 10) - 1, false);
  } else {
    goTo(0, false);
  }
  window.addEventListener('hashchange', () => {
    const m = location.hash.match(/^#slide-(\d+)$/);
    if (m) goTo(parseInt(m[1], 10) - 1, false);
  });

  // Notes drawer
  function toggleNotes(force) {
    const open = typeof force === 'boolean' ? force : !notesDrawer.classList.contains('is-open');
    notesDrawer.classList.toggle('is-open', open);
    notesDrawer.setAttribute('aria-hidden', String(!open));
    notesBtn.classList.toggle('is-active', open);
  }
  notesBtn.addEventListener('click', () => toggleNotes());

  // Overlays
  function toggleOverlay(el, force) {
    const open = typeof force === 'boolean' ? force : !el.classList.contains('is-open');
    el.classList.toggle('is-open', open);
    el.setAttribute('aria-hidden', String(!open));
  }
  overviewBtn.addEventListener('click', () => {
    toggleOverlay(qaOverlay, false);
    toggleOverlay(overviewOverlay);
  });
  closeOverview.addEventListener('click', () => toggleOverlay(overviewOverlay, false));
  overviewOverlay.addEventListener('click', (e) => {
    if (e.target === overviewOverlay) toggleOverlay(overviewOverlay, false);
  });

  qaBtn.addEventListener('click', () => {
    toggleOverlay(overviewOverlay, false);
    toggleOverlay(qaOverlay);
  });
  openQaFromLast?.addEventListener('click', () => toggleOverlay(qaOverlay, true));
  closeQa.addEventListener('click', () => toggleOverlay(qaOverlay, false));
  qaOverlay.addEventListener('click', (e) => {
    if (e.target === qaOverlay) toggleOverlay(qaOverlay, false);
  });

  // Theme toggle
  const savedTheme = localStorage.getItem('dsh-deck-theme');
  if (savedTheme === 'dark' || savedTheme === 'light') {
    document.documentElement.dataset.theme = savedTheme;
  }
  function toggleTheme() {
    const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = nextTheme;
    localStorage.setItem('dsh-deck-theme', nextTheme);
  }
  themeBtn.addEventListener('click', toggleTheme);

  // Fullscreen
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  }
  fullscreenBtn.addEventListener('click', toggleFullscreen);

  // 20-minute presenter countdown timer
  let remainingSec = 20 * 60;
  let timerHandle = null;
  function renderTimer() {
    const neg = remainingSec < 0;
    const abs = Math.abs(remainingSec);
    timerDisplay.textContent = `${neg ? '-' : ''}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`;
    timerBtn.classList.toggle('is-overtime', neg);
  }
  timerBtn.addEventListener('click', () => {
    if (timerHandle) {
      clearInterval(timerHandle);
      timerHandle = null;
      timerBtn.classList.remove('is-running');
    } else {
      timerBtn.classList.add('is-running');
      timerHandle = setInterval(() => {
        remainingSec -= 1;
        renderTimer();
      }, 1000);
    }
  });
  timerBtn.addEventListener('dblclick', () => {
    if (timerHandle) {
      clearInterval(timerHandle);
      timerHandle = null;
    }
    remainingSec = 20 * 60;
    timerBtn.classList.remove('is-running', 'is-overtime');
    renderTimer();
  });

  // Keyboard shortcuts
  window.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const key = e.key;

    if (key === 'Escape') {
      toggleOverlay(overviewOverlay, false);
      toggleOverlay(qaOverlay, false);
      return;
    }

    const anyOverlay = overviewOverlay.classList.contains('is-open') || qaOverlay.classList.contains('is-open');
    if (key === 'g' || key === 'G') { e.preventDefault(); toggleOverlay(qaOverlay, false); toggleOverlay(overviewOverlay); return; }
    if (key === 'q' || key === 'Q') { e.preventDefault(); toggleOverlay(overviewOverlay, false); toggleOverlay(qaOverlay); return; }
    if (key === 'n' || key === 'N') { e.preventDefault(); toggleNotes(); return; }
    if (key === 't' || key === 'T') { e.preventDefault(); toggleTheme(); return; }
    if (key === 'f' || key === 'F') { e.preventDefault(); toggleFullscreen(); return; }

    if (anyOverlay) return;

    if (key === 'ArrowRight' || key === 'ArrowDown' || key === ' ' || key === 'PageDown') {
      e.preventDefault();
      next();
    } else if (key === 'ArrowLeft' || key === 'ArrowUp' || key === 'PageUp') {
      e.preventDefault();
      prev();
    } else if (key === 'Home') {
      e.preventDefault();
      goTo(0);
    } else if (key === 'End') {
      e.preventDefault();
      goTo(total - 1);
    } else if (/^[1-9]$/.test(key)) {
      goTo(parseInt(key, 10) - 1);
    } else if (key === '0') {
      goTo(9);
    }
  });

  // Touch swipe
  let touchX = 0;
  window.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
  window.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 55) dx < 0 ? next() : prev();
  }, { passive: true });

  // ==================== Interactive 1: Slide 5 Usage Modes ====================
  const modeMap = {
    web: { svg: 'modeSvgWeb', code: 'modeCodeWeb' },
    headless: { svg: 'modeSvgHeadless', code: 'modeCodeHeadless' },
    sdk: { svg: 'modeSvgSdk', code: 'modeCodeSdk' },
  };
  document.querySelectorAll('[data-mode]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const m = btn.dataset.mode;
      if (!modeMap[m]) return;
      document.querySelectorAll('[data-mode]').forEach((b) => {
        const active = b === btn;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-selected', String(active));
      });
      Object.entries(modeMap).forEach(([k, ids]) => {
        const show = k === m;
        document.getElementById(ids.svg)?.classList.toggle('is-hidden', !show);
        document.getElementById(ids.code)?.classList.toggle('is-hidden', !show);
      });
    });
  });

  // ==================== Interactive 2: Slide 8 Session Log View ====================
  const svgCompact = document.getElementById('svgCompact');
  const svgFork = document.getElementById('svgFork');
  document.querySelectorAll('[data-logview]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const v = btn.dataset.logview;
      document.querySelectorAll('[data-logview]').forEach((b) => {
        const active = b === btn;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-selected', String(active));
      });
      svgCompact.classList.toggle('is-hidden', v !== 'compact');
      svgFork.classList.toggle('is-hidden', v !== 'fork');
    });
  });
})();

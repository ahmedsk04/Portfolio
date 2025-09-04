// Morph Chat (zoom morph), space types in textarea, follows HTML 'dark' class
(function () {
  const DURATION = 800; // keep in sync with CSS

  // Ensure portal exists
  let portal = document.querySelector('.morph-portal');
  if (!portal) {
    portal = document.createElement('div');
    portal.className = 'morph-portal';
    document.body.appendChild(portal);
  }

  // Theme sync: your site uses <html class="dark"> (Tailwind darkMode:'class')
  const htmlEl = document.documentElement; // <html> carries 'dark' class in your setup
  function applyPortalTheme() {
    const isDark = htmlEl.classList.contains('dark'); // dark present => dark mode
    portal.classList.toggle('light', !isDark);        // light when 'dark' absent
  }
  // Initial + react to changes
  applyPortalTheme();
  new MutationObserver(applyPortalTheme).observe(htmlEl, { attributes: true, attributeFilter: ['class'] });

  // Backdrop
  const backdrop = document.createElement('div');
  backdrop.className = 'mc-backdrop';
  portal.appendChild(backdrop);

  // Launcher + dialog
  const shell = document.createElement('div');
  shell.id = 'morphChat';
  shell.role = 'button';
  shell.tabIndex = 0;
  shell.setAttribute('aria-label', 'Open chat');
  shell.setAttribute('aria-expanded', 'false');
  shell.innerHTML = `
    <span class="iconWrap">
      <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 4c0-1.1.9-2 2-2h12c1.1 0 2 .9 2 2v11c0 1.1-.9 2-2 2H9l-5 4V4z" fill="#fff"/>
      </svg>
      <span class="hint">Let’s Talk</span>
    </span>
    <div class="content" role="dialog" aria-modal="false" aria-label="Chat dialog">
      <div class="mc-hdr">
        <div>Chat</div>
        <div class="mc-actions"><button class="mc-close" aria-label="Close">✕</button></div>
      </div>
      <div class="mc-body" id="mc-msgs"></div>
      <form class="mc-input" id="mc-form">
        <textarea id="mc-text" placeholder="Type a message"></textarea>
        <button type="submit" class="mc-send">Send</button>
      </form>
    </div>
  `;
  portal.appendChild(shell);

  // Refs
  const content = shell.querySelector('.content');
  const closeBtn = shell.querySelector('.mc-close');
  const msgs = shell.querySelector('#mc-msgs');
  const form = shell.querySelector('#mc-form');
  const input = shell.querySelector('#mc-text');

  // Helpers
  function wipeMessages() {
    msgs.style.opacity = '0';
    setTimeout(() => { msgs.innerHTML = ''; msgs.style.opacity = ''; }, 150);
  }

  let isAnimating = false;

  function openChat() {
    if (isAnimating || shell.classList.contains('open')) return;
    isAnimating = true;
    backdrop.classList.add('show');
    shell.classList.add('zooming-in');
    requestAnimationFrame(() => {
      shell.classList.add('open');
      shell.setAttribute('aria-expanded', 'true');
      setTimeout(() => { shell.classList.remove('zooming-in'); isAnimating = false; }, DURATION);
    });
    setTimeout(() => input?.focus({ preventScroll: true }), DURATION / 2);
  }
  function closeChat() {
    if (isAnimating || !shell.classList.contains('open')) return;
    isAnimating = true;
    shell.classList.add('zooming-out');
    requestAnimationFrame(() => {
      shell.classList.remove('open');
      shell.setAttribute('aria-expanded', 'false');
      setTimeout(() => {
        shell.classList.remove('zooming-out');
        backdrop.classList.remove('show');
        isAnimating = false;
        wipeMessages();
        try { shell.focus({ preventScroll: true }); } catch(_) {}
      }, DURATION);
    });
  }

  // Click toggle (ignore clicks inside dialog)
  shell.addEventListener('click', (e) => {
    const isOpen = shell.classList.contains('open');
    if (isOpen && content.contains(e.target)) return;
    isOpen ? closeChat() : openChat();
  });

  // Keyboard (only when launcher has focus)
  shell.addEventListener('keydown', (e) => {
    const isOpen = shell.classList.contains('open');
    if (e.target !== shell) return;          // don't interfere with textarea/input
    if (e.key === 'Enter' || e.key === ' ' || e.code === 'Space') {
      e.preventDefault();                    // prevent native "button" activation
      if (!isOpen) openChat();               // open when closed
    }
  });

  // Backdrop & close button
  backdrop.addEventListener('click', closeChat);
  closeBtn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); closeChat(); });

  // Global keys: Esc closes; Enter submits while typing; Space in inputs untouched
  document.addEventListener('keydown', (e) => {
    const isOpen = shell.classList.contains('open');
    const inField = e.target === input || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT';
    if (e.key === 'Escape' && isOpen) { e.preventDefault(); closeChat(); }
    if (inField && e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); form.requestSubmit(); }
  });

  // Auto-resize textarea
  input.addEventListener('input', () => {
    input.style.height = 'auto';
    input.style.height = Math.min(120, input.scrollHeight) + 'px';
  });

  // Demo send (replace with your FastAPI / WebSocket)
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = (input.value || '').trim();
    if (!text) return;
    addMsg('me', text);
    input.value = '';
    input.dispatchEvent(new Event('input'));
    setTimeout(() => addMsg('bot', 'Thanks! 👌'), 300);
  });

  function addMsg(kind, text) {
    const el = document.createElement('div');
    el.className = 'mc-msg ' + (kind === 'me' ? 'me' : 'bot');
    el.textContent = text;
    msgs.appendChild(el);
    msgs.scrollTop = msgs.scrollHeight;
  }

  // Public API (optional)
  window.morphChat = {
    open: openChat,
    close: closeChat,
    setTheme: (mode) => {
      // force override if needed
      if (mode === 'light') { portal.classList.add('light'); return; }
      if (mode === 'dark')  { portal.classList.remove('light'); return; }
      applyPortalTheme(); // auto from <html>.dark
    }
  };
})();

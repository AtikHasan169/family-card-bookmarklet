/* Family Card Pro — bookmarklet edition */
(function () {
  'use strict';

  if (!/(^|\.)bhata\.gov\.bd$/i.test(location.hostname)) {
    alert('Family Card Pro works on bhata.gov.bd pages.');
    return;
  }

  const fallbackUrl = 'https://atikhasan169.github.io/family-card-bookmarklet/bookmarklet.js';
  const currentScript = document.currentScript;
  const scriptSrc = (currentScript && currentScript.src) ? currentScript.src : fallbackUrl;

  const cleanScriptSrc = scriptSrc.split('?')[0];
  const baseUrl = new URL('.', cleanScriptSrc).href;

  const panelUrl = new URL('sidepanel.html?t=' + Date.now(), baseUrl).href;
  const panelOrigin = new URL(panelUrl).origin;
  const injectUrl = new URL('inject.js?t=' + Date.now(), baseUrl).href;

  const existingRoot = document.getElementById('fc-floating-root');
  if (existingRoot) existingRoot.remove();
  document.querySelectorAll('script[src*="sidepanel"], script[data-fc-inject], style[data-fc]').forEach(el => el.remove());

  // Load inject.js once
  if (!window.__FC_INJECTOR_LOADED__) {
    const injectScript = document.createElement('script');
    injectScript.src = injectUrl;
    injectScript.setAttribute('data-fc-inject', 'true');
    (document.head || document.documentElement).appendChild(injectScript);
  }

  const isMobileDevice = window.screen.width <= 768;
  const viewClass = isMobileDevice ? 'fc-mobile-view' : 'fc-desktop-view';

  const style = document.createElement('style');
  style.setAttribute('data-fc', 'true');
  style.textContent = `
    #fc-floating-root {
      position: fixed; inset: 0; z-index: 2147483000; pointer-events: none; font-family: Inter, system-ui, sans-serif;
    }
    @keyframes fc-rise-in {
      from { opacity: 0; transform: translateY(14px) scale(0.94); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes fc-ping {
      0% { opacity: 0.7; transform: scale(1); }
      80%, 100% { opacity: 0; transform: scale(1.35); }
    }
    #fc-trigger-btn {
      position: fixed; bottom: 20px; right: 20px;
      bottom: calc(20px + env(safe-area-inset-bottom, 0px));
      right: calc(20px + env(safe-area-inset-right, 0px));
      pointer-events: auto;
      display: flex; align-items: center; gap: 8px; padding: 10px 16px;
      background: linear-gradient(135deg, #2563eb, #4f46e5); color: #ffffff;
      border: 1px solid rgba(255,255,255,0.28);
      border-radius: 999px; font-family: inherit; font-size: 13px; font-weight: 650; letter-spacing: 0.01em; cursor: pointer;
      box-shadow: 0 12px 28px -6px rgba(37,99,235,0.55), 0 4px 10px rgba(15,23,42,0.25);
      transition: transform 0.18s ease, box-shadow 0.18s ease, filter 0.18s ease;
      animation: fc-rise-in 0.45s cubic-bezier(0.16, 1, 0.3, 1) 0.1s backwards;
    }
    #fc-trigger-btn::after {
      content: ""; position: absolute; inset: -3px; border-radius: 999px; opacity: 0;
      border: 2px solid rgba(99,102,241,0.55); pointer-events: none;
      animation: fc-ping 1.5s ease-out 0.7s 2;
    }
    #fc-trigger-btn:hover { transform: translateY(-2px) scale(1.04); box-shadow: 0 16px 32px -6px rgba(37,99,235,0.6), 0 6px 14px rgba(15,23,42,0.28); filter: brightness(1.06); }
    #fc-trigger-btn:active { transform: scale(0.94); }
    #fc-trigger-btn.active { transform: scale(0.92); box-shadow: 0 8px 20px -6px rgba(37,99,235,0.45); }
    #fc-trigger-btn:focus-visible { outline: 2px solid #93c5fd; outline-offset: 3px; }
    #fc-trigger-btn svg { flex: none; }
    #fc-trigger-btn .fc-dot {
      position: absolute; top: -1px; right: -1px; z-index: 1; width: 11px; height: 11px;
      border-radius: 50%; background: #22c55e; border: 2px solid #ffffff;
      box-shadow: 0 0 0 2px rgba(34,197,94,0.25);
    }
    @media (max-width: 768px) {
      #fc-trigger-btn { padding: 12px 18px; font-size: 14px; }
    }
    @media (prefers-reduced-motion: reduce) {
      #fc-trigger-btn, #fc-trigger-btn::after { animation: none; }
      #fc-drawer-iframe { transition: none; }
    }

    #fc-drawer-iframe {
      position: fixed; background: #ffffff; border: none;
      pointer-events: auto; will-change: transform;
      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), width 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .fc-mobile-view #fc-drawer-iframe {
      bottom: 0; bottom: env(safe-area-inset-bottom, 0px); left: 0; right: 0; width: 100%; height: 90vh; max-height: 850px;
      border-top-left-radius: 20px; border-top-right-radius: 20px;
      box-shadow: 0 -12px 40px rgba(15,23,42,0.3);
      transform: translateY(105%);
    }
    .fc-mobile-view #fc-drawer-iframe.open { transform: translateY(0); }

    .fc-desktop-view #fc-drawer-iframe {
      top: 0; bottom: 0; right: 0; left: auto;
      width: 420px; height: 100%; max-height: none;
      border-top-left-radius: 16px; border-bottom-left-radius: 16px; border-left: 1px solid #e2e8f0;
      box-shadow: -16px 0 48px rgba(15,23,42,0.22);
      transform: translateX(105%);
    }
    .fc-desktop-view #fc-drawer-iframe.open { transform: translateX(0); }

    /* Wide panel while the in-panel camera is open (tablet/desktop only):
       the phone sheet is already full-width, so this changes nothing there. */
    .fc-desktop-view #fc-drawer-iframe.fc-wide {
      width: min(720px, 94vw);
    }
  `;
  document.head.appendChild(style);

  const root = document.createElement('div');
  root.id = 'fc-floating-root';
  root.className = viewClass;

  const trigger = document.createElement('button');
  trigger.id = 'fc-trigger-btn';
  trigger.type = 'button';
  trigger.setAttribute('aria-label', 'Open Family Card AI panel');
  trigger.setAttribute('aria-expanded', 'false');
  trigger.innerHTML = '<svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true"><path d="M12 2.5l2 5.8 5.8 2-5.8 2-2 5.8-2-5.8-5.8-2 5.8-2z"/><path d="M18.5 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z" opacity="0.65"/></svg><span>Family Card AI</span><span class="fc-dot" aria-hidden="true"></span>';

  const iframe = document.createElement('iframe');
  iframe.id = 'fc-drawer-iframe';
  iframe.title = 'Family Card Pro';
  iframe.src = panelUrl;
  iframe.setAttribute('allow', 'camera; clipboard-read; clipboard-write');

  root.append(trigger, iframe);
  (document.body || document.documentElement).appendChild(root);

  const STORAGE_KEY = 'fc_pro_api_key';
  const STORAGE_MODEL = 'fc_pro_model';
  const STORAGE_AREA_PRESETS = 'fc_pro_area_presets';
  const SESSION_DRAFT_KEY = 'fc_pro_active_session';
  let isOpen = false;

  function sendToPanel(message) {
    if (iframe.contentWindow) iframe.contentWindow.postMessage(message, '*');
  }

  function pushSavedCredentials() {
    try {
      let savedPresets = null;
      const rawPresets = localStorage.getItem(STORAGE_AREA_PRESETS);
      if (rawPresets) {
        try { savedPresets = JSON.parse(rawPresets); } catch (_) {}
      }
      sendToPanel({
        action: 'FC_API_KEY_DATA',
        apiKey: localStorage.getItem(STORAGE_KEY) || '',
        model: localStorage.getItem(STORAGE_MODEL) || 'gemini-2.5-flash',
        areaPresets: savedPresets
      });
      const savedSession = sessionStorage.getItem(SESSION_DRAFT_KEY);
      if (savedSession) {
        sendToPanel({
          action: 'FC_RESTORE_SESSION',
          sessionData: JSON.parse(savedSession)
        });
      }
    } catch (e) {}
  }

  function closeSheet() {
    isOpen = false;
    iframe.classList.remove('open');
    trigger.classList.remove('active');
    trigger.setAttribute('aria-expanded', 'false');
  }

  function toggleSheet() {
    isOpen = !isOpen;
    if (isOpen) {
      iframe.classList.add('open');
      trigger.classList.add('active');
      trigger.setAttribute('aria-expanded', 'true');
      sendToPanel({ action: 'FC_STATUS_REPLY', online: true });
      pushSavedCredentials();
    } else {
      closeSheet();
    }
  }

  iframe.addEventListener('load', () => {
    sendToPanel({ action: 'FC_STATUS_REPLY', online: true });
    pushSavedCredentials();
  });

  root.__fcToggle = toggleSheet;
  trigger.addEventListener('click', toggleSheet);
  setTimeout(() => { if (!isOpen) toggleSheet(); }, 100);

  window.addEventListener('message', (event) => {
    if (event.source !== iframe.contentWindow || !event.data) return;
    if (panelOrigin && panelOrigin !== 'null' && event.origin !== panelOrigin) return;

    const data = event.data;
    if (data.action === 'FC_CLOSE_SHEET') closeSheet();
    if (data.action === 'FC_PRO_PANEL_WIDE') iframe.classList.toggle('fc-wide', !!data.wide);
    if (data.action === 'FC_CHECK_STATUS' || data.action === 'FC_GET_API_KEY') {
      sendToPanel({ action: 'FC_STATUS_REPLY', online: true });
      pushSavedCredentials();
    }
    if (data.action === 'FC_SAVE_API_KEY') {
      try {
        if (data.apiKey !== undefined) localStorage.setItem(STORAGE_KEY, data.apiKey);
        if (data.model !== undefined) localStorage.setItem(STORAGE_MODEL, data.model);
        if (data.areaPresets !== undefined) localStorage.setItem(STORAGE_AREA_PRESETS, JSON.stringify(data.areaPresets));
      } catch (e) {}
    }
    if (data.action === 'FC_SAVE_SESSION') {
      try {
        if (data.sessionData) sessionStorage.setItem(SESSION_DRAFT_KEY, JSON.stringify(data.sessionData));
        else sessionStorage.removeItem(SESSION_DRAFT_KEY);
      } catch (e) {}
    }
    if (data.action === 'FILL_VUE_FORM') {
      window.dispatchEvent(new CustomEvent('FC_PRO_AUTOFILL', { detail: data.payload }));
    }
    if (data.action === 'FC_PULL_DRAFT') {
      window.dispatchEvent(new CustomEvent('FC_PRO_PULL_REQUEST'));
    }
    if (data.action === 'FC_DOWNLOAD_JSON') {
      try {
        const blob = new Blob([data.jsonString], { type: 'application/json;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = data.filename || 'family-card-backup.json';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 1000);
      } catch (e) {}
    }
    if (data.action === 'FC_COPY_TEXT') {
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(data.text);
        } else throw new Error('fallback');
      } catch (e) {
        const ta = document.createElement('textarea');
        ta.value = data.text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
      }
    }
  });

  window.addEventListener('FC_PRO_AUTOFILL_RESULT', (event) => {
    sendToPanel({ action: 'FC_AUTOFILL_RESPONSE', detail: event.detail });
  });

  window.addEventListener('FC_PRO_PULL_RESULT', (event) => {
    sendToPanel({ action: 'FC_PULL_RESPONSE', detail: event.detail });
  });
})();

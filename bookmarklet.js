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
    #fc-trigger-btn {
      position: fixed; bottom: 20px; right: 20px; pointer-events: auto;
      display: flex; align-items: center; gap: 8px; padding: 10px 16px;
      background: #0f172a; color: #ffffff; border: 1px solid #334155;
      border-radius: 999px; font-size: 13px; font-weight: 650; cursor: pointer;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3); transition: transform 0.15s ease;
    }
    #fc-trigger-btn:hover { transform: scale(1.05); }
    #fc-trigger-btn.active { transform: scale(0.9); }

    #fc-drawer-iframe {
      position: fixed; background: #ffffff; border: none;
      pointer-events: auto;
      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .fc-mobile-view #fc-drawer-iframe {
      bottom: 0; left: 0; right: 0; width: 100%; height: 90vh; max-height: 850px;
      border-top-left-radius: 20px; border-top-right-radius: 20px;
      box-shadow: -10px 0 40px rgba(0,0,0,0.3);
      transform: translateY(105%);
    }
    .fc-mobile-view #fc-drawer-iframe.open { transform: translateY(0); }

    .fc-desktop-view #fc-drawer-iframe {
      top: 0; bottom: 0; right: 0; left: auto;
      width: 420px; height: 100%; max-height: none;
      border-radius: 0; border-left: 1px solid #cbd5e1;
      box-shadow: -10px 0 40px rgba(0,0,0,0.15);
      transform: translateX(105%);
    }
    .fc-desktop-view #fc-drawer-iframe.open { transform: translateX(0); }
  `;
  document.head.appendChild(style);

  const root = document.createElement('div');
  root.id = 'fc-floating-root';
  root.className = viewClass;

  const trigger = document.createElement('button');
  trigger.id = 'fc-trigger-btn';
  trigger.type = 'button';
  trigger.innerHTML = '<span style="width:10px;height:10px;border-radius:50%;background:#22c55e;box-shadow:0 0 8px #22c55e;"></span><span>Family Card AI</span>';

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
  }

  function toggleSheet() {
    isOpen = !isOpen;
    if (isOpen) {
      iframe.classList.add('open');
      trigger.classList.add('active');
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

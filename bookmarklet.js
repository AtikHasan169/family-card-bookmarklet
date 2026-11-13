/* Family Card Pro — bookmarklet edition
 * Host this folder on HTTPS (GitHub Pages, Cloudflare Pages, Netlify, etc.).
 * The script URL determines where sidepanel.html is loaded from.
 */
(function () {
  'use strict';

  if (!/(^|\.)bhata\.gov\.bd$/i.test(location.hostname)) {
    alert('Family Card Pro works on bhata.gov.bd pages.');
    return;
  }

  const currentScript = document.currentScript;
  if (!currentScript || !currentScript.src) {
    alert('Could not determine the hosted Family Card Pro URL.');
    return;
  }
  const baseUrl = new URL('.', currentScript.src).href;
  const panelUrl = new URL('sidepanel.html', baseUrl).href;
  const panelOrigin = new URL(panelUrl).origin;

  const existingRoot = document.getElementById('fc-floating-root');
  if (existingRoot && typeof existingRoot.__fcToggle === 'function') {
    existingRoot.__fcToggle();
    return;
  }

  /* Bundled Vue form injector (adapted from inject.js). */
(function () {
  const RELATION_ID_MAP = {
    'Father': 157, 'Mother': 158, 'Husband': 159, 'Son': 160, 'Daughter': 161,
    'Brother': 162, 'Sister': 163, 'Father-in-law': 164, 'Mother-in-law': 165,
    'Son-in-law': 181, 'Daughter-in-law': 182, 'Grandson': 183, 'Granddaughter': 184,
    'Wife': 186, 'Other Relative': 263
  };

  function getVueNodes() {
    let vmHead = null, vmMembers = null;
    document.querySelectorAll('*').forEach(node => {
      const v = node.__vue__;
      if (v) {
        if (v.data && typeof v.data === 'object' && ('name_bn' in v.data || 'name_en' in v.data || 'verification_number' in v.data)) vmHead = v;
        if (Array.isArray(v.familyMembers)) vmMembers = v;
      }
    });
    return { vmHead, vmMembers };
  }

  window.addEventListener('FC_PRO_AUTOFILL', async (event) => {
    const payload = event.detail;
    if (!payload) return;

    const { vmHead, vmMembers } = getVueNodes();
    if (!vmHead && !vmMembers) {
      window.dispatchEvent(new CustomEvent('FC_PRO_AUTOFILL_RESULT', {
        detail: { success: false, message: 'Vue application form not detected on this page.' }
      }));
      return;
    }

    try {
      const setReactive = (vmTarget, targetObj, key, val) => {
        if (!targetObj || val === undefined || val === null || val === '') return;
        if (vmTarget && typeof vmTarget.$set === 'function') vmTarget.$set(targetObj, key, val);
        else targetObj[key] = val;
      };

      if (vmHead && 'panel' in vmHead) vmHead.panel = [0, 1, 2, 3, 4, 5, 6, 7];
      if (vmMembers && 'panel' in vmMembers) vmMembers.panel = [0, 1, 2, 3, 4, 5, 6, 7];

      // 1. Populate Primary Applicant (Head) in main form
      if (payload.head && vmHead && vmHead.data) {
        const h = payload.head;
        setReactive(vmHead, vmHead.data, 'verification_type', 1);
        setReactive(vmHead, vmHead.data, 'verification_number', h.nid);
        setReactive(vmHead, vmHead.data, 'date_of_birth', h.dob);
        setReactive(vmHead, vmHead.data, 'name_bn', h.name_bn);
        setReactive(vmHead, vmHead.data, 'name_en', h.name_en);
        setReactive(vmHead, vmHead.data, 'father_name_bn', h.father_name_bn);
        setReactive(vmHead, vmHead.data, 'father_name_en', h.father_name_en);
        setReactive(vmHead, vmHead.data, 'mother_name_bn', h.mother_name_bn);
        setReactive(vmHead, vmHead.data, 'mother_name_en', h.mother_name_en);
      }

      // 2. Combine Head as Member 1, then the rest of the family
      const fullFamilyList = [];
      if (payload.head) {
        fullFamilyList.push({
          ...payload.head,
          relation: 'Head/Self',
          nid_or_brn: payload.head.nid,
          relationship_id: 185 // ID for Self/Head
        });
      }
      if (Array.isArray(payload.family_members)) {
        fullFamilyList.push(...payload.family_members);
      }

      // 3. Inject into the Member Array (সদস্য page)
      if (fullFamilyList.length > 0 && vmMembers && Array.isArray(vmMembers.familyMembers)) {
        while (vmMembers.familyMembers.length < fullFamilyList.length) {
          if (typeof vmMembers.addFamilyMember === 'function') vmMembers.addFamilyMember();
          else vmMembers.familyMembers.push({});
        }

        await new Promise((r) => setTimeout(r, 150));

        fullFamilyList.forEach((m, idx) => {
          const row = vmMembers.familyMembers[idx];
          if (!row) return;

          const cleanId = String(m.nid_or_brn || '').replace(/\s+/g, '');
          const isNID = cleanId.length === 10 || cleanId.length === 13 || cleanId.length === 17;

          setReactive(vmMembers, row, 'verification_type', isNID ? 1 : 2);
          if (isNID) {
            setReactive(vmMembers, row, 'nid', cleanId);
            setReactive(vmMembers, row, 'verification_number', cleanId);
          } else {
            setReactive(vmMembers, row, 'brn_id', cleanId);
            setReactive(vmMembers, row, 'verification_number', cleanId);
          }

          setReactive(vmMembers, row, 'dob', m.dob);
          setReactive(vmMembers, row, 'date_of_birth', m.dob);
          setReactive(vmMembers, row, 'name_bn', m.name_bn);
          setReactive(vmMembers, row, 'name_en', m.name_en);
          setReactive(vmMembers, row, 'father_name_bn', m.father_name_bn);
          setReactive(vmMembers, row, 'mother_name_bn', m.mother_name_bn);

          const relId = m.relationship_id || RELATION_ID_MAP[m.relation] || null;
          if (relId) setReactive(vmMembers, row, 'relationship_id', relId);
          setReactive(vmMembers, row, 'is_member_disabled', Number(m.is_disabled) === 1 ? 1 : 0);
          setReactive(vmMembers, row, 'is_gov_job_holder', 0);

          if (m.relation === 'Husband' && !row.estimate_annual_income) {
            setReactive(vmMembers, row, 'estimate_annual_income', 60000);
          }
        });

        // Update total household size
        if (vmHead && vmHead.data) {
          setReactive(vmHead, vmHead.data, 'house_size', fullFamilyList.length);
        }
      }

      if (vmHead && typeof vmHead.$forceUpdate === 'function') vmHead.$forceUpdate();
      if (vmMembers && typeof vmMembers.$forceUpdate === 'function') vmMembers.$forceUpdate();

      window.dispatchEvent(new CustomEvent('FC_PRO_AUTOFILL_RESULT', {
        detail: { success: true, message: `Auto-filled Head + ${fullFamilyList.length - 1} family member(s) into form.` }
      }));
    } catch (err) {
      window.dispatchEvent(new CustomEvent('FC_PRO_AUTOFILL_RESULT', {
        detail: { success: false, message: `Autofill error: ${err.message}` }
      }));
    }
  });

  window.addEventListener('FC_PRO_PULL_REQUEST', () => {
    const { vmHead, vmMembers } = getVueNodes();
    if (!vmHead && !vmMembers) {
      window.dispatchEvent(new CustomEvent('FC_PRO_PULL_RESULT', { detail: { success: false, message: 'No active form instance found.' } }));
      return;
    }

    try {
      let head = null;
      if (vmHead && vmHead.data) {
        head = {
          nid: vmHead.data.verification_number || vmHead.data.nid || '',
          dob: vmHead.data.date_of_birth || vmHead.data.dob || '',
          name_bn: vmHead.data.name_bn || '',
          name_en: vmHead.data.name_en || '',
          father_name_bn: vmHead.data.father_name_bn || '',
          father_name_en: vmHead.data.father_name_en || '',
          mother_name_bn: vmHead.data.mother_name_bn || '',
          mother_name_en: vmHead.data.mother_name_en || ''
        };
      }

      let family_members = [];
      if (vmMembers && Array.isArray(vmMembers.familyMembers)) {
        family_members = vmMembers.familyMembers.map((m) => ({
          relation: m.relation || 'Son',
          relationship_id: m.relationship_id || 160,
          nid_or_brn: m.verification_number || m.nid || m.brn_id || '',
          dob: m.date_of_birth || m.dob || '',
          name_bn: m.name_bn || '',
          name_en: m.name_en || '',
          father_name_bn: m.father_name_bn || '',
          mother_name_bn: m.mother_name_bn || '',
          is_disabled: m.is_member_disabled || 0
        }));
      }

      window.dispatchEvent(new CustomEvent('FC_PRO_PULL_RESULT', {
        detail: { success: true, payload: { head, family_members } }
      }));
    } catch (err) {
      window.dispatchEvent(new CustomEvent('FC_PRO_PULL_RESULT', { detail: { success: false, message: err.message } }));
    }
  });


  // --- LIVE REVERSE SYNC: Web Page -> Extension ---
  function extractCurrentFormState() {
    const { vmHead, vmMembers } = getVueNodes();
    let headData = null;
    if (vmHead && vmHead.data) {
       headData = {
         nid: vmHead.data.verification_number, dob: vmHead.data.date_of_birth,
         name_bn: vmHead.data.name_bn, name_en: vmHead.data.name_en,
         father_name_bn: vmHead.data.father_name_bn, father_name_en: vmHead.data.father_name_en,
         mother_name_bn: vmHead.data.mother_name_bn, mother_name_en: vmHead.data.mother_name_en
       };
    }
    let membersData = [];
    if (vmMembers && Array.isArray(vmMembers.familyMembers)) {
       membersData = vmMembers.familyMembers.map(m => ({
         relationship_id: m.relationship_id, nid_or_brn: m.verification_number, dob: m.date_of_birth,
         name_bn: m.name_bn, name_en: m.name_en, father_name_bn: m.father_name_bn, mother_name_bn: m.mother_name_bn
       }));
    }
    window.dispatchEvent(new CustomEvent('FC_PRO_FORM_CHANGED', { detail: { head: headData, members: membersData } }));
  }

  // Detect when you type on the main web page (with a 600ms delay so it doesn't spam)
  let syncTimeout;
  document.body.addEventListener('input', () => { clearTimeout(syncTimeout); syncTimeout = setTimeout(extractCurrentFormState, 600); });
  document.body.addEventListener('change', () => { clearTimeout(syncTimeout); syncTimeout = setTimeout(extractCurrentFormState, 600); });

})();

  // Evaluate physical device screen width to bypass legacy site zooming
  const isMobileDevice = window.screen.width <= 768;
  const viewClass = isMobileDevice ? 'fc-mobile-view' : 'fc-desktop-view';

  // Inject Device-Specific CSS
  const style = document.createElement('style');
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

    /* Mobile View: Bottom Sheet */
    .fc-mobile-view #fc-drawer-iframe {
      bottom: 0; left: 0; right: 0; width: 100%; height: 90vh; max-height: 850px;
      border-top-left-radius: 20px; border-top-right-radius: 20px;
      box-shadow: 0 -10px 40px rgba(0,0,0,0.3);
      transform: translateY(105%);
    }
    .fc-mobile-view #fc-drawer-iframe.open { transform: translateY(0); }

    /* Tablet & Desktop View: True Right Sidebar */
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

  /* Floating launcher and cross-frame message bridge. */
  const root = document.createElement('div');
  root.id = 'fc-floating-root';
  root.className = viewClass; // Force the correct physical view class

  const trigger = document.createElement('button');
  trigger.id = 'fc-trigger-btn';
  trigger.type = 'button';
  trigger.innerHTML = '<span style="width:10px;height:10px;border-radius:50%;background:#22c55e;box-shadow:0 0 8px #22c55e;"></span><span>Family Card AI</span>';

  const iframe = document.createElement('iframe');
  iframe.id = 'fc-drawer-iframe';
  iframe.title = 'Family Card Pro';
  iframe.src = panelUrl;
  iframe.setAttribute('allow', 'camera');

  root.append(trigger, iframe);
  (document.body || document.documentElement).appendChild(root);

  let isOpen = false;
  function sendToPanel(message) {
    if (iframe.contentWindow) iframe.contentWindow.postMessage(message, panelOrigin);
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
    } else {
      closeSheet();
    }
  }
  root.__fcToggle = toggleSheet;
  trigger.addEventListener('click', toggleSheet);

  window.addEventListener('message', (event) => {
    if (event.source !== iframe.contentWindow || event.origin !== panelOrigin || !event.data) return;
    const data = event.data;
    if (data.action === 'FC_CLOSE_SHEET') closeSheet();
    if (data.action === 'FC_CHECK_STATUS') sendToPanel({ action: 'FC_STATUS_REPLY', online: true });
    if (data.action === 'FILL_VUE_FORM') {
      window.dispatchEvent(new CustomEvent('FC_PRO_AUTOFILL', { detail: data.payload }));
    }
    if (data.action === 'FC_PULL_DRAFT') {
      window.dispatchEvent(new CustomEvent('FC_PRO_PULL_REQUEST'));
    }
  });

  window.addEventListener('FC_PRO_AUTOFILL_RESULT', (event) => {
    sendToPanel({ action: 'FC_AUTOFILL_RESPONSE', detail: event.detail });
  });

  window.addEventListener('FC_PRO_PULL_RESULT', (event) => {
    sendToPanel({ action: 'FC_PULL_RESPONSE', detail: event.detail });
  });

  window.addEventListener('FC_PRO_FORM_CHANGED', (event) => {
    sendToPanel({ action: 'FC_SYNC_FROM_WEB', payload: event.detail });
  });
})();

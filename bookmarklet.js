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
    'Father': 157,
    'Mother': 158,
    'Husband': 159,
    'Son': 160,
    'Daughter': 161,
    'Brother': 162,
    'Sister': 163,
    'Father-in-law': 164,
    'Mother-in-law': 165,
    'Son-in-law': 181,
    'Daughter-in-law': 182,
    'Grandson': 183,
    'Granddaughter': 184,
    'Wife': 186,
    'Other Relative': 263
  };

  function findFormVueInstance() {
    const appRoot = document.getElementById('application');
    if (appRoot && appRoot.__vue__ && (appRoot.__vue__.data || appRoot.__vue__.familyMembers)) {
      return appRoot.__vue__;
    }

    const allNodes = document.querySelectorAll('*');
    for (const node of allNodes) {
      const v = node.__vue__;
      if (v && v.data && Array.isArray(v.familyMembers)) {
        return v;
      }
    }
    for (const node of allNodes) {
      const v = node.__vue__;
      if (v && (v.data || v.familyMembers)) {
        return v;
      }
    }
    return null;
  }

  window.addEventListener('FC_PRO_AUTOFILL', async (event) => {
    const payload = event.detail;
    if (!payload) return;

    const vm = findFormVueInstance();
    if (!vm) {
      window.dispatchEvent(
        new CustomEvent('FC_PRO_AUTOFILL_RESULT', {
          detail: {
            success: false,
            message: 'Vue application form not detected on this page.'
          }
        })
      );
      return;
    }

    try {
      // 1. Expand all Vuetify accordion panels
      if ('panel' in vm) {
        vm.panel = [0, 1, 2, 3, 4, 5, 6, 7];
      }

      const setReactive = (targetObj, key, val) => {
        if (!targetObj || val === undefined || val === null || val === '') return;
        if (typeof vm.$set === 'function') {
          vm.$set(targetObj, key, val);
        } else {
          targetObj[key] = val;
        }
      };

      // 2. Populate Primary Applicant (Wife / Head)
      if (payload.head && vm.data) {
        const h = payload.head;
        setReactive(vm.data, 'verification_type', 1); // 1 = NID
        setReactive(vm.data, 'verification_number', h.nid);
        setReactive(vm.data, 'date_of_birth', h.dob);
        setReactive(vm.data, 'name_bn', h.name_bn);
        setReactive(vm.data, 'name_en', h.name_en);
        setReactive(vm.data, 'father_name_bn', h.father_name_bn);
        setReactive(vm.data, 'father_name_en', h.father_name_en);
        setReactive(vm.data, 'mother_name_bn', h.mother_name_bn);
        setReactive(vm.data, 'mother_name_en', h.mother_name_en);
      }

      // 3. Populate Family Members (Husband + Children)
      const members = Array.isArray(payload.family_members) ? payload.family_members : [];
      if (members.length > 0 && Array.isArray(vm.familyMembers)) {
        while (vm.familyMembers.length < members.length) {
          if (typeof vm.addFamilyMember === 'function') {
            vm.addFamilyMember();
          } else {
            break;
          }
        }

        // Wait a tick for Vue DOM update
        await new Promise((r) => setTimeout(r, 150));

        members.forEach((m, idx) => {
          const row = vm.familyMembers[idx];
          if (!row) return;

          const cleanId = String(m.nid_or_brn || '').replace(/\s+/g, '');
          const isNID = cleanId.length === 10 || cleanId.length === 13 || cleanId.length === 17;

          setReactive(row, 'verification_type', isNID ? 1 : 2); // 1 = NID, 2 = BRN
          if (isNID) {
            setReactive(row, 'nid', cleanId);
            setReactive(row, 'verification_number', cleanId);
          } else {
            setReactive(row, 'brn_id', cleanId);
            setReactive(row, 'verification_number', cleanId);
          }

          setReactive(row, 'dob', m.dob);
          setReactive(row, 'date_of_birth', m.dob);
          setReactive(row, 'name_bn', m.name_bn);
          setReactive(row, 'name_en', m.name_en);
          setReactive(row, 'father_name_bn', m.father_name_bn);
          setReactive(row, 'mother_name_bn', m.mother_name_bn);

          const relId = m.relationship_id || RELATION_ID_MAP[m.relation] || 160;
          setReactive(row, 'relationship_id', relId);
          setReactive(row, 'is_member_disabled', Number(m.is_disabled) === 1 ? 1 : 0);
          setReactive(row, 'is_gov_job_holder', 0);

          if (m.relation === 'Husband' && !row.estimate_annual_income) {
            setReactive(row, 'estimate_annual_income', 60000);
          }
        });

        // Update total household size (Head + Members)
        if (vm.data) {
          setReactive(vm.data, 'house_size', members.length + 1);
        }
      }

      if (typeof vm.$forceUpdate === 'function') {
        vm.$forceUpdate();
      }

      window.dispatchEvent(
        new CustomEvent('FC_PRO_AUTOFILL_RESULT', {
          detail: {
            success: true,
            message: `Auto-filled Head + ${members.length} family member(s) into form.`
          }
        })
      );
    } catch (err) {
      window.dispatchEvent(
        new CustomEvent('FC_PRO_AUTOFILL_RESULT', {
          detail: {
            success: false,
            message: `Autofill error: ${err.message}`
          }
        })
      );
    }
  });
})();


  /* Floating launcher and cross-frame message bridge (extension APIs removed). */
  const root = document.createElement('div');
  root.id = 'fc-floating-root';
  root.style.cssText = 'position:fixed;inset:0;z-index:2147483000;pointer-events:none;font-family:Inter,system-ui,sans-serif;';

  const trigger = document.createElement('button');
  trigger.id = 'fc-trigger-btn';
  trigger.type = 'button';
  trigger.innerHTML = '<span style="width:10px;height:10px;border-radius:50%;background:#22c55e;box-shadow:0 0 8px #22c55e;"></span><span>Family Card AI</span>';
  trigger.style.cssText = 'position:fixed;bottom:20px;right:20px;pointer-events:auto;display:flex;align-items:center;gap:8px;padding:10px 16px;background:#0f172a;color:#fff;border:1px solid #334155;border-radius:999px;font-size:13px;font-weight:650;cursor:pointer;box-shadow:0 10px 25px -5px rgba(0,0,0,.3);transition:transform .15s ease;';

  const iframe = document.createElement('iframe');
  iframe.id = 'fc-drawer-iframe';
  iframe.title = 'Family Card Pro';
  iframe.src = panelUrl;
  iframe.setAttribute('allow', 'camera');
  iframe.style.cssText = 'position:fixed;bottom:0;left:0;right:0;width:100%;height:90vh;max-height:800px;background:#fff;border:0;border-top-left-radius:20px;border-top-right-radius:20px;box-shadow:0 -10px 40px rgba(0,0,0,.3);pointer-events:auto;transform:translateY(105%);transition:transform .3s cubic-bezier(.16,1,.3,1);';

  root.append(trigger, iframe);
  (document.body || document.documentElement).appendChild(root);

  let isOpen = false;
  function sendToPanel(message) {
    if (iframe.contentWindow) iframe.contentWindow.postMessage(message, panelOrigin);
  }
  function closeSheet() {
    isOpen = false;
    iframe.style.transform = 'translateY(105%)';
    trigger.style.transform = 'scale(1)';
  }
  function toggleSheet() {
    isOpen = !isOpen;
    iframe.style.transform = isOpen ? 'translateY(0)' : 'translateY(105%)';
    trigger.style.transform = isOpen ? 'scale(.9)' : 'scale(1)';
    if (isOpen) sendToPanel({ action: 'FC_STATUS_REPLY', online: true });
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
  });

  window.addEventListener('FC_PRO_AUTOFILL_RESULT', (event) => {
    sendToPanel({ action: 'FC_AUTOFILL_RESPONSE', detail: event.detail });
  });
})();

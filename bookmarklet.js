/* Family Card Pro — bookmarklet edition
 * Host this folder on HTTPS (GitHub Pages, Cloudflare Pages, Netlify, etc.).
 */
(function () {
  'use strict';

  if (!/(^|\.)bhata\.gov\.bd$/i.test(location.hostname)) {
    alert('Family Card Pro works on bhata.gov.bd pages.');
    return;
  }

  // Foolproof script resolution
  const fallbackUrl = 'https://atikhasan169.github.io/family-card-bookmarklet/bookmarklet.js';
  const currentScript = document.currentScript;
  const scriptSrc = (currentScript && currentScript.src) ? currentScript.src : fallbackUrl;
  
  const cleanScriptSrc = scriptSrc.split('?')[0];
  const baseUrl = new URL('.', cleanScriptSrc).href;
  
  // Cache-buster ensures you NEVER get stuck on broken old versions
  const panelUrl = new URL('sidepanel.html?t=' + Date.now(), baseUrl).href;
  const panelOrigin = new URL(panelUrl).origin;

  const existingRoot = document.getElementById('fc-floating-root');
  if (existingRoot) existingRoot.remove();
  document.querySelectorAll('script[src*="sidepanel"], style[data-fc]').forEach(el => el.remove());

  /* Bundled Vue form injector */
  (function () {
    const RELATION_ID_MAP = {
      'Father': 157, 'Mother': 158, 'Husband': 159, 'Son': 160, 'Daughter': 161,
      'Brother': 162, 'Sister': 163, 'Father-in-law': 164, 'Mother-in-law': 165,
      'Son-in-law': 181, 'Daughter-in-law': 182, 'Grandson': 183, 'Granddaughter': 184,
      'Head/Self': 185, 'Wife': 186, 'Other Relative': 263
    };

    const ID_TO_RELATION_MAP = {
      157: 'Father', 158: 'Mother', 159: 'Husband', 160: 'Son', 161: 'Daughter',
      162: 'Brother', 163: 'Sister', 164: 'Father-in-law', 165: 'Mother-in-law',
      181: 'Son-in-law', 182: 'Daughter-in-law', 183: 'Grandson', 184: 'Granddaughter',
      185: 'Head/Self', 186: 'Wife', 263: 'Other Relative'
    };

    const RELATION_GENDER_MAP = {
      'Father': 1, 'Mother': 2, 'Husband': 1, 'Son': 1, 'Daughter': 2,
      'Brother': 1, 'Sister': 2, 'Father-in-law': 1, 'Mother-in-law': 2,
      'Son-in-law': 1, 'Daughter-in-law': 2, 'Grandson': 1, 'Granddaughter': 2,
      'Head/Self': 2, 'Wife': 2
    };

    function resolveGenderId(memberObj) {
      if (memberObj.gender_id) return Number(memberObj.gender_id);
      const g = String(memberObj.gender || '').toLowerCase();
      if (g === 'female' || g === '2') return 2;
      if (g === 'male' || g === '1') return 1;
      if (g === 'other' || g === '3') return 3;
      if (memberObj.relation && RELATION_GENDER_MAP[memberObj.relation]) {
        return RELATION_GENDER_MAP[memberObj.relation];
      }
      return 1;
    }

    function getVueNodes() {
      let vmHead = null, vmMembers = null;
      const allVms = [];
      document.querySelectorAll('*').forEach(node => {
        const v = node.__vue__;
        if (v) {
          allVms.push(v);
          if (v.data && typeof v.data === 'object' && (
            'name_bn' in v.data || 'name_en' in v.data || 'verification_number' in v.data ||
            'nid' in v.data || 'gender' in v.data || 'gender_id' in v.data || 'date_of_birth' in v.data
          )) {
            vmHead = v;
          }
          if (Array.isArray(v.familyMembers)) vmMembers = v;
        }
      });
      return { vmHead, vmMembers, allVms };
    }

    function determineIsNID(docType, cleanId) {
      const up = String(docType || '').toUpperCase().trim();
      if (up === 'BRN') return false;
      if (up === 'NID') return true;
      if (cleanId.length === 10 || cleanId.length === 13) return true;
      if (cleanId.length === 17) return false;
      return true;
    }

    function parseMemberRow(m) {
      const relId = Number(m.relationship_id || m.relation_id || 0);
      const relName = ID_TO_RELATION_MAP[relId] || m.relation || 'Son';
      const finalRelId = relId || RELATION_ID_MAP[relName] || 160;

      const verType = Number(m.verification_type);
      const idVal = String(m.verification_number || (verType === 2 ? m.brn_id : m.nid) || m.brn_id || m.nid || '').trim();
      const isBRN = verType === 2 || (!verType && idVal.length === 17 && Boolean(m.brn_id));

      const gVal = Number(m.gender_id || m.gender || 0);
      let genderStr = 'Male';
      if (gVal === 2) genderStr = 'Female';
      else if (gVal === 3) genderStr = 'Other';
      else if (!gVal && RELATION_GENDER_MAP[relName] === 2) genderStr = 'Female';

      return {
        relation: relName === 'Head/Self' ? 'Wife' : relName,
        relationship_id: finalRelId,
        gender: genderStr,
        gender_id: gVal || (genderStr === 'Female' ? 2 : 1),
        doc_type: isBRN ? 'BRN' : 'NID',
        nid_or_brn: idVal,
        dob: m.date_of_birth || m.dob || '',
        name_bn: m.name_bn || '',
        name_en: m.name_en || '',
        father_name_bn: m.father_name_bn || '',
        father_name_en: m.father_name_en || '',
        mother_name_bn: m.mother_name_bn || '',
        mother_name_en: m.mother_name_en || '',
        is_disabled: Number(m.is_member_disabled) === 1 ? 1 : 0
      };
    }

    function isRowPopulated(m) {
      if (!m) return false;
      return Boolean(
        (m.verification_number && String(m.verification_number).trim()) ||
        (m.nid && String(m.nid).trim()) ||
        (m.brn_id && String(m.brn_id).trim()) ||
        (m.name_bn && String(m.name_bn).trim()) ||
        (m.name_en && String(m.name_en).trim())
      );
    }

    window.addEventListener('FC_PRO_AUTOFILL', async (event) => {
      const payload = event.detail;
      if (!payload) return;

      const { vmHead, vmMembers, allVms } = getVueNodes();
      if (!vmHead && !vmMembers && (!allVms || !allVms.length)) {
        window.dispatchEvent(new CustomEvent('FC_PRO_AUTOFILL_RESULT', {
          detail: { success: false, message: 'Vue application form not detected on this page.' }
        }));
        return;
      }

      try {
        const setReactive = (vmTarget, targetObj, key, val) => {
          if (!targetObj || val === undefined || val === null) return;
          if (vmTarget && typeof vmTarget.$set === 'function') vmTarget.$set(targetObj, key, val);
          else targetObj[key] = val;
        };

        if (vmHead && 'panel' in vmHead) vmHead.panel = [0, 1, 2, 3, 4, 5, 6, 7];
        if (vmMembers && 'panel' in vmMembers) vmMembers.panel = [0, 1, 2, 3, 4, 5, 6, 7];

        // 0. Restore Full Website Dump & Tab Editor changes (Vue state + DOM controls)
        if (payload.full_form_dump) {
          const dump = payload.full_form_dump;
          if (dump.head_data && vmHead && vmHead.data) {
            Object.entries(dump.head_data).forEach(([k, v]) => {
              if (v !== undefined && typeof v !== 'function') {
                setReactive(vmHead, vmHead.data, k, v);
              }
            });
          }
          if (Array.isArray(dump.family_members_raw) && vmMembers && Array.isArray(vmMembers.familyMembers)) {
            while (vmMembers.familyMembers.length < dump.family_members_raw.length) {
              if (typeof vmMembers.addFamilyMember === 'function') vmMembers.addFamilyMember();
              else vmMembers.familyMembers.push({});
            }
            await new Promise((r) => setTimeout(r, 150));
            dump.family_members_raw.forEach((rawRow, idx) => {
              const targetRow = vmMembers.familyMembers[idx];
              if (!targetRow || !rawRow) return;
              Object.entries(rawRow).forEach(([k, v]) => {
                if (v !== undefined && typeof v !== 'function') {
                  setReactive(vmMembers, targetRow, k, v);
                }
              });
            });
          }
          if (Array.isArray(dump.dom_tabs)) {
            dump.dom_tabs.forEach((tab) => {
              (tab.fields || []).forEach((f) => {
                if (!f.dom_key) return;
                const el = document.querySelector(`[data-fc-dom-key="${f.dom_key}"]`) || (f.id ? document.getElementById(f.id) : null);
                if (!el) return;
                if (el.tagName === 'SELECT') {
                  el.value = f.value;
                  el.dispatchEvent(new Event('change', { bubbles: true }));
                } else if (el.type === 'checkbox' || el.type === 'radio') {
                  el.checked = Boolean(f.value);
                  el.dispatchEvent(new Event('change', { bubbles: true }));
                } else {
                  el.value = f.value;
                  el.dispatchEvent(new Event('input', { bubbles: true }));
                  el.dispatchEvent(new Event('change', { bubbles: true }));
                }
              });
            });
          }
        }

        // 1. Populate Primary Applicant (Head) in main form & Verification
        if (payload.head) {
          const h = payload.head;
          const cleanHeadId = String(h.nid || '').replace(/\s+/g, '');
          const headIsNID = determineIsNID(h.doc_type, cleanHeadId);
          const headGenderId = resolveGenderId({ ...h, relation: 'Head/Self' });
          // Format DOB with slashes (DD/MM/YYYY) to match website input mask expectations
          const headCleanDob = String(h.dob || '').replace(/\[.*?\]/g, '').replace(/-/g, '/');

          const isVerificationPage = Boolean(
            document.querySelector('input[placeholder*="ক্যাপচা"], input[id*="captcha"], .captcha-container') ||
            (!document.querySelector('input[name*="name_bn"], input[id*="name_bn"], #name_bn') && 
             document.querySelector('input[name*="verification_number"], input[id*="verification_number"], select[name*="verification_type"]'))
          );

          if (vmHead && vmHead.data) {
            setReactive(vmHead, vmHead.data, 'verification_type', headIsNID ? 1 : 2);
            setReactive(vmHead, vmHead.data, 'verification_number', cleanHeadId);
            setReactive(vmHead, vmHead.data, 'nid', headIsNID ? cleanHeadId : '');
            setReactive(vmHead, vmHead.data, 'brn_id', !headIsNID ? cleanHeadId : '');
            setReactive(vmHead, vmHead.data, 'date_of_birth', headCleanDob);
            setReactive(vmHead, vmHead.data, 'dob', headCleanDob);

            // Names & parents are always filled on all pages
            setReactive(vmHead, vmHead.data, 'name_bn', h.name_bn);
            setReactive(vmHead, vmHead.data, 'name_en', h.name_en);
            setReactive(vmHead, vmHead.data, 'father_name_bn', h.father_name_bn);
            setReactive(vmHead, vmHead.data, 'father_name_en', h.father_name_en);
            setReactive(vmHead, vmHead.data, 'mother_name_bn', h.mother_name_bn);
            setReactive(vmHead, vmHead.data, 'mother_name_en', h.mother_name_en);

            // GENDER: Excluded strictly on the verification/captcha page, filled normally on main form
            if (!isVerificationPage) {
              setReactive(vmHead, vmHead.data, 'gender', headGenderId);
              setReactive(vmHead, vmHead.data, 'gender_id', headGenderId);
              setReactive(vmHead, vmHead.data, 'sex', headGenderId);
              setReactive(vmHead, vmHead.data, 'applicant_gender', headGenderId);
            }
          }
        }

        // 2. Combine Head as Member 1, then the rest of the family
        const fullFamilyList = [];
        if (payload.head) {
          fullFamilyList.push({
            ...payload.head,
            relation: 'Head/Self',
            gender: payload.head.gender || 'Female',
            gender_id: resolveGenderId({ ...payload.head, relation: 'Head/Self' }),
            doc_type: payload.head.doc_type || 'NID',
            nid_or_brn: payload.head.nid,
            relationship_id: 185
          });
        }
        if (Array.isArray(payload.family_members)) {
          fullFamilyList.push(...payload.family_members);
        }

        // 3. Inject into the Member Array
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
            const isNID = determineIsNID(m.doc_type, cleanId);
            const genderId = resolveGenderId(m);
            const relId = Number(m.relationship_id || RELATION_ID_MAP[m.relation] || 160);

            setReactive(vmMembers, row, 'verification_type', isNID ? 1 : 2);
            
            if (isNID) {
              setReactive(vmMembers, row, 'nid', cleanId);
              setReactive(vmMembers, row, 'brn_id', '');
              setReactive(vmMembers, row, 'verification_number', cleanId);
            } else {
              setReactive(vmMembers, row, 'brn_id', cleanId);
              setReactive(vmMembers, row, 'nid', '');
              setReactive(vmMembers, row, 'verification_number', cleanId);
            }

            // Format member DOB with slashes (DD/MM/YYYY)
            const memCleanDob = String(m.dob || '').replace(/\[.*?\]/g, '').replace(/-/g, '/');
            setReactive(vmMembers, row, 'dob', memCleanDob);
            setReactive(vmMembers, row, 'date_of_birth', memCleanDob);
            setReactive(vmMembers, row, 'name_bn', m.name_bn);
            setReactive(vmMembers, row, 'name_en', m.name_en);
            setReactive(vmMembers, row, 'father_name_bn', m.father_name_bn);
            setReactive(vmMembers, row, 'mother_name_bn', m.mother_name_bn);

            setReactive(vmMembers, row, 'relationship_id', relId);
            setReactive(vmMembers, row, 'relation_id', relId);
            if (m.relation) setReactive(vmMembers, row, 'relation', m.relation);

            setReactive(vmMembers, row, 'gender', genderId);
            setReactive(vmMembers, row, 'gender_id', genderId);

            setReactive(vmMembers, row, 'is_member_disabled', Number(m.is_disabled) === 1 ? 1 : 0);
            setReactive(vmMembers, row, 'is_gov_job_holder', 0);

            if (m.relation === 'Husband' && !row.estimate_annual_income) {
              setReactive(vmMembers, row, 'estimate_annual_income', 60000);
            }
          });

          if (vmHead && vmHead.data) {
            setReactive(vmHead, vmHead.data, 'house_size', fullFamilyList.length);
          }
        }

        if (vmHead && typeof vmHead.$forceUpdate === 'function') vmHead.$forceUpdate();
        if (vmMembers && typeof vmMembers.$forceUpdate === 'function') vmMembers.$forceUpdate();

        window.dispatchEvent(new CustomEvent('FC_PRO_AUTOFILL_RESULT', {
          detail: { success: true, message: `Auto-filled Head + ${fullFamilyList.length - 1} family member(s) successfully.` }
        }));
      } catch (err) {
        window.dispatchEvent(new CustomEvent('FC_PRO_AUTOFILL_RESULT', {
          detail: { success: false, message: `Autofill error: ${err.message}` }
        }));
      }
    });

    window.addEventListener('FC_PRO_PULL_REQUEST', () => {
      const { vmHead, vmMembers, allVms } = getVueNodes();
      if (!vmHead && !vmMembers && (!allVms || !allVms.length)) {
        window.dispatchEvent(new CustomEvent('FC_PRO_PULL_RESULT', {
          detail: { success: false, message: 'No active Vue form instance found on this page.' }
        }));
        return;
      }

      try {
        const d = (vmHead && vmHead.data) ? vmHead.data : {};
        const rawMembers = (vmMembers && Array.isArray(vmMembers.familyMembers)) ? vmMembers.familyMembers : [];

        const row0 = rawMembers[0] || {};
        const dId = String(d.verification_number || d.nid || '').trim();
        const r0Id = String(row0.verification_number || row0.nid || row0.brn_id || '').trim();
        const row0IsHead = Number(row0.relationship_id) === 185 || (dId && r0Id && dId === r0Id) || (!dId && rawMembers.length > 0 && !row0.relationship_id);

        const hSource = row0IsHead ? { ...row0, ...d } : d;
        const headVerType = Number(hSource.verification_type || row0.verification_type || 1);
        const headGenVal = Number(hSource.gender_id || hSource.gender || row0.gender_id || row0.gender || 2);

        const head = {
          doc_type: headVerType === 2 ? 'BRN' : 'NID',
          gender: headGenVal === 1 ? 'Male' : 'Female',
          gender_id: headGenVal === 1 ? 1 : 2,
          nid: String(d.verification_number || d.nid || (row0IsHead ? r0Id : '') || '').trim(),
          dob: d.date_of_birth || d.dob || (row0IsHead ? (row0.date_of_birth || row0.dob) : '') || '',
          name_bn: d.name_bn || (row0IsHead ? row0.name_bn : '') || '',
          name_en: d.name_en || (row0IsHead ? row0.name_en : '') || '',
          father_name_bn: d.father_name_bn || (row0IsHead ? row0.father_name_bn : '') || '',
          father_name_en: d.father_name_en || (row0IsHead ? row0.father_name_en : '') || '',
          mother_name_bn: d.mother_name_bn || (row0IsHead ? row0.mother_name_bn : '') || '',
          mother_name_en: d.mother_name_en || (row0IsHead ? row0.mother_name_en : '') || ''
        };

        const memberSlice = row0IsHead ? rawMembers.slice(1) : rawMembers;
        const family_members = memberSlice.filter(isRowPopulated).map(parseMemberRow);

        const safeClone = (obj) => {
          try { return JSON.parse(JSON.stringify(obj || {})); } catch (e) { return {}; }
        };

        const dom_tabs = [];
        const vueOptionCatalog = {};

        if (vmHead && vmHead.$data) {
          Object.entries(vmHead.$data).forEach(([k, val]) => {
            if (Array.isArray(val) && val.length > 0 && val.length <= 200 && typeof val[0] === 'object' && val[0] !== null) {
              const sample = val[0];
              const idKey = ('id' in sample) ? 'id' : (('value' in sample) ? 'value' : (('code' in sample) ? 'code' : null));
              const nameKey = ('name_bn' in sample) ? 'name_bn' : (('title_bn' in sample) ? 'title_bn' : (('name' in sample) ? 'name' : (('label' in sample) ? 'label' : ('name_en' in sample ? 'name_en' : null))));
              if (idKey && nameKey) {
                vueOptionCatalog[k] = val.map(item => ({
                  value: item[idKey],
                  label: item.name_bn && item.name_en ? `${item.name_bn} (${item.name_en})` : String(item[nameKey])
                }));
              }
            }
          });
        }

        const containers = document.querySelectorAll('.v-expansion-panel, .card, .tab-pane, fieldset, form');
        const roots = containers.length ? Array.from(containers) : [document.body];
        const seenElements = new Set();
        let domKeyCounter = 1;

        roots.forEach((sec, secIdx) => {
          const inputs = Array.from(sec.querySelectorAll('input:not([type="hidden"]):not([type="file"]), select, textarea'))
            .filter(el => !el.closest('#fc-floating-root') && !seenElements.has(el));
          if (!inputs.length) return;

          const headerEl = sec.querySelector('.v-expansion-panel-header, .card-header, h1, h2, h3, h4, h5, legend');
          const tabTitle = headerEl ? headerEl.textContent.replace(/\s+/g, ' ').trim().slice(0, 65) : `Website Section #${secIdx + 1}`;
          const fields = [];

          inputs.forEach((el) => {
            seenElements.add(el);
            const domKey = el.getAttribute('data-fc-dom-key') || `fc_dom_${domKeyCounter++}`;
            el.setAttribute('data-fc-dom-key', domKey);

            let label = '';
            if (el.id) {
              const lblEl = document.querySelector(`label[for="${CSS.escape(el.id)}"]`);
              if (lblEl) label = lblEl.textContent;
            }
            if (!label) {
              const wrap = el.closest('.v-input, .form-group, .col-md-6, .col-md-4, .col-12, div');
              const lblEl = wrap ? wrap.querySelector('label, .v-label, .field-label') : null;
              if (lblEl) label = lblEl.textContent;
            }
            label = (label || el.name || el.placeholder || el.id || `Field ${domKeyCounter}`).replace(/\s+/g, ' ').trim();

            if (el.tagName === 'SELECT') {
              const options = Array.from(el.options).map(o => ({ value: o.value, label: o.textContent.trim() }));
              const selectedText = el.options[el.selectedIndex] ? el.options[el.selectedIndex].textContent.trim() : '';
              fields.push({ dom_key: domKey, id: el.id || '', name: el.name || '', label, type: 'select', value: el.value, display_value: selectedText, options });
            } else if (el.type === 'checkbox' || el.type === 'radio') {
              fields.push({
                dom_key: domKey, id: el.id || '', name: el.name || '', label, type: 'boolean', value: el.checked,
                display_value: el.checked ? 'Yes (হ্যাঁ)' : 'No (না)',
                options: [{ value: 'true', label: 'Yes (হ্যাঁ)' }, { value: 'false', label: 'No (না)' }]
              });
            } else {
              fields.push({ dom_key: domKey, id: el.id || '', name: el.name || '', label, type: 'text', value: el.value || '', display_value: el.value || '' });
            }
          });

          if (fields.length) dom_tabs.push({ title: tabTitle, fields });
        });

        const full_form_dump = {
          pulled_at: new Date().toISOString(),
          page_url: location.href,
          head_data: safeClone(d),
          family_members_raw: safeClone(rawMembers),
          vue_options: vueOptionCatalog,
          dom_tabs
        };

        const hasAnyHeadData = Object.values(full_form_dump.head_data).some(v => v !== null && v !== '' && v !== undefined && typeof v !== 'object');
        if (!hasAnyHeadData && !head.nid && !head.name_bn && !head.name_en && family_members.length === 0 && dom_tabs.length === 0) {
          window.dispatchEvent(new CustomEvent('FC_PRO_PULL_RESULT', {
            detail: { success: false, message: 'Web form is currently empty — nothing to pull.' }
          }));
          return;
        }

        window.dispatchEvent(new CustomEvent('FC_PRO_PULL_RESULT', {
          detail: { success: true, payload: { head, family_members, full_form_dump } }
        }));
      } catch (err) {
        window.dispatchEvent(new CustomEvent('FC_PRO_PULL_RESULT', {
          detail: { success: false, message: err.message }
        }));
      }
    });

  })();

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
  const SESSION_DRAFT_KEY = 'fc_pro_active_session';
  let isOpen = false;

  function sendToPanel(message) {
    if (iframe.contentWindow) iframe.contentWindow.postMessage(message, panelOrigin);
  }
  function pushSavedCredentials() {
    try {
      sendToPanel({
        action: 'FC_API_KEY_DATA',
        apiKey: localStorage.getItem(STORAGE_KEY) || '',
        model: localStorage.getItem(STORAGE_MODEL) || 'gemini-2.5-flash'
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
    if (event.source !== iframe.contentWindow || event.origin !== panelOrigin || !event.data) return;
    const data = event.data;
    if (data.action === 'FC_CLOSE_SHEET') closeSheet();
    if (data.action === 'FC_CHECK_STATUS') {
      sendToPanel({ action: 'FC_STATUS_REPLY', online: true });
      pushSavedCredentials();
    }
    if (data.action === 'FC_GET_API_KEY') {
      pushSavedCredentials();
    }
    if (data.action === 'FC_SAVE_API_KEY') {
      try {
        if (data.apiKey !== undefined) localStorage.setItem(STORAGE_KEY, data.apiKey);
        if (data.model !== undefined) localStorage.setItem(STORAGE_MODEL, data.model);
      } catch (e) {}
    }
    if (data.action === 'FC_SAVE_SESSION') {
      try {
        if (data.sessionData) {
          sessionStorage.setItem(SESSION_DRAFT_KEY, JSON.stringify(data.sessionData));
        } else {
          sessionStorage.removeItem(SESSION_DRAFT_KEY);
        }
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

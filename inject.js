/* Family Card Pro — Vue + Vuetify Form Injector (inject.js) */
(function () {
  'use strict';

  if (window.__FC_INJECTOR_LOADED__) return;
  window.__FC_INJECTOR_LOADED__ = true;

  // Version shown in the sidepanel so the user can tell whether the
  // newly uploaded inject.js actually loaded. Bump on every release.
  const FC_INJECT_VERSION = 'v15';
  window.FC_INJECT_VERSION = FC_INJECT_VERSION;

  // Lookup ids below are the REAL ids from the site's own API
  // (GET getApplicationPageData, captured 2026-11-12) and confirmed by a
  // saved draft. Relations = lookup type 41, genders = type 2,
  // religions = type 9. Do NOT renumber these from guesses: the old
  // 1/2/3 gender ids and 1..5 religion ids were wrong (the site stores
  // 23/24/95 and 96..100), and several relation ids (Brother, Sister,
  // in-laws, Head/Self) pointed at other lookup types entirely.
  const RELATION_ID_MAP = {
    'Father': 157, 'Mother': 158, 'Husband': 159, 'Son': 160, 'Daughter': 161,
    'Grandfather': 173, 'Grandmother': 174, 'Brother': 175, 'Sister': 176,
    'Father-in-law': 177, 'Mother-in-law': 178, 'Brother-in-law': 179, 'Sister-in-law': 180,
    'Son-in-law': 187, 'Daughter-in-law': 182, 'Grandson': 183, 'Granddaughter': 184,
    'Head/Self': 260, 'Wife': 186, 'Other Relative': 263,
    'Paid Domestic Worker': 262, 'Non-Relative': 264, 'Brother/Sister-in-law': 265
  };

  const ID_TO_RELATION_MAP = {
    157: 'Father', 158: 'Mother', 159: 'Husband', 160: 'Son', 161: 'Daughter',
    173: 'Grandfather', 174: 'Grandmother', 175: 'Brother', 176: 'Sister',
    177: 'Father-in-law', 178: 'Mother-in-law', 179: 'Brother-in-law', 180: 'Sister-in-law',
    187: 'Son-in-law', 182: 'Daughter-in-law', 183: 'Grandson', 184: 'Granddaughter',
    260: 'Head/Self', 186: 'Wife', 263: 'Other Relative',
    262: 'Paid Domestic Worker', 264: 'Non-Relative', 265: 'Brother/Sister-in-law'
  };

  // Gender ids are the site's lookup type 2: 23 Male, 24 Female, 95 Transgender.
  const GENDER_MALE = 23, GENDER_FEMALE = 24, GENDER_OTHER = 95;
  const RELATION_GENDER_MAP = {
    'Father': 23, 'Mother': 24, 'Husband': 23, 'Son': 23, 'Daughter': 24,
    'Grandfather': 23, 'Grandmother': 24, 'Brother': 23, 'Sister': 24,
    'Father-in-law': 23, 'Mother-in-law': 24, 'Brother-in-law': 23, 'Sister-in-law': 24,
    'Son-in-law': 23, 'Daughter-in-law': 24, 'Grandson': 23, 'Granddaughter': 24,
    'Head/Self': 24, 'Wife': 24
  };

  // Religion ids are the site's lookup type 9.
  const RELIGION_ID_MAP = { Islam: 96, Hinduism: 97, Buddhism: 98, Christianity: 99, Other: 100 };

  // The sidepanel's area-type numbering is its own convention
  // (1 = পল্লী/ইউনিয়ন, 2 = পৌরসভা, 3 = সিটি কর্পোরেশন) while the site's
  // lookup type 1 is 1 = District Pouroshava, 2 = Upazila, 3 = City Corp.
  const AREA_TYPE_TO_SITE_ID = { 1: 2, 2: 1, 3: 3 };
  const siteLocationTypeId = (areaTypeId) => AREA_TYPE_TO_SITE_ID[Number(areaTypeId)] ?? Number(areaTypeId);

  // Accept legacy 1/2/3 gender and 1..5 religion ids (old drafts / payloads)
  // and normalise them to the real lookup ids.
  function normalizeGenderId(v) {
    const n = Number(v);
    if (n === 1 || n === 23) return GENDER_MALE;
    if (n === 2 || n === 24) return GENDER_FEMALE;
    if (n === 3 || n === 95) return GENDER_OTHER;
    return n || GENDER_MALE;
  }
  function normalizeReligionId(v) {
    const n = Number(v);
    if (n >= 1 && n <= 5) return 95 + n; // 1..5 -> 96..100
    return n || 96;
  }
  const isFemaleGenderId = (gid) => Number(gid) === GENDER_FEMALE || Number(gid) === 2;

  const toBnDigits = (str) => String(str ?? '').replace(/[0-9]/g, d => '০১২৩৪৫৬৭৮৯'[d]);
  const toEnDigits = (str) => String(str ?? '').replace(/[০-৯]/g, d => '০১২৩৪৫৬৭৮৯'.indexOf(d));

  function resolveGenderId(memberObj) {
    if (!memberObj) return GENDER_MALE;
    const combined = `${memberObj.name_en || ''} ${memberObj.name_bn || ''}`;
    if (/\b(?:mst|mosammat|mosa|mosha|begum|khatun|akter|akhter|bibi|parvin|pervin|sultana|rani|bala|devi|kumari)\b|মোছা|মোসা|বেগম|খাতুন|আক্তার|বিবি|পারভীন|সুলতানা|রানী|রাণী|বালা|দেবী|কুমারী/i.test(combined)) {
      return GENDER_FEMALE;
    }
    if (memberObj.gender_id) return normalizeGenderId(memberObj.gender_id);
    const g = String(memberObj.gender || '').toLowerCase();
    if (g === 'female' || g === '2' || g === '24' || g === 'মহিলা') return GENDER_FEMALE;
    if (g === 'male' || g === '1' || g === '23' || g === 'পুরুষ') return GENDER_MALE;
    if (g === 'other' || g === '3' || g === '95') return GENDER_OTHER;
    if (memberObj.relation && RELATION_GENDER_MAP[memberObj.relation]) {
      return RELATION_GENDER_MAP[memberObj.relation];
    }
    return GENDER_MALE;
  }

  function resolveReligionId(memberObj, fallbackReligionId = 96) {
    if (!memberObj) return normalizeReligionId(fallbackReligionId);
    if (memberObj.religion_id) return normalizeReligionId(memberObj.religion_id);
    const r = String(memberObj.religion || '').trim();
    if (RELIGION_ID_MAP[r]) return RELIGION_ID_MAP[r];
    if (/ইসলাম|islam|muslim/i.test(r)) return 96;
    if (/হিন্দু|hindu|সনাতন/i.test(r)) return 97;
    if (/বৌদ্ধ|buddh/i.test(r)) return 98;
    if (/খ্রিস্টান|christ/i.test(r)) return 99;
    return normalizeReligionId(fallbackReligionId);
  }

  function detectFamilyReligionId(payload) {
    const people = [];
    if (payload?.head) people.push(payload.head);
    if (Array.isArray(payload?.family_members)) people.push(...payload.family_members);
    const allText = people.map(p => `${p?.name_bn || ''} ${p?.name_en || ''} ${p?.father_name_bn || ''} ${p?.mother_name_bn || ''}`).join(' ');
    if (/\b(?:chandra|kumar|rani|bala|devi|chakraborty|bhattacharya|chatterjee|mukherjee|banerjee|barman|ghosh|bose)\b|চন্দ্র|কুমার|রানী|রাণী|বালা|দেবী|চক্রবর্তী|ভট্টাচার্য|চ্যাটার্জী|মুখার্জী|ব্যানার্জী|বর্মন|ঘোষ|বসু/i.test(allText)) {
      return 97; // Hinduism
    }
    return 96; // Default Islam
  }

  function setReactive(vmTarget, targetObj, key, val) {
    if (!targetObj || val === undefined || val === null) return;
    if (vmTarget && typeof vmTarget.$set === 'function') {
      try { vmTarget.$set(targetObj, key, val); return; } catch (_) {}
    }
    targetObj[key] = val;
  }

  function getHeadTargetObj(vmHead) {
    if (!vmHead) return null;
    if (vmHead.data && typeof vmHead.data === 'object') return vmHead.data;
    if (vmHead.form && typeof vmHead.form === 'object') return vmHead.form;
    if (vmHead.$data && typeof vmHead.$data === 'object') return vmHead.$data;
    return null;
  }

  function getVueNodes() {
    let vmHead = null;
    let vmMembers = null;
    const allVms = [];

    const appEl = document.getElementById('application') || document.querySelector('.content');
    if (appEl && appEl.__vue__) {
      const rootV = appEl.__vue__;
      if (rootV.data || rootV.form) vmHead = rootV;
      if (Array.isArray(rootV.familyMembers)) vmMembers = rootV;
    }

    document.querySelectorAll('*').forEach(node => {
      if (node.closest('#fc-floating-root')) return;
      const v = node.__vue__;
      if (!v || allVms.includes(v)) return;
      allVms.push(v);

      if (!vmMembers && Array.isArray(v.familyMembers)) {
        vmMembers = v;
      }

      const d = v.data || v.form || v.$data;
      if (d && typeof d === 'object') {
        const hasMainKeys = 'name_bn' in d && ('father_name_bn' in d || 'mother_name_bn' in d || 'house_size' in d || 'location_type' in d);
        const hasVerifyKeys = 'verification_number' in d || 'verification_type' in d || ('nid' in d && ('dob' in d || 'date_of_birth' in d));
        if (hasMainKeys && (!vmHead || !(vmHead.data && 'house_size' in vmHead.data))) {
          vmHead = v;
        } else if (hasVerifyKeys && !vmHead) {
          vmHead = v;
        }
      }
    });

    if (!vmHead && vmMembers) vmHead = vmMembers;
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

  function parseDobParts(rawDob) {
    if (!rawDob) return null;
    const clean = toEnDigits(String(rawDob)).replace(/\[.*?\]/g, '').trim();
    let dd, mm, yyyy;
    const dmy = clean.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
    if (dmy) {
      dd = dmy[1].padStart(2, '0');
      mm = dmy[2].padStart(2, '0');
      yyyy = dmy[3];
    } else {
      const ymd = clean.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
      if (ymd) {
        yyyy = ymd[1];
        mm = ymd[2].padStart(2, '0');
        dd = ymd[3].padStart(2, '0');
      } else {
        return null;
      }
    }
    return {
      dd, mm, yyyy,
      iso: `${yyyy}-${mm}-${dd}`,
      slash: `${dd}/${mm}/${yyyy}`,
      dash: `${dd}-${mm}-${yyyy}`
    };
  }

  function calculateAgeYears(rawDob) {
    const parts = parseDobParts(rawDob);
    if (!parts) return null;
    const yyyy = parseInt(parts.yyyy, 10);
    const mm = parseInt(parts.mm, 10);
    const dd = parseInt(parts.dd, 10);
    const today = new Date();
    let age = today.getFullYear() - yyyy;
    const mDiff = (today.getMonth() + 1) - mm;
    if (mDiff < 0 || (mDiff === 0 && today.getDate() < dd)) age--;
    return age;
  }

  function findAllVueComponents(rootVm, filterFn, visited = new Set()) {
    const results = [];
    if (!rootVm || visited.has(rootVm)) return results;
    visited.add(rootVm);
    if (filterFn(rootVm)) results.push(rootVm);
    if (Array.isArray(rootVm.$children)) {
      rootVm.$children.forEach(child => {
        results.push(...findAllVueComponents(child, filterFn, visited));
      });
    }
    return results;
  }

  function isDatePickerVm(v) {
    if (!v || !v.$options) return false;
    const tag = String(v.$options._componentTag || v.$options.name || '').toLowerCase();
    return tag.includes('date-picker') || tag.includes('datepicker') || ('tableDate' in v && 'activePicker' in v);
  }

  function isMenuOrDialogVm(v) {
    if (!v || !v.$options) return false;
    const tag = String(v.$options._componentTag || v.$options.name || '').toLowerCase();
    return (tag.includes('v-menu') || tag.includes('v-dialog')) && 'isActive' in v;
  }

  function setNativeInputValue(inp, valStr, vInst = null) {
    if (!inp || inp.disabled) return;
    const strVal = String(valStr ?? '');

    if (vInst) {
      if ('lazyValue' in vInst) { try { vInst.lazyValue = strVal; } catch (_) {} }
      if ('internalValue' in vInst) { try { vInst.internalValue = strVal; } catch (_) {} }
      vInst.$emit('input', strVal);
      vInst.$emit('change', strVal);
    }

    const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
    if (nativeSetter) nativeSetter.call(inp, strVal);
    else inp.value = strVal;

    inp.dispatchEvent(new Event('focus', { bubbles: true }));
    inp.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: strVal }));
    inp.dispatchEvent(new Event('change', { bubbles: true }));
    inp.dispatchEvent(new Event('blur', { bubbles: true }));

    if (vInst && typeof vInst.$forceUpdate === 'function') vInst.$forceUpdate();
  }

  async function selectDateViaVuetifyCalendar(rawDob, targetIndex = 0) {
    const parts = parseDobParts(rawDob);
    if (!parts) return;

    const dobContainers = [];
    document.querySelectorAll('.v-input, .form-group').forEach(wrap => {
      if (wrap.closest('#fc-floating-root')) return;
      if (!wrap.classList.contains('v-input') && wrap.querySelector('.v-input')) return;
      const txt = (wrap.textContent || '').toLowerCase();
      const inp = wrap.querySelector('input');
      const meta = inp ? `${inp.name || ''} ${inp.id || ''} ${inp.placeholder || ''}`.toLowerCase() : '';
      if (txt.includes('জন্ম তারিখ') || txt.includes('date of birth') || /birth|dob/.test(meta)) {
        if (!dobContainers.some(c => c.contains(wrap) || wrap.contains(c))) {
          dobContainers.push(wrap);
        }
      }
    });

    const targetWrap = dobContainers[targetIndex];
    if (!targetWrap) return;
    if (targetWrap.classList.contains('bg-gray-cursor-not-allowed') || targetWrap.closest('.bg-gray-cursor-not-allowed')) return;

    let menuVm = null;
    let wrapperVm = null;
    let curr = targetWrap.__vue__;
    let depth = 0;

    while (curr && depth < 8) {
      if (!menuVm && isMenuOrDialogVm(curr)) menuVm = curr;
      if (!menuVm && Array.isArray(curr.$children)) {
        const foundMenu = findAllVueComponents(curr, isMenuOrDialogVm)[0];
        if (foundMenu) menuVm = foundMenu;
      }
      if (curr.$data && ('date' in curr.$data || 'dateFormatted' in curr.$data || 'dob' in curr.$data || 'date_of_birth' in curr.$data)) {
        wrapperVm = curr;
      }
      curr = curr.$parent;
      depth++;
    }

    let openedMenuTemporarily = false;
    if (menuVm && !menuVm.isActive) {
      menuVm.isActive = true;
      openedMenuTemporarily = true;
      await new Promise(r => setTimeout(r, 60));
    }

    const pickerCandidates = menuVm ? findAllVueComponents(menuVm, isDatePickerVm) : [];
    if (!pickerCandidates.length) {
      document.querySelectorAll('.v-picker, .v-date-picker-table').forEach(n => {
        if (n.__vue__ && isDatePickerVm(n.__vue__)) pickerCandidates.push(n.__vue__);
      });
    }

    const targetPicker = pickerCandidates[0] || pickerCandidates[pickerCandidates.length - 1];
    if (targetPicker) {
      if ('tableDate' in targetPicker) targetPicker.tableDate = `${parts.yyyy}-${parts.mm}`;
      if ('internalActivePicker' in targetPicker) targetPicker.internalActivePicker = 'DATE';
      targetPicker.$emit('input', parts.iso);
      targetPicker.$emit('change', parts.iso);
      targetPicker.$emit('click:date', parts.iso);
    }

    if (wrapperVm && wrapperVm.$data) {
      if ('date' in wrapperVm.$data) setReactive(wrapperVm, wrapperVm.$data, 'date', parts.iso);
      if ('dob' in wrapperVm.$data) setReactive(wrapperVm, wrapperVm.$data, 'dob', parts.iso);
      if ('date_of_birth' in wrapperVm.$data) setReactive(wrapperVm, wrapperVm.$data, 'date_of_birth', parts.iso);
      if ('dateFormatted' in wrapperVm.$data) setReactive(wrapperVm, wrapperVm.$data, 'dateFormatted', parts.slash);
      if (typeof wrapperVm.formatDate === 'function') {
        try { wrapperVm.formatDate(parts.iso); } catch (_) {}
      }
    }

    const inp = targetWrap.querySelector('input');
    if (inp && inp._flatpickr) {
      inp._flatpickr.setDate(parts.iso, true);
    } else if (inp && !inp.disabled) {
      setNativeInputValue(inp, parts.iso, targetWrap.__vue__);
    }

    if (openedMenuTemporarily && menuVm) {
      await new Promise(r => setTimeout(r, 40));
      menuVm.isActive = false;
    }
  }

  function getActiveVm(wrap) {
    const candidates = [];
    if (wrap.__vue__) candidates.push(wrap.__vue__);
    wrap.querySelectorAll('.v-select, .v-autocomplete, .v-radio-group, .v-input').forEach(el => {
      if (el.__vue__) candidates.push(el.__vue__);
    });

    for (const c of candidates) {
      const deepMatch = findAllVueComponents(c, v =>
        (Array.isArray(v.items) && v.items.length > 0) ||
        String(v.$options?._componentTag || v.$options?.name || '').toLowerCase().includes('radio-group')
      );
      if (deepMatch.length > 0) return deepMatch[0];
    }
    return candidates[0] || null;
  }

  function triggerVeeValidate(wrap) {
    let curr = wrap.__vue__;
    let d = 0;
    while (curr && d < 5) {
      if (typeof curr.validate === 'function') {
        try { curr.validate(); } catch (_) {}
      }
      curr = curr.$parent;
      d++;
    }
  }

  // NOTE (bug fix, 2026-11-17): the site's lookup lists (religion, gender,
  // livelihood, literacy, health, education, marital, disability, facilities,
  // profession, location type, ...) render their labels via getItemValue(),
  // which reads `value_bn` / `value_en` — NOT name_bn/name_en. The old
  // itemToStr() never read those keys, so every text-pattern match against
  // those dropdowns silently failed and the options were never auto-filled.
  // Geo lists (division/district/thana/union/ward) use name_bn/name_en.
  const itemToStr = (it) => (typeof it === 'object' && it !== null)
    ? `${it.text ?? ''} ${it.value_bn ?? ''} ${it.value_en ?? ''} ${it.name_bn ?? ''} ${it.name_en ?? ''} ${it.label ?? ''} ${it.label_bn ?? ''} ${it.label_en ?? ''} ${it.title_bn ?? ''} ${it.title_en ?? ''} ${it.title ?? ''} ${it.display_name ?? ''} ${it.display_name_bn ?? ''} ${it.display_name_en ?? ''} ${it.name ?? ''} ${it.value ?? ''} ${it.id ?? ''} ${it.code ?? ''}`
    : String(it ?? '');

  function selectVuetifyItem(vInst, matchFn) {
    if (!vInst || !Array.isArray(vInst.items) || !vInst.items.length || vInst.disabled || vInst.readonly) return false;
    const targetItem = vInst.items.find(matchFn);
    if (targetItem === undefined) return false;

    let val = targetItem;
    if (typeof targetItem === 'object' && targetItem !== null && !vInst.returnObject) {
      const valKey = (typeof vInst.itemValue === 'string' && vInst.itemValue in targetItem) ? vInst.itemValue : null;
      val = valKey ? targetItem[valKey] : (targetItem.value ?? targetItem.id ?? targetItem.code ?? targetItem);
    }

    if (typeof vInst.selectItem === 'function') {
      try { vInst.selectItem(targetItem); } catch (_) {}
    }
    if ('internalValue' in vInst) { try { vInst.internalValue = val; } catch (_) {} }
    if ('lazyValue' in vInst) { try { vInst.lazyValue = val; } catch (_) {} }
    vInst.$emit('input', val);
    vInst.$emit('change', val);
    if (typeof vInst.$forceUpdate === 'function') vInst.$forceUpdate();
    return true;
  }

  function getControlLabel(wrap) {
    const parts = [];
    wrap.querySelectorAll('label, .v-label, legend').forEach(el => {
      if (!el.classList.contains('v-radio') && !el.closest('.v-radio') && !el.closest('.v-select__selections')) {
        parts.push(el.textContent || '');
      }
    });
    let prev = wrap.previousElementSibling;
    while (prev && !prev.classList.contains('v-input') && !prev.querySelector('.v-input, input, select')) {
      parts.push(prev.textContent || '');
      prev = prev.previousElementSibling;
    }
    const col = wrap.closest('[class*="col-"], .form-group');
    if (col && col.querySelectorAll('.v-input, select, input:not([type="hidden"]):not([type="radio"])').length <= 1) {
      col.querySelectorAll('label, .v-label, legend, p, h5, h6, span').forEach(el => {
        if (!wrap.contains(el) && !el.closest('.v-radio') && !el.closest('.v-select__selections')) {
          parts.push(el.textContent || '');
        }
      });
    }
    const inp = wrap.querySelector('input, select, textarea');
    if (inp) {
      parts.push(inp.getAttribute('placeholder') || '');
      parts.push(inp.getAttribute('aria-label') || '');
      parts.push(inp.getAttribute('name') || '');
      parts.push(inp.getAttribute('id') || '');
    }
    return parts.join(' ').replace(/\*/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
  }

  function applySmartFormDefaults(vmHead, vmMembers, counts, defs = {}) {
    const {
      totalMembers,
      maleCount,
      femaleCount,
      otherGenderCount = 0,
      bideshCount = 0,
      childrenUnder18,
      religionId,
      isEthnic,
      areaTypeId
    } = counts;

    const d = getHeadTargetObj(vmHead);
    const villageVal = String(defs?.village || '').trim();
    const wardVal = toEnDigits(String(defs?.ward_no || '').trim());
    const postVal = toEnDigits(String(defs?.post_code || '').replace(/\D+/g, '').trim());

    const religionPattern = (() => {
      const rid = normalizeReligionId(religionId);
      if (rid === 97) return /হিন্দু|সনাতন|hindu/i;
      if (rid === 98) return /বৌদ্ধ|buddh/i;
      if (rid === 99) return /খ্রিস্টান|খ্রীষ্টান|christ/i;
      if (rid === 100) return /অন্যান্য|other/i;
      return /ইসলাম|islam|muslim/i;
    })();
    const siteAreaTypeId = siteLocationTypeId(areaTypeId);

    if (d) {
      setReactive(vmHead, d, 'location_type', siteAreaTypeId);
      setReactive(vmHead, d, 'house_size', Number(totalMembers));
      setReactive(vmHead, d, 'children_count', Number(childrenUnder18));
      setReactive(vmHead, d, 'religion', normalizeReligionId(religionId));
      setReactive(vmHead, d, 'religion_id', normalizeReligionId(religionId));
      setReactive(vmHead, d, 'other_gender_count', Number(otherGenderCount));
      setReactive(vmHead, d, 'bidesh_count', Number(bideshCount));

      if ('is_ethnic' in d) {
        setReactive(vmHead, d, 'is_ethnic', typeof d.is_ethnic === 'boolean' ? Boolean(isEthnic) : Number(isEthnic));
      }

      ['onChangeLocationType', 'locationTypeChange', 'handleLocationType', 'getUnions', 'getPourashavas'].forEach(fnName => {
        if (vmHead && typeof vmHead[fnName] === 'function') {
          try { vmHead[fnName](siteAreaTypeId); } catch (_) {}
        }
      });

      [
        'house_size', 'total_member', 'total_members', 'family_member_count',
        'total_family_member', 'member_count', 'household_size', 'khana_member'
      ].forEach(k => {
        if (k in d) setReactive(vmHead, d, k, Number(totalMembers));
      });

      [
        'male_count', 'male_member', 'male_members', 'total_male', 'no_of_male',
        'number_of_male', 'khana_male', 'male_member_count', 'purush_count', 'male'
      ].forEach(k => {
        if (k in d) setReactive(vmHead, d, k, Number(maleCount));
      });

      [
        'female_count', 'female_member', 'female_members', 'total_female', 'no_of_female',
        'number_of_female', 'khana_female', 'female_member_count', 'mohila_count', 'female'
      ].forEach(k => {
        if (k in d) setReactive(vmHead, d, k, Number(femaleCount));
      });

      [
        'other_gender_count', 'third_gender_count', 'hijra_count', 'other_member',
        'transgender_count', 'hijra_member', 'hijra', 'third_gender', 'khana_hijra'
      ].forEach(k => {
        if (k in d) setReactive(vmHead, d, k, Number(otherGenderCount));
      });

      [
        'bidesh_count', 'probashi_count', 'migrant_count', 'expatriate_count',
        'abroad_count', 'abroad_member', 'probashi_member', 'foreign_member',
        'overseas_member', 'probashi', 'bidesh', 'is_probashi', 'is_migrant', 'has_migrant'
      ].forEach(k => {
        if (k in d) {
          setReactive(vmHead, d, k, typeof d[k] === 'boolean' ? Boolean(bideshCount) : Number(bideshCount));
        }
      });

      [
        'children_count', 'child_count', 'no_of_children', 'number_of_children',
        'total_children', 'under_18_member', 'children_under_18', 'sishu_count', 'shishu_count'
      ].forEach(k => {
        if (k in d) setReactive(vmHead, d, k, Number(childrenUnder18));
      });

      if (postVal) {
        setReactive(vmHead, d, 'post_code', postVal);
        ['postal_code', 'postcode', 'zip_code', 'present_post_code', 'permanent_post_code', 'post_office'].forEach(k => {
          if (k in d && typeof d[k] !== 'object') setReactive(vmHead, d, k, postVal);
        });
      }
      if (villageVal) {
        setReactive(vmHead, d, 'village', villageVal);
        ['village_bn', 'village_name', 'road', 'village_or_road', 'present_village', 'permanent_village', 'address', 'present_address'].forEach(k => {
          if (k in d && typeof d[k] !== 'object') setReactive(vmHead, d, k, villageVal);
        });
      }
      if (wardVal) {
        setReactive(vmHead, d, 'ward_no', wardVal);
        ['ward', 'ward_id', 'ward_number', 'present_ward', 'permanent_ward'].forEach(k => {
          if (k in d && typeof d[k] !== 'object') setReactive(vmHead, d, k, wardVal);
        });
      }
    }

    document.querySelectorAll('.v-input, .form-group, fieldset').forEach(wrap => {
      if (wrap.closest('#fc-floating-root')) return;
      if (wrap.classList.contains('bg-gray-cursor-not-allowed') || wrap.closest('.bg-gray-cursor-not-allowed')) return;
      if (!wrap.classList.contains('v-input') && wrap.querySelector('.v-input')) return;

      const labelTxt = getControlLabel(wrap);
      if (!labelTxt) return;
      const vInst = getActiveVm(wrap);

      // PMT + program-additional-field selects are owned by
      // syncDynamicSections (they need question/field-aware answers).
      // This loop's loose label/number matching picked WRONG options
      // there on the real page (e.g. PMT location got "পৌরসভা" because
      // "উপজেলার পৌরসভা" contains "উপজেলা"), so skip them entirely.
      if (vInst && Array.isArray(vInst.items) && vInst.items.length) {
        const firstItem = vInst.items[0];
        if (firstItem && typeof firstItem === 'object' &&
          ((firstItem.parent_id != null && 'score' in firstItem) || firstItem.additional_field_id != null)) {
          return;
        }
      }

      const fillNumericOrTextInput = (valToSet) => {
        const enStr = toEnDigits(valToSet);

        if (vInst && Array.isArray(vInst.items) && vInst.items.length > 0) {
          const matched = selectVuetifyItem(vInst, it => {
            const s = toEnDigits(itemToStr(it)).trim();
            return s === enStr || new RegExp(`(^|\\D)0?${enStr}(\\D|$)`).test(s);
          });
          if (matched) {
            triggerVeeValidate(wrap);
            return;
          }
        }

        let matchedNativeSelect = false;
        wrap.querySelectorAll('select:not(:disabled)').forEach(sel => {
          const opt = Array.from(sel.options).find(o => {
            const s = toEnDigits(`${o.value} ${o.textContent}`).trim();
            return s === enStr || new RegExp(`(^|\\D)0?${enStr}(\\D|$)`).test(s);
          });
          if (opt) {
            matchedNativeSelect = true;
            if (sel.value !== opt.value) {
              sel.value = opt.value;
              sel.dispatchEvent(new Event('change', { bubbles: true }));
            }
          }
        });
        if (matchedNativeSelect) return;

        const inp = wrap.querySelector('input[type="text"], input[type="number"], input[type="tel"], input:not([type]), textarea');
        if (!inp || inp.readOnly || inp.disabled || inp.type === 'radio' || inp.type === 'checkbox') return;

        setNativeInputValue(inp, enStr, vInst);
        triggerVeeValidate(wrap);
      };

      // A. Religion (ধর্ম *)
      if (/ধর্ম|religion/i.test(labelTxt)) {
        selectVuetifyItem(vInst, it => {
          if (typeof it === 'object' && it !== null) {
            return Number(it.id ?? it.value) === Number(religionId) || religionPattern.test(itemToStr(it));
          }
          return Number(it) === Number(religionId) || religionPattern.test(String(it));
        });
        wrap.querySelectorAll('select:not(:disabled)').forEach(sel => {
          const opt = Array.from(sel.options).find(o => Number(o.value) === Number(religionId) || religionPattern.test(o.textContent));
          if (opt && sel.value !== opt.value) {
            sel.value = opt.value;
            sel.dispatchEvent(new Event('change', { bubbles: true }));
          }
        });
        triggerVeeValidate(wrap);
      }

      // B. Khudro Nrigosthi
      if (/ক্ষুদ্র\s*নৃ\s*[-]?\s*গোষ্ঠী|নৃগোষ্ঠী|ethnic|tribal/.test(labelTxt)) {
        const wantYes = Number(isEthnic) === 1;
        const isMatchText = (t) => {
          const cleanT = String(t || '').replace(/\*/g, '').trim().toLowerCase();
          return wantYes ? (cleanT === 'হ্যাঁ' || cleanT === 'yes') : (cleanT === 'না' || cleanT === 'no');
        };
        selectVuetifyItem(vInst, it => isMatchText(itemToStr(it)));
        wrap.querySelectorAll('.v-radio').forEach(vRadEl => {
          const rLbl = (vRadEl.textContent || '').trim();
          const radVm = vRadEl.__vue__;
          const radVal = radVm ? radVm.value : vRadEl.querySelector('input')?.value;
          if (isMatchText(rLbl) || isMatchText(radVal)) {
            const inp = vRadEl.querySelector('input[type="radio"]');
            if (inp && !inp.disabled && !inp.checked) inp.click();
            const groupVm = (radVm && radVm.radioGroup) ? radVm.radioGroup : vInst;
            if (groupVm && radVal !== undefined) {
              if ('internalValue' in groupVm) groupVm.internalValue = radVal;
              groupVm.$emit('input', radVal);
              groupVm.$emit('change', radVal);
            }
          }
        });
        triggerVeeValidate(wrap);
      }

      // C. Location Type — match by the SITE's lookup id (sidepanel 1=rural
      // maps to site id 2=Upazila), with label text as fallback.
      if (/খানাটি\s*বা\s*বাসস্থানটি|বাসস্থানটি\s*কোথায়|বাসস্থানটি\s*কোথায়|খানাটি\s*কোথায়|খানাটি\s*কোথায়|কোথায়\s*অবস্থিত|কোথায়\s*অবস্থিত/.test(labelTxt) && !/এলাকার\s*ধরন/.test(labelTxt)) {
        const areaPattern = areaTypeId === 2 ? /পৌরসভা|pourashava|municipality/i : (areaTypeId === 3 ? /সিটি|city/i : /উপজেলা|upazila|পল্লী|ইউনিয়ন|ইউনিয়ন|rural|union/i);
        selectVuetifyItem(vInst, it => {
          if (typeof it === 'object' && it !== null) {
            return Number(it.id ?? it.value) === siteAreaTypeId || areaPattern.test(itemToStr(it));
          }
          return Number(it) === siteAreaTypeId || areaPattern.test(String(it));
        });
        triggerVeeValidate(wrap);
      }

      // D. Village / Road
      if (villageVal && /গ্রাম|রাস্তা|পাড়া|মহল্লা|বাসা|হোল্ডিং|village|road|street|house no/.test(labelTxt) && !/সদস্য|member|size|কোথায়|কোথায়|অবস্থিত/.test(labelTxt)) {
        fillNumericOrTextInput(villageVal);
      }

      // E. Ward No
      if (wardVal && /ওয়ার্ড|ওয়ার্ড|ward/.test(labelTxt)) {
        const cleanEn = String(parseInt(wardVal, 10) || wardVal);
        const padEn = cleanEn.padStart(2, '0');
        const numRegex = new RegExp(`(^|\\D)(${cleanEn}|${padEn})(\\D|$)`);
        const matchedDropdown = selectVuetifyItem(vInst, it => {
          const normStr = toEnDigits(itemToStr(it));
          return normStr.trim() === cleanEn || normStr.trim() === padEn || numRegex.test(normStr);
        });
        if (!matchedDropdown) fillNumericOrTextInput(cleanEn);
        triggerVeeValidate(wrap);
      }

      // F. Post Code
      if (postVal && /পোস্ট\s*কোড|পোষ্ট\s*কোড|পোস্ট\s*অফিস|ডাকঘর|post\s*code|postal\s*code|postcode|post_code|zip/i.test(labelTxt)) {
        fillNumericOrTextInput(postVal);
      }

      // G. Male Count
      if (/পুরুষ\s*সদস্য|পুরুষের\s*সংখ্যা|পুরুষ\s*সংখ্যা|কতজন\s*পুরুষ|^পুরুষ(\s*\*)?$|male\s*member|male\s*count|number\s*of\s*male|total\s*male/i.test(labelTxt) && !/মহিলা|নারী|female|লিঙ্গ/i.test(labelTxt)) {
        fillNumericOrTextInput(maleCount);
      }

      // H. Female Count
      if (/মহিলা\s*sদস্য|নারী\s*সদস্য|মহিলার\s*সংখ্যা|মহিলা\s*সংখ্যা|নারীর\s*সংখ্যা|নারী\s*সংখ্যা|কতজন\s*মহিলা|^(মহিলা|নারী)(\s*\*)?$|female\s*member|female\s*count|number\s*of\s*female|total\s*female/i.test(labelTxt) && !/লিঙ্গ/i.test(labelTxt)) {
        fillNumericOrTextInput(femaleCount);
      }

      // H2. Hijra / Third Gender Count (Default 0)
      if (/হিজড়া|হিজড়া|তৃতীয়\s*লিঙ্গ|তৃতীয়\s*লিঙ্গ|অন্যান্য\s*লিঙ্গ|hijra|third\s*gender|transgender|other\s*gender/i.test(labelTxt)) {
        fillNumericOrTextInput(otherGenderCount);
      }

      // H3. Bidesh / Probashi Member Count (Default 0 or না)
      if (/প্রবাসী|বিদেশ|বিদেশে|অভিবাসী|রেমিট্যান্স|রেমিটেন্স|bidesh|probashi|abroad|migrant|expatriate|remittance|foreign|overseas/i.test(labelTxt)) {
        const bVal = Number(bideshCount);
        const hasNoOption = vInst && Array.isArray(vInst.items) && vInst.items.some(it => /^(না|no)$/i.test(itemToStr(it).trim()));
        if (bVal === 0 && (hasNoOption || wrap.querySelector('.v-radio, input[type="radio"]'))) {
          selectVuetifyItem(vInst, it => /\b(না|no)\b|^0$/i.test(itemToStr(it).trim()));
          wrap.querySelectorAll('.v-radio').forEach(vRadEl => {
            const rLbl = (vRadEl.textContent || '').trim().toLowerCase();
            const radVm = vRadEl.__vue__;
            const radVal = radVm ? radVm.value : vRadEl.querySelector('input')?.value;
            if (rLbl === 'না' || rLbl === 'no' || String(radVal) === '0' || radVal === false) {
              const inp = vRadEl.querySelector('input[type="radio"]');
              if (inp && !inp.disabled && !inp.checked) inp.click();
            }
          });
          triggerVeeValidate(wrap);
        } else {
          fillNumericOrTextInput(bVal);
        }
      }

      // I. Children Under 18
      if (/খানার\s*শিশু\s*সংখ্যা|শিশু\s*সংখ্যা|শিশুর\s*সংখ্যা|১৮\s*বছরের\s*নিচে|কতজন\s*শিশু|number\s*of\s*children|children\s*count/i.test(labelTxt)) {
        fillNumericOrTextInput(childrenUnder18);
      }

      // J. Total Household Members
      if (/খানার\s*সদস্য\s*সংখ্যা|সদস্য\s*সংখ্যা|খানার\s*সদস্য|পরিবারের\s*সদস্য|total\s*member|family\s*size|house\s*size/i.test(labelTxt) && !/শিশু|child|পুরুষ|মহিলা|নারী|হিজড়া|প্রবাসী|male|female|hijra|migrant|abroad/i.test(labelTxt)) {
        fillNumericOrTextInput(totalMembers);
      }

      // K. Account Ownership -> Self (নিজ)
      if (/অ্যাকাউন্টের\s*মালিকানা|হিসাবের\s*মালিকানা|একাউন্টের\s*মালিকানা|মালিকানা|account\s*ownership|ownership/i.test(labelTxt)) {
        const wantNij = /নিজ|স্বীয়|স্বীয়|নিজের|self|own/i;
        selectVuetifyItem(vInst, it => {
          const matched = wantNij.test(itemToStr(it));
          if (matched && d && 'account_owner' in d) {
            const rawVal = (typeof it === 'object' && it !== null) ? (it.id ?? it.value ?? it) : it;
            setReactive(vmHead, d, 'account_owner', rawVal);
          }
          return matched;
        });
        triggerVeeValidate(wrap);
      }

      // L. Bank Branch Name — single-option auto-pick. The site's
      // enumerator-bank logic (applyEnumeratorBankSelection) NULLS
      // data.branch_name whenever the payment-processors list reloads
      // without preserveBranch, which happens AFTER autofill when the
      // contact/district data settles — so the pick used to show and
      // then get rejected. Write the model directly as well as driving
      // the select, and see syncSingleBranch/watchSingleBranch below,
      // which re-apply the pick until it sticks.
      if (/ব্যাংক\s*শাখা|শাখার\s*নাম|branch\s*name/i.test(labelTxt)) {
        if (vInst && Array.isArray(vInst.items) && !vInst.disabled && !vInst.readonly) {
          const validItems = vInst.items.filter(it => {
            if (typeof it === 'object' && it !== null) {
              const v = it.value ?? it.id ?? it.code;
              return v !== undefined && v !== null && String(v).trim() !== '';
            }
            return String(it ?? '').trim() !== '';
          });
          if (validItems.length === 1) {
            const branchId = optionItemId(vInst, validItems[0]);
            if (d && branchId !== undefined && branchId !== null && String(branchId).trim() !== '') {
              setReactive(vmHead, d, 'branch_name', branchId);
            }
            selectVuetifyItem(vInst, it => it === validItems[0]);
            triggerVeeValidate(wrap);
          }
        }
      }
    });
  }

  // Find the bank-branch select fresh from the DOM (label + model
  // expression), excluding the bank-district select ("জেলা শাখা").
  function findBranchControl() {
    let found = null;
    document.querySelectorAll('.v-input, .form-group, fieldset').forEach(wrap => {
      if (found || wrap.closest('#fc-floating-root')) return;
      if (!wrap.classList.contains('v-input') && wrap.querySelector('.v-input')) return;
      const vInst = getActiveVm(wrap);
      if (!vInst || !Array.isArray(vInst.items)) return;
      const expr = getModelExpression(vInst);
      if (/district/i.test(expr)) return;
      const labelTxt = getControlLabel(wrap);
      if (/application_pmt|allowance_program/.test(expr)) return;
      if (!/branch_name/.test(expr) && !/ব্যাংক\s*শাখা|শাখার\s*নাম|branch\s*name/i.test(labelTxt)) return;
      found = { wrap, vInst, labelTxt };
    });
    return found;
  }

  // If the branch list holds exactly one option and branch_name is
  // empty, select it (model write + select drive). Returns true when
  // it applied the pick.
  function syncSingleBranch(vmHead, headTarget) {
    const c = findBranchControl();
    if (!c || c.vInst.disabled || c.vInst.readonly) return false;
    const validItems = c.vInst.items.filter(it => {
      if (typeof it === 'object' && it !== null) {
        const v = it.value ?? it.id ?? it.code;
        return v !== undefined && v !== null && String(v).trim() !== '';
      }
      return String(it ?? '').trim() !== '';
    });
    if (validItems.length !== 1) return false;
    const current = headTarget ? headTarget.branch_name : undefined;
    const shown = c.vInst.internalValue ?? c.vInst.lazyValue;
    if (!isEmptyModelVal(current) && !isEmptyModelVal(shown)) return false;
    const branchId = optionItemId(c.vInst, validItems[0]);
    if (branchId === undefined || branchId === null || String(branchId).trim() === '') return false;
    if (headTarget) setReactive(vmHead, headTarget, 'branch_name', branchId);
    selectVuetifyItem(c.vInst, it => it === validItems[0]);
    triggerVeeValidate(c.wrap);
    return true;
  }

  // Background watcher: the site can null branch_name seconds after
  // autofill (payment-processors reload / enumerator-bank apply).
  // Re-apply the single-branch pick whenever it is empty again, until
  // the value sticks for 3 checks in a row or 30s pass. Never touches
  // anything when the branch list has more than one option, and never
  // overwrites a value the user picked.
  // "তথ্য সংগ্রহের ঠিকানা একই হলে ক্লিক করুন" — checking it runs the
  // site's copySameAsPermanent(), copying addressForm.permanent_* into
  // the collection address fields. It is a checkbox, not an option
  // field: click it AT MOST ONCE per autofill run, and only when it is
  // unchecked, the collection address is empty, and the permanent
  // address has something to copy — never overwrites an entered
  // (different) collection address. Clicking the real input fires the
  // site's own change handler, including its cascade reloads.
  let sameAsPermanentClickedThisRun = false;
  function syncSameAsPermanent(allVms) {
    if (sameAsPermanentClickedThisRun) return false;
    let boxWrap = null;
    document.querySelectorAll('.v-input').forEach(wrap => {
      if (boxWrap || wrap.closest('#fc-floating-root')) return;
      if (/তথ্য সংগ্রহের ঠিকানা একই|information collection address is the same/i.test(wrap.textContent || '')) boxWrap = wrap;
    });
    if (!boxWrap) return false;
    const owner = (allVms || []).find(v => v && v.addressForm) || null;
    const af = owner ? owner.addressForm : null;
    if (!af) return false;
    const vInst = getActiveVm(boxWrap);
    if (!vInst || vInst.disabled || vInst.readonly) return false;
    const inp = boxWrap.querySelector('input[type="checkbox"]');
    // Already checked? Check every signal: the checkbox VM, the DOM
    // input, and the owner's sameAsPermanent model flag.
    const alreadyChecked = (vInst.internalValue ?? vInst.lazyValue ?? vInst.inputValue)
      || (inp && inp.checked)
      || owner.sameAsPermanent === true;
    if (alreadyChecked) return false;
    const collEmpty = ['division_id', 'district_id', 'thana_id', 'union_id', 'pouro_id', 'city_id', 'post_code', 'address']
      .every(k => isEmptyModelVal(af[k]));
    const permFilled = ['permanent_division_id', 'permanent_district_id', 'permanent_thana_id', 'permanent_union_id', 'permanent_pouro_id', 'permanent_city_id', 'permanent_post_code', 'permanent_address']
      .some(k => !isEmptyModelVal(af[k]));
    if (!collEmpty || !permFilled) return false;
    if (inp && !inp.disabled) { sameAsPermanentClickedThisRun = true; inp.click(); return true; }
    return false;
  }

  // Watcher timers from the current run. A second click must cancel
  // the previous run's watchers first — otherwise each click adds
  // another watcher set and an already-filled form keeps refilling.
  const activeWatchTimers = new Set();
  function registerWatchTimer(t) { activeWatchTimers.add(t); return t; }
  function clearActiveWatchTimers() {
    for (const t of activeWatchTimers) { try { clearInterval(t); } catch (_) {} }
    activeWatchTimers.clear();
  }

  function watchSingleBranch() {
    let stuckPolls = 0;
    let seenControl = false;
    const t0 = Date.now();
    const timer = registerWatchTimer(setInterval(() => {
      try {
        // Keep watching until the value sticks, up to ~30s: on a slow
        // connection the site's data/rebuilds can land late.
        if (Date.now() - t0 > 30000) { clearInterval(timer); return; }
        const { vmHead, } = getVueNodes();
        const headTarget = getHeadTargetObj(vmHead);
        const c = findBranchControl();
        if (!c) {
          // No branch field at all (e.g. MFS account, or the section
          // never rendered): stop watching after a grace period.
          if (!seenControl && Date.now() - t0 > 10000) clearInterval(timer);
          return;
        }
        seenControl = true;
        const current = headTarget ? headTarget.branch_name : undefined;
        if (!isEmptyModelVal(current)) {
          if (++stuckPolls >= 3) clearInterval(timer);
          return;
        }
        stuckPolls = 0;
        syncSingleBranch(vmHead, headTarget);
      } catch (_) {}
    }, 500));
  }

  function syncAllGenderAndReligionSelects(headGenderId, memberList, row0IsHead, familyReligionId, isVerificationPage) {
    if (isVerificationPage) return;
    const genderSelectVms = [];
    const relationSelectVms = [];
    const religionSelectVms = [];

    document.querySelectorAll('.v-input, .form-group').forEach(wrap => {
      if (wrap.closest('#fc-floating-root')) return;
      if (!wrap.classList.contains('v-input') && wrap.querySelector('.v-input')) return;
      const lbl = getControlLabel(wrap);
      const vInst = getActiveVm(wrap);
      if (!vInst) return;

      if (/^লিঙ্গ|লিঙ্গ\s*\*|gender|sex/i.test(lbl) && !/সংখ্যা|count|তৃতীয়|হিজড়া/i.test(lbl)) {
        if (!genderSelectVms.some(g => g.vInst === vInst)) genderSelectVms.push({ wrap, vInst });
      } else if (/সম্পর্ক|relation/i.test(lbl)) {
        if (!relationSelectVms.some(r => r.vInst === vInst)) relationSelectVms.push({ wrap, vInst });
      } else if (/ধর্ম|religion/i.test(lbl)) {
        if (!religionSelectVms.some(r => r.vInst === vInst)) religionSelectVms.push({ wrap, vInst });
      }
    });

    const matchGenderItem = (gid) => (it) => {
      const s = itemToStr(it).toLowerCase();
      if (typeof it === 'object' && it !== null && Number(it.id ?? it.value) === Number(gid)) return true;
      if (isFemaleGenderId(gid)) return /মহিলা|নারী|female/i.test(s);
      if (Number(gid) === GENDER_MALE || Number(gid) === 1) return /পুরুষ|male/i.test(s) && !/female/i.test(s);
      return /অন্যান্য|হিজড়া|হিজড়া|other|third|transgender/i.test(s);
    };

    const matchReligionItem = (rid) => (it) => {
      const s = itemToStr(it).toLowerCase();
      const nrid = normalizeReligionId(rid);
      if (typeof it === 'object' && it !== null && Number(it.id ?? it.value) === nrid) return true;
      if (nrid === 96) return /ইসলাম|islam|muslim/i.test(s);
      if (nrid === 97) return /হিন্দু|hindu|সনাতন/i.test(s);
      if (nrid === 98) return /বৌদ্ধ|buddh/i.test(s);
      if (nrid === 99) return /খ্রিস্টান|খ্রীষ্টান|christ/i.test(s);
      if (nrid === 100) return /অন্যান্য|other/i.test(s);
      return false;
    };

    if (genderSelectVms.length > 0) {
      let startIdx = 0;
      if (!row0IsHead && genderSelectVms.length > memberList.length) {
        const headEntry = genderSelectVms[0];
        if (!headEntry.wrap.closest('.bg-gray-cursor-not-allowed')) {
          selectVuetifyItem(headEntry.vInst, matchGenderItem(headGenderId));
          triggerVeeValidate(headEntry.wrap);
        }
        startIdx = 1;
      }
      memberList.forEach((m, idx) => {
        const targetEntry = genderSelectVms[startIdx + idx];
        if (!targetEntry || targetEntry.wrap.closest('.bg-gray-cursor-not-allowed')) return;
        const gid = resolveGenderId(m);
        selectVuetifyItem(targetEntry.vInst, matchGenderItem(gid));
        triggerVeeValidate(targetEntry.wrap);
      });
    }

    if (relationSelectVms.length > 0) {
      memberList.forEach((m, idx) => {
        const targetEntry = relationSelectVms[idx];
        if (!targetEntry || targetEntry.wrap.closest('.bg-gray-cursor-not-allowed')) return;
        const gid = resolveGenderId(m);
        let relName = m.relation;
        if (!relName || relName === 'Auto' || !RELATION_ID_MAP[relName]) {
          relName = isFemaleGenderId(gid) ? 'Daughter' : 'Son';
        }
        const relId = Number(m.relationship_id || RELATION_ID_MAP[relName] || (isFemaleGenderId(gid) ? 161 : 160));
        selectVuetifyItem(targetEntry.vInst, it => {
          if (typeof it === 'object' && it !== null && Number(it.id ?? it.value) === relId) return true;
          return itemToStr(it).toLowerCase().includes(relName.toLowerCase());
        });
        triggerVeeValidate(targetEntry.wrap);
      });
    }

    if (religionSelectVms.length > 0) {
      religionSelectVms.forEach(entry => {
        selectVuetifyItem(entry.vInst, matchReligionItem(familyReligionId));
        triggerVeeValidate(entry.wrap);
      });
    }
  }

  /* =====================================================================
   * OPTION AUTOFILL — the dropdowns / radios this injector used to skip.
   * Added 2026-11-17 after reading the site's own app.js bundle.
   *
   * Member rows (familyMembers): literacy_id, education_status_id,
   * is_currently_student, livelihood_profession_id, health_condition_id,
   * disability_type_id, is_ssnp_covered,
   * is_dss_training_or_financial_benefit, facilities_ids.
   * Head form (data.* / form.*): education_status, profession,
   * marital_status (+ spouse name), plus single-item auto-pick for the
   * address cascade selects (division/district/thana/union/ward/...).
   *
   * How it works: option lists come from the site's API at runtime. The
   * ids in LOOKUP_IDS below are the REAL ids from that API
   * (GET getApplicationPageData, captured 2026-11-12, cross-checked
   * against a saved draft), so matching is id-first: we verify the id
   * exists in the live `items` array, then write it into the Vue row
   * model. If the API ever renumbers an option, the label-text patterns
   * (value_bn/value_en) are the fallback. Rendered selects update
   * themselves through reactivity.
   *
   * DEFAULTS ARE OVERRIDABLE via payload.form_defaults:
   *   form_defaults.member_options = {
   *     literacy_id: 241, education_status_id: 190, livelihood_profession_id: 214,
   *     health_condition_id: 203, maritial_status_id: 101, disability_type_id: 247,
   *     is_currently_student: 0, is_ssnp_covered: 0,
   *     is_dss_training_or_financial_benefit: 0, facilities_ids: [162]
   *   }
   *   form_defaults.head_options = { education_status: 190, profession: 150, marital_status: 101 }
   * A numeric id wins over the defaults. A string is treated as an extra
   * text pattern tried FIRST (disability/facility names also match a
   * keyword table). Set a key to null/false to leave it unfilled.
   * ===================================================================== */

  // Real lookup ids from getApplicationPageData (lookup types in comments).
  const LOOKUP_IDS = {
    literacy: { yes: 241, readOnly: 242, no: 243 }, // type 45
    // type 8 — education status (members + head)
    education: { none: 88, prePrimary: 188, class1: 189, class1to4: 190, class5: 191, class6to7: 192, jsc: 89, class9: 193, ssc: 90, hsc: 91, graduate: 92, pg: 93 },
    // type 44 — member livelihood/profession
    livelihood: { agriculture: 210, business: 211, privateJob: 212, govtJob: 213, dayLabourer: 214, garment: 215, rickshaw: 216, transport: 217, hotel: 218, domestic: 219, student: 220, apprentice: 221, unemployed: 222, retired: 223, elderlySick: 224, homemaker: 225, childNA: 275, others: 226 },
    // type 34 — head profession (DIFFERENT list from livelihood!)
    profession: { labourer: 109, housewife: 181, dayLabourer: 150, farmer: 151, business: 149, service: 107, student: 106, unemployed: 108, others: 110 },
    marital: { married: 101, unmarried: 102, widow: 103, separated: 104, divorced: 244, maritalSeparated: 245, widower: 276 }, // type 32
    health: { fit: 203, completelyDisabled: 204, partiallyAble: 205, disabled: 206 }, // type 43
    // type 11 — disability types
    disabilityType: { physical: 247, visual: 248, hearing: 249, speech: 250, intellectual: 251, mental: 252, autism: 253, deafBlind: 254, cerebral: 255, multi: 256, down: 257, others: 258 },
    // type 42 — government facilities/cards
    facility: { welfareCard: 162, vgfVgd: 163, ration: 164, fertilizer: 165, tcb: 166, freedomFighter: 167, scholarship: 168, migrant: 169, pension: 170, agriculture: 171, fishermen: 172, noCard: 185 },
    accountOwner: { myself: 142, familyMember: 143, closeRelative: 144, others: 148 } // type 37
  };

  // Keyword -> id for string overrides on disability_type_id / facilities_ids.
  const DISABILITY_TYPE_KEYWORDS = [
    [/শারীরিক|physical/i, 247], [/দৃষ্টি|visual|blind|eye/i, 248], [/শ্রবণ|hearing|deaf/i, 249],
    [/বাক|speech|mute/i, 250], [/বুদ্ধি|intellectual/i, 251], [/মানসিক|mental/i, 252],
    [/অটিজম|autism/i, 253], [/শ্রবণ-দৃষ্টি|deaf.?blind/i, 254], [/মস্তিষ্ক|cerebral/i, 255],
    [/বহুমাত্রিক|multiple|multi/i, 256], [/ডাউন|down/i, 257], [/অন্যান্য|other/i, 258]
  ];
  const FACILITY_KEYWORDS = [
    [/সমাজসেবা|ভাতা কার্ড|welfare|allowance/i, 162], [/ভিজিএফ|ভিজিডি|vgf|vgd/i, 163],
    [/রেশন|ration/i, 164], [/সার|fertilizer/i, 165], [/টিসিবি|tcb/i, 166],
    [/মুক্তিযোদ্ধা|freedom fighter|muktijoddha/i, 167], [/উপবৃত্তি|scholarship/i, 168],
    [/প্রবাসী|migrant/i, 169], [/পেনশন|pension/i, 170], [/কৃষি|agriculture/i, 171],
    [/মৎস্যজীবী|fishermen|fisher/i, 172], [/কোন কার্ড নাই|no card/i, 185]
  ];
  function keywordToId(str, table) {
    const s = String(str || '');
    for (const [re, id] of table) if (re.test(s)) return id;
    return null;
  }

  // Label-text fallback patterns (used only when the id is not found in
  // the live items). Kept in sync with the real API labels.
  const OPTION_PATTERNS = {
    literacyYes: [/পড়তে ও লিখতে পারেন|পড়তে.*লিখতে.*পার/i, /able to read and write/i],
    literacyNo: [/কোনোটিই পারেন না|পারেন? না/i, /cannot read or write/i],
    educationNone: [/নিরক্ষর|শিক্ষা প্রতিষ্ঠানে যায়নি|illiterate/i],
    educationPrePrimary: [/প্রাক-প্রাথমিক|প্রাক|pre.?primary|play|nursery|kg/i],
    educationClass1to4: [/১ম–৪র্থ|১ম-৪র্থ|class 1-4/i, /১ম শ্রেণি|class 1\b/i],
    educationClass5: [/৫ম|পিইসি|ইবতেদায়ী|class 5|psc|ebtedayi/i],
    educationClass6to7: [/৬ষ্ঠ|৭ম|class 6-7/i],
    educationJsc: [/অষ্টম|জেএসসি|জেডিসি|8th|jsc|jdc/i],
    educationClass9: [/৯ম|class 9/i],
    educationSsc: [/এসএসসি|দাখিল|ssc|dakhil|o-level/i],
    educationHsc: [/এইচএসসি|আলিম|hsc|alim|a-level/i],
    educationGraduate: [/স্নাতক(?!োত্তর)/i, /(?<!post )graduate/i],
    educationPg: [/স্নাতকোত্তর|কামিল|post.?graduate/i],
    livelihoodChild: [/প্রযোজ্য নয়|not applicable/i, /শিশু|child/i],
    livelihoodStudent: [/ছাত্র|ছাত্রী|শিক্ষার্থী|student/i],
    livelihoodHousewife: [/গৃহিণী|গৃহীনি|homemaker|house.?wife/i],
    livelihoodMale: [/দিনমজুর|day labo/i, /কৃষিকাজ|agricultur|farm/i, /শ্রমিক|labou?r|worker/i],
    professionHousewife: [/গৃহীনি|গৃহিণী|house.?wife/i],
    professionMale: [/দিনমজুর|day labo/i, /কৃষিকাজ|farm/i, /শ্রমজীবী|labou?r/i],
    maritalUnmarried: [/অবিবাহিত|unmarried|single/i],
    maritalMarried: [/বিবাহিত|married/i],
    maritalWidow: [/বিধবা|বিপত্নীক|widow/i],
    healthFit: [/কর্মক্ষম|সুস্থ|able-bodied|healthy|fit/i],
    healthUnfit: [/প্রতিবন্ধী|person with disability/i, /সম্পূর্ণ অক্ষম|completely disabled/i]
  };

  const MARRIED_RELATIONS = ['Husband', 'Wife', 'Father', 'Mother', 'Father-in-law', 'Mother-in-law', 'Son-in-law', 'Daughter-in-law'];

  function matchOptionItem(vInst, patterns, excludes = []) {
    if (!vInst || !Array.isArray(vInst.items) || !vInst.items.length) return null;
    for (const pat of patterns) {
      const found = vInst.items.find(it => {
        const s = toEnDigits(itemToStr(it));
        if (excludes.some(ex => ex.test(s))) return false;
        return pat.test(s);
      });
      if (found !== undefined) return found;
    }
    return null;
  }

  function optionItemId(vInst, item) {
    if (item === null || item === undefined) return undefined;
    if (typeof item !== 'object') return item;
    if (!vInst || vInst.returnObject) return item;
    const valKey = (typeof vInst.itemValue === 'string' && vInst.itemValue in item) ? vInst.itemValue : null;
    return valKey ? item[valKey] : (item.value ?? item.id ?? item.code ?? item);
  }

  // Resolve a choice for one select field: numeric override id wins, then
  // a string override (keyword/pattern), then the preferred real ids
  // (verified to exist in the live items), then label-text patterns.
  // Returns { id, item } or null when nothing matched.
  function resolveOptionChoice(vInst, overrideVal, patterns, excludes = [], preferredIds = []) {
    if (overrideVal === null || overrideVal === false) return null;
    if (typeof overrideVal === 'number' || (typeof overrideVal === 'string' && /^\d+$/.test(overrideVal.trim()))) {
      return { id: Number(overrideVal), item: null };
    }
    if (typeof overrideVal === 'string' && overrideVal.trim()) {
      const esc = overrideVal.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const byOverride = matchOptionItem(vInst, [new RegExp(esc, 'i')], excludes);
      if (byOverride) return { id: optionItemId(vInst, byOverride), item: byOverride };
    }
    // Id-first: only accept an id that is actually present in the live list.
    if (Array.isArray(preferredIds) && preferredIds.length && vInst && Array.isArray(vInst.items)) {
      for (const wantId of preferredIds) {
        const found = vInst.items.find(it => Number(optionItemId(vInst, it)) === Number(wantId));
        if (found !== undefined) {
          const s = toEnDigits(itemToStr(found));
          if (!excludes.some(ex => ex.test(s))) return { id: optionItemId(vInst, found), item: found };
        }
      }
    }
    const item = matchOptionItem(vInst, patterns, excludes);
    if (!item) return null;
    return { id: optionItemId(vInst, item), item };
  }

  function getModelExpression(vInst) {
    try {
      const m = vInst && vInst.$vnode && vInst.$vnode.data && vInst.$vnode.data.model;
      if (m && m.expression) return String(m.expression).replace(/\s+/g, ' ').trim();
    } catch (_) {}
    return '';
  }

  function isEmptyModelVal(v) {
    return v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0);
  }

  // Wait (bounded) until every collected select has its API items loaded.
  async function waitForOptionItems(controls, timeoutMs = 3000) {
    const t0 = Date.now();
    for (;;) {
      const pending = controls.filter(c => c.isSelect && (!Array.isArray(c.vInst.items) || !c.vInst.items.length));
      if (!pending.length || Date.now() - t0 > timeoutMs) return;
      await new Promise(r => setTimeout(r, 150));
    }
  }

  // Why autofill used to need TWO clicks: the site loads its dropdown
  // data (lookups, PMT) over the network in created()/bootPage(),
  // renders expansion-panel content lazily, and may overwrite the
  // form models when its draft load() finishes. A first click that
  // runs before all that settles fills only the models; the DOM
  // passes find unmounted panels / empty option lists, so the user
  // had to click again once everything had loaded. Wait here until
  // the rendered controls stop growing AND some lookup data exists
  // AND no loading flag is set — bounded, so a slow page only costs
  // a few seconds, never a hang.
  async function waitForFormReady(vmHead, vmMembers, timeoutMs = 5000) {
    const t0 = Date.now();
    let lastCount = -1, stablePolls = 0;
    for (;;) {
      const count = document.querySelectorAll('.v-input').length;
      if (count === lastCount) stablePolls++;
      else { stablePolls = 0; lastCount = count; }

      let dataReady = false;
      for (const vm of [vmHead, vmMembers]) {
        if (!vm) continue;
        for (const k of ['family_relationships', 'family_gov_facilities', 'educationalStatus', 'lookups', 'programs', 'PMTVariables', 'injuryType', 'classes']) {
          if (Array.isArray(vm[k]) && vm[k].length) { dataReady = true; break; }
        }
        if (dataReady) break;
      }
      if (!dataReady) {
        const wraps = document.querySelectorAll('.v-input');
        for (const w of wraps) {
          const v = w.__vue__;
          if (v && Array.isArray(v.items) && v.items.length) { dataReady = true; break; }
        }
      }
      let stillLoading = false;
      for (const vm of [vmHead, vmMembers]) {
        if (vm && vm.loading === true) { stillLoading = true; break; }
      }
      if (!stillLoading && dataReady && stablePolls >= 2) return true;
      if (Date.now() - t0 > timeoutMs) return false;
      await new Promise(r => setTimeout(r, 150));
    }
  }

  // Collect every rendered v-select / v-radio-group on the form, with the
  // Vue model expression each one is bound to (e.g. "member.livelihood_profession_id",
  // "data.education_status", "addressForm.union_id").
  function collectOptionControls() {
    const controls = [];
    const seen = new Set();
    document.querySelectorAll('.v-input, .form-group, fieldset').forEach(wrap => {
      if (wrap.closest('#fc-floating-root')) return;
      if (!wrap.classList.contains('v-input') && wrap.querySelector('.v-input')) return;
      const vInst = getActiveVm(wrap);
      if (!vInst || seen.has(vInst)) return;
      seen.add(vInst);
      const tag = String(vInst.$options?._componentTag || vInst.$options?.name || '').toLowerCase();
      const isSelect = Array.isArray(vInst.items);
      const isRadio = tag.includes('radio-group');
      if (!isSelect && !isRadio) return;
      controls.push({ wrap, vInst, expr: getModelExpression(vInst), label: getControlLabel(wrap), isSelect, isRadio });
    });
    return controls;
  }

  function classifyControl(c) {
    const expr = c.expr || '';
    const m = expr.match(/^(member|data|form|addressForm)\.(.+)$/);
    if (m) return { scope: m[1], key: m[2] };
    // Fallback: label-based classification when the expression is unavailable.
    const lbl = c.label || '';
    if (/পড়তে\s*লিখতে|able to read/i.test(lbl)) return { scope: 'member', key: 'literacy_id' };
    if (/শিক্ষার্থী|currently student/i.test(lbl)) return { scope: 'member', key: 'is_currently_student' };
    if (/জীবিকা|livelihood/i.test(lbl)) return { scope: 'member', key: 'livelihood_profession_id' };
    if (/স্বাস্থ্য\s*অবস্থা|health condition/i.test(lbl)) return { scope: 'member', key: 'health_condition_id' };
    if (/প্রতিবন্ধিতার\s*ধরণ|disability type/i.test(lbl)) return { scope: 'member', key: 'disability_type_id' };
    if (/সামাজিক\s*নিরাপত্তা|social safety/i.test(lbl)) return { scope: 'member', key: 'is_ssnp_covered' };
    if (/সমাজসেবা\s*অধিদপ্তর|department of social services/i.test(lbl)) return { scope: 'member', key: 'is_dss_training_or_financial_benefit' };
    if (/সরকারি\s*কার্ড|member_facility|facilities/i.test(lbl)) return { scope: 'member', key: 'facilities_ids' };
    if (/শিক্ষা|education/i.test(lbl)) return { scope: 'member', key: 'education_status_id' };
    if (/বৈবাহিক|marital/i.test(lbl)) return { scope: 'member', key: 'maritial_status_id' };
    if (/পেশা|profession/i.test(lbl)) return { scope: 'head', key: 'profession' };
    return { scope: '', key: '' };
  }

  function clickRadioValue(wrap, vInst, wantVal) {
    let clicked = false;
    wrap.querySelectorAll('.v-radio').forEach(rEl => {
      const radVm = rEl.__vue__;
      const radVal = radVm ? radVm.value : rEl.querySelector('input')?.value;
      if (radVal !== undefined && Number(radVal) === Number(wantVal)) {
        const inp = rEl.querySelector('input[type="radio"]');
        if (inp && !inp.disabled && !inp.checked) { inp.click(); clicked = true; }
      }
    });
    if (!clicked && vInst) {
      try {
        if ('internalValue' in vInst) vInst.internalValue = wantVal;
        if ('lazyValue' in vInst) vInst.lazyValue = wantVal;
        vInst.$emit('input', wantVal);
        vInst.$emit('change', wantVal);
      } catch (_) {}
    }
    return clicked;
  }

  function memberOptionPatterns(m, age, genderId, hasSpouseInHousehold) {
    const relName = m.relation || '';
    const isChild = age !== null && age < 18;
    const isLittleChild = age !== null && age < 4;
    // Student age for profession/livelihood: 4-24 covers pre-primary
    // through school, HSC, honours and masters. Kept separate from
    // isChild so marital status still treats only under-18s as unmarried.
    const isStudentAge = age !== null && age >= 4 && age <= 24;
    const female = isFemaleGenderId(genderId);
    const E = LOOKUP_IDS.education, L = LOOKUP_IDS.livelihood, P = LOOKUP_IDS.profession;

    let literacy = null, literacyIds = [];
    if (age !== null) {
      literacy = age < 5 ? OPTION_PATTERNS.literacyNo : OPTION_PATTERNS.literacyYes;
      literacyIds = age < 5 ? [LOOKUP_IDS.literacy.no] : [LOOKUP_IDS.literacy.yes];
    }

    // Education by age band, using the real type-8 ids. Student ages
    // 18-24 follow the study ladder (HSC -> Graduate -> Post Graduate);
    // age 25+ defaults to Class 1-4 (190) — override via form_defaults
    // if the real level is known.
    let education = null, educationIds = [];
    if (age !== null) {
      if (age < 3) { education = OPTION_PATTERNS.educationNone; educationIds = [E.none]; }
      else if (age <= 5) { education = OPTION_PATTERNS.educationPrePrimary; educationIds = [E.prePrimary, E.none]; }
      else if (age === 6) { education = OPTION_PATTERNS.educationClass1to4; educationIds = [E.class1, E.class1to4]; }
      else if (age <= 10) { education = OPTION_PATTERNS.educationClass1to4; educationIds = [E.class1to4]; }
      else if (age === 11) { education = OPTION_PATTERNS.educationClass5; educationIds = [E.class5, E.class1to4]; }
      else if (age <= 13) { education = OPTION_PATTERNS.educationClass6to7; educationIds = [E.class6to7, E.class5]; }
      else if (age === 14) { education = OPTION_PATTERNS.educationJsc; educationIds = [E.jsc, E.class6to7]; }
      else if (age === 15) { education = OPTION_PATTERNS.educationClass9; educationIds = [E.class9, E.jsc]; }
      else if (age < 18) { education = OPTION_PATTERNS.educationSsc; educationIds = [E.ssc, E.class9]; }
      else if (age <= 19) { education = OPTION_PATTERNS.educationHsc; educationIds = [E.hsc, E.ssc]; }
      else if (age <= 22) { education = OPTION_PATTERNS.educationGraduate; educationIds = [E.graduate, E.hsc]; }
      else if (age <= 24) { education = OPTION_PATTERNS.educationPg; educationIds = [E.pg, E.graduate]; }
      else { education = OPTION_PATTERNS.educationClass1to4; educationIds = [E.class1to4, E.none]; }
    }

    let livelihood = null, livelihoodIds = [];
    if (isLittleChild) { livelihood = OPTION_PATTERNS.livelihoodChild; livelihoodIds = [L.childNA, L.others]; }
    else if (isStudentAge) { livelihood = OPTION_PATTERNS.livelihoodStudent; livelihoodIds = [L.student]; }
    else if (female) { livelihood = OPTION_PATTERNS.livelihoodHousewife; livelihoodIds = [L.homemaker]; }
    else { livelihood = OPTION_PATTERNS.livelihoodMale; livelihoodIds = [L.dayLabourer, L.agriculture, L.others]; }

    // Head profession uses the DIFFERENT type-34 list.
    let profession = null, professionIds = [];
    if (isLittleChild) { profession = OPTION_PATTERNS.livelihoodChild; professionIds = [P.others]; }
    else if (isStudentAge) { profession = OPTION_PATTERNS.livelihoodStudent; professionIds = [P.student]; }
    else if (female) { profession = OPTION_PATTERNS.professionHousewife; professionIds = [P.housewife]; }
    else { profession = OPTION_PATTERNS.professionMale; professionIds = [P.dayLabourer, P.farmer, P.labourer, P.others]; }

    let marital = null, maritalIds = [];
    let maritalExcludes = [];
    if (isChild) {
      marital = OPTION_PATTERNS.maritalUnmarried;
      maritalIds = [LOOKUP_IDS.marital.unmarried];
    } else if (relName === 'Head/Self' && !hasSpouseInHousehold) {
      // Widow is gendered on the site: বিধবা (103) for women, বিপত্নীক (276) for men.
      marital = OPTION_PATTERNS.maritalWidow;
      maritalIds = female ? [LOOKUP_IDS.marital.widow] : [LOOKUP_IDS.marital.widower];
    } else if (MARRIED_RELATIONS.includes(relName) || relName === 'Head/Self') {
      marital = OPTION_PATTERNS.maritalMarried;
      maritalIds = [LOOKUP_IDS.marital.married];
      // "বিবাহিত" is a substring of "অবিবাহিত" — exclude the unmarried
      // option when we actually want Married.
      maritalExcludes = [/অবিবাহিত|unmarried/i];
    } else {
      marital = OPTION_PATTERNS.maritalUnmarried;
      maritalIds = [LOOKUP_IDS.marital.unmarried];
    }

    const isDisabled = Number(m.is_disabled) === 1 || Number(m.is_member_disabled) === 1;
    const health = isDisabled ? OPTION_PATTERNS.healthUnfit : OPTION_PATTERNS.healthFit;
    const healthIds = isDisabled
      ? [LOOKUP_IDS.health.disabled, LOOKUP_IDS.health.completelyDisabled]
      : [LOOKUP_IDS.health.fit];
    const healthExcludes = isDisabled ? [] : [/অক্ষম|আংশিক|অসুস্থ|unable|disabled/i];

    return { literacy, literacyIds, education, educationIds, livelihood, livelihoodIds, profession, professionIds, marital, maritalIds, maritalExcludes, health, healthIds, healthExcludes, isDisabled };
  }

  // Fill every option control the old injector skipped. `memberRows` are the
  // live Vue row objects (same order as targetMemberList). `headMember` is
  // the payload head (for age/gender/relation-aware head defaults).
  // Returns an array of human-readable "not filled" notes for the result message.
  async function syncOptionSelects(vmHead, vmMembers, memberRows, targetMemberList, headTarget, headMember, defs, onlyEmpty) {
    const unfilled = [];
    const memberOverrides = (defs && defs.member_options) || {};
    const headOverrides = (defs && defs.head_options) || {};

    const controls = collectOptionControls();
    await waitForOptionItems(controls);

    // Index rendered controls by (scope, key) in DOM order.
    const byField = new Map();
    controls.forEach(c => {
      const { scope, key } = classifyControl(c);
      if (!scope || !key) return;
      const mapKey = scope + '.' + key;
      if (!byField.has(mapKey)) byField.set(mapKey, []);
      byField.get(mapKey).push(c);
    });

    const firstSelectFor = (scope, key) => {
      const list = byField.get(scope + '.' + key) || [];
      return list.find(c => c.isSelect) || null;
    };

    const hasSpouseInHousehold = targetMemberList.some(mm => mm.relation === 'Husband' || mm.relation === 'Wife');

    // ---- Member selects: resolve the id once per field, write into each row.
    const memberSelectFields = [
      { key: 'literacy_id', patternsOf: (p) => p.literacy, excludesOf: () => [], idsOf: (p) => p.literacyIds },
      { key: 'education_status_id', patternsOf: (p) => p.education, excludesOf: () => [], idsOf: (p) => p.educationIds },
      { key: 'livelihood_profession_id', patternsOf: (p) => p.livelihood, excludesOf: () => [], idsOf: (p) => p.livelihoodIds },
      { key: 'health_condition_id', patternsOf: (p) => p.health, excludesOf: (p) => p.healthExcludes, idsOf: (p) => p.healthIds },
      { key: 'maritial_status_id', patternsOf: (p) => p.marital, excludesOf: (p) => p.maritalExcludes, idsOf: (p) => p.maritalIds },
      { key: 'disability_type_id', patternsOf: () => [], excludesOf: () => [], idsOf: () => [] }
    ];

    for (const field of memberSelectFields) {
      const sample = firstSelectFor('member', field.key);
      if (!sample) continue; // field not rendered anywhere (e.g. no disabled member)
      for (let idx = 0; idx < targetMemberList.length; idx++) {
        const m = targetMemberList[idx];
        const row = memberRows[idx];
        if (!row) continue;
        if (field.key === 'disability_type_id' && Number(row.is_member_disabled) !== 1) continue;
        if (onlyEmpty && !isEmptyModelVal(row[field.key])) continue;
        const age = calculateAgeYears(m.dob);
        const genderId = resolveGenderId(m);
        const pats = memberOptionPatterns(m, age, genderId, hasSpouseInHousehold);
        const patterns = field.patternsOf(pats) || [];
        let overrideVal = memberOverrides[field.key] ?? m[field.key] ?? m[field.key.replace(/_id$/, '')];
        // String disability type ("physical", "শারীরিক") -> real id.
        if (field.key === 'disability_type_id' && typeof overrideVal === 'string' && overrideVal.trim() && !/^\d+$/.test(overrideVal.trim())) {
          const kid = keywordToId(overrideVal, DISABILITY_TYPE_KEYWORDS);
          if (kid) overrideVal = kid;
        }
        const choice = resolveOptionChoice(sample.vInst, overrideVal, patterns, field.excludesOf(pats), field.idsOf(pats));
        if (choice && choice.id !== undefined) {
          // Already correct: don't re-write (avoids re-driving a
          // filled form on every click).
          if (String(row[field.key] ?? '') !== String(choice.id)) setReactive(vmMembers, row, field.key, choice.id);
        } else if (field.key !== 'disability_type_id') {
          unfilled.push(`Member ${idx + 1}: ${field.key}`);
        } else {
          unfilled.push(`Member ${idx + 1}: disability_type_id (disabled — type unknown)`);
        }
      }
      // Fire input/change on the rendered selects so validation picks the
      // new model values up. Only safe 1:1 when counts match.
      const rendered = byField.get('member.' + field.key) || [];
      if (rendered.length === targetMemberList.length) {
        rendered.forEach((c, idx) => {
          const row = memberRows[idx];
          if (!row || isEmptyModelVal(row[field.key])) return;
          const want = String(row[field.key]);
          selectVuetifyItem(c.vInst, it => String(optionItemId(c.vInst, it)) === want);
          triggerVeeValidate(c.wrap);
        });
      } else {
        rendered.forEach(c => triggerVeeValidate(c.wrap));
      }
    }

    // ---- Member radios: model first (0/1 are known), click where mapping is safe.
    const memberRadioFields = [
      { key: 'is_currently_student', valueOf: (m) => { const a = calculateAgeYears(m.dob); return (a !== null && a >= 4 && a <= 24) ? 1 : 0; } },
      { key: 'is_ssnp_covered', valueOf: () => 0 },
      { key: 'is_dss_training_or_financial_benefit', valueOf: () => 0 }
    ];
    for (const field of memberRadioFields) {
      const rendered = byField.get('member.' + field.key) || [];
      for (let idx = 0; idx < targetMemberList.length; idx++) {
        const m = targetMemberList[idx];
        const row = memberRows[idx];
        if (!row) continue;
        const overrideVal = memberOverrides[field.key];
        const val = (overrideVal === undefined || overrideVal === null) ? field.valueOf(m) : Number(overrideVal);
        if (onlyEmpty && !isEmptyModelVal(row[field.key])) continue;
        if (String(row[field.key] ?? '') !== String(val)) setReactive(vmMembers, row, field.key, val);
      }
      if (rendered.length === targetMemberList.length) {
        rendered.forEach((c, idx) => {
          const row = memberRows[idx];
          if (!row || isEmptyModelVal(row[field.key])) return;
          clickRadioValue(c.wrap, c.vInst, Number(row[field.key]));
          triggerVeeValidate(c.wrap);
        });
      }
    }

    // ---- Member facilities (multi-select): only from explicit payload data.
    // String names ("TCB", "রেশন কার্ড") map through the keyword table.
    const facControl = firstSelectFor('member', 'facilities_ids');
    if (facControl) {
      targetMemberList.forEach((m, idx) => {
        const row = memberRows[idx];
        const ids = m.facilities_ids || memberOverrides.facilities_ids;
        if (!row || !Array.isArray(ids) || !ids.length) return;
        if (onlyEmpty && !isEmptyModelVal(row.facilities_ids)) return;
        const resolved = ids.map(v => {
          if (typeof v === 'string' && !/^\d+$/.test(v.trim())) return keywordToId(v, FACILITY_KEYWORDS);
          return Number(v);
        }).filter(v => v !== null && !Number.isNaN(v));
        if (resolved.length && JSON.stringify(row.facilities_ids || []) !== JSON.stringify(resolved)) setReactive(vmMembers, row, 'facilities_ids', resolved);
      });
    }

    // ---- Head selects (data.* / form.*): drive the single rendered control.
    if (headTarget && headMember) {
      const headAge = calculateAgeYears(headMember.dob);
      const headGenderId = resolveGenderId({ ...headMember, relation: 'Head/Self' });
      const headPats = memberOptionPatterns(
        { ...headMember, relation: 'Head/Self' }, headAge, headGenderId, hasSpouseInHousehold
      );
      const headFields = [
        { keys: ['education_status'], patternsOf: (p) => p.education, excludesOf: () => [], idsOf: (p) => p.educationIds },
        { keys: ['profession'], patternsOf: (p) => p.profession, excludesOf: () => [], idsOf: (p) => p.professionIds },
        { keys: ['marital_status'], patternsOf: (p) => p.marital, excludesOf: (p) => p.maritalExcludes, idsOf: (p) => p.maritalIds }
      ];
      for (const field of headFields) {
        for (const scope of ['data', 'form']) {
          for (const key of field.keys) {
            const list = byField.get(scope + '.' + key) || [];
            for (const c of list) {
              if (c.vInst.disabled || c.vInst.readonly) continue;
              const currentVal = c.vInst.internalValue ?? c.vInst.lazyValue;
              if (onlyEmpty && !isEmptyModelVal(currentVal)) continue;
              const overrideVal = headOverrides[key];
              const choice = resolveOptionChoice(c.vInst, overrideVal, field.patternsOf(headPats), field.excludesOf(headPats), field.idsOf(headPats));
              if (choice && choice.id !== undefined) {
                const want = String(choice.id);
                if (String(currentVal ?? '') === want) continue;
                selectVuetifyItem(c.vInst, it => String(optionItemId(c.vInst, it)) === want);
                setReactive(vmHead, headTarget, key, choice.id);
                triggerVeeValidate(c.wrap);
              } else {
                unfilled.push(`Head: ${key}`);
              }
            }
          }
        }
      }
    }

    // ---- Address cascade: auto-pick when exactly one usable option exists.
    const geoKeyRe = /^(division|district|thana|union|ward|pouro|city|district_pouro|city_thana)(_id)?(_city|_dist|_pouro|_union)?$/;
    const geoKeyRe2 = /^(permanent_)?(division|district|thana|union|ward|pouro|city)/;
    for (const c of controls) {
      if (!c.isSelect) continue;
      const { scope, key } = classifyControl(c);
      if (!/^(data|form|addressForm)$/.test(scope)) continue;
      if (!geoKeyRe.test(key) && !geoKeyRe2.test(key)) continue;
      if (c.vInst.disabled || c.vInst.readonly) continue;
      if (!Array.isArray(c.vInst.items) || !c.vInst.items.length) continue;
      const currentVal = c.vInst.internalValue ?? c.vInst.lazyValue;
      if (!isEmptyModelVal(currentVal)) continue;
      const usable = c.vInst.items.filter(it => {
        const v = optionItemId(c.vInst, it);
        return v !== undefined && v !== null && String(v).trim() !== '';
      });
      if (usable.length === 1) {
        selectVuetifyItem(c.vInst, it => it === usable[0]);
        triggerVeeValidate(c.wrap);
      }
    }

    return unfilled;
  }

  /* =====================================================================
   * PMT + PROGRAM ADDITIONAL FIELDS — the "যোগ্যতার অন্যান্য তথ্য"
   * (PMT score questions) and "প্রোগ্রাম অনুযায়ী তথ্য" (program
   * counts) sections. Added 2026-11-17 after the user showed these
   * sections unfilled on the real page.
   *
   * PMT: v-selects bound to `data.application_pmt[i].sub_variables`,
   * items = the question's `children` (id + name_bn/name_en + score,
   * parent_id = question id). field_type 2 (multi) renders as a
   * checkbox grid (.fc-pmt-multi-grid). Question ids/children are the
   * REAL ones from getApplicationPageData (24 questions, captured
   * 2026-11-12).
   *
   * Program fields (Family Card, program 24): v-selects bound to
   * `values[i].allowance_program_additional_field_values_id`, items =
   * additional_field_value (id + value_bn/value_en, additional_field_id
   * = field id).
   *
   * DERIVABLE answers (filled automatically):
   *   PMT 576 ethnic minority <- is_ethnic; 530 location <- area type;
   *   1 household size, 7 children count <- household counts;
   *   12 head age band <- head DOB; 14 head education band <-
   *   head education_status; 18 spouse education band (or 604 N/A);
   *   29 remittance = No (no member abroad).
   *   Program 75/77/142 male/female/hijra counts; 96 DSS = No;
   *   139/140/141 abroad counts = 0.
   * Everything else (house materials, water, fuel, land, rooms,
   * assets, MFS provider, ...) is FACTUAL household data the
   * bookmarklet does not have — it is left for manual selection
   * unless preset via overrides:
   *   form_defaults.pmt = { '571': 572, '47': [435, 559] }
   *   form_defaults.program_fields = { '138': 679 }
   * Numeric ids win; strings match option labels; null/false skips.
   * ===================================================================== */

  // Order matters: Q579's label contains Q548's wording, and Q25's
  // English name contains Q571's — the more specific pattern goes first.
  const PMT_QUESTION_LABELS = [
    { id: 579, re: /এলপিজি.*পরিমান|lpg/i },
    { id: 548, re: /জ্বালানির প্রধান উপকরণ|primary fuel/i },
    { id: 25, re: /জমির পরিমাণ|household land/i },
    { id: 571, re: /মালিকানা ধরণ|land ownership/i },
    { id: 576, re: /ক্ষুদ্র নৃগোষ্ঠী|ethnic minority/i },
    { id: 530, re: /কোথায় অবস্থিত|কোথায় অবস্থিত|household location/i },
    { id: 1, re: /খানার সদস্য সংখ্যা|households size/i },
    { id: 7, re: /শিশু সংখ্যা|number of children/i },
    { id: 12, re: /প্রধানের বয়স|head is aged/i },
    { id: 14, re: /খানা প্রধানের শিক্ষা|head.?s education/i },
    { id: 18, re: /স্বামীর শিক্ষা|education level of spouse/i },
    { id: 500, re: /রুম\/কক্ষ সংখ্যা|number of rooms|ঘরের সংখ্যা/i },
    { id: 36, re: /পৃথক রান্নাঘর|separate kitchen/i },
    { id: 33, re: /পৃথক খাবার ঘর|separate dining/i },
    { id: 536, re: /মেঝে বা ফ্লোর|floor/i },
    { id: 393, re: /ঘরের ছাদ|room roof/i },
    { id: 30, re: /ঘরের দেয়াল|room wall/i },
    { id: 40, re: /খাবার পানির উৎস|drinking water/i },
    { id: 41, re: /পায়খানা|টয়লেট|latrine|toilet/i },
    { id: 567, re: /বিদ্যুৎ লাইনের উৎস|source of electricity/i },
    { id: 29, re: /বিদেশে অবস্থানরত কারো|remittance/i },
    { id: 22, re: /শ্রমিক হিসেবে নিয়োজিত|members.? occupation/i },
    { id: 595, re: /ডিজেল ব্যবহার|diesel/i },
    { id: 47, re: /পরিসম্পদ|durable assets/i }
  ];
  const PROGRAM_FIELD_LABELS = [
    { id: 139, re: /বিদেশে.*পুরুষ|male member in abroad/i },
    { id: 140, re: /বিদেশে.*মহিলা|female member in abroad/i },
    { id: 141, re: /বিদেশে.*হিজড়া|hijra member in abroad/i },
    { id: 75, re: /পুরুষ সদস্য সংখ্যা|no\.? of male/i },
    { id: 77, re: /নারী সদস্য সংখ্যা|no\.? of.? female/i },
    { id: 142, re: /হিজড়া সদস্য সংখ্যা|hijra member/i },
    { id: 96, re: /সমাজসেবা অধিদপ্তর থেকে কোন প্রশিক্ষণ|training information from dss/i },
    { id: 138, re: /মোবাইল ব্যাংকিং|mfs account/i }
  ];
  function matchPmtLabel(labelTxt) {
    const s = String(labelTxt || '');
    for (const q of PMT_QUESTION_LABELS) if (q.re.test(s)) return q.id;
    return null;
  }
  function matchProgramLabel(labelTxt) {
    const s = String(labelTxt || '');
    for (const f of PROGRAM_FIELD_LABELS) if (f.re.test(s)) return f.id;
    return null;
  }

  // Education (lookup type 8) -> PMT education band. The two questions
  // use DIFFERENT child ids for the same bands (Q14: 382/383/384/385,
  // Q18: 409/410/411/412), so map through a band index, not raw ids.
  const EDU_ID_TO_BAND = {
    88: 'illit', 188: 0, 189: 0, 190: 0, 191: 0, 192: 1, 89: 1, 193: 1,
    90: 1, 91: 1, 92: 2, 93: 2, 194: 2, 195: 2, 196: 2, 197: 2, 198: 2,
    199: 0, 94: 0
  };
  const PMT_EDU_BAND = {
    14: { illit: 385, 0: 382, 1: 383, 2: 384 },
    18: { illit: 412, 0: 409, 1: 410, 2: 411 }
  };

  function identifyDynamicControl(c) {
    const expr = c.expr || '';
    const items = c.vInst && Array.isArray(c.vInst.items) ? c.vInst.items : [];
    const first = items.length ? items[0] : null;
    // Item keys identify the section exactly: PMT children carry
    // parent_id (= question id) + score; program values carry
    // additional_field_id (= field id). Lookup/geo items have neither.
    if (first && typeof first === 'object') {
      if (first.parent_id !== undefined && first.parent_id !== null && 'score' in first) {
        return { kind: 'pmt', id: Number(first.parent_id) };
      }
      if (first.additional_field_id !== undefined && first.additional_field_id !== null) {
        return { kind: 'program', id: Number(first.additional_field_id) };
      }
    }
    if (/application_pmt/.test(expr)) {
      const qid = matchPmtLabel(c.label);
      if (qid) return { kind: 'pmt', id: qid };
    }
    if (/allowance_program_additional_field_values_id/.test(expr)) {
      const fid = matchProgramLabel(c.label);
      if (fid) return { kind: 'program', id: fid };
    }
    if (first && typeof first === 'object' && 'score' in first) {
      const qid = matchPmtLabel(c.label);
      if (qid) return { kind: 'pmt', id: qid };
    }
    return null;
  }

  // PMT model state. Entries live in data.application_pmt (main form)
  // or applicationPmt (halnagad variant), and are keyed by variable_id
  // — NOT id (createEmptyApplicationPmtRow builds
  // {variable_id, sub_variables}). Matching only `id` silently skipped
  // every direct model write on the real page, leaving PMT to DOM
  // drives alone — which cannot run while the PMT tab is not open.
  function resolvePmtState(vmHead, allVms, headTarget) {
    let pmtArray = null, pmtOwnerVm = null, pmtVariables = null;
    const consider = (vm, arr) => { if (!pmtArray && Array.isArray(arr)) { pmtArray = arr; pmtOwnerVm = vm; } };
    if (headTarget) {
      consider(vmHead, headTarget.application_pmt);
      if (Array.isArray(headTarget.PMTVariables) && headTarget.PMTVariables.length) pmtVariables = headTarget.PMTVariables;
    }
    (allVms || []).forEach(v => {
      if (!v) return;
      if (v.data) consider(v, v.data.application_pmt);
      consider(v, v.applicationPmt);
      if (!pmtVariables && Array.isArray(v.PMTVariables) && v.PMTVariables.length) pmtVariables = v.PMTVariables;
      if (!pmtVariables && v.data && Array.isArray(v.data.PMTVariables) && v.data.PMTVariables.length) pmtVariables = v.data.PMTVariables;
    });
    return { pmtArray, pmtOwnerVm, pmtVariables };
  }
  function findPmtEntryIn(pmtArray, qid) {
    if (!Array.isArray(pmtArray)) return null;
    return pmtArray.find(e => e && (Number(e.variable_id) === Number(qid) || Number(e.id) === Number(qid))) || null;
  }
  // Program additional-field values + field definitions (the parent
  // owns both; DynamicAdditionalFields only renders them).
  function resolveProgramState(vmHead, allVms, headTarget) {
    let values = null, fields = null;
    const consider = (v) => {
      if (!v) return;
      if (!values && Array.isArray(v.applicationAllowanceValues)) values = v.applicationAllowanceValues;
      if (!fields && Array.isArray(v.displayAdditionalFields) && v.displayAdditionalFields.length) fields = v.displayAdditionalFields;
      if (v.data) {
        if (!values && Array.isArray(v.data.applicationAllowanceValues)) values = v.data.applicationAllowanceValues;
        if (!fields && Array.isArray(v.data.displayAdditionalFields) && v.data.displayAdditionalFields.length) fields = v.data.displayAdditionalFields;
      }
    };
    consider(vmHead);
    if (headTarget) consider(headTarget);
    (allVms || []).forEach(consider);
    return { values, fields };
  }

  async function syncDynamicSections(vmHead, allVms, headTarget, memberRows, targetMemberList, headMember, counts, defs, onlyEmpty) {
    const unfilled = [];
    const gridNotes = [];
    const seenPmt = new Set();
    const seenProgram = new Set();
    const pmtOverrides = (defs && defs.pmt) || {};
    const progOverrides = (defs && defs.program_fields) || {};
    const hasSpouseInHousehold = targetMemberList.some(mm => mm.relation === 'Husband' || mm.relation === 'Wife');

    const headAge = headMember ? calculateAgeYears(headMember.dob) : null;
    const headEduId = headTarget ? Number(headTarget.education_status || 0) : 0;
    let spouseEduId = 0;
    targetMemberList.forEach((m, idx) => {
      if ((m.relation === 'Husband' || m.relation === 'Wife') && memberRows[idx]) {
        spouseEduId = Number(memberRows[idx].education_status_id || 0);
      }
    });

    const derivedPmt = new Map();
    derivedPmt.set(576, Number(counts.isEthnic) === 1 ? 577 : 578);
    derivedPmt.set(530, counts.areaTypeId === 2 ? 532 : (counts.areaTypeId === 3 ? 531 : 534));
    derivedPmt.set(1, { number: counts.totalMembers });
    derivedPmt.set(7, { number: counts.childrenUnder18 });
    if (headAge !== null) derivedPmt.set(12, headAge < 41 ? 439 : (headAge < 60 ? 440 : 441));
    const headBand = EDU_ID_TO_BAND[headEduId];
    if (headBand !== undefined) derivedPmt.set(14, PMT_EDU_BAND[14][headBand]);
    if (!hasSpouseInHousehold) derivedPmt.set(18, 604);
    else {
      const spouseBand = EDU_ID_TO_BAND[spouseEduId];
      if (spouseBand !== undefined) derivedPmt.set(18, PMT_EDU_BAND[18][spouseBand]);
    }
    derivedPmt.set(29, 276); // nobody abroad (abroad counts default 0)
    derivedPmt.set(571, 572); // land/dwelling ownership: নিজস্ব (Owner) — user default; override via form_defaults.pmt
    derivedPmt.set(47, [559, 563, 435, 591]); // durable assets everyone has: fan, bed, mobile, tubewell — user default; override via form_defaults.pmt
    derivedPmt.set(548, 550); // cooking fuel: কাঠ/খড়ি/লাকড়ি (wood) — user default; override via form_defaults.pmt
    derivedPmt.set(40, 399); // drinking water source: টিউবওয়েল (tubewell) — user default; override via form_defaults.pmt
    derivedPmt.set(567, 568); // electricity source: জাতীয় গ্রিড (national grid) — user default; override via form_defaults.pmt
    derivedPmt.set(41, 386); // latrine type: স্যানিটারি/উন্নত ল্যাট্রিন (sanitary) — user default; override via form_defaults.pmt

    const derivedProg = new Map();
    derivedProg.set(75, { number: counts.maleCount });
    derivedProg.set(77, { number: counts.femaleCount });
    derivedProg.set(142, { number: counts.otherGenderCount || 0 });
    derivedProg.set(96, 651); // DSS training: No
    derivedProg.set(139, { number: 0 });
    derivedProg.set(140, { number: 0 });
    derivedProg.set(141, { number: 0 });
    // 138 (MFS provider): override-only, never guessed.

    const controls = collectOptionControls();
    await waitForOptionItems(controls);

    // PMT model array owner (for direct writes alongside select drives).
    const { pmtArray, pmtOwnerVm, pmtVariables } = resolvePmtState(vmHead, allVms, headTarget);
    const findPmtEntry = (qid) => findPmtEntryIn(pmtArray, qid);

    // Numeric options: itemToStr concatenates every label field plus
    // the item id ("২ 2 ... 443"), so match the FIRST standalone
    // number token (the Bengali/English label), never the whole string.
    const matchNumberItem = (vInst, num) => {
      const want = String(num);
      return (vInst.items || []).find(it => {
        const m = toEnDigits(itemToStr(it)).match(/(^|\s)(\d+)(\s|$)/);
        return m !== null && m[2] === want;
      }) || null;
    };
    const matchIdItem = (vInst, id) =>
      (vInst.items || []).find(it => Number(optionItemId(vInst, it)) === Number(id)) || null;
    // Exact single-label match: substring matching is wrong here
    // ("মাটি" is inside "পোড়ামাটি" in the ঢালাই option), so a string
    // override/derivation must prefer an exactly-named item.
    const matchExactLabelItem = (vInst, text) => {
      const strip = (s) => String(s || '').replace(/\(.*?\)/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
      const want = strip(text);
      if (!want) return null;
      return (vInst.items || []).find(it => {
        for (const k of ['name_bn', 'name_en', 'value_bn', 'value_en', 'label', 'text', 'name']) {
          const lbl = strip(it[k]);
          if (lbl && (lbl === want || lbl.startsWith(want + ' '))) return true;
        }
        return false;
      }) || null;
    };

    // Resolve one control's answer: override > derivation. Returns
    // { ids: [...] } or null.
    const resolveChoice = (vInst, key, derived, overrides) => {
      const ov = overrides[key] ?? overrides[String(key)];
      if (ov === null || ov === false) return null;
      if (ov !== undefined) {
        const list = Array.isArray(ov) ? ov : [ov];
        const ids = [];
        for (const v of list) {
          const numeric = typeof v === 'number' || /^\d+$/.test(String(v).trim());
          let item = numeric ? matchIdItem(vInst, Number(v)) : null;
          if (!item && typeof v === 'string' && v.trim()) {
            item = matchExactLabelItem(vInst, v.trim());
          }
          if (!item && typeof v === 'string' && v.trim()) {
            const esc = v.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            item = matchOptionItem(vInst, [new RegExp(esc, 'i')]);
          }
          if (item) ids.push(optionItemId(vInst, item));
          else if (numeric) ids.push(Number(v)); // trust a numeric override id
        }
        return ids.length ? { ids } : null;
      }
      if (derived === undefined) return null;
      if (Array.isArray(derived)) {
        // Multi-answer derivation (e.g. Q47 assets): resolve each id.
        const ids = [];
        for (const v of derived) {
          const item = matchIdItem(vInst, Number(v));
          if (item) ids.push(optionItemId(vInst, item));
          else if (!Number.isNaN(Number(v))) ids.push(Number(v));
        }
        return ids.length ? { ids } : null;
      }
      if (derived && typeof derived === 'object' && derived.number !== undefined) {
        const item = matchNumberItem(vInst, derived.number);
        return item ? { ids: [optionItemId(vInst, item)] } : null;
      }
      const item = matchIdItem(vInst, derived);
      return item ? { ids: [optionItemId(vInst, item)] } : null;
    };

    for (const c of controls) {
      if (!c.isSelect) continue;
      const ident = identifyDynamicControl(c);
      if (!ident) continue;
      if (ident.kind === 'pmt') seenPmt.add(ident.id);
      else seenProgram.add(ident.id);
      if (c.vInst.disabled || c.vInst.readonly) continue;
      const isMulti = !!c.vInst.multiple;
      const shortLabel = (c.label || '').trim().replace(/\s+/g, ' ').slice(0, 40);
      if (ident.kind === 'pmt') {
        const entry = findPmtEntry(ident.id);
        const currentVal = entry ? entry.sub_variables : (c.vInst.internalValue ?? c.vInst.lazyValue);
        if (onlyEmpty && !isEmptyModelVal(currentVal)) continue;
        const choice = resolveChoice(c.vInst, ident.id, derivedPmt.get(ident.id), pmtOverrides);
        if (!choice) { unfilled.push(`PMT Q${ident.id} (${shortLabel})`); continue; }
        const ids = isMulti ? choice.ids : [choice.ids[0]];
        if (entry) setReactive(pmtOwnerVm, entry, 'sub_variables', isMulti ? ids : ids[0]);
        if (isMulti) {
          try {
            if ('internalValue' in c.vInst) c.vInst.internalValue = ids;
            if ('lazyValue' in c.vInst) c.vInst.lazyValue = ids;
            c.vInst.$emit('input', ids);
            c.vInst.$emit('change', ids);
          } catch (_) {}
        } else {
          selectVuetifyItem(c.vInst, it => Number(optionItemId(c.vInst, it)) === Number(ids[0]));
        }
        triggerVeeValidate(c.wrap);
      } else {
        const currentVal = c.vInst.internalValue ?? c.vInst.lazyValue;
        if (onlyEmpty && !isEmptyModelVal(currentVal)) continue;
        const choice = resolveChoice(c.vInst, ident.id, derivedProg.get(ident.id), progOverrides);
        if (!choice) { unfilled.push(`Program field ${ident.id} (${shortLabel})`); continue; }
        selectVuetifyItem(c.vInst, it => Number(optionItemId(c.vInst, it)) === Number(choice.ids[0]));
        triggerVeeValidate(c.wrap);
      }
    }

    // Model-only passes: the PMT and program sections live on their
    // own tabs, and tab content renders lazily — when a tab was never
    // opened, its controls do not exist at all, so no select drive can
    // run. Write the answers straight into the models (resolving
    // numbers/labels against the live PMTVariables children and
    // displayAdditionalFields options), so each tab shows filled values
    // whenever the user opens it. Never overwrites a non-empty entry.
    if (pmtArray && pmtVariables) {
      const allQids = new Set([...derivedPmt.keys(), ...Object.keys(pmtOverrides).map(Number)]);
      for (const qid of allQids) {
        const entry = findPmtEntry(qid);
        if (!entry) continue;
        const question = pmtVariables.find(q => Number(q.id) === Number(qid));
        if (!question || !Array.isArray(question.children) || !question.children.length) continue;
        const fakeVInst = { items: question.children, itemValue: 'id', returnObject: false };
        const choice = resolveChoice(fakeVInst, qid, derivedPmt.get(qid), pmtOverrides);
        if (!choice) continue;
        const isMulti = Number(question.field_type) === 2;
        if (isMulti) {
          // Multi-answer: COMPLETE a partial entry — add the missing
          // wanted ids, never remove existing ones. A draft load or a
          // rebuild can leave a single stale id behind; "non-empty"
          // must not count as done for a multi-answer question.
          const existing = Array.isArray(entry.sub_variables) ? entry.sub_variables.map(Number) : [];
          const merged = [...new Set([...existing, ...choice.ids.map(Number)])];
          if (merged.length !== existing.length) setReactive(pmtOwnerVm, entry, 'sub_variables', merged);
        } else {
          if (!isEmptyModelVal(entry.sub_variables)) continue;
          setReactive(pmtOwnerVm, entry, 'sub_variables', choice.ids[0]);
        }
      }
    }
    const { values: progValues, fields: progFields } = resolveProgramState(vmHead, allVms, headTarget);
    if (Array.isArray(progValues) && Array.isArray(progFields)) {
      const allFids = new Set([...derivedProg.keys(), ...Object.keys(progOverrides).map(Number)]);
      for (const fid of allFids) {
        const entry = progValues.find(e => e && Number(e.allowance_program_additional_field_id) === Number(fid));
        if (!entry || !isEmptyModelVal(entry.allowance_program_additional_field_values_id)) continue;
        const field = progFields.find(f => Number(f.id) === Number(fid));
        if (!field || !Array.isArray(field.additional_field_value) || !field.additional_field_value.length) continue;
        const fakeVInst = { items: field.additional_field_value, itemValue: 'id', returnObject: false };
        const choice = resolveChoice(fakeVInst, fid, derivedProg.get(fid), progOverrides);
        if (!choice) continue;
        setReactive(vmHead, entry, 'allowance_program_additional_field_values_id', choice.ids[0]);
      }
    }

    // Multi-answer PMT questions render as a checkbox grid. Answers
    // come from overrides, falling back to derivations (Q47 assets).
    document.querySelectorAll('.fc-pmt-multi-grid').forEach(grid => {
      // The question label is a sibling <label> of some ancestor wrapper.
      let node = grid, labelTxt = '';
      while (node && node !== document.body && !labelTxt) {
        const parent = node.parentElement;
        if (!parent) break;
        for (const child of parent.children) {
          if (child !== node && child.tagName === 'LABEL') { labelTxt = child.textContent || ''; break; }
        }
        node = parent;
      }
      const qid = matchPmtLabel(labelTxt);
      if (!qid) return;
      const ov = pmtOverrides[qid] ?? pmtOverrides[String(qid)];
      if (ov === null || ov === false) return;
      // Override wins; otherwise fall back to a derivation (Q47 assets).
      const src = ov !== undefined ? ov : derivedPmt.get(qid);
      if (src === undefined) return;
      const entry = findPmtEntry(qid);
      const wantList = Array.isArray(src) ? src : [src];
      const wantIds = new Set(), wantLabels = [];
      wantList.forEach(v => {
        if (typeof v === 'number' || /^\d+$/.test(String(v).trim())) wantIds.add(Number(v));
        else wantLabels.push(String(v).toLowerCase().trim());
      });
      // Compare stripped labels for equality: substring matching is
      // wrong here ("মাটি" is inside "পোড়ামাটি" in the ঢালাই option).
      const stripLabel = (s) => String(s || '').replace(/\(.*?\)/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
      // Labels of the live question children: a box can still match by
      // label when its VM value does not read, and label overrides
      // resolve to ids for the merge filter below.
      const labelToId = new Map();
      try {
        const liveQ = Array.isArray(pmtVariables) ? pmtVariables.find(q => Number(q.id) === Number(qid) || Number(q.variable_id) === Number(qid)) : null;
        for (const ch of (liveQ && liveQ.children) || []) {
          const id = Number(ch.id);
          for (const k of ['name_bn', 'name_en', 'value_bn', 'value_en']) {
            if (ch[k]) labelToId.set(stripLabel(ch[k]), id);
          }
        }
      } catch (_) {}
      // Every id this question should hold: numeric wants plus ids
      // whose labels exactly match a label want (never substring).
      const wantedIds = new Set(wantIds);
      for (const w of wantLabels) {
        const sw = stripLabel(w);
        for (const [lbl, id] of labelToId) {
          if (lbl === sw || lbl.startsWith(sw + ' ')) wantedIds.add(id);
        }
      }
      const entryIds = entry && Array.isArray(entry.sub_variables) ? entry.sub_variables.map(Number) : [];
      // Multi-answer completeness: "filled" means ALL wanted ids are
      // present, not merely non-empty — a single stale id (draft load,
      // rebuild) must be completed, not treated as done.
      const alreadyFilled = entry && entryIds.length > 0 && [...wantedIds].every(id => entryIds.includes(id));
      if (!(onlyEmpty && alreadyFilled)) {
      const entryIdSet = new Set(entryIds);
      const chosen = [];
      grid.querySelectorAll('.fc-pmt-multi-checkbox, .v-checkbox').forEach(box => {
        const bvm = box.__vue__;
        const cid = bvm ? Number(bvm.value ?? (bvm.$attrs && bvm.$attrs.value)) : NaN;
        const txt = stripLabel(box.textContent);
        let matchedId = wantIds.has(cid) ? cid : NaN;
        if (Number.isNaN(matchedId)) {
          const byLabel = labelToId.get(txt);
          if (byLabel !== undefined && wantIds.has(byLabel)) matchedId = byLabel;
          else if (!wantLabels.some(w => w && (txt === stripLabel(w) || txt.startsWith(stripLabel(w) + ' ')))) return;
        }
        if (!Number.isNaN(matchedId)) chosen.push(matchedId);
        else if (!Number.isNaN(cid)) chosen.push(cid);
        // Never click a box whose id is already in the model: the
        // model is authoritative and Vue renders it checked. Clicking
        // a stale-unchecked box that the model already holds risks
        // toggling the id back OUT of the model. Only click genuine
        // adds (id absent from the model), which are safe under any
        // checkbox semantics.
        const effectiveId = !Number.isNaN(matchedId) ? matchedId : cid;
        const alreadyInModel = !Number.isNaN(effectiveId) && entryIdSet.has(effectiveId);
        const inp = box.querySelector('input[type="checkbox"]');
        const checked = inp ? inp.checked : !!(bvm && bvm.isActive);
        if (!checked && !alreadyInModel && inp && !inp.disabled) inp.click();
      });
      // Merge with what the model already holds, keeping only wanted
      // ids — never shrink the array if one box failed to match (e.g.
      // an unreadable value), and never keep a loosely-matched id the
      // exact grid match rejected (e.g. ঢালাই for a মাটি override).
      if (chosen.length && entry) {
        const existing = Array.isArray(entry.sub_variables) ? entry.sub_variables.map(Number).filter(id => wantedIds.has(id)) : [];
        const merged = [...new Set([...existing, ...chosen.map(Number)])];
        setReactive(pmtOwnerVm, entry, 'sub_variables', merged);
      }
      }
      // Reconcile + verify on EVERY pass (even when the entry was
      // already filled): if the model holds an id but its box renders
      // unchecked — stale DOM, a missed click, a late rebuild — fix it
      // without ever risking a toggle-out. A box whose own VM says
      // inactive gets one click (a genuine add through its binding);
      // a box whose VM says active only gets a re-render. Notes feed
      // the result message so a stubborn box is visible.
      if (entry) {
        const modelIds = new Set(Array.isArray(entry.sub_variables) ? entry.sub_variables.map(Number) : []);
        const seenBoxIds = new Set();
        grid.querySelectorAll('.fc-pmt-multi-checkbox, .v-checkbox').forEach(box => {
          const bvm = box.__vue__;
          let bid = bvm ? Number(bvm.value ?? (bvm.$attrs && bvm.$attrs.value)) : NaN;
          const txt = stripLabel(box.textContent);
          if (Number.isNaN(bid)) {
            let byLabel = labelToId.get(txt);
            if (byLabel === undefined) {
              for (const [lbl, id] of labelToId) { if (txt.startsWith(lbl + ' ')) { byLabel = id; break; } }
            }
            if (byLabel !== undefined) bid = byLabel;
          }
          if (Number.isNaN(bid)) return;
          seenBoxIds.add(bid);
          if (!modelIds.has(bid)) return;
          const inp = box.querySelector('input[type="checkbox"]');
          const vmActive = !!(bvm && bvm.isActive);
          if (inp && !inp.checked && !inp.disabled) {
            if (!vmActive) {
              // The box's own state says unchecked while the model
              // holds the id (stale binding / missed render): clicking
              // is a genuine add through the box's own binding, safe
              // under any checkbox semantics.
              inp.click();
              gridNotes.push('Q' + qid + ' grid box re-checked: ' + (box.textContent || '').trim());
            } else if (bvm && typeof bvm.$forceUpdate === 'function') {
              // The box knows it is active but the DOM lags: re-render
              // instead of clicking, so the id can never toggle out.
              try { bvm.$forceUpdate(); } catch (_) {}
            }
          }
        });
        if (seenBoxIds.size) {
          for (const wid of wantIds) {
            if (!seenBoxIds.has(wid)) gridNotes.push('Q' + qid + ': no matching box found for id ' + wid);
          }
        }
      }
      // Re-fire a change on one checked box ONLY while the grid shows
      // its error state — the site's own change handler re-validates
      // and clears it. Never fire when no error is showing.
      if (entry && !isEmptyModelVal(entry.sub_variables)) {
        const showsError = grid.classList && typeof grid.classList.contains === 'function' && grid.classList.contains('fc-pmt-multi-grid--error');
        if (showsError) {
          try {
            const boxes = grid.querySelectorAll('.fc-pmt-multi-checkbox, .v-checkbox');
            for (const box of boxes) {
              const inp = box.querySelector ? box.querySelector('input[type="checkbox"]') : null;
              if (inp && inp.checked && !inp.disabled && typeof inp.dispatchEvent === 'function') {
                inp.dispatchEvent(new Event('change', { bubbles: true }));
                break;
              }
            }
          } catch (_) {}
        }
      }
    });

    return { unfilled, seenPmt, seenProgram, gridNotes };
  }

  // Background watcher for the PMT + program sections. The program
  // section only renders once the async program/draft data arrives
  // (DynamicAdditionalFields is v-if'd on displayAdditionalFields AND
  // applicationAllowanceValues), and the parent REBUILDS
  // applicationAllowanceValues from the draft when that data lands —
  // wiping any picks made before the rebuild. That is why the program
  // section used to need a second click. Re-run the dynamic sync
  // (onlyEmpty: never overwrites a filled/user value) until every
  // derivable id has been seen and filled, or 30s pass.
  function watchDynamicSections(vmHead, allVms, headTarget, memberRows, targetMemberList, headMember, counts, defs) {
    const wantPmt = [576, 530, 571, 1, 7, 12, 14, 18, 29, 47, 548, 40, 567, 41];
    const wantProg = [75, 142, 96, 139, 140, 141];
    if (Number(counts.femaleCount) > 0) wantProg.push(77); // field 77 has no 0 option
    let seenAny = false;
    let inFlight = false;
    let verifiedTicks = 0;
    const t0 = Date.now();
    const timer = registerWatchTimer(setInterval(async () => {
      if (inFlight) return;
      try {
        // Keep watching until everything is verified filled, up to
        // ~30s: on a slow connection the site's data can land late.
        if (Date.now() - t0 > 30000) { clearInterval(timer); return; }
        inFlight = true;
        const fresh = getVueNodes();
        const vh = fresh.vmHead || vmHead;
        const ht = getHeadTargetObj(vh) || headTarget;
        const res = await syncDynamicSections(vh, fresh.allVms || allVms, ht, memberRows, targetMemberList, headMember, counts, defs, true);
        if (res.seenPmt.size || res.seenProgram.size) seenAny = true;
        try { syncSameAsPermanent(fresh.allVms || allVms); } catch (_) {}
        // Verify against the live MODELS, not just "no unfilled
        // notes": a drive can appear to succeed and then be wiped by
        // a late rebuild. Require the values to stay filled for two
        // consecutive ticks before stopping.
        const { pmtArray } = resolvePmtState(vh, fresh.allVms || allVms, ht);
        const { values: progVals } = resolveProgramState(vh, fresh.allVms || allVms, ht);
        const pmtVerified = wantPmt.every(id => {
          const e = findPmtEntryIn(pmtArray, id);
          return e && !isEmptyModelVal(e.sub_variables);
        });
        let progVerified;
        if (Array.isArray(progVals) && progVals.length) {
          progVerified = wantProg.every(id => {
            const e = progVals.find(x => x && Number(x.allowance_program_additional_field_id) === Number(id));
            return e && !isEmptyModelVal(e.allowance_program_additional_field_values_id);
          });
        } else {
          const unfilledIds = new Set();
          for (const n of res.unfilled) {
            const m = n.match(/(?:PMT Q|Program field )(\d+)/);
            if (m) unfilledIds.add(Number(m[1]));
          }
          progVerified = wantProg.every(id => res.seenProgram.has(id) && !unfilledIds.has(id));
        }
        if (pmtVerified && progVerified) {
          if (++verifiedTicks >= 2) { clearInterval(timer); return; }
        } else {
          verifiedTicks = 0;
        }
        if (!seenAny && !pmtArray && !(Array.isArray(progVals) && progVals.length) && Date.now() - t0 > 10000) clearInterval(timer);
      } catch (_) {
        // Keep watching; a later pass may succeed.
      } finally {
        inFlight = false;
      }
    }, 1000));
  }

  // Signature of everything the option sync writes, plus how many
  // items each rendered select currently offers. The option watcher
  // stops once this stops changing: values settled AND no new
  // option lists arriving.
  function optionWatcherSignature(memberRows, headTarget, controls) {
    const mKeys = ['literacy_id', 'education_status_id', 'livelihood_profession_id', 'health_condition_id', 'maritial_status_id', 'disability_type_id', 'is_currently_student', 'is_ssnp_covered', 'is_dss_training_or_financial_benefit'];
    const hKeys = ['education_status', 'profession', 'marital_status'];
    const vals = [];
    for (const r of (memberRows || [])) for (const k of mKeys) vals.push(r ? (r[k] ?? null) : null);
    for (const k of hKeys) vals.push(headTarget ? (headTarget[k] ?? null) : null);
    const items = (controls || []).map(c => (c.vInst && Array.isArray(c.vInst.items)) ? c.vInst.items.length : -1);
    return JSON.stringify([vals, items]);
  }

  // Option watcher: on a slow connection the lookup lists behind the
  // member/head dropdowns can arrive AFTER the option passes ran,
  // which used to force a second click (and the second click
  // re-drove the whole form). Re-run the empty-only option sync
  // until nothing changes any more, up to ~30s. Empty-only, so
  // hand corrections are never touched.
  function watchOptionSelects(vmHead, vmMembers, memberRows, targetMemberList, headTarget, headMember, defs) {
    let inFlight = false;
    let stableTicks = 0;
    let seenData = false;
    const t0 = Date.now();
    const timer = registerWatchTimer(setInterval(async () => {
      if (inFlight) return;
      try {
        if (Date.now() - t0 > 30000) { clearInterval(timer); return; }
        inFlight = true;
        const fresh = getVueNodes();
        const vh = fresh.vmHead || vmHead;
        const vm = fresh.vmMembers || vmMembers;
        const ht = getHeadTargetObj(vh) || headTarget;
        const rows = (vm && Array.isArray(vm.familyMembers)) ? vm.familyMembers : memberRows;
        const controls = collectOptionControls();
        if (controls.some(c => c.vInst && Array.isArray(c.vInst.items) && c.vInst.items.length)) seenData = true;
        const sigBefore = optionWatcherSignature(rows, ht, controls);
        await syncOptionSelects(vh, vm, rows, targetMemberList, ht, headMember, defs, true);
        const sigAfter = optionWatcherSignature(rows, ht, collectOptionControls());
        if (sigAfter === sigBefore) {
          if (seenData && ++stableTicks >= 2) { clearInterval(timer); return; }
        } else {
          stableTicks = 0;
        }
        if (!seenData && Date.now() - t0 > 10000) clearInterval(timer);
      } catch (_) {
        // Keep watching; a later pass may succeed.
      } finally {
        inFlight = false;
      }
    }, 1000));
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
    const normG = gVal ? normalizeGenderId(gVal) : 0;
    if (normG === GENDER_FEMALE) genderStr = 'Female';
    else if (normG === GENDER_OTHER) genderStr = 'Other';
    else if (!gVal && RELATION_GENDER_MAP[relName] === GENDER_FEMALE) genderStr = 'Female';

    return {
      relation: relName === 'Head/Self' ? 'Wife' : relName,
      relationship_id: finalRelId,
      gender: genderStr,
      gender_id: normG || (genderStr === 'Female' ? GENDER_FEMALE : GENDER_MALE),
      religion: 'Islam',
      religion_id: 96,
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

  // True when a member row already holds exactly this payload
  // member's identity data (id, DOB, names, relation, gender,
  // religion, disability flag). The refill guard uses it so a
  // second click leaves filled rows alone instead of re-driving
  // them. Deliberately strict: any difference means "fill it",
  // so panel edits keep flowing through.
  function rowHoldsMember(row, m, ctx) {
    if (!row) return false;
    const s = (v) => String(v ?? '').trim();
    const n = (v) => { const x = Number(v); return Number.isNaN(x) ? null : x; };
    const rowId = s(row.verification_number || row.nid || row.brn_id).replace(/\s+/g, '');
    if (!rowId || rowId !== ctx.cleanId) return false;
    if (n(row.verification_type) !== (ctx.isNID ? 1 : 2)) return false;
    if (s(row.dob || row.date_of_birth) !== ctx.memModelDob) return false;
    if (s(row.name_bn) !== s(m.name_bn) || s(row.name_en) !== s(m.name_en)) return false;
    if (s(row.father_name_bn) !== s(m.father_name_bn) || s(row.mother_name_bn) !== s(m.mother_name_bn)) return false;
    if (n(row.relationship_id) !== ctx.relId || s(row.relation) !== ctx.relName) return false;
    if (n(row.gender_id ?? row.gender ?? row.sex) !== ctx.genderId) return false;
    if (n(row.religion_id ?? row.religion) !== ctx.memReligionId) return false;
    if (n(row.is_member_disabled ?? 0) !== (Number(m.is_disabled) === 1 ? 1 : 0)) return false;
    return true;
  }

  let autofillInFlight = false;

  window.addEventListener('FC_PRO_AUTOFILL', async (event) => {
    const payload = event.detail;
    if (!payload) return;

    if (autofillInFlight) {
      window.dispatchEvent(new CustomEvent('FC_PRO_AUTOFILL_RESULT', {
        detail: { version: FC_INJECT_VERSION, success: true, message: 'Autofill is already running — please wait, one click is enough.' }
      }));
      return;
    }

    let { vmHead, vmMembers, allVms } = getVueNodes();
    if (!vmHead && !vmMembers && (!allVms || !allVms.length)) {
      window.dispatchEvent(new CustomEvent('FC_PRO_AUTOFILL_RESULT', {
        detail: { version: FC_INJECT_VERSION, success: false, message: 'Vue application form not detected on this page.' }
      }));
      return;
    }

    autofillInFlight = true;
    sameAsPermanentClickedThisRun = false;
    // A new click cancels the previous run's watchers: without
    // this, each click adds another watcher set and the form
    // keeps refilling.
    clearActiveWatchTimers();
    window.dispatchEvent(new CustomEvent('FC_PRO_AUTOFILL_RESULT', {
      detail: { version: FC_INJECT_VERSION, success: true, message: 'Filling the form — please wait, one click is enough…' }
    }));

    try {
      if (vmHead && 'panel' in vmHead) vmHead.panel = [0, 1, 2, 3, 4, 5, 6, 7];
      if (vmMembers && 'panel' in vmMembers) vmMembers.panel = [0, 1, 2, 3, 4, 5, 6, 7];

      // Wait for the site's panels to mount and its lookup/PMT data to
      // arrive (see waitForFormReady) — this is what used to force a
      // second click. Then re-read the Vue nodes: components may have
      // re-mounted while loading.
      await waitForFormReady(vmHead, vmMembers);
      const fresh = getVueNodes();
      if (fresh.vmHead) vmHead = fresh.vmHead;
      if (fresh.vmMembers) vmMembers = fresh.vmMembers;
      if (fresh.allVms && fresh.allVms.length) allVms = fresh.allVms;
      if (vmHead && 'panel' in vmHead) vmHead.panel = [0, 1, 2, 3, 4, 5, 6, 7];
      if (vmMembers && 'panel' in vmMembers) vmMembers.panel = [0, 1, 2, 3, 4, 5, 6, 7];

      const headTarget = getHeadTargetObj(vmHead);
      const familyReligionId = detectFamilyReligionId(payload);

      if (payload.full_form_dump) {
        const dump = payload.full_form_dump;
        if (dump.head_data && headTarget) {
          Object.entries(dump.head_data).forEach(([k, v]) => {
            if (v !== undefined && typeof v !== 'function') {
              setReactive(vmHead, headTarget, k, v);
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
      }

      const isVerificationPage = Boolean(
        document.querySelector('input[placeholder*="ক্যাপচা"], input[placeholder*="উত্তর"], input[id*="captcha"], .captcha-container') ||
        Array.from(document.querySelectorAll('label, span, p')).some(el => el.textContent.includes('ক্যাপচা সম্পূর্ণ করুন'))
      );

      let cleanHeadId = '';
      let headGenderId = GENDER_FEMALE;
      if (payload.head) {
        const h = payload.head;
        cleanHeadId = String(h.nid || '').replace(/\s+/g, '');
        const headIsNID = determineIsNID(h.doc_type, cleanHeadId);
        headGenderId = resolveGenderId({ ...h, relation: 'Head/Self' });
        const headReligionId = resolveReligionId(h, familyReligionId);
        const headDobParts = parseDobParts(h.dob);
        const headModelDob = headDobParts ? headDobParts.iso : String(h.dob || '').replace(/\[.*?\]/g, '').replace(/-/g, '/');

        if (headTarget) {
          setReactive(vmHead, headTarget, 'verification_type', headIsNID ? 1 : 2);
          setReactive(vmHead, headTarget, 'verification_number', cleanHeadId);
          setReactive(vmHead, headTarget, 'nid', headIsNID ? cleanHeadId : '');
          setReactive(vmHead, headTarget, 'brn_id', !headIsNID ? cleanHeadId : '');
          setReactive(vmHead, headTarget, 'date_of_birth', headModelDob);
          setReactive(vmHead, headTarget, 'dob', headModelDob);

          setReactive(vmHead, headTarget, 'name_bn', h.name_bn);
          setReactive(vmHead, headTarget, 'name_en', h.name_en);
          setReactive(vmHead, headTarget, 'father_name_bn', h.father_name_bn);
          setReactive(vmHead, headTarget, 'father_name_en', h.father_name_en);
          setReactive(vmHead, headTarget, 'mother_name_bn', h.mother_name_bn);
          setReactive(vmHead, headTarget, 'mother_name_en', h.mother_name_en);

          if (!isVerificationPage) {
            setReactive(vmHead, headTarget, 'gender', headGenderId);
            setReactive(vmHead, headTarget, 'gender_id', headGenderId);
            setReactive(vmHead, headTarget, 'sex', headGenderId);
            setReactive(vmHead, headTarget, 'religion', headReligionId);
            setReactive(vmHead, headTarget, 'religion_id', headReligionId);
          }
        }

        if (isVerificationPage && cleanHeadId) {
          const nidInp = document.querySelector('input[name*="nid" i], input[name*="verification" i], input[placeholder*="জাতীয় পরিচয়পত্র"], input[placeholder*="এনআইডি"], input[type="text"]:not([placeholder*="ক্যাপচা"]):not([placeholder*="উত্তর"])');
          if (nidInp && !nidInp.readOnly && !nidInp.disabled) {
            setNativeInputValue(nidInp, cleanHeadId);
          }
        }

        await selectDateViaVuetifyCalendar(h.dob, 0);
      }

      const allPeopleForCount = [];
      if (payload.head) allPeopleForCount.push({ ...payload.head, gender_id: headGenderId });
      if (Array.isArray(payload.family_members)) {
        payload.family_members.forEach(m => {
          allPeopleForCount.push({ ...m, gender_id: resolveGenderId(m) });
        });
      }

      const calcMaleCount = allPeopleForCount.filter(p => Number(p.gender_id) === GENDER_MALE || Number(p.gender_id) === 1).length;
      const calcFemaleCount = allPeopleForCount.filter(p => isFemaleGenderId(p.gender_id)).length;
      const calcOtherGenderCount = 0;
      const calcBideshCount = 0;
      const calcChildrenCount = allPeopleForCount.filter(m => {
        const age = calculateAgeYears(m.dob);
        return age !== null && age >= 0 && age < 18;
      }).length;

      const defs = payload.form_defaults || {};

      const counts = {
        totalMembers: defs.total_members !== undefined ? Number(defs.total_members) : allPeopleForCount.length,
        maleCount: defs.male_count !== undefined ? Number(defs.male_count) : calcMaleCount,
        femaleCount: defs.female_count !== undefined ? Number(defs.female_count) : calcFemaleCount,
        otherGenderCount: 0,
        bideshCount: 0,
        childrenUnder18: defs.children_under_18 !== undefined ? Number(defs.children_under_18) : calcChildrenCount,
        religionId: defs.religion_id !== undefined ? normalizeReligionId(defs.religion_id) : familyReligionId,
        isEthnic: defs.is_ethnic !== undefined ? Number(defs.is_ethnic) : 0,
        areaTypeId: defs.area_type_id !== undefined ? Number(defs.area_type_id) : 1
      };

      let row0IsHead = false;
      let targetMemberList = [];
      let isRefill = false;

      if (vmMembers && Array.isArray(vmMembers.familyMembers)) {
        const row0 = vmMembers.familyMembers[0];
        const r0Id = row0 ? String(row0.verification_number || row0.nid || row0.brn_id || '').trim() : '';
        const hasLockedFirstRowDom = Boolean(document.querySelector('.bg-gray-cursor-not-allowed'));
        // Fresh form: row 0 exists but is completely blank (no relation,
        // no NID/name) — the site expects the head in row 0, so the head
        // must be inserted there. Without this, the head was skipped as a
        // member and the first family member landed in row 0 instead,
        // leaving a blank "সদস্য - 2" behind (seen on the real page).
        // NOTE: this only affects the member-list construction below.
        // row0IsHead keeps its original meaning for the DOB-calendar
        // offset and gender-select indexing, which depend on how the
        // site renders a locked head row vs a fresh one.
        const row0IsBlank = !row0 ||
          (!row0.relationship_id && !row0.relation_id && !isRowPopulated(row0));
        row0IsHead = Boolean(
          row0 && (
            Number(row0.relationship_id) === 260 ||
            Number(row0.relation_id) === 260 ||
            Number(row0.relationship_id) === 185 || // legacy: old injector wrote 185
            Number(row0.relation_id) === 185 ||
            (cleanHeadId && r0Id && r0Id === cleanHeadId) ||
            hasLockedFirstRowDom
          )
        );
        const headGoesFirst = row0IsHead || row0IsBlank;

        if (headGoesFirst && payload.head) {
          targetMemberList.push({
            ...payload.head,
            relation: 'Head/Self',
            gender: payload.head.gender || 'Female',
            gender_id: headGenderId,
            religion_id: familyReligionId,
            doc_type: payload.head.doc_type || 'NID',
            nid_or_brn: payload.head.nid,
            relationship_id: 260
          });
        }
        if (Array.isArray(payload.family_members)) {
          targetMemberList.push(...payload.family_members);
        }

        while (vmMembers.familyMembers.length < targetMemberList.length) {
          if (typeof vmMembers.addFamilyMember === 'function') vmMembers.addFamilyMember();
          else vmMembers.familyMembers.push({});
        }

        await new Promise((r) => setTimeout(r, 200));

        // Refill detection: if the form already holds this payload's
        // people (second click on a slow network), later passes must
        // only fill gaps — never re-drive fields the user may have
        // fixed by hand. Snapshot BEFORE the row loop writes.
        const payloadIds = new Set();
        for (const mm of targetMemberList) {
          const pid = String(mm.nid_or_brn || mm.nid || mm.brn_id || mm.verification_number || '').replace(/\s+/g, '');
          if (pid) payloadIds.add(pid);
        }
        isRefill = vmMembers.familyMembers.some((r) => {
          const rid = String((r && (r.verification_number || r.nid || r.brn_id)) || '').replace(/\s+/g, '');
          return rid && payloadIds.has(rid);
        });

        for (let idx = 0; idx < targetMemberList.length; idx++) {
          const m = targetMemberList[idx];
          const row = vmMembers.familyMembers[idx];
          if (!row) continue;

          const cleanId = String(m.nid_or_brn || '').replace(/\s+/g, '');
          const isNID = determineIsNID(m.doc_type, cleanId);
          const genderId = resolveGenderId(m);
          const memReligionId = resolveReligionId(m, familyReligionId);
          let relName = m.relation;
          if (!relName || relName === 'Auto' || !RELATION_ID_MAP[relName]) {
            relName = isFemaleGenderId(genderId) ? 'Daughter' : 'Son';
          }
          const relId = Number(m.relationship_id || RELATION_ID_MAP[relName] || (isFemaleGenderId(genderId) ? 161 : 160));
          const memAge = calculateAgeYears(m.dob);
          const memDobParts = parseDobParts(m.dob);
          const memModelDob = memDobParts ? memDobParts.iso : String(m.dob || '').replace(/\[.*?\]/g, '').replace(/-/g, '/');

          // Refill guard: this row already holds this member — leave
          // it (and any hand tweaks) alone instead of re-driving it.
          if (rowHoldsMember(row, m, { cleanId, isNID, memModelDob, relId, relName, genderId, memReligionId })) continue;

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

          setReactive(vmMembers, row, 'dob', memModelDob);
          setReactive(vmMembers, row, 'date_of_birth', memModelDob);
          if (memAge !== null && 'age' in row) {
            setReactive(vmMembers, row, 'age', memAge);
          }

          setReactive(vmMembers, row, 'name_bn', m.name_bn);
          setReactive(vmMembers, row, 'name_en', m.name_en);
          setReactive(vmMembers, row, 'father_name_bn', m.father_name_bn);
          setReactive(vmMembers, row, 'mother_name_bn', m.mother_name_bn);

          setReactive(vmMembers, row, 'relationship_id', relId);
          setReactive(vmMembers, row, 'relation_id', relId);
          setReactive(vmMembers, row, 'relation', relName);

          setReactive(vmMembers, row, 'gender', genderId);
          setReactive(vmMembers, row, 'gender_id', genderId);
          setReactive(vmMembers, row, 'sex', genderId);

          setReactive(vmMembers, row, 'religion', memReligionId);
          setReactive(vmMembers, row, 'religion_id', memReligionId);

          setReactive(vmMembers, row, 'is_member_disabled', Number(m.is_disabled) === 1 ? 1 : 0);
          setReactive(vmMembers, row, 'is_gov_job_holder', 0);

          // Yes/No radios whose values are known (0/1). The option sync pass
          // below also clicks the matching radio so change handlers fire.
          const memAgeForStudent = calculateAgeYears(m.dob);
          setReactive(vmMembers, row, 'is_currently_student',
            (memAgeForStudent !== null && memAgeForStudent >= 4 && memAgeForStudent <= 24) ? 1 : 0);
          setReactive(vmMembers, row, 'is_ssnp_covered', 0);
          setReactive(vmMembers, row, 'is_dss_training_or_financial_benefit', 0);
          if (m.disability_type_id !== undefined && m.disability_type_id !== null && m.disability_type_id !== '') {
            setReactive(vmMembers, row, 'disability_type_id', Number(m.disability_type_id));
          }

          if (relName === 'Husband' && !row.estimate_annual_income) {
            setReactive(vmMembers, row, 'estimate_annual_income', 60000);
          }

          const dobOffset = row0IsHead ? idx : idx + 1;
          await selectDateViaVuetifyCalendar(m.dob, dobOffset);
        }
      }

      applySmartFormDefaults(vmHead, vmMembers, counts, defs);
      syncAllGenderAndReligionSelects(headGenderId, targetMemberList, row0IsHead, familyReligionId, isVerificationPage);

      // NEW: fill the dropdowns/radios the old injector skipped (livelihood,
      // literacy, education, marital, health, disability type, SSNP/DSS
      // radios, head education/profession/marital, address cascade).
      // First pass now (empty-only on a refill, so hand corrections
      // survive a second click); a second empty-only pass after a
      // short delay catches selects that render late (disability
      // type, cascaded union/ward lists).
      let optionUnfilled = [];
      const gridCheckNotes = [];
      try {
        await new Promise(r => setTimeout(r, 250));
        const memberRows = (vmMembers && Array.isArray(vmMembers.familyMembers)) ? vmMembers.familyMembers : [];
        optionUnfilled = await syncOptionSelects(vmHead, vmMembers, memberRows, targetMemberList, headTarget, payload.head || null, defs, isRefill);
        await new Promise(r => setTimeout(r, 900));
        const lateUnfilled = await syncOptionSelects(vmHead, vmMembers, memberRows, targetMemberList, headTarget, payload.head || null, defs, true);
        optionUnfilled = [...new Set([...optionUnfilled, ...lateUnfilled])];
        // PMT + program additional fields (counts, location, age/education
        // bands). Runs after the option sync so head/spouse education ids
        // are already in the models for the PMT band mapping. A third
        // late pass covers PMT/program data that loads after the form.
        const dynUnfilled = (await syncDynamicSections(vmHead, allVms, headTarget, memberRows, targetMemberList, payload.head || null, counts, defs, false)).unfilled;
        await new Promise(r => setTimeout(r, 600));
        const dynLate = (await syncDynamicSections(vmHead, allVms, headTarget, memberRows, targetMemberList, payload.head || null, counts, defs, true)).unfilled;
        await new Promise(r => setTimeout(r, 2000));
        const dynLast = await syncDynamicSections(vmHead, allVms, headTarget, memberRows, targetMemberList, payload.head || null, counts, defs, true);
        const dynLate2 = dynLast.unfilled;
        gridCheckNotes.push(...(dynLast.gridNotes || []));
        optionUnfilled = [...new Set([...optionUnfilled, ...dynUnfilled, ...dynLate, ...dynLate2])];
        // Bank branch: re-apply the single-option pick late, after the
        // site's payment-processors reload has had a chance to null it.
        try { syncSingleBranch(vmHead, headTarget); } catch (_) {}
        // Same-address checkbox: copy the permanent address into the
        // collection address once the permanent fields are filled.
        try { syncSameAsPermanent(allVms); } catch (_) {}
      } catch (e) {
        optionUnfilled.push('option sync error: ' + e.message);
      }

      // Keep the single branch selected even if the site nulls it a
      // few seconds later (enumerator-bank re-apply). Fire-and-forget.
      try { watchSingleBranch(); } catch (_) {}
      // Keep the PMT/program sections filled even if their data
      // arrives or rebuilds after autofill. Fire-and-forget.
      const finalMemberRows = (vmMembers && Array.isArray(vmMembers.familyMembers)) ? vmMembers.familyMembers : [];
      try { watchDynamicSections(vmHead, allVms, headTarget, finalMemberRows, targetMemberList, payload.head || null, counts, defs); } catch (_) {}
      // Keep the member/head dropdowns filled even if their lookup
      // lists arrive after the option passes. Fire-and-forget.
      try { watchOptionSelects(vmHead, vmMembers, finalMemberRows, targetMemberList, headTarget, payload.head || null, defs); } catch (_) {}

      // Spouse name (shows only when head marital status = Married): fill
      // from the Husband/Wife member when one is in the household.
      try {
        const spouse = (payload.family_members || []).find(mm => mm.relation === 'Husband' || mm.relation === 'Wife');
        const maritalVal = headTarget ? (headTarget.marital_status ?? headTarget.maritalStatus) : undefined;
        if (spouse && headTarget && maritalVal !== undefined && maritalVal !== null && maritalVal !== '') {
          if ('spouse_name_bn' in headTarget || 'spouse_name_en' in headTarget) {
            setReactive(vmHead, headTarget, 'spouse_name_bn', spouse.name_bn);
            setReactive(vmHead, headTarget, 'spouse_name_en', spouse.name_en);
          }
          document.querySelectorAll('.v-input, .form-group').forEach(wrap => {
            if (wrap.closest('#fc-floating-root')) return;
            const lbl = getControlLabel(wrap);
            if (!/স্বামী|স্ত্রীর নাম|spouse/i.test(lbl)) return;
            const inp = wrap.querySelector('input[type="text"], input:not([type])');
            if (!inp || inp.disabled || inp.readOnly) return;
            const isBn = /বাংলা|bangla|_bn|\(bn\)/i.test(lbl);
            setNativeInputValue(inp, isBn ? (spouse.name_bn || '') : (spouse.name_en || ''), wrap.__vue__);
          });
        }
      } catch (_) {}

      if (vmHead && typeof vmHead.$forceUpdate === 'function') vmHead.$forceUpdate();
      if (vmMembers && typeof vmMembers.$forceUpdate === 'function') vmMembers.$forceUpdate();

      const unfilledNote = optionUnfilled.length
        ? ` Needs manual selection: ${optionUnfilled.join('; ')}.`
        : '';
      const gridNote = gridCheckNotes.length
        ? ` Grid check: ${[...new Set(gridCheckNotes)].join('; ')}.`
        : '';
      window.dispatchEvent(new CustomEvent('FC_PRO_AUTOFILL_RESULT', {
        detail: {
          version: FC_INJECT_VERSION,
          success: true,
          message: `Auto-filled ${counts.totalMembers} member(s) [Male: ${counts.maleCount}, Female: ${counts.femaleCount}, Child: ${counts.childrenUnder18}] + Islam & Post Code.${unfilledNote}${gridNote}`
        }
      }));
    } catch (err) {
      window.dispatchEvent(new CustomEvent('FC_PRO_AUTOFILL_RESULT', {
        detail: { version: FC_INJECT_VERSION, success: false, message: `Autofill error: ${err.message}` }
      }));
    } finally {
      autofillInFlight = false;
    }
  });

  window.addEventListener('FC_PRO_PULL_REQUEST', () => {
    const { vmHead, vmMembers, allVms } = getVueNodes();
    if (!vmHead && !vmMembers && (!allVms || !allVms.length)) {
      window.dispatchEvent(new CustomEvent('FC_PRO_PULL_RESULT', {
        detail: { version: FC_INJECT_VERSION, success: false, message: 'No active Vue form instance found on this page.' }
      }));
      return;
    }

    try {
      const d = getHeadTargetObj(vmHead) || {};
      const rawMembers = (vmMembers && Array.isArray(vmMembers.familyMembers)) ? vmMembers.familyMembers : [];

      const row0 = rawMembers[0] || {};
      const dId = String(d.verification_number || d.nid || '').trim();
      const r0Id = String(row0.verification_number || row0.nid || row0.brn_id || '').trim();
      const row0IsHead = Number(row0.relationship_id) === 260 || Number(row0.relationship_id) === 185 || (dId && r0Id && dId === r0Id) || (!dId && rawMembers.length > 0 && !row0.relationship_id);

      const hSource = row0IsHead ? { ...row0, ...d } : d;
      const headVerType = Number(hSource.verification_type || row0.verification_type || 1);
      const headGenVal = normalizeGenderId(hSource.gender_id || hSource.gender || row0.gender_id || row0.gender || GENDER_FEMALE);

      const head = {
        doc_type: headVerType === 2 ? 'BRN' : 'NID',
        gender: headGenVal === GENDER_MALE ? 'Male' : (headGenVal === GENDER_OTHER ? 'Other' : 'Female'),
        gender_id: headGenVal,
        religion: 'Islam',
        religion_id: normalizeReligionId(hSource.religion_id || hSource.religion || 96),
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
        const seen = new WeakSet();
        try {
          return JSON.parse(JSON.stringify(obj || {}, (k, v) => {
            if (k.startsWith('_') || k.startsWith('$') || k === 'vm') return undefined;
            if (typeof v === 'object' && v !== null) {
              if (seen.has(v)) return undefined;
              seen.add(v);
            }
            return v;
          }));
        } catch (e) { return {}; }
      };

      const full_form_dump = {
        pulled_at: new Date().toISOString(),
        page_url: location.href,
        head_data: safeClone(d),
        family_members_raw: safeClone(rawMembers),
        vue_options: {},
        dom_tabs: []
      };

      window.dispatchEvent(new CustomEvent('FC_PRO_PULL_RESULT', {
        detail: { version: FC_INJECT_VERSION, success: true, payload: { head, family_members, full_form_dump } }
      }));
    } catch (err) {
      window.dispatchEvent(new CustomEvent('FC_PRO_PULL_RESULT', {
        detail: { version: FC_INJECT_VERSION, success: false, message: err.message }
      }));
    }
  });
})();

/* Family Card Pro — Vue + Vuetify Form Injector (inject.js) */
(function () {
  'use strict';

  if (window.__FC_INJECTOR_LOADED__) return;
  window.__FC_INJECTOR_LOADED__ = true;

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

  const RELIGION_ID_MAP = { Islam: 1, Hinduism: 2, Buddhism: 3, Christianity: 4, Other: 5 };

  const toBnDigits = (str) => String(str ?? '').replace(/[0-9]/g, d => '০১২৩৪৫৬৭৮৯'[d]);
  const toEnDigits = (str) => String(str ?? '').replace(/[০-৯]/g, d => '০১২৩৪৫৬৭৮৯'.indexOf(d));

  function resolveGenderId(memberObj) {
    if (!memberObj) return 1;
    const combined = `${memberObj.name_en || ''} ${memberObj.name_bn || ''}`;
    if (/\b(?:mst|mosammat|mosa|mosha|begum|khatun|akter|akhter|bibi|parvin|pervin|sultana|rani|bala|devi|kumari)\b|মোছা|মোসা|বেগম|খাতুন|আক্তার|বিবি|পারভীন|সুলতানা|রানী|রাণী|বালা|দেবী|কুমারী/i.test(combined)) {
      return 2;
    }
    if (memberObj.gender_id) return Number(memberObj.gender_id);
    const g = String(memberObj.gender || '').toLowerCase();
    if (g === 'female' || g === '2' || g === 'মহিলা') return 2;
    if (g === 'male' || g === '1' || g === 'পুরুষ') return 1;
    if (g === 'other' || g === '3') return 3;
    if (memberObj.relation && RELATION_GENDER_MAP[memberObj.relation]) {
      return RELATION_GENDER_MAP[memberObj.relation];
    }
    return 1;
  }

  function resolveReligionId(memberObj, fallbackReligionId = 1) {
    if (!memberObj) return fallbackReligionId;
    if (memberObj.religion_id) return Number(memberObj.religion_id);
    const r = String(memberObj.religion || '').trim();
    if (RELIGION_ID_MAP[r]) return RELIGION_ID_MAP[r];
    if (/ইসলাম|islam|muslim/i.test(r)) return 1;
    if (/হিন্দু|hindu|সনাতন/i.test(r)) return 2;
    if (/বৌদ্ধ|buddh/i.test(r)) return 3;
    if (/খ্রিস্টান|christ/i.test(r)) return 4;
    return fallbackReligionId;
  }

  function detectFamilyReligionId(payload) {
    const people = [];
    if (payload?.head) people.push(payload.head);
    if (Array.isArray(payload?.family_members)) people.push(...payload.family_members);
    const allText = people.map(p => `${p?.name_bn || ''} ${p?.name_en || ''} ${p?.father_name_bn || ''} ${p?.mother_name_bn || ''}`).join(' ');
    if (/\b(?:md|mohd|mohammad|muhammad|mst|mosammat|mosa|mosha|khatun|begum|hossain|husain|hossen|islam|rahman|rahim|karim|uddin|ahmed|ahammad|ali|mia|miah|akter|akhter|sheikh|kazi|khandaker|sultana|parvin|bibi|hasan|hassan|abdul|abul|molla|mollah|fatema|ayesha|khadija|jahan|nahar)\b|মোঃ|মো:|মোছাঃ|মোসাঃ|মোছা|মোসা|খাতুন|হোসেন|হুসাইন|ইসলাম|বেগম|আক্তার|রহমান|রহিম|করিম|উদ্দিন|আহমেদ|আহম্মদ|আলী|মিয়া|মিয়া|শেখ|কাজী|খন্দকার|সুলতানা|পারভীন|বিবি|হাসান|আব্দুল|আবুল|মোল্লা|মুহাম্মদ|মোহাম্মদ|ফাতেমা|আয়েশা|খাদিজা|জাহান|নাহার/i.test(allText)) {
      return 1; // Islam
    }
    if (/\b(?:chandra|kumar|rani|bala|devi|chakraborty|bhattacharya|chatterjee|mukherjee|banerjee|barman|ghosh|bose)\b|চন্দ্র|কুমার|রানী|রাণী|বালা|দেবী|চক্রবর্তী|ভট্টাচার্য|চ্যাটার্জী|মুখার্জী|ব্যানার্জী|বর্মন|ঘোষ|বসু/i.test(allText)) {
      return 2; // Hinduism
    }
    if (payload?.form_defaults?.religion_id) return Number(payload.form_defaults.religion_id);
    return 1;
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
      dd,
      mm,
      yyyy,
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
      if ('lazyValue' in vInst) {
        try { vInst.lazyValue = strVal; } catch (_) {}
      }
      if ('internalValue' in vInst) {
        try { vInst.internalValue = strVal; } catch (_) {}
      }
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

    if (vInst && typeof vInst.$forceUpdate === 'function') {
      vInst.$forceUpdate();
    }
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
    if (targetWrap.classList.contains('bg-gray-cursor-not-allowed') || targetWrap.closest('.bg-gray-cursor-not-allowed')) {
      return;
    }

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

  const itemToStr = (it) => (typeof it === 'object' && it !== null)
    ? `${it.text ?? ''} ${it.name_bn ?? ''} ${it.name_en ?? ''} ${it.label ?? ''} ${it.title_bn ?? ''} ${it.title ?? ''} ${it.name ?? ''} ${it.value ?? ''} ${it.id ?? ''} ${it.code ?? ''}`
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
    if ('internalValue' in vInst) {
      try { vInst.internalValue = val; } catch (_) {}
    }
    if ('lazyValue' in vInst) {
      try { vInst.lazyValue = val; } catch (_) {}
    }
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

    const religionPattern = religionId === 2 ? /হিন্দু|সনাতন|hindu/i
      : (religionId === 3 ? /বৌদ্ধ|buddh/i
      : (religionId === 4 ? /খ্রিস্টান|খ্রীষ্টান|christ/i : /ইসলাম|islam|muslim/i));

    if (d) {
      setReactive(vmHead, d, 'location_type', Number(areaTypeId));
      setReactive(vmHead, d, 'house_size', Number(totalMembers));
      setReactive(vmHead, d, 'children_count', Number(childrenUnder18));
      setReactive(vmHead, d, 'religion', Number(religionId));
      setReactive(vmHead, d, 'religion_id', Number(religionId));

      if ('is_ethnic' in d) {
        setReactive(vmHead, d, 'is_ethnic', typeof d.is_ethnic === 'boolean' ? Boolean(isEthnic) : Number(isEthnic));
      }

      ['onChangeLocationType', 'locationTypeChange', 'handleLocationType', 'getUnions', 'getPourashavas'].forEach(fnName => {
        if (vmHead && typeof vmHead[fnName] === 'function') {
          try { vmHead[fnName](Number(areaTypeId)); } catch (_) {}
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
        if (k in d) setReactive(vmHead, d, k, Number(otherGenderCount ?? 0));
      });

      [
        'bidesh_count', 'probashi_count', 'migrant_count', 'expatriate_count',
        'abroad_count', 'abroad_member', 'probashi_member', 'foreign_member',
        'overseas_member', 'probashi', 'bidesh', 'is_probashi', 'is_migrant', 'has_migrant'
      ].forEach(k => {
        if (k in d) {
          setReactive(vmHead, d, k, typeof d[k] === 'boolean' ? Boolean(bideshCount) : Number(bideshCount ?? 0));
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

      Object.keys(d).forEach(k => {
        const low = k.toLowerCase();
        if (typeof d[k] === 'object' && d[k] !== null) return;
        if (/male_member|male_count|total_male|no_of_male|khana_male/.test(low) && !/female/.test(low)) {
          setReactive(vmHead, d, k, Number(maleCount));
        } else if (/female_member|female_count|total_female|no_of_female|khana_female/.test(low)) {
          setReactive(vmHead, d, k, Number(femaleCount));
        } else if (/hijra|third_gender|other_gender|transgender/.test(low)) {
          setReactive(vmHead, d, k, Number(otherGenderCount ?? 0));
        } else if (/probashi|bidesh|migrant|expatriate|abroad|remittance|foreign_member|overseas/.test(low)) {
          setReactive(vmHead, d, k, typeof d[k] === 'boolean' ? Boolean(bideshCount) : Number(bideshCount ?? 0));
        } else if (/religion/.test(low)) {
          setReactive(vmHead, d, k, Number(religionId));
        } else if (postVal && /post_code|postal_code|postcode|post_office|zip/.test(low)) {
          setReactive(vmHead, d, k, postVal);
        }
      });


    document.querySelectorAll('.v-input, .form-group, fieldset').forEach(wrap => {
      if (wrap.closest('#fc-floating-root')) return;
      if (wrap.classList.contains('bg-gray-cursor-not-allowed') || wrap.closest('.bg-gray-cursor-not-allowed')) return;
      if (!wrap.classList.contains('v-input') && wrap.querySelector('.v-input')) return;

      const labelTxt = getControlLabel(wrap);
      if (!labelTxt) return;
      const vInst = getActiveVm(wrap);

      const fillNumericOrTextInput = (valToSet) => {
        const enStr = toEnDigits(valToSet);

        // If this control is a Vuetify dropdown with items, select the item and stop so we don't clobber internalValue
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

      // A. Religion (ধর্ম *) -> Islam (ইসলাম) for Head & all Family Members
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

      // B. Khudro Nrigosthi (খানাটি ক্ষুদ্র নৃগোষ্ঠী কি না *)
      if (/ক্ষুদ্র\s*নৃ\s*[-]?\s*গোষ্ঠী|নৃগোষ্ঠী|ethnic|tribal/.test(labelTxt)) {
        const wantYes = Number(isEthnic) === 1;
        const isMatchText = (t) => {
          const cleanT = String(t || '').replace(/\*/g, '').trim().toLowerCase();
          return wantYes
            ? (cleanT === 'হ্যাঁ' || cleanT === 'yes' || cleanT.includes('হ্যাঁ'))
            : (cleanT === 'না' || cleanT === 'no' || cleanT.includes('না'));
        };
        const isMatchVal = (v) => {
          const cleanV = String(v ?? '').trim().toLowerCase();
          return wantYes
            ? (cleanV === '1' || cleanV === 'true' || cleanV === 'yes' || cleanV === 'হ্যাঁ')
            : (cleanV === '0' || cleanV === '2' || cleanV === 'false' || cleanV === 'no' || cleanV === 'না');
        };

        selectVuetifyItem(vInst, it => {
          if (typeof it === 'object' && it !== null) {
            return isMatchText(itemToStr(it)) || isMatchVal(it.value ?? it.id);
          }
          return isMatchText(it) || isMatchVal(it);
        });

        wrap.querySelectorAll('.v-radio').forEach(vRadEl => {
          const rLbl = (vRadEl.textContent || '').trim();
          const radVm = vRadEl.__vue__;
          const radVal = radVm ? radVm.value : vRadEl.querySelector('input')?.value;
          if (isMatchText(rLbl) || isMatchVal(radVal)) {
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

      // C. Location Type (খানাটি বা বাসস্থানটি কোথায় অবস্থিত *)
      if (/খানাটি\s*বা\s*বাসস্থানটি|বাসস্থানটি\s*কোথায়|বাসস্থানটি\s*কোথায়|খানাটি\s*কোথায়|খানাটি\s*কোথায়|কোথায়\s*অবস্থিত|কোথায়\s*অবস্থিত/.test(labelTxt) && !/এলাকার\s*ধরন/.test(labelTxt)) {
        const areaPattern = areaTypeId === 2 ? /পৌরসভা|pourashava|municipality/i : (areaTypeId === 3 ? /সিটি|city/i : /পল্লী|ইউনিয়ন|ইউনিয়ন|rural|union/i);

        selectVuetifyItem(vInst, it => {
          if (typeof it === 'object' && it !== null) {
            const idMatch = Number(it.id ?? it.value) === Number(areaTypeId);
            return idMatch || areaPattern.test(itemToStr(it));
          }
          return Number(it) === Number(areaTypeId) || areaPattern.test(String(it));
        });

        wrap.querySelectorAll('.v-radio, input[type="radio"]:not(:disabled)').forEach(el => {
          const rLbl = (el.closest('.v-radio, label')?.textContent || el.textContent || '').trim().toLowerCase();
          const radVm = el.__vue__;
          const radVal = radVm ? radVm.value : el.value;
          if (Number(radVal) === Number(areaTypeId) || areaPattern.test(rLbl)) {
            const inp = el.tagName === 'INPUT' ? el : el.querySelector('input[type="radio"]');
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

      // D. Village / Road No
      if (villageVal && /গ্রাম|রাস্তা|পাড়া|মহল্লা|বাসা|হোল্ডিং|village|road|street|house no/.test(labelTxt) && !/সদস্য|member|size|কোথায়|কোথায়|অবস্থিত|এলাকার/.test(labelTxt)) {
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

      // F. Post Code (পোস্ট কোড / ডাকঘর কোড) from Settings Default
      if (postVal && /পোস্ট\s*কোড|পোষ্ট\s*কোড|পোস্ট\s*অফিস|ডাকঘর|post\s*code|postal\s*code|postcode|post_code|zip/i.test(labelTxt)) {
        fillNumericOrTextInput(postVal);
      }

      // G. Male Count (পুরুষ সদস্য সংখ্যা / পুরুষ সংখ্যা / পুরুষ)
      if (/পুরুষ\s*সদস্য|পুরুষের\s*সংখ্যা|পুরুষ\s*সংখ্যা|কতজন\s*পুরুষ|^পুরুষ(\s*\*)?$|male\s*member|male\s*count|number\s*of\s*male|total\s*male/i.test(labelTxt) && !/মহিলা|নারী|female|লিঙ্গ/i.test(labelTxt)) {
        fillNumericOrTextInput(maleCount);
      }

      // H. Female Count (মহিলা সদস্য সংখ্যা / নারী সদস্য সংখ্যা / মহিলা সংখ্যা / মহিলা)
      if (/মহিলা\s*সদস্য|নারী\s*সদস্য|মহিলার\s*সংখ্যা|মহিলা\s*সংখ্যা|নারীর\s*সংখ্যা|নারী\s*সংখ্যা|কতজন\s*মহিলা|^(মহিলা|নারী)(\s*\*)?$|female\s*member|female\s*count|number\s*of\s*female|total\s*female/i.test(labelTxt) && !/লিঙ্গ/i.test(labelTxt)) {
        fillNumericOrTextInput(femaleCount);
      }

      // H2. Hijra / Third Gender Count (হিজড়া / তৃতীয় লিঙ্গ -> Default 0)
      if (/হিজড়া|হিজড়া|তৃতীয়\s*লিঙ্গ|তৃতীয়\s*লিঙ্গ|অন্যান্য\s*লিঙ্গ|hijra|third\s*gender|transgender|other\s*gender/i.test(labelTxt)) {
        fillNumericOrTextInput(otherGenderCount ?? 0);
      }

      // H3. Bidesh / Probashi Member Count or Status (প্রবাসী / বিদেশ / অভিবাসী -> Default 0 or না)
      if (/প্রবাসী|বিদেশ|বিদেশে|অভিবাসী|রেমিট্যান্স|রেমিটেন্স|bidesh|probashi|abroad|migrant|expatriate|remittance|foreign|overseas/i.test(labelTxt)) {
        const bVal = Number(bideshCount ?? 0);
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
              const groupVm = (radVm && radVm.radioGroup) ? radVm.radioGroup : vInst;
              if (groupVm && radVal !== undefined) {
                if ('internalValue' in groupVm) groupVm.internalValue = radVal;
                groupVm.$emit('input', radVal);
                groupVm.$emit('change', radVal);
              }
            }
          });
          triggerVeeValidate(wrap);
        } else {
          fillNumericOrTextInput(bVal);
        }
      }

      // I. Children Under 18 (খানার শিশু সংখ্যা *)
      if (/খানার\s*শিশু\s*সংখ্যা|শিশু\s*সংখ্যা|শিশুর\s*সংখ্যা|১৮\s*বছরের\s*নিচে|কতজন\s*শিশু|number\s*of\s*children|children\s*count/i.test(labelTxt)) {
        fillNumericOrTextInput(childrenUnder18);
      }

      // J. Total Household Members (খানার সদস্য সংখ্যা *)
      if (/খানার\s*সদস্য\s*সংখ্যা|সদস্য\s*সংখ্যা|খানার\s*সদস্য|পরিবারের\s*সদস্য|total\s*member|family\s*size|house\s*size/i.test(labelTxt) && !/শিশু|child|পুরুষ|মহিলা|নারী|হিজড়া|হিজড়া|প্রবাসী|বিদেশ|male|female|hijra|migrant|abroad/i.test(labelTxt)) {
        fillNumericOrTextInput(totalMembers);
      }

      // K. Account Ownership (অ্যাকাউন্টের মালিকানা*) -> Self (নিজ)
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

      // L. Bank Branch Name -> Auto-select if 1 option exists
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
            selectVuetifyItem(vInst, it => it === validItems[0]);
            triggerVeeValidate(wrap);
          }
        }
      }
    });
  }

  function syncAllGenderSelects(headGenderId, memberList, row0IsHead, isVerificationPage) {
    if (isVerificationPage) return;
    const genderSelectVms = [];
    const relationSelectVms = [];

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
      }
    });

    const matchGenderItem = (gid) => (it) => {
      const s = itemToStr(it).toLowerCase();
      if (typeof it === 'object' && it !== null && Number(it.id ?? it.value) === Number(gid)) return true;
      if (Number(gid) === 2) return /মহিলা|নারী|female/i.test(s);
      if (Number(gid) === 1) return /পুরুষ|male/i.test(s) && !/female/i.test(s);
      return /অন্যান্য|হিজড়া|other|third/i.test(s);
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
          relName = gid === 2 ? 'Daughter' : 'Son';
        }
        const relId = Number(m.relationship_id || RELATION_ID_MAP[relName] || (gid === 2 ? 161 : 160));
        selectVuetifyItem(targetEntry.vInst, it => {
          if (typeof it === 'object' && it !== null && Number(it.id ?? it.value) === relId) return true;
          return itemToStr(it).toLowerCase().includes(relName.toLowerCase());
        });
        triggerVeeValidate(targetEntry.wrap);
      });
    }
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
      religion: 'Islam',
      religion_id: Number(m.religion_id || m.religion || 1),
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
      let headGenderId = 2;
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

      const calcMaleCount = allPeopleForCount.filter(p => Number(p.gender_id) === 1).length;
      const calcFemaleCount = allPeopleForCount.filter(p => Number(p.gender_id) === 2).length;
      const calcOtherGenderCount = allPeopleForCount.filter(p => Number(p.gender_id) === 3).length;
      const calcChildrenCount = allPeopleForCount.filter(m => {
        const age = calculateAgeYears(m.dob);
        return age !== null && age >= 0 && age < 18;
      }).length;

      const defs = payload.form_defaults || {};

      const counts = {
        totalMembers: defs.total_members !== undefined ? Number(defs.total_members) : allPeopleForCount.length,
        maleCount: defs.male_count !== undefined ? Number(defs.male_count) : calcMaleCount,
        femaleCount: defs.female_count !== undefined ? Number(defs.female_count) : calcFemaleCount,
        otherGenderCount: defs.other_gender_count !== undefined ? Number(defs.other_gender_count) : 0,
        bideshCount: defs.bidesh_count !== undefined ? Number(defs.bidesh_count) : 0,
        childrenUnder18: defs.children_under_18 !== undefined ? Number(defs.children_under_18) : calcChildrenCount,
        religionId: defs.religion_id !== undefined ? Number(defs.religion_id) : familyReligionId,
        isEthnic: defs.is_ethnic !== undefined ? Number(defs.is_ethnic) : 0,
        areaTypeId: defs.area_type_id !== undefined ? Number(defs.area_type_id) : 1
      };

      let row0IsHead = false;
      let targetMemberList = [];

      if (vmMembers && Array.isArray(vmMembers.familyMembers)) {
        const row0 = vmMembers.familyMembers[0];
        const r0Id = row0 ? String(row0.verification_number || row0.nid || row0.brn_id || '').trim() : '';
        const hasLockedFirstRowDom = Boolean(document.querySelector('.bg-gray-cursor-not-allowed'));
        row0IsHead = Boolean(
          row0 && (
            Number(row0.relationship_id) === 185 ||
            Number(row0.relation_id) === 185 ||
            (cleanHeadId && r0Id && r0Id === cleanHeadId) ||
            hasLockedFirstRowDom
          )
        );

        if (row0IsHead && payload.head) {
          targetMemberList.push({
            ...payload.head,
            relation: 'Head/Self',
            gender: payload.head.gender || 'Female',
            gender_id: headGenderId,
            religion_id: familyReligionId,
            doc_type: payload.head.doc_type || 'NID',
            nid_or_brn: payload.head.nid,
            relationship_id: 185
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
            relName = genderId === 2 ? 'Daughter' : 'Son';
          }
          const relId = Number(m.relationship_id || RELATION_ID_MAP[relName] || (genderId === 2 ? 161 : 160));
          const memAge = calculateAgeYears(m.dob);

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

          const memDobParts = parseDobParts(m.dob);
          const memModelDob = memDobParts ? memDobParts.iso : String(m.dob || '').replace(/\[.*?\]/g, '').replace(/-/g, '/');
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

          if (relName === 'Husband' && !row.estimate_annual_income) {
            setReactive(vmMembers, row, 'estimate_annual_income', 60000);
          }

          const dobOffset = row0IsHead ? idx : idx + 1;
          await selectDateViaVuetifyCalendar(m.dob, dobOffset);
        }
      }

      applySmartFormDefaults(vmHead, vmMembers, counts, defs);
      syncAllGenderSelects(headGenderId, targetMemberList, row0IsHead, isVerificationPage);

      if (vmHead && typeof vmHead.$forceUpdate === 'function') vmHead.$forceUpdate();
      if (vmMembers && typeof vmMembers.$forceUpdate === 'function') vmMembers.$forceUpdate();

      window.dispatchEvent(new CustomEvent('FC_PRO_AUTOFILL_RESULT', {
        detail: {
          success: true,
          message: `Auto-filled ${counts.totalMembers} member(s) [Male: ${counts.maleCount}, Female: ${counts.femaleCount}, Child: ${counts.childrenUnder18}] + Islam & Post Code!`
        }
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
      const d = getHeadTargetObj(vmHead) || {};
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
        religion: 'Islam',
        religion_id: Number(hSource.religion_id || hSource.religion || 1),
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
        detail: { success: true, payload: { head, family_members, full_form_dump } }
      }));
    } catch (err) {
      window.dispatchEvent(new CustomEvent('FC_PRO_PULL_RESULT', {
        detail: { success: false, message: err.message }
      }));
    }
  });
})();

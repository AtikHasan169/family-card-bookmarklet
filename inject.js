/* Family Card Pro — Vue + Vuetify Form Injector (inject.js) */
(function () {
  'use strict';

  if (window.__FC_INJECTOR_LOADED__) return;
  window.__FC_INJECTOR_LOADED__ = true;

  // Version shown in the sidepanel so the user can tell whether the
  // newly uploaded inject.js actually loaded. Bump on every release.
  // v50 was built (address cascade by name) and set aside by the user
  // without ever deploying — the next live version is v51.
  const FC_INJECT_VERSION = 'v59';
  window.FC_INJECT_VERSION = FC_INJECT_VERSION;

  // --- Profession income table (v52) ---
  // Typical annual income (Tk) guessed from a member's livelihood
  // (type-44 ids). User-confirmed 2026-11-22, re-checked against
  // real wages the same day (BBS ag wage ~620/day, garment minimum
  // 12,500/month, BILS domestic ~5,300/month, rural pedal rickshaw
  // net ~300–500/day): Private Job 96000 -> 120000, Garment 120000
  // -> 150000, Domestic 48000 -> 60000, Rickshaw/Van 96000 -> 72000
  // (not every day); Govt Job stays 180000 at the user's call. A
  // real income always wins over this guess; the head and students
  // get 0. Income is never summed or scored — this only fills the
  // required box so the form submits. The panel carries the same
  // table; keep the two in step (tests/profession_income_test.js
  // checks they match).
  // (v52) A guess is no longer one fixed number: each table value
  // is the middle of a +/-7% range (INCOME_RANGE_PCT), rolled once
  // when the income is first guessed and then kept — so families stop
  // looking identical, but the same family always shows the same
  // number. 0-value professions stay exactly 0.
  // (v58) Roll step is 5000 now (was 1000), so guesses read 55000/60000/65000.
  const INCOME_RANGE_PCT = 0.07;
  const INCOME_ROLL_STEP = 5000;
  const PROFESSION_INCOME = {
    210: 60000,  // Agriculture
    211: 84000,  // Business
    212: 120000, // Private Job
    213: 180000, // Govt Job
    214: 72000,  // Day Laborer
    215: 150000, // Garment Worker
    216: 72000,  // Rickshaw/Van Driver
    217: 96000,  // Transport Worker
    218: 72000,  // Hotel/Restaurant Worker
    219: 60000,  // Domestic Worker
    220: 0,      // Student
    221: 24000,  // Apprentice
    222: 0,      // Unemployed
    223: 0,      // Retired
    224: 0,      // Elderly/Disabled/Sick
    225: 0,      // Homemaker
    275: 0,      // Not Applicable
    226: 0       // Others
  };
  function incomeForProfession(professionId) {
    const v = PROFESSION_INCOME[Number(professionId)];
    return v === undefined ? 0 : v;
  }
  function incomeRangeFor(mid) {
    const m = Number(mid) || 0;
    if (m === 0) return { low: 0, high: 0 };
    return {
      low: Math.round(m * (1 - INCOME_RANGE_PCT) / INCOME_ROLL_STEP) * INCOME_ROLL_STEP,
      high: Math.round(m * (1 + INCOME_RANGE_PCT) / INCOME_ROLL_STEP) * INCOME_ROLL_STEP
    };
  }
  function rollIncome(mid) {
    const r = incomeRangeFor(mid);
    if (r.low === r.high) return r.low;
    const steps = Math.round((r.high - r.low) / INCOME_ROLL_STEP);
    return r.low + Math.floor(Math.random() * (steps + 1)) * INCOME_ROLL_STEP;
  }
  function incomeGuessForProfession(professionId) {
    return rollIncome(incomeForProfession(professionId));
  }
  function isGuessedIncome(value, mid) {
    const r = incomeRangeFor(mid);
    return Number(value) >= r.low && Number(value) <= r.high;
  }
  // Head profession income (type-34 ids, v52): the head card never
  // had an income row, so the head always got 0 on Auto-Fill.
  // User-confirmed 2026-11-22, lowered from the member values:
  // Farmer 36000, Business 60000, Service 72000, Day Laborer 48000,
  // Laborer 48000; Housewife/Student/Unemployed/Others 0. Same
  // +/-7% roll as members; the head uses her profession table
  // directly, with no student-age override (Student is 0 here).
  const HEAD_PROFESSION_INCOME = {
    151: 36000, // Farmer (site spells it "Farmar")
    149: 60000, // Business
    107: 72000, // Service
    150: 48000, // Day Laborer
    109: 48000, // Laborer
    181: 0,     // House Wife
    106: 0,     // Student
    108: 0,     // Unemployed
    110: 0      // Others
  };
  function incomeForHeadProfession(professionId) {
    const v = HEAD_PROFESSION_INCOME[Number(professionId)];
    return v === undefined ? 0 : v;
  }
  function incomeGuessForHeadProfession(professionId) {
    return rollIncome(incomeForHeadProfession(professionId));
  }
  // The income guess for an earning adult member: the profession
  // table when the panel resolved a livelihood, else the old rule
  // (Husband 60000, everyone else 0) — both rolled since v52. A
  // known profession whose table value is 0 (Unemployed, Homemaker,
  // Others) stays 0 — only "no profession on file" falls back to
  // the husband default.
  function incomeGuessForMember(member, relName) {
    const raw = member && member.livelihood_profession_id;
    const profId = (raw !== undefined && raw !== null && String(raw).trim() !== '') ? Number(raw) : undefined;
    if (profId !== undefined) return incomeGuessForProfession(profId);
    return relName === 'Husband' ? rollIncome(60000) : 0;
  }
  // --- end profession income table ---

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

  // The site's name rules (app.js: bangla_character / english): a Bangla
  // name holds only Bangla letters, spaces and . : ( ) - , — no English
  // letters; an English name holds only English letters, dots, spaces,
  // commas, hyphens, parentheses. Strip anything else.
  const stripLatinLetters = (str) => String(str ?? '').replace(/[A-Za-z]/g, '').replace(/\s+/g, ' ').trim();
  const stripNonEnglishName = (str) => String(str ?? '').replace(/[^a-zA-Z. ,()\-]/g, '').replace(/\s+/g, ' ').trim();

  // v32: normalize script-sensitive fields once, up front, so every
  // downstream use (row matching, refill check, writing) sees the same
  // clean values. The site only accepts English digits in NID/BRN
  // (checkNumber tests the raw value against ^[1-9][0-9]{9}$ /
  // ^(19|20)[0-9]{15}$) and only its allowed characters in names, so a
  // Bangla-digit NID and wrong-script letters in a name are stripped
  // here instead of failing validation on the form. Mutates the
  // handler's copy of the payload only (postMessage structured-clones
  // it, so the panel's record is untouched).
  function normalizePayloadScripts(payload) {
    if (!payload) return payload;
    const cleanPerson = (p) => {
      if (!p) return;
      ['nid', 'nid_or_brn', 'brn_id', 'verification_number'].forEach((k) => {
        if (p[k] !== undefined && p[k] !== null) p[k] = toEnDigits(String(p[k])).replace(/\s+/g, '');
      });
      // 13-digit old NID -> 17 digits with the birth year (v4.9.47):
      // the site only accepts 10 or 17 digits, so a 13-digit NID
      // would fail validation on the form. Without a DOB there is no
      // birth year to prepend, so it stays 13 digits (the panel
      // already warned about it on the card).
      ['nid', 'nid_or_brn', 'brn_id', 'verification_number'].forEach((k) => {
        const v = p[k];
        if (typeof v === 'string' && /^[0-9]{13}$/.test(v)) {
          const parts = parseDobParts(p.dob);
          const y = parts ? Number(parts.yyyy) : NaN;
          if (y >= 1900 && y <= 2099) p[k] = String(y) + v;
        }
      });
      ['name_bn', 'father_name_bn', 'mother_name_bn'].forEach((k) => {
        if (p[k] !== undefined && p[k] !== null) p[k] = stripLatinLetters(p[k]);
      });
      ['name_en', 'father_name_en', 'mother_name_en'].forEach((k) => {
        if (p[k] !== undefined && p[k] !== null) p[k] = stripNonEnglishName(p[k]);
      });
    };
    cleanPerson(payload.head);
    (Array.isArray(payload.family_members) ? payload.family_members : []).forEach(cleanPerson);
    return payload;
  }

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

  // Exact (fractional) age in years — whole years plus the fraction of
  // the current year since the last birthday. Only the education
  // ladder uses it (HSC below 23.5, Graduate below 25.5, PG below
  // 27.5); everything else keeps whole years from calculateAgeYears.
  function calculateAgeFractional(rawDob) {
    const whole = calculateAgeYears(rawDob);
    if (whole === null || whole < 0) return null;
    const parts = parseDobParts(rawDob);
    if (!parts) return whole;
    const mm = parseInt(parts.mm, 10);
    const dd = parseInt(parts.dd, 10);
    const today = new Date();
    let lastBday = new Date(today.getFullYear(), mm - 1, dd);
    if (lastBday > today) lastBday = new Date(today.getFullYear() - 1, mm - 1, dd);
    const nextBday = new Date(lastBday.getFullYear() + 1, mm - 1, dd);
    const span = nextBday - lastBday;
    if (!span || span <= 0) return whole;
    const age = whole + (today - lastBday) / span;
    return age >= 0 && age < 130 ? age : null;
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
  // the collection address fields, AND it sets the sameAsPermanent
  // flag the submit sends as same_as_permanent (1/0). It is a
  // checkbox, not an option field: click it AT MOST ONCE per autofill
  // run, and only when it is unchecked. Two cases, both mirroring
  // the site's own rules (app.ea9222ad):
  //   (A) The collection address is empty and the permanent address
  //       has something to copy — click to copy permanent ->
  //       collection. Never overwrites an entered (different)
  //       collection address.
  //   (B) BOTH sides are complete and identical — the site's own
  //       draft load checks the box in exactly this case
  //       (sameAsPermanent = addressSideIsComplete("permanent_") &&
  //       addressSideIsComplete("") && addressSidesMatch()). The
  //       copy is then a no-op, but the FLAG is what matters: after
  //       Auto-Fill fills both sides with the same address, the box
  //       otherwise stays unchecked and the submit records
  //       same_as_permanent: 0 even though the addresses match.
  //       The match gate means a different permanent address is
  //       never copied over the collection address.
  // Clicking the real input fires the site's own change handler,
  // including its cascade reloads.
  let sameAsPermanentClickedThisRun = false;
  // The site's addressSidesMatch() pairs, in its order.
  const ADDRESS_SIDE_PAIRS = [
    ['permanent_division_id', 'division_id'],
    ['permanent_district_id', 'district_id'],
    ['permanent_location_type', 'location_type'],
    ['permanent_sub_location_type', 'sub_location_type'],
    ['permanent_thana_id', 'thana_id'],
    ['permanent_union_id', 'union_id'],
    ['permanent_pouro_id', 'pouro_id'],
    ['permanent_city_id', 'city_id'],
    ['permanent_city_thana_id', 'city_thana_id'],
    ['permanent_district_pouro_id', 'district_pouro_id'],
    ['permanent_ward_id_city', 'ward_id_city'],
    ['permanent_ward_id_union', 'ward_id_union'],
    ['permanent_ward_id_pouro', 'ward_id_pouro'],
    ['permanent_ward_id_dist', 'ward_id_dist'],
    ['permanent_post_code', 'post_code'],
    ['permanent_address', 'address'],
  ];
  // The site's addressSideIsComplete(prefix): division + district +
  // location_type + the ward id for that location type (dist ->
  // ward_id_dist, city -> ward_id_city, union + sub 2 ->
  // ward_id_union, union + sub 1 -> ward_id_pouro) + address text.
  function addressSideIsComplete(af, prefix) {
    const a = Number(af[prefix + 'location_type']);
    let ward = null;
    if (a === 1) ward = af[prefix + 'ward_id_dist'];
    else if (a === 3) ward = af[prefix + 'ward_id_city'];
    else if (a === 2 && Number(af[prefix + 'sub_location_type']) === 2) ward = af[prefix + 'ward_id_union'];
    else if (a === 2 && Number(af[prefix + 'sub_location_type']) === 1) ward = af[prefix + 'ward_id_pouro'];
    return !!(af[prefix + 'division_id'] && af[prefix + 'district_id'] && a && ward && af[prefix + 'address']);
  }
  function addressSidesMatch(af) {
    return ADDRESS_SIDE_PAIRS.every(([p, c]) => String(af[p] ?? '') === String(af[c] ?? ''));
  }
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
    const bothCompleteAndMatch = addressSideIsComplete(af, 'permanent_') && addressSideIsComplete(af, '') && addressSidesMatch(af);
    if ((!collEmpty || !permFilled) && !bothCompleteAndMatch) return false;
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
    literacyReadOnly: [/শুধু পড়তে পারেন|শুধু.*পড়তে/i, /can read only/i],
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
    if (!vInst || !Array.isArray(vInst.items) || !vInst.items.length || !patterns) return null;
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

  // (v47) A blank payload value means "no data", never "clear the
  // field": the panel sends '' for a missing name / DOB / ID, and
  // setReactive writes '' straight into the model, wiping a name the
  // site (NID verification / draft hydration) or the user put there
  // — the draft then saved empty. A non-blank value still
  // overwrites, as before: the panel is the source of truth and a
  // name fixed there must still land. Whitespace-only counts as
  // blank; numbers (0 included) are never blank.
  function hasTextVal(v) {
    return v !== undefined && v !== null && (typeof v !== 'string' || v.trim() !== '');
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

  // (v40) Wait for the program allowance values to land: they arrive
  // with the DRAFT data, which is async — waitForFormReady only waits
  // for the static lookup lists, so on a slow connection the pull
  // used to read applicationAllowanceValues while it was still the
  // initial [] and report MFS as unanswered. Polls the live VMs
  // (re-scanning each tick, so a late mount is seen) and returns as
  // soon as any non-empty array exists; a draft that genuinely has
  // no program answers just waits out the timeout, then the pull
  // proceeds with what it has.
  async function waitForProgramValues(timeoutMs = 4000) {
    const t0 = Date.now();
    for (;;) {
      const nodes = getVueNodes();
      const vms = [nodes.vmHead, nodes.vmMembers, ...(nodes.allVms || [])];
      for (const v of vms) {
        if (!v) continue;
        const lists = [v.applicationAllowanceValues, v.data && v.data.applicationAllowanceValues];
        if (lists.some((l) => Array.isArray(l) && l.length)) return true;
      }
      if (Date.now() - t0 > timeoutMs) return false;
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

  // Student flag (v54): the site's member-row question
  // "বর্তমানে শিক্ষার্থী?" (Currently Student? Age 3–34) is filled
  // from this — NOT from age alone any more. The PROFESSION drives
  // it: Student (head profession 106 / member livelihood 220) => Yes
  // at any age, so a hand-picked 25+ student still gets Yes. A panel
  // value (is_currently_student on the record — the user typed it, or
  // the panel derived it from the profession) always wins. Otherwise
  // an explicitly set non-Student profession => No (v56: the
  // profession the user picked beats the age rule); the age rule
  // (6-24 => Yes, 0-5 => No, 25+ => No) only applies when no
  // profession is set. The age-24 cap on DERIVING the Student
  // profession itself is NOT changed here (open question) —
  // only the profession=>Yes linkage is new.
  function studentFlagForMember(m) {
    if (!m) return 0;
    if (m.is_currently_student !== undefined && m.is_currently_student !== null && String(m.is_currently_student).trim() !== '') {
      return Number(m.is_currently_student) ? 1 : 0;
    }
    const isHeadRow = Number(m.relationship_id) === 260 || m.relation === 'Head/Self';
    const prof = isHeadRow ? m.profession : m.livelihood_profession_id;
    if (Number(prof) === (isHeadRow ? 106 : 220)) return 1;
    // (v56) An explicitly set non-Student profession beats the age
    // rule — the profession the user picked wins. The age rule only
    // applies when no profession is set (and only matters when the
    // panel sent a blank flag; a panel value already won above).
    if (prof !== undefined && prof !== null && String(prof).trim() !== '') return 0;
    const a = calculateAgeYears(m.dob);
    if (a === null || a < 0) return 0;
    if (a <= 5) return 0;
    return a <= 24 ? 1 : 0;
  }

  function memberOptionPatterns(m, age, genderId, hasSpouseInHousehold, spousePresence) {
    const relName = m.relation || '';
    const isChild = age !== null && age < 18;
    const isLittleChild = age !== null && age < 6;
    // Student age for profession/livelihood: 6-24 covers Class 1
    // through school, HSC, honours and masters. (v4.9.79: school
    // starts at 6 in Bangladesh — a 4- or 5-year-old has not started
    // studying yet, so they are Not Applicable, not Student.) Kept
    // separate from isChild so marital status still treats only
    // under-18s as unmarried.
    const isStudentAge = age !== null && age >= 6 && age <= 24;
    const female = isFemaleGenderId(genderId);
    const E = LOOKUP_IDS.education, L = LOOKUP_IDS.livelihood, P = LOOKUP_IDS.profession;

    // Education by age band, using the real type-8 ids. The school
    // bands below 18 use whole years, but the top bands switch
    // mid-year on the EXACT age (fractional): HSC below 23.5,
    // Graduate 23.5–25.5 (honours finishes at 24, masters takes
    // 1.2–1.8 years in BD), Post Graduate 25.5–27.5. Age 27.5+ has no
    // guess at all (blank, never Class 1-4) — override via
    // form_defaults if the real level is known.
    let education = null, educationIds = [];
    if (age !== null) {
      const ageFrac = calculateAgeFractional(m.dob);
      const frac = (ageFrac !== null && ageFrac !== undefined) ? ageFrac : age;
      if (age < 3) { education = OPTION_PATTERNS.educationNone; educationIds = [E.none]; }
      else if (age <= 5) { education = OPTION_PATTERNS.educationPrePrimary; educationIds = [E.prePrimary, E.none]; }
      else if (age === 6) { education = OPTION_PATTERNS.educationClass1to4; educationIds = [E.class1, E.class1to4]; }
      else if (age <= 10) { education = OPTION_PATTERNS.educationClass1to4; educationIds = [E.class1to4]; }
      else if (age === 11) { education = OPTION_PATTERNS.educationClass5; educationIds = [E.class5, E.class1to4]; }
      else if (age <= 13) { education = OPTION_PATTERNS.educationClass6to7; educationIds = [E.class6to7, E.class5]; }
      else if (age === 14) { education = OPTION_PATTERNS.educationJsc; educationIds = [E.jsc, E.class6to7]; }
      else if (age === 15) { education = OPTION_PATTERNS.educationClass9; educationIds = [E.class9, E.jsc]; }
      else if (age < 18) { education = OPTION_PATTERNS.educationSsc; educationIds = [E.ssc, E.class9]; }
      else if (frac < 23.5) { education = OPTION_PATTERNS.educationHsc; educationIds = [E.hsc, E.ssc]; }
      else if (frac < 25.5) { education = OPTION_PATTERNS.educationGraduate; educationIds = [E.graduate, E.hsc]; }
      else if (frac < 27.5) { education = OPTION_PATTERNS.educationPg; educationIds = [E.pg, E.graduate]; }
      else { education = null; educationIds = []; } // 27.5+ blank — no Class 1-4 guess
    }

    // Literacy follows education in three levels: নিরক্ষর (88) cannot
    // read or write (243); Play/KG (188) can read only (242); Class 1
    // and above can read and write (241).
    let literacy = null, literacyIds = [];
    if (age !== null) {
      const edu0 = educationIds[0];
      if (edu0 === E.none) { literacy = OPTION_PATTERNS.literacyNo; literacyIds = [LOOKUP_IDS.literacy.no]; }
      else if (edu0 === E.prePrimary) { literacy = OPTION_PATTERNS.literacyReadOnly; literacyIds = [LOOKUP_IDS.literacy.readOnly]; }
      else { literacy = OPTION_PATTERNS.literacyYes; literacyIds = [LOOKUP_IDS.literacy.yes]; }
    }

    let livelihood = null, livelihoodIds = [];
    if (isLittleChild) { livelihood = OPTION_PATTERNS.livelihoodChild; livelihoodIds = [L.childNA, L.others]; }
    else if (isStudentAge) { livelihood = OPTION_PATTERNS.livelihoodStudent; livelihoodIds = [L.student]; }
    else if (female) { livelihood = OPTION_PATTERNS.livelihoodHousewife; livelihoodIds = [L.homemaker]; }
    else { livelihood = OPTION_PATTERNS.livelihoodMale; livelihoodIds = [L.agriculture, L.dayLabourer, L.others]; }

    // Head profession uses the DIFFERENT type-34 list.
    let profession = null, professionIds = [];
    if (isLittleChild) { profession = OPTION_PATTERNS.livelihoodChild; professionIds = [P.others]; }
    else if (isStudentAge) { profession = OPTION_PATTERNS.livelihoodStudent; professionIds = [P.student]; }
    else if (female) { profession = OPTION_PATTERNS.professionHousewife; professionIds = [P.housewife]; }
    else { profession = OPTION_PATTERNS.professionMale; professionIds = [P.farmer, P.dayLabourer, P.labourer, P.others]; }

    let marital = null, maritalIds = [];
    let maritalExcludes = [];
    const marriedIds = () => {
      marital = OPTION_PATTERNS.maritalMarried;
      maritalIds = [LOOKUP_IDS.marital.married];
      // "বিবাহিত" is a substring of "অবিবাহিত" — exclude the unmarried
      // option when we actually want Married.
      maritalExcludes = [/অবিবাহিত|unmarried/i];
    };
    if (isChild) {
      marital = OPTION_PATTERNS.maritalUnmarried;
      maritalIds = [LOOKUP_IDS.marital.unmarried];
    } else if (MARRIED_RELATIONS.includes(relName) || relName === 'Head/Self') {
      // Head default is Married / বিবাহিত (101), with or without a
      // spouse listed yet — the head is married in almost every family
      // here, and the spouse is added by hand afterwards. (Blank was
      // tried in v29 and reverted: with a blank marital the site hides
      // the spouse-name field and the spouse-name fill below is skipped,
      // so nothing got added when Husband was selected.)
      marriedIds();
    } else if (spousePresence && spousePresence.son && relName === 'Son') {
      // Spouse-presence (v4.9.47): a Daughter-in-law in the household
      // proves the (only) Son is married. Age alone never makes
      // anyone married.
      marriedIds();
    } else if (spousePresence && spousePresence.daughter && relName === 'Daughter') {
      // A Son-in-law in the household proves the (only) Daughter is married.
      marriedIds();
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

  // Head education follows the head member row: the head's education is
  // asked twice — once on the head page (data/form.education_status)
  // and once on the সদস্য page (row 0, Head/Self). The row is the
  // source of truth, so a "didn't study" correction on the member page
  // reaches the head page too. Returns null when there is no head row
  // or the row has no education yet.
  function headRowEducationId(memberRows, targetMemberList) {
    if (!Array.isArray(memberRows) || !Array.isArray(targetMemberList)) return null;
    const idx = targetMemberList.findIndex(m => m && ((m.relation || '') === 'Head/Self' || Number(m.relationship_id || m.relation_id || 0) === 260));
    if (idx < 0) return null;
    const row = memberRows[idx];
    if (!row) return null;
    const v = row.education_status_id;
    if (v === undefined || v === null || String(v).trim() === '') return null;
    const n = Number(v);
    return Number.isNaN(n) ? null : n;
  }

  // Head corrections (v25): the panel records the head fields the user
  // changed on the card AFTER a fill, as payload.corrections.head
  // (panel head-record keys). On a re-fill these must OVERWRITE the
  // form's current values — the normal passes only fill empty fields,
  // so without this a correction never lands. Only the listed fields
  // are forced; everything else stays empty-only, so a hand-filled
  // value is never touched. Profession has no row key: the member row
  // uses the different type-44 livelihood list, not the head's type-34
  // profession list. A corrected education also forces PMT Q14 (the
  // head-education band) to be re-derived in the model-only pass.
  const HEAD_CORRECTION_MAP = {
    // Literacy follows the education (v23 rule), so a corrected
    // education also re-derives the head row's literacy_id.
    education_status_id: { head: ['education_status'], row: ['education_status_id', 'literacy_id'], pmt: [14] },
    profession: { head: ['profession'], row: [], pmt: [] },
    marital_status: { head: ['marital_status'], row: ['maritial_status_id'], pmt: [] },
    // Student flag (v54): the head form has no such field (the
    // question lives on the member row only), so head: [] — but the
    // head ROW does, so row: ['is_currently_student']. The count is
    // what matters: a flag correction skips the fast path.
    is_currently_student: { head: [], row: ['is_currently_student'], pmt: [] },
  };
  function headCorrectionSets(correctionsHead) {
    const headKeys = new Set(), rowKeys = new Set(), pmtQids = new Set();
    let count = 0;
    if (correctionsHead && typeof correctionsHead === 'object') {
      for (const key of Object.keys(correctionsHead)) {
        const map = HEAD_CORRECTION_MAP[key];
        if (!map) continue;
        count++;
        map.head.forEach(k => headKeys.add(k));
        map.row.forEach(k => rowKeys.add(k));
        map.pmt.forEach(q => pmtQids.add(q));
      }
    }
    return { headKeys, rowKeys, pmtQids, count };
  }

  // Member corrections (v53): the member-card equivalent of
  // HEAD_CORRECTION_MAP. The panel records the member option fields
  // the user changed on the card after a fill, as
  // payload.corrections.members[idKey] — idKey is the member's
  // NID/BRN, whitespace-stripped (the person, not the row, so it
  // survives reordering and follows her if she becomes head). An
  // education correction also forces the literacy: literacy follows
  // the education (v23 rule), and the panel's literacy_id goes stale
  // when the education is edited on the card, so the sync re-derives
  // it from the corrected education instead of the stale value.
  const MEMBER_CORRECTION_MAP = {
    education_status_id: ['education_status_id', 'literacy_id'],
    livelihood_profession_id: ['livelihood_profession_id'],
    maritial_status_id: ['maritial_status_id'],
    literacy_id: ['literacy_id'],
    health_condition_id: ['health_condition_id'],
    disability_type_id: ['disability_type_id'],
    // Student flag (v54): a hand-picked flag is a member correction —
    // it forces the row radio on a re-fill (and skips the fast path).
    is_currently_student: ['is_currently_student'],
  };
  function memberCorrectionSets(correctionsMembers, targetMemberList) {
    const byIdx = new Map();
    let count = 0;
    if (correctionsMembers && typeof correctionsMembers === 'object' && Array.isArray(targetMemberList)) {
      for (let idx = 0; idx < targetMemberList.length; idx++) {
        const m = targetMemberList[idx];
        if (!m) continue;
        const idKey = String(m.nid_or_brn || m.nid || m.brn_id || m.verification_number || '').replace(/\s+/g, '');
        if (!idKey) continue;
        const corr = correctionsMembers[idKey];
        if (!corr || typeof corr !== 'object') continue;
        const keys = new Set();
        for (const rawKey of Object.keys(corr)) {
          // The panel notifies a marital change as 'marital_status'
          // (the card's key); the member row's key is the site's typo
          // 'maritial_status_id'.
          const key = rawKey === 'marital_status' ? 'maritial_status_id' : rawKey;
          const mapped = MEMBER_CORRECTION_MAP[key];
          if (!mapped) continue;
          count++;
          mapped.forEach(k => keys.add(k));
        }
        if (keys.size) byIdx.set(idx, keys);
      }
    }
    return { byIdx, count };
  }

  // --- Halnagad / other-programme benefit + locked personal fields (v26) ---
  // When an NID is verified, the site checks whether the person is already
  // under another programme (POST family-card-halnagad/eligibility). The
  // form component then carries halnagadCurrentProgram (the programme
  // name) and halnagadMigrateSource ('application' = only applied,
  // 'beneficiary' = already receiving). Only a beneficiary counts as
  // covered (SSNP Yes); an applicant is NOT covered yet.
  // Programme name -> Government Card (lookup type 42). Unknown names
  // map to 0 — the card is left for the user to pick. First-match-wins,
  // so the most specific phrases go first (v53): a scholarship / student
  // stipend is checked before disability — "প্রতিবন্ধী শিক্ষার্থীদের
  // উপবৃত্তি" is a stipend (168), not a disability allowance (162).
  const HALNAGAD_CARD_KEYWORDS = [
    [/উপবৃত্তি|শিক্ষা|scholarship|stipend|education/i, 168],
    [/বয়স্ক|বিধবা|প্রতিবন্ধী|গর্ভবতী|মাতৃত্ব|old age|widow|disabilit|maternity/i, 162],
    [/ভিজিডি|ভিজিএফ|\bvgd\b|\bvgf\b/i, 163],
    [/রেশন|ration/i, 164],
    [/সার|fertilizer/i, 165],
    [/টিসিবি|\btcb\b/i, 166],
    [/মুক্তিযোদ্ধা|muktijoddha|freedom fighter/i, 167],
    [/প্রবাসী|migrant/i, 169],
    [/পেনশন|pension/i, 170],
    [/কৃষি|agricultur/i, 171],
    [/মৎস্য|মৎস্যজীবী|fisher/i, 172],
  ];
  function halnagadCardId(programName) {
    const s = String(programName || '');
    if (!s.trim()) return 0;
    for (const [re, id] of HALNAGAD_CARD_KEYWORDS) {
      if (re.test(s)) return id;
    }
    return 0;
  }
  // The site's locked personal fields (Fi in app.js). Once the site fills
  // one of these from verification/migration, it locks it
  // (isMemberFieldLocked) and the panel must not overwrite it. The lock
  // only ever applies to the self/head member row.
  const LOCKED_PERSONAL_FIELDS = ['name_en', 'name_bn', 'father_name_bn', 'mother_name_bn', 'gender_id', 'maritial_status_id', 'religion_id', 'dob', 'mobile_number', 'verification_type', 'nid', 'brn_id'];
  function lockedFieldSet(row) {
    if (!row || !row.is_self || !Array.isArray(row._lockedFields)) return new Set();
    return new Set(row._lockedFields.filter(f => LOCKED_PERSONAL_FIELDS.includes(f)));
  }
  function isLockedField(row, field) {
    return !!row && !!row.is_self && Array.isArray(row._lockedFields) && row._lockedFields.includes(field);
  }
  // Resolve each member's benefit (SSNP / cards / DSS) from, in order:
  // the panel member's own fields, the Halnagad migration state (head
  // only, beneficiary), the global member_options override, then the
  // default (SSNP No, DSS No, no cards). `provided` marks an explicit
  // value (panel / Halnagad / override) — only those force past the
  // empty-only guard, so a plain default never clobbers a hand-set Yes.
  // Picking cards implies covered (SSNP Yes) unless SSNP was explicitly
  // set to No; SSNP No always clears the cards.
  function resolveMemberBenefits(vmMembers, targetMemberList, defs) {
    const over = (defs && defs.member_options) || {};
    const halnagadProgram = (vmMembers && typeof vmMembers.halnagadCurrentProgram === 'string') ? vmMembers.halnagadCurrentProgram : '';
    const halnagadSource = (vmMembers && typeof vmMembers.halnagadMigrateSource === 'string') ? vmMembers.halnagadMigrateSource : '';
    const halnagadIsBeneficiary = halnagadSource === 'beneficiary' && !!halnagadProgram.trim();
    const halnagadCard = halnagadIsBeneficiary ? halnagadCardId(halnagadProgram) : 0;
    const halnagad = { program: halnagadProgram, source: halnagadSource, isBeneficiary: halnagadIsBeneficiary, cardId: halnagadCard };
    const headIdx = targetMemberList.findIndex(m => m && ((m.relation || '') === 'Head/Self' || Number(m.relationship_id || m.relation_id || 0) === 260));
    const headRowIdx = headIdx >= 0 ? headIdx : 0;
    const byIdx = targetMemberList.map((m, idx) => {
      const b = { ssnp: 0, ssnpProvided: false, facilities: [], facilitiesProvided: false, dss: 0, dssProvided: false };
      const isHead = idx === headRowIdx;
      // Halnagad (head only, beneficiary): SSNP Yes + the mapped card.
      if (isHead && halnagadIsBeneficiary) {
        b.ssnp = 1; b.ssnpProvided = true;
        if (halnagadCard) { b.facilities = [halnagadCard]; b.facilitiesProvided = true; }
      }
      // Panel member fields win over Halnagad (the user can correct it).
      if (m) {
        const ss = (m.is_ssnp_covered === 0 || m.is_ssnp_covered === 1 || m.is_ssnp_covered === '0' || m.is_ssnp_covered === '1') ? Number(m.is_ssnp_covered) : null;
        if (ss !== null) { b.ssnp = ss; b.ssnpProvided = true; }
        if (Array.isArray(m.facilities_ids) && m.facilities_ids.length) { b.facilities = m.facilities_ids.slice(); b.facilitiesProvided = true; }
        const ddRaw = (m.is_dss_training_or_financial_benefit !== undefined && m.is_dss_training_or_financial_benefit !== null) ? m.is_dss_training_or_financial_benefit : m.is_dss_training;
        const dd = (ddRaw === 0 || ddRaw === 1 || ddRaw === '0' || ddRaw === '1') ? Number(ddRaw) : null;
        if (dd !== null) { b.dss = dd; b.dssProvided = true; }
      }
      // Global member_options override (fills what is still unprovided).
      if (!b.ssnpProvided && over.is_ssnp_covered !== undefined && over.is_ssnp_covered !== null) { b.ssnp = Number(over.is_ssnp_covered); b.ssnpProvided = true; }
      if (!b.facilitiesProvided && Array.isArray(over.facilities_ids) && over.facilities_ids.length) { b.facilities = over.facilities_ids.slice(); b.facilitiesProvided = true; }
      if (!b.dssProvided && over.is_dss_training_or_financial_benefit !== undefined && over.is_dss_training_or_financial_benefit !== null) { b.dss = Number(over.is_dss_training_or_financial_benefit); b.dssProvided = true; }
      // Picking cards implies covered — unless SSNP was explicitly No.
      if (!b.ssnpProvided && b.facilities.length) { b.ssnp = 1; b.ssnpProvided = true; }
      // SSNP No means no cards.
      if (b.ssnp === 0) { b.facilities = []; b.facilitiesProvided = false; }
      return b;
    });
    const anyDss = byIdx.some(b => b.dss === 1);
    const providedCount = byIdx.reduce((n, b) => n + ((b.ssnpProvided || b.facilitiesProvided || b.dssProvided) ? 1 : 0), 0);
    return { byIdx, halnagad, anyDss, providedCount };
  }

  // Fill every option control the old injector skipped. `memberRows` are the
  // live Vue row objects (same order as targetMemberList). `headMember` is
  // the payload head (for age/gender/relation-aware head defaults).
  // Returns an array of human-readable "not filled" notes for the result message.
  async function syncOptionSelects(vmHead, vmMembers, memberRows, targetMemberList, headTarget, headMember, defs, onlyEmpty, force) {
    const unfilled = [];
    const forceSets = force || { headKeys: new Set(), rowKeys: new Set() };
    // The head row is the member whose relation is Head/Self (row 0
    // when the head is in the list). Row corrections apply only to it.
    const headRowIdx = targetMemberList.findIndex(m => m && ((m.relation || '') === 'Head/Self' || Number(m.relationship_id || m.relation_id || 0) === 260));
    const memberOverrides = (defs && defs.member_options) || {};
    const headOverrides = (defs && defs.head_options) || {};
    // Per-member benefit (v26): Halnagad / panel member fields /
    // member_options override. Read fresh each pass so a late NID
    // verification that reveals a programme still lands.
    const benefits = resolveMemberBenefits(vmMembers, targetMemberList, defs);

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

    // Spouse-presence marital inference (v4.9.47): a Daughter-in-law
    // proves the Son is married, a Son-in-law proves the Daughter is
    // — but only when there is exactly ONE son / daughter. With
    // several, nobody knows which one is married, so they stay
    // Unmarried and the user picks it by hand.
    const countRel = (rel) => targetMemberList.filter((mm) => mm && mm.relation === rel).length;
    const spousePresence = {
      son: countRel('Daughter-in-law') > 0 && countRel('Son') === 1,
      daughter: countRel('Son-in-law') > 0 && countRel('Daughter') === 1
    };

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
        // A head correction (v25) overwrites the head row's value even
        // when it is already filled — but only the head row, and only
        // the corrected fields. (v53) A member correction does the
        // same for its own row: the panel recorded the field the user
        // changed on that member's card, so the corrected value
        // overwrites. Every other row stays empty-only, so a hand
        // correction ON THE FORM survives a re-fill.
        const memberForcedKeys = (forceSets.memberByIdx && forceSets.memberByIdx.get(idx)) || null;
        const isForcedRowField = (forceSets.rowKeys.has(field.key) && idx === headRowIdx)
          || (memberForcedKeys !== null && memberForcedKeys.has(field.key));
        if (onlyEmpty && !isForcedRowField && !isEmptyModelVal(row[field.key])) continue;
        const age = calculateAgeYears(m.dob);
        const genderId = resolveGenderId(m);
        const pats = memberOptionPatterns(m, age, genderId, hasSpouseInHousehold, spousePresence);
        const patterns = field.patternsOf(pats) || [];
        let overrideVal = memberOverrides[field.key] ?? m[field.key] ?? m[field.key.replace(/_id$/, '')];
        // (v53) A corrected education re-derives the literacy: the
        // panel's literacy_id goes stale when the education is edited
        // on the card, so ignore it and derive from the corrected
        // education (the block below does that when overrideVal is
        // empty). Covers the head row too — its education correction
        // already forces the literacy field.
        if (field.key === 'literacy_id') {
          const eduCorrected = (forceSets.rowKeys.has('education_status_id') && idx === headRowIdx)
            || (memberForcedKeys !== null && memberForcedKeys.has('education_status_id'));
          if (eduCorrected) overrideVal = undefined;
        }
        // Literacy follows the education: নিরক্ষর (88) -> "cannot read
        // or write" (243); Play/KG (188) -> "read only" (242). Class 1+
        // keeps the age-derived "read and write" (241). Literacy is
        // resolved before education in this loop, so check the panel's
        // explicit education (and the row) here.
        if (field.key === 'literacy_id' && (overrideVal === undefined || overrideVal === null || String(overrideVal).trim() === '')) {
          const eduRaw = m.education_status_id ?? m.education_status ?? row.education_status_id;
          let eduLitId = null;
          if (eduRaw !== undefined && eduRaw !== null && String(eduRaw).trim() !== '') {
            if (/^\d+$/.test(String(eduRaw).trim())) {
              const n = Number(eduRaw);
              if (n === LOOKUP_IDS.education.none) eduLitId = LOOKUP_IDS.literacy.no;
              else if (n === LOOKUP_IDS.education.prePrimary) eduLitId = LOOKUP_IDS.literacy.readOnly;
            } else {
              if (OPTION_PATTERNS.educationNone.some(re => re.test(String(eduRaw)))) eduLitId = LOOKUP_IDS.literacy.no;
              else if (OPTION_PATTERNS.educationPrePrimary.some(re => re.test(String(eduRaw)))) eduLitId = LOOKUP_IDS.literacy.readOnly;
            }
          }
          if (eduLitId !== null) overrideVal = eduLitId;
        }
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
      { key: 'is_currently_student', valueOf: (m) => studentFlagForMember(m) },
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
        // A provided benefit (panel / Halnagad / override) forces the
        // radio even when the row already has a value — the user changed
        // the benefit, or the site just revealed it. A plain default
        // stays empty-only so it never clobbers a hand-set Yes.
        const ben = benefits.byIdx[idx] || null;
        let val, forceIt = false;
        if (field.key === 'is_ssnp_covered' && ben && ben.ssnpProvided) { val = ben.ssnp; forceIt = true; }
        else if (field.key === 'is_dss_training_or_financial_benefit' && ben && ben.dssProvided) { val = ben.dss; forceIt = true; }
        // Student flag (v54): a panel value (the user typed it, or the
        // panel derived it from a Student profession) forces the radio
        // even when the row already has a value — the panel is the
        // source of truth, and a 25+ hand-picked student must still
        // land Yes on a re-fill. A plain derivation stays empty-only.
        else if (field.key === 'is_currently_student' && m.is_currently_student !== undefined && m.is_currently_student !== null && String(m.is_currently_student).trim() !== '') { val = Number(m.is_currently_student) ? 1 : 0; forceIt = true; }
        else { val = (overrideVal === undefined || overrideVal === null) ? field.valueOf(m) : Number(overrideVal); }
        if (onlyEmpty && !forceIt && !isEmptyModelVal(row[field.key])) continue;
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
    // The model is written even when the control is not rendered yet
    // (v26): SSNP=1 makes the control appear on the next pass, and the
    // watcher re-runs this block — but the model must hold the cards
    // from the first pass, so a re-fill still lands them.
    targetMemberList.forEach((m, idx) => {
      const row = memberRows[idx];
      if (!row) return;
      const ben = benefits.byIdx[idx] || null;
      // SSNP No clears any cards the row still holds (explicit No only).
      if (ben && ben.ssnpProvided && ben.ssnp === 0 && Array.isArray(row.facilities_ids) && row.facilities_ids.length) {
        setReactive(vmMembers, row, 'facilities_ids', []);
        return;
      }
      const ids = (ben && ben.facilities.length) ? ben.facilities : (m.facilities_ids || memberOverrides.facilities_ids);
      if (!Array.isArray(ids) || !ids.length) return;
      // A provided benefit forces the cards even when the row already
      // has some (the user changed the card); otherwise empty-only.
      const forceIt = !!(ben && ben.facilitiesProvided);
      if (onlyEmpty && !forceIt && !isEmptyModelVal(row.facilities_ids)) return;
      const resolved = ids.map(v => {
        if (typeof v === 'string' && !/^\d+$/.test(v.trim())) return keywordToId(v, FACILITY_KEYWORDS);
        return Number(v);
      }).filter(v => v !== null && !Number.isNaN(v));
      if (resolved.length && JSON.stringify(row.facilities_ids || []) !== JSON.stringify(resolved)) setReactive(vmMembers, row, 'facilities_ids', resolved);
    });

    // ---- Head selects (data.* / form.*): drive the single rendered control.
    if (headTarget && headMember) {
      const headAge = calculateAgeYears(headMember.dob);
      const headGenderId = resolveGenderId({ ...headMember, relation: 'Head/Self' });
      const headPats = memberOptionPatterns(
        { ...headMember, relation: 'Head/Self' }, headAge, headGenderId, hasSpouseInHousehold, spousePresence
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
              // A head correction (v25) overwrites the head form's
              // value even when it is already filled — but only the
              // corrected fields. Everything else stays empty-only.
              if (onlyEmpty && !forceSets.headKeys.has(key) && !isEmptyModelVal(currentVal)) continue;
              // Education: the head member row (সদস্য page) is the source
              // of truth — it wins over the age derivation, unless an
              // explicit head override is set.
              const overrideVal = key === 'education_status'
                ? (headOverrides[key] ?? headRowEducationId(memberRows, targetMemberList))
                : headOverrides[key];
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

    // ---- (v38) Head id fields the pull now brings: bank + address
    // selects. The value is the form's own stored id (the panel
    // keeps it beside the resolved display name). Each entry writes
    // the MODEL when it is empty (which also drives the site's own
    // cascade watchers — division loads districts, and so on) and
    // drives the rendered select when it exists and the id is in its
    // items. A cascade that has not loaded yet simply waits for the
    // next watcher pass. branch_name is included — the existing
    // single-branch watcher only fires when exactly one branch
    // exists, so a many-branch bank needs the pulled id.
    if (headTarget && headMember) {
      // (v38) allVms is not a parameter here — the address tab's model
      // lives on its own component VM, so re-scan for it (the fill
      // does the same at its start and after mounting tabs).
      const afOwnerS = getVueNodes().allVms.find((v) => v && v.addressForm);
      const afS = afOwnerS ? afOwnerS.addressForm : null;
      const headIdFields = [
        { scope: 'data', key: 'account_type', value: headMember.account_type },
        { scope: 'data', key: 'bank_name', value: headMember.bank_name_id },
        { scope: 'data', key: 'branch_name', value: headMember.branch_name_id },
        { scope: 'data', key: 'bank_division_id', value: headMember.bank_division_id },
        { scope: 'data', key: 'bank_district_id', value: headMember.bank_district_id },
        { scope: 'data', key: 'account_owner', value: headMember.account_owner_id },
        { scope: 'data', key: 'mobile_operator', value: headMember.mobile_operator_id },
        { scope: 'addressForm', key: 'division_id', value: headMember.address_division_id },
        { scope: 'addressForm', key: 'district_id', value: headMember.address_district_id },
        { scope: 'addressForm', key: 'thana_id', value: headMember.address_thana_id },
        { scope: 'addressForm', key: 'union_id', value: headMember.address_union_id },
        { scope: 'addressForm', key: 'pouro_id', value: headMember.address_pouro_id },
        { scope: 'addressForm', key: 'city_id', value: headMember.address_city_id },
        { scope: 'addressForm', key: 'city_thana_id', value: headMember.address_city_thana_id },
        { scope: 'addressForm', key: 'district_pouro_id', value: headMember.address_district_pouro_id },
        { scope: 'addressForm', key: 'ward_id_union', value: headMember.address_ward_id === undefined ? undefined : (headMember.address_ward_key === 'ward_id_union' ? headMember.address_ward_id : undefined) },
        { scope: 'addressForm', key: 'ward_id_pouro', value: headMember.address_ward_id === undefined ? undefined : (headMember.address_ward_key === 'ward_id_pouro' ? headMember.address_ward_id : undefined) },
        { scope: 'addressForm', key: 'ward_id_city', value: headMember.address_ward_id === undefined ? undefined : (headMember.address_ward_key === 'ward_id_city' ? headMember.address_ward_id : undefined) },
        { scope: 'addressForm', key: 'ward_id_dist', value: headMember.address_ward_id === undefined ? undefined : (headMember.address_ward_key === 'ward_id_dist' ? headMember.address_ward_id : undefined) },
        { scope: 'addressForm', key: 'permanent_division_id', value: headMember.permanent_address_division_id },
        { scope: 'addressForm', key: 'permanent_district_id', value: headMember.permanent_address_district_id },
        { scope: 'addressForm', key: 'permanent_thana_id', value: headMember.permanent_address_thana_id },
        { scope: 'addressForm', key: 'permanent_union_id', value: headMember.permanent_address_union_id },
        { scope: 'addressForm', key: 'permanent_pouro_id', value: headMember.permanent_address_pouro_id },
        { scope: 'addressForm', key: 'permanent_city_id', value: headMember.permanent_address_city_id },
        { scope: 'addressForm', key: 'permanent_city_thana_id', value: headMember.permanent_address_city_thana_id },
        { scope: 'addressForm', key: 'permanent_district_pouro_id', value: headMember.permanent_address_district_pouro_id },
        { scope: 'addressForm', key: 'permanent_ward_id_union', value: headMember.permanent_address_ward_id === undefined ? undefined : (headMember.permanent_address_ward_key === 'ward_id_union' ? headMember.permanent_address_ward_id : undefined) },
        { scope: 'addressForm', key: 'permanent_ward_id_pouro', value: headMember.permanent_address_ward_id === undefined ? undefined : (headMember.permanent_address_ward_key === 'ward_id_pouro' ? headMember.permanent_address_ward_id : undefined) },
        { scope: 'addressForm', key: 'permanent_ward_id_city', value: headMember.permanent_address_ward_id === undefined ? undefined : (headMember.permanent_address_ward_key === 'ward_id_city' ? headMember.permanent_address_ward_id : undefined) },
        { scope: 'addressForm', key: 'permanent_ward_id_dist', value: headMember.permanent_address_ward_id === undefined ? undefined : (headMember.permanent_address_ward_key === 'ward_id_dist' ? headMember.permanent_address_ward_id : undefined) }
      ];
      for (const f of headIdFields) {
        const want = Number(f.value);
        if (!Number.isFinite(want) || want <= 0) continue;
        const modelObj = f.scope === 'addressForm' ? afS : headTarget;
        const modelVm = f.scope === 'addressForm' ? afOwnerS : vmHead;
        if (!modelObj || !(f.key in modelObj)) continue;
        if (onlyEmpty && !isEmptyModelVal(modelObj[f.key])) continue;
        if (isEmptyModelVal(modelObj[f.key])) setReactive(modelVm, modelObj, f.key, want);
        const list = byField.get(f.scope + '.' + f.key) || [];
        for (const c of list) {
          if (!c.isSelect || c.vInst.disabled || c.vInst.readonly) continue;
          if (!Array.isArray(c.vInst.items) || !c.vInst.items.length) continue;
          const currentVal = c.vInst.internalValue ?? c.vInst.lazyValue;
          if (onlyEmpty && !isEmptyModelVal(currentVal)) continue;
          if (!c.vInst.items.some((it) => Number(optionItemId(c.vInst, it)) === want)) continue;
          selectVuetifyItem(c.vInst, (it) => Number(optionItemId(c.vInst, it)) === want);
          triggerVeeValidate(c.wrap);
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

    // ---- Head education follows the head member row on every pass:
    // a hand correction on the সদস্য page (e.g. Class 1-4 -> "didn't
    // study") reaches the head page within a watcher tick. One way
    // only — the member row is never overwritten from the head form.
    // Runs even on empty-only passes, so it is not blocked by the
    // head field already being filled. An explicit head override
    // (form_defaults.head_options.education_status) still wins.
    const rowEdu = headRowEducationId(memberRows, targetMemberList);
    const hasHeadEduOverride = headOverrides.education_status !== undefined && headOverrides.education_status !== null;
    if (rowEdu !== null && !hasHeadEduOverride && headTarget) {
      for (const scope of ['data', 'form']) {
        const list = byField.get(scope + '.education_status') || [];
        for (const c of list) {
          if (!c.isSelect || c.vInst.disabled || c.vInst.readonly) continue;
          const currentVal = c.vInst.internalValue ?? c.vInst.lazyValue;
          if (String(currentVal ?? '') === String(rowEdu)) continue;
          selectVuetifyItem(c.vInst, it => String(optionItemId(c.vInst, it)) === String(rowEdu));
          setReactive(vmHead, headTarget, 'education_status', rowEdu);
          triggerVeeValidate(c.wrap);
        }
      }
    }

    // ---- Literacy follows education: নিরক্ষর (88) -> cannot read or
    // write (243); Play/KG (188) -> read only (242). Fix a row whose
    // literacy was filled as "Yes" before the education was corrected
    // on the member page. Only when the payload did not set literacy
    // explicitly.
    const litControls = byField.get('member.literacy_id') || [];
    const litOneToOne = litControls.length === memberRows.length;
    targetMemberList.forEach((m, idx) => {
      const row = memberRows[idx];
      if (!row) return;
      const rowEduId = Number(row.education_status_id || 0);
      const wantLit = rowEduId === LOOKUP_IDS.education.none ? LOOKUP_IDS.literacy.no
        : rowEduId === LOOKUP_IDS.education.prePrimary ? LOOKUP_IDS.literacy.readOnly : null;
      if (wantLit === null) return;
      if (String(row.literacy_id ?? '') === String(wantLit)) return;
      const explicitLit = memberOverrides.literacy_id ?? m.literacy_id ?? m.literacy;
      if (explicitLit !== undefined && explicitLit !== null && String(explicitLit).trim() !== '') return;
      setReactive(vmMembers, row, 'literacy_id', wantLit);
      const c = litOneToOne ? litControls[idx] : null;
      if (c && c.isSelect && !c.vInst.disabled && !c.vInst.readonly) {
        selectVuetifyItem(c.vInst, it => String(optionItemId(c.vInst, it)) === String(wantLit));
        triggerVeeValidate(c.wrap);
      }
    });

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
   *   Program 75/77/142 male/female/hijra counts; 96 DSS = Yes (650) if
   *   any member got the DSS benefit, else No (651);
   *   139/140/141 abroad counts = 0.
   * Everything else (house materials, water, fuel, land, rooms,
   * assets, MFS provider, ...) is FACTUAL household data the
   * bookmarklet does not have — it is left for manual selection
   * unless preset via overrides, or covered by a user default
   * (kitchen Yes 297, dining No 292, land 0.5 acre 405, diesel
   * 0 kg 596, LPG 0 kg 590 when the fuel is not LPG — all
   * overridable via form_defaults.pmt):
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
  // (v42) The allowance entry's FIELD key has TWO spellings on the
  // site, and the pull only knew one of them. The API-shaped data the
  // user pasted (and every test fixture built from it) uses the
  // SINGULAR key, allowance_program_additional_field_id — but the
  // live form's own code builds d.application_allowance_values with
  // the PLURAL key, allowance_program_additional_fields_id (verified
  // in app.ea9222ad: the fresh-form builder, the draft hydrator, the
  // submit payload builder and the merge lookup all use the plural
  // spelling), while the program component's camelCase
  // applicationAllowanceValues uses the singular one. The pull's
  // merge matched only the singular key, so every entry from the
  // draft's own snake_case list parsed as NaN and was dropped — MFS
  // stayed "—" on the live site even after the v40 empty-array fix,
  // because on the draft-edit page that list is the ONLY populated
  // one (the component's camelCase array stays empty there). Every
  // field-id match in the file now goes through this helper, which
  // accepts either spelling. The VALUE key,
  // allowance_program_additional_field_values_id, is spelled the same
  // in both shapes, so it needs no such treatment.
  function allowanceFieldId(x) {
    if (!x) return NaN;
    const v = x.allowance_program_additional_field_id ?? x.allowance_program_additional_fields_id;
    return Number(v);
  }

  function resolveProgramState(vmHead, allVms, headTarget) {
    // (v40) Prefer a NON-EMPTY applicationAllowanceValues array: the
    // main form component initialises it to [] and it only fills when
    // the draft data lands, so taking the first array found (v38)
    // let an empty array shadow the populated one on the program
    // component — and the pull then read MFS as unanswered even
    // though বিকাশ was selected on the program tab. If every array
    // is empty, fall back to the first one found (the fill only ever
    // mutates entries that already exist, so returning the populated
    // array is safe for it too).
    let values = null, fields = null, firstValues = null;
    const consider = (v) => {
      if (!v) return;
      if (Array.isArray(v.applicationAllowanceValues)) {
        if (!firstValues) firstValues = v.applicationAllowanceValues;
        if (!values && v.applicationAllowanceValues.length) values = v.applicationAllowanceValues;
      }
      if (!fields && Array.isArray(v.displayAdditionalFields) && v.displayAdditionalFields.length) fields = v.displayAdditionalFields;
      if (v.data) {
        if (Array.isArray(v.data.applicationAllowanceValues)) {
          if (!firstValues) firstValues = v.data.applicationAllowanceValues;
          if (!values && v.data.applicationAllowanceValues.length) values = v.data.applicationAllowanceValues;
        }
        if (!fields && Array.isArray(v.data.displayAdditionalFields) && v.data.displayAdditionalFields.length) fields = v.data.displayAdditionalFields;
      }
    };
    consider(vmHead);
    if (headTarget) consider(headTarget);
    (allVms || []).forEach(consider);
    return { values: values || firstValues, fields };
  }

  // Cash usage — the 2500 Tk distribution (v27). The form component
  // holds cashUsageRows (one row per type-46 category: lookup_id,
  // amount, other_detail, value_bn/value_en, keyword). The panel sends
  // payload.cash_usages = [{lookup_id, amount, other_detail}]; the
  // site's own buildCashUsagesPayload reads the rows back on submit,
  // so writing the rows IS the fill. A panel-provided amount is a
  // deliberate user choice, so it overwrites the row (like a provided
  // benefit), it does not wait for the row to be empty. The panel
  // already caps the total at the site's cash_usage_cap (2500).
  function syncCashUsage(vmHead, allVms, payload) {
    if (!payload || !Array.isArray(payload.cash_usages) || !payload.cash_usages.length) return { filled: 0, total: 0 };
    const wants = new Map();
    for (const u of payload.cash_usages) {
      const lid = Number(u.lookup_id || u.id || 0);
      const amt = Number(u.amount || 0);
      if (lid && amt > 0) wants.set(lid, { amount: amt, other_detail: (u.other_detail || '').toString().trim() || null });
    }
    if (!wants.size) return { filled: 0, total: 0 };
    const owner = (allVms || []).find((v) => v && Array.isArray(v.cashUsageRows)) || vmHead;
    if (!owner) return { filled: 0, total: 0 };
    if ((!Array.isArray(owner.cashUsageRows) || !owner.cashUsageRows.length) && typeof owner.ensureCashUsageRows === 'function') {
      try { owner.ensureCashUsageRows(); } catch (_) {}
    }
    const rows = Array.isArray(owner.cashUsageRows) ? owner.cashUsageRows : [];
    let filled = 0;
    let total = 0;
    for (const row of rows) {
      const lid = Number(row.lookup_id || 0);
      const w = wants.get(lid);
      if (!w) continue;
      if (Number(row.amount || 0) !== w.amount) setReactive(owner, row, 'amount', w.amount);
      if (w.other_detail !== null && String(row.other_detail || '') !== w.other_detail) setReactive(owner, row, 'other_detail', w.other_detail);
      filled++;
      total += w.amount;
    }
    return { filled, total };
  }

  // Read the cash usage rows back for Pull Draft, so the panel can
  // show (and correct) amounts already on the form (v27).
  function readCashUsages(vmHead, allVms) {
    const owner = (allVms || []).find((v) => v && Array.isArray(v.cashUsageRows)) || vmHead;
    if (!owner || !Array.isArray(owner.cashUsageRows)) return { usages: [], cap: 2500 };
    const cap = Number(owner.cashUsageCapOverride || owner.cash_usage_cap || 2500) || 2500;
    const usages = owner.cashUsageRows
      .filter((r) => r && Number(r.amount || 0) > 0)
      .map((r) => ({ lookup_id: Number(r.lookup_id || 0), amount: Number(r.amount || 0), other_detail: r.other_detail || null }));
    return { usages, cap };
  }

  async function syncDynamicSections(vmHead, allVms, headTarget, memberRows, targetMemberList, headMember, counts, defs, onlyEmpty, forcePmt) {
    const unfilled = [];
    const gridNotes = [];
    const seenPmt = new Set();
    const seenProgram = new Set();
    const pmtOverrides = (defs && defs.pmt) || {};
    const progOverrides = (defs && defs.program_fields) || {};
    const pulledPmt = (defs && defs.pulledPmt instanceof Map) ? defs.pulledPmt : null;
    const hasSpouseInHousehold = targetMemberList.some(mm => mm.relation === 'Husband' || mm.relation === 'Wife');

    const headAge = headMember ? calculateAgeYears(headMember.dob) : null;
    // Q14 (head education band) reads the head MEMBER row first — the
    // source of truth for education (v19) — falling back to the head
    // form. The head form's education_status is only set when the head
    // tab's education select is rendered; on the real site the fill
    // often runs from the member tab, so the head form stays empty
    // while the member row IS filled (Class 1-4) — and Q14 never
    // derived, even though Q18 (spouse, read from the spouse row)
    // filled fine. Reading the row fixes that.
    // A head education correction (v25) wins over both: the row may
    // not be rendered yet, but the corrected id is the truth.
    const headRowEdu = headRowEducationId(memberRows, targetMemberList);
    const correctedHeadEdu = (forcePmt && forcePmt.headEduId) ? Number(forcePmt.headEduId) : 0;
    const headEduId = Number(correctedHeadEdu || headRowEdu || (headTarget ? headTarget.education_status : 0) || 0);
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
    derivedPmt.set(36, 297); // separate kitchen: হ্যা (Yes) — common (user default); override via form_defaults.pmt
    derivedPmt.set(33, 292); // separate dining room: না (No) — uncommon (user default); override via form_defaults.pmt
    derivedPmt.set(25, 405); // land: ০.৫০ একর বা তার কম (0.5 acre or less) — most common (user default); override via form_defaults.pmt
    derivedPmt.set(595, 596); // diesel use: ০ কেজি (0 kg) — most common (user default); override via form_defaults.pmt
    // LPG amount: ০ কেজি (0 kg) when the cooking fuel is not LPG (the
    // fuel preset is wood 550; an LPG fuel override 556 leaves the
    // amount for a manual pick).
    if (Number(pmtOverrides[548] ?? 550) !== 556) derivedPmt.set(579, 590);

    const derivedProg = new Map();
    derivedProg.set(75, { number: counts.maleCount });
    derivedProg.set(77, { number: counts.femaleCount });
    derivedProg.set(142, { number: counts.otherGenderCount || 0 });
    // DSS training (96): Yes (650) if ANY member got the DSS benefit,
    // else No (651). Read from the live rows (already benefit-filled by
    // the row loop / radio sync above) and the panel list as a backup.
    const anyDssMember = memberRows.some(r => r && Number(r.is_dss_training_or_financial_benefit) === 1)
      || targetMemberList.some(m => m && Number(m.is_dss_training_or_financial_benefit) === 1);
    derivedProg.set(96, anyDssMember ? 650 : 651);
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

    // Resolve one control's answer: override > derivation > pulled
    // (v42: the draft's saved answer, last resort only). Returns
    // { ids: [...] } or null.
    const resolveChoice = (vInst, key, derived, overrides, pulled) => {
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
      if (derived !== undefined) {
        if (Array.isArray(derived)) {
          // Multi-answer derivation (e.g. Q47 assets): resolve each id.
          const ids = [];
          for (const v of derived) {
            const item = matchIdItem(vInst, Number(v));
            if (item) ids.push(optionItemId(vInst, item));
            else if (!Number.isNaN(Number(v))) ids.push(Number(v));
          }
          if (ids.length) return { ids };
        } else if (derived && typeof derived === 'object' && derived.number !== undefined) {
          const item = matchNumberItem(vInst, derived.number);
          if (item) return { ids: [optionItemId(vInst, item)] };
        } else {
          const item = matchIdItem(vInst, derived);
          if (item) return { ids: [optionItemId(vInst, item)] };
        }
      }
      // Pulled fallback: the draft's saved answer for this question.
      // Only reached when neither an override nor a derivation
      // resolved anything. Numeric ids are trusted (as overrides are).
      if (pulled !== undefined && pulled !== null) {
        const list = Array.isArray(pulled) ? pulled : [pulled];
        const ids = [];
        for (const v of list) {
          const item = matchIdItem(vInst, Number(v));
          if (item) ids.push(optionItemId(vInst, item));
          else if (!Number.isNaN(Number(v))) ids.push(Number(v));
        }
        if (ids.length) return { ids };
      }
      return null;
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
        const choice = resolveChoice(c.vInst, ident.id, derivedPmt.get(ident.id), pmtOverrides, pulledPmt ? pulledPmt.get(ident.id) : undefined);
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
      const allQids = new Set([...derivedPmt.keys(), ...Object.keys(pmtOverrides).map(Number), ...(pulledPmt ? [...pulledPmt.keys()] : [])]);
      for (const qid of allQids) {
        const entry = findPmtEntry(qid);
        if (!entry) continue;
        const question = pmtVariables.find(q => Number(q.id) === Number(qid));
        if (!question || !Array.isArray(question.children) || !question.children.length) continue;
        const fakeVInst = { items: question.children, itemValue: 'id', returnObject: false };
        const choice = resolveChoice(fakeVInst, qid, derivedPmt.get(qid), pmtOverrides, pulledPmt ? pulledPmt.get(qid) : undefined);
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
          // A corrected head education (v25) re-derives Q14 even when
          // it is already filled — the band must follow the new
          // education. Every other question stays empty-only here.
          if (!isEmptyModelVal(entry.sub_variables) && !(forcePmt && forcePmt.qids && forcePmt.qids.has(qid))) continue;
          setReactive(pmtOwnerVm, entry, 'sub_variables', choice.ids[0]);
        }
      }
    }
    const { values: progValues, fields: progFields } = resolveProgramState(vmHead, allVms, headTarget);
    if (Array.isArray(progValues) && Array.isArray(progFields)) {
      const allFids = new Set([...derivedProg.keys(), ...Object.keys(progOverrides).map(Number)]);
      for (const fid of allFids) {
        const entry = progValues.find(e => e && allowanceFieldId(e) === Number(fid));
        if (!entry) continue;
        // A forced question (v26: program 96 DSS, re-derived from the
        // members) overwrites even when already filled — same rule as
        // the PMT pass above. Everything else stays empty-only.
        if (!isEmptyModelVal(entry.allowance_program_additional_field_values_id) && !(forcePmt && forcePmt.qids && forcePmt.qids.has(fid))) continue;
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
  function watchDynamicSections(vmHead, allVms, headTarget, memberRows, targetMemberList, headMember, counts, defs, forcePmt) {
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
        const res = await syncDynamicSections(vh, fresh.allVms || allVms, ht, memberRows, targetMemberList, headMember, counts, defs, true, forcePmt);
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
            const e = progVals.find(x => x && allowanceFieldId(x) === Number(id));
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
  function watchOptionSelects(vmHead, vmMembers, memberRows, targetMemberList, headTarget, headMember, defs, force) {
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
        await syncOptionSelects(vh, vm, rows, targetMemberList, ht, headMember, defs, true, force);
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

  // Pull helper (v36): a lookup id from the form model — a finite
  // number above 0, else undefined (JSON drops undefined, so the
  // panel sees "not on the form" instead of a bogus 0).
  function pullId(v) {
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? n : undefined;
  }

  // (v38) Like pullId, but 0 counts — an annual income of 0 is a
  // real answer (the head's income), not a missing one.
  function pullNum(v) {
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
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
      // (No member mobile: the form never renders a mobile input on a
      // member row. v4.9.50.)
      name_bn: m.name_bn || '',
      name_en: m.name_en || '',
      father_name_bn: m.father_name_bn || '',
      father_name_en: m.father_name_en || '',
      mother_name_bn: m.mother_name_bn || '',
      mother_name_en: m.mother_name_en || '',
      is_disabled: Number(m.is_member_disabled) === 1 ? 1 : 0,
      // Dropdown values (v36): the pull never read these, so the
      // panel showed the DOB guess (or blank) instead of what the
      // form holds. The panel already keeps all of them from a pull
      // payload (normalizeOutput) — the injector just never sent
      // them. (literacy / student / income are NOT sent: the panel
      // derives them from education + age, it has no card field for
      // them.)
      education_status_id: pullId(m.education_status_id),
      livelihood_profession_id: pullId(m.livelihood_profession_id),
      maritial_status_id: pullId(m.maritial_status_id),
      disability_type_id: pullId(m.disability_type_id),
      health_condition_id: pullId(m.health_condition_id),
      // (v38) The rest of the member row's own fields: literacy
      // (the panel derives it from education, but the form's own
      // answer is the ground truth), annual income (the panel used
      // to guess 0 / 60000 — the form holds the real number, e.g.
      // 150000 for the husband), and the government-job flag.
      literacy_id: pullId(m.literacy_id),
      estimate_annual_income: pullNum(m.estimate_annual_income),
      is_gov_job_holder: (m.is_gov_job_holder === 0 || m.is_gov_job_holder === 1) ? Number(m.is_gov_job_holder) : undefined,
      // Benefit (v26): what the form itself holds for this member.
      is_ssnp_covered: (m.is_ssnp_covered === 0 || m.is_ssnp_covered === 1) ? Number(m.is_ssnp_covered) : null,
      facilities_ids: Array.isArray(m.facilities_ids) ? m.facilities_ids.slice() : [],
      is_dss_training_or_financial_benefit: (m.is_dss_training_or_financial_benefit === 0 || m.is_dss_training_or_financial_benefit === 1) ? Number(m.is_dss_training_or_financial_benefit) : null,
      // Locked official fields (v26): the site's _lockedFields for this
      // row — the panel must take the pulled values for these, never its
      // own AI reading.
      _lockedFields: Array.isArray(m._lockedFields) ? m._lockedFields.filter(f => LOCKED_PERSONAL_FIELDS.includes(f)) : []
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

  // True when every field the passes would fill is already filled:
  // member/head dropdowns + radios, PMT + program derivable entries,
  // and the single-option branch pick. Used by the fast path so a
  // re-click on a filled form returns in under a second instead of
  // re-driving everything. Conservative: anything unknown or empty
  // means "not fully filled" (the normal passes run).
  function isFormFullyFilled(vmHead, vmMembers, allVms, headTarget, targetMemberList, counts, defs) {
    const rows = (vmMembers && Array.isArray(vmMembers.familyMembers)) ? vmMembers.familyMembers : [];
    if (!targetMemberList.length || rows.length < targetMemberList.length) return false;
    const mKeys = ['literacy_id', 'education_status_id', 'livelihood_profession_id', 'health_condition_id', 'maritial_status_id', 'is_currently_student', 'is_ssnp_covered', 'is_dss_training_or_financial_benefit'];
    for (let idx = 0; idx < targetMemberList.length; idx++) {
      const row = rows[idx];
      if (!row) return false;
      for (const k of mKeys) if (isEmptyModelVal(row[k])) return false;
      if (Number(row.is_member_disabled) === 1 && isEmptyModelVal(row.disability_type_id)) return false;
    }
    if (!headTarget) return false;
    for (const k of ['education_status', 'profession', 'marital_status']) {
      if (isEmptyModelVal(headTarget[k])) return false;
    }
    // PMT: every derivable question answered. Questions with an
    // explicit null/false override are skipped (nothing to verify).
    const { pmtArray } = resolvePmtState(vmHead, allVms, headTarget);
    if (pmtArray) {
      const pmtOverrides = (defs && defs.pmt) || {};
      const wantPmt = [576, 530, 571, 1, 7, 12, 14, 18, 29, 47, 548, 40, 567, 41];
      for (const qid of wantPmt) {
        const ov = pmtOverrides[qid];
        if (ov === null || ov === false) continue;
        const e = findPmtEntryIn(pmtArray, qid);
        if (!e || isEmptyModelVal(e.sub_variables)) return false;
      }
      // Q47 completeness: it is multi-answer, so non-empty is not
      // enough — the full wanted set must be present (default set,
      // or the numeric override set; a label override forces the
      // normal passes to resolve it).
      const ov47 = pmtOverrides[47];
      if (ov47 !== null && ov47 !== false) {
        let want47 = [559, 563, 435, 591];
        if (ov47 !== undefined) {
          const list = Array.isArray(ov47) ? ov47 : [ov47];
          if (list.some(v => typeof v === 'string' && !/^\d+$/.test(String(v).trim()))) return false;
          want47 = list.map(v => Number(v)).filter(v => !Number.isNaN(v));
          if (!want47.length) return false;
        }
        const e47 = findPmtEntryIn(pmtArray, 47);
        if (!e47) return false;
        const got47 = (Array.isArray(e47.sub_variables) ? e47.sub_variables : [e47.sub_variables]).map(Number);
        if (!want47.every(id => got47.includes(id))) return false;
      }
    }
    // Program: every derivable field answered (field 77 has no 0
    // option, so it is only required when females exist). When the
    // program section never rendered, there is nothing to verify.
    const { values: progVals } = resolveProgramState(vmHead, allVms, headTarget);
    if (Array.isArray(progVals) && progVals.length) {
      const wantProg = [75, 142, 96, 139, 140, 141];
      if (Number(counts.femaleCount) > 0) wantProg.push(77);
      for (const fid of wantProg) {
        const e = progVals.find(x => x && allowanceFieldId(x) === Number(fid));
        if (!e || isEmptyModelVal(e.allowance_program_additional_field_values_id)) return false;
      }
    }
    // Single-option branch pick (only when such a control exists
    // with exactly one valid option, mirroring syncSingleBranch).
    const bc = findBranchControl();
    if (bc && Array.isArray(bc.vInst.items) && isEmptyModelVal(headTarget.branch_name)) {
      const validItems = bc.vInst.items.filter(it => {
        if (typeof it === 'object' && it !== null) {
          const v = it.value ?? it.id ?? it.code;
          return v !== undefined && v !== null && String(v).trim() !== '';
        }
        return String(it ?? '').trim() !== '';
      });
      if (validItems.length === 1) return false;
    }
    return true;
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
    // A difference in a site-locked field (Fi) is NOT a mismatch — the
    // site's official value wins and the panel must not overwrite it
    // (v26). The NID/BRN above stays the anchor: a different id is a
    // different person, locked or not.
    const locked = lockedFieldSet(row);
    if (!locked.has('dob') && s(row.dob || row.date_of_birth) !== ctx.memModelDob) return false;
    if (!locked.has('name_bn') && s(row.name_bn) !== s(m.name_bn)) return false;
    if (!locked.has('name_en') && s(row.name_en) !== s(m.name_en)) return false;
    if (!locked.has('father_name_bn') && s(row.father_name_bn) !== s(m.father_name_bn)) return false;
    if (!locked.has('mother_name_bn') && s(row.mother_name_bn) !== s(m.mother_name_bn)) return false;
    if (n(row.relationship_id) !== ctx.relId || s(row.relation) !== ctx.relName) return false;
    if (!locked.has('gender_id') && n(row.gender_id ?? row.gender ?? row.sex) !== ctx.genderId) return false;
    if (!locked.has('religion_id') && n(row.religion_id ?? row.religion) !== ctx.memReligionId) return false;
    // Mobile (v4.9.49): a panel phone that differs from the row's means
    // the row needs re-driving — but only when the panel HAS a phone; a
    // member without one must not break the fast path.
    // (No member mobile check: the form never renders a mobile input
    // on a member row — the only mobile on the form is data.mobile on
    // the head form. v4.9.50.)
    if (n(row.is_member_disabled ?? 0) !== (Number(m.is_disabled) === 1 ? 1 : 0)) return false;
    // Income (v48): a row with an empty income does not fully hold the
    // member — the site validates the field as required on one form
    // variant, so an empty income glows red and blocks the form.
    // Returning false here lets the row loop re-drive the row and the
    // income 0 land, instead of the refill skipping it forever. (The
    // income writes are empty-only, so a hand-typed income is never
    // overwritten.)
    if (isEmptyModelVal(row.estimate_annual_income)) return false;
    return true;
  }

  // Head change (v27): when the panel swaps the head, the target list
  // order no longer matches the rows already on the form (the old head
  // sits in row 0, the new head in a member row). Every pass pairs
  // target[i] with row[i], so writing by index would overwrite the
  // wrong people — and a locked row would keep the old NID while
  // taking the new head's other fields. Instead, reorder the live
  // familyMembers array (same reference, Vue tracks splice) so each
  // row holds the target member with its NID. Moving the row objects
  // preserves their locked fields; the passes then only update the
  // relationship and the head form. A fresh form (blank rows) is
  // already in order, so this is a no-op there.
  function reorderMemberRowsToTarget(vmMembers, targetMemberList) {
    if (!vmMembers || !Array.isArray(vmMembers.familyMembers) || !Array.isArray(targetMemberList) || !targetMemberList.length) return false;
    const rows = vmMembers.familyMembers;
    const clean = (v) => String(v ?? '').replace(/\s+/g, '');
    const byId = new Map();
    rows.forEach((r) => {
      if (!r) return;
      const id = clean(r.verification_number || r.nid || r.brn_id);
      if (id && !byId.has(id)) byId.set(id, r);
    });
    const used = new Set();
    const desired = [];
    for (const m of targetMemberList) {
      const id = clean(m.nid_or_brn || m.nid || m.brn_id || m.verification_number);
      let row = (id && byId.get(id)) || null;
      if (row && used.has(row)) row = null;
      if (!row) row = rows.find((r) => r && !used.has(r)) || null;
      if (row) { desired.push(row); used.add(row); }
    }
    rows.forEach((r) => { if (r && !used.has(r)) desired.push(r); });
    let same = desired.length === rows.length;
    if (same) for (let i = 0; i < rows.length; i++) { if (desired[i] !== rows[i]) { same = false; break; } }
    if (same) return false;
    rows.splice(0, rows.length, ...desired);
    return true;
  }

  let autofillInFlight = false;

  window.addEventListener('FC_PRO_AUTOFILL', async (event) => {
    const payload = event.detail;
    if (!payload) return;
    normalizePayloadScripts(payload); // v32: Bangla-digit NID -> English, wrong-script name letters stripped

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

      // (v53) Refill detection, hoisted before the head fill: the head
      // text fills below overwrite on a re-fill (the panel is the
      // source of truth), so they need to know whether this form
      // already holds this payload's people. Same check as the member
      // block's snapshot (recomputed there after rows are added and
      // reordered — same result).
      let isRefill = false;
      if (vmMembers && Array.isArray(vmMembers.familyMembers)) {
        const payloadIds = new Set();
        if (payload.head) {
          const hid = String(payload.head.nid || payload.head.nid_or_brn || payload.head.brn_id || payload.head.verification_number || '').replace(/\s+/g, '');
          if (hid) payloadIds.add(hid);
        }
        if (Array.isArray(payload.family_members)) {
          for (const mm of payload.family_members) {
            const pid = String(mm.nid_or_brn || mm.nid || mm.brn_id || mm.verification_number || '').replace(/\s+/g, '');
            if (pid) payloadIds.add(pid);
          }
        }
        isRefill = vmMembers.familyMembers.some((r) => {
          const rid = String((r && (r.verification_number || r.nid || r.brn_id)) || '').replace(/\s+/g, '');
          return rid && payloadIds.has(rid);
        });
      }

      const headTarget = getHeadTargetObj(vmHead);
      const familyReligionId = detectFamilyReligionId(payload);

      if (payload.full_form_dump) {
        const dump = payload.full_form_dump;
        if (dump.head_data && headTarget) {
          Object.entries(dump.head_data).forEach(([k, v]) => {
            // (v47) Never write a blank string from a dump — '' means
            // "empty in the source", not "clear the target".
            if (v !== undefined && typeof v !== 'function' && hasTextVal(v)) {
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
              // (v47) Same blank guard as the head dump above.
              if (v !== undefined && typeof v !== 'function' && hasTextVal(v)) {
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
          // The head form is the same person as the self/head member row
          // — its locked fields (verification/migration) are never
          // overwritten; the site's official value wins (v26).
          const headRowForLock = (vmMembers && Array.isArray(vmMembers.familyMembers))
            ? (vmMembers.familyMembers.find(r => r && r.is_self) || vmMembers.familyMembers[0] || null)
            : null;
          const headLocked = lockedFieldSet(headRowForLock);
          if (!headLocked.has('verification_type')) setReactive(vmHead, headTarget, 'verification_type', headIsNID ? 1 : 2);
          // (v47) Never write a blank ID / DOB / name over a filled
          // one: the panel sends '' when it has no value for a
          // person, and that '' used to wipe a name the site (NID
          // verification / draft hydration) or the user had put on
          // the form — the draft then saved empty. A non-blank panel
          // value still overwrites, as before: the panel is the
          // source of truth and a name fixed there must still land.
          if (!headLocked.has('nid') && !headLocked.has('brn_id') && hasTextVal(cleanHeadId)) {
            setReactive(vmHead, headTarget, 'verification_number', cleanHeadId);
            setReactive(vmHead, headTarget, 'nid', headIsNID ? cleanHeadId : '');
            setReactive(vmHead, headTarget, 'brn_id', !headIsNID ? cleanHeadId : '');
          }
          if (!headLocked.has('dob') && hasTextVal(headModelDob)) {
            setReactive(vmHead, headTarget, 'date_of_birth', headModelDob);
            setReactive(vmHead, headTarget, 'dob', headModelDob);
          }

          if (!headLocked.has('name_bn') && hasTextVal(h.name_bn)) setReactive(vmHead, headTarget, 'name_bn', h.name_bn);
          if (!headLocked.has('name_en') && hasTextVal(h.name_en)) setReactive(vmHead, headTarget, 'name_en', h.name_en);
          if (!headLocked.has('father_name_bn')) {
            if (hasTextVal(h.father_name_bn)) setReactive(vmHead, headTarget, 'father_name_bn', h.father_name_bn);
            if (hasTextVal(h.father_name_en)) setReactive(vmHead, headTarget, 'father_name_en', h.father_name_en);
          }
          if (!headLocked.has('mother_name_bn')) {
            if (hasTextVal(h.mother_name_bn)) setReactive(vmHead, headTarget, 'mother_name_bn', h.mother_name_bn);
            if (hasTextVal(h.mother_name_en)) setReactive(vmHead, headTarget, 'mother_name_en', h.mother_name_en);
          }

          // Phone (v4.9.50): the head's mobile — the form asks for it in
          // ONE place only, data.mobile on the head form (required,
          // checkNumberMobile: English digits, 11, starting 01).
          // Member rows never render a mobile input, so only the head
          // gets one. (v53) A mobile corrected in the panel overwrites
          // the site's number on a re-fill — the panel is the source
          // of truth. First fill stays empty-only, and a blank panel
          // value never overwrites (v47).
          if (!headLocked.has('mobile_number') && h.mobile_number) {
            const mob = toEnDigits(String(h.mobile_number)).replace(/\D+/g, '');
            if (mob && (isEmptyModelVal(headTarget.mobile) || (isRefill && String(headTarget.mobile || '') !== mob))) {
              setReactive(vmHead, headTarget, 'mobile', mob);
            }
          }

          // (v38) General + bank text fields the pull now brings: the
          // head form's own text inputs, empty-only. None of these is
          // in the site's locked set, so no lock check is needed. The
          // address text / post code go to both d and the address
          // tab's addressForm (the tab's live model) when it exists.
          const headTextFields = [
            ['spouse_name_bn', h.spouse_name_bn], ['spouse_name_en', h.spouse_name_en],
            ['identification_mark', h.identification_mark], ['nationality', h.nationality],
            ['email', h.email], ['account_name', h.account_name], ['account_number', h.account_number]
          ];
          for (const [key, val] of headTextFields) {
            if (val === undefined || val === null || String(val).trim() === '' || !(key in headTarget)) continue;
            const v = String(val).trim();
            // (v53) Refill correction: a panel value corrected after
            // the first fill overwrites the site's value on a re-fill
            // — the panel is the source of truth. First fill stays
            // empty-only, and a blank panel value never overwrites
            // (v47). Nationality stays empty-only: it has exactly one
            // option (105) and is not a correction target.
            if (isEmptyModelVal(headTarget[key]) || (isRefill && key !== 'nationality' && String(headTarget[key] ?? '') !== v)) {
              setReactive(vmHead, headTarget, key, v);
            }
          }
          // (v46) Nationality: the server's applications.nationality
          // column is NOT NULL, but the pulled record carries ""
          // (the pull stores strOrUndef(d.nationality) -> null, and
          // the loop above skips it) — and the site's draft save
          // (buildDraftFormData) does NOT do the final submit's
          // `data.nationality = this.nationality?.[0]?.id`
          // assignment, so a draft save fails with "Column
          // 'nationality' cannot be null" (the user's Dalimon draft,
          // 2026-11-21 — the uploaded export has
          // head.nationality: null). The nationality lookup has
          // exactly one option (type 33, id 105 Bangladeshi), so
          // fill it from the form's own list when present, else the
          // payload's value when it is a real id, else 105.
          // Empty-only: never overwrites a value already on the form.
          if ('nationality' in headTarget && isEmptyModelVal(headTarget.nationality)) {
            const natList = (vmHead && Array.isArray(vmHead.nationality)) ? vmHead.nationality : null;
            let natId = null;
            if (natList && natList[0] && natList[0].id !== undefined && natList[0].id !== null && String(natList[0].id).trim() !== '') natId = natList[0].id;
            else if (h.nationality !== undefined && h.nationality !== null && String(h.nationality).trim() !== '') natId = h.nationality;
            else natId = 105;
            setReactive(vmHead, headTarget, 'nationality', natId);
          }
          if (h.mfs_number !== undefined && h.mfs_number !== null && String(h.mfs_number).trim() !== '' && 'mfs_number' in headTarget && (isEmptyModelVal(headTarget.mfs_number) || (isRefill && String(headTarget.mfs_number ?? '') !== String(h.mfs_number).trim()))) {
            setReactive(vmHead, headTarget, 'mfs_number', String(h.mfs_number).trim());
          }
          const afOwnerW = (allVms || []).find((v) => v && v.addressForm);
          const afW = afOwnerW ? afOwnerW.addressForm : null;
          const addrTextPairs = [
            ['address', h.address_text], ['post_code', h.address_post_code],
            ['permanent_address', h.permanent_address_text], ['permanent_post_code', h.permanent_address_post_code]
          ];
          for (const [key, val] of addrTextPairs) {
            if (val === undefined || val === null || String(val).trim() === '') continue;
            const v = String(val).trim();
            // (v53) Refill correction, as the head text fields above.
            if (key in headTarget && (isEmptyModelVal(headTarget[key]) || (isRefill && String(headTarget[key] ?? '') !== v))) setReactive(vmHead, headTarget, key, v);
            if (afW && key in afW && (isEmptyModelVal(afW[key]) || (isRefill && String(afW[key] ?? '') !== v))) setReactive(afOwnerW, afW, key, v);
          }

          if (!isVerificationPage) {
            if (!headLocked.has('gender_id')) {
              setReactive(vmHead, headTarget, 'gender', headGenderId);
              setReactive(vmHead, headTarget, 'gender_id', headGenderId);
              setReactive(vmHead, headTarget, 'sex', headGenderId);
            }
            if (!headLocked.has('religion_id')) {
              setReactive(vmHead, headTarget, 'religion', headReligionId);
              setReactive(vmHead, headTarget, 'religion_id', headReligionId);
            }
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

      // (v42) Pulled PMT answers: the panel's Pull brings the draft's
      // saved PMT answers, and Auto-Fill left every non-derivable
      // question to manual selection even though the panel already
      // knew the answer — the live report listed Q36, Q33, Q393, Q30,
      // Q579, Q25, Q22, Q595, Q500. Feed them in as the LAST source
      // (override > derivation > pulled) so a re-fill of the same
      // family completes them. They ride on defs so the late watcher
      // passes see them too. Empty-only, never overwriting a filled
      // answer or a live derivation (when the household changed, the
      // derivation is the fresh truth).
      // (v43) THEY LIVE ON HEAD, not at the top level: the pulled
      // record (and the exported JSON) carries pmt_answers under
      // payload.head — v42 read payload.pmt_answers, which the panel
      // never sends, so the fallback was dead code on the real
      // payload even though its test passed (the test had put them
      // top-level). Read head first, top level as a fallback.
      const pulledPmtAnswers = (payload.head && Array.isArray(payload.head.pmt_answers) && payload.head.pmt_answers.length)
        ? payload.head.pmt_answers
        : payload.pmt_answers;
      if (Array.isArray(pulledPmtAnswers) && pulledPmtAnswers.length) {
        const pulledPmt = new Map();
        for (const a of pulledPmtAnswers) {
          if (!a) continue;
          const qid = Number(a.variable_id);
          const ids = Array.isArray(a.answers)
            ? a.answers.map((x) => Number(x && x.id)).filter((n) => Number.isFinite(n))
            : [];
          if (Number.isFinite(qid) && qid > 0 && ids.length && !pulledPmt.has(qid)) pulledPmt.set(qid, ids);
        }
        if (pulledPmt.size) defs.pulledPmt = pulledPmt;
      }

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
      // isRefill is declared above (hoisted before the head fill, v53)
      // and recomputed below after rows are added/reordered.
      let allRowsMatched = false;
      // Benefit (v26): resolved inside the member block below; declared
      // here so the fast path and the result (outside that block) can
      // read it too.
      let benefits = null;
      let benefitDiffers = false;
      // MFS (v4.9.49): resolved inside the member block below; declared
      // here so the fast path (outside that block) can read it too.
      let mfsDiffers = false;
      // Head change (v27): whether the live rows were reordered to the
      // target order — reported in the result so the panel can say so.
      let rowsReordered = false;
      // Cash usage (v27): how many categories were filled + the total.
      let cashUsage = { filled: 0, total: 0 };

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

        // Head change (v27): if the panel swapped the head, the rows
        // already on the form are in the old order. Reorder them (by
        // NID) to the target order now, so every index-paired pass
        // below writes each person to the row that already holds them.
        // A fresh form is already in order, so this is a no-op there.
        rowsReordered = reorderMemberRowsToTarget(vmMembers, targetMemberList);

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
        allRowsMatched = targetMemberList.length > 0;

        // Benefit (v26): resolve each member's SSNP/cards/DSS once for
        // this fill — the row loop writes it to the model, the radio
        // sync forces it, and the fast path below skips only when it
        // already matches the form.
        benefits = resolveMemberBenefits(vmMembers, targetMemberList, defs);
        benefitDiffers = false;
        benefits.byIdx.forEach((ben, bi) => {
          const r = vmMembers.familyMembers[bi];
          if (!r) return;
          const cur = (k) => { const x = Number(r[k]); return Number.isNaN(x) ? null : x; };
          if (ben.ssnpProvided && cur('is_ssnp_covered') !== ben.ssnp) benefitDiffers = true;
          if (ben.dssProvided && cur('is_dss_training_or_financial_benefit') !== ben.dss) benefitDiffers = true;
          if (ben.facilitiesProvided && ben.facilities.length && JSON.stringify(r.facilities_ids || []) !== JSON.stringify(ben.facilities)) benefitDiffers = true;
          if (ben.ssnpProvided && ben.ssnp === 0 && Array.isArray(r.facilities_ids) && r.facilities_ids.length) benefitDiffers = true;
        });

        // MFS (v4.9.49): a panel MFS pick (program_fields['138']) that
        // differs from the form's field 138 must skip the fast path —
        // the program-fields pass that fills 138 runs behind it, so a
        // new or changed pick would otherwise never reach the form.
        // No pick means no opinion: the fast path is untouched.
        mfsDiffers = false;
        const mfsPick = defs && defs.program_fields && defs.program_fields['138'];
        if (mfsPick !== undefined && mfsPick !== null && String(mfsPick).trim() !== '') {
          const { values: progVals0 } = resolveProgramState(vmHead, allVms, headTarget);
          const e138 = Array.isArray(progVals0) ? progVals0.find(x => x && allowanceFieldId(x) === 138) : null;
          if (!e138 || isEmptyModelVal(e138.allowance_program_additional_field_values_id) || Number(e138.allowance_program_additional_field_values_id) !== Number(mfsPick)) mfsDiffers = true;
        }

        for (let idx = 0; idx < targetMemberList.length; idx++) {
          const m = targetMemberList[idx];
          const row = vmMembers.familyMembers[idx];
          if (!row) { allRowsMatched = false; continue; }

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
          // (v53) But a value the panel corrected after the first
          // fill must still land: the non-identity writes below run
          // for a matched row too, each gated so a hand tweak ON THE
          // FORM is never clobbered — income only when the panel
          // value is present and differs (a blank never overwrites,
          // v47; a 0 only when it is a real value for this person),
          // benefits only when the panel provided them, and the
          // disability type only when the panel carries one. Option
          // fields (education / profession / marital / health /
          // literacy) are forced by the member-corrections path in
          // the option sync below, not here.
          const rowMatched = rowHoldsMember(row, m, { cleanId, isNID, memModelDob, relId, relName, genderId, memReligionId });
          if (rowMatched) {
            const isHeadRowM = relId === 260 || relName === 'Head/Self';
            const isStudentRowM = memAge !== null && memAge >= 6 && memAge <= 24;
            const benM = (benefits && benefits.byIdx[idx]) || null;
            if (benM && benM.ssnpProvided && Number(row.is_ssnp_covered) !== benM.ssnp) setReactive(vmMembers, row, 'is_ssnp_covered', benM.ssnp);
            if (benM && benM.dssProvided && Number(row.is_dss_training_or_financial_benefit) !== benM.dss) setReactive(vmMembers, row, 'is_dss_training_or_financial_benefit', benM.dss);
            if (benM && benM.ssnp === 1 && benM.facilities.length && JSON.stringify(row.facilities_ids || []) !== JSON.stringify(benM.facilities)) {
              setReactive(vmMembers, row, 'facilities_ids', benM.facilities.slice());
            } else if (benM && benM.ssnp === 0 && benM.ssnpProvided && Array.isArray(row.facilities_ids) && row.facilities_ids.length) {
              setReactive(vmMembers, row, 'facilities_ids', []);
            }
            if (m.disability_type_id !== undefined && m.disability_type_id !== null && m.disability_type_id !== '' && Number(row.disability_type_id) !== Number(m.disability_type_id)) {
              setReactive(vmMembers, row, 'disability_type_id', Number(m.disability_type_id));
            }
            const panelInc = m.estimate_annual_income;
            if (panelInc !== undefined && panelInc !== null && String(panelInc).trim() !== '') {
              const panelIncNum = Number(panelInc);
              if (Number.isFinite(panelIncNum) && Number(row.estimate_annual_income) !== panelIncNum) {
                // A 0 only overwrites when it is a real value for
                // this person — a student row is always 0, and a
                // 0-value profession earns 0 — so a stale 0 from an
                // old export never wipes a real income.
                const zeroValueProf = isHeadRowM
                  ? (m.profession !== undefined && m.profession !== null && String(m.profession).trim() !== '' && HEAD_PROFESSION_INCOME[Number(m.profession)] === 0)
                  : (m.livelihood_profession_id !== undefined && m.livelihood_profession_id !== null && String(m.livelihood_profession_id).trim() !== '' && PROFESSION_INCOME[Number(m.livelihood_profession_id)] === 0);
                if (panelIncNum !== 0 || isStudentRowM || zeroValueProf) {
                  setReactive(vmMembers, row, 'estimate_annual_income', panelIncNum);
                }
              }
            }
            continue;
          }
          allRowsMatched = false;

          // A site-locked personal field (Fi) is never overwritten — the
          // site's official value (verification/migration) wins (v26).
          const locked = lockedFieldSet(row);
          if (!locked.has('verification_type')) setReactive(vmMembers, row, 'verification_type', isNID ? 1 : 2);
          if (!locked.has('nid') && !locked.has('brn_id') && hasTextVal(cleanId)) {
            if (isNID) {
              setReactive(vmMembers, row, 'nid', cleanId);
              setReactive(vmMembers, row, 'brn_id', '');
              setReactive(vmMembers, row, 'verification_number', cleanId);
            } else {
              setReactive(vmMembers, row, 'brn_id', cleanId);
              setReactive(vmMembers, row, 'nid', '');
              setReactive(vmMembers, row, 'verification_number', cleanId);
            }
          }

          if (!locked.has('dob') && hasTextVal(memModelDob)) {
            setReactive(vmMembers, row, 'dob', memModelDob);
            setReactive(vmMembers, row, 'date_of_birth', memModelDob);
            if (memAge !== null && 'age' in row) {
              setReactive(vmMembers, row, 'age', memAge);
            }
          }

          if (!locked.has('name_bn') && hasTextVal(m.name_bn)) setReactive(vmMembers, row, 'name_bn', m.name_bn);
          if (!locked.has('name_en') && hasTextVal(m.name_en)) setReactive(vmMembers, row, 'name_en', m.name_en);
          if (!locked.has('father_name_bn') && hasTextVal(m.father_name_bn)) setReactive(vmMembers, row, 'father_name_bn', m.father_name_bn);
          if (!locked.has('mother_name_bn') && hasTextVal(m.mother_name_bn)) setReactive(vmMembers, row, 'mother_name_bn', m.mother_name_bn);

          // Relationship is locked for the self/head row — but an empty
          // one still gets filled (filling is not overwriting).
          if (!row.is_self || isEmptyModelVal(row.relationship_id)) {
            setReactive(vmMembers, row, 'relationship_id', relId);
            setReactive(vmMembers, row, 'relation_id', relId);
            setReactive(vmMembers, row, 'relation', relName);
          }

          if (!locked.has('gender_id')) {
            setReactive(vmMembers, row, 'gender', genderId);
            setReactive(vmMembers, row, 'gender_id', genderId);
            setReactive(vmMembers, row, 'sex', genderId);
          }

          if (!locked.has('religion_id')) {
            setReactive(vmMembers, row, 'religion', memReligionId);
            setReactive(vmMembers, row, 'religion_id', memReligionId);
          }

          // (No member mobile: the form never renders a mobile input on
          // a member row — the only mobile on the form is data.mobile
          // on the head form, filled above. v4.9.50.)

          setReactive(vmMembers, row, 'is_member_disabled', Number(m.is_disabled) === 1 ? 1 : 0);
          setReactive(vmMembers, row, 'is_gov_job_holder', 0);

          // Yes/No radios whose values are known (0/1). The option sync pass
          // below also clicks the matching radio so change handlers fire.
          // Student? (v54) The profession drives it — Student (106/220)
          // => Yes at any age; a panel value wins over the age rule.
          setReactive(vmMembers, row, 'is_currently_student', studentFlagForMember(m));
          // Benefit (v26): the resolved per-member benefit (Halnad /
          // panel / override) wins over the old always-0 default. The
          // radio sync below clicks the matching radio.
          const ben = (benefits && benefits.byIdx[idx]) || null;
          setReactive(vmMembers, row, 'is_ssnp_covered', ben ? ben.ssnp : 0);
          setReactive(vmMembers, row, 'is_dss_training_or_financial_benefit', ben ? ben.dss : 0);
          if (ben && ben.ssnp === 1 && ben.facilities.length) {
            setReactive(vmMembers, row, 'facilities_ids', ben.facilities.slice());
          } else if (ben && ben.ssnp === 0 && ben.ssnpProvided && Array.isArray(row.facilities_ids) && row.facilities_ids.length) {
            setReactive(vmMembers, row, 'facilities_ids', []);
          }
          if (m.disability_type_id !== undefined && m.disability_type_id !== null && m.disability_type_id !== '') {
            setReactive(vmMembers, row, 'disability_type_id', Number(m.disability_type_id));
          }

          // Income (v38): the pull now brings the form's own annual
          // income (e.g. 150000 for the husband) — write it back when
          // the row is empty, instead of the guess below. (v52) The
          // head row is included now: the panel carries the head's
          // income (real or rolled guess). A blank site row starts at
          // 0 (createEmptyFamilyMember), so 0 counts as empty here —
          // otherwise the panel's value would never land on a fresh
          // form. The student 0-rule still applies after it.
          const isHeadRow = relId === 260 || relName === 'Head/Self';
          const isStudentRow = memAge !== null && memAge >= 6 && memAge <= 24;
          if (!isStudentRow && m.estimate_annual_income !== undefined && m.estimate_annual_income !== null && String(m.estimate_annual_income).trim() !== '' && (isEmptyModelVal(row.estimate_annual_income) || Number(row.estimate_annual_income) === 0)) {
            setReactive(vmMembers, row, 'estimate_annual_income', Number(m.estimate_annual_income));
          }

          // Income: students earn nothing — keep it 0. (v52) The head
          // row guesses from her profession table instead of always
          // 0: a 0 only stands for a 0-value head profession — an old
          // panel always sent 0, so a 0 with an earning profession is
          // guessed (incomeGuessForHeadProfession above); the panel's
          // own value was already written by the branch above when
          // the row was empty. Otherwise guess from the profession
          // (the panel's resolved livelihood, incomeGuessForMember
          // above): a husband with no profession on file keeps the
          // old 60000 (rolled since v52), everyone else with nothing
          // known gets 0. (v48) An empty income glows red and blocks
          // the form on one variant, so a guess of 0 still lands
          // instead of empty: the site's own blank row defaults to 0
          // (createEmptyFamilyMember) and 0 passes (Number >= 0);
          // income is never summed or scored. (v52) A 0 row counts as
          // empty for the guess too — on a fresh form every row starts
          // at 0, so without this the guess would never land except
          // for a husband.
          if (isHeadRow) {
            if (isEmptyModelVal(row.estimate_annual_income) || (Number(row.estimate_annual_income) === 0 && incomeForHeadProfession(m.profession) !== 0)) {
              setReactive(vmMembers, row, 'estimate_annual_income', incomeGuessForHeadProfession(m.profession));
            }
          } else if (isStudentRow) {
            setReactive(vmMembers, row, 'estimate_annual_income', 0);
          } else if (relName === 'Husband' && !row.estimate_annual_income) {
            setReactive(vmMembers, row, 'estimate_annual_income', incomeGuessForMember(m, relName));
          } else if (isEmptyModelVal(row.estimate_annual_income) || Number(row.estimate_annual_income) === 0) {
            setReactive(vmMembers, row, 'estimate_annual_income', incomeGuessForMember(m, relName));
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
      // Head corrections (v25): the panel records the head fields the
      // user changed on the card after a fill. They must overwrite the
      // form's current values, so the fast path is skipped and the
      // sync passes get a force set for exactly those fields. The
      // corrected values are also merged into head_options so the
      // head block reads them as overrides even if the panel's copy
      // is stale. Everything else stays empty-only.
      const correctionsHead = (payload.corrections && payload.corrections.head) || null;
      const correctionSets = headCorrectionSets(correctionsHead);
      // (v53) Member corrections: the panel records the member option
      // fields the user changed on the cards, keyed by NID/BRN. They
      // force the option sync for exactly those rows and fields, and
      // they skip the fast path — like head corrections, a correction
      // always runs the passes.
      const memberSets = memberCorrectionSets((payload.corrections && payload.corrections.members) || null, targetMemberList);
      correctionSets.memberByIdx = memberSets.byIdx;
      correctionSets.count += memberSets.count;
      const forcePmt = {
        qids: correctionSets.pmtQids,
        headEduId: (correctionsHead && correctionsHead.education_status_id !== undefined && correctionsHead.education_status_id !== null)
          ? Number(correctionsHead.education_status_id) : null,
      };
      // Program field 96 (DSS) is derived from the members' DSS radios
      // (v26) — it always wins over a stale value, so it is always forced.
      forcePmt.qids.add(96);
      // MFS (v4.9.49): a panel MFS pick (program_fields['138']) always
      // wins over a stale value, like program 96 — a changed pick
      // applies on a re-fill instead of staying stuck on the old one.
      if (defs && defs.program_fields && defs.program_fields['138'] !== undefined && defs.program_fields['138'] !== null) forcePmt.qids.add(138);
      // (v53) correctionSets.count now also counts member corrections,
      // so it no longer implies a head correction exists — guard the
      // head merge, or a member-only correction crashes here.
      if (correctionSets.count && correctionsHead) {
        defs.head_options = defs.head_options || {};
        if (correctionsHead.education_status_id !== undefined && correctionsHead.education_status_id !== null) defs.head_options.education_status = Number(correctionsHead.education_status_id);
        if (correctionsHead.profession !== undefined && correctionsHead.profession !== null) defs.head_options.profession = Number(correctionsHead.profession);
        if (correctionsHead.marital_status !== undefined && correctionsHead.marital_status !== null) defs.head_options.marital_status = Number(correctionsHead.marital_status);
      }
      // Fast path: if the form already holds this payload
      // completely, skip the passes and their waits — a re-click
      // returns in under a second instead of re-driving every
      // filled field. Watchers still start below, so a late site
      // rebuild that wipes a value is still covered. A correction
      // always runs the passes: the fast path would skip the
      // overwrite the user just asked for.
      const alreadyFilled = isRefill && allRowsMatched && isFormFullyFilled(vmHead, vmMembers, allVms, headTarget, targetMemberList, counts, defs) && correctionSets.count === 0 && !benefitDiffers && !mfsDiffers;
      let optionUnfilled = [];
      const gridCheckNotes = [];
      if (!alreadyFilled) try {
        await new Promise(r => setTimeout(r, isRefill ? 50 : 250));
        const memberRows = (vmMembers && Array.isArray(vmMembers.familyMembers)) ? vmMembers.familyMembers : [];
        optionUnfilled = await syncOptionSelects(vmHead, vmMembers, memberRows, targetMemberList, headTarget, payload.head || null, defs, isRefill, correctionSets);
        await new Promise(r => setTimeout(r, isRefill ? 150 : 900));
        const lateUnfilled = await syncOptionSelects(vmHead, vmMembers, memberRows, targetMemberList, headTarget, payload.head || null, defs, true, correctionSets);
        optionUnfilled = [...new Set([...optionUnfilled, ...lateUnfilled])];
        // PMT + program additional fields (counts, location, age/education
        // bands). Runs after the option sync so head/spouse education ids
        // are already in the models for the PMT band mapping. A third
        // late pass covers PMT/program data that loads after the form.
        const dynUnfilled = (await syncDynamicSections(vmHead, allVms, headTarget, memberRows, targetMemberList, payload.head || null, counts, defs, false, forcePmt)).unfilled;
        await new Promise(r => setTimeout(r, isRefill ? 150 : 600));
        const dynLate = (await syncDynamicSections(vmHead, allVms, headTarget, memberRows, targetMemberList, payload.head || null, counts, defs, true, forcePmt)).unfilled;
        await new Promise(r => setTimeout(r, isRefill ? 400 : 2000));
        const dynLast = await syncDynamicSections(vmHead, allVms, headTarget, memberRows, targetMemberList, payload.head || null, counts, defs, true, forcePmt);
        const dynLate2 = dynLast.unfilled;
        gridCheckNotes.push(...(dynLast.gridNotes || []));
        optionUnfilled = [...new Set([...optionUnfilled, ...dynUnfilled, ...dynLate, ...dynLate2])];
        // Cash usage (2500 Tk distribution, v27): fill the amounts the
        // panel sent, after the PMT/program passes.
        try { cashUsage = syncCashUsage(vmHead, allVms, payload); } catch (_) {}
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
      try { watchDynamicSections(vmHead, allVms, headTarget, finalMemberRows, targetMemberList, payload.head || null, counts, defs, forcePmt); } catch (_) {}
      // Keep the member/head dropdowns filled even if their lookup
      // lists arrive after the option passes. Fire-and-forget.
      try { watchOptionSelects(vmHead, vmMembers, finalMemberRows, targetMemberList, headTarget, payload.head || null, defs, correctionSets); } catch (_) {}

      // Spouse name (shows only when head marital status = Married): fill
      // from the Husband/Wife member when one is in the household.
      try {
        const spouse = (payload.family_members || []).find(mm => mm.relation === 'Husband' || mm.relation === 'Wife');
        const maritalVal = headTarget ? (headTarget.marital_status ?? headTarget.maritalStatus) : undefined;
        if (spouse && headTarget && maritalVal !== undefined && maritalVal !== null && maritalVal !== '') {
          if ('spouse_name_bn' in headTarget || 'spouse_name_en' in headTarget) {
            // (v47) Same blank guard: a blank spouse name must not
            // wipe the one on the form.
            if (hasTextVal(spouse.name_bn)) setReactive(vmHead, headTarget, 'spouse_name_bn', spouse.name_bn);
            if (hasTextVal(spouse.name_en)) setReactive(vmHead, headTarget, 'spouse_name_en', spouse.name_en);
          }
          document.querySelectorAll('.v-input, .form-group').forEach(wrap => {
            if (wrap.closest('#fc-floating-root')) return;
            const lbl = getControlLabel(wrap);
            if (!/স্বামী|স্ত্রীর নাম|spouse/i.test(lbl)) return;
            const inp = wrap.querySelector('input[type="text"], input:not([type])');
            if (!inp || inp.disabled || inp.readOnly) return;
            const isBn = /বাংলা|bangla|_bn|\(bn\)/i.test(lbl);
            const spouseVal = isBn ? spouse.name_bn : spouse.name_en;
            if (!hasTextVal(spouseVal)) return;
            setNativeInputValue(inp, spouseVal, wrap.__vue__);
          });
        }
      } catch (_) {}

      if (vmHead && typeof vmHead.$forceUpdate === 'function') vmHead.$forceUpdate();
      if (vmMembers && typeof vmMembers.$forceUpdate === 'function') vmMembers.$forceUpdate();

      // (v41) Upload the panel's pulled draft photos (from a Pull or
      // an imported JSON export) to the form, through the site's own
      // upload — after the field passes, so the photo tab's component
      // is mounted. Runs on the already-filled fast path too: the
      // skip logic then sees the stored paths and uploads nothing.
      // A photo failure never fails the fill itself.
      let photoResults = null;
      try { photoResults = await uploadPulledPhotos(payload, vmHead, allVms); } catch (_) { photoResults = null; }
      const photoNote = autofillPhotoNote(photoResults);

      const unfilledNote = optionUnfilled.length
        ? ` Needs manual selection: ${optionUnfilled.join('; ')}.`
        : '';
      const gridNote = gridCheckNotes.length
        ? ` Grid check: ${[...new Set(gridCheckNotes)].join('; ')}.`
        : '';
      const halnagadNote = (benefits && benefits.halnagad && benefits.halnagad.program)
        ? (benefits.halnagad.isBeneficiary
            ? ` Other programme: ${benefits.halnagad.program} (receiving) — SSNP Yes${benefits.halnagad.cardId ? `, card ${benefits.halnagad.cardId}` : ''}.`
            : ` Other programme: ${benefits.halnagad.program} (applied only, not receiving) — SSNP stays No.`)
        : '';
      const reorderNote = rowsReordered ? ' Head changed — member rows reordered to match.' : '';
      const cashNote = cashUsage.filled ? ` Cash usage: ${cashUsage.total} Tk across ${cashUsage.filled} categor${cashUsage.filled === 1 ? 'y' : 'ies'}.` : '';
      window.dispatchEvent(new CustomEvent('FC_PRO_AUTOFILL_RESULT', {
        detail: {
          version: FC_INJECT_VERSION,
          success: true,
          correctionsApplied: correctionSets.count,
          halnagad: benefits ? benefits.halnagad : null,
          rowsReordered,
          cashUsage,
          photos: photoResults,
          message: alreadyFilled
            ? `Already filled — nothing needed. ${counts.totalMembers} member(s) [Male: ${counts.maleCount}, Female: ${counts.femaleCount}, Child: ${counts.childrenUnder18}].${halnagadNote}${photoNote}`
            : `Auto-filled ${counts.totalMembers} member(s) [Male: ${counts.maleCount}, Female: ${counts.femaleCount}, Child: ${counts.childrenUnder18}] + Islam & Post Code.${unfilledNote}${gridNote}${halnagadNote}${reorderNote}${cashNote}${photoNote}`
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

  // --- Pull Draft photos (applicant photo / signature / house photo) ---
  // The form keeps its photos in the media component: fresh captures as data
  // URLs (imageDataUrl / signatureDataUrl / houseDataUrl), previews as URLs
  // (imageUrl / signUrl / houseImageUrl), and draft files as server paths
  // (draftStored*Path). Each slot is resolved to a data URL so the panel can
  // show it — same 1500px / JPEG 0.82 cap as the panel's own uploads.
  function pickFirst(obj, names) {
    if (!obj) return null;
    for (const n of names) {
      const v = obj[n];
      if (v !== undefined && v !== null && v !== '') return v;
    }
    return null;
  }

  // (v37) The payment section's MFS dropdown (data.mfs_name) is fed
  // by the server's mfss list — its ids are NOT the PMT 138 ids.
  // Resolve the provider's name from any VM carrying mfss, then map
  // the name to the PMT 138 id the panel's MFS dropdown uses
  // (679 Bkash … 684 No Account — the panel's MFS_PROVIDER_OPTIONS).
  const MFS_NAME_TO_PMT_ID = { bkash: 679, nagad: 680, rocket: 681, upay: 682, mcash: 683 };
  function mfsNameKey(name) {
    const s = String(name || '').toLowerCase();
    if (s.includes('বিকাশ') || s.includes('bkash')) return 'bkash';
    if (s.includes('নগদ') || s.includes('nagad')) return 'nagad';
    if (s.includes('রকেট') || s.includes('rocket')) return 'rocket';
    if (s.includes('উপায়') || s.includes('upay')) return 'upay';
    if (s.includes('এমক্যাশ') || s.includes('mcash') || s.includes('m-cash')) return 'mcash';
    return null;
  }
  function findMfsProviderName(vms, id) {
    for (const vm of (vms || [])) {
      if (!vm) continue;
      // (v40) The list can live on the VM or under its data object.
      const lists = [vm.mfss, vm.data && vm.data.mfss].filter((l) => Array.isArray(l));
      for (const list of lists) {
        const entry = list.find((e) => e && Number(e.id) === Number(id));
        if (entry) {
          const name = entry.value_en || entry.value_bn || entry.name_en || entry.name_bn || entry.name || entry.label || '';
          const key = mfsNameKey(name);
          if (key) return key;
        }
      }
    }
    return null;
  }

  // (v38) Clean display name for one option-list item: Bangla first.
  // Lookup lists render value_bn/value_en, geo lists name_bn/name_en
  // (see the itemToStr note) — unlike itemToStr, which concatenates
  // every label field for pattern matching, this returns ONE name.
  function itemDisplayName(it) {
    if (it === null || it === undefined) return '';
    if (typeof it !== 'object') return String(it).trim();
    return String(it.value_bn || it.name_bn || it.value_en || it.name_en || it.text || it.label_bn || it.label_en || it.label || it.title_bn || it.title_en || it.title || it.name || '').trim();
  }

  // (v38) Resolve one stored id to its display name through the
  // rendered controls: find the control bound to (scope, key) — e.g.
  // ('data', 'bank_name') or ('addressForm', 'division_id') — then
  // the item whose id matches. Returns { id, name } or null when the
  // control is not mounted or the id is not in its items. Takes the
  // controls list so it is unit-testable without a DOM.
  function resolveControlName(controls, scope, key, id) {
    const numId = Number(id);
    if (!Number.isFinite(numId)) return null;
    for (const c of (controls || [])) {
      if (!c || !c.vInst || !Array.isArray(c.vInst.items)) continue;
      const cls = classifyControl(c);
      if (cls.scope !== scope || cls.key !== key) continue;
      const item = c.vInst.items.find((it) => Number(optionItemId(c.vInst, it)) === numId);
      if (item !== undefined) return { id: numId, name: itemDisplayName(item) };
    }
    return null;
  }

  // (v38) Program additional fields (Family Card, program 24) — the
  // field labels from PMT_AND_PROGRAM_FIELDS.md (getApplicationPageData,
  // 2026-11-12). Used when the live displayAdditionalFields are not
  // mounted, so a pulled program value still has a name.
  const PROGRAM_FIELD_NAMES = {
    75: 'পরিবারে পুরুষ সদস্য সংখ্যা (No. of Male)',
    77: 'পরিবারে নারী সদস্য সংখ্যা (No. of Female)',
    142: 'পরিবারে হিজড়া সদস্য সংখ্যা (Hijra member)',
    96: 'সমাজসেবা অধিদপ্তর থেকে প্রশিক্ষণ/আর্থিক সুবিধা (DSS training/benefit)',
    138: 'মোবাইল ব্যাংকিং (MFS Account)',
    139: 'বিদেশে পুরুষ সদস্য (Male member in abroad)',
    140: 'বিদেশে মহিলা সদস্য (Female member in abroad)',
    141: 'বিদেশে হিজড়া সদস্য (Hijra member in abroad)'
  };
  // Value names for the count fields are the number itself (value_en
  // "0".."10"); DSS is 650 Yes / 651 No; MFS is the provider name.
  // The count fields' value ids are consecutive from a base (from
  // PMT_AND_PROGRAM_FIELDS.md): 75 from 716 (0), 77 from 726 (0 —
  // the list starts at 727 = 1, there is no 0), 142 from 709 (0),
  // 139 from 688 (0), 140 from 695 (0), 141 from 702 (0).
  const PROGRAM_COUNT_FIELDS = { 75: 'male', 77: 'female', 142: 'hijra', 139: 'abroad_male', 140: 'abroad_female', 141: 'abroad_hijra' };
  const PROGRAM_COUNT_BASE = { 75: 716, 77: 726, 142: 709, 139: 688, 140: 695, 141: 702 };
  function resolveProgramFieldName(displayFields, fieldId, valueId) {
    const fid = Number(fieldId), vid = Number(valueId);
    let fieldName = PROGRAM_FIELD_NAMES[fid] || `Program field ${fid}`;
    let valueName = '';
    if (Array.isArray(displayFields)) {
      for (const f of displayFields) {
        if (!f || typeof f !== 'object') continue;
        const fId = Number(f.additional_field_id ?? f.id ?? f.field_id ?? NaN);
        if (fId !== fid) continue;
        fieldName = itemDisplayName(f) || fieldName;
        const opts = f.additional_field_values || f.values || f.children || f.items || [];
        const opt = (Array.isArray(opts) ? opts : []).find((o) => o && Number(o.id ?? o.value) === vid);
        if (opt) valueName = itemDisplayName(opt);
        break;
      }
    }
    if (!valueName) {
      if (fid === 96) valueName = vid === 650 ? 'হ্যা (Yes)' : vid === 651 ? 'না (No)' : String(vid);
      else if (fid === 138) valueName = ({ 679: 'বিকাশ (Bkash)', 680: 'নগদ (Nagad)', 681: 'রকেট (Rocket)', 682: 'উপায় (Upay)', 683: 'এমক্যাশ (MCash)', 684: 'কোনো হিসাব নেই (No Account)' })[vid] || String(vid);
      else if (PROGRAM_COUNT_BASE[fid] !== undefined) valueName = String(vid - PROGRAM_COUNT_BASE[fid]);
      else valueName = String(vid);
    }
    return { fieldName, valueName };
  }

  // (v38) Resolve one PMT answer to its question + answer names
  // through the live PMT variables (question + children), falling
  // back to the rendered PMT controls when the variables are not
  // loaded. Returns { question, answers: [{ id, name }] }.
  function resolvePmtAnswer(pmtVariables, controls, variableId, subRaw) {
    const qid = Number(variableId);
    const subIds = (Array.isArray(subRaw) ? subRaw : [subRaw]).map(Number).filter((n) => Number.isFinite(n) && n > 0);
    let question = `প্রশ্ন ${qid}`;
    const byId = new Map();
    if (Array.isArray(pmtVariables)) {
      const q = pmtVariables.find((x) => x && Number(x.id) === qid);
      if (q) {
        question = itemDisplayName(q) || question;
        for (const ch of (Array.isArray(q.children) ? q.children : [])) {
          if (ch) byId.set(Number(ch.id), itemDisplayName(ch));
        }
      }
    }
    if (!byId.size && Array.isArray(controls)) {
      for (const c of controls) {
        if (!c || !c.vInst || !Array.isArray(c.vInst.items)) continue;
        const ident = identifyDynamicControl(c);
        // (v38 fix) identifyDynamicControl returns null for a control
        // that is neither PMT nor program (bank / geo / lookup) — the
        // fill loop guards this, the pull's resolvePmtAnswer did not,
        // so the first non-PMT control on the page threw
        // "Cannot read properties of null (reading 'kind')" and the
        // whole pull died before sending anything.
        if (!ident) continue;
        if (ident.kind !== 'pmt' || Number(ident.id) !== qid) continue;
        for (const it of c.vInst.items) {
          if (it && typeof it === 'object') byId.set(Number(optionItemId(c.vInst, it)), itemDisplayName(it));
        }
        break;
      }
    }
    return { question, answers: subIds.map((id) => ({ id, name: byId.get(id) || String(id) })) };
  }

  function findMediaVm(vmHead, allVms) {
    const hasMediaState = (v) => !!v && (
      v.imageDataUrl !== undefined || v.signatureDataUrl !== undefined ||
      v.houseDataUrl !== undefined || v.nomineeImageDataUrl !== undefined ||
      v.nomineeSignatureDataUrl !== undefined ||
      // A saved draft's photo lives in a *Url (a relative path the
      // preview helper resolves) — without these the media component
      // was never found and the photo never resolved (v36). A
      // non-empty string is required, so a component that merely
      // declares an empty imageUrl does not count as the media one.
      (typeof v.imageUrl === 'string' && !!v.imageUrl) ||
      (typeof v.signUrl === 'string' && !!v.signUrl) ||
      (typeof v.houseImageUrl === 'string' && !!v.houseImageUrl) ||
      (typeof v.nomineeImageUrl === 'string' && !!v.nomineeImageUrl) ||
      (typeof v.nomineeSignUrl === 'string' && !!v.nomineeSignUrl) ||
      v.storedImagePath !== undefined ||
      v.draftStoredImagePath !== undefined || v.storedSignaturePath !== undefined ||
      v.draftStoredSignaturePath !== undefined
    );
    try {
      if (hasMediaState(vmHead)) return vmHead;
      for (const v of (allVms || [])) {
        if (hasMediaState(v)) return v;
      }
    } catch (_) {}
    return vmHead || null;
  }

  function blobToDataUrl(blob) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onerror = () => reject(new Error('Could not read image'));
      r.onload = () => resolve(r.result);
      r.readAsDataURL(blob);
    });
  }

  function downscaleDataUrl(dataUrl) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onerror = () => resolve(dataUrl);
      img.onload = () => {
        try {
          const maxDim = 1500;
          const scale = Math.min(1, maxDim / Math.max(img.naturalWidth, img.naturalHeight));
          if (scale >= 1) { resolve(dataUrl); return; }
          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
          canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
          canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.82));
        } catch (_) { resolve(dataUrl); }
      };
      img.src = dataUrl;
    });
  }

  async function urlToDataUrl(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const blob = await res.blob();
    return downscaleDataUrl(await blobToDataUrl(blob));
  }

  // The site's own preview helper (getFamilyCardMediaPreviewUrl /
  // resolveStorageMediaUrl) turns a stored path or a relative URL into
  // a fetchable preview URL. The site's template calls it on imageUrl /
  // signUrl itself — the old resolver only called it on the
  // draftStored*Path fields, so a saved draft whose photo lives in
  // imageUrl (a relative path) never resolved (v27 fix).
  async function previewPathToDataUrl(path, mediaVm) {
    if (typeof path !== 'string' || !path.trim()) return null;
    const p = path.trim();
    // (v37) The site's own preview URL for a stored photo path: its
    // getFamilyCardMediaPreviewUrl / resolveStorageMediaUrl turns a
    // storage key into https://gateway.bhata.gov.bd/cloud/<key>
    // (app.ea9222ad: u() builds `${base}/cloud/${key}` unless the key
    // already starts with cloud/ or storage/; the base is the gateway
    // host). A plain fetch() to that host fails — the gateway does not
    // serve the bytes to a cross-origin fetch (no CORS / no session
    // cookies) — while the site's own <img> loads the same URL fine.
    // So when the byte fetch fails, hand the URL itself back: the
    // panel shows it with a plain <img>, exactly like the site's
    // template does. Only absolute http(s) URLs are ever returned as
    // a display fallback — a relative path would resolve against the
    // panel's own origin and break. (Inlined here so the function
    // stays self-contained for the photo tests' extraction.)
    const gatewayUrl = (u) => {
      if (!u || typeof u !== 'string') return null;
      const s = u.trim();
      if (!s) return null;
      if (s.startsWith('data:')) return s;
      if (/^https?:\/\//i.test(s)) return s;
      const rel = s.replace(/^\/+/, '');
      return (rel.startsWith('cloud/') || rel.startsWith('storage/'))
        ? `https://gateway.bhata.gov.bd/${rel}`
        : `https://gateway.bhata.gov.bd/cloud/${rel}`;
    };
    const helper = mediaVm && (mediaVm.getFamilyCardMediaPreviewUrl || mediaVm.resolveStorageMediaUrl);
    let previewUrl = null;
    if (typeof helper === 'function') {
      try {
        let u = helper.call(mediaVm, p);
        if (u && typeof u.then === 'function') u = await u;
        if (typeof u === 'string' && u) previewUrl = u;
      } catch (_) {}
    }
    // No helper (or it gave nothing): build the preview URL the way
    // the site's own resolver does.
    if (!previewUrl) previewUrl = gatewayUrl(p);
    if (typeof previewUrl === 'string' && previewUrl) {
      if (previewUrl.startsWith('data:image')) {
        try { return await downscaleDataUrl(previewUrl); } catch (_) { return previewUrl; }
      }
      const abs = /^https?:\/\//i.test(previewUrl) ? previewUrl : gatewayUrl(previewUrl);
      if (abs) {
        try { return await urlToDataUrl(abs); } catch (_) {
          // (v37) Bytes unreachable, but the preview URL itself is
          // what the site's template puts in an <img> — return it so
          // the panel can still show the photo.
          return /^https?:\/\//i.test(abs) ? abs : null;
        }
      }
    }
    return null;
  }

  // True when the form holds any reference to this slot's photo
  // (file, data URL, preview URL or stored path) — even if loading it
  // fails. Lets the panel tell "no photo on the form" apart from
  // "photo exists but could not be loaded" (v27).
  function hasPhotoReference(slot, mediaVm, d) {
    const any = (obj, names) => names.some((n) => {
      const v = obj && obj[n];
      return v !== undefined && v !== null && v !== '';
    });
    return any(d, slot.files) || any(mediaVm, slot.files)
      || any(d, slot.dataUrls) || any(mediaVm, slot.dataUrls)
      || any(d, slot.urls) || any(mediaVm, slot.urls)
      || any(d, slot.paths) || any(mediaVm, slot.paths);
  }

  async function resolvePulledImage(slot, mediaVm, d) {
    // 1. Fresh File/Blob on the form (uploaded, not saved yet).
    const file = pickFirst(d, slot.files) || pickFirst(mediaVm, slot.files);
    if (typeof Blob !== 'undefined' && file instanceof Blob) {
      return downscaleDataUrl(await blobToDataUrl(file));
    }
    // 2. In-memory data URL (fresh capture / processed image).
    const dataUrl = pickFirst(mediaVm, slot.dataUrls) || pickFirst(d, slot.dataUrls);
    if (typeof dataUrl === 'string' && dataUrl.startsWith('data:image')) {
      return downscaleDataUrl(dataUrl);
    }
    // 3. Preview URL — a data: URL, an http(s) URL, or a stored path
    // (relative). The site renders imageUrl/signUrl/houseImageUrl
    // straight into <img> src, so a relative value is a real photo
    // that the preview helper (or a plain fetch) can resolve (v27).
    const url = pickFirst(mediaVm, slot.urls) || pickFirst(d, slot.urls);
    if (typeof url === 'string' && url.startsWith('data:image')) {
      return downscaleDataUrl(url);
    }
    if (typeof url === 'string' && url) {
      const got = await previewPathToDataUrl(url, mediaVm);
      if (got) return got;
    }
    // 4. Server path only — ask the site's own helper for a preview URL.
    const path = pickFirst(mediaVm, slot.paths) || pickFirst(d, slot.paths);
    if (typeof path === 'string' && path) {
      const got = await previewPathToDataUrl(path, mediaVm);
      if (got) return got;
    }
    return null;
  }

  const PULLED_IMAGE_SLOTS = [
    { key: 'image', name: 'Applicant Photo', dataUrls: ['imageDataUrl'], urls: ['imageUrl'], files: ['image'], paths: ['draftStoredImagePath', 'storedImagePath'] },
    { key: 'signature', name: 'Signature', dataUrls: ['signatureDataUrl'], urls: ['signUrl'], files: ['signature'], paths: ['draftStoredSignaturePath', 'storedSignaturePath'] },
    { key: 'house_image', name: 'House Photo', dataUrls: ['houseDataUrl'], urls: ['houseImageUrl'], files: ['house_image'], paths: ['draftStoredHouseImagePath'] },
    { key: 'nominee_image', name: 'Nominee Photo', dataUrls: ['nomineeImageDataUrl'], urls: ['nomineeImageUrl'], files: ['nominee_image'], paths: ['draftStoredNomineeImagePath', 'storedNomineeImagePath'] },
    { key: 'nominee_signature', name: 'Nominee Signature', dataUrls: ['nomineeSignatureDataUrl'], urls: ['nomineeSignUrl'], files: ['nominee_signature'], paths: ['draftStoredNomineeSignaturePath', 'storedNomineeSignaturePath'] }
  ];

  async function collectPulledImages(vmHead, allVms, d) {
    const mediaVm = findMediaVm(vmHead, allVms);
    // Slots resolve in parallel, each with its own 10s cap — one slow
    // photo no longer eats the whole pull's time (the old code raced
    // all slots together against a single 8s timer, v27).
    const results = await Promise.all(PULLED_IMAGE_SLOTS.map(async (slot) => {
      try {
        const dataUrl = await Promise.race([
          resolvePulledImage(slot, mediaVm, d),
          new Promise((resolve) => setTimeout(() => resolve(null), 10000))
        ]);
        if (dataUrl) return { ok: true, slot: slot.key, name: slot.name, dataUrl };
        const ref = hasPhotoReference(slot, mediaVm, d);
        return { ok: false, name: slot.name, reason: ref ? 'photo exists but could not be loaded' : 'no photo on the form' };
      } catch (_) {
        return { ok: false, name: slot.name, reason: 'could not be loaded' };
      }
    }));
    const images = results.filter((r) => r.ok).map((r) => ({ slot: r.slot, name: r.name, dataUrl: r.dataUrl }));
    // A slot with no photo on the form is listed by name alone (the
    // normal case — the user never uploaded one). A slot whose photo
    // EXISTS but could not be loaded carries its reason, because that
    // is the case the user needs to act on.
    const missing = results.filter((r) => !r.ok).map((r) => (r.reason === 'no photo on the form' ? r.name : `${r.name} (${r.reason})`));
    return { images, missing };
  }

  // --- Autofill photo upload (v41) ---
  // The panel's pulled draft photos (state.pulledImages — from a Pull
  // or from an imported JSON export) never reached the form: Auto-Fill
  // only wrote text/selects, so a new form stayed photo-less even
  // though the panel showed the photos. The fix drives the SITE's own
  // upload: fetch the photo bytes, build a File, and call the form
  // component's uploadMediaField — the same method the form's own
  // picker uses, so the stored path, the preview URL, the media token
  // and the upload state all land exactly as if the user had picked
  // the file on the form, and submit works. Empty-only like every
  // other fill write: a slot that already has a stored path
  // (draftStored*Path / stored*Path) or a file the user just picked
  // on the form is skipped, never re-uploaded. One failed photo never
  // blocks the others or the text fill.
  const AUTOFILL_PHOTO_FIELDS = ['image', 'signature', 'house_image', 'nominee_image', 'nominee_signature'];

  function findUploadMediaVm(vmHead, allVms) {
    try {
      if (vmHead && typeof vmHead.uploadMediaField === 'function') return vmHead;
      for (const v of (allVms || [])) {
        if (v && typeof v.uploadMediaField === 'function') return v;
      }
    } catch (_) {}
    return null;
  }

  function mediaSlotHasPhoto(mediaVm, field) {
    try {
      if (mediaVm && typeof mediaVm.getStoredMediaPath === 'function') {
        const p = mediaVm.getStoredMediaPath(field);
        if (p) return true;
      }
      const d = mediaVm && mediaVm.data;
      if (d && d[field] instanceof File) return true;
      // The newer form component keeps picked files in *File fields.
      const fileKey = field === 'image' ? 'imageFile' : field === 'signature' ? 'signatureFile' : field === 'house_image' ? 'houseFile' : null;
      if (fileKey && mediaVm && mediaVm[fileKey] instanceof File) return true;
    } catch (_) {}
    return false;
  }

  async function pulledPhotoToFile(mediaVm, dataUrl, field) {
    const name = field + '.jpg';
    if (typeof dataUrl === 'string' && dataUrl.startsWith('data:')) {
      const res = await fetch(dataUrl);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const blob = await res.blob();
      if (!blob || !blob.size) throw new Error('Empty photo');
      return new File([blob], name, { type: blob.type || 'image/jpeg' });
    }
    // An https preview URL (a pulled photo whose bytes the pull could
    // not fetch): the bytes must come from the page, and there are
    // three routes, tried in order — the failure that bit v41 was
    // stopping at the first one. (a) The site's own fetcher rewrites
    // the gateway URL and fetches with credentials:"omit". (b) The
    // site's own $axios GET as a blob — the authenticated call the
    // page's API uses — for the case where the file endpoint wants
    // the session/token rather than failing on CORS. (c) A plain
    // omit-credentials fetch, for a CORS-allowed host. If all three
    // fail the slot is reported (never silently dropped) with a
    // reason the status message shows.
    const toFile = (blob) => {
      if (!blob || !blob.size) return null;
      return new File([blob], name, { type: blob.type || 'image/jpeg' });
    };
    if (mediaVm && typeof mediaVm.fetchStorageFile === 'function') {
      try {
        const f = await mediaVm.fetchStorageFile(dataUrl, name);
        if (f) return f;
      } catch (_) {}
    }
    if (mediaVm && mediaVm.$axios && typeof mediaVm.$axios.get === 'function') {
      try {
        const r = await mediaVm.$axios.get(dataUrl, { responseType: 'blob' });
        const f = toFile(r && r.data);
        if (f) return f;
      } catch (_) {}
    }
    try {
      const res = await fetch(dataUrl, { credentials: 'omit' });
      if (res.ok) {
        const f = toFile(await res.blob());
        if (f) return f;
      }
    } catch (_) {}
    throw new Error('Could not fetch photo bytes');
  }

  // The pulled photo URL itself IS the stored file — the part after
  // /cloud/ (or /storage/) is the storage key the server already
  // holds. The browser can DISPLAY the photo (an <img> or a
  // navigation needs no CORS) while the page still cannot READ its
  // bytes (fetch/<img>+canvas/$axios all need the gateway's CORS
  // headers, which it does not send) — but the bytes are not needed:
  // the site's own draft loader (applyDraftMediaFromStorage +
  // appendDraftMediaToFormData) attaches a draft's photos by
  // REFERENCE — stored key + preview URL, never a download — and the
  // submit then sends that key. So when the byte routes fail, link
  // the already-stored file instead of uploading it again.
  function storageKeyFromPhotoUrl(url) {
    if (typeof url !== 'string') return null;
    const m = url.match(/\/(?:cloud|storage)\/(.+)$/);
    if (!m) return null;
    return m[1].replace(/^\/+/, '').replace(/[?#].*$/, '');
  }

  function linkPulledPhoto(mediaVm, dataUrl, field) {
    const key = storageKeyFromPhotoUrl(dataUrl);
    if (!key || !mediaVm) return false;
    // The final submit's appendStoredMediaToFormData reads the
    // mixin's keys; the draft submit's appendDraftMediaToFormData and
    // the form's own submit gates read the draft keys. Set both, so
    // the photo is present whichever path submits it.
    const MIXIN_STORED = { image: 'storedImagePath', signature: 'storedSignaturePath', nominee_image: 'storedNomineeImagePath', nominee_signature: 'storedNomineeSignaturePath' };
    const MIXIN_PREVIEW = { image: 'imageUrl', signature: 'signUrl', nominee_image: 'nomineeImageUrl', nominee_signature: 'nomineeSignUrl' };
    const storedKey = (typeof mediaVm.getMediaStoredPathKey === 'function') ? mediaVm.getMediaStoredPathKey(field) : null;
    const previewKey = (typeof mediaVm.getMediaPreviewKey === 'function') ? mediaVm.getMediaPreviewKey(field) : null;
    const setKey = (k, v) => {
      if (!k) return;
      try { if (typeof mediaVm.$set === 'function') mediaVm.$set(mediaVm, k, v); else mediaVm[k] = v; } catch (_) { try { mediaVm[k] = v; } catch (_) {} }
    };
    // The site's own draft-media path first: it sets the preview URL
    // (rebuilt from the key) and the stored key, and clears any
    // stale File for the slot.
    try {
      if (typeof mediaVm.applyDraftMediaFromStorage === 'function' && storedKey && previewKey) {
        mediaVm.applyDraftMediaFromStorage({ path: key, url: dataUrl, previewKey, storedKey, dataKey: field });
      }
    } catch (_) {}
    if (storedKey) setKey(storedKey, key);
    if (previewKey) setKey(previewKey, dataUrl);
    if (MIXIN_STORED[field]) setKey(MIXIN_STORED[field], key);
    if (MIXIN_PREVIEW[field]) setKey(MIXIN_PREVIEW[field], dataUrl);
    if (field === 'image' && 'draftApplicantImageMissing' in mediaVm) setKey('draftApplicantImageMissing', false);
    if (field === 'house_image' && 'draftHouseImageMissing' in mediaVm) setKey('draftHouseImageMissing', false);
    try { if (mediaVm.data) mediaVm.data[field] = null; } catch (_) {}
    // The site's own sync marks a stored path as a successful
    // upload, which is what the submit gates check.
    try { if (typeof mediaVm.syncMediaUploadStateFromStoredPaths === 'function') mediaVm.syncMediaUploadStateFromStoredPaths(); } catch (_) {}
    try {
      if (mediaVm.mediaUploadState) {
        const st = { status: 'success', progress: 100, error: null, file: null };
        if (typeof mediaVm.$set === 'function') mediaVm.$set(mediaVm.mediaUploadState, field, st);
        else mediaVm.mediaUploadState[field] = st;
      }
    } catch (_) {}
    // Verify the stored path actually landed (the draft key at
    // least); otherwise the submit would not see the photo.
    try {
      if (storedKey && mediaVm[storedKey] === key) return true;
      if (MIXIN_STORED[field] && mediaVm[MIXIN_STORED[field]] === key) return true;
    } catch (_) {}
    return false;
  }

  // (v57) One photo slot's keys on the form, for replacing a photo
  // the user captured in the panel over the photo already on the
  // form. The site's own clear methods (clearImage/clearSign/
  // clearHouseImage) only null data[field] — they leave the stored-
  // path keys the empty-only guard reads — so the keys are nulled
  // directly too (the same keys linkPulledPhoto sets, both the mixin
  // set and the draft set). house_image has no mixin stored key, only
  // the draft one.
  const MEDIA_SLOT_KEYS = {
    image: { stored: ['storedImagePath', 'draftStoredImagePath'], preview: ['imageUrl'], data: ['image', 'imageUrl'], file: ['imageFile'], missing: 'draftApplicantImageMissing' },
    signature: { stored: ['storedSignaturePath', 'draftStoredSignaturePath'], preview: ['signUrl'], data: ['signature', 'signUrl'], file: ['signatureFile'], missing: null },
    house_image: { stored: ['draftStoredHouseImagePath'], preview: ['houseImageUrl'], data: ['house_image', 'houseImageUrl'], file: ['houseFile'], missing: 'draftHouseImageMissing' }
  };
  function mediaSetKey(mediaVm, k, v) {
    if (!mediaVm || !k) return;
    try { if (typeof mediaVm.$set === 'function') mediaVm.$set(mediaVm, k, v); else mediaVm[k] = v; } catch (_) { try { mediaVm[k] = v; } catch (_) {} }
  }
  // Snapshot one slot's photo state, so a failed replacement can put
  // the old photo back exactly as it was.
  function snapshotMediaSlot(mediaVm, field) {
    const spec = MEDIA_SLOT_KEYS[field];
    if (!spec || !mediaVm) return null;
    const snap = { keys: {}, dataKeys: {}, state: null, missing: undefined };
    spec.stored.concat(spec.preview).forEach((k) => { try { snap.keys[k] = mediaVm[k]; } catch (_) {} });
    spec.file.forEach((k) => { try { snap.keys[k] = mediaVm[k]; } catch (_) {} });
    if (mediaVm.data) spec.data.forEach((k) => { try { snap.dataKeys[k] = mediaVm.data[k]; } catch (_) {} });
    try { snap.state = mediaVm.mediaUploadState ? mediaVm.mediaUploadState[field] : null; } catch (_) {}
    if (spec.missing) { try { snap.missing = mediaVm[spec.missing]; } catch (_) {} }
    return snap;
  }
  // Clear one slot on the form (stored paths, preview URLs, picked
  // files, upload state) so a replacement upload can land. Returns
  // the snapshot for restoreMediaSlot, or null when there was
  // nothing to clear.
  function clearMediaSlot(mediaVm, field) {
    const spec = MEDIA_SLOT_KEYS[field];
    if (!spec || !mediaVm) return null;
    const snap = snapshotMediaSlot(mediaVm, field);
    spec.stored.concat(spec.preview).forEach((k) => mediaSetKey(mediaVm, k, null));
    spec.file.forEach((k) => mediaSetKey(mediaVm, k, null));
    if (mediaVm.data) spec.data.forEach((k) => { try { mediaVm.data[k] = null; } catch (_) {} });
    try {
      if (mediaVm.mediaUploadState) {
        const idle = { status: 'idle', progress: 0, error: null, file: null };
        if (typeof mediaVm.$set === 'function') mediaVm.$set(mediaVm.mediaUploadState, field, idle);
        else mediaVm.mediaUploadState[field] = idle;
      }
    } catch (_) {}
    return snap;
  }
  // Put a cleared slot back exactly as snapshotMediaSlot found it.
  function restoreMediaSlot(mediaVm, field, snap) {
    if (!snap || !mediaVm) return;
    Object.keys(snap.keys).forEach((k) => mediaSetKey(mediaVm, k, snap.keys[k]));
    if (mediaVm.data) Object.keys(snap.dataKeys).forEach((k) => { try { mediaVm.data[k] = snap.dataKeys[k]; } catch (_) {} });
    try {
      if (mediaVm.mediaUploadState && snap.state) {
        if (typeof mediaVm.$set === 'function') mediaVm.$set(mediaVm.mediaUploadState, field, snap.state);
        else mediaVm.mediaUploadState[field] = snap.state;
      }
    } catch (_) {}
    const spec = MEDIA_SLOT_KEYS[field];
    if (spec && spec.missing && snap.missing !== undefined) mediaSetKey(mediaVm, spec.missing, snap.missing);
    try { if (typeof mediaVm.syncMediaUploadStateFromStoredPaths === 'function') mediaVm.syncMediaUploadStateFromStoredPaths(); } catch (_) {}
  }

  async function uploadPulledPhotos(payload, vmHead, allVms) {
    const summary = { attempted: 0, uploaded: 0, linked: 0, skipped: 0, replaced: 0, failed: [] };
    const images = payload && Array.isArray(payload.images) ? payload.images : [];
    if (!images.length) return summary;
    const mediaVm = findUploadMediaVm(vmHead, allVms);
    if (!mediaVm) {
      images.forEach((im) => { if (im && im.slot) summary.failed.push({ slot: im.slot, message: 'Photo upload not available on this form' }); });
      return summary;
    }
    // (v59) One slot's upload, with a single retry inside the run:
    // a transient failure (network, timeout, gateway byte-fetch)
    // used to need a second Auto-Fill click. Returns the outcome
    // plus, on a successful upload, the stored path right after the
    // upload (for the re-verification below). A failed replacement
    // still restores the old photo instead of leaving the slot empty.
    async function uploadOne(im, field) {
      let oldSlot = null;
      let oldPath = null;
      if (mediaSlotHasPhoto(mediaVm, field)) {
        if (!im.replace) return { status: 'skipped' };
        // A replace:true entry is the user deliberately replacing the
        // photo already on the form — clear the slot first (the
        // empty-only guard would otherwise skip it), remembering the
        // old photo so a failed upload puts it back.
        try { oldPath = mediaVm.getStoredMediaPath(field) || null; } catch (_) { oldPath = null; }
        oldSlot = clearMediaSlot(mediaVm, field);
      }
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const file = await pulledPhotoToFile(mediaVm, im.dataUrl, field);
          const res = await mediaVm.uploadMediaField(field, file);
          if (res && res.success) {
            // The submit gates read the draft-missing flags (the same
            // flags linkPulledPhoto clears when it links a photo).
            const spec = MEDIA_SLOT_KEYS[field];
            if (spec && spec.missing && spec.missing in mediaVm) mediaSetKey(mediaVm, spec.missing, false);
            let newPath = null;
            try { newPath = mediaVm.getStoredMediaPath(field) || null; } catch (_) { newPath = null; }
            return { status: 'uploaded', replaced: !!oldSlot, newPath, oldPath };
          }
          if (attempt === 0) continue;
          if (oldSlot) restoreMediaSlot(mediaVm, field, oldSlot);
          return { status: 'failed', message: (res && res.message) || 'Upload failed' };
        } catch (e) {
          // Bytes unreachable (the gateway blocks cross-origin reads)
          // — link the file that is already stored instead of failing
          // the slot. Only when the link lands does the slot count.
          let linked = false;
          try { linked = linkPulledPhoto(mediaVm, im.dataUrl, field); } catch (_) { linked = false; }
          if (linked) return { status: 'linked', replaced: !!oldSlot };
          if (attempt === 0) continue;
          if (oldSlot) restoreMediaSlot(mediaVm, field, oldSlot);
          return { status: 'failed', message: e && e.message ? e.message : 'Upload failed' };
        }
      }
      return { status: 'failed', message: 'Upload failed' };
    }
    const uploadedSlots = [];
    for (const im of images) {
      const field = im && im.slot;
      if (!field || !AUTOFILL_PHOTO_FIELDS.includes(field)) continue;
      if (typeof im.dataUrl !== 'string' || !im.dataUrl) { summary.failed.push({ slot: field, message: 'No photo data' }); continue; }
      const r = await uploadOne(im, field);
      if (r.status === 'skipped') { summary.skipped++; continue; }
      summary.attempted++;
      if (r.status === 'uploaded') {
        summary.uploaded++;
        if (r.replaced) summary.replaced++;
        uploadedSlots.push({ im, field, newPath: r.newPath, oldPath: r.oldPath, replaced: r.replaced });
      } else if (r.status === 'linked') {
        summary.linked++;
        if (r.replaced) summary.replaced++;
      } else {
        summary.failed.push({ slot: field, message: r.message || 'Upload failed' });
      }
    }
    // (v59) The site's draft load can land after the upload and
    // re-apply the server's old stored paths over the new ones — the
    // status then says "uploaded (replaced)" while the form still
    // shows the old photo. Give it a brief window to land, then
    // re-check each uploaded slot: if the stored path no longer
    // matches the one the upload set, upload once more in the same
    // run. A re-upload that fails counts the original upload as
    // lost (the old photo is back) instead of keeping it.
    const recheck = uploadedSlots.filter((rec) => rec.newPath);
    if (recheck.length) {
      await new Promise((r) => setTimeout(r, 1500));
      for (const rec of recheck) {
        let cur = null;
        try { cur = mediaVm.getStoredMediaPath(rec.field) || null; } catch (_) { cur = null; }
        if (cur === rec.newPath) continue;
        const r2 = await uploadOne(rec.im, rec.field);
        if (r2.status === 'uploaded') {
          // Uploaded again — the counts stay as they were (one
          // upload, one replacement); the stored path is new now.
        } else if (r2.status === 'linked') {
          summary.uploaded--;
          if (rec.replaced) summary.replaced--;
          summary.linked++;
        } else {
          summary.uploaded--;
          if (rec.replaced) summary.replaced--;
          summary.failed.push({ slot: rec.field, message: r2.status === 'skipped' ? 'Photo reverted after upload' : (r2.message || 'Upload failed') + ' (photo reverted after upload)' });
        }
      }
    }
    return summary;
  }

  function autofillPhotoNote(photos) {
    if (!photos) return '';
    const failed = Array.isArray(photos.failed) ? photos.failed : [];
    // The reason matters more than the count: v41 only named the
    // failed slots, so a live "3 failed" gave nobody the cause. Show
    // the first failure's message — the slots usually share one cause
    // (e.g. the gateway bytes could not be fetched).
    const reason = failed.length && failed[0] && failed[0].message ? ` — ${failed[0].message}` : '';
    const linked = photos.linked || 0;
    const replaced = photos.replaced || 0;
    if (photos.uploaded > 0 && linked === 0 && !failed.length) return ` Photos: ${photos.uploaded} uploaded${replaced ? ` (${replaced} replaced)` : ''}.`;
    if (linked > 0 && photos.uploaded === 0 && !failed.length) return ` Photos: ${linked} linked.`;
    if (photos.uploaded > 0 || linked > 0 || failed.length) {
      const names = failed.map((f) => f.slot).join(', ');
      const parts = [];
      // With a failure, keep the uploaded count in the message even
      // when it is 0 ("0 uploaded, 1 failed") — the wording the
      // status has used since v42.
      if (photos.uploaded > 0 || failed.length) parts.push(`${photos.uploaded} uploaded`);
      if (replaced > 0) parts.push(`${replaced} replaced`);
      if (linked > 0) parts.push(`${linked} linked`);
      if (failed.length) parts.push(`${failed.length} failed${names ? ` (${names})` : ''}`);
      return ` Photos: ${parts.join(', ')}${reason}.`;
    }
    if (photos.skipped > 0) return ' Photos: already on form.';
    return '';
  }

  window.addEventListener('FC_PRO_PULL_REQUEST', async () => {
    let { vmHead, vmMembers, allVms } = getVueNodes();
    if (!vmHead && !vmMembers && (!allVms || !allVms.length)) {
      window.dispatchEvent(new CustomEvent('FC_PRO_PULL_RESULT', {
        detail: { version: FC_INJECT_VERSION, success: false, message: 'No active Vue form instance found on this page.' }
      }));
      return;
    }

    try {
      // (v37) Mount every tab first — the pull used to read only the
      // tabs already open, so anything on an unopened tab (the PMT
      // tab's MFS answer, the photo tab's media component) never
      // reached the panel. Auto-Fill opens them all the same way
      // (panel = [0..7] + waitForFormReady); the pull does it now
      // too, then re-reads the Vue nodes — components re-mount while
      // loading.
      if (vmHead && 'panel' in vmHead) vmHead.panel = [0, 1, 2, 3, 4, 5, 6, 7];
      if (vmMembers && 'panel' in vmMembers) vmMembers.panel = [0, 1, 2, 3, 4, 5, 6, 7];
      await waitForFormReady(vmHead, vmMembers);
      const fresh = getVueNodes();
      if (fresh.vmHead) vmHead = fresh.vmHead;
      if (fresh.vmMembers) vmMembers = fresh.vmMembers;
      if (fresh.allVms && fresh.allVms.length) allVms = fresh.allVms;
      if (vmHead && 'panel' in vmHead) vmHead.panel = [0, 1, 2, 3, 4, 5, 6, 7];
      if (vmMembers && 'panel' in vmMembers) vmMembers.panel = [0, 1, 2, 3, 4, 5, 6, 7];
      // (v40) Wait for the draft's program values before reading
      // anything — they land async with the draft data, and reading
      // an empty applicationAllowanceValues reports MFS (and the
      // program counts) as unanswered. Returns at once when the
      // values are already there; re-reads the VMs after, in case a
      // late mount replaced them.
      await waitForProgramValues(4000);
      const freshProg = getVueNodes();
      if (freshProg.vmHead) vmHead = freshProg.vmHead;
      if (freshProg.vmMembers) vmMembers = freshProg.vmMembers;
      if (freshProg.allVms && freshProg.allVms.length) allVms = freshProg.allVms;

      const d = getHeadTargetObj(vmHead) || {};
      const rawMembers = (vmMembers && Array.isArray(vmMembers.familyMembers)) ? vmMembers.familyMembers : [];

      const row0 = rawMembers[0] || {};
      const dId = String(d.verification_number || d.nid || '').trim();
      const r0Id = String(row0.verification_number || row0.nid || row0.brn_id || '').trim();
      const row0IsHead = Number(row0.relationship_id) === 260 || Number(row0.relationship_id) === 185 || (dId && r0Id && dId === r0Id) || (!dId && rawMembers.length > 0 && !row0.relationship_id);

      const hSource = row0IsHead ? { ...row0, ...d } : d;
      const headVerType = Number(hSource.verification_type || row0.verification_type || 1);
      const headGenVal = normalizeGenderId(hSource.gender_id || hSource.gender || row0.gender_id || row0.gender || GENDER_FEMALE);

      // MFS (v38): the MFS answer lives in the PROGRAM additional
      // fields (applicationAllowanceValues / application_allowance_values,
      // field 138) — a REAL draft (9373308) has 138 -> 679 there and
      // NO 138 entry in application_pmt at all, so v36/v37's
      // PMT-first read found nothing on it. Order now: allowance
      // field 138 first, then PMT 138, then the payment section's
      // data.mfs_name (an mfss-list id, mapped by name).
      const pullPmt = resolvePmtState(vmHead, allVms, d);
      const pullProg = resolveProgramState(vmHead, allVms, d);
      // (v40) Merge every non-empty allowance source, first entry
      // per field id wins: the resolved array, the draft's own
      // snake_case list, and any VM's non-empty array. An empty
      // array must never shadow a populated one again.
      const allowanceLists = [];
      if (Array.isArray(pullProg.values) && pullProg.values.length) allowanceLists.push(pullProg.values);
      if (Array.isArray(d.application_allowance_values) && d.application_allowance_values.length) allowanceLists.push(d.application_allowance_values);
      for (const v of (allVms || [])) {
        if (!v) continue;
        if (Array.isArray(v.applicationAllowanceValues) && v.applicationAllowanceValues.length) allowanceLists.push(v.applicationAllowanceValues);
        if (v.data && Array.isArray(v.data.applicationAllowanceValues) && v.data.applicationAllowanceValues.length) allowanceLists.push(v.data.applicationAllowanceValues);
      }
      const allowanceById = new Map();
      for (const list of allowanceLists) {
        for (const x of list) {
          if (!x) continue;
          const fid = allowanceFieldId(x);
          if (Number.isFinite(fid) && fid > 0 && !allowanceById.has(fid)) allowanceById.set(fid, x);
        }
      }
      const pullAllowance = [...allowanceById.values()];
      const allowanceEntry = (fid) => pullAllowance
        .find((x) => x && allowanceFieldId(x) === Number(fid));
      const allowanceValId = (fid) => {
        const e = allowanceEntry(fid);
        return e ? pullId(e.allowance_program_additional_field_values_id) : undefined;
      };
      let pullMfsId = allowanceValId(138);
      const pullMfsEntry = findPmtEntryIn(pullPmt.pmtArray, 138);
      if (pullMfsId === undefined) {
        const pullMfsRaw = pullMfsEntry ? pullMfsEntry.sub_variables : undefined;
        const subList = Array.isArray(pullMfsRaw) ? pullMfsRaw : [pullMfsRaw];
        for (const s of subList) { const v = pullId(s); if (v !== undefined) { pullMfsId = v; break; } }
      }
      // (v37) Fallback — the payment section's data.mfs_name: it
      // holds an id from the server's mfss list, so resolve its name
      // and map it to the PMT 138 id (679 Bkash … 684 No Account).
      // Only when both the allowance field and PMT 138 are
      // unanswered — the allowance answer wins when both are set.
      if (pullMfsId === undefined) {
        const mfsFormId = pullId(d.mfs_name);
        if (mfsFormId !== undefined) {
          const mfsKey = findMfsProviderName([vmHead, ...(allVms || [])], mfsFormId);
          const mapped = mfsKey ? MFS_NAME_TO_PMT_ID[mfsKey] : undefined;
          if (mapped) pullMfsId = mapped;
        }
      }

      // (v38) All tabs, organised: the pull used to send only the
      // head + members + cash + photos, so everything else on the
      // form (bank, address, program counts, PMT answers, spouse,
      // nominee, ...) was invisible in the panel except inside the
      // Raw JSON dump. Read them all here, with NAMES resolved from
      // the live controls / field definitions — the panel shows them
      // in sections matching the site's tabs.
      const pullControls = collectOptionControls();
      await waitForOptionItems(pullControls, 3000);
      const ctlName = (scope, key, id) => {
        const r = resolveControlName(pullControls, scope, key, id);
        return r ? r.name : undefined;
      };
      const strOrUndef = (v) => { const s = String(v ?? '').trim(); return s ? s : undefined; };
      // Prefix an object's keys (skipping undefined values) — the
      // address blocks are built once and spread as address_* /
      // permanent_address_* on the flat head record.
      const prefixKeys = (prefix, obj) => {
        const out = {};
        for (const [k, v] of Object.entries(obj || {})) {
          if (v !== undefined) out[prefix + k] = v;
        }
        return out;
      };

      // Program additional fields (all 8): male/female/hijra counts,
      // DSS, MFS, abroad male/female/hijra — with field + value names.
      const pullProgramFields = (Array.isArray(pullAllowance) ? pullAllowance : [])
        .filter((x) => x && allowanceFieldId(x) > 0)
        .map((x) => {
          const fid = allowanceFieldId(x);
          const vid = pullId(x.allowance_program_additional_field_values_id);
          const names = resolveProgramFieldName(pullProg.fields, fid, vid);
          return { field_id: fid, value_id: vid, field_name: names.fieldName, value_name: names.valueName };
        });
      // The household counts the program tab holds (its own ground
      // truth, beside the panel's computed form_defaults).
      const pullProgramCounts = {};
      for (const pf of pullProgramFields) {
        const key = PROGRAM_COUNT_FIELDS[pf.field_id];
        if (key && pf.value_id !== undefined) {
          const n = Number(pf.value_name);
          pullProgramCounts[key] = Number.isFinite(n) ? n : undefined;
        }
      }

      // PMT answers (all 24): question + answer names.
      const pullPmtAnswers = (Array.isArray(pullPmt.pmtArray) ? pullPmt.pmtArray : [])
        .filter((e) => e && Number(e.variable_id) > 0)
        .map((e) => {
          const r = resolvePmtAnswer(pullPmt.pmtVariables, pullControls, e.variable_id, e.sub_variables);
          return { variable_id: Number(e.variable_id), question: r.question, answers: r.answers };
        });

      // General extras off the head form (d): spouse, identification
      // mark, nationality, email, mobile operator, disability, and
      // the household size / room counts the form itself stores.
      const pullMobileOpId = pullId(d.mobile_operator);
      const pullMobileOpName = pullMobileOpId !== undefined
        ? ctlName('data', 'mobile_operator', pullMobileOpId)
        : (typeof d.mobile_operator === 'string' ? strOrUndef(d.mobile_operator) : undefined);
      // Nominee (all null on a draft without one — sent only when set).
      const pullNominee = {
        nominee_en: strOrUndef(d.nominee_en),
        nominee_bn: strOrUndef(d.nominee_bn),
        nominee_verification_number: strOrUndef(d.nominee_verification_number),
        nominee_date_of_birth: strOrUndef(d.nominee_date_of_birth),
        nominee_address: strOrUndef(d.nominee_address),
        nominee_relation_with_beneficiary: strOrUndef(d.nominee_relation_with_beneficiary),
        nominee_nationality: strOrUndef(d.nominee_nationality)
      };
      const pullHasNominee = Object.values(pullNominee).some((v) => v !== undefined);

      // Bank / payment (d): account type, bank + branch, bank
      // division/district, account name/owner/number, MFS number.
      const pullAccountType = pullId(d.account_type);
      const pullBankId = pullId(d.bank_name);
      const pullBranchId = pullId(d.branch_name);
      const pullBankDivId = pullId(d.bank_division_id);
      const pullBankDistId = pullId(d.bank_district_id);
      const pullAccountOwnerId = pullId(d.account_owner);

      // Address (addressForm first, d as fallback): present +
      // permanent, every key, names from the live cascade selects.
      const afOwner = (allVms || []).find((v) => v && v.addressForm);
      const af = afOwner ? afOwner.addressForm : null;
      const addrVal = (key) => (af && af[key] !== undefined && af[key] !== null && af[key] !== '' ? af[key] : d[key]);
      const addrName = (key, id) => {
        const n = Number(id);
        if (!Number.isFinite(n)) return undefined;
        return ctlName('addressForm', key, n) || ctlName('data', key, n);
      };
      const buildAddress = (prefix) => {
        const g = (k) => addrVal(prefix + k);
        const divisionId = pullId(g('division_id'));
        const districtId = pullId(g('district_id'));
        const thanaId = pullId(g('thana_id'));
        const unionId = pullId(g('union_id'));
        const pouroId = pullId(g('pouro_id'));
        const cityId = pullId(g('city_id'));
        const cityThanaId = pullId(g('city_thana_id'));
        const distPouroId = pullId(g('district_pouro_id'));
        const wardUnionId = pullId(g('ward_id_union'));
        const wardPouroId = pullId(g('ward_id_pouro'));
        const wardCityId = pullId(g('ward_id_city'));
        const wardDistId = pullId(g('ward_id_dist'));
        const wardId = wardUnionId ?? wardPouroId ?? wardCityId ?? wardDistId;
        const wardKey = wardUnionId !== undefined ? 'ward_id_union'
          : wardPouroId !== undefined ? 'ward_id_pouro'
          : wardCityId !== undefined ? 'ward_id_city' : 'ward_id_dist';
        const locTypeId = pullId(g('location_type'));
        return {
          division_id: divisionId, division_name: divisionId !== undefined ? addrName('division_id', divisionId) : undefined,
          district_id: districtId, district_name: districtId !== undefined ? addrName('district_id', districtId) : undefined,
          thana_id: thanaId, thana_name: thanaId !== undefined ? addrName('thana_id', thanaId) : undefined,
          union_id: unionId, union_name: unionId !== undefined ? addrName('union_id', unionId) : undefined,
          pouro_id: pouroId, pouro_name: pouroId !== undefined ? addrName('pouro_id', pouroId) : undefined,
          city_id: cityId, city_name: cityId !== undefined ? addrName('city_id', cityId) : undefined,
          city_thana_id: cityThanaId, city_thana_name: cityThanaId !== undefined ? addrName('city_thana_id', cityThanaId) : undefined,
          district_pouro_id: distPouroId, district_pouro_name: distPouroId !== undefined ? addrName('district_pouro_id', distPouroId) : undefined,
          ward_id: wardId, ward_name: wardId !== undefined ? addrName(wardKey, wardId) : undefined, ward_key: wardId !== undefined ? wardKey : undefined,
          post_code: strOrUndef(g('post_code')),
          // Named 'text' (not 'address_text') so the 'address_' /
          // 'permanent_address_' prefix lands on address_text /
          // permanent_address_text — the panel's key.
          text: strOrUndef(g('address')),
          location_type_id: locTypeId,
          location_type_name: locTypeId === 1 ? 'পৌরসভা (Pouroshava)' : locTypeId === 2 ? 'ইউনিয়ন (Union)' : undefined,
          sub_location_type_id: pullId(g('sub_location_type'))
        };
      };
      const pullAddress = buildAddress('');
      const pullPermanentAddress = buildAddress('permanent_');

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
        mother_name_en: d.mother_name_en || (row0IsHead ? row0.mother_name_en : '') || '',
        // Education / profession / marital (v36): the head form's own
        // dropdowns (data.education_status / profession /
        // marital_status) — the pull never read them, so the panel
        // showed the DOB guess (or blank for 27.5+) instead of what
        // the form holds. Row 0 is the fallback for education/marital.
        education_status_id: pullId(d.education_status || d.education_status_id || (row0IsHead ? row0.education_status_id : undefined)),
        profession: pullId(d.profession),
        marital_status: pullId(d.marital_status || d.maritial_status_id || (row0IsHead ? row0.maritial_status_id : undefined)),
        // Disability / health / benefit (v36): the head's ride on the
        // head member row (row 0) — the head form has no such fields.
        ...(row0IsHead ? {
          is_disabled: Number(row0.is_member_disabled) === 1 ? 1 : 0,
          disability_type_id: pullId(row0.disability_type_id),
          health_condition_id: pullId(row0.health_condition_id),
          is_ssnp_covered: (row0.is_ssnp_covered === 0 || row0.is_ssnp_covered === 1) ? Number(row0.is_ssnp_covered) : undefined,
          facilities_ids: Array.isArray(row0.facilities_ids) ? row0.facilities_ids.map(Number).filter((n) => !Number.isNaN(n)) : [],
          is_dss_training_or_financial_benefit: (row0.is_dss_training_or_financial_benefit === 0 || row0.is_dss_training_or_financial_benefit === 1) ? Number(row0.is_dss_training_or_financial_benefit) : undefined
        } : {}),
        // MFS provider (v36): PMT 138's answer id (679 Bkash … 684 No
        // Account), or undefined when the question is unanswered.
        mfs_provider_id: pullMfsId,
        // Phone (v4.9.50): the head's mobile number, pulled back to the
        // panel card — the form's only mobile field is data.mobile on
        // the head form (the head row's mobile_number is the fallback).
        mobile_number: toEnDigits(String(d.mobile || (row0IsHead ? row0.mobile_number : '') || '')).replace(/\D+/g, ''),
        // General extras (v38): spouse, identification mark,
        // nationality, email, mobile operator, disability, household
        // size / room counts — the head form's own fields the pull
        // never sent, so the panel never showed them.
        spouse_name_bn: strOrUndef(d.spouse_name_bn),
        spouse_name_en: strOrUndef(d.spouse_name_en),
        identification_mark: strOrUndef(d.identification_mark),
        nationality: strOrUndef(d.nationality),
        email: strOrUndef(d.email),
        mobile_operator: pullMobileOpName,
        mobile_operator_id: pullMobileOpId,
        disability_id: pullId(d.disability_id),
        house_size: strOrUndef(d.house_size),
        // no_of_room is the PMT Q500 answer id (503 = 3 rooms), not a
        // room count — resolve it to the answer name for the panel.
        no_of_room: pullId(d.no_of_room),
        no_of_room_name: (() => {
          const rid = pullId(d.no_of_room);
          if (rid === undefined) return undefined;
          const r = resolvePmtAnswer(pullPmt.pmtVariables, pullControls, 500, rid);
          return r.answers[0] ? r.answers[0].name : undefined;
        })(),
        // Nominee (v38): only when the draft has one.
        ...(pullHasNominee ? pullNominee : {}),
        // Bank / payment (v38): account type, bank + branch, bank
        // division/district, account name/owner/number, MFS number.
        // The *_name keys hold the resolved display name; the *_id
        // keys hold the form's stored id (the fill writes those back).
        account_type: pullAccountType,
        account_type_label: pullAccountType === 1 ? 'ব্যাংক অ্যাকাউন্ট (Bank Account)' : pullAccountType === 2 ? 'মোবাইল ব্যাংকিং (MFS)' : undefined,
        bank_name: pullBankId !== undefined ? ctlName('data', 'bank_name', pullBankId) : undefined,
        bank_name_id: pullBankId,
        branch_name: pullBranchId !== undefined ? ctlName('data', 'branch_name', pullBranchId) : undefined,
        branch_name_id: pullBranchId,
        bank_division_name: pullBankDivId !== undefined ? ctlName('data', 'bank_division_id', pullBankDivId) : undefined,
        bank_division_id: pullBankDivId,
        bank_district_name: pullBankDistId !== undefined ? ctlName('data', 'bank_district_id', pullBankDistId) : undefined,
        bank_district_id: pullBankDistId,
        account_name: strOrUndef(d.account_name),
        account_owner: pullAccountOwnerId !== undefined ? ctlName('data', 'account_owner', pullAccountOwnerId) : undefined,
        account_owner_id: pullAccountOwnerId,
        account_number: strOrUndef(d.account_number),
        mfs_number: strOrUndef(d.mfs_number),
        // Address (v38): present + permanent, every key, names from
        // the live cascade selects. The *_name keys are display; the
        // *_id keys are what the fill writes back.
        ...prefixKeys('address_', pullAddress),
        ...prefixKeys('permanent_address_', pullPermanentAddress),
        // Program additional fields + household counts (v38): the
        // program tab's own answers, with names — including the
        // Socio-Economic counts (male/female/hijra, abroad).
        program_fields: pullProgramFields,
        program_male: pullProgramCounts.male,
        program_female: pullProgramCounts.female,
        program_hijra: pullProgramCounts.hijra,
        program_abroad_male: pullProgramCounts.abroad_male,
        program_abroad_female: pullProgramCounts.abroad_female,
        program_abroad_hijra: pullProgramCounts.abroad_hijra,
        // PMT answers (v38): every answered question with its
        // question + answer names.
        pmt_answers: pullPmtAnswers
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

      const pulled = await collectPulledImages(vmHead, allVms, d);

      // Cash usage (v27): amounts already on the form, so the panel
      // can show (and correct) them instead of starting from zero.
      const pullCash = readCashUsages(vmHead, allVms);

      // Halnagad / other-programme state (v26): the programme the site
      // found for the head, and whether they only applied or already
      // receive it. The panel shows it and uses it for SSNP.
      const pullHalnagadProgram = (vmMembers && typeof vmMembers.halnagadCurrentProgram === 'string') ? vmMembers.halnagadCurrentProgram : '';
      const pullHalnagadSource = (vmMembers && typeof vmMembers.halnagadMigrateSource === 'string') ? vmMembers.halnagadMigrateSource : '';
      const pullHalnagad = {
        program: pullHalnagadProgram,
        source: pullHalnagadSource,
        isBeneficiary: pullHalnagadSource === 'beneficiary' && !!pullHalnagadProgram.trim(),
        cardId: (pullHalnagadSource === 'beneficiary' && pullHalnagadProgram.trim()) ? halnagadCardId(pullHalnagadProgram) : 0
      };

      window.dispatchEvent(new CustomEvent('FC_PRO_PULL_RESULT', {
        detail: { version: FC_INJECT_VERSION, success: true, payload: { head, family_members, full_form_dump, images: pulled.images, imagesMissing: pulled.missing, halnagad: pullHalnagad, cash_usages: pullCash.usages, cash_usage_cap: pullCash.cap } }
      }));
    } catch (err) {
      window.dispatchEvent(new CustomEvent('FC_PRO_PULL_RESULT', {
        detail: { version: FC_INJECT_VERSION, success: false, message: err.message }
      }));
    }
  });

  // Read the education already on the live form, so the panel's popup
  // only asks for people whose education is still empty on the form.
  // A hand-filled value (or one from an earlier fill) must not be
  // asked again. Reads the Vue MODEL, not the DOM selects, so it works
  // even when the head/member tab is not the one showing.
  window.addEventListener('FC_PRO_LIVE_EDUCATION_REQUEST', async () => {
    const reply = (detail) => {
      try { window.dispatchEvent(new CustomEvent('FC_PRO_LIVE_EDUCATION_RESULT', { detail })); } catch (_) {}
    };
    try {
      const { vmHead, vmMembers } = getVueNodes();
      if (!vmHead && !vmMembers) {
        reply({ version: FC_INJECT_VERSION, success: false, message: 'No active Vue form instance found on this page.' });
        return;
      }
      const d = getHeadTargetObj(vmHead) || {};
      const rows = (vmMembers && Array.isArray(vmMembers.familyMembers)) ? vmMembers.familyMembers : [];
      const dId = String(d.verification_number || d.nid || '').trim();
      // The head row: relationship Head/Self (260), or the row holding
      // the head's NID (same rule Pull Draft uses).
      const headRow = rows.find((r) => r && (Number(r.relationship_id) === 260 ||
        (dId && String(r.verification_number || r.nid || r.brn_id || '').trim() === dId)));
      const headEdu = Number(d.education_status || (headRow && headRow.education_status_id) || 0) || null;
      // The spouse row: Husband (159) or Wife (186).
      const spouseRow = rows.find((r) => r && (Number(r.relationship_id) === 159 || Number(r.relationship_id) === 186));
      const spouseEdu = spouseRow ? (Number(spouseRow.education_status_id || 0) || null) : null;
      // Every row's education, keyed by NID/BRN (v4.9.47): the popup
      // now asks all 27.5+ members, not just the head and spouse, so
      // the panel needs each member's live value to skip the ones
      // already filled on the form.
      const membersEdu = rows.map((r) => ({
        nid: String(r.verification_number || r.nid || r.brn_id || '').trim(),
        education: Number(r.education_status_id || 0) || null
      })).filter((e) => e.nid);
      reply({ version: FC_INJECT_VERSION, success: true, head: headEdu, spouse: spouseEdu, members: membersEdu });
    } catch (err) {
      reply({ version: FC_INJECT_VERSION, success: false, message: String(err && err.message || err) });
    }
  });
})();

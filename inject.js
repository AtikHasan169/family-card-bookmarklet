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
    'Head/Self': 185,
    'Wife': 186,
    'Other Relative': 263
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
    const clean = String(rawDob).replace(/\[.*?\]/g, '').trim();
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
    if (mDiff < 0 || (mDiff === 0 && today.getDate() < dd)) {
      age--;
    }
    return age;
  }

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

  async function selectDateViaVuetifyCalendar(rawDob, targetIndex = 0) {
    const parts = parseDobParts(rawDob);
    if (!parts) return;

    const dobContainers = [];
    document.querySelectorAll('.v-input, .form-group').forEach(wrap => {
      if (wrap.closest('#fc-floating-root')) return;
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
    let menuVm = null;
    let wrapperVm = null;

    if (targetWrap) {
      let curr = targetWrap.__vue__;
      let depth = 0;
      while (curr && depth < 6) {
        if (!menuVm && isMenuOrDialogVm(curr)) menuVm = curr;
        if (!menuVm && Array.isArray(curr.$children)) {
          const childMenu = curr.$children.find(isMenuOrDialogVm);
          if (childMenu) menuVm = childMenu;
        }
        if (curr.$data && ('date' in curr.$data || 'dateFormatted' in curr.$data || 'dob' in curr.$data || 'date_of_birth' in curr.$data)) {
          wrapperVm = curr;
        }
        curr = curr.$parent;
        depth++;
      }
    }

    let openedMenuTemporarily = false;
    if (menuVm && !menuVm.isActive) {
      const existingPickers = findAllVueComponents(menuVm, isDatePickerVm);
      if (existingPickers.length === 0) {
        menuVm.isActive = true;
        openedMenuTemporarily = true;
        await new Promise(r => setTimeout(r, 60));
      }
    }

    let pickerEmitted = false;
    if (menuVm) {
      const pickers = findAllVueComponents(menuVm, isDatePickerVm);
      pickers.forEach(pickerVm => {
        pickerVm.$emit('input', parts.iso);
        pickerVm.$emit('change', parts.iso);
        pickerVm.$emit('click:date', parts.iso);
        pickerEmitted = true;
      });
    }

    if (!pickerEmitted) {
      const allPickers = [];
      document.querySelectorAll('*').forEach(n => {
        if (n.__vue__ && isDatePickerVm(n.__vue__) && !allPickers.includes(n.__vue__)) {
          allPickers.push(n.__vue__);
        }
      });
      const targetPicker = allPickers[targetIndex] || (targetIndex === 0 ? allPickers[0] : null);
      if (targetPicker) {
        targetPicker.$emit('input', parts.iso);
        targetPicker.$emit('change', parts.iso);
        targetPicker.$emit('click:date', parts.iso);
        pickerEmitted = true;
      }
    }

    if (wrapperVm && wrapperVm.$data) {
      if ('date' in wrapperVm.$data) wrapperVm.$data.date = parts.iso;
      if ('dob' in wrapperVm.$data) wrapperVm.$data.dob = parts.iso;
      if ('date_of_birth' in wrapperVm.$data) wrapperVm.$data.date_of_birth = parts.iso;
      if ('dateFormatted' in wrapperVm.$data) wrapperVm.$data.dateFormatted = parts.slash;
    }

    if (openedMenuTemporarily && menuVm) {
      await new Promise(r => setTimeout(r, 40));
      menuVm.isActive = false;
    }
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
      if ('panel' in vm) {
        vm.panel = [0, 1, 2, 3, 4, 5, 6, 7];
      }

      const setReactive = (targetObj, key, val) => {
        if (!targetObj || val === undefined || val === null) return;
        if (typeof vm.$set === 'function') {
          vm.$set(targetObj, key, val);
        } else {
          targetObj[key] = val;
        }
      };

      if (payload.full_form_dump) {
        const dump = payload.full_form_dump;
        if (dump.head_data && vm.data) {
          Object.entries(dump.head_data).forEach(([k, v]) => {
            if (v !== undefined && typeof v !== 'function') {
              setReactive(vm.data, k, v);
            }
          });
        }
        if (Array.isArray(dump.family_members_raw) && Array.isArray(vm.familyMembers)) {
          while (vm.familyMembers.length < dump.family_members_raw.length) {
            if (typeof vm.addFamilyMember === 'function') vm.addFamilyMember();
            else vm.familyMembers.push({});
          }
          await new Promise((r) => setTimeout(r, 150));
          dump.family_members_raw.forEach((rawRow, idx) => {
            const targetRow = vm.familyMembers[idx];
            if (!targetRow || !rawRow) return;
            Object.entries(rawRow).forEach(([k, v]) => {
              if (v !== undefined && typeof v !== 'function') {
                setReactive(targetRow, k, v);
              }
            });
          });
        }
      }

      // 1. Populate Primary Applicant (Wife / Head)
      if (payload.head && vm.data) {
        const h = payload.head;
        const cleanHeadId = String(h.nid || '').replace(/\s+/g, '');
        const headIsNID = determineIsNID(h.doc_type, cleanHeadId);
        const headDobParts = parseDobParts(h.dob);
        const headModelDob = headDobParts ? headDobParts.iso : String(h.dob || '').replace(/\[.*?\]/g, '').replace(/-/g, '/');

        const isVerificationPage = Boolean(
          document.querySelector('input[placeholder*="ক্যাপচা"], input[placeholder*="উত্তর"], input[id*="captcha"], .captcha-container') ||
          Array.from(document.querySelectorAll('label, span, p')).some(el => el.textContent.includes('ক্যাপচা সম্পূর্ণ করুন'))
        );

        setReactive(vm.data, 'verification_type', headIsNID ? 1 : 2);
        setReactive(vm.data, 'verification_number', cleanHeadId);
        setReactive(vm.data, 'date_of_birth', headModelDob);
        setReactive(vm.data, 'dob', headModelDob);

        setReactive(vm.data, 'name_bn', h.name_bn);
        setReactive(vm.data, 'name_en', h.name_en);
        setReactive(vm.data, 'father_name_bn', h.father_name_bn);
        setReactive(vm.data, 'father_name_en', h.father_name_en);
        setReactive(vm.data, 'mother_name_bn', h.mother_name_bn);
        setReactive(vm.data, 'mother_name_en', h.mother_name_en);

        if (!isVerificationPage) {
          const headGenderId = resolveGenderId({ ...h, relation: 'Head/Self' });
          setReactive(vm.data, 'gender', headGenderId);
          setReactive(vm.data, 'gender_id', headGenderId);
          setReactive(vm.data, 'sex', headGenderId);
          setReactive(vm.data, 'applicant_gender', headGenderId);
        }

        await selectDateViaVuetifyCalendar(h.dob, 0);
      }

      // 2. Populate Family Members
      const members = Array.isArray(payload.family_members) ? payload.family_members : [];
      const allHousehold = payload.head ? [payload.head, ...members] : [...members];
      const totalMembersCount = allHousehold.length;
      const childrenUnder18Count = allHousehold.filter(m => {
        const age = calculateAgeYears(m.dob);
        return age !== null && age >= 0 && age < 18;
      }).length;

      if (members.length > 0 && Array.isArray(vm.familyMembers)) {
        while (vm.familyMembers.length < members.length) {
          if (typeof vm.addFamilyMember === 'function') {
            vm.addFamilyMember();
          } else {
            break;
          }
        }

        await new Promise((r) => setTimeout(r, 150));

        members.forEach((m, idx) => {
          const row = vm.familyMembers[idx];
          if (!row) return;

          const cleanId = String(m.nid_or_brn || '').replace(/\s+/g, '');
          const isNID = determineIsNID(m.doc_type, cleanId);
          const genderId = resolveGenderId(m);
          const relId = Number(m.relationship_id || RELATION_ID_MAP[m.relation] || 160);
          const memAge = calculateAgeYears(m.dob);

          setReactive(row, 'verification_type', isNID ? 1 : 2);
          
          if (isNID) {
            setReactive(row, 'nid', cleanId);
            setReactive(row, 'brn_id', '');
            setReactive(row, 'verification_number', cleanId);
          } else {
            setReactive(row, 'brn_id', cleanId);
            setReactive(row, 'nid', '');
            setReactive(row, 'verification_number', cleanId);
          }

          const memDobParts = parseDobParts(m.dob);
          const memModelDob = memDobParts ? memDobParts.iso : String(m.dob || '').replace(/\[.*?\]/g, '').replace(/-/g, '/');
          setReactive(row, 'dob', memModelDob);
          setReactive(row, 'date_of_birth', memModelDob);
          if (memAge !== null && 'age' in row) {
            setReactive(row, 'age', memAge);
          }

          setReactive(row, 'name_bn', m.name_bn);
          setReactive(row, 'name_en', m.name_en);
          setReactive(row, 'father_name_bn', m.father_name_bn);
          setReactive(row, 'mother_name_bn', m.mother_name_bn);

          setReactive(row, 'relationship_id', relId);
          setReactive(row, 'relation_id', relId);
          if (m.relation) setReactive(row, 'relation', m.relation);

          setReactive(row, 'gender', genderId);
          setReactive(row, 'gender_id', genderId);

          setReactive(row, 'is_member_disabled', Number(m.is_disabled) === 1 ? 1 : 0);
          setReactive(row, 'is_gov_job_holder', 0);

          if (m.relation === 'Husband' && !row.estimate_annual_income) {
            setReactive(row, 'estimate_annual_income', 60000);
          }
        });
      }

      if (vm.data) {
        setReactive(vm.data, 'house_size', totalMembersCount);
        setReactive(vm.data, 'children_count', childrenUnder18Count);
        setReactive(vm.data, 'is_ethnic', 0);
        setReactive(vm.data, 'location_type', 1);
      }

      if (typeof vm.$forceUpdate === 'function') {
        vm.$forceUpdate();
      }

      window.dispatchEvent(
        new CustomEvent('FC_PRO_AUTOFILL_RESULT', {
          detail: {
            success: true,
            message: `Auto-filled ${totalMembersCount} member(s) (${childrenUnder18Count} children <18), Polli/Union & Khudro Nrigosthi: No!`
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

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
        const headGenderId = resolveGenderId({ ...h, relation: 'Head/Self' });
        const headCleanDob = String(h.dob || '').replace(/\[.*?\]/g, '');

        const isVerificationPage = Array.from(document.querySelectorAll('button, a, span, label')).some(el => 
          el.textContent.includes('যাচাই') || el.textContent.includes('Verify') || el.textContent.includes('ক্যাপচা')
        ) && !document.querySelector('input[name*="name_bn"], input[id*="name_bn"]');

        if (isVerificationPage) {
          setReactive(vm.data, 'verification_type', headIsNID ? 1 : 2);
          setReactive(vm.data, 'verification_number', cleanHeadId);
          setReactive(vm.data, 'date_of_birth', headCleanDob);
          setReactive(vm.data, 'dob', headCleanDob);
          window.dispatchEvent(
            new CustomEvent('FC_PRO_AUTOFILL_RESULT', {
              detail: { success: true, message: `Filled NID & DOB for verification. Solve captcha and click Verify!` }
            })
          );
          return;
        }

        setReactive(vm.data, 'verification_type', headIsNID ? 1 : 2);
        setReactive(vm.data, 'verification_number', cleanHeadId);
        setReactive(vm.data, 'date_of_birth', headCleanDob);
        setReactive(vm.data, 'dob', headCleanDob);
        setReactive(vm.data, 'gender', headGenderId);
        setReactive(vm.data, 'gender_id', headGenderId);
        setReactive(vm.data, 'sex', headGenderId);
        setReactive(vm.data, 'applicant_gender', headGenderId);
        setReactive(vm.data, 'name_bn', h.name_bn);
        setReactive(vm.data, 'name_en', h.name_en);
        setReactive(vm.data, 'father_name_bn', h.father_name_bn);
        setReactive(vm.data, 'father_name_en', h.father_name_en);
        setReactive(vm.data, 'mother_name_bn', h.mother_name_bn);
        setReactive(vm.data, 'mother_name_en', h.mother_name_en);
      }

      // 2. Populate Family Members
      const members = Array.isArray(payload.family_members) ? payload.family_members : [];
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

          const memCleanDob = String(m.dob || '').replace(/\[.*?\]/g, '');
          setReactive(row, 'dob', memCleanDob);
          setReactive(row, 'date_of_birth', memCleanDob);
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
            message: `Auto-filled Head + ${members.length} family member(s) with Gender & Relation.`
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

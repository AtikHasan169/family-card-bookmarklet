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

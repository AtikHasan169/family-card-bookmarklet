'use strict';

const STORAGE_KEY = 'fc_pro_api_key';
const STORAGE_MODEL = 'fc_pro_model';
const STORAGE_AREA_PRESETS = 'fc_pro_area_presets';
const CURRENT_VERSION_TAG = 'v4.2-live';

const RELATION_OPTIONS = [
  { value: 'Auto', label: 'Auto (Son / Daughter)', id: null, gender: null },
  { value: 'Son', label: 'Son (পুত্র)', id: 160, gender: 'Male' },
  { value: 'Daughter', label: 'Daughter (কন্যা)', id: 161, gender: 'Female' },
  { value: 'Husband', label: 'Husband (স্বামী)', id: 159, gender: 'Male' },
  { value: 'Wife', label: 'Wife (স্ত্রী)', id: 186, gender: 'Female' },
  { value: 'Father', label: 'Father (পিতা)', id: 157, gender: 'Male' },
  { value: 'Mother', label: 'Mother (মাতা)', id: 158, gender: 'Female' },
  { value: 'Brother', label: 'Brother (ভাই)', id: 162, gender: 'Male' },
  { value: 'Sister', label: 'Sister (বোন)', id: 163, gender: 'Female' },
  { value: 'Father-in-law', label: 'Father-in-law (শ্বশুর)', id: 164, gender: 'Male' },
  { value: 'Mother-in-law', label: 'Mother-in-law (শাশুড়ি)', id: 165, gender: 'Female' },
  { value: 'Son-in-law', label: 'Son-in-law (জামাতা)', id: 181, gender: 'Male' },
  { value: 'Daughter-in-law', label: 'Daughter-in-law (পুত্রবধূ)', id: 182, gender: 'Female' },
  { value: 'Grandson', label: 'Grandson (নাতি)', id: 183, gender: 'Male' },
  { value: 'Granddaughter', label: 'Granddaughter (নাতনি)', id: 184, gender: 'Female' },
  { value: 'Other Relative', label: 'Other Relative (অন্যান্য)', id: 263, gender: null }
];

const DOC_TYPE_OPTIONS = [
  { value: 'NID', label: 'NID (National ID)' },
  { value: 'BRN', label: 'BRN (Birth Certificate)' }
];

const GENDER_OPTIONS = [
  { value: 'Male', label: 'Male (পুরুষ)', id: 1 },
  { value: 'Female', label: 'Female (মহিলা)', id: 2 },
  { value: 'Other', label: 'Other (অন্যান্য)', id: 3 }
];

const AREA_TYPE_OPTIONS = [
  { value: 1, label: 'পল্লী / ইউনিয়ন (Polli / Union)' },
  { value: 2, label: 'পৌরসভা (Pourashava)' },
  { value: 3, label: 'সিটি কর্পোরেশন (City Corporation)' }
];

const ETHNIC_OPTIONS = [
  { value: 0, label: 'না (No)' },
  { value: 1, label: 'হ্যাঁ (Yes)' }
];

const RELATION_ID_MAP = Object.fromEntries(RELATION_OPTIONS.filter((r) => r.id !== null).map((r) => [r.value, r.id]));
const ID_TO_RELATION_MAP = Object.fromEntries(RELATION_OPTIONS.filter((r) => r.id !== null).map((r) => [r.id, r.value]));
const RELATION_GENDER_MAP = Object.fromEntries(RELATION_OPTIONS.filter((r) => r.gender !== null).map((r) => [r.value, r.gender]));

const GENDER_ID_MAP = { Male: 1, Female: 2, Other: 3 };
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Front-of-NID only — no back-part address fields required on OCR cards
const HEAD_FIELDS = [
  { key: 'gender', label: 'Gender', type: 'gender_select' },
  { key: 'name_bn', label: 'Name (BN)' },
  { key: 'name_en', label: 'Name (EN)' },
  { key: 'father_name_bn', label: 'Father (BN)' },
  { key: 'father_name_en', label: 'Father (EN)' },
  { key: 'mother_name_bn', label: 'Mother (BN)' },
  { key: 'mother_name_en', label: 'Mother (EN)' },
  { key: 'doc_type', label: 'Doc Type', type: 'doc_select' },
  { key: 'nid', label: 'NID / BRN No' },
  { key: 'dob', label: 'DOB (DD-MM-YYYY)' }
];

const MEMBER_FIELDS = [
  { key: 'relation', label: 'Relation', type: 'rel_select' },
  { key: 'gender', label: 'Gender', type: 'gender_select' },
  { key: 'name_bn', label: 'Name (BN)' },
  { key: 'name_en', label: 'Name (EN)' },
  { key: 'father_name_bn', label: 'Father (BN)' },
  { key: 'mother_name_bn', label: 'Mother (BN)' },
  { key: 'doc_type', label: 'Doc Type', type: 'doc_select' },
  { key: 'nid_or_brn', label: 'NID / BRN No' },
  { key: 'dob', label: 'DOB (DD-MM-YYYY)' }
];

const state = { head: [], other: [], lastExtracted: null };
let nextId = 1, activeCategory = null, activeCropName = '';

const areaPresets = {
  village: '',
  ward_no: '',
  post_code: '',
  area_type_id: 1,
  is_ethnic: 0
};

let rawImage = null;
let extractionController = null;
let baseScale = 1; 
let zoomLevel = 1;
let rotationAngle = 0; 
let panX = 0;
let panY = 0;
let isDragging = false;
let startX = 0;
let startY = 0;
let activeCropItem = null; 
let viewerZoom = 1;

const $ = (id) => document.getElementById(id);

function getItemRefs(item) {
  if (!item) return [];
  if (Array.isArray(item.boundRefs)) return item.boundRefs;
  if (item.boundRef) return [item.boundRef];
  return [];
}

function addItemRef(item, ref) {
  if (!item || !ref) return;
  if (!Array.isArray(item.boundRefs)) item.boundRefs = [];
  const exists = item.boundRefs.some((r) => r.type === ref.type && r.index === ref.index);
  if (!exists) item.boundRefs.push(ref);
  item.boundRef = item.boundRefs[0] || null;
}

function saveCredentialsEverywhere(apiKey, model, presetsObj) {
  try {
    if (apiKey !== undefined) localStorage.setItem(STORAGE_KEY, apiKey);
    if (model !== undefined) localStorage.setItem(STORAGE_MODEL, model);
    if (presetsObj !== undefined) localStorage.setItem(STORAGE_AREA_PRESETS, JSON.stringify(presetsObj));
  } catch (err) {}
  window.parent.postMessage({ action: 'FC_SAVE_API_KEY', apiKey, model, areaPresets: presetsObj }, '*');
}

function loadAreaPresetsFromLocal() {
  try {
    const raw = localStorage.getItem(STORAGE_AREA_PRESETS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        if (parsed.village !== undefined) areaPresets.village = String(parsed.village);
        if (parsed.ward_no !== undefined) areaPresets.ward_no = String(parsed.ward_no);
        if (parsed.post_code !== undefined) areaPresets.post_code = String(parsed.post_code);
        if (parsed.area_type_id !== undefined) areaPresets.area_type_id = Number(parsed.area_type_id) || 1;
        if (parsed.is_ethnic !== undefined) areaPresets.is_ethnic = Number(parsed.is_ethnic) || 0;
      }
    }
  } catch (e) {}
  syncAreaPresetInputs();
}

function syncAreaPresetInputs() {
  if ($('presetVillageInput')) $('presetVillageInput').value = areaPresets.village || '';
  if ($('presetWardInput')) $('presetWardInput').value = areaPresets.ward_no || '';
  if ($('presetPostCodeInput')) $('presetPostCodeInput').value = areaPresets.post_code || '';
  if ($('presetAreaTypeSelect')) $('presetAreaTypeSelect').value = String(areaPresets.area_type_id ?? 1);
  if ($('presetEthnicSelect')) $('presetEthnicSelect').value = String(areaPresets.is_ethnic ?? 0);
}

function handleAreaPresetChange() {
  areaPresets.village = ($('presetVillageInput')?.value || '').trim();
  areaPresets.ward_no = toEnglishDigits($('presetWardInput')?.value || '').trim();
  areaPresets.post_code = toEnglishDigits($('presetPostCodeInput')?.value || '').trim();
  areaPresets.area_type_id = Number($('presetAreaTypeSelect')?.value || 1);
  areaPresets.is_ethnic = Number($('presetEthnicSelect')?.value || 0);

  if ($('presetWardInput') && $('presetWardInput').value !== areaPresets.ward_no) {
    $('presetWardInput').value = areaPresets.ward_no;
  }
  if ($('presetPostCodeInput') && $('presetPostCodeInput').value !== areaPresets.post_code) {
    $('presetPostCodeInput').value = areaPresets.post_code;
  }

  saveCredentialsEverywhere(undefined, undefined, areaPresets);

  if (state.lastExtracted) {
    if (!state.lastExtracted.form_defaults) state.lastExtracted.form_defaults = {};
    Object.assign(state.lastExtracted.form_defaults, {
      village: areaPresets.village,
      ward_no: areaPresets.ward_no,
      post_code: areaPresets.post_code,
      area_type_id: areaPresets.area_type_id,
      area_type_label: AREA_TYPE_OPTIONS.find(a => a.value === areaPresets.area_type_id)?.label || 'পল্লী / ইউনিয়ন (Polli / Union)',
      is_ethnic: areaPresets.is_ethnic,
      khudro_nrigosthi_label: areaPresets.is_ethnic === 1 ? 'হ্যাঁ (Yes)' : 'না (No)'
    });
    $('rawJsonOutput').textContent = JSON.stringify(state.lastExtracted, null, 2);
    saveSessionState();
  }
}

function bindQuickCopyBtn(btnId, getValFn) {
  const btn = $(btnId);
  if (!btn) return;
  btn.addEventListener('click', async () => {
    await copyTextSafe(String(getValFn() ?? ''));
    const orig = btn.textContent;
    btn.textContent = 'Copied';
    btn.style.color = '#059669';
    setTimeout(() => {
      btn.textContent = orig;
      btn.style.color = '';
    }, 800);
  });
}

function initApp() {
  let savedKey = '';
  let savedModel = 'gemini-2.5-flash';
  try {
    savedKey = localStorage.getItem(STORAGE_KEY) || '';
    savedModel = localStorage.getItem(STORAGE_MODEL) || 'gemini-2.5-flash';
  } catch (err) {}

  $('apiKeyInput').value = savedKey;
  $('modelSelect').value = savedModel;
  if (!savedKey) $('settingsDrawer').classList.add('open');

  loadAreaPresetsFromLocal();

  $('apiKeyInput').addEventListener('input', (e) => saveCredentialsEverywhere(e.target.value.trim(), undefined, undefined));
  $('modelSelect').addEventListener('change', (e) => saveCredentialsEverywhere(undefined, e.target.value, undefined));

  // Bind Persistent Area Preset inputs & Copy buttons
  ['presetVillageInput', 'presetWardInput', 'presetPostCodeInput'].forEach(id => {
    const el = $(id);
    if (el) el.addEventListener('input', handleAreaPresetChange);
  });
  ['presetAreaTypeSelect', 'presetEthnicSelect'].forEach(id => {
    const el = $(id);
    if (el) el.addEventListener('change', handleAreaPresetChange);
  });

  bindQuickCopyBtn('copyPresetVillageBtn', () => areaPresets.village);
  bindQuickCopyBtn('copyPresetWardBtn', () => areaPresets.ward_no);
  bindQuickCopyBtn('copyPresetPostCodeBtn', () => areaPresets.post_code);
  bindQuickCopyBtn('copyPresetAreaBtn', () => AREA_TYPE_OPTIONS.find(a => a.value === areaPresets.area_type_id)?.label || 'পল্লী / ইউনিয়ন');
  bindQuickCopyBtn('copyPresetEthnicBtn', () => areaPresets.is_ethnic === 1 ? 'হ্যাঁ' : 'না');

  const navRight = document.querySelector('.nav-right');
  if (navRight && !$('closeSheetBtn')) {
    const closeBtn = document.createElement('button');
    closeBtn.id = 'closeSheetBtn';
    closeBtn.className = 'icon-btn';
    closeBtn.innerHTML = '✕';
    closeBtn.addEventListener('click', () => window.parent.postMessage({ action: 'FC_CLOSE_SHEET' }, '*'));
    navRight.prepend(closeBtn);
  }

  $('settingsToggleBtn').addEventListener('click', () => $('settingsDrawer').classList.toggle('open'));
  $('toggleKeyBtn').addEventListener('click', () => {
    const inp = $('apiKeyInput');
    inp.type = inp.type === 'password' ? 'text' : 'password';
    $('toggleKeyBtn').textContent = inp.type === 'password' ? 'Show' : 'Hide';
  });

  $('uploadHeadBtn').addEventListener('click', () => $('headUpload').click());
  $('uploadOtherBtn').addEventListener('click', () => $('otherUpload').click());
  $('headUpload').addEventListener('change', (e) => handleUpload(e, 'head'));
  $('otherUpload').addEventListener('change', (e) => handleUpload(e, 'other'));

  $('captureHeadBtn').addEventListener('click', () => openCamera('head'));
  $('captureOtherBtn').addEventListener('click', () => openCamera('other'));

  $('extractBtn').addEventListener('click', runExtraction);
  $('stopExtractBtn').addEventListener('click', () => {
    if (extractionController) extractionController.abort();
  });
  $('autofillBtn').addEventListener('click', triggerFormAutofill);

  $('copyJsonBtn').addEventListener('click', async () => {
    if (!state.lastExtracted) return;
    await copyTextSafe($('rawJsonOutput').textContent);
    setStatus('Raw JSON copied to clipboard.', 'ok');
  });

  $('exportJsonBtn').addEventListener('click', exportExtractedJson);
  $('importJsonBtn').addEventListener('click', () => $('importJsonInput').click());
  $('importJsonInput').addEventListener('change', importExtractedJson);

  $('clearAllBtn').addEventListener('click', () => {
    state.head = [];
    state.other = [];
    state.lastExtracted = null;
    window.parent.postMessage({ action: 'FC_SAVE_SESSION', sessionData: null }, '*');
    renderPreviews('head');
    renderPreviews('other');
    $('resultsWrap').classList.remove('visible');
    $('autofillBtn').disabled = true;
    setStatus('Cards cleared (Saved Area settings kept for next family).', 'idle');
  });

  $('pullFromWebBtn').addEventListener('click', () => {
    window.parent.postMessage({ action: 'FC_PULL_DRAFT' }, '*');
    setStatus('Pulling all tabs & fields from web form...', 'loading');
  });

  ['headDropZone', 'otherDropZone'].forEach(id => {
    const zone = $(id);
    if (!zone) return;
    const category = id === 'headDropZone' ? 'head' : 'other';
    zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('drag-over'); });
    zone.addEventListener('dragleave', (e) => { e.preventDefault(); zone.classList.remove('drag-over'); });
    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      zone.classList.remove('drag-over');
      handleUpload(null, category, e.dataTransfer.files);
    });
  });

  setupNativeCropper();
  setupImageViewerModal();
  setupUpdateChecker();

  window.addEventListener('message', handleIncomingMessages);

  window.parent.postMessage({ action: 'FC_CHECK_STATUS' }, '*');
  window.parent.postMessage({ action: 'FC_GET_API_KEY' }, '*');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

let sessionRestored = false;

function handleIncomingMessages(e) {
  if (e.source !== window.parent || !e.data) return;

  if (e.data.action === 'FC_RESTORE_SESSION' && !sessionRestored) {
    sessionRestored = true;
    const s = e.data.sessionData;
    if (s) {
      if (Array.isArray(s.head) && !state.head.length) state.head = s.head;
      if (Array.isArray(s.other) && !state.other.length) state.other = s.other;
      if (s.nextId) nextId = s.nextId;
      renderPreviews('head');
      renderPreviews('other');
      if (s.lastExtracted && !state.lastExtracted) {
        state.lastExtracted = normalizeOutput(s.lastExtracted, true);
        renderExtractedCards(state.lastExtracted);
        $('autofillBtn').disabled = false;
        setStatus('Restored previous session data automatically!', 'ok');
      }
    }
  }

  if (e.data.action === 'FC_API_KEY_DATA') {
    if (e.data.apiKey) {
      if (!$('apiKeyInput').value) $('apiKeyInput').value = e.data.apiKey;
      try { localStorage.setItem(STORAGE_KEY, e.data.apiKey); } catch (_) {}
      $('settingsDrawer').classList.remove('open');
    }
    if (e.data.model) {
      $('modelSelect').value = e.data.model;
      try { localStorage.setItem(STORAGE_MODEL, e.data.model); } catch (_) {}
    }
    if (e.data.areaPresets && typeof e.data.areaPresets === 'object') {
      const p = e.data.areaPresets;
      if (!areaPresets.village && p.village) areaPresets.village = String(p.village);
      if (!areaPresets.ward_no && p.ward_no) areaPresets.ward_no = String(p.ward_no);
      if (!areaPresets.post_code && p.post_code) areaPresets.post_code = String(p.post_code);
      if (p.area_type_id !== undefined) areaPresets.area_type_id = Number(p.area_type_id) || 1;
      if (p.is_ethnic !== undefined) areaPresets.is_ethnic = Number(p.is_ethnic) || 0;
      try { localStorage.setItem(STORAGE_AREA_PRESETS, JSON.stringify(areaPresets)); } catch (_) {}
      syncAreaPresetInputs();
    }
  }

  if (e.data.action === 'FC_AUTOFILL_RESPONSE') {
    setStatus(e.data.detail.message, e.data.detail.success ? 'ok' : 'err');
  }
  if (e.data.action === 'FC_STATUS_REPLY') {
    const pill = $('connStatus');
    if (e.data.online) {
      pill.classList.add('online');
      $('connText').textContent = 'Form Ready';
    }
  }

  if (e.data.action === 'FC_PULL_RESPONSE') {
    const res = e.data.detail;
    if (res.success && res.payload) {
      state.lastExtracted = normalizeOutput(res.payload, true);
      renderExtractedCards(state.lastExtracted);
      $('autofillBtn').disabled = false;
      setStatus(`Pulled Head + ${state.lastExtracted.family_members.length} member(s) & all website tabs!`, 'ok');
    } else {
      setStatus(res.message || 'Could not pull draft data.', 'err');
    }
  }
}

function setStatus(message, mode = 'idle') {
  const banner = $('statusBanner');
  banner.className = `status-banner ${mode}`;
  $('statusText').textContent = message;
}

function toEnglishDigits(str) {
  if (!str) return '';
  return String(str).replace(/[০-৯]/g, (d) => '০১২৩৪৫৬৭৮৯'.indexOf(d));
}

function normalizeDob(rawDob) {
  let s = toEnglishDigits(rawDob).trim();
  if (!s) return '';
  s = s.replace(/\[.*?\]/g, ''); 
  
  let dd, mm, yyyy;
  const dmy = s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (dmy) { dd = dmy[1]; mm = dmy[2]; yyyy = dmy[3]; }
  else {
    const ymd = s.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
    if (ymd) { yyyy = ymd[1]; mm = ymd[2]; dd = ymd[3]; }
    else return s;
  }
  
  dd = dd.padStart(2, '0');
  mm = mm.padStart(2, '0');
  const mIndex = parseInt(mm, 10) - 1;
  const monStr = (mIndex >= 0 && mIndex < 12) ? `[${MONTH_NAMES[mIndex]}]` : '';
  
  return `${dd}-${mm}${monStr}-${yyyy}`;
}

function calculateAgeYears(rawDob) {
  const clean = toEnglishDigits(String(rawDob || '')).replace(/\[.*?\]/g, '').trim();
  if (!clean) return null;
  let dd, mm, yyyy;
  const dmy = clean.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (dmy) {
    dd = parseInt(dmy[1], 10);
    mm = parseInt(dmy[2], 10);
    yyyy = parseInt(dmy[3], 10);
  } else {
    const ymd = clean.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
    if (ymd) {
      yyyy = parseInt(ymd[1], 10);
      mm = parseInt(ymd[2], 10);
      dd = parseInt(ymd[3], 10);
    } else {
      return null;
    }
  }
  const today = new Date();
  let age = today.getFullYear() - yyyy;
  const mDiff = (today.getMonth() + 1) - mm;
  if (mDiff < 0 || (mDiff === 0 && today.getDate() < dd)) {
    age--;
  }
  return age >= 0 && age < 130 ? age : null;
}

function dobToSortable(dobStr) {
  const clean = String(dobStr || '').replace(/\[.*?\]/g, '');
  const dmy = clean.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  return dmy ? `${dmy[3]}-${dmy[2]}-${dmy[1]}` : String(dobStr || '');
}

function inferDocType(idStr, explicitType) {
  const up = String(explicitType || '').toUpperCase().trim();
  if (up === 'NID' || up === 'BRN') return up;
  const clean = String(idStr || '').replace(/\s+/g, '');
  if (clean.length === 10 || clean.length === 13) return 'NID';
  if (clean.length === 17) return 'BRN';
  return 'NID';
}

function inferGender(relation, explicitGender, nameEn, nameBn) {
  if (relation && RELATION_GENDER_MAP[relation]) return RELATION_GENDER_MAP[relation];
  const g = String(explicitGender || '').trim().toLowerCase();
  if (g === 'female' || g === '2' || g === 'f' || g === 'মহিলা' || g === 'নারী') return 'Female';
  if (g === 'male' || g === '1' || g === 'm' || g === 'পুরুষ') return 'Male';
  const combined = `${nameEn || ''} ${nameBn || ''}`;
  if (/\b(?:mst|mosammat|begum|khatun|akter|akhter|bibi|parvin|sultana)\b|মোছা|মোসা|বেগম|খাতুন|আক্তার/i.test(combined)) return 'Female';
  return 'Male';
}

function formatEnglishName(rawName) {
  if (!rawName) return '';
  let s = String(rawName).trim().replace(/\s+/g, ' ');
  s = s.replace(/^(?:mosha|mosa|most|mst|mosammat|musammat|মোছাঃ|মোসাঃ|মোছা|মোসা)[:.]?\s+/i, 'MST. ');
  s = s.replace(/^(?:md|mohd|मोঃ|মোঃ|মো)[:.]?\s+/i, 'MD. ');
  return s.toUpperCase();
}

function saveSessionState() {
  try {
    const payload = {
      head: state.head,
      other: state.other,
      lastExtracted: state.lastExtracted,
      nextId
    };
    window.parent.postMessage({ action: 'FC_SAVE_SESSION', sessionData: payload }, '*');
  } catch (e) {}
}

function recalculateHouseholdSummary(data) {
  if (!data) return;
  const allPeople = [];
  if (data.head && (data.head.nid || data.head.name_bn || data.head.name_en || data.head.dob)) {
    data.head.age = calculateAgeYears(data.head.dob);
    allPeople.push(data.head);
  }
  if (Array.isArray(data.family_members)) {
    data.family_members.forEach((m) => {
      m.age = calculateAgeYears(m.dob);
      m.is_child_under_18 = m.age !== null && m.age < 18;
      allPeople.push(m);
    });
  }

  const totalMembers = allPeople.length || 1;
  const childrenUnder18 = allPeople.filter((p) => {
    const a = calculateAgeYears(p.dob);
    return a !== null && a >= 0 && a < 18;
  }).length;

  data.form_defaults = {
    total_members: totalMembers,
    children_under_18: childrenUnder18,
    village: areaPresets.village || '',
    ward_no: areaPresets.ward_no || '',
    post_code: areaPresets.post_code || '',
    is_ethnic: Number(areaPresets.is_ethnic ?? 0),
    khudro_nrigosthi_label: Number(areaPresets.is_ethnic) === 1 ? 'হ্যাঁ (Yes)' : 'না (No)',
    area_type_id: Number(areaPresets.area_type_id ?? 1),
    area_type_label: AREA_TYPE_OPTIONS.find(a => a.value === Number(areaPresets.area_type_id || 1))?.label || 'পল্লী / ইউনিয়ন (Polli / Union)'
  };

  const totalInp = $('fcSummaryTotalMembers');
  const childInp = $('fcSummaryChildrenCount');
  const totalPill = $('fcPillTotalMembers');
  const childPill = $('fcPillChildrenCount');
  if (totalInp) totalInp.value = String(data.form_defaults.total_members);
  if (childInp) childInp.value = String(data.form_defaults.children_under_18);
  if (totalPill) totalPill.textContent = `${data.form_defaults.total_members} জন`;
  if (childPill) childPill.textContent = `${data.form_defaults.children_under_18} জন`;
}

function syncJsonOutput() {
  if (!state.lastExtracted) return;
  recalculateHouseholdSummary(state.lastExtracted);
  $('rawJsonOutput').textContent = JSON.stringify(state.lastExtracted, null, 2);
  saveSessionState();
}

function addImage(category, base64, name) {
  state[category].push({ id: nextId++, base64, name: name || 'Card.jpg', relation: 'Auto', boundRef: null, boundRefs: [] });
  renderPreviews(category);
  saveSessionState();
}

function removeImage(category, id) {
  state[category] = state[category].filter((item) => item.id !== id);
  renderPreviews(category);
  saveSessionState();
}

function moveImage(category, idx, dir) {
  const list = state[category];
  const target = idx + dir;
  if (target < 0 || target >= list.length) return;
  [list[idx], list[target]] = [list[target], list[idx]];
  renderPreviews(category);
  saveSessionState();
}

function setupUpdateChecker() {
  const updateBtn = $('updateCheckBtn');
  if (!updateBtn) return;
  updateBtn.addEventListener('click', async () => {
    const originalText = updateBtn.textContent;
    updateBtn.textContent = 'Checking...';
    updateBtn.disabled = true;
    setStatus('Checking for updates...', 'loading');
    try {
      const cleanUrl = location.href.split('?')[0];
      const baseDir = cleanUrl.substring(0, cleanUrl.lastIndexOf('/') + 1);
      const [jsRes] = await Promise.all([
        fetch(`${baseDir}sidepanel.js?u=${Date.now()}`, { cache: 'reload' }),
        fetch(`${cleanUrl}?u=${Date.now()}`, { cache: 'reload' })
      ]);
      if (jsRes.ok) {
        const jsText = await jsRes.text();
        const match = jsText.match(/CURRENT_VERSION_TAG\s*=\s*['"]([^'"]+)['"]/);
        const remoteVer = match ? match[1] : CURRENT_VERSION_TAG;
        setStatus(`Up to Date (${remoteVer})!`, 'ok');
        updateBtn.textContent = 'Up to Date ✓';
        if (remoteVer !== CURRENT_VERSION_TAG) { setTimeout(() => location.reload(), 600); return; }
        setTimeout(() => { updateBtn.textContent = originalText; updateBtn.disabled = false; }, 2500);
      } else throw new Error('HTTP ' + jsRes.status);
    } catch (err) {
      setStatus('Update check failed. Check connection.', 'err');
      updateBtn.textContent = 'Error';
      setTimeout(() => { updateBtn.textContent = originalText; updateBtn.disabled = false; }, 2500);
    }
  });
}

function toggleWarning(el) {
  if (!el.value || el.value.trim() === '') el.classList.add('field-warning');
  else el.classList.remove('field-warning');
}

function createFieldControl(f, targetObj, onUpdateMeta, cardContainer) {
  let inputEl;
  if (f.type === 'rel_select') {
    inputEl = document.createElement('select');
    inputEl.style.cssText = 'padding:4px 8px; font-size:12px; font-weight:600; border:1px solid #e2e8f0; background:#f8fafc; border-radius:5px; cursor:pointer; width:100%;';
    RELATION_OPTIONS.filter((opt) => opt.id !== null).forEach((opt) => {
      const o = document.createElement('option');
      o.value = opt.value;
      o.textContent = opt.label;
      inputEl.appendChild(o);
    });
    inputEl.value = targetObj.relation || 'Son';
    inputEl.addEventListener('change', (e) => {
      const newRel = e.target.value;
      targetObj.relation = newRel;
      targetObj.relationship_id = RELATION_ID_MAP[newRel] || 263;
      if (RELATION_GENDER_MAP[newRel]) {
        targetObj.gender = RELATION_GENDER_MAP[newRel];
        targetObj.gender_id = GENDER_ID_MAP[targetObj.gender] || 1;
        if (cardContainer) {
          const gSel = cardContainer.querySelector('select[data-field="gender"]');
          if (gSel) { gSel.value = targetObj.gender; toggleWarning(gSel); }
        }
      }
      toggleWarning(inputEl);
      if (onUpdateMeta) onUpdateMeta();
      syncJsonOutput();
    });
  } else if (f.type === 'gender_select') {
    inputEl = document.createElement('select');
    inputEl.setAttribute('data-field', 'gender');
    inputEl.style.cssText = 'padding:4px 8px; font-size:12px; font-weight:600; border:1px solid #e2e8f0; background:#f8fafc; border-radius:5px; cursor:pointer; width:100%;';
    GENDER_OPTIONS.forEach((opt) => {
      const o = document.createElement('option');
      o.value = opt.value;
      o.textContent = opt.label;
      inputEl.appendChild(o);
    });
    inputEl.value = targetObj.gender || 'Male';
    inputEl.addEventListener('change', (e) => {
      targetObj.gender = e.target.value;
      targetObj.gender_id = GENDER_ID_MAP[e.target.value] || 1;
      toggleWarning(inputEl);
      if (onUpdateMeta) onUpdateMeta();
      syncJsonOutput();
    });
  } else if (f.type === 'doc_select') {
    inputEl = document.createElement('select');
    inputEl.style.cssText = 'padding:4px 8px; font-size:12px; font-weight:700; border:1px solid #cbd5e1; background:#eff6ff; color:#1e40af; border-radius:5px; cursor:pointer; width:100%;';
    DOC_TYPE_OPTIONS.forEach((opt) => {
      const o = document.createElement('option');
      o.value = opt.value;
      o.textContent = opt.label;
      inputEl.appendChild(o);
    });
    inputEl.value = targetObj.doc_type || 'NID';
    inputEl.addEventListener('change', (e) => {
      targetObj.doc_type = e.target.value;
      toggleWarning(inputEl);
      if (onUpdateMeta) onUpdateMeta();
      syncJsonOutput();
    });
  } else {
    inputEl = document.createElement('input');
    inputEl.type = 'text';
    inputEl.value = targetObj[f.key] || '';
    inputEl.placeholder = f.key === 'dob' ? 'DD-MM-YYYY' : '—';
    inputEl.style.cssText = 'padding:4px 8px; font-size:12.5px; font-weight:550; border:1px solid transparent; background:transparent; border-radius:5px; width:100%;';
    if (f.key.endsWith('_en')) inputEl.style.textTransform = 'uppercase';

    inputEl.addEventListener('blur', () => {
      if (f.key === 'dob') {
        targetObj.dob = normalizeDob(inputEl.value);
        inputEl.value = targetObj.dob;
        targetObj.age = calculateAgeYears(targetObj.dob);
        if (onUpdateMeta) onUpdateMeta();
        syncJsonOutput();
      }
      toggleWarning(inputEl);
    });
    
    inputEl.addEventListener('input', () => {
      let val = inputEl.value;
      if (f.key === 'nid' || f.key === 'nid_or_brn') {
        val = toEnglishDigits(val).replace(/\s+/g, '');
      } else if (f.key.endsWith('_en')) {
        val = val.toUpperCase();
      }
      targetObj[f.key] = val;
      if (f.key === 'dob') {
        targetObj.age = calculateAgeYears(val);
        if (onUpdateMeta) onUpdateMeta();
      }
      toggleWarning(inputEl);
      syncJsonOutput();
    });
  }
  toggleWarning(inputEl);
  return inputEl;
}

function setupImageViewerModal() {
  if ($('fcViewerModal')) return;
  const modal = document.createElement('div');
  modal.id = 'fcViewerModal';
  modal.style.cssText = 'display:none; position:fixed; inset:0; z-index:99999; background:rgba(9,9,11,0.92); backdrop-filter:blur(6px); flex-direction:column; align-items:center; justify-content:flex-start; padding:12px; overflow-y:auto;';
  
  modal.innerHTML = `
    <div style="position:relative; width:100%; max-width:540px; display:flex; flex-direction:column; gap:10px; margin:auto;">
      <div style="display:flex; justify-content:space-between; align-items:center; color:#fff; padding:2px 4px;">
        <span id="fcViewerTitle" style="font-weight:700; font-size:13.5px; color:#38bdf8;">Card Inspector</span>
        <div style="display:flex; gap:6px; align-items:center;">
          <button type="button" id="fcCropImgBtn" style="background:#059669; color:#fff; border:none; border-radius:6px; padding:3px 10px; font-size:11px; font-weight:700; cursor:pointer; margin-right:4px;">Crop</button>
          <button type="button" id="fcZoomOutBtn" style="background:#27272a; color:#fff; border:1px solid #3f3f46; border-radius:6px; padding:3px 9px; font-size:12px; font-weight:700; cursor:pointer;">−</button>
          <button type="button" id="fcZoomResetBtn" style="background:#27272a; color:#fff; border:1px solid #3f3f46; border-radius:6px; padding:3px 8px; font-size:11px; cursor:pointer;">100%</button>
          <button type="button" id="fcZoomInBtn" style="background:#27272a; color:#fff; border:1px solid #3f3f46; border-radius:6px; padding:3px 9px; font-size:12px; font-weight:700; cursor:pointer;">+</button>
          <button type="button" id="fcViewerClose" style="background:#dc2626; color:#fff; border:none; border-radius:6px; width:28px; height:28px; font-weight:bold; font-size:14px; cursor:pointer; margin-left:4px;">✕</button>
        </div>
      </div>
      <div style="width:100%; max-height:40vh; overflow:auto; display:flex; align-items:center; justify-content:center; border-radius:8px;">
        <img id="fcViewerImg" style="max-width:100%; max-height:40vh; object-fit:contain; transition:transform 0.12s ease; transform-origin:center center;">
      </div>
      <div id="fcViewerMeta" style="width:100%; background:#18181b; color:#f8fafc; padding:12px; border-radius:10px; border:1px solid #27272a; font-size:12px; box-shadow:0 10px 25px rgba(0,0,0,0.5); max-height:48vh; overflow-y:auto;"></div>
    </div>`;
  document.body.appendChild(modal);

  const updateZoom = (val) => {
    viewerZoom = Math.min(3.5, Math.max(0.5, val));
    $('fcViewerImg').style.transform = `scale(${viewerZoom})`;
    $('fcZoomResetBtn').textContent = `${Math.round(viewerZoom * 100)}%`;
  };

  modal.querySelector('#fcZoomInBtn').onclick = () => updateZoom(viewerZoom + 0.25);
  modal.querySelector('#fcZoomOutBtn').onclick = () => updateZoom(viewerZoom - 0.25);
  modal.querySelector('#fcZoomResetBtn').onclick = () => updateZoom(1);

  const closeViewer = () => {
    modal.style.display = 'none';
    if (state.lastExtracted) renderExtractedCards(state.lastExtracted);
  };
  modal.querySelector('#fcViewerClose').onclick = closeViewer;
  modal.onclick = (e) => { if (e.target === modal) closeViewer(); };
}

function showImageViewer(item) {
  const modal = $('fcViewerModal');
  if (!modal) return;
  modal.querySelector('#fcCropImgBtn').onclick = () => openCropForImage(item);
  viewerZoom = 1;
  $('fcViewerImg').src = `data:image/jpeg;base64,${item.base64}`;
  $('fcViewerImg').style.transform = 'scale(1)';
  $('fcZoomResetBtn').textContent = '100%';

  const metaBox = $('fcViewerMeta');
  metaBox.replaceChildren();

  const refs = getItemRefs(item);
  if (refs.length > 0 && state.lastExtracted) {
    $('fcViewerTitle').textContent = refs.length > 1
      ? `Card Inspector (${refs.length} People in Photo)`
      : `Card Inspector — Edit`;

    const headerNote = document.createElement('div');
    headerNote.style.cssText = 'font-size:11px; color:#94a3b8; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;';
    headerNote.innerHTML = `<span>Showing ${refs.length} person(s) linked to this photo</span><span style="color:#38bdf8; font-weight:600;">● Manual Mode</span>`;
    metaBox.appendChild(headerNote);

    const multiContainer = document.createElement('div');
    multiContainer.style.cssText = 'display:flex; flex-direction:column; gap:14px;';

    refs.forEach((ref, refIdx) => {
      const isHead = ref.type === 'head';
      const targetObj = isHead ? state.lastExtracted.head : state.lastExtracted.family_members[ref.index];
      if (!targetObj) return;

      const personBox = document.createElement('div');
      personBox.style.cssText = 'background:#09090b; border:1px solid #27272a; border-radius:8px; padding:10px;';

      const personHeader = document.createElement('div');
      personHeader.style.cssText = 'font-size:12px; font-weight:700; color:#38bdf8; margin-bottom:8px; padding-bottom:5px; border-bottom:1px solid #27272a; display:flex; justify-content:space-between;';

      const updatePersonTitle = () => {
        const age = calculateAgeYears(targetObj.dob);
        const ageTxt = age !== null ? ` • ${age} yrs${age < 18 ? ' (শিশু <18)' : ''}` : '';
        personHeader.innerHTML = isHead
          ? `<span>Person #${refIdx + 1}: Primary Applicant (Wife)</span><span style="color:#a1a1aa; font-size:11px;">${targetObj.doc_type || 'NID'}${ageTxt}</span>`
          : `<span>Person #${refIdx + 1}: Member #${ref.index + 2} (${targetObj.relation})</span><span style="color:#a1a1aa; font-size:11px;">${targetObj.gender} • ${targetObj.doc_type || 'NID'}${ageTxt}</span>`;
      };
      updatePersonTitle();
      personBox.appendChild(personHeader);

      const fields = isHead ? HEAD_FIELDS : MEMBER_FIELDS;
      const formList = document.createElement('div');
      formList.style.cssText = 'display:flex; flex-direction:column; gap:7px;';

      fields.forEach((f) => {
        const row = document.createElement('div');
        row.style.cssText = 'display:grid; grid-template-columns:105px 1fr auto; align-items:center; gap:6px;';
        const lbl = document.createElement('label');
        lbl.style.cssText = 'color:#a1a1aa; font-size:11px; font-weight:500;';
        lbl.textContent = f.label;

        const inputEl = createFieldControl(f, targetObj, updatePersonTitle, formList);
        if (inputEl.tagName === 'INPUT' && !inputEl.classList.contains('field-warning')) {
          inputEl.style.color = '#f8fafc';
          inputEl.style.background = '#18181b';
          inputEl.style.borderColor = '#3f3f46';
        }

        const copyBtn = document.createElement('button');
        copyBtn.type = 'button';
        copyBtn.textContent = 'Copy';
        copyBtn.style.cssText = 'background:#27272a; color:#cbd5e1; border:1px solid #3f3f46; border-radius:5px; padding:4px 7px; font-size:10.5px; font-weight:600; cursor:pointer;';
        copyBtn.addEventListener('click', async () => {
          await copyTextSafe(targetObj[f.key] || '');
          copyBtn.textContent = 'Copied!';
          copyBtn.style.background = '#059669';
          copyBtn.style.color = '#fff';
          setTimeout(() => {
            copyBtn.textContent = 'Copy';
            copyBtn.style.background = '#27272a';
            copyBtn.style.color = '#cbd5e1';
          }, 800);
        });

        row.append(lbl, inputEl, copyBtn);
        formList.appendChild(row);
      });

      personBox.appendChild(formList);
      multiContainer.appendChild(personBox);
    });

    metaBox.appendChild(multiContainer);
    modal.style.display = 'flex';
    return;
  }

  $('fcViewerTitle').textContent = 'Card Preview';
  metaBox.innerHTML = '<div style="color:#a1a1aa; text-align:center; padding:10px;">Run <b>1. Extract with AI</b> first to inspect &amp; edit parsed fields here.</div>';
  modal.style.display = 'flex';
}

function renderPreviews(category) {
  const grid = $(category === 'head' ? 'headPreviews' : 'otherPreviews');
  const badge = $(category === 'head' ? 'headCount' : 'otherCount');
  badge.textContent = `${state[category].length} file(s)`;
  grid.replaceChildren();

  state[category].forEach((item, idx) => {
    const refs = getItemRefs(item);
    const hasData = refs.length > 0;
    const card = document.createElement('div');
    card.className = `thumb-item${hasData ? ' has-data' : ''}`;

    const img = document.createElement('img');
    img.src = `data:image/jpeg;base64,${item.base64}`;
    img.title = 'Tap to view photo and edit extracted data';
    img.style.cursor = 'pointer';
    img.addEventListener('click', () => showImageViewer(item));
    card.appendChild(img);

    const delBtn = document.createElement('button');
    delBtn.type = 'button';
    delBtn.className = 'thumb-remove';
    delBtn.textContent = '×';
    delBtn.addEventListener('click', (e) => { e.stopPropagation(); removeImage(category, item.id); });
    card.appendChild(delBtn);

    const cropBtn = document.createElement('button');
    cropBtn.type = 'button';
    cropBtn.className = 'thumb-crop';
    cropBtn.textContent = '✂️';
    cropBtn.addEventListener('click', (e) => { e.stopPropagation(); openCropForImage(item); });
    card.appendChild(cropBtn);

    const bar = document.createElement('div');
    bar.className = 'thumb-bar';
    const label = document.createElement('span');
    label.className = 'thumb-label';
    const countTag = refs.length > 1 ? `✓${refs.length} ` : (hasData ? '✓ ' : '');
    label.textContent = `${idx + 1}. ${countTag}${item.name}`;

    const moves = document.createElement('div');
    moves.className = 'thumb-moves';
    const left = document.createElement('button');
    left.type = 'button';
    left.textContent = '←';
    left.disabled = idx === 0;
    left.addEventListener('click', (e) => { e.stopPropagation(); moveImage(category, idx, -1); });

    const right = document.createElement('button');
    right.type = 'button';
    right.textContent = '→';
    right.disabled = idx === state[category].length - 1;
    right.addEventListener('click', (e) => { e.stopPropagation(); moveImage(category, idx, 1); });

    moves.append(left, right);
    bar.append(label, moves);
    card.appendChild(bar);

    if (category === 'other') {
      const select = document.createElement('select');
      RELATION_OPTIONS.forEach((opt) => {
        const o = document.createElement('option');
        o.value = opt.value;
        o.textContent = opt.label;
        select.appendChild(o);
      });
      select.value = item.relation;
      select.addEventListener('change', (e) => { item.relation = e.target.value; });
      card.appendChild(select);
    }
    grid.appendChild(card);
  });
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error(`Cannot read ${file.name}`));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error(`Invalid image ${file.name}`));
      img.onload = () => {
        const maxDim = 1500;
        const scale = Math.min(1, maxDim / Math.max(img.naturalWidth, img.naturalHeight));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.82).split(',')[1]);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

async function handleUpload(e, category, droppedFiles = null) {
  const files = Array.from(droppedFiles || (e ? e.target.files : []));
  if (!files.length) return;
  
  if (files.length === 1 && files[0].type.startsWith('image/')) {
    const file = files[0];
    const reader = new FileReader();
    reader.onload = (evt) => {
      rawImage = new Image();
      rawImage.onload = () => {
        activeCategory = category;
        activeCropItem = null;
        activeCropName = file.name;
        const canvas = $('cropCanvas');
        canvas.width = 900;
        canvas.height = 600;
        baseScale = Math.min(canvas.width / rawImage.width, canvas.height / rawImage.height);
        zoomLevel = 1;
        rotationAngle = 0;
        panX = 0;
        panY = 0;
        $('zoomRange').value = 1;
        $('cropModal').classList.add('open');
        drawCropCanvas();
      };
      rawImage.src = evt.target.result;
    };
    reader.readAsDataURL(file);
  } else {
    for (const file of files) {
      if (!file.type.startsWith('image/')) continue;
      try {
        const b64 = await fileToBase64(file);
        addImage(category, b64, file.name);
      } catch (err) {
        setStatus(err.message, 'err');
      }
    }
    setStatus(`${files.length} images added.`, 'ok');
  }
  if (e && e.target) e.target.value = '';
}

function openCamera(category) {
  const input = $('cameraInput');
  input.value = '';
  input.onchange = (e) => handleUpload(e, category);
  input.click();
}

function openCropForImage(item) {
  activeCropItem = item;
  activeCategory = null; 
  
  rawImage = new Image();
  rawImage.onload = () => {
    const canvas = $('cropCanvas');
    canvas.width = 900;
    canvas.height = 600;
    baseScale = Math.min(canvas.width / rawImage.width, canvas.height / rawImage.height);
    zoomLevel = 1;
    rotationAngle = 0;
    panX = 0;
    panY = 0;
    $('zoomRange').value = 1;
    
    $('fcViewerModal').style.display = 'none';
    $('cropModal').classList.add('open');
    drawCropCanvas();
  };
  rawImage.src = `data:image/jpeg;base64,${item.base64}`;
}

function drawCropCanvas() {
  const canvas = $('cropCanvas');
  if (!rawImage || !canvas) return;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  ctx.save();
  ctx.translate(canvas.width / 2 + panX, canvas.height / 2 + panY);
  
  const totalScale = baseScale * zoomLevel;
  ctx.scale(totalScale, totalScale); 
  ctx.rotate((rotationAngle * Math.PI) / 180);
  
  ctx.drawImage(rawImage, -rawImage.width / 2, -rawImage.height / 2);
  ctx.restore();
}

function setupNativeCropper() {
  const canvas = $('cropCanvas');
  const zoomRange = $('zoomRange');
  const rotateBtn = $('rotateCropBtn');

  if (rotateBtn) {
    rotateBtn.addEventListener('click', () => {
      rotationAngle = (rotationAngle + 90) % 360;
      drawCropCanvas();
    });
  }

  if (zoomRange) {
    zoomRange.addEventListener('input', (e) => {
      zoomLevel = parseFloat(e.target.value);
      drawCropCanvas();
    });
  }

  if (canvas) {
    canvas.addEventListener('mousedown', (e) => {
      isDragging = true;
      startX = e.clientX - panX;
      startY = e.clientY - panY;
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      panX = e.clientX - startX;
      panY = e.clientY - startY;
      drawCropCanvas();
    });

    window.addEventListener('mouseup', () => { isDragging = false; });

    canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        e.preventDefault();
        isDragging = true;
        startX = e.touches[0].clientX - panX;
        startY = e.touches[0].clientY - panY;
      }
    }, { passive: false });

    window.addEventListener('touchmove', (e) => {
      if (!isDragging || e.touches.length !== 1) return;
      panX = e.touches[0].clientX - startX;
      panY = e.touches[0].clientY - startY;
      drawCropCanvas();
    }, { passive: true });

    window.addEventListener('touchend', () => { isDragging = false; });
  }

  $('cancelCropBtn').addEventListener('click', () => {
    $('cropModal').classList.remove('open');
    if (activeCropItem) {
      $('fcViewerModal').style.display = 'flex';
      activeCropItem = null;
    }
  });

  $('saveCropBtn').addEventListener('click', () => {
    const canvas = $('cropCanvas');
    if (!canvas) return;
    const b64 = canvas.toDataURL('image/jpeg', 0.85).split(',')[1];
    $('cropModal').classList.remove('open');
    
    if (activeCropItem) {
      activeCropItem.base64 = b64;
      renderPreviews('head');
      renderPreviews('other');
      saveSessionState();
      
      if ($('fcViewerModal').style.display !== 'none') {
        $('fcViewerImg').src = `data:image/jpeg;base64,${b64}`;
      } else {
        $('fcViewerModal').style.display = 'flex';
      }
      
      setStatus('Image cropped and updated.', 'ok');
      activeCropItem = null;
    } else if (activeCategory) {
      addImage(activeCategory, b64, activeCropName || 'Cropped_Photo.jpg');
      setStatus('Cropped photo added.', 'ok');
      activeCategory = null;
    }
  });
}

function buildPrompt() {
  const allowedRelations = RELATION_OPTIONS.filter((r) => r.id !== null).map((r) => `"${r.value}"`).join(', ');
  return `Extract Bangladeshi NID and Birth Registration (BRN) data from the provided images into strict JSON.

MULTI-CARD / MULTI-PERSON SINGLE IMAGE RULE:
- A single uploaded photo may contain TWO OR MORE NID/BRN cards side-by-side or stacked (for example, Husband and Wife in one photo, or multiple children in one photo).
- Extract EVERY person visible in each image as a separate record, and assign the same image tag (e.g., "S1_1") to the "source_images" array of EACH person found in that image!

INTELLIGENT DOCUMENT DETECTION ('doc_type'):
- Carefully inspect each card to determine if it is a National Identity Card ("NID") or a Birth Registration Certificate ("BRN").
- Birth Certificates have headers like "জন্ম নিবন্ধন সনদ", "Birth Registration Certificate", "জন্ম নিবন্ধন নম্বর", or "BRN" (17 digits). Set "doc_type": "BRN".
- National ID Cards have headers like "জাতীয় পরিচয়পত্র", "National ID Card", "ID NO", or "NID No" (10, 13, or 17 digits). Set "doc_type": "NID".
- BRN & DOB ACCURACY: Birth Certificates have multiple dates. Extract ONLY the Date of Birth (জন্ম তারিখ). Ignore Date of Registration (নিবন্ধন তারিখ) and Date of Issuance (প্রদানের তারিখ).

STRICT NAME EXTRACTION & CROSS-VERIFICATION RULES:
1. NEVER READ FROM SIGNATURE:
   - Extract 'name_bn' and 'name_en' ONLY from the printed "নাম:" (Name) and "Name:" text fields in the main body of the NID card.
   - NEVER extract, guess, or copy the name from the handwritten signature ("স্বাক্ষর" / Signature).
2. CROSS-CHECK HEAD (WIFE) WITH CHILDREN'S MOTHER'S NAME:
   - Use the children's "মাতার নাম" (Mother's Name) and "পিতার নাম" (Father's Name) fields to cross-verify which card belongs to the Mother/Wife ('head') and Husband.

CRITICAL ROLE & GENDER RULE:
- The system for fc.bhata.gov.bd requires the Primary Applicant ('head') to be the WIFE / MOTHER (Female, "gender": "Female"). 
- Find the female cardholder in Section 1. She MUST be assigned as 'head' with "gender": "Female".
- The Husband / Father MUST be placed as the FIRST item in 'family_members' with relation "Husband" and "gender": "Male". Never assign a male as 'head'.
- For every family member, determine their "gender" ("Male" or "Female") from the card's Sex/লিঙ্গ field or their name/relationship.

IMAGE TRACKING RULE:
- Each image is labeled with an ID tag like "S1_1", "S1_2", "S2_1", etc.
- In both "head" and each object in "family_members", include a "source_images" array listing all image tags where that person's card appears.

EXTRACTION RULES:
1. PRIMARY APPLICANT (WIFE = 'head'):
   - Extract doc_type ("NID" or "BRN"), gender ("Female"), name_bn, name_en, father_name_bn, father_name_en, mother_name_bn, mother_name_en, nid, dob, and source_images.
2. HUSBAND & FAMILY MEMBERS (family_members):
   - First member must be "Husband" ("gender": "Male"). Extract relation, gender ("Male" or "Female"), doc_type ("NID" or "BRN"), name_bn, name_en, father_name_bn, mother_name_bn, nid_or_brn, dob, and source_images.
   - For children/others, choose correct relationship from: ${allowedRelations}.
3. ENGLISH NAME & DATE FORMATTING:
   - Always transliterate "মোঃ" or "মো:" as "MD." and "মোছাঃ" or "মোসাঃ" as "MST."
   - All numbers must use English digits (0-9).
   - All dates ('dob') MUST be formatted strictly as DD-MM-YYYY (e.g., "05-11-1998").

JSON SCHEMA:
{
  "head": {
    "doc_type": "NID", "gender": "Female", "name_bn": "", "name_en": "", "father_name_bn": "", "father_name_en": "", "mother_name_bn": "", "mother_name_en": "", "nid": "", "dob": "DD-MM-YYYY", "source_images": ["S1_1"]
  },
  "family_members": [
    {
      "relation": "Husband", "gender": "Male", "doc_type": "NID", "name_bn": "", "name_en": "", "father_name_bn": "", "mother_name_bn": "", "nid_or_brn": "", "dob": "DD-MM-YYYY", "is_disabled": 0, "source_images": ["S1_1"]
    }
  ]
}`;
}

function normalizeOutput(raw, preserveOrder = false) {
  const s = (v) => (v == null ? '' : String(v).trim());
  const h = raw?.head || {};
  const cleanHeadId = toEnglishDigits(s(h.nid)).replace(/\s+/g, '');
  const headGender = inferGender('Wife', h.gender || 'Female', h.name_en, h.name_bn);
  const headDob = normalizeDob(h.dob);
  const headAge = calculateAgeYears(headDob);

  const head = {
    doc_type: inferDocType(cleanHeadId, h.doc_type),
    gender: headGender,
    gender_id: GENDER_ID_MAP[headGender] || 2,
    name_bn: s(h.name_bn),
    name_en: formatEnglishName(h.name_en),
    father_name_bn: s(h.father_name_bn),
    father_name_en: formatEnglishName(h.father_name_en),
    mother_name_bn: s(h.mother_name_bn),
    mother_name_en: formatEnglishName(h.mother_name_en),
    nid: cleanHeadId,
    dob: headDob,
    age: headAge,
    source_images: Array.isArray(h.source_images) ? h.source_images : []
  };

  const members = Array.isArray(raw?.family_members) ? raw.family_members : [];
  const deduped = [];
  const seen = new Map();

  for (const m of members) {
    let rel = s(m?.relation);
    if ((!rel || !RELATION_ID_MAP[rel]) && m?.relationship_id && ID_TO_RELATION_MAP[Number(m.relationship_id)]) {
      rel = ID_TO_RELATION_MAP[Number(m.relationship_id)];
    }
    if (!RELATION_ID_MAP[rel]) rel = 'Son';

    const cleanMemId = toEnglishDigits(s(m?.nid_or_brn)).replace(/\s+/g, '');
    const memGender = inferGender(rel, m?.gender, m?.name_en, m?.name_bn);
    const memDob = normalizeDob(m?.dob);
    const memAge = calculateAgeYears(memDob);

    const entry = {
      relation: rel,
      relationship_id: Number(m?.relationship_id) || RELATION_ID_MAP[rel] || 263,
      gender: memGender,
      gender_id: GENDER_ID_MAP[memGender] || 1,
      doc_type: inferDocType(cleanMemId, m?.doc_type),
      name_bn: s(m?.name_bn),
      name_en: formatEnglishName(m?.name_en),
      father_name_bn: s(m?.father_name_bn),
      mother_name_bn: s(m?.mother_name_bn),
      nid_or_brn: cleanMemId,
      dob: memDob,
      age: memAge,
      is_child_under_18: memAge !== null && memAge >= 0 && memAge < 18,
      is_disabled: Number(m?.is_disabled) === 1 ? 1 : 0,
      source_images: Array.isArray(m?.source_images) ? m.source_images : []
    };

    if (preserveOrder) {
      deduped.push(entry);
      continue;
    }

    const key = entry.nid_or_brn || `${entry.name_en.toLowerCase()}|${entry.dob}`;
    if (key && seen.has(key)) {
      const existing = deduped[seen.get(key)];
      for (const k of Object.keys(existing)) {
        if (k === 'source_images') {
          existing.source_images = Array.from(new Set([...existing.source_images, ...entry.source_images]));
        } else if (!existing[k] && entry[k]) {
          existing[k] = entry[k];
        }
      }
    } else {
      if (key) seen.set(key, deduped.length);
      deduped.push(entry);
    }
  }

  if (!preserveOrder) {
    deduped.sort((a, b) => {
      if (a.relation === 'Husband' && b.relation !== 'Husband') return -1;
      if (b.relation === 'Husband' && a.relation !== 'Husband') return 1;
      if (a.dob && b.dob) return dobToSortable(a.dob).localeCompare(dobToSortable(b.dob));
      return 0;
    });
  }

  // If imported JSON has saved area defaults and local areaPresets are empty, adopt them
  if (raw?.form_defaults) {
    if (!areaPresets.village && raw.form_defaults.village) areaPresets.village = s(raw.form_defaults.village);
    if (!areaPresets.ward_no && raw.form_defaults.ward_no) areaPresets.ward_no = s(raw.form_defaults.ward_no);
    if (!areaPresets.post_code && raw.form_defaults.post_code) areaPresets.post_code = s(raw.form_defaults.post_code);
    syncAreaPresetInputs();
  }

  const allPeople = [head, ...deduped];
  const childrenCount = allPeople.filter((p) => p.age !== null && p.age >= 0 && p.age < 18).length;

  const form_defaults = {
    total_members: allPeople.length,
    children_under_18: childrenCount,
    village: areaPresets.village || '',
    ward_no: areaPresets.ward_no || '',
    post_code: areaPresets.post_code || '',
    is_ethnic: Number(areaPresets.is_ethnic ?? 0),
    khudro_nrigosthi_label: Number(areaPresets.is_ethnic) === 1 ? 'হ্যাঁ (Yes)' : 'না (No)',
    area_type_id: Number(areaPresets.area_type_id ?? 1),
    area_type_label: AREA_TYPE_OPTIONS.find(a => a.value === Number(areaPresets.area_type_id || 1))?.label || 'পল্লী / ইউনিয়ন (Polli / Union)'
  };

  const result = { head, family_members: deduped, form_defaults };
  if (raw && raw.full_form_dump && typeof raw.full_form_dump === 'object') {
    result.full_form_dump = raw.full_form_dump;
  }
  return result;
}

async function copyTextSafe(val) {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(val);
      return;
    }
    throw new Error('Fallback to parent window');
  } catch (err) {
    window.parent.postMessage({ action: 'FC_COPY_TEXT', text: val }, '*');
    try {
      const textarea = document.createElement('textarea');
      textarea.value = val;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    } catch (e) {}
  }
}

function bindExtractedDataToThumbnails(data) {
  state.head.forEach((item) => { item.boundRef = null; item.boundRefs = []; });
  state.other.forEach((item) => { item.boundRef = null; item.boundRefs = []; });

  const tagMap = new Map();
  state.head.forEach((item, idx) => tagMap.set(`S1_${idx + 1}`, item));
  state.other.forEach((item, idx) => tagMap.set(`S2_${idx + 1}`, item));

  if (data.head) {
    const h = data.head;
    const ref = { type: 'head' };
    let bound = false;
    if (Array.isArray(h.source_images) && h.source_images.length > 0) {
      h.source_images.forEach((tag) => {
        if (tagMap.has(tag)) {
          addItemRef(tagMap.get(tag), ref);
          bound = true;
        }
      });
    }
    if (!bound && state.head[0]) {
      addItemRef(state.head[0], ref);
    }
  }

  if (Array.isArray(data.family_members)) {
    let fallbackOtherIdx = 0;
    data.family_members.forEach((m, memberIdx) => {
      const ref = { type: 'member', index: memberIdx };
      let bound = false;

      if (Array.isArray(m.source_images) && m.source_images.length > 0) {
        m.source_images.forEach((tag) => {
          if (tagMap.has(tag)) {
            addItemRef(tagMap.get(tag), ref);
            bound = true;
          }
        });
      }

      if (!bound) {
        if (m.relation === 'Husband') {
          const targetHeadImg = state.head.find((it) => getItemRefs(it).length === 0) || state.head[1] || state.head[0];
          if (targetHeadImg) addItemRef(targetHeadImg, ref);
        } else if (state.other[fallbackOtherIdx]) {
          addItemRef(state.other[fallbackOtherIdx], ref);
          fallbackOtherIdx++;
        } else if (state.other[0]) {
          addItemRef(state.other[0], ref);
        }
      }
    });

    state.head.forEach((item, idx) => {
      if (getItemRefs(item).length === 0 && idx > 0 && getItemRefs(state.head[idx - 1]).length > 0) {
        getItemRefs(state.head[idx - 1]).forEach((r) => addItemRef(item, r));
      }
    });
    state.other.forEach((item, idx) => {
      if (getItemRefs(item).length === 0 && idx > 0 && getItemRefs(state.other[idx - 1]).length > 0) {
        getItemRefs(state.other[idx - 1]).forEach((r) => addItemRef(item, r));
      }
    });
  }

  renderPreviews('head');
  renderPreviews('other');
}

function renderHouseholdSummaryCard(data) {
  const wrap = $('householdSummaryWrap');
  if (!wrap) return;
  wrap.replaceChildren();

  recalculateHouseholdSummary(data);
  const defs = data.form_defaults;

  const card = document.createElement('div');
  card.className = 'record-card';
  card.style.borderColor = '#bfdbfe';

  const headEl = document.createElement('div');
  headEl.className = 'record-head';
  headEl.style.background = '#eff6ff';
  headEl.innerHTML = `<span style="color:#1e40af;">Household Member &amp; Child Count</span><span class="record-tag child-badge">Auto-Counted</span>`;
  card.appendChild(headEl);

  const pills = document.createElement('div');
  pills.className = 'summary-pills';
  pills.innerHTML = `
    <div class="summary-pill">
      <span class="summary-pill-label">মোট সদস্য (Members)</span>
      <span class="summary-pill-val" id="fcPillTotalMembers">${defs.total_members} জন</span>
    </div>
    <div class="summary-pill">
      <span class="summary-pill-label">শিশু &lt;18 (Children)</span>
      <span class="summary-pill-val" id="fcPillChildrenCount">${defs.children_under_18} জন</span>
    </div>
  `;
  card.appendChild(pills);

  const rows = document.createElement('div');
  rows.className = 'record-rows';

  // 1. Total Members Row
  const totalInp = document.createElement('input');
  totalInp.id = 'fcSummaryTotalMembers';
  totalInp.type = 'number';
  totalInp.value = String(defs.total_members);
  totalInp.style.cssText = 'padding:4px 8px; font-size:12.5px; font-weight:700; border:1px solid #cbd5e1; background:#fff; border-radius:5px; width:100%;';
  totalInp.addEventListener('input', () => {
    defs.total_members = parseInt(totalInp.value, 10) || 0;
    if ($('fcPillTotalMembers')) $('fcPillTotalMembers').textContent = `${defs.total_members} জন`;
    $('rawJsonOutput').textContent = JSON.stringify(state.lastExtracted, null, 2);
    saveSessionState();
  });
  rows.appendChild(buildCopyRow('মোট সদস্য (Total)', totalInp, () => defs.total_members));

  // 2. Children Under 18 (শিশু সংখ্যা) Row
  const childInp = document.createElement('input');
  childInp.id = 'fcSummaryChildrenCount';
  childInp.type = 'number';
  childInp.value = String(defs.children_under_18);
  childInp.style.cssText = 'padding:4px 8px; font-size:12.5px; font-weight:700; border:1px solid #cbd5e1; background:#fff; border-radius:5px; width:100%;';
  childInp.addEventListener('input', () => {
    defs.children_under_18 = parseInt(childInp.value, 10) || 0;
    if ($('fcPillChildrenCount')) $('fcPillChildrenCount').textContent = `${defs.children_under_18} জন`;
    $('rawJsonOutput').textContent = JSON.stringify(state.lastExtracted, null, 2);
    saveSessionState();
  });
  rows.appendChild(buildCopyRow('শিশু সংখ্যা (<18)', childInp, () => defs.children_under_18));

  card.appendChild(rows);
  wrap.appendChild(card);
}

function renderExtractedCards(data) {
  const container = $('visualCards');
  container.replaceChildren();
  $('resultsWrap').classList.add('visible');

  renderHouseholdSummaryCard(data);

  const buildEditableCard = (targetObj, fields, isMember = false, memberIdx = 0) => {
    const card = document.createElement('div');
    card.className = 'record-card';

    const headEl = document.createElement('div');
    headEl.className = 'record-head';
    const titleSpan = document.createElement('span');
    const tagSpan = document.createElement('span');
    tagSpan.className = 'record-tag';

    const refreshHeader = () => {
      const age = calculateAgeYears(targetObj.dob);
      const isChild = age !== null && age >= 0 && age < 18;
      const ageLabel = age !== null ? ` • ${age}y${isChild ? ' (শিশু <18)' : ''}` : '';
      if (isChild) tagSpan.classList.add('child-badge');
      else tagSpan.classList.remove('child-badge');

      if (!isMember) {
        titleSpan.textContent = `Member #1 — Head (${targetObj.gender || 'Female'})`;
        tagSpan.textContent = `Primary • ${targetObj.doc_type || 'NID'}${ageLabel}`;
      } else {
        titleSpan.textContent = `Member #${memberIdx + 2} — ${targetObj.relation} (${targetObj.gender || 'Male'})`;
        tagSpan.textContent = `${targetObj.doc_type || 'NID'}${ageLabel}`;
      }
    };
    refreshHeader();

    headEl.append(titleSpan, tagSpan);
    card.appendChild(headEl);

    const body = document.createElement('div');
    body.className = 'record-rows';

    fields.forEach((f) => {
      const r = document.createElement('div');
      r.className = 'record-row';
      r.style.gridTemplateColumns = '105px 1fr auto';

      const kEl = document.createElement('span');
      kEl.className = 'row-key';
      kEl.textContent = f.label;

      const inputEl = createFieldControl(f, targetObj, refreshHeader, body);

      const copyBtn = document.createElement('button');
      copyBtn.type = 'button';
      copyBtn.className = 'btn btn-xs';
      copyBtn.textContent = 'Copy';
      copyBtn.style.padding = '2px 7px';
      copyBtn.style.fontSize = '10px';
      copyBtn.addEventListener('click', async () => {
        await copyTextSafe(targetObj[f.key] || '');
        copyBtn.textContent = 'Copied';
        copyBtn.style.color = '#059669';
        setTimeout(() => {
          copyBtn.textContent = 'Copy';
          copyBtn.style.color = '';
        }, 800);
      });

      r.append(kEl, inputEl, copyBtn);
      body.appendChild(r);
    });

    card.appendChild(body);
    return card;
  };

  if (data.head) container.appendChild(buildEditableCard(data.head, HEAD_FIELDS, false));
  if (Array.isArray(data.family_members)) data.family_members.forEach((m, i) => container.appendChild(buildEditableCard(m, MEMBER_FIELDS, true, i)));

  if (data.full_form_dump) {
    renderFullWebsiteTabs(container, data.full_form_dump);
  }

  bindExtractedDataToThumbnails(data);
  syncJsonOutput();
}

const KNOWN_KEY_OPTIONS = {
  verification_type: [{ value: 1, label: '1 — NID (জাতীয় পরিচয়পত্র)' }, { value: 2, label: '2 — BRN (জন্ম নিবন্ধন)' }],
  gender: [{ value: 1, label: '1 — Male (পুরুষ)' }, { value: 2, label: '2 — Female (মহিলা)' }, { value: 3, label: '3 — Other (অন্যান্য)' }],
  gender_id: [{ value: 1, label: '1 — Male (পুরুষ)' }, { value: 2, label: '2 — Female (মহিলা)' }, { value: 3, label: '3 — Other (অন্যান্য)' }],
  relationship_id: RELATION_OPTIONS.filter(r => r.id !== null).map(r => ({ value: r.id, label: `${r.id} — ${r.label}` })),
  relation_id: RELATION_OPTIONS.filter(r => r.id !== null).map(r => ({ value: r.id, label: `${r.id} — ${r.label}` })),
  is_member_disabled: [{ value: 0, label: '0 — No (না)' }, { value: 1, label: '1 — Yes (হ্যাঁ)' }],
  is_disabled: [{ value: 0, label: '0 — No (না)' }, { value: 1, label: '1 — Yes (হ্যাঁ)' }],
  is_gov_job_holder: [{ value: 0, label: '0 — No (না)' }, { value: 1, label: '1 — Yes (হ্যাঁ)' }],
  is_ethnic: [{ value: 0, label: '0 — না (No)' }, { value: 1, label: '1 — হ্যাঁ (Yes)' }],
  location_type: AREA_TYPE_OPTIONS
};

function prettifyKey(key) {
  return String(key || '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function guessOptionsForKey(key, val, vueOptions = {}) {
  if (KNOWN_KEY_OPTIONS[key]) return KNOWN_KEY_OPTIONS[key];
  if (typeof val === 'boolean') return [{ value: 'true', label: 'true (হ্যাঁ)' }, { value: 'false', label: 'false (না)' }];
  if (/^(is_|has_)/i.test(key) && (val === 0 || val === 1 || val === '0' || val === '1')) {
    return [{ value: 0, label: '0 — No (না)' }, { value: 1, label: '1 — Yes (হ্যাঁ)' }];
  }
  const baseName = key.replace(/_id$/i, '');
  for (const [optKey, list] of Object.entries(vueOptions)) {
    if (optKey.toLowerCase().includes(baseName.toLowerCase())) return list;
  }
  return null;
}

function categorizeHeadKey(k) {
  const s = k.toLowerCase();
  if (/division|district|upazila|thana|union|ward|village|house|road|post|address|pourashava|city|location_type|area_type/.test(s)) return 'Tab — Address & Location (ঠিকানা)';
  if (/mobile|phone|email|contact|bank|account|branch|routing|mfs|bkash|nagad|rocket|payment/.test(s)) return 'Tab — Contact & Bank/Payment (যোগাযোগ ও ব্যাংক)';
  if (/income|occupation|profession|job|land|house_type|latrine|electricity|asset|allowance|poverty|marital|education|religion|ethnic|tribal|child/.test(s)) return 'Tab — Socio-Economic & Info (আর্থ-সামাজিক তথ্য)';
  return 'Tab — Applicant & General Info (আবেদনকারীর সব তথ্য)';
}

function buildCopyRow(labelStr, controlEl, getCopyValueFn) {
  const r = document.createElement('div');
  r.className = 'record-row';
  r.style.gridTemplateColumns = '115px 1fr auto';

  const kEl = document.createElement('span');
  kEl.className = 'row-key';
  kEl.style.wordBreak = 'break-word';
  kEl.textContent = labelStr;

  const copyBtn = document.createElement('button');
  copyBtn.type = 'button';
  copyBtn.className = 'btn btn-xs';
  copyBtn.textContent = 'Copy';
  copyBtn.style.padding = '2px 7px';
  copyBtn.style.fontSize = '10px';
  copyBtn.addEventListener('click', async () => {
    await copyTextSafe(String(getCopyValueFn() ?? ''));
    copyBtn.textContent = 'Copied';
    copyBtn.style.color = '#059669';
    setTimeout(() => {
      copyBtn.textContent = 'Copy';
      copyBtn.style.color = '';
    }, 800);
  });

  r.append(kEl, controlEl, copyBtn);
  return r;
}

function createDumpFieldControl(targetObj, key, vueOptions) {
  const val = targetObj[key];
  const opts = guessOptionsForKey(key, val, vueOptions);

  if (opts && opts.length) {
    const sel = document.createElement('select');
    sel.style.cssText = 'padding:4px 8px; font-size:12px; font-weight:600; border:1px solid #cbd5e1; background:#f8fafc; border-radius:5px; cursor:pointer; width:100%;';
    
    const currentStr = String(val ?? '');
    let matched = false;
    opts.forEach((o) => {
      const optEl = document.createElement('option');
      optEl.value = String(o.value);
      optEl.textContent = o.label;
      if (String(o.value) === currentStr) matched = true;
      sel.appendChild(optEl);
    });
    if (!matched && currentStr !== '') {
      const customOpt = document.createElement('option');
      customOpt.value = currentStr;
      customOpt.textContent = `${currentStr} (Current)`;
      sel.prepend(customOpt);
    }
    sel.value = currentStr;

    sel.addEventListener('change', (e) => {
      const rawV = e.target.value;
      if (typeof val === 'number') targetObj[key] = Number(rawV);
      else if (typeof val === 'boolean') targetObj[key] = (rawV === 'true');
      else targetObj[key] = rawV;
      syncJsonOutput();
    });

    return {
      el: sel,
      getCopyVal: () => {
        const selectedOpt = sel.options[sel.selectedIndex];
        return selectedOpt ? selectedOpt.value : targetObj[key];
      }
    };
  }

  const inp = document.createElement('input');
  inp.type = 'text';
  const isObj = val !== null && typeof val === 'object';
  inp.value = isObj ? JSON.stringify(val) : (val ?? '');
  inp.placeholder = '—';
  inp.style.cssText = 'padding:4px 8px; font-size:12px; font-weight:550; border:1px solid transparent; background:transparent; border-radius:5px; width:100%;';

  inp.addEventListener('input', () => {
    if (typeof val === 'number' && inp.value.trim() !== '' && !isNaN(Number(inp.value))) {
      targetObj[key] = Number(inp.value);
    } else if (isObj) {
      try { targetObj[key] = JSON.parse(inp.value); } catch (_) {}
    } else {
      targetObj[key] = inp.value;
    }
    syncJsonOutput();
  });

  return { el: inp, getCopyVal: () => inp.value };
}

function renderFullWebsiteTabs(container, dump) {
  const vueOptions = dump.vue_options || {};

  if (dump.head_data && typeof dump.head_data === 'object') {
    const tabGroups = {};
    Object.keys(dump.head_data).forEach((k) => {
      const v = dump.head_data[k];
      if (typeof v === 'function') return;
      const cat = categorizeHeadKey(k);
      if (!tabGroups[cat]) tabGroups[cat] = [];
      tabGroups[cat].push(k);
    });

    Object.entries(tabGroups).forEach(([tabName, keys]) => {
      const details = document.createElement('details');
      details.className = 'record-card';
      details.open = true;

      const summary = document.createElement('summary');
      summary.className = 'record-head';
      summary.style.cursor = 'pointer';
      summary.innerHTML = `<span>${tabName}</span><span class="record-tag">${keys.length} fields</span>`;
      details.appendChild(summary);

      const body = document.createElement('div');
      body.className = 'record-rows';

      keys.forEach((k) => {
        const { el, getCopyVal } = createDumpFieldControl(dump.head_data, k, vueOptions);
        body.appendChild(buildCopyRow(prettifyKey(k), el, getCopyVal));
      });

      details.appendChild(body);
      container.appendChild(details);
    });
  }

  if (Array.isArray(dump.family_members_raw) && dump.family_members_raw.length > 0) {
    dump.family_members_raw.forEach((rawM, idx) => {
      if (!rawM || typeof rawM !== 'object') return;
      const details = document.createElement('details');
      details.className = 'record-card';

      const summary = document.createElement('summary');
      summary.className = 'record-head';
      summary.style.cursor = 'pointer';
      const memTitle = rawM.name_bn || rawM.name_en || `Row #${idx + 1}`;
      summary.innerHTML = `<span>Tab — Member #${idx + 1} All Website Fields (${memTitle})</span><span class="record-tag">Full Data</span>`;
      details.appendChild(summary);

      const body = document.createElement('div');
      body.className = 'record-rows';

      Object.keys(rawM).forEach((k) => {
        if (typeof rawM[k] === 'function') return;
        const { el, getCopyVal } = createDumpFieldControl(rawM, k, vueOptions);
        body.appendChild(buildCopyRow(prettifyKey(k), el, getCopyVal));
      });

      details.appendChild(body);
      container.appendChild(details);
    });
  }

  if (Array.isArray(dump.dom_tabs) && dump.dom_tabs.length > 0) {
    dump.dom_tabs.forEach((tab) => {
      const details = document.createElement('details');
      details.className = 'record-card';

      const summary = document.createElement('summary');
      summary.className = 'record-head';
      summary.style.cursor = 'pointer';
      summary.innerHTML = `<span>Web Form — ${tab.title}</span><span class="record-tag">${tab.fields.length} controls</span>`;
      details.appendChild(summary);

      const body = document.createElement('div');
      body.className = 'record-rows';

      tab.fields.forEach((f) => {
        let ctrlEl;
        if ((f.type === 'select' || f.type === 'boolean') && Array.isArray(f.options) && f.options.length) {
          ctrlEl = document.createElement('select');
          ctrlEl.style.cssText = 'padding:4px 8px; font-size:12px; font-weight:600; border:1px solid #cbd5e1; background:#eff6ff; color:#1e40af; border-radius:5px; cursor:pointer; width:100%;';
          f.options.forEach((o) => {
            const opt = document.createElement('option');
            opt.value = String(o.value);
            opt.textContent = o.label || String(o.value);
            ctrlEl.appendChild(opt);
          });
          ctrlEl.value = String(f.value ?? '');
          ctrlEl.addEventListener('change', (e) => {
            f.value = f.type === 'boolean' ? (e.target.value === 'true') : e.target.value;
            const selOpt = ctrlEl.options[ctrlEl.selectedIndex];
            f.display_value = selOpt ? selOpt.textContent : String(f.value);
            syncJsonOutput();
          });
        } else {
          ctrlEl = document.createElement('input');
          ctrlEl.type = 'text';
          ctrlEl.value = f.value ?? '';
          ctrlEl.placeholder = '—';
          ctrlEl.style.cssText = 'padding:4px 8px; font-size:12px; font-weight:550; border:1px solid transparent; background:transparent; border-radius:5px; width:100%;';
          ctrlEl.addEventListener('input', () => {
            f.value = ctrlEl.value;
            f.display_value = ctrlEl.value;
            syncJsonOutput();
          });
        }

        body.appendChild(buildCopyRow(f.label, ctrlEl, () => f.display_value || f.value || ''));
      });

      details.appendChild(body);
      container.appendChild(details);
    });
  }
}

async function runExtraction() {
  if (!state.head.length) {
    setStatus('Please upload at least the Head/Husband ID in Step 1.', 'err');
    return;
  }

  const apiKey = $('apiKeyInput').value.trim();
  const model = $('modelSelect').value.trim() || 'gemini-2.5-flash';
  if (!apiKey) {
    $('settingsDrawer').classList.add('open');
    $('apiKeyInput').focus();
    setStatus('Enter your Gemini API key in Settings.', 'err');
    return;
  }

  saveCredentialsEverywhere(apiKey, model, areaPresets);

  $('extractBtn').style.display = 'none';
  $('stopExtractBtn').style.display = 'inline-flex';
  setStatus(`Extracting with ${model}...`, 'loading');

  extractionController = new AbortController();

  try {
    const parts = [
      { text: buildPrompt() },
      { text: '\n--- SECTION 1: HEAD (WIFE) & HUSBAND ---\n' }
    ];
    state.head.forEach((item, i) => {
      parts.push({ text: `Image Tag: S1_${i + 1} (Section 1 Image #${i + 1}):` });
      parts.push({ inlineData: { mimeType: 'image/jpeg', data: item.base64 } });
    });

    if (state.other.length) {
      parts.push({ text: '\n--- SECTION 2: OTHER FAMILY MEMBERS ---\n' });
      state.other.forEach((item, i) => {
        parts.push({ text: `Image Tag: S2_${i + 1} | Specified Relation: ${item.relation} (Section 2 Image #${i + 1}):` });
        parts.push({ inlineData: { mimeType: 'image/jpeg', data: item.base64 } });
      });
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({
        contents: [{ role: 'user', parts }],
        generationConfig: { responseMimeType: 'application/json', temperature: 0.1 }
      }),
      signal: extractionController.signal
    });

    const payload = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(payload?.error?.message || `HTTP ${res.status}`);

    const text = payload?.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('\n').trim();
    const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    const parsed = JSON.parse(cleaned);

    const normalized = normalizeOutput(parsed);
    state.lastExtracted = normalized;

    renderExtractedCards(normalized);
    $('autofillBtn').disabled = false;
    const defs = normalized.form_defaults;
    setStatus(`Ready! Total: ${defs.total_members} member(s), Children (<18): ${defs.children_under_18}. Verify red fields before Auto-Fill.`, 'ok');
  } catch (err) {
    if (err.name === 'AbortError') {
      setStatus('Extraction cancelled by user.', 'err');
    } else {
      setStatus(`Error: ${err.message}`, 'err');
    }
  } finally {
    $('extractBtn').style.display = 'inline-flex';
    $('stopExtractBtn').style.display = 'none';
    extractionController = null;
  }
}

function triggerFormAutofill() {
  if (!state.lastExtracted) return;
  // Always attach the latest saved Area Presets before sending to page
  handleAreaPresetChange();
  window.parent.postMessage({ action: 'FILL_VUE_FORM', payload: state.lastExtracted }, '*');
  setStatus('Sent auto-fill data + Saved Area settings to form!', 'ok');
}

function exportExtractedJson() {
  if (!state.lastExtracted) {
    setStatus('Nothing to export yet — Extract or Pull All first.', 'err');
    return;
  }
  handleAreaPresetChange();
  const h = state.lastExtracted.head || {};
  const idPart = h.nid || (h.name_en ? h.name_en.replace(/[^A-Z0-9]+/gi, '_') : 'draft');
  const filename = `FC_${idPart}_${new Date().toISOString().slice(0, 10)}.json`;
  const jsonString = JSON.stringify(state.lastExtracted, null, 2);

  window.parent.postMessage({ action: 'FC_DOWNLOAD_JSON', filename, jsonString }, '*');
  setStatus(`Exported ${filename}!`, 'ok');
}

function importExtractedJson(e) {
  const file = e.target.files && e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onerror = () => setStatus('Could not read JSON file.', 'err');
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      let normalized;

      if (parsed.head || parsed.family_members || parsed.full_form_dump) {
        normalized = normalizeOutput(parsed, true);
      } else if (parsed.verification_number || parsed.name_bn || parsed.name_en) {
        normalized = normalizeOutput({
          head: {
            nid: parsed.verification_number || parsed.nid || '',
            dob: parsed.date_of_birth || parsed.dob || '',
            name_bn: parsed.name_bn || '',
            name_en: parsed.name_en || '',
            father_name_bn: parsed.father_name_bn || '',
            father_name_en: parsed.father_name_en || '',
            mother_name_bn: parsed.mother_name_bn || '',
            mother_name_en: parsed.mother_name_en || ''
          },
          family_members: [],
          full_form_dump: { head_data: parsed, family_members_raw: [] }
        }, true);
      } else {
        throw new Error('Unrecognized JSON structure.');
      }

      state.lastExtracted = normalized;
      renderExtractedCards(normalized);
      $('autofillBtn').disabled = false;
      const dumpNotice = normalized.full_form_dump ? ' (includes Full Website Tabs)' : '';
      setStatus(`Imported ${file.name}${dumpNotice}! Click 2. Auto-Fill Form to apply.`, 'ok');
    } catch (err) {
      setStatus(`Import error: ${err.message}`, 'err');
    }
  };
  reader.readAsText(file);
  e.target.value = '';
}

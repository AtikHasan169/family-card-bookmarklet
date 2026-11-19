'use strict';

const STORAGE_KEY = 'fc_pro_api_key';
const STORAGE_MODEL = 'fc_pro_model';
const STORAGE_AREA_PRESETS = 'fc_pro_area_presets';
const STORAGE_PROVIDER = 'fc_pro_api_provider';
const STORAGE_CUSTOM_URL = 'fc_pro_custom_url';
const STORAGE_CUSTOM_BEARER = 'fc_pro_custom_bearer';
const STORAGE_CUSTOM_THINKING = 'fc_pro_custom_thinking';
const CURRENT_VERSION_TAG = 'v4.7-live';

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

const RELIGION_OPTIONS = [
  { value: 'Islam', label: 'ইসলাম (Islam)', id: 1 },
  { value: 'Hinduism', label: 'হিন্দু (Hinduism)', id: 2 },
  { value: 'Buddhism', label: 'বৌদ্ধ (Buddhism)', id: 3 },
  { value: 'Christianity', label: 'খ্রিস্টান (Christianity)', id: 4 },
  { value: 'Other', label: 'অন্যান্য (Other)', id: 5 }
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
const RELIGION_ID_MAP = { Islam: 1, Hinduism: 2, Buddhism: 3, Christianity: 4, Other: 5 };
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const HEAD_FIELDS = [
  { key: 'gender', label: 'Gender', type: 'gender_select' },
  { key: 'religion', label: 'Religion (ধর্ম)', type: 'religion_select' },
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
  { key: 'religion', label: 'Religion (ধর্ম)', type: 'religion_select' },
  { key: 'name_bn', label: 'Name (BN)' },
  { key: 'name_en', label: 'Name (EN)' },
  { key: 'father_name_bn', label: 'Father (BN)' },
  { key: 'mother_name_bn', label: 'Mother (BN)' },
  { key: 'doc_type', label: 'Doc Type', type: 'doc_select' },
  { key: 'nid_or_brn', label: 'NID / BRN No' },
  { key: 'dob', label: 'DOB (DD-MM-YYYY)' }
];

const state = { head: [], other: [], pulledImages: [], lastExtracted: null };
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
let zoomLevel = 1;
let rotationAngle = 0;
let panX = 0;
let panY = 0;
let isDragging = false;
let startX = 0;
let startY = 0;
let activeCropItem = null;
let cropQueue = [];
let cropQueueTotal = 0;
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
  areaPresets.post_code = toEnglishDigits($('presetPostCodeInput')?.value || '').replace(/\D+/g, '').trim();
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
    recalculateHouseholdSummary(state.lastExtracted);
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

function applyModelToUI(modelName) {
  const sel = $('modelSelect');
  const customInp = $('customModelInput');
  if (!sel) return;
  const cleanModel = (modelName || 'gemini-2.5-flash').trim();
  const isPreset = Array.from(sel.options).some((o) => o.value !== 'custom' && o.value === cleanModel);

  if (isPreset) {
    sel.value = cleanModel;
    if (customInp) customInp.style.display = 'none';
  } else {
    sel.value = 'custom';
    if (customInp) {
      customInp.style.display = 'block';
      customInp.value = cleanModel;
    }
  }
}

function getActiveModel() {
  const sel = $('modelSelect');
  const customInp = $('customModelInput');
  const prov = $('apiProviderSelect') ? $('apiProviderSelect').value : (localStorage.getItem(STORAGE_PROVIDER) || 'google');
  let chosen = (sel && sel.value === 'custom')
    ? ((customInp ? customInp.value.trim() : '') || 'gemini-2.5-flash')
    : ((sel ? sel.value.trim() : '') || 'gemini-2.5-flash');

  return chosen;
}

function initApp() {
  let savedKey = '';
  let savedModel = 'gemini-2.5-flash';
  try {
    savedKey = localStorage.getItem(STORAGE_KEY) || '';
    savedModel = localStorage.getItem(STORAGE_MODEL) || 'gemini-2.5-flash';

    if ($('apiProviderSelect')) $('apiProviderSelect').value = localStorage.getItem(STORAGE_PROVIDER) || 'google';
    if ($('customBaseUrl')) $('customBaseUrl').value = localStorage.getItem(STORAGE_CUSTOM_URL) || 'https://geminiwebapi-teal.vercel.app';
    if ($('customBearerToken')) $('customBearerToken').value = localStorage.getItem(STORAGE_CUSTOM_BEARER) || '';
    if ($('customThinkingMode')) $('customThinkingMode').value = localStorage.getItem(STORAGE_CUSTOM_THINKING) || 'off';
  } catch (err) {}

  $('apiKeyInput').value = savedKey;
  applyModelToUI(savedModel);

  async function fetchCustomApiModels() {
    const prov = $('apiProviderSelect').value;
    if (prov !== 'custom' && prov !== 'custom_fast') return;
    const baseUrl = $('customBaseUrl').value.replace(/\/$/, '');
    const bearer = $('customBearerToken').value.trim();
    if (!baseUrl) return;

    const btn = $('refreshModelsBtn');
    if (btn) btn.textContent = '...';

    try {
      const res = await fetch(`${baseUrl}/api/models`, {
        headers: bearer ? { 'Authorization': `Bearer ${bearer}` } : {}
      });
      if (!res.ok) throw new Error(res.status);
      const data = await res.json();
      const sel = $('modelSelect');

      Array.from(sel.options).forEach(o => {
        if (!['gemini-3.5-flash', 'gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-3.8-flash', 'custom'].includes(o.value)) o.remove();
      });

      const modelList = Array.isArray(data.models) ? data.models : (Array.isArray(data.data) ? data.data : []);
      modelList.forEach(m => {
        if (!Array.from(sel.options).some(o => o.value === m.id)) {
          const opt = document.createElement('option');
          opt.value = m.id;
          opt.textContent = m.displayName ? `${m.displayName} — ${m.description || m.id}` : m.id;
          sel.insertBefore(opt, sel.lastElementChild);
        }
      });

      const sModel = localStorage.getItem(STORAGE_MODEL);
      if (sModel && Array.from(sel.options).some(o => o.value === sModel)) {
        sel.value = sModel;
        if ($('customModelInput')) $('customModelInput').style.display = 'none';
      } else if (data.defaultModel && Array.from(sel.options).some(o => o.value === data.defaultModel)) {
        sel.value = data.defaultModel;
        if ($('customModelInput')) $('customModelInput').style.display = 'none';
      }
      if (btn) { btn.textContent = '✓'; setTimeout(() => btn.textContent = 'Refresh', 1200); }
    } catch (e) {
      if (btn) { btn.textContent = 'Error'; setTimeout(() => btn.textContent = 'Refresh', 1500); }
    }
  }

  const toggleProviderUI = () => {
    const prov = $('apiProviderSelect').value;
    const isCustomAny = prov === 'custom' || prov === 'custom_fast';

    $('googleSettingsGroup').style.display = isCustomAny ? 'none' : 'block';
    $('customSettingsGroup').style.display = isCustomAny ? 'block' : 'none';
    $('refreshModelsBtn').style.display = isCustomAny ? 'block' : 'none';

    const thinkingSelect = $('customThinkingMode');
    if (thinkingSelect) {
      thinkingSelect.style.display = isCustomAny ? 'block' : 'none';
      if (thinkingSelect.previousElementSibling) {
        thinkingSelect.previousElementSibling.style.display = isCustomAny ? 'block' : 'none';
      }
    }

    if (isCustomAny) fetchCustomApiModels();
  };

  if ($('apiProviderSelect')) {
    toggleProviderUI();
    $('apiProviderSelect').addEventListener('change', (e) => {
      localStorage.setItem(STORAGE_PROVIDER, e.target.value);
      toggleProviderUI();
    });
  }

  if ($('customBaseUrl')) $('customBaseUrl').addEventListener('input', e => {
    localStorage.setItem(STORAGE_CUSTOM_URL, e.target.value.trim());
    fetchCustomApiModels();
  });
  if ($('customBearerToken')) $('customBearerToken').addEventListener('input', e => {
    localStorage.setItem(STORAGE_CUSTOM_BEARER, e.target.value.trim());
    fetchCustomApiModels();
  });
  if ($('customThinkingMode')) $('customThinkingMode').addEventListener('change', e => localStorage.setItem(STORAGE_CUSTOM_THINKING, e.target.value));

  if ($('refreshModelsBtn')) {
    $('refreshModelsBtn').addEventListener('click', fetchCustomApiModels);
  }

  if (!savedKey && $('apiProviderSelect').value === 'google') $('settingsDrawer').classList.add('open');

  loadAreaPresetsFromLocal();

  $('apiKeyInput').addEventListener('input', (e) => saveCredentialsEverywhere(e.target.value.trim(), undefined, undefined));
  $('modelSelect').addEventListener('change', (e) => {
    const val = e.target.value;
    const customInp = $('customModelInput');
    if (val === 'custom') {
      if (customInp) {
        customInp.style.display = 'block';
        customInp.focus();
        const customVal = customInp.value.trim();
        if (customVal) saveCredentialsEverywhere(undefined, customVal, undefined);
      }
    } else {
      if (customInp) customInp.style.display = 'none';
      saveCredentialsEverywhere(undefined, val, undefined);
    }
  });

  if ($('customModelInput')) {
    $('customModelInput').addEventListener('input', (e) => {
      const customVal = e.target.value.trim() || 'gemini-2.5-flash';
      saveCredentialsEverywhere(undefined, customVal, undefined);
    });
  }

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
    closeBtn.type = 'button';
    closeBtn.className = 'icon-btn';
    closeBtn.title = 'Close panel';
    closeBtn.setAttribute('aria-label', 'Close panel');
    closeBtn.innerHTML = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
    closeBtn.addEventListener('click', () => { stopPanelCamera(); window.parent.postMessage({ action: 'FC_CLOSE_SHEET' }, '*'); });
    navRight.append(closeBtn);
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

  $('capturePhotoBtn').addEventListener('click', capturePanelPhoto);
  $('cancelCameraBtn').addEventListener('click', stopPanelCamera);
  $('switchCameraBtn').addEventListener('click', switchPanelCamera);

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
      if (Array.isArray(s.pulledImages) && !state.pulledImages.length) state.pulledImages = s.pulledImages;
      if (s.nextId) nextId = s.nextId;
      renderPreviews('head');
      renderPreviews('other');
      renderPulledImages();
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
      applyModelToUI(e.data.model);
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
      if (state.lastExtracted) syncJsonOutput();
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
      // Photos ride separately from the text data: keep base64 out of
      // lastExtracted (and the Raw JSON view) — they live in state.
      const pulled = Array.isArray(res.payload.images)
        ? res.payload.images.filter((im) => im && typeof im.dataUrl === 'string' && im.dataUrl.startsWith('data:image'))
        : [];
      const payloadForNorm = { ...res.payload };
      delete payloadForNorm.images;
      delete payloadForNorm.imagesMissing;
      state.lastExtracted = normalizeOutput(payloadForNorm, true);
      renderExtractedCards(state.lastExtracted);
      $('autofillBtn').disabled = false;
      state.pulledImages = pulled;
      renderPulledImages();
      saveSessionState();
      const missing = Array.isArray(res.payload.imagesMissing) ? res.payload.imagesMissing : [];
      const imgNote = pulled.length
        ? ` + ${pulled.length} draft photo(s)`
        : (missing.length ? ` (photos not found: ${missing.join(', ')})` : '');
      setStatus(`Pulled Head + ${state.lastExtracted.family_members.length} member(s) & all website tabs${imgNote}!`, 'ok');
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

// Pure code Gender detection (no neutral surnames like mondol/sarkar/das/roy)
function inferGender(relation, explicitGender, nameEn, nameBn) {
  if (relation && relation !== 'Auto' && RELATION_GENDER_MAP[relation]) {
    return RELATION_GENDER_MAP[relation];
  }
  const combined = `${nameEn || ''} ${nameBn || ''}`;
  // 1. Female name markers (মোছাঃ, মোসাঃ, খাতুন, বেগম, আক্তার, রানি, দেবী, etc.)
  if (/\b(?:mst|mosammat|mosa|mosha|begum|khatun|akter|akhter|bibi|parvin|pervin|sultana|jahan|nahar|yasmin|sharmin|nasrin|fatema|ayesha|khadija|rani|bala|devi|kumari)\b|মোছা|মোসা|বেগম|খাতুন|আক্তার|বিবি|পারভীন|সুলতানা|জাহান|নাহার|ইয়াসমিন|শারমিন|নাসরিন|ফাতেমা|আয়েশা|খাদিজা|রানী|রাণী|বালা|দেবী|কুমারী/i.test(combined)) {
    return 'Female';
  }
  // 2. Male-only name markers (মোঃ, হোসেন, রহমান, উদ্দিন, আলী, মিয়া, চন্দ্র, কুমার, etc.)
  if (/\b(?:md|mohd|mohammad|muhammad|hossain|husain|hossen|rahman|uddin|ahammad|ali|mia|miah|hasan|hassan|abdul|abul|chandra|kumar)\b|মোঃ|মো:|মুহাম্মদ|মোহাম্মদ|হোসেন|হুসাইন|রহমান|উদ্দিন|আহম্মদ|আলী|মিয়া|মিয়া|হাসান|আব্দুল|আবুল|চন্দ্র|কুমার/i.test(combined)) {
    return 'Male';
  }
  // 3. Explicit gender fallback from card
  const g = String(explicitGender || '').trim().toLowerCase();
  if (g === 'female' || g === '2' || g === 'f' || g === 'মহিলা' || g === 'নারী') return 'Female';
  if (g === 'male' || g === '1' || g === 'm' || g === 'পুরুষ') return 'Male';
  return 'Male';
}

// Pure code Religion detection (ignores shared titles like মন্ডল/সরকার/বিশ্বাস)
function inferHouseholdReligion(peopleList) {
  const allNames = peopleList.map(p =>
    `${p?.name_bn || ''} ${p?.name_en || ''} ${p?.father_name_bn || ''} ${p?.father_name_en || ''} ${p?.mother_name_bn || ''} ${p?.mother_name_en || ''}`
  ).join(' ');

  const muslimRegex = /\b(?:md|mohd|mohammad|muhammad|mst|mosammat|mosa|mosha|khatun|begum|hossain|husain|hossen|islam|rahman|rahim|karim|uddin|ahmed|ahammad|ali|mia|miah|akter|akhter|sheikh|kazi|khandaker|sultana|parvin|bibi|hasan|hassan|abdul|abul|molla|mollah|fatema|ayesha|khadija|jahan|nahar)\b|মোঃ|মো:|মোছাঃ|মোসাঃ|মোছা|মোসা|খাতুন|হোসেন|হুসাইন|ইসলাম|বেগম|আক্তার|রহমান|রহিম|করিম|উদ্দিন|আহমেদ|আহম্মদ|আলী|মিয়া|মিয়া|শেখ|কাজী|খন্দকার|সুলতানা|পারভীন|বিবি|হাসান|আব্দুল|আবুল|মোল্লা|মুহাম্মদ|মোহাম্মদ|ফাতেমা|আয়েশা|খাদিজা|জাহান|নাহার/i;

  if (muslimRegex.test(allNames)) return 'Islam';

  const hinduRegex = /\b(?:chandra|kumar|rani|bala|devi|chakraborty|bhattacharya|chatterjee|mukherjee|banerjee|barman|ghosh|bose)\b|চন্দ্র|কুমার|রানী|রাণী|বালা|দেবী|চক্রবর্তী|ভট্টাচার্য|চ্যাটার্জী|মুখার্জী|ব্যানার্জী|বর্মন|ঘোষ|বসু/i;

  if (hinduRegex.test(allNames)) return 'Hinduism';

  return 'Islam';
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
      pulledImages: state.pulledImages,
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
    data.head.gender_id = GENDER_ID_MAP[data.head.gender] || 2;
    allPeople.push(data.head);
  }
  if (Array.isArray(data.family_members)) {
    data.family_members.forEach((m) => {
      m.age = calculateAgeYears(m.dob);
      m.is_child_under_18 = m.age !== null && m.age < 18;
      m.gender_id = GENDER_ID_MAP[m.gender] || 1;
      allPeople.push(m);
    });
  }

  // Propagate detected family religion (e.g., Islam) to every family member if not manually overridden
  const detectedReligion = inferHouseholdReligion(allPeople);
  const detectedReligionId = RELIGION_ID_MAP[detectedReligion] || 1;
  allPeople.forEach(p => {
    if (!p.religion || !RELIGION_ID_MAP[p.religion]) {
      p.religion = detectedReligion;
    }
    p.religion_id = RELIGION_ID_MAP[p.religion] || detectedReligionId;
  });

  const totalMembers = allPeople.length || 1;
  const maleCount = allPeople.filter(p => (p.gender || '').toLowerCase() === 'male' || Number(p.gender_id) === 1).length;
  const femaleCount = allPeople.filter(p => (p.gender || '').toLowerCase() === 'female' || Number(p.gender_id) === 2).length;
  const otherGenderCount = allPeople.filter(p => (p.gender || '').toLowerCase() === 'other' || Number(p.gender_id) === 3).length;
  const childrenUnder18 = allPeople.filter((p) => {
    const a = calculateAgeYears(p.dob);
    return a !== null && a >= 0 && a < 18;
  }).length;

  const finalReligion = data.head?.religion || detectedReligion || 'Islam';
  const finalReligionId = RELIGION_ID_MAP[finalReligion] || 1;

  data.form_defaults = {
    total_members: totalMembers,
    male_count: maleCount,
    female_count: femaleCount,
    other_gender_count: 0,
    bidesh_count: 0,
    children_under_18: childrenUnder18,
    religion: finalReligion,
    religion_id: finalReligionId,
    religion_label: RELIGION_OPTIONS.find(r => r.value === finalReligion)?.label || 'ইসলাম (Islam)',
    village: areaPresets.village || '',
    ward_no: areaPresets.ward_no || '',
    post_code: areaPresets.post_code || '',
    is_ethnic: Number(areaPresets.is_ethnic ?? 0),
    khudro_nrigosthi_label: Number(areaPresets.is_ethnic) === 1 ? 'হ্যাঁ (Yes)' : 'না (No)',
    area_type_id: Number(areaPresets.area_type_id ?? 1),
    area_type_label: AREA_TYPE_OPTIONS.find(a => a.value === Number(areaPresets.area_type_id || 1))?.label || 'পল্লী / ইউনিয়ন (Polli / Union)'
  };

  if ($('fcSummaryTotalMembers')) $('fcSummaryTotalMembers').value = String(data.form_defaults.total_members);
  if ($('fcSummaryMaleCount')) $('fcSummaryMaleCount').value = String(data.form_defaults.male_count);
  if ($('fcSummaryFemaleCount')) $('fcSummaryFemaleCount').value = String(data.form_defaults.female_count);
  if ($('fcSummaryChildrenCount')) $('fcSummaryChildrenCount').value = String(data.form_defaults.children_under_18);
  if ($('fcSummaryReligion')) $('fcSummaryReligion').value = data.form_defaults.religion;

  if ($('fcPillTotalMembers')) $('fcPillTotalMembers').textContent = `${data.form_defaults.total_members} জন`;
  if ($('fcPillMaleCount')) $('fcPillMaleCount').textContent = `${data.form_defaults.male_count} জন`;
  if ($('fcPillFemaleCount')) $('fcPillFemaleCount').textContent = `${data.form_defaults.female_count} জন`;
  if ($('fcPillChildrenCount')) $('fcPillChildrenCount').textContent = `${data.form_defaults.children_under_18} জন`;
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
    inputEl.style.cssText = 'padding:4px 8px; font-size:12px; font-weight:600; border:1px solid var(--border); background:var(--surface-muted); color:var(--text-main); border-radius:5px; cursor:pointer; width:100%;';
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
    inputEl.style.cssText = 'padding:4px 8px; font-size:12px; font-weight:600; border:1px solid var(--border); background:var(--surface-muted); color:var(--text-main); border-radius:5px; cursor:pointer; width:100%;';
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
  } else if (f.type === 'religion_select') {
    inputEl = document.createElement('select');
    inputEl.setAttribute('data-field', 'religion');
    inputEl.style.cssText = 'padding:4px 8px; font-size:12px; font-weight:600; border:1px solid #bbf7d0; background:var(--emerald-soft); color:var(--emerald); border-radius:5px; cursor:pointer; width:100%;';
    RELIGION_OPTIONS.forEach((opt) => {
      const o = document.createElement('option');
      o.value = opt.value;
      o.textContent = opt.label;
      inputEl.appendChild(o);
    });
    inputEl.value = targetObj.religion || 'Islam';
    inputEl.addEventListener('change', (e) => {
      targetObj.religion = e.target.value;
      targetObj.religion_id = RELIGION_ID_MAP[e.target.value] || 1;
      toggleWarning(inputEl);
      if (onUpdateMeta) onUpdateMeta();
      syncJsonOutput();
    });
  } else if (f.type === 'doc_select') {
    inputEl = document.createElement('select');
    inputEl.style.cssText = 'padding:4px 8px; font-size:12px; font-weight:700; border:1px solid #cbd5e1; background:var(--accent-soft); color:var(--accent); border-radius:5px; cursor:pointer; width:100%;';
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

  if (state.lastExtracted) {
    $('fcViewerTitle').textContent = 'Card Preview';
    metaBox.innerHTML = '<div style="color:#a1a1aa; text-align:center; padding:10px;">No person linked to this photo.<br>It was not matched to anyone in the extracted data.</div>';
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

// Draft photos pulled from the website (applicant photo, signature, house
// photo...). They are display-only: they never enter the NID/BRN upload
// lists, so the AI never tries to read an ID card from a house photo.
function renderPulledImages() {
  const card = $('pulledCard');
  const grid = $('pulledPreviews');
  const badge = $('pulledCount');
  if (!card || !grid) return;
  const list = state.pulledImages || [];
  card.style.display = list.length ? '' : 'none';
  if (badge) badge.textContent = `${list.length} photo(s)`;
  grid.replaceChildren();
  list.forEach((item) => {
    const wrap = document.createElement('div');
    wrap.className = 'thumb-item';
    const img = document.createElement('img');
    img.src = item.dataUrl;
    img.title = item.name || 'Draft photo';
    wrap.appendChild(img);
    const bar = document.createElement('div');
    bar.className = 'thumb-bar';
    const label = document.createElement('span');
    label.className = 'thumb-label';
    label.textContent = item.name || 'Photo';
    bar.appendChild(label);
    wrap.appendChild(bar);
    grid.appendChild(wrap);
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
        const canvas = $('cropCanvas');
        canvas.width = 900;
        canvas.height = 600;
        zoomLevel = 1;
        rotationAngle = 0;
        panX = 0;
        panY = 0;
        $('zoomRange').value = 1;
        drawCropCanvas();
        autoScanCrop(false);
      };
      rawImage.onerror = () => {
        $('cropModal').classList.remove('open');
        setStatus('Could not load this photo for cropping.', 'err');
      };
      activeCategory = category;
      activeCropItem = null;
      activeCropName = file.name;
      // Show the crop screen immediately; the photo draws as soon as it decodes.
      $('cropModal').classList.add('open');
      rawImage.src = evt.target.result;
    };
    reader.readAsDataURL(file);
  } else {
    const beforeCount = state[category].length;
    for (const file of files) {
      if (!file.type.startsWith('image/')) continue;
      try {
        const b64 = await fileToBase64(file);
        addImage(category, b64, file.name);
      } catch (err) {
        setStatus(err.message, 'err');
      }
    }
    const added = state[category].slice(beforeCount);
    setStatus(`${files.length} images added.`, 'ok');
    // Many photos at once: crop them one by one, auto-opening each in turn.
    if (added.length >= 2) queueCrops(added);
  }
  if (e && e.target) e.target.value = '';
}

// In-panel camera: capture directly in the panel — the phone's camera app
// never opens. The panel iframe already allows the camera (bookmarklet sets
// allow="camera"), so the browser asks once and then it just works. If the
// camera is denied, blocked, or missing, it falls back to the old file
// input, which opens the phone's camera app as before.
let panelCameraStream = null;
let panelCameraFacing = 'environment';
let panelCameraCategory = 'head';

function stopPanelCameraTracks() {
  if (panelCameraStream) {
    panelCameraStream.getTracks().forEach((t) => t.stop());
    panelCameraStream = null;
  }
  const video = $('cameraVideo');
  if (video) video.srcObject = null;
}

function stopPanelCamera() {
  stopPanelCameraTracks();
  const modal = $('cameraModal');
  if (modal) modal.classList.remove('open');
}

async function startPanelCamera() {
  const video = $('cameraVideo');
  panelCameraStream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: panelCameraFacing },
    audio: false,
  });
  video.srcObject = panelCameraStream;
  $('cameraModal').classList.add('open');
  await video.play();
}

async function openPanelCamera(category) {
  panelCameraCategory = category;
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    openCameraFileInput(category); // very old browser — use the camera app
    return;
  }
  try {
    await startPanelCamera();
  } catch (_) {
    stopPanelCamera();
    setStatus('Camera is blocked here — opening the phone camera instead.', 'err');
    openCameraFileInput(category);
  }
}

function openCameraFileInput(category) {
  const input = $('cameraInput');
  input.value = '';
  input.onchange = (e) => handleUpload(e, category);
  input.click();
}

function openCamera(category) {
  openPanelCamera(category);
}

function capturePanelPhoto() {
  const video = $('cameraVideo');
  if (!video || !video.videoWidth) {
    setStatus('Camera is not ready yet — wait a second and try again.', 'err');
    return;
  }
  const maxDim = 1500;
  const scale = Math.min(1, maxDim / Math.max(video.videoWidth, video.videoHeight));
  const cv = document.createElement('canvas');
  cv.width = Math.max(1, Math.round(video.videoWidth * scale));
  cv.height = Math.max(1, Math.round(video.videoHeight * scale));
  cv.getContext('2d').drawImage(video, 0, 0, cv.width, cv.height);
  const dataUrl = cv.toDataURL('image/jpeg', 0.82);
  const b64 = dataUrl.split(',')[1] || '';
  if (!b64) {
    setStatus('Could not capture this photo — try again.', 'err');
    return;
  }
  stopPanelCamera();
  addImage(panelCameraCategory, b64, 'Camera.jpg');
  const item = state[panelCameraCategory][state[panelCameraCategory].length - 1];
  if (item) openCropForImage(item); // straight into crop/scan, like a single upload
}

async function switchPanelCamera() {
  panelCameraFacing = panelCameraFacing === 'environment' ? 'user' : 'environment';
  stopPanelCameraTracks();
  try {
    await startPanelCamera();
  } catch (_) {
    stopPanelCamera();
    setStatus('Could not switch camera.', 'err');
  }
}

// Auto-crop queue: after a multi-photo upload, the crop editor opens for
// each new photo one by one. Apply Crop saves and advances; Retake skips.
function queueCrops(items) {
  cropQueue.push(...items);
  cropQueueTotal += items.length;
  // Fresh queue (nothing was waiting): open the first crop now.
  // If a queue is already running, the new photos join the end of it.
  if (cropQueue.length === items.length) openNextQueuedCrop();
}

function openNextQueuedCrop() {
  const titleEl = $('cropModalTitle');
  const item = cropQueue.shift();
  if (!item) {
    cropQueueTotal = 0;
    if (titleEl) titleEl.textContent = 'Crop, Scan, Rotate & Zoom Image';
    return;
  }
  openCropForImage(item);
  if (titleEl) titleEl.textContent = `Crop ${cropQueueTotal - cropQueue.length} of ${cropQueueTotal} — ${item.name}`;
}

function openCropForImage(item) {
  activeCropItem = item;
  activeCategory = null;
  const titleEl = $('cropModalTitle');
  if (titleEl) titleEl.textContent = 'Crop, Scan, Rotate & Zoom Image';

  // Show the crop screen immediately; the photo draws as soon as it decodes.
  $('fcViewerModal').style.display = 'none';
  $('cropModal').classList.add('open');

  rawImage = new Image();
  rawImage.onload = () => {
    const canvas = $('cropCanvas');
    canvas.width = 900;
    canvas.height = 600;
    zoomLevel = 1;
    rotationAngle = 0;
    panX = 0;
    panY = 0;
    $('zoomRange').value = 1;
    drawCropCanvas();
    autoScanCrop(false);
  };
  rawImage.onerror = () => {
    $('cropModal').classList.remove('open');
    setStatus('Could not load this photo for cropping.', 'err');
  };
  rawImage.src = `data:image/jpeg;base64,${item.base64}`;
}

// --- Document scanner: pure functions (no DOM) — tested by tests/sidepanel_scan_test.js ---
// CamScanner-style: find the document's four corners in a photo and return
// them ordered [top-left, top-right, bottom-right, bottom-left], or null.
function scanQuadArea(quad) {
  let a = 0;
  for (let i = 0; i < 4; i++) {
    const p = quad[i], q = quad[(i + 1) % 4];
    a += p.x * q.y - q.x * p.y;
  }
  return Math.abs(a) / 2;
}

function scanConvexHull(points) {
  // Andrew's monotone chain. points: [{x, y}]. Returns hull, CCW order.
  const pts = points.slice().sort((a, b) => (a.x - b.x) || (a.y - b.y));
  const cross = (o, a, b) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  const lower = [];
  for (const p of pts) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
    lower.push(p);
  }
  const upper = [];
  for (let i = pts.length - 1; i >= 0; i--) {
    const p = pts[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
    upper.push(p);
  }
  lower.pop(); upper.pop();
  return lower.concat(upper);
}

function scanOrderCorners(pts) {
  // Order 4 points as [top-left, top-right, bottom-right, bottom-left].
  // In screen coords (y down), ascending atan2 runs clockwise.
  const cx = pts.reduce((s, p) => s + p.x, 0) / pts.length;
  const cy = pts.reduce((s, p) => s + p.y, 0) / pts.length;
  const sorted = pts.slice().sort((a, b) => Math.atan2(a.y - cy, a.x - cx) - Math.atan2(b.y - cy, b.x - cx));
  let tlIdx = 0;
  sorted.forEach((p, i) => { if (p.y + p.x < sorted[tlIdx].y + sorted[tlIdx].x) tlIdx = i; });
  const ordered = [];
  for (let i = 0; i < 4; i++) ordered.push(sorted[(tlIdx + i) % 4]);
  return ordered;
}

function scanQuadFromHull(hull) {
  if (!hull || hull.length < 4) return null;
  if (hull.length === 4) return scanOrderCorners(hull);
  // A rectangle's corners are the extreme points in the 4 diagonal
  // directions from its centre (y down: +x+y = bottom-right, etc.).
  const cx = hull.reduce((s, p) => s + p.x, 0) / hull.length;
  const cy = hull.reduce((s, p) => s + p.y, 0) / hull.length;
  const dirs = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
  const corners = dirs.map(([dx, dy]) => {
    let best = hull[0], bestD = -Infinity;
    for (const p of hull) {
      const d = (p.x - cx) * dx + (p.y - cy) * dy;
      if (d > bestD) { bestD = d; best = p; }
    }
    return best;
  });
  return scanOrderCorners(corners);
}

function scanValidateQuad(quad, w, h) {
  if (!quad || quad.length !== 4) return false;
  // Distinct corners (at least 8px apart).
  for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) {
    const dx = quad[i].x - quad[j].x, dy = quad[i].y - quad[j].y;
    if (dx * dx + dy * dy < 64) return false;
  }
  const area = scanQuadArea(quad);
  const imgArea = w * h;
  if (area < imgArea * 0.12 || area > imgArea * 0.98) return false;
  // Convex: all turns the same way.
  let sign = 0;
  for (let i = 0; i < 4; i++) {
    const a = quad[i], b = quad[(i + 1) % 4], c = quad[(i + 2) % 4];
    const cr = (b.x - a.x) * (c.y - b.y) - (b.y - a.y) * (c.x - b.x);
    if (cr === 0) continue;
    if (sign === 0) sign = Math.sign(cr);
    else if (Math.sign(cr) !== sign) return false;
  }
  if (sign === 0) return false;
  // Each edge at least 8% of the smaller image side.
  const minEdge = Math.min(w, h) * 0.08;
  for (let i = 0; i < 4; i++) {
    const a = quad[i], b = quad[(i + 1) % 4];
    if (Math.hypot(b.x - a.x, b.y - a.y) < minEdge) return false;
  }
  return true;
}

function scanBlur(gray, w, h, passes) {
  let src = Float32Array.from(gray);
  let dst = new Float32Array(w * h);
  for (let p = 0; p < passes; p++) {
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let s = 0, c = 0;
        for (let dy = -1; dy <= 1; dy++) {
          const yy = y + dy; if (yy < 0 || yy >= h) continue;
          for (let dx = -1; dx <= 1; dx++) {
            const xx = x + dx; if (xx < 0 || xx >= w) continue;
            s += src[yy * w + xx]; c++;
          }
        }
        dst[y * w + x] = s / c;
      }
    }
    const tmp = src; src = dst; dst = tmp;
  }
  return src;
}

function scanSobel(blur, w, h) {
  const n = w * h;
  const mag = new Float32Array(n);
  let maxMag = 0;
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      const gx = -blur[i - w - 1] - 2 * blur[i - 1] - blur[i + w - 1]
        + blur[i - w + 1] + 2 * blur[i + 1] + blur[i + w + 1];
      const gy = -blur[i - w - 1] - 2 * blur[i - w] - blur[i - w + 1]
        + blur[i + w - 1] + 2 * blur[i + w] + blur[i + w + 1];
      const m = Math.sqrt(gx * gx + gy * gy);
      mag[i] = m;
      if (m > maxMag) maxMag = m;
    }
  }
  return { mag, maxMag };
}

function scanThreshold(mag, thr) {
  const edge = new Uint8Array(mag.length);
  for (let i = 0; i < mag.length; i++) if (mag[i] >= thr) edge[i] = 1;
  return edge;
}

function scanDilate(edge, w, h) {
  // 3x3 dilation: closes 1-2px gaps in a broken outline.
  const out = new Uint8Array(edge.length);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let v = 0;
      for (let dy = -1; dy <= 1 && !v; dy++) {
        const yy = y + dy; if (yy < 0 || yy >= h) continue;
        for (let dx = -1; dx <= 1; dx++) {
          const xx = x + dx; if (xx < 0 || xx >= w) continue;
          if (edge[yy * w + xx]) { v = 1; break; }
        }
      }
      out[y * w + x] = v;
    }
  }
  return out;
}

function scanComponents(edge, w, h, topK) {
  // Connected components (4-connectivity), largest `topK` by pixel count.
  const n = w * h;
  const label = new Int32Array(n).fill(-1);
  const comps = [];
  const stack = [];
  for (let s = 0; s < n; s++) {
    if (!edge[s] || label[s] !== -1) continue;
    const pts = [];
    stack.length = 0;
    stack.push(s);
    label[s] = s;
    while (stack.length) {
      const cur = stack.pop();
      pts.push(cur);
      const cx = cur % w, cy = (cur / w) | 0;
      if (cx > 0 && edge[cur - 1] && label[cur - 1] === -1) { label[cur - 1] = s; stack.push(cur - 1); }
      if (cx < w - 1 && edge[cur + 1] && label[cur + 1] === -1) { label[cur + 1] = s; stack.push(cur + 1); }
      if (cy > 0 && edge[cur - w] && label[cur - w] === -1) { label[cur - w] = s; stack.push(cur - w); }
      if (cy < h - 1 && edge[cur + w] && label[cur + w] === -1) { label[cur + w] = s; stack.push(cur + w); }
    }
    comps.push(pts);
  }
  comps.sort((a, b) => b.length - a.length);
  return comps.slice(0, topK);
}

function scanQuadSupport(quad, mag, thr, w, h) {
  // Fraction of the quad's perimeter that has a real edge within 2px.
  // This is the quality test that separates a document from clutter.
  let hits = 0, total = 0;
  for (let e = 0; e < 4; e++) {
    const a = quad[e], b = quad[(e + 1) % 4];
    const len = Math.hypot(b.x - a.x, b.y - a.y);
    const steps = Math.max(8, Math.round(len / 10));
    for (let s = 0; s <= steps; s++) {
      const x = Math.round(a.x + (b.x - a.x) * (s / steps));
      const y = Math.round(a.y + (b.y - a.y) * (s / steps));
      total++;
      let found = false;
      for (let dy = -2; dy <= 2 && !found; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          const xx = x + dx, yy = y + dy;
          if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue;
          if (mag[yy * w + xx] >= thr) { found = true; break; }
        }
      }
      if (found) hits++;
    }
  }
  return total ? hits / total : 0;
}

function scanHoughLines(mag, thr, w, h) {
  // Classic Hough transform: finds the long straight lines in the image,
  // so a document is found even when its outline is broken into pieces.
  const pts = [];
  for (let i = 0; i < w * h; i++) if (mag[i] >= thr) pts.push(i);
  if (pts.length < 40) return [];
  const D = Math.ceil(Math.hypot(w, h));
  const RHO_BINS = 2 * D + 1;
  const acc = new Float32Array(180 * RHO_BINS);
  const cosT = [], sinT = [];
  for (let t = 0; t < 180; t++) {
    const r = (t * Math.PI) / 180;
    cosT.push(Math.cos(r)); sinT.push(Math.sin(r));
  }
  for (const idx of pts) {
    const x = idx % w, y = (idx / w) | 0;
    for (let t = 0; t < 180; t++) {
      const rho = Math.round(x * cosT[t] + y * sinT[t]) + D;
      acc[t * RHO_BINS + rho]++;
    }
  }
  let maxVotes = 0;
  for (let i = 0; i < acc.length; i++) if (acc[i] > maxVotes) maxVotes = acc[i];
  const minVotes = Math.max(30, maxVotes * 0.25);
  const suppressed = new Uint8Array(acc.length);
  const lines = [];
  for (let k = 0; k < 14; k++) {
    let bi = -1, bv = 0;
    for (let i = 0; i < acc.length; i++) {
      if (!suppressed[i] && acc[i] > bv) { bv = acc[i]; bi = i; }
    }
    if (bi < 0 || bv < minVotes) break;
    const t = (bi / RHO_BINS) | 0, rho = (bi % RHO_BINS) - D;
    lines.push({ theta: t, rho, votes: bv });
    for (let dt = -4; dt <= 4; dt++) {
      const tt = t + dt; if (tt < 0 || tt >= 180) continue;
      for (let dr = -8; dr <= 8; dr++) {
        const rr = rho + dr; if (rr < -D || rr > D) continue;
        suppressed[tt * RHO_BINS + (rr + D)] = 1;
      }
    }
  }
  return lines;
}

function scanQuadsFromLines(lines) {
  // Two roughly-parallel line pairs, roughly perpendicular to each other,
  // make a quad from their four intersections.
  const quads = [];
  const lineAngle = (l) => (l.theta + 90) % 180;
  const angDiff = (a, b) => { const d = Math.abs(a - b) % 180; return d > 90 ? 180 - d : d; };
  const inter = (l1, l2) => {
    const t1 = (l1.theta * Math.PI) / 180, t2 = (l2.theta * Math.PI) / 180;
    const c1 = Math.cos(t1), s1 = Math.sin(t1), c2 = Math.cos(t2), s2 = Math.sin(t2);
    const det = c1 * s2 - c2 * s1;
    if (Math.abs(det) < 0.08) return null;
    return {
      x: (l1.rho * s2 - l2.rho * s1) / det,
      y: (c1 * l2.rho - c2 * l1.rho) / det,
    };
  };
  for (let i = 0; i < lines.length; i++) {
    for (let j = i + 1; j < lines.length; j++) {
      if (angDiff(lineAngle(lines[i]), lineAngle(lines[j])) > 20) continue;
      for (let k = 0; k < lines.length; k++) {
        if (k === i || k === j) continue;
        for (let m = k + 1; m < lines.length; m++) {
          if (m === i || m === j) continue;
          if (angDiff(lineAngle(lines[k]), lineAngle(lines[m])) > 20) continue;
          const d = angDiff(lineAngle(lines[i]), lineAngle(lines[k]));
          if (d < 65 || d > 115) continue;
          const p1 = inter(lines[i], lines[k]);
          const p2 = inter(lines[i], lines[m]);
          const p3 = inter(lines[j], lines[m]);
          const p4 = inter(lines[j], lines[k]);
          if (!p1 || !p2 || !p3 || !p4) continue;
          quads.push(scanOrderCorners([p1, p2, p3, p4]));
        }
      }
    }
  }
  return quads;
}

function scanRefineCorners(quad, mag, w, h, thr) {
  // Snap each corner to the strongest edge within 5px — tighter crop.
  return quad.map((p) => {
    let best = { x: p.x, y: p.y }, bestM = -1;
    for (let dy = -5; dy <= 5; dy++) {
      for (let dx = -5; dx <= 5; dx++) {
        const x = Math.round(p.x) + dx, y = Math.round(p.y) + dy;
        if (x < 0 || y < 0 || x >= w || y >= h) continue;
        const m = mag[y * w + x];
        if (m > bestM) { bestM = m; best = { x, y }; }
      }
    }
    return bestM >= thr ? best : { x: p.x, y: p.y };
  });
}

function detectDocumentQuad(gray, w, h) {
  // gray: 0..255 values, w*h. Returns ordered quad or null.
  // Strong pipeline: multi-threshold contour candidates + Hough line
  // candidates, all scored by real edge support along the perimeter,
  // then corners snapped to the strongest nearby edge.
  const blur = scanBlur(gray, w, h, 2);
  const { mag, maxMag } = scanSobel(blur, w, h);
  if (maxMag < 40) return null; // no strong edge at all
  let best = null, bestScore = -1;
  const consider = (quad, thr) => {
    if (!quad || !scanValidateQuad(quad, w, h)) return;
    const support = scanQuadSupport(quad, mag, thr, w, h);
    if (support < 0.55) return;
    const areaFrac = scanQuadArea(quad) / (w * h);
    const score = support + 0.1 * Math.min(1, areaFrac / 0.4);
    if (score > bestScore) { bestScore = score; best = quad; }
  };
  // Contour candidates at several thresholds; dilate to close small gaps.
  for (const f of [0.45, 0.3, 0.18]) {
    const thr = Math.max(25, maxMag * f);
    const closed = scanDilate(scanThreshold(mag, thr), w, h);
    for (const comp of scanComponents(closed, w, h, 5)) {
      const hullPts = comp.map((idx) => ({ x: idx % w, y: (idx / w) | 0 }));
      consider(scanQuadFromHull(scanConvexHull(hullPts)), thr);
    }
    if (bestScore >= 0.9) break; // clean hit — no need to try more
  }
  // Line candidates when the outline is fragmented (shadow, glare, gaps).
  if (bestScore < 0.8) {
    const thr = Math.max(25, maxMag * 0.25);
    for (const quad of scanQuadsFromLines(scanHoughLines(mag, thr, w, h))) {
      consider(quad, thr);
    }
  }
  if (!best) return null;
  // Snap corners to the strongest nearby edge.
  const refined = scanRefineCorners(best, mag, w, h, Math.max(25, maxMag * 0.25));
  if (refined && scanValidateQuad(refined, w, h)) return refined;
  return best;
}
// --- end document scanner pure functions ---

function drawCropCanvas() {
  const canvas = $('cropCanvas');
  if (!rawImage || !canvas) return;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.translate(canvas.width / 2 + panX, canvas.height / 2 + panY);

  // Fit the ROTATED bounding box into the canvas so a sideways photo is
  // never clipped at the edges.
  const rad = (rotationAngle * Math.PI) / 180;
  const cos = Math.abs(Math.cos(rad));
  const sin = Math.abs(Math.sin(rad));
  const boundW = rawImage.width * cos + rawImage.height * sin;
  const boundH = rawImage.width * sin + rawImage.height * cos;
  const fitScale = Math.min(canvas.width / boundW, canvas.height / boundH);
  const totalScale = fitScale * zoomLevel;
  ctx.scale(totalScale, totalScale);
  ctx.rotate(rad);

  ctx.drawImage(rawImage, -rawImage.width / 2, -rawImage.height / 2);
  ctx.restore();
}

function detectDocumentInImage(img) {
  // Downscale, greyscale, detect the quad, scale corners back to full size.
  const maxW = 480;
  const scale = Math.min(1, maxW / img.naturalWidth);
  const w = Math.max(2, Math.round(img.naturalWidth * scale));
  const h = Math.max(2, Math.round(img.naturalHeight * scale));
  const cv = document.createElement('canvas');
  cv.width = w; cv.height = h;
  const ctx = cv.getContext('2d');
  ctx.drawImage(img, 0, 0, w, h);
  const data = ctx.getImageData(0, 0, w, h).data;
  const gray = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) {
    gray[i] = 0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2];
  }
  const quad = detectDocumentQuad(gray, w, h);
  if (!quad) return null;
  const back = 1 / scale;
  return quad.map((p) => ({ x: p.x * back, y: p.y * back }));
}

function affineFromTriangles(src, dst) {
  // Canvas setTransform (a,b,c,d,e,f) mapping 3 source points to 3 dest points.
  const x1 = src[0].x, y1 = src[0].y, x2 = src[1].x, y2 = src[1].y, x3 = src[2].x, y3 = src[2].y;
  const u1 = dst[0].x, v1 = dst[0].y, u2 = dst[1].x, v2 = dst[1].y, u3 = dst[2].x, v3 = dst[2].y;
  const det = (x2 - x1) * (y3 - y1) - (x3 - x1) * (y2 - y1);
  if (Math.abs(det) < 1e-6) return null;
  const a = ((u2 - u1) * (y3 - y1) - (u3 - u1) * (y2 - y1)) / det;
  const b = ((v2 - v1) * (y3 - y1) - (v3 - v1) * (y2 - y1)) / det;
  const c = ((u3 - u1) * (x2 - x1) - (u2 - u1) * (x3 - x1)) / det;
  const d = ((v3 - v1) * (x2 - x1) - (v2 - v1) * (x3 - x1)) / det;
  const e = u1 - a * x1 - c * y1;
  const f = v1 - b * x1 - d * y1;
  return [a, b, c, d, e, f];
}

function warpQuadImage(img, quad) {
  // Straighten the detected quad into a rectangle, strip by strip
  // (each strip is near-affine, so 32 strips approximate perspective well).
  const [tl, tr, br, bl] = quad;
  const topLen = Math.hypot(tr.x - tl.x, tr.y - tl.y);
  const botLen = Math.hypot(br.x - bl.x, br.y - bl.y);
  const leftLen = Math.hypot(bl.x - tl.x, bl.y - tl.y);
  const rightLen = Math.hypot(br.x - tr.x, br.y - tr.y);
  const scale = Math.min(1, 1200 / Math.max(topLen, botLen, leftLen, rightLen));
  const W = Math.max(200, Math.round(Math.max(topLen, botLen) * scale));
  const H = Math.max(200, Math.round(Math.max(leftLen, rightLen) * scale));
  const out = document.createElement('canvas');
  out.width = W; out.height = H;
  const ctx = out.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, H);
  const STRIPS = 32;
  const lerp = (a, b, t) => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
  for (let i = 0; i < STRIPS; i++) {
    const v0 = i / STRIPS, v1 = (i + 1) / STRIPS;
    const y0 = v0 * H, y1 = v1 * H;
    const p00 = lerp(tl, bl, v0), p10 = lerp(tr, br, v0), p01 = lerp(tl, bl, v1);
    const m = affineFromTriangles(
      [p00, p10, p01],
      [{ x: 0, y: y0 }, { x: W, y: y0 }, { x: 0, y: y1 }]
    );
    if (!m) continue;
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, y0, W, y1 - y0 + 0.5);
    ctx.clip();
    ctx.setTransform(m[0], m[1], m[2], m[3], m[4], m[5]);
    ctx.drawImage(img, 0, 0);
    ctx.restore();
  }
  return out;
}

async function autoScanCrop(manual) {
  const srcImg = rawImage;
  if (!srcImg) return false;
  try {
    const quad = detectDocumentInImage(srcImg);
    if (!quad) {
      if (manual) setStatus('No document edge found — crop it by hand.', 'err');
      return false;
    }
    const warped = warpQuadImage(srcImg, quad);
    const img = new Image();
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = warped.toDataURL('image/jpeg', 0.82);
    });
    // The user may have moved on (crop queue) while the scan ran.
    if (rawImage !== srcImg) return false;
    rawImage = img;
    const canvas = $('cropCanvas');
    canvas.width = warped.width;
    canvas.height = warped.height;
    rotationAngle = 0;
    zoomLevel = 1;
    panX = 0;
    panY = 0;
    $('zoomRange').value = 1;
    drawCropCanvas();
    setStatus('Document detected — auto-cropped.', 'ok');
    return true;
  } catch (_) {
    if (manual) setStatus('Scan failed — crop it by hand.', 'err');
    return false;
  }
}

function setupNativeCropper() {
  const canvas = $('cropCanvas');
  const zoomRange = $('zoomRange');
  const rotateBtn = $('rotateCropBtn');
  const rotateLeftBtn = $('rotateLeftCropBtn');
  const scanBtn = $('scanCropBtn');

  if (rotateBtn) {
    rotateBtn.addEventListener('click', () => {
      rotationAngle = (rotationAngle + 90) % 360;
      drawCropCanvas();
    });
  }

  if (rotateLeftBtn) {
    rotateLeftBtn.addEventListener('click', () => {
      rotationAngle = (rotationAngle - 90 + 360) % 360;
      drawCropCanvas();
    });
  }

  if (scanBtn) {
    scanBtn.addEventListener('click', () => { autoScanCrop(true); });
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
    // Cropping queue: Retake skips this photo and opens the next one.
    if (cropQueue.length) {
      activeCropItem = null;
      openNextQueuedCrop();
      return;
    }
    if (activeCropItem) {
      const item = activeCropItem;
      activeCropItem = null;
      // Rebuild the preview for THIS photo instead of reopening
      // whatever the viewer last showed.
      showImageViewer(item);
    }
  });

  $('saveCropBtn').addEventListener('click', () => {
    const canvas = $('cropCanvas');
    if (!canvas) return;
    const b64 = canvas.toDataURL('image/jpeg', 0.85).split(',')[1];
    $('cropModal').classList.remove('open');

    if (activeCropItem) {
      const croppedItem = activeCropItem;
      croppedItem.base64 = b64;
      renderPreviews('head');
      renderPreviews('other');
      saveSessionState();
      activeCropItem = null;

      // Cropping queue: advance to the next photo instead of the viewer.
      if (cropQueue.length) {
        setStatus(`Cropped ${cropQueueTotal - cropQueue.length} of ${cropQueueTotal}.`, 'ok');
        openNextQueuedCrop();
      } else {
        setStatus('Image cropped and updated.', 'ok');
        // Rebuild the preview so it shows the cropped photo and THIS
        // photo's person (not a stale image or another person's data).
        showImageViewer(croppedItem);
      }
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
- A single uploaded photo may contain TWO OR MORE NID/BRN cards side-by-side or stacked (for example, Husband and Wife in one photo, or multiple children in one photo, or Front + Back of an NID card).
- Extract EVERY person visible in each image as a separate record, and assign the same image tag (e.g., "S1_1") to the "source_images" array of EACH person found in that image!

GENDER & RELATION RULE:
- Accurately set "gender": "Female" for women/girls (মোছাঃ, মোসাঃ, খাতুন, বেগম, আক্তার, বিবি, পারভীন, সুলতানা, MST., Wife, Daughter, Mother, Sister) and "gender": "Male" for men/boys (মোঃ, হোসেন, রহমান, উদ্দিন, আলী, মিয়া, MD., Husband, Son, Father, Brother).
- For children in Section 2 where Specified Relation is "Auto", set "relation": "Son" if Male, or "relation": "Daughter" if Female.

INTELLIGENT DOCUMENT DETECTION ('doc_type'):
- Birth Certificates ("জন্ম নিবন্ধন সনদ", "Birth Registration Certificate", 17 digits) -> "doc_type": "BRN". Extract ONLY Date of Birth (জন্ম তারিখ), ignore Registration/Issuance dates.
- National ID Cards ("জাতীয় পরিচয়পত্র", "National ID Card", 10/13/17 digits) -> "doc_type": "NID".

STRICT NAME EXTRACTION & CROSS-VERIFICATION RULES:
1. NEVER READ FROM SIGNATURE: Extract 'name_bn' and 'name_en' ONLY from the printed "নাম:" and "Name:" text fields.
2. PARENTS' ENGLISH NAMES (HEAD ONLY): For 'head' ONLY, phonetically transliterate Bengali father and mother names into uppercase English letters ("মোঃ" -> "MD.", "মোছাঃ" -> "MST.").
3. PRIMARY APPLICANT (WIFE = 'head'): The female cardholder in Section 1 MUST be assigned as 'head' ("gender": "Female"). The Husband MUST be the FIRST item in 'family_members' ("relation": "Husband", "gender": "Male").
4. All numbers (NID, BRN, DOB) must use English digits (0-9). All dates ('dob') MUST be formatted strictly as DD-MM-YYYY.

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
    religion: s(h.religion) || 'Islam',
    religion_id: RELIGION_ID_MAP[s(h.religion)] || 1,
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
    // Skip empty ghost entries from NID back-side images
    const rawNameBn = s(m?.name_bn);
    const rawNameEn = s(m?.name_en);
    const cleanMemId = toEnglishDigits(s(m?.nid_or_brn)).replace(/\s+/g, '');
    if (!rawNameBn && !rawNameEn && !cleanMemId) continue;

    let rel = s(m?.relation);
    if ((!rel || !RELATION_ID_MAP[rel]) && m?.relationship_id && ID_TO_RELATION_MAP[Number(m.relationship_id)]) {
      rel = ID_TO_RELATION_MAP[Number(m.relationship_id)];
    }

    // Infer gender BEFORE defaulting relation so female children (মোছাঃ/খাতুন) become Daughter, not Son!
    const memGender = inferGender(RELATION_ID_MAP[rel] ? rel : null, m?.gender, rawNameEn, rawNameBn);

    if (!rel || rel === 'Auto' || !RELATION_ID_MAP[rel]) {
      rel = memGender === 'Female' ? 'Daughter' : 'Son';
    } else if (rel === 'Son' && memGender === 'Female') {
      rel = 'Daughter';
    } else if (rel === 'Daughter' && memGender === 'Male') {
      rel = 'Son';
    }

    const memDob = normalizeDob(m?.dob);
    const memAge = calculateAgeYears(memDob);

    const entry = {
      relation: rel,
      relationship_id: Number(m?.relationship_id) || RELATION_ID_MAP[rel] || 263,
      gender: memGender,
      gender_id: GENDER_ID_MAP[memGender] || 1,
      religion: s(m?.religion) || 'Islam',
      religion_id: RELIGION_ID_MAP[s(m?.religion)] || 1,
      doc_type: inferDocType(cleanMemId, m?.doc_type),
      name_bn: rawNameBn,
      name_en: formatEnglishName(rawNameEn),
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

  if (raw?.form_defaults) {
    if (!areaPresets.village && raw.form_defaults.village) areaPresets.village = s(raw.form_defaults.village);
    if (!areaPresets.ward_no && raw.form_defaults.ward_no) areaPresets.ward_no = s(raw.form_defaults.ward_no);
    if (!areaPresets.post_code && raw.form_defaults.post_code) areaPresets.post_code = toEnglishDigits(s(raw.form_defaults.post_code)).replace(/\D+/g, '');
  }
  syncAreaPresetInputs();

  // Set unified family Religion (if any member has মোঃ/মোছাঃ/খাতুন/হোসেন, everyone becomes Islam)
  const allPeople = [head, ...deduped];
  const familyReligion = inferHouseholdReligion(allPeople);
  const familyReligionId = RELIGION_ID_MAP[familyReligion] || 1;
  allPeople.forEach(p => {
    p.religion = familyReligion;
    p.religion_id = familyReligionId;
  });

  const result = {
    head,
    family_members: deduped,
    form_defaults: {}
  };

  recalculateHouseholdSummary(result);

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

    // NOTE: photos with no match stay unlinked on purpose. Copying the
    // previous photo's person onto them showed another person's data
    // in the preview, which is worse than showing no link at all.
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
  headEl.style.background = 'var(--accent-soft)';
  headEl.innerHTML = `<span style="color:var(--accent);">Household Counts, Gender &amp; Religion</span><span class="record-tag child-badge">${defs.religion_label}</span>`;
  card.appendChild(headEl);

  const pills = document.createElement('div');
  pills.className = 'summary-pills';
  pills.innerHTML = `
    <div class="summary-pill">
      <span class="summary-pill-label">মোট সদস্য (Total)</span>
      <span class="summary-pill-val" id="fcPillTotalMembers">${defs.total_members} জন</span>
    </div>
    <div class="summary-pill">
      <span class="summary-pill-label">শিশু &lt;18 (Children)</span>
      <span class="summary-pill-val" id="fcPillChildrenCount">${defs.children_under_18} জন</span>
    </div>
    <div class="summary-pill">
      <span class="summary-pill-label">পুরুষ (Male)</span>
      <span class="summary-pill-val" id="fcPillMaleCount">${defs.male_count} জন</span>
    </div>
    <div class="summary-pill">
      <span class="summary-pill-label">মহিলা (Female)</span>
      <span class="summary-pill-val" id="fcPillFemaleCount">${defs.female_count} জন</span>
    </div>
  `;
  card.appendChild(pills);

  const rows = document.createElement('div');
  rows.className = 'record-rows';

  const makeNumberInput = (id, key, pillId) => {
    const inp = document.createElement('input');
    inp.id = id;
    inp.type = 'number';
    inp.value = String(defs[key] ?? 0);
    inp.style.cssText = 'padding:4px 8px; font-size:12.5px; font-weight:700; border:1px solid var(--border-hover); background:var(--surface); color:var(--text-main); border-radius:5px; width:100%;';
    inp.addEventListener('input', () => {
      defs[key] = parseInt(inp.value, 10) || 0;
      if ($(pillId)) $(pillId).textContent = `${defs[key]} জন`;
      $('rawJsonOutput').textContent = JSON.stringify(state.lastExtracted, null, 2);
      saveSessionState();
    });
    return inp;
  };

  rows.appendChild(buildCopyRow('মোট সদস্য (Total)', makeNumberInput('fcSummaryTotalMembers', 'total_members', 'fcPillTotalMembers'), () => defs.total_members));
  rows.appendChild(buildCopyRow('পুরুষ সংখ্যা (Male)', makeNumberInput('fcSummaryMaleCount', 'male_count', 'fcPillMaleCount'), () => defs.male_count));
  rows.appendChild(buildCopyRow('মহিলা সংখ্যা (Female)', makeNumberInput('fcSummaryFemaleCount', 'female_count', 'fcPillFemaleCount'), () => defs.female_count));
  rows.appendChild(buildCopyRow('শিশু সংখ্যা (<18)', makeNumberInput('fcSummaryChildrenCount', 'children_under_18', 'fcPillChildrenCount'), () => defs.children_under_18));

  // Religion Selector for Entire Family
  const relSel = document.createElement('select');
  relSel.id = 'fcSummaryReligion';
  relSel.style.cssText = 'padding:4px 8px; font-size:12px; font-weight:700; border:1px solid #bbf7d0; background:var(--emerald-soft); color:var(--emerald); border-radius:5px; width:100%; cursor:pointer;';
  RELIGION_OPTIONS.forEach(opt => {
    const o = document.createElement('option');
    o.value = opt.value;
    o.textContent = opt.label;
    relSel.appendChild(o);
  });
  relSel.value = defs.religion || 'Islam';
  relSel.addEventListener('change', (e) => {
    const newRel = e.target.value;
    const newRelId = RELIGION_ID_MAP[newRel] || 1;
    defs.religion = newRel;
    defs.religion_id = newRelId;
    defs.religion_label = RELIGION_OPTIONS.find(r => r.value === newRel)?.label || newRel;
    if (state.lastExtracted.head) {
      state.lastExtracted.head.religion = newRel;
      state.lastExtracted.head.religion_id = newRelId;
    }
    if (Array.isArray(state.lastExtracted.family_members)) {
      state.lastExtracted.family_members.forEach(m => {
        m.religion = newRel;
        m.religion_id = newRelId;
      });
    }
    renderExtractedCards(state.lastExtracted);
  });
  rows.appendChild(buildCopyRow('ধর্ম (All Religion)', relSel, () => defs.religion_label));

  // Post Code Quick Row (from NID back or Saved Preset)
  const postInp = document.createElement('input');
  postInp.type = 'text';
  postInp.placeholder = 'e.g. 7030';
  postInp.value = defs.post_code || areaPresets.post_code || '';
  postInp.style.cssText = 'padding:4px 8px; font-size:12.5px; font-weight:700; border:1px solid var(--border-hover); background:var(--surface); color:var(--text-main); border-radius:5px; width:100%;';
  postInp.addEventListener('input', () => {
    const cleanPost = toEnglishDigits(postInp.value).replace(/\D+/g, '');
    postInp.value = cleanPost;
    defs.post_code = cleanPost;
    areaPresets.post_code = cleanPost;
    if ($('presetPostCodeInput')) $('presetPostCodeInput').value = cleanPost;
    saveCredentialsEverywhere(undefined, undefined, areaPresets);
    $('rawJsonOutput').textContent = JSON.stringify(state.lastExtracted, null, 2);
    saveSessionState();
  });
  rows.appendChild(buildCopyRow('পোস্ট কোড (Post Code)', postInp, () => defs.post_code));

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
        titleSpan.textContent = `Member #1 — Head (${targetObj.gender || 'Female'} • ${targetObj.religion || 'Islam'})`;
        tagSpan.textContent = `Primary • ${targetObj.doc_type || 'NID'}${ageLabel}`;
      } else {
        titleSpan.textContent = `Member #${memberIdx + 2} — ${targetObj.relation} (${targetObj.gender || 'Male'} • ${targetObj.religion || 'Islam'})`;
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
  religion: RELIGION_OPTIONS.map(r => ({ value: r.id, label: `${r.id} — ${r.label}` })),
  religion_id: RELIGION_OPTIONS.map(r => ({ value: r.id, label: `${r.id} — ${r.label}` })),
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
  if (/income|occupation|profession|job|land|house_type|latrine|electricity|asset|allowance|poverty|marital|education|religion|ethnic|tribal|child|male|female/.test(s)) return 'Tab — Socio-Economic & Info (আর্থ-সামাজিক তথ্য)';
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
    sel.style.cssText = 'padding:4px 8px; font-size:12px; font-weight:600; border:1px solid var(--border-hover); background:var(--surface-muted); color:var(--text-main); border-radius:5px; cursor:pointer; width:100%;';

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
}

let currentKeyIndex = 0;
function getNextApiKey() {
  const raw = $('apiKeyInput').value.trim();
  if (!raw) return '';
  const keys = raw.split(/[,;\s]+/).map(k => k.trim()).filter(Boolean);
  if (keys.length === 0) return '';
  const key = keys[currentKeyIndex % keys.length];
  currentKeyIndex = (currentKeyIndex + 1) % keys.length;
  return key;
}

async function runExtraction() {
  if (!state.head.length) {
    setStatus('Please upload at least the Head/Husband ID in Step 1.', 'err');
    return;
  }

  const provider = localStorage.getItem(STORAGE_PROVIDER) || 'google';
  const apiKey = getNextApiKey();
  const model = getActiveModel();

  if (provider === 'google' && !apiKey) {
    $('settingsDrawer').classList.add('open');
    $('apiKeyInput').focus();
    setStatus('Enter your Google Gemini API key in Settings.', 'err');
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
      { text: '\n--- SECTION 1: HEAD (WIFE), HUSBAND & NID BACK ---\n' }
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

    let text = '';

    const allImagesBase64 = [
      ...state.head.map(item => item.base64),
      ...state.other.map(item => item.base64)
    ];

    const imageTagsArray = [
      ...state.head.map((_, i) => `S1_${i + 1}`),
      ...state.other.map((_, i) => `S2_${i + 1}`)
    ];

    let systemPrompt = buildPrompt();
    systemPrompt = systemPrompt.replace('IMAGE TRACKING RULE:', 'IMAGE TAG MAPPING:\nThe uploaded images are provided in the following order:\n' + imageTagsArray.join(', ') + '\n\nIMAGE TRACKING RULE:');

    if (provider === 'custom_fast') {
      const baseUrl = (localStorage.getItem(STORAGE_CUSTOM_URL) || 'https://geminiwebapi-teal.vercel.app').replace(/\/$/, '');
      const customBearer = localStorage.getItem(STORAGE_CUSTOM_BEARER) || '';
      const thinkingMode = localStorage.getItem(STORAGE_CUSTOM_THINKING) || 'off';

      const formData = new FormData();
      formData.append('model', model);
      formData.append('thinking_mode', thinkingMode);
      formData.append('json_mode', 'false');
      formData.append('prompt', systemPrompt);

      for (let i = 0; i < allImagesBase64.length; i++) {
        const blob = await fetch(`data:image/jpeg;base64,${allImagesBase64[i]}`).then(r => r.blob());
        formData.append('files', blob, `image_${i}.jpg`);
      }

      const headers = {};
      if (customBearer) headers['Authorization'] = `Bearer ${customBearer}`;

      const res = await fetch(`${baseUrl}/api/generate/fast`, {
        method: 'POST',
        headers: headers,
        body: formData,
        signal: extractionController.signal
      });

      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload?.error?.message || payload?.error || `HTTP ${res.status}`);
      text = payload?.text || payload?.response || '';

    } else if (provider === 'custom') {
      const baseUrl = (localStorage.getItem(STORAGE_CUSTOM_URL) || 'https://geminiwebapi-teal.vercel.app').replace(/\/$/, '');
      const customBearer = localStorage.getItem(STORAGE_CUSTOM_BEARER) || '';
      const thinkingMode = localStorage.getItem(STORAGE_CUSTOM_THINKING) || 'off';

      const res = await fetch(`${baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${customBearer}`
        },
        body: JSON.stringify({
          model: model,
          thinking: thinkingMode !== 'off',
          thinking_mode: thinkingMode,
          json_mode: false,
          prompt: systemPrompt,
          images: allImagesBase64.map(img => `data:image/jpeg;base64,${img}`)
        }),
        signal: extractionController.signal
      });

      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload?.error?.message || payload?.error || `HTTP ${res.status}`);
      text = payload?.text || payload?.response || '';

    } else {
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
      text = payload?.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('\n').trim();
    }

    let parsed;
    try {
      const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
      parsed = JSON.parse(cleaned);
    } catch (parseErr) {
      const firstBrace = text.indexOf('{');
      const lastBrace = text.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        parsed = JSON.parse(text.substring(firstBrace, lastBrace + 1));
      } else {
        throw new Error(`AI response is not valid JSON: ${text.slice(0, 100)}...`);
      }
    }

    const normalized = normalizeOutput(parsed);
    state.lastExtracted = normalized;

    renderExtractedCards(normalized);
    $('autofillBtn').disabled = false;
    const defs = normalized.form_defaults;
    setStatus(`Ready! Total: ${defs.total_members} (Male: ${defs.male_count}, Female: ${defs.female_count}, Child: ${defs.children_under_18}) • ${defs.religion}`, 'ok');
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
  handleAreaPresetChange();
  window.parent.postMessage({ action: 'FILL_VUE_FORM', payload: state.lastExtracted }, '*');
  setStatus('Sent auto-fill data (Members, Gender, Religion, Post Code & Area) to form!', 'ok');
}

function exportExtractedJson() {
  if (!state.lastExtracted) {
    setStatus('Nothing to export yet — Extract or Pull Draft first.', 'err');
    return;
  }
  handleAreaPresetChange();
  const h = state.lastExtracted.head || {};
  const idPart = h.nid || (h.name_en ? h.name_en.replace(/[^A-Z0-9]+/gi, '_') : 'draft');
  const filename = `FC_${idPart}_${new Date().toISOString().slice(0, 10)}.json`;
  // Save the photos inside the JSON so an import brings them back: the NID
  // uploads (head/other) as bare base64, the draft photos as full data URLs.
  const photoCount = state.head.length + state.other.length + (state.pulledImages || []).length;
  const exportObj = {
    ...state.lastExtracted,
    images: {
      head: state.head.map((it) => ({ name: it.name, base64: it.base64 })),
      other: state.other.map((it) => ({ name: it.name, base64: it.base64 })),
      pulled: (state.pulledImages || []).map((it) => ({ slot: it.slot, name: it.name, dataUrl: it.dataUrl }))
    }
  };
  const jsonString = JSON.stringify(exportObj, null, 2);

  window.parent.postMessage({ action: 'FC_DOWNLOAD_JSON', filename, jsonString }, '*');
  setStatus(`Exported ${filename}${photoCount ? ` (${photoCount} photo${photoCount > 1 ? 's' : ''} included)` : ''}!`, 'ok');
}

function importExtractedJson(e) {
  const file = e.target.files && e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onerror = () => setStatus('Could not read JSON file.', 'err');
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      // Photos ride separately: keep base64 out of lastExtracted (and the
      // Raw JSON view) and restore them into the photo lists below.
      const incomingImages = parsed.images && typeof parsed.images === 'object' ? parsed.images : null;
      if (parsed.images) delete parsed.images;
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
      let restoredPhotos = 0;
      if (incomingImages) restoredPhotos = restoreImportedImages(incomingImages);
      setStatus(`Imported ${file.name}${restoredPhotos ? ` — ${restoredPhotos} photo${restoredPhotos > 1 ? 's' : ''} restored` : ''}! Click 2. Auto-Fill Form to apply.`, 'ok');
    } catch (err) {
      setStatus(`Import error: ${err.message}`, 'err');
    }
  };
  reader.readAsText(file);
  e.target.value = '';
}

// Put the photos from an exported JSON back into the photo lists. Merges
// with whatever is already there (never wipes current uploads) and skips
// duplicates; old JSON files without an images section restore nothing.
function restoreImportedImages(images) {
  let restored = 0;
  const addBack = (category, list) => {
    if (!Array.isArray(list)) return;
    list.forEach((im) => {
      if (!im || typeof im.base64 !== 'string' || !im.base64) return;
      if (state[category].some((it) => it.base64 === im.base64)) return;
      state[category].push({ id: nextId++, base64: im.base64, name: im.name || 'Card.jpg', relation: 'Auto', boundRef: null, boundRefs: [] });
      restored++;
    });
  };
  addBack('head', images.head);
  addBack('other', images.other);
  if (Array.isArray(images.pulled)) {
    images.pulled.forEach((im) => {
      if (!im || typeof im.dataUrl !== 'string' || !im.dataUrl.startsWith('data:image')) return;
      if ((state.pulledImages || []).some((it) => it.dataUrl === im.dataUrl)) return;
      state.pulledImages.push({ slot: im.slot || 'image', name: im.name || 'Photo', dataUrl: im.dataUrl });
      restored++;
    });
  }
  renderPreviews('head');
  renderPreviews('other');
  renderPulledImages();
  saveSessionState();
  return restored;
}

'use strict';

const STORAGE_KEY = 'fc_pro_api_key';
const STORAGE_MODEL = 'fc_pro_model';
const STORAGE_AREA_PRESETS = 'fc_pro_area_presets';
const STORAGE_PROVIDER = 'fc_pro_api_provider';
const STORAGE_CUSTOM_URL = 'fc_pro_custom_url';
const STORAGE_CUSTOM_BEARER = 'fc_pro_custom_bearer';
const STORAGE_CUSTOM_THINKING = 'fc_pro_custom_thinking';
const CURRENT_VERSION_TAG = 'v4.9.55-live';

const RELATION_OPTIONS = [
  { value: 'Auto', label: 'Auto (Son / Daughter)', id: null, gender: null },
  { value: 'Son', label: 'Son (পুত্র)', id: 160, gender: 'Male' },
  { value: 'Daughter', label: 'Daughter (কন্যা)', id: 161, gender: 'Female' },
  { value: 'Husband', label: 'Husband (স্বামী)', id: 159, gender: 'Male' },
  { value: 'Wife', label: 'Wife (স্ত্রী)', id: 186, gender: 'Female' },
  { value: 'Father', label: 'Father (পিতা)', id: 157, gender: 'Male' },
  { value: 'Mother', label: 'Mother (মাতা)', id: 158, gender: 'Female' },
  // Ids are the site's real type-41 ids (v4.9.37): Brother/Sister used
  // to be 162/163 and Father-/Mother-in-law 164/165, which are card
  // ids, not relations — the injector then wrote a wrong id to the
  // form. Grandfather/Grandmother and Brother-/Sister-in-law were
  // missing entirely, so a recalculated relation could not be shown.
  { value: 'Grandfather', label: 'Grandfather (দাদা)', id: 173, gender: 'Male' },
  { value: 'Grandmother', label: 'Grandmother (দাদী)', id: 174, gender: 'Female' },
  { value: 'Brother', label: 'Brother (ভাই)', id: 175, gender: 'Male' },
  { value: 'Sister', label: 'Sister (বোন)', id: 176, gender: 'Female' },
  { value: 'Father-in-law', label: 'Father-in-law (শ্বশুর)', id: 177, gender: 'Male' },
  { value: 'Mother-in-law', label: 'Mother-in-law (শাশুড়ি)', id: 178, gender: 'Female' },
  { value: 'Brother-in-law', label: 'Brother-in-law (দেবর)', id: 179, gender: 'Male' },
  { value: 'Sister-in-law', label: 'Sister-in-law (ননদ)', id: 180, gender: 'Female' },
  { value: 'Son-in-law', label: 'Son-in-law (জামাতা)', id: 187, gender: 'Male' },
  { value: 'Daughter-in-law', label: 'Daughter-in-law (পুত্রবধূ)', id: 182, gender: 'Female' },
  { value: 'Grandson', label: 'Grandson (নাতি)', id: 183, gender: 'Male' },
  { value: 'Granddaughter', label: 'Granddaughter (নাতনি)', id: 184, gender: 'Female' },
  { value: 'Paid Domestic Worker', label: 'Paid Domestic Worker (বেতনভুক্ত গৃহকর্মী)', id: 262, gender: null },
  { value: 'Other Relative', label: 'Other Relative (অন্যান্য)', id: 263, gender: null },
  { value: 'Non-Relative', label: 'Non-Relative (অনাত্মীয়)', id: 264, gender: null },
  { value: 'Brother/Sister-in-law', label: 'Brother/Sister-in-law (শ্যালক/শ্যালিকা)', id: 265, gender: null }
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

// Head profession (type-34 list, real ids from the site's lookup —
// DIFFERENT from the member livelihood list, type 44).
const PROFESSION_OPTIONS = [
  { id: 109, label: 'শ্রমজীবী / Laborer' },
  { id: 181, label: 'গৃহীনি / House Wife' },
  { id: 150, label: 'দিনমজুর / Day Laborer' },
  { id: 151, label: 'কৃষিকাজ / Farmer' },
  { id: 149, label: 'ব্যবসা / Business' },
  { id: 107, label: 'চাকুরি / Service' },
  { id: 106, label: 'শিক্ষার্থী / Student' },
  { id: 108, label: 'কর্মহীন / Unemployed' },
  { id: 110, label: 'অন্যান্য / Others' }
];

// Member livelihood/profession (type-44 list, real ids from the site's
// lookup — DIFFERENT from the head's type-34 profession list above).
const LIVELIHOOD_OPTIONS = [
  { id: 210, label: 'কৃষিকাজ / Agriculture' },
  { id: 211, label: 'ব্যবসা / Business' },
  { id: 212, label: 'বেসরকারি চাকরি / Private Job' },
  { id: 213, label: 'সরকারি চাকরি / Govt Job' },
  { id: 214, label: 'দিনমজুর / Day Laborer' },
  { id: 215, label: 'গার্মেন্টস কর্মী / Garment Worker' },
  { id: 216, label: 'রিকশা/ভ্যানচালক / Rickshaw/Van Driver' },
  { id: 217, label: 'পরিবহন শ্রমিক / Transport Worker' },
  { id: 218, label: 'হোটেল/রেস্টুরেন্ট কর্মী / Hotel/Restaurant Worker' },
  { id: 219, label: 'গৃহকর্মী / Domestic Worker' },
  { id: 220, label: 'ছাত্র/ছাত্রী / Student' },
  { id: 221, label: 'শিক্ষানবিশ / Apprentice' },
  { id: 222, label: 'বেকার / Unemployed' },
  { id: 223, label: 'অবসরপ্রাপ্ত / Retired' },
  { id: 224, label: 'বয়স্ক/অক্ষম/অসুস্থ / Elderly/Disabled/Sick' },
  { id: 225, label: 'গৃহিণী / Homemaker' },
  { id: 275, label: 'প্রযোজ্য নয় / Not Applicable' },
  { id: 226, label: 'অন্যান্য / Others' }
];

// Marital status (type-32 list, real ids from the site's lookup).
const MARITAL_OPTIONS = [
  { id: 101, label: 'বিবাহিত / Married' },
  { id: 102, label: 'অবিবাহিত / Unmarried' },
  { id: 103, label: 'বিধবা / Widow' },
  { id: 104, label: 'স্বামী নিগৃহীতা / Separated' },
  { id: 244, label: 'তালাকপ্রাপ্ত / Divorced' },
  { id: 245, label: 'দাম্পত্য বিচ্ছিন্ন / Maritally Separated' },
  { id: 276, label: 'বিপত্নীক / Widower' }
];

const RELATION_ID_MAP = Object.fromEntries(RELATION_OPTIONS.filter((r) => r.id !== null).map((r) => [r.value, r.id]));
const ID_TO_RELATION_MAP = Object.fromEntries(RELATION_OPTIONS.filter((r) => r.id !== null).map((r) => [r.id, r.value]));
const RELATION_GENDER_MAP = Object.fromEntries(RELATION_OPTIONS.filter((r) => r.gender !== null).map((r) => [r.value, r.gender]));

const GENDER_ID_MAP = { Male: 1, Female: 2, Other: 3 };
const RELIGION_ID_MAP = { Islam: 1, Hinduism: 2, Buddhism: 3, Christianity: 4, Other: 5 };
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const HEAD_FIELDS = [
  // Order (v4.9.41): identity first — name, then the parents' names
  // right under it (as on the BD NID card), then gender / religion /
  // DOB, then the fields the DOB derives (education / profession /
  // marital). DOB stays before NID, as on the BD NID card.
  { key: 'name_bn', label: 'Name (BN)' },
  { key: 'name_en', label: 'Name (EN)' },
  { key: 'father_name_bn', label: 'Father (BN)' },
  { key: 'father_name_en', label: 'Father (EN)' },
  { key: 'mother_name_bn', label: 'Mother (BN)' },
  { key: 'mother_name_en', label: 'Mother (EN)' },
  { key: 'gender', label: 'Gender', type: 'gender_select' },
  { key: 'religion', label: 'Religion (ধর্ম)', type: 'religion_select' },
  { key: 'dob', label: 'DOB (DD-MM-YYYY)' },
  { key: 'nid', label: 'NID / BRN No' },
  // Doc Type under the number (v4.9.54): the number is typed first
  // and the type follows it — 17 digits flip it to BRN live — so the
  // user never has to pick the type before typing the number.
  { key: 'doc_type', label: 'Doc Type', type: 'doc_select' },
  // Phone + MFS (v4.9.49, v4.9.50): the head's mobile number fills the
  // form's ONE mobile field, data.mobile (the form never asks for a
  // mobile anywhere else); the MFS pick fills PMT field 138
  // (Bkash/Nagad/...) via form_defaults.program_fields.
  { key: 'mobile_number', label: 'Mobile (মোবাইল)' },
  { key: 'mfs_provider_id', label: 'MFS (মোবাইল ব্যাংকিং)', type: 'mfs_select' },
  { key: 'education_status_id', label: 'Education (শিক্ষা)', type: 'edu_select' },
  { key: 'profession', label: 'Profession (পেশা)', type: 'profession_select' },
  { key: 'marital_status', label: 'Marital (বৈবাহিক)', type: 'marital_select' },
  // Disability + Health (v4.9.50): the head is a person too — the same
  // Disabled / Disability Type / Health fields as a member card. They
  // ride on the head member row (the head form itself has no health
  // or disability fields); the form's health select is required.
  { key: 'is_disabled', label: 'Disabled? (প্রতিবন্ধী)', type: 'yesno_select' },
  { key: 'disability_type_id', label: 'Disability Type (প্রতিবন্ধিতার ধরণ)', type: 'disability_select' },
  { key: 'health_condition_id', label: 'Health (স্বাস্থ্য)', type: 'health_select' },
  // Benefit (v4.9.36): same SSNP / card / DSS fields as a member — the
  // head is the one the Halnagad check reports on.
  { key: 'is_ssnp_covered', label: 'SSNP covered? (সামাজিক নিরাপত্তা)', type: 'yesno_select' },
  { key: 'facilities_ids', label: 'Govt Card(s)', type: 'card_multi' },
  { key: 'is_dss_training_or_financial_benefit', label: 'DSS training/benefit?', type: 'yesno_select' }
];

const MEMBER_FIELDS = [
  { key: 'relation', label: 'Relation', type: 'rel_select' },
  { key: 'name_bn', label: 'Name (BN)' },
  { key: 'name_en', label: 'Name (EN)' },
  // Parents' names (v4.9.41): right under the name, as on the BD NID
  // card — not down below the derived fields.
  { key: 'father_name_bn', label: 'Father (BN)' },
  { key: 'mother_name_bn', label: 'Mother (BN)' },
  { key: 'gender', label: 'Gender', type: 'gender_select' },
  { key: 'religion', label: 'Religion (ধর্ম)', type: 'religion_select' },
  { key: 'dob', label: 'DOB (DD-MM-YYYY)' },
  { key: 'nid_or_brn', label: 'NID / BRN No' },
  // Doc Type under the number (v4.9.54): the number is typed first
  // and the type follows it — 17 digits flip it to BRN live — so the
  // user never has to pick the type before typing the number.
  { key: 'doc_type', label: 'Doc Type', type: 'doc_select' },
  // (No member Mobile: the form asks for a mobile number in ONE place
  // only — data.mobile on the head form. Member rows never render a
  // mobile input, so the member card has no Mobile field. v4.9.50.)
  // Education / profession / marital (v4.9.39): same three the head card
  // has, so a member's derived values (e.g. the husband's Agriculture)
  // are visible and changeable offline. Profession here is the type-44
  // livelihood list; marital uses the site's typo key maritial_status_id.
  { key: 'education_status_id', label: 'Education (শিক্ষা)', type: 'edu_select' },
  { key: 'livelihood_profession_id', label: 'Profession (পেশা)', type: 'livelihood_select' },
  { key: 'maritial_status_id', label: 'Marital (বৈবাহিক)', type: 'marital_select' },
  // Disability (v4.9.49): a disabled member needs the type on the form
  // (lookup type 11). The type row only shows when Disabled is Yes.
  { key: 'is_disabled', label: 'Disabled? (প্রতিবন্ধী)', type: 'yesno_select' },
  { key: 'disability_type_id', label: 'Disability Type (প্রতিবন্ধিতার ধরণ)', type: 'disability_select' },
  // Health (v4.9.49): কর্মক্ষম (Able-bodied, 203) is the default —
  // the form's health field (type 43) — the other options are picked
  // from here. A disabled member shows blank instead of the
  // able-bodied default, so the right option gets picked.
  { key: 'health_condition_id', label: 'Health (স্বাস্থ্য)', type: 'health_select' },
  // Benefit (v4.9.36): whether this member already receives another
  // programme (SSNP), which card, and whether they got DSS training /
  // a DSS benefit. The injector reads these on Auto-Fill; the Halnagad
  // detection fills them in automatically for the head.
  { key: 'is_ssnp_covered', label: 'SSNP covered? (সামাজিক নিরাপত্তা)', type: 'yesno_select' },
  { key: 'facilities_ids', label: 'Govt Card(s)', type: 'card_multi' },
  { key: 'is_dss_training_or_financial_benefit', label: 'DSS training/benefit?', type: 'yesno_select' }
];
// Government Card types (lookup type 42). 185 (NO Card) is not offered
// — it means "no card", which is SSNP No.
const GOV_CARD_OPTIONS = [
  { id: 162, label: 'Social Welfare Allowance (সমাজকল্যাণ ভাতা)' },
  { id: 163, label: 'VGF / VGD' },
  { id: 164, label: 'Ration Card' },
  { id: 165, label: 'Fertilizer Card' },
  { id: 166, label: 'TCB Card' },
  { id: 167, label: 'Muktijoddha Card' },
  { id: 168, label: 'Scholarship Card' },
  { id: 169, label: 'Migrant Workers Welfare Card' },
  { id: 170, label: 'Pension Card' },
  { id: 171, label: 'Agriculture Card' },
  { id: 172, label: 'Fishermen Card' }
];
// Disability types (lookup type 11, v4.9.49). The form needs the type
// when a member is disabled; the AI cannot know it from an NID photo,
// so the user picks it by hand on the card.
const DISABILITY_TYPE_OPTIONS = [
  { id: 247, label: 'শারীরিক প্রতিবন্ধিতা (Physical)' },
  { id: 248, label: 'দৃষ্টি প্রতিবন্ধিতা (Visual)' },
  { id: 249, label: 'শ্রবণ প্রতিবন্ধিতা (Hearing)' },
  { id: 250, label: 'বাক প্রতিবন্ধিতা (Speech)' },
  { id: 251, label: 'বুদ্ধি প্রতিবন্ধিতা (Intellectual)' },
  { id: 252, label: 'মানসিক প্রতিবন্ধিতা (Mental)' },
  { id: 253, label: 'অটিজম (Autism)' },
  { id: 254, label: 'শ্রবণ-দৃষ্টিপ্রতিবন্ধিতা (Deaf-blind)' },
  { id: 255, label: 'মস্তিষ্কের ক্ষতিজনিত (Cerebral palsy)' },
  { id: 256, label: 'বহুমাত্রিক (Multiple)' },
  { id: 257, label: 'ডাউন সিনড্রোম (Down Syndrome)' },
  { id: 258, label: 'অন্যান্য (Others)' }
];

// MFS providers (PMT field 138, v4.9.49): which mobile banking the
// head's mobile number has an account in. Picked by hand on the head
// card — the injector never guesses it; the pick reaches the form via
// form_defaults.program_fields['138'].
const MFS_PROVIDER_OPTIONS = [
  { id: 679, label: 'বিকাশ (Bkash)' },
  { id: 680, label: 'নগদ (Nagad)' },
  { id: 681, label: 'রকেট (Rocket)' },
  { id: 682, label: 'উপায় (Upay)' },
  { id: 683, label: 'এমক্যাশ (MCash)' },
  { id: 684, label: 'কোনো হিসাব নেই (No Account)' }
];
// Health conditions (lookup type 43, v4.9.49): কর্মক্ষম (Able-bodied,
// 203) is the default — the form's health field — the other options
// are picked from the same dropdown.
const HEALTH_OPTIONS = [
  { id: 203, label: 'কর্মক্ষম (Able-bodied)' },
  { id: 204, label: 'সম্পূর্ণ অক্ষম (Completely Disabled)' },
  { id: 205, label: 'আংশিক কর্মক্ষম (Partially Able-bodied)' },
  { id: 206, label: 'প্রতিবন্ধী (Person with Disability)' }
];

// Cash usage categories (2500 Tk distribution) — the site's lookup
// type 46, real ids from getApplicationPageData. The "Other" row
// (274) carries an extra other_detail text.
const CASH_USAGE_OPTIONS = [
  { id: 266, label: 'খাদ্য ও পরিবারের ভরণপোষণ (Food and family subsistence)' },
  { id: 267, label: 'চিকিৎসা (Medical — self or family)' },
  { id: 268, label: 'সন্তানের শিক্ষা (Children education)' },
  { id: 269, label: 'বাসস্থান নির্মান/মেরামত (Housing construction/repair)' },
  { id: 270, label: 'পোশাক/বস্ত্র/কাপড় ক্রয় (Clothing purchase)' },
  { id: 271, label: 'আয়বর্ধক কর্মসূচি (Income generating activities)' },
  { id: 272, label: 'সঞ্চয় (Savings)' },
  { id: 273, label: 'ঋণ পরিশোধ (Loan repayment)' },
  { id: 274, label: 'অন্যান্য (Other — please specify)', other: true }
];
const CASH_USAGE_CAP = 2500;
const CASH_USAGE_OTHER_ID = 274;

const state = { head: [], other: [], pulledImages: [], lastExtracted: null, halnagad: null };
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
// Crop frame: '4:3' (landscape card), '3:4' (portrait card) or 'free'
// (Freeform — a crop box you drag by its corners, like a phone editor).
// Auto-picked from the photo on crop open.
let cropRatio = '4:3';
// Freeform crop box, in canvas px. Only drawn in Free mode; starts as
// the full photo and Apply saves exactly the boxed region.
let freeCropRect = null;
// Box drag in progress: { mode, startX, startY, rect } — mode is a
// handle ('nw','ne','sw','se','n','s','e','w') or 'inside' (move).
let freeDrag = null;
// Last fit computed by drawCropCanvas ({ boundW, boundH, fitScale }) —
// the Freeform box starts from it, so the box and the drawn photo agree.
let lastCropFit = null;
// Perspective detection (auto-scan / live edge view): on by default,
// remembered across sessions. Off = plain photo, crop by hand.
let perspectiveEnabled = true;
try { perspectiveEnabled = localStorage.getItem('fc_pro_perspective') !== '0'; } catch (_) {}
// Banglish auto-transliteration (v4.9.48): on by default, remembered
// across sessions. Off = typing a Bangla name leaves the English
// field blank, so it can be typed by hand (New Form).
let banglishEnabled = true;
try { banglishEnabled = localStorage.getItem('fc_pro_banglish') !== '0'; } catch (_) {}
let panX = 0;
let panY = 0;
let isDragging = false;
let startX = 0;
let startY = 0;
let activeCropItem = null;
// Retake in progress: the state item the next capture/upload replaces
// (same place in the list, same person binding). Cleared on capture,
// on save, or when the camera/file picker is cancelled.
let retakeItem = null;
// Undo for the crop editor: the photo as it arrived, before any
// auto-scan warped it. Null until a crop opens; cropAutoScanned is
// true while the shown photo is a warped result.
let cropOriginalImage = null;
let cropAutoScanned = false;
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
  $('cancelCameraBtn').addEventListener('click', cancelPanelCamera);
  $('closeCameraBtn').addEventListener('click', cancelPanelCamera);
  $('switchCameraBtn').addEventListener('click', switchPanelCamera);
  const perspCamBtn = $('perspectiveToggleCamBtn');
  if (perspCamBtn) perspCamBtn.addEventListener('click', togglePerspective);
  const frameBtn = $('frameRotateBtn');
  if (frameBtn) frameBtn.addEventListener('click', toggleFrameOrientation);
  const zoomRange = $('zoomRange');
  if (zoomRange) zoomRange.addEventListener('input', (e) => { const v = parseFloat(e.target.value); if (!Number.isNaN(v)) applyCameraZoom(v); });
  const zoomOutBtn = $('zoomOutBtn');
  if (zoomOutBtn) zoomOutBtn.addEventListener('click', () => applyCameraZoom(panelCameraZoom.value - Math.max(panelCameraZoom.step, 0.1)));
  const zoomInBtn = $('zoomInBtn');
  if (zoomInBtn) zoomInBtn.addEventListener('click', () => applyCameraZoom(panelCameraZoom.value + Math.max(panelCameraZoom.step, 0.1)));
  // Device rotation: the frame/guide/outline are drawn from live sizes,
  // but a stored green-lock quad belongs to the old orientation — drop it
  // and re-draw immediately instead of waiting for the next 400ms tick.
  const resyncCameraView = () => {
    const modal = $('cameraModal');
    if (!modal || !modal.classList.contains('open')) return;
    panelCameraQuad = null;
    runCameraEdgeDetect();
  };
  window.addEventListener('orientationchange', resyncCameraView);
  window.addEventListener('resize', resyncCameraView);
  updateFrameButton();

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

  // New Form (v4.9.48): a blank form to type every name by hand —
  // replaces the Pull All button (the user asked for New Form, not a
  // second pull). Purely panel-side: no message to the injector.
  $('newFormBtn').addEventListener('click', newBlankForm);

  // Banglish toggle (v4.9.48): on = typing a Bangla name fills the
  // English name (the v4.9.40 behaviour); off = the English fields
  // stay blank for hand-typing. Remembered across sessions.
  const banglishBtn = $('banglishToggleBtn');
  const paintBanglishBtn = () => { if (banglishBtn) banglishBtn.textContent = banglishEnabled ? 'Banglish: On' : 'Banglish: Off'; };
  paintBanglishBtn();
  if (banglishBtn) banglishBtn.addEventListener('click', () => {
    banglishEnabled = !banglishEnabled;
    try { localStorage.setItem('fc_pro_banglish', banglishEnabled ? '1' : '0'); } catch (_) {}
    paintBanglishBtn();
    setStatus(banglishEnabled ? 'Banglish on — typing Bangla fills the English name.' : 'Banglish off — English names stay blank for hand-typing.', 'ok');
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
    // Halnagad (v4.9.36): the injector reports the other programme it
    // found for the head — show it and mirror the benefit onto the
    // head record.
    if (e.data.detail && e.data.detail.halnagad) applyHalnagadBenefit(e.data.detail.halnagad);
    // Head corrections (v4.9.33): the injector reports how many it
    // applied. Only clear on a report from an injector that knows
    // about corrections (v25+) — an older injector has no such field,
    // so the corrections stay for the next fill after it is updated.
    const applied = e.data.detail && e.data.detail.correctionsApplied;
    if (e.data.detail.success && typeof applied === 'number' && applied > 0 && state.lastExtracted && state.lastExtracted.corrections) {
      delete state.lastExtracted.corrections;
      saveSessionState();
    }
  }
  if (e.data.action === 'FC_STATUS_REPLY') {
    const pill = $('connStatus');
    if (e.data.online) {
      pill.classList.add('online');
      $('connText').textContent = 'Form Ready';
    }
  }

  if (e.data.action === 'FC_LIVE_EDUCATION_RESPONSE') {
    // The injector's answer to requestLiveEducation(): { success, head, spouse }.
    // A failed read is the same as no answer — the popup falls back to
    // the panel's own data.
    if (liveEducationWaiter) {
      const w = liveEducationWaiter;
      liveEducationWaiter = null;
      const res = e.data.detail || {};
      w.resolve(res.success ? { head: res.head || null, spouse: res.spouse || null } : null);
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
      state.lastExtracted = normalizeOutput(payloadForNorm, true, state.lastExtracted);
      renderExtractedCards(state.lastExtracted);
      // Halnagad (v4.9.36): the programme the site found for the head.
      if (res.payload.halnagad) applyHalnagadBenefit(res.payload.halnagad);
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

// Halnagad / other-programme note (v4.9.36): the programme the site
// found for the head when their NID was verified, and whether they
// only applied or already receive it. A beneficiary gets SSNP Yes +
// the matching card on the head record (and on the form, by the
// injector); an applicant is NOT counted as receiving.
function halnagadNoteText(hg) {
  if (!hg || !hg.program) return '';
  const cardLabel = hg.cardId ? ` — card ${hg.cardId}` : ' — pick the card below';
  if (hg.isBeneficiary) return `অন্য প্রোগ্রাম: ${hg.program} (পাচ্ছেন) — SSNP Yes${cardLabel}.`;
  return `অন্য প্রোগ্রাম: ${hg.program} (শুধু আবেদন করেছেন, এখনো পাননি) — SSNP No.`;
}
function renderHalnagadNote() {
  const el = $('halnagadNote');
  if (!el) return;
  const txt = halnagadNoteText(state.halnagad);
  el.style.display = txt ? '' : 'none';
  el.textContent = txt;
}
function applyHalnagadBenefit(hg) {
  if (!hg || !hg.program) { state.halnagad = null; renderHalnagadNote(); return; }
  state.halnagad = hg;
  renderHalnagadNote();
  const d = state.lastExtracted;
  if (d && d.head && hg.isBeneficiary) {
    d.head.is_ssnp_covered = 1;
    if (hg.cardId) d.head.facilities_ids = [hg.cardId];
    saveSessionState();
    // Update the head card's controls in place (no full re-render).
    const headCard = document.querySelector('.record-card');
    if (headCard) {
      const ssnpSel = headCard.querySelector('[data-field="is_ssnp_covered"]');
      if (ssnpSel) ssnpSel.value = '1';
      const facSel = headCard.querySelector('[data-field="facilities_ids"]');
      if (facSel && hg.cardId) {
        Array.from(facSel.options).forEach(o => { o.selected = (Number(o.value) === hg.cardId); });
        const facRow = facSel.closest('.record-row');
        if (facRow) facRow.style.display = '';
      }
    }
    syncJsonOutput();
  }
}

function toEnglishDigits(str) {
  if (!str) return '';
  return String(str).replace(/[০-৯]/g, (d) => '০১২৩৪৫৬৭৮৯'.indexOf(d));
}

// The site's name rules (app.js: bangla_character / english): a Bangla
// name holds only Bangla letters, spaces and . : ( ) - , — no English
// letters; an English name holds only English letters, dots, spaces,
// commas, hyphens, parentheses. Strip anything else, so a wrong-script
// letter typed in a name field never reaches the form.
function stripLatinLetters(str) {
  if (!str) return '';
  return String(str).replace(/[A-Za-z]/g, '').replace(/\s+/g, ' ').trim();
}
function stripNonEnglishName(str) {
  if (!str) return '';
  return String(str).replace(/[^a-zA-Z. ,()\-]/g, '').replace(/\s+/g, ' ').trim();
}

function normalizeDob(rawDob) {
  let s = toEnglishDigits(rawDob).trim();
  if (!s) return '';
  s = s.replace(/\[.*?\]/g, '');

  let dd, mm, yyyy;
  const dmy = s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (dmy) { dd = dmy[1]; mm = dmy[2]; yyyy = dmy[3]; }
  else {
    // Two-digit year (v4.9.53, fixed v4.9.54): a year typed short —
    // 06, 11 — counts as the 2000s, so 2006 / 2011. (v4.9.53 had it
    // backwards as 19xx — the user corrected it: 06 means 2006.)
    // Unambiguous years already expanded live in formatDobInput
    // (v4.9.55); this is the blur backstop for 19 / 20, which could
    // still be the start of a 4-digit year while typing.
    const dmy2 = s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2})$/);
    if (dmy2) { dd = dmy2[1]; mm = dmy2[2]; yyyy = '20' + dmy2[3]; }
    else {
      const ymd = s.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
      if (ymd) { yyyy = ymd[1]; mm = ymd[2]; dd = ymd[3]; }
      else return s;
    }
  }

  dd = dd.padStart(2, '0');
  mm = mm.padStart(2, '0');
  const mIndex = parseInt(mm, 10) - 1;
  const monStr = (mIndex >= 0 && mIndex < 12) ? `[${MONTH_NAMES[mIndex]}]` : '';

  return `${dd}-${mm}${monStr}-${yyyy}`;
}

// DOB auto-format (v4.9.43, v4.9.53): typing just the digits fills in
// the hyphens — the hyphen appears as soon as two digits are typed, so
// 20 becomes 20- and 2001 becomes 20-01-, and the hyphen never
// needs typing. Day-first only: the panel, the NID card and the way
// dates are typed here are all DD-MM-YYYY, so a year-first value
// (19900115) is NOT flipped any more — it is read as day-first like
// everything else. The month name shows up immediately too (v4.9.53):
// once the month's two digits are typed, 1501 becomes 15-01[Jan]-
// while typing, not only on blur — only for a real month (01–12).
// A short year updates immediately too (v4.9.55): 150106 becomes
// 15-01[Jan]-2006 the moment the 6th digit lands — unless the year
// is 19 or 20, which could still be the start of a 4-digit year, so
// those wait for blur.
// Pure function, so it is easy to test. `deleting` is true when the
// user just pressed backspace: the trailing hyphen is then left off,
// so deleting 20- gives 20 instead of getting stuck on the hyphen.
function formatDobInput(raw, deleting) {
  const digits = toEnglishDigits(String(raw || '')).replace(/\D+/g, '').slice(0, 8);
  if (!digits) return '';
  const mm = digits.length >= 4 ? digits.slice(2, 4) : '';
  const mIndex = parseInt(mm, 10) - 1;
  const monStr = (mm && mIndex >= 0 && mIndex < 12) ? `[${MONTH_NAMES[mIndex]}]` : '';
  // Two-digit year, immediately (v4.9.55): once the 6th digit lands,
  // a short year shows as the 2000s at once — 150106 becomes
  // 15-01[Jan]-2006 while typing, not only on blur. Only when it is
  // UNAMBIGUOUS: a year part of 19 or 20 could still be the start of
  // a 4-digit year (1990, 2006), so those wait for blur — 06 or 11
  // can never start a 4-digit year (06XX / 11XX are not real years),
  // so they expand at once. Never while deleting.
  if (digits.length === 6 && !deleting) {
    const yy = digits.slice(4, 6);
    if (yy !== '19' && yy !== '20') {
      return `${digits.slice(0, 2)}-${digits.slice(2, 4)}${monStr}-20${yy}`;
    }
  }
  if (digits.length > 4) return `${digits.slice(0, 2)}-${digits.slice(2, 4)}${monStr}-${digits.slice(4)}`;
  if (digits.length === 4) return deleting ? `${digits.slice(0, 2)}-${digits.slice(2, 4)}` : `${digits.slice(0, 2)}-${digits.slice(2, 4)}${monStr}-`;
  if (digits.length > 2) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
  if (digits.length === 2) return deleting ? digits : `${digits}-`;
  return digits;
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

// Exact (fractional) age in years from a DOB — whole years plus the
// fraction of the current year since the last birthday. Only the
// education ladder uses it (HSC below 23.5, Graduate below 25.5, PG
// below 27.5); everything else keeps whole years from
// calculateAgeYears. Pure function, so it is easy to test.
function calculateAgeFractional(rawDob) {
  const whole = calculateAgeYears(rawDob);
  if (whole === null || whole < 0) return null;
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
  let lastBday = new Date(today.getFullYear(), mm - 1, dd);
  if (lastBday > today) lastBday = new Date(today.getFullYear() - 1, mm - 1, dd);
  const nextBday = new Date(lastBday.getFullYear() + 1, mm - 1, dd);
  const span = nextBday - lastBday;
  if (!span || span <= 0) return whole;
  const age = whole + (today - lastBday) / span;
  return age >= 0 && age < 130 ? age : null;
}

function dobToSortable(dobStr) {
  const clean = String(dobStr || '').replace(/\[.*?\]/g, '');
  const dmy = clean.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  return dmy ? `${dmy[3]}-${dmy[2]}-${dmy[1]}` : String(dobStr || '');
}

// NID/BRN digit checker (v4.9.47): the site's own checkNumber rule —
// NID: 10 digits not starting with 0, or 17 digits starting 19/20;
// BRN: 17 digits starting 19/20 only. A 13-digit old NID fails the
// site rule, so it is converted by prepending the birth year from the
// person's DOB (13 + 4 = 17 digits, starting 19/20 — which passes).
// Returns { value, ok, warning } — `value` is the (possibly converted)
// digits, `warning` is '' when the number is fine, otherwise a short
// Bangla message for the card. Pure function, so it is easy to test.
function idBirthYear(rawDob) {
  const clean = toEnglishDigits(String(rawDob || '')).replace(/\[.*?\]/g, '').trim();
  if (!clean) return null;
  let yyyy = null;
  const dmy = clean.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (dmy) yyyy = Number(dmy[3]);
  else {
    const ymd = clean.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
    if (ymd) yyyy = Number(ymd[1]);
  }
  return (yyyy !== null && yyyy >= 1900 && yyyy <= 2099) ? String(yyyy) : null;
}

function checkIdNumber(rawId, rawDob, docType) {
  const digits = toEnglishDigits(String(rawId || '')).replace(/\s+/g, '');
  if (!digits) return { value: '', ok: false, warning: '' };
  const isBrn = String(docType || '').toUpperCase().trim() === 'BRN';
  if (!isBrn && /^[1-9][0-9]{9}$/.test(digits)) return { value: digits, ok: true, warning: '' };
  if (/^(19|20)[0-9]{15}$/.test(digits)) return { value: digits, ok: true, warning: '' };
  if (/^[0-9]{13}$/.test(digits)) {
    const y = idBirthYear(rawDob);
    if (y) return { value: y + digits, ok: true, warning: '' };
    return { value: digits, ok: false, warning: '১৩ সংখ্যার NID — জন্মসাল লাগবে (DOB দিন)' };
  }
  if (isBrn) return { value: digits, ok: false, warning: 'BRN ১৭ সংখ্যা হতে হবে (১৯/২০ দিয়ে শুরু)' };
  return { value: digits, ok: false, warning: 'NID ভুল — ১০ বা ১৭ সংখ্যা হতে হবে' };
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
  if (/\b(?:md|mohd|mohammad|muhammad|hossain|husain|hossen|rahman|uddin|ahammad|ali|mia|miah|hasan|hassan|abdul|abul|chandra|kumar)\b|মোঃ|মো:|মুহাম্মদ|মোহাম্মদ|হোসেন|হুসাইন|রহমান|উদ্দিন|আহম্মদ|আলী|মিয়া|মিয়া|হাসান|আব্দুল|আবদুল|আবুল|চন্দ্র|কুমার/i.test(combined)) {
    return 'Male';
  }
  // 3. Explicit gender fallback from card
  const g = String(explicitGender || '').trim().toLowerCase();
  if (g === 'female' || g === '2' || g === 'f' || g === 'মহিলা' || g === 'নারী') return 'Female';
  if (g === 'male' || g === '1' || g === 'm' || g === 'পুরুষ') return 'Male';
  return 'Male';
}

// Gender from a name, strict: 'Male' / 'Female' / null. Same markers
// as inferGender, but NO default — when the name carries no marker
// it returns null so the panel leaves the gender blank for the user
// to pick, instead of guessing Male (v4.9.37).
function detectGenderFromName(nameEn, nameBn) {
  const combined = `${nameEn || ''} ${nameBn || ''}`;
  if (/\b(?:mst|mosammat|mosa|mosha|begum|khatun|akter|akhter|bibi|parvin|pervin|sultana|jahan|nahar|yasmin|sharmin|nasrin|fatema|ayesha|khadija|rani|bala|devi|kumari)\b|মোছা|মোসা|বেগম|খাতুন|আক্তার|বিবি|পারভীন|সুলতানা|জাহান|নাহার|ইয়াসমিন|শারমিন|নাসরিন|ফাতেমা|আয়েশা|খাদিজা|রানী|রাণী|বালা|দেবী|কুমারী/i.test(combined)) {
    return 'Female';
  }
  if (/\b(?:md|mohd|mohammad|muhammad|hossain|husain|hossen|rahman|uddin|ahammad|ali|mia|miah|hasan|hassan|abdul|abul|chandra|kumar)\b|মোঃ|মো:|মুহাম্মদ|মোহাম্মদ|হোসেন|হুসাইন|রহমান|উদ্দিন|আহম্মদ|আলী|মিয়া|মিয়া|হাসান|আব্দুল|আবদুল|আবুল|চন্দ্র|কুমার/i.test(combined)) {
    return 'Male';
  }
  return null;
}

// Head change — relation recalculation (v4.9.37). Every member's
// relation is stored relative to the head, so a new head means every
// relation is recomputed. The table is keyed by the NEW head's
// relation to the OLD head, then by the member's relation to the OLD
// head. A value is the new relation, a function resolves it from the
// genders (gM = member, gH = new head, gO = old head), and null (or
// a missing entry) means "cannot derive — the panel asks the user to
// pick". Non-kinship roles (Other Relative, Non-Relative, Paid
// Domestic Worker) carry over unchanged.
const RELATION_RECALC = {
  'Wife': {
    'Self': 'Husband', 'Son': 'Son', 'Daughter': 'Daughter',
    'Father': 'Father-in-law', 'Mother': 'Mother-in-law',
    'Father-in-law': 'Father', 'Mother-in-law': 'Mother',
    'Brother': 'Brother-in-law', 'Sister': 'Sister-in-law',
    'Daughter-in-law': 'Daughter-in-law',
    'Grandson': 'Grandson', 'Granddaughter': 'Granddaughter',
    'Son-in-law': 'Son-in-law',
    'Brother-in-law': 'Brother', 'Sister-in-law': 'Sister'
  },
  'Husband': {
    'Self': 'Wife', 'Son': 'Son', 'Daughter': 'Daughter',
    'Father': 'Father-in-law', 'Mother': 'Mother-in-law',
    'Father-in-law': 'Father', 'Mother-in-law': 'Mother',
    'Brother': 'Brother-in-law', 'Sister': 'Sister-in-law',
    'Daughter-in-law': 'Daughter-in-law',
    'Grandson': 'Grandson', 'Granddaughter': 'Granddaughter',
    'Son-in-law': 'Son-in-law',
    'Brother-in-law': 'Brother', 'Sister-in-law': 'Sister'
  },
  'Son': {
    'Self': (gM, gH, gO) => (gO === 'Female' ? 'Mother' : 'Father'),
    'Husband': 'Father', 'Wife': 'Mother',
    'Son': 'Brother', 'Daughter': 'Sister',
    'Father': 'Grandfather', 'Mother': 'Grandmother',
    'Father-in-law': 'Grandfather', 'Mother-in-law': 'Grandmother',
    'Son-in-law': 'Brother-in-law'
  },
  'Daughter': {
    'Self': (gM, gH, gO) => (gO === 'Female' ? 'Mother' : 'Father'),
    'Husband': 'Father', 'Wife': 'Mother',
    'Son': 'Brother', 'Daughter': 'Sister',
    'Father': 'Grandfather', 'Mother': 'Grandmother',
    'Father-in-law': 'Grandfather', 'Mother-in-law': 'Grandmother',
    'Son-in-law': 'Brother-in-law'
  },
  'Father': {
    'Self': (gM, gH, gO) => (gO === 'Female' ? 'Daughter' : 'Son'),
    'Husband': 'Son-in-law', 'Wife': 'Daughter-in-law',
    'Son': 'Grandson', 'Daughter': 'Granddaughter',
    'Mother': 'Wife',
    'Brother': 'Son', 'Sister': 'Daughter',
    'Son-in-law': 'Son-in-law'
  },
  'Mother': {
    'Self': (gM, gH, gO) => (gO === 'Female' ? 'Daughter' : 'Son'),
    'Husband': 'Son-in-law', 'Wife': 'Daughter-in-law',
    'Son': 'Grandson', 'Daughter': 'Granddaughter',
    'Father': 'Husband',
    'Brother': 'Son', 'Sister': 'Daughter',
    'Son-in-law': 'Son-in-law'
  },
  // The user's example: head was the son's wife (ছেলের বউ), the new
  // head is the mother-in-law (শাশুড়ি). Old head -> Daughter-in-law
  // (182), son -> Son, grandchildren -> Grandson/Granddaughter,
  // father-in-law -> Husband.
  'Mother-in-law': {
    'Self': (gM, gH, gO) => (gO === 'Female' ? 'Daughter-in-law' : 'Son-in-law'),
    'Husband': 'Son',
    'Son': 'Grandson', 'Daughter': 'Granddaughter',
    'Father-in-law': 'Husband',
    'Brother-in-law': 'Son', 'Sister-in-law': 'Daughter'
  },
  'Father-in-law': {
    'Self': (gM, gH, gO) => (gO === 'Female' ? 'Daughter-in-law' : 'Son-in-law'),
    'Husband': 'Son',
    'Wife': 'Daughter-in-law',
    'Son': 'Grandson', 'Daughter': 'Granddaughter',
    'Mother-in-law': 'Wife',
    'Brother-in-law': 'Son', 'Sister-in-law': 'Daughter'
  }
};

function deriveRelationToNewHead(memberOldRel, memberGender, newHeadOldRel, newHeadGender, oldHeadGender) {
  if (!memberOldRel || !newHeadOldRel) return null;
  // Non-kinship roles describe the person's place, not a kinship to
  // the head — they carry over unchanged.
  if (memberOldRel === 'Other Relative' || memberOldRel === 'Non-Relative' || memberOldRel === 'Paid Domestic Worker') {
    return memberOldRel;
  }
  const row = RELATION_RECALC[newHeadOldRel];
  if (!row) return null;
  const v = row[memberOldRel];
  if (v === undefined || v === null) return null;
  if (typeof v === 'function') return v(memberGender, newHeadGender, oldHeadGender) || null;
  return v;
}

// For a head change: returns the old head's new relation and, for
// every other member (by original index), the derived new relation
// (null = cannot derive, the panel asks the user). The member at
// newHeadIdx becomes the head and is not in relsByIdx.
function recalculateRelationsForNewHead(oldHead, members, newHeadIdx) {
  const newHead = members[newHeadIdx];
  if (!newHead) return null;
  const newHeadOldRel = newHead.relation || null;
  const gH = newHead.gender || null;
  const gO = oldHead.gender || null;
  const oldHeadNewRel = deriveRelationToNewHead('Self', gO, newHeadOldRel, gH, gO);
  const relsByIdx = {};
  members.forEach((m, i) => {
    if (i === newHeadIdx) return;
    relsByIdx[i] = deriveRelationToNewHead(m.relation, m.gender, newHeadOldRel, gH, gO);
  });
  return { oldHeadNewRel, relsByIdx };
}
function inferHouseholdReligion(peopleList) {
  const allNames = peopleList.map(p =>
    `${p?.name_bn || ''} ${p?.name_en || ''} ${p?.father_name_bn || ''} ${p?.father_name_en || ''} ${p?.mother_name_bn || ''} ${p?.mother_name_en || ''}`
  ).join(' ');

  const muslimRegex = /\b(?:md|mohd|mohammad|muhammad|mst|mosammat|mosa|mosha|khatun|begum|hossain|husain|hossen|islam|rahman|rahim|karim|uddin|ahmed|ahammad|ali|mia|miah|akter|akhter|sheikh|kazi|khandaker|sultana|parvin|bibi|hasan|hassan|abdul|abul|molla|mollah|fatema|ayesha|khadija|jahan|nahar)\b|মোঃ|মো:|মোছাঃ|মোসাঃ|মোছা|মোসা|খাতুন|হোসেন|হুসাইন|ইসলাম|বেগম|আক্তার|রহমান|রহিম|করিম|উদ্দিন|আহমেদ|আহম্মদ|আলী|মিয়া|মিয়া|শেখ|কাজী|খন্দকার|সুলতানা|পারভীন|বিবি|হাসান|আব্দুল|আবদুল|আবুল|মোল্লা|মুহাম্মদ|মোহাম্মদ|ফাতেমা|আয়েশা|খাদিজা|জাহান|নাহার/i;

  if (muslimRegex.test(allNames)) return 'Islam';

  const hinduRegex = /\b(?:chandra|kumar|rani|bala|devi|chakraborty|bhattacharya|chatterjee|mukherjee|banerjee|barman|ghosh|bose)\b|চন্দ্র|কুমার|রানী|রাণী|বালা|দেবী|চক্রবর্তী|ভট্টাচার্য|চ্যাটার্জী|মুখার্জী|ব্যানার্জী|বর্মন|ঘোষ|বসু/i;

  if (hinduRegex.test(allNames)) return 'Hinduism';

  return 'Islam';
}

function formatEnglishName(rawName) {
  if (!rawName) return '';
  let s = String(rawName).trim().replace(/\s+/g, ' ');
  s = s.replace(/^(?:mosha|mosa|most|mst|mosammat|musammat|মোছাঃ|মোসাঃ|মোছা|মোসা)[:.]?\s+/i, 'MST. ');
  // A bare prefix (v4.9.55): মোসাঃ on its own is MST., not MOSAH.
  s = s.replace(/^(?:mosha|mosa|most|mst|mosammat|musammat|মোছাঃ|মোসাঃ|মোছা|মোসা)[:.]?$/i, 'MST.');
  s = s.replace(/^(?:md|mohd|मोঃ|মোঃ|মো)[:.]?\s+/i, 'MD. ');
  s = s.replace(/^(?:md|mohd|मोঃ|মোঃ|মো)[:.]?$/i, 'MD.');
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

// --- DOB derivation: pure helpers (v4.9.39) ---
// The same age / gender / relation rules the injector uses on Auto-Fill,
// run live in the panel when a DOB is typed so the user sees the
// defaults before filling. A derived value only ever fills a BLANK
// field — a value the user picked by hand is never overwritten.
// Education for a 27.5+ person is left blank (no age guess): the
// education popup asks for those on Auto-Fill instead, and a filled
// value would stop it asking. Everyone below 27.5 gets the ladder
// value shown on their card, and the user corrects it by hand from
// the default via the card dropdown.
const MARRIED_RELATIONS_PANEL = ['Husband', 'Wife', 'Father', 'Mother', 'Father-in-law', 'Mother-in-law', 'Son-in-law', 'Daughter-in-law'];

// Fractional ladder (v4.9.47): `age` is the EXACT age in years —
// calculateAgeFractional(dob) — not whole years. The school bands
// below 18 still use whole years (a 10.7-year-old is still in
// Class 1-4), but the top bands switch mid-year: HSC below 23.5,
// Graduate 23.5–25.5 (honours finishes at 24, masters takes 1.2–1.8
// years in BD), Post Graduate 25.5–27.5, and blank from 27.5 — no
// Class 1-4 guess, the user picks it.
function educationIdForAge(age) {
  if (age === null || age === undefined || age < 0) return null;
  const whole = Math.floor(age);
  if (whole < 3) return 88;      // নিরক্ষর
  if (whole <= 5) return 188;    // Play/Nursery/KG/Pre-Primary
  if (whole === 6) return 189;   // Class 1
  if (whole <= 10) return 190;   // Class 1-4
  if (whole === 11) return 191;  // Class 5/PSC
  if (whole <= 13) return 192;   // Class 6-7
  if (whole === 14) return 89;   // JSC/8th
  if (whole === 15) return 193;  // Class 9
  if (whole < 18) return 90;     // SSC
  if (age < 23.5) return 91;     // HSC
  if (age < 25.5) return 92;     // Graduate
  if (age < 27.5) return 93;     // Post Graduate
  return null;                   // 27.5+ blank — no guess, the user picks it
}

// Profession for the head (type-34) or livelihood for a member
// (type-44). Adult male defaults to Farmer / Agriculture (v4.9.39 —
// the user chose কৃষিকাজ over দিনমজুর for their families).
function professionIdForAgeGender(age, gender, isHead) {
  if (age === null || age === undefined || age < 0) return null;
  if (age < 4) return isHead ? 110 : 275;   // little child: Others / Not Applicable
  if (age <= 24) return isHead ? 106 : 220; // student age: Student
  if (gender === 'Female') return isHead ? 181 : 225; // Housewife / Homemaker
  return isHead ? 151 : 210;                 // adult male: Farmer / Agriculture
}

// Spouse-presence marital inference (v4.9.47): a Son is married when
// the household has his wife (a Daughter-in-law), a Daughter when it
// has her husband (a Son-in-law). Only when there is exactly ONE son
// / daughter — with several, nobody knows which one is married, so
// they stay Unmarried and the user picks it by hand. `members` is the
// panel's family_members list. Returns { son, daughter }.
function spousePresenceFlags(members) {
  const list = Array.isArray(members) ? members : [];
  const count = (rel) => list.filter((m) => m && m.relation === rel).length;
  return {
    son: count('Daughter-in-law') > 0 && count('Son') === 1,
    daughter: count('Son-in-law') > 0 && count('Daughter') === 1
  };
}

function maritalIdForAgeGenderRel(age, gender, relation, isHead, hasSpouse, flags) {
  if (age === null || age === undefined || age < 0) return null;
  if (age < 18) return 102; // Unmarried
  // Head: Married / বিবাহিত (101) is the default, with or without a
  // spouse listed yet — the head is married in almost every family
  // here, and the spouse is added by hand afterwards. (Blank was
  // tried in v4.9.44 and reverted: with a blank marital the site
  // hides the spouse-name field and the injector skips the spouse
  // name, so nothing got added when Husband was selected.) A real
  // widow / widower is picked by hand (a hand-picked value is never
  // overwritten).
  if (isHead) return 101; // Married
  if (MARRIED_RELATIONS_PANEL.includes(relation) || relation === 'Head/Self') return 101; // Married
  // Spouse-presence (v4.9.47): a Daughter-in-law in the household
  // proves the (only) Son is married; a Son-in-law proves the (only)
  // Daughter is. Age alone never makes anyone married.
  if (flags && flags.son && relation === 'Son') return 101; // Married
  if (flags && flags.daughter && relation === 'Daughter') return 101; // Married
  return 102; // Unmarried
}

// The three derived ids for one person, or null per field.
// `ageFrac` is the exact age (calculateAgeFractional) — the education
// ladder reads it; when it is not given, the whole-year `age` is used
// (the old whole-year behaviour). `flags` is spousePresenceFlags().
function derivedIdsFor(age, gender, relation, isHead, hasSpouse, ageFrac, flags) {
  if (age === null || age === undefined || age < 0) return { education: null, profession: null, marital: null };
  const education = educationIdForAge(ageFrac !== undefined && ageFrac !== null ? ageFrac : age);
  const profession = professionIdForAgeGender(age, gender, isHead);
  const marital = maritalIdForAgeGenderRel(age, gender, relation, isHead, hasSpouse, flags);
  return { education, profession, marital };
}

function isBlankVal(v) {
  return v === undefined || v === null || String(v).trim() === '';
}

// Fill a record's blank education / profession / marital from its DOB.
// isHead: the head uses the type-34 profession list and the
// `profession` + `marital_status` keys; a member uses the type-44
// livelihood list and `livelihood_profession_id` + `maritial_status_id`.
// Returns the keys that were filled, so the caller can refresh the
// matching selects in place.
function deriveFromDob(targetObj, isHead, hasSpouse, flags) {
  const filled = [];
  if (!targetObj) return filled;
  const age = calculateAgeYears(targetObj.dob);
  if (age === null || age < 0) return filled;
  const ageFrac = calculateAgeFractional(targetObj.dob);
  const ids = derivedIdsFor(age, targetObj.gender, isHead ? 'Head/Self' : (targetObj.relation || ''), isHead, hasSpouse, ageFrac, flags);
  if (ids.education !== null && isBlankVal(targetObj.education_status_id)) {
    targetObj.education_status_id = ids.education; filled.push('education_status_id');
  }
  if (isHead) {
    if (ids.profession !== null && isBlankVal(targetObj.profession)) { targetObj.profession = ids.profession; filled.push('profession'); }
  } else {
    if (ids.profession !== null && isBlankVal(targetObj.livelihood_profession_id)) { targetObj.livelihood_profession_id = ids.profession; filled.push('livelihood_profession_id'); }
  }
  if (ids.marital !== null) {
    if (isHead) {
      if (isBlankVal(targetObj.marital_status)) { targetObj.marital_status = ids.marital; targetObj.maritial_status_id = ids.marital; filled.push('marital_status'); }
    } else {
      if (isBlankVal(targetObj.maritial_status_id)) { targetObj.maritial_status_id = ids.marital; targetObj.marital_status = ids.marital; filled.push('marital_status'); }
    }
  }
  return filled;
}

// Apply a re-derivation: for each field, if it is blank or still holds
// the OLD derivation (it was auto-filled, not hand-picked), set it to
// the NEW derivation — or clear it when the new age/relation has no
// derivation (a 27.5+ person's education, so the popup asks). A
// hand-picked value differs from the old derivation and is left alone.
// Returns the changed keys.
function applyDerivedChange(targetObj, oldIds, newIds, isHead) {
  if (!targetObj || !oldIds || !newIds) return [];
  const changed = [];
  const maybe = (key, oldVal, newVal) => {
    const cur = targetObj[key];
    const blank = isBlankVal(cur);
    const wasDerived = oldVal !== null && oldVal !== undefined && !blank && Number(cur) === Number(oldVal);
    if (!blank && !wasDerived) return; // hand-picked — leave alone
    if (newVal === null || newVal === undefined) {
      if (wasDerived) { targetObj[key] = undefined; changed.push(key); }
      return;
    }
    if (Number(cur) !== Number(newVal)) { targetObj[key] = Number(newVal); changed.push(key); }
  };
  maybe('education_status_id', oldIds.education, newIds.education);
  if (isHead) maybe('profession', oldIds.profession, newIds.profession);
  else maybe('livelihood_profession_id', oldIds.profession, newIds.profession);
  if (isHead) maybe('marital_status', oldIds.marital, newIds.marital);
  else maybe('maritial_status_id', oldIds.marital, newIds.marital);
  // Keep the two marital spellings in sync.
  if (changed.includes('marital_status') && isHead) targetObj.maritial_status_id = targetObj.marital_status;
  if (changed.includes('maritial_status_id') && !isHead) targetObj.marital_status = targetObj.maritial_status_id;
  return changed;
}

// After a DOB change, re-derive the fields that still hold the OLD
// age's derived value (they were auto-filled, not hand-picked).
// `oldAgeFrac` is the exact age before the change — the old education
// was derived from it, so the comparison must use it too (a whole-year
// old age would misread a 23.7-year-old's Graduate as hand-picked).
function rederiveFromDobChange(targetObj, oldAge, isHead, hasSpouse, oldAgeFrac, flags) {
  if (!targetObj) return [];
  const newAge = calculateAgeYears(targetObj.dob);
  if (newAge === null || newAge < 0) return [];
  // No whole-year shortcut here: a DOB change inside one whole year
  // can still cross a fractional band (23.2 -> 23.7 is HSC -> Graduate).
  const newAgeFrac = calculateAgeFractional(targetObj.dob);
  const rel = isHead ? 'Head/Self' : (targetObj.relation || '');
  const oldIds = derivedIdsFor(oldAge, targetObj.gender, rel, isHead, hasSpouse, oldAgeFrac, flags);
  const newIds = derivedIdsFor(newAge, targetObj.gender, rel, isHead, hasSpouse, newAgeFrac, flags);
  return applyDerivedChange(targetObj, oldIds, newIds, isHead);
}

// After a relation change, re-derive the fields that still hold the
// derivation for the OLD relation (marital + profession depend on it).
function rederiveFromRelationChange(targetObj, oldRelation, isHead, hasSpouse, flags) {
  if (!targetObj) return [];
  const age = calculateAgeYears(targetObj.dob);
  if (age === null || age < 0) return [];
  const ageFrac = calculateAgeFractional(targetObj.dob);
  const newRel = isHead ? 'Head/Self' : (targetObj.relation || '');
  if (oldRelation === newRel) return [];
  const oldIds = derivedIdsFor(age, targetObj.gender, oldRelation, isHead, hasSpouse, ageFrac, flags);
  const newIds = derivedIdsFor(age, targetObj.gender, newRel, isHead, hasSpouse, ageFrac, flags);
  return applyDerivedChange(targetObj, oldIds, newIds, isHead);
}

// After a gender change, re-derive the profession (it depends on gender).
function rederiveFromGenderChange(targetObj, oldGender, isHead, hasSpouse, flags) {
  if (!targetObj) return [];
  const age = calculateAgeYears(targetObj.dob);
  if (age === null || age < 0) return [];
  if (oldGender === targetObj.gender) return [];
  const ageFrac = calculateAgeFractional(targetObj.dob);
  const rel = isHead ? 'Head/Self' : (targetObj.relation || '');
  const oldIds = derivedIdsFor(age, oldGender, rel, isHead, hasSpouse, ageFrac, flags);
  const newIds = derivedIdsFor(age, targetObj.gender, rel, isHead, hasSpouse, ageFrac, flags);
  return applyDerivedChange(targetObj, oldIds, newIds, isHead);
}

// A grandchild's father (v4.9.48): the head's Son, or the Son-in-law
// (the Daughter's husband — the father of the Daughter's children).
// Never the Husband: he is the grandfather, not the father. Names
// only — a member with no name typed yet is not a candidate.
function fatherCandidatesFor(data) {
  const out = [];
  if (!data || !Array.isArray(data.family_members)) return out;
  data.family_members.forEach((m) => {
    if (!m || (m.relation !== 'Son' && m.relation !== 'Son-in-law')) return;
    const name = (m.name_bn && String(m.name_bn).trim()) || (m.name_en && String(m.name_en).trim());
    if (name) out.push({ name, relation: m.relation });
  });
  return out;
}

// A son/daughter's parents: the mother is the female head (or the Wife
// member when the head is male); the father is the male head (or the
// Husband member when the head is female). Names only — no guessing.
function parentNamesFor(data) {
  let father = '', mother = '';
  const head = data && data.head;
  if (head) {
    if (head.gender === 'Male' && (head.name_bn || head.name_en)) father = head.name_bn || head.name_en;
    if (head.gender === 'Female' && (head.name_bn || head.name_en)) mother = head.name_bn || head.name_en;
  }
  if (Array.isArray(data && data.family_members)) {
    for (const m of data.family_members) {
      if (!father && m.relation === 'Husband' && (m.name_bn || m.name_en)) father = m.name_bn || m.name_en;
      if (!mother && m.relation === 'Wife' && (m.name_bn || m.name_en)) mother = m.name_bn || m.name_en;
    }
  }
  return { father, mother };
}

// Fill a son/daughter's blank father/mother names from the parents
// above. Never overwrites a name the user typed. Returns the member
// indexes that gained a name, so the caller can refresh those inputs.
function applyChildParentNames(data) {
  const changed = [];
  if (!data || !Array.isArray(data.family_members)) return changed;
  const parents = parentNamesFor(data);
  data.family_members.forEach((m, idx) => {
    if (m.relation !== 'Son' && m.relation !== 'Daughter') return;
    let did = false;
    if (parents.father && (!m.father_name_bn || !String(m.father_name_bn).trim())) { m.father_name_bn = parents.father; did = true; }
    if (parents.mother && (!m.mother_name_bn || !String(m.mother_name_bn).trim())) { m.mother_name_bn = parents.mother; did = true; }
    if (did) changed.push(idx);
  });
  // Grandchildren (v4.9.48): a Nati/Natni's father is one of the
  // candidates above. With exactly one candidate it is determined,
  // not a guess — fill it. With several, leave it blank: the card's
  // father-picker dropdown lets the user choose.
  const grandFathers = fatherCandidatesFor(data);
  data.family_members.forEach((m, idx) => {
    if (m.relation !== 'Grandson' && m.relation !== 'Granddaughter') return;
    if (grandFathers.length === 1 && (!m.father_name_bn || !String(m.father_name_bn).trim())) {
      m.father_name_bn = grandFathers[0].name;
      changed.push(idx);
    }
  });
  return changed;
}
// --- end DOB derivation pure helpers ---

// --- Bangla name -> Banglish transliteration (v4.9.40) ---
// Typing a Bangla name fills the matching English (Banglish) field.
// Pure functions, so they are easy to test. Orthographic
// transliteration: each consonant carries its inherent 'a' unless a
// vowel sign (kar), a hasanta (join) or a word-end follows. A
// word-final consonant that closes a conjunct (চন্দ্র) still takes
// the 'a' (CHANDRA), while a plain word-final consonant does not
// (করিম -> KARIM, আব্দুল -> ABDUL). Common name words the plain rule
// gets wrong are fixed by BN_NAME_FIXES (বেগম -> BEGUM, রহমান ->
// RAHMAN, পারভীন -> PARVIN). The result is always uppercase, and
// মোঃ / মোছাঃ become MD. / MST. like formatEnglishName. If the
// transliteration is wrong for a name, the user edits the EN field
// by hand — the panel never overwrites a hand-edited EN value.
const BN_NAME_FIXES = {
  'বেগম': 'BEGUM',
  'রহমান': 'RAHMAN',
  'পারভীন': 'PARVIN',
  'হোসেন': 'HOSSAIN',
  'হুসাইন': 'HUSSAIN',
  'মোহাম্মদ': 'MOHAMMAD',
  'মুহাম্মদ': 'MUHAMMAD',
  'কমল': 'KAMAL',
  'অমল': 'AMAL',
  'বিমল': 'BIMAL'
};
const BN_CONSONANT = {
  'ক': 'K', 'খ': 'KH', 'গ': 'G', 'ঘ': 'GH', 'ঙ': 'NG',
  'চ': 'CH', 'ছ': 'CH', 'জ': 'J', 'ঝ': 'JH', 'ঞ': 'N',
  'ট': 'T', 'ঠ': 'TH', 'ড': 'D', 'ঢ': 'DH', 'ণ': 'N',
  'ত': 'T', 'থ': 'TH', 'দ': 'D', 'ধ': 'DH', 'ন': 'N',
  'প': 'P', 'ফ': 'F', 'ব': 'B', 'ভ': 'BH', 'ম': 'M',
  'য': 'Y', 'র': 'R', 'ল': 'L', 'শ': 'SH', 'ষ': 'SH', 'স': 'S', 'হ': 'H',
  'ড়': 'R', 'ঢ়': 'RH', 'য়': 'Y', 'ৎ': 'T'
};
const BN_VOWEL = {
  'অ': 'A', 'আ': 'A', 'ই': 'I', 'ঈ': 'I', 'উ': 'U', 'ঊ': 'U',
  'ঋ': 'RI', 'এ': 'E', 'ঐ': 'OI', 'ও': 'O', 'ঔ': 'OU'
};
const BN_KAR = {
  'া': 'A', 'ি': 'I', 'ী': 'I', 'ু': 'U', 'ূ': 'U',
  'ৃ': 'RI', 'ে': 'E', 'ৈ': 'OI', 'ো': 'O', 'ৌ': 'OU'
};
const BN_SIGN = { 'ং': 'NG', 'ঃ': 'H', 'ঁ': 'N' };
const BN_HASANTA = '্';
const BN_NUKTA = '়';
// A nukta after a consonant changes its sound (য + ় = য়). The
// nukta is a separate code point, so it is handled here rather than
// as its own letter.
const BN_NUKTA_FORM = {
  'য': 'Y', 'ড': 'R', 'ঢ': 'RH', 'ক': 'Q', 'খ': 'KH',
  'গ': 'GH', 'জ': 'Z', 'ফ': 'F'
};

function transliterateBanglaWord(word) {
  if (!word) return '';
  if (BN_NAME_FIXES[word]) return BN_NAME_FIXES[word];
  const chs = [...word];
  let out = '';
  for (let i = 0; i < chs.length; i++) {
    const ch = chs[i];
    const prev = chs[i - 1];
    if (BN_CONSONANT[ch]) {
      // A nukta right after the consonant changes its sound.
      let base = BN_CONSONANT[ch];
      let j = i + 1;
      if (chs[j] === BN_NUKTA) {
        base = BN_NUKTA_FORM[ch] || base;
        j++;
      }
      const next = chs[j];
      if (next && BN_KAR[next]) { out += base + BN_KAR[next]; i = j; }
      else if (next === BN_HASANTA) { out += base; i = j; }
      else if (next && BN_SIGN[next]) { out += base + 'A' + BN_SIGN[next]; i = j; }
      else if (!next) { out += base + (prev === BN_HASANTA ? 'A' : ''); }
      // A consonant in the middle of a word, followed by another
      // consonant, drops its inherent 'a' (Bengali schwa deletion:
      // শারমিন -> SHARMIN, সুলতানা -> SULTANA). Only a word-initial
      // consonant keeps it (করিম -> KARIM). Sanskrit-derived names
      // that keep it (কমল -> KAMAL) live in BN_NAME_FIXES.
      else { out += base + (i === 0 ? 'A' : ''); }
    } else if (BN_VOWEL[ch]) {
      out += BN_VOWEL[ch];
    } else if (BN_KAR[ch]) {
      out += BN_KAR[ch];
    } else if (BN_SIGN[ch]) {
      out += BN_SIGN[ch];
    } else if (ch === BN_HASANTA || ch === BN_NUKTA) {
      // stray hasanta / nukta — skip
    } else if (/[A-Za-z0-9]/.test(ch)) {
      out += ch;
    } else if (ch === '.' || ch === '-') {
      out += ch;
    }
    // other punctuation is dropped
  }
  return out;
}

function transliterateBanglaToEnglish(bn) {
  if (!bn) return '';
  let s = String(bn).trim().replace(/\s+/g, ' ');
  if (!s) return '';
  // মোঃ / মোছাঃ prefixes become MD. / MST. (same as formatEnglishName).
  // A bare prefix (v4.9.55): মোসাঃ typed alone — no following name
  // yet — is MST. too, not the orthographic MOSAH. Same for মোঃ.
  let prefix = '';
  const mstM = s.match(/^(?:মোছাঃ|মোসাঃ|মোছা|মোসা)[:.]?(?:\s+|$)/);
  const mdM = s.match(/^(?:মোঃ|মো)[:.]?(?:\s+|$)/);
  if (mstM) { prefix = 'MST. '; s = s.slice(mstM[0].length); }
  else if (mdM) { prefix = 'MD. '; s = s.slice(mdM[0].length); }
  const words = s.split(' ').map((w) => transliterateBanglaWord(w)).filter(Boolean);
  return (prefix + words.join(' ')).replace(/\s+/g, ' ').trim().toUpperCase();
}
// --- end Bangla name -> Banglish transliteration ---

// --- Household count groups (v4.9.40) ---
// Who is counted in each group, so the user can verify the counts.
// Pure helpers: the breakdown is shown under the Household Counts
// card, and the hand-typed count (count_overrides) is shown next to
// the auto count when they differ.
function householdCountGroups(data) {
  const people = [];
  if (data.head && (data.head.nid || data.head.name_bn || data.head.name_en || data.head.dob)) {
    people.push({ ...data.head, _isHead: true });
  }
  if (Array.isArray(data.family_members)) {
    data.family_members.forEach((m) => people.push({ ...m, _isHead: false }));
  }
  const label = (p) => p.name_bn || p.name_en || (p._isHead ? 'প্রধান' : (p.relation || 'সদস্য'));
  const males = people.filter((p) => (p.gender || '').toLowerCase() === 'male');
  const females = people.filter((p) => (p.gender || '').toLowerCase() === 'female');
  const children = people.filter((p) => {
    const a = calculateAgeYears(p.dob);
    return a !== null && a >= 0 && a < 18;
  });
  return {
    total: people.length || 1,
    male: males.map(label),
    female: females.map(label),
    children: children.map(label)
  };
}

function countBreakdownHtml(data) {
  const groups = householdCountGroups(data);
  const overrides = (data.form_defaults && data.form_defaults.count_overrides) || {};
  const line = (label, names, auto, key) => {
    // A group with nobody in it says nothing (v4.9.41) — the counts
    // are already on the pills, so "অটো 0 জন: কেউ নেই" is just noise.
    // Only groups that actually have members are listed.
    if (!names.length) return '';
    const eff = overrides[key];
    const effNote = (eff !== undefined && eff !== null && eff !== auto) ? `, হাতে লেখা ${eff} জন` : '';
    return `<div>${label} — অটো ${auto} জন${effNote}: ${names.join(', ')}</div>`;
  };
  return [
    line('পুরুষ', groups.male, groups.male.length, 'male_count'),
    line('মহিলা', groups.female, groups.female.length, 'female_count'),
    line('শিশু (<18)', groups.children, groups.children.length, 'children_under_18')
  ].filter(Boolean).join('');
}
// --- end household count groups ---

function recalculateHouseholdSummary(data) {
  if (!data) return;
  const allPeople = [];
  if (data.head && (data.head.nid || data.head.name_bn || data.head.name_en || data.head.dob)) {
    // Gender from the name (v4.9.37): typing মোঃ / মোছাঃ fills the
    // gender live, the same way the religion already fills. Only when
    // the gender is blank — a gender the user picked by hand is never
    // overwritten, and a name with no marker leaves it blank.
    if ((!data.head.gender || !GENDER_ID_MAP[data.head.gender]) && (data.head.name_bn || data.head.name_en)) {
      const dg = detectGenderFromName(data.head.name_en, data.head.name_bn);
      if (dg) data.head.gender = dg;
    }
    data.head.age = calculateAgeYears(data.head.dob);
    data.head.gender_id = GENDER_ID_MAP[data.head.gender] || 2;
    allPeople.push(data.head);
  }
  if (Array.isArray(data.family_members)) {
    data.family_members.forEach((m) => {
      if ((!m.gender || !GENDER_ID_MAP[m.gender]) && (m.name_bn || m.name_en)) {
        const dg = detectGenderFromName(m.name_en, m.name_bn);
        if (dg) m.gender = dg;
      }
      m.age = calculateAgeYears(m.dob);
      m.is_child_under_18 = m.age !== null && m.age < 18;
      m.gender_id = GENDER_ID_MAP[m.gender] || 1;
      allPeople.push(m);
    });
  }

  // DOB derivation (v4.9.39): fill a blank education / profession /
  // marital from the DOB, using the same rules the injector uses on
  // Auto-Fill. Runs here so it happens on every change (typing a DOB,
  // a Pull, an AI extract) and stays in sync. A son/daughter's blank
  // father/mother names come from the head + spouse. Only blank fields
  // are filled — a hand-picked value is never overwritten.
  const hasSpouse = Array.isArray(data.family_members) && data.family_members.some((m) => m.relation === 'Husband' || m.relation === 'Wife');
  const flags = spousePresenceFlags(data.family_members);
  if (data.head && (data.head.nid || data.head.name_bn || data.head.name_en || data.head.dob)) {
    // Remember the age the fields were derived from (v4.9.54): a
    // wrong year fills wrong values, and only this age identifies
    // that derivation when the year is corrected later.
    if (deriveFromDob(data.head, true, hasSpouse, flags).length) {
      dobDerivedAge.set(data.head, { age: calculateAgeYears(data.head.dob), ageFrac: calculateAgeFractional(data.head.dob) });
    }
  }
  if (Array.isArray(data.family_members)) {
    data.family_members.forEach((m) => {
      if (deriveFromDob(m, false, hasSpouse, flags).length) {
        dobDerivedAge.set(m, { age: calculateAgeYears(m.dob), ageFrac: calculateAgeFractional(m.dob) });
      }
    });
  }
  applyChildParentNames(data);

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
  // Count by the gender string only (v4.9.37): a member whose gender
  // is still blank (a hand-added member with no marker in the name)
  // must not be counted as Male just because gender_id defaults to 1.
  // AI-extracted and pulled members always carry a gender string, so
  // their counts are unchanged.
  const maleCount = allPeople.filter(p => (p.gender || '').toLowerCase() === 'male').length;
  const femaleCount = allPeople.filter(p => (p.gender || '').toLowerCase() === 'female').length;
  const otherGenderCount = allPeople.filter(p => (p.gender || '').toLowerCase() === 'other').length;
  const childrenUnder18 = allPeople.filter((p) => {
    const a = calculateAgeYears(p.dob);
    return a !== null && a >= 0 && a < 18;
  }).length;

  const finalReligion = data.head?.religion || detectedReligion || 'Islam';
  const finalReligionId = RELIGION_ID_MAP[finalReligion] || 1;

  // Rebuilding form_defaults from scratch used to wipe user choices
  // that live there (the education popup's head_options pick, PMT /
  // program overrides) — the popup then asked again on every Auto-Fill.
  // Keep them across the rebuild.
  const prevDefaults = data.form_defaults || {};
  // Hand-typed counts (v4.9.40): a count the user typed by hand in
  // the summary card is stored in form_defaults.count_overrides and
  // wins over the auto count on every rebuild — before this, the
  // rebuild wiped the hand-typed value back to the auto count on the
  // next change.
  const prevOverrides = (prevDefaults.count_overrides && typeof prevDefaults.count_overrides === 'object') ? prevDefaults.count_overrides : {};
  const effTotal = Number.isFinite(prevOverrides.total_members) ? prevOverrides.total_members : totalMembers;
  const effMale = Number.isFinite(prevOverrides.male_count) ? prevOverrides.male_count : maleCount;
  const effFemale = Number.isFinite(prevOverrides.female_count) ? prevOverrides.female_count : femaleCount;
  const effChildren = Number.isFinite(prevOverrides.children_under_18) ? prevOverrides.children_under_18 : childrenUnder18;
  // MFS (v4.9.49): the head's MFS pick fills PMT field 138 via
  // form_defaults.program_fields — the injector's existing override
  // path. Other program-field overrides are preserved; clearing the
  // pick drops 138 so the old value stops filling.
  const prevProgFields = (prevDefaults.program_fields && typeof prevDefaults.program_fields === 'object') ? { ...prevDefaults.program_fields } : {};
  const headMfs = Number(data.head && data.head.mfs_provider_id) || 0;
  if (headMfs) prevProgFields['138'] = headMfs; else delete prevProgFields['138'];
  data.form_defaults = {
    total_members: effTotal,
    male_count: effMale,
    female_count: effFemale,
    other_gender_count: 0,
    bidesh_count: 0,
    children_under_18: effChildren,
    religion: finalReligion,
    religion_id: finalReligionId,
    religion_label: RELIGION_OPTIONS.find(r => r.value === finalReligion)?.label || 'ইসলাম (Islam)',
    village: areaPresets.village || '',
    ward_no: areaPresets.ward_no || '',
    post_code: areaPresets.post_code || '',
    is_ethnic: Number(areaPresets.is_ethnic ?? 0),
    khudro_nrigosthi_label: Number(areaPresets.is_ethnic) === 1 ? 'হ্যাঁ (Yes)' : 'না (No)',
    area_type_id: Number(areaPresets.area_type_id ?? 1),
    area_type_label: AREA_TYPE_OPTIONS.find(a => a.value === Number(areaPresets.area_type_id || 1))?.label || 'পল্লী / ইউনিয়ন (Polli / Union)',
    ...(Object.keys(prevOverrides).length ? { count_overrides: prevOverrides } : {}),
    ...(prevDefaults.head_options ? { head_options: prevDefaults.head_options } : {}),
    ...(prevDefaults.pmt ? { pmt: prevDefaults.pmt } : {}),
    ...(Object.keys(prevProgFields).length ? { program_fields: prevProgFields } : {}),
    ...(prevDefaults.member_options ? { member_options: prevDefaults.member_options } : {})
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
  const bdEl = $('fcCountBreakdown');
  if (bdEl) {
    const bdHtml = countBreakdownHtml(data);
    bdEl.innerHTML = bdHtml;
    bdEl.style.display = bdHtml ? '' : 'none';
  }
}

function syncJsonOutput() {
  if (!state.lastExtracted) return;
  recalculateHouseholdSummary(state.lastExtracted);
  $('rawJsonOutput').textContent = JSON.stringify(state.lastExtracted, null, 2);
  saveSessionState();
}

function addImage(category, base64, name, source) {
  // source: 'upload' (file / import — the crop editor auto-scans it) or
  // 'camera' (in-panel capture — a green lock straightens the shot on
  // Capture, so the crop editor never auto-scans it).
  state[category].push({ id: nextId++, base64, name: name || 'Card.jpg', relation: 'Auto', boundRef: null, boundRefs: [], source: source || 'upload' });
  renderPreviews(category);
  saveSessionState();
}

// Downscale a base64 JPEG for keeping as the pre-crop original. The crop
// editor outputs at most 900px wide, so a 1000px original is more than
// enough for a re-crop — and it keeps the saved session small.
function downscaleBase64(b64, maxDim = 1000, quality = 0.78) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      if (scale >= 1) { resolve(b64); return; }
      const cv = document.createElement('canvas');
      cv.width = Math.max(1, Math.round(img.width * scale));
      cv.height = Math.max(1, Math.round(img.height * scale));
      cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
      resolve(cv.toDataURL('image/jpeg', quality).split(',')[1] || b64);
    };
    img.onerror = () => resolve(b64);
    img.src = `data:image/jpeg;base64,${b64}`;
  });
}

function removeImage(category, id) {
  state[category] = state[category].filter((item) => item.id !== id);
  renderPreviews(category);
  saveSessionState();
}

// Which list ('head' / 'other') an item lives in, or null.
function itemCategory(item) {
  if (!item) return null;
  if (state.head.includes(item)) return 'head';
  if (state.other.includes(item)) return 'other';
  return null;
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

// NID/BRN digit warning (v4.9.47): the site rejects a wrong-length
// ID, so the card flags it — amber + a Bangla reason on hover —
// instead of failing silently on the form. Runs after toggleWarning,
// so it wins for an ID field. A 13-digit NID with no DOB yet warns
// that the birth year is needed; once the DOB is typed the blur
// handler converts it and the warning clears.
function toggleIdWarning(el, targetObj, key) {
  if (!el || !targetObj) return;
  const chk = checkIdNumber(targetObj[key], targetObj.dob, targetObj.doc_type);
  el.title = chk.warning || '';
  if (chk.warning) el.classList.add('field-warning');
  else if (el.value && el.value.trim() !== '') el.classList.remove('field-warning');
}

// Mobile number check (v4.9.49): the site accepts English digits only,
// 11 digits starting with 01 (app.ea9222ad mobile rule — Bangla digits
// are rejected with "Mobile must contain only English digits"). The
// panel converts Bangla digits on blur, like the NID.
function checkMobileNumber(raw) {
  const v = toEnglishDigits(String(raw || '')).replace(/\D+/g, '');
  if (!v) return { value: '', warning: '' };
  if (!/^01[0-9]{9}$/.test(v)) return { value: v, warning: 'সঠিক মোবাইল নম্বর দিন (০১ দিয়ে শুরু, ১১ সংখ্যা)' };
  return { value: v, warning: '' };
}

// Convert a card's mobile number to English digits on blur (v4.9.49).
// Returns true when it changed anything.
function convertCardMobile(inputEl, targetObj) {
  if (!inputEl || !targetObj) return false;
  const chk = checkMobileNumber(targetObj.mobile_number);
  if (chk.value && chk.value !== targetObj.mobile_number) {
    targetObj.mobile_number = chk.value;
    inputEl.value = chk.value;
    return true;
  }
  return false;
}

// Mobile warning (v4.9.49): amber + a Bangla reason on hover, like the
// NID warning — a wrong-length number fails on the form otherwise.
function toggleMobileWarning(el, targetObj) {
  if (!el || !targetObj) return;
  const chk = checkMobileNumber(targetObj.mobile_number);
  el.title = chk.warning || '';
  if (chk.warning) el.classList.add('field-warning');
  else if (el.value && el.value.trim() !== '') el.classList.remove('field-warning');
}

// Records whose Doc Type the user picked by hand (v4.9.49): a hand
// pick wins over the 17-digit rule below, so a genuine 17-digit NID
// stays NID. WeakSet — it never enters the JSON.
const manualDocTypePicked = new WeakSet();
// 17-digit values that started life as a 13-digit NID (v4.9.49):
// the birth year was prepended, so they are NIDs, not BRNs. A Set of
// digit strings — it survives rebuilds, unlike a record flag.
const converted13NidValues = new Set();

// The age a record's derived fields were last based on (v4.9.54):
// deriveFromDob fills blank fields from the DOB as soon as it parses,
// so a wrong year leaves wrong values behind — correcting the year
// must re-derive them, and the only age that identifies the wrong
// derivation is the one it was filled from. WeakMap — it never enters
// the JSON.
const dobDerivedAge = new WeakMap();

// Convert a 13-digit NID on the card to 17 digits with the birth year
// (v4.9.47). Returns true when it changed anything — the caller then
// refreshes the input and the JSON. Only ever runs on blur / after a
// DOB change, never while typing (a 17-digit number passes through
// 13 digits mid-typing).
function convertCardIdNumber(inputEl, targetObj, key) {
  if (!inputEl || !targetObj) return false;
  // How many digits the user actually typed (before any conversion):
  // a 13-digit number is an old NID, so it must stay NID after the
  // conversion below — it is not a birth certificate.
  const rawDigits = toEnglishDigits(String(targetObj[key] || '')).replace(/\s+/g, '');
  const was13 = rawDigits.length === 13;
  const chk = checkIdNumber(targetObj[key], targetObj.dob, targetObj.doc_type);
  let changed = false;
  if (chk.value && chk.value !== targetObj[key]) {
    targetObj[key] = chk.value;
    inputEl.value = chk.value;
    changed = true;
    if (was13) converted13NidValues.add(chk.value);
  }
  // Manual 17-digit (v4.9.49): a 17-digit number typed by hand is
  // mainly a birth certificate (BRN) — few have a 17-digit NID. The
  // AI already gets this right, so this only fires on the card: when
  // the number is 17 digits and it did NOT come from a 13-digit NID,
  // flip the Doc Type to BRN. A hand-picked NID stays NID.
  const nowDigits = toEnglishDigits(String(targetObj[key] || '')).replace(/\s+/g, '');
  if (nowDigits.length === 17 && !was13 && !converted13NidValues.has(nowDigits)
      && (targetObj.doc_type === 'NID' || !targetObj.doc_type)
      && !manualDocTypePicked.has(targetObj)) {
    targetObj.doc_type = 'BRN';
    const card = inputEl.closest ? inputEl.closest('.record-card') : null;
    const docSel = card ? card.querySelector('select[data-field="doc_type"]') : null;
    if (docSel) docSel.value = 'BRN';
    changed = true;
  }
  return changed;
}

// Live 17-digit flip (v4.9.52): while typing, the moment the number
// reaches 17 digits the Doc Type becomes BRN automatically — the user
// does not have to leave the field first. Same guards as the blur
// flip: not a converted 13-digit NID, and a hand-picked NID stays
// NID — if the user personally selected NID for this 17-digit
// number, that is it, and the flip never overrides it.
function flipDocTypeLive(inputEl, targetObj, key) {
  if (!inputEl || !targetObj) return false;
  const digits = toEnglishDigits(String(targetObj[key] || '')).replace(/\s+/g, '');
  if (digits.length !== 17) return false;
  if (converted13NidValues.has(digits)) return false;
  if (manualDocTypePicked.has(targetObj)) return false;
  if (!(targetObj.doc_type === 'NID' || !targetObj.doc_type)) return false;
  targetObj.doc_type = 'BRN';
  const card = inputEl.closest ? inputEl.closest('.record-card') : null;
  const docSel = card ? card.querySelector('select[data-field="doc_type"]') : null;
  if (docSel) docSel.value = 'BRN';
  return true;
}

// Refresh a card's derived selects from its record, in place (no
// re-render, so the user does not lose focus). Called after a DOB /
// relation / gender change fills a derived value. Always syncs to the
// record — including a blank, when a re-derivation cleared the field
// (a 27.5+ person whose education goes back to blank so the popup asks).
function refreshDerivedSelects(cardContainer, targetObj, isHead) {
  if (!cardContainer || !targetObj) return;
  const setSel = (field, val) => {
    const sel = cardContainer.querySelector(`select[data-field="${field}"]`);
    if (!sel) return;
    sel.value = (val === undefined || val === null || String(val).trim() === '') ? '' : String(val);
    toggleWarning(sel);
  };
  setSel('education_status_id', targetObj.education_status_id);
  if (isHead) setSel('profession', targetObj.profession);
  else setSel('livelihood_profession_id', targetObj.livelihood_profession_id);
  setSel('marital_status', targetObj.marital_status !== undefined ? targetObj.marital_status : targetObj.maritial_status_id);
}

// Refresh every son/daughter card's father/mother name inputs from the
// current data, in place. Called after a parent's name is typed or a
// relation changes. Only an input that is currently empty is filled —
// a name the user typed stays.
// Rebuild a grandchild's father-picker options from the household
// right now (a Son's name may have been typed since the card was
// built). Keeps the pick that matches the record's father name.
function rebuildFatherPickOptions(sel, selectedName) {
  if (!sel) return;
  sel.replaceChildren();
  const blank = document.createElement('option');
  blank.value = '';
  blank.textContent = '— বাবা বেছে নিন —';
  sel.appendChild(blank);
  fatherCandidatesFor(state.lastExtracted).forEach((c) => {
    const o = document.createElement('option');
    o.value = c.name;
    o.textContent = `${c.name} (${c.relation})`;
    sel.appendChild(o);
  });
  const want = selectedName || '';
  sel.value = [...sel.options].some((o) => o.value === want) ? want : '';
}

function refreshChildParentInputs() {
  const data = state.lastExtracted;
  if (!data || !Array.isArray(data.family_members)) return;
  data.family_members.forEach((m, idx) => {
    const isChild = m.relation === 'Son' || m.relation === 'Daughter';
    const isGrand = m.relation === 'Grandson' || m.relation === 'Granddaughter';
    if (!isChild && !isGrand) return;
    const card = document.querySelector(`.record-card[data-member-idx="${idx}"]`);
    if (!card) return;
    const fIn = card.querySelector('input[data-field="father_name_bn"]');
    if (fIn && !fIn.value.trim() && m.father_name_bn) { fIn.value = m.father_name_bn; toggleWarning(fIn); }
    if (isChild) {
      const mIn = card.querySelector('input[data-field="mother_name_bn"]');
      if (mIn && !mIn.value.trim() && m.mother_name_bn) { mIn.value = m.mother_name_bn; toggleWarning(mIn); }
    }
    if (isGrand) {
      rebuildFatherPickOptions(card.querySelector('select[data-field="father_pick"]'), m.father_name_bn);
    }
  });
}

function createFieldControl(f, targetObj, onUpdateMeta, cardContainer, onChange) {
  const notifyChange = (key, value) => { if (typeof onChange === 'function') onChange(key, value); };
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
      const oldRel = targetObj.relation;
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
      // A new relation re-derives marital + profession (both depend on
      // it) for values that were auto-filled under the old relation;
      // hand-picked values stay. A Son/Daughter gains the parents'
      // names (the data fill runs in syncJsonOutput below).
      const isHead = state.lastExtracted && state.lastExtracted.head === targetObj;
      const hasSpouse = !!(state.lastExtracted && Array.isArray(state.lastExtracted.family_members) && state.lastExtracted.family_members.some((m) => m.relation === 'Husband' || m.relation === 'Wife'));
      const flags = spousePresenceFlags(state.lastExtracted && state.lastExtracted.family_members);
      rederiveFromRelationChange(targetObj, oldRel, !!isHead, hasSpouse, flags);
      syncJsonOutput();
      // The data was just re-derived by syncJsonOutput; refresh the
      // selects and the father/mother inputs in place so the user sees
      // it now.
      if (cardContainer) {
        refreshDerivedSelects(cardContainer, targetObj, !!isHead);
        const fIn = cardContainer.querySelector('input[data-field="father_name_bn"]');
        if (fIn && !fIn.value.trim() && targetObj.father_name_bn) { fIn.value = targetObj.father_name_bn; toggleWarning(fIn); }
        const mIn = cardContainer.querySelector('input[data-field="mother_name_bn"]');
        if (mIn && !mIn.value.trim() && targetObj.mother_name_bn) { mIn.value = targetObj.mother_name_bn; toggleWarning(mIn); }
        // Father picker (v4.9.48): show it when the relation becomes
        // a grandchild, hide it otherwise — and rebuild its options
        // from the household now.
        const pickRow = cardContainer.querySelector('[data-father-pick-row="1"]');
        if (pickRow) {
          const isGrand = newRel === 'Grandson' || newRel === 'Granddaughter';
          pickRow.style.display = isGrand ? '' : 'none';
          if (isGrand) rebuildFatherPickOptions(pickRow.querySelector('select[data-field="father_pick"]'), targetObj.father_name_bn);
        }
      }
      // The head's derived values can change too when a spouse appears
      // (its marital follows hasSpouse) — refresh the head card as
      // well, or it keeps showing the old value while the data already
      // changed. The head card is the first .record-card.
      const headCard = document.querySelector('.record-card');
      if (headCard && headCard !== cardContainer && state.lastExtracted && state.lastExtracted.head) {
        refreshDerivedSelects(headCard, state.lastExtracted.head, true);
      }
      refreshChildParentInputs();
    });
  } else if (f.type === 'gender_select') {
    inputEl = document.createElement('select');
    inputEl.setAttribute('data-field', 'gender');
    inputEl.style.cssText = 'padding:4px 8px; font-size:12px; font-weight:600; border:1px solid var(--border); background:var(--surface-muted); color:var(--text-main); border-radius:5px; cursor:pointer; width:100%;';
    // The head is always a woman (v4.9.47): the head card offers
    // Female only — a male head is not possible any more.
    const isHeadCard = state.lastExtracted && state.lastExtracted.head === targetObj;
    if (isHeadCard && targetObj.gender !== 'Female') { targetObj.gender = 'Female'; targetObj.gender_id = 2; }
    GENDER_OPTIONS.filter((opt) => !isHeadCard || opt.value === 'Female').forEach((opt) => {
      const o = document.createElement('option');
      o.value = opt.value;
      o.textContent = opt.label;
      inputEl.appendChild(o);
    });
    inputEl.value = targetObj.gender || 'Male';
    inputEl.addEventListener('change', (e) => {
      const oldGender = targetObj.gender;
      targetObj.gender = e.target.value;
      targetObj.gender_id = GENDER_ID_MAP[e.target.value] || 1;
      toggleWarning(inputEl);
      if (onUpdateMeta) onUpdateMeta();
      // A new gender re-derives the profession (it depends on gender)
      // for a value that was auto-filled under the old gender.
      const isHead = state.lastExtracted && state.lastExtracted.head === targetObj;
      const hasSpouse = !!(state.lastExtracted && Array.isArray(state.lastExtracted.family_members) && state.lastExtracted.family_members.some((m) => m.relation === 'Husband' || m.relation === 'Wife'));
      const flags = spousePresenceFlags(state.lastExtracted && state.lastExtracted.family_members);
      rederiveFromGenderChange(targetObj, oldGender, !!isHead, hasSpouse, flags);
      syncJsonOutput();
      if (cardContainer) refreshDerivedSelects(cardContainer, targetObj, !!isHead);
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
    // data-field (v4.9.55): the 17-digit flip finds this select with
    // querySelector('select[data-field="doc_type"]') — without the
    // tag it found nothing, so the flip updated the record to BRN
    // but the card kept showing NID (Pull Draft re-renders the whole
    // card, which is why Pull looked right and typing did not).
    inputEl.setAttribute('data-field', 'doc_type');
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
      // A hand pick wins over the 17-digit rule (v4.9.49): if the user
      // says this 17-digit number is an NID, it stays an NID.
      manualDocTypePicked.add(targetObj);
      toggleWarning(inputEl);
      if (onUpdateMeta) onUpdateMeta();
      syncJsonOutput();
    });
  } else if (f.type === 'card_multi') {
    // Government cards (multi-select, v4.9.36). Only meaningful when
    // SSNP is Yes; the injector ignores cards when SSNP is No.
    inputEl = document.createElement('select');
    inputEl.setAttribute('data-field', 'facilities_ids');
    inputEl.multiple = true;
    inputEl.size = 3;
    inputEl.style.cssText = 'padding:4px 8px; font-size:12px; font-weight:600; border:1px solid var(--border); background:var(--surface-muted); color:var(--text-main); border-radius:5px; cursor:pointer; width:100%;';
    GOV_CARD_OPTIONS.forEach((opt) => {
      const o = document.createElement('option');
      o.value = String(opt.id);
      o.textContent = `${opt.id} — ${opt.label}`;
      inputEl.appendChild(o);
    });
    const curIds = Array.isArray(targetObj.facilities_ids) ? targetObj.facilities_ids.map(v => String(v)) : [];
    Array.from(inputEl.options).forEach(o => { o.selected = curIds.includes(o.value); });
    inputEl.addEventListener('change', () => {
      targetObj.facilities_ids = Array.from(inputEl.selectedOptions).map(o => Number(o.value));
      toggleWarning(inputEl);
      if (onUpdateMeta) onUpdateMeta();
      syncJsonOutput();
    });
  } else if (f.type === 'yesno_select') {
    // Yes / No (v4.9.36): SSNP and DSS. Blank means "not set" — the
    // injector then uses its default (No).
    inputEl = document.createElement('select');
    inputEl.setAttribute('data-field', f.key);
    inputEl.style.cssText = 'padding:4px 8px; font-size:12px; font-weight:600; border:1px solid var(--border); background:var(--surface-muted); color:var(--text-main); border-radius:5px; cursor:pointer; width:100%;';
    const blank = document.createElement('option');
    blank.value = ''; blank.textContent = '—';
    inputEl.appendChild(blank);
    [['1', 'Yes (হ্যাঁ)'], ['0', 'No (না)']].forEach(([v, l]) => {
      const o = document.createElement('option');
      o.value = v; o.textContent = l;
      inputEl.appendChild(o);
    });
    inputEl.value = (targetObj[f.key] === 0 || targetObj[f.key] === 1 || targetObj[f.key] === '0' || targetObj[f.key] === '1') ? String(targetObj[f.key]) : '';
    inputEl.addEventListener('change', (e) => {
      const v = e.target.value;
      if (v === '') { delete targetObj[f.key]; }
      else { targetObj[f.key] = Number(v); }
      // SSNP No clears the cards and hides the card row; SSNP Yes
      // shows it again.
      if (f.key === 'is_ssnp_covered' && cardContainer) {
        const facSel = cardContainer.querySelector('[data-field="facilities_ids"]');
        const facRow = facSel ? facSel.closest('.record-row') : null;
        if (v === '0') {
          targetObj.facilities_ids = [];
          if (facSel) Array.from(facSel.options).forEach(o => { o.selected = false; });
          if (facRow) facRow.style.display = 'none';
        } else if (v === '1' && facRow) {
          facRow.style.display = '';
        }
      }
      // Disabled No clears the type and hides the type row (v4.9.49);
      // Disabled Yes shows it again. Blank hides it too.
      if (f.key === 'is_disabled' && cardContainer) {
        const typeSel = cardContainer.querySelector('[data-field="disability_type_id"]');
        const typeRow = typeSel ? typeSel.closest('.record-row') : null;
        if (v === '1' && typeRow) {
          typeRow.style.display = '';
        } else {
          targetObj.disability_type_id = undefined;
          if (typeSel) typeSel.value = '';
          if (typeRow) typeRow.style.display = 'none';
        }
        // Health (v4.9.49, v4.9.51): Disabled Yes means Health
        // প্রতিবন্ধী (206); Disabled No means Health কর্মক্ষম (203).
        // The select follows the toggle, stored in the record as well
        // as shown — the user can still refine it by hand afterwards
        // (204 সম্পূর্ণ অক্ষম / 205 আংশিক কর্মক্ষম).
        const hSel = cardContainer.querySelector('[data-field="health_condition_id"]');
        if (hSel) {
          if (v === '1') {
            targetObj.health_condition_id = 206;
            hSel.value = '206';
          } else if (v === '0') {
            targetObj.health_condition_id = 203;
            hSel.value = '203';
          }
        }
      }
      toggleWarning(inputEl);
      if (onUpdateMeta) onUpdateMeta();
      syncJsonOutput();
      notifyChange(f.key, v === '' ? null : Number(v));
    });
  } else if (f.type === 'edu_select') {
    // Head education (v4.9.33): the field the user most often has to
    // correct after a fill. A change here is a head correction — the
    // injector overwrites the form's education with it on the next fill.
    inputEl = document.createElement('select');
    inputEl.setAttribute('data-field', 'education_status_id');
    inputEl.style.cssText = 'padding:4px 8px; font-size:12px; font-weight:600; border:1px solid var(--border); background:var(--surface-muted); color:var(--text-main); border-radius:5px; cursor:pointer; width:100%;';
    const blank = document.createElement('option');
    blank.value = ''; blank.textContent = '—';
    inputEl.appendChild(blank);
    EDUCATION_OPTIONS.forEach((opt) => {
      const o = document.createElement('option');
      o.value = String(opt.id);
      o.textContent = `${opt.id} — ${opt.label}`;
      inputEl.appendChild(o);
    });
    inputEl.value = targetObj.education_status_id !== undefined && targetObj.education_status_id !== null && String(targetObj.education_status_id).trim() !== '' ? String(targetObj.education_status_id) : '';
    inputEl.addEventListener('change', (e) => {
      const v = e.target.value;
      targetObj.education_status_id = v === '' ? undefined : Number(v);
      toggleWarning(inputEl);
      if (onUpdateMeta) onUpdateMeta();
      syncJsonOutput();
      notifyChange('education_status_id', v === '' ? null : Number(v));
    });
  } else if (f.type === 'disability_select') {
    // Disability type (type-11 list, v4.9.49). Only meaningful when
    // the member is disabled; the row is hidden otherwise, and the
    // injector fills it from the member record on Auto-Fill.
    inputEl = document.createElement('select');
    inputEl.setAttribute('data-field', 'disability_type_id');
    inputEl.style.cssText = 'padding:4px 8px; font-size:12px; font-weight:600; border:1px solid var(--border); background:var(--surface-muted); color:var(--text-main); border-radius:5px; cursor:pointer; width:100%;';
    const blank = document.createElement('option');
    blank.value = ''; blank.textContent = '—';
    inputEl.appendChild(blank);
    DISABILITY_TYPE_OPTIONS.forEach((opt) => {
      const o = document.createElement('option');
      o.value = String(opt.id);
      o.textContent = `${opt.id} — ${opt.label}`;
      inputEl.appendChild(o);
    });
    inputEl.value = targetObj.disability_type_id !== undefined && targetObj.disability_type_id !== null && String(targetObj.disability_type_id).trim() !== '' ? String(targetObj.disability_type_id) : '';
    inputEl.addEventListener('change', (e) => {
      const v = e.target.value;
      targetObj.disability_type_id = v === '' ? undefined : Number(v);
      toggleWarning(inputEl);
      if (onUpdateMeta) onUpdateMeta();
      syncJsonOutput();
      notifyChange('disability_type_id', v === '' ? null : Number(v));
    });
  } else if (f.type === 'mfs_select') {
    // MFS provider (PMT field 138, v4.9.49). Blank = leave the form
    // as-is; a pick fills field 138 via form_defaults.program_fields
    // (wired in recalculateHouseholdSummary).
    inputEl = document.createElement('select');
    inputEl.setAttribute('data-field', 'mfs_provider_id');
    inputEl.style.cssText = 'padding:4px 8px; font-size:12px; font-weight:600; border:1px solid var(--border); background:var(--surface-muted); color:var(--text-main); border-radius:5px; cursor:pointer; width:100%;';
    const blank = document.createElement('option');
    blank.value = ''; blank.textContent = '—';
    inputEl.appendChild(blank);
    MFS_PROVIDER_OPTIONS.forEach((opt) => {
      const o = document.createElement('option');
      o.value = String(opt.id);
      o.textContent = `${opt.id} — ${opt.label}`;
      inputEl.appendChild(o);
    });
    inputEl.value = targetObj.mfs_provider_id !== undefined && targetObj.mfs_provider_id !== null && String(targetObj.mfs_provider_id).trim() !== '' ? String(targetObj.mfs_provider_id) : '';
    inputEl.addEventListener('change', (e) => {
      const v = e.target.value;
      targetObj.mfs_provider_id = v === '' ? undefined : Number(v);
      toggleWarning(inputEl);
      if (onUpdateMeta) onUpdateMeta();
      syncJsonOutput();
      notifyChange('mfs_provider_id', v === '' ? null : Number(v));
    });
  } else if (f.type === 'health_select') {
    // Health (type 43, v4.9.49, v4.9.51). Default কর্মক্ষম (203) when the
    // member is not disabled and nothing was picked — the form's own
    // default for an able-bodied member. A disabled member with
    // nothing picked defaults to প্রতিবন্ধী (206), same as the
    // Disabled toggle sets.
    inputEl = document.createElement('select');
    inputEl.setAttribute('data-field', 'health_condition_id');
    inputEl.style.cssText = 'padding:4px 8px; font-size:12px; font-weight:600; border:1px solid var(--border); background:var(--surface-muted); color:var(--text-main); border-radius:5px; cursor:pointer; width:100%;';
    const blank = document.createElement('option');
    blank.value = ''; blank.textContent = '—';
    inputEl.appendChild(blank);
    HEALTH_OPTIONS.forEach((opt) => {
      const o = document.createElement('option');
      o.value = String(opt.id);
      o.textContent = `${opt.id} — ${opt.label}`;
      inputEl.appendChild(o);
    });
    const defHealth = (targetObj.is_disabled === 1 || targetObj.is_disabled === '1') ? '206' : '203';
    inputEl.value = targetObj.health_condition_id !== undefined && targetObj.health_condition_id !== null && String(targetObj.health_condition_id).trim() !== '' ? String(targetObj.health_condition_id) : defHealth;
    inputEl.addEventListener('change', (e) => {
      const v = e.target.value;
      targetObj.health_condition_id = v === '' ? undefined : Number(v);
      toggleWarning(inputEl);
      if (onUpdateMeta) onUpdateMeta();
      syncJsonOutput();
      notifyChange('health_condition_id', v === '' ? null : Number(v));
    });
  } else if (f.type === 'profession_select') {
    // Head profession (type-34 list). Blank until the user picks —
    // extraction never knows it, and the injector derives it by age.
    inputEl = document.createElement('select');
    inputEl.setAttribute('data-field', 'profession');
    inputEl.style.cssText = 'padding:4px 8px; font-size:12px; font-weight:600; border:1px solid var(--border); background:var(--surface-muted); color:var(--text-main); border-radius:5px; cursor:pointer; width:100%;';
    const blank = document.createElement('option');
    blank.value = ''; blank.textContent = '—';
    inputEl.appendChild(blank);
    PROFESSION_OPTIONS.forEach((opt) => {
      const o = document.createElement('option');
      o.value = String(opt.id);
      o.textContent = `${opt.id} — ${opt.label}`;
      inputEl.appendChild(o);
    });
    inputEl.value = targetObj.profession !== undefined && targetObj.profession !== null && String(targetObj.profession).trim() !== '' ? String(targetObj.profession) : '';
    inputEl.addEventListener('change', (e) => {
      const v = e.target.value;
      targetObj.profession = v === '' ? undefined : Number(v);
      toggleWarning(inputEl);
      if (onUpdateMeta) onUpdateMeta();
      syncJsonOutput();
      notifyChange('profession', v === '' ? null : Number(v));
    });
  } else if (f.type === 'livelihood_select') {
    // Member livelihood (type-44 list). The injector reads
    // livelihood_profession_id from the member record on Auto-Fill,
    // preferring it over its own age/gender derivation.
    inputEl = document.createElement('select');
    inputEl.setAttribute('data-field', 'livelihood_profession_id');
    inputEl.style.cssText = 'padding:4px 8px; font-size:12px; font-weight:600; border:1px solid var(--border); background:var(--surface-muted); color:var(--text-main); border-radius:5px; cursor:pointer; width:100%;';
    const blank = document.createElement('option');
    blank.value = ''; blank.textContent = '—';
    inputEl.appendChild(blank);
    LIVELIHOOD_OPTIONS.forEach((opt) => {
      const o = document.createElement('option');
      o.value = String(opt.id);
      o.textContent = `${opt.id} — ${opt.label}`;
      inputEl.appendChild(o);
    });
    inputEl.value = targetObj.livelihood_profession_id !== undefined && targetObj.livelihood_profession_id !== null && String(targetObj.livelihood_profession_id).trim() !== '' ? String(targetObj.livelihood_profession_id) : '';
    inputEl.addEventListener('change', (e) => {
      const v = e.target.value;
      targetObj.livelihood_profession_id = v === '' ? undefined : Number(v);
      toggleWarning(inputEl);
      if (onUpdateMeta) onUpdateMeta();
      syncJsonOutput();
      notifyChange('livelihood_profession_id', v === '' ? null : Number(v));
    });
  } else if (f.type === 'marital_select') {
    // Head marital status (type-32 list). Sets both spellings: the
    // panel's `marital_status` (head form) and the site's typo
    // `maritial_status_id` (head member row).
    inputEl = document.createElement('select');
    inputEl.setAttribute('data-field', 'marital_status');
    inputEl.style.cssText = 'padding:4px 8px; font-size:12px; font-weight:600; border:1px solid var(--border); background:var(--surface-muted); color:var(--text-main); border-radius:5px; cursor:pointer; width:100%;';
    const blank = document.createElement('option');
    blank.value = ''; blank.textContent = '—';
    inputEl.appendChild(blank);
    MARITAL_OPTIONS.forEach((opt) => {
      const o = document.createElement('option');
      o.value = String(opt.id);
      o.textContent = `${opt.id} — ${opt.label}`;
      inputEl.appendChild(o);
    });
    inputEl.value = targetObj.marital_status !== undefined && targetObj.marital_status !== null && String(targetObj.marital_status).trim() !== '' ? String(targetObj.marital_status) : '';
    inputEl.addEventListener('change', (e) => {
      const v = e.target.value;
      targetObj.marital_status = v === '' ? undefined : Number(v);
      targetObj.maritial_status_id = v === '' ? undefined : Number(v);
      toggleWarning(inputEl);
      if (onUpdateMeta) onUpdateMeta();
      syncJsonOutput();
      notifyChange('marital_status', v === '' ? null : Number(v));
    });
  } else {
    inputEl = document.createElement('input');
    inputEl.type = 'text';
    inputEl.setAttribute('data-field', f.key);
    inputEl.value = targetObj[f.key] || '';
    inputEl.placeholder = f.key === 'dob' ? 'e.g. 15011990' : '—';
    inputEl.style.cssText = 'padding:4px 8px; font-size:12.5px; font-weight:550; border:1px solid transparent; background:transparent; border-radius:5px; width:100%;';
    if (f.key.endsWith('_en')) inputEl.style.textTransform = 'uppercase';

    inputEl.addEventListener('blur', () => {
      if (f.key === 'dob') {
        // The OLD age comes from dobDerivedAge when the fields were
        // derived (v4.9.54) — targetObj.dob is already the new value
        // by blur time, so computing oldAge from it would equal
        // newAge and the re-derivation would change nothing.
        const stored = dobDerivedAge.get(targetObj);
        const oldAge = stored ? stored.age : calculateAgeYears(targetObj.dob);
        const oldAgeFrac = stored ? stored.ageFrac : calculateAgeFractional(targetObj.dob);
        targetObj.dob = normalizeDob(inputEl.value);
        inputEl.value = targetObj.dob;
        targetObj.age = calculateAgeYears(targetObj.dob);
        if (onUpdateMeta) onUpdateMeta();
        // A changed DOB re-derives the fields that still hold the OLD
        // age's derived value (auto-filled, not hand-picked).
        const isHead = state.lastExtracted && state.lastExtracted.head === targetObj;
        const hasSpouse = !!(state.lastExtracted && Array.isArray(state.lastExtracted.family_members) && state.lastExtracted.family_members.some((m) => m.relation === 'Husband' || m.relation === 'Wife'));
        const flags = spousePresenceFlags(state.lastExtracted && state.lastExtracted.family_members);
        rederiveFromDobChange(targetObj, oldAge, !!isHead, hasSpouse, oldAgeFrac, flags);
        const fixedAge = calculateAgeYears(targetObj.dob);
        if (fixedAge !== null && fixedAge >= 0) dobDerivedAge.set(targetObj, { age: fixedAge, ageFrac: calculateAgeFractional(targetObj.dob) });
        syncJsonOutput();
        if (cardContainer) refreshDerivedSelects(cardContainer, targetObj, !!isHead);
        // A DOB typed after the NID can make a 13-digit NID
        // convertible — convert the card's NID input now.
        if (cardContainer) {
          const idIn = cardContainer.querySelector('input[data-field="nid"], input[data-field="nid_or_brn"]');
          if (idIn) {
            const idKey = idIn.getAttribute('data-field');
            if (convertCardIdNumber(idIn, targetObj, idKey)) syncJsonOutput();
            toggleIdWarning(idIn, targetObj, idKey);
          }
        }
      }
      // Script-sensitive fields: the stored value is stripped as you
      // type, but the field itself keeps showing what was typed (so
      // Bangla conjunct typing is never disturbed mid-word). On blur,
      // show the stored value, so the field matches what will fill.
      if (f.key === 'nid' || f.key === 'nid_or_brn' || f.key.endsWith('_bn') || f.key.endsWith('_en')) {
        inputEl.value = targetObj[f.key] || '';
      }
      toggleWarning(inputEl);
      // NID/BRN (v4.9.47): a finished 13-digit NID converts to 17
      // digits with the birth year; a wrong-length ID is flagged on
      // the card instead of failing on the form.
      if (f.key === 'nid' || f.key === 'nid_or_brn') {
        if (convertCardIdNumber(inputEl, targetObj, f.key)) { syncJsonOutput(); if (onUpdateMeta) onUpdateMeta(); }
        toggleIdWarning(inputEl, targetObj, f.key);
      }
      // Mobile (v4.9.49): Bangla digits convert to English on blur;
      // a wrong-length number is flagged on the card instead of
      // failing on the form.
      if (f.key === 'mobile_number') {
        if (convertCardMobile(inputEl, targetObj)) syncJsonOutput();
        toggleMobileWarning(inputEl, targetObj);
      }
    });

    inputEl.addEventListener('input', (e) => {
      let val = inputEl.value;
      const oldVal = targetObj[f.key];
      if (f.key === 'nid' || f.key === 'nid_or_brn') {
        val = toEnglishDigits(val).replace(/\s+/g, '');
      } else if (f.key === 'mobile_number') {
        // Mobile (v4.9.49): English digits only, as you type.
        val = toEnglishDigits(val).replace(/\D+/g, '');
      } else if (f.key.endsWith('_en')) {
        // English name: only the site's allowed characters survive
        // (Latin letters, dots, spaces, commas, hyphens, parentheses).
        val = stripNonEnglishName(val).toUpperCase();
      } else if (f.key.endsWith('_bn')) {
        // Bangla name: no English letters.
        val = stripLatinLetters(val);
      }
      // DOB (v4.9.43): the hyphens fill themselves in — typing 20
      // shows 20- and 2001 shows 20-01- as you type, so the hyphen
      // never needs typing. The input is rewritten in place (the
      // cursor lands at the end, which is where a left-to-right digit
      // entry is). The [Mon] bracket is added back on blur by
      // normalizeDob. When the user deletes, the trailing hyphen is
      // left off, so backspace on 20- gives 20 instead of sticking.
      if (f.key === 'dob') {
        const deleting = (e && e.inputType && String(e.inputType).indexOf('delete') === 0) || String(val).length < String(oldVal || '').length;
        val = formatDobInput(val, deleting);
        inputEl.value = val;
      }
      targetObj[f.key] = val;
      if (f.key === 'dob') {
        targetObj.age = calculateAgeYears(val);
        if (onUpdateMeta) onUpdateMeta();
        // A corrected year re-derives live (v4.9.54): the fields were
        // filled from the age stored when they were derived — a wrong
        // year leaves wrong values behind, and the blur handler alone
        // cannot fix them, because targetObj.dob is already the new
        // value by blur time, so oldAge would equal newAge and the
        // re-derivation would be a no-op. The stored age is the only
        // record of the wrong derivation.
        const stored = dobDerivedAge.get(targetObj);
        const newAgeLive = calculateAgeYears(val);
        if (stored && newAgeLive !== null && newAgeLive >= 0 && stored.age !== newAgeLive) {
          const isHeadLive = state.lastExtracted && state.lastExtracted.head === targetObj;
          const hasSpouseLive = !!(state.lastExtracted && Array.isArray(state.lastExtracted.family_members) && state.lastExtracted.family_members.some((m) => m.relation === 'Husband' || m.relation === 'Wife'));
          const flagsLive = spousePresenceFlags(state.lastExtracted && state.lastExtracted.family_members);
          rederiveFromDobChange(targetObj, stored.age, !!isHeadLive, hasSpouseLive, stored.ageFrac, flagsLive);
          dobDerivedAge.set(targetObj, { age: newAgeLive, ageFrac: calculateAgeFractional(val) });
        }
      }
      toggleWarning(inputEl);
      if (f.key === 'nid' || f.key === 'nid_or_brn') {
        toggleIdWarning(inputEl, targetObj, f.key);
        // Live 17-digit flip (v4.9.52): the Doc Type becomes BRN the
        // moment the 17th digit lands — automatic, no blur needed.
        // Refresh the header too (v4.9.55): its tag shows the Doc
        // Type as well, or it keeps saying NID after the flip.
        if (flipDocTypeLive(inputEl, targetObj, f.key) && onUpdateMeta) onUpdateMeta();
      }
      if (f.key === 'mobile_number') toggleMobileWarning(inputEl, targetObj);
      syncJsonOutput();
      // Typing a DOB fills blank derived fields live (the fill runs in
      // syncJsonOutput above); show them in the selects right away.
      if (f.key === 'dob' && cardContainer) {
        const isHead = state.lastExtracted && state.lastExtracted.head === targetObj;
        refreshDerivedSelects(cardContainer, targetObj, !!isHead);
      }
      // Name typing (v4.9.37): the gender/religion are auto-detected
      // from the name in recalculateHouseholdSummary (above), but the
      // card's selects only refresh on a re-render. Update them here
      // so the user sees মোঃ -> Male / মোছাঃ -> Female immediately,
      // and refresh the header (it shows the gender).
      if ((f.key === 'name_bn' || f.key === 'name_en') && cardContainer) {
        const gSel = cardContainer.querySelector('select[data-field="gender"]');
        if (gSel && targetObj.gender) { gSel.value = targetObj.gender; toggleWarning(gSel); }
        const rSel = cardContainer.querySelector('select[data-field="religion"]');
        if (rSel && targetObj.religion) { rSel.value = targetObj.religion; toggleWarning(rSel); }
        if (onUpdateMeta) onUpdateMeta();
        // A parent's name just changed: a son/daughter's blank
        // father/mother names (filled in the data by syncJsonOutput)
        // show in their cards now.
        refreshChildParentInputs();
      }
      // Bangla name -> Banglish (v4.9.40): typing a BN name fills the
      // matching EN field with the transliteration, but only when the
      // EN field is blank or still holds the transliteration of the
      // OLD BN name (auto-filled, not hand-edited). A hand-edited EN
      // value is never overwritten — if the transliteration is wrong,
      // the user fixes the EN field and it stays. The EN input is
      // refreshed in place. Member cards have no father/mother EN
      // fields (head only), so the hook only fires where the EN input
      // exists on the card. Gated on the Banglish toggle (v4.9.48):
      // off = no auto-fill, the EN field stays blank for hand-typing.
      if (banglishEnabled && (f.key === 'name_bn' || f.key === 'father_name_bn' || f.key === 'mother_name_bn') && cardContainer) {
        const enKey = f.key === 'name_bn' ? 'name_en' : (f.key === 'father_name_bn' ? 'father_name_en' : 'mother_name_en');
        const enInput = cardContainer.querySelector(`input[data-field="${enKey}"]`);
        if (enInput) {
          const newTranslit = transliterateBanglaToEnglish(val);
          const oldTranslit = transliterateBanglaToEnglish(oldVal || '');
          const curEn = targetObj[enKey];
          if (isBlankVal(curEn) || curEn === oldTranslit) {
            targetObj[enKey] = newTranslit;
            enInput.value = newTranslit;
            toggleWarning(enInput);
          }
        }
      }
    });
  }
  toggleWarning(inputEl);
  if (f.key === 'nid' || f.key === 'nid_or_brn') toggleIdWarning(inputEl, targetObj, f.key);
  return inputEl;
}

function setupImageViewerModal() {
  if ($('fcViewerModal')) return;
  const modal = document.createElement('div');
  modal.id = 'fcViewerModal';
  modal.style.cssText = 'display:none; position:fixed; inset:0; z-index:99999; background:rgba(9,9,11,0.92); backdrop-filter:blur(6px); flex-direction:column; align-items:center; justify-content:flex-start; padding:12px; overflow-y:auto;';

  modal.innerHTML = `
    <div style="position:relative; width:100%; max-width:680px; display:flex; flex-direction:column; gap:10px; margin:auto;">
      <div style="display:flex; justify-content:space-between; align-items:center; color:#fff; padding:2px 4px;">
        <span id="fcViewerTitle" style="font-weight:700; font-size:13.5px; color:#38bdf8;">Card Inspector</span>
        <div style="display:flex; gap:6px; align-items:center;">
          <button type="button" id="fcCropImgBtn" style="background:#059669; color:#fff; border:none; border-radius:6px; padding:3px 10px; font-size:11px; font-weight:700; cursor:pointer; margin-right:4px;">Crop</button>
          <button type="button" id="fcRestoreOrigBtn" style="display:none; background:#475569; color:#fff; border:none; border-radius:6px; padding:3px 10px; font-size:11px; font-weight:700; cursor:pointer; margin-right:4px;" title="Undo the crop — bring back the original photo">↩ Original</button>
          <button type="button" id="fcZoomOutBtn" style="background:#27272a; color:#fff; border:1px solid #3f3f46; border-radius:6px; padding:3px 9px; font-size:12px; font-weight:700; cursor:pointer;">−</button>
          <button type="button" id="fcZoomResetBtn" style="background:#27272a; color:#fff; border:1px solid #3f3f46; border-radius:6px; padding:3px 8px; font-size:11px; cursor:pointer;">100%</button>
          <button type="button" id="fcZoomInBtn" style="background:#27272a; color:#fff; border:1px solid #3f3f46; border-radius:6px; padding:3px 9px; font-size:12px; font-weight:700; cursor:pointer;">+</button>
          <button type="button" id="fcViewerClose" style="background:#dc2626; color:#fff; border:none; border-radius:6px; width:28px; height:28px; font-weight:bold; font-size:14px; cursor:pointer; margin-left:4px;">✕</button>
        </div>
      </div>
      <div style="width:100%; max-height:60vh; overflow:auto; display:flex; align-items:center; justify-content:center; border-radius:8px;">
        <img id="fcViewerImg" style="max-width:100%; max-height:60vh; object-fit:contain; transition:transform 0.12s ease; transform-origin:center center;">
      </div>
      <div id="fcViewerMeta" style="width:100%; background:#18181b; color:#f8fafc; padding:12px; border-radius:10px; border:1px solid #27272a; font-size:12px; box-shadow:0 10px 25px rgba(0,0,0,0.5); max-height:30vh; overflow-y:auto;"></div>
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
    setPanelWide(false); // back to the normal panel width
    if (state.lastExtracted) renderExtractedCards(state.lastExtracted);
  };
  modal.querySelector('#fcViewerClose').onclick = closeViewer;
  modal.onclick = (e) => { if (e.target === modal) closeViewer(); };
}

function showImageViewer(item) {
  const modal = $('fcViewerModal');
  if (!modal) return;
  // A pulled-photo preview hides the Crop button (it is not a panel
  // photo) — put it back for a real photo (v4.9.37).
  const cropBtn0 = modal.querySelector('#fcCropImgBtn');
  if (cropBtn0) cropBtn0.style.display = '';
  setPanelWide(true); // bigger view on tablet/desktop while inspecting
  modal.querySelector('#fcCropImgBtn').onclick = () => openCropForImage(item);
  // Undo a crop: bring back the original photo (only shown when the
  // photo was cropped at least once — the original is kept on first crop).
  const restoreBtn = modal.querySelector('#fcRestoreOrigBtn');
  if (restoreBtn) {
    restoreBtn.style.display = item.originalBase64 ? '' : 'none';
    restoreBtn.onclick = () => {
      if (!item.originalBase64) return;
      item.base64 = item.originalBase64;
      item.originalBase64 = null;
      renderPreviews(itemCategory(item));
      saveSessionState();
      setStatus('Original photo restored.', 'ok');
      showImageViewer(item); // rebuild the viewer on the original
    };
  }
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
          await copyTextSafe(copyValueForField(f, targetObj));
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
// Pulled draft photo (v4.9.37): tap a pulled thumbnail to see it
// big. This is a plain preview — no crop / edit, because the photo
// lives on the form, not in the panel's photo records.
function showPulledPhoto(item) {
  const modal = $('fcViewerModal');
  if (!modal || !item || !item.dataUrl) return;
  setPanelWide(true);
  const cropBtn = modal.querySelector('#fcCropImgBtn');
  if (cropBtn) cropBtn.style.display = 'none';
  const restoreBtn = modal.querySelector('#fcRestoreOrigBtn');
  if (restoreBtn) restoreBtn.style.display = 'none';
  viewerZoom = 1;
  $('fcViewerImg').src = item.dataUrl;
  $('fcViewerImg').style.transform = 'scale(1)';
  $('fcZoomResetBtn').textContent = '100%';
  $('fcViewerTitle').textContent = item.name || 'Draft photo';
  const metaBox = $('fcViewerMeta');
  metaBox.innerHTML = '<div style="color:#a1a1aa; text-align:center; padding:10px;">Pulled from the form — this is the photo the site has on file.</div>';
  modal.style.display = 'flex';
}

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
    img.title = `${item.name || 'Draft photo'} — tap to view`;
    img.style.cursor = 'pointer';
    img.addEventListener('click', () => showPulledPhoto(item));
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
  // A retake is only valid for its own category; a pending retake for a
  // different list means the user moved on — drop it.
  const replacing = retakeItem && itemCategory(retakeItem) === category ? retakeItem : null;
  if (retakeItem && !replacing) retakeItem = null;

  if (files.length === 1 && files[0].type.startsWith('image/')) {
    const file = files[0];
    const reader = new FileReader();
    reader.onload = (evt) => {
      rawImage = new Image();
      rawImage.onload = () => {
        autoPickCropRatio();
        const canvas = $('cropCanvas');
        applyCropCanvasSize();
        zoomLevel = 1;
        rotationAngle = 0;
        panX = 0;
        panY = 0;
        $('zoomRange').value = 1;
        drawCropCanvas();
        cropOriginalImage = rawImage;
        cropAutoScanned = false;
        updateUndoScanBtn();
        setRetakeLabel(false); // a fresh upload is always a Re-upload
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
    let replacedDone = false;
    for (const file of files) {
      if (!file.type.startsWith('image/')) continue;
      try {
        const b64 = await fileToBase64(file);
        if (replacing && !replacedDone) {
          // Retake via several picked files: the first one replaces the
          // old photo; the rest are added as usual.
          replacing.base64 = b64;
          replacing.name = file.name;
          replacing.originalBase64 = null; // the old original belongs to the old shot
          replacing.source = 'upload';
          replacedDone = true;
        } else {
          addImage(category, b64, file.name, 'upload');
        }
      } catch (err) {
        setStatus(err.message, 'err');
      }
    }
    const added = state[category].slice(beforeCount);
    if (replacing) {
      retakeItem = null; // consumed either way — a later upload must not replace by surprise
      if (replacedDone) { renderPreviews(category); saveSessionState(); added.unshift(replacing); }
    }
    setStatus(`${files.length} images added.`, 'ok');
    // Many photos at once: crop them one by one, auto-opening each in turn.
    if (added.length >= 2) queueCrops(added);
    else if (replacing) openCropForImage(replacing);
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
let panelCameraDeviceId = null;
let panelCameraCategory = 'head';
let panelCameraQuad = null; // {points, at} — last live-detected quad, raw video px
let panelCameraDetectTimer = null;
// Camera zoom (the camera's own zoom control). {min, max, step, value}
// come from the video track's capabilities; supported is false when the
// camera reports no zoom range at all.
let panelCameraZoom = { min: 1, max: 1, step: 0.1, value: 1, supported: false };
// Ask the bookmarklet (parent page) to widen the panel while the camera
// is open, so the popup is bigger on a tablet/desktop. Phones already
// show the panel full-width, so the wide class does nothing there.
function setPanelWide(wide) {
  try { window.parent.postMessage({ action: 'FC_PRO_PANEL_WIDE', wide: !!wide }, '*'); } catch (_) {}
}
// Photo frame for Capture when there is no green-lock warp: landscape
// 4:3 (the viewfinder) or portrait 3:4 (tall documents). Remembered
// across sessions, like the perspective toggle.
let cameraFramePortrait = false;
try { cameraFramePortrait = localStorage.getItem('fc_pro_frame_portrait') === '1'; } catch (_) {}

function stopPanelCameraTracks() {
  if (panelCameraDetectTimer) { clearInterval(panelCameraDetectTimer); panelCameraDetectTimer = null; }
  if (panelCameraStream) {
    panelCameraStream.getTracks().forEach((t) => t.stop());
    panelCameraStream = null;
  }
  const video = $('cameraVideo');
  if (video) video.srcObject = null;
  panelCameraQuad = null;
  panelCameraZoom = { min: 1, max: 1, step: 0.1, value: 1, supported: false };
  const zoomRow = $('cameraZoomRow');
  if (zoomRow) zoomRow.style.display = 'none';
  const zoomChips = $('cameraZoomChips');
  if (zoomChips) { zoomChips.style.display = 'none'; zoomChips.innerHTML = ''; }
  drawCameraOverlay(null);
  setCameraHint('Point the camera at the card…', '');
}

function stopPanelCamera() {
  stopPanelCameraTracks();
  setPanelWide(false); // back to the normal panel width
  const modal = $('cameraModal');
  if (modal) modal.classList.remove('open');
}

// Camera dismissed (Cancel / X): the retake is abandoned and the old
// photo stays exactly as it was.
function cancelPanelCamera() {
  retakeItem = null;
  stopPanelCamera();
}

function drawCameraOverlay(quad, color) {
  const overlay = $('cameraOverlay');
  const video = $('cameraVideo');
  if (!overlay || !video) return;
  const stage = overlay.parentElement;
  const sw = stage ? stage.clientWidth : 0;
  const sh = stage ? stage.clientHeight : 0;
  if (!sw || !sh) return;
  overlay.width = sw; overlay.height = sh;
  const ctx = overlay.getContext('2d');
  ctx.clearRect(0, 0, sw, sh);
  if (!quad || !video.videoWidth) return;
  const m = scanCoverMap(sw, sh, video.videoWidth, video.videoHeight);
  const c = color || '#22c55e';
  ctx.strokeStyle = c; ctx.lineWidth = 3; ctx.lineJoin = 'round';
  ctx.beginPath();
  quad.forEach((p, i) => {
    const x = p.x * m.scale + m.offsetX, y = p.y * m.scale + m.offsetY;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  });
  ctx.closePath(); ctx.stroke();
  ctx.fillStyle = c;
  quad.forEach((p) => {
    ctx.beginPath();
    ctx.arc(p.x * m.scale + m.offsetX, p.y * m.scale + m.offsetY, 5, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawCameraGuide() {
  // Corner brackets that are always visible, so there is something to aim
  // the card at even before the detector locks on.
  const overlay = $('cameraOverlay');
  const video = $('cameraVideo');
  if (!overlay || !video || !video.videoWidth) return;
  const stage = overlay.parentElement;
  const sw = stage ? stage.clientWidth : 0;
  const sh = stage ? stage.clientHeight : 0;
  if (!sw || !sh) return;
  overlay.width = sw; overlay.height = sh;
  const ctx = overlay.getContext('2d');
  ctx.clearRect(0, 0, sw, sh);
  const m = 0.14;
  const x0 = sw * m, x1 = sw * (1 - m), y0 = sh * m, y1 = sh * (1 - m);
  const L = Math.min(sw, sh) * 0.09;
  ctx.strokeStyle = 'rgba(255,255,255,0.85)';
  ctx.lineWidth = 3; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x0, y0 + L); ctx.lineTo(x0, y0); ctx.lineTo(x0 + L, y0);
  ctx.moveTo(x1 - L, y0); ctx.lineTo(x1, y0); ctx.lineTo(x1, y0 + L);
  ctx.moveTo(x1, y1 - L); ctx.lineTo(x1, y1); ctx.lineTo(x1 - L, y1);
  ctx.moveTo(x0 + L, y1); ctx.lineTo(x0, y1); ctx.lineTo(x0, y1 - L);
  ctx.stroke();
}

// The white frame in the viewfinder, in stage (display) px. Landscape
// 4:3 fills the stage; portrait 3:4 is a centred upright rectangle.
// Capture crops to exactly this rect, so the photo matches the frame.
function cameraFrameRect() {
  const video = $('cameraVideo');
  const sw = video ? video.clientWidth : 0;
  const sh = video ? video.clientHeight : 0;
  if (!sw || !sh) return null;
  return fitFrameRect(sw, sh, cameraFramePortrait);
}

function frameHintText() {
  return cameraFramePortrait ? 'Portrait frame — the white frame is the photo.' : 'Perspective is off — the white frame is the photo.';
}

function updateFrameButton() {
  const btn = $('frameRotateBtn');
  if (!btn) return;
  const label = btn.querySelector('.frame-state');
  if (label) label.textContent = cameraFramePortrait ? '3:4' : '4:3';
  btn.title = cameraFramePortrait ? 'Photo frame: portrait 3:4 — tap for landscape 4:3' : 'Photo frame: landscape 4:3 — tap for portrait 3:4';
}

function toggleFrameOrientation() {
  cameraFramePortrait = !cameraFramePortrait;
  try { localStorage.setItem('fc_pro_frame_portrait', cameraFramePortrait ? '1' : '0'); } catch (_) {}
  updateFrameButton();
  if (!perspectiveEnabled) {
    drawCameraFrame();
    setCameraHint(frameHintText(), '');
  }
}

function drawCameraFrame() {
  // Perspective off: mark the frame that Capture will save, so the user
  // can see exactly what the photo will include.
  const overlay = $('cameraOverlay');
  if (!overlay) return;
  const stage = overlay.parentElement;
  const sw = stage ? stage.clientWidth : 0;
  const sh = stage ? stage.clientHeight : 0;
  if (!sw || !sh) return;
  overlay.width = sw; overlay.height = sh;
  const ctx = overlay.getContext('2d');
  ctx.clearRect(0, 0, sw, sh);
  const fr = cameraFrameRect();
  if (!fr) return;
  ctx.strokeStyle = 'rgba(255,255,255,0.9)';
  ctx.lineWidth = 2.5;
  ctx.lineJoin = 'round';
  if (ctx.roundRect) {
    ctx.beginPath();
    ctx.roundRect(fr.x, fr.y, fr.w, fr.h, 8);
    ctx.stroke();
  } else {
    ctx.strokeRect(fr.x, fr.y, fr.w, fr.h);
  }
  // Grid: one vertical + one horizontal line through the frame centre,
  // so several documents can be framed — one per cell. Two is the
  // common case (head's card in one half, husband's in the other).
  // Viewfinder aid only: the photo stays one photo, nothing is split.
  ctx.strokeStyle = 'rgba(255,255,255,0.55)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(fr.x + fr.w / 2, fr.y);
  ctx.lineTo(fr.x + fr.w / 2, fr.y + fr.h);
  ctx.moveTo(fr.x, fr.y + fr.h / 2);
  ctx.lineTo(fr.x + fr.w, fr.y + fr.h / 2);
  ctx.stroke();
}
function setCameraHint(text, kind) {
  const hint = $('cameraHint');
  if (!hint) return;
  hint.textContent = text;
  hint.classList.remove('found', 'warn');
  if (kind) hint.classList.add(kind);
}

function runCameraEdgeDetect() {
  if (!perspectiveEnabled) { drawCameraFrame(); return; } // perspective off: show the 4:3 frame Capture will save
  const video = $('cameraVideo');
  const modal = $('cameraModal');
  if (!video || !video.videoWidth || !modal || !modal.classList.contains('open')) return;
  try {
    const maxW = 320;
    const scale = Math.min(1, maxW / video.videoWidth);
    const w = Math.max(2, Math.round(video.videoWidth * scale));
    const h = Math.max(2, Math.round(video.videoHeight * scale));
    const cv = document.createElement('canvas');
    cv.width = w; cv.height = h;
    const ctx = cv.getContext('2d');
    ctx.drawImage(video, 0, 0, w, h);
    const data = ctx.getImageData(0, 0, w, h).data;
    const gray = new Float32Array(w * h);
    for (let i = 0; i < w * h; i++) {
      gray[i] = 0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2];
    }
    const res = detectLiveQuad(gray, w, h);
    if (res && res.support >= 0.55) {
      // Green lock — good enough to straighten the shot on Capture.
      const back = 1 / scale;
      panelCameraQuad = { points: res.quad.map((p) => ({ x: p.x * back, y: p.y * back })), at: Date.now() };
      drawCameraOverlay(panelCameraQuad.points, '#22c55e');
      setCameraHint('Document found — tap Capture', 'found');
    } else if (res) {
      // Yellow — a document is probably there; hold steady for a lock.
      panelCameraQuad = null;
      const back = 1 / scale;
      drawCameraOverlay(res.quad.map((p) => ({ x: p.x * back, y: p.y * back })), '#eab308');
      setCameraHint('Hold steady — almost there', 'warn');
    } else {
      panelCameraQuad = null;
      drawCameraGuide();
      setCameraHint('Point the camera at the card…', '');
    }
  } catch (_) { /* detection never breaks the camera */ }
}

// Camera zoom: uses the camera's own zoom control (MediaStreamTrack
// zoom capability). The preview zooms live, so the frame/edge overlay
// and the capture need no changes — the zoomed picture is what the
// video element already shows, and Capture saves exactly that.
function cameraVideoTrack() {
  return (panelCameraStream && panelCameraStream.getVideoTracks
    && panelCameraStream.getVideoTracks()[0]) || null;
}
function updateCameraZoomUI() {
  const row = $('cameraZoomRow');
  const range = $('zoomRange');
  const label = $('zoomLabel');
  const outBtn = $('zoomOutBtn');
  const inBtn = $('zoomInBtn');
  if (!row || !range || !label) return;
  const z = panelCameraZoom;
  row.style.display = 'flex';
  if (!z.supported) {
    // No zoom on this camera — say so instead of showing a dead slider.
    if (outBtn) outBtn.style.display = 'none';
    range.style.display = 'none';
    if (inBtn) inBtn.style.display = 'none';
    label.style.minWidth = '0';
    label.textContent = 'This camera has no zoom';
  } else {
    if (outBtn) outBtn.style.display = '';
    range.style.display = '';
    if (inBtn) inBtn.style.display = '';
    label.style.minWidth = '42px';
    range.min = z.min; range.max = z.max; range.step = z.step; range.value = z.value;
    label.textContent = `${Number(z.value).toFixed(1)}×`;
  }
  updateCameraZoomChips();
}
// Zoom preset chips (1×, 2×, 3× …): one tap jumps straight to that level,
// the slider and the label follow. Only the whole-number levels the camera
// really offers are shown, so there is never a dead chip.
function updateCameraZoomChips() {
  const wrap = $('cameraZoomChips');
  if (!wrap) return;
  const z = panelCameraZoom;
  wrap.innerHTML = '';
  if (!z.supported) { wrap.style.display = 'none'; return; }
  const first = Math.max(1, Math.ceil(z.min));
  const levels = [];
  for (let lv = first; lv <= Math.floor(z.max) && levels.length < 4; lv++) levels.push(lv);
  if (!levels.length) levels.push(first);
  wrap.style.display = 'flex';
  levels.forEach((lv) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'btn camera-zoom-chip';
    b.textContent = `${lv}×`;
    b.dataset.level = String(lv);
    b.addEventListener('click', () => applyCameraZoom(lv));
    wrap.appendChild(b);
  });
  updateCameraZoomChipActive();
}
function updateCameraZoomChipActive() {
  const wrap = $('cameraZoomChips');
  if (!wrap) return;
  const z = panelCameraZoom;
  wrap.querySelectorAll('.camera-zoom-chip').forEach((b) => {
    const lv = parseFloat(b.dataset.level);
    b.classList.toggle('active', z.supported && Math.abs(z.value - lv) < 0.001);
  });
}
async function applyCameraZoom(value) {
  const track = cameraVideoTrack();
  const z = panelCameraZoom;
  if (!track || !track.applyConstraints || !z.supported) return false;
  const v = Math.min(z.max, Math.max(z.min, value));
  try {
    await track.applyConstraints({ advanced: [{ zoom: v }] });
    const settings = track.getSettings ? track.getSettings() : null;
    z.value = (settings && typeof settings.zoom === 'number') ? settings.zoom : v;
    const range = $('zoomRange');
    if (range) range.value = z.value;
    const label = $('zoomLabel');
    if (label) label.textContent = `${Number(z.value).toFixed(1)}×`;
    updateCameraZoomChipActive();
    return true;
  } catch (_) {
    // The camera refused it — put the slider back where the zoom is.
    const range = $('zoomRange');
    if (range) range.value = z.value;
    return false;
  }
}
function setupCameraZoom() {
  const track = cameraVideoTrack();
  panelCameraZoom = { min: 1, max: 1, step: 0.1, value: 1, supported: false };
  try {
    const caps = track && track.getCapabilities ? track.getCapabilities() : null;
    if (caps && caps.zoom) {
      const min = caps.zoom.min || 1;
      const max = caps.zoom.max || 1;
      panelCameraZoom = {
        min,
        max,
        step: caps.zoom.step || 0.1,
        value: Math.max(1, min),
        supported: max > min,
      };
    }
  } catch (_) {}
  updateCameraZoomUI();
}

async function startPanelCamera() {
  const video = $('cameraVideo');
  const constraints = {
    // Ask for the best the camera has (4K ideal, v4.9.35): 'ideal' is a
    // preference, not a demand — the browser never fails to start and just
    // gives the highest resolution the camera can do. If the tablet maxes
    // at 1080p, this gives exactly 1080p. The saved photo stays capped at
    // 1500px, so the file stays small; it just gets sharper, which also
    // helps the AI read the card. The panel never uploads photos to the
    // site, so the site's 200 KB photo limit does not apply here.
    video: { facingMode: panelCameraFacing, width: { ideal: 3840 }, height: { ideal: 2160 } },
    audio: false,
  };
  if (panelCameraDeviceId) constraints.video.deviceId = { exact: panelCameraDeviceId };
  panelCameraStream = await navigator.mediaDevices.getUserMedia(constraints);
  video.srcObject = panelCameraStream;
  $('cameraModal').classList.add('open');
  await video.play();
  setupCameraZoom();
  if (!perspectiveEnabled) {
    setCameraHint(frameHintText(), '');
    drawCameraFrame();
  }
  if (panelCameraDetectTimer) clearInterval(panelCameraDetectTimer);
  panelCameraDetectTimer = setInterval(runCameraEdgeDetect, 400);
}

async function openPanelCamera(category) {
  panelCameraCategory = category;
  panelCameraDeviceId = null;
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    openCameraFileInput(category); // very old browser — use the camera app
    return;
  }
  try {
    await startPanelCamera();
    setPanelWide(true); // bigger popup on tablet/desktop while shooting
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
  // Picker dismissed without a photo: the retake is abandoned, so the
  // old photo must not be replaced by some later unrelated upload.
  input.addEventListener('cancel', () => { retakeItem = null; }, { once: true });
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
  const cv = document.createElement('canvas');
  // If the live edge view found the document, straighten the shot now —
  // the crop editor then opens on an already-straight photo.
  let b64 = '';
  const quad = panelCameraQuad && (Date.now() - panelCameraQuad.at < 1500) ? panelCameraQuad.points : null;
  if (quad) {
    const scale = Math.min(1, maxDim / Math.max(video.videoWidth, video.videoHeight));
    cv.width = Math.max(1, Math.round(video.videoWidth * scale));
    cv.height = Math.max(1, Math.round(video.videoHeight * scale));
    cv.getContext('2d').drawImage(video, 0, 0, cv.width, cv.height);
    try {
      const qscale = cv.width / video.videoWidth;
      const warped = warpQuadImage(cv, quad.map((p) => ({ x: p.x * qscale, y: p.y * qscale })));
      b64 = warped.toDataURL('image/jpeg', 0.82).split(',')[1] || '';
    } catch (_) { b64 = ''; }
  }
  if (!b64) {
    // No green lock: save exactly what the white frame showed — the
    // frame's crop of the video (4:3 landscape, or 3:4 portrait) — so
    // the photo has less background outside the card instead of the
    // full wide video frame.
    const m = scanCoverMap(video.clientWidth, video.clientHeight, video.videoWidth, video.videoHeight);
    const fr = cameraFrameRect();
    let sx = 0, sy = 0, sw = video.videoWidth, sh = video.videoHeight;
    if (fr) {
      sx = Math.max(0, (fr.x - m.offsetX) / m.scale);
      sy = Math.max(0, (fr.y - m.offsetY) / m.scale);
      sw = Math.min(video.videoWidth - sx, fr.w / m.scale);
      sh = Math.min(video.videoHeight - sy, fr.h / m.scale);
    }
    const csc = Math.min(1, maxDim / Math.max(sw, sh));
    cv.width = Math.max(1, Math.round(sw * csc));
    cv.height = Math.max(1, Math.round(sh * csc));
    cv.getContext('2d').drawImage(video, sx, sy, sw, sh, 0, 0, cv.width, cv.height);
    b64 = cv.toDataURL('image/jpeg', 0.82).split(',')[1] || '';
  }
  if (!b64) {
    setStatus('Could not capture this photo — try again.', 'err');
    return;
  }
  // Retake: the new shot replaces the old photo in place (same list
  // position, same person binding), then opens in the crop editor.
  const replacing = retakeItem;
  retakeItem = null;
  stopPanelCamera();
  if (replacing) {
    replacing.base64 = b64;
    replacing.name = 'Camera.jpg';
    replacing.originalBase64 = null; // the old original belongs to the old shot
    replacing.source = 'camera';
    renderPreviews(panelCameraCategory);
    saveSessionState();
    openCropForImage(replacing);
    const titleEl = $('cropModalTitle');
    if (titleEl && cropQueue.length) titleEl.textContent = `Crop ${cropQueueTotal - cropQueue.length} of ${cropQueueTotal} — ${replacing.name}`;
    return;
  }
  addImage(panelCameraCategory, b64, 'Camera.jpg', 'camera');
  const item = state[panelCameraCategory][state[panelCameraCategory].length - 1];
  if (item) openCropForImage(item); // straight into the crop editor (no auto-scan for a camera photo)
}

async function switchPanelCamera() {
  const prevFacing = panelCameraFacing;
  const prevDeviceId = panelCameraStream && panelCameraStream.getVideoTracks
    && panelCameraStream.getVideoTracks()[0] && panelCameraStream.getVideoTracks()[0].getSettings
    ? panelCameraStream.getVideoTracks()[0].getSettings().deviceId : null;
  panelCameraFacing = prevFacing === 'environment' ? 'user' : 'environment';
  panelCameraDeviceId = null;
  try {
    // Prefer the other physical camera (like the website does via deviceId).
    const devices = await navigator.mediaDevices.enumerateDevices();
    const other = devices.filter((d) => d.kind === 'videoinput')
      .find((d) => d.deviceId && d.deviceId !== prevDeviceId);
    if (other) panelCameraDeviceId = other.deviceId;
  } catch (_) {}
  stopPanelCameraTracks();
  try {
    await startPanelCamera();
  } catch (_) {
    // Switch failed — go back to the previous camera.
    panelCameraFacing = prevFacing;
    panelCameraDeviceId = null;
    try {
      await startPanelCamera();
    } catch (_) {
      stopPanelCamera();
      setStatus('Could not switch camera.', 'err');
    }
  }
}

// Auto-crop queue: after a multi-photo upload, the crop editor opens for
// each new photo one by one. Apply Crop saves and advances; Retake opens
// the camera for a fresh shot of that photo (the queue resumes after it).
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
  setRetakeLabel(item.source === 'camera');
  setPanelWide(false); // crop editor uses the normal panel width
  const titleEl = $('cropModalTitle');
  if (titleEl) titleEl.textContent = 'Crop, Scan, Rotate & Zoom Image';

  // Show the crop screen immediately; the photo draws as soon as it decodes.
  $('fcViewerModal').style.display = 'none';
  $('cropModal').classList.add('open');

  rawImage = new Image();
  rawImage.onload = () => {
    autoPickCropRatio();
    const canvas = $('cropCanvas');
    applyCropCanvasSize();
    zoomLevel = 1;
    rotationAngle = 0;
    panX = 0;
    panY = 0;
    $('zoomRange').value = 1;
    drawCropCanvas();
    // Auto-crop (CamScanner-style) is upload-only: a camera photo was
    // already straightened on Capture when the green lock was on — with
    // no lock it stays as-shot for manual crop. Items without a source
    // (older sessions, imports) keep the old behaviour.
    cropOriginalImage = rawImage;
    cropAutoScanned = false;
    updateUndoScanBtn();
    if (item.source !== 'camera') autoScanCrop(false);
  };
  rawImage.onerror = () => {
    $('cropModal').classList.remove('open');
    setStatus('Could not load this photo for cropping.', 'err');
  };
  // Re-cropping always starts from the original photo, never from a
  // previous crop — so a crop you didn't like can simply be done again.
  rawImage.src = `data:image/jpeg;base64,${item.originalBase64 || item.base64}`;
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

function scanValidateQuad(quad, w, h, opts) {
  const o = opts || {};
  const minArea = o.minArea !== undefined ? o.minArea : 0.12;
  const maxArea = o.maxArea !== undefined ? o.maxArea : 0.98;
  if (!quad || quad.length !== 4) return false;
  // Distinct corners (at least 8px apart).
  for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) {
    const dx = quad[i].x - quad[j].x, dy = quad[i].y - quad[j].y;
    if (dx * dx + dy * dy < 64) return false;
  }
  const area = scanQuadArea(quad);
  const imgArea = w * h;
  if (area < imgArea * minArea || area > imgArea * maxArea) return false;
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

function scanDetectDocument(gray, w, h, opts) {
  // Full pipeline. Returns {quad, support} or null. opts: minSupport
  // (default 0.55), minArea / maxArea (defaults 0.12 / 0.98).
  const o = opts || {};
  const minSupport = o.minSupport !== undefined ? o.minSupport : 0.55;
  const blur = scanBlur(gray, w, h, 2);
  const { mag, maxMag } = scanSobel(blur, w, h);
  if (maxMag < 40) return null; // no strong edge at all
  let best = null, bestScore = -1, bestSupport = 0;
  const consider = (quad, thr) => {
    if (!quad || !scanValidateQuad(quad, w, h, o)) return;
    const support = scanQuadSupport(quad, mag, thr, w, h);
    if (support < minSupport) return;
    const areaFrac = scanQuadArea(quad) / (w * h);
    const score = support + 0.1 * Math.min(1, areaFrac / 0.4);
    if (score > bestScore) { bestScore = score; best = quad; bestSupport = support; }
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
  if (refined && scanValidateQuad(refined, w, h, o)) return { quad: refined, support: bestSupport };
  return { quad: best, support: bestSupport };
}

function detectDocumentQuad(gray, w, h) {
  // gray: 0..255 values, w*h. Returns ordered quad or null (strict: used
  // for the crop editor's warp, where a bad quad is worse than no quad).
  const r = scanDetectDocument(gray, w, h, {});
  return r ? r.quad : null;
}

function detectLiveQuad(gray, w, h) {
  // Relaxed for the live viewfinder: a faint or frame-filling card still
  // gets a guide outline; only a strong lock is used for the capture warp.
  return scanDetectDocument(gray, w, h, { minSupport: 0.4, minArea: 0.08, maxArea: 0.995 });
}
function scanCoverMap(stageW, stageH, videoW, videoH) {
  // object-fit: cover — how a raw video frame maps onto the displayed stage.
  // Returns {scale, offsetX, offsetY}: display = raw * scale + offset.
  const scale = Math.max(stageW / videoW, stageH / videoH);
  return { scale, offsetX: (stageW - videoW * scale) / 2, offsetY: (stageH - videoH * scale) / 2 };
}

// --- end document scanner pure functions ---

// --- Freeform crop box + camera frame: pure helpers (no DOM) — tested by tests/sidepanel_freeform_test.js ---
// Camera frame: 92% of the stage, centred — clamped so the frame always
// fits inside the stage even when the dialog squeezes it short
// (landscape): a 4:3 frame taller than a squished stage used to lose its
// top and bottom borders. Raised from 86% (v4.9.34): a bigger frame
// captures more of the video, so the clicked photo is sharper.
function fitFrameRect(sw, sh, portrait) {
  const S = 0.92;
  if (portrait) {
    let h = sh * S, w = h * 3 / 4;
    if (w > sw * S) { w = sw * S; h = w * 4 / 3; }
    return { x: (sw - w) / 2, y: (sh - h) / 2, w, h };
  }
  let w = sw * S, h = w * 3 / 4;
  if (h > sh * S) { h = sh * S; w = h * 4 / 3; }
  return { x: (sw - w) / 2, y: (sh - h) / 2, w, h };
}
// Keep a Freeform box inside the canvas, at least minSize on a side.
function clampFreeRect(r, cw, ch, minSize) {
  const m = minSize || 20;
  let w = Math.max(m, Math.min(r.w, cw));
  let h = Math.max(m, Math.min(r.h, ch));
  let x = Math.max(0, Math.min(r.x, cw - w));
  let y = Math.max(0, Math.min(r.y, ch - h));
  return { x, y, w, h };
}
// Which part of the box is under (x, y) — a corner/edge handle, inside
// (move), or null (outside). tol is in the same units as the rect.
function freeRectHandleAt(r, x, y, tol) {
  const t = tol || 14;
  const near = (a, b) => Math.abs(a - b) <= t;
  const cx = r.x + r.w / 2, cy = r.y + r.h / 2;
  if (near(x, r.x) && near(y, r.y)) return 'nw';
  if (near(x, r.x + r.w) && near(y, r.y)) return 'ne';
  if (near(x, r.x) && near(y, r.y + r.h)) return 'sw';
  if (near(x, r.x + r.w) && near(y, r.y + r.h)) return 'se';
  if (near(y, r.y) && x > r.x && x < r.x + r.w) return 'n';
  if (near(y, r.y + r.h) && x > r.x && x < r.x + r.w) return 's';
  if (near(x, r.x) && y > r.y && y < r.y + r.h) return 'w';
  if (near(x, r.x + r.w) && y > r.y && y < r.y + r.h) return 'e';
  if (x > r.x && x < r.x + r.w && y > r.y && y < r.y + r.h) return 'inside';
  return null;
}
// Move/resize a box by (dx, dy) from a handle, clamped so the box stays
// inside the canvas and never shrinks below minSize (the drag stops at
// the limit instead of sliding the box).
function resizeFreeRect(r, handle, dx, dy, cw, ch, minSize) {
  const m = minSize || 20;
  let { x, y, w, h } = r;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(v, hi));
  if (handle === 'inside') {
    dx = clamp(dx, -x, cw - (x + w));
    dy = clamp(dy, -y, ch - (y + h));
    return { x: x + dx, y: y + dy, w, h };
  }
  if (handle === 'se' || handle === 'ne' || handle === 'e') dx = clamp(dx, -(w - m), cw - (x + w));
  if (handle === 'se' || handle === 'sw' || handle === 's') dy = clamp(dy, -(h - m), ch - (y + h));
  if (handle === 'nw' || handle === 'sw' || handle === 'w') dx = clamp(dx, -x, w - m);
  if (handle === 'nw' || handle === 'ne' || handle === 'n') dy = clamp(dy, -y, h - m);
  if (handle === 'nw' || handle === 'sw' || handle === 'w') { x += dx; w -= dx; }
  if (handle === 'ne' || handle === 'se' || handle === 'e') { w += dx; }
  if (handle === 'nw' || handle === 'ne' || handle === 'n') { y += dy; h -= dy; }
  if (handle === 'sw' || handle === 'se' || handle === 's') { h += dy; }
  return clampFreeRect({ x, y, w, h }, cw, ch, m);
}
// --- end freeform crop box pure helpers ---

function drawCropCanvas(drawBox = true) {
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
  lastCropFit = { boundW, boundH, fitScale };
  ctx.scale(totalScale, totalScale);
  ctx.rotate(rad);

  ctx.drawImage(rawImage, -rawImage.width / 2, -rawImage.height / 2);
  ctx.restore();
  if (drawBox) drawFreeCropBox();
}

// Freeform box (DOM helpers — the geometry lives in the pure section).
function cropCanvasPoint(clientX, clientY) {
  const canvas = $('cropCanvas');
  if (!canvas) return null;
  const rect = canvas.getBoundingClientRect();
  if (!rect.width || !rect.height) return null;
  return {
    x: (clientX - rect.left) * (canvas.width / rect.width),
    y: (clientY - rect.top) * (canvas.height / rect.height)
  };
}
function freeHandleTol() {
  const canvas = $('cropCanvas');
  if (!canvas) return 14;
  const rect = canvas.getBoundingClientRect();
  return rect.width ? 14 * (canvas.width / rect.width) : 14;
}
// The photo's drawn bounds in canvas px — what the Freeform box starts as.
function fittedPhotoRect() {
  const canvas = $('cropCanvas');
  if (!rawImage || !canvas) return null;
  if (!lastCropFit) drawCropCanvas();
  if (!lastCropFit) return null;
  const w = lastCropFit.boundW * lastCropFit.fitScale * zoomLevel;
  const h = lastCropFit.boundH * lastCropFit.fitScale * zoomLevel;
  return clampFreeRect({
    x: canvas.width / 2 + panX - w / 2,
    y: canvas.height / 2 + panY - h / 2,
    w, h
  }, canvas.width, canvas.height, 20);
}
function initFreeCropBox() {
  if (cropRatio !== 'free') return;
  freeCropRect = fittedPhotoRect();
}
function drawFreeCropBox() {
  const canvas = $('cropCanvas');
  if (cropRatio !== 'free' || !freeCropRect || !canvas) return;
  const ctx = canvas.getContext('2d');
  const r = freeCropRect;
  // Dim everything outside the box, so the selection reads clearly.
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.fillRect(0, 0, canvas.width, r.y);
  ctx.fillRect(0, r.y + r.h, canvas.width, canvas.height - (r.y + r.h));
  ctx.fillRect(0, r.y, r.x, r.h);
  ctx.fillRect(r.x + r.w, r.y, canvas.width - (r.x + r.w), r.h);
  // White border + corner/edge handles. Handles are sized in display px
  // so they stay grabbable however the canvas is shown.
  const disp = canvas.getBoundingClientRect();
  const scale = disp.width ? canvas.width / disp.width : 1;
  const hs = 11 * scale; // handle half-size (~11 display px)
  ctx.strokeStyle = 'rgba(255,255,255,0.95)';
  ctx.lineWidth = 2;
  ctx.strokeRect(r.x, r.y, r.w, r.h);
  const pts = [
    [r.x, r.y], [r.x + r.w / 2, r.y], [r.x + r.w, r.y],
    [r.x, r.y + r.h / 2], [r.x + r.w, r.y + r.h / 2],
    [r.x, r.y + r.h], [r.x + r.w / 2, r.y + r.h], [r.x + r.w, r.y + r.h]
  ];
  pts.forEach(([px, py]) => {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(px - hs, py - hs, hs * 2, hs * 2);
    ctx.strokeStyle = 'rgba(0,0,0,0.5)';
    ctx.lineWidth = 1;
    ctx.strokeRect(px - hs, py - hs, hs * 2, hs * 2);
  });
}
// In Free mode Apply saves exactly the boxed region, not the whole canvas.
// The white box outline and handles are drawn on this same canvas while
// editing — so redraw the photo WITHOUT them first, or the box gets baked
// into the saved photo as a white border.
function freeRegionDataUrl(canvas) {
  const r = freeCropRect;
  drawCropCanvas(false); // clean redraw: photo only, no box, no handles
  const out = document.createElement('canvas');
  out.width = Math.max(1, Math.round(r.w));
  out.height = Math.max(1, Math.round(r.h));
  const ctx = out.getContext('2d');
  ctx.drawImage(canvas, r.x, r.y, r.w, r.h, 0, 0, out.width, out.height);
  return out.toDataURL('image/jpeg', 0.85).split(',')[1];
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

// Retake button label/icon follows the photo's source: a camera photo
// is retaken with the camera, an upload is replaced by picking a new
// file (Re-upload).
function setRetakeLabel(isCamera) {
  const btn = $('cancelCropBtn');
  if (!btn) return;
  const camIc = btn.querySelector('.retake-ic-cam');
  const upIc = btn.querySelector('.retake-ic-up');
  const label = btn.querySelector('.retake-label');
  if (camIc) camIc.style.display = isCamera ? '' : 'none';
  if (upIc) upIc.style.display = isCamera ? 'none' : '';
  if (label) label.textContent = isCamera ? 'Retake' : 'Re-upload';
  btn.title = isCamera ? 'Retake this photo with the camera' : 'Re-upload a different photo';
}

function updateUndoScanBtn() {
  const btn = $('undoScanBtn');
  if (!btn) return;
  btn.style.display = cropAutoScanned ? '' : 'none';
}

// Undo a wrong auto-crop: put the photo back exactly as it arrived,
// so it can be cropped by hand or scanned again with the Scan button.
function undoAutoScan() {
  if (!cropAutoScanned || !cropOriginalImage) return;
  rawImage = cropOriginalImage;
  cropAutoScanned = false;
  rotationAngle = 0;
  zoomLevel = 1;
  panX = 0;
  panY = 0;
  $('zoomRange').value = 1;
  const canvas = $('cropCanvas');
  applyCropCanvasSize();
  drawCropCanvas();
  updateUndoScanBtn();
  if (cropRatio === 'free') { initFreeCropBox(); drawCropCanvas(); }
  setStatus('Auto-crop undone — the original photo is back. Crop it by hand or tap Scan to try again.', 'ok');
}

async function autoScanCrop(manual) {
  // Upload auto-scan always runs — exactly like v4.6. The Perspective
  // toggle only switches the camera's live detection (outlines + the
  // capture straightening); it never blocks an upload's auto-crop.
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
    cropAutoScanned = true;
    updateUndoScanBtn();
    const canvas = $('cropCanvas');
    canvas.width = warped.width;
    canvas.height = warped.height;
    rotationAngle = 0;
    zoomLevel = 1;
    panX = 0;
    panY = 0;
    $('zoomRange').value = 1;
    drawCropCanvas();
    if (cropRatio === 'free') { initFreeCropBox(); drawCropCanvas(); }
    setStatus('Document detected — auto-cropped.', 'ok');
    return true;
  } catch (_) {
    if (manual) setStatus('Scan failed — crop it by hand.', 'err');
    return false;
  }
}

function updatePerspectiveToggle() {
  for (const id of ['perspectiveToggleBtn', 'perspectiveToggleCamBtn']) {
    const btn = $(id);
    if (!btn) continue;
    btn.style.background = perspectiveEnabled ? '#2563eb' : '#475569';
    btn.title = perspectiveEnabled ? 'Perspective detection: On — tap to turn off' : 'Perspective detection: Off — tap to turn on';
    const label = btn.querySelector('.persp-state');
    if (label) label.textContent = perspectiveEnabled ? 'On' : 'Off';
  }
}

function togglePerspective() {
  perspectiveEnabled = !perspectiveEnabled;
  try { localStorage.setItem('fc_pro_perspective', perspectiveEnabled ? '1' : '0'); } catch (_) {}
  updatePerspectiveToggle();
  if (perspectiveEnabled) {
    setStatus('Perspective detection on.', 'ok');
  } else {
    setStatus('Perspective detection off — no outlines in the camera.');
    drawCameraOverlay(null);
    setCameraHint(frameHintText(), '');
    drawCameraFrame();
  }
}

function cropCanvasSize() {
  if (cropRatio === '3:4') return { w: 675, h: 900 };
  if (cropRatio === '4:3') return { w: 900, h: 675 };
  return { w: 900, h: 600 }; // free — the photo as it is
}
function applyCropCanvasSize() {
  const canvas = $('cropCanvas');
  if (!canvas) return;
  const s = cropCanvasSize();
  canvas.width = s.w;
  canvas.height = s.h;
}
function updateCropRatioButtons() {
  const map = { '4:3': 'cropRatio43Btn', '3:4': 'cropRatio34Btn', 'free': 'cropRatioFreeBtn' };
  Object.entries(map).forEach(([ratio, id]) => {
    const btn = $(id);
    if (btn) btn.style.background = cropRatio === ratio ? '#2563eb' : '#475569';
  });
}
function setCropRatio(r) {
  if (!rawImage || cropRatio === r) return;
  cropRatio = r;
  updateCropRatioButtons();
  // The frame changed — start from a clean fit (zoom 1, centred).
  zoomLevel = 1; panX = 0; panY = 0;
  const zr = $('zoomRange');
  if (zr) { zr.min = cropRatio === 'free' ? '0.5' : '1'; zr.value = 1; }
  applyCropCanvasSize();
  drawCropCanvas();
  // Entering Free: the box starts as the full photo.
  if (cropRatio === 'free') { initFreeCropBox(); drawCropCanvas(); }
}
function autoPickCropRatio() {
  // Pick the frame that matches the photo: landscape photo → 4:3,
  // portrait photo → 3:4. Free is a manual choice, never auto-picked.
  // In a ratio frame the zoom can never go below 1, so the photo can
  // never shrink below the frame and bake black bars into the save.
  if (!rawImage) return;
  cropRatio = rawImage.width >= rawImage.height ? '4:3' : '3:4';
  updateCropRatioButtons();
  const zr = $('zoomRange');
  if (zr) zr.min = '1';
}

function setupNativeCropper() {
  const canvas = $('cropCanvas');
  const zoomRange = $('zoomRange');
  const rotateBtn = $('rotateCropBtn');
  const rotateLeftBtn = $('rotateLeftCropBtn');
  const scanBtn = $('scanCropBtn');
  const perspBtn = $('perspectiveToggleBtn');

  if (perspBtn) {
    perspBtn.addEventListener('click', togglePerspective);
  }
  updatePerspectiveToggle();

  const ratio43Btn = $('cropRatio43Btn');
  if (ratio43Btn) ratio43Btn.addEventListener('click', () => setCropRatio('4:3'));
  const ratio34Btn = $('cropRatio34Btn');
  if (ratio34Btn) ratio34Btn.addEventListener('click', () => setCropRatio('3:4'));
  const ratioFreeBtn = $('cropRatioFreeBtn');
  if (ratioFreeBtn) ratioFreeBtn.addEventListener('click', () => setCropRatio('free'));
  updateCropRatioButtons();

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

  const undoBtn = $('undoScanBtn');
  if (undoBtn) {
    undoBtn.addEventListener('click', undoAutoScan);
  }
  updateUndoScanBtn();

  if (zoomRange) {
    zoomRange.addEventListener('input', (e) => {
      zoomLevel = parseFloat(e.target.value);
      drawCropCanvas();
    });
  }

  if (canvas) {
    canvas.addEventListener('mousedown', (e) => {
      // Freeform: grabbing a handle resizes the box, grabbing inside it
      // moves it — only a grab outside the box pans the photo.
      if (cropRatio === 'free' && freeCropRect) {
        const p = cropCanvasPoint(e.clientX, e.clientY);
        if (p) {
          const mode = freeRectHandleAt(freeCropRect, p.x, p.y, freeHandleTol());
          if (mode) {
            freeDrag = { mode, startX: p.x, startY: p.y, rect: { ...freeCropRect } };
            return;
          }
        }
      }
      isDragging = true;
      startX = e.clientX - panX;
      startY = e.clientY - panY;
    });

    window.addEventListener('mousemove', (e) => {
      if (freeDrag) {
        const p = cropCanvasPoint(e.clientX, e.clientY);
        const cv = $('cropCanvas');
        if (p && cv) {
          freeCropRect = resizeFreeRect(freeDrag.rect, freeDrag.mode, p.x - freeDrag.startX, p.y - freeDrag.startY, cv.width, cv.height);
          drawCropCanvas();
        }
        return;
      }
      if (!isDragging) return;
      panX = e.clientX - startX;
      panY = e.clientY - startY;
      drawCropCanvas();
    });

    window.addEventListener('mouseup', () => { isDragging = false; freeDrag = null; });

    canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        e.preventDefault();
        if (cropRatio === 'free' && freeCropRect) {
          const p = cropCanvasPoint(e.touches[0].clientX, e.touches[0].clientY);
          if (p) {
            const mode = freeRectHandleAt(freeCropRect, p.x, p.y, freeHandleTol());
            if (mode) {
              freeDrag = { mode, startX: p.x, startY: p.y, rect: { ...freeCropRect } };
              return;
            }
          }
        }
        isDragging = true;
        startX = e.touches[0].clientX - panX;
        startY = e.touches[0].clientY - panY;
      }
    }, { passive: false });

    window.addEventListener('touchmove', (e) => {
      if (freeDrag && e.touches.length === 1) {
        const p = cropCanvasPoint(e.touches[0].clientX, e.touches[0].clientY);
        const cv = $('cropCanvas');
        if (p && cv) {
          freeCropRect = resizeFreeRect(freeDrag.rect, freeDrag.mode, p.x - freeDrag.startX, p.y - freeDrag.startY, cv.width, cv.height);
          drawCropCanvas();
        }
        return;
      }
      if (!isDragging || e.touches.length !== 1) return;
      panX = e.touches[0].clientX - startX;
      panY = e.touches[0].clientY - startY;
      drawCropCanvas();
    }, { passive: true });

    window.addEventListener('touchend', () => { isDragging = false; freeDrag = null; });
  }

  $('cancelCropBtn').addEventListener('click', () => {
    $('cropModal').classList.remove('open');
    // Real Retake: discard this shot and take a fresh one in its place.
    // Camera photo → the camera opens; Capture replaces THIS photo.
    // Upload photo → pick a replacement file instead (Re-upload).
    // Cancelling keeps the old photo exactly as it was.
    const item = activeCropItem;
    const cat = (item && itemCategory(item)) || activeCategory || 'head';
    const isCamera = !!item && item.source === 'camera';
    activeCropItem = null;
    activeCategory = null;
    if (item && itemCategory(item)) retakeItem = item;
    if (isCamera) {
      openPanelCamera(cat);
      return;
    }
    const input = $(cat === 'head' ? 'headUpload' : 'otherUpload');
    if (input) {
      // Picker dismissed without a file: the re-upload is abandoned, so
      // the old photo must not be replaced by a later unrelated upload.
      input.addEventListener('cancel', () => { retakeItem = null; }, { once: true });
      input.click();
    } else {
      openCameraFileInput(cat);
    }
  });

  $('saveCropBtn').addEventListener('click', async () => {
    const canvas = $('cropCanvas');
    if (!canvas) return;
    // Freeform: Apply saves exactly the boxed region, not the whole canvas.
    const b64 = (cropRatio === 'free' && freeCropRect)
      ? freeRegionDataUrl(canvas)
      : canvas.toDataURL('image/jpeg', 0.85).split(',')[1];
    $('cropModal').classList.remove('open');

    if (activeCropItem) {
      const croppedItem = activeCropItem;
      activeCropItem = null; // claim it before the async downscale, so a tap during the wait can't steal it
      // Keep the original (first crop only) so a crop you didn't like can
      // be re-done from the original or undone — the true original is
      // never lost. Later crops never overwrite it.
      if (!croppedItem.originalBase64) {
        croppedItem.originalBase64 = await downscaleBase64(croppedItem.base64);
      }
      croppedItem.base64 = b64;
      renderPreviews('head');
      renderPreviews('other');
      saveSessionState();

      // Cropping queue: advance to the next photo. Otherwise Apply just
      // returns to the list — no preview pops open after a crop.
      if (cropQueue.length) {
        setStatus(`Cropped ${cropQueueTotal - cropQueue.length} of ${cropQueueTotal}.`, 'ok');
        openNextQueuedCrop();
      } else {
        setStatus('Image cropped and updated.', 'ok');
      }
    } else if (activeCategory) {
      // Single upload (or retake via the file picker): the photo is only
      // added when Apply Crop is tapped. A retake replaces the old photo
      // instead of adding a new one.
      const cat = activeCategory;
      const replacing = retakeItem;
      retakeItem = null;
      activeCategory = null;
      if (replacing) {
        replacing.base64 = b64;
        replacing.name = activeCropName || replacing.name;
        replacing.originalBase64 = null; // the old original belongs to the old shot
        replacing.source = 'upload';
        renderPreviews(itemCategory(replacing));
        saveSessionState();
        if (cropQueue.length) {
          setStatus(`Cropped ${cropQueueTotal - cropQueue.length} of ${cropQueueTotal}.`, 'ok');
          openNextQueuedCrop();
        } else {
          setStatus('Photo retaken.', 'ok');
        }
      } else {
        // First crop of a fresh upload: the photo isn't in the list yet,
        // so keep the uploaded original (downscaled) alongside the crop —
        // otherwise this first crop could never be undone or re-done.
        const origB64 = rawImage && rawImage.src ? rawImage.src.split(',')[1] : '';
        const item = { id: nextId++, base64: b64, name: activeCropName || 'Cropped_Photo.jpg', relation: 'Auto', boundRef: null, boundRefs: [], source: 'upload' };
        if (origB64 && origB64 !== b64) item.originalBase64 = await downscaleBase64(origB64);
        state[cat].push(item);
        renderPreviews(cat);
        saveSessionState();
        setStatus('Cropped photo added.', 'ok');
      }
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

// Find a previous record's benefit values for a member (by NID, else by
// name) so a hand-set Yes survives a re-extract that omits these fields.
function prevMemberBenefit(prev, nidOrBrn, nameBn, nameEn) {
  if (!prev || !Array.isArray(prev.family_members)) return null;
  const id = String(nidOrBrn || '').trim();
  const nb = String(nameBn || '').trim();
  const ne = String(nameEn || '').trim();
  const found = prev.family_members.find((p) => {
    if (id && String(p.nid_or_brn || '').trim() === id) return true;
    if (nb && String(p.name_bn || '').trim() === nb) return true;
    if (ne && String(p.name_en || '').trim() === ne) return true;
    return false;
  });
  return found || null;
}

// Same-person check for benefit inheritance (v4.9.49): two IDs are
// the same person only when both are non-empty and equal after
// digit normalisation. A name alone never proves it.
function samePersonId(a, b) {
  const x = toEnglishDigits(String(a || '')).replace(/\s+/g, '');
  const y = toEnglishDigits(String(b || '')).replace(/\s+/g, '');
  return x.length > 0 && x === y;
}

// Previous benefit values for a member, matched by NID/BRN only
// (v4.9.49) — never by name, so a Yes cannot bleed into a different
// person who happens to share the name (or into a different family
// extracted in the same tab).
function prevMemberBenefitById(prev, nidOrBrn) {
  const want = toEnglishDigits(String(nidOrBrn || '')).replace(/\s+/g, '');
  if (!want || !prev || !Array.isArray(prev.family_members)) return null;
  for (const m of prev.family_members) {
    const id = toEnglishDigits(String(m?.nid_or_brn || m?.nid || '')).replace(/\s+/g, '');
    if (id && id === want) return m;
  }
  return null;
}

function normalizeOutput(raw, preserveOrder = false, prev = null) {
  const s = (v) => (v == null ? '' : String(v).trim());
  const h = raw?.head || {};
  const headDob = normalizeDob(h.dob);
  // 13-digit old NID -> 17 digits with the birth year (v4.9.47); a
  // wrong-length ID stays as typed and the card warns about it.
  const cleanHeadId = checkIdNumber(s(h.nid), headDob, h.doc_type).value;
  // Remember a converted 13-digit NID (v4.9.49): this 17-digit value
  // is an NID, so the manual 17-digit rule must not flip it to BRN.
  if (toEnglishDigits(s(h.nid)).replace(/\s+/g, '').length === 13 && cleanHeadId && cleanHeadId.length === 17) converted13NidValues.add(cleanHeadId);
  const headGender = inferGender('Wife', h.gender || 'Female', h.name_en, h.name_bn);
  const headAge = calculateAgeYears(headDob);

  const head = {
    // A 13-digit number is always an old NID (a BRN is 17 digits), so
    // a converted 13-digit ID stays NID even though it is 17 digits now.
    doc_type: toEnglishDigits(s(h.nid)).replace(/\s+/g, '').length === 13 ? 'NID' : inferDocType(cleanHeadId, h.doc_type),
    gender: headGender,
    gender_id: GENDER_ID_MAP[headGender] || 2,
    religion: s(h.religion) || 'Islam',
    religion_id: RELIGION_ID_MAP[s(h.religion)] || 1,
    name_bn: stripLatinLetters(s(h.name_bn)),
    name_en: stripNonEnglishName(formatEnglishName(h.name_en)),
    father_name_bn: stripLatinLetters(s(h.father_name_bn)),
    father_name_en: stripNonEnglishName(formatEnglishName(h.father_name_en)),
    mother_name_bn: stripLatinLetters(s(h.mother_name_bn)),
    mother_name_en: stripNonEnglishName(formatEnglishName(h.mother_name_en)),
    nid: cleanHeadId,
    dob: headDob,
    age: headAge,
    source_images: Array.isArray(h.source_images) ? h.source_images : []
  };
  // A remembered education pick (from the popup) lives on the head
  // record — keep it through rebuilds, or a session restore drops it
  // and the popup asks again.
  if (h.education_status_id !== undefined && h.education_status_id !== null && String(h.education_status_id).trim() !== '') {
    head.education_status_id = Number(h.education_status_id);
  }
  // Profession / marital (v4.9.39): keep an explicit pick through
  // rebuilds (a Pull payload carries neither, so the previous record's
  // pick is the fallback — otherwise the DOB derivation would refill
  // the display with the guess and disagree with head_options).
  if (h.profession !== undefined && h.profession !== null && String(h.profession).trim() !== '') {
    head.profession = Number(h.profession);
  } else if (prev && prev.head && prev.head.profession !== undefined && prev.head.profession !== null && String(prev.head.profession).trim() !== '') {
    head.profession = Number(prev.head.profession);
  }
  if (h.marital_status !== undefined && h.marital_status !== null && String(h.marital_status).trim() !== '') {
    head.marital_status = Number(h.marital_status);
    head.maritial_status_id = Number(h.marital_status);
  } else if (prev && prev.head && prev.head.marital_status !== undefined && prev.head.marital_status !== null && String(prev.head.marital_status).trim() !== '') {
    head.marital_status = Number(prev.head.marital_status);
    head.maritial_status_id = Number(prev.head.marital_status);
  } else if (h.maritial_status_id !== undefined && h.maritial_status_id !== null && String(h.maritial_status_id).trim() !== '') {
    head.marital_status = Number(h.maritial_status_id);
    head.maritial_status_id = Number(h.maritial_status_id);
  }
  // Benefit (v4.9.36, v4.9.49): the head's SSNP / card / DSS, same as
  // a member. Default is No (0) — the user asked for No as the
  // default, Auto-Fill fills No, and a family that has a benefit sets
  // it by hand. The AI never returns these fields, so after an AI
  // extract they come only from the previous record — and only for the
  // SAME person (matched by NID/BRN): prev may be a different family
  // extracted in the same tab, and a Yes must never bleed across
  // families. A Pull / import / session payload (preserveOrder) carries
  // the form's own values, so those are taken as-is. A Halnagad
  // beneficiary is set to Yes after this runs.
  const headSamePerson = !!(prev && prev.head && samePersonId(cleanHeadId, prev.head.nid || prev.head.nid_or_brn));
  const headPrev = headSamePerson ? prev.head : null;
  if (preserveOrder && (h.is_ssnp_covered === 0 || h.is_ssnp_covered === 1 || h.is_ssnp_covered === '0' || h.is_ssnp_covered === '1')) {
    head.is_ssnp_covered = Number(h.is_ssnp_covered);
  } else if (headPrev && (headPrev.is_ssnp_covered === 0 || headPrev.is_ssnp_covered === 1)) {
    head.is_ssnp_covered = Number(headPrev.is_ssnp_covered);
  } else {
    head.is_ssnp_covered = 0;
  }
  if (preserveOrder && Array.isArray(h.facilities_ids) && h.facilities_ids.length) {
    head.facilities_ids = h.facilities_ids.map(v => Number(v)).filter(v => !Number.isNaN(v));
  } else if (headPrev && Array.isArray(headPrev.facilities_ids) && headPrev.facilities_ids.length) {
    head.facilities_ids = headPrev.facilities_ids.map(v => Number(v)).filter(v => !Number.isNaN(v));
  }
  if (preserveOrder && (h.is_dss_training_or_financial_benefit === 0 || h.is_dss_training_or_financial_benefit === 1 || h.is_dss_training_or_financial_benefit === '0' || h.is_dss_training_or_financial_benefit === '1')) {
    head.is_dss_training_or_financial_benefit = Number(h.is_dss_training_or_financial_benefit);
  } else if (headPrev && (headPrev.is_dss_training_or_financial_benefit === 0 || headPrev.is_dss_training_or_financial_benefit === 1)) {
    head.is_dss_training_or_financial_benefit = Number(headPrev.is_dss_training_or_financial_benefit);
  } else {
    head.is_dss_training_or_financial_benefit = 0;
  }
  // SSNP No can never carry a card (v4.9.49).
  if (head.is_ssnp_covered !== 1 && Array.isArray(head.facilities_ids) && head.facilities_ids.length) head.facilities_ids = [];
  // Phone + MFS (v4.9.49): the head's mobile number and MFS provider.
  // The site rejects Bangla digits in a mobile number, so normalize
  // to English digits here too (the card does it on blur as well). A
  // previous record's phone/MFS carry over only for the SAME person
  // (headPrev) — a phone must never bleed across families.
  const cleanHeadMobile = checkMobileNumber(h.mobile_number).value;
  if (cleanHeadMobile) head.mobile_number = cleanHeadMobile;
  else if (headPrev && headPrev.mobile_number) head.mobile_number = checkMobileNumber(headPrev.mobile_number).value || headPrev.mobile_number;
  if (h.mfs_provider_id !== undefined && h.mfs_provider_id !== null && String(h.mfs_provider_id).trim() !== '') {
    head.mfs_provider_id = Number(h.mfs_provider_id);
  } else if (headPrev && headPrev.mfs_provider_id !== undefined && headPrev.mfs_provider_id !== null && String(headPrev.mfs_provider_id).trim() !== '') {
    head.mfs_provider_id = Number(headPrev.mfs_provider_id);
  }
  // Disability + Health (v4.9.50): the head card carries the same
  // Disabled / Disability Type / Health fields as a member card — they
  // ride on the head member row. A previous record's values carry over
  // only for the SAME person (headPrev).
  if (h.is_disabled === 0 || h.is_disabled === 1 || h.is_disabled === '0' || h.is_disabled === '1') {
    head.is_disabled = Number(h.is_disabled);
  } else if (headPrev && (headPrev.is_disabled === 0 || headPrev.is_disabled === 1 || headPrev.is_disabled === '0' || headPrev.is_disabled === '1')) {
    head.is_disabled = Number(headPrev.is_disabled);
  } else {
    head.is_disabled = 0;
  }
  if (h.disability_type_id !== undefined && h.disability_type_id !== null && String(h.disability_type_id).trim() !== '') {
    head.disability_type_id = Number(h.disability_type_id);
  } else if (headPrev && headPrev.disability_type_id !== undefined && headPrev.disability_type_id !== null && String(headPrev.disability_type_id).trim() !== '') {
    head.disability_type_id = Number(headPrev.disability_type_id);
  }
  if (h.health_condition_id !== undefined && h.health_condition_id !== null && String(h.health_condition_id).trim() !== '') {
    head.health_condition_id = Number(h.health_condition_id);
  } else if (headPrev && headPrev.health_condition_id !== undefined && headPrev.health_condition_id !== null && String(headPrev.health_condition_id).trim() !== '') {
    head.health_condition_id = Number(headPrev.health_condition_id);
  }

  const members = Array.isArray(raw?.family_members) ? raw.family_members : [];
  const deduped = [];
  const seen = new Map();

  for (const m of members) {
    // Skip empty ghost entries from NID back-side images
    const rawNameBn = s(m?.name_bn);
    const rawNameEn = s(m?.name_en);
    const rawMemId = toEnglishDigits(s(m?.nid_or_brn)).replace(/\s+/g, '');
    const memDobEarly = normalizeDob(m?.dob);
    // 13-digit old NID -> 17 digits with the birth year (v4.9.47).
    const cleanMemId = checkIdNumber(rawMemId, memDobEarly, m?.doc_type).value;
    // Remember a converted 13-digit NID (v4.9.49): this 17-digit value
    // is an NID, so the manual 17-digit rule must not flip it to BRN.
    if (rawMemId.length === 13 && cleanMemId && cleanMemId.length === 17) converted13NidValues.add(cleanMemId);
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

    const memDob = memDobEarly;
    const memAge = calculateAgeYears(memDob);

    const entry = {
      relation: rel,
      relationship_id: Number(m?.relationship_id) || RELATION_ID_MAP[rel] || 263,
      gender: memGender,
      gender_id: GENDER_ID_MAP[memGender] || 1,
      religion: s(m?.religion) || 'Islam',
      religion_id: RELIGION_ID_MAP[s(m?.religion)] || 1,
      // A 13-digit number is always an old NID (a BRN is 17 digits).
      doc_type: rawMemId.length === 13 ? 'NID' : inferDocType(cleanMemId, m?.doc_type),
      name_bn: stripLatinLetters(rawNameBn),
      name_en: stripNonEnglishName(formatEnglishName(rawNameEn)),
      father_name_bn: stripLatinLetters(s(m?.father_name_bn)),
      mother_name_bn: stripLatinLetters(s(m?.mother_name_bn)),
      nid_or_brn: cleanMemId,
      dob: memDob,
      age: memAge,
      is_child_under_18: memAge !== null && memAge >= 0 && memAge < 18,
      is_disabled: Number(m?.is_disabled) === 1 ? 1 : 0,
      source_images: Array.isArray(m?.source_images) ? m.source_images : []
    };
    // Same: keep a member's explicit education (e.g. the spouse pick
    // from the popup) through rebuilds.
    if (m?.education_status_id !== undefined && m?.education_status_id !== null && String(m.education_status_id).trim() !== '') {
      entry.education_status_id = Number(m.education_status_id);
    }
    // Livelihood / marital (v4.9.39): keep an explicit pick through
    // rebuilds — a Pull payload carries neither for a member, so the
    // previous record's pick (matched by NID, else name) is the
    // fallback. Otherwise the DOB derivation would refill the display
    // with the guess and disagree with what the user picked.
    // Same-person only (v4.9.50): a previous record's profession /
    // marital / disability / health carry over only when the NID/BRN
    // matches — never by name, so nothing bleeds into a different
    // person who happens to share the name (or into a different
    // family in the same tab). Same rule as the SSNP/phone fix.
    const prevM2 = prevMemberBenefitById(prev, entry.nid_or_brn);
    if (m?.livelihood_profession_id !== undefined && m?.livelihood_profession_id !== null && String(m.livelihood_profession_id).trim() !== '') {
      entry.livelihood_profession_id = Number(m.livelihood_profession_id);
    } else if (prevM2 && prevM2.livelihood_profession_id !== undefined && prevM2.livelihood_profession_id !== null && String(prevM2.livelihood_profession_id).trim() !== '') {
      entry.livelihood_profession_id = Number(prevM2.livelihood_profession_id);
    }
    if (m?.maritial_status_id !== undefined && m?.maritial_status_id !== null && String(m.maritial_status_id).trim() !== '') {
      entry.maritial_status_id = Number(m.maritial_status_id);
      entry.marital_status = Number(m.maritial_status_id);
    } else if (m?.marital_status !== undefined && m?.marital_status !== null && String(m.marital_status).trim() !== '') {
      entry.marital_status = Number(m.marital_status);
      entry.maritial_status_id = Number(m.marital_status);
    } else if (prevM2 && prevM2.maritial_status_id !== undefined && prevM2.maritial_status_id !== null && String(prevM2.maritial_status_id).trim() !== '') {
      entry.maritial_status_id = Number(prevM2.maritial_status_id);
      entry.marital_status = Number(prevM2.maritial_status_id);
    } else if (prevM2 && prevM2.marital_status !== undefined && prevM2.marital_status !== null && String(prevM2.marital_status).trim() !== '') {
      entry.marital_status = Number(prevM2.marital_status);
      entry.maritial_status_id = Number(prevM2.marital_status);
    }
    // Disability type (v4.9.49): keep an explicit pick through
    // rebuilds, same as livelihood/marital — the AI cannot know the
    // type, so it is always the user's hand pick (or the form's, on
    // Pull). The previous record's pick (matched by NID, else name)
    // is the fallback.
    if (m?.disability_type_id !== undefined && m?.disability_type_id !== null && String(m.disability_type_id).trim() !== '') {
      entry.disability_type_id = Number(m.disability_type_id);
    } else if (prevM2 && prevM2.disability_type_id !== undefined && prevM2.disability_type_id !== null && String(prevM2.disability_type_id).trim() !== '') {
      entry.disability_type_id = Number(prevM2.disability_type_id);
    }
    // (No member mobile: the form never renders a mobile input on a
    // member row — the only mobile on the form is data.mobile on the
    // head form. v4.9.50.)
    // Health (v4.9.49): keep an explicit pick through rebuilds, same
    // as disability — blank means the injector derives কর্মক্ষম (203)
    // for a non-disabled member.
    if (m?.health_condition_id !== undefined && m?.health_condition_id !== null && String(m.health_condition_id).trim() !== '') {
      entry.health_condition_id = Number(m.health_condition_id);
    } else if (prevM2 && prevM2.health_condition_id !== undefined && prevM2.health_condition_id !== null && String(prevM2.health_condition_id).trim() !== '') {
      entry.health_condition_id = Number(prevM2.health_condition_id);
    }
    // Benefit (v4.9.36, v4.9.49): keep the SSNP / card / DSS values
    // the form (Pull) or the user set, through rebuilds — they are what
    // the injector reads on Auto-Fill. Default is No (0): the user
    // asked for No as the default, Auto-Fill fills No, and a family
    // that has a benefit sets it by hand. The AI never returns these
    // fields, so after an AI extract they come only from the previous
    // record — and only for the SAME person (matched by NID/BRN, never
    // by name): prev may be a different family extracted in the same
    // tab, and a Yes must never bleed across families. A Pull / import
    // / session payload (preserveOrder) carries the form's own values.
    const prevM = prevMemberBenefitById(prev, entry.nid_or_brn);
    if (preserveOrder && (m?.is_ssnp_covered === 0 || m?.is_ssnp_covered === 1 || m?.is_ssnp_covered === '0' || m?.is_ssnp_covered === '1')) {
      entry.is_ssnp_covered = Number(m.is_ssnp_covered);
    } else if (prevM && (prevM.is_ssnp_covered === 0 || prevM.is_ssnp_covered === 1)) {
      entry.is_ssnp_covered = Number(prevM.is_ssnp_covered);
    } else {
      entry.is_ssnp_covered = 0;
    }
    if (preserveOrder && Array.isArray(m?.facilities_ids) && m.facilities_ids.length) {
      entry.facilities_ids = m.facilities_ids.map(v => Number(v)).filter(v => !Number.isNaN(v));
    } else if (prevM && Array.isArray(prevM.facilities_ids) && prevM.facilities_ids.length) {
      entry.facilities_ids = prevM.facilities_ids.map(v => Number(v)).filter(v => !Number.isNaN(v));
    }
    if (preserveOrder && (m?.is_dss_training_or_financial_benefit === 0 || m?.is_dss_training_or_financial_benefit === 1 || m?.is_dss_training_or_financial_benefit === '0' || m?.is_dss_training_or_financial_benefit === '1')) {
      entry.is_dss_training_or_financial_benefit = Number(m.is_dss_training_or_financial_benefit);
    } else if (prevM && (prevM.is_dss_training_or_financial_benefit === 0 || prevM.is_dss_training_or_financial_benefit === 1)) {
      entry.is_dss_training_or_financial_benefit = Number(prevM.is_dss_training_or_financial_benefit);
    } else {
      entry.is_dss_training_or_financial_benefit = 0;
    }
    // SSNP No can never carry a card (v4.9.49).
    if (entry.is_ssnp_covered !== 1 && Array.isArray(entry.facilities_ids) && entry.facilities_ids.length) entry.facilities_ids = [];

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

  // Cash usage (v4.9.37): keep the 2500 Tk distribution (and the cap
  // the site sent) across a re-normalize, or the panel's amounts
  // would vanish on the next AI extract / Pull. The form's own values
  // (raw) win when present; otherwise the previous record's (prev)
  // values carry over.
  if (Array.isArray(raw?.cash_usages) && raw.cash_usages.length) {
    result.cash_usages = raw.cash_usages
      .filter((u) => u && Number(u.lookup_id || u.id || 0) > 0 && Number(u.amount || 0) > 0)
      .map((u) => ({ lookup_id: Number(u.lookup_id || u.id), amount: Number(u.amount), other_detail: u.other_detail || null }));
  } else if (prev && Array.isArray(prev.cash_usages) && prev.cash_usages.length) {
    result.cash_usages = prev.cash_usages;
  }
  if (raw && Number(raw.cash_usage_cap || 0) > 0) result.cash_usage_cap = Number(raw.cash_usage_cap);
  else if (prev && Number(prev.cash_usage_cap || 0) > 0) result.cash_usage_cap = Number(prev.cash_usage_cap);

  recalculateHouseholdSummary(result);

  if (raw && raw.full_form_dump && typeof raw.full_form_dump === 'object') {
    result.full_form_dump = raw.full_form_dump;
  }
  return result;
}

// What a field's Copy button puts on the clipboard. The DOB is shown
// with its month name in brackets (15-01[Jan]-1990) so it reads clearly,
// but the website's date box shows DD/MM/YYYY — so the copy strips the
// bracketed month and copies the clean 15/01/1990, the format the site
// reads first. An ISO value (1990-01-15) is reordered, not just slashed.
function copyValueForField(f, targetObj) {
  // Benefit fields (v4.9.36): cards copy as "162, 163"; Yes/No as words.
  if (f.key === 'facilities_ids') {
    const ids = Array.isArray(targetObj.facilities_ids) ? targetObj.facilities_ids : [];
    return ids.join(', ');
  }
  if (f.key === 'is_ssnp_covered' || f.key === 'is_dss_training_or_financial_benefit') {
    const v = targetObj[f.key];
    if (v === 1 || v === '1') return 'Yes';
    if (v === 0 || v === '0') return 'No';
    return '';
  }
  const v = targetObj[f.key] || '';
  if (f.key !== 'dob') return v;
  const s = String(v).replace(/\[.*?\]/g, '').trim();
  const dmy = s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (dmy) return `${dmy[1].padStart(2, '0')}/${dmy[2].padStart(2, '0')}/${dmy[3]}`;
  const ymd = s.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if (ymd) return `${ymd[3].padStart(2, '0')}/${ymd[2].padStart(2, '0')}/${ymd[1]}`;
  return s;
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

  // Who is counted in each group (v4.9.40) — the names behind the
  // numbers, so the user can verify the counts at a glance. Updated
  // on every recalculation.
  const breakdown = document.createElement('div');
  breakdown.id = 'fcCountBreakdown';
  breakdown.style.cssText = 'padding:8px 10px; font-size:12px; line-height:1.7; color:var(--text-main); background:var(--surface-muted); border-radius:6px; margin:0 10px 8px;';
  breakdown.innerHTML = countBreakdownHtml(data);
  // No members yet: hide the box entirely (v4.9.41) — an empty box
  // with "কেউ নেই" lines is noise when the counts are on the pills.
  breakdown.style.display = breakdown.innerHTML ? '' : 'none';
  card.appendChild(breakdown);

  const rows = document.createElement('div');
  rows.className = 'record-rows';

  const makeNumberInput = (id, key, pillId) => {
    const inp = document.createElement('input');
    inp.id = id;
    inp.type = 'number';
    inp.value = String(defs[key] ?? 0);
    inp.style.cssText = 'padding:4px 8px; font-size:12.5px; font-weight:700; border:1px solid var(--border-hover); background:var(--surface); color:var(--text-main); border-radius:5px; width:100%;';
    inp.addEventListener('input', () => {
      // A hand-typed count is an override (v4.9.40): it is stored in
      // form_defaults.count_overrides so the next recalculation keeps
      // it instead of wiping it back to the auto count. Write to the
      // CURRENT form_defaults (state.lastExtracted) — the defs object
      // captured at render time has already been replaced by
      // recalculateHouseholdSummary, so writing to it was lost.
      // Typing the auto value again clears the override, so the count
      // tracks the members once more.
      const n = parseInt(inp.value, 10);
      const val = Number.isFinite(n) ? n : 0;
      const cur = state.lastExtracted && state.lastExtracted.form_defaults;
      if (!cur) return;
      cur[key] = val;
      const groups = householdCountGroups(state.lastExtracted);
      const autoMap = { total_members: groups.total, male_count: groups.male.length, female_count: groups.female.length, children_under_18: groups.children.length };
      if (val === autoMap[key]) {
        if (cur.count_overrides) {
          delete cur.count_overrides[key];
          if (!Object.keys(cur.count_overrides).length) delete cur.count_overrides;
        }
      } else {
        cur.count_overrides = cur.count_overrides || {};
        cur.count_overrides[key] = val;
      }
      if ($(pillId)) $(pillId).textContent = `${val} জন`;
      if ($('fcCountBreakdown')) $('fcCountBreakdown').innerHTML = countBreakdownHtml(state.lastExtracted);
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

// Head corrections (v4.9.33): when the user changes the head's
// education, profession or marital status on the card AFTER a fill,
// the change is recorded here so the next Auto-Fill overwrites the
// form's value instead of skipping the already-filled field. Only
// these three option fields are recorded — the text fields (name,
// DOB, NID, gender, religion) are already written unconditionally
// by the injector on every fill, so they need no correction. A blank
// (—) clears the correction and the head_options override, letting
// the injector derive the value again. The corrections are cleared
// on a successful fill (see the FC_AUTOFILL_RESPONSE handler), so a
// later hand-change on the form is never overwritten by a stale one.
const HEAD_CORRECTION_KEYS = ['education_status_id', 'profession', 'marital_status'];
function recordHeadCorrection(key, value) {
  if (!HEAD_CORRECTION_KEYS.includes(key)) return;
  if (!state.lastExtracted) return;
  const d = state.lastExtracted;
  d.corrections = d.corrections || {};
  d.corrections.head = d.corrections.head || {};
  d.form_defaults = d.form_defaults || {};
  d.form_defaults.head_options = d.form_defaults.head_options || {};
  if (value === null || value === undefined || value === '') {
    delete d.corrections.head[key];
    if (key === 'education_status_id') delete d.form_defaults.head_options.education_status;
    if (key === 'profession') delete d.form_defaults.head_options.profession;
    if (key === 'marital_status') delete d.form_defaults.head_options.marital_status;
  } else {
    d.corrections.head[key] = Number(value);
    if (key === 'education_status_id') d.form_defaults.head_options.education_status = Number(value);
    if (key === 'profession') d.form_defaults.head_options.profession = Number(value);
    if (key === 'marital_status') d.form_defaults.head_options.marital_status = Number(value);
  }
  if (!Object.keys(d.corrections.head).length) delete d.corrections.head;
  if (!Object.keys(d.corrections).length) delete d.corrections;
  saveSessionState();
}

// Head change (v4.9.37): make the member at memberIdx the head. The
// old head becomes a member at the same position, every other
// member's relation is recomputed for the new head (null = could not
// derive, set to Other Relative for the user to pick), and the
// summary is recalculated. The injector re-detects the Halnagad
// programme for the new head on the next fill, so the old detection
// is cleared; head corrections recorded for the old head are cleared
// too (they belong to that person, not the new head).
// The head is always a woman (v4.9.47): a male member cannot be made
// head. Gender comes from the record, falling back to the relation
// (Son / Husband / ... are male). Pure function, so it is easy to test.
function canMakeHead(member) {
  if (!member) return false;
  const g = (member.gender && GENDER_ID_MAP[member.gender])
    ? member.gender
    : (RELATION_GENDER_MAP[member.relation] || '');
  return g !== 'Male';
}

function makeMemberHead(memberIdx) {
  const data = state.lastExtracted;
  if (!data || !Array.isArray(data.family_members) || !data.family_members[memberIdx]) return;
  const oldHead = data.head;
  const newHead = data.family_members[memberIdx];
  if (!canMakeHead(newHead)) {
    setStatus('প্রধান সবসময় নারী — পুরুষ সদস্যকে প্রধান করা যাবে না।', 'err');
    return;
  }
  const recalc = recalculateRelationsForNewHead(oldHead, data.family_members, memberIdx);
  if (!recalc) return;
  const headRec = { ...newHead, relation: 'Head/Self', relationship_id: 260 };
  const oldHeadRel = recalc.oldHeadNewRel || 'Other Relative';
  const oldHeadRec = { ...oldHead, relation: oldHeadRel, relationship_id: RELATION_ID_MAP[oldHeadRel] || 263 };
  // Role-specific profession (v4.9.39): the head uses the type-34
  // `profession`, a member the type-44 `livelihood_profession_id`.
  // Drop the old role's value on each side — the DOB derivation
  // (in renderExtractedCards' recalculation) refills the new role's
  // field from the DOB/gender, so a stale type-44 value never lands on
  // the head form (or a type-34 value on a member row). Education and
  // marital use the same keys in both roles, so they carry over.
  delete headRec.livelihood_profession_id;
  delete oldHeadRec.profession;
  const members = data.family_members.map((m, i) => {
    if (i === memberIdx) return oldHeadRec;
    const nr = recalc.relsByIdx[i];
    if (nr) return { ...m, relation: nr, relationship_id: RELATION_ID_MAP[nr] || 263 };
    return { ...m, relation: 'Other Relative', relationship_id: 263 };
  });
  data.head = headRec;
  data.family_members = members;
  state.halnagad = null;
  renderHalnagadNote();
  if (data.corrections) delete data.corrections;
  renderExtractedCards(data);
  const unknown = Object.values(recalc.relsByIdx).filter((r) => !r).length + (recalc.oldHeadNewRel ? 0 : 1);
  setStatus(`Head is now ${headRec.name_bn || headRec.name_en || 'the selected member'} — relations recalculated.${unknown ? ` ${unknown} relation(s) could not be worked out and are set to Other Relative — please pick them.` : ' Please check the relations, then Auto-Fill.'}`, 'ok');
}

// Manual entry (v4.9.37): add a blank member card the user fills by
// hand (no photo, no AI, no internet). The summary recounts
// automatically on every change.
// A blank form (v4.9.48, v4.9.51): the New Form button's record — an
// empty head (Female, the head is always a woman) and no members yet.
// The head carries the fixed defaults (they do not depend on a DOB:
// Housewife 181, Married 101, not disabled, কর্মক্ষম 203, SSNP/DSS
// No) so the card shows them at once; education stays blank until a
// DOB is typed, then the derivation fills it. The user types every
// name by hand and adds members with Add Member; no photos or AI
// extract needed.
function blankFormData() {
  return {
    head: {
      gender: 'Female', gender_id: 2,
      religion: 'Islam', religion_id: 1,
      doc_type: 'NID',
      name_bn: '', name_en: '',
      father_name_bn: '', father_name_en: '',
      mother_name_bn: '', mother_name_en: '',
      nid: '', dob: '', source_images: [],
      // Fixed head defaults (v4.9.51) — education stays blank: it
      // needs an age, and the DOB derivation fills it when a DOB is typed.
      profession: 181, marital_status: 101,
      is_disabled: 0, health_condition_id: 203,
      is_ssnp_covered: 0, facilities_ids: [],
      is_dss_training_or_financial_benefit: 0
    },
    family_members: []
  };
}

function newBlankForm() {
  // A fresh form: clear the previous family's photos too, like Reset
  // does — the blank form starts with nothing attached to it.
  state.head = [];
  state.other = [];
  state.pulledImages = [];
  state.lastExtracted = blankFormData();
  renderPreviews('head');
  renderPreviews('other');
  renderExtractedCards(state.lastExtracted);
  $('autofillBtn').disabled = false;
  saveSessionState();
  setStatus('Blank form — type every name by hand. Add members with + সদস্য যোগ করুন.', 'ok');
}

function addManualMember() {
  const data = state.lastExtracted;
  if (!data) return;
  if (!Array.isArray(data.family_members)) data.family_members = [];
  data.family_members.push({
    relation: 'Auto', relationship_id: null,
    gender: '', gender_id: null,
    religion: '', religion_id: null,
    name_bn: '', name_en: '',
    father_name_bn: '', father_name_en: '',
    mother_name_bn: '', mother_name_en: '',
    doc_type: 'NID', dob: '', nid: '', nid_or_brn: '',
    is_disabled: 0, is_currently_student: 0, health_condition_id: 203,
    // Benefit defaults are No (0) — the user asked for No as the default.
    is_ssnp_covered: 0, facilities_ids: [],
    is_dss_training_or_financial_benefit: 0,
    source_images: []
  });
  renderExtractedCards(data);
  setStatus('Blank member added — type the details by hand. Gender and religion fill themselves from the name (মোঃ / মোছাঃ).', 'ok');
}

// Remove a member card from the panel (not from the form — a re-pull
// brings it back). The head cannot be removed here; use Make Head
// on another member first.
function removeMember(memberIdx) {
  const data = state.lastExtracted;
  if (!data || !Array.isArray(data.family_members) || !data.family_members[memberIdx]) return;
  const m = data.family_members[memberIdx];
  data.family_members.splice(memberIdx, 1);
  renderExtractedCards(data);
  setStatus(`Removed ${m.name_bn || m.name_en || 'member'} from the panel.`, 'ok');
}

// Cash usage — the 2500 Tk distribution (v4.9.37). One amount per
// type-46 category; the total must not pass the cap (2500, or the
// cap the site sent on Pull). Amounts live in data.cash_usages
// (sent to the injector, which writes the form's cashUsageRows).
function buildCashUsageCard(data) {
  const card = document.createElement('div');
  card.className = 'record-card';
  const cap = Number(data.cash_usage_cap || CASH_USAGE_CAP) || CASH_USAGE_CAP;

  const headEl = document.createElement('div');
  headEl.className = 'record-head';
  const titleSpan = document.createElement('span');
  titleSpan.textContent = '২৫০০ টাকা বিতরণ (Cash Usage)';
  const tagSpan = document.createElement('span');
  tagSpan.className = 'record-tag';
  headEl.append(titleSpan, tagSpan);
  card.appendChild(headEl);

  const body = document.createElement('div');
  body.className = 'record-rows';
  const inputs = new Map();

  const refreshTotal = () => {
    const usages = Array.isArray(data.cash_usages) ? data.cash_usages : [];
    const total = usages.reduce((s, u) => s + (Number(u.amount || 0) > 0 ? Number(u.amount) : 0), 0);
    tagSpan.textContent = `মোট ${total} / ${cap} টাকা`;
    tagSpan.style.color = total > cap ? '#dc2626' : '';
    return total;
  };

  const setUsage = (lookupId, amount, otherDetail) => {
    if (!Array.isArray(data.cash_usages)) data.cash_usages = [];
    let entry = data.cash_usages.find((u) => Number(u.lookup_id) === lookupId);
    if (!entry) { entry = { lookup_id: lookupId, amount: 0, other_detail: null }; data.cash_usages.push(entry); }
    entry.amount = amount;
    if (otherDetail !== undefined) entry.other_detail = otherDetail || null;
    // Drop empty rows so the payload only carries what the user set.
    data.cash_usages = data.cash_usages.filter((u) => Number(u.amount || 0) > 0 || (u.other_detail || '').trim() !== '');
  };

  CASH_USAGE_OPTIONS.forEach((opt) => {
    const r = document.createElement('div');
    r.className = 'record-row';
    r.style.gridTemplateColumns = '1fr 110px';
    const kEl = document.createElement('span');
    kEl.className = 'row-key';
    kEl.textContent = opt.label;
    kEl.style.whiteSpace = 'normal';
    const amt = document.createElement('input');
    amt.type = 'number';
    amt.min = '0';
    amt.step = '1';
    amt.placeholder = 'টাকা';
    amt.style.cssText = 'padding:4px 8px; font-size:12.5px; font-weight:600; border:1px solid var(--border); background:var(--surface-muted); color:var(--text-main); border-radius:5px; width:100%;';
    const cur = Array.isArray(data.cash_usages) ? data.cash_usages.find((u) => Number(u.lookup_id) === opt.id) : null;
    amt.value = cur && Number(cur.amount || 0) > 0 ? String(cur.amount) : '';
    amt.addEventListener('input', () => {
      let v = Math.max(0, Math.floor(Number(amt.value || 0) || 0));
      // Cap: this row cannot take more than the cap minus the other
      // rows' amounts — the number simply stops at what is left.
      const others = (Array.isArray(data.cash_usages) ? data.cash_usages : [])
        .filter((u) => Number(u.lookup_id) !== opt.id)
        .reduce((s, u) => s + (Number(u.amount || 0) > 0 ? Number(u.amount) : 0), 0);
      const maxHere = Math.max(0, cap - others);
      if (v > maxHere) { v = maxHere; amt.value = v ? String(v) : ''; }
      setUsage(opt.id, v);
      refreshTotal();
      syncJsonOutput();
    });
    inputs.set(opt.id, amt);
    r.append(kEl, amt);
    body.appendChild(r);

    if (opt.other) {
      const or = document.createElement('div');
      or.className = 'record-row';
      or.style.gridTemplateColumns = '1fr';
      const oIn = document.createElement('input');
      oIn.type = 'text';
      oIn.placeholder = 'অন্যান্য হলে এখানে লিখুন (specify)';
      oIn.style.cssText = 'padding:4px 8px; font-size:12.5px; border:1px solid var(--border); background:var(--surface-muted); color:var(--text-main); border-radius:5px; width:100%;';
      const curO = Array.isArray(data.cash_usages) ? data.cash_usages.find((u) => Number(u.lookup_id) === opt.id) : null;
      oIn.value = (curO && curO.other_detail) || '';
      oIn.addEventListener('input', () => {
        const amtV = Number((inputs.get(opt.id) || {}).value || 0) || 0;
        setUsage(opt.id, amtV, oIn.value);
        syncJsonOutput();
      });
      or.appendChild(oIn);
      body.appendChild(or);
    }
  });

  card.appendChild(body);
  refreshTotal();
  return card;
}

function renderExtractedCards(data) {
  const container = $('visualCards');
  container.replaceChildren();
  $('resultsWrap').classList.add('visible');

  renderHouseholdSummaryCard(data);

  const buildEditableCard = (targetObj, fields, isMember = false, memberIdx = 0) => {
    const card = document.createElement('div');
    card.className = 'record-card';
    // Tag the card so a change on one card (a parent's name, a DOB)
    // can refresh another card's inputs in place (v4.9.39).
    if (isMember) card.dataset.memberIdx = String(memberIdx);
    else card.dataset.head = '1';

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
    // Head change + remove (v4.9.37): member cards get a "Make Head"
    // button (swap this member to head, relations recalculated) and a
    // Remove button. The head card has neither.
    if (isMember) {
      const btnWrap = document.createElement('span');
      btnWrap.style.cssText = 'display:inline-flex; gap:4px; margin-left:auto;';
      const headBtn = document.createElement('button');
      headBtn.type = 'button';
      headBtn.className = 'btn btn-xs';
      headBtn.textContent = 'প্রধান করুন';
      headBtn.title = 'Make this member the family head — relations are recalculated for the new head';
      headBtn.style.cssText = 'padding:2px 7px; font-size:10px; background:var(--accent-soft); color:var(--accent); border:1px solid var(--accent);';
      headBtn.addEventListener('click', () => makeMemberHead(memberIdx));
      const rmBtn = document.createElement('button');
      rmBtn.type = 'button';
      rmBtn.className = 'btn btn-xs';
      rmBtn.textContent = 'মুছুন';
      rmBtn.title = 'Remove this member from the panel (a re-pull brings it back)';
      rmBtn.style.cssText = 'padding:2px 7px; font-size:10px; color:#dc2626; border:1px solid #fecaca;';
      rmBtn.addEventListener('click', () => removeMember(memberIdx));
      btnWrap.append(headBtn, rmBtn);
      headEl.appendChild(btnWrap);
    }
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

      const inputEl = createFieldControl(f, targetObj, refreshHeader, body, isMember ? null : recordHeadCorrection);

      const copyBtn = document.createElement('button');
      copyBtn.type = 'button';
      copyBtn.className = 'btn btn-xs';
      copyBtn.textContent = 'Copy';
      copyBtn.style.padding = '2px 7px';
      copyBtn.style.fontSize = '10px';
      copyBtn.addEventListener('click', async () => {
        await copyTextSafe(copyValueForField(f, targetObj));
        copyBtn.textContent = 'Copied';
        copyBtn.style.color = '#059669';
        setTimeout(() => {
          copyBtn.textContent = 'Copy';
          copyBtn.style.color = '';
        }, 800);
      });

      r.append(kEl, inputEl, copyBtn);
      body.appendChild(r);
      // Father picker (v4.9.48): on a Grandson/Granddaughter card, a
      // dropdown under the Father row lists the household males who
      // can be the father (a Son or a Son-in-law — never the Husband,
      // he is the grandfather). Picking one fills the father's name.
      // Hidden on every other relation.
      if (isMember && f.key === 'father_name_bn') {
        const pickRow = document.createElement('div');
        pickRow.className = 'record-row';
        pickRow.style.gridTemplateColumns = '105px 1fr auto';
        pickRow.dataset.fatherPickRow = '1';
        const pkEl = document.createElement('span');
        pkEl.className = 'row-key';
        pkEl.textContent = 'Father — বেছে নিন';
        const pickSel = document.createElement('select');
        pickSel.dataset.field = 'father_pick';
        pickSel.style.cssText = 'padding:4px 8px; font-size:12px; font-weight:600; border:1px solid var(--border); background:var(--surface-muted); color:var(--text-main); border-radius:5px; cursor:pointer; width:100%;';
        rebuildFatherPickOptions(pickSel, targetObj.father_name_bn);
        // Options go stale when a Son's name is typed — rebuild them
        // every time the dropdown is opened, so the list is fresh.
        pickSel.addEventListener('focus', () => rebuildFatherPickOptions(pickSel, targetObj.father_name_bn));
        pickSel.addEventListener('change', () => {
          const name = pickSel.value || '';
          targetObj.father_name_bn = name;
          if (banglishEnabled) targetObj.father_name_en = name ? transliterateBanglaToEnglish(name) : '';
          if (inputEl) { inputEl.value = name; toggleWarning(inputEl); }
          toggleWarning(pickSel);
          syncJsonOutput();
        });
        const pickSpacer = document.createElement('span');
        pickRow.append(pkEl, pickSel, pickSpacer);
        pickRow.style.display = (targetObj.relation === 'Grandson' || targetObj.relation === 'Granddaughter') ? '' : 'none';
        body.appendChild(pickRow);
      }
      // Benefit (v4.9.36): the card row only shows when SSNP is Yes.
      if (f.key === 'facilities_ids' && targetObj.is_ssnp_covered !== 1 && targetObj.is_ssnp_covered !== '1') {
        r.style.display = 'none';
      }
      // Disability (v4.9.49): the type row only shows when Disabled is Yes.
      if (f.key === 'disability_type_id' && targetObj.is_disabled !== 1 && targetObj.is_disabled !== '1') {
        r.style.display = 'none';
      }
    });

    card.appendChild(body);
    return card;
  };

  if (data.head) container.appendChild(buildEditableCard(data.head, HEAD_FIELDS, false));
  if (Array.isArray(data.family_members)) data.family_members.forEach((m, i) => container.appendChild(buildEditableCard(m, MEMBER_FIELDS, true, i)));

  // Manual entry (v4.9.37): add as many blank member cards as needed.
  const addBtn = document.createElement('button');
  addBtn.type = 'button';
  addBtn.className = 'btn';
  addBtn.textContent = '+ সদস্য যোগ করুন (Add Member)';
  addBtn.style.cssText = 'width:100%; margin:6px 0 2px; padding:8px; font-weight:700;';
  addBtn.addEventListener('click', addManualMember);
  container.appendChild(addBtn);

  // Cash usage — the 2500 Tk distribution (v4.9.37).
  container.appendChild(buildCashUsageCard(data));

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
  disability_type_id: DISABILITY_TYPE_OPTIONS.map(o => ({ value: o.id, label: `${o.id} — ${o.label}` })),
  health_condition_id: HEALTH_OPTIONS.map(o => ({ value: o.id, label: `${o.id} — ${o.label}` })),
  mfs_provider_id: MFS_PROVIDER_OPTIONS.map(o => ({ value: o.id, label: `${o.id} — ${o.label}` })),
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

    const normalized = normalizeOutput(parsed, false, state.lastExtracted);
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

// --- Education popup: pure helpers ---
// Ask once, at Auto-Fill, when the head or the spouse (husband/wife) is
// 25+ and their education would otherwise be the age guess (Class 1-4,
// id 190) — the guess is wrong for families where they didn't study, and
// it is asked in two places (head page + member page), so one pick must
// fill both. The choice is written into the payload for this run only
// (never saved as a global default — every family is different): head ->
// form_defaults.head_options.education_status + the Head/Self member row,
// spouse -> that member row's education_status_id. inject.js v19 already
// treats both as explicit overrides that beat the age guess, and the head
// page copies the member row too — so no inject.js change is needed.
// NOTE: handleAreaPresetChange() rebuilds form_defaults, so the choices
// must be applied AFTER it runs, right before the payload is sent.
const EDUCATION_OPTIONS = [
  { id: 88, label: 'নিরক্ষর / Didn\'t study' },
  { id: 188, label: 'প্রাক-প্রাথমিক / Pre-Primary' },
  { id: 189, label: '১ম শ্রেণি / Class 1' },
  { id: 190, label: '১ম–৪র্থ শ্রেণি / Class 1-4' },
  { id: 191, label: '৫ম / Class 5' },
  { id: 192, label: '৬ষ্ঠ–৭ম / Class 6-7' },
  { id: 89, label: 'অষ্টম / JSC' },
  { id: 193, label: '৯ম / Class 9' },
  { id: 90, label: 'এসএসসি / SSC' },
  { id: 91, label: 'এইচএসসি / HSC' },
  { id: 92, label: 'স্নাতক / Graduate' },
  { id: 93, label: 'স্নাতকোত্তর / Post Graduate' }
];

function eduAgeYears(rawDob) {
  const clean = String(rawDob || '').replace(/\[.*?\]/g, '').trim();
  if (!clean) return null;
  let dd, mm, yyyy;
  const dmy = clean.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (dmy) { dd = +dmy[1]; mm = +dmy[2]; yyyy = +dmy[3]; }
  else {
    const ymd = clean.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
    if (!ymd) return null;
    yyyy = +ymd[1]; mm = +ymd[2]; dd = +ymd[3];
  }
  const today = new Date();
  let age = today.getFullYear() - yyyy;
  if (today.getMonth() + 1 < mm || (today.getMonth() + 1 === mm && today.getDate() < dd)) age--;
  return age;
}

// Exact (fractional) age for the popup threshold — same parsing as
// eduAgeYears, but whole years plus the fraction of the current year
// since the last birthday. The popup asks from 27.5, so the fraction
// matters (a 27.4-year-old still gets the PG guess, a 27.6-year-old
// is asked). Self-contained (no calculateAgeFractional dependency)
// so this block stays extractable on its own.
function eduAgeFractional(rawDob) {
  const clean = String(rawDob || '').replace(/\[.*?\]/g, '').trim();
  if (!clean) return null;
  let dd, mm, yyyy;
  const dmy = clean.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (dmy) { dd = +dmy[1]; mm = +dmy[2]; yyyy = +dmy[3]; }
  else {
    const ymd = clean.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
    if (!ymd) return null;
    yyyy = +ymd[1]; mm = +ymd[2]; dd = +ymd[3];
  }
  const today = new Date();
  let whole = today.getFullYear() - yyyy;
  if (today.getMonth() + 1 < mm || (today.getMonth() + 1 === mm && today.getDate() < dd)) whole--;
  if (whole < 0 || whole >= 130) return null;
  let lastBday = new Date(today.getFullYear(), mm - 1, dd);
  if (lastBday > today) lastBday = new Date(today.getFullYear() - 1, mm - 1, dd);
  const nextBday = new Date(lastBday.getFullYear() + 1, mm - 1, dd);
  const span = nextBday - lastBday;
  if (!span || span <= 0) return whole;
  return whole + (today - lastBday) / span;
}

// NID/BRN digits, normalised for matching: Bangla digits -> English,
// whitespace stripped. Local to this block so the extracted helpers
// stay self-contained (no toEnglishDigits dependency).
function eduNormId(v) {
  const bn = '০১২৩৪৫৬৭৮৯';
  return String(v || '').replace(/[০-৯]/g, (d) => String(bn.indexOf(d))).replace(/\s+/g, '');
}

function eduPersonName(p, fallback) {
  const n = (p && (p.name_en || p.name_bn) || '').trim();
  return n || fallback;
}

function eduHasExplicitId(v) {
  return v !== undefined && v !== null && String(v).trim() !== '';
}

// Who needs asking: EVERYONE 27.5+ (head, spouse, all members) with
// no explicit education anywhere the injector would read it. Below
// 27.5 the ladder gives a real band, shown on the card — no popup.
// Returns [] when nothing to ask. A target's `age` is whole years
// (for display); the 27.5 test uses the fractional age. Keys are
// 'head' for the head and 'member:<idx>' for members.
function educationPopupTargets(extracted) {
  if (!extracted || !extracted.head) return [];
  const members = Array.isArray(extracted.family_members) ? extracted.family_members : [];
  const headOpts = (extracted.form_defaults && extracted.form_defaults.head_options) || {};
  const headRowIdx = members.findIndex(m => m && ((m.relation || '') === 'Head/Self' || Number(m.relationship_id || m.relation_id || 0) === 260));
  const headRow = headRowIdx >= 0 ? members[headRowIdx] : null;
  const targets = [];
  const headAgeFrac = eduAgeFractional(extracted.head.dob);
  const headExplicit = eduHasExplicitId(headOpts.education_status)
    || eduHasExplicitId(extracted.head.education_status_id)
    || (headRow && eduHasExplicitId(headRow.education_status_id));
  if (headAgeFrac !== null && headAgeFrac >= 27.5 && !headExplicit) {
    targets.push({ key: 'head', memberIndex: headRowIdx, name: eduPersonName(extracted.head, 'প্রধান (Head)'), age: eduAgeYears(extracted.head.dob), role: 'প্রধান / Head', relation: 'Head/Self', nid: eduNormId(extracted.head.nid) });
  }
  members.forEach((m, idx) => {
    if (!m) return;
    if (m.relation === 'Head/Self' || Number(m.relationship_id || m.relation_id || 0) === 260) return; // head row — already covered above
    const ageFrac = eduAgeFractional(m.dob);
    if (ageFrac === null || ageFrac < 27.5) return;
    if (eduHasExplicitId(m.education_status_id)) return;
    targets.push({ key: 'member:' + idx, memberIndex: idx, name: eduPersonName(m, m.relation || 'সদস্য (Member)'), age: eduAgeYears(m.dob), role: m.relation || 'সদস্য (Member)', relation: m.relation || '', nid: eduNormId(m.nid_or_brn || m.nid) });
  });
  return targets;
}

// Apply the popup picks to the payload, in the exact places inject.js
// reads: head -> head_options override (+ Head/Self row when present),
// a member -> that member row. Choices is { head?: id,
// 'member:<idx>'?: id } (the old 'spouse' key still works).
// The head pick ALSO goes on the head record itself
// (head.education_status_id): the panel's family_members has no
// Head/Self row (the injector adds the head as row 0 at fill time), so
// head_options was the pick's only home — and recalculateHousehold-
// Summary rebuilds form_defaults from scratch on every Auto-Fill,
// wiping it. The pick was lost and the popup asked again every time.
// The head record survives that rebuild, so the pick sticks.
function applyEducationChoices(extracted, choices) {
  if (!extracted || !choices) return extracted;
  const members = Array.isArray(extracted.family_members) ? extracted.family_members : [];
  if (choices.head !== undefined && choices.head !== null && Number(choices.head) > 0) {
    extracted.form_defaults = extracted.form_defaults || {};
    extracted.form_defaults.head_options = Object.assign({}, extracted.form_defaults.head_options, { education_status: Number(choices.head) });
    if (extracted.head) extracted.head.education_status_id = Number(choices.head);
    const headRowIdx = members.findIndex(m => m && ((m.relation || '') === 'Head/Self' || Number(m.relationship_id || m.relation_id || 0) === 260));
    if (headRowIdx >= 0) members[headRowIdx].education_status_id = Number(choices.head);
  }
  if (choices.spouse !== undefined && choices.spouse !== null && Number(choices.spouse) > 0) {
    const spouseIdx = members.findIndex(m => m && (m.relation === 'Husband' || m.relation === 'Wife'));
    if (spouseIdx >= 0) members[spouseIdx].education_status_id = Number(choices.spouse);
  }
  Object.keys(choices).forEach((k) => {
    if (!k || k.indexOf('member:') !== 0) return;
    const idx = Number(k.slice('member:'.length));
    const v = choices[k];
    if (Number.isNaN(idx) || idx < 0 || idx >= members.length) return;
    if (v !== undefined && v !== null && Number(v) > 0) members[idx].education_status_id = Number(v);
  });
  return extracted;
}

// Drop popup targets whose education is already on the live form
// (hand-filled, or filled by an earlier run). live is
// { head?: id|null, spouse?: id|null, members?: [{ nid, education }] }
// from the injector, or null when the injector never answered — then
// nothing is dropped, so the fill is never blocked by the check.
function filterEducationTargetsByLive(targets, live) {
  if (!live || !Array.isArray(targets)) return targets;
  const byNid = {};
  if (Array.isArray(live.members)) {
    live.members.forEach((e) => {
      if (e && eduHasExplicitId(e.education)) byNid[eduNormId(e.nid)] = Number(e.education);
    });
  }
  return targets.filter((t) => {
    if (t.key === 'head') return !eduHasExplicitId(live.head);
    if (t.nid && byNid[t.nid]) return false;
    // Old injector (no per-member list): a spouse's live value still
    // drops the spouse target.
    if ((t.relation === 'Husband' || t.relation === 'Wife') && eduHasExplicitId(live.spouse)) return false;
    return true;
  });
}

// Remember a live education value on the panel's record (same places
// as a popup pick), so the popup does not ask for it again even if the
// injector is silent next time. Returns true when it stored anything.
function rememberLiveEducation(extracted, live) {
  if (!extracted || !live) return false;
  const choices = {};
  if (eduHasExplicitId(live.head)) choices.head = Number(live.head);
  if (eduHasExplicitId(live.spouse)) choices.spouse = Number(live.spouse);
  if (!Object.keys(choices).length && !Array.isArray(live.members)) return false;
  applyEducationChoices(extracted, choices);
  let stored = Object.keys(choices).length > 0;
  if (Array.isArray(live.members)) {
    const members = Array.isArray(extracted.family_members) ? extracted.family_members : [];
    live.members.forEach((e) => {
      if (!e || !eduHasExplicitId(e.education)) return;
      const nid = eduNormId(e.nid);
      if (!nid) return;
      const idx = members.findIndex((m) => m && eduNormId(m.nid_or_brn || m.nid) === nid);
      if (idx >= 0 && !eduHasExplicitId(members[idx].education_status_id)) {
        members[idx].education_status_id = Number(e.education);
        stored = true;
      }
    });
  }
  return stored;
}
// --- end education popup pure helpers ---

function sendAutofillPayload() {
  window.parent.postMessage({ action: 'FILL_VUE_FORM', payload: state.lastExtracted }, '*');
  setStatus('Sent auto-fill data (Members, Gender, Religion, Post Code & Area) to form!', 'ok');
}

function showEducationPopup(targets) {
  const modal = $('eduModal');
  // Older panel HTML without the modal: never block the fill.
  if (!modal || !$('eduConfirmBtn') || !$('eduSkipBtn') || !$('closeEduBtn')) { sendAutofillPayload(); return; }
  const rowsEl = $('eduModalRows');
  if (rowsEl) {
    rowsEl.innerHTML = '';
    targets.forEach((t) => {
      const wrap = document.createElement('div');
      const label = document.createElement('label');
      label.style.cssText = 'display:block; font-size:13px; font-weight:600; margin-bottom:6px;';
      label.textContent = `${t.name} — ${t.age} বছর (${t.role || (t.key === 'head' ? 'প্রধান / Head' : 'স্বামী/স্ত্রী / Spouse')})`;
      const sel = document.createElement('select');
      sel.dataset.eduKey = t.key;
      // No pre-selected guess: 27+ has no age guess at all (blank is
      // better than a wrong Class 1-4), so the dropdown starts blank
      // and the user picks. Confirm skips a blank choice.
      const blank = document.createElement('option');
      blank.value = ''; blank.textContent = '—'; blank.selected = true;
      sel.appendChild(blank);
      EDUCATION_OPTIONS.forEach((opt) => {
        const o = document.createElement('option');
        o.value = String(opt.id);
        o.textContent = opt.label;
        sel.appendChild(o);
      });
      wrap.appendChild(label);
      wrap.appendChild(sel);
      rowsEl.appendChild(wrap);
    });
  }
  const close = () => {
    modal.classList.remove('open');
    sendAutofillPayload(); // Skip = leave it blank (no age guess for 27+).
  };
  const confirm = () => {
    const choices = {};
    (rowsEl ? rowsEl.querySelectorAll('select[data-edu-key]') : []).forEach((sel) => {
      if (sel.value !== '') choices[sel.dataset.eduKey] = Number(sel.value);
    });
    applyEducationChoices(state.lastExtracted, choices);
    // Persist the pick now, or a panel reload loses it and the popup
    // asks again on the next Auto-Fill.
    saveSessionState();
    const rawOut = $('rawJsonOutput');
    if (rawOut) rawOut.textContent = JSON.stringify(state.lastExtracted, null, 2);
    modal.classList.remove('open');
    sendAutofillPayload();
  };
  $('eduConfirmBtn').onclick = confirm;
  $('eduSkipBtn').onclick = close;
  $('closeEduBtn').onclick = close;
  modal.onclick = (e) => { if (e.target === modal) close(); };
  modal.classList.add('open');
}

// Pending "what education is already on the form?" request. The
// injector answers through FC_LIVE_EDUCATION_RESPONSE; if it never
// does (old injector / old bookmarklet), the timeout resolves null
// and the popup falls back to the panel's own data — the fill is
// never blocked by the check.
let liveEducationWaiter = null;
function requestLiveEducation(timeoutMs = 1000) {
  return new Promise((resolve) => {
    let done = false;
    const finish = (live) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      if (liveEducationWaiter && liveEducationWaiter.resolve === finish) liveEducationWaiter = null;
      resolve(live);
    };
    const timer = setTimeout(() => finish(null), timeoutMs);
    liveEducationWaiter = { resolve: finish };
    window.parent.postMessage({ action: 'FC_READ_LIVE_EDUCATION' }, '*');
  });
}

async function triggerFormAutofill() {
  if (!state.lastExtracted) return;
  handleAreaPresetChange();
  // NID/BRN check (v4.9.47): warn about a wrong-length ID before
  // filling — the card already flags it, but name it here too so a
  // bad ID is never missed. The fill still goes ahead (the site
  // rejects only the bad field, and the user may fix it on the form).
  {
    const bad = [];
    const headChk = checkIdNumber(state.lastExtracted.head && state.lastExtracted.head.nid, state.lastExtracted.head && state.lastExtracted.head.dob, state.lastExtracted.head && state.lastExtracted.head.doc_type);
    if (state.lastExtracted.head && state.lastExtracted.head.nid && headChk.warning) bad.push('প্রধান (Head)');
    (Array.isArray(state.lastExtracted.family_members) ? state.lastExtracted.family_members : []).forEach((m) => {
      if (!m || !m.nid_or_brn) return;
      const chk = checkIdNumber(m.nid_or_brn, m.dob, m.doc_type);
      if (chk.warning) bad.push(m.name_bn || m.name_en || m.relation || 'সদস্য');
    });
    if (bad.length) setStatus(`সতর্কতা — NID/BRN ঠিক নয়: ${bad.join(', ')}। ঠিক করে নিন, নাহলে ফর্মে ভুল দেখাবে।`, 'err');
  }
  // The popup asks for everyone 27.5+ with no explicit education —
  // and only for this run. (27.5+ has no age guess at all, so
  // skipping leaves it blank instead of filling Class 1-4.)
  let targets = educationPopupTargets(state.lastExtracted);
  if (targets.length) {
    // Ask the form first: a hand-filled education (or one from an
    // earlier run) must not be asked again. A silent injector falls
    // back to the panel's data, so the fill is never delayed.
    const live = await requestLiveEducation();
    if (live) {
      if (rememberLiveEducation(state.lastExtracted, live)) saveSessionState();
      targets = filterEducationTargetsByLive(targets, live);
    }
  }
  if (!targets.length) { sendAutofillPayload(); return; }
  showEducationPopup(targets);
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
      state[category].push({ id: nextId++, base64: im.base64, name: im.name || 'Card.jpg', relation: 'Auto', boundRef: null, boundRefs: [], source: 'upload' });
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

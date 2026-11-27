'use strict';

const STORAGE_KEY = 'fc_pro_api_key';
const STORAGE_MODEL = 'fc_pro_model';
const STORAGE_AREA_PRESETS = 'fc_pro_area_presets';
const STORAGE_PROVIDER = 'fc_pro_api_provider';
const STORAGE_CUSTOM_URL = 'fc_pro_custom_url';
const STORAGE_CUSTOM_BEARER = 'fc_pro_custom_bearer';
const STORAGE_CUSTOM_THINKING = 'fc_pro_custom_thinking';
const CURRENT_VERSION_TAG = 'v4.9.95-live';

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

// --- Profession income table (v4.9.75) ---
// Typical annual income (Tk) guessed from a member's livelihood
// (type-44 ids above). User-confirmed 2026-11-22: Agriculture 60000
// was right; the rest lowered for poor applicant families and
// seasonal work — then re-checked 2026-11-22 against real wages
// (BBS ag wage ~620/day, garment minimum 12,500/month, BILS
// domestic ~5,300/month, rural pedal rickshaw net ~300–500/day):
// Private Job 96000 -> 120000, Garment 120000 -> 150000, Domestic
// 48000 -> 60000, Rickshaw/Van 96000 -> 72000 (not every day);
// Govt Job stays 180000 at the user's call (the new 2026 pay scale
// doubled it, but he kept the old number). A real income always
// wins over this guess; the head and students get 0. Income is never
// summed or scored — this only fills the required box so the form
// submits. The injector carries the same table; keep the two in
// step (tests/profession_income_test.js checks they match).
// (v4.9.75) A guess is no longer one fixed number: each table value
// is the middle of a +/-7% range (INCOME_RANGE_PCT), rolled once
// when the income is first guessed and then kept — so families stop
// looking identical, but the same family always shows the same
// number. 0-value professions stay exactly 0.
// (v4.9.91) Roll step is 5000 now (was 1000), so guesses read 55000/60000/65000.
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
// The +/-7% range around a table value, rounded to the nearest 5000
// so the number still looks like a real yearly income. 0 stays 0.
function incomeRangeFor(mid) {
  const m = Number(mid) || 0;
  if (m === 0) return { low: 0, high: 0 };
  return {
    low: Math.round(m * (1 - INCOME_RANGE_PCT) / INCOME_ROLL_STEP) * INCOME_ROLL_STEP,
    high: Math.round(m * (1 + INCOME_RANGE_PCT) / INCOME_ROLL_STEP) * INCOME_ROLL_STEP
  };
}
// Roll one multiple of 5000 inside the range. Callers roll ONCE and
// store the result as the person's income — never re-roll a stored
// value, or the panel and the form would disagree.
function rollIncome(mid) {
  const r = incomeRangeFor(mid);
  if (r.low === r.high) return r.low;
  const steps = Math.round((r.high - r.low) / INCOME_ROLL_STEP);
  return r.low + Math.floor(Math.random() * (steps + 1)) * INCOME_ROLL_STEP;
}
// The rolled guess for a profession id (0 for a 0-value profession
// or an unknown id).
function incomeGuessForProfession(professionId) {
  return rollIncome(incomeForProfession(professionId));
}
// Is this number still a guess from this profession — i.e. inside
// its range? The card handlers use it to tell a guess from a
// hand-typed income (a hand-typed number that happens to land inside
// the range is treated as a guess, the same trade-off as the old
// exact-match check).
function isGuessedIncome(value, mid) {
  const r = incomeRangeFor(mid);
  return Number(value) >= r.low && Number(value) <= r.high;
}
// Head profession income (type-34 ids, v4.9.75): the head card never
// had an income row, so the head always showed 0. User-confirmed
// 2026-11-22, lowered from the member values ("make lower for
// head"): Farmer 36000, Business 60000, Service 72000, Day Laborer
// 48000, Laborer 48000; Housewife/Student/Unemployed/Others 0.
// Same +/-7% roll as members; the head uses her profession table
// directly, with no student-age override (Student is 0 in the table).
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
// The income a member would show from a profession alone (v4.9.74,
// rolled since v4.9.75): student-age (6–24) is always 0; no
// profession on file falls back to the old Husband 60000 / others 0
// rule, rolled the same way. A real income is never derived here —
// normalizeOutput's real-value branches win first, and the card's
// profession handler only overwrites an income that is still a guess
// (blank, 0, or inside the old profession's range).
function incomeGuessForMember(entry, profId) {
  const isStudentAge = entry && entry.age !== null && entry.age !== undefined && entry.age >= 6 && entry.age <= 24;
  if (isStudentAge) return 0;
  if (profId !== undefined && profId !== null && String(profId).trim() !== '') return incomeGuessForProfession(profId);
  return entry && entry.relation === 'Husband' ? rollIncome(60000) : 0;
}
// The midpoint behind incomeGuessForMember — for the card handler's
// "is this still a guess" check, which tests range membership instead
// of equality now that guesses are rolled (v4.9.75).
function incomeGuessMidForMember(entry, profId) {
  const isStudentAge = entry && entry.age !== null && entry.age !== undefined && entry.age >= 6 && entry.age <= 24;
  if (isStudentAge) return 0;
  if (profId !== undefined && profId !== null && String(profId).trim() !== '') return incomeForProfession(profId);
  return entry && entry.relation === 'Husband' ? 60000 : 0;
}
// --- end profession income table ---

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

// (v39) The v38 sections (General / Nominee / Bank / Address /
// Permanent Address / Socio-Economic) are PULLED website data —
// a hand-typed New Form has none of it, so showing them there is
// just a wall of empty rows. A section only renders when the record
// actually carries pulled data: any one of these keys set (a count
// of 0 counts — String(0) is '0', not empty — so a pulled draft
// whose counts are all 0 still shows its sections, while a New
// Form head, which never has these keys, shows only the core card).
const PULLED_SECTION_KEYS = [
  'spouse_name_bn', 'spouse_name_en', 'identification_mark', 'nationality', 'email', 'mobile_operator', 'disability_id', 'house_size', 'no_of_room_name',
  'nominee_bn', 'nominee_en', 'nominee_verification_number', 'nominee_date_of_birth', 'nominee_address', 'nominee_relation_with_beneficiary', 'nominee_nationality',
  'account_type', 'bank_name', 'branch_name', 'bank_division_name', 'bank_district_name', 'account_name', 'account_owner', 'account_number', 'mfs_number',
  'address_location_type_id', 'address_division_name', 'address_district_name', 'address_thana_name', 'address_union_name', 'address_pouro_name', 'address_city_name', 'address_ward_name', 'address_post_code', 'address_text',
  'permanent_address_location_type_id', 'permanent_address_division_name', 'permanent_address_district_name', 'permanent_address_thana_name', 'permanent_address_union_name', 'permanent_address_pouro_name', 'permanent_address_city_name', 'permanent_address_ward_name', 'permanent_address_post_code', 'permanent_address_text',
  'program_male', 'program_female', 'program_hijra', 'program_abroad_male', 'program_abroad_female', 'program_abroad_hijra'
];
function hasPulledSections(targetObj) {
  if (!targetObj || typeof targetObj !== 'object') return false;
  return PULLED_SECTION_KEYS.some((k) => {
    const v = targetObj[k];
    return v !== undefined && v !== null && String(v).trim() !== '';
  });
}

// --- PMT leftover picks (v4.9.69) ---
// The PMT questions Auto-Fill + presets leave behind, now picked on
// the head card. Every option name is the site's own wording from
// getApplicationPageData (pmt.json) — nothing is renamed or
// paraphrased (user 2026-11-22, re Q22: the site asks "খানার কোন
// সদস্য কি কৃষি অথবা অকৃষি শ্রমিক হিসেবে নিয়োজিত আছেন?" with
// "কৃষি খাতে শ্রম / অকৃষি খাতে শ্রম / শ্রমিক/দিনমজুর নেই"). The
// combo labels are the user's own confirmed words for the three
// materials together; the separate floor/wall/roof selects show the
// site's full option names.
// "Home made of" — one pick sets floor (Q536) + wall (Q30) + roof
// (Q393) together. Order is worst-first (bad -> good), by material
// quality — floor মাটি < ঢালাই < টাইলস, wall মাটি < টিন < সিমেন্ট,
// roof টিন < সিমেন্ট (user asked 2026-11-25; was most-common-first).
const HOME_COMBOS = [
  { floor: 539, wall: 340, roof: 396, label: 'মেঝে মাটি + দেয়াল মাটি + ছাদ টিন' },
  { floor: 539, wall: 338, roof: 396, label: 'মেঝে মাটি + দেয়াল টিন + ছাদ টিন' },
  { floor: 539, wall: 341, roof: 396, label: 'মেঝে মাটি + দেয়াল সিমেন্ট + ছাদ টিন' },
  { floor: 537, wall: 338, roof: 396, label: 'মেঝে ঢালাই + দেয়াল টিন + ছাদ টিন' },
  { floor: 537, wall: 341, roof: 396, label: 'মেঝে ঢালাই + দেয়াল সিমেন্ট + ছাদ টিন' },
  { floor: 537, wall: 341, roof: 398, label: 'মেঝে ঢালাই + দেয়াল সিমেন্ট + ছাদ সিমেন্ট' },
  { floor: 538, wall: 341, roof: 398, label: 'মেঝে টাইলস + দেয়াল সিমেন্ট + ছাদ সিমেন্ট' }
];
// The combo order before v4.9.82 (most-common-first). A sticky saved
// by an older panel is a bare index into THIS order — see
// stickyHomeCombo: it is migrated to the same house, never read as a
// new-order index.
const OLD_HOME_COMBO_ORDER = [
  { floor: 539, wall: 341, roof: 396 },
  { floor: 539, wall: 338, roof: 396 },
  { floor: 537, wall: 341, roof: 396 },
  { floor: 539, wall: 340, roof: 396 },
  { floor: 537, wall: 338, roof: 396 },
  { floor: 537, wall: 341, roof: 398 },
  { floor: 538, wall: 341, roof: 398 }
];
const HOME_COMBO_OTHER = 'other';
const HOME_COMBO_STORAGE_KEY = 'fc_pro_home_combo';
// Leftover PMT option lists — the site's exact option names.
const PMT_KITCHEN_OPTIONS = [
  { id: 297, label: 'হ্যা' },
  { id: 298, label: 'না' }
];
const PMT_DINING_OPTIONS = [
  { id: 291, label: 'হ্যা' },
  { id: 292, label: 'না' }
];
const PMT_LAND_OPTIONS = [
  { id: 405, label: '০.৫০ একর বা তার কম' },
  { id: 406, label: '০.৫১-১.৫ একর পর্যন্ত' },
  { id: 407, label: '১.৫ একর বা তার বেশি' },
  { id: 408, label: 'কোন জমি নেই' }
];
const PMT_OCCUPATION_OPTIONS = [
  { id: 402, label: 'কৃষি খাতে শ্রম' },
  { id: 403, label: 'অকৃষি খাতে শ্রম' },
  { id: 404, label: 'শ্রমিক/দিনমজুর নেই' }
];
const PMT_LPG_OPTIONS = [
  { id: 590, label: '০ কেজি' },
  { id: 580, label: '০৫ কেজি' },
  { id: 581, label: '১০ কেজি' },
  { id: 582, label: '১২ কেজি' },
  { id: 583, label: '১৫ কেজি' },
  { id: 584, label: '২০ কেজি' },
  { id: 585, label: '২৫ কেজি' },
  { id: 586, label: '৩০ কেজি' },
  { id: 587, label: '৩৫ কেজি' },
  { id: 588, label: '৪০ কেজি' },
  { id: 589, label: '৫০ কেজি' }
];
const PMT_DIESEL_OPTIONS = [
  { id: 596, label: '০ কেজি' },
  { id: 597, label: '১-৫ কেজি' },
  { id: 598, label: '৬-১০ কেজি' },
  { id: 599, label: '১১-১৫ কেজি' },
  { id: 600, label: '১৬-২০ কেজি' },
  { id: 601, label: '২১-২৫ কেজি' },
  { id: 602, label: '২৬-৩০ কেজি' }
];
const PMT_FLOOR_OPTIONS = [
  { id: 537, label: 'ঢালাই (সিমেন্ট/কংক্রিট/ইট /পোড়ামাটি)' },
  { id: 538, label: 'টাইলস/মোজাইক' },
  { id: 539, label: 'মাটি' },
  { id: 540, label: 'কাঠ' },
  { id: 541, label: 'বাঁশ/চাটাই/তালগাছ/সুপারি গাছের গুড়ি' }
];
const PMT_WALL_OPTIONS = [
  { id: 338, label: 'টিন/কাঠের' },
  { id: 339, label: 'খড়/বাঁশ' },
  { id: 340, label: 'মাটির' },
  { id: 341, label: 'ইট/সিমেন্ট' },
  { id: 603, label: 'মিশ্র ইট/টিন/বাঁশ/কাঠ/মাটি' }
];
const PMT_ROOF_OPTIONS = [
  { id: 396, label: 'টিন/কাঠ' },
  { id: 397, label: 'বাঁশ/খড়' },
  { id: 398, label: 'ইট/সিমেন্ট' },
  { id: 542, label: 'ট্যালী' }
];
// Durable assets (Q47, multi-answer) and rooms (Q500) — the site's
// exact option names, in the site's order. Q47 is the one PMT
// question with more than one answer; its options all carry a score
// (see PMT_SCORE_BY_OPTION), so the picker feeds the running total.
const PMT_ASSET_OPTIONS = [
  { id: 422, label: 'কম্পিউটার/ল্যাপটপ' },
  { id: 424, label: 'গাড়ী' },
  { id: 425, label: 'মোটর সাইকেল' },
  { id: 430, label: 'টেলিভিশন' },
  { id: 435, label: 'মোবাইল ফোন' },
  { id: 436, label: 'ক্যামেরা' },
  { id: 429, label: 'রেফ্রিজারেটর/ওভেন/ওয়াশিং মেশিন' },
  { id: 529, label: 'কার্পেট' },
  { id: 437, label: 'কৃষি সেচের পাওয়ার পাম্প' },
  { id: 560, label: 'সোলার প্যানেল' },
  { id: 559, label: 'বৈদ্যুতিক পাখা' },
  { id: 562, label: 'সোফা সেট' },
  { id: 563, label: 'খাট' },
  { id: 564, label: 'ডাইনিং টেবিল' },
  { id: 565, label: 'আলমারি/ওয়ারড্রব /শোকেস/ ড্রেসিং টেবিল' },
  { id: 561, label: 'পাওয়ার টিলার' },
  { id: 591, label: 'টিউবওয়েল' },
  { id: 566, label: 'নৌকা' },
  { id: 592, label: 'সাইকেল/রিকশা' },
  { id: 593, label: 'হিটার/ইনডাকশন চুলা' },
  { id: 594, label: 'ভিসিআর/ভিসিপি/ডিশ সংযোগ' },
];
const PMT_ROOMS_OPTIONS = [
  { id: 501, label: '১' },
  { id: 502, label: '২' },
  { id: 503, label: '৩' },
  { id: 504, label: '৪' },
  { id: 505, label: '৫' },
  { id: 506, label: '৬' },
  { id: 507, label: '৭' },
  { id: 508, label: '৮' },
  { id: 509, label: '৯' },
  { id: 510, label: '১০' },
  { id: 511, label: '১১' },
  { id: 512, label: '১২' },
  { id: 513, label: '১৩' },
  { id: 514, label: '১৪' },
  { id: 515, label: '১৫' },
  { id: 516, label: '১৬' },
  { id: 517, label: '১৭' },
  { id: 518, label: '১৮' },
  { id: 519, label: '১৯' },
  { id: 520, label: '২০' }
];
// User-confirmed default assets (2026-11-22): fan, bed, mobile,
// tubewell — the ones (nearly) every household has. Only the mobile
// scores (+14); the rest score 0.
const PMT_ASSET_DEFAULT_IDS = [559, 563, 435, 591];
// User-confirmed defaults for the leftover picks (2026-11-22):
// kitchen Yes (a separate kitchen is common), dining No (a dining
// room is uncommon), land 0.50 acre or less (most common), diesel
// 0 kg, LPG 0 kg when the fuel is not LPG. Occupation and rooms
// have no default — picked by hand.
const PMT_PICK_DEFAULTS = { kitchen: 297, dining: 292, land: 405, diesel: 596, lpg: 590 };
// PMT scores, non-zero options only (from getApplicationPageData).
// The running total is the sum of the picked answers' scores:
// -95 (poorest) to +237 (best-off). It is NOT the government's
// 0–1000 score — that one is made on the server — so it is never
// compared to the 777/814 bands.
const PMT_SCORE_BY_OPTION = {
  '530': { 531: 12, 532: 12, 533: 12, 535: 12 },
  '1': { 443: -20, 444: -40, 445: -40, 446: -50, 521: -60, 522: -60, 523: -60, 524: -60, 525: -60 },
  '7': { 330: -7, 331: -14, 332: -16, 333: -21, 526: -21, 527: -21, 528: -21 },
  '12': { 440: 4 },
  '14': { 383: 5, 384: 14 },
  '18': { 411: 18 },
  '36': { 297: -5 },
  '33': { 291: 6 },
  '393': { 398: 15 },
  '41': { 386: 7 },
  '25': { 405: 5, 406: 10, 407: 17 },
  '29': { 275: 9 },
  '22': { 402: -9, 403: -4 },
  '47': { 422: 21, 424: 9, 425: 11, 430: 7, 435: 14, 436: 21, 429: 14, 529: 30, 437: 8 }
};
// Household size / children count -> PMT option id (Q1 / Q7).
const PMT_COUNT_OPTION = {
  '1': { 1: 442, 2: 443, 3: 444, 4: 445, 5: 446, 6: 521, 7: 522, 8: 523, 9: 524, 10: 525 },
  '7': { 0: 329, 1: 330, 2: 331, 3: 332, 4: 333, 5: 526, 6: 527, 7: 528 }
};
// Education id -> [Q14 score, Q18 score]. Bands: illiterate and
// Class 1–5 score 0; Class 6–12 scores 5 (head) / 0 (spouse);
// above Class 13 scores 14 (head) / 18 (spouse).
const PMT_EDU_SCORE = {
  88: [0, 0], 188: [0, 0], 189: [0, 0], 190: [0, 0], 191: [0, 0], 199: [0, 0], 94: [0, 0],
  192: [5, 0], 89: [5, 0], 193: [5, 0], 90: [5, 0], 91: [5, 0],
  92: [14, 18], 93: [14, 18], 194: [14, 18], 195: [14, 18], 196: [14, 18], 197: [14, 18], 198: [14, 18]
};
// Sticky home combination: the last combo the user picked, kept in
// The sticky home combo, stored by material ids ("floor,wall,roof")
// instead of a bare index — the list was reordered in v4.9.82
// (bad -> good), so a bare index saved by an older panel would point
// at a different house. A bare integer read back is migrated through
// OLD_HOME_COMBO_ORDER, so the same house survives. A storage object
// can be passed in (tests); otherwise the panel's localStorage is
// used when it exists.
function homeComboKeyForParts(floor, wall, roof) {
  return `${Number(floor)},${Number(wall)},${Number(roof)}`;
}
function stickyHomeCombo(storage) {
  try {
    const store = storage || (typeof localStorage !== 'undefined' ? localStorage : null);
    if (!store) return null;
    const raw = store.getItem(HOME_COMBO_STORAGE_KEY);
    if (raw === null || raw === undefined || String(raw).trim() === '') return null;
    const s = String(raw).trim();
    if (s.includes(',')) {
      // New format: "floor,wall,roof" — resolve by the materials.
      const parts = s.split(',').map((x) => Number(String(x).trim()));
      if (parts.length !== 3 || parts.some((n) => !Number.isFinite(n))) return null;
      const idx = homeComboIndexForParts(parts[0], parts[1], parts[2]);
      return idx >= 0 ? idx : null;
    }
    // Old format: a bare index into OLD_HOME_COMBO_ORDER — migrate
    // it to the same house in the new order.
    const v = Number(s);
    if (!Number.isInteger(v) || v < 0 || v >= OLD_HOME_COMBO_ORDER.length) return null;
    const old = OLD_HOME_COMBO_ORDER[v];
    const idx = homeComboIndexForParts(old.floor, old.wall, old.roof);
    return idx >= 0 ? idx : null;
  } catch (_) { return null; }
}
function saveStickyHomeCombo(index, storage) {
  try {
    const store = storage || (typeof localStorage !== 'undefined' ? localStorage : null);
    if (!store) return;
    if (index === null || index === undefined || index === HOME_COMBO_OTHER) { store.removeItem(HOME_COMBO_STORAGE_KEY); return; }
    const c = HOME_COMBOS[Number(index)];
    if (!c) { store.removeItem(HOME_COMBO_STORAGE_KEY); return; }
    store.setItem(HOME_COMBO_STORAGE_KEY, homeComboKeyForParts(c.floor, c.wall, c.roof));
  } catch (_) {}
}
// Which combo (0–6) matches these floor/wall/roof ids, or -1.
function homeComboIndexForParts(floor, wall, roof) {
  const f = Number(floor), w = Number(wall), r = Number(roof);
  if (!f || !w || !r) return -1;
  return HOME_COMBOS.findIndex((c) => c.floor === f && c.wall === w && c.roof === r);
}
// First pulled answer id for a PMT question, or undefined. Pulled
// answers look like { variable_id, question, answers: [{id, name}] }.
function pmtPulledAnswerId(pmtAnswers, qid) {
  if (!Array.isArray(pmtAnswers)) return undefined;
  const pa = pmtAnswers.find((e) => e && Number(e.variable_id) === Number(qid));
  if (!pa || !Array.isArray(pa.answers) || !pa.answers.length) return undefined;
  const id = Number(pa.answers[0] && pa.answers[0].id);
  return Number.isFinite(id) ? id : undefined;
}
// All pulled answer ids for a PMT question, or undefined. Q47
// (durable assets) is multi-answer, so the singular helper above
// only takes the first — this one takes the whole list.
function pmtPulledAnswerIds(pmtAnswers, qid) {
  if (!Array.isArray(pmtAnswers)) return undefined;
  const pa = pmtAnswers.find((e) => e && Number(e.variable_id) === Number(qid));
  if (!pa || !Array.isArray(pa.answers) || !pa.answers.length) return undefined;
  const ids = pa.answers.map((a) => Number(a && a.id)).filter((n) => Number.isFinite(n));
  return ids.length ? ids : undefined;
}
// Effective PMT picks for the head: raw (extract/pull) wins, then the
// imported form_defaults.pmt override, then the same person's previous
// record, then the pulled draft's answers, then the user defaults
// (kitchen Yes, dining No, land 0.5 acre, diesel 0, LPG 0 unless the
// fuel is LPG; assets fan/bed/mobile/tubewell). The combo: explicit
// pick, then a pulled floor/wall/roof that matches a combo, then
// "other" when the pulled parts match no combo, then the sticky
// combo. fuelId is the effective cooking fuel option id (550 wood
// unless overridden or pulled as LPG 556). importedAssets is the
// imported form_defaults.pmt['47'] override (a single id or a list) —
// it is a source for the assets, not a preserved entry: the head
// pick wins for Q47 now that the panel owns it.
function resolveHeadPmtPicks(rawHead, prevHead, stickyCombo, fuelId, importedAssets) {
  const raw = rawHead || {};
  const prev = prevHead || {};
  const pulled = Array.isArray(raw.pmt_answers) && raw.pmt_answers.length ? raw.pmt_answers : (Array.isArray(prev.pmt_answers) ? prev.pmt_answers : []);
  const num = (v) => (v === undefined || v === null || String(v).trim() === '' ? undefined : Number(v));
  const pick = (key, qid, defVal) => {
    const v = num(raw[key]) ?? num(prev[key]) ?? pmtPulledAnswerId(pulled, qid) ?? defVal;
    return v === undefined ? undefined : Number(v);
  };
  // A multi-answer pick (Q47 assets): any non-empty id list wins, in
  // the same precedence as pick. An empty list falls through — the
  // default preset applies, so "owns nothing" cannot be recorded.
  const toIds = (v) => {
    if (v === undefined || v === null || v === false) return undefined;
    const list = Array.isArray(v) ? v : [v];
    const ids = list.map((x) => Number(x)).filter((n) => Number.isFinite(n));
    return ids.length ? ids : undefined;
  };
  const pickMulti = (key, qid, imported, defVal) =>
    toIds(raw[key]) ?? toIds(imported) ?? toIds(prev[key]) ?? pmtPulledAnswerIds(pulled, qid) ?? defVal;
  const out = {
    pmt_kitchen: pick('pmt_kitchen', 36, PMT_PICK_DEFAULTS.kitchen),
    pmt_dining: pick('pmt_dining', 33, PMT_PICK_DEFAULTS.dining),
    pmt_land: pick('pmt_land', 25, PMT_PICK_DEFAULTS.land),
    pmt_occupation: pick('pmt_occupation', 22, undefined),
    pmt_lpg: pick('pmt_lpg', 579, Number(fuelId) === 556 ? undefined : PMT_PICK_DEFAULTS.lpg),
    pmt_diesel: pick('pmt_diesel', 595, PMT_PICK_DEFAULTS.diesel),
    pmt_assets: pickMulti('pmt_assets', 47, importedAssets, PMT_ASSET_DEFAULT_IDS)
  };
  // Combo + the three material picks.
  let rawCombo = raw.home_combo ?? prev.home_combo;
  // (v4.9.82) Combo-order migration: a record saved by an older
  // panel carries a combo index from the OLD order — but it also
  // carries the three parts that old combo resolved to, and the parts
  // are what actually goes to the form. When the parts match a
  // different combo than the index says, trust the parts: the same
  // house survives the reorder. No parts (a hand-written record) ->
  // the index is taken as-is, in the new order.
  if (rawCombo !== undefined && rawCombo !== null && rawCombo !== HOME_COMBO_OTHER && String(rawCombo).trim() !== '') {
    const idx = Number(rawCombo);
    if (Number.isInteger(idx)) {
      const src = (raw.home_combo !== undefined && raw.home_combo !== null && String(raw.home_combo).trim() !== '') ? raw : prev;
      const f = src ? Number(src.pmt_floor) : 0, w = src ? Number(src.pmt_wall) : 0, r = src ? Number(src.pmt_roof) : 0;
      if (f && w && r) {
        const byParts = homeComboIndexForParts(f, w, r);
        if (byParts >= 0 && byParts !== idx) rawCombo = byParts;
      }
    }
  }
  const pulledFloor = pmtPulledAnswerId(pulled, 536);
  const pulledWall = pmtPulledAnswerId(pulled, 30);
  const pulledRoof = pmtPulledAnswerId(pulled, 393);
  let combo = (rawCombo === undefined || rawCombo === null || String(rawCombo).trim() === '') ? undefined : rawCombo;
  if (combo === undefined) {
    const match = homeComboIndexForParts(pulledFloor, pulledWall, pulledRoof);
    if (match >= 0) combo = match;
    else if (pulledFloor || pulledWall || pulledRoof) combo = HOME_COMBO_OTHER;
    else if (stickyCombo !== null && stickyCombo !== undefined) combo = stickyCombo;
  }
  out.home_combo = combo;
  if (combo !== undefined && combo !== HOME_COMBO_OTHER && combo !== '' && HOME_COMBOS[Number(combo)]) {
    const c = HOME_COMBOS[Number(combo)];
    out.pmt_floor = c.floor; out.pmt_wall = c.wall; out.pmt_roof = c.roof;
  } else {
    out.pmt_floor = num(raw.pmt_floor) ?? num(prev.pmt_floor) ?? pulledFloor;
    out.pmt_wall = num(raw.pmt_wall) ?? num(prev.pmt_wall) ?? pulledWall;
    out.pmt_roof = num(raw.pmt_roof) ?? num(prev.pmt_roof) ?? pulledRoof;
  }
  return out;
}
// form_defaults.pmt entries for the head's picks (the injector's
// override path). Only set entries have a value; rooms send the
// option id (501–520), not the count.
function pmtOverridesFromHead(head) {
  const h = head || {};
  const out = {};
  const set = (qid, v) => { if (v !== undefined && v !== null && String(v).trim() !== '') out[String(qid)] = Number(v); };
  const setMulti = (qid, v) => { if (Array.isArray(v) && v.length) { const ids = v.map(Number).filter((n) => Number.isFinite(n)); if (ids.length) out[String(qid)] = ids; } };
  set(36, h.pmt_kitchen);
  set(33, h.pmt_dining);
  set(25, h.pmt_land);
  set(22, h.pmt_occupation);
  set(500, h.no_of_room);
  set(579, h.pmt_lpg);
  set(595, h.pmt_diesel);
  set(536, h.pmt_floor);
  set(30, h.pmt_wall);
  set(393, h.pmt_roof);
  setMulti(47, h.pmt_assets);
  return out;
}
// Warning text for the home combo: the draft's own floor/wall/roof
// when they differ from the picked combo. Auto-Fill never
// overwrites a filled answer, so the draft's values stay — the
// warning keeps the user from expecting the pick to replace them.
function homeComboWarningText(head) {
  const h = head || {};
  const pulled = Array.isArray(h.pmt_answers) ? h.pmt_answers : [];
  const f = pmtPulledAnswerId(pulled, 536);
  const w = pmtPulledAnswerId(pulled, 30);
  const r = pmtPulledAnswerId(pulled, 393);
  if (!f && !w && !r) return '';
  const combo = h.home_combo;
  let ef, ew, er;
  if (combo !== undefined && combo !== null && combo !== '' && combo !== HOME_COMBO_OTHER && HOME_COMBOS[Number(combo)]) {
    const c = HOME_COMBOS[Number(combo)];
    ef = c.floor; ew = c.wall; er = c.roof;
  } else {
    ef = h.pmt_floor; ew = h.pmt_wall; er = h.pmt_roof;
  }
  if (Number(ef) === Number(f) && Number(ew) === Number(w) && Number(er) === Number(r)) return '';
  const nameOf = (list, id) => { const o = (list || []).find((x) => Number(x.id) === Number(id)); return o ? o.label : (id ? String(id) : '—'); };
  return `Draft-এ আছে: মেঝে ${nameOf(PMT_FLOOR_OPTIONS, f)}, দেয়াল ${nameOf(PMT_WALL_OPTIONS, w)}, ছাদ ${nameOf(PMT_ROOF_OPTIONS, r)} — Auto-Fill এগুলো বদলাবে না।`;
}
// DOB (DD-MM-YYYY or YYYY-MM-DD) -> whole years of age, or null.
// A small local parse so this block stays self-contained for tests.
function pmtAgeYears(dob) {
  if (!dob) return null;
  const s = String(dob).trim();
  let y, m, d;
  let mm = s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (mm) { d = Number(mm[1]); m = Number(mm[2]); y = Number(mm[3]); }
  else {
    mm = s.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
    if (!mm) return null;
    y = Number(mm[1]); m = Number(mm[2]); d = Number(mm[3]);
  }
  const now = new Date();
  let age = now.getFullYear() - y;
  if (now.getMonth() + 1 < m || (now.getMonth() + 1 === m && now.getDate() < d)) age--;
  return age >= 0 ? age : null;
}
// Running PMT score total for the record: the sum of the picked
// answers' scores (derived + presets + leftover picks), range -95
// to +237. Precedence per question: form_defaults.pmt override,
// then the head pick, then the pulled draft's answer, then the
// derivation / user preset. Questions whose options all score 0
// (floor, wall, water, fuel, LPG amount, diesel, rooms, ownership,
// electricity, ethnic) contribute nothing and are skipped.
function computePmtScoreTotal(data) {
  const head = (data && data.head) || {};
  const defs = (data && data.form_defaults) || {};
  const ov = (defs.pmt && typeof defs.pmt === 'object') ? defs.pmt : {};
  const pulled = Array.isArray(head.pmt_answers) ? head.pmt_answers : [];
  const scoreOf = (qid, id) => {
    const m = PMT_SCORE_BY_OPTION[String(qid)];
    return (m && m[Number(id)]) || 0;
  };
  const overrideIds = (qid) => {
    const o = ov[qid] ?? ov[String(qid)];
    if (o === undefined || o === null || o === false) return undefined;
    return Array.isArray(o) ? o : [o];
  };
  const pickId = (qid, headKey, defVal) => {
    const o = overrideIds(qid);
    if (o && o.length) return o[0];
    const h = head[headKey];
    if (h !== undefined && h !== null && String(h).trim() !== '') return Number(h);
    const p = pmtPulledAnswerId(pulled, qid);
    if (p !== undefined) return p;
    return defVal;
  };
  let total = 0;
  // Location (override, else area type 2/3 = town, 12; else Union/Rural, 0).
  const locOv = overrideIds(530);
  if (locOv && locOv.length) total += scoreOf(530, locOv[0]);
  else total += (Number(defs.area_type_id) === 2 || Number(defs.area_type_id) === 3) ? 12 : 0;
  // Household size + children (count -> option id, clamped to the list).
  const size = Number(defs.total_members);
  if (Number.isFinite(size) && size > 0) {
    const o = overrideIds(1);
    total += o && o.length ? scoreOf(1, o[0]) : scoreOf(1, PMT_COUNT_OPTION['1'][Math.min(10, Math.max(1, size))] ?? 442);
  }
  const kids = Number(defs.children_under_18);
  if (Number.isFinite(kids) && kids >= 0) {
    const o = overrideIds(7);
    total += o && o.length ? scoreOf(7, o[0]) : scoreOf(7, PMT_COUNT_OPTION['7'][Math.min(7, Math.max(0, kids))] ?? 329);
  }
  // Head age band (override, else from the DOB).
  const ageOv = overrideIds(12);
  if (ageOv && ageOv.length) total += scoreOf(12, ageOv[0]);
  else {
    const age = pmtAgeYears(head.dob);
    if (age !== null) total += scoreOf(12, age < 41 ? 439 : (age < 60 ? 440 : 441));
  }
  // Head + spouse education bands (override, else from the education ids).
  const edu14Ov = overrideIds(14);
  if (edu14Ov && edu14Ov.length) total += scoreOf(14, edu14Ov[0]);
  else {
    const headEdu = Number(head.education_status_id);
    if (Number.isFinite(headEdu) && PMT_EDU_SCORE[headEdu]) total += PMT_EDU_SCORE[headEdu][0];
  }
  const edu18Ov = overrideIds(18);
  if (edu18Ov && edu18Ov.length) total += scoreOf(18, edu18Ov[0]);
  else {
    const members = Array.isArray(data.family_members) ? data.family_members : [];
    const spouse = members.find((m) => m && (m.relation === 'Husband' || m.relation === 'Wife'));
    if (spouse) {
      const spEdu = Number(spouse.education_status_id);
      if (Number.isFinite(spEdu) && PMT_EDU_SCORE[spEdu]) total += PMT_EDU_SCORE[spEdu][1];
    }
  }
  // Remittance (override only — the panel never picks Yes; No scores 0).
  const rem = overrideIds(29);
  if (rem && rem.length) total += scoreOf(29, rem[0]);
  // Latrine (preset sanitary +7 unless overridden) + assets (the
  // head card's pick, else the preset fan/bed/mobile/tubewell =
  // +14 from the mobile, unless overridden).
  total += scoreOf(41, pickId(41, undefined, 386));
  const ovAssets = overrideIds(47);
  const headAssets = Array.isArray(head.pmt_assets) && head.pmt_assets.length
    ? head.pmt_assets.map(Number).filter((n) => Number.isFinite(n)) : undefined;
  const assetIds = (ovAssets && ovAssets.length ? ovAssets
    : (headAssets && headAssets.length ? headAssets
    : (pmtPulledAnswerIds(pulled, 47) || PMT_ASSET_DEFAULT_IDS)));
  assetIds.forEach((id) => { total += scoreOf(47, id); });
  // Leftover picks.
  total += scoreOf(36, pickId(36, 'pmt_kitchen', PMT_PICK_DEFAULTS.kitchen));
  total += scoreOf(33, pickId(33, 'pmt_dining', PMT_PICK_DEFAULTS.dining));
  total += scoreOf(25, pickId(25, 'pmt_land', PMT_PICK_DEFAULTS.land));
  total += scoreOf(22, pickId(22, 'pmt_occupation', undefined));
  total += scoreOf(393, pickId(393, 'pmt_roof', undefined));
  return total;
}
// PMT score line: the head card's running total — the sum of the
// picked answers' scores. Lower = poorer = more eligible. It is the
// raw total only (-95 to +237), never the government's 0–1000 score,
// so it is never compared to the 777/814 bands. Read-only; it
// refreshes from recalculateHouseholdSummary whenever anything changes.
function pmtScoreLineText() {
  const data = state.lastExtracted;
  if (!data) return '—';
  return `${computePmtScoreTotal(data)} (কম = বেশি গরিব)`;
}
function updatePmtScoreLine() {
  const el = document.querySelector('[data-field="pmt_score_total"]');
  if (el) el.textContent = pmtScoreLineText();
}
// --- end PMT leftover picks ---

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
  { key: 'education_status_id', label: 'Education (শিক্ষা)', type: 'edu_select' },
  { key: 'profession', label: 'Profession (পেশা)', type: 'profession_select' },
  // Student? (v4.9.78): the site's own member-row question —
  // "বর্তমানে শিক্ষার্থী?" — on the person's own card. The profession
  // drives it (Student => Yes at any age); a hand pick here wins over
  // the derivation (it is recorded as a correction).
  { key: 'is_currently_student', label: 'Student? (বর্তমানে শিক্ষার্থী)', type: 'yesno_select' },
  // (v4.9.78) Marital before income — the member-card field order.
  { key: 'marital_status', label: 'Marital (বৈবাহিক)', type: 'marital_select' },
  { key: 'estimate_annual_income', label: 'Annual Income (বার্ষিক আয়)' },
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
  { key: 'is_dss_training_or_financial_benefit', label: 'DSS training/benefit?', type: 'yesno_select' },
];

// Household / other info (v4.9.78): everything that is NOT one person's
// personal info — it lives on the head record (the injector reads by
// record key, never by card, so the payload is unchanged), but it
// renders in its own card AFTER every person, so the household is
// verified person by person first and the other info after. Order is
// the user's: phone + MFS first, then home-made-of, then the rest of
// the PMT picks + score, then Bank, Address, Permanent Address,
// Socio-Economic, General, Nominee, and the pulled program/PMT detail
// (the collapsible, rendered by buildEditableCard for this card).
const HOUSEHOLD_FIELDS = [
  // Phone + MFS (v4.9.49, v4.9.50): the head's mobile number fills the
  // form's ONE mobile field, data.mobile (the form never asks for a
  // mobile anywhere else); the MFS pick fills PMT field 138
  // (Bkash/Nagad/...) via form_defaults.program_fields. The MFS
  // number sits here too, right under the provider — phone + Bkash
  // first, as the user asked.
  { key: 'mobile_number', label: 'Mobile (মোবাইল)' },
  { key: 'mfs_provider_id', label: 'MFS (মোবাইল ব্যাংকিং)', type: 'mfs_select' },
  { key: 'mfs_number', label: 'MFS Number', section: 'যোগাযোগ ও ব্যাংক (Bank)' },
  // PMT leftover picks (v4.9.69): the questions Auto-Fill + presets
  // leave behind. Unsectioned so they always show (also on a New
  // Form). Labels are the site's own question text, word for word
  // (user 2026-11-22). The floor/wall/roof rows hide unless the
  // home combo is "other" — a combo pick sets all three.
  { key: 'home_combo', label: 'বাড়ি কেমন (Home made of)', type: 'home_combo_select' },
  { key: 'pmt_floor', label: 'খানার প্রধান বসতঘরের মেঝে বা ফ্লোর কি দিয়ে তৈরী', type: 'pmt_option_select', options: PMT_FLOOR_OPTIONS },
  { key: 'pmt_wall', label: 'খানার প্রধান ঘরের দেয়াল কি দিয়ে তৈরী?', type: 'pmt_option_select', options: PMT_WALL_OPTIONS },
  { key: 'pmt_roof', label: 'খানার প্রধান ঘরের ছাদ কি দিয়ে তৈরী', type: 'pmt_option_select', options: PMT_ROOF_OPTIONS },
  { key: 'pmt_kitchen', label: 'খানায় কি পৃথক রান্নাঘর আছে?', type: 'pmt_option_select', options: PMT_KITCHEN_OPTIONS },
  { key: 'pmt_dining', label: 'খানায় কি পৃথক খাবার ঘর/কক্ষ আছে?', type: 'pmt_option_select', options: PMT_DINING_OPTIONS },
  { key: 'pmt_land', label: 'খানার সকল সদস্যের মালিকানাধীন মোট জমির পরিমাণ কত?', type: 'pmt_option_select', options: PMT_LAND_OPTIONS },
  { key: 'pmt_occupation', label: 'খানার কোন সদস্য কি কৃষি অথবা অকৃষি শ্রমিক হিসেবে নিয়োজিত আছেন?', type: 'pmt_option_select', options: PMT_OCCUPATION_OPTIONS },
  { key: 'no_of_room', label: 'খানায় মোট রুম/কক্ষ সংখ্যা', type: 'pmt_option_select', options: PMT_ROOMS_OPTIONS },
  { key: 'pmt_lpg', label: 'খানায় রান্নার জ্বালানির প্রধান উপকরণ এলপিজি গ্যাস হলে প্রতিমাসে এলপিজি গ্যাস ব্যবহারের পরিমান', type: 'pmt_option_select', options: PMT_LPG_OPTIONS },
  { key: 'pmt_diesel', label: 'কৃষি কাজে ডিজেল ব্যবহার হলে তার মাসিক আনুমানিক পরিমাণ', type: 'pmt_option_select', options: PMT_DIESEL_OPTIONS },
  { key: 'pmt_assets', label: 'খানার মালিকানাধীন নিম্নের পরিসম্পদ গুলোর কোনটি আছে ? (একাধিক উত্তর হতে পারে)', type: 'pmt_assets_multi' },
  { key: 'pmt_score_total', label: 'PMT স্কোর', type: 'pmt_score' },
  // (v38) All-tabs pull: the rest of the form, organised in sections
  // matching the site's tabs. Text fields are editable and fill back
  // (empty-only); 'info' fields show the name the pull resolved from
  // the site's own lists (the panel has no such list to offer a
  // dropdown from, so the name is shown, not edited — the id rides
  // on the record for Auto-Fill).
  { key: 'account_type', label: 'Account Type', type: 'account_type_select', section: 'যোগাযোগ ও ব্যাংক (Bank)' },
  { key: 'bank_name', label: 'Bank', type: 'info', section: 'যোগাযোগ ও ব্যাংক (Bank)' },
  { key: 'branch_name', label: 'Branch', type: 'info', section: 'যোগাযোগ ও ব্যাংক (Bank)' },
  { key: 'bank_division_name', label: 'Bank Division', type: 'info', section: 'যোগাযোগ ও ব্যাংক (Bank)' },
  { key: 'bank_district_name', label: 'Bank District', type: 'info', section: 'যোগাযোগ ও ব্যাংক (Bank)' },
  { key: 'account_name', label: 'Account Name', section: 'যোগাযোগ ও ব্যাংক (Bank)' },
  { key: 'account_owner', label: 'Account Owner', type: 'info', section: 'যোগাযোগ ও ব্যাংক (Bank)' },
  { key: 'account_number', label: 'Account Number', section: 'যোগাযোগ ও ব্যাংক (Bank)' },
  { key: 'address_location_type_id', label: 'Location Type', type: 'location_type_select', section: 'ঠিকানা (Address)' },
  { key: 'address_division_name', label: 'Division', type: 'info', section: 'ঠিকানা (Address)' },
  { key: 'address_district_name', label: 'District', type: 'info', section: 'ঠিকানা (Address)' },
  { key: 'address_thana_name', label: 'Thana/Upazila', type: 'info', section: 'ঠিকানা (Address)' },
  { key: 'address_union_name', label: 'Union', type: 'info', section: 'ঠিকানা (Address)' },
  { key: 'address_pouro_name', label: 'Pouroshava', type: 'info', section: 'ঠিকানা (Address)' },
  { key: 'address_city_name', label: 'City', type: 'info', section: 'ঠিকানা (Address)' },
  { key: 'address_ward_name', label: 'Ward', type: 'info', section: 'ঠিকানা (Address)' },
  { key: 'address_post_code', label: 'Post Code', section: 'ঠিকানা (Address)' },
  { key: 'address_text', label: 'Address (ঠিকানা)', section: 'ঠিকানা (Address)' },
  { key: 'permanent_address_location_type_id', label: 'Location Type', type: 'location_type_select', section: 'স্থায়ী ঠিকানা (Permanent Address)' },
  { key: 'permanent_address_division_name', label: 'Division', type: 'info', section: 'স্থায়ী ঠিকানা (Permanent Address)' },
  { key: 'permanent_address_district_name', label: 'District', type: 'info', section: 'স্থায়ী ঠিকানা (Permanent Address)' },
  { key: 'permanent_address_thana_name', label: 'Thana/Upazila', type: 'info', section: 'স্থায়ী ঠিকানা (Permanent Address)' },
  { key: 'permanent_address_union_name', label: 'Union', type: 'info', section: 'স্থায়ী ঠিকানা (Permanent Address)' },
  { key: 'permanent_address_pouro_name', label: 'Pouroshava', type: 'info', section: 'স্থায়ী ঠিকানা (Permanent Address)' },
  { key: 'permanent_address_city_name', label: 'City', type: 'info', section: 'স্থায়ী ঠিকানা (Permanent Address)' },
  { key: 'permanent_address_ward_name', label: 'Ward', type: 'info', section: 'স্থায়ী ঠিকানা (Permanent Address)' },
  { key: 'permanent_address_post_code', label: 'Post Code', section: 'স্থায়ী ঠিকানা (Permanent Address)' },
  { key: 'permanent_address_text', label: 'Address (ঠিকানা)', section: 'স্থায়ী ঠিকানা (Permanent Address)' },
  { key: 'program_male', label: 'Male Members (পুরুষ)', type: 'info', section: 'আর্থ-সামাজিক তথ্য (Socio-Economic)' },
  { key: 'program_female', label: 'Female Members (নারী)', type: 'info', section: 'আর্থ-সামাজিক তথ্য (Socio-Economic)' },
  { key: 'program_hijra', label: 'Hijra Members (হিজড়া)', type: 'info', section: 'আর্থ-সামাজিক তথ্য (Socio-Economic)' },
  { key: 'program_abroad_male', label: 'Abroad — Male (বিদেশে পুরুষ)', type: 'info', section: 'আর্থ-সামাজিক তথ্য (Socio-Economic)' },
  { key: 'program_abroad_female', label: 'Abroad — Female (বিদেশে নারী)', type: 'info', section: 'আর্থ-সামাজিক তথ্য (Socio-Economic)' },
  { key: 'program_abroad_hijra', label: 'Abroad — Hijra (বিদেশে হিজড়া)', type: 'info', section: 'আর্থ-সামাজিক তথ্য (Socio-Economic)' },
  { key: 'spouse_name_bn', label: 'Spouse (BN)', section: 'অতিরিক্ত তথ্য (General)' },
  { key: 'spouse_name_en', label: 'Spouse (EN)', section: 'অতিরিক্ত তথ্য (General)' },
  { key: 'identification_mark', label: 'ID Mark (শনাক্তকরণ চিহ্ন)', section: 'অতিরিক্ত তথ্য (General)' },
  { key: 'nationality', label: 'Nationality (জাতীয়তা)', section: 'অতিরিক্ত তথ্য (General)' },
  { key: 'email', label: 'Email (ইমেইল)', section: 'অতিরিক্ত তথ্য (General)' },
  { key: 'mobile_operator', label: 'Mobile Operator', type: 'info', section: 'অতিরিক্ত তথ্য (General)' },
  { key: 'disability_id', label: 'Disability (প্রতিবন্ধিতা)', type: 'info', labelMap: 'DISABILITY_TYPE_OPTIONS', section: 'অতিরিক্ত তথ্য (General)' },
  { key: 'house_size', label: 'Household Size (খানার সদস্য)', type: 'info', section: 'অতিরিক্ত তথ্য (General)' },
  { key: 'no_of_room_name', label: 'No. of Rooms (কক্ষ সংখ্যা)', type: 'info', section: 'অতিরিক্ত তথ্য (General)' },
  { key: 'nominee_bn', label: 'Nominee (BN)', section: 'নমিনি (Nominee)', hideWhenEmpty: true },
  { key: 'nominee_en', label: 'Nominee (EN)', section: 'নমিনি (Nominee)', hideWhenEmpty: true },
  { key: 'nominee_verification_number', label: 'Nominee NID/BRN', section: 'নমিনি (Nominee)', hideWhenEmpty: true },
  { key: 'nominee_date_of_birth', label: 'Nominee DOB', section: 'নমিনি (Nominee)', hideWhenEmpty: true },
  { key: 'nominee_address', label: 'Nominee Address', section: 'নমিনি (Nominee)', hideWhenEmpty: true },
  { key: 'nominee_relation_with_beneficiary', label: 'Nominee Relation', section: 'নমিনি (Nominee)', hideWhenEmpty: true },
  { key: 'nominee_nationality', label: 'Nominee Nationality', section: 'নমিনি (Nominee)', hideWhenEmpty: true }
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
  // Student? (v4.9.78): the site's own member-row question —
  // "বর্তমানে শিক্ষার্থী?" — the profession drives it (Student =>
  // Yes at any age); a hand pick here wins over the derivation.
  { key: 'is_currently_student', label: 'Student? (বর্তমানে শিক্ষার্থী)', type: 'yesno_select' },
  { key: 'maritial_status_id', label: 'Marital (বৈবাহিক)', type: 'marital_select' },
  // (v38, v4.9.65) Annual income (the form's real number — editable,
  // fills back empty-only). The Literacy and Govt Job rows are gone
  // (v4.9.65, user: unnecessary) — the data still flows through
  // normalizeOutput into the payload, and the injector still fills
  // literacy from education; the cards just don't show those rows.
  { key: 'estimate_annual_income', label: 'Annual Income (বার্ষিক আয়)' },
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
// Account type (v38): the head form's account_type — 1 = bank
// account, 2 = MFS (from the uploaded bundle's summary view).
const ACCOUNT_TYPE_OPTIONS = [
  { id: 1, label: 'ব্যাংক অ্যাকাউন্ট (Bank Account)' },
  { id: 2, label: 'মোবাইল ব্যাংকিং (MFS)' }
];
// Location type (v38): the address form's location_type — the
// site's subLocationType list: 1 Pouroshava, 2 Union.
const LOCATION_TYPE_OPTIONS = [
  { id: 1, label: 'পৌরসভা (Pouroshava)' },
  { id: 2, label: 'ইউনিয়ন (Union)' }
];
// Literacy (lookup type 45, v38): 241 read and write, 242 read only,
// 243 cannot read or write — shown as a label on member cards.
const LITERACY_LABELS = {
  241: 'পড়তে ও লিখতে পারে (Read & write)',
  242: 'শুধু পড়তে পারে (Read only)',
  243: 'পড়তে/লিখতে পারে না (Cannot read or write)'
};
// (v38) Label maps the 'info' field type resolves BY NAME — the field
// lists reference them as strings, so a test that loads HEAD_FIELDS /
// MEMBER_FIELDS first never hits a const-initialisation order trap
// (the direct const reference crashed every such test).
const LABEL_MAPS = { DISABILITY_TYPE_OPTIONS, LITERACY_LABELS };

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

const state = { head: [], other: [], pulledImages: [], lastExtracted: null, halnagad: null,
  // (v4.9.84) True once an extraction attempt has ENDED (success or
  // failure) — see peopleCardsVisible. Cleared when a new photo lands
  // (a new pending extraction) and on a fresh form.
  extractionAttempted: false,
  // (v4.9.85) True when the current form was started explicitly with
  // New Form — a manual form. The Form Photos / Household / 2500 gate
  // stays open for it from the start (see formCardsGateOpen), so all
  // four cards show on a fresh New Form: Photo, Members, Household
  // and 2500. Saved in the session, so a reload keeps them visible.
  manualNewForm: false };
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
// Perspective detection (auto-scan / live edge view): off by default,
// remembered across sessions. Off = plain photo, crop by hand.
// A stored '1' (turned on before) still turns it on.
let perspectiveEnabled = false;
try { perspectiveEnabled = localStorage.getItem('fc_pro_perspective') === '1'; } catch (_) {}
// Banglish auto-transliteration (v4.9.48): on by default, remembered
// across sessions. Off = typing a Bangla name leaves the English
// field blank, so it can be typed by hand (New Form).
let banglishEnabled = true;
try { banglishEnabled = localStorage.getItem('fc_pro_banglish') !== '0'; } catch (_) {}
// Burst capture (v4.9.76): on by default, remembered across sessions.
// On = one Capture tap takes BURST_SHOTS shots and the picker lets the
// user choose one; off = one Capture tap takes a single photo straight
// into the crop editor. A stored '0' (turned off before) turns it off.
let burstEnabled = true;
try { burstEnabled = localStorage.getItem('fc_pro_burst') !== '0'; } catch (_) {}
let panX = 0;
let panY = 0;
let isDragging = false;
let startX = 0;
let startY = 0;
// (v4.9.89) Two-finger pinch in progress in the crop editor:
// { dist, zoom, panX, panY, cx, cy } — the finger distance, the zoom
// and pan it started from, and the canvas centre (client px, the
// space the drag handler already uses). Null when not pinching.
let pinchStart = null;
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
  const pulledResetBtn = $('pulledResetBtn');
  if (pulledResetBtn) pulledResetBtn.addEventListener('click', resetPulledImages);
  // (v4.9.83) Tap the Form Photos header to expand/collapse the empty
  // card — but a tap on the Reset button must not toggle it.
  const pulledHead = document.querySelector('#pulledCard .card-head');
  if (pulledHead) pulledHead.addEventListener('click', (e) => {
    if (e.target && e.target.closest && e.target.closest('button')) return;
    togglePulledCard();
  });

  $('captureHeadBtn').addEventListener('click', () => openCamera('head'));
  $('captureOtherBtn').addEventListener('click', () => openCamera('other'));
  // (v4.9.90) Form-photo slot upload: one file per slot — the crop
  // editor OPENS so the user crops the picture himself; the panel
  // never crops on its own (v4.9.88's silent centre-crop is
  // reverted). The camera still opens the crop editor, and a
  // manual re-crop stays available from the saved photo.
  const photoSlotInput = $('photoSlotUpload');
  if (photoSlotInput) {
    photoSlotInput.addEventListener('change', (e) => {
      const slot = photoSlotUploadTarget;
      photoSlotUploadTarget = null;
      const file = e.target.files && e.target.files[0];
      if (!file || !slot) { if (e.target) e.target.value = ''; return; }
      if (!file.type.startsWith('image/')) {
        setStatus('That is not a photo.', 'err');
        if (e.target) e.target.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onload = (evt) => {
        const b64 = String(evt.target.result || '').split(',')[1] || '';
        if (!b64) { setStatus('Could not read this photo.', 'err'); return; }
        openCropForPhotoSlot(slot, b64, file.name, 'upload');
      };
      reader.onerror = () => setStatus('Could not read this photo.', 'err');
      reader.readAsDataURL(file);
      if (e.target) e.target.value = '';
    });
  }

  $('capturePhotoBtn').addEventListener('click', capturePanelPhoto);
  $('cancelCameraBtn').addEventListener('click', cancelPanelCamera);
  $('closeCameraBtn').addEventListener('click', cancelPanelCamera);
  $('switchCameraBtn').addEventListener('click', switchPanelCamera);
  const perspCamBtn = $('perspectiveToggleCamBtn');
  if (perspCamBtn) perspCamBtn.addEventListener('click', togglePerspective);
  setupBurstToggle();
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

  $('clearAllBtn').addEventListener('click', clearAll);

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
      // (v4.9.84) Restore the extraction-attempt flag with the rest
      // of the session (see saveSessionState).
      if (typeof s.extractionAttempted === 'boolean') state.extractionAttempted = s.extractionAttempted;
      // (v4.9.85) Restore the manual-New-Form flag the same way, so
      // a reloaded blank form keeps all four cards visible.
      if (typeof s.manualNewForm === 'boolean') state.manualNewForm = s.manualNewForm;
      renderPreviews('head');
      renderPreviews('other');
      if (s.lastExtracted && !state.lastExtracted) {
        state.lastExtracted = normalizeOutput(s.lastExtracted, true);
        renderExtractedCards(state.lastExtracted);
        $('autofillBtn').disabled = false;
        setStatus('Restored previous session data automatically!', 'ok');
      }
      // (v4.9.83) After lastExtracted is restored: the Form Photos
      // gate reads it, so a photo-less restored record still opens it.
      renderPulledImages();
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
    // (v4.9.95) The v60 injector reports WHICH corrections actually
    // landed (correctionsLanded) — clear only those, plus stale ones
    // whose person is gone. A correction that did not land stays for
    // the next Auto-Fill instead of being consumed by a fill that
    // merely ran (the Sharmin case: Divorced/Unemployed picked in the
    // panel, never landing, then gone from the corrections).
    const applied = e.data.detail && e.data.detail.correctionsApplied;
    const landed = e.data.detail && e.data.detail.correctionsLanded;
    const stale = e.data.detail && e.data.detail.correctionsStale;
    if (e.data.detail.success && state.lastExtracted && state.lastExtracted.corrections) {
      if (Array.isArray(landed)) {
        const clearKeys = landed.concat(Array.isArray(stale) ? stale : []);
        for (const key of clearKeys) {
          if (typeof key !== 'string') continue;
          if (key.indexOf('head:') === 0) {
            const k = key.slice(5);
            if (state.lastExtracted.corrections.head) delete state.lastExtracted.corrections.head[k];
          } else if (key.indexOf('member:') === 0) {
            const rest = key.slice(7);
            const sep = rest.lastIndexOf(':');
            if (sep < 0) continue;
            const idKey = rest.slice(0, sep), k = rest.slice(sep + 1);
            const mem = state.lastExtracted.corrections.members && state.lastExtracted.corrections.members[idKey];
            if (mem) {
              delete mem[k];
              // The marital key has two spellings (card 'marital_status'
              // vs row 'maritial_status_id') — clear both, so a stale
              // spelling never survives.
              if (k === 'maritial_status_id') delete mem.marital_status;
              if (k === 'marital_status') delete mem.maritial_status_id;
            }
          }
        }
        const c = state.lastExtracted.corrections;
        if (c.head && !Object.keys(c.head).length) delete c.head;
        if (c.members) {
          for (const idKey of Object.keys(c.members)) {
            if (!Object.keys(c.members[idKey]).length) delete c.members[idKey];
          }
          if (!Object.keys(c.members).length) delete c.members;
        }
        if (!Object.keys(c).length) delete state.lastExtracted.corrections;
        if (clearKeys.length) saveSessionState();
      } else if (typeof applied === 'number' && applied > 0) {
        // Older injector (no correctionsLanded): clear all, as before.
        delete state.lastExtracted.corrections;
        saveSessionState();
      }
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
      // (v4.9.57) A pulled photo's dataUrl is a data: URL when the
      // bytes were fetched, or the site's own https preview URL
      // (gateway) when the byte fetch failed — both display in a
      // plain <img>, so keep both; anything else is dropped.
      const pulled = Array.isArray(res.payload.images)
        ? res.payload.images.filter((im) => im && typeof im.dataUrl === 'string' && (im.dataUrl.startsWith('data:image') || /^https?:\/\//i.test(im.dataUrl)))
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
      // (v4.9.84) Keep People visible after a reload that follows a
      // failed extraction — without this the flag resets and the blank
      // cards hide again with no way back except re-extracting.
      extractionAttempted: state.extractionAttempted,
      // (v4.9.85) Keep a manual New Form's cards visible after a
      // reload — without this the gate would close again on the
      // restored blank form.
      manualNewForm: state.manualNewForm,
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
  if (age < 6) return isHead ? 110 : 275;   // little child: Others / Not Applicable
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

// Student flag (v4.9.78): the site's member-row question
// "বর্তমানে শিক্ষার্থী?" (Currently Student? Age 3–34) rides on the
// record as `is_currently_student` (1 Yes / 0 No). The injector fills
// the row radio from it; the panel now stores and shows it on the
// person's own card, next to the profession. The PROFESSION drives it:
// Student (member livelihood 220 / head profession 106) => Yes — at
// any age, so a hand-picked 25+ student still gets Yes. A hand pick
// of the flag itself wins over the derivation (see studentFlagHandSet).
//
// studentFlagHandSet holds the person keys ('head' or the member's
// nid_or_brn) whose flag was picked BY HAND on the card — for those
// people the derivation never touches the flag. It is cleared on a
// Pull/Import/restore (normalizeOutput preserveOrder), because the
// record the form holds IS the hand value then.
const studentFlagHandSet = new Set();

function studentIdKey(record, isHead) {
  return isHead ? 'head' : (record && record.nid_or_brn ? String(record.nid_or_brn) : null);
}

// The flag a record SHOULD have right now: profession Student => 1.
// (v4.9.80) An explicitly set non-Student profession beats the age
// rule: the profession the user picked wins — a 6-24-year-old
// Farmer/Housewife is NOT a student. The age rule (6-24 => 1, 25+ => 0,
// 0-5 => 0) only applies when no profession is set. The age-24 cap on
// DERIVING the Student profession itself is NOT changed here (open
// question for the user).
function studentFlagForRecord(record, isHead) {
  if (!record) return 0;
  const prof = isHead ? record.profession : record.livelihood_profession_id;
  if (Number(prof) === (isHead ? 106 : 220)) return 1;
  if (prof !== undefined && prof !== null && String(prof).trim() !== '') return 0;
  const age = calculateAgeYears(record.dob);
  if (age === null || age < 0) return 0;
  if (age <= 5) return 0;
  return age <= 24 ? 1 : 0;
}

// Sync the record's flag to what it should be. force=true (a hand
// profession pick) overwrites even a hand-set flag — the profession
// drives it. force=false (a DOB re-derivation) skips a hand-set flag.
// Returns true when the flag changed.
function syncStudentFlag(record, isHead, force) {
  if (!record) return false;
  const key = studentIdKey(record, isHead);
  if (!force && key && studentFlagHandSet.has(key)) return false;
  const want = studentFlagForRecord(record, isHead);
  if (Number(record.is_currently_student) === want) return false;
  record.is_currently_student = want;
  return true;
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
  // Student flag (v4.9.78): the derived profession may make the person
  // a student (6-24) — fill the flag when it is still BLANK, unless it
  // was hand-picked. Like every other field deriveFromDob fills, a
  // value already on the record (typed on the card, pulled, imported)
  // is never overwritten here: recalculateHouseholdSummary re-runs
  // this on every normalizeOutput, and a hand-set No next to a Student
  // profession must survive it. The profession pick itself syncs the
  // flag (force=true) when it changes, and a DOB correction re-syncs
  // it through applyDerivedChange.
  if (isBlankVal(targetObj.is_currently_student) && syncStudentFlag(targetObj, isHead, false)) filled.push('is_currently_student');
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
  // Student flag (v4.9.78): a profession change (e.g. the age crossing
  // 24, or a hand-picked Student) re-syncs the flag — unless hand-set.
  if (syncStudentFlag(targetObj, isHead, false)) changed.push('is_currently_student');
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

// --- Bangla name -> Banglish transliteration (v4.9.64) ---
// Typing a Bangla name fills the matching English (Banglish) field.
// Pure functions, so they are easy to test. Orthographic
// transliteration: each consonant carries its inherent 'o' unless a
// vowel sign (kar), a hasanta (join) or a word-end follows — the
// user writes O more than A (সুমন -> SUMON, রতন -> ROTON, করিম ->
// KORIM, জীবন -> JIBON). A plain word-final consonant takes no
// vowel (করিম -> KORIM, আব্দুল -> ABDUL). A plain consonant in the
// middle of a word drops its 'o' only when the next consonant
// carries a vowel sign (শারমিন -> SHARMIN, সুলতানা -> SULTANA);
// it keeps the 'o' when the next consonant is word-final (সুজন ->
// SUJON), when the next consonant is itself hasanta-joined (বসন্ত
// -> BOSONTA), or before য় (বিজয়া -> BIJOYA). The old rule
// dropped it for every medial consonant and mangled common names
// (সুজন -> SUJN, জীবন -> JIBN); dropping it for none mangled the
// other side (শারমিন -> SHARAMIN, ইসলাম -> ISALAM). Only the
// plain inherent vowel is 'o': the conjunct paths keep 'a' — a
// word-final consonant closing a conjunct (চন্দ্র -> CHANDRA),
// the স/শ/জ + hasanta + ব block (স্বপন -> SWAPAN, বিশ্বাস ->
// BISHWAS, উজ্জ্বল -> UJJWAL), and a consonant before a sign
// (বাংলা -> BANGLA).
// Conjuncts with their own sound: জ্জ -> ZZ (রাজ্জাক -> RAZZAK,
// ইজ্জত -> IZZAT), স/শ/জ + hasanta + ব -> SW/SHW/JW (স্বপন ->
// SWAPAN, স্বাধীন -> SWADHIN, বিশ্বাস -> BISHWAS, ঈশ্বর ->
// ISHWAR), word-initial ইউ -> YU (ইউসুফ -> YUSUF, ইউনুস ->
// YUNUS) and ইয় -> YA (ইয়াসিন -> YASIN, ইয়াকুব -> YAKUB), and
// ো/ু + য় -> W (আনোয়ার -> ANOWAR, জুয়েল -> JUWEL, মনোয়ারা ->
// MONOWARA). A standalone ও after a vowel is a W glide too
// (তাওহীদ -> TAWHID, আওলাদ -> AWLAD). The য় rules are scoped
// to after ো/ু/ও on purpose: মায়া -> MAYA and আয়েশা -> AYESHA
// keep YA/YE, and a bare য় -> W would break both. Common name
// words no rule can get right (one spelling, two sounds — আজিজ
// -> AZIZ but সাজিদ -> SAJID, ছ as S in নেছা/মুরছালিন, জ as Z
// in রেজা/নজরুল/গাজী, the OY names জয়/বিজয়া/ভয়, and the
// surnames চৌধুরী/ভূঁইয়া/শেখ, and the names that keep 'a' —
// আলম, সরকার, চন্দ্র, প্রদীপ, অঞ্জন, জয়া, ওমর, তসলিমা, সঞ্জয়)
// live in BN_NAME_FIXES. The result is
// always uppercase, and মোঃ / মোছাঃ become MD. / MST. like
// formatEnglishName. If the transliteration is wrong for a name,
// the user edits the EN field by hand — the panel never overwrites
// a hand-edited EN value.
const BN_NAME_FIXES = {
  'বেগম': 'BEGUM',
  'রহমান': 'RAHMAN',
  'পারভীন': 'PARVIN',
  'হোসেন': 'HOSSAIN',
  'হুসাইন': 'HUSSAIN',
  'মোহাম্মদ': 'MOHAMMAD',
  'মুহাম্মদ': 'MUHAMMAD',
  'কমল': 'KOMOL',
  'অমল': 'OMOL',
  'বিমল': 'BIMOL',
  'রাজ্জাক': 'RAZZAK',
  'আনোয়ার': 'ANOWAR',
  'আনোয়ারা': 'ANOWARA',
  'মনোয়ারা': 'MONOWARA',
  'নেছা': 'NESA',
  'হোসাইন': 'HOSSAIN',
  'ইউসুফ': 'YUSUF',
  'ইউনুস': 'YUNUS',
  'স্বপন': 'SWAPAN',
  'উজ্জ্বল': 'UJJWAL',
  'উজ্জ্বলা': 'UJJWALA',
  'তানভীর': 'TANVIR',
  'পারভেজ': 'PARVEZ',
  'শাহনোয়াজ': 'SHAHNAWAZ',
  'আজিজ': 'AZIZ',
  'আজম': 'AZAM',
  'রেজা': 'REZA',
  'রেজাউল': 'REZAUL',
  'নজরুল': 'NAZRUL',
  'ফজল': 'FAZL',
  'নাজমুল': 'NAZMUL',
  'ওয়াজেদ': 'WAZED',
  'মোয়াজ্জেম': 'MOAZZEM',
  'বিজয়া': 'BIJOYA',
  'বিজয়': 'BIJOY',
  'অজয়': 'AJOY',
  'জয়': 'JOY',
  'সুজয়': 'SUJOY',
  'জয়নাল': 'JOYNAL',
  'শাহনাওয়াজ': 'SHAHNAWAZ',
  // ছ as S (the user's own drafts spell it so), জ as Z, the
  // OY names no rule can spell, and the surnames.
  'মুরছালিন': 'MURSALIN',
  'মুছা': 'MUSA',
  'ছালাম': 'SALAM',
  'ছাত্তার': 'SATTAR',
  'আইয়ুব': 'AYUB',
  'ইলিয়াস': 'ILIAS',
  'জিয়া': 'ZIA',
  'জিয়াউর': 'ZIAUR',
  'আজিজুল': 'AZIZUL',
  'আজাদ': 'AZAD',
  'ফজলুল': 'FAZLUL',
  'সাজ্জাদ': 'SAJJAD',
  'ইকবাল': 'IQBAL',
  'মিজান': 'MIZAN',
  'মিজানুর': 'MIZANUR',
  'রমজান': 'RAMZAN',
  'আলমগীর': 'ALAMGIR',
  'গাজী': 'GAZI',
  'কাজী': 'KAZI',
  'মির্জা': 'MIRZA',
  'সৈয়দ': 'SYED',
  'চৌধুরী': 'CHOWDHURY',
  'ভূঁইয়া': 'BHUIYAN',
  'শেখ': 'SHEIKH',
  'চক্রবর্তী': 'CHAKRABARTY',
  'আওয়াজ': 'AWAZ',
  'স্নেহা': 'SNEHA',
  'স্মৃতি': 'SMRITI',
  'ভয়': 'BHOY',
  'নয়ন': 'NOYON',
  'নয়না': 'NOYONA',
  'অভয়': 'ABHOY',
  'ডালিমন': 'DALIMON',
  'কুয়াশা': 'KUASHA',
  // Names that keep 'a' under the O-default (v4.9.64) — the rule
  // would give them 'o' (ALOM, SORKAR, CHONDRA), but the NID
  // spelling keeps 'a'.
  'চন্দ্র': 'CHANDRA',
  'প্রদীপ': 'PRADIP',
  'অঞ্জন': 'ANJAN',
  'জয়া': 'JAYA',
  'সরকার': 'SARKAR',
  'কাঞ্চন': 'KANCHAN',
  'অঞ্জলি': 'ANJALI',
  'আলম': 'ALAM',
  'রজব': 'RAJAB',
  'কেশব': 'KESHAB',
  'ওমর': 'OMAR',
  'নজিরুল': 'NAJIRUL',
  'তসলিমা': 'TASLIMA',
  'সঞ্জয়': 'SANJOY'
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
    // Word-initial ইউ -> YU (ইউসুফ -> YUSUF): two vowels in a row
    // would otherwise come out IU.
    if (i === 0 && ch === 'ই' && (chs[1] === 'উ' || chs[1] === 'ু')) {
      out += 'YU';
      i = 1;
      continue;
    }
    // Word-initial ইয় -> YA (ইয়াসিন -> YASIN, ইয়াসমিন ->
    // YASMIN, ইয়াকুব -> YAKUB): the য় is silent as a
    // consonant here, the ই is the Y.
    if (i === 0 && ch === 'ই' && chs[1] === 'য়') {
      out += 'Y';
      i = 1;
      continue;
    }
    if (i === 0 && ch === 'ই' && chs[1] === 'য' && chs[2] === BN_NUKTA) {
      out += 'Y';
      i = 2;
      continue;
    }
    // ও + য়া -> WA (ওয়াসিম -> WASIM, আওয়াল -> AWAL): the ও is
    // the W's vowel, not a separate O — without this, ওয়াসিম
    // comes out OWASIM.
    if (ch === 'ও' && chs[i + 1] === 'য' && chs[i + 2] === BN_NUKTA && chs[i + 3] === 'া') {
      out += 'WA';
      i = i + 3;
      continue;
    }
    if (ch === 'ও' && chs[i + 1] === '\u09DF' && chs[i + 2] === 'া') {
      out += 'WA';
      i = i + 2;
      continue;
    }
    if (BN_CONSONANT[ch]) {
      // জ্জ -> ZZ (রাজ্জাক -> RAZZAK, ইজ্জত -> IZZAT): both halves
      // of the geminate are Z. Not applied when the second জ opens
      // another conjunct (জ্জ্ব, as in উজ্জ্বল — covered by
      // BN_NAME_FIXES), where the J sound stays.
      if (ch === 'জ' && chs[i + 1] === BN_HASANTA && chs[i + 2] === 'জ' && chs[i + 3] !== BN_HASANTA) {
        const after2 = chs[i + 3];
        if (after2 && BN_KAR[after2]) { out += 'ZZ' + BN_KAR[after2]; i = i + 3; }
        else if (after2 && BN_SIGN[after2]) { out += 'ZZA' + BN_SIGN[after2]; i = i + 3; }
        else if (!after2) { out += 'ZZ'; i = i + 2; }
        else { out += 'ZZA'; i = i + 2; }
        continue;
      }
      // স/শ/জ + hasanta + ব -> SW/SHW/JW (স্বপন -> SWAPAN,
      // স্বাধীন -> SWADHIN, বিশ্বাস -> BISHWAS, ঈশ্বর -> ISHWAR,
      // অশ্বিনী -> ASHWINI, উজ্জ্বল -> UJJWAL via the জ্জ rule
      // falling through here).
      if ((ch === 'স' || ch === 'শ' || ch === 'জ') && chs[i + 1] === BN_HASANTA && chs[i + 2] === 'ব') {
        const afterB = chs[i + 3];
        const bw = BN_CONSONANT[ch] + 'W';
        if (afterB && BN_KAR[afterB]) { out += bw + BN_KAR[afterB]; i = i + 3; }
        else { out += bw + 'A'; i = i + 2; }
        continue;
      }
      // ো/ু + য় -> W (আনোয়ার -> ANOWAR, জুয়েল -> JUWEL,
      // মনোয়ারা -> MONOWARA). The য় is য + nukta in real text
      // (or the standalone U+09DF letter); the following kar
      // rides along. Scoped to after ো/ু/ও on purpose: মায়া ->
      // MAYA and আয়েশা -> AYESHA keep YA/YE. Known limit:
      // native খোয়া/ধোয়া-style words come out KHOWA/DHOWA —
      // they are not person names; কুয়াশা is covered by
      // BN_NAME_FIXES (KUASHA, not KUWASHA).
      if (prev === 'ো' || prev === 'ু' || prev === 'ও') {
        if (ch === 'য' && chs[i + 1] === BN_NUKTA && chs[i + 2] && BN_KAR[chs[i + 2]]) {
          out += 'W' + BN_KAR[chs[i + 2]];
          i = i + 2;
          continue;
        }
        if (ch === '\u09DF' && chs[i + 1] && BN_KAR[chs[i + 1]]) {
          out += 'W' + BN_KAR[chs[i + 1]];
          i = i + 1;
          continue;
        }
      }
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
      // A plain consonant in the middle of the word (next is another
      // consonant): drop the inherent 'o' only when that next
      // consonant carries a vowel sign — শারমিন -> SHARMIN, সুলতানা
      // -> SULTANA. Keep it otherwise: next consonant word-final
      // (সুজন -> SUJON), next consonant hasanta-joined (বসন্ত ->
      // BOSONTA), this consonant is the second half of a conjunct,
      // or the next consonant is য় (বিজয়া -> BIJOYA). Names that
      // keep 'a' instead (প্রদীপ, অঞ্জন, জয়া, সরকার) live in
      // BN_NAME_FIXES.
      else {
        let afterNext = chs[j + 1];
        if (afterNext === BN_NUKTA) afterNext = chs[j + 2];
        // The next consonant is য/য় (a glide, either spelling) if
        // it is য or the standalone U+09DF letter.
        const nextIsGlide = next === 'য' || next === '\u09DF';
        const drops = i > 0 && prev !== BN_HASANTA && !nextIsGlide && afterNext && BN_KAR[afterNext];
        out += base + (drops ? '' : 'O');
      }
    } else if (BN_VOWEL[ch]) {
      if (ch === 'ও' && prev && (BN_VOWEL[prev] || BN_KAR[prev])) {
        // A standalone ও after a vowel is a W glide (তাওহীদ ->
        // TAWHID, আওলাদ -> AWLAD). Before য় it is handled
        // above (ওয়াসিম -> WASIM, দেওয়ান -> DEWAN);
        // word-initially it stays O (ওমর -> OMAR, ওসমান -> OSMAN).
        out += 'W';
      } else {
        out += BN_VOWEL[ch];
      }
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
  // PMT leftover picks (v4.9.69, assets v4.9.72): the head card's picks
  // flow into form_defaults.pmt — the injector's existing override
  // path. Preserved pmt entries for questions the panel does not own
  // stay; the head's picks win for the leftover questions.
  const prevPmt = (prevDefaults.pmt && typeof prevDefaults.pmt === 'object') ? { ...prevDefaults.pmt } : {};
  Object.assign(prevPmt, pmtOverridesFromHead(data.head || {}));
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
    ...(Object.keys(prevPmt).length ? { pmt: prevPmt } : {}),
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
  // PMT score line (v4.9.69): refresh the head card's running total.
  updatePmtScoreLine();
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
  // (v4.9.84) A new photo starts a new pending extraction: the People
  // cards hide again until an extraction attempt ends. (Hand-typed
  // content keeps them visible via peopleCardsVisible.)
  state.extractionAttempted = false;
  renderPreviews(category);
  // (v4.9.81) Fill-while-extracting: as soon as the first photo lands
  // and there is no record yet, show blank household + cash-usage
  // cards so the user can fill them while the AI works (or if it
  // fails) — instead of waiting at an empty results area. The blank
  // record carries the PMT defaults + sticky home combo + area
  // presets. This is NOT newBlankForm, which would wipe the photos.
  if (!state.lastExtracted) {
    state.lastExtracted = blankFormData();
    renderExtractedCards(state.lastExtracted);
    $('autofillBtn').disabled = false;
  } else {
    // (v4.9.84) A photo on an existing record re-opens the Household
    // / 2500 gate and re-checks People visibility — without this the
    // Form Photos card would show while Household / 2500 stayed
    // hidden (or vice versa). Re-rendering only rebuilds the cards
    // from the record; hand-typed values live in the record and are
    // never overwritten.
    renderExtractedCards(state.lastExtracted);
  }
  // (v4.9.84) Re-render the Form Photos card too: the gate may have
  // opened with this photo, and it must show exactly when Household
  // / 2500 do — same timing, same conditions.
  renderPulledImages();
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
  // (v4.9.84) Removing the last photo may close the gate again:
  // Form Photos, Household / 2500 and People all re-evaluate, so
  // they hide and show together.
  if (state.lastExtracted) renderExtractedCards(state.lastExtracted);
  renderPulledImages();
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
  // Student flag (v4.9.78): it rides with the derived values, so a
  // DOB re-derivation refreshes its select in place too.
  setSel('is_currently_student', targetObj.is_currently_student);
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

// --- Text display value (v4.9.68) ---
// What a text field shows for a stored value. A value of 0 IS a
// value — String(0) is '0', not empty — so an income of 0 shows "0"
// in the card. The old `value || ''` swallowed 0, and the card showed
// the "—" placeholder with a red border even though the record held 0
// (v4.9.66 set it in the data). Undefined / null / blank still show
// empty. Used by the card inputs and by Copy.
function displayTextValue(v) {
  return v !== undefined && v !== null && String(v).trim() !== '' ? String(v) : '';
}
// --- end Text display value ---

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
      o.textContent = opt.label;
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
      o.textContent = opt.label;
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
      o.textContent = opt.label;
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
      o.textContent = opt.label;
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
  } else if (f.type === 'home_combo_select') {
    // "Home made of" (v4.9.69): one pick sets floor + wall + roof.
    // The combo's three picks ride on the head (pmt_floor/wall/roof)
    // and reach the form via form_defaults.pmt. "Other" reveals the
    // separate floor/wall/roof selects instead. A combo pick is also
    // saved as the next family's default (sticky).
    const sel = document.createElement('select');
    sel.setAttribute('data-field', 'home_combo');
    sel.style.cssText = 'padding:4px 8px; font-size:12px; font-weight:600; border:1px solid var(--border); background:var(--surface-muted); color:var(--text-main); border-radius:5px; cursor:pointer; width:100%;';
    const blank = document.createElement('option');
    blank.value = ''; blank.textContent = '—';
    sel.appendChild(blank);
    HOME_COMBOS.forEach((c, i) => {
      const o = document.createElement('option');
      o.value = String(i);
      o.textContent = c.label;
      sel.appendChild(o);
    });
    const otherOpt = document.createElement('option');
    otherOpt.value = HOME_COMBO_OTHER;
    otherOpt.textContent = 'অন্যরকম (আলাদা করে বাছুন)';
    sel.appendChild(otherOpt);
    sel.value = targetObj.home_combo !== undefined && targetObj.home_combo !== null && String(targetObj.home_combo).trim() !== '' ? String(targetObj.home_combo) : '';
    // Pulled-value warning: the draft's own floor/wall/roof, shown
    // when they differ from the picked combo — Auto-Fill never
    // overwrites a filled answer, so the draft's values stay.
    const warnEl = document.createElement('div');
    warnEl.setAttribute('data-pmt-warning', '1');
    warnEl.style.cssText = 'font-size:11px; color:var(--warning, #d97706); margin-top:4px;';
    const refreshWarning = () => {
      warnEl.textContent = homeComboWarningText(targetObj);
      warnEl.style.display = warnEl.textContent ? '' : 'none';
    };
    refreshWarning();
    sel.addEventListener('change', (e) => {
      const v = e.target.value;
      if (v === '') { targetObj.home_combo = undefined; }
      else if (v === HOME_COMBO_OTHER) { targetObj.home_combo = HOME_COMBO_OTHER; saveStickyHomeCombo(null); }
      else {
        const idx = Number(v);
        targetObj.home_combo = idx;
        const c = HOME_COMBOS[idx];
        targetObj.pmt_floor = c.floor; targetObj.pmt_wall = c.wall; targetObj.pmt_roof = c.roof;
        saveStickyHomeCombo(idx);
      }
      // Show/hide the separate floor/wall/roof rows + refresh their values.
      if (cardContainer) {
        const showFallback = v === HOME_COMBO_OTHER;
        ['pmt_floor', 'pmt_wall', 'pmt_roof'].forEach((k) => {
          const s = cardContainer.querySelector(`select[data-field="${k}"]`);
          const row = s ? s.closest('.record-row') : null;
          if (row) row.style.display = showFallback ? '' : 'none';
          if (s && showFallback) { s.value = targetObj[k] !== undefined && targetObj[k] !== null ? String(targetObj[k]) : ''; toggleWarning(s); }
        });
      }
      refreshWarning();
      toggleWarning(sel);
      if (onUpdateMeta) onUpdateMeta();
      syncJsonOutput();
      notifyChange('home_combo', v === '' ? null : v);
    });
    // The control is the select; the warning rides under it.
    const wrap = document.createElement('div');
    wrap.style.cssText = 'width:100%; min-width:0;';
    wrap.append(sel, warnEl);
    inputEl = wrap;
  } else if (f.type === 'pmt_option_select') {
    // PMT leftover pick (v4.9.69): a site-exact option list from
    // f.options. Blank = no pick (the injector then uses its default
    // or the pulled answer); a pick fills the question via
    // form_defaults.pmt (wired in recalculateHouseholdSummary).
    inputEl = document.createElement('select');
    inputEl.setAttribute('data-field', f.key);
    inputEl.style.cssText = 'padding:4px 8px; font-size:12px; font-weight:600; border:1px solid var(--border); background:var(--surface-muted); color:var(--text-main); border-radius:5px; cursor:pointer; width:100%;';
    const blank = document.createElement('option');
    blank.value = ''; blank.textContent = '—';
    inputEl.appendChild(blank);
    (f.options || []).forEach((opt) => {
      const o = document.createElement('option');
      o.value = String(opt.id);
      o.textContent = opt.label;
      inputEl.appendChild(o);
    });
    inputEl.value = targetObj[f.key] !== undefined && targetObj[f.key] !== null && String(targetObj[f.key]).trim() !== '' ? String(targetObj[f.key]) : '';
    inputEl.addEventListener('change', (e) => {
      const v = e.target.value;
      targetObj[f.key] = v === '' ? undefined : Number(v);
      // Rooms (Q500, v4.9.72): the info row shows the Bangla numeral
      // (no_of_room_name), so keep it in step with the picked option.
      if (f.key === 'no_of_room') {
        const opt = (f.options || []).find((o) => String(o.id) === v);
        targetObj.no_of_room_name = opt ? opt.label : undefined;
      }
      toggleWarning(inputEl);
      if (onUpdateMeta) onUpdateMeta();
      syncJsonOutput();
      notifyChange(f.key, v === '' ? null : Number(v));
    });
  } else if (f.type === 'pmt_assets_multi') {
    // Durable assets (Q47, v4.9.72): the site's multi-answer question
    // as a checkbox list — the site's exact names, in the site's
    // order. The preset (fan/bed/mobile/tubewell) shows checked until
    // the user changes it; every tick re-totals the PMT score (via
    // syncJsonOutput) and flows to the injector as form_defaults.pmt[47].
    inputEl = document.createElement('div');
    inputEl.setAttribute('data-field', f.key);
    inputEl.style.cssText = 'display:grid; grid-template-columns:1fr 1fr 1fr; gap:4px; width:100%;';
    const picked = Array.isArray(targetObj[f.key]) && targetObj[f.key].length
      ? targetObj[f.key].map(Number) : PMT_ASSET_DEFAULT_IDS;
    const boxes = [];
    (PMT_ASSET_OPTIONS || []).forEach((opt) => {
      const lab = document.createElement('label');
      lab.style.cssText = 'display:flex; gap:4px; align-items:center; font-size:11px; font-weight:600; color:var(--text-main); cursor:pointer; padding:3px 2px;';
      const box = document.createElement('input');
      box.type = 'checkbox';
      box.value = String(opt.id);
      box.checked = picked.includes(Number(opt.id));
      box.style.cssText = 'width:16px; height:16px; flex:0 0 auto; accent-color:#2563eb; cursor:pointer;';
      const txt = document.createElement('span');
      txt.textContent = opt.label;
      lab.appendChild(box);
      lab.appendChild(txt);
      boxes.push(box);
      inputEl.appendChild(lab);
    });
    inputEl.addEventListener('change', () => {
      const ids = boxes.filter((b) => b.checked).map((b) => Number(b.value));
      targetObj[f.key] = ids;
      if (onUpdateMeta) onUpdateMeta();
      syncJsonOutput();
      notifyChange(f.key, ids);
    });
  } else if (f.type === 'pmt_score') {
    // PMT score total (v4.9.69): the running sum of the picked
    // answers' scores. Read-only — it refreshes from
    // recalculateHouseholdSummary whenever anything changes.
    inputEl = document.createElement('div');
    inputEl.setAttribute('data-field', 'pmt_score_total');
    inputEl.style.cssText = 'padding:4px 8px; font-size:12.5px; font-weight:600; color:var(--text-main);';
    inputEl.textContent = pmtScoreLineText();
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
      o.textContent = opt.label;
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
      o.textContent = opt.label;
      inputEl.appendChild(o);
    });
    inputEl.value = targetObj.profession !== undefined && targetObj.profession !== null && String(targetObj.profession).trim() !== '' ? String(targetObj.profession) : '';
    inputEl.addEventListener('change', (e) => {
      const v = e.target.value;
      // (v4.9.75) A profession pick re-derives the head income live,
      // like the member livelihood handler (v4.9.74): only while the
      // current income is still a guess — blank, 0, or inside the OLD
      // profession's +/-7% range. A hand-typed income never moves.
      const oldProf = targetObj.profession;
      const oldMid = incomeForHeadProfession(oldProf);
      const curIncome = targetObj.estimate_annual_income;
      targetObj.profession = v === '' ? undefined : Number(v);
      if (curIncome === undefined || curIncome === null || String(curIncome).trim() === '' || Number(curIncome) === 0 || isGuessedIncome(Number(curIncome), oldMid)) {
        targetObj.estimate_annual_income = incomeGuessForHeadProfession(targetObj.profession);
        if (cardContainer) {
          const incIn = cardContainer.querySelector('input[data-field="estimate_annual_income"]');
          if (incIn) { incIn.value = displayTextValue(targetObj.estimate_annual_income); toggleWarning(incIn); }
        }
      }
      // Student flag (v4.9.78): the profession drives it — picking
      // Student (106) marks "Student? Yes", picking anything else
      // clears it. A hand-picked flag is overwritten here: the
      // profession is the source of truth for the flag.
      if (syncStudentFlag(targetObj, true, true)) {
        const stuSel = cardContainer && cardContainer.querySelector('select[data-field="is_currently_student"]');
        if (stuSel) { stuSel.value = String(targetObj.is_currently_student); toggleWarning(stuSel); }
      }
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
      o.textContent = opt.label;
      inputEl.appendChild(o);
    });
    inputEl.value = targetObj.livelihood_profession_id !== undefined && targetObj.livelihood_profession_id !== null && String(targetObj.livelihood_profession_id).trim() !== '' ? String(targetObj.livelihood_profession_id) : '';
    inputEl.addEventListener('change', (e) => {
      const v = e.target.value;
      // (v4.9.74) A profession pick re-derives the income live: the
      // income was only ever a guess from the OLD profession (or the
      // no-profession fallback), and nothing recomputed it — picking
      // a profession left it at 0 until the next Extract/Import/Pull
      // re-ran normalizeOutput (user 2026-11-22: "I selected the
      // profession but in panel it stays 0"). A hand-typed income
      // never moves: it only changes while it is still a guess —
      // blank, 0, or inside the old guess's +/-7% range (v4.9.75:
      // guesses are rolled now, so the check is range membership,
      // not equality with a fresh roll).
      const oldProf = targetObj.livelihood_profession_id;
      const oldMid = incomeGuessMidForMember(targetObj, oldProf);
      const curIncome = targetObj.estimate_annual_income;
      targetObj.livelihood_profession_id = v === '' ? undefined : Number(v);
      if (curIncome === undefined || curIncome === null || String(curIncome).trim() === '' || Number(curIncome) === 0 || isGuessedIncome(Number(curIncome), oldMid)) {
        targetObj.estimate_annual_income = incomeGuessForMember(targetObj, targetObj.livelihood_profession_id);
        if (cardContainer) {
          const incIn = cardContainer.querySelector('input[data-field="estimate_annual_income"]');
          if (incIn) { incIn.value = displayTextValue(targetObj.estimate_annual_income); toggleWarning(incIn); }
        }
      }
      // Student flag (v4.9.78): the profession drives it — picking
      // Student (220) marks "Student? Yes", picking anything else
      // clears it. A hand-picked flag is overwritten here: the
      // profession is the source of truth for the flag.
      if (syncStudentFlag(targetObj, false, true)) {
        const stuSel = cardContainer && cardContainer.querySelector('select[data-field="is_currently_student"]');
        if (stuSel) { stuSel.value = String(targetObj.is_currently_student); toggleWarning(stuSel); }
      }
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
      o.textContent = opt.label;
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
  } else if (f.type === 'account_type_select' || f.type === 'location_type_select') {
    // (v38) Two static id lists: account type (1 Bank / 2 MFS) and
    // location type (1 Pouroshava / 2 Union). Blank = leave the form
    // as-is; a pick fills back empty-only on Auto-Fill.
    const opts = f.type === 'account_type_select' ? ACCOUNT_TYPE_OPTIONS : LOCATION_TYPE_OPTIONS;
    inputEl = document.createElement('select');
    inputEl.setAttribute('data-field', f.key);
    inputEl.style.cssText = 'padding:4px 8px; font-size:12px; font-weight:600; border:1px solid var(--border); background:var(--surface-muted); color:var(--text-main); border-radius:5px; cursor:pointer; width:100%;';
    const blank = document.createElement('option');
    blank.value = ''; blank.textContent = '—';
    inputEl.appendChild(blank);
    opts.forEach((opt) => {
      const o = document.createElement('option');
      o.value = String(opt.id);
      o.textContent = opt.label;
      inputEl.appendChild(o);
    });
    inputEl.value = targetObj[f.key] !== undefined && targetObj[f.key] !== null && String(targetObj[f.key]).trim() !== '' ? String(targetObj[f.key]) : '';
    inputEl.addEventListener('change', (e) => {
      const v = e.target.value;
      targetObj[f.key] = v === '' ? undefined : Number(v);
      toggleWarning(inputEl);
      if (onUpdateMeta) onUpdateMeta();
      syncJsonOutput();
      notifyChange(f.key, v === '' ? null : Number(v));
    });
  } else if (f.type === 'info') {
    // (v38) Read-only display: a value the pull resolved from the
    // site's own lists (bank / branch / division / ... name). The
    // panel has no such list to offer a dropdown from, so the name is
    // shown, not edited — the id rides on the record for Auto-Fill.
    // A labelMap turns an id into a friendly label — an options array
    // like DISABILITY_TYPE_OPTIONS, or an id->label map like
    // LITERACY_LABELS; the field lists name it by string and it is
    // resolved through LABEL_MAPS (so the lists stay load-order safe).
    inputEl = document.createElement('div');
    inputEl.setAttribute('data-field', f.key);
    inputEl.style.cssText = 'padding:4px 8px; font-size:12.5px; font-weight:600; color:var(--text-main);';
    const v = targetObj[f.key];
    let shown = '—';
    if (v !== undefined && v !== null && String(v).trim() !== '') {
      shown = String(v);
      const map = typeof f.labelMap === 'string' ? LABEL_MAPS[f.labelMap] : f.labelMap;
      if (Array.isArray(map)) {
        const hit = map.find((o) => o && Number(o.id) === Number(v));
        if (hit) shown = hit.label;
      } else if (map && typeof map === 'object') {
        const hit = map[Number(v)] ?? map[String(v)];
        if (hit !== undefined) shown = String(hit);
      }
    }
    inputEl.textContent = shown;
  } else {
    inputEl = document.createElement('input');
    inputEl.type = 'text';
    inputEl.setAttribute('data-field', f.key);
    inputEl.value = displayTextValue(targetObj[f.key]);
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
        // Education popup (v4.9.56): the popup used to run only on
        // Auto-Fill, so a hand-typed DOB never asked — a 27.5+
        // person's education just stayed blank. Ask here, on the
        // card only (the edit modal has no .record-card ancestor,
        // so a DOB typed there never pops this modal).
        if (cardContainer && cardContainer.closest && cardContainer.closest('.record-card')) maybeAskEducationAfterDob();
      }
      // Script-sensitive fields: the stored value is stripped as you
      // type, but the field itself keeps showing what was typed (so
      // Bangla conjunct typing is never disturbed mid-word). On blur,
      // show the stored value, so the field matches what will fill.
      if (f.key === 'nid' || f.key === 'nid_or_brn' || f.key.endsWith('_bn') || f.key.endsWith('_en')) {
        inputEl.value = displayTextValue(targetObj[f.key]);
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
  // (v4.9.82) A photo captured in the panel can be re-cropped here —
  // a pulled photo cannot (it lives on the form, not in the panel).
  if (cropBtn) {
    cropBtn.style.display = item.captured ? '' : 'none';
    if (item.captured) cropBtn.onclick = () => openCropForImage(item);
  }
  const restoreBtn = modal.querySelector('#fcRestoreOrigBtn');
  if (restoreBtn) restoreBtn.style.display = 'none';
  viewerZoom = 1;
  $('fcViewerImg').src = item.dataUrl;
  $('fcViewerImg').style.transform = 'scale(1)';
  $('fcZoomResetBtn').textContent = '100%';
  $('fcViewerTitle').textContent = item.name || 'Draft photo';
  const metaBox = $('fcViewerMeta');
  metaBox.innerHTML = item.captured
    ? '<div style="color:#a1a1aa; text-align:center; padding:10px;">Captured in the panel — Auto-Fill will upload this to the form.</div>'
    : '<div style="color:#a1a1aa; text-align:center; padding:10px;">Pulled from the form — this is the photo the site has on file.</div>';
  modal.style.display = 'flex';
}

// (v4.9.83) Gate for the Form Photos, Household and cash-usage
// cards: they stay hidden while the form is still blank — no
// extraction has landed, no pull/import has brought a real record,
// and no photo exists anywhere. The first photo (normally the NID
// photo for extraction) opens the gate, as does any landed record: a
// blank form (blankFormData — empty names/NID/DOB, no members, no
// pulled detail) keeps them hidden. This reads the record's content,
// so hand-typed names or an imported family also open it — that is
// the escape hatch for a photo-less manual form, which would
// otherwise never reach the Household fields at all.
function formCardsGateOpen(data) {
  // (v4.9.85) A manual New Form shows all four cards from the start
  // (Photo, Members, Household, 2500) — the user types everything by
  // hand there, so the gate never hides them for it.
  if (state.manualNewForm) return true;
  const anyPhoto = (state.head || []).length + (state.other || []).length + (state.pulledImages || []).length > 0;
  if (anyPhoto) return true;
  if (!data) return false;
  const head = data.head || {};
  if (String(head.name_bn || '').trim() || String(head.name_en || '').trim()
      || String(head.nid || '').trim() || String(head.nid_or_brn || '').trim()
      || String(head.dob || '').trim()) return true;
  if (Array.isArray(data.family_members) && data.family_members.length > 0) return true;
  if (Array.isArray(data.pmt_answers) && data.pmt_answers.length > 0) return true;
  if (Array.isArray(data.program_fields) && data.program_fields.length > 0) return true;
  if (Array.isArray(data.cash_usages) && data.cash_usages.length > 0) return true;
  if (data.full_form_dump) return true;
  return false;
}

// (v4.9.84) People visibility: after an NID photo lands but before
// any extraction result, the head/member cards are blank defaults with
// no data — the user does not want to see them. They stay hidden
// until an extraction attempt ends (success or failure), the record
// carries real content, or there are no NID photos at all (a manual
// New Form, where the user types names by hand). Form photos
// (pulledImages) do not trigger the hide — only NID photos do.
function peopleCardsVisible(data) {
  if ((state.head || []).length + (state.other || []).length === 0) return true;
  if (state.extractionAttempted) return true;
  const head = (data && data.head) || {};
  if (String(head.name_bn || '').trim() || String(head.name_en || '').trim()
      || String(head.nid || '').trim() || String(head.nid_or_brn || '').trim()
      || String(head.dob || '').trim()) return true;
  if (Array.isArray(data && data.family_members) && data.family_members.length > 0) return true;
  return false;
}

function renderPulledImages() {
  const card = $('pulledCard');
  const badge = $('pulledCount');
  if (!card) return;
  // (v4.9.83) Gate: hidden while the form is still blank — no
  // extraction landed and no photo exists anywhere. The badge is
  // still zeroed so a stale set never lingers behind it.
  if (!formCardsGateOpen(state.lastExtracted)) {
    card.style.display = 'none';
    if (badge) badge.textContent = '0 photo(s)';
    return;
  }
  const list = state.pulledImages || [];
  // (v4.9.83) The card collapses to its header when it holds no
  // photos: the empty rows took three rows of screen on every blank
  // form. The header stays visible (badge + Reset + chevron) and
  // tapping it expands the empty rows, so Camera/Upload stay one tap
  // away. With a photo the card always shows expanded; removing the
  // last photo collapses it again.
  card.style.display = '';
  if (list.length > 0) state.pulledCardExpanded = false;
  const collapsed = list.length === 0 && !state.pulledCardExpanded;
  if (collapsed) card.classList.add('collapsed'); else card.classList.remove('collapsed');
  const chev = $('pulledChevron');
  if (chev) chev.textContent = collapsed ? '▸' : '▾';
  if (badge) badge.textContent = `${list.length} photo(s)`;
  // (v4.9.93) The duplicate thumbnail grid below the rows is gone:
  // every photo showed twice in this card — once in its slot row and
  // once in the grid — both from the same list. The slot rows are now
  // the single display for the three photos (tap a row thumbnail to
  // view, as before).
  if (typeof renderFormPhotoSlots === 'function') renderFormPhotoSlots();
}

// (v4.9.83) Tap the Form Photos header to expand/collapse the empty
// card. With a photo the card always shows expanded, so this is a
// no-op then — the header tap only matters when the card is empty.
function togglePulledCard() {
  if ((state.pulledImages || []).length > 0) return;
  state.pulledCardExpanded = !state.pulledCardExpanded;
  renderPulledImages();
}

// --- Form photos: capture the applicant photo, signature and house
// photo in the panel (v4.9.82) ---
// The form needs three photos the AI never sees: the applicant's
// portrait, her signature, and the house. Before this they could only
// arrive via Pull Draft — there was no way to take or upload them in
// the panel. Each slot takes the in-panel camera or a file upload,
// goes through the crop editor, and lands in state.pulledImages, so
// Auto-Fill uploads it with the pulled photos (uploadPulledPhotos).
// Captures NEVER enter state.head/state.other, so the AI never tries
// to read an ID card from a house photo. Family Card (programme 24)
// disables the nominee section, so there are no nominee slots here.
// Size limits are the site's own, verified in app.ea9222ad:
// previewImage/previewSign reject a file over 200 KB (204800) and
// previewHouseImage over 512 KB (524288); applyWebcamCapture enforces
// 204800 the same way. A capture is compressed to fit before it is
// stored, so the upload cannot be rejected for size.
const PHOTO_SLOTS = [
  { slot: 'image', name: 'Applicant photo', maxBytes: 204800 },
  { slot: 'signature', name: 'Signature', maxBytes: 204800 },
  { slot: 'house_image', name: 'House photo', maxBytes: 524288 }
];
function photoSlotDef(slot) {
  return PHOTO_SLOTS.find((s) => s.slot === slot) || null;
}
function photoSlotMaxBytes(slot) {
  const d = photoSlotDef(slot);
  return d ? d.maxBytes : 204800;
}
// Byte length of a base64 string — the site's own Tt() math.
function base64ByteLength(b64) {
  if (!b64 || typeof b64 !== 'string') return 0;
  const a = b64.indexOf(',') >= 0 ? b64.slice(b64.indexOf(',') + 1) : b64;
  const pad = (a.match(/=+$/) || [''])[0].length;
  return Math.max(0, Math.floor(3 * a.length / 4) - pad);
}
// Shrink a base64 JPEG until it fits maxBytes — the site's own Ft()
// approach: JPEG quality 0.85 down to 0.35 in 0.07 steps, then shrink
// dimensions by 0.85 (up to 4 rounds, quality steps again each round).
// A photo that already fits is returned untouched.
function compressBase64ToLimit(b64, maxBytes) {
  return new Promise((resolve) => {
    if (!b64 || base64ByteLength(b64) <= maxBytes) { resolve(b64); return; }
    const img = new Image();
    img.onload = () => {
      let w = img.width, h = img.height;
      const draw = (ww, hh, q) => {
        const cv = document.createElement('canvas');
        cv.width = Math.max(1, Math.round(ww));
        cv.height = Math.max(1, Math.round(hh));
        cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
        return cv.toDataURL('image/jpeg', q).split(',')[1] || b64;
      };
      let q = 0.85;
      let out = draw(w, h, q);
      const qualityPass = () => {
        while (base64ByteLength(out) > maxBytes && q > 0.35) {
          q = Math.round(100 * (q - 0.07)) / 100;
          out = draw(w, h, q);
        }
      };
      qualityPass();
      let rounds = 0;
      while (base64ByteLength(out) > maxBytes && rounds < 4) {
        w = Math.max(90, Math.round(0.85 * w));
        h = Math.max(100, Math.round(0.85 * h));
        q = 0.85;
        out = draw(w, h, q);
        qualityPass();
        rounds++;
      }
      resolve(out);
    };
    img.onerror = () => resolve(b64);
    img.src = `data:image/jpeg;base64,${b64}`;
  });
}
// Store a captured/uploaded form photo into state.pulledImages.
// Replaces any entry already in the slot — and marks it replace: true
// for any deliberate camera/upload store, so Auto-Fill uploads it over
// the photo already on the form instead of skipping the slot (the
// injector's empty-only guard). A pulled photo keeps replace unset:
// it IS the form's own photo, so skipping an occupied slot is correct
// for it. A capture never touches state.head/state.other.
function setPulledPhoto(slot, b64, source) {
  const def = photoSlotDef(slot);
  if (!def || !b64) return null;
  const list = state.pulledImages || (state.pulledImages = []);
  const existing = list.find((im) => im && im.slot === slot);
  const entry = {
    slot,
    name: def.name,
    dataUrl: 'data:image/jpeg;base64,' + b64,
    captured: true,
    source: source || 'camera',
    replace: source === 'camera' || source === 'upload' || !!existing
  };
  if (existing) list[list.indexOf(existing)] = entry;
  else list.push(entry);
  renderPulledImages();
  saveSessionState();
  return entry;
}
// Remove one form photo from the panel (the photo stays on the form
// itself — with no panel entry for the slot, Auto-Fill leaves the
// form's photo alone).
function removePulledPhoto(slot) {
  if (!slot) return;
  state.pulledImages = (state.pulledImages || []).filter((im) => im && im.slot !== slot);
  renderPulledImages();
  saveSessionState();
}

// The three capture rows in the Form Photos card: a thumbnail of the
// photo in the slot (or "No photo yet"), Camera + Upload buttons, and
// Remove when a photo is there. A row that replaces a pulled photo
// says so — Auto-Fill will upload the new photo over the old one.
function renderFormPhotoSlots() {
  const wrap = $('formPhotoSlots');
  if (!wrap) return;
  wrap.replaceChildren();
  PHOTO_SLOTS.forEach((def) => {
    const entry = (state.pulledImages || []).find((im) => im && im.slot === def.slot);
    const row = document.createElement('div');
    row.className = 'form-photo-row';
    row.style.cssText = 'display:flex; align-items:center; gap:10px; padding:8px 4px; border-bottom:1px solid var(--border);';
    const thumb = document.createElement('div');
    thumb.style.cssText = 'flex:0 0 auto; width:64px; height:64px; border-radius:8px; overflow:hidden; background:var(--surface-muted); border:1px solid var(--border); display:flex; align-items:center; justify-content:center;';
    if (entry) {
      const img = document.createElement('img');
      img.src = entry.dataUrl;
      img.alt = def.name;
      img.style.cssText = 'display:block; width:100%; height:100%; object-fit:cover; cursor:pointer;';
      img.addEventListener('click', () => showPulledPhoto(entry));
      thumb.appendChild(img);
    } else {
      const ph = document.createElement('span');
      ph.style.cssText = 'font-size:11px; color:var(--text-sub); text-align:center; padding:4px;';
      ph.textContent = 'No photo yet';
      thumb.appendChild(ph);
    }
    row.appendChild(thumb);
    const mid = document.createElement('div');
    mid.style.cssText = 'flex:1 1 auto; min-width:0;';
    const name = document.createElement('div');
    name.style.cssText = 'font-size:13px; font-weight:700;';
    name.textContent = def.name;
    mid.appendChild(name);
    const hint = document.createElement('div');
    hint.style.cssText = 'font-size:11px; color:var(--text-sub);';
    hint.textContent = entry && entry.replace
      ? 'Replaces the pulled photo on Auto-Fill'
      : `Max ${Math.round(def.maxBytes / 1024)} KB — Auto-Fill uploads it to the form`;
    mid.appendChild(hint);
    row.appendChild(mid);
    const camBtn = document.createElement('button');
    camBtn.type = 'button';
    camBtn.className = 'btn btn-xs';
    camBtn.style.cssText = 'background:#059669; color:#fff; border-color:#059669;';
    camBtn.textContent = '📷 Camera';
    camBtn.addEventListener('click', () => openPhotoSlotCamera(def.slot));
    row.appendChild(camBtn);
    const upBtn = document.createElement('button');
    upBtn.type = 'button';
    upBtn.className = 'btn btn-xs';
    upBtn.textContent = '📁 Upload';
    upBtn.addEventListener('click', () => openPhotoSlotUpload(def.slot));
    row.appendChild(upBtn);
    if (entry) {
      const rmBtn = document.createElement('button');
      rmBtn.type = 'button';
      rmBtn.className = 'btn btn-xs';
      rmBtn.textContent = '✕';
      rmBtn.title = 'Remove this photo from the panel';
      rmBtn.addEventListener('click', () => removePulledPhoto(def.slot));
      row.appendChild(rmBtn);
    }
    wrap.appendChild(row);
  });
}

// The slot the in-panel camera is shooting for (null = an NID/BRN
// list, 'head'/'other'), and the slot a file upload is for.
let panelCameraPhotoSlot = null;
let photoSlotUploadTarget = null;
// The crop editor destination for a fresh form-photo capture, with
// its source ('camera' | 'upload') for the Retake label.
let activePhotoSlot = null;
let activePhotoSource = null;

// Open the in-panel camera for one form-photo slot. Falls back to
// the slot's file picker when the camera is blocked or missing.
async function openPhotoSlotCamera(slot) {
  if (!photoSlotDef(slot)) return;
  panelCameraPhotoSlot = slot;
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    panelCameraPhotoSlot = null;
    openPhotoSlotUpload(slot);
    return;
  }
  try {
    panelCameraDeviceId = null;
    await startPanelCamera();
    setPanelWide(true);
  } catch (_) {
    panelCameraPhotoSlot = null;
    stopPanelCamera();
    setStatus('Camera is blocked here — opening the phone camera instead.', 'err');
    openPhotoSlotUpload(slot);
  }
}

// Open the file picker for one form-photo slot.
function openPhotoSlotUpload(slot) {
  if (!photoSlotDef(slot)) return;
  photoSlotUploadTarget = slot;
  const input = $('photoSlotUpload');
  if (!input) return;
  input.value = '';
  input.click();
}

// Open the crop editor on a fresh form-photo capture (camera shot or
// uploaded file). Never auto-scans: a portrait/signature/house photo
// is not a document. Apply Crop stores it via setPulledPhoto.
function openCropForPhotoSlot(slot, b64, name, source) {
  if (!photoSlotDef(slot) || !b64) return;
  activePhotoSlot = slot;
  activePhotoSource = source || 'camera';
  activeCategory = null;
  activeCropItem = null;
  activeCropName = name || (photoSlotDef(slot).name + '.jpg');
  const titleEl = $('cropModalTitle');
  if (titleEl) titleEl.textContent = 'Crop, Rotate & Zoom Photo';
  updateSlotCropControls();
  rawImage = new Image();
  rawImage.onload = () => {
    // (v4.9.86) A slot crop uses the slot's own frame — never the
    // orientation pick, so the photo fills the frame edge to edge.
    pickSlotCropRatio(slot);
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
    setRetakeLabel(source === 'camera');
  };
  rawImage.onerror = () => {
    $('cropModal').classList.remove('open');
    activePhotoSlot = null;
    activePhotoSource = null;
    setStatus('Could not load this photo for cropping.', 'err');
  };
  $('cropModal').classList.add('open');
  rawImage.src = 'data:image/jpeg;base64,' + b64;
}

// (v38) Reset the Draft Photos (from website): the pulled photos
// persist in the session, so a stale set from another draft/family
// stays until a new pull replaces it — and an import merges more in.
// Reset clears just this section (the record and the upload lists
// are untouched) and saves the empty state, so a reload does not
// bring the stale photos back. A re-pull re-fills it.
function resetPulledImages() {
  state.pulledImages = [];
  renderPulledImages();
  saveSessionState();
}

// (v40) The RED Reset: clears EVERYTHING — the upload lists, the
// record, AND the pulled draft photos. Before v40 it left
// state.pulledImages alone, so the Draft Photos (from website)
// stayed on screen after a Reset and the user had to use the small
// section Reset (or New Form) to get rid of them. The session is
// wiped too (sessionData: null), so a reload does not bring any of
// it back. Saved Area settings are untouched. Top-level (not inside
// initApp) so the reset test can extract it.
function clearAll() {
  state.head = [];
  state.other = [];
  state.pulledImages = [];
  state.extractionAttempted = false;
  state.manualNewForm = false;
  state.lastExtracted = null;
  window.parent.postMessage({ action: 'FC_SAVE_SESSION', sessionData: null }, '*');
  renderPreviews('head');
  renderPreviews('other');
  renderPulledImages();
  $('resultsWrap').classList.remove('visible');
  $('autofillBtn').disabled = true;
  setStatus('All cleared — uploads, record and draft photos (Saved Area settings kept for next family).', 'idle');
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
  burstRunId++; // cancel a burst in progress (e.g. Cancel mid-burst)
  hideBurstPicker();
  stopPanelCameraTracks();
  // (v4.9.85) Clear the slot target on every camera close: Cancel
  // used to leave it set, so the next NID camera would draw a slot
  // frame and route its shot to the crop editor as a form photo.
  panelCameraPhotoSlot = null;
  updateFrameButton();
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
// (v4.9.92) For the NID/BRN camera Capture still crops to exactly
// this rect. For a form-photo slot camera the frame is an aiming
// guide only — Capture saves the full video frame (see
// grabCameraFrame) and the user positions the photo in the slot
// frame in the crop editor afterwards.
// (v4.9.85) A form-photo slot camera frames to the website's per-slot
// guide shape instead — applicant photo portrait, signature a wide
// strip, house photo 3:2, like the site's own camera.
function cameraFrameRect() {
  const video = $('cameraVideo');
  const sw = video ? video.clientWidth : 0;
  const sh = video ? video.clientHeight : 0;
  if (!sw || !sh) return null;
  if (panelCameraPhotoSlot) {
    const fr = slotFrameRect(sw, sh, panelCameraPhotoSlot);
    if (fr) return fr;
  }
  return fitFrameRect(sw, sh, cameraFramePortrait);
}

function frameHintText() {
  // (v4.9.85) A form-photo slot camera frames to the website's
  // per-slot guide shape — (v4.9.92) the frame is a guide only: the
  // whole photo is saved, and the user positions it in the slot
  // frame in the crop editor afterwards.
  if (panelCameraPhotoSlot) {
    const def = photoSlotDef(panelCameraPhotoSlot);
    return (def ? def.name : 'Photo') + ' — the dashed frame shows the photo shape; the whole photo is saved, crop it in the editor.';
  }
  return cameraFramePortrait ? 'Portrait frame — the white frame is the photo.' : 'Perspective is off — the white frame is the photo.';
}

function updateFrameButton() {
  const btn = $('frameRotateBtn');
  if (!btn) return;
  // (v4.9.85) A form-photo slot camera has a fixed per-slot frame —
  // the 4:3/3:4 toggle would do nothing, so it hides while a slot
  // camera is open.
  btn.style.display = panelCameraPhotoSlot ? 'none' : '';
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
  // (v4.9.85) A form-photo slot camera draws the website's guide
  // frame instead of the generic one: a dashed white border with the
  // area outside dimmed, and no centre cross — the site's frame is
  // clean. (v4.9.92) The frame is a guide only; Capture saves the
  // full video frame, not this rect (see grabCameraFrame).
  if (panelCameraPhotoSlot) {
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillRect(0, 0, sw, sh);
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(fr.x, fr.y, fr.w, fr.h, 16); else ctx.rect(fr.x, fr.y, fr.w, fr.h);
    ctx.fill();
    ctx.restore();
    ctx.setLineDash([8, 6]);
    ctx.strokeStyle = 'rgba(255,255,255,0.55)';
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(fr.x, fr.y, fr.w, fr.h, 16); else ctx.rect(fr.x, fr.y, fr.w, fr.h);
    ctx.stroke();
    ctx.setLineDash([]);
    return;
  }
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
  // (v4.9.85) A form-photo slot camera never runs document detection
  // — a face, signature or house is not a document, and the website
  // has no equivalent. Just draw the slot guide frame.
  if (panelCameraPhotoSlot) { drawCameraFrame(); setCameraHint(frameHintText(), ''); return; }
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
  // (v4.9.85) A slot camera hides the 4:3/3:4 toggle (fixed frame);
  // an NID camera shows it again.
  updateFrameButton();
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

// --- Burst sharpness (v4.9.67) ---
const BURST_SHOTS = 3; // v4.9.76: was 5 — three shots are enough to pick from, and faster on a slow tablet.
const BURST_GAP_MS = 120;
// Laplacian variance: how sharp is this photo? Pure — takes an
// ImageData-like {width, height, data} (RGBA) and returns a number;
// higher = sharper. Only used to RANK the burst shots (the sharpest
// gets a star), never to reject one — the user picks.
function laplacianSharpness(img) {
  const w = img && img.width, h = img && img.height, d = img && img.data;
  if (!w || !h || !d || d.length < w * h * 4) return 0;
  const g = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) {
    const o = i * 4;
    g[i] = 0.299 * d[o] + 0.587 * d[o + 1] + 0.114 * d[o + 2];
  }
  let n = 0, sum = 0, sumSq = 0;
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      const l = g[i - w] + g[i - 1] - 4 * g[i] + g[i + 1] + g[i + w];
      sum += l; sumSq += l * l; n++;
    }
  }
  if (!n) return 0;
  const mean = sum / n;
  return Math.max(0, sumSq / n - mean * mean);
}
// Index of the sharpest shot in [{sharp}], or -1 when there is none.
function sharpestShotIndex(shots) {
  let best = -1, bestSharp = -Infinity;
  for (let i = 0; i < (shots || []).length; i++) {
    const s = shots[i] && shots[i].sharp;
    if (typeof s === 'number' && s > bestSharp) { bestSharp = s; best = i; }
  }
  return best;
}
// --- end Burst sharpness ---

// Sharpness of a captured canvas: downscale to ~160px wide first so
// the score stays cheap on a tablet, then the Laplacian variance.
function scoreCanvas(canvas) {
  try {
    const w = 160;
    const h = Math.max(1, Math.round(canvas.height * w / Math.max(1, canvas.width)));
    const small = document.createElement('canvas');
    small.width = w; small.height = h;
    small.getContext('2d').drawImage(canvas, 0, 0, w, h);
    return laplacianSharpness(small.getContext('2d').getImageData(0, 0, w, h));
  } catch (_) { return 0; }
}

// Burst state (v4.9.67): one Capture tap takes BURST_SHOTS shots and
// the picker lets the user choose one. burstRunId cancels a burst in
// progress (Cancel mid-burst bumps it via stopPanelCamera).
let burstRunId = 0;
let burstShots = [];
let burstSelected = 0;

// One frame from the live video, exactly as Capture used to take it:
// straightened when the green lock is fresh, else the white frame's
// crop. (v4.9.92) A form-photo slot capture saves the FULL video
// frame instead — full native resolution, JPEG 0.92, like the
// website's snap(). The dashed guide frame is an aiming aid only;
// the crop editor opens after and the user positions the photo in
// the slot frame himself. Returns { b64, sharp } — sharp is the
// Laplacian score of the shot (0 when it could not be scored).
function grabCameraFrame() {
  const video = $('cameraVideo');
  if (!video || !video.videoWidth) return { b64: '', sharp: 0 };
  const maxDim = 1500;
  const cv = document.createElement('canvas');
  // If the live edge view found the document, straighten the shot now —
  // the crop editor then opens on an already-straight photo.
  let b64 = '';
  let shotCanvas = null;
  // (v4.9.92) A form-photo slot saves the full frame — never the
  // guide frame's crop and never a warp. The user tested live v4.9.90
  // and the camera was still cropping: Capture saved only what was
  // inside the frame (v4.9.85), while the website captures the whole
  // photo. The frame stays on screen as a guide only.
  if (panelCameraPhotoSlot) {
    cv.width = video.videoWidth;
    cv.height = video.videoHeight;
    cv.getContext('2d').drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
    b64 = cv.toDataURL('image/jpeg', 0.92).split(',')[1] || '';
    if (b64) shotCanvas = cv;
  }
  // (v4.9.85, kept) Never warp a form-photo slot shot: the green
  // lock is a document straightener, and a face/signature/house is
  // not a document. A slot capture already saved the full frame
  // above (v4.9.92), so the quad is null here in any case; the guard
  // keeps the slot path independent of the detector.
  const quad = panelCameraPhotoSlot ? null
    : (panelCameraQuad && (Date.now() - panelCameraQuad.at < 1500) ? panelCameraQuad.points : null);
  if (quad) {
    const scale = Math.min(1, maxDim / Math.max(video.videoWidth, video.videoHeight));
    cv.width = Math.max(1, Math.round(video.videoWidth * scale));
    cv.height = Math.max(1, Math.round(video.videoHeight * scale));
    cv.getContext('2d').drawImage(video, 0, 0, cv.width, cv.height);
    try {
      const qscale = cv.width / video.videoWidth;
      const warped = warpQuadImage(cv, quad.map((p) => ({ x: p.x * qscale, y: p.y * qscale })));
      b64 = warped.toDataURL('image/jpeg', 0.82).split(',')[1] || '';
      if (b64) shotCanvas = warped;
    } catch (_) { b64 = ''; }
  }
  if (!b64) {
    // No green lock (NID/BRN only — a slot capture already saved the
    // full frame above, v4.9.92): save exactly what the white frame
    // showed — the frame's crop of the video (4:3 landscape, or 3:4
    // portrait) — so the photo has less background outside the card
    // instead of the full wide video frame.
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
    if (b64) shotCanvas = cv;
  }
  if (!b64) return { b64: '', sharp: 0 };
  return { b64, sharp: shotCanvas ? scoreCanvas(shotCanvas) : 0 };
}

// Burst (v4.9.67): one Capture tap takes BURST_SHOTS shots, then the
// picker lets the user choose one — the sharpest is starred, but the
// user decides. The camera keeps running until a shot is used.
// Burst off (v4.9.76): one tap takes a single photo straight into
// the crop editor instead — no picker, no extra shots.
async function capturePanelPhoto() {
  const video = $('cameraVideo');
  if (!video || !video.videoWidth) {
    setStatus('Camera is not ready yet — wait a second and try again.', 'err');
    return;
  }
  if (!burstEnabled) {
    const shot = grabCameraFrame();
    if (!shot.b64) {
      setStatus('Could not capture this photo — try again.', 'err');
      setCameraHint(frameHintText(), '');
      return;
    }
    useCameraShot(shot.b64);
    return;
  }
  const runId = ++burstRunId;
  const capBtn = $('capturePhotoBtn');
  if (capBtn) { capBtn.disabled = true; capBtn.style.opacity = '0.5'; }
  burstShots = [];
  burstSelected = 0;
  for (let i = 0; i < BURST_SHOTS; i++) {
    if (runId !== burstRunId) return; // cancelled mid-burst
    setCameraHint('Shooting… ' + (i + 1) + ' of ' + BURST_SHOTS, '');
    const shot = grabCameraFrame();
    if (shot.b64) burstShots.push(shot);
    if (i < BURST_SHOTS - 1) await new Promise((r) => setTimeout(r, BURST_GAP_MS));
  }
  if (runId !== burstRunId) return;
  if (capBtn) { capBtn.disabled = false; capBtn.style.opacity = ''; }
  if (!burstShots.length) {
    setStatus('Could not capture this photo — try again.', 'err');
    setCameraHint(frameHintText(), '');
    return;
  }
  burstSelected = sharpestShotIndex(burstShots);
  if (burstSelected < 0) burstSelected = 0;
  showBurstPicker();
}

// The burst picker: thumbnails of the shots — tap one and it opens big
// in the burst preview (v4.9.71) so framing and glare can actually be
// judged, which the 72px thumbnails never allowed. "Use this shot"
// sends it to the crop editor, "Retake" shoots another burst. Built
// in JS (no sidepanel.html change).
function showBurstPicker() {
  const pv = $('burstPreview');
  if (pv) pv.style.display = 'none';
  let picker = $('burstPicker');
  if (!picker) {
    picker = document.createElement('div');
    picker.id = 'burstPicker';
    picker.style.cssText = 'padding:10px 4px 0;';
    const card = $('cameraModal') && $('cameraModal').querySelector('.dialog-card');
    const actions = $('cameraModal') && $('cameraModal').querySelector('.dialog-actions');
    if (card && actions) card.insertBefore(picker, actions);
    else if (card) card.appendChild(picker);
  }
  const sharpest = sharpestShotIndex(burstShots);
  picker.innerHTML = '';
  const label = document.createElement('div');
  label.textContent = 'Tap a shot to see it big — ★ is the sharpest:';
  label.style.cssText = 'font-size:13px; font-weight:700; margin-bottom:8px;';
  picker.appendChild(label);
  const row = document.createElement('div');
  row.style.cssText = 'display:flex; gap:8px; overflow-x:auto; padding-bottom:4px;';
  burstShots.forEach((shot, i) => {
    const wrap = document.createElement('div');
    wrap.style.cssText = 'position:relative; flex:0 0 auto; cursor:pointer;';
    const img = document.createElement('img');
    img.src = 'data:image/jpeg;base64,' + shot.b64;
    img.alt = 'Shot ' + (i + 1);
    img.style.cssText = 'display:block; width:72px; height:96px; object-fit:cover; border-radius:8px; border:3px solid ' + (i === burstSelected ? '#2563eb' : '#cbd5e1') + ';';
    wrap.appendChild(img);
    if (i === sharpest) {
      const star = document.createElement('span');
      star.textContent = '★ Sharpest';
      star.style.cssText = 'position:absolute; left:2px; top:2px; background:rgba(22,163,74,.92); color:#fff; font-size:10px; font-weight:700; padding:2px 5px; border-radius:999px;';
      wrap.appendChild(star);
    }
    const zoom = document.createElement('span');
    zoom.textContent = '🔍';
    zoom.style.cssText = 'position:absolute; right:2px; bottom:2px; background:rgba(15,23,42,.75); color:#fff; font-size:10px; padding:2px 5px; border-radius:999px;';
    wrap.appendChild(zoom);
    wrap.addEventListener('click', () => { burstSelected = i; showBurstPreview(i); });
    row.appendChild(wrap);
  });
  picker.appendChild(row);
  const btnRow = document.createElement('div');
  btnRow.style.cssText = 'display:flex; gap:8px; margin-top:8px;';
  const useBtn = document.createElement('button');
  useBtn.type = 'button';
  useBtn.className = 'btn';
  useBtn.textContent = 'Use this shot';
  useBtn.style.cssText = 'flex:1; background:#2563eb; color:#fff;';
  useBtn.addEventListener('click', useBurstShot);
  btnRow.appendChild(useBtn);
  const retakeBtn = document.createElement('button');
  retakeBtn.type = 'button';
  retakeBtn.className = 'btn';
  retakeBtn.textContent = 'Retake';
  retakeBtn.style.cssText = 'flex:1; background:#475569; color:#fff;';
  retakeBtn.addEventListener('click', () => { hideBurstPicker(); capturePanelPhoto(); });
  btnRow.appendChild(retakeBtn);
  picker.appendChild(btnRow);
  picker.style.display = 'block';
  setCameraHint('Pick the sharpest shot below.', '');
  // Hide Capture while picking, so a second burst cannot start.
  const capBtn = $('capturePhotoBtn');
  if (capBtn) capBtn.style.display = 'none';
}

function hideBurstPicker() {
  const picker = $('burstPicker');
  if (picker) picker.style.display = 'none';
  const pv = $('burstPreview');
  if (pv) pv.style.display = 'none';
  const capBtn = $('capturePhotoBtn');
  if (capBtn) { capBtn.style.display = ''; capBtn.disabled = false; capBtn.style.opacity = ''; }
  setCameraHint(frameHintText(), '');
}

// The burst preview (v4.9.71): tap a thumbnail and the shot opens big
// enough to judge — framing, glare, whether it is the right page —
// which the 72px thumbnails never allowed. "Use this shot" sends the
// previewed shot to the crop editor; "← All shots" goes back to the
// thumbnails with this shot selected. Built in JS (no sidepanel.html change).
function showBurstPreview(i) {
  burstSelected = i;
  const shot = burstShots[i];
  if (!shot || !shot.b64) return;
  const picker = $('burstPicker');
  if (picker) picker.style.display = 'none';
  let pv = $('burstPreview');
  if (!pv) {
    pv = document.createElement('div');
    pv.id = 'burstPreview';
    pv.style.cssText = 'padding:10px 4px 0;';
    const card = $('cameraModal') && $('cameraModal').querySelector('.dialog-card');
    const actions = $('cameraModal') && $('cameraModal').querySelector('.dialog-actions');
    if (card && actions) card.insertBefore(pv, actions);
    else if (card) card.appendChild(pv);
  }
  const sharpest = sharpestShotIndex(burstShots);
  pv.innerHTML = '';
  const caption = document.createElement('div');
  caption.textContent = 'Shot ' + (i + 1) + ' of ' + burstShots.length + (i === sharpest ? ' — ★ Sharpest' : '');
  caption.style.cssText = 'font-size:13px; font-weight:700; margin-bottom:8px;';
  pv.appendChild(caption);
  const img = document.createElement('img');
  img.src = 'data:image/jpeg;base64,' + shot.b64;
  img.alt = 'Shot ' + (i + 1) + ' full size';
  img.style.cssText = 'display:block; width:100%; max-height:60vh; object-fit:contain; border-radius:8px; background:#0f172a;';
  pv.appendChild(img);
  const btnRow = document.createElement('div');
  btnRow.style.cssText = 'display:flex; gap:8px; margin-top:8px;';
  const useBtn = document.createElement('button');
  useBtn.type = 'button';
  useBtn.className = 'btn';
  useBtn.textContent = 'Use this shot';
  useBtn.style.cssText = 'flex:1; background:#2563eb; color:#fff;';
  useBtn.addEventListener('click', () => { burstSelected = i; useBurstShot(); });
  btnRow.appendChild(useBtn);
  const backBtn = document.createElement('button');
  backBtn.type = 'button';
  backBtn.className = 'btn';
  backBtn.textContent = '← All shots';
  backBtn.style.cssText = 'flex:1; background:#475569; color:#fff;';
  backBtn.addEventListener('click', () => { burstSelected = i; showBurstPicker(); });
  btnRow.appendChild(backBtn);
  pv.appendChild(btnRow);
  pv.style.display = 'block';
  setCameraHint('Shot ' + (i + 1) + ' of ' + burstShots.length + ' — check it, then Use this shot or go back.', '');
}

// A captured frame — the single shot, or the burst shot the user
// picked — goes to the crop editor: retake replaces the old photo in
// place, otherwise it is added. The camera stops either way.
function useCameraShot(b64) {
  if (!b64) return;
  // (v4.9.82) A shot for a form-photo slot goes to the crop editor as
  // a photo-slot capture — never into the NID/BRN lists. A retake of
  // a captured photo replaces it in place; a fresh capture opens the
  // crop editor and Apply stores it via setPulledPhoto.
  if (panelCameraPhotoSlot) {
    const slot = panelCameraPhotoSlot;
    panelCameraPhotoSlot = null;
    const replacing = (retakeItem && retakeItem.slot === slot) ? retakeItem : null;
    retakeItem = null;
    stopPanelCamera();
    if (replacing) {
      replacing.dataUrl = 'data:image/jpeg;base64,' + b64;
      replacing.originalDataUrl = null; // the old original belongs to the old shot
      replacing.source = 'camera';
      openCropForImage(replacing);
      return;
    }
    openCropForPhotoSlot(slot, b64, null, 'camera');
    return;
  }
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

// The chosen burst shot goes through the same path a single Capture
// used to: retake replaces the old photo in place, otherwise it is
// added and opens in the crop editor. The other shots are discarded.
function useBurstShot() {
  const shot = burstShots[burstSelected];
  if (!shot || !shot.b64) return;
  const b64 = shot.b64;
  burstShots = [];
  useCameraShot(b64);
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
  if (titleEl) titleEl.textContent = item.slot ? 'Crop, Rotate & Zoom Photo' : 'Crop, Scan, Rotate & Zoom Image';
  updateSlotCropControls();

  // Show the crop screen immediately; the photo draws as soon as it decodes.
  $('fcViewerModal').style.display = 'none';
  $('cropModal').classList.add('open');

  rawImage = new Image();
  rawImage.onload = () => {
    // (v4.9.86) A form-photo slot re-crop keeps its own frame and
    // never auto-scans; an NID photo keeps the orientation pick +
    // upload auto-scan.
    if (item.slot) pickSlotCropRatio(item.slot);
    else autoPickCropRatio();
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
    if (cropAutoScanAllowed(item)) autoScanCrop(false);
  };
  rawImage.onerror = () => {
    $('cropModal').classList.remove('open');
    setStatus('Could not load this photo for cropping.', 'err');
  };
  // Re-cropping always starts from the original photo, never from a
  // previous crop — so a crop you didn't like can simply be done again.
  // A form photo (pulledImages entry) keeps its bytes in dataUrl, not
  // base64 — and its pre-crop original in originalDataUrl.
  rawImage.src = item.slot
    ? (item.originalDataUrl || item.dataUrl)
    : `data:image/jpeg;base64,${item.originalBase64 || item.base64}`;
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
// Form-photo slot guide frames (v4.9.85): the website's own camera
// guide (verified in its app.js, component data-v-ba197eea) — a
// dashed white frame with the outside dimmed, one shape per slot:
// Applicant photo portrait 180:200, Signature a wide 200:80 strip,
// House photo 3:2 landscape (600:400). Width is min(frac% of the
// stage, cap px), exactly the site's guideFrameStyle numbers.
const SLOT_FRAME_SPECS = {
  image: { frac: 0.56, cap: 280, w: 180, h: 200 },
  signature: { frac: 0.85, cap: 360, w: 200, h: 80 },
  house_image: { frac: 0.92, cap: 560, w: 600, h: 400 }
};
// The slot guide rect in stage px, centred — clamped to fit the
// stage height (same 92% rule as fitFrameRect). Pure — tested by
// tests/sidepanel_freeform_test.js. Returns null for an unknown slot.
function slotFrameRect(sw, sh, slot) {
  const spec = SLOT_FRAME_SPECS[slot];
  if (!spec || !sw || !sh) return null;
  let w = Math.min(sw * spec.frac, spec.cap);
  let h = w * spec.h / spec.w;
  if (h > sh * 0.92) { h = sh * 0.92; w = h * spec.w / spec.h; }
  return { x: (sw - w) / 2, y: (sh - h) / 2, w, h };
}
// (v4.9.86) The website's output size for a slot crop — the saved
// photo is exactly this size (outputWidth/outputHeight, component
// data-v-ba197eea): Applicant 180×200, Signature 200×80, House
// 600×400. Same w/h as SLOT_FRAME_SPECS above. Pure — tested.
function photoSlotOutputSize(slot) {
  const spec = SLOT_FRAME_SPECS[slot];
  if (!spec) return null;
  return { w: spec.w, h: spec.h };
}
// (v4.9.86) Editor canvas size for a slot crop — same aspect as the
// output, big enough to edit on: Applicant 675×750, Signature
// 900×360, House 900×600. Pure — tested.
function slotCropCanvasSize(slot) {
  const spec = SLOT_FRAME_SPECS[slot];
  if (!spec) return null;
  const w = spec.w >= spec.h ? 900 : 675;
  return { w, h: Math.round(w * spec.h / spec.w) };
}
// (v4.9.86) Affine map from original-image px to crop-canvas px for
// the crop view drawCropCanvas shows — translate(centre + pan) ·
// scale(totalScale) · rotate · drawImage centred. cover=true uses the
// cover fit (photo fills the frame edge to edge, never letterboxed);
// cover=false uses the fit-inside the NID flow keeps. Pure — tested
// by tests/sidepanel_freeform_test.js: with cover=true every canvas
// corner must inverse-map inside the source image (no black bars).
function cropViewMatrix(imgW, imgH, cw, ch, rotationDeg, zoom, panXv, panYv, cover) {
  const rad = ((rotationDeg || 0) * Math.PI) / 180;
  const cos = Math.cos(rad), sin = Math.sin(rad);
  const boundW = imgW * Math.abs(cos) + imgH * Math.abs(sin);
  const boundH = imgW * Math.abs(sin) + imgH * Math.abs(cos);
  const fit = cover
    ? Math.max(cw / boundW, ch / boundH)
    : Math.min(cw / boundW, ch / boundH);
  const s = fit * (zoom || 1);
  const cx = imgW / 2, cy = imgH / 2;
  const tx = cw / 2 + (panXv || 0), ty = ch / 2 + (panYv || 0);
  return {
    a: s * cos, b: s * sin, c: -s * sin, d: s * cos,
    e: tx - s * (cos * cx - sin * cy),
    f: ty - s * (sin * cx + cos * cy)
  };
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
// (v4.9.89) One step of a two-finger pinch zoom in the crop
// editor — pure. s is the pinch state the previous move left
// ({ dist, zoom, panX, panY, cx, cy }); p1/p2 are the two current
// touch points in the same units pan uses (client px, the space the
// drag handler already works in). The zoom follows the
// finger-distance ratio, snapped to the slider step (0.05) and
// clamped to the slider's live min/max, and pan moves so the photo
// point under the fingers' midpoint stays put. Pure — tested by
// tests/sidepanel_freeform_test.js.
function pinchStep(s, p1, p2, minZoom, maxZoom) {
  const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
  if (!dist || !s.dist || !s.zoom) return s;
  const midX = (p1.x + p2.x) / 2, midY = (p1.y + p2.y) / 2;
  let zoom = s.zoom * (dist / s.dist);
  zoom = Math.round(zoom / 0.05) * 0.05;
  zoom = Math.round(zoom * 100) / 100;
  zoom = Math.max(minZoom, Math.min(maxZoom, zoom));
  const k = zoom / s.zoom;
  const panX = midX - s.cx - k * (midX - s.cx - s.panX);
  const panY = midY - s.cy - k * (midY - s.cy - s.panY);
  return { dist, zoom, panX, panY, cx: s.cx, cy: s.cy };
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
  // (v4.9.86) A slot crop COVERS the frame — the photo fills it edge
  // to edge (drag/zoom to position, like the website's crop), so no
  // black bars are ever baked into a slot photo. An NID crop keeps
  // the fit-inside: the whole document stays visible.
  const fitScale = cropSlotActive()
    ? Math.max(canvas.width / boundW, canvas.height / boundH)
    : Math.min(canvas.width / boundW, canvas.height / boundH);
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
  // (v4.9.86) A slot crop renders from the original at the slot's
  // output size — never from the 900 px display canvas.
  if (cropSlotActive()) {
    const b64 = slotCropDataUrl();
    if (b64) return b64;
  }
  const r = freeCropRect;
  drawCropCanvas(false); // clean redraw: photo only, no box, no handles
  const out = document.createElement('canvas');
  out.width = Math.max(1, Math.round(r.w));
  out.height = Math.max(1, Math.round(r.h));
  const ctx = out.getContext('2d');
  ctx.drawImage(canvas, r.x, r.y, r.w, r.h, 0, 0, out.width, out.height);
  return out.toDataURL('image/jpeg', 0.85).split(',')[1];
}

// (v4.9.86) Render the current slot crop from the ORIGINAL image,
// once, at the website's output size (180×200 / 200×80 / 600×400) —
// the same transform the editor shows (cover fit, pan, zoom, 90°
// rotation), so what you see is what you save: no re-encode of the
// display canvas, no black bars, and the small output fits the
// 200 KB cap at quality 0.85, so compressBase64ToLimit() becomes a
// no-op — exactly like the site. Freeform uses the boxed region,
// mapped through the same transform. Returns null when no slot is
// open (or the editor has no photo yet); the caller falls back to
// the old display-canvas save.
function slotCropDataUrl() {
  const slot = activePhotoSlot || (activeCropItem && activeCropItem.slot);
  const size = slot ? photoSlotOutputSize(slot) : null;
  const canvas = $('cropCanvas');
  if (!size || !rawImage || !canvas) return null;
  const out = document.createElement('canvas');
  out.width = size.w; out.height = size.h;
  const ctx = out.getContext('2d');
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, size.w, size.h);
  const rad = (rotationAngle * Math.PI) / 180;
  const cos = Math.abs(Math.cos(rad)), sin = Math.abs(Math.sin(rad));
  const boundW = rawImage.width * cos + rawImage.height * sin;
  const boundH = rawImage.width * sin + rawImage.height * cos;
  // Cover fit, exactly as drawCropCanvas shows it.
  const fitScale = Math.max(canvas.width / boundW, canvas.height / boundH);
  const totalScale = fitScale * zoomLevel;
  if (cropRatio === 'free' && freeCropRect) {
    const r = freeCropRect;
    ctx.scale(size.w / r.w, size.h / r.h);
    ctx.translate(-r.x, -r.y);
  } else {
    ctx.scale(size.w / canvas.width, size.h / canvas.height);
  }
  ctx.translate(canvas.width / 2 + panX, canvas.height / 2 + panY);
  ctx.scale(totalScale, totalScale);
  ctx.rotate(rad);
  ctx.drawImage(rawImage, -rawImage.width / 2, -rawImage.height / 2);
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

// Burst toggle (v4.9.76): on = one Capture tap takes BURST_SHOTS
// shots and the picker lets the user choose; off = one tap takes a
// single photo. Same blue/grey paint as the perspective toggle, and
// remembered across sessions like it. Built in JS (no sidepanel.html
// change), next to the perspective toggle in the camera actions row.
// The toggle only affects the NEXT capture — a burst already running
// finishes and shows its picker.
let burstToggleLabel = null;
let burstToggleBuilt = false;
function updateBurstToggle() {
  const btn = $('burstToggleCamBtn');
  if (!btn) return;
  btn.style.background = burstEnabled ? '#2563eb' : '#475569';
  btn.title = burstEnabled ? 'Burst: On — one tap takes 3 shots, pick the sharpest' : 'Burst: Off — one tap takes a single photo';
  const label = burstToggleLabel || btn.querySelector('.burst-state');
  if (label) label.textContent = burstEnabled ? 'On' : 'Off';
}
function toggleBurst() {
  burstEnabled = !burstEnabled;
  try { localStorage.setItem('fc_pro_burst', burstEnabled ? '1' : '0'); } catch (_) {}
  updateBurstToggle();
  setStatus(burstEnabled ? 'Burst on — one tap takes 3 shots.' : 'Burst off — one tap takes a single photo.', 'ok');
}
function setupBurstToggle() {
  if (burstToggleBuilt) return;
  const perspBtn = $('perspectiveToggleCamBtn');
  if (!perspBtn || !perspBtn.parentNode) return;
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'btn';
  btn.id = 'burstToggleCamBtn';
  btn.style.cssText = 'background:#2563eb; color:#fff; padding: 8px 10px; font-size:12px; font-weight:600; gap:6px;';
  btn.textContent = 'Burst ';
  const label = document.createElement('span');
  label.className = 'burst-state';
  label.textContent = 'On';
  btn.appendChild(label);
  burstToggleLabel = label;
  btn.addEventListener('click', toggleBurst);
  perspBtn.parentNode.insertBefore(btn, perspBtn.nextSibling);
  burstToggleBuilt = true;
  updateBurstToggle();
}

// (v4.9.86) True while the crop editor holds a form-photo slot
// (fresh capture via activePhotoSlot, or a pulled photo re-crop via
// activeCropItem.slot). NID/BRN crops are never slot crops.
function cropSlotActive() {
  return !!(activePhotoSlot || (activeCropItem && activeCropItem.slot));
}
// (v4.9.86) A re-crop auto-scans only for a non-camera NID photo —
// never for a form-photo slot: a portrait/signature/house photo is
// not a document, and a scan can warp it like one.
function cropAutoScanAllowed(item) {
  return !!item && item.source !== 'camera' && !item.slot;
}
// (v4.9.86) Pick the slot's own crop frame ('slot:image' etc.) —
// never the orientation pick, so the photo fills the frame edge to
// edge. The zoom floor stays 1: at zoom 1 the photo already fills
// the frame, zooming in only crops tighter.
function pickSlotCropRatio(slot) {
  if (!photoSlotDef(slot)) return;
  cropRatio = 'slot:' + slot;
  updateCropRatioButtons();
  const zr = $('zoomRange');
  if (zr) zr.min = '1';
}
// (v4.9.86) Crop-modal controls for a slot crop: hide the FRAME row,
// the Scan button and the perspective toggle — a slot photo is never
// re-framed or scanned as a document. Shown again for every NID crop.
function updateSlotCropControls() {
  const slot = cropSlotActive();
  const row = $('cropRatioRow');
  if (row) row.style.display = slot ? 'none' : '';
  const scan = $('scanCropBtn');
  if (scan) scan.style.display = slot ? 'none' : '';
  const persp = $('perspectiveToggleBtn');
  if (persp) persp.style.display = slot ? 'none' : '';
}

function cropCanvasSize() {
  // (v4.9.86) A slot crop uses the slot's own canvas — same aspect as
  // the website's output, so the frame fits the photo with no bars.
  if (cropRatio && cropRatio.indexOf('slot:') === 0) {
    const s = slotCropCanvasSize(cropRatio.slice(5));
    if (s) return s;
  }
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
  // (v4.9.86) A slot crop keeps its own frame — the FRAME row is
  // hidden anyway; ignore any re-pick while a slot is open.
  if (cropSlotActive()) return;
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
      if (e.touches.length === 2) {
        // (v4.9.89) Two-finger pinch: take over the gesture — cancel
        // any one-finger drag and track the finger distance from here.
        // The camera is out of scope: this is the crop canvas only.
        e.preventDefault();
        isDragging = false;
        freeDrag = null;
        const r = canvas.getBoundingClientRect();
        pinchStart = {
          dist: Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY),
          zoom: zoomLevel,
          panX, panY,
          cx: r.left + r.width / 2, cy: r.top + r.height / 2
        };
        return;
      }
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
      if (pinchStart && e.touches.length === 2) {
        // (v4.9.89) Pinch zoom: two fingers drive the same zoom the
        // slider uses (clamped to the slider's live min/max), so
        // slider, buttons and pinch never disagree — and the slider
        // value follows, so the two always show the same zoom.
        e.preventDefault();
        const zr = $('zoomRange');
        const minZ = zr ? (parseFloat(zr.min) || 0.5) : 0.5;
        const maxZ = zr ? (parseFloat(zr.max) || 3.5) : 3.5;
        const next = pinchStep(pinchStart,
          { x: e.touches[0].clientX, y: e.touches[0].clientY },
          { x: e.touches[1].clientX, y: e.touches[1].clientY },
          minZ, maxZ);
        pinchStart = next;
        zoomLevel = next.zoom;
        panX = next.panX;
        panY = next.panY;
        if (zr) zr.value = zoomLevel;
        drawCropCanvas();
        return;
      }
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
    }, { passive: false }); // (v4.9.89) not passive: the pinch branch above must preventDefault, or the page itself pinch-zooms/scrolls while pinching the photo. The one-finger path never prevents default, so it behaves exactly as before.

    window.addEventListener('touchend', (e) => {
      if (pinchStart) {
        // (v4.9.89) Pinch over: with two fingers left (a third finger
        // came and went), re-baseline from the two that remain so the
        // next move does not jump; with one finger left, hand the drag
        // back to it from its current spot, so the photo does not jump.
        if (e.touches.length === 2) {
          const cv = $('cropCanvas');
          const r = cv ? cv.getBoundingClientRect() : null;
          pinchStart = {
            dist: Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY),
            zoom: zoomLevel,
            panX, panY,
            cx: r ? r.left + r.width / 2 : 0, cy: r ? r.top + r.height / 2 : 0
          };
        } else if (e.touches.length === 1) {
          pinchStart = null;
          isDragging = true;
          startX = e.touches[0].clientX - panX;
          startY = e.touches[0].clientY - panY;
        } else {
          pinchStart = null;
          isDragging = false;
          freeDrag = null;
        }
        return;
      }
      isDragging = false; freeDrag = null;
    });
    window.addEventListener('touchcancel', () => { pinchStart = null; isDragging = false; freeDrag = null; });

    // (v4.9.89) iOS Safari: stop its own pinch-zoom gesture on the
    // crop canvas (the CSS touch-action: none already covers modern
    // browsers; this is the belt for older Safari).
    canvas.addEventListener('gesturestart', (e) => e.preventDefault());
    canvas.addEventListener('gesturechange', (e) => e.preventDefault());
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
    // (v4.9.82) A form-photo crop cancels back to a retake of that
    // slot — camera or file picker, same as it was taken. Cancelling
    // keeps the old photo exactly as it was.
    const photoSlot = (item && item.slot) || activePhotoSlot;
    const photoSource = (item && item.slot) ? (item.source || 'camera') : (activePhotoSource || 'camera');
    activeCropItem = null;
    activeCategory = null;
    activePhotoSlot = null;
    activePhotoSource = null;
    if (photoSlot) {
      if (photoSource === 'camera') openPhotoSlotCamera(photoSlot);
      else openPhotoSlotUpload(photoSlot);
      return;
    }
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
    // (v4.9.94) Disable Auto-Fill while a crop save is pending: the
    // modal closes below before the async compress finishes, and an
    // Auto-Fill clicked in that window sends a payload without the
    // new photo. Re-enabled in the finally at the end of this
    // handler, always — including on error.
    $('autofillBtn').disabled = true;
    try {
    // (v4.9.86) A slot crop renders once from the original at the
    // site's output size — no re-encode of the display canvas, no
    // black bars, no quality drop. Any other crop keeps the old
    // display-canvas save.
    const slotB64 = cropSlotActive() ? slotCropDataUrl() : null;
    const b64 = slotB64 || ((cropRatio === 'free' && freeCropRect)
      ? freeRegionDataUrl(canvas)
      : canvas.toDataURL('image/jpeg', 0.85).split(',')[1]);
    $('cropModal').classList.remove('open');

    if (activeCropItem) {
      const croppedItem = activeCropItem;
      activeCropItem = null; // claim it before the async downscale, so a tap during the wait can't steal it
      activePhotoSlot = null;
      activePhotoSource = null;
      // (v4.9.82) A form photo (pulledImages entry) keeps its bytes in
      // dataUrl, not base64 — and its pre-crop original in
      // originalDataUrl, so a re-crop starts from the original. The
      // cropped photo is compressed to the site's size limit for the
      // slot before it is stored.
      if (croppedItem.slot) {
        if (!croppedItem.originalDataUrl) croppedItem.originalDataUrl = croppedItem.dataUrl;
        croppedItem.dataUrl = 'data:image/jpeg;base64,' + await compressBase64ToLimit(b64, photoSlotMaxBytes(croppedItem.slot));
        // (v4.9.94) A re-crop is a deliberate edit of a camera/upload
        // photo — mark it to replace the form's photo on Auto-Fill,
        // even when the entry was restored from an old export/session
        // without the flag. A re-cropped pulled photo keeps its flag
        // (unset): it is the form's own photo.
        if (croppedItem.source === 'camera' || croppedItem.source === 'upload') croppedItem.replace = true;
        renderPulledImages();
      } else {
        // Keep the original (first crop only) so a crop you didn't like can
        // be re-done from the original or undone — the true original is
        // never lost. Later crops never overwrite it.
        if (!croppedItem.originalBase64) {
          croppedItem.originalBase64 = await downscaleBase64(croppedItem.base64);
        }
        croppedItem.base64 = b64;
        renderPreviews('head');
        renderPreviews('other');
      }
      saveSessionState();

      // Cropping queue: advance to the next photo. Otherwise Apply just
      // returns to the list — no preview pops open after a crop.
      if (cropQueue.length) {
        setStatus(`Cropped ${cropQueueTotal - cropQueue.length} of ${cropQueueTotal}.`, 'ok');
        openNextQueuedCrop();
      } else {
        setStatus('Image cropped and updated.', 'ok');
      }
    } else if (activePhotoSlot) {
      // (v4.9.82) A fresh form-photo capture: compress to the site's
      // size limit for the slot, then store it in pulledImages — never
      // in the NID/BRN lists. Replacing a pulled photo marks it so
      // Auto-Fill uploads it over the form's photo.
      const slot = activePhotoSlot;
      const source = activePhotoSource || 'camera';
      activePhotoSlot = null;
      activePhotoSource = null;
      const fitted = await compressBase64ToLimit(b64, photoSlotMaxBytes(slot));
      setPulledPhoto(slot, fitted, source);
      const def = photoSlotDef(slot);
      setStatus(`${def ? def.name : 'Photo'} saved — ready for Auto-Fill.`, 'ok');
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
    } finally {
      $('autofillBtn').disabled = false;
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
  // Student flag (v4.9.78): a Pull / Import / session restore carries
  // the form's own flag values, so any hand-set marks from the
  // previous session are stale — clear them (the values themselves
  // are kept by the branches below).
  if (preserveOrder) studentFlagHandSet.clear();
  const h = raw?.head || {};
  const headDob = normalizeDob(h.dob);
  // 13-digit old NID -> 17 digits with the birth year (v4.9.47); a
  // wrong-length ID stays as typed and the card warns about it.
  // (v4.9.87) Tolerant read: a head record that came from a member
  // role may still carry `nid_or_brn` (makeMemberHead translates the
  // key, but a record saved / imported before the fix may not) — read
  // either key, never let a wrong-key record destroy the NID on
  // rebuild. The canonical output key stays `nid`.
  const headIdRaw = s(h.nid || h.nid_or_brn);
  const cleanHeadId = checkIdNumber(headIdRaw, headDob, h.doc_type).value;
  // Remember a converted 13-digit NID (v4.9.49): this 17-digit value
  // is an NID, so the manual 17-digit rule must not flip it to BRN.
  if (toEnglishDigits(headIdRaw).replace(/\s+/g, '').length === 13 && cleanHeadId && cleanHeadId.length === 17) converted13NidValues.add(cleanHeadId);
  const headGender = inferGender('Wife', h.gender || 'Female', h.name_en, h.name_bn);
  const headAge = calculateAgeYears(headDob);

  const head = {
    // A 13-digit number is always an old NID (a BRN is 17 digits), so
    // a converted 13-digit ID stays NID even though it is 17 digits now.
    doc_type: toEnglishDigits(headIdRaw).replace(/\s+/g, '').length === 13 ? 'NID' : inferDocType(cleanHeadId, h.doc_type),
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
  // Student flag (v4.9.78): the profession drives it — Student (106)
  // => Yes at any age, so a hand-picked 25+ student still gets Yes.
  // A value the user typed on the card wins; a pulled value wins too;
  // otherwise the age rule (6-24 => Yes, 0-5 => No). The injector's
  // head member row reads it from this record (targetMemberList[0]).
  // (v4.9.80) An explicitly non-Student profession re-derives the flag
  // to No — a stale Yes (AI-derived from age, or carried over from a
  // previous session) must not survive the rebuild. A hand-picked flag
  // still wins, and a Pull/Import/restore (preserveOrder) keeps the
  // form's own value: the record the form holds IS the hand value then.
  const headProfSet = head.profession !== undefined && head.profession !== null && String(head.profession).trim() !== '';
  if (!preserveOrder && headProfSet && Number(head.profession) !== 106 && !studentFlagHandSet.has('head')) {
    head.is_currently_student = 0;
  } else if (h.is_currently_student !== undefined && h.is_currently_student !== null && String(h.is_currently_student).trim() !== '') {
    head.is_currently_student = Number(h.is_currently_student);
  } else if (Number(head.profession) === 106) {
    head.is_currently_student = 1;
  } else if (prev && prev.head && prev.head.is_currently_student !== undefined && prev.head.is_currently_student !== null && String(prev.head.is_currently_student).trim() !== '') {
    head.is_currently_student = Number(prev.head.is_currently_student);
  } else {
    head.is_currently_student = studentFlagForRecord(head, true);
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
  // Household carry (v4.9.81): the head's HOUSEHOLD fields (phone,
  // MFS, bank, address, nominee, program counts, PMT answers/picks)
  // may also come from a previous record whose head has NO NID yet —
  // a blank in-progress form the user typed into while the AI worked.
  // They are blocked only when the previous head has a DIFFERENT
  // non-empty NID (a different family), so nothing bleeds across
  // families. The AI never returns these fields, so raw has no value
  // and prev should win. Person-level fields (SSNP/card/DSS,
  // disability/health, income, student flag) keep the strict
  // same-person headPrev above — those are about the person, not the
  // household.
  const prevHeadId = toEnglishDigits(String(prev?.head?.nid || prev?.head?.nid_or_brn || '')).replace(/\s+/g, '');
  const headHouseholdPrev = (prev && prev.head && (!prevHeadId || samePersonId(cleanHeadId, prevHeadId))) ? prev.head : null;
  // Annual income (v4.9.75): the head card never had an income row,
  // so every old record carries 0 — a 0 only counts as a real income
  // for a 0-value head profession (Housewife/Student/Unemployed/
  // Others). Otherwise a real non-zero income wins, then the same
  // person's previous income, then the rolled guess from the head
  // profession table (incomeGuessForHeadProfession). A rolled guess
  // is stored as the income, so it sticks on the next Extract.
  const headIncRaw = h.estimate_annual_income;
  const headIncKnown = headIncRaw !== undefined && headIncRaw !== null && String(headIncRaw).trim() !== '' && Number(headIncRaw) !== 0;
  if (headIncKnown) {
    head.estimate_annual_income = Number(headIncRaw);
  } else if (headPrev && headPrev.estimate_annual_income !== undefined && headPrev.estimate_annual_income !== null && String(headPrev.estimate_annual_income).trim() !== '' && Number(headPrev.estimate_annual_income) !== 0) {
    head.estimate_annual_income = Number(headPrev.estimate_annual_income);
  } else if (incomeForHeadProfession(head.profession) === 0) {
    head.estimate_annual_income = 0;
  } else {
    head.estimate_annual_income = incomeGuessForHeadProfession(head.profession);
  }
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
  // Phone + MFS (v4.9.49, v4.9.81): the head's mobile number and MFS provider.
  // The site rejects Bangla digits in a mobile number, so normalize
  // to English digits here too (the card does it on blur as well). A
  // previous record's phone/MFS carry over for the same person — or
  // from a blank in-progress form with no NID yet (headHouseholdPrev).
  // A phone must never bleed across families (different non-empty NID).
  const cleanHeadMobile = checkMobileNumber(h.mobile_number).value;
  if (cleanHeadMobile) head.mobile_number = cleanHeadMobile;
  else if (headHouseholdPrev && headHouseholdPrev.mobile_number) head.mobile_number = checkMobileNumber(headHouseholdPrev.mobile_number).value || headHouseholdPrev.mobile_number;
  if (h.mfs_provider_id !== undefined && h.mfs_provider_id !== null && String(h.mfs_provider_id).trim() !== '') {
    head.mfs_provider_id = Number(h.mfs_provider_id);
  } else if (headHouseholdPrev && headHouseholdPrev.mfs_provider_id !== undefined && headHouseholdPrev.mfs_provider_id !== null && String(headHouseholdPrev.mfs_provider_id).trim() !== '') {
    head.mfs_provider_id = Number(headHouseholdPrev.mfs_provider_id);
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
  // (v38, v4.9.81) All-tabs pull: the extra head fields the injector now
  // sends — general extras, bank, address, nominee, program counts,
  // PMT answers. Text keys keep the trimmed string, id keys keep the
  // number, name keys keep the resolved display name. A previous
  // record's values carry over for the same person — or from a blank
  // in-progress form with no NID yet (headHouseholdPrev) — so nothing
  // bleeds across families.
  const headTextKeys = ['spouse_name_bn', 'spouse_name_en', 'identification_mark', 'nationality', 'email', 'account_name', 'account_number', 'mfs_number', 'address_text', 'address_post_code', 'permanent_address_text', 'permanent_address_post_code', 'nominee_en', 'nominee_bn', 'nominee_verification_number', 'nominee_date_of_birth', 'nominee_address', 'nominee_relation_with_beneficiary', 'nominee_nationality', 'mobile_operator', 'account_type_label', 'bank_name', 'branch_name', 'bank_division_name', 'bank_district_name', 'account_owner', 'address_division_name', 'address_district_name', 'address_thana_name', 'address_union_name', 'address_pouro_name', 'address_city_name', 'address_city_thana_name', 'address_district_pouro_name', 'address_ward_name', 'address_location_type_name', 'address_ward_key', 'permanent_address_division_name', 'permanent_address_district_name', 'permanent_address_thana_name', 'permanent_address_union_name', 'permanent_address_pouro_name', 'permanent_address_city_name', 'permanent_address_city_thana_name', 'permanent_address_district_pouro_name', 'permanent_address_ward_name', 'permanent_address_location_type_name', 'permanent_address_ward_key', 'house_size', 'no_of_room_name'];
  const headIdKeys = ['mobile_operator_id', 'disability_id', 'account_type', 'bank_name_id', 'branch_name_id', 'bank_division_id', 'bank_district_id', 'account_owner_id', 'address_division_id', 'address_district_id', 'address_thana_id', 'address_union_id', 'address_pouro_id', 'address_city_id', 'address_city_thana_id', 'address_district_pouro_id', 'address_ward_id', 'address_location_type_id', 'address_sub_location_type_id', 'permanent_address_division_id', 'permanent_address_district_id', 'permanent_address_thana_id', 'permanent_address_union_id', 'permanent_address_pouro_id', 'permanent_address_city_id', 'permanent_address_city_thana_id', 'permanent_address_district_pouro_id', 'permanent_address_ward_id', 'permanent_address_location_type_id', 'permanent_address_sub_location_type_id', 'no_of_room', 'program_male', 'program_female', 'program_hijra', 'program_abroad_male', 'program_abroad_female', 'program_abroad_hijra'];
  for (const k of headTextKeys) {
    if (h[k] !== undefined && h[k] !== null && String(h[k]).trim() !== '') head[k] = String(h[k]).trim();
    else if (headHouseholdPrev && headHouseholdPrev[k] !== undefined && headHouseholdPrev[k] !== null && String(headHouseholdPrev[k]).trim() !== '') head[k] = String(headHouseholdPrev[k]).trim();
  }
  for (const k of headIdKeys) {
    if (h[k] !== undefined && h[k] !== null && String(h[k]).trim() !== '') head[k] = Number(h[k]);
    else if (headHouseholdPrev && headHouseholdPrev[k] !== undefined && headHouseholdPrev[k] !== null && String(headHouseholdPrev[k]).trim() !== '') head[k] = Number(headHouseholdPrev[k]);
  }
  // Bangla names stay Bangla (like the head's own name_bn).
  if (head.spouse_name_bn) head.spouse_name_bn = stripLatinLetters(head.spouse_name_bn);
  if (head.nominee_bn) head.nominee_bn = stripLatinLetters(head.nominee_bn);
  // Program fields + PMT answers are arrays — keep the pull's list,
  // else the same person's previous list, else a blank in-progress
  // form's list (headHouseholdPrev, v4.9.81).
  if (preserveOrder && Array.isArray(h.program_fields) && h.program_fields.length) head.program_fields = h.program_fields;
  else if (headHouseholdPrev && Array.isArray(headHouseholdPrev.program_fields) && headHouseholdPrev.program_fields.length) head.program_fields = headHouseholdPrev.program_fields;
  if (preserveOrder && Array.isArray(h.pmt_answers) && h.pmt_answers.length) head.pmt_answers = h.pmt_answers;
  else if (headHouseholdPrev && Array.isArray(headHouseholdPrev.pmt_answers) && headHouseholdPrev.pmt_answers.length) head.pmt_answers = headHouseholdPrev.pmt_answers;
  // PMT leftover picks (v4.9.69): the head card's picks — raw (pull /
  // import) wins, then the same person's previous record, then the
  // pulled draft's answers, then the user defaults. The fuel (for the
  // LPG default) is the imported override, else the pulled fuel, else
  // wood 550.
  const fuelIdForPicks = (raw?.form_defaults && raw.form_defaults.pmt && raw.form_defaults.pmt['548'] !== undefined && raw.form_defaults.pmt['548'] !== null)
    ? Number(raw.form_defaults.pmt['548'])
    : (pmtPulledAnswerId(head.pmt_answers, 548) ?? 550);
  // The imported Q47 override is a source for the assets pick, not a
  // preserved entry — the head pick wins for Q47 now that the panel
  // owns it (v4.9.72).
  const importedAssets = (raw?.form_defaults && raw.form_defaults.pmt && raw.form_defaults.pmt['47'] !== undefined && raw.form_defaults.pmt['47'] !== null)
    ? raw.form_defaults.pmt['47'] : undefined;
  Object.assign(head, resolveHeadPmtPicks(h, headHouseholdPrev, stickyHomeCombo(), fuelIdForPicks, importedAssets));

  const members = Array.isArray(raw?.family_members) ? raw.family_members : [];
  const deduped = [];
  const seen = new Map();

  for (const m of members) {
    // Skip empty ghost entries from NID back-side images
    const rawNameBn = s(m?.name_bn);
    const rawNameEn = s(m?.name_en);
    // (v4.9.87) Tolerant read, like the head above: a member record
    // that came from the head role may still carry `nid` — read either
    // key, never let a wrong-key record destroy the NID on rebuild.
    // The canonical output key stays `nid_or_brn`.
    const rawMemId = toEnglishDigits(s(m?.nid_or_brn || m?.nid)).replace(/\s+/g, '');
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
    // Student flag (v4.9.78): the profession drives it — Student (220)
    // => Yes at any age. A value typed on the card wins; a pulled
    // value wins too; otherwise the age rule (6-24 => Yes, 0-5 => No).
    // (v4.9.80) An explicitly non-Student profession re-derives the
    // flag to No — a stale Yes must not survive the rebuild. A
    // hand-picked flag still wins, and a Pull/Import/restore
    // (preserveOrder) keeps the form's own value.
    const memberProfSet = entry.livelihood_profession_id !== undefined && entry.livelihood_profession_id !== null && String(entry.livelihood_profession_id).trim() !== '';
    const memberFlagKey = String(entry.nid_or_brn || '').replace(/\s+/g, '');
    if (!preserveOrder && memberProfSet && Number(entry.livelihood_profession_id) !== 220 && !studentFlagHandSet.has(memberFlagKey)) {
      entry.is_currently_student = 0;
    } else if (m?.is_currently_student !== undefined && m?.is_currently_student !== null && String(m.is_currently_student).trim() !== '') {
      entry.is_currently_student = Number(m.is_currently_student);
    } else if (Number(entry.livelihood_profession_id) === 220) {
      entry.is_currently_student = 1;
    } else if (prevM2 && prevM2.is_currently_student !== undefined && prevM2.is_currently_student !== null && String(prevM2.is_currently_student).trim() !== '') {
      entry.is_currently_student = Number(prevM2.is_currently_student);
    } else {
      entry.is_currently_student = studentFlagForRecord(entry, false);
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
    // (v38) The rest of the member row's own fields: literacy (the
    // form's own answer — the panel derives it from education, but
    // the form's value is the ground truth), annual income (the form
    // holds the real number, e.g. 150000 for the husband, not the
    // panel's 0 / 60000 guess), and the government-job flag. Same
    // person only (prevM2, matched by NID/BRN).
    if (m?.literacy_id !== undefined && m?.literacy_id !== null && String(m.literacy_id).trim() !== '') {
      entry.literacy_id = Number(m.literacy_id);
    } else if (prevM2 && prevM2.literacy_id !== undefined && prevM2.literacy_id !== null && String(prevM2.literacy_id).trim() !== '') {
      entry.literacy_id = Number(prevM2.literacy_id);
    }
    // (v4.9.66) Annual income ALWAYS shows a value in the panel so it
    // can be edited: a blank income gets the red field-warning in the
    // card, and the site's income field is required on one form
    // variant, so an empty income glows red there too. A real income
    // wins; otherwise the guess comes from the profession (v4.9.73,
    // PROFESSION_INCOME above): a student-age member (6–24) still
    // gets 0, like the injector, and with no profession on file the
    // old rule stands (Husband 60000, everyone else 0) — so a son
    // with no income still shows 0. This reverses the v4.9.65 hiding:
    // the blank it left behind was the red field the user reported
    // ("show 0, so we can edit it").
    if (m?.estimate_annual_income !== undefined && m?.estimate_annual_income !== null && String(m.estimate_annual_income).trim() !== '') {
      entry.estimate_annual_income = Number(m.estimate_annual_income);
    } else if (prevM2 && prevM2.estimate_annual_income !== undefined && prevM2.estimate_annual_income !== null && String(prevM2.estimate_annual_income).trim() !== '') {
      entry.estimate_annual_income = Number(prevM2.estimate_annual_income);
    } else {
      entry.estimate_annual_income = incomeGuessForMember(entry, entry.livelihood_profession_id);
    }
    if (m?.is_gov_job_holder === 0 || m?.is_gov_job_holder === 1 || m?.is_gov_job_holder === '0' || m?.is_gov_job_holder === '1') {
      entry.is_gov_job_holder = Number(m.is_gov_job_holder);
    } else if (prevM2 && (prevM2.is_gov_job_holder === 0 || prevM2.is_gov_job_holder === 1 || prevM2.is_gov_job_holder === '0' || prevM2.is_gov_job_holder === '1')) {
      entry.is_gov_job_holder = Number(prevM2.is_gov_job_holder);
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
  // PMT leftover picks (v4.9.69): the score copies as its number;
  // the combo copies as its label (or its three parts for "other").
  if (f.key === 'pmt_score_total') {
    return state.lastExtracted ? String(computePmtScoreTotal(state.lastExtracted)) : '';
  }
  if (f.key === 'home_combo') {
    const c = targetObj.home_combo;
    if (c !== undefined && c !== null && c !== '' && c !== HOME_COMBO_OTHER && HOME_COMBOS[Number(c)]) return HOME_COMBOS[Number(c)].label;
    if (c === HOME_COMBO_OTHER) {
      const nameOf = (list, id) => { const o = (list || []).find((x) => Number(x.id) === Number(id)); return o ? o.label : (id ? String(id) : '—'); };
      return `মেঝে ${nameOf(PMT_FLOOR_OPTIONS, targetObj.pmt_floor)}, দেয়াল ${nameOf(PMT_WALL_OPTIONS, targetObj.pmt_wall)}, ছাদ ${nameOf(PMT_ROOF_OPTIONS, targetObj.pmt_roof)}`;
    }
    return '';
  }
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
  const v = displayTextValue(targetObj[f.key]);
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

// Head-change profession conversion (v4.9.77): the head uses the
// type-34 `profession`, a member the type-44 `livelihood_profession_id`
// — the two lists are different ids for the same work, so a head
// change converts instead of dropping the value (the old code deleted
// both and the DOB derivation refilled Housewife 181 / Homemaker 225,
// wiping a real profession). A type-44 id with no type-34 equivalent
// becomes Labourer 109 (the closest manual work); Service 107 becomes
// Private Job 212 on the way back (the commoner of the two services).
const LIVELIHOOD_TO_HEAD_PROFESSION = { 210: 151, 211: 149, 212: 107, 213: 107, 214: 150, 215: 109, 216: 109, 217: 109, 218: 109, 219: 109, 220: 106, 221: 109, 222: 108, 223: 110, 224: 110, 225: 181, 275: 110, 226: 110 };
const HEAD_TO_LIVELIHOOD_PROFESSION = { 151: 210, 149: 211, 107: 212, 150: 214, 109: 214, 106: 220, 108: 222, 110: 226, 181: 225 };
function headProfessionForLivelihood(livelihoodId) {
  if (livelihoodId === undefined || livelihoodId === null || String(livelihoodId).trim() === '') return undefined;
  const v = LIVELIHOOD_TO_HEAD_PROFESSION[Number(livelihoodId)];
  return v === undefined ? undefined : v;
}
function livelihoodForHeadProfession(professionId) {
  if (professionId === undefined || professionId === null || String(professionId).trim() === '') return undefined;
  const v = HEAD_TO_LIVELIHOOD_PROFESSION[Number(professionId)];
  return v === undefined ? undefined : v;
}

// Head-only data (v4.9.77): keys that live on the head record but never
// on a member record — the household's contact, MFS, address, bank,
// PMT picks and pulled PMT answers. A head change moves the ROLE, not
// the household, so these move to the new head instead of being dropped
// with the old head. (The person-level fields — names, DOB, NID,
// education, marital, income, disability, health, SSNP/DSS — already
// travel on the record itself.) Text + id keys mirror normalizeOutput's
// headTextKeys / headIdKeys; the PMT picks come from
// resolveHeadPmtPicks.
const HEAD_ONLY_KEYS = [
  'mobile_number', 'mfs_provider_id', 'mfs_number',
  'pmt_kitchen', 'pmt_dining', 'pmt_land', 'pmt_occupation', 'pmt_lpg', 'pmt_diesel', 'pmt_assets', 'home_combo', 'pmt_floor', 'pmt_wall', 'pmt_roof', 'pmt_answers', 'program_fields',
  'spouse_name_bn', 'spouse_name_en', 'identification_mark', 'nationality', 'email', 'account_name', 'account_number', 'address_text', 'address_post_code', 'permanent_address_text', 'permanent_address_post_code', 'nominee_en', 'nominee_bn', 'nominee_verification_number', 'nominee_date_of_birth', 'nominee_address', 'nominee_relation_with_beneficiary', 'nominee_nationality', 'mobile_operator', 'account_type_label', 'bank_name', 'branch_name', 'bank_division_name', 'bank_district_name', 'account_owner', 'address_division_name', 'address_district_name', 'address_thana_name', 'address_union_name', 'address_pouro_name', 'address_city_name', 'address_city_thana_name', 'address_district_pouro_name', 'address_ward_name', 'address_location_type_name', 'address_ward_key', 'permanent_address_division_name', 'permanent_address_district_name', 'permanent_address_thana_name', 'permanent_address_union_name', 'permanent_address_pouro_name', 'permanent_address_city_name', 'permanent_address_city_thana_name', 'permanent_address_district_pouro_name', 'permanent_address_ward_name', 'permanent_address_location_type_name', 'permanent_address_ward_key', 'house_size', 'no_of_room_name',
  'mobile_operator_id', 'disability_id', 'account_type', 'bank_name_id', 'branch_name_id', 'bank_division_id', 'bank_district_id', 'account_owner_id', 'address_division_id', 'address_district_id', 'address_thana_id', 'address_union_id', 'address_pouro_id', 'address_city_id', 'address_city_thana_id', 'address_district_pouro_id', 'address_ward_id', 'address_location_type_id', 'address_sub_location_type_id', 'permanent_address_division_id', 'permanent_address_district_id', 'permanent_address_thana_id', 'permanent_address_union_id', 'permanent_address_pouro_id', 'permanent_address_city_id', 'permanent_address_city_thana_id', 'permanent_address_district_pouro_id', 'permanent_address_ward_id', 'permanent_address_location_type_id', 'permanent_address_sub_location_type_id', 'no_of_room', 'program_male', 'program_female', 'program_hijra', 'program_abroad_male', 'program_abroad_female', 'program_abroad_hijra'
];

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
const HEAD_CORRECTION_KEYS = ['education_status_id', 'profession', 'marital_status', 'is_currently_student'];
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
  // Student flag (v4.9.78): a hand pick marks the flag hand-set, so
  // later derivations leave it alone; clearing the pick un-marks it.
  // (The injector's head member row reads the flag from the head
  // record — the correction itself is what forces a re-fill to
  // re-write the row.)
  if (key === 'is_currently_student') {
    if (value === null || value === undefined || value === '') studentFlagHandSet.delete('head');
    else studentFlagHandSet.add('head');
  }
  if (!Object.keys(d.corrections.head).length) delete d.corrections.head;
  if (!Object.keys(d.corrections).length) delete d.corrections;
  saveSessionState();
}

// Member corrections (v4.9.77): the member-card equivalent of
// recordHeadCorrection — when the user changes a member's option field
// on the card after a fill, record it so the injector's option sync
// overwrites the form's value on the next fill instead of skipping it
// as "already filled". Keyed by the member's NID/BRN (the person, not
// the row), so they survive reordering and follow the person if she
// becomes head. Only the option-sync fields are recorded — SSNP/DSS/
// cards flow through the row loop's provided-flags, and income through
// its own differs-rule, so they need no correction. A blank (—) clears
// the correction. The corrections are cleared on a successful fill (see
// the FC_AUTOFILL_RESPONSE handler), so a later hand-change on the form
// is never overwritten by a stale one.
const MEMBER_CORRECTION_KEYS = ['education_status_id', 'livelihood_profession_id', 'maritial_status_id', 'literacy_id', 'health_condition_id', 'disability_type_id', 'is_currently_student'];
function recordMemberCorrection(memberRecord, key, value) {
  if (!memberRecord) return;
  // The card notifies a marital change as 'marital_status'; the
  // member row's key is the site's typo 'maritial_status_id'.
  const normKey = key === 'marital_status' ? 'maritial_status_id' : key;
  if (!MEMBER_CORRECTION_KEYS.includes(normKey)) return;
  if (!state.lastExtracted) return;
  const idKey = String(memberRecord.nid_or_brn || memberRecord.nid || memberRecord.brn_id || '').replace(/\s+/g, '');
  if (!idKey) return; // no id — nothing to match the correction to
  const d = state.lastExtracted;
  d.corrections = d.corrections || {};
  d.corrections.members = d.corrections.members || {};
  if (value === null || value === undefined || value === '') {
    if (d.corrections.members[idKey]) {
      delete d.corrections.members[idKey][normKey];
      if (!Object.keys(d.corrections.members[idKey]).length) delete d.corrections.members[idKey];
    }
    // Student flag (v4.9.78): clearing the pick un-marks it hand-set.
    if (normKey === 'is_currently_student') studentFlagHandSet.delete(idKey);
  } else {
    d.corrections.members[idKey] = d.corrections.members[idKey] || {};
    d.corrections.members[idKey][normKey] = Number(value);
    // Student flag (v4.9.78): a hand pick marks the flag hand-set, so
    // later derivations leave it alone.
    if (normKey === 'is_currently_student') studentFlagHandSet.add(idKey);
  }
  if (!Object.keys(d.corrections.members).length) delete d.corrections.members;
  if (!Object.keys(d.corrections).length) delete d.corrections;
  saveSessionState();
}

// Head change (v4.9.37): make the member at memberIdx the head. The
// old head becomes a member at the same position, every other
// member's relation is recomputed for the new head (null = could not
// derive, set to Other Relative for the user to pick), and the
// summary is recalculated. (v4.9.77) The household's head-only data
// (mobile, MFS, address, bank, PMT picks and pulled PMT answers)
// moves to the new head, both professions are converted between the
// type-34 and type-44 lists instead of being dropped, the Halnagad
// detection is kept (the injector re-detects it for the new head on
// the next fill), and corrections follow the PERSON — the old head's
// head-corrections become member corrections keyed by her NID/BRN
// and the new head's member corrections become head corrections.
// Deleting the corrections (the old code) lost the user's hand
// corrections; keeping them under `corrections.head` unchanged would
// force the OLD head's education/profession/marital onto the NEW head.
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
  // Role-specific profession (v4.9.77): the head uses the type-34
  // `profession`, a member the type-44 `livelihood_profession_id`.
  // Convert instead of dropping — the old code deleted both and the
  // DOB derivation refilled Housewife 181 / Homemaker 225, wiping a
  // real profession (a Farmer head became a Housewife). A blank stays
  // blank for the derivation to fill. The stale other-role key is
  // removed, so a type-44 value never lands on the head form (or a
  // type-34 value on a member row). A converted value is never blank,
  // so the derivation below leaves it alone.
  const newLivelihood = newHead.livelihood_profession_id;
  delete headRec.livelihood_profession_id;
  if (newLivelihood !== undefined && newLivelihood !== null && String(newLivelihood).trim() !== '') {
    const converted = headProfessionForLivelihood(newLivelihood);
    if (converted !== undefined) headRec.profession = converted;
  }
  const oldProf = oldHead.profession;
  delete oldHeadRec.profession;
  if (oldProf !== undefined && oldProf !== null && String(oldProf).trim() !== '') {
    const converted = livelihoodForHeadProfession(oldProf);
    if (converted !== undefined) oldHeadRec.livelihood_profession_id = converted;
  }
  // (v4.9.87) ID key follows the role, like the profession conversion
  // above: a head carries `nid`, a member carries `nid_or_brn`. The
  // plain spreads above copy the number under the WRONG key (the new
  // head's `nid_or_brn`, the old head's `nid`), so both cards went
  // blank at once — and the next rebuild destroyed both NIDs for good.
  // The stale other-role key is removed, so a wrong-key value never
  // survives on the record.
  headRec.nid = newHead.nid_or_brn || newHead.nid || newHead.brn_id || '';
  delete headRec.nid_or_brn;
  oldHeadRec.nid_or_brn = oldHead.nid || oldHead.nid_or_brn || oldHead.brn_id || '';
  delete oldHeadRec.nid;
  // (v4.9.77) The household's head-only data moves to the new head —
  // mobile, MFS, address, bank, PMT picks and pulled PMT answers —
  // and off the old head's member record (it belongs to the role, not
  // the person). The people themselves already travel on the record
  // spreads above.
  for (const k of HEAD_ONLY_KEYS) {
    if (oldHead[k] !== undefined) headRec[k] = oldHead[k];
    delete oldHeadRec[k];
  }
  const members = data.family_members.map((m, i) => {
    if (i === memberIdx) return oldHeadRec;
    const nr = recalc.relsByIdx[i];
    if (nr) return { ...m, relation: nr, relationship_id: RELATION_ID_MAP[nr] || 263 };
    return { ...m, relation: 'Other Relative', relationship_id: 263 };
  });
  data.head = headRec;
  data.family_members = members;
  // (v4.9.77) The Halnagad detection is kept, not nulled: it is the
  // household's migration note, and the injector re-detects the
  // programme for the new head on the next fill (applyHalnagadBenefit
  // then mirrors it onto her). Nulling it dropped the note the user
  // had just pulled.
  renderHalnagadNote();
  // (v4.9.77) Pulled photos are by PERSON, not by role: the Applicant
  // Photo (image) and Signature slots depict the OLD head, so they
  // must not ride along to the new head — the next Auto-Fill would
  // upload her photo as the new head's. The House Photo is the
  // household's, so it stays; nominee slots (if any) stay too. The
  // new head has no photo yet — pull or upload hers.
  if (Array.isArray(state.pulledImages)) {
    state.pulledImages = state.pulledImages.filter((im) => im && im.slot !== 'image' && im.slot !== 'signature');
  }
  // (v4.9.77) Corrections follow the PERSON, not the role — see the
  // comment above makeMemberHead. The old head's head-corrections and
  // head_options become member corrections keyed by her NID/BRN; the
  // new head's member corrections become head corrections and
  // head_options. Any other member's corrections are kept as-is.
  const oldHeadIdKey = String(oldHead.nid_or_brn || oldHead.nid || oldHead.brn_id || '').replace(/\s+/g, '');
  const newHeadIdKey = String(newHead.nid_or_brn || newHead.nid || newHead.brn_id || '').replace(/\s+/g, '');
  const nextMembers = (data.corrections && data.corrections.members) ? { ...data.corrections.members } : {};
  let nextHead = null;
  const oldHeadCorr = (data.corrections && data.corrections.head) || null;
  const oldHeadOpts = (data.form_defaults && data.form_defaults.head_options) || null;
  if (oldHeadIdKey && (oldHeadCorr || oldHeadOpts)) {
    const mc = { ...(nextMembers[oldHeadIdKey] || {}) };
    const edu = oldHeadCorr && oldHeadCorr.education_status_id !== undefined ? oldHeadCorr.education_status_id : (oldHeadOpts && oldHeadOpts.education_status);
    if (edu !== undefined && edu !== null && String(edu).trim() !== '') mc.education_status_id = Number(edu);
    const prof = oldHeadCorr && oldHeadCorr.profession !== undefined ? oldHeadCorr.profession : (oldHeadOpts && oldHeadOpts.profession);
    if (prof !== undefined && prof !== null && String(prof).trim() !== '') {
      const conv = livelihoodForHeadProfession(prof);
      if (conv !== undefined) mc.livelihood_profession_id = conv;
    }
    const mar = oldHeadCorr && oldHeadCorr.marital_status !== undefined ? oldHeadCorr.marital_status : (oldHeadOpts && oldHeadOpts.marital_status);
    if (mar !== undefined && mar !== null && String(mar).trim() !== '') mc.maritial_status_id = Number(mar);
    // Student flag (v4.9.78): follows the PERSON, not the seat — the
    // old head's hand-set flag becomes her member correction.
    if (oldHeadCorr && oldHeadCorr.is_currently_student !== undefined && oldHeadCorr.is_currently_student !== null) mc.is_currently_student = Number(oldHeadCorr.is_currently_student);
    if (Object.keys(mc).length) nextMembers[oldHeadIdKey] = mc;
    else delete nextMembers[oldHeadIdKey];
  }
  const newHeadMemberCorr = (newHeadIdKey && nextMembers[newHeadIdKey]) || null;
  if (newHeadMemberCorr) {
    const hc = {};
    if (newHeadMemberCorr.education_status_id !== undefined && newHeadMemberCorr.education_status_id !== null) hc.education_status_id = Number(newHeadMemberCorr.education_status_id);
    if (newHeadMemberCorr.livelihood_profession_id !== undefined && newHeadMemberCorr.livelihood_profession_id !== null) {
      const conv = headProfessionForLivelihood(newHeadMemberCorr.livelihood_profession_id);
      if (conv !== undefined) hc.profession = conv;
    }
    const newMar = newHeadMemberCorr.maritial_status_id !== undefined ? newHeadMemberCorr.maritial_status_id : newHeadMemberCorr.marital_status;
    if (newMar !== undefined && newMar !== null) hc.marital_status = Number(newMar);
    // Student flag (v4.9.78): follows the PERSON — the new head's
    // hand-set member flag becomes her head correction.
    if (newHeadMemberCorr.is_currently_student !== undefined && newHeadMemberCorr.is_currently_student !== null) hc.is_currently_student = Number(newHeadMemberCorr.is_currently_student);
    if (Object.keys(hc).length) nextHead = hc;
    delete nextMembers[newHeadIdKey];
  }
  const nextCorrections = {};
  if (nextHead) nextCorrections.head = nextHead;
  if (Object.keys(nextMembers).length) nextCorrections.members = nextMembers;
  if (Object.keys(nextCorrections).length) data.corrections = nextCorrections;
  else delete data.corrections;
  // form_defaults.head_options mirrors the head corrections (the
  // persistent copy — the transient corrections are cleared on a
  // successful fill, the options stay). Move them with the person
  // too: the new head's become the options, the old head's are gone
  // (they live on as her member corrections above).
  if (data.form_defaults) {
    if (nextHead) {
      data.form_defaults.head_options = {
        ...(nextHead.education_status_id !== undefined ? { education_status: nextHead.education_status_id } : {}),
        ...(nextHead.profession !== undefined ? { profession: nextHead.profession } : {}),
        ...(nextHead.marital_status !== undefined ? { marital_status: nextHead.marital_status } : {}),
      };
    } else {
      delete data.form_defaults.head_options;
    }
  }
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
  // PMT leftover picks (v4.9.69): the user defaults — kitchen Yes,
  // dining No, land 0.5 acre, diesel 0, LPG 0 (fuel is wood); the
  // home combo is the sticky pick, if any, with its three parts.
  const sticky = stickyHomeCombo();
  const comboParts = (sticky !== null && HOME_COMBOS[sticky]) ? HOME_COMBOS[sticky] : null;
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
      // Student flag (v4.9.78): a blank head is a Housewife (181), so
      // No (0) is the right default; a hand-picked Student (106)
      // flips it to Yes, and the DOB derivation syncs it.
      is_currently_student: 0,
      is_ssnp_covered: 0, facilities_ids: [],
      is_dss_training_or_financial_benefit: 0,
      pmt_kitchen: 297, pmt_dining: 292, pmt_land: 405, pmt_diesel: 596, pmt_lpg: 590,
      pmt_assets: [559, 563, 435, 591],
      home_combo: sticky === null ? undefined : sticky,
      pmt_floor: comboParts ? comboParts.floor : undefined,
      pmt_wall: comboParts ? comboParts.wall : undefined,
      pmt_roof: comboParts ? comboParts.roof : undefined
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
  // (v4.9.84) Fresh start: no extraction has been attempted for this form.
  state.extractionAttempted = false;
  // (v4.9.85) A manual New Form: the Form Photos / Household / 2500
  // gate stays open from the start, so all four cards show.
  state.manualNewForm = true;
  state.lastExtracted = blankFormData();
  renderPreviews('head');
  renderPreviews('other');
  renderExtractedCards(state.lastExtracted);
  // (v4.9.83) Re-render the Form Photos card too, or the previous
  // family's thumbnails stay on screen until some other render.
  renderPulledImages();
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
    is_disabled: 0, health_condition_id: 203,
    // Student flag (v4.9.78): NOT defaulted here — a blank member has
    // no age and no profession yet, so the derivation sets the flag
    // (6-24 => Yes, 0-5 => No) when a DOB is typed. A 0 here would
    // have looked like a hand-set No.
    // Annual income starts at 0 (v4.9.66) — a blank income glows red
    // in the card, and 0 is what the form gets for a non-husband.
    estimate_annual_income: 0,
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

  // (v4.9.83) Gate: the Household and cash-usage cards stay hidden
  // while the form is still blank — no extraction landed and no photo
  // exists anywhere. The first photo opens the gate, so the
  // fill-while-extracting flow (v4.9.81) is unchanged; the head card
  // and the member form always show.

  // (v4.9.78) opts: { household: true } renders a Step 2 household
  // card (the head record's non-personal fields — mobile, MFS, PMT,
  // Bank, Address, Socio-Economic, General, Nominee) with a static
  // title and the pulled program/PMT detail; { title, tag } set that
  // static header. A household card is tagged data-household, NOT
  // data-head, so the head-card lookups still find the person card.
  const buildEditableCard = (targetObj, fields, isMember = false, memberIdx = 0, opts = {}) => {
    const card = document.createElement('div');
    card.className = 'record-card';
    // Tag the card so a change on one card (a parent's name, a DOB)
    // can refresh another card's inputs in place (v4.9.39).
    if (isMember) card.dataset.memberIdx = String(memberIdx);
    else if (opts.household) card.dataset.household = '1';
    else card.dataset.head = '1';

    const headEl = document.createElement('div');
    headEl.className = 'record-head';
    const titleSpan = document.createElement('span');
    const tagSpan = document.createElement('span');
    tagSpan.className = 'record-tag';

    const refreshHeader = () => {
      // A household card has a fixed title — it is not a person.
      if (opts.title) {
        titleSpan.textContent = opts.title;
        tagSpan.textContent = opts.tag || '';
        return;
      }
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

    // (v38) Section headers: a field with f.section starts a new
    // section when the section changes. The header is only inserted
    // when the first field of that section actually renders, so a
    // section whose fields are all hidden (e.g. no nominee) never
    // shows an empty header.
    let lastSection = null;
    let pendingSection = null;
    fields.forEach((f) => {
      // (v39) A sectioned field only renders when the record carries
      // pulled website data — a hand-typed New Form has none, so its
      // household card stays the always-shown fields only (mobile,
      // MFS, PMT picks, score). Typing a value into a section field
      // by hand brings that section up, since the record then has
      // the data.
      if (f.section && !hasPulledSections(targetObj)) return;
      if (f.hideWhenEmpty && (targetObj[f.key] === undefined || targetObj[f.key] === null || String(targetObj[f.key]).trim() === '')) return;
      if (f.section && f.section !== lastSection) pendingSection = f.section;
      if (pendingSection) {
        const sec = document.createElement('div');
        sec.className = 'record-section';
        sec.style.cssText = 'font-size:11px; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:0.04em; padding:10px 2px 2px; border-top:1px solid var(--border); margin-top:6px;';
        sec.textContent = pendingSection;
        body.appendChild(sec);
        lastSection = pendingSection;
        pendingSection = null;
      }
      const r = document.createElement('div');
      r.className = 'record-row';
      r.style.gridTemplateColumns = '105px 1fr auto';

      const kEl = document.createElement('span');
      kEl.className = 'row-key';
      kEl.textContent = f.label;

      // (v4.9.77) Member cards record option changes as member
      // corrections (keyed by the member's NID/BRN), so a corrected
      // value overwrites the form on the next fill; head cards keep
      // recording head corrections.
      const inputEl = createFieldControl(f, targetObj, refreshHeader, body, isMember ? (k, v) => recordMemberCorrection(targetObj, k, v) : recordHeadCorrection);

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
      // PMT fallback (v4.9.69): the separate floor/wall/roof rows only
      // show when the home combination is "other" — a combo pick sets
      // all three, so the separate rows would just repeat it.
      if ((f.key === 'pmt_floor' || f.key === 'pmt_wall' || f.key === 'pmt_roof') && targetObj.home_combo !== HOME_COMBO_OTHER) {
        r.style.display = 'none';
      }
    });

    card.appendChild(body);
    // (v38) Program + PMT answers the pull brings (household card
    // only, v4.9.78 — it moved there with the other non-personal
    // info): a collapsible list, so the form's own answers are
    // visible organised instead of only inside the Raw JSON dump.
    if (opts.showProgramDetail && ((Array.isArray(targetObj.program_fields) && targetObj.program_fields.length) || (Array.isArray(targetObj.pmt_answers) && targetObj.pmt_answers.length))) {
      const det = document.createElement('details');
      det.style.cssText = 'margin:6px 10px 10px; border:1px solid var(--border); border-radius:6px; padding:6px 8px;';
      const sum = document.createElement('summary');
      sum.style.cssText = 'font-size:12px; font-weight:700; cursor:pointer; color:var(--text-main);';
      sum.textContent = 'প্রোগ্রাম ও PMT উত্তর (Program & PMT answers — from the website)';
      det.appendChild(sum);
      const list = document.createElement('div');
      list.style.cssText = 'margin-top:6px; display:flex; flex-direction:column; gap:4px;';
      const addDetailRow = (label, value) => {
        const row = document.createElement('div');
        row.style.cssText = 'display:flex; gap:8px; font-size:12px;';
        const l = document.createElement('span');
        l.style.cssText = 'flex:0 0 55%; color:var(--muted);';
        l.textContent = label;
        const v = document.createElement('span');
        v.style.cssText = 'font-weight:600; color:var(--text-main);';
        v.textContent = value;
        row.append(l, v);
        list.appendChild(row);
      };
      (targetObj.program_fields || []).forEach((pf) => addDetailRow(pf.field_name || `Program field ${pf.field_id}`, pf.value_name || String(pf.value_id ?? '—')));
      (targetObj.pmt_answers || []).forEach((pa) => addDetailRow(pa.question || `প্রশ্ন ${pa.variable_id}`, (pa.answers || []).map((a) => a.name || String(a.id)).join(', ') || '—'));
      det.appendChild(list);
      card.appendChild(det);
    }
    return card;
  };

  // (v4.9.84) People section: hidden after an NID photo lands but
  // before any extraction attempt ends — the head/member cards are
  // blank defaults with no data yet. Household / 2500 below are NOT
  // part of People and follow the formCardsGateOpen rule instead.
  if (peopleCardsVisible(data)) {
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
  }

  // Household / other info (v4.9.78): Step 2 — everything that is
  // NOT one person's personal info, on the head record, in the user's
  // order (mobile + MFS first, then home-made-of, then the rest of
  // the PMT picks + score, then Bank, Address, Permanent Address,
  // Socio-Economic, General, Nominee, and the pulled program/PMT
  // detail). It IS the head record, so its fields still record head
  // corrections, and the payload is unchanged.
  // (v4.9.83) Gated: hidden while the form is still blank.
  const gateOpen = formCardsGateOpen(data);
  if (data.head && gateOpen) container.appendChild(buildEditableCard(data.head, HOUSEHOLD_FIELDS, false, 0, { household: true, title: 'Household & Other Info (পরিবার ও অন্যান্য তথ্য)', tag: 'Mobile • MFS • PMT • Bank • Address', showProgramDetail: true }));

  // Cash usage — the 2500 Tk distribution (v4.9.37).
  // (v4.9.83) Gated: hidden while the form is still blank.
  if (gateOpen) container.appendChild(buildCashUsageCard(data));

  if (data.full_form_dump) {
    renderFullWebsiteTabs(container, data.full_form_dump);
  }

  bindExtractedDataToThumbnails(data);
  // (v4.9.84) The Form Photos card re-evaluates with every cards
  // render, so it can never drift from Household / 2500: extraction
  // landing, import, viewer close and every other render site all
  // re-check its gate here. renderPulledImages only builds DOM and
  // attaches handlers — it never calls back here, so no cycle.
  renderPulledImages();
  syncJsonOutput();
}

const KNOWN_KEY_OPTIONS = {
  verification_type: [{ value: 1, label: 'NID (জাতীয় পরিচয়পত্র)' }, { value: 2, label: 'BRN (জন্ম নিবন্ধন)' }],
  gender: [{ value: 1, label: 'Male (পুরুষ)' }, { value: 2, label: 'Female (মহিলা)' }, { value: 3, label: 'Other (অন্যান্য)' }],
  gender_id: [{ value: 1, label: 'Male (পুরুষ)' }, { value: 2, label: 'Female (মহিলা)' }, { value: 3, label: 'Other (অন্যান্য)' }],
  religion: RELIGION_OPTIONS.map(r => ({ value: r.id, label: r.label })),
  religion_id: RELIGION_OPTIONS.map(r => ({ value: r.id, label: r.label })),
  relationship_id: RELATION_OPTIONS.filter(r => r.id !== null).map(r => ({ value: r.id, label: r.label })),
  relation_id: RELATION_OPTIONS.filter(r => r.id !== null).map(r => ({ value: r.id, label: r.label })),
  is_member_disabled: [{ value: 0, label: 'No (না)' }, { value: 1, label: 'Yes (হ্যাঁ)' }],
  is_disabled: [{ value: 0, label: 'No (না)' }, { value: 1, label: 'Yes (হ্যাঁ)' }],
  disability_type_id: DISABILITY_TYPE_OPTIONS.map(o => ({ value: o.id, label: o.label })),
  health_condition_id: HEALTH_OPTIONS.map(o => ({ value: o.id, label: o.label })),
  mfs_provider_id: MFS_PROVIDER_OPTIONS.map(o => ({ value: o.id, label: o.label })),
  is_gov_job_holder: [{ value: 0, label: 'No (না)' }, { value: 1, label: 'Yes (হ্যাঁ)' }],
  is_ethnic: [{ value: 0, label: 'না (No)' }, { value: 1, label: 'হ্যাঁ (Yes)' }],
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
    return [{ value: 0, label: 'No (না)' }, { value: 1, label: 'Yes (হ্যাঁ)' }];
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
  setStatus(`Extracting with ${model}... — you can fill Household & Cash Usage below meanwhile`, 'loading');

  // (v4.9.84) A new attempt is pending: the People cards hide until
  // it ends (success or failure), unless the record already carries
  // real content.
  state.extractionAttempted = false;
  if (state.lastExtracted) renderExtractedCards(state.lastExtracted);

  extractionController = new AbortController();
  // (v4.9.81) 120 s timeout: a hung call on a slow network ends with
  // an error instead of waiting forever. It aborts through the same
  // controller the Stop button uses.
  let extractionTimedOut = false;
  let landed = false;
  const extractionTimeout = setTimeout(() => {
    extractionTimedOut = true;
    extractionController.abort();
  }, 120000);

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
    // (v4.9.84) The attempt ended with a result: People shows with
    // the extracted data. Set before rendering, so even an empty-head
    // result shows its cards.
    state.extractionAttempted = true;
    landed = true;

    renderExtractedCards(normalized);
    $('autofillBtn').disabled = false;
    const defs = normalized.form_defaults;
    setStatus(`Ready! Total: ${defs.total_members} (Male: ${defs.male_count}, Female: ${defs.female_count}, Child: ${defs.children_under_18}) • ${defs.religion}`, 'ok');
  } catch (err) {
    if (err.name === 'AbortError' && extractionTimedOut) {
      setStatus('Extraction timed out after 2 minutes — check your connection and tap Extract to try again.', 'err');
    } else if (err.name === 'AbortError') {
      setStatus('Extraction cancelled by user.', 'err');
    } else {
      setStatus(`Error: ${err.message}`, 'err');
    }
  } finally {
    clearTimeout(extractionTimeout);
    $('extractBtn').style.display = 'inline-flex';
    $('stopExtractBtn').style.display = 'none';
    extractionController = null;
    // (v4.9.84) The attempt ended without a result (failure, timeout
    // or Stop): People comes back blank for hand entry.
    state.extractionAttempted = true;
    if (!landed && state.lastExtracted) renderExtractedCards(state.lastExtracted);
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

// Blur-path targets (v4.9.56): the same rule as Auto-Fill, minus the
// people the user already skipped asking about while typing. `skipped`
// is a WeakSet of records (same pattern as manualDocTypePicked) —
// the Auto-Fill path never consults it, so Auto-Fill still asks
// about everyone, every run.
function educationBlurTargets(extracted, skipped) {
  return educationPopupTargets(extracted).filter((t) => {
    if (!skipped) return true;
    const rec = t.key === 'head' ? extracted.head : (extracted.family_members || [])[t.memberIndex];
    return !skipped.has(rec);
  });
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
  // (v4.9.61) The pulled draft photos ride along (from a Pull or an
  // imported JSON export) so Auto-Fill can upload them to the form —
  // before this they only ever displayed in the panel. A shallow copy
  // keeps base64 OUT of lastExtracted (and the Raw JSON view), the way
  // the pull keeps it out; with no pulled photos the key is absent
  // and the fill is unchanged.
  const payload = { ...state.lastExtracted };
  if (Array.isArray(state.pulledImages) && state.pulledImages.length) payload.images = state.pulledImages;
  window.parent.postMessage({ action: 'FILL_VUE_FORM', payload }, '*');
  setStatus('Sent auto-fill data (Members, Gender, Religion, Post Code & Area) to form!', 'ok');
}

// A skip means "not now" for the typing path: remember the record,
// or every blur of that DOB field pops the modal again. The
// Auto-Fill path never consults this set — it asks everyone, every
// run — so a skip here never silences Auto-Fill.
const educationPopupSkipped = new WeakSet();

// Typing path (v4.9.56): the popup used to run only on Auto-Fill, so
// a hand-typed New Form never asked at all — a 27.5+ person's
// education just stayed blank. Ask when a DOB blur leaves someone
// 27.5+ with no education. The fill is NOT sent here (onDone is a
// no-op); the pick lands on the card, and Auto-Fill still asks about
// everyone when it runs.
function maybeAskEducationAfterDob() {
  const modal = $('eduModal');
  if (modal && modal.classList.contains('open')) return false;
  if (!state.lastExtracted) return false;
  const targets = educationBlurTargets(state.lastExtracted, educationPopupSkipped);
  if (!targets.length) return false;
  showEducationPopup(targets, () => {});
  return true;
}

function showEducationPopup(targets, onDone) {
  // onDone defaults to the fill (the Auto-Fill path); the typing
  // path passes a no-op, so answering a DOB question never fills
  // the form by itself.
  const done = typeof onDone === 'function' ? onDone : sendAutofillPayload;
  const modal = $('eduModal');
  // Older panel HTML without the modal: never block the fill.
  if (!modal || !$('eduConfirmBtn') || !$('eduSkipBtn') || !$('closeEduBtn')) { done(); return; }
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
    // A skip is "not now" for the typing path (v4.9.56): remember
    // every target's record, or the next blur of that DOB field pops
    // the modal again. Auto-Fill still asks about everyone.
    if (state.lastExtracted) {
      targets.forEach((t) => {
        const rec = t.key === 'head' ? state.lastExtracted.head : (state.lastExtracted.family_members || [])[t.memberIndex];
        if (rec) educationPopupSkipped.add(rec);
      });
    }
    modal.classList.remove('open');
    done(); // Skip = leave it blank (no age guess for 27+).
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
    // Show the pick on the card right away (v4.9.56): the record
    // changed, but the card's Education select only refreshes on a
    // re-render — and on the typing path there is no re-render.
    targets.forEach((t) => {
      const isHead = t.key === 'head';
      const rec = isHead ? state.lastExtracted.head : (state.lastExtracted.family_members || [])[t.memberIndex];
      if (!rec) return;
      const card = isHead
        ? document.querySelector('.record-card[data-head="1"]')
        : document.querySelector(`.record-card[data-member-idx="${t.memberIndex}"]`);
      if (card) refreshDerivedSelects(card, rec, isHead);
    });
    modal.classList.remove('open');
    done();
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
  // (v38) A pulled photo can also be the site's own https preview URL
  // (gateway) when the byte fetch failed — the import keeps those too,
  // so the photo survives the export/import round-trip.
  const photoCount = state.head.length + state.other.length + (state.pulledImages || []).length;
  const exportObj = {
    ...state.lastExtracted,
    images: {
      head: state.head.map((it) => ({ name: it.name, base64: it.base64 })),
      other: state.other.map((it) => ({ name: it.name, base64: it.base64 })),
      pulled: (state.pulledImages || []).map((it) => ({ slot: it.slot, name: it.name, dataUrl: it.dataUrl, replace: it.replace || undefined, captured: it.captured || undefined }))
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
      // (v38) A pulled photo's dataUrl is a data: URL when the bytes
      // were fetched, or the site's own https preview URL (gateway)
      // when the byte fetch failed — both display in a plain <img>,
      // so keep both. Before v38 only data: URLs were restored, so a
      // photo exported as a gateway URL vanished on import ("we dont
      // get the photo") even though the export had it.
      if (!im || typeof im.dataUrl !== 'string' || !(im.dataUrl.startsWith('data:image') || /^https?:\/\//i.test(im.dataUrl))) return;
      if ((state.pulledImages || []).some((it) => it.dataUrl === im.dataUrl)) return;
      // (v4.9.82) A captured photo keeps its replace/captured marks
      // across the round-trip, so a re-imported capture still
      // replaces the form's photo on Auto-Fill instead of skipping.
      const entry = { slot: im.slot || 'image', name: im.name || 'Photo', dataUrl: im.dataUrl };
      if (im.replace) entry.replace = true;
      if (im.captured) entry.captured = true;
      state.pulledImages.push(entry);
      restored++;
    });
  }
  renderPreviews('head');
  renderPreviews('other');
  renderPulledImages();
  saveSessionState();
  return restored;
}

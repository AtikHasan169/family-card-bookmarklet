'use strict';

const STORAGE_KEY = 'fc_pro_api_key';
const STORAGE_MODEL = 'fc_pro_model';
const CURRENT_VERSION_TAG = 'v2.8-live';

const RELATION_OPTIONS = [
  { value: 'Auto', label: 'Auto (Son / Daughter)', id: null },
  { value: 'Son', label: 'Son (পুত্র)', id: 160 },
  { value: 'Daughter', label: 'Daughter (কন্যা)', id: 161 },
  { value: 'Husband', label: 'Husband (স্বামী)', id: 159 },
  { value: 'Wife', label: 'Wife (স্ত্রী)', id: 186 },
  { value: 'Father', label: 'Father (পিতা)', id: 157 },
  { value: 'Mother', label: 'Mother (মাতা)', id: 158 },
  { value: 'Brother', label: 'Brother (ভাই)', id: 162 },
  { value: 'Sister', label: 'Sister (বোন)', id: 163 },
  { value: 'Father-in-law', label: 'Father-in-law (শ্বশুর)', id: 164 },
  { value: 'Mother-in-law', label: 'Mother-in-law (শাশুড়ি)', id: 165 },
  { value: 'Son-in-law', label: 'Son-in-law (জামাতা)', id: 181 },
  { value: 'Daughter-in-law', label: 'Daughter-in-law (পুত্রবধূ)', id: 182 },
  { value: 'Grandson', label: 'Grandson (নাতি)', id: 183 },
  { value: 'Granddaughter', label: 'Granddaughter (নাতনি)', id: 184 },
  { value: 'Other Relative', label: 'Other Relative (অন্যান্য)', id: 263 }
];

const RELATION_ID_MAP = Object.fromEntries(
  RELATION_OPTIONS.filter((r) => r.id !== null).map((r) => [r.value, r.id])
);

const HEAD_FIELDS = [
  { key: 'name_bn', label: 'Name (BN)' },
  { key: 'name_en', label: 'Name (EN)' },
  { key: 'father_name_bn', label: 'Father (BN)' },
  { key: 'father_name_en', label: 'Father (EN)' },
  { key: 'mother_name_bn', label: 'Mother (BN)' },
  { key: 'mother_name_en', label: 'Mother (EN)' },
  { key: 'nid', label: 'NID / BRN' },
  { key: 'dob', label: 'DOB (YYYY-MM-DD)' }
];

const MEMBER_FIELDS = [
  { key: 'relation', label: 'Relation', type: 'select' },
  { key: 'name_bn', label: 'Name (BN)' },
  { key: 'name_en', label: 'Name (EN)' },
  { key: 'father_name_bn', label: 'Father (BN)' },
  { key: 'mother_name_bn', label: 'Mother (BN)' },
  { key: 'nid_or_brn', label: 'NID / BRN' },
  { key: 'dob', label: 'DOB (YYYY-MM-DD)' }
];

const state = { head: [], other: [], lastExtracted: null };
let nextId = 1, activeCategory = null;

let rawImage = null;
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

document.addEventListener('DOMContentLoaded', () => {
  const savedKey = localStorage.getItem(STORAGE_KEY) || '';
  const savedModel = localStorage.getItem(STORAGE_MODEL) || 'gemini-2.5-flash';
  $('apiKeyInput').value = savedKey;
  $('modelSelect').value = savedModel;

  if (!savedKey) $('settingsDrawer').classList.add('open');

  const navRight = document.querySelector('.nav-right');
  if (navRight && !$('closeSheetBtn')) {
    const closeBtn = document.createElement('button');
    closeBtn.id = 'closeSheetBtn';
    closeBtn.className = 'icon-btn';
    closeBtn.title = 'Close Sheet';
    closeBtn.innerHTML = '✕';
    closeBtn.addEventListener('click', () => {
      window.parent.postMessage({ action: 'FC_CLOSE_SHEET' }, '*');
    });
    navRight.prepend(closeBtn);
  }

  setupNativeCropper();
  setupImageViewerModal();
  setupUpdateChecker();

  window.parent.postMessage({ action: 'FC_CHECK_STATUS' }, '*');
});

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
  const dmy = s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (dmy) return `${dmy[3]}-${dmy[2].padStart(2, '0')}-${dmy[1].padStart(2, '0')}`;
  const ymd = s.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if (ymd) return `${ymd[1]}-${ymd[2].padStart(2, '0')}-${ymd[3].padStart(2, '0')}`;
  return s;
}

function formatEnglishName(rawName) {
  if (!rawName) return '';
  let s = String(rawName).trim().replace(/\s+/g, ' ');
  s = s.replace(/^(?:mosha|mosa|most|mst|mosammat|musammat|মোছাঃ|মোসাঃ|মোছা|মোসা)[:.]?\s+/i, 'MST. ');
  s = s.replace(/^(?:md|mohd|मोঃ|মোঃ|মো)[:.]?\s+/i, 'MD. ');
  return s.toUpperCase();
}

function syncJsonOutput() {
  if (!state.lastExtracted) return;
  $('rawJsonOutput').textContent = JSON.stringify(state.lastExtracted, null, 2);
}

function addImage(category, base64, name) {
  state[category].push({
    id: nextId++,
    base64,
    name: name || 'Card.jpg',
    relation: 'Auto',
    boundRef: null
  });
  renderPreviews(category);
}

function removeImage(category, id) {
  state[category] = state[category].filter((item) => item.id !== id);
  renderPreviews(category);
}

function moveImage(category, idx, dir) {
  const list = state[category];
  const target = idx + dir;
  if (target < 0 || target >= list.length) return;
  [list[idx], list[target]] = [list[target], list[idx]];
  renderPreviews(category);
}

function setupUpdateChecker() {
  const updateBtn = $('updateCheckBtn');
  if (!updateBtn) return;

  updateBtn.addEventListener('click', async () => {
    const originalText = updateBtn.textContent;
    updateBtn.textContent = 'Checking...';
    updateBtn.disabled = true;

    try {
      // Force absolute cache-busting with a unique query param and reload instruction
      const cleanUrl = location.href.split('?')[0];
      const checkUrl = `${cleanUrl}?update_check=${Date.now()}`;
      
      const res = await fetch(checkUrl, { 
        cache: 'reload',
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate', 'Pragma': 'no-cache' }
      });

      if (res.ok) {
        setStatus(`Family Card Pro is Up to Date (${CURRENT_VERSION_TAG})!`, 'ok');
        updateBtn.textContent = 'Up to Date ✓';
        updateBtn.style.background = '#059669';
        updateBtn.style.color = '#ffffff';
        
        setTimeout(() => {
          updateBtn.textContent = originalText;
          updateBtn.disabled = false;
          updateBtn.style.background = '';
          updateBtn.style.color = '';
        }, 2500);
      } else {
        throw new Error('Server returned ' + res.status);
      }
    } catch (err) {
      setStatus('Update check failed. Check connection.', 'err');
      updateBtn.textContent = 'Error';
      updateBtn.style.background = '#dc2626';
      updateBtn.style.color = '#ffffff';
      
      setTimeout(() => {
        updateBtn.textContent = originalText;
        updateBtn.disabled = false;
        updateBtn.style.background = '';
        updateBtn.style.color = '';
      }, 2500);
    }
  });
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

      <div style="width:100%; max-height:42vh; overflow:auto; display:flex; align-items:center; justify-content:center; border-radius:8px;">
        <img id="fcViewerImg" style="max-width:100%; max-height:42vh; object-fit:contain; transition:transform 0.12s ease; transform-origin:center center;">
      </div>

      <div id="fcViewerMeta" style="width:100%; background:#18181b; color:#f8fafc; padding:12px; border-radius:10px; border:1px solid #27272a; font-size:12px; box-shadow:0 10px 25px rgba(0,0,0,0.5); max-height:46vh; overflow-y:auto;"></div>
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

  if (item.boundRef && state.lastExtracted) {
    const isHead = item.boundRef.type === 'head';
    const targetObj = isHead ? state.lastExtracted.head : state.lastExtracted.family_members[item.boundRef.index];

    if (targetObj) {
      $('fcViewerTitle').textContent = isHead ? 'Primary Applicant (Wife) — Edit' : `Member #${item.boundRef.index + 2} (${targetObj.relation}) — Edit`;
      const fields = isHead ? HEAD_FIELDS : MEMBER_FIELDS;
      const headerNote = document.createElement('div');
      headerNote.style.cssText = 'font-size:11px; color:#94a3b8; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center;';
      headerNote.innerHTML = '<span>Edit any field below — auto-saves to form payload</span><span style="color:#10b981; font-weight:600;">● Live Sync</span>';
      metaBox.appendChild(headerNote);

      const formList = document.createElement('div');
      formList.style.cssText = 'display:flex; flex-direction:column; gap:7px;';

      fields.forEach((f) => {
        const row = document.createElement('div');
        row.style.cssText = 'display:grid; grid-template-columns:105px 1fr auto; align-items:center; gap:6px;';

        const lbl = document.createElement('label');
        lbl.style.cssText = 'color:#a1a1aa; font-size:11px; font-weight:500;';
        lbl.textContent = f.label;

        let inputEl;
        if (f.type === 'select') {
          inputEl = document.createElement('select');
          inputEl.style.cssText = 'width:100%; padding:5px 8px; background:#09090b; color:#fff; border:1px solid #3f3f46; border-radius:5px; font-size:12px;';
          RELATION_OPTIONS.filter((r) => r.id !== null).forEach((opt) => {
            const o = document.createElement('option');
            o.value = opt.value;
            o.textContent = opt.label;
            inputEl.appendChild(o);
          });
          inputEl.value = targetObj[f.key] || 'Son';
          inputEl.addEventListener('change', (e) => {
            targetObj.relation = e.target.value;
            targetObj.relationship_id = RELATION_ID_MAP[e.target.value] || 263;
            $('fcViewerTitle').textContent = `Member #${item.boundRef.index + 2} (${targetObj.relation}) — Edit`;
            syncJsonOutput();
          });
        } else {
          inputEl = document.createElement('input');
          inputEl.type = 'text';
          inputEl.value = targetObj[f.key] || '';
          inputEl.placeholder = '—';
          inputEl.style.cssText = 'padding:4px 8px; font-size:12.5px; font-weight:550; border:1px solid transparent; background:transparent; border-radius:5px; width:100%;';
          
          if (f.key.endsWith('_en')) inputEl.style.textTransform = 'uppercase';

          inputEl.addEventListener('focus', () => {
            inputEl.style.borderColor = '#bfdbfe';
            inputEl.style.background = '#eff6ff';
          });
          
          inputEl.addEventListener('blur', () => {
            inputEl.style.borderColor = 'transparent';
            inputEl.style.background = 'transparent';
            if (f.key === 'dob') {
              targetObj.dob = normalizeDob(inputEl.value);
              inputEl.value = targetObj.dob;
              syncJsonOutput();
            }
          });
          
          inputEl.addEventListener('input', () => {
            let val = inputEl.value;
            if (f.key === 'nid' || f.key === 'nid_or_brn') val = toEnglishDigits(val).replace(/\s+/g, '');
            else if (f.key.endsWith('_en')) val = val.toUpperCase();
            targetObj[f.key] = val;
            syncJsonOutput();
          });
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

      metaBox.appendChild(formList);
      modal.style.display = 'flex';
      return;
    }
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
    const card = document.createElement('div');
    card.className = `thumb-item${item.boundRef ? ' has-data' : ''}`;

    const img = document.createElement('img');
    img.src = `data:image/jpeg;base64,${item.base64}`;
    img.title = 'Tap to view photo and edit extracted data';
    img.style.cursor = 'pointer';
    img.addEventListener('click', () => showImageViewer(item));
    card.appendChild(img);

    const del = document.createElement('button');
    del.type = 'button';
    del.className = 'thumb-remove';
    del.textContent = '×';
    del.addEventListener('click', () => removeImage(category, item.id));
    card.appendChild(del);

    const bar = document.createElement('div');
    bar.className = 'thumb-bar';
    const label = document.createElement('span');
    label.className = 'thumb-label';
    label.textContent = `${idx + 1}. ${item.boundRef ? '✓ ' : ''}${item.name}`;

    const moves = document.createElement('div');
    moves.className = 'thumb-moves';
    const left = document.createElement('button');
    left.type = 'button';
    left.textContent = '←';
    left.disabled = idx === 0;
    left.addEventListener('click', () => moveImage(category, idx, -1));

    const right = document.createElement('button');
    right.type = 'button';
    right.textContent = '→';
    right.disabled = idx === state[category].length - 1;
    right.addEventListener('click', () => moveImage(category, idx, 1));

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

async function handleUpload(e, category) {
  const files = Array.from(e.target.files || []);
  if (!files.length) return;
  for (const file of files) {
    if (!file.type.startsWith('image/')) continue;
    try {
      const b64 = await fileToBase64(file);
      addImage(category, b64, file.name);
    } catch (err) {
      setStatus(err.message, 'err');
    }
  }
  e.target.value = '';
  setStatus('Images added successfully.', 'ok');
}

function openCamera(category) {
  activeCategory = category;
  activeCropItem = null;
  const input = $('cameraInput');
  input.value = '';
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
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
          $('cropModal').classList.add('open');
          drawCropCanvas();
        };
        rawImage.src = evt.target.result;
      };
      reader.readAsDataURL(file);
    }
  };
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
      
      if ($('fcViewerModal').style.display !== 'none') {
        $('fcViewerImg').src = `data:image/jpeg;base64,${b64}`;
      } else {
        $('fcViewerModal').style.display = 'flex';
      }
      
      setStatus('Image cropped and updated.', 'ok');
      activeCropItem = null;
    } else if (activeCategory) {
      addImage(activeCategory, b64, 'Live_Zoom_Crop.jpg');
      setStatus('Cropped & zoomed photo added.', 'ok');
      activeCategory = null;
    }
  });
}

function buildPrompt() {
  const allowedRelations = RELATION_OPTIONS.filter((r) => r.id !== null).map((r) => `"${r.value}"`).join(', ');
  return `Extract Bangladeshi NID and Birth Registration (BRN) data from the provided images into strict JSON.

DOCUMENT ANALYSIS & IDENTIFIER RULES:
- Inspect each uploaded card image to automatically determine if it is a National ID (NID) or a Birth Certificate (BRN).
- If it is an NID, extract the 10, 13, or 17-digit number into 'nid' (or 'nid_or_brn').
- If it is a Birth Certificate, extract the Birth Registration Number into 'nid_or_brn'. 
- BRN & DOB ACCURACY: Birth Certificates often have multiple dates. Extract ONLY the Date of Birth (জন্ম তারিখ). Ignore Date of Registration (নিবন্ধন তারিখ) and Date of Issuance (প্রদানের তারিখ).

CRITICAL ROLE RULE:
- The system for fc.bhata.gov.bd requires the Primary Applicant ('head') to be the WIFE (Female). 
- Look at all uploaded ID cards in Section 1. Find the female cardholder (whose name starts with মোছাঃ, মোসাঃ, MST., or indicates a female name). She MUST be assigned as 'head'.
- The Husband (whose name starts with মোঃ, MD., etc.) MUST be placed as the FIRST item in 'family_members' with relation "Husband". Never assign a male as 'head'.

IMAGE TRACKING RULE:
- Each image is labeled with an ID tag like "S1_1", "S1_2", "S2_1", etc.
- In both "head" and each object in "family_members", include a "source_images" array listing all image tags belonging to that person.

EXTRACTION RULES:
1. PRIMARY APPLICANT (WIFE = 'head'):
   - Extract name_bn, name_en, father_name_bn, father_name_en, mother_name_bn, mother_name_en, nid, dob, and source_images.
2. HUSBAND & FAMILY MEMBERS (family_members):
   - First member must be "Husband". Extract name_bn, name_en, father_name_bn, mother_name_bn, nid_or_brn, dob, and source_images.
   - For children, choose correct relationship from: ${allowedRelations}.
3. ENGLISH NAME & FORMATTING:
   - Always transliterate "মোঃ" or "মো:" as "MD." and "মোছাঃ" or "মোসাঃ" as "MST."
   - All numbers and dates must use English digits (0-9) in YYYY-MM-DD format.

JSON SCHEMA:
{
  "head": {
    "name_bn": "", "name_en": "", "father_name_bn": "", "father_name_en": "", "mother_name_bn": "", "mother_name_en": "", "nid": "", "dob": "", "source_images": ["S1_1"]
  },
  "family_members": [
    {
      "relation": "Son", "name_bn": "", "name_en": "", "father_name_bn": "", "mother_name_bn": "", "nid_or_brn": "", "dob": "", "is_disabled": 0, "source_images": ["S1_2"]
    }
  ]
}`;
}

function normalizeOutput(raw) {
  const s = (v) => (v == null ? '' : String(v).trim());
  const h = raw?.head || {};
  const head = {
    name_bn: s(h.name_bn),
    name_en: formatEnglishName(h.name_en),
    father_name_bn: s(h.father_name_bn),
    father_name_en: formatEnglishName(h.father_name_en),
    mother_name_bn: s(h.mother_name_bn),
    mother_name_en: formatEnglishName(h.mother_name_en),
    nid: toEnglishDigits(s(h.nid)).replace(/\s+/g, ''),
    dob: normalizeDob(h.dob),
    source_images: Array.isArray(h.source_images) ? h.source_images : []
  };

  const members = Array.isArray(raw?.family_members) ? raw.family_members : [];
  const deduped = [];
  const seen = new Map();

  for (const m of members) {
    let rel = s(m?.relation);
    if (!RELATION_ID_MAP[rel]) rel = 'Son';

    const entry = {
      relation: rel,
      relationship_id: RELATION_ID_MAP[rel] || 263,
      name_bn: s(m?.name_bn),
      name_en: formatEnglishName(m?.name_en),
      father_name_bn: s(m?.father_name_bn),
      mother_name_bn: s(m?.mother_name_bn),
      nid_or_brn: toEnglishDigits(s(m?.nid_or_brn)).replace(/\s+/g, ''),
      dob: normalizeDob(m?.dob),
      is_disabled: Number(m?.is_disabled) === 1 ? 1 : 0,
      source_images: Array.isArray(m?.source_images) ? m.source_images : []
    };

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

  deduped.sort((a, b) => {
    if (a.relation === 'Husband' && b.relation !== 'Husband') return -1;
    if (b.relation === 'Husband' && a.relation !== 'Husband') return 1;
    if (a.dob && b.dob) return a.dob.localeCompare(b.dob);
    return 0;
  });

  return { head, family_members: deduped };
}

async function copyTextSafe(val) {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(val);
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = val;
      textarea.style.position = 'fixed';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
  } catch (err) {
    prompt('Copy to clipboard:', val);
  }
}

function bindExtractedDataToThumbnails(data) {
  state.head.forEach((item) => { item.boundRef = null; });
  state.other.forEach((item) => { item.boundRef = null; });

  const tagMap = new Map();
  state.head.forEach((item, idx) => tagMap.set(`S1_${idx + 1}`, item));
  state.other.forEach((item, idx) => tagMap.set(`S2_${idx + 1}`, item));

  if (data.head) {
    const h = data.head;
    const ref = { type: 'head' };
    if (Array.isArray(h.source_images) && h.source_images.length > 0) {
      h.source_images.forEach((tag) => {
        if (tagMap.has(tag)) tagMap.get(tag).boundRef = ref;
      });
    } else if (state.head[0]) {
      state.head[0].boundRef = ref;
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
            tagMap.get(tag).boundRef = ref;
            bound = true;
          }
        });
      }

      if (!bound) {
        if (m.relation === 'Husband') {
          const unboundHeadImg = state.head.find((it) => !it.boundRef) || state.head[1] || state.head[0];
          if (unboundHeadImg) unboundHeadImg.boundRef = ref;
        } else if (state.other[fallbackOtherIdx]) {
          state.other[fallbackOtherIdx].boundRef = ref;
          fallbackOtherIdx++;
        }
      }
    });

    state.head.forEach((item, idx) => {
      if (!item.boundRef && idx > 0 && state.head[idx - 1].boundRef) {
        item.boundRef = state.head[idx - 1].boundRef;
      }
    });
    state.other.forEach((item, idx) => {
      if (!item.boundRef && idx > 0 && state.other[idx - 1].boundRef) {
        item.boundRef = state.other[idx - 1].boundRef;
      }
    });
  }

  renderPreviews('head');
  renderPreviews('other');
}

function renderExtractedCards(data) {
  const container = $('visualCards');
  container.replaceChildren();
  $('resultsWrap').classList.add('visible');

  const buildEditableCard = (title, tag, targetObj, fields, isMember = false, memberIdx = 0) => {
    const card = document.createElement('div');
    card.className = 'record-card';

    const headEl = document.createElement('div');
    headEl.className = 'record-head';
    const titleSpan = document.createElement('span');
    titleSpan.textContent = title;
    const tagSpan = document.createElement('span');
    tagSpan.className = 'record-tag';
    tagSpan.textContent = tag;
    headEl.append(titleSpan, tagSpan);
    card.appendChild(headEl);

    const body = document.createElement('div');
    body.className = 'record-rows';

    fields.forEach((f) => {
      const r = document.createElement('div');
      r.className = 'record-row';
      r.style.gridTemplateColumns = '100px 1fr auto';

      const kEl = document.createElement('span');
      kEl.className = 'row-key';
      kEl.textContent = f.label;

      let inputEl;
      if (f.type === 'select') {
        inputEl = document.createElement('select');
        inputEl.style.cssText = 'padding:4px 8px; font-size:12px; font-weight:600; border:1px solid transparent; background:transparent; cursor:pointer;';
        RELATION_OPTIONS.filter((opt) => opt.id !== null).forEach((opt) => {
          const o = document.createElement('option');
          o.value = opt.value;
          o.textContent = opt.label;
          inputEl.appendChild(o);
        });
        inputEl.value = targetObj[f.key] || 'Son';
        inputEl.addEventListener('change', (e) => {
          targetObj.relation = e.target.value;
          targetObj.relationship_id = RELATION_ID_MAP[e.target.value] || 263;
          if (isMember) {
            titleSpan.textContent = `Member #${memberIdx + 2} — ${targetObj.relation}`;
            tagSpan.textContent = `ID: ${targetObj.relationship_id}`;
          }
          syncJsonOutput();
        });
      } else {
        inputEl = document.createElement('input');
        inputEl.type = 'text';
        inputEl.value = targetObj[f.key] || '';
        inputEl.placeholder = '—';
        inputEl.style.cssText = 'padding:4px 8px; font-size:12.5px; font-weight:550; border:1px solid transparent; background:transparent; border-radius:5px; width:100%;';
        
        if (f.key.endsWith('_en')) inputEl.style.textTransform = 'uppercase';

        inputEl.addEventListener('focus', () => {
          inputEl.style.borderColor = '#bfdbfe';
          inputEl.style.background = '#eff6ff';
        });
        
        inputEl.addEventListener('blur', () => {
          inputEl.style.borderColor = 'transparent';
          inputEl.style.background = 'transparent';
          if (f.key === 'dob') {
            targetObj.dob = normalizeDob(inputEl.value);
            inputEl.value = targetObj.dob;
            syncJsonOutput();
          }
        });
        
        inputEl.addEventListener('input', () => {
          let val = inputEl.value;
          if (f.key === 'nid' || f.key === 'nid_or_brn') val = toEnglishDigits(val).replace(/\s+/g, '');
          else if (f.key.endsWith('_en')) val = val.toUpperCase();
          targetObj[f.key] = val;
          syncJsonOutput();
        });
      }

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

  if (data.head) {
    container.appendChild(
      buildEditableCard('Member #1 — Head (Wife)', 'Primary Applicant', data.head, HEAD_FIELDS, false)
    );
  }

  if (Array.isArray(data.family_members)) {
    data.family_members.forEach((m, i) => {
      container.appendChild(
        buildEditableCard(`Member #${i + 2} — ${m.relation}`, `ID: ${m.relationship_id}`, m, MEMBER_FIELDS, true, i)
      );
    });
  }

  bindExtractedDataToThumbnails(data);
  syncJsonOutput();
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

  localStorage.setItem(STORAGE_KEY, apiKey);
  localStorage.setItem(STORAGE_MODEL, model);

  $('extractBtn').disabled = true;
  setStatus(`Extracting with ${model}...`, 'loading');

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
      })
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
    setStatus(`Ready! Extracted Head + ${normalized.family_members.length} member(s). Tap any thumbnail or field to edit.`, 'ok');
  } catch (err) {
    setStatus(`Error: ${err.message}`, 'err');
  } finally {
    $('extractBtn').disabled = false;
  }
}

function triggerFormAutofill() {
  if (!state.lastExtracted) return;
  window.parent.postMessage({ action: 'FILL_VUE_FORM', payload: state.lastExtracted }, '*');
  setStatus('Sent auto-fill data to form!', 'ok');
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
$('autofillBtn').addEventListener('click', triggerFormAutofill);

$('copyJsonBtn').addEventListener('click', async () => {
  if (!state.lastExtracted) return;
  await copyTextSafe($('rawJsonOutput').textContent);
  setStatus('Raw JSON copied to clipboard.', 'ok');
});

$('clearAllBtn').addEventListener('click', () => {
  state.head = [];
  state.other = [];
  state.lastExtracted = null;
  renderPreviews('head');
  renderPreviews('other');
  $('resultsWrap').classList.remove('visible');
  $('autofillBtn').disabled = true;
  setStatus('Workspace cleared.', 'idle');
});

window.addEventListener('message', (e) => {
  if (e.source !== window.parent || !e.data) return;
  if (e.data.action === 'FC_AUTOFILL_RESPONSE') {
    setStatus(e.data.detail.message, e.data.detail.success ? 'ok' : 'err');
  }
  if (e.data.action === 'FC_STATUS_REPLY') {
    const pill = $('connStatus');
    const txt = $('connText');
    if (e.data.online) {
      pill.classList.add('online');
      txt.textContent = 'Form Ready';
    } else {
      pill.classList.remove('online');
      txt.textContent = 'Page Connected';
    }
  }
  
  if (e.data.action === 'FC_SYNC_FROM_WEB') {
    syncFromWebToPanel(e.data.payload);
  }

  if (e.data.action === 'FC_PULL_RESPONSE') {
    const res = e.data.detail;
    if (res.success && res.payload) {
      state.lastExtracted = res.payload;
      renderExtractedCards(res.payload);
      $('autofillBtn').disabled = false;
      setStatus('Successfully pulled draft from form!', 'ok');
    } else {
      setStatus(res.message || 'Could not pull draft data.', 'err');
    }
  }
});

function syncFromWebToPanel(webData) {
  if (!state.lastExtracted) return; 
  
  let changed = false;
  const s = (v) => (v == null ? '' : String(v).trim());
  
  if (webData.head && state.lastExtracted.head) {
    const h = state.lastExtracted.head;
    const w = webData.head;
    if (s(w.nid) && h.nid !== s(w.nid)) { h.nid = s(w.nid); changed = true; }
    if (s(w.dob) && h.dob !== s(w.dob)) { h.dob = s(w.dob); changed = true; }
    if (s(w.name_bn) && h.name_bn !== s(w.name_bn)) { h.name_bn = s(w.name_bn); changed = true; }
    if (s(w.name_en) && h.name_en !== s(w.name_en)) { h.name_en = s(w.name_en); changed = true; }
    if (s(w.father_name_bn) && h.father_name_bn !== s(w.father_name_bn)) { h.father_name_bn = s(w.father_name_bn); changed = true; }
    if (s(w.father_name_en) && h.father_name_en !== s(w.father_name_en)) { h.father_name_en = s(w.father_name_en); changed = true; }
    if (s(w.mother_name_bn) && h.mother_name_bn !== s(w.mother_name_bn)) { h.mother_name_bn = s(w.mother_name_bn); changed = true; }
    if (s(w.mother_name_en) && h.mother_name_en !== s(w.mother_name_en)) { h.mother_name_en = s(w.mother_name_en); changed = true; }
  }

  if (webData.members && Array.isArray(state.lastExtracted.family_members)) {
    state.lastExtracted.family_members.forEach((m, idx) => {
      const w = webData.members[idx + 1];
      if (w) {
         if (s(w.nid_or_brn) && m.nid_or_brn !== s(w.nid_or_brn)) { m.nid_or_brn = s(w.nid_or_brn); changed = true; }
         if (s(w.dob) && m.dob !== s(w.dob)) { m.dob = s(w.dob); changed = true; }
         if (s(w.name_bn) && m.name_bn !== s(w.name_bn)) { m.name_bn = s(w.name_bn); changed = true; }
         if (s(w.name_en) && m.name_en !== s(w.name_en)) { m.name_en = s(w.name_en); changed = true; }
         if (s(w.father_name_bn) && m.father_name_bn !== s(w.father_name_bn)) { m.father_name_bn = s(w.father_name_bn); changed = true; }
         if (s(w.mother_name_bn) && m.mother_name_bn !== s(w.mother_name_bn)) { m.mother_name_bn = s(w.mother_name_bn); changed = true; }
         
         if (w.relationship_id && m.relationship_id != w.relationship_id) {
            m.relationship_id = w.relationship_id;
            const foundRel = RELATION_OPTIONS.find(r => r.id == w.relationship_id);
            if (foundRel) m.relation = foundRel.value;
            changed = true;
         }
      }
    });
  }

  if (changed) {
    syncJsonOutput();
    if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'SELECT')) {
       // Silently synced
    } else {
       renderExtractedCards(state.lastExtracted); 
    }
    setStatus('Webpage edits automatically synced to panel.', 'ok');
  }
}

$('pullFromWebBtn').addEventListener('click', () => {
  window.parent.postMessage({ action: 'FC_PULL_DRAFT' }, '*');
  setStatus('Pulling drafted data from web form...', 'loading');
});

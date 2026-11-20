// Vice Coast Cover Studio — the editor.
//
// Wires the page to the painter: the photo library, the layout and grade
// pickers, the caption fields, the per-panel crop editor, undo/redo,
// shuffle, and the PNG exports. A `?shot=` query hands the page to
// ./shots.js instead, which sets up a fixed scene for a screenshot.

import {
  SIZES, LAYOUTS, GRADES, GAPS, freshState, layoutById, gradeById,
  paintPoster, paintAt,
} from './cover.js';
import { runShot } from './shots.js';

const SAMPLES = [
  { file: 'boulevard.jpg', label: 'Boulevard' },
  { file: 'pier.jpg', label: 'Pier' },
  { file: 'woman-car.jpg', label: 'Convertible' },
  { file: 'man-rooftop.jpg', label: 'Rooftop' },
];
const MAX_UPLOADS = 4;

const $ = (id) => document.getElementById(id);
const canvas = $('poster');
const statusEl = $('status');

let library = [];
let state = freshState();
let selected = 0;
let boxes = [];
let undoStack = [];
let redoStack = [];

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`could not load ${url}`));
    img.src = url;
  });
}

function say(text) {
  statusEl.textContent = text;
}

function snapshot() {
  return JSON.stringify(state);
}

function commit() {
  undoStack.push(snapshot());
  if (undoStack.length > 60) undoStack.shift();
  redoStack = [];
  render();
}

function restore(json) {
  state = JSON.parse(json);
  if (selected >= layoutById(state.layout).slots) selected = 0;
  render();
}

function undo() {
  if (!undoStack.length) { say('Nothing to undo yet.'); return; }
  redoStack.push(snapshot());
  restore(undoStack.pop());
  say('Undid that change.');
}

function redo() {
  if (!redoStack.length) { say('Nothing to redo yet.'); return; }
  undoStack.push(snapshot());
  restore(redoStack.pop());
  say('Redid that change.');
}

// --- rendering ---------------------------------------------------------

function render() {
  boxes = paintPoster(canvas, state, library);
  syncPanelEditor();
  syncToggles();
}

function syncToggles() {
  for (const key of ['tint', 'shadows', 'rays', 'outline', 'grain', 'vignette', 'seal']) {
    const el = $(`opt-${key}`);
    if (el) el.checked = Boolean(state[key]);
  }
  const gapEl = $('gap');
  if (gapEl) gapEl.value = state.gap;
  document.querySelectorAll('#layoutRow button').forEach((b) => {
    b.classList.toggle('on', b.dataset.layout === state.layout);
    b.setAttribute('aria-pressed', b.dataset.layout === state.layout ? 'true' : 'false');
  });
  document.querySelectorAll('#gradeRow button').forEach((b) => {
    b.classList.toggle('on', b.dataset.grade === state.grade);
    b.setAttribute('aria-pressed', b.dataset.grade === state.grade ? 'true' : 'false');
  });
  document.querySelectorAll('#heatRow button').forEach((b, i) => {
    b.classList.toggle('on', i < state.heat);
  });
}

// --- pickers -----------------------------------------------------------

function buildPicker(container, items, key, onPick) {
  const host = $(container);
  host.replaceChildren();
  for (const item of items) {
    const b = document.createElement('button');
    b.type = 'button';
    b.dataset[key] = item.id;
    b.textContent = item.name;
    b.addEventListener('click', () => {
      if (state[key] === item.id) return;
      commit();
      state[key] = item.id;
      if (key === 'layout') selected = 0;
      render();
      onPick(item);
    });
    host.append(b);
  }
}

function buildHeat() {
  const host = $('heatRow');
  host.replaceChildren();
  for (let i = 0; i < 5; i += 1) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = '★';
    b.setAttribute('aria-label', `${i + 1} star${i === 0 ? '' : 's'}`);
    b.addEventListener('click', () => {
      commit();
      state.heat = i + 1;
      render();
      say(`Heat set to ${state.heat} of 5.`);
    });
    host.append(b);
  }
}

function buildSizes() {
  const host = $('exportRow');
  host.replaceChildren();
  for (const size of SIZES) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = size.label;
    b.addEventListener('click', () => exportSize(size));
    host.append(b);
  }
}

// --- the per-panel editor ----------------------------------------------

function slot() {
  return state.panels[selected];
}

function syncPanelEditor() {
  const count = layoutById(state.layout).slots;
  $('slotLabel').textContent = `Panel ${selected + 1} of ${count}`;
  const sel = $('slotPhoto');
  sel.replaceChildren();
  library.forEach((entry, i) => {
    const opt = document.createElement('option');
    opt.value = String(i);
    opt.textContent = entry.label;
    sel.append(opt);
  });
  sel.value = String(slot().photo);
  $('zoom').value = String(slot().zoom);
  $('dx').value = String(slot().dx);
  $('dy').value = String(slot().dy);
  $('flipBtn').textContent = slot().flip ? 'Mirrored ✓' : 'Mirror';
  $('fitBtn').textContent = slot().fit === 'fit' ? 'Fit: whole photo' : 'Fill: crop to panel';
}

function editSlot(patch, announce) {
  commit();
  Object.assign(slot(), patch);
  render();
  if (announce) say(announce);
}

// --- exports -----------------------------------------------------------

function download(blob, name) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}

function exportSize(size) {
  const out = paintAt(size.w, size.h, state, library);
  out.toBlob((blob) => {
    if (!blob) { say('That export failed — try again.'); return; }
    download(blob, `vice-coast-${size.w}x${size.h}.png`);
    say(`Saved vice-coast-${size.w}x${size.h}.png`);
  }, 'image/png');
}

async function exportAll() {
  for (const size of SIZES) {
    await new Promise((resolve) => {
      const out = paintAt(size.w, size.h, state, library);
      out.toBlob((blob) => {
        if (blob) download(blob, `vice-coast-${size.w}x${size.h}.png`);
        resolve();
      }, 'image/png');
    });
  }
  say(`Saved all ${SIZES.length} sizes.`);
}

async function copyPng() {
  try {
    const out = paintAt(1080, 1080, state, library);
    const blob = await new Promise((resolve) => out.toBlob(resolve, 'image/png'));
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
    say('Cover copied — paste it anywhere.');
  } catch {
    say('Copy needs clipboard permission — use Export instead.');
  }
}

// --- photos ------------------------------------------------------------

async function addUploads(files) {
  let added = 0;
  for (const file of files) {
    if (!file.type.startsWith('image/')) continue;
    const uploads = library.filter((e) => e.kind === 'upload');
    if (uploads.length >= MAX_UPLOADS) {
      const firstUpload = library.findIndex((e) => e.kind === 'upload');
      if (firstUpload !== -1) library.splice(firstUpload, 1);
    }
    try {
      const img = await loadImage(URL.createObjectURL(file));
      library.push({ img, label: file.name.replace(/\.[^.]+$/, ''), kind: 'upload' });
      added += 1;
    } catch {
      say(`Could not read ${file.name} as a photo.`);
    }
  }
  if (added) {
    commit();
    state.panels.forEach((p) => { if (p.photo >= library.length) p.photo = 0; });
    render();
    say(`Added ${added} photo${added === 1 ? '' : 's'} to the library.`);
  }
}

// --- shuffle / reset ---------------------------------------------------

function shuffle() {
  commit();
  const rnd = Math.random;
  state.layout = LAYOUTS[Math.floor(rnd() * LAYOUTS.length)].id;
  state.grade = GRADES[Math.floor(rnd() * GRADES.length)].id;
  const count = layoutById(state.layout).slots;
  for (let i = 0; i < count; i += 1) {
    state.panels[i].photo = Math.floor(rnd() * library.length);
    state.panels[i].zoom = 1 + rnd() * 0.35;
    state.panels[i].dx = (rnd() - 0.5) * 0.12;
    state.panels[i].dy = (rnd() - 0.5) * 0.12;
    state.panels[i].flip = rnd() < 0.3;
  }
  selected = 0;
  render();
  say(`Shuffled: ${layoutById(state.layout).name} in ${gradeById(state.grade).name}.`);
}

function resetAll() {
  commit();
  state = freshState();
  selected = 0;
  $('titleInput').value = state.title;
  $('subtitleInput').value = state.subtitle;
  $('taglineInput').value = state.tagline;
  $('sealTextInput').value = state.sealText;
  render();
  say('Back to the fresh cover.');
}

// --- wiring ------------------------------------------------------------

function armHistory() {
  // Snapshot the state BEFORE an edit begins, so undo returns to it.
  // (Sliders and text fields mutate live; their change event fires after
  // the fact, so the snapshot has to be taken on focus / pointer down.)
  undoStack.push(snapshot());
  if (undoStack.length > 60) undoStack.shift();
  redoStack = [];
}

function bindText(id, key) {
  $(id).addEventListener('focus', armHistory);
  $(id).addEventListener('input', () => {
    state[key] = $(id).value;
    render();
  });
}

function bindToggle(id, key) {
  $(id).addEventListener('change', () => {
    commit();
    state[key] = $(id).checked;
    render();
  });
}

function bindRange(id, key) {
  $(id).addEventListener('pointerdown', armHistory);
  $(id).addEventListener('input', () => {
    state.panels[selected][key] = Number($(id).value);
    render();
  });
}

function init() {
  buildPicker('layoutRow', LAYOUTS, 'layout', (item) => say(`Layout: ${item.name}.`));
  buildPicker('gradeRow', GRADES, 'grade', (item) => say(`Grade: ${item.name}.`));
  buildHeat();
  buildSizes();

  bindText('titleInput', 'title');
  bindText('subtitleInput', 'subtitle');
  bindText('taglineInput', 'tagline');
  bindText('sealTextInput', 'sealText');
  for (const key of ['tint', 'shadows', 'rays', 'outline', 'grain', 'vignette', 'seal']) {
    bindToggle(`opt-${key}`, key);
  }
  $('gap').addEventListener('change', () => {
    commit();
    state.gap = $('gap').value;
    render();
  });
  $('slotPhoto').addEventListener('change', () => {
    editSlot({ photo: Number($('slotPhoto').value) }, 'Panel photo changed.');
  });
  bindRange('zoom', 'zoom');
  bindRange('dx', 'dx');
  bindRange('dy', 'dy');
  $('flipBtn').addEventListener('click', () => {
    editSlot({ flip: !slot().flip }, slot().flip ? 'Panel un-mirrored.' : 'Panel mirrored.');
  });
  $('fitBtn').addEventListener('click', () => {
    editSlot({ fit: slot().fit === 'fit' ? 'cover' : 'fit' });
  });
  $('prevPanel').addEventListener('click', () => {
    const count = layoutById(state.layout).slots;
    selected = (selected - 1 + count) % count;
    render();
  });
  $('nextPanel').addEventListener('click', () => {
    const count = layoutById(state.layout).slots;
    selected = (selected + 1) % count;
    render();
  });

  canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((event.clientY - rect.top) / rect.height) * canvas.height;
    const hit = boxes.findIndex((b) => {
      if (x < b.x || x > b.x + b.w || y < b.y || y > b.y + b.h) return false;
      // The diagonal split's boxes are whole-canvas triangles, not rects.
      const fx = (x - b.x) / b.w;
      const fy = (y - b.y) / b.h;
      if (b.clip === 'tl') return fx + fy <= 1;
      if (b.clip === 'br') return fx + fy >= 1;
      return true;
    });
    if (hit !== -1) {
      selected = hit;
      render();
      say(`Panel ${hit + 1} selected — crop it below.`);
    }
  });

  $('photoInput').addEventListener('change', (event) => {
    addUploads([...event.target.files]);
    event.target.value = '';
  });
  $('undoBtn').addEventListener('click', undo);
  $('redoBtn').addEventListener('click', redo);
  $('shuffleBtn').addEventListener('click', shuffle);
  $('resetBtn').addEventListener('click', resetAll);
  $('exportAllBtn').addEventListener('click', exportAll);
  $('copyBtn').addEventListener('click', copyPng);

  document.addEventListener('keydown', (event) => {
    if (event.target.matches('input, textarea, select')) return;
    const k = event.key.toLowerCase();
    if (k === 'u') undo();
    else if (k === 'r') redo();
    else if (k === 's') shuffle();
    else if (/^[1-9]$/.test(k) || k === '0') {
      const idx = k === '0' ? 9 : Number(k) - 1;
      if (idx < LAYOUTS.length) {
        commit();
        state.layout = LAYOUTS[idx].id;
        selected = 0;
        render();
        say(`Layout: ${LAYOUTS[idx].name}.`);
      }
    }
  });

  const query = new URLSearchParams(location.search);
  const shot = query.get('shot');
  if (shot) {
    runShot(shot, query, async (photoName, words) => {
      const entry = library.find((e) => e.file === `${photoName}.jpg`);
      state.title = words.title;
      state.subtitle = words.subtitle;
      if (words.layout) state.layout = words.layout;
      if (words.grade) state.grade = words.grade;
      if (words.sealText) state.sealText = words.sealText;
      if (words.rays) state.rays = true;
      if (words.shadows === false) state.shadows = false;
      if (words.tint === false) state.tint = false;
      if (entry) {
        const base = library.indexOf(entry);
        state.panels.forEach((p, i) => { p.photo = (base + i) % library.length; });
      }
      $('titleInput').value = state.title;
      $('subtitleInput').value = state.subtitle;
      render();
    });
  } else {
    render();
  }
}

async function boot() {
  for (const sample of SAMPLES) {
    try {
      const img = await loadImage(`samples/${sample.file}`);
      library.push({ img, label: sample.label, file: sample.file, kind: 'sample' });
    } catch {
      say(`Sample ${sample.file} did not load.`);
    }
  }
  init();
}

boot();

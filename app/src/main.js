// Vice Coast Cover Studio — editor wiring, written fresh in this session.
// Loads the samples, builds the layout / grade / size pickers, keeps the
// controls in sync with the cover state, and handles undo/redo, per-panel
// cropping, export and screenshots. Photos stay in the browser; nothing is
// ever uploaded. A `?shot=` query sets up a fixed scene for a screenshot
// instead (see shots.js).
import { SIZES, GRADES, LAYOUTS, GAPS, defaultState, paintCover, renderCover } from './cover.js';
import { runShot } from './shots.js';

const SAMPLES = [
  { id: 'woman-car', label: 'Woman · convertible', url: 'samples/woman-car.jpg' },
  { id: 'man-rooftop', label: 'Man · rooftop', url: 'samples/man-rooftop.jpg' },
  { id: 'boulevard', label: 'Boulevard', url: 'samples/boulevard.jpg' },
  { id: 'pier', label: 'Pier', url: 'samples/pier.jpg' },
];

const canvas = document.getElementById('cover');
const status = document.getElementById('status');
let state = defaultState();
let photos = []; // {name, img} per slot, up to 4
let selectedPanel = 0;
let history = [];
let future = [];

export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

const snap = () => JSON.stringify(state);
function pushHistory() {
  history.push(snap());
  if (history.length > 50) history.shift();
  future = [];
}
function restore(json) {
  state = JSON.parse(json);
  syncControls();
  redraw();
}
function undo() {
  if (!history.length) return;
  future.push(snap());
  restore(history.pop());
}
function redo() {
  if (!future.length) return;
  history.push(snap());
  restore(future.pop());
}

const currentSize = () => SIZES.find((s) => s.id === state.size) || SIZES[0];

function redraw() {
  const size = currentSize();
  canvas.width = size.w;
  canvas.height = size.h;
  paintCover(canvas, photos.map((p) => p.img), state);
  document.getElementById('size-label').textContent = `${size.w} × ${size.h}`;
}

// Every control that mirrors a piece of state, in one table, so adding a
// control is one line: [element id, read state, write state].
function syncControls() {
  const text = (id, value) => { document.getElementById(id).value = value; };
  const check = (id, value) => { document.getElementById(id).checked = value !== false; };
  text('title', state.title);
  text('subtitle', state.subtitle);
  text('tagline', state.tagline);
  text('burst', state.burst);
  document.getElementById('heat').value = String(state.heat);
  document.getElementById('gap').value = state.gap;
  check('grain', state.grain);
  check('vignette', state.vignette);
  check('frames', state.frames);
  check('outline', state.outline);
  check('rays', state.rays === true);
  check('burstOn', state.burstOn);
  check('tint', state.tint === true);
  check('shadows', state.shadows === true);
  document.getElementById('panel-name').textContent = String(selectedPanel + 1);
  const sel = document.getElementById('panel-photo');
  sel.value = String(state.panelPhotos[selectedPanel] ?? 0);
  document.getElementById('zoom').value = String(state.zooms[selectedPanel] ?? 1);
  document.getElementById('zoom-val').textContent = `${(state.zooms[selectedPanel] ?? 1).toFixed(2)}×`;
  document.getElementById('ox').value = String(state.ox[selectedPanel] ?? 0);
  document.getElementById('oy').value = String(state.oy[selectedPanel] ?? 0);
  document.getElementById('flip').textContent = (state.flips[selectedPanel] ? '↔ Mirrored' : '↔ Mirror');
  document.getElementById('fit').value = state.fits[selectedPanel] ?? 'fill';
  const markActive = (selector, id) => document.querySelectorAll(selector).forEach((b) => b.classList.toggle('active', b.dataset.id === id));
  markActive('#layouts button', state.layout);
  markActive('#grades button', state.grade);
  markActive('#sizes button', state.size);
  renderSlots();
}

function renderSlots() {
  const wrap = document.getElementById('slots');
  wrap.innerHTML = '';
  photos.forEach((p, i) => {
    const d = document.createElement('div');
    d.className = 'slot';
    const img = document.createElement('img');
    img.src = p.img.src;
    img.alt = p.name;
    const name = document.createElement('span');
    name.className = 'name';
    name.textContent = p.name;
    const rm = document.createElement('button');
    rm.type = 'button';
    rm.textContent = '✕';
    rm.addEventListener('click', () => {
      pushHistory();
      photos.splice(i, 1);
      redraw();
      renderSlots();
    });
    d.append(img, name, rm);
    wrap.append(d);
  });
  for (let i = photos.length; i < 4; i++) {
    const d = document.createElement('div');
    d.className = 'slot';
    const name = document.createElement('span');
    name.className = 'name';
    name.textContent = `Slot ${i + 1} — empty`;
    d.append(name);
    wrap.append(d);
  }
  const sel = document.getElementById('panel-photo');
  sel.innerHTML = '';
  photos.forEach((p, i) => {
    const o = document.createElement('option');
    o.value = String(i);
    o.textContent = `${i + 1} · ${p.name}`;
    sel.append(o);
  });
}

// One picker row per list: a button per entry, active one highlighted.
function buildPicker(wrapId, entries, onPick, swatch = false) {
  const wrap = document.getElementById(wrapId);
  entries.forEach((entry) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.dataset.id = entry.id;
    b.textContent = entry.name || entry.label;
    if (entry.desc) b.title = entry.desc;
    if (swatch) b.style.setProperty('--sw', entry.stops[1]);
    b.addEventListener('click', () => {
      pushHistory();
      onPick(entry.id);
      syncControls();
      redraw();
    });
    wrap.append(b);
  });
}

function download(canvasEl, name) {
  canvasEl.toBlob((blob) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  }, 'image/png');
}

const fileName = (size) => `vice-coast-${state.layout}-${state.grade}-${size.w}x${size.h}.png`;

async function init() {
  buildPicker('layouts', LAYOUTS, (id) => { state.layout = id; selectedPanel = 0; });
  buildPicker('grades', GRADES, (id) => { state.grade = id; }, true);
  buildPicker('sizes', SIZES, (id) => { state.size = id; });

  // Load the four samples as the starting photos.
  for (const s of SAMPLES) {
    try {
      photos.push({ name: s.label, img: await loadImage(s.url) });
    } catch {
      // A missing sample leaves its slot empty.
    }
  }

  document.getElementById('add-photo').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (photos.length >= 4) {
      status.textContent = 'Four photos is the most — remove one first.';
      return;
    }
    pushHistory();
    photos.push({ name: file.name, img: await loadImage(URL.createObjectURL(file)) });
    renderSlots();
    redraw();
    status.textContent = `Added ${file.name}`;
    e.target.value = '';
  });
  document.getElementById('panel-photo').addEventListener('change', (e) => {
    pushHistory();
    state.panelPhotos[selectedPanel] = Number(e.target.value);
    redraw();
  });
  const bindRange = (id, key) => document.getElementById(id).addEventListener('input', (e) => {
    state[key][selectedPanel] = Number(e.target.value);
    if (id === 'zoom') document.getElementById('zoom-val').textContent = `${Number(e.target.value).toFixed(2)}×`;
    redraw();
  });
  bindRange('zoom', 'zooms');
  bindRange('ox', 'ox');
  bindRange('oy', 'oy');
  ['zoom', 'ox', 'oy'].forEach((id) => document.getElementById(id).addEventListener('change', pushHistory));
  document.getElementById('flip').addEventListener('click', () => {
    pushHistory();
    state.flips[selectedPanel] = !state.flips[selectedPanel];
    syncControls();
    redraw();
  });
  document.getElementById('fit').addEventListener('change', (e) => {
    pushHistory();
    state.fits[selectedPanel] = e.target.value;
    redraw();
  });
  const bindText = (id, key) => document.getElementById(id).addEventListener('input', (e) => {
    state[key] = e.target.value;
    redraw();
  });
  bindText('title', 'title');
  bindText('subtitle', 'subtitle');
  bindText('tagline', 'tagline');
  bindText('burst', 'burst');
  document.getElementById('heat').addEventListener('change', (e) => {
    pushHistory();
    state.heat = Number(e.target.value);
    redraw();
  });
  document.getElementById('gap').addEventListener('change', (e) => {
    pushHistory();
    state.gap = e.target.value;
    redraw();
  });
  const bindCheck = (id, key) => document.getElementById(id).addEventListener('change', (e) => {
    pushHistory();
    state[key] = e.target.checked;
    redraw();
  });
  bindCheck('grain', 'grain');
  bindCheck('vignette', 'vignette');
  bindCheck('frames', 'frames');
  bindCheck('outline', 'outline');
  bindCheck('rays', 'rays');
  bindCheck('burstOn', 'burstOn');
  bindCheck('tint', 'tint');
  bindCheck('shadows', 'shadows');
  document.getElementById('undo').addEventListener('click', undo);
  document.getElementById('redo').addEventListener('click', redo);
  document.getElementById('reset').addEventListener('click', () => {
    pushHistory();
    state = defaultState();
    selectedPanel = 0;
    syncControls();
    redraw();
  });
  document.getElementById('shuffle').addEventListener('click', () => {
    pushHistory();
    state.layout = LAYOUTS[Math.floor(Math.random() * LAYOUTS.length)].id;
    state.grade = GRADES[Math.floor(Math.random() * GRADES.length)].id;
    state.panelPhotos = state.panelPhotos.map(() => Math.floor(Math.random() * Math.max(1, photos.length)));
    syncControls();
    redraw();
  });
  document.getElementById('export').addEventListener('click', () => {
    const size = currentSize();
    const c = renderCover(size.w, size.h, photos.map((p) => p.img), state);
    download(c, fileName(size));
    status.textContent = `Saved ${fileName(size)}`;
  });
  document.getElementById('export-all').addEventListener('click', () => {
    SIZES.forEach((size, i) => setTimeout(() => {
      const c = renderCover(size.w, size.h, photos.map((p) => p.img), state);
      download(c, fileName(size));
    }, i * 400));
    status.textContent = `Exporting all ${SIZES.length} sizes — check your downloads.`;
  });
  document.getElementById('copy-png').addEventListener('click', async () => {
    const size = currentSize();
    const c = renderCover(size.w, size.h, photos.map((p) => p.img), state);
    c.toBlob(async (blob) => {
      try {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        status.textContent = 'Cover copied — paste it anywhere.';
      } catch {
        status.textContent = 'Copy needs clipboard permission — use Export instead.';
      }
    }, 'image/png');
  });
  // Keyboard: U undoes, R redoes (when not typing in a field).
  document.addEventListener('keydown', (e) => {
    if (e.target.matches('input, select, textarea')) return;
    if (e.key === 'u' || e.key === 'U') undo();
    if (e.key === 'r' || e.key === 'R') redo();
  });
  // Click a panel in the preview to select it for cropping.
  canvas.addEventListener('click', (e) => {
    const r = canvas.getBoundingClientRect();
    const fx = (e.clientX - r.left) / r.width;
    const fy = (e.clientY - r.top) / r.height;
    const layout = LAYOUTS.find((l) => l.id === state.layout) || LAYOUTS[0];
    const gap = GAPS[state.gap] ?? GAPS.normal;
    const { panels } = layout.build(gap);
    const hit = panels.findIndex((p) => fx >= p.x && fx <= p.x + p.w && fy >= p.y && fy <= p.y + p.h);
    if (hit >= 0) {
      selectedPanel = hit;
      syncControls();
      status.textContent = `Panel ${hit + 1} selected — crop, mirror or fit it below.`;
    }
  });

  const params = new URLSearchParams(location.search);
  const shot = params.get('shot');
  if (shot) {
    await runShot(shot, params, {
      photos, state,
      apply: (patch) => { Object.assign(state, patch); selectedPanel = 0; syncControls(); },
      redraw,
    });
  } else {
    syncControls();
    // Wait for the vendored fonts before the first paint, so titles are Anton/Pacifico.
    try {
      await Promise.all([document.fonts.load('100px Anton'), document.fonts.load('40px Pacifico')]);
    } catch {
      // Fall back to system fonts.
    }
    redraw();
  }
}

init();

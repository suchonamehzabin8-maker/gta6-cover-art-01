// Vice Coast Cover Studio — page wiring, rebuilt in this session.
// Photos, layouts, grades, lettering, per-panel crop, undo/redo, export.
// A `?shot=` query sets up a fixed scene for a screenshot instead
// (./shots.js). Photos stay in the browser; nothing is ever uploaded.
import { SIZES, GRADES, LAYOUTS, defaultState, paintCover, renderCover } from './cover.js';
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

function snapshot() { return JSON.stringify(state); }
function pushHistory() {
  history.push(snapshot());
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
  future.push(snapshot());
  restore(history.pop());
}
function redo() {
  if (!future.length) return;
  history.push(snapshot());
  restore(future.pop());
}

function currentSize() {
  return SIZES.find((s) => s.id === state.size) || SIZES[0];
}

function redraw() {
  const size = currentSize();
  canvas.width = size.w;
  canvas.height = size.h;
  paintCover(canvas, photos.map((p) => p.img), state);
  document.getElementById('size-label').textContent = `${size.w} × ${size.h}`;
}

function syncControls() {
  document.getElementById('title').value = state.title;
  document.getElementById('subtitle').value = state.subtitle;
  document.getElementById('tagline').value = state.tagline;
  document.getElementById('heat').value = String(state.heat);
  document.getElementById('gap').value = state.gap;
  document.getElementById('grain').checked = state.grain !== false;
  document.getElementById('vignette').checked = state.vignette !== false;
  document.getElementById('frames').checked = state.frames !== false;
  document.getElementById('outline').checked = state.outline !== false;
  document.getElementById('rays').checked = state.rays === true;
  document.getElementById('panel-name').textContent = String(selectedPanel + 1);
  const sel = document.getElementById('panel-photo');
  sel.value = String(state.panelPhotos[selectedPanel] ?? 0);
  document.getElementById('zoom').value = String(state.zooms[selectedPanel] ?? 1);
  document.getElementById('zoom-val').textContent = `${(state.zooms[selectedPanel] ?? 1).toFixed(2)}×`;
  document.getElementById('ox').value = String(state.ox[selectedPanel] ?? 0);
  document.getElementById('oy').value = String(state.oy[selectedPanel] ?? 0);
  document.getElementById('flip').textContent = (state.flips[selectedPanel] ? '↔ Mirrored' : '↔ Mirror');
  document.getElementById('fit').value = state.fits[selectedPanel] ?? 'fill';
  document.querySelectorAll('#layouts button').forEach((b) => b.classList.toggle('active', b.dataset.id === state.layout));
  document.querySelectorAll('#grades button').forEach((b) => b.classList.toggle('active', b.dataset.id === state.grade));
  document.querySelectorAll('#sizes button').forEach((b) => b.classList.toggle('active', b.dataset.id === state.size));
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

function buildChoices() {
  const lw = document.getElementById('layouts');
  LAYOUTS.forEach((l) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.dataset.id = l.id;
    b.textContent = l.name;
    b.title = l.desc;
    b.addEventListener('click', () => {
      pushHistory();
      state.layout = l.id;
      selectedPanel = 0;
      syncControls();
      redraw();
    });
    lw.append(b);
  });
  const gw = document.getElementById('grades');
  GRADES.forEach((g) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.dataset.id = g.id;
    b.textContent = g.name;
    b.style.setProperty('--sw', g.stops[1]);
    b.addEventListener('click', () => {
      pushHistory();
      state.grade = g.id;
      syncControls();
      redraw();
    });
    gw.append(b);
  });
  const sw = document.getElementById('sizes');
  SIZES.forEach((s) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.dataset.id = s.id;
    b.textContent = s.label;
    b.addEventListener('click', () => {
      pushHistory();
      state.size = s.id;
      syncControls();
      redraw();
    });
    sw.append(b);
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

function fileName(size) {
  return `vice-coast-${state.layout}-${state.grade}-${size.w}x${size.h}.png`;
}

async function init() {
  buildChoices();
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
  document.getElementById('zoom').addEventListener('change', pushHistory);
  document.getElementById('ox').addEventListener('change', pushHistory);
  document.getElementById('oy').addEventListener('change', pushHistory);
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
    status.textContent = 'Exporting all 4 sizes — check your downloads.';
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
  // Click a panel in the preview to select it for cropping.
  canvas.addEventListener('click', (e) => {
    const r = canvas.getBoundingClientRect();
    const fx = (e.clientX - r.left) / r.width;
    const fy = (e.clientY - r.top) / r.height;
    const layout = LAYOUTS.find((l) => l.id === state.layout) || LAYOUTS[0];
    const gap = { thin: 0.008, normal: 0.016, wide: 0.032 }[state.gap] ?? 0.016;
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

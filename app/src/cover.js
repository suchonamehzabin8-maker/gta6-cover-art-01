// Vice Coast Cover Studio — the poster painter.
//
// Everything on the cover is drawn here from a plain state object: the
// layout (ten ways to arrange the panels), the grade (ten sunset/neon
// colour recipes), the photos, and the lettering. No Rockstar art, logos or
// fonts anywhere: the lettering is drawn with system font stacks, and the
// photos are the maker's own or model-made samples.
//
// The painter is deterministic: the only randomness is the film grain,
// which comes from a seeded generator, so the same state always paints the
// same pixels.

export const SIZES = [
  { id: 'square', label: 'Square 1080 x 1080', w: 1080, h: 1080 },
  { id: 'portrait', label: 'Portrait 1080 x 1350', w: 1080, h: 1350 },
  { id: 'wide', label: 'Wide 1920 x 1080', w: 1920, h: 1080 },
  { id: 'story', label: 'Story 1080 x 1920', w: 1080, h: 1920 },
  { id: 'link', label: 'Link 1200 x 630', w: 1200, h: 630 },
];

export const GAPS = {
  thin: 6,
  normal: 12,
  wide: 22,
};

// Each grade is a whole mood: the sky behind the panels, the sun, the
// wash laid over every photo, and the colours of the title lettering.
export const GRADES = [
  {
    id: 'sunset', name: 'Vice Sunset',
    sky: ['#2a1140', '#b83a6e', '#ff9a52'], sun: '#ffd76e',
    wash: '#ff5e3a', washAlpha: 0.16, title: ['#fff3c4', '#ff9a3d'], sub: '#ff7ad9',
  },
  {
    id: 'neon', name: 'Neon Night',
    sky: ['#070a24', '#1c0f4d', '#a4138e'], sun: '#ff4fd8',
    wash: '#7b2fff', washAlpha: 0.20, title: ['#eaf6ff', '#54e0ff'], sub: '#ff5ce1',
  },
  {
    id: 'gold', name: 'Palm Gold',
    sky: ['#3a1c00', '#a85e12', '#ffc93d'], sun: '#fff0a0',
    wash: '#ffb400', washAlpha: 0.14, title: ['#fffbe0', '#ffb52e'], sub: '#ffe9a8',
  },
  {
    id: 'teal', name: 'Miami Teal',
    sky: ['#04263b', '#0a6b6b', '#37d6c0'], sun: '#d8fff4',
    wash: '#00b3a6', washAlpha: 0.16, title: ['#eafffa', '#4de8d2'], sub: '#ffd166',
  },
  {
    id: 'haze', name: 'Heat Haze',
    sky: ['#40160f', '#c25a2e', '#ffb37a'], sun: '#ffe9c4',
    wash: '#ff7a45', washAlpha: 0.18, title: ['#fff1dd', '#ff8a4d'], sub: '#ffc2e2',
  },
  {
    id: 'noir', name: 'Noir Pink',
    sky: ['#160a1e', '#4d1038', '#e75480'], sun: '#ffc7dd',
    wash: '#e75480', washAlpha: 0.18, title: ['#ffe3ee', '#ff7fae'], sub: '#f7f7f7',
  },
  {
    id: 'golden', name: 'Golden Hour',
    sky: ['#2e1a05', '#8a4d0f', '#ffcf5e'], sun: '#fff6c8',
    wash: '#ff9d00', washAlpha: 0.15, title: ['#fff8d6', '#ffc53d'], sub: '#ff8fb0',
  },
  {
    id: 'midnight', name: 'Midnight Vice',
    sky: ['#020617', '#131b3d', '#3b2d7a'], sun: '#c9b8ff',
    wash: '#4d3df0', washAlpha: 0.22, title: ['#e6e2ff', '#9d8cff'], sub: '#5ff2e0',
  },
  {
    id: 'lime', name: 'Acid Lime',
    sky: ['#0e2b06', '#3f7a12', '#c6f542'], sun: '#f4ffd2',
    wash: '#8fd400', washAlpha: 0.16, title: ['#f6ffe0', '#b8f53d'], sub: '#ff5fa2',
  },
  {
    id: 'rose', name: 'Rose Dusk',
    sky: ['#2b0a24', '#7a1e54', '#ff8fb0'], sun: '#ffe3ec',
    wash: '#ff5c8a', washAlpha: 0.17, title: ['#fff0f4', '#ff9dbd'], sub: '#ffd166',
  },
];

// A layout turns the canvas size and the frame gap into the panel boxes it
// wants. Each box is {x, y, w, h, rot} in canvas pixels; rot is a tilt in
// degrees around the box centre. `slots` says how many panel slots the
// layout reads from the state.
function gridBoxes(w, h, g, cols, rows) {
  const cw = (w - g * (cols + 1)) / cols;
  const ch = (h - g * (rows + 1)) / rows;
  const out = [];
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      out.push({ x: g + c * (cw + g), y: g + r * (ch + g), w: cw, h: ch, rot: 0 });
    }
  }
  return out;
}

export const LAYOUTS = [
  {
    id: 'nine', name: 'Nine-Panel Grid', slots: 9,
    boxes: (w, h, g) => gridBoxes(w, h, g, 3, 3),
  },
  {
    id: 'hero', name: 'Hero + Three', slots: 4,
    boxes: (w, h, g) => {
      const heroW = w * 0.62 - g * 1.5;
      const sideX = heroW + g * 2;
      const sideW = w - sideX - g;
      const sh = (h - g * 4) / 3;
      return [
        { x: g, y: g, w: heroW, h: h - g * 2, rot: 0 },
        { x: sideX, y: g, w: sideW, h: sh, rot: 0 },
        { x: sideX, y: g * 2 + sh, w: sideW, h: sh, rot: 0 },
        { x: sideX, y: g * 3 + sh * 2, w: sideW, h: sh, rot: 0 },
      ];
    },
  },
  {
    id: 'full', name: 'Full-Bleed', slots: 1,
    boxes: (w, h) => [{ x: 0, y: 0, w, h, rot: 0 }],
  },
  {
    id: 'tilted', name: 'Tilted Snapshots', slots: 3,
    boxes: (w, h, g) => {
      const pw = w * 0.52;
      const ph = h * 0.6;
      return [
        { x: g, y: h * 0.06, w: pw, h: ph, rot: -6 },
        { x: w * 0.24, y: h * 0.2, w: pw, h: ph, rot: 0 },
        { x: w * 0.48 - g, y: h * 0.3, w: pw, h: ph, rot: 6 },
      ];
    },
  },
  {
    id: 'comic', name: 'Comic Strip', slots: 3,
    boxes: (w, h, g) => gridBoxes(w, h, g, 1, 3),
  },
  {
    id: 'four', name: 'Four-Square', slots: 4,
    boxes: (w, h, g) => gridBoxes(w, h, g, 2, 2),
  },
  {
    id: 'diagonal', name: 'Diagonal Split', slots: 2,
    boxes: (w, h) => [
      { x: 0, y: 0, w, h, rot: 0, clip: 'tl' },
      { x: 0, y: 0, w, h, rot: 0, clip: 'br' },
    ],
  },
  {
    id: 'stack', name: 'Poster Stack', slots: 3,
    boxes: (w, h, g) => {
      const cw = w * 0.56;
      const ch = h * 0.74;
      return [
        { x: g, y: h * 0.05, w: cw, h: ch, rot: -4 },
        { x: w * 0.22, y: h * 0.12, w: cw, h: ch, rot: 0 },
        { x: w * 0.44 - g, y: h * 0.19, w: cw, h: ch, rot: 4 },
      ];
    },
  },
  {
    id: 'split', name: 'Split Screen', slots: 2,
    boxes: (w, h, g) => {
      const hw = (w - g * 3) / 2;
      return [
        { x: g, y: g, w: hw, h: h - g * 2, rot: 0 },
        { x: g * 2 + hw, y: g, w: hw, h: h - g * 2, rot: 0 },
      ];
    },
  },
  {
    id: 'marquee', name: 'Marquee', slots: 5,
    boxes: (w, h, g) => {
      const heroH = h * 0.56 - g * 1.5;
      const rowY = heroH + g * 2;
      const rowH = h - rowY - g;
      const sw = (w - g * 5) / 4;
      const out = [{ x: g, y: g, w: w - g * 2, h: heroH, rot: 0 }];
      for (let i = 0; i < 4; i += 1) {
        out.push({ x: g + i * (sw + g), y: rowY, w: sw, h: rowH, rot: 0 });
      }
      return out;
    },
  },
];

export function layoutById(id) {
  return LAYOUTS.find((l) => l.id === id) ?? LAYOUTS[0];
}

export function gradeById(id) {
  return GRADES.find((g) => g.id === id) ?? GRADES[0];
}

function freshSlot(photo) {
  return { photo, zoom: 1, dx: 0, dy: 0, flip: false, fit: 'cover' };
}

// The state a cover starts from: nine panels, the Vice Sunset grade, the
// four samples dealt across the slots, and the default caption.
export function freshState() {
  return {
    layout: 'nine',
    grade: 'sunset',
    title: 'VICE COAST',
    subtitle: 'Sunset Heist',
    tagline: 'LEONIDA · 2026',
    heat: 4,
    seal: true,
    sealText: 'HOT',
    gap: 'normal',
    tint: true,
    shadows: true,
    rays: false,
    outline: true,
    grain: true,
    vignette: true,
    panels: [0, 1, 2, 3, 0, 1, 2, 3, 0].map((p) => freshSlot(p)),
  };
}

// A tiny seeded generator, so the film grain is identical on every run.
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function drawPhotoInto(ctx, img, box, slot) {
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  const bw = box.w;
  const bh = box.h;
  let scale = slot.fit === 'fit'
    ? Math.min(bw / iw, bh / ih)
    : Math.max(bw / iw, bh / ih);
  scale *= slot.zoom || 1;
  const dw = iw * scale;
  const dh = ih * scale;
  const cx = box.x + bw / 2 + (slot.dx || 0) * bw;
  const cy = box.y + bh / 2 + (slot.dy || 0) * bh;
  ctx.save();
  ctx.translate(cx, cy);
  if (slot.flip) ctx.scale(-1, 1);
  ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
  ctx.restore();
}

function drawSky(ctx, w, h, grade, rays) {
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, grade.sky[0]);
  sky.addColorStop(0.55, grade.sky[1]);
  sky.addColorStop(1, grade.sky[2]);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);
  const sx = w * 0.76;
  const sy = h * 0.17;
  const sr = Math.min(w, h) * 0.09;
  if (rays) {
    ctx.save();
    ctx.translate(sx, sy);
    ctx.fillStyle = grade.sun;
    ctx.globalAlpha = 0.35;
    for (let i = 0; i < 12; i += 1) {
      const a = (i / 12) * Math.PI * 2;
      ctx.save();
      ctx.rotate(a);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(sr * 2.6, -sr * 0.16);
      ctx.lineTo(sr * 2.6, sr * 0.16);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  }
  const glow = ctx.createRadialGradient(sx, sy, sr * 0.2, sx, sy, sr * 2.4);
  glow.addColorStop(0, grade.sun);
  glow.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = grade.sun;
  ctx.beginPath();
  ctx.arc(sx, sy, sr, 0, Math.PI * 2);
  ctx.fill();
}

function drawPanels(ctx, w, h, state, grade, library, boxes) {
  const frame = Math.max(4, Math.round(Math.min(w, h) * 0.012));
  const fullBleed = state.layout === 'full';
  boxes.forEach((box, i) => {
    const slot = state.panels[i];
    const img = library[slot?.photo ?? 0]?.img ?? null;
    if (!img) return;
    ctx.save();
    const cx = box.x + box.w / 2;
    const cy = box.y + box.h / 2;
    ctx.translate(cx, cy);
    if (box.rot) ctx.rotate((box.rot * Math.PI) / 180);
    ctx.translate(-cx, -cy);
    if (state.shadows && !fullBleed) {
      ctx.shadowColor = 'rgba(10, 5, 20, 0.5)';
      ctx.shadowBlur = Math.min(w, h) * 0.02;
      ctx.shadowOffsetY = Math.min(w, h) * 0.012;
    }
    if (box.clip === 'tl' || box.clip === 'br') {
      ctx.beginPath();
      if (box.clip === 'tl') {
        ctx.moveTo(0, 0);
        ctx.lineTo(w, 0);
        ctx.lineTo(0, h);
      } else {
        ctx.moveTo(w, h);
        ctx.lineTo(w, 0);
        ctx.lineTo(0, h);
      }
      ctx.closePath();
      ctx.clip();
      drawPhotoInto(ctx, img, box, slot);
      ctx.restore();
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(w, h);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = frame;
      ctx.stroke();
      ctx.restore();
      return;
    }
    if (!fullBleed) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(box.x - frame, box.y - frame, box.w + frame * 2, box.h + frame * 2);
    }
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    ctx.beginPath();
    ctx.rect(box.x, box.y, box.w, box.h);
    ctx.clip();
    if (slot.fit === 'fit') {
      ctx.fillStyle = grade.sky[0];
      ctx.fillRect(box.x, box.y, box.w, box.h);
    }
    drawPhotoInto(ctx, img, box, slot);
    if (state.tint) {
      ctx.globalAlpha = grade.washAlpha;
      ctx.fillStyle = grade.wash;
      ctx.fillRect(box.x, box.y, box.w, box.h);
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  });
}

// The caption block: a halftone title band along the foot, the title in a
// sunset gradient with a dark rim, the neon subtitle under it, and the
// tagline, heat stars and badge sharing the bottom line.
function drawWords(ctx, w, h, state, grade, fullBleed) {
  const bandH = Math.round(h * 0.21);
  const bandY = h - bandH;
  if (fullBleed) {
    const scrim = ctx.createLinearGradient(0, h * 0.55, 0, h);
    scrim.addColorStop(0, 'rgba(10, 4, 20, 0)');
    scrim.addColorStop(1, 'rgba(10, 4, 20, 0.82)');
    ctx.fillStyle = scrim;
    ctx.fillRect(0, h * 0.55, w, h * 0.45);
  } else {
    ctx.fillStyle = 'rgba(16, 6, 28, 0.92)';
    ctx.fillRect(0, bandY, w, bandH);
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.07)';
    const step = Math.max(10, Math.round(w * 0.018));
    for (let y = bandY + step / 2; y < h; y += step) {
      for (let x = step / 2; x < w; x += step) {
        ctx.beginPath();
        ctx.arc(x, y, Math.max(1.5, step * 0.14), 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }
  const title = (state.title || '').trim().toUpperCase();
  if (title) {
    let size = Math.round(h * 0.105);
    const squish = 0.8;
    const measure = (px) => {
      ctx.font = `900 ${px}px 'Liberation Sans', 'Noto Sans', Arial, sans-serif`;
      return ctx.measureText(title).width * squish;
    };
    while (measure(size) > w * 0.92 && size > 14) size -= 2;
    const grad = ctx.createLinearGradient(0, bandY + bandH * 0.08, 0, bandY + bandH * 0.62);
    grad.addColorStop(0, grade.title[0]);
    grad.addColorStop(1, grade.title[1]);
    ctx.save();
    ctx.translate(w / 2, bandY + bandH * 0.42);
    ctx.scale(squish, 1);
    ctx.font = `900 ${size}px 'Liberation Sans', 'Noto Sans', Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (state.outline) {
      ctx.lineWidth = Math.max(2, size * 0.09);
      ctx.lineJoin = 'round';
      ctx.strokeStyle = 'rgba(20, 4, 28, 0.95)';
      ctx.strokeText(title, 0, 0);
    }
    ctx.fillStyle = grad;
    ctx.fillText(title, 0, 0);
    ctx.restore();
  }
  const sub = (state.subtitle || '').trim();
  if (sub) {
    const size = Math.round(h * 0.038);
    ctx.save();
    ctx.font = `italic 700 ${size}px 'Liberation Serif', Georgia, serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = grade.sub;
    ctx.shadowBlur = size * 0.55;
    ctx.fillStyle = grade.sub;
    ctx.fillText(sub, w / 2, bandY + bandH * 0.68);
    ctx.shadowBlur = 0;
    ctx.lineWidth = Math.max(1, size * 0.1);
    ctx.strokeStyle = 'rgba(20, 4, 28, 0.9)';
    ctx.strokeText(sub, w / 2, bandY + bandH * 0.68);
    ctx.fillText(sub, w / 2, bandY + bandH * 0.68);
    ctx.restore();
  }
  const tag = (state.tagline || '').trim();
  const bottomY = bandY + bandH * 0.9;
  ctx.save();
  ctx.font = `700 ${Math.round(h * 0.024)}px 'Liberation Sans', 'Noto Sans', Arial, sans-serif`;
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#f5eefc';
  if (tag) {
    ctx.textAlign = 'left';
    ctx.fillText(tag, w * 0.03, bottomY);
  }
  const starSize = Math.round(h * 0.026);
  const starGap = starSize * 1.5;
  const totalW = starSize * 1.5 * 4 + starSize;
  let sx = w / 2 - totalW / 2;
  ctx.textAlign = 'left';
  for (let i = 0; i < 5; i += 1) {
    ctx.fillStyle = i < state.heat ? '#ffc93d' : 'rgba(255, 255, 255, 0.35)';
    ctx.font = `${starSize}px 'Liberation Sans', Arial, sans-serif`;
    ctx.fillText('★', sx, bottomY);
    sx += starGap;
  }
  ctx.restore();
}

// The starburst seal in the top-right corner, with its own shout inside.
function drawSeal(ctx, w, h, state) {
  if (!state.seal) return;
  const cx = w * 0.9;
  const cy = h * 0.09;
  const r = Math.min(w, h) * 0.075;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-0.12);
  ctx.beginPath();
  const points = 16;
  for (let i = 0; i < points * 2; i += 1) {
    const ang = (i / (points * 2)) * Math.PI * 2;
    const rad = i % 2 === 0 ? r : r * 0.62;
    const x = Math.cos(ang) * rad;
    const y = Math.sin(ang) * rad;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = '#ff2e88';
  ctx.fill();
  ctx.lineWidth = Math.max(2, r * 0.06);
  ctx.strokeStyle = '#ffffff';
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.font = `900 ${Math.round(r * 0.42)}px 'Liberation Sans', 'Noto Sans', Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText((state.sealText || 'HOT').toUpperCase(), 0, 0);
  ctx.restore();
}

function drawFinish(ctx, w, h, state) {
  if (state.grain) {
    const rnd = mulberry32(20261120 + w * 31 + h * 7);
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    const n = Math.round((w * h) / 900);
    for (let i = 0; i < n; i += 1) {
      const x = rnd() * w;
      const y = rnd() * h;
      ctx.fillRect(x, y, 1.5, 1.5);
    }
    ctx.restore();
  }
  if (state.vignette) {
    const vg = ctx.createRadialGradient(
      w / 2, h / 2, Math.min(w, h) * 0.42,
      w / 2, h / 2, Math.max(w, h) * 0.75,
    );
    vg.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vg.addColorStop(1, 'rgba(8, 2, 16, 0.42)');
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, w, h);
  }
}

// Paints the whole poster onto `canvas` and returns the panel boxes the
// layout used, so the editor can hit-test clicks on the preview.
export function paintPoster(canvas, state, library) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  const grade = gradeById(state.grade);
  const layout = layoutById(state.layout);
  const gap = (GAPS[state.gap] ?? GAPS.normal) * (Math.min(w, h) / 1080);
  drawSky(ctx, w, h, grade, state.rays);
  const boxes = layout.boxes(w, h, gap);
  drawPanels(ctx, w, h, state, grade, library, boxes);
  drawWords(ctx, w, h, state, grade, state.layout === 'full');
  drawSeal(ctx, w, h, state);
  drawFinish(ctx, w, h, state);
  return boxes;
}

// Paints the same poster at a fresh size and hands back the canvas, for
// the export buttons.
export function paintAt(w, h, state, library) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  paintPoster(canvas, state, library);
  return canvas;
}

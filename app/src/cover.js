// Vice Coast Cover Studio — cover engine, rebuilt in this session.
// Pure canvas 2D, offline, no libraries. Renders are deterministic: the
// same state always draws the same pixels (the grain uses a fixed seed,
// the sun rays a fixed angle set). Everything here is original: the
// lettering is Anton + Pacifico (SIL OFL, vendored under app/fonts/), the
// photos are the user's own or the four samples shipped with the app, and
// the titles are the user's own words. No Rockstar logo, artwork or font.

export const SIZES = [
  { id: 'square', label: 'Square · 1080 × 1080', w: 1080, h: 1080 },
  { id: 'portrait', label: 'Portrait · 1080 × 1350', w: 1080, h: 1350 },
  { id: 'wide', label: 'Wide · 1920 × 1080', w: 1920, h: 1080 },
  { id: 'story', label: 'Story · 1080 × 1920', w: 1080, h: 1920 },
];

export const GRADES = [
  { id: 'sunset', name: 'Vice Sunset', stops: ['#ffd166', '#ff7a3d', '#ff2e88', '#7b2ff7'] },
  { id: 'neon', name: 'Neon Night', stops: ['#00e5ff', '#ff2e88', '#b5179e', '#1a0b2e'] },
  { id: 'gold', name: 'Palm Gold', stops: ['#fff3b0', '#ffd166', '#ff7a3d', '#8a5a00'] },
  { id: 'teal', name: 'Miami Teal', stops: ['#a7fff0', '#00e5c7', '#0096ff', '#0b2e4f'] },
  { id: 'heat', name: 'Heat Haze', stops: ['#ffe66d', '#ff9a3d', '#ff3d3d', '#3d0b2e'] },
  { id: 'noir', name: 'Noir Pink', stops: ['#ffd6e8', '#ff8fb3', '#b5179e', '#111111'] },
  { id: 'goldenhour', name: 'Golden Hour', stops: ['#fff8d6', '#ffb703', '#fb8500', '#5a3d00'] },
  { id: 'midnight', name: 'Midnight Vice', stops: ['#c4b5fd', '#7c3aed', '#312e81', '#060312'] },
];

// Frame gaps, as a fraction of the canvas width.
export const GAPS = {
  thin: 0.008,
  normal: 0.016,
  wide: 0.032,
};

// A layout is a function (gap) => { panels, title } in unit fractions.
// `rot` tilts a panel in degrees, for snapshot-style panels.
export const LAYOUTS = [
  {
    id: 'nine', name: 'Nine-Panel Grid',
    desc: 'The classic collage: eight photos around a centre title block.',
    build(g) {
      const c = 1 / 3, s = c - g * 2;
      const cell = (col, row) => ({ x: g + col * c, y: g + row * c, w: s, h: s });
      return {
        panels: [cell(0, 0), cell(1, 0), cell(2, 0), cell(0, 1), cell(2, 1), cell(0, 2), cell(1, 2), cell(2, 2)],
        title: cell(1, 1),
      };
    },
  },
  {
    id: 'hero', name: 'Hero + Three',
    desc: 'One big hero photo on top, three panels below, title across the join.',
    build(g) {
      const third = 1 / 3, s = third - g * 2;
      return {
        panels: [
          { x: g, y: g, w: 1 - g * 2, h: 0.60 - g },
          { x: g, y: 0.62, w: s, h: 0.36 }, { x: g + third, y: 0.62, w: s, h: 0.36 }, { x: g + third * 2, y: 0.62, w: s, h: 0.36 },
        ],
        title: { x: 0.05, y: 0.40, w: 0.90, h: 0.20 },
      };
    },
  },
  {
    id: 'fullbleed', name: 'Full-Bleed',
    desc: 'One photo edge to edge, with two inset snapshots on top.',
    build() {
      return {
        panels: [
          { x: 0, y: 0, w: 1, h: 1 },
          { x: 0.04, y: 0.05, w: 0.30, h: 0.24, rot: -4 },
          { x: 0.66, y: 0.05, w: 0.30, h: 0.24, rot: 3 },
        ],
        title: { x: 0.05, y: 0.72, w: 0.90, h: 0.22 },
      };
    },
  },
  {
    id: 'tilted', name: 'Tilted Snapshots',
    desc: 'Three tilted snapshots on a sunset sky, title on top.',
    build() {
      return {
        panels: [
          { x: 0.06, y: 0.30, w: 0.42, h: 0.52, rot: -5 },
          { x: 0.30, y: 0.36, w: 0.42, h: 0.52, rot: 2 },
          { x: 0.54, y: 0.30, w: 0.42, h: 0.52, rot: 5 },
        ],
        title: { x: 0.05, y: 0.03, w: 0.90, h: 0.22 },
      };
    },
  },
  {
    id: 'strip', name: 'Comic Strip',
    desc: 'Three tall panels side by side, title band below.',
    build(g) {
      const third = 1 / 3, s = third - g * 2;
      return {
        panels: [
          { x: g, y: g, w: s, h: 0.70 }, { x: g + third, y: g, w: s, h: 0.70 }, { x: g + third * 2, y: g, w: s, h: 0.70 },
        ],
        title: { x: g, y: 0.73, w: 1 - g * 2, h: 0.25 },
      };
    },
  },
  {
    id: 'grid4', name: 'Four-Square',
    desc: 'Four equal panels with the title bursting from the centre.',
    build(g) {
      const half = 0.5, s = half - g * 2;
      return {
        panels: [
          { x: g, y: g, w: s, h: s }, { x: g + half, y: g, w: s, h: s },
          { x: g, y: g + half, w: s, h: s }, { x: g + half, y: g + half, w: s, h: s },
        ],
        title: { x: 0.22, y: 0.36, w: 0.56, h: 0.28 },
      };
    },
  },
  {
    id: 'diagonal', name: 'Diagonal Split',
    desc: 'Two big photos split on the diagonal, with a thin strip below.',
    build(g) {
      return {
        panels: [
          { x: g, y: g, w: 0.62 - g, h: 0.72 },
          { x: 0.38 + g, y: 0.26, w: 0.62 - g, h: 0.72 },
          { x: g, y: 0.99 - g - 0.0, w: 0, h: 0 },
        ].filter((p) => p.w > 0),
        title: { x: 0.05, y: 0.76, w: 0.90, h: 0.20 },
      };
    },
  },
  {
    id: 'stack', name: 'Poster Stack',
    desc: 'A tall hero on the left, two stacked shots on the right.',
    build(g) {
      return {
        panels: [
          { x: g, y: g, w: 0.58 - g, h: 1 - g * 2 },
          { x: 0.60, y: g, w: 0.40 - g, h: 0.48 - g },
          { x: 0.60, y: 0.50, w: 0.40 - g, h: 0.48 - g },
        ],
        title: { x: 0.05, y: 0.78, w: 0.50, h: 0.19 },
      };
    },
  },
];

export function defaultState() {
  return {
    layout: 'nine', grade: 'sunset', size: 'square',
    title: 'Sunset Heist', subtitle: 'only in Leonida',
    tagline: 'Vice City · Leonida Keys · Grassrivers',
    heat: 4, grain: true, vignette: true, frames: true,
    gap: 'normal', outline: true, rays: false,
    // Per-panel: photo slot, zoom, x/y offset in [-0.5, 0.5], mirror, fit mode.
    panelPhotos: [0, 1, 2, 3, 0, 1, 2, 3],
    zooms: [1, 1, 1, 1, 1, 1, 1, 1],
    ox: [0, 0, 0, 0, 0, 0, 0, 0],
    oy: [0, 0, 0, 0, 0, 0, 0, 0],
    flips: [false, false, false, false, false, false, false, false],
    fits: ['fill', 'fill', 'fill', 'fill', 'fill', 'fill', 'fill', 'fill'],
  };
}

// Small deterministic PRNG (mulberry32) — the grain never changes.
function seededRandom(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Draw one photo into a rect. `fit` is 'fill' (crop to cover) or 'fit'
// (whole photo, letterboxed on the panel colour). `flip` mirrors it.
function paintPanelPhoto(ctx, img, rect, zoom, ox, oy, flip, fit) {
  if (!img) {
    const g = ctx.createLinearGradient(rect.x, rect.y, rect.x + rect.w, rect.y + rect.h);
    g.addColorStop(0, '#3b1d4e'); g.addColorStop(1, '#12081f');
    ctx.fillStyle = g; ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = `bold ${Math.max(14, rect.h * 0.07)}px sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('ADD A PHOTO', rect.x + rect.w / 2, rect.y + rect.h / 2);
    return;
  }
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  const cover = Math.max(rect.w / iw, rect.h / ih);
  const scale = (fit === 'fit' ? Math.min(rect.w / iw, rect.h / ih) : cover) * (zoom || 1);
  const pw = iw * scale;
  const ph = ih * scale;
  const dx = rect.x + (rect.w - pw) / 2 + (ox || 0) * rect.w * 0.4;
  const dy = rect.y + (rect.h - ph) / 2 + (oy || 0) * rect.h * 0.4;
  ctx.save();
  ctx.beginPath(); ctx.rect(rect.x, rect.y, rect.w, rect.h); ctx.clip();
  if (flip) {
    ctx.translate(rect.x * 2 + rect.w, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(img, dx, dy, pw, ph);
  ctx.restore();
}

function paintHalftone(ctx, rect, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#000';
  const step = Math.max(10, rect.w / 28);
  for (let y = rect.y + step / 2; y < rect.y + rect.h; y += step) {
    for (let x = rect.x + step / 2; x < rect.x + rect.w; x += step) {
      const r = step * 0.16 * (0.5 + 0.5 * Math.sin((x + y) / step));
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.restore();
}

function shrinkToFit(ctx, text, maxWidth, startSize, family, weight = '') {
  let size = startSize;
  ctx.font = `${weight} ${size}px ${family}`;
  while (size > 12 && ctx.measureText(text).width > maxWidth) {
    size -= 2;
    ctx.font = `${weight} ${size}px ${family}`;
  }
  return size;
}

function drawFiveStar(ctx, cx, cy, r, fill) {
  ctx.save();
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const ang = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 === 0 ? r : r * 0.45;
    const x = cx + Math.cos(ang) * rr;
    const y = cy + Math.sin(ang) * rr;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = fill; ctx.fill();
  ctx.strokeStyle = '#12081f'; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.restore();
}

function paintLettering(ctx, rect, state, grade, compact) {
  const { title, subtitle, tagline, heat } = state;
  const overlay = state.layout === 'hero' || state.layout === 'fullbleed';
  if (overlay) {
    const g = ctx.createLinearGradient(rect.x, rect.y, rect.x + rect.w, rect.y + rect.h);
    g.addColorStop(0, 'rgba(10,4,20,0.82)');
    g.addColorStop(1, 'rgba(10,4,20,0.55)');
    ctx.fillStyle = g; ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  } else {
    const g = ctx.createLinearGradient(rect.x, rect.y, rect.x + rect.w, rect.y + rect.h);
    g.addColorStop(0, grade.stops[0]);
    g.addColorStop(0.5, grade.stops[1]);
    g.addColorStop(1, grade.stops[2]);
    ctx.fillStyle = g; ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    paintHalftone(ctx, rect, 0.10);
  }
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = Math.max(3, rect.w * 0.012);
  ctx.strokeRect(rect.x + 2, rect.y + 2, rect.w - 4, rect.h - 4);

  const cx = rect.x + rect.w / 2;
  const text = (title || 'SUNSET HEIST').trim().toUpperCase();
  // Split a long title over two lines at a word boundary.
  let lines = [text];
  ctx.font = '100px Anton, sans-serif';
  if (ctx.measureText(text).width > rect.w * 0.92) {
    const words = text.split(' ');
    if (words.length > 1) {
      const mid = Math.ceil(words.length / 2);
      lines = [words.slice(0, mid).join(' '), words.slice(mid).join(' ')];
    }
  }
  const lineH = rect.h * (lines.length > 1 ? 0.30 : 0.44);
  const longest = lines.reduce((a, b) => (a.length > b.length ? a : b));
  const size = shrinkToFit(ctx, longest, rect.w * 0.92, lineH, 'Anton, sans-serif');
  const grad = ctx.createLinearGradient(cx - rect.w / 2, rect.y, cx + rect.w / 2, rect.y + rect.h);
  grad.addColorStop(0, '#fff7d6');
  grad.addColorStop(0.5, '#ffd166');
  grad.addColorStop(1, '#ff7a3d');
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  const startY = rect.y + rect.h * (lines.length > 1 ? 0.24 : 0.38);
  lines.forEach((line, i) => {
    const y = startY + i * lineH;
    ctx.font = `${size}px Anton, sans-serif`;
    if (state.outline !== false) {
      ctx.strokeStyle = '#12081f';
      ctx.lineWidth = Math.max(3, size * 0.10);
      ctx.strokeText(line, cx, y);
    }
    ctx.fillStyle = grad;
    ctx.fillText(line, cx, y);
  });
  // Neon script subtitle.
  const twoLine = lines.length > 1;
  if (subtitle && subtitle.trim()) {
    const sy = rect.y + rect.h * (twoLine ? 0.80 : 0.68);
    const subSize = shrinkToFit(ctx, subtitle.trim(), rect.w * 0.86, rect.h * 0.11, 'Pacifico, cursive');
    ctx.font = `${subSize}px Pacifico, cursive`;
    ctx.fillStyle = '#ff5da2';
    ctx.shadowColor = '#ff2e88';
    ctx.shadowBlur = subSize * 0.5;
    ctx.fillText(subtitle.trim(), cx, sy);
    ctx.shadowBlur = 0;
  }
  // Tagline (skipped when the title took two lines, or when the title
  // block is a short band with no room for a third line of text).
  // In a compact band the stars ride higher, clear of the bottom frame.
  const by = rect.y + rect.h * (compact ? 0.88 : 0.94);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = overlay ? '#ffd166' : '#12081f';
  if (!twoLine && !compact && tagline && tagline.trim()) {
    const tagSize = shrinkToFit(ctx, tagline.trim().toUpperCase(), rect.w * 0.94, Math.max(11, rect.h * 0.065), 'sans-serif', 'bold');
    ctx.font = `bold ${tagSize}px sans-serif`;
    ctx.fillText(tagline.trim().toUpperCase(), cx, rect.y + rect.h * 0.84);
  }
  const starR = Math.max(5, rect.h * 0.038);
  const totalW = 5 * starR * 2.4;
  for (let i = 0; i < 5; i++) {
    const sx = cx - totalW / 2 + i * starR * 2.4 + starR;
    drawFiveStar(ctx, sx, by, starR, i < heat ? '#ffd166' : 'rgba(255,255,255,0.35)');
  }
}

function paintBackdrop(ctx, w, h, grade, rays) {
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, grade.stops[3]);
  sky.addColorStop(0.55, grade.stops[2]);
  sky.addColorStop(1, grade.stops[1]);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);
  // Sun disc in the top corner.
  const sunX = w * 0.88;
  const sunY = h * 0.12;
  const sunR = Math.min(w, h) * 0.09;
  if (rays) {
    ctx.save();
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = grade.stops[0];
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      ctx.save();
      ctx.translate(sunX, sunY);
      ctx.rotate(a);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(sunR * 3.2, -sunR * 0.10);
      ctx.lineTo(sunR * 3.2, sunR * 0.10);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  }
  ctx.save();
  ctx.globalAlpha = 0.55;
  ctx.fillStyle = grade.stops[0];
  ctx.beginPath();
  ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function paintFrame(ctx, rect, w) {
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = Math.max(4, w * 0.008);
  ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
  ctx.strokeStyle = 'rgba(18,8,31,0.9)';
  ctx.lineWidth = 2;
  ctx.strokeRect(rect.x + 5, rect.y + 5, rect.w - 10, rect.h - 10);
}

/** Paint the cover for `state` onto `canvas` (already sized). `photos` is an array of images/null. */
export function paintCover(canvas, photos, state) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  const layout = LAYOUTS.find((l) => l.id === state.layout) || LAYOUTS[0];
  const grade = GRADES.find((g) => g.id === state.grade) || GRADES[0];
  const gap = GAPS[state.gap] ?? GAPS.normal;

  paintBackdrop(ctx, w, h, grade, state.rays);

  const { panels, title } = layout.build(gap);
  panels.forEach((p, i) => {
    const rect = { x: p.x * w, y: p.y * h, w: p.w * w, h: p.h * h };
    const photoIdx = (state.panelPhotos && state.panelPhotos[i]) ?? (i % Math.max(1, photos.length));
    const img = photos[photoIdx] || null;
    const drawArgs = [
      img, rect,
      state.zooms?.[i] ?? 1, state.ox?.[i] ?? 0, state.oy?.[i] ?? 0,
      state.flips?.[i] ?? false, state.fits?.[i] ?? 'fill',
    ];
    if (p.rot) {
      ctx.save();
      ctx.translate(rect.x + rect.w / 2, rect.y + rect.h / 2);
      ctx.rotate((p.rot * Math.PI) / 180);
      ctx.translate(-rect.w / 2, -rect.h / 2);
      paintPanelPhoto(ctx, drawArgs[0], { x: 0, y: 0, w: rect.w, h: rect.h }, drawArgs[2], drawArgs[3], drawArgs[4], drawArgs[5], drawArgs[6]);
      ctx.restore();
      if (state.frames !== false) {
        ctx.save();
        ctx.translate(rect.x + rect.w / 2, rect.y + rect.h / 2);
        ctx.rotate((p.rot * Math.PI) / 180);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = Math.max(4, w * 0.008);
        ctx.strokeRect(-rect.w / 2, -rect.h / 2, rect.w, rect.h);
        ctx.strokeStyle = '#12081f';
        ctx.lineWidth = 2;
        ctx.strokeRect(-rect.w / 2 + 5, -rect.h / 2 + 5, rect.w - 10, rect.h - 10);
        ctx.restore();
      }
    } else {
      paintPanelPhoto(ctx, ...drawArgs);
      if (state.frames !== false) paintFrame(ctx, rect, w);
    }
  });

  // Grade wash over the whole cover.
  const wash = ctx.createLinearGradient(0, 0, w, h);
  wash.addColorStop(0, grade.stops[0]);
  wash.addColorStop(1, grade.stops[2]);
  ctx.globalAlpha = 0.16;
  ctx.globalCompositeOperation = 'overlay';
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, w, h);
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;

  // Title block. Short bands (under a quarter of the canvas height) get
  // the compact treatment: no tagline, so subtitle and stars breathe.
  paintLettering(ctx, { x: title.x * w, y: title.y * h, w: title.w * w, h: title.h * h }, state, grade, title.h < 0.24);

  // Badge ribbon, top-left.
  const badge = 'LEONIDA · 2026';
  ctx.save();
  ctx.translate(w * 0.02, h * 0.045);
  ctx.rotate(-0.03);
  ctx.font = `bold ${Math.max(13, w * 0.016)}px Anton, sans-serif`;
  const bw = ctx.measureText(badge).width + w * 0.03;
  ctx.fillStyle = '#12081f';
  ctx.fillRect(0, 0, bw, h * 0.038);
  ctx.fillStyle = '#ffd166';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(badge, w * 0.015, h * 0.019);
  ctx.restore();

  // Grain (fixed seed: deterministic) + vignette.
  if (state.grain !== false) {
    const rnd = seededRandom(20261119);
    ctx.save();
    ctx.globalAlpha = 0.05;
    ctx.fillStyle = '#000';
    const n = Math.floor((w * h) / 900);
    for (let i = 0; i < n; i++) ctx.fillRect(rnd() * w, rnd() * h, 2, 2);
    ctx.restore();
  }
  if (state.vignette !== false) {
    const v = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.42, w / 2, h / 2, Math.max(w, h) * 0.72);
    v.addColorStop(0, 'rgba(0,0,0,0)');
    v.addColorStop(1, 'rgba(10,4,20,0.38)');
    ctx.fillStyle = v;
    ctx.fillRect(0, 0, w, h);
  }
  // Outer border.
  ctx.strokeStyle = '#12081f';
  ctx.lineWidth = Math.max(6, w * 0.01);
  ctx.strokeRect(0, 0, w, h);
}

// Backwards-compatible alias: the editor calls paintCover.
export const drawCover = paintCover;

/** Render a fresh canvas at (w, h) for the given state. */
export function renderCover(w, h, photos, state) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  paintCover(canvas, photos, state);
  return canvas;
}

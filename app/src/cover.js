// Vice Coast Cover Studio — cover engine, written fresh in this session.
// Plain canvas 2D, offline, no libraries. A render is deterministic: the
// same state always paints the same pixels (the grain draws from a fixed
// seed, the sun rays from a fixed set of angles). Everything drawn here is
// original: the lettering uses Anton + Pacifico (SIL OFL, vendored under
// app/fonts/), the photos are the user's own or the four samples shipped
// with the app, and every caption is the user's own words. No Rockstar
// logo, artwork or font is used anywhere.

export const SIZES = [
  { id: 'square', label: 'Square · 1080 × 1080', w: 1080, h: 1080 },
  { id: 'portrait', label: 'Portrait · 1080 × 1350', w: 1080, h: 1350 },
  { id: 'wide', label: 'Wide · 1920 × 1080', w: 1920, h: 1080 },
  { id: 'story', label: 'Story · 1080 × 1920', w: 1080, h: 1920 },
  { id: 'link', label: 'Link · 1200 × 630', w: 1200, h: 630 },
];

// A grade is four stops: highlight, mid, deep, night. The backdrop blends
// night → deep → mid top to bottom, the title block runs highlight → mid →
// deep, and the wash tints the whole cover with highlight and deep.
export const GRADES = [
  { id: 'sunset', name: 'Vice Sunset', stops: ['#ffd166', '#ff7a3d', '#ff2e88', '#7b2ff7'] },
  { id: 'neon', name: 'Neon Night', stops: ['#00e5ff', '#ff2e88', '#b5179e', '#1a0b2e'] },
  { id: 'gold', name: 'Palm Gold', stops: ['#fff3b0', '#ffd166', '#ff7a3d', '#8a5a00'] },
  { id: 'teal', name: 'Miami Teal', stops: ['#a7fff0', '#00e5c7', '#0096ff', '#0b2e4f'] },
  { id: 'heat', name: 'Heat Haze', stops: ['#ffe66d', '#ff9a3d', '#ff3d3d', '#3d0b2e'] },
  { id: 'noir', name: 'Noir Pink', stops: ['#ffd6e8', '#ff8fb3', '#b5179e', '#111111'] },
  { id: 'goldenhour', name: 'Golden Hour', stops: ['#fff8d6', '#ffb703', '#fb8500', '#5a3d00'] },
  { id: 'midnight', name: 'Midnight Vice', stops: ['#c4b5fd', '#7c3aed', '#312e81', '#060312'] },
  { id: 'acid', name: 'Acid Lime', stops: ['#f7fee7', '#a3e635', '#db2777', '#111827'] },
  { id: 'dusk', name: 'Rose Dusk', stops: ['#ffe4e6', '#fb7185', '#7c3aed', '#1e1b4b'] },
];

// Frame gaps, as a fraction of the canvas width.
export const GAPS = {
  thin: 0.008,
  normal: 0.016,
  wide: 0.032,
};

// Layout geometry lives in unit fractions of the canvas. Two small helpers
// keep the layout table readable: `cell` cuts a grid cell, `band` is a
// plain rectangle. A layout's `build(gap)` returns { panels, title }.
const cell = (g, cols, rows, col, row) => {
  const cw = 1 / cols;
  const ch = 1 / rows;
  return { x: g + col * cw, y: g + row * ch, w: cw - g * 2, h: ch - g * 2 };
};
const band = (x, y, w, h) => ({ x, y, w, h });

export const LAYOUTS = [
  {
    id: 'nine', name: 'Nine-Panel Grid',
    desc: 'The classic collage: eight photos around a centre title block.',
    build(g) {
      const panels = [];
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          if (row === 1 && col === 1) continue;
          panels.push(cell(g, 3, 3, col, row));
        }
      }
      return { panels, title: cell(g, 3, 3, 1, 1) };
    },
  },
  {
    id: 'hero', name: 'Hero + Three',
    desc: 'One big hero photo on top, three panels below, title across the join.',
    build(g) {
      const third = 1 / 3;
      const bottom = (col) => band(g + col * third, 0.62, third - g * 2, 0.36);
      return {
        panels: [band(g, g, 1 - g * 2, 0.60 - g), bottom(0), bottom(1), bottom(2)],
        title: band(0.05, 0.40, 0.90, 0.20),
      };
    },
  },
  {
    id: 'fullbleed', name: 'Full-Bleed',
    desc: 'One photo edge to edge, with two inset snapshots on top.',
    build() {
      return {
        panels: [
          band(0, 0, 1, 1),
          { ...band(0.04, 0.05, 0.30, 0.24), rot: -4 },
          { ...band(0.66, 0.05, 0.30, 0.24), rot: 3 },
        ],
        title: band(0.05, 0.72, 0.90, 0.22),
      };
    },
  },
  {
    id: 'tilted', name: 'Tilted Snapshots',
    desc: 'Three tilted snapshots on a sunset sky, title on top.',
    build() {
      return {
        panels: [
          { ...band(0.06, 0.30, 0.42, 0.52), rot: -5 },
          { ...band(0.30, 0.36, 0.42, 0.52), rot: 2 },
          { ...band(0.54, 0.30, 0.42, 0.52), rot: 5 },
        ],
        title: band(0.05, 0.03, 0.90, 0.22),
      };
    },
  },
  {
    id: 'strip', name: 'Comic Strip',
    desc: 'Three tall panels side by side, title band below.',
    build(g) {
      const third = 1 / 3;
      const tall = (col) => band(g + col * third, g, third - g * 2, 0.70);
      return {
        panels: [tall(0), tall(1), tall(2)],
        title: band(g, 0.73, 1 - g * 2, 0.25),
      };
    },
  },
  {
    id: 'grid4', name: 'Four-Square',
    desc: 'Four equal panels with the title bursting from the centre.',
    build(g) {
      return {
        panels: [
          cell(g, 2, 2, 0, 0), cell(g, 2, 2, 1, 0),
          cell(g, 2, 2, 0, 1), cell(g, 2, 2, 1, 1),
        ],
        title: band(0.22, 0.36, 0.56, 0.28),
      };
    },
  },
  {
    id: 'diagonal', name: 'Diagonal Split',
    desc: 'Two big photos split on the diagonal, title low.',
    build(g) {
      return {
        panels: [
          band(g, g, 0.62 - g, 0.72),
          band(0.38 + g, 0.26, 0.62 - g, 0.72),
        ],
        title: band(0.05, 0.76, 0.90, 0.20),
      };
    },
  },
  {
    id: 'stack', name: 'Poster Stack',
    desc: 'A tall hero on the left, two stacked shots on the right.',
    build(g) {
      return {
        panels: [
          band(g, g, 0.58 - g, 1 - g * 2),
          band(0.60, g, 0.40 - g, 0.48 - g),
          band(0.60, 0.50, 0.40 - g, 0.48 - g),
        ],
        title: band(0.05, 0.78, 0.50, 0.19),
      };
    },
  },
  {
    id: 'split', name: 'Split Screen',
    desc: 'Two tall halves side by side, title band riding across the bottom.',
    build(g) {
      return {
        panels: [
          band(g, g, 0.5 - g * 1.5, 1 - g * 2),
          band(0.5 + g * 0.5, g, 0.5 - g * 1.5, 1 - g * 2),
        ],
        title: band(0.06, 0.74, 0.88, 0.22),
      };
    },
  },
  {
    id: 'marquee', name: 'Marquee',
    desc: 'Title on top, one wide hero, four small panels along the bottom.',
    build(g) {
      const smalls = [0, 1, 2, 3].map((i) => band(g + i * 0.25, 0.71, 0.25 - g * 2, 0.26));
      return {
        panels: [band(g, 0.25, 1 - g * 2, 0.44), ...smalls],
        title: band(0.05, 0.03, 0.90, 0.20),
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
    // Starburst seal in the top-right corner, and per-photo grade tint.
    burstOn: true, burst: 'DAY ONE', tint: false, shadows: false,
    // Per-panel: photo slot, zoom, x/y offset in [-0.5, 0.5], mirror, fit mode.
    panelPhotos: [0, 1, 2, 3, 0, 1, 2, 3],
    zooms: [1, 1, 1, 1, 1, 1, 1, 1],
    ox: [0, 0, 0, 0, 0, 0, 0, 0],
    oy: [0, 0, 0, 0, 0, 0, 0, 0],
    flips: [false, false, false, false, false, false, false, false],
    fits: ['fill', 'fill', 'fill', 'fill', 'fill', 'fill', 'fill', 'fill'],
  };
}

// mulberry32 — a tiny deterministic PRNG, so the grain never changes.
function seededRandom(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Fit one line of text: shrink the font until it fits, never below 12px.
function fitFontSize(ctx, text, maxWidth, startSize, family, weight = '') {
  let size = startSize;
  ctx.font = `${weight} ${size}px ${family}`;
  while (size > 12 && ctx.measureText(text).width > maxWidth) {
    size -= 2;
    ctx.font = `${weight} ${size}px ${family}`;
  }
  return size;
}

// Draw one photo into a rect. `fit` is 'fill' (crop to cover) or 'fit'
// (whole photo, letterboxed on the panel colour). `flip` mirrors it.
// `tint` washes the photo with the grade's mid colour.
function paintPanelPhoto(ctx, img, rect, opts) {
  const { zoom = 1, ox = 0, oy = 0, flip = false, fit = 'fill', tint = null } = opts;
  if (!img) {
    const g = ctx.createLinearGradient(rect.x, rect.y, rect.x + rect.w, rect.y + rect.h);
    g.addColorStop(0, '#3b1d4e');
    g.addColorStop(1, '#12081f');
    ctx.fillStyle = g;
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = `bold ${Math.max(14, rect.h * 0.07)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('ADD A PHOTO', rect.x + rect.w / 2, rect.y + rect.h / 2);
    return;
  }
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  const coverScale = Math.max(rect.w / iw, rect.h / ih);
  const fitScale = Math.min(rect.w / iw, rect.h / ih);
  const scale = (fit === 'fit' ? fitScale : coverScale) * zoom;
  const pw = iw * scale;
  const ph = ih * scale;
  const dx = rect.x + (rect.w - pw) / 2 + ox * rect.w * 0.4;
  const dy = rect.y + (rect.h - ph) / 2 + oy * rect.h * 0.4;
  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
  ctx.clip();
  if (flip) {
    ctx.translate(rect.x * 2 + rect.w, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(img, dx, dy, pw, ph);
  if (tint) {
    ctx.globalCompositeOperation = 'multiply';
    ctx.globalAlpha = 0.30;
    ctx.fillStyle = tint;
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }
  ctx.restore();
}

// Halftone dots over a rect, for the print-poster feel of title blocks.
function paintHalftone(ctx, rect, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#000';
  const step = Math.max(10, rect.w / 28);
  for (let y = rect.y + step / 2; y < rect.y + rect.h; y += step) {
    for (let x = rect.x + step / 2; x < rect.x + rect.w; x += step) {
      const r = step * 0.16 * (0.5 + 0.5 * Math.sin((x + y) / step));
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

// Split the title into one or two lines at a word boundary, sized to fit:
// measure at a fixed font first to decide the split, then size the result
// against the right line height (taller for one line, shorter for two).
function measureTitle(ctx, text, maxWidth, rectH) {
  const words = text.split(' ');
  ctx.font = '100px Anton, sans-serif';
  if (words.length < 2 || ctx.measureText(text).width <= maxWidth) {
    return { lines: [text], size: fitFontSize(ctx, text, maxWidth, rectH * 0.44, 'Anton, sans-serif') };
  }
  const mid = Math.ceil(words.length / 2);
  const lines = [words.slice(0, mid).join(' '), words.slice(mid).join(' ')];
  const longest = lines[0].length >= lines[1].length ? lines[0] : lines[1];
  return { lines, size: fitFontSize(ctx, longest, maxWidth, rectH * 0.30, 'Anton, sans-serif') };
}

function drawFiveStar(ctx, cx, cy, r, fill) {
  ctx.save();
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const ang = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 === 0 ? r : r * 0.45;
    const x = cx + Math.cos(ang) * rr;
    const y = cy + Math.sin(ang) * rr;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = '#12081f';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();
}

// The title block: gradient + halftone (or a dark scrim when it overlays
// photos), the Anton title, the Pacifico subtitle, the tagline and the
// five-star heat meter. Short bands get the compact treatment: no tagline,
// and the stars ride higher so nothing crowds the bottom frame.
function paintLettering(ctx, rect, state, grade, compact) {
  const { title, subtitle, tagline, heat } = state;
  const overlay = state.layout === 'hero' || state.layout === 'fullbleed';
  if (overlay) {
    const g = ctx.createLinearGradient(rect.x, rect.y, rect.x + rect.w, rect.y + rect.h);
    g.addColorStop(0, 'rgba(10,4,20,0.82)');
    g.addColorStop(1, 'rgba(10,4,20,0.55)');
    ctx.fillStyle = g;
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  } else {
    const g = ctx.createLinearGradient(rect.x, rect.y, rect.x + rect.w, rect.y + rect.h);
    g.addColorStop(0, grade.stops[0]);
    g.addColorStop(0.5, grade.stops[1]);
    g.addColorStop(1, grade.stops[2]);
    ctx.fillStyle = g;
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    paintHalftone(ctx, rect, 0.10);
  }
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = Math.max(3, rect.w * 0.012);
  ctx.strokeRect(rect.x + 2, rect.y + 2, rect.w - 4, rect.h - 4);

  const cx = rect.x + rect.w / 2;
  const words = (title || 'SUNSET HEIST').trim().toUpperCase();
  const { lines, size } = measureTitle(ctx, words, rect.w * 0.92, rect.h);
  const twoLine = lines.length > 1;
  const lineH = rect.h * (twoLine ? 0.30 : 0.44);
  const grad = ctx.createLinearGradient(cx - rect.w / 2, rect.y, cx + rect.w / 2, rect.y + rect.h);
  grad.addColorStop(0, '#fff7d6');
  grad.addColorStop(0.5, '#ffd166');
  grad.addColorStop(1, '#ff7a3d');
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  const startY = rect.y + rect.h * (twoLine ? 0.24 : 0.38);
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

  // Neon script subtitle. A dark rim keeps it readable on pale title
  // blocks (Acid Lime, Rose Dusk) as well as on dark ones.
  if (subtitle && subtitle.trim()) {
    const sy = rect.y + rect.h * (twoLine ? 0.80 : 0.68);
    const subSize = fitFontSize(ctx, subtitle.trim(), rect.w * 0.86, rect.h * 0.11, 'Pacifico, cursive');
    ctx.font = `${subSize}px Pacifico, cursive`;
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#12081f';
    ctx.lineWidth = Math.max(2, subSize * 0.10);
    ctx.strokeText(subtitle.trim(), cx, sy);
    ctx.fillStyle = '#ff5da2';
    ctx.shadowColor = '#ff2e88';
    ctx.shadowBlur = subSize * 0.5;
    ctx.fillText(subtitle.trim(), cx, sy);
    ctx.shadowBlur = 0;
  }

  // Tagline, only when the block has room for a third line of text.
  if (!twoLine && !compact && tagline && tagline.trim()) {
    const tagSize = fitFontSize(ctx, tagline.trim().toUpperCase(), rect.w * 0.94, Math.max(11, rect.h * 0.065), 'sans-serif', 'bold');
    ctx.font = `bold ${tagSize}px sans-serif`;
    ctx.fillStyle = overlay ? '#ffd166' : '#12081f';
    ctx.fillText(tagline.trim().toUpperCase(), cx, rect.y + rect.h * 0.84);
  }

  // Heat stars: five of them, filled up to `heat`.
  const starR = Math.max(5, rect.h * 0.038);
  const rowW = 5 * starR * 2.4;
  const starY = rect.y + rect.h * (compact ? 0.88 : 0.94);
  for (let i = 0; i < 5; i++) {
    const sx = cx - rowW / 2 + i * starR * 2.4 + starR;
    drawFiveStar(ctx, sx, starY, starR, i < heat ? '#ffd166' : 'rgba(255,255,255,0.35)');
  }
}

// Sunset sky with a sun disc in the top corner, plus optional rays.
function paintBackdrop(ctx, w, h, grade, rays) {
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, grade.stops[3]);
  sky.addColorStop(0.55, grade.stops[2]);
  sky.addColorStop(1, grade.stops[1]);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);
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

// A spiky starburst seal with a short shout in it ("DAY ONE", "NEW"...),
// tilted a little, top-right. The text wraps to two lines when it is long.
function paintBurst(ctx, w, h, text) {
  const label = (text || '').trim().toUpperCase();
  if (!label) return;
  const cx = w * 0.90;
  const cy = h * 0.16;
  const outer = Math.min(w, h) * 0.085;
  const inner = outer * 0.72;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-0.12);
  ctx.beginPath();
  for (let i = 0; i < 24; i++) {
    const ang = (i / 24) * Math.PI * 2 - Math.PI / 2;
    const r = i % 2 === 0 ? outer : inner;
    const x = Math.cos(ang) * r;
    const y = Math.sin(ang) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = '#ff2e88';
  ctx.fill();
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = Math.max(2, outer * 0.05);
  ctx.stroke();
  const words = label.split(' ');
  const lines = words.length > 1 && label.length > 8
    ? [words.slice(0, Math.ceil(words.length / 2)).join(' '), words.slice(Math.ceil(words.length / 2)).join(' ')]
    : [label];
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const size = fitFontSize(ctx, lines.reduce((a, b) => (a.length > b.length ? a : b)), outer * 1.15, outer * 0.42, 'Anton, sans-serif');
  lines.forEach((line, i) => {
    ctx.font = `${size}px Anton, sans-serif`;
    ctx.fillText(line, 0, (i - (lines.length - 1) / 2) * size * 1.05);
  });
  ctx.restore();
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
    const opts = {
      zoom: state.zooms?.[i] ?? 1,
      ox: state.ox?.[i] ?? 0,
      oy: state.oy?.[i] ?? 0,
      flip: state.flips?.[i] ?? false,
      fit: state.fits?.[i] ?? 'fill',
      tint: state.tint ? grade.stops[1] : null,
    };
    const drawPanel = () => {
      if (p.rot) {
        ctx.save();
        ctx.translate(rect.x + rect.w / 2, rect.y + rect.h / 2);
        ctx.rotate((p.rot * Math.PI) / 180);
        ctx.translate(-rect.w / 2, -rect.h / 2);
        paintPanelPhoto(ctx, img, { x: 0, y: 0, w: rect.w, h: rect.h }, opts);
        ctx.restore();
      } else {
        paintPanelPhoto(ctx, img, rect, opts);
      }
    };
    if (state.shadows) {
      ctx.save();
      ctx.fillStyle = 'rgba(10,4,20,0.55)';
      ctx.fillRect(rect.x + w * 0.012, rect.y + h * 0.012, rect.w, rect.h);
      ctx.restore();
    }
    drawPanel();
    if (state.frames !== false) {
      if (p.rot) {
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
      } else {
        paintFrame(ctx, rect, w);
      }
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

  // Starburst seal, top-right.
  if (state.burstOn !== false) paintBurst(ctx, w, h, state.burst);

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

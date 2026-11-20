// Fixed scenes for screenshots: ?shot=editor shows the page with photos
// loaded; ?shot=cover shows the cover alone, with the editor hidden.
// Query params: photo (sample id), layout, grade, title, subtitle, size,
// heat, gap, rays, outline, burst, burstOn, tint, shadows.
// window.__shotReady is set once the fonts have loaded and the cover has
// been painted, so a screenshot runner knows the scene is done.
const SAMPLE_URL = {
  'woman-car': 'samples/woman-car.jpg',
  'man-rooftop': 'samples/man-rooftop.jpg',
  boulevard: 'samples/boulevard.jpg',
  pier: 'samples/pier.jpg',
};

// How each query param maps onto the cover state: [param, state key, parse].
// A missing param leaves the state alone; a present one overwrites it.
const PARAMS = [
  ['layout', 'layout', (v) => v],
  ['grade', 'grade', (v) => v],
  ['title', 'title', (v) => v],
  ['subtitle', 'subtitle', (v) => v],
  ['size', 'size', (v) => v],
  ['heat', 'heat', (v) => Number(v)],
  ['gap', 'gap', (v) => v],
  ['burst', 'burst', (v) => v],
  ['rays', 'rays', (v) => v === '1' || v === 'true'],
  ['outline', 'outline', (v) => v === '1' || v === 'true'],
  ['burstOn', 'burstOn', (v) => v === '1' || v === 'true'],
  ['tint', 'tint', (v) => v === '1' || v === 'true'],
  ['shadows', 'shadows', (v) => v === '1' || v === 'true'],
];

export async function runShot(shot, query, ctx) {
  const { photos, state, apply, redraw } = ctx;
  const patch = {};
  for (const [param, key, parse] of PARAMS) {
    const value = query.get(param);
    if (value !== null && value !== '') patch[key] = parse(value);
  }
  apply(patch);
  // Order the photos so the requested sample is first.
  const first = query.get('photo');
  if (first && SAMPLE_URL[first]) {
    const idx = photos.findIndex((p) => p.img.src.includes(first));
    if (idx > 0) {
      const [p] = photos.splice(idx, 1);
      photos.unshift(p);
    }
  }
  if (shot === 'cover') document.body.classList.add('shot-cover');
  try {
    await Promise.all([document.fonts.load('100px Anton'), document.fonts.load('40px Pacifico')]);
  } catch {
    // Fall back to system fonts.
  }
  redraw();
  requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
}

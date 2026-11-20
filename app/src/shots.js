// Fixed scenes for screenshots: ?shot=editor shows the page with photos
// loaded; ?shot=cover shows the cover alone, with the editor hidden.
// Query params: photo (sample id), layout, grade, title, subtitle, size,
// heat, gap, rays, outline. window.__shotReady is set once the fonts have
// loaded and the cover has been painted.
const SAMPLE_URL = {
  'woman-car': 'samples/woman-car.jpg',
  'man-rooftop': 'samples/man-rooftop.jpg',
  boulevard: 'samples/boulevard.jpg',
  pier: 'samples/pier.jpg',
};

export async function runShot(shot, query, ctx) {
  const { photos, state, apply, redraw } = ctx;
  const patch = {};
  const take = (key) => query.get(key);
  if (take('layout')) patch.layout = take('layout');
  if (take('grade')) patch.grade = take('grade');
  if (take('title')) patch.title = take('title');
  if (take('subtitle')) patch.subtitle = take('subtitle');
  if (take('size')) patch.size = take('size');
  if (take('heat')) patch.heat = Number(take('heat'));
  if (take('gap')) patch.gap = take('gap');
  if (take('rays')) patch.rays = take('rays') === '1' || take('rays') === 'true';
  if (take('outline')) patch.outline = take('outline') === '1' || take('outline') === 'true';
  apply(patch);
  // Order the photos so the requested sample is first.
  const first = take('photo');
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

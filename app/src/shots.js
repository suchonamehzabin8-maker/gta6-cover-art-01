// Fixed scenes for screenshots.
//
// `?shot=cover` paints the poster alone at the size the `w` and `h`
// queries ask for (the exported cover, full-bleed in the viewport).
// `?shot=editor` shows the editor with a photo already loaded.
// Either way, `photo` picks the sample (samples/<photo>.jpg), `title` and
// `subtitle` set the words, and `layout`, `grade`, `seal`, `rays`,
// `shadows` and `tint` override the defaults. window.__shotReady is set
// once the scene has painted, so a screenshot tool knows when to shoot.

export async function runShot(shot, query, apply) {
  const canvas = document.getElementById('poster');
  if (shot === 'cover') {
    document.body.classList.add('shot-cover');
    const w = Number(query.get('w') ?? 0);
    const h = Number(query.get('h') ?? 0);
    if (w > 0 && h > 0) {
      canvas.width = w;
      canvas.height = h;
    }
  }
  const words = {
    title: query.get('title') ?? 'VICE COAST',
    subtitle: query.get('subtitle') ?? 'Sunset Heist',
    layout: query.get('layout') ?? null,
    grade: query.get('grade') ?? null,
    sealText: query.get('seal') ?? null,
    rays: query.get('rays') === '1',
    shadows: query.get('shadows') === '0' ? false : undefined,
    tint: query.get('tint') === '0' ? false : undefined,
  };
  await apply(query.get('photo') ?? 'pier', words);
  await new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(resolve));
  });
  window.__shotReady = true;
}

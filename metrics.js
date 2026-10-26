(() => {
  'use strict';
  const seconds = value => Number.isFinite(value) ? (value / 1000).toFixed(2) + ' s' : 'Not reported';
  const run = document.querySelector('meta[name="pewcb-load-test-run"]')?.content || Date.now().toString(36);
  let loadTime = null;
  let queued = false;
  function update() {
    queued = false;
    const target = id => document.getElementById('load-test-' + id);
    if (!target('status')) return;
    const paint = performance.getEntriesByName('first-contentful-paint')[0];
    const images = [...document.images].filter(image => image.getAttribute('src'));
    const loaded = images.filter(image => image.complete && image.naturalWidth > 0).length;
    const failed = images.filter(image => image.complete && image.naturalWidth === 0).length;
    const resources = performance.getEntriesByType('resource').filter(entry => entry.initiatorType === 'img' && entry.responseEnd > 0);
    const nav = performance.getEntriesByType('navigation')[0];
    target('first-content').textContent = paint ? seconds(paint.startTime) : 'Measuring…';
    target('first-image').textContent = resources.length ? seconds(Math.min(...resources.map(entry => entry.responseEnd))) : 'Measuring…';
    target('last-image').textContent = resources.length ? seconds(Math.max(...resources.map(entry => entry.responseEnd))) : 'Measuring…';
    const end = nav?.loadEventEnd || loadTime;
    target('page-load').textContent = end ? seconds(end) : 'Measuring…';
    target('status').textContent = loaded + '/' + images.length + ' images loaded' + (failed ? ' · ' + failed + ' failed' : '') + ' · Run ' + run;
    target('status').dataset.loaded = String(loaded);
    target('status').dataset.total = String(images.length);
    target('status').dataset.failed = String(failed);
  }
  function schedule() {
    if (!queued) { queued = true; requestAnimationFrame(update); }
  }
  if (typeof PerformanceObserver !== 'undefined') {
    for (const type of ['paint', 'resource']) {
      try { new PerformanceObserver(schedule).observe({ type, buffered: true }); } catch {}
    }
  }
  document.addEventListener('load', schedule, true);
  document.addEventListener('error', schedule, true);
  document.addEventListener('DOMContentLoaded', schedule, { once: true });
  window.addEventListener('load', () => { loadTime = performance.now(); schedule(); }, { once: true });
  if (document.readyState === 'complete') loadTime = performance.getEntriesByType('navigation')[0]?.loadEventEnd || performance.now();
  schedule();
})();

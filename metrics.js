(() => {
  'use strict';
  // All callers filter Resource Timing to same-origin entries. Cross-origin
  // timing can hide sizes and must not be mistaken for a local cache hit.
  function cacheKind(entry) {
    if (!entry) return 'unknown';
    if (entry.deliveryType === 'cache') return 'cache';
    if (entry.transferSize === 0 && entry.decodedBodySize > 0) return 'cache';
    if (entry.transferSize > 0) return 'network';
    return 'unknown';
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = { cacheKind };
  if (typeof document === 'undefined') return;
  const seconds = value => Number.isFinite(value) ? (value / 1000).toFixed(2) + ' s' : 'Not reported';
  const run = document.querySelector('meta[name="pewcb-load-test-run"]')?.content || Date.now().toString(36);
  let loadTime = null;
  let queued = false;
  let initialImages = null;
  let historyCache = false;
  let freshAddressPrepared = false;
  // No request is made here. A normal reload will request this unused address
  // instead of reusing the HTML URL of the current navigation.
  try {
    const next = new URL(location.href);
    next.searchParams.set('page_run', run);
    history.replaceState(history.state, '', next.href);
    freshAddressPrepared = true;
  } catch {}
  function freshRun() {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    const next = new URL(location.href);
    next.searchParams.set('page_run', Array.from(bytes, b => b.toString(16).padStart(2, '0')).join(''));
    next.hash = '';
    location.assign(next.href);
  }
  function ensureDiagnostics() {
    const panel = document.querySelector('.load-test-panel__inner');
    if (!panel || document.getElementById('load-test-cache-info')) return;
    const info = document.createElement('div');
    info.id = 'load-test-cache-info';
    info.className = 'load-test-cache-info';
    info.innerHTML = '<span>HTML: <strong id="load-test-html-source">Measuring…</strong></span>' +
      '<span>Images from network: <strong id="load-test-network-images">0</strong></span>' +
      '<span>Images from browser cache: <strong id="load-test-cached-images">0</strong></span>' +
      '<span>Initial transfer: <strong id="load-test-network-bytes">Measuring…</strong></span>';
    const controls = document.createElement('div');
    controls.className = 'load-test-run-controls';
    const button = document.createElement('button');
    button.type = 'button';
    button.id = 'load-test-fresh-run';
    button.textContent = 'Run fresh test';
    button.addEventListener('click', freshRun);
    const connection = document.createElement('span');
    connection.id = 'load-test-connection';
    controls.append(button, connection);
    const status = document.getElementById('load-test-status');
    status.after(info, controls);
    const note = panel.querySelector('.load-test-panel__note');
    if (note) note.textContent = 'Fresh page and resource URLs avoid matching browser HTTP-cache entries. DNS, existing connections and GitHub’s CDN cache are not reset. Network counts can include revalidation. First content includes this panel; unplayed videos are excluded.';
  }
  function update() {
    queued = false;
    const target = id => document.getElementById('load-test-' + id);
    if (!target('status')) return;
    ensureDiagnostics();
    const paint = performance.getEntriesByName('first-contentful-paint')[0];
    const currentImages = [...document.images].filter(image => image.getAttribute('src'));
    if (!initialImages && document.readyState !== 'loading') initialImages = currentImages;
    const images = initialImages || currentImages;
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
    const initialResources = performance.getEntriesByType('resource').filter(entry => {
      try { return new URL(entry.name).origin === location.origin && entry.responseEnd > 0 && (!end || entry.startTime <= end); }
      catch { return false; }
    });
    const imageURLs = new Set(images.map(image => image.currentSrc || image.src));
    const imageEntries = initialResources.filter(entry => imageURLs.has(entry.name));
    const count = (entries, kind) => entries.filter(entry => cacheKind(entry) === kind).length;
    const source = historyCache ? 'history cache' : cacheKind(nav);
    const bytes = [nav, ...initialResources].reduce((sum, entry) => sum + (entry?.transferSize || 0), 0);
    target('html-source').textContent = source === 'cache' ? 'browser cache' : source === 'unknown' ? 'not reported' : source;
    target('network-images').textContent = String(count(imageEntries, 'network'));
    target('cached-images').textContent = String(count(imageEntries, 'cache'));
    target('network-bytes').textContent = bytes ? (bytes / 1024 / 1024).toFixed(2) + ' MB' : 'Not reported';
    const setup = nav ? Math.max(0, nav.connectEnd - nav.connectStart) : null;
    target('connection').textContent = setup === null ? 'Connection timing not reported' : 'Connection setup: ' + setup.toFixed(0) + ' ms (0 can mean reuse)';
    Object.assign(document.getElementById('load-test-cache-info').dataset, {
      htmlSource: source, network: String(count(initialResources, 'network')),
      cached: String(count(initialResources, 'cache')), unknown: String(count(initialResources, 'unknown')),
      networkImages: String(count(imageEntries, 'network')), cachedImages: String(count(imageEntries, 'cache')),
      unknownImages: String(count(imageEntries, 'unknown')), transferredBytes: String(bytes),
      htmlRequest: nav?.name || '', preparedPage: location.href, freshAddressPrepared: String(freshAddressPrepared)
    });
    if (historyCache) target('status').textContent += ' · Restored from history — use Run fresh test';
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
  window.addEventListener('pageshow', event => { historyCache = event.persisted; schedule(); });
  document.addEventListener('DOMContentLoaded', schedule, { once: true });
  window.addEventListener('load', () => { loadTime = performance.now(); schedule(); }, { once: true });
  if (document.readyState === 'complete') loadTime = performance.getEntriesByType('navigation')[0]?.loadEventEnd || performance.now();
  schedule();
})();

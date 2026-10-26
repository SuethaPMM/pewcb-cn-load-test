(() => {
  'use strict';
  const banner = document.getElementById('pewcb-cookie-banner');
  const dialog = document.getElementById('pewcb-cookie-settings');
  if (!banner || !dialog) return;
  const key = 'pewcb_cn_cookie_preferences_v1';
  const maxAge = 365 * 24 * 60 * 60;
  const defaults = {essential: true, analytics: false, advertising: false};
  let stored = null;
  const parse = value => {
    try {
      const data = JSON.parse(value);
      return data && data.version === 1 && data.essential === true &&
        typeof data.analytics === 'boolean' && typeof data.advertising === 'boolean' &&
        typeof data.expiresAt === 'number' && data.expiresAt > Date.now() ? data : null;
    } catch { return null; }
  };
  try { stored = parse(localStorage.getItem(key)); } catch {}
  if (!stored) {
    try {
      const cookie = document.cookie.split(';').find(item => item.trim().startsWith(key + '='));
      if (cookie) stored = parse(decodeURIComponent(cookie.trim().slice(key.length + 1)));
    } catch {}
  }
  let current = stored ? {...stored} : {...defaults};
  let returnFocus = null;
  const checkbox = type => dialog.querySelector('[data-cookie-type="' + type + '"]');
  const sync = () => {
    ['analytics', 'advertising'].forEach(type => {
      const input = checkbox(type);
      input.checked = current[type];
      input.closest('label').querySelector('[data-cookie-status]').textContent = input.checked ? "已启用" : "已关闭";
    });
  };
  const activateScripts = () => {
    document.querySelectorAll('script[type="text/plain"][data-cookie-category]').forEach(source => {
      if (!current[source.dataset.cookieCategory] || source.dataset.cookieLoaded) return;
      const script = document.createElement('script');
      for (const attribute of source.attributes) {
        if (attribute.name !== 'type' && !attribute.name.startsWith('data-cookie-')) script.setAttribute(attribute.name, attribute.value);
      }
      script.textContent = source.textContent;
      source.dataset.cookieLoaded = 'true';
      source.after(script);
    });
  };
  const closeSettings = () => {
    if (dialog.open) dialog.close();
  };
  const openSettings = event => {
    returnFocus = event?.currentTarget || document.activeElement;
    sync();
    if (!dialog.open) dialog.showModal();
  };
  const save = preferences => {
    const revoke = ['analytics', 'advertising'].some(type => current[type] && !preferences[type]);
    current = {...defaults, ...preferences, version: 1, updatedAt: Date.now(), expiresAt: Date.now() + maxAge * 1000};
    const value = JSON.stringify(current);
    try { localStorage.setItem(key, value); } catch {}
    try { document.cookie = key + '=' + encodeURIComponent(value) + '; Path=/; Max-Age=' + maxAge + '; SameSite=Lax' + (location.protocol === 'https:' ? '; Secure' : ''); } catch {}
    stored = {...current};
    banner.hidden = true;
    closeSettings();
    sync();
    document.dispatchEvent(new CustomEvent('pewcb:cookie-preferences', {detail: {...current}}));
    // Optional integrations must use the inert script format below. None are included in this preview.
    if (revoke && document.querySelector('script[data-cookie-loaded="true"]')) location.reload();
    else activateScripts();
  };
  banner.querySelector('[data-cookie-action="accept"]').addEventListener('click', () => save({analytics: true, advertising: true}));
  banner.querySelector('[data-cookie-action="reject"]').addEventListener('click', () => save({analytics: false, advertising: false}));
  document.querySelectorAll('[data-cookie-action="settings"]').forEach(button => button.addEventListener('click', openSettings));
  dialog.querySelector('[data-cookie-action="close"]').addEventListener('click', closeSettings);
  dialog.querySelector('[data-cookie-action="save"]').addEventListener('click', () => save({analytics: checkbox('analytics').checked, advertising: checkbox('advertising').checked}));
  dialog.querySelectorAll('[data-cookie-type]').forEach(input => input.addEventListener('change', () => {
    input.closest('label').querySelector('[data-cookie-status]').textContent = input.checked ? "已启用" : "已关闭";
  }));
  dialog.addEventListener('close', () => {
    if (returnFocus?.isConnected && !returnFocus.closest('[hidden]')) returnFocus.focus({preventScroll: true});
  });
  window.PewCBCookies = Object.freeze({
    getPreferences: () => ({essential: true, analytics: current.analytics, advertising: current.advertising, hasSavedChoice: !!stored}),
    openSettings: () => openSettings(),
  });
  sync();
  banner.hidden = !!stored;
  activateScripts();
})();

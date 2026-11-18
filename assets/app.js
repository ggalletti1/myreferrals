'use strict';
const $ = id => document.getElementById(id);
/* theme menu (System / Light / Dark): copied from MyTesla core.js; storage key 'referrals-theme' (same origin as MyTesla) */
(function theme() {
  const root = document.documentElement, btn = $('theme'), menu = $('theme-menu'), wrap = $('theme-wrap');
  if (!btn) return;
  const mq = window.matchMedia ? matchMedia('(prefers-color-scheme: light)') : null;
  let mode = 'system'; try { const s = localStorage.getItem('referrals-theme'); if (s === 'light' || s === 'dark') mode = s; } catch (e) {}
  const items = [...menu.querySelectorAll('[data-mode]')];
  function apply() {
    const t = mode === 'system' ? (mq && mq.matches ? 'light' : 'dark') : mode;
    root.dataset.mode = mode; root.dataset.theme = t; root.style.colorScheme = t;
    const m = document.querySelector('meta[name="theme-color"]'); if (m) m.content = t === 'light' ? '#f5f5f7' : '#050506';
    const label = mode[0].toUpperCase() + mode.slice(1);
    btn.title = 'Theme: ' + label; btn.setAttribute('aria-label', 'Theme: ' + label);
    items.forEach(i => i.setAttribute('aria-checked', String(i.dataset.mode === mode)));
  }
  const open = () => { wrap.classList.add('open'); btn.setAttribute('aria-expanded', 'true'); (items.find(i => i.dataset.mode === mode) || items[0]).focus(); };
  const close = f => { wrap.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); if (f) btn.focus(); };
  btn.addEventListener('click', e => { e.stopPropagation(); wrap.classList.contains('open') ? close() : open(); });
  items.forEach(i => i.addEventListener('click', () => { mode = i.dataset.mode; try { mode === 'system' ? localStorage.removeItem('referrals-theme') : localStorage.setItem('referrals-theme', mode); } catch (e) {} apply(); close(true); }));
  menu.addEventListener('keydown', e => {
    const k = items.indexOf(document.activeElement);
    if (e.key === 'ArrowDown') { e.preventDefault(); items[(k + 1) % items.length].focus(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); items[(k - 1 + items.length) % items.length].focus(); }
    else if (e.key === 'Escape') close(true);
  });
  document.addEventListener('click', e => { if (!wrap.contains(e.target)) close(); });
  if (mq) (mq.addEventListener ? mq.addEventListener('change', apply) : mq.addListener(apply));
  apply();
})();
/* click counter: public Abacus counters (no cookies, no keys). Every card always shows a count line, from the first fallback that works:
   live value (4 s timeout, one retry) -> last good value cached in localStorage -> baseline baked in at build time (data-base).
   A click on a card (a link) sends +1 in the background and never delays navigation. */
(function counters() {
  const b = document.body.dataset, api = b.counter && b.ns ? b.counter.replace(/\/$/, '') : '';
  const CACHE = 'myreferrals-counts';
  const label = v => v > 0 ? v.toLocaleString('en-US') + ' joined' : 'Be the first';
  const num = v => typeof v === 'number' && isFinite(v) && v >= 0 ? Math.floor(v) : null;
  let cache = {}; try { cache = JSON.parse(localStorage.getItem(CACHE) || '{}') || {}; } catch (e) {}
  const remember = (key, v) => { cache[key] = v; try { localStorage.setItem(CACHE, JSON.stringify(cache)); } catch (e) {} };
  const once = (path, keepalive) => {
    const ctl = !keepalive && window.AbortController ? new AbortController() : null;
    const t = ctl ? setTimeout(() => ctl.abort(), 4000) : 0;
    return fetch(api + path, {cache: 'no-store', credentials: 'omit', referrerPolicy: 'no-referrer', keepalive: !!keepalive, signal: ctl ? ctl.signal : undefined})
      .then(r => r.ok ? r.json() : null).then(d => num(d && d.value)).catch(() => null).finally(() => clearTimeout(t));
  };
  const read = path => once(path).then(v => v !== null ? v : once(path));          // one retry
  document.querySelectorAll('a.card[data-key]').forEach(c => {
    const el = c.querySelector('.count'), key = c.dataset.key, base = num(Number(c.dataset.base)) || 0;
    const show = v => { el.textContent = label(v); };
    show(Math.max(base, num(cache[key]) || 0));                                       // cached / baseline right away
    if (!api || !window.fetch) return;
    read('/get/' + b.ns + '/' + key).then(v => { if (v !== null) { remember(key, v); show(Math.max(v, base)); } });
    const hit = () => { once('/hit/' + b.ns + '/' + key, true).then(v => { if (v !== null) { remember(key, v); show(Math.max(v, base)); } }); };
    c.addEventListener('click', hit);                                                 // fire-and-forget: navigation is never delayed
    c.addEventListener('auxclick', e => { if (e.button === 1) hit(); });
  });
})();

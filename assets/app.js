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
/* click counter: public Abacus counters (no cookies, no keys). Read on load, +1 on click without delaying the link.
   Any failure or a zero count keeps the line hidden. */
(function counters() {
  const b = document.body.dataset, api = b.counter && b.ns ? b.counter.replace(/\/$/, '') : ''; if (!api || !window.fetch) return;
  const show = (el, v) => { if (typeof v === 'number' && v > 0) { el.textContent = v.toLocaleString('en-US') + ' joined'; el.hidden = false; } };
  const call = (path, keepalive) => {
    const ctl = window.AbortController ? new AbortController() : null;
    if (ctl && !keepalive) setTimeout(() => ctl.abort(), 4000);
    return fetch(api + path, {cache: 'no-store', credentials: 'omit', referrerPolicy: 'no-referrer', keepalive: !!keepalive, signal: ctl && !keepalive ? ctl.signal : undefined})
      .then(r => r.ok ? r.json() : null).then(d => d && d.value).catch(() => null);
  };
  document.querySelectorAll('.card[data-key]').forEach(card => {
    const el = card.querySelector('.count'), key = card.dataset.key;
    call('/get/' + b.ns + '/' + key).then(v => show(el, v));
    card.querySelector('.cta').addEventListener('click', () => { call('/hit/' + b.ns + '/' + key, true).then(v => show(el, v)); });
  });
})();

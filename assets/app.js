// Theme menu: System / Light / Dark, stored in localStorage('theme'); 'system' removes the override.
(function () {
  var root = document.documentElement, btn = document.getElementById('theme-btn'), menu = document.getElementById('theme-menu');
  var items = menu.querySelectorAll('button[data-theme]');
  function current() { try { return localStorage.getItem('theme') || 'system'; } catch (e) { return 'system'; } }
  function apply(t) {
    if (t === 'light' || t === 'dark') root.setAttribute('data-theme', t); else root.removeAttribute('data-theme');
    items.forEach(function (b) { b.setAttribute('aria-checked', String(b.dataset.theme === t)); });
  }
  function open(v) { menu.hidden = !v; btn.setAttribute('aria-expanded', String(v)); if (v) (menu.querySelector('[aria-checked=true]') || items[0]).focus(); }
  btn.addEventListener('click', function (e) { e.stopPropagation(); open(menu.hidden); });
  items.forEach(function (b) {
    b.addEventListener('click', function () {
      var t = b.dataset.theme;
      try { if (t === 'system') localStorage.removeItem('theme'); else localStorage.setItem('theme', t); } catch (e) {}
      apply(t); open(false); btn.focus();
    });
  });
  document.addEventListener('click', function (e) { if (!menu.hidden && !menu.contains(e.target)) open(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) { open(false); btn.focus(); } });
  apply(current());
})();

/* SAGANA landing page behaviour: mobile menu, role tabs, scroll effects, and
   the live version info on the Download section. No frameworks. */
(function () {
  'use strict';

  // Where APK releases are published. The download BUTTON never uses this: it
  // always points to /download on this site (see vercel.json), which redirects
  // to the newest GitHub release. This is only used to read version details.
  var CONFIG = { repo: 'Drhylicious/SAGANA', apkName: 'SAGANA.apk' };

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* Mobile menu */
  var burger = $('#burger'), menu = $('#menu');
  function setMenu(open) {
    menu.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  burger.addEventListener('click', function () { setMenu(!menu.classList.contains('open')); });
  $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  /* Role tabs in the Application Preview */
  var tabs = $$('.tab');
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.classList.toggle('is-active', on);
        t.setAttribute('aria-selected', String(on));
      });
      $$('.gallery').forEach(function (g) { g.hidden = g.getAttribute('data-role') !== tab.getAttribute('data-role'); });
    });
  });

  /* Scroll reveal + active nav link */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    $$('.reveal').forEach(function (el) { io.observe(el); });

    var links = {};
    $$('.menu a[href^="#"]').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting && links[e.target.id]) {
          $$('.menu a').forEach(function (a) { a.classList.remove('is-active'); });
          if (!links[e.target.id].classList.contains('menu-cta')) links[e.target.id].classList.add('is-active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('section[id]').forEach(function (s) { so.observe(s); });
  } else {
    $$('.reveal').forEach(function (el) { el.classList.add('in'); });
  }

  /* Download section: version info from the published releases */
  var card = $('#dl');
  function setState(state, text) {
    card.setAttribute('data-state', state);
    $('#dl-status-text').textContent = text;
  }
  function fmtSize(bytes) { return (bytes / 1048576).toFixed(1) + ' MB'; }
  function fmtDate(iso) {
    try { return new Date(iso).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' }); }
    catch (e) { return '–'; }
  }
  function apkOf(rel) {
    var assets = rel.assets || [];
    for (var i = 0; i < assets.length; i++) if (assets[i].name === CONFIG.apkName) return assets[i];
    for (var j = 0; j < assets.length; j++) if (/\.apk$/i.test(assets[j].name)) return assets[j];
    return null;
  }
  function clip(s, n) { s = (s || '').replace(/\r/g, '').trim(); return s.length > n ? s.slice(0, n).trim() + '…' : s; }

  function renderHistory(releases) {
    var list = $('#history-list'); list.textContent = '';
    releases.forEach(function (rel) {
      var apk = apkOf(rel); if (!apk) return;
      var li = document.createElement('li');
      var row = document.createElement('div'); row.className = 'h-row';
      var v = document.createElement('span'); v.className = 'h-ver'; v.textContent = rel.name || rel.tag_name;
      var m = document.createElement('span'); m.className = 'h-meta'; m.textContent = fmtDate(rel.published_at) + ' · ' + fmtSize(apk.size);
      row.appendChild(v); row.appendChild(m);
      if (!rel.prerelease) {
        var a = document.createElement('a'); a.className = 'h-get'; a.textContent = 'Download this version';
        a.href = apk.browser_download_url; a.rel = 'noopener';
        row.appendChild(a);
      }
      li.appendChild(row);
      if (rel.body) { var p = document.createElement('p'); p.className = 'h-notes'; p.textContent = clip(rel.body, 500); li.appendChild(p); }
      list.appendChild(li);
    });
    $('#history').hidden = !list.children.length;
  }

  fetch('https://api.github.com/repos/' + CONFIG.repo + '/releases?per_page=20', { headers: { Accept: 'application/vnd.github+json' } })
    .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    .then(function (releases) {
      releases = releases.filter(function (r) { return !r.draft && apkOf(r); });
      var latest = releases.filter(function (r) { return !r.prerelease; })[0];
      if (!latest) {
        setState('none', 'First release coming soon');
        var note = $('#dl-note');
        note.hidden = false;
        note.textContent = 'The first SAGANA release has not been published yet. Please check back soon.';
        return;
      }
      var apk = apkOf(latest);
      setState('ready', 'Latest version available');
      $('#dl-version').textContent = latest.name || latest.tag_name;
      $('#dl-date').textContent = fmtDate(latest.published_at);
      $('#dl-size').textContent = fmtSize(apk.size);
      renderHistory(releases);
    })
    .catch(function () {
      // The Download button still works (it does not depend on this lookup).
      setState('error', 'Version details unavailable right now');
    });
})();

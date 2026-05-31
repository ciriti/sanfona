/* layout.js — Inietta .site-nav e header hero */
(function () {
  'use strict';

  const NAV_PAGES = [
    { id: 'xote',          href: 'xote.html',          label: 'Xote & Levada' },
    { id: 'tecnica',       href: 'tecnica.html',        label: 'Tecnica' },
    { id: 'scale-accordi', href: 'scale-accordi.html',  label: 'Scale & Accordi' },
    { id: 'esercizi',      href: 'esercizi.html',       label: 'Esercizi' },
    { id: 'repertorio',    href: 'repertorio.html',     label: 'Repertório' },
  ];

  const BRAND = 'Fisarmonica Forró';
  const BRAND_HREF = 'index.html';

  function getCurrentPageId() {
    const header = document.querySelector('header#top[data-page]');
    if (header) return header.getAttribute('data-page');
    const path = location.pathname;
    const file = path.split('/').pop().replace('.html','') || 'index';
    return file;
  }

  function buildNav() {
    const pageId = getCurrentPageId();
    const nav = document.createElement('nav');
    nav.className = 'site-nav';
    nav.setAttribute('aria-label', 'Navigazione principale');

    const brand = document.createElement('a');
    brand.className = 'nav-brand';
    brand.href = BRAND_HREF;
    brand.textContent = BRAND;
    nav.appendChild(brand);

    const ul = document.createElement('ul');
    ul.className = 'nav-links';
    NAV_PAGES.forEach(p => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = p.href;
      a.textContent = p.label;
      if (p.id === pageId) a.classList.add('active');
      li.appendChild(a);
      ul.appendChild(li);
    });
    nav.appendChild(ul);

    const controls = document.createElement('div');
    controls.className = 'nav-controls';

    const langSwitcher = document.createElement('div');
    langSwitcher.className = 'lang-switcher';
    langSwitcher.id = 'lang-switcher';
    ['IT','EN','PT'].forEach(lang => {
      const btn = document.createElement('button');
      btn.textContent = lang;
      btn.setAttribute('data-lang', lang.toLowerCase());
      btn.setAttribute('aria-label', 'Cambia lingua in ' + lang);
      langSwitcher.appendChild(btn);
    });
    controls.appendChild(langSwitcher);
    nav.appendChild(controls);

    document.body.insertBefore(nav, document.body.firstChild);
  }

  function buildHeader() {
    const header = document.querySelector('header#top');
    if (!header) return;

    const inner = document.createElement('div');
    inner.className = 'header-inner';

    const h1 = document.createElement('h1');
    h1.id = 'page-title';
    h1.textContent = header.getAttribute('data-title') || BRAND;
    inner.appendChild(h1);

    const p = document.createElement('p');
    p.id = 'page-subtitle';
    p.textContent = header.getAttribute('data-subtitle') || '';
    inner.appendChild(p);

    header.appendChild(inner);
  }

  function addBackToTop() {
    if (document.getElementById('back-to-top')) return;
    const btn = document.createElement('button');
    btn.id = 'back-to-top';
    btn.setAttribute('aria-label', 'Torna in cima');
    btn.innerHTML = '&#8679;';
    btn.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
    document.body.appendChild(btn);
  }

  function addFooter() {
    if (document.querySelector('footer')) return;
    const footer = document.createElement('footer');
    footer.id = 'site-footer';
    footer.innerHTML = `<p>Fisarmonica Forró &mdash; Metodo pratico &middot; <a href="index.html">Home</a></p>`;
    document.body.appendChild(footer);
  }

  /* Run immediately — scripts are at the bottom of <body>, so DOM content
     above is already parsed and available without waiting for DOMContentLoaded. */
  buildNav();
  buildHeader();
  addBackToTop();
  addFooter();
})();

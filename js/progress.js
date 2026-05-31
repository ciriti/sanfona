/* progress.js — Sidebar progresso, localStorage, scroll spy */
(function () {
  'use strict';

  const STORAGE_PREFIX = 'fisarmonica_done_';

  function getStorageKey() {
    return STORAGE_PREFIX + location.pathname;
  }

  function getDoneSet() {
    const raw = localStorage.getItem(getStorageKey());
    if (!raw) return new Set();
    try { return new Set(JSON.parse(raw)); } catch { return new Set(); }
  }

  function saveDoneSet(set) {
    localStorage.setItem(getStorageKey(), JSON.stringify([...set]));
  }

  function markDone(sectionId) {
    const done = getDoneSet();
    done.add(sectionId);
    saveDoneSet(done);
    refreshSidebarState(done);
  }

  function getSections() {
    return Array.from(document.querySelectorAll('main.content-column section[id]'));
  }

  function getLabel(section) {
    const title = section.querySelector('.section-title');
    if (title) return title.textContent.trim();
    const h2 = section.querySelector('h2');
    if (h2) return h2.textContent.trim();
    return section.id;
  }

  function getModuleNum(section) {
    const num = section.querySelector('.section-num');
    if (num) return num.textContent.trim();
    return section.id.toUpperCase();
  }

  function buildSidebar() {
    const sidebar = document.getElementById('progress-sidebar');
    if (!sidebar) return;

    sidebar.innerHTML = '';
    const sections = getSections();
    if (!sections.length) return;

    const done = getDoneSet();

    const title = document.createElement('div');
    title.className = 'sidebar-title';
    title.textContent = 'Moduli';
    sidebar.appendChild(title);

    const ul = document.createElement('ul');
    ul.className = 'sidebar-list';
    ul.id = 'sidebar-list';

    sections.forEach(section => {
      const id = section.id;
      const isDone = done.has(id);

      const li = document.createElement('li');
      li.className = 'sidebar-item' + (isDone ? ' is-done' : '');
      li.setAttribute('data-section', id);

      const dot = document.createElement('span');
      dot.className = 'sidebar-dot';

      const a = document.createElement('a');
      a.className = 'sidebar-link';
      a.href = '#' + id;
      a.textContent = getLabel(section);

      a.addEventListener('click', e => {
        e.preventDefault();
        const target = document.getElementById(id);
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        markDone(id);
      });

      li.appendChild(dot);
      li.appendChild(a);
      ul.appendChild(li);
    });

    sidebar.appendChild(ul);

    /* progress bar */
    const bar = document.createElement('div');
    bar.className = 'sidebar-progress-bar';
    const fill = document.createElement('div');
    fill.className = 'sidebar-progress-fill';
    fill.id = 'sidebar-fill';
    bar.appendChild(fill);

    const label = document.createElement('div');
    label.className = 'sidebar-progress-label';
    label.id = 'sidebar-progress-label';

    sidebar.appendChild(bar);
    sidebar.appendChild(label);

    refreshSidebarState(done, sections.length);
  }

  function refreshSidebarState(done, total) {
    const sections = getSections();
    total = total || sections.length;
    const count = done.size;

    document.querySelectorAll('.sidebar-item[data-section]').forEach(li => {
      const id = li.getAttribute('data-section');
      li.classList.toggle('is-done', done.has(id));
    });

    const fill = document.getElementById('sidebar-fill');
    const label = document.getElementById('sidebar-progress-label');
    if (fill) fill.style.width = (total > 0 ? (count / total * 100) : 0) + '%';
    if (label) label.textContent = `${count} / ${total} completati`;
  }

  let scrollSpyObserver = null;

  function initScrollSpy() {
    if (scrollSpyObserver) {
      scrollSpyObserver.disconnect();
      scrollSpyObserver = null;
    }

    const sections = getSections();
    if (!sections.length) return;

    const options = {
      root: null,
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0,
    };

    scrollSpyObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;

        document.querySelectorAll('.sidebar-link').forEach(a => {
          a.classList.toggle('is-active', a.getAttribute('href') === '#' + id);
        });

        const done = getDoneSet();
        if (!done.has(id)) {
          done.add(id);
          saveDoneSet(done);
          refreshSidebarState(done);
        }
      });
    }, options);

    sections.forEach(s => scrollSpyObserver.observe(s));
  }

  window.FisarmonicaProgress = {
    buildSidebar,
    initScrollSpy,
    markDone,
    getDoneSet,
  };
})();

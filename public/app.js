/* global document, fetch */

(function () {
  'use strict';

  // ---- DOM refs ----
  const grid = document.getElementById('repo-grid');
  const searchInput = document.getElementById('search');
  const categorySelect = document.getElementById('filter-category');
  const statusSelect = document.getElementById('filter-status');
  const languageSelect = document.getElementById('filter-language');
  const sortSelect = document.getElementById('sort');
  const resultCount = document.getElementById('result-count');

  let allRepos = [];

  // ---- Bootstrap ----
  init();

  async function init() {
    grid.innerHTML = '<p class="loading">Loading repositories&hellip;</p>';
    try {
      const res = await fetch('repos.json');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      allRepos = await res.json();
      populateFilters();
      render();
      attachListeners();
    } catch (err) {
      grid.innerHTML = `<p class="error-msg">Failed to load repository data. ${err.message}</p>`;
    }
  }

  // ---- Filters ----
  function populateFilters() {
    const categories = [...new Set(allRepos.map((r) => r.category))].sort();
    categories.forEach((c) => {
      const opt = document.createElement('option');
      opt.value = c;
      opt.textContent = c;
      categorySelect.appendChild(opt);
    });

    const languages = [...new Set(allRepos.map((r) => r.language))].sort();
    languages.forEach((l) => {
      const opt = document.createElement('option');
      opt.value = l;
      opt.textContent = l;
      languageSelect.appendChild(opt);
    });
  }

  function attachListeners() {
    searchInput.addEventListener('input', render);
    categorySelect.addEventListener('change', render);
    statusSelect.addEventListener('change', render);
    languageSelect.addEventListener('change', render);
    sortSelect.addEventListener('change', render);
  }

  // ---- Render ----
  function render() {
    const filtered = getFiltered();
    resultCount.textContent = `${filtered.length} tool${filtered.length !== 1 ? 's' : ''}`;

    if (allRepos.length === 0) {
      grid.innerHTML = '<p class="loading">No tools listed yet. Entries are curated by contributors.</p>';
      return;
    }

    if (filtered.length === 0) {
      grid.innerHTML = '<p class="loading">No tools match the current filters.</p>';
      return;
    }

    grid.innerHTML = filtered.map(cardHTML).join('');
  }

  function getFiltered() {
    const search = searchInput.value.toLowerCase().trim();
    const category = categorySelect.value;
    const status = statusSelect.value;
    const language = languageSelect.value;
    const sortBy = sortSelect.value;

    let repos = allRepos.filter((r) => {
      if (category && r.category !== category) return false;
      if (status && r.activity_status !== status) return false;
      if (language && r.language !== language) return false;
      if (
        search &&
        !r.name.toLowerCase().includes(search) &&
        !r.slug.toLowerCase().includes(search) &&
        !(r.description || '').toLowerCase().includes(search) &&
        !(r.notes || '').toLowerCase().includes(search)
      ) {
        return false;
      }
      return true;
    });

    repos.sort((a, b) => {
      if (sortBy === 'stars') return b.stars - a.stars;
      if (sortBy === 'last_commit')
        return new Date(b.last_commit) - new Date(a.last_commit);
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });

    return repos;
  }

  // ---- Card Template ----
  function cardHTML(repo) {
    const badgeClass = `badge--${repo.activity_status}`;
    const commitDate = timeAgo(repo.last_commit);

    return `
      <article class="repo-card">
        <div class="repo-card__header">
          <span class="repo-card__name">
            <a href="${escapeAttr(repo.url)}" target="_blank" rel="noopener">${escapeHTML(repo.slug)}</a>
          </span>
          <span class="badge ${badgeClass}">${escapeHTML(repo.activity_status)}</span>
        </div>
        ${repo.description ? `<p class="repo-card__desc">${escapeHTML(repo.description)}</p>` : ''}
        ${repo.notes ? `<div class="repo-card__notes">${escapeHTML(repo.notes)}</div>` : ''}
        <div class="repo-card__meta">
          <span title="Stars">\u2B50 ${formatNumber(repo.stars)}</span>
          <span title="Forks">\uD83C\uDF74 ${formatNumber(repo.forks)}</span>
          <span title="Open Issues">\uD83D\uDCCB ${repo.open_issues}</span>
          <span title="Last Commit">\uD83D\uDD52 ${commitDate}</span>
          <span title="Commits/week (3-month avg)">\uD83D\uDCC8 ${repo.commit_pace}/wk</span>
          <span title="License">\uD83D\uDCC4 ${escapeHTML(repo.license)}</span>
          <span title="Language">\uD83D\uDCBB ${escapeHTML(repo.language)}</span>
          <span title="Category">\uD83C\uDFF7\uFE0F ${escapeHTML(repo.category)}</span>
        </div>
      </article>`;
  }

  // ---- Helpers ----
  function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days < 1) return 'today';
    if (days === 1) return '1 day ago';
    if (days < 30) return `${days} days ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`;
    const years = Math.floor(days / 365);
    return `${years} year${years > 1 ? 's' : ''} ago`;
  }

  function formatNumber(n) {
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    return String(n);
  }

  function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function escapeAttr(str) {
    return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
  }
})();

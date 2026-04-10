const form           = document.getElementById('searchForm');
const input          = document.getElementById('searchInput');
const hitsContent    = document.getElementById('hitsContent');
const summaryContent = document.getElementById('summaryContent');
const scoreValue     = document.getElementById('scoreValue');

const API_URL = 'https://tyler.deploy01.nl/api/search';

// test line to test autodeploy using php

// -------------------------------------------------------
// Submit handler
// -------------------------------------------------------
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const query = input.value.trim();
  if (!query) return;
  setLoadingState(query);

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });

    const data = await response.json();

    if (!response.ok) {
      const detail = data?.detail || 'Search request failed';
      throw new Error(detail);
    }

    renderResults(data, query);

  } catch (error) {
    showError(error.message || 'Unknown error');
  }
});

// -------------------------------------------------------
// Loading state
// -------------------------------------------------------
function setLoadingState(query) {
  scoreValue.textContent = '...';

  hitsContent.className = 'hits-content';
  hitsContent.innerHTML = `
    <div class="loading-state">
      <div class="spinner"></div>
      Searching for <strong>&ldquo;${escapeHtml(query)}&rdquo;</strong>...
    </div>`;

  summaryContent.className = 'summary-content';
  summaryContent.innerHTML = `
    <div class="loading-state">
      <div class="spinner"></div>
      Generating summary...
    </div>`;
}

// -------------------------------------------------------
// Render results
// -------------------------------------------------------
function renderResults(data, query) {
  const score       = data?.score       ?? '--';
  const summary     = data?.summary     ?? 'No summary returned.';
  const suggestions = Array.isArray(data?.suggestions)  ? data.suggestions  : [];
  const hits        = Array.isArray(data?.hits)          ? data.hits          : [];
  const labels      = data?.llm_labels  ?? {};

  // Score
  scoreValue.textContent = score;

  // --- Hits panel ---
  hitsContent.className = 'hits-content';

  if (hits.length === 0) {
    hitsContent.innerHTML = `
      <div class="empty-state">
        No results found for <strong>${escapeHtml(query)}</strong>.
      </div>`;
  } else {
    hitsContent.innerHTML = hits.map(hit => {
      const title      = hit?.title       || 'Untitled result';
      const url        = hit?.url         || '#';
      const displayUrl = hit?.display_url || hit?.url || '';
      const snippet    = hit?.snippet     || 'No snippet available.';
      const source     = hit?.source      || 'Search result';

      return `
        <article class="search-result">
          <div class="result-topline">${escapeHtml(source)}</div>
          <div class="result-url">${escapeHtml(displayUrl)}</div>
          <a class="result-title"
             href="${escapeAttribute(url)}"
             target="_blank"
             rel="noopener noreferrer">
            ${escapeHtml(title)}
          </a>
          <p class="result-snippet">${escapeHtml(snippet)}</p>
        </article>`;
    }).join('');
  }

  // --- Summary panel ---
  summaryContent.className = 'summary-content';
  let html = '';

  // Label pills
  if (Object.keys(labels).length > 0) {
    const pills = Object.entries(labels)
      .map(([k, v]) =>
        `<span class="label-pill">
          ${escapeHtml(k.replace(/_/g, ' '))}: <strong>${escapeHtml(v)}</strong>
        </span>`)
      .join('');
    html += `<div class="labels-block">${pills}</div>`;
  }

  // Summary tekst
  html += `
    <div class="summary-block">
      <h3>Summary</h3>
      <p>${escapeHtml(summary)}</p>
    </div>`;

  // Suggesties
  html += `
    <div class="summary-block">
      <h3>Suggestions</h3>
      ${suggestions.length > 0
        ? `<ul>${suggestions.map(s => `>${escapeHtml(s)}</li>`).join('')}</ul>`
        : `<p>No suggestions available.</p>`
      }
    </div>`;

  summaryContent.innerHTML = html;
}

// -------------------------------------------------------
// Error state
// -------------------------------------------------------
function showError(message) {
  scoreValue.textContent = '--';

  hitsContent.className = 'hits-content';
  hitsContent.innerHTML = `
    <div class="error-state">
      Could not fetch results.<br/>
      <strong>${escapeHtml(message)}</strong>
    </div>`;

  summaryContent.className = 'summary-content';
  summaryContent.innerHTML = `
    <div class="error-state">
      The frontend could not get a valid response from the backend.<br/><br/>
      <strong>Checklist:</strong>
      <ul style="margin-top:8px; padding-left:18px;">
        >Is the backend online at de>tyler.deploy01.nl</code>?</li>
        >Are de>TAVILY_API_KEY</code> and de>GEMINI_API_KEY</code> set in Dokploy?</li>
        >Is CORS configured correctly in de>main.py</code>?</li>
      </ul>
    </div>`;
}

// -------------------------------------------------------
// Helpers
// -------------------------------------------------------
function escapeHtml(value) {
  return String(value)
    .replaceAll('&',  '&amp;')
    .replaceAll('<',  '&lt;')
    .replaceAll('>',  '&gt;')
    .replaceAll('"',  '&quot;')
    .replaceAll("'",  '&#039;');
}

function escapeAttribute(value) {
  return String(value).replaceAll('"', '&quot;');
}

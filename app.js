const form = document.getElementById("searchForm");
const input = document.getElementById("searchInput");
const hitsContent = document.getElementById("hitsContent");
const summaryContent = document.getElementById("summaryContent");
const scoreValue = document.getElementById("scoreValue");

const API_URL = "https://tyler.deploy01.nl/api/search";

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const query = input.value.trim();
  if (!query) return;

  setLoadingState(query);

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ query })
    });

    const data = await response.json();

    if (!response.ok) {
      const detail = data?.detail || "Search request failed";
      throw new Error(detail);
    }

    renderResults(data, query);
  } catch (error) {
    showError(error.message || "Unknown error");
  }
});

function setLoadingState(query) {
  scoreValue.textContent = "...";

  hitsContent.className = "hits-content";
  hitsContent.innerHTML = `
    <article class="search-result">
      <div class="result-topline">Searching</div>
      <div class="result-url">${escapeHtml(query)}</div>
      <div class="result-title">Fetching live results...</div>
      <p class="result-snippet">
        Looking up search engine hits, titles and snippets.
      </p>
    </article>
  `;

  summaryContent.className = "summary-content";
  summaryContent.innerHTML = `
    <div class="summary-block">
      <h3>Summary</h3>
      <p>Waiting for the proxy response.</p>
    </div>
    <div class="summary-block">
      <h3>Suggestions</h3>
      <ul>
        <li>Preparing recommendations...</li>
      </ul>
    </div>
  `;
}

function renderResults(data, query) {
  const score = data?.score ?? "--";
  const summary = data?.summary ?? `No summary returned for "${query}".`;
  const suggestions = Array.isArray(data?.suggestions) ? data.suggestions : [];
  const hits = Array.isArray(data?.hits) ? data.hits : [];

  scoreValue.textContent = score;

  if (hits.length === 0) {
    hitsContent.className = "hits-content";
    hitsContent.innerHTML = `
      <div class="empty-state">
        No search results were returned for <strong>${escapeHtml(query)}</strong>.
      </div>
    `;
  } else {
    hitsContent.className = "hits-content";
    hitsContent.innerHTML = hits
      .map((hit) => {
        const title = hit?.title || "Untitled result";
        const url = hit?.url || "#";
        const displayUrl = hit?.display_url || hit?.url || "";
        const snippet = hit?.snippet || "No snippet available.";
        const source = hit?.source || "Search result";

        return `
          <article class="search-result">
            <div class="result-topline">${escapeHtml(source)}</div>
            <div class="result-url">${escapeHtml(displayUrl)}</div>
            <a
              class="result-title"
              href="${escapeAttribute(url)}"
              target="_blank"
              rel="noopener noreferrer"
            >
              ${escapeHtml(title)}
            </a>
            <p class="result-snippet">${escapeHtml(snippet)}</p>
          </article>
        `;
      })
      .join("");
  }

  summaryContent.className = "summary-content";
  summaryContent.innerHTML = `
    <div class="summary-block">
      <h3>Summary</h3>
      <p>${escapeHtml(summary)}</p>
    </div>
    <div class="summary-block">
      <h3>Suggestions</h3>
      ${
        suggestions.length
          ? `<ul>${suggestions.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`
          : `<p>No suggestions available.</p>`
      }
    </div>
  `;
}

function showError(message) {
  scoreValue.textContent = "--";

  hitsContent.className = "hits-content";
  hitsContent.innerHTML = `
    <div class="empty-state">
      Could not fetch live search results.<br />
      <strong>${escapeHtml(message)}</strong>
    </div>
  `;

  summaryContent.className = "summary-content";
  summaryContent.innerHTML = `
    <div class="summary-block">
      <h3>Summary</h3>
      <p>The frontend could not get a valid response from the search proxy.</p>
    </div>
    <div class="summary-block">
      <h3>Suggestions</h3>
      <ul>
        <li>Check if the backend is deployed correctly</li>
        <li>Check whether /api/search exists</li>
        <li>Check if your SERPAPI key is configured correctly</li>
      </ul>
    </div>
  `;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value) {
  return String(value).replaceAll('"', "&quot;");
}
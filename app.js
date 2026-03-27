const form = document.getElementById("searchForm");
const input = document.getElementById("searchInput");
const hitsContent = document.getElementById("hitsContent");
const summaryContent = document.getElementById("summaryContent");
const scoreValue = document.getElementById("scoreValue");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const query = input.value.trim();
  if (!query) return;

  setLoadingState(query);

  try {
    const response = await fetch("http://localhost:8000/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ query })
    });

    if (!response.ok) {
      throw new Error("Search request failed");
    }

    const data = await response.json();
    renderResults(data);
  } catch (error) {
    showError(error.message);
  }
});

function setLoadingState(query) {
  scoreValue.textContent = "...";
  hitsContent.className = "hits-content";
  hitsContent.innerHTML = `
    <div class="search-result">
      <div class="result-topline">Searching</div>
      <div class="result-url">${escapeHtml(query)}</div>
      <p class="result-snippet">Fetching live search engine results...</p>
    </div>
  `;

  summaryContent.className = "summary-content";
  summaryContent.innerHTML = `
    <div class="summary-block">
      <h3>Summary</h3>
      <p>Waiting for live results.</p>
    </div>
  `;
}

function renderResults(data) {
  scoreValue.textContent = data.score ?? "--";

  if (!data.hits || data.hits.length === 0) {
    hitsContent.innerHTML = `
      <div class="empty-state">
        No indexed results were returned for this query.
      </div>
    `;
  } else {
    hitsContent.className = "hits-content";
    hitsContent.innerHTML = data.hits.map(hit => `
      <article class="search-result">
        <div class="result-topline">${escapeHtml(hit.source || "Search result")}</div>
        <div class="result-url">${escapeHtml(hit.display_url || hit.url || "")}</div>
        <a class="result-title" href="${escapeAttribute(hit.url || "#")}" target="_blank" rel="noopener noreferrer">
          ${escapeHtml(hit.title || "Untitled result")}
        </a>
        <p class="result-snippet">${escapeHtml(hit.snippet || "")}</p>
      </article>
    `).join("");
  }

  summaryContent.className = "summary-content";
  summaryContent.innerHTML = `
    <div class="summary-block">
      <h3>Summary</h3>
      <p>${escapeHtml(data.summary || "No summary available.")}</p>
    </div>
    <div class="summary-block">
      <h3>Suggestions</h3>
      <ul>
        ${(data.suggestions || []).map(item => `<li>${escapeHtml(item)}</li>`).join("")}
      </ul>
    </div>
  `;
}

function showError(message) {
  scoreValue.textContent = "--";
  hitsContent.innerHTML = `<div class="empty-state">Error: ${escapeHtml(message)}</div>`;
  summaryContent.innerHTML = `
    <div class="summary-block">
      <h3>Summary</h3>
      <p>The live search request could not be completed.</p>
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
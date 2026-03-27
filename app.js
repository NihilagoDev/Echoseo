const form = document.getElementById("searchForm");
const input = document.getElementById("searchInput");
const hitsContent = document.getElementById("hitsContent");
const summaryContent = document.getElementById("summaryContent");
const scoreValue = document.getElementById("scoreValue");

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const query = input.value.trim();
  if (!query) return;

  setLoadingState(query);

  setTimeout(() => {
    const data = mockSearch(query);
    renderResults(data);
  }, 500);
});

function setLoadingState(query) {
  hitsContent.className = "hits-content";
  hitsContent.innerHTML = `
    <div class="search-result">
      <div class="result-topline">Searching</div>
      <div class="result-url">${escapeHtml(query)}</div>
      <p class="result-snippet">Looking up indexed hits and public references...</p>
    </div>
  `;

  summaryContent.className = "summary-content";
  summaryContent.innerHTML = `
    <div class="summary-block">
      <h3>Summary</h3>
      <p>Collecting signals and preparing an overview.</p>
    </div>
  `;

  scoreValue.textContent = "...";
}

function renderResults(data) {
  scoreValue.textContent = data.score;

  hitsContent.className = "hits-content";
  hitsContent.innerHTML = data.hits.map(hit => `
    <article class="search-result">
      <div class="result-topline">${escapeHtml(hit.source)}</div>
      <div class="result-url">${escapeHtml(hit.url)}</div>
      <a class="result-title" href="${hit.url}" target="_blank" rel="noopener noreferrer">
        ${escapeHtml(hit.title)}
      </a>
      <p class="result-snippet">${escapeHtml(hit.snippet)}</p>
      <div class="result-tags">
        ${hit.tags.map(tag => `<span class="result-tag">${escapeHtml(tag)}</span>`).join("")}
      </div>
    </article>
  `).join("");

  summaryContent.className = "summary-content";
  summaryContent.innerHTML = `
    <div class="summary-block">
      <h3>Summary</h3>
      <p>${escapeHtml(data.summary)}</p>
    </div>
    <div class="summary-block">
      <h3>Suggestions</h3>
      <ul>
        ${data.suggestions.map(item => `<li>${escapeHtml(item)}</li>`).join("")}
      </ul>
    </div>
  `;
}

function mockSearch(query) {
  const isEmail = query.includes("@");

  return {
    score: isEmail ? "74" : "61",
    summary: isEmail
      ? "This email query appears to connect to a moderate set of public signals. Some results may point to account references, profile mentions or reused identifiers."
      : "This handle appears to have a visible but not dominant searchable footprint across public web surfaces.",
    suggestions: [
      "Verify which hits belong to the same person",
      "Add confidence labels based on source type",
      "Separate breach data from public mention data",
      "Connect real search API results next"
    ],
    hits: isEmail
      ? [
          {
            source: "Indexed profile surface",
            url: "https://example.com/profile/demo-email",
            title: `Possible public profile related to ${query}`,
            snippet: "A publicly indexable page appears to reference this email identifier or a closely related contact pattern.",
            tags: ["public mention", "profile", "medium confidence"]
          },
          {
            source: "Forum archive",
            url: "https://forum.example.org/thread/contact-reference",
            title: `Archived thread mentioning ${query}`,
            snippet: "An archived discussion may contain a visible reference to this email or a partial match in quoted contact details.",
            tags: ["archive", "forum", "needs verification"]
          },
          {
            source: "Search index result",
            url: "https://search.example.net/result/contact-signal",
            title: "Searchable contact signal in indexed content",
            snippet: "This result suggests the email may be discoverable through pages that expose metadata, bios or cached profile information.",
            tags: ["indexed", "signal", "discoverability"]
          }
        ]
      : [
          {
            source: "Profile result",
            url: `https://example.com/u/${encodeURIComponent(query)}`,
            title: `${query} — public profile hit`,
            snippet: "A publicly accessible account-style page appears to match this handle and may contain related identity signals.",
            tags: ["username", "profile", "high confidence"]
          },
          {
            source: "Community mention",
            url: `https://community.example.org/search?q=${encodeURIComponent(query)}`,
            title: `${query} mentioned in community discussion`,
            snippet: "A search result indicates that this handle may have appeared in posts, comments or public discussion pages.",
            tags: ["mention", "community", "indexed"]
          },
          {
            source: "Cached search result",
            url: `https://index.example.net/cache/${encodeURIComponent(query)}`,
            title: `${query} found in cached public content`,
            snippet: "Cached search content suggests that this handle has some degree of discoverability across indexed pages.",
            tags: ["cache", "search hit", "medium confidence"]
          }
        ]
  };
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
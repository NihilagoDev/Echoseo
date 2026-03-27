const form = document.getElementById("searchForm");
const input = document.getElementById("searchInput");
const hitsContent = document.getElementById("hitsContent");
const summaryContent = document.getElementById("summaryContent");
const scoreValue = document.getElementById("scoreValue");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const query = input.value.trim();
  if (!query) return;

  const mock = getMockData(query);
  render(mock);
});

function render(data) {
  scoreValue.textContent = data.score;

  hitsContent.innerHTML = `
    <ul class="result-list">
      ${data.hits.map(item => `<li>${item}</li>`).join("")}
    </ul>
  `;

  summaryContent.innerHTML = `
    <p>${data.summary}</p>
    <ul class="suggestion-list">
      ${data.suggestions.map(item => `<li>${item}</li>`).join("")}
    </ul>
  `;
}

function getMockData(query) {
  return {
    score: query.includes("@") ? "74" : "61",
    hits: [
      `Public signal found for "${query}"`,
      "Possible indexed profile or mention detected",
      "Visibility appears moderate across public surfaces"
    ],
    summary: "This identity appears to have a limited but visible searchable footprint. The next version should verify sources through the backend and classify each result by confidence.",
    suggestions: [
      "Verify whether this result belongs to the same person",
      "Separate breach data from public mention data",
      "Add confidence labels per source",
      "Connect this interface to the scan endpoint"
    ]
  };
}
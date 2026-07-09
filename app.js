const form = document.getElementById('searchForm');
const input = document.getElementById('searchInput');
const hitsContent = document.getElementById('hitsContent');
const summaryContent = document.getElementById('summaryContent');
const scoreValue = document.getElementById('scoreValue');

const API_URL = 'https://tyler.deploy01.nl/api/search';

// ---------------------------------------------------------
// Demo-profielen voor goede/slechte username
// ---------------------------------------------------------
const demoDB = {
  'goede username': {
    mode: 'good',
    score: 96,
    queryLabel: 'goede username',
    metrics: { findability: 95, consistency: 97, trust: 91 },
    status: ['Hoofdaccount duidelijk gevonden', 'Sterke naamconsistentie', 'Geen directe actie nodig'],
    hitsSummaryTitle: 'Overzicht van gevonden profielen',
    hitsIntro: 'De naam "goede username" was eenvoudig te koppelen aan één duidelijk hoofdaccount. De meeste signalen wijzen op een sterke en herkenbare online identiteit.',
    hits: [
      {
        label: 'Profielpagina',
        text: 'Hoofdaccount met duidelijke bio, consistente naam en regelmatige activiteit.',
        url: 'https://example.com/@goede_username'
      },
      {
        label: 'Portfolio site',
        text: 'Persoonlijke site met dezelfde username in de URL en titel, wat de vindbaarheid versterkt.',
        url: 'https://example.com/goede-username-portfolio'
      },
      {
        label: 'Social overzicht',
        text: 'Indexpagina met links naar meerdere platforms waarop dezelfde username wordt gebruikt.',
        url: 'https://example.com/goede-username/social'
      }
    ],
    suggestions: []
  },
  'slechte username': {
    mode: 'bad',
    score: 27,
    queryLabel: 'slechte username',
    metrics: { findability: 24, consistency: 31, trust: 26 },
    status: ['Meerdere onduidelijke matches', 'Username slecht te koppelen', 'Verbetering aanbevolen'],
    hitsSummaryTitle: 'Problemen bij het vinden van profielen',
    hitsIntro: 'De naam "slechte username" leverde gefragmenteerde en tegenstrijdige resultaten op. Het was lastig om één duidelijk account te herkennen of te koppelen aan een consistente online identiteit.',
    hits: [
      {
        label: 'Losse profielhit',
        text: 'Account met een bijna-gelijke naam, maar zonder duidelijke bio of context.',
        url: 'https://example.com/@slechte_username123'
      },
      {
        label: 'Algemene vermelding',
        text: 'Random forumprofiel waar de naam voorkomt, maar zonder link naar jouw merk of activiteit.',
        url: 'https://forum.example.com/users/slechte_username'
      },
      {
        label: 'Dubieuze referentie',
        text: 'Hit waarin de username in een lijst met generieke namen staat, zonder sterke identiteit.',
        url: 'https://example.com/list/slechte-names'
      }
    ],
    suggestions: [
      'Voeg 1 of 2 unieke woorden toe aan de username, zoals een niche, locatie of merknaam.',
      'Maak bio en profieltekst duidelijker zodat direct zichtbaar is wie je bent en wat je doet.',
      'Gebruik exact dezelfde username op meerdere platforms voor betere koppeling.',
      'Plaats content rondom een duidelijk onderwerp zodat er sterkere SEO-signalen ontstaan.'
    ]
  }
};

// ---------------------------------------------------------
// Helpers
// ---------------------------------------------------------
function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function getScoreClass(score) {
  if (typeof score !== 'number') return '';
  if (score >= 80) return 'good';
  if (score <= 40) return 'bad';
  return '';
}

function updateHeaderScore(score) {
  scoreValue.textContent = score;
  scoreValue.parentElement.classList.remove('good', 'bad');
  const cls = getScoreClass(score);
  if (cls) scoreValue.parentElement.classList.add(cls);
}

// ---------------------------------------------------------
// Rendering
// ---------------------------------------------------------
function renderFromState(state) {
  updateHeaderScore(state.score);

  const statusRow = (state.status || [])
    .map(item => `<span class="status-pill">${escapeHtml(item)}</span>`)
    .join('');

  const hitsBlocks = (state.hits || [])
    .map(hit => `
      <article class="summary-block search-result">
        <h3>${escapeHtml(hit.label)}</h3>
        ${hit.url ? `
          <a class="result-title" href="${escapeHtml(hit.url)}" target="_blank" rel="noopener noreferrer">
            ${escapeHtml(hit.url)}
          </a>
        ` : ''}
        <p class="result-snippet">${escapeHtml(hit.text)}</p>
      </article>
    `)
    .join('');

  // Linker panel: titel + intro vast, hits scrollable
  hitsContent.className = 'panel-body';
  hitsContent.innerHTML = `
    <div class="left-summary">
      ${statusRow ? `<div class="status-row">${statusRow}</div>` : ''}
      <h3 class="left-summary-title">${escapeHtml(state.hitsSummaryTitle || 'Overzicht van gevonden profielen')}</h3>
      <p class="left-summary-intro">${escapeHtml(state.hitsIntro || '')}</p>
      <div class="hits-scroll">
        ${hitsBlocks || '<p class="empty-state">Geen Tavily-resultaten gevonden voor deze query.</p>'}
      </div>
    </div>
  `;

  const badgeClass = getScoreClass(state.score);
  const badgeLabel = state.score >= 80
    ? 'Sterke SEO-kwaliteit'
    : state.score <= 40
      ? 'Zwak SEO-profiel'
      : 'Gemiddeld SEO-profiel';

  const metrics = state.metrics || { findability: '--', consistency: '--', trust: '--' };

  const suggestionsList = state.suggestions && state.suggestions.length
    ? `<div class="summary-block">
         <h3>Concrete suggesties</h3>
         <ul>${state.suggestions.map(s => `<li>${escapeHtml(s)}</li>`).join('')}</ul>
       </div>`
    : `<div class="summary-block">
         <h3>Concrete suggesties</h3>
         <p>Voor deze username zijn in deze analyse geen directe verbeteringen nodig.</p>
       </div>`;

  summaryContent.className = 'panel-body';
  summaryContent.innerHTML = `
    <div class="badge ${badgeClass}">${badgeLabel}</div>
    <div class="score-detail">
      <div class="score-metric">
        <span>Vindbaarheid</span>
        <strong>${metrics.findability}/100</strong>
      </div>
      <div class="score-metric">
        <span>Consistentie</span>
        <strong>${metrics.consistency}/100</strong>
      </div>
      <div class="score-metric">
        <span>Vertrouwen</span>
        <strong>${metrics.trust}/100</strong>
      </div>
    </div>
    <div class="summary-block">
      <h3>Samenvattende score</h3>
      <p>Voor "${escapeHtml(state.queryLabel || '')}" is een SEO-score opgebouwd op basis van gevonden accountsignalen, naamconsistentie en profielcontext.</p>
    </div>
    ${suggestionsList}
  `;
}

function renderLoading(query) {
  updateHeaderScore('...');
  hitsContent.className = 'panel-body loading';
  summaryContent.className = 'panel-body loading';

  hitsContent.innerHTML = `
    <div class="left-summary loader-shell">
      <div class="status-row">
        <span class="status-pill">Profielen koppelen</span>
        <span class="status-pill">Naamvarianten vergelijken</span>
        <span class="status-pill">SEO-signalen opbouwen</span>
      </div>
      <h3 class="left-summary-title">Profieloverzicht wordt opgebouwd</h3>
      <p class="left-summary-intro">EchoSEO verwerkt nu zoeksignalen voor "${escapeHtml(query)}" en bouwt een overzicht op van account-herkenning, naamconsistentie en zichtbaarheid.</p>
      <div class="loader-bar"><div class="loader-bar-fill"></div></div>
    </div>
  `;

  summaryContent.innerHTML = `
    <div class="badge">Analyse bezig</div>
    <div class="score-detail">
      <div class="score-metric"><span>Vindbaarheid</span><strong>...</strong></div>
      <div class="score-metric"><span>Consistentie</span><strong>...</strong></div>
      <div class="score-metric"><span>Vertrouwen</span><strong>...</strong></div>
    </div>
    <div class="summary-block">
      <h3>Samenvattende score</h3>
      <p>Bezig met het samenstellen van een scoremodel voor de opgegeven username.</p>
    </div>
  `;
}

// ---------------------------------------------------------
// Search flow
// ---------------------------------------------------------
async function handleSearch(query) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return;

  // Demo cases: geen API-call, alleen fake functionaliteit
  if (normalized === 'goede username' || normalized === 'slechte username') {
    renderLoading(query);
    setTimeout(() => {
      renderFromState(demoDB[normalized]);
    }, 600);
    return;
  }

  // Alle andere cases: echte Tavily/Docker API
  renderLoading(query);
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

    const tavilyState = mapApiToState(data, query);
    renderFromState(tavilyState);
  } catch (error) {
    showError(error.message || 'Unknown error');
  }
}

// ---------------------------------------------------------
// Tavily → EchoSEO state
// ---------------------------------------------------------
function mapApiToState(apiData, query) {
  const score = typeof apiData.score === 'number' ? apiData.score : 65;

  // Zoek naar de array met Tavily-resultaten
  const rawResults =
    apiData.results ||
    apiData.data ||
    apiData.search_results ||
    apiData.hits ||
    [];

  console.log('EchoSEO debug: raw Tavily results =', rawResults);

  const hits = rawResults.slice(0, 5).map((item, index) => ({
    label: item.title || item.name || `Resultaat ${index + 1}`,
    text: item.snippet || item.content || item.description || 'Geen snippet beschikbaar uit Tavily-resultaat.',
    url: item.url || item.link || item.href || ''
  }));

  return {
    mode: 'neutral',
    score,
    queryLabel: query,
    metrics: {
      findability: apiData.metrics?.findability ?? 68,
      consistency: apiData.metrics?.consistency ?? 61,
      trust: apiData.metrics?.trust ?? 64
    },
    status: ['Live Tavily zoekopdracht uitgevoerd', 'Resultaten samengevat tot SEO-signalen'],
    hitsSummaryTitle: 'Overzicht van Tavily-resultaten',
    hitsIntro: 'Onderstaande links en snippets zijn rechtstreeks gebaseerd op Tavily-search, vergelijkbaar met een zoekmachineweergave.',
    hits,
    suggestions: [
      'Optimaliseer bio en profieltekst met duidelijke trefwoorden.',
      'Zorg dat de username terugkomt in meerdere contexten (beschrijving, handle, display name).',
      'Breid content uit rondom één centrale niche om de vindbaarheid te versterken.'
    ]
  };
}

// ---------------------------------------------------------
// Foutafhandeling
// ---------------------------------------------------------
function showError(message) {
  updateHeaderScore('--');
  hitsContent.className = 'panel-body';
  summaryContent.className = 'panel-body';

  hitsContent.innerHTML = `
    <div class="summary-block">
      <h3>API-fout</h3>
      <p>De verbinding met de Tavily/Docker-API kon niet correct worden afgerond.</p>
      <p><strong>${escapeHtml(message)}</strong></p>
    </div>
  `;

  summaryContent.innerHTML = `
    <div class="summary-block">
      <h3>Fallback-analyse</h3>
      <p>EchoSEO toont geen live SEO-score omdat de AI-functionaliteit in deze build niet beschikbaar is. Gebruik de demo-inputs "goede username" en "slechte username" om de beoogde werking te tonen.</p>
    </div>
  `;
}

// ---------------------------------------------------------
// Events & initial state
// ---------------------------------------------------------
form.addEventListener('submit', (event) => {
  event.preventDefault();
  handleSearch(input.value);
});

input.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    handleSearch(input.value);
  }
});

renderFromState({
  mode: 'neutral',
  score: '--',
  queryLabel: 'voorbeeld username',
  metrics: { findability: '--', consistency: '--', trust: '--' },
  status: ['Klaar voor analyse'],
  hitsSummaryTitle: 'Nog geen zoekopdracht uitgevoerd',
  hitsIntro: 'Voer een username, e-mailadres of handle in om een Tavily-zoekopdracht uit te voeren óf de demo-profielen te bekijken.',
  hits: [],
  suggestions: []
});
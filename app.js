const models = [
  {
    id: "gpt-4.1",
    name: "GPT-4.1",
    provider: "OpenAI",
    summary: "Strong general-purpose model for analysis, structured writing, and multi-step workflows.",
    strengths: ["reasoning", "coding", "writing", "automation", "structured", "tools", "long-context", "safety"],
    quality: 94,
    speed: 72,
    cost: 58,
    risk: 92,
  },
  {
    id: "gpt-4.1-mini",
    name: "GPT-4.1 mini",
    provider: "OpenAI",
    summary: "Fast, economical default for production tasks that need good quality without premium cost.",
    strengths: ["writing", "coding", "automation", "structured", "tools"],
    quality: 84,
    speed: 90,
    cost: 88,
    risk: 82,
  },
  {
    id: "o3",
    name: "o3",
    provider: "OpenAI",
    summary: "Deep reasoning choice for complex analysis, planning, and high-stakes evaluation.",
    strengths: ["reasoning", "coding", "safety", "structured", "long-context"],
    quality: 98,
    speed: 55,
    cost: 42,
    risk: 96,
  },
  {
    id: "claude-3-7-sonnet",
    name: "Claude 3.7 Sonnet",
    provider: "Anthropic",
    summary: "Careful long-form reasoning and drafting with strong instruction following.",
    strengths: ["reasoning", "writing", "coding", "long-context", "safety"],
    quality: 91,
    speed: 70,
    cost: 62,
    risk: 90,
  },
  {
    id: "gemini-2.5-pro",
    name: "Gemini 2.5 Pro",
    provider: "Google",
    summary: "Capable multimodal model for research, documents, and broad context synthesis.",
    strengths: ["reasoning", "vision", "long-context", "structured"],
    quality: 90,
    speed: 68,
    cost: 64,
    risk: 86,
  },
  {
    id: "llama-4-maverick",
    name: "Llama 4 Maverick",
    provider: "Meta",
    summary: "Open-weight oriented option for teams optimizing control, portability, and cost.",
    strengths: ["writing", "coding", "open-weight", "structured"],
    quality: 80,
    speed: 78,
    cost: 92,
    risk: 72,
  },
  {
    id: "mistral-large",
    name: "Mistral Large",
    provider: "Mistral",
    summary: "Balanced enterprise model with good multilingual and structured-output behavior.",
    strengths: ["writing", "coding", "automation", "structured", "tools"],
    quality: 83,
    speed: 79,
    cost: 74,
    risk: 80,
  },
  {
    id: "realtime-mini",
    name: "Realtime mini",
    provider: "OpenAI",
    summary: "Low-latency fit for voice, chat, and responsive interactive experiences.",
    strengths: ["realtime", "automation", "tools", "structured"],
    quality: 76,
    speed: 96,
    cost: 82,
    risk: 76,
  },
];

const rubric = [
  ["rubricAccuracy", "Accuracy"],
  ["rubricRelevance", "Task relevance"],
  ["rubricClarity", "Clarity"],
  ["rubricLatency", "Latency"],
  ["rubricCost", "Cost fit"],
];

const state = {
  ranked: [],
  selectedA: "gpt-4.1",
  selectedB: "claude-3-7-sonnet",
  lastVote: null,
  runs: JSON.parse(localStorage.getItem("modelmatch:runs") || "[]"),
};

const byId = (id) => document.getElementById(id);

function getFormInput() {
  const capabilities = [...document.querySelectorAll("#capabilityGroup input:checked")].map((node) => node.value);

  return {
    description: byId("taskDescription").value.trim(),
    taskType: byId("taskType").value,
    budget: byId("budget").value,
    latency: byId("latency").value,
    risk: byId("risk").value,
    capabilities,
  };
}

function scoreModel(model, input) {
  let score = model.quality * 0.45;

  if (model.strengths.includes(input.taskType)) score += 24;
  input.capabilities.forEach((capability) => {
    score += model.strengths.includes(capability) ? 8 : -3;
  });

  if (input.budget === "low") score += model.cost * 0.22;
  if (input.budget === "balanced") score += model.cost * 0.12;
  if (input.budget === "flexible") score += model.quality * 0.15;

  if (input.latency === "fast") score += model.speed * 0.23;
  if (input.latency === "standard") score += model.speed * 0.11;
  if (input.latency === "batch") score += model.quality * 0.12;

  if (input.risk === "high") score += model.risk * 0.24;
  if (input.risk === "medium") score += model.risk * 0.1;
  if (input.risk === "low") score += model.speed * 0.08;

  return Math.max(0, Math.min(100, Math.round(score / 1.55)));
}

function rankModels(input = getFormInput()) {
  state.ranked = models
    .map((model) => ({ ...model, score: scoreModel(model, input) }))
    .sort((a, b) => b.score - a.score);

  if (state.ranked[0]) {
    state.selectedA = state.ranked[0].id;
    state.selectedB = state.ranked[1]?.id || state.ranked[0].id;
  }

  renderRecommendations(input);
  renderArenaSelectors();
  generateArena();
  updateMetrics();
}

function renderRecommendations(input = getFormInput()) {
  const list = byId("recommendationList");
  list.innerHTML = "";

  const ranked = state.ranked.length ? state.ranked : models.map((model) => ({ ...model, score: scoreModel(model, input) })).sort((a, b) => b.score - a.score);
  const top = ranked.slice(0, 5);

  top.forEach((model, index) => {
    const card = document.createElement("article");
    card.className = `model-card${index === 0 ? " best" : ""}`;
    card.innerHTML = `
      <header>
        <h3>${model.name} <span class="tag">${model.provider}</span></h3>
        <span class="score-pill">${model.score}</span>
      </header>
      <p>${model.summary}</p>
      <div class="tag-row">
        ${model.strengths.slice(0, 6).map((tag) => `<span class="tag">${formatTag(tag)}</span>`).join("")}
      </div>
    `;
    list.appendChild(card);
  });

  byId("sidebarFit").textContent = `${top[0].name} (${top[0].score})`;
  byId("sidebarHint").textContent = top[0].summary;
}

function renderArenaSelectors() {
  [byId("arenaModelA"), byId("arenaModelB")].forEach((select) => {
    select.innerHTML = models.map((model) => `<option value="${model.id}">${model.name}</option>`).join("");
  });

  byId("arenaModelA").value = state.selectedA;
  byId("arenaModelB").value = state.selectedB;
}

function getModel(id) {
  return models.find((model) => model.id === id) || models[0];
}

function generateArena() {
  const input = getFormInput();
  const modelA = getModel(byId("arenaModelA").value);
  const modelB = getModel(byId("arenaModelB").value);
  state.selectedA = modelA.id;
  state.selectedB = modelB.id;

  byId("arenaTitleA").textContent = modelA.name;
  byId("arenaTitleB").textContent = modelB.name;
  byId("arenaOutputA").textContent = buildSyntheticAnswer(modelA, input);
  byId("arenaOutputB").textContent = buildSyntheticAnswer(modelB, input);
}

function buildSyntheticAnswer(model, input) {
  const task = input.description || "the submitted task";
  const matched = [input.taskType, ...input.capabilities].filter((item) => model.strengths.includes(item));
  const constraint = input.risk === "high" ? "with explicit validation checkpoints" : "with a lightweight review loop";
  const speedNote = input.latency === "fast" ? "Prioritize short prompts, cached context, and streaming responses." : "Use a richer prompt and evaluate outputs against the rubric before rollout.";

  return `${model.name} would approach ${task} by optimizing for ${formatTag(input.taskType)}. Best-fit strengths: ${matched.map(formatTag).join(", ") || "general quality"}. Recommended rollout: run a small benchmark set ${constraint}, compare against one fallback model, and track preference votes. ${speedNote}`;
}

function renderRubric() {
  const container = byId("rubricSliders");
  container.innerHTML = "";
  rubric.forEach(([id, label]) => {
    const item = document.createElement("div");
    item.className = "rubric-item";
    item.innerHTML = `
      <label for="${id}">
        <span>${label}</span>
        <strong id="${id}Value">4</strong>
      </label>
      <input id="${id}" type="range" min="1" max="5" value="4">
    `;
    container.appendChild(item);
    item.querySelector("input").addEventListener("input", (event) => {
      byId(`${id}Value`).textContent = event.target.value;
    });
  });
}

function saveRun() {
  const input = getFormInput();
  const scores = Object.fromEntries(rubric.map(([id]) => [id, Number(byId(id).value)]));
  const average = Object.values(scores).reduce((sum, value) => sum + value, 0) / rubric.length;
  const winner = state.lastVote;
  const run = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    task: input.description || "Untitled task",
    winner,
    modelA: getModel(state.selectedA).name,
    modelB: getModel(state.selectedB).name,
    topModel: (state.ranked[0] || models[0]).name,
    score: average.toFixed(1),
  };

  state.runs.unshift(run);
  state.runs = state.runs.slice(0, 8);
  localStorage.setItem("modelmatch:runs", JSON.stringify(state.runs));
  state.lastVote = null;
  document.querySelectorAll(".vote-button").forEach((button) => {
    button.textContent = `Vote ${button.dataset.vote}`;
  });
  renderHistory();
  updateMetrics();
}

function recordVote(choice) {
  const selected = choice === "A" ? getModel(state.selectedA) : getModel(state.selectedB);
  state.lastVote = selected.name;
  document.querySelectorAll(".vote-button").forEach((button) => {
    button.textContent = button.dataset.vote === choice ? `Voted ${choice}` : `Vote ${button.dataset.vote}`;
  });
  updateMetrics();
}

function renderHistory() {
  const list = byId("historyList");
  if (!state.runs.length) {
    list.innerHTML = `<div class="empty-state">Saved evaluations will appear here after you score a run.</div>`;
    return;
  }

  list.innerHTML = state.runs
    .map((run) => `
      <article class="history-item">
        <header>
          <h3>${escapeHtml(run.task)}</h3>
          <span class="score-pill">${run.score}/5</span>
        </header>
        <p>${run.modelA} vs ${run.modelB}. Recommendation: ${run.topModel}. ${run.winner ? `Vote: ${run.winner}.` : "No vote recorded."}</p>
      </article>
    `)
    .join("");
}

function updateMetrics() {
  byId("modelCount").textContent = models.length;
  byId("savedCount").textContent = state.runs.length;
  byId("voteCount").textContent = state.runs.filter((run) => run.winner).length + (state.lastVote ? 1 : 0);
}

function exportRuns() {
  const payload = JSON.stringify({ exportedAt: new Date().toISOString(), runs: state.runs }, null, 2);
  const blob = new Blob([payload], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "modelmatch-runs.json";
  link.click();
  URL.revokeObjectURL(link.href);
}

function clearRuns() {
  state.runs = [];
  state.lastVote = null;
  localStorage.removeItem("modelmatch:runs");
  renderHistory();
  updateMetrics();
}

function formatTag(tag) {
  return tag.replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  })[char]);
}

byId("matchForm").addEventListener("submit", (event) => {
  event.preventDefault();
  rankModels();
});

byId("resetButton").addEventListener("click", () => {
  byId("matchForm").reset();
  state.lastVote = null;
  renderRubric();
  rankModels();
});

byId("runArena").addEventListener("click", generateArena);
byId("arenaModelA").addEventListener("change", generateArena);
byId("arenaModelB").addEventListener("change", generateArena);
byId("saveRun").addEventListener("click", saveRun);
byId("exportRuns").addEventListener("click", exportRuns);
byId("clearRuns").addEventListener("click", clearRuns);
document.querySelectorAll(".vote-button").forEach((button) => {
  button.addEventListener("click", () => recordVote(button.dataset.vote));
});

renderRubric();
renderArenaSelectors();
rankModels();
renderHistory();

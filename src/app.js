import { cloneTemplate, createEmptyState, loadRegionTemplates } from "./data/templates.js";
import { computeResults } from "./engine.js";

const STORAGE_KEY = "lebanon-electoral-simulator:v1";
const SAVED_SCENARIOS_KEY = "lebanon-electoral-simulator:saved:v1";
const EXPORT_VERSION = 1;

const elements = {
  templateSelect: document.getElementById("templateSelect"),
  loadTemplateBtn: document.getElementById("loadTemplateBtn"),
  regionNameInput: document.getElementById("regionNameInput"),
  totalSeatsValue: document.getElementById("totalSeatsValue"),
  quotaTableBody: document.getElementById("quotaTableBody"),
  quotaLegend: document.getElementById("quotaLegend"),
  listNameInput: document.getElementById("listNameInput"),
  addListBtn: document.getElementById("addListBtn"),
  listBuilderMeta: document.getElementById("listBuilderMeta"),
  listChips: document.getElementById("listChips"),
  candidateTableBody: document.getElementById("candidateTableBody"),
  listVoteTotalsBody: document.getElementById("listVoteTotalsBody"),
  runSimulationBtn: document.getElementById("runSimulationBtn"),
  exportBtn: document.getElementById("exportBtn"),
  exportPdfBtn: document.getElementById("exportPdfBtn"),
  importBtn: document.getElementById("importBtn"),
  importFileInput: document.getElementById("importFileInput"),
  resetBtn: document.getElementById("resetBtn"),
  saveScenarioNameInput: document.getElementById("saveScenarioNameInput"),
  saveScenarioBtn: document.getElementById("saveScenarioBtn"),
  savedScenariosList: document.getElementById("savedScenariosList"),
  metricsGrid: document.getElementById("metricsGrid"),
  alertsBox: document.getElementById("alertsBox"),
  listAllocationBody: document.getElementById("listAllocationBody"),
  winnersTableBody: document.getElementById("winnersTableBody"),
  sectCoverageBody: document.getElementById("sectCoverageBody")
};

let idCounter = Date.now();
let templates = [];
let state = createEmptyState();
let simulation = computeResults(state.quotas, state.candidates);
const listColorIndexByKey = new Map();
let savedScenarios = [];

initialize().catch((error) => {
  console.error("Initialization failed:", error);
  window.alert("Failed to initialize templates. Check console for details.");
});

async function initialize() {
  templates = await loadRegionTemplates();
  state = normalizeState(loadState() ?? (templates.length > 0 ? cloneTemplate(templates[0]) : createEmptyState()));
  savedScenarios = loadSavedScenarios();

  populateTemplateSelect();
  bindEvents();
  runSimulation();
  renderAll();
}

function bindEvents() {
  elements.loadTemplateBtn.addEventListener("click", onLoadTemplate);
  elements.regionNameInput.addEventListener("input", () => {
    state.regionName = elements.regionNameInput.value;
    saveState();
    renderMetrics();
  });

  elements.addListBtn.addEventListener("click", onAddList);
  elements.listChips.addEventListener("click", onListChipsClick);
  elements.candidateTableBody.addEventListener("input", onCandidateTableInput);
  elements.candidateTableBody.addEventListener("change", onCandidateTableChange);

  elements.runSimulationBtn.addEventListener("click", () => {
    syncCandidateTableStateFromDom();
    runSimulation();
    saveState();
    renderCandidateListVoteTotals();
    renderResults();
  });

  elements.exportBtn.addEventListener("click", onExportScenario);
  elements.exportPdfBtn.addEventListener("click", onExportPdf);
  elements.importBtn.addEventListener("click", () => elements.importFileInput.click());
  elements.importFileInput.addEventListener("change", onImportScenario);
  elements.resetBtn.addEventListener("click", onResetScenario);
  elements.saveScenarioBtn.addEventListener("click", onSaveScenario);
  elements.savedScenariosList.addEventListener("click", onSavedScenariosListClick);
}

function populateTemplateSelect() {
  if (templates.length === 0) {
    elements.templateSelect.innerHTML = '<option value="">No templates found</option>';
    elements.templateSelect.disabled = true;
    elements.loadTemplateBtn.disabled = true;
    return;
  }

  elements.templateSelect.disabled = false;
  elements.loadTemplateBtn.disabled = false;
  elements.templateSelect.innerHTML = templates
    .map((template) => `<option value="${escapeHtml(template.id)}">${escapeHtml(template.name)}</option>`)
    .join("");
}

function onLoadTemplate() {
  if (templates.length === 0) {
    return;
  }

  const templateId = elements.templateSelect.value;
  const template = templates.find((item) => item.id === templateId);

  if (!template) {
    return;
  }

  const hasCustomData = state.quotas.length > 0 || state.candidates.length > 0 || state.regionName.trim() !== "";
  if (hasCustomData) {
    const confirmed = window.confirm(
      "Loading a template will replace current region, quotas, and candidates. Continue?"
    );
    if (!confirmed) {
      return;
    }
  }

  state = normalizeState(cloneTemplate(template));
  runSimulation();
  saveState();
  renderAll();
}

function onAddList() {
  const listName = elements.listNameInput.value.trim();
  if (!listName) {
    window.alert("Please enter a Party / List name.");
    return;
  }

  const slots = buildCandidateSlotsFromQuotas(state.quotas);
  if (slots.length === 0) {
    window.alert("Load a district template with seat quotas first.");
    return;
  }

  const listKey = normalizeListKey(listName);
  const existingListKeys = new Set(
    state.candidates
      .map((candidate) => normalizeListKey(candidate?.list))
      .filter(Boolean)
  );
  if (existingListKeys.has(listKey)) {
    window.alert("This list already exists. Use a new name or remove the existing list.");
    return;
  }

  slots.forEach((slot) => {
    state.candidates.push({
      id: createId("candidate"),
      name: "",
      sect: slot.sect,
      list: listName,
      votes: 0
    });
  });

  elements.listNameInput.value = "";
  runSimulation();
  saveState();
  renderAll();
}

function onListChipsClick(event) {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }

  const button = target.closest("[data-action='remove-list']");
  if (!(button instanceof HTMLElement)) {
    return;
  }

  const listKey = button.dataset.listKey;
  if (!listKey) {
    return;
  }

  state.candidates = state.candidates.filter(
    (candidate) => normalizeListKey(candidate?.list) !== listKey
  );
  runSimulation();
  saveState();
  renderAll();
}

function onCandidateTableChange(event) {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }

  const row = target.closest("tr");
  if (!row) {
    return;
  }

  const candidateId = row.dataset.id;
  const candidate = state.candidates.find((entry) => entry.id === candidateId);
  if (!candidate) {
    return;
  }

  if (target.classList.contains("candidate-name")) {
    candidate.name = target.value.trim();
  }

  if (target.classList.contains("candidate-votes")) {
    candidate.votes = clampInteger(target.value, 0);
  }

  runSimulation();
  saveState();
  renderAll();
}

function onCandidateTableInput(event) {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }

  const row = target.closest("tr");
  if (!row) {
    return;
  }

  const candidateId = row.dataset.id;
  const candidate = state.candidates.find((entry) => entry.id === candidateId);
  if (!candidate) {
    return;
  }

  if (target.classList.contains("candidate-name")) {
    candidate.name = target.value.trim();
  }

  if (target.classList.contains("candidate-votes")) {
    candidate.votes = clampInteger(target.value, 0);
  }

  runSimulation();
  renderCandidateListVoteTotals();
  renderResults();
}

function syncCandidateTableStateFromDom() {
  const rows = elements.candidateTableBody.querySelectorAll("tr[data-id]");
  rows.forEach((row) => {
    if (!(row instanceof HTMLTableRowElement)) {
      return;
    }

    const candidateId = row.dataset.id;
    if (!candidateId) {
      return;
    }

    const candidate = state.candidates.find((entry) => entry.id === candidateId);
    if (!candidate) {
      return;
    }

    const nameInput = row.querySelector(".candidate-name");
    if (nameInput instanceof HTMLInputElement) {
      candidate.name = nameInput.value.trim();
    }

    const votesInput = row.querySelector(".candidate-votes");
    if (votesInput instanceof HTMLInputElement) {
      candidate.votes = clampInteger(votesInput.value, 0);
    }
  });
}

function onExportScenario() {
  const payload = {
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    scenario: {
      regionName: state.regionName,
      quotas: state.quotas.map((entry) => ({ sect: entry.sect, seats: entry.seats })),
      quotasLocked: state.quotasLocked,
      candidates: state.candidates.map((candidate) => ({
        name: candidate.name,
        sect: candidate.sect,
        list: candidate.list,
        votes: candidate.votes
      }))
    }
  };

  const fileName = `electoral-scenario-${slugify(state.regionName || "custom")}.json`;
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

function onExportPdf() {
  runSimulation();
  const lines = buildPdfReportLines();
  const bytes = buildPlainTextPdf(lines);
  const fileName = `electoral-simulation-${slugify(state.regionName || "custom")}.pdf`;
  const blob = new Blob([bytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

async function onImportScenario(event) {
  const input = event.target;
  if (!(input instanceof HTMLInputElement) || !input.files || input.files.length === 0) {
    return;
  }

  try {
    const file = input.files[0];
    const content = await file.text();
    const parsed = JSON.parse(content);
    const rawScenario = parsed && parsed.scenario ? parsed.scenario : parsed;
    const rawCandidateCount = Array.isArray(rawScenario?.candidates) ? rawScenario.candidates.length : 0;
    const imported = normalizeImportedState(parsed);
    const skippedCount = Math.max(0, rawCandidateCount - imported.candidates.length);
    state = imported;
    runSimulation();
    saveState();
    renderAll();

    if (skippedCount > 0) {
      window.alert(
        `${skippedCount} candidate${skippedCount > 1 ? "s were" : " was"} skipped because sect and Party / List are mandatory.`
      );
    }
  } catch (error) {
    window.alert("Import failed. Ensure the JSON matches the export format.");
    console.error(error);
  } finally {
    input.value = "";
  }
}

function onResetScenario() {
  const confirmed = window.confirm("This will clear all current data. Continue?");
  if (!confirmed) {
    return;
  }

  state = createEmptyState();
  runSimulation();
  saveState();
  renderAll();
}

function onSaveScenario() {
  const snapshot = normalizeState(state);
  const typedName = elements.saveScenarioNameInput.value.trim();
  const fallbackName = snapshot.regionName.trim() || `Saved Simulation ${savedScenarios.length + 1}`;
  const name = typedName || fallbackName;

  savedScenarios.unshift({
    id: createId("saved"),
    name,
    savedAt: new Date().toISOString(),
    scenario: snapshot
  });

  saveSavedScenarios();
  elements.saveScenarioNameInput.value = "";
  renderSavedScenarios();
}

function onSavedScenariosListClick(event) {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }

  const trigger = target.closest("[data-action]");
  if (!(trigger instanceof HTMLElement)) {
    return;
  }

  const savedId = trigger.dataset.id;
  if (!savedId) {
    return;
  }

  const savedEntry = savedScenarios.find((entry) => entry.id === savedId);
  if (!savedEntry) {
    return;
  }

  if (trigger.dataset.action === "open-saved") {
    state = normalizeState(savedEntry.scenario);
    runSimulation();
    saveState();
    renderAll();
    return;
  }

  if (trigger.dataset.action === "delete-saved") {
    const confirmed = window.confirm(`Delete saved simulation "${savedEntry.name}"?`);
    if (!confirmed) {
      return;
    }

    savedScenarios = savedScenarios.filter((entry) => entry.id !== savedId);
    saveSavedScenarios();
    renderSavedScenarios();
  }
}

function renderAll() {
  rebuildListColorIndex();
  elements.regionNameInput.value = state.regionName;
  renderQuotaTable();
  renderListBuilder();
  renderCandidateTable();
  renderCandidateListVoteTotals();
  renderSavedScenarios();
  renderResults();
}

function renderQuotaTable() {
  elements.totalSeatsValue.textContent = String(state.quotas.reduce((sum, entry) => sum + entry.seats, 0));

  if (state.quotas.length === 0) {
    elements.quotaTableBody.innerHTML =
      '<tr><td colspan="1" class="empty">No seat quotas configured. Load a district template to start.</td></tr>';
    elements.quotaLegend.innerHTML = "";
    return;
  }

  const abbreviations = buildSectAbbreviations(state.quotas);
  const quotasLocked = state.quotasLocked === true;
  const lockNotice = quotasLocked
    ? '<p class="muted quota-lock-note">Seat quotas are locked after template load to preserve calculation integrity.</p>'
    : "";

  elements.quotaTableBody.innerHTML = state.quotas
    .map(
      (entry, index) => `
      <tr data-id="${escapeHtml(entry.id)}">
        <td>
          <div class="quota-cell-main">
            <span class="sect-abbr-badge" title="${escapeHtml(entry.sect)}">${escapeHtml(abbreviations[index]?.abbr || "?")}</span>
            <span class="quota-seat-inline">${entry.seats} seat${entry.seats === 1 ? "" : "s"}</span>
          </div>
        </td>
      </tr>
    `
    )
    .join("");

  elements.quotaLegend.innerHTML = `
    ${lockNotice}
    <p class="quota-legend-title">Abbreviation Key</p>
    <div class="quota-legend-grid">
      ${abbreviations
        .map(
          (entry) => `
            <div class="quota-legend-item">
              <span class="sect-abbr-badge">${escapeHtml(entry.abbr)}</span>
              <span>${escapeHtml(entry.sect)}</span>
            </div>
          `
        )
        .join("")}
    </div>
  `;
}

function renderListBuilder() {
  const slotsPerList = buildCandidateSlotsFromQuotas(state.quotas).length;
  if (slotsPerList === 0) {
    elements.addListBtn.disabled = true;
    elements.listBuilderMeta.textContent = "Load a district template first to generate list candidate slots.";
  } else {
    elements.addListBtn.disabled = false;
    elements.listBuilderMeta.textContent = `Each list creates ${slotsPerList} slot${slotsPerList > 1 ? "s" : ""} with sects assigned from district quotas.`;
  }

  const listRows = getConfiguredLists();
  if (listRows.length === 0) {
    elements.listChips.innerHTML = '<p class="muted">No lists added yet.</p>';
    return;
  }

  elements.listChips.innerHTML = listRows
    .map(
      (row) => `
        <div class="list-manager-item">
          ${renderListChip(row.list)}
          <span class="list-manager-count">${row.slots} slot${row.slots > 1 ? "s" : ""}</span>
          <button class="btn btn-danger btn-small" data-action="remove-list" data-list-key="${escapeHtml(row.key)}">
            Remove
          </button>
        </div>
      `
    )
    .join("");
}

function renderCandidateTable() {
  if (state.candidates.length === 0) {
    elements.candidateTableBody.innerHTML =
      '<tr><td colspan="4" class="empty">Add a list to auto-generate candidate slots by sect.</td></tr>';
    return;
  }

  const slotCounter = new Map();
  elements.candidateTableBody.innerHTML = state.candidates
    .map((candidate) => {
      const listKey = normalizeListKey(candidate.list);
      const sectKey = normalizeSect(candidate.sect);
      const counterKey = `${listKey}::${sectKey}`;
      const slotNumber = (slotCounter.get(counterKey) ?? 0) + 1;
      slotCounter.set(counterKey, slotNumber);

      return `
        <tr data-id="${escapeHtml(candidate.id)}">
          <td>${renderListChip(candidate.list)}</td>
          <td><span class="sect-slot-label">${escapeHtml(candidate.sect)} #${slotNumber}</span></td>
          <td class="candidate-name-cell"><input class="row-edit candidate-name" type="text" value="${escapeHtml(
            candidate.name
          )}" placeholder="Candidate full name" /></td>
          <td class="candidate-votes-cell"><input class="row-edit candidate-votes" type="number" min="0" step="1" value="${
            candidate.votes
          }" /></td>
        </tr>
      `;
    })
    .join("");
}

function renderCandidateListVoteTotals() {
  const grouped = new Map();

  for (const candidate of state.candidates) {
    const listName = String(candidate?.list ?? "").trim();
    if (!listName) {
      continue;
    }

    const key = normalizeListKey(listName);
    if (!grouped.has(key)) {
      grouped.set(key, {
        list: listName,
        votes: 0,
        filled: 0,
        slots: 0
      });
    }

    const row = grouped.get(key);
    row.votes += clampInteger(candidate?.votes, 0);
    row.slots += 1;
    if (String(candidate?.name ?? "").trim()) {
      row.filled += 1;
    }
  }

  const rows = Array.from(grouped.values()).sort((a, b) => {
    if (b.votes !== a.votes) {
      return b.votes - a.votes;
    }
    return a.list.localeCompare(b.list, "en", { sensitivity: "base" });
  });

  if (rows.length === 0) {
    elements.listVoteTotalsBody.innerHTML =
      '<tr><td colspan="3" class="empty">Add a list to generate candidate slots and list vote totals.</td></tr>';
    return;
  }

  const totalVotes = rows.reduce((sum, row) => sum + row.votes, 0);
  const totalFilledCandidates = rows.reduce((sum, row) => sum + row.filled, 0);
  const totalCandidateSlots = rows.reduce((sum, row) => sum + row.slots, 0);

  elements.listVoteTotalsBody.innerHTML = `
    ${rows
      .map(
        (row) => `
          <tr>
            <td>${renderListChip(row.list)}</td>
            <td>${row.filled}/${row.slots}</td>
            <td>${formatNumber(row.votes)}</td>
          </tr>
        `
      )
      .join("")}
    <tr class="list-totals-final-row">
      <td>Grand Total</td>
      <td>${totalFilledCandidates}/${totalCandidateSlots}</td>
      <td>${formatNumber(totalVotes)}</td>
    </tr>
  `;
}

function renderSavedScenarios() {
  if (savedScenarios.length === 0) {
    elements.savedScenariosList.innerHTML =
      '<p class="muted">No saved simulations yet. Save one to reopen it later.</p>';
    return;
  }

  elements.savedScenariosList.innerHTML = savedScenarios
    .map((entry) => {
      const snapshot = normalizeState(entry.scenario);
      const seats = snapshot.quotas.reduce((sum, quota) => sum + quota.seats, 0);
      const slots = snapshot.candidates.length;
      const regionLabel = snapshot.regionName.trim() || "Unnamed region";
      const savedAt = formatSavedAt(entry.savedAt);

      return `
        <article class="saved-sim-item">
          <div class="saved-sim-main">
            <p class="saved-sim-name">${escapeHtml(entry.name)}</p>
            <p class="saved-sim-meta">${escapeHtml(
              `${regionLabel} | ${seats} seats | ${slots} slots | Saved ${savedAt}`
            )}</p>
          </div>
          <div class="saved-sim-actions">
            <button class="btn btn-secondary btn-small" data-action="open-saved" data-id="${escapeHtml(entry.id)}">
              Open
            </button>
            <button class="btn btn-danger btn-small" data-action="delete-saved" data-id="${escapeHtml(entry.id)}">
              Delete
            </button>
          </div>
        </article>
      `;
    })
    .join("");
}

function buildCandidateSlotsFromQuotas(quotas) {
  const slots = [];
  if (!Array.isArray(quotas)) {
    return slots;
  }

  quotas.forEach((quota) => {
    const sect = String(quota?.sect ?? "").trim();
    const seats = clampInteger(quota?.seats, 0);
    if (!sect || seats <= 0) {
      return;
    }

    for (let index = 1; index <= seats; index += 1) {
      slots.push({ sect });
    }
  });

  return slots;
}

function getConfiguredLists() {
  const grouped = new Map();
  state.candidates.forEach((candidate) => {
    const list = String(candidate?.list ?? "").trim();
    if (!list) {
      return;
    }

    const key = normalizeListKey(list);
    if (!grouped.has(key)) {
      grouped.set(key, { key, list, slots: 0 });
    }

    grouped.get(key).slots += 1;
  });

  return Array.from(grouped.values()).sort((a, b) =>
    a.list.localeCompare(b.list, "en", { sensitivity: "base" })
  );
}

function runSimulation() {
  simulation = computeResults(state.quotas, state.candidates);
}

function renderResults() {
  renderMetrics();
  renderAlerts();
  renderListAllocationTable();
  renderWinnersTable();
  renderSectCoverageTable();
}

function renderMetrics() {
  const summary = simulation.summary;
  const districtLabel = state.regionName.trim() || "Unnamed region";
  const cards = [
    { label: "District", value: districtLabel },
    { label: "Total Seats", value: String(summary.totalSeats) },
    { label: "Filled Seats", value: String(summary.filledSeats) },
    { label: "Seat Coverage", value: `${summary.coveragePct}%` },
    { label: "Candidates", value: String(summary.totalCandidates) },
    { label: "Total Votes", value: formatNumber(summary.totalVotes) },
    { label: "Electoral Quotient (EQ)", value: summary.electoralQuotient > 0 ? formatDecimal(summary.electoralQuotient) : "-" },
    { label: "Qualified Lists", value: String(summary.qualifiedListCount) }
  ];

  elements.metricsGrid.innerHTML = cards
    .map(
      (card) => `
      <article class="metric-card">
        <p>${escapeHtml(card.label)}</p>
        <strong>${escapeHtml(card.value)}</strong>
      </article>
    `
    )
    .join("");
}

function renderAlerts() {
  const warningAlerts = simulation.warnings.map(
    (warning) => `<div class="alert alert-warning">${escapeHtml(warning)}</div>`
  );

  const infoAlert = [
    '<div class="alert alert-info">Model: seats are first allocated to lists using EQ (electoral quotient) and largest remainder. Candidate winners are then selected by vote rank within sect quotas and each list seat cap.</div>'
  ];

  const successAlert =
    simulation.warnings.length === 0
      ? ['<div class="alert alert-success">No conflicts detected in this simulation run.</div>']
      : [];

  elements.alertsBox.innerHTML = [...successAlert, ...warningAlerts, ...infoAlert].join("");
}

function renderListAllocationTable() {
  const rows = Array.isArray(simulation.listAllocation) ? simulation.listAllocation : [];
  if (rows.length === 0) {
    elements.listAllocationBody.innerHTML =
      '<tr><td colspan="6" class="empty">Add candidates with party/list names to compute EQ allocation.</td></tr>';
    return;
  }

  const sorted = [...rows].sort((a, b) => {
    if (b.seats !== a.seats) {
      return b.seats - a.seats;
    }
    if (b.votes !== a.votes) {
      return b.votes - a.votes;
    }
    return a.list.localeCompare(b.list, "en", { sensitivity: "base" });
  });

  elements.listAllocationBody.innerHTML = sorted
    .map((row) => {
      const statusClass = row.qualified ? "pill pill-qualified" : "pill pill-disqualified";
      const statusLabel = row.qualified ? "Qualified" : "Below EQ";

      return `
        <tr>
          <td>${renderListChip(row.list)}</td>
          <td>${formatNumber(row.votes)}</td>
          <td><span class="${statusClass}">${statusLabel}</span></td>
          <td>${row.seats}</td>
          <td>${row.baseSeats}</td>
          <td>${formatDecimal(row.remainderVotes)}</td>
        </tr>
      `;
    })
    .join("");
}

function renderWinnersTable() {
  if (simulation.winners.length === 0) {
    elements.winnersTableBody.innerHTML =
      '<tr><td colspan="6" class="empty">Run with valid quotas and candidates to display winners.</td></tr>';
    return;
  }

  elements.winnersTableBody.innerHTML = simulation.winners
    .map(
      (winner) => `
      <tr>
        <td>${winner.seatNumber}</td>
        <td>${escapeHtml(winner.sect)}</td>
        <td>${escapeHtml(winner.name)}</td>
        <td>${renderListChip(winner.list)}</td>
        <td>${formatNumber(winner.votes)}</td>
        <td>${winner.margin === null ? "-" : formatNumber(winner.margin)}</td>
      </tr>
    `
    )
    .join("");
}

function renderSectCoverageTable() {
  if (simulation.sectCoverage.length === 0) {
    elements.sectCoverageBody.innerHTML =
      '<tr><td colspan="4" class="empty">Seat coverage appears after sect quotas are configured.</td></tr>';
    return;
  }

  elements.sectCoverageBody.innerHTML = simulation.sectCoverage
    .map(
      (entry) => `
      <tr>
        <td>${escapeHtml(entry.sect)}</td>
        <td>${entry.requiredSeats}</td>
        <td>${entry.electedSeats}</td>
        <td>${entry.remaining}</td>
      </tr>
    `
    )
    .join("");
}

function createId(prefix) {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

function clampInteger(value, min = 0) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return min;
  }

  return Math.max(min, Math.floor(parsed));
}

function normalizeSect(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

function getSectAbbreviationOptions(sectName) {
  const words = String(sectName ?? "")
    .toUpperCase()
    .match(/[A-Z]+/g) ?? [];
  const joined = words.join("");
  const options = [];

  if (joined) {
    options.push(joined[0]);
    for (const character of joined.slice(1)) {
      options.push(character);
    }
  }

  if (words.length > 0) {
    const firstWord = words[0];
    if (firstWord.length >= 2) {
      options.push(firstWord.slice(0, 2));
    }
  }

  if (words.length >= 2) {
    options.push(`${words[0][0]}${words[1][0]}`);
  }

  if (joined.length >= 2) {
    for (let i = 1; i < joined.length; i += 1) {
      options.push(`${joined[0]}${joined[i]}`);
    }
  }

  return Array.from(
    new Set(
      options
        .map((value) => value.replace(/[^A-Z]/g, ""))
        .filter((value) => value.length >= 1 && value.length <= 2)
    )
  );
}

function buildSectAbbreviations(quotas) {
  const used = new Set();
  const entries = [];

  for (const quota of quotas) {
    const sect = String(quota?.sect ?? "").trim();
    const options = getSectAbbreviationOptions(sect);
    let chosen = options.find((option) => !used.has(option));

    if (!chosen) {
      for (let first = 65; first <= 90 && !chosen; first += 1) {
        const oneLetter = String.fromCharCode(first);
        if (!used.has(oneLetter)) {
          chosen = oneLetter;
          break;
        }

        for (let second = 65; second <= 90; second += 1) {
          const twoLetters = `${String.fromCharCode(first)}${String.fromCharCode(second)}`;
          if (!used.has(twoLetters)) {
            chosen = twoLetters;
            break;
          }
        }
      }
    }

    chosen = chosen || "NA";
    used.add(chosen);
    entries.push({
      id: quota.id,
      sect,
      abbr: chosen
    });
  }

  return entries;
}

function normalizeState(input) {
  const base = {
    regionName: String(input?.regionName ?? ""),
    quotas: [],
    candidates: [],
    quotasLocked: input?.quotasLocked === true
  };

  const quotaAccumulator = new Map();
  if (Array.isArray(input?.quotas)) {
    for (const raw of input.quotas) {
      const sect = String(raw?.sect ?? "").trim();
      const seats = clampInteger(raw?.seats, 0);
      if (!sect || seats <= 0) {
        continue;
      }

      const key = normalizeSect(sect);
      if (quotaAccumulator.has(key)) {
        quotaAccumulator.get(key).seats += seats;
      } else {
        quotaAccumulator.set(key, { id: raw?.id || createId("quota"), sect, seats });
      }
    }
  }

  base.quotas = Array.from(quotaAccumulator.values());

  if (Array.isArray(input?.candidates)) {
    for (const raw of input.candidates) {
      const name = String(raw?.name ?? "").trim();
      const sect = String(raw?.sect ?? "").trim();
      const list = String(raw?.list ?? "").trim();
      if (!sect || !list) {
        continue;
      }

      base.candidates.push({
        id: raw?.id || createId("candidate"),
        name,
        sect,
        list,
        votes: clampInteger(raw?.votes, 0)
      });
    }
  }

  return base;
}

function normalizeImportedState(parsed) {
  if (parsed && parsed.scenario) {
    return normalizeState(parsed.scenario);
  }

  return normalizeState(parsed);
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("Unable to save state", error);
  }
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    return normalizeState(parsed);
  } catch (error) {
    console.error("Unable to load state", error);
    return null;
  }
}

function saveSavedScenarios() {
  try {
    localStorage.setItem(SAVED_SCENARIOS_KEY, JSON.stringify(savedScenarios));
  } catch (error) {
    console.error("Unable to save saved simulations", error);
  }
}

function loadSavedScenarios() {
  try {
    const raw = localStorage.getItem(SAVED_SCENARIOS_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return normalizeSavedScenarios(parsed);
  } catch (error) {
    console.error("Unable to load saved simulations", error);
    return [];
  }
}

function normalizeSavedScenarios(input) {
  if (!Array.isArray(input)) {
    return [];
  }

  return input.map((entry, index) => {
    const scenario = normalizeState(entry?.scenario ?? entry);
    const name = String(entry?.name ?? "").trim() || scenario.regionName.trim() || `Saved Simulation ${index + 1}`;
    const savedAtValue = new Date(entry?.savedAt ?? entry?.updatedAt ?? entry?.createdAt ?? "");
    const savedAt = Number.isNaN(savedAtValue.getTime()) ? new Date().toISOString() : savedAtValue.toISOString();

    return {
      id: String(entry?.id ?? "").trim() || createId("saved"),
      name,
      savedAt,
      scenario
    };
  });
}

function formatSavedAt(value) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "Unknown date";
  }

  return parsed.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  });
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString("en-US");
}

function formatDecimal(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return "-";
  }

  return numeric.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

function buildPdfReportLines() {
  const summary = simulation.summary;
  const generatedAt = new Date().toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  });
  const districtLabel = state.regionName.trim() || "Unnamed region";
  const lines = [
    "Lebanon Electoral Simulation Report",
    `Generated: ${generatedAt}`,
    `District: ${districtLabel}`,
    "",
    "Summary",
    `- Total Seats: ${summary.totalSeats}`,
    `- Filled Seats: ${summary.filledSeats}`,
    `- Seat Coverage: ${summary.coveragePct}%`,
    `- Candidates: ${summary.totalCandidates}`,
    `- Total Votes: ${formatNumber(summary.totalVotes)}`,
    `- Electoral Quotient (EQ): ${summary.electoralQuotient > 0 ? formatDecimal(summary.electoralQuotient) : "-"}`,
    `- Qualified Lists: ${summary.qualifiedListCount}`,
    "",
    "List EQ Allocation"
  ];

  const listRows = Array.isArray(simulation.listAllocation)
    ? [...simulation.listAllocation].sort((a, b) => {
        if (b.seats !== a.seats) {
          return b.seats - a.seats;
        }
        if (b.votes !== a.votes) {
          return b.votes - a.votes;
        }
        return a.list.localeCompare(b.list, "en", { sensitivity: "base" });
      })
    : [];

  if (listRows.length === 0) {
    lines.push("- No list allocation available.");
  } else {
    listRows.forEach((row) => {
      lines.push(
        `- ${row.list}: votes ${formatNumber(row.votes)} | ${row.qualified ? "Qualified" : "Below EQ"} | seats ${row.seats} | base ${row.baseSeats} | remainder ${formatDecimal(row.remainderVotes)}`
      );
    });
  }

  lines.push("", "Winning Candidates");
  if (!simulation.winners || simulation.winners.length === 0) {
    lines.push("- No winners in current simulation.");
  } else {
    simulation.winners.forEach((winner) => {
      lines.push(
        `- Seat #${winner.seatNumber} (${winner.sect}): ${winner.name} | ${winner.list} | votes ${formatNumber(winner.votes)} | margin ${winner.margin === null ? "-" : formatNumber(winner.margin)}`
      );
    });
  }

  lines.push("", "Sect Coverage");
  if (!simulation.sectCoverage || simulation.sectCoverage.length === 0) {
    lines.push("- No sect coverage available.");
  } else {
    simulation.sectCoverage.forEach((row) => {
      lines.push(
        `- ${row.sect}: required ${row.requiredSeats}, elected ${row.electedSeats}, remaining ${row.remaining}`
      );
    });
  }

  lines.push("", "Warnings");
  if (!simulation.warnings || simulation.warnings.length === 0) {
    lines.push("- None");
  } else {
    simulation.warnings.forEach((warning) => lines.push(`- ${warning}`));
  }

  return wrapLinesForPdf(lines, 96);
}

function wrapLinesForPdf(lines, maxChars) {
  const output = [];
  for (const rawLine of lines) {
    const line = String(rawLine ?? "");
    if (!line) {
      output.push("");
      continue;
    }

    const words = line.split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      output.push("");
      continue;
    }

    let current = words[0];
    for (let i = 1; i < words.length; i += 1) {
      const next = words[i];
      if (current.length + 1 + next.length <= maxChars) {
        current += ` ${next}`;
      } else {
        output.push(current);
        current = next;
      }
    }
    output.push(current);
  }

  return output;
}

function escapePdfText(value) {
  return String(value ?? "")
    .replaceAll("\\", "\\\\")
    .replaceAll("(", "\\(")
    .replaceAll(")", "\\)")
    .replaceAll(/\r?\n/g, " ");
}

function byteLengthUtf8(text) {
  return new TextEncoder().encode(text).length;
}

function buildPlainTextPdf(lines) {
  const safeLines = Array.isArray(lines) ? lines.map((line) => escapePdfText(line)) : [];
  const linesPerPage = 50;
  const pages = [];

  for (let i = 0; i < safeLines.length; i += linesPerPage) {
    pages.push(safeLines.slice(i, i + linesPerPage));
  }

  if (pages.length === 0) {
    pages.push(["Lebanon Electoral Simulation Report", "No data available."]);
  }

  const objects = [];
  const pageObjectIds = [];
  const fontObjectId = 3 + pages.length * 2;
  const totalObjects = fontObjectId;

  objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
  objects[2] = "<< /Type /Pages /Kids [] /Count 0 >>";

  pages.forEach((pageLines, pageIndex) => {
    const pageObjectId = 3 + pageIndex * 2;
    const contentObjectId = pageObjectId + 1;
    pageObjectIds.push(pageObjectId);

    const textCommands = ["BT", "/F1 10 Tf", "14 TL", "40 780 Td"];
    pageLines.forEach((line, index) => {
      textCommands.push(`(${line}) Tj`);
      if (index < pageLines.length - 1) {
        textCommands.push("T*");
      }
    });
    textCommands.push("ET");
    const stream = `${textCommands.join("\n")}\n`;

    objects[contentObjectId] = `<< /Length ${byteLengthUtf8(stream)} >>\nstream\n${stream}endstream`;
    objects[pageObjectId] =
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] ` +
      `/Resources << /Font << /F1 ${fontObjectId} 0 R >> >> ` +
      `/Contents ${contentObjectId} 0 R >>`;
  });

  objects[fontObjectId] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";
  objects[2] = `<< /Type /Pages /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageObjectIds.length} >>`;

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  for (let id = 1; id <= totalObjects; id += 1) {
    offsets[id] = byteLengthUtf8(pdf);
    pdf += `${id} 0 obj\n${objects[id]}\nendobj\n`;
  }

  const xrefOffset = byteLengthUtf8(pdf);
  pdf += `xref\n0 ${totalObjects + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (let id = 1; id <= totalObjects; id += 1) {
    pdf += `${String(offsets[id]).padStart(10, "0")} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${totalObjects + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return new TextEncoder().encode(pdf);
}

function normalizeListKey(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function rebuildListColorIndex() {
  listColorIndexByKey.clear();

  const keys = Array.from(
    new Set(
      state.candidates
        .map((candidate) => normalizeListKey(candidate?.list))
        .filter(Boolean)
    )
  ).sort((a, b) => a.localeCompare(b, "en", { sensitivity: "base" }));

  keys.forEach((key, index) => {
    listColorIndexByKey.set(key, index);
  });
}

function getListPalette(listName) {
  const key = normalizeListKey(listName);
  if (!key) {
    return {
      bg: "#eef3f8",
      border: "#c7d3de",
      text: "#2c3e50",
      dot: "#5a7087"
    };
  }

  const colorIndex = listColorIndexByKey.get(key) ?? 0;
  const hue = Math.round((colorIndex * 137.508) % 360);

  return {
    bg: `hsl(${hue} 74% 95%)`,
    border: `hsl(${hue} 58% 68%)`,
    text: `hsl(${hue} 60% 26%)`,
    dot: `hsl(${hue} 72% 42%)`
  };
}

function renderListChip(listName) {
  const value = String(listName ?? "").trim();
  if (!value) {
    return "-";
  }

  const palette = getListPalette(value);
  const style = `--list-chip-bg:${palette.bg};--list-chip-border:${palette.border};--list-chip-text:${palette.text};--list-chip-dot:${palette.dot};`;
  return `<span class="list-chip" style="${style}"><span class="list-chip-dot"></span>${escapeHtml(value)}</span>`;
}

function slugify(value) {
  return String(value ?? "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

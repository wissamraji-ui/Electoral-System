import {
  cloneTemplate,
  createEmptyState,
  getTemplatesDataVersion,
  loadRegionTemplates
} from "./data/templates.js";
import { getElectionMiscVotesDataVersion } from "./data/election-misc-votes.js";
import {
  getElectionResults2022DataVersion,
  hasElectionResults2022,
  loadElectionResults2022
} from "./data/election-results-2022.js";
import {
  getElectionResults2018DataVersion,
  hasElectionResults2018,
  loadElectionResults2018
} from "./data/election-results-2018.js";
import { BUILD_ID } from "./generated/build-meta.js";
import { computeResults, computeSeatChangeThresholds } from "./engine.js";

const STORAGE_KEY = "lebanon-electoral-simulator:v1";
const SAVED_SCENARIOS_KEY = "lebanon-electoral-simulator:saved:v1";
const BUILD_RELOAD_STORAGE_KEY = "lebanon-electoral-simulator:last-build-reload";
const BUILD_QUERY_PARAM = "__build";
const SHARE_SCENARIO_QUERY_PARAM = "scenario";
const EXPORT_VERSION = 2;
const STATE_SCHEMA_VERSION = 3;
const CURRENT_DATA_VERSION = [
  `templates:${getTemplatesDataVersion()}`,
  `misc-votes:${getElectionMiscVotesDataVersion()}`,
  `results-2018:${getElectionResults2018DataVersion()}`,
  `results-2022:${getElectionResults2022DataVersion()}`
].join("|");

const GLOSSARY_TERMS = {
  quota: {
    title: "Quota",
    body:
      "A fixed number of seats assigned to a sect in a district. The simulator must fill those seats according to the district's legal seat map."
  },
  "preferential-vote": {
    title: "Preferential Vote",
    body:
      "The vote a voter gives to an individual candidate on a list. These votes help decide which candidates take the seats won by their list."
  },
  "confessional-seat": {
    title: "Confessional Seat",
    body:
      "A parliamentary seat reserved for a specific sect under Lebanon's confessional allocation system."
  },
  "list-threshold": {
    title: "List Threshold",
    body:
      "The minimum level of support a list needs to remain competitive for seat allocation. In this simulator, that threshold is represented through the qualifying electoral quotient."
  },
  "minor-district": {
    title: "Minor District",
    body:
      "A sub-district inside a larger electoral district. Some seats are tied to both a sect and a specific minor district."
  },
  "qualifying-list": {
    title: "Qualifying List",
    body:
      "A list that clears the qualifying electoral quotient and remains eligible for seat allocation."
  },
  "base-seats": {
    title: "Base Seats",
    body:
      "The whole-number seats a list wins before any leftover seats are assigned by largest remainder."
  },
  eq: {
    title: "EQ",
    body:
      "EQ means electoral quotient. It is the vote divisor used to determine which lists qualify and how seats are allocated."
  },
  list: {
    title: "List",
    body:
      "A slate of candidates running together. Lebanese voters choose among lists and then give a preferential vote to a candidate within a list."
  }
};

const elements = {
  templateSelect: document.getElementById("templateSelect"),
  districtLaunchpad: document.getElementById("districtLaunchpad"),
  launchpadHelper: document.getElementById("launchpadHelper"),
  loadNewSimulationBtn: document.getElementById("loadNewSimulationBtn"),
  load2022PresetBtn: document.getElementById("load2022PresetBtn"),
  load2018PresetBtn: document.getElementById("load2018PresetBtn"),
  presetStatusNote: document.getElementById("presetStatusNote"),
  districtConfigDetails: document.getElementById("districtConfigDetails"),
  simulationInputs: document.getElementById("simulationInputs"),
  regionNameInput: document.getElementById("regionNameInput"),
  totalSeatsValue: document.getElementById("totalSeatsValue"),
  quotaTableBody: document.getElementById("quotaTableBody"),
  listNameInput: document.getElementById("listNameInput"),
  addListBtn: document.getElementById("addListBtn"),
  listBuilderMeta: document.getElementById("listBuilderMeta"),
  listChips: document.getElementById("listChips"),
  candidateTableBody: document.getElementById("candidateTableBody"),
  listVoteTotalsBody: document.getElementById("listVoteTotalsBody"),
  runSimulationBtn: document.getElementById("runSimulationBtn"),
  shareUrlBtn: document.getElementById("shareUrlBtn"),
  exportBtn: document.getElementById("exportBtn"),
  exportPdfBtn: document.getElementById("exportPdfBtn"),
  importBtn: document.getElementById("importBtn"),
  importFileInput: document.getElementById("importFileInput"),
  resetBtn: document.getElementById("resetBtn"),
  saveScenarioNameInput: document.getElementById("saveScenarioNameInput"),
  saveScenarioBtn: document.getElementById("saveScenarioBtn"),
  savedScenariosList: document.getElementById("savedScenariosList"),
  resultsSelectionNotice: document.getElementById("resultsSelectionNotice"),
  resultsWorkspace: document.getElementById("resultsWorkspace"),
  metricsGrid: document.getElementById("metricsGrid"),
  alertsBox: document.getElementById("alertsBox"),
  listAllocationBody: document.getElementById("listAllocationBody"),
  winnersTableBody: document.getElementById("winnersTableBody"),
  listSeatSummary: document.getElementById("listSeatSummary"),
  shareComparison: document.getElementById("shareComparison"),
  listVoteBars: document.getElementById("listVoteBars"),
  closestRaces: document.getElementById("closestRaces"),
  sectQuotaBars: document.getElementById("sectQuotaBars"),
  seatGainThresholds: document.getElementById("seatGainThresholds"),
  seatPieChart: document.getElementById("seatPieChart"),
  competitivenessChart: document.getElementById("competitivenessChart"),
  listSectMap: document.getElementById("listSectMap"),
  candidateLeaderboard: document.getElementById("candidateLeaderboard"),
  buildIdBadge: document.getElementById("buildIdBadge"),
  glossaryTooltip: document.getElementById("glossaryTooltip")
};

let idCounter = Date.now();
let templates = [];
let state = createEmptyState();
let simulation = computeResults(state.quotas, state.candidates, state.listVotes, state.blankVotes, state.invalidVotes);
const listColorIndexByKey = new Map();
let savedScenarios = [];
let activeGlossaryTrigger = null;

initialize().catch((error) => {
  console.error("Initialization failed:", error);
  window.alert("Failed to initialize templates. Check console for details.");
});

async function initialize() {
  await ensureLatestBuild();
  templates = await loadRegionTemplates();
  state = loadSharedScenarioFromUrl() ?? createEmptyState();
  savedScenarios = loadSavedScenarios();

  populateTemplateSelect();
  bindEvents();
  runSimulation();
  renderAll();
}

async function ensureLatestBuild() {
  if (typeof window === "undefined" || typeof fetch !== "function") {
    return;
  }

  try {
    const response = await fetch(`/build-meta.json?ts=${Date.now()}`, {
      cache: "no-store"
    });

    if (!response.ok) {
      return;
    }

    const payload = await response.json();
    const latestBuildId = String(payload?.buildId ?? "").trim();
    if (!latestBuildId) {
      return;
    }

    if (latestBuildId === BUILD_ID) {
      sessionStorage.removeItem(BUILD_RELOAD_STORAGE_KEY);
      return;
    }

    const currentUrl = new URL(window.location.href);
    const lastReloadedBuildId = sessionStorage.getItem(BUILD_RELOAD_STORAGE_KEY);
    if (lastReloadedBuildId === latestBuildId) {
      console.warn("A newer deploy was detected, but the forced refresh already ran once for this build.");
      return;
    }

    sessionStorage.setItem(BUILD_RELOAD_STORAGE_KEY, latestBuildId);
    currentUrl.searchParams.set(BUILD_QUERY_PARAM, latestBuildId);
    window.location.replace(currentUrl.toString());
    await new Promise(() => {});
  } catch (error) {
    console.error("Unable to verify latest build version", error);
  }
}

function bindEvents() {
  elements.templateSelect.addEventListener("change", onTemplateSelectChange);
  elements.loadNewSimulationBtn.addEventListener("click", onLoadNewSimulation);
  elements.load2022PresetBtn.addEventListener("click", onLoad2022Preset);
  elements.load2018PresetBtn.addEventListener("click", onLoad2018Preset);
  document.addEventListener("click", onDocumentClick);
  document.addEventListener("keydown", onDocumentKeyDown);
  window.addEventListener("resize", hideGlossaryTooltip);
  window.addEventListener("scroll", hideGlossaryTooltip, true);
  elements.regionNameInput.addEventListener("input", () => {
    state.regionName = elements.regionNameInput.value;
    saveState();
    renderMetrics();
  });

  elements.addListBtn.addEventListener("click", onAddList);
  elements.listChips.addEventListener("click", onListChipsClick);
  elements.candidateTableBody.addEventListener("input", onCandidateTableInput);
  elements.candidateTableBody.addEventListener("change", onCandidateTableChange);
  elements.listVoteTotalsBody.addEventListener("input", onListVoteTotalsInput);
  elements.listVoteTotalsBody.addEventListener("change", onListVoteTotalsChange);

  elements.runSimulationBtn.addEventListener("click", () => {
    syncCandidateTableStateFromDom();
    runSimulation();
    saveState();
    renderCandidateListVoteTotals();
    renderResults();
  });

  elements.shareUrlBtn.addEventListener("click", onCopyShareUrl);
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
    return;
  }

  const optionsMarkup = [
    '<option value="">Choose a district template</option>',
    ...templates.map(
      (template) => `<option value="${escapeHtml(template.id)}">${escapeHtml(template.name)}</option>`
    )
  ].join("");

  elements.templateSelect.disabled = false;
  const currentTemplateId = getCurrentTemplateId();
  elements.templateSelect.innerHTML = optionsMarkup;
  elements.templateSelect.value = currentTemplateId;
}

function onTemplateSelectChange(event) {
  if (templates.length === 0) {
    return;
  }

  const target = event?.target;
  const templateId = target instanceof HTMLSelectElement ? target.value : getCurrentTemplateId();
  if (!templateId) {
    syncTemplateSelection();
    return;
  }

  loadTemplateById(templateId);
}

function loadTemplateById(templateId) {
  const template = templates.find((item) => item.id === templateId);

  if (!template) {
    syncTemplateSelection();
    return;
  }

  const hasCustomData = state.quotas.length > 0 || state.candidates.length > 0 || state.regionName.trim() !== "";
  if (hasCustomData) {
    const confirmed = window.confirm(
      "Loading a template will replace current region, quotas, and candidates. Continue?"
    );
    if (!confirmed) {
      syncTemplateSelection();
      return;
    }
  }

  state = normalizeState(cloneTemplate(template));
  runSimulation();
  saveState();
  renderAll();
}

function onLoad2022Preset() {
  loadPreset({
    yearLabel: "2022",
    hasResults: hasElectionResults2022,
    loadResults: loadElectionResults2022
  });
}

function onLoad2018Preset() {
  loadPreset({
    yearLabel: "2018",
    hasResults: hasElectionResults2018,
    loadResults: loadElectionResults2018
  });
}

function onDocumentClick(event) {
  const target = event.target;
  if (!(target instanceof Element)) {
    return;
  }

  const trigger = target.closest("[data-glossary-key]");
  if (trigger instanceof HTMLElement) {
    const glossaryKey = String(trigger.dataset.glossaryKey ?? "").trim();
    if (!glossaryKey) {
      return;
    }

    if (activeGlossaryTrigger === trigger) {
      hideGlossaryTooltip();
      return;
    }

    showGlossaryTooltip(trigger, glossaryKey);
    return;
  }

  if (elements.glossaryTooltip instanceof HTMLElement && target.closest("#glossaryTooltip")) {
    return;
  }

  hideGlossaryTooltip();
}

function onDocumentKeyDown(event) {
  if (event.key === "Escape") {
    hideGlossaryTooltip();
  }
}

function loadPreset({ yearLabel, hasResults, loadResults }) {
  const templateId = getCurrentTemplateId();
  if (!templateId) {
    window.alert("Choose a district template first.");
    return;
  }

  const template = templates.find((entry) => entry.id === templateId);
  if (!template) {
    window.alert("The selected district template could not be found.");
    return;
  }

  if (!hasResults(templateId)) {
    window.alert(`No ${yearLabel} baseline has been added for this district yet.`);
    return;
  }

  const hasCustomCandidateData = state.candidates.length > 0;
  if (hasCustomCandidateData) {
    const confirmed = window.confirm(
      `Loading the ${yearLabel} baseline will replace the current lists, candidates, and votes for this district. Continue?`
    );
    if (!confirmed) {
      return;
    }
  }

  const scenario = loadResults(template);
  if (!scenario) {
    window.alert(`The ${yearLabel} baseline could not be loaded for this district.`);
    return;
  }

  state = normalizeState(scenario);
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
      minorDistrict: slot.minorDistrict,
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
  state.listVotes = state.listVotes.filter((entry) => normalizeListKey(entry?.list) !== listKey);
  runSimulation();
  saveState();
  renderAll();
}

function onListVoteTotalsInput(event) {
  updateListVoteEntryFromEvent(event, false);
}

function onListVoteTotalsChange(event) {
  updateListVoteEntryFromEvent(event, true);
}

function updateListVoteEntryFromEvent(event, persist) {
  const target = event.target;
  if (!(target instanceof HTMLInputElement) || !target.classList.contains("list-only-votes")) {
    return;
  }

  const listKey = target.dataset.listKey;
  if (!listKey) {
    return;
  }

  setListOnlyVotes(listKey, target.dataset.listName ?? "", target.value);
  runSimulation();

  if (persist) {
    saveState();
    renderAll();
    return;
  }

  renderResults();
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
    scenario: createSerializableScenario(state)
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

async function onCopyShareUrl() {
  const shareUrl = buildShareableScenarioUrl(state);

  try {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      await navigator.clipboard.writeText(shareUrl);
      window.alert("Shareable URL copied to clipboard.");
      return;
    }
  } catch (error) {
    console.error("Unable to copy share URL to clipboard", error);
  }

  window.prompt("Copy this shareable URL:", shareUrl);
}

function onExportPdf() {
  runSimulation();
  const fileName = `electoral-simulation-${slugify(state.regionName || "custom")}.pdf`;
  const printWindow = window.open("", "_blank");

  if (!printWindow) {
    window.alert("Unable to open the print preview. Allow pop-ups for this site and try again.");
    return;
  }

  printWindow.document.open();
  printWindow.document.write(buildPrintableReportHtml(fileName));
  printWindow.document.close();
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
  hideGlossaryTooltip();
  rebuildListColorIndex();
  applyDistrictSelectionVisibility();
  syncTemplateSelection();
  renderPresetStatus();
  renderBuildIdBadge();
  elements.regionNameInput.value = state.regionName;
  renderQuotaTable();
  renderListBuilder();
  renderCandidateTable();
  renderCandidateListVoteTotals();
  renderSavedScenarios();
  renderResults();
}

function renderBuildIdBadge() {
  if (!elements.buildIdBadge) {
    return;
  }

  elements.buildIdBadge.textContent = `Build ${BUILD_ID}`;
}

function showGlossaryTooltip(trigger, glossaryKey) {
  if (!(elements.glossaryTooltip instanceof HTMLElement)) {
    return;
  }

  const entry = GLOSSARY_TERMS[glossaryKey];
  if (!entry) {
    return;
  }

  hideGlossaryTooltip();
  activeGlossaryTrigger = trigger;
  activeGlossaryTrigger.setAttribute("aria-expanded", "true");
  elements.glossaryTooltip.innerHTML = `
    <strong>${escapeHtml(entry.title)}</strong>
    <p>${escapeHtml(entry.body)}</p>
  `;
  elements.glossaryTooltip.hidden = false;

  const triggerRect = trigger.getBoundingClientRect();
  const tooltipRect = elements.glossaryTooltip.getBoundingClientRect();
  const top = Math.min(
    window.innerHeight - tooltipRect.height - 12,
    triggerRect.bottom + 10
  );
  const left = Math.min(
    window.innerWidth - tooltipRect.width - 12,
    Math.max(12, triggerRect.left)
  );

  elements.glossaryTooltip.style.top = `${Math.max(12, top)}px`;
  elements.glossaryTooltip.style.left = `${left}px`;
}

function hideGlossaryTooltip() {
  if (activeGlossaryTrigger instanceof HTMLElement) {
    activeGlossaryTrigger.setAttribute("aria-expanded", "false");
  }

  activeGlossaryTrigger = null;
  if (!(elements.glossaryTooltip instanceof HTMLElement)) {
    return;
  }

  elements.glossaryTooltip.hidden = true;
  elements.glossaryTooltip.innerHTML = "";
}

function renderPresetStatus() {
  const templateId = getCurrentTemplateId();
  const hasDistrict = Boolean(templateId);
  const hasPreset2022 = hasDistrict && hasElectionResults2022(templateId);
  const hasPreset2018 = hasDistrict && hasElectionResults2018(templateId);

  elements.loadNewSimulationBtn.disabled = !hasDistrict;
  elements.load2022PresetBtn.disabled = !hasPreset2022;
  elements.load2018PresetBtn.disabled = !hasPreset2018;

  if (!hasDistrict) {
    elements.presetStatusNote.textContent =
      "Choose a district template to check whether 2018 or 2022 baselines are available.";
    return;
  }

  if (hasPreset2018 && hasPreset2022) {
    elements.presetStatusNote.textContent =
      "Verified 2018 and 2022 baselines are available. Load either one, then edit votes manually, remove lists, or add new ones.";
    return;
  }

  if (hasPreset2022) {
    elements.presetStatusNote.textContent =
      "Verified 2022 baseline available. Load it, then edit votes manually, remove lists, or add new ones.";
    return;
  }

  if (hasPreset2018) {
    elements.presetStatusNote.textContent =
      "Verified 2018 baseline available from the report. Load it, then edit votes manually, remove lists, or add new ones.";
    return;
  }

  elements.presetStatusNote.textContent =
    "No verified 2018 baseline is currently exposed. 2022 remains available where loaded, and 2018 will stay disabled until the report mappings are manually audited.";
}

function onLoadNewSimulation() {
  if (state.quotas.length === 0) {
    window.alert("Choose a district template first.");
    return;
  }

  elements.addListBtn.scrollIntoView({ behavior: "smooth", block: "center" });
  window.setTimeout(() => {
    elements.listNameInput.focus();
    elements.listNameInput.select();
  }, 220);
}

function syncTemplateSelection() {
  if (!(elements.templateSelect instanceof HTMLSelectElement)) {
    return;
  }

  elements.templateSelect.value = getCurrentTemplateId();
}

function applyDistrictSelectionVisibility() {
  const hasDistrict = state.quotas.length > 0;
  document.body.classList.toggle("district-loaded", hasDistrict);
  elements.launchpadHelper.hidden = hasDistrict;
  elements.resultsSelectionNotice.hidden = hasDistrict;
  elements.districtConfigDetails.hidden = !hasDistrict;
  elements.simulationInputs.hidden = !hasDistrict;
  elements.resultsWorkspace.hidden = !hasDistrict;
}

function getCurrentTemplateId() {
  if (state.quotas.length === 0) {
    return "";
  }

  const stateSignature = buildQuotaSignature(state.quotas);
  if (!stateSignature) {
    return "";
  }

  const stateRegion = state.regionName.trim().toLowerCase();
  const exactMatch = templates.find(
    (template) =>
      template.name.trim().toLowerCase() === stateRegion &&
      buildQuotaSignature(template.quotas) === stateSignature
  );

  if (exactMatch) {
    return exactMatch.id;
  }

  const quotaOnlyMatch = templates.find(
    (template) => buildQuotaSignature(template.quotas) === stateSignature
  );

  return quotaOnlyMatch?.id ?? "";
}

function buildQuotaSignature(quotas) {
  const aggregatedBySect = new Map();

  (Array.isArray(quotas) ? quotas : []).forEach((entry) => {
    const sect = normalizeSect(entry?.sect);
    const seats = clampInteger(entry?.seats, 0);
    if (!sect || seats <= 0) {
      return;
    }

    aggregatedBySect.set(sect, (aggregatedBySect.get(sect) ?? 0) + seats);
  });

  return Array.from(aggregatedBySect.entries())
    .sort((a, b) => a[0].localeCompare(b[0], "en", { sensitivity: "base" }))
    .map(([sect, seats]) => `${sect}:${seats}`)
    .join("|");
}

function renderQuotaTable() {
  elements.totalSeatsValue.textContent = String(state.quotas.reduce((sum, entry) => sum + entry.seats, 0));

  if (state.quotas.length === 0) {
    elements.quotaTableBody.innerHTML =
      '<tr><td colspan="1" class="empty">No seat quotas configured. Load a district template to start.</td></tr>';
    return;
  }

  elements.quotaTableBody.innerHTML = state.quotas
    .map(
      (entry) => `
      <tr data-id="${escapeHtml(entry.id)}">
        <td>
          <div class="quota-cell-main">
            <span class="quota-sect-name">${escapeHtml(formatQuotaLabel(entry))}</span>
            <span class="quota-seat-inline">${entry.seats} seat${entry.seats === 1 ? "" : "s"}</span>
          </div>
        </td>
      </tr>
    `
    )
    .join("");
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
          <span class="list-manager-count">${row.filled} filled</span>
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
      const counterKey = `${listKey}::${buildQuotaKey(candidate.sect, candidate.minorDistrict)}`;
      const slotNumber = (slotCounter.get(counterKey) ?? 0) + 1;
      slotCounter.set(counterKey, slotNumber);

      return `
        <tr data-id="${escapeHtml(candidate.id)}">
          <td>${renderListChip(candidate.list)}</td>
          <td><span class="sect-slot-label">${escapeHtml(formatQuotaLabel(candidate))} #${slotNumber}</span></td>
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
  const rows = getListVoteRows();

  if (rows.length === 0) {
    elements.listVoteTotalsBody.innerHTML =
      '<tr><td colspan="5" class="empty">Add a list to generate candidate slots and list vote totals.</td></tr>';
    return;
  }

  const totalCandidateVotes = rows.reduce((sum, row) => sum + row.candidateVotes, 0);
  const totalListOnlyVotes = rows.reduce((sum, row) => sum + row.listOnlyVotes, 0);
  const totalVotes = rows.reduce((sum, row) => sum + row.totalVotes, 0);
  const totalFilledCandidates = rows.reduce((sum, row) => sum + row.filled, 0);
  const totalCandidateSlots = rows.reduce((sum, row) => sum + row.slots, 0);

  elements.listVoteTotalsBody.innerHTML = `
    ${rows
      .map(
        (row) => `
          <tr>
            <td>${renderListChip(row.list)}</td>
            <td>${row.filled}/${row.slots}</td>
            <td>${formatNumber(row.candidateVotes)}</td>
            <td class="candidate-votes-cell"><input class="row-edit list-only-votes" data-list-key="${escapeHtml(
              row.key
            )}" data-list-name="${escapeHtml(row.list)}" type="number" min="0" step="1" value="${row.listOnlyVotes}" /></td>
            <td>${formatNumber(row.totalVotes)}</td>
          </tr>
        `
      )
      .join("")}
    <tr class="list-totals-final-row">
      <td>Grand Total</td>
      <td>${totalFilledCandidates}/${totalCandidateSlots}</td>
      <td>${formatNumber(totalCandidateVotes)}</td>
      <td>${formatNumber(totalListOnlyVotes)}</td>
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
    const minorDistrict = String(quota?.minorDistrict ?? "").trim();
    const seats = clampInteger(quota?.seats, 0);
    if (!sect || seats <= 0) {
      return;
    }

    for (let index = 1; index <= seats; index += 1) {
      slots.push({ sect, minorDistrict });
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
      grouped.set(key, { key, list, slots: 0, filled: 0 });
    }

    const row = grouped.get(key);
    row.slots += 1;
    if (String(candidate?.name ?? "").trim()) {
      row.filled += 1;
    }
  });

  return Array.from(grouped.values()).sort((a, b) =>
    a.list.localeCompare(b.list, "en", { sensitivity: "base" })
  );
}

function runSimulation() {
  simulation = computeResults(
    state.quotas,
    state.candidates,
    state.listVotes,
    state.blankVotes,
    state.invalidVotes
  );
}

function renderResults() {
  renderMetrics();
  renderAlerts();
  renderListAllocationTable();
  renderWinnersTable();
  renderDistrictVisualAnalytics();
}

function renderMetrics() {
  const summary = simulation.summary;
  const districtLabel = state.regionName.trim() || "Unnamed region";
  const totalListCount = Array.isArray(simulation.listAllocation) ? simulation.listAllocation.length : 0;
  const cards = [
    { label: "District", value: districtLabel },
    { label: "Total Seats", value: String(summary.totalSeats) },
    { label: "Filled Seats", value: String(summary.filledSeats) },
    { label: "Seat Coverage", value: `${summary.coveragePct}%` },
    { label: "Candidates", value: String(summary.totalCandidates) },
    { label: "Total Votes", value: formatNumber(summary.totalVotes) },
    { label: "Blank Votes", value: formatNumber(summary.blankVotes) },
    { label: "Qualification EQ Vote Base", value: formatNumber(summary.qualificationEqVotes) },
    { label: "Invalid Votes", value: formatNumber(summary.invalidVotes) },
    {
      label: "Qualification EQ",
      value: summary.qualificationQuotient > 0 ? formatDecimal(summary.qualificationQuotient) : "-"
    },
    { label: "Allocation EQ Vote Base", value: formatNumber(summary.eqVotes) },
    {
      label: "Allocation EQ",
      value: summary.electoralQuotient > 0 ? formatDecimal(summary.electoralQuotient) : "-"
    },
    { label: "Total Lists", value: String(totalListCount) },
    { label: "Qualified Lists", glossaryKey: "qualifying-list", value: String(summary.qualifiedListCount) }
  ];

  elements.metricsGrid.innerHTML = cards
    .map(
      (card) => `
      <article class="metric-card">
        <p>${card.glossaryKey ? renderGlossaryTerm(card.glossaryKey, card.label) : escapeHtml(card.label)}</p>
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
    `<div class="alert alert-info">Model: seats are first allocated to lists using ${renderGlossaryTerm("eq", "EQ")} (electoral quotient) and largest remainder. Candidate winners are then selected by vote rank within sect ${renderGlossaryTerm("quota", "quotas")} and each list seat cap.</div>`
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
      '<tr><td colspan="5" class="empty">Add candidates with party/list names to compute EQ allocation.</td></tr>';
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
        </tr>
      `;
    })
    .join("");
}

function renderWinnersTable() {
  if (simulation.winners.length === 0) {
    elements.winnersTableBody.innerHTML =
      '<tr><td colspan="5" class="empty">Run with valid quotas and candidates to display winners.</td></tr>';
    return;
  }

  elements.winnersTableBody.innerHTML = simulation.winners
    .map(
      (winner) => `
      <tr>
        <td>${winner.seatNumber}</td>
        <td>${escapeHtml(winner.seatLabel ?? winner.sect)}</td>
        <td>${escapeHtml(winner.name)}</td>
        <td>${renderListChip(winner.list)}</td>
        <td>${formatNumber(winner.votes)}</td>
      </tr>
    `
    )
    .join("");
}

function renderDistrictVisualAnalytics() {
  renderListSeatSummary();
  renderShareComparison();
  renderListVoteBars();
  renderClosestRaces();
  renderSectQuotaBars();
  renderSeatGainThresholds();
  renderSeatPieChart();
  renderCompetitivenessChart();
  renderListSectMap();
  renderCandidateLeaderboard();
}

function renderListSeatSummary() {
  const rows = Array.isArray(simulation.listAllocation)
    ? simulation.listAllocation.filter((row) => row.seats > 0).sort((a, b) => b.seats - a.seats || b.votes - a.votes)
    : [];

  if (rows.length === 0) {
    elements.listSeatSummary.innerHTML = '<p class="empty">Seat share appears after seats are allocated.</p>';
    return;
  }

  const totalSeats = Math.max(1, simulation.summary.totalSeats);
  elements.listSeatSummary.innerHTML = rows
    .map((row) => {
      const palette = getListPalette(row.list);
      const seatShare = Math.round((row.seats / totalSeats) * 100);
      const voteShare = simulation.summary.totalVotes > 0 ? Math.round((row.votes / simulation.summary.totalVotes) * 100) : 0;

      return `
        <div class="list-seat-row">
          <div class="list-seat-row-top">
            ${renderListChip(row.list)}
            <span class="list-seat-figures">${row.seats}/${totalSeats} seats</span>
          </div>
          <div class="list-seat-bar">
            <div class="list-seat-bar-fill" style="width:${Math.max((row.seats / totalSeats) * 100, 6)}%;--seat-bar:${palette.dot};"></div>
          </div>
          <div class="list-seat-row-meta">
            <span>Seat share ${seatShare}%</span>
            <span>Vote share ${voteShare}%</span>
          </div>
        </div>
      `;
    })
    .join("");
}

function renderShareComparison() {
  const rows = Array.isArray(simulation.listAllocation)
    ? simulation.listAllocation.filter((row) => row.votes > 0).sort((a, b) => b.votes - a.votes)
    : [];

  if (rows.length === 0) {
    elements.shareComparison.innerHTML = '<p class="empty">Share comparison appears after votes are entered.</p>';
    return;
  }

  const totalSeats = Math.max(1, simulation.summary.totalSeats);
  const totalVotes = Math.max(1, simulation.summary.totalVotes);
  elements.shareComparison.innerHTML = rows
    .map((row) => {
      const palette = getListPalette(row.list);
      const voteShare = (row.votes / totalVotes) * 100;
      const seatShare = (row.seats / totalSeats) * 100;
      const delta = seatShare - voteShare;
      const statusLabel = delta > 1 ? "Overrepresented" : delta < -1 ? "Underrepresented" : "Near proportional";

      return `
        <div class="share-row">
          <div class="share-row-head">
            ${renderListChip(row.list)}
            <span class="share-row-status">${statusLabel}</span>
          </div>
          <div class="share-track">
            <div class="share-bar share-bar-votes" style="width:${Math.max(voteShare, row.votes > 0 ? 3 : 0)}%;--share-bar:${palette.border};"></div>
            <div class="share-bar share-bar-seats" style="width:${Math.max(seatShare, row.seats > 0 ? 3 : 0)}%;--share-bar:${palette.dot};"></div>
          </div>
          <div class="share-row-meta">
            <span>Votes ${formatDecimal(voteShare)}%</span>
            <span>Seats ${formatDecimal(seatShare)}%</span>
            <span class="${delta >= 0 ? "share-positive" : "share-negative"}">${delta >= 0 ? "+" : ""}${formatDecimal(delta)} pts</span>
          </div>
        </div>
      `;
    })
    .join("");
}

function renderListVoteBars() {
  const rows = Array.isArray(simulation.listAllocation)
    ? simulation.listAllocation.filter((row) => row.votes > 0).sort((a, b) => b.votes - a.votes)
    : [];

  if (rows.length === 0) {
    elements.listVoteBars.innerHTML = '<p class="empty">Vote bars appear after votes are entered.</p>';
    return;
  }

  const maxVotes = Math.max(...rows.map((row) => row.votes), 1);
  elements.listVoteBars.innerHTML = rows
    .map((row) => {
      const palette = getListPalette(row.list);
      const width = (row.votes / maxVotes) * 100;
      return `
        <div class="vote-bar-row">
          <div class="vote-bar-head">
            ${renderListChip(row.list)}
            <span class="vote-bar-value">${formatNumber(row.votes)} votes</span>
          </div>
          <div class="vote-bar-track">
            <div
              class="vote-bar-fill"
              style="width:${Math.max(width, 4)}%;--vote-bar:${palette.dot};--vote-bar-glow:${palette.border};"
            ></div>
          </div>
        </div>
      `;
    })
    .join("");
}

function renderClosestRaces() {
  const races = getClosestRacesData();
  if (races.length === 0) {
    elements.closestRaces.innerHTML = '<p class="empty">Closest races appear when at least one challenger is available.</p>';
    return;
  }

  elements.closestRaces.innerHTML = races
    .map(
      (race) => `
        <article class="race-card">
          <div class="race-card-head">
            <span class="race-sect">${escapeHtml(race.sect)}</span>
            <span class="race-gap">${formatNumber(race.gap)} vote gap</span>
          </div>
          <div class="race-main">
            <div>
              <div class="race-label">Winner</div>
              <strong class="${getTextDirectionClass(race.winnerName)}">${escapeHtml(race.winnerName)}</strong>
              <div class="race-meta">${escapeHtml(race.winnerList)} · ${formatNumber(race.winnerVotes)} votes</div>
            </div>
            <div>
              <div class="race-label">Closest challenger</div>
              <strong class="${getTextDirectionClass(race.challengerName)}">${escapeHtml(race.challengerName)}</strong>
              <div class="race-meta">${escapeHtml(race.challengerList)} · ${formatNumber(race.challengerVotes)} votes</div>
            </div>
          </div>
        </article>
      `
    )
    .join("");
}

function renderSectQuotaBars() {
  const rows = getSectQuotaBarRows();
  if (rows.length === 0) {
    elements.sectQuotaBars.innerHTML = '<p class="empty">Sect quota bars appear once sect seats are allocated.</p>';
    return;
  }

  elements.sectQuotaBars.innerHTML = rows
    .map(
      (row) => `
        <div class="quota-bar-row">
          <div class="quota-bar-head">
            <strong>${escapeHtml(row.label)}</strong>
            <span class="quota-bar-meta">${escapeHtml(row.meta)}</span>
          </div>
          <div class="quota-bar-track">
            ${row.slots
              .map(
                (slot) => `
                  <div
                    class="quota-bar-slot ${slot.empty ? "quota-bar-slot-empty" : ""}"
                    style="${slot.style}"
                    title="${escapeHtml(slot.title)}"
                  ></div>
                `
              )
              .join("")}
          </div>
        </div>
      `
    )
    .join("");
}

function renderSeatGainThresholds() {
  const rows = getSeatThresholdRows();
  if (rows.length === 0) {
    elements.seatGainThresholds.innerHTML = '<p class="empty">Thresholds appear once lists and votes are available.</p>';
    return;
  }

  elements.seatGainThresholds.innerHTML = rows
    .map(
      (row) => `
        <div class="threshold-row">
          <div class="threshold-row-head">
            ${renderListChip(row.list)}
            <span class="threshold-seat-count">${row.seats} seat${row.seats === 1 ? "" : "s"}</span>
          </div>
          <div class="threshold-grid">
            <div class="threshold-box">
              <span class="threshold-label">To gain seat</span>
              <strong>${row.toGainSeat === null ? "-" : formatNumber(row.toGainSeat)}</strong>
            </div>
            <div class="threshold-box">
              <span class="threshold-label">Seat at risk in</span>
              <strong>${row.seatAtRisk === null ? "-" : formatNumber(row.seatAtRisk)}</strong>
            </div>
          </div>
        </div>
      `
    )
    .join("");
}

function renderSeatPieChart() {
  const rows = Array.isArray(simulation.listAllocation)
    ? simulation.listAllocation.filter((row) => row.seats > 0).sort((a, b) => b.seats - a.seats || b.votes - a.votes)
    : [];

  if (rows.length === 0) {
    elements.seatPieChart.innerHTML = '<p class="empty">Seat pie chart appears once seats are allocated.</p>';
    return;
  }

  const totalSeats = Math.max(1, rows.reduce((sum, row) => sum + row.seats, 0));
  let running = 0;
  const slices = rows
    .map((row) => {
      const palette = getListPalette(row.list);
      const start = running;
      const share = (row.seats / totalSeats) * 100;
      running += share;
      const end = running;
      return {
        list: row.list,
        seats: row.seats,
        share,
        top: `${palette.dot} ${start}% ${end}%`,
        side: `${darkenColor(palette.dot, 0.78)} ${start}% ${end}%`
      };
    });

  const topGradient = `conic-gradient(${slices.map((slice) => slice.top).join(", ")})`;
  const sideGradient = `conic-gradient(${slices.map((slice) => slice.side).join(", ")})`;

  elements.seatPieChart.innerHTML = `
    <div class="seat-pie-shell">
      <div class="seat-pie-figure">
        <div class="seat-pie-base" style="--seat-pie:${sideGradient};"></div>
        <div class="seat-pie-top" style="--seat-pie:${topGradient};"></div>
        <div class="seat-pie-hole"></div>
        <div class="seat-pie-center">
          <strong>${formatNumber(totalSeats)}</strong>
          <span>Seats</span>
        </div>
      </div>
      <div class="seat-pie-legend">
        ${slices
          .map(
            (slice) => `
              <div class="seat-pie-legend-row">
                <span class="seat-pie-legend-chip">${renderListChip(slice.list)}</span>
                <span class="seat-pie-legend-meta">${slice.seats} seat${slice.seats === 1 ? "" : "s"} · ${formatDecimal(slice.share)}%</span>
              </div>
            `
          )
          .join("")}
      </div>
    </div>
  `;
}

function renderCompetitivenessChart() {
  const races = getClosestRacesDataForScenario(state, simulation, Number.POSITIVE_INFINITY);
  if (races.length === 0) {
    elements.competitivenessChart.innerHTML = '<p class="empty">Competitiveness lines appear when at least one challenger is available.</p>';
    return;
  }

  const maxGap = Math.max(...races.map((race) => race.gap), 1);
  elements.competitivenessChart.innerHTML = races
    .map((race) => {
      const width = Math.max((race.gap / maxGap) * 100, 6);
      const winnerPalette = getListPalette(race.winnerList);
      const challengerPalette = getListPalette(race.challengerList);
      return `
        <div class="lollipop-row">
          <div class="lollipop-head">
            <strong>${escapeHtml(race.sect)}</strong>
            <span class="lollipop-gap">${formatNumber(race.gap)} vote gap</span>
          </div>
          <div class="lollipop-line-shell">
            <span class="lollipop-dot lollipop-dot-start" style="--lollipop-dot:${winnerPalette.dot};"></span>
            <div class="lollipop-line">
              <div class="lollipop-line-fill" style="width:${width}%;--lollipop-line:${winnerPalette.dot};"></div>
            </div>
            <span class="lollipop-dot lollipop-dot-end" style="--lollipop-dot:${challengerPalette.dot};"></span>
          </div>
          <div class="lollipop-meta">
            <span>${escapeHtml(race.winnerName)} · ${escapeHtml(race.winnerList)}</span>
            <span>${escapeHtml(race.challengerName)} · ${escapeHtml(race.challengerList)}</span>
          </div>
        </div>
      `;
    })
    .join("");
}

function renderListSectMap() {
  const rows = getListSectMapRows();
  if (rows.length === 0) {
    elements.listSectMap.innerHTML = '<p class="empty">List sect capture appears once winners are assigned.</p>';
    return;
  }

  elements.listSectMap.innerHTML = rows
    .map(
      (row) => `
        <div class="sect-map-row">
          <div class="sect-map-head">
            ${renderListChip(row.list)}
            <span class="sect-map-meta">${row.totalSeats} seat${row.totalSeats === 1 ? "" : "s"}</span>
          </div>
          <div class="sect-map-track">
            ${row.segments
              .map(
                (segment) => `
                  <div
                    class="sect-map-segment"
                    style="width:${segment.width}%;${segment.style}"
                    title="${escapeHtml(segment.title)}"
                  >
                    <span>${escapeHtml(segment.shortLabel)}</span>
                  </div>
                `
              )
              .join("")}
          </div>
          <div class="sect-map-legend">${row.legend.join("")}</div>
        </div>
      `
    )
    .join("");
}

function renderCandidateLeaderboard() {
  const groups = getCandidateLeaderboardGroups();
  if (groups.length === 0) {
    elements.candidateLeaderboard.innerHTML = '<p class="empty">Candidate ribbons appear once candidate votes are available.</p>';
    return;
  }

  elements.candidateLeaderboard.innerHTML = groups
    .map(
      (group) => `
        <div class="leaderboard-group">
          <div class="leaderboard-group-head">
            <strong>${escapeHtml(group.sect)}</strong>
            <span class="leaderboard-group-meta">${group.candidates.length} candidate${group.candidates.length === 1 ? "" : "s"}</span>
          </div>
          <div class="leaderboard-ribbons">
            ${group.candidates
              .map(
                (candidate) => `
                  <div class="leaderboard-ribbon ${candidate.isWinner ? "leaderboard-ribbon-winner" : ""}" style="${candidate.style}">
                    <div class="leaderboard-ribbon-main">
                      <span class="leaderboard-ribbon-name ${getTextDirectionClass(candidate.name)}">${escapeHtml(candidate.name)}</span>
                      <span class="leaderboard-ribbon-votes">${formatNumber(candidate.votes)}</span>
                    </div>
                    <div class="leaderboard-ribbon-meta">
                      <span>${escapeHtml(candidate.list)}</span>
                      <span>${candidate.isWinner ? "Winner" : "Runner-up"}</span>
                    </div>
                  </div>
                `
              )
              .join("")}
          </div>
        </div>
      `
    )
    .join("");
}

function getClosestRacesData() {
  return getClosestRacesDataForScenario(state, simulation, 4);
}

function getClosestRacesDataForScenario(scenarioState, scenarioSimulation, limit = 4) {
  const winnerKeys = new Set(
    scenarioSimulation.winners.map((winner) =>
      buildCandidateIdentityKey(winner.name, winner.list, winner.sect, winner.minorDistrict)
    )
  );
  const qualifiedLists = new Set(
    scenarioSimulation.listAllocation.filter((row) => row.qualified).map((row) => row.list)
  );

  return scenarioState.quotas
    .map((quota) => {
      const quotaKey = buildQuotaKey(quota.sect, quota.minorDistrict);
      const electedForSect = scenarioSimulation.winners
        .filter((winner) => buildQuotaKey(winner.sect, winner.minorDistrict) === quotaKey)
        .sort((a, b) => a.votes - b.votes);
      const winningCutoff = electedForSect[0];
      if (!winningCutoff) {
        return null;
      }

      const challenger = scenarioState.candidates
        .filter((candidate) => {
          if (buildQuotaKey(candidate.sect, candidate.minorDistrict) !== quotaKey) {
            return false;
          }
          if (!qualifiedLists.has(candidate.list)) {
            return false;
          }
          return !winnerKeys.has(
            buildCandidateIdentityKey(candidate.name, candidate.list, candidate.sect, candidate.minorDistrict)
          );
        })
        .sort((a, b) => b.votes - a.votes || a.name.localeCompare(b.name, "en", { sensitivity: "base" }))[0];

      if (!challenger) {
        return null;
      }

      return {
        sect: formatQuotaLabel(quota),
        winnerName: winningCutoff.name,
        winnerList: winningCutoff.list,
        winnerVotes: winningCutoff.votes,
        challengerName: challenger.name,
        challengerList: challenger.list,
        challengerVotes: challenger.votes,
        gap: Math.max(0, winningCutoff.votes - challenger.votes)
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.gap - b.gap || b.winnerVotes - a.winnerVotes)
    .slice(0, limit);
}

function getSectQuotaBarRows() {
  return state.quotas.map((quota) => {
    const quotaKey = buildQuotaKey(quota.sect, quota.minorDistrict);
    const winners = simulation.winners.filter(
      (winner) => buildQuotaKey(winner.sect, winner.minorDistrict) === quotaKey
    );
    const slots = Array.from({ length: quota.seats }, (_, index) => {
      const winner = winners[index];
      if (!winner) {
        return {
          empty: true,
          title: `${formatQuotaLabel(quota)} seat ${index + 1} unfilled`,
          style: ""
        };
      }

      const palette = getListPalette(winner.list);
      return {
        empty: false,
        title: `${winner.name} · ${winner.list}`,
        style: `--quota-slot:${palette.dot};--quota-slot-edge:${palette.border};`
      };
    });

    return {
      label: formatQuotaLabel(quota),
      meta: `${winners.length}/${quota.seats} filled`,
      slots
    };
  });
}

function getListSectMapRows() {
  const winnersByList = new Map();
  simulation.winners.forEach((winner) => {
    if (!winnersByList.has(winner.list)) {
      winnersByList.set(winner.list, []);
    }
    winnersByList.get(winner.list).push(winner);
  });

  return Array.from(winnersByList.entries())
    .map(([list, winners]) => {
      const totalSeats = winners.length;
      const bySect = new Map();
      winners.forEach((winner) => {
        const key = formatQuotaLabel(winner);
        bySect.set(key, (bySect.get(key) ?? 0) + 1);
      });

      const segments = Array.from(bySect.entries())
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "en", { sensitivity: "base" }))
        .map(([label, seats]) => {
          const palette = getSectPalette(label);
          return {
            width: Math.max((seats / totalSeats) * 100, 10),
            title: `${label} · ${seats} seat${seats === 1 ? "" : "s"}`,
            shortLabel: buildSectShortLabel(label),
            style: `--sect-segment:${palette.fill};--sect-segment-edge:${palette.edge};--sect-segment-text:${palette.text};`
          };
        });

      const legend = Array.from(bySect.entries())
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "en", { sensitivity: "base" }))
        .map(([label, seats]) => `<span class="sect-map-legend-chip">${escapeHtml(label)} · ${seats}</span>`);

      return { list, totalSeats, segments, legend };
    })
    .sort((a, b) => b.totalSeats - a.totalSeats || a.list.localeCompare(b.list, "en", { sensitivity: "base" }));
}

function getCandidateLeaderboardGroups() {
  const winnerKeys = new Set(
    simulation.winners.map((winner) =>
      buildCandidateIdentityKey(winner.name, winner.list, winner.sect, winner.minorDistrict)
    )
  );

  const grouped = new Map();
  state.candidates
    .filter((candidate) => candidate.votes > 0)
    .forEach((candidate) => {
      const key = formatQuotaLabel(candidate);
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key).push(candidate);
    });

  return Array.from(grouped.entries())
    .map(([sect, candidates]) => ({
      sect,
      candidates: candidates
        .sort((a, b) => b.votes - a.votes || a.name.localeCompare(b.name, "en", { sensitivity: "base" }))
        .slice(0, 4)
        .map((candidate) => {
          const palette = getListPalette(candidate.list);
          const isWinner = winnerKeys.has(
            buildCandidateIdentityKey(candidate.name, candidate.list, candidate.sect, candidate.minorDistrict)
          );
          return {
            ...candidate,
            isWinner,
            style: `--leaderboard-fill:${palette.dot};--leaderboard-edge:${palette.border};--leaderboard-text:${palette.text};--leaderboard-bg:${palette.bg};`
          };
        })
    }))
    .sort((a, b) => a.sect.localeCompare(b.sect, "en", { sensitivity: "base" }));
}

function getSeatThresholdRows() {
  return computeSeatChangeThresholds(
    state.quotas,
    state.candidates,
    state.listVotes,
    state.blankVotes,
    state.invalidVotes
  ).sort((a, b) => {
    const seatsDelta = b.seats - a.seats;
    if (seatsDelta !== 0) {
      return seatsDelta;
    }

    return a.list.localeCompare(b.list, "en", { sensitivity: "base" });
  });
}

function buildCandidateIdentityKey(name, list, sect, minorDistrict = "") {
  return [
    String(name ?? "").trim(),
    String(list ?? "").trim(),
    String(sect ?? "").trim(),
    String(minorDistrict ?? "").trim()
  ].join("::");
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

function normalizeMinorDistrict(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

function buildQuotaKey(sect, minorDistrict = "") {
  return `${normalizeSect(sect)}::${normalizeMinorDistrict(minorDistrict)}`;
}

function formatQuotaLabel(entry) {
  const sect = String(entry?.sect ?? "").trim();
  const minorDistrict = String(entry?.minorDistrict ?? "").trim();
  return minorDistrict ? `${sect} (${minorDistrict})` : sect;
}

function normalizeState(input) {
  const base = {
    regionName: String(input?.regionName ?? ""),
    quotas: [],
    candidates: [],
    listVotes: [],
    blankVotes: clampInteger(input?.blankVotes, 0),
    invalidVotes: clampInteger(input?.invalidVotes, 0),
    quotasLocked: input?.quotasLocked === true
  };

  const quotaAccumulator = new Map();
  if (Array.isArray(input?.quotas)) {
    for (const raw of input.quotas) {
      const sect = String(raw?.sect ?? "").trim();
      const minorDistrict = String(raw?.minorDistrict ?? "").trim();
      const seats = clampInteger(raw?.seats, 0);
      if (!sect || seats <= 0) {
        continue;
      }

      const key = buildQuotaKey(sect, minorDistrict);
      if (quotaAccumulator.has(key)) {
        quotaAccumulator.get(key).seats += seats;
      } else {
        quotaAccumulator.set(key, { id: raw?.id || createId("quota"), sect, seats, minorDistrict });
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
        votes: clampInteger(raw?.votes, 0),
        minorDistrict: String(raw?.minorDistrict ?? "").trim()
      });
    }
  }

  const listNamesByKey = new Map();
  base.candidates.forEach((candidate) => {
    const key = normalizeListKey(candidate.list);
    if (key && !listNamesByKey.has(key)) {
      listNamesByKey.set(key, candidate.list);
    }
  });

  const listVoteAccumulator = new Map();
  if (Array.isArray(input?.listVotes)) {
    for (const raw of input.listVotes) {
      const key = normalizeListKey(raw?.list);
      if (!key || !listNamesByKey.has(key)) {
        continue;
      }

      listVoteAccumulator.set(key, (listVoteAccumulator.get(key) ?? 0) + clampInteger(raw?.votes, 0));
    }
  }

  base.listVotes = Array.from(listNamesByKey.entries()).map(([key, list]) => ({
    list,
    votes: listVoteAccumulator.get(key) ?? 0
  }));

  return base;
}

function normalizeImportedState(parsed) {
  if (parsed && parsed.scenario) {
    return normalizeState(parsed.scenario);
  }

  return normalizeState(parsed);
}

function createSerializableScenario(inputState) {
  const snapshot = normalizeState(inputState);
  return {
    regionName: snapshot.regionName,
    quotas: snapshot.quotas.map((entry) => ({
      sect: entry.sect,
      seats: entry.seats,
      minorDistrict: entry.minorDistrict
    })),
    quotasLocked: snapshot.quotasLocked,
    blankVotes: snapshot.blankVotes,
    invalidVotes: snapshot.invalidVotes,
    listVotes: snapshot.listVotes.map((entry) => ({
      list: entry.list,
      votes: entry.votes
    })),
    candidates: snapshot.candidates.map((candidate) => ({
      name: candidate.name,
      sect: candidate.sect,
      list: candidate.list,
      votes: candidate.votes,
      minorDistrict: candidate.minorDistrict
    }))
  };
}

function buildShareableScenarioUrl(inputState) {
  const currentUrl = new URL(window.location.href);
  currentUrl.searchParams.set(
    SHARE_SCENARIO_QUERY_PARAM,
    encodeScenarioPayload({
      version: EXPORT_VERSION,
      scenario: createSerializableScenario(inputState)
    })
  );

  return currentUrl.toString();
}

function loadSharedScenarioFromUrl() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const currentUrl = new URL(window.location.href);
    const encodedScenario = currentUrl.searchParams.get(SHARE_SCENARIO_QUERY_PARAM);
    if (!encodedScenario) {
      return null;
    }

    const parsed = JSON.parse(decodeScenarioPayload(encodedScenario));
    return normalizeImportedState(parsed);
  } catch (error) {
    console.error("Unable to load shared scenario from URL", error);
    window.alert("The shared scenario URL could not be decoded. Loading the default app state instead.");
    return null;
  }
}

function encodeScenarioPayload(payload) {
  const json = JSON.stringify(payload);
  const bytes = new TextEncoder().encode(json);
  let binary = "";

  bytes.forEach((value) => {
    binary += String.fromCharCode(value);
  });

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function decodeScenarioPayload(value) {
  const normalized = String(value ?? "")
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function saveState() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        schemaVersion: STATE_SCHEMA_VERSION,
        dataVersion: CURRENT_DATA_VERSION,
        state
      })
    );
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
    if (
      parsed?.schemaVersion !== STATE_SCHEMA_VERSION ||
      parsed?.dataVersion !== CURRENT_DATA_VERSION ||
      !parsed?.state
    ) {
      clearState();
      return null;
    }

    return normalizeState(parsed.state);
  } catch (error) {
    console.error("Unable to load state", error);
    return null;
  }
}

function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Unable to clear state", error);
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

function buildPrintableReportHtml(fileName) {
  const summary = simulation.summary;
  const totalListCount = Array.isArray(simulation.listAllocation) ? simulation.listAllocation.length : 0;
  const districtLabel = state.regionName.trim() || "Unnamed region";
  const generatedAt = new Date().toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  });
  const listOnlyVotes = Array.isArray(state.listVotes)
    ? state.listVotes.reduce((sum, entry) => sum + clampInteger(entry?.votes, 0), 0)
    : 0;
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
  const winnerRows = Array.isArray(simulation.winners) ? simulation.winners : [];
  const sectCoverageRows = Array.isArray(simulation.sectCoverage) ? simulation.sectCoverage : [];
  const warningRows = Array.isArray(simulation.warnings) ? simulation.warnings : [];

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(fileName)}</title>
    <style>
      :root {
        color-scheme: light;
        --ink: #16202a;
        --muted: #5f6b76;
        --line: #cfd6dd;
        --panel: #eceff3;
        --accent: #4f6578;
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        padding: 24px;
        color: var(--ink);
        background: #f1f3f5;
        font: 14px/1.45 "Arial Unicode MS", "Geeza Pro", "Diwan Kufi", "Noto Naskh Arabic", Arial, sans-serif;
      }

      h1, h2 {
        margin: 0 0 12px;
        line-height: 1.2;
      }

      h1 {
        font-size: 24px;
      }

      h2 {
        margin-top: 28px;
        font-size: 16px;
        color: var(--accent);
      }

      p {
        margin: 0;
      }

      .meta {
        margin-top: 8px;
        color: var(--muted);
      }

      .metrics {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 10px;
        margin-top: 20px;
      }

      .metric {
        padding: 12px;
        border: 1px solid var(--line);
        border-radius: 10px;
        background: var(--panel);
      }

      .metric-label {
        color: var(--muted);
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }

      .metric-value {
        margin-top: 6px;
        font-size: 18px;
        font-weight: 700;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 12px;
      }

      th, td {
        padding: 9px 10px;
        border: 1px solid var(--line);
        text-align: left;
        vertical-align: top;
      }

      th {
        background: var(--panel);
      }

      .empty {
        color: var(--muted);
      }

      .rtl {
        direction: rtl;
        text-align: right;
        unicode-bidi: plaintext;
      }

      .warning-list {
        margin: 12px 0 0;
        padding-left: 18px;
      }

      .footer-note {
        margin-top: 28px;
        color: var(--muted);
        font-size: 12px;
      }

      @media print {
        body {
          padding: 14mm;
        }

        .page-break {
          break-before: page;
        }
      }
    </style>
  </head>
  <body>
    <h1>Lebanon Electoral Simulation Report</h1>
    <p class="meta">Generated: ${escapeHtml(generatedAt)}</p>
    <p class="meta">District: <span class="${getTextDirectionClass(districtLabel)}">${escapeHtml(districtLabel)}</span></p>

    <section class="metrics">
      ${renderPrintableMetric("Total Seats", String(summary.totalSeats))}
      ${renderPrintableMetric("Filled Seats", String(summary.filledSeats))}
      ${renderPrintableMetric("Seat Coverage", `${summary.coveragePct}%`)}
      ${renderPrintableMetric("Candidates", String(summary.totalCandidates))}
      ${renderPrintableMetric("Total Votes", formatNumber(summary.totalVotes))}
      ${renderPrintableMetric("Blank Votes", formatNumber(summary.blankVotes))}
      ${renderPrintableMetric("Invalid Votes", formatNumber(summary.invalidVotes))}
      ${renderPrintableMetric("List-Only Votes", formatNumber(listOnlyVotes))}
      ${renderPrintableMetric(
        "Qualification EQ Vote Base",
        formatNumber(summary.qualificationEqVotes)
      )}
      ${renderPrintableMetric(
        "Qualification EQ",
        summary.qualificationQuotient > 0 ? formatDecimal(summary.qualificationQuotient) : "-"
      )}
      ${renderPrintableMetric(
        "Allocation EQ Vote Base",
        formatNumber(summary.eqVotes)
      )}
      ${renderPrintableMetric(
        "Allocation EQ",
        summary.electoralQuotient > 0 ? formatDecimal(summary.electoralQuotient) : "-"
      )}
      ${renderPrintableMetric("Total Lists", String(totalListCount))}
      ${renderPrintableMetric("Qualified Lists", String(summary.qualifiedListCount))}
    </section>

    <h2>List EQ Allocation</h2>
    ${renderPrintableListAllocationTable(listRows)}

    <h2 class="page-break">Winning Candidates</h2>
    ${renderPrintableWinnersTable(winnerRows)}

    <h2>Sect Coverage</h2>
    ${renderPrintableSectCoverageTable(sectCoverageRows)}

    <h2>Warnings</h2>
    ${renderPrintableWarnings(warningRows)}

    <p class="footer-note">Use the browser print dialog and choose “Save as PDF”.</p>
    <script>
      window.addEventListener("load", () => {
        window.print();
      });
      window.addEventListener("afterprint", () => {
        window.close();
      });
    </script>
  </body>
</html>`;
}

function renderPrintableMetric(label, value) {
  return `
    <article class="metric">
      <div class="metric-label">${escapeHtml(label)}</div>
      <div class="metric-value ${getTextDirectionClass(value)}">${escapeHtml(value)}</div>
    </article>
  `;
}

function renderPrintableListAllocationTable(rows) {
  if (!rows.length) {
    return '<p class="empty">No list allocation available.</p>';
  }

  return `
    <table>
      <thead>
        <tr>
          <th>List</th>
          <th>Total Votes</th>
          <th>Status</th>
          <th>Seats</th>
          <th>Base Seats</th>
        </tr>
      </thead>
      <tbody>
        ${rows
          .map(
            (row) => `
              <tr>
                <td class="${getTextDirectionClass(row.list)}">${escapeHtml(row.list)}</td>
                <td>${formatNumber(row.votes)}</td>
                <td>${row.qualified ? "Qualified" : "Below EQ"}</td>
                <td>${row.seats}</td>
                <td>${row.baseSeats}</td>
              </tr>
            `
          )
          .join("")}
      </tbody>
    </table>
  `;
}

function renderPrintableWinnersTable(rows) {
  if (!rows.length) {
    return '<p class="empty">No winners in current simulation.</p>';
  }

  return `
    <table>
      <thead>
        <tr>
          <th>Seat</th>
          <th>Sect</th>
          <th>Name</th>
          <th>List</th>
          <th>Votes</th>
        </tr>
      </thead>
      <tbody>
        ${rows
          .map(
            (row) => `
              <tr>
                <td>${row.seatNumber}</td>
                <td>${escapeHtml(row.sect)}</td>
                <td class="${getTextDirectionClass(row.name)}">${escapeHtml(row.name)}</td>
                <td class="${getTextDirectionClass(row.list)}">${escapeHtml(row.list)}</td>
                <td>${formatNumber(row.votes)}</td>
              </tr>
            `
          )
          .join("")}
      </tbody>
    </table>
  `;
}

function renderPrintableSectCoverageTable(rows) {
  if (!rows.length) {
    return '<p class="empty">No sect coverage available.</p>';
  }

  return `
    <table>
      <thead>
        <tr>
          <th>Sect</th>
          <th>Required</th>
          <th>Elected</th>
          <th>Remaining</th>
        </tr>
      </thead>
      <tbody>
        ${rows
          .map(
            (row) => `
              <tr>
                <td>${escapeHtml(row.sect)}</td>
                <td>${row.requiredSeats}</td>
                <td>${row.electedSeats}</td>
                <td>${row.remaining}</td>
              </tr>
            `
          )
          .join("")}
      </tbody>
    </table>
  `;
}

function renderPrintableWarnings(rows) {
  if (!rows.length) {
    return '<p class="empty">None.</p>';
  }

  return `
    <ul class="warning-list">
      ${rows.map((warning) => `<li>${escapeHtml(warning)}</li>`).join("")}
    </ul>
  `;
}

function getTextDirectionClass(value) {
  return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(String(value ?? "")) ? "rtl" : "";
}

function buildPdfReportLines() {
  const summary = simulation.summary;
  const totalListCount = Array.isArray(simulation.listAllocation) ? simulation.listAllocation.length : 0;
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
    `- Blank Votes: ${formatNumber(summary.blankVotes)}`,
    `- Invalid Votes: ${formatNumber(summary.invalidVotes)}`,
    `- List-Only Votes: ${formatNumber(
      Array.isArray(state.listVotes)
        ? state.listVotes.reduce((sum, entry) => sum + clampInteger(entry?.votes, 0), 0)
        : 0
    )}`,
    `- Qualification EQ Vote Base: ${formatNumber(summary.qualificationEqVotes)}`,
    `- Qualification EQ: ${summary.qualificationQuotient > 0 ? formatDecimal(summary.qualificationQuotient) : "-"}`,
    `- Allocation EQ Vote Base: ${formatNumber(summary.eqVotes)}`,
    `- Allocation EQ: ${summary.electoralQuotient > 0 ? formatDecimal(summary.electoralQuotient) : "-"}`,
    `- Total Lists: ${totalListCount}`,
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
        `- ${row.list}: total ${formatNumber(row.votes)} | candidate ${formatNumber(
          row.candidateVotes
        )} | list-only ${formatNumber(row.listVotes)} | ${row.qualified ? "Qualified" : "Below EQ"} | seats ${row.seats} | base ${row.baseSeats}`
      );
    });
  }

  lines.push("", "Winning Candidates");
  if (!simulation.winners || simulation.winners.length === 0) {
    lines.push("- No winners in current simulation.");
  } else {
    simulation.winners.forEach((winner) => {
      lines.push(
        `- Seat #${winner.seatNumber} (${winner.sect}): ${winner.name} | ${winner.list} | votes ${formatNumber(winner.votes)}`
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

function getListVoteRows() {
  const grouped = new Map();

  for (const candidate of state.candidates) {
    const listName = String(candidate?.list ?? "").trim();
    if (!listName) {
      continue;
    }

    const key = normalizeListKey(listName);
    if (!grouped.has(key)) {
      grouped.set(key, {
        key,
        list: listName,
        candidateVotes: 0,
        listOnlyVotes: 0,
        totalVotes: 0,
        filled: 0,
        slots: 0
      });
    }

    const row = grouped.get(key);
    row.candidateVotes += clampInteger(candidate?.votes, 0);
    row.slots += 1;
    if (String(candidate?.name ?? "").trim()) {
      row.filled += 1;
    }
  }

  state.listVotes.forEach((entry) => {
    const key = normalizeListKey(entry?.list);
    const row = grouped.get(key);
    if (row) {
      row.listOnlyVotes = clampInteger(entry?.votes, 0);
      return;
    }

    const listName = String(entry?.list ?? "").trim();
    if (!listName) {
      return;
    }

    grouped.set(key, {
      list: listName,
      candidateVotes: 0,
      listOnlyVotes: clampInteger(entry?.votes, 0),
      totalVotes: 0,
      filled: 0,
      seats: 0
    });
  });

  const rows = Array.from(grouped.values());
  rows.forEach((row) => {
    row.totalVotes = row.candidateVotes + row.listOnlyVotes;
  });

  return rows.sort((a, b) => {
    if (b.totalVotes !== a.totalVotes) {
      return b.totalVotes - a.totalVotes;
    }
    return a.list.localeCompare(b.list, "en", { sensitivity: "base" });
  });
}

function setListOnlyVotes(listKey, fallbackName, value) {
  const key = normalizeListKey(listKey);
  if (!key) {
    return;
  }

  const canonicalName =
    state.candidates.find((candidate) => normalizeListKey(candidate?.list) === key)?.list ||
    state.listVotes.find((entry) => normalizeListKey(entry?.list) === key)?.list ||
    String(fallbackName ?? "").trim();
  const votes = clampInteger(value, 0);
  const existing = state.listVotes.find((entry) => normalizeListKey(entry?.list) === key);

  if (existing) {
    existing.list = canonicalName;
    existing.votes = votes;
    return;
  }

  state.listVotes.push({
    list: canonicalName,
    votes
  });
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

function getSectPalette(label) {
  const seed = Array.from(String(label ?? "")).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const hue = seed % 360;
  return {
    fill: `hsl(${hue} 62% 88%)`,
    edge: `hsl(${hue} 52% 72%)`,
    text: `hsl(${hue} 62% 24%)`
  };
}

function buildSectShortLabel(label) {
  return String(label ?? "")
    .split(/[\s(/-]+/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 4);
}

function darkenColor(color, factor = 0.8) {
  const match = String(color).match(/^hsl\(([-\d.]+)\s+([-\d.]+)%\s+([-\d.]+)%\)$/i);
  if (!match) {
    return color;
  }

  const [, hue, saturation, lightness] = match;
  const nextLightness = Math.max(0, Math.min(100, Number(lightness) * factor));
  return `hsl(${hue} ${saturation}% ${nextLightness}%)`;
}

function renderGlossaryTerm(glossaryKey, label) {
  return `<button type="button" class="glossary-term" data-glossary-key="${escapeHtml(glossaryKey)}" aria-expanded="false">${escapeHtml(label)}</button>`;
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

import rawTemplates from "./templates.json" with { type: "json" };

function hashVersionPayload(value) {
  const json = JSON.stringify(value);
  let hash = 2166136261;

  for (let index = 0; index < json.length; index += 1) {
    hash ^= json.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return `v${(hash >>> 0).toString(16)}`;
}

const templatesDataVersion = hashVersionPayload(rawTemplates);

function normalizeTemplate(rawTemplate, index) {
  const id = String(rawTemplate?.id ?? "").trim() || `template-${index + 1}`;
  const name = String(rawTemplate?.name ?? "").trim() || `Template ${index + 1}`;

  const quotas = Array.isArray(rawTemplate?.quotas)
    ? rawTemplate.quotas
        .map((entry) => ({
          sect: String(entry?.sect ?? "").trim(),
          seats: Math.max(0, Math.floor(Number(entry?.seats) || 0))
        }))
        .filter((entry) => entry.sect && entry.seats > 0)
    : [];

  return { id, name, quotas };
}

export async function loadRegionTemplates() {
  const templates = Array.isArray(rawTemplates) ? rawTemplates : [];
  return templates.map(normalizeTemplate).filter((template) => template.quotas.length > 0);
}

export function getTemplatesDataVersion() {
  return templatesDataVersion;
}

export function createEmptyState() {
  return {
    regionName: "",
    quotas: [],
    candidates: [],
    listVotes: [],
    invalidVotes: 0,
    quotasLocked: false
  };
}

export function cloneTemplate(template) {
  return {
    regionName: template.name,
    quotas: template.quotas.map((entry) => ({ ...entry })),
    candidates: [],
    listVotes: [],
    invalidVotes: 0,
    quotasLocked: true
  };
}

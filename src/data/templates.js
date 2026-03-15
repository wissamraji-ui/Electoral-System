import rawTemplates from "./templates.json" with { type: "json" };

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

export function createEmptyState() {
  return {
    regionName: "",
    quotas: [],
    candidates: [],
    listVotes: [],
    quotasLocked: false
  };
}

export function cloneTemplate(template) {
  return {
    regionName: template.name,
    quotas: template.quotas.map((entry) => ({ ...entry })),
    candidates: [],
    listVotes: [],
    quotasLocked: true
  };
}

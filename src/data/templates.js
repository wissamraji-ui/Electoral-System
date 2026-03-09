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
  const response = await fetch("./src/data/templates.json", { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Template load failed with status ${response.status}`);
  }

  const raw = await response.json();
  const templates = Array.isArray(raw) ? raw : [];
  return templates.map(normalizeTemplate).filter((template) => template.quotas.length > 0);
}

export function createEmptyState() {
  return {
    regionName: "",
    quotas: [],
    candidates: []
  };
}

export function cloneTemplate(template) {
  return {
    regionName: template.name,
    quotas: template.quotas.map((entry) => ({ ...entry })),
    candidates: []
  };
}

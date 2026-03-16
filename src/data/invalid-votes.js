function hashVersionPayload(value) {
  const json = JSON.stringify(value);
  let hash = 2166136261;

  for (let index = 0; index < json.length; index += 1) {
    hash ^= json.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return `v${(hash >>> 0).toString(16)}`;
}

const invalidVotesByYearAndTemplateId = {
  2018: {
    "beirut-i": 1048,
    "beirut-ii": 3972,
    "bekaa-i": 2414,
    "bekaa-ii": 1745,
    "bekaa-iii": 3199,
    "mount-lebanon-i": 1984,
    "mount-lebanon-ii": 2044,
    "mount-lebanon-iii": 1585,
    "mount-lebanon-iv": 2683,
    "north-i": 3535,
    "north-ii": 5340,
    "north-iii": 2015,
    "south-i": 1608,
    "south-ii": 2962,
    "south-iii": 2775
  },
  2022: {
    "beirut-i": 1615,
    "beirut-ii": 5795,
    "bekaa-i": 2686,
    "bekaa-ii": 2198,
    "bekaa-iii": 3977,
    "mount-lebanon-i": 3314,
    "mount-lebanon-ii": 2704,
    "mount-lebanon-iii": 2386,
    "mount-lebanon-iv": 4226,
    "north-i": 5252,
    "north-ii": 6880,
    "north-iii": 3707,
    "south-i": 2076,
    "south-ii": 4474,
    "south-iii": 6410
  }
};

const invalidVotesDataVersion = hashVersionPayload(invalidVotesByYearAndTemplateId);

export function getInvalidVotes(year, templateId) {
  const yearKey = String(year ?? "").trim();
  const templateKey = String(templateId ?? "").trim();
  const value = invalidVotesByYearAndTemplateId[yearKey]?.[templateKey];
  return Number.isFinite(value) ? value : 0;
}

export function getInvalidVotesDataVersion() {
  return invalidVotesDataVersion;
}

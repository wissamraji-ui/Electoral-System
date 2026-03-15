function toSafeInteger(value) {
  return Math.max(0, Math.floor(Number(value) || 0));
}

function normalizeCandidate(candidate) {
  return {
    name: String(candidate?.name ?? "").trim(),
    sect: String(candidate?.sect ?? "").trim(),
    list: String(candidate?.list ?? "").trim(),
    votes: toSafeInteger(candidate?.votes)
  };
}

function normalizeListKey(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

export function normalizeElectionBaseline(template, baselineCandidates, fallbackListName = "Imported List") {
  const candidates = Array.isArray(baselineCandidates)
    ? baselineCandidates.map(normalizeCandidate).filter((candidate) => candidate.name && candidate.sect)
    : [];

  const seatQuotaBySect = new Map(
    (Array.isArray(template?.quotas) ? template.quotas : []).map((entry) => [
      String(entry?.sect ?? "").trim(),
      toSafeInteger(entry?.seats)
    ])
  );
  const totalSeats = [...seatQuotaBySect.values()].reduce((sum, seats) => sum + seats, 0);
  const normalizedCandidates = [];
  const listBuckets = new Map();

  candidates.forEach((candidate, index) => {
    const listName = candidate.list || fallbackListName;
    if (!seatQuotaBySect.has(candidate.sect)) {
      return;
    }

    if (!listBuckets.has(listName)) {
      listBuckets.set(listName, []);
    }

    listBuckets.get(listName).push({
      ...candidate,
      list: listName,
      sourceIndex: index
    });
  });

  [...listBuckets.entries()]
    .sort((left, right) => left[0].localeCompare(right[0], "en"))
    .forEach(([, listCandidates]) => {
      const keptCandidates = [];

      seatQuotaBySect.forEach((quota, sect) => {
        listCandidates
          .filter((candidate) => candidate.sect === sect)
          .sort((left, right) => right.votes - left.votes || left.sourceIndex - right.sourceIndex)
          .slice(0, quota)
          .forEach((candidate) => keptCandidates.push(candidate));
      });

      keptCandidates
        .sort((left, right) => right.votes - left.votes || left.sourceIndex - right.sourceIndex)
        .slice(0, totalSeats)
        .sort((left, right) => left.sourceIndex - right.sourceIndex)
        .forEach((candidate) => {
          normalizedCandidates.push({
            name: candidate.name,
            sect: candidate.sect,
            list: candidate.list,
            votes: candidate.votes
          });
        });
    });

  return normalizedCandidates;
}

export function normalizeElectionBaselineListVotes(normalizedCandidates, baselineListVotes) {
  const allowedLists = new Map();

  (Array.isArray(normalizedCandidates) ? normalizedCandidates : []).forEach((candidate) => {
    const listName = String(candidate?.list ?? "").trim();
    const key = normalizeListKey(listName);
    if (key && !allowedLists.has(key)) {
      allowedLists.set(key, listName);
    }
  });

  const votesByKey = new Map();
  (Array.isArray(baselineListVotes) ? baselineListVotes : []).forEach((entry) => {
    const key = normalizeListKey(entry?.list);
    const listName = String(entry?.list ?? "").trim();
    if (!key) {
      return;
    }

    if (!allowedLists.has(key)) {
      allowedLists.set(key, listName || entry?.list || "");
    }

    votesByKey.set(key, (votesByKey.get(key) ?? 0) + toSafeInteger(entry?.votes));
  });

  return Array.from(votesByKey.entries()).map(([key, votes]) => ({
    list: allowedLists.get(key),
    votes
  }));
}

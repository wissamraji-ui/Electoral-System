function normalizeSect(sect) {
  return String(sect ?? "")
    .trim()
    .toLowerCase();
}

function normalizeName(name) {
  return String(name ?? "").trim();
}

function normalizeMinorDistrict(value) {
  return String(value ?? "").trim();
}

function normalizeQuotaKeyPart(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

function buildQuotaKey(sect, minorDistrict = "") {
  return `${normalizeQuotaKeyPart(sect)}::${normalizeQuotaKeyPart(minorDistrict)}`;
}

function toVoteNumber(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric >= 0 ? Math.floor(numeric) : 0;
}

function normalizeListKey(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function compareCandidates(a, b) {
  if (b.rankingScore !== a.rankingScore) {
    return b.rankingScore - a.rankingScore;
  }

  if (b.votes !== a.votes) {
    return b.votes - a.votes;
  }

  return a.name.localeCompare(b.name, "en", { sensitivity: "base" });
}

function compareListsByRemainder(a, b) {
  if (b.remainderVotes !== a.remainderVotes) {
    return b.remainderVotes - a.remainderVotes;
  }

  if (b.votes !== a.votes) {
    return b.votes - a.votes;
  }

  return a.list.localeCompare(b.list, "en", { sensitivity: "base" });
}

function createGraph(size) {
  return Array.from({ length: size }, () => []);
}

function addEdge(graph, from, to, capacity, cost) {
  const forward = { to, rev: graph[to].length, capacity, cost };
  const backward = { to: from, rev: graph[from].length, capacity: 0, cost: -cost };

  graph[from].push(forward);
  graph[to].push(backward);
  return graph[from].length - 1;
}

function runMinCostMaxFlow(graph, source, sink) {
  const nodeCount = graph.length;
  const potentials = Array(nodeCount).fill(0);
  const previousNode = Array(nodeCount).fill(-1);
  const previousEdge = Array(nodeCount).fill(-1);
  let flow = 0;

  while (true) {
    const distances = Array(nodeCount).fill(Number.POSITIVE_INFINITY);
    const used = Array(nodeCount).fill(false);
    distances[source] = 0;

    for (let step = 0; step < nodeCount; step += 1) {
      let current = -1;
      for (let node = 0; node < nodeCount; node += 1) {
        if (!used[node] && (current === -1 || distances[node] < distances[current])) {
          current = node;
        }
      }

      if (current === -1 || !Number.isFinite(distances[current])) {
        break;
      }

      used[current] = true;
      for (let edgeIndex = 0; edgeIndex < graph[current].length; edgeIndex += 1) {
        const edge = graph[current][edgeIndex];
        if (edge.capacity <= 0) {
          continue;
        }

        const candidateDistance =
          distances[current] + edge.cost + potentials[current] - potentials[edge.to];
        if (candidateDistance < distances[edge.to]) {
          distances[edge.to] = candidateDistance;
          previousNode[edge.to] = current;
          previousEdge[edge.to] = edgeIndex;
        }
      }
    }

    if (!Number.isFinite(distances[sink])) {
      break;
    }

    for (let node = 0; node < nodeCount; node += 1) {
      if (Number.isFinite(distances[node])) {
        potentials[node] += distances[node];
      }
    }

    let pathFlow = Number.POSITIVE_INFINITY;
    for (let node = sink; node !== source; node = previousNode[node]) {
      const from = previousNode[node];
      const edge = graph[from][previousEdge[node]];
      pathFlow = Math.min(pathFlow, edge.capacity);
    }

    for (let node = sink; node !== source; node = previousNode[node]) {
      const from = previousNode[node];
      const edge = graph[from][previousEdge[node]];
      edge.capacity -= pathFlow;
      graph[node][edge.rev].capacity += pathFlow;
    }

    flow += pathFlow;
  }

  return { flow };
}

export function computeResults(quotas, candidates, listVotes = [], blankVotes = 0, invalidVotes = 0) {
  const safeQuotas = Array.isArray(quotas)
    ? quotas
        .map((entry) => ({
          sect: normalizeName(entry?.sect),
          seats: Math.max(0, Math.floor(Number(entry?.seats) || 0)),
          minorDistrict: normalizeMinorDistrict(entry?.minorDistrict)
        }))
        .filter((entry) => entry.sect && entry.seats > 0)
    : [];

  const safeCandidates = Array.isArray(candidates)
    ? candidates
        .map((candidate) => ({
          id: candidate?.id ?? `${Math.random()}`,
          name: normalizeName(candidate?.name),
          sect: normalizeName(candidate?.sect),
          list: normalizeName(candidate?.list),
          votes: toVoteNumber(candidate?.votes),
          minorDistrict: normalizeMinorDistrict(candidate?.minorDistrict)
        }))
        .filter((candidate) => candidate.name && candidate.sect && candidate.list)
    : [];

  const warnings = [];

  const candidateListsByKey = new Map();
  safeCandidates.forEach((candidate) => {
    const key = normalizeListKey(candidate.list);
    if (key && !candidateListsByKey.has(key)) {
      candidateListsByKey.set(key, candidate.list);
    }
  });

  const extraListVotesByKey = new Map();
  const listNamesByKey = new Map(candidateListsByKey);
  if (Array.isArray(listVotes)) {
    listVotes.forEach((entry) => {
      const key = normalizeListKey(entry?.list);
      if (!key) {
        return;
      }

      if (!listNamesByKey.has(key)) {
        listNamesByKey.set(key, normalizeName(entry?.list));
      }
      extraListVotesByKey.set(key, (extraListVotesByKey.get(key) ?? 0) + toVoteNumber(entry?.votes));
    });
  }

  const listStatsMap = new Map();
  safeCandidates.forEach((candidate) => {
    const key = normalizeListKey(candidate.list);
    if (!listStatsMap.has(key)) {
      listStatsMap.set(key, {
        list: candidate.list,
        candidateVotes: 0,
        listVotes: extraListVotesByKey.get(key) ?? 0,
        votes: 0,
        baseSeats: 0,
        remainderVotes: 0,
        seats: 0,
        qualified: false
      });
    }
    const stats = listStatsMap.get(key);
    stats.candidateVotes += candidate.votes;
  });

  extraListVotesByKey.forEach((votes, key) => {
    if (!listStatsMap.has(key)) {
      listStatsMap.set(key, {
        list: listNamesByKey.get(key) ?? key,
        candidateVotes: 0,
        listVotes: votes,
        votes,
        baseSeats: 0,
        remainderVotes: 0,
        seats: 0,
        qualified: false
      });
    }
  });

  listStatsMap.forEach((entry) => {
    entry.votes = entry.candidateVotes + entry.listVotes;
  });

  const listAllocation = Array.from(listStatsMap.values()).sort((a, b) => {
    if (b.votes !== a.votes) {
      return b.votes - a.votes;
    }

    return a.list.localeCompare(b.list, "en", { sensitivity: "base" });
  });

  const totalSeats = safeQuotas.reduce((sum, entry) => sum + entry.seats, 0);
  const totalVotes = listAllocation.reduce((sum, entry) => sum + entry.votes, 0);
  const safeBlankVotes = toVoteNumber(blankVotes);
  const safeInvalidVotes = toVoteNumber(invalidVotes);
  const eqVotes = totalVotes + safeBlankVotes;
  const qualificationQuotient = totalSeats > 0 && eqVotes > 0 ? eqVotes / totalSeats : 0;

  if (totalSeats > 0 && eqVotes === 0 && safeCandidates.length > 0) {
    warnings.push("No votes entered. EQ cannot be applied until vote totals are above zero.");
  }

  const qualifiedLists =
    qualificationQuotient > 0 ? listAllocation.filter((entry) => entry.votes >= qualificationQuotient) : [];
  qualifiedLists.forEach((entry) => {
    entry.qualified = true;
  });

  if (qualificationQuotient > 0 && listAllocation.length > 0 && qualifiedLists.length === 0) {
    warnings.push("No list reached the electoral quotient (EQ), so no seats can be distributed.");
  }

  const disqualifiedLists = listAllocation.filter((entry) => !entry.qualified);
  if (disqualifiedLists.length > 0 && qualificationQuotient > 0) {
    warnings.push(
      `Lists below EQ and excluded: ${disqualifiedLists.map((entry) => entry.list).join(", ")}.`
    );
  }

  const qualifiedVotes = qualifiedLists.reduce((sum, entry) => sum + entry.votes, 0);
  const allocationEqVotes = qualifiedLists.length > 0 ? qualifiedVotes + safeBlankVotes : eqVotes;
  const electoralQuotient = totalSeats > 0 && allocationEqVotes > 0 ? allocationEqVotes / totalSeats : 0;

  let allocatedBaseSeats = 0;
  if (electoralQuotient > 0) {
    qualifiedLists.forEach((entry) => {
      entry.baseSeats = Math.floor(entry.votes / electoralQuotient);
      entry.remainderVotes = entry.votes - entry.baseSeats * electoralQuotient;
      entry.seats = entry.baseSeats;
      allocatedBaseSeats += entry.baseSeats;
    });

    let remainingSeats = Math.max(0, totalSeats - allocatedBaseSeats);
    const remainderRanking = [...qualifiedLists].sort(compareListsByRemainder);

    if (remainingSeats > 0 && remainderRanking.length > 0) {
      for (let i = 0; i < remainingSeats; i += 1) {
        const listEntry = remainderRanking[i % remainderRanking.length];
        listEntry.seats += 1;
      }
    }
  }

  const qualifiedSeatMap = new Map(
    listAllocation
      .filter((entry) => entry.qualified && entry.seats > 0)
      .map((entry) => [entry.list, entry.seats])
  );

  const minorDistrictVoteTotals = new Map();
  safeCandidates.forEach((candidate) => {
    if (!candidate.minorDistrict) {
      return;
    }

    minorDistrictVoteTotals.set(
      candidate.minorDistrict,
      (minorDistrictVoteTotals.get(candidate.minorDistrict) ?? 0) + candidate.votes
    );
  });

  const selectedCandidates = [];
  const selectedIds = new Set();
  const quotaSeatMap = new Map(safeQuotas.map((quota) => [buildQuotaKey(quota.sect, quota.minorDistrict), quota.seats]));
  const rankedQualifiedCandidates = safeCandidates
    .filter(
      (candidate) =>
        qualifiedSeatMap.has(candidate.list) && quotaSeatMap.has(buildQuotaKey(candidate.sect, candidate.minorDistrict))
    )
    .map((candidate) => {
      const rankingBase = candidate.minorDistrict ? minorDistrictVoteTotals.get(candidate.minorDistrict) ?? 0 : 0;
      return {
        ...candidate,
        rankingScore: rankingBase > 0 ? candidate.votes / rankingBase : candidate.votes
      };
    })
    .sort(compareCandidates);

  if (rankedQualifiedCandidates.length > 0 && qualifiedSeatMap.size > 0 && quotaSeatMap.size > 0) {
    const remainingSeatsByList = new Map(qualifiedSeatMap);
    const remainingSeatsByQuota = new Map(quotaSeatMap);

    rankedQualifiedCandidates.forEach((candidate) => {
      const listSeatsLeft = remainingSeatsByList.get(candidate.list) ?? 0;
      const quotaKey = buildQuotaKey(candidate.sect, candidate.minorDistrict);
      const quotaSeatsLeft = remainingSeatsByQuota.get(quotaKey) ?? 0;

      if (listSeatsLeft <= 0 || quotaSeatsLeft <= 0) {
        return;
      }

      selectedCandidates.push(candidate);
      selectedIds.add(candidate.id);
      remainingSeatsByList.set(candidate.list, listSeatsLeft - 1);
      remainingSeatsByQuota.set(quotaKey, quotaSeatsLeft - 1);
    });
  }

  const winners = [];
  const sectCoverage = [];
  let seatIndex = 0;

  for (const quota of safeQuotas) {
    const quotaKey = buildQuotaKey(quota.sect, quota.minorDistrict);
    const electedForSect = selectedCandidates
      .filter((candidate) => buildQuotaKey(candidate.sect, candidate.minorDistrict) === quotaKey)
      .sort(compareCandidates);
    const nonElectedForSect = rankedQualifiedCandidates
      .filter((candidate) => buildQuotaKey(candidate.sect, candidate.minorDistrict) === quotaKey && !selectedIds.has(candidate.id))
      .sort(compareCandidates);
    const quotaLabel = quota.minorDistrict ? `${quota.sect} (${quota.minorDistrict})` : quota.sect;

    const remaining = Math.max(0, quota.seats - electedForSect.length);
    if (remaining > 0) {
      warnings.push(
        `Unfilled seats in ${quotaLabel}: ${remaining} seat${remaining > 1 ? "s" : ""} without valid list/sect coverage.`
      );
    }

    if (electedForSect.length > 0 && nonElectedForSect.length > 0) {
      const cutoffVotes = electedForSect[electedForSect.length - 1].votes;
      const tiedOutside = nonElectedForSect.filter((candidate) => candidate.votes === cutoffVotes);
      if (tiedOutside.length > 0) {
        const tiedNames = [
          electedForSect[electedForSect.length - 1].name,
          ...tiedOutside.map((candidate) => candidate.name)
        ].join(", ");
        warnings.push(`Tie at cutoff in ${quotaLabel}: ${tiedNames}.`);
      }
    }

    electedForSect.forEach((candidate, index) => {
      seatIndex += 1;
      const nextCandidate = nonElectedForSect[0] ?? null;
      const margin = nextCandidate ? candidate.votes - nextCandidate.votes : null;

      winners.push({
        seatNumber: seatIndex,
        sect: quota.sect,
        minorDistrict: quota.minorDistrict,
        seatLabel: `${quotaLabel} Seat ${index + 1}`,
        name: candidate.name,
        list: candidate.list,
        votes: candidate.votes,
        margin
      });
    });

    sectCoverage.push({
      sect: quota.sect,
      minorDistrict: quota.minorDistrict,
      requiredSeats: quota.seats,
      electedSeats: electedForSect.length,
      remaining
    });
  }

  listAllocation
    .filter((entry) => entry.seats > 0)
    .forEach((entry) => {
      const electedFromList = selectedCandidates.filter((candidate) => candidate.list === entry.list).length;
      const unfilled = entry.seats - electedFromList;
      if (unfilled > 0) {
        warnings.push(
          `List "${entry.list}" won ${entry.seats} seat${entry.seats > 1 ? "s" : ""} by EQ, but ${unfilled} remained unfilled due to sect constraints or missing candidates.`
        );
      }
    });

  const filledSeats = winners.length;
  const coveragePct = totalSeats > 0 ? Math.round((filledSeats / totalSeats) * 100) : 0;

  return {
    winners,
    listAllocation: listAllocation.map((entry) => ({
      list: entry.list,
      candidateVotes: entry.candidateVotes,
      listVotes: entry.listVotes,
      votes: entry.votes,
      qualified: entry.qualified,
      seats: entry.seats,
      baseSeats: entry.baseSeats,
      remainderVotes: entry.remainderVotes
    })),
    sectCoverage,
    warnings,
    summary: {
      totalSeats,
      filledSeats,
      totalCandidates: safeCandidates.length,
      totalVotes,
      blankVotes: safeBlankVotes,
      invalidVotes: safeInvalidVotes,
      eqVotes: allocationEqVotes,
      qualificationEqVotes: eqVotes,
      qualificationQuotient,
      coveragePct,
      electoralQuotient,
      qualifiedListCount: qualifiedLists.length,
      disqualifiedListCount: disqualifiedLists.length
    }
  };
}

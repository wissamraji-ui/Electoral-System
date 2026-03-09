function normalizeSect(sect) {
  return String(sect ?? "")
    .trim()
    .toLowerCase();
}

function normalizeName(name) {
  return String(name ?? "").trim();
}

function toVoteNumber(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric >= 0 ? Math.floor(numeric) : 0;
}

function compareCandidates(a, b) {
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

export function computeResults(quotas, candidates) {
  const safeQuotas = Array.isArray(quotas)
    ? quotas
        .map((entry) => ({
          sect: normalizeName(entry?.sect),
          seats: Math.max(0, Math.floor(Number(entry?.seats) || 0))
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
          votes: toVoteNumber(candidate?.votes)
        }))
        .filter((candidate) => candidate.name && candidate.sect && candidate.list)
    : [];

  const totalSeats = safeQuotas.reduce((sum, entry) => sum + entry.seats, 0);
  const totalVotes = safeCandidates.reduce((sum, candidate) => sum + candidate.votes, 0);
  const electoralQuotient = totalSeats > 0 && totalVotes > 0 ? totalVotes / totalSeats : 0;
  const warnings = [];

  const listStatsMap = new Map();
  safeCandidates.forEach((candidate) => {
    if (!listStatsMap.has(candidate.list)) {
      listStatsMap.set(candidate.list, {
        list: candidate.list,
        votes: 0,
        baseSeats: 0,
        remainderVotes: 0,
        seats: 0,
        qualified: false
      });
    }
    const stats = listStatsMap.get(candidate.list);
    stats.votes += candidate.votes;
  });

  const listAllocation = Array.from(listStatsMap.values()).sort((a, b) => {
    if (b.votes !== a.votes) {
      return b.votes - a.votes;
    }

    return a.list.localeCompare(b.list, "en", { sensitivity: "base" });
  });

  if (totalSeats > 0 && totalVotes === 0 && safeCandidates.length > 0) {
    warnings.push("No votes entered. EQ cannot be applied until vote totals are above zero.");
  }

  const qualifiedLists = electoralQuotient > 0 ? listAllocation.filter((entry) => entry.votes >= electoralQuotient) : [];
  qualifiedLists.forEach((entry) => {
    entry.qualified = true;
  });

  if (electoralQuotient > 0 && listAllocation.length > 0 && qualifiedLists.length === 0) {
    warnings.push("No list reached the electoral quotient (EQ), so no seats can be distributed.");
  }

  const disqualifiedLists = listAllocation.filter((entry) => !entry.qualified);
  if (disqualifiedLists.length > 0 && electoralQuotient > 0) {
    warnings.push(
      `Lists below EQ and excluded: ${disqualifiedLists.map((entry) => entry.list).join(", ")}.`
    );
  }

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

  const selectedCandidates = [];
  const selectedIds = new Set();
  const sectQuotaMap = new Map(safeQuotas.map((quota) => [normalizeSect(quota.sect), quota.seats]));
  const rankedQualifiedCandidates = safeCandidates
    .filter((candidate) => qualifiedSeatMap.has(candidate.list) && sectQuotaMap.has(normalizeSect(candidate.sect)))
    .sort(compareCandidates);

  if (rankedQualifiedCandidates.length > 0 && qualifiedSeatMap.size > 0 && sectQuotaMap.size > 0) {
    const listNames = Array.from(qualifiedSeatMap.keys()).sort((a, b) =>
      a.localeCompare(b, "en", { sensitivity: "base" })
    );
    const sectKeys = Array.from(sectQuotaMap.keys()).sort((a, b) =>
      a.localeCompare(b, "en", { sensitivity: "base" })
    );

    const listNodeStart = 1;
    const candidateNodeStart = listNodeStart + listNames.length;
    const sectNodeStart = candidateNodeStart + rankedQualifiedCandidates.length;
    const sink = sectNodeStart + sectKeys.length;
    const graph = createGraph(sink + 1);

    const listNodeMap = new Map(listNames.map((listName, index) => [listName, listNodeStart + index]));
    const sectNodeMap = new Map(sectKeys.map((sectKey, index) => [sectKey, sectNodeStart + index]));

    listNames.forEach((listName) => {
      addEdge(graph, 0, listNodeMap.get(listName), qualifiedSeatMap.get(listName) ?? 0, 0);
    });

    const maxVotes = Math.max(...rankedQualifiedCandidates.map((candidate) => candidate.votes), 0);
    const candidateEdgeRefs = [];

    rankedQualifiedCandidates.forEach((candidate, index) => {
      const candidateNode = candidateNodeStart + index;
      const listNode = listNodeMap.get(candidate.list);
      const sectNode = sectNodeMap.get(normalizeSect(candidate.sect));
      const voteCost = maxVotes - candidate.votes;
      const inboundEdgeIndex = addEdge(graph, listNode, candidateNode, 1, voteCost);
      addEdge(graph, candidateNode, sectNode, 1, 0);

      candidateEdgeRefs.push({
        candidate,
        listNode,
        inboundEdgeIndex
      });
    });

    sectKeys.forEach((sectKey) => {
      addEdge(graph, sectNodeMap.get(sectKey), sink, sectQuotaMap.get(sectKey) ?? 0, 0);
    });

    runMinCostMaxFlow(graph, 0, sink);

    candidateEdgeRefs.forEach((entry) => {
      const edge = graph[entry.listNode][entry.inboundEdgeIndex];
      if (edge.capacity === 0) {
        selectedCandidates.push(entry.candidate);
        selectedIds.add(entry.candidate.id);
      }
    });
  }

  const winners = [];
  const sectCoverage = [];
  let seatIndex = 0;

  for (const quota of safeQuotas) {
    const sectKey = normalizeSect(quota.sect);
    const electedForSect = selectedCandidates
      .filter((candidate) => normalizeSect(candidate.sect) === sectKey)
      .sort(compareCandidates);
    const nonElectedForSect = rankedQualifiedCandidates
      .filter((candidate) => normalizeSect(candidate.sect) === sectKey && !selectedIds.has(candidate.id))
      .sort(compareCandidates);

    const remaining = Math.max(0, quota.seats - electedForSect.length);
    if (remaining > 0) {
      warnings.push(
        `Unfilled seats in ${quota.sect}: ${remaining} seat${remaining > 1 ? "s" : ""} without valid list/sect coverage.`
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
        warnings.push(`Tie at cutoff in ${quota.sect}: ${tiedNames}.`);
      }
    }

    electedForSect.forEach((candidate, index) => {
      seatIndex += 1;
      const nextCandidate = nonElectedForSect[0] ?? null;
      const margin = nextCandidate ? candidate.votes - nextCandidate.votes : null;

      winners.push({
        seatNumber: seatIndex,
        sect: quota.sect,
        seatLabel: `${quota.sect} Seat ${index + 1}`,
        name: candidate.name,
        list: candidate.list,
        votes: candidate.votes,
        margin
      });
    });

    sectCoverage.push({
      sect: quota.sect,
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
      coveragePct,
      electoralQuotient,
      qualifiedListCount: qualifiedLists.length,
      disqualifiedListCount: disqualifiedLists.length
    }
  };
}

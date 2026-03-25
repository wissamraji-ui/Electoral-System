import test from "node:test";
import assert from "node:assert/strict";

import { computeResults, computeSeatChangeThresholds } from "../src/engine.js";

test("allocates seats to lists by EQ before selecting candidate winners", () => {
  const quotas = [{ sect: "Sunni", seats: 3 }];
  const candidates = [
    { name: "A1", sect: "Sunni", list: "Alpha", votes: 60 },
    { name: "A2", sect: "Sunni", list: "Alpha", votes: 30 },
    { name: "B1", sect: "Sunni", list: "Beta", votes: 70 },
    { name: "C1", sect: "Sunni", list: "Cedar", votes: 40 }
  ];

  const result = computeResults(quotas, candidates);
  assert.equal(result.summary.totalSeats, 3);
  assert.equal(result.summary.filledSeats, 3);
  assert.equal(result.summary.qualifiedListCount, 2);
  assert.equal(result.summary.disqualifiedListCount, 1);

  const byList = new Map(result.listAllocation.map((row) => [row.list, row.seats]));
  assert.equal(byList.get("Alpha"), 2);
  assert.equal(byList.get("Beta"), 1);
  assert.equal(byList.get("Cedar"), 0);

  assert.deepEqual(result.winners.map((winner) => winner.name), ["B1", "A1", "A2"]);
});

test("requires list name and ignores candidates without a list", () => {
  const quotas = [{ sect: "Greek Orthodox", seats: 1 }];
  const candidates = [
    { name: "NoList Candidate", sect: "Greek Orthodox", votes: 999 },
    { name: "Valid Candidate", sect: "Greek Orthodox", list: "National Bloc", votes: 10 }
  ];

  const result = computeResults(quotas, candidates);
  assert.equal(result.summary.filledSeats, 1);
  assert.equal(result.summary.totalCandidates, 1);
  assert.equal(result.winners[0].name, "Valid Candidate");
});

test("ignores candidates without a name even when sect and list are provided", () => {
  const quotas = [{ sect: "Sunni", seats: 1 }];
  const candidates = [{ sect: "Sunni", list: "Alpha", votes: 500 }];

  const result = computeResults(quotas, candidates);
  assert.equal(result.summary.totalCandidates, 0);
  assert.equal(result.summary.totalVotes, 0);
  assert.equal(result.summary.filledSeats, 0);
  assert.equal(result.winners.length, 0);
});

test("flags ties at cutoff and applies alphabetical tie-break", () => {
  const quotas = [{ sect: "Shia", seats: 1 }];
  const candidates = [
    { name: "Youssef", sect: "Shia", list: "Unity List", votes: 400 },
    { name: "Ali", sect: "Shia", list: "Unity List", votes: 400 }
  ];

  const result = computeResults(quotas, candidates);
  assert.equal(result.winners[0].name, "Ali");
  assert.match(result.warnings.join(" "), /Tie at cutoff/i);
});

test("warns when EQ list seats cannot be fully matched to sect quotas", () => {
  const quotas = [
    { sect: "Sunni", seats: 1 },
    { sect: "Maronite", seats: 1 }
  ];
  const candidates = [
    { name: "S1", sect: "Sunni", list: "List A", votes: 200 },
    { name: "S2", sect: "Sunni", list: "List A", votes: 100 }
  ];

  const result = computeResults(quotas, candidates);
  assert.equal(result.summary.totalSeats, 2);
  assert.equal(result.summary.filledSeats, 1);
  assert.equal(result.sectCoverage.find((entry) => entry.sect === "Maronite")?.remaining, 1);
  assert.match(result.warnings.join(" "), /won 2 seat/i);
});

test("drops lists below EQ even when they have a high-vote candidate", () => {
  const quotas = [{ sect: "Sunni", seats: 4 }];
  const candidates = [
    { name: "A1", sect: "Sunni", list: "Alpha", votes: 80 },
    { name: "A2", sect: "Sunni", list: "Alpha", votes: 70 },
    { name: "A3", sect: "Sunni", list: "Alpha", votes: 60 },
    { name: "B1", sect: "Sunni", list: "Beta", votes: 75 },
    { name: "B2", sect: "Sunni", list: "Beta", votes: 65 },
    { name: "B3", sect: "Sunni", list: "Beta", votes: 50 },
    { name: "C1", sect: "Sunni", list: "Cedar", votes: 99 }
  ];

  const result = computeResults(quotas, candidates);

  const cedar = result.listAllocation.find((row) => row.list === "Cedar");
  assert.ok(cedar);
  assert.equal(cedar.qualified, false);
  assert.equal(cedar.seats, 0);
  assert.equal(result.winners.some((winner) => winner.list === "Cedar"), false);
  assert.match(result.warnings.join(" "), /below EQ/i);
});

test("includes list-only votes in list totals and EQ", () => {
  const quotas = [{ sect: "Sunni", seats: 2 }];
  const candidates = [
    { name: "A1", sect: "Sunni", list: "Alpha", votes: 60 },
    { name: "B1", sect: "Sunni", list: "Beta", votes: 55 }
  ];
  const listVotes = [
    { list: "Alpha", votes: 20 },
    { list: "Beta", votes: 25 }
  ];

  const result = computeResults(quotas, candidates, listVotes);
  const byList = new Map(result.listAllocation.map((row) => [row.list, row]));

  assert.equal(result.summary.totalVotes, 160);
  assert.equal(byList.get("Alpha")?.candidateVotes, 60);
  assert.equal(byList.get("Alpha")?.listVotes, 20);
  assert.equal(byList.get("Alpha")?.votes, 80);
  assert.equal(byList.get("Beta")?.votes, 80);
  assert.deepEqual(result.winners.map((winner) => winner.name), ["A1", "B1"]);
});

test("keeps list-only-only lists in EQ calculations", () => {
  const quotas = [{ sect: "Sunni", seats: 1 }];
  const candidates = [{ name: "A1", sect: "Sunni", list: "Alpha", votes: 90 }];
  const listVotes = [
    { list: "Alpha", votes: 5 },
    { list: "Beta", votes: 15 }
  ];

  const result = computeResults(quotas, candidates, listVotes);
  const byList = new Map(result.listAllocation.map((row) => [row.list, row]));

  assert.equal(result.summary.totalVotes, 110);
  assert.equal(byList.get("Alpha")?.votes, 95);
  assert.equal(byList.get("Beta")?.candidateVotes, 0);
  assert.equal(byList.get("Beta")?.listVotes, 15);
  assert.equal(byList.get("Beta")?.votes, 15);
});

test("includes blank votes in EQ but excludes invalid votes from EQ", () => {
  const quotas = [{ sect: "Sunni", seats: 2 }];
  const candidates = [
    { name: "A1", sect: "Sunni", list: "Alpha", votes: 60 },
    { name: "B1", sect: "Sunni", list: "Beta", votes: 50 },
    { name: "C1", sect: "Sunni", list: "Cedar", votes: 41 }
  ];

  const result = computeResults(quotas, candidates, [], 49, 999);
  const byList = new Map(result.listAllocation.map((row) => [row.list, row]));

  assert.equal(result.summary.totalVotes, 151);
  assert.equal(result.summary.blankVotes, 49);
  assert.equal(result.summary.invalidVotes, 999);
  assert.equal(result.summary.eqVotes, 200);
  assert.equal(result.summary.electoralQuotient, 100);
  assert.equal(byList.get("Alpha")?.qualified, false);
  assert.equal(byList.get("Beta")?.qualified, false);
  assert.equal(byList.get("Cedar")?.qualified, false);
});

test("ranks candidates by minor-district vote share when a district is split", () => {
  const quotas = [
    { sect: "Maronite", seats: 1, minorDistrict: "Aley" },
    { sect: "Maronite", seats: 1, minorDistrict: "Chouf" }
  ];
  const candidates = [
    { name: "Chouf Candidate", sect: "Maronite", list: "Alpha", votes: 600, minorDistrict: "Chouf" },
    { name: "Aley Candidate", sect: "Maronite", list: "Beta", votes: 500, minorDistrict: "Aley" },
    { name: "Chouf Running Mate", sect: "Sunni", list: "Alpha", votes: 1400, minorDistrict: "Chouf" },
    { name: "Aley Running Mate", sect: "Sunni", list: "Beta", votes: 500, minorDistrict: "Aley" }
  ];
  const listVotes = [
    { list: "Alpha", votes: 0 },
    { list: "Beta", votes: 1000 }
  ];

  const result = computeResults(quotas, candidates, listVotes);

  assert.deepEqual(result.winners.map((winner) => winner.name), ["Aley Candidate", "Chouf Candidate"]);
  assert.equal(result.winners[0].voteShareBase, 1000);
  assert.equal(result.winners[0].voteSharePct, 50);
  assert.equal(result.winners[1].voteShareBase, 2000);
  assert.equal(result.winners[1].voteSharePct, 30);
});

test("uses district candidate votes as the winner percentage base when there is no minor district", () => {
  const quotas = [{ sect: "Sunni", seats: 3 }];
  const candidates = [
    { name: "A1", sect: "Sunni", list: "Alpha", votes: 60 },
    { name: "A2", sect: "Sunni", list: "Alpha", votes: 30 },
    { name: "B1", sect: "Sunni", list: "Beta", votes: 70 },
    { name: "C1", sect: "Sunni", list: "Cedar", votes: 40 }
  ];

  const result = computeResults(quotas, candidates);

  assert.deepEqual(result.winners.map((winner) => winner.name), ["B1", "A1", "A2"]);
  assert.equal(result.winners[0].voteShareBase, 200);
  assert.equal(result.winners[0].voteSharePct, 35);
  assert.equal(result.winners[1].voteShareBase, 200);
  assert.equal(result.winners[1].voteSharePct, 30);
});

test("respects sect quotas split across multiple minor districts", () => {
  const quotas = [
    { sect: "Maronite", seats: 1, minorDistrict: "Aley" },
    { sect: "Maronite", seats: 1, minorDistrict: "Chouf" }
  ];
  const candidates = [
    { name: "Aley Winner", sect: "Maronite", list: "Alpha", votes: 500, minorDistrict: "Aley" },
    { name: "Chouf Winner", sect: "Maronite", list: "Alpha", votes: 400, minorDistrict: "Chouf" },
    { name: "Aley Loser", sect: "Maronite", list: "Beta", votes: 450, minorDistrict: "Aley" },
    { name: "Chouf Loser", sect: "Maronite", list: "Beta", votes: 350, minorDistrict: "Chouf" }
  ];
  const listVotes = [
    { list: "Alpha", votes: 500 },
    { list: "Beta", votes: 500 }
  ];

  const result = computeResults(quotas, candidates, listVotes);

  assert.deepEqual(
    result.winners.map((winner) => `${winner.name}:${winner.minorDistrict}`),
    ["Aley Winner:Aley", "Chouf Winner:Chouf"]
  );
});

test("assigns split-district seats by ranked order rather than raw vote maximization", () => {
  const quotas = [
    { sect: "Maronite", seats: 1, minorDistrict: "Batroun" },
    { sect: "Maronite", seats: 1, minorDistrict: "Bcharre" },
    { sect: "Greek Orthodox", seats: 1, minorDistrict: "Koura" }
  ];
  const candidates = [
    { name: "Batroun High Share", sect: "Maronite", list: "Alpha", votes: 6000, minorDistrict: "Batroun" },
    { name: "Bcharre Higher Raw Votes", sect: "Maronite", list: "Alpha", votes: 6500, minorDistrict: "Bcharre" },
    { name: "Koura Winner", sect: "Greek Orthodox", list: "Alpha", votes: 5000, minorDistrict: "Koura" },
    { name: "Alpha Batroun Running Mate", sect: "Greek Orthodox", list: "Alpha", votes: 1000, minorDistrict: "Batroun" },
    { name: "Alpha Bcharre Running Mate", sect: "Greek Orthodox", list: "Alpha", votes: 15000, minorDistrict: "Bcharre" },
    { name: "Batroun Other List", sect: "Maronite", list: "Beta", votes: 5900, minorDistrict: "Batroun" },
    { name: "Bcharre Other List", sect: "Maronite", list: "Beta", votes: 3000, minorDistrict: "Bcharre" },
    { name: "Koura Other List", sect: "Greek Orthodox", list: "Beta", votes: 1000, minorDistrict: "Koura" },
    { name: "Beta Batroun Running Mate", sect: "Greek Orthodox", list: "Beta", votes: 1000, minorDistrict: "Batroun" },
    { name: "Beta Bcharre Running Mate", sect: "Greek Orthodox", list: "Beta", votes: 15500, minorDistrict: "Bcharre" }
  ];
  const listVotes = [
    { list: "Alpha", votes: 3000 },
    { list: "Beta", votes: 3000 }
  ];

  const result = computeResults(quotas, candidates, listVotes);

  assert.deepEqual(result.listAllocation.map((row) => [row.list, row.seats]), [
    ["Alpha", 2],
    ["Beta", 1]
  ]);
  assert.deepEqual(result.winners.map((winner) => winner.name), [
    "Batroun High Share",
    "Bcharre Other List",
    "Koura Winner"
  ]);
});

test("computes seat gain thresholds by exact resimulation rather than remainder-only estimates", () => {
  const quotas = [{ sect: "Sunni", seats: 3 }];
  const candidates = [
    { name: "A1", sect: "Sunni", list: "Alpha", votes: 50 },
    { name: "B1", sect: "Sunni", list: "Beta", votes: 51 },
    { name: "C1", sect: "Sunni", list: "Cedar", votes: 51 }
  ];

  const thresholds = computeSeatChangeThresholds(quotas, candidates);
  const betaThreshold = thresholds.find((row) => row.list === "Beta");

  assert.equal(betaThreshold?.toGainSeat, 2);

  const plusOne = computeResults(quotas, candidates, [{ list: "Beta", votes: 1 }]);
  const plusTwo = computeResults(quotas, candidates, [{ list: "Beta", votes: 2 }]);

  assert.equal(plusOne.listAllocation.find((row) => row.list === "Beta")?.seats, 2);
  assert.equal(plusTwo.listAllocation.find((row) => row.list === "Beta")?.seats, 3);
});

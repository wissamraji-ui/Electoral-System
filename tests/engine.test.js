import test from "node:test";
import assert from "node:assert/strict";

import { computeResults } from "../src/engine.js";

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

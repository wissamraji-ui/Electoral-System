import test from "node:test";
import assert from "node:assert/strict";

import rawTemplates from "../src/data/templates.json" with { type: "json" };
import {
  getElectionResults2018TemplateIds,
  hasElectionResults2018,
  loadElectionResults2018
} from "../src/data/election-results-2018.js";

const VERIFIED_2018_TEMPLATE_IDS = ["beirut-i", "beirut-ii", "bekaa-i", "bekaa-ii", "bekaa-iii", "mount-lebanon-i", "mount-lebanon-ii", "mount-lebanon-iii", "mount-lebanon-iv", "north-i", "north-ii", "north-iii", "south-i", "south-ii", "south-iii"];

test("2018 baselines are exposed only for verified districts", () => {
  assert.deepEqual(getElectionResults2018TemplateIds(), VERIFIED_2018_TEMPLATE_IDS);

  assert.equal(hasElectionResults2018("south-ii"), true);
  assert.equal(hasElectionResults2018("south-i"), true);
  assert.equal(hasElectionResults2018("north-iii"), true);
  assert.equal(hasElectionResults2018("mount-lebanon-i"), true);
  assert.equal(hasElectionResults2018("mount-lebanon-ii"), true);
  assert.equal(hasElectionResults2018("mount-lebanon-iii"), true);
  assert.equal(hasElectionResults2018("mount-lebanon-iv"), true);
  assert.equal(hasElectionResults2018("beirut-i"), true);
  assert.equal(hasElectionResults2018("beirut-ii"), true);
  assert.equal(hasElectionResults2018("bekaa-i"), true);
  assert.equal(hasElectionResults2018("bekaa-ii"), true);
  assert.equal(hasElectionResults2018("bekaa-iii"), true);
  assert.equal(hasElectionResults2018("north-i"), true);
  assert.equal(hasElectionResults2018("north-ii"), true);
  assert.equal(hasElectionResults2018("south-iii"), true);
});

test("2018 baselines load only for manually audited districts", async () => {
  const byId = new Map(rawTemplates.map((template) => [template.id, template]));

  for (const templateId of VERIFIED_2018_TEMPLATE_IDS) {
    assert.equal(hasElectionResults2018(templateId), true, `${templateId} should be exposed`);
    const loaded = loadElectionResults2018(byId.get(templateId));
    assert.ok(loaded, `${templateId} should load`);
    assert.ok(loaded.candidates.length > 0, `${templateId} should include candidates`);
    assert.equal(typeof loaded.blankVotes, "number", `${templateId} should include blank votes`);
    assert.equal(typeof loaded.invalidVotes, "number", `${templateId} should include invalid votes`);
  }

  for (const template of rawTemplates) {
    if (VERIFIED_2018_TEMPLATE_IDS.includes(template.id)) {
      continue;
    }

    assert.equal(hasElectionResults2018(template.id), false, `${template.id} should stay disabled`);
    assert.equal(loadElectionResults2018(byId.get(template.id)), null, `${template.id} should not load`);
  }
});

test("2018 baselines can preload official list-only votes from the report", () => {
  const byId = new Map(rawTemplates.map((template) => [template.id, template]));

  const beirutOne = loadElectionResults2018(byId.get("beirut-i"));
  assert.ok(beirutOne);
  assert.deepEqual(
    beirutOne.listVotes,
    [
      { list: "We are Beirut", votes: 25 },
      { list: "Loyalty to Beirut", votes: 11 },
      { list: "Beirut One", votes: 348 },
      { list: "Strong Beirut One", votes: 323 },
      { list: "Kulluna Watani", votes: 144 }
    ]
  );

  const zahle = loadElectionResults2018(byId.get("bekaa-i"));
  assert.ok(zahle);
  assert.deepEqual(
    zahle.listVotes,
    [
      { list: "Zahle for Everyone", votes: 935 },
      { list: "Zahle Choice & Decision", votes: 668 },
      { list: "Zahle Our Cause", votes: 397 },
      { list: "Popular Bloc", votes: 322 },
      { list: "Kulluna Watani", votes: 121 }
    ]
  );
  assert.equal(zahle.blankVotes, 545);
  assert.equal(zahle.invalidVotes, 2414);

  const mountLebanonOne = loadElectionResults2018(byId.get("mount-lebanon-i"));
  assert.ok(mountLebanonOne);
  assert.deepEqual(mountLebanonOne.listVotes, [{ list: "Definite Change", votes: 404 }]);
  assert.equal(
    mountLebanonOne.candidates
      .filter((candidate) => candidate.list === "Definite Change")
      .reduce((sum, candidate) => sum + candidate.votes, 0) +
      mountLebanonOne.listVotes
        .filter((entry) => entry.list === "Definite Change")
        .reduce((sum, entry) => sum + entry.votes, 0),
    26980
  );

  const mountLebanonTwo = loadElectionResults2018(byId.get("mount-lebanon-ii"));
  assert.ok(mountLebanonTwo);
  assert.equal(
    mountLebanonTwo.candidates
      .filter((candidate) => candidate.list === "Kulluna Watani")
      .reduce((sum, candidate) => sum + candidate.votes, 0) +
      mountLebanonTwo.listVotes
        .filter((entry) => entry.list === "Kulluna Watani")
        .reduce((sum, entry) => sum + entry.votes, 0),
    5027
  );

  const mountLebanonThree = loadElectionResults2018(byId.get("mount-lebanon-iii"));
  assert.ok(mountLebanonThree);
  assert.equal(
    mountLebanonThree.candidates.find((candidate) => candidate.name === "Cynthia Ahmad Riad El Asmar")?.votes,
    200
  );
  assert.equal(
    mountLebanonThree.candidates
      .filter((candidate) => candidate.list === "Baabda Unity & Development")
      .reduce((sum, candidate) => sum + candidate.votes, 0) +
      mountLebanonThree.listVotes
        .filter((entry) => entry.list === "Baabda Unity & Development")
        .reduce((sum, entry) => sum + entry.votes, 0),
    26500
  );

  const mountLebanonFour = loadElectionResults2018(byId.get("mount-lebanon-iv"));
  assert.ok(mountLebanonFour);
  assert.equal(
    mountLebanonFour.candidates
      .filter((candidate) => candidate.list === "National Unity")
      .reduce((sum, candidate) => sum + candidate.votes, 0) +
      mountLebanonFour.listVotes
        .filter((entry) => entry.list === "National Unity")
        .reduce((sum, entry) => sum + entry.votes, 0),
    12796
  );
  assert.equal(
    mountLebanonFour.candidates
      .filter((candidate) => candidate.list === "Free Decision")
      .reduce((sum, candidate) => sum + candidate.votes, 0) +
      mountLebanonFour.listVotes
        .filter((entry) => entry.list === "Free Decision")
        .reduce((sum, entry) => sum + entry.votes, 0),
    5446
  );

  const northOne = loadElectionResults2018(byId.get("north-i"));
  assert.ok(northOne);
  assert.equal(
    northOne.candidates.filter((candidate) => candidate.list === "Strong Akkar").length,
    7
  );
  assert.equal(
    northOne.candidates
      .filter((candidate) => candidate.list === "Strong Akkar")
      .reduce((sum, candidate) => sum + candidate.votes, 0) +
      northOne.listVotes
        .filter((entry) => entry.list === "Strong Akkar")
        .reduce((sum, entry) => sum + entry.votes, 0),
    34430
  );
  assert.equal(
    northOne.candidates.filter((candidate) => candidate.list === "Women of Akkar").length,
    5
  );
  assert.equal(
    northOne.candidates.find((candidate) => candidate.name === "Marie Salem Salem El Khoury")?.votes,
    110
  );
  assert.equal(
    northOne.candidates
      .filter((candidate) => candidate.list === "Women of Akkar")
      .reduce((sum, candidate) => sum + candidate.votes, 0),
    498
  );
  assert.equal(
    northOne.candidates
      .filter((candidate) => candidate.list === "Lebanon Sovereignty")
      .reduce((sum, candidate) => sum + candidate.votes, 0) +
      northOne.listVotes
        .filter((entry) => entry.list === "Lebanon Sovereignty")
        .reduce((sum, entry) => sum + entry.votes, 0),
    4713
  );

  const beirutTwo = loadElectionResults2018(byId.get("beirut-ii"));
  assert.ok(beirutTwo);
  assert.deepEqual(
    beirutTwo.listVotes,
    [
      { list: "Future for Beirut", votes: 2028 },
      { list: "Beirut's Unity", votes: 2621 },
      { list: "Lebanon is Worthy", votes: 832 },
      { list: "Beirut The Homeland", votes: 151 },
      { list: "Kulluna Beirut", votes: 205 },
      { list: "People's Voice", votes: 66 },
      { list: "Dignity of Beirut", votes: 50 },
      { list: "Beirutis Opposition", votes: 33 },
      { list: "Independent Beirutis", votes: 29 }
    ]
  );

  const northTwo = loadElectionResults2018(byId.get("north-ii"));
  assert.ok(northTwo);
  assert.deepEqual(
    northTwo.listVotes,
    [
      { list: "The Future is for the North", votes: 1923 },
      { list: "National Dignity", votes: 911 },
      { list: "Determination", votes: 2433 },
      { list: "A Sovereign Lebanon", votes: 831 },
      { list: "Independent Decision", votes: 384 },
      { list: "People's Decision", votes: 364 },
      { list: "Kulluna Watani", votes: 191 },
      { list: "Independent Civil Society", votes: 48 }
    ]
  );

  const southOne = loadElectionResults2018(byId.get("south-i"));
  assert.ok(southOne);
  assert.deepEqual(
    southOne.listVotes,
    [
      { list: "For Everyone", votes: 473 },
      { list: "Saida & Jezzine Together", votes: 420 },
      { list: "Power of Change", votes: 174 },
      { list: "Integrity and Dignity", votes: 588 }
    ]
  );
});

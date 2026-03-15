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

  const zahle = loadElectionResults2018(byId.get("bekaa-i"));
  assert.ok(zahle);
  assert.deepEqual(zahle.listVotes, []);

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
      { list: "A Sovereign Lebanon", votes: 468 },
      { list: "People's Decision", votes: 426 }
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

import test from "node:test";
import assert from "node:assert/strict";

import rawTemplates from "../src/data/templates.json" with { type: "json" };
import {
  getElectionResults2018TemplateIds,
  hasElectionResults2018,
  loadElectionResults2018
} from "../src/data/election-results-2018.js";

const VERIFIED_2018_TEMPLATE_IDS = ["beirut-i", "bekaa-i", "bekaa-ii", "bekaa-iii", "mount-lebanon-i", "mount-lebanon-ii", "mount-lebanon-iii", "north-i", "north-ii", "north-iii", "south-i", "south-ii"];

test("2018 baselines are exposed only for verified districts", () => {
  assert.deepEqual(getElectionResults2018TemplateIds(), VERIFIED_2018_TEMPLATE_IDS);

  assert.equal(hasElectionResults2018("south-ii"), true);
  assert.equal(hasElectionResults2018("south-i"), true);
  assert.equal(hasElectionResults2018("north-iii"), true);
  assert.equal(hasElectionResults2018("mount-lebanon-i"), true);
  assert.equal(hasElectionResults2018("mount-lebanon-ii"), true);
  assert.equal(hasElectionResults2018("mount-lebanon-iii"), true);
  assert.equal(hasElectionResults2018("beirut-i"), true);
  assert.equal(hasElectionResults2018("bekaa-i"), true);
  assert.equal(hasElectionResults2018("bekaa-ii"), true);
  assert.equal(hasElectionResults2018("bekaa-iii"), true);
  assert.equal(hasElectionResults2018("north-i"), true);
  assert.equal(hasElectionResults2018("north-ii"), true);
  assert.equal(hasElectionResults2018("beirut-ii"), false);
  assert.equal(hasElectionResults2018("mount-lebanon-iv"), false);
  assert.equal(hasElectionResults2018("south-iii"), false);
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

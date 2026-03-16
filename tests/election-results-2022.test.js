import test from "node:test";
import assert from "node:assert/strict";

import rawTemplates from "../src/data/templates.json" with { type: "json" };
import { hasElectionResults2022, loadElectionResults2022 } from "../src/data/election-results-2022.js";

test("2022 baselines keep list-only vote support available even when a district has no preset values yet", () => {
  assert.equal(hasElectionResults2022("beirut-i"), true);

  const byId = new Map(rawTemplates.map((template) => [template.id, template]));
  const loaded = loadElectionResults2022(byId.get("beirut-i"));

  assert.ok(loaded);
  assert.ok(Array.isArray(loaded.listVotes));
});

test("2022 audited districts preload official list-only votes from the report totals", () => {
  const byId = new Map(rawTemplates.map((template) => [template.id, template]));

  const beirutOne = loadElectionResults2022(byId.get("beirut-i"));
  assert.equal(
    beirutOne.candidates
      .filter((candidate) => candidate.list === "قادرين")
      .reduce((sum, candidate) => sum + candidate.votes, 0),
    1510
  );
  assert.deepEqual(
    beirutOne.listVotes,
    [
      { list: "لبنان السيادة", votes: 409 },
      { list: "كنا ورح نبقى لبيروت", votes: 255 },
      { list: "بيروت، نحن لها", votes: 275 },
      { list: "لوطني", votes: 259 },
      { list: "بيروت مدينتي", votes: 58 }
    ]
  );

  const beirutTwo = loadElectionResults2022(byId.get("beirut-ii"));
  assert.deepEqual(
    beirutTwo.listVotes,
    [
      { list: "بيروت بدها قلب", votes: 1641 },
      { list: "هيدي بيروت", votes: 649 },
      { list: "بيروت تواجه", votes: 621 },
      { list: "وحدة بيروت", votes: 796 },
      { list: "لبيروت", votes: 305 },
      { list: "بيروت التغيير", votes: 908 },
      { list: "لتبقى بيروت", votes: 128 },
      { list: "قادرين", votes: 112 },
      { list: "نعم لبيروت", votes: 24 },
      { list: "بيروت مدينتي", votes: 59 }
    ]
  );

  const southTwo = loadElectionResults2022(byId.get("south-ii"));
  assert.deepEqual(
    southTwo.listVotes,
    [
      { list: "الأمل و الوفاء", votes: 4920 },
      { list: "الدولة الحاضنة", votes: 1459 },
      { list: "معاً للتغيير", votes: 1057 },
      { list: "القرار الحر", votes: 474 }
    ]
  );

  const southOne = loadElectionResults2022(byId.get("south-i"));
  assert.deepEqual(
    southOne.listVotes,
    [
      { list: "Moderation Is our Strength", votes: 475 },
      { list: "We Vote for Change", votes: 755 },
      { list: "Our Unity in Saida and Jezzine", votes: 405 },
      { list: "We Are The Change", votes: 219 },
      { list: "The Voice of Change", votes: 27 },
      { list: "Together for Saida and Jezzine", votes: 334 },
      { list: "Capable", votes: 98 }
    ]
  );
  assert.equal(new Set(southOne.candidates.map((candidate) => candidate.list)).size, 7);

  const southThree = loadElectionResults2022(byId.get("south-iii"));
  assert.deepEqual(
    southThree.listVotes,
    [
      { list: "الأمل و الوفاء", votes: 6329 },
      { list: "معاً نحو التغيير", votes: 2318 },
      { list: "صوت الجنوب", votes: 613 }
    ]
  );
});

test("2022 generated districts can also preload official list-only votes via overrides", () => {
  const byId = new Map(rawTemplates.map((template) => [template.id, template]));

  const bekaaOne = loadElectionResults2022(byId.get("bekaa-i"));
  assert.deepEqual(
    bekaaOne.listVotes,
    [
      { list: "ﺳﻴﺎدﻳﻮن ﻣﺴﺘﻘﻠﻮن", votes: 829 },
      { list: "زﺣﻠﺔ اﻟﺴﻴﺎدة", votes: 606 },
      { list: "زﺣﻠﺔ ﺗﻨﺘﻔﺾ", votes: 185 },
      { list: "اﻟﻘﻮل واﻟﻔﻌﻞ", votes: 26 },
      { list: "زﺣﻠﺔ اﻟﺮﺳﺎﻟﺔ", votes: 493 },
      { list: "اﻟﺘﻐﻴﻴﺮ", votes: 52 },
      { list: "ﻗﺎدرﻳﻦ ﻧﻮاﺟﻪ", votes: 92 },
      { list: "اﻟﻜﺘﻠﺔ اﻟﺸﻌﺒﻴﺔ", votes: 563 }
    ]
  );

  const bekaaTwo = loadElectionResults2022(byId.get("bekaa-ii"));
  assert.deepEqual(
    bekaaTwo.listVotes,
    [
      { list: "اﻟﻐﺪ اﻷﻓﻀﻞ", votes: 1070 },
      { list: "ﺑﻘﺎﻋﻨﺎ اوﻻً", votes: 181 },
      { list: "ﻻﺋﺤﺔ ﺳﻬﻠﻨﺎ و اﻟﺠﺒﻞ", votes: 402 },
      { list: "اﻟﻘﺮار اﻟﻮﻃﻨﻲ اﻟﻤﺴﺘﻘﻞ", votes: 472 },
      { list: "ﻧﺤﻮ اﻟﺘﻐﻴﻴﺮ", votes: 23 },
      { list: "ﻗﺎدرﻳﻦ", votes: 40 }
    ]
  );

  const metn = loadElectionResults2022(byId.get("mount-lebanon-ii"));
  assert.deepEqual(
    metn.listVotes,
    [
      { list: "ﻣﺘﻦ اﻟﺤﺮﻳّﺔ", votes: 449 },
      { list: "ﻣﻌﺎً اﻗﻮى", votes: 548 },
      { list: "ﻣﺘﻦ اﻟﺘﻐﻴﻴﺮ", votes: 764 },
      { list: "ﻧﺤﻮ اﻟﺪوﻟﺔ", votes: 269 },
      { list: "ﻛﻨﺎ ورح ﻧﺒﻘﻰ ﻟﻠﻤﺘﻦ", votes: 470 },
      { list: "ﻣﺘﻨﻴﻮن ﺳﻴﺎدﻳﻮن", votes: 55 }
    ]
  );
  assert.equal(
    metn.candidates
      .filter((candidate) => candidate.list === "ﻣﺘﻨﻴﻮن ﺳﻴﺎدﻳﻮن")
      .reduce((sum, candidate) => sum + candidate.votes, 0) +
      metn.listVotes
        .filter((entry) => entry.list === "ﻣﺘﻨﻴﻮن ﺳﻴﺎدﻳﻮن")
        .reduce((sum, entry) => sum + entry.votes, 0),
    667
  );

  const keserwanJbeil = loadElectionResults2022(byId.get("mount-lebanon-i"));
  assert.deepEqual(
    keserwanJbeil.listVotes,
    [
      { list: "ﻣﻌﻜﻢ ﻓﻴﻨﺎ ﻟﻶﺧﺮ", votes: 663 },
      { list: "ﻗﻠﺐ ﻟﺒﻨﺎن اﻟﻤﺴﺘﻘﻞ", votes: 577 },
      { list: "ﺻﺮﺧﺔ وﻃﻦ", votes: 1554 },
      { list: "اﻟﺤﺮﻳﺔ ﻗﺮار", votes: 354 },
      { list: "ﻧﺤﻨﺎ اﻟﺘﻐﻴﻴﺮ", votes: 281 },
      { list: "ﻗﺎدرﻳﻦ", votes: 263 },
      { list: "ﻛﻨﺎ ورح ﻧﺒﻘﻰ", votes: 657 }
    ]
  );

  const baalbackHermel = loadElectionResults2022(byId.get("bekaa-iii"));
  assert.deepEqual(
    baalbackHermel.listVotes,
    [
      { list: "ﻣﺴﺘﻘﻠﻮن ﺿﺪ اﻟﻔﺴﺎد", votes: 501 },
      { list: "اﻻﻣﻞ و اﻟﻮﻓﺎء", votes: 4649 },
      { list: "9", votes: 135 },
      { list: "ﻗﺎدرﻳﻦ", votes: 153 },
      { list: "ﺑﻨﺎء اﻟﺪوﻟﺔ", votes: 630 },
      { list: "اﺋﺘﻼف اﻟﺘﻐﻴﻴﺮ", votes: 300 }
    ]
  );

  const choufAley = loadElectionResults2022(byId.get("mount-lebanon-iv"));
  assert.deepEqual(
    choufAley.listVotes,
    [
      { list: "اﻟﺸﺮاﻛﺔ واﻻرادة", votes: 2365 },
      { list: "ﺻﻮﺗﻚ ﺛﻮرة", votes: 303 },
      { list: "ﻻﺋﺤﺔ اﻟﺠﺒﻞ", votes: 1049 },
      { list: "ﻗﺎدرﻳﻦ", votes: 210 },
      { list: "ﺗﻮﺣﺪﻧﺎ ﻟﻠﺘﻐﻴﻴﺮ", votes: 1484 },
      { list: "ﺳﻴﺎدة وﻃﻦ", votes: 88 },
      { list: "اﻟﺠﺒﻞ ﻳﻨﺘﻔﺾ", votes: 78 }
    ]
  );

  const akkar = loadElectionResults2022(byId.get("north-i"));
  assert.deepEqual(
    akkar.listVotes,
    [
      { list: "اﻟﻮﻓﺎء ﻟﻌﻜﺎﺭ", votes: 618 },
      { list: "ﻻﺋﺤﺔ اﻻﻋﺘﺪاﻝ اﻟﻮﻃﻨﻲ", votes: 957 },
      { list: "ﻧﺤﻮ اﻟﻤﻮاﻃﻨﺔ", votes: 441 },
      { list: "ﻋﻜﺎﺭ", votes: 109 },
      { list: "ﻋﻜﺎﺭ ﺗﻨﺘﻔﺾ", votes: 85 },
      { list: "ﻋﻜﺎﺭ اﻟﺘﻐﻴﻴﺮ", votes: 423 },
      { list: "اﻟﻨﻬﻮﺽ ﻟﻌﻜﺎﺭ", votes: 394 },
      { list: "ﻋﻜﺎﺭ اﻭﻻً", votes: 1155 }
    ]
  );
  assert.ok(akkar.candidates.some((candidate) => candidate.list === "ﻋﻜﺎﺭ ﺗﻨﺘﻔﺾ"));
});

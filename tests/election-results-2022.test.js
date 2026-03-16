import test from "node:test";
import assert from "node:assert/strict";

import rawTemplates from "../src/data/templates.json" with { type: "json" };
import { computeResults } from "../src/engine.js";
import { hasElectionResults2022, loadElectionResults2022 } from "../src/data/election-results-2022.js";

test("2022 baselines keep list-only vote support available even when a district has no preset values yet", () => {
  assert.equal(hasElectionResults2022("beirut-i"), true);

  const byId = new Map(rawTemplates.map((template) => [template.id, template]));
  const loaded = loadElectionResults2022(byId.get("beirut-i"));

  assert.ok(loaded);
  assert.ok(Array.isArray(loaded.listVotes));
  assert.equal(loaded.blankVotes, 395);
  assert.equal(loaded.invalidVotes, 1615);
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
  assert.deepEqual(southTwo.quotas, [
    { sect: "Shia", seats: 4, minorDistrict: "Tyre" },
    { sect: "Shia", seats: 2, minorDistrict: "Zahrani" },
    { sect: "Greek Catholic", seats: 1, minorDistrict: "Zahrani" }
  ]);
  assert.equal(
    southTwo.candidates.find((candidate) => candidate.name === "نبيه مصطفى بري")?.minorDistrict,
    "Zahrani"
  );
  assert.equal(
    southTwo.candidates.find((candidate) => candidate.name === "حسن محمد علي عز الدين")?.minorDistrict,
    "Tyre"
  );
  assert.equal(
    southTwo.candidates.find((candidate) => candidate.name === "ميشال حنا موسى")?.minorDistrict,
    "Zahrani"
  );

  const southThree = loadElectionResults2022(byId.get("south-iii"));
  assert.deepEqual(
    southThree.listVotes,
    [
      { list: "الأمل و الوفاء", votes: 6329 },
      { list: "معاً نحو التغيير", votes: 2318 },
      { list: "صوت الجنوب", votes: 613 }
    ]
  );
  assert.deepEqual(southThree.quotas, [
    { sect: "Shia", seats: 3, minorDistrict: "Nabatieh" },
    { sect: "Shia", seats: 3, minorDistrict: "Bint Jbeil" },
    { sect: "Shia", seats: 1, minorDistrict: "Marjeyoun" },
    { sect: "Shia", seats: 1, minorDistrict: "Hasbaya" },
    { sect: "Sunni", seats: 1, minorDistrict: "Hasbaya" },
    { sect: "Druze", seats: 1, minorDistrict: "Hasbaya" },
    { sect: "Greek Orthodox", seats: 1, minorDistrict: "Marjeyoun" }
  ]);
  assert.equal(
    southThree.candidates.find((candidate) => candidate.name === "محمد حسن رعد")?.minorDistrict,
    "Nabatieh"
  );
  assert.equal(
    southThree.candidates.find((candidate) => candidate.name === "حسن نظام الدين فضل الله")?.minorDistrict,
    "Bint Jbeil"
  );
  assert.equal(
    southThree.candidates.find((candidate) => candidate.name === "الياس فارس جراده")?.minorDistrict,
    "Marjeyoun"
  );
  assert.equal(
    southThree.candidates.find((candidate) => candidate.name === "فراس اسماعيل حمدان")?.minorDistrict,
    "Hasbaya"
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
  assert.deepEqual(southOne.quotas, [
    { sect: "Sunni", seats: 2, minorDistrict: "Saida" },
    { sect: "Maronite", seats: 2, minorDistrict: "Jezzine" },
    { sect: "Greek Catholic", seats: 1, minorDistrict: "Jezzine" }
  ]);
  assert.equal(
    southOne.candidates.find((candidate) => candidate.name === "Abdel Rahman Nazih El Bizri")?.minorDistrict,
    "Saida"
  );
  assert.equal(
    southOne.candidates.find((candidate) => candidate.name === "Ibrahim Samir Azar")?.minorDistrict,
    "Jezzine"
  );
  assert.equal(
    southOne.candidates.find((candidate) => candidate.name === "Ghada Khalil Ayoub")?.minorDistrict,
    "Jezzine"
  );
  assert.equal(new Set(southOne.candidates.map((candidate) => candidate.list)).size, 7);

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
  assert.deepEqual(
    bekaaTwo.candidates
      .filter((candidate) => candidate.list === "اﻟﻐﺪ اﻷﻓﻀﻞ")
      .map((candidate) => ({ name: candidate.name, votes: candidate.votes })),
    [
      { name: "ﻣﺮادﺣﺴﻦ ﻋﺒﺪ اﻟﺮﺣﻴﻢ", votes: 9157 },
      { name: "ﻗﺒﻼن ﻋﺒﺪ اﻟﻤﻨﻌﻢ ﻗﺒﻼن", votes: 10143 },
      { name: "اﻳﻠﻲ ﻧﺠﻴﺐ ﻓﺮزﻟﻲ", votes: 2304 },
      { name: "ﻃﺎرق ﺳﻠﻴﻢ داود", votes: 2670 },
      { name: "ﺷﺮﺑﻞ ﻛﻤﻴﻞ ﻣﺎرون", votes: 3576 }
    ]
  );
  assert.equal(
    bekaaTwo.candidates
      .filter((candidate) => candidate.list === "اﻟﻐﺪ اﻷﻓﻀﻞ")
      .reduce((sum, candidate) => sum + candidate.votes, 0) +
      bekaaTwo.listVotes
        .filter((entry) => entry.list === "اﻟﻐﺪ اﻷﻓﻀﻞ")
        .reduce((sum, entry) => sum + entry.votes, 0),
    28920
  );
  assert.equal(
    bekaaTwo.candidates
      .filter((candidate) => candidate.list === "اﻟﻘﺮار اﻟﻮﻃﻨﻲ اﻟﻤﺴﺘﻘﻞ")
      .reduce((sum, candidate) => sum + candidate.votes, 0) +
      bekaaTwo.listVotes
        .filter((entry) => entry.list === "اﻟﻘﺮار اﻟﻮﻃﻨﻲ اﻟﻤﺴﺘﻘﻞ")
        .reduce((sum, entry) => sum + entry.votes, 0),
    19054
  );
  assert.equal(
    bekaaTwo.candidates
      .filter((candidate) => candidate.list === "ﻻﺋﺤﺔ ﺳﻬﻠﻨﺎ و اﻟﺠﺒﻞ")
      .reduce((sum, candidate) => sum + candidate.votes, 0) +
      bekaaTwo.listVotes
        .filter((entry) => entry.list === "ﻻﺋﺤﺔ ﺳﻬﻠﻨﺎ و اﻟﺠﺒﻞ")
        .reduce((sum, entry) => sum + entry.votes, 0),
    11397
  );
  assert.deepEqual(bekaaTwo.quotas, [
    { sect: "Sunni", seats: 2, minorDistrict: "West Bekaa" },
    { sect: "Shia", seats: 1, minorDistrict: "West Bekaa" },
    { sect: "Greek Orthodox", seats: 1, minorDistrict: "West Bekaa" },
    { sect: "Druze", seats: 1, minorDistrict: "Rashaya" },
    { sect: "Maronite", seats: 1, minorDistrict: "Rashaya" }
  ]);
  assert.equal(
    bekaaTwo.candidates.find((candidate) => candidate.name === "واﺋﻞ وﻫﺒﻲ اﺑﻮ ﻓﺎﻋﻮر")?.minorDistrict,
    "Rashaya"
  );
  assert.equal(
    bekaaTwo.candidates.find((candidate) => candidate.name === "ﻣﺮادﺣﺴﻦ ﻋﺒﺪ اﻟﺮﺣﻴﻢ")?.minorDistrict,
    "West Bekaa"
  );
  assert.equal(
    bekaaTwo.candidates.find((candidate) => candidate.name === "ﺷﺮﺑﻞ ﻛﻤﻴﻞ ﻣﺎرون")?.minorDistrict,
    "Rashaya"
  );

  const northTwo = loadElectionResults2022(byId.get("north-ii"));
  assert.deepEqual(
    northTwo.listVotes,
    [
      { list: "اﻻرادة اﻟﺸﻌﺒﻴﺔ", votes: 1493 },
      { list: "اﻟﺠﻤﻬﻮرﻳﺔ اﻟﺜﺎﻟﺜﺔ", votes: 453 },
      { list: "ﻃﻤﻮح اﻟﺸﺒﺎب", votes: 40 },
      { list: "إﻧﻘﺎذ وﻃﻦ", votes: 1482 },
      { list: "ﻟﻠﻨﺎس", votes: 690 },
      { list: "ﻟﺒﻨﺎن ﻟﻨﺎ", votes: 716 },
      { list: "ﻟﻠﺴﻴﺎدة ﻟﻠﻌﺪاﻟﺔ.. اﻧﺘﻔﺾ", votes: 701 },
      { list: "اﻟﺘﻐﻴﻴﺮ اﻟﺤﻘﻴﻘﻲ", votes: 536 },
      { list: "ﻓﺠﺮ اﻟﺘﻐﻴﻴﺮ", votes: 66 },
      { list: "اﻹﺳﺘﻘﺮار واﻹﻧﻤﺎء", votes: 55 },
      { list: "ﻗﺎدرﻳﻦ", votes: 191 }
    ]
  );
  assert.deepEqual(northTwo.quotas, [
    { sect: "Sunni", seats: 5, minorDistrict: "Tripoli" },
    { sect: "Sunni", seats: 2, minorDistrict: "Dinnieh" },
    { sect: "Sunni", seats: 1, minorDistrict: "Minnieh" },
    { sect: "Alawite", seats: 1, minorDistrict: "Tripoli" },
    { sect: "Maronite", seats: 1, minorDistrict: "Tripoli" },
    { sect: "Greek Orthodox", seats: 1, minorDistrict: "Tripoli" }
  ]);
  assert.equal(
    northTwo.candidates.find((candidate) => candidate.name === "اﺷﺮف اﺣﻤﺪ رﻳﻔﻲ")?.minorDistrict,
    "Tripoli"
  );
  assert.equal(
    northTwo.candidates.find((candidate) => candidate.name === "اﻟﺼﻤﺪﺟﻬﺎد ﻣﺮﺷﺪ")?.minorDistrict,
    "Dinnieh"
  );
  assert.equal(
    northTwo.candidates.find((candidate) => candidate.name === "اﺣﻤﺪ ﻣﺤﻤﻮد اﻟﺨﻴﺮ")?.minorDistrict,
    "Minnieh"
  );
  assert.equal(
    northTwo.candidates.find((candidate) => candidate.name === "رﻓﻠﻲ اﻧﻄﻮن دﻳﺎب")?.minorDistrict,
    "Tripoli"
  );

  const northThree = loadElectionResults2022(byId.get("north-iii"));
  assert.deepEqual(
    northThree.listVotes,
    [
      { list: "ﺷﻤﺎل اﻟﻤﻮاﺟﻬﺔ", votes: 605 },
      { list: "رح ﻧﺒﻘﻰ ﻫﻮن", votes: 574 },
      { list: "ﺷﻤﺎﻟﻨﺎ", votes: 1068 },
      { list: "ﻧﺒﺾ اﻟﺠﻤﻬﻮرﻳﺔ اﻟﻘﻮﻳﺔ", votes: 838 },
      { list: "ﻗﺎدرﻳﻦ ﻧﻐﻴّﺮ", votes: 98 },
      { list: "وﻋﻲ ﺻﻮﺗﻚ", votes: 73 },
      { list: "ﻻﺋﺤﺔ وﺣﺪة اﻟﺸﻤﺎل", votes: 679 }
    ]
  );
  assert.deepEqual(northThree.quotas, [
    { sect: "Maronite", seats: 2, minorDistrict: "Batroun" },
    { sect: "Maronite", seats: 2, minorDistrict: "Bcharre" },
    { sect: "Maronite", seats: 3, minorDistrict: "Zgharta" },
    { sect: "Greek Orthodox", seats: 3, minorDistrict: "Koura" }
  ]);
  assert.equal(
    northThree.candidates.find((candidate) => candidate.name === "ﻏﻴﺎث ﻣﻴﺸﺎل ﻣﻴﺸﺎل ﻳﺰﺑﻚ")?.minorDistrict,
    "Batroun"
  );
  assert.equal(
    northThree.candidates.find((candidate) => candidate.name === "ﺳﺘﺮﻳﺪا اﻟﻴﺎس ﻃﻮق")?.minorDistrict,
    "Bcharre"
  );
  assert.equal(
    northThree.candidates.find((candidate) => candidate.name === "ﻃﻮﻧﻲ ﺳﻠﻴﻤﺎن ﻓﺮﻧﺠﻴﻪ")?.minorDistrict,
    "Zgharta"
  );
  assert.equal(
    northThree.candidates.find((candidate) => candidate.name === "ﻓﺎدي ﻣﻴﺸﺎل ﻏﺼﻦ")?.minorDistrict,
    "Koura"
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
  assert.deepEqual(keserwanJbeil.quotas, [
    { sect: "Maronite", seats: 5, minorDistrict: "Keserwan" },
    { sect: "Maronite", seats: 2, minorDistrict: "Jbeil" },
    { sect: "Shia", seats: 1, minorDistrict: "Jbeil" }
  ]);
  assert.equal(
    keserwanJbeil.candidates.find((candidate) => candidate.name === "زﻳﺎد ﺣﻠﻴﻢ اﻟﺤﻮاط")?.minorDistrict,
    "Jbeil"
  );
  assert.equal(
    keserwanJbeil.candidates.find((candidate) => candidate.name === "ﺷﻮﻗﻲ ﺟﺮﺟﻲ اﻟﺪﻛﺎش")?.minorDistrict,
    "Keserwan"
  );
  assert.equal(
    keserwanJbeil.candidates.find((candidate) => candidate.name === "راﺋﺪ ﻋﻜﻴﻒ ﺑﺮّو")?.minorDistrict,
    "Jbeil"
  );
  assert.equal(
    keserwanJbeil.candidates.find((candidate) => candidate.name === "ﻧﺪى ﻧﻬﺎد اﻟﺒﺴﺘﺎﻧﻲ")?.minorDistrict,
    "Keserwan"
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
  assert.deepEqual(choufAley.quotas, [
    { sect: "Druze", seats: 2, minorDistrict: "Aley" },
    { sect: "Druze", seats: 2, minorDistrict: "Chouf" },
    { sect: "Maronite", seats: 2, minorDistrict: "Aley" },
    { sect: "Maronite", seats: 3, minorDistrict: "Chouf" },
    { sect: "Sunni", seats: 2, minorDistrict: "Chouf" },
    { sect: "Greek Orthodox", seats: 1, minorDistrict: "Aley" },
    { sect: "Greek Catholic", seats: 1, minorDistrict: "Chouf" }
  ]);
  assert.equal(
    choufAley.candidates.find((candidate) => candidate.name === "ﺗﻴﻤﻮر وﻟﻴﺪ ﺟﻨﺒﻼط")?.minorDistrict,
    "Chouf"
  );
  assert.equal(
    choufAley.candidates.find((candidate) => candidate.name === "اﻛﺮم ﺣﺴﻴﻦ ﺷﻬﻴﺐ")?.minorDistrict,
    "Aley"
  );
  assert.equal(
    choufAley.candidates.find((candidate) => candidate.name === "ﻧﺠﺎة ﺧﻄﺎر ﻋﻮن")?.minorDistrict,
    "Chouf"
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

test("2022 South II simulation matches the published winner set", () => {
  const byId = new Map(rawTemplates.map((template) => [template.id, template]));
  const southTwo = loadElectionResults2022(byId.get("south-ii"));
  const result = computeResults(
    southTwo.quotas,
    southTwo.candidates,
    southTwo.listVotes,
    southTwo.blankVotes,
    southTwo.invalidVotes
  );

  assert.deepEqual(result.winners.map((winner) => winner.name), [
    "حسن محمد علي عز الدين",
    "حسين سعيد جشي",
    "علي يوسف خريس",
    "عنايه محمد عز الدين",
    "نبيه مصطفى بري",
    "علي عادل عسيران",
    "ميشال حنا موسى"
  ]);
});

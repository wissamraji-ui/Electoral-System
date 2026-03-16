import { cloneTemplate } from "./templates.js";
import {
  normalizeElectionBaseline,
  normalizeElectionBaselineListVotes
} from "./election-results-normalize.js";
import generatedElectionResults2022ByTemplateId from "./election-results-2022.generated.json" with { type: "json" };
import { getBlankVotes, getInvalidVotes } from "./election-misc-votes.js";

function hashVersionPayload(value) {
  const json = JSON.stringify(value);
  let hash = 2166136261;

  for (let index = 0; index < json.length; index += 1) {
    hash ^= json.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return `v${(hash >>> 0).toString(16)}`;
}

// Hand-cleaned overrides for districts already reviewed from the official 2022 PDFs.
// Remaining districts are loaded from generated official extracts in
// election-results-2022.generated.json.
const manualElectionResults2022ByTemplateId = {
  // Verified against official 2022 Ministry of Interior / elections.gov.lb district result PDFs.
  // Beirut I source:
  // https://www.elections.gov.lb/النيابية/2022/نتايج-الانتخابات/مجموع-اصوات-المرشحين-بحسب-الدوائر-لعام-2022/دائرة-بيروت-الأولى.aspx
  "beirut-i": {
    candidates: [
      { name: "نديم الجميل", sect: "Maronite", list: "لبنان السيادة", votes: 4425 },
      { name: "اسماء اندراوس", sect: "Greek Orthodox", list: "لبنان السيادة", votes: 917 },
      { name: "نجيب ليان", sect: "Greek Catholic", list: "لبنان السيادة", votes: 391 },
      { name: "انطوان سرياني", sect: "Minorities", list: "لبنان السيادة", votes: 558 },
      { name: "آني سفريان", sect: "Armenian Orthodox", list: "لبنان السيادة", votes: 277 },
      { name: "تالار ماركوسيان", sect: "Armenian Orthodox", list: "لبنان السيادة", votes: 43 },
      { name: "ليون سمرجيان", sect: "Armenian Orthodox", list: "لبنان السيادة", votes: 208 },
      { name: "جان طالوزيان", sect: "Armenian Catholic", list: "لبنان السيادة", votes: 4043 },

      { name: "نقولا صحناوي", sect: "Greek Catholic", list: "كنا ورح نبقى لبيروت", votes: 4781 },
      { name: "الكسندر ماتوسيان", sect: "Armenian Orthodox", list: "كنا ورح نبقى لبيروت", votes: 2216 },
      { name: "هاغوب ترزيان", sect: "Armenian Orthodox", list: "كنا ورح نبقى لبيروت", votes: 2647 },
      { name: "جورج جوفلكيان", sect: "Armenian Orthodox", list: "كنا ورح نبقى لبيروت", votes: 286 },
      { name: "سركيس ملكونيان", sect: "Armenian Catholic", list: "كنا ورح نبقى لبيروت", votes: 95 },
      { name: "كارلا بطرس", sect: "Greek Orthodox", list: "كنا ورح نبقى لبيروت", votes: 137 },
      { name: "ايلي الاسود", sect: "Maronite", list: "كنا ورح نبقى لبيروت", votes: 303 },
      { name: "شمعون شمعون", sect: "Minorities", list: "كنا ورح نبقى لبيروت", votes: 230 },

      { name: "غسان حاصباني", sect: "Greek Orthodox", list: "بيروت، نحن لها", votes: 7080 },
      { name: "جهاد باقرادونيان", sect: "Armenian Orthodox", list: "بيروت، نحن لها", votes: 2186 },
      { name: "جورج شاهين", sect: "Maronite", list: "بيروت، نحن لها", votes: 1684 },
      { name: "فادي نحاس", sect: "Greek Catholic", list: "بيروت، نحن لها", votes: 200 },
      { name: "ايلي شربشي", sect: "Minorities", list: "بيروت، نحن لها", votes: 727 },
      { name: "آرام ماليان", sect: "Armenian Orthodox", list: "بيروت، نحن لها", votes: 1068 },

      { name: "بولا يعقوبيان", sect: "Armenian Orthodox", list: "لوطني", votes: 3524 },
      { name: "زياد عبس", sect: "Greek Orthodox", list: "لوطني", votes: 514 },
      { name: "زياد أبي شاكر", sect: "Maronite", list: "لوطني", votes: 3142 },
      { name: "سينتيا زرازير", sect: "Minorities", list: "لوطني", votes: 486 },
      { name: "ماغي نانجيان", sect: "Armenian Orthodox", list: "لوطني", votes: 80 },
      { name: "ديانا اوهانيان", sect: "Armenian Orthodox", list: "لوطني", votes: 63 },
      { name: "شارل فاخوري", sect: "Greek Catholic", list: "لوطني", votes: 64 },
      { name: "بريجيت شلبيان", sect: "Armenian Catholic", list: "لوطني", votes: 129 },

      { name: "موسى خوري", sect: "Maronite", list: "قادرين", votes: 91 },
      { name: "مارلين غريّب الدين", sect: "Greek Orthodox", list: "قادرين", votes: 56 },
      { name: "شربل نحاس", sect: "Greek Catholic", list: "قادرين", votes: 1265 },
      { name: "روي ابراهيم", sect: "Minorities", list: "قادرين", votes: 98 },

      { name: "جاك جندو", sect: "Minorities", list: "بيروت مدينتي", votes: 226 },
      { name: "بيار الجميّل", sect: "Maronite", list: "بيروت مدينتي", votes: 160 },
      { name: "طارق عمّار", sect: "Greek Orthodox", list: "بيروت مدينتي", votes: 158 },
      { name: "ندى صحناوي", sect: "Greek Catholic", list: "بيروت مدينتي", votes: 362 },
      { name: "ليفون تلويزيان", sect: "Armenian Orthodox", list: "بيروت مدينتي", votes: 125 }
    ],
    listVotes: [
      { list: "لبنان السيادة", votes: 409 },
      { list: "كنا ورح نبقى لبيروت", votes: 255 },
      { list: "بيروت، نحن لها", votes: 275 },
      { list: "لوطني", votes: 259 },
      { list: "بيروت مدينتي", votes: 58 }
    ]
  },

  // Beirut II source:
  // https://elections.gov.lb/api/ContentRecord/public/detail/400?languageId=2
  // Attachment: https://elections.gov.lb/api/Media/6B44899B-AAD2-40BE-9168-5C3FEE6CFA45.pdf
  "beirut-ii": {
    candidates: [
      { name: "فؤاد مصطفى مخزومي", sect: "Sunni", list: "بيروت بدها قلب", votes: 10021 },
      { name: "حسن عفيف كشلي", sect: "Sunni", list: "بيروت بدها قلب", votes: 885 },
      { name: "كريم فؤاد شبقلو", sect: "Sunni", list: "بيروت بدها قلب", votes: 470 },
      { name: "عبد اللطيف رياض عيتاني", sect: "Sunni", list: "بيروت بدها قلب", votes: 1531 },
      { name: "مازن فايز شبارو", sect: "Sunni", list: "بيروت بدها قلب", votes: 766 },
      { name: "نبيل احمد بسام نجا", sect: "Sunni", list: "بيروت بدها قلب", votes: 526 },
      { name: "الفت حمزه السبع", sect: "Shia", list: "بيروت بدها قلب", votes: 181 },
      { name: "لينا محمد علي حمدان", sect: "Shia", list: "بيروت بدها قلب", votes: 227 },
      { name: "زينه كمال منذر", sect: "Druze", list: "بيروت بدها قلب", votes: 308 },
      { name: "زينه نبيه مجدلاني", sect: "Greek Orthodox", list: "بيروت بدها قلب", votes: 1462 },
      { name: "عمر منح الدبغي", sect: "Evangelical", list: "بيروت بدها قلب", votes: 1403 },

      { name: "محمد نبيل عثمان بدر", sect: "Sunni", list: "هيدي بيروت", votes: 5631 },
      { name: "عماد مدحت الحوت", sect: "Sunni", list: "هيدي بيروت", votes: 7362 },
      { name: "محمود محي الدين الجمل", sect: "Sunni", list: "هيدي بيروت", votes: 3502 },
      { name: "يسرى عبد الحفيظ التنير", sect: "Sunni", list: "هيدي بيروت", votes: 600 },
      { name: "خليل اميل برمانه", sect: "Greek Orthodox", list: "هيدي بيروت", votes: 636 },
      { name: "هاروتيون صموئيل كوك كوزيان", sect: "Evangelical", list: "هيدي بيروت", votes: 206 },
      { name: "حيدر حسن بزي", sect: "Shia", list: "هيدي بيروت", votes: 422 },
      { name: "مروان رفيق سلام", sect: "Sunni", list: "هيدي بيروت", votes: 680 },
      { name: "هدا ذو الفقار عاصي", sect: "Shia", list: "هيدي بيروت", votes: 115 },
      { name: "نبيل عبد الحفيظ عيتاني", sect: "Sunni", list: "هيدي بيروت", votes: 544 },
      { name: "وسام رمزي ابو فخر", sect: "Druze", list: "هيدي بيروت", votes: 92 },

      { name: "خالد محي الدين قباني", sect: "Sunni", list: "بيروت تواجه", votes: 3433 },
      { name: "بشير محمود عيتاني", sect: "Sunni", list: "بيروت تواجه", votes: 1692 },
      { name: "ماجد موفق دمشقيه", sect: "Sunni", list: "بيروت تواجه", votes: 977 },
      { name: "زينه ابراهيم المصري", sect: "Sunni", list: "بيروت تواجه", votes: 1500 },
      { name: "لينا عمر التنير", sect: "Sunni", list: "بيروت تواجه", votes: 2273 },
      { name: "عبد الرحمن يحيى المبشر", sect: "Sunni", list: "بيروت تواجه", votes: 1355 },
      { name: "احمد ابراهيم عياش", sect: "Shia", list: "بيروت تواجه", votes: 241 },
      { name: "فيصل عفيف الصايغ", sect: "Druze", list: "بيروت تواجه", votes: 2565 },
      { name: "ميشال ديب فلاح", sect: "Greek Orthodox", list: "بيروت تواجه", votes: 2950 },
      { name: "جورج فؤاد حداد", sect: "Evangelical", list: "بيروت تواجه", votes: 453 },

      { name: "مها خليل شاتيلا", sect: "Sunni", list: "وحدة بيروت", votes: 248 },
      { name: "عبد الله غسان مطرجي", sect: "Sunni", list: "وحدة بيروت", votes: 375 },
      { name: "المعتصم بالله فوزي ادهم", sect: "Sunni", list: "وحدة بيروت", votes: 367 },
      { name: "امين محمد شري", sect: "Shia", list: "وحدة بيروت", votes: 26363 },
      { name: "محمد مصطفى خواجه", sect: "Shia", list: "وحدة بيروت", votes: 5789 },
      { name: "رمزي بيار معلوف", sect: "Greek Orthodox", list: "وحدة بيروت", votes: 745 },
      { name: "نسيب كميل الجوهري", sect: "Druze", list: "وحدة بيروت", votes: 226 },
      { name: "ادكار جوزف طرابلسي", sect: "Evangelical", list: "وحدة بيروت", votes: 2053 },

      { name: "عدنان خضر طرابلسي", sect: "Sunni", list: "لبيروت", votes: 8463 },
      { name: "احمد محمد دباغ", sect: "Sunni", list: "لبيروت", votes: 5837 },
      { name: "محمد نهاد محمد بدر الدين ارضرومللي", sect: "Sunni", list: "لبيروت", votes: 55 },
      { name: "خالد ابراهيم حنقير", sect: "Sunni", list: "لبيروت", votes: 35 },
      { name: "وليد بشير عيتاني", sect: "Sunni", list: "لبيروت", votes: 53 },
      { name: "محمد بلال خليل العرب", sect: "Sunni", list: "لبيروت", votes: 124 },
      { name: "جهاد علي حمود", sect: "Shia", list: "لبيروت", votes: 38 },
      { name: "اياد حسين البنا", sect: "Druze", list: "لبيروت", votes: 3 },
      { name: "ماري فادي الجلخ", sect: "Evangelical", list: "لبيروت", votes: 18 },

      { name: "ايمان وائل طباره", sect: "Sunni", list: "بيروت التغيير", votes: 1944 },
      { name: "ابراهيم حسن منيمنه", sect: "Sunni", list: "بيروت التغيير", votes: 13281 },
      { name: "فاطمة احمد مشرف", sect: "Sunni", list: "بيروت التغيير", votes: 307 },
      { name: "سماح حسان حلواني", sect: "Sunni", list: "بيروت التغيير", votes: 235 },
      { name: "وضاح ابراهيم صادق الصادق", sect: "Sunni", list: "بيروت التغيير", votes: 3760 },
      { name: "رشدي عدنان قباني", sect: "Sunni", list: "بيروت التغيير", votes: 485 },
      { name: "علي كمال عباس", sect: "Shia", list: "بيروت التغيير", votes: 803 },
      { name: "محمود كامل فقيه", sect: "Shia", list: "بيروت التغيير", votes: 534 },
      { name: "هاني انيس الاحمدية", sect: "Druze", list: "بيروت التغيير", votes: 153 },
      { name: "نهاد سليم يزبك", sect: "Evangelical", list: "بيروت التغيير", votes: 3272 },
      { name: "ملحم اميل خلف", sect: "Greek Orthodox", list: "بيروت التغيير", votes: 7141 },

      { name: "احمد مختار يحيى خالد", sect: "Sunni", list: "لتبقى بيروت", votes: 161 },
      { name: "نقولا نجيب سابا", sect: "Greek Orthodox", list: "لتبقى بيروت", votes: 249 },
      { name: "محمد عيد عبد القادر شهاب", sect: "Sunni", list: "لتبقى بيروت", votes: 907 },
      { name: "دلال حليم الرحباني", sect: "Evangelical", list: "لتبقى بيروت", votes: 49 },
      { name: "اياد محمود مرعي", sect: "Sunni", list: "لتبقى بيروت", votes: 58 },
      { name: "رشا محمد عيتاني", sect: "Sunni", list: "لتبقى بيروت", votes: 194 },
      { name: "خلود موفق الوتار", sect: "Sunni", list: "لتبقى بيروت", votes: 166 },
      { name: "سمير عادل الحلبي", sect: "Druze", list: "لتبقى بيروت", votes: 28 },
      { name: "فؤاد عادل الديك", sect: "Sunni", list: "لتبقى بيروت", votes: 447 },

      { name: "عمر عبد الناصر صبره", sect: "Sunni", list: "قادرين", votes: 791 },
      { name: "محمد سهيل ناصر", sect: "Shia", list: "قادرين", votes: 81 },
      { name: "علي رضا دنيا ديده شيران", sect: "Shia", list: "قادرين", votes: 91 },
      { name: "جبران الحداد الكسي", sect: "Greek Orthodox", list: "قادرين", votes: 612 },
      { name: "هادي نجيب اديب الحصني", sect: "Evangelical", list: "قادرين", votes: 72 },
      { name: "وئام فواز دلال", sect: "Druze", list: "قادرين", votes: 38 },

      { name: "مايا سعد الدين شاتيلا", sect: "Sunni", list: "نعم لبيروت", votes: 31 },
      { name: "علي حسن فصاعي", sect: "Shia", list: "نعم لبيروت", votes: 13 },
      { name: "سامر محمد غازي يحيى", sect: "Sunni", list: "نعم لبيروت", votes: 8 },
      { name: "نعيم وديع العياش", sect: "Druze", list: "نعم لبيروت", votes: 10 },
      { name: "ايمن خضر علي محمد", sect: "Sunni", list: "نعم لبيروت", votes: 53 },
      { name: "ياسين قاسم فواز", sect: "Shia", list: "نعم لبيروت", votes: 111 },

      { name: "فيصل محي الدين التمراوي", sect: "Sunni", list: "بيروت مدينتي", votes: 25 },
      { name: "ساره سليم ياسين", sect: "Sunni", list: "بيروت مدينتي", votes: 84 },
      { name: "باولا نقولا ربيز", sect: "Greek Orthodox", list: "بيروت مدينتي", votes: 97 },
      { name: "ريمه حسيب ابو شقرا", sect: "Druze", list: "بيروت مدينتي", votes: 15 },
      { name: "ناهده محمد خليل", sect: "Shia", list: "بيروت مدينتي", votes: 66 },
      { name: "مها اسعد الراسي", sect: "Evangelical", list: "بيروت مدينتي", votes: 12 }
    ],
    listVotes: [
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
  },

  // South I source:
  // https://www.elections.gov.lb/النيابية/2022/نتايج-الانتخابات/مجموع-اصوات-المرشحين-بحسب-الدوائر-لعام-2022/دائرة-الجنوب-الأولى.aspx
  "south-i": {
    candidates: [
      { name: "Ibrahim Samir Azar", sect: "Maronite", list: "Moderation Is our Strength", votes: 7894, minorDistrict: "Jezzine" },
      { name: "Youssef Hanna Skaff", sect: "Greek Catholic", list: "Moderation Is our Strength", votes: 108, minorDistrict: "Jezzine" },
      { name: "Nabil Mahmoud Eizzedine El Zaatari", sect: "Sunni", list: "Moderation Is our Strength", votes: 3242, minorDistrict: "Saida" },

      { name: "Abdel Rahman Nazih El Bizri", sect: "Sunni", list: "We Vote for Change", votes: 8526, minorDistrict: "Saida" },
      { name: "Osama Maarouf Saad El Masri", sect: "Sunni", list: "We Vote for Change", votes: 7341, minorDistrict: "Saida" },
      { name: "Charbel Maroun Massaad", sect: "Maronite", list: "We Vote for Change", votes: 984, minorDistrict: "Jezzine" },
      { name: "Kamil Farid Serhal", sect: "Maronite", list: "We Vote for Change", votes: 795, minorDistrict: "Jezzine" },
      { name: "Jamil Iskandar Dagher", sect: "Greek Catholic", list: "We Vote for Change", votes: 382, minorDistrict: "Jezzine" },

      { name: "Ghada Khalil Ayoub", sect: "Greek Catholic", list: "Our Unity in Saida and Jezzine", votes: 7953, minorDistrict: "Jezzine" },
      { name: "Youssef Mohamad El Naqib", sect: "Sunni", list: "Our Unity in Saida and Jezzine", votes: 4380, minorDistrict: "Saida" },
      { name: "Said Sleiman El Asmar", sect: "Maronite", list: "Our Unity in Saida and Jezzine", votes: 1102, minorDistrict: "Jezzine" },
      { name: "Wissam Youssef El Tawil", sect: "Maronite", list: "Our Unity in Saida and Jezzine", votes: 108, minorDistrict: "Jezzine" },

      { name: "Hania Hani Zaatari", sect: "Sunni", list: "We Are The Change", votes: 3028, minorDistrict: "Saida" },
      { name: "Mohamad Fadi El Zarif", sect: "Sunni", list: "We Are The Change", votes: 369, minorDistrict: "Saida" },
      { name: "Joseph Elias El Asmar", sect: "Maronite", list: "We Are The Change", votes: 570, minorDistrict: "Jezzine" },
      { name: "Sleiman Elias Malek", sect: "Maronite", list: "We Are The Change", votes: 424, minorDistrict: "Jezzine" },
      { name: "Robert Elias El Khoury", sect: "Greek Catholic", list: "We Are The Change", votes: 309, minorDistrict: "Jezzine" },

      { name: "Rana Walid El Tawil", sect: "Sunni", list: "The Voice of Change", votes: 79, minorDistrict: "Saida" },
      { name: "Mohamad Ali Jamil El Tahira", sect: "Sunni", list: "The Voice of Change", votes: 136, minorDistrict: "Saida" },
      { name: "Joseph Milad Youssef Metri", sect: "Greek Catholic", list: "The Voice of Change", votes: 82, minorDistrict: "Jezzine" },

      { name: "Ziad Michel Asouad", sect: "Maronite", list: "Together for Saida and Jezzine", votes: 3639, minorDistrict: "Jezzine" },
      { name: "Amal Hekmat Abou Zeid", sect: "Maronite", list: "Together for Saida and Jezzine", votes: 5184, minorDistrict: "Jezzine" },
      { name: "Selim Antoine Khoury", sect: "Greek Catholic", list: "Together for Saida and Jezzine", votes: 447, minorDistrict: "Jezzine" },
      { name: "Ali Sadek El Cheikh Amar", sect: "Sunni", list: "Together for Saida and Jezzine", votes: 77, minorDistrict: "Saida" },
      { name: "Mohamad Chaker Souheil El Qawas", sect: "Sunni", list: "Together for Saida and Jezzine", votes: 165, minorDistrict: "Saida" },

      { name: "Ahmad Mohamad Walid El Assi", sect: "Sunni", list: "Capable", votes: 338, minorDistrict: "Saida" },
      { name: "Ismail Mohamad Dib Haffouda", sect: "Sunni", list: "Capable", votes: 40, minorDistrict: "Saida" },
      { name: "Emilio Toni Matar", sect: "Maronite", list: "Capable", votes: 210, minorDistrict: "Jezzine" },
      { name: "Elie Youssef Abou Tas", sect: "Maronite", list: "Capable", votes: 442, minorDistrict: "Jezzine" }
    ],
    listVotes: [
      { list: "Moderation Is our Strength", votes: 475 },
      { list: "We Vote for Change", votes: 755 },
      { list: "Our Unity in Saida and Jezzine", votes: 405 },
      { list: "We Are The Change", votes: 219 },
      { list: "The Voice of Change", votes: 27 },
      { list: "Together for Saida and Jezzine", votes: 334 },
      { list: "Capable", votes: 98 }
    ]
  },

  // South II source:
  // https://elections.gov.lb/api/ContentRecord/public/detail/400?languageId=2
  // Attachment: https://elections.gov.lb/api/Media/A201E7BE-8CEC-4C5E-8A9D-15F0D72A8D46.pdf
  "south-ii": {
    candidates: [
      { name: "نبيه مصطفى بري", sect: "Shia", list: "الأمل و الوفاء", votes: 42091, minorDistrict: "Zahrani" },
      { name: "علي عادل عسيران", sect: "Shia", list: "الأمل و الوفاء", votes: 2294, minorDistrict: "Zahrani" },
      { name: "ميشال حنا موسى", sect: "Greek Catholic", list: "الأمل و الوفاء", votes: 1364, minorDistrict: "Zahrani" },
      { name: "حسن محمد علي عز الدين", sect: "Shia", list: "الأمل و الوفاء", votes: 27927, minorDistrict: "Tyre" },
      { name: "علي يوسف خريس", sect: "Shia", list: "الأمل و الوفاء", votes: 16964, minorDistrict: "Tyre" },
      { name: "حسين سعيد جشي", sect: "Shia", list: "الأمل و الوفاء", votes: 27416, minorDistrict: "Tyre" },
      { name: "عنايه محمد عز الدين", sect: "Shia", list: "الأمل و الوفاء", votes: 15266, minorDistrict: "Tyre" },

      { name: "حسن احمد حسن خليل", sect: "Shia", list: "الدولة الحاضنة", votes: 816, minorDistrict: "Zahrani" },
      { name: "بشرا ايوب خليل", sect: "Shia", list: "الدولة الحاضنة", votes: 2476, minorDistrict: "Tyre" },
      { name: "رياض سعيد الاسعد", sect: "Shia", list: "الدولة الحاضنة", votes: 1945, minorDistrict: "Zahrani" },
      { name: "يوسف مصطفى خليفه", sect: "Shia", list: "الدولة الحاضنة", votes: 709, minorDistrict: "Tyre" },

      { name: "حاتم فوزي حلاوي", sect: "Shia", list: "معاً للتغيير", votes: 1649, minorDistrict: "Zahrani" },
      { name: "ساره علي سويدان", sect: "Shia", list: "معاً للتغيير", votes: 834, minorDistrict: "Tyre" },
      { name: "محمد يوسف ايوب", sect: "Shia", list: "معاً للتغيير", votes: 195, minorDistrict: "Tyre" },
      { name: "رؤى بشير الفارس", sect: "Shia", list: "معاً للتغيير", votes: 1088, minorDistrict: "Tyre" },
      { name: "هشام بولص حايك", sect: "Greek Catholic", list: "معاً للتغيير", votes: 3987, minorDistrict: "Zahrani" },
      { name: "علي محمد خليفه", sect: "Shia", list: "معاً للتغيير", votes: 595, minorDistrict: "Tyre" },
      { name: "ايمن محمود مروه", sect: "Shia", list: "معاً للتغيير", votes: 656, minorDistrict: "Tyre" },

      { name: "قاسم سليمان داوود", sect: "Shia", list: "القرار الحر", votes: 208, minorDistrict: "Tyre" },
      { name: "داوود علي فرج", sect: "Shia", list: "القرار الحر", votes: 320, minorDistrict: "Tyre" },
      { name: "روبار ملحم كنعان", sect: "Greek Catholic", list: "القرار الحر", votes: 4238, minorDistrict: "Zahrani" }
    ],
    listVotes: [
      { list: "الأمل و الوفاء", votes: 4920 },
      { list: "الدولة الحاضنة", votes: 1459 },
      { list: "معاً للتغيير", votes: 1057 },
      { list: "القرار الحر", votes: 474 }
    ]
  },

  // South III source:
  // https://elections.gov.lb/api/ContentRecord/public/detail/400?languageId=2
  // Attachment: https://elections.gov.lb/api/Media/D7ED8488-058B-4D77-8F6D-99FF8D46E7E2.pdf
  "south-iii": {
    candidates: [
      { name: "محمد حسن رعد", sect: "Shia", list: "الأمل و الوفاء", votes: 48543, minorDistrict: "Nabatieh" },
      { name: "هاني حسن قبيسي", sect: "Shia", list: "الأمل و الوفاء", votes: 20195, minorDistrict: "Bint Jbeil" },
      { name: "ناصر فوزي جابر", sect: "Shia", list: "الأمل و الوفاء", votes: 6236, minorDistrict: "Nabatieh" },
      { name: "علي حسن خليل", sect: "Shia", list: "الأمل و الوفاء", votes: 13155, minorDistrict: "Marjeyoun" },
      { name: "علي رشيد فياض", sect: "Shia", list: "الأمل و الوفاء", votes: 37047, minorDistrict: "Nabatieh" },
      { name: "قاسم عمر هاشم", sect: "Sunni", list: "الأمل و الوفاء", votes: 1215, minorDistrict: "Hasbaya" },
      { name: "مروان سليم خير الدين", sect: "Druze", list: "الأمل و الوفاء", votes: 2634, minorDistrict: "Hasbaya" },
      { name: "اسعد حليم حردان", sect: "Greek Orthodox", list: "الأمل و الوفاء", votes: 1859, minorDistrict: "Marjeyoun" },
      { name: "حسن نظام الدين فضل الله", sect: "Shia", list: "الأمل و الوفاء", votes: 43324, minorDistrict: "Bint Jbeil" },
      { name: "ايوب فهد حميد", sect: "Shia", list: "الأمل و الوفاء", votes: 6745, minorDistrict: "Hasbaya" },
      { name: "اشرف نزيه هاشم بيضون", sect: "Shia", list: "الأمل و الوفاء", votes: 10540, minorDistrict: "Bint Jbeil" },

      { name: "علي حسن وهبي", sect: "Shia", list: "معاً نحو التغيير", votes: 1806, minorDistrict: "Nabatieh" },
      { name: "وسيم فؤاد غندور", sect: "Shia", list: "معاً نحو التغيير", votes: 2206, minorDistrict: "Bint Jbeil" },
      { name: "وفيق خضر ريحان", sect: "Shia", list: "معاً نحو التغيير", votes: 3071, minorDistrict: "Nabatieh" },
      { name: "حسن عادل جابر بزي", sect: "Shia", list: "معاً نحو التغيير", votes: 1354, minorDistrict: "Bint Jbeil" },
      { name: "خليل حسن ذيب", sect: "Shia", list: "معاً نحو التغيير", votes: 417, minorDistrict: "Nabatieh" },
      { name: "علي احمد مراد", sect: "Shia", list: "معاً نحو التغيير", votes: 2960, minorDistrict: "Marjeyoun" },
      { name: "ابراهيم محمود عبد الله", sect: "Shia", list: "معاً نحو التغيير", votes: 651, minorDistrict: "Hasbaya" },
      { name: "الياس فارس جراده", sect: "Greek Orthodox", list: "معاً نحو التغيير", votes: 9218, minorDistrict: "Marjeyoun" },
      { name: "فراس اسماعيل حمدان", sect: "Druze", list: "معاً نحو التغيير", votes: 4859, minorDistrict: "Hasbaya" },
      { name: "محمد عبد اللطيف قعدان", sect: "Sunni", list: "معاً نحو التغيير", votes: 1059, minorDistrict: "Hasbaya" },
      { name: "نزار ابراهيم رمال", sect: "Shia", list: "معاً نحو التغيير", votes: 465, minorDistrict: "Marjeyoun" },

      { name: "عباس محمد شرف الدين", sect: "Shia", list: "صوت الجنوب", votes: 74, minorDistrict: "Bint Jbeil" },
      { name: "كريم علي حمدان", sect: "Druze", list: "صوت الجنوب", votes: 7, minorDistrict: "Hasbaya" },
      { name: "رياض حسين عيسى", sect: "Sunni", list: "صوت الجنوب", votes: 18, minorDistrict: "Hasbaya" },
      { name: "محمود حسن شعيب", sect: "Shia", list: "صوت الجنوب", votes: 48, minorDistrict: "Nabatieh" },
      { name: "حسين جهاد الشاعر", sect: "Shia", list: "صوت الجنوب", votes: 192, minorDistrict: "Bint Jbeil" }
    ],
    listVotes: [
      { list: "الأمل و الوفاء", votes: 6329 },
      { list: "معاً نحو التغيير", votes: 2318 },
      { list: "صوت الجنوب", votes: 613 }
    ]
  }
};

const generatedListVoteOverrides2022ByTemplateId = {
  "bekaa-i": {
    listVotes: [
      { list: "ﺳﻴﺎدﻳﻮن ﻣﺴﺘﻘﻠﻮن", votes: 829 },
      { list: "زﺣﻠﺔ اﻟﺴﻴﺎدة", votes: 606 },
      { list: "زﺣﻠﺔ ﺗﻨﺘﻔﺾ", votes: 185 },
      { list: "اﻟﻘﻮل واﻟﻔﻌﻞ", votes: 26 },
      { list: "زﺣﻠﺔ اﻟﺮﺳﺎﻟﺔ", votes: 493 },
      { list: "اﻟﺘﻐﻴﻴﺮ", votes: 52 },
      { list: "ﻗﺎدرﻳﻦ ﻧﻮاﺟﻪ", votes: 92 },
      { list: "اﻟﻜﺘﻠﺔ اﻟﺸﻌﺒﻴﺔ", votes: 563 }
    ]
  },
  "bekaa-ii": {
    listVotes: [
      { list: "اﻟﻐﺪ اﻷﻓﻀﻞ", votes: 1070 },
      { list: "ﺑﻘﺎﻋﻨﺎ اوﻻً", votes: 181 },
      { list: "ﻻﺋﺤﺔ ﺳﻬﻠﻨﺎ و اﻟﺠﺒﻞ", votes: 402 },
      { list: "اﻟﻘﺮار اﻟﻮﻃﻨﻲ اﻟﻤﺴﺘﻘﻞ", votes: 472 },
      { list: "ﻧﺤﻮ اﻟﺘﻐﻴﻴﺮ", votes: 23 },
      { list: "ﻗﺎدرﻳﻦ", votes: 40 }
    ]
  },
  "bekaa-iii": {
    listVotes: [
      { list: "ﻣﺴﺘﻘﻠﻮن ﺿﺪ اﻟﻔﺴﺎد", votes: 501 },
      { list: "اﻻﻣﻞ و اﻟﻮﻓﺎء", votes: 4649 },
      { list: "9", votes: 135 },
      { list: "ﻗﺎدرﻳﻦ", votes: 153 },
      { list: "ﺑﻨﺎء اﻟﺪوﻟﺔ", votes: 630 },
      { list: "اﺋﺘﻼف اﻟﺘﻐﻴﻴﺮ", votes: 300 }
    ]
  },
  "mount-lebanon-i": {
    listVotes: [
      { list: "ﻣﻌﻜﻢ ﻓﻴﻨﺎ ﻟﻶﺧﺮ", votes: 663 },
      { list: "ﻗﻠﺐ ﻟﺒﻨﺎن اﻟﻤﺴﺘﻘﻞ", votes: 577 },
      { list: "ﺻﺮﺧﺔ وﻃﻦ", votes: 1554 },
      { list: "اﻟﺤﺮﻳﺔ ﻗﺮار", votes: 354 },
      { list: "ﻧﺤﻨﺎ اﻟﺘﻐﻴﻴﺮ", votes: 281 },
      { list: "ﻗﺎدرﻳﻦ", votes: 263 },
      { list: "ﻛﻨﺎ ورح ﻧﺒﻘﻰ", votes: 657 }
    ]
  },
  "mount-lebanon-ii": {
    listVotes: [
      { list: "ﻣﺘﻦ اﻟﺤﺮﻳّﺔ", votes: 449 },
      { list: "ﻣﻌﺎً اﻗﻮى", votes: 548 },
      { list: "ﻣﺘﻦ اﻟﺘﻐﻴﻴﺮ", votes: 764 },
      { list: "ﻧﺤﻮ اﻟﺪوﻟﺔ", votes: 269 },
      { list: "ﻛﻨﺎ ورح ﻧﺒﻘﻰ ﻟﻠﻤﺘﻦ", votes: 470 },
      { list: "ﻣﺘﻨﻴﻮن ﺳﻴﺎدﻳﻮن", votes: 55 }
    ]
  },
  "mount-lebanon-iii": {
    listVotes: [
      { list: "ﻣﻌﺎً ﻧﺴﺘﻄﻴﻊ", votes: 67 },
      { list: "ﺑﻌﺒﺪا اﻟﺴﻴﺎدة واﻟﻘﺮار", votes: 671 },
      { list: "ﺑﻌﺒﺪا ﺗﻨﺘﻔﺾ", votes: 132 },
      { list: "ﺑﻌﺒﺪا اﻟﺘﻐﻴﻴﺮ", votes: 421 },
      { list: "ﻧﺤﻨﺎ اﻟﺘﻐﻴﻴﺮ", votes: 40 },
      { list: "ﻗﺎدرﻳﻦ", votes: 117 },
      { list: "ﻻﺋﺤﺔ اﻟﻮﻓﺎق اﻟﻮﻃﻨﻲ", votes: 945 }
    ]
  },
  "mount-lebanon-iv": {
    listVotes: [
      { list: "اﻟﺸﺮاﻛﺔ واﻻرادة", votes: 2365 },
      { list: "ﺻﻮﺗﻚ ﺛﻮرة", votes: 303 },
      { list: "ﻻﺋﺤﺔ اﻟﺠﺒﻞ", votes: 1049 },
      { list: "ﻗﺎدرﻳﻦ", votes: 210 },
      { list: "ﺗﻮﺣﺪﻧﺎ ﻟﻠﺘﻐﻴﻴﺮ", votes: 1484 },
      { list: "ﺳﻴﺎدة وﻃﻦ", votes: 88 },
      { list: "اﻟﺠﺒﻞ ﻳﻨﺘﻔﺾ", votes: 78 }
    ]
  },
  "north-i": {
    candidates: [
      { name: "ﻋﻠﻲ ﻣﺤﻤﺪ ﻃﻠﻴﺲ", sect: "Sunni", list: "اﻟﻮﻓﺎء ﻟﻌﻜﺎﺭ", votes: 6645 },
      { name: "ﻫﻴﺜﻢ ﻣﺤﻤﺪ ﻋﺰ اﻟﺪﻳﻦ", sect: "Sunni", list: "اﻟﻮﻓﺎء ﻟﻌﻜﺎﺭ", votes: 3588 },
      { name: "ﻋﻤﺎﺭ ﺳﻌﺪ ﷲ ﺳﻌﺪ ﷲ ﻣﺤﻤﺪ رﺷﻴﺪ", sect: "Sunni", list: "اﻟﻮﻓﺎء ﻟﻌﻜﺎﺭ", votes: 242 },
      { name: "ﺟﻮزﻑ ﺟﺒﺮاﺋﻴﻞ ﻣﺨﺎﻳﻞ", sect: "Maronite", list: "اﻟﻮﻓﺎء ﻟﻌﻜﺎﺭ", votes: 581 },
      { name: "اﻳﻠﻲ اﺳﻌﺪ ﺳﻌﺪ", sect: "Greek Orthodox", list: "اﻟﻮﻓﺎء ﻟﻌﻜﺎﺭ", votes: 1171 },
      { name: "اﻳﻠﻲ ﺣﻤﻴﺪ ﺩﻳﺐ", sect: "Greek Orthodox", list: "اﻟﻮﻓﺎء ﻟﻌﻜﺎﺭ", votes: 319 },
      { name: "اﺣﻤﺪ اﺑﺮاﻫﻴﻢ اﻟﻬﻀﺎﻡ", sect: "Alawite", list: "اﻟﻮﻓﺎء ﻟﻌﻜﺎﺭ", votes: 455 },

      { name: "وﻟﻴﺪ وﺟﻴﻪ اﻟﺒﻌﺮﻳﻨﻲ", sect: "Sunni", list: "ﻻﺋﺤﺔ اﻻﻋﺘﺪاﻝ اﻟﻮﻃﻨﻲ", votes: 11099 },
      { name: "ﻣﺤﻤﺪ ﻣﺼﻄﻔﻰ ﺳﻠﻴﻤﺎﻥ", sect: "Sunni", list: "ﻻﺋﺤﺔ اﻻﻋﺘﺪاﻝ اﻟﻮﻃﻨﻲ", votes: 11340 },
      { name: "اﺑﺮاﻫﻴﻢ ﻋﺒﺪﷲ اﻟﻤﺼﻮﻣﻌﻲ", sect: "Sunni", list: "ﻻﺋﺤﺔ اﻻﻋﺘﺪاﻝ اﻟﻮﻃﻨﻲ", votes: 7370 },
      { name: "اﺣﻤﺪ ﻣﺤﻤﺪ رﺳﺘﻢ", sect: "Alawite", list: "ﻻﺋﺤﺔ اﻻﻋﺘﺪاﻝ اﻟﻮﻃﻨﻲ", votes: 324 },
      { name: "ﺳﺠﻴﻊ ﻣﺨﺎﻳﻞ ﻋﻄﻴﻪ", sect: "Greek Orthodox", list: "ﻻﺋﺤﺔ اﻻﻋﺘﺪاﻝ اﻟﻮﻃﻨﻲ", votes: 1948 },
      { name: "ﺣﻨﺎﺟﻮﻟﻲ اﻟﻴﺎﺱ", sect: "Greek Orthodox", list: "ﻻﺋﺤﺔ اﻻﻋﺘﺪاﻝ اﻟﻮﻃﻨﻲ", votes: 1264 },
      { name: "ﻫﺎﺩﻱ ﻓﻮﺯﻱ ﺣﺒﻴﺶ", sect: "Maronite", list: "ﻻﺋﺤﺔ اﻻﻋﺘﺪاﻝ اﻟﻮﻃﻨﻲ", votes: 7546 },

      { name: "ﻃﻼﻝ ﺧﺎﻟﺪ ﺑﻚ ﻋﺒﺪ اﻟﻘﺎﺩﺭ اﻟﻤﺮﻋﺒﻲ", sect: "Sunni", list: "ﻧﺤﻮ اﻟﻤﻮاﻃﻨﺔ", votes: 3159 },
      { name: "ﺧﺎﻟﺪ ﻣﺤﻤﺪ ﺿﺎﻫﺮ", sect: "Sunni", list: "ﻧﺤﻮ اﻟﻤﻮاﻃﻨﺔ", votes: 2479 },
      { name: "ﻣﺤﻤﺪ ﻋﺠﺎﺝ اﺑﺮاﻫﻴﻢ", sect: "Sunni", list: "ﻧﺤﻮ اﻟﻤﻮاﻃﻨﺔ", votes: 3481 },
      { name: "وﺳﺎﻡ ﺭﻳﺎﺽ ﻣﻨﺼﻮﺭ", sect: "Greek Orthodox", list: "ﻧﺤﻮ اﻟﻤﻮاﻃﻨﺔ", votes: 8264 },
      { name: "ﺯﻳﺎﺩ ﺭﻳﺎﺽ ﺭﺣﺎﻝ", sect: "Greek Orthodox", list: "ﻧﺤﻮ اﻟﻤﻮاﻃﻨﺔ", votes: 464 },
      { name: "ﻓﻮاﺯ ﻣﺤﻤﺪ ﻣﺤﻤﺪ", sect: "Alawite", list: "ﻧﺤﻮ اﻟﻤﻮاﻃﻨﺔ", votes: 153 },
      { name: "ﻣﻴﺸﺎﻝ اﻧﻄﻮﻥ اﻟﺨﻮﺭﻱ", sect: "Maronite", list: "ﻧﺤﻮ اﻟﻤﻮاﻃﻨﺔ", votes: 893 },

      { name: "ﺭوﻟﻰ ﻣﺤﻤﺪ اﻟﻤﺮاﺩ", sect: "Sunni", list: "ﻋﻜﺎﺭ", votes: 496 },
      { name: "ﺭاﻟﻒ ﺟﻮﺭﺝ ﺿﺎﻫﺮ", sect: "Maronite", list: "ﻋﻜﺎﺭ", votes: 774 },
      { name: "ﻣﻴﺸﺎﻝ ﺟﺮﺟﺲ ﻃﻌﻮﻡ", sect: "Greek Orthodox", list: "ﻋﻜﺎﺭ", votes: 834 },
      { name: "اﺣﻤﺪ ﻣﺼﻄﻔﻰ ﻣﺼﻄﻔﻰ", sect: "Sunni", list: "ﻋﻜﺎﺭ", votes: 489 },
      { name: "ﻧﺰﻳﻪ ﻋﻔﻴﻒ اﺑﺮاﻫﻴﻢ", sect: "Greek Orthodox", list: "ﻋﻜﺎﺭ", votes: 91 },
      { name: "ﻏﻴﺚ ﺧﺎﻟﺪ ﺣﻤﻮﺩ", sect: "Sunni", list: "ﻋﻜﺎﺭ", votes: 361 },

      { name: "ﻋﺒﺪ اﻟﺮﺯاﻕ ﻣﺤﻤﻮﺩ اﻟﻜﻴﻼﻧﻲ", sect: "Sunni", list: "ﻋﻜﺎﺭ ﺗﻨﺘﻔﺾ", votes: 64 },
      { name: "ﺧﺎﻟﺪ ﺣﺴﻦ ﺿﺎﻫﺮ", sect: "Sunni", list: "ﻋﻜﺎﺭ ﺗﻨﺘﻔﺾ", votes: 1038 },
      { name: "ﻣﺤﻤﺪ ﺧﺎﻟﺪ ﻣﺴﻠﻤﺎﻧﻲ", sect: "Sunni", list: "ﻋﻜﺎﺭ ﺗﻨﺘﻔﺾ", votes: 97 },
      { name: "ﺭﻳﻦ ﺳﻴﻤﻮﻥ ﺻﻮاﻥ", sect: "Maronite", list: "ﻋﻜﺎﺭ ﺗﻨﺘﻔﺾ", votes: 72 },
      { name: "ﻧﺰاﺭ ﻫﺎﺷﻢ اﺑﺮاﻫﻴﻢ", sect: "Alawite", list: "ﻋﻜﺎﺭ ﺗﻨﺘﻔﺾ", votes: 15 },

      { name: "ﻣﺤﻤﺪ ﻛﺎﻣﻞ ﺑﺪﺭﺓ", sect: "Sunni", list: "ﻋﻜﺎﺭ اﻟﺘﻐﻴﻴﺮ", votes: 9302 },
      { name: "ﺑﺮﻱ ﻋﺴﻜﺮ اﻻﺳﻌﺪ", sect: "Sunni", list: "ﻋﻜﺎﺭ اﻟﺘﻐﻴﻴﺮ", votes: 1111 },
      { name: "ﺧﺎﻟﺪ ﻣﺤﻤﻮﺩ ﻋﻠﻮﺵ", sect: "Sunni", list: "ﻋﻜﺎﺭ اﻟﺘﻐﻴﻴﺮ", votes: 1435 },
      { name: "ﻟﻮﺭﻳﺲ اﺩﻳﺐ اﻟﺮاﻋﻲ", sect: "Greek Orthodox", list: "ﻋﻜﺎﺭ اﻟﺘﻐﻴﻴﺮ", votes: 390 },
      { name: "ﻭﻓﺎء ﻛﻤﻴﻞ ﺟﻤﻴﻞ", sect: "Greek Orthodox", list: "ﻋﻜﺎﺭ اﻟﺘﻐﻴﻴﺮ", votes: 176 },
      { name: "اﺩﻛﺎﺭ ﺟﻮزة ﻃﻨﻮﺱ ﺿﺎﻫﺮ", sect: "Maronite", list: "ﻋﻜﺎﺭ اﻟﺘﻐﻴﻴﺮ", votes: 947 },
      { name: "ﺟﻨﺎﻥ اﺣﻤﺪ ﺣﻤﺪاﻥ", sect: "Alawite", list: "ﻋﻜﺎﺭ اﻟﺘﻐﻴﻴﺮ", votes: 361 },

      { name: "ﻭﺳﻴﻢ ﻏﺎﻧﺪﻱ اﻟﻤﺮﻋﺒﻲ", sect: "Sunni", list: "اﻟﻨﻬﻮﺽ ﻟﻌﻜﺎﺭ", votes: 5000 },
      { name: "ﺳﻌﺪ ﷲ ﻣﺤﻲ اﻟﺪﻳﻦ اﻟﺤﻤﺪ", sect: "Sunni", list: "اﻟﻨﻬﻮﺽ ﻟﻌﻜﺎﺭ", votes: 29 },
      { name: "ﻣﺤﻤﻮﺩ ﺧﻀﺮ ﺣﺪاﺭﺓ", sect: "Sunni", list: "اﻟﻨﻬﻮﺽ ﻟﻌﻜﺎﺭ", votes: 5017 },
      { name: "ﻫﺸﺎﻡ اﻟﻴﺎﺱ ﺷﺒﻴﺐ", sect: "Greek Orthodox", list: "اﻟﻨﻬﻮﺽ ﻟﻌﻜﺎﺭ", votes: 775 },
      { name: "ﻧﺎﻓﺬ ﻟﻄﻒ ﷲ ﻭﺭاﻕ", sect: "Greek Orthodox", list: "اﻟﻨﻬﻮﺽ ﻟﻌﻜﺎﺭ", votes: 155 },
      { name: "ﻃﺎﻧﻴﻮﺱ ﺧﻠﻴﻞ اﻟﺨﻮﺭﻱ", sect: "Maronite", list: "اﻟﻨﻬﻮﺽ ﻟﻌﻜﺎﺭ", votes: 233 },
      { name: "ﻣﺤﺴﻦ اﺣﻤﺪ ﺣﺴﻴﻦ", sect: "Alawite", list: "اﻟﻨﻬﻮﺽ ﻟﻌﻜﺎﺭ", votes: 282 },

      { name: "ﻣﺤﻤﺪ ﻳﺤﻴﻪ ﻳﺤﻴﻪ", sect: "Sunni", list: "ﻋﻜﺎﺭ اﻭﻻً", votes: 15142 },
      { name: "ﻛﺮﻡ اﺣﻤﺪ اﻟﻀﺎﻫﺮ", sect: "Sunni", list: "ﻋﻜﺎﺭ اﻭﻻً", votes: 1528 },
      { name: "ﺣﺎﺗﻢ ﺧﻀﺮ ﺳﻌﺪ اﻟﺪﻳﻦ", sect: "Sunni", list: "ﻋﻜﺎﺭ اﻭﻻً", votes: 1864 },
      { name: "اﺳﻌﺪ ﺭاﻣﺰ ﺩﺭﻏﺎﻡ", sect: "Greek Orthodox", list: "ﻋﻜﺎﺭ اﻭﻻً", votes: 5754 },
      { name: "ﺷﻜﻴﺐ ﻧﻌﻴﻢ ﻋﺒﻮﺩ", sect: "Greek Orthodox", list: "ﻋﻜﺎﺭ اﻭﻻً", votes: 3384 },
      { name: "ﺟﻴﻤﻲ ﺟﻮﺭﺝ ﺟﺒﻮﺭ", sect: "Maronite", list: "ﻋﻜﺎﺭ اﻭﻻً", votes: 8986 },
      { name: "ﺣﻴﺪﺭ ﺯﻫﺮ اﻟﺪﻳﻦ ﻋﻴﺴﻰ", sect: "Alawite", list: "ﻋﻜﺎﺭ اﻭﻻً", votes: 3948 }
    ],
    listVotes: [
      { list: "اﻟﻮﻓﺎء ﻟﻌﻜﺎﺭ", votes: 618 },
      { list: "ﻻﺋﺤﺔ اﻻﻋﺘﺪاﻝ اﻟﻮﻃﻨﻲ", votes: 957 },
      { list: "ﻧﺤﻮ اﻟﻤﻮاﻃﻨﺔ", votes: 441 },
      { list: "ﻋﻜﺎﺭ", votes: 109 },
      { list: "ﻋﻜﺎﺭ ﺗﻨﺘﻔﺾ", votes: 85 },
      { list: "ﻋﻜﺎﺭ اﻟﺘﻐﻴﻴﺮ", votes: 423 },
      { list: "اﻟﻨﻬﻮﺽ ﻟﻌﻜﺎﺭ", votes: 394 },
      { list: "ﻋﻜﺎﺭ اﻭﻻً", votes: 1155 }
    ]
  },
  "north-ii": {
    listVotes: [
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
  },
  "north-iii": {
    listVotes: [
      { list: "ﺷﻤﺎل اﻟﻤﻮاﺟﻬﺔ", votes: 605 },
      { list: "رح ﻧﺒﻘﻰ ﻫﻮن", votes: 574 },
      { list: "ﺷﻤﺎﻟﻨﺎ", votes: 1068 },
      { list: "ﻧﺒﺾ اﻟﺠﻤﻬﻮرﻳﺔ اﻟﻘﻮﻳﺔ", votes: 838 },
      { list: "ﻗﺎدرﻳﻦ ﻧﻐﻴّﺮ", votes: 98 },
      { list: "وﻋﻲ ﺻﻮﺗﻚ", votes: 73 },
      { list: "ﻻﺋﺤﺔ وﺣﺪة اﻟﺸﻤﺎل", votes: 679 }
    ]
  }
};

const generatedCandidateOverrides2022ByTemplateId = {
  "south-i": {
    minorDistrictByCandidateName: {
      "Ahmad Mohamad Walid El Assi": "Saida",
      "Ismail Mohamad Dib Haffouda": "Saida",
      "Emilio Toni Matar": "Jezzine",
      "Elie Youssef Abou Tas": "Jezzine",

      "Ibrahim Samir Azar": "Jezzine",
      "Youssef Hanna Skaff": "Jezzine",
      "Nabil Mahmoud Eizzedine El Zaatari": "Saida",

      "Ghada Khalil Ayoub": "Jezzine",
      "Youssef Mohamad El Naqib": "Saida",
      "Said Sleiman El Asmar": "Jezzine",
      "Wissam Youssef El Tawil": "Jezzine",

      "Rana Walid El Tawil": "Saida",
      "Mohamad Ali Jamil El Tahira": "Saida",
      "Joseph Milad Youssef Metri": "Jezzine",

      "Ziad Michel Asouad": "Jezzine",
      "Amal Hekmat Abou Zeid": "Jezzine",
      "Selim Antoine Khoury": "Jezzine",
      "Ali Sadek El Cheikh Amar": "Saida",
      "Mohamad Chaker Souheil El Qawas": "Saida",

      "Hania Hani Zaatari": "Saida",
      "Mohamad Fadi El Zarif": "Saida",
      "Joseph Elias El Asmar": "Jezzine",
      "Sleiman Elias Malek": "Jezzine",
      "Robert Elias El Khoury": "Jezzine",

      "Abdel Rahman Nazih El Bizri": "Saida",
      "Osama Maarouf Saad El Masri": "Saida",
      "Charbel Maroun Massaad": "Jezzine",
      "Kamil Farid Serhal": "Jezzine",
      "Jamil Iskandar Dagher": "Jezzine"
    }
  },
  "south-ii": {
    minorDistrictByCandidateName: {
      "نبيه مصطفى بري": "Zahrani",
      "علي عادل عسيران": "Zahrani",
      "ميشال حنا موسى": "Zahrani",
      "حسن محمد علي عز الدين": "Tyre",
      "علي يوسف خريس": "Tyre",
      "حسين سعيد جشي": "Tyre",
      "عنايه محمد عز الدين": "Tyre",

      "حسن احمد حسن خليل": "Zahrani",
      "بشرا ايوب خليل": "Tyre",
      "رياض سعيد الاسعد": "Zahrani",
      "يوسف مصطفى خليفه": "Tyre",

      "حاتم فوزي حلاوي": "Zahrani",
      "ساره علي سويدان": "Tyre",
      "محمد يوسف ايوب": "Tyre",
      "رؤى بشير الفارس": "Tyre",
      "هشام بولص حايك": "Zahrani",
      "علي محمد خليفه": "Tyre",
      "ايمن محمود مروه": "Tyre",

      "قاسم سليمان داوود": "Tyre",
      "داوود علي فرج": "Tyre",
      "روبار ملحم كنعان": "Zahrani"
    }
  },
  "south-iii": {
    minorDistrictByCandidateName: {
      "محمد حسن رعد": "Nabatieh",
      "هاني حسن قبيسي": "Bint Jbeil",
      "ناصر فوزي جابر": "Nabatieh",
      "علي حسن خليل": "Marjeyoun",
      "علي رشيد فياض": "Nabatieh",
      "قاسم عمر هاشم": "Hasbaya",
      "مروان سليم خير الدين": "Hasbaya",
      "اسعد حليم حردان": "Marjeyoun",
      "حسن نظام الدين فضل الله": "Bint Jbeil",
      "ايوب فهد حميد": "Hasbaya",
      "اشرف نزيه هاشم بيضون": "Bint Jbeil",

      "عباس محمد شرف الدين": "Bint Jbeil",
      "كريم علي حمدان": "Hasbaya",
      "رياض حسين عيسى": "Hasbaya",
      "محمود حسن شعيب": "Nabatieh",
      "حسين جهاد الشاعر": "Bint Jbeil",

      "علي حسن وهبي": "Nabatieh",
      "وسيم فؤاد غندور": "Bint Jbeil",
      "وفيق خضر ريحان": "Nabatieh",
      "حسن عادل جابر بزي": "Bint Jbeil",
      "خليل حسن ذيب": "Nabatieh",
      "علي احمد مراد": "Marjeyoun",
      "ابراهيم محمود عبد الله": "Hasbaya",
      "الياس فارس جراده": "Marjeyoun",
      "فراس اسماعيل حمدان": "Hasbaya",
      "محمد عبد اللطيف قعدان": "Hasbaya",
      "نزار ابراهيم رمال": "Marjeyoun"
    }
  },
  "bekaa-ii": {
    minorDistrictByCandidateName: {
      "ﻣﺮادﺣﺴﻦ ﻋﺒﺪ اﻟﺮﺣﻴﻢ": "West Bekaa",
      "ﻗﺒﻼن ﻋﺒﺪ اﻟﻤﻨﻌﻢ ﻗﺒﻼن": "West Bekaa",
      "اﻳﻠﻲ ﻧﺠﻴﺐ ﻓﺮزﻟﻲ": "West Bekaa",
      "ﻃﺎرق ﺳﻠﻴﻢ داود": "Rashaya",
      "ﺷﺮﺑﻞ ﻛﻤﻴﻞ ﻣﺎرون": "Rashaya",

      "ﻣﺤﻤﺪ ﻗﺎﺳﻢ اﻟﻘﺮﻋﺎوي": "West Bekaa",
      "واﺋﻞ وﻫﺒﻲ اﺑﻮ ﻓﺎﻋﻮر": "Rashaya",
      "ﻏﺴﺎن ﺳﻠﻴﻤﺎن اﻟﺴﻜﺎف": "West Bekaa",
      "ﻋﻠﻲ ﻣﺤﻤﺪ اﺑﻮ ﻳﺎﺳﻴﻦ": "West Bekaa",
      "ﻋﺒﺎس ﻣﺤﻤﺪ ﻋﻴﺪي": "West Bekaa",
      "ﺟﻬﺎد ﻣﻠﺤﻢ اﻟﺰرزور": "Rashaya",

      "ﻣﺤﻤﺪ ﺣﺴﻴﻦ ﻗﺪوره": "West Bekaa",
      "ﺧﺎﻟﺪ ﻣﺤﻤﺪ اﻟﻌﺴﻜﺮ": "West Bekaa",
      "ﺟﻮرج اﺑﺮاﻫﻴﻢ ﻋﺒﻮد": "West Bekaa",
      "داﻧﻲ ﻧﺒﻴﻪ ﺧﺎﻃﺮ": "Rashaya",
      "ﻏﻨﻮه ﺣﺴﻴﻦ اﺳﻌﺪ": "West Bekaa",

      "ﻓﺮح رﻳﺎض ﻗﺎﺳﻢ": "West Bekaa",
      "ﻏﺎده ﺟﻮرج ﻏﺎﻧﻢ": "Rashaya",
      "اﺳﺎﻣﻪ ﺳﻌﺪ اﺑﻮ زﻳﺪ": "West Bekaa",
      "ﻣﺎﻏﻲ ﻋﺎرف ﻣﻬﻨﺎ": "Rashaya",

      "ﻳﺎﺳﻴﻦ اﺣﻤﺪ ﻳﺎﺳﻴﻦ": "West Bekaa",
      "ﺣﺎﺗﻢ ﺣﺴﻴﻦ اﻟﺨﺸﻦ": "West Bekaa",
      "ﻣﺎﻛﻲ ﺑﺪﻳﻊ ﻋﻮن": "Rashaya",
      "ﺳﺎﻟﻲ ﻓﻮزي ﺷﺎﻣﻴﻪ": "West Bekaa",
      "ﺑﻬﺎء اﻟﺪﻳﻦ ﺣﺴﻴﻦ دﻻل": "Rashaya",

      "اﻟﺸﻤﺎﻟﻲﻋﻼء اﻟﺪﻳﻦ ﻋﻤﺮ": "West Bekaa",
      "ﺷﻮﻗﻲ ﻓﺮﻳﺪ اﺑﻮ ﻏﻮش": "Rashaya",
      "ﻛﻴﺘﺎ داود اﻟﻌﺠﻴﻞ": "Rashaya",
      "ﻋﺎﻣﺮ ﻣﺤﻤﺪ ﻗﺪوره": "West Bekaa"
    }
  },
  "north-ii": {
    minorDistrictByCandidateName: {
      "اﺷﺮف اﺣﻤﺪ رﻳﻔﻲ": "Tripoli",
      "اﻣﻴﻦ ﻣﺤﻤﺪ ﺑﺸﻴﺮ": "Tripoli",
      "اﻳﻤﺎن ﻋﺼﺎم درﻧﻴﻘﻪ": "Tripoli",
      "ﺻﺎﻟﺢ ﻏﺴﺎن اﻟﻤﻘﺪم": "Tripoli",
      "ﻓﻮزي ﻣﺤﻤﺪ ﻋﺰت اﻟﻔﺮي": "Tripoli",
      "اﻟﺨﻮرياﻟﻴﺎس ﻓﻮآد": "Tripoli",
      "ﺟﻤﻴﻞ ﻋﺒﻮد ﻋﺒﻮد": "Tripoli",
      "ﻣﺤﻤﺪ ﻋﺒﺪ اﻟﺤﻤﻴﺪ ﺷﻤﺴﻴﻦ": "Tripoli",
      "ﻋﺜﻤﺎن ﻣﺤﻤﺪ ﻋﻠﻢ اﻟﺪﻳﻦ": "Minnieh",
      "ﺑﻼل ﺣﺴﻴﻦ ﻫﺮﻣﻮش": "Dinnieh",
      "اﻟﻜﺮﻣﻪﻋﻮض ﻋﻮض اﺣﻤﺪ": "Tripoli",

      "ﺑﺎﺳﻞ ﻫﻴﺜﻢ اﻻﺳﻄﻪ": "Tripoli",
      "ﻣﺎﻳﺰ اﺳﻌﺪ اﻟﺠﻨﺪى": "Tripoli",
      "ﻳﻮﻧﺲ ﻣﺤﻤﺪ اﻟﺤﺴﻦ": "Tripoli",
      "دﻳﻤﺎ ﻣﻌﻦ ﺿﻨﺎوي": "Tripoli",
      "ﻛﺴﺤﻪﺳﻮﺳﻦ ﻣﺤﻤﺪ راﺷﺪ": "Tripoli",
      "ﻣﻴﺸﺎل ﻣﺠﻴﺪ اﻟﺨﻮري": "Tripoli",
      "ﺻﺎﻟﺢ وﻫﻴﺐ اﻟﺪﻳﺐ": "Tripoli",
      "اﻟﺨﻴﺮﻓﺎدي ﻣﺎﻟﻚ": "Minnieh",
      "ﻋﺒﺪ اﻟﻘﺎدر ﻣﺤﻤﺪ اﻟﺸﺎﻣﻲ": "Tripoli",
      "ﻛﺎﻣﻞ ﻋﻠﻲ ﺑﻜﻮر": "Tripoli",

      "ﻛﺮاﻣﻰﻓﻴﺼﻞ ﻋﻤﺮ": "Tripoli",
      "ﻧﺎﺟﻲﻋﻄﻔﺖ ﻃﻪ": "Tripoli",
      "اﺣﻤﺪ ﻋﺒﺪ اﻟﻘﺎدر اﻣﻴﻦ": "Tripoli",
      "راﻣﻲ ﻣﺤﻤﺪ ﻇﻬﻴﺮ اﺳﻮم": "Tripoli",
      "ﻋﻠﻲ ﺣﺴﻦ ﻧﻮر": "Tripoli",
      "ﺟﻮرج ادﻣﻮن ﺷﺒﻄﻴﻨﻲ": "Tripoli",
      "رﻓﻠﻲ اﻧﻄﻮن دﻳﺎب": "Tripoli",
      "ﻣﺤﻤﺪ اﺣﻤﺪ اﻟﻄﺮاﺑﻠﺴﻲ": "Tripoli",
      "اﻟﺼﻤﺪﺟﻬﺎد ﻣﺮﺷﺪ": "Dinnieh",
      "ﻧﺒﺮاس ﺑﺸﻴﺮ ﻋﻠﻢ اﻟﺪﻳﻦ": "Minnieh",

      "اﻳﻬﺎب ﻣﺤﻤﺪ ﻣﻄﺮ": "Tripoli",
      "ﻓﺮح ﻋﻠﻲ اﻟﺤﺪاد": "Tripoli",
      "ﻋﺰام اﺳﻌﺪ اﻳﻮﺑﻲ": "Tripoli",
      "اﺣﻤﺪ ﻋﺒﺪ اﻟﻮﻫﺎب اﻟﻤﺮج": "Tripoli",
      "زﻳﻦ ﺧﺎﻟﺪ ﻣﺼﻄﻔﻰ": "Tripoli",
      "ﻣﻄﺎﻧﻴﻮس ﻋﻴﺴﻰ ﻧﻘﻮﻻ ﻣﺤﻔﻮض": "Tripoli",
      "ﺑﻮل ﺣﻨﺎ اﻟﺤﺎﻣﺾ": "Tripoli",
      "ﻓﺮاس اﺣﻤﺪ اﻟﺴﻠﻮم": "Tripoli",
      "ﻣﺤﻤﻮد اﺣﻤﺪ اﻟﺴﻴﺪ": "Tripoli",
      "ﺳﻤﻴﺮ اﺣﻤﺪ ﻃﺎﻟﺐ": "Tripoli",
      "ﻣﺤﻤﺪ ﺳﻴﻒ اﻟﺪﻳﻦ دﻫﺒﻲ": "Tripoli",

      "ﻋﻤﺮ ﻣﺤﻤﺪ ﻋﺪﻧﺎن ﺣﺮﻓﻮش": "Tripoli",
      "ﺟﺎﻧﻴﺖ ﻳﻮﺳﻒ ﻓﺮﻧﺠﻴﻪ": "Tripoli",
      "ﺿﺤﻪ ﻣﺤﻤﺪ اﺣﻤﺪ": "Tripoli",
      "دﻳﺎﻻ ﺧﻀﺮ اﻻﺳﻄﻪ": "Tripoli",
      "اﻟﻔﺮﻳﺪ اﻧﻄﻮن دوره": "Tripoli",
      "ﻋﺒﺪ اﻟﺮﺣﻴﻢ ﺳﺎﻟﻢ درﻏﺎم": "Tripoli",
      "اﺣﻤﺪ ﻋﻠﻲ ﻋﻠﻲ": "Tripoli",
      "ﻣﺤﻤﺪ ﻋﻤﺮ زرﻳﻘﻪ": "Tripoli",
      "ﻧﺰﻳﻪ ﻧﺎﻓﺬ زود": "Tripoli",

      "ﻋﺪﻧﺎن اﺣﻤﺪ ﺑﻜﻮر": "Tripoli",
      "ﻣﺼﻄﻔﻰ ﻣﺤﻤﺪ ﻛﻨﺠﻮ ﺣﺴﻴﻦ": "Tripoli",
      "ﻣﺤﻤﻮد ﺧﻀﺮ اﻟﻤﻴﺮ": "Tripoli",
      "راﺋﺪ ﻋﻠﻲ اﻟﻄﺒﺎع": "Tripoli",
      "رأﻓﺖ اﻟﻤﺼﺮيﻋﻤﺮ": "Tripoli",

      "ﺑﻼل ﻣﺤﻤﺪ ﺷﻌﺒﺎن": "Tripoli",
      "ﻋﺒﺪ اﻟﻌﺰﻳﺰ ﻣﺤﻤﻮد ﻏﺎزي ﻃﺮﻃﻮﺳﻲ": "Tripoli",
      "رﺑﻴﻊ ﻣﺤﻤﺪ ﺳﻌﻴﺪ اﻟﺴﺒﺎﻋﻲ": "Tripoli",
      "ﻫﺸﺎم رﻳﺎض اﺑﺮاﻫﻴﻢ": "Tripoli",
      "اﻧﻄﻮﻧﻲ ﺟﻮزﻳﻒ ﻋﻴﺪ": "Tripoli",
      "ﻣﺤﻤﺪ اﺣﻤﺪ ﻋﻠﻢ اﻟﺪﻳﻦ": "Minnieh",
      "ﻣﺤﻤﺪ ﻃﻪ ﺟﺒﺎره": "Tripoli",

      "ﻣﺤﻤﺪ ﻣﺼﻄﻔﻰ زرﻳﻘﺔ": "Tripoli",
      "ﺷﻔﻴﻖ ﻣﺤﻤﺪ ﺣﺴﻮن": "Tripoli",
      "ﻋﺒﻴﺪه ﻧﺎﺻﺮ ﺗﻜﺮﻳﺘﻲ": "Tripoli",
      "ﻣﺼﺒﺎح ﻋﺰﻣﻲ رﺟﺐ": "Tripoli",
      "ﻧﻀﺎل ﻋﻠﻲ ﻋﺒﺪ اﻟﺮﺣﻤﻦ": "Tripoli",
      "ﻣﻨﻴﺮ ﻣﻮرﻳﺲ ﻗﺴﻄﻨﻄﻴﻦ دوﻣﺎﻧﻲ": "Tripoli",

      "ﻣﺼﻄﻔﻰ ﻣﺤﻤﺪ اﺳﻤﺎﻋﻴﻞ ﻋﻠﻮش": "Tripoli",
      "ﻓﻬﺪ ﺣﺴﺎم ﻣﻘﺪم": "Tripoli",
      "رﺑﻰ ﻋﺒﺪ اﻟﺮﺣﻤﻦ اﻟﺪاﻻﺗﻲ": "Tripoli",
      "ﻋﻠﻲ ﻋﺒﺪاﻟﺤﻠﻴﻢ اﻻﻳﻮﺑﻲ": "Tripoli",
      "ﺧﺎﻟﺪ ﺣﻤﺪ ﻣﺮﻋﻲ": "Tripoli",
      "ﺷﻴﺒﺎن ﻓﻮاد ﻫﻴﻜﻞ": "Tripoli",
      "ﻃﻮﻧﻲ اﺑﺮاﻫﻴﻢ ﺷﺎﻫﻴﻦ": "Tripoli",
      "ﺑﺪر ﺣﺴﻴﻦ ﻋﻴﺪ": "Tripoli",
      "ﺳﺎﻣﻲ اﺣﻤﺪ ﺷﻮﻗﻲ ﻓﺘﻔﺖ": "Dinnieh",
      "ﻋﺒﺪ اﻟﻌﺰﻳﺰ اﺑﺮاﻫﻴﻢ اﻟﺼﻤﺪ": "Dinnieh",
      "اﺣﻤﺪ ﻣﺤﻤﻮد اﻟﺨﻴﺮ": "Minnieh",

      "راﻣﻲ ﺳﻌﺪ ﷲ ﻓﻨﺞ": "Tripoli",
      "اﻟﻌﻮﻳﻚﻣﺼﻄﻔﻰ ﻣﺤﻤﺪ": "Tripoli",
      "ﻫﻨﺪ ﻣﺤﻤﺪ اﻟﺼﻮﻓﻲ": "Tripoli",
      "زﻛﺮﻳﺎ اﺑﺮاﻫﻴﻢ ﻣﺴﻴﻜﻪ": "Tripoli",
      "ﻣﺎﻟﻚ ﻓﻴﺼﻞ ﻣﻮﻟﻮي": "Tripoli",
      "ﻛﻤﻴﻞ ﺳﻤﻴﺮ ﻣﻮراﻧﻲ": "Tripoli",
      "ﺣﻴﺪر آﺻﻒ ﻧﺎﺻﺮ": "Tripoli",
      "ﻏﺎﻟﺐ ﺧﻀﺮ ﻋﺜﻤﺎن": "Tripoli",
      "ﻣﺤﻤﺪ ﻧﻮر اﻟﺪﻳﻦ اﺣﻤﺪ ﻋﻠﻲ ﺧﻠﻴﻞ": "Tripoli",

      "ﻋﺒﺪ اﻟﻜﺮﻳﻢ ﻣﺤﻤﺪ ﻛﺒﺎره": "Tripoli",
      "اﻟﻴﺴﺎر ﺧﺎﻟﺪ ﻳﺴﻦ": "Tripoli",
      "وﻫﻴﺐ اﺣﻤﺪ ﻃﻄﺮ": "Tripoli",
      "ﺟﻼل ﻋﻠﻲ اﻟﺒﻘﺎر": "Tripoli",
      "ﻋﻔﺮاء ﻣﺤﻤﺪ ﻋﻴﺪ": "Tripoli",
      "ﻋﻠﻲ اﺣﻤﺪ دروﻳﺶ": "Tripoli",
      "ﺳﻠﻴﻤﺎن ﺟﺎن ﻋﺒﻴﺪ": "Tripoli",
      "ﻗﻴﺼﺮ ﻓﻴﻜﺘﻮر ﺧﻼط": "Tripoli",
      "ﺑﺮاء اﺳﻌﺪ ﻫﺮﻣﻮش": "Dinnieh",
      "ﻋﻠﻲ اﺣﻤﺪ ﻋﺒﺪ اﻟﻌﺰﻳﺰ": "Tripoli",
      "ﻛﺎﻇﻢ ﺻﺎﻟﺢ ﺧﻴﺮ": "Minnieh"
    }
  },
  "north-iii": {
    minorDistrictByCandidateName: {
      "ﻟﻴﺎل ﺳﻤﻌﺎن ﺑﻮ ﻣﻮﺳﻰ": "Batroun",
      "رﺑﻴﻊ ﺟﺮﺟﺲ اﻟﺸﺎﻋﺮ": "Batroun",
      "رﻳﺎض ﻣﻄﺎﻧﻴﻮس ﻃﻮق": "Bcharre",
      "ﻗﺰﺣﻴﺎ اﻟﻴﺎس ﺳﺎﺳﻴﻦ": "Bcharre",
      "ﺷﺎدن اﻟﻴﺎس اﻟﻀﻌﻴﻒ": "Zgharta",
      "ﺟﻴﺴﺘﺎل رﻳﻤﻮن ﺳﻤﻌﺎن": "Zgharta",
      "ﻣﻴﺸﺎل ﺷﻮﻗﻲ اﻟﺪوﻳﻬﻲ": "Zgharta",
      "ﺳﻤﻌﺎن ﺧﻠﻴﻞ اﻟﺒﺸﻮاﺗﻲ": "Koura",
      "ﺟﻬﺎد ﻧﺼﺮ ﻓﺮح": "Koura",
      "ﻓﺪوى ﻓﺎﻳﺰ ﻧﺎﺻﻴﻒ": "Koura",

      "ﺳﺘﺮﻳﺪا اﻟﻴﺎس ﻃﻮق": "Bcharre",
      "ﺟﻮزاف ﺟﺮﺟﺲ اﺳﺤﻖ": "Bcharre",
      "ﻣﺨﺎﻳﻞ ﺳﺮﻛﻴﺲ اﻟﺪوﻳﻬﻲ": "Zgharta",
      "ﻣﺎﻏﻲ اﻧﻄﻮن ﻃﻮﺑﻴﺎ": "Zgharta",
      "ﻓﺆاد ﺷﺎﻣﻞ ﺑﻮﻟﺲ": "Zgharta",
      "ﻓﺎدي ﻋﺒﺪﷲ ﻛﺮم": "Koura",
      "ﺳﺎﻣﻲ ﺣﺒﻴﺐ رﻳﺤﺎﻧﺎ": "Koura",
      "راﻣﻲ اﺳﻜﻨﺪر ﺳﻠﻮم": "Koura",
      "ﻏﻴﺎث ﻣﻴﺸﺎل ﻣﻴﺸﺎل ﻳﺰﺑﻚ": "Batroun",
      "ﻟﻴﺎل ﻃﻮﻧﻲ ﻧﻌﻤﻪ": "Batroun",

      "ﻣﺠﺪ ﺑﻄﺮس اﻟﺨﻮري ﺣﺮب": "Batroun",
      "ﺟﻮال ﻣﻴﺸﺎل اﻟﺤﻮﻳﻚ": "Batroun",
      "ادﻳﺐ ﺟﺮﺟﺲ ﻋﺒﺪ اﻟﻤﺴﻴﺢ": "Koura",
      "اﻣﻴﻞ رﺷﺎد ﻓﻴﺎض": "Koura",
      "ﺑﺮﻳﺠﻴﺖ ﺑﻨﻴﺎﻣﻴﻦ ﺧﻴﺮ": "Koura",
      "رﺷﻴﺪ ﻧﺠﻴﺐ ﺧﻠﻴﻔﻪ رﺣﻤﻪ": "Bcharre",
      "ﻃﻮﻧﻲ اﻟﻴﺎس اﻟﻤﺎردﻳﻨﻲ": "Zgharta",
      "ﺟﻮاد ﺳﻴﻤﻮن ﺑﻮﻟﺲ": "Zgharta",
      "ﻣﻴﺸﺎل راﻧﻪ ﻣﻌﻮض": "Zgharta",

      "ﻣﺎرون اﻧﻄﻮﻧﻴﻮس ﻣﺤﻔﻮض": "Zgharta",
      "ﻣﻴﺮي ﺟﻮ ﻣﻴﺸﺎل ﻣﻄﺮ": "Bcharre",
      "اﻧﻴﺲ ﻓﻮزي ﻧﻌﻤﻪ": "Koura",
      "ﺑﺎﺳﻢ ﻣﻴﺸﺎل ﺻﻨﻴﺞ": "Koura",
      "زاﻧﻪ ﻋﺒﺪﷲ اﻟﻨﺒﺘﻲ": "Koura",
      "ﺟﺎن اﻧﻄﻮن ﺧﻴﺮ ﷲ": "Batroun",

      "ﻣﻴﺮﻧﺎ ﺷﺮﺑﻞ اﻟﺨﻮري ﺣﻨﺎ": "Batroun",
      "ﺟﻮرج ﺑﺪوي ﺑﻄﺮس": "Bcharre",
      "اﻧﻄﻮان ﻳﻮﺳﻒ ﻳﻤﻴﻦ": "Zgharta",
      "ﺑﺴﺎم ﻧﺪﻳﻢ ﻏﻨﻄﻮس": "Koura",
      "ﻣﻮﺳﻰ ﻧﻘﻮﻻ ﻟﻮﻗﺎ": "Koura",

      "اﺳﻄﻔﺎن ﺑﻄﺮس اﻟﺪوﻳﻬﻲ": "Zgharta",
      "ﻃﻮﻧﻲ ﺳﻠﻴﻤﺎن ﻓﺮﻧﺠﻴﻪ": "Zgharta",
      "ﻛﺎرول ادﻣﻮن دﺣﺪح": "Zgharta",
      "روي ﺑﻬﺠﺖ ﻋﻴﺴﻰ اﻟﺨﻮري": "Bcharre",
      "ﻣﻠﺤﻢ ﺟﺒﺮان ﻃﻮق": "Bcharre",
      "ﺳﻠﻴﻢ ﻋﺒﺪﷲ ﺳﻌﺎده": "Koura",
      "ﻓﺎدي ﻣﻴﺸﺎل ﻏﺼﻦ": "Koura",
      "ﺟﻮزف ﻣﻴﺸﺎل ﻧﺠﻢ": "Batroun",

      "ﺟﺒﺮان ﺟﺮﺟﻲ ﺑﺎﺳﻴﻞ": "Batroun",
      "وﻟﻴﺪ ﺟﺮﺟﺲ ﺣﺮب": "Batroun",
      "ﻃﻮﻧﻲ ﺟﻮرج ﻣﺘﻰ": "Bcharre",
      "ﻧﻌﻴﻢ ﻋﻄﺎ ﷲﺟﻮرج": "Koura",
      "وﻟﻴﺪ ﺟﺮﺟﺲ اﻟﻌﺎزار": "Koura",
      "ﻏﺴﺎن ﺗﻮﻓﻴﻖ ﻛﺮم": "Koura",
      "ﺑﻴﺎر ﺟﺮﺟﺲ رﻓﻮل": "Zgharta"
    }
  },
  "mount-lebanon-i": {
    minorDistrictByCandidateName: {
      "ﺷﻮﻗﻲ ﺟﺮﺟﻲ اﻟﺪﻛﺎش": "Keserwan",
      "اﻧﻄﻮان زﺧﻴﺎ ﺻﻔﻴﺮ": "Jbeil",
      "ﻛﺎرن ﺑﻴﺎﺗﺮﻳﺲ رﻳﻤﻮن اﻟﺒﺴﺘﺎﻧﻲ": "Keserwan",
      "ﺷﺎدي ﻧﺼﺮ ﷲ ﻓﻴﺎض": "Keserwan",
      "ﺟﻮ ﺳﺎﻣﻲ رﻋﻴﺪي": "Keserwan",
      "زﻳﺎد ﺣﻠﻴﻢ اﻟﺤﻮاط": "Jbeil",
      "ﺣﺒﻴﺐ ﺑﻄﺮس ﺑﺮﻛﺎت": "Keserwan",
      "ﻣﺤﻤﻮد اﺑﺮاﻫﻴﻢ ﻋﻮاد": "Jbeil",

      "ﻓﺮﻳﺪ ﻫﻴﻜﻞ اﻟﺨﺎزن": "Keserwan",
      "ﺷﺎﻣﻞ رﺷﻴﺪ روﻛﺰ": "Keserwan",
      "ﺷﺎﻛﺮ اﻟﻴﺎس ﺳﻼﻣﻪ": "Keserwan",
      "ﺳﻠﻴﻢ ﺳﻤﻴﺮ ﻫﺎﻧﻲ": "Keserwan",
      "ﺗﻮﻓﻴﻖ ﺟﺎن ﺳﻠﻮم": "Keserwan",
      "اﻣﻴﻞ ﺑﻄﺮس ﻧﻮﻓﻞ": "Jbeil",
      "ﻃﻮﻧﻲ ﻳﻮﺳﻒ ﺧﻴﺮﷲ": "Jbeil",
      "اﺣﻤﺪ ﻫﺎﻧﻲ اﻟﻤﻘﺪاد": "Jbeil",

      "ﻧﻌﻤﻪ ﺟﻮرج اﻓﺮام": "Keserwan",
      "ﺳﻠﻴﻢ ﺑﻄﺮس اﻟﺼﺎﻳﻎ": "Keserwan",
      "ﺟﻮﻟﻲ ﻓﻮزي اﻟﺪﻛﺎش": "Keserwan",
      "وﺟﺪي ﺧﻠﻴﻞ ﺗﺎﺑﺖ": "Keserwan",
      "اﻧﻄﻮان زﻏﻴﺐﺟﻮزﻓﻴﻦ": "Keserwan",
      "ﻧﺠﻮى ﻓﻴﻜﺘﻮر ﺑﺎﺳﻴﻞ": "Jbeil",
      "اﻣﻴﺮ ﻣﺤﻤﺪ ﻋﺒﺪ اﻟﻜﺮﻳﻢ اﻟﻤﻘﺪاد": "Jbeil",
      "ﻧﻮﻓﻞ ﻳﻮﺳﻒ ﻧﻮﻓﻞ": "Jbeil",

      "ﻏﺎﻧﻢ اﻟﺒﻮنﻣﻨﺼﻮر ﻓﺆاد": "Keserwan",
      "ﺑﻬﺠﺖ اﻧﻄﻮان ﺳﻼﻣﻪ": "Keserwan",
      "ﻣﻮﺳﻲ ﻣﻨﺼﻮر زﻏﻴﺐ": "Keserwan",
      "ﻓﺎرس اﻧﻄﻮن ﺳﻌﻴﺪ": "Jbeil",
      "اﺳﻌﺪ ﺳﻠﻴﻢ رﺷﺪان": "Jbeil",
      "ﻣﺸﻬﻮر ﺣﺴﻦ ﺣﻴﺪر اﺣﻤﺪ": "Jbeil",

      "دوﻣﻴﻨﻴﻚ ﺑﻮﻟﺲ ﻃﺮﺑﻴﻪ": "Jbeil",
      "ﻓﺮح ﻛﺎﻣﻞ ﻧﺎﺻﺮ": "Jbeil",
      "ﺷﺮﺑﻞ ﻋﺎدل ﻓﺮﻳﺤﻪ": "Keserwan",
      "ﺑﻄﺮس اﻟﻴﺎس ﺧﻠﻴﻞ": "Jbeil",

      "ﻧﺪى ﻧﻬﺎد اﻟﺒﺴﺘﺎﻧﻲ": "Keserwan",
      "ﻃﻮﻧﻲ وﻫﺒﻪ اﻟﻜﺮﻳﺪي": "Keserwan",
      "رﺑﻴﻊ ﻣﻮﺳﻲ زﻏﻴﺐ": "Keserwan",
      "وﺳﻴﻢ راﻣﺢ ﺳﻼﻣﻪ": "Keserwan",
      "ﻋﻤﺎد ﺷﺮﺑﻞ ﻋﺎزار": "Keserwan",
      "ﺳﻴﻤﻮن ﻓﺮﻳﺪ اﺑﻲ رﻣﻴﺎ": "Jbeil",
      "وﻟﻴﺪ ﻧﺠﻴﺐ اﻟﺨﻮري": "Jbeil",
      "راﺋﺪ ﻋﻜﻴﻒ ﺑﺮّو": "Jbeil",

      "ﻃﻼل ﻣﺤﺴﻦ ﻣﻘﺪاد": "Jbeil",
      "ﻏﺴﺎن ﻏﺎزي ﻳﻮﺳﻒ ﺟﺮﻣﺎﻧﻮس": "Keserwan",
      "راﻧﻴﺎ ﻓﻴﻜﺘﻮر ﺑﺎﺳﻴﻞ": "Jbeil",
      "زﻳﻨﻪ ﺟﻮزاف اﻟﻜﻼًب": "Keserwan",
      "ﺳﻴﻤﻮن ﺣﺒﻴﺐ ﺻﻔﻴﺮ": "Jbeil"
    }
  },
  "mount-lebanon-iv": {
    minorDistrictByCandidateName: {
      "ﺗﻴﻤﻮر وﻟﻴﺪ ﺟﻨﺒﻼط": "Chouf",
      "ﺟﻮرج ﺟﻤﻴﻞ ﻋﺪوان": "Chouf",
      "ﻣﺮوان ﻣﺤﻤﺪ ﺣﻤﺎده": "Chouf",
      "ﺑﻼل اﺣﻤﺪ ﻋﺒﺪ ﷲ": "Chouf",
      "ﺳﻌﺪ اﻟﺪﻳﻦ وﺳﻴﻢ اﻟﺨﻄﻴﺐ": "Chouf",
      "ﺣﺒﻮﺑﻪ ﻳﻮﺳﻒ ﻋﻮن": "Aley",
      "اﻳﻠﻲ ﻣﺨﺎﻳﻞ ﻗﺮداﺣﻲ": "Chouf",
      "ﻓﺎدي ﻓﺎرس اﻟﻤﻌﻠﻮف": "Chouf",
      "اﻛﺮم ﺣﺴﻴﻦ ﺷﻬﻴﺐ": "Aley",
      "ﻧﺰﻳﻪ اﻣﻴﻦ ﻣﺘﻰ": "Aley",
      "راﺟﻲ ﻧﺠﻴﺐ اﻟﺴﻌﺪ": "Aley",
      "ﺟﻮال ﺟﻮزاف ﻓﻀﻮل": "Chouf",

      "ﻋﻤﺎد ﻣﺎرون اﻟﺤﺎج اﻟﻤﻠﻘﺐ ﺑﺎﻟﻤﻌﻠﻢ": "Aley",
      "وﺳﻴﻢ ﻋﻔﻴﻒ ﺣﻴﺪر": "Aley",
      "راﺋﺪ زﻳﺎد ﻋﺒﺪ اﻟﺨﺎﻟﻖ": "Chouf",
      "ﻣﺤﻤﺪ ﺳﺎﻣﻲ اﻟﺤﺠﺎر": "Chouf",
      "ﺳﻤﻴﺮ ﺣﺴﻦ ﻋﺎﻛﻮم": "Chouf",
      "ﻛﺎﺑﻲ اﻟﻴﺎس اﻟﻘﺰي": "Chouf",
      "ﺟﻬﺎد ﻧﺒﻴﻞ ذﺑﻴﺎن": "Aley",
      "ﺟﻤﺎل اﻧﻄﻮان ﻣﺮﻫﺞ": "Chouf",
      "ﻣﻴﺸﺎل ﺧﻠﻴﻞ اﺑﻮ ﺳﻠﻴﻤﺎن": "Aley",
      "ﻣﻌﻀﺎد ﺣﺴﻦ اﺑﻮ ﻋﻠﻲ": "Chouf",

      "اﻻﻣﻴﺮ ﻃﻼل اﻻﻣﻴﺮ ﻣﺠﻴﺪ ارﺳﻼن": "Aley",
      "ﺳﻴﺰار رﻳﻤﻮن اﺑﻲ ﺧﻠﻴﻞ": "Aley",
      "ﻃﺎرق وﻟﻴﺪ ﺧﻴﺮ ﷲ": "Aley",
      "اﻧﻄﻮان ﻣﻴﺸﺎل ﺑﺴﺘﺎﻧﻲ": "Aley",
      "ﻧﺎﺟﻲ ﻧﺒﻴﻪ اﻟﺒﺴﺘﺎﻧﻲ": "Chouf",
      "وﺋﺎم ﻣﺎﻫﺮ ﻧﺠﻴﺐ وﻫﺎب": "Chouf",
      "ﻏﺴﺎن اﻣﺎل ﻋﻄﺎ ﷲ": "Chouf",
      "ﻓﺮﻳﺪ ﺟﻮرج ﻓﻴﻠﻴﺐ اﻟﺒﺴﺘﺎﻧﻲ": "Chouf",
      "اﺣﻤﺪ ﺣﻠﻤﻲ ﻧﺠﻢ اﻟﺪﻳﻦ": "Chouf",
      "اﺳﺎﻣﻪ ﻣﺤﻤﺪ اﻟﻤﻌﻮش": "Chouf",
      "اﻧﻄﻮان ﺑﺸﺎره ﻋﺒﻮد": "Chouf",

      "ﻧﻐﻢ ﻧﺎﺟﻲ اﻟﺤﻠﺒﻲ": "Chouf",
      "ﻣﺮوان ﻛﻤﻴﻞ ﻋﻤﺎد": "Aley",
      "ﺟﻮزف اﺳﻌﺪ ﻃﻌﻤﻪ": "Chouf",
      "اﻳﻤﻦ ﻏﺎزي زﻳﻦ اﻟﺪﻳﻦ": "Aley",
      "ﺧﺎﻟﺪ اﺑﺮاﻫﻴﻢ ﺳﻌﺪ": "Chouf",
      "ﻋﻤﺎد ﻣﺤﻤﺪ اﻟﻔﺮان": "Chouf",

      "ﻏﺎده ﻏﺎزي ﻣﺎروﻧﻲ ﻋﻴﺪ": "Chouf",
      "ﻧﺠﺎة ﺧﻄﺎر ﻋﻮن": "Chouf",
      "راﻧﻴﻪ ﻋﺎدل ﻏﻴﺚ": "Chouf",
      "ﺻﻌﻮد ﻛﺮﻳﻢ اﺑﻮ ﺷﺒﻞ": "Chouf",
      "ﺣﻠﻴﻤﻪ اﺑﺮاﻫﻴﻢ اﻟﻘﻌﻘﻮر": "Chouf",
      "ﻋﻤﺎد وﻓﻴﻖ ﺳﻴﻒ اﻟﺪﻳﻦ": "Chouf",
      "ﺷﻜﺮي ﻳﻮﺳﻒ ﺣﺪاد": "Chouf",
      "زوﻳﺎ ﻧﺠﻴﺐ ﺟﺮﻳﺪﻳﻨﻲ": "Aley",
      "ﻣﺎرك ﺑﻬﺠﺎت ﺿﻮ": "Aley",
      "ﻋﻼء اﻧﻮر اﻟﺼﺎﻳﻎ": "Aley",
      "ﻓﺎدي ﻓﺎﻳﺰ اﺑﻲ ﻋﻼم": "Chouf",
      "اﻧﻄﻮن ﺑﺠﺎﻧﻲﺟﺎد": "Aley",

      "دﻋﺪ ﻧﺎﺻﻴﻒ اﻟﻘﺰي": "Chouf",
      "ﻣﺤﻤﺪ ﻋﻤﺎر اﺑﺮاﻫﻴﻢ اﻟﺸﻤﻌﻪ": "Chouf",
      "ﺟﻮﻳﺲ ﺟﻮزف ﻣﺎرون": "Aley",
      "ﻣﺄﻣﻮن اﺣﻤﺪ اﻟﻤﺄﻣﻮن ﻣﻠﻚ": "Chouf",
      "ﻫﺸﺎم ﻋﺰات ذﺑﻴﺎن": "Aley",
      "ﺟﻮرج ادوار ﺳﻠﻮان": "Chouf",
      "ﻋﻄﺎﻟﻠﻪ ﻛﺎﻣﻞ وﻫﺒﻲ": "Chouf",
      "ﻧﺒﻴﻞ ادﻣﻮن ﻳﺰﺑﻚ": "Aley",
      "وﻟﻴﺪ ﺟﺎن ﺷﺎﻫﻴﻦ": "Aley",

      "زﻳﻨﻪ ﺷﻮﻗﻲ ﻣﻨﺼﻮر": "Aley",
      "ﻧﺒﻴﻞ ﺧﻠﻴﻞ ﻣﺸﻨﺘﻒ": "Chouf",
      "ﻋﺒﺪ ﷲ ﻳﻮﺳﻒ اﺑﻮ ﻋﺒﺪ ﷲ": "Chouf",
      "اﻛﺮم ﻋﻠﻲ ﺑﺮﻳﺶ": "Aley",
      "ﻟﻴﻮن ﺳﻮرﻳﻦ ﺳﻴﻮﻓﻲ": "Aley",
      "ﺗﺎﺑﺖ ﺟﻮرج ﺗﺎﺑﺖ": "Aley",
      "ﺳﻠﻤﺎن ﻓﺆاد ﻋﺒﺪ اﻟﺨﺎﻟﻖ": "Chouf",
      "ﻣﺤﺴﻦ ﻓﺮﺣﺎن اﻟﻌﺮﻳﻀﻲ": "Chouf"
    }
  }
};

const quotaOverrides2022ByTemplateId = {
  "south-i": [
    { sect: "Sunni", seats: 2, minorDistrict: "Saida" },
    { sect: "Maronite", seats: 2, minorDistrict: "Jezzine" },
    { sect: "Greek Catholic", seats: 1, minorDistrict: "Jezzine" }
  ],
  "south-ii": [
    { sect: "Shia", seats: 4, minorDistrict: "Tyre" },
    { sect: "Shia", seats: 2, minorDistrict: "Zahrani" },
    { sect: "Greek Catholic", seats: 1, minorDistrict: "Zahrani" }
  ],
  "south-iii": [
    { sect: "Shia", seats: 3, minorDistrict: "Nabatieh" },
    { sect: "Shia", seats: 3, minorDistrict: "Bint Jbeil" },
    { sect: "Shia", seats: 1, minorDistrict: "Marjeyoun" },
    { sect: "Shia", seats: 1, minorDistrict: "Hasbaya" },
    { sect: "Sunni", seats: 1, minorDistrict: "Hasbaya" },
    { sect: "Druze", seats: 1, minorDistrict: "Hasbaya" },
    { sect: "Greek Orthodox", seats: 1, minorDistrict: "Marjeyoun" }
  ],
  "bekaa-ii": [
    { sect: "Sunni", seats: 2, minorDistrict: "West Bekaa" },
    { sect: "Shia", seats: 1, minorDistrict: "West Bekaa" },
    { sect: "Greek Orthodox", seats: 1, minorDistrict: "West Bekaa" },
    { sect: "Druze", seats: 1, minorDistrict: "Rashaya" },
    { sect: "Maronite", seats: 1, minorDistrict: "Rashaya" }
  ],
  "north-ii": [
    { sect: "Sunni", seats: 5, minorDistrict: "Tripoli" },
    { sect: "Sunni", seats: 2, minorDistrict: "Dinnieh" },
    { sect: "Sunni", seats: 1, minorDistrict: "Minnieh" },
    { sect: "Alawite", seats: 1, minorDistrict: "Tripoli" },
    { sect: "Maronite", seats: 1, minorDistrict: "Tripoli" },
    { sect: "Greek Orthodox", seats: 1, minorDistrict: "Tripoli" }
  ],
  "north-iii": [
    { sect: "Maronite", seats: 2, minorDistrict: "Batroun" },
    { sect: "Maronite", seats: 2, minorDistrict: "Bcharre" },
    { sect: "Maronite", seats: 3, minorDistrict: "Zgharta" },
    { sect: "Greek Orthodox", seats: 3, minorDistrict: "Koura" }
  ],
  "mount-lebanon-i": [
    { sect: "Maronite", seats: 5, minorDistrict: "Keserwan" },
    { sect: "Maronite", seats: 2, minorDistrict: "Jbeil" },
    { sect: "Shia", seats: 1, minorDistrict: "Jbeil" }
  ],
  "mount-lebanon-iv": [
    { sect: "Druze", seats: 2, minorDistrict: "Aley" },
    { sect: "Druze", seats: 2, minorDistrict: "Chouf" },
    { sect: "Maronite", seats: 2, minorDistrict: "Aley" },
    { sect: "Maronite", seats: 3, minorDistrict: "Chouf" },
    { sect: "Sunni", seats: 2, minorDistrict: "Chouf" },
    { sect: "Greek Orthodox", seats: 1, minorDistrict: "Aley" },
    { sect: "Greek Catholic", seats: 1, minorDistrict: "Chouf" }
  ]
};

const generatedElectionResults2022ByTemplateIdWithOverrides = Object.fromEntries(
  Object.entries(generatedElectionResults2022ByTemplateId).map(([templateId, baseline]) => {
    const override = generatedListVoteOverrides2022ByTemplateId[templateId];
    const candidateOverride = generatedCandidateOverrides2022ByTemplateId[templateId];
    const candidates = candidateOverride?.minorDistrictByCandidateName
      ? (Array.isArray(baseline.candidates) ? baseline.candidates : []).map((candidate) => ({
          ...candidate,
          minorDistrict: candidateOverride.minorDistrictByCandidateName[candidate.name] ?? candidate.minorDistrict
        }))
      : baseline.candidates;

    if (!override) {
      return [
        templateId,
        {
          ...baseline,
          candidates
        }
      ];
    }
    return [
      templateId,
      {
        ...baseline,
        candidates,
        ...override
      }
    ];
  })
);

const electionResults2022ByTemplateId = {
  ...generatedElectionResults2022ByTemplateIdWithOverrides,
  ...manualElectionResults2022ByTemplateId
};

const electionResults2022DataVersion = hashVersionPayload(electionResults2022ByTemplateId);

export function hasElectionResults2022(templateId) {
  return Boolean(templateId && electionResults2022ByTemplateId[templateId]);
}

export function getElectionResults2022DataVersion() {
  return electionResults2022DataVersion;
}

export function loadElectionResults2022(template) {
  const templateId = String(template?.id ?? "").trim();
  const baseline = electionResults2022ByTemplateId[templateId];
  if (!baseline) {
    return null;
  }

  const scenario = cloneTemplate(template);
  if (quotaOverrides2022ByTemplateId[templateId]) {
    scenario.quotas = quotaOverrides2022ByTemplateId[templateId].map((entry) => ({ ...entry }));
  }
  scenario.candidates = normalizeElectionBaseline(template, baseline.candidates, "2022 Imported List");
  scenario.listVotes = normalizeElectionBaselineListVotes(scenario.candidates, baseline.listVotes);
  scenario.blankVotes = getBlankVotes(2022, templateId);
  scenario.invalidVotes = getInvalidVotes(2022, templateId);

  return scenario;
}

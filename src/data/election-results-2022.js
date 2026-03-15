import { cloneTemplate } from "./templates.js";
import {
  normalizeElectionBaseline,
  normalizeElectionBaselineListVotes
} from "./election-results-normalize.js";
import generatedElectionResults2022ByTemplateId from "./election-results-2022.generated.json" with { type: "json" };

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
      { name: "روي ابراهيم", sect: "Minorities", list: "قادرين", votes: 396 },

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
      { name: "Ibrahim Samir Azar", sect: "Maronite", list: "Moderation Is our Strength", votes: 7894 },
      { name: "Youssef Hanna Skaff", sect: "Greek Catholic", list: "Moderation Is our Strength", votes: 108 },
      { name: "Nabil Mahmoud Eizzedine El Zaatari", sect: "Sunni", list: "Moderation Is our Strength", votes: 3242 },

      { name: "Abdel Rahman Nazih El Bizri", sect: "Sunni", list: "We Vote for Change", votes: 8526 },
      { name: "Osama Maarouf Saad El Masri", sect: "Sunni", list: "We Vote for Change", votes: 7341 },
      { name: "Charbel Maroun Massaad", sect: "Maronite", list: "We Vote for Change", votes: 984 },
      { name: "Kamil Farid Serhal", sect: "Maronite", list: "We Vote for Change", votes: 795 },
      { name: "Jamil Iskandar Dagher", sect: "Greek Catholic", list: "We Vote for Change", votes: 382 },

      { name: "Ghada Khalil Ayoub", sect: "Greek Catholic", list: "Our Unity in Saida and Jezzine", votes: 7953 },
      { name: "Youssef Mohamad El Naqib", sect: "Sunni", list: "Our Unity in Saida and Jezzine", votes: 4380 },
      { name: "Said Sleiman El Asmar", sect: "Maronite", list: "Our Unity in Saida and Jezzine", votes: 1102 },
      { name: "Wissam Youssef El Tawil", sect: "Maronite", list: "Our Unity in Saida and Jezzine", votes: 108 },

      { name: "Hania Hani Zaatari", sect: "Sunni", list: "We Are The Change", votes: 3028 },
      { name: "Mohamad Fadi El Zarif", sect: "Sunni", list: "We Are The Change", votes: 369 },
      { name: "Joseph Elias El Asmar", sect: "Maronite", list: "We Are The Change", votes: 570 },
      { name: "Sleiman Elias Malek", sect: "Maronite", list: "We Are The Change", votes: 424 },
      { name: "Robert Elias El Khoury", sect: "Greek Catholic", list: "We Are The Change", votes: 309 },

      { name: "Rana Walid El Tawil", sect: "Sunni", list: "The Voice of Change", votes: 79 },
      { name: "Mohamad Ali Jamil El Tahira", sect: "Sunni", list: "The Voice of Change", votes: 136 },
      { name: "Joseph Milad Youssef Metri", sect: "Greek Catholic", list: "The Voice of Change", votes: 82 },

      { name: "Ziad Michel Asouad", sect: "Maronite", list: "Together for Saida and Jezzine", votes: 3639 },
      { name: "Amal Hekmat Abou Zeid", sect: "Maronite", list: "Together for Saida and Jezzine", votes: 5184 },
      { name: "Selim Antoine Khoury", sect: "Greek Catholic", list: "Together for Saida and Jezzine", votes: 447 },
      { name: "Ali Sadek El Cheikh Amar", sect: "Sunni", list: "Together for Saida and Jezzine", votes: 77 },
      { name: "Mohamad Chaker Souheil El Qawas", sect: "Sunni", list: "Together for Saida and Jezzine", votes: 165 },

      { name: "Ahmad Mohamad Walid El Assi", sect: "Sunni", list: "Capable", votes: 338 },
      { name: "Ismail Mohamad Dib Haffouda", sect: "Sunni", list: "Capable", votes: 40 },
      { name: "Emilio Toni Matar", sect: "Maronite", list: "Capable", votes: 210 },
      { name: "Elie Youssef Abou Tas", sect: "Maronite", list: "Capable", votes: 442 }
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
      { name: "نبيه مصطفى بري", sect: "Shia", list: "الأمل و الوفاء", votes: 42091 },
      { name: "علي عادل عسيران", sect: "Shia", list: "الأمل و الوفاء", votes: 2294 },
      { name: "ميشال حنا موسى", sect: "Greek Catholic", list: "الأمل و الوفاء", votes: 1364 },
      { name: "حسن محمد علي عز الدين", sect: "Shia", list: "الأمل و الوفاء", votes: 27927 },
      { name: "علي يوسف خريس", sect: "Shia", list: "الأمل و الوفاء", votes: 16964 },
      { name: "حسين سعيد جشي", sect: "Shia", list: "الأمل و الوفاء", votes: 27416 },
      { name: "عنايه محمد عز الدين", sect: "Shia", list: "الأمل و الوفاء", votes: 15266 },

      { name: "حسن احمد حسن خليل", sect: "Shia", list: "الدولة الحاضنة", votes: 816 },
      { name: "بشرا ايوب خليل", sect: "Shia", list: "الدولة الحاضنة", votes: 2476 },
      { name: "رياض سعيد الاسعد", sect: "Shia", list: "الدولة الحاضنة", votes: 1945 },
      { name: "يوسف مصطفى خليفه", sect: "Shia", list: "الدولة الحاضنة", votes: 709 },

      { name: "حاتم فوزي حلاوي", sect: "Shia", list: "معاً للتغيير", votes: 1649 },
      { name: "ساره علي سويدان", sect: "Shia", list: "معاً للتغيير", votes: 834 },
      { name: "محمد يوسف ايوب", sect: "Shia", list: "معاً للتغيير", votes: 195 },
      { name: "رؤى بشير الفارس", sect: "Shia", list: "معاً للتغيير", votes: 1088 },
      { name: "هشام بولص حايك", sect: "Greek Catholic", list: "معاً للتغيير", votes: 3987 },
      { name: "علي محمد خليفه", sect: "Shia", list: "معاً للتغيير", votes: 595 },
      { name: "ايمن محمود مروه", sect: "Shia", list: "معاً للتغيير", votes: 656 },

      { name: "قاسم سليمان داوود", sect: "Shia", list: "القرار الحر", votes: 208 },
      { name: "داوود علي فرج", sect: "Shia", list: "القرار الحر", votes: 320 },
      { name: "روبار ملحم كنعان", sect: "Greek Catholic", list: "القرار الحر", votes: 4238 }
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
      { name: "محمد حسن رعد", sect: "Shia", list: "الأمل و الوفاء", votes: 48543 },
      { name: "هاني حسن قبيسي", sect: "Shia", list: "الأمل و الوفاء", votes: 20195 },
      { name: "ناصر فوزي جابر", sect: "Shia", list: "الأمل و الوفاء", votes: 6236 },
      { name: "علي حسن خليل", sect: "Shia", list: "الأمل و الوفاء", votes: 13155 },
      { name: "علي رشيد فياض", sect: "Shia", list: "الأمل و الوفاء", votes: 37047 },
      { name: "قاسم عمر هاشم", sect: "Sunni", list: "الأمل و الوفاء", votes: 1215 },
      { name: "مروان سليم خير الدين", sect: "Druze", list: "الأمل و الوفاء", votes: 2634 },
      { name: "اسعد حليم حردان", sect: "Greek Orthodox", list: "الأمل و الوفاء", votes: 1859 },
      { name: "حسن نظام الدين فضل الله", sect: "Shia", list: "الأمل و الوفاء", votes: 43324 },
      { name: "ايوب فهد حميد", sect: "Shia", list: "الأمل و الوفاء", votes: 6745 },
      { name: "اشرف نزيه هاشم بيضون", sect: "Shia", list: "الأمل و الوفاء", votes: 10540 },

      { name: "علي حسن وهبي", sect: "Shia", list: "معاً نحو التغيير", votes: 1806 },
      { name: "وسيم فؤاد غندور", sect: "Shia", list: "معاً نحو التغيير", votes: 2206 },
      { name: "وفيق خضر ريحان", sect: "Shia", list: "معاً نحو التغيير", votes: 3071 },
      { name: "حسن عادل جابر بزي", sect: "Shia", list: "معاً نحو التغيير", votes: 1354 },
      { name: "خليل حسن ذيب", sect: "Shia", list: "معاً نحو التغيير", votes: 417 },
      { name: "علي احمد مراد", sect: "Shia", list: "معاً نحو التغيير", votes: 2960 },
      { name: "ابراهيم محمود عبد الله", sect: "Shia", list: "معاً نحو التغيير", votes: 651 },
      { name: "الياس فارس جراده", sect: "Greek Orthodox", list: "معاً نحو التغيير", votes: 9218 },
      { name: "فراس اسماعيل حمدان", sect: "Druze", list: "معاً نحو التغيير", votes: 4859 },
      { name: "محمد عبد اللطيف قعدان", sect: "Sunni", list: "معاً نحو التغيير", votes: 1059 },
      { name: "نزار ابراهيم رمال", sect: "Shia", list: "معاً نحو التغيير", votes: 465 },

      { name: "عباس محمد شرف الدين", sect: "Shia", list: "صوت الجنوب", votes: 74 },
      { name: "كريم علي حمدان", sect: "Druze", list: "صوت الجنوب", votes: 7 },
      { name: "رياض حسين عيسى", sect: "Sunni", list: "صوت الجنوب", votes: 18 },
      { name: "محمود حسن شعيب", sect: "Shia", list: "صوت الجنوب", votes: 48 },
      { name: "حسين جهاد الشاعر", sect: "Shia", list: "صوت الجنوب", votes: 192 }
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
      { list: "اﻟﺤﺮﻳﺔ ﻗﺮار", votes: 354 }
    ]
  },
  "mount-lebanon-ii": {
    listVotes: [
      { list: "ﻣﺘﻦ اﻟﺤﺮﻳّﺔ", votes: 449 },
      { list: "ﻣﻌﺎً اﻗﻮى", votes: 548 },
      { list: "ﻣﺘﻦ اﻟﺘﻐﻴﻴﺮ", votes: 764 },
      { list: "ﻧﺤﻮ اﻟﺪوﻟﺔ", votes: 269 },
      { list: "ﻛﻨﺎ ورح ﻧﺒﻘﻰ ﻟﻠﻤﺘﻦ", votes: 470 }
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
      { list: "ﻓﺠﺮ اﻟﺘﻐﻴﻴﺮ", votes: 66 },
      { list: "اﻹﺳﺘﻘﺮار واﻹﻧﻤﺎء", votes: 55 },
      { list: "ﻗﺎدرﻳﻦ", votes: 191 }
    ]
  },
  "north-iii": {
    listVotes: [
      { list: "ﺷﻤﺎل اﻟﻤﻮاﺟﻬﺔ", votes: 605 },
      { list: "رح ﻧﺒﻘﻰ ﻫﻮن", votes: 574 }
    ]
  }
};

const generatedElectionResults2022ByTemplateIdWithOverrides = Object.fromEntries(
  Object.entries(generatedElectionResults2022ByTemplateId).map(([templateId, baseline]) => {
    const override = generatedListVoteOverrides2022ByTemplateId[templateId];
    if (!override) {
      return [templateId, baseline];
    }
    return [
      templateId,
      {
        ...baseline,
        ...override
      }
    ];
  })
);

const electionResults2022ByTemplateId = {
  ...generatedElectionResults2022ByTemplateIdWithOverrides,
  ...manualElectionResults2022ByTemplateId
};

export function hasElectionResults2022(templateId) {
  return Boolean(templateId && electionResults2022ByTemplateId[templateId]);
}

export function loadElectionResults2022(template) {
  const templateId = String(template?.id ?? "").trim();
  const baseline = electionResults2022ByTemplateId[templateId];
  if (!baseline) {
    return null;
  }

  const scenario = cloneTemplate(template);
  scenario.candidates = normalizeElectionBaseline(template, baseline.candidates, "2022 Imported List");
  scenario.listVotes = normalizeElectionBaselineListVotes(scenario.candidates, baseline.listVotes);

  return scenario;
}

import { cloneTemplate } from "./templates.js";
import {
  normalizeElectionBaseline,
  normalizeElectionBaselineListVotes
} from "./election-results-normalize.js";

function hashVersionPayload(value) {
  const json = JSON.stringify(value);
  let hash = 2166136261;

  for (let index = 0; index < json.length; index += 1) {
    hash ^= json.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return `v${(hash >>> 0).toString(16)}`;
}

const verifiedElectionResults2018ByTemplateId = {
  // Hand-cleaned from rendered page image of:
  // /Users/raji/Desktop/2018 Parliamentary Elections Results.pdf
  // Page 8, Bekaa 1 (Zahle)
  "bekaa-i": {
    candidates: [
      { name: "Michel Georges Daher", sect: "Greek Catholic", list: "Zahle for Everyone", votes: 9742 },
      { name: "Assem Fayez Araji", sect: "Sunni", list: "Zahle for Everyone", votes: 7224 },
      { name: "Salim Georges Aoun", sect: "Maronite", list: "Zahle for Everyone", votes: 5567 },
      { name: "Nizar Mohsen Dalloul", sect: "Shia", list: "Zahle for Everyone", votes: 3947 },
      { name: "Marie-Jeane Krikor Mahran Belazkjian", sect: "Armenian Orthodox", list: "Zahle for Everyone", votes: 3851 },
      { name: "Michel Michel El Skaff", sect: "Greek Catholic", list: "Zahle for Everyone", votes: 987 },
      { name: "Assad Charles Nakad", sect: "Greek Orthodox", list: "Zahle for Everyone", votes: 4138 },

      { name: "Anwar Hussein Joumaa", sect: "Shia", list: "Zahle Choice & Decision", votes: 15601 },
      { name: "Nicolas Michel Fattouch", sect: "Greek Catholic", list: "Zahle Choice & Decision", votes: 5737 },
      { name: "Wajih Mohamad Araji", sect: "Sunni", list: "Zahle Choice & Decision", votes: 592 },
      { name: "Nassif Elias El Tini", sect: "Greek Orthodox", list: "Zahle Choice & Decision", votes: 528 },
      { name: "Khalil Georges El Hraoui", sect: "Maronite", list: "Zahle Choice & Decision", votes: 343 },
      { name: "Eddy Bokhos Demerjian", sect: "Armenian Orthodox", list: "Zahle Choice & Decision", votes: 77 },

      { name: "Georges Elie Okais", sect: "Greek Catholic", list: "Zahle Our Cause", votes: 11363 },
      { name: "Cesar Naim Risk El Maalouf", sect: "Greek Orthodox", list: "Zahle Our Cause", votes: 3554 },
      { name: "Mohamad Ali Ahmad Mita", sect: "Sunni", list: "Zahle Our Cause", votes: 1370 },
      { name: "Elie Michel Marouni", sect: "Maronite", list: "Zahle Our Cause", votes: 1213 },
      { name: "Michel Elias Fatouch", sect: "Greek Catholic", list: "Zahle Our Cause", votes: 552 },
      { name: "Bokhos Herabt Kordian", sect: "Armenian Orthodox", list: "Zahle Our Cause", votes: 142 },
      { name: "Amer Mohamad El Sabouri", sect: "Shia", list: "Zahle Our Cause", votes: 111 },

      { name: "Myriam Gebran Taouk", sect: "Greek Catholic", list: "Popular Bloc", votes: 6348 },
      { name: "Kork Hamazasb Bouchkian", sect: "Armenian Orthodox", list: "Popular Bloc", votes: 1845 },
      { name: "Ahmad Abdo El Ajami", sect: "Sunni", list: "Popular Bloc", votes: 1008 },
      { name: "Paul Jean Charbel", sect: "Maronite", list: "Popular Bloc", votes: 824 },
      { name: "Nicolas Negib Saba", sect: "Greek Orthodox", list: "Popular Bloc", votes: 271 },
      { name: "Oussama Mohsen Salhab", sect: "Shia", list: "Popular Bloc", votes: 172 },
      { name: "Nicolas Nassif El Amouri El Maalouf", sect: "Greek Catholic", list: "Popular Bloc", votes: 95 },

      { name: "Ghassan Georges Maalouf", sect: "Greek Catholic", list: "Kulluna Watani", votes: 651 },
      { name: "Hanna Fawzi Habib", sect: "Maronite", list: "Kulluna Watani", votes: 287 },
      { name: "Vanda Edouard Chedid", sect: "Greek Orthodox", list: "Kulluna Watani", votes: 268 },
      { name: "Hod Nawaf El Taaymeh", sect: "Sunni", list: "Kulluna Watani", votes: 201 },
      { name: "Mohamad Abbass Hassan", sect: "Shia", list: "Kulluna Watani", votes: 71 }
    ]
  },

  // Hand-cleaned from:
  // /Users/raji/Desktop/2018 Parliamentary Elections Results.pdf
  // Page 27, Beirut 1
  "beirut-i": {
    listVotes: [
      { list: "We are Beirut", votes: 25 },
      { list: "Loyalty to Beirut", votes: 11 },
      { list: "Beirut One", votes: 348 },
      { list: "Strong Beirut One", votes: 323 },
      { list: "Kulluna Watani", votes: 144 }
    ],
    candidates: [
      { name: "Sibou Yeghya Mekhjian", sect: "Armenian Orthodox", list: "We are Beirut", votes: 564 },
      { name: "Michelle Gebran Tueini", sect: "Greek Orthodox", list: "We are Beirut", votes: 428 },
      { name: "Georges Raymond Sfeir", sect: "Maronite", list: "We are Beirut", votes: 40 },
      { name: "Serge Barge Torsarkissian", sect: "Armenian Catholic", list: "We are Beirut", votes: 43 },
      { name: "Rafik Gebrayel Bazerji", sect: "Minorities", list: "We are Beirut", votes: 172 },

      { name: "Antoine Joseph Kaladjian", sect: "Armenian Catholic", list: "Loyalty to Beirut", votes: 20 },
      { name: "Roger Amal Choueiry", sect: "Maronite", list: "Loyalty to Beirut", votes: 25 },
      { name: "Gina Jamil Al Shammas", sect: "Minorities", list: "Loyalty to Beirut", votes: 31 },
      { name: "Robert Abdo Abyad", sect: "Greek Orthodox", list: "Loyalty to Beirut", votes: 7 },

      { name: "Oweidis Baghos Dakasian", sect: "Armenian Orthodox", list: "Beirut One", votes: 437 },
      { name: "Riyad Amin Aakel", sect: "Minorities", list: "Beirut One", votes: 428 },
      { name: "Jean Arshak Talozian", sect: "Armenian Catholic", list: "Beirut One", votes: 4166 },
      { name: "Nadim Bachir Gemayel", sect: "Maronite", list: "Beirut One", votes: 4096 },
      { name: "Carole Nora Khadjik Babikian", sect: "Armenian Orthodox", list: "Beirut One", votes: 124 },
      { name: "Imad Naim Wakim", sect: "Greek Orthodox", list: "Beirut One", votes: 3936 },
      { name: "Alina Nishan Klonisian", sect: "Armenian Orthodox", list: "Beirut One", votes: 23 },
      { name: "Michel Pierre Pharoun", sect: "Greek Catholic", list: "Beirut One", votes: 3214 },

      { name: "Alexandre Abraham Matossian", sect: "Armenian Orthodox", list: "Strong Beirut One", votes: 2376 },
      { name: "Antoine Costantine Bano", sect: "Minorities", list: "Strong Beirut One", votes: 539 },
      { name: "Serge Hagop Jokhadarian", sect: "Armenian Catholic", list: "Strong Beirut One", votes: 717 },
      { name: "Massoud Joseph Al Ashkar", sect: "Maronite", list: "Strong Beirut One", votes: 3762 },
      { name: "Hagop Mardrios Hambarsom Terezian", sect: "Armenian Orthodox", list: "Strong Beirut One", votes: 3451 },
      { name: "Nicolas Elie Shammas", sect: "Greek Orthodox", list: "Strong Beirut One", votes: 851 },
      { name: "Sebouh Ohanes Kalbakian", sect: "Armenian Orthodox", list: "Strong Beirut One", votes: 1566 },
      { name: "Nicolas Maurice Sehnaoui", sect: "Greek Catholic", list: "Strong Beirut One", votes: 4788 },

      { name: "Paulette Sirakan Yacobian", sect: "Armenian Orthodox", list: "Kulluna Watani", votes: 2500 },
      { name: "Joumana Atallah Salloum", sect: "Minorities", list: "Kulluna Watani", votes: 431 },
      { name: "Yorki Maurice Teyrouz", sect: "Armenian Catholic", list: "Kulluna Watani", votes: 536 },
      { name: "Gilbert Georges Doumit", sect: "Maronite", list: "Kulluna Watani", votes: 1046 },
      { name: "Lori Garabet Hitayan", sect: "Armenian Orthodox", list: "Kulluna Watani", votes: 218 },
      { name: "Ziad Raymond Abes", sect: "Greek Orthodox", list: "Kulluna Watani", votes: 1525 },
      { name: "Levon Hosep Talfezban", sect: "Armenian Orthodox", list: "Kulluna Watani", votes: 114 },
      { name: "Lucien Gerges Bou Rjeili", sect: "Greek Catholic", list: "Kulluna Watani", votes: 328 }
    ]
  },

  // Hand-cleaned from rendered page images of:
  // /Users/raji/Desktop/2018 Parliamentary Elections Results.pdf
  // Pages 29-30, Beirut 2
  "beirut-ii": {
    listVotes: [
      { list: "Future for Beirut", votes: 2028 },
      { list: "Beirut's Unity", votes: 2621 },
      { list: "Lebanon is Worthy", votes: 832 },
      { list: "Beirut The Homeland", votes: 151 },
      { list: "Kulluna Beirut", votes: 205 },
      { list: "People's Voice", votes: 66 },
      { list: "Dignity of Beirut", votes: 50 },
      { list: "Beirutis Opposition", votes: 33 },
      { list: "Independent Beirutis", votes: 29 }
    ],
    candidates: [
      { name: "Saad Eddine Rafik Al Hariri", sect: "Sunni", list: "Future for Beirut", votes: 20751 },
      { name: "Ali Kamal Al Shaer", sect: "Shia", list: "Future for Beirut", votes: 2462 },
      { name: "Tamam Saeb Beik Salam", sect: "Sunni", list: "Future for Beirut", votes: 9599 },
      { name: "Nazih Nicolas Najem", sect: "Greek Orthodox", list: "Future for Beirut", votes: 2351 },
      { name: "Roula Nizar El Tabesh", sect: "Sunni", list: "Future for Beirut", votes: 6637 },
      { name: "Faisal Afif Al Sayegh", sect: "Druze", list: "Future for Beirut", votes: 1902 },
      { name: "Nouhad Saleh Al Mashnouk", sect: "Sunni", list: "Future for Beirut", votes: 6411 },
      { name: "Ghazi Ali Youssef", sect: "Shia", list: "Future for Beirut", votes: 1759 },
      { name: "Rabih Mohammad Hassouna", sect: "Sunni", list: "Future for Beirut", votes: 5825 },
      { name: "Bassem Al Doctor Ramze Al Shab", sect: "Evangelical", list: "Future for Beirut", votes: 735 },
      { name: "Zaher Walid Eido", sect: "Sunni", list: "Future for Beirut", votes: 2510 },

      { name: "Amin Mohammad Sharri", sect: "Shia", list: "Beirut's Unity", votes: 22961 },
      { name: "Omar Abdel Kader Ghandour", sect: "Sunni", list: "Beirut's Unity", votes: 329 },
      { name: "Adnan Khodor Traboulsi", sect: "Sunni", list: "Beirut's Unity", votes: 13018 },
      { name: "Mohammad Amin Anwar Baasiri", sect: "Sunni", list: "Beirut's Unity", votes: 205 },
      { name: "Mohammad Moutapha Khawaja", sect: "Shia", list: "Beirut's Unity", votes: 7834 },
      { name: "Edgard Joseph Traboulsi", sect: "Evangelical", list: "Beirut's Unity", votes: 119 },

      { name: "Fouad Moustapha Makhzoumi", sect: "Sunni", list: "Lebanon is Worthy", votes: 11346 },
      { name: "Nadim Ishayya Osta", sect: "Evangelical", list: "Lebanon is Worthy", votes: 169 },
      { name: "Khalil Emile Broumana", sect: "Greek Orthodox", list: "Lebanon is Worthy", votes: 1369 },
      { name: "Issam Bashir Barghout", sect: "Sunni", list: "Lebanon is Worthy", votes: 164 },
      { name: "Maarouf Mahmoud Itani", sect: "Sunni", list: "Lebanon is Worthy", votes: 632 },
      { name: "Zeina Kamal Menzer", sect: "Druze", list: "Lebanon is Worthy", votes: 237 },
      { name: "Saad Eddine Hassan Khaled", sect: "Sunni", list: "Lebanon is Worthy", votes: 572 },
      { name: "Youssef Mohammad Baydoun", sect: "Shia", list: "Lebanon is Worthy", votes: 221 },
      { name: "Rana Mohammad Samir El Shmaytli", sect: "Sunni", list: "Lebanon is Worthy", votes: 169 },
      { name: "Mahmoud Abdel Kader Kreidiyeh", sect: "Sunni", list: "Lebanon is Worthy", votes: 62 },

      { name: "Imad Medhat Al Hout", sect: "Sunni", list: "Beirut The Homeland", votes: 3938 },
      { name: "Saad Eddine Nemr Al Wazzan", sect: "Sunni", list: "Beirut The Homeland", votes: 321 },
      { name: "Mohammad Nabil Osman Bader", sect: "Sunni", list: "Beirut The Homeland", votes: 854 },
      { name: "Georges Ghassan Choucair", sect: "Greek Orthodox", list: "Beirut The Homeland", votes: 175 },
      { name: "Moustapha Bachir Banbok", sect: "Sunni", list: "Beirut The Homeland", votes: 699 },
      { name: "Dalal Halim Al Rahbani", sect: "Evangelical", list: "Beirut The Homeland", votes: 71 },
      { name: "Bashar Houssein Koatli", sect: "Sunni", list: "Beirut The Homeland", votes: 570 },
      { name: "Ibrahim Mohammad Mehdi Shamseddine", sect: "Shia", list: "Beirut The Homeland", votes: 62 },
      { name: "Salih Eddine Youssef Salam", sect: "Sunni", list: "Beirut The Homeland", votes: 308 },
      { name: "Salwa Aiyoub Khalil", sect: "Shia", list: "Beirut The Homeland", votes: 31 },
      { name: "Said Ali Halabi", sect: "Druze", list: "Beirut The Homeland", votes: 295 },

      { name: "Ibrahim Hassan Mneimneh", sect: "Sunni", list: "Kulluna Beirut", votes: 1676 },
      { name: "Nouhad Salim Yazbek", sect: "Evangelical", list: "Kulluna Beirut", votes: 633 },
      { name: "Zeina Nabih Majdalani", sect: "Greek Orthodox", list: "Kulluna Beirut", votes: 1218 },
      { name: "Fatme Ahmad Meshref", sect: "Sunni", list: "Kulluna Beirut", votes: 433 },
      { name: "Hassan Faisal Sinno", sect: "Sunni", list: "Kulluna Beirut", votes: 1174 },
      { name: "Marwan Walid Al Tibi", sect: "Sunni", list: "Kulluna Beirut", votes: 112 },
      { name: "Nadine Mahmoud Itani", sect: "Sunni", list: "Kulluna Beirut", votes: 612 },
      { name: "Naji Hussein Kdeih", sect: "Shia", list: "Kulluna Beirut", votes: 111 },

      { name: "Omar Najah Wakim", sect: "Greek Orthodox", list: "People's Voice", votes: 476 },
      { name: "Nabil Riyad Al Sebaali", sect: "Evangelical", list: "People's Voice", votes: 51 },
      { name: "Ibrahim Mohammad Al Halabi Al Dallal", sect: "Sunni", list: "People's Voice", votes: 195 },
      { name: "Hanan Ahmad Osman", sect: "Sunni", list: "People's Voice", votes: 57 },
      { name: "Neemat Hashem Badreddine", sect: "Shia", list: "People's Voice", votes: 153 },
      { name: "Roula Toufik Al Houry", sect: "Sunni", list: "People's Voice", votes: 54 },
      { name: "Youssef Abdel Qader Tabash", sect: "Sunni", list: "People's Voice", votes: 127 },
      { name: "Firas Abdel Rahman Mneimneh", sect: "Sunni", list: "People's Voice", votes: 40 },
      { name: "Hani Ramez Fayyad", sect: "Druze", list: "People's Voice", votes: 90 },
      { name: "Faten Faisal Zein", sect: "Sunni", list: "People's Voice", votes: 30 },

      { name: "Raja Rafik Zouheiry", sect: "Druze", list: "Dignity of Beirut", votes: 223 },
      { name: "Ali Hussein Sbeiti", sect: "Shia", list: "Dignity of Beirut", votes: 53 },
      { name: "Mohammad Nabil Shatila", sect: "Sunni", list: "Dignity of Beirut", votes: 227 },
      { name: "Jihad Hassan Al Ahmad Matar", sect: "Sunni", list: "Dignity of Beirut", votes: 52 },
      { name: "Mikhael Bahaa Mikhael", sect: "Greek Orthodox", list: "Dignity of Beirut", votes: 123 },
      { name: "Hanan Adnan Al Shaar", sect: "Sunni", list: "Dignity of Beirut", votes: 52 },
      { name: "Khaled Mahmoud Hammoud", sect: "Sunni", list: "Dignity of Beirut", votes: 90 },
      { name: "Khouloud Mouwafaq Al Wattar", sect: "Sunni", list: "Dignity of Beirut", votes: 24 },
      { name: "Mohammad Kheir Saleh Al Qadi", sect: "Sunni", list: "Dignity of Beirut", votes: 77 },

      { name: "Ziad Ghazi Itani", sect: "Sunni", list: "Beirutis Opposition", votes: 263 },
      { name: "Bechara Naim Khairallah", sect: "Greek Orthodox", list: "Beirutis Opposition", votes: 34 },
      { name: "Akram Mohammad Sinno", sect: "Sunni", list: "Beirutis Opposition", votes: 72 },
      { name: "Amer Ahmad Iskandarani", sect: "Sunni", list: "Beirutis Opposition", votes: 25 },
      { name: "Lina Mohammad Ali Hamdan", sect: "Shia", list: "Beirutis Opposition", votes: 58 },
      { name: "Zeina Shawki Mansour", sect: "Druze", list: "Beirutis Opposition", votes: 15 },
      { name: "Yassine Maarouf Kadado", sect: "Sunni", list: "Beirutis Opposition", votes: 46 },
      { name: "Safiya Maarouf Zaza", sect: "Sunni", list: "Beirutis Opposition", votes: 7 },

      { name: "Khaled Said Moumtaz", sect: "Sunni", list: "Independent Beirutis", votes: 108 },
      { name: "Andira Samir Zouheiry", sect: "Druze", list: "Independent Beirutis", votes: 37 },
      { name: "Jihad Ali Hammoud", sect: "Shia", list: "Independent Beirutis", votes: 19 },
      { name: "Wissam Said Akkoush", sect: "Shia", list: "Independent Beirutis", votes: 9 },
      { name: "Abdel Karim Hussein Itani", sect: "Sunni", list: "Independent Beirutis", votes: 87 },
      { name: "Leon Sourine Sioufi", sect: "Greek Orthodox", list: "Independent Beirutis", votes: 29 },
      { name: "Khaled Ibrahim Hanqir", sect: "Sunni", list: "Independent Beirutis", votes: 16 },
      { name: "Walid Chafik Shatila", sect: "Sunni", list: "Independent Beirutis", votes: 44 },
      { name: "Abdel Rahmane Khodor Ghalayini", sect: "Sunni", list: "Independent Beirutis", votes: 20 },
      { name: "Fadi Bahnan Zarazeer", sect: "Evangelical", list: "Independent Beirutis", votes: 12 }
    ]
  },

  // Hand-cleaned from:
  // /Users/raji/Desktop/2018 Parliamentary Elections Results.pdf
  // Page 12, Bekaa 3 (Baalback - Hermel)
  "bekaa-iii": {
    listVotes: [
      { list: "Hope and Loyalty", votes: 3181 },
      { list: "National Cedars", votes: 32 },
      { list: "Dignity and Development", votes: 902 },
      { list: "The Independent", votes: 157 },
      { list: "Development and Change", votes: 147 }
    ],
    candidates: [
      { name: "Jamil Mohamad Amin Amin El Sayed", sect: "Shia", list: "Hope and Loyalty", votes: 33223 },
      { name: "Hussein Ali El Hajj Hassan", sect: "Shia", list: "Hope and Loyalty", votes: 15662 },
      { name: "Ihab Arwa Hmade", sect: "Shia", list: "Hope and Loyalty", votes: 18404 },
      { name: "Walid Mohamad Souccarieh", sect: "Sunni", list: "Hope and Loyalty", votes: 6916 },
      { name: "Ghazy Mohamad Zeatir", sect: "Shia", list: "Hope and Loyalty", votes: 17767 },
      { name: "Albert Sami Mansour", sect: "Greek Catholic", list: "Hope and Loyalty", votes: 5881 },
      { name: "Ali Mohamad Salman Bachir El Mokdad", sect: "Shia", list: "Hope and Loyalty", votes: 17321 },
      { name: "Emile Georges Rahme", sect: "Maronite", list: "Hope and Loyalty", votes: 3861 },
      { name: "Ibrahim Ali El Mousawi", sect: "Shia", list: "Hope and Loyalty", votes: 16942 },
      { name: "Younes Zakariya El Rifai", sect: "Sunni", list: "Hope and Loyalty", votes: 1589 },

      { name: "Michel Emile Daher", sect: "Greek Catholic", list: "The Independent", votes: 2742 },
      { name: "Cinderella Elias Merhej", sect: "Maronite", list: "The Independent", votes: 128 },
      { name: "Fayez Chehab Choucour", sect: "Shia", list: "The Independent", votes: 1159 },
      { name: "Faysal Ali El Husseini", sect: "Shia", list: "The Independent", votes: 114 },
      { name: "Mohamad Ahmad Fliti", sect: "Sunni", list: "The Independent", votes: 660 },
      { name: "Saad Fawzi Hmadeh", sect: "Shia", list: "The Independent", votes: 72 },
      { name: "Fadi Ali Younes", sect: "Shia", list: "The Independent", votes: 164 },
      { name: "Mahdi Nayef Zoughaib", sect: "Shia", list: "The Independent", votes: 64 },
      { name: "Ghada Assad Assaf", sect: "Shia", list: "The Independent", votes: 159 },
      { name: "Ahmad Abdallah Bayan", sect: "Sunni", list: "The Independent", votes: 51 },

      { name: "Abbas Youssef Assaf", sect: "Sunni", list: "National Cedars", votes: 37 },
      { name: "Mohamad Khalil Raad", sect: "Shia", list: "National Cedars", votes: 9 },
      { name: "Hamad Ali Dib", sect: "Shia", list: "National Cedars", votes: 112 },
      { name: "Layla Youssef Tannouri", sect: "Maronite", list: "National Cedars", votes: 109 },
      { name: "Adel Mohamad Bayan", sect: "Sunni", list: "National Cedars", votes: 52 },
      { name: "Waed Hussein Soukarieh", sect: "Shia", list: "National Cedars", votes: 37 },
      { name: "Fouad Khalil El Mawla", sect: "Shia", list: "National Cedars", votes: 49 },
      { name: "Khaldoun Wajih Cherif", sect: "Shia", list: "National Cedars", votes: 42 },
      { name: "Saadallah Holo Ardo", sect: "Greek Catholic", list: "National Cedars", votes: 5 },
      { name: "Mohamad Ghassan Moustafa El Chal", sect: "Shia", list: "National Cedars", votes: 7 },

      { name: "Antoine El Badaoui Habchi", sect: "Maronite", list: "Dignity and Development", votes: 14858 },
      { name: "Khoder Hussein Tleis", sect: "Shia", list: "Dignity and Development", votes: 612 },
      { name: "Rifaat Neyif El Masri", sect: "Shia", list: "Dignity and Development", votes: 504 },
      { name: "Baker Mahmoud El Houjairi", sect: "Sunni", list: "Dignity and Development", votes: 5994 },
      { name: "Hussein Mohamad Soleh", sect: "Sunni", list: "Dignity and Development", votes: 4974 },
      { name: "Selim Michel Kallas", sect: "Greek Catholic", list: "Dignity and Development", votes: 685 },
      { name: "Mohamad Hassan El Hajj Sleiman", sect: "Shia", list: "Dignity and Development", votes: 262 },
      { name: "Ghaleb Abbas Yaghi", sect: "Shia", list: "Dignity and Development", votes: 145 },
      { name: "Mohamad Salman Hamieh", sect: "Shia", list: "Dignity and Development", votes: 13 },
      { name: "Yehya Mohamad Chammas", sect: "Shia", list: "Dignity and Development", votes: 6658 },

      { name: "Siham Georges Antoun", sect: "Greek Catholic", list: "Development and Change", votes: 1123 },
      { name: "Ali Hussein Zeatir", sect: "Sunni", list: "Development and Change", votes: 336 },
      { name: "Samih Kassem Eizzeddine", sect: "Shia", list: "Development and Change", votes: 927 },
      { name: "Abbas Mohamad Yaghi", sect: "Maronite", list: "Development and Change", votes: 193 },
      { name: "Ali Sabri Bek Hmade", sect: "Shia", list: "Development and Change", votes: 780 },
      { name: "Abdallah Mohamad El Chel", sect: "Sunni", list: "Development and Change", votes: 416 },
      { name: "Chawki Tannous El Fakhri", sect: "Shia", list: "Development and Change", votes: 131 }
    ]
  },

  // Hand-cleaned from:
  // /Users/raji/Desktop/2018 Parliamentary Elections Results.pdf
  // Page 20, North 1 (Akkar)
  "north-i": {
    listVotes: [
      { list: "Future for Akkar", votes: 1684 },
      { list: "Decision to Akkar", votes: 312 },
      { list: "Akkar's Decision", votes: 65 },
      { list: "Strong Akkar", votes: 622 }
    ],
    candidates: [
      { name: "Walid Wajih El Baarini", sect: "Sunni", list: "Future for Akkar", votes: 20426 },
      { name: "Wehbe Khalil Khalil Katicha", sect: "Greek Orthodox", list: "Future for Akkar", votes: 7911 },
      { name: "Mohamd Moustafa Sleiman", sect: "Sunni", list: "Future for Akkar", votes: 14911 },
      { name: "Jean Nicolas Moussa", sect: "Greek Orthodox", list: "Future for Akkar", votes: 3759 },
      { name: "Mohamad Tarek Talal El Merehbi", sect: "Sunni", list: "Future for Akkar", votes: 14145 },
      { name: "Khodor Mounif Habib", sect: "Alawite", list: "Future for Akkar", votes: 561 },
      { name: "Hadi Fawzi Hobeich", sect: "Maronite", list: "Future for Akkar", votes: 13055 },

      { name: "Emile Naim Abboud", sect: "Greek Orthodox", list: "Decision to Akkar", votes: 4915 },
      { name: "Mikhael Antonios Daher", sect: "Maronite", list: "Decision to Akkar", votes: 653 },
      { name: "Hussein Moheddine El Saloum", sect: "Alawite", list: "Decision to Akkar", votes: 4245 },
      { name: "Adnan Moheddine Merheb", sect: "Sunni", list: "Decision to Akkar", votes: 551 },
      { name: "Karim Abdallah El Rassi", sect: "Greek Orthodox", list: "Decision to Akkar", votes: 2590 },
      { name: "Hussein Mohamad Yasser El Masri", sect: "Sunni", list: "Decision to Akkar", votes: 518 },
      { name: "Wajih Mohamad El Baarini", sect: "Sunni", list: "Decision to Akkar", votes: 665 },

      { name: "Georges Antonios Nader", sect: "Maronite", list: "Akkar's Decision", votes: 1111 },
      { name: "Ali Khodor Omar", sect: "Sunni", list: "Akkar's Decision", votes: 347 },
      { name: "Bassem Ahmad El Khaled", sect: "Sunni", list: "Akkar's Decision", votes: 369 },
      { name: "Kamal Abdel Rahim Khazaal", sect: "Sunni", list: "Akkar's Decision", votes: 140 },

      { name: "Jimmy Georges Jabbour", sect: "Maronite", list: "Strong Akkar", votes: 8667 },
      { name: "Mohamad Yehya Yehya", sect: "Sunni", list: "Strong Akkar", votes: 8144 },
      { name: "Assad Ramez Dargham", sect: "Greek Orthodox", list: "Strong Akkar", votes: 7435 },
      { name: "Mohamad Abdel Fatah Chedid", sect: "Sunni", list: "Strong Akkar", votes: 5277 },
      { name: "Mahmoud Khoder Hadara", sect: "Sunni", list: "Strong Akkar", votes: 1628 },
      { name: "Riad Nicolas Rahal", sect: "Greek Orthodox", list: "Strong Akkar", votes: 1304 },
      { name: "Moustafa Ali Hussein", sect: "Alawite", list: "Strong Akkar", votes: 1353 },

      { name: "Elie Assad Assad", sect: "Greek Orthodox", list: "Lebanon Sovereignty", votes: 1037 },
      { name: "Joseph Wehbe Wehbe", sect: "Greek Orthodox", list: "Lebanon Sovereignty", votes: 730 },
      { name: "Ahmad Hassan Jawhar", sect: "Sunni", list: "Lebanon Sovereignty", votes: 1059 },
      { name: "Ibrahim Merheb Merheb", sect: "Sunni", list: "Lebanon Sovereignty", votes: 539 },

      { name: "Nidal Karam El Skaff", sect: "Greek Orthodox", list: "Women of Akkar", votes: 158 },
      { name: "Roula Mohamad El Mrad", sect: "Sunni", list: "Women of Akkar", votes: 119 },
      { name: "Golaye Khaled El Assad", sect: "Sunni", list: "Women of Akkar", votes: 75 },
      { name: "Marie Salem Salem El Khoury", sect: "Maronite", list: "Women of Akkar", votes: 46 },
      { name: "Souad Hassan Salah", sect: "Sunni", list: "Women of Akkar", votes: 36 },
      { name: "Ziad Saoud Bitar", sect: "Maronite", list: "Women of Akkar", votes: 442 },
      { name: "Bader Ali Ismail", sect: "Sunni", list: "Women of Akkar", votes: 380 },
      { name: "Mohamad Ibrahim Roustom", sect: "Alawite", list: "Women of Akkar", votes: 383 }
    ]
  },

  // Hand-cleaned from:
  // /Users/raji/Desktop/2018 Parliamentary Elections Results.pdf
  // Page 16, South 2 (Tyre - Saida Villages)
  "south-ii": {
    listVotes: [
      { list: "Hope and Loyalty", votes: 2836 },
      { list: "Together towards Change", votes: 1156 }
    ],
    candidates: [
      { name: "Nabih Moustafa Berri", sect: "Shia", list: "Hope and Loyalty", votes: 42137 },
      { name: "Nouaf Mahmoud El Mousawi", sect: "Shia", list: "Hope and Loyalty", votes: 24379 },
      { name: "Hussein Said Jechi", sect: "Shia", list: "Hope and Loyalty", votes: 23864 },
      { name: "Inaya Mohamad Eizzidine", sect: "Shia", list: "Hope and Loyalty", votes: 18815 },
      { name: "Ali Youssef Khreiss", sect: "Shia", list: "Hope and Loyalty", votes: 15672 },
      { name: "Michel Hanna Moussa", sect: "Greek Catholic", list: "Hope and Loyalty", votes: 4162 },
      { name: "Ali Adel Ossairan", sect: "Shia", list: "Hope and Loyalty", votes: 2203 },

      { name: "Wissam Nabih El Hajj", sect: "Greek Catholic", list: "Together towards Change", votes: 4729 },
      { name: "Riad Said El Assaad", sect: "Shia", list: "Together towards Change", votes: 1620 },
      { name: "Raed Jaafar Ataya", sect: "Shia", list: "Together towards Change", votes: 1382 },
      { name: "Abdel Naser Hassan Faran", sect: "Shia", list: "Together towards Change", votes: 1241 },
      { name: "Ahmad Mohamad Said Mroueh", sect: "Shia", list: "Together towards Change", votes: 852 },
      { name: "Lina Hassan El Houssaini", sect: "Shia", list: "Together towards Change", votes: 501 }
    ]
  },

  // Hand-cleaned from rendered page image of:
  // /Users/raji/Desktop/2018 Parliamentary Elections Results.pdf
  // Page 18, South 3 (Nabatieh - Bent Jbeil - Marjaaoun-Hasbaya)
  // Candidate rows were aligned against the printed list totals on the page.
  "south-iii": {
    candidates: [
      { name: "Mohamad Hassan Raad", sect: "Shia", list: "Hope and Loyalty", votes: 43797 },
      { name: "Yassin Kamel Jaber", sect: "Shia", list: "Hope and Loyalty", votes: 7920 },
      { name: "Hassan Nizamddine Fadlallah", sect: "Shia", list: "Hope and Loyalty", votes: 39722 },
      { name: "Ayoub Fahed Hmayid", sect: "Shia", list: "Hope and Loyalty", votes: 8875 },
      { name: "Ali Rachid Fayad", sect: "Shia", list: "Hope and Loyalty", votes: 27460 },
      { name: "Anwar Mohamad El Khalil", sect: "Druze", list: "Hope and Loyalty", votes: 6347 },
      { name: "Hani Hassan Kobaisi", sect: "Shia", list: "Hope and Loyalty", votes: 20504 },
      { name: "Kassem Omar Hachem", sect: "Sunni", list: "Hope and Loyalty", votes: 9216 },
      { name: "Ali Hassan Khalil", sect: "Shia", list: "Hope and Loyalty", votes: 16765 },
      { name: "Assad Halim Hardan", sect: "Greek Orthodox", list: "Hope and Loyalty", votes: 3321 },
      { name: "Ali Ahmad Bazzi", sect: "Shia", list: "Hope and Loyalty", votes: 9297 },

      { name: "Imad Fouad El Khatib", sect: "Sunni", list: "The South Deserves", votes: 3824 },
      { name: "Mohamad Moustafa Kaddouh", sect: "Shia", list: "The South Deserves", votes: 4586 },
      { name: "Wissam Kamal Chrouf", sect: "Druze", list: "The South Deserves", votes: 2512 },
      { name: "Nadim Samih Ossairan", sect: "Shia", list: "The South Deserves", votes: 398 },
      { name: "Chadi Gerges Massaad", sect: "Greek Orthodox", list: "The South Deserves", votes: 1671 },
      { name: "Hicham Mahmoud Moughid Jaber", sect: "Shia", list: "The South Deserves", votes: 2167 },
      { name: "Moustafa Ali Badreddine", sect: "Shia", list: "The South Deserves", votes: 1454 },
      { name: "Abbas Mohamad Charafeddine", sect: "Shia", list: "The South Deserves", votes: 179 },
      { name: "Hussein Jihad El Chaer", sect: "Shia", list: "The South Deserves", votes: 200 },
      { name: "Merhef Ahmad Ramadan", sect: "Shia", list: "The South Deserves", votes: 67 },

      { name: "Ali Hussein Hajj Ali", sect: "Shia", list: "One Voice for Change", votes: 2112 },
      { name: "Abbas Ali Srour", sect: "Shia", list: "One Voice for Change", votes: 149 },
      { name: "Hala Philip Abou Qesm", sect: "Greek Orthodox", list: "One Voice for Change", votes: 1598 },
      { name: "Hussein Mohamad Amin Baydoun", sect: "Shia", list: "One Voice for Change", votes: 112 },
      { name: "Ahmad Mohamad Mrad", sect: "Shia", list: "One Voice for Change", votes: 1044 },
      { name: "Ghassan Mhanna Hadifeh", sect: "Druze", list: "One Voice for Change", votes: 699 },
      { name: "Said Mohamad Issa", sect: "Sunni", list: "One Voice for Change", votes: 181 },

      { name: "Fadi Kalim Salameh", sect: "Greek Orthodox", list: "Enough Talking", votes: 2435 },
      { name: "Rami Selman Oleik", sect: "Shia", list: "Enough Talking", votes: 153 },
      { name: "Ali Mohamad Hassan El Amin", sect: "Shia", list: "Enough Talking", votes: 1630 },
      { name: "Imad Mohamad Kamiha", sect: "Shia", list: "Enough Talking", votes: 315 },
      { name: "Ahmad Sami Ismail", sect: "Shia", list: "Enough Talking", votes: 177 },

      { name: "Jamil Mohamad Ali Balout", sect: "Shia", list: "Kulluna Watani", votes: 680 },
      { name: "Akram Mohamad Kais", sect: "Druze", list: "Kulluna Watani", votes: 166 },
      { name: "Fadi Issam Abou Jamra", sect: "Greek Orthodox", list: "Kulluna Watani", votes: 874 },
      { name: "Salah Mahdi Noureddine", sect: "Shia", list: "Kulluna Watani", votes: 71 },
      { name: "Rima Ali Hmed", sect: "Shia", list: "Kulluna Watani", votes: 471 },

      { name: "Ahmad Mohamad Kamel El Assad", sect: "Shia", list: "We Can Change", votes: 165 },
      { name: "Adnan Hassan El Khatib", sect: "Sunni", list: "We Can Change", votes: 30 },
      { name: "Abir Ghaleb Ramadan", sect: "Shia", list: "We Can Change", votes: 93 },
      { name: "Abdallah Mahmoud El Salman", sect: "Shia", list: "We Can Change", votes: 17 },
      { name: "Jamil Mohamad Farjallah Faraj", sect: "Shia", list: "We Can Change", votes: 69 },
      { name: "Rabah Kazem Abi Haidar", sect: "Shia", list: "We Can Change", votes: 7 },
      { name: "Maneeh Elias Saab", sect: "Greek Orthodox", list: "We Can Change", votes: 80 },
      { name: "Kanj Mahmoud Alameddine", sect: "Druze", list: "We Can Change", votes: 198 }
    ]
  },

  // Hand-cleaned from:
  // /Users/raji/Desktop/2018 Parliamentary Elections Results.pdf
  // Page 14, South 1 (Jezzine - Saida)
  "south-i": {
    listVotes: [
      { list: "For Everyone", votes: 473 },
      { list: "Saida & Jezzine Together", votes: 420 },
      { list: "Power of Change", votes: 174 },
      { list: "Integrity and Dignity", votes: 588 }
    ],
    candidates: [
      { name: "Ibrahim Samir Azar", sect: "Maronite", list: "For Everyone", votes: 11663 },
      { name: "Abdel Kader Nazih El Bisat", sect: "Sunni", list: "For Everyone", votes: 36 },
      { name: "Oussama Maarouf Saad El Masri", sect: "Sunni", list: "For Everyone", votes: 9880 },
      { name: "Youssef Hanna Bechara Hanna Saad El Skaff", sect: "Greek Catholic", list: "For Everyone", votes: 31 },

      { name: "Ziad Michel Assouad", sect: "Maronite", list: "Saida & Jezzine Together", votes: 7270 },
      { name: "Amal Hekmat Abou Zeid", sect: "Maronite", list: "Saida & Jezzine Together", votes: 5016 },
      { name: "Abdel Rahman Nazih El Bizri", sect: "Sunni", list: "Saida & Jezzine Together", votes: 3509 },
      { name: "Selim Antoine Khoury", sect: "Greek Catholic", list: "Saida & Jezzine Together", votes: 708 },
      { name: "Bassam Ibrahim Hammoud", sect: "Sunni", list: "Saida & Jezzine Together", votes: 3204 },

      { name: "Ajaj Jerji Haddad", sect: "Greek Catholic", list: "Power of Change", votes: 4394 },
      { name: "Samir Mohamad El Bizri", sect: "Sunni", list: "Power of Change", votes: 1198 },
      { name: "Joseph Elias Nohra", sect: "Maronite", list: "Power of Change", votes: 472 },

      { name: "Bahia Bahaa El din El Hariri", sect: "Sunni", list: "Integrity and Dignity", votes: 13739 },
      { name: "Robert Elias El Khoury", sect: "Greek Catholic", list: "Integrity and Dignity", votes: 449 },
      { name: "Hassan Mohamad Selim Chamseddine", sect: "Sunni", list: "Integrity and Dignity", votes: 1026 },
      { name: "Angele Bechara El Khawand", sect: "Maronite", list: "Integrity and Dignity", votes: 36 },
      { name: "Amin Edmond Risk", sect: "Maronite", list: "Integrity and Dignity", votes: 632 }
    ]
  },

  // Hand-cleaned from:
  // /Users/raji/Desktop/2018 Parliamentary Elections Results.pdf
  // Page 32, Mount Lebanon 1 (Jbeil - Keserwan)
  "mount-lebanon-i": {
    listVotes: [
      { list: "Definite Change", votes: 404 }
    ],
    candidates: [
      { name: "Mahmoud Ibrahim Awad", sect: "Shia", list: "Definite Change", votes: 787 },
      { name: "Rock Antoine Tanios Mhenna", sect: "Maronite", list: "Definite Change", votes: 259 },
      { name: "Ziad Habib Khalife Hashem", sect: "Maronite", list: "Definite Change", votes: 136 },
      { name: "Patricia Jean Elias", sect: "Maronite", list: "Definite Change", votes: 183 },
      { name: "Ziad Halim Al Hawwat", sect: "Maronite", list: "Definite Change", votes: 14424 },
      { name: "Shawki Gergi Al Dakash", sect: "Maronite", list: "Definite Change", votes: 10032 },
      { name: "Fadi Nagib Rouhana-Sakr", sect: "Maronite", list: "Definite Change", votes: 481 },
      { name: "Naaman Joseph Mrad", sect: "Maronite", list: "Definite Change", votes: 274 },

      { name: "Rabih Khalil Awad", sect: "Shia", list: "Strong Lebanon", votes: 891 },
      { name: "Nehme Georges Efrem", sect: "Maronite", list: "Strong Lebanon", votes: 10717 },
      { name: "Mansour Fouad Ghanem El Bonn", sect: "Maronite", list: "Strong Lebanon", votes: 6589 },
      { name: "Ziad Salim Baroud", sect: "Maronite", list: "Strong Lebanon", votes: 4743 },
      { name: "Walid Najib El Khoury", sect: "Maronite", list: "Strong Lebanon", votes: 7782 },
      { name: "Roger Gergi Azar", sect: "Maronite", list: "Strong Lebanon", votes: 6793 },
      { name: "Simon Farid Abi Ramia", sect: "Maronite", list: "Strong Lebanon", votes: 9729 },
      { name: "Shamel Rachid Roukoz", sect: "Maronite", list: "Strong Lebanon", votes: 7300 },

      { name: "Hussein Mohammad Zeaiter", sect: "Shia", list: "National Solidarity", votes: 9369 },
      { name: "Carlos Boutros Abi Nader", sect: "Maronite", list: "National Solidarity", votes: 470 },
      { name: "Michel Bechara Keyrouz", sect: "Maronite", list: "National Solidarity", votes: 222 },
      { name: "Joseph Tanios Al Zayek", sect: "Maronite", list: "National Solidarity", votes: 253 },
      { name: "Bassam Asad Al Hachem", sect: "Maronite", list: "National Solidarity", votes: 199 },
      { name: "Joseph Tanios Zgheib", sect: "Maronite", list: "National Solidarity", votes: 521 },
      { name: "Jean-Luis Louis Kordahi", sect: "Maronite", list: "National Solidarity", votes: 1209 },
      { name: "Zeina Joseph Al Kallab", sect: "Maronite", list: "National Solidarity", votes: 308 },

      { name: "Mohammad Karam Al Mokdad", sect: "Shia", list: "Kulluna Watani", votes: 247 },
      { name: "Youssef Elias Salame", sect: "Maronite", list: "Kulluna Watani", votes: 327 },
      { name: "Dori Nazih Daou", sect: "Maronite", list: "Kulluna Watani", votes: 311 },
      { name: "Rania Victor Bassil", sect: "Maronite", list: "Kulluna Watani", votes: 323 },
      { name: "Nadim Chafik Said", sect: "Maronite", list: "Kulluna Watani", votes: 590 },
      { name: "Josephine Antoine Zgheib", sect: "Maronite", list: "Kulluna Watani", votes: 728 },

      { name: "Moustapha Ali Al Husseini", sect: "Shia", list: "Decision is Ours", votes: 617 },
      { name: "Farid Haykal Al Khazen", sect: "Maronite", list: "Decision is Ours", votes: 9081 },
      { name: "Gilberte Maurice Zwein", sect: "Maronite", list: "Decision is Ours", votes: 521 },
      { name: "Youssef Al Maarouf Joseph Hanna Khalil", sect: "Maronite", list: "Decision is Ours", votes: 171 },
      { name: "Fares Antoun Said", sect: "Maronite", list: "Decision is Ours", votes: 5617 },
      { name: "Yolande Simon Khoury", sect: "Maronite", list: "Decision is Ours", votes: 78 },
      { name: "Jean Nasib Al Hawat", sect: "Maronite", list: "Decision is Ours", votes: 229 },
      { name: "Shaker Elias Salameh", sect: "Maronite", list: "Decision is Ours", votes: 2239 }
    ]
  },

  // Hand-cleaned from:
  // /Users/raji/Desktop/2018 Parliamentary Elections Results.pdf
  // Page 34, Mount Lebanon 2 (Metn)
  "mount-lebanon-ii": {
    listVotes: [
      { list: "Kulluna Watani", votes: 215 },
      { list: "Metn Heart of Lebanon", votes: 266 },
      { list: "Metn Pulse", votes: 624 },
      { list: "Strong Metn", votes: 832 },
      { list: "Metn Loyalty", votes: 467 }
    ],
    candidates: [
      { name: "Georges Naim Al Rahbani", sect: "Greek Orthodox", list: "Kulluna Watani", votes: 175 },
      { name: "Adib Youssef Tohme", sect: "Maronite", list: "Kulluna Watani", votes: 326 },
      { name: "Emile Gergi Kenaan", sect: "Greek Catholic", list: "Kulluna Watani", votes: 457 },
      { name: "Charbel Maroun Nahas", sect: "Maronite", list: "Kulluna Watani", votes: 2680 },
      { name: "Victoria Sabeh El Khoury", sect: "Maronite", list: "Kulluna Watani", votes: 780 },
      { name: "Nadine Victor Moussa", sect: "Maronite", list: "Kulluna Watani", votes: 394 },

      { name: "Ara Makrdij Kyounian", sect: "Armenian Orthodox", list: "Metn Heart of Lebanon", votes: 156 },
      { name: "Michel Georges Mkattaf", sect: "Greek Catholic", list: "Metn Heart of Lebanon", votes: 1212 },
      { name: "Chekri Nasib Mokarzel", sect: "Maronite", list: "Metn Heart of Lebanon", votes: 171 },
      { name: "Giselle Edward Abdo Nehme Hachem", sect: "Greek Orthodox", list: "Metn Heart of Lebanon", votes: 185 },
      { name: "Lina Samir Mkhayber", sect: "Greek Orthodox", list: "Metn Heart of Lebanon", votes: 178 },
      { name: "Majed Eddy Faek Abi Lamaa", sect: "Maronite", list: "Metn Heart of Lebanon", votes: 8922 },
      { name: "Jessica Joseph Azar", sect: "Maronite", list: "Metn Heart of Lebanon", votes: 1030 },
      { name: "Razi Wadih Al Hajj", sect: "Maronite", list: "Metn Heart of Lebanon", votes: 1018 },

      { name: "Yaghishe Garabet Andonian", sect: "Armenian Orthodox", list: "Metn Pulse", votes: 160 },
      { name: "Nada Khattar Ghareeb", sect: "Maronite", list: "Metn Pulse", votes: 178 },
      { name: "Mikhael Elias El Ramouz", sect: "Greek Catholic", list: "Metn Pulse", votes: 366 },
      { name: "Elias Rakif Hankash", sect: "Maronite", list: "Metn Pulse", votes: 2583 },
      { name: "Violette Krekor Ghazal", sect: "Greek Orthodox", list: "Metn Pulse", votes: 178 },
      { name: "Sami Amin Gemayel", sect: "Maronite", list: "Metn Pulse", votes: 13968 },
      { name: "Mazen Assaad Skaf", sect: "Greek Orthodox", list: "Metn Pulse", votes: 366 },
      { name: "Joseph Ishaya Karam", sect: "Maronite", list: "Metn Pulse", votes: 580 },

      { name: "Hagop Ohanes Hagop Bakradonian", sect: "Armenian Orthodox", list: "Strong Metn", votes: 7182 },
      { name: "Edgard Boulos Maalouf", sect: "Greek Catholic", list: "Strong Metn", votes: 5961 },
      { name: "Ibrahim Youssef Kenaan", sect: "Maronite", list: "Strong Metn", votes: 7179 },
      { name: "Ghassan Asad El Ashkar", sect: "Greek Orthodox", list: "Strong Metn", votes: 2757 },
      { name: "Elias Nicolas Bou Saab", sect: "Greek Orthodox", list: "Strong Metn", votes: 7299 },
      { name: "Corine Kabalan El Ashkar", sect: "Maronite", list: "Strong Metn", votes: 696 },
      { name: "Ghassan Emile Mkhayber", sect: "Maronite", list: "Strong Metn", votes: 2654 },
      { name: "Sarkis Elias Sarkis", sect: "Maronite", list: "Strong Metn", votes: 4337 },

      { name: "Michel Elias El Morr", sect: "Greek Orthodox", list: "Metn Loyalty", votes: 11945 },
      { name: "Charbel Semaan Abou Jaoudeh", sect: "Maronite", list: "Metn Loyalty", votes: 182 },
      { name: "Georges Joseph Abboud", sect: "Greek Catholic", list: "Metn Loyalty", votes: 454 },
      { name: "Miled Fares Al Sibaali", sect: "Maronite", list: "Metn Loyalty", votes: 446 },
      { name: "Najwa Toufik Azar", sect: "Maronite", list: "Metn Loyalty", votes: 285 }
    ]
  },

  // Hand-cleaned from:
  // /Users/raji/Desktop/2018 Parliamentary Elections Results.pdf
  // Page 25, North 3 (Batroun - Koura - Bcharreh - Zgharta)
  "north-iii": {
    listVotes: [
      { list: "Kulluna Watani", votes: 73 }
    ],
    candidates: [
      { name: "Boutros Joseph El Khoury Hareb", sect: "Maronite", list: "Together for North and Lebanon", votes: 6155 },
      { name: "Salim Abdallah Saade", sect: "Greek Orthodox", list: "Together for North and Lebanon", votes: 5263 },
      { name: "Tony Sleiman Franjieh", sect: "Maronite", list: "Together for North and Lebanon", votes: 11407 },
      { name: "Melhem Jobran Tawk", sect: "Greek Orthodox", list: "Together for North and Lebanon", votes: 4649 },
      { name: "Fayez Michel Ghosn", sect: "Greek Orthodox", list: "Together for North and Lebanon", votes: 4224 },
      { name: "Salim Beik Youssef Beik Karam", sect: "Maronite", list: "Together for North and Lebanon", votes: 1590 },
      { name: "Abdallah Salim Al Zakhem", sect: "Maronite", list: "Together for North and Lebanon", votes: 779 },
      { name: "Roy Bahjat Issa El Khoury", sect: "Maronite", list: "Together for North and Lebanon", votes: 1286 },
      { name: "Estephan Boutros El Doueihy", sect: "Maronite", list: "Together for North and Lebanon", votes: 5435 },

      { name: "Fadi Youssef Saad", sect: "Maronite", list: "Strong Republic Pulse", votes: 9842 },
      { name: "Fadi Abdallah Karam", sect: "Greek Orthodox", list: "Strong Republic Pulse", votes: 7822 },
      { name: "Marios Boutros El Beaini", sect: "Maronite", list: "Strong Republic Pulse", votes: 2776 },
      { name: "Sitrida Elias Tawk", sect: "Maronite", list: "Strong Republic Pulse", votes: 6677 },
      { name: "Samer Georges Saade", sect: "Greek Orthodox", list: "Strong Republic Pulse", votes: 2470 },
      { name: "Joseph Gerges Ishak", sect: "Greek Orthodox", list: "Strong Republic Pulse", votes: 5990 },
      { name: "Albert Jamil Andraos", sect: "Maronite", list: "Strong Republic Pulse", votes: 442 },
      { name: "Georges Moussi Mansour", sect: "Maronite", list: "Strong Republic Pulse", votes: 305 },
      { name: "Qaysar Farid Mouawad", sect: "Maronite", list: "Strong Republic Pulse", votes: 858 },
      { name: "Michel Bakhous El Douweihy", sect: "Maronite", list: "Strong Republic Pulse", votes: 194 },

      { name: "Layal Semaan Bou Moussa", sect: "Maronite", list: "Kulluna Watani", votes: 952 },
      { name: "Fadwa Fayez Nassif", sect: "Greek Orthodox", list: "Kulluna Watani", votes: 463 },
      { name: "Antonia Ramez Ghamra", sect: "Maronite", list: "Kulluna Watani", votes: 149 },
      { name: "Maurice Romanos El Koura", sect: "Maronite", list: "Kulluna Watani", votes: 425 },
      { name: "Antoun Habib El Khoury Hareb", sect: "Greek Orthodox", list: "Kulluna Watani", votes: 88 },
      { name: "Riyad Sarkis Ghazale", sect: "Maronite", list: "Kulluna Watani", votes: 293 },
      { name: "Bassam Nadeem Ghantous", sect: "Maronite", list: "Kulluna Watani", votes: 352 },
      { name: "Edmond Mikhael Tawk", sect: "Maronite", list: "Kulluna Watani", votes: 122 },
      { name: "Antoine Youssef Yammine", sect: "Maronite", list: "Kulluna Watani", votes: 243 },

      { name: "Gebran Gergi Bassil", sect: "Greek Orthodox", list: "Strong North", votes: 12269 },
      { name: "Michel Rene Mouawad", sect: "Maronite", list: "Strong North", votes: 8571 },
      { name: "Nehmeh Ibrahim Ibrahim", sect: "Maronite", list: "Strong North", votes: 118 },
      { name: "Pierre Gerges Raffoul", sect: "Maronite", list: "Strong North", votes: 3749 },
      { name: "Jawad Simon Boulos", sect: "Maronite", list: "Strong North", votes: 109 },
      { name: "Georges Naim Atallah", sect: "Greek Orthodox", list: "Strong North", votes: 3383 },
      { name: "Gretta Habib Saab", sect: "Maronite", list: "Strong North", votes: 765 },
      { name: "Nicolas Bek Fouad Bek Ghosn Ghosn", sect: "Maronite", list: "Strong North", votes: 3190 },
      { name: "Said Youssef Taouk", sect: "Maronite", list: "Strong North", votes: 1112 },
      { name: "Georges Badaoui Boutros", sect: "Greek Orthodox", list: "Strong North", votes: 76 }
    ]
  },

  // Hand-cleaned from:
  // /Users/raji/Desktop/2018 Parliamentary Elections Results.pdf
  // Page 22, North 2 (Minnieh - Dinnieh - Tripoli)
  "north-ii": {
    listVotes: [
      { list: "The Future is for the North", votes: 1923 },
      { list: "National Dignity", votes: 911 },
      { list: "Determination", votes: 2433 },
      { list: "A Sovereign Lebanon", votes: 468 },
      { list: "People's Decision", votes: 426 }
    ],
    candidates: [
      { name: "Kassem Ali Abdel Aziz", sect: "Sunni", list: "The Future is for the North", votes: 6382 },
      { name: "Nehmeh Gerges Mahfoud", sect: "Greek Orthodox", list: "The Future is for the North", votes: 800 },
      { name: "Layla Hassan Chahoud", sect: "Alawite", list: "The Future is for the North", votes: 443 },
      { name: "Dima Mohamad Rachid El Jamali", sect: "Sunni", list: "The Future is for the North", votes: 2066 },
      { name: "Mohamd Abdel Latif Kabbara", sect: "Sunni", list: "The Future is for the North", votes: 9600 },
      { name: "Sami Ahmad Chaouki Fatfat", sect: "Sunni", list: "The Future is for the North", votes: 7943 },
      { name: "Samir Adnan El Jisr", sect: "Sunni", list: "The Future is for the North", votes: 9527 },
      { name: "Osman Mohamad Alameddine", sect: "Sunni", list: "The Future is for the North", votes: 10221 },
      { name: "Chadi Ghassan Nechabeh", sect: "Sunni", list: "The Future is for the North", votes: 1135 },
      { name: "Georges Tanios El Bekasini", sect: "Maronite", list: "The Future is for the North", votes: 903 },
      { name: "Walid Mahmoud El Sawalhi", sect: "Sunni", list: "The Future is for the North", votes: 994 },

      { name: "Jihad Mourched El Samad", sect: "Sunni", list: "National Dignity", votes: 11897 },
      { name: "Ahmad Mahmoud Omran", sect: "Alawite", list: "National Dignity", votes: 1286 },
      { name: "Mohamad Safouh Ahmad Ismat Charif Yakan", sect: "Sunni", list: "National Dignity", votes: 127 },
      { name: "Faysal Omar Karami", sect: "Sunni", list: "National Dignity", votes: 7126 },
      { name: "Adel Mohamad Kazem Zreika", sect: "Sunni", list: "National Dignity", votes: 494 },
      { name: "Ayman Noureddine Omar", sect: "Sunni", list: "National Dignity", votes: 99 },
      { name: "Taha Itfat Naji", sect: "Sunni", list: "National Dignity", votes: 4152 },
      { name: "Rafli Antoine Diab", sect: "Greek Orthodox", list: "National Dignity", votes: 2794 },
      { name: "Abdelnasser Abdel Aziz El Masri", sect: "Sunni", list: "National Dignity", votes: 215 },

      { name: "Mohamad Nagib Azmi Mikati", sect: "Sunni", list: "Determination", votes: 21300 },
      { name: "Nicolas Kamil Nahas", sect: "Greek Orthodox", list: "Determination", votes: 1057 },
      { name: "Kazem Saleh Kheir", sect: "Sunni", list: "Determination", votes: 6754 },
      { name: "Rachid Ibrahim El Moukadem", sect: "Sunni", list: "Determination", votes: 746 },
      { name: "Mohamad Ahmad Talal El Fadel", sect: "Sunni", list: "Determination", votes: 4006 },
      { name: "Mirvat Mohamad Fadel El Houz", sect: "Sunni", list: "Determination", votes: 452 },
      { name: "Ali Ahmad Darwish", sect: "Alawite", list: "Determination", votes: 2246 },
      { name: "Mohamad Anas Abdallah Nadim El Jisr", sect: "Sunni", list: "Determination", votes: 1477 },
      { name: "Jihad Ali Youssef", sect: "Sunni", list: "Determination", votes: 131 },
      { name: "Jean Badawi Obeid", sect: "Maronite", list: "Determination", votes: 1136 },
      { name: "Mohamad Toufic Mohamad Rached Sultan", sect: "Sunni", list: "Determination", votes: 281 },

      { name: "Georges Nicolas El Jalad", sect: "Greek Orthodox", list: "A Sovereign Lebanon", votes: 86 },
      { name: "Mohamad Walid Abdel Kader Kamaredin", sect: "Sunni", list: "A Sovereign Lebanon", votes: 249 },
      { name: "Ashraf Ahmad Rifi", sect: "Sunni", list: "A Sovereign Lebanon", votes: 5931 },
      { name: "Ali Abdel Halim El Ayoubi", sect: "Sunni", list: "A Sovereign Lebanon", votes: 609 },
      { name: "Mohamad Kamaleddine Salhab", sect: "Sunni", list: "A Sovereign Lebanon", votes: 269 },
      { name: "Halim Naim Zeani", sect: "Maronite", list: "A Sovereign Lebanon", votes: 43 },
      { name: "Khaled Omar Tadmouri", sect: "Sunni", list: "A Sovereign Lebanon", votes: 199 },
      { name: "Ossama Nadim Amoun", sect: "Greek Orthodox", list: "A Sovereign Lebanon", votes: 644 },
      { name: "Bader Hussein Eid", sect: "Alawite", list: "A Sovereign Lebanon", votes: 277 },
      { name: "Walid Mohamad El Masri", sect: "Alawite", list: "A Sovereign Lebanon", votes: 344 },
      { name: "Ragheb Mohamad Faysal Raad", sect: "Sunni", list: "A Sovereign Lebanon", votes: 537 },

      { name: "Abdel Salam Ahmad Trad", sect: "Sunni", list: "Independent Decision", votes: 322 },
      { name: "Antoine Roufael Khalifeh", sect: "Maronite", list: "Independent Decision", votes: 129 },
      { name: "Mounzeh Gebran Sawan", sect: "Greek Orthodox", list: "Independent Decision", votes: 43 },
      { name: "Nariman Hilal El Jamal", sect: "Sunni", list: "Independent Decision", votes: 47 },
      { name: "Ali Farouk El Samad", sect: "Sunni", list: "Independent Decision", votes: 84 },
      { name: "Wassim Ali Alwan", sect: "Sunni", list: "Independent Decision", votes: 2000 },
      { name: "Mohamad Mesbah Aouni Ahdab", sect: "Alawite", list: "Independent Decision", votes: 908 },
      { name: "Mohamad Mahmoud El hajj Ahmad", sect: "Sunni", list: "Independent Decision", votes: 199 },
      { name: "Hisham Riad Ibrahim", sect: "Sunni", list: "Independent Decision", votes: 68 },

      { name: "Ali Moustafa Harmouch", sect: "Sunni", list: "People's Decision", votes: 146 },
      { name: "Nistas William El Kochari", sect: "Greek Orthodox", list: "People's Decision", votes: 52 },
      { name: "Khaled Kamel Roumieh", sect: "Sunni", list: "People's Decision", votes: 192 },
      { name: "Ahmad Mohamad Chandab", sect: "Sunni", list: "People's Decision", votes: 229 },
      { name: "Mahmoud Abdel Karim Chehadeh", sect: "Alawite", list: "People's Decision", votes: 282 },
      { name: "Kamal Mohamad Saleh El Kheir", sect: "Sunni", list: "People's Decision", votes: 2182 },
      { name: "Tony Farid Marouni", sect: "Maronite", list: "People's Decision", votes: 675 },

      { name: "Samah Yehya El Arja", sect: "Sunni", list: "Independent Civil Society", votes: 5 },
      { name: "Fadi Bikar El Jamal", sect: "Greek Orthodox", list: "Independent Civil Society", votes: 32 },
      { name: "Jamal Nassereddine Hamra El Badaoui", sect: "Sunni", list: "Independent Civil Society", votes: 258 },
      { name: "Ayman Omar Jamal", sect: "Sunni", list: "Independent Civil Society", votes: 18 },
      { name: "Hiba Issam Naja", sect: "Sunni", list: "Independent Civil Society", votes: 27 },
      { name: "Abdallah Abdel Kader El Rifai", sect: "Sunni", list: "Independent Civil Society", votes: 13 },
      { name: "Housan Hassan Khalil", sect: "Alawite", list: "Independent Civil Society", votes: 47 },

      { name: "Nariman Adel El Chamaa", sect: "Sunni", list: "Kulluna Watani", votes: 111 },
      { name: "Yahi Kamal Mawloud", sect: "Sunni", list: "Kulluna Watani", votes: 909 },
      { name: "Mohamad Mounzir Ashraf Maaliki", sect: "Sunni", list: "Kulluna Watani", votes: 131 },
      { name: "Wasek Abdel Razak El Moukadem", sect: "Sunni", list: "Kulluna Watani", votes: 97 },
      { name: "Malek Faysal Moulawi", sect: "Sunni", list: "Kulluna Watani", votes: 299 },
      { name: "Zeineddine Noureddine Dib", sect: "Alawite", list: "Kulluna Watani", votes: 36 },
      { name: "Dani Mahmoud Osman", sect: "Sunni", list: "Kulluna Watani", votes: 297 },
      { name: "Farah Ibrahim Issa", sect: "Greek Orthodox", list: "Kulluna Watani", votes: 452 },
      { name: "Moussa Asaad Khoury", sect: "Maronite", list: "Kulluna Watani", votes: 106 },
      { name: "Ahmad Moustafa El Dhaybi", sect: "Sunni", list: "Kulluna Watani", votes: 51 }
    ]
  },

  // Hand-cleaned from:
  // /Users/raji/Desktop/2018 Parliamentary Elections Results.pdf
  // Page 10, Bekaa 2 (West Bekaa - Rashaya)
  "bekaa-ii": {
    listVotes: [
      { list: "Better Tomorrow", votes: 792 },
      { list: "Future for W. Bekaa and Rashaya", votes: 660 },
      { list: "Civil Society", votes: 113 }
    ],
    candidates: [
      { name: "Faysal Salim Daoud", sect: "Druze", list: "Better Tomorrow", votes: 2041 },
      { name: "Abdel Rahim Youssef Mrad", sect: "Sunni", list: "Better Tomorrow", votes: 15111 },
      { name: "Mohamad Dib Nasrallah", sect: "Shia", list: "Better Tomorrow", votes: 8897 },
      { name: "Elie Nagib Ferzli", sect: "Greek Orthodox", list: "Better Tomorrow", votes: 4899 },
      { name: "Naji Nabih Ghanem", sect: "Maronite", list: "Better Tomorrow", votes: 838 },

      { name: "Wael Wehbe Abou Faour", sect: "Druze", list: "Future for W. Bekaa and Rashaya", votes: 10677 },
      { name: "Mohamad Kassem El Karaaoui", sect: "Sunni", list: "Future for W. Bekaa and Rashaya", votes: 8768 },
      { name: "Ziad Nazem El Kadri", sect: "Sunni", list: "Future for W. Bekaa and Rashaya", votes: 8392 },
      { name: "Henry Youssef Chedid", sect: "Maronite", list: "Future for W. Bekaa and Rashaya", votes: 1584 },
      { name: "Amin Mohamad Wehbe", sect: "Shia", list: "Future for W. Bekaa and Rashaya", votes: 741 },
      { name: "Ghassan Sleiman El Skaff", sect: "Greek Orthodox", list: "Future for W. Bekaa and Rashaya", votes: 995 },

      { name: "Joseph Gerges Ayoub", sect: "Greek Orthodox", list: "Civil Society", votes: 150 },
      { name: "Faysal Omar Rahal", sect: "Sunni", list: "Civil Society", votes: 168 },
      { name: "Aladdine Omar El Chemali", sect: "Sunni", list: "Civil Society", votes: 106 },
      { name: "Ali Sobhi Sobeh", sect: "Shia", list: "Civil Society", votes: 162 },
      { name: "Maguy Badih Aoun", sect: "Maronite", list: "Civil Society", votes: 847 }
    ]
  },

  // Hand-cleaned from:
  // /Users/raji/Desktop/2018 Parliamentary Elections Results.pdf
  // Page 36, Mount Lebanon 3 (Baabda)
  "mount-lebanon-iii": {
    listVotes: [
      { list: "Baabda Unity & Development", votes: 376 }
    ],
    candidates: [
      { name: "Ali Fadel Ammar", sect: "Shia", list: "National Accord", votes: 13692 },
      { name: "Alain Joseph Aoun", sect: "Maronite", list: "National Accord", votes: 10200 },
      { name: "Fadi Fakhri Alameh", sect: "Shia", list: "National Accord", votes: 6348 },
      { name: "Hikmat Faraj Dib", sect: "Maronite", list: "National Accord", votes: 4428 },
      { name: "Naji Kamil Gharios", sect: "Maronite", list: "National Accord", votes: 3744 },
      { name: "Souheil Assaad Al Aawar", sect: "Druze", list: "National Accord", votes: 2257 },

      { name: "Pierre Rachid Bou Assi", sect: "Maronite", list: "Baabda Unity & Development", votes: 13498 },
      { name: "Hadi Mohammad Rafik Abou El Hassan", sect: "Druze", list: "Baabda Unity & Development", votes: 11844 },
      { name: "Salah Mahmoud Al Harake", sect: "Shia", list: "Baabda Unity & Development", votes: 468 },
      { name: "Cynthia Ahmad Riad El Asmar", sect: "Maronite", list: "Baabda Unity & Development", votes: 200 },
      { name: "Joseph Michel Odaimi", sect: "Maronite", list: "Baabda Unity & Development", votes: 114 },

      { name: "Ramzeh Jamil Bou Khaled", sect: "Maronite", list: "Together for Baabda", votes: 2586 },
      { name: "Elie Mikhael Gharios", sect: "Maronite", list: "Together for Baabda", votes: 1912 },
      { name: "Paul Shafik Abi Rached", sect: "Maronite", list: "Together for Baabda", votes: 726 },
      { name: "Olfat Hamzeh El Sabeh", sect: "Shia", list: "Together for Baabda", votes: 216 },
      { name: "Said Mohamad Alameh", sect: "Shia", list: "Together for Baabda", votes: 251 },
      { name: "Ojoud Mohamad Al Ayash", sect: "Druze", list: "Together for Baabda", votes: 77 },

      { name: "Ziad Mikhael Akel", sect: "Maronite", list: "Kulluna Watani", votes: 1192 },
      { name: "Wasef Habib Al Harake", sect: "Shia", list: "Kulluna Watani", votes: 1308 },
      { name: "Rania Refaat Al Masri", sect: "Druze", list: "Kulluna Watani", votes: 958 },
      { name: "Marie-Claude Albert El Helou", sect: "Maronite", list: "Kulluna Watani", votes: 1022 },
      { name: "Joseph Antoine Wannis", sect: "Maronite", list: "Kulluna Watani", votes: 394 },
      { name: "Ali Hassan Darwish", sect: "Shia", list: "Kulluna Watani", votes: 118 }
    ]
  },

  // Hand-cleaned from rendered page images of:
  // /Users/raji/Desktop/2018 Parliamentary Elections Results.pdf
  // Pages 37-38, Mount Lebanon 4 (Chouf, Aley)
  "mount-lebanon-iv": {
    listVotes: [
      { list: "Reconciliation", votes: 2293 },
      { list: "Mount Lebanon's Guaranteed change", votes: 788 },
      { list: "National Unity", votes: 466 },
      { list: "Kulluna Watani", votes: 588 },
      { list: "Free Decision", votes: 181 },
      { list: "Madaniya", votes: 195 }
    ],
    candidates: [
      { name: "Akram Hussein Sheyab", sect: "Druze", list: "Reconciliation", votes: 14088 },
      { name: "Taymour Walid Joumblatt", sect: "Druze", list: "Reconciliation", votes: 11478 },
      { name: "Mohammad Kassem Rachid Al Hajjar", sect: "Sunni", list: "Reconciliation", votes: 10003 },
      { name: "Georges Jamil Adwan", sect: "Maronite", list: "Reconciliation", votes: 9956 },
      { name: "Bilal Ahmad Abdallah", sect: "Sunni", list: "Reconciliation", votes: 8492 },
      { name: "Henri Pierre El Helou", sect: "Maronite", list: "Reconciliation", votes: 7894 },
      { name: "Anis Wadih Nassar", sect: "Greek Orthodox", list: "Reconciliation", votes: 7872 },
      { name: "Marwan Mohammad Hmadeh", sect: "Druze", list: "Reconciliation", votes: 7266 },
      { name: "Nehme Youssef Tohme", sect: "Greek Catholic", list: "Reconciliation", votes: 7253 },
      { name: "Naji Nabih Al Boustani", sect: "Maronite", list: "Reconciliation", votes: 5245 },
      { name: "Ghattas Semaan El Khoury", sect: "Maronite", list: "Reconciliation", votes: 4998 },
      { name: "Raji Najib Al Saad", sect: "Maronite", list: "Reconciliation", votes: 2129 },

      { name: "Cezar Raymond Abi Khalil", sect: "Maronite", list: "Mount Lebanon's Guaranteed change", votes: 8124 },
      { name: "Al Amir Talal Al Amir Majid Irslan", sect: "Druze", list: "Mount Lebanon's Guaranteed change", votes: 7887 },
      { name: "Mario Aziz Aoun", sect: "Maronite", list: "Mount Lebanon's Guaranteed change", votes: 5124 },
      { name: "Ghassan Amal Atallah", sect: "Greek Catholic", list: "Mount Lebanon's Guaranteed change", votes: 4113 },
      { name: "Ali Salah Eddine Al Hajj", sect: "Sunni", list: "Mount Lebanon's Guaranteed change", votes: 3374 },
      { name: "Elias Chedid Hanna", sect: "Greek Orthodox", list: "Mount Lebanon's Guaranteed change", votes: 2750 },
      { name: "Farid Georges Philip Al Boustani", sect: "Maronite", list: "Mount Lebanon's Guaranteed change", votes: 2657 },
      { name: "Tarek Mohammad Al Khateeb", sect: "Sunni", list: "Mount Lebanon's Guaranteed change", votes: 2382 },
      { name: "Samir Youssef Aoun", sect: "Maronite", list: "Mount Lebanon's Guaranteed change", votes: 770 },
      { name: "Marwan Salman Al Sabiri Halawi", sect: "Druze", list: "Mount Lebanon's Guaranteed change", votes: 495 },
      { name: "Imad Maroun El Hajj Moulaka Bil Mouallem", sect: "Maronite", list: "Mount Lebanon's Guaranteed change", votes: 457 },
      { name: "Mazen Ismat Bou Dergham", sect: "Druze", list: "Mount Lebanon's Guaranteed change", votes: 106 },

      { name: "Weam Maher Najib Wahab", sect: "Druze", list: "National Unity", votes: 7340 },
      { name: "Walid Anis Khairallah", sect: "Greek Orthodox", list: "National Unity", votes: 2165 },
      { name: "Zaher Anwar Al Khateeb", sect: "Sunni", list: "National Unity", votes: 794 },
      { name: "Chafik Salameh Radwan", sect: "Druze", list: "National Unity", votes: 660 },
      { name: "Souheil Khalil Bejjani", sect: "Maronite", list: "National Unity", votes: 430 },
      { name: "Ziad Antoine Choueiry", sect: "Maronite", list: "National Unity", votes: 324 },
      { name: "Elias Abdel Salam Al Braj", sect: "Sunni", list: "National Unity", votes: 314 },
      { name: "Khaled Aaref Khaddaj", sect: "Druze", list: "National Unity", votes: 153 },
      { name: "Assaad Edmond Abou Jaoudeh", sect: "Maronite", list: "National Unity", votes: 112 },
      { name: "Sleiman Mahfouz Bou Rjeili", sect: "Greek Catholic", list: "National Unity", votes: 38 },

      { name: "Ghada Ghazi Marouni", sect: "Maronite", list: "Kulluna Watani", votes: 2094 },
      { name: "Zoya Najib Jraydini", sect: "Greek Orthodox", list: "Kulluna Watani", votes: 1688 },
      { name: "Mohamad Sami Al Hajjar", sect: "Sunni", list: "Kulluna Watani", votes: 1133 },
      { name: "Rania Adel Ghaith", sect: "Druze", list: "Kulluna Watani", votes: 831 },
      { name: "Maher Maamoun Abou Shakra", sect: "Druze", list: "Kulluna Watani", votes: 760 },
      { name: "Alaa Anwar Al Sayyegh", sect: "Druze", list: "Kulluna Watani", votes: 755 },
      { name: "Imad Haseeb Al Qadi", sect: "Druze", list: "Kulluna Watani", votes: 621 },
      { name: "Antoine Habib Fawwaz", sect: "Greek Catholic", list: "Kulluna Watani", votes: 577 },
      { name: "Karl Farid Bou Melham", sect: "Maronite", list: "Kulluna Watani", votes: 445 },
      { name: "Mazen Mohammad Nasereddine", sect: "Sunni", list: "Kulluna Watani", votes: 305 },
      { name: "Georges Emile Aoun", sect: "Maronite", list: "Kulluna Watani", votes: 190 },

      { name: "Theodora Toni Bejjani", sect: "Maronite", list: "Free Decision", votes: 1219 },
      { name: "Kamil Michel Dori Chamoun", sect: "Maronite", list: "Free Decision", votes: 1084 },
      { name: "Mazen Khalaf Shibo", sect: "Sunni", list: "Free Decision", votes: 724 },
      { name: "Raafat Ahmad Shaaban", sect: "Sunni", list: "Free Decision", votes: 674 },
      { name: "Joseph Haseeb Eid", sect: "Maronite", list: "Free Decision", votes: 524 },
      { name: "Ghassan Naim Mghabghab", sect: "Greek Catholic", list: "Free Decision", votes: 307 },
      { name: "Sami Toufik Hmadeh", sect: "Druze", list: "Free Decision", votes: 188 },
      { name: "Daad Nassif Al Azzi", sect: "Maronite", list: "Free Decision", votes: 172 },
      { name: "Antoine Nassib Bou Malham", sect: "Maronite", list: "Free Decision", votes: 172 },
      { name: "Alhan Walid Farhat", sect: "Druze", list: "Free Decision", votes: 132 },
      { name: "Sami Selman Al Remah", sect: "Druze", list: "Free Decision", votes: 69 },

      { name: "Mark Behjat Daou", sect: "Druze", list: "Madaniya", votes: 1505 },
      { name: "Maya Wahid Terro", sect: "Sunni", list: "Madaniya", votes: 373 },
      { name: "Fadi Fouad El Khoury", sect: "Maronite", list: "Madaniya", votes: 228 },
      { name: "Chekri Youssef Haddad", sect: "Greek Catholic", list: "Madaniya", votes: 173 },
      { name: "Rami Nouhad Hmadeh", sect: "Druze", list: "Madaniya", votes: 147 },
      { name: "Marwan Aziz El Metni", sect: "Maronite", list: "Madaniya", votes: 134 },
      { name: "Elias Najib Ghareeb", sect: "Maronite", list: "Madaniya", votes: 105 },
      { name: "Eliane Michel Azzi", sect: "Maronite", list: "Madaniya", votes: 56 }
    ]
  }
};

// Keep the extracted 2018 drafts in source, but expose only the districts
// that have been manually audited against the report page layout.
const electionResults2018ByTemplateId = {
  "beirut-i": verifiedElectionResults2018ByTemplateId["beirut-i"],
  "beirut-ii": verifiedElectionResults2018ByTemplateId["beirut-ii"],
  "bekaa-i": verifiedElectionResults2018ByTemplateId["bekaa-i"],
  "bekaa-ii": verifiedElectionResults2018ByTemplateId["bekaa-ii"],
  "bekaa-iii": verifiedElectionResults2018ByTemplateId["bekaa-iii"],
  "mount-lebanon-i": verifiedElectionResults2018ByTemplateId["mount-lebanon-i"],
  "mount-lebanon-ii": verifiedElectionResults2018ByTemplateId["mount-lebanon-ii"],
  "mount-lebanon-iii": verifiedElectionResults2018ByTemplateId["mount-lebanon-iii"],
  "mount-lebanon-iv": verifiedElectionResults2018ByTemplateId["mount-lebanon-iv"],
  "north-i": verifiedElectionResults2018ByTemplateId["north-i"],
  "north-ii": verifiedElectionResults2018ByTemplateId["north-ii"],
  "north-iii": verifiedElectionResults2018ByTemplateId["north-iii"],
  "south-i": verifiedElectionResults2018ByTemplateId["south-i"],
  "south-ii": verifiedElectionResults2018ByTemplateId["south-ii"],
  "south-iii": verifiedElectionResults2018ByTemplateId["south-iii"]
};

const electionResults2018DataVersion = hashVersionPayload(electionResults2018ByTemplateId);

export function getElectionResults2018TemplateIds() {
  return Object.keys(electionResults2018ByTemplateId).sort();
}

export function getElectionResults2018DataVersion() {
  return electionResults2018DataVersion;
}

export function hasElectionResults2018(templateId) {
  const baseline = templateId ? electionResults2018ByTemplateId[templateId] : null;
  return Boolean(baseline && Array.isArray(baseline.candidates) && baseline.candidates.length > 0);
}

export function loadElectionResults2018(template) {
  const templateId = String(template?.id ?? "").trim();
  const baseline = electionResults2018ByTemplateId[templateId];
  if (!baseline || !Array.isArray(baseline.candidates) || baseline.candidates.length === 0) {
    return null;
  }

  const scenario = cloneTemplate(template);
  scenario.candidates = normalizeElectionBaseline(template, baseline.candidates, "2018 Report Unassigned List");
  scenario.listVotes = normalizeElectionBaselineListVotes(scenario.candidates, baseline.listVotes);

  return scenario;
}

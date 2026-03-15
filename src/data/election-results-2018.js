import { cloneTemplate } from "./templates.js";
import { normalizeElectionBaseline } from "./election-results-normalize.js";

const verifiedElectionResults2018ByTemplateId = {
  // Hand-cleaned from:
  // /Users/raji/Desktop/2018 Parliamentary Elections Results.pdf
  // Page 27, Beirut 1
  "beirut-i": {
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

  // Hand-cleaned from:
  // /Users/raji/Desktop/2018 Parliamentary Elections Results.pdf
  // Page 12, Bekaa 3 (Baalback - Hermel)
  "bekaa-iii": {
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

  // Hand-cleaned from:
  // /Users/raji/Desktop/2018 Parliamentary Elections Results.pdf
  // Page 14, South 1 (Jezzine - Saida)
  "south-i": {
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
    candidates: [
      { name: "Mahmoud Ibrahim Awad", sect: "Shia", list: "Definite Change", votes: 259 },
      { name: "Rock Antoine Tanios Mhenna", sect: "Maronite", list: "Definite Change", votes: 274 },
      { name: "Ziad Habib Khalife Hashem", sect: "Maronite", list: "Definite Change", votes: 481 },
      { name: "Patricia Jean Elias", sect: "Maronite", list: "Definite Change", votes: 183 },
      { name: "Ziad Halim Al Hawwat", sect: "Maronite", list: "Definite Change", votes: 787 },
      { name: "Shawki Gergi Al Dakash", sect: "Maronite", list: "Definite Change", votes: 14424 },
      { name: "Fadi Nagib Rouhana-Sakr", sect: "Maronite", list: "Definite Change", votes: 10032 },
      { name: "Naaman Joseph Mrad", sect: "Maronite", list: "Definite Change", votes: 134 },

      { name: "Rabih Khalil Awad", sect: "Shia", list: "Strong Lebanon", votes: 6793 },
      { name: "Nehme Georges Efrem", sect: "Maronite", list: "Strong Lebanon", votes: 10717 },
      { name: "Mansour Fouad Ghanem El Bonn", sect: "Maronite", list: "Strong Lebanon", votes: 7782 },
      { name: "Ziad Salim Baroud", sect: "Maronite", list: "Strong Lebanon", votes: 9729 },
      { name: "Walid Najib El Khoury", sect: "Maronite", list: "Strong Lebanon", votes: 7300 },
      { name: "Roger Gergi Azar", sect: "Maronite", list: "Strong Lebanon", votes: 6589 },
      { name: "Simon Farid Abi Ramia", sect: "Maronite", list: "Strong Lebanon", votes: 3893 },
      { name: "Shamel Rachid Roukoz", sect: "Maronite", list: "Strong Lebanon", votes: 891 },

      { name: "Hussein Mohammad Zeaiter", sect: "Shia", list: "National Solidarity", votes: 9369 },
      { name: "Carlos Boutros Abi Nader", sect: "Maronite", list: "National Solidarity", votes: 263 },
      { name: "Michel Bechara Keyrouz", sect: "Maronite", list: "National Solidarity", votes: 308 },
      { name: "Joseph Tanios Al Zayek", sect: "Maronite", list: "National Solidarity", votes: 64 },
      { name: "Bassam Asad Al Hachem", sect: "Maronite", list: "National Solidarity", votes: 199 },
      { name: "Joseph Tanios Zgheib", sect: "Maronite", list: "National Solidarity", votes: 222 },
      { name: "Jean-Luis Louis Kordahi", sect: "Maronite", list: "National Solidarity", votes: 470 },
      { name: "Zeina Joseph Al Kallab", sect: "Maronite", list: "National Solidarity", votes: 1209 },

      { name: "Mohammad Karam Al Mokdad", sect: "Shia", list: "Kulluna Watani", votes: 247 },
      { name: "Youssef Elias Salame", sect: "Maronite", list: "Kulluna Watani", votes: 728 },
      { name: "Dori Nazih Daou", sect: "Maronite", list: "Kulluna Watani", votes: 323 },
      { name: "Rania Victor Bassil", sect: "Maronite", list: "Kulluna Watani", votes: 590 },
      { name: "Nadim Chafik Said", sect: "Maronite", list: "Kulluna Watani", votes: 327 },
      { name: "Josephine Antoine Zgheib", sect: "Maronite", list: "Kulluna Watani", votes: 112 },

      { name: "Moustapha Ali Al Husseini", sect: "Shia", list: "Decision is Ours", votes: 2239 },
      { name: "Farid Haykal Al Khazen", sect: "Maronite", list: "Decision is Ours", votes: 78 },
      { name: "Gilberte Maurice Zwein", sect: "Maronite", list: "Decision is Ours", votes: 256 },
      { name: "Youssef Al Maarouf Joseph Hanna Khalil", sect: "Maronite", list: "Decision is Ours", votes: 171 },
      { name: "Fares Antoun Said", sect: "Maronite", list: "Decision is Ours", votes: 229 },
      { name: "Yolande Simon Khoury", sect: "Maronite", list: "Decision is Ours", votes: 5617 },
      { name: "Jean Nasib Al Hawat", sect: "Maronite", list: "Decision is Ours", votes: 9081 },
      { name: "Shaker Elias Salameh", sect: "Maronite", list: "Decision is Ours", votes: 521 }
    ]
  },

  // Hand-cleaned from:
  // /Users/raji/Desktop/2018 Parliamentary Elections Results.pdf
  // Page 34, Mount Lebanon 2 (Metn)
  "mount-lebanon-ii": {
    candidates: [
      { name: "Georges Naim Al Rahbani", sect: "Greek Orthodox", list: "Kulluna Watani", votes: 175 },
      { name: "Adib Youssef Tohme", sect: "Maronite", list: "Kulluna Watani", votes: 2680 },
      { name: "Emile Gergi Kenaan", sect: "Greek Catholic", list: "Kulluna Watani", votes: 780 },
      { name: "Charbel Maroun Nahas", sect: "Maronite", list: "Kulluna Watani", votes: 326 },
      { name: "Victoria Sabeh El Khoury", sect: "Maronite", list: "Kulluna Watani", votes: 394 },
      { name: "Nadine Victor Moussa", sect: "Maronite", list: "Kulluna Watani", votes: 457 },

      { name: "Ara Makrdij Kyounian", sect: "Armenian Orthodox", list: "Metn Heart of Lebanon", votes: 185 },
      { name: "Michel Georges Mkattaf", sect: "Greek Catholic", list: "Metn Heart of Lebanon", votes: 8922 },
      { name: "Chekri Nasib Mokarzel", sect: "Maronite", list: "Metn Heart of Lebanon", votes: 1212 },
      { name: "Giselle Edward Abdo Nehme Hachem", sect: "Greek Orthodox", list: "Metn Heart of Lebanon", votes: 1018 },
      { name: "Lina Samir Mkhayber", sect: "Greek Orthodox", list: "Metn Heart of Lebanon", votes: 1030 },
      { name: "Majed Eddy Faek Abi Lamaa", sect: "Maronite", list: "Metn Heart of Lebanon", votes: 156 },
      { name: "Jessica Joseph Azar", sect: "Maronite", list: "Metn Heart of Lebanon", votes: 178 },
      { name: "Razi Wadih Al Hajj", sect: "Maronite", list: "Metn Heart of Lebanon", votes: 171 },

      { name: "Yaghishe Garabet Andonian", sect: "Armenian Orthodox", list: "Metn Pulse", votes: 532 },
      { name: "Nada Khattar Ghareeb", sect: "Maronite", list: "Metn Pulse", votes: 178 },
      { name: "Mikhael Elias El Ramouz", sect: "Greek Catholic", list: "Metn Pulse", votes: 366 },
      { name: "Elias Rakif Hankash", sect: "Maronite", list: "Metn Pulse", votes: 160 },
      { name: "Violette Krekor Ghazal", sect: "Greek Orthodox", list: "Metn Pulse", votes: 2583 },
      { name: "Sami Amin Gemayel", sect: "Maronite", list: "Metn Pulse", votes: 13968 },
      { name: "Mazen Assaad Skaf", sect: "Greek Orthodox", list: "Metn Pulse", votes: 580 },
      { name: "Joseph Ishaya Karam", sect: "Maronite", list: "Metn Pulse", votes: 242 },

      { name: "Hagop Ohanes Hagop Bakradonian", sect: "Armenian Orthodox", list: "Strong Metn", votes: 696 },
      { name: "Edgard Boulos Maalouf", sect: "Greek Catholic", list: "Strong Metn", votes: 5961 },
      { name: "Ibrahim Youssef Kenaan", sect: "Maronite", list: "Strong Metn", votes: 7299 },
      { name: "Ghassan Asad El Ashkar", sect: "Greek Orthodox", list: "Strong Metn", votes: 2654 },
      { name: "Elias Nicolas Bou Saab", sect: "Greek Orthodox", list: "Strong Metn", votes: 4337 },
      { name: "Corine Kabalan El Ashkar", sect: "Maronite", list: "Strong Metn", votes: 7179 },
      { name: "Ghassan Emile Mkhayber", sect: "Maronite", list: "Strong Metn", votes: 2757 },
      { name: "Sarkis Elias Sarkis", sect: "Maronite", list: "Strong Metn", votes: 7182 },

      { name: "Michel Elias El Morr", sect: "Greek Orthodox", list: "Metn Loyalty", votes: 11945 },
      { name: "Charbel Semaan Abou Jaoudeh", sect: "Maronite", list: "Metn Loyalty", votes: 446 },
      { name: "Georges Joseph Abboud", sect: "Greek Catholic", list: "Metn Loyalty", votes: 454 },
      { name: "Miled Fares Al Sibaali", sect: "Maronite", list: "Metn Loyalty", votes: 182 },
      { name: "Najwa Toufik Azar", sect: "Maronite", list: "Metn Loyalty", votes: 285 }
    ]
  },

  // Hand-cleaned from:
  // /Users/raji/Desktop/2018 Parliamentary Elections Results.pdf
  // Page 25, North 3 (Batroun - Koura - Bcharreh - Zgharta)
  "north-iii": {
    candidates: [
      { name: "Boutros Joseph El Khoury Hareb", sect: "Maronite", list: "Together for North and Lebanon", votes: 1590 },
      { name: "Salim Abdallah Saade", sect: "Greek Orthodox", list: "Together for North and Lebanon", votes: 6155 },
      { name: "Tony Sleiman Franjieh", sect: "Maronite", list: "Together for North and Lebanon", votes: 25 },
      { name: "Melhem Jobran Tawk", sect: "Greek Orthodox", list: "Together for North and Lebanon", votes: 5263 },
      { name: "Fayez Michel Ghosn", sect: "Greek Orthodox", list: "Together for North and Lebanon", votes: 4649 },
      { name: "Salim Beik Youssef Beik Karam", sect: "Maronite", list: "Together for North and Lebanon", votes: 779 },
      { name: "Abdallah Salim Al Zakhem", sect: "Maronite", list: "Together for North and Lebanon", votes: 5435 },
      { name: "Roy Bahjat Issa El Khoury", sect: "Maronite", list: "Together for North and Lebanon", votes: 11407 },
      { name: "Estephan Boutros El Doueihy", sect: "Maronite", list: "Together for North and Lebanon", votes: 4224 },

      { name: "Fadi Youssef Saad", sect: "Maronite", list: "Strong Republic Pulse", votes: 442 },
      { name: "Fadi Abdallah Karam", sect: "Greek Orthodox", list: "Strong Republic Pulse", votes: 9842 },
      { name: "Marios Boutros El Beaini", sect: "Maronite", list: "Strong Republic Pulse", votes: 194 },
      { name: "Sitrida Elias Tawk", sect: "Maronite", list: "Strong Republic Pulse", votes: 7822 },
      { name: "Samer Georges Saade", sect: "Greek Orthodox", list: "Strong Republic Pulse", votes: 5990 },
      { name: "Joseph Gerges Ishak", sect: "Greek Orthodox", list: "Strong Republic Pulse", votes: 2470 },
      { name: "Albert Jamil Andraos", sect: "Maronite", list: "Strong Republic Pulse", votes: 6677 },
      { name: "Georges Moussi Mansour", sect: "Maronite", list: "Strong Republic Pulse", votes: 305 },
      { name: "Qaysar Farid Mouawad", sect: "Maronite", list: "Strong Republic Pulse", votes: 2776 },
      { name: "Michel Bakhous El Douweihy", sect: "Maronite", list: "Strong Republic Pulse", votes: 31 },

      { name: "Layal Semaan Bou Moussa", sect: "Maronite", list: "Kulluna Watani", votes: 293 },
      { name: "Fadwa Fayez Nassif", sect: "Greek Orthodox", list: "Kulluna Watani", votes: 952 },
      { name: "Antonia Ramez Ghamra", sect: "Maronite", list: "Kulluna Watani", votes: 122 },
      { name: "Maurice Romanos El Koura", sect: "Maronite", list: "Kulluna Watani", votes: 463 },
      { name: "Antoun Habib El Khoury Hareb", sect: "Greek Orthodox", list: "Kulluna Watani", votes: 73 },
      { name: "Riyad Sarkis Ghazale", sect: "Maronite", list: "Kulluna Watani", votes: 352 },
      { name: "Bassam Nadeem Ghantous", sect: "Maronite", list: "Kulluna Watani", votes: 243 },
      { name: "Edmond Mikhael Tawk", sect: "Maronite", list: "Kulluna Watani", votes: 149 },
      { name: "Antoine Youssef Yammine", sect: "Maronite", list: "Kulluna Watani", votes: 88 },

      { name: "Gebran Gergi Bassil", sect: "Greek Orthodox", list: "Strong North", votes: 1112 },
      { name: "Michel Rene Mouawad", sect: "Maronite", list: "Strong North", votes: 97 },
      { name: "Nehmeh Ibrahim Ibrahim", sect: "Maronite", list: "Strong North", votes: 118 },
      { name: "Pierre Gerges Raffoul", sect: "Maronite", list: "Strong North", votes: 8571 },
      { name: "Jawad Simon Boulos", sect: "Maronite", list: "Strong North", votes: 3190 },
      { name: "Georges Naim Atallah", sect: "Greek Orthodox", list: "Strong North", votes: 12269 },
      { name: "Gretta Habib Saab", sect: "Maronite", list: "Strong North", votes: 109 },
      { name: "Nicolas Bek Fouad Bek Ghosn Ghosn", sect: "Maronite", list: "Strong North", votes: 3749 },
      { name: "Said Youssef Taouk", sect: "Maronite", list: "Strong North", votes: 3383 },
      { name: "Georges Badaoui Boutros", sect: "Greek Orthodox", list: "Strong North", votes: 76 }
    ]
  },

  // Hand-cleaned from:
  // /Users/raji/Desktop/2018 Parliamentary Elections Results.pdf
  // Page 22, North 2 (Minnieh - Dinnieh - Tripoli)
  "north-ii": {
    candidates: [
      { name: "Kassem Ali Abdel Aziz", sect: "Sunni", list: "The Future is for the North", votes: 6382 },
      { name: "Nehmeh Gerges Mahfoud", sect: "Greek Orthodox", list: "The Future is for the North", votes: 4006 },
      { name: "Layla Hassan Chahoud", sect: "Alawite", list: "The Future is for the North", votes: 131 },
      { name: "Dima Mohamad Rachid El Jamali", sect: "Sunni", list: "The Future is for the North", votes: 2066 },
      { name: "Mohamd Abdel Latif Kabbara", sect: "Sunni", list: "The Future is for the North", votes: 10221 },
      { name: "Sami Ahmad Chaouki Fatfat", sect: "Sunni", list: "The Future is for the North", votes: 7943 },
      { name: "Samir Adnan El Jisr", sect: "Sunni", list: "The Future is for the North", votes: 9600 },
      { name: "Osman Mohamad Alameddine", sect: "Sunni", list: "The Future is for the North", votes: 9527 },
      { name: "Chadi Ghassan Nechabeh", sect: "Sunni", list: "The Future is for the North", votes: 1135 },
      { name: "Georges Tanios El Bekasini", sect: "Maronite", list: "The Future is for the North", votes: 994 },
      { name: "Walid Mahmoud El Sawalhi", sect: "Sunni", list: "The Future is for the North", votes: 903 },

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
      { name: "Mohamad Ahmad Talal El Fadel", sect: "Sunni", list: "Determination", votes: 2246 },
      { name: "Mirvat Mohamad Fadel El Houz", sect: "Sunni", list: "Determination", votes: 452 },
      { name: "Ali Ahmad Darwish", sect: "Alawite", list: "Determination", votes: 281 },
      { name: "Mohamad Anas Abdallah Nadim El Jisr", sect: "Sunni", list: "Determination", votes: 1477 },
      { name: "Jihad Ali Youssef", sect: "Sunni", list: "Determination", votes: 131 },
      { name: "Jean Badawi Obeid", sect: "Maronite", list: "Determination", votes: 1136 },
      { name: "Mohamad Toufic Mohamad Rached Sultan", sect: "Sunni", list: "Determination", votes: 800 },

      { name: "Georges Nicolas El Jalad", sect: "Greek Orthodox", list: "A Sovereign Lebanon", votes: 86 },
      { name: "Mohamad Walid Abdel Kader Kamaredin", sect: "Sunni", list: "A Sovereign Lebanon", votes: 249 },
      { name: "Ashraf Ahmad Rifi", sect: "Sunni", list: "A Sovereign Lebanon", votes: 5931 },
      { name: "Ali Abdel Halim El Ayoubi", sect: "Sunni", list: "A Sovereign Lebanon", votes: 609 },
      { name: "Mohamad Kamaleddine Salhab", sect: "Sunni", list: "A Sovereign Lebanon", votes: 269 },
      { name: "Halim Naim Zeani", sect: "Maronite", list: "A Sovereign Lebanon", votes: 199 },
      { name: "Khaled Omar Tadmouri", sect: "Sunni", list: "A Sovereign Lebanon", votes: 43 },
      { name: "Ossama Nadim Amoun", sect: "Greek Orthodox", list: "A Sovereign Lebanon", votes: 644 },
      { name: "Bader Hussein Eid", sect: "Sunni", list: "A Sovereign Lebanon", votes: 277 },
      { name: "Walid Mohamad El Masri", sect: "Alawite", list: "A Sovereign Lebanon", votes: 344 },
      { name: "Ragheb Mohamad Faysal Raad", sect: "Sunni", list: "A Sovereign Lebanon", votes: 537 }
    ]
  },

  // Hand-cleaned from:
  // /Users/raji/Desktop/2018 Parliamentary Elections Results.pdf
  // Page 10, Bekaa 2 (West Bekaa - Rashaya)
  "bekaa-ii": {
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
    candidates: [
      {
        name: "Rania Refaat Al Masri",
        sect: "Druze",
        list: "Kulluna Watani / Baabda Unity & Development",
        votes: 958
      },
      {
        name: "Hadi Mohammad Rafik Abou El Hassan",
        sect: "Druze",
        list: "Kulluna Watani / Baabda Unity & Development",
        votes: 118
      },
      {
        name: "Ziad Mikhael Akel",
        sect: "Maronite",
        list: "Kulluna Watani / Baabda Unity & Development",
        votes: 1308
      },
      {
        name: "Cynthia Ahmad Riad El Asmar",
        sect: "Maronite",
        list: "Kulluna Watani / Baabda Unity & Development",
        votes: 1192
      },
      {
        name: "Joseph Antoine Wannis",
        sect: "Shia",
        list: "Kulluna Watani / Baabda Unity & Development",
        votes: 755
      },
      {
        name: "Ali Hassan Darwish",
        sect: "Shia",
        list: "Kulluna Watani / Baabda Unity & Development",
        votes: 394
      },
      {
        name: "Salah Mahmoud Al Harake",
        sect: "Shia",
        list: "Kulluna Watani / Baabda Unity & Development",
        votes: 114
      },
      {
        name: "Wasef Habib Al Harake",
        sect: "Maronite",
        list: "Kulluna Watani / Baabda Unity & Development",
        votes: 11844
      },
      {
        name: "Joseph Michel Odaimi",
        sect: "Maronite",
        list: "Kulluna Watani / Baabda Unity & Development",
        votes: 200
      },
      {
        name: "Marie-Claude Albert El Helou",
        sect: "Maronite",
        list: "Kulluna Watani / Baabda Unity & Development",
        votes: 468
      },
      {
        name: "Pierre Rachid Bou Assi",
        sect: "Maronite",
        list: "Kulluna Watani / Baabda Unity & Development",
        votes: 13498
      },

      {
        name: "Souheil Assaad Al Aawar",
        sect: "Druze",
        list: "National Accord / Together for Baabda",
        votes: 2257
      },
      {
        name: "Ojoud Mohamad Al Ayash",
        sect: "Druze",
        list: "National Accord / Together for Baabda",
        votes: 10200
      },
      {
        name: "Naji Kamil Gharios",
        sect: "Maronite",
        list: "National Accord / Together for Baabda",
        votes: 2916
      },
      {
        name: "Elie Mikhael Gharios",
        sect: "Maronite",
        list: "National Accord / Together for Baabda",
        votes: 13692
      },
      {
        name: "Hikmat Faraj Dib",
        sect: "Shia",
        list: "National Accord / Together for Baabda",
        votes: 6348
      },
      {
        name: "Ramzeh Jamil Bou Khaled",
        sect: "Shia",
        list: "National Accord / Together for Baabda",
        votes: 4428
      },
      {
        name: "Fadi Fakhri Alameh",
        sect: "Shia",
        list: "National Accord / Together for Baabda",
        votes: 77
      },
      {
        name: "Olfat Hamzeh El Sabeh",
        sect: "Shia",
        list: "National Accord / Together for Baabda",
        votes: 726
      },
      {
        name: "Ali Fadel Ammar",
        sect: "Maronite",
        list: "National Accord / Together for Baabda",
        votes: 103
      },
      {
        name: "Said Mohamad Alameh",
        sect: "Maronite",
        list: "National Accord / Together for Baabda",
        votes: 216
      },
      {
        name: "Alain Joseph Aoun",
        sect: "Maronite",
        list: "National Accord / Together for Baabda",
        votes: 1912
      },
      {
        name: "Paul Shafik Abi Rached",
        sect: "Maronite",
        list: "National Accord / Together for Baabda",
        votes: 2586
      }
    ]
  }
};

// Keep the extracted 2018 drafts in source, but expose only the districts
// that have been manually audited against the report page layout.
const electionResults2018ByTemplateId = {
  "beirut-i": verifiedElectionResults2018ByTemplateId["beirut-i"],
  "bekaa-iii": verifiedElectionResults2018ByTemplateId["bekaa-iii"],
  "mount-lebanon-i": verifiedElectionResults2018ByTemplateId["mount-lebanon-i"],
  "mount-lebanon-ii": verifiedElectionResults2018ByTemplateId["mount-lebanon-ii"],
  "mount-lebanon-iii": verifiedElectionResults2018ByTemplateId["mount-lebanon-iii"],
  "north-iii": verifiedElectionResults2018ByTemplateId["north-iii"],
  "south-i": verifiedElectionResults2018ByTemplateId["south-i"],
  "south-ii": verifiedElectionResults2018ByTemplateId["south-ii"]
};

export function getElectionResults2018TemplateIds() {
  return Object.keys(electionResults2018ByTemplateId).sort();
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

  return scenario;
}

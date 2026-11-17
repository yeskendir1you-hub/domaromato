/* =========================================================
   Dom Aromatov — каталог.
   Редактируйте этот файл, чтобы менять ароматы, цены и контакты.
   ========================================================= */

window.DA_CONFIG = {
  // Номер WhatsApp в международном формате, только цифры (например "77011234567").
  // Пока пусто — заказ откроется в WhatsApp с выбором контакта.
  whatsapp: "",
  tiktok: "https://www.tiktok.com/@dom_aromato",
  currency: "₸",
  // Объёмы отливанта (мл) и цены по ценовым группам. ПРОВЕРЬТЕ И ЗАМЕНИТЕ НА СВОИ.
  volumes: [5, 10, 20],
  prices: {
    lux:     { 5: 6000, 10: 11000, 20: 20000 },
    premium: { 5: 5000, 10: 9000,  20: 16000 },
    classic: { 5: 3500, 10: 6000,  20: 11000 }
  }
};

/* gender: w — женский, m — мужской, u — унисекс, null — уточняется
   family: fresh | floral | woody | oriental | gourmand | musk | null
   color: оттенок «жидкости» во флаконе на сайте
   notes: null — ноты не указаны (покупатель увидит «уточните в WhatsApp») */
window.DA_PERFUMES = [
  { id: "lv-symphony",      brand: "Louis Vuitton", name: "Symphony",              gender: "u", family: "fresh",    tier: "lux",     color: "#e8d27f", notes: "грейпфрут, имбирь, бергамот" },
  { id: "lv-imagination",   brand: "Louis Vuitton", name: "Imagination",           gender: "m", family: "fresh",    tier: "lux",     color: "#d8bf73", notes: "цитрон, чёрный чай, амбра" },
  { id: "chopard",          brand: "Chopard",       name: "Chopard",               gender: null, family: null,      tier: "premium", color: "#b98a4e", notes: null },
  { id: "dolce-gabbana",    brand: "Dolce & Gabbana", name: "Dolce & Gabbana",     gender: null, family: null,      tier: "classic", color: "#bcd3e3", notes: null },
  { id: "pdm-valaya",       brand: "Parfums de Marly", name: "Valaya",             gender: "w", family: "musk",     tier: "lux",     color: "#efe4d4", notes: "альдегиды, флёрдоранж, белый мускус" },
  { id: "white-chocolate",  brand: null,            name: "Белый шоколад",         gender: null, family: "gourmand", tier: "premium", color: "#eedcc0", notes: null },
  { id: "mab-tilia",        brand: "Marc-Antoine Barrois", name: "Tilia",          gender: "u", family: "floral",   tier: "lux",     color: "#dfe2a9", notes: "липовый цвет, жасмин, мускус" },
  { id: "mab-ganymede",     brand: "Marc-Antoine Barrois", name: "Ganymede",       gender: "u", family: "woody",    tier: "lux",     color: "#b8b0a2", notes: "мандарин, османтус, замша, минеральные ноты" },
  { id: "athenais",         brand: null,            name: "Athénaïs",              gender: null, family: null,      tier: "premium", color: "#e2c3a8", notes: null },
  { id: "creed-wild-vetiver", brand: "Creed",       name: "Wild Vetiver",          gender: "m", family: "woody",    tier: "lux",     color: "#b6c08d", notes: "ветивер, бергамот, свежая зелень" },
  { id: "molecule-01",      brand: "Escentric Molecules", name: "Molecule 01",     gender: "u", family: "musk",     tier: "classic", color: "#ece6dc", notes: "Iso E Super — один кристально чистый древесный аккорд" },
  { id: "amouage-honour",   brand: "Amouage",       name: "Honour",                gender: null, family: "floral",  tier: "lux",     color: "#f1e7d1", notes: null },
  { id: "amouage-guidance", brand: "Amouage",       name: "Guidance",              gender: "u", family: "oriental", tier: "lux",     color: "#d7a65a", notes: "груша, лесной орех, ладан, роза, сандал" },
  { id: "prada",            brand: "Prada",         name: "Prada",                 gender: null, family: null,      tier: "premium", color: "#e9c4b6", notes: null },
  { id: "chanel-splendide", brand: "Chanel",        name: "Splendide",             gender: null, family: null,      tier: "lux",     color: "#ead8b4", notes: null },
  { id: "creed-carmina",    brand: "Creed",         name: "Carmina",               gender: "w", family: "oriental", tier: "lux",     color: "#9c2a3a", notes: "чёрная вишня, роза, шафран, мускус" },
  { id: "aldebaran",        brand: null,            name: "Aldebaran",             gender: null, family: null,      tier: "premium", color: "#c99a62", notes: null },
  { id: "juliette",         brand: null,            name: "Juliette",              gender: null, family: null,      tier: "premium", color: "#f0b7bf", notes: null },
  { id: "attar-musk",       brand: "Attar Collection", name: "Musk",               gender: null, family: "musk",    tier: "premium", color: "#eadbc8", notes: null },
  { id: "serge",            brand: null,            name: "Серджов",               gender: null, family: null,      tier: "premium", color: "#a8794c", notes: null },
  { id: "kilian-ggb",       brand: "Kilian",        name: "Good Girl Gone Bad",    gender: "w", family: "floral",   tier: "lux",     color: "#f0c3c7", notes: "тубероза, жасмин, роза, османтус" },
  { id: "kilian-apple",     brand: "Kilian",        name: "Apple Brandy on the Rocks", gender: "u", family: "gourmand", tier: "lux", color: "#c37a2c", notes: "яблоко, бренди, ваниль, кедр" },
  { id: "kilian-angels",    brand: "Kilian",        name: "Angels' Share",         gender: "u", family: "gourmand", tier: "lux",     color: "#a4561d", notes: "коньяк, корица, пралине, ваниль" },
  { id: "ep-bois-imperial", brand: "Essential Parfums", name: "Bois Impérial",     gender: "u", family: "woody",    tier: "premium", color: "#8d7c53", notes: "ветивер, базилик, пачули, акигалавуд" },
  { id: "initio-narcotic",  brand: "Initio",        name: "Narcotic Delight",      gender: "u", family: "oriental", tier: "lux",     color: "#7b1f2c", notes: "вишнёвый ликёр, коньяк, ваниль, белые цветы" },
  { id: "exn-fleur",        brand: "Ex Nihilo",     name: "Fleur Narcotique",      gender: "u", family: "floral",   tier: "lux",     color: "#f3dde0", notes: "бергамот, пион, жасмин, личи, мускус" },
  { id: "talisman",         brand: null,            name: "Talisman",              gender: null, family: null,      tier: "premium", color: "#d4b06a", notes: null },
  { id: "creed-centaurus",  brand: "Creed",         name: "Centaurus",             gender: "m", family: "woody",    tier: "lux",     color: "#a99567", notes: null },
  { id: "lv-attrape",       brand: "Louis Vuitton", name: "Attrape-Rêves",         gender: "w", family: "floral",   tier: "lux",     color: "#e6a79e", notes: "личи, пион, какао, пачули" },
  { id: "montale-roses",    brand: "Montale",       name: "Roses Musk",            gender: "w", family: "musk",     tier: "classic", color: "#efc5cd", notes: "роза, жасмин, мускус" },
  { id: "montale-cafe",     brand: "Montale",       name: "Intense Café",          gender: "u", family: "gourmand", tier: "classic", color: "#6c4125", notes: "кофе, роза, ваниль, амбра" },
  { id: "montale-capri",    brand: "Montale",       name: "Soleil de Capri",       gender: "u", family: "fresh",    tier: "classic", color: "#f2d98c", notes: "цитрусы, белые цветы, кокос" },
  { id: "li-blanche-bete",  brand: "Liquides Imaginaires", name: "Blanche Bête",   gender: "u", family: "musk",     tier: "premium", color: "#f2ede2", notes: "белые цветы, сливочные ноты, ваниль, мускус" },
  { id: "creed-smw",        brand: "Creed",         name: "Silver Mountain Water", gender: "u", family: "fresh",    tier: "lux",     color: "#cbdde4", notes: "бергамот, мандарин, чёрная смородина, зелёный чай" },
  { id: "creed-aventus",    brand: "Creed",         name: "Aventus",               gender: "m", family: "woody",    tier: "lux",     color: "#cbd2b5", notes: "ананас, берёза, бергамот, мускус" },
  { id: "pdm-althair",      brand: "Parfums de Marly", name: "Althaïr",            gender: "m", family: "oriental", tier: "lux",     color: "#d7a763", notes: "бурбонская ваниль, кардамон, пралине, амбра" },
  { id: "creed-absolu",     brand: "Creed",         name: "Absolu Aventus",        gender: "m", family: "woody",    tier: "lux",     color: "#bfc6a0", notes: "ананас, грейпфрут, бергамот, древесные ноты" },
  { id: "kosmala-4",        brand: "Thomas Kosmala", name: "No.4 Après l'Amour",   gender: "u", family: "fresh",    tier: "premium", color: "#efe0b2", notes: "грейпфрут, лемонграсс, амбра, мускус" },
  { id: "pdm-delina",       brand: "Parfums de Marly", name: "Delina",             gender: "w", family: "floral",   tier: "lux",     color: "#f4c7d3", notes: "турецкая роза, личи, ревень, ваниль" },
  { id: "initio-oud",       brand: "Initio",        name: "Oud for Greatness",     gender: "u", family: "woody",    tier: "lux",     color: "#4b2e1f", notes: "уд, шафран, мускатный орех, пачули" }
];

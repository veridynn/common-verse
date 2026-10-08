import type { Locale } from "@poetry/i18n";

// Original demo writing and matching translations, not real published poetry.
// Faker supplies names and scheduling; editorial prose never uses locale fallbacks.
export const bulkFixtures = {
  de: {
    poemTitles: [
      "Das offene Fenster",
      "Ein Tisch für alle",
      "Der Weg nach Hause",
    ],
    lines: [
      "Am Fenster wartet das Licht.",
      "Eine Stimme trägt den Morgen hinein.",
      "Wir legen unsere Wörter auf den Tisch.",
      "Zwischen zwei Sprachen wächst ein Garten.",
      "Der Weg erinnert sich an unsere Schritte.",
      "Heute bleibt die Tür offen.",
    ],
    workshopTitles: [
      "Schreiben zwischen Sprachen",
      "Erinnerungen an die Stadt",
      "Gedichte gemeinsam lesen",
    ],
    description: "Ein offener Workshop über Sprache, Erinnerung und Begegnung.",
    content:
      "Wir lesen gemeinsam, schreiben in mehreren Sprachen und teilen unsere Texte. Bringe ein Wort, eine Erinnerung oder eine Frage mit. Vorkenntnisse sind nicht erforderlich.",
    biography:
      "Eine fiktive Person aus unserem Demo-Schreibkollektiv. Sie schreibt über Sprache, Erinnerung und das gemeinsame Leben in der Stadt.",
    location: "The Poetry Project, Berlin",
    alt: "Farbige Kreise und Linien auf hellem Hintergrund",
    pageTitle: "Notizen aus der Schreibwerkstatt",
  },
  en: {
    poemTitles: ["The Open Window", "A Table for Everyone", "The Way Home"],
    lines: [
      "Light waits at the window.",
      "A voice carries the morning inside.",
      "We place our words on the table.",
      "Between two languages a garden grows.",
      "The path remembers our footsteps.",
      "Today the door stays open.",
    ],
    workshopTitles: [
      "Writing Between Languages",
      "Memories of the City",
      "Reading Poems Together",
    ],
    description: "An open workshop about language, memory, and connection.",
    content:
      "We read together, write in several languages, and share our texts. Bring a word, a memory, or a question. No previous experience is required.",
    biography:
      "A fictional member of our demo writing collective. They write about language, memory, and shared life in the city.",
    location: "The Poetry Project, Berlin",
    alt: "Coloured circles and lines on a light background",
    pageTitle: "Notes from the Writing Workshop",
  },
  ar: {
    poemTitles: ["النافذة المفتوحة", "طاولة للجميع", "الطريق إلى البيت"],
    lines: [
      "ينتظر الضوء عند النافذة.",
      "يحمل صوت الصباح إلى الداخل.",
      "نضع كلماتنا على الطاولة.",
      "بين لغتين تنمو حديقة.",
      "يتذكر الطريق خطواتنا.",
      "اليوم يبقى الباب مفتوحًا.",
    ],
    workshopTitles: [
      "الكتابة بين اللغات",
      "ذكريات المدينة",
      "قراءة القصائد معًا",
    ],
    description: "ورشة مفتوحة حول اللغة والذاكرة والتواصل.",
    content:
      "نقرأ معًا ونكتب بلغات متعددة ونتشارك نصوصنا. أحضر كلمة أو ذكرى أو سؤالًا. لا تحتاج إلى خبرة سابقة.",
    biography:
      "شخصية خيالية من مجموعة الكتابة التجريبية. تكتب عن اللغة والذاكرة والحياة المشتركة في المدينة.",
    location: "مشروع الشعر، برلين",
    alt: "دوائر وخطوط ملونة على خلفية فاتحة",
    pageTitle: "ملاحظات من ورشة الكتابة",
  },
  fa: {
    poemTitles: ["پنجرهٔ باز", "میزی برای همه", "راه خانه"],
    lines: [
      "نور کنار پنجره منتظر است.",
      "صدایی صبح را به درون می‌آورد.",
      "واژه‌هایمان را روی میز می‌گذاریم.",
      "میان دو زبان باغی می‌روید.",
      "راه قدم‌های ما را به یاد دارد.",
      "امروز در باز می‌ماند.",
    ],
    workshopTitles: ["نوشتن میان زبان‌ها", "خاطره‌های شهر", "خواندن شعر با هم"],
    description: "کارگاهی آزاد دربارهٔ زبان، خاطره و پیوند.",
    content:
      "با هم می‌خوانیم، به چند زبان می‌نویسیم و متن‌هایمان را به اشتراک می‌گذاریم. یک واژه، خاطره یا پرسش بیاورید. نیازی به تجربهٔ قبلی نیست.",
    biography:
      "شخصیتی خیالی از گروه نوشتن آزمایشی ما. دربارهٔ زبان، خاطره و زندگی مشترک در شهر می‌نویسد.",
    location: "پروژه شعر، برلین",
    alt: "دایره‌ها و خط‌های رنگی روی زمینه‌ای روشن",
    pageTitle: "یادداشت‌های کارگاه نوشتن",
  },
  uk: {
    poemTitles: ["Відчинене вікно", "Стіл для всіх", "Дорога додому"],
    lines: [
      "Світло чекає біля вікна.",
      "Голос приносить ранок усередину.",
      "Ми кладемо наші слова на стіл.",
      "Між двома мовами росте сад.",
      "Дорога пам’ятає наші кроки.",
      "Сьогодні двері залишаються відчиненими.",
    ],
    workshopTitles: [
      "Письмо між мовами",
      "Спогади про місто",
      "Читаємо вірші разом",
    ],
    description: "Відкрита майстерня про мову, пам’ять і зв’язок.",
    content:
      "Ми читаємо разом, пишемо кількома мовами й ділимося текстами. Принесіть слово, спогад або запитання. Попередній досвід не потрібний.",
    biography:
      "Вигадана людина з нашого демонстраційного письменницького колективу. Пише про мову, пам’ять і спільне життя в місті.",
    location: "Поетичний проєкт, Берлін",
    alt: "Кольорові кола й лінії на світлому тлі",
    pageTitle: "Нотатки з письменницької майстерні",
  },
  ku: {
    poemTitles: ["Paceya Vekirî", "Maseyek ji bo Hemûyan", "Riya Malê"],
    lines: [
      "Ronahî li ber paceyê li bendê ye.",
      "Dengek sibehê tîne hundir.",
      "Em peyvên xwe li ser masê datînin.",
      "Di navbera du zimanan de baxçeyek mezin dibe.",
      "Rê gavên me bi bîr tîne.",
      "Îro derî vekirî dimîne.",
    ],
    workshopTitles: [
      "Nivîsandin di Navbera Zimanan de",
      "Bîranînên Bajêr",
      "Bi Hev re Helbest Xwendin",
    ],
    description: "Atolyeyeke vekirî li ser ziman, bîranîn û têkilî.",
    content:
      "Em bi hev re dixwînin, bi gelek zimanan dinivîsin û nivîsên xwe parve dikin. Peyvek, bîranînek an pirsek bînin. Ezmûna berê ne pêwîst e.",
    biography:
      "Kesekî xeyalî ji koma nivîsandina me ya ceribandinê. Li ser ziman, bîranîn û jiyana hevpar a bajêr dinivîse.",
    location: "Projeya Helbestê, Berlîn",
    alt: "Daire û xêzên rengîn li ser paşxaneyeke ronî",
    pageTitle: "Nîşe ji Atolyeya Nivîsandinê",
  },
} satisfies Record<
  Locale,
  {
    poemTitles: string[];
    lines: string[];
    workshopTitles: string[];
    description: string;
    content: string;
    biography: string;
    location: string;
    alt: string;
    pageTitle: string;
  }
>;

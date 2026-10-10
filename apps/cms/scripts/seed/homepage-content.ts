import type { Locale } from "@poetry/i18n";
import type { Homepage } from "../../src/payload-types";

export const homepageContent = {
  de: {
    feature: {
      kind: "poem",
      heading: "Viele Sprachen. Ein Ort, gehört zu werden.",
      description:
        "Gedichte tragen Geschichten über Grenzen. Entdecke die Stimmen, lerne die Menschen kennen und schreib mit uns.",
    },
    sections: [
      {
        id: "homepage-intro",
        blockType: "introduction",
        heading: "Geschichten, die uns näherbringen.",
        description:
          "The Poetry Project bringt junge Menschen mit und ohne Fluchterfahrung beim Schreiben zusammen. In vielen Sprachen werden Erinnerungen, Fragen und Hoffnungen zu Gedichten — und wir schaffen Raum, einander zuzuhören.",
        linkLabel: "Kontakt",
        linkUrl: "https://thepoetryproject.de/kontakt",
      },
      {
        id: "homepage-poets",
        blockType: "poets",
        selectionMode: "manual",
        enabled: true,
        heading: "Die Menschen hinter den Worten",
        description:
          "Lerne die Poet*innen und ihre Geschichten in ihren eigenen Worten kennen.",
      },
      {
        id: "homepage-poems",
        blockType: "poems",
        enabled: true,
        selectionMode: "auto",
        heading: "Gedichte entdecken",
      },
      {
        id: "homepage-events",
        blockType: "events",
        selectionMode: "auto",
        enabled: true,
        heading: "Schreib mit. Hör zu.",
        description:
          "Komm zu einem Schreibworkshop oder erlebe unsere Poet*innen bei einer öffentlichen Lesung.",
      },
      {
        id: "homepage-participation",
        blockType: "participation",
        enabled: true,
        heading: "Hier ist Platz für dich.",
        links: [
          {
            title: "Schreib mit uns",
            description:
              "Finde eine Schreibgruppe und Raum für deine eigenen Worte.",
            url: "/workshops",
          },
          {
            title: "Lade uns ein",
            description:
              "Hol eine Lesung oder einen Schreibworkshop an deine Schule, Universität oder Organisation.",
            url: "https://thepoetryproject.de/bildung/schule",
          },
          {
            title: "Unterstütze das Projekt",
            description:
              "Hilf uns, mehr Möglichkeiten zum Schreiben, Begegnen und Gehörtwerden zu schaffen.",
            url: "https://thepoetryproject.de/spenden",
          },
        ],
      },
      {
        id: "homepage-newsletter",
        blockType: "newsletter",
        enabled: true,
        heading: "Ein bisschen Poesie im Postfach.",
        description:
          "Unser Newsletter informiert dich über neue Gedichte, Lesungen und Workshops.",
        linkLabel: "Newsletter abonnieren",
        linkUrl: "https://thepoetryproject.de/newsletter",
      },
    ],
  },
  uk: {
    feature: {
      kind: "poem",
      heading: "Багато мов. Місце, де тебе почують.",
      description:
        "Вірші несуть історії крізь кордони. Відкривайте голоси, знайомтеся з людьми та пишіть із нами.",
    },
    sections: [
      {
        id: "homepage-intro",
        blockType: "introduction",
        heading: "Історії, що зближують.",
        description:
          "The Poetry Project об’єднує через письмо молодих людей із досвідом вимушеного переселення та без нього. Різними мовами ми перетворюємо спогади, запитання й надії на вірші та створюємо простір, щоб слухати одне одного.",
        linkLabel: "Контакти",
        linkUrl: "https://thepoetryproject.de/kontakt",
      },
      {
        id: "homepage-poets",
        blockType: "poets",
        selectionMode: "manual",
        enabled: true,
        heading: "Люди за словами",
        description:
          "Знайомтеся з поетами та їхніми історіями, розказаними власними словами.",
      },
      {
        id: "homepage-poems",
        blockType: "poems",
        enabled: true,
        selectionMode: "auto",
        heading: "Час для поезії",
      },
      {
        id: "homepage-events",
        blockType: "events",
        selectionMode: "auto",
        enabled: true,
        heading: "Приходьте писати. Приходьте слухати.",
        description:
          "Долучайтеся до майстерні письма або слухайте наших поетів на відкритих читаннях.",
      },
      {
        id: "homepage-participation",
        blockType: "participation",
        enabled: true,
        heading: "Тут є місце для вас.",
        links: [
          {
            title: "Пишіть із нами",
            description: "Знайдіть групу письма та простір для власних слів.",
            url: "/workshops",
          },
          {
            title: "Запросіть нас",
            description:
              "Організуйте читання або майстерню письма у своїй школі, університеті чи організації.",
            url: "https://thepoetryproject.de/bildung/schule",
          },
          {
            title: "Підтримайте проєкт",
            description:
              "Допоможіть створити більше можливостей писати, зустрічатися та бути почутими.",
            url: "https://thepoetryproject.de/spenden",
          },
        ],
      },
      {
        id: "homepage-newsletter",
        blockType: "newsletter",
        enabled: true,
        heading: "Трохи поезії у вашій пошті.",
        description:
          "Дізнавайтеся про нові вірші, читання та майстерні з нашої розсилки.",
        linkLabel: "Підписатися на розсилку",
        linkUrl: "https://thepoetryproject.de/newsletter",
      },
    ],
  },
  ku: {
    feature: {
      kind: "poem",
      heading: "Gelek ziman. Cihek ji bo dengê te.",
      description:
        "Helbest çîrokan ji sînoran derbas dikin. Dengan nas bike, bi mirovan re hevdîtinê bike û bi me re binivîse.",
    },
    sections: [
      {
        id: "homepage-intro",
        blockType: "introduction",
        heading: "Çîrokên ku me nêzî hev dikin.",
        description:
          "The Poetry Project ciwanên bi ezmûna koçberiyê û bê wê bi nivîsandinê tîne cem hev. Bi gelek zimanan em bîranîn, pirs û hêviyan dikin helbest û ji bo guhdarîkirina hev cihê çêdikin.",
        linkLabel: "Têkilî",
        linkUrl: "https://thepoetryproject.de/kontakt",
      },
      {
        id: "homepage-poets",
        blockType: "poets",
        selectionMode: "manual",
        enabled: true,
        heading: "Mirovên li pişt peyvan",
        description: "Helbestvan û çîrokên wan bi peyvên wan nas bike.",
      },
      {
        id: "homepage-poems",
        blockType: "poems",
        enabled: true,
        selectionMode: "auto",
        heading: "Demek ji bo helbestê",
      },
      {
        id: "homepage-events",
        blockType: "events",
        selectionMode: "auto",
        enabled: true,
        heading: "Were binivîse. Were guhdarî bike.",
        description:
          "Beşdarî atolyeya nivîsandinê bibe an di xwendineke vekirî de li helbestvanên me guhdarî bike.",
      },
      {
        id: "homepage-participation",
        blockType: "participation",
        enabled: true,
        heading: "Li vir ji bo te cih heye.",
        links: [
          {
            title: "Bi me re binivîse",
            description: "Komeke nivîsandinê û cihek ji bo peyvên xwe bibîne.",
            url: "/workshops",
          },
          {
            title: "Me vexwîne",
            description:
              "Xwendinek an atolyeya nivîsandinê li dibistan, zanîngeh an rêxistina xwe saz bike.",
            url: "https://thepoetryproject.de/bildung/schule",
          },
          {
            title: "Piştgiriya projeyê bike",
            description:
              "Alîkariya me bike da ku derfetên zêdetir ji bo nivîsandin, hevdîtin û bihîstinê çêbikin.",
            url: "https://thepoetryproject.de/spenden",
          },
        ],
      },
      {
        id: "homepage-newsletter",
        blockType: "newsletter",
        enabled: true,
        heading: "Hinek helbest di posta te de.",
        description:
          "Bi nameya me ji helbest, xwendin û atolyeyên nû haydar bibe.",
        linkLabel: "Aboneyê nameyê bibe",
        linkUrl: "https://thepoetryproject.de/newsletter",
      },
    ],
  },
  en: {
    feature: {
      kind: "poem",
      heading: "Many languages. A place to be heard.",
      description:
        "Poems carry stories across borders. Discover the voices, meet the people, and write with us.",
    },
    sections: [
      {
        id: "homepage-intro",
        blockType: "introduction",
        heading: "Stories that bring us closer.",
        description:
          "The Poetry Project brings young people with and without experiences of displacement together through writing. In many languages, we turn memories, questions, and hopes into poems — and make room to listen to one another.",
        linkLabel: "Contact",
        linkUrl: "https://thepoetryproject.de/kontakt",
      },
      {
        id: "homepage-poets",
        blockType: "poets",
        selectionMode: "manual",
        enabled: true,
        heading: "The people behind the words",
        description:
          "Meet the poets and discover the stories in their own words.",
      },
      {
        id: "homepage-poems",
        blockType: "poems",
        enabled: true,
        selectionMode: "auto",
        heading: "Poems to spend time with",
      },
      {
        id: "homepage-events",
        blockType: "events",
        selectionMode: "auto",
        enabled: true,
        heading: "Poetry workshops",
        description:
          "Join a writing workshop or hear our poets at a public reading.",
      },
      {
        id: "homepage-participation",
        blockType: "participation",
        enabled: true,
        heading: "There is a place for you here.",
        links: [
          {
            title: "Write with us",
            description:
              "Find a writing group and make space for your own words.",
            url: "/workshops",
          },
          {
            title: "Invite us",
            description:
              "Bring a reading or writing workshop to your school, university, or organisation.",
            url: "https://thepoetryproject.de/bildung/schule",
          },
          {
            title: "Support the project",
            description:
              "Help us create more opportunities to write, meet, and be heard.",
            url: "https://thepoetryproject.de/spenden",
          },
        ],
      },
      {
        id: "homepage-newsletter",
        blockType: "newsletter",
        enabled: true,
        heading: "A little poetry in your inbox.",
        description:
          "Hear about new poems, readings, and workshops in our newsletter.",
        linkLabel: "Subscribe to the newsletter",
        linkUrl: "https://thepoetryproject.de/newsletter",
      },
    ],
  },
  fa: {
    feature: {
      kind: "poem",
      heading: "زبان‌های بسیار. جایی برای شنیده‌شدن.",
      description:
        "شعرها داستان‌ها را از مرزها عبور می‌دهند. صداها را کشف کنید، با آدم‌ها آشنا شوید و با ما بنویسید.",
    },
    sections: [
      {
        id: "homepage-intro",
        blockType: "introduction",
        heading: "داستان‌هایی که ما را نزدیک می‌کنند.",
        description:
          "پروژهٔ شعر جوانان با تجربهٔ آوارگی و بدون آن را از راه نوشتن گرد هم می‌آورد. به زبان‌های گوناگون، خاطره‌ها، پرسش‌ها و امیدها را به شعر تبدیل می‌کنیم و فضایی برای شنیدن یکدیگر می‌سازیم.",
        linkLabel: "تماس",
        linkUrl: "https://thepoetryproject.de/kontakt",
      },
      {
        id: "homepage-poets",
        blockType: "poets",
        selectionMode: "manual",
        enabled: true,
        heading: "آدم‌های پشت واژه‌ها",
        description: "با شاعران و داستان‌هایشان از زبان خودشان آشنا شوید.",
      },
      {
        id: "homepage-poems",
        blockType: "poems",
        enabled: true,
        selectionMode: "auto",
        heading: "زمانی برای شعر",
      },
      {
        id: "homepage-events",
        blockType: "events",
        selectionMode: "auto",
        enabled: true,
        heading: "بیایید بنویسید. بیایید بشنوید.",
        description:
          "به یک کارگاه نوشتن بپیوندید یا در شعرخوانی عمومی به شاعران ما گوش دهید.",
      },
      {
        id: "homepage-participation",
        blockType: "participation",
        enabled: true,
        heading: "اینجا برای شما جا هست.",
        links: [
          {
            title: "با ما بنویسید",
            description:
              "گروهی برای نوشتن و فضایی برای واژه‌های خود پیدا کنید.",
            url: "/workshops",
          },
          {
            title: "از ما دعوت کنید",
            description:
              "در مدرسه، دانشگاه یا سازمان خود میزبان شعرخوانی یا کارگاه نوشتن باشید.",
            url: "https://thepoetryproject.de/bildung/schule",
          },
          {
            title: "از پروژه حمایت کنید",
            description:
              "به ما کمک کنید فرصت‌های بیشتری برای نوشتن، دیدار و شنیده‌شدن بسازیم.",
            url: "https://thepoetryproject.de/spenden",
          },
        ],
      },
      {
        id: "homepage-newsletter",
        blockType: "newsletter",
        enabled: true,
        heading: "کمی شعر در صندوق پستی شما.",
        description:
          "از شعرها، شعرخوانی‌ها و کارگاه‌های تازه در خبرنامهٔ ما باخبر شوید.",
        linkLabel: "عضویت در خبرنامه",
        linkUrl: "https://thepoetryproject.de/newsletter",
      },
    ],
  },
  ar: {
    feature: {
      kind: "poem",
      heading: "لغات كثيرة. ومكان لنُسمَع.",
      description:
        "تحمل القصائد الحكايات عبر الحدود. اكتشف الأصوات وتعرّف إلى أصحابها واكتب معنا.",
    },
    sections: [
      {
        id: "homepage-intro",
        blockType: "introduction",
        heading: "حكايات تقرّبنا.",
        description:
          "يجمع مشروع الشعر شبابًا عاشوا تجربة النزوح وآخرين لم يعيشوها من خلال الكتابة. بلغات متعددة، نحوّل الذكريات والأسئلة والآمال إلى قصائد ونفسح مجالًا للإصغاء إلى بعضنا.",
        linkLabel: "تواصل معنا",
        linkUrl: "https://thepoetryproject.de/kontakt",
      },
      {
        id: "homepage-poets",
        blockType: "poets",
        selectionMode: "manual",
        enabled: true,
        heading: "الأشخاص وراء الكلمات",
        description: "تعرّف إلى الشعراء وحكاياتهم بكلماتهم الخاصة.",
      },
      {
        id: "homepage-poems",
        blockType: "poems",
        enabled: true,
        selectionMode: "auto",
        heading: "قصائد نقرأها معًا",
      },
      {
        id: "homepage-events",
        blockType: "events",
        selectionMode: "auto",
        enabled: true,
        heading: "تعال لتكتب. تعال لتستمع.",
        description: "شارك في ورشة كتابة أو استمع إلى شعرائنا في قراءة عامة.",
      },
      {
        id: "homepage-participation",
        blockType: "participation",
        enabled: true,
        heading: "لك مكان هنا.",
        links: [
          {
            title: "اكتب معنا",
            description: "اعثر على مجموعة كتابة ومساحة لكلماتك.",
            url: "/workshops",
          },
          {
            title: "ادعُنا",
            description:
              "استضف قراءة أو ورشة كتابة في مدرستك أو جامعتك أو مؤسستك.",
            url: "https://thepoetryproject.de/bildung/schule",
          },
          {
            title: "ادعم المشروع",
            description:
              "ساعدنا في توفير فرص أكثر للكتابة واللقاء وإيصال الأصوات.",
            url: "https://thepoetryproject.de/spenden",
          },
        ],
      },
      {
        id: "homepage-newsletter",
        blockType: "newsletter",
        enabled: true,
        heading: "قليل من الشعر في بريدك.",
        description:
          "تعرّف إلى القصائد والقراءات والورش الجديدة عبر نشرتنا البريدية.",
        linkLabel: "اشترك في النشرة البريدية",
        linkUrl: "https://thepoetryproject.de/newsletter",
      },
    ],
  },
} satisfies Record<Locale, Pick<Homepage, "feature" | "sections">>;

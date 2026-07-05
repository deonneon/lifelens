import type {
  Account,
  Decision,
  Entity,
  PendingCharacter,
  Source,
  Stance,
  UniverseEvent,
  UniverseState,
} from '../types'

// ─────────────────────────────────────────────────────────────────────────
// Characters
// ─────────────────────────────────────────────────────────────────────────

const entities: Entity[] = [
  {
    id: 'elon-musk',
    kind: 'person',
    name: 'Elon Musk',
    aliases: ['Elon', 'Musk', '@elonmusk'],
    origin: 'b. June 28, 1971 — Pretoria, South Africa',
    bio: [
      {
        text: 'Elon Reeve Musk was born on June 28, 1971 in Pretoria, South Africa, emigrated to Canada at 17, and finished degrees in physics and economics at the University of Pennsylvania.',
        sourceIds: ['src-vance', 'src-isaacson'],
      },
      {
        text: 'After selling Zip2 to Compaq and merging X.com into what became PayPal, he rolled nearly all of his proceeds into SpaceX and Tesla — coming within days of losing both companies in December 2008.',
        sourceIds: ['src-vance', 'src-isaacson'],
      },
      {
        text: 'He has led SpaceX since 2002 and Tesla since 2008, co-founded and later broke with OpenAI, acquired Twitter in 2022, and founded xAI in 2023.',
        sourceIds: ['src-isaacson', 'src-reuters-xai'],
      },
    ],
    relationships: [
      { targetId: 'zip2', label: 'co-founder' },
      { targetId: 'x-com', label: 'founder; ousted as CEO 2000' },
      { targetId: 'tesla', label: 'CEO since 2008 · founder title disputed' },
      { targetId: 'spacex', label: 'founder & CEO' },
      { targetId: 'openai', label: 'co-founder; departed board 2018' },
      { targetId: 'twitter-x', label: 'acquirer & owner' },
      { targetId: 'xai', label: 'founder' },
    ],
  },
  {
    id: 'martin-eberhard',
    kind: 'person',
    name: 'Martin Eberhard',
    aliases: ['Eberhard'],
    origin: 'b. 1960 — Berkeley, California',
    bio: [
      {
        text: 'Martin Eberhard co-founded Tesla Motors with Marc Tarpenning in 2003 and served as its first CEO until his ouster in 2007.',
        sourceIds: ['src-tesla-inc', 'src-vance'],
      },
      {
        text: 'In 2009 he sued Musk over, among other things, the right to be called a Tesla founder; the settlement allows five people to use the title.',
        sourceIds: ['src-eberhard-suit', 'src-founders-settlement'],
      },
    ],
    relationships: [
      { targetId: 'tesla', label: 'co-founder, first CEO' },
      { targetId: 'marc-tarpenning', label: 'co-founder partnership' },
      { targetId: 'elon-musk', label: 'founder-title lawsuit, settled 2009' },
    ],
  },
  {
    id: 'marc-tarpenning',
    kind: 'person',
    name: 'Marc Tarpenning',
    aliases: ['Tarpenning'],
    origin: 'b. 1964 — Sacramento, California',
    bio: [
      {
        text: 'Marc Tarpenning co-founded Tesla Motors with Martin Eberhard in July 2003 and served as its first CFO and VP of Electrical Engineering.',
        sourceIds: ['src-tesla-inc', 'src-vance'],
      },
    ],
    relationships: [
      { targetId: 'tesla', label: 'co-founder, first CFO' },
      { targetId: 'martin-eberhard', label: 'co-founder partnership' },
    ],
  },
  {
    id: 'jb-straubel',
    kind: 'person',
    name: 'JB Straubel',
    aliases: ['Straubel'],
    origin: 'b. 1975 — Madison, Wisconsin',
    bio: [
      {
        text: 'JB Straubel joined Tesla in 2004 as CTO, is one of the five people entitled to the co-founder title, and led battery and powertrain engineering until leaving in 2019 to run Redwood Materials.',
        sourceIds: ['src-vance', 'src-founders-settlement'],
      },
    ],
    relationships: [
      { targetId: 'tesla', label: 'CTO 2004–2019, co-founder title' },
      { targetId: 'elon-musk', label: 'longtime lieutenant' },
    ],
  },
  {
    id: 'gwynne-shotwell',
    kind: 'person',
    name: 'Gwynne Shotwell',
    aliases: ['Shotwell'],
    origin: 'b. 1963 — Evanston, Illinois',
    bio: [
      {
        text: 'Gwynne Shotwell joined SpaceX in 2002 as employee #11 and VP of business development, and as President & COO has run day-to-day operations for most of its history.',
        sourceIds: ['src-vance'],
      },
    ],
    relationships: [
      { targetId: 'spacex', label: 'President & COO' },
      { targetId: 'elon-musk', label: 'operational counterpart' },
    ],
  },
  {
    id: 'tim-cook',
    kind: 'person',
    name: 'Tim Cook',
    aliases: ['Cook'],
    origin: 'b. 1960 — Mobile, Alabama',
    bio: [
      {
        text: 'Tim Cook has been CEO of Apple since 2011. He publicly denies ever having spoken with Elon Musk, contradicting Musk’s account of trying to sell Tesla to Apple.',
        sourceIds: ['src-cook-sway'],
      },
    ],
    relationships: [
      { targetId: 'apple', label: 'CEO' },
      { targetId: 'elon-musk', label: 'disputed acquisition talks' },
    ],
  },
  {
    id: 'zip2',
    kind: 'company',
    name: 'Zip2',
    aliases: ['Global Link Information Network'],
    origin: 'founded 1995 — Palo Alto, CA · sold to Compaq 1999',
    bio: [
      {
        text: 'Zip2 built online city guides for newspapers. Founded by Elon and Kimbal Musk in 1995, it sold to Compaq in February 1999 for about $307 million.',
        sourceIds: ['src-vance', 'src-isaacson'],
      },
    ],
    relationships: [{ targetId: 'elon-musk', label: 'co-founded by' }],
  },
  {
    id: 'x-com',
    kind: 'company',
    name: 'X.com / PayPal',
    aliases: ['X.com', 'PayPal', 'Confinity'],
    origin: 'founded March 1999 — Palo Alto, CA · sold to eBay 2002',
    bio: [
      {
        text: 'Musk founded online bank X.com in 1999; it merged with Confinity in 2000 and became PayPal, which eBay acquired for $1.5 billion in 2002. Musk was removed as CEO in September 2000 while en route to his honeymoon.',
        sourceIds: ['src-vance', 'src-isaacson'],
      },
    ],
    relationships: [{ targetId: 'elon-musk', label: 'founded by; ousted him as CEO' }],
  },
  {
    id: 'tesla',
    kind: 'company',
    name: 'Tesla',
    aliases: ['Tesla Motors', 'TSLA'],
    origin: 'incorporated July 1, 2003 — San Carlos, CA',
    bio: [
      {
        text: 'Tesla Motors was incorporated in Delaware on July 1, 2003 by Martin Eberhard and Marc Tarpenning.',
        sourceIds: ['src-tesla-inc'],
      },
      {
        text: 'Who counts as a founder is formally contested: the 2009 settlement of Eberhard’s lawsuit permits five people — Eberhard, Tarpenning, Musk, Straubel and Ian Wright — to call themselves co-founders.',
        sourceIds: ['src-eberhard-suit', 'src-founders-settlement'],
      },
      {
        text: 'Musk led the $6.5M Series A in 2004, took over as CEO in the 2008 crisis, and settled SEC fraud charges in 2018 over the “funding secured” tweet by giving up the chairmanship.',
        sourceIds: ['src-vance', 'src-sec-settlement'],
      },
    ],
    relationships: [
      { targetId: 'elon-musk', label: 'CEO; founder title disputed' },
      { targetId: 'martin-eberhard', label: 'co-founded by' },
      { targetId: 'marc-tarpenning', label: 'co-founded by' },
      { targetId: 'jb-straubel', label: 'CTO 2004–2019' },
      { targetId: 'apple', label: 'rumored acquisition target' },
    ],
  },
  {
    id: 'spacex',
    kind: 'company',
    name: 'SpaceX',
    aliases: ['Space Exploration Technologies'],
    origin: 'founded March 2002 — El Segundo, CA',
    bio: [
      {
        text: 'SpaceX was founded by Musk in March 2002 with roughly $100 million of his PayPal proceeds, to radically lower the cost of reaching orbit.',
        sourceIds: ['src-vance'],
      },
      {
        text: 'Its Falcon 1 became the first privately developed liquid-fueled rocket to reach orbit in 2008; a $1.6B NASA resupply contract that December kept the company alive.',
        sourceIds: ['src-spacex-f1', 'src-nasa-crs'],
      },
    ],
    relationships: [
      { targetId: 'elon-musk', label: 'founded by' },
      { targetId: 'gwynne-shotwell', label: 'run day-to-day by' },
    ],
  },
  {
    id: 'openai',
    kind: 'company',
    name: 'OpenAI',
    aliases: [],
    origin: 'founded December 2015 — San Francisco, CA',
    bio: [
      {
        text: 'OpenAI launched in December 2015 as a non-profit AI lab with Musk as co-chair. He left the board in 2018; the reasons — conflict of interest versus a failed bid for control — are themselves disputed.',
        sourceIds: ['src-openai-intro', 'src-openai-2018', 'src-openai-2024'],
      },
    ],
    relationships: [
      { targetId: 'elon-musk', label: 'co-founded by; later adversary' },
      { targetId: 'xai', label: 'competitor' },
    ],
  },
  {
    id: 'twitter-x',
    kind: 'company',
    name: 'Twitter / X',
    aliases: ['Twitter', 'X Corp'],
    origin: 'founded 2006 · acquired by Musk October 2022',
    bio: [
      {
        text: 'Musk completed his $44 billion acquisition of Twitter on October 27, 2022, took it private, and rebranded it as X. In March 2025 xAI acquired X in an all-stock deal.',
        sourceIds: ['src-twitter-close', 'src-reuters-x-xai'],
      },
    ],
    relationships: [
      { targetId: 'elon-musk', label: 'acquired by' },
      { targetId: 'xai', label: 'merged into' },
    ],
  },
  {
    id: 'xai',
    kind: 'company',
    name: 'xAI',
    aliases: ['Grok'],
    origin: 'incorporated March 2023, announced July 2023 — Nevada / Palo Alto',
    bio: [
      {
        text: 'Musk incorporated xAI in Nevada in March 2023 and announced it publicly on July 12, 2023, positioning it as a rival to OpenAI.',
        sourceIds: ['src-xai-announce', 'src-reuters-xai'],
      },
      {
        text: 'In March 2025, xAI acquired X in an all-stock transaction Musk said valued xAI at $80 billion and X at $33 billion.',
        sourceIds: ['src-musk-x-xai', 'src-reuters-x-xai'],
      },
    ],
    relationships: [
      { targetId: 'elon-musk', label: 'founded by' },
      { targetId: 'twitter-x', label: 'acquired' },
      { targetId: 'openai', label: 'competitor' },
    ],
  },
  {
    id: 'apple',
    kind: 'company',
    name: 'Apple',
    aliases: ['AAPL'],
    origin: 'founded 1976 — Cupertino, CA',
    bio: [
      {
        text: 'Apple appears in this universe through a disputed episode: Musk says he tried to sell Tesla to Apple during the Model 3 crisis; Tim Cook says the two have never spoken.',
        sourceIds: ['src-musk-apple-tweet', 'src-cook-sway'],
      },
    ],
    relationships: [
      { targetId: 'tim-cook', label: 'led by' },
      { targetId: 'tesla', label: 'rumored acquirer' },
    ],
  },
]

// ─────────────────────────────────────────────────────────────────────────
// Sources
// ─────────────────────────────────────────────────────────────────────────

const sources: Source[] = [
  {
    id: 'src-vance',
    type: 'biography',
    title: 'Elon Musk: Tesla, SpaceX, and the Quest for a Fantastic Future',
    author: 'Ashlee Vance',
    publisher: 'Ecco / HarperCollins',
    date: '2015-05-19',
  },
  {
    id: 'src-isaacson',
    type: 'biography',
    title: 'Elon Musk',
    author: 'Walter Isaacson',
    publisher: 'Simon & Schuster',
    date: '2023-09-12',
  },
  {
    id: 'src-tesla-inc',
    type: 'official-record',
    title: 'Certificate of Incorporation — Tesla Motors, Inc. (Delaware)',
    date: '2003-07-01',
  },
  {
    id: 'src-eberhard-suit',
    type: 'official-record',
    title: 'Eberhard v. Musk et al. — complaint, Superior Court of California',
    date: '2009-05-26',
  },
  {
    id: 'src-founders-settlement',
    type: 'reporting',
    title: 'Tesla settles lawsuit over who gets to be called a founder',
    publisher: 'Reuters',
    date: '2009-09-21',
  },
  {
    id: 'src-musk-tweet-420',
    type: 'first-hand',
    title: '@elonmusk: “Am considering taking Tesla private at $420. Funding secured.”',
    author: 'Elon Musk',
    publisher: 'Twitter',
    date: '2018-08-07',
  },
  {
    id: 'src-musk-blog-private',
    type: 'first-hand',
    title: 'Update on Taking Tesla Private',
    author: 'Elon Musk',
    publisher: 'Tesla blog',
    date: '2018-08-13',
  },
  {
    id: 'src-sec-complaint',
    type: 'official-record',
    title: 'SEC v. Elon Musk — Complaint 1:18-cv-08865 (S.D.N.Y.)',
    publisher: 'U.S. Securities and Exchange Commission',
    date: '2018-09-27',
    url: 'https://www.sec.gov/litigation/complaints/2018/comp-pr2018-219.pdf',
  },
  {
    id: 'src-sec-settlement',
    type: 'official-record',
    title: 'SEC Press Release 2018-226: Elon Musk Settles Fraud Charges',
    publisher: 'U.S. Securities and Exchange Commission',
    date: '2018-09-29',
    url: 'https://www.sec.gov/news/press-release/2018-226',
  },
  {
    id: 'src-spacex-f1',
    type: 'first-hand',
    title: 'SpaceX press release: Falcon 1 Flight 4 reaches orbit',
    publisher: 'SpaceX',
    date: '2008-09-28',
  },
  {
    id: 'src-reuters-orbit',
    type: 'reporting',
    title: 'Privately funded SpaceX rocket reaches orbit on fourth try',
    publisher: 'Reuters',
    date: '2008-09-29',
  },
  {
    id: 'src-nasa-crs',
    type: 'official-record',
    title: 'NASA Awards Space Station Commercial Resupply Services Contracts',
    publisher: 'NASA',
    date: '2008-12-23',
  },
  {
    id: 'src-ttac-deathwatch',
    type: 'rumor',
    title: '“Tesla Death Watch” series — speculation of imminent collapse',
    publisher: 'The Truth About Cars',
    date: '2008-05',
  },
  {
    id: 'src-reuters-dragon',
    type: 'reporting',
    title: 'SpaceX Dragon capsule reaches space station in historic first',
    publisher: 'Reuters',
    date: '2012-05-25',
  },
  {
    id: 'src-verge-f9',
    type: 'reporting',
    title: 'SpaceX successfully lands its Falcon 9 rocket back on Earth',
    publisher: 'The Verge',
    date: '2015-12-21',
  },
  {
    id: 'src-openai-intro',
    type: 'first-hand',
    title: 'Introducing OpenAI',
    publisher: 'OpenAI blog',
    date: '2015-12-11',
    url: 'https://openai.com/blog/introducing-openai',
  },
  {
    id: 'src-openai-2018',
    type: 'first-hand',
    title: 'OpenAI blog: Elon Musk departs board',
    publisher: 'OpenAI blog',
    date: '2018-02-20',
  },
  {
    id: 'src-openai-2024',
    type: 'first-hand',
    title: 'OpenAI and Elon Musk — email correspondence published',
    publisher: 'OpenAI blog',
    date: '2024-03-05',
    url: 'https://openai.com/blog/openai-elon-musk',
  },
  {
    id: 'src-musk-apple-tweet',
    type: 'first-hand',
    title: '@elonmusk: on offering to sell Tesla to Apple “during the darkest days of the Model 3 program”',
    author: 'Elon Musk',
    publisher: 'Twitter',
    date: '2020-12-22',
  },
  {
    id: 'src-cook-sway',
    type: 'reporting',
    title: 'Tim Cook on “Sway”: “I’ve never spoken to Elon Musk”',
    publisher: 'The New York Times (Sway podcast)',
    date: '2021-04-05',
  },
  {
    id: 'src-twitter-close',
    type: 'official-record',
    title: 'Twitter, Inc. SEC filings — merger completion and delisting',
    publisher: 'U.S. Securities and Exchange Commission',
    date: '2022-10-28',
  },
  {
    id: 'src-reuters-twitter',
    type: 'reporting',
    title: 'Musk completes $44 billion Twitter deal, fires top executives',
    publisher: 'Reuters',
    date: '2022-10-28',
  },
  {
    id: 'src-xai-announce',
    type: 'first-hand',
    title: 'Announcing xAI',
    publisher: 'xAI',
    date: '2023-07-12',
    url: 'https://x.ai',
  },
  {
    id: 'src-reuters-xai',
    type: 'reporting',
    title: 'Musk launches AI startup xAI, taking on OpenAI',
    publisher: 'Reuters',
    date: '2023-07-12',
  },
  {
    id: 'src-musk-x-xai',
    type: 'first-hand',
    title: '@elonmusk: xAI has acquired X in an all-stock transaction',
    author: 'Elon Musk',
    publisher: 'X',
    date: '2025-03-28',
  },
  {
    id: 'src-reuters-x-xai',
    type: 'reporting',
    title: 'Musk says xAI acquired X, valuing the social platform at $33 billion',
    publisher: 'Reuters',
    date: '2025-03-29',
  },
  // ── design-decision sources ────────────────────────────────────────────
  {
    id: 'src-musk-steel-tweet',
    type: 'first-hand',
    title: '@elonmusk: “Stainless Steel” — Starship will be built from stainless steel',
    author: 'Elon Musk',
    publisher: 'Twitter',
    date: '2018-12-22',
  },
  {
    id: 'src-popmech-steel',
    type: 'reporting',
    title: 'Elon Musk: Why I’m Building the Starship out of Stainless Steel',
    author: 'Ryan D’Agostino',
    publisher: 'Popular Mechanics',
    date: '2019-01-22',
  },
  {
    id: 'src-autonomy-day',
    type: 'first-hand',
    title: 'Tesla Autonomy Day presentation — “Lidar is a fool’s errand”',
    publisher: 'Tesla (investor webcast)',
    date: '2019-04-22',
  },
  {
    id: 'src-musk-radar-tweet',
    type: 'first-hand',
    title: '@elonmusk: “When radar and vision disagree, which one do you believe? Vision has much more precision”',
    author: 'Elon Musk',
    publisher: 'Twitter',
    date: '2021-04-10',
  },
  {
    id: 'src-tesla-vision',
    type: 'first-hand',
    title: 'Transitioning to Tesla Vision',
    publisher: 'Tesla (support page)',
    date: '2021-05',
  },
  {
    id: 'src-verge-radar',
    type: 'reporting',
    title: 'Tesla is removing radar from Model 3 and Model Y',
    publisher: 'The Verge',
    date: '2021-05-25',
  },
  {
    id: 'src-cr-radar',
    type: 'reporting',
    title: 'Radarless Teslas lose Consumer Reports Top Pick and IIHS Top Safety Pick+ designations',
    publisher: 'Consumer Reports',
    date: '2021-05-27',
  },
  {
    id: 'src-wapo-phantom',
    type: 'reporting',
    title: '“Phantom braking” complaints to NHTSA surge after Tesla drops radar',
    publisher: 'The Washington Post',
    date: '2022-02-02',
  },
  {
    id: 'src-karpathy-sw2',
    type: 'analysis',
    title: 'Software 2.0',
    author: 'Andrej Karpathy',
    publisher: 'Medium',
    date: '2017-11-11',
    url: 'https://karpathy.medium.com/software-2-0-a64152b37c35',
  },
  {
    id: 'src-fsd-stream',
    type: 'first-hand',
    title: '@elonmusk live demo of FSD V12: “nothing in between but a neural net” — no line of code says stop at a stop sign',
    author: 'Elon Musk',
    publisher: 'X (livestream)',
    date: '2023-08-25',
  },
  {
    id: 'src-fsd-v12-report',
    type: 'reporting',
    title: 'Tesla begins rolling out FSD V12, shifting driving control to end-to-end neural networks',
    publisher: 'Reuters',
    date: '2024-01-22',
  },
  {
    id: 'src-e2e-caution',
    type: 'analysis',
    title: 'Safety researchers question how end-to-end driving models can be validated',
    publisher: 'IEEE Spectrum',
    date: '2024-03',
  },
]

// ─────────────────────────────────────────────────────────────────────────
// Events + accounts
// ─────────────────────────────────────────────────────────────────────────

const events: UniverseEvent[] = []
const accounts: Account[] = []
let accSeq = 0

function event(e: UniverseEvent, ...accs: [string, Stance, string, string?][]) {
  events.push(e)
  for (const [sourceId, stance, quote, locator] of accs) {
    accSeq += 1
    accounts.push({ id: `acc-seed-${accSeq}`, eventId: e.id, sourceId, stance, quote, locator })
  }
}

event(
  {
    id: 'ev-musk-born',
    date: '1971-06-28',
    title: 'Elon Musk born in Pretoria',
    summary: 'Elon Reeve Musk is born in Pretoria, South Africa, to Errol Musk and Maye Haldeman.',
    location: 'Pretoria, South Africa',
    participants: [{ entityId: 'elon-musk', role: 'subject' }],
    tags: ['origin'],
  },
  ['src-vance', 'supports', 'Born June 28, 1971 in Pretoria, the eldest of three children.', 'ch. 2'],
  ['src-isaacson', 'supports', 'Isaacson opens with Musk’s violent Pretoria childhood and June 1971 birth.', 'ch. 1'],
)

event(
  {
    id: 'ev-zip2-founded',
    date: '1995',
    title: 'Zip2 founded',
    summary: 'Elon and Kimbal Musk start Global Link Information Network, later Zip2, building online city guides for newspapers.',
    location: 'Palo Alto, CA',
    participants: [
      { entityId: 'elon-musk', role: 'co-founder' },
      { entityId: 'zip2', role: 'company founded' },
    ],
    tags: ['founding'],
  },
  ['src-vance', 'supports', 'The brothers slept in the office and showered at the YMCA while coding Zip2.', 'ch. 4'],
  ['src-isaacson', 'supports', 'Musk dropped out of the Stanford PhD program after two days to start Zip2.', 'ch. 7'],
)

event(
  {
    id: 'ev-zip2-sale',
    date: '1999-02',
    title: 'Compaq acquires Zip2 for ~$307M',
    summary: 'Compaq buys Zip2 for roughly $307 million in cash; Musk nets about $22 million.',
    participants: [
      { entityId: 'elon-musk', role: 'selling co-founder' },
      { entityId: 'zip2', role: 'acquired' },
    ],
    tags: ['acquisition', 'funding'],
  },
  ['src-vance', 'supports', 'Compaq paid $307 million in cash, then one of the largest sums ever for an internet company.', 'ch. 4'],
  ['src-isaacson', 'supports', 'Musk’s $22M share funded his next bet almost entirely.', 'ch. 8'],
)

event(
  {
    id: 'ev-xcom-founded',
    date: '1999-03',
    title: 'Musk founds X.com',
    summary: 'Musk puts most of his Zip2 proceeds into X.com, an online bank that will merge with Confinity and become PayPal.',
    location: 'Palo Alto, CA',
    participants: [
      { entityId: 'elon-musk', role: 'founder' },
      { entityId: 'x-com', role: 'company founded' },
    ],
    tags: ['founding'],
  },
  ['src-vance', 'supports', 'Musk invested about $12 million into X.com, keeping little back.', 'ch. 5'],
)

event(
  {
    id: 'ev-musk-ousted-xcom',
    date: '2000-09',
    title: 'Musk ousted as X.com CEO',
    summary: 'While Musk is en route to a delayed honeymoon, X.com’s board replaces him as CEO with Peter Thiel.',
    participants: [
      { entityId: 'elon-musk', role: 'ousted CEO' },
      { entityId: 'x-com', role: 'company' },
    ],
    tags: ['leadership', 'crisis'],
  },
  ['src-vance', 'supports', 'The coup unfolded while Musk was on a plane to Sydney for his honeymoon.', 'ch. 5'],
  ['src-isaacson', 'supports', 'Isaacson recounts the September 2000 board revolt in detail.', 'ch. 11'],
)

event(
  {
    id: 'ev-paypal-ebay',
    date: '2002-10',
    title: 'eBay acquires PayPal for $1.5B',
    summary: 'eBay buys PayPal in an all-stock deal; Musk, the largest shareholder, nets roughly $180 million after taxes.',
    participants: [
      { entityId: 'elon-musk', role: 'largest shareholder' },
      { entityId: 'x-com', role: 'acquired' },
    ],
    tags: ['acquisition', 'funding'],
  },
  ['src-vance', 'supports', 'The sale gave Musk the capital he would pour into SpaceX, Tesla and SolarCity.', 'ch. 5'],
  ['src-isaacson', 'supports', 'Musk netted about $180 million from the eBay sale.', 'ch. 12'],
)

event(
  {
    id: 'ev-spacex-founded',
    date: '2002-03',
    title: 'SpaceX founded',
    summary: 'Musk incorporates Space Exploration Technologies with ~$100M of his own money, aiming to cut launch costs and eventually reach Mars.',
    location: 'El Segundo, CA',
    participants: [
      { entityId: 'elon-musk', role: 'founder & CEO' },
      { entityId: 'spacex', role: 'company founded' },
    ],
    tags: ['founding', 'space'],
  },
  ['src-vance', 'supports', 'Founded March 2002 after the failed attempt to buy Russian ICBMs for a Mars mission.', 'ch. 6'],
  ['src-isaacson', 'supports', 'Musk committed $100 million — most of his liquid wealth — to SpaceX.', 'ch. 15'],
)

event(
  {
    id: 'ev-shotwell-joins',
    date: '2002',
    title: 'Gwynne Shotwell joins SpaceX',
    summary: 'Shotwell becomes employee #11 as VP of business development; she will later run the company as President & COO.',
    location: 'El Segundo, CA',
    participants: [
      { entityId: 'gwynne-shotwell', role: 'joins as VP business development' },
      { entityId: 'spacex', role: 'employer' },
    ],
    tags: ['leadership', 'space'],
  },
  ['src-vance', 'supports', 'Shotwell signed on in 2002 to sell rockets nobody had built yet.', 'ch. 6'],
)

event(
  {
    id: 'ev-tesla-founded',
    date: '2003-07-01',
    title: 'Tesla Motors incorporated by Eberhard and Tarpenning',
    summary:
      'Martin Eberhard and Marc Tarpenning incorporate Tesla Motors in Delaware. Who may be called a “founder” becomes one of the most contested facts in this universe.',
    location: 'San Carlos, CA',
    participants: [
      { entityId: 'martin-eberhard', role: 'co-founder, CEO' },
      { entityId: 'marc-tarpenning', role: 'co-founder, CFO' },
      { entityId: 'tesla', role: 'company founded' },
    ],
    tags: ['founding'],
  },
  ['src-tesla-inc', 'supports', 'Certificate of incorporation filed July 1, 2003, naming Eberhard and Tarpenning.', 'Delaware Div. of Corporations'],
  ['src-vance', 'supports', 'Eberhard and Tarpenning incorporated Tesla on July 1, 2003, before Musk was involved.', 'ch. 7'],
  ['src-eberhard-suit', 'disputes', 'Eberhard alleged Musk waged a campaign to “rewrite history” by claiming founder status for himself.', '¶¶ 79–86'],
  ['src-founders-settlement', 'clarifies', 'The 2009 settlement lets five people — Eberhard, Tarpenning, Musk, Straubel and Ian Wright — call themselves co-founders.'],
)

event(
  {
    id: 'ev-tesla-series-a',
    date: '2004-02',
    title: 'Musk leads Tesla Series A, becomes chairman',
    summary: 'Musk invests $6.35M of the $6.5M Series A and joins Tesla as chairman of the board.',
    participants: [
      { entityId: 'elon-musk', role: 'lead investor, chairman' },
      { entityId: 'tesla', role: 'company financed' },
      { entityId: 'martin-eberhard', role: 'CEO' },
    ],
    tags: ['funding'],
  },
  ['src-vance', 'supports', 'Musk put in $6.35 million and took the chairman seat in February 2004.', 'ch. 7'],
  ['src-isaacson', 'supports', 'The Series A gave Musk controlling influence from the start.', 'ch. 20'],
)

event(
  {
    id: 'ev-straubel-joins',
    date: '2004-05',
    title: 'JB Straubel joins Tesla as CTO',
    summary: 'Battery engineer JB Straubel joins Tesla, anchoring the powertrain engineering that defines the company.',
    participants: [
      { entityId: 'jb-straubel', role: 'joins as CTO' },
      { entityId: 'tesla', role: 'employer' },
    ],
    tags: ['leadership'],
  },
  ['src-vance', 'supports', 'Straubel connected the lithium-ion enthusiasts to the Tesla founding team in 2004.', 'ch. 7'],
)

event(
  {
    id: 'ev-falcon1-orbit',
    date: '2008-09-28',
    title: 'Falcon 1 reaches orbit on its fourth flight',
    summary:
      'After three failures that nearly bankrupted SpaceX, Falcon 1 Flight 4 becomes the first privately developed liquid-fueled rocket to reach orbit.',
    location: 'Kwajalein Atoll',
    participants: [
      { entityId: 'spacex', role: 'launch operator' },
      { entityId: 'elon-musk', role: 'CEO, funded final flight' },
    ],
    tags: ['space', 'milestone'],
  },
  ['src-spacex-f1', 'supports', 'SpaceX announced Falcon 1 as the first privately developed liquid-fuel rocket to orbit Earth.'],
  ['src-reuters-orbit', 'supports', 'Wire reports confirmed orbit was achieved on the fourth attempt.'],
)

event(
  {
    id: 'ev-musk-tesla-ceo',
    date: '2008-10',
    title: 'Musk becomes Tesla CEO',
    summary: 'Amid the financial crisis and after two CEO changes, Musk takes over as Tesla CEO.',
    participants: [
      { entityId: 'elon-musk', role: 'becomes CEO' },
      { entityId: 'tesla', role: 'company' },
    ],
    tags: ['leadership', 'crisis'],
  },
  ['src-vance', 'supports', 'In October 2008 Musk named himself CEO and prepared massive layoffs.', 'ch. 8'],
  ['src-isaacson', 'supports', 'Musk took the wheel directly as Tesla approached insolvency.', 'ch. 28'],
)

event(
  {
    id: 'ev-nasa-crs',
    date: '2008-12-23',
    title: 'NASA awards SpaceX $1.6B resupply contract',
    summary: 'NASA’s Commercial Resupply Services award to SpaceX arrives days before the company would have run out of money.',
    participants: [
      { entityId: 'spacex', role: 'contract recipient' },
      { entityId: 'elon-musk', role: 'CEO' },
    ],
    tags: ['space', 'funding', 'milestone'],
  },
  ['src-nasa-crs', 'supports', 'NASA announced CRS contracts to SpaceX ($1.6B) and Orbital Sciences on Dec 23, 2008.'],
  ['src-vance', 'supports', 'Musk shouted “I love NASA!” when the call came.', 'ch. 8'],
)

event(
  {
    id: 'ev-tesla-xmas-rescue',
    date: '2008-12-24',
    title: 'Tesla closes rescue financing on Christmas Eve',
    summary:
      'Tesla closes an emergency $40M convertible round hours before payroll would have bounced — the closest the company came to death.',
    participants: [
      { entityId: 'tesla', role: 'company rescued' },
      { entityId: 'elon-musk', role: 'CEO, put in last personal funds' },
    ],
    tags: ['crisis', 'funding'],
  },
  ['src-isaacson', 'supports', 'The deal closed at the last plausible hour on Christmas Eve 2008.', 'ch. 29'],
  ['src-vance', 'supports', 'Musk borrowed money for rent while wiring his last funds into Tesla.', 'ch. 8'],
  ['src-ttac-deathwatch', 'supports', 'The “Tesla Death Watch” blog series had spent 2008 predicting exactly this collapse.'],
)

event(
  {
    id: 'ev-dragon-iss',
    date: '2012-05-25',
    title: 'Dragon berths with the ISS',
    summary: 'SpaceX’s Dragon becomes the first commercial spacecraft to berth with the International Space Station.',
    location: 'Low Earth orbit',
    participants: [
      { entityId: 'spacex', role: 'operator' },
      { entityId: 'gwynne-shotwell', role: 'President & COO' },
    ],
    tags: ['space', 'milestone'],
  },
  ['src-reuters-dragon', 'supports', 'Dragon was captured by the station’s robotic arm on May 25, 2012.'],
  ['src-vance', 'supports', 'The berthing validated NASA’s bet on commercial cargo.', 'ch. 9'],
)

event(
  {
    id: 'ev-f9-landing',
    date: '2015-12-21',
    title: 'Falcon 9 first orbital booster landing',
    summary: 'A Falcon 9 first stage lands upright at Cape Canaveral after boosting a payload to orbit — the keystone of reusable rocketry.',
    location: 'Cape Canaveral, FL',
    participants: [{ entityId: 'spacex', role: 'operator' }],
    tags: ['space', 'milestone'],
  },
  ['src-verge-f9', 'supports', 'The first stage touched down at Landing Zone 1 about ten minutes after liftoff.'],
  ['src-spacex-f1', 'supports', 'SpaceX webcast and statements confirmed the landing.', 'ORBCOMM-2 webcast'],
)

event(
  {
    id: 'ev-openai-founded',
    date: '2015-12-11',
    title: 'OpenAI launches with Musk as co-chair',
    summary: 'OpenAI debuts as a non-profit AI research lab with $1B in pledges; Musk and Sam Altman serve as co-chairs.',
    location: 'San Francisco, CA',
    participants: [
      { entityId: 'openai', role: 'organization founded' },
      { entityId: 'elon-musk', role: 'co-founder, co-chair' },
    ],
    tags: ['founding', 'ai'],
  },
  ['src-openai-intro', 'supports', 'The launch post lists Musk among the founding donors and co-chairs.'],
  ['src-isaacson', 'supports', 'Musk pushed for OpenAI’s creation out of fear of Google’s AI dominance.', 'ch. 60'],
)

event(
  {
    id: 'ev-musk-leaves-openai',
    date: '2018-02-20',
    title: 'Musk departs OpenAI board',
    summary:
      'OpenAI announces Musk’s board departure, citing potential conflicts with Tesla’s AI work. Later disclosures complicate that account.',
    participants: [
      { entityId: 'elon-musk', role: 'departing co-chair' },
      { entityId: 'openai', role: 'organization' },
    ],
    tags: ['leadership', 'ai'],
  },
  ['src-openai-2018', 'supports', 'The 2018 post frames the exit as avoiding conflict of interest as Tesla focuses on AI.'],
  ['src-openai-2024', 'clarifies', 'Emails published in 2024 show Musk had sought majority equity and CEO control, and left after that bid failed.'],
  ['src-isaacson', 'supports', 'Isaacson describes the split as a fight over control and direction.', 'ch. 60'],
)

event(
  {
    id: 'ev-funding-secured',
    date: '2018-08-07',
    title: '“Funding secured” — Musk tweets about taking Tesla private at $420',
    summary:
      'Musk tweets that funding is secured to take Tesla private at $420/share. Whether funding was in fact secured becomes a securities-fraud case.',
    participants: [
      { entityId: 'elon-musk', role: 'author of claim' },
      { entityId: 'tesla', role: 'subject company' },
    ],
    tags: ['legal', 'crisis'],
  },
  ['src-musk-tweet-420', 'supports', '“Am considering taking Tesla private at $420. Funding secured.”'],
  ['src-musk-blog-private', 'clarifies', 'Musk later wrote the confidence rested on discussions with Saudi Arabia’s Public Investment Fund.'],
  ['src-sec-complaint', 'disputes', 'The SEC alleged the statements were “false and misleading”: no terms were confirmed with any funding source.', '¶¶ 1–6'],
)

event(
  {
    id: 'ev-sec-settlement',
    date: '2018-09-29',
    title: 'Musk settles SEC fraud charges',
    summary:
      'Musk and Tesla each pay $20M; Musk steps down as chairman for three years and Tesla adds oversight of his communications.',
    participants: [
      { entityId: 'elon-musk', role: 'settling defendant' },
      { entityId: 'tesla', role: 'settling company' },
    ],
    tags: ['legal'],
  },
  ['src-sec-settlement', 'supports', 'Settlement terms: $40M combined penalties, chairman seat relinquished, communications oversight.'],
  ['src-isaacson', 'supports', 'Isaacson recounts Musk agreeing to settle after initially backing out.', 'ch. 51'],
)

event(
  {
    id: 'ev-apple-talks',
    date: '2020-12-22',
    title: 'Musk says he tried to sell Tesla to Apple',
    summary:
      'Musk tweets that during the darkest days of the Model 3 program he approached Tim Cook about Apple acquiring Tesla, and Cook refused the meeting. Cook says the two have never spoken.',
    participants: [
      { entityId: 'elon-musk', role: 'claimant' },
      { entityId: 'tesla', role: 'alleged acquisition target' },
      { entityId: 'apple', role: 'alleged acquirer' },
      { entityId: 'tim-cook', role: 'disputes the account' },
    ],
    tags: ['acquisition', 'legal'],
  },
  ['src-musk-apple-tweet', 'supports', '“He refused to take the meeting. Apple was worth 1/10 of what Tesla is now.”'],
  ['src-cook-sway', 'disputes', '“You know, I’ve never spoken to Elon, although I have great admiration and respect for the company he built.”'],
)

event(
  {
    id: 'ev-twitter-acq',
    date: '2022-10-27',
    title: 'Musk completes $44B Twitter acquisition',
    summary: 'Musk closes the $54.20/share Twitter buyout after months of trying to escape the deal, and immediately fires top executives.',
    location: 'San Francisco, CA',
    participants: [
      { entityId: 'elon-musk', role: 'acquirer' },
      { entityId: 'twitter-x', role: 'acquired' },
    ],
    tags: ['acquisition'],
  },
  ['src-twitter-close', 'supports', 'Merger completion and NYSE delisting were confirmed in SEC filings on Oct 28, 2022.'],
  ['src-reuters-twitter', 'supports', 'Reuters confirmed the close and the immediate dismissal of Agrawal, Segal and Gadde.'],
)

event(
  {
    id: 'ev-xai-founded',
    date: '2023-07-12',
    title: 'xAI announced',
    summary: 'Musk publicly launches xAI (incorporated in Nevada that March), pitching it as a truth-seeking rival to OpenAI.',
    participants: [
      { entityId: 'elon-musk', role: 'founder' },
      { entityId: 'xai', role: 'company founded' },
      { entityId: 'openai', role: 'targeted competitor' },
    ],
    tags: ['founding', 'ai'],
  },
  ['src-xai-announce', 'supports', 'xAI’s launch post announces the team and the goal to “understand the true nature of the universe.”'],
  ['src-reuters-xai', 'supports', 'Reuters reported the launch and the March 2023 Nevada incorporation.'],
)

event(
  {
    id: 'ev-xai-acquires-x',
    date: '2025-03-28',
    title: 'xAI acquires X in all-stock deal',
    summary: 'Musk announces xAI has acquired X, valuing xAI at $80B and X at $33B ($45B less $12B debt), folding the platform into the AI company.',
    participants: [
      { entityId: 'xai', role: 'acquirer' },
      { entityId: 'twitter-x', role: 'acquired' },
      { entityId: 'elon-musk', role: 'owner of both sides' },
    ],
    tags: ['acquisition', 'ai'],
  },
  ['src-musk-x-xai', 'supports', '“xAI has acquired X in an all-stock transaction.”'],
  ['src-reuters-x-xai', 'supports', 'Reuters noted the deal values X below Musk’s 2022 purchase price and consolidates his control.'],
)

event(
  {
    id: 'ev-starship-steel',
    date: '2019-01',
    title: 'Starship switches from carbon fiber to stainless steel',
    summary:
      'After tooling up for a carbon-fiber airframe, SpaceX pivots Starship to cold-rolled 301 stainless steel — Musk lays out the cryogenic-strength and cost rationale in a Popular Mechanics interview.',
    location: 'Boca Chica, TX',
    participants: [
      { entityId: 'spacex', role: 'design authority' },
      { entityId: 'elon-musk', role: 'made the call' },
    ],
    tags: ['space', 'design-decision', 'engineering'],
  },
  ['src-musk-steel-tweet', 'supports', '“Stainless Steel” — announcing the material change days after teasing it.'],
  ['src-popmech-steel', 'supports', '“The steel is lighter than carbon fiber at cryogenic temperatures — and it’s about 2 percent of the cost.”'],
  ['src-isaacson', 'supports', 'Isaacson recounts Musk overruling engineers who had already invested in the carbon-fiber mandrel.', 'ch. 74'],
)

event(
  {
    id: 'ev-tesla-vision',
    date: '2021-05-25',
    title: 'Tesla removes radar — camera-only “Tesla Vision” ships',
    summary:
      'Tesla drops radar from Model 3 and Model Y in North America, moving Autopilot to pure camera vision. Safety groups respond by pulling endorsements pending new tests.',
    participants: [
      { entityId: 'tesla', role: 'design authority' },
      { entityId: 'elon-musk', role: 'championed vision-only' },
    ],
    tags: ['ai', 'design-decision', 'engineering'],
  },
  ['src-tesla-vision', 'supports', 'Tesla Vision announcement: new deliveries rely on camera vision and neural net processing.'],
  ['src-verge-radar', 'supports', 'The Verge confirmed radar deletion for North American Model 3/Y beginning May 2021.'],
  ['src-cr-radar', 'clarifies', 'Consumer Reports pulled its Top Pick and IIHS its Top Safety Pick+ until the radarless cars re-tested.'],
)

event(
  {
    id: 'ev-fsd-v12-demo',
    date: '2023-08-25',
    title: 'Musk livestreams FSD V12: end-to-end neural network drives',
    summary:
      'Musk streams a 45-minute drive on FSD V12, describing it as photons-in, controls-out — the build replaces over 300,000 lines of hand-written C++ control code with a single neural network.',
    location: 'Palo Alto, CA',
    participants: [
      { entityId: 'tesla', role: 'developer' },
      { entityId: 'elon-musk', role: 'demonstrator' },
    ],
    tags: ['ai', 'design-decision', 'milestone'],
  },
  ['src-fsd-stream', 'supports', '“There’s no line of code that says stop at a stop sign… it watched millions of videos of people stopping.”'],
)

event(
  {
    id: 'ev-fsd-v12-release',
    date: '2024-01',
    title: 'FSD V12 rolls out to customers',
    summary:
      'Tesla begins shipping FSD V12 to customer cars, retiring the hand-coded planner in city driving in favor of the end-to-end network.',
    participants: [
      { entityId: 'tesla', role: 'shipping company' },
    ],
    tags: ['ai', 'design-decision', 'milestone'],
  },
  ['src-fsd-v12-report', 'supports', 'Reuters reported the staged V12 rollout and the shift to end-to-end neural control.'],
  ['src-e2e-caution', 'clarifies', 'Researchers note end-to-end systems can’t be audited line-by-line — failures must be argued statistically, from disengagement and incident data.'],
)

// ─────────────────────────────────────────────────────────────────────────
// Decision threads — design choices with the history and rationale attached
// ─────────────────────────────────────────────────────────────────────────

const decisions: Decision[] = [
  {
    id: 'dec-starship-steel',
    title: 'Starship airframe: carbon fiber → 301 stainless steel',
    question:
      'Why did SpaceX abandon carbon fiber — after buying the tooling — and build Starship out of stainless steel?',
    domain: 'engineering',
    from: 'Carbon-fiber composite airframe',
    to: 'Cold-rolled 301 stainless steel',
    decidedDate: '2018-12',
    participants: [
      { entityId: 'spacex', role: 'design authority' },
      { entityId: 'elon-musk', role: 'made the call' },
    ],
    options: [
      {
        label: 'Carbon-fiber composite',
        outcome: 'rejected',
        note: 'Roughly $135/kg with ~35% scrap, long layup times, and it weakens at reentry temperatures.',
        sourceIds: ['src-popmech-steel'],
      },
      {
        label: 'Aluminum-lithium alloy (the Falcon 9 recipe)',
        outcome: 'rejected',
        note: 'Falcon’s Al-Li construction cannot take Starship’s reentry heating without far heavier shielding — aluminum loses strength well below steel’s limits.',
        sourceIds: ['src-popmech-steel'],
      },
      {
        label: '301 stainless steel',
        outcome: 'chosen',
        note: 'Stronger at cryogenic temperatures, usable to ~1500°F on the leeward side, and about 2% of carbon fiber’s cost.',
        sourceIds: ['src-popmech-steel', 'src-musk-steel-tweet'],
      },
    ],
    rationale: [
      {
        text: 'At cryogenic propellant temperatures 301 stainless gains strength — its strength-to-weight beats carbon fiber exactly where the tanks live.',
        sourceIds: ['src-popmech-steel'],
      },
      {
        text: 'Cost and speed: steel runs on the order of 2% of carbon fiber’s price per kilogram and can be welded outdoors in a tent instead of cured in autoclaves — which is what made the Boca Chica build-fast-and-blow-up cadence affordable.',
        sourceIds: ['src-popmech-steel'],
      },
      {
        text: 'Steel’s high melting point shrinks the heat-shield problem: the windward side needs tiles, but the leeward side can fly bare where composites or aluminum would need full coverage.',
        sourceIds: ['src-popmech-steel', 'src-isaacson'],
      },
    ],
    counterpoints: [
      {
        text: 'Steel is heavier at room temperature — the trade only closes if the cryogenic strength and heat-shield savings fully materialize in flight.',
        sourceIds: ['src-popmech-steel'],
      },
      {
        text: 'The team had already sunk money into the carbon-fiber mandrel; Isaacson describes engineers resisting the reversal before Musk overruled them.',
        sourceIds: ['src-isaacson'],
      },
    ],
    eventIds: ['ev-starship-steel'],
    tags: ['starship', 'materials', 'space'],
  },
  {
    id: 'dec-tesla-vision',
    title: 'Autopilot sensing: radar + cameras → camera-only Tesla Vision',
    question:
      'Why did Tesla delete radar (and later ultrasonics) from its cars while the rest of the industry added lidar?',
    domain: 'engineering',
    from: 'Camera + radar sensor fusion',
    to: 'Vision-only neural-network perception',
    decidedDate: '2021-05',
    participants: [
      { entityId: 'tesla', role: 'design authority' },
      { entityId: 'elon-musk', role: 'championed vision-only' },
    ],
    options: [
      {
        label: 'Lidar + HD maps (industry consensus)',
        outcome: 'rejected',
        note: '“Lidar is a fool’s errand… expensive sensors that are unnecessary.” Tesla bet the road system is designed for eyes.',
        sourceIds: ['src-autonomy-day'],
      },
      {
        label: 'Keep camera + radar fusion',
        outcome: 'rejected',
        note: '“When radar and vision disagree, which one do you believe?” — fusion was treated as an ambiguity problem, not a redundancy win.',
        sourceIds: ['src-musk-radar-tweet'],
      },
      {
        label: 'Pure vision',
        outcome: 'chosen',
        note: 'One sensor stack, one neural network to improve, trained on fleet video at scale.',
        sourceIds: ['src-tesla-vision'],
      },
    ],
    rationale: [
      {
        text: 'The fusion argument: when two sensors disagree the system must pick one anyway, so Tesla chose to concentrate effort on making vision unambiguous rather than arbitrating conflicts.',
        sourceIds: ['src-musk-radar-tweet'],
      },
      {
        text: 'The biological argument from Autonomy Day: roads are designed for eyes and biological neural nets, so cameras plus neural networks are sufficient in principle.',
        sourceIds: ['src-autonomy-day'],
      },
      {
        text: 'Simplification and cost: removing radar (and later ultrasonics) cut parts and supply-chain surface during the chip crunch, and put every car on the same software path.',
        sourceIds: ['src-tesla-vision', 'src-verge-radar'],
      },
    ],
    counterpoints: [
      {
        text: 'Consumer Reports and IIHS immediately pulled their safety designations for radarless cars pending re-tests.',
        sourceIds: ['src-cr-radar'],
      },
      {
        text: 'Complaints of “phantom braking” filed with NHTSA rose sharply in the months after radar was removed.',
        sourceIds: ['src-wapo-phantom'],
      },
    ],
    eventIds: ['ev-tesla-vision'],
    relatedDecisionIds: ['dec-fsd-e2e'],
    tags: ['autopilot', 'sensors', 'ai'],
  },
  {
    id: 'dec-fsd-e2e',
    title: 'FSD control stack: 300k+ lines of C++ → end-to-end neural network',
    question:
      'Why did Tesla throw away its hand-written driving heuristics and let a single neural network drive the car?',
    domain: 'engineering',
    from: 'Neural perception + ~300k lines of hand-coded C++ planning/control',
    to: 'End-to-end neural network — photons in, controls out',
    decidedDate: '2023-08',
    participants: [
      { entityId: 'tesla', role: 'design authority' },
      { entityId: 'elon-musk', role: 'announced and demoed the pivot' },
    ],
    options: [
      {
        label: 'Keep refining the rule-based planner',
        outcome: 'rejected',
        note: 'Every edge case demanded another hand-written rule; the heuristic stack grew brittle as coverage widened.',
        sourceIds: ['src-fsd-stream'],
      },
      {
        label: 'Hybrid: neural perception feeding coded control (the V11 architecture)',
        outcome: 'superseded',
        note: 'The shipping architecture through V11 — retired for city driving when V12 landed.',
        sourceIds: ['src-fsd-v12-report'],
      },
      {
        label: 'End-to-end neural network trained on fleet video',
        outcome: 'chosen',
        note: '“Nothing in between but a neural net” — behavior learned from millions of clips of human driving.',
        sourceIds: ['src-fsd-stream', 'src-fsd-v12-report'],
      },
    ],
    rationale: [
      {
        text: 'No line of code says stop at a stop sign: V12 learned the behavior from millions of video clips, replacing over 300,000 lines of C++ control code with learned weights.',
        sourceIds: ['src-fsd-stream'],
      },
      {
        text: 'The intellectual groundwork is Karpathy’s “Software 2.0” thesis — where training data is abundant, learned networks displace explicit code because they improve with data instead of with engineering hours.',
        sourceIds: ['src-karpathy-sw2'],
      },
      {
        text: 'Fleet scale is the moat: millions of cars produce the video corpus the network trains on, an input hand-written rules cannot consume.',
        sourceIds: ['src-fsd-stream', 'src-fsd-v12-report'],
      },
    ],
    counterpoints: [
      {
        text: 'An end-to-end network cannot be audited line-by-line — when it fails there is no rule to point to, so safety must be argued statistically from disengagement and incident data.',
        sourceIds: ['src-e2e-caution'],
      },
    ],
    eventIds: ['ev-tesla-vision', 'ev-fsd-v12-demo', 'ev-fsd-v12-release'],
    relatedDecisionIds: ['dec-tesla-vision'],
    tags: ['fsd', 'neural-network', 'ai', 'software'],
  },
]

// ─────────────────────────────────────────────────────────────────────────
// Orbit watch — names mentioned by sources but not yet significant enough
// (SIGNIFICANCE_THRESHOLD distinct events) to become full characters.
// ─────────────────────────────────────────────────────────────────────────

const pending: PendingCharacter[] = [
  {
    id: 'peter-thiel',
    name: 'Peter Thiel',
    kindGuess: 'person',
    mentions: [
      { eventId: 'ev-musk-ousted-xcom', sourceId: 'src-vance' },
      { eventId: 'ev-paypal-ebay', sourceId: 'src-isaacson' },
    ],
  },
  {
    id: 'kimbal-musk',
    name: 'Kimbal Musk',
    kindGuess: 'person',
    mentions: [
      { eventId: 'ev-zip2-founded', sourceId: 'src-vance' },
      { eventId: 'ev-zip2-sale', sourceId: 'src-isaacson' },
    ],
  },
]

export const SEED: UniverseState = { entities, sources, events, accounts, pending, decisions }

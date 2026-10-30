/**
 * The story of hip-hop from the Bronx in 1973 to now, told in eras and moments.
 * Facts are checked against the sources listed at the bottom of this file.
 * Records with a slug link to a cover in the collection.
 */

export type Tag = "first" | "sound" | "business" | "culture" | "world";

export const TAGS: { id: Tag; label: string }[] = [
  { id: "first", label: "Firsts" },
  { id: "sound", label: "Sound" },
  { id: "business", label: "Business" },
  { id: "culture", label: "Culture" },
  { id: "world", label: "Around the world" },
];

export type HistoryRecord = {
  title: string;
  artist: string;
  year: number;
  kind: "album" | "song" | "mixtape" | "film";
  slug?: string;
};

export type Moment = {
  id: string;
  when: string;
  title: string;
  text: string;
  tags: Tag[];
  stat?: { value: number; label: string; prefix?: string; suffix?: string };
  records?: HistoryRecord[];
};

export type Era = {
  id: string;
  label: string;
  span: string;
  from: number;
  to: number;
  title: string;
  intro: string;
  sound: string;
  /** The cover whose colour and art set the tone for the era. */
  poster: string;
  artists: string[];
  moments: Moment[];
};

const album = (title: string, artist: string, year: number, slug?: string): HistoryRecord => ({ title, artist, year, kind: "album", slug });
const song = (title: string, artist: string, year: number): HistoryRecord => ({ title, artist, year, kind: "song" });

export const ERAS: Era[] = [
  {
    id: "bronx",
    label: "1970s",
    span: "1973 to 1979",
    from: 1973,
    to: 1979,
    title: "Block parties in the Bronx",
    intro:
      "Hip-hop began as party music in the South Bronx, in years when the borough was losing jobs, landlords were abandoning buildings and city services were being cut. Young DJs, MCs, dancers and graffiti writers made a culture out of what they had: turntables, funk records, a microphone and power borrowed from a park lamppost. For six years it lived at parties, in parks and on cassette tapes passed around the neighbourhood.",
    sound: "Funk breakbeats on two turntables, with a voice on the mic hyping the crowd.",
    poster: "sugarhill-gang",
    artists: ["DJ Kool Herc", "Coke La Rock", "Afrika Bambaataa", "Grandmaster Flash", "Grand Wizzard Theodore", "Cold Crush Brothers", "Funky 4 + 1", "The Sugarhill Gang"],
    moments: [
      {
        id: "sedgwick",
        when: "11 August 1973",
        title: "A back-to-school party at 1520 Sedgwick Avenue",
        text: "Cindy Campbell threw a party in the rec room of her family's building to raise money for new school clothes, and her brother Clive, an 18-year-old from Jamaica known as DJ Kool Herc, played the records. Herc had noticed that dancers went wildest in the short instrumental breaks of funk songs, so he played two copies of the same record and switched between them to stretch each break out. The dancers who took over in those breaks became break boys and break girls, b-boys and b-girls for short, while his friend Coke La Rock shouted rhymes and shout-outs over the top.",
        tags: ["first", "sound", "culture"],
        stat: { value: 25, label: "cents to get in for girls, 50 for boys", suffix: "¢" },
        records: [song("Give It Up or Turnit a Loose", "James Brown", 1969), song("Apache", "Incredible Bongo Band", 1973)],
      },
      {
        id: "zulu",
        when: "1973",
        title: "Afrika Bambaataa starts the Universal Zulu Nation",
        text: "A former member of the Black Spades gang, Bambaataa founded a group that pulled young people toward DJing, rapping, breaking and graffiti, and gave the culture its idea of four elements, with knowledge added as a fifth. His sets mixed funk with rock, salsa and German electronic music, which stretched hip-hop's ear far beyond the Bronx. In 2016 he stepped away from the Zulu Nation after several men accused him of sexually abusing them when they were teenagers.",
        tags: ["culture"],
      },
      {
        id: "flash",
        when: "Mid-1970s",
        title: "The turntable becomes an instrument",
        text: "Grandmaster Flash studied how records were put together and worked out what he called the quick mix theory, cueing breaks in his headphones so he could cut between them exactly on time. Around 1975, his young friend Grand Wizzard Theodore discovered the scratch by holding a record still and rubbing it back and forth under the needle while his mother shouted at him to turn the music down.",
        tags: ["sound", "first"],
      },
      {
        id: "mcs",
        when: "Late 1970s",
        title: "The MC moves to the front",
        text: "As the parties grew, the rappers who kept the crowd going became the stars. Crews like Grandmaster Flash and the Furious Five, the Cold Crush Brothers and the Funky 4 + 1, whose Sha-Rock is often named as the first famous woman MC, competed with routines full of call and response, harmonies and battle rhymes. Their shows travelled on cassette tapes years before any record label paid attention.",
        tags: ["culture", "sound"],
      },
      {
        id: "delight",
        when: "1979",
        title: "Rap makes it onto vinyl",
        text: "Earlier in the year, the funk group Fatback released 'King Tim III (Personality Jock)', usually counted as the first commercially released rap record. Then Sylvia Robinson of Sugar Hill Records put three New Jersey rappers together as the Sugarhill Gang and recorded 'Rapper's Delight' over a studio band replaying Chic's 'Good Times'. Released on 16 September 1979, it reached number 36 on the Billboard Hot 100 in January 1980 and introduced rap to listeners far outside New York.",
        tags: ["first", "business"],
        stat: { value: 36, label: "its peak on the Billboard Hot 100", prefix: "No. " },
        records: [song("King Tim III (Personality Jock)", "Fatback", 1979), song("Rapper's Delight", "The Sugarhill Gang", 1979), album("Sugarhill Gang", "The Sugarhill Gang", 1980, "sugarhill-gang")],
      },
    ],
  },
  {
    id: "records",
    label: "Early 80s",
    span: "1980 to 1985",
    from: 1980,
    to: 1985,
    title: "From the park to the pressing plant",
    intro:
      "Once rap could sell, small New York labels raced to record it, and the music changed fast in the studio. Drum machines arrived, lyrics began describing life on the street, and a trio from Queens stripped the sound down to drums, scratches and shouting. By 1985 hip-hop had its own labels, its own films and its first major-label stars.",
    sound: "Drum machines like the Roland TR-808, electro synths and hard, minimal beats.",
    poster: "the-message",
    artists: ["Kurtis Blow", "Grandmaster Flash and the Furious Five", "Afrika Bambaataa & Soulsonic Force", "Run-DMC", "LL Cool J", "Roxanne Shanté", "Whodini", "Rick Rubin"],
    moments: [
      {
        id: "breaks",
        when: "1980",
        title: "Kurtis Blow goes gold",
        text: "Kurtis Blow became the first rapper signed to a major label when Mercury put out his records, and 'The Breaks' became the first rap song to be certified gold by the RIAA.",
        tags: ["first", "business"],
        records: [song("The Breaks", "Kurtis Blow", 1980)],
      },
      {
        id: "planet-rock",
        when: "1982",
        title: "'Planet Rock' plugs in",
        text: "Afrika Bambaataa and the Soulsonic Force, with producers Arthur Baker and John Robie, built 'Planet Rock' from a Roland TR-808 drum machine and melodies borrowed from Kraftwerk. Its electro sound fed straight into Miami bass, freestyle and Detroit techno, and the 808 went on to become the most important drum machine in rap.",
        tags: ["sound"],
        records: [song("Planet Rock", "Afrika Bambaataa & Soulsonic Force", 1982)],
      },
      {
        id: "message",
        when: "1982",
        title: "'The Message'",
        text: "Grandmaster Flash and the Furious Five released a slow, heavy song in which Melle Mel and Duke Bootee described broken glass, debt and despair in the city. It showed that rap could carry reporting and protest alongside party rhymes, and it later became the first hip-hop recording chosen for the Library of Congress National Recording Registry.",
        tags: ["first", "culture"],
        records: [song("The Message", "Grandmaster Flash and the Furious Five", 1982), album("The Message", "Grandmaster Flash and the Furious Five", 1982, "the-message")],
      },
      {
        id: "wild-style",
        when: "1983",
        title: "Hip-hop on screen",
        text: "Charlie Ahearn's film 'Wild Style' and the PBS documentary 'Style Wars' carried rapping, DJing, breaking and graffiti to cinemas and televisions around the world. The same year, Herbie Hancock's 'Rockit' put GrandMixer D.ST's scratching on MTV.",
        tags: ["culture", "world"],
        records: [{ title: "Wild Style", artist: "Charlie Ahearn", year: 1983, kind: "film" }, song("Rockit", "Herbie Hancock", 1983)],
      },
      {
        id: "run-dmc",
        when: "1984",
        title: "Run-DMC, and Def Jam in a dorm room",
        text: "Three friends from Hollis, Queens, dressed in leather, Adidas and black hats, released a debut of hard drum machine beats, rock guitar and shouted rhymes, and 'Run-D.M.C.' became the first rap album certified gold. The same year Rick Rubin started Def Jam in his New York University dorm room and soon teamed up with Russell Simmons, Run's older brother.",
        tags: ["first", "business", "sound"],
        records: [song("It's Like That", "Run-DMC", 1983), album("Run-D.M.C.", "Run-DMC", 1984, "run-d-m-c")],
      },
      {
        id: "radio",
        when: "1985",
        title: "LL Cool J's 'Radio'",
        text: "Def Jam's first album came from a 17-year-old from Queens, produced by Rubin with a credit that read 'Reduced by Rick Rubin'. Its bare beats and cocky rhymes set the label's template.",
        tags: ["business", "sound"],
        records: [album("Radio", "LL Cool J", 1985, "radio")],
      },
    ],
  },
  {
    id: "golden",
    label: "Golden age",
    span: "1986 to 1992",
    from: 1986,
    to: 1992,
    title: "The golden age",
    intro:
      "In seven years rap went from a New York sound to a national one. Samplers let producers build tracks from slices of old records, lyricists bent rhyme schemes into new shapes, and artists took on politics, crime, comedy and Afrocentric spirituality, sometimes all on one album. MTV, the Grammys and the courts all had to deal with it.",
    sound: "Samplers chopping funk, soul and jazz, with dense political and playful lyrics on top.",
    poster: "it-takes-a-nation-of-millions-to-hold-us-back",
    artists: ["Run-DMC", "Beastie Boys", "Eric B. & Rakim", "Boogie Down Productions", "Public Enemy", "N.W.A", "De La Soul", "A Tribe Called Quest", "Big Daddy Kane", "Slick Rick", "MC Lyte", "Queen Latifah", "Salt-N-Pepa", "Marley Marl"],
    moments: [
      {
        id: "platinum",
        when: "1986",
        title: "Rap goes platinum",
        text: "Run-DMC's 'Raising Hell' became the first platinum and multi-platinum hip-hop album, and their take on Aerosmith's 'Walk This Way', with Steven Tyler and Joe Perry, became the first rap song to reach the top five of the Hot 100. In November the Beastie Boys released 'Licensed to Ill', which in March 1987 became the first rap album to top the Billboard 200.",
        tags: ["first", "business"],
        stat: { value: 4, label: "where 'Walk This Way' peaked on the Hot 100", prefix: "No. " },
        records: [song("Walk This Way", "Run-DMC", 1986), album("Raising Hell", "Run-DMC", 1986, "raising-hell"), album("Licensed to Ill", "Beastie Boys", 1986, "licensed-to-ill")],
      },
      {
        id: "sampler",
        when: "Mid-1980s",
        title: "The sampler changes everything",
        text: "Producer Marley Marl found he could sample a single drum hit from an old record and play it back as part of a new beat. Machines like the E-mu SP-1200 and the Akai MPC60, released in 1987 and 1988, made the method standard, and producers started building whole songs from fragments of funk, soul and jazz.",
        tags: ["sound"],
      },
      {
        id: "rakim",
        when: "1987",
        title: "Rakim raises the bar",
        text: "On Eric B. & Rakim's 'Paid in Full', Rakim rapped in a calm, measured voice packed with internal rhymes, and changed what rappers thought a verse could do. The same year Boogie Down Productions released 'Criminal Minded' and Public Enemy put out their debut.",
        tags: ["sound"],
        records: [album("Paid in Full", "Eric B. & Rakim", 1987, "paid-in-full"), album("Criminal Minded", "Boogie Down Productions", 1987)],
      },
      {
        id: "nation",
        when: "1988",
        title: "Public Enemy, N.W.A and 'Yo! MTV Raps'",
        text: "Public Enemy's 'It Takes a Nation of Millions to Hold Us Back' layered sirens, noise and stacks of samples under Chuck D's political sermons. In Compton, N.W.A's 'Straight Outta Compton' put West Coast gangsta rap on the national map, and 'Fuck tha Police' drew a warning letter from the FBI the following year. In August, 'Yo! MTV Raps' started showing rap videos to the whole country.",
        tags: ["culture", "sound"],
        records: [
          album("It Takes a Nation of Millions to Hold Us Back", "Public Enemy", 1988, "it-takes-a-nation-of-millions-to-hold-us-back"),
          album("Straight Outta Compton", "N.W.A", 1988, "straight-outta-compton"),
          album("Long Live the Kane", "Big Daddy Kane", 1988, "long-live-the-kane"),
          album("The Great Adventures of Slick Rick", "Slick Rick", 1988, "the-great-adventures-of-slick-rick"),
          album("Strictly Business", "EPMD", 1988, "strictly-business"),
          album("Critical Beatdown", "Ultramagnetic MCs", 1988, "critical-beatdown"),
          album("Power", "Ice-T", 1988, "power"),
        ],
      },
      {
        id: "grammy",
        when: "1989",
        title: "The first rap Grammy, and the sample collage",
        text: "The Grammys gave out a rap award for the first time, to DJ Jazzy Jeff & the Fresh Prince for 'Parents Just Don't Understand'. The category was left out of the TV broadcast, so the winners and several other nominees boycotted the ceremony. That year De La Soul's '3 Feet High and Rising', produced by Prince Paul, and the Beastie Boys' 'Paul's Boutique', produced by the Dust Brothers, built whole albums out of playful, crowded collages of samples.",
        tags: ["first", "sound"],
        records: [
          song("Parents Just Don't Understand", "DJ Jazzy Jeff & the Fresh Prince", 1988),
          album("3 Feet High and Rising", "De La Soul", 1989, "3-feet-high-and-rising"),
          album("Paul's Boutique", "Beastie Boys", 1989, "paul-s-boutique"),
        ],
      },
      {
        id: "pop",
        when: "1990",
        title: "Pop success and a court fight",
        text: "Vanilla Ice's 'Ice Ice Baby' became the first hip-hop single to top the Hot 100, and MC Hammer's 'Please Hammer, Don't Hurt 'Em' spent 21 weeks at number one on the Billboard 200. In Florida, a federal judge ruled 2 Live Crew's 'As Nasty as They Wanna Be' obscene, a decision an appeals court reversed in 1992.",
        tags: ["first", "business", "culture"],
        stat: { value: 21, label: "weeks at No. 1 for MC Hammer's album", suffix: " wks" },
        records: [
          album("Fear of a Black Planet", "Public Enemy", 1990, "fear-of-a-black-planet"),
          album("People's Instinctive Travels and the Paths of Rhythm", "A Tribe Called Quest", 1990, "people-s-instinctive-travels-and-the-paths-of-rhythm"),
          album("Mama Said Knock You Out", "LL Cool J", 1990, "mama-said-knock-you-out"),
        ],
      },
      {
        id: "biz",
        when: "1991",
        title: "Samples start to cost money",
        text: "On 17 December a federal judge ruled that Biz Markie had infringed copyright by sampling Gilbert O'Sullivan's 'Alone Again (Naturally)'. From then on samples had to be cleared and paid for, so producers used fewer of them and turned more often to replaying parts with musicians. The same year A Tribe Called Quest's 'The Low End Theory' joined rap to upright jazz bass, and Houston's Geto Boys showed the South had its own hard sound.",
        tags: ["business", "sound"],
        records: [
          album("The Low End Theory", "A Tribe Called Quest", 1991, "the-low-end-theory"),
          album("Death Certificate", "Ice Cube", 1991, "death-certificate"),
          album("Cypress Hill", "Cypress Hill", 1991, "cypress-hill"),
          album("We Can't Be Stopped", "Geto Boys", 1991, "we-can-t-be-stopped"),
          album("Qui sème le vent récolte le tempo", "MC Solaar", 1991, "qui-seme-le-vent-recolte-le-tempo"),
        ],
      },
      {
        id: "chronic",
        when: "1992",
        title: "G-funk",
        text: "Dr. Dre's 'The Chronic' slowed West Coast rap into a lazy, melodic roll built on Parliament-Funkadelic grooves, whining synthesizers and live bass, and introduced Snoop Doggy Dogg. Released on Death Row in December, it set the sound of mainstream rap for years.",
        tags: ["sound", "business"],
        records: [
          album("The Chronic", "Dr. Dre", 1992, "the-chronic"),
          album("Mecca and the Soul Brother", "Pete Rock & CL Smooth", 1992, "mecca-and-the-soul-brother"),
          album("Vier gewinnt", "Die Fantastischen Vier", 1992, "vier-gewinnt"),
        ],
      },
    ],
  },
  {
    id: "coasts",
    label: "Late 90s",
    span: "1993 to 1999",
    from: 1993,
    to: 1999,
    title: "East, West and the South",
    intro:
      "The mid-1990s brought an extraordinary run of albums from New York and Los Angeles, a feud between the two coasts that ended with two of rap's biggest stars killed, and the rise of the South as a force of its own. By the end of the decade rap was outselling country in America and had put down roots in France, Brazil, Germany, Cuba and well beyond.",
    sound: "Dusty boom bap in New York, G-funk in California, bounce and Memphis horror in the South.",
    poster: "enter-the-wu-tang-36-chambers",
    artists: ["Wu-Tang Clan", "Nas", "The Notorious B.I.G.", "2Pac", "Snoop Doggy Dogg", "OutKast", "Jay-Z", "Lauryn Hill", "Missy Elliott", "Mobb Deep", "UGK", "Three 6 Mafia", "Master P", "DJ Screw", "Eminem"],
    moments: [
      {
        id: "wu",
        when: "1993",
        title: "Wu-Tang and 'Doggystyle'",
        text: "RZA produced 'Enter the Wu-Tang (36 Chambers)' on a small budget, with grimy kung fu samples and nine rappers trading verses, and negotiated a deal that let each member sign solo contracts with other labels. Two weeks later Snoop Doggy Dogg's 'Doggystyle' entered the Billboard 200 at number one, selling 806,858 copies in its first week, a record for a debut artist at the time.",
        tags: ["business", "sound"],
        stat: { value: 806858, label: "copies of 'Doggystyle' sold in week one" },
        records: [
          album("Enter the Wu-Tang (36 Chambers)", "Wu-Tang Clan", 1993, "enter-the-wu-tang-36-chambers"),
          album("Doggystyle", "Snoop Doggy Dogg", 1993, "doggystyle"),
          album("Midnight Marauders", "A Tribe Called Quest", 1993, "midnight-marauders"),
          album("93 'til Infinity", "Souls of Mischief", 1993, "93-til-infinity"),
          album("Reachin' (A New Refutation of Time and Space)", "Digable Planets", 1993, "reachin-a-new-refutation-of-time-and-space"),
        ],
      },
      {
        id: "illmatic",
        when: "1994",
        title: "'Illmatic' and 'Ready to Die'",
        text: "Nas's 'Illmatic', with beats from DJ Premier, Pete Rock, Q-Tip, Large Professor and L.E.S., packed Queensbridge into ten tracks and became the reference point for New York lyricism. In September The Notorious B.I.G.'s 'Ready to Die' made Puff Daddy's Bad Boy Records a power, and in Atlanta OutKast arrived with 'Southernplayalisticadillacmuzik'.",
        tags: ["sound"],
        records: [
          album("Illmatic", "Nas", 1994, "illmatic"),
          album("Ready to Die", "The Notorious B.I.G.", 1994, "ready-to-die"),
          album("Southernplayalisticadillacmuzik", "OutKast", 1994, "southernplayalisticadillacmuzik"),
          album("Resurrection", "Common", 1994, "resurrection"),
          album("The Diary", "Scarface", 1994, "the-diary"),
        ],
      },
      {
        id: "south",
        when: "1995",
        title: "'The South got something to say'",
        text: "At the Source Awards in New York, OutKast won best new group to boos from the crowd, and André 3000 answered with a line that became a prophecy. The same night Suge Knight's jab at Puff Daddy dragged the feud between Death Row and Bad Boy into the open. Solo albums from Raekwon, GZA and Ol' Dirty Bastard kept the Wu-Tang sound spreading, and Three 6 Mafia and Bone Thugs-n-Harmony brought new flows from Memphis and Cleveland.",
        tags: ["culture"],
        records: [
          album("Only Built 4 Cuban Linx...", "Raekwon", 1995, "only-built-4-cuban-linx"),
          album("Liquid Swords", "GZA", 1995, "liquid-swords"),
          album("The Infamous", "Mobb Deep", 1995, "the-infamous"),
          album("Me Against the World", "2Pac", 1995, "me-against-the-world"),
          album("Mystic Stylez", "Three 6 Mafia", 1995, "mystic-stylez"),
          album("E. 1999 Eternal", "Bone Thugs-n-Harmony", 1995, "e-1999-eternal"),
          album("Paris sous les bombes", "Suprême NTM", 1995, "paris-sous-les-bombes"),
        ],
      },
      {
        id: "pac",
        when: "1996",
        title: "A huge year, and the loss of 2Pac",
        text: "2Pac's double album 'All Eyez on Me' and the Fugees' 'The Score' sold in the millions, Jay-Z launched Roc-A-Fella with 'Reasonable Doubt', and UGK and OutKast kept building the Southern sound. On 7 September 2Pac was shot in Las Vegas. He died six days later, aged 25.",
        tags: ["culture", "business"],
        records: [
          album("All Eyez on Me", "2Pac", 1996, "all-eyez-on-me"),
          album("The Score", "Fugees", 1996, "the-score"),
          album("Reasonable Doubt", "Jay-Z", 1996, "reasonable-doubt"),
          album("ATLiens", "OutKast", 1996, "atliens"),
          album("Ridin' Dirty", "UGK", 1996, "ridin-dirty"),
          album("Hard Core", "Lil' Kim", 1996, "hard-core"),
          album("Mucho Barato", "Control Machete", 1996, "mucho-barato"),
        ],
      },
      {
        id: "biggie",
        when: "1997",
        title: "Biggie, and rap goes global",
        text: "The Notorious B.I.G. was shot dead in Los Angeles on 9 March, aged 24, and 'Life After Death' came out 16 days later and went to number one. Around the world rap had found local voices. IAM's 'L'École du micro d'argent' became a landmark in France, and in São Paulo Racionais MC's released 'Sobrevivendo no Inferno' on their own label, Cosa Nostra, and made the best-selling rap album in Brazil's history.",
        tags: ["world", "culture"],
        stat: { value: 1500000, label: "legal copies of 'Sobrevivendo no Inferno' by 2010, by one estimate", suffix: "+" },
        records: [
          album("Life After Death", "The Notorious B.I.G.", 1997, "life-after-death"),
          album("Sobrevivendo no Inferno", "Racionais MC's", 1997, "sobrevivendo-no-inferno"),
          album("L'École du micro d'argent", "IAM", 1997, "l-ecole-du-micro-d-argent"),
          album("Supa Dupa Fly", "Missy Elliott", 1997, "supa-dupa-fly"),
          album("Ghetto D", "Master P", 1997, "ghetto-d"),
          album("Wu-Tang Forever", "Wu-Tang Clan", 1997, "wu-tang-forever"),
        ],
      },
      {
        id: "lauryn",
        when: "1998",
        title: "Rap outsells country",
        text: "In 1998, for the first time, rap sold more in America than country music, until then the country's top-selling format. Lauryn Hill's 'The Miseducation of Lauryn Hill' mixed rap with soul and, in February 1999, became the first hip-hop album to win the Grammy for Album of the Year. Jay-Z's 'Hard Knock Life' and Cash Money's distribution deal with Universal showed where the money was heading.",
        tags: ["first", "business"],
        records: [
          album("The Miseducation of Lauryn Hill", "Lauryn Hill", 1998, "the-miseducation-of-lauryn-hill"),
          album("Aquemini", "OutKast", 1998, "aquemini"),
          album("Vol. 2... Hard Knock Life", "Jay-Z", 1998, "vol-2-hard-knock-life"),
          album("Mos Def & Talib Kweli Are Black Star", "Black Star", 1998, "mos-def-talib-kweli-are-black-star"),
          album("400 Degreez", "Juvenile", 1998, "400-degreez"),
          album("Moment of Truth", "Gang Starr", 1998, "moment-of-truth"),
          album("Le combat continue", "Ideal J", 1998, "le-combat-continue"),
        ],
      },
      {
        id: "shady",
        when: "1999",
        title: "Eminem, and a thriving underground",
        text: "Dr. Dre signed a Detroit battle rapper to Aftermath, and 'The Slim Shady LP' turned Eminem into a star. Independent labels like Rawkus kept a lyrical underground alive, MF DOOM came back behind a metal mask with 'Operation: Doomsday', and The Roots' 'Things Fall Apart' put a live band at the centre of a rap record.",
        tags: ["sound", "business"],
        records: [
          album("The Slim Shady LP", "Eminem", 1999, "the-slim-shady-lp"),
          album("2001", "Dr. Dre", 1999, "2001"),
          album("Black on Both Sides", "Mos Def", 1999, "black-on-both-sides"),
          album("Operation: Doomsday", "MF DOOM", 1999, "operation-doomsday"),
          album("Things Fall Apart", "The Roots", 1999, "things-fall-apart"),
          album("A lo cubano", "Orishas", 1999, "a-lo-cubano"),
        ],
      },
    ],
  },
  {
    id: "pop",
    label: "2000s",
    span: "2000 to 2009",
    from: 2000,
    to: 2009,
    title: "Pop, the South and the internet",
    intro:
      "Hip-hop spent the 2000s as pop music. Producers like the Neptunes, Timbaland and Kanye West wrote the sound of radio, the South took over the charts, and by the end of the decade free mixtapes, blogs and YouTube were deciding who broke through.",
    sound: "Sped-up soul samples, Neptunes minimalism, crunk chants and trap's rattling hi-hats.",
    poster: "the-college-dropout",
    artists: ["Eminem", "Jay-Z", "OutKast", "Kanye West", "50 Cent", "Missy Elliott", "The Neptunes", "Timbaland", "Lil Wayne", "T.I.", "Ludacris", "Lil Jon", "Young Jeezy", "Gucci Mane", "Dizzee Rascal", "MF DOOM", "J Dilla"],
    moments: [
      {
        id: "mmlp",
        when: "2000",
        title: "'The Marshall Mathers LP'",
        text: "Eminem's second major-label album sold 1.76 million copies in its first week, the fastest-selling rap album in US history at the time. In Atlanta, OutKast's 'Stankonia' pushed into funk, rock and psychedelia with 'B.O.B.' and 'Ms. Jackson'.",
        tags: ["business"],
        stat: { value: 1760000, label: "copies of 'The Marshall Mathers LP' in week one" },
        records: [
          album("The Marshall Mathers LP", "Eminem", 2000, "the-marshall-mathers-lp"),
          album("Stankonia", "OutKast", 2000, "stankonia"),
          album("Like Water for Chocolate", "Common", 2000, "like-water-for-chocolate"),
          album("Let's Get Free", "dead prez", 2000, "let-s-get-free"),
        ],
      },
      {
        id: "blueprint",
        when: "2001",
        title: "Soul samples and 'The Blueprint'",
        text: "Released on 11 September, Jay-Z's 'The Blueprint' ran on sped-up soul samples from Kanye West and Just Blaze, a sound that took over New York. Its track 'Takeover' started a famous battle with Nas, who answered with 'Ether'.",
        tags: ["sound"],
        records: [album("The Blueprint", "Jay-Z", 2001, "the-blueprint"), song("Ether", "Nas", 2001), album("The Cold Vein", "Cannibal Ox", 2001, "the-cold-vein")],
      },
      {
        id: "lose-yourself",
        when: "2002",
        title: "'Lose Yourself'",
        text: "Eminem's song from '8 Mile' spent 12 weeks at number one on the Hot 100 and, in March 2003, became the first rap song to win the Academy Award for Best Original Song. Clipse and the Neptunes released 'Lord Willin'', and in London The Streets released 'Original Pirate Material'.",
        tags: ["first", "world"],
        records: [
          song("Lose Yourself", "Eminem", 2002),
          album("Lord Willin'", "Clipse", 2002, "lord-willin"),
          album("Original Pirate Material", "The Streets", 2002, "original-pirate-material"),
        ],
      },
      {
        id: "trap",
        when: "2003",
        title: "50 Cent, trap and grime",
        text: "50 Cent's 'Get Rich or Die Tryin'' and its single 'In da Club' ruled the year. In Atlanta, T.I. gave a whole style its name with 'Trap Muzik'. In London, Dizzee Rascal won the Mercury Prize with 'Boy in da Corner', the album that introduced grime. OutKast's 'Speakerboxxx/The Love Below' won Album of the Year at the Grammys the following February.",
        tags: ["sound", "world", "first"],
        records: [
          album("Get Rich or Die Tryin'", "50 Cent", 2003, "get-rich-or-die-tryin"),
          album("Trap Muzik", "T.I.", 2003, "trap-muzik"),
          album("Boy in da Corner", "Dizzee Rascal", 2003, "boy-in-da-corner"),
          album("The Black Album", "Jay-Z", 2003, "the-black-album"),
          album("Vom Bordstein bis zur Skyline", "Bushido", 2003, "vom-bordstein-bis-zur-skyline"),
        ],
      },
      {
        id: "dropout",
        when: "2004",
        title: "'The College Dropout' and 'Madvillainy'",
        text: "Kanye West, known until then as Jay-Z's producer, released 'The College Dropout', a debut full of soul samples, jokes and doubts about money, faith and school. On the independent Stones Throw label, MF DOOM and Madlib's 'Madvillainy' squeezed dense rhymes into short, strange songs that underground rappers still study.",
        tags: ["sound"],
        records: [
          album("The College Dropout", "Kanye West", 2004, "the-college-dropout"),
          album("Madvillainy", "Madvillain", 2004, "madvillainy"),
          album("MM..Food", "MF DOOM", 2004, "mm-food"),
          album("Babylon by Gus Vol. 1: O Ano do Macaco", "Black Alien", 2004, "babylon-by-gus-vol-1-o-ano-do-macaco"),
          album("La fierté des nôtres", "Rohff", 2004, "la-fierte-des-notres"),
        ],
      },
      {
        id: "youtube",
        when: "2005 to 2007",
        title: "Ringtones, snap and YouTube",
        text: "Southern sounds ruled radio, from Lil Jon's crunk to Atlanta's snap and Houston's slowed-down style descended from DJ Screw. In 2007 a teenager called Soulja Boy promoted 'Crank That (Soulja Boy)' online until it spent seven weeks at number one on the Hot 100. J Dilla, the producer's producer, released 'Donuts' on his 32nd birthday in February 2006, three days before he died.",
        tags: ["culture", "sound"],
        records: [
          album("Donuts", "J Dilla", 2006, "donuts"),
          song("Crank That (Soulja Boy)", "Soulja Boy", 2007),
          album("Tha Carter II", "Lil Wayne", 2005, "tha-carter-ii"),
          album("Late Registration", "Kanye West", 2005, "late-registration"),
          album("Graduation", "Kanye West", 2007, "graduation"),
          album("Modal Soul", "Nujabes", 2005, "modal-soul"),
          album("Ouest Side", "Booba", 2006, "ouest-side"),
        ],
      },
      {
        id: "808s",
        when: "2008",
        title: "'Tha Carter III' and '808s & Heartbreak'",
        text: "After years of free mixtapes, Lil Wayne sold more than a million copies of 'Tha Carter III' in its first week. In November Kanye West released '808s & Heartbreak', sung through Auto-Tune over cold drum machines, and opened the door to the melodic, emotional rap that followed.",
        tags: ["sound", "business"],
        records: [album("Tha Carter III", "Lil Wayne", 2008, "tha-carter-iii"), album("808s & Heartbreak", "Kanye West", 2008, "808s-heartbreak"), album("Untitled", "Nas", 2008, "untitled")],
      },
      {
        id: "so-far-gone",
        when: "2009",
        title: "Drake gives it away",
        text: "Drake released 'So Far Gone' as a free mixtape and signed to Young Money soon after. Kid Cudi's 'Man on the Moon: The End of Day' turned loneliness into hits.",
        tags: ["business"],
        records: [{ title: "So Far Gone", artist: "Drake", year: 2009, kind: "mixtape" }, album("Man on the Moon: The End of Day", "Kid Cudi", 2009, "man-on-the-moon-the-end-of-day")],
      },
    ],
  },
  {
    id: "stream",
    label: "2010s",
    span: "2010 to 2019",
    from: 2010,
    to: 2019,
    title: "Streaming takes over",
    intro:
      "Streaming changed how music was counted, and rap, with its fast release schedules and young audience, gained more than any other genre. New scenes grew up on SoundCloud, YouTube and Instagram, Atlanta became the centre of the sound, and rap from London, Paris, Milan and São Paulo reached listeners far from home.",
    sound: "808 bass, triplet flows, Auto-Tuned melody and drill's sliding bass lines.",
    poster: "to-pimp-a-butterfly",
    artists: ["Kanye West", "Drake", "Kendrick Lamar", "Nicki Minaj", "Future", "Young Thug", "Migos", "Travis Scott", "Chief Keef", "Tyler, the Creator", "A$AP Rocky", "Cardi B", "Skepta", "Stormzy", "Lil Uzi Vert", "Lil Nas X"],
    moments: [
      {
        id: "mbdtf",
        when: "2010",
        title: "'My Beautiful Dark Twisted Fantasy'",
        text: "Kanye West gave away a new song most Fridays through the autumn, then released a huge album of choirs, prog rock samples and guest verses, including Nicki Minaj's star-making turn on 'Monster'. Minaj's own debut, 'Pink Friday', came out the same day.",
        tags: ["sound"],
        records: [album("My Beautiful Dark Twisted Fantasy", "Kanye West", 2010, "my-beautiful-dark-twisted-fantasy"), album("Pink Friday", "Nicki Minaj", 2010)],
      },
      {
        id: "odd-future",
        when: "2011",
        title: "New crews online",
        text: "Odd Future, a Los Angeles crew led by Tyler, the Creator, built a following through Tumblr and free downloads, and A$AP Rocky's mixtape 'Live.Love.A$AP' mixed Harlem style with Houston and Memphis sounds. Jay-Z and Kanye West's 'Watch the Throne' and Drake's 'Take Care' showed how big the mainstream had become.",
        tags: ["culture"],
        records: [
          album("Live.Love.A$AP", "A$AP Rocky", 2011, "live-love-a-ap"),
          album("Watch the Throne", "Jay-Z & Kanye West", 2011, "watch-the-throne"),
          album("Take Care", "Drake", 2011, "take-care"),
        ],
      },
      {
        id: "drill",
        when: "2012",
        title: "Drill, and 'good kid, m.A.A.d city'",
        text: "Chicago teenager Chief Keef's 'I Don't Like' spread through YouTube, got a Kanye West remix and carried drill, a cold, violent sound from the city's South Side, around the world. Kendrick Lamar's 'good kid, m.A.A.d city' told a coming-of-age story in Compton like a film.",
        tags: ["sound", "world"],
        records: [
          song("I Don't Like", "Chief Keef", 2012),
          album("Finally Rich", "Chief Keef", 2012, "finally-rich"),
          album("good kid, m.A.A.d city", "Kendrick Lamar", 2012, "good-kid-m-a-a-d-city"),
          album("The Money Store", "Death Grips", 2012, "the-money-store"),
        ],
      },
      {
        id: "versace",
        when: "2013 to 2014",
        title: "Atlanta's flow, and streams start to count",
        text: "Migos's 'Versace' made their triplet flow one of the decade's most copied habits, while Young Thug and Future bent rap toward melody. In December 2014 Billboard began counting streams in its album chart, and rap's huge streaming numbers started to show up at the top.",
        tags: ["sound", "business"],
        records: [
          song("Versace", "Migos", 2013),
          album("Yeezus", "Kanye West", 2013, "yeezus"),
          album("Nothing Was the Same", "Drake", 2013, "nothing-was-the-same"),
          album("Unknown Death 2002", "Yung Lean", 2013, "unknown-death-2002"),
          album("Piñata", "Freddie Gibbs & Madlib", 2014, "pinata"),
          album("Run the Jewels 2", "Run the Jewels", 2014, "run-the-jewels-2"),
          album("Convoque Seu Buda", "Criolo", 2014, "convoque-seu-buda"),
        ],
      },
      {
        id: "tpab",
        when: "2015",
        title: "'To Pimp a Butterfly'",
        text: "Kendrick Lamar recorded with jazz musicians including Thundercat, Terrace Martin and Kamasi Washington and made an album about fame, depression and Black America. Its song 'Alright' was chanted at protests against police violence.",
        tags: ["sound", "culture"],
        records: [
          album("To Pimp a Butterfly", "Kendrick Lamar", 2015, "to-pimp-a-butterfly"),
          album("Rodeo", "Travis Scott", 2015, "rodeo"),
          album("If You're Reading This It's Too Late", "Drake", 2015, "if-you-re-reading-this-it-s-too-late"),
        ],
      },
      {
        id: "soundcloud",
        when: "2016 to 2017",
        title: "SoundCloud, grime, and rap on top",
        text: "Young artists uploading to SoundCloud, from Lil Uzi Vert to Playboi Carti, reached millions before signing anything. Chance the Rapper's 'Coloring Book' became the first streaming-only album to win a Grammy. In Britain, Skepta's 'Konnichiwa' won the Mercury Prize and Stormzy's 'Gang Signs & Prayer' became the first grime album to reach number one. In July 2017 Nielsen reported that R&B and hip-hop had passed rock as the most-consumed music in the United States for the first time.",
        tags: ["first", "business", "world"],
        records: [
          album("Coloring Book", "Chance the Rapper", 2016, "coloring-book"),
          album("Konnichiwa", "Skepta", 2016, "konnichiwa"),
          album("Gang Signs & Prayer", "Stormzy", 2017, "gang-signs-prayer"),
          album("Culture", "Migos", 2017, "culture"),
          album("Jeffery", "Young Thug", 2016, "jeffery"),
          album("Flower Boy", "Tyler, the Creator", 2017, "flower-boy"),
          album("Dans la légende", "PNL", 2016, "dans-la-legende"),
        ],
      },
      {
        id: "pulitzer",
        when: "2018",
        title: "A Pulitzer for 'DAMN.'",
        text: "Kendrick Lamar won the Pulitzer Prize for Music for 'DAMN.', the first time it went to a work outside classical music and jazz. Travis Scott's 'Astroworld' and Playboi Carti's 'Die Lit' pushed rap toward psychedelic rage, and in Italy Sfera Ebbasta's 'Rockstar' made trap the sound of the charts.",
        tags: ["first", "sound", "world"],
        records: [
          album("DAMN.", "Kendrick Lamar", 2017, "damn"),
          album("Astroworld", "Travis Scott", 2018, "astroworld"),
          album("Die Lit", "Playboi Carti", 2018, "die-lit"),
          album("Rockstar", "Sfera Ebbasta", 2018, "rockstar"),
          album("Daytona", "Pusha T", 2018, "daytona"),
          album("Kids See Ghosts", "Kids See Ghosts", 2018, "kids-see-ghosts"),
          album("Gigantes", "BK'", 2018, "gigantes"),
        ],
      },
      {
        id: "this-is-america",
        when: "2019",
        title: "Rap wins the biggest awards",
        text: "Childish Gambino's 'This Is America' became the first rap song to win the Grammys for Record and Song of the Year. Lil Nas X's 'Old Town Road' spent 19 weeks at number one on the Hot 100, a record at the time, and in Britain Dave's 'Psychodrama' won the Mercury Prize. In Brazil, Emicida's 'AmarElo' drew on samba, gospel and a sample of Belchior.",
        tags: ["first", "world"],
        stat: { value: 19, label: "weeks at No. 1 for 'Old Town Road'", suffix: " wks" },
        records: [
          song("This Is America", "Childish Gambino", 2018),
          album("Psychodrama", "Dave", 2019, "psychodrama"),
          album("AmarElo", "Emicida", 2019, "amarelo"),
          album("Igor", "Tyler, the Creator", 2019, "igor"),
          album("Nothing Great About Britain", "slowthai", 2019, "nothing-great-about-britain"),
          album("Les étoiles vagabondes", "Nekfeu", 2019, "les-etoiles-vagabondes"),
        ],
      },
    ],
  },
  {
    id: "now",
    label: "2020s",
    span: "2020 to now",
    from: 2020,
    to: 2026,
    title: "Everywhere at once",
    intro:
      "Rap is now the main language of popular music, made in bedrooms everywhere and passed around through TikTok, playlists and livestreams. Scenes in Brooklyn, London, Johannesburg, Paris, Milan and São Paulo all feed the global sound, and the genre's pioneers are honoured at the Super Bowl and in the US Senate.",
    sound: "Drill from three continents, rage synths, Griselda grit and the West Coast bounce coming back.",
    poster: "gnx",
    artists: ["Kendrick Lamar", "Drake", "Travis Scott", "Tyler, the Creator", "Playboi Carti", "Megan Thee Stallion", "Pop Smoke", "Central Cee", "Little Simz", "Doechii", "Westside Gunn", "JID", "Clipse"],
    moments: [
      {
        id: "pop-smoke",
        when: "2020",
        title: "Brooklyn drill, and a year without tours",
        text: "Pop Smoke carried a UK-influenced drill sound back to New York. He was killed in February at 20, and his posthumous debut went to number one. With concerts cancelled, Playboi Carti's 'Whole Lotta Red', Westside Gunn's 'Pray for Paris' and Djonga's 'Histórias da Minha Área' reached their fans through headphones.",
        tags: ["sound", "world"],
        records: [
          album("Whole Lotta Red", "Playboi Carti", 2020, "whole-lotta-red"),
          album("Pray for Paris", "Westside Gunn", 2020, "pray-for-paris"),
          album("Histórias da Minha Área", "Djonga", 2020, "historias-da-minha-area"),
        ],
      },
      {
        id: "super-bowl-lvi",
        when: "2022",
        title: "The Super Bowl gets a hip-hop show",
        text: "Dr. Dre, Snoop Dogg, Eminem, Mary J. Blige, Kendrick Lamar and 50 Cent played the Super Bowl LVI halftime show in Los Angeles, the first built around hip-hop, and it became the first halftime show to win an Emmy.",
        tags: ["first", "culture"],
        records: [
          album("Mr. Morale & the Big Steppers", "Kendrick Lamar", 2022, "mr-morale-the-big-steppers"),
          album("Call Me If You Get Lost", "Tyler, the Creator", 2021, "call-me-if-you-get-lost"),
          album("Civilisation", "Orelsan", 2021, "civilisation"),
          album("Flop", "Salmo", 2021, "flop"),
        ],
      },
      {
        id: "fifty",
        when: "2023",
        title: "Fifty years",
        text: "Hip-hop marked its 50th birthday with a concert at Yankee Stadium in the Bronx, a tribute at the Grammys and a US Senate resolution honouring the culture. AKA's 'Mass Country', released two weeks after the South African rapper was killed, and Travis Scott's 'Utopia' showed how far the sound had spread.",
        tags: ["culture", "world"],
        stat: { value: 50, label: "years since the party on Sedgwick Avenue", suffix: " yrs" },
        records: [
          album("Mass Country", "AKA", 2023, "mass-country"),
          album("Utopia", "Travis Scott", 2023, "utopia"),
          album("La divina commedia", "Tedua", 2023, "la-divina-commedia"),
          album("For All the Dogs", "Drake", 2023, "for-all-the-dogs"),
        ],
      },
      {
        id: "not-like-us",
        when: "2024",
        title: "Kendrick against Drake",
        text: "The year's biggest rap story was a feud. Over a few weeks in the spring, Kendrick Lamar and Drake traded diss tracks, ending with Lamar's 'Not Like Us', a West Coast party song produced by Mustard that went to number one. In the autumn Tyler, the Creator released 'Chromakopia' and Lamar surprise-released 'GNX'.",
        tags: ["culture"],
        records: [song("Not Like Us", "Kendrick Lamar", 2024), album("GNX", "Kendrick Lamar", 2024, "gnx"), album("Chromakopia", "Tyler, the Creator", 2024, "chromakopia")],
      },
      {
        id: "super-bowl-lix",
        when: "2025",
        title: "A solo headliner at the Super Bowl",
        text: "'Not Like Us' won five Grammys in February, including Record and Song of the Year. A week later Lamar became the first solo hip-hop artist to headline the Super Bowl halftime show. In the summer Clipse returned with 'Let God Sort Em Out', their first album in 16 years, and JID released 'God Does Like Ugly'.",
        tags: ["first", "culture"],
        stat: { value: 5, label: "Grammys for 'Not Like Us'" },
        records: [album("Let God Sort Em Out", "Clipse", 2025, "let-god-sort-em-out"), album("God Does Like Ugly", "JID", 2025, "god-does-like-ugly")],
      },
      {
        id: "most-awarded",
        when: "2026",
        title: "The most-awarded rapper in Grammy history",
        text: "In February, 'GNX' won the Grammy for Best Rap Album, and Lamar's wins that night took him past Jay-Z as the most-awarded rapper in Grammy history. Fifty-three years after a rec room party in the Bronx, the story keeps going.",
        tags: ["first"],
      },
    ],
  },
];

export const SOURCES: { title: string; url: string }[] = [
  { title: "Kool Herc and the History (and Mystery) of Hip-Hop's First Day, Rolling Stone", url: "https://www.rollingstone.com/music/music-features/kool-herc-hip-hop-50-august-11-1973-1234802035/" },
  { title: "Hip-hop is born at a birthday party in the Bronx, History.com", url: "https://www.history.com/this-day-in-history/august-11/hip-hop-is-born-at-a-birthday-party-in-the-bronx" },
  { title: "DJ Kool Herc, Wikipedia", url: "https://en.wikipedia.org/wiki/DJ_Kool_Herc" },
  { title: "King Tim III (Personality Jock), Wikipedia", url: "https://en.wikipedia.org/wiki/King_Tim_III_(Personality_Jock)" },
  { title: "Rapper's Delight, Wikipedia", url: "https://en.wikipedia.org/wiki/Rapper%27s_Delight" },
  { title: "The Breaks (song), Wikipedia", url: "https://en.wikipedia.org/wiki/The_Breaks_(song)" },
  { title: "Raising Hell (album), Wikipedia", url: "https://en.wikipedia.org/wiki/Raising_Hell_(album)" },
  { title: "Licensed to Ill, Wikipedia", url: "https://en.wikipedia.org/wiki/Licensed_to_Ill" },
  { title: "Grammy Award for Best Rap Performance, Wikipedia", url: "https://en.wikipedia.org/wiki/Grammy_Award_for_Best_Rap_Performance" },
  { title: "Ice Ice Baby, Wikipedia", url: "https://en.wikipedia.org/wiki/Ice_Ice_Baby" },
  { title: "Grand Upright Music v. Warner Bros. Records, Wikipedia", url: "https://en.wikipedia.org/wiki/Grand_Upright_Music,_Ltd._v._Warner_Bros._Records_Inc." },
  { title: "Doggystyle, Wikipedia", url: "https://en.wikipedia.org/wiki/Doggystyle" },
  { title: "Sobrevivendo no Inferno, Wikipedia", url: "https://en.wikipedia.org/wiki/Sobrevivendo_no_Inferno" },
  { title: "Music: Hip-Hop Nation, Time (1999)", url: "https://tollbit.time.com/archive/6734548/music-hip-hop-nation/" },
  { title: "Hip-Hop Is Most Popular Genre for First Time in History, The Source", url: "https://thesource.com/2017/07/19/hip-hop-popular-first-time-history/" },
  { title: "Super Bowl LVI halftime show, Wikipedia", url: "https://en.wikipedia.org/wiki/Super_Bowl_LVI_halftime_show" },
  { title: "United States Senate passes resolution honoring Hip-Hop 50, uDiscover Music", url: "https://udiscovermusic.com/news/united-states-senate-unanimously-passes-resolution-honoring-hip-hop-50" },
  { title: "Kendrick Lamar brings 'Not Like Us' into Super Bowl history, Digital Music News", url: "https://www.digitalmusicnews.com/2025/02/09/kendrick-lamar-brings-not-like-us-into-super-bowl-history/" },
  { title: "2026 Grammy Awards winners list, Q107", url: "https://q107.com/news/11640024/2026-grammy-awards-winners-list/" },
  { title: "MusicBrainz, for release dates", url: "https://musicbrainz.org/" },
];

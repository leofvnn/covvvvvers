/**
 * The seven chapters of the timeline. Each one answers the same questions:
 * what it sounded like, who shaped it, what it looked like, where and why it grew,
 * the defining records, the technology, the milestones, what it changed and what it left behind.
 * Moments come from lib/history.ts, people from lib/people.ts.
 */
import type { HistoryRecord } from "./history";

export type KeyRecord = HistoryRecord & { note: string };

export type Guide = {
  sound: string;
  look: string;
  where: string;
  tech: string;
  impact: string;
  legacy: string;
};

export type Chapter = {
  id: string;
  label: string;
  span: string;
  from: number;
  to: number;
  title: string;
  intro: string;
  poster: string;
  guide: Guide;
  moments: string[];
  people: string[];
  records: KeyRecord[];
};

const a = (title: string, artist: string, year: number, note: string): KeyRecord => ({ title, artist, year, kind: "album", note });
const s = (title: string, artist: string, year: number, note: string): KeyRecord => ({ title, artist, year, kind: "song", note });
const m = (title: string, artist: string, year: number, note: string): KeyRecord => ({ title, artist, year, kind: "mixtape", note });

export const CHAPTERS: Chapter[] = [
  {
    id: "foundations",
    label: "1973–84",
    span: "1973 to 1984",
    from: 1973,
    to: 1984,
    title: "Foundations",
    intro:
      "Hip-hop began as party music in the South Bronx, among Black, Puerto Rican and Caribbean teenagers in a borough the city had left to burn. DJs, MCs, dancers and graffiti writers built a whole culture from turntables, funk records and spray paint, and within a decade it was on the radio, on film and on its way around the world.",
    poster: "the-message",
    guide: {
      sound:
        "DJs looped the drum breaks of funk records on two turntables while MCs hyped the crowd. The first records, from 1979, used studio bands replaying disco grooves; 'Planet Rock' brought the Roland TR-808 and Kraftwerk-style synths in 1982, and Run-DMC stripped everything back to hard drum machines and shouting by 1984.",
      look:
        "Kangol hats, tracksuits, Puma Clydes and shell-toe Adidas, then Run-DMC's black leather and fedoras. Subway trains were the gallery for graffiti writers like Lee Quiñones, Lady Pink, Futura 2000 and Dondi. Record sleeves were mostly cheap label bags from Sugar Hill and Enjoy, until Run-DMC's stark black-and-white debut set a harder look.",
      where:
        "The 1970s South Bronx had been cut apart by the Cross Bronx Expressway, landlord arson, the city's 1975 fiscal crisis and cuts to services. Young people with no money built a culture that cost nothing to join and offered battles in place of gang fights. By 1984 it had spread to Harlem, Queens, Philadelphia and Los Angeles, and films like 'Wild Style', 'Style Wars' and 'Beat Street' carried it abroad.",
      tech:
        "Direct-drive turntables like the Technics SL-1200 and two-channel mixers made the DJ techniques possible. The Roland TR-808 drum machine arrived in 1980, the 12-inch single gave rap room to stretch out, and cassette tapes of live parties spread the music before labels cared.",
      impact:
        "Hip-hop gave Bronx youth a voice, a status system and an alternative to violence. 'The Message' proved rap could report on poverty and despair, and the four elements gave young people everywhere a way to make art with almost nothing.",
      legacy:
        "The four elements became the culture's foundation. The breakbeat led to sampling, the 808 led eventually to trap, and the new school sound of Run-DMC set up everything that came next.",
    },
    moments: ["sedgwick", "zulu", "technics", "flash", "mcs", "delight", "breaks", "808", "wheels", "planet-rock", "wild-style", "run-dmc"],
    people: ["herc", "cindy", "cokelarock", "bambaataa", "flash", "theodore", "mellemel", "sharock", "coldcrush", "sylvia", "sugarhill", "kurtisblow", "crazylegs", "ladypink", "marthacooper", "fab5freddy", "shante", "rundmc", "rubin", "simmons"],
    records: [
      s("King Tim III (Personality Jock)", "Fatback", 1979, "Often called the first commercially released rap record, out a few months before 'Rapper's Delight'. The claim is disputed, but its place in the story is not."),
      s("Rapper's Delight", "The Sugarhill Gang", 1979, "Introduced recorded rap to a mass audience and reached No. 36 on the Hot 100, the first rap hit. It proved the music could sell far beyond the Bronx."),
      s("Love Rap", "Spoonie Gee", 1980, "A showcase of early rhyme technique from one of Harlem's first star MCs."),
      s("The New Rap Language", "Treacherous Three", 1980, "Kool Moe Dee and the Treacherous Three sped up delivery and packed in more rhymes, pushing MC technique forward."),
      s("That's the Joint", "Funky 4 + 1", 1980, "Party rap at its peak, with Sha-Rock trading lines with the crew. In 1981 the group became the first hip-hop act on national TV, on 'Saturday Night Live'."),
      a("Sugarhill Gang", "The Sugarhill Gang", 1980, "One of the first commercially successful rap albums. It proved rap could move from live block parties onto records in stores and helped create the rap business."),
      a("Kurtis Blow", "Kurtis Blow", 1980, "The first rap album on a major label. It made the solo rapper a commercial proposition and carried 'The Breaks', the first gold rap single."),
      s("The Adventures of Grandmaster Flash on the Wheels of Steel", "Grandmaster Flash", 1981, "A hip-hop DJ performance captured on record, cut live from songs by Chic, Queen and Blondie."),
      s("Planet Rock", "Afrika Bambaataa & Soulsonic Force", 1982, "Fused hip-hop with electronic music through the TR-808 and Kraftwerk melodies, and inspired electro, Detroit techno and Miami bass."),
      a("The Message", "Grandmaster Flash and the Furious Five", 1982, "Turned rap from party music into social commentary, bringing poverty, crime and inequality into the mainstream. The title song was the first hip-hop recording added to the National Recording Registry."),
      s("Looking for the Perfect Beat", "Afrika Bambaataa & Soulsonic Force", 1983, "Pushed the electro sound of 'Planet Rock' further and influenced dance music for years."),
      s("Roxanne's Revenge", "Roxanne Shanté", 1984, "A 14-year-old's improvised answer to UTFO, produced by Marley Marl. It set off the Roxanne Wars, dozens of answer records, and made Shanté a star."),
      a("Escape", "Whodini", 1984, "Built a bridge between rap and R&B with synthesizers, electronic beats and melodic hooks, pointing toward new jack swing."),
      a("Run-D.M.C.", "Run-DMC", 1984, "Set the stripped-down sound of modern rap: loud drums, few instruments and aggressive delivery. Widely cited as the first gold rap album, it also made hip-hop fashion an identity."),
    ],
  },
  {
    id: "golden-begins",
    label: "1985–89",
    span: "1985 to 1989",
    from: 1985,
    to: 1989,
    title: "The golden age begins",
    intro:
      "In five years rap transformed what an MC could do, what a producer could build and what a song could say. Samplers turned record collections into instruments, Def Jam made stars, Public Enemy and N.W.A made rap the most argued-about music in America, and women claimed the mic for good.",
    poster: "it-takes-a-nation-of-millions-to-hold-us-back",
    guide: {
      sound:
        "Samplers changed everything: Marley Marl's sampled drums, Rick Rubin's rock-rap minimalism, the Bomb Squad's walls of noise for Public Enemy and Prince Paul's playful collages for De La Soul. Rakim brought internal rhymes and a calm, jazz-like flow, and regional sounds emerged in Miami, Philadelphia, Oakland and Los Angeles.",
      look:
        "Rope chains, door-knocker earrings, high-top fades and Dapper Dan's remixed luxury logos, then Afrocentric medallions and kente by the end of the decade. 'My Adidas' led to the first big sportswear deal for a rap act. Covers got bolder: the jet-crash gatefold of 'Licensed to Ill', the jail-cell photo and crosshairs logo of 'It Takes a Nation of Millions', the low-angle gun shot of 'Straight Outta Compton' and the day-glo daisies of '3 Feet High and Rising'.",
      where:
        "New York still led, while Los Angeles, Oakland, Miami, Philadelphia and Houston grew scenes of their own. The crack epidemic, Reagan-era cuts and police violence gave rappers plenty to say, and cheap samplers meant almost anyone could make a beat.",
      tech:
        "The E-mu SP-12 (1985) and SP-1200 (1987) and the Akai MPC60 (1988), designed with Roger Linn, put sampling and sequencing in one box. The SP-1200's short sample time forced producers to chop, which gave the era its gritty sound.",
      impact:
        "Rap became a national political voice and the main target in fights over censorship: Parental Advisory stickers, the FBI's 1989 letter about N.W.A, and the 2 Live Crew obscenity case. 'Yo! MTV Raps' and The Source, both launched in 1988, gave the culture its own media.",
      legacy:
        "The era created crate digging and the producer as auteur. Gangsta rap and conscious rap became the two poles that defined the 1990s.",
    },
    moments: ["radio", "platinum", "sampler", "rakim", "nation", "grammy"],
    people: ["llcoolj", "dougefresh", "marleymarl", "rakim", "krsone", "chuckd", "shocklee", "bigdaddykane", "slickrick", "saltnpepa", "mclyte", "latifah", "delasoul", "princepaul", "icet", "nwa", "tooshort", "luke", "dapperdan", "biz"],
    records: [
      s("P.S.K. What Does It Mean?", "Schoolly D", 1985, "A Philadelphia record of booming 808s and street talk that laid down an early blueprint for gangsta rap."),
      a("Radio", "LL Cool J", 1985, "Def Jam's first album made the solo rapper a superstar. Rick Rubin's bare production and LL's commanding delivery created the Def Jam sound."),
      a("Raising Hell", "Run-DMC", 1986, "The first platinum and multi-platinum rap album. 'Walk This Way' with Aerosmith reached No. 4, introduced hip-hop to rock audiences and gave rap mainstream legitimacy."),
      a("Licensed to Ill", "Beastie Boys", 1986, "Released in November 1986, it became the first rap album to top the Billboard 200 in March 1987 and stayed there seven weeks. It popularised rap-rock and showed rap's crossover power."),
      a("Hot, Cool & Vicious", "Salt-N-Pepa", 1986, "The debut that carried 'Push It' into the pop charts and made Salt-N-Pepa the first all-woman rap act to go platinum."),
      s("6 'n the Mornin'", "Ice-T", 1986, "First-person stories of Los Angeles street life that became a template for West Coast gangsta rap."),
      a("Born to Mack", "Too Short", 1987, "Too Short sold tapes from his car in Oakland and built a following without a major label, a model of independent hustle for the Bay Area and the South."),
      a("Paid in Full", "Eric B. & Rakim", 1987, "Revolutionised lyricism with internal rhymes, complex structures and a smooth, unhurried flow. Almost every technically gifted rapper since has been influenced by it."),
      a("Criminal Minded", "Boogie Down Productions", 1987, "KRS-One's forceful delivery and street-focused lyrics, with dancehall touches, helped lay the foundation for 1990s East Coast hardcore."),
      a("Yo! Bum Rush the Show", "Public Enemy", 1987, "Public Enemy's debut introduced their confrontational politics and dense production, and established rap as a vehicle for Black political expression."),
      a("It Takes a Nation of Millions to Hold Us Back", "Public Enemy", 1988, "A landmark in production and political rap. The Bomb Squad layered samples, sirens and noise into a revolutionary sound whose influence reaches far beyond hip-hop."),
      a("Straight Outta Compton", "N.W.A", 1988, "Established gangsta rap as a dominant movement, brought Compton and police brutality into national debate, drew a warning letter from the FBI and launched Dr. Dre, Ice Cube and Eazy-E."),
      a("Strictly Business", "EPMD", 1988, "Funk-heavy samples, a laid-back delivery and producer-MC chemistry that shaped the East Coast sound of the 1990s."),
      a("Long Live the Kane", "Big Daddy Kane", 1988, "Set a high bar for technical rapping, charisma and stage presence, and became a blueprint for the polished, gifted MC."),
      a("The Great Adventures of Slick Rick", "Slick Rick", 1988, "Raised storytelling in rap to an art, with characters, humour and conversational detail that influenced Nas, Biggie and Jay-Z."),
      a("Lyte as a Rock", "MC Lyte", 1988, "Widely cited as the first full album by a solo woman rapper, with tough, precise rhymes on songs like 'Paper Thin'."),
      a("Critical Beatdown", "Ultramagnetic MCs", 1988, "Avant-garde production and Kool Keith's strange, inventive style made it a cult classic and a touchstone for experimental rap."),
      s("The Symphony", "Marley Marl", 1988, "Marley Marl's Juice Crew, with Masta Ace, Craig G, Kool G Rap and Big Daddy Kane, set the model for the posse cut."),
      a("As Nasty as They Wanna Be", "2 Live Crew", 1989, "A Florida judge ruled it obscene in 1990 and an appeals court reversed the ruling in 1992, making it a landmark in the fight over free speech."),
      a("3 Feet High and Rising", "De La Soul", 1989, "Psychedelic samples, humour and a gentle, eccentric personality helped establish alternative hip-hop. A 1991 lawsuit over a Turtles sample made it a cautionary tale about clearance."),
      a("Paul's Boutique", "Beastie Boys", 1989, "The Dust Brothers built intricate collages from an enormous number of samples. It sold poorly on release and is now regarded as a masterpiece of sampling."),
      a("All Hail the Queen", "Queen Latifah", 1989, "Combined Afrocentric pride, feminism and lyrical skill, with 'Ladies First' making women's power a subject in its own right."),
      s("Fight the Power", "Public Enemy", 1989, "The anthem of Spike Lee's 'Do the Right Thing' and one of the most powerful protest songs in popular music."),
    ],
  },
  {
    id: "golden-peaks",
    label: "1990–94",
    span: "1990 to 1994",
    from: 1990,
    to: 1994,
    title: "The golden age peaks",
    intro:
      "Many of the sounds, production techniques and approaches to lyrics that define hip-hop today were perfected in these five years. New York refined boom bap and jazz rap, Los Angeles invented G-funk, Atlanta and Houston arrived, and a court ruling changed how every record was made.",
    poster: "illmatic",
    guide: {
      sound:
        "East Coast boom bap: swinging drums under filtered jazz and soul loops, from DJ Premier, Pete Rock, Large Professor, Q-Tip and RZA. Jazz rap from A Tribe Called Quest, Digable Planets and Gang Starr. On the West Coast, Dr. Dre's G-funk built on P-Funk grooves, Moog synth leads and live bass. Houston went dark with the Geto Boys and Cypress Hill brought Latino psychedelia.",
      look:
        "Cross Colours, Karl Kani and FUBU built Black-owned streetwear; baggy jeans, Timberlands, Carhartt, Starter jackets, Polo and Tommy Hilfiger, which Snoop wore on 'Saturday Night Live' in 1994. On the West Coast, Dickies and bandanas. Covers turned personal and iconic: Nas as a child over Queensbridge on 'Illmatic', the baby with an afro on 'Ready to Die', the wall of faces on 'Midnight Marauders' and the masked Wu-Tang with its W logo. In Houston, Pen & Pixel started its airbrushed bling covers in 1992.",
      where:
        "New York stayed the lyrical centre. The 1992 Los Angeles uprising after the Rodney King verdict fuelled West Coast anger. Atlanta, Houston, Memphis and New Orleans grew outside the industry through independent labels and distributors.",
      tech:
        "The MPC60 and MPC3000 and the SP-1200 ruled the studio, and Pro Tools arrived in 1991. After the Biz Markie ruling, sample clearance became a cost of doing business, pushing producers toward shorter chops and replayed parts.",
      impact:
        "Hip-hop shaped film ('Boyz n the Hood', 'Juice', 'Menace II Society'), television ('The Fresh Prince of Bel-Air'), slang and fashion. Hot 97 switched to hip-hop, Vibe launched in 1993, and Congress held hearings on gangsta rap in 1994.",
      legacy:
        "Boom bap and G-funk became the classic sounds every later revival quotes, from Griselda to 'GNX'. 'Illmatic' set the standard for lyricism that rappers still measure themselves against.",
    },
    moments: ["pop", "biz", "chronic", "screw", "wu", "illmatic"],
    people: ["dre", "icecube", "tribe", "premier", "peterock", "largepro", "redman", "rza", "wutang", "snoop", "nas", "biggie", "tupac", "outkast", "scarface", "dabrat", "hammer", "hypewilliams", "funkflex"],
    records: [
      a("AmeriKKKa's Most Wanted", "Ice Cube", 1990, "Ice Cube's first album after N.W.A, made in New York with the Bomb Squad, brought East Coast noise into West Coast gangsta rap."),
      a("People's Instinctive Travels and the Paths of Rhythm", "A Tribe Called Quest", 1990, "Playful rhymes and adventurous samples that helped build jazz-influenced alternative hip-hop and the Native Tongues collective."),
      a("Fear of a Black Planet", "Public Enemy", 1990, "Dense production, Black consciousness and sharp social criticism; one of the most important protest albums in rap."),
      a("Mama Said Knock You Out", "LL Cool J", 1990, "Marley Marl helped LL reinvent himself, and the title track became a battle-rap anthem that showed a veteran could still win."),
      a("The Low End Theory", "A Tribe Called Quest", 1991, "A defining jazz-rap album, with upright bass (Ron Carter plays on it), jazz samples and sharp, relaxed rhymes."),
      a("Breaking Atoms", "Main Source", 1991, "A production landmark for Large Professor, and the record that introduced a teenage Nas on 'Live at the Barbeque'."),
      a("We Can't Be Stopped", "Geto Boys", 1991, "Made Houston a rap city. 'Mind Playing Tricks on Me' explored paranoia and fear with rare psychological depth."),
      a("Death Certificate", "Ice Cube", 1991, "A furious concept album about Black life in Los Angeles. Some tracks were widely criticised as antisemitic and anti-Korean."),
      a("Cypress Hill", "Cypress Hill", 1991, "A Latino-led debut with DJ Muggs's psychedelic, smoky beats and B-Real's nasal voice."),
      a("The Chronic", "Dr. Dre", 1992, "Created G-funk: deep funk bass, whining synths and slow grooves. Released on Death Row on 15 December 1992, it changed West Coast production and made Snoop Doggy Dogg a star."),
      a("Mecca and the Soul Brother", "Pete Rock & CL Smooth", 1992, "Warm horn loops and jazz samples, including 'T.R.O.Y.', defined soulful East Coast production."),
      a("Daily Operation", "Gang Starr", 1992, "DJ Premier's signature chopped beats and Guru's calm delivery became the blueprint for underground New York boom bap."),
      a("Whut? Thee Album", "Redman", 1992, "Humour, funk and technical rhymes from Newark; an influence on a generation of energetic MCs."),
      a("Bizarre Ride II the Pharcyde", "The Pharcyde", 1992, "Goofy, jazzy and self-deprecating, it showed Los Angeles had an alternative scene too."),
      a("Enter the Wu-Tang (36 Chambers)", "Wu-Tang Clan", 1993, "Raw, gritty production and nine distinct personalities, plus a business model that let members sign solo deals elsewhere. It came out on 9 November 1993, the same day as 'Midnight Marauders'."),
      a("Doggystyle", "Snoop Doggy Dogg", 1993, "Took G-funk to No. 1. Snoop's conversational flow and Dre's production made one of the most recognisable sounds in rap."),
      a("Midnight Marauders", "A Tribe Called Quest", 1993, "Refined jazz rap with warm sampling and the effortless chemistry of Q-Tip and Phife Dawg."),
      a("Black Sunday", "Cypress Hill", 1993, "Debuted at No. 1 and widened hip-hop's audience, making Latino representation more visible in mainstream rap."),
      a("93 'til Infinity", "Souls of Mischief", 1993, "A landmark of Oakland's Hieroglyphics crew that showed California rap was far more varied than gangsta rap."),
      a("Reachin' (A New Refutation of Time and Space)", "Digable Planets", 1993, "Jazz, Afrocentrism and cool style; 'Rebirth of Slick (Cool Like Dat)' won a Grammy."),
      a("Illmatic", "Nas", 1994, "Released 19 April 1994, ten tracks of vivid, precise writing about Queensbridge over beats from DJ Premier, Pete Rock, Q-Tip and Large Professor. The standard for lyricism."),
      a("Southernplayalisticadillacmuzik", "OutKast", 1994, "Established Atlanta as a hip-hop centre, bringing Southern identity, funk, slang and live instruments into a genre still ruled by the coasts."),
      a("Ready to Die", "The Notorious B.I.G.", 1994, "Released 13 September 1994. Biggie's effortless flow and detailed stories, balancing vulnerability and street life, put New York back on top."),
      a("The Diary", "Scarface", 1994, "Cinematic stories of paranoia, violence and mortality that proved Southern MCs could match anyone."),
      a("Resurrection", "Common", 1994, "Established Chicago's conscious rap identity; 'I Used to Love H.E.R.' told hip-hop's own history as a love story."),
      a("The Sun Rises in the East", "Jeru the Damaja", 1994, "A DJ Premier-produced classic of stripped-down beats and philosophical street rhymes."),
      a("Funkdafied", "Da Brat", 1994, "Widely cited as the first platinum album by a solo woman rapper."),
      s("Regulate", "Warren G & Nate Dogg", 1994, "G-funk's pop peak, reaching No. 2 on the Hot 100."),
    ],
  },
  {
    id: "coasts",
    label: "1995–99",
    span: "1995 to 1999",
    from: 1995,
    to: 1999,
    title: "East, West and the rise of the South",
    intro:
      "Rap became the dominant force in American music. A rivalry between New York and Los Angeles ended with the killings of 2Pac and The Notorious B.I.G., the South built independent empires, superstars went pop, and by 1998 rap outsold country. Abroad, France and Brazil built rap cultures of their own.",
    poster: "aquemini",
    guide: {
      sound:
        "New York went cinematic with mafioso rap (Raekwon, Jay-Z) and bleak with Mobb Deep. The West polished G-funk and Cleveland's Bone Thugs-N-Harmony sang their rapid rhymes. In the South: Three 6 Mafia's lo-fi horror and triplet flows in Memphis, DJ Screw's slowed tapes and UGK's soulful country rap in Houston, bounce in New Orleans. Timbaland and Missy Elliott made rap sound futuristic, Puff Daddy made it shiny pop, and the Rawkus underground kept lyricism alive.",
      look:
        "Shiny suits, Coogi sweaters, Timbs and fatigues, Iceberg and Avirex, platinum chains and grills. Rappers launched their own brands: Wu Wear, Sean John (1998) and Rocawear (1999). Hype Williams's fisheye videos set the visual tone. Pen & Pixel's gold airbrushed covers defined No Limit and Cash Money, while New York used cinematic photography, from the noir of 'Reasonable Doubt' to the chess-board 'Liquid Swords'. 'Aquemini' was painted, and 'Miseducation' was a school desk.",
      where:
        "The coastal feud between Death Row and Bad Boy escalated through 1995 and 1996. In the South, independent labels sold millions through car culture and street networks while keeping ownership of their music. France became rap's second market and Brazil's Racionais MC's sold enormously on their own label.",
      tech:
        "The Akai MPC2000 (1997) and Auto-Tune (1997), which went pop with Cher's 'Believe' in 1998. CD sales peaked around 1999 and 2000, just as Napster (1999) arrived. Street mixtapes became the way new artists broke through.",
      impact:
        "The killings made violence in rap a national debate. Lauryn Hill and Lil' Kim widened what women in rap could be, Big Pun became the first solo Latino rapper to go platinum, and hip-hop fashion became a billion-dollar business.",
      legacy:
        "Memphis triplets, Houston's slowed sound and New Orleans bounce became the DNA of mainstream rap in the 2000s and 2010s. Jay-Z's mogul model and Eminem's arrival set up the next decade.",
    },
    moments: ["south", "pac", "biggie", "lauryn", "shady"],
    people: ["tupac", "biggie", "jayz", "lauryn", "missy", "timbaland", "mobbdeep", "ghostface", "ugk", "three6", "screw", "masterp", "cashmoney", "dmx", "bigpun", "lilkim", "busta", "eminem", "doom", "iam", "solaar", "racionais"],
    records: [
      a("Me Against the World", "2Pac", 1995, "2Pac's most vulnerable album, about poverty, trauma, family and death. It went to No. 1 while he was in prison."),
      a("The Infamous", "Mobb Deep", 1995, "Havoc's haunting production and Prodigy's cold delivery, including 'Shook Ones (Part II)', defined dark New York street rap."),
      a("Only Built 4 Cuban Linx...", "Raekwon", 1995, "The 'purple tape' popularised mafioso rap and cinematic crime stories, a blueprint for Jay-Z and later Griselda."),
      a("Liquid Swords", "GZA", 1995, "Intricate lyricism over RZA's darkest, most cinematic beats and martial arts samples."),
      a("E. 1999 Eternal", "Bone Thugs-n-Harmony", 1995, "Rapid melodic rapping and harmonies that influenced both rap and R&B; 'Tha Crossroads' won a Grammy."),
      a("Return to the 36 Chambers: The Dirty Version", "Ol' Dirty Bastard", 1995, "Unpredictable, funny and raw, it expanded what a rapper could sound like."),
      a("Mystic Stylez", "Three 6 Mafia", 1995, "Lo-fi horror and triplet flows from Memphis that became a blueprint for trap and phonk."),
      m("3 'n the Mornin' (Part Two)", "DJ Screw", 1995, "One of DJ Screw's chopped and screwed tapes, the slowed sound that made Houston a rap capital."),
      s("Gangsta's Paradise", "Coolio feat. L.V.", 1995, "The biggest song of 1995 on Billboard's year-end chart and a Grammy winner."),
      a("All Eyez on Me", "2Pac", 1996, "A double album released on Death Row in February 1996 that showed the commercial power of West Coast rap and became a blueprint for superstar albums."),
      a("Reasonable Doubt", "Jay-Z", 1996, "Established the sophisticated, business-minded street rapper; released on his own Roc-A-Fella Records."),
      a("ATLiens", "OutKast", 1996, "Futuristic production and introspection showed Southern rap could build entirely new worlds."),
      a("The Score", "Fugees", 1996, "Hip-hop, soul and reggae with Lauryn Hill's voice front and centre; it won the Grammy for Best Rap Album."),
      a("Ironman", "Ghostface Killah", 1996, "The soulful, emotional, cinematic side of Wu-Tang, and a major influence on underground street rap."),
      a("Ridin' Dirty", "UGK", 1996, "Slow, soulful, live-instrument country rap from Port Arthur, Texas; the touchstone of Southern rap."),
      a("Hard Core", "Lil' Kim", 1996, "Took control of sexual bravado in rap and influenced every woman who followed."),
      a("Life After Death", "The Notorious B.I.G.", 1997, "Released 16 days after Biggie was killed, a versatile double album that moved between hardcore rap, radio hits and storytelling."),
      a("Supa Dupa Fly", "Missy Elliott", 1997, "Timbaland's futuristic production and Missy's inventive delivery and videos changed the sound and look of rap and pop."),
      a("Wu-Tang Forever", "Wu-Tang Clan", 1997, "Debuted at No. 1 and showed the commercial power of a rap collective."),
      a("L'École du micro d'argent", "IAM", 1997, "The landmark of French rap, from Marseille."),
      a("Sobrevivendo no Inferno", "Racionais MC's", 1997, "Brazil's essential rap album, released on the group's own label, and the best-selling rap album in the country's history."),
      a("The Miseducation of Lauryn Hill", "Lauryn Hill", 1998, "One of the most influential fusions of rap, soul and R&B. It won five Grammys including Album of the Year, widely cited as a first for hip-hop."),
      a("It's Dark and Hell Is Hot", "DMX", 1998, "Raw aggression, vulnerability and spiritual struggle; it debuted at No. 1 and revived hardcore rap."),
      a("Aquemini", "OutKast", 1998, "Funk, soul, psychedelia and storytelling; one of the greatest statements of Southern rap's ambition."),
      a("Vol. 2... Hard Knock Life", "Jay-Z", 1998, "Turned Jay-Z into a pop superstar; the title track sampled the musical 'Annie'."),
      a("Mos Def & Talib Kweli Are Black Star", "Black Star", 1998, "Revived conscious, Afrocentric underground rap on Rawkus Records."),
      a("Capital Punishment", "Big Pun", 1998, "The first platinum album by a solo Latino rapper."),
      a("400 Degreez", "Juvenile", 1998, "Cash Money's breakthrough, with Mannie Fresh's bounce beats and 'Back That Azz Up'."),
      a("2001", "Dr. Dre", 1999, "Refined G-funk into a polished, piano-led sound that set the production standard for 2000s rap."),
      a("The Slim Shady LP", "Eminem", 1999, "Dark humour, shock and technical wordplay; it changed who could become a dominant rapper."),
      a("Operation: Doomsday", "MF DOOM", 1999, "The masked villain's debut: abstract rhymes, comic-book samples and a huge influence on independent rap."),
      a("Things Fall Apart", "The Roots", 1999, "Put a live band at the centre of a rap record; 'You Got Me' won a Grammy."),
      a("Black on Both Sides", "Mos Def", 1999, "A wide-ranging solo debut of conscious rap, rock and soul."),
    ],
  },
  {
    id: "pop",
    label: "2000s",
    span: "2000 to 2009",
    from: 2000,
    to: 2009,
    title: "Superstar rap and the changing sound",
    intro:
      "Rap became pop music. Superproducers wrote the sound of radio, the South took over the charts, grime grew in London, and as CD sales collapsed after Napster, mixtapes, ringtones, blogs and YouTube decided who broke through. By the end of the decade Auto-Tune and vulnerability had changed what a rapper could be.",
    poster: "the-college-dropout",
    guide: {
      sound:
        "The Neptunes' sparse futurism, Timbaland's stutters, Just Blaze and Kanye West's sped-up 'chipmunk soul'. The South ruled: crunk (Lil Jon), snap (D4L, Soulja Boy), trap (T.I., Young Jeezy, Gucci Mane, producer Zaytoven), Houston's slowed-down sound and Bay Area hyphy. Auto-Tune spread from T-Pain to Lil Wayne and '808s & Heartbreak'. Underground labels Def Jux, Stones Throw and Rhymesayers thrived, and grime grew in London.",
      look:
        "Throwback jerseys, tall white tees, Air Force 1s, Bape, fitted caps, Rocawear and Sean John, then polos, backpacks, shutter shades, Louis Vuitton and skinny jeans by 2008. Kanye brought fine art to covers, with the Dropout Bear trilogy and Takashi Murakami's 'Graduation'. Other icons: the mask on 'Madvillainy', the baby photo on 'Tha Carter III' and the deflated heart of '808s & Heartbreak'.",
      where:
        "Atlanta, New Orleans, Houston, Miami, Memphis and St. Louis became the commercial centre, with strip-club DJs breaking hits. Chicago (Kanye, Lupe) and Detroit (Eminem, Dilla) rose. After Napster, album sales fell and the money moved to mixtapes, ringtones and endorsements. In London, grime grew on pirate radio.",
      tech:
        "Pro Tools and FL Studio, the iTunes Store (2003), ringtones, YouTube (2005), MySpace, DatPiff (2005) and rap blogs. A 2007 raid on DJ Drama's studio showed the industry's uneasy relationship with mixtapes.",
      impact:
        "Rap became the default sound of American pop and produced the rapper-mogul. Eminem and Three 6 Mafia won Oscars. Debates about misogyny and homophobia in lyrics grew louder, while Kanye and Lupe opened space for vulnerable, middle-class voices.",
      legacy:
        "The 2010s inherited three tools from this decade: trap, Auto-Tuned melody and the free mixtape pipeline.",
    },
    moments: ["mmlp", "blueprint", "lose-yourself", "trap", "dropout", "youtube", "crank", "808s"],
    people: ["eminem", "jayz", "kanye", "neptunes", "fiftycent", "wayne", "ti", "liljon", "gucci", "dilla", "madlib", "doom", "ghostface", "clipse", "lupe", "djdrama", "dizzee", "wiley", "tpain", "soulja", "cudi", "outkast", "missy"],
    records: [
      a("The Marshall Mathers LP", "Eminem", 2000, "Sold about 1.76 million copies in its first week. It pushed technical rhyme schemes and confession to a huge audience, and drew protests over homophobia."),
      a("Supreme Clientele", "Ghostface Killah", 2000, "Abstract, stream-of-consciousness street rhymes over soul samples; an underground influence for decades."),
      a("Stankonia", "OutKast", 2000, "Electronic sounds, funk and rock in Southern rap, with 'Ms. Jackson' a No. 1 hit."),
      a("Like Water for Chocolate", "Common", 2000, "The warm, live sound of the Soulquarians, with J Dilla's drums."),
      a("The Blueprint", "Jay-Z", 2001, "Released 11 September 2001, it revived soul sampling and launched Kanye West and Just Blaze. 'Takeover' started the battle with Nas."),
      a("Miss E... So Addictive", "Missy Elliott", 2001, "'Get Ur Freak On' and Timbaland's rhythms pushed experimental production into the mainstream."),
      a("The Cold Vein", "Cannibal Ox", 2001, "El-P's industrial production and bleak New York stories on Def Jux; a landmark of underground rap."),
      a("Lord Willin'", "Clipse", 2002, "Introduced The Neptunes' minimalist beats and Clipse's sharp street writing to a wide audience."),
      a("Nellyville", "Nelly", 2002, "'Hot in Herre' brought St. Louis melody and pop hooks to the top of the charts."),
      s("Lose Yourself", "Eminem", 2002, "Twelve weeks at No. 1 and the first rap song to win the Oscar for Best Original Song."),
      a("Get Rich or Die Tryin'", "50 Cent", 2003, "The best-selling album of 2003 in the US; it made the mixtape-to-major-label path famous. 'In da Club' spent nine weeks at No. 1."),
      a("Speakerboxxx/The Love Below", "OutKast", 2003, "A double album of funk, pop and soul that won the Grammy for Album of the Year in 2004."),
      a("Diplomatic Immunity", "The Diplomats", 2003, "Defined Harlem's street-rap style, slang and fashion with soulful, sample-heavy beats."),
      a("Vaudeville Villain", "Viktor Vaughn", 2003, "MF DOOM under another alias, with fictional stories and abstract rhymes."),
      a("Trap Muzik", "T.I.", 2003, "Gave a whole Atlanta style its name."),
      a("Boy in da Corner", "Dizzee Rascal", 2003, "The landmark of grime; it won the Mercury Prize."),
      a("The Black Album", "Jay-Z", 2003, "Billed as a farewell, with '99 Problems' and 'Encore'."),
      a("The College Dropout", "Kanye West", 2004, "A vulnerable, funny, socially observant debut with soulful production that reshaped mainstream rap."),
      a("Madvillainy", "Madvillain", 2004, "Madlib's fragmented beats and DOOM's dense rhymes set a new standard for independent rap."),
      a("Late Registration", "Kanye West", 2005, "Orchestral arrangements and cinematic ambition; 'Gold Digger' was a No. 1 hit."),
      a("Let's Get It: Thug Motivation 101", "Young Jeezy", 2005, "Booming 808s and motivational street stories; one of the foundational trap albums."),
      a("Tha Carter II", "Lil Wayne", 2005, "Wayne's turn into one of rap's most inventive lyricists."),
      a("Donuts", "J Dilla", 2006, "Released on Dilla's 32nd birthday, three days before he died. It shaped beat culture and lo-fi music."),
      a("Hell Hath No Fury", "Clipse", 2006, "Cold, skeletal Neptunes beats and razor writing that influenced stripped-down production for years."),
      a("Food & Liquor", "Lupe Fiasco", 2006, "Complex lyricism and social commentary with mainstream success; 'Kick, Push' was a hit."),
      a("King", "T.I.", 2006, "Debuted at No. 1 and turned trap into a mainstream force."),
      s("Crank That (Soulja Boy)", "Soulja Boy", 2007, "Made in FL Studio and spread through YouTube; seven weeks at No. 1, a dance craze and a sign of the internet's power."),
      a("Graduation", "Kanye West", 2007, "Synths and stadium-sized sound; it outsold 50 Cent's 'Curtis' in a head-to-head release week, a symbolic shift away from gangsta rap."),
      m("Da Drought 3", "Lil Wayne", 2007, "A free mixtape from Wayne's flood of releases that made him the most influential rapper of the era."),
      a("Tha Carter III", "Lil Wayne", 2008, "Sold about a million copies in its first week and won Best Rap Album."),
      a("808s & Heartbreak", "Kanye West", 2008, "Auto-Tune, heartbreak and cold drum machines; the blueprint for Drake, Kid Cudi, Travis Scott and the SoundCloud generation."),
      m("So Far Gone", "Drake", 2009, "A free mixtape that launched Drake and the sung-rapped style he would ride to the top."),
      a("Man on the Moon: The End of Day", "Kid Cudi", 2009, "Made introspective, melancholy rap normal; foundational to emo rap."),
      a("Only Built 4 Cuban Linx... Pt. II", "Raekwon", 2009, "Revived mafioso rap for a new generation and reaffirmed Wu-Tang's influence."),
    ],
  },
  {
    id: "stream",
    label: "2010s",
    span: "2010 to 2019",
    from: 2010,
    to: 2019,
    title: "Trap, streaming and SoundCloud",
    intro:
      "The internet changed how artists found audiences, and streaming changed how music was counted. Atlanta's trap became the sound of pop, drill spread from Chicago to London and Brooklyn, SoundCloud made stars of teenagers, and in 2017 R&B and hip-hop became the most-consumed music in America. Kendrick Lamar won a Pulitzer.",
    poster: "to-pimp-a-butterfly",
    guide: {
      sound:
        "Trap became pop: Lex Luger's orchestral 808s, Metro Boomin and 808 Mafia, Migos's triplet flow, Future's Auto-Tuned melancholy and Young Thug's elastic voice. Drill travelled from Chicago to London and Brooklyn. SoundCloud rap brought distortion and emo melody, and Playboi Carti and Pi'erre Bourne's plugg pointed to rage. Kendrick's jazz-funk, Odd Future, Chance's gospel, Run the Jewels and Griselda's grit kept the alternatives strong, and grime came back in the UK.",
      look:
        "Streetwear merged with luxury: Off-White, Yeezy, Supreme and Gucci 'drip', with skinny distressed denim, face tattoos and dyed hair. Young Thug wore a dress on the 'Jeffery' cover. Covers became art: George Condo's paintings for 'My Beautiful Dark Twisted Fantasy', the clear 'Yeezus' case, the Polaroid of 'good kid, m.A.A.d city', the White House lawn of 'To Pimp a Butterfly', David LaChapelle's 'Astroworld' and the Whitney Houston photo on 'Daytona'. Every cover now had to work as a tiny thumbnail.",
      where:
        "Atlanta was the hit capital, from Quality Control to YSL to the Magic City strip club. Chicago drill grew from violence and segregation, Toronto had OVO and South Florida had the SoundCloud scene. France, Germany, Brazil, the UK and Latin trap built huge markets. Streaming flattened geography and virality replaced gatekeepers; after Ferguson in 2014, 'Alright' became a protest chant.",
      tech:
        "Spotify launched in the US in 2011, Apple Music and Tidal in 2015. Billboard began counting streams on the Hot 100 in 2013 and on its album chart in December 2014. SoundCloud, Vine, Instagram and, from 2018, TikTok became the new discovery engines, and producers sold 'type beats' online.",
      impact:
        "Black Lives Matter anthems, a new wave of women at the top, LGBTQ+ visibility through Frank Ocean, Tyler and Lil Nas X, and mental health as a central subject. The use of lyrics as evidence in court became a civil-liberties fight, and rap became the language of youth worldwide.",
      legacy:
        "The 2020s inherited streaming economics, drill's global network, the SoundCloud aesthetic of rage and plugg, and Kendrick's model of the serious concept album.",
    },
    moments: ["mbdtf", "odd-future", "drill", "versace", "tpab", "soundcloud", "pulitzer", "this-is-america"],
    people: ["kanye", "drake", "kendrick", "nicki", "jcole", "future", "thug", "migos", "metro", "travis", "keef", "tyler", "asap", "chance", "meek", "dannybrown", "rtj", "macmiller", "nipsey", "cardi", "uzi", "lilnasx", "virgil", "skepta", "stormzy", "emicida"],
    records: [
      a("My Beautiful Dark Twisted Fantasy", "Kanye West", 2010, "Maximalist orchestral, soul and prog-rock rap, previewed with free 'G.O.O.D. Fridays' songs. It raised expectations for what a rap album could be."),
      a("Teflon Don", "Rick Ross", 2010, "Grand, cinematic luxury rap that shaped the sound of mainstream street rap."),
      a("Sir Lucious Left Foot: The Son of Chico Dusty", "Big Boi", 2010, "Funk, electronics and technical rhymes; Southern rap at its most inventive."),
      a("Pink Friday", "Nicki Minaj", 2010, "Revived mainstream women's rap and carried 'Super Bass'."),
      a("Flockaveli", "Waka Flocka Flame", 2010, "Lex Luger's loud, orchestral 808s set the template for 2010s trap."),
      a("Take Care", "Drake", 2011, "Defined the modern melodic rapper who sings, raps and talks about relationships; the first Best Rap Album won by a non-American."),
      a("Section.80", "Kendrick Lamar", 2011, "Kendrick's first album, about generational struggles and young Black life."),
      a("Goblin", "Tyler, the Creator", 2011, "Odd Future's internet-driven, provocative do-it-yourself rap; its lyrics drew criticism for homophobia."),
      a("Watch the Throne", "Jay-Z & Kanye West", 2011, "A luxury blockbuster with a gold cover by Riccardo Tisci of Givenchy."),
      m("Live.Love.A$AP", "A$AP Rocky", 2011, "Harlem rap over Houston and Memphis sounds and Clams Casino's cloud-rap beats; a sign of how the internet blended regions."),
      a("good kid, m.A.A.d city", "Kendrick Lamar", 2012, "A cinematic coming-of-age story in Compton that brought concept albums back to the centre."),
      a("Finally Rich", "Chief Keef", 2012, "Brought Chicago drill to a major label and influenced UK and Brooklyn drill."),
      a("Dreams and Nightmares", "Meek Mill", 2012, "Its intro became the defining modern street-rap anthem."),
      a("Yeezus", "Kanye West", 2013, "Industrial, abrasive minimalism that influenced Travis Scott and a generation of experimental producers."),
      a("Long. Live. A$AP", "A$AP Rocky", 2013, "Debuted at No. 1 and made fashion-conscious, psychedelic rap mainstream."),
      m("Acid Rap", "Chance the Rapper", 2013, "A free mixtape of jazz, gospel and soul that proved an independent artist could build a huge audience."),
      a("Old", "Danny Brown", 2013, "Party music and dark personal stories with electronic production."),
      a("Run the Jewels", "Run the Jewels", 2013, "El-P and Killer Mike's free debut revived aggressive, political rap with humour."),
      a("Piñata", "Freddie Gibbs & Madlib", 2014, "Gibbs's street stories over Madlib's soul samples; a modern underground classic."),
      a("2014 Forest Hills Drive", "J. Cole", 2014, "Personal and reflective; it went platinum with no guest features."),
      a("To Pimp a Butterfly", "Kendrick Lamar", 2015, "Jazz, funk and spoken word about race, fame and Black history; 'Alright' became a protest anthem."),
      a("DS2", "Future", 2015, "Defined the dark, melodic trap sound of the mid-2010s."),
      a("Rodeo", "Travis Scott", 2015, "Psychedelic, immersive trap with cinematic transitions."),
      a("Compton", "Dr. Dre", 2015, "Dre's return, blending live instruments and modern textures; it introduced Anderson .Paak to many."),
      m("Barter 6", "Young Thug", 2015, "Young Thug's warbling melodies changed how rappers use their voices."),
      m("Coloring Book", "Chance the Rapper", 2016, "Gospel-filled and released free; the first streaming-only release to win a Grammy."),
      a("The Life of Pablo", "Kanye West", 2016, "An album that kept changing after release, a sign of the streaming age."),
      a("Atrocity Exhibition", "Danny Brown", 2016, "Pushed rap into industrial and avant-garde territory."),
      a("We Got It from Here... Thank You 4 Your Service", "A Tribe Called Quest", 2016, "A No. 1 farewell made after Phife Dawg's death that connected the golden age with the present."),
      a("Konnichiwa", "Skepta", 2016, "Took grime global and won the Mercury Prize."),
      a("Dans la légende", "PNL", 2016, "Independent French cloud rap from two brothers who barely gave interviews."),
      a("DAMN.", "Kendrick Lamar", 2017, "Complex themes made accessible; the first work outside classical music and jazz to win the Pulitzer Prize for Music."),
      a("4:44", "Jay-Z", 2017, "A mature look at marriage, fatherhood, wealth and Black economics."),
      a("Flower Boy", "Tyler, the Creator", 2017, "Tyler's turn into a songwriter and producer, exploring loneliness and his sexuality."),
      a("Culture", "Migos", 2017, "Took the triplet flow and Atlanta trap worldwide; 'Bad and Boujee' was a No. 1."),
      s("Bodak Yellow", "Cardi B", 2017, "The first No. 1 by a solo woman rapper since Lauryn Hill in 1998."),
      a("Gang Signs & Prayer", "Stormzy", 2017, "The first grime album to top the UK albums chart."),
      a("Luv Is Rage 2", "Lil Uzi Vert", 2017, "SoundCloud rap reaches No. 1, with 'XO Tour Llif3'."),
      a("Astroworld", "Travis Scott", 2018, "Psychedelic trap as an immersive event; 'Sicko Mode' went to No. 1."),
      a("Daytona", "Pusha T", 2018, "Seven tracks that proved a short album could be complete; it sparked a feud with Drake."),
      a("Invasion of Privacy", "Cardi B", 2018, "The first Best Rap Album won by a solo woman."),
      a("Swimming", "Mac Miller", 2018, "A personal mix of hip-hop, jazz and soul, released weeks before his death."),
      a("Die Lit", "Playboi Carti", 2018, "Baby-voiced ad-libs over Pi'erre Bourne's beats; a cult blueprint for rage."),
      s("This Is America", "Childish Gambino", 2018, "The first rap song to win Record and Song of the Year."),
      a("Igor", "Tyler, the Creator", 2019, "Rap, neo-soul and pop blended into one story; it won Best Rap Album."),
      a("Grey Area", "Little Simz", 2019, "Established Simz as a leading voice of UK and international rap."),
      a("Bandana", "Freddie Gibbs & Madlib", 2019, "Continued the revival of the producer-led album."),
      a("ZUU", "Denzel Curry", 2019, "A celebration of Carol City, Florida, with Miami bass influences."),
      a("Psychodrama", "Dave", 2019, "A concept album framed as therapy; it won the Mercury Prize."),
      s("Old Town Road", "Lil Nas X feat. Billy Ray Cyrus", 2019, "Spread through TikTok and spent a record 19 weeks at No. 1."),
      a("AmarElo", "Emicida", 2019, "Brazilian rap with samba, gospel and a Belchior sample."),
      s("Welcome to the Party", "Pop Smoke", 2019, "Brooklyn drill's breakthrough, over a UK drill beat by 808Melo."),
    ],
  },
  {
    id: "now",
    label: "2020s",
    span: "2020 to now",
    from: 2020,
    to: 2026,
    title: "Modern hip-hop",
    intro:
      "Rap is now the main language of popular music worldwide. Drill and rage are the sounds of the young, independent veterans make some of the best records, women and international artists lead the charts, and hip-hop has been honoured at the Super Bowl, the Olympics and the Pulitzers. The story is still being written.",
    poster: "gnx",
    guide: {
      sound:
        "Global drill, from Pop Smoke's Brooklyn to the Bronx's sample drill and UK drill-pop like 'Sprinter'. Rage, from Playboi Carti's 'Whole Lotta Red' to Ken Carson and Yeat. Plugg, Detroit street rap, Memphis's GloRilla, Griselda and the drumless loops of The Alchemist and billy woods. Jersey club, Afrobeats and Latin trap in the mix, and the West Coast bounce back on top with 'GNX'.",
      look:
        "Pharrell at Louis Vuitton (2023), A$AP Rocky co-chairing the 2025 Met Gala, Opium's goth-punk, Tyler's Golf le Fleur, a Y2K revival and drill balaclavas. Covers are personal again: Kendrick with his 1987 Buick on 'GNX', J. Cole's teenage bedroom on 'The Fall-Off', Baby Keem as a baby on 'Ca$ino', a cover by Tim Burton for 'Don't Be Dumb'. Vinyl variants drive first-week sales again.",
      where:
        "COVID-19 lockdowns pushed everything online, and TikTok and YouTube Shorts now build regional scenes. The George Floyd protests revived protest rap. UK drill, Afro-fusion and Latin trap compete worldwide, owning masters became realistic for independents, and courts became part of the story, from lyrics used as evidence to the Sean Combs and Tupac cases.",
      tech:
        "TikTok as the hit engine, surprise Monday releases and deluxe editions, livestream rollouts and vinyl variants. AI arrived with 'Heart on My Sleeve' (2023), a fake Drake and the Weeknd song, and Drake's 'Taylor Made Freestyle' (2024), pulled after Tupac's estate objected to its AI voice.",
      impact:
        "The Super Bowl, the Pulitzer, the Olympics and the Senate's Hip-Hop 50 resolution made hip-hop an institution. Women and queer artists are more visible than ever, Irish, Brazilian, French and UK rap carry debates about national identity, and California limited the use of lyrics as evidence in 2022.",
      legacy:
        "Still being written. The decade will likely be remembered for a rap feud fought at stadium scale, drill and rage as the youth sounds, independent veterans' comebacks, women and international rap reaching the top, and the open question of AI.",
    },
    moments: ["pop-smoke", "super-bowl-lvi", "fifty", "not-like-us", "super-bowl-lix", "most-awarded"],
    people: ["kendrick", "drake", "doechii", "megan", "cardi", "lilbaby", "popsmoke", "carti", "tyler", "clipse", "gibbs", "alchemist", "billywoods", "griselda", "glorilla", "centralcee", "simz", "mustard", "jcole", "asap", "babykeem"],
    records: [
      a("My Turn", "Lil Baby", 2020, "The top Billboard 200 album of 2020; melodic Atlanta street rap at the centre of pop."),
      a("Alfredo", "Freddie Gibbs & The Alchemist", 2020, "Soul samples and detailed street stories; Grammy-nominated."),
      a("RTJ4", "Run the Jewels", 2020, "Released early during the protests over George Floyd's killing; furious political rap."),
      a("Shoot for the Stars, Aim for the Moon", "Pop Smoke", 2020, "A posthumous No. 1 that took Brooklyn drill global."),
      s("WAP", "Cardi B feat. Megan Thee Stallion", 2020, "Debuted at No. 1 with a record 93 million US streams in its first week and sparked a debate about sexual expression."),
      a("King's Disease", "Nas", 2020, "Produced by Hit-Boy; it won Best Rap Album, Nas's first Grammy, and started a late-career run."),
      a("Whole Lotta Red", "Playboi Carti", 2020, "Released on Christmas Day, divisive at first and now the bible of rage."),
      a("Call Me If You Get Lost", "Tyler, the Creator", 2021, "A tribute to DJ Drama's mixtapes with luxurious beats and sharp rapping; Best Rap Album."),
      a("Sometimes I Might Be Introvert", "Little Simz", 2021, "Orchestral, cinematic and personal; it won the Mercury Prize."),
      a("Donda", "Kanye West", 2021, "Gospel-heavy and released after stadium listening parties."),
      a("The Off-Season", "J. Cole", 2021, "Competitive, athletic rapping that showed traditional skills could still top the charts."),
      a("Mr. Morale & the Big Steppers", "Kendrick Lamar", 2022, "Therapy, generational trauma, masculinity and family; Best Rap Album."),
      a("It's Almost Dry", "Pusha T", 2022, "Pharrell and Kanye production; Pusha's first No. 1."),
      a("I Never Liked You", "Future", 2022, "Melodic trap at its most dominant; 'Wait for U' went to No. 1."),
      a("Melt My Eyez See Your Future", "Denzel Curry", 2022, "Jazz, soul and introspection from a rapper raised in the trap era."),
      a("The Forever Story", "JID", 2022, "Rapid flows, family history and Southern identity; elite lyricism."),
      a("Cheat Codes", "Black Thought & Danger Mouse", 2022, "Elite rapping over inventive sample-based production."),
      a("King's Disease III", "Nas", 2022, "The peak of Nas and Hit-Boy's run, decades after his debut."),
      s("Sprinter", "Dave & Central Cee", 2023, "UK drill-pop at its biggest; ten weeks at No. 1 in the UK."),
      a("Utopia", "Travis Scott", 2023, "Ambitious sound design and global scale; a No. 1."),
      a("Michael", "Killer Mike", 2023, "Southern soul, gospel and politics; it swept the rap Grammys in 2024."),
      a("Magic 3", "Nas", 2023, "Closed Nas and Hit-Boy's run of six albums."),
      a("We Don't Trust You", "Future & Metro Boomin", 2024, "Kendrick Lamar's verse on 'Like That' reignited competitive rap and started the year's great feud."),
      s("Not Like Us", "Kendrick Lamar", 2024, "A standalone single produced by Mustard. It went to No. 1, spent a record 21 weeks atop Hot Rap Songs and won all five of its Grammy nominations, including Record and Song of the Year."),
      m("Alligator Bites Never Heal", "Doechii", 2024, "A mixtape that won Best Rap Album, making Doechii the third woman to win it."),
      a("Glorious", "GloRilla", 2024, "Memphis energy in the mainstream; nominated for Best Rap Album."),
      a("Chromakopia", "Tyler, the Creator", 2024, "Anxiety, family and identity; released on a Monday morning and debuted at No. 1."),
      a("GNX", "Kendrick Lamar", 2024, "A celebration of West Coast sound. 'Squabble Up' and 'Luther' went to No. 1, and it won Best Rap Album in 2026."),
      a("MUSIC", "Playboi Carti", 2025, "Debuted at No. 1 with the biggest rap week of early 2025."),
      a("Golliwog", "billy woods", 2025, "A horror-themed record that reclaims racist imagery; a critics' favourite of the year."),
      a("Lotus", "Little Simz", 2025, "Released in June 2025 with producer Miles Clinton James."),
      a("Let God Sort Em Out", "Clipse", 2025, "Their first album in 16 years, produced by Pharrell and released independently. Nominated for Album of the Year; 'Chains & Whips' won Best Rap Performance."),
      a("Don't Tap the Glass", "Tyler, the Creator", 2025, "A dance-floor record and his fourth straight No. 1."),
      a("Alfredo 2", "Freddie Gibbs & The Alchemist", 2025, "Launched with a noir short film shot in Japan."),
      a("God Does Like Ugly", "JID", 2025, "Dense, inventive rapping; nominated for Best Rap Album."),
      a("Don't Be Dumb", "A$AP Rocky", 2026, "His first album in eight years, with a cover by Tim Burton; it debuted at No. 1."),
      a("The Fall-Off", "J. Cole", 2026, "A double album billed as his last; it debuted at No. 1, his seventh."),
      a("Ca$ino", "Baby Keem", 2026, "Nearly five years in the making, with Kendrick Lamar and Too Short among the guests."),
      a("Iceman", "Drake", 2026, "Drake's 15th No. 1 album, more than Jay-Z; he became the first artist to hold the top three spots of the Billboard 200 at once."),
    ],
  },
];

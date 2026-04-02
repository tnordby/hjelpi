/* eslint-disable */
/**
 * Auto-generated from data/markedsplass-tjenester.csv — run: node scripts/generate-taxonomy.mjs
 * Merges: Rengjøring→Renhold, Språkundervisning→Språk, IKEA→Småreparasjoner.
 * Dedupes: dronefotografi, illustratør, arrangement bedriftsfoto/bryllups-DJ.
 */

export type TaxonomySubcategory = {
  slug: string
  title: string
}

export type TaxonomyCategory = {
  slug: string
  title: string
  subs: TaxonomySubcategory[]
}

export const TAXONOMY: TaxonomyCategory[] = [
  {
    "slug": "arrangement",
    "title": "Arrangement",
    "subs": [
      {
        "slug": "arrangementsdekorator",
        "title": "Arrangementsdekoratør"
      },
      {
        "slug": "bryllupsdekorering",
        "title": "Bryllupsdekorering"
      },
      {
        "slug": "bryllupsplanlegging",
        "title": "Bryllupsplanlegging"
      },
      {
        "slug": "cocktailbartender",
        "title": "Cocktailbartender"
      },
      {
        "slug": "dj-for-privatfest",
        "title": "DJ for privatfest"
      },
      {
        "slug": "dj-for-temafester",
        "title": "DJ for temafester"
      },
      {
        "slug": "event-dj",
        "title": "Event-DJ"
      },
      {
        "slug": "eventbartender",
        "title": "Eventbartender"
      },
      {
        "slug": "eventplanlegger",
        "title": "Eventplanlegger"
      },
      {
        "slug": "eventvideo",
        "title": "Eventvideo"
      },
      {
        "slug": "festutleieutstyr",
        "title": "Festutleieutstyr"
      },
      {
        "slug": "handverksfestplanlegging",
        "title": "Håndverksfestplanlegging"
      },
      {
        "slug": "iscenesettelse-og-trussing",
        "title": "Iscenesettelse og trussing"
      },
      {
        "slug": "klubb-dj",
        "title": "Klubb-DJ"
      },
      {
        "slug": "kommersiell-film-eller-musikkvideo",
        "title": "Kommersiell, film- eller musikkvideo"
      },
      {
        "slug": "lydproduksjonsspesialister",
        "title": "Lydproduksjonsspesialister"
      },
      {
        "slug": "mixolog",
        "title": "Mixolog"
      },
      {
        "slug": "mobil-barservice",
        "title": "Mobil barservice"
      },
      {
        "slug": "utleie-av-av-utstyr",
        "title": "Utleie av AV-utstyr"
      },
      {
        "slug": "videodesign-og-produksjon",
        "title": "Videodesign og produksjon"
      },
      {
        "slug": "videoredigering",
        "title": "Videoredigering"
      },
      {
        "slug": "vinkjenner",
        "title": "Vinkjenner"
      },
      {
        "slug": "olspesialist",
        "title": "Ølspesialist"
      }
    ]
  },
  {
    "slug": "barnevakt",
    "title": "Barnevakt",
    "subs": [
      {
        "slug": "barnepass-helg",
        "title": "Barnepass helg"
      },
      {
        "slug": "barnepass-kveld",
        "title": "Barnepass kveld"
      }
    ]
  },
  {
    "slug": "behandling",
    "title": "Behandling",
    "subs": [
      {
        "slug": "akupunktor",
        "title": "Akupunktør"
      },
      {
        "slug": "fotpleier",
        "title": "Fotpleier"
      },
      {
        "slug": "fysioterapeut",
        "title": "Fysioterapeut"
      },
      {
        "slug": "hudpleier",
        "title": "Hudpleier"
      },
      {
        "slug": "kiropraktor",
        "title": "Kiropraktor"
      },
      {
        "slug": "massor",
        "title": "Massør"
      },
      {
        "slug": "negletekniker",
        "title": "Negletekniker"
      },
      {
        "slug": "sportsmassasje",
        "title": "Sportsmassasje"
      }
    ]
  },
  {
    "slug": "bryllup",
    "title": "Bryllup",
    "subs": [
      {
        "slug": "bilutleie-for-bryllup",
        "title": "Bilutleie for bryllup"
      },
      {
        "slug": "brudekjoleendringer",
        "title": "Brudekjoleendringer"
      },
      {
        "slug": "brudekjoler",
        "title": "Brudekjoler"
      },
      {
        "slug": "brudepiker-og-forlovere",
        "title": "Brudepiker og forlovere"
      },
      {
        "slug": "bryllup-toastmasters",
        "title": "Bryllup Toastmasters"
      },
      {
        "slug": "bryllups-dj",
        "title": "Bryllups DJ"
      },
      {
        "slug": "bryllupsblomster",
        "title": "Bryllupsblomster"
      },
      {
        "slug": "bryllupscatering",
        "title": "Bryllupscatering"
      },
      {
        "slug": "bryllupsdekorering",
        "title": "Bryllupsdekorering"
      },
      {
        "slug": "bryllupsfeirer",
        "title": "Bryllupsfeirer"
      },
      {
        "slug": "bryllupsforsikring",
        "title": "Bryllupsforsikring"
      },
      {
        "slug": "bryllupsfotobokser",
        "title": "Bryllupsfotobokser"
      },
      {
        "slug": "bryllupsfrisor",
        "title": "Bryllupsfrisør"
      },
      {
        "slug": "bryllupslokaler",
        "title": "Bryllupslokaler"
      },
      {
        "slug": "bryllupslyd-og-lys",
        "title": "Bryllupslyd og lys"
      },
      {
        "slug": "bryllupsmusikere",
        "title": "Bryllupsmusikere"
      },
      {
        "slug": "bryllupsmusikkorps",
        "title": "Bryllupsmusikkorps"
      },
      {
        "slug": "bryllupsplanlegging",
        "title": "Bryllupsplanlegging"
      },
      {
        "slug": "bryllupsreise-planleggere",
        "title": "Bryllupsreise planleggere"
      },
      {
        "slug": "bryllupsreise-reisebyraer",
        "title": "Bryllupsreise reisebyråer"
      },
      {
        "slug": "bryllupsskrivesaker",
        "title": "Bryllupsskrivesaker"
      },
      {
        "slug": "bryllupssminke",
        "title": "Bryllupssminke"
      },
      {
        "slug": "bryllupssmykker",
        "title": "Bryllupssmykker"
      },
      {
        "slug": "bryllupsstylist",
        "title": "Bryllupsstylist"
      },
      {
        "slug": "bryllupsunderholdning",
        "title": "Bryllupsunderholdning"
      },
      {
        "slug": "buss-og-bussutleie",
        "title": "Buss og bussutleie"
      },
      {
        "slug": "engasjement-videografi",
        "title": "Engasjement Videografi"
      },
      {
        "slug": "skrivesaker-for-bryllup",
        "title": "Skrivesaker for bryllup"
      },
      {
        "slug": "utdrikningslager",
        "title": "Utdrikningslager"
      },
      {
        "slug": "utleie-av-telt",
        "title": "Utleie av telt"
      },
      {
        "slug": "veteranbilutleie",
        "title": "Veteranbilutleie"
      },
      {
        "slug": "videografi-for-bryllup",
        "title": "Videografi for bryllup"
      }
    ]
  },
  {
    "slug": "design",
    "title": "Design",
    "subs": [
      {
        "slug": "3d-modellering-og-cad-tjenester",
        "title": "3D-modellering og CAD-tjenester"
      },
      {
        "slug": "animasjon",
        "title": "Animasjon"
      },
      {
        "slug": "annonsedesign",
        "title": "Annonsedesign"
      },
      {
        "slug": "binding",
        "title": "Binding"
      },
      {
        "slug": "brosjyredesign",
        "title": "Brosjyredesign"
      },
      {
        "slug": "e-handel",
        "title": "E-handel"
      },
      {
        "slug": "e-postmaldesign",
        "title": "E-postmaldesign"
      },
      {
        "slug": "emballasjedesign",
        "title": "Emballasjedesign"
      },
      {
        "slug": "flyer-og-brosjyredesign",
        "title": "Flyer og brosjyredesign"
      },
      {
        "slug": "gatekunstner",
        "title": "Gatekunstner"
      },
      {
        "slug": "grafisk-design",
        "title": "Grafisk design"
      },
      {
        "slug": "illustrator",
        "title": "Illustratør"
      },
      {
        "slug": "ingeniordesign",
        "title": "Ingeniørdesign"
      },
      {
        "slug": "kontorrekvisita",
        "title": "Kontorrekvisita"
      },
      {
        "slug": "logodesign",
        "title": "Logodesign"
      },
      {
        "slug": "maler-portrettmaler-abstraktkunstner",
        "title": "Maler (Portrettmaler, Abstraktkunstner)"
      },
      {
        "slug": "merkevareutforming",
        "title": "Merkevareutforming"
      },
      {
        "slug": "presentasjonsdesign",
        "title": "Presentasjonsdesign"
      },
      {
        "slug": "printdesign",
        "title": "Printdesign"
      },
      {
        "slug": "teknisk-design",
        "title": "Teknisk design"
      },
      {
        "slug": "ux-og-ui-design",
        "title": "UX og UI design"
      },
      {
        "slug": "visittkortdesign",
        "title": "Visittkortdesign"
      },
      {
        "slug": "webdesign",
        "title": "Webdesign"
      },
      {
        "slug": "webutvikling",
        "title": "Webutvikling"
      }
    ]
  },
  {
    "slug": "dyrepass",
    "title": "Dyrepass",
    "subs": [
      {
        "slug": "dyrepass",
        "title": "Dyrepass"
      },
      {
        "slug": "dyrepasser-for-smadyr",
        "title": "Dyrepasser for smådyr"
      },
      {
        "slug": "hundelufting",
        "title": "Hundelufting"
      },
      {
        "slug": "husdyrpleier",
        "title": "Husdyrpleier"
      },
      {
        "slug": "kattepasser",
        "title": "Kattepasser"
      }
    ]
  },
  {
    "slug": "eldreomsorg",
    "title": "Eldreomsorg",
    "subs": [
      {
        "slug": "folge-til-lege",
        "title": "Følge til lege"
      },
      {
        "slug": "handlehjelp",
        "title": "Handlehjelp"
      }
    ]
  },
  {
    "slug": "eventutleie",
    "title": "Eventutleie",
    "subs": [
      {
        "slug": "utleie-av-partytelt",
        "title": "Utleie av partytelt"
      },
      {
        "slug": "utleie-av-stoler-og-bord",
        "title": "Utleie av stoler og bord"
      }
    ]
  },
  {
    "slug": "flislegging",
    "title": "Flislegging",
    "subs": [
      {
        "slug": "forsegling-fuging-og-fuging",
        "title": "Forsegling, fuging og fuging"
      },
      {
        "slug": "gulvfliser",
        "title": "Gulvfliser"
      },
      {
        "slug": "kjokkenfliser",
        "title": "Kjøkkenfliser"
      },
      {
        "slug": "montering-av-stein-eller-fliser-pa-gulv",
        "title": "Montering av stein eller fliser på gulv"
      },
      {
        "slug": "montering-av-tegltak",
        "title": "Montering av tegltak"
      },
      {
        "slug": "murstein-og-blokkbelegningstjenester",
        "title": "Murstein og blokkbelegningstjenester"
      },
      {
        "slug": "reparasjon-av-stein-eller-fliser",
        "title": "Reparasjon av stein eller fliser"
      },
      {
        "slug": "uteplasstjenester",
        "title": "Uteplasstjenester"
      }
    ]
  },
  {
    "slug": "flyttehjelp",
    "title": "Flyttehjelp",
    "subs": [
      {
        "slug": "baerehjelp",
        "title": "Bærehjelp"
      },
      {
        "slug": "flytting-av-mobler",
        "title": "Flytting av møbler"
      }
    ]
  },
  {
    "slug": "fotografi",
    "title": "Fotografi",
    "subs": [
      {
        "slug": "arkitekturfotografi",
        "title": "Arkitekturfotografi"
      },
      {
        "slug": "bedriftsfotografi",
        "title": "Bedriftsfotografi"
      },
      {
        "slug": "boudoirfotografi",
        "title": "Boudoirfotografi"
      },
      {
        "slug": "bryllupsfotografi",
        "title": "Bryllupsfotografi"
      },
      {
        "slug": "dronefotografi",
        "title": "Dronefotografi"
      },
      {
        "slug": "dyrefotografi",
        "title": "Dyrefotografi"
      },
      {
        "slug": "eiendomsfotografi",
        "title": "Eiendomsfotografi"
      },
      {
        "slug": "eventfotografi",
        "title": "Eventfotografi"
      },
      {
        "slug": "familiefotografi",
        "title": "Familiefotografi"
      },
      {
        "slug": "forlovelsesfotografi",
        "title": "Forlovelsesfotografi"
      },
      {
        "slug": "modellfotografi",
        "title": "Modellfotografi"
      },
      {
        "slug": "naturfotografi",
        "title": "Naturfotografi"
      },
      {
        "slug": "nyfodtfotografi",
        "title": "Nyfødtfotografi"
      },
      {
        "slug": "portrettfotografi",
        "title": "Portrettfotografi"
      },
      {
        "slug": "reklamefotografi",
        "title": "Reklamefotografi"
      },
      {
        "slug": "sportsfotografi",
        "title": "Sportsfotografi"
      }
    ]
  },
  {
    "slug": "frisor",
    "title": "Frisør",
    "subs": [
      {
        "slug": "barberer",
        "title": "Barberer"
      },
      {
        "slug": "harstylist",
        "title": "Hårstylist"
      }
    ]
  },
  {
    "slug": "hage-og-landskap",
    "title": "Hage og landskap",
    "subs": [
      {
        "slug": "bygging-av-drivhus",
        "title": "Bygging av drivhus"
      },
      {
        "slug": "bygging-av-hageskur",
        "title": "Bygging av hageskur"
      },
      {
        "slug": "gjodsling",
        "title": "Gjødsling"
      },
      {
        "slug": "hagerom",
        "title": "Hagerom"
      },
      {
        "slug": "hagerydning",
        "title": "Hagerydning"
      },
      {
        "slug": "installasjon-av-dam-og-vannfunksjoner",
        "title": "Installasjon av dam- og vannfunksjoner"
      },
      {
        "slug": "installasjon-av-gjerde-og-porter",
        "title": "Installasjon av gjerde og porter"
      },
      {
        "slug": "installasjon-av-hagesprinkleranlegg",
        "title": "Installasjon av hagesprinkleranlegg"
      },
      {
        "slug": "installasjon-av-kunstgress",
        "title": "Installasjon av kunstgress"
      },
      {
        "slug": "installasjon-av-sikkerhetsgjerde",
        "title": "Installasjon av sikkerhetsgjerde"
      },
      {
        "slug": "installasjon-vedlikehold-og-rengjoring-av-boblebad-og-spa",
        "title": "Installasjon, vedlikehold og rengjøring av boblebad og spa"
      },
      {
        "slug": "konstruksjon-av-lekeutstyr",
        "title": "Konstruksjon av lekeutstyr"
      },
      {
        "slug": "landskapsarbeid",
        "title": "Landskapsarbeid"
      },
      {
        "slug": "landskapsdesign",
        "title": "Landskapsdesign"
      },
      {
        "slug": "montering-av-grill",
        "title": "Montering av grill"
      },
      {
        "slug": "montering-av-lysthus-pergola-og-espalier",
        "title": "Montering av lysthus, pergola og espalier"
      },
      {
        "slug": "montering-av-markise",
        "title": "Montering av markise"
      },
      {
        "slug": "planting-vedlikehold-eller-fjerning-av-traer-og-busker",
        "title": "Planting, vedlikehold eller fjerning av trær og busker"
      },
      {
        "slug": "plassering-av-steinblokker",
        "title": "Plassering av steinblokker"
      },
      {
        "slug": "plenpleie",
        "title": "Plenpleie"
      },
      {
        "slug": "reparasjon-av-badestamp-og-spa",
        "title": "Reparasjon av badestamp og spa"
      },
      {
        "slug": "reparasjon-av-gjerde-og-porter",
        "title": "Reparasjon av gjerde og porter"
      },
      {
        "slug": "reparasjon-av-gressklipper",
        "title": "Reparasjon av gressklipper"
      },
      {
        "slug": "reparasjon-av-kunstgress",
        "title": "Reparasjon av kunstgress"
      },
      {
        "slug": "reparasjon-av-lekeutstyr",
        "title": "Reparasjon av lekeutstyr"
      },
      {
        "slug": "reparasjon-og-vedlikehold-av-dam-og-vannfunksjon",
        "title": "Reparasjon og vedlikehold av dam- og vannfunksjon"
      },
      {
        "slug": "reparasjon-og-vedlikehold-av-hagesprinkleranlegg",
        "title": "Reparasjon og vedlikehold av hagesprinkleranlegg"
      },
      {
        "slug": "reparasjon-og-vedlikehold-av-markise",
        "title": "Reparasjon og vedlikehold av markise"
      },
      {
        "slug": "reparasjon-og-vedlikehold-av-terrassedeksel",
        "title": "Reparasjon og vedlikehold av terrassedeksel"
      },
      {
        "slug": "snobroyting",
        "title": "Snøbrøyting"
      },
      {
        "slug": "stryketjenester",
        "title": "Stryketjenester"
      },
      {
        "slug": "stottemurkonstruksjon",
        "title": "Støttemurkonstruksjon"
      },
      {
        "slug": "trekirurgi-og-fjerning",
        "title": "Trekirurgi og fjerning"
      }
    ]
  },
  {
    "slug": "helse",
    "title": "Helse",
    "subs": [
      {
        "slug": "ansattes-hjelpeprogrammer",
        "title": "Ansattes hjelpeprogrammer"
      },
      {
        "slug": "aromaterapi",
        "title": "Aromaterapi"
      },
      {
        "slug": "avhengighetsterapi",
        "title": "Avhengighetsterapi"
      },
      {
        "slug": "barneradgivning",
        "title": "Barnerådgivning"
      },
      {
        "slug": "behandling-av-hartap",
        "title": "Behandling av hårtap"
      },
      {
        "slug": "depresjonsradgivning",
        "title": "Depresjonsrådgivning"
      },
      {
        "slug": "ekteskapsradgivning",
        "title": "Ekteskapsrådgivning"
      },
      {
        "slug": "familieradgivning",
        "title": "Familierådgivning"
      },
      {
        "slug": "fotterapi-og-fotterapeuter",
        "title": "Fotterapi og fotterapeuter"
      },
      {
        "slug": "fysioterapi",
        "title": "Fysioterapi"
      },
      {
        "slug": "gambling-terapi",
        "title": "Gambling terapi"
      },
      {
        "slug": "holistisk-terapi",
        "title": "Holistisk terapi"
      },
      {
        "slug": "homeopati",
        "title": "Homeopati"
      },
      {
        "slug": "hypnoterapi",
        "title": "Hypnoterapi"
      },
      {
        "slug": "horeapparater",
        "title": "Høreapparater"
      },
      {
        "slug": "iridologi",
        "title": "Iridologi"
      },
      {
        "slug": "jungiansk-psykoanalyse",
        "title": "Jungiansk psykoanalyse"
      },
      {
        "slug": "kognitiv-atferdsterapi",
        "title": "Kognitiv atferdsterapi"
      },
      {
        "slug": "komplementaer-terapi",
        "title": "Komplementær terapi"
      },
      {
        "slug": "kunstterapi",
        "title": "Kunstterapi"
      },
      {
        "slug": "massasjeterapi",
        "title": "Massasjeterapi"
      },
      {
        "slug": "massasjetrening",
        "title": "Massasjetrening"
      },
      {
        "slug": "osteopati",
        "title": "Osteopati"
      },
      {
        "slug": "parradgivning",
        "title": "Parrådgivning"
      },
      {
        "slug": "psykodynamisk-psykoterapi",
        "title": "Psykodynamisk psykoterapi"
      },
      {
        "slug": "psykologer",
        "title": "Psykologer"
      },
      {
        "slug": "psykoterapi",
        "title": "Psykoterapi"
      },
      {
        "slug": "refleksologi",
        "title": "Refleksologi"
      },
      {
        "slug": "reiki",
        "title": "Reiki"
      },
      {
        "slug": "radgivning",
        "title": "Rådgivning"
      },
      {
        "slug": "shiatsu",
        "title": "Shiatsu"
      },
      {
        "slug": "sofrologi",
        "title": "Sofrologi"
      },
      {
        "slug": "sorgradgivning",
        "title": "Sorgrådgivning"
      },
      {
        "slug": "stylister",
        "title": "Stylister"
      },
      {
        "slug": "terapeut",
        "title": "Terapeut"
      },
      {
        "slug": "ungdomsradgivning",
        "title": "Ungdomsrådgivning"
      }
    ]
  },
  {
    "slug": "handverker",
    "title": "Håndverker",
    "subs": [
      {
        "slug": "bygging-av-platting",
        "title": "Bygging av platting"
      },
      {
        "slug": "bygging-av-terrasse",
        "title": "Bygging av terrasse"
      },
      {
        "slug": "demontering-av-innredning",
        "title": "Demontering av innredning"
      },
      {
        "slug": "gulvsliping",
        "title": "Gulvsliping"
      },
      {
        "slug": "innvendig-isolering",
        "title": "Innvendig isolering"
      },
      {
        "slug": "legging-av-gulv",
        "title": "Legging av gulv"
      },
      {
        "slug": "montering-av-baderomsinnredning",
        "title": "Montering av baderomsinnredning"
      },
      {
        "slug": "montering-av-benkeplate",
        "title": "Montering av benkeplate"
      },
      {
        "slug": "montering-av-dor",
        "title": "Montering av dør"
      },
      {
        "slug": "montering-av-garderobe",
        "title": "Montering av garderobe"
      },
      {
        "slug": "montering-av-gjerde-og-port",
        "title": "Montering av gjerde og port"
      },
      {
        "slug": "montering-av-kjokken",
        "title": "Montering av kjøkken"
      },
      {
        "slug": "montering-av-mobler",
        "title": "Montering av møbler"
      },
      {
        "slug": "montering-av-utebod",
        "title": "Montering av utebod"
      },
      {
        "slug": "montering-av-vindu",
        "title": "Montering av vindu"
      },
      {
        "slug": "oppheng-av-bilder-og-tv",
        "title": "Oppheng av bilder og TV"
      },
      {
        "slug": "reparasjon-av-gjerde-eller-levegg",
        "title": "Reparasjon av gjerde eller levegg"
      },
      {
        "slug": "skifteavhandtakogbeslag",
        "title": "Skifteavhåndtakogbeslag"
      },
      {
        "slug": "smareparasjoner",
        "title": "Småreparasjoner"
      },
      {
        "slug": "snekring-av-hyller",
        "title": "Snekring av hyller"
      },
      {
        "slug": "sparkling-og-puss",
        "title": "Sparkling og puss"
      }
    ]
  },
  {
    "slug": "it-hjelp",
    "title": "IT-hjelp",
    "subs": [
      {
        "slug": "pc-og-printeroppsett",
        "title": "PC- og printeroppsett"
      },
      {
        "slug": "wifi-og-nettverksproblemer",
        "title": "WiFi- og nettverksproblemer"
      }
    ]
  },
  {
    "slug": "juridisk-radgivning",
    "title": "Juridisk rådgivning",
    "subs": [
      {
        "slug": "gratis-juridisk-vurdering",
        "title": "Gratis juridisk vurdering"
      },
      {
        "slug": "opprettelse-av-kontrakter",
        "title": "Opprettelse av kontrakter"
      }
    ]
  },
  {
    "slug": "kampsport",
    "title": "Kampsport",
    "subs": [
      {
        "slug": "boksing",
        "title": "Boksing"
      },
      {
        "slug": "brasiliansk-jiu-jitsu",
        "title": "Brasiliansk Jiu Jitsu"
      },
      {
        "slug": "bryting",
        "title": "Bryting"
      },
      {
        "slug": "catch-wrestling",
        "title": "Catch Wrestling"
      },
      {
        "slug": "hema",
        "title": "Hema"
      },
      {
        "slug": "judo",
        "title": "Judo"
      },
      {
        "slug": "karate",
        "title": "Karate"
      },
      {
        "slug": "kickboksing",
        "title": "Kickboksing"
      },
      {
        "slug": "mma",
        "title": "MMA"
      },
      {
        "slug": "muay-thai",
        "title": "Muay Thai"
      },
      {
        "slug": "sambo",
        "title": "Sambo"
      },
      {
        "slug": "sumobryting",
        "title": "Sumobryting"
      },
      {
        "slug": "taekwondo",
        "title": "Taekwondo"
      }
    ]
  },
  {
    "slug": "kokk",
    "title": "Kokk",
    "subs": [
      {
        "slug": "cateringkokk",
        "title": "Cateringkokk"
      },
      {
        "slug": "dessertkokk",
        "title": "Dessertkokk"
      },
      {
        "slug": "frokostkokk",
        "title": "Frokostkokk"
      },
      {
        "slug": "gourmetkokk",
        "title": "Gourmetkokk"
      },
      {
        "slug": "grillkokk",
        "title": "Grillkokk"
      },
      {
        "slug": "kokkforhjemmemiddag",
        "title": "Kokkforhjemmemiddag"
      },
      {
        "slug": "kokktilfirmaarrangement",
        "title": "Kokktilfirmaarrangement"
      },
      {
        "slug": "kokktilselskap",
        "title": "Kokktilselskap"
      },
      {
        "slug": "konditor",
        "title": "Konditor"
      },
      {
        "slug": "privatkokk",
        "title": "Privatkokk"
      },
      {
        "slug": "streetfoodkokk",
        "title": "Streetfoodkokk"
      },
      {
        "slug": "sushikokk",
        "title": "Sushikokk"
      },
      {
        "slug": "tapaskokk",
        "title": "Tapaskokk"
      },
      {
        "slug": "veganskokk",
        "title": "Veganskokk"
      },
      {
        "slug": "vegetariskkokk",
        "title": "Vegetariskkokk"
      }
    ]
  },
  {
    "slug": "kurs-og-opplaering",
    "title": "Kurs og opplæring",
    "subs": [
      {
        "slug": "excel-for-nybegynnere",
        "title": "Excel for nybegynnere"
      },
      {
        "slug": "matlagingskurs",
        "title": "Matlagingskurs"
      }
    ]
  },
  {
    "slug": "mat",
    "title": "Mat",
    "subs": [
      {
        "slug": "bryllupskaker",
        "title": "Bryllupskaker"
      },
      {
        "slug": "catering",
        "title": "Catering"
      },
      {
        "slug": "food-truck",
        "title": "Food Truck"
      },
      {
        "slug": "kakelaging",
        "title": "Kakelaging"
      },
      {
        "slug": "konditori",
        "title": "Konditori"
      },
      {
        "slug": "matlagingstimer",
        "title": "Matlagingstimer"
      },
      {
        "slug": "personlige-kokk",
        "title": "Personlige kokk"
      },
      {
        "slug": "sommelier",
        "title": "Sommelier"
      }
    ]
  },
  {
    "slug": "musikk",
    "title": "Musikk",
    "subs": [
      {
        "slug": "country",
        "title": "Country"
      },
      {
        "slug": "disco",
        "title": "Disco"
      },
      {
        "slug": "dubstep",
        "title": "Dubstep"
      },
      {
        "slug": "edm",
        "title": "EDM"
      },
      {
        "slug": "electronica",
        "title": "Electronica"
      },
      {
        "slug": "hardstyle",
        "title": "Hardstyle"
      },
      {
        "slug": "hiphop",
        "title": "Hiphop"
      },
      {
        "slug": "house",
        "title": "House"
      },
      {
        "slug": "klassikere",
        "title": "Klassikere"
      },
      {
        "slug": "lounge",
        "title": "Lounge"
      },
      {
        "slug": "musikk-for-barn",
        "title": "Musikk for barn"
      },
      {
        "slug": "pop",
        "title": "Pop"
      },
      {
        "slug": "sanger",
        "title": "Sanger"
      },
      {
        "slug": "trance",
        "title": "Trance"
      },
      {
        "slug": "trap",
        "title": "Trap"
      }
    ]
  },
  {
    "slug": "musikkundervisning",
    "title": "Musikkundervisning",
    "subs": [
      {
        "slug": "ballroom-dance-klasser",
        "title": "Ballroom Dance-klasser"
      },
      {
        "slug": "banjo-leksjoner",
        "title": "Banjo-leksjoner"
      },
      {
        "slug": "bassgitartimer",
        "title": "Bassgitartimer"
      },
      {
        "slug": "bratsjundervisning",
        "title": "Bratsjundervisning"
      },
      {
        "slug": "cellotimer",
        "title": "Cellotimer"
      },
      {
        "slug": "dansekoreografitimer",
        "title": "Dansekoreografitimer"
      },
      {
        "slug": "dansetimer",
        "title": "Dansetimer"
      },
      {
        "slug": "fagotttimer",
        "title": "Fagotttimer"
      },
      {
        "slug": "fele-leksjoner",
        "title": "Fele-leksjoner"
      },
      {
        "slug": "fiolintimer",
        "title": "Fiolintimer"
      },
      {
        "slug": "floytetimer",
        "title": "Fløytetimer"
      },
      {
        "slug": "fransk-horn",
        "title": "Fransk horn"
      },
      {
        "slug": "gitarlaerer",
        "title": "Gitarlærer"
      },
      {
        "slug": "gitartimer",
        "title": "Gitartimer"
      },
      {
        "slug": "harpetimer",
        "title": "Harpetimer"
      },
      {
        "slug": "hip-hop-dansekurs",
        "title": "Hip Hop-dansekurs"
      },
      {
        "slug": "klarinetttimer",
        "title": "Klarinetttimer"
      },
      {
        "slug": "komedietimer",
        "title": "Komedietimer"
      },
      {
        "slug": "kontrabasstimer",
        "title": "Kontrabasstimer"
      },
      {
        "slug": "magedanstimer",
        "title": "Magedanstimer"
      },
      {
        "slug": "mandolintimer",
        "title": "Mandolintimer"
      },
      {
        "slug": "munnspill-leksjoner",
        "title": "Munnspill-leksjoner"
      },
      {
        "slug": "musikkkomposisjonstimer",
        "title": "Musikkkomposisjonstimer"
      },
      {
        "slug": "musikkteoritimer",
        "title": "Musikkteoritimer"
      },
      {
        "slug": "musikktimer",
        "title": "Musikktimer"
      },
      {
        "slug": "obo-leksjoner",
        "title": "Obo-leksjoner"
      },
      {
        "slug": "pianolaerer",
        "title": "Pianolærer"
      },
      {
        "slug": "pianotimer",
        "title": "Pianotimer"
      },
      {
        "slug": "poledance-kurs",
        "title": "Poledance-kurs"
      },
      {
        "slug": "rap-musikktimer",
        "title": "Rap-musikktimer"
      },
      {
        "slug": "saksofonundervisning",
        "title": "Saksofonundervisning"
      },
      {
        "slug": "sangundervisning",
        "title": "Sangundervisning"
      },
      {
        "slug": "sekkepipetimer",
        "title": "Sekkepipetimer"
      },
      {
        "slug": "tango-dansetimer",
        "title": "Tango-dansetimer"
      },
      {
        "slug": "trekkspillundervisning",
        "title": "Trekkspillundervisning"
      },
      {
        "slug": "trombonetimer",
        "title": "Trombonetimer"
      },
      {
        "slug": "trommetimer",
        "title": "Trommetimer"
      },
      {
        "slug": "trompetundervisning",
        "title": "Trompetundervisning"
      },
      {
        "slug": "ukuleletimer",
        "title": "Ukuleletimer"
      }
    ]
  },
  {
    "slug": "personlig-trener",
    "title": "Personlig trener",
    "subs": [
      {
        "slug": "badminton",
        "title": "Badminton"
      },
      {
        "slug": "baseball",
        "title": "Baseball"
      },
      {
        "slug": "basketball",
        "title": "Basketball"
      },
      {
        "slug": "bordtennis",
        "title": "Bordtennis"
      },
      {
        "slug": "crossfit-trener",
        "title": "CrossFit-trener"
      },
      {
        "slug": "fekting",
        "title": "Fekting"
      },
      {
        "slug": "fotball",
        "title": "Fotball"
      },
      {
        "slug": "golf",
        "title": "Golf"
      },
      {
        "slug": "gymnastikk",
        "title": "Gymnastikk"
      },
      {
        "slug": "kajakk",
        "title": "Kajakk"
      },
      {
        "slug": "klatre",
        "title": "Klatre"
      },
      {
        "slug": "kondisjonstrener",
        "title": "Kondisjonstrener"
      },
      {
        "slug": "kostholdsveileder",
        "title": "Kostholdsveileder"
      },
      {
        "slug": "loping",
        "title": "Løping"
      },
      {
        "slug": "paragliding",
        "title": "Paragliding"
      },
      {
        "slug": "pilates",
        "title": "Pilates"
      },
      {
        "slug": "pilates-trener",
        "title": "Pilates-trener"
      },
      {
        "slug": "racketball",
        "title": "Racketball"
      },
      {
        "slug": "rehabiliteringstrener",
        "title": "Rehabiliteringstrener"
      },
      {
        "slug": "seiling",
        "title": "Seiling"
      },
      {
        "slug": "skateboard",
        "title": "Skateboard"
      },
      {
        "slug": "skikurs",
        "title": "Skikurs"
      },
      {
        "slug": "skoyting",
        "title": "Skøyting"
      },
      {
        "slug": "softball",
        "title": "Softball"
      },
      {
        "slug": "styrketreningsinstruktor",
        "title": "Styrketreningsinstruktør"
      },
      {
        "slug": "surfing",
        "title": "Surfing"
      },
      {
        "slug": "svomming",
        "title": "Svømming"
      },
      {
        "slug": "sykling",
        "title": "Sykling"
      },
      {
        "slug": "tennis",
        "title": "Tennis"
      },
      {
        "slug": "triatlon",
        "title": "Triatlon"
      },
      {
        "slug": "vannaerobic",
        "title": "Vannaerobic"
      },
      {
        "slug": "vannski",
        "title": "Vannski"
      },
      {
        "slug": "volleyball",
        "title": "Volleyball"
      },
      {
        "slug": "wakeboard",
        "title": "Wakeboard"
      },
      {
        "slug": "yoga",
        "title": "Yoga"
      },
      {
        "slug": "yoga-instruktor",
        "title": "Yoga-instruktør"
      }
    ]
  },
  {
    "slug": "privatundervisning",
    "title": "Privatundervisning",
    "subs": [
      {
        "slug": "engelsk",
        "title": "Engelsk"
      },
      {
        "slug": "fysikk",
        "title": "Fysikk"
      },
      {
        "slug": "kjemi",
        "title": "Kjemi"
      },
      {
        "slug": "matematikk",
        "title": "Matematikk"
      },
      {
        "slug": "naturfag",
        "title": "Naturfag"
      },
      {
        "slug": "norsk",
        "title": "Norsk"
      },
      {
        "slug": "tysk",
        "title": "Tysk"
      }
    ]
  },
  {
    "slug": "regnskap",
    "title": "Regnskap",
    "subs": [
      {
        "slug": "bokforing",
        "title": "Bokføring"
      },
      {
        "slug": "etablering-av-as",
        "title": "Etablering av AS"
      },
      {
        "slug": "etablering-av-enk",
        "title": "Etablering av ENK"
      },
      {
        "slug": "fakturering",
        "title": "Fakturering"
      },
      {
        "slug": "lonnskjoring",
        "title": "Lønnskjøring"
      },
      {
        "slug": "mvarapportering",
        "title": "MVArapportering"
      },
      {
        "slug": "regnskapsforing",
        "title": "Regnskapsføring"
      },
      {
        "slug": "regnskapsradgivning",
        "title": "Regnskapsrådgivning"
      },
      {
        "slug": "selvangivelse",
        "title": "Selvangivelse"
      },
      {
        "slug": "skatteradgivning",
        "title": "Skatterådgivning"
      },
      {
        "slug": "arsoppgjor",
        "title": "Årsoppgjør"
      }
    ]
  },
  {
    "slug": "renhold",
    "title": "Renhold og rengjøring",
    "subs": [
      {
        "slug": "avfallshandtering",
        "title": "Avfallshåndtering"
      },
      {
        "slug": "damprengjoring",
        "title": "Damprengjøring"
      },
      {
        "slug": "dyprengjoring",
        "title": "Dyprengjøring"
      },
      {
        "slug": "dypvasktjenester",
        "title": "Dypvasktjenester"
      },
      {
        "slug": "flyttevask",
        "title": "Flyttevask"
      },
      {
        "slug": "hagerydning",
        "title": "Hagerydning"
      },
      {
        "slug": "hopp-over-leie",
        "title": "Hopp over leie"
      },
      {
        "slug": "husrengjoring",
        "title": "Husrengjøring"
      },
      {
        "slug": "husrydding",
        "title": "Husrydding"
      },
      {
        "slug": "hoytrykksspyling",
        "title": "Høytrykksspyling"
      },
      {
        "slug": "kommersiell-og-kontor-dugg",
        "title": "Kommersiell og kontor dugg"
      },
      {
        "slug": "kommersiell-og-kontorrengjoring",
        "title": "Kommersiell og kontorrengjøring"
      },
      {
        "slug": "kontorrengjoring",
        "title": "Kontorrengjøring"
      },
      {
        "slug": "luktfjerning",
        "title": "Luktfjerning"
      },
      {
        "slug": "opprydding-av-eiendom-etter-bygging",
        "title": "Opprydding av eiendom etter bygging"
      },
      {
        "slug": "ovnsrengjoring",
        "title": "Ovnsrengjøring"
      },
      {
        "slug": "rengjoring-av-boblebad-og-spa",
        "title": "Rengjøring av boblebad og spa"
      },
      {
        "slug": "rengjoring-av-fliser-og-fuger",
        "title": "Rengjøring av fliser og fuger"
      },
      {
        "slug": "rengjoring-av-hjem",
        "title": "Rengjøring av hjem"
      },
      {
        "slug": "rengjoring-av-innkjorsel",
        "title": "Rengjøring av innkjørsel"
      },
      {
        "slug": "rengjoring-av-kanaler-og-ventiler",
        "title": "Rengjøring av kanaler og ventiler"
      },
      {
        "slug": "rengjoring-av-murstein-og-stein",
        "title": "Rengjøring av murstein og stein"
      },
      {
        "slug": "rengjoring-av-mobeltrekk-og-mobel",
        "title": "Rengjøring av møbeltrekk og møbel"
      },
      {
        "slug": "rengjoring-av-skorstein",
        "title": "Rengjøring av skorstein"
      },
      {
        "slug": "rengjoring-av-tepper-og-mobler",
        "title": "Rengjøring av tepper og møbler"
      },
      {
        "slug": "rengjoring-etter-bygging",
        "title": "Rengjøring etter bygging"
      },
      {
        "slug": "rensing-av-avlop-og-kloakk",
        "title": "Rensing av avløp og kloakk"
      },
      {
        "slug": "rensing-av-renne",
        "title": "Rensing av renne"
      },
      {
        "slug": "sluttrengjoring-av-leieforhold",
        "title": "Sluttrengjøring av leieforhold"
      },
      {
        "slug": "tepperensing",
        "title": "Tepperensing"
      },
      {
        "slug": "vindusvask",
        "title": "Vindusvask"
      },
      {
        "slug": "vindusvaskere",
        "title": "Vindusvaskere"
      }
    ]
  },
  {
    "slug": "smareparasjoner",
    "title": "Småreparasjoner",
    "subs": [
      {
        "slug": "ikea-garderobe",
        "title": "IKEA Garderobe"
      },
      {
        "slug": "ikea-montering",
        "title": "IKEA-montering"
      },
      {
        "slug": "opphenging-av-bilder-og-hyller",
        "title": "Opphenging av bilder og hyller"
      }
    ]
  },
  {
    "slug": "sprak",
    "title": "Språk",
    "subs": [
      {
        "slug": "arabisk",
        "title": "Arabisk"
      },
      {
        "slug": "dansk",
        "title": "Dansk"
      },
      {
        "slug": "engelsk",
        "title": "Engelsk"
      },
      {
        "slug": "farsi",
        "title": "Farsi"
      },
      {
        "slug": "fransk",
        "title": "Fransk"
      },
      {
        "slug": "gresk",
        "title": "Gresk"
      },
      {
        "slug": "hebraisk",
        "title": "Hebraisk"
      },
      {
        "slug": "hindi",
        "title": "Hindi"
      },
      {
        "slug": "indonesisk",
        "title": "Indonesisk"
      },
      {
        "slug": "italiensk",
        "title": "Italiensk"
      },
      {
        "slug": "japansk",
        "title": "Japansk"
      },
      {
        "slug": "kantonesisk",
        "title": "Kantonesisk"
      },
      {
        "slug": "kinesisk",
        "title": "Kinesisk"
      },
      {
        "slug": "koreansk",
        "title": "Koreansk"
      },
      {
        "slug": "latinsk",
        "title": "Latinsk"
      },
      {
        "slug": "mandarin",
        "title": "Mandarin"
      },
      {
        "slug": "medisinsk-transkripsjon",
        "title": "Medisinsk transkripsjon"
      },
      {
        "slug": "nederlandsk",
        "title": "Nederlandsk"
      },
      {
        "slug": "norsk",
        "title": "Norsk"
      },
      {
        "slug": "polsk",
        "title": "Polsk"
      },
      {
        "slug": "portugisisk",
        "title": "Portugisisk"
      },
      {
        "slug": "redigering",
        "title": "Redigering"
      },
      {
        "slug": "rumensk",
        "title": "Rumensk"
      },
      {
        "slug": "russisk",
        "title": "Russisk"
      },
      {
        "slug": "sanskrit",
        "title": "Sanskrit"
      },
      {
        "slug": "skandinavisk",
        "title": "Skandinavisk"
      },
      {
        "slug": "skrivetjenester",
        "title": "Skrivetjenester"
      },
      {
        "slug": "somalisk",
        "title": "Somalisk"
      },
      {
        "slug": "spansk",
        "title": "Spansk"
      },
      {
        "slug": "svensk",
        "title": "Svensk"
      },
      {
        "slug": "swahili",
        "title": "Swahili"
      },
      {
        "slug": "tagalog",
        "title": "Tagalog"
      },
      {
        "slug": "thai",
        "title": "Thai"
      },
      {
        "slug": "transkripsjonstjenester",
        "title": "Transkripsjonstjenester"
      },
      {
        "slug": "tsjekkisk",
        "title": "Tsjekkisk"
      },
      {
        "slug": "tyrkisk",
        "title": "Tyrkisk"
      },
      {
        "slug": "tysk",
        "title": "Tysk"
      },
      {
        "slug": "vietnamesisk",
        "title": "Vietnamesisk"
      },
      {
        "slug": "walisisk",
        "title": "Walisisk"
      }
    ]
  },
  {
    "slug": "stylist",
    "title": "Stylist",
    "subs": [
      {
        "slug": "brudestylist",
        "title": "Brudestylist"
      },
      {
        "slug": "extensions-spesialist",
        "title": "Extensions-spesialist"
      },
      {
        "slug": "fargespesialist",
        "title": "Fargespesialist"
      },
      {
        "slug": "makeup-artist",
        "title": "Makeup-artist"
      },
      {
        "slug": "neglestylist",
        "title": "Neglestylist"
      }
    ]
  },
  {
    "slug": "transport-og-bud",
    "title": "Transport og bud",
    "subs": [
      {
        "slug": "kjop-og-hent-tjenester",
        "title": "Kjøp og hent-tjenester"
      },
      {
        "slug": "levering-av-pakker",
        "title": "Levering av pakker"
      }
    ]
  },
  {
    "slug": "underholdning",
    "title": "Underholdning",
    "subs": [
      {
        "slug": "ansiktsmaling",
        "title": "Ansiktsmaling"
      },
      {
        "slug": "ballongkunstneri",
        "title": "Ballongkunstneri"
      },
      {
        "slug": "ballongtwister",
        "title": "Ballongtwister"
      },
      {
        "slug": "bobleblasing",
        "title": "Bobleblåsing"
      },
      {
        "slug": "danseunderholdning",
        "title": "Danseunderholdning"
      },
      {
        "slug": "dukketeater",
        "title": "Dukketeater"
      },
      {
        "slug": "eventunderholdning",
        "title": "Eventunderholdning"
      },
      {
        "slug": "fotoboks",
        "title": "Fotoboks"
      },
      {
        "slug": "fyrverkeri",
        "title": "Fyrverkeri"
      },
      {
        "slug": "hoppeslott",
        "title": "Hoppeslott"
      },
      {
        "slug": "klovneunderholdning",
        "title": "Klovneunderholdning"
      },
      {
        "slug": "komikere",
        "title": "Komikere"
      },
      {
        "slug": "kroppsmaling",
        "title": "Kroppsmaling"
      },
      {
        "slug": "lasershow",
        "title": "Lasershow"
      },
      {
        "slug": "magedans",
        "title": "Magedans"
      },
      {
        "slug": "mc-og-verter",
        "title": "MC og verter"
      },
      {
        "slug": "miming",
        "title": "Miming"
      },
      {
        "slug": "ponniridning",
        "title": "Ponniridning"
      },
      {
        "slug": "portrettkunstneri",
        "title": "Portrettkunstneri"
      },
      {
        "slug": "sirkusskuespill",
        "title": "Sirkusskuespill"
      },
      {
        "slug": "skuespiller",
        "title": "Skuespiller"
      },
      {
        "slug": "standupkomiker",
        "title": "Standupkomiker"
      },
      {
        "slug": "tatovor",
        "title": "Tatovør"
      },
      {
        "slug": "tryllekunstner",
        "title": "Tryllekunstner"
      },
      {
        "slug": "utleie-av-lokale",
        "title": "Utleie av lokale"
      }
    ]
  }
]

export function getCategoryBySlug(slug: string): TaxonomyCategory | undefined {
  return TAXONOMY.find((c) => c.slug === slug)
}

export function getSubcategory(
  categorySlug: string,
  subSlug: string,
): { category: TaxonomyCategory; sub: TaxonomySubcategory } | undefined {
  const category = getCategoryBySlug(categorySlug)
  if (!category) return undefined
  const sub = category.subs.find((s) => s.slug === subSlug)
  if (!sub) return undefined
  return { category, sub }
}

export const ALL_CATEGORY_SLUGS = TAXONOMY.map((c) => c.slug)

export function getAllSubcategoryParams(): { kategori: string; subkategori: string }[] {
  const out: { kategori: string; subkategori: string }[] = []
  for (const c of TAXONOMY) {
    for (const s of c.subs) {
      out.push({ kategori: c.slug, subkategori: s.slug })
    }
  }
  return out
}

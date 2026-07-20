// Catalogue de référence — Équipements du domaine minier
// Source : Document technique de référence, Conakry, Guinée — Juin 2026

export const CATALOGUE = {
  'Engins de terrassement': [
    {
      sousType: 'Bulldozers sur chenilles',
      fabricants: {
        'Caterpillar': ['Cat D11', 'Cat D10', 'Cat D9'],
        'Komatsu':     ['Komatsu D375A', 'Komatsu D475A', 'Komatsu D575A (Super Dozer)'],
        'Liebherr':    ['Liebherr PR 776'],
      },
    },
    {
      sousType: 'Chargeuses sur pneus',
      fabricants: {
        'Caterpillar': ['Cat 994K', 'Cat 993K', 'Cat 992'],
        'Komatsu':     ['Komatsu WA1200-6', 'Komatsu WA900-3'],
      },
    },
    {
      sousType: 'Niveleuses (graders)',
      fabricants: {
        'Caterpillar': ['Cat 24', 'Cat 18M3', 'Cat 16M3', 'Cat 140'],
        'Komatsu':     ['Komatsu GD955', 'Komatsu GD825A'],
        'John Deere':  ['John Deere 872G', 'John Deere 770G'],
      },
    },
    {
      sousType: 'Décapeuses / motorscrapers',
      fabricants: {
        'Caterpillar': ['Cat 657', 'Cat 637'],
        'Komatsu':     ['Komatsu WS23S (terrassement de masse)'],
      },
    },
  ],

  'Équipements miniers': [
    {
      sousType: 'Pelles hydrauliques minières (rétro / butte)',
      fabricants: {
        'Caterpillar': ['Cat 6090 FS', 'Cat 6060', 'Cat 6015B'],
        'Komatsu':     ['Komatsu PC9000-12', 'Komatsu PC8000-11', 'Komatsu PC7000-11', 'Komatsu PC5500'],
        'Hitachi':     ['Hitachi EX8000-7', 'Hitachi EX5600-7'],
        'Liebherr':    ['Liebherr R 9800', 'Liebherr R 996 B'],
      },
    },
    {
      sousType: 'Pelles électriques à câble (rope shovels)',
      fabricants: {
        'Caterpillar':   ['Cat 7495', 'Cat 7495 HF (ex-Bucyrus)'],
        'P&H (Komatsu)': ['P&H 4800XPC', 'P&H 4100XPC AC'],
      },
    },
    {
      sousType: 'Foreuses de production (blasthole)',
      fabricants: {
        'Epiroc':      ['Epiroc Pit Viper PV-271', 'Epiroc Pit Viper PV-275', 'Epiroc Pit Viper PV-291', 'Epiroc Pit Viper PV-351'],
        'Sandvik':     ['Sandvik DR461i', 'Sandvik D90KS'],
        'Caterpillar': ['Cat MD6250', 'Cat MD6310'],
      },
    },
    {
      sousType: 'Draglines (découverture)',
      fabricants: {
        'P&H (Komatsu)': ['P&H 9020XPC'],
        'Caterpillar':   ['Cat (anciennement Bucyrus)'],
      },
    },
    {
      sousType: 'Concassage & criblage',
      fabricants: {
        'Metso':          ['Metso Superior MKIII (gyrateur)', 'Metso C150 (mâchoires)', 'Metso HP500 (cône)'],
        'Sandvik':        ['Sandvik CG820 (gyrateur)', 'Sandvik CH895 (cône)'],
        'FLSmidth':       ['FLSmidth Fuller-Traylor (gyrateur)', 'FLSmidth SAG Mill Feeder'],
        'thyssenkrupp':   ['thyssenkrupp KB63-89 (gyrateur)', 'thyssenkrupp ERC (jaw gyratory)'],
        'Weir Minerals':  ['Weir Enduron (cône)', 'Weir Trio (mâchoires)'],
      },
    },
    {
      sousType: 'Manutention en continu (convoyeurs)',
      fabricants: {
        'FLSmidth':     ['FLSmidth Overland Conveyor', 'FLSmidth Transfer Conveyor'],
        'thyssenkrupp': ['thyssenkrupp Belt Conveyor', 'thyssenkrupp BELTIS'],
        'Continental':  ['Continental Conveyor Belt', 'Continental Overland Belt'],
        'Sempertrans':  ['Sempertrans Steel Cord Belt', 'Sempertrans Fabric Belt'],
      },
    },
  ],

  'Matériels ferroviaires': [
    {
      sousType: 'Locomotives diesel-électriques',
      fabricants: {
        'Wabtec (GE)':                ['Wabtec Evolution ES44AC', 'Wabtec Evolution ES43BBi'],
        'Progress Rail (EMD/CAT)':    ['EMD SD70ACe', 'EMD SD70ACe-BB', 'EMD GT42'],
        'CRRC':                       ['CRRC HXD1', 'CRRC HXD2', 'CRRC NJ2'],
      },
    },
    {
      sousType: 'Locomotives batterie-électriques',
      fabricants: {
        'Wabtec':         ['Wabtec FLXdrive Battery Locomotive'],
        'Progress Rail':  ['Progress Rail EMD Joule (BE14.5BB)'],
      },
    },
    {
      sousType: 'Wagons minéraliers (ore cars / trémies)',
      fabricants: {
        'Greenbrier':   ['Greenbrier Rotary Gondola', 'Greenbrier Ore Hopper'],
        'Trinity Rail': ['Trinity Rail Ore Hopper', 'Trinity Rail Gondola'],
        'CRRC':         ['CRRC Ore Hopper 100t', 'CRRC Rotary Dump Car'],
        'CIMC':         ['CIMC Ore Hopper', 'CIMC Rotary Dump Wagon'],
      },
    },
    {
      sousType: 'Engins de maintenance de la voie',
      fabricants: {
        'Plasser & Theurer': ['Plasser 09-3X (bourreuse)', 'Plasser DGS 62-N (stabilisateur)', 'Plasser RM80 (dégarnisseuse)'],
        'Harsco Rail':       ['Harsco RMS (régaleuse)', 'Harsco NTC (bourreuse)'],
        'Robel':             ['Robel 53.27 (draisine)', 'Robel 54.22 (groupe de travail)'],
      },
    },
  ],

  'Équipements portuaires': [
    {
      sousType: 'Chargeurs de navires (shiploaders)',
      fabricants: {
        'thyssenkrupp': ['thyssenkrupp Radial Shiploader', 'thyssenkrupp Linear Shiploader'],
        'FLSmidth':     ['FLSmidth Radial Shiploader', 'FLSmidth Fixed Shiploader'],
        'Metso':        ['Metso Outotec Shiploader'],
        'Bedeschi':     ['Bedeschi Rail-Mounted Shiploader', 'Bedeschi Mobile Shiploader'],
      },
    },
    {
      sousType: 'Gerbeurs & roues-pelles (stackers / reclaimers)',
      fabricants: {
        'thyssenkrupp': ['thyssenkrupp Stacker', 'thyssenkrupp Reclaimer', 'thyssenkrupp Stacker-Reclaimer'],
        'Sandvik':      ['Sandvik Stacker', 'Sandvik Bucket Wheel Reclaimer'],
        'FLSmidth':     ['FLSmidth Stacker-Reclaimer', 'FLSmidth Portal Scraper'],
        'Bedeschi':     ['Bedeschi Stacker', 'Bedeschi Stacker-Reclaimer'],
      },
    },
    {
      sousType: 'Culbuteurs / dumpers rotatifs (wagon tipplers)',
      fabricants: {
        'FLSmidth':     ['FLSmidth Rotary Car Dumper (simple)', 'FLSmidth Rotary Car Dumper (double)'],
        'thyssenkrupp': ['thyssenkrupp Rotary Wagon Tippler'],
      },
    },
    {
      sousType: 'Grues portuaires (STS / mobiles)',
      fabricants: {
        'Liebherr':   ['Liebherr LHM 420', 'Liebherr LHM 550', 'Liebherr LHM 600'],
        'Konecranes': ['Konecranes RTG', 'Konecranes STS'],
        'Kalmar':     ['Kalmar RTG', 'Kalmar Reachstacker'],
        'SANY':       ['SANY SCQ series', 'SANY Mobile Harbour Crane'],
      },
    },
    {
      sousType: 'Barges & navires de transbordement',
      fabricants: {
        'Constructeurs navals spécialisés': ['Barge fluvio-maritime (minerai)', 'Navire de transbordement (transhipment vessel)', 'Barge de service portuaire'],
      },
    },
  ],

  'Centrales à béton': [
    {
      sousType: 'Centrales fixes (stationnaires)',
      fabricants: {
        'Liebherr':       ['Liebherr Betomix 2.25', 'Liebherr Betomix 3.0', 'Liebherr Betomat'],
        'Schwing Stetter':['Schwing Stetter CP30', 'Schwing Stetter CP60', 'Schwing Stetter CP90', 'Schwing Stetter CP120'],
        'MEKA':           ['MEKA MB-30', 'MEKA MB-60', 'MEKA MB-100'],
        'Elkon':          ['Elkon Quick Master 30', 'Elkon Quick Master 60', 'Elkon Compact Master'],
        'SANY':           ['SANY HZS60', 'SANY HZS90', 'SANY HZS180'],
        'Zoomlion':       ['Zoomlion HBS60V', 'Zoomlion HBS90V'],
      },
    },
    {
      sousType: 'Centrales mobiles / compactes',
      fabricants: {
        'Liebherr':   ['Liebherr Mobilmix 2.5', 'Liebherr Mobilmix 3.5'],
        'MEKA':       ['MEKA MB-30M (mobile)', 'MEKA MB-60M (mobile)'],
        'Elkon':      ['Elkon Mobile Master 60', 'Elkon Compact Master M'],
        'Constmach':  ['Constmach Mobile 60', 'Constmach Mobile 100'],
      },
    },
    {
      sousType: 'Camions-malaxeurs (toupies)',
      fabricants: {
        'Schwing Stetter': ['Schwing Stetter AM 7C', 'Schwing Stetter AM 9 FHC'],
        'Putzmeister':     ['Putzmeister PM 7 m³', 'Putzmeister PM 9 m³'],
        'SANY':            ['SANY SY308C-6', 'SANY SY408C-8'],
        'CIFA':            ['CIFA SL 7', 'CIFA Energya E9'],
      },
    },
    {
      sousType: 'Pompes à béton',
      fabricants: {
        'Schwing Stetter': ['Schwing S 28 SX', 'Schwing S 43 SX', 'Schwing S 52 SX'],
        'Putzmeister':     ['Putzmeister M38-5', 'Putzmeister M52-6'],
        'SANY':            ['SANY SYG5311THB 47C-8', 'SANY SYG5441THB 56'],
        'CIFA':            ['CIFA K37L', 'CIFA K47L'],
      },
    },
  ],

  'Grues': [
    {
      sousType: 'Grues mobiles tout-terrain',
      fabricants: {
        'Liebherr':  ['Liebherr LTM 1100-5.2', 'Liebherr LTM 1300-6.2', 'Liebherr LTM 1500-8.1'],
        'Grove':     ['Grove GMK5150L', 'Grove GMK6300L', 'Grove GMK7550'],
        'Tadano':    ['Tadano ATF 100G-4', 'Tadano ATF 220G-5', 'Tadano GTK1100'],
        'XCMG':      ['XCMG QY100K', 'XCMG QY130K', 'XCMG QY300K'],
        'SANY':      ['SANY SAC2200T', 'SANY SAC6000', 'SANY SCC4000A'],
        'Zoomlion':  ['Zoomlion QAY100', 'Zoomlion QAY300', 'Zoomlion QAY650'],
      },
    },
    {
      sousType: 'Grues sur chenilles (heavy lift)',
      fabricants: {
        'Liebherr':  ['Liebherr LR 1300', 'Liebherr LR 1600/2', 'Liebherr LR 11000'],
        'Manitowoc': ['Manitowoc 16000', 'Manitowoc 21000', 'Manitowoc 31000'],
        'SANY':      ['SANY SCC4000A', 'SANY SCC8500A', 'SANY SCC16000A'],
        'XCMG':      ['XCMG XGC88000', 'XCMG XGC28000', 'XCMG XGC12000'],
      },
    },
    {
      sousType: 'Grues à tour (construction)',
      fabricants: {
        'Liebherr':         ['Liebherr 81 K.1', 'Liebherr 130 EC-B 6', 'Liebherr 200 EC-B 10'],
        'Potain (Manitowoc)':['Potain MDT 189', 'Potain MCT 385', 'Potain MCR 700'],
        'Zoomlion':         ['Zoomlion TC5516', 'Zoomlion TC7520', 'Zoomlion ZTT8040'],
      },
    },
  ],

  'Compacteurs': [
    {
      sousType: 'Rouleaux monobille vibrants',
      fabricants: {
        'Caterpillar': ['Cat CS54B', 'Cat CS56B', 'Cat CP56B'],
        'Hamm':        ['Hamm HD+ 140i VV', 'Hamm H 25i', 'Hamm 3307P'],
        'Bomag':       ['Bomag BW 213 D-5', 'Bomag BW 226 D-5', 'Bomag BW 900'],
        'Dynapac':     ['Dynapac CA3500D', 'Dynapac CA6000D'],
        'Sakai':       ['Sakai SV540D', 'Sakai SW850'],
        'XCMG':        ['XCMG XS262J', 'XCMG XS303J'],
      },
    },
    {
      sousType: 'Compacteurs à pieds dameurs (padfoot)',
      fabricants: {
        'Caterpillar': ['Cat CP56B', 'Cat CP74B'],
        'Bomag':       ['Bomag BW 213 PD-5', 'Bomag BW 226 PD-5'],
        'Hamm':        ['Hamm HD+ 140 PD', 'Hamm H 25i P'],
      },
    },
    {
      sousType: 'Compacteurs à pneus',
      fabricants: {
        'Caterpillar': ['Cat CW34', 'Cat CW16'],
        'Bomag':       ['Bomag BW 24 R', 'Bomag BW 27 RH'],
        'Dynapac':     ['Dynapac CP274', 'Dynapac CP374'],
      },
    },
  ],

  'Camions': [
    {
      sousType: 'Tombereaux rigides miniers (haul trucks)',
      fabricants: {
        'Caterpillar': ['Cat 789D (195 t)', 'Cat 793F (227 t)', 'Cat 797F (363 t)', 'Cat 798 AC (372 t)'],
        'Komatsu':     ['Komatsu 830E (186 t)', 'Komatsu 930E (291 t)', 'Komatsu 960E (327 t)', 'Komatsu 980E-5 (363 t)'],
        'Liebherr':    ['Liebherr T 282 C (363 t)', 'Liebherr T 284 (363 t)'],
        'BelAZ':       ['BelAZ 75710 (450 t)', 'BelAZ 75306 (220 t)', 'BelAZ 75601 (320 t)'],
        'Hitachi':     ['Hitachi EH5000AC-3 (296 t)', 'Hitachi EH4000AC-3 (220 t)'],
        'XCMG':        ['XCMG XDE360 (363 t)', 'XCMG XDE400 (400 t)'],
      },
    },
    {
      sousType: 'Tombereaux articulés (ADT)',
      fabricants: {
        'Caterpillar': ['Cat 745 (41 t)', 'Cat 730C2 EJ (28 t)'],
        'Volvo':       ['Volvo A45G (41 t)', 'Volvo A60H (55 t)'],
        'Bell':        ['Bell B45E (41 t)', 'Bell B60E (55 t)'],
        'Komatsu':     ['Komatsu HM400-5 (40 t)', 'Komatsu HM300-5 (30 t)'],
      },
    },
    {
      sousType: 'Camions porteurs routiers (logistique)',
      fabricants: {
        'Mercedes-Benz':  ['Mercedes Actros 3363', 'Mercedes Arocs 4163'],
        'Scania':         ['Scania G450', 'Scania R500', 'Scania R650'],
        'Volvo':          ['Volvo FMX 540', 'Volvo FH 500'],
        'MAN':            ['MAN TGS 35.480', 'MAN TGX 18.640'],
        'Sinotruk':       ['Sinotruk HOWO 6x4', 'Sinotruk HOWO-T7H'],
        'Renault Trucks': ['Renault Trucks C 520', 'Renault Trucks T 520'],
      },
    },
    {
      sousType: 'Camions-citernes & arroseuses',
      fabricants: {
        'Caterpillar': ['Cat 777 Water Truck (95 000 L)', 'Cat 785 Water Truck (135 000 L)'],
        'Komatsu':     ['Komatsu HD785 Water Truck (90 000 L)'],
      },
    },
  ],

  'Véhicules spécialisés': [
    {
      sousType: 'Arroseuses anti-poussière (water trucks)',
      fabricants: {
        'Caterpillar':      ['Cat 777 Water Truck', 'Cat 785 Water Truck'],
        'Komatsu':          ['Komatsu HD785 Water Truck'],
        'Mercedes / Scania': ['Citerne sur châssis Mercedes Arocs', 'Citerne sur châssis Scania R'],
      },
    },
    {
      sousType: 'Ravitailleurs carburant & graissage (fuel & lube)',
      fabricants: {
        'Caterpillar': ['Cat Fuel & Lube Truck (châssis 777)'],
        'Komatsu':     ['Komatsu Fuel & Lube (châssis HD785)'],
        'Multimarques': ['Camion fuel & lube sur châssis routier (Mercedes/Volvo)'],
      },
    },
    {
      sousType: 'Porte-engins surbaissés (heavy haulage)',
      fabricants: {
        'Faymonville':  ['Faymonville MAX Trailer', 'Faymonville Multimax'],
        'Goldhofer':    ['Goldhofer STZ-VL 4', 'Goldhofer SPMT (modules automoteurs)'],
        'Nooteboom':    ['Nooteboom OSD (lowboy)', 'Nooteboom MCOS (extensible)'],
      },
    },
    {
      sousType: 'Véhicules légers (light vehicles)',
      fabricants: {
        'Toyota': ['Toyota Land Cruiser 79', 'Toyota Land Cruiser 200', 'Toyota Hilux'],
        'Ford':   ['Ford Ranger 4x4', 'Ford Everest'],
        'Nissan': ['Nissan Patrol Y62', 'Nissan Navara'],
      },
    },
    {
      sousType: 'Transport du personnel & secours',
      fabricants: {
        'Toyota':      ['Toyota Coaster (minibus)', 'Toyota Hiace (navette)'],
        'Multimarques': ['Bus de personnel (Mercedes Sprinter / Iveco Daily)', 'Ambulance minière', 'Véhicule anti-incendie'],
      },
    },
    {
      sousType: 'Engins de service & dépannage',
      fabricants: {
        'Multimarques': ['Dépanneuse lourde (camion grue)', 'Chariot élévateur (5-50 t)', 'Nacelle élévatrice (18-50 m)', 'Camion-grue de service'],
      },
    },
  ],
}

// Helpers
export const CATEGORIES_LIST = Object.keys(CATALOGUE)

export function getSousTypes(categorie) {
  if (!categorie || !CATALOGUE[categorie]) return []
  return CATALOGUE[categorie].map(e => e.sousType)
}

export function getFabricants(categorie, sousType) {
  if (!categorie || !sousType) return []
  const entry = CATALOGUE[categorie]?.find(e => e.sousType === sousType)
  return entry ? Object.keys(entry.fabricants) : []
}

export function getModeles(categorie, sousType, fabricant) {
  if (!categorie || !sousType || !fabricant) return []
  const entry = CATALOGUE[categorie]?.find(e => e.sousType === sousType)
  return entry?.fabricants[fabricant] || []
}

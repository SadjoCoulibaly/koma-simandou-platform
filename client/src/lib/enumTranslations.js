// Mappings valeur DB (français) → clé i18n
// Utilisé avec tEnum(t, MAP, valeur) pour afficher les valeurs enum traduites

export const SECTEURS_ENT = {
  'Mines & Extraction':      'enums.secteurs.mines',
  'BTP & Génie Civil':       'enums.secteurs.btp',
  'Transport & Logistique':  'enums.secteurs.transport',
  'Énergie':                 'enums.secteurs.energie',
  'Eau & Assainissement':    'enums.secteurs.eau',
  'Industrie & Manufacture': 'enums.secteurs.industrie',
  'Agriculture':             'enums.secteurs.agriculture',
  'Services & Conseil':      'enums.secteurs.services',
  'Technologies':            'enums.secteurs.technologies',
  'Autre':                   'enums.autre',
}

export const SECTEURS_PROJ_PUBLICS = {
  'Infrastructures':      'enums.secteursProjets.infrastructures',
  'Énergie':              'enums.secteursProjets.energie',
  'Eau & assainissement': 'enums.secteursProjets.eau',
  'Santé':                'enums.secteursProjets.sante',
  'Éducation':            'enums.secteursProjets.education',
  'Habitat':              'enums.secteursProjets.habitat',
  'Agriculture':          'enums.secteursProjets.agriculture',
}

export const CATEGORIES_EQ = {
  // Catégories générales
  'Engins de terrassement': 'enums.categoriesEq.terrassement',
  'Équipements miniers':    'enums.categoriesEq.miniers',
  'Matériels ferroviaires': 'enums.categoriesEq.ferroviaires',
  'Équipements portuaires': 'enums.categoriesEq.portuaires',
  'Centrales à béton':      'enums.categoriesEq.beton',
  'Grues':                  'enums.categoriesEq.grues',
  'Compacteurs':            'enums.categoriesEq.compacteurs',
  'Camions':                'enums.categoriesEq.camions',
  'Véhicules spécialisés':  'enums.categoriesEq.vehicules',
  // Terrassement & excavation
  'Chargeuse':              'Chargeuse',
  'Bulldozer':              'Bulldozer',
  'Bulldozer SD32W':        'Bulldozer SD32W',
  'Bulldozer sur chenilles':'Bulldozer sur chenilles',
  'Bulldozer sur chenilles SEM822D': 'Bulldozer sur chenilles SEM822D',
  'Pelle excavatrice':      'Pelle excavatrice',
  'Pelle excavatrice SANY': 'Pelle excavatrice SANY',
  'Pelle excavatrice 365 (SY365)': 'Pelle excavatrice 365 (SY365)',
  'Pelle excavatrice SY500':'Pelle excavatrice SY500',
  'Pelle sur chenilles':    'Pelle sur chenilles',
  'Niveleuse':              'Niveleuse',
  'Tractopelle (chargeuse-pelleteuse)': 'Tractopelle (chargeuse-pelleteuse)',
  // Grue & levage
  'Grue automobile':        'Grue automobile',
  'Grue mobile (camion-grue)': 'Grue mobile (camion-grue)',
  'Grue 25T':               'Grue 25T',
  'Grue 50T':               'Grue 50T',
  'Grue auxiliaire sur camion 5T': 'Grue auxiliaire sur camion 5T',
  'Nacelle élévatrice':     'Nacelle élévatrice',
  'Plateforme élévatrice mobile de travail': 'Plateforme élévatrice mobile de travail',
  'Chariot élévateur':      'Chariot élévateur',
  'Chariot élévateur 3T':   'Chariot élévateur 3T',
  'Chariot élévateur 5T':   'Chariot élévateur 5T',
  // Compactage & finition
  'Rouleau compresseur':    'Rouleau compresseur',
  'Rouleau compresseur SANY': 'Rouleau compresseur SANY',
  'Rouleau compresseur monocylindre': 'Rouleau compresseur monocylindre',
  'Rouleau vibrant monocylindre': 'Rouleau vibrant monocylindre',
  "Finisseur (épandeuse d'enrobé)": "Finisseur (épandeuse d'enrobé)",
  // Béton
  'Camion malaxeur à béton': 'Camion malaxeur à béton',
  'Camion malaxeur à béton (toupie)': 'Camion malaxeur à béton (toupie)',
  'Camion pompe à béton':   'Camion pompe à béton',
  'Camion pompe':           'Camion pompe',
  'Machine à béton projeté (voie humide)': 'Machine à béton projeté (voie humide)',
  // Forage
  'Foreuse':                'Foreuse',
  "Foreuse de puits d'eau": "Foreuse de puits d'eau",
  'Foreuse fond-de-trou hydraulique intégrée': 'Foreuse fond-de-trou hydraulique intégrée',
  'Foreuse multifonction':  'Foreuse multifonction',
  'Foreuse rotative':       'Foreuse rotative',
  // Camions & semi-remorques
  'Camion-benne':           'Camion-benne',
  'Camion HOWO':            'Camion HOWO',
  'Camion de marchandises': 'Camion de marchandises',
  'Camion léger de marchandises': 'Camion léger de marchandises',
  'Camion léger Foton':     'Camion léger Foton',
  'Camion fourgon':         'Camion fourgon',
  'Camion frigorifique':    'Camion frigorifique',
  'Camion hydrocureur':     'Camion hydrocureur',
  'Camion de transport de poutres de pont': 'Camion de transport de poutres de pont',
  'Camion de transport avec grue auxiliaire': 'Camion de transport avec grue auxiliaire',
  'Camion de transport avec grue auxiliaire 10T': 'Camion de transport avec grue auxiliaire 10T',
  'Semi-remorque (plateau)':'Semi-remorque (plateau)',
  'Semi-remorque (plateau) 50T': 'Semi-remorque (plateau) 50T',
  'Semi-remorque plateau':  'Semi-remorque plateau',
  'Semi-remorque 30T':      'Semi-remorque 30T',
  'Semi-remorque 50T':      'Semi-remorque 50T',
  "Semi-remorque pour longs rails d'acier": "Semi-remorque pour longs rails d'acier",
  'Semi-remorque surbaissée':'Semi-remorque surbaissée',
  'Tracteur routier (tête)':'Tracteur routier (tête)',
  'Tracteur routier 30T':   'Tracteur routier 30T',
  'Tracteur routier 50T':   'Tracteur routier 50T',
  // Citernes
  'Camion-citerne à carburant': 'Camion-citerne à carburant',
  'Camion-citerne à eau (arroseuse)': 'Camion-citerne à eau (arroseuse)',
  // Véhicules légers & passagers
  'Pick-up':                'Pick-up',
  'Pick-up Toyota':         'Pick-up Toyota',
  'Pick-up (cabine simple)':'Pick-up (cabine simple)',
  'Pick-up (Alcoa)':        'Pick-up (Alcoa)',
  'TOYOTA LAND \nCRUISER(PICK UP)': 'TOYOTA LAND CRUISER(PICK UP)',
  'TOYOTA LAND CRUISER(PICK UP)': 'TOYOTA LAND CRUISER(PICK UP)',
  'Toyota Prado':           'Toyota Prado',
  'Toyota Prado (blanc)':   'Toyota Prado (blanc)',
  'Toyota Prado (noir)':    'Toyota Prado (noir)',
  'Toyota Prado / Land Cruiser': 'Toyota Prado / Land Cruiser',
  'Minibus':                'Minibus',
  'Minibus (moyen)':        'Minibus (moyen)',
  'Minibus (Alcoa)':        'Minibus (Alcoa)',
  'Minibus (Capitale)':     'Minibus (Capitale)',
  'Minibus (Tunnel)':       'Minibus (Tunnel)',
  'BUS YUTONG D7':          'BUS YUTONG D7',
  'Ambulance':              'Ambulance',
  'Autre':                  'enums.autre',
}

export const CATEGORIES_PROJ_PRIVES = {
  'Minier':      'enums.categoriesProjets.minier',
  'Industriel':  'enums.categoriesProjets.industriel',
  'Énergétique': 'enums.categoriesProjets.energetique',
  'Logistique':  'enums.categoriesProjets.logistique',
  'Immobilier':  'enums.categoriesProjets.immobilier',
  'Agricole':    'enums.categoriesProjets.agricole',
}

export const ETATS_EQ = {
  'neuf':         'enums.etats.neuf',
  'bon':          'enums.etats.bon',
  'moyen':        'enums.etats.moyen',
  'hors_service': 'enums.etats.hors_service',
}

export const TYPES_COMPTE = {
  'Particulier':                        'enums.typesCompte.particulier',
  'Entreprise nationale':               'enums.typesCompte.entreprise_nationale',
  'Entreprise internationale':          'enums.typesCompte.entreprise_internationale',
  'Sous-traitant':                      'enums.typesCompte.sous_traitant',
  "Bureau d'études":                    'enums.typesCompte.bureau_etudes',
  'Fournisseur':                        'enums.typesCompte.fournisseur',
  "Société de location d'équipements":  'enums.typesCompte.societe_location',
  "Projet sectoriel de l'État":         'enums.typesCompte.projet_etat',
  'Projet du secteur privé':            'enums.typesCompte.projet_prive',
}

export const TYPES_PARTICIPANT = {
  'Opérateur économique':             'enums.typesParticipant.operateur',
  "Représentant de l'État":           'enums.typesParticipant.etat',
  'Partenaire technique & financier': 'enums.typesParticipant.partenaire',
  'Société civile':                   'enums.typesParticipant.societe_civile',
  'Presse & Médias':                  'enums.typesParticipant.presse',
  'Autre':                            'enums.typesParticipant.autre',
}

// Traduit une valeur enum — fallback sur la valeur brute si clé manquante
export function tEnum(t, map, value) {
  if (!value) return '—'
  const key = map[value]
  return key ? t(key, { defaultValue: value }) : value
}

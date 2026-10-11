/*
 * Données normatives extraites du RCG 07-031 (codification administrative au 23 décembre 2025).
 * Source : docs/extraction_RCG_07-031.md — chaque valeur porte sa référence.
 * Ne rien ajouter ici qui ne soit pas tiré du PDF ; sinon marquer aConfirmer: true.
 */
(function (root) {
  'use strict';

  var REGLEMENT = 'RCG 07-031 (codification au 23 décembre 2025)';

  // Annexe H, tableau 1.2 — appareils courants (USGPM par unité).
  var TABLEAU_12 = [
    { id: 'baignoire', libelle: 'Baignoire', unite: 8 },
    { id: 'bidet', libelle: 'Bidet', unite: 2 },
    { id: 'douche_1', libelle: 'Douche avec 1 seul pommeau', unite: 2.2,
      note: 'Si la douche est dans la baignoire, ne rien inscrire pour la douche.' },
    { id: 'douche_n', libelle: "Douche avec plus d'un pommeau", unite: 10 },
    { id: 'evier_res', libelle: 'Évier de cuisine, résidentiel', unite: 2.2 },
    { id: 'evier_com', libelle: 'Évier de cuisine, commercial ou de service', unite: 4 },
    { id: 'fontaine', libelle: 'Fontaine à boire', unite: 1 },
    { id: 'lavabo', libelle: 'Lavabo', unite: 1.5 },
    { id: 'lv_res', libelle: 'Lave-vaisselle résidentiel', unite: 2 },
    { id: 'lv_com', libelle: 'Lave-vaisselle commercial, lave-verre', unite: 3 },
    { id: 'laveuse', libelle: 'Machine à laver domestique ou commerciale', unite: 6 },
    { id: 'wc_reservoir', libelle: 'Toilette à réservoir de chasse', unite: 4 },
    { id: 'wc_soupape', libelle: 'Toilette à soupape de chasse (sans réservoir)', unite: 35, declencheCas1: true },
    { id: 'urinoir_reservoir', libelle: 'Urinoir à réservoir de chasse', unite: 4 },
    { id: 'urinoir_soupape', libelle: 'Urinoir à soupape de chasse (sans réservoir)', unite: 10, declencheCas1: true }
  ];

  var NOTE_2H = "N'inscrire que ceux qui sont utilisés plus de 2 heures par mois.";
  var BOYAUX = [['3/8', 3], ['1/2', 5], ['5/8', 9], ['3/4', 12], ['1', 20], ['1 1/4', 30], ['1 1/2', 45], ['2', 75], ['3', 200]];
  var ROBINETS_EXT = [['3/8', 4], ['1/2', 5], ['5/8', 12], ['3/4', 16], ['1', 27], ['1 1/4', 40], ['1 1/2', 60], ['2', 100], ['3', 260]];
  BOYAUX.forEach(function (b) {
    TABLEAU_12.push({ id: 'boyau_' + b[0].replace(/[ /]/g, '_'), libelle: 'Boyau de nettoyage ' + b[0] + ' po', unite: b[1], groupe: 'Boyaux de nettoyage', note: NOTE_2H });
  });
  ROBINETS_EXT.forEach(function (r) {
    TABLEAU_12.push({ id: 'robext_' + r[0].replace(/[ /]/g, '_'), libelle: 'Robinet extérieur ' + r[0] + ' po', unite: r[1], groupe: 'Robinets extérieurs', note: NOTE_2H });
  });

  // Annexe H, tableau 1.3 — autres appareils.
  // saisie 'quantite' : contribution = quantité × unité ; saisie 'debit' : l'usager inscrit le débit total (USGPM).
  var TABLEAU_13 = [
    { id: 'frigo_eau', libelle: "Réfrigérateurs ou congélateurs refroidis à l'eau", unite: 0.84, quantiteEn: 'HP du compresseur' },
    { id: 'clim_hydro', libelle: 'Climatiseur hydro-réfrigéré', unite: 1, quantiteEn: 'tonnes de climatisation' },
    { id: 'compresseur_air', libelle: "Compresseur à air refroidi à l'eau", unite: 0.2, quantiteEn: 'HP du compresseur' },
    { id: 'irrigation', libelle: "Système d'irrigation ou d'arrosage extérieur", saisie: 'debit',
      note: "S'il est en fonction pendant la période de haute consommation du reste du bâtiment, inscrire le débit d'eau max. total (USGPM). Sinon, ne rien inscrire." },
    { id: 'tour_evap', libelle: 'Tour évaporatrice', unite: 0.09, quantiteEn: 'tonnes de climatisation (total)' },
    { id: 'lave_auto_man', libelle: 'Lave-auto manuel', unite: 4, quantiteEn: 'stations de lavage' },
    { id: 'lave_auto_auto', libelle: 'Lave-auto automatique', unite: 32, quantiteEn: 'stations (tunnel = 2 stations)' },
    { id: 'autre', libelle: 'Autre (description)', saisie: 'debit',
      note: "Inscrire le débit d'eau maximal total des appareils (USGPM)." }
  ];
  [['3/8', 5], ['1/2', 11], ['5/8', 12], ['3/4', 16], ['1', 27], ['1 1/4', 41], ['1 1/2', 57], ['2', 99], ['3', 260]].forEach(function (p) {
    TABLEAU_13.push({ id: 'piscine_' + p[0].replace(/[ /]/g, '_'), libelle: 'Piscine, pataugeoire, fontaine décorative — alimentation ' + p[0] + ' po', unite: p[1], groupe: 'Piscines, pataugeoires, fontaines' });
  });
  [['3/8', 5], ['1/2', 11], ['5/8', 12], ['3/4', 16], ['1', 27], ['1 1/4', 41], ['1 1/2', 57], ['2', 99], ['3', 260], ['4', 444], ['6', 989], ['8', 1698], ['10', 2658]].forEach(function (m) {
    TABLEAU_13.push({ id: 'laveuse_ind_' + m[0].replace(/[ /]/g, '_'), libelle: 'Machine à laver industrielle — alimentation ' + m[0] + ' po', unite: m[1], groupe: 'Machines à laver industrielles' });
  });

  // Annexe I.
  var ANNEXE_I = {
    // Demande de pointe de référence : « 2,3 m³/h (10 gal US) ».
    seuilUSGPM: 10,
    seuilImprimeM3h: 2.3,
    conversionM3hParUSGPM: 0.227, // Annexe I étape 5 ; Annexe H : 1 USGPM = 0,227 m³/h
    pressionTheoriqueKPa: 414,
    reference: 'AWWA M22, 2e édition (méthode des demandes de pointe par appareil)',
    usagesCas1: ['salle de spectacle', 'théâtre', 'cinéma', 'école', 'stade', 'centre sportif', 'aréna', 'hôtel', 'motel'],
    cas1: [
      { plage: '0 < Q12 < 45', min: 0, minInclus: false, max: 45, maxInclus: false, formule: 'Q12P = Q12',
        f: function (q) { return q; } },
      { plage: '45 ≤ Q12 ≤ 1 250', min: 45, minInclus: true, max: 1250, maxInclus: true,
        formule: 'Q12P = (−3×10⁻⁵ × Q12²) + (0,115 × Q12) + 39,145',
        f: function (q) { return -3e-5 * q * q + 0.115 * q + 39.145; } },
      { plage: '1 250 < Q12 ≤ 13 000', min: 1250, minInclus: false, max: 13000, maxInclus: true,
        formule: 'Q12P = (−3×10⁻⁷ × Q12²) + (0,0114 × Q12) + 120,8',
        f: function (q) { return -3e-7 * q * q + 0.0114 * q + 120.8; } },
      { plage: 'Q12 > 13 000', min: 13000, minInclus: false, max: Infinity, maxInclus: false,
        formule: 'Q12P = ((Q12 − 3000) × 68/10000) + 153',
        f: function (q) { return (q - 3000) * 68 / 10000 + 153; } }
    ],
    cas2: [
      { plage: '0 < Q12 < 25', min: 0, minInclus: false, max: 25, maxInclus: false,
        formule: 'Q12P = (−0,0103 × Q12²) + (0,9846 × Q12) − 0,18',
        f: function (q) { return -0.0103 * q * q + 0.9846 * q - 0.18; } },
      { plage: '25 ≤ Q12 ≤ 1 250', min: 25, minInclus: true, max: 1250, maxInclus: true,
        formule: 'Q12P = (−3×10⁻⁵ × Q12²) + (0,0748 × Q12) + 16,19',
        f: function (q) { return -3e-5 * q * q + 0.0748 * q + 16.19; } },
      { plage: 'Q12 > 1 250', min: 1250, minInclus: false, max: Infinity, maxInclus: false,
        formule: 'Q12P = (−2×10⁻⁸ × Q12²) + (0,007 × Q12) + 56,204',
        f: function (q) { return -2e-8 * q * q + 0.007 * q + 56.204; } }
    ]
  };


  // Annexe B — tableaux des dimensions (mm). Croquis 001 : 20 à 50 mm ; 002 : 50 à 150 mm ; 003 : 200 à 300 mm.
  var ANNEXE_B = {
    croquis001: {
      titre: 'Croquis 001 — préparation de tuyauterie 20 mm (3/4 po) à 50 mm (2 po), révision 12',
      lignes: [
        { d: 20, po: '3/4', transition: 229, transitionPo: '9', raccordTransition: 'Fileté 1 po mâle', raccord: 'Union de compteur 20 mm (3/4 po)', A: 300, B: 100, C: 100, D: 100 },
        { d: 25, po: '1', transition: 273, transitionPo: '10 3/4', raccordTransition: 'Fileté 1 1/4 po mâle', raccord: 'Union de compteur 25 mm (1 po)', A: 300, B: 100, C: 125, D: 125 },
        { d: 40, po: '1 1/2', transition: 330, transitionPo: '13', raccordTransition: 'Bride ovale 2 boulons', raccord: 'Bride ovale 2 boulons', A: 400, B: 150, C: 150, D: 150 },
        { d: 50, po: '2', transition: 432, transitionPo: '17', raccordTransition: 'Bride ovale 2 boulons', raccord: 'Bride ovale 2 boulons', A: 400, B: 150, C: 150, D: 150 }
      ],
      robinets: 'Robinets d\'isolation : à bille, classe 125, passage intégral, tige inéjectable, MSS-SP110 (corps laiton, garniture et siège PTFE).',
      derivation: 'Voies de dérivation interdites, sauf pour les immeubles répondant aux exigences de l\'article 11 (note A7).'
    },
    croquis002: {
      titre: 'Croquis 002 — préparation de tuyauterie 50 mm (2 po) à 150 mm (6 po), révision 12/13',
      lignes: [
        { d: 50, po: '2', LD: 632, LS: 432, LT: 200, LC: 200, LP: 125, A: 410, B: 343, C: 180, D: 180 },
        { d: 75, po: '3', LD: 1070, LS: 483, LT: 380, LC: 200, LP: 220, A: 410, B: 343, C: 180, D: 180 },
        { d: 100, po: '4', LD: 1310, LS: 584, LT: 475, LC: 250, LP: 275, A: 440, B: 356, C: 225, D: 225 },
        { d: 150, po: '6', LD: 1810, LS: 685, LT: 750, LC: 300, LP: 450, A: 440, B: 356, C: 225, D: 225 }
      ],
      robinets: 'Robinet d\'isolation : à bille classe 600 passage intégral (50 mm et plus) ou à vanne classe 125 (75 mm et plus). Robinet de dérivation : à bille classe 600, à vanne ou à papillon (75 mm et plus).',
      derivation: 'Voie de dérivation permanente obligatoire, parallèle au compteur, de même diamètre ou d\'un diamètre inférieur (inférieur seulement pour l\'eau domestique) ; robinet scellé fermé par la Ville (note A7).'
    },
    croquis003: {
      titre: 'Croquis 003 — préparation de tuyauterie 200 mm (8 po) à 300 mm (12 po), révision 13',
      lignes: [
        { d: 200, po: '8', LD: 2200, LC: 350, LT: 1025, LP: 625, A: 500, B: 405, C: 350, D: 350 },
        { d: 250, po: '10', LD: 2750, LC: 450, LT: 1275, LP: 775, A: 500, B: 520, C: 370, D: 370 },
        { d: 300, po: '12', LD: 3300, LC: 500, LT: 1550, LP: 950, A: 535, B: 535, C: 395, D: 395 }
      ],
      robinets: 'Robinet d\'isolation : à vanne classe 125 (AWWA C509, C550, ANSI/ASME B16.1, NSF-61). Robinet de dérivation : à bille classe 600, à vanne ou à papillon.',
      derivation: 'Voie de dérivation permanente obligatoire (note A7).'
    },
    // Notes générales communes aux croquis 001 à 003.
    notesInstallation: [
      { code: 'A2', texte: 'Le compteur mesure uniquement l\'eau potable, pas l\'eau de protection incendie ; il est installé sur le branchement d\'eau potable.' },
      { code: 'A3', texte: 'Aucun branchement en amont du compteur, autre que celui de protection incendie ou de consommation purement résidentielle.' },
      { code: 'A4', texte: 'Compteur installé à moins de 3 m de l\'entrée d\'eau du bâtiment.' },
      { code: 'A5', texte: 'Toute conduite entre l\'entrée d\'eau et le compteur (dérivation comprise) facilement accessible pour inspection visuelle.' },
      { code: 'A6', texte: 'Aucun équipement (DAR, clapet, régulateur de pression, robinet de régulation) en amont du compteur, sauf branchement purement résidentiel en amont.' },
      { code: 'B1', texte: 'Endroit accessible, à l\'abri de la submersion, de la vibration et du gel ; température entre 5 et 40 °C ; dégagement libre de 1200 mm en hauteur et 1000 mm devant le compteur.' },
      { code: 'B2', texte: 'Compteur installé entre 300 mm et 1500 mm au-dessus du sol.' },
      { code: 'B4', texte: 'Compteur accessible en tout temps ; porte d\'accès possible s\'il est dans une cloison.' },
      { code: 'C1', texte: 'Installation conforme au Code de construction du Québec, chapitre III — Plomberie.' },
      { code: 'C3/C2', texte: 'Compteur (ou pièce de transition) installé à l\'horizontale, registre vers le haut.' },
      { code: 'C6/C7', texte: 'Robinet d\'isolation en amont et en aval du compteur ; aucun autre raccord entre ces deux robinets.' },
      { code: 'C11', texte: 'Tuyauterie supportée de part et d\'autre du compteur ou de la pièce de transition.' },
      { code: 'C12', texte: 'Conduit électrique de 12 mm (1/2 po) avec tire-fils, du compteur au module de transmission monté au mur extérieur.' },
      { code: 'C13/C14', texte: 'Boulons, écrous et rondelles du compteur en acier inoxydable 316.' }
    ],
    chambre: [
      { code: '004', texte: 'Ouverture de 750 mm avec couvercle plein.' },
      { code: '004', texte: 'Hauteur libre intérieure de 1800 mm minimum.' },
      { code: '004', texte: 'Dégagement de 600 mm minimum devant le compteur.' },
      { code: '004', texte: 'Drain de plancher ; drainage conforme à la Directive 001 du ministère de l\'Environnement.' },
      { code: '004', texte: 'Robinets d\'isolation amont et aval ancrés au mur par 2 tiges du diamètre des boulons des brides.' },
      { code: '004', texte: 'Robinet d\'arrêt de la Ville requis lorsqu\'aucun robinet n\'est installé en amont de la chambre.' },
      { code: '004', texte: 'Panneau électrique (si requis) à 20 m maximum de la chambre.' },
      { code: '004', texte: 'Les dimensions des croquis de chambre ont préséance sur celles des croquis 001 à 003.' },
      { code: '004', texte: 'Cotes « 1350 mm min. » et « 450 mm min. » lisibles sur le croquis, référence exacte à confirmer.', aConfirmer: true }
    ],
    croquisChambre: {
      potable: { code: '004', titre: 'Croquis 004 — chambre de compteur, branchement d\'eau potable (révision 6)' },
      incendie: { code: '005', titre: 'Croquis 005 — chambre de compteur, branchement de protection incendie, détection de fuite (révision 5) : soupape de retenue ou DAR approuvé UL, ULC ou FM' },
      combine: { code: '006', titre: 'Croquis 006 — chambre de compteur, branchement d\'eau combiné, mesure de consommation et détection de fuite (révision 5) : accès entre les deux conduites ; cotes « 2 400 mm min. », « 1 900 mm min. », « 900 mm min. » à confirmer' }
    }
  };

  // Annexe C — consommation réputée maximale (révision 2).
  var ANNEXE_C = [
    { d: 20, libelle: '20 ou moins', m3j: 86 },
    { d: 25, libelle: '25', m3j: 150 },
    { d: 40, libelle: '40', m3j: 310 },
    { d: 50, libelle: '50', m3j: 530 },
    { d: 80, libelle: '80', m3j: 1200 },
    { d: 100, libelle: '100', m3j: 2400 },
    { d: 150, libelle: '150', m3j: 5400 },
    { d: 200, libelle: '200', m3j: 9600 },
    { d: 250, libelle: '250', m3j: 15000 },
    { d: 300, libelle: '300', m3j: 21000 },
    { d: 350, libelle: '350', m3j: 28000 }
  ];

  // Annexe G — types d'usage autorisés pour une voie de dérivation (révision 2).
  var ANNEXE_G = [
    ['3915', 'Atelier de mécanicien-dentiste'], ['6539', 'Autres centres de services sociaux'],
    ['6519', 'Autres services médicaux et de santé'], ['7512', 'Centre de santé'],
    ['6533', 'Centre de services sociaux (C.S.S. et C.R.S.S.S.)'], ['6517', 'Clinique médicale (cabinet de médecins généralistes)'],
    ['6542', 'Maison pour personnes en difficulté'], ['1543', 'Maison pour personnes retraitées autonomes'],
    ['1541', 'Maison pour personnes retraitées non autonomes'], ['6516', 'Sanatorium, maison de convalescence et maison de repos'],
    ['6515', 'Service de laboratoire dentaire'], ['6514', 'Service de laboratoire médical'],
    ['6572', 'Service de physiothérapie'], ['6564', 'Service de podiatrie'],
    ['8221', 'Service de vétérinaires (animaux de ferme)'], ['6598', 'Service de vétérinaires (animaux domestiques)'],
    ['6512', 'Service dentaire'], ['6513', 'Service d\'hôpital'],
    ['8222', 'Service d\'hôpital pour les animaux'], ['6518', 'Service d\'optométrie'], ['6565', 'Service d\'orthopédie']
  ].map(function (x) { return { code: x[0], libelle: x[1] }; });

  // Article 12 — alimentation électrique des compteurs électromagnétiques de 50 mm et plus.
  var ARTICLE_12 = {
    general: 'Fournir une alimentation électrique de 120 V pour le compteur et ses équipements.',
    chambre: [
      'Alimentation fournie dans un panneau électrique à l\'extérieur de la chambre.',
      'Panneau verrouillable et facilement accessible.',
      'Panneau installé à 1,5 m au-dessus du niveau du sol.',
      'Panneau à 20 m maximum de la chambre de compteur.',
      'Conduit électrique de 50 mm reliant le panneau à la chambre.',
      'Panneau résistant aux intempéries ; température intérieure maintenue entre 0 et 50 °C.',
      'Espace libre de 300 mm (largeur) × 300 mm (hauteur) × 200 mm (profondeur) pour les équipements de la Ville.',
      'Panneau à l\'usage exclusif de l\'autorité compétente, verrouillé par elle après installation.'
    ],
    horsChambre: 'Prise d\'alimentation 120 Vca à moins de 5 m du compteur, lorsque requis par le directeur (annexe B, croquis 002 et 003, note B5).'
  };

  // Références citées dans les infobulles.
  var REFS = {
    art2_1_al1: { court: 'art. 2.1 al. 1', texte: "L'exigence d'installer un compteur s'applique seulement à tout branchement d'eau d'un immeuble : 1° porté au rôle, catégorie des immeubles non résidentiels (LFM art. 244.31), classes 5 à 10 (art. 244.32) ou unités visées aux art. 244.36, 244.51 ou 244.52 ; 2° visé par l'art. 204 LFM, par. 1 à 9 ou 11 à 19 ; 3° utilisé ou destiné à être utilisé en partie ou en totalité à des fins non résidentielles et pas encore porté au rôle." },
    art2_1_al2: { court: 'art. 2.1 al. 2', texte: "Un compteur d'eau n'a pas à être installé pour un immeuble où aucun aménagement ou bâtiment n'est relié à un branchement d'eau." },
    art2_1_al3: { court: 'art. 2.1 al. 3', texte: "Le propriétaire d'un immeuble utilisé en partie à des fins résidentielles peut demander par écrit à être exempté. Demande accompagnée des annexes D et H dûment complétées. Condition : l'estimation de la somme des demandes de pointe de tous les appareils (annexe H) de tous les établissements doit être inférieure ou égale à la demande de pointe définie à l'annexe I selon sa méthode de calcul." },
    art1_etab: { court: 'art. 1', texte: "« établissement » : immeuble ou partie d'immeuble utilisé ou destiné à être utilisé par un seul occupant pour un usage autre que résidentiel." },
    art9_al3: { court: 'art. 9 al. 3', texte: "Le type et la dimension de tout compteur sont déterminés par l'autorité compétente, en tenant compte de la gamme de débit du compteur, de la demande de pointe de l'immeuble et de la perte de pression occasionnée par le compteur." },
    annH_12: { court: 'ann. H, tabl. 1.2', texte: 'Annexe H (révision 7), tableau 1.2 — Inventaire des appareils courants consommant de l\'eau ; unités d\'alimentation en USGPM.' },
    annH_13: { court: 'ann. H, tabl. 1.3', texte: 'Annexe H (révision 7), tableau 1.3 — Inventaire des autres appareils consommant de l\'eau ; unités d\'alimentation en USGPM.' },
    annH_conv: { court: 'ann. H', texte: 'USGPM : gallon US par minute. 1 USGPM = 3,785 litres par minute, ou 0,227 mètre cube par heure.' },
    annI_q12: { court: 'ann. I, étape 3', texte: 'Faire la somme totale des unités d\'alimentation du tableau 1.2 (Q12).' },
    annI_q13: { court: 'ann. I, étape 4', texte: 'Faire la somme totale des unités d\'alimentation du tableau 1.3 (Q13).' },
    annI_cas: { court: 'ann. I, étape 5', texte: "Cas 1 : l'établissement est une salle de spectacle, un théâtre, un cinéma, une école, un stade, un centre sportif, un aréna, un hôtel, un motel, ou contient au moins une toilette ou un urinoir à soupape de chasse. Cas 2 : autre type d'établissement." },
    annI_q12p: { court: 'ann. I, étape 5', texte: 'Q12P : demande de pointe maximale pondérée, selon la formule correspondant au cas et à la plage de Q12.' },
    annI_qpm: { court: 'ann. I, étape « 5 » (QPM)', texte: 'QPUS = Q13 + Q12P (gal US/min) ; QPM = QPUS × 0,227 (m³/h). Le PDF numérote deux étapes « 5 ».' },
    annI_seuil: { court: 'ann. I', texte: 'Demande de pointe (QPM) : 2,3 m³/h (10 gal US). Pression théorique 414 kPa (60 PSI). Référence : AWWA M22, 2e édition.' },
    art9_al4: { court: 'art. 9 al. 4', texte: "Sur demande du propriétaire, le dimensionnement du compteur exigé est modifié s'il est démontré, à l'aide de l'annexe D et de l'inventaire de l'annexe H ou d'un calcul hydraulique signé par un ingénieur, que le choix du compteur proposé est inadéquat pour assurer les besoins en eau de l'immeuble." },
    art12: { court: 'art. 12', texte: "Le propriétaire dont l'immeuble est desservi par un compteur électromagnétique de 50 mm et plus, muni d'une alimentation électrique de 120 volts, doit fournir une alimentation électrique de 120 volts pour le compteur et ses équipements." },
    art2_al2: { court: 'art. 2 al. 2', texte: "Pour un branchement existant, les compteurs requis sont fournis et installés par la Ville (sauf contraintes d'opération)." },
    annB_diam: { court: 'ann. B', texte: 'Annexe B — préparation de tuyauterie : croquis 001 (20 à 50 mm), 002 (50 à 150 mm, dont 75 mm), 003 (200 à 300 mm).' },
    art3: { court: 'art. 3', texte: "Il doit être installé autant de compteurs que nécessaire afin de mesurer la consommation de l'eau de l'ensemble des établissements situés dans un immeuble, à l'exception du volume d'eau nécessaire à la protection incendie. Cette exigence s'applique également à un branchement d'eau temporaire." },
    art4: { court: 'art. 4', texte: "Malgré l'article 3, il peut être installé un seul compteur sur chaque entrée d'eau d'un bâtiment, lorsque l'installation d'une tuyauterie de distribution séparée et distincte, afin de mesurer la consommation de l'eau de l'ensemble des établissements, nécessite des travaux de plomberie dans une pièce autre que celle où se trouve l'entrée d'eau dans le bâtiment." },
    art5: { court: 'art. 5', texte: "Lorsque la section privée d'un branchement d'eau compte plus de 5 joints souterrains, le propriétaire doit : 1° nouveau branchement : construire une chambre de compteur à l'endroit indiqué par l'autorité compétente, conforme à l'annexe B ; 2° branchement existant : a) construire une chambre de compteur, ou b) aviser l'autorité de l'absence de chambre et lui transmettre chaque année le rapport d'une firme spécialisée en détection de fuite ; en cas de fuite, échéancier et travaux dans les 180 jours ; à défaut, obligation de construire la chambre. Une pièce de raccord (union, coude, T) sur la partie privée constitue un seul joint." },
    art6: { court: 'art. 6', texte: "L'article 5 ne s'applique pas à un branchement d'eau constitué de tuyaux en cuivre de type K et de pièces de raccord en cuivre dont tous les joints sont soudés à l'argent." },
    art7: { court: 'art. 7', texte: "Dans les cas visés à l'article 5, lorsqu'un branchement d'eau est combiné, la tuyauterie alimentant l'eau destinée à la protection incendie doit être séparée de celle destinée aux autres besoins de l'immeuble. Cette séparation doit se faire dans la chambre de compteur." },
    art8: { court: 'art. 8', texte: "Malgré l'article 3, lorsqu'une chambre de compteur doit être installée et que le branchement dessert plusieurs bâtiments, propriété d'un seul propriétaire ou constituant une seule unité d'évaluation, il peut être installé un seul compteur pour l'ensemble des bâtiments en autant qu'aucun usage résidentiel n'est exercé dans l'un ou l'autre des bâtiments. L'autorité compétente peut exiger l'installation de compteurs afin de mesurer la consommation résidentielle." },
    art8_01: { court: 'art. 8.01', texte: "Malgré les articles 3 et 7, lorsqu'une chambre de compteur(s) doit être installée et que le branchement est un branchement combiné desservant plusieurs bâtiments, propriété d'un seul propriétaire ou constituant une seule unité d'évaluation, il peut être installé un seul compteur pour l'ensemble des bâtiments." },
    art8_1: { court: 'art. 8.1', texte: "Malgré l'article 5, lorsqu'un réseau de distribution d'eau potable privé se situe sur un lot et que ce réseau a deux branchements ou plus raccordés à l'aqueduc, le propriétaire doit installer des clapets de retenue simple ou un dispositif anti-refoulement sur chacun des branchements, conformément à l'annexe B, dans une chambre de compteur(s) construite à l'endroit indiqué par l'autorité compétente." },
    art9_al1: { court: 'art. 9 al. 1', texte: "Préalablement à l'installation ou au remplacement d'un compteur, le propriétaire prépare l'endroit déterminé dans les délais fixés par l'autorité compétente. Une fois les travaux terminés, il transmet la fiche d'auto-inspection prévue à l'annexe E." },
    art9_al2: { court: 'art. 9 al. 2', texte: "Le propriétaire fournit et installe à ses frais la tuyauterie nécessaire et, lorsque requis en vertu de l'article 5, construit la chambre de compteur ; il prend les mesures pour prévenir les dommages dus à une interruption de service." },
    art9_al5: { court: 'art. 9 al. 5', texte: "Les travaux de préparation de tuyauterie doivent inclure l'installation d'un dispositif antirefoulement conformément aux normes applicables." },
    art9_al6: { court: 'art. 9 al. 6', texte: "La tuyauterie, incluant si nécessaire une chambre de compteur, doit être installée conformément aux normes techniques de l'annexe B. L'autorité compétente peut autoriser une adaptation en raison de circonstances exceptionnelles, aux frais du propriétaire." },
    art11: { court: 'art. 11', texte: "Le propriétaire d'un immeuble dont l'usage correspond à l'un de ceux énumérés à l'annexe G et qui est alimenté par un branchement de 40 mm et moins peut installer une dérivation conformément à l'annexe B. La vanne d'arrêt de la dérivation est scellée par l'autorité compétente et tenue fermée en tout temps, sauf lors de l'entretien ou du remplacement du compteur." },
    art12_al2: { court: 'art. 12 al. 2', texte: "Compteur en chambre : alimentation fournie dans un panneau électrique à l'extérieur de la chambre, verrouillable, facilement accessible, à 1,5 m au-dessus du sol, à 20 m maximum de la chambre ; conduit de 50 mm ; panneau résistant aux intempéries, 0 à 50 °C ; espace libre 300 × 300 × 200 mm ; usage exclusif de l'autorité compétente." },
    art13: { court: 'art. 13', texte: "La consommation qui ne peut être mesurée en raison du défaut de permettre les travaux est réputée égale, pendant la période visée, à la consommation maximale ininterrompue calculée en fonction du diamètre de l'entrée d'eau desservant l'eau domestique et d'une vitesse de 3 m/s, tel que spécifié à l'annexe C. Si le diamètre est inconnu, le plus petit diamètre de l'annexe C est utilisé." },
    art15: { court: 'art. 15', texte: "Le propriétaire protège à ses frais le compteur et la tuyauterie contre le gel et s'assure que la chambre de compteur est en tout temps drainée, facile d'accès et en bon état." },
    art21: { court: 'art. 21', texte: "Le propriétaire maintient l'emplacement ou la chambre du compteur libre d'accès pour l'autorité compétente." },
    annB_001: { court: 'ann. B, croquis 001', texte: 'Annexe B — croquis 001 : préparation de tuyauterie pour un diamètre de 20 mm (3/4 po) à 50 mm (2 po).' },
    annB_002: { court: 'ann. B, croquis 002', texte: 'Annexe B — croquis 002 : préparation de tuyauterie pour un diamètre de 50 mm (2 po) à 150 mm (6 po).' },
    annB_003: { court: 'ann. B, croquis 003', texte: 'Annexe B — croquis 003 : préparation de tuyauterie pour un diamètre de 200 mm (8 po) à 300 mm (12 po).' },
    annB_notes: { court: 'ann. B, notes', texte: 'Annexe B — notes générales des croquis 001 à 003 (point d\'installation, emplacement, installation).' },
    annB_chambre: { court: 'ann. B, croquis 004-006', texte: 'Annexe B — croquis 004 (chambre, eau potable), 005 (chambre, protection incendie, détection de fuite) et 006 (chambre, branchement combiné).' },
    annC: { court: 'ann. C', texte: 'Annexe C — Consommation réputée maximale (révision 2) : consommation journalière maximale (m³/jour) selon le diamètre nominal de la conduite.' },
    annD_17: { court: 'ann. D, § 1.7', texte: "Point d'installation : endroit sur la conduite d'eau où le compteur sera installé. Le compteur ne doit mesurer que la consommation d'eau potable I.C.I., et non la consommation résidentielle ou l'eau de protection incendie." },
    annE: { court: 'ann. E', texte: 'Annexe E — Fiche auto-inspection (révision 7), transmise à l\'autorité compétente une fois les travaux terminés (art. 9 al. 1).' },
    annG: { court: 'ann. G', texte: 'Annexe G — Types d\'usage autorisés pour une voie de dérivation (révision 2).' },
    annD: { court: 'ann. D', texte: 'Annexe D — Questionnaire : fiche d\'information (révision 6).' },
    annD_13: { court: 'ann. D, § 1.3', texte: 'Annexe D, § 1.3 — Usages du bâtiment : vocation I.C.I. (industrielle, commerciale, institutionnelle) ; nombre d\'unités de logement ; salle de spectacle, théâtre, cinéma, école, stade, centre sportif, aréna, hôtel ou motel.' }
  };

  var api = {
    REGLEMENT: REGLEMENT,
    TABLEAU_12: TABLEAU_12,
    TABLEAU_13: TABLEAU_13,
    ANNEXE_I: ANNEXE_I,
    ANNEXE_B: ANNEXE_B,
    ANNEXE_C: ANNEXE_C,
    ANNEXE_G: ANNEXE_G,
    ARTICLE_12: ARTICLE_12,
    REFS: REFS
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.RCG = api;
})(this);

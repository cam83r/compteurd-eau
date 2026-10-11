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
    annD: { court: 'ann. D', texte: 'Annexe D — Questionnaire : fiche d\'information (révision 6).' },
    annD_13: { court: 'ann. D, § 1.3', texte: 'Annexe D, § 1.3 — Usages du bâtiment : vocation I.C.I. (industrielle, commerciale, institutionnelle) ; nombre d\'unités de logement ; salle de spectacle, théâtre, cinéma, école, stade, centre sportif, aréna, hôtel ou motel.' }
  };

  var api = {
    REGLEMENT: REGLEMENT,
    TABLEAU_12: TABLEAU_12,
    TABLEAU_13: TABLEAU_13,
    ANNEXE_I: ANNEXE_I,
    REFS: REFS
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.RCG = api;
})(this);

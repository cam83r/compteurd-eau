/*
 * Base de données compteurs — module 3.
 * Le RCG 07-031 ne contient ni gamme de débit ni perte de pression (art. 9 al. 3) : ces données
 * proviennent des fiches fabricants fournies par l'utilisateur (docs/fiches/).
 *
 * perte : points [débit USGPM, perte psi] LUS SUR LES GRAPHIQUES des fiches (lecture visuelle,
 * précision ≈ ±0,2 psi), aux croisements de la courbe avec le quadrillage. Entre deux points :
 * interpolation linéaire. null = donnée absente de la source.
 */
(function (root) {
  'use strict';

  var SRC_T10_PETIT = { doc: 'Neptune, T-10 Meter 5/8", 3/4" and 1" (PS T10 SMALL 05.11, © 2011)', fichier: 'docs/fiches/Neptune_T-10_5-8_a_1po.pdf', pagePlage: 4, pagePerte: 3 };
  var SRC_T10_INTER = { doc: 'Neptune, T-10 Meter 1 1/2" and 2" (21-006205 PS T-10 INTERMEDIATE 11.21, © 2021)', fichier: 'docs/fiches/Neptune_T-10_1.5-2po.pdf', pagePlage: 3, pagePerte: 2 };
  var SRC_IPERL = { doc: 'Sensus, iPERL Smart Water Meter (WDS-10006-05, © 2019)', fichier: 'docs/fiches/Sensus_iPERL.pdf', pagePlage: 3, pagePerte: 4 };
  var SRC_MACH10 = { doc: 'Neptune, MACH 10 C&I Ultrasonic Meter — Installation and Maintenance Guide (Part No 12287-0001, © 2020-2026), tableau 8 (p. 12 imprimée)', fichier: 'docs/fiches/Neptune_MACH-10_C_et_I_3-12po.pdf', pagePlage: 26, pagePerte: null };

  var T10 = { fabricant: 'Neptune', modele: 'T-10', technologie: 'volumetrique', libelleTechno: 'Volumétrique (disque nutatif)', norme: 'AWWA C700', pressionMaxPsi: 150 };
  var IPERL = { fabricant: 'Sensus', modele: 'iPERL', technologie: 'electromagnetique', libelleTechno: 'Électromagnétique (pile, sans pièce mobile)', norme: 'AWWA C715', alimentation: 'pile' };
  var MACH10 = { fabricant: 'Neptune', modele: 'MACH 10 C&I', technologie: 'ultrasonique', libelleTechno: 'Ultrasonique (pile, sans pièce mobile)', norme: 'AWWA C715', pressionMaxPsi: 175, alimentation: 'pile' };

  function c(base, o) {
    var r = {};
    Object.keys(base).forEach(function (k) { r[k] = base[k]; });
    Object.keys(o).forEach(function (k) { r[k] = o[k]; });
    r.id = (r.modele + '-' + r.diametrePo).replace(/[^\w]+/g, '_');
    return r;
  }

  var COMPTEURS = [
    // Neptune T-10 — plage normale à 100 % (±1,5 %) ; plage AWWA ; bas débit à 95 %.
    c(T10, { diametrePo: '5/8', diametreMm: 15, plageNormale: [0.5, 20], plageAWWA: [1, 20], basDebit: 0.125, basDebitPrecision: '95 %', source: SRC_T10_PETIT,
      perte: [[0, 0], [5, 0.5], [10, 2], [14, 4], [17.2, 6], [20, 8]] }),
    c(T10, { diametrePo: '3/4', diametreMm: 20, plageNormale: [0.75, 30], plageAWWA: [2, 30], basDebit: 0.25, basDebitPrecision: '95 %', source: SRC_T10_PETIT,
      perte: [[0, 0], [13, 2], [18.1, 4], [23, 6], [27, 8], [30, 10]] }),
    c(T10, { diametrePo: '1', diametreMm: 25, plageNormale: [1, 50], plageAWWA: [3, 50], basDebit: 0.375, basDebitPrecision: '95 %', source: SRC_T10_PETIT,
      perte: [[0, 0], [24, 2], [34, 4], [42, 6], [50, 8]] }),
    c(T10, { diametrePo: '1 1/2', diametreMm: 40, plageNormale: [2, 100], plageAWWA: [5, 100], basDebit: 0.75, basDebitPrecision: '95 %', source: SRC_T10_INTER,
      perte: [[0, 0], [10, 0], [44, 2], [64, 4], [80, 6], [92, 8], [100, 9.9]] }),
    c(T10, { diametrePo: '2', diametreMm: 50, plageNormale: [2.5, 160], plageAWWA: [8, 160], basDebit: 1, basDebitPrecision: '95 %', source: SRC_T10_INTER,
      perte: [[0, 0], [10, 0.1], [70, 2], [105, 4], [125, 6], [145, 8], [160, 9.8]] }),

    // Sensus iPERL — plage normale ±1,5 % ; bas débit ±3 % ; eau 0,55 à 26,7 °C.
    c(IPERL, { diametrePo: '5/8', diametreMm: 15, plageNormale: [0.18, 25], basDebit: 0.11, basDebitPrecision: '±3 %', pressionMaxPsi: 200, source: SRC_IPERL,
      perte: [[0, 0], [5, 0.9], [10, 2.2], [15, 3.9], [20, 6.0], [25, 8.8]] }),
    c(IPERL, { diametrePo: '3/4', diametreMm: 20, plageNormale: [0.18, 35], basDebit: 0.11, basDebitPrecision: '±3 %', pressionMaxPsi: 200, source: SRC_IPERL,
      perte: [[0, 0], [5, 0.45], [10, 1.05], [15, 1.9], [20, 2.9], [25, 4.1], [30, 5.6], [35, 7.3]] }),
    c(IPERL, { diametrePo: '1', diametreMm: 25, plageNormale: [0.4, 55], basDebit: 0.3, basDebitPrecision: '±3 %', pressionMaxPsi: 175, source: SRC_IPERL,
      perte: [[0, 0.45], [10, 0.7], [20, 1.5], [30, 2.7], [40, 4.3], [50, 6.4], [55, 7.7]] }),

    // Neptune MACH 10 C&I — bas débit étendu ±3 % ; plage normale ±1,5 %. Aucune perte de pression dans la source.
    c(MACH10, { diametrePo: '3', diametreMm: 75, plageNormale: [0.75, 500], basDebit: 0.5, basDebitPrecision: '±3 %', protectionIncendie: 420, source: SRC_MACH10, perte: null }),
    c(MACH10, { diametrePo: '4', diametreMm: 100, plageNormale: [1.5, 1250], basDebit: 0.75, basDebitPrecision: '±3 %', protectionIncendie: 1100, source: SRC_MACH10, perte: null }),
    c(MACH10, { diametrePo: '6', diametreMm: 150, plageNormale: [2, 2000], basDebit: 1, basDebitPrecision: '±3 %', protectionIncendie: 1800, source: SRC_MACH10, perte: null }),
    c(MACH10, { diametrePo: '8', diametreMm: 200, plageNormale: [6, 4000], basDebit: 4, basDebitPrecision: '±3 %', protectionIncendie: 4000, source: SRC_MACH10, perte: null }),
    c(MACH10, { diametrePo: '10', diametreMm: 250, plageNormale: [10, 6500], basDebit: 6, basDebitPrecision: '±3 %', protectionIncendie: 6500, source: SRC_MACH10, perte: null }),
    c(MACH10, { diametrePo: '12', diametreMm: 300, plageNormale: [12, 8000], basDebit: 8, basDebitPrecision: '±3 %', protectionIncendie: 8000, source: SRC_MACH10, perte: null })
  ];

  // Diamètres de préparation de tuyauterie prévus à l'annexe B (croquis 001, 002, 003).
  var DIAMETRES_ANNEXE_B = [20, 25, 40, 50, 75, 100, 150, 200, 250, 300];

  var api = { COMPTEURS: COMPTEURS, DIAMETRES_ANNEXE_B: DIAMETRES_ANNEXE_B, KPA_PAR_PSI: 6.894757 };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.CompteursDB = api;
})(this);

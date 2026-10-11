/*
 * Jeu de données d'exemple — immeuble mixte FICTIF (voir docs/jeu_exemple.md pour les résultats attendus).
 * Les branchements serviront aux modules 4 à 7.
 */
(function (root) {
  'use strict';

  var EXEMPLE = {
    projet: {
      nom: 'Exemple — immeuble mixte fictif',
      adresse: '1234, rue de l\'Exemple (fictive)',
      arrondissement: 'LaSalle'
    },
    admissibilite: {
      usage: 'commerciale',
      critere1: 'oui',
      critere2: 'non',
      critere3: 'non',
      aucunBranchement: 'non',
      partieResidentielle: 'oui',
      nbLogements: 6
    },
    etablissements: [
      {
        id: 'e1',
        nom: 'Café du coin',
        usageCas1: '',
        quantites: { wc_reservoir: 1, lavabo: 1, evier_com: 1, lv_com: 1, frigo_eau: 2 }
      },
      {
        id: 'e2',
        nom: 'Salon de coiffure',
        usageCas1: '',
        quantites: { wc_reservoir: 1, lavabo: 1, evier_com: 2, laveuse: 1 }
      }
    ],
    // Module 3 — pressions FICTIVES saisies par l'usager (le règlement ne fixe aucune valeur).
    selection: {
      sourceDemande: 'module2',
      debitManuel: '',
      pressionDisponibleKpa: 380,
      pressionRequiseKpa: 350,
      technologie: ''
    },
    // Bilan de pression (CNP 2020) — valeurs FICTIVES inspirées de l'exemple de la figure A-2.6.3.1. 2)-B.
    bilan: {
      pStatique: 565, perteBranchement: 25, compteurId: '', perteCompteurManuelle: '', autresPertes: 15,
      hauteurM: 3.5, pressionMin: 105, longueur: 76, facteur: 1.5
    },
    // Modules 4 à 7.
    immeuble: { reseauPrive: 'non', codeUsageG: '' },
    branchements: [
      {
        id: 'B1', nom: 'B1 — logements', type: 'potable', temporaire: 'non', diametreMm: 50, materiau: 'Cuivre',
        neuf: 'existant', joints: 3, cuivreKArgent: 'non', nbBatiments: 1, memeProprietaire: 'oui',
        dessertEtablissements: 'non', dessertResidentiel: 'oui', separationAutrePiece: '',
        diametrePreparationMm: '', typeCompteur: '', alimentation120: ''
      },
      {
        id: 'B2', nom: 'B2 — commerces et gicleurs', type: 'combine', temporaire: 'non', diametreMm: 100, materiau: 'Fonte',
        neuf: 'existant', joints: 8, cuivreKArgent: 'non', nbBatiments: 1, memeProprietaire: 'oui',
        dessertEtablissements: 'oui', dessertResidentiel: 'non', separationAutrePiece: '',
        diametrePreparationMm: 25, typeCompteur: 'volumetrique', alimentation120: ''
      }
    ],
    // Module 7 — période et tarif FICTIFS saisis par l'usager.
    consommation: { diametreMm: 50, jours: 30, tarif: '' }
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = EXEMPLE;
  else root.EXEMPLE = EXEMPLE;
})(this);

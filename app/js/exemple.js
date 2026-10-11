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
    branchements: [
      { id: 'B1', type: 'Potable', diametreMm: 50, materiau: 'Cuivre' },
      { id: 'B2', type: 'Combiné', diametreMm: 150, materiau: 'Fonte' }
    ]
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = EXEMPLE;
  else root.EXEMPLE = EXEMPLE;
})(this);

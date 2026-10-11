/*
 * Calculs des modules 4 à 7, par branchement : chambre (art. 5 à 7, 8.1), comptage (art. 3, 4, 8, 8.01),
 * préparation et installation (art. 9, 11, 12, annexes B et G), consommation réputée (art. 13, annexe C).
 * Fonctions pures, testées par tests/calculs.test.js.
 * Réponses tri-état : 'oui' | 'non' | '' (non renseigné).
 */
(function (root) {
  'use strict';

  var RCG = (typeof module !== 'undefined' && module.exports) ? require('./reglement.js') : root.RCG;

  function entier(v) {
    var n = parseInt(v, 10);
    return isFinite(n) && n >= 0 ? n : null;
  }

  function croquisChambre(type) {
    return RCG.ANNEXE_B.croquisChambre[type === 'combine' ? 'combine' : type === 'incendie' ? 'incendie' : 'potable'];
  }

  // Module 5 — chambre de compteur.
  // immeuble.reseauPrive : réseau de distribution privé sur le lot ; nbBranchements : branchements du projet.
  function evaluerChambre(b, immeuble, nbBranchements) {
    var motifs = [], options = [];
    var res = { statut: null, motifs: motifs, options: options, croquis: croquisChambre(b.type), separationIncendie: false };
    var joints = entier(b.joints);

    // Art. 8.1 : réseau privé avec 2 branchements ou plus — chambre avec clapets, malgré l'art. 5.
    if (immeuble && immeuble.reseauPrive === 'oui' && nbBranchements >= 2) {
      res.statut = 'requise';
      motifs.push({ texte: 'Réseau de distribution privé sur le lot avec ' + nbBranchements + ' branchements raccordés à l\'aqueduc : clapets de retenue simple ou dispositif antirefoulement sur chaque branchement, dans une chambre construite à l\'endroit indiqué par l\'autorité compétente.', ref: 'art8_1' });
    }

    if (b.cuivreKArgent === 'oui') {
      motifs.push({ texte: 'Cuivre de type K, raccords en cuivre soudés à l\'argent : l\'article 5 ne s\'applique pas.', ref: 'art6' });
      if (!res.statut) res.statut = 'non_requise';
    } else if (joints == null) {
      if (!res.statut) res.statut = 'a_confirmer';
      motifs.push({ texte: 'Nombre de joints souterrains de la section privée non renseigné (union, coude ou T = un joint).', ref: 'art5' });
    } else if (joints > 5) {
      motifs.push({ texte: joints + ' joints souterrains sur la section privée (> 5).', ref: 'art5' });
      if (b.neuf === 'nouveau') {
        res.statut = 'requise';
        motifs.push({ texte: 'Nouveau branchement : construire une chambre de compteur à l\'endroit indiqué par l\'autorité compétente.', ref: 'art5' });
      } else if (res.statut !== 'requise') {
        res.statut = 'option';
        options.push({ texte: 'a) Construire une chambre de compteur à l\'endroit indiqué dans l\'avis de l\'autorité compétente.', ref: 'art5' });
        options.push({ texte: 'b) Aviser l\'autorité de l\'absence de chambre et transmettre chaque année le rapport d\'une firme de détection de fuite ; en cas de fuite : échéancier, travaux dans les 180 jours ; à défaut, obligation de construire la chambre.', ref: 'art5' });
      }
    } else {
      motifs.push({ texte: joints + ' joint(s) souterrain(s) sur la section privée (≤ 5) : l\'article 5 ne s\'applique pas.', ref: 'art5' });
      if (!res.statut) res.statut = 'non_requise';
    }

    if (b.type === 'combine' && (res.statut === 'requise' || res.statut === 'option')) {
      res.separationIncendie = true;
      motifs.push({ texte: 'Branchement combiné : la tuyauterie de protection incendie est séparée de celle des autres besoins, dans la chambre de compteur.', ref: 'art7' });
    }
    return res;
  }

  // Module 4 — nombre et emplacement des compteurs pour un branchement.
  function evaluerComptage(b, chambre, partieResidentielle) {
    var motifs = [], points = [];
    var res = { statut: null, motifs: motifs, points: points, unSeulCompteurBatiments: false };

    if (b.type === 'incendie') {
      res.statut = 'aucun';
      motifs.push({ texte: 'Branchement de protection incendie : le volume d\'eau de protection incendie n\'est pas mesuré.', ref: 'art3' });
      return res;
    }
    if (b.dessertEtablissements === 'non') {
      res.statut = 'aucun';
      motifs.push({ texte: 'Aucun établissement (usage non résidentiel) desservi : aucun compteur de consommation I.C.I. sur ce branchement — à confirmer avec l\'autorité compétente.', ref: 'art3', aConfirmer: true });
      return res;
    }
    if (b.dessertEtablissements !== 'oui') {
      res.statut = 'a_confirmer';
      motifs.push({ texte: 'Indiquer si le branchement dessert des établissements.', ref: 'art3' });
      return res;
    }

    res.statut = 'requis';
    motifs.push({ texte: 'Compteur(s) requis pour mesurer la consommation de l\'ensemble des établissements desservis' + (b.temporaire === 'oui' ? ' (s\'applique aussi au branchement temporaire)' : '') + '.', ref: 'art3' });
    if (b.type === 'combine') motifs.push({ texte: 'Branchement combiné : le compteur est installé sur la conduite d\'eau potable, après la séparation de la protection incendie.', ref: 'annB_notes' });

    var residentiel = b.dessertResidentiel === 'oui';
    if (residentiel && b.separationAutrePiece === 'oui') {
      points.push('Un seul compteur sur l\'entrée d\'eau (mesure aussi la partie résidentielle)');
      motifs.push({ texte: 'La séparation de la tuyauterie des établissements exigerait des travaux dans une autre pièce que celle de l\'entrée d\'eau : un seul compteur peut être installé sur l\'entrée d\'eau.', ref: 'art4' });
    } else if (residentiel) {
      points.push('Compteur sur la tuyauterie distincte desservant les établissements');
      motifs.push({ texte: 'Le compteur mesure seulement la consommation I.C.I. ; un branchement purement résidentiel peut se trouver en amont du compteur.', ref: 'annD_17' });
      if (b.separationAutrePiece !== 'non') motifs.push({ texte: 'Préciser si la séparation exigerait des travaux dans une autre pièce (art. 4).', ref: 'art4', aConfirmer: true });
    } else {
      points.push('Compteur sur l\'entrée d\'eau');
    }

    var nbBat = entier(b.nbBatiments) || 1;
    if (nbBat > 1) {
      var chambreRequise = chambre && chambre.statut === 'requise';
      if (!chambreRequise) {
        motifs.push({ texte: nbBat + ' bâtiments desservis, mais aucune chambre requise : les articles 8 et 8.01 ne s\'appliquent pas.', ref: 'art8' });
      } else if (b.memeProprietaire !== 'oui') {
        motifs.push({ texte: 'Bâtiments de propriétaires ou d\'unités d\'évaluation différents : les articles 8 et 8.01 ne s\'appliquent pas.', ref: 'art8' });
      } else if (b.type === 'combine') {
        res.unSeulCompteurBatiments = true;
        motifs.push({ texte: 'Chambre requise, branchement combiné, ' + nbBat + ' bâtiments d\'un seul propriétaire : un seul compteur possible pour l\'ensemble des bâtiments.', ref: 'art8_01' });
      } else if (!residentiel && partieResidentielle !== 'oui') {
        res.unSeulCompteurBatiments = true;
        motifs.push({ texte: 'Chambre requise, ' + nbBat + ' bâtiments d\'un seul propriétaire, sans usage résidentiel : un seul compteur possible pour l\'ensemble des bâtiments.', ref: 'art8' });
      } else {
        motifs.push({ texte: 'Usage résidentiel dans un des bâtiments : l\'article 8 ne permet pas un seul compteur ; l\'autorité peut exiger des compteurs pour la consommation résidentielle.', ref: 'art8' });
      }
    }
    if (chambre && (chambre.statut === 'requise' || chambre.statut === 'option')) {
      points.push(chambre.statut === 'requise' ? 'Compteur dans la chambre de compteur' : 'Compteur dans la chambre si l\'option a) est retenue');
    }
    return res;
  }

  // Module 6 — préparation de tuyauterie selon le diamètre (annexe B).
  function preparationTuyauterie(d) {
    d = Number(d);
    var B = RCG.ANNEXE_B, res = [];
    [['croquis001', 'annB_001'], ['croquis002', 'annB_002'], ['croquis003', 'annB_003']].forEach(function (c) {
      var ligne = B[c[0]].lignes.filter(function (l) { return l.d === d; })[0];
      if (ligne) res.push({ croquis: c[0], ref: c[1], titre: B[c[0]].titre, ligne: ligne, robinets: B[c[0]].robinets, derivation: B[c[0]].derivation });
    });
    return res;
  }

  // Module 6 — dérivation (art. 11 + annexe B, note A7).
  function evaluerDerivation(diamPrep, diamBranchement, codeG) {
    var preps = preparationTuyauterie(diamPrep), motifs = [];
    var croquis = preps.map(function (p) { return p.croquis; });
    var usageG = RCG.ANNEXE_G.filter(function (g) { return g.code === codeG; })[0];
    var art11 = !!usageG && Number(diamBranchement) > 0 && Number(diamBranchement) <= 40;
    if (!preps.length) return { statut: 'a_confirmer', motifs: [{ texte: 'Diamètre de préparation non prévu à l\'annexe B.', ref: 'annB_notes' }] };

    var obligatoire = croquis.indexOf('croquis002') > -1 || croquis.indexOf('croquis003') > -1;
    var sous001 = croquis.indexOf('croquis001') > -1;
    var statut;
    if (obligatoire && sous001) {
      statut = 'a_confirmer';
      motifs.push({ texte: '50 mm figure aux croquis 001 (dérivation interdite sauf art. 11) et 002 (dérivation permanente obligatoire) : croquis applicable à confirmer avec l\'autorité compétente.', ref: 'annB_002', aConfirmer: true });
    } else if (obligatoire) {
      statut = 'obligatoire';
      motifs.push({ texte: 'Voie de dérivation permanente obligatoire, parallèle au compteur ; robinet scellé fermé par la Ville.', ref: preps[0].ref });
    } else if (art11) {
      statut = 'permise';
      motifs.push({ texte: 'Usage ' + usageG.code + ' (' + usageG.libelle + ') listé à l\'annexe G et branchement de ' + diamBranchement + ' mm (≤ 40 mm) : dérivation permise.', ref: 'art11' });
      motifs.push({ texte: 'Vanne d\'arrêt de la dérivation scellée par l\'autorité compétente, tenue fermée sauf entretien ou remplacement du compteur.', ref: 'art11' });
    } else {
      statut = 'interdite';
      motifs.push({ texte: usageG ? 'Branchement de plus de 40 mm : l\'article 11 ne s\'applique pas.' : 'Usage non listé à l\'annexe G : l\'article 11 ne s\'applique pas.', ref: usageG ? 'art11' : 'annG' });
      motifs.push({ texte: 'Voies de dérivation interdites, sauf pour les immeubles visés par l\'article 11.', ref: 'annB_001' });
    }
    return { statut: statut, motifs: motifs };
  }

  // Module 6 — alimentation électrique (art. 12).
  function evaluerElectrique(typeCompteur, diamMm, alimentation120, chambreRequise) {
    var A = RCG.ARTICLE_12;
    if (typeCompteur !== 'electromagnetique' || !(Number(diamMm) >= 50)) {
      return { statut: 'non_applicable', exigences: [] };
    }
    if (alimentation120 === 'non') return { statut: 'non_applicable', exigences: [], note: 'Compteur électromagnétique sans alimentation 120 V (ex. à pile).' };
    if (alimentation120 !== 'oui') return { statut: 'a_confirmer', exigences: [], note: 'Préciser si le compteur est muni d\'une alimentation 120 V.' };
    var ex = [{ texte: A.general, ref: 'art12' }];
    if (chambreRequise) A.chambre.forEach(function (t) { ex.push({ texte: t, ref: 'art12_al2' }); });
    else ex.push({ texte: A.horsChambre, ref: 'annB_002' });
    return { statut: 'applicable', exigences: ex };
  }

  // Module 7 — consommation réputée (art. 13, annexe C).
  function consommationReputee(diamMm) {
    var C = RCG.ANNEXE_C;
    if (diamMm === '' || diamMm == null || diamMm === 'inconnu') {
      return { couvert: true, ligne: C[0], m3j: C[0].m3j, motif: 'Diamètre inconnu : le plus petit diamètre de l\'annexe C est utilisé.' };
    }
    var d = Number(diamMm);
    if (d <= 20) return { couvert: true, ligne: C[0], m3j: C[0].m3j };
    var ligne = C.filter(function (l) { return l.d === d; })[0];
    if (!ligne) return { couvert: false, motif: 'Diamètre de ' + d + ' mm absent du tableau de l\'annexe C : non couvert — à confirmer avec l\'autorité compétente.' };
    return { couvert: true, ligne: ligne, m3j: ligne.m3j };
  }

  var api = {
    evaluerChambre: evaluerChambre,
    evaluerComptage: evaluerComptage,
    preparationTuyauterie: preparationTuyauterie,
    evaluerDerivation: evaluerDerivation,
    evaluerElectrique: evaluerElectrique,
    consommationReputee: consommationReputee
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.CalculsB = api;
})(this);

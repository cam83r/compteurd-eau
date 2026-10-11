/*
 * Calculs des modules 1 (admissibilité, art. 2.1) et 2 (demande de pointe, annexes H et I).
 * Fonctions pures, sans accès au DOM : testées par tests/calculs.test.js.
 */
(function (root) {
  'use strict';

  var RCG = (typeof module !== 'undefined' && module.exports) ? require('./reglement.js') : root.RCG;
  var I = RCG.ANNEXE_I;

  function nombre(v) {
    var n = typeof v === 'string' ? parseFloat(v.replace(',', '.')) : Number(v);
    return isFinite(n) && n > 0 ? n : 0;
  }

  function contribution(item, valeur) {
    var v = nombre(valeur);
    return item.saisie === 'debit' ? v : v * item.unite;
  }

  // Q12 et Q13 d'un établissement (annexe I, étapes 2 à 4) et déclencheurs du cas 1.
  function calculerEtablissement(etab) {
    var saisies = etab.quantites || {};
    var q12 = 0, q13 = 0, raisonsCas1 = [];
    RCG.TABLEAU_12.forEach(function (item) {
      var c = contribution(item, saisies[item.id]);
      q12 += c;
      if (item.declencheCas1 && nombre(saisies[item.id]) > 0) raisonsCas1.push(item.libelle);
    });
    RCG.TABLEAU_13.forEach(function (item) {
      q13 += contribution(item, saisies[item.id]);
    });
    if (etab.usageCas1) raisonsCas1.unshift('Usage : ' + etab.usageCas1);
    return { q12: q12, q13: q13, cas1: raisonsCas1.length > 0, raisonsCas1: raisonsCas1 };
  }

  function dansPlage(q, p) {
    var okMin = p.minInclus ? q >= p.min : q > p.min;
    var okMax = p.max === Infinity || (p.maxInclus ? q <= p.max : q < p.max);
    return okMin && okMax;
  }

  // Annexe I, étape 5 : demande de pointe pondérée.
  function q12Pondere(q12, cas) {
    var notes = [];
    if (!(q12 > 0)) {
      notes.push('Q12 = 0 : plage non couverte par l\'annexe I (les plages commencent à « 0 < Q12 ») ; Q12P = 0 retenu — à confirmer.');
      return { valeur: 0, plage: null, formule: null, notes: notes, aConfirmer: true };
    }
    var plages = cas === 1 ? I.cas1 : I.cas2;
    var p = plages.filter(function (x) { return dansPlage(q12, x); })[0];
    var v = p.f(q12);
    var aConfirmer = false;
    if (v < 0) {
      notes.push('La formule donne une valeur négative (' + v.toFixed(4) + ') pour un Q12 très faible ; Q12P = 0 retenu — à confirmer.');
      v = 0;
      aConfirmer = true;
    }
    return { valeur: v, plage: p.plage, formule: p.formule, notes: notes, aConfirmer: aConfirmer };
  }

  // Comparaison au seuil de l'annexe I : 10 gal US/min, imprimé 2,3 m³/h (10 × 0,227 = 2,27).
  function verdictExemption(qpus) {
    var qpm = qpus * I.conversionM3hParUSGPM;
    if (qpus <= I.seuilUSGPM) return { statut: 'possible', qpm: qpm };
    if (qpm <= I.seuilImprimeM3h) return { statut: 'zone_grise', qpm: qpm };
    return { statut: 'non', qpm: qpm };
  }

  // Modules 2 : somme pour l'ensemble des établissements de l'immeuble.
  function calculerDemandePointe(etablissements) {
    var details = (etablissements || []).map(function (e) {
      var r = calculerEtablissement(e);
      r.id = e.id;
      r.nom = e.nom;
      return r;
    });
    var q12 = 0, q13 = 0, raisonsCas1 = [];
    details.forEach(function (d) {
      q12 += d.q12;
      q13 += d.q13;
      if (d.cas1) raisonsCas1.push({ etablissement: d.nom, raisons: d.raisonsCas1 });
    });
    var cas = raisonsCas1.length > 0 ? 1 : 2;
    var casCas1Partiel = cas === 1 && raisonsCas1.length < details.length;
    var pond = q12Pondere(q12, cas);
    var qpus = q13 + pond.valeur;
    var verdict = verdictExemption(qpus);
    return {
      etablissements: details,
      q12: q12,
      q13: q13,
      cas: cas,
      raisonsCas1: raisonsCas1,
      // Décision utilisateur (immeuble mixte) : cas 1 pour tout l'immeuble si un établissement le déclenche.
      casMixte: casCas1Partiel,
      q12p: pond,
      qpus: qpus,
      qpm: verdict.qpm,
      exemption: verdict.statut,
      inventaireVide: q12 === 0 && q13 === 0
    };
  }

  // Module 1 : admissibilité (art. 2.1). Réponses : 'oui' | 'non' | 'inconnu'.
  function evaluerAdmissibilite(rep, demande) {
    rep = rep || {};
    var motifs = [];
    var res = { statut: null, motifs: motifs, exemption: null };

    if (rep.usage === 'residentiel') {
      res.statut = 'non_assujetti';
      motifs.push({ texte: 'Immeuble utilisé uniquement à des fins résidentielles : aucun des cas 1° à 3° ne s\'applique.', ref: 'art2_1_al1' });
      return res;
    }
    if (rep.aucunBranchement === 'oui') {
      res.statut = 'non_requis';
      motifs.push({ texte: 'Aucun aménagement ou bâtiment n\'est relié à un branchement d\'eau : compteur non requis.', ref: 'art2_1_al2' });
      return res;
    }

    var criteres = [
      { cle: 'critere1', texte: '1° immeuble non résidentiel au rôle (classes 5 à 10, art. 244.32 LFM, ou art. 244.36, 244.51, 244.52)' },
      { cle: 'critere2', texte: '2° immeuble visé par l\'art. 204 LFM, par. 1 à 9 ou 11 à 19' },
      { cle: 'critere3', texte: '3° usage non résidentiel (en tout ou en partie), pas encore porté au rôle' }
    ];
    var oui = criteres.filter(function (c) { return rep[c.cle] === 'oui'; });
    var inconnus = criteres.filter(function (c) { return rep[c.cle] !== 'oui' && rep[c.cle] !== 'non'; });

    if (oui.length) {
      res.statut = 'assujetti';
      oui.forEach(function (c) { motifs.push({ texte: 'Critère rempli : ' + c.texte + '.', ref: 'art2_1_al1' }); });
    } else if (inconnus.length) {
      res.statut = 'a_confirmer';
      inconnus.forEach(function (c) { motifs.push({ texte: 'Réponse manquante : ' + c.texte + '.', ref: 'art2_1_al1' }); });
      motifs.push({ texte: 'Les articles de la Loi sur la fiscalité municipale ne sont pas reproduits dans le règlement : vérifier au rôle d\'évaluation.', ref: 'art2_1_al1' });
    } else {
      res.statut = 'non_assujetti';
      motifs.push({ texte: 'Aucun des cas 1° à 3° ne s\'applique.', ref: 'art2_1_al1' });
    }

    if (res.statut !== 'non_assujetti' && rep.partieResidentielle === 'oui') {
      var ex = { statut: null, pieces: [] };
      if (!demande || demande.inventaireVide) {
        ex.statut = 'inventaire_requis';
      } else {
        ex.statut = demande.exemption;
        ex.qpm = demande.qpm;
        ex.qpus = demande.qpus;
      }
      if (ex.statut === 'possible' || ex.statut === 'zone_grise') {
        ex.pieces = [
          { texte: 'Demande écrite d\'exemption adressée à l\'autorité compétente', ref: 'art2_1_al3' },
          { texte: 'Annexe D — Questionnaire : fiche d\'information, dûment complétée', ref: 'annD' },
          { texte: 'Annexe H — Inventaire, dûment complété (une fiche par point d\'installation)', ref: 'annH_12' }
        ];
      }
      res.exemption = ex;
    }
    return res;
  }

  // ---------- module 3 : sélection du compteur (art. 9 al. 3) ----------
  var DB = (typeof module !== 'undefined' && module.exports) ? require('./compteurs.js') : root.CompteursDB;

  // Perte de pression (psi) au débit q, par interpolation linéaire des points lus sur la fiche.
  function perteA(compteur, q) {
    var pts = compteur.perte;
    if (!pts) return { statut: 'inconnue' };
    var dernier = pts[pts.length - 1];
    if (q > dernier[0]) return { statut: 'hors_courbe', maxDebit: dernier[0] };
    for (var i = 1; i < pts.length; i++) {
      if (q <= pts[i][0]) {
        var a = pts[i - 1], b = pts[i];
        var psi = a[1] + (b[1] - a[1]) * (q - a[0]) / (b[0] - a[0]);
        return { statut: 'calculee', psi: psi, kpa: psi * DB.KPA_PAR_PSI };
      }
    }
    return { statut: 'calculee', psi: pts[0][1], kpa: pts[0][1] * DB.KPA_PAR_PSI };
  }

  // Critères de l'art. 9 al. 3 pour un compteur, à la demande de pointe q (USGPM).
  function evaluerCompteur(compteur, q, pertePermiseKpa) {
    var notes = [];
    var p = compteur.plageNormale;
    var gamme = q > p[1] ? 'depasse' : (q < p[0] ? 'sous' : 'ok');
    if (gamme === 'sous') notes.push('Demande de pointe sous la plage normale du compteur.');

    var perte = perteA(compteur, q);
    if (perte.statut === 'calculee') {
      if (pertePermiseKpa == null) perte.verdict = 'a_evaluer';
      else perte.verdict = perte.kpa <= pertePermiseKpa ? 'ok' : 'depasse';
    }

    if (DB.DIAMETRES_ANNEXE_B.indexOf(compteur.diametreMm) === -1) {
      notes.push('Diamètre ' + compteur.diametreMm + ' mm non prévu à l\'annexe B (préparation de tuyauterie de 20 mm minimum).');
    }
    if (compteur.diametreMm === 75) notes.push('75 mm (3 po) : prévu à l\'annexe B, mais les annexes A et C utilisent 80 mm.');
    if (compteur.technologie === 'electromagnetique' && compteur.diametreMm >= 50) {
      notes.push('Électromagnétique ≥ 50 mm : exigences d\'alimentation 120 V de l\'art. 12 si le compteur en est muni.');
    }

    var statut;
    if (gamme === 'depasse' || perte.statut === 'hors_courbe' || perte.verdict === 'depasse') statut = 'ecarte';
    else if (gamme === 'ok' && perte.verdict === 'ok') statut = 'conforme';
    else statut = 'sous_reserve';

    return { compteur: compteur, gamme: gamme, perte: perte, notes: notes, statut: statut };
  }

  // Évalue la base et propose, par technologie, le plus petit diamètre non écarté
  // parmi les diamètres de préparation prévus à l'annexe B.
  function selectionnerCompteurs(q, pertePermiseKpa, technologie) {
    var liste = DB.COMPTEURS
      .filter(function (c) { return !technologie || c.technologie === technologie; })
      .map(function (c) { return evaluerCompteur(c, q, pertePermiseKpa); })
      .sort(function (a, b) { return a.compteur.diametreMm - b.compteur.diametreMm; });
    var propositions = {};
    liste.forEach(function (r) {
      var t = r.compteur.technologie;
      var prevuAnnexeB = DB.DIAMETRES_ANNEXE_B.indexOf(r.compteur.diametreMm) !== -1;
      if (!propositions[t] && r.statut !== 'ecarte' && prevuAnnexeB) {
        propositions[t] = r;
        r.propose = true;
      }
    });
    return { evaluations: liste, propositions: propositions };
  }

  var api = {
    perteA: perteA,
    evaluerCompteur: evaluerCompteur,
    selectionnerCompteurs: selectionnerCompteurs,
    nombre: nombre,
    contribution: contribution,
    calculerEtablissement: calculerEtablissement,
    q12Pondere: q12Pondere,
    verdictExemption: verdictExemption,
    calculerDemandePointe: calculerDemandePointe,
    evaluerAdmissibilite: evaluerAdmissibilite
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Calculs = api;
})(this);

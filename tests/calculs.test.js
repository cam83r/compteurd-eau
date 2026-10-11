// Cas tests des modules 1 et 2 — exécuter : node tests/calculs.test.js
'use strict';
var assert = require('assert');
var C = require('../app/js/calculs.js');
var EXEMPLE = require('../app/js/exemple.js');

var echecs = 0, total = 0;
function test(nom, fn) {
  total++;
  try { fn(); console.log('  ok  ' + nom); }
  catch (e) { echecs++; console.log('  ÉCHEC  ' + nom + '\n        ' + e.message); }
}
function proche(a, b, tol) {
  assert.ok(Math.abs(a - b) <= (tol || 1e-9), a + ' ≠ ' + b);
}

console.log('Annexe I — formules Q12P (valeurs calculées à la main)');
test('cas 1, Q12 = 30 → Q12P = Q12', function () { proche(C.q12Pondere(30, 1).valeur, 30); });
test('cas 1, Q12 = 45 (borne incluse, 2e formule) → 44,25925', function () { proche(C.q12Pondere(45, 1).valeur, 44.25925); });
test('cas 1, Q12 = 100 → 50,345', function () { proche(C.q12Pondere(100, 1).valeur, 50.345); });
test('cas 1, Q12 = 1250 (borne incluse, 2e formule) → 136,02', function () { proche(C.q12Pondere(1250, 1).valeur, 136.02); });
test('cas 1, Q12 = 2000 → 142,4', function () { proche(C.q12Pondere(2000, 1).valeur, 142.4); });
test('cas 1, Q12 = 20000 → 268,6', function () { proche(C.q12Pondere(20000, 1).valeur, 268.6); });
test('cas 2, Q12 = 10 → 8,636', function () { proche(C.q12Pondere(10, 2).valeur, 8.636); });
test('cas 2, Q12 = 25 (borne incluse, 2e formule) → 18,04125', function () { proche(C.q12Pondere(25, 2).valeur, 18.04125); });
test('cas 2, Q12 = 2000 → 70,124', function () { proche(C.q12Pondere(2000, 2).valeur, 70.124); });
test('Q12 = 0 → 0, à confirmer', function () {
  var r = C.q12Pondere(0, 2); proche(r.valeur, 0); assert.ok(r.aConfirmer);
});
test('cas 2, Q12 = 0,1 → formule négative ramenée à 0, à confirmer', function () {
  var r = C.q12Pondere(0.1, 2); proche(r.valeur, 0); assert.ok(r.aConfirmer);
});

console.log('Seuil d\'exemption (zone grise 2,27–2,3 m³/h)');
test('QPUS = 10 → QPM 2,27 → possible', function () { assert.strictEqual(C.verdictExemption(10).statut, 'possible'); });
test('QPUS = 10,1 → QPM 2,2927 → zone grise', function () { assert.strictEqual(C.verdictExemption(10.1).statut, 'zone_grise'); });
test('QPUS = 10,2 → QPM 2,3154 → non', function () { assert.strictEqual(C.verdictExemption(10.2).statut, 'non'); });

console.log('Cas 1 / cas 2 et immeuble mixte');
test('toilette à soupape → cas 1', function () {
  var d = C.calculerDemandePointe([{ nom: 'A', quantites: { wc_soupape: 1 } }]);
  assert.strictEqual(d.cas, 1); proche(d.q12, 35);
});
test('usage hôtel → cas 1', function () {
  var d = C.calculerDemandePointe([{ nom: 'A', usageCas1: 'hôtel', quantites: { lavabo: 2 } }]);
  assert.strictEqual(d.cas, 1);
});
test('un établissement cas 1 + un cas 2 → cas 1 pour l\'immeuble, signalé mixte', function () {
  var d = C.calculerDemandePointe([
    { nom: 'A', quantites: { urinoir_soupape: 1 } },
    { nom: 'B', quantites: { lavabo: 1 } }
  ]);
  assert.strictEqual(d.cas, 1); assert.ok(d.casMixte); proche(d.q12, 11.5); proche(d.q12p.valeur, 11.5);
});
test('saisie « débit » (irrigation) compte le débit inscrit, pas quantité × unité', function () {
  var d = C.calculerDemandePointe([{ nom: 'A', quantites: { irrigation: 12.5 } }]);
  proche(d.q13, 12.5);
});

console.log('Jeu d\'exemple (docs/jeu_exemple.md)');
var dEx = C.calculerDemandePointe(EXEMPLE.etablissements);
test('Café : Q12 = 12,5 ; Q13 = 1,68', function () { proche(dEx.etablissements[0].q12, 12.5); proche(dEx.etablissements[0].q13, 1.68); });
test('Salon : Q12 = 19,5 ; Q13 = 0', function () { proche(dEx.etablissements[1].q12, 19.5); proche(dEx.etablissements[1].q13, 0); });
test('Immeuble : Q12 = 32, cas 2, plage 25–1250', function () {
  proche(dEx.q12, 32); assert.strictEqual(dEx.cas, 2); assert.strictEqual(dEx.q12p.plage, '25 ≤ Q12 ≤ 1 250');
});
test('Q12P = 18,55288 ; QPUS = 20,23288 ; QPM = 4,59286376', function () {
  proche(dEx.q12p.valeur, 18.55288); proche(dEx.qpus, 20.23288); proche(dEx.qpm, 4.59286376);
});
test('Exemption : non', function () { assert.strictEqual(dEx.exemption, 'non'); });
test('Admissibilité : assujetti, exemption refusée', function () {
  var a = C.evaluerAdmissibilite(EXEMPLE.admissibilite, dEx);
  assert.strictEqual(a.statut, 'assujetti'); assert.strictEqual(a.exemption.statut, 'non');
});

console.log('Variantes documentées');
test('Variante A — café seul sans lave-vaisselle ni réfrigérateur : QPM 1,8714 → exemption possible', function () {
  var d = C.calculerDemandePointe([{ nom: 'Café', quantites: { wc_reservoir: 1, lavabo: 1, evier_com: 1 } }]);
  proche(d.q12, 9.5); proche(d.q12p.valeur, 8.244125); proche(d.qpm, 1.871416375);
  var a = C.evaluerAdmissibilite(EXEMPLE.admissibilite, d);
  assert.strictEqual(a.exemption.statut, 'possible'); assert.strictEqual(a.exemption.pieces.length, 3);
});
test('Variante B — résidentiel seulement → non assujetti', function () {
  assert.strictEqual(C.evaluerAdmissibilite({ usage: 'residentiel' }).statut, 'non_assujetti');
});
test('Variante C — aucun bâtiment relié → non requis', function () {
  assert.strictEqual(C.evaluerAdmissibilite({ usage: 'commerciale', aucunBranchement: 'oui', critere1: 'oui' }).statut, 'non_requis');
});
test('Variante D — critères inconnus → à confirmer', function () {
  assert.strictEqual(C.evaluerAdmissibilite({ usage: 'commerciale', critere1: 'non' }).statut, 'a_confirmer');
});
test('Variante E — mixte sans inventaire → inventaire requis', function () {
  var a = C.evaluerAdmissibilite(EXEMPLE.admissibilite, C.calculerDemandePointe([]));
  assert.strictEqual(a.exemption.statut, 'inventaire_requis');
});

console.log('Module 3 — sélection du compteur (fiches fabricants, lecture graphique)');
var DB = require('../app/js/compteurs.js');
function cpt(id) { return DB.COMPTEURS.filter(function (c) { return c.id === id; })[0]; }
var q = dEx.qpus; // 20,23288 USGPM
test('T-10 3/4 à 20,23288 gpm : 4,870563 psi (interpolation 18,1→4 / 23→6)', function () {
  proche(C.perteA(cpt('T_10_3_4'), q).psi, 4 + 2 * (q - 18.1) / 4.9);
  proche(C.perteA(cpt('T_10_3_4'), q).kpa, (4 + 2 * (q - 18.1) / 4.9) * 6.894757);
});
test('iPERL 3/4 à 20,23288 gpm : 2,9558912 psi', function () { proche(C.perteA(cpt('iPERL_3_4'), q).psi, 2.9558912); });
test('T-10 1 po à 20,23288 gpm : 1,686073 psi', function () { proche(C.perteA(cpt('T_10_1'), q).psi, q * 2 / 24); });
test('MACH 10 : perte inconnue → sous réserve', function () {
  var r = C.evaluerCompteur(cpt('MACH_10_C_I_3'), q, 30); assert.strictEqual(r.perte.statut, 'inconnue'); assert.strictEqual(r.statut, 'sous_reserve');
});
test('Exemple (perte admissible 380 − 350 = 30 kPa) : T-10 3/4 écarté (33,58 kPa), T-10 1 po proposé', function () {
  var s = C.selectionnerCompteurs(q, 30);
  var t34 = s.evaluations.filter(function (r) { return r.compteur.id === 'T_10_3_4'; })[0];
  assert.strictEqual(t34.statut, 'ecarte');
  assert.strictEqual(s.propositions.volumetrique.compteur.id, 'T_10_1');
  assert.strictEqual(s.propositions.volumetrique.statut, 'conforme');
});
test('Exemple : iPERL 3/4 proposé (20,38 kPa ≤ 30)', function () {
  assert.strictEqual(C.selectionnerCompteurs(q, 30).propositions.electromagnetique.compteur.id, 'iPERL_3_4');
});
test('5/8 po (15 mm) jamais proposé : hors annexe B', function () {
  var s = C.selectionnerCompteurs(5, 100);
  assert.notStrictEqual(s.propositions.volumetrique.compteur.diametreMm, 15);
  var r = s.evaluations.filter(function (x) { return x.compteur.id === 'T_10_5_8'; })[0];
  assert.ok(r.notes.join(' ').indexOf('annexe B') > -1);
});
test('Sans pressions saisies → perte « à évaluer », sous réserve', function () {
  var r = C.evaluerCompteur(cpt('T_10_1'), q, null); assert.strictEqual(r.perte.verdict, 'a_evaluer'); assert.strictEqual(r.statut, 'sous_reserve');
});
test('600 gpm : T-10 2 po et MACH 10 3 po écartés, MACH 10 4 po proposé', function () {
  var s = C.selectionnerCompteurs(600, null);
  assert.strictEqual(s.propositions.ultrasonique.compteur.id, 'MACH_10_C_I_4');
  assert.ok(!s.propositions.volumetrique);
});

console.log('Modules 4 à 7 — branchements');
var B = require('../app/js/branchements.js');
var b1 = EXEMPLE.branchements[0], b2 = EXEMPLE.branchements[1];
var ch1 = B.evaluerChambre(b1, EXEMPLE.immeuble, 2), ch2 = B.evaluerChambre(b2, EXEMPLE.immeuble, 2);
test('Exemple B1 : 3 joints → chambre non requise', function () { assert.strictEqual(ch1.statut, 'non_requise'); });
test('Exemple B2 : 8 joints, existant → option a) chambre ou b) rapport annuel', function () {
  assert.strictEqual(ch2.statut, 'option'); assert.strictEqual(ch2.options.length, 2);
});
test('Exemple B2 : combiné → séparation incendie dans la chambre (art. 7), croquis 006', function () {
  assert.ok(ch2.separationIncendie); assert.strictEqual(ch2.croquis.code, '006');
});
test('Nouveau branchement, 6 joints → chambre requise', function () {
  assert.strictEqual(B.evaluerChambre({ type: 'potable', neuf: 'nouveau', joints: 6 }, {}, 1).statut, 'requise');
});
test('Cuivre K soudé à l\'argent, 12 joints → art. 6, non requise', function () {
  assert.strictEqual(B.evaluerChambre({ type: 'potable', neuf: 'nouveau', joints: 12, cuivreKArgent: 'oui' }, {}, 1).statut, 'non_requise');
});
test('Réseau privé avec 2 branchements → chambre requise (art. 8.1), même avec cuivre K', function () {
  assert.strictEqual(B.evaluerChambre({ type: 'potable', joints: 0, cuivreKArgent: 'oui' }, { reseauPrive: 'oui' }, 2).statut, 'requise');
});
test('Joints non renseignés → à confirmer', function () {
  assert.strictEqual(B.evaluerChambre({ type: 'potable' }, {}, 1).statut, 'a_confirmer');
});
test('Exemple B1 : aucun établissement → aucun compteur I.C.I.', function () {
  assert.strictEqual(B.evaluerComptage(b1, ch1, 'oui').statut, 'aucun');
});
test('Exemple B2 : compteur requis, sur l\'entrée d\'eau', function () {
  var c = B.evaluerComptage(b2, ch2, 'oui'); assert.strictEqual(c.statut, 'requis'); assert.ok(c.points[0].indexOf('entrée d\'eau') > -1);
});
test('Incendie → aucun compteur (art. 3)', function () { assert.strictEqual(B.evaluerComptage({ type: 'incendie' }, null, '').statut, 'aucun'); });
test('Résidentiel + séparation dans une autre pièce → un seul compteur (art. 4)', function () {
  var c = B.evaluerComptage({ type: 'potable', dessertEtablissements: 'oui', dessertResidentiel: 'oui', separationAutrePiece: 'oui' }, null, 'oui');
  assert.ok(c.motifs.some(function (m) { return m.ref === 'art4'; }));
});
test('3 bâtiments, chambre requise, un propriétaire, sans résidentiel → un seul compteur (art. 8)', function () {
  var c = B.evaluerComptage({ type: 'potable', dessertEtablissements: 'oui', dessertResidentiel: 'non', nbBatiments: 3, memeProprietaire: 'oui' }, { statut: 'requise' }, 'non');
  assert.ok(c.unSeulCompteurBatiments);
});
test('Idem avec usage résidentiel → art. 8 non applicable', function () {
  var c = B.evaluerComptage({ type: 'potable', dessertEtablissements: 'oui', dessertResidentiel: 'non', nbBatiments: 3, memeProprietaire: 'oui' }, { statut: 'requise' }, 'oui');
  assert.ok(!c.unSeulCompteurBatiments);
});
test('Combiné, 3 bâtiments, chambre requise → un seul compteur (art. 8.01) même avec résidentiel', function () {
  var c = B.evaluerComptage({ type: 'combine', dessertEtablissements: 'oui', dessertResidentiel: 'oui', nbBatiments: 3, memeProprietaire: 'oui' }, { statut: 'requise' }, 'oui');
  assert.ok(c.unSeulCompteurBatiments);
});
test('Préparation 25 mm : croquis 001, pièce de transition 273 mm, dégagements 300/100/125/125', function () {
  var p = B.preparationTuyauterie(25); assert.strictEqual(p.length, 1);
  assert.strictEqual(p[0].ligne.transition, 273); assert.deepStrictEqual([p[0].ligne.A, p[0].ligne.B, p[0].ligne.C, p[0].ligne.D], [300, 100, 125, 125]);
});
test('Préparation 50 mm : croquis 001 et 002', function () { assert.strictEqual(B.preparationTuyauterie(50).length, 2); });
test('Préparation 150 mm : LD 1810, LS 685', function () { var l = B.preparationTuyauterie(150)[0].ligne; assert.strictEqual(l.LD, 1810); assert.strictEqual(l.LS, 685); });
test('Dérivation 25 mm, usage hors annexe G → interdite', function () { assert.strictEqual(B.evaluerDerivation(25, 100, '').statut, 'interdite'); });
test('Dérivation 25 mm, clinique 6517, branchement 40 mm → permise (art. 11)', function () { assert.strictEqual(B.evaluerDerivation(25, 40, '6517').statut, 'permise'); });
test('Dérivation 25 mm, clinique 6517, branchement 50 mm → interdite', function () { assert.strictEqual(B.evaluerDerivation(25, 50, '6517').statut, 'interdite'); });
test('Dérivation 100 mm → obligatoire ; 50 mm → à confirmer', function () {
  assert.strictEqual(B.evaluerDerivation(100, 100, '').statut, 'obligatoire'); assert.strictEqual(B.evaluerDerivation(50, 50, '').statut, 'a_confirmer');
});
test('Art. 12 : électromagnétique 100 mm, 120 V, en chambre → 9 exigences', function () {
  var e = B.evaluerElectrique('electromagnetique', 100, 'oui', true); assert.strictEqual(e.statut, 'applicable'); assert.strictEqual(e.exigences.length, 9);
});
test('Art. 12 : volumétrique ou électromagnétique 25 mm → non applicable', function () {
  assert.strictEqual(B.evaluerElectrique('volumetrique', 100, 'oui', true).statut, 'non_applicable');
  assert.strictEqual(B.evaluerElectrique('electromagnetique', 25, 'oui', true).statut, 'non_applicable');
});
test('Annexe C : 50 mm → 530 m³/j ; inconnu → 86 ; 15 mm → 86', function () {
  assert.strictEqual(B.consommationReputee(50).m3j, 530); assert.strictEqual(B.consommationReputee('').m3j, 86); assert.strictEqual(B.consommationReputee(15).m3j, 86);
});
test('Annexe C : 75 mm et 400 mm → non couverts', function () {
  assert.strictEqual(B.consommationReputee(75).couvert, false); assert.strictEqual(B.consommationReputee(400).couvert, false);
});

console.log('\n' + (total - echecs) + '/' + total + ' tests réussis');
process.exit(echecs ? 1 : 0);

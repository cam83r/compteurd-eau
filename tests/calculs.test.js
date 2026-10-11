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

console.log('\n' + (total - echecs) + '/' + total + ' tests réussis');
process.exit(echecs ? 1 : 0);

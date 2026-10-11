# Jeu de données d'exemple — résultats attendus

Immeuble **fictif** (`app/js/exemple.js`), chargé par le bouton « Charger l'exemple ».
Les résultats ci-dessous sont vérifiés automatiquement par `node tests/calculs.test.js`.

## Données

- 1234, rue de l'Exemple (fictive), LaSalle — vocation commerciale, **6 logements** (partie résidentielle).
- Critère art. 2.1 al. 1, 1° : oui (fictif) ; 2° : non ; 3° : non. Bâtiment relié à un branchement.
- Branchements (pour les modules 4 à 7) : B1 potable 50 mm cuivre ; B2 combiné 150 mm fonte.

| Établissement | Appareils (annexe H) | Q12 (USGPM) | Q13 (USGPM) |
|---|---|---|---|
| Café du coin | 1 toilette à réservoir (4), 1 lavabo (1,5), 1 évier commercial (4), 1 lave-vaisselle commercial (3) ; réfrigérateur refroidi à l'eau 2 HP (2 × 0,84) | 12,5 | 1,68 |
| Salon de coiffure | 1 toilette à réservoir (4), 1 lavabo (1,5), 2 éviers commerciaux ou de service (8), 1 machine à laver (6) | 19,5 | 0 |

## Module 2 — demande de pointe (annexe I)

| Étape | Calcul | Résultat | Réf. |
|---|---|---|---|
| Q12 | 12,5 + 19,5 | 32 USGPM | ann. I, étape 3 |
| Q13 | 1,68 + 0 | 1,68 USGPM | ann. I, étape 4 |
| Cas | aucune soupape de chasse, aucun usage listé | cas 2 | ann. I, étape 5 |
| Plage | 25 ≤ 32 ≤ 1 250 | 2e formule du cas 2 | ann. I, étape 5 |
| Q12P | −3×10⁻⁵ × 32² + 0,0748 × 32 + 16,19 = −0,03072 + 2,3936 + 16,19 | **18,55288** | ann. I, étape 5 |
| QPUS | 1,68 + 18,55288 | **20,23288** USGPM | ann. I |
| QPM | 20,23288 × 0,227 | **4,593 m³/h** | ann. I |

## Module 1 — admissibilité

- Statut : **assujetti** (art. 2.1 al. 1, 1°).
- Exemption (art. 2.1 al. 3) : **non admissible** — QPM 4,593 m³/h > 2,3 m³/h.

## Variantes (tests)

| Variante | Entrée | Résultat attendu |
|---|---|---|
| A | Café seul : toilette à réservoir, lavabo, évier commercial (Q12 = 9,5, cas 2, 1re formule) | Q12P = 8,244125 ; QPM = 1,8714 m³/h → **exemption possible**, 3 pièces (demande écrite, annexe D, annexe H) |
| B | Résidentiel uniquement | **non assujetti** |
| C | Aucun bâtiment relié | **compteur non requis** (art. 2.1 al. 2) |
| D | Critère 1° « non », 2° et 3° sans réponse | **à confirmer** |
| E | Immeuble mixte sans inventaire | **inventaire requis** |
| F | QPUS = 10,1 USGPM | QPM = 2,2927 → **zone grise** |
| G | Un établissement avec urinoir à soupape + un avec lavabo | **cas 1** pour l'immeuble, signalé « à confirmer » |

## Décisions de projet appliquées (validées par l'utilisateur)

1. **Seuil d'exemption** : QPUS ≤ 10 gal US/min (QPM ≤ 2,27 m³/h) → possible ; 2,27 < QPM ≤ 2,3 → zone grise « à confirmer avec l'autorité » ; > 2,3 → non.
2. **Immeuble mixte** : si un établissement relève du cas 1, le cas 1 s'applique à l'ensemble de l'immeuble (signalé « à confirmer »).
3. **Annexe C** : diamètres absents du tableau → « non couvert — à confirmer » (module 7).

Règles techniques signalées « à confirmer » dans l'interface : Q12 = 0 → Q12P = 0 ; résultat négatif d'une formule → 0.

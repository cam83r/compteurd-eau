# Jeu de données d'exemple — résultats attendus

Immeuble **fictif** (`app/js/exemple.js`), chargé par le bouton « Charger l'exemple ».
Les résultats ci-dessous sont vérifiés automatiquement par `node tests/calculs.test.js`.

## Données

- 1234, rue de l'Exemple (fictive), LaSalle — vocation commerciale, **6 logements** (partie résidentielle).
- Critère art. 2.1 al. 1, 1° : oui (fictif) ; 2° : non ; 3° : non. Bâtiment relié à un branchement.
- Branchements : B1 potable 50 mm cuivre, existant, 3 joints, dessert seulement les logements ; B2 combiné 100 mm fonte, existant, 8 joints, dessert les gicleurs et les deux établissements. Pas de réseau privé.

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

## Module 3 — sélection du compteur

Demande : QPUS = 20,23288 USGPM (module 2). Pressions **fictives** : disponible 380 kPa, requise 350 kPa → perte admissible **30 kPa** (4,35 psi).

| Compteur | Perte à 20,23 gpm (interpolation) | Résultat |
|---|---|---|
| T-10 3/4" | 4 + 2 × (20,23288 − 18,1) / 4,9 = 4,871 psi = **33,58 kPa** | écarté (> 30) |
| T-10 1" | 2 × 20,23288 / 24 = 1,686 psi = **11,63 kPa** | **proposé (volumétrique)** |
| iPERL 3/4" | 2,9 + 1,2 × 0,23288 / 5 = 2,956 psi = **20,38 kPa** | **proposé (électromagnétique)** |
| iPERL 5/8" | 6,0 + 2,8 × 0,23288 / 5 = 6,13 psi = 42,3 kPa | écarté |
| MACH 10 3" | perte non disponible | proposé **sous réserve** (ultrasonique) |

Variante : 600 gpm saisis → T-10 2" et MACH 10 3" écartés (plage) ; MACH 10 4" proposé sous réserve.

### Bilan de pression (CNP 2020, fig. A-2.6.3.1. 2)-B) — valeurs fictives

565 kPa − 25 = **540 kPa** ; compteur proposé iPERL 3/4 (20,38 kPa) + autres dispositifs 15 + hauteur 3,5 m × 9,81 = 34,3 + robinet 105 → disponible **365,3 kPa** ; ÷ (76 m × 1,5 = 114 m) = **3,2 kPa/m ≥ 2,6** ; perte maximale du compteur **89,3 kPa** ; alerte réducteur (565 > 550 kPa, CNP 2.6.3.3.).

## Module 4 — nombre et emplacement

| Branchement | Résultat | Réf. |
|---|---|---|
| B1 | Aucun compteur de consommation I.C.I. (aucun établissement desservi) — à confirmer | art. 3 ; ann. D § 1.7 |
| B2 | Compteur requis, sur la conduite d'eau potable après séparation de l'incendie ; dans la chambre si l'option a) est retenue | art. 3 ; ann. B, A2 |

## Module 5 — chambre de compteur

| Branchement | Résultat | Réf. |
|---|---|---|
| B1 | 3 joints ≤ 5 → chambre non requise | art. 5 |
| B2 | 8 joints > 5, existant → a) construire une chambre ou b) rapport annuel de détection de fuite ; séparation incendie dans la chambre ; croquis 006 | art. 5, 7 ; ann. B |

## Module 6 — préparation et installation (B2, compteur 25 mm volumétrique)

- Croquis 001 : pièce de transition 273 mm (10 3/4 po), fileté 1 1/4 po mâle ; union de compteur 25 mm ; dégagements 300 / 100 / 125 / 125 mm.
- Dérivation : **interdite** (usage hors annexe G) — art. 11 ; ann. B, croquis 001, A7.
- Art. 12 : non applicable (compteur volumétrique).

## Module 7 — consommation réputée

Entrée d'eau domestique 50 mm (fictif) → **530 m³/jour** (annexe C) ; 30 jours (fictif) → **15 900 m³**.

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

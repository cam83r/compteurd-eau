# Données compteurs (module 3) — sources et lectures

Le RCG 07-031 ne fournit ni gamme de débit ni perte de pression (art. 9 al. 3). Les données
ci-dessous proviennent des fiches fournies par l'utilisateur, copiées dans `docs/fiches/`.
Code : `app/js/compteurs.js`.

## Sources

| Fichier | Document | Plages | Pertes |
|---|---|---|---|
| `Neptune_T-10_5-8_a_1po.pdf` | Neptune PS T10 SMALL 05.11 (© 2011) | p. 4 (texte) | p. 3 (graphiques) |
| `Neptune_T-10_1.5-2po.pdf` | Neptune 21-006205 PS T-10 INTERMEDIATE 11.21 (© 2021) | p. 3 (texte) | p. 2 (graphiques) |
| `Sensus_iPERL.pdf` | Sensus WDS-10006-05 (© 2019) | p. 3 (texte) | p. 4 (graphiques) |
| `Neptune_MACH-10_C_et_I_3-12po.pdf` | Guide d'installation et d'entretien, Part No 12287-0001 (© 2020-2026), tableaux 2 et 8 | p. 19 et 26 (texte) | **aucune** |

⚠ Le PDF MACH 10 fourni est le **guide d'installation**, pas la fiche produit : il ne contient pas de
courbe de perte de pression. Il faudrait la fiche produit « PS MACH 10 C&I ».

## Plages (texte des fiches — exact)

| Compteur | Plage normale (gpm) | Bas débit (gpm) | Autres |
|---|---|---|---|
| T-10 5/8" | 1/2 – 20 (±1,5 %) | 1/8 (95 %) | AWWA 1–20 ; 150 psi |
| T-10 3/4" | 3/4 – 30 | 1/4 | AWWA 2–30 |
| T-10 1" | 1 – 50 | 3/8 | AWWA 3–50 |
| T-10 1½" | 2 – 100 | 3/4 | AWWA 5–100 |
| T-10 2" | 2½ – 160 | 1 | AWWA 8–160 |
| iPERL 5/8" | 0,18 – 25 (±1,5 %) | > 0,11 (±3 %) ; démarrage 0,03 | 200 psi ; eau 0,55–26,7 °C |
| iPERL 3/4" | 0,18 – 35 | > 0,11 ; démarrage 0,03 | 200 psi |
| iPERL 1" | 0,4 – 55 | > 0,3 ; démarrage 0,11 | 175 psi |
| MACH 10 3" | 0,75 – 500 | 0,50 (±3 %) | incendie 420 ; 175 psi |
| MACH 10 4" | 1,5 – 1 250 | 0,75 | incendie 1 100 |
| MACH 10 6" | 2 – 2 000 | 1,0 | incendie 1 800 |
| MACH 10 8" | 6 – 4 000 | 4,0 | incendie 4 000 |
| MACH 10 10" | 10 – 6 500 | 6,0 | incendie 6 500 |
| MACH 10 12" | 12 – 8 000 | 8,0 | incendie 8 000 |

## Pertes de pression — lecture graphique (à confirmer, ≈ ±0,2 psi)

Points [gpm → psi] relevés aux croisements de la courbe et du quadrillage ; interpolation linéaire entre les points.

| Compteur | Points lus |
|---|---|
| T-10 5/8" | 5 → 0,5 ; 10 → 2 ; 14 → 4 ; 17,2 → 6 ; 20 → 8 |
| T-10 3/4" | 13 → 2 ; 18,1 → 4 ; 23 → 6 ; 27 → 8 ; 30 → 10 |
| T-10 1" | 24 → 2 ; 34 → 4 ; 42 → 6 ; 50 → 8 |
| T-10 1½" | 10 → 0 ; 44 → 2 ; 64 → 4 ; 80 → 6 ; 92 → 8 ; 100 → 9,9 |
| T-10 2" | 10 → 0,1 ; 70 → 2 ; 105 → 4 ; 125 → 6 ; 145 → 8 ; 160 → 9,8 |
| iPERL 5/8" | 5 → 0,9 ; 10 → 2,2 ; 15 → 3,9 ; 20 → 6,0 ; 25 → 8,8 |
| iPERL 3/4" | 5 → 0,45 ; 10 → 1,05 ; 15 → 1,9 ; 20 → 2,9 ; 25 → 4,1 ; 30 → 5,6 ; 35 → 7,3 |
| iPERL 1" | 0 → 0,45 ; 10 → 0,7 ; 20 → 1,5 ; 30 → 2,7 ; 40 → 4,3 ; 50 → 6,4 ; 55 → 7,7 |
| MACH 10 | non disponible |

1 psi = 6,894757 kPa.

## Règles de sélection appliquées (art. 9 al. 3)

1. **Gamme de débit** : demande de pointe ≤ maximum de la plage normale (sinon écarté) ; sous le minimum → « sous réserve ».
2. **Perte de pression** : perte à la demande ≤ perte admissible = pression disponible − pression requise
   (saisies par le concepteur ; le règlement ne fixe aucune valeur). Sans pressions → « sous réserve ».
   Demande au-delà de la courbe → écarté. Perte absente de la source → « sous réserve, à confirmer ».
3. **Type** : proposition du plus petit diamètre non écarté **par technologie**, parmi les diamètres
   de préparation de l'annexe B (20 à 300 mm) ; les 5/8" (15 mm) sont affichés mais jamais proposés.
4. Rappel : la Ville fournit le compteur (art. 2) et l'autorité compétente en détermine le type et la dimension (art. 9).

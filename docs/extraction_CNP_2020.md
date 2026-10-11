# Extraction — CNP 2020 (CCQ, chapitre III — Plomberie, modifié Québec)

Source : `cam83r/CNP`, fichier « CCQ Chapitre III – Plomberie, et CNP – Canada 2020 (modifié).pdf » (272 pages).
Pages lues en image : 151 à 155 (articles 2.6.3.) et 231 à 241 (notes A-2.6.3.).

## Articles utilisés

| Article | Contenu | Usage dans l'outil |
|---|---|---|
| 2.6.3.1. 1) | Réseau conçu pour assurer le débit de pointe avec une pression aux appareils conforme aux **spécifications du fabricant** de la robinetterie | Pression minimale du robinet le plus éloigné : saisie (fabricant) |
| 2.6.3.1. 2) | Conception selon les manuels ASHRAE et ASPE | Mention |
| 2.6.3.2. | Charge hydraulique en **facteurs d'alimentation** (tableaux 2.6.3.2.-A à -D) | Non utilisé (voir ci-dessous) |
| 2.6.3.3. | Pression statique > 550 kPa → réducteur de pression | Alerte du bilan |
| 2.6.3.4. 1) | DN du branchement général fonction du débit de pointe, jamais < 3/4 | Mention |
| 2.6.3.5. | Vitesse ≤ 3,0 m/s et recommandations du fabricant | Mention |
| 2.2.1.6. | Pression de service du branchement ≥ pression maximale de la conduite principale (autorité) | — |

## Note A-2.6.3.1. 2) — méthode de la perte de pression moyenne (figure A-2.6.3.1. 2)-B)

1. Pression ajustée au point d'entrée = pression statique minimale à la limite de propriété − pertes du branchement d'eau général.
2. Pression disponible pour les pertes de charge = pression ajustée − (compteurs, RP, DA, traitement, autres dispositifs + hauteur + pression de service minimale du robinet le plus éloigné).
3. ÷ (longueur développée × 1,5 pour les raccords) → doit être **≥ 2,6 kPa/m**, sinon méthode détaillée de conception technique.

Exemple du CNP : 565 − 25 = 540 kPa ; 540 − (20 + 35 + 105) = 380 kPa ; 380 ÷ 114 m = 3,3 kPa/m — reproduit par les tests.

Tableaux A-2.6.3.1. 2)-A (méthode des petits bâtiments : usages A, D, E, F div. 2 ou 3, ≤ 3 étages, ≤ 600 m²) et
A-2.6.3.1. 2)-F (diamètre selon facteurs d'alimentation et vitesse) : lus, **non intégrés** (dimensionnement de la tuyauterie,
hors du périmètre du compteur).

## Ce que le CNP ne contient pas

- **Aucune courbe de Hunter** ni conversion facteurs d'alimentation → débit (L/s) : renvoi aux manuels ASHRAE/ASPE.
  Le tableau A-2.6.3.1. 2)-F associe L/s et facteurs d'alimentation par diamètre et vitesse, mais ce n'est pas une
  courbe de demande unique : non utilisé comme conversion.
- **Aucune pression minimale par appareil** (fabricant).
- Pertes des compteurs, DAR et réducteurs : fabricants.

## Décision d'implantation

Le bilan de pression est ajouté au module 3. Il calcule la perte maximale du compteur qui conserve 2,6 kPa/m et peut
transférer ces pressions au critère de perte de pression du compteur. La hauteur est convertie à 9,81 kPa/m
(conversion physique, non tirée du CNP).

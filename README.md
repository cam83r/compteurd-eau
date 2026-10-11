# Sélection de compteurs d'eau — RCG 07-031

Application web d'aide à la sélection et au dimensionnement des compteurs d'eau selon le
Règlement RCG 07-031 de la Ville de Montréal (codification au 23 décembre 2025).

> Outil d'aide à la décision — la détermination du type et de la dimension du compteur revient à
> l'autorité compétente (art. 9, RCG 07-031). La conformité finale doit être validée par un
> professionnel contre le texte officiel.

## Utilisation

Ouvrir `app/index.html` dans un navigateur (version publiée : `node scripts/build-artifact.js` produit `dist/compteurs-eau.html`). Aucune installation ni compilation. Le projet est
enregistré dans le navigateur et peut être exporté ou importé en JSON.

## État des modules

| Module | État |
|---|---|
| 1. Admissibilité (art. 2.1) | ✅ |
| 2. Demande de pointe (annexes H et I) | ✅ |
| 3. Sélection du compteur (art. 9) | ✅ base : Neptune T-10, Sensus iPERL, Neptune MACH 10 (perte MACH 10 manquante) |
| 4. Nombre et emplacement (art. 3, 4, 8, 8.01) | ✅ |
| 5. Chambre de compteur (art. 5 à 7, 8.1, annexe B) | ✅ |
| 6. Préparation et installation (art. 9, 11, 12, annexes B, E, G) | ✅ |
| 7. Consommation réputée (art. 13, annexe C) | ✅ |

## Documents

- `docs/extraction_RCG_07-031.md` — extraction normative et écarts avec la spécification.
- `docs/jeu_exemple.md` — jeu d'exemple et résultats attendus.
- `docs/donnees_compteurs.md` — données compteurs, sources et lectures graphiques.
- `docs/fiches/` — fiches fabricants fournies.

## Tests

```
node tests/calculs.test.js
```

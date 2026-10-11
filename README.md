# Sélection de compteurs d'eau — RCG 07-031

Application web d'aide à la sélection et au dimensionnement des compteurs d'eau selon le
Règlement RCG 07-031 de la Ville de Montréal (codification au 23 décembre 2025).

> Outil d'aide à la décision — la détermination du type et de la dimension du compteur revient à
> l'autorité compétente (art. 9, RCG 07-031). La conformité finale doit être validée par un
> professionnel contre le texte officiel.

## Utilisation

Ouvrir `app/index.html` dans un navigateur. Aucune installation ni compilation. Le projet est
enregistré dans le navigateur et peut être exporté ou importé en JSON.

## État des modules

| Module | État |
|---|---|
| 1. Admissibilité (art. 2.1) | ✅ |
| 2. Demande de pointe (annexes H et I) | ✅ |
| 3. Sélection du compteur (art. 9) | ⏳ en attente des données compteurs (gamme de débit, perte de pression) |
| 4 à 7 | ⏳ à venir |

## Documents

- `docs/extraction_RCG_07-031.md` — extraction normative et écarts avec la spécification.
- `docs/jeu_exemple.md` — jeu d'exemple et résultats attendus.
- `docs/sources_compteurs_candidates.md` — données de fabricants trouvées, **non validées**.

## Tests

```
node tests/calculs.test.js
```

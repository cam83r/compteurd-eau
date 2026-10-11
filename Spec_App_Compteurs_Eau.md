# Spécification — Application visuelle de sélection de compteurs d'eau (RCG 07-031)

## 1. Contexte et objectif

L'utilisateur est chargé de projets en mécanique du bâtiment (Ville de Montréal, arrondissement de LaSalle).
Il veut un outil visuel d'aide à la **sélection et au dimensionnement des compteurs d'eau** conforme au
**Règlement RCG 07-031** — *Règlement sur la mesure de la consommation de l'eau dans les immeubles
utilisés ou destinés à être utilisés en partie ou en totalité à des fins non résidentielles*
(codification administrative au **23 décembre 2025**, incluant les modifications RCG 07-031-1 à RCG 07-031-6).

Le fichier PDF du règlement (`RCG_07-031_-_Codifi__23_d_cembre_2025.pdf.pdf`) est fourni avec cette
spécification dans le dépôt : c'est la **source normative unique**. Toute valeur, tout critère et toute
procédure de l'application doit en être extrait.

**Objectif :** créer une **application web visuelle** (interface en français) qui couvre :
1. **Admissibilité** : l'immeuble est-il assujetti au règlement ? (art. 2) + calculateur d'exemption
   pour immeubles mixtes (annexes H et I).
2. **Demande de pointe** : inventaire des appareils (annexe H) et estimation de la somme des
   demandes de pointe selon la méthode de l'annexe I.
3. **Sélection du compteur** : type et diamètre selon l'article 9 (gamme de débit, demande de
   pointe, perte de pression) + dossier de contestation (annexe D + H ou calcul hydraulique).
4. **Nombre et emplacement** des compteurs (art. 3, 4, 8, 8.01).
5. **Chambre de compteur** : exigibilité (art. 5, 6, 7) et normes techniques (annexe B).
6. **Préparation et installation** : fiche d'auto-inspection (annexe E), dérivation (art. 11 +
   annexe G), alimentation électrique des compteurs électromagnétiques ≥ 50 mm (art. 12).
7. **Consommation réputée** en cas de non-conformité (art. 13 + annexe C).

## 2. Référence normative — EXTRACTION PRIORITAIRE DU PDF

- **Texte officiel :** RCG 07-031, codification administrative au 23 décembre 2025 (PDF fourni).
- L'application doit citer l'**article ou l'annexe exact** pour chaque règle et chaque valeur (infobulles).
- **Règle absolue :** extraire chaque valeur du PDF. **Ne jamais inventer de valeurs.** Toute valeur
  non extractible doit être signalée comme « à confirmer » plutôt que devinée.

### Mise en garde sur l'extraction (importante)

Plusieurs annexes du PDF (D — questionnaire, H — inventaire, I — méthode de calcul des demandes
de pointe, B — normes techniques) contiennent des **tableaux et formulaires sous forme d'images**.
L'extraction automatique peut être partielle :
- Extraire d'abord tout le texte accessible, puis traiter les pages d'annexes comme images si nécessaire.
- Si une table ou une étape de calcul de l'annexe I est illisible, **ne pas la reconstruire par
  inférence** : marquer le module concerné « à confirmer » et lister précisément ce qui manque.
- **Ne rien coder avant d'avoir validé** que les annexes B, C, D, H et I sont correctement extraites.

### Articles et annexes clés (vérifier contre le PDF)

| Sujet | Référence |
|---|---|
| Champ d'application / immeubles assujettis | Article 2 (al. 1 : classes 5 à 10 art. 244.32 LFM, art. 244.36/244.51/244.52, art. 204 par. 1 à 9 et 11 à 19 LFM ; immeubles non encore au rôle) |
| Exemption immeubles mixtes (demande écrite + annexes D et H) | Article 2, dernier alinéa (Σ demandes de pointe annexe H ≤ demande de pointe méthode annexe I) |
| Nombre de compteurs (tous les établissements sauf protection incendie ; branchements temporaires inclus) | Article 3 |
| Un seul compteur par entrée d'eau (cas particulier) | Article 4 |
| Chambre de compteur : > 5 joints souterrains sur la section privée (neuf : construire ; existant : construire OU rapport annuel de détection de fuites + échéancier 180 jours si fuites) | Article 5 |
| Exemption art. 5 : cuivre type K, joints soudés à l'argent | Article 6 |
| Branchement combiné : séparation incendie/domestique dans la chambre | Article 7 |
| Un seul compteur pour plusieurs bâtiments (même propriétaire / même unité d'évaluation) | Articles 8 et 8.01 |
| **Sélection du compteur : type et dimension déterminés par l'autorité compétente selon la gamme de débit du compteur, la demande de pointe de l'immeuble et la perte de pression occasionnée par le compteur** | **Article 9, al. 2** |
| Contestation du dimensionnement : annexe D + inventaire annexe H, ou calcul hydraulique signé par un ingénieur | Article 9, al. 3 |
| Préparation de l'emplacement + fiche d'auto-inspection (annexe E) + dispositif antirefoulement | Article 9, al. 1 et 4 |
| Dérivation (branchement ≤ 40 mm, usages annexe G ; vanne scellée, fermée sauf entretien) | Article 11 |
| Compteur électromagnétique ≥ 50 mm : alimentation 120 V, panneau extérieur verrouillable à 1,5 m du sol, ≤ 20 m de la chambre, conduit 50 mm, espace 300×300×200 mm | Article 12 |
| Consommation réputée en cas de non-conformité : débit max continu selon le diamètre de l'entrée d'eau domestique à 3 m/s (annexe C) ; si diamètre inconnu : plus petit diamètre de l'annexe C | Article 13 |
| Normes techniques d'installation (préparation de tuyauterie par diamètre, chambres, conduit électrique 12 mm, etc.) | Annexe B |
| Consommation réputée maximale (table diamètre → débit) | Annexe C |
| Questionnaire / fiche d'information (sélection et dimensionnement) | Annexe D |
| Fiche d'auto-inspection | Annexe E |
| Types d'usage admissibles à une dérivation | Annexe G |
| Inventaire des appareils | Annexe H |
| Estimation de la somme des demandes de pointe (méthode de calcul) | Annexe I |
| Précision des compteurs (référence AWWA M6, 5e édition) | Annexe A |

## 3. Module 1 — Admissibilité (art. 2)

**Entrées :** usage de l'immeuble (industriel / commercial / institutionnel / mixte / résidentiel pur),
classe au rôle d'évaluation (si connue), nombre d'unités de logement (si mixte).

**Calculs / logique :**
- Déterminer si l'immeuble est assujetti (art. 2, al. 1). Les immeubles purement résidentiels :
  non assujettis (cohérent avec la page officielle montreal.ca/sujets/compteurs-deau).
- Si mixte (partie résidentielle) : proposer le **calculateur d'exemption** — l'utilisateur remplit
  l'inventaire (module 2) et l'outil compare Σ demandes de pointe (annexe H) à la demande de pointe
  selon la méthode de l'annexe I. Si ≤ : l'outil génère la liste des pièces du dossier d'exemption
  (demande écrite + annexes D et H dûment complétées).
- Résultat : statut « assujetti / non assujetti / exemption possible » avec la référence exacte.

## 4. Module 2 — Demande de pointe (annexes H et I)

**Entrées :** inventaire des appareils consommant de l'eau par établissement (annexe H numérisée :
type d'appareil, quantité, usage).

**Calculs :**
- **Somme des demandes de pointe** selon la méthode de calcul de l'**annexe I** (extraire la méthode
  exacte du PDF ; ne pas substituer une autre méthode).
- **Synergie avec l'outil de plomberie :** si l'application de prédimensionnement plomberie
  (chapitre III) existe, son module de débit de pointe (courbe de Hunter, UC → L/s) peut alimenter
  ce module comme estimation croisée — afficher les deux valeurs côte à côte quand disponibles,
  en indiquant la source de chacune.
- La demande de pointe est l'intrant du module 3 (sélection du compteur).

## 5. Module 3 — Sélection du compteur (art. 9) — CŒUR DE L'OUTIL

**Entrées :** demande de pointe de l'immeuble (module 2), pression disponible au branchement,
diamètre de l'entrée d'eau, type de compteur envisagé.

**Calculs :**
- Vérifier les **trois critères de l'article 9, al. 2** :
  1. la **demande de pointe** se situe dans la **gamme de débit** du compteur proposé ;
  2. la **perte de pression** occasionnée par le compteur reste acceptable vis-à-vis de la
     pression disponible et des besoins de l'immeuble ;
  3. le **type** de compteur est adapté (mécanique vs électromagnétique ; ce dernier à partir
     de 50 mm avec les exigences de l'art. 12).
- **Base de données compteurs :** les gammes de débit et courbes de perte de pression par
  type/diamètre **ne figurent pas dans le règlement** — l'outil doit les charger depuis une
  source fournie et validée par l'utilisateur (données fabricant, norme AWWA M6 citée à
  l'annexe A). **Ne jamais inventer ces données.** Chaque proposition affiche sa source.
- **Rappel constant dans l'interface :** la détermination officielle revient à **l'autorité
  compétente** (art. 9) — l'outil **propose et justifie**, il ne décide pas.
- **Dossier de contestation (art. 9, al. 3) :** si le dimensionnement exigé paraît inadéquat,
  l'outil génère le dossier : fiche d'information (annexe D) + inventaire (annexe H) pré-remplis,
  avec une section réservée au **calcul hydraulique signé par un ingénieur**.

## 6. Module 4 — Nombre et emplacement (art. 3, 4, 8, 8.01)

**Logique :**
- Par défaut : **autant de compteurs que nécessaire** pour mesurer tous les établissements,
  **hors protection incendie** (art. 3) — y compris les branchements temporaires.
- Cas particulier art. 4 : un seul compteur par entrée d'eau si la séparation exigerait des
  travaux dans une autre pièce que celle de l'entrée d'eau.
- Plusieurs bâtiments, même propriétaire / même unité d'évaluation : un seul compteur possible
  (art. 8 ; 8.01 pour branchement combiné) ; l'autorité peut exiger des compteurs pour la partie
  résidentielle.
- L'outil propose le **schéma de comptage** (nombre de compteurs, points d'installation par
  branchement — reprenant la structure du tableau des points d'installation de l'annexe D :
  branchement, diamètre, DAR, usages alimentés, emplacement, chambre requise ou non).

## 7. Module 5 — Chambre de compteur (art. 5, 6, 7 + annexe B)

**Entrées :** par branchement : nombre de joints souterrains sur la section privée, matériau
des tuyaux (cuivre type K ? joints soudés à l'argent ?), branchement neuf ou existant,
branchement combiné (incendie + domestique) ou non.

**Logique :**
- > 5 joints souterrains → chambre requise (art. 5). Neuf : construire à l'endroit indiqué par
  l'autorité. Existant : construire OU option du rapport annuel de détection de fuites
  (avec échéancier de 180 jours si fuites ; non-respect → obligation de construire).
- Exemption : cuivre type K + joints soudés à l'argent (art. 6).
- Branchement combiné : la séparation incendie/domestique se fait **dans la chambre** (art. 7).
- Checklist des **normes techniques de l'annexe B** pour la chambre (dimensions, étanchéité,
  accès) — extraire du PDF.

## 8. Module 6 — Préparation et installation (art. 9, 11, 12 + annexes B, E, G)

- **Préparation de l'emplacement** par le propriétaire (art. 9, al. 1) : tuyauterie à ses frais,
  dispositif antirefoulement, normes de l'annexe B (tableaux de préparation par diamètre :
  extraire les tableaux « Préparation de tuyauterie pour un diamètre de 20 mm… » et suivants).
- **Fiche d'auto-inspection** (annexe E) : formulaire numérique à transmettre à l'autorité
  compétente une fois les travaux terminés.
- **Dérivation** (art. 11) : admissible si branchement ≤ 40 mm et usage listé à l'annexe G ;
  rappeler : vanne d'arrêt scellée, tenue fermée sauf entretien/remplacement.
- **Compteurs électromagnétiques ≥ 50 mm** (art. 12) : checklist alimentation 120 V — panneau
  extérieur verrouillable, 1,5 m du sol, ≤ 20 m de la chambre, conduit 50 mm, espace
  300×300×200 mm, plage 0–50 °C.
- Rappel : le compteur mesure uniquement l'eau potable ICI — **ni le résidentiel, ni la
  protection incendie** (définition du point d'installation, annexe D, §1.7).

## 9. Module 7 — Consommation réputée (art. 13 + annexe C)

**Calculateur :** en cas de non-conformité (refus d'accès pour travaux), la consommation est
réputée égale au **débit maximal continu** calculé avec le diamètre de l'entrée d'eau
domestique et une vitesse de **3 m/s** (table de l'annexe C). Si le diamètre est inconnu :
utiliser le plus petit diamètre de l'annexe C.
- Extraire la table de l'annexe C (diamètre → débit).
- Utilité pratique : estimer l'exposition financière d'un immeuble non conforme.

## 10. Données d'entrée — modèle de projet

- **Projet → Immeubles → Branchements → Points d'installation** : chaque branchement contient
  son diamètre, son matériau, son type (domestique / incendie / combiné / temporaire), ses
  joints souterrains, et ses points d'installation avec compteurs proposés.
- **Fiche d'information (annexe D)** : formulaire numérique reprenant les sections du
  questionnaire (renseignements généraux, usages du bâtiment, inventaire des branchements,
  compteurs existants, points d'installation).
- **Inventaire (annexe H)** : saisie des appareils par établissement → alimente les modules 2 et 3.
- Totaux automatiques par branchement : demande de pointe, compteur proposé, chambre requise,
  dérivation admissible.

## 11. Fonctionnalités de l'interface (visuel)

1. **Fiche d'information** : formulaire guidé reprenant l'annexe D (sections 1.1 à 1.7).
2. **Inventaire des appareils** : tableau par établissement (annexe H) avec recherche.
3. **Sélecteur de compteur** : saisie de la demande de pointe → proposition type + diamètre
   avec les 3 critères de l'art. 9 affichés (gamme de débit ✓/✗, perte de pression, type),
   source des données compteur citée.
4. **Schéma de comptage** : vue par branchement (compteurs, chambres, dérivations, DAR).
5. **Checklists réglementaires** : chambre (art. 5/6/7), dérivation (art. 11 + ann. G),
   électromagnétique ≥ 50 mm (art. 12), préparation tuyauterie (ann. B).
6. **Traçabilité normative** : chaque règle et chaque résultat affiche sa référence
   (article/annexe du RCG 07-031) en infobulle.
7. **Dossier de contestation / d'exemption** : génération des pièces (annexes D, E, H
   pré-remplies) en export.
8. **Export** : CSV/PDF du dossier (immeuble, branchements, compteurs proposés, justifications)
   — utile pour les dossiers de la Ville et les échanges avec l'autorité compétente.
9. Interface en **français**, unités métriques (avec pouces entre parenthèses quand le
   règlement les utilise).

## 12. Livrable technique

- Application web autonome (un seul dossier ; HTML/CSS/JS ou React via CDN — pas de build requis).
- Tous les calculs côté client.
- **Jeu de données d'exemple** : un immeuble mixte fictif (commercial + quelques logements,
  2 branchements dont un combiné) avec résultats attendus documentés pour validation.
- **Avertissement affiché dans l'app** : « Outil d'aide à la décision — la détermination du
  type et de la dimension du compteur revient à l'autorité compétente (art. 9, RCG 07-031).
  La conformité finale doit être validée par un professionnel contre le texte officiel. »

## 13. Étapes suggérées

1. Extraire du PDF les annexes B, C, D, E, G, H, I et les articles 2 à 13 — **ne rien coder
   avant cette validation** ; lister explicitement tout contenu illisible ou manquant.
2. Constituer la base de données compteurs (gammes de débit, pertes de pression) depuis une
   source validée fournie par l'utilisateur — jamais inventée.
3. Maquetter l'interface (fiche d'information + inventaire + sélecteur + dashboard par branchement).
4. Implémenter les modules 1 → 2 → 3 → 4 → 5 → 6 → 7 dans cet ordre, avec le jeu d'exemple.
5. Valider chaque module contre le texte du règlement (documenter les cas test).
6. Export CSV/PDF et finitions visuelles.

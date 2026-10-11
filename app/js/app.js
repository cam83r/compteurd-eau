/* Interface — modules 1 à 7. Dépend de RCG, CompteursDB, Calculs, CalculsB et EXEMPLE. */
(function () {
  'use strict';

  var CLE_STOCKAGE = 'rcg07031.projet.v1';
  var I = RCG.ANNEXE_I;

  var MODULES = [
    { id: 'm1', titre: '1. Admissibilité', actif: true },
    { id: 'm2', titre: '2. Demande de pointe', actif: true },
    { id: 'm3', titre: '3. Sélection du compteur', actif: true },
    { id: 'm4', titre: '4. Nombre et emplacement', actif: true },
    { id: 'm5', titre: '5. Chambre de compteur', actif: true },
    { id: 'm6', titre: '6. Préparation et installation', actif: true },
    { id: 'm7', titre: '7. Consommation réputée', actif: true }
  ];

  function projetVide() {
    return {
      projet: { nom: '', adresse: '', arrondissement: '' },
      admissibilite: { usage: '', critere1: '', critere2: '', critere3: '', aucunBranchement: '', partieResidentielle: '', nbLogements: '' },
      etablissements: [{ id: nouvelId(), nom: 'Établissement 1', usageCas1: '', quantites: {} }],
      selection: selectionVide(),
      immeuble: { reseauPrive: '', codeUsageG: '' },
      branchements: [branchementVide(1)],
      consommation: { diametreMm: '', jours: '', tarif: '' },
      autoInspection: {},
      bilan: bilanVide()
    };
  }

  function bilanVide() {
    return { pStatique: '', perteBranchement: '', compteurId: '', perteCompteurManuelle: '', autresPertes: '', hauteurM: '', pressionMin: '', longueur: '', facteur: '1.5' };
  }

  function branchementVide(n) {
    return {
      id: 'b' + Math.random().toString(36).slice(2, 9), nom: 'Branchement ' + n, type: 'potable', temporaire: 'non', diametreMm: '', materiau: '',
      neuf: 'existant', joints: '', cuivreKArgent: '', nbBatiments: 1, memeProprietaire: '', dessertEtablissements: '', dessertResidentiel: '',
      separationAutrePiece: '', diametrePreparationMm: '', typeCompteur: '', alimentation120: ''
    };
  }

  // Complète un projet enregistré par une version antérieure de l'outil.
  function normaliser(o) {
    if (!o.selection) o.selection = selectionVide();
    if (!o.immeuble) o.immeuble = { reseauPrive: '', codeUsageG: '' };
    if (!Array.isArray(o.branchements) || !o.branchements.length || o.branchements[0].neuf === undefined) o.branchements = [branchementVide(1)];
    if (!o.consommation) o.consommation = { diametreMm: '', jours: '', tarif: '' };
    if (!o.autoInspection) o.autoInspection = {};
    if (!o.bilan) o.bilan = bilanVide();
    return o;
  }

  function selectionVide() {
    return { sourceDemande: 'module2', debitManuel: '', pressionDisponibleKpa: '', pressionRequiseKpa: '', technologie: '' };
  }

  function nouvelId() { return 'e' + Math.random().toString(36).slice(2, 9); }
  function copie(o) { return JSON.parse(JSON.stringify(o)); }

  var etat = normaliser(charger() || copie(EXEMPLE));
  var ongletActif = 'm1';

  function charger() {
    try { var s = localStorage.getItem(CLE_STOCKAGE); return s ? JSON.parse(s) : null; } catch (e) { return null; }
  }
  function sauver() {
    try { localStorage.setItem(CLE_STOCKAGE, JSON.stringify(etat)); } catch (e) { /* stockage indisponible */ }
  }

  // ---------- utilitaires d'affichage ----------
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function fmt(n, d) {
    return Number(n).toLocaleString('fr-CA', { minimumFractionDigits: 0, maximumFractionDigits: d == null ? 2 : d });
  }
  // Citation normative affichée en infobulle (exigence : chaque résultat cite son article/annexe).
  function ref(cle) {
    var r = RCG.REFS[cle];
    return '<span class="ref' + (r.source ? ' ref-cnp' : '') + '" tabindex="0" data-tip="' + esc((r.source || 'RCG 07-031') + ' — ' + r.court + ' : ' + r.texte) + '">' + esc(r.court) + '</span>';
  }
  function aConfirmer(texte) {
    return '<span class="badge badge-warn" title="' + esc(texte) + '">à confirmer</span>';
  }
  function get(chemin) {
    return chemin.split('.').reduce(function (o, k) { return o == null ? undefined : o[k]; }, etat);
  }
  function set(chemin, v) {
    var ks = chemin.split('.'), o = etat;
    for (var i = 0; i < ks.length - 1; i++) o = o[ks[i]] = o[ks[i]] || {};
    o[ks[ks.length - 1]] = v;
  }

  // ---------- squelette ----------
  function rendreNav() {
    document.getElementById('nav').innerHTML = MODULES.map(function (m) {
      return '<button class="onglet' + (m.id === ongletActif ? ' actif' : '') + '" data-onglet="' + m.id + '"' +
        (m.actif ? '' : ' aria-disabled="true"') + '>' + esc(m.titre) + (m.actif ? '' : ' <small>à venir</small>') + '</button>';
    }).join('');
  }

  function rendre() {
    rendreNav();
    var m = MODULES.filter(function (x) { return x.id === ongletActif; })[0];
    var main = document.getElementById('contenu');
    if (m.id === 'm1') main.innerHTML = vueModule1();
    else if (m.id === 'm2') main.innerHTML = vueModule2();
    else if (m.id === 'm3') main.innerHTML = vueModule3();
    else if (m.id === 'm4') main.innerHTML = vueModule4();
    else if (m.id === 'm5') main.innerHTML = vueModule5();
    else if (m.id === 'm6') main.innerHTML = vueModule6();
    else if (m.id === 'm7') main.innerHTML = vueModule7();
    majResultats();
  }

  // ---------- module 1 ----------
  function radio(chemin, libelle, refCle) {
    var v = get(chemin) || '';
    var opts = [['oui', 'Oui'], ['non', 'Non'], ['inconnu', 'Inconnu']];
    return '<fieldset class="tri"><legend>' + libelle + ' ' + ref(refCle) + '</legend>' + opts.map(function (o) {
      return '<label><input type="radio" name="' + chemin + '" data-champ="' + chemin + '" value="' + o[0] + '"' + (v === o[0] ? ' checked' : '') + '> ' + o[1] + '</label>';
    }).join('') + '</fieldset>';
  }

  function vueModule1() {
    var a = etat.admissibilite;
    var usages = [['', '— choisir —'], ['industrielle', 'Industrielle'], ['commerciale', 'Commerciale'], ['institutionnelle', 'Institutionnelle'], ['residentiel', 'Résidentiel uniquement']];
    return '' +
      '<section class="carte"><h2>Projet</h2><div class="grille">' +
      champTexte('projet.nom', 'Nom du projet') + champTexte('projet.adresse', 'Adresse') + champTexte('projet.arrondissement', 'Arrondissement / Ville') +
      '</div></section>' +
      '<div class="colonnes"><div>' +
      '<section class="carte"><h2>Usages du bâtiment ' + ref('annD_13') + '</h2>' +
      '<label class="champ">Vocation principale<select data-champ="admissibilite.usage">' + usages.map(function (u) {
        return '<option value="' + u[0] + '"' + (a.usage === u[0] ? ' selected' : '') + '>' + u[1] + '</option>';
      }).join('') + '</select></label>' +
      radio('admissibilite.partieResidentielle', 'Le bâtiment comporte une partie résidentielle', 'art2_1_al3') +
      '<label class="champ">Nombre d\'unités de logement<input type="number" min="0" step="1" data-champ="admissibilite.nbLogements" value="' + esc(a.nbLogements) + '"></label>' +
      '</section>' +
      '<section class="carte"><h2>Critères d\'assujettissement</h2>' +
      '<p class="aide">Les articles de la Loi sur la fiscalité municipale ne sont pas reproduits dans le règlement : réponses déclaratives, à vérifier au rôle d\'évaluation.</p>' +
      radio('admissibilite.critere1', '1° Porté au rôle comme immeuble non résidentiel, classes 5 à 10 (art. 244.32 LFM) ou art. 244.36, 244.51, 244.52', 'art2_1_al1') +
      radio('admissibilite.critere2', '2° Visé par l\'art. 204 LFM, par. 1 à 9 ou 11 à 19', 'art2_1_al1') +
      radio('admissibilite.critere3', '3° Usage non résidentiel (en tout ou en partie), pas encore porté au rôle', 'art2_1_al1') +
      radio('admissibilite.aucunBranchement', 'Aucun aménagement ni bâtiment relié à un branchement d\'eau', 'art2_1_al2') +
      '</section></div>' +
      '<div><section class="carte resultat" id="m1-resultat" aria-live="polite"></section></div></div>';
  }

  function champTexte(chemin, libelle) {
    return '<label class="champ">' + esc(libelle) + '<input type="text" data-champ="' + chemin + '" value="' + esc(get(chemin)) + '"></label>';
  }

  var STATUTS = {
    assujetti: ['Assujetti', 'err', 'Un ou des compteurs doivent être installés.'],
    non_assujetti: ['Non assujetti', 'ok', 'Aucun compteur exigé par le règlement.'],
    non_requis: ['Compteur non requis', 'ok', 'Aucun bâtiment ni aménagement relié.'],
    a_confirmer: ['À confirmer', 'warn', 'Réponses manquantes.']
  };

  function majModule1(demande) {
    var el = document.getElementById('m1-resultat');
    if (!el) return;
    var r = Calculs.evaluerAdmissibilite(etat.admissibilite, demande);
    var s = STATUTS[r.statut];
    var h = '<h2>Résultat</h2><div class="statut statut-' + s[1] + '"><strong>' + s[0] + '</strong><span>' + s[2] + '</span></div>' +
      '<ul class="motifs">' + r.motifs.map(function (m) { return '<li>' + esc(m.texte) + ' ' + ref(m.ref) + '</li>'; }).join('') + '</ul>';
    if (r.exemption) h += vueExemption(r.exemption);
    el.innerHTML = h;
  }

  function vueExemption(ex) {
    var h = '<h3>Calculateur d\'exemption — immeuble mixte ' + ref('art2_1_al3') + '</h3>';
    if (ex.statut === 'inventaire_requis') {
      return h + '<p>Remplir l\'inventaire des établissements pour évaluer l\'exemption.</p><button class="btn" data-onglet="m2">→ Module 2 : demande de pointe</button>';
    }
    var lib = {
      possible: ['Exemption possible', 'ok', 'QPM ≤ 2,27 m³/h (10 gal US/min × 0,227).'],
      zone_grise: ['Zone grise — à confirmer', 'warn', 'QPM entre 2,27 et 2,3 m³/h : le règlement imprime 2,3 m³/h mais sa propre conversion de 10 gal US/min donne 2,27 m³/h. Confirmer avec l\'autorité compétente.'],
      non: ['Exemption non admissible', 'err', 'QPM > 2,3 m³/h.']
    }[ex.statut];
    h += '<div class="statut statut-' + lib[1] + '"><strong>' + lib[0] + '</strong><span>QPM = ' + fmt(ex.qpm, 3) + ' m³/h ' + ref('annI_qpm') + ' — seuil 2,3 m³/h (10 gal US) ' + ref('annI_seuil') + '</span><span>' + esc(lib[2]) + '</span></div>';
    h += jauge(ex.qpm);
    if (ex.pieces.length) {
      h += '<h4>Pièces du dossier d\'exemption</h4><ol class="pieces">' + ex.pieces.map(function (p) { return '<li>' + esc(p.texte) + ' ' + ref(p.ref) + '</li>'; }).join('') + '</ol>' +
        '<p class="aide">L\'autorisation est accordée par l\'autorité compétente sur demande écrite.</p>';
    }
    return h + '<button class="btn" data-onglet="m2">Voir le détail du calcul (module 2)</button>';
  }

  // Jauge QPM vs seuil (zone grise 2,27–2,3).
  function jauge(qpm) {
    var max = Math.max(4.6, qpm * 1.15);
    function pct(v) { return Math.min(100, v / max * 100).toFixed(2) + '%'; }
    var bas = I.seuilUSGPM * I.conversionM3hParUSGPM;
    return '<div class="jauge" role="img" aria-label="QPM ' + fmt(qpm, 3) + ' m³/h comparé au seuil de 2,3 m³/h">' +
      '<div class="jauge-zone ok" style="width:' + pct(bas) + '"></div>' +
      '<div class="jauge-zone warn" style="left:' + pct(bas) + ';width:calc(' + pct(I.seuilImprimeM3h) + ' - ' + pct(bas) + ')"></div>' +
      '<div class="jauge-zone err" style="left:' + pct(I.seuilImprimeM3h) + ';right:0"></div>' +
      '<div class="jauge-curseur" style="left:' + pct(qpm) + '"><span>' + fmt(qpm, 3) + '</span></div>' +
      '</div><div class="jauge-legende"><span>0</span><span class="jauge-seuil" style="left:' + pct(I.seuilImprimeM3h) + '">seuil 2,27 | 2,3 m³/h</span><span>' + fmt(max, 1) + ' m³/h</span></div>';
  }

  // ---------- module 2 ----------
  function vueModule2() {
    var h = '<section class="carte"><h2>Inventaire des appareils par établissement ' + ref('annH_12') + ' ' + ref('annH_13') + '</h2>' +
      '<p class="aide">Inventorier les appareils de tous les établissements (usage autre que résidentiel ' + ref('art1_etab') + ') de l\'immeuble ' + ref('art2_1_al3') + '. ' +
      'Unités d\'alimentation en gallons US par minute (USGPM) ' + ref('annH_conv') + '.</p></section>';
    h += etat.etablissements.map(vueEtablissement).join('');
    h += '<div class="actions"><button class="btn" data-action="ajouter-etab">+ Ajouter un établissement</button></div>';
    h += '<section class="carte resultat" id="m2-resultat" aria-live="polite"></section>';
    return h;
  }

  function vueEtablissement(e) {
    var usages = [''].concat(I.usagesCas1);
    return '<section class="carte etab" data-etab="' + e.id + '">' +
      '<div class="etab-tete"><label class="champ">Établissement<input type="text" data-etab-champ="nom" value="' + esc(e.nom) + '"></label>' +
      '<label class="champ">Usage visé au cas 1 ' + ref('annI_cas') + '<select data-etab-champ="usageCas1">' + usages.map(function (u) {
        return '<option value="' + esc(u) + '"' + (e.usageCas1 === u ? ' selected' : '') + '>' + (u ? esc(u) : 'Aucun') + '</option>';
      }).join('') + '</select></label>' +
      '<label class="champ">Rechercher un appareil<input type="search" data-filtre placeholder="ex. lavabo"></label>' +
      (etat.etablissements.length > 1 ? '<button class="btn btn-sec" data-action="retirer-etab">Retirer</button>' : '') + '</div>' +
      tableAppareils(e, RCG.TABLEAU_12, 'Tableau 1.2 — appareils courants', 'annH_12') +
      tableAppareils(e, RCG.TABLEAU_13, 'Tableau 1.3 — autres appareils', 'annH_13') +
      '<p class="sous-total" id="st-' + e.id + '"></p></section>';
  }

  function tableAppareils(e, items, titre, refCle) {
    var groupes = [], parGroupe = {};
    items.forEach(function (it) {
      var g = it.groupe || '';
      if (!parGroupe[g]) { parGroupe[g] = []; groupes.push(g); }
      parGroupe[g].push(it);
    });
    var h = '<h3>' + esc(titre) + ' ' + ref(refCle) + '</h3><table class="inventaire"><thead><tr><th>Appareil</th><th class="num">Quantité</th><th class="num">Unité (USGPM)</th><th class="num">Total (USGPM)</th></tr></thead>';
    groupes.forEach(function (g) {
      var lignes = parGroupe[g].map(function (it) { return ligneAppareil(e, it); }).join('');
      if (!g) { h += '<tbody>' + lignes + '</tbody>'; return; }
      var saisi = parGroupe[g].some(function (it) { return Calculs.nombre(e.quantites[it.id]) > 0; });
      h += '<tbody class="groupe' + (saisi ? '' : ' replie') + '" data-groupe><tr class="groupe-tete"><th colspan="4"><button class="lien" data-action="basculer-groupe">' + esc(g) + '</button>' +
        (parGroupe[g][0].note ? ' <span class="aide">' + esc(parGroupe[g][0].note) + '</span>' : '') + '</th></tr>' + lignes + '</tbody>';
    });
    return h + '</table>';
  }

  function ligneAppareil(e, it) {
    var v = e.quantites[it.id];
    var debit = it.saisie === 'debit';
    return '<tr data-libelle="' + esc(it.libelle.toLowerCase()) + '"><td>' + esc(it.libelle) +
      (it.quantiteEn ? ' <span class="aide">(quantité : ' + esc(it.quantiteEn) + ')</span>' : '') +
      (it.note && !it.groupe ? ' <span class="ref-note" tabindex="0" data-tip="' + esc(it.note) + '">?</span>' : '') + '</td>' +
      '<td class="num"><input type="number" min="0" step="any" inputmode="decimal" aria-label="' + esc(it.libelle) + (debit ? ' — débit USGPM' : ' — quantité') + '" data-item="' + it.id + '" value="' + esc(v == null ? '' : v) + '"' + (debit ? ' placeholder="débit"' : '') + '></td>' +
      '<td class="num">' + (debit ? '<em>débit saisi</em>' : fmt(it.unite)) + '</td>' +
      '<td class="num" id="t-' + e.id + '-' + it.id + '">' + fmt(Calculs.contribution(it, v)) + '</td></tr>';
  }

  function majModule2(d) {
    d.etablissements.forEach(function (x) {
      var st = document.getElementById('st-' + x.id);
      if (st) st.innerHTML = 'Q12 = <strong>' + fmt(x.q12) + '</strong> USGPM ' + ref('annI_q12') + ' · Q13 = <strong>' + fmt(x.q13) + '</strong> USGPM ' + ref('annI_q13') +
        ' · ' + (x.cas1 ? 'Déclenche le cas 1 : ' + esc(x.raisonsCas1.join(', ')) : 'Cas 2') + ' ' + ref('annI_cas');
    });
    var el = document.getElementById('m2-resultat');
    if (!el) return;
    var p = d.q12p;
    var h = '<h2>Demande de pointe de l\'immeuble — méthode de l\'annexe I ' + ref('annI_seuil') + '</h2>' +
      '<table class="etapes"><tbody>' +
      etape('Q12 — somme du tableau 1.2', fmt(d.q12) + ' USGPM', 'annI_q12') +
      etape('Q13 — somme du tableau 1.3', fmt(d.q13) + ' USGPM', 'annI_q13') +
      etape('Cas retenu', 'Cas ' + d.cas + (d.cas === 1 ? ' — ' + esc(d.raisonsCas1.map(function (r) { return r.etablissement + ' (' + r.raisons.join(', ') + ')'; }).join(' ; ')) : ' — autre type d\'établissement') +
        (d.casMixte ? ' ' + aConfirmer('Immeuble mixte : cas 1 appliqué à tout l\'immeuble') + ' <span class="aide">Immeuble mixte : cas 1 appliqué à tout l\'immeuble (décision de projet, non précisé par l\'annexe I).</span>' : ''), 'annI_cas') +
      etape('Plage et formule', p.plage ? esc(p.plage) + ' : <code>' + esc(p.formule) + '</code>' : '—', 'annI_q12p') +
      etape('Q12P — demande pondérée', fmt(p.valeur, 3) + ' USGPM' + (p.aConfirmer ? ' ' + aConfirmer(p.notes.join(' ')) + ' <span class="aide">' + esc(p.notes.join(' ')) + '</span>' : ''), 'annI_q12p') +
      etape('QPUS = Q13 + Q12P', fmt(d.qpus, 3) + ' USGPM', 'annI_qpm') +
      etape('QPM = QPUS × 0,227', '<strong>' + fmt(d.qpm, 3) + ' m³/h</strong>', 'annI_qpm') +
      '</tbody></table>' + jauge(d.qpm) +
      '<p class="aide">La demande de pointe est l\'intrant de la sélection du compteur (module 3) ' + ref('art9_al3') + '. La pression théorique de 414 kPa (60 PSI) indiquée à l\'annexe I n\'intervient dans aucune formule.</p>';
    el.innerHTML = h;
  }

  function etape(libelle, valeur, refCle) {
    return '<tr><th scope="row">' + esc(libelle) + '</th><td>' + valeur + '</td><td class="cite">' + ref(refCle) + '</td></tr>';
  }

  function majResultats() {
    var d = Calculs.calculerDemandePointe(etat.etablissements);
    majModule1(d);
    majModule2(d);
    majModule3(d);
    majBranchements();
    majModule7();
    var titre = document.getElementById('titre-projet');
    if (titre) titre.textContent = etat.projet.nom || 'Projet sans nom';
  }

  // ---------- module 3 ----------
  var TECHNOS = [['', 'Toutes'], ['volumetrique', 'Volumétrique'], ['electromagnetique', 'Électromagnétique'], ['ultrasonique', 'Ultrasonique']];
  var STATUTS_CPT = {
    conforme: ['Critères remplis', 'ok'],
    sous_reserve: ['Sous réserve', 'warn'],
    ecarte: ['Écarté', 'err']
  };

  function vueModule3() {
    var s = etat.selection;
    return '<div class="colonnes"><div>' +
      '<section class="carte"><h2>Demande de pointe ' + ref('art9_al3') + '</h2>' +
      '<fieldset class="tri"><legend>Source</legend>' +
      '<label><input type="radio" name="src" data-champ="selection.sourceDemande" value="module2"' + (s.sourceDemande !== 'manuel' ? ' checked' : '') + '> Module 2 (annexe I)</label>' +
      '<label><input type="radio" name="src" data-champ="selection.sourceDemande" value="manuel"' + (s.sourceDemande === 'manuel' ? ' checked' : '') + '> Saisie (ex. calcul hydraulique)</label></fieldset>' +
      '<label class="champ">Débit saisi (USGPM) — utilisé si « Saisie »<input type="number" min="0" step="any" data-champ="selection.debitManuel" value="' + esc(s.debitManuel) + '"></label>' +
      '<p id="m3-demande" class="sous-total"></p></section>' +
      '<section class="carte"><h2>Perte de pression admissible</h2>' +
      '<p class="aide">Le règlement ne fixe aucune valeur : la perte admissible découle des pressions saisies par le concepteur ' + ref('art9_al3') + '.</p>' +
      '<div class="grille">' +
      '<label class="champ">Pression disponible au branchement (kPa)<input type="number" min="0" step="any" data-champ="selection.pressionDisponibleKpa" value="' + esc(s.pressionDisponibleKpa) + '"></label>' +
      '<label class="champ">Pression requise en aval du compteur (kPa)<input type="number" min="0" step="any" data-champ="selection.pressionRequiseKpa" value="' + esc(s.pressionRequiseKpa) + '"></label>' +
      '</div><p id="m3-permise" class="sous-total"></p></section>' +
      '<section class="carte"><h2>Technologie</h2><label class="champ">Filtrer<select data-champ="selection.technologie">' +
      TECHNOS.map(function (t) { return '<option value="' + t[0] + '"' + (s.technologie === t[0] ? ' selected' : '') + '>' + t[1] + '</option>'; }).join('') +
      '</select></label><p class="aide">Base : fiches Neptune T-10, Sensus iPERL et Neptune MACH 10 fournies par l\'usager (docs/fiches). Pertes de pression lues sur les graphiques des fiches (≈ ±0,2 psi) ; MACH 10 : aucune donnée de perte dans la source.</p></section>' +
      '</div><div><section class="carte resultat" id="m3-resultat" aria-live="polite"></section></div></div>' +
      vueBilan() +
      '<section class="carte" id="m3-graphique"></section>' +
      '<section class="carte" id="m3-tableau"></section>' +
      '<section class="carte"><h2>Dossier de contestation du dimensionnement ' + ref('art9_al4') + '</h2>' +
      '<p>Si le compteur exigé par l\'autorité compétente paraît inadéquat pour les besoins en eau de l\'immeuble, la demande de modification s\'appuie sur l\'une des deux options :</p>' +
      '<ol class="pieces"><li>Annexe D — fiche d\'information ' + ref('annD') + ' <strong>et</strong> annexe H — inventaire (module 2) ' + ref('annH_12') + '</li>' +
      '<li><strong>ou</strong> calcul hydraulique signé par un ingénieur ' + ref('art9_al4') + '</li></ol>' +
      '<p class="aide">L\'export des pièces pré-remplies sera ajouté avec la fonction d\'export (étape 6 de la spécification).</p></section>';
  }

  function demandeSelection(d) {
    var s = etat.selection;
    if (s.sourceDemande === 'manuel') return { q: Calculs.nombre(s.debitManuel), origine: 'saisie' };
    return { q: d.qpus, origine: 'module2' };
  }

  function pertePermise() {
    var s = etat.selection;
    var dispo = Calculs.nombre(s.pressionDisponibleKpa), req = Calculs.nombre(s.pressionRequiseKpa);
    if (s.pressionDisponibleKpa === '' || s.pressionRequiseKpa === '' || !dispo) return null;
    return dispo - req;
  }

  function source(c, quoi) {
    var page = quoi === 'perte' ? c.source.pagePerte : c.source.pagePlage;
    var txt = 'Source : ' + c.source.doc + (page ? ', p. ' + page + ' du PDF' : '') + ' — ' + c.source.fichier +
      (quoi === 'perte' ? '. Valeur lue sur le graphique (≈ ±0,2 psi), interpolée linéairement.' : '');
    return '<span class="ref ref-src" tabindex="0" data-tip="' + esc(txt) + '">fiche</span>';
  }

  function nomCpt(c) { return c.fabricant + ' ' + c.modele + ' ' + c.diametrePo + ' po (' + c.diametreMm + ' mm)'; }

  function textePerte(r) {
    var p = r.perte;
    if (p.statut === 'inconnue') return 'non disponible dans la source ' + aConfirmer('Perte de pression absente de la source fournie');
    if (p.statut === 'hors_courbe') return 'hors courbe (courbe jusqu\'à ' + fmt(p.maxDebit) + ' gpm)';
    return fmt(p.kpa, 1) + ' kPa (' + fmt(p.psi, 2) + ' psi)' + (p.verdict === 'a_evaluer' ? ' — à comparer : pressions non saisies' : '');
  }

  function majModule3(d) {
    var el = document.getElementById('m3-resultat');
    if (!el) return;
    majBilan(d);
    var dem = demandeSelection(d), q = dem.q, permise = pertePermise();
    document.getElementById('m3-demande').innerHTML = dem.origine === 'module2'
      ? 'QPUS = <strong>' + fmt(q, 3) + ' USGPM</strong> (QPM = ' + fmt(d.qpm, 3) + ' m³/h) ' + ref('annI_qpm')
      : 'Débit saisi : <strong>' + fmt(q, 3) + ' USGPM</strong> (' + fmt(q * I.conversionM3hParUSGPM, 3) + ' m³/h) ' + ref('annH_conv');
    document.getElementById('m3-permise').innerHTML = permise == null
      ? 'Saisir les deux pressions pour évaluer le critère de perte de pression.'
      : 'Perte admissible = <strong>' + fmt(permise, 1) + ' kPa</strong> (' + fmt(permise / CompteursDB.KPA_PAR_PSI, 2) + ' psi)' +
        (permise <= 0 ? ' ' + aConfirmer('Pression disponible insuffisante') : '');

    if (!(q > 0)) {
      el.innerHTML = '<h2>Proposition</h2><p>Aucune demande de pointe : remplir l\'inventaire (module 2) ou saisir un débit.</p>';
      document.getElementById('m3-graphique').innerHTML = '';
      document.getElementById('m3-tableau').innerHTML = '';
      return;
    }
    var sel = Calculs.selectionnerCompteurs(q, permise, etat.selection.technologie || null);
    var h = '<h2>Proposition par technologie ' + ref('art9_al3') + '</h2>' +
      '<p class="aide">L\'outil propose et justifie ; la détermination du type et de la dimension revient à l\'autorité compétente ' + ref('art9_al3') +
      ', et les compteurs sont fournis par la Ville ' + ref('art2_al2') + '.</p>';
    var props = TECHNOS.slice(1).map(function (t) { return sel.propositions[t[0]]; }).filter(Boolean);
    if (!props.length) h += '<div class="statut statut-err"><strong>Aucun compteur de la base ne convient</strong><span>Demande hors des plages ou perte trop élevée pour les compteurs disponibles.</span></div>';
    props.forEach(function (r) {
      var c = r.compteur, st = STATUTS_CPT[r.statut];
      h += '<div class="statut statut-' + st[1] + '"><strong>' + esc(nomCpt(c)) + '</strong>' +
        '<span>' + esc(c.libelleTechno) + ' · ' + esc(c.norme) + ' · ' + st[0] + '</span>' +
        '<span>' + (r.gamme === 'ok' ? '✓' : '⚠') + ' Gamme de débit : plage normale ' + fmt(c.plageNormale[0]) + ' à ' + fmt(c.plageNormale[1]) + ' gpm ' + source(c, 'plage') + '</span>' +
        '<span>' + (r.perte.verdict === 'ok' ? '✓' : '⚠') + ' Perte de pression : ' + textePerte(r) + (r.perte.statut === 'calculee' ? ' ' + source(c, 'perte') : '') + '</span>' +
        r.notes.map(function (n) { return '<span>⚠ ' + esc(n) + '</span>'; }).join('') + '</div>';
    });
    el.innerHTML = h;
    document.getElementById('m3-graphique').innerHTML = graphiquePertes(sel.evaluations, q, permise);
    document.getElementById('m3-tableau').innerHTML = tableauCompteurs(sel.evaluations);
  }

  function tableauCompteurs(evals) {
    return '<h2>Tous les compteurs de la base</h2><div class="defile"><table class="inventaire"><thead><tr><th>Compteur</th><th>Technologie</th><th class="num">Plage normale (gpm)</th><th class="num">Bas débit (gpm)</th><th>Perte à la demande</th><th>Statut</th></tr></thead><tbody>' +
      evals.map(function (r) {
        var c = r.compteur, st = STATUTS_CPT[r.statut];
        return '<tr' + (r.propose ? ' class="propose"' : '') + '><td>' + esc(nomCpt(c)) + (r.propose ? ' <span class="badge badge-ok">proposé</span>' : '') + '</td><td>' + esc(c.libelleTechno) + '</td>' +
          '<td class="num">' + fmt(c.plageNormale[0]) + ' – ' + fmt(c.plageNormale[1]) + ' ' + source(c, 'plage') + '</td>' +
          '<td class="num">' + fmt(c.basDebit, 3) + ' (' + esc(c.basDebitPrecision) + ')</td>' +
          '<td>' + textePerte(r) + '</td>' +
          '<td><span class="pastille pastille-' + st[1] + '">' + st[0] + '</span>' + (r.notes.length ? ' <span class="ref-note" tabindex="0" data-tip="' + esc(r.notes.join(' ')) + '">!</span>' : '') + '</td></tr>';
      }).join('') + '</tbody></table></div>';
  }

  // Courbes de perte de pression (lecture des fiches) avec la demande et la perte admissible.
  function graphiquePertes(evals, q, permise) {
    var series = evals.filter(function (r) { return r.compteur.perte && r.compteur.plageNormale[1] >= q * 0.7; }).slice(0, 6);
    if (!series.length) return '<h2>Courbes de perte de pression</h2><p class="aide">Aucune courbe disponible pour cette demande (MACH 10 : perte non fournie).</p>';
    var W = 640, H = 300, g = { l: 44, r: 12, t: 12, b: 38 };
    var xmax = Math.max(q * 1.6, 10);
    var plusLongue = Math.max.apply(null, series.map(function (r) { var p = r.compteur.perte; return p[p.length - 1][0]; }));
    xmax = Math.min(xmax, plusLongue);
    if (xmax < q * 1.1) xmax = q * 1.1;
    var ymax = 10;
    function X(v) { return g.l + v / xmax * (W - g.l - g.r); }
    function Y(v) { return H - g.b - v / ymax * (H - g.t - g.b); }
    var svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" class="graphique" role="img" aria-label="Courbes de perte de pression en fonction du débit">';
    for (var y = 0; y <= ymax; y += 2) svg += '<line class="grille-l" x1="' + g.l + '" x2="' + (W - g.r) + '" y1="' + Y(y) + '" y2="' + Y(y) + '"/><text class="axe" x="' + (g.l - 6) + '" y="' + (Y(y) + 4) + '" text-anchor="end">' + y + '</text>';
    var pas = xmax > 200 ? 50 : xmax > 80 ? 20 : xmax > 30 ? 10 : 5;
    for (var x = 0; x <= xmax; x += pas) svg += '<line class="grille-l" x1="' + X(x) + '" x2="' + X(x) + '" y1="' + g.t + '" y2="' + (H - g.b) + '"/><text class="axe" x="' + X(x) + '" y="' + (H - g.b + 16) + '" text-anchor="middle">' + x + '</text>';
    svg += '<text class="axe" x="' + ((W + g.l) / 2) + '" y="' + (H - 4) + '" text-anchor="middle">Débit (gal US/min)</text>';
    svg += '<text class="axe" transform="translate(12 ' + ((H - g.b) / 2) + ') rotate(-90)" text-anchor="middle">Perte (psi)</text>';
    svg += '<defs><clipPath id="zone"><rect x="' + g.l + '" y="' + g.t + '" width="' + (W - g.l - g.r) + '" height="' + (H - g.t - g.b) + '"/></clipPath></defs><g clip-path="url(#zone)">';
    if (permise != null) {
      var pp = permise / CompteursDB.KPA_PAR_PSI;
      svg += '<line class="limite" x1="' + g.l + '" x2="' + (W - g.r) + '" y1="' + Y(pp) + '" y2="' + Y(pp) + '"/>';
    }
    series.forEach(function (r, i) {
      var pts = r.compteur.perte.map(function (p) { return X(p[0]).toFixed(1) + ',' + Y(p[1]).toFixed(1); }).join(' ');
      svg += '<polyline class="courbe c' + i + (r.compteur.technologie === 'electromagnetique' ? ' tirets' : '') + '" points="' + pts + '"/>';
      if (r.perte.statut === 'calculee') svg += '<circle class="point c' + i + '" cx="' + X(q) + '" cy="' + Y(r.perte.psi) + '" r="4"/>';
    });
    svg += '<line class="demande" x1="' + X(q) + '" x2="' + X(q) + '" y1="' + g.t + '" y2="' + (H - g.b) + '"/></g></svg>';
    var legende = '<ul class="legende">' + series.map(function (r, i) {
      return '<li><span class="trait c' + i + (r.compteur.technologie === 'electromagnetique' ? ' tirets' : '') + '"></span>' + esc(nomCpt(r.compteur)) + '</li>';
    }).join('') + '<li><span class="trait demande"></span>Demande ' + fmt(q, 2) + ' gpm</li>' +
      (permise != null ? '<li><span class="trait limite"></span>Perte admissible ' + fmt(permise / CompteursDB.KPA_PAR_PSI, 2) + ' psi</li>' : '') + '</ul>';
    return '<h2>Courbes de perte de pression ' + ref('art9_al3') + '</h2>' + svg + legende +
      '<p class="aide">Courbes reconstituées à partir des points lus sur les graphiques des fiches fabricants (≈ ±0,2 psi) — à confirmer.</p>';
  }


  // ---------- bilan de pression (CNP 2020, note A-2.6.3.1. 2)) ----------
  function vueBilan() {
    var b = etat.bilan;
    function champ(cle, libelle, unite) {
      return '<label class="champ">' + esc(libelle) + ' (' + unite + ')<input type="number" step="any" data-champ="bilan.' + cle + '" value="' + esc(b[cle]) + '"></label>';
    }
    var options = [['', 'Proposition du module 3 (première dont la perte est connue)']]
      .concat(CompteursDB.COMPTEURS.filter(function (c) { return c.perte; }).map(function (c) { return [c.id, nomCpt(c)]; }))
      .concat([['manuel', 'Saisie manuelle']]);
    return '<section class="carte" id="bilan"><h2>Bilan de pression ' + ref('cnp_A2631') + ' ' + ref('cnp_2631') + '</h2>' +
      '<p class="aide">Méthode de la perte de pression moyenne du CNP 2020 (Code de construction du Québec, chapitre III). Le CNP ne fixe aucune pression minimale par appareil : elle provient des spécifications du fabricant de la robinetterie ' + ref('cnp_2631') + '. Ce bilan est un outil de préparation ; le calcul hydraulique visé à l\'article 9 al. 4 doit être signé par un ingénieur ' + ref('art9_al4') + '.</p>' +
      '<div class="grille">' +
      champ('pStatique', 'Pression statique minimale à la limite de propriété', 'kPa') +
      champ('perteBranchement', 'Pertes du branchement d\'eau général', 'kPa') +
      '<label class="champ">Compteur<select data-champ="bilan.compteurId">' + options.map(function (o) {
        return '<option value="' + esc(o[0]) + '"' + (b.compteurId === o[0] ? ' selected' : '') + '>' + esc(o[1]) + '</option>';
      }).join('') + '</select></label>' +
      champ('perteCompteurManuelle', 'Perte du compteur, si saisie manuelle', 'kPa') +
      champ('autresPertes', 'Réducteur de pression, DAR, traitement, autres dispositifs', 'kPa') +
      champ('hauteurM', 'Différence de hauteur entrée → robinet le plus éloigné', 'm') +
      champ('pressionMin', 'Pression de service minimale du robinet le plus éloigné (fabricant)', 'kPa') +
      champ('longueur', 'Longueur développée entrée → robinet le plus éloigné', 'm') +
      champ('facteur', 'Facteur de raccords (1,5 si le diamètre intérieur des raccords ≥ DN du tuyau)', '×') +
      '</div><div id="m3-bilan"></div></section>';
  }

  function calculerBilan(d) {
    var b = etat.bilan, perte = null, compteur = null, note = '';
    var q = demandeSelection(d).q;
    if (b.compteurId === 'manuel') {
      perte = Calculs.nombre(b.perteCompteurManuelle);
      note = 'perte saisie';
    } else {
      if (b.compteurId) compteur = CompteursDB.COMPTEURS.filter(function (c) { return c.id === b.compteurId; })[0];
      else if (q > 0) {
        var sel = Calculs.selectionnerCompteurs(q, pertePermise(), null);
        var props = Object.keys(sel.propositions).map(function (k) { return sel.propositions[k]; }).filter(function (r) { return r.perte.statut === 'calculee'; });
        compteur = props.length ? props[0].compteur : null;
      }
      if (compteur && q > 0) {
        var pa = Calculs.perteA(compteur, q);
        if (pa.statut === 'calculee') { perte = pa.kpa; note = nomCpt(compteur) + ' à ' + fmt(q, 2) + ' gpm (lecture de fiche)'; }
        else note = nomCpt(compteur) + ' : perte non disponible à ce débit';
      }
    }
    var bilan = Calculs.bilanPression({
      pStatique: b.pStatique, perteBranchement: b.perteBranchement, perteCompteur: perte, autresPertes: b.autresPertes,
      hauteurM: b.hauteurM, pressionMin: b.pressionMin, longueur: b.longueur, facteur: b.facteur
    });
    return { bilan: bilan, perteCompteur: perte, note: note };
  }

  function majBilan(d) {
    var el = document.getElementById('m3-bilan');
    if (!el) return;
    var b = etat.bilan;
    if (b.pStatique === '' || b.longueur === '') { el.innerHTML = '<p class="aide">Saisir au moins la pression statique minimale et la longueur développée.</p>'; return; }
    var r = calculerBilan(d), x = r.bilan;
    var h = '<table class="etapes"><tbody>' +
      etape('Étape 1c) Pression ajustée au point d\'entrée = ' + fmt(Calculs.nombre(b.pStatique), 1) + ' − ' + fmt(Calculs.nombre(b.perteBranchement), 1), '<strong>' + fmt(x.pAjustee, 1) + ' kPa</strong>', 'cnp_A2631') +
      etape('Perte du compteur', r.perteCompteur == null ? aConfirmer('Perte du compteur inconnue') + ' non comptée' : fmt(r.perteCompteur, 1) + ' kPa <span class="aide">(' + esc(r.note) + ')</span>', 'art9_al3') +
      etape('Autres dispositifs (RP, DAR, traitement…)', fmt(Calculs.nombre(b.autresPertes), 1) + ' kPa', 'cnp_A2631') +
      etape('Hauteur : ' + fmt(Calculs.nombre(b.hauteurM), 2) + ' m × 9,81 kPa/m', fmt(x.hauteurKpa, 1) + ' kPa <span class="aide">(conversion physique)</span>', 'cnp_A2631') +
      etape('Pression minimale du robinet le plus éloigné', fmt(Calculs.nombre(b.pressionMin), 1) + ' kPa', 'cnp_2631') +
      etape('Étape 1d) Pression disponible pour les pertes de charge', '<strong>' + fmt(x.pDispo, 1) + ' kPa</strong>', 'cnp_A2631') +
      etape('Longueur équivalente = ' + fmt(Calculs.nombre(b.longueur), 1) + ' m × ' + fmt(Calculs.nombre(b.facteur) || 1.5, 2), fmt(x.longueurEquivalente, 1) + ' m', 'cnp_A2631') +
      etape('Étape 1e) Pression disponible par mètre', '<strong>' + (x.kpaParMetre == null ? '—' : fmt(x.kpaParMetre, 2) + ' kPa/m') + '</strong>', 'cnp_A2631_ex') +
      '</tbody></table>';
    if (x.methodeApplicable === true) {
      h += '<div class="statut statut-ok"><strong>≥ 2,6 kPa/m : méthode de la perte de pression moyenne applicable</strong><span>Dimensionner ensuite chaque tronçon avec le tableau A-2.6.3.1. 2)-F (vitesse ≤ 3,0 m/s) ' + ref('cnp_2635') + '.</span></div>';
    } else if (x.methodeApplicable === false) {
      h += '<div class="statut statut-err"><strong>< 2,6 kPa/m : calcul selon une méthode détaillée de conception technique requis</strong><span>La pression disponible est insuffisante pour la méthode simplifiée ' + ref('cnp_A2631') + '.</span></div>';
    }
    if (x.reducteurRequis) h += '<div class="statut statut-warn"><strong>Pression statique > 550 kPa</strong><span>Réducteur de pression requis pour tout appareil où la pression statique peut dépasser 550 kPa ' + ref('cnp_2633') + '.</span></div>';
    h += '<h3>Lien avec le critère de perte de pression du compteur</h3>' +
      '<p>Pour conserver 2,6 kPa/m, le compteur peut perdre au plus <strong>' + fmt(x.perteCompteurMax, 1) + ' kPa</strong> ' +
      '(pression disponible ' + fmt(x.pAjustee, 1) + ' kPa ; pression requise en aval ' + fmt(x.requiseAvalCompteur, 1) + ' kPa).</p>' +
      '<button class="btn" data-action="appliquer-bilan">Utiliser ces pressions pour la sélection du compteur</button>';
    el.innerHTML = h;
  }

  // ---------- modules 4 à 7 : branchements ----------
  var TYPES_BR = [['potable', 'Eau potable'], ['incendie', 'Protection incendie'], ['combine', 'Combiné (incendie + autres besoins)']];
  var MATERIAUX = ['Acier galvanisé', 'Cuivre', 'CPVC', 'Fonte', 'Plomb', 'Autre'];
  var DIAM_BR = [20, 25, 40, 50, 75, 80, 100, 150, 200, 250, 300, 350];
  var TYPES_CPT = [['', '— choisir —'], ['volumetrique', 'Volumétrique / mécanique'], ['electromagnetique', 'Électromagnétique'], ['ultrasonique', 'Ultrasonique']];

  function brDe(el) {
    var c = el.closest('[data-br]');
    var id = c && c.getAttribute('data-br');
    return etat.branchements.filter(function (b) { return b.id === id; })[0];
  }

  function brSelect(b, champ, libelle, opts, refCle) {
    return '<label class="champ">' + esc(libelle) + (refCle ? ' ' + ref(refCle) : '') + '<select data-br-champ="' + champ + '">' + opts.map(function (o) {
      var v = Array.isArray(o) ? o[0] : o, l = Array.isArray(o) ? o[1] : o;
      return '<option value="' + esc(v) + '"' + (String(b[champ]) === String(v) ? ' selected' : '') + '>' + esc(l) + '</option>';
    }).join('') + '</select></label>';
  }
  function brNombre(b, champ, libelle, refCle) {
    return '<label class="champ">' + esc(libelle) + (refCle ? ' ' + ref(refCle) : '') + '<input type="number" min="0" step="1" data-br-champ="' + champ + '" value="' + esc(b[champ]) + '"></label>';
  }
  function brOuiNon(b, champ, libelle, refCle) {
    var v = b[champ] || '';
    return '<fieldset class="tri"><legend>' + esc(libelle) + (refCle ? ' ' + ref(refCle) : '') + '</legend>' + [['oui', 'Oui'], ['non', 'Non']].map(function (o) {
      return '<label><input type="radio" name="' + b.id + '-' + champ + '" data-br-champ="' + champ + '" value="' + o[0] + '"' + (v === o[0] ? ' checked' : '') + '> ' + o[1] + '</label>';
    }).join('') + '</fieldset>';
  }
  function diamOpts(liste) {
    return [['', '— mm —']].concat(liste.map(function (d) { return [d, d + ' mm']; }));
  }
  function libelleType(t) { return TYPES_BR.filter(function (x) { return x[0] === t; })[0][1]; }

  function evaluations(b) {
    var ch = CalculsB.evaluerChambre(b, etat.immeuble, etat.branchements.length);
    var co = CalculsB.evaluerComptage(b, ch, etat.admissibilite.partieResidentielle);
    return { chambre: ch, comptage: co };
  }

  var STATUTS_CHAMBRE = {
    requise: ['Chambre requise', 'err'], option: ['Chambre ou rapport annuel de détection de fuite', 'warn'],
    non_requise: ['Chambre non requise', 'ok'], a_confirmer: ['À confirmer', 'warn']
  };
  var STATUTS_COMPTAGE = {
    requis: ['Compteur requis', 'err'], aucun: ['Aucun compteur de consommation', 'ok'], a_confirmer: ['À confirmer', 'warn']
  };

  function listeMotifs(motifs) {
    return '<ul class="motifs">' + motifs.map(function (m) {
      return '<li>' + esc(m.texte) + ' ' + ref(m.ref) + (m.aConfirmer ? ' ' + aConfirmer(m.texte) : '') + '</li>';
    }).join('') + '</ul>';
  }

  // Schéma de comptage : du réseau de la Ville jusqu'aux usages desservis.
  function schema(b, ev) {
    var e = [], ch = ev.chambre, co = ev.comptage;
    e.push(['reseau', 'Aqueduc (Ville)']);
    if (ch.statut === 'requise' || ch.statut === 'option') e.push(['chambre', 'Chambre ' + ch.croquis.code + (ch.statut === 'option' ? ' (option a)' : '')]);
    if (b.type === 'incendie') {
      e.push(['incendie', 'Protection incendie — non mesurée']);
    } else {
      if (b.type === 'combine') e.push(['incendie', 'Dérivation incendie (non mesurée)']);
      if (co.statut === 'requis') {
        if (b.dessertResidentiel === 'oui' && b.separationAutrePiece !== 'oui') e.push(['residentiel', 'Résidentiel en amont (non mesuré)']);
        e.push(['compteur', 'Compteur' + (b.diametrePreparationMm ? ' ' + b.diametrePreparationMm + ' mm' : '')]);
        e.push(['dar', 'Dispositif antirefoulement']);
        e.push(['usage', b.dessertResidentiel === 'oui' && b.separationAutrePiece === 'oui' ? 'Établissements + logements' : 'Établissements']);
      } else {
        e.push(['usage', b.dessertResidentiel === 'oui' ? 'Logements (non mesurés)' : 'Usages desservis']);
      }
    }
    return '<ol class="schema" aria-label="Schéma de comptage">' + e.map(function (x) {
      return '<li class="noeud noeud-' + x[0] + '">' + esc(x[1]) + '</li>';
    }).join('') + '</ol>';
  }

  function vueModule4() {
    var h = '<section class="carte"><h2>Branchements du projet ' + ref('annD') + '</h2>' +
      '<p class="aide">Un branchement est une conduite raccordée directement au réseau de la Ville, sans passer par un autre bâtiment (annexe D, § 1.5). Les compteurs mesurent la consommation des établissements, sauf l\'eau de protection incendie ' + ref('art3') + '.</p>' +
      '<fieldset class="tri"><legend>Réseau de distribution d\'eau potable privé sur le lot (plusieurs branchements raccordés à l\'aqueduc) ' + ref('art8_1') + '</legend>' +
      [['oui', 'Oui'], ['non', 'Non']].map(function (o) {
        return '<label><input type="radio" name="reseauPrive" data-champ="immeuble.reseauPrive" value="' + o[0] + '"' + (etat.immeuble.reseauPrive === o[0] ? ' checked' : '') + '> ' + o[1] + '</label>';
      }).join('') + '</fieldset></section>';
    h += etat.branchements.map(function (b) {
      return '<section class="carte" data-br="' + b.id + '"><div class="etab-tete">' +
        '<label class="champ">Nom<input type="text" data-br-champ="nom" value="' + esc(b.nom) + '"></label>' +
        brSelect(b, 'type', 'Type', TYPES_BR) +
        brSelect(b, 'diametreMm', 'Diamètre', diamOpts(DIAM_BR)) +
        brSelect(b, 'materiau', 'Matériau', [['', '— choisir —']].concat(MATERIAUX)) +
        brSelect(b, 'neuf', 'Branchement', [['existant', 'Existant'], ['nouveau', 'Nouveau']], 'art5') +
        (etat.branchements.length > 1 ? '<button class="btn btn-sec" data-action="retirer-br">Retirer</button>' : '') + '</div>' +
        '<div class="colonnes"><div>' +
        brOuiNon(b, 'dessertEtablissements', 'Dessert des établissements (usage non résidentiel)', 'art3') +
        brOuiNon(b, 'dessertResidentiel', 'Dessert aussi des logements', 'annD_17') +
        brOuiNon(b, 'separationAutrePiece', 'Séparer la tuyauterie des établissements exigerait des travaux dans une autre pièce que celle de l\'entrée d\'eau', 'art4') +
        brOuiNon(b, 'temporaire', 'Branchement temporaire', 'art3') +
        '<div class="grille">' + brNombre(b, 'nbBatiments', 'Bâtiments desservis', 'art8') + '</div>' +
        brOuiNon(b, 'memeProprietaire', 'Bâtiments d\'un seul propriétaire ou d\'une seule unité d\'évaluation', 'art8') +
        '</div><div class="resultat" id="m4-' + b.id + '"></div></div></section>';
    }).join('');
    h += '<div class="actions"><button class="btn" data-action="ajouter-br">+ Ajouter un branchement</button></div>';
    h += '<section class="carte"><h2>Règles d\'emplacement du compteur ' + ref('annB_notes') + '</h2><ul class="motifs">' +
      RCG.ANNEXE_B.notesInstallation.filter(function (n) { return ['A2', 'A3', 'A4', 'A6'].indexOf(n.code) > -1; })
        .map(function (n) { return '<li><strong>' + n.code + '</strong> — ' + esc(n.texte) + '</li>'; }).join('') + '</ul></section>';
    return h;
  }

  function majModule4(b, ev) {
    var el = document.getElementById('m4-' + b.id);
    if (!el) return;
    var co = ev.comptage, st = STATUTS_COMPTAGE[co.statut], ch = STATUTS_CHAMBRE[ev.chambre.statut];
    el.innerHTML = '<div class="statut statut-' + st[1] + '"><strong>' + st[0] + '</strong>' +
      (co.points.length ? '<span>' + co.points.map(esc).join(' · ') + '</span>' : '') +
      '<span>Chambre : ' + ch[0] + ' (module 5) ' + ref('art5') + '</span></div>' +
      schema(b, ev) + listeMotifs(co.motifs);
  }

  function vueModule5() {
    var h = '<section class="carte"><h2>Exigibilité de la chambre de compteur ' + ref('art5') + '</h2>' +
      '<p class="aide">Compter les joints souterrains de la section privée du branchement : une pièce de raccord (union, coude, T) compte pour un seul joint ' + ref('art5') + '.</p></section>';
    h += etat.branchements.map(function (b) {
      return '<section class="carte" data-br="' + b.id + '"><h2>' + esc(b.nom) + ' <small class="aide">' + esc(libelleType(b.type)) + (b.diametreMm ? ', ' + b.diametreMm + ' mm' : '') + ', ' + (b.neuf === 'nouveau' ? 'nouveau' : 'existant') + '</small></h2>' +
        '<div class="colonnes"><div>' +
        '<div class="grille">' + brNombre(b, 'joints', 'Joints souterrains (section privée)', 'art5') + '</div>' +
        brOuiNon(b, 'cuivreKArgent', 'Tuyaux en cuivre de type K, raccords en cuivre, tous les joints soudés à l\'argent', 'art6') +
        '</div><div class="resultat" id="m5-' + b.id + '"></div></div></section>';
    }).join('');
    h += '<section class="carte" id="m5-normes"></section>';
    return h;
  }

  function majModule5(b, ev) {
    var el = document.getElementById('m5-' + b.id);
    if (!el) return;
    var ch = ev.chambre, st = STATUTS_CHAMBRE[ch.statut];
    var h = '<div class="statut statut-' + st[1] + '"><strong>' + st[0] + '</strong>' +
      ((ch.statut === 'requise' || ch.statut === 'option') ? '<span>' + esc(ch.croquis.titre) + ' ' + ref('annB_chambre') + '</span>' : '') + '</div>' + listeMotifs(ch.motifs);
    if (ch.options.length) h += '<h4>Options pour un branchement existant</h4>' + listeMotifs(ch.options);
    el.innerHTML = h;
  }

  function majNormesChambre(evs) {
    var el = document.getElementById('m5-normes');
    if (!el) return;
    var concernes = evs.filter(function (x) { return x.ev.chambre.statut === 'requise' || x.ev.chambre.statut === 'option'; });
    if (!concernes.length) { el.innerHTML = '<h2>Normes techniques de la chambre</h2><p>Aucune chambre requise pour l\'instant.</p>'; return; }
    el.innerHTML = '<h2>Normes techniques de la chambre ' + ref('annB_chambre') + '</h2><ul class="liste-controle">' +
      RCG.ANNEXE_B.chambre.map(function (n) {
        return '<li><span class="case" aria-hidden="true"></span>' + esc(n.texte) + ' <span class="aide">(croquis ' + n.code + ')</span>' + (n.aConfirmer ? ' ' + aConfirmer(n.texte) : '') + '</li>';
      }).join('') +
      '<li><span class="case" aria-hidden="true"></span>Chambre drainée, facile d\'accès et en bon état en tout temps ; compteur et tuyauterie protégés contre le gel. ' + ref('art15') + '</li>' +
      '<li><span class="case" aria-hidden="true"></span>Chambre maintenue libre d\'accès pour l\'autorité compétente. ' + ref('art21') + '</li>' +
      '</ul><p class="aide">Croquis applicables : ' + concernes.map(function (x) { return esc(x.b.nom) + ' → ' + esc(x.ev.chambre.croquis.titre); }).join(' ; ') + '</p>';
  }

  function propositionsModule3() {
    var d = Calculs.calculerDemandePointe(etat.etablissements);
    var q = demandeSelection(d).q;
    if (!(q > 0)) return '';
    var sel = Calculs.selectionnerCompteurs(q, pertePermise(), null);
    var p = Object.keys(sel.propositions).map(function (k) { var c = sel.propositions[k].compteur; return c.modele + ' ' + c.diametreMm + ' mm'; });
    return p.length ? 'Propositions du module 3 : ' + p.join(', ') + '.' : '';
  }

  function vueModule6() {
    var avecCompteur = etat.branchements.filter(function (b) { return evaluations(b).comptage.statut === 'requis'; });
    var h = '<section class="carte"><h2>Préparation de l\'emplacement ' + ref('art9_al1') + '</h2>' +
      '<p>Le propriétaire prépare l\'endroit, fournit et installe à ses frais la tuyauterie ' + ref('art9_al2') + ', y compris un dispositif antirefoulement ' + ref('art9_al5') + ', selon l\'annexe B ' + ref('art9_al6') + ', puis transmet la fiche d\'auto-inspection ' + ref('annE') + '.</p>' +
      '<label class="champ">Usage de l\'immeuble listé à l\'annexe G (dérivation) ' + ref('annG') + '<select data-champ="immeuble.codeUsageG"><option value="">Aucun usage de l\'annexe G</option>' +
      RCG.ANNEXE_G.map(function (g) { return '<option value="' + g.code + '"' + (etat.immeuble.codeUsageG === g.code ? ' selected' : '') + '>' + g.code + ' — ' + esc(g.libelle) + '</option>'; }).join('') +
      '</select></label><p class="aide">' + esc(propositionsModule3()) + '</p></section>';
    if (!avecCompteur.length) h += '<section class="carte"><p>Aucun branchement avec compteur (module 4).</p></section>';
    h += avecCompteur.map(function (b) {
      return '<section class="carte" data-br="' + b.id + '"><h2>' + esc(b.nom) + ' <small class="aide">' + esc(libelleType(b.type)) + (b.diametreMm ? ', branchement ' + b.diametreMm + ' mm' : '') + '</small></h2>' +
        '<div class="etab-tete">' +
        brSelect(b, 'diametrePreparationMm', 'Diamètre de la préparation (compteur)', diamOpts(CompteursDB.DIAMETRES_ANNEXE_B), 'annB_notes') +
        brSelect(b, 'typeCompteur', 'Type de compteur', TYPES_CPT, 'art12') + '</div>' +
        (b.typeCompteur === 'electromagnetique' ? brOuiNon(b, 'alimentation120', 'Compteur muni d\'une alimentation électrique de 120 V', 'art12') : '') +
        '<div id="m6-' + b.id + '"></div></section>';
    }).join('');
    h += '<section class="carte"><h2>Notes d\'installation communes ' + ref('annB_notes') + '</h2><ul class="liste-controle">' +
      RCG.ANNEXE_B.notesInstallation.map(function (n) { return '<li><span class="case" aria-hidden="true"></span><strong>' + esc(n.code) + '</strong> — ' + esc(n.texte) + '</li>'; }).join('') + '</ul></section>';
    h += vueFicheE(avecCompteur);
    return h;
  }

  function cote(v) { return v == null ? '—' : fmt(v) + ' mm'; }

  function majModule6(b, ev) {
    var el = document.getElementById('m6-' + b.id);
    if (!el) return;
    if (!b.diametrePreparationMm) { el.innerHTML = '<p class="aide">Choisir le diamètre de la préparation.</p>'; return; }
    var preps = CalculsB.preparationTuyauterie(b.diametrePreparationMm);
    var h = '';
    preps.forEach(function (p) {
      var l = p.ligne;
      h += '<h3>' + esc(p.titre) + ' ' + ref(p.ref) + '</h3><div class="defile"><table class="inventaire"><tbody>' +
        (l.transition ? '<tr><th>Pièce de transition (fournie par la Ville)</th><td>' + cote(l.transition) + ' (' + esc(l.transitionPo) + ' po) · ' + esc(l.raccordTransition) + '</td></tr><tr><th>Raccords de la pièce de transition</th><td>' + esc(l.raccord) + ' ; soudé ou serti ; cuivre ou bronze</td></tr>' : '') +
        (l.LD ? '<tr><th>Section droite minimale (LD)</th><td>' + cote(l.LD) + '</td></tr>' : '') +
        (l.LS ? '<tr><th>Pièce de transition (LS)</th><td>' + cote(l.LS) + ' ' + aConfirmer('La note C4 désigne cette longueur « LC », alors que le tableau l\'appelle LS et réserve LC à la longueur du compteur.') + '</td></tr>' : '') +
        (l.LC ? '<tr><th>' + (l.LS ? 'Longueur du compteur (LC)' : 'Pièce de transition (LC)') + '</th><td>' + cote(l.LC) + '</td></tr>' : '') +
        (l.LT ? '<tr><th>Té de test (LT) — port d\'essai 50 mm sur le dessus</th><td>' + cote(l.LT) + '</td></tr>' : '') +
        (l.LP ? '<tr><th>Bride au port d\'essai, minimum (LP)</th><td>' + cote(l.LP) + '</td></tr>' : '') +
        '<tr><th>Dégagements autour du compteur : dessus A / dessous B / derrière C / devant D</th><td>' + [l.A, l.B, l.C, l.D].map(cote).join(' / ') + '</td></tr>' +
        '<tr><th>Robinets</th><td>' + esc(p.robinets) + '</td></tr>' +
        '</tbody></table></div>';
    });
    if (!preps.length) h += '<p>' + aConfirmer('Diamètre absent de l\'annexe B') + ' Diamètre non prévu à l\'annexe B.</p>';

    var der = CalculsB.evaluerDerivation(b.diametrePreparationMm, b.diametreMm, etat.immeuble.codeUsageG);
    var libDer = { obligatoire: ['Dérivation obligatoire', 'warn'], permise: ['Dérivation permise (optionnelle)', 'ok'], interdite: ['Dérivation interdite', 'err'], a_confirmer: ['Dérivation : à confirmer', 'warn'] }[der.statut];
    h += '<h3>Voie de dérivation ' + ref('art11') + '</h3><div class="statut statut-' + libDer[1] + '"><strong>' + libDer[0] + '</strong></div>' + listeMotifs(der.motifs);

    var chambreRequise = ev.chambre.statut === 'requise';
    var elec = CalculsB.evaluerElectrique(b.typeCompteur, b.diametrePreparationMm, b.alimentation120, chambreRequise);
    h += '<h3>Alimentation électrique ' + ref('art12') + '</h3>';
    if (elec.statut === 'applicable') {
      h += '<ul class="liste-controle">' + elec.exigences.map(function (x) { return '<li><span class="case" aria-hidden="true"></span>' + esc(x.texte) + ' ' + ref(x.ref) + '</li>'; }).join('') + '</ul>';
      if (ev.chambre.statut === 'option') h += '<p class="aide">Si la chambre est construite (option a), les exigences du panneau extérieur de l\'article 12 al. 2 s\'appliquent.</p>';
    } else if (elec.statut === 'a_confirmer') {
      h += '<p>' + aConfirmer(elec.note) + ' ' + esc(elec.note) + '</p>';
    } else {
      h += '<p>Non applicable : l\'article 12 vise les compteurs électromagnétiques de 50 mm et plus munis d\'une alimentation de 120 V.' + (elec.note ? ' ' + esc(elec.note) : '') + '</p>';
    }
    el.innerHTML = h;
  }

  // Annexe E — fiche d'auto-inspection (révision 7).
  var FICHE_E = [
    { section: 'Section 1 — Préparation de tuyauterie', champs: [
      ['robinetArretDiametre', 'Robinet d\'arrêt du bâtiment — diamètre'], ['etancheite', 'Étanchéité', ['oui', 'non', 'remplacement']],
      ['prepDiametre', 'Diamètre de la préparation'], ['robinetsType', 'Robinets d\'isolation du compteur — type', ['à bille', 'à vanne']],
      ['robinetsRaccords', 'Raccords', ['filetés', 'soudés', 'à brides']], ['robinetsDiametre', 'Robinets — diamètre'], ['robinetsNombre', 'Robinets — nombre'],
      ['raccordUnions', 'Adaptateurs de compteur — raccord-unions', ['filetés', 'à brides']], ['adaptateursDiametre', 'Adaptateurs — diamètre'],
      ['transitionLongueur', 'Pièce de transition — longueur'], ['transitionDiametre', 'Pièce de transition — diamètre'], ['materiel', 'Matériel'],
      ['derivationAutorisation', 'Dérivation — autorisation', ['oui', 'non']], ['derivationInstallee', 'Dérivation — installée', ['oui', 'non']],
      ['robinetVerrouillableType', 'Robinet verrouillable — type'], ['robinetVerrouillableDiametre', 'Robinet verrouillable — diamètre']] },
    { section: 'Section 2 — Dispositif antirefoulement', champs: [
      ['darType', 'DAR installé', ['DArPR', 'DAr2CR']], ['darSerie', 'N° de série'], ['verification', 'Vérification'],
      ['rapportRemis', 'Rapport d\'inspection remis au propriétaire', ['oui', 'non']], ['etiquete', 'Étiqueté', ['oui', 'non']], ['darDiametre', 'Diamètre'],
      ['tamis', 'Tamis installé', ['oui', 'non']], ['tamisDiametre', 'Tamis — diamètre'], ['verificateur', 'Nom et numéro du vérificateur']] },
    { section: 'Section 3 — Général', champs: [
      ['valveSurpression', 'Valve de surpression installée', ['oui', 'non']], ['miseTerre', 'Mise à la terre installée', ['oui', 'non']],
      ['support', 'Support adéquat', ['oui', 'non']], ['degagement', 'Dégagement respecté', ['oui', 'non']], ['etancheiteBonne', 'Étanchéité bonne', ['oui', 'non']],
      ['pressionSysteme', 'Pression du système (après DAR)']] },
    { section: 'Section 4 — Compteur d\'eau', champs: [
      ['compteurExistant', 'Numéro du compteur existant'], ['compteurNouveau', 'Numéro du nouveau compteur'],
      ['lectureExistant', 'Lecture du compteur existant'], ['lectureNouveau', 'Lecture du nouveau compteur'],
      ['uniteExistant', 'Unité de mesure (existant)', ['Usgpm', 'Gpm', 'M3', 'Pi3']], ['uniteNouveau', 'Unité de mesure (nouveau)', ['Usgpm', 'Gpm', 'M3', 'Pi3']],
      ['diametreExistantPo', 'Diamètre existant (po)'], ['diametreNouveauPo', 'Diamètre nouveau (po)'],
      ['reinstalle', 'Le compteur existant a été réinstallé', ['oui', 'non']], ['date', 'Date'], ['entreprise', 'Entreprise'], ['nom', 'Nom'], ['signature', 'Signature']] }
  ];

  function vueFicheE(avecCompteur) {
    if (!avecCompteur.length) return '';
    var bid = etat.autoInspection.branchement;
    if (!avecCompteur.some(function (b) { return b.id === bid; })) bid = etat.autoInspection.branchement = avecCompteur[0].id;
    var b = avecCompteur.filter(function (x) { return x.id === bid; })[0];
    var v = etat.autoInspection[bid] || {};
    var prep = b.diametrePreparationMm ? CalculsB.preparationTuyauterie(b.diametrePreparationMm)[0] : null;
    var attendu = {
      prepDiametre: b.diametrePreparationMm ? b.diametrePreparationMm + ' mm' : '',
      transitionLongueur: prep ? (prep.ligne.transition || prep.ligne.LS || prep.ligne.LC) + ' mm' : '',
      transitionDiametre: b.diametrePreparationMm ? b.diametrePreparationMm + ' mm' : ''
    };
    var h = '<section class="carte"><h2>Fiche d\'auto-inspection ' + ref('annE') + '</h2>' +
      '<p class="aide">À transmettre à l\'autorité compétente une fois les travaux terminés ' + ref('art9_al1') + '. Les valeurs attendues selon l\'annexe B sont indiquées en gris.</p>' +
      '<label class="champ">Branchement<select data-champ="autoInspection.branchement" data-rerendre>' +
      avecCompteur.map(function (x) { return '<option value="' + x.id + '"' + (x.id === bid ? ' selected' : '') + '>' + esc(x.nom) + '</option>'; }).join('') + '</select></label>' +
      '<div class="grille"><label class="champ">Nom du propriétaire<input type="text" data-ai-champ="proprietaire" value="' + esc(v.proprietaire) + '"></label>' +
      '<label class="champ">N° UEF<input type="text" data-ai-champ="uef" value="' + esc(v.uef) + '"></label>' +
      '<label class="champ">Adresse des travaux<input type="text" data-ai-champ="adresse" value="' + esc(v.adresse || etat.projet.adresse) + '"></label></div>';
    FICHE_E.forEach(function (s) {
      h += '<h3>' + esc(s.section) + '</h3><div class="grille">' + s.champs.map(function (c) {
        var id = 'ai-' + c[0];
        if (c[2]) {
          return '<label class="champ" for="' + id + '">' + esc(c[1]) + '<select id="' + id + '" data-ai-champ="' + c[0] + '"><option value=""></option>' +
            c[2].map(function (o) { return '<option' + (v[c[0]] === o ? ' selected' : '') + '>' + esc(o) + '</option>'; }).join('') + '</select></label>';
        }
        return '<label class="champ" for="' + id + '">' + esc(c[1]) + '<input id="' + id + '" type="text" data-ai-champ="' + c[0] + '" value="' + esc(v[c[0]]) + '"' +
          (attendu[c[0]] ? ' placeholder="attendu : ' + esc(attendu[c[0]]) + '"' : '') + '></label>';
      }).join('') + '</div>';
    });
    return h + '</section>';
  }

  function majBranchements() {
    var evs = etat.branchements.map(function (b) { return { b: b, ev: evaluations(b) }; });
    evs.forEach(function (x) { majModule4(x.b, x.ev); majModule5(x.b, x.ev); majModule6(x.b, x.ev); });
    majNormesChambre(evs);
  }

  // ---------- module 7 ----------
  var DIAM_C = [['inconnu', 'Inconnu'], [13, '13 mm'], [15, '15 mm'], [20, '20 mm'], [25, '25 mm'], [40, '40 mm'], [50, '50 mm'], [75, '75 mm'], [80, '80 mm'],
    [100, '100 mm'], [150, '150 mm'], [200, '200 mm'], [250, '250 mm'], [300, '300 mm'], [350, '350 mm'], [400, '400 mm']];

  function vueModule7() {
    var c = etat.consommation;
    return '<div class="colonnes"><div><section class="carte"><h2>Consommation réputée en cas de défaut ' + ref('art13') + '</h2>' +
      '<p class="aide">Si le propriétaire ou l\'occupant ne permet pas les travaux, la consommation non mesurée est réputée égale à la consommation maximale ininterrompue selon le diamètre de l\'entrée d\'eau desservant l\'eau domestique ' + ref('art13') + '.</p>' +
      '<label class="champ">Diamètre de l\'entrée d\'eau desservant l\'eau domestique<select data-champ="consommation.diametreMm">' +
      DIAM_C.map(function (d) { return '<option value="' + d[0] + '"' + (String(c.diametreMm) === String(d[0]) ? ' selected' : '') + '>' + d[1] + '</option>'; }).join('') + '</select></label>' +
      '<div class="grille"><label class="champ">Période visée (jours)<input type="number" min="0" step="1" data-champ="consommation.jours" value="' + esc(c.jours) + '"></label>' +
      '<label class="champ">Tarif de l\'eau ($/m³), facultatif<input type="number" min="0" step="any" data-champ="consommation.tarif" value="' + esc(c.tarif) + '"></label></div>' +
      '<p class="aide">Le tarif ne figure pas au règlement : valeur saisie par l\'usager, pour estimer l\'exposition financière.</p></section></div>' +
      '<div><section class="carte resultat" id="m7-resultat" aria-live="polite"></section></div></div>' +
      '<section class="carte" id="m7-tableau"></section>';
  }

  function majModule7() {
    var el = document.getElementById('m7-resultat');
    if (!el) return;
    var c = etat.consommation, r = CalculsB.consommationReputee(c.diametreMm);
    var h = '<h2>Résultat</h2>';
    if (!r.couvert) {
      h += '<div class="statut statut-warn"><strong>Non couvert ' + aConfirmer(r.motif) + '</strong><span>' + esc(r.motif) + ' ' + ref('annC') + '</span></div>';
    } else {
      var jours = Calculs.nombre(c.jours), tarif = Calculs.nombre(c.tarif);
      h += '<div class="statut statut-err"><strong>' + fmt(r.m3j, 0) + ' m³/jour</strong><span>Diamètre retenu : ' + esc(r.ligne.libelle) + ' mm ' + ref('annC') + '</span>' +
        (r.motif ? '<span>' + esc(r.motif) + ' ' + ref('art13') + '</span>' : '') + '</div>';
      if (jours) {
        h += '<table class="etapes"><tbody>' + etape('Volume réputé : ' + fmt(r.m3j, 0) + ' m³/j × ' + fmt(jours, 0) + ' j', '<strong>' + fmt(r.m3j * jours, 0) + ' m³</strong>', 'art13') +
          (tarif ? '<tr><th scope="row">Montant estimé : volume × ' + fmt(tarif, 4) + ' $/m³ (tarif saisi)</th><td><strong>' + (r.m3j * jours * tarif).toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' }) + '</strong></td><td class="cite"><span class="badge badge-warn">hors règlement</span></td></tr>' : '') +
          '</tbody></table>';
      }
    }
    h += '<p class="aide">L\'article 13 mentionne une vitesse de 3 m/s ; le tableau de l\'annexe C ne correspond pas exactement au calcul théorique (20 mm à 3 m/s ≈ 81,4 m³/j contre 86). Le tableau est appliqué tel quel.</p>';
    el.innerHTML = h;
    document.getElementById('m7-tableau').innerHTML = '<h2>Annexe C — consommation réputée maximale ' + ref('annC') + '</h2><div class="defile"><table class="inventaire"><thead><tr><th>Diamètre nominal (mm)</th><th class="num">m³/jour</th></tr></thead><tbody>' +
      RCG.ANNEXE_C.map(function (l) {
        return '<tr' + (r.couvert && r.ligne === l ? ' class="propose"' : '') + '><td>' + esc(l.libelle) + '</td><td class="num">' + fmt(l.m3j, 0) + '</td></tr>';
      }).join('') + '</tbody></table></div>';
  }

  // ---------- événements ----------
  function etabDe(el) {
    var c = el.closest('[data-etab]');
    if (!c) return null;
    var id = c.getAttribute('data-etab');
    return etat.etablissements.filter(function (e) { return e.id === id; })[0];
  }

  document.addEventListener('input', function (ev) {
    var t = ev.target;
    if (t.hasAttribute('data-champ')) {
      set(t.getAttribute('data-champ'), t.value);
    } else if (t.hasAttribute('data-etab-champ')) {
      etabDe(t)[t.getAttribute('data-etab-champ')] = t.value;
    } else if (t.hasAttribute('data-item')) {
      var e = etabDe(t), id = t.getAttribute('data-item');
      if (t.value === '') delete e.quantites[id]; else e.quantites[id] = t.value;
      var item = RCG.TABLEAU_12.concat(RCG.TABLEAU_13).filter(function (x) { return x.id === id; })[0];
      document.getElementById('t-' + e.id + '-' + id).textContent = fmt(Calculs.contribution(item, t.value));
    } else if (t.hasAttribute('data-br-champ')) {
      brDe(t)[t.getAttribute('data-br-champ')] = t.value;
      if (t.getAttribute('data-br-champ') === 'typeCompteur') { sauver(); rendre(); return; }
    } else if (t.hasAttribute('data-ai-champ')) {
      var bid = etat.autoInspection.branchement || '';
      etat.autoInspection[bid] = etat.autoInspection[bid] || {};
      etat.autoInspection[bid][t.getAttribute('data-ai-champ')] = t.value;
    } else if (t.hasAttribute('data-filtre')) {
      filtrer(t);
      return;
    } else return;
    sauver();
    if (t.hasAttribute('data-rerendre')) { rendre(); return; }
    majResultats();
  });

  function sansAccent(s) { return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); }
  function filtrer(champ) {
    var q = sansAccent(champ.value.trim());
    var carte = champ.closest('[data-etab]');
    carte.querySelectorAll('tr[data-libelle]').forEach(function (tr) {
      tr.hidden = q && sansAccent(tr.getAttribute('data-libelle')).indexOf(q) === -1;
    });
    carte.querySelectorAll('[data-groupe]').forEach(function (g) { if (q) g.classList.remove('replie'); });
  }

  document.addEventListener('click', function (ev) {
    var t = ev.target.closest('[data-onglet],[data-action]');
    if (!t) return;
    if (t.hasAttribute('data-onglet')) {
      var m = MODULES.filter(function (x) { return x.id === t.getAttribute('data-onglet'); })[0];
      ongletActif = m.id;
      try { localStorage.setItem(CLE_STOCKAGE + '.onglet', m.id); } catch (e) { /* ignoré */ }
      rendre();
      window.scrollTo(0, 0);
      return;
    }
    var a = t.getAttribute('data-action');
    if (a === 'ajouter-br') {
      etat.branchements.push(branchementVide(etat.branchements.length + 1));
    } else if (a === 'retirer-br') {
      var br = brDe(t);
      demander('Retirer « ' + br.nom + ' » ?', 'Retirer', function () {
        etat.branchements = etat.branchements.filter(function (x) { return x !== br; });
      });
      return;
    } else if (a === 'ajouter-etab') {
      etat.etablissements.push({ id: nouvelId(), nom: 'Établissement ' + (etat.etablissements.length + 1), usageCas1: '', quantites: {} });
    } else if (a === 'retirer-etab') {
      var e = etabDe(t);
      demander('Retirer « ' + e.nom + ' » et son inventaire ?', 'Retirer', function () {
        etat.etablissements = etat.etablissements.filter(function (x) { return x !== e; });
      });
      return;
    } else if (a === 'basculer-groupe') {
      t.closest('[data-groupe]').classList.toggle('replie');
      return;
    } else if (a === 'exemple') {
      demander('Remplacer le projet courant par le jeu d\'exemple ?', 'Charger l\'exemple', function () { etat = normaliser(copie(EXEMPLE)); });
      return;
    } else if (a === 'nouveau') {
      demander('Effacer le projet courant ?', 'Effacer', function () { etat = projetVide(); });
      return;
    } else if (a === 'exporter') {
      montrerExport();
      return;
    } else if (a === 'copier-export') {
      var zone = document.getElementById('export-json');
      var choisir = function () { zone.focus(); zone.select(); };
      try {
        navigator.clipboard.writeText(zone.value).then(function () { t.textContent = 'Copié'; }, choisir);
      } catch (err) { choisir(); }
      return;
    } else if (a === 'telecharger-export') {
      var blob = new Blob([JSON.stringify(etat, null, 2)], { type: 'application/json' });
      var lien = document.createElement('a');
      lien.href = URL.createObjectURL(blob);
      lien.download = (etat.projet.nom || 'projet').replace(/[^\w-]+/g, '_') + '.json';
      lien.click();
      URL.revokeObjectURL(lien.href);
      return;
    } else if (a === 'appliquer-bilan') {
      var bl = calculerBilan(Calculs.calculerDemandePointe(etat.etablissements)).bilan;
      etat.selection.pressionDisponibleKpa = Math.round(bl.pAjustee * 10) / 10;
      etat.selection.pressionRequiseKpa = Math.round(bl.requiseAvalCompteur * 10) / 10;
    } else if (a === 'confirmer') {
      var f = actionEnAttente;
      fermerBandeau();
      if (f) { f(); sauver(); rendre(); }
      return;
    } else if (a === 'fermer-bandeau') {
      fermerBandeau();
      return;
    } else if (a === 'importer') {
      document.getElementById('fichier-import').click();
      return;
    } else return;
    sauver();
    rendre();
  });

  // Bandeau de confirmation et de messages (les dialogues natifs ne sont pas disponibles partout).
  var actionEnAttente = null;
  function bandeau(html) {
    var b = document.getElementById('bandeau');
    b.innerHTML = html;
    b.hidden = false;
    var btn = b.querySelector('button');
    if (btn) btn.focus();
  }
  function demander(message, libelle, action) {
    actionEnAttente = action;
    bandeau('<span>' + esc(message) + '</span><button class="btn" data-action="confirmer">' + esc(libelle) + '</button><button class="btn btn-sec" data-action="fermer-bandeau">Annuler</button>');
  }
  function informer(message) {
    actionEnAttente = null;
    bandeau('<span>' + esc(message) + '</span><button class="btn btn-sec" data-action="fermer-bandeau">Fermer</button>');
  }
  function fermerBandeau() {
    actionEnAttente = null;
    var b = document.getElementById('bandeau');
    b.hidden = true;
    b.innerHTML = '';
  }
  function montrerExport() {
    actionEnAttente = null;
    bandeau('<div class="export"><label for="export-json">Projet au format JSON — copier ce texte et le conserver dans un fichier .json pour l\'importer plus tard.</label>' +
      '<textarea id="export-json" rows="6" readonly>' + esc(JSON.stringify(etat, null, 2)) + '</textarea>' +
      '<div class="export-actions"><button class="btn" data-action="copier-export">Copier</button>' + (location.protocol === 'file:' ? '<button class="btn btn-sec" data-action="telecharger-export">Télécharger</button>' : '') + '<button class="btn btn-sec" data-action="fermer-bandeau">Fermer</button></div></div>');
  }

  document.getElementById('fichier-import').addEventListener('change', function (ev) {
    var f = ev.target.files[0];
    if (!f) return;
    f.text().then(function (txt) {
      var o = JSON.parse(txt);
      if (!o || !o.admissibilite || !Array.isArray(o.etablissements)) throw new Error('format');
      etat = normaliser(o);
      sauver();
      rendre();
    }).catch(function () { informer('Fichier de projet invalide : choisir un fichier JSON exporté par cet outil.'); });
    ev.target.value = '';
  });

  // Infobulles (survol et focus clavier).
  var bulle = document.getElementById('infobulle');
  function montrer(el) {
    bulle.textContent = el.getAttribute('data-tip');
    bulle.hidden = false;
    var r = el.getBoundingClientRect(), b = bulle.getBoundingClientRect();
    var x = Math.max(8, Math.min(r.left, window.innerWidth - b.width - 8));
    var y = r.bottom + 6;
    if (y + b.height > window.innerHeight - 8) y = r.top - b.height - 6;
    bulle.style.left = x + 'px';
    bulle.style.top = Math.max(8, y) + 'px';
  }
  function cacher() { bulle.hidden = true; }
  ['mouseover', 'focusin'].forEach(function (type) {
    document.addEventListener(type, function (ev) {
      var el = ev.target.closest && ev.target.closest('[data-tip]');
      if (el) montrer(el);
    });
  });
  ['mouseout', 'focusout'].forEach(function (type) {
    document.addEventListener(type, function (ev) {
      if (ev.target.closest && ev.target.closest('[data-tip]')) cacher();
    });
  });
  window.addEventListener('scroll', cacher, { passive: true });

  try {
    var o = localStorage.getItem(CLE_STOCKAGE + '.onglet');
    if (o && MODULES.some(function (m) { return m.id === o; })) ongletActif = o;
  } catch (e) { /* ignoré */ }
  rendre();
})();

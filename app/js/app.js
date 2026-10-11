/* Interface — modules 1 et 2. Dépend de RCG (reglement.js), Calculs (calculs.js), EXEMPLE (exemple.js). */
(function () {
  'use strict';

  var CLE_STOCKAGE = 'rcg07031.projet.v1';
  var I = RCG.ANNEXE_I;

  var MODULES = [
    { id: 'm1', titre: '1. Admissibilité', actif: true },
    { id: 'm2', titre: '2. Demande de pointe', actif: true },
    { id: 'm3', titre: '3. Sélection du compteur', actif: true },
    { id: 'm4', titre: '4. Nombre et emplacement', actif: false },
    { id: 'm5', titre: '5. Chambre de compteur', actif: false },
    { id: 'm6', titre: '6. Préparation et installation', actif: false },
    { id: 'm7', titre: '7. Consommation réputée', actif: false }
  ];

  function projetVide() {
    return {
      projet: { nom: '', adresse: '', arrondissement: '' },
      admissibilite: { usage: '', critere1: '', critere2: '', critere3: '', aucunBranchement: '', partieResidentielle: '', nbLogements: '' },
      etablissements: [{ id: nouvelId(), nom: 'Établissement 1', usageCas1: '', quantites: {} }],
      selection: selectionVide()
    };
  }

  function selectionVide() {
    return { sourceDemande: 'module2', debitManuel: '', pressionDisponibleKpa: '', pressionRequiseKpa: '', technologie: '' };
  }

  function nouvelId() { return 'e' + Math.random().toString(36).slice(2, 9); }
  function copie(o) { return JSON.parse(JSON.stringify(o)); }

  var etat = charger() || copie(EXEMPLE);
  if (!etat.selection) etat.selection = selectionVide();
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
    return '<span class="ref" tabindex="0" data-tip="' + esc('RCG 07-031 — ' + r.court + ' : ' + r.texte) + '">' + esc(r.court) + '</span>';
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
    else main.innerHTML = '<section class="carte"><h2>' + esc(m.titre) + '</h2><p>Module à venir, dans l\'ordre de la spécification (1 → 7).</p>' +
      (m.attente ? '<p>' + aConfirmer(m.attente) + ' ' + esc(m.attente) + '. ' + ref('art9_al3') + '</p>' : '') + '</section>';
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
    } else if (t.hasAttribute('data-filtre')) {
      filtrer(t);
      return;
    } else return;
    sauver();
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
    if (a === 'ajouter-etab') {
      etat.etablissements.push({ id: nouvelId(), nom: 'Établissement ' + (etat.etablissements.length + 1), usageCas1: '', quantites: {} });
    } else if (a === 'retirer-etab') {
      var e = etabDe(t);
      if (!confirm('Retirer « ' + e.nom + ' » et son inventaire ?')) return;
      etat.etablissements = etat.etablissements.filter(function (x) { return x !== e; });
    } else if (a === 'basculer-groupe') {
      t.closest('[data-groupe]').classList.toggle('replie');
      return;
    } else if (a === 'exemple') {
      if (!confirm('Remplacer le projet courant par le jeu d\'exemple ?')) return;
      etat = copie(EXEMPLE);
    } else if (a === 'nouveau') {
      if (!confirm('Effacer le projet courant ?')) return;
      etat = projetVide();
    } else if (a === 'exporter') {
      var blob = new Blob([JSON.stringify(etat, null, 2)], { type: 'application/json' });
      var lien = document.createElement('a');
      lien.href = URL.createObjectURL(blob);
      lien.download = (etat.projet.nom || 'projet').replace(/[^\w-]+/g, '_') + '.json';
      lien.click();
      URL.revokeObjectURL(lien.href);
      return;
    } else if (a === 'importer') {
      document.getElementById('fichier-import').click();
      return;
    } else return;
    sauver();
    rendre();
  });

  document.getElementById('fichier-import').addEventListener('change', function (ev) {
    var f = ev.target.files[0];
    if (!f) return;
    f.text().then(function (txt) {
      var o = JSON.parse(txt);
      if (!o || !o.admissibilite || !Array.isArray(o.etablissements)) throw new Error('format');
      etat = o;
      if (!etat.selection) etat.selection = selectionVide();
      sauver();
      rendre();
    }).catch(function () { alert('Fichier de projet invalide.'); });
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

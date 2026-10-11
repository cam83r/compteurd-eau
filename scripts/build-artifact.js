// Assemble app/ en une seule page (CSS et JS en ligne) pour la publication : node scripts/build-artifact.js
'use strict';
var fs = require('fs');
var path = require('path');

var racine = path.join(__dirname, '..', 'app');
var html = fs.readFileSync(path.join(racine, 'index.html'), 'utf8');

html = html.replace(/<link rel="stylesheet" href="([^"]+)">/g, function (_, href) {
  return '<style>\n' + fs.readFileSync(path.join(racine, href), 'utf8') + '</style>';
});
html = html.replace(/<script src="([^"]+)"><\/script>/g, function (_, src) {
  return '<script>\n' + fs.readFileSync(path.join(racine, src), 'utf8').replace(/<\/script/gi, '<\\/script') + '</script>';
});

// La plateforme fournit le squelette du document : on ne garde que le titre, les styles et le corps.
var titre = html.match(/<title>[\s\S]*?<\/title>/)[0];
var styles = (html.match(/<style>[\s\S]*?<\/style>/g) || []).join('\n');
var corps = html.match(/<body>([\s\S]*)<\/body>/)[1];

var sortie = path.join(__dirname, '..', 'dist', 'compteurs-eau.html');
fs.mkdirSync(path.dirname(sortie), { recursive: true });
fs.writeFileSync(sortie, titre + '\n' + styles + '\n' + corps.trim() + '\n');
console.log('Écrit : ' + path.relative(process.cwd(), sortie) + ' (' + fs.statSync(sortie).size + ' octets)');

// GILDED — hand-in program. Node 22, standard library only.
//
// What it does: take the playable game (game/) and the four screenshots
// (screenshots/) from this repository, lay them out under the output
// directory, and write the dossier the judge reads (dossier.json) using the
// vendored make.fun library. The grader runs it twice and expects both runs
// to write identical bytes, so nothing here depends on time or chance.
//
// Local check:  mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoDir = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The dossier caps mirror the scorer's gate: a 160 KiB text budget, at most
// four screenshots of 256 KiB each, and the game/ tree capped at 993 files
// and 48 MiB in total. Anything over those caps would fail the gate, so the
// same numbers are passed to buildDossier here.
const DOSSIER_LIMITS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
};

function copyTree(source, target) {
  mkdirSync(target, { recursive: true });
  cpSync(source, target, { recursive: true });
}

function copyIfPresent(source, target) {
  if (existsSync(source)) copyTree(source, target);
}

mkdirSync(outputDir, { recursive: true });
copyTree(join(repoDir, 'game'), join(outputDir, 'game'));
copyIfPresent(join(repoDir, 'screenshots'), join(outputDir, 'screenshots'));

const dossierText = buildDossier(outputDir, DOSSIER_LIMITS);
writeFileSync(join(outputDir, 'dossier.json'), dossierText);

// A quick self-check for the local run: the output holds the game, the shots
// and the dossier, and nothing else is expected to be there.
const shotNames = readdirSync(join(outputDir, 'screenshots')).filter((n) => !n.startsWith('.'));
if (shotNames.length < 3 || shotNames.length > 4) {
  throw new Error('expected 3 or 4 screenshots, found ' + shotNames.length);
}
console.log('GILDED dossier written: ' + dossierText.length + ' bytes, ' + shotNames.length + ' screenshots (' + shotNames.join(', ') + ')');

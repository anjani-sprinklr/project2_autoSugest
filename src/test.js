import { spawn } from 'node:child_process';
import ExtractContentFromOutputFile from '../ExtractContentFromOutputFile.js';

const args = process.argv.slice(2);
const arr = ['npx','jest'];

const hasDebug = args.includes('debug');
const hasFix = args.includes('--fix');

arr.push(args.filter((element) => {
  if (element !== 'debug' && element !== '--fix') return element;
}));
if (hasDebug) arr.push('| tee output.txt');

const ps = spawn('unbuffer', arr, { shell: true });

ps.stdout.on('data', (data) => {
    console.log(data.toString());
});

ps.stderr.on('data', (data) => {
  console.error(`ps stderr: ${data}`);
});

ps.on('close', (code) => {
  if (hasDebug && hasFix) {
    ExtractContentFromOutputFile(1);
  } else if (hasDebug) {
    ExtractContentFromOutputFile(2);
  }

});

ps.on('error', (err) => {
});

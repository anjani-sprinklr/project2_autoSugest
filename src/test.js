import { spawn } from 'node:child_process';
import ExtractContentFromOutputFile from '../ExtractContentFromOutputFile.js';
import path from 'path';
const args = process.argv.slice(2);
const arr = ['npx','jest','--silent=false'];

const hasDebug = args.includes('debug');

let testFailed = false;
//console.log(args);
arr.push(args.filter((element) => {
  if (element !== 'debug') return element;
}));

if (hasDebug) arr.push('| tee output.txt');

const ps = spawn('unbuffer', arr, { shell: true });

ps.stdout.on('data', (data) => {
  const output = data.toString();
  console.log(output);
  if (output.includes('FAIL') || output.includes('failed')) testFailed = true;
});

ps.stderr.on('data', (data) => {
  console.error(`STDERR****: ${data}`);
});

const filePath = args[0];

const currentWorkingDirectory = process.cwd();
const resolvedFilePath = path.isAbsolute(filePath)? filePath: path.resolve(currentWorkingDirectory, filePath);

ps.on('close', (code) => {
  if (hasDebug || testFailed) {
    ExtractContentFromOutputFile(resolvedFilePath);
    console.log('**Done!** ')
  }
});

ps.on('error', (err) => {
  console.error(`ERROR ****: ${data}`);
});

/**
 * 1. write on file name provided by user
 * 2. catch and find mocks even if test fails
 * 3. write comments if line number if not
 */

/* 
* appending in the mocks attribute itself
* appending to already existing Mocks variable
* if its imported from other filer then put it down as a comment
* cli command should work with relative path as well
* cover the case of aliasing as well
*/

// assumptions that import for variable sis from 'import'
// and a single array is avoided
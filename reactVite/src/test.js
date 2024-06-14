

/* eslint-disable no-undef */
import { spawn } from 'node:child_process';
// import fs from 'fs';
// Extract command-line arguments (excluding 'node' and script name)
const args = process.argv.slice(2);

// Initialize the array with the fixed argument 'jest'
const arr = ['npx','jest'];
// Add additional arguments to the array
arr.push(...args);
arr.push('| tee output.txt')
//console.log(arr,args)
const ps = spawn('unbuffer', arr, { shell: true });

ps.stdout.on('data', (data) => {
   console.log(data.toString());
  console.log("op");

});

ps.stderr.on('data', (data) => {
  console.error(`ps stderr: ${data}`);
});

ps.on('close', (code) => {
  // if (code !== 0) {
  //   console.log(`ps process exited with code ${code}`);
  // }
  console.log("exited",code);
});

ps.on('error', (err) => {
  console.error(`Failed to start subprocess: ${err}`);
});

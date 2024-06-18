

/* eslint-disable no-undef */
import { spawn } from 'node:child_process';
import ExtractContentFromOutputFile from '../extractFile.js';
// import fs from 'fs';
// Extract command-line arguments (excluding 'node' and script name)
const args = process.argv.slice(2);

// Initialize the array with the fixed argument 'jest'
const arr = ['npx','jest'];


const hasDebug = args.includes('debug');
const hasFix = args.includes('--fix');

// console.log(hasDebug, hasFix);
//console.log(args,process.argv);
arr.push(args.filter((element) => {
  if (element !== 'debug' && element !== '--fix') return element;
}));



if (hasDebug && hasFix) {

  arr.push('| tee output.txt');
  const ps = spawn('unbuffer', arr, { shell: true });

  ps.stdout.on('data', (data) => {
    // console.log(data.toString());
  });

  ps.stderr.on('data', (data) => {
    console.error(`ps stderr: ${data}`);
  });

  ps.on('close', (code) => {
    ExtractContentFromOutputFile(1);
   // console.log("Extract Content From output",code);
  });

  ps.on('error', (err) => {
    // console.error(`Failed to start subprocess: ${err}`);
  });


} else if (hasDebug) {

  arr.push('| tee output.txt')
  //console.log(arr,args)
  const ps = spawn('unbuffer', arr, { shell: true });

  ps.stdout.on('data', (data) => {
    // console.log(data.toString());
    //console.log("op");

  });

  ps.stderr.on('data', (data) => {
    console.error(`ps stderr: ${data}`);
  });

  ps.on('close', (code) => {
    ExtractContentFromOutputFile(2);
    // console.log("Extract Content From output",code);
  });

  ps.on('error', (err) => {
    console.error(`Failed to start subprocess: ${err}`);
  });
} else {

  //console.log(arr,args)
  const ps = spawn('unbuffer', arr, { shell: true });

  ps.stdout.on('data', (data) => {
    // console.log(data.toString());
    //console.log("op");

  });

  ps.stderr.on('data', (data) => {
    console.error(`ps stderr: ${data}`);
  });

  ps.on('close', (code) => {
    // console.log("Extract Content From output",code);
  });

  ps.on('error', (err) => {
    console.error(`Failed to start subprocess: ${err}`);
  });

}

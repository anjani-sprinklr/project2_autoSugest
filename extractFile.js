/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-control-regex */

import readline from 'readline';
import fs from 'fs';
import addMocksvariable from './test2.js';

const regexASNI= /\u001b\[\d+m/g;

function scanTestAndLineNumberFromFile(fileName, callback) {
    const fileStream = fs.createReadStream(fileName);
    const rl = readline.createInterface({
        input: fileStream,
        output: process.stdout,
        terminal: false
    });

    const testAndLineArray = [];
    const testRegex = /^(?!.*\/\/)(?!.*\/\*).*test\(("|')([^\1]+?)(\1)/gm
    let lineNumber = 1;

    rl.on('line', (line) => {
        const isTestFound = testRegex.exec(line);
        if (isTestFound != null) {
            testAndLineArray.push({ line: lineNumber, test: isTestFound[2] });
        }
        lineNumber++;
    });

    rl.on('close', () => {
        callback(null, testAndLineArray);
    });

    rl.on('error', (error) => {
        callback(error, null);
    });
}





const ExtractContentFromOutputFile = (type) => {
    const data = fs.readFileSync('output.txt', 'utf-8');
    let str = data.toString();
    str = str.replace(regexASNI, '');
    const regex = /No more mocked responses((.|\n)*?)Expected variables:((.|\n)*?)at Object.<anonymous> \(((.|\n)*?)\n/gm;
    
    let match = "";
    const map = new Map();
    let lastLineinserted = -1;
    while ((match = regex.exec(str)) !== null) {
    
        const group1 = match[1];
        const group2 = match[3];
        const group3 = match[5];
        let query = group1.split(' for the query:')[1].trim();
        let queryName = query.split('(')[0].split(' ')[1];

        const constVariableArray = queryName.match(/[A-z][a-z]+/g);
        let constVariable = constVariableArray.join("_");
        constVariable =constVariable.concat("_QUERY").toUpperCase();
        const splitArray = group2.split('This typically indicates a configuration error in your mocks setup, usually due to a typo or mismatched variable');
        const variables = splitArray[0].trim();
        const regexRender = />(.*)render\(/gm;
        const lineNumberAndNise = regexRender.exec(splitArray[1])[1].trim();
        const lineNumber = lineNumberAndNise.split(' ')[0];
        //console.log(lineNumber);
        const queryVariable = constVariable + '$#' + variables;
        let fileName = group3.split(':')[0].trim();

        if (lastLineinserted === lineNumber) continue;

        if (map.has(fileName)) {
            const mapQueryVaribles = map.get(fileName);
            if (mapQueryVaribles.has(queryVariable)) {
                (map.get(fileName)).get(queryVariable).push(lineNumber);
            } else {
                map.get(fileName).set(queryVariable, [lineNumber]);
            }
        } else {
            const mapQueryVaribles = new Map();
            mapQueryVaribles.set(queryVariable, [lineNumber]);
            map.set(fileName, mapQueryVaribles);
        }

        lastLineinserted = lineNumber;
    
    
    }
    //console.log(map);
   // console.log(map)
    map.forEach((value, key, mapvar) => {

        console.log(value);
        scanTestAndLineNumberFromFile(`./${key}`, (err, testAndLineArray) => {
            addMocksvariable(value, key, testAndLineArray,type);
        })
    });

}

export default ExtractContentFromOutputFile;
































//     const mockVariableAST = {
//         type: "VariableDeclaration",
//         declarations: [
//           {
//             type: "VariableDeclarator",
//             id: {
//               type: "Identifier",
//               name: "MOCKS",
//             },
//             init: {
//               type: "ArrayExpression",
//               elements: elements, // Assuming 'elements' is defined elsewhere
//             },
//           },
//         ],
//         kind: "const",
//     };
    
//    addMocksvariable(mockVariableAST);


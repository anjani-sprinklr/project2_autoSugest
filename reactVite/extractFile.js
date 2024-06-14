/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-control-regex */

import fs, { chownSync } from 'fs';
import addMocksvariable from './test2.js';
import { open } from 'node:fs/promises';

const regexASNI= /\u001b\[\d+m/g;



const elements = [];


async function scanTestAndLineNumberFromFile(fileName) {
    const file = await open(fileName);
    const testAndLineArray = new Array();
    const testRegex = /^(?!.*\/\/)(?!.*\/\*).*test\(("|')([^\1)]+)\1/gm;
    let lineNumber = 1;
    for await (const line of file.readLines()) {
        // read the 1st argumnet of test, that is test name, if its not commented
        const isTestFound = testRegex.exec(line);
        if (isTestFound!=null) {
            testAndLineArray.push({ line: lineNumber, test: isTestFound[2] });
          //  console.log(isTestFound);
        }
        lineNumber++;
    }
    return testAndLineArray;
}

fs.readFile('output.txt', 'utf-8',async (err, data) => {
    if (err) console.log(err);
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


    let run = 0;
    for (const [key, data] of map) {
        let arr = [];
        const testAndLineArray=await scanTestAndLineNumberFromFile(`./${key}`);
        //console.log(testAndLineArray);
        // data.forEach((payload) => {
        //    //console.log(payload);
        //    // const gqldata = 'gql'+`${payload[0]}`;
        //     arr.push(`{
        //         request: {
        //             query: ${payload[1]},
        //             variables: ${payload[2]}
        //         },
        //         result: {
        //             data: {
                        
        //             }
        //         }
        //     }`);
        // });
           
        //const mocksVariable = `const MOCKS=[${arr}]`;
        await addMocksvariable(data,key,testAndLineArray);
        run++;
        // fs.appendFile(`./${key}`, '\n'+content, (err) => {
        //     if (err) console.log(err);
        //     else console.log("Done appending")
        // })
       //console.log(content);
    }





});




































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


/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-control-regex */

import fs from 'fs';
import addMocksvariable from './test3.js';

const regexASNI= /\u001b\[\d+m/g;

const map = new Map();
const elements = [];


fs.readFile('output.txt', 'utf-8', (err, data) => {
    if (err) console.log(err);
    let str = data.toString();
    str = str.replace(regexASNI, '');
  

    const regex = /No more mocked responses((.|\n)*?)Expected variables:((.|\n)*?)at Object.<anonymous> \(((.|\n)*?)\n/gm;
   
    let match = "";
    while ((match = regex.exec(str)) !== null) {
    
        const group1 = match[1];
        const group2 = match[3];
        const group3 = match[5];
        let query = group1.split(' for the query:')[1].trim();
        let queryVariable = query.split('(')[0].split(' ')[1];

        const constVariableArray = queryVariable.match(/[A-z][a-z]+/g);
        let constVariable = constVariableArray.join("_");
        constVariable =constVariable.concat("_QUERY").toUpperCase();
        let variables = group2.split('This typically indicates a configuration error in your mocks setup, usually due to a typo or mismatched variable')[0].trim();
        let fileName = group3.split(':')[0].trim();
        if (map.has(fileName)) {
            map.get(fileName).push([query,constVariable, variables]);
        } else {
            map.set(fileName, [[query,constVariable, variables]]);
        }

    
    }
    //console.log(map);


    let run = 0;
    for (const [key, data] of map) {
        let arr = [];
        
        data.forEach((payload) => {
           //console.log(payload);
           // const gqldata = 'gql'+`${payload[0]}`;
            arr.push(`{
                request: {
                    query: ${payload[1]},
                    variables: ${payload[2]}
                },
                result: {
                    data: {
                        
                    }
                }
            }`);
        });
           
        // }
        const outputArray = Array.from(new Set(data));
       // console.log(outputArray);
        const mocksVariable = `const MOCKS=[${arr}]`;
        if(run==0)addMocksvariable(mocksVariable,key);
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


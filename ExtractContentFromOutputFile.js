import readline from 'readline';
import fs from 'fs';
import addMocksvariable from './addMocksvariable.js';


const regexASNI= /\u001b\[\d+m/g;
const regex = /No more mocked responses((.|\n)*?)Expected variables:((.|\n)*?)at MockLink.Object.<anonymous>/gm;

const testRegex = /^(?!.*\/\/)(?!.*\/\*).*test\(("|')([^\1]+?)(\1)/gm

function scanTestAndLineNumberFromFile(filePath, callback) {
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
        input: fileStream,
        output: process.stdout,
        terminal: false
    });
    const testAndLineArray = [];
    
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


const ExtractContentFromOutputFile = (filePath) => {
    var isLineNumberPresent = false;
    const data = fs.readFileSync('output.txt', 'utf-8');
    let str = data.toString();
    str = str.replace(regexASNI, '');
    let match = "";
    const mapWithLineNumber = new Map();
    const mapWithoutLineNumber = new Map();
    let lastLineinserted = -1;
    

    while ((match = regex.exec(str)) !== null) {
    
        const group1 = match[1];
        const group2 = match[3];
        //const group3 = match[5];

        // regex manipulation to get required contents
        let query = group1.split(' for the query:')[1].trim();
        let queryName = query.split('(')[0].split(' ')[1];
        const constVariableArray = queryName.match(/[A-z][a-z]+/g);
        let constVariable = constVariableArray.join("_");
        constVariable =constVariable.concat("_QUERY").toUpperCase();
        const splitArray = group2.split('This typically indicates a configuration error in your mocks setup, usually due to a typo or mismatched variable');
        const variables = splitArray[0].trim();
        //console.log(variables);
        
        const queryVariable = constVariable + '$#' + variables;

        const regexRender = />(.*)render\(/gm;
        let match3=""
        if ((match3=regexRender.exec(splitArray[1]) )!== null) {
            // console.log(splitArray[1]);
            const lineNumberAndNoise = match3[1].trim();
            const lineNumber = lineNumberAndNoise.split(' ')[0];
            isLineNumberPresent = true;

            if (mapWithLineNumber.has(queryVariable)) {
                (mapWithLineNumber).get(queryVariable).push(lineNumber);
            } else {
                mapWithLineNumber.set(queryVariable, [lineNumber]);
            }
            
        } else {
            // if Line Number not present then I am storing the frequency
           
            const count = mapWithoutLineNumber.get(queryVariable);
            if (count) {
                mapWithoutLineNumber.set(queryVariable, count+1);
            } else {
                mapWithoutLineNumber.set(queryVariable,  1);
            }
        }
    
    
    }


    if (isLineNumberPresent) {
        scanTestAndLineNumberFromFile(`${filePath}`, (err, testAndLineArray) => {
            addMocksvariable(mapWithLineNumber, mapWithoutLineNumber,filePath, testAndLineArray, isLineNumberPresent);
        });
    } else {
        addMocksvariable(mapWithLineNumber, mapWithoutLineNumber, filePath, null, isLineNumberPresent);
    }

    
    // // autoSuggestion of payload per file
    // mapWithLineNumber.forEach((value, filePath, mapvar) => {

    //     if (isLineNumberPresent) {
    //         // reading the file for Test name and Line number
    //         //console.log("Inside map",map);
           
    //     } else {
    //         addMocksvariable(value,mapWithoutLineNumber filePath, null, isLineNumberPresent);
    //     }
       
    // });

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


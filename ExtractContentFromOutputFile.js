import readline from 'readline';
import fs from 'fs';
import addMocksvariable from './addMocksvariable.js';


const regexASNI= /\u001b\[\d+m/g;
const regex = /No more mocked responses((?:.|\n)*?)Expected variables:((?:.|\n)*?)(at (?:.|\n)*?at Object\.<anonymous> .*)\n/gm;

const testRegex = /^(?!.*\/\/)(?!.*\/\*).*(?:test|it)\(("|')([^\1]+?)(\1)/gm

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

const re = new RegExp(
    '^' +
      // Sometimes we strip out the '    at' because it's noisy
    '(?:\\s*at )?' +
      // $1 = ctor if 'new'
    '(?:(new) )?' +
      // $2 = function name (can be literally anything)
      // May contain method at the end as [as xyz]
    '(?:(.*?) \\()?' +
      // (eval at <anonymous> (file.js:1:1),
      // $3 = eval origin
      // $4:$5:$6 are eval file/line/col, but not normally reported
    '(?:eval at ([^ ]+) \\((.+?):(\\d+):(\\d+)\\), )?' +
      // file:line:col
      // $7:$8:$9
      // $10 = 'native' if native
    '(?:(.+?):(\\d+):(\\d+)|(native))' +
      // maybe close the paren, then end
      // if $11 is ), then we only allow balanced parens in the filename
      // any imbalance is placed on the fname.  This is a heuristic, and
      // bound to be incorrect in some edge cases.  The bet is that
      // having weird characters in method names is more common than
      // having weird characters in filenames, which seems reasonable.
    '(\\)?)$'
);

const cwd = process.cwd();
const getLineNumber = (stackTrace,filePath) => {
    const lines = stackTrace.split('\n');

    for (const line of lines) {
        //const match = line.match(re);
        if (line.includes('node_modules') || line.includes('jest')) continue;

        const match = line.match(re);
        //console.log(match);
        const path = cwd +'/'+ match[7];
        if (filePath === path) {
            
            return match[8];
        }
        //console.log(path,filePath,path===filePath);

    }

    return null;
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
        const group2 = match[2];
        const group3 = match[3];

       // console.log("G1**",group1);
       // console.log("G2**",group2);
       // console.log("G3**",group3);
        // // regex manipulation to get required contents
        let query = group1.split(' for the query:')[1].trim();
        let queryName = query.split('(')[0].split(' ')[1];
        const constVariableArray = queryName.match(/[A-z][a-z]+/g);
        let constVariable = constVariableArray.join("_");
        constVariable =constVariable.concat("_QUERY").toUpperCase();
        const splitArray = group2.split('This typically indicates a configuration error in your mocks setup, usually due to a typo or mismatched variable');
        const variables = splitArray[0].trim();
       
        
        const queryVariable = constVariable + '$#' + variables;
        const lineNumber = getLineNumber(group3, filePath);
        if (lineNumber) {

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

    
    // autoSuggestion of payload per file
    mapWithLineNumber.forEach((value, filePath, mapvar) => {

        if (isLineNumberPresent) {
            // reading the file for Test name and Line number
            //console.log("Inside map",map);
           
        } else {
            addMocksvariable(value,mapWithoutLineNumber ,filePath, null, isLineNumberPresent);
        }
       
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


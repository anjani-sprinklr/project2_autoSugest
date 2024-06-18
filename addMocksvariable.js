/* eslint-disable @typescript-eslint/no-explicit-any */
import parser from "@babel/parser";
import generator from "@babel/generator";
import fs from 'fs';


const testNameMapstoMockVariableName = new Map();
const mockvariableArr = new Array();
const mockvariableArrIfLineNumber = new Map();
const singleMockVariablearr = new Array();

const mocksAttribute = (varName) => {
  return ({
    "type": "JSXAttribute",
    "name": {
      "type": "JSXIdentifier",
      "name": "mocks"
    },
    "value": {
      "type": "JSXExpressionContainer",
      
      "expression": {
        "type": "Identifier",
        "name": `${varName}`
      }
    }
  });
 
}

function findMockProvider(node, mockVariableName) {
  
  // base case
  if (node.type === "JSXElement" && node.openingElement.type === "JSXOpeningElement" && node.openingElement.name.name === "MockedProvider") {
    let isMockPresent = false;

    let JSXOpeningElementAttributes = node.openingElement.attributes.map( (jsxAttribute) => {
      
      if (jsxAttribute.name.name === "mocks") {
        isMockPresent = true;
        if (jsxAttribute.value.expression.type === "ArrayExpression") {
          jsxAttribute.value =  mocksAttribute(mockVariableName).value;
        }
      }
      return jsxAttribute;

    });


    if (!JSXOpeningElementAttributes || JSXOpeningElementAttributes.length == 0) {
      JSXOpeningElementAttributes = [ mocksAttribute(mockVariableName)];
    } else if (!isMockPresent) {
      JSXOpeningElementAttributes.push(mocksAttribute(mockVariableName));
    }

    node.openingElement.attributes = JSXOpeningElementAttributes;

    return node;
  }

  // finding MockProvider in its children
  const newNode = node;
  const newNodeChildren=node.children.map( (jsx) => {
    if (jsx.type === "JSXElement") {
      return   findMockProvider(jsx,mockVariableName);
    }
    return jsx;
  });
  newNode.children = newNodeChildren;


  return newNode;
  
}


function resetVariables() {
   
    testNameMapstoMockVariableName.clear(); 
    mockvariableArr.length = 0; 
    singleMockVariablearr.length = 0; 
 
}


const addMocksAttribute = (ast) => {
  
  const astBody = ast.body.map(node => {

    const newNode = node;
    if (node.expression && node.expression.callee.name === "test") {

      const insideTest = node.expression.arguments[1].body.body;
      if (insideTest) {

        const insideTestNodesArray = insideTest.map((node_insideTest) => {
          
          const newNode_insideTest = node_insideTest;
          if (node_insideTest.expression.callee.name === "render") {

            const insideRender = node_insideTest.expression.arguments;
            if (insideRender.length) {

              const insideRenderNodeArray = insideRender.map((jsxElement) => {
                
                const testName = node.expression.arguments[0].extra.rawValue;
                if (testNameMapstoMockVariableName.has(testName)) {
                  return  findMockProvider(jsxElement,testNameMapstoMockVariableName.get(testName));
                }

                return jsxElement;
                
              });
              newNode_insideTest.expression.arguments = insideRenderNodeArray;
            }
          }

          return newNode_insideTest;
        });

        newNode.expression.arguments[1].body.body = insideTestNodesArray;
      }
    }
  
    return newNode;
  });
  
  const newAST = ast;
  newAST.body = astBody;

  return newAST;
}


const getPrevTest = (line, testAndLineArray) => {
  
  let l = 0, r = testAndLineArray.length - 1;
  
  while (l <= r) {
    let mid = Math.floor((l + r) / 2);
    if (testAndLineArray[mid].line >= line) {
      r = mid-1;
    } else {
      l = mid + 1;
    }
  }
  if (l - 1 >= 0 && l - 1 < testAndLineArray.length)
    return [l - 1, testAndLineArray[l - 1].test];

  return null;

}

const createMockVariables = (map) => {

  // let currentCountofMocks = 1;

  for (const [key, lines] of map) {

   // let currentSubCountofMocks = 1;
    const queryName = key.split('$#')[0];
    const variables = key.split('$#')[1];

    for (let cur = 0; cur < lines; cur++){
      // const mockVariableName = 'MOCKS';
      mockvariableArr.push([queryName, variables]);
     // currentCountofMocks += 1;
    }
   
  }

  return
}

const createMapofTestNametoVariableName = (map, testAndLineArray) => {
  
 // let currentCountofMocks = 2;
 //  let count={}
  for (const [key, lines] of map) {

    let currentSubCountofMocks = 1;
    const queryName = key.split('$#')[0];
    const variables = key.split('$#')[1];

    if (lines.length > 1) {

      for (let line of lines) {
        // find the line of test just prev to current line indicated in the warning
        const testName =   getPrevTest(line, testAndLineArray);
        if (testName) {

          const mockVariableName = 'MOCKS_' + line;
          testNameMapstoMockVariableName.set(testName[1], mockVariableName);
          if (mockvariableArrIfLineNumber.has(mockVariableName)) {
            mockvariableArrIfLineNumber.get(mockVariableName).push([queryName, variables]);
          } else {
            mockvariableArrIfLineNumber.set(mockVariableName, [[queryName, variables]]);
          }
          
          //currentSubCountofMocks += 1;

        } else {
          // if (count[line]) {
          //   count[line] += 1;
          // } else {
          //   count[line] = 1;
          // }
          //const mockVariableName = 'MOCKS_' + line + '_' + count[line];
          mockvariableArr.push([queryName, variables]);
        }

      }

      //currentCountofMocks += 1;

    } else {

      const testName =  getPrevTest(lines[0],testAndLineArray);
      if (testName) {
        const mockVariableName = 'MOCKS_' + lines[0];
        if (mockvariableArrIfLineNumber.has(mockVariableName)) {
          mockvariableArrIfLineNumber.get(mockVariableName).push([queryName, variables]);
        } else {
          testNameMapstoMockVariableName.set(testName[1], 'MOCKS1');
          singleMockVariablearr.push([queryName, variables]);
        }
     
      } else {
        // const line = lines[0];
        // if (count[line]) {
        //   count[line] += 1;
        // } else {
        //   count[line] = 1;
        // }
        // const mockVariableName = 'MOCKS_' + line + '_' + count[line];
        mockvariableArr.push([queryName, variables]);
      }

    }
  }

  return

}
const getMockVariables = () => {

  let content = "";
  
  const contentArray = mockvariableArr.map((payload) => {
    
    return (
      `{
        request: {
          query: ${payload[0]},
          variables: ${payload[1]}
        },
        result: {
          data: {}
        }
      }`
    );
    
  });
  
  if (mockvariableArr.length !== 0) {
    content = `const MOCKS=[${contentArray}];\n`;
    content = '\n\n/*' + content + '*/';
  }
  
  return content;


}
const getAST = () => {
  let content = "";

  mockvariableArrIfLineNumber.forEach((queries, key, mapvar) => {
    const queriesInArray = queries.map((payload) => {
      return (
        `{
          request: {
            query: ${payload[0]},
            variables: ${payload[1]}
          },
          result: {
            data: {}
          }
        }`
      )
    });
    content += `const ${key} = [${queriesInArray}];\n`;
  });

  // Variables which are all different from one another
  if (singleMockVariablearr.length > 0) {
    const samemockVaribaleNameContent = singleMockVariablearr.map((payload) => {
      return (
        `{
          request: {
            query: ${payload[0]},
            variables: ${payload[1]}
          },
          result: {
            data: {}
          }
        }`
      )
    });
    content += `const MOCKS1 = [${samemockVaribaleNameContent}];\n`;
  }
  // Log the content to debug
  // console.log("Generated Content:", content);

  try {
    const vardeclareAst = parser.parse(content, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript']
    });
    const varAST = vardeclareAst.program.body;
    return varAST;
  } catch (error) {
    // console.error("Parsing error:", error.message);
    throw error;
  }
};

const addMocksvariable =  (mapWithLineNumber,mapWithoutLineNumber, filePath, testAndLineArray,isLineNumberPresent) => {
  
  resetVariables();
  // type 2 : only Debug;
  // type 1 : Debug +Fix

  if (testAndLineArray === null || !isLineNumberPresent) {
    // creating Mock variables
    createMockVariables(mapWithoutLineNumber);

    if (mockvariableArr.length) {
      const content = getMockVariables();
      //console.log(filePath);
      fs.appendFileSync(`${filePath}`, content);
    }

  } else {
    //console.log("map of tst names to var");
    // creating a Map of Testnames and Mock variables
    createMapofTestNametoVariableName(mapWithLineNumber, testAndLineArray);
    createMockVariables(mapWithoutLineNumber);
    //console.log("callling getast");
    // generating the AST of the Mock variables
    const mockVariablesAST = getAST();
    //console.log("reading file");
    // reading the file
    const data = fs.readFileSync(`${filePath}`, 'utf-8');
    const ast = parser.parse(data, {
      sourceType: "module",
      plugins: ["jsx"]
    });

    // getting the last import statements index
    let lastImportIndex = 0;
    ast.program.body.forEach((topLvlDeclarartions, index) => {
      if (topLvlDeclarartions.type === "ImportDeclaration") {
        lastImportIndex = index;
      }
    });
    
    // appending Mock variables to MockProvider
    const newAstProgram = addMocksAttribute(ast.program);
    const newAst = ast;
    newAst.program = newAstProgram;

    // appending the Mock variables after the last import declarations
    newAst.program.body.splice(lastImportIndex+1,0,...mockVariablesAST);
    const astCodeNew = generator.default(newAst).code;
    
    // writing the modifed code to the file
    fs.writeFileSync(`${filePath}`, astCodeNew);
    fs.appendFileSync(`${filePath}`, getMockVariables());

  }
  
}

export default addMocksvariable;
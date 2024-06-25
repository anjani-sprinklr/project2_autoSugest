/* eslint-disable @typescript-eslint/no-explicit-any */
import parser from "@babel/parser";
import generator from "@babel/generator";
import fs from 'fs';
import traverse from "@babel/traverse";

const testNameMapstoMockVariableName = new Map();
const mockvariableArr = new Array();
const mockvariableArrIfLineNumber = new Map();
const singleMockVariablearr = new Array();
const existingMockVariable_MapsTo_createdVariable = new Map();

let aliasNameForMockProvider = "MockedProvider";
let aliasNameForRender = "render";

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

const getFormattedMockVariable = (mockVariableName) => {
  const formattedMockVaribale = mockvariableArrIfLineNumber.get(mockVariableName).map((payload) => {
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
  let content = `const VARIABLE=[${formattedMockVaribale}]`;
  const formattedMockVaribaleAstProgram = parser.parse(content, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript']
  });
  mockvariableArrIfLineNumber.delete(mockVariableName);
  //console.log("MockvaribelAnem",mockVariableName);
  // console.log("formated",content);
  const formattedMockVaribaleAST = formattedMockVaribaleAstProgram.program.body[0].declarations[0].init.elements;
  // console.log(formattedMockVaribaleAST);
  return formattedMockVaribaleAST;
}

function findMockProvider(node, mockVariableName) {
  
  // base case
  if (node.type === "JSXElement" &&
    node.openingElement.type === "JSXOpeningElement" &&
    (node.openingElement?.name?.name === aliasNameForMockProvider)) {
    
    let isMockPresent = false;

    let JSXOpeningElementAttributes = node.openingElement.attributes
      .map((jsxAttribute) => {
        //console.log(node.openingElement.name.name, node.openingElement.attributes[0]);
      if (jsxAttribute.name.name === "mocks") {
        isMockPresent = true;
        //const jsxAttribute.value = jsxAttribute.value;
        if (jsxAttribute.value?.expression.type === "ArrayExpression") {
          if (jsxAttribute.value?.expression.elements.length === 0) {
            // console.log("inside length 0");
            jsxAttribute.value =  mocksAttribute(mockVariableName).value;
          } else {
            const formattedMockVaribaleAST = getFormattedMockVariable(mockVariableName);
            jsxAttribute.value.expression.elements = [...jsxAttribute.value.expression.elements, ...formattedMockVaribaleAST];
          }
          
        } 
        else if (jsxAttribute.value.expression.type === "Identifier") {
          const existingMockVariable = jsxAttribute.value.expression.name;
          // console.log("exitsing: ",existingMockVariable);
          existingMockVariable_MapsTo_createdVariable.set(existingMockVariable, mockVariableName);
        }

       // jsxAttribute.value=jsxAttribute.value
      }
      return jsxAttribute;

    });

    // if no attributes present then add mocks attribute
    // else if mocks attribute not present then add it
    if (!JSXOpeningElementAttributes || JSXOpeningElementAttributes.length === 0) {
      JSXOpeningElementAttributes = [mocksAttribute(mockVariableName)];
      
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
  existingMockVariable_MapsTo_createdVariable.clear();
  mockvariableArrIfLineNumber.clear();
  mockvariableArr.length = 0; 
  singleMockVariablearr.length = 0; 
 

  aliasNameForMockProvider = "MockedProvider";
  aliasNameForRender = "render";
 
}


const addMocksAttribute = (ast) => {
  traverse.default(ast, {
    CallExpression(path) {
      const node = path.node;
      if (//node &&
       // node.callee &&
        (node?.callee?.name === "test" || node?.callee?.name==="it" )&&
        node.arguments.length>1
      ) {
        const insideTest = node.arguments[1].body.body;
        if (insideTest) {
  
          const insideTestNodesArray = insideTest.map((node_insideTest) => {
            
            const newNode_insideTest = node_insideTest;
            if (node_insideTest &&
             // node_insideTest.expression &&
             // node_insideTest.expression.callee &&
              node_insideTest?.expression?.callee?.name === aliasNameForRender) {
  
              const insideRender = node_insideTest.expression.arguments;
              if (insideRender.length) {
  
                const insideRenderNodeArray = insideRender.map((jsxElement) => {
                  
                  const testName = node.arguments[0].extra.rawValue;
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
  
          node.arguments[1].body.body = insideTestNodesArray;

        }
        path.node = node;
      }
    }
  });

  return ast;
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

   // if (lines.length > 1) {

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

  }

  return

}

const getMockVariablesToBeCommented = () => {

  let content = "";
  
  let contentArray = mockvariableArr.map((payload) => {
    
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
   // content = '\n\n/*' + content + '*/';
  }

  if (existingMockVariable_MapsTo_createdVariable.size !== 0) {
      // Mocks Varibale that were imported from other file using 'import'
    existingMockVariable_MapsTo_createdVariable.forEach((createdVar,existingVar,mapvar) => {
      const formattedMockVaribale = mockvariableArrIfLineNumber.get(createdVar).map((payload) => {
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
      if (formattedMockVaribale.length !== 0)
        content += `const ${existingVar}=[${formattedMockVaribale}];\n`;
      mockvariableArrIfLineNumber.delete(createdVar);
    })

  }

  if (content !== "") {
    content = "\n/*" + content + "*/";
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

const modifyConstVariableDeclarations = (ast) => {
   // Traverse the AST to find import declarations
   traverse.default(ast, {
    VariableDeclaration(path) {
      path.node.declarations.forEach((node) => {
        const varName = node.id.name;
        if (existingMockVariable_MapsTo_createdVariable.has(varName) &&
          node.init.type === "ArrayExpression") {
          //console.log("Inside exismap", existingMockVariable_MapsTo_createdVariable.get(varName));
          const variableNameMappedTovarName = existingMockVariable_MapsTo_createdVariable.get(varName);
          const formattedMockVaribaleAST = getFormattedMockVariable(variableNameMappedTovarName);
          node.init.elements = [...node.init.elements, ...formattedMockVaribaleAST];
          //console.log(":** exiis", variableNameMappedTovarName);
          existingMockVariable_MapsTo_createdVariable.delete(varName);
        }
      });
    },
   });
  return ast;
}

const addMocksvariable =  (mapWithLineNumber,mapWithoutLineNumber, filePath, testAndLineArray,isLineNumberPresent) => {
  
  resetVariables();
  // type 2 : only Debug;
  // type 1 : Debug +Fix

  if (testAndLineArray === null || !isLineNumberPresent) {
    // creating Mock variables
    createMockVariables(mapWithoutLineNumber);

    if (mockvariableArr.length) {
      const content = getMockVariablesToBeCommented();
      //console.log(filePath);
      fs.appendFileSync(`${filePath}`, content);
    }

  } else {

    // console.log(mapWithLineNumber,testAndLineArray)
    //console.log("map of tst names to var");
    // creating a Map of Testnames and Mock variables
    createMapofTestNametoVariableName(mapWithLineNumber, testAndLineArray);
    createMockVariables(mapWithoutLineNumber);
    //console.log("callling getast");
    // generating the AST of the Mock variables
    
    //console.log("reading file");
    // reading the file
    const data = fs.readFileSync(`${filePath}`, 'utf-8');
    const ast = parser.parse(data, {
      sourceType: "module",
      plugins: ["jsx","typescript"]
    });

    // getting the last import statements index
    let lastImportIndex = 0;
    ast.program.body.forEach((topLvlDeclarartions, index) => {
      if (topLvlDeclarartions.type === "ImportDeclaration") {
        lastImportIndex = index;
        topLvlDeclarartions.specifiers.forEach((importSpecifiers) => {
          if (//importSpecifiers &&
            //importSpecifiers.imported &&
            importSpecifiers?.imported?.name === "MockedProvider") {
            aliasNameForMockProvider = importSpecifiers.local.name;
          }
          if (//importSpecifiers &&
            //importSpecifiers.imported &&
            importSpecifiers?.imported?.name === "render") {
            aliasNameForRender = importSpecifiers.local.name;
          }
        })
      }
    });
    
    // appending Mock variables to MockProvider
    const modifedAst = addMocksAttribute(ast);
    const newAst = modifyConstVariableDeclarations(modifedAst);
    const tobeCommented = getMockVariablesToBeCommented();
    const mockVariablesAST = getAST();
 

    // appending the Mock variables after the last import declarations
    newAst.program.body.splice(lastImportIndex+1,0,...mockVariablesAST);
    const astCodeNew = generator.default(newAst).code;
    
    // writing the modifed code to the file
    fs.writeFileSync(`${filePath}`, astCodeNew);
    fs.appendFileSync(`${filePath}`, tobeCommented);

  }
  
}

export default addMocksvariable;
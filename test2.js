/* eslint-disable @typescript-eslint/no-explicit-any */
import parser from "@babel/parser";
import generator from "@babel/generator";
import fs from 'fs';
import { log } from "console";


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

const testNameMapstoMockVariableName = new Map();
const mockvariableArr = new Array();
const singleMockVariablearr = new Array();

function findMockProvider(node, mockVariableName) {
  //console.log("MOCK_VARIABLE:",mockVariableName);
  if (node.type === "JSXElement" && node.openingElement.type === "JSXOpeningElement" && node.openingElement.name.name === "MockedProvider") {
    let isMockPresent = false;
    let JSXOpeningElementAttributes = node.openingElement.attributes.map( (jsxAttribute) => {
      
      if (jsxAttribute.name.name === "mocks") {
        isMockPresent = true;
        if (jsxAttribute.value.expression.type === "ArrayExpression") {
          // console.log("hello");
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
  const newNode = node;
  const newNodeChildren=node.children.map( (jsx) => {
    if (jsx.type === "JSXElement") {
      return   findMockProvider(jsx,mockVariableName);
    }
    return jsx;
  });
  newNode.children = newNodeChildren;
  //console.log("NEWNODE inside fn",newNode);

  return newNode;
  
}


 function resetVariables() {
 // return new Promise((resolve, reject) => {
    testNameMapstoMockVariableName.clear(); // Clear the Map
    mockvariableArr.length = 0; // Clear the Array
    singleMockVariablearr.length = 0; // Clear the Array
   // resolve();
 // })
 
}


const addMocksAttribute =  (ast) => {
 // return new Promise((resolve, reject) => {
    const astBody = ast.body.map(node => {
      const newNode = node;
      if (node.expression && node.expression.callee.name === "test") {
        const insideTest = node.expression.arguments[1].body.body;
        if (insideTest) {
          const insideTestNodesArray = insideTest.map(  (node_insideTest) => {
            const newNode_insideTest = node_insideTest;
            if (node_insideTest.expression.callee.name === "render") {
              const insideRender = node_insideTest.expression.arguments;
              //console.log(node_insideTest.expression.arguments);
              if (insideRender.length) {
                //console.log("insideRender");
                const insideRenderNodeArray = insideRender.map( (jsxElement) => {
                  // console.log("inside render map",jsxElement.type);
                  const testName = node.expression.arguments[0].extra.rawValue;
                  
                  if (testNameMapstoMockVariableName.has(testName)) {
                    // console.log("TESST_NAMES",testName,testNameMapstoMockVariableName.get(testName));
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
 //   resolve(newAST);
 // });
}


const getPrevTest =  (line,testAndLineArray) => {
  let l = 0, r = testAndLineArray.length-1;
  //console.log(r);
  while (l <= r) {
    let mid = Math.floor((l + r) / 2);
  //  console.log(l,r,mid);
    if (testAndLineArray[mid].line >= line) {
      r = mid-1;
    } else {
      l = mid + 1;
    }
  }
  if (l - 1 >= 0 && l - 1 < testAndLineArray.length) return [l-1,testAndLineArray[l - 1].test];
  return null;
}

const createMockVariables = (map) => {
  let currentCountofMocks = 2;
  for (const [key, lines] of map) {
    let currentSubCountofMocks = 1;
    const queryName = key.split('$#')[0];
    const variables = key.split('$#')[1];

    if (lines.length > 1) {
      for (let line of lines) {
          const mockVariableName = 'MOCKS' + currentCountofMocks +'_'+ currentSubCountofMocks;
          mockvariableArr.push([mockVariableName, queryName, variables]);
          currentSubCountofMocks += 1;
      }
      currentCountofMocks += 1;
    } else {
        singleMockVariablearr.push([queryName, variables]);
      
    }
  }
  return
}

const createMapofTestNametoVariableName =  (map,testAndLineArray) => {
  //return new Promise( (resolve, reject) => {
    let currentCountofMocks = 2;
    for (const [key, lines] of map) {
      let currentSubCountofMocks = 1;
      const queryName = key.split('$#')[0];
      const variables = key.split('$#')[1];
  
      if (lines.length > 1) {
        for (let line of lines) {
          // find the line of test just prev to current line
          const testName =   getPrevTest(line, testAndLineArray);
          // console.log("TestName", testName);
          if (testName) {
            const mockVariableName = 'MOCKS' + currentCountofMocks +'_'+ currentSubCountofMocks;
            testNameMapstoMockVariableName.set(testName[1],mockVariableName );
            mockvariableArr.push([mockVariableName, queryName, variables]);
            currentSubCountofMocks += 1;
          }
          
        }
        currentCountofMocks += 1;
      } else {
        const testName =  getPrevTest(lines[0],testAndLineArray);
        if (testName) {
          testNameMapstoMockVariableName.set(testName[1], 'MOCKS1');
          singleMockVariablearr.push([queryName, variables]);
        }
      }
    }
  return
  //  resolve();
//  });
}



const getAST = (type) => {
//  return new Promise((resolve, reject) => {
    let content = "";
    mockvariableArr.forEach((payload) => {
      content += `const ${payload[0]}=[{
        request: {
            query: ${payload[1]},
            variables: ${payload[2]}
        },
        result: {
            data: {
                
            }
        }
     }];\n `
    });
      
    if (singleMockVariablearr.length > 0) {
      const samemockVaribaleNameContent = singleMockVariablearr.map((payload) => {
        return (
          `{
                    request: {
                        query: ${payload[0]},
                        variables: ${payload[1]}
                    },
                    result: {
                        data: {
                            
                        }
                    }
                }`
        );
          
      });
    
      content += `const MOCKS1=[${samemockVaribaleNameContent}];\n `;
    }
  //  console.log(content);
  if (type === 2) {
    content = '\n /*' + content + '*/';
    return content;
  }
  const vardeclareAst = parser.parse(content, {
    sourceType: 'module',
    plugins: ['jsx']
  });
  const varAST = vardeclareAst.program.body;
  return varAST;
  //  resolve(varAST);
 // })


}
const addMocksvariable =  (map, fileName, testAndLineArray,type) => {
      
  resetVariables();      

  // console.log("TESTNAMEMAPSTOVRNAME",testNameMapstoMockVariableName)
  
  if (type === 2) {
    createMockVariables(map);
    if (mockvariableArr.length || singleMockVariablearr) {
      const content = getAST(type);
      fs.appendFileSync(`./${fileName}`, content);
    }

  } else {
  const mockVariablesAST = getAST(type);
  //console.log(fileName);
  //console.log("Map", map);
  //console.log("Filename", fileName);
  // console.log("Test and Line Array", testAndLineArray);
  // console.log("Creating map of test name to variable name");
  createMapofTestNametoVariableName(map, testAndLineArray);
  // console.log("Map of query var to to lines", map);
  // console.log("Lins to test map", testAndLineArray);
  // console.log(testNameMapstoMockVariableName)
   console.log("Mocks_Varibale_Array", mockvariableArr);
   console.log("Mocks_Different_Array", singleMockVariablearr);
    // console.log(typeof data);
  //console.log("Reading file :", fileName);
  const data = fs.readFileSync(`./${fileName}`, 'utf-8');
  const ast = parser.parse(data, {
    sourceType: "module",
    plugins: ["jsx"]
  });

  let lastImportIndex = 0;
  ast.program.body.forEach((topLvlDeclarartions, index) => {
    if (topLvlDeclarartions.type === "ImportDeclaration") {
      lastImportIndex = index;
    }
  });
  
  const astCodeOld = generator.default(ast).code;
  // console.log("add_Mocks_attribute_fn_Called")
  const newAstProgram = addMocksAttribute(ast.program);
  
  // then( (newAstProgram) => {
  const newAst = ast;
  newAst.program = newAstProgram;
  // console.log("Writing mock variables")
  newAst.program.body.splice(lastImportIndex+1,0,...mockVariablesAST);
  
  const astCodeNew =  generator.default(newAst).code;
  fs.writeFileSync(`./${fileName}`, astCodeNew);
  }
  
            

  

}

export default addMocksvariable;
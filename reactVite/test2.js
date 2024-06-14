/* eslint-disable @typescript-eslint/no-explicit-any */
import parser from "@babel/parser";
import generator from "@babel/generator";

import fs from 'fs';

const code = `
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-undef */


import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";
import { Dog } from "./dog";





test("renders without error second", async () => {
  
  render(
  <Box>
  <Box>
    <MockedProvider mocks={[]}>
      <Dog name="Buck" name2="Buck2" name3="buck3" name4="Buck4" name5="Buck5" />
    </MockedProvider>
  </Box>
  <Box2>
   <MockedProvider>
      <Dog name="Buck" name2="Buck2" name3="buck3" name4="Buck4" name5="Buck5" />
    </MockedProvider>
  </Box2>
  <Box2>
   <MockedProvider mocks={OtherMockVar}>
      <Dog name="Buck" name2="Buck2" name3="buck3" name4="Buck4" name5="Buck5" />
    </MockedProvider>
  </Box2>
  </Box>
  );
 // expect(screen.getByText("Loading...")).toBeInTheDocument();
});
`;

const mocksAttribute={
  "type": "JSXAttribute",
  "name": {
    "type": "JSXIdentifier",
    "name": "mocks"
  },
  "value": {
    "type": "JSXExpressionContainer",
    
    "expression": {
      "type": "Identifier",
      "name": "MOCKS"
    }
  }
}

function findMockProvider(node) {
  if (node.type === "JSXElement" && node.openingElement.type === "JSXOpeningElement" && node.openingElement.name.name === "MockedProvider") {
    let isMockPresent = false;
    let JSXOpeningElementAttributes = node.openingElement.attributes.map((jsxAttribute) => {
      
      if (jsxAttribute.name.name === "mocks") {
        isMockPresent = true;
        if (jsxAttribute.value.expression.type === "ArrayExpression") {
          jsxAttribute.value = mocksAttribute.value;
        }
      }
      return jsxAttribute;
    });
    if (!JSXOpeningElementAttributes || JSXOpeningElementAttributes.length == 0) {
      JSXOpeningElementAttributes = [mocksAttribute];
    } else if (!isMockPresent) {
      JSXOpeningElementAttributes.push(mocksAttribute);
    }
    node.openingElement.attributes = JSXOpeningElementAttributes;

    return node;
  }
  const newNode = node;
  const newNodeChildren=node.children.map((jsx) => {
    if (jsx.type === "JSXElement") {
      return findMockProvider(jsx);
    }
    return jsx;
  });
  newNode.children = newNodeChildren;
  //console.log("NEWNODE inside fn",newNode);

  return newNode;
  
}

const getAST = (mocksVaribale,end) => {
  const vardeclareAst = parser.parse(mocksVaribale, {
    sourceType: 'module',
    plugins: ['jsx']
  });
  const varAST = vardeclareAst.program.body[0];
  // const diff = varAST.end - varAST.start;
  // varAST.start = end + 10;
  // varAST.end = end + 10 + diff;
  // varAST.loc.start = end + 10;
  // varAST.loc.end = end + 10 + diff;
  // console.log(varAST,end);
  return varAST
}
const addMocksAttribute = async (ast) => {
  return new Promise((resolve, reject) => {
    const astBody = ast.body.map(node => {
      const newNode = node;
      if (node.expression && node.expression.callee.name === "test") {
        const insideTest = node.expression.arguments[1].body.body;
        if (insideTest) {
          const insideTestNodesArray = insideTest.map(node_insideTest => {
            const newNode_insideTest = node_insideTest;
            if (node_insideTest.expression.callee.name === "render") {
              const insideRender = node_insideTest.expression.arguments;
              //console.log(node_insideTest.expression.arguments);
              if (insideRender.length) {
                //console.log("insideRender");
                const insideRenderNodeArray = insideRender.map((jsxElement) => {
                  //console.log("imnsede render map",jsxElement.type);
                  return findMockProvider(jsxElement);
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
    resolve(newAST);
  });
}

const addMocksvariable = (mocksVaribale,fileName) => {
  
  fs.readFile(`./${fileName}`, 'utf-8', (err, data) => {
    // console.log(typeof data);
    const ast = parser.parse(data, {
      sourceType: "module",
      plugins: ["jsx"]
    });
    let lastImportIndex = 0;
    let endofLastImportedIndex = 0;
    ast.program.body.forEach((topLvlDeclarartions, index) => {
      if (topLvlDeclarartions.type === "ImportDeclaration") {
        lastImportIndex = index;
        endofLastImportedIndex = topLvlDeclarartions.end+1;
      }
    });
  
    const mocksVariableAST = getAST(mocksVaribale,endofLastImportedIndex);
  
    const astCodeOld = generator.default(ast).code;
  
    
    addMocksAttribute(ast.program).
      then((newAstProgram) => {
        const newAst = ast;
        newAst.program = newAstProgram;
        newAst.program.body.splice(lastImportIndex,0,mocksVariableAST);
        
        const astCodeNew = generator.default(newAst).code;
        //console.log("Before\n", astCodeOld, '\n\n\n\nafter\n', astCodeNew);
        fs.writeFile(`./${fileName}`, astCodeNew, (err) => {
          if (err) createUnparsedSourceFile.log("Error: ", err);
          else console.log("Written successfully!");
        })
        
      });
  });
  

}

export default addMocksvariable;
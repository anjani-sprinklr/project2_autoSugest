/* eslint-disable @typescript-eslint/no-explicit-any */
import parser from "@babel/parser";
import generator from "@babel/generator";

import fs from 'fs';

const code = `/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-undef */


import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";
import { Dog } from "./dog";


const setU3=function(params){
  const hey="hey";
 return(
  	<MockedProvider mocks={[]} addTypename={false}>
      <Dog name="Buck" name2="Buck2" name3="buck3" name4="Buck4" name5="Buck5" />
    </MockedProvider>
 
 );
  
}
const setUp2=async (paprams)=>{
  return (
      <MockedProvider  addTypename={false}>
        <Dog name="Buck" name2="Buck2" name3="buck3" name4="Buck4" name5="Buck5" />
      </MockedProvider>
  );
  
}


function setUp(params){
  
  const hey="hey";
 return(
  	<MockedProvider mocks={[]} addTypename={false}>
      <Dog name="Buck" name2="Buck2" name3="buck3" name4="Buck4" name5="Buck5" />
    </MockedProvider>
 
 );
   
}

test("renders without error second", async () => {
  
  render(
    <>
    <Box>
     setup(props)
    </Box>
  
    </>
  );
 // expect(screen.getByText("Loading...")).toBeInTheDocument();
});


test("renders without error second 2", async () => {
  
  render(
	setup2(props)
   
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

const addMocksAttribute = async (ast) => {
  return new Promise((resolve, reject) => {
    const astBody = ast.body.map(node => {
        if (node.type === "VariableDeclaration" && node.declarations[0].init &&
            ((node.declarations[0].init.type === "FunctionExpression") ||
                (node.declarations[0].init.type === "ArrowFunctionExpression"))) {
            const functionNode = node.declarations[0].init;
            const totaBlockStatements = functionNode.body.body.length;
            if (totaBlockStatements > 0) {
                const returnStatement = functionNode.body.body[totaBlockStatements - 1];
                if (returnStatement.type==="ReturnStatement" && returnStatement.argument.type === "JSXElement") {
                    const jsxElement = findMockProvider(returnStatement.argument);
                    node.declarations[0].init.body.body[totaBlockStatements - 1].argument = jsxElement;
                }
                
            }
           

        }
        if (node.type === "FunctionDeclaration") {
            const functionNode = node;
            const totaBlockStatements = functionNode.body.body.length;
            if (totaBlockStatements > 0) {
                const returnStatement = functionNode.body.body[totaBlockStatements - 1];
                if (returnStatement.type === "ReturnStatement" && returnStatement.argument.type === "JSXElement") {
                    
                    console.log("***********\n\n Definetly went inside Fucntindec *********** ")
                    const jsxElement = findMockProvider(returnStatement.argument);
                    node.body.body[totaBlockStatements - 1].argument = jsxElement;
                }
                
            }
           
        }

        return node
    });
    const newAST = ast;
    newAST.body = astBody;
    resolve(newAST);
  });
}


const getAST = (mocksVaribale,end) => {
    const vardeclareAst = parser.parse(mocksVaribale, {
      sourceType: 'module',
      plugins: ['jsx']
    });
    const varAST = vardeclareAst.program.body[0];
    return varAST
}
const addMocksvariable = (mocksVaribale,fileName) => {

    // console.log(typeof data);
    const ast = parser.parse(code, {
      sourceType: "module",
      plugins: ["jsx"]
    });
    
    let lastImportIndex = 0;
    let endofLastImportedIndex = 0;
    ast.program.body.forEach((topLvlDeclarartions, index) => {
      if (topLvlDeclarartions.type === "ImportDeclaration" ) {
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
        console.log("Before\n", astCodeOld, '\n\n\n\nafter\n', astCodeNew);
        
      });


}


export default addMocksvariable;
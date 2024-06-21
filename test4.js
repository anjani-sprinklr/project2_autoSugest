/* eslint-disable @typescript-eslint/no-explicit-any */

import parser from "@babel/parser";
import generator from "@babel/generator";
import fs from 'fs';
import traverse from "@babel/traverse";
import * as types from '@babel/types';
// Sample code to parse and analyze
const code = `/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-undef */


import { render } from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";
import { Dog } from "./dog";

const setU3 = function(params) {
  const hey = "hey";
  return (
    <MockedProvider mocks={[]} addTypename={false}>
      <Dog name="Buck" name2="Buck2" name3="buck3" name4="Buck4" name5="Buck5" />
    </MockedProvider>
  );
}

const setUp2 = async (params) => {
  return (
    <MockedProvider addTypename={false}>
      <Dog name="Buck" name2="Buck2" name3="buck3" name4="Buck4" name5="Buck5" />
    </MockedProvider>
  );
}

function setUp(params) {
  const hey = "hey";
  return (
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

// Function to extract import nodes and directives from the AST
function extractASTNodes(ast) {
    const importNodes = [];
    const directives = [];

    // Traverse the AST to find import declarations
    traverse.default(ast, {
      VariableDeclaration(path) {
        path.node.declarations.forEach((node) => {
          if (node.id.name) {
            
          }
        });
      }
    });
  const astCodeNew = generator.default(ast).code;
  console.log(astCodeNew);
    return { importNodes, directives };
}

// Parse the code into an AST
const ast = parser.parse(code, {
  sourceType: 'module',
  plugins: ['jsx', 'typescript']
});

// Extract nodes from the AST
const result = extractASTNodes(ast);


/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-undef */


import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";
import { Dog, GET_DOG_QUERY } from "./dog";
import { GET_LOCATIONS_QUERY } from "./useCustomHook";

//react

//utilis

//consts

//types

const setup=() => {
  return (
    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <Dog name="Buck" name2="Buck2" name3="buck3" name4="Buck4" name5="Buck5" />
      </MockedProvider>
     
    )
  )
}

const MOCKS_14 = [{
  request: {
    query: GET_DOG_QUERY,
    variables: {
      "name": "Buck",
      "name2": "Buck2",
      "name3": "buck3",
      "name4": "Buck4",
      "name5": "Buck5"
    }
  },
  result: {
    data: {}
  }
}];

test("renders without error second 1000", async () => {
  render(<MockedProvider mocks={MOCKS_14} addTypename={false}>
      <Dog name="Buck" name2="Buck2" name3="buck3" name4="Buck4" name5="Buck5" />
    </MockedProvider>);
  // expect(screen.getByText("Loading...")).toBeInTheDocument();
});
test("renders without error second 2000", async () => {
  render(<MockedProvider mocks={
    [{
      request: {
        query: GET_LOCATIONS_QUERY,
        variables: {
          "name": "name2"
        }
      },
      result: {
        data: {}
      }
    }]
  } addTypename={false}>
      <Dog name="Buck" name2="Buck2" name3="buck3" name4="Buck4" name5="Buck5" />
    </MockedProvider>);
  // expect(screen.getByText("Loading...")).toBeInTheDocument();
});

test("renders without error second", async () => {
  
  render(
    <MockedProvider mocks={[]} addTypename={false}>
      <Dog name="Buck" name2="Buck2" name3="buck3" name4="Buck4" name5="Buck5" />
    </MockedProvider>
   
  );
 // expect(screen.getByText("Loading...")).toBeInTheDocument();
});



test("renders without error second 2", async () => {
  
  render(
    <MockedProvider mocks={[]} addTypename={false}>
      <Dog name="Buck" name2="Buck2" name3="buck3" name4="Buck4" name5="Buck56" />
    </MockedProvider>
   
  );
  expect(screen.getByText("kjkjkjkj...")).toBeInTheDocument();
});


test("renders without error second 3", async () => {
  setup();
 
 // expect(screen.getByText("Loading...")).toBeInTheDocument();
});



test("renders without error second 4", async () => {
  
  render(
    <MockedProvider mocks={[]} addTypename={false}>
      <Dog name="Buck" name2="Buck2" name3="buck3" name4="Buck4" name5="Buck55" />
    </MockedProvider>
   
  );
 // expect(screen.getByText("Loading...")).toBeInTheDocument();
});


test("renders without error second 5", async () => {
  
  render(
    <MockedProvider mocks={[]} addTypename={false}>
      <Dog name="Buck" name2="Buck2" name3="buck3" name4="Buck4" name5="Buck5" />
    </MockedProvider>
   
  );
 // expect(screen.getByText("Loading...")).toBeInTheDocument();
});


test("renders without error second 6", async () => {
  
  render(
    <MockedProvider mocks={[]} addTypename={false}>
      <Dog name="Buck12" name2="Buck2" name3="buck3" name4="Buck4" name5="Buck5" />
    </MockedProvider>
   
  );
 // expect(screen.getByText("Loading...")).toBeInTheDocument();
});



test("renders without error second 7", async () => {
  
  render(
    <MockedProvider mocks={[]} addTypename={false}>
      <Dog name="Buck12" name2="Buck2" name3="buck3" name4="Buck4" name5="Buck5" />
    </MockedProvider>
   
  );
 // expect(screen.getByText("Loading...")).toBeInTheDocument();
});


test("renders without error second 8", async () => {
  
  render(
    <MockedProvider mocks={[]} addTypename={false}>
      <Dog name="Buck12" name2="Buck2" name3="buck3" name4="Buck4" name5="Buck5" />
    </MockedProvider>
   
  );
 // expect(screen.getByText("Loading...")).toBeInTheDocument();
});

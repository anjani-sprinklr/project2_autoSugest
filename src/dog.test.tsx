/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-undef */

import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import { Dog, GET_DOG_QUERY, MOCKS_15 } from "./dog";
import { GET_LOCATIONS_QUERY } from "./useCustomHook";
import { MockedProvider as AnjaniProvider } from "@apollo/client/testing";
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
test("renders without error second", async () => {
  render(<AnjaniProvider mocks={MOCKS_14} addTypename={false}>
      <Dog name="Buck" name2="Buck2" name3="buck3" name4="Buck4" name5="Buck5" />
    </AnjaniProvider>);
  // expect(screen.getByText("Loading...")).toBeInTheDocument();
});
test("renders without error second2", async () => {
  render(<AnjaniProvider mocks={[{
    request: {
      query: GET_LOCATIONS_QUERY,
      variables: {
        "name": "name2"
      }
    },
    result: {
      data: {}
    }
  }]} addTypename={false}>
      <Dog name="Buck" name2="Buck2" name3="buck3" name4="Buck4" name5="Buck5" />
    </AnjaniProvider>);
  // expect(screen.getByText("Loading...")).toBeInTheDocument();
});
test("renders without error second 300", async () => {
  render(<AnjaniProvider mocks={MOCKS_15} addTypename={false}>
      <Dog name="Buck" name2="Buck2" name3="buck3" name4="Buck4" name5="Buck5" />
    </AnjaniProvider>);
  // expect(screen.getByText("Loading...")).toBeInTheDocument();
});

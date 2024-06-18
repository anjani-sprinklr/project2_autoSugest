/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-undef */

import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import { Dog } from "./dog";
import { MockedProvider } from "@apollo/client/testing";

// const mocks = [
//   {
//     request: {
//       query: GET_DOG_QUERY,
//       variables: {
//           name: "Buck",
//           name2: "Buck2",
//           name3: "buck3",
//           name4: "Buck4",
//           name5:"Buck5"

//       }
//     },
//     result: {
//       data: {
//       }
//     }
//   }
// ];

const setup = () => {
  return render(<MockedProvider mocks={[]} addTypename={false}>
                <Dog name="Buck" name2="Buck2" name3="buck3" name4="Buck4" name5="Buck5" />
            </MockedProvider>);
};

// wrapper fn  has a specifc name?
// does it have parameters already ?
// or is there anything else with the wrapper f
test("renders without error second", async () => {
  setup();
});
test("renders without error second2", async () => {
  setup();
});
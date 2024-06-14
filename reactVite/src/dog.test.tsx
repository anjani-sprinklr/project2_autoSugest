/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-undef */

import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import { Dog } from "./dog";

import { MockedProvider } from "@apollo/client/testing";

// const setup = () => {
//   <MockedProvider mocks={}></MockedProvider>
// }

// test("renders without error second", async () => {  
//   //setup(MOCKS);
//     render(

//     //setup(mocks)
//     <MockedProvider >
//     <DogTest />
//    </MockedProvider>
//   );

//  // expect(screen.getByText("Loading...")).toBeInTheDocument();
// });

test("renders without error second", async () => {
  render(<MockedProvider mocks={[]} addTypename={false}>
      <Dog name="Buck" name2="Buck2" name3="buck3" name4="Buck4" name5="Buck5" />
    </MockedProvider>);
  // expect(screen.getByText("Loading...")).toBeInTheDocument();
});

test("renders without error second", async () => {
  render(<MockedProvider mocks={[]} addTypename={false}>
      <Dog name="Buck" name2="Buck2" name3="buck3" name4="Buck4" name5="Buck5" />
    </MockedProvider>);
  // expect(screen.getByText("Loading...")).toBeInTheDocument();
});
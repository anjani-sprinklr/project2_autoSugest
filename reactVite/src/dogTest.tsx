/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-undef */


import "@testing-library/jest-dom";
import { MockedProvider } from "@apollo/client/testing";
import { Dog } from "./dog";

// const mocks = [
//   {
//     request: {
//       query: GET_DOG_QUERY,
//       variables: {
//         name: "Buck"
//       }
//     },
//     result: {
//       data: {
//         dog: { id: "1", name: "Buck", breed: "bulldog" }
//       }
//     }
//   }
// ];

const DogTest = () => {
    return (
        <MockedProvider mocks={[]} addTypename={false}>
            <Dog name="Buck" name2="Buck2" name3="buck3" name4="Buck4" name5="Buck5" />
        </MockedProvider>
    );
}

export default DogTest;
  
   

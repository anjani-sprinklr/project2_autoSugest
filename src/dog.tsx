/* eslint-disable @typescript-eslint/no-unused-vars */
import { gql, useQuery } from "@apollo/client";
import useCustomHook from "./useCustomHook";

// Make sure that both the query and the component are exported
// eslint-disable-next-line react-refresh/only-export-components

export const GET_DOG_QUERY = gql(`
  query GetDog($name: String) {
    dog(name: $name) {id 
      name
      breed
    }
  }
`);

export const MOCKS_15 = [{
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
// export const GET_DOG_QUERY2 = gql`
//   query GetDog($name: String) {
//     dog(name: $name) {
//       id
//       name
//       breed
//     }
//   }
// `;
// type dataType = {
//   id: string,
//   name: string,
//   breed:string
// }
// type customType={
//   loading2: boolean,
//   error2: null,
//   data:dataType
// }

export function Dog({ name,name2,name3,name4,name5 }:{name:string,name2:string,name3:string,name4:string,name5:string}) {
  const { loading, error, data } = useQuery(GET_DOG_QUERY, {
    variables: { name,name2,name3,name4,name5 }
  });
  const { loading2,data2} = useCustomHook("name2");
  //const { loading2,data2} = useCustomHook(name,"Buck2","buck3","Buck4",name5);
  if (loading || loading2) return <p>Loading...</p>;
 // if (loading) return <p>Loading...</p>;
  if (error) return <p>{error.message}</p>;
  return (
    <>
    <p>
      {data.dog.name} is a {data.dog.breed}
      </p>
      <p>{data2.dog.name} is a { data.dog.description}</p>
    </>
  );
}
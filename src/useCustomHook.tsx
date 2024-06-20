
import { gql, useQuery } from "@apollo/client";

// import { GET_DOG_QUERY } from "./dog";

export  const GET_LOCATIONS_QUERY = gql`query GetLocations {
  locations {
    id
    name
    description
    photo
  }
}`;


type dataType = {
    id: string,
    name: string,
    breed:string
  }
type CustomType={
    loading2: boolean,
    error2: undefined |Error|null,
    data2: {
        dog: dataType
    }
  }
const useCustomHook = (name:string) : CustomType => {
    const { loading, data } = useQuery(GET_LOCATIONS_QUERY, {
        variables: { name }
      });
      
    return { loading2: loading, error2: null, data2: data };
}

// const useCustomHook = (name:string,name2:string,name3:string,name4:string,name5:string) : CustomType => {
//   const { loading, data } = useQuery(GET_DOG_QUERY, {
//     variables: { name,name2,name3,name4,name5 }
//   });
    
//   return { loading2: loading, error2: null, data2: data };
// }

export default useCustomHook;
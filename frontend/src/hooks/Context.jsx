import { createContext, useState } from "react";
import { useEffect } from "react";
import api from "./api";
export const MyContext = createContext();

const Context = ({ children }) => {
  useEffect(()=>{
    console.log("Req send")
    api.get('/current-user')
    .then((res)=>{
      if(res.data?.user?._id){
        setCurrentUser(res.data.user)
      }
    })
  },[])
  const [currentUser,setCurrentUser]=useState({})
  return (
    <MyContext.Provider value={{currentUser,setCurrentUser}}>
      {children}
    </MyContext.Provider>
  );
};

export default Context;
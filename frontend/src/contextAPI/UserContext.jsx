import axios from 'axios';
import React, { createContext, useEffect, useState } from 'react';

// Create the context
export const userdataContext = createContext();

function UserContext({ children }) {
  const serverurl = "http://localhost:8000";
  const [userdata, setuserdata] = useState(null);
   const [frontendimg, setfrontendimg] = useState(null);
    const [backendimg, setbackendimg] = useState(null);
    const[selectedimage,setselectedimage]=useState(null);

  const handleCurrentUser = async () => {
    try {
      const result = await axios.get(`${serverurl}/api/user/current`, {
        withCredentials: true,
      });

      setuserdata(result.data);
      console.log("✅ Current User:", result.data); // ✅ Proper log
    } catch (error) {
      console.error("❌ Error fetching current user:", error?.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    handleCurrentUser();
  }, []);
  const geminiResponse=async (prompt)=>
  {
    try {
      const result=await axios.post(`${serverurl}/api/user/askassistant`,
        {prompt},{withCredentials:true}
      )
      return result.data
      
    } catch (error) {
      console.log(error)
      
    }
  }

  const value = {
    serverurl,
    userdata,
    setuserdata,
    frontendimg,
    setfrontendimg,
    backendimg,
    setbackendimg,
    selectedimage,
    setselectedimage,geminiResponse
  };

  return (
    <userdataContext.Provider value={value}>
      {children}
    </userdataContext.Provider>
  );
}

export default UserContext;

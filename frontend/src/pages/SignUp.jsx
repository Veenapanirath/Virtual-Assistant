import React, { useState } from 'react';
import { useContext } from 'react';
import { IoIosEye, IoIosEyeOff } from "react-icons/io";
import {useNavigate} from 'react-router-dom'
import { userdataContext } from '../contextAPI/UserContext';
import axios from "axios"
import BG from '../assets/authBg.png'


function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate=useNavigate()
  const {serverurl,setuserdata,userdata}=useContext(userdataContext)
  const [name,setname]=useState('');
   const [email,setemail]=useState('');
    const [password,setpassword]=useState('');
    const [error,seterror]=useState('');
    const [loading,setloading]=useState(false);
const handlesignup = async (e) => {
  e.preventDefault();
  seterror('');
  setloading(true)
  try {
    const result = await axios.post(
      `${serverurl}/api/auth/signup`,
      {
        name,
        email,
        password,
      },
      { withCredentials: true }
    );
      setuserdata(result.data)
    console.log("Signup Success:", result.data);
    setloading(false);
    // Redirect to signin or home if signup is successful
    navigate('/customize');
  } catch (error) {
    // Improved error logging
    if (error.response?.data?.message) {
      console.error("Signup error:", error.response.data.message);
      seterror(error.response.data.message)
      setloading(false)
      setuserdata(null);
    } else {
      console.error("Unhandled error:", error);
    }
  }
};



  return (
    <div
  className="w-full h-[100vh] bg-cover bg-center flex justify-center items-center"
  style={{ backgroundImage: `url(${BG})` }}
>

      <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl shadow-lg shadow-black w-[90%] max-w-md text-white">
        <h2 className="text-2xl font-semibold text-center mb-6">
          Register to <span className="text-blue-400">Virtual Assistant</span>
        </h2>

        <form className="space-y-4" onSubmit={handlesignup}>
          <div>
            <label className="block text-sm mb-1">Enter your Name</label>
            <input
              type="text"
              placeholder="Your Name"
              value={name}
              onChange={(e)=>
              {
              setname(e.target.value)
              }
              }
              className="w-full p-3 rounded-lg bg-white/20 placeholder-white text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
              placeholder="Email"
               value={email}
              onChange={(e)=>
              {
              setemail(e.target.value)
              }
              }
              className="w-full p-3 rounded-lg bg-white/20 placeholder-white text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div className="relative">
            <label className="block text-sm mb-1">Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
               value={password}
              onChange={(e)=>
              {
              setpassword(e.target.value)
              }
              }
              className="w-full p-3 rounded-lg bg-white/20 placeholder-white text-white focus:outline-none focus:ring-2 focus:ring-blue-400 pr-10"
            />
            {error.length>0 && <p className='text-red-500 text-lg'>{error}</p>}
            <button
              type="button"
              className="absolute top-[38px] right-3 text-white"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <IoIosEyeOff size={20} /> : <IoIosEye size={20} />}
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg transition"
          disabled={loading}>
{loading?"Loading....":"Sign Up"}
           
          </button>
        </form>

        <p className="text-center text-sm mt-4">
          Already have an account?{' '}
          <span  onClick={()=>
            {
              navigate("/signin")
            }
          } className="underline text-blue-300 hover:text-blue-500">
            Sign in
          </span>
        </p>
      </div>
    </div>
  );
}

export default SignUp;

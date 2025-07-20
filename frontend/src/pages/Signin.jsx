import React, { useState } from 'react';
import { useContext } from 'react';
import { IoIosEye, IoIosEyeOff } from "react-icons/io";
import { useNavigate } from 'react-router-dom'
import { userdataContext } from '../contextAPI/userContext';
import axios from "axios"
import BG from "../assets/authBg.png"

function Signin() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate()
  const { serverurl, setuserdata, userdata } = useContext(userdataContext)

  const [email, setemail] = useState('');
  const [password, setpassword] = useState('');
  const [error, seterror] = useState('');
  const [loading, setloading] = useState(false);

  const handlesignIn = async (e) => {
    e.preventDefault();
    seterror('');
    setloading(true)
    try {
      const result = await axios.post(
        `${serverurl}/api/auth/signin`,
        {
          email,
          password,
        },
        {
          withCredentials: true
        }
      );
      setuserdata(result.data)
      console.log("Signin Success:", result.data);
      // Redirect to signin or home if signup is successful
      navigate('/');
    } catch (error) {
      // Improved error logging
      if (error.response?.data?.message) {
        console.error("Signup error:", error.response.data.message);
        seterror(error.response.data.message)
        setloading(false)
        setuserdata(false)
      } else {
        console.error("Unhandled error:", error);
      }
    }
  };

  return (
    <div
      className="w-full h-[100vh] bg-cover bg-center flex justify-center items-center p-4 sm:p-6 lg:p-8"
      style={{ backgroundImage: `url(${BG})` }}
    >
      <div className="bg-white/10 backdrop-blur-sm p-6 sm:p-8 lg:p-10 rounded-xl shadow-lg shadow-black w-[90%] max-w-sm sm:max-w-md lg:max-w-lg text-white">
        
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-center mb-4 sm:mb-6 lg:mb-8">
          Login to <span className="text-blue-400">Virtual Assistant</span>
        </h2>

        <form className="space-y-4 sm:space-y-5 lg:space-y-6" onSubmit={handlesignIn}>
          <div>
            <label className="block text-sm sm:text-base mb-1 sm:mb-2">Email</label>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => {
                setemail(e.target.value)
              }}
              className="w-full p-3 sm:p-4 rounded-lg bg-white/20 placeholder-white text-white focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base"
            />
          </div>

          <div className="relative">
            <label className="block text-sm sm:text-base mb-1 sm:mb-2">Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => {
                setpassword(e.target.value)
              }}
              className="w-full p-3 sm:p-4 rounded-lg bg-white/20 placeholder-white text-white focus:outline-none focus:ring-2 focus:ring-blue-400 pr-10 sm:pr-12 text-sm sm:text-base"
            />
            {error.length > 0 && <p className='text-red-400 text-sm sm:text-base mt-1 sm:mt-2'>{error}</p>}
            <button
              type="button"
              className="absolute top-[36px] sm:top-[42px] right-3 sm:right-4 text-white hover:text-gray-300 transition-colors"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <IoIosEyeOff size={20} /> : <IoIosEye size={20} />}
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white py-3 sm:py-4 rounded-lg transition text-sm sm:text-base font-medium mt-4 sm:mt-6"
            disabled={loading}
          >
            {loading ? "Loading...." : "Sign in"}
          </button>
        </form>

        <p className="text-center text-xs sm:text-sm mt-4 sm:mt-6">
          Do not have an account?{' '}
          <span
            onClick={() => {
              navigate("/signup")
            }}
            className="underline text-blue-300 hover:text-blue-500 cursor-pointer transition-colors"
          >
            Sign up
          </span>
        </p>
      </div>
    </div>
  );
}

export default Signin;
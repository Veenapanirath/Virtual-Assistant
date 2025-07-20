import React, { useContext, useRef } from 'react';
import Card from '../components/Card';
import { FaCloudUploadAlt, FaArrowLeft } from "react-icons/fa";
import image1 from '../assets/image1.png';
import image2 from '../assets/image2.jpg';
import image4 from '../assets/image4.png';
import image5 from '../assets/image5.png';
import image6 from '../assets/image6.jpeg';
import image7 from '../assets/image7.jpeg';
import Auth from '../assets/authBg.png';
import { userdataContext } from '../contextAPI/userContext';
import { useNavigate } from 'react-router-dom';

const avatarImages = [
  image1,
  image2,
  image7,
  image4,
  image5,
  image6,
  Auth,
];

const Customize = () => {
  const {
     frontendimg,
    setfrontendimg,
    backendimg,
    setbackendimg,
    selectedimage,
    setselectedimage
  } = useContext(userdataContext);
  const inputImage = useRef();
  const navigate = useNavigate();

  const handleImage = (e) => {
    const file = e.target.files[0];
    
    setbackendimg(file);
    setfrontendimg(URL.createObjectURL(file));
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-t from-black to-[#191970] flex flex-col items-center justify-center relative overflow-hidden px-2 sm:px-4">
      {/* Back Arrow Button */}
      <button
        onClick={handleBackToHome}
        className="absolute top-4 sm:top-6 left-4 sm:left-6 z-10 p-2 sm:p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 
        text-white hover:bg-white/20 transition-all duration-300 hover:scale-110 active:scale-95
        shadow-lg hover:shadow-xl group"
        style={{ fontFamily: "'Orbitron', sans-serif" }}
      >
        <FaArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-[-2px] transition-transform duration-200" />
      </button>

      <h1
        className="text-[1.5rem] sm:text-[2.2rem] md:text-[2.7rem] font-extrabold tracking-wide mb-6 sm:mb-8 drop-shadow-lg text-center px-2"
        style={{
          color: 'white',
          fontFamily: "'Orbitron', sans-serif",
          letterSpacing: '0.06em',
          background: 'linear-gradient(90deg,#0ff,#8b5cf6,#51c3fa)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          animation: 'gradient-move 3s infinite ease-in-out',
        }}
      >
        Choose Your Virtual Assistant's Persona
      </h1>
      <style>{`
        @keyframes gradient-move {
          0%,100% {background-position: 0% 50%;}
          50% {background-position: 100% 50%;}
        }
      `}</style>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8 max-w-full">
        {avatarImages.map((img, idx) => (
          <Card key={idx} image={img} />
        ))}
        <div
          className={`w-[120px] h-[200px] sm:w-[150px] sm:h-[250px] rounded-2xl overflow-hidden flex items-center justify-center
          shadow-lg transition-transform duration-300 transform hover:scale-105 cursor-pointer 
          relative group ${
            selectedimage === "input"
              ? 'border-4 border-cyan-400 shadow-cyan-500/50'
              : 'border-2 border-[#50bfff]'
          }`}
          onClick={() => {
            inputImage.current.click();
            setselectedimage("input");
          }}
        >
          {!frontendimg ? (
            <div className="flex flex-col items-center text-white gap-2">
              <FaCloudUploadAlt className="w-8 h-8 sm:w-10 sm:h-10" />
              <h4 className="text-sm sm:text-md font-semibold text-center px-2" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                Upload Image
              </h4>
            </div>
          ) : (
            <img
              src={frontendimg}
              alt="Uploaded Avatar"
              className="w-full h-full object-cover"
            />
          )}
        </div>
        <input
          type="file"
          accept="image/*"
          ref={inputImage}
          onChange={handleImage}
          hidden
        />
      </div>
      {selectedimage && (
        <button
          className="mt-8 sm:mt-12 px-6 sm:px-10 py-2 sm:py-3 rounded-xl bg-white text-lg sm:text-2xl font-bold text-blue-950 tracking-wide shadow-xl
          hover:bg-blue-100 transition-all duration-300 hover:scale-105 active:scale-100"
          style={{ fontFamily: "'Orbitron', sans-serif" }}
          onClick={() => navigate("/customize2")}
        >
          Continue
        </button>
      )}
    </div>
  );
};

export default Customize;
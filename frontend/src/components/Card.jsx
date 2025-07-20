import React, { useContext } from 'react';
import { userdataContext } from '../contextAPI/UserContext';

const Card = ({ image }) => {
  const {
    selectedimage,
    setselectedimage,
    setbackendimg,
    setfrontendimg
  } = useContext(userdataContext);

  const isSelected = selectedimage === image;

  return (
    <div
      className={`w-[120px] h-[200px] sm:w-[140px] sm:h-[230px] md:w-[150px] md:h-[250px] lg:w-[160px] lg:h-[260px] xl:w-[170px] xl:h-[270px] rounded-2xl overflow-hidden flex items-center justify-center
        shadow-lg transition-transform duration-300 transform hover:scale-105 cursor-pointer 
        relative group ${
          isSelected
            ? 'border-4 border-cyan-400 shadow-cyan-500/50'
            : 'border-2 border-[#50bfff]'
        }`}
      onClick={() => {
        setselectedimage(image)
        setbackendimg(null)
        setfrontendimg(null)
    }}
    >
      <img
        src={image}
        alt="assistant avatar"
        className="h-full w-full object-cover rounded-2xl group-hover:opacity-90 transition-all"
      />

      <div className="absolute inset-0 bg-blue-700/20 opacity-0 group-hover:opacity-50 transition rounded-2xl" />

      <span className="absolute bottom-2 sm:bottom-3 inset-x-0 text-center text-cyan-200 text-xs sm:text-sm font-semibold opacity-0 group-hover:opacity-100 transition drop-shadow-md tracking-wide">
        Select
      </span>
    </div>
  );
};

export default Card;

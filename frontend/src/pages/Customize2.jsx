import React, { useContext, useState, useEffect } from 'react';
import { userdataContext } from '../contextAPI/userContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from "react-icons/fa";

function Customize2() {
    const { userdata, backendimg, selectedimage, serverurl, setuserdata } = useContext(userdataContext)
    
    const [assistantName, setAssistantName] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Avoid console.log errors for undefined values
    useEffect(() => {
        if (userdata && typeof userdata.assistantName === "string") {
            setAssistantName(userdata.assistantName);
            console.log("✅ Assistant Name set:", userdata.assistantName);
        } else {
            console.log("ℹ️ No assistantName provided yet.");
        }
    }, [userdata]);

    const navigate = useNavigate();
    
    const handleassistantimg = async () => {
        try {
            setIsLoading(true);
            
            // Validate required data
            if (!assistantName.trim()) {
                console.error("❌ Assistant name is required");
                alert("Please enter an assistant name");
                return;
            }

            if (!backendimg && !selectedimage) {
                console.error("❌ No image selected");
                alert("Please select an image first");
                return;
            }

            let formData = new FormData();
            formData.append("assistantName", assistantName.trim());

            if (backendimg) {
                formData.append("assistantImage", backendimg);
                console.log("📎 Uploading custom image:", backendimg.name);
            } else {
                formData.append("imageUrl", selectedimage);
                console.log("🖼️ Using selected image URL:", selectedimage);
            }

            // Log FormData contents for debugging
            console.log("📤 Sending FormData:");
            for (let [key, value] of formData.entries()) {
                console.log(`  ${key}:`, value);
            }

            const result = await axios.post(`${serverurl}/api/user/update`, formData, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            console.log("📦 Axios Response:", result);
            console.log("📊 Response Data:", result.data);
            console.log("📈 Response Status:", result.status);

            // Check if we actually received data
            if (result.data === null || result.data === undefined) {
                console.error("❌ Backend returned null data");
                alert("Update failed: Server returned no data. Please check backend logs.");
                return;
            }

            if (result.data) {
                console.log("✅ Updated User Data:", result.data); 
                setuserdata(result.data);
                console.log("✅ User context updated successfully");
            } else {
                console.error("❌ No data received from server");
                alert("Update failed: No data received from server");
            }

        } catch (error) {
            console.error("❌ Error updating assistant:", error);
            
            if (error.response) {
                console.error("📋 Error Response:", error.response.data);
                console.error("📊 Error Status:", error.response.status);
                alert(`Update failed: ${error.response.data?.message || error.response.statusText}`);
            } else if (error.request) {
                console.error("📡 No response received:", error.request);
                alert("Update failed: No response from server");
            } else {
                console.error("⚙️ Request setup error:", error.message);
                alert(`Update failed: ${error.message}`);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-gradient-to-t from-black to-[#191970] flex flex-col items-center justify-center relative overflow-hidden px-4 sm:px-6 lg:px-8">

          <button
                  
                  className="absolute top-4 left-4 sm:top-6 sm:left-6 z-10 p-2 sm:p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 
                  text-white hover:bg-white/20 transition-all duration-300 hover:scale-110 active:scale-95
                  shadow-lg hover:shadow-xl group"
                  style={{ fontFamily: "'Orbitron', sans-serif" } } onClick={()=>navigate("/customize")}
                >
                  <FaArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-[-2px] transition-transform duration-200" />
                </button>
            {/* Animated glow effect behind h1 */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -z-10 w-48 h-48 sm:w-64 sm:h-64 md:w-72 md:h-72 rounded-full bg-blue-500 blur-3xl opacity-20 animate-pulse" />
            
            {/* Heading with large futuristic font and animated gradient */}
            <h1 
                className="text-[2rem] sm:text-[2.5rem] md:text-[2.8rem] lg:text-[3rem] font-extrabold text-white mb-6 sm:mb-8 text-center drop-shadow-lg animate-fade-in px-4"
                style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
                <span className="bg-gradient-to-r from-cyan-400 via-blue-200 to-purple-400 bg-clip-text text-transparent animate-gradient-move">
                    Name Your Virtual Assistant
                </span>
            </h1>

            <input
                type="text"
                value={assistantName}
                onChange={(e) => setAssistantName(e.target.value)}
                placeholder="Enter assistant name..."
                className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl bg-white/20 placeholder-white/60 text-white
                           rounded-2xl py-3 px-4 sm:py-4 sm:px-5 border-2 border-cyan-400 
                           focus:outline-none focus:ring-4 focus:ring-cyan-400 focus:border-cyan-300
                           backdrop-blur-xl text-center text-lg sm:text-xl shadow-lg transition-all
                           font-bold animate-fade-in"
                style={{ fontFamily: "'Orbitron', sans-serif", letterSpacing: '0.07em' }}
                disabled={isLoading}
            />
            
            {assistantName && (
                <button
                    className={`mt-8 sm:mt-12 px-6 sm:px-8 md:px-10 py-2.5 sm:py-3 rounded-xl text-lg sm:text-xl md:text-2xl font-bold tracking-wide shadow-xl
                    transition-all duration-300 hover:scale-105 active:scale-100
                    ${isLoading 
                        ? 'bg-gray-400 text-gray-700 cursor-not-allowed' 
                        : 'bg-white text-blue-950 hover:bg-blue-100'
                    }`}
                    style={{ fontFamily: "'Orbitron', sans-serif" }}
                    onClick={async () => {
                        await handleassistantimg();
                        // Only navigate if the update was successful and we have data
                        if (!isLoading) {
                            // Add a small delay to ensure state is updated
                            setTimeout(() => {
                                navigate("/");
                            }, 100);
                        }
                    }}
                    disabled={isLoading}
                >
                    {isLoading ? "Creating..." : "Create your Assistant"}
                </button>
            )}
            
            {/* Keyframes and extra animation (include in your CSS or Tailwind config) */}
            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(40px);}
                    to { opacity: 1; transform: translateY(0);}
                }
                .animate-fade-in {
                    animation: fade-in 1.2s cubic-bezier(.22,1,.36,1) both;
                }
                @keyframes gradient-move {
                    0%,100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
                .animate-gradient-move {
                    background-size: 200% 200%;
                    animation: gradient-move 3s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}

export default Customize2;
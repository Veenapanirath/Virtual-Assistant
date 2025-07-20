// user.controller.js
import { response } from "express";
import uploadoncloudinary from "../config/cloudinary.js"
import geminiResponse from "../gemini.js";
import User from "../models/user.model.js"
import moment from "moment";

// Voice gender detection function
const detectVoiceGender = (assistantName) => {
  if (!assistantName || typeof assistantName !== 'string') {
    return 'neutral';
  }

  const name = assistantName.toLowerCase().trim();

  // Male names
  const maleNames = [
    'alex', 'david', 'john', 'michael', 'james', 'robert', 'william', 'christopher', 
    'daniel', 'matthew', 'anthony', 'mark', 'donald', 'steven', 'paul', 'andrew', 
    'joshua', 'kenneth', 'kevin', 'brian', 'george', 'timothy', 'ronald', 'jason', 
    'edward', 'jeffrey', 'ryan', 'jacob', 'gary', 'nicholas', 'eric', 'jonathan', 
    'stephen', 'larry', 'justin', 'scott', 'brandon', 'benjamin', 'samuel', 'gregory', 
    'alexander', 'patrick', 'jack', 'dennis', 'jerry', 'tyler', 'aaron', 'henry', 
    'douglas', 'peter', 'noah', 'arthur', 'zachary', 'nathan', 'carl', 'harold', 
    'kyle', 'wayne', 'ralph', 'louis', 'philip', 'bobby', 'johnny','jarvis','rahul','raj'
  ];

  // Female names
  const femaleNames = [
    'sarah', 'emma', 'lisa', 'jessica', 'jennifer', 'ashley', 'amanda', 'melissa', 
    'nicole', 'stephanie', 'elizabeth', 'rebecca', 'rachel', 'kimberly', 'amy', 
    'angela', 'christina', 'michelle', 'janet', 'catherine', 'frances', 'samantha', 
    'deborah', 'carolyn', 'virginia', 'maria', 'heather', 'diane', 'julie', 'joyce', 
    'victoria', 'kelly', 'joan', 'evelyn', 'lauren', 'judith', 'megan', 'cheryl', 
    'andrea', 'hannah', 'jacqueline', 'martha', 'gloria', 'teresa', 'sara', 'janice', 
    'marie', 'julia', 'grace', 'judy', 'theresa', 'madison', 'beverly', 'denise', 
    'charlotte', 'diana', 'kayla', 'alexis', 'lori', 'rose','dora','veena','rekha','jaya','sushma'
  ];

  if (maleNames.includes(name)) {
    return 'male';
  } else if (femaleNames.includes(name)) {
    return 'female';
  } else {
    return 'neutral';
  }
};

export const getcurrentuser = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).select("-password");
    console.log("🔥 req.userId:", req.userId);
    
    if (!user) {
      return res.status(404).json({ message: "No user found" });
    }
    
    return res.status(200).json(user);
  } catch (error) {
    console.error("❌ Error in getcurrentuser:", error);
    return res.status(500).json({ message: "Get current user error", error });
  }
};

export const updateAssistant = async (req, res) => {
  try {
    console.log("🚀 updateAssistant called");
    console.log("💡 req.body:", req.body);
    console.log("💡 req.file:", req.file);
    console.log("💡 req.userId:", req.userId);

    // Check if user is authenticated
    if (!req.userId) {
      console.error("❌ No userId found in request");
      return res.status(401).json({ message: "User not authenticated" });
    }

    const { assistantName, imageUrl } = req.body;
    
    // Validate required fields
    if (!assistantName || assistantName.trim() === '') {
      console.error("❌ Assistant name is required");
      return res.status(400).json({ message: "Assistant name is required" });
    }

    let assistantImage;

    if (req.file) {
      // If image is sent via multer (uploaded file)
      console.log("📁 Processing uploaded file:", req.file.filename);
      try {
        assistantImage = await uploadoncloudinary(req.file.path);
        console.log("☁️ Cloudinary upload result:", assistantImage);
        
        if (!assistantImage) {
          console.error("❌ Cloudinary upload failed");
          return res.status(500).json({ message: "Image upload failed" });
        }
      } catch (uploadError) {
        console.error("❌ Cloudinary upload error:", uploadError);
        return res.status(500).json({ message: "Image upload failed" });
      }
    } else if (imageUrl) {
      // If image URL is provided (pre-selected image)
      console.log("🖼️ Using provided image URL:", imageUrl);
      assistantImage = imageUrl;
    } else {
      console.error("❌ No image provided");
      return res.status(400).json({ message: "Please provide an image" });
    }

    console.log("🔄 Updating user with:", {
      assistantName: assistantName.trim(),
      assistantImage
    });

    // Update user in database
    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        assistantName: assistantName.trim(),
        assistantImage
      },
      { new: true } // Return updated document
    ).select("-password");

    if (!user) {
      console.error("❌ User not found during update");
      return res.status(404).json({ message: "User not found" });
    }

    console.log("✅ Updated User:", user);
    
    // IMPORTANT: Only one return statement
    return res.status(200).json(user);
    
  } catch (error) {
    console.error("❌ updateAssistant error:", error);
    return res.status(500).json({ 
      message: "Error updating assistant", 
      error: error.message 
    });
  }
}

export const askAssistant = async (req, res) => {
  try {
    console.log("🤖 askAssistant called");
    
    // Validate request
    if (!req.userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const { prompt } = req.body;
    
    if (!prompt || prompt.trim() === '') {
      return res.status(400).json({ message: "Prompt is required" });
    }

    // Get user details
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userName = user.name;
    const assistantName = user.assistantName;

    // Detect voice gender based on assistant name
    const voiceGender = detectVoiceGender(assistantName);
    console.log(`🎭 Voice gender detected: ${voiceGender} for assistant: ${assistantName}`);

    console.log(`🎯 Processing prompt: "${prompt}" for user: ${userName}, assistant: ${assistantName}`);

    // Get Gemini response
    const result = await geminiResponse(prompt, assistantName, userName);
    
    // Extract JSON from Gemini response
    const jsonMatch = result.candidates?.[0]?.content?.parts?.[0]?.text?.match(/{[\s\S]*}/);
    
    if (!jsonMatch) {
      console.error("❌ No valid JSON found in Gemini response");
      return res.status(400).json({
        response: "Sorry, I couldn't understand that. Could you please rephrase?",
        voiceGender: voiceGender
      });
    }

    let gemResult;
    try {
      gemResult = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error("❌ JSON parse error:", parseError);
      return res.status(400).json({
        response: "Sorry, I had trouble processing that request.",
        voiceGender: voiceGender
      });
    }

    const type = gemResult.type;
    console.log(`📋 Request type: ${type}`);
    console.log(`📊 Gemini data:`, gemResult.data);

    // Handle different request types
    let responseData;

    switch (type) {
      // Time/Date functions
      case 'get_time':
        responseData = {
          type: 'get_time',
          response: `The current time is ${moment().format('hh:mm A')}`,
          data: moment().format('hh:mm A'),
          userInput: gemResult.userInput,
          voiceGender: voiceGender
        };
        break;
        
      case 'get_date':
        responseData = {
          type: 'get_date',
          response: `Today's date is ${moment().format('MMMM Do, YYYY')}`,
          data: moment().format('YYYY-MM-DD'),
          userInput: gemResult.userInput,
          voiceGender: voiceGender
        };
        break;
        
      case 'get_day':
        responseData = {
          type: 'get_day',
          response: `Today is ${moment().format('dddd')}`,
          data: moment().format('dddd'),
          userInput: gemResult.userInput,
          voiceGender: voiceGender
        };
        break;
        
      case 'get_month':
        responseData = {
          type: 'get_month',
          response: `We are currently in ${moment().format('MMMM')}`,
          data: moment().format('MMMM'),
          userInput: gemResult.userInput,
          voiceGender: voiceGender
        };
        break;

      // ENHANCED MEDIA PLAYBACK CASES
      case 'spotify_play':
      case 'music_play':
      case 'song_play':
        responseData = {
          type: type,
          response: gemResult.response,
          userInput: gemResult.userInput,
          voiceGender: voiceGender,
          data: {
            query: gemResult.data?.query || extractCleanQuery(gemResult.userInput, ['play', 'listen', 'music', 'song', 'spotify']),
            platform: 'spotify',
            url: gemResult.data?.url
          }
        };
        break;

      case 'youtube_play':
      case 'video_play':
        responseData = {
          type: type,
          response: gemResult.response,
          userInput: gemResult.userInput,
          voiceGender: voiceGender,
          data: {
            query: gemResult.data?.query || extractCleanQuery(gemResult.userInput, ['play', 'watch', 'video', 'youtube']),
            platform: 'youtube',
            url: gemResult.data?.url
          }
        };
        break;

      case 'youtube_search':
        responseData = {
          type: 'youtube_search',
          response: gemResult.response,
          userInput: gemResult.userInput,
          voiceGender: voiceGender,
          data: {
            query: gemResult.data?.query || extractCleanQuery(gemResult.userInput, ['search', 'find', 'youtube']),
            platform: 'youtube',
            searchType: 'video'
          }
        };
        break;

      // STREAMING SERVICES
      case 'netflix_open':
        responseData = {
          type: 'netflix_open',
          response: gemResult.response || 'Opening Netflix for your entertainment!',
          userInput: gemResult.userInput,
          voiceGender: voiceGender,
          data: {
            url: 'https://netflix.com',
            platform: 'netflix',
            action: 'open'
          }
        };
        break;

      // NAVIGATION & MAPS
      case 'maps_open':
      case 'navigation':
        const location = gemResult.data?.location || extractCleanQuery(gemResult.userInput, ['maps', 'directions', 'navigate', 'show', 'find']);
        responseData = {
          type: type,
          response: gemResult.response,
          userInput: gemResult.userInput,
          voiceGender: voiceGender,
          data: {
            location: location,
            url: location ? `https://maps.google.com/search/${encodeURIComponent(location)}` : 'https://maps.google.com',
            action: 'navigate'
          }
        };
        break;

      // WEATHER
      case 'weather_show':
        responseData = {
          type: 'weather_show',
          response: gemResult.response || 'Showing current weather information!',
          userInput: gemResult.userInput,
          voiceGender: voiceGender,
          data: {
            url: 'https://www.weather.com',
            action: 'show_weather'
          }
        };
        break;

      // CALCULATOR
      case 'calculator_open':
        responseData = {
          type: 'calculator_open',
          response: gemResult.response || 'Opening calculator for you!',
          userInput: gemResult.userInput,
          voiceGender: voiceGender,
          data: {
            url: 'https://www.google.com/search?q=calculator',
            action: 'calculate'
          }
        };
        break;

      // SEARCH FUNCTIONS
      case 'web_search':
      case 'google_search':
        responseData = {
          type: type,
          response: gemResult.response,
          userInput: gemResult.userInput,
          voiceGender: voiceGender,
          data: {
            query: gemResult.data?.query || extractCleanQuery(gemResult.userInput, ['search', 'find', 'google', 'look']),
            searchEngine: 'google',
            url: gemResult.data?.url
          }
        };
        break;

      // KNOWLEDGE ANSWERS (new case)
      case 'knowledge_answer':
        responseData = {
          type: 'knowledge_answer',
          response: gemResult.response,
          userInput: gemResult.userInput,
          voiceGender: voiceGender,
          data: {
            answer: gemResult.data?.answer || gemResult.response,
            category: 'knowledge'
          }
        };
        break;

      // APP OPENING (keep existing functionality)
      case 'open_app':
      case 'open_website':
      case 'open_youtube':
      case 'vscode_open':
      case 'linkedin_open':
      case 'facebook_open':
      case 'instagram_open':
      case 'twitter_open':
      case 'photo_app_open':
      case 'microsoft_store_open':
      case 'notepad_open':
      case 'file_explorer_open':
      case 'settings_open':
      case 'browser_open':
      case 'news_show':
      case 'email_open':
        responseData = {
          type: type,
          response: gemResult.response,
          userInput: gemResult.userInput,
          voiceGender: voiceGender,
          data: gemResult.data || {
            appName: gemResult.appName,
            url: gemResult.url,
            action: 'open'
          }
        };
        break;

      // DEFAULT CASE - Handle any new types gracefully
      default:
        responseData = {
          type: gemResult.type || 'general',
          response: gemResult.response,
          userInput: gemResult.userInput,
          voiceGender: voiceGender,
          data: gemResult.data || {}
        };
        
        // Preserve any additional fields from Gemini response
        Object.keys(gemResult).forEach(key => {
          if (!['type', 'response', 'userInput', 'data', 'voiceGender'].includes(key)) {
            responseData[key] = gemResult[key];
          }
        });
        break;
    }

    console.log("✅ Final response prepared:", responseData);
    return res.status(200).json(responseData);

  } catch (error) {
    console.error("❌ askAssistant error:", error);
    return res.status(500).json({
      message: "Error processing assistant request",
      error: error.message,
      response: "Sorry, I'm having technical difficulties right now.",
      voiceGender: 'neutral' // Default fallback
    });
  }
}

// Helper function to extract clean queries (add this to your controller)
const extractCleanQuery = (text, removeWords = []) => {
  if (!text) return '';
  
  let query = text.toLowerCase();
  
  // Common words to remove
  const commonWords = [
    'please', 'can', 'you', 'would', 'could', 'the', 'a', 'an', 'some',
    'hey', 'hi', 'hello', 'for', 'me', 'to', 'on', 'at', 'in'
  ];
  
  // Combine with provided remove words
  const allWordsToRemove = [...commonWords, ...removeWords];
  
  // Remove each word
  allWordsToRemove.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    query = query.replace(regex, ' ');
  });
  
  // Clean up extra spaces and trim
  return query.replace(/\s+/g, ' ').trim();
};
import React from 'react'
import { useContext, useEffect, useRef, useState } from 'react'
import { userdataContext } from '../contextAPI/UserContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const Home = () => {
  const { userdata, setuserdata, serverurl, geminiResponse } = useContext(userdataContext)
  const navigate = useNavigate()
  const recognitionRef = useRef(null)
  const speechEnabledRef = useRef(false)
  const [isListening, setIsListening] = useState(false)
  const [lastResponse, setLastResponse] = useState("")
  const [speechEnabled, setSpeechEnabled] = useState(false)
  const [speechError, setSpeechError] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentTranscript, setCurrentTranscript] = useState("")
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [availableVoices, setAvailableVoices] = useState([])
  const [selectedVoice, setSelectedVoice] = useState(null)
  const [isSpeaking, setIsSpeaking] = useState(false)

  // Navigation handlers
  const handleCustomize = () => navigate('/customize')

  const handleLogout = async () => {
    try {
      await axios.get(`${serverurl}/api/auth/logout`, { withCredentials: true })
      setuserdata(null)
      navigate('/signin')
    } catch (error) {
      console.error('Logout error:', error)
      navigate('/signin')
    }
  }

  // Load and filter voices based on gender
  const loadVoices = () => {
    const voices = window.speechSynthesis.getVoices()
    console.log('🔊 All available voices:', voices.map(v => ({ name: v.name, lang: v.lang, gender: v.name })))
    
    setAvailableVoices(voices)
    
    // Auto-select voice based on assistant name if not already selected
    if (!selectedVoice && userdata?.assistantName && voices.length > 0) {
      const detectedGender = detectVoiceGender(userdata.assistantName)
      const bestVoice = findBestVoice(voices, detectedGender, userdata?.preferredLanguage || 'en')
      
      if (bestVoice) {
        setSelectedVoice(bestVoice)
        console.log('🎭 Auto-selected voice:', bestVoice.name, 'for gender:', detectedGender)
      }
    }
  }

  // Voice gender detection function (matching backend logic)
  const detectVoiceGender = (assistantName) => {
    if (!assistantName || typeof assistantName !== 'string') {
      return 'neutral';
    }

    const name = assistantName.toLowerCase().trim();

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

  // Find the best voice based on gender and language
  const findBestVoice = (voices, targetGender, preferredLanguage = 'en') => {
    if (!voices.length) return null;

    // Language preference patterns
    const isHindi = preferredLanguage === 'hi';
    const langPattern = isHindi ? /^hi/i : /^en/i;

    // Filter voices by language first
    const languageVoices = voices.filter(voice => langPattern.test(voice.lang));
    const voicesToSearch = languageVoices.length > 0 ? languageVoices : voices;

    console.log(`🎯 Finding ${targetGender} voice for ${preferredLanguage} language from ${voicesToSearch.length} voices`);

    // Gender-based voice patterns
    const genderPatterns = {
      male: /male|man|david|alex|daniel|james|john|michael|thomas|mark|paul|arthur|henry|ralph|victor|oliver|google\s*uk\s*english\s*male|microsoft\s*mark|microsoft\s*david/i,
      female: /female|woman|emma|sarah|lisa|jessica|jennifer|ashley|amanda|melissa|nicole|stephanie|elizabeth|rebecca|rachel|kimberly|amy|angela|christina|michelle|janet|catherine|frances|samantha|google\s*uk\s*english\s*female|microsoft\s*zira|microsoft\s*helena|microsoft\s*hazel/i
    };

    // First priority: Exact gender match
    if (targetGender !== 'neutral' && genderPatterns[targetGender]) {
      const genderMatch = voicesToSearch.find(voice => 
        genderPatterns[targetGender].test(voice.name)
      );
      if (genderMatch) {
        console.log('✅ Found gender-specific voice:', genderMatch.name);
        return genderMatch;
      }
    }

    // Second priority: High-quality voices by name patterns
    const qualityPatterns = [
      /google/i,
      /microsoft/i,
      /alex/i,
      /enhanced/i,
      /premium/i,
      /neural/i
    ];

    for (const pattern of qualityPatterns) {
      const qualityVoice = voicesToSearch.find(voice => pattern.test(voice.name));
      if (qualityVoice) {
        console.log('✅ Found quality voice:', qualityVoice.name);
        return qualityVoice;
      }
    }

    // Third priority: Default system voice
    const defaultVoice = voicesToSearch.find(voice => voice.default);
    if (defaultVoice) {
      console.log('✅ Using default voice:', defaultVoice.name);
      return defaultVoice;
    }

    // Fallback: First available voice
    console.log('✅ Using fallback voice:', voicesToSearch[0].name);
    return voicesToSearch[0];
  };

  // Simplified and more reliable speech synthesis
  const speak = (text, voiceGender = null) => {
    console.log('🔊 Attempting to speak:', text?.substring(0, 50) + '...')
    
    if (!text || !speechEnabledRef.current) {
      console.log('❌ Speech conditions not met:', { hasText: !!text, speechEnabled: speechEnabledRef.current })
      return Promise.resolve(false);
    }

    if (!window.speechSynthesis) {
      console.error('❌ Speech synthesis not supported')
      return Promise.resolve(false);
    }

    return new Promise((resolve) => {
      try {
        // Cancel any ongoing speech
        window.speechSynthesis.cancel()
        setIsSpeaking(true)
        
        const utterance = new SpeechSynthesisUtterance(text)
        
        // Basic speech settings
        utterance.rate = 0.9
        utterance.volume = 0.8
        utterance.pitch = 1.0

        // Voice selection logic
        const voices = window.speechSynthesis.getVoices()
        let targetVoice = null

        if (selectedVoice) {
          targetVoice = selectedVoice
          console.log('🎤 Using selected voice:', targetVoice.name)
        } else if (voiceGender && userdata?.assistantName) {
          const detectedGender = voiceGender || detectVoiceGender(userdata.assistantName)
          targetVoice = findBestVoice(voices, detectedGender, userdata?.preferredLanguage || 'en')
          console.log('🎤 Using detected gender voice:', targetVoice?.name)
        } else if (voices.length > 0) {
          // Just use the first available voice as fallback
          targetVoice = voices[0]
          console.log('🎤 Using fallback voice:', targetVoice.name)
        }

        if (targetVoice) {
          utterance.voice = targetVoice
        }

        utterance.onstart = () => {
          console.log('✅ Speech started with voice:', utterance.voice?.name || 'default')
          setIsSpeaking(true)
        }

        utterance.onend = () => {
          console.log('✅ Speech finished')
          setIsSpeaking(false)
          resolve(true)
        }
        
        utterance.onerror = (event) => {
          console.error('❌ Speech error:', event.error)
          setIsSpeaking(false)
          resolve(false)
        }
        
        // Speak with a slight delay to ensure everything is ready
        setTimeout(() => {
          window.speechSynthesis.speak(utterance)
        }, 100)
        
      } catch (error) {
        console.error('❌ Speech synthesis error:', error)
        setIsSpeaking(false)
        resolve(false)
      }
    })
  }

  // Enhanced speech enabler with better error handling
  const enableSpeech = async () => {
    console.log('🔊 enableSpeech called')
    
    if (!window.speechSynthesis) {
      setSpeechError('Speech synthesis not supported in this browser')
      return
    }

    try {
      setSpeechEnabled(true)
      speechEnabledRef.current = true
      setSpeechError(null)
      
      // Wait for voices to load
      let voices = window.speechSynthesis.getVoices()
      
      if (voices.length === 0) {
        // Wait for voices to load
        await new Promise((resolve) => {
          const checkVoices = () => {
            voices = window.speechSynthesis.getVoices()
            if (voices.length > 0) {
              resolve()
            } else {
              setTimeout(checkVoices, 100)
            }
          }
          
          window.speechSynthesis.onvoiceschanged = () => {
            voices = window.speechSynthesis.getVoices()
            if (voices.length > 0) {
              window.speechSynthesis.onvoiceschanged = null
              resolve()
            }
          }
          
          checkVoices()
        })
      }
      
      setAvailableVoices(voices)
      console.log('✅ Speech enabled with', voices.length, 'voices available')
      
      // Auto-select appropriate voice
      if (userdata?.assistantName) {
        const detectedGender = detectVoiceGender(userdata.assistantName)
        const bestVoice = findBestVoice(voices, detectedGender, userdata?.preferredLanguage || 'en')
        
        if (bestVoice) {
          setSelectedVoice(bestVoice)
          console.log('🎭 Auto-selected voice:', bestVoice.name)
        }
      }
      
      // Test speech
      const testMessage = `Voice responses enabled. I'm ${userdata?.assistantName || 'your assistant'}, ready to help!`
      
      setTimeout(async () => {
        const result = await speak(testMessage)
        if (!result) {
          console.warn('⚠️ Test speech failed, but continuing...')
        }
      }, 500)
      
    } catch (error) {
      console.error('❌ Error enabling speech:', error)
      setSpeechError('Error enabling speech: ' + error.message)
      setSpeechEnabled(false)
      speechEnabledRef.current = false
    }
  }

  // Enhanced URL mapping with media playback functions
  const getActionUrl = (data) => {
    const input = (data.userInput || '').toLowerCase()
    const response = (data.response || '').toLowerCase()
    
    console.log('🔗 Processing action URL for:', { input, response, type: data.type })
    
    if (data.data?.url) {
      console.log('🔗 Using direct URL:', data.data.url)
      return data.data.url
    }

    if (input.includes('play') || input.includes('listen') || input.includes('watch')) {
      console.log('🎵 Media play command detected')
      
      if (input.includes('youtube') || input.includes('video')) {
        const query = extractMediaQuery(input, ['play', 'youtube', 'video', 'watch'])
        console.log('📺 YouTube play query:', query)
        return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`
      }
      
      if (input.includes('spotify') || input.includes('music') || input.includes('song')) {
        const query = extractMediaQuery(input, ['play', 'spotify', 'music', 'song', 'listen'])
        console.log('🎵 Spotify play query:', query)
        return `https://open.spotify.com/search/${encodeURIComponent(query)}`
      }
      
      const query = extractMediaQuery(input, ['play', 'listen', 'watch'])
      if (query) {
        console.log('🎧 Generic media query:', query)
        return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`
      }
    }

    const sites = {
      youtube: 'https://youtube.com',
      google: 'https://google.com',
      facebook: 'https://facebook.com',
      twitter: 'https://twitter.com',
      instagram: 'https://instagram.com',
      linkedin: 'https://linkedin.com',
      spotify: 'https://open.spotify.com',
      gmail: 'https://gmail.com',
      maps: 'https://maps.google.com',
      weather: 'https://www.weather.com',
      calculator: 'https://www.google.com/search?q=calculator',
      netflix: 'https://netflix.com',
      amazon: 'https://amazon.com',
      twitch: 'https://twitch.tv'
    }

    for (const [site, url] of Object.entries(sites)) {
      if (input.includes(site) || response.includes(site)) {
        console.log('🌐 Site match found:', site, '->', url)
        return url
      }
    }

    if (input.includes('search') || input.includes('find')) {
      if (input.includes('youtube')) {
        const query = input.replace(/.*(?:youtube|search).*?(?:for|search)\s*/i, '') || data.userInput
        console.log('🔍 YouTube search query:', query)
        return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`
      } else {
        const query = input.replace(/.*search.*?for\s*/i, '') || data.userInput
        console.log('🔍 Google search query:', query)
        return `https://www.google.com/search?q=${encodeURIComponent(query)}`
      }
    }

    console.log('🔗 No URL match found for input')
    return null
  }

  const extractMediaQuery = (input, removeWords) => {
    console.log('🎯 Extracting media query from:', input)
    
    let query = input
    
    const wordsToRemove = [
      ...removeWords,
      'please', 'can', 'you', 'would', 'could', 'the', 'a', 'an', 'some',
      userdata?.assistantName?.toLowerCase()
    ].filter(Boolean)
    
    wordsToRemove.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi')
      query = query.replace(regex, ' ')
    })
    
    query = query.replace(/\s+/g, ' ').trim()
    
    console.log('🎯 Extracted query:', query)
    return query
  }

  // Enhanced assistant response handler with voice gender support
  const handleAssistantResponse = async (data) => {
    console.log('🤖 Assistant response received:', data)
    
    if (!data) {
      console.error('❌ No data received from assistant')
      setIsProcessing(false)
      return
    }

    if (data.response) {
      setLastResponse(data.response)
      console.log('📝 Response set:', data.response.substring(0, 50) + '...')
    }
    
    // Speak the response with better error handling
    if (speechEnabledRef.current && data.response) {
      console.log('🔊 Attempting to speak response with gender:', data.voiceGender)
      try {
        const success = await speak(data.response, data.voiceGender)
        if (!success) {
          console.warn('⚠️ Speech failed, but continuing...')
        }
      } catch (error) {
        console.error('❌ Error speaking response:', error)
      }
    }

    // Handle actions
    const handleAction = () => {
      try {
        let url = null
        const input = (data.userInput || '').toLowerCase()

        console.log('🎬 Processing action type:', data.type)

        switch (data.type) {
          case 'web_search':
          case 'google_search':
          case 'search':
            const searchQuery = data.data?.query || data.userInput
            url = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`
            break

          case 'youtube_search':
          case 'youtube_play':
          case 'video_play':
            const youtubeQuery = data.data?.query || extractMediaQuery(data.userInput || '', ['play', 'youtube', 'video', 'watch'])
            url = `https://www.youtube.com/results?search_query=${encodeURIComponent(youtubeQuery)}`
            break

          case 'spotify_play':
          case 'music_play':
          case 'song_play':
            const spotifyQuery = data.data?.query || extractMediaQuery(data.userInput || '', ['play', 'spotify', 'music', 'song', 'listen'])
            url = `https://open.spotify.com/search/${encodeURIComponent(spotifyQuery)}`
            break

          case 'weather_show':
            url = 'https://www.weather.com'
            break

          case 'calculator_open':
            url = 'https://www.google.com/search?q=calculator'
            break

          case 'netflix_open':
            url = 'https://netflix.com'
            break

          case 'maps_open':
          case 'navigation':
            const location = data.data?.location || 'current location'
            url = `https://maps.google.com/search/${encodeURIComponent(location)}`
            break

          default:
            url = getActionUrl(data)
            break
        }

        if (!url && input) {
          if ((input.includes('play') || input.includes('watch')) && 
              (input.includes('video') || input.includes('youtube'))) {
            const query = extractMediaQuery(input, ['play', 'watch', 'youtube', 'video'])
            if (query) {
              url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`
            }
          }
          else if ((input.includes('play') || input.includes('listen')) && 
                   (input.includes('music') || input.includes('song') || input.includes('spotify'))) {
            const query = extractMediaQuery(input, ['play', 'listen', 'music', 'song', 'spotify'])
            if (query) {
              url = `https://open.spotify.com/search/${encodeURIComponent(query)}`
            }
          }
          else if (input.includes('play') && !input.includes('game')) {
            const query = extractMediaQuery(input, ['play'])
            if (query) {
              url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`
            }
          }
        }

        if (url) {
          console.log('🌐 Opening URL:', url)
          window.open(url, '_blank')
          
          if (speechEnabledRef.current) {
            const feedbackMessage = getFeedbackMessage(url, data.userInput)
            setTimeout(async () => {
              await speak(feedbackMessage, data.voiceGender)
            }, 500)
          }
        } else {
          console.log('❌ No URL to open for this action')
        }
      } catch (error) {
        console.error('❌ Error handling action:', error)
      }
    }

    setTimeout(handleAction, 2000)
    setIsProcessing(false)
  }

  const getFeedbackMessage = (url, userInput) => {
    const input = (userInput || '').toLowerCase()
    
    if (url.includes('youtube.com/results')) {
      if (input.includes('play') || input.includes('watch')) {
        return "Opening YouTube to play your requested content."
      }
      return "Searching YouTube for you."
    }
    
    if (url.includes('open.spotify.com')) {
      return "Opening Spotify to play your music."
    }
    
    if (url.includes('weather.com')) {
      return "Opening weather information for you."
    }
    
    if (url.includes('maps.google.com')) {
      return "Opening maps for navigation."
    }
    
    if (url.includes('netflix.com')) {
      return "Opening Netflix for you."
    }
    
    if (url.includes('calculator')) {
      return "Opening calculator for you."
    }
    
    return "Opening the requested page."
  }

  // Speech recognition setup
  const setupSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    
    if (!SpeechRecognition) {
      console.error('❌ Speech recognition not supported in this browser')
      return null
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.lang = userdata?.preferredLanguage === 'hi' ? 'hi-IN' : 'en-US'
    recognition.interimResults = true
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      console.log('🎤 Speech recognition STARTED')
      setIsListening(true)
      setCurrentTranscript("")
    }
    
    recognition.onend = () => {
      console.log('🎤 Speech recognition ENDED')
      setIsListening(false)
      setCurrentTranscript("")
    }

    recognition.onresult = async (event) => {
      console.log('🎤 Speech recognition result event triggered')
      
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i]
        const transcript = result[0].transcript
        const confidence = result[0].confidence
        
        console.log(`🎤 Result ${i}: "${transcript}" (confidence: ${confidence?.toFixed(2) || 'N/A'}) [${result.isFinal ? 'FINAL' : 'interim'}]`)
        
        if (!result.isFinal) {
          setCurrentTranscript(transcript)
        }
      }
      
      const lastResult = event.results[event.results.length - 1]
      
      if (lastResult.isFinal && !isProcessing) {
        const transcript = lastResult[0].transcript.trim()
        
        console.log('🎯 FINAL TRANSCRIPT:', transcript)
        
        const assistantName = userdata?.assistantName?.toLowerCase()
        
        if (assistantName && transcript.toLowerCase().includes(assistantName)) {
          console.log('✅ Assistant name detected! Processing request...')
          
          setIsProcessing(true)
          setCurrentTranscript("")
          
          try {
            console.log('🚀 Sending to geminiResponse:', transcript)
            const response = await geminiResponse(transcript)
            console.log('📨 Received response from geminiResponse:', response)
            await handleAssistantResponse(response)
          } catch (error) {
            console.error('❌ Error processing response:', error)
            if (speechEnabledRef.current) {
              const detectedGender = userdata?.assistantName ? detectVoiceGender(userdata.assistantName) : 'neutral';
              await speak('Sorry, I encountered an error. Please try again.', detectedGender)
            }
          } finally {
            setIsProcessing(false)
          }
        }
      }
    }

    recognition.onerror = (event) => {
      console.error('❌ Speech recognition ERROR:', event.error)
      setIsListening(false)
      setCurrentTranscript("")
    }

    return recognition
  }

  const restartRecognition = () => {
    if (!recognitionRef.current || isListening || isProcessing) return

    try {
      recognitionRef.current.start()
    } catch (error) {
      if (!error.message.includes('already started')) {
        console.error('❌ Recognition restart error:', error)
      }
    }
  }

  // Test speech function for debugging
  const testSpeak = async () => {
    console.log('🧪 Testing speech...')
    const result = await speak('This is a test message. Can you hear me?')
    console.log('🧪 Test result:', result)
  }

  // Load voices on component mount
  useEffect(() => {
    loadVoices()
    
    const handleVoicesChanged = () => {
      console.log('🔄 Voices changed event fired')
      loadVoices()
    }
    
    window.speechSynthesis.onvoiceschanged = handleVoicesChanged
    
    // Also try loading voices after a delay
    setTimeout(loadVoices, 1000)
    
    return () => {
      window.speechSynthesis.onvoiceschanged = null
    }
  }, [userdata?.assistantName])

  // Speech recognition effect
  useEffect(() => {
    console.log('🔧 Setting up speech recognition effect...')
    
    const recognition = setupSpeechRecognition()
    if (!recognition) return

    recognitionRef.current = recognition
    
    try {
      recognition.start()
    } catch (error) {
      console.error('❌ Initial recognition start error:', error)
    }

    const restartInterval = setInterval(() => {
      if (!isListening && !isProcessing && recognitionRef.current) {
        restartRecognition()
      }
    }, 3000)

    return () => {
      clearInterval(restartInterval)
      if (recognitionRef.current) {
        recognitionRef.current.stop()
        recognitionRef.current = null
      }
      setIsListening(false)
      setIsProcessing(false)
      setCurrentTranscript("")
    }
  }, [userdata?.assistantName, userdata?.preferredLanguage])

  

  return (
    <div className='min-h-screen w-full bg-gradient-to-t from-black to-blue-900 flex flex-col items-center justify-center relative overflow-hidden px-4 sm:px-6 lg:px-8'>
      {/* Top Navigation - Responsive */}
      <div className="absolute top-4 sm:top-6 left-4 sm:left-6 right-4 sm:right-6 flex justify-between items-center z-10">
        {/* Desktop Navigation */}
        <div className="hidden sm:flex justify-between w-full">
          <button
            onClick={handleCustomize}
            className="px-4 sm:px-6 py-2 sm:py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold
            hover:from-purple-700 hover:to-blue-700 transition-all duration-300 hover:scale-105 active:scale-95
            shadow-lg hover:shadow-xl border border-white/20 text-sm sm:text-base"
          >
            Customize Assistant
          </button>
          
          <button
            onClick={handleLogout}
            className="px-4 sm:px-6 py-2 sm:py-3 rounded-xl bg-gradient-to-r from-red-600 to-pink-600 text-white font-semibold
            hover:from-red-700 hover:to-pink-700 transition-all duration-300 hover:scale-105 active:scale-95
            shadow-lg hover:shadow-xl border border-white/20 text-sm sm:text-base"
          >
            Logout
          </button>
        </div>

        {/* Mobile Hamburger Menu */}
        <div className="sm:hidden w-full">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all duration-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
          <div className="sm:hidden absolute top-12 left-0 right-0 bg-black/90 backdrop-blur-sm border border-white/20 rounded-lg p-4 space-y-3">
            <button
              onClick={() => {
                handleCustomize()
                setIsMenuOpen(false)
              }}
              className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold
              hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg border border-white/20 text-sm"
            >
              Customize Assistant
            </button>
            
            <button
              onClick={() => {
                handleLogout()
                setIsMenuOpen(false)
              }}
              className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-red-600 to-pink-600 text-white font-semibold
              hover:from-red-700 hover:to-pink-700 transition-all duration-300 shadow-lg border border-white/20 text-sm"
            >
              Logout
            </button>
          </div>
        )}
      </div>

      {/* Assistant Name - Responsive */}
      {userdata?.assistantName && (
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mb-6 sm:mb-8 drop-shadow-lg text-center bg-gradient-to-r from-cyan-400 via-purple-500 to-blue-400 bg-clip-text text-transparent px-4 mt-16 sm:mt-0">
          Meet {userdata.assistantName}
        </h1>
      )}
      
      {/* Assistant Image - Responsive */}
      <div className='w-[250px] h-[320px] sm:w-[280px] sm:h-[360px] md:w-[300px] md:h-[400px] lg:w-[320px] lg:h-[420px] flex justify-center items-center overflow-hidden rounded-2xl shadow-2xl border-2 border-cyan-400/30 hover:border-cyan-400/50 transition-all duration-300'>
        {userdata?.assistantImage ? (
          <img 
            src={userdata.assistantImage} 
            alt={`${userdata?.assistantName || 'Assistant'} Avatar`} 
            className='h-full w-full object-cover'
          />
        ) : (
          <div className="flex items-center justify-center text-white/50 text-lg">
            No image selected
          </div>
        )}
      </div>

      {/* Welcome Message - Responsive */}
      <div className="mt-6 sm:mt-8 text-center max-w-sm sm:max-w-md px-4">
        <p className="text-white/80 text-base sm:text-lg leading-relaxed">
          Your virtual assistant is ready to help you!
        </p>
      </div>

      {/* Speech Enable Button - Responsive */}
      {!speechEnabled && (
        <div className="mt-4 sm:mt-6 text-center px-4">
          <button
            onClick={enableSpeech}
            className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-bold text-base sm:text-lg transition-all duration-300 shadow-lg hover:shadow-xl border border-white/20 hover:scale-105 active:scale-95"
          >
            🎤 Enable Voice
          </button>
          {speechError && (
            <p className="text-red-400 text-sm mt-2">{speechError}</p>
          )}
        </div>
      )}

      {/* Status Display - Responsive */}
      {speechEnabled && (
        <div className="mt-4 sm:mt-6 text-center px-4">
          {/* Status Indicators */}
          <div className="flex flex-col items-center space-y-3">
            {/* Voice Status */}
            <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
              <div className={`w-3 h-3 rounded-full ${speechEnabled ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
              <span className="text-white text-sm font-medium">
                Voice {speechEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>

            {/* Listening Status */}
            <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
              <div className={`w-3 h-3 rounded-full ${isListening ? 'bg-blue-500 animate-pulse' : 'bg-gray-500'}`}></div>
              <span className="text-white text-sm font-medium">
                {isListening ? '🎤 Listening...' : 'Waiting for wake word...'}
              </span>
            </div>

            {/* Processing Status */}
            {isProcessing && (
              <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
                <div className="w-3 h-3 rounded-full bg-yellow-500 animate-spin"></div>
                <span className="text-white text-sm font-medium">Processing...</span>
              </div>
            )}

            {/* Current Transcript */}
            {currentTranscript && (
              <div className="bg-blue-500/20 backdrop-blur-sm rounded-lg px-4 py-2 border border-blue-500/30 max-w-xs sm:max-w-sm">
                <p className="text-blue-200 text-sm font-medium">"{currentTranscript}"</p>
              </div>
            )}

            {/* Last Response */}
            {lastResponse && (
              <div className="bg-green-500/20 backdrop-blur-sm rounded-lg px-4 py-3 border border-green-500/30 max-w-xs sm:max-w-md">
                <p className="text-green-200 text-sm leading-relaxed">{lastResponse}</p>
              </div>
            )}
          </div>

          {/* Wake Word Hint */}
          <div className="mt-4 p-3 bg-yellow-500/20 backdrop-blur-sm rounded-lg border border-yellow-500/30">
            <p className="text-yellow-200 text-sm">
              💡 Say "{userdata?.assistantName || 'Assistant'}" followed by your command
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default Home

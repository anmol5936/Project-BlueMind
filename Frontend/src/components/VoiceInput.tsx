import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  ChevronDown,
  MapPin,
  Calendar,
  Cloud,
  Droplets,
  Users,
  Sun,
  Moon,
  CloudRain,
  Home,
  Leaf,
  MessageCircle,
  BookOpen,
  Settings,
  Play,
  Square,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';


// Cloudinary configuration
const CLOUDINARY_UPLOAD_PRESET = 'Project-Kenko';
const CLOUDINARY_CLOUD_NAME = 'dzxgf75bh';

// Weather data
const weatherData = {
  current: { temp: 34, moisture: 30, saved: 50 },
  forecast: [
    { day: 'Today', temp: 34, rain: 0, icon: <Sun /> },
    { day: 'Tomorrow', temp: 33, rain: 80, icon: <CloudRain /> },
    { day: 'Wednesday', temp: 30, rain: 60, icon: <Cloud /> },
    { day: 'Thursday', temp: 31, rain: 20, icon: <Sun /> },
    { day: 'Friday', temp: 32, rain: 0, icon: <Sun /> },
  ],
};



export const VoiceInput = () => {

  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const [assistantResponseUrl, setAssistantResponseUrl] = useState('');
  const [assistantText, setAssistantText] = useState('');
  const [locationDetail, setLocationDetail] = useState('');
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('हिंदी');
  const [currentView, setCurrentView] = useState('home');
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lamejsLoaded, setLamejsLoaded] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const languages = ['हिंदी', 'English', 'తెలుగు', 'मराठी', 'ગુજરાતી'];

  const navItems = [
    { name: 'Home', icon: <Home />, view: 'home' },
    { name: 'Dashboard', icon: <Leaf />, view: 'dashboard' },
    { name: 'Community', icon: <MessageCircle />, view: 'community' },
    { name: 'Resources', icon: <BookOpen />, view: 'resources' },
    { name: 'Settings', icon: <Settings />, view: 'settings' },
  ];

  // Load lamejs from CDN
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lamejs/1.2.1/lame.min.js';
    script.async = true;
    script.onload = () => setLamejsLoaded(true);
    script.onerror = () => setError('Failed to load MP3 encoder. Please try again.');
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const startRecording = async () => {
    if (!lamejsLoaded) {
      setError('MP3 encoder not loaded yet. Please wait.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        chunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });

        try {
          const audioContext = new AudioContext();
          const audioData = await audioBlob.arrayBuffer();
          const audioBuffer = await audioContext.decodeAudioData(audioData);

          // Use global lamejs from CDN
          // @ts-ignore
          const mp3Encoder = new lamejs.Mp3Encoder(1, audioBuffer.sampleRate, 128);
          const samples = new Int16Array(audioBuffer.length);
          const channel = audioBuffer.getChannelData(0);

          for (let i = 0; i < channel.length; i++) {
            samples[i] = channel[i] < 0 ? channel[i] * 0x8000 : channel[i] * 0x7FFF;
          }

          const mp3Data = [];
          const blockSize = 1152;

          for (let i = 0; i < samples.length; i += blockSize) {
            const sampleChunk = samples.subarray(i, i + blockSize);
            const mp3buf = mp3Encoder.encodeBuffer(sampleChunk);
            if (mp3buf.length > 0) {
              mp3Data.push(mp3buf);
            }
          }

          const mp3buf = mp3Encoder.flush();
          if (mp3buf.length > 0) {
            mp3Data.push(mp3buf);
          }

          const mp3Blob = new Blob(mp3Data, { type: 'audio/mp3' });
          setIsUploading(true);
          await uploadToCloudinary(mp3Blob);
        } catch (error) {
          console.error('Error converting to MP3:', error);
          setError('Error converting audio to MP3 format. Please try again.');
          setIsUploading(false);
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setError(null);
      setHasRecording(false);
      setAssistantResponseUrl('');
      setAssistantText('');
    } catch (error) {
      console.error('Error starting recording:', error);
      setError('Unable to access microphone. Please check your permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setHasRecording(true);
    }
  };

  const uploadToCloudinary = async (audioBlob: Blob) => {
    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.mp3');
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('resource_type', 'raw');

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/raw/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const data = await response.json();
      if (data.secure_url) {
        setIsProcessing(true);
        await sendToAssistant(data.secure_url);
      } else {
        throw new Error('Failed to upload audio');
      }
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      setError('Error processing your audio. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const formatAssistantText = (text: string): string => {
    // Remove asterisks and other Markdown-like symbols
    return text
      .replace(/\*/g, '')           // Remove asterisks
      .replace(/#/g, '')            // Remove hash symbols
      .replace(/_/g, '')            // Remove underscores
      .replace(/(\r\n|\n|\r)/g, ' ') // Replace newlines with spaces
      .replace(/\s+/g, ' ')         // Collapse multiple spaces into one
      .trim();                      // Remove leading/trailing spaces
  };

  const sendToAssistant = async (audioUrl: string) => {
    try {
      const response = await fetch('http://127.0.0.1:7000/assistant_response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ audio_path: audioUrl }),
      });

      const data = await response.json();
      if (data.audio_response && Array.isArray(data.audio_response)) {
        const audioUrl = data.audio_response[3];
        const rawText = data.audio_response[2];
        const formattedText = formatAssistantText(rawText); // Clean the text here
        if (audioUrl && audioRef.current) {
          audioRef.current.src = audioUrl;
          await audioRef.current.load();
          setAssistantResponseUrl(audioUrl);
          setAssistantText(formattedText); // Set the cleaned text
        } else {
          throw new Error('Invalid audio response format');
        }
      } else {
        throw new Error('No valid audio response received');
      }
    } catch (error) {
      console.error('Error getting assistant response:', error);
      setError('Error getting response from assistant. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRecordToggle = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handlePlayback = () => {
    if (!audioRef.current || !assistantResponseUrl) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch((error) => {
        console.error('Playback error:', error);
        setError('Unable to play audio response. The URL may be expired or invalid.');
      });
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.onended = () => setIsPlaying(false);
      audioRef.current.onerror = () => {
        setError('Error loading audio response. The URL may be expired or invalid.');
        setIsPlaying(false);
      };
    }
  }, [assistantResponseUrl]);

  const renderDashboard = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-green-100">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-green-800">Ram Singh</h2>
            <p className="text-sm text-green-600">{locationDetail}</p>
            <p className="text-green-600 mt-1">
              {weatherData.current.temp}°C | {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="bg-orange-100 p-4 rounded-lg border border-orange-200 hover:bg-orange-50 transition-colors">
            <Droplets className="text-blue-600 mb-2" size={28} />
            <h3 className="font-semibold">Soil Moisture</h3>
            <p className="text-2xl font-bold text-orange-700">{weatherData.current.moisture}% Low</p>
          </div>
          <div className="bg-green-100 p-4 rounded-lg border border-green-200 hover:bg-green-50 transition-colors">
            <Cloud className="text-green-600 mb-2" size={28} />
            <h3 className="font-semibold">Water Saved</h3>
            <p className="text-2xl font-bold text-green-700">{weatherData.current.saved}L</p>
          </div>
        </div>
        <div className="mt-6 bg-blue-100 p-4 rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors">
          <h3 className="font-semibold mb-2">Community Success</h3>
          <div className="flex items-center space-x-3">
            <Users className="text-blue-600" size={24} />
            <p className="text-sm">Sita saved 20% water using drip irrigation</p>
          </div>
        </div>
      </div>
      <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-green-100">
        <h3 className="font-bold text-xl mb-4">5-Day Forecast</h3>
        <div className="grid grid-cols-5 gap-2">
          {weatherData.forecast.map((day, index) => (
            <div
              key={index}
              className="text-center bg-blue-50 p-3 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors"
            >
              <p className="text-sm text-gray-600">{day.day}</p>
              <div className="my-2 text-blue-600">{day.icon}</div>
              <p className="font-bold">{day.temp}°C</p>
              <p className="text-sm text-blue-600">{day.rain}% rain</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderHome = () => (
    <div className="grid md:grid-cols-2 gap-8 items-center">
      <div className="flex flex-col items-center space-y-6">
        <div className="relative">
          {/* Ripple effect rings */}
          {(isUploading || isProcessing) && (
            <div className="absolute inset-0 w-40 h-40 md:w-48 md:h-48">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="absolute inset-0 border-4 border-green-500 rounded-full animate-ripple"
                  style={{
                    animationDelay: `${i * 0.5}s`,
                    opacity: 0
                  }}
                />
              ))}
            </div>
          )}
          <button
            onClick={handleRecordToggle}
            className={`w-40 h-40 md:w-48 md:h-48 rounded-full flex items-center justify-center transition-all duration-500 transform ${
              isRecording
                ? 'bg-red-600 scale-110 animate-pulse'
                : 'bg-white/90 hover:bg-green-50 shadow-lg hover:shadow-xl border-4 border-green-500'
            } ${(isUploading || isProcessing) ? 'scale-95' : ''}`}
            disabled={isUploading || isProcessing}
          >
            <Mic
              size={64}
              className={`transition-colors duration-300 ${
                isRecording ? 'text-white' : 'text-green-700'
              } ${(isUploading || isProcessing) ? 'animate-pulse' : ''}`}
            />
          </button>
          {isRecording && (
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
              <div className="flex space-x-1">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="w-2 h-2 bg-red-500 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
        <span className="text-3xl font-bold text-green-800 bg-white/80 px-4 py-2 rounded-lg transform transition-all duration-300 hover:scale-105">
          अपने सवाल पूछें
        </span>
        <span className="text-xl text-green-700 bg-white/80 px-4 py-2 rounded-lg transform transition-all duration-300 hover:scale-105">
          Ask Your Queries
        </span>
        {error && (
          <p className="text-red-500 text-sm mt-2 bg-white/90 px-4 py-2 rounded-lg animate-fadeIn">
            {error}
          </p>
        )}
        {(isUploading || isProcessing) && (
          <span className="text-green-600 animate-pulse bg-white/90 px-4 py-2 rounded-lg transform transition-all duration-300">
            {isUploading ? 'Converting and Uploading...' : 'Processing your query...'}
          </span>
        )}
      </div>

      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-green-100 transform transition-all duration-300 hover:shadow-xl">
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-green-800 transform transition-all duration-300 hover:scale-105">
              Voice Assistant
            </h2>
            {hasRecording && (
              <p className="text-green-600 mt-2 animate-fadeIn">
                {assistantResponseUrl ? 'Response ready!' : 'Processing your query...'}
              </p>
            )}
          </div>
          {assistantResponseUrl && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex justify-center space-x-4">
                <button
                  onClick={handlePlayback}
                  className="flex items-center justify-center space-x-2 px-6 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                >
                  {isPlaying ? <Square size={24} /> : <Play size={24} />}
                  <span>{isPlaying ? 'Stop' : 'Listen'}</span>
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="flex items-center justify-center space-x-2 px-6 py-4 bg-green-100 text-green-800 rounded-xl hover:bg-green-200 transition-all duration-300 transform hover:scale-105 hover:shadow-lg border border-green-200"
                >
                  <span>View Farm</span>
                </button>
              </div>
              {assistantText && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <p className="text-gray-800 text-base leading-relaxed">
                    {assistantText}
                  </p>
                </div>
              )}
            </div>
          )}
          <audio ref={audioRef} preload="auto" />
        </div>
      </div>
    </div>
    
  );

  return (
    <div className="min-h-screen bg-[url('https://res.cloudinary.com/dzxgf75bh/image/upload/v1742636445/e1ec543c-9f57-472c-85b6-aceb6980328b_hedmex.jpg')] bg-cover bg-center bg-no-repeat">
      <div className="min-h-screen w-full">
        <div className="container mx-auto px-4 md:px-8 py-8">
          <div className="flex justify-between items-center mb-8">
            <div className="relative">
              <button
                onClick={() => setShowLanguageSelector(!showLanguageSelector)}
                className="flex items-center space-x-2 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm hover:bg-green-50 transition-all duration-300 transform hover:scale-105 border border-green-100"
              >
                <span>{selectedLanguage}</span>
                <ChevronDown size={16} />
              </button>
              {showLanguageSelector && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg z-10 border border-green-100 animate-fadeIn">
                  {languages.map((lang) => (
                    <button
                      key={lang}
                      onClick={() => {
                        setSelectedLanguage(lang);
                        setShowLanguageSelector(false);
                      }}
                      className="block w-full text-left px-4 py-2 hover:bg-green-50 transition-all duration-300 first:rounded-t-lg last:rounded-b-lg"
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="transition-all duration-500 ease-in-out transform">
            {currentView === 'home' ? renderHome() : renderDashboard()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceInput;
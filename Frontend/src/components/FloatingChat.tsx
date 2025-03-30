import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Camera, Monitor, SwitchCamera, Mic, MicOff, Volume2, VolumeX, Globe } from 'lucide-react';
import Webcam from 'react-webcam';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI('AIzaSyCDo8BVGlqjULGyafLfSwhs4fOzjpR2FfQ');

const FloatingChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureMode, setCaptureMode] = useState<'webcam' | 'screen'>('webcam');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [isScreenCapturing, setIsScreenCapturing] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: window.innerHeight - 100 }); // Adjusted initial position for closed state
  const [size, setSize] = useState({ width: 400, height: 600 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0 });
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [language, setLanguage] = useState<'hi' | 'en'>('hi');
  
  const chatRef = useRef<HTMLDivElement>(null);
  const webcamRef = useRef<Webcam>(null);
  const animationFrameRef = useRef<number>();
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [chatHistory, setChatHistory] = useState<{ type: 'user' | 'bot'; message: string; image?: string }[]>([
    { 
      type: 'bot', 
      message: language === 'hi' 
        ? 'हाय! मैं आपका फार्म हेल्पर विजुअल असिस्टेंट हूँ। फार्म टूल्स का उपयोग कैसे करें या ऐप फीचर्स को समझने के लिए एक फोटो या विंडो कैप्चर करें। आप वॉइस कमांड का भी उपयोग कर सकते हैं!'
        : 'Hi! I am your Farm Helper Visual Assistant. Capture a photo or window to understand how to use farm tools or app features. You can also use voice commands!'
    }
  ]);

  useEffect(() => {
    setChatHistory([{ 
      type: 'bot', 
      message: language === 'hi' 
        ? 'हाय! मैं आपका फार्म हेल्पर विजुअल असिस्टेंट हूँ। फार्म टूल्स का उपयोग कैसे करें या ऐप फीचर्स को समझने के लिए एक फोटो या विंडो कैप्चर करें। आप वॉइस कमांड का भी उपयोग कर सकते हैं!'
        : 'Hi! I am your Farm Helper Visual Assistant. Capture a photo or window to understand how to use farm tools or app features. You can also use voice commands!'
    }]);
  }, [language]);

  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = language === 'hi' ? 'hi-IN' : 'en-US';

      recognitionRef.current.onresult = (event) => {
        const last = event.results.length - 1;
        const command = event.results[last][0].transcript;
        setTranscript(command);
      };

      recognitionRef.current.onend = () => {
        if (isRecording) {
          recognitionRef.current?.start();
        }
      };
    }

    speechSynthesisRef.current = new SpeechSynthesisUtterance();
    speechSynthesisRef.current.rate = 1;
    speechSynthesisRef.current.pitch = 1;
    speechSynthesisRef.current.volume = 1;
    speechSynthesisRef.current.lang = language === 'hi' ? 'hi-IN' : 'en-US';

    speechSynthesisRef.current.onend = () => {
      setIsSpeaking(false);
    };

    return () => {
      if (speechSynthesisRef.current && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, [language, isRecording]);

  const speakMessage = (message: string) => {
    if (!speechSynthesisRef.current) return;

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const cleanMessage = message.replace(/\*\*/g, '').replace(/[•\-]/g, '').trim();
    speechSynthesisRef.current.text = cleanMessage;
    window.speechSynthesis.speak(speechSynthesisRef.current);
    setIsSpeaking(true);
  };

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert(language === 'hi' 
        ? 'आपके ब्राउज़र में स्पीच रिकग्निशन समर्थित नहीं है।'
        : 'Speech recognition is not supported in your browser.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      if (transcript.trim()) {
        setQuery(transcript);
        if (capturedImage) {
          handleAnalyze(transcript);
        } else {
          setIsCapturing(true);
        }
      }
    } else {
      setTranscript('');
      recognitionRef.current.start();
    }
    setIsRecording(!isRecording);
  };

  const toggleLanguage = () => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
    setLanguage(prev => prev === 'hi' ? 'en' : 'hi');
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (chatRef.current) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
      chatRef.current.style.transition = 'none';
      chatRef.current.style.cursor = 'grabbing';
    }
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
    setResizeStart({ x: e.clientX, y: e.clientY });
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && chatRef.current) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      animationFrameRef.current = requestAnimationFrame(() => {
        const newX = Math.max(0, Math.min(e.clientX - dragStart.x, window.innerWidth - (isOpen ? size.width : 64))); // Adjusted for icon size
        const newY = Math.max(0, Math.min(e.clientY - dragStart.y, window.innerHeight - (isOpen ? size.height : 64)));
        setPosition({ x: newX, y: newY });
      });
    } else if (isResizing) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      animationFrameRef.current = requestAnimationFrame(() => {
        const newWidth = Math.max(300, size.width + (e.clientX - resizeStart.x));
        const newHeight = Math.max(400, size.height + (e.clientY - resizeStart.y));
        setSize({ width: newWidth, height: newHeight });
        setResizeStart({ x: e.clientX, y: e.clientY });
      });
    }
  };

  const handleMouseUp = () => {
    if (chatRef.current) {
      setIsDragging(false);
      setIsResizing(false);
      chatRef.current.style.transition = 'transform 0.2s ease-out, opacity 0.2s ease-out';
      chatRef.current.style.cursor = 'move';
    }
  };

  useEffect(() => {
    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none';
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
    };
  }, [isDragging, isResizing, dragStart, resizeStart]);

  const captureImage = React.useCallback(async () => {
    if (captureMode === 'webcam' && webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setCapturedImage(imageSrc);
      setIsCapturing(false);
      if (transcript) {
        handleAnalyze(transcript);
      }
    } else if (captureMode === 'screen') {
      try {
        setIsScreenCapturing(true);
        setIsOpen(false);

        await new Promise(resolve => setTimeout(resolve, 100));

        const stream = await navigator.mediaDevices.getDisplayMedia({
          preferCurrentTab: true,
          video: { displaySurface: 'window' }
        });

        const video = document.createElement('video');
        video.srcObject = stream;
        await video.play();

        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(video, 0, 0);

        const imageSrc = canvas.toDataURL('image/jpeg');
        setCapturedImage(imageSrc);

        stream.getTracks().forEach(track => track.stop());
        
        if (transcript) {
          handleAnalyze(transcript);
        }
      } catch (error) {
        console.error('Error capturing screen:', error);
      } finally {
        setIsScreenCapturing(false);
        setIsOpen(true);
        setIsCapturing(false);
      }
    }
  }, [captureMode, transcript]);

  const handleAnalyze = async (voiceQuery?: string) => {
    if (!capturedImage || loading) return;

    setLoading(true);
    const finalQuery = voiceQuery || query || (language === 'hi' ? 'इसे समझाएं।' : 'Explain this.');
    const userMessage = { 
      type: 'user' as const, 
      message: finalQuery, 
      image: capturedImage 
    };
    setChatHistory(prev => [...prev, userMessage]);
    setQuery('');
    setTranscript('');

    try {
      const imageResponse = await fetch(capturedImage);
      const imageBlob = await imageResponse.blob();
      
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      const prompt = language === 'hi'
        ? `आप एक फार्म हेल्पर विजुअल असिस्टेंट हैं। इस छवि का विश्लेषण करें और "${finalQuery}" का जवाब दें। 
           - अगर प्रश्न हिंदी में है, तो जवाब हिंदी में दें।
           - केवल इसका उपयोग कैसे करें, यह 2-3 सरल वाक्यों में बताएं। 
           - नाम या उद्देश्य न बताएं। 
           - जवाब सीधा और सरल हिंदी में दें, ताकि किसान समझ सके।`
        : `You are a Farm Helper Visual Assistant. Analyze this image and answer "${finalQuery}". 
           - If the query is in Hindi, respond in Hindi.
           - Only explain how to use it in 2-3 simple sentences. 
           - Do not mention its name or purpose. 
           - Answer directly in simple English so a farmer can understand.`;
      
      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: await blobToBase64(imageBlob)
          }
        }
      ]);

      const response = await result.response;
      const botMessage = { type: 'bot' as const, message: response.text() };
      setChatHistory(prev => [...prev, botMessage]);
      
      if (voiceQuery) {
        speakMessage(response.text());
      }
    } catch (error) {
      console.error('Error:', error);
      setChatHistory(prev => [...prev, {
        type: 'bot',
        message: language === 'hi'
          ? `क्षमा करें, छवि का विश्लेषण नहीं कर सका। कृपया फिर से कोशिश करें।`
          : `Sorry, couldn’t analyze the image. Please try again.`,
      }]);
    } finally {
      setLoading(false);
      setCapturedImage(null);
    }
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result.split(',')[1]);
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const toggleCaptureMode = () => {
    setCaptureMode(prev => (prev === 'webcam' ? 'screen' : 'webcam'));
  };

  const renderMessage = (text: string, messageType: 'user' | 'bot') => {
    const paragraphs = text.split('\n\n').filter(p => p.trim() !== '');

    return (
      <div className="flex items-center gap-2">
        {messageType === 'bot' && (
          <button
            onClick={() => speakMessage(text)}
            className={`flex-shrink-0 w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-sm border border-gray-200 transition-colors ${
              isSpeaking 
                ? 'text-blue-500 hover:text-blue-600' 
                : 'text-gray-500 hover:text-gray-600'
            }`}
            title={language === 'hi' ? (isSpeaking ? 'बोलना बंद करें' : 'प्रतिक्रिया सुनें') : (isSpeaking ? 'Stop speaking' : 'Listen to response')}
          >
            {isSpeaking ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        )}
        <div className="flex-1">
          {paragraphs.map((paragraph, pIndex) => {
            const lines = paragraph.split('\n').filter(line => line.trim() !== '');
            const cleanLines = lines.map(line => line.replace(/^[*•-\s]+(?![*])/, '').trim());
        
            if (cleanLines.length > 1 && cleanLines.some(line => line.includes(':'))) {
              return (
                <div key={pIndex} className="space-y-2">
                  {cleanLines.map((line, lIndex) => {
                    const parts = line.split(/(\*\*[^*]+\*\*)/g);
                    const formattedLine = parts.map((part, partIndex) => {
                      if (part.startsWith('**') && part.endsWith('**')) {
                        return <strong key={partIndex}>{part.slice(2, -2)}</strong>;
                      }
                      return <span key={partIndex}>{part.replace(/\*/g, '')}</span>;
                    });
                    return (
                      <div key={lIndex} className="flex items-start gap-2">
                        <span>•</span>
                        <span>{formattedLine}</span>
                      </div>
                    );
                  })}
                </div>
              );
            }
        
            const combinedText = cleanLines.join(' ');
            const parts = combinedText.split(/(\*\*[^*]+\*\*)/g);
            const formattedText = parts.map((part, partIndex) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={partIndex}>{part.slice(2, -2)}</strong>;
              }
              return <span key={partIndex}>{part.replace(/\*/g, '')}</span>;
            });
        
            return (
              <p key={pIndex} className="mb-2 last:mb-0">{formattedText}</p>
            );
          })}
        </div>
      </div>
    );
  };

  if (isScreenCapturing) {
    return null;
  }

  return (
    <div
      ref={chatRef}
      className="fixed z-50 will-change-transform"
      style={{
        top: `${position.y}px`,
        left: `${position.x}px`,
        transform: `scale(${isOpen ? 1 : 0.8})`,
        transformOrigin: 'bottom right',
        opacity: isOpen ? 1 : 0.9,
        transition: (isDragging || isResizing) ? 'none' : 'transform 0.2s ease-out, opacity 0.2s ease-out',
        cursor: isDragging ? 'grabbing' : 'move'
      }}
    >
      {isOpen ? (
        <div
          className="bg-white rounded-xl shadow-2xl flex flex-col relative"
          style={{
            width: `${size.width}px`,
            height: `${size.height}px`,
            minWidth: '300px',
            minHeight: '400px'
          }}
        >
          <div
            className="bg-blue-600 text-white p-4 rounded-t-xl flex justify-between items-center select-none"
            onMouseDown={handleMouseDown}
          >
            <h3 className="text-lg font-semibold">
              {language === 'hi' ? 'फार्म हेल्पर विजुअल असिस्टेंट' : 'Farm Helper Visual Assistant'}
            </h3>
            <div className="flex items-center gap-3">
              <button
                onClick={toggleLanguage}
                className="text-white hover:text-blue-200 transition-colors"
                title={language === 'hi' ? 'Switch to English' : 'हिंदी में स्विच करें'}
              >
                <Globe size={22} />
                <span className="sr-only">
                  {language === 'hi' ? 'Switch to English' : 'हिंदी में स्विच करें'}
                </span>
              </button>
              <button
                onClick={toggleCaptureMode}
                className="text-white hover:text-blue-200 transition-colors"
                title={language === 'hi' 
                  ? (captureMode === 'webcam' ? 'विंडो कैप्चर पर स्विच करें' : 'कैमरा पर स्विच करें')
                  : (captureMode === 'webcam' ? 'Switch to window capture' : 'Switch to camera')}
              >
                <SwitchCamera size={22} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-blue-200 transition-colors"
              >
                <X size={22} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {isCapturing ? (
              <div className="relative rounded-xl overflow-hidden bg-gray-50 shadow-inner">
                {captureMode === 'webcam' ? (
                  <Webcam
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    className="w-full rounded-xl"
                  />
                ) : (
                  <div className="h-64 flex items-center justify-center text-center p-6">
                    <p className="text-gray-600">
                      {language === 'hi' 
                        ? 'एक विंडो या स्क्रीन चुनने के लिए कैप्चर पर क्लिक करें'
                        : 'Click capture to select a window or screen'}
                    </p>
                  </div>
                )}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-3">
                  <button
                    onClick={captureImage}
                    className="bg-blue-600 text-white px-6 py-2.5 rounded-full hover:bg-blue-700 transition-colors shadow-lg flex items-center gap-2"
                  >
                    {captureMode === 'webcam' ? <Camera size={18} /> : <Monitor size={18} />}
                    <span>
                      {language === 'hi'
                        ? (captureMode === 'webcam' ? 'फोटो कैप्चर करें' : 'विंडो कैप्चर करें')
                        : (captureMode === 'webcam' ? 'Capture Photo' : 'Capture Window')}
                    </span>
                  </button>
                  <button
                    onClick={() => setIsCapturing(false)}
                    className="bg-red-500 text-white px-6 py-2.5 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                  >
                    {language === 'hi' ? 'रद्द करें' : 'Cancel'}
                  </button>
                </div>
              </div>
            ) : (
              chatHistory.map((chat, index) => (
                <div
                  key={index}
                  className={`flex ${chat.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-4 rounded-xl relative ${
                      chat.type === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {chat.image && (
                      <img
                        src={chat.image}
                        alt={language === 'hi' ? 'कैप्चर की गई' : 'Captured'}
                        className="max-w-full rounded-lg mb-3"
                      />
                    )}
                    <div className="leading-relaxed whitespace-pre-wrap">
                      {renderMessage(chat.message, chat.type)}
                    </div>
                  </div>
                </div>
              ))
            )}
            {loading && (
              <div className="flex flex-col items-center gap-3 py-4">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
                <p className="text-gray-600">
                  {language === 'hi' ? 'विश्लेषण कर रहा है...' : 'Analyzing...'}
                </p>
              </div>
            )}
          </div>
          
          <div className="p-5 border-t border-gray-100">
            {capturedImage ? (
              <div className="space-y-4">
                <div className="relative">
                  <img
                    src={capturedImage}
                    alt={language === 'hi' ? 'कैप्चर की गई' : 'Captured'}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => setCapturedImage(null)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors shadow-md"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={transcript || query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder={language === 'hi' 
                        ? 'अपना प्रश्न टाइप करें या बोलें...'
                        : 'Type or speak your question...'}
                      className="w-full px-4 py-2.5 pr-12 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={toggleRecording}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full transition-colors ${
                        isRecording ? 'text-red-500 hover:text-red-600' : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
                    </button>
                  </div>
                  <button
                    onClick={() => handleAnalyze()}
                    disabled={loading}
                    className="bg-blue-600 text-white px-6 py-2.5 rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Send size={18} />
                    {language === 'hi' ? 'समझाएं' : 'Explain'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  onClick={() => setIsCapturing(true)}
                  className="w-full py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  {captureMode === 'webcam' ? <Camera size={20} /> : <Monitor size={20} />}
                  <span>
                    {language === 'hi'
                      ? (captureMode === 'webcam' ? 'फोटो कैप्चर करें' : 'विंडो कैप्चर करें')
                      : (captureMode === 'webcam' ? 'Capture Photo' : 'Capture Window')}
                  </span>
                </button>
              </div>
            )}
          </div>

          <div
            className="absolute bottom-0 right-0 w-4 h-4 bg-gray-400 rounded-tl-lg cursor-se-resize"
            onMouseDown={handleResizeMouseDown}
          />
        </div>
      ) : (
        <button
          onMouseDown={handleMouseDown}
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 text-white p-4 rounded-full shadow-xl hover:bg-blue-700 transition-colors"
        >
          <MessageCircle size={24} />
        </button>
      )}
    </div>
  );
};

export default FloatingChat;
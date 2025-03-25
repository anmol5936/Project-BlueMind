import React, { useState } from 'react';

const BlueMindLoader: React.FC = () => {
  const [isBubbling, setIsBubbling] = useState(false);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-b from-blue-600 to-blue-900">
      <div className="relative">
        {/* Subtle background glow */}
        <div className="absolute inset-0 bg-blue-400 blur-[100px] opacity-10" />
        
        {/* Main text container */}
        <div className="relative animate-float">
          <h1 className="text-9xl md:text-[12rem] font-bold tracking-tight">
            <span 
              className="text-white animate-glow inline-block transition-transform duration-300 hover:scale-105 relative cursor-pointer"
              onMouseEnter={() => setIsBubbling(true)}
              onMouseLeave={() => setIsBubbling(false)}
            >
              blue
              {/* Bubble effect */}
              {isBubbling && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <span className="bubble bubble-1" />
                  <span className="bubble bubble-2" />
                  <span className="bubble bubble-3" />
                  <span className="bubble bubble-4" />
                  <span className="bubble bubble-5" />
                  <span className="bubble bubble-6" />
                  <span className="bubble bubble-7" />
                </div>
              )}
            </span>
            <span className="text-blue-200 animate-glow inline-block ml-6 transition-transform duration-300 hover:scale-105">
              mind
            </span>
          </h1>
        </div>
      </div>

      {/* Add these styles in your CSS file or in a style tag */}
      <style jsx>{`
        .bubble {
          position: absolute;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          animation: bubbleRise 1.5s ease-out forwards;
        }

        .bubble-1 {
          width: 20px;
          height: 20px;
          left: 10%;
          bottom: 0;
          animation-delay: 0s;
        }

        .bubble-2 {
          width: 15px;
          height: 15px;
          left: 25%;
          bottom: 0;
          animation-delay: 0.2s;
        }

        .bubble-3 {
          width: 25px;
          height: 25px;
          left: 40%;
          bottom: 0;
          animation-delay: 0.4s;
        }

        .bubble-4 {
          width: 18px;
          height: 18px;
          left: 55%;
          bottom: 0;
          animation-delay: 0.6s;
        }

        .bubble-5 {
          width: 22px;
          height: 22px;
          left: 70%;
          bottom: 0;
          animation-delay: 0.3s;
        }

        .bubble-6 {
          width: 17px;
          height: 17px;
          left: 85%;
          bottom: 0;
          animation-delay: 0.5s;
        }

        .bubble-7 {
          width: 20px;
          height: 20px;
          left: 95%;
          bottom: 0;
          animation-delay: 0.1s;
        }

        @keyframes bubbleRise {
          0% {
            transform: translateY(0);
            opacity: 0.8;
          }
          100% {
            transform: translateY(-150px) translateX(10px);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default BlueMindLoader;
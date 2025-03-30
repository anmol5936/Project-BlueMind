import React from 'react';

const BlueMindLoader: React.FC = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-b from-blue-600 to-blue-900 overflow-hidden">
      {/* Bubble Animation Background */}
      <div className="bubbles absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="bubble"></div>
        ))}
      </div>

      <div className="relative z-10">
        {/* Main text container */}
        <div className="relative animate-float">
          <h1 className="text-9xl md:text-[12rem] font-bold tracking-tight flex items-center">
            <span className="text-white animate-glow inline-block transition-transform duration-300 hover:scale-105">
              Blue
            </span>
            <span className="text-blue-200 animate-glow inline-block transition-transform duration-300 hover:scale-105">
              Mind
            </span>
          </h1>
        </div>
      </div>

      <style jsx>{`
        .bubbles {
          width: 100%;
          height: 100%;
          z-index: 1;
          overflow: hidden;
          pointer-events: none;
        }

        .bubble {
          position: absolute;
          bottom: -100px;
          width: 40px;
          height: 40px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          animation: rise 5s infinite ease-in; /* Default duration */
        }

        .bubble:nth-child(1) {
          width: 40px;
          height: 40px;
          left: 10%;
          animation-duration: 4s;
        }

        .bubble:nth-child(2) {
          width: 20px;
          height: 20px;
          left: 20%;
          animation-duration: 3s;
          animation-delay: 0.5s;
        }

        .bubble:nth-child(3) {
          width: 50px;
          height: 50px;
          left: 35%;
          animation-duration: 3.5s;
          animation-delay: 1s;
        }

        .bubble:nth-child(4) {
          width: 80px;
          height: 80px;
          left: 50%;
          animation-duration: 5.5s;
          animation-delay: 0s;
        }

        .bubble:nth-child(5) {
          width: 35px;
          height: 35px;
          left: 55%;
          animation-duration: 3s;
          animation-delay: 0.5s;
        }

        .bubble:nth-child(6) {
          width: 45px;
          height: 45px;
          left: 65%;
          animation-duration: 4s;
          animation-delay: 1.5s;
        }

        .bubble:nth-child(7) {
          width: 90px;
          height: 90px;
          left: 70%;
          animation-duration: 6s;
          animation-delay: 1s;
        }

        .bubble:nth-child(8) {
          width: 25px;
          height: 25px;
          left: 80%;
          animation-duration: 3s;
          animation-delay: 1s;
        }

        .bubble:nth-child(9) {
          width: 15px;
          height: 15px;
          left: 70%;
          animation-duration: 2.5s;
          animation-delay: 0.5s;
        }

        .bubble:nth-child(10) {
          width: 90px;
          height: 90px;
          left: 25%;
          animation-duration: 5s;
          animation-delay: 2s;
        }

        .bubble:nth-child(11) {
          width: 60px;
          height: 60px;
          left: 15%;
          animation-duration: 4.5s;
          animation-delay: 0.8s;
        }

        .bubble:nth-child(12) {
          width: 30px;
          height: 30px;
          left: 30%;
          animation-duration: 3.2s;
          animation-delay: 1.2s;
        }

        .bubble:nth-child(13) {
          width: 70px;
          height: 70px;
          left: 45%;
          animation-duration: 5s;
          animation-delay: 0.3s;
        }

        .bubble:nth-child(14) {
          width: 20px;
          height: 20px;
          left: 60%;
          animation-duration: 2.8s;
          animation-delay: 1.8s;
        }

        .bubble:nth-child(15) {
          width: 55px;
          height: 55px;
          left: 75%;
          animation-duration: 4.2s;
          animation-delay: 0.6s;
        }

        .bubble:nth-child(16) {
          width: 85px;
          height: 85px;
          left: 5%;
          animation-duration: 5.8s;
          animation-delay: 1.4s;
        }

        .bubble:nth-child(17) {
          width: 25px;
          height: 25px;
          left: 85%;
          animation-duration: 3.5s;
          animation-delay: 0.9s;
        }

        .bubble:nth-child(18) {
          width: 45px;
          height: 45px;
          left: 40%;
          animation-duration: 4s;
          animation-delay: 2.2s;
        }

        .bubble:nth-child(19) {
          width: 65px;
          height: 65px;
          left: 90%;
          animation-duration: 5.2s;
          animation-delay: 1.6s;
        }

        .bubble:nth-child(20) {
          width: 35px;
          height: 35px;
          left: 95%;
          animation-duration: 3.8s;
          animation-delay: 0.4s;
        }

        @keyframes rise {
          0% {
            bottom: -100px;
            transform: translateX(0);
          }
          50% {
            transform: translate(100px);
          }
          100% {
            bottom: 1080px;
            transform: translateX(-200px);
          }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }

        @keyframes glow {
          0%, 100% { text-shadow: 0 0 20px rgba(191, 219, 254, 0.5); }
          50% { text-shadow: 0 0 30px rgba(191, 219, 254, 0.8); }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-glow {
          animation: glow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default BlueMindLoader;
import { useState } from 'react';

interface LoadingScreenProps {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [fadeOut, setFadeOut] = useState(false);

  const handleEnter = () => {
    setFadeOut(true);
    setTimeout(onComplete, 500);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: '#fff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      opacity: fadeOut ? 0 : 1,
      transition: 'opacity 0.5s ease-out',
    }}>
      {/* Video - fills screen */}
      <video
        autoPlay
        muted
        loop
        playsInline
        style={{
          width: '100%',
          height: '80vh',
          objectFit: 'contain',
        }}
      >
        <source src="/splash.mp4" type="video/mp4" />
      </video>
      
      {/* Bottom section */}
      <div style={{
        position: 'absolute',
        bottom: '80px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px',
      }}>
        {/* Loading dots */}
        <div style={{
          display: 'flex',
          gap: '8px',
        }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#999',
                animation: `bounce 1.4s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>

        {/* Glassmorphism welcome button */}
        <button
          onClick={handleEnter}
          style={{
            background: 'rgba(255, 255, 255, 0.25)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.4)',
            color: '#1a1a1a',
            padding: '16px 40px',
            borderRadius: '50px',
            fontSize: '16px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.3s ease',
          }}
        >
          Welcome to agentscreener
        </button>
      </div>

      {/* CSS Animation */}
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-8px);
          }
        }
      `}</style>
    </div>
  );
}

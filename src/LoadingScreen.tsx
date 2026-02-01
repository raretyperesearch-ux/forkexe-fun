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
      backgroundColor: '#f5f5f5',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      opacity: fadeOut ? 0 : 1,
      transition: 'opacity 0.5s ease-out',
      padding: '20px',
    }}>
      {/* Welcome Card */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
        background: 'rgba(255, 255, 255, 0.6)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.8)',
        borderRadius: '24px',
        padding: '20px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      }}>
        {/* Video - small */}
        <video
          autoPlay
          muted
          loop
          playsInline
          style={{
            width: '120px',
            height: '120px',
            objectFit: 'contain',
            borderRadius: '16px',
          }}
        >
          <source src="/splash.mp4" type="video/mp4" />
        </video>
        
        {/* Text + Button */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}>
          <div>
            <div style={{
              fontSize: '18px',
              fontWeight: 700,
              color: '#1a1a1a',
              marginBottom: '4px',
            }}>
              Welcome to
            </div>
            <div style={{
              fontSize: '22px',
              fontWeight: 800,
              color: '#1a1a1a',
            }}>
              agentscreener
            </div>
          </div>
          
          {/* Enter button */}
          <button
            onClick={handleEnter}
            style={{
              background: 'linear-gradient(135deg, #1a1a1a 0%, #333 100%)',
              border: 'none',
              color: '#fff',
              padding: '12px 24px',
              borderRadius: '50px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            Enter App →
          </button>
        </div>
      </div>

      {/* Loading dots below */}
      <div style={{
        position: 'absolute',
        bottom: '40px',
        display: 'flex',
        gap: '6px',
      }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: '#ccc',
              animation: `bounce 1.4s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>

      {/* CSS Animation */}
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-6px);
          }
        }
      `}</style>
    </div>
  );
}

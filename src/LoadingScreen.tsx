import { useState, useRef } from 'react';

interface LoadingScreenProps {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [fadeOut, setFadeOut] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleVideoEnd = () => {
    setFadeOut(true);
    setTimeout(onComplete, 500);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: '#000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      opacity: fadeOut ? 0 : 1,
      transition: 'opacity 0.5s ease-out',
    }}>
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        onEnded={handleVideoEnd}
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
          objectFit: 'contain',
        }}
      >
        <source src="/splash.mp4" type="video/mp4" />
      </video>
      
      {/* Skip button */}
      <button
        onClick={() => {
          setFadeOut(true);
          setTimeout(onComplete, 300);
        }}
        style={{
          position: 'absolute',
          bottom: '40px',
          right: '40px',
          background: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.2)',
          color: '#999',
          padding: '8px 16px',
          borderRadius: '20px',
          fontSize: '12px',
          cursor: 'pointer',
        }}
      >
        Skip
      </button>
    </div>
  );
}

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

  // Generate dense matrix grid
  const generateMatrixLines = () => {
    const words = ['AGENT', 'TOKEN', 'AI', 'BASE', 'CRYPTO', 'LAUNCH', 'TRADE', 'SCAN', 'MINT', 'DEPLOY', 'CHAIN', 'WALLET', 'DEX', '0x', 'ETH', 'HODL', 'GM', 'WAGMI', 'LFG', 'MOON', 'PUMP', 'CLAWNCH', 'BANKR', 'CLANKER', 'BOT', 'APE', 'NFT', 'WEB3', 'DEFI'];
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+*@#$%&';
    const lines = [];
    
    for (let row = 0; row < 20; row++) {
      let line = '';
      for (let col = 0; col < 60; col++) {
        if (Math.random() > 0.85) {
          line += words[Math.floor(Math.random() * words.length)] + ' ';
          col += 4;
        } else {
          line += chars[Math.floor(Math.random() * chars.length)] + ' ';
        }
      }
      lines.push(line);
    }
    return lines;
  };

  const matrixLines = generateMatrixLines();

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: '#0a0a0c',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      opacity: fadeOut ? 0 : 1,
      transition: 'opacity 0.5s ease-out',
      overflow: 'hidden',
    }}>
      {/* Dense matrix text background */}
      <div style={{
        position: 'absolute',
        inset: '-50px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: '8px',
        transform: 'rotate(-5deg) scale(1.2)',
      }}>
        {matrixLines.map((line, i) => (
          <div
            key={i}
            style={{
              fontFamily: 'monospace',
              fontSize: '12px',
              fontWeight: 500,
              letterSpacing: '2px',
              whiteSpace: 'nowrap',
              color: i % 3 === 0 ? '#ff6b35' : i % 3 === 1 ? '#4dabf7' : '#666',
              opacity: 0.25 + (Math.sin(i * 0.5) * 0.1),
              animation: `drift ${20 + (i % 5) * 2}s linear infinite`,
              animationDelay: `${i * -0.5}s`,
            }}
          >
            {line}
          </div>
        ))}
      </div>

      {/* Gradient overlay for depth */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse at center, transparent 0%, #0a0a0c 70%)',
        pointerEvents: 'none',
      }} />

      {/* Orange glow - left */}
      <div style={{
        position: 'absolute',
        left: '-5%',
        top: '35%',
        width: '350px',
        height: '350px',
        background: 'radial-gradient(circle, rgba(255,107,53,0.4) 0%, transparent 60%)',
        filter: 'blur(80px)',
      }} />
      
      {/* Blue glow - right */}
      <div style={{
        position: 'absolute',
        right: '-5%',
        top: '40%',
        width: '350px',
        height: '350px',
        background: 'radial-gradient(circle, rgba(77,171,247,0.4) 0%, transparent 60%)',
        filter: 'blur(80px)',
      }} />

      {/* Welcome Card */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        background: 'rgba(15, 15, 18, 0.9)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '20px',
        padding: '20px',
        boxShadow: `
          0 0 0 1px rgba(255,107,53,0.1),
          0 0 60px rgba(255,107,53,0.15),
          0 0 60px rgba(77,171,247,0.15),
          inset 0 1px 0 rgba(255,255,255,0.05)
        `,
        zIndex: 10,
      }}>
        {/* Video - small */}
        <video
          autoPlay
          muted
          loop
          playsInline
          style={{
            width: '100px',
            height: '100px',
            objectFit: 'contain',
            borderRadius: '12px',
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
              fontSize: '14px',
              fontWeight: 500,
              color: '#888',
              marginBottom: '2px',
            }}>
              Welcome to
            </div>
            <div style={{
              fontSize: '20px',
              fontWeight: 700,
              color: '#fff',
            }}>
              agentscreener
            </div>
          </div>
          
          {/* Enter button */}
          <button
            onClick={handleEnter}
            style={{
              background: 'linear-gradient(135deg, rgba(255,107,53,0.3) 0%, rgba(77,171,247,0.3) 100%)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#fff',
              padding: '10px 20px',
              borderRadius: '50px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.3s ease',
            }}
          >
            Enter App →
          </button><button onClick={() => window.open("/skill.md", "_blank")} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.6)", padding: "8px 20px", borderRadius: "50px", fontSize: "12px", fontWeight: 500, cursor: "pointer", marginTop: "10px" }}>📄 Docs</button>
        </div>
      </div>

      {/* Loading dots */}
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
              backgroundColor: '#444',
              animation: `bounce 1.4s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
        @keyframes drift {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100px); }
        }
      `}</style>
    </div>
  );
}

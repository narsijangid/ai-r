import React, { useState, useRef, useEffect } from 'react';

const VoiceAI = (props) => {
  const [soundPlayed, setSoundPlayed] = useState(false);
  const [status, setStatus] = useState("Waiting...");
  const [statusColor, setStatusColor] = useState("#fff");
  const [buttonText, setButtonText] = useState("Enter..");
  
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const dataArrayRef = useRef(null);
  const rafIdRef = useRef(null);
  const rotationRef = useRef(0);
  const particleTimerRef = useRef(0);
  const curtainRef = useRef(null);
  const faceBtnRef = useRef(null);

  const positionVisualizer = () => {
    if (!faceBtnRef.current || !curtainRef.current || !canvasRef.current) return;
    
    const rect = faceBtnRef.current.getBoundingClientRect();
    const curtainRect = curtainRef.current.getBoundingClientRect();
    
    const size = 200;
    const canvas = canvasRef.current;
    canvas.width = size;
    canvas.height = size;
    
    // Position above the button
    canvas.style.top = (rect.top - curtainRect.top - size - 30) + "px";
    canvas.style.left = (rect.left - curtainRect.left + rect.width/2 - size/2) + "px";
    
    // Position glow rings
    const ring1 = document.getElementById('glowRing1');
    const ring2 = document.getElementById('glowRing2');
    
    if (ring1) {
      ring1.style.width = (size + 40) + "px";
      ring1.style.height = (size + 40) + "px";
      ring1.style.top = (rect.top - curtainRect.top - size - 50) + "px";
      ring1.style.left = (rect.left - curtainRect.left + rect.width/2 - size/2 - 20) + "px";
    }
    
    if (ring2) {
      ring2.style.width = (size + 80) + "px";
      ring2.style.height = (size + 80) + "px";
      ring2.style.top = (rect.top - curtainRect.top - size - 70) + "px";
      ring2.style.left = (rect.left - curtainRect.left + rect.width/2 - size/2 - 40) + "px";
    }
  };

  const createParticle = () => {
    if (!canvasRef.current || !curtainRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const curtainRect = curtainRef.current.getBoundingClientRect();
    
    const particle = document.createElement('div');
    particle.className = 'particle';
    
    const x = rect.left - curtainRect.left + Math.random() * rect.width;
    const y = rect.top - curtainRect.top + rect.height;
    
    particle.style.left = x + 'px';
    particle.style.top = y + 'px';
    particle.style.animation = `particle-float ${2 + Math.random() * 2}s ease-out forwards`;
    
    curtainRef.current.appendChild(particle);
    
    setTimeout(() => {
      if (particle.parentNode) {
        particle.remove();
      }
    }, 4000);
  };

  const setupVisualizer = (stream) => {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    analyserRef.current = audioContextRef.current.createAnalyser();
    sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
    sourceRef.current.connect(analyserRef.current);
    analyserRef.current.fftSize = 128;
    const bufferLength = analyserRef.current.frequencyBinCount;
    dataArrayRef.current = new Uint8Array(bufferLength);

    setTimeout(() => {
      positionVisualizer();
    }, 100);

    const draw = () => {
      rafIdRef.current = requestAnimationFrame(draw);
      
      if (!analyserRef.current || !dataArrayRef.current || !canvasRef.current) return;
      
      analyserRef.current.getByteFrequencyData(dataArrayRef.current);
      
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = 60;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Create gradient background
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius + 40);
      gradient.addColorStop(0, 'rgba(255,20,147,0.1)');
      gradient.addColorStop(1, 'rgba(138,43,226,0.05)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw center circle
      ctx.beginPath();
      ctx.arc(centerX, centerY, 15, 0, Math.PI * 2);
      ctx.fillStyle = '#ff1493';
      ctx.fill();
      ctx.shadowColor = '#ff1493';
      ctx.shadowBlur = 20;
      ctx.fill();
      ctx.shadowBlur = 0;
      
      // Draw audio bars in circle
      const bars = 32;
      const angleStep = (Math.PI * 2) / bars;
      
      for (let i = 0; i < bars; i++) {
        const dataIndex = Math.floor(i * bufferLength / bars);
        const barHeight = (dataArrayRef.current[dataIndex] / 255) * 50;
        const angle = rotationRef.current + i * angleStep;
        
        const x1 = centerX + Math.cos(angle) * radius;
        const y1 = centerY + Math.sin(angle) * radius;
        const x2 = centerX + Math.cos(angle) * (radius + barHeight);
        const y2 = centerY + Math.sin(angle) * (radius + barHeight);
        
        // Create gradient for each bar
        const barGradient = ctx.createLinearGradient(x1, y1, x2, y2);
        barGradient.addColorStop(0, '#ff1493');
        barGradient.addColorStop(0.5, '#ff69b4');
        barGradient.addColorStop(1, '#8a2be2');
        
        ctx.strokeStyle = barGradient;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        
        // Add glow effect
        ctx.shadowColor = '#ff1493';
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
      
      // Draw inner circles for extra effect
      for (let i = 0; i < 3; i++) {
        const avgVolume = dataArrayRef.current.reduce((a, b) => a + b) / bufferLength;
        const pulseRadius = 25 + (avgVolume / 255) * 20 + i * 8;
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, pulseRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255,20,147,${0.3 - i * 0.1})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      
      rotationRef.current += 0.02;
      
      // Create particles periodically
      particleTimerRef.current++;
      if (particleTimerRef.current % 30 === 0) {
        createParticle();
      }
    };
    draw();
  };

  const onFirstClick = () => {
    if (soundPlayed) return;
    setSoundPlayed(true);
    
    setStatus("Microphone Activated!");
    setStatusColor("#00ff88");
    setButtonText("Start");

    navigator.mediaDevices.getUserMedia({audio: true})
      .then(stream => {
        setupVisualizer(stream);
      })
      .catch(err => {
        console.error("Mic access denied:", err);
        setStatus("Microphone access denied");
        setStatusColor("#ff4444");
      });
  };

  useEffect(() => {
    const handleResize = () => {
      if (soundPlayed) {
        setTimeout(positionVisualizer, 100);
      }
    };

    window.addEventListener("resize", handleResize);

    // Button pulse animation
    const pulseInterval = setInterval(() => {
      if (!soundPlayed && faceBtnRef.current) {
        faceBtnRef.current.style.transform = 'scale(1.02)';
        setTimeout(() => {
          if (faceBtnRef.current) {
            faceBtnRef.current.style.transform = 'scale(1)';
          }
        }, 500);
      }
    }, 2000);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearInterval(pulseInterval);
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [soundPlayed]);

  const handleMouseEnter = () => {
    if (faceBtnRef.current) {
      faceBtnRef.current.classList.add('animate-hover');
    }
  };

  const handleMouseLeave = () => {
    if (faceBtnRef.current) {
      faceBtnRef.current.classList.remove('animate-hover');
    }
  };

  const handleClick = () => {
    if (faceBtnRef.current) {
      faceBtnRef.current.classList.add('animate-click');
      setTimeout(() => {
        if (faceBtnRef.current) {
          faceBtnRef.current.classList.remove('animate-click');
        }
      }, 200);
    }
    onFirstClick();
  };

  return (
    <>
      <style>{`
        html,body { height:100%; margin:0; font-family:system-ui,Segoe UI,Roboto,Arial; background:linear-gradient(135deg, #667eea 0%, #764ba2 100%); }

        .wrap { height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:16px; padding:20px; box-sizing:border-box; }

        .frame-box { position:relative; width:100%; max-width:1100px; height:720px; border-radius:20px; overflow:hidden; box-shadow:0 20px 50px rgba(0,0,0,0.3); background:#fff; backdrop-filter:blur(10px); }

        iframe.app-frame { position:absolute; inset:0; width:100%; height:100%; border:0; }

        #clickOverlay { position: absolute; inset: 0; background: transparent; z-index: 50; cursor:pointer; }

        #status { margin-top: 15px; font-size:24px; font-weight:bold; color:#fff; text-shadow:0 2px 10px rgba(0,0,0,0.3); transition:all 0.3s ease; }

        .curtain { position:absolute; inset:0; background: linear-gradient(135deg, rgba(255,105,180,0.8) 0%, rgba(138,43,226,0.8) 100%); display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; gap:16px; pointer-events:none; backdrop-filter:blur(5px); }

        .fake-btn { padding:16px 32px; border-radius:50px; background:linear-gradient(135deg, #fff 0%, #f0f0f0 100%); color:#ff1493; font-size:1.8rem; font-weight:700; box-shadow:0 10px 25px rgba(0,0,0,0.2), 0 0 0 3px rgba(255,20,147,0.3); pointer-events:auto; user-select:none; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); cursor:pointer; position:relative; z-index:5; border:none; letter-spacing:1px; text-transform:uppercase; margin-top:47px; }

        .fake-btn.animate-hover { transform:scale(1.08) translateY(-2px); box-shadow:0 15px 35px rgba(0,0,0,0.3), 0 0 0 5px rgba(255,20,147,0.5); }
        .fake-btn.animate-click { transform:scale(0.95) translateY(1px); box-shadow:0 5px 15px rgba(0,0,0,0.2), 0 0 0 2px rgba(255,20,147,0.4); }

        .loader { border:8px solid rgba(255,255,255,0.3); border-top:8px solid #ff1493; border-radius:50%; width:80px; height:80px; animation:spin 1s linear infinite; display:none; }
        @keyframes spin {0%{transform:rotate(0deg);}100%{transform:rotate(360deg);} }

        .connected { font-size:2rem; font-weight:800; color:#fff; display:none; text-shadow:0 3px 10px rgba(0,0,0,0.5); animation:pulse 2s infinite;}
        @keyframes pulse {0%,100%{opacity:1;}50%{opacity:0.7;}}

        #circularVisualizer { 
          position:absolute; 
          z-index:10; 
          display:${soundPlayed ? 'block' : 'none'}; 
          filter:drop-shadow(0 0 20px rgba(255,20,147,0.6));
          animation:float 3s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform:translateY(0px); }
          50% { transform:translateY(-10px); }
        }

        .glow-ring {
          position:absolute;
          border:3px solid transparent;
          border-radius:50%;
          animation:rotate 4s linear infinite, glow 2s ease-in-out infinite alternate;
          display:${soundPlayed ? 'block' : 'none'};
        }

        @keyframes rotate {
          0% { transform:rotate(0deg); }
          100% { transform:rotate(360deg); }
        }

        @keyframes glow {
          0% { 
            border-color:rgba(255,20,147,0.3);
            box-shadow:0 0 20px rgba(255,20,147,0.3);
          }
          100% { 
            border-color:rgba(255,20,147,0.8);
            box-shadow:0 0 40px rgba(255,20,147,0.8);
          }
        }

        .particle {
          position:absolute;
          width:4px;
          height:4px;
          background:radial-gradient(circle, #ff1493, transparent);
          border-radius:50%;
          pointer-events:none;
        }

        @keyframes particle-float {
          0% { transform:translateY(0px) rotate(0deg); opacity:1; }
          100% { transform:translateY(-100px) rotate(360deg); opacity:0; }
        }
      `}</style>

      <div className="wrap">
        <button
          onClick={props.onBack}
          style={{
            position: 'fixed',
            top: 20,
            left: 20,
            padding: '12px 24px',
            background: 'linear-gradient(90deg, #00BCD3FF, #4525bc)',
            color: '#fff',
            border: 'none',
            borderRadius: 25,
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            zIndex: 1000
          }}
        >
          ← Back
        </button>
        <div className="frame-box">
          <iframe className="app-frame" src="https://app.sesame.com/" allow="microphone"></iframe>
          {!soundPlayed && (
            <div id="clickOverlay" onClick={handleClick}></div>
          )}
          <div ref={curtainRef} className="curtain">
            <canvas 
              ref={canvasRef}
              id="circularVisualizer"
            ></canvas>
            <div className="glow-ring" id="glowRing1" style={{animationDelay: '0s'}}></div>
            <div className="glow-ring" id="glowRing2" style={{animationDelay: '-2s'}}></div>
            <button 
              ref={faceBtnRef}
              className="fake-btn" 
              onClick={handleClick}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              {buttonText}
            </button>
            <div className="loader" id="loader"></div>
            <div className="connected" id="connectedText">Connected !!</div>
          </div>
        </div>
        <div id="status" style={{color: statusColor}}>{status}</div>
      </div>
    </>
  );
};

export default VoiceAI;
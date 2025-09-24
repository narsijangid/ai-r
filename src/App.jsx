
import { useState, useEffect } from 'react';
import Chat from './components/Chat';
import CountrySelect from './components/CountrySelect';
import './App.css';


function App() {

  const [selectedCountry, setSelectedCountry] = useState(() => {
    // Try to load from localStorage
    const saved = localStorage.getItem('selectedCountry');
    return saved ? JSON.parse(saved) : null;
  });
  const [showSidebar, setShowSidebar] = useState(false);

  useEffect(() => {
    if (selectedCountry) {
      localStorage.setItem('selectedCountry', JSON.stringify(selectedCountry));
    }
  }, [selectedCountry]);

  // Pass language to Chat as a prop (for future use)
  if (!selectedCountry) {
    return (
      <CountrySelect onSelect={setSelectedCountry} />
    );
  }

  return (
    <div className="app" style={{ position: 'relative', minHeight: '100vh' }}>
      {/* Settings Button */}
      <button
        onClick={() => setShowSidebar(true)}
        style={{
          position: 'fixed',
          top: 16,
          right: 20,
          zIndex: 1001,
          background: 'rgba(255,255,255,0.15)',
          border: 'none',
          borderRadius: '50%',
          width: 56,
          height: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          cursor: 'pointer',
          transition: 'background 0.2s',
        }}
        aria-label="Settings"
      >
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19.14,12.94c0-.32,0-.64,0-1s0-.68,0-1l2.11-1.65a.5.5,0,0,0,.12-.65l-2-3.46a.5.5,0,0,0-.61-.22l-2.49,1a7,7,0,0,0-1.7-1l-.38-2.65A.5.5,0,0,0,13,2H11a.5.5,0,0,0-.5.42l-.38,2.65a7,7,0,0,0-1.7,1l-2.49-1a.5.5,0,0,0-.61.22l-2,3.46a.5.5,0,0,0,.12.65L4.86,10c0,.32,0,.64,0,1s0,.68,0,1L2.75,13.65a.5.5,0,0,0-.12.65l2,3.46a.5.5,0,0,0,.61.22l2.49-1a7,7,0,0,0,1.7,1l.38,2.65A.5.5,0,0,0,11,22h2a.5.5,0,0,0,.5-.42l.38-2.65a7,7,0,0,0,1.7-1l2.49,1a.5.5,0,0,0,.61-.22l2-3.46a.5.5,0,0,0-.12-.65ZM12,15.5A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z" fill="#222"/>
        </svg>
      </button>

      {/* Sidebar */}
      {showSidebar && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            right: 0,
            width: 320,
            height: '100vh',
            background: 'linear-gradient(180deg, #fff 60%, #e0e7ff 100%)',
            boxShadow: '-4px 0 24px rgba(0,0,0,0.18)',
            zIndex: 2000,
            display: 'flex',
            flexDirection: 'column',
            padding: '32px 24px',
            animation: 'slideSidebar 0.3s cubic-bezier(.4,0,.2,1)',
            borderTopLeftRadius: 20,
            borderBottomLeftRadius: 20,
          // jusk
          }}
        >
          <button
            onClick={() => setShowSidebar(false)}
            style={{
              position: 'absolute',
              top: 18,
              right: 18,
              background: 'none',
              border: 'none',
              fontSize: 24,
              color: '#333',
              cursor: 'pointer',
            }}
            aria-label="Close Sidebar"
          >
            ×
          </button>
          <h3 style={{ marginTop: 32, marginBottom: 32, color: '#222', fontWeight: 700 }}>Settings</h3>
          <button
            onClick={() => {
              localStorage.clear();
              setSelectedCountry(null);
              setShowSidebar(false);
            }}
            style={{
              padding: '14px 0',
              background: 'linear-gradient(90deg, #00BCD3FF, #4525bc)',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontSize: 18,
              fontWeight: 600,
              cursor: 'pointer',
              marginBottom: 16,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}
          >
            Change Country
          </button>
          <button
            onClick={() => window.location.href = '/VoiceAI'}
            style={{
              padding: '14px 0',
              background: 'linear-gradient(90deg, #00BCD3FF, #4525bc)',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontSize: 18,
              fontWeight: 600,
              cursor: 'pointer',
              marginBottom: 16,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}
          >
            Voice AI
          </button>
          <div style={{ color: '#666', fontSize: 14, marginTop: 24, opacity: 0.7 }}>
            Changing country will clear your chat and preferences.
          </div>
        </div>
      )}

      {/* Main Chat */}
      <Chat language={selectedCountry.language} country={selectedCountry.code} />

      {/* Sidebar Animation */}
      <style>{`
        @keyframes slideSidebar {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default App

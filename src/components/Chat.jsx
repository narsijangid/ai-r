import { useState, useRef, useEffect } from 'react';

// Custom Notification Component
function Notification({ message, onClose }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onClose, 2000);
    return () => clearTimeout(timer);
  }, [message, onClose]);
  if (!message) return null;
  return (
    <div style={{
      position: 'fixed',
      top: 24,
      right: 24,
      zIndex: 3000,
      background: 'linear-gradient(90deg, #22c55e 60%, #16a34a 100%)',
      color: '#fff',
      padding: '16px 32px',
      borderRadius: 12,
      fontWeight: 600,
      fontSize: 16,
      boxShadow: '0 4px 24px rgba(34,197,94,0.18)',
      letterSpacing: 0.2,
      transition: 'opacity 0.3s',
      opacity: 1
    }}>
      {message}
    </div>
  );
}

const EMAILJS_SERVICE_ID = "service_8oa58ki";
const EMAILJS_TEMPLATE_ID = "template_lbq50ok";
const EMAILJS_PUBLIC_KEY = "bSGcuuCdrfFFDhVB4";

function Chat({ language = 'Hindi', country = 'IN' }) {
  const [notification, setNotification] = useState("");
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showDropdown, setShowDropdown] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportMessage, setReportMessage] = useState('');
  const [reportReason, setReportReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const chatMessagesRef = useRef(null);

  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Load EmailJS script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js';
    script.onload = () => {
      window.emailjs.init(EMAILJS_PUBLIC_KEY);
    };
    document.head.appendChild(script);
    return () => document.head.removeChild(script);
  }, []);

  const typeEffect = async (text) => {
    let displayText = '';
    for (let i = 0; i < text.length; i++) {
      displayText += text[i];
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1].content = displayText;
        return newMessages;
      });
      await new Promise(resolve => setTimeout(resolve, 20 + Math.random() * 30));
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setNotification('Message copied to clipboard!');
    } catch (err) {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setNotification('Message copied to clipboard!');
    }
    setShowDropdown(null);
  };

  const openReportModal = (message) => {
    setReportMessage(message);
    setShowReportModal(true);
    setShowDropdown(null);
  };

  const submitReport = async () => {
    if (!reportReason) {
      setNotification('Please select a reason for reporting.');
      return;
    }
    setIsSubmitting(true);
    try {
      await window.emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          to_email: 'narsijangidusa@gmail.com',
          report_reason: reportReason,
          reported_message: reportMessage,
          timestamp: new Date().toLocaleString(),
          user_agent: navigator.userAgent
        }
      );
      setNotification('Report submitted successfully!');
      setShowReportModal(false);
      setReportReason('');
      setReportMessage('');
    } catch (error) {
      console.error('Error sending report:', error);
      setNotification('Failed to submit report. Please try again.');
    }
    setIsSubmitting(false);
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = { type: 'user', content: inputMessage.trim(), id: Date.now() };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputMessage.trim();
    setInputMessage('');
    setIsTyping(true);

    try {
      const botMessage = { type: 'bot', content: '', id: Date.now() };
      setMessages(prev => [...prev, botMessage]);

      const response = await fetch("/.netlify/functions/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: currentInput })
      });

      const data = await response.json();
      setIsTyping(false);
      typeEffect(data.reply || "Sorry ji, response nahi aa raha.");
    } catch (err) {
      setIsTyping(false);
      setMessages(prev => [...prev, { type: 'bot', content: "Server error ji, thoda wait karo.", id: Date.now() }]);
      console.error("Chat Error:", err);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  };

  useEffect(() => {
    const handleClickOutside = () => setShowDropdown(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#0a0a0a',
      color: '#ffffff',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Header */}
      <div style={{
        padding: '15px 20px',
        background: 'linear-gradient(180deg, #00BCD3FF, rgb(69 37 188 / 77%) 100%)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{ position: 'relative' }}>
          <img 
            src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEg3xIL1RodzSzQkjl0qbz5o7VLYRQWUUHtIeGMJvl26k00YwyJu6xygHSz7RBKuvKtBoDst3FKK8Q8Ajux3UfCKigYnBlI_mA_42zUaGrYLhcuFaYnPz_VOCZTp80wl2LmPSH46C12SlD5VQV1Atl0t0uy3e_1xBDsxtttMFOjA_Ceycmr8CZ-ld1xuuGtM/s500/Untitled_design__1_-removebg-preview%20%282%29.png" 
            alt="profile" 
            style={{ width: '42px', height: '42px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)' }}
          />
          <div style={{ position: 'absolute', bottom: '2px', right: '2px', width: '12px', height: '12px', backgroundColor: '#4ade80', borderRadius: '50%', border: '2px solid #fff' }}></div>
        </div>
        <div>
          <div style={{ fontSize: '18px', fontWeight: '600', color: '#ffffff' }}>Perplix Ai</div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', marginTop: '2px' }}>Online</div>
        </div>
      </div>

      {/* Messages */}
      <div ref={chatMessagesRef} style={{ flex: 1, padding: '10px 15px', overflowY: 'auto', background: 'linear-gradient(180deg, #00BCD3FF, rgb(69 37 188 / 77%) 100%)', scrollBehavior: 'smooth' }}>
        {messages.map((message, index) => (
          <div key={message.id || index} style={{ margin: '8px 0', display: 'flex', justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start', alignItems: 'flex-start', animation: 'slideIn 0.3s ease-out' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', maxWidth: '85%', flexDirection: message.type === 'user' ? 'row-reverse' : 'row' }}>
              <div style={{
                padding: '12px 16px',
                borderRadius: message.type === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                background: message.type === 'user' ? 'linear-gradient(180deg, #00BCD3FF, rgb(69 37 188 / 77%) 100%)' : 'linear-gradient(135deg, #2d2d2d 0%, #3d3d3d 100%)',
                color: '#ffffff',
                fontSize: '15px',
                lineHeight: '1.4',
                wordWrap: 'break-word',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                position: 'relative',
                transition: 'all 0.2s ease'
              }}>
                {message.content}
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', marginTop: '4px', textAlign: 'right' }}>
                  {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                </div>
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div style={{ margin: '8px 0', display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{ maxWidth: '85%', padding: '12px 16px', borderRadius: '20px 20px 20px 4px', background: 'linear-gradient(135deg, #2d2d2d 0%, #3d3d3d 100%)', color: 'rgba(255,255,255,0.7)', fontSize: '14px', fontStyle: 'italic', boxShadow: '0 2px 8px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ display: 'flex', gap: '3px' }}>
                <div style={{ width: '6px', height: '6px', backgroundColor: '#667eea', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out' }}></div>
                <div style={{ width: '6px', height: '6px', backgroundColor: '#667eea', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out 0.2s' }}></div>
                <div style={{ width: '6px', height: '6px', backgroundColor: '#667eea', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out 0.4s' }}></div>
              </div>
              Sakshi is typing...
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{ padding: '15px 20px', background: 'rgba(26, 26, 26, 0.95)', backdropFilter: 'blur(10px)', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '12px', alignItems: 'flex-end', position: 'relative' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            style={{ width: '100%', padding: '14px 20px', border: 'none', borderRadius: '25px', fontSize: '16px', backgroundColor: 'rgba(45, 45, 45, 0.8)', color: '#ffffff', outline: 'none', boxSizing: 'border-box', transition: 'all 0.2s ease' }}
          />
        </div>
        <button onClick={sendMessage} style={{ background: 'linear-gradient(180deg, #00BCD3FF, rgb(69 37 188 / 77%) 100%)', padding: '12px 20px', borderRadius: '50%', border: 'none', cursor: 'pointer', color: '#fff', fontWeight: '600', fontSize: '16px' }}>
          Send
        </button>
      </div>

      <Notification message={notification} onClose={() => setNotification("")} />

      <style jsx>{`
        @keyframes slideIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }
        input::placeholder { color: rgba(255, 255, 255, 0.5); }
        div::-webkit-scrollbar { width: 4px; }
        div::-webkit-scrollbar-track { background: transparent; }
        div::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 2px; }
        div::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.3); }
      `}</style>
    </div>
  );
}

export default Chat;

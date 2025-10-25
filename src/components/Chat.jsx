import { useState, useRef, useEffect } from 'react';
import OpenAI from 'openai';

// Initialize OpenRouter AI
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: "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",
  defaultHeaders: {
    "HTTP-Referer": window.location.origin,
    "X-Title": "Perplix Ai",
  },
});

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
        "service_8oa58ki",
        "template_lbq50ok",
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

    const userMessage = {
      type: 'user',
      content: inputMessage.trim(),
      id: Date.now()
    };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputMessage.trim();
    setInputMessage('');
    setIsTyping(true);

    try {
      const botMessage = { type: 'bot', content: '', id: Date.now() };
      setMessages(prev => [...prev, botMessage]);

      // Prepare prompt based on language/country
      let prompt = '';
      if (country === 'IN' && language === 'Hindi') {
        prompt = `You are Sakshi, a respectful young woman from India. Chat in Hindi using romanized letters with polite suffixes like "ji". Respond naturally to inappropriate requests with rejections. User message: ${currentInput}`;
      } else {
        prompt = `You are a helpful AI assistant. Respond in ${language}. User message: ${currentInput}`;
      }

      const completion = await openai.chat.completions.create({
        model: "anthropic/claude-3.7-sonnet",
        messages: [{ role: "user", content: [{ type: "text", text: prompt }] }],
      });

      const botResponse = completion.choices?.[0]?.message?.content?.[0]?.text || "Sorry ji, response nahi aa raha.";
      setIsTyping(false);
      typeEffect(botResponse);
    } catch (err) {
      setIsTyping(false);
      let errorMsg = "Sorry ji, abhi kuch problem aa rahi hai. Thoda wait karo ji.";
      if (err.name === "AbortError") errorMsg = "Sorry ji, time out ho gaya - internet check karo ji";
      setMessages(prev => [...prev, { type: 'bot', content: errorMsg, id: Date.now() }]);
      console.error("Sakshi Chatbot Error:", err);
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
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#0a0a0a', color: '#ffffff', overflow: 'hidden', position: 'relative' }}>
      {/* Header */}
      {/* ... keep all your header, messages container, input, dropdown, and report modal as is ... */}

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

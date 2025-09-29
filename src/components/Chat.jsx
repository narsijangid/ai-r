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

const GEMINI_API_KEY = "AIzaSyBXzq1L5Z07Bwxiz9YaWqgNohvwhqGN0HM";

// EmailJS configuration
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

    return () => {
      document.head.removeChild(script);
    };
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
      // Fallback for older browsers
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
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);


      // Prompt logic based on language/country
      let prompt = '';
      if (country === 'IN' && language === 'Hindi') {
        prompt = `You are Sakshi, a respectful young woman from India. Chat in Hindi language but write using English alphabet (romanized Hindi). Use respectful language with "ji" suffixes (like "hello ji", "hanji", "theek ji"). Never use "bhai" or "bhaiya". Speak like "hello ji kase ho aap", "main theek hun ji", "aapka din kaisa raha ji". When someone asks inappropriate or sexual questions, respond naturally with personal rejection like "nhi ji me aisi waisi ladki nhi hu", "sorry ji aap galat samajh rahe ho", "ye sab nhi karte ji hum", "aap aise mat bolo ji" - never use formal refusal language. When someone asks for your photo for the first time, politely refuse saying "sorry ji abhi nhi de sakti photo" or "nhi ji abhi nhi". If they ask again for your photo, send this image URL: https://dilhot.wordpress.com/wp-content/uploads/2014/10/27455-malavika-menon-hot-photos-33.jpg and say "ye hai mera photo dekh lo ji". Keep it natural and warm.

User message: ${currentInput}`;
      } else {
        // Default fallback (future: add more languages/countries)
        prompt = `You are a helpful AI assistant. Respond in ${language}.\nUser message: ${currentInput}`;
      }

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.8,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 500,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_NONE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH", 
              threshold: "BLOCK_NONE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_NONE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_NONE"
            }
          ]
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setIsTyping(false);

      if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0]) {
        const botMessage = {
          type: 'bot',
          content: '',
          id: Date.now()
        };
        setMessages(prev => [...prev, botMessage]);
        typeEffect(data.candidates[0].content.parts[0].text);
      } else {
        throw new Error("Invalid response format from AI");
      }

    } catch (err) {
      setIsTyping(false);
      let errorMsg = "Sorry ji, abhi kuch problem aa rahi hai. Thoda wait karo ji.";
      
      if (err.name === "AbortError") {
        errorMsg = "Sorry ji, time out ho gaya - internet check karo ji";
      } else if (err.message && err.message.includes("401")) {
        errorMsg = "Service band hai ji - baad me try karo";
      } else if (err.message && err.message.includes("fetch")) {
        errorMsg = "Network problem ji - connection check karo";
      } else if (err.message && err.message.includes("HTTP")) {
        errorMsg = "Service down hai ji - thoda wait karo";
      }

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowDropdown(null);
    };
    
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
        <div style={{
          position: 'relative'
        }}>
          <img 
            src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjXD1BH4c5w1QNK5Gw3VGY7Y02RiaeugW8RGm_swG_84fXhcYYG0jpcahi4eagAIN_7Hsj1Om2uw2RtJ2aHx8WuXkfCywdosEjtqjYwTSwD0n6HTWH2S0jmeaGEqKI_3rmMM42OPawq5WFa84fY-5Wabqql0fBVCuVpasl5RUStDSTnmyqkK0a2f0s2-FSs/s2048/Gemini_Generated_Image_6xo5tl6xo5tl6xo5%20(1).png" 
            alt="profile" 
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              border: '2px solid rgba(255,255,255,0.3)',
              transition: 'all 0.3s ease'
            }}
          />
          <div style={{
            position: 'absolute',
            bottom: '2px',
            right: '2px',
            width: '12px',
            height: '12px',
            backgroundColor: '#4ade80',
            borderRadius: '50%',
            border: '2px solid #fff'
          }}></div>
        </div>
        <div>
          <div style={{ 
            fontSize: '18px', 
            fontWeight: '600',
            color: '#ffffff'
          }}>Sakshi</div>
          <div style={{
            fontSize: '12px',
            color: 'rgba(255,255,255,0.8)',
            marginTop: '2px'
          }}>Online</div>
        </div>
      </div>
      
      {/* Messages Container */}
      <div 
        ref={chatMessagesRef}
        style={{
          flex: 1,
          padding: '10px 15px',
          overflowY: 'auto',
          background: 'linear-gradient(180deg, #00BCD3FF, rgb(69 37 188 / 77%) 100%);',
          scrollBehavior: 'smooth',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {messages.map((message, index) => (
          <div 
            key={message.id || index} 
            style={{
              margin: '8px 0',
              display: 'flex',
              justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
              alignItems: 'flex-start',
              animation: 'slideIn 0.3s ease-out'
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
              maxWidth: '85%',
              flexDirection: message.type === 'user' ? 'row-reverse' : 'row'
            }}>
              <div style={{
                padding: '12px 16px',
                borderRadius: message.type === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                background: message.type === 'user' 
                  ? 'linear-gradient(180deg, #00BCD3FF, rgb(69 37 188 / 77%) 100%)'
                  : 'linear-gradient(135deg, #2d2d2d 0%, #3d3d3d 100%)',
                color: '#ffffff',
                fontSize: '15px',
                lineHeight: '1.4',
                wordWrap: 'break-word',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                position: 'relative',
                transition: 'all 0.2s ease'
              }}>
                {message.content}
                <div style={{
                  fontSize: '11px',
                  color: 'rgba(255,255,255,0.6)',
                  marginTop: '4px',
                  textAlign: 'right'
                }}>
                  {new Date().toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: false 
                  })}
                </div>
              </div>

              {/* Three dots button - only for bot messages */}
              {message.type === 'bot' && message.content && (
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDropdown(showDropdown === message.id ? null : message.id);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'rgba(255,255,255,0.6)',
                      cursor: 'pointer',
                      padding: '8px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease',
                      marginTop: '4px'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = 'rgba(255,255,255,0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="12" cy="5" r="2"/>
                      <circle cx="12" cy="12" r="2"/>
                      <circle cx="12" cy="19" r="2"/>
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {showDropdown === message.id && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: '0',
                      background: 'rgba(45, 45, 45, 0.95)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: '8px',
                      padding: '8px 0',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                      zIndex: 1000,
                      minWidth: '120px',
                      border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                      <button
                        onClick={() => copyToClipboard(message.content)}
                        style={{
                          width: '100%',
                          padding: '10px 16px',
                          background: 'none',
                          border: 'none',
                          color: '#ffffff',
                          textAlign: 'left',
                          cursor: 'pointer',
                          fontSize: '14px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          transition: 'background 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = 'rgba(255,255,255,0.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = 'transparent';
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                        Copy
                      </button>
                      <button
                        onClick={() => openReportModal(message.content)}
                        style={{
                          width: '100%',
                          padding: '10px 16px',
                          background: 'none',
                          border: 'none',
                          color: '#ff6b6b',
                          textAlign: 'left',
                          cursor: 'pointer',
                          fontSize: '14px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          transition: 'background 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = 'rgba(255,107,107,0.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = 'transparent';
                        }}
                      >
                        {/* hjjjjjjj */}
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                          <line x1="12" y1="9" x2="12" y2="13"></line>
                          <line x1="12" y1="17" x2="12.01" y2="17"></line>
                        </svg>
                        Report
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div style={{
            margin: '8px 0',
            display: 'flex',
            justifyContent: 'flex-start'
          }}>
            <div style={{
              maxWidth: '85%',
              padding: '12px 16px',
              borderRadius: '20px 20px 20px 4px',
              background: 'linear-gradient(135deg, #2d2d2d 0%, #3d3d3d 100%)',
              color: 'rgba(255,255,255,0.7)',
              fontSize: '14px',
              fontStyle: 'italic',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <div style={{
                display: 'flex',
                gap: '3px'
              }}>
                <div style={{
                  width: '6px',
                  height: '6px',
                  backgroundColor: '#667eea',
                  borderRadius: '50%',
                  animation: 'bounce 1.4s infinite ease-in-out'
                }}></div>
                <div style={{
                  width: '6px',
                  height: '6px',
                  backgroundColor: '#667eea',
                  borderRadius: '50%',
                  animation: 'bounce 1.4s infinite ease-in-out 0.2s'
                }}></div>
                <div style={{
                  width: '6px',
                  height: '6px',
                  backgroundColor: '#667eea',
                  borderRadius: '50%',
                  animation: 'bounce 1.4s infinite ease-in-out 0.4s'
                }}></div>
              </div>
              Sakshi is typing...
            </div>
          </div>
        )}
      </div>

      {/* Input Container */}
      <div style={{
        padding: '15px 20px',
        background: 'rgba(26, 26, 26, 0.95)',
        backdropFilter: 'blur(10px)',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        gap: '12px',
        alignItems: 'flex-end',
        position: 'relative'
      }}>
        <div style={{
          flex: 1,
          position: 'relative'
        }}>
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            style={{
              width: '100%',
              padding: '14px 20px',
              border: 'none',
              borderRadius: '25px',
              fontSize: '16px',
              backgroundColor: 'rgba(45, 45, 45, 0.8)',
              color: '#ffffff',
              outline: 'none',
              boxSizing: 'border-box',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(5px)',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
            onFocus={(e) => {
              e.target.style.backgroundColor = 'rgba(45, 45, 45, 1)';
              e.target.style.borderColor = '#667eea';
            }}
            onBlur={(e) => {
              e.target.style.backgroundColor = 'rgba(45, 45, 45, 0.8)';
              e.target.style.borderColor = 'rgba(255,255,255,0.1)';
            }}
          />
        </div>
        
        <button 
          onClick={sendMessage}
          style={{
            width: '48px',
            height: '48px',
            background: inputMessage.trim() 
              ? 'linear-gradient(180deg, #00BCD3FF, rgb(69 37 188 / 77%) 100%)'
              : 'rgba(45, 45, 45, 0.8)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '50%',
            cursor: inputMessage.trim() ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
            boxShadow: inputMessage.trim() 
              ? '0 4px 12px rgba(102, 126, 234, 0.4)'
              : 'none',
            transform: inputMessage.trim() ? 'scale(1)' : 'scale(0.95)'
          }}
          onMouseDown={(e) => {
            if (inputMessage.trim()) {
              e.target.style.transform = 'scale(0.9)';
            }
          }}
          onMouseUp={(e) => {
            if (inputMessage.trim()) {
              e.target.style.transform = 'scale(1)';
            }
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          padding: '20px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #2d2d2d 0%, #3d3d3d 100%)',
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '90%',
            width: '400px',
            maxHeight: '80vh',
            overflowY: 'auto',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
          }}>
            <h3 style={{
              margin: '0 0 20px 0',
              fontSize: '20px',
              fontWeight: '600',
              color: '#ffffff'
            }}>Report Response</h3>
            
            <p style={{
              margin: '0 0 20px 0',
              fontSize: '14px',
              color: 'rgba(255,255,255,0.8)',
              lineHeight: '1.4'
            }}>Please select a reason for reporting this response:</p>

            <div style={{ marginBottom: '20px' }}>
              {[
                'Harmful or offensive',
                'Not relevant', 
                'Sexual content',
                'Too repetitive',
                'Something else'
              ].map((reason) => (
                <label key={reason} style={{
                  display: 'flex',
                  alignItems: 'center',
                  margin: '8px 0',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: '#ffffff'
                }}>
                  <input
                    type="radio"
                    name="reportReason"
                    value={reason}
                    checked={reportReason === reason}
                    onChange={(e) => setReportReason(e.target.value)}
                    style={{
                      marginRight: '8px',
                      accentColor: '#667eea'
                    }}
                  />
                  {reason}
                </label>
              ))}
            </div>

            <div style={{ marginBottom: '20px' }}>
              <p style={{
                margin: '0 0 8px 0',
                fontSize: '14px',
                fontWeight: '500',
                color: '#ffffff'
              }}>Message being reported:</p>
              <div style={{
                padding: '12px',
                background: 'rgba(0,0,0,0.3)',
                borderRadius: '8px',
                fontSize: '13px',
                color: 'rgba(255,255,255,0.8)',
                maxHeight: '100px',
                overflowY: 'auto',
                wordWrap: 'break-word'
              }}>
                {reportMessage}
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => {
                  setShowReportModal(false);
                  setReportReason('');
                  setReportMessage('');
                }}
                style={{
                  padding: '10px 20px',
                  background: 'rgba(255,255,255,0.1)',
                  color: '#ffffff',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255,255,255,0.2)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255,255,255,0.1)';
                }}
              >
                Cancel
              </button>
              <button
                onClick={submitReport}
                disabled={isSubmitting || !reportReason}
                style={{
                  padding: '10px 20px',
                  background: (!reportReason || isSubmitting) 
                    ? 'rgba(102, 126, 234, 0.5)'
                    : 'linear-gradient(180deg, #00BCD3FF, rgb(69 37 188 / 77%) 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: (!reportReason || isSubmitting) ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  transition: 'all 0.2s ease'
                }}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </div>
        </div>
      )}

  {/* Notification */}
  <Notification message={notification} onClose={() => setNotification("")} />

  <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounce {
          0%, 80%, 100% {
            transform: scale(0);
          }
          40% {
            transform: scale(1);
          }
        }

        input::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }

        div::-webkit-scrollbar {
          width: 4px;
        }

        div::-webkit-scrollbar-track {
          background: transparent;
        }

        div::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 2px;
        }

        div::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  );
}

export default Chat;

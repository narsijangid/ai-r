import { useState, useRef, useEffect } from 'react';
import './Chat.css';

const API_KEY = "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";

function Chat() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatMessagesRef = useRef(null);

  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const cleanResponse = (text) => {
    // Keep Hindi characters and basic punctuation
    return text
      .replace(/[^\u0900-\u097Fa-zA-Z\s.,!?]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const typeEffect = async (text) => {
    const cleanedText = text;
    let displayText = '';
    
    for (let i = 0; i < cleanedText.length; i++) {
      displayText += cleanedText[i];
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1].content = displayText;
        return newMessages;
      });
      await new Promise(resolve => setTimeout(resolve, 30 + Math.random() * 50));
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      type: 'user',
      content: inputMessage.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": window.location.origin,
          "X-Title": "Sakshi Chatbot Demo"
        },
        body: JSON.stringify({
          model: "anthropic/claude-3.5-sonnet",
          messages: [
            {
              role: "system",
              content: "You are Sakshi, a respectful young woman from India. Chat in Hindi language but write using English alphabet (romanized Hindi). Use respectful language with \"ji\" suffixes (like \"hello ji\", \"hanji\", \"theek ji\"). Never use \"bhai\" or \"bhaiya\". Speak like \"hello ji kase ho aap\", \"main theek hun ji\", \"aapka din kaisa raha ji\". When someone asks inappropriate or sexual questions, respond naturally with personal rejection like \"nhi ji me aisi waisi ladki nhi hu\", \"sorry ji aap galat samajh rahe ho\", \"ye sab nhi karte ji hum\", \"aap aise mat bolo ji\" - never use formal refusal language. When someone asks for your photo for the first time, politely refuse saying \"sorry ji abhi nhi de sakti photo\" or \"nhi ji abhi nhi\". If they ask again for your photo, send this image URL: https://dilhot.wordpress.com/wp-content/uploads/2014/10/27455-malavika-menon-hot-photos-33.jpg and say \"ye hai mera photo dekh lo ji\". Keep it natural and warm."
            },
            { role: "user", content: inputMessage }
          ],
          max_tokens: 500,
          temperature: 0.8
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setIsTyping(false);

      if (data.choices && data.choices[0] && data.choices[0].message) {
        const botMessage = {
          type: 'bot',
          content: ''
        };
        setMessages(prev => [...prev, botMessage]);
        typeEffect(data.choices[0].message.content);
      } else {
        throw new Error("Invalid response format from AI");
      }

    } catch (err) {
      setIsTyping(false);
      let errorMsg = "Sorry, I'm having trouble connecting right now. Please try again.";
      
      if (err.name === "AbortError") {
        errorMsg = "Request timed out - please check your internet connection";
      } else if (err.message && err.message.includes("401")) {
        errorMsg = "Service temporarily unavailable - please try again later";
      } else if (err.message && err.message.includes("fetch")) {
        errorMsg = "Network issue detected - please check your connection";
      } else if (err.message && err.message.includes("HTTP")) {
        errorMsg = "Service is temporarily down - please try again in a moment";
      }

      setMessages(prev => [...prev, { type: 'bot', content: errorMsg }]);
      console.error("Sakshi Chatbot Error:", err);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <img src="https://i.pravatar.cc/150?img=47" alt="profile" />
        <span>Sakshi</span>
      </div>
      
      <div className="chat-messages" ref={chatMessagesRef}>
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.type}`}>
            {message.content}
          </div>
        ))}
        {isTyping && (
          <div className="message bot">
            <span className="typing">Sakshi is typing...</span>
          </div>
        )}
      </div>

      <div className="chat-input">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default Chat;

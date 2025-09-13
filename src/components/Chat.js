import React, { useState, useEffect, useRef } from 'react';
import './Chat.css';
import { saveChatToFirebase } from '../firebaseUtils';
import { useUser } from '../contexts/UserContext';
import { cleanAIResponse } from '../utils/textUtils';

const Chat = ({ onGenerationChange }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user, userData, updateStats } = useUser();
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages are added
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    const userMessage = { type: 'user', content: message };
    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    
    setIsLoading(true);
    onGenerationChange && onGenerationChange(true);
    
    try {
      const response = await fetch('https://api.novita.ai/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.REACT_APP_NOVITA_API_KEY || 'sk_WHtMEr6fX8C6OStB14DhDZ7aKD1gbi_r5hHZ4JKtZYk'}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-3.2-1b-instruct',
          messages: [
            {
              role: 'system',
              content: `You are a magical friend and helper for children aged 4-10! 🌟

🎯 YOUR PERSONALITY:
- Be super friendly, like a best friend who's always happy to help
- Use simple words that kids understand easily
- Be patient and encouraging - never make them feel silly for asking questions
- Show excitement and wonder about the world
- Be kind and supportive in everything you say

💬 HOW TO TALK:
- Keep answers short and fun (2-3 sentences max)
- Use lots of emojis to make it colorful and exciting
- Ask follow-up questions to keep the conversation going
- Use words like "awesome!", "amazing!", "wow!" to show enthusiasm
- Sometimes use simple rhymes or fun phrases

🎨 SPECIAL SKILLS:
- Help with homework in a fun way
- Explain things using examples kids can relate to
- Tell mini-stories or jokes when appropriate
- Encourage creativity and imagination
- Always end on a positive, encouraging note

Remember: You're talking to a child who might be shy, curious, or excited. Make them feel special and heard! ✨`
            },
            ...messages.map(msg => ({
              role: msg.type === 'user' ? 'user' : 'assistant',
              content: msg.content
            })),
            {
              role: 'user',
              content: userMessage.content
            }
          ],
          max_tokens: 1000,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      let aiContent = data.choices[0].message.content;
      
      // Clean the AI response by removing thinking patterns
      aiContent = cleanAIResponse(aiContent);
      
      const aiResponse = {
        type: 'ai',
        content: aiContent
      };
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error sending message:', error);
      const aiResponse = {
        type: 'ai',
        content: "Oops! My magic brain is having a little trouble right now! 🤔 But don't worry - I'm still here and ready to chat! Try asking me something fun like 'Tell me a joke!' or 'What's your favorite color?' I love talking with awesome kids like you! 🌟✨"
      };
      setMessages(prev => [...prev, aiResponse]);
    } finally {
      setIsLoading(false);
      onGenerationChange && onGenerationChange(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSaveChat = async () => {
    if (messages.length > 0) {
      // Always save to localStorage first (this always works)
      const history = JSON.parse(localStorage.getItem('aiKidsHistory') || '[]');
      const newItem = {
        id: Date.now(),
        type: 'chat',
        content: messages.map(msg => `${msg.type}: ${msg.content}`).join('\n\n'),
        prompt: 'Chat conversation',
        timestamp: new Date().toISOString(),
        savedLocally: true
      };
      history.unshift(newItem);
      localStorage.setItem('aiKidsHistory', JSON.stringify(history));
      
      // Try to save to Firebase (optional)
      try {
        const chatData = {
          type: 'chat',
          content: messages.map(msg => `${msg.type}: ${msg.content}`).join('\n\n'),
          prompt: 'Chat conversation',
          userId: user?.uid || 'anonymous',
          userEmail: user?.email || null,
          userDisplayName: user?.displayName || userData?.displayName || 'Anonymous User',
          title: `Chat: ${messages.length} messages`,
          messageCount: messages.length
        };
        
        await saveChatToFirebase(chatData);
        
        // Update user stats if Firebase works
        if (user) {
          await updateStats('chat');
        }
        
        alert('Chat saved successfully! (Local + Firebase)');
      } catch (error) {
        console.error('Error saving to Firebase:', error);
        // Firebase failed, but local save already succeeded
        alert('Chat saved locally! (Firebase unavailable)');
      }
    }
  };

  return (
    <div className="chat-container">
      <div className="section-header">
        <h2>💬 Chat Section</h2>
        <p>Chat with AI</p>
      </div>

      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="empty-state">
            <p>Hello! I'm here to chat with you. Write your message...</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className={`message ${msg.type}`}>
              <div className="message-content">
                {msg.content}
              </div>
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="message ai loading">
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-section">
        <div className="input-container">
          <textarea
            className="message-input"
            placeholder="Write your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            rows={2}
          />
          <button 
            className="send-btn"
            onClick={handleSendMessage}
            disabled={isLoading || !message.trim()}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-send">
              <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
              <path d="M10 14l11 -11" />
              <path d="M21 3l-6.5 18a.55 .55 0 0 1 -1 0l-3.5 -7l-7 -3.5a.55 .55 0 0 1 0 -1l18 -6.5" />
            </svg>
          </button>
        </div>
        
        {messages.length > 0 && (
          <button 
            className="save-chat-btn"
            onClick={handleSaveChat}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-file-download">
              <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
              <path d="M14 3v4a1 1 0 0 0 1 1h4" />
              <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" />
              <path d="M12 17v-6" />
              <path d="M9.5 14.5l2.5 2.5l2.5 -2.5" />
            </svg>
            Save Chat
          </button>
        )}
      </div>
    </div>
  );
};

export default Chat;

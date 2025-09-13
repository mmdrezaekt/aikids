import React, { useState } from 'react';
import './Story.css';
import { saveStoryToFirebase } from '../firebaseUtils';
import { useUser } from '../contexts/UserContext';
import { cleanAIResponse } from '../utils/textUtils';

const Story = ({ onGenerationChange }) => {
  const [prompt, setPrompt] = useState('');
  const [generatedStory, setGeneratedStory] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [storyLength, setStoryLength] = useState('medium');
  const { user, userData, updateStats } = useUser();

  const handleGenerateStory = async () => {
    if (!prompt.trim()) return;
    
    // Reset previous story
    setGeneratedStory('');
    setIsLoading(true);
    onGenerationChange && onGenerationChange(true);
    
    try {
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
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
              content: `You are a magical storyteller who creates wonderful adventures for children aged 4-10. Your stories should be:

🎭 CHARACTERISTICS:
- Use simple, clear words that kids understand
- Include fun characters like animals, fairies, or friendly monsters
- Add magical elements and adventures
- Teach good values like kindness, friendship, and courage
- Make it exciting but never scary
- Use lots of descriptive words to paint pictures in their minds

📚 STORY STRUCTURE:
${storyLength === 'short' ? 'Write a SHORT story with EXACTLY 2 paragraphs. Each paragraph must have EXACTLY 5 lines. Keep it simple and sweet like a bedtime story.' : 
  storyLength === 'medium' ? 'Write a MEDIUM story with EXACTLY 5 paragraphs. Each paragraph must have EXACTLY 5 lines. Include fun characters, a little adventure, and a happy ending.' : 
  'Write a LONG story with EXACTLY 10 paragraphs. Each paragraph must have EXACTLY 5 lines. Create an exciting adventure with multiple characters, challenges, and a wonderful ending.'}

✨ SPECIAL RULES:
- Always start with "Once upon a time" 
- Always end with "The end."
- Use emojis occasionally to make it more fun
- Include dialogue between characters
- Make the main character brave and kind
- Add some humor that kids will giggle at`
            },
            {
              role: 'user',
              content: `Create an amazing adventure story about: "${prompt}". 

Make it magical and exciting! Include:
🌟 A brave main character who learns something important
🎪 Fun adventures and challenges to overcome  
👫 Friendly characters who help along the way
💫 Magical elements that make kids' eyes sparkle
😊 A happy ending that makes everyone smile

Remember: This story will be read by children who love adventure and magic!`
            }
          ],
          max_tokens: storyLength === 'short' ? 500 : storyLength === 'medium' ? 1000 : 2000,
          temperature: 0.8
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response:', data);
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid API response structure');
      }
      
      let generatedStory = data.choices[0].message.content;
      console.log('Generated Story:', generatedStory);
      
      if (!generatedStory || generatedStory.trim() === '') {
        throw new Error('Empty story generated');
      }
      
      // Clean the story by removing thinking patterns
      generatedStory = cleanAIResponse(generatedStory);
      
      setGeneratedStory(generatedStory);
    } catch (error) {
      console.error('Error generating story:', error);
      
      let errorMessage = '';
      if (error.name === 'AbortError') {
        errorMessage = 'Story generation timed out. Please try again.';
      } else if (error.message.includes('API request failed')) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.message.includes('Invalid API response')) {
        errorMessage = 'Invalid response from server. Please try again.';
      } else if (error.message.includes('Empty story generated')) {
        errorMessage = 'No story was generated. Please try with a different prompt.';
      } else {
        errorMessage = 'Something went wrong. Please try again.';
      }
      
      setGeneratedStory(`Oops! Something went wrong while creating your story. 😅 But don't worry! Here's a special story just for you:

Once upon a time, there was a wonderful ${prompt.toLowerCase()} who lived in a magical world full of adventures and fun! 🌟 This ${prompt.toLowerCase()} was the bravest and kindest in all the land, and every day brought new exciting adventures. All the other creatures loved playing with this amazing ${prompt.toLowerCase()}, and they all lived happily ever after! ✨

The end. 

(Don't worry, you can try again anytime! The magic will work next time! 🪄)`);
    } finally {
      setIsLoading(false);
      onGenerationChange && onGenerationChange(false);
    }
  };

  const handleSaveStory = async () => {
    if (generatedStory) {
      try {
        const storyData = {
          type: 'story',
          content: generatedStory,
          prompt: prompt,
          userId: user?.uid || 'anonymous',
          userEmail: user?.email || null,
          userDisplayName: user?.displayName || userData?.displayName || 'Anonymous User',
          title: `Story: ${prompt.substring(0, 50)}...`
        };
        
        await saveStoryToFirebase(storyData);
        
        // Update user stats
        if (user) {
          await updateStats('story');
        }
        
        // Also save to localStorage for immediate display
        const history = JSON.parse(localStorage.getItem('aiKidsHistory') || '[]');
        const newItem = {
          id: Date.now(),
          type: 'story',
          content: generatedStory,
          prompt: prompt,
          timestamp: new Date().toISOString()
        };
        history.unshift(newItem);
        localStorage.setItem('aiKidsHistory', JSON.stringify(history));
        
        alert('Story saved to Firebase and local history!');
      } catch (error) {
        console.error('Error saving story:', error);
        alert('Failed to save story to Firebase, but saved locally.');
      }
    }
  };

  const handleCopyStory = async () => {
    if (generatedStory) {
      // Always show the modal for mobile compatibility
      showCopyModal();
    }
  };

  const showCopyModal = () => {
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.9);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 10px;
      box-sizing: border-box;
    `;
    
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
      background: white;
      padding: 20px;
      border-radius: 16px;
      width: 100%;
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
      position: relative;
      box-shadow: 0 20px 40px rgba(0,0,0,0.5);
    `;
    
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '✕';
    closeBtn.style.cssText = `
      position: absolute;
      top: 15px;
      right: 15px;
      background: #ef4444;
      color: white;
      border: none;
      border-radius: 50%;
      width: 35px;
      height: 35px;
      cursor: pointer;
      font-size: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10001;
    `;
    
    const title = document.createElement('h3');
    title.textContent = '📋 Copy Your Story';
    title.style.cssText = `
      margin: 0 0 20px 0;
      color: #1f2937;
      font-size: 20px;
      text-align: center;
      font-weight: 600;
    `;
    
    const instruction = document.createElement('div');
    instruction.innerHTML = `
      <p style="margin: 0 0 15px 0; color: #666; font-size: 14px; text-align: center;">
        📱 <strong>For Mobile:</strong> Long press on the text below and select "Copy"
      </p>
      <p style="margin: 0 0 15px 0; color: #666; font-size: 14px; text-align: center;">
        💻 <strong>For Desktop:</strong> Select all text (Ctrl+A) and copy (Ctrl+C)
      </p>
    `;
    
    const textDisplay = document.createElement('textarea');
    textDisplay.value = generatedStory;
    textDisplay.style.cssText = `
      width: 100%;
      height: 250px;
      padding: 20px;
      border: 2px solid #e5e7eb;
      border-radius: 12px;
      font-family: inherit;
      font-size: 16px;
      line-height: 1.5;
      resize: vertical;
      margin-bottom: 20px;
      box-sizing: border-box;
      background: #f9fafb;
    `;
    
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
      display: flex;
      gap: 10px;
      flex-direction: column;
    `;
    
    const selectAllBtn = document.createElement('button');
    selectAllBtn.textContent = '📋 Select All Text';
    selectAllBtn.style.cssText = `
      width: 100%;
      padding: 15px;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    `;
    
    const copyBtn = document.createElement('button');
    copyBtn.textContent = '📋 Copy to Clipboard';
    copyBtn.style.cssText = `
      width: 100%;
      padding: 15px;
      background: #10b981;
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    `;
    
    const closeModalBtn = document.createElement('button');
    closeModalBtn.textContent = '❌ Close';
    closeModalBtn.style.cssText = `
      width: 100%;
      padding: 12px;
      background: #6b7280;
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    `;
    
    selectAllBtn.onclick = () => {
      textDisplay.focus();
      textDisplay.select();
      selectAllBtn.textContent = '✅ Text Selected!';
      selectAllBtn.style.background = '#1d4ed8';
      setTimeout(() => {
        selectAllBtn.textContent = '📋 Select All Text';
        selectAllBtn.style.background = '#3b82f6';
      }, 2000);
    };
    
    copyBtn.onclick = async () => {
      try {
        // Try modern clipboard API first
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(generatedStory);
          copyBtn.textContent = '✅ Copied Successfully!';
          copyBtn.style.background = '#059669';
          setTimeout(() => {
            copyBtn.textContent = '📋 Copy to Clipboard';
            copyBtn.style.background = '#10b981';
          }, 3000);
        } else {
          // Fallback for older browsers
          textDisplay.select();
          textDisplay.setSelectionRange(0, 99999);
          const successful = document.execCommand('copy');
          if (successful) {
            copyBtn.textContent = '✅ Copied Successfully!';
            copyBtn.style.background = '#059669';
            setTimeout(() => {
              copyBtn.textContent = '📋 Copy to Clipboard';
              copyBtn.style.background = '#10b981';
            }, 3000);
          } else {
            copyBtn.textContent = '⚠️ Please Copy Manually';
            copyBtn.style.background = '#f59e0b';
            setTimeout(() => {
              copyBtn.textContent = '📋 Copy to Clipboard';
              copyBtn.style.background = '#10b981';
            }, 3000);
          }
        }
      } catch (err) {
        copyBtn.textContent = '⚠️ Please Copy Manually';
        copyBtn.style.background = '#f59e0b';
        setTimeout(() => {
          copyBtn.textContent = '📋 Copy to Clipboard';
          copyBtn.style.background = '#10b981';
        }, 3000);
      }
    };
    
    const closeModal = () => {
      document.body.removeChild(modal);
    };
    
    closeBtn.onclick = closeModal;
    closeModalBtn.onclick = closeModal;
    
    // Close modal when clicking outside
    modal.onclick = (e) => {
      if (e.target === modal) {
        closeModal();
      }
    };
    
    buttonContainer.appendChild(selectAllBtn);
    buttonContainer.appendChild(copyBtn);
    buttonContainer.appendChild(closeModalBtn);
    
    modalContent.appendChild(closeBtn);
    modalContent.appendChild(title);
    modalContent.appendChild(instruction);
    modalContent.appendChild(textDisplay);
    modalContent.appendChild(buttonContainer);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Auto-select the text after a short delay
    setTimeout(() => {
      textDisplay.focus();
      textDisplay.select();
    }, 200);
  };

  return (
    <div className="story-container">
      <div className="section-header">
        <h2>📚 Story Section</h2>
        <p>Generate engaging stories for children</p>
      </div>

      <div className="input-section">
        <div className="story-length-selector">
          <label className="length-label">Story Length:</label>
          <div className="length-options">
            <button 
              className={`length-btn ${storyLength === 'short' ? 'active' : ''}`}
              onClick={() => setStoryLength('short')}
            >
              Short
            </button>
            <button 
              className={`length-btn ${storyLength === 'medium' ? 'active' : ''}`}
              onClick={() => setStoryLength('medium')}
            >
              Medium
            </button>
            <button 
              className={`length-btn ${storyLength === 'long' ? 'active' : ''}`}
              onClick={() => setStoryLength('long')}
            >
              Long
            </button>
          </div>
        </div>
        
        <textarea
          className="prompt-input"
          placeholder="Enter your story topic... e.g.: A story about a little rabbit"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={3}
        />
        
        <button 
          className="generate-btn"
          onClick={handleGenerateStory}
          disabled={isLoading || !prompt.trim()}
        >
          {isLoading ? 'Generating...' : 'Generate Story'}
        </button>
      </div>

      {isLoading && (
        <div className="result-section">
          <div className="story-output">
            <h3>Generating Story...</h3>
            <div className="story-content">
              <div className="loading-spinner"></div>
              <p>Creating your magical story...</p>
            </div>
          </div>
        </div>
      )}

      {generatedStory && !isLoading && (
        <div className="result-section">
          <div className="story-output">
            <h3>Generated Story:</h3>
            <div className="story-content">
              {generatedStory}
            </div>
          </div>
          
          <div className="story-actions">
            <button 
              className="copy-btn"
              onClick={handleCopyStory}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-copy">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                <path d="M8 8m0 2a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2z" />
                <path d="M4 16c0 1.1 .9 2 2 2h8c1.1 0 2 -.9 2 -2v-8c0 -1.1 -.9 -2 -2 -2h-8c-1.1 0 -2 .9 -2 2z" />
              </svg>
              Copy Story
            </button>
            
            <button 
              className="save-btn"
              onClick={handleSaveStory}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-file-download">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                <path d="M14 3v4a1 1 0 0 0 1 1h4" />
                <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" />
                <path d="M12 17v-6" />
                <path d="M9.5 14.5l2.5 2.5l2.5 -2.5" />
              </svg>
              Save to History
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Story;

import React, { useState } from 'react';
import './Story.css';
import { saveStoryToFirebase } from '../firebaseUtils';
import { useUser } from '../contexts/UserContext';

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
          'Authorization': 'Bearer sk_WHtMEr6fX8C6OStB14DhDZ7aKD1gbi_r5hHZ4JKtZYk',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'qwen/qwen3-4b-fp8',
          messages: [
            {
              role: 'system',
              content: `You are a creative children's story writer. Write engaging, age-appropriate stories for children aged 4-10. Make the stories magical, fun, and educational. Use simple language and include positive messages. 
              ${storyLength === 'short' ? 'Write a SHORT story with EXACTLY 2 paragraphs. Each paragraph must have EXACTLY 5 lines. Keep it simple and concise.' : 
                storyLength === 'medium' ? 'Write a MEDIUM story with EXACTLY 5 paragraphs. Each paragraph must have EXACTLY 5 lines. Include some details and character development.' : 
                'Write a LONG story with EXACTLY 10 paragraphs. Each paragraph must have EXACTLY 5 lines. Include rich details, character development, and a more complex plot.'} 
              Always start with "Once upon a time" and end with "The end."`
            },
            {
              role: 'user',
              content: `Write a magical children's story about: ${prompt}. Make it fun and educational for kids!`
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
      
      const generatedStory = data.choices[0].message.content;
      console.log('Generated Story:', generatedStory);
      
      if (!generatedStory || generatedStory.trim() === '') {
        throw new Error('Empty story generated');
      }
      
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
      
      setGeneratedStory(`I'm sorry, ${errorMessage} But here's a magical story about ${prompt.toLowerCase()}: Once upon a time, there was a wonderful ${prompt.toLowerCase()} that lived in a magical world full of adventures and fun! The end.`);
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
      )}
    </div>
  );
};

export default Story;

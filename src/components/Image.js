import React, { useState } from 'react';
import './Image.css';
import { saveImageToFirebase } from '../firebaseUtils';
import { useUser } from '../contexts/UserContext';

const Image = ({ onGenerationChange }) => {
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user, userData, updateStats } = useUser();

  const handleGenerateImage = async () => {
    if (!prompt.trim()) return;
    
    setIsLoading(true);
    onGenerationChange && onGenerationChange(true);
    
    try {
      const fullPrompt = `child-friendly, colorful, cartoon style, safe for children, ${prompt}`;
      console.log('User prompt:', prompt);
      console.log('Full prompt being sent:', fullPrompt);
      
      // Step 1: Create image generation task using Qwen-Image API
      const createTaskResponse = await fetch('/.netlify/functions/novita-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: fullPrompt,
          size: '1024*1024'
        })
      });

      if (!createTaskResponse.ok) {
        throw new Error(`API request failed: ${createTaskResponse.status}`);
      }

      const createTaskData = await createTaskResponse.json();
      console.log('Create task response:', createTaskData);
      
      // Qwen-Image API returns task_id directly
      const taskId = createTaskData.task_id;
      
      if (!taskId) {
        throw new Error('No task ID received from API');
      }

      // Step 2: Poll for task completion
      let attempts = 0;
      const maxAttempts = 30; // 30 attempts = 30 seconds max
      
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
        
        const taskResultResponse = await fetch(`/.netlify/functions/novita-proxy?task_id=${taskId}`, {
          method: 'GET'
        });

        if (!taskResultResponse.ok) {
          throw new Error(`Task result request failed: ${taskResultResponse.status}`);
        }

        const taskResultData = await taskResultResponse.json();
        console.log('Task result response:', taskResultData);
        
        if (taskResultData.task?.status === 'TASK_STATUS_SUCCEED') {
          const image = taskResultData.images?.[0];
          if (image?.image_url) {
            setGeneratedImage({
              url: image.image_url,
              prompt: prompt
            });
            setIsLoading(false);
            return;
          } else {
            throw new Error('No image URL in successful response');
          }
        } else if (taskResultData.task?.status === 'TASK_STATUS_FAILED') {
          throw new Error(`Image generation failed: ${taskResultData.task?.reason || 'Unknown error'}`);
        }
        
        attempts++;
      }
      
      throw new Error('Image generation timed out');
      
    } catch (error) {
      console.error('Error generating image:', error);
      console.error('Error details:', error.message);
      setGeneratedImage({
        url: 'https://via.placeholder.com/400x300/f3f4f6/6b7280?text=Image+Generation+Failed',
        prompt: prompt
      });
      alert(`Image generation failed: ${error.message}`);
    } finally {
      setIsLoading(false);
      onGenerationChange && onGenerationChange(false);
    }
  };

  const handleSaveImage = async () => {
    if (generatedImage) {
      try {
        const imageData = {
          type: 'image',
          content: `Image: ${generatedImage.prompt}`,
          prompt: generatedImage.prompt,
          imageUrl: generatedImage.url,
          userId: user?.uid || 'anonymous',
          userEmail: user?.email || null,
          userDisplayName: user?.displayName || userData?.displayName || 'Anonymous User',
          title: `Image: ${generatedImage.prompt.substring(0, 50)}...`
        };
        
        await saveImageToFirebase(imageData);
        
        // Update user stats
        if (user) {
          await updateStats('image');
        }
        
        // Also save to localStorage for immediate display
        const history = JSON.parse(localStorage.getItem('aiKidsHistory') || '[]');
        const newItem = {
          id: Date.now(),
          type: 'image',
          content: `Image: ${generatedImage.prompt}`,
          prompt: generatedImage.prompt,
          imageUrl: generatedImage.url,
          timestamp: new Date().toISOString()
        };
        history.unshift(newItem);
        localStorage.setItem('aiKidsHistory', JSON.stringify(history));
        
        alert('Image saved to Firebase and local history!');
      } catch (error) {
        console.error('Error saving image:', error);
        alert('Failed to save image to Firebase, but saved locally.');
      }
    }
  };

  const handleDownloadImage = () => {
    if (generatedImage) {
      const link = document.createElement('a');
      link.href = generatedImage.url;
      link.download = `ai-kids-image-${Date.now()}.png`;
      link.click();
    }
  };

  return (
    <div className="image-container">
      <div className="section-header">
        <h2>🖼️ Image Section</h2>
        <p>Generate engaging images for children</p>
      </div>

      <div className="input-section">
        <textarea
          className="prompt-input"
          placeholder="Describe the image you want... e.g.: A cute little rabbit playing in a colorful garden"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={3}
        />
        
        <button 
          className="generate-btn"
          onClick={handleGenerateImage}
          disabled={isLoading || !prompt.trim()}
        >
          {isLoading ? 'Generating image...' : 'Generate Image'}
        </button>
      </div>

      {isLoading && (
        <div className="loading-section">
          <div className="loading-spinner"></div>
          <p>Creating your magical image...</p>
          <p style={{fontSize: '0.75rem', color: '#6b7280', marginTop: '8px'}}>This may take up to 30 seconds</p>
        </div>
      )}

      {generatedImage && (
        <div className="result-section">
          <div className="image-output">
            <h3>Generated Image:</h3>
            <div className="image-container-wrapper">
              <img 
                src={generatedImage.url} 
                alt={generatedImage.prompt}
                className="generated-image"
              />
            </div>
            <p className="image-prompt">Topic: {generatedImage.prompt}</p>
          </div>
          
          <div className="image-actions">
            <button 
              className="save-btn"
              onClick={handleSaveImage}
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
            
            <button 
              className="download-btn"
              onClick={handleDownloadImage}
            >
              📥 Download Image
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Image;

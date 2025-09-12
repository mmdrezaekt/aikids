import React, { useState } from 'react';
import './App.css';
import Story from './components/Story';
import Chat from './components/Chat';
import Image from './components/Image';
import History from './components/History';
import { UserProvider } from './contexts/UserContext';

function App() {
  const [activeTab, setActiveTab] = useState('story');
  const [isGenerating, setIsGenerating] = useState(false);

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'story':
        return <Story onGenerationChange={setIsGenerating} />;
      case 'chat':
        return <Chat onGenerationChange={setIsGenerating} />;
      case 'image':
        return <Image onGenerationChange={setIsGenerating} />;
      case 'history':
        return <History />;
      default:
        return <Story onGenerationChange={setIsGenerating} />;
    }
  };

  return (
    <UserProvider>
      <div className="app">
        <header className="app-header">
          <h1>AI Kids</h1>
          <p>Mobile app for children</p>
        </header>
        
        <main className="app-main">
          {renderActiveComponent()}
        </main>
        
        <nav className="bottom-nav">
          <button 
            className={`nav-item ${activeTab === 'story' ? 'active' : ''} ${isGenerating ? 'disabled' : ''}`}
            onClick={() => !isGenerating && setActiveTab('story')}
            disabled={isGenerating}
          >
            <span className="nav-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-book">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                <path d="M3 19a9 9 0 0 1 9 0a9 9 0 0 1 9 0" />
                <path d="M3 6a9 9 0 0 1 9 0a9 9 0 0 1 9 0" />
                <path d="M3 6l0 13" />
                <path d="M12 6l0 13" />
                <path d="M21 6l0 13" />
              </svg>
            </span>
            <span className="nav-label">Story</span>
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'chat' ? 'active' : ''} ${isGenerating ? 'disabled' : ''}`}
            onClick={() => !isGenerating && setActiveTab('chat')}
            disabled={isGenerating}
          >
            <span className="nav-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="icon icon-tabler icons-tabler-filled icon-tabler-bubble-text">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                <path d="M12.4 2l.253 .005a6.34 6.34 0 0 1 5.235 3.166l.089 .163l.178 .039a6.33 6.33 0 0 1 4.254 3.406l.105 .228a6.334 6.334 0 0 1 -5.74 8.865l-.144 -.002l-.037 .052a5.26 5.26 0 0 1 -5.458 1.926l-.186 -.051l-3.435 2.06a1 1 0 0 1 -1.508 -.743l-.006 -.114v-2.435l-.055 -.026a3.67 3.67 0 0 1 -1.554 -1.498l-.102 -.199a3.67 3.67 0 0 1 -.312 -2.14l.038 -.21l-.116 -.092a5.8 5.8 0 0 1 -1.887 -6.025l.071 -.238a5.8 5.8 0 0 1 5.42 -4.004h.157l.15 -.165a6.33 6.33 0 0 1 4.33 -1.963zm1.6 11h-5a1 1 0 0 0 0 2h5a1 1 0 0 0 0 -2m3 -4h-10a1 1 0 1 0 0 2h10a1 1 0 0 0 0 -2" />
              </svg>
            </span>
            <span className="nav-label">Chat</span>
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'image' ? 'active' : ''} ${isGenerating ? 'disabled' : ''}`}
            onClick={() => !isGenerating && setActiveTab('image')}
            disabled={isGenerating}
          >
            <span className="nav-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-photo-ai">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                <path d="M15 8h.01" />
                <path d="M10 21h-4a3 3 0 0 1 -3 -3v-12a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v5" />
                <path d="M3 16l5 -5c.928 -.893 2.072 -.893 3 0l1 1" />
                <path d="M14 21v-4a2 2 0 1 1 4 0v4" />
                <path d="M14 19h4" />
                <path d="M21 15v6" />
              </svg>
            </span>
            <span className="nav-label">Image</span>
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'history' ? 'active' : ''} ${isGenerating ? 'disabled' : ''}`}
            onClick={() => !isGenerating && setActiveTab('history')}
            disabled={isGenerating}
          >
            <span className="nav-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-album">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                <path d="M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z" />
                <path d="M12 4v7l2 -2l2 2v-7" />
              </svg>
            </span>
            <span className="nav-label">History</span>
          </button>
        </nav>
      </div>
    </UserProvider>
  );
}

export default App;

import React, { useState, useEffect } from 'react';
import './History.css';

const History = () => {
  const [historyItems, setHistoryItems] = useState([]);
  const [filter, setFilter] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const loadHistory = () => {
      const savedHistory = JSON.parse(localStorage.getItem('aiKidsHistory') || '[]');
      const formattedHistory = savedHistory.map(item => ({
        ...item,
        title: item.type === 'story' ? `Story: ${item.prompt}` : 
               item.type === 'chat' ? 'Chat Conversation' : 
               item.type === 'image' ? `Image: ${item.prompt}` : 'Unknown',
        preview: item.type === 'image' ? `🖼️ Image: ${item.prompt}` : 
                 item.content.length > 100 ? item.content.substring(0, 100) + '...' : item.content,
        timestamp: new Date(item.timestamp).toLocaleString('en-US'),
        imageUrl: item.imageUrl || null
      }));
      setHistoryItems(formattedHistory);
    };

    loadHistory();
    
    const handleStorageChange = () => {
      loadHistory();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const filteredItems = historyItems.filter(item => 
    filter === 'all' || item.type === filter
  );

  const getTypeIcon = (type) => {
    switch (type) {
      case 'story': 
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-book">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
            <path d="M3 19a9 9 0 0 1 9 0a9 9 0 0 1 9 0" />
            <path d="M3 6a9 9 0 0 1 9 0a9 9 0 0 1 9 0" />
            <path d="M3 6l0 13" />
            <path d="M12 6l0 13" />
            <path d="M21 6l0 13" />
          </svg>
        );
      case 'chat': 
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="icon icon-tabler icons-tabler-filled icon-tabler-bubble-text">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
            <path d="M12.4 2l.253 .005a6.34 6.34 0 0 1 5.235 3.166l.089 .163l.178 .039a6.33 6.33 0 0 1 4.254 3.406l.105 .228a6.334 6.334 0 0 1 -5.74 8.865l-.144 -.002l-.037 .052a5.26 5.26 0 0 1 -5.458 1.926l-.186 -.051l-3.435 2.06a1 1 0 0 1 -1.508 -.743l-.006 -.114v-2.435l-.055 -.026a3.67 3.67 0 0 1 -1.554 -1.498l-.102 -.199a3.67 3.67 0 0 1 -.312 -2.14l.038 -.21l-.116 -.092a5.8 5.8 0 0 1 -1.887 -6.025l.071 -.238a5.8 5.8 0 0 1 5.42 -4.004h.157l.15 -.165a6.33 6.33 0 0 1 4.33 -1.963zm1.6 11h-5a1 1 0 0 0 0 2h5a1 1 0 0 0 0 -2m3 -4h-10a1 1 0 1 0 0 2h10a1 1 0 0 0 0 -2" />
          </svg>
        );
      case 'image': 
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-photo-ai">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
            <path d="M15 8h.01" />
            <path d="M10 21h-4a3 3 0 0 1 -3 -3v-12a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v5" />
            <path d="M3 16l5 -5c.928 -.893 2.072 -.893 3 0l1 1" />
            <path d="M14 21v-4a2 2 0 1 1 4 0v4" />
            <path d="M14 19h4" />
            <path d="M21 15v6" />
          </svg>
        );
      default: 
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-album">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
            <path d="M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z" />
            <path d="M12 4v7l2 -2l2 2v-7" />
          </svg>
        );
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'story': return 'Story';
      case 'chat': return 'Chat';
      case 'image': return 'Image';
      default: return 'Unknown';
    }
  };

  const handleItemClick = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedItem(null);
    setIsModalOpen(false);
  };

  const handleDeleteItem = (id) => {
    const updatedHistory = historyItems.filter(item => item.id !== id);
    setHistoryItems(updatedHistory);
    
    const savedHistory = JSON.parse(localStorage.getItem('aiKidsHistory') || '[]');
    const updatedSavedHistory = savedHistory.filter(item => item.id !== id);
    localStorage.setItem('aiKidsHistory', JSON.stringify(updatedSavedHistory));
    
    if (selectedItem && selectedItem.id === id) {
      setSelectedItem(null);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear all history?')) {
      setHistoryItems([]);
      localStorage.removeItem('aiKidsHistory');
      setSelectedItem(null);
    }
  };

  return (
    <div className={`history-container ${isModalOpen ? 'modal-open' : ''}`}>
      <div className="section-header">
        <h2>📋 History Section</h2>
        <p>All your generated content is saved here</p>
      </div>

      <div className="history-controls">
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-album">
              <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
              <path d="M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z" />
              <path d="M12 4v7l2 -2l2 2v-7" />
            </svg>
            All
          </button>
          <button 
            className={`filter-btn ${filter === 'story' ? 'active' : ''}`}
            onClick={() => setFilter('story')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-book">
              <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
              <path d="M3 19a9 9 0 0 1 9 0a9 9 0 0 1 9 0" />
              <path d="M3 6a9 9 0 0 1 9 0a9 9 0 0 1 9 0" />
              <path d="M3 6l0 13" />
              <path d="M12 6l0 13" />
              <path d="M21 6l0 13" />
            </svg>
            Story
          </button>
          <button 
            className={`filter-btn ${filter === 'chat' ? 'active' : ''}`}
            onClick={() => setFilter('chat')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="icon icon-tabler icons-tabler-filled icon-tabler-bubble-text">
              <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
              <path d="M12.4 2l.253 .005a6.34 6.34 0 0 1 5.235 3.166l.089 .163l.178 .039a6.33 6.33 0 0 1 4.254 3.406l.105 .228a6.334 6.334 0 0 1 -5.74 8.865l-.144 -.002l-.037 .052a5.26 5.26 0 0 1 -5.458 1.926l-.186 -.051l-3.435 2.06a1 1 0 0 1 -1.508 -.743l-.006 -.114v-2.435l-.055 -.026a3.67 3.67 0 0 1 -1.554 -1.498l-.102 -.199a3.67 3.67 0 0 1 -.312 -2.14l.038 -.21l-.116 -.092a5.8 5.8 0 0 1 -1.887 -6.025l.071 -.238a5.8 5.8 0 0 1 5.42 -4.004h.157l.15 -.165a6.33 6.33 0 0 1 4.33 -1.963zm1.6 11h-5a1 1 0 0 0 0 2h5a1 1 0 0 0 0 -2m3 -4h-10a1 1 0 1 0 0 2h10a1 1 0 0 0 0 -2" />
            </svg>
            Chat
          </button>
          <button 
            className={`filter-btn ${filter === 'image' ? 'active' : ''}`}
            onClick={() => setFilter('image')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-photo-ai">
              <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
              <path d="M15 8h.01" />
              <path d="M10 21h-4a3 3 0 0 1 -3 -3v-12a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v5" />
              <path d="M3 16l5 -5c.928 -.893 2.072 -.893 3 0l1 1" />
              <path d="M14 21v-4a2 2 0 1 1 4 0v4" />
              <path d="M14 19h4" />
              <path d="M21 15v6" />
            </svg>
            Image
          </button>
        </div>

        {historyItems.length > 0 && (
          <button 
            className="clear-btn"
            onClick={handleClearHistory}
          >
            🗑️ Clear All
          </button>
        )}
      </div>

      <div className="history-list">
        {filteredItems.length === 0 ? (
          <div className="empty-state">
            <p>No history found</p>
            <p>Generated content will be displayed here</p>
          </div>
        ) : (
          filteredItems.map(item => (
            <div 
              key={item.id} 
              className="history-item"
              onClick={() => handleItemClick(item)}
            >
              <div className="item-header">
                <span className="item-icon">{getTypeIcon(item.type)}</span>
                <div className="item-info">
                  <h3>{item.title}</h3>
                  <p className="item-type">{getTypeLabel(item.type)}</p>
                </div>
                <span className="item-time">{item.timestamp}</span>
              </div>
              <div className="item-preview">
                {item.preview}
              </div>
              <div className="item-actions">
                <button 
                  className="delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteItem(item.id);
                  }}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedItem && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedItem.title}</h3>
              <button className="close-btn" onClick={handleCloseModal}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-meta">
                <span className="modal-type">
                  {getTypeIcon(selectedItem.type)} {getTypeLabel(selectedItem.type)}
                </span>
                <span className="modal-time">{selectedItem.timestamp}</span>
              </div>
              <div className="modal-content-text">
                {selectedItem.type === 'image' && selectedItem.imageUrl ? (
                  <div className="modal-image-container">
                    <img 
                      src={selectedItem.imageUrl} 
                      alt={selectedItem.prompt}
                      className="modal-image"
                    />
                    <p className="modal-image-caption">{selectedItem.prompt}</p>
                  </div>
                ) : (
                  selectedItem.content
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="modal-delete-btn"
                onClick={() => {
                  handleDeleteItem(selectedItem.id);
                  handleCloseModal();
                }}
              >
                Delete
              </button>
              <button className="modal-close-btn" onClick={handleCloseModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;

import React, { useState, useEffect } from 'react';
import { 
  getStoriesFromFirebase, 
  getChatsFromFirebase, 
  getImagesFromFirebase,
  getAllUsers,
  deleteDocument 
} from '../firebaseUtils';
import './FirebaseAdmin.css';

const FirebaseAdmin = () => {
  const [stories, setStories] = useState([]);
  const [chats, setChats] = useState([]);
  const [images, setImages] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('stories');

  const loadData = async () => {
    setLoading(true);
    try {
      const [storiesData, chatsData, imagesData, usersData] = await Promise.all([
        getStoriesFromFirebase(100),
        getChatsFromFirebase(100),
        getImagesFromFirebase(100),
        getAllUsers(100)
      ]);
      
      setStories(storiesData);
      setChats(chatsData);
      setImages(imagesData);
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Failed to load data from Firebase');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (collection, docId) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteDocument(collection, docId);
        await loadData(); // Reload data
        alert('Item deleted successfully');
      } catch (error) {
        console.error('Error deleting item:', error);
        alert('Failed to delete item');
      }
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown date';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString();
  };

  const renderStories = () => (
    <div className="admin-section">
      <h3>Stories ({stories.length})</h3>
      <div className="admin-list">
        {stories.map((story) => (
          <div key={story.id} className="admin-item">
            <div className="item-content">
              <h4>{story.title || 'Untitled Story'}</h4>
              <p><strong>Prompt:</strong> {story.prompt}</p>
              <p><strong>User:</strong> {story.userDisplayName || story.userId}</p>
              <p><strong>Created:</strong> {formatDate(story.createdAt)}</p>
              <p><strong>Content:</strong> {story.content?.substring(0, 100)}...</p>
            </div>
            <div className="item-actions">
              <button 
                className="delete-btn"
                onClick={() => handleDelete('stories', story.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderChats = () => (
    <div className="admin-section">
      <h3>Chats ({chats.length})</h3>
      <div className="admin-list">
        {chats.map((chat) => (
          <div key={chat.id} className="admin-item">
            <div className="item-content">
              <h4>{chat.title || 'Untitled Chat'}</h4>
              <p><strong>Messages:</strong> {chat.messageCount || 'Unknown'}</p>
              <p><strong>User:</strong> {chat.userDisplayName || chat.userId}</p>
              <p><strong>Created:</strong> {formatDate(chat.createdAt)}</p>
              <p><strong>Content:</strong> {chat.content?.substring(0, 100)}...</p>
            </div>
            <div className="item-actions">
              <button 
                className="delete-btn"
                onClick={() => handleDelete('chats', chat.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderImages = () => (
    <div className="admin-section">
      <h3>Images ({images.length})</h3>
      <div className="admin-list">
        {images.map((image) => (
          <div key={image.id} className="admin-item">
            <div className="item-content">
              <h4>{image.title || 'Untitled Image'}</h4>
              <p><strong>Prompt:</strong> {image.prompt}</p>
              <p><strong>User:</strong> {image.userDisplayName || image.userId}</p>
              <p><strong>Created:</strong> {formatDate(image.createdAt)}</p>
              {image.imageUrl && (
                <div className="image-preview">
                  <img src={image.imageUrl} alt={image.prompt} />
                </div>
              )}
            </div>
            <div className="item-actions">
              <button 
                className="delete-btn"
                onClick={() => handleDelete('images', image.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="admin-section">
      <h3>Users ({users.length})</h3>
      <div className="admin-list">
        {users.map((user) => (
          <div key={user.id} className="admin-item">
            <div className="item-content">
              <h4>{user.displayName || 'Anonymous User'}</h4>
              <p><strong>User ID:</strong> {user.id}</p>
              <p><strong>Email:</strong> {user.email || 'No email'}</p>
              <p><strong>Anonymous:</strong> {user.isAnonymous ? 'Yes' : 'No'}</p>
              <p><strong>Visit Count:</strong> {user.visitCount || 0}</p>
              <p><strong>Stories:</strong> {user.totalStories || 0}</p>
              <p><strong>Chats:</strong> {user.totalChats || 0}</p>
              <p><strong>Images:</strong> {user.totalImages || 0}</p>
              <p><strong>Created:</strong> {formatDate(user.createdAt)}</p>
              <p><strong>Last Seen:</strong> {formatDate(user.lastSeen)}</p>
              {user.deviceInfo && (
                <div className="device-info">
                  <p><strong>Device:</strong> {user.deviceInfo.platform}</p>
                  <p><strong>Language:</strong> {user.deviceInfo.language}</p>
                  <p><strong>Screen:</strong> {user.deviceInfo.screenResolution}</p>
                </div>
              )}
            </div>
            <div className="item-actions">
              <button 
                className="delete-btn"
                onClick={() => handleDelete('users', user.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="firebase-admin">
      <div className="admin-header">
        <h2>Firebase Admin Panel</h2>
        <button 
          className="refresh-btn"
          onClick={loadData}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Refresh Data'}
        </button>
      </div>

      <div className="admin-tabs">
        <button 
          className={`tab-btn ${activeTab === 'stories' ? 'active' : ''}`}
          onClick={() => setActiveTab('stories')}
        >
          Stories
        </button>
        <button 
          className={`tab-btn ${activeTab === 'chats' ? 'active' : ''}`}
          onClick={() => setActiveTab('chats')}
        >
          Chats
        </button>
        <button 
          className={`tab-btn ${activeTab === 'images' ? 'active' : ''}`}
          onClick={() => setActiveTab('images')}
        >
          Images
        </button>
        <button 
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'stories' && renderStories()}
        {activeTab === 'chats' && renderChats()}
        {activeTab === 'images' && renderImages()}
        {activeTab === 'users' && renderUsers()}
      </div>
    </div>
  );
};

export default FirebaseAdmin;

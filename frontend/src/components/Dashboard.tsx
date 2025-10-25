import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { logout } from '../store/slices/authSlice';
import UserList from './UserList';
import Chat from './Chat';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [chatId, setChatId] = useState<string | null>(null);

  const currentUser = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();

  const handleSelectUser = (userId: string, chatId?: string) => {
    setSelectedUserId(userId);
    // Use the chatId returned from createChat API call, or let UserList handle chat creation
    if (chatId) {
      setChatId(chatId);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>ChatMe</h1>
          <div className="user-menu">
            <div className="current-user">
              <div className="user-avatar">
                {currentUser?.avatar ? (
                  <img src={currentUser.avatar} alt={currentUser.name} />
                ) : (
                  <div className="avatar-placeholder">
                    {currentUser?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <span>{currentUser?.name}</span>
            </div>
            <button onClick={handleLogout} className="logout-button">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16,17 21,12 16,7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="sidebar">
          <UserList onSelectUser={handleSelectUser} />
        </div>

        <div className="main-content">
          {selectedUserId && chatId ? (
            <Chat chatId={chatId} otherUserId={selectedUserId} />
          ) : (
            <div className="welcome-screen">
              <div className="welcome-content">
                <div className="welcome-icon">
                  <svg
                    width="64"
                    height="64"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <h2>Welcome to ChatMe</h2>
                <p>Select a user from the sidebar to start a conversation</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
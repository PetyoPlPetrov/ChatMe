import React from 'react';
import { useGetUsersQuery } from '../store/api/usersApi';
import { useCreateChatMutation } from '../store/api/chatApi';
import { User } from '../store/slices/authSlice';
import './UserList.css';

interface UserListProps {
  onSelectUser: (userId: string, chatId?: string) => void;
}

const UserList: React.FC<UserListProps> = ({ onSelectUser }) => {
  const { data: users, isLoading, error } = useGetUsersQuery();
  const [createChat] = useCreateChatMutation();
    console.log({users, isLoading, error});
  const handleUserClick = async (userId: string) => {
    try {
      const chat = await createChat({ participantId: userId }).unwrap();
      onSelectUser(userId, chat.id);
    } catch (err) {
      console.error('Failed to create chat:', err);
      // Still allow selection even if chat creation fails
      onSelectUser(userId);
    }
  };

  if (isLoading) {
    return (
      <div className="user-list-container">
        <div className="user-list-header">
          <h2>Available Users</h2>
        </div>
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-list-container">
        <div className="user-list-header">
          <h2>Available Users</h2>
        </div>
        <div className="error-state">
          <p>Failed to load users</p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-list-container">
      <div className="user-list-header">
        <h2>Available Users</h2>
        <p>Select a user to start chatting</p>
      </div>

      <div className="user-list">
        {users?.map((user: User) => (
          <div
            key={user.id}
            className="user-item"
            onClick={() => handleUserClick(user.id)}
          >
            <div className="user-avatar">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} />
              ) : (
                <div className="avatar-placeholder">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="user-info">
              <h3>{user.name}</h3>
              <p>{user.email}</p>
            </div>
            <div className="user-status">
              <div className="status-indicator online"></div>
            </div>
          </div>
        ))}
      </div>

      {users?.length === 0 && (
        <div className="empty-state">
          <p>No users available</p>
        </div>
      )}
    </div>
  );
};

export default UserList;
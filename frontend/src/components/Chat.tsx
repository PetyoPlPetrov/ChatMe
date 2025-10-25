import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import {
  useGetMessagesQuery,
  useSendMessageMutation,
  Message,
} from '../store/api/chatApi';
import { useGetUserByIdQuery } from '../store/api/usersApi';
import { useNotifications } from '../hooks/useNotifications';
import './Chat.css';

interface ChatProps {
  chatId: string;
  otherUserId: string;
}

const Chat: React.FC<ChatProps> = ({ chatId, otherUserId }) => {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentUser = useSelector((state: RootState) => state.auth.user);
  const {
    data: messages,
    isLoading: messagesLoading,
    refetch,
  } = useGetMessagesQuery(chatId);
  const { data: otherUser } = useGetUserByIdQuery(otherUserId);
  const [sendMessage, { isLoading: sendingMessage }] = useSendMessageMutation();

  // SSE notifications integration
  useNotifications({
    onChatMessage: (payload) => {
      // Only refetch if the message is for the current chat
      if (payload.data.chatId === chatId) {
        refetch();
      }
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const messageData = {
      chatId,
      content: message.trim(),
      type: 'text' as const,
    };

    try {
      // Send via REST API - SSE notifications will be sent by the backend
      await sendMessage(messageData).unwrap();
      setMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  if (messagesLoading) {
    return (
      <div className="chat-container">
        <div className="chat-header">
          <div className="chat-user-info">
            <div className="chat-avatar-placeholder">
              {otherUser?.name?.charAt(0).toUpperCase() || '?'}
            </div>
            <div>
              <h3>{otherUser?.name || 'Loading...'}</h3>
              <p>Loading messages...</p>
            </div>
          </div>
        </div>
        <div className="chat-messages loading">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="chat-user-info">
          <div className="chat-avatar">
            {otherUser?.avatar ? (
              <img src={otherUser.avatar} alt={otherUser.name} />
            ) : (
              <div className="chat-avatar-placeholder">
                {otherUser?.name?.charAt(0).toUpperCase() || '?'}
              </div>
            )}
          </div>
          <div>
            <h3>{otherUser?.name || 'Unknown User'}</h3>
            <p className="user-status">Online</p>
          </div>
        </div>
      </div>

      <div className="chat-messages">
        {messages?.map((msg: Message, index: number) => {
          const showDate =
            index === 0 ||
            formatDate(messages[index - 1].timestamp) !==
              formatDate(msg.timestamp);

          return (
            <React.Fragment key={msg.id}>
              {showDate && (
                <div className="date-separator">
                  <span>{formatDate(msg.timestamp)}</span>
                </div>
              )}
              <div
                className={`message ${
                  msg.senderId === currentUser?.id ? 'sent' : 'received'
                }`}
              >
                <div className="message-content">
                  <p>{msg.content}</p>
                  <span className="message-time">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
              </div>
            </React.Fragment>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="chat-input">
        <div className="input-container">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            disabled={sendingMessage}
          />
          <button
            type="submit"
            disabled={!message.trim() || sendingMessage}
            className="send-button"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m22 2-7 20-4-9-9-4 20-7z" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chat;

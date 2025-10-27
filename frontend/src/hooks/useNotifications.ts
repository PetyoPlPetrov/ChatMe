import { useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

// Types matching the backend SSE payload structure
interface BaseSSEPayload {
  type: string;
  timestamp: string;
  userId: string;
}

interface ConnectionPayload extends BaseSSEPayload {
  type: 'connection';
  message: string;
}

interface HeartbeatPayload extends BaseSSEPayload {
  type: 'heartbeat';
}

interface ChatMessagePayload extends BaseSSEPayload {
  type: 'chat_message';
  data: {
    messageId: string;
    chatId: string;
    senderId: string;
    senderName: string;
    content: string;
    messageType: 'text' | 'image' | 'file';
  };
}

interface MessageReadPayload extends BaseSSEPayload {
  type: 'message_read';
  data: {
    chatId: string;
    readById: string;
    lastReadMessageId: string;
  };
}

interface MatchNotificationPayload extends BaseSSEPayload {
  type: 'match_notification';
  data: {
    matchId: string;
    otherUserId: string;
    otherUserName: string;
    message: string;
  };
}

type SSEPayload =
  | ConnectionPayload
  | HeartbeatPayload
  | ChatMessagePayload
  | MessageReadPayload
  | MatchNotificationPayload;

interface UseNotificationsProps {
  onChatMessage?: (payload: ChatMessagePayload) => void;
  onMessageRead?: (payload: MessageReadPayload) => void;
  onMatchNotification?: (payload: MatchNotificationPayload) => void;
}

export const useNotifications = ({
  onChatMessage,
  onMessageRead,
  onMatchNotification,
}: UseNotificationsProps = {}) => {
  const eventSourceRef = useRef<EventSource | null>(null);
  const currentUser = useSelector((state: RootState) => state.auth.user);

  const connect = useCallback(() => {
    if (!currentUser?.id) {
      console.log(
        'No user logged in or no token available, skipping SSE connection'
      );
      return;
    }

    // Close existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    // Create new SSE connection with token as query parameter
    const eventSource = new EventSource(
      `http://localhost:8080/api/notifications/sse/${currentUser.id}`
    );
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log('SSE connection established');
    };

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data) as SSEPayload;

        console.log('SSE message received:', payload);

        const messageType = payload.type;
        switch (messageType) {
          case 'connection':
            console.log('SSE connection confirmed');
            break;
          case 'heartbeat':
            // Keep connection alive
            break;
          case 'chat_message':
            if (onChatMessage) {
              onChatMessage(payload as ChatMessagePayload);
            }
            break;
          case 'message_read':
            if (onMessageRead) {
              onMessageRead(payload as MessageReadPayload);
            }
            break;
          case 'match_notification':
            if (onMatchNotification) {
              onMatchNotification(payload as MatchNotificationPayload);
            }
            break;
          default:
            console.log('Unknown SSE message type:', (payload as any).type);
        }
      } catch (error) {
        console.error('Error parsing SSE message:', error, event.data);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);

      // Attempt to reconnect after a delay
      setTimeout(() => {
        if (
          currentUser?.id &&
          eventSourceRef.current?.readyState !== EventSource.OPEN
        ) {
          console.log('Attempting to reconnect SSE...');
          connect();
        }
      }, 5000);
    };
  }, [currentUser?.id, onChatMessage, onMessageRead, onMatchNotification]);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      console.log('SSE connection closed');
    }
  }, []);

  useEffect(() => {
    if (currentUser?.id) {
      connect();
    } else {
      disconnect();
    }

    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [currentUser?.id, connect, disconnect]);

  return {
    isConnected: eventSourceRef.current?.readyState === EventSource.OPEN,
    connect,
    disconnect,
  };
};

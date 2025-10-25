import { createApi, BaseQueryFn } from '@reduxjs/toolkit/query/react';

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  timestamp: string;
  type: 'text' | 'image' | 'file';
}

export interface Chat {
  id: string;
  participants: string[];
  lastMessage?: Message;
  updatedAt: string;
}

export interface SendMessageRequest {
  chatId: string;
  content: string;
  type?: 'text' | 'image' | 'file';
}

// Mock data storage
let mockChats: Chat[] = [
  {
    id: 'chat-1-2',
    participants: ['1', '2'],
    updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
  },
  {
    id: 'chat-1-3',
    participants: ['1', '3'],
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
  }
];

let mockMessages: Record<string, Message[]> = {
  'chat-1-2': [
    {
      id: 'msg-1',
      chatId: 'chat-1-2',
      senderId: '2',
      content: 'Hey John! How are you doing?',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      type: 'text'
    },
    {
      id: 'msg-2',
      chatId: 'chat-1-2',
      senderId: '1',
      content: 'Hi Jane! I\'m doing great, thanks for asking. How about you?',
      timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
      type: 'text'
    },
    {
      id: 'msg-3',
      chatId: 'chat-1-2',
      senderId: '2',
      content: 'I\'m good too! Just working on some projects.',
      timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
      type: 'text'
    }
  ],
  'chat-1-3': [
    {
      id: 'msg-4',
      chatId: 'chat-1-3',
      senderId: '3',
      content: 'Welcome to the system!',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      type: 'text'
    }
  ]
};

// Update chat with last message
const updateChatLastMessage = (chatId: string) => {
  const messages = mockMessages[chatId] || [];
  const lastMessage = messages[messages.length - 1];
  const chatIndex = mockChats.findIndex(c => c.id === chatId);
  if (chatIndex >= 0) {
    mockChats[chatIndex] = {
      ...mockChats[chatIndex],
      lastMessage,
      updatedAt: new Date().toISOString()
    };
  }
};

// Initialize last messages
Object.keys(mockMessages).forEach(updateChatLastMessage);

// Mock base query function
const mockBaseQuery: BaseQueryFn<string | { url: string; method: string; body?: any }, Chat | Chat[] | Message | Message[], { status: number; data: { message: string } }> = async (args, { getState }) => {
  // Check if user is authenticated
  const state = getState() as any;
  const token = state.auth.token;
  const currentUserId = state.auth.user?.id;

  if (!token || !currentUserId) {
    return {
      error: {
        status: 401,
        data: { message: 'Unauthorized' }
      }
    };
  }

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));

  if (typeof args === 'string' && args === '') {
    // Handle getChats query - return chats for current user
    const userChats = mockChats.filter(chat =>
      chat.participants.includes(currentUserId)
    ).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    return { data: userChats };
  }

  if (typeof args === 'string' && args.includes('/messages')) {
    // Handle getMessages query
    const chatId = args.replace('/messages', '');
    const messages = mockMessages[chatId] || [];

    // Check if user has access to this chat
    const chat = mockChats.find(c => c.id === chatId);
    if (!chat || !chat.participants.includes(currentUserId)) {
      return {
        error: {
          status: 403,
          data: { message: 'Access denied' }
        }
      };
    }

    return { data: messages };
  }

  if (args && typeof args === 'object' && args.method === 'POST') {
    if (args.url === 'create') {
      // Handle createChat mutation
      const { participantId } = args.body;

      // Check if chat already exists
      const existingChat = mockChats.find(chat =>
        chat.participants.includes(currentUserId) &&
        chat.participants.includes(participantId) &&
        chat.participants.length === 2
      );

      if (existingChat) {
        return { data: existingChat };
      }

      // Create new chat
      const newChat: Chat = {
        id: `chat-${currentUserId}-${participantId}`,
        participants: [currentUserId, participantId],
        updatedAt: new Date().toISOString()
      };

      mockChats.push(newChat);
      mockMessages[newChat.id] = [];

      return { data: newChat };
    }

    if (args.url.includes('/messages')) {
      // Handle sendMessage mutation
      const chatId = args.url.replace('/messages', '');
      const { content, type = 'text' } = args.body;

      // Check if user has access to this chat
      const chat = mockChats.find(c => c.id === chatId);
      if (!chat || !chat.participants.includes(currentUserId)) {
        return {
          error: {
            status: 403,
            data: { message: 'Access denied' }
          }
        };
      }

      // Create new message
      const newMessage: Message = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        chatId,
        senderId: currentUserId,
        content,
        timestamp: new Date().toISOString(),
        type
      };

      // Add message to storage
      if (!mockMessages[chatId]) {
        mockMessages[chatId] = [];
      }
      mockMessages[chatId].push(newMessage);

      // Update chat last message
      updateChatLastMessage(chatId);

      return { data: newMessage };
    }
  }

  return {
    error: {
      status: 404,
      data: { message: 'Endpoint not found' }
    }
  };
};

export const chatApi = createApi({
  reducerPath: 'chatApi',
  baseQuery: mockBaseQuery,
  tagTypes: ['Chat', 'Message'],
  endpoints: (builder) => ({
    getChats: builder.query<Chat[], void>({
      query: () => '',
      providesTags: ['Chat'],
    }),
    getMessages: builder.query<Message[], string>({
      query: (chatId) => `${chatId}/messages`,
      providesTags: (result, error, chatId) => [{ type: 'Message', id: chatId }],
    }),
    sendMessage: builder.mutation<Message, SendMessageRequest>({
      query: ({ chatId, ...body }) => ({
        url: `${chatId}/messages`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { chatId }) => [
        { type: 'Message', id: chatId },
        'Chat',
      ],
    }),
    createChat: builder.mutation<Chat, { participantId: string }>({
      query: (body) => ({
        url: 'create',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Chat'],
    }),
  }),
});

export const {
  useGetChatsQuery,
  useGetMessagesQuery,
  useSendMessageMutation,
  useCreateChatMutation,
} = chatApi;
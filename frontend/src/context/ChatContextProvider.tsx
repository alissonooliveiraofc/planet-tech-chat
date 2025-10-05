import { useState, type ReactNode } from 'react';
import { ChatContext, type ChatContextProps } from './ChatContext';

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<string | null>(localStorage.getItem('chat_user'));
  const [messages, setMessages] = useState<ChatContextProps['messages']>([]);

  return (
    <ChatContext.Provider value={{ user, setUser, messages, setMessages }}>
      {children}
    </ChatContext.Provider>
  );
};
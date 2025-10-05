import { useState, type ReactNode } from 'react';
import { ChatContext } from './ChatContext';
import { type Message } from '../types';

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<string | null>(localStorage.getItem('chat_user'));
  const [messages, setMessages] = useState<Message[]>([]);

  return (
    <ChatContext.Provider value={{ user, setUser, messages, setMessages }}>
      {children}
    </ChatContext.Provider>
  );
};


export { ChatContext };
// Removed useChat hook to comply with Fast Refresh requirements.
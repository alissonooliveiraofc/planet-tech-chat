import { createContext } from 'react';
import { type Message } from '../types';

export type ChatContextProps = {
  user: string | null;
  setUser: (user: string | null) => void;
  messages: Message[];
  setMessages: (messages: Message[]) => void;
};

export const ChatContext = createContext<ChatContextProps | undefined>(undefined);
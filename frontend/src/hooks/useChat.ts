import { useContext } from 'react';
import { ChatContext } from '../context/ChatContext';

export const useChat = (): unknown => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
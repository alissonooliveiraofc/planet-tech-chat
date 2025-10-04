export type MessageType = 'text' | 'image' | 'audio';

export interface Message {
  id: string;
  content: string;
  sender: string;
  type: MessageType;
  timestamp: string;
}

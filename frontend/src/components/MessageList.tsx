import { useEffect, useRef, useState } from 'react';
import { type Message } from '../types';
import MessageItem from './MessageItem';
import { v4 as uuidv4 } from 'uuid';

export default function MessageList({ messages, currentUser, loading }: { messages: Message[]; currentUser: string; loading: boolean }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isNearBottom, setIsNearBottom] = useState(true);

  // detectar se o usuário está perto do final (se sim, auto-scroll)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onScroll = () => {
      const threshold = 150;
      const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
      setIsNearBottom(atBottom);
    };
    el.addEventListener('scroll', onScroll);
    onScroll();
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  // auto-scroll quando mensagens mudam, se o usuário estiver perto do bottom
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    if (isNearBottom) {
      // timeout curto para aguardar render
      setTimeout(() => {
        el.scrollTop = el.scrollHeight;
      }, 50);
    }
  }, [messages, isNearBottom]);

  return (
    <div className="messages-container" ref={containerRef}>
      {loading && <div className="muted">Carregando...</div>}
      {messages.map((m) => (
        <MessageItem key={m.id || uuidv4()} message={m} isMine={m.sender === currentUser} />
      ))}
    </div>
  );
}

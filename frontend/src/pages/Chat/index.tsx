import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { type Message, type MessageType } from '../../types';
import { fetchMessages, postMessage, uploadFile } from '../../api';
import MessageList from '../../components/MessageList';
import MessageForm from '../../components/MessageForm';
import './style.css';

export default function Chat({ user, onLogout }: { user: string; onLogout: () => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  // const [loading, setLoading] = useState(false); tirei o loading 
  const navigate = useNavigate();
  const intervalRef = useRef<number | null>(null);

  const mergeMessages = (oldList: Message[], newList: Message[]): Message[] => {

    if (oldList.length === newList.length) {
      let identical = true;
      for (let i = 0; i < newList.length; i++) {
        if (oldList[i].id !== newList[i].id) {
          identical = false;
          break;
        }

        if (oldList[i].timestamp !== newList[i].timestamp || oldList[i].content !== newList[i].content) {
          identical = false;
          break;
        }
      }
      if (identical) return oldList;
    }

    const oldMap = new Map<string, Message>();
    for (const m of oldList) oldMap.set(m.id, m);

    const merged: Message[] = newList.map((nm) => {
      const existing = oldMap.get(nm.id);
      if (existing && existing.timestamp === nm.timestamp && existing.content === nm.content && existing.sender === nm.sender && existing.type === nm.type) {

        return existing;
      }

      return nm;
    });

    return merged;
  };

  const loadMessages = async () => {
    try {
      const data = await fetchMessages();
      setMessages((prev) => {
        const merged = mergeMessages(prev, data);
        return merged !== prev ? merged : prev;
      });
    } catch (err) {
      console.error('Erro ao carregar mensagens:', err);
    }
  };

  useEffect(() => {

    loadMessages();

    intervalRef.current = window.setInterval(() => {
      loadMessages();
    }, 5000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };

  }, []);


  const handleSendText = async (text: string) => {
    try {
      const created = await postMessage({
        content: text,
        sender: user,
        type: 'text',
      });

      setMessages((prev) => mergeMessages(prev, [...prev, created]));
    } catch (err) {
      console.error(err);
      alert('Erro ao enviar mensagem');
    }
  };


  const handleSendFile = async (file: File) => {
    try {
      const placeholder = {
        id: `temp-${Date.now()}`,
        content: URL.createObjectURL(file),
        sender: user,
        type: file.type.startsWith('image') ? 'image' as MessageType : 'audio' as MessageType,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, placeholder]);

      const { url } = await uploadFile(file);

      setTimeout(() => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === created.id ? { ...msg, content: `${url}?t=${Date.now()}` } : msg
          )
        );
      }, 1000);

      const created = await postMessage({
        content: url,
        sender: user,
        type: placeholder.type,
      });

      setMessages((prev) =>
        prev.map((msg) => (msg.id === placeholder.id ? created : msg))
      );
    } catch (err) {
      console.error(err);
      alert('Erro ao enviar arquivo');
    }
  };

  const handleLogoutClick = () => {
    onLogout();
    navigate('/');
  };

  return (
    <div className="chat-root">
      <header className="chat-header">
        <img src="/window.png" alt="chat" style={{ width: '20px', height: '20px' }} />
        <h3>Conversas</h3>
        <div className="user-info">
          <span style={{ marginRight: '8px' }}>Bem vindo(a)</span>
          <span className="user-badge">{user}</span>
          <button className="btn-ghost" onClick={handleLogoutClick} style={{ backgroundColor: 'purple', color: '#fff' }}>
            Logout
          </button>
        </div>
      </header>

      <main className="chat-main">
        <MessageList messages={messages} currentUser={user} loading={false} />
      </main>

      <footer className="chat-footer">
        <MessageForm onSendText={handleSendText} onSendFile={handleSendFile} />
      </footer>
    </div>
  );
}
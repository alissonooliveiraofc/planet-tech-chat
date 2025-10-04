import { useEffect, useRef, useState } from 'react';
import { type Message } from '../../types';
import { fetchMessages, postMessage, uploadFile } from '../../api';
import MessageList from '../../components/MessageList';
import MessageForm from '../../components/MessageForm';

export default function Chat({ user, onLogout }: { user: string; onLogout: () => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const pollingRef = useRef<number | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      const data = await fetchMessages();
      setMessages(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // polling a cada 5s
    pollingRef.current = window.setInterval(load, 5000);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  const handleSendText = async (text: string) => {
    try {
      const created = await postMessage({
        content: text,
        sender: user,
        type: 'text',
      });
      // atualizar lista localmente
      setMessages((prev) => [...prev, created]);
    } catch (err) {
      console.error(err);
      alert('Erro ao enviar mensagem');
    }
  };

  const handleSendFile = async (file: File) => {
    try {
      // 1) upload
      const { url } = await uploadFile(file);
      // 2) post message com url
      const type = file.type.startsWith('image') ? 'image' : 'audio';
      const created = await postMessage({
        content: url,
        sender: user,
        type,
      });
      setMessages((prev) => [...prev, created]);
    } catch (err) {
      console.error(err);
      alert('Erro ao enviar arquivo');
    }
  };

  return (
    <div className="chat-root">
      <header className="chat-header">
        <h3>Chat</h3>
        <div>
          <span className="user-badge">{user}</span>
          <button className="btn-ghost" onClick={onLogout}>Logout</button>
        </div>
      </header>

      <main className="chat-main">
        <MessageList messages={messages} currentUser={user} loading={loading} />
      </main>

      <footer className="chat-footer">
        <MessageForm onSendText={handleSendText} onSendFile={handleSendFile} />
      </footer>
    </div>
  );
}

import { type Message } from '../types';

function formatDate(iso?: string) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch {
    return iso;
  }
}

export default function MessageItem({ message, isMine }: { message: Message; isMine: boolean }) {
  const cls = isMine ? 'message message-mine' : 'message';

  return (
    <div className={cls}>
      <div className="meta">
        <strong className="sender">{message.sender}</strong>
        <span className="timestamp">{formatDate(message.timestamp)}</span>
      </div>

      <div className="content">
        {message.type === 'text' && <div className="text">{message.content}</div>}

        {message.type === 'image' && (
          <img src={message.content} alt="uploaded" className="img-msg" />
        )}

        {message.type === 'audio' && (
          <audio controls src={message.content} className="audio-msg" />
        )}
      </div>
    </div>
  );
}

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

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0]?.toUpperCase() || '')
    .join('');
}

export default function MessageItem({ message, isMine }: { message: Message; isMine: boolean }) {
  const cls = isMine ? 'message message-mine' : 'message';

  return (
    <div className={cls}>
      <div className="meta">
        <div
          className="avatar"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: '#007bff',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: '14px',
            textAlign: 'center',
          }}
          aria-label={`Avatar de ${message.sender}`}
        >
          {getInitials(message.sender)}
        </div>
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

import { useState } from 'react';
import './style.css';

export default function Login({ onLogin }: { onLogin: (name: string) => void }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Por favor digite seu nome');
      return;
    }
    onLogin(trimmed);
  };

  return (
    <div className="center-screen">
      <form className="card login-card" onSubmit={submit}>
        <h2>Planet Tech Chat</h2>
        <input
          value={name}
          onChange={(e) => {
            setError('');
            setName(e.target.value);
          }}
          maxLength={40}
          placeholder="Digite seu nome"
        />
        {error && <div className="error">{error}</div>}
        <button type="submit">Entrar</button>
      </form>
    </div>
  );
}

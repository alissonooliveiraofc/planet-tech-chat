import { useState } from 'react';
import Login from './pages/Login';
import Chat from './pages/Chat';

function App() {
  const [user, setUser] = useState<string | null>(() => {
    return localStorage.getItem('chat_user');
  });

  const handleLogin = (name: string) => {
    localStorage.setItem('chat_user', name);
    setUser(name);
  };

  const handleLogout = () => {
    localStorage.removeItem('chat_user');
    setUser(null);
  };

  return (
    <div className="app-root">
      {user ? (
        <Chat user={user} onLogout={handleLogout} />
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </div>
  );
}

export default App;

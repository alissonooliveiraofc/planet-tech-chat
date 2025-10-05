import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={user ? <Navigate to="/chat" replace /> : <Login onLogin={handleLogin} />}
        />

        <Route
          path="/chat"
          element={
            user ? <Chat user={user} onLogout={handleLogout} /> : <Navigate to="/" replace />
          }
        />

        <Route path="*" element={<Navigate to={user ? "/chat" : "/"} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

import { type Message } from './types';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export async function fetchMessages(): Promise<Message[]> {
  const res = await fetch(`${API}/messages`);
  const data = await res.json();
  if (!res.ok) throw new Error('Erro ao buscar mensagens');
  return data;
}

export async function postMessage(payload: Partial<Message>): Promise<Message> {
  const res = await fetch(`${API}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Erro ao enviar mensagem');
  }
  return res.json();
}

export async function uploadFile(file: File): Promise<{ url: string }> {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${API}/upload`, {
    method: 'POST',
    body: form,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Erro no upload');
  }
  return res.json();
}

export default API;

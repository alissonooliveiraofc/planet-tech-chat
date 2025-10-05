import React, { useRef, useState } from 'react';

export default function MessageForm({ onSendText, onSendFile }: { onSendText: (text: string) => void; onSendFile: (file: File) => void; }) {
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileType, setFileType] = useState<'image' | 'audio' | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const maxChars = 200;

  const handlePickFile = (f?: File) => {
    if (!f) {
      setFile(null);
      setPreview(null);
      setFileType(null);
      return;
    }
    setFile(f);
    if (f.type.startsWith('image')) {
      setFileType('image');
    } else if (f.type.startsWith('audio')) {
      setFileType('audio');
    } else {
      setFile(null);
      setPreview(null);
      setFileType(null);
      alert('Tipo inválido');
      return;
    }
    setPreview(URL.createObjectURL(f));
  };

  const submitText = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!text.trim()) return;
    onSendText(text.trim());
    setText('');
  };

  const submitFile = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!file) return;
    await onSendFile(file);
    // limpar preview e input
    setFile(null);
    setPreview(null);
    setFileType(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <form className="message-form" onSubmit={(e) => { e.preventDefault(); if (file) submitFile(); else submitText(); }}>
      <div className="row">
        <textarea
          placeholder="Digite uma mensagem..."
          value={text}
          maxLength={maxChars}
          onChange={(e) => setText(e.target.value)}
          rows={2}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              submitText();
            }
          }}
        />
        <div className="char-count">{maxChars - text.length}</div>
      </div>

      <div className="row actions">
        <div className="file-controls">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,audio/*"
            onChange={(e) => {
              const f = e.target.files?.[0];
              handlePickFile(f);
            }}
          />
          {preview && (
            <div className="preview">
              {fileType === 'image' && <img src={preview} alt="preview" />}
              {fileType === 'audio' && <audio controls src={preview} />}
              <button type="button" className="btn-remove" onClick={() => handlePickFile(undefined)}>Remover</button>
            </div>
          )}
        </div>

        <div className="buttons">
          <button type="submit" className="btn-primary">{file ? 'Enviar arquivo' : 'Enviar'}</button>
        </div>
      </div>

      <style>
        {`
        .btn-primary {
          background-color: purple;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
        }

        .btn-primary {
          background-color: purple;}
        .btn-primary:hover {
          background-color: #6a0dad;
        }
      `}
      </style>
    </form>
  );
}

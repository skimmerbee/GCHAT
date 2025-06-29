import React, { useState } from 'react';
import ChatUI from './ChatUI';
import ChatIntro from './ChatIntro';

export default function App() {
  const [showChat, setShowChat] = useState(false);

  return (
    <div className="app-container">
      {!showChat ? (
        <ChatIntro onStart={() => setShowChat(true)} />
      ) : (
        <ChatUI />
      )}
    </div>
  );
}

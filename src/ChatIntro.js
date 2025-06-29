import React, { useEffect } from 'react';
import './index.css';

export default function ChatIntro({ onStart }) {
  useEffect(() => {
    const bubbles = document.querySelectorAll('.fly-bubble');
    bubbles.forEach((bubble, i) => {
      setTimeout(() => {
        bubble.classList.add('animate');
      }, i * 100 + 300);
    });
  }, []);

  return (
    <div className="intro-screen">
      <div className="bubble-container">
        {Array.from({ length: 15 }).map((_, i) => (
          <div className="fly-bubble" key={i}>
            💬
          </div>
        ))}
      </div>
      <div className="center-bubble" onClick={onStart}>
        Chat with GT3 💬
      </div>
    </div>
  );
}

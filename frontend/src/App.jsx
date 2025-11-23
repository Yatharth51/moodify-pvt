import { useState } from 'react';
import Menubar from './components/MenuBar';
import Chat from './components/Chat';
import WebcamEmotion from './components/WebcamEmotion';
import './App.css';

function App() {
  const [modelName, setModelName] = useState('llama-3.1-8b-instant');
  const [systemMessage, setSystemMessage] = useState('');
  const [emotion, setEmotion] = useState('neutral');

  const handleModelToggle = checked => {
    if (checked) {
      setModelName('llama-2-70b-chat');
    } else {
      setModelName('llama-3.1-8b-instant');
    }
  };

  const handleSystemMessageChange = event => {
    setSystemMessage(event.target.value);
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh', 
      width: '100vw',
      background: 'linear-gradient(135deg, #0f0f2e 0%, #1a0033 50%, #0f0f2e 100%)',
      position: 'relative',
    }}>
      {/* Decorative glows */}
      <div style={{
        position: 'fixed',
        width: '300px',
        height: '300px',
        background: '#7c3aed',
        borderRadius: '50%',
        filter: 'blur(100px)',
        opacity: '0.15',
        top: '-100px',
        left: '-100px',
        pointerEvents: 'none',
        zIndex: 0,
      }} />
      <div style={{
        position: 'fixed',
        width: '400px',
        height: '400px',
        background: '#d946ef',
        borderRadius: '50%',
        filter: 'blur(100px)',
        opacity: '0.15',
        bottom: '-150px',
        right: '-150px',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      <div style={{ 
        display: 'flex', 
        gap: '16px', 
        flex: 1, 
        padding: '80px 16px 16px 16px', 
        overflow: 'hidden',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Webcam sidebar */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          minWidth: '360px',
          maxWidth: '360px',
        }}>
          <div style={{
            padding: '12px',
            background: 'rgba(124, 58, 237, 0.1)',
            borderRadius: '12px',
            border: '1px solid rgba(124, 58, 237, 0.3)',
            backdropFilter: 'blur(10px)',
          }}>
            <WebcamEmotion onEmotionUpdate={e => setEmotion(e.emotion)} />
          </div>
          <div style={{
            padding: '16px',
            background: 'rgba(124, 58, 237, 0.1)',
            borderRadius: '12px',
            border: '1px solid rgba(124, 58, 237, 0.3)',
            backdropFilter: 'blur(10px)',
            textAlign: 'center',
          }}>
            <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#b8a0ff' }}>
              Detected Emotion
            </p>
            <p style={{
              margin: 0,
              fontSize: '28px',
              fontWeight: 'bold',
              color: `hsl(${emotionToHue(emotion)}, 80%, 60%)`,
              textTransform: 'capitalize',
              letterSpacing: '0.5px',
            }}>
              {emotion}
            </p>
          </div>
        </div>

        {/* Chat area */}
        <div style={{ 
          flex: 1, 
          display: 'flex', 
          overflow: 'hidden',
          borderRadius: '12px',
          border: '1px solid rgba(124, 58, 237, 0.2)',
          background: 'rgba(15, 15, 46, 0.4)',
          backdropFilter: 'blur(10px)',
        }}>
          <Chat modelName={modelName} systemMessage={systemMessage} emotion={emotion} />
        </div>
      </div>
    </div>
  );
}

// Helper to color emotion by type
function emotionToHue(emotion) {
  const hueMap = {
    happy: 45,
    sad: 240,
    angry: 0,
    fear: 280,
    surprise: 45,
    disgust: 120,
    neutral: 235,
  };
  return hueMap[emotion.toLowerCase()] || 235;
}

export default App;

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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw' }}>
      {/* <Menubar
        modelName={modelName}
        systemMessage={systemMessage}
        onModelToggle={handleModelToggle}
        onSystemMessageChange={handleSystemMessageChange}
      /> */}

      <div style={{ display: 'flex', gap: '16px', flex: 1, padding: '80px 16px 16px 16px', overflow: 'hidden' }}>
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
            background: 'hsla(235, 30%, 8%, 0.6)',
            borderRadius: '8px',
            border: '0.25px solid hsla(235, 30%, 20%, 0.4)',
            backdropFilter: 'blur(1px)',
          }}>
            <WebcamEmotion onEmotionUpdate={e => setEmotion(e.emotion)} />
          </div>
          <div style={{
            padding: '12px',
            background: 'hsla(235, 30%, 8%, 0.6)',
            borderRadius: '8px',
            border: '0.25px solid hsla(235, 30%, 20%, 0.4)',
            backdropFilter: 'blur(1px)',
            textAlign: 'center',
          }}>
            <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: 'hsla(235, 55%, 80%, 0.7)' }}>
              Detected Emotion
            </p>
            <p style={{
              margin: 0,
              fontSize: '24px',
              fontWeight: 'bold',
              color: `hsl(${emotionToHue(emotion)}, 80%, 60%)`,
              textTransform: 'capitalize',
            }}>
              {emotion}
            </p>
          </div>
        </div>

        {/* Chat area */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' , margin:'2px', padding:'8px'}}>
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

import React, { useRef, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import { drawMesh } from '../utils/drawMesh';
import './styles/Chat.css';

// Simple component that captures webcam frames and sends them to the FER websocket
// server at ws://localhost:8000. It exposes the latest emotion via onEmotionUpdate.

function WebcamEmotion({ onEmotionUpdate, intervalMs = 1000 }) {
  const webcamRef = useRef(null);
  const socketRef = useRef(null);
  const canvasRef = useRef(null);
  const latestFacesRef = useRef(null);
  const [emotion, setEmotion] = useState('neutral');

  useEffect(() => {
    let model = null;
    let detectInterval = null;
    let senderInterval = null;

    const setup = async () => {
      // load blazeface for face boxes
      try {
        const blazeface = await import('@tensorflow-models/blazeface');
        model = await blazeface.load();
      } catch (e) {
        console.warn('Could not load blazeface model', e);
      }

      // open websocket
      try {
        const socket = new WebSocket('ws://localhost:8000/ferws');
        socketRef.current = socket;

        socket.onopen = () => {
          // send frames to FER server
          senderInterval = setInterval(() => {
            try {
              if (webcamRef.current) {
                const imageSrc = webcamRef.current.getScreenshot();
                if (imageSrc && socket.readyState === WebSocket.OPEN) {
                  const apiCall = { event: 'localhost:subscribe', data: { image: imageSrc } };
                  socket.send(JSON.stringify(apiCall));
                }
              }
            } catch (e) {
              console.warn('Failed to send frame', e);
            }
          }, intervalMs);

          // run face detection locally to draw boxes
          if (model) {
            detectInterval = setInterval(async () => {
              try {
                const video = webcamRef.current && webcamRef.current.video;
                if (video && video.readyState === 4) {
                  const faces = await model.estimateFaces(video, false);
                  // store latest faces for drawing
                  latestFacesRef.current = faces;
                }
              } catch (e) {
                // non-fatal
              }
            }, Math.max(200, intervalMs));
          }
        };

        socket.onmessage = event => {
          try {
            const pred_log = JSON.parse(event.data);
            const emo = pred_log.emotion || 'neutral';
            setEmotion(emo);
            if (typeof onEmotionUpdate === 'function') {
              onEmotionUpdate({ emotion: emo, scores: pred_log.predictions || {} });
            }

            // draw latest faces + emotion overlay
            try {
              const canvas = canvasRef.current;
              const ctx = canvas && canvas.getContext('2d');
              if (ctx && latestFacesRef.current) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                drawMesh(latestFacesRef.current, pred_log, ctx);
              }
            } catch (e) {
              // ignore drawing errors
            }
          } catch (e) {
            console.warn('Failed to parse websocket message', e);
          }
        };

        socket.onclose = () => {
          if (senderInterval) clearInterval(senderInterval);
          if (detectInterval) clearInterval(detectInterval);
        };

        socket.onerror = e => console.warn('WebSocket error', e);
      } catch (e) {
        console.warn('Could not open websocket', e);
      }
    };

    setup();

    return () => {
      try {
        if (senderInterval) clearInterval(senderInterval);
        if (detectInterval) clearInterval(detectInterval);
        if (socketRef.current) socketRef.current.close();
      } catch (e) {}
    };
  }, [onEmotionUpdate, intervalMs]);

  return (
    <div style={{ position: 'relative' }}>
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        videoConstraints={{ facingMode: 'user' }}
        style={{ width: 320, height: 240, borderRadius: 8 }}
      />
      <canvas
        ref={canvasRef}
        width={320}
        height={240}
        style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none' }}
      />
      <div style={{ position: 'absolute', left: 8, top: 8, color: '#fff', fontWeight: 700, textShadow: '0 0 6px rgba(0,0,0,0.6)' }}>
        {emotion}
      </div>
    </div>
  );
}

export default WebcamEmotion;

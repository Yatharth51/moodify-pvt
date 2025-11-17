import PropTypes from 'prop-types';
import './styles/MenuBar.css';
import './styles/Input.css';
import { useEffect, useState } from 'react';


Menubar.propTypes = {
  modelName: PropTypes.string,
  systemMessage: PropTypes.string,
  onModelToggle: PropTypes.func,
  onSystemMessageChange: PropTypes.func,
};

function Menubar(props) {
  const [emotion, setEmotion] = useState(props.emotion || 'neutral');

  useEffect(() => {
    // If the parent passes a live emotion prop, use it; otherwise poll the server.
    if (props.emotion) {
      setEmotion(props.emotion);
      return;
    }

    let mounted = true;
    const fetchEmotion = async () => {
      try {
        const res = await fetch('http://localhost:8001/emotion');
        if (res.ok) {
          const data = await res.json();
          if (mounted && data && data.emotion) setEmotion(data.emotion);
        }
      } catch (e) {
        // ignore
      }
    };

    fetchEmotion();
    const id = setInterval(fetchEmotion, 10000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [props.emotion]);
  const handleModelToggleChange = event => {
    props.onModelToggle(event.target.checked);
  };

  const handleSystemMessageChange = event => {
    props.onSystemMessageChange(event);
  };

  return (
    <div className="menubar">
      <input
        type="text"
        className="input"
        id="system-message"
        placeholder="Enter system message"
        value={props.systemMessage}
        onChange={handleSystemMessageChange}
      />

      <div style={{ marginLeft: '12px', color: '#fff', fontWeight: '600' }}>
        Emotion: {emotion}
      </div>

      <label className="slider-container">
        <input
          type="checkbox"
          autoComplete="off"
          checked={props.modelName === 'gpt-4'}
          onChange={handleModelToggleChange}
        />

        <span className="slider-track">
          <span className="model-label" id="model-label-left">
            {'GPT-3.5'}
          </span>
          <div className="slider"></div>
          <span className="model-label" id="model-label-right">
            {'GPT-4'}
          </span>
        </span>
      </label>
    </div>
  );
}

export default Menubar;

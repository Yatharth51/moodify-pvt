import { useNavigate } from 'react-router-dom';
import '../styles/Home.css';

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <div className="home-glow home-glow-1"></div>
      <div className="home-glow home-glow-2"></div>

      <div className="home-content">
        <h1 className="home-title">MOODIFY</h1>
        <p className="home-tagline">Your emotions. Your pace. Your learning.</p>

        <p className="home-description">
          Experience AI-powered learning tailored to your emotional state. Our advanced emotion detection 
          and adaptive content generation creates a personalized learning journey just for you.
        </p>

        <div className="home-button-group">
          <button
            className="home-btn home-btn-primary"
            onClick={() => navigate('/app')}
          >
            Get Started
          </button>
          
        </div>

        <div className="home-features">
          <div className="home-feature">
            <div className="home-feature-icon">😊</div>
            <div className="home-feature-title">Emotion Detection</div>
            <div className="home-feature-text">
              Real-time facial emotion recognition to understand your mood.
            </div>
          </div>
          <div className="home-feature">
            <div className="home-feature-icon">🧠</div>
            <div className="home-feature-title">Adaptive Learning</div>
            <div className="home-feature-text">
              Content adjusts based on your emotional state for better understanding.
            </div>
          </div>
          <div className="home-feature">
            <div className="home-feature-icon">⚡</div>
            <div className="home-feature-title">AI-Powered</div>
            <div className="home-feature-text">
              Powered by advanced LLMs for intelligent, personalized responses.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;

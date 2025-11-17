**Integration README**

- **Project:** Emotion-aware content generator (integrates `facial-emotion-recognition-master` + `reactGPT-master`)

**Overview**:
- This workspace runs two apps:
  - Emotion detection (WebCam client + FER backend) in `facial-emotion-recognition-master`.
  - Content-generation (ReactGPT frontend + Groq/LLM backend) in `reactGPT-master`.
- The emotion client detects emotions and posts a summary to the content server (`/emotion`) every 60s.
- The content frontend polls `/emotion` and prepends a `system` message with the detected emotion to chat requests so the LLM can personalize replies.

**Ports used (defaults)**:
- Emotion backend (FER WebSocket): `8000` (ws://localhost:8000)
- LLM/chat server: `8001` (http://localhost:8001)
- Emotion client (React dev server): default CRA dev port (usually 3000)
- ReactGPT frontend (Vite dev server): default Vite port (usually 5173)

**Prerequisites**:
- macOS with `zsh` (script uses Apple `Terminal` to open windows)
- Python 3.8+ and `python3 -m venv` available
- `npm` / Node.js installed
- Optional: set environment variable `GROQ_API_KEY` for the Groq client used by `reactGPT-master/server`.

**Quick start (automated)**
1. Make the helper script executable:
```bash
cd /Users/yatharth51/Desktop/emot
chmod +x run_all.sh
```
2. (Optional) Export `GROQ_API_KEY` in your terminal if you use Groq:
```bash
export GROQ_API_KEY=your_key_here
```
3. Run the script to install requirements and open each component in its own Terminal window:
```bash
./run_all.sh
```

**Manual start (step-by-step)**

1) Emotion backend (FER WebSocket)
```bash
cd /Users/yatharth51/Desktop/emot/facial-emotion-recognition-master/server
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

2) LLM / Chat server
```bash
cd /Users/yatharth51/Desktop/emot/reactGPT-master/server
# use same virtualenv or another; ensure dependencies are installed
pip install -r requirements.txt
# ensure GROQ_API_KEY is set or present in a .env file
uvicorn app:app --reload --port 8001
```

3) Emotion client (React)
```bash
cd /Users/yatharth51/Desktop/emot/facial-emotion-recognition-master/emotion-recognition
npm install
npm start
```

4) ReactGPT frontend
```bash
cd /Users/yatharth51/Desktop/emot/reactGPT-master/frontend
npm install
npm run dev
```

**Notes & troubleshooting**
- If ports `8000` or `8001` are busy, change them in the corresponding server start commands and in `facial-emotion-recognition-master/emotion-recognition/src/App.js` and `reactGPT-master/frontend/src/components/utils/SendServerRequest.jsx`.
- The integration uses a simple in-memory store in `reactGPT-master/server/app.py` for the latest emotion. For per-user/session tracking, add session IDs and persistent storage (Redis or DB).
- If `GROQ_API_KEY` is missing, the chat server may fail to call the Groq API. Either set the env var or modify `server/app.py` to use another backend.

**Files added**
- `run_all.sh` — helper script to start all components on macOS
- This top-level `README.md` — quick start + manual commands

If you want, I can:
- Make a `docker-compose.yml` instead of AppleScript-based terminal windows.
- Add per-session emotion storage and attach session IDs to emotion updates and chat requests.
- Run the stack here and report logs (if you want me to attempt that next).

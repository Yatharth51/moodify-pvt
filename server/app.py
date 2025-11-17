import os
from typing import List, Optional
from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from groq import Groq, RateLimitError
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register FER websocket endpoint if available
try:
    from fer_server import register_fer

    register_fer(app)
    print("✓ FER websocket endpoint registered at /ferws")
except Exception as e:
    # FER server optional; if dependencies missing, continue without registering
    import traceback
    print("✗ FER server registration failed (optional):")
    traceback.print_exc()

# Create a Groq client
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# Simple in-memory store for latest detected emotion
latest_emotion = {"emotion": "neutral", "scores": {}}


class Message(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: List[Message]
    model_type: str


class EmotionUpdate(BaseModel):
    emotion: str
    scores: Optional[dict] = None


async def generate(messages: List[Message], model_type: str):
    try:
        # Use the Groq client to create a streaming chat completion.
        response = client.chat.completions.create(
            model=model_type,
            messages=[message.model_dump() for message in messages],
            stream=True,
        )

        # `response` is an iterable of chunks when stream=True
        for chunk in response:
            try:
                content = ''
                # Extract content from chunk
                if hasattr(chunk, 'choices') and chunk.choices:
                    delta = chunk.choices[0].delta
                    if hasattr(delta, 'content') and delta.content:
                        content = delta.content

                if content:
                    yield content
            except Exception:
                # If chunk format is unexpected, yield its string repr for debugging
                yield str(chunk)

    except RateLimitError as e:
        yield f"RateLimitError: {str(e)}"
    except Exception as e:
        yield f"{type(e).__name__}: {str(e)}"


@app.post("/chat")
async def chatCompletion(request: ChatRequest):
    # Ensure the model always knows the latest detected emotion and how to adapt its tone.
    # We'll prepend a server-side system prompt that is authoritative and enforces the
    # user's rules about style while keeping content accurate.
    emotion = latest_emotion.get('emotion', 'neutral')

    # Normalize some common variants
    emap = {
        'fearful': 'fear',
        'fear': 'fear',
        'surprised': 'surprised',
        'surprise': 'surprised',
        'sad': 'sad',
        'happy': 'happy',
        'angry': 'angry',
        'disgusted': 'disgusted',
        'disgust': 'disgusted',
        'confused': 'confused',
    }
    normalized = emap.get(emotion.lower(), emotion.lower())

    system_directive = (
        "You are a helpful assistant. The user's detected emotion is '" + normalized + "'. "
        "Always begin your reply with a short sentence that acknowledges the detected emotion "
        "and signals the style you will use (for example: 'No need to be sad — here\'s your answer:'). "
        "Then provide the correct, factual answer. Adapt only the style (tone, brevity, empathy) as follows: "
        "- If the emotion is 'confused' or 'sad', explain in very simple, clear, step-by-step detail. "
        "- If the emotion is 'angry' or 'disgusted', be brief, calm, and direct. "
        "- If the emotion is 'fear', be reassuring and comforting. "
        "- If the emotion is 'happy' or 'surprised', be friendly and energetic. "
        "Accuracy is mandatory — do not change factual content. Only change how the answer is presented. "
        "Always explicitly mention the detected emotion near the start of your reply."
    )

    # Create a new messages list with the server directive first, then the client's messages.
    server_msg = Message(role='system', content=system_directive)
    combined = [server_msg] + request.messages

    assistant_response = generate(combined, request.model_type)
    return StreamingResponse(assistant_response, media_type='text/event-stream')


@app.post("/emotion")
async def receive_emotion(update: EmotionUpdate):
    # store latest emotion in memory (could be extended to per-session)
    latest_emotion['emotion'] = update.emotion
    latest_emotion['scores'] = update.scores or {}
    return {"status": "ok"}


@app.get("/emotion")
async def get_emotion():
    return latest_emotion


if __name__ == '__main__':
    import uvicorn
    # run on 8001 to avoid conflict with other local servers
    uvicorn.run(app, host='0.0.0.0', port=8001)

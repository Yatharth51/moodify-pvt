import json
import base64

from fastapi import WebSocket, WebSocketDisconnect

import cv2
import numpy as np
from fer.fer import FER

detector = FER()


def register_fer(app):
    """Register FER websocket endpoint on an existing FastAPI app instance."""

    @app.websocket("/ferws")
    async def websocket_endpoint(websocket: WebSocket):
        await websocket.accept()
        try:
            while True:
                try:
                    payload = await websocket.receive_text()
                    payload = json.loads(payload)
                    imageByt64 = payload['data']['image'].split(',')[1]
                    # decode and convert into image (using frombuffer instead of deprecated fromstring)
                    image_bytes = base64.b64decode(imageByt64)
                    image = np.frombuffer(image_bytes, np.uint8)
                    image = cv2.imdecode(image, cv2.IMREAD_COLOR)

                    if image is None:
                        print("[FER] Failed to decode image")
                        await websocket.send_json({
                            "predictions": {},
                            "emotion": "neutral"
                        })
                        continue

                    # Detect Emotion via FER
                    try:
                        prediction = detector.detect_emotions(image)
                        if prediction and len(prediction) > 0:
                            response = {
                                "predictions": prediction[0]['emotions'],
                                "emotion": max(prediction[0]['emotions'], key=prediction[0]['emotions'].get)
                            }
                        else:
                            # No face detected
                            response = {
                                "predictions": {},
                                "emotion": "neutral"
                            }
                    except Exception as e:
                        print(f"[FER] Emotion detection error: {e}")
                        response = {
                            "predictions": {},
                            "emotion": "neutral"
                        }
                    
                    await websocket.send_json(response)
                except json.JSONDecodeError as e:
                    print(f"[FER] JSON decode error: {e}")
                    await websocket.send_json({"emotion": "neutral", "predictions": {}})
                except Exception as e:
                    print(f"[FER] Payload processing error: {e}")
                    await websocket.send_json({"emotion": "neutral", "predictions": {}})
        except WebSocketDisconnect:
            print("[FER] WebSocket disconnected")
            return
        except Exception as e:
            print(f"[FER] Unexpected error: {e}")
            try:
                await websocket.close()
            except Exception:
                pass

    return websocket_endpoint

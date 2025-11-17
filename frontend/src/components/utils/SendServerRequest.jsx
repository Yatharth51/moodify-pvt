const BASE = 'http://localhost:8000';

export async function SendServerRequest(newMessages, props) {
  // If emotion is provided by the frontend (live webcam), use it; otherwise try to fetch stored emotion
  try {
    let emo = null;
    if (props && props.emotion) {
      emo = { emotion: props.emotion, scores: {} };
    } else {
      const emoRes = await fetch(`${BASE}/emotion`);
      if (emoRes.ok) emo = await emoRes.json();
    }

    if (emo) {
      const emotionGuidance = {
        happy: "The user is happy. Be cheerful, encouraging, and positive. Match their positive energy.",
        sad: "The user is sad. Be empathetic, supportive, and gentle. Acknowledge their feelings and provide comfort.",
        angry: "The user is angry. Be calm, understanding, and helpful. Acknowledge their frustration and help de-escalate.",
        surprised: "The user is surprised. Be engaging and interesting. Elaborate on unexpected information.",
        disgusted: "The user is disgusted. Be respectful of their discomfort and provide helpful alternatives.",
        fearful: "The user is fearful. Be reassuring, calm, and provide clear, step-by-step guidance.",
        neutral: "The user is calm and neutral. Provide clear, direct, and helpful information.",
      };

      const guidance = emotionGuidance[emo.emotion] || "Be helpful and responsive to the user's needs.";

      const emotionMsg = {
        role: 'system',
        content: `User's current emotion: ${emo.emotion}. ${guidance} Tailor your response to their emotional state.`,
      };
      newMessages = [emotionMsg, ...newMessages];
    }
  } catch (e) {
    console.warn('Could not obtain emotion:', e);
  }

  return await fetch(`${BASE}/chat`, {
    method: 'POST',
    body: JSON.stringify({
      messages: newMessages,
      model_type: props.modelName,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

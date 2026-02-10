from fastapi import APIRouter, UploadFile, File, Form
from pydantic import BaseModel
from ai_config import model
import io

router = APIRouter()

class ChatRequest(BaseModel):
    message: str

# 1. TEXT CHAT (Existing)
@router.post("/api/chat")
async def chat_with_sahayak(req: ChatRequest):
    return await generate_response(req.message)

# 2. VOICE CHAT (New - Works on all browsers)
@router.post("/api/chat-voice")
async def chat_with_voice(file: UploadFile = File(...)):
    try:
        # Read the audio file
        audio_bytes = await file.read()
        
        # Prepare the parts for Gemini (Audio + Instruction)
        parts = [
            {"mime_type": "audio/mp3", "data": audio_bytes},
            "Listen to this farmer's question and answer it as 'Sahayak' (Agriculture Expert). Keep the answer short and practical."
        ]
        
        # Generate Answer
        response = model.generate_content(parts)
        return {"reply": response.text.strip()}
        
    except Exception as e:
        return {"reply": f"Error processing audio: {str(e)}"}

# Helper function to keep logic in one place
async def generate_response(user_input):
    try:
        system_instruction = """
        You are 'Sahayak', an intelligent and friendly agriculture assistant for Indian farmers.
        1. Answer questions about crops, fertilizers, pests, and weather.
        2. If the user speaks Hindi (Hinglish), reply in Hindi (Hinglish).
        3. Keep answers short, practical, and easy to read.
        """
        prompt = f"{system_instruction}\n\nUser: {user_input}\nSahayak:"
        response = model.generate_content(prompt)
        return {"reply": response.text.strip()}
    except Exception as e:
        return {"reply": "Sorry, I am having trouble connecting. Please try again."}
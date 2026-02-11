from fastapi import APIRouter
from pydantic import BaseModel
from ai_config import model

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    language: str = "en"  # Default to English

@router.post("/api/chat")
async def chat_with_sahayak(req: ChatRequest):
    try:
        # Dynamic Instruction based on Language
        lang_instruction = "Reply in pure Hindi (Devanagari script)." if req.language == 'hi' else "Reply in simple English."

        prompt = f"""
        You are 'Sahayak', an agriculture expert.
        User Question: {req.message}
        
        Instructions:
        1. {lang_instruction}
        2. Keep the answer short, practical, and helpful for a farmer.
        3. If using Hindi, use easy-to-understand words.
        """
        
        response = model.generate_content(prompt)
        return {"reply": response.text.strip()}

    except Exception as e:
        return {"reply": "Service is busy. Please try again."}
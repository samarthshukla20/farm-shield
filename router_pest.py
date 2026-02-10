from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pydantic import BaseModel
from PIL import Image
import io
from ai_config import model
import json

router = APIRouter()

# --- 1. IMAGE SCAN (Existing) ---
@router.post("/api/pest-scan")
async def scan_pest(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))

        prompt = """
        You are an expert plant pathologist. Analyze this image.
        1. Identify the disease/pest (or say Healthy).
        2. Explain symptoms in 1 sentence.
        3. Give 2 organic/chemical remedies.
        
        Return STRICT JSON:
        {
            "diagnosis": "Name",
            "symptoms": "Description",
            "remedy": ["Step 1", "Step 2"],
            "severity": "Low/Medium/High"
        }
        """
        response = model.generate_content([prompt, image])
        clean_text = response.text.replace("```json", "").replace("```", "").strip()
        return json.loads(clean_text)

    except Exception as e:
        return {"error": str(e)}

# --- 2. TEXT QUERY (Keep for compatibility) ---
class VoiceQuery(BaseModel):
    query: str
    language: str = "en"

@router.post("/api/pest-query")
async def pest_text_query(req: VoiceQuery):
    return await generate_pest_solution(req.query)

# --- 3. NEW: AUDIO QUERY (Works on Brave/Mobile) ---
@router.post("/api/pest-query-voice")
async def pest_voice_query(file: UploadFile = File(...)):
    try:
        audio_bytes = await file.read()
        
        # Send Audio directly to Gemini
        parts = [
            {"mime_type": "audio/mp3", "data": audio_bytes},
            "You are Dr. Crop. Listen to this farmer's problem. Diagnose it and provide a short, practical solution in simple English (or Hindi if spoken)."
        ]
        
        response = model.generate_content(parts)
        return {"solution": response.text.strip()}

    except Exception as e:
        return {"error": f"Audio Error: {str(e)}"}

# Helper
async def generate_pest_solution(text):
    try:
        prompt = f"""
        Farmer's Problem: "{text}"
        Task: Diagnose and provide a short solution. Keep it conversational.
        """
        response = model.generate_content(prompt)
        return {"solution": response.text.strip()}
    except Exception as e:
        return {"error": str(e)}
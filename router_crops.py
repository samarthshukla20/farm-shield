import json
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from ai_config import model

router = APIRouter()

# Updated Request Model: Accepts GPS OR a text name
class LocationRequest(BaseModel):
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    location_name: Optional[str] = None

@router.post("/api/recommend")
async def recommend_crops(req: LocationRequest):
    try:
        # 1. Determine how to ask Gemini
        if req.location_name:
            location_context = f"Location: {req.location_name}"
        elif req.latitude and req.longitude:
            location_context = f"Latitude: {req.latitude}, Longitude: {req.longitude}"
        else:
            return {"error": "Please provide either GPS coordinates or a location name."}

        # 2. Prompt Engineering
        prompt = f"""
        I am a farmer. {location_context}.
        Current Month: February.
        
        Task:
        1. Identify the district and the typical soil type for this specific Indian location.
        2. Recommend the 3 BEST crops to plant right now.
        
        Return STRICT JSON only (no markdown):
        {{
            "location": "District, State",
            "soil_type": "e.g. Black Cotton Soil",
            "soil_characteristics": "Short description of moisture/nutrients",
            "crops": [
                {{ "name": "Crop Name", "reason": "Why it works here", "water_need": "Low/Med/High" }},
                {{ "name": "Crop Name", "reason": "Why it works here", "water_need": "Low/Med/High" }},
                {{ "name": "Crop Name", "reason": "Why it works here", "water_need": "Low/Med/High" }}
            ]
        }}
        """
        response = model.generate_content(prompt)
        clean_text = response.text.replace("```json", "").replace("```", "").strip()
        return json.loads(clean_text)
        
    except Exception as e:
        return {"error": str(e)}
import json
from fastapi import APIRouter
from pydantic import BaseModel
from ai_config import model  # Import the shared model we created earlier

router = APIRouter()

class LocationRequest(BaseModel):
    latitude: float
    longitude: float

@router.post("/api/recommend")
async def recommend_crops(req: LocationRequest):
    try:
        # Prompt Engineering: We act as a Soil Scientist
        prompt = f"""
        I am a farmer at Latitude: {req.latitude}, Longitude: {req.longitude}.
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
        # Clean the response to ensure valid JSON
        clean_text = response.text.replace("```json", "").replace("```", "").strip()
        return json.loads(clean_text)
        
    except Exception as e:
        return {"error": str(e)}
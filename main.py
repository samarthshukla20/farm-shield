import os
import io
import json
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai
from PIL import Image
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GOOGLE_API_KEY = os.getenv("GEMINI_API_KEY")

# --- SMART MODEL SELECTOR ---
def get_best_model():
    """Automatically finds a working model from the user's account."""
    if not GOOGLE_API_KEY:
        print("❌ API Key missing.")
        return None

    genai.configure(api_key=GOOGLE_API_KEY)
    
    try:
        # Get all models that support content generation
        available_models = [m.name for m in genai.list_models() if 'generateContent' in m.supported_generation_methods]
        print(f"📋 Found models: {available_models}")
        
        # Priority list: Try Flash first (fast), then Pro (reliable)
        priority_list = [
            "models/gemini-1.5-flash",
            "models/gemini-1.5-flash-latest",
            "models/gemini-1.5-flash-001",
            "models/gemini-pro",
            "models/gemini-1.5-pro"
        ]

        for model_name in priority_list:
            if model_name in available_models:
                print(f"🚀 Selected Model: {model_name}")
                # Return the model object
                # Note: 'gemini-pro' usually requires just the name without 'models/' prefix in instantiation
                clean_name = model_name.replace("models/", "")
                return genai.GenerativeModel(clean_name)
        
        # Fallback: Just pick the first one available
        if available_models:
            first_model = available_models[0].replace("models/", "")
            print(f"⚠️ specific models not found. Using fallback: {first_model}")
            return genai.GenerativeModel(first_model)
            
    except Exception as e:
        print(f"⚠️ Could not auto-detect models: {e}")
        # Extreme fallback
        return genai.GenerativeModel('gemini-pro')

# Initialize the model once on startup
model = get_best_model()

@app.get("/")
def home():
    return {"status": "Online", "message": "FarmShield Brain is Active 🧠"}

@app.post("/api/analyze")
async def analyze_crop(file: UploadFile = File(...)):
    if not model:
        return {"error": "AI Model failed to initialize. Check server logs."}
        
    try:
        # 1. Read Image
        image_data = await file.read()
        image = Image.open(io.BytesIO(image_data))
        
        # 2. Prompt
        prompt = """
        You are an expert Indian Agronomist. Analyze this crop image.
        1. Identify the disease or pest. If healthy, say "Healthy".
        2. Return ONLY valid JSON.
        3. Structure:
        {
            "disease_name": "Name of disease",
            "status": "Critical",
            "description": "Short description in English",
            "treatment_steps": ["Step 1", "Step 2"],
            "medicine": "Medicine Name"
        }
        """
        
        # 3. Generate
        response = model.generate_content([prompt, image])
        
        # 4. Clean Response
        clean_text = response.text.replace("```json", "").replace("```", "").strip()
        return json.loads(clean_text)

    except Exception as e:
        print(f"Error: {e}")
        return {"error": str(e)}

@app.get("/api/weather")
def get_weather():
    return {
        "location": "Kothri Kalan",
        "temp": "32°C",
        "alert": True,
        "alert_message": "Heavy rain expected. Delay irrigation."
    }

'''
uvicorn main:app --reload
'''
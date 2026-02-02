import os
import google.generativeai as genai
from dotenv import load_dotenv

# Load env variables
load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("❌ Error: API Key not found in .env")
else:
    print(f"✅ API Key found: {api_key[:5]}...")
    genai.configure(api_key=api_key)

    print("\n🔍 Listing available models for this key...")
    try:
        # Ask Google what models we can use
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                print(f" - {m.name}")
    except Exception as e:
        print(f"❌ Connection Error: {e}")
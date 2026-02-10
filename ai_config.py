import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("No API Key found")

genai.configure(api_key=api_key)

# "gemini-flash-latest" points to the stable version with better limits
model = genai.GenerativeModel('gemini-flash-lite-latest')
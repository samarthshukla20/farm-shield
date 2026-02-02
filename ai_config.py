import os
import google.generativeai as genai
from dotenv import load_dotenv

# Load env variables
load_dotenv()

# Setup API Key
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("No API Key found. Please check your .env file")

genai.configure(api_key=api_key)

# Initialize Model
# We use 'flash' because it's fast and free
model = genai.GenerativeModel('gemini-2.5-flash')
import httpx
from fastapi import APIRouter
from pydantic import BaseModel
from ai_config import model

router = APIRouter()

class WeatherRequest(BaseModel):
    latitude: float
    longitude: float

@router.post("/api/weather")
async def get_weather(req: WeatherRequest):
    try:
        # 1. Fetch Real Weather Data (Open-Meteo API - Free)
        url = f"https://api.open-meteo.com/v1/forecast?latitude={req.latitude}&longitude={req.longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto"
        
        async with httpx.AsyncClient() as client:
            resp = await client.get(url)
            weather_data = resp.json()

        # 2. Extract Key Values
        current = weather_data.get("current", {})
        daily = weather_data.get("daily", {})
        
        temp = current.get("temperature_2m", 0)
        humidity = current.get("relative_humidity_2m", 0)
        wind = current.get("wind_speed_10m", 0)
        code = current.get("weather_code", 0)

        # 3. Ask Gemini for a "Farming Insight" based on this weather
        prompt = f"""
        Current Weather for a farm:
        Temperature: {temp}°C
        Humidity: {humidity}%
        Wind: {wind} km/h
        Condition Code: {code} (WMO code)
        
        Give a 1-sentence actionable farming tip based strictly on this weather (e.g., irrigation advice, pest warning).
        Keep it short and professional.
        """
        ai_response = model.generate_content(prompt)
        advice = ai_response.text.strip()

        return {
            "temperature": temp,
            "humidity": humidity,
            "wind_speed": wind,
            "weather_code": code,
            "ai_advice": advice,
            "forecast": daily # Raw daily data for the frontend to map
        }

    except Exception as e:
        return {"error": str(e)}
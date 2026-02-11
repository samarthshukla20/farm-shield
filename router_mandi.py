from fastapi import APIRouter
import random
from datetime import date

router = APIRouter()

# Base Data: Simulated average prices (Per Quintal)
MARKET_DATA = {
    "Madhya Pradesh": [
        {"name": "Wheat (Sharbati)", "market": "Sehore Mandi", "base_price": 3200},
        {"name": "Soybean", "market": "Ujjain Mandi", "base_price": 4100},
        {"name": "Gram (Chana)", "market": "Vidisha Mandi", "base_price": 5400},
        {"name": "Garlic", "market": "Mandsaur Mandi", "base_price": 9000},
        {"name": "Maize", "market": "Chhindwara Mandi", "base_price": 2100},
    ],
    "Maharashtra": [
        {"name": "Onion", "market": "Lasalgaon Mandi", "base_price": 1800},
        {"name": "Cotton", "market": "Akola Mandi", "base_price": 7200},
        {"name": "Sugarcane", "market": "Kolhapur Mandi", "base_price": 2900},
        {"name": "Pomegranate", "market": "Solapur Mandi", "base_price": 8500},
    ],
    "Punjab": [
        {"name": "Rice (Basmati)", "market": "Amritsar Mandi", "base_price": 4500},
        {"name": "Wheat", "market": "Ludhiana Mandi", "base_price": 2275},
        {"name": "Mustard", "market": "Bhatinda Mandi", "base_price": 5100},
    ],
    "Uttar Pradesh": [
        {"name": "Potato", "market": "Agra Mandi", "base_price": 950},
        {"name": "Sugarcane", "market": "Meerut Mandi", "base_price": 3100},
        {"name": "Mango (Dasheri)", "market": "Lucknow Mandi", "base_price": 5500},
    ]
}

@router.get("/api/mandi")
async def get_mandi_rates(state: str = "Madhya Pradesh"):
    # Default to MP if state not found
    items = MARKET_DATA.get(state, MARKET_DATA["Madhya Pradesh"])
    
    results = []
    # Add simulation logic (Random fluctuation)
    for item in items:
        # Randomly fluctuate price by -5% to +5%
        fluctuation = random.randint(-150, 150)
        current_price = item["base_price"] + fluctuation
        
        # Determine trend
        trend = "stable"
        if fluctuation > 50: trend = "up"
        elif fluctuation < -50: trend = "down"
        
        results.append({
            "commodity": item["name"],
            "market": item["market"],
            "price": current_price,
            "min_price": current_price - random.randint(100, 300),
            "max_price": current_price + random.randint(100, 300),
            "trend": trend,
            "date": date.today().strftime("%d %b %Y")
        })
        
    return results
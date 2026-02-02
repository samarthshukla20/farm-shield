from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from router_crops import router as crops_router
from router_weather import router as weather_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(crops_router)
app.include_router(weather_router)

# Health Check
@app.get("/")
async def root():
    return {"status": "FarmShield Brain is Online 🟢"}

'''
uvicorn app:app --reload
'''
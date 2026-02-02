from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import the crop feature we made
from router_crops import router as crops_router

# Initialize the App
app = FastAPI()  # <--- THIS IS THE MISSING LINE CAUSING THE ERROR

# Setup Connectivity (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Connect the Crop Advisor Feature
app.include_router(crops_router)

# Health Check
@app.get("/")
async def root():
    return {"status": "FarmShield Brain is Online 🟢"}

'''
uvicorn app:app --reload
'''
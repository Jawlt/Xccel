from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import public, private
import os

app = FastAPI()

# Include routes
app.include_router(public.router, prefix="/public", tags=["Public"])
app.include_router(private.router, prefix="/private", tags=["Private"])

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Allow requests from React app
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

@app.get("/")
async def root():
    return {"message": "Welcome to the FastAPI Auth0 Backend"}

from fastapi import APIRouter, Request
from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

# MongoDB setup
MONGODB_URI = os.getenv("MONGODB_URI")
client = MongoClient(MONGODB_URI)
db = client["Hackville2025"]
users_collection = db["users"]

@router.get("/")
async def public_route():
    return {"message": "This is a public route accessible to everyone."}

@router.post("/add_user")
async def update_user(request: Request):
    print("Request received at /public/add_user")
    user_data = await request.json()
    print("User Data:", user_data)

    # Extract user fields
    user_id = user_data.get("id")
    name = user_data.get("name", "N/A")
    email = user_data.get("email", "N/A")
    picture = user_data.get("picture", "N/A")

    if not user_id:
        return {"error": "User ID is required."}

    # Check if the user already exists in the database
    existing_user = users_collection.find_one({"id": user_id})

    if existing_user:
        print("User already exists:", existing_user)
        return {"message": "User already exists in the database. No update performed."}

    # Upsert user data into MongoDB
    users_collection.update_one(
        {"id": user_id},  # Match by user ID
        {
            "$set": {  # Update or insert these fields
                "name": name,
                "email": email,
                "picture": picture,
                "apiKey": "",
            },
            "$setOnInsert": {"id": user_id},  # Set on insert only
        },
        upsert=True,  # Create the document if it doesn't exist
    )

    return {"message": "User added successfully."}

@router.post("/updateOpenAiKey")
async def update_open_ai_key(request: Request):
    request_data = await request.json()
    
    user_id = request_data.get("userId")
    api_key = request_data.get("apiKey")
    print(api_key)

    if not user_id or not api_key:
        return {"error": "User ID and API key are required."}

    # Update or insert the user's API key
    users_collection.update_one(
        {"id": user_id},
        {"$set": {"apiKey": api_key}},
        upsert=True
    )

    return {"message": "API key updated successfully."}

@router.post("/getOpenAiKey")
async def get_open_ai_key(request: Request):
    request_data = await request.json()
    
    user_id = request_data.get("userId")

    if not user_id:
        return {"error": "User ID is required."}

    # Find user in the database by userId and retrieve the apiKey field
    user = users_collection.find_one({"id": user_id}, {"_id": 0, "apiKey": 1})

    if not user:
        return {"error": "User not found."}
    
    # Ensure user is a dictionary and safely get the 'apiKey' field
    api_key = user.get("apiKey", "")

    # Print for debugging purposes
    print(f"Retrieved API Key for user {user_id}: {api_key}")

    return {"apiKey": api_key}

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
            },
            "$setOnInsert": {"id": user_id},  # Set on insert only
        },
        upsert=True,  # Create the document if it doesn't exist
    )

    return {"message": "User added successfully."}

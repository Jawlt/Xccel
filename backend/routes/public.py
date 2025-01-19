from fastapi import FastAPI, Request, APIRouter, HTTPException
from pymongo import MongoClient
import os
from dotenv import load_dotenv
from youtube_transcript_api import YouTubeTranscriptApi
from datetime import timedelta
from openai import OpenAI
from typing import List, Dict
from pydantic import BaseModel

load_dotenv()

router = APIRouter()

# MongoDB setup
MONGODB_URI = os.getenv("MONGODB_URI")
client = MongoClient(MONGODB_URI)
db = client["Hackville2025"]
users_collection = db["users"]
youtube_collection = db["youtube"]

# OpenAI setup
openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

class MessageRequest(BaseModel):
    message: str

def format_time(seconds):
    """Helper function to convert seconds to hh:mm:ss format."""
    return str(timedelta(seconds=seconds))

def create_text_chunks(transcript_entries: List[Dict], chunk_size: int = 1000, chunk_overlap: int = 50) -> List[str]:
    """Split text into overlapping chunks."""
    chunks = []
    current_chunk = []
    current_length = 0
    
    for entry in transcript_entries:
        text = f"[{format_time(entry['start'])}] : {entry['text']}"
        
        if current_length + len(text) > chunk_size and current_chunk:
            # Save current chunk
            chunks.append(" ".join(current_chunk))
            
            # Start new chunk with overlap
            overlap_start = max(0, len(current_chunk) - int(len(current_chunk) * (chunk_overlap / chunk_size)))
            current_chunk = current_chunk[overlap_start:]
            current_length = sum(len(text) + 1 for text in current_chunk)
        
        current_chunk.append(text)
        current_length += len(text) + 1
    
    # Add the last chunk if it's not empty
    if current_chunk:
        chunks.append(" ".join(current_chunk))
    
    return chunks

@router.get("/transcript/{video_id}")
async def get_transcript(video_id: str):
    try:
        print(f"Processing request for video_id: {video_id}")
        
        # Check if any documents with this video ID exist
        existing_documents = youtube_collection.find_one({"videoId": video_id})
        
        if existing_documents:
            print("Transcript chunks found in the database.")
            # Return the first chunk's text as a sample
            return {"transcript": existing_documents["text"]}
        
        print("No transcript found in the database. Fetching from YouTube...")
        # Clear ALL documents from the collection before adding new ones
        youtube_collection.delete_many({})
        print("Cleared all existing documents from the collection.")
        
        # Fetch transcript from YouTube
        transcript = YouTubeTranscriptApi.get_transcript(video_id)
        
        # Create chunks
        chunks = create_text_chunks(transcript)
        embedded_chunks = []
        
        print("Creating embeddings for transcript chunks...")
        for chunk in chunks:
            try:
                embedding_response = openai_client.embeddings.create(
                    model="text-embedding-ada-002",
                    input=chunk
                )
                embedded_chunks.append({
                    "text": chunk,
                    "embedding": embedding_response.data[0].embedding,
                    "videoId": video_id
                })
            except Exception as e:
                print(f"Error generating embedding for a chunk: {str(e)}")
                continue
        
        if embedded_chunks:
            print(f"Storing {len(embedded_chunks)} embedded chunks in the database...")
            youtube_collection.insert_many(embedded_chunks)
            
            print("Returning the first chunk as a sample.")
            return {"transcript": embedded_chunks[0]["text"]}
        
        return {"error": "No transcript found"}
    except Exception as e:
        print(f"An error occurred: {str(e)}")
        return {"error": str(e)}

@router.post("/chat", response_model=Dict[str, str])
async def search_context(request: MessageRequest):
    try:
        query_embedding_response = openai_client.embeddings.create(
            model="text-embedding-ada-002",
            input=request.message
        )
        query_embedding = query_embedding_response.data[0].embedding

        pipeline = [
            {
                "$vectorSearch": {
                    "index": "vector_search_index",
                    "path": "embedding",
                    "queryVector": query_embedding,
                    "numCandidates": 100,
                    "limit": 5
                }
            }
        ]

        results = list(youtube_collection.aggregate(pipeline))
        contexts = [doc["text"] for doc in results]
        concatenated_context = " ".join(contexts)
        
        return {"context": concatenated_context}
    except Exception as e:
        print(f"Search error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/add_user")
async def update_user(request: Request):
    print("Request received at /public/add_user")
    user_data = await request.json()
    print("User Data:", user_data)

    user_id = user_data.get("id")
    name = user_data.get("name", "N/A")
    email = user_data.get("email", "N/A")
    picture = user_data.get("picture", "N/A")

    if not user_id:
        return {"error": "User ID is required."}

    existing_user = users_collection.find_one({"id": user_id})

    if existing_user:
        print("User already exists:", existing_user)
        return {"message": "User already exists in the database. No update performed."}

    users_collection.update_one(
        {"id": user_id},
        {
            "$set": {
                "name": name,
                "email": email,
                "picture": picture,
            },
            "$setOnInsert": {"id": user_id},
        },
        upsert=True,
    )

    return {"message": "User added successfully."}
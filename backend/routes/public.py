from fastapi import FastAPI, Request, APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pymongo import MongoClient
import os
from dotenv import load_dotenv
from youtube_transcript_api import YouTubeTranscriptApi
from datetime import timedelta
from openai import OpenAI
from typing import List, Dict
from pydantic import BaseModel
import json

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

class GPTRequest(BaseModel):
    message: str
    context: str

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
            chunks.append(" ".join(current_chunk))
            overlap_start = max(0, len(current_chunk) - int(len(current_chunk) * (chunk_overlap / chunk_size)))
            current_chunk = current_chunk[overlap_start:]
            current_length = sum(len(text) + 1 for text in current_chunk)
        
        current_chunk.append(text)
        current_length += len(text) + 1
    
    if current_chunk:
        chunks.append(" ".join(current_chunk))
    
    return chunks

async def stream_gpt_response(messages):
    try:
        print("\nSending messages to GPT:")
        for msg in messages:
            print(f"\nRole: {msg['role']}")
            print(f"Content: {msg['content']}\n")
            
        response = openai_client.chat.completions.create(
            model="gpt-4",
            messages=messages,
            temperature=0.7,
            max_tokens=500,
            stream=True
        )
        
        for chunk in response:
            if chunk.choices[0].delta.content is not None:
                yield f"data: {json.dumps({'content': chunk.choices[0].delta.content})}\n\n"
    except Exception as e:
        print(f"\nError in stream_gpt_response: {str(e)}")
        yield f"data: {json.dumps({'error': str(e)})}\n\n"
    finally:
        yield "data: [DONE]\n\n"

@router.get("/transcript/{video_id}")
async def get_transcript(video_id: str):
    try:
        print(f"Processing request for video_id: {video_id}")
        
        existing_documents = youtube_collection.find_one({"videoId": video_id})
        
        if existing_documents:
            print("Transcript chunks found in the database.")
            return {"transcript": existing_documents["text"], "status": "completed"}
        
        print("No transcript found in the database. Fetching from YouTube...")
        youtube_collection.delete_many({})
        print("Cleared all existing documents from the collection.")
        
        transcript = YouTubeTranscriptApi.get_transcript(video_id)
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
            return {"transcript": embedded_chunks[0]["text"], "status": "completed"}
        
        return {"error": "No transcript found", "status": "error"}
    except Exception as e:
        print(f"An error occurred: {str(e)}")
        return {"error": str(e), "status": "error"}

@router.post("/chat")
async def search_context(request: MessageRequest):
    try:
        print(f"\nSearching context for message: {request.message}")
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
        
        print(f"\nFound context: {concatenated_context}\n")
        return {"context": concatenated_context}
    except Exception as e:
        print(f"Search error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/gpt")
async def get_gpt_response(request: GPTRequest):
    try:
        print("\nReceived GPT request:")
        print(f"Message: {request.message}")
        print(f"Context: {request.context}")

        system_prompt = """You are a helpful AI assistant that answers questions about YouTube videos. 
        Use the provided context from the video transcript to answer the user's question.
        Include relevant timestamps from the context in your response when appropriate.
        Only provide one time stamps where the answer to their search will begin.
        Provide the time stamp in the form HH:MM:SS (hour, minute, second).
        If you cannot find relevant information in the context, say so."""

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Context from video:\n{request.context}\n\nUser question: {request.message}"}
        ]

        return StreamingResponse(
            stream_gpt_response(messages),
            media_type="text/event-stream"
        )
    except Exception as e:
        print(f"GPT error: {str(e)}")
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
                "apiKey": "",
            },
            "$setOnInsert": {"id": user_id},
        },
        upsert=True,
    )

    return {"message": "User added successfully."}
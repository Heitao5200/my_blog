 
from fastapi import FastAPI
import httpx
app = FastAPI()

@app.get("/data")
async def fetch_data():
    async with httpx.AsyncClient() as client:
        response = await client.get("https://api.example.com/data")
        return response.json()
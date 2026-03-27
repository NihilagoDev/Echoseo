import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://echoseo.hartman.sd-lab.nl",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5500",
        "http://127.0.0.1:5500"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SERPAPI_KEY = os.getenv("SERPAPI_KEY")

class SearchRequest(BaseModel):
    query: str

@app.get("/")
def root():
    return {"status": "ok"}

@app.post("/api/search")
def search(req: SearchRequest):
    if not SERPAPI_KEY:
        raise HTTPException(status_code=500, detail="SERPAPI_KEY not set")

    params = {
        "engine": "google",
        "q": req.query,
        "api_key": SERPAPI_KEY,
        "num": 10
    }

    try:
        response = requests.get(
            "https://serpapi.com/search.json",
            params=params,
            timeout=20
        )
        response.raise_for_status()
        data = response.json()
    except requests.RequestException as e:
        raise HTTPException(status_code=502, detail=f"Search provider error: {str(e)}")

    organic_results = data.get("organic_results", [])

    hits = []
    for item in organic_results:
        hits.append({
            "title": item.get("title", "Untitled"),
            "url": item.get("link", ""),
            "display_url": item.get("displayed_link", item.get("link", "")),
            "snippet": item.get("snippet", ""),
            "source": item.get("source", "Google")
        })

    summary = f"Returned {len(hits)} live search results for '{req.query}'."

    suggestions = [
        "Inspect whether the top results belong to the same identity",
        "Add confidence scoring per result type",
        "Separate search hits from breach findings later",
        "Store matched sources for export"
    ]

    score = min(100, len(hits) * 9 + 10) if hits else 0

    return {
        "score": score,
        "summary": summary,
        "suggestions": suggestions,
        "hits": hits
    }
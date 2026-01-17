import os
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class CodeRequest(BaseModel):
    code: str
    language: str

@app.post("/analyze")
async def analyze_code(request: CodeRequest):
    # Gemini 2.5 Flash is optimized for speed and structured coding tasks
    model = genai.GenerativeModel('gemini-2.5-flash')
    
    prompt = f"""
    You are a Senior Software Architect. Analyze this {request.language} code.
    Return ONLY a JSON object with these keys:
    - "summary": A professional explanation of the logic.
    - "complexity": {{"time": "Big O", "space": "Big O"}}
    - "optimization": "A significantly improved version of the code (e.g., using DP instead of recursion, or better data structures)."
    - "why_optimized": "A 1-sentence explanation of why the optimized version is better."
    - "translation": "Idiomatic Python (if source is C++) or C++ (if source is Python)."
    
    Code:
    {request.code}
    """

    try:
        response = model.generate_content(prompt, generation_config={"response_mime_type": "application/json"})
        return json.loads(response.text)
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail="AI Analysis failed. Check your API key.")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
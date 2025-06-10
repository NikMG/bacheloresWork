from fastapi import FastAPI, UploadFile, File, Query, Form
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from typing import List, Dict, Any
import json
from .algorithms.qualitative import process_qualitative
from .algorithms.quantitative import process_quantitative

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/process")
async def process_data(
    file: UploadFile = File(...),
    method: str = Form(...)
):
    try:
        # Read the uploaded file
        df = pd.read_csv(file.file, sep=';', encoding='latin1')
        
        print(f"Processing data with method: {method}")
        print(f"DataFrame columns: {df.columns.tolist()}")
        print(f"DataFrame shape: {df.shape}")
        
        # Process data based on selected method
        if method == "qualitative":
            result = process_qualitative(df)
        elif method == "quantitative":
            result = process_quantitative(df)
        else:
            return {"error": "Invalid method selected"}
        
        print(f"Result structure: {result.keys()}")
        return result
    except Exception as e:
        print(f"Error in process_data: {str(e)}")
        return {"error": str(e)}
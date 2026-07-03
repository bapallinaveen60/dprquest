from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import shutil
import tempfile
from typing import Optional, List

# Import our simulator and parser functions
from app.simulators.dsd import simulate_dsd_properties
from app.simulators.retrieval import generate_storm_column, run_retrieval_pipeline
from app.parser.hdf5_reader import read_gpm_hdf5, generate_sample_granule

app = FastAPI(title="GPM-DPR Explorer API", description="FastAPI Backend for Satellite Rainfall Retrieval Learning Platform")

# Configure CORS so our Next.js frontend can call the backend endpoints
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Schemas ---
class DSDRequest(BaseModel):
    d_m: float
    n_w: float
    mu: Optional[float] = 3.0
    snow_fraction: Optional[float] = 0.0

class RetrievalRequest(BaseModel):
    storm_height: Optional[float] = 8.0
    freezing_level: Optional[float] = 4.0
    surface_rain_rate: Optional[float] = 10.0
    d_m_surface: Optional[float] = 1.5
    noise_level: Optional[float] = 0.5

class TutorRequest(BaseModel):
    question: str
    context: Optional[str] = None

# --- API Endpoints ---
@app.get("/")
def read_root():
    return {"status": "ok", "message": "GPM-DPR Explorer Backend is running."}

@app.post("/api/simulate/dsd")
def simulate_dsd_endpoint(req: DSDRequest):
    try:
        # Scale n_w to correct scale if user inputs base 10 exponent (e.g. 8000)
        # Standard GPM Nw ranges from 10^3 to 10^5 m^-3 mm^-1
        res = simulate_dsd_properties(req.d_m, req.n_w, req.mu, req.snow_fraction)
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/simulate/retrieval")
def simulate_retrieval_endpoint(req: RetrievalRequest):
    try:
        # 1. Generate the true vertical storm column
        storm_data = generate_storm_column(
            storm_height=req.storm_height,
            freezing_level=req.freezing_level,
            surface_rain_rate=req.surface_rain_rate,
            d_m_surface=req.d_m_surface,
            noise_level=req.noise_level
        )
        
        # 2. Run the Level-2 algorithm solver
        retrieval_res = run_retrieval_pipeline(storm_data)
        
        # 3. Combine both outputs
        return {
            "truth": storm_data,
            "retrieved": retrieval_res
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/granule/sample")
def get_sample_granule_endpoint():
    try:
        return generate_sample_granule()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/granule/upload")
def upload_granule_endpoint(file: UploadFile = File(...)):
    if not file.filename.endswith(('.h5', '.hdf5', '.he5')):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a GPM HDF5 file.")
        
    try:
        # Save uploaded file to temp file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".h5") as tmp:
            shutil.copyfileobj(file.file, tmp)
            tmp_path = tmp.name
            
        # Parse it
        parsed_data = read_gpm_hdf5(tmp_path)
        
        # Clean up temp file
        if os.path.exists(tmp_path):
            os.remove(tmp_path)
            
        return parsed_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse granule: {str(e)}")

@app.post("/api/tutor/ask")
def tutor_ask_endpoint(req: TutorRequest):
    q = req.question.lower().strip()
    
    # Socratic Socratic dialogues for satellite radar learning
    if "dfr" in q or "dual frequency ratio" in q or "frequency" in q:
        reply = (
            "### Let's think about DFR (Dual-Frequency Ratio)\n\n"
            "Imagine you have two different sizes of balls (like golf balls and basketballs) and you throw them into a forest of trees. Which one gets deflected or stopped more easily by small branches?\n\n"
            "This is what happens when GPM shines a longer Ku-band wave and a shorter Ka-band wave into rain. What do you think happens to the shorter Ka-band wave when it hits large raindrops compared to the longer Ku-band wave?\n\n"
            "1. Does it bounce back identically?\n"
            "2. Or does it get blocked and scatter differently (Mie scattering)?\n\n"
            "Let me know what you think!"
        )
    elif "bright band" in q or "melting" in q or "freezing" in q:
        reply = (
            "### The Mystery of the Melting Layer\n\n"
            "Let's imagine you are looking at a dry snowflake falling through the air. Now, imagine it starts to melt. It becomes covered in a wet water film, but it hasn't collapsed into a tiny drop yet.\n\n"
            "Water reflects radar signals much better than dry ice. If you have a large particle that is coated in liquid water, what do you think it looks like to the radar?\n\n"
            "Does it look like a small raindrop, or does it look like a giant water mirror?\n\n"
            "Tell me your thoughts on how this affects the radar reflection intensity at that altitude!"
        )
    elif "attenuation" in q or "loss" in q or "absorption" in q:
        reply = (
            "### Attenuation: The Fog Analogy\n\n"
            "Have you ever driven in heavy fog with your high beams on? The light gets dimmer as it goes forward because the fog absorbs and scatters the light. That's attenuation.\n\n"
            "Radar beams do the same thing in rain columns. If the beam loses strength as it travels down, what will happen to the measured reflectivity values at the bottom of the storm?\n\n"
            "Will they look smaller or larger than they actually are? And how can we restore the lost energy?"
        )
    elif "srt" in q or "surface reference" in q or "pia" in q:
        reply = (
            "### The Ocean Mirror Clue\n\n"
            "If you are looking at a mirror in a clean room, you see a sharp, bright reflection. If someone fills the room with thick smoke, the reflection in the mirror looks dim.\n\n"
            "If you know exactly how bright the mirror *should* be, and you measure how much dimmer it looks through the smoke, what can you calculate about the smoke?\n\n"
            "How does GPM use the ocean surface as this 'mirror' to estimate rain attenuation?"
        )
    elif "rain type" in q or "classification" in q or "csf" in q or "convective" in q or "stratiform" in q:
        reply = (
            "### Convective vs. Stratiform Detective\n\n"
            "Imagine two types of storms: one is a quiet, steady rain that falls in even sheets; the other is a violent boiling pot of water with strong upward winds mixing ice and water.\n\n"
            "Which of these two storms do you think will form a clean, horizontal melting line (Bright Band) as ice turns to rain?\n\n"
            "And what will happen in the violent updraft storm?"
        )
    elif "pipeline" in q or "retrieve" in q or "slv" in q or "order" in q:
        reply = (
            "### The Retrieval Chain\n\n"
            "Retrieving rain rate from space is a puzzle where you must first clean the noise (PRE), find the melting point (VER), classify the storm type (CSF), estimate the total signal loss (SRT), calculate the drop sizes (DSD), and finally solve for the rain rate (SLV).\n\n"
            "Why do you think we must classify the storm (CSF) *before* we calculate the drop sizes (DSD) and rain rate? How do you think the storm type changes the sizes of the raindrops?"
        )
    else:
        reply = (
            "Hello! I am your GPM Socratic Guide.\n\n"
            "I won't give you the answers directly—instead, I'm here to help you discover them yourself. What concept are you exploring right now?\n\n"
            "- **Bright Band / Melting Layer** (Why does it spike?)\n"
            "- **Ku vs. Ka / DFR** (Why do different frequencies respond differently?)\n"
            "- **Attenuation / Signal Loss** (What absorbs the radar pulse?)\n"
            "- **SRT / Ocean Mirror** (How does the sea surface help us?)\n"
            "- **CSF / Classification** (Stratiform vs. Convective rain)\n"
            "- **Retrieval Pipeline** (Why does order matter?)"
        )
        
    return {"reply": reply}

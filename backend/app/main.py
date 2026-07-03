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
    
    # Simple semantic rule-based chatbot for satellite radar learning
    if "dfr" in q or "dual frequency ratio" in q:
        reply = (
            "### Dual-Frequency Ratio (DFR)\n\n"
            "The **Dual-Frequency Ratio (DFR)** is defined as the difference between the radar reflectivity factors (in decibels) "
            "measured at Ku-band (13.6 GHz) and Ka-band (35.5 GHz):\n\n"
            "$$\\text{DFR} = dBZ_{ku} - dBZ_{ka}$$\n\n"
            "**Why does DFR matter?**\n"
            "1. **Drop Size Estimation:** For small droplets, both Ku and Ka bands experience Rayleigh scattering, so DFR is close to 0 dB. "
            "However, as the drops get larger, Ka-band reflectivity rolls off due to Mie scattering, while Ku-band continues to increase. "
            "This creates a positive DFR value, allowing scientists to estimate the **mass-weighted mean diameter ($D_m$)** directly.\n"
            "2. **Attenuation Separation:** Ka-band is much more attenuated by rain than Ku-band. By comparing the rate of signal decay between the two bands "
            "as they penetrate the storm, we can calculate the attenuation profile and correct the reflectivity values."
        )
    elif "bright band" in q or "melting layer" in q or "freezing level" in q:
        reply = (
            "### The Radar Bright Band\n\n"
            "The **Bright Band** is a prominent horizontal layer of strong radar reflectivity observed in vertical cross-sections "
            "of stratiform precipitation systems. It occurs just below the freezing level (the $0^\\circ\\text{C}$ isotherm).\n\n"
            "**What causes the Bright Band?**\n"
            "1. **Melting Snowflakes:** Above the freezing level, precipitation is dry snow. Ice has a low dielectric constant ($|K|^2 \\approx 0.176$), "
            "so it scatters poorly.\n"
            "2. **Water Coating:** As snow falls below the freezing level, it begins to melt from the outside. The snowflake gets coated in liquid water. "
            "Since liquid water has a high dielectric constant ($|K|^2 \\approx 0.93$), the radar sees a giant water droplet that is as large as a snowflake. "
            "Because scattering scales as $D^6$ (diameter to the sixth power), this combination of water coating and large size creates a **reflectivity spike** (often 6-10 dB higher).\n"
            "3. **Collapse and Fall:** As melting completes, the snowflake collapses into a compact, fast-falling raindrop. Because raindrops fall much faster than snowflakes ($v \\approx 6$-$9\\text{ m/s}$ vs. $v \\approx 1$-$2\\text{ m/s}$), "
            "the concentration of particles per unit volume decreases (dilution effect), and the reflectivity drops back down, creating the lower boundary of the bright band."
        )
    elif "attenuation" in q or "loss" in q or "absorption" in q:
        reply = (
            "### Electromagnetic Attenuation in Radar\n\n"
            "**Attenuation** is the loss of signal power as the radar pulse travels through precipitation. It is caused by two main physical processes:\n"
            "1. **Absorption:** Rain droplets absorb the radar's microwave energy and convert it to heat.\n"
            "2. **Scattering:** Droplets scatter the energy away from the radar receiver's path.\n\n"
            "**Key Principles:**\n"
            "- **Frequency Dependence:** Higher frequency radars suffer much worse attenuation. The Ka-band (35.5 GHz, $\\lambda \\approx 8.5$ mm) "
            "attenuates significantly faster than the Ku-band (13.6 GHz, $\\lambda \\approx 22$ mm) because its wavelength is closer to the size of the raindrops.\n"
            "- **Path Integrated Attenuation (PIA):** The total two-way attenuation accumulated from the top of the storm down to a specific gate or the surface:\n"
            "$$\\text{PIA} = 2 \\int_{0}^{r} k(s) ds$$\n"
            "where $k$ is the specific attenuation coefficient in dB/km. The retrieved rainfall rate must be corrected for this loss, otherwise the rain rate at lower altitudes will be heavily underestimated."
        )
    elif "srt" in q or "surface reference" in q or "pia" in q:
        reply = (
            "### Surface Reference Technique (SRT)\n\n"
            "The **Surface Reference Technique (SRT)** is a method used to estimate the total Path Integrated Attenuation (PIA) "
            "suffered by a radar beam as it passes through the entire atmospheric column.\n\n"
            "**How it works:**\n"
            "1. **Reference Echo:** Under clear-air conditions, the ocean or land surface has a relatively stable and known radar backscattering cross-section (denoted as $\\sigma_0$ or Sigma-0).\n"
            "2. **Attenuated Echo:** When rain is present, the radar pulse has to pass through the rain column twice (once on the way down, once on the way back). The measured surface backscatter drops:\n"
            "$$\\sigma_{0\\text{, measured}} = \\sigma_{0\\text{, clear}} - \\text{PIA}_{\\text{SRT}}$$\n"
            "3. **Solve for PIA:** By subtracting the measured surface echo from the nearby clear-air reference surface echo, we compute:\n"
            "$$\\text{PIA}_{\\text{SRT}} = \\sigma_{0\\text{, clear}} - \\sigma_{0\\text{, measured}}$$\n"
            "This provides an independent boundary constraint for the Level-2 solver, preventing the mathematical correction formulas (like Hitschfeld-Bordan) from diverging or blowing up in heavy rain."
        )
    elif "rain type" in q or "classification" in q or "csf" in q:
        reply = (
            "### CSF: Classification Module\n\n"
            "The GPM-DPR Level-2 algorithm classifies precipitation into three primary types:\n"
            "1. **Stratiform Precipitation:** Characterized by uniform horizontal layers, widespread coverage, and the presence of a distinct **bright band** (melting layer) near the freezing level.\n"
            "2. **Convective Precipitation:** Characterized by strong vertical cores, high updrafts, and high reflectivity without a bright band (due to vertical mixing and rapid freezing of ice crystals).\n"
            "3. **Other:** Includes light rain, shallow rain, and mixed/transition states.\n\n"
            "**Why classify?**\n"
            "Different rain types have completely different **Drop Size Distributions (DSD)**. For example, convective cells contain higher concentrations of very large drops, "
            "whereas stratiform regions have smaller drops but wider coverage. Knowing the type allows the algorithm to select the correct Z-R relations and scattering models."
        )
    elif "how is rain rate retrieved" in q or "retrieve" in q or "slv" in q or "pipeline" in q:
        reply = (
            "### The GPM Level-2 Retrieval Pipeline\n\n"
            "The DPR Level-2 algorithm converts measured radar echoes ($Z_m$) into physical precipitation rates ($R$) through a sequence of modules:\n\n"
            "1. **PRE (Preparation):** Removes background instrument noise and ground clutter, and detects whether rain exists in the column.\n"
            "2. **VER (Vertical profile):** Finds the storm top height, freezing level ($0^\\circ\\text{C}$ isotherm), and bright band height.\n"
            "3. **CSF (Classification):** Classifies the column as Stratiform, Convective, or Other based on horizontal and vertical structures.\n"
            "4. **SRT (Surface Reference):** Estimates path attenuation (PIA) by comparing the land/ocean surface echo inside the rain to clear-air reference values.\n"
            "5. **DSD (Drop Size Distribution):** Calculates the drop sizes ($D_m, N_w$) at each gate using the dual-frequency differences (DFR).\n"
            "6. **SLV (Solver):** Corrects reflectivity for attenuation ($Z_e$) and integrates the physical parameters to compute the final rain rate profile ($R$ in mm/h)."
        )
    else:
        reply = (
            "Hello! I am your GPM-DPR AI Tutor.\n\n"
            "I can explain concepts regarding satellite precipitation radar retrievals. Try asking me about:\n"
            "- **Bright Band** (causes, vertical profile)\n"
            "- **Ku vs. Ka Bands** (frequencies, sensitivities, attenuation differences)\n"
            "- **DFR** (Dual-Frequency Ratio and how it determines drop size)\n"
            "- **SRT** (Surface Reference Technique and PIA)\n"
            "- **Classification (CSF)** (Stratiform vs. Convective rain)\n"
            "- **Level-2 Retrieval Pipeline** (PRE, VER, CSF, SRT, DSD, SLV)"
        )
        
    return {"reply": reply}

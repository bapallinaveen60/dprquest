import h5py
import numpy as np
import os

def generate_sample_granule():
    """
    Generates a realistic mock GPM 2A-DPR orbit passing over a tropical cyclone.
    Useful for demonstration when a user doesn't upload a file.
    """
    # 1. Generate orbit track: 50 scans, 49 beams (width of swath), 176 vertical gates (0 to 22km)
    n_scans = 60
    n_beams = 49
    n_gates = 176
    
    # Coordinates centered around a tropical storm in the Gulf of Mexico
    center_lat = 26.0
    center_lon = -88.0
    
    lats = np.zeros((n_scans, n_beams))
    lons = np.zeros((n_scans, n_beams))
    
    for s in range(n_scans):
        # Orbit tracks from south-east to north-west
        orbit_lat = center_lat - 3.0 + (s / n_scans) * 6.0
        orbit_lon = center_lon + 1.0 - (s / n_scans) * 2.0
        for b in range(n_beams):
            # Beam offset perpendicular to orbit path
            offset = (b - 24) * 0.05 # ~5km resolution per beam
            lats[s, b] = orbit_lat + offset * 0.3
            lons[s, b] = orbit_lon + offset * 1.0

    # 2. Generate Storm structure: A double-eyewall storm system at scan index 30
    rain_type = np.zeros((n_scans, n_beams), dtype=np.int32) # 0: no rain, 1: stratiform, 2: convective
    surf_rain = np.zeros((n_scans, n_beams))
    storm_top = np.zeros((n_scans, n_beams))
    
    # 3D Reflectivity curtain: (scans, beams, gates)
    # Gates are from 0 (surface) to 175 (22km). Resolution is 125m.
    # Gate 0: surface, Gate 175: space.
    z_ku = np.full((n_scans, n_beams, n_gates), -99.0, dtype=np.float32)
    z_ka = np.full((n_scans, n_beams, n_gates), -99.0, dtype=np.float32)
    
    # Let's create the cyclone structure
    for s in range(n_scans):
        dist_s = s - 30
        for b in range(n_beams):
            dist_b = b - 24
            # Distance from cyclone center in grid space
            r = np.sqrt(dist_s ** 2 + dist_b ** 2)
            
            # Eye is at r < 4 (no rain or light rain)
            # Eyewall at 4 <= r < 8 (heavy convective rain)
            # Moat at 8 <= r < 12 (light stratiform rain)
            # Outer band at 12 <= r < 18 (moderate convective/stratiform rain)
            
            if r < 4:
                # Cyclone eye
                r_type = 0
                r_rate = 0.0
                s_top = 0.0
            elif 4 <= r < 8:
                # Eyewall (heavy convective)
                r_type = 2
                r_rate = 35.0 + np.random.normal(0, 5.0)
                s_top = 12.0 + np.random.normal(0, 1.0) # deep convective storm top
            elif 8 <= r < 12:
                # Moat (stratiform)
                r_type = 1
                r_rate = 3.0 + np.random.normal(0, 0.5)
                s_top = 7.0 + np.random.normal(0, 0.5)
            elif 12 <= r < 18:
                # Outer rainband (convective cores mixed with stratiform)
                is_convective = (s + b) % 5 == 0
                r_type = 2 if is_convective else 1
                r_rate = (15.0 if is_convective else 5.0) + np.random.normal(0, 1.0)
                s_top = (10.0 if is_convective else 6.5) + np.random.normal(0, 0.5)
            else:
                # Clear air
                r_type = 0
                r_rate = 0.0
                s_top = 0.0
                
            rain_type[s, b] = r_type
            surf_rain[s, b] = r_rate
            storm_top[s, b] = s_top
            
            if r_rate > 0:
                # Generate vertical reflectivity profile
                freezing_gate = 32 # 4.0 km (4000m / 125m = 32)
                top_gate = int((s_top * 1000.0) / 125.0)
                top_gate = min(top_gate, 175)
                
                for g in range(top_gate):
                    # Height in km
                    height_km = g * 0.125
                    
                    if height_km > s_top:
                        continue
                        
                    # Reflectivity profile model
                    if r_type == 2: # Convective
                        # Convective profile: high reflectivity, no bright band, gradual attenuation
                        base_z = 32.0 + 8.0 * np.log10(r_rate)
                        # attenuate Ku with height (radar sees it from top-down)
                        ku_val = base_z - 0.5 * (s_top - height_km)
                        ka_val = base_z - 2.5 * (s_top - height_km) # Ka attenuates much faster
                    else: # Stratiform
                        # Stratiform profile: clear bright band just below freezing gate
                        base_z = 25.0 + 10.0 * np.log10(r_rate)
                        ku_val = base_z
                        ka_val = base_z - 1.2 * (s_top - height_km)
                        
                        # Add Bright Band peak around freezing height (4.0 km)
                        if abs(height_km - 4.0) < 0.3:
                            # 8 dB peak at Ku, 4 dB at Ka
                            peak_factor = (0.3 - abs(height_km - 4.0)) / 0.3
                            ku_val += 8.0 * peak_factor
                            ka_val += 3.5 * peak_factor
                    
                    # Store
                    z_ku[s, b, g] = float(np.clip(ku_val, 10.0, 55.0))
                    z_ka[s, b, g] = float(np.clip(ka_val, 8.0, 42.0))

    return {
        "is_mock": True,
        "n_scans": n_scans,
        "n_beams": n_beams,
        "n_gates": n_gates,
        "latitudes": lats.tolist(),
        "longitudes": lons.tolist(),
        "rain_type": rain_type.tolist(),
        "surface_rain_rate": surf_rain.tolist(),
        "storm_top_height": storm_top.tolist(),
        "z_ku": z_ku.tolist(),
        "z_ka": z_ka.tolist()
    }

def read_gpm_hdf5(file_path):
    """
    Reads standard GPM 2A-DPR HDF5 files and extracts coordinates, swaths, and vertical profiles.
    Falls back to generate_sample_granule if parsing fails.
    """
    if not os.path.exists(file_path):
        return generate_sample_granule()

    try:
        with h5py.File(file_path, 'r') as f:
            # Check groups. Standard 2A-DPR files have "NS" (Normal Swath)
            if "NS" not in f:
                raise ValueError("Only standard GPM 2A-DPR HDF5 files with 'NS' swath are supported.")

            ns = f["NS"]
            
            # Extract coordinates
            # Shape is usually (n_scans, n_beams)
            lats = np.array(ns["Latitude"])
            lons = np.array(ns["Longitude"])
            
            # Check dimension shapes
            n_scans, n_beams = lats.shape
            
            # Extract precipitation variables
            # precipitation rate near surface: NS/SLV/precipRateNearSurface (n_scans, n_beams)
            # precipitation type: NS/CSF/typePrecip (n_scans, n_beams)
            # storm top height: NS/PRE/stormTopHeight (n_scans, n_beams)
            
            surf_rain = np.array(ns["SLV"]["precipRateNearSurface"]) if "SLV" in ns and "precipRateNearSurface" in ns["SLV"] else np.zeros_like(lats)
            rain_type_raw = np.array(ns["CSF"]["typePrecip"]) if "CSF" in ns and "typePrecip" in ns["CSF"] else np.zeros_like(lats, dtype=np.int32)
            
            # Convert rain type raw to simple categories:
            # Raw GPM typePrecip:
            # 1: Stratiform, 2: Convective, 3: Other. 0: No rain.
            # (Note: it can have flags or negative numbers for no rain, so clamp it)
            rain_type = np.zeros_like(rain_type_raw, dtype=np.int32)
            rain_type[rain_type_raw > 0] = rain_type_raw[rain_type_raw > 0] // 10000000 # Standard HDF5 decoding
            
            # If standard decoding fails, map directly:
            # GPM HDF5 encodes features inside typePrecip, where the first digit of the 8-digit integer represents main type:
            # e.g., 1xxxxxxx is Stratiform, 2xxxxxxx is Convective, 3xxxxxxx is Other.
            # If the value is small:
            for idx in np.ndindex(rain_type_raw.shape):
                val = rain_type_raw[idx]
                if val >= 10000000:
                    rain_type[idx] = val // 10000000
                elif val > 0:
                    # direct mapping
                    rain_type[idx] = val
                else:
                    rain_type[idx] = 0

            storm_top = np.array(ns["PRE"]["stormTopHeight"]) if "PRE" in ns and "stormTopHeight" in ns["PRE"] else np.zeros_like(lats)
            # Convert m to km if needed
            if np.max(storm_top) > 1000.0:
                storm_top = storm_top / 1000.0
                
            # Reflectivity curtain profiles
            # zFactorCorrected is (n_scans, n_beams, n_gates)
            # Typically 176 gates, gate spacing is 125m.
            if "SLV" in ns and "zFactorCorrected" in ns["SLV"]:
                z_ku = np.array(ns["SLV"]["zFactorCorrected"])
            elif "PRE" in ns and "zFactorMeasured" in ns["PRE"]:
                z_ku = np.array(ns["PRE"]["zFactorMeasured"])
            else:
                z_ku = np.full((n_scans, n_beams, 176), -99.0, dtype=np.float32)

            # Ka band: check matched swath (MS) or high sensitivity swath (HS)
            z_ka = np.full_like(z_ku, -99.0)
            if "MS" in f and "SLV" in f["MS"] and "zFactorCorrected" in f["MS"]["SLV"]:
                # Matched Swath has the same beams (49)
                z_ka_raw = np.array(f["MS"]["SLV"]["zFactorCorrected"])
                # Match shapes if necessary
                min_gates = min(z_ku.shape[2], z_ka_raw.shape[2])
                z_ka[:, :, :min_gates] = z_ka_raw[:, :, :min_gates]
            
            # Slice/Limit scans to first 100 to avoid massive JSON payloads
            max_scans_to_send = 100
            if n_scans > max_scans_to_send:
                lats = lats[:max_scans_to_send, :]
                lons = lons[:max_scans_to_send, :]
                rain_type = rain_type[:max_scans_to_send, :]
                surf_rain = surf_rain[:max_scans_to_send, :]
                storm_top = storm_top[:max_scans_to_send, :]
                z_ku = z_ku[:max_scans_to_send, :, :]
                z_ka = z_ka[:max_scans_to_send, :, :]
                n_scans = max_scans_to_send
                
            # Clean reflectivity values below zero (GPM uses -9999.0 for missing)
            z_ku[z_ku < -10.0] = -99.0
            z_ka[z_ka < -10.0] = -99.0

            return {
                "is_mock": False,
                "n_scans": int(n_scans),
                "n_beams": int(n_beams),
                "n_gates": int(z_ku.shape[2]),
                "latitudes": lats.tolist(),
                "longitudes": lons.tolist(),
                "rain_type": rain_type.tolist(),
                "surface_rain_rate": surf_rain.tolist(),
                "storm_top_height": storm_top.tolist(),
                "z_ku": z_ku.tolist(),
                "z_ka": z_ka.tolist()
            }
            
    except Exception as e:
        print(f"Error reading GPM HDF5: {str(e)}")
        # Gracefully fall back to demo granule so app doesn't crash
        return generate_sample_granule()

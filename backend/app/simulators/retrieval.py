import numpy as np
from app.simulators.dsd import simulate_dsd_properties

def generate_storm_column(storm_height=8.0, freezing_level=4.0, surface_rain_rate=10.0, d_m_surface=1.5, noise_level=0.5):
    """
    Generates a vertical profile of a storm from 0 to 15 km altitude.
    Resolution: 125 meters (matching GPM DPR gate size of 125m or 250m).
    120 gates total.
    """
    heights = np.linspace(0.0, 15.0, 120)  # in km
    gate_spacing = 15.0 / 120.0  # 0.125 km (125m)
    
    # 1. Classify layers and precipitation phase
    precip_phase = []  # "clear", "snow", "melting", "rain"
    true_rain_rate = []  # mm/h
    true_dm = []  # mm
    true_nw = []  # m^-3 mm^-1
    
    # Simple model for NW (normalized intercept parameter)
    # R = 1.885e-3 * Nw * Dm^4.5 (approximate) => Nw = R / (1.885e-3 * Dm^4.5)
    nw_base = surface_rain_rate / (1.88495e-3 * (d_m_surface ** 4.5))
    nw_base = np.clip(nw_base, 100, 100000)
    
    for h in heights:
        if h > storm_height:
            # Clear air above storm
            precip_phase.append("clear")
            true_rain_rate.append(0.0)
            true_dm.append(0.0)
            true_nw.append(0.0)
        elif h > freezing_level:
            # Snow above freezing level
            precip_phase.append("snow")
            # Rain rate equivalent scales down with height
            fraction = (storm_height - h) / (storm_height - freezing_level)
            r_val = surface_rain_rate * 0.4 * fraction
            true_rain_rate.append(r_val)
            true_dm.append(d_m_surface * 1.2) # Snowflakes are larger but less dense
            true_nw.append(nw_base * 0.3)
        elif h > (freezing_level - 0.5):
            # Melting layer / Bright Band (approx 500m wide)
            precip_phase.append("melting")
            # Interpolated rain rate
            fraction = (h - (freezing_level - 0.5)) / 0.5  # 0 at bottom, 1 at top
            r_val = surface_rain_rate * (0.4 * fraction + 1.0 * (1.0 - fraction))
            true_rain_rate.append(r_val)
            true_dm.append(d_m_surface * (1.2 * fraction + 1.0 * (1.0 - fraction)))
            true_nw.append(nw_base * (0.3 * fraction + 1.0 * (1.0 - fraction)))
        else:
            # Rain below freezing level
            precip_phase.append("rain")
            # Slight increase in rain rate towards surface due to condensation
            fraction = h / (freezing_level - 0.5)
            r_val = surface_rain_rate * (1.0 + 0.1 * (1.0 - fraction))
            true_rain_rate.append(r_val)
            true_dm.append(d_m_surface * (1.0 + 0.05 * (1.0 - fraction)))
            true_nw.append(nw_base * (1.0 + 0.05 * (1.0 - fraction)))

    # Convert to arrays
    true_rain_rate = np.array(true_rain_rate)
    true_dm = np.array(true_dm)
    true_nw = np.array(true_nw)
    
    # 2. Compute True Reflectivity (Ze) and Specific Attenuation (k)
    ze_ku_true = np.zeros_like(heights)
    ze_ka_true = np.zeros_like(heights)
    k_ku = np.zeros_like(heights)
    k_ka = np.zeros_like(heights)
    
    for i, h in enumerate(heights):
        phase = precip_phase[i]
        if phase == "clear":
            ze_ku_true[i] = -99.0
            ze_ka_true[i] = -99.0
            k_ku[i] = 0.0
            k_ka[i] = 0.0
        else:
            snow_fraction = 1.0 if phase == "snow" else (0.5 if phase == "melting" else 0.0)
            res = simulate_dsd_properties(true_dm[i], true_nw[i], mu=3.0, snow_fraction=snow_fraction)
            
            ze_ku = res["dbz_ku"]
            ze_ka = res["dbz_ka"]
            
            # Bright Band peak boost
            if phase == "melting":
                # Add bright band reflectivity spike (up to 8 dB boost at Ku, slightly less at Ka)
                ze_ku += 8.0 * (1.0 - 4.0 * (h - (freezing_level - 0.25)) ** 2) # quadratic peak
                ze_ka += 4.0 * (1.0 - 4.0 * (h - (freezing_level - 0.25)) ** 2)
                # Attenuation is also higher in melting layer
                res["k_ku"] *= 2.0
                res["k_ka"] *= 1.5
                
            ze_ku_true[i] = ze_ku
            ze_ka_true[i] = ze_ka
            k_ku[i] = res["k_ku"]
            k_ka[i] = res["k_ka"]

    # 3. Calculate Path Integrated Attenuation (PIA) and Measured Reflectivity (Zm)
    # The radar signal starts at top (15km) and goes down to 0km.
    # We integrate specific attenuation k (dB/km) from top down.
    # Note: PIA(h) = 2 * integral_{h}^{top} k(s) ds
    pia_ku = np.zeros_like(heights)
    pia_ka = np.zeros_like(heights)
    
    running_k_ku = 0.0
    running_k_ka = 0.0
    
    # Loop from top (index 119) down to bottom (index 0)
    for i in range(len(heights) - 1, -1, -1):
        pia_ku[i] = 2.0 * running_k_ku * gate_spacing
        pia_ka[i] = 2.0 * running_k_ka * gate_spacing
        
        running_k_ku += k_ku[i]
        running_k_ka += k_ka[i]

    # Measured reflectivity Zm = Ze - PIA
    # Ensure we don't go below minimum detectable limits (-99 dBZ)
    zm_ku = np.where(ze_ku_true > -90.0, ze_ku_true - pia_ku, -99.0)
    zm_ka = np.where(ze_ka_true > -90.0, ze_ka_true - pia_ka, -99.0)
    
    # Add measurement noise to simulate real conditions
    noise_ku = np.random.normal(0.0, noise_level, size=zm_ku.shape)
    noise_ka = np.random.normal(0.0, noise_level, size=zm_ka.shape)
    
    zm_ku = np.where(zm_ku > -90.0, zm_ku + noise_ku, -99.0)
    zm_ka = np.where(zm_ka > -90.0, zm_ka + noise_ka, -99.0)

    # 4. SRT (Surface Reference Technique) Simulation
    # Assume clear air surface backscattering cross section (sigma_0) is -10 dB for Ku and -12 dB for Ka
    sigma_0_ku_clean = -10.0
    sigma_0_ka_clean = -12.0
    
    # Under rain, measured surface backscatter is attenuated by the total column PIA
    total_pia_ku = pia_ku[0]
    total_pia_ka = pia_ka[0]
    
    sigma_0_ku_measured = sigma_0_ku_clean - total_pia_ku + np.random.normal(0.0, 0.3)
    sigma_0_ka_measured = sigma_0_ka_clean - total_pia_ka + np.random.normal(0.0, 0.4)
    
    # Retrieved PIA from SRT
    retrieved_pia_srt_ku = max(sigma_0_ku_clean - sigma_0_ku_measured, 0.0)
    retrieved_pia_srt_ka = max(sigma_0_ka_clean - sigma_0_ka_measured, 0.0)

    return {
        "heights": heights.tolist(),
        "precip_phase": precip_phase,
        "true_rain_rate": true_rain_rate.tolist(),
        "true_dm": true_dm.tolist(),
        "true_nw": true_nw.tolist(),
        "ze_ku_true": ze_ku_true.tolist(),
        "ze_ka_true": ze_ka_true.tolist(),
        "zm_ku": zm_ku.tolist(),
        "zm_ka": zm_ka.tolist(),
        "pia_ku": pia_ku.tolist(),
        "pia_ka": pia_ka.tolist(),
        "srt": {
            "clean_sigma_0_ku": sigma_0_ku_clean,
            "clean_sigma_0_ka": sigma_0_ka_clean,
            "measured_sigma_0_ku": sigma_0_ku_measured,
            "measured_sigma_0_ka": sigma_0_ka_measured,
            "retrieved_pia_srt_ku": retrieved_pia_srt_ku,
            "retrieved_pia_srt_ka": retrieved_pia_srt_ka
        }
    }

def run_retrieval_pipeline(storm_data):
    """
    Executes a simplified GPM-DPR Level-2 algorithm pipeline.
    Modules: PRE -> VER -> CSF -> DSD -> SRT -> SLV
    """
    heights = np.array(storm_data["heights"])
    zm_ku = np.array(storm_data["zm_ku"])
    zm_ka = np.array(storm_data["zm_ka"])
    srt = storm_data["srt"]
    gate_spacing = heights[1] - heights[0]
    n_gates = len(heights)
    
    # --- 1. PRE MODULE ---
    # Noise threshold is around 12 dBZ for Ku, 18 dBZ for Ka.
    # Anything below is considered noise and removed.
    clean_zm_ku = np.where(zm_ku > 12.0, zm_ku, -99.0)
    clean_zm_ka = np.where(zm_ka > 18.0, zm_ka, -99.0)
    
    # --- 2. VER MODULE ---
    # Detect Storm Top Height (highest gate with reflectivity > threshold)
    rain_gates = np.where(clean_zm_ku > 12.0)[0]
    if len(rain_gates) > 0:
        retrieved_storm_top = float(heights[rain_gates[-1]])
    else:
        retrieved_storm_top = 0.0
        
    # Detect Bright Band / Freezing level
    # Bright band shows up as a local maximum in Ku reflectivity.
    # Look for a peak between 1.0 km and 6.0 km.
    bb_index = -1
    max_peak = -99
    
    # Look for local maximum
    for i in range(8, 48): # 1.0km to 6.0km range
        if clean_zm_ku[i] > 18.0:
            # Check if local peak
            if clean_zm_ku[i] > clean_zm_ku[i-1] and clean_zm_ku[i] > clean_zm_ku[i+1]:
                if clean_zm_ku[i] > max_peak:
                    max_peak = clean_zm_ku[i]
                    bb_index = i
                    
    has_bright_band = bb_index != -1
    retrieved_freezing_level = float(heights[bb_index]) if has_bright_band else 4.0 # default/fallback
    
    # --- 3. CSF MODULE ---
    # Classify storm type: Convective vs Stratiform
    # If bright band is detected, it is Stratiform.
    # If no bright band but maximum reflectivity is very high (> 38 dBZ), it is Convective.
    # Otherwise, it's Other/unknown.
    if has_bright_band:
        retrieved_rain_type = "Stratiform"
    elif np.max(clean_zm_ku) > 38.0:
        retrieved_rain_type = "Convective"
    elif np.max(clean_zm_ku) > 12.0:
        retrieved_rain_type = "Other"
    else:
        retrieved_rain_type = "No Rain"
        
    # --- 4. DSD & SRT & SLV (Solver Module) ---
    # We perform an attenuation correction (Hitschfeld-Bordan) to get Ze (corrected reflectivity).
    # Then we retrieve the rain rate.
    # Hitschfeld-Bordan correction for Ku band:
    # Ze = Zm / (1 - beta * I(r)) ^ (1/beta)
    # Where specific attenuation k = alpha * Ze^beta
    # Let's use typical parameters for rain: alpha = 1.6e-4, beta = 0.8
    alpha_ku = 0.00018
    beta_ku = 0.82
    
    corrected_ze_ku = np.zeros_like(clean_zm_ku)
    retrieved_k_ku = np.zeros_like(clean_zm_ku)
    retrieved_rain_rate = np.zeros_like(clean_zm_ku)
    retrieved_dm = np.zeros_like(clean_zm_ku)
    
    # Hitschfeld-Bordan integration from top of storm down to surface
    # We do a step-by-step gate integration
    running_pia_ku = 0.0
    
    # First, let's establish a simple single-frequency profiling:
    for i in range(n_gates - 1, -1, -1):
        zm_val = clean_zm_ku[i]
        if zm_val <= 12.0:
            corrected_ze_ku[i] = -99.0
            continue
            
        # Apply current accumulated attenuation
        # Ze = Zm + PIA_accumulated
        ze_db = zm_val + running_pia_ku
        
        # Estimate specific attenuation k from estimated Ze
        # standard k-Ze relation: k = alpha * Ze^beta (with Ze in linear units mm^6/m^3)
        ze_lin = 10.0 ** (ze_db / 10.0)
        k_val = alpha_ku * (ze_lin ** beta_ku)
        
        # Limit k to avoid numerical blow-up
        k_val = min(k_val, 15.0)
        
        # Accumulate attenuation for next gates (2-way attenuation: 2 * k * gate_spacing)
        running_pia_ku += 2.0 * k_val * gate_spacing
        
        corrected_ze_ku[i] = ze_db
        retrieved_k_ku[i] = k_val
        
        # Retrieve rain rate using Z-R relation: Z = 200 * R^1.6 => R = (Z/200)^(1/1.6)
        # For convective and stratiform, we can use different relations!
        if retrieved_rain_type == "Convective":
            # Convective: Z = 300 * R^1.4 => R = (Z/300)^(1/1.4)
            r_val = (ze_lin / 300.0) ** (1.0 / 1.4)
        else:
            # Stratiform: Z = 200 * R^1.6 => R = (Z/200)^(1/1.6)
            r_val = (ze_lin / 200.0) ** (1.0 / 1.6)
            
        # Above freezing level, precipitation is snow, so the Z-R relation yields liquid-equivalent precipitation rate
        if heights[i] > retrieved_freezing_level:
            # Snow retrieval has different physics (lower density)
            r_val = r_val * 0.5
            
        retrieved_rain_rate[i] = r_val
        
        # Retrieve drop size Dm (using empirical Dm-Ze relation)
        # Dm = c * Ze^d
        retrieved_dm[i] = 0.5 * (ze_lin ** 0.1) if ze_lin > 0 else 0.0

    # Let's adjust using SRT constraint if SRT PIA is available and valid
    # If the Hitschfeld-Bordan path integrated attenuation exceeds/diverges from SRT PIA,
    # we can scale the alpha parameter to match the SRT total PIA.
    srt_pia_ku = srt["retrieved_pia_srt_ku"]
    hb_pia_ku = running_pia_ku
    
    # If SRT detects significant attenuation, we adjust the profiles
    scale_factor = 1.0
    if srt_pia_ku > 2.0 and hb_pia_ku > 0.1:
        # Scale retrieval to match SRT total PIA
        scale_factor = min(srt_pia_ku / hb_pia_ku, 1.5)
        # Apply scale adjustment to rain rates
        retrieved_rain_rate = retrieved_rain_rate * (scale_factor ** 0.8)
        corrected_ze_ku = np.where(corrected_ze_ku > 0, corrected_ze_ku + (srt_pia_ku - hb_pia_ku) * (heights / retrieved_storm_top), -99.0)

    # Clean outputs
    retrieved_rain_rate = np.clip(retrieved_rain_rate, 0.0, 150.0)
    retrieved_dm = np.clip(retrieved_dm, 0.0, 5.0)

    return {
        "storm_top": retrieved_storm_top,
        "freezing_level": retrieved_freezing_level,
        "rain_type": retrieved_rain_type,
        "has_bright_band": has_bright_band,
        "corrected_ze_ku": corrected_ze_ku.tolist(),
        "retrieved_rain_rate": retrieved_rain_rate.tolist(),
        "retrieved_dm": retrieved_dm.tolist(),
        "estimated_pia_ku": float(running_pia_ku),
        "srt_adjustment_scale": float(scale_factor)
    }

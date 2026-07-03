import numpy as np
from scipy.special import gamma

# Wavelengths in mm
LAMBDA_KU = 22.03  # 13.6 GHz
LAMBDA_KA = 8.44   # 35.5 GHz

# Dielectric factor for water |K|^2
K2_WATER = 0.93

def terminal_velocity(D):
    """
    Terminal velocity of raindrops in m/s using Lhermitte (1988) formula.
    D is diameter in mm.
    """
    # Clamp D to be non-negative
    D = np.maximum(D, 0.0)
    return 9.65 - 10.3 * np.exp(-0.6 * D)

def gamma_dsd_parameters(d_m, n_w, mu=3.0):
    """
    Returns the normalized Gamma DSD parameters.
    d_m: mass-weighted mean diameter (mm)
    n_w: normalized intercept parameter (m^-3 mm^-1)
    mu: shape parameter (dimensionless)
    """
    # f(mu) is the normalization factor
    f_mu = (6.0 / 256.0) * ((4.0 + mu) ** (4.0 + mu)) / gamma(4.0 + mu)
    # Lambda parameter in mm^-1
    lambda_param = (4.0 + mu) / d_m
    return f_mu, lambda_param

def get_dsd_profile(d_m, n_w, mu=3.0):
    """
    Computes DSD concentration profile N(D) in m^-3 mm^-1.
    D is diameters from 0.05 to 8.0 mm.
    """
    D = np.linspace(0.05, 8.0, 160)
    f_mu, lambda_param = gamma_dsd_parameters(d_m, n_w, mu)
    
    # N(D) = N_w * f(mu) * (D/D_m)^mu * exp(-Lambda * D)
    # Note: D/D_m = (Lambda * D) / (4 + mu)
    N = n_w * f_mu * ((D / d_m) ** mu) * np.exp(-lambda_param * D)
    return D, N

def backscatter_cross_section(D, freq_band="Ku", phase="rain"):
    """
    Approximates backscattering cross section sigma_b in mm^2 as a function of diameter D in mm.
    Includes Mie scattering rolloff.
    """
    if phase == "snow":
        # Snow has lower density and refractive index (|K|^2 ~ 0.176)
        k2 = 0.176
        # Snowflakes scatter less and are larger, but let's scale down Ku and Ka
        ref_lambda = LAMBDA_KU if freq_band == "Ku" else LAMBDA_KA
        rayleigh = (np.pi ** 5) * k2 * (D ** 6) / (ref_lambda ** 4)
        # Snow Mie scattering starts rolling off at larger diameters
        rolloff_d = 4.0 if freq_band == "Ku" else 2.5
        rolloff = (1.0 + (D / rolloff_d) ** 4) ** -0.5
        return rayleigh * rolloff

    # Rain (liquid water)
    k2 = K2_WATER
    if freq_band == "Ku":
        # Rayleigh scattering
        rayleigh = (np.pi ** 5) * k2 * (D ** 6) / (LAMBDA_KU ** 4)
        # Mie rolloff for Ku band (approximate)
        rolloff = (1.0 + (D / 3.2) ** 4.0) ** -0.55
        return rayleigh * rolloff
    else:  # Ka band
        # Rayleigh scattering
        rayleigh = (np.pi ** 5) * k2 * (D ** 6) / (LAMBDA_KA ** 4)
        # Mie rolloff for Ka band (much stronger, starts earlier due to smaller wavelength)
        rolloff = (1.0 + (D / 1.4) ** 4.2) ** -0.8
        return rayleigh * rolloff

def extinction_cross_section(D, freq_band="Ku", phase="rain"):
    """
    Approximates extinction cross section sigma_e in mm^2 as a function of diameter D in mm.
    Used for attenuation calculation.
    """
    if phase == "snow":
        # Snow has lower attenuation than liquid rain for the same mass,
        # but is frequency-dependent
        factor = 0.005 if freq_band == "Ku" else 0.03
        return factor * (D ** 3.3)

    # Rain (liquid water)
    if freq_band == "Ku":
        # Attenuation at Ku is lower. Good empirical fit to Mie extinction:
        return 0.0003 * (D ** 3.8)
    else:  # Ka band
        # Attenuation at Ka is significantly higher:
        return 0.0025 * (D ** 3.4)

def simulate_dsd_properties(d_m, n_w, mu=3.0, snow_fraction=0.0):
    """
    Simulates physical and radar parameters for a given DSD.
    d_m: mass-weighted mean diameter (mm)
    n_w: normalized intercept parameter (m^-3 mm^-1)
    mu: shape parameter (dimensionless)
    snow_fraction: fraction of precipitation in ice phase (0.0 = pure rain, 1.0 = pure snow)
    """
    D, N = get_dsd_profile(d_m, n_w, mu)
    dD = D[1] - D[0]
    
    # 1. Rain rate R (mm/h)
    # R = 3.6e-3 * pi/6 * int( D^3 * v(D) * N(D) * dD )
    v = terminal_velocity(D)
    # Liquid equivalent rain rate
    # If snow, terminal velocity is slower (approx 1.0 m/s for all sizes)
    v_eff = (1.0 - snow_fraction) * v + snow_fraction * np.minimum(1.0 + 0.15 * D, 2.0)
    
    # mm/h = 10^-3 m / (1/3600 h) = 3.6e-3 * m/s * mm
    # But N(D) is m^-3 mm^-1, D is mm, v_eff is m/s.
    # Volume of drop is (pi/6) * (D * 1e-3)^3 m^3
    # Rate = int( Volume * velocity * N(D) dD ) = (pi/6)*1e-9 * int( D^3 * v_eff * N(D) dD ) m/s
    # Convert m/s to mm/h: multiply by 1e3 (mm/m) * 3600 (s/h) = 3.6e6
    # Total multiplier: (pi/6) * 1e-9 * 3.6e6 = (pi/6) * 3.6e-3 = 1.88495e-3
    rain_rate = 1.88495e-3 * np.sum((D ** 3) * v_eff * N * dD)
    
    # 2. Liquid Water Content / Ice Water Content (g/m^3)
    # LWC = pi/6 * rho * int( D^3 * N(D) dD ) * 10^-6 m^3 to mm^3 * 10^6 g to Mg, etc.
    # Standard formula: LWC = 1e-3 * (pi/6) * int( D^3 * N(D) dD )
    rho = (1.0 - snow_fraction) * 1.0 + snow_fraction * 0.1 # ice density ~ 0.1 g/cm3 for snow
    lwc = 1e-3 * (np.pi / 6.0) * rho * np.sum((D ** 3) * N * dD)
    
    # 3. Radar Reflectivities (Ze)
    # Ze = (lambda^4 / (pi^5 * |K|^2)) * int( sigma_b(D) * N(D) dD )
    # Note: For Rayleigh, Ze = int( D^6 * N(D) dD ) in mm^6/m^3
    # Let's compute Ku and Ka reflectivity factor Ze
    sigma_b_ku = np.array([backscatter_cross_section(d, "Ku", "snow" if snow_fraction > 0.5 else "rain") for d in D])
    sigma_b_ka = np.array([backscatter_cross_section(d, "Ka", "snow" if snow_fraction > 0.5 else "rain") for d in D])
    
    # Ze factor calculation
    coef_ku = (LAMBDA_KU ** 4) / ((np.pi ** 5) * K2_WATER)
    coef_ka = (LAMBDA_KA ** 4) / ((np.pi ** 5) * K2_WATER)
    
    ze_ku = coef_ku * np.sum(sigma_b_ku * N * dD)
    ze_ka = coef_ka * np.sum(sigma_b_ka * N * dD)
    
    # Protect against log of zero
    ze_ku = max(ze_ku, 1e-5)
    ze_ka = max(ze_ka, 1e-5)
    
    dbz_ku = 10.0 * np.log10(ze_ku)
    dbz_ka = 10.0 * np.log10(ze_ka)
    
    # DFR (Dual Frequency Ratio) = dBZ_ku - dBZ_ka
    dfr = dbz_ku - dbz_ka
    
    # 4. Attenuation coefficient k (dB/km)
    # k = 4.343 * 1e3 * int( sigma_e(D) * N(D) dD )
    # Here sigma_e is in mm^2 = 10^-6 m^2. N(D) is m^-3 mm^-1. dD is mm.
    # Extinction area per m^3 = int( sigma_e * 10^-6 * N(D) dD ) m^-1
    # Attenuation rate = 4.343 * int( sigma_e * 10^-6 * N(D) dD ) dB/m
    # In dB/km (multiply by 1000): k = 4.343 * 1e-3 * int( sigma_e * N(D) dD )
    sigma_e_ku = np.array([extinction_cross_section(d, "Ku", "snow" if snow_fraction > 0.5 else "rain") for d in D])
    sigma_e_ka = np.array([extinction_cross_section(d, "Ka", "snow" if snow_fraction > 0.5 else "rain") for d in D])
    
    k_ku = 4.343 * 1e-3 * np.sum(sigma_e_ku * N * dD)
    k_ka = 4.343 * 1e-3 * np.sum(sigma_e_ka * N * dD)
    
    return {
        "rain_rate": float(rain_rate),
        "lwc": float(lwc),
        "dbz_ku": float(dbz_ku),
        "dbz_ka": float(dbz_ka),
        "dfr": float(dfr),
        "k_ku": float(k_ku),
        "k_ka": float(k_ka),
        "D": D.tolist(),
        "N": N.tolist()
    }

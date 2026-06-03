from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from schema import PredictRequest, PredictResponse

from pipeline import predict
from cosmology import calculate

app = FastAPI(
    title="Photometric Redshift Failure Detection API"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, this should be restricted
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def classify(failure_prob: float) -> str:
    return "failure" if failure_prob > 0.15 else "success"

@app.post("/predict", response_model=PredictResponse)
def predict_redshift(request: PredictRequest):

    result = predict(
        [
            request.u,
            request.g,
            request.r,
            request.i,
            request.z            
        ]
    )

    status = classify(
        result["failure_prob"]
    )

    cosmology = None

    if status == "success":
        cosmology = calculate(
            result["z_mode"]
        )
    
    return {
        "status": status,
        "warning": None if status == "success" else "Prioritize for spectroscopy",
        "redshift": {
            "z_mode": result["z_mode"],
            "z_mean": result["z_mean"],
            "z_std": result["z_std"]
        },

        "failure_score":
            result["failure_prob"],
        "cosmology":cosmology,

        "pdf":{
            "z_grid": result["z_grid"],
            "probabilities":
            result["pdf"]
        }
    }

@app.post("/predict/batch", response_model=dict)
def predict_batch(request: dict):
    # To avoid pydantic validation overhead for huge batches, we just accept a dict
    # request should be {"data": [{"u":..., "g":...}, ...]}
    batch_data = request.get("data", [])
    results = []
    
    for item in batch_data:
        try:
            # We construct a PredictRequest manually or just extract features directly
            u, g, r, i, z = item['u'], item['g'], item['r'], item['i'], item['z']
            
            result = predict([u, g, r, i, z])
            status = classify(result["failure_prob"])
            cosmology = None
            if status == "success":
                cosmology = calculate(result["z_mode"])
                
            results.append({
                "status": status,
                "warning": None if status == "success" else "Prediction may be unreliable",
                "redshift": {
                    "z_mode": result["z_mode"],
                    "z_mean": result["z_mean"],
                    "z_std": result["z_std"]
                },
                "failure_score": result["failure_prob"],
                "cosmology": cosmology,
                "pdf": {
                    "z_grid": result["z_grid"],
                    "probabilities": result["pdf"]
                }
            })
        except Exception as e:
            # Append a failure result if one row errors out to keep list aligned
            results.append({
                "status": "error",
                "warning": str(e),
                "redshift": {"z_mode": 0, "z_mean": 0, "z_std": 0},
                "failure_score": 1.0,
                "cosmology": None,
                "pdf": {"z_grid": [], "probabilities": []}
            })
            
    return {"results": results}

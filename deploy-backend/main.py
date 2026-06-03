from fastapi import FastAPI

from schema import PredictRequest

from pipeline import predict
from cosmology import calculate

app = FastAPI(
    title="Photmetric Redshift Failure Detection API"
)

@app.post("/predict")
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
        "warning": 
            None
            if status == "success"
            else "Prediction may be unreliable",
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

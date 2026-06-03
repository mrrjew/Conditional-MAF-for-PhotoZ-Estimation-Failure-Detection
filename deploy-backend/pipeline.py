import joblib
import numpy as np 

feature_scaler = joblib.load("/models/feature_scaler.pkl")
shape_scaler = joblib.load("/models/shape_scaler.pkl")
rf_model = joblib.load("/models/rf_failure.pkl")

param_net = build_param_net()

param_net.load_weights("/models/param_net.weights.h5")


# actual prediction
def predict(features):
    x = np.array([features])

    x_scaled = feature_scaler.transform(x)

    pz, z_grid = predict_pdf(param_net, x_scaled)

    z_mode = compute_mode(z_grid,pz)

    z_mean = compute_mean(z_grid,pz)

    z_std = compute_std(z_grid, pz)

    bimodality = compute_bimodality(pz)

    width = z_std

    shape = np.array(
        [[bimodality,width]]
    )

    shaped_scaled = shape_scaler.transform(shape)

    failure_prob = rf_model.model.predict_proba(shaped_scaled)[0,1]

    return {
        "z_mode": z_mode,
        "z_mean": z_mean,
        "z_std": z_std,
        "bimodality": bimodality,
        "width": width,
        "failure_prob": float(failure_prob),
        "pdf": pz.tolist(),
        "z_grid": z_grid.tolist()
    }



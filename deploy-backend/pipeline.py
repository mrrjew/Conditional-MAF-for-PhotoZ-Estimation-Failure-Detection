import os
import joblib
import numpy as np
import tensorflow as tf
import tensorflow_probability as tfp
from scipy.signal import find_peaks

tfb = tfp.bijectors
tfd = tfp.distributions

def build_param_net(num_features: int = 9, num_maf_layers: int = 6, hidden_units: int = 128) -> tf.keras.Model:
    cond_input = tf.keras.Input(shape=(num_features,), name="cond_features")
    h = tf.keras.layers.Dense(hidden_units, activation="relu")(cond_input)
    h = tf.keras.layers.Dense(hidden_units, activation="relu")(h)
    cond_encoded = tf.keras.layers.Dense(hidden_units, name="cond_encoded")(h)

    outputs = []
    for i in range(num_maf_layers):
        loc_i = tf.keras.layers.Dense(1, name=f"loc_{i}")(cond_encoded)
        log_scale_i = tf.keras.layers.Dense(1, name=f"log_scale_{i}")(cond_encoded)
        outputs.extend([loc_i, log_scale_i])

    model = tf.keras.Model(inputs=cond_input, outputs=outputs, name="maf_param_net")
    return model

base_dir = os.path.dirname(__file__)
feature_scaler = joblib.load(os.path.join(base_dir, "models", "feature_scaler.pkl"))
shape_scaler = joblib.load(os.path.join(base_dir, "models", "shape_scaler.pkl"))
rf_model = joblib.load(os.path.join(base_dir, "models", "rf_failure.pkl"))

param_net = build_param_net()
param_net.load_weights(os.path.join(base_dir, "models", "param_net.weights.h5"))

NUM_MAF_LAYERS = 6
Z_GRID = np.linspace(0.0, 4.0, 100).astype(np.float32)
dz = Z_GRID[1] - Z_GRID[0]

def predict_pdf(param_net, x_scaled):
    x_rep = tf.repeat(x_scaled, len(Z_GRID), axis=0)
    params = param_net(x_rep, training=False)

    bijector_list = []
    for i in range(NUM_MAF_LAYERS):
        loc_i = tf.squeeze(params[2 * i], axis=-1)
        log_scale_i = tf.squeeze(params[2 * i + 1], axis=-1)
        scale_i = tf.nn.softplus(log_scale_i) + 1e-5
        bij = tfb.Chain([tfb.Shift(loc_i), tfb.Scale(scale_i)])
        bijector_list.append(bij)
        if i < NUM_MAF_LAYERS - 1:
            bijector_list.append(tfb.Identity())

    chained = tfb.Chain(list(reversed(bijector_list)))
    base_dist = tfd.Normal(loc=tf.zeros_like(loc_i), scale=tf.ones_like(loc_i))
    flow = tfd.TransformedDistribution(distribution=base_dist, bijector=chained)

    log_probs = flow.log_prob(tf.constant(Z_GRID))
    probs = tf.exp(log_probs).numpy()
    probs /= (probs.sum() * dz + 1e-12)
    return probs, Z_GRID

def compute_mode(z_grid, pz):
    return z_grid[np.argmax(pz)]

def compute_mean(z_grid, pz):
    return np.sum(pz * z_grid) * dz

def compute_std(z_grid, pz):
    z_mean = compute_mean(z_grid, pz)
    var = np.sum(pz * (z_grid - z_mean)**2) * dz
    return np.sqrt(var)

def compute_bimodality(pz):
    PEAK_PROMINENCE = 0.01
    prominence = PEAK_PROMINENCE * pz.max()
    peaks, _ = find_peaks(pz, prominence=prominence)
    return min((len(peaks) - 1) / 3.0, 1.0) if len(peaks) > 1 else 0.0

# actual prediction
def predict(features):
    u, g, r, i, z = features
    # features: 'u-g', 'g-r', 'r-i', 'i-z', 'u', 'g', 'r', 'i', 'z'
    x = np.array([[u-g, g-r, r-i, i-z, u, g, r, i, z]])

    x_scaled = feature_scaler.transform(x)

    pz, z_grid = predict_pdf(param_net, x_scaled)

    z_mode = compute_mode(z_grid, pz)
    z_mean = compute_mean(z_grid, pz)
    z_std = compute_std(z_grid, pz)

    bimodality = compute_bimodality(pz)
    width = z_std

    shape = np.array([[bimodality, width]])
    shaped_scaled = shape_scaler.transform(shape)

    failure_prob = rf_model.predict_proba(shaped_scaled)[0, 1]

    return {
        "z_mode": float(z_mode),
        "z_mean": float(z_mean),
        "z_std": float(z_std),
        "bimodality": float(bimodality),
        "width": float(width),
        "failure_prob": float(failure_prob),
        "pdf": pz.tolist(),
        "z_grid": z_grid.tolist()
    }

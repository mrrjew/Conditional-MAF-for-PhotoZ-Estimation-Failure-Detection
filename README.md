# Conditional MAF for PhotoZ Estimation & Failure Detection

A full-stack project for photometric redshift estimation and failure detection using a Conditional Masked Autoregressive Flow (Conditional MAF) model and a Random Forest classifier. The project combines a Python machine learning pipeline with a React frontend to let users explore galaxy redshift predictions and flag potentially unreliable photometric estimates.

This repository includes:
- a training notebook for the photometric redshift model,
- a FastAPI backend for inference,
- a React/Vite frontend for interactive predictions,
- and pre-trained model artifacts for quick deployment and testing.

## Project Overview

Photometric redshift estimation is a key task in cosmology and large-scale galaxy surveys. Traditional methods can produce biased or uncertain redshift estimates for some galaxies, especially when the data are noisy or ambiguous. This project addresses that challenge by:

- estimating a probability density over redshift using a conditional MAF,
- summarizing the posterior with z_mode, z_mean, and z_std,
- detecting likely redshift estimation failures with a Random Forest classifier based on redshift shape statistics,
- exposing the workflow through a user-friendly web interface for single-object and batch analysis.

## Why This Project Matters

Accurate photometric redshift estimation is critical for:
- targeted spectroscopic follow-up,
- galaxy population studies,
- cosmological parameter estimation,
- identifying objects that should be prioritized for spectroscopy.

The system is designed to help prioritize galaxies that may have unreliable photometric redshift estimates, which is essential in observational astronomy workflows.

## Core Methodology

The backend model pipeline is built around two complementary components:

1. Conditional MAF for redshift PDF estimation
   - Uses the observed photometric colors and magnitudes as conditioning features.
   - Models the distribution of possible redshifts instead of a single point estimate.
   - Produces a redshift probability density function (PDF), along with summary statistics.

2. Random Forest failure detector
   - Computes features such as bimodality and width of the redshift PDF.
   - Classifies whether a galaxy is likely to be a redshift estimation failure.
   - Returns a failure probability used to flag uncertain cases.

This combination enables both probabilistic redshift estimation and reliability assessment.

## Features

- Single galaxy redshift prediction
- Batch dataset analysis
- Photometric band-based inference using u, g, r, i, z inputs
- Redshift PDF visualization
- Failure probability and warning status
- Basic cosmology metrics for successful predictions
- FastAPI backend for integration and deployment
- Vite + React frontend for interactive exploration

## Repository Structure

```text
.
├── Predicting_Photometric_Redshift_Failures_Using_Machine_Learning_for_Spectroscopic_Target_Selection.ipynb
├── predicting_photometric_redshift_failures_using_machine_learning_for_spectroscopic_target_selection.py
├── specz-data.csv
├── feature_scaler.pkl
├── shape_scaler.pkl
├── rf_failure.pkl
├── param_net.weights.h5
├── manage_packages.py
├── deploy-backend/
│   ├── main.py
│   ├── pipeline.py
│   ├── schema.py
│   ├── cosmology.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── models/
│       ├── feature_scaler.pkl
│       ├── shape_scaler.pkl
│       ├── rf_failure.pkl
│       └── param_net.weights.h5
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   ├── .env.example
│   └── README.md
└── README.md
```

## Tech Stack

### Backend
- Python
- FastAPI
- NumPy
- Pandas
- Scikit-learn
- TensorFlow
- TensorFlow Probability
- Astropy
- SciPy

### Frontend
- React
- Vite
- Chart.js
- React ChartJS 2
- Lucide React

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- npm
- (Optional) Docker for containerized deployment

### 1) Clone the repository

```bash
git clone https://github.com/mrrjew/Conditional-MAF-for-PhotoZ-Estimation-Failure-Detection.git
cd Conditional-MAF-for-PhotoZ-Estimation-Failure-Detection
```

### 2) Set up the backend

```bash
cd deploy-backend
python -m venv .venv
source .venv/bin/activate  # Linux/macOS
# or .venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

Start the API:

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The API will be available at:
- http://localhost:8000/docs
- http://localhost:8000/predict
- http://localhost:8000/predict/batch

### 3) Set up the frontend

```bash
cd ../frontend
npm install
cp .env.example .env.local
```

Then update `.env.local` with your backend address:

```env
VITE_API_URL=http://localhost:8000
```

Run the frontend:

```bash
npm run dev
```

Open the local Vite URL shown in the terminal (typically http://localhost:5173).

## API Usage

### Single prediction

Request body:

```json
{
  "u": 20.4,
  "g": 19.9,
  "r": 19.2,
  "i": 18.8,
  "z": 18.6
}
```

Example with curl:

```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "u": 20.4,
    "g": 19.9,
    "r": 19.2,
    "i": 18.8,
    "z": 18.6
  }'
```

Response includes:
- `status`: `success` or `failure`
- `warning`: a reliability warning if triggered
- `redshift`: z_mode, z_mean, z_std
- `failure_score`: model confidence of failure
- `cosmology`: computed cosmology metrics when applicable
- `pdf`: z-grid and associated probabilities

### Batch prediction

```json
{
  "data": [
    {"u": 20.4, "g": 19.9, "r": 19.2, "i": 18.8, "z": 18.6},
    {"u": 21.1, "g": 20.2, "r": 19.7, "i": 19.4, "z": 19.1}
  ]
}
```

## Docker Deployment

The backend includes a Dockerfile for containerized deployment:

```bash
cd deploy-backend
docker build -t photoz-api .
docker run -p 8000:8000 photoz-api
```

You can then point the frontend `VITE_API_URL` to the running container host.

## Training and Model Artifacts

The repository includes a training notebook and Python script that pipeline the model training process. Pre-trained model artifacts are already included so that the application can run immediately without retraining.

Files such as:
- `param_net.weights.h5`
- `rf_failure.pkl`
- `feature_scaler.pkl`
- `shape_scaler.pkl`

are used directly by the inference code in `deploy-backend/pipeline.py`.

## How the Inference Works

For each galaxy:

1. The model constructs a feature vector from color and magnitude differences:
   - u-g
   - g-r
   - r-i
   - i-z
   - and raw magnitudes u, g, r, i, z
2. The feature scaler normalizes the input.
3. A conditional MAF estimates a redshift PDF over a fixed z-grid.
4. Summary statistics are computed:
   - z_mode
   - z_mean
   - z_std
5. PDF shape statistics like bimodality and width are computed.
6. A Random Forest classifier predicts the probability that the redshift estimation is unreliable.
7. The backend returns a structured JSON response for the UI.

## Development Notes

- The frontend is a lightweight dashboard for exploring single-object results and batch datasets.
- The backend exposes a simple REST API and is designed to be easy to integrate into broader astronomy pipelines.
- The training notebook is useful for reproducing or extending the model with new survey data.

## License

This project does not currently declare a specific license.

## Acknowledgements

This project sits at the intersection of astronomy, machine learning, and applied statistical inference. It is designed for research and prototyping workflows in photometric redshift estimation and spectroscopic target selection.

## Future Improvements

Potential extensions include:
- better model calibration and uncertainty reporting,
- support for additional photometric bands,
- comparison against baseline redshift estimation methods,
- export of batch predictions to CSV,
- deployment with Docker Compose or cloud infrastructure,
- improved UI for PDF exploration and summary metrics.

## Contributing

Contributions are welcome. If you want to improve the model, add new analysis features, or refine the interface:

1. Fork the repository.
2. Create a feature branch.
3. Make your changes.
4. Open a pull request with a clear summary of the improvement.

## Contact

Created by Jew Kofi Larbi Danquah.

You can use the repository as a starting point for deeper photometric redshift modeling, survey selection pipelines, or scientific ML tooling.

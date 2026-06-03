import joblib

rf_model = joblib.load("models/rf_failure.pkl")
print("RF expected features:", rf_model.n_features_in_)
if hasattr(rf_model, "feature_names_in_"):
    print("Feature names:", rf_model.feature_names_in_)

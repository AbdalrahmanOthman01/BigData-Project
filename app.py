from flask import Flask, render_template, request, jsonify
import joblib
import xgboost as xgb
import pandas as pd
import numpy as np
import os

app = Flask(__name__, template_folder='app/templates', static_folder='app/static')

# Model metadata
MODELS = {
    'xgboost': {
        'name': 'XGBoost',
        'accuracy': 0.87,
        'f1': 0.86,
        'path': 'app/models/xgboost_model.json',
        'type': 'json',
        'description': 'High performance gradient boosting model'
    },
    'lightgbm': {
        'name': 'LightGBM',
        'accuracy': 0.64,
        'f1': 0.63,
        'path': 'app/models/lightgbm_model.pkl',
        'type': 'pkl',
        'description': 'Fast and efficient LightGBM model'
    },
    'catboost': {
        'name': 'CatBoost',
        'accuracy': 0.85,
        'f1': 0.84,
        'path': 'app/models/catboost_model.cbm',
        'type': 'catboost',
        'description': 'Robust categorical boosting model'
    }
}

# Load models
loaded_models = {}
for key, meta in MODELS.items():
    if meta['type'] == 'pkl':
        loaded_models[key] = joblib.load(meta['path'])
    elif meta['type'] == 'catboost':
        from catboost import CatBoostClassifier
        model = CatBoostClassifier()
        model.load_model(meta['path'])
        loaded_models[key] = model
    else:
        model = xgb.Booster()
        model.load_model(meta['path'])
        loaded_models[key] = model

# Example feature columns (simplified for demo)
FEATURES = ['Start_Lat', 'Start_Lng', 'Distance(mi)', 'Temperature(F)', 'Humidity(%)', 'Visibility(mi)', 'Wind_Speed(mph)']

@app.route('/')
def index():
    return render_template('index.html', models=MODELS, features=FEATURES)

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    model_key = data.get('model')
    inputs = data.get('inputs')

    if model_key not in loaded_models:
        return jsonify({'error': 'Invalid model'}), 400

    # Create input df
    df = pd.DataFrame([inputs], columns=FEATURES)
    X = df.values.astype(np.float32)

    model = loaded_models[model_key]
    mtype = MODELS[model_key]['type']
    if mtype == 'json':
        dmatrix = xgb.DMatrix(X)
        pred = model.predict(dmatrix)
        severity = int(np.argmax(pred, axis=1)[0]) + 1
    elif mtype == 'catboost':
        pred = model.predict_proba(X)
        severity = int(np.argmax(pred, axis=1)[0]) + 1
    else:
        pred = model.predict(X)
        severity = int(pred[0]) + 1  # assuming 0-indexed

    return jsonify({
        'severity': severity,
        'model': MODELS[model_key]['name'],
        'confidence': float(np.max(pred)) if hasattr(pred, '__len__') else 0.8
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
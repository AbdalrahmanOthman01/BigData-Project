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
        'path': 'app/Models/xgboost_model.json',
        'type': 'json',
        'description': 'High performance gradient boosting model'
    },
    'lightgbm': {
        'name': 'LightGBM',
        'accuracy': 0.64,
        'f1': 0.63,
        'path': 'app/Models/lightgbm_model.pkl',
        'type': 'pkl',
        'description': 'Fast and efficient LightGBM model'
    },
    'catboost': {
        'name': 'CatBoost',
        'accuracy': 0.85,
        'f1': 0.84,
        'path': 'app/Models/catboost_model.cbm',
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

# The 7 basic inputs shown in the simple layout
FEATURES = ['Start_Lat', 'Start_Lng', 'Distance(mi)', 'Temperature(F)', 'Humidity(%)', 'Visibility(mi)', 'Wind_Speed(mph)']

@app.route('/')
def index():
    return render_template('index.html', models=MODELS, features=FEATURES)

@app.route('/stats')
def stats():
    # Return aggregated statistics matching the real US Accidents dataset distribution
    severity_dist = {
        'labels': ['Severity 1 (Minor)', 'Severity 2 (Moderate)', 'Severity 3 (Severe)', 'Severity 4 (Extreme)'],
        'data': [73683, 7059800, 1348623, 252911],
        'percentages': [0.8, 80.8, 15.4, 2.9]
    }
    
    hourly_trends = {
        'labels': [f"{h:02d}:00" for h in range(24)],
        'data': [15000, 12000, 10000, 18000, 42000, 85000, 248000, 276000, 185000, 132000, 122000, 138000, 
                 145000, 178000, 218000, 288000, 312000, 198000, 122000, 88000, 68000, 48000, 32000, 22000]
    }
    
    weather_impact = {
        'labels': ['Fair / Clear', 'Cloudy / Overcast', 'Rain / Drizzle', 'Snow / Winter Storm', 'Fog / Haze', 'Thunderstorm / Severe'],
        'data': [4520110, 2843210, 848900, 153020, 122400, 81210]
    }
    
    return jsonify({
        'severity_dist': severity_dist,
        'hourly_trends': hourly_trends,
        'weather_impact': weather_impact
    })

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    model_key = data.get('model')
    inputs = data.get('inputs', {})

    if model_key not in loaded_models:
        return jsonify({'error': 'Invalid model'}), 400

    # 📍 GEO FEATURES
    lat = float(inputs.get('Start_Lat', 34.0))
    lng = float(inputs.get('Start_Lng', -118.0))
    lat_bucket = int(lat / 0.5)
    lng_bucket = int(lng / 0.5)

    # 📊 NUMERIC FEATURES
    dist = float(inputs.get('Distance(mi)', 0.5))
    log_dist = float(np.log1p(dist))
    temp = float(inputs.get('Temperature(F)', 65.0))
    wind_chill = temp  # Wind_Chill(F) defaulted to Temperature(F)
    humidity = float(inputs.get('Humidity(%)', 70.0))
    pressure = 29.92   # Pressure(in) defaulted to standard atmospheric pressure
    visibility = float(inputs.get('Visibility(mi)', 10.0))
    wind_speed = float(inputs.get('Wind_Speed(mph)', 8.0))
    precip = float(inputs.get('Precipitation(in)', 0.0))

    # 🚦 ROAD / BINARY FEATURES (13 binary indicators)
    traffic_signal = int(inputs.get('Traffic_Signal', 0))
    junction = int(inputs.get('Junction', 0))
    crossing = int(inputs.get('Crossing', 0))
    stop = int(inputs.get('Stop', 0))
    amenity = int(inputs.get('Amenity', 0))
    bump = int(inputs.get('Bump', 0))
    give_way = int(inputs.get('Give_Way', 0))
    no_exit = int(inputs.get('No_Exit', 0))
    railway = int(inputs.get('Railway', 0))
    roundabout = int(inputs.get('Roundabout', 0))
    station = int(inputs.get('Station', 0))
    traffic_calming = int(inputs.get('Traffic_Calming', 0))
    turning_loop = int(inputs.get('Turning_Loop', 0))

    # ⏱ TIME FEATURES
    hour = int(inputs.get('Hour', 12))
    day_of_week = int(inputs.get('DayOfWeek', 2))  # 1=Sun, 2=Mon, ..., 7=Sat
    month = int(inputs.get('Month', 5))
    is_weekend = 1 if day_of_week in [1, 7] else 0

    # 🧠 ENGINEERED FEATURES
    road_risk_score = traffic_signal + junction + crossing + stop
    bad_weather_flag = 1 if (visibility < 2 or precip > 0.1 or wind_speed > 20) else 0

    # 🧾 ENCODED CATEGORICALS
    weather = inputs.get('Weather_Condition', 'Fair')
    # Simple encoding map matching frequency indices from spark stringindexer
    weather_map = {
        'Fair': 0.0, 'Clear': 0.0, 'Sunny': 0.0,
        'Cloudy': 1.0, 'Mostly Cloudy': 1.0, 'Overcast': 1.0, 'Partly Cloudy': 1.0, 'Scattered Clouds': 1.0,
        'Rain': 2.0, 'Light Rain': 2.0, 'Drizzle': 2.0, 'Heavy Rain': 2.0,
        'Snow': 3.0, 'Light Snow': 3.0, 'Winter Storm': 3.0,
        'Fog': 4.0, 'Haze': 4.0, 'Mist': 4.0,
        'Thunderstorm': 5.0, 'T-Storm': 5.0
    }
    weather_idx = float(weather_map.get(weather, 0.0))
    wind_dir_idx = 0.0

    # Season map: Winter (12, 1, 2) -> 0, Spring (3, 4, 5) -> 1, Summer (6, 7, 8) -> 2, Autumn (9, 10, 11) -> 3
    if month in [12, 1, 2]:
        season_idx = 0.0
    elif month in [3, 4, 5]:
        season_idx = 1.0
    elif month in [6, 7, 8]:
        season_idx = 2.0
    else:
        season_idx = 3.0

    # Daylight twilight variables derived from hour (approximate daylight hours 6 AM to 6 PM)
    is_day = 1.0 if (6 <= hour <= 18) else 0.0
    sunrise_sunset_idx = is_day
    civil_twilight_idx = is_day
    nautical_twilight_idx = is_day
    astronomical_twilight_idx = is_day

    # Assemble feature vector matching training schema:
    features_list = [
        lat, lng, lat_bucket, lng_bucket,
        dist, log_dist,
        temp, wind_chill, humidity, pressure, visibility, wind_speed, precip,
        traffic_signal, junction, crossing, stop,
        amenity, bump, give_way, no_exit, railway, roundabout, station, traffic_calming, turning_loop,
        hour, day_of_week, month, is_weekend,
        road_risk_score, bad_weather_flag,
        weather_idx, wind_dir_idx, season_idx,
        sunrise_sunset_idx, civil_twilight_idx, nautical_twilight_idx, astronomical_twilight_idx
    ]

    X = np.array([features_list], dtype=np.float32)
    model = loaded_models[model_key]
    mtype = MODELS[model_key]['type']

    if mtype == 'json':
        dmatrix = xgb.DMatrix(X)
        pred = model.predict(dmatrix)
        severity = int(np.argmax(pred, axis=1)[0]) + 1
        confidence = float(np.max(pred))
    elif mtype == 'catboost':
        probs = model.predict_proba(X)
        max_idx = int(np.argmax(probs, axis=1)[0])
        severity = int(model.classes_[max_idx])
        confidence = float(probs[0][max_idx])
    else: # LightGBM classifier
        probs = model.predict_proba(X)
        max_idx = int(np.argmax(probs, axis=1)[0])
        severity = int(model.classes_[max_idx])
        confidence = float(probs[0][max_idx])

    return jsonify({
        'severity': severity,
        'model': MODELS[model_key]['name'],
        'confidence': confidence
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
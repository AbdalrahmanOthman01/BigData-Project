# 🚀 AccidentAI — Big Data ML Project

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.10-blue?style=for-the-badge&logo=python" />
  <img src="https://img.shields.io/badge/Flask-2.3-green?style=for-the-badge&logo=flask" />
  <img src="https://img.shields.io/badge/XGBoost-2.0-orange?style=for-the-badge&logo=python" />
  <img src="https://img.shields.io/badge/Chart.js-4.4-purple?style=for-the-badge" />
</p>

**Professional real-time ML dashboard for predicting car accident severity** using multiple state-of-the-art gradient boosting models trained on the massive US Accidents dataset.

---

## ✨ Features

- **3 Production-Grade Models** — XGBoost (87%), CatBoost (85%), LightGBM (64%)
- **Beautiful Interactive Dashboard** — Real-time data visualizations (severity, hourly trends, weather)
- **Live Prediction Engine** — Input features → instant severity prediction with confidence
- **Elegant Dual-Theme UI** — Dark/light mode toggle with smooth transitions
- **Modern UX** — Animated loading screen with typewriter effect, model cards, glassmorphism
- **Fully Deployed with Flask** — REST API + beautiful frontend

---

## 📊 Model Performance

| Model      | Accuracy | F1 Score | Description                     |
|------------|----------|----------|---------------------------------|
| **XGBoost**    | **87%**      | **86%**      | Best overall performance        |
| **CatBoost**   | 85%      | 84%      | Handles categorical features excellently |
| **LightGBM**   | 64%      | 63%      | Fast training & inference       |

---

## 🛠 Tech Stack

- **Backend**: Flask + Python
- **ML**: XGBoost, CatBoost, LightGBM, scikit-learn
- **Frontend**: Tailwind CSS, Chart.js, vanilla JS
- **Data**: PySpark + Parquet (processed US Accidents dataset)

---

## 🚀 Quick Start

```bash
# 1. Clone repo
git clone https://github.com/yourusername/BigData-Project.git
cd BigData-Project

# 2. Install dependencies
pip install -r requirements.txt

# 3. Run the app
python app.py
```

Open [http://localhost:5000](http://localhost:5000) — enjoy the dashboard!

---

## 📁 Project Structure

```
BigData-Project/
├── app.py                    # Main Flask application
├── requirements.txt
├── app/
│   ├── templates/
│   │   └── index.html        # Beautiful dashboard UI
│   ├── static/
│   │   ├── css/
│   │   └── js/
│   │       └── app.js        # All interactivity + charts
│   └── models/               # Trained .pkl / .json / .cbm files
├── Models/
├── Data/
├── *.ipynb                   # Full data pipeline & training notebooks
└── README.md
```

---

## 📈 Data Visualizations

The dashboard includes live Chart.js visualizations:

- Severity distribution pie chart
- Accidents by hour bar chart
- Weather condition breakdown

---

## 🤝 Contributors

Thanks to everyone who made this project possible!

- [Your Name](https://github.com/yourusername) — Lead ML Engineer & Full-Stack Dev
- [Contributor 2](https://github.com/...) — Data Engineering
- [Contributor 3](https://github.com/...) — UI/UX Design

Want to contribute? Open an issue or PR — all help is welcome! ❤️

---

## 📜 License

MIT License — feel free to use, modify, and share.

---

<p align="center">
  <i>Made with ❤️ and lots of coffee for the Big Data course</i>
</p>

<p align="center">
  <img src="https://readme-typing-svg.herokuapp.com?font=Inter&size=24&duration=3000&color=6366F1&center=true&vCenter=true&width=600&lines=Accident+Severity+Prediction;Real-time+ML+Dashboard;Beautiful+Professional+UI" />
</p>

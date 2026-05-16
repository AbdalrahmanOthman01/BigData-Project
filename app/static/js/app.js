// Model metadata
const modelsData = {
    'xgboost': { name: 'XGBoost', accuracy: 0.87, f1: 0.86, desc: 'High performance gradient boosting' },
    'lightgbm': { name: 'LightGBM', accuracy: 0.64, f1: 0.63, desc: 'Fast and efficient gradient boosting' },
    'catboost': { name: 'CatBoost', accuracy: 0.85, f1: 0.84, desc: 'Robust categorical boosting model' }
};

const features = ['Start_Lat', 'Start_Lng', 'Distance(mi)', 'Temperature(F)', 'Humidity(%)', 'Visibility(mi)', 'Wind_Speed(mph)'];

let selectedModel = 'xgboost';

// Render model cards
function renderModels() {
    const container = document.getElementById('model-list');
    container.innerHTML = '';
    
    Object.keys(modelsData).forEach(key => {
        const m = modelsData[key];
        const card = document.createElement('div');
        card.className = `model-card p-5 border border-zinc-800 dark:border-zinc-300 bg-zinc-900 dark:bg-white rounded-3xl cursor-pointer ${selectedModel === key ? 'selected ring-1 ring-indigo-500' : ''}`;
        card.innerHTML = `
            <div class="flex justify-between items-start">
                <div>
                    <div class="font-semibold text-lg">${m.name}</div>
                    <div class="text-xs text-zinc-400 mt-px">${m.desc}</div>
                </div>
                <div class="text-right">
                    <div class="text-emerald-400 font-semibold text-xl metric-value">${(m.accuracy * 100).toFixed(0)}<span class="text-sm">%</span></div>
                    <div class="text-[10px] text-emerald-400/70 -mt-1">ACCURACY</div>
                </div>
            </div>
            
            <div class="mt-5 flex gap-4 text-xs">
                <div>
                    <span class="text-zinc-400">F1</span> 
                    <span class="font-medium">${m.f1}</span>
                </div>
            </div>
        `;
        
        card.onclick = () => {
            selectedModel = key;
            renderModels();
        };
        
        container.appendChild(card);
    });
}

// Render feature inputs
function renderInputs() {
    const form = document.getElementById('input-form');
    form.innerHTML = '';
    
    features.forEach((feat, i) => {
        const div = document.createElement('div');
        div.innerHTML = `
            <div>
                <label class="block text-xs font-medium text-zinc-400 dark:text-zinc-600 mb-1.5">${feat}</label>
                <input type="number" step="0.01" id="feat-${i}" 
                       class="w-full px-4 h-11 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 focus:border-indigo-500 dark:focus:border-indigo-400 rounded-2xl text-sm outline-none transition-all text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400" 
                       placeholder="0.00" value="${i < 2 ? '34.0' : i === 2 ? '0.5' : i === 3 ? '65' : i === 4 ? '70' : i === 5 ? '10' : '8'}">
            </div>
        `;
        form.appendChild(div);
    });
}

function resetForm() {
    renderInputs();
    document.getElementById('results-panel').classList.add('hidden');
}

async function submitPrediction() {
    const inputs = {};
    features.forEach((feat, i) => {
        const val = parseFloat(document.getElementById(`feat-${i}`).value) || 0;
        inputs[feat] = val;
    });

    const btns = document.querySelectorAll('button');
    btns.forEach(b => b.disabled = true);

    try {
        const res = await fetch('/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: selectedModel, inputs })
        });
        
        const data = await res.json();
        
        if (data.error) {
            alert(data.error);
            return;
        }
        
        showResults(data);
    } catch (e) {
        alert('Prediction failed. Check console.');
        console.error(e);
    } finally {
        btns.forEach(b => b.disabled = false);
    }
}

function showResults(data) {
    const panel = document.getElementById('results-panel');
    panel.classList.remove('hidden');
    
    document.getElementById('severity-value').innerHTML = data.severity;
    document.getElementById('model-used').innerHTML = `${data.model} • ${(data.confidence * 100).toFixed(0)}%`;
    
    const fill = document.getElementById('confidence-fill');
    fill.style.width = `${data.confidence * 100}%`;
    document.getElementById('confidence-value').innerHTML = `${(data.confidence * 100).toFixed(1)}% confidence`;
    
    panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function hideResults() {
    document.getElementById('results-panel').classList.add('hidden');
}

// Boot app
function init() {
    renderModels();
    renderInputs();
    
    // Restore theme properly
    const html = document.documentElement;
    const icon = document.getElementById('theme-icon');
    const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    
    if (localStorage.theme === 'light' || (!localStorage.theme && prefersLight)) {
        html.classList.add('dark');
        if (icon) icon.classList.replace('fa-moon', 'fa-sun');
    } else {
        html.classList.remove('dark');
        if (icon) icon.classList.replace('fa-sun', 'fa-moon');
    }
    
    console.log('%c[AccidentAI] Professional ML dashboard ready', 'color:#666');
}

function toggleTheme() {
    const html = document.documentElement;
    const icon = document.getElementById('theme-icon');
    
    if (html.classList.contains('dark')) {
        html.classList.remove('dark');
        localStorage.theme = 'dark';
        if (icon) icon.classList.replace('fa-sun', 'fa-moon');
    } else {
        html.classList.add('dark');
        localStorage.theme = 'light';
        if (icon) icon.classList.replace('fa-moon', 'fa-sun');
    }
}

window.onload = () => {
    init();
    const loader = document.getElementById('loader');
    if (loader) {
        // Typewriter effect for BigData - Project
        const typed = document.getElementById('typed-text');
        const text = "BigData - Project";
        let i = 0;
        const typeInterval = setInterval(() => {
            if (i < text.length) {
                typed.innerHTML += text.charAt(i);
                i++;
            } else {
                clearInterval(typeInterval);
                setTimeout(() => {
                    const delInterval = setInterval(() => {
                        if (typed.innerHTML.length > 0) {
                            typed.innerHTML = typed.innerHTML.slice(0, -1);
                        } else {
                            clearInterval(delInterval);
                        }
                    }, 45);
                }, 650);
            }
        }, 65);

        setTimeout(() => {
            loader.style.transition = 'opacity .45s cubic-bezier(0.4,0,0.2,1)';
            loader.style.opacity = '0';
            setTimeout(() => loader.style.display = 'none', 450);
        }, 2450);
    }
};
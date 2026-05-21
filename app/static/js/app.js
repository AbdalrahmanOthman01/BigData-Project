// Model metadata matching backend
const modelsData = {
    'xgboost': {
        name: 'XGBoost',
        accuracy: 0.87,
        f1: 0.86,
        desc: 'High performance gradient boosting model',
        icon: 'fa-rocket text-indigo-500',
        badge: 'Top Performer'
    },
    'lightgbm': {
        name: 'LightGBM',
        accuracy: 0.64,
        f1: 0.63,
        desc: 'Fast and efficient LightGBM model',
        icon: 'fa-bolt text-amber-500',
        badge: 'Optimized Speed'
    },
    'catboost': {
        name: 'CatBoost',
        accuracy: 0.85,
        f1: 0.84,
        desc: 'Robust categorical boosting model',
        icon: 'fa-cat text-rose-500',
        badge: 'Highly Robust'
    }
};

let selectedModel = 'xgboost';
let charts = {}; // Holds Chart.js instances

// Render model cards
function renderModels() {
    const container = document.getElementById('model-list');
    if (!container) return;
    container.innerHTML = '';
    
    Object.keys(modelsData).forEach(key => {
        const m = modelsData[key];
        const isSelected = selectedModel === key;
        
        const card = document.createElement('div');
        card.className = `glass-card p-5 rounded-3xl cursor-pointer transition-all duration-300 relative overflow-hidden ${
            isSelected 
            ? 'ring-2 ring-indigo-500 border-indigo-400 dark:ring-indigo-400 dark:border-indigo-400 glow-indigo-selected bg-indigo-50/20 dark:bg-indigo-950/20' 
            : 'hover:border-slate-300 dark:hover:border-slate-700 bg-white/70 dark:bg-slate-900/60'
        }`;
        
        card.innerHTML = `
            <div class="flex justify-between items-start mb-4">
                <div class="flex gap-3">
                    <div class="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200/50 dark:border-slate-700/50">
                        <i class="fa-solid ${m.icon} text-lg"></i>
                    </div>
                    <div>
                        <div class="font-display font-bold text-slate-900 dark:text-white text-base">${m.name}</div>
                        <div class="text-[11px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-semibold">${m.badge}</div>
                    </div>
                </div>
                <div class="text-right">
                    <div class="text-emerald-600 dark:text-emerald-400 font-extrabold text-lg font-mono">${(m.accuracy * 100).toFixed(0)}%</div>
                    <div class="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Accuracy</div>
                </div>
            </div>
            
            <p class="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">${m.desc}</p>
            
            <div class="space-y-2">
                <div>
                    <div class="flex justify-between text-[10px] text-slate-400 font-bold mb-1">
                        <span>ACCURACY & F1 METRIC</span>
                        <span>F1: ${m.f1}</span>
                    </div>
                    <div class="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div class="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full" style="width: ${m.accuracy * 100}%"></div>
                    </div>
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

// Tab Switching Logic
function switchTab(tabId) {
    // Hide all tabs
    document.querySelectorAll('.tab-pane').forEach(el => el.classList.add('hidden'));
    // Show selected tab
    const selected = document.getElementById(tabId);
    if (selected) selected.classList.remove('hidden');
    
    // Reset tab buttons style
    const tabs = ['geo-time', 'weather', 'road'];
    tabs.forEach(t => {
        const btn = document.getElementById(`btn-tab-${t}`);
        if (btn) {
            if (tabId === `tab-${t}`) {
                btn.classList.remove('border-transparent', 'text-slate-400');
                btn.classList.add('border-indigo-500', 'text-indigo-600', 'dark:text-indigo-400');
            } else {
                btn.classList.remove('border-indigo-500', 'text-indigo-600', 'dark:text-indigo-400');
                btn.classList.add('border-transparent', 'text-slate-400');
            }
        }
    });
}

// Update slider labels dynamically
function updateSliderLabel(type, val) {
    const label = document.getElementById(`val-${type}`);
    if (label) label.textContent = val;
}

function updateHourLabel(val) {
    const label = document.getElementById('val-hour');
    if (label) {
        label.textContent = `${val.padStart(2, '0')}:00`;
    }
}

// Reset form
function resetForm() {
    document.getElementById('prediction-form').reset();
    
    // Reset slider label displays
    updateSliderLabel('distance', '0.5');
    updateHourLabel('12');
    updateSliderLabel('temp', '65');
    updateSliderLabel('humidity', '70%');
    updateSliderLabel('visibility', '10.0');
    updateSliderLabel('wind', '8');
    updateSliderLabel('precip', '0.00');
    
    // Switch back to first tab
    switchTab('tab-geo-time');
    
    // Hide result panel
    hideResults();
}

// Submit inputs to API and trigger visualization
async function submitPrediction() {
    const btn = document.getElementById('btn-predict');
    const originalText = btn.innerHTML;
    
    // Show spinner & disable button
    btn.disabled = true;
    btn.innerHTML = `<i class="fa-solid fa-circle-notch animate-spin"></i> <span>Analyzing conditions...</span>`;
    
    const inputs = {
        'Start_Lat': parseFloat(document.getElementById('input-lat').value) || 34.0522,
        'Start_Lng': parseFloat(document.getElementById('input-lng').value) || -118.2437,
        'Distance(mi)': parseFloat(document.getElementById('slider-distance').value) || 0.5,
        'Temperature(F)': parseFloat(document.getElementById('slider-temp').value) || 65,
        'Humidity(%)': parseFloat(document.getElementById('slider-humidity').value) || 70,
        'Visibility(mi)': parseFloat(document.getElementById('slider-visibility').value) || 10,
        'Wind_Speed(mph)': parseFloat(document.getElementById('slider-wind').value) || 8,
        'Precipitation(in)': parseFloat(document.getElementById('slider-precip').value) || 0,
        'Hour': parseInt(document.getElementById('slider-hour').value) || 12,
        'DayOfWeek': parseInt(document.getElementById('select-day').value) || 2,
        'Month': parseInt(document.getElementById('select-month').value) || 5,
        
        // Road infrastructure features
        'Traffic_Signal': document.getElementById('toggle-traffic-signal').checked ? 1 : 0,
        'Junction': document.getElementById('toggle-junction').checked ? 1 : 0,
        'Crossing': document.getElementById('toggle-crossing').checked ? 1 : 0,
        'Stop': document.getElementById('toggle-stop').checked ? 1 : 0,
        'Amenity': document.getElementById('toggle-amenity').checked ? 1 : 0,
        'Bump': document.getElementById('toggle-bump').checked ? 1 : 0,
        'Give_Way': document.getElementById('toggle-give-way').checked ? 1 : 0,
        'No_Exit': document.getElementById('toggle-no-exit').checked ? 1 : 0,
        'Railway': document.getElementById('toggle-railway').checked ? 1 : 0,
        'Roundabout': document.getElementById('toggle-roundabout').checked ? 1 : 0,
        'Station': document.getElementById('toggle-station').checked ? 1 : 0,
        'Traffic_Calming': document.getElementById('toggle-traffic-calming').checked ? 1 : 0,
        'Turning_Loop': document.getElementById('toggle-turning-loop').checked ? 1 : 0,
        
        // Weather
        'Weather_Condition': document.getElementById('select-weather').value || 'Fair'
    };

    try {
        const response = await fetch('/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: selectedModel, inputs })
        });
        
        const data = await response.json();
        
        if (data.error) {
            alert('Prediction error: ' + data.error);
            return;
        }
        
        showResults(data);
    } catch (e) {
        alert('Failed to execute model prediction. See developer console.');
        console.error('Prediction fail:', e);
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
}

// Display outputs with severity color maps and explanations
function showResults(data) {
    const panel = document.getElementById('results-panel');
    if (!panel) return;
    
    panel.classList.remove('hidden');
    
    // Set severity text
    const severityVal = document.getElementById('severity-value');
    severityVal.textContent = data.severity;
    
    // Set model name badge
    const modelUsed = document.getElementById('model-used');
    modelUsed.textContent = `${data.model} Classifier`;
    
    // Setup color mapping for severity classes [1-4]
    const severityBadge = document.getElementById('severity-badge');
    const severityDesc = document.getElementById('severity-desc');
    const resultGlow = document.getElementById('result-glow');
    
    let colorClass = '';
    let statusLabel = '';
    let description = '';
    let glowColor = '';
    
    switch (data.severity) {
        case 1:
            colorClass = 'bg-emerald-500 border-emerald-400';
            glowColor = '#10b981';
            statusLabel = 'Minor Impact';
            description = 'Clearance is underway. The accident location is expected to have minor to no residual impact on general traffic speeds. Minimal delays under 10 minutes.';
            break;
        case 2:
            colorClass = 'bg-blue-500 border-blue-400';
            glowColor = '#3b82f6';
            statusLabel = 'Moderate Delay';
            description = 'Some lane blockage has occurred. Expect local slowdowns and moderate traffic backup. Estimated delays between 15 and 30 minutes.';
            break;
        case 3:
            colorClass = 'bg-amber-500 border-amber-400';
            glowColor = '#f59e0b';
            statusLabel = 'Severe Delay';
            description = 'Multiple lanes are blocked. Expect heavy delay and queuing back to upstream junctions. Re-routing or alternate pathways are strongly advised. Delays of 30-60 minutes.';
            break;
        case 4:
            colorClass = 'bg-rose-600 border-rose-500';
            glowColor = '#e11d48';
            statusLabel = 'Extreme Danger / Closure';
            description = 'Critical event. Road is fully closed in the corresponding direction. Complete gridlock has formed. Expect severe delays exceeding 60 minutes. Emergency responder presence high.';
            break;
        default:
            colorClass = 'bg-slate-500 border-slate-400';
            glowColor = '#64748b';
            statusLabel = 'Unknown Severity';
            description = 'Prediction completed, but the severity class is unmapped.';
    }
    
    // Apply styling classes
    severityBadge.className = `mt-2 px-3 py-1 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white shadow-sm border ${colorClass}`;
    severityBadge.textContent = statusLabel;
    severityDesc.textContent = description;
    
    // Setup ambient background glow color
    resultGlow.style.backgroundColor = glowColor;
    
    // Set confidence variables
    const confPct = (data.confidence * 100).toFixed(1);
    const confidenceVal = document.getElementById('confidence-value');
    confidenceVal.textContent = `${confPct}%`;
    
    const confidenceFill = document.getElementById('confidence-fill');
    confidenceFill.style.width = `${confPct}%`;
    
    // Custom gradient coloring for confidence fill bar based on class
    confidenceFill.className = `h-full rounded-full transition-all duration-700 ${
        data.severity === 4 ? 'bg-rose-500' : data.severity === 3 ? 'bg-amber-500' : 'bg-indigo-500'
    }`;
    
    // Scroll result container smoothly into view
    panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function hideResults() {
    const panel = document.getElementById('results-panel');
    if (panel) panel.classList.add('hidden');
}

// Fetch stats and render charts using Chart.js
async function loadAnalytics() {
    try {
        const response = await fetch('/stats');
        const stats = await response.json();
        
        initializeCharts(stats);
    } catch (e) {
        console.error('Failed to load dataset statistics:', e);
    }
}

// Initialize the 3 dashboard charts
function initializeCharts(stats) {
    const isDark = document.documentElement.classList.contains('dark');
    const gridColor = isDark ? 'rgba(51, 65, 85, 0.4)' : 'rgba(226, 232, 240, 0.8)';
    const textColor = isDark ? '#94a3b8' : '#475569';
    const fontConfig = { family: "'Inter', sans-serif", size: 11 };

    // 1. Severity Doughnut Chart
    const ctxSeverity = document.getElementById('chart-severity').getContext('2d');
    charts.severity = new Chart(ctxSeverity, {
        type: 'doughnut',
        data: {
            labels: stats.severity_dist.labels,
            datasets: [{
                data: stats.severity_dist.data,
                backgroundColor: [
                    '#10b981', // green
                    '#3b82f6', // blue
                    '#f59e0b', // amber
                    '#e11d48'  // rose
                ],
                borderWidth: isDark ? 2 : 1,
                borderColor: isDark ? '#0f172a' : '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: textColor,
                        font: fontConfig,
                        boxWidth: 12,
                        padding: 15
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const val = context.raw;
                            const idx = context.dataIndex;
                            const pct = stats.severity_dist.percentages[idx];
                            return ` Count: ${val.toLocaleString()} (${pct}%)`;
                        }
                    }
                }
            },
            cutout: '65%'
        }
    });

    // 2. Hourly Trends Line Chart
    const ctxHourly = document.getElementById('chart-hourly').getContext('2d');
    
    // Create gradient background for line
    const gradient = ctxHourly.createLinearGradient(0, 0, 0, 220);
    gradient.addColorStop(0, 'rgba(99, 102, 241, 0.4)');
    gradient.addColorStop(1, 'rgba(99, 102, 241, 0.0)');

    charts.hourly = new Chart(ctxHourly, {
        type: 'line',
        data: {
            labels: stats.hourly_trends.labels,
            datasets: [{
                label: 'Total Accidents Recorded',
                data: stats.hourly_trends.data,
                borderColor: '#6366f1',
                backgroundColor: gradient,
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: '#6366f1',
                pointHoverBorderColor: '#ffffff',
                pointHoverBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { color: textColor, font: fontConfig }
                },
                y: {
                    grid: { color: gridColor },
                    ticks: {
                        color: textColor,
                        font: fontConfig,
                        callback: function(value) {
                            return (value / 1000) + 'k';
                        }
                    }
                }
            }
        }
    });

    // 3. Weather Conditions Bar Chart
    const ctxWeather = document.getElementById('chart-weather').getContext('2d');
    charts.weather = new Chart(ctxWeather, {
        type: 'bar',
        data: {
            labels: stats.weather_impact.labels,
            datasets: [{
                data: stats.weather_impact.data,
                backgroundColor: [
                    'rgba(99, 102, 241, 0.85)',
                    'rgba(168, 85, 247, 0.85)',
                    'rgba(236, 72, 153, 0.85)',
                    'rgba(59, 130, 246, 0.85)',
                    'rgba(14, 165, 233, 0.85)',
                    'rgba(244, 63, 94, 0.85)'
                ],
                borderRadius: 8,
                borderWidth: 0,
                barThickness: 18
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    grid: { color: gridColor },
                    ticks: {
                        color: textColor,
                        font: fontConfig,
                        callback: function(value) {
                            return (value / 1000000) + 'M';
                        }
                    }
                },
                y: {
                    grid: { display: false },
                    ticks: { color: textColor, font: fontConfig }
                }
            }
        }
    });
}

// Update charts configuration when theme changes
function updateChartsTheme(isDark) {
    const gridColor = isDark ? 'rgba(51, 65, 85, 0.4)' : 'rgba(226, 232, 240, 0.8)';
    const textColor = isDark ? '#94a3b8' : '#475569';

    if (charts.severity) {
        charts.severity.options.plugins.legend.labels.color = textColor;
        charts.severity.options.datasets[0].borderColor = isDark ? '#0f172a' : '#ffffff';
        charts.severity.options.datasets[0].borderWidth = isDark ? 2 : 1;
        charts.severity.update();
    }

    if (charts.hourly) {
        charts.hourly.options.scales.x.ticks.color = textColor;
        charts.hourly.options.scales.y.ticks.color = textColor;
        charts.hourly.options.scales.y.grid.color = gridColor;
        
        // Update line background gradient for the new theme
        const ctx = document.getElementById('chart-hourly').getContext('2d');
        const gradient = ctx.createLinearGradient(0, 0, 0, 220);
        if (isDark) {
            gradient.addColorStop(0, 'rgba(99, 102, 241, 0.3)');
            gradient.addColorStop(1, 'rgba(99, 102, 241, 0.0)');
        } else {
            gradient.addColorStop(0, 'rgba(99, 102, 241, 0.4)');
            gradient.addColorStop(1, 'rgba(99, 102, 241, 0.0)');
        }
        charts.hourly.data.datasets[0].backgroundColor = gradient;
        charts.hourly.update();
    }

    if (charts.weather) {
        charts.weather.options.scales.x.ticks.color = textColor;
        charts.weather.options.scales.y.ticks.color = textColor;
        charts.weather.options.scales.x.grid.color = gridColor;
        charts.weather.update();
    }
}

// Theme toggling actions
function toggleTheme() {
    const html = document.documentElement;
    const icon = document.getElementById('theme-icon');
    
    if (html.classList.contains('dark')) {
        html.classList.remove('dark');
        localStorage.setItem('theme', 'light');
        if (icon) icon.className = 'fa-solid fa-moon text-lg';
        updateChartsTheme(false);
    } else {
        html.classList.add('dark');
        localStorage.setItem('theme', 'dark');
        if (icon) icon.className = 'fa-solid fa-sun text-lg';
        updateChartsTheme(true);
    }
}

// Application startup
function init() {
    renderModels();
    
    // Set theme and toggle state on load
    const html = document.documentElement;
    const icon = document.getElementById('theme-icon');
    const storedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (storedTheme === 'dark' || (!storedTheme && prefersDark)) {
        html.classList.add('dark');
        if (icon) icon.className = 'fa-solid fa-sun text-lg';
    } else {
        html.classList.remove('dark');
        if (icon) icon.className = 'fa-solid fa-moon text-lg';
    }
    
    // Load historical stats
    loadAnalytics();
}

window.onload = () => {
    init();
    
    // Trigger loader animations
    const loader = document.getElementById('loader');
    if (loader) {
        const typed = document.getElementById('typed-text');
        const text = "BigData - Project";
        let i = 0;
        
        // Typewriter effect
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
                    }, 40);
                }, 750);
            }
        }, 60);

        // Hide overlay screen
        setTimeout(() => {
            loader.style.transition = 'opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
            loader.style.opacity = '0';
            setTimeout(() => loader.style.display = 'none', 400);
        }, 2200);
    }
};
/**
 * MINDPULSE AI - Interactive Frontend Controller
 */

// Determine API base URL (works seamlessly when served from FastAPI or opened locally)
const API_BASE = (window.location.protocol.startsWith('http')) 
  ? window.location.origin 
  : 'http://127.0.0.1:8000';

// Preset Personas Data
const PERSONAS = {
  balanced: {
    age: 20,
    gender: 'Female',
    country: 'India',
    academic_level: 'Undergraduate',
    most_used_platform: 'LinkedIn',
    purpose_of_use: 'Education',
    avg_daily_usage_hours: 2.5,
    daily_unlocks: 35,
    study_hours: 6.5,
    physical_activity_hours: 1.5,
    sleep_hours_per_night: 8.0,
    stress_level: 'Low'
  },
  doomscroller: {
    age: 19,
    gender: 'Male',
    country: 'USA',
    academic_level: 'Undergraduate',
    most_used_platform: 'TikTok',
    purpose_of_use: 'Entertainment',
    avg_daily_usage_hours: 8.0,
    daily_unlocks: 140,
    study_hours: 1.5,
    physical_activity_hours: 0.2,
    sleep_hours_per_night: 4.5,
    stress_level: 'Very High'
  },
  achiever: {
    age: 23,
    gender: 'Female',
    country: 'UK',
    academic_level: 'Graduate',
    most_used_platform: 'Twitter',
    purpose_of_use: 'Networking',
    avg_daily_usage_hours: 4.5,
    daily_unlocks: 75,
    study_hours: 8.5,
    physical_activity_hours: 0.8,
    sleep_hours_per_night: 6.0,
    stress_level: 'High'
  },
  minimalist: {
    age: 21,
    gender: 'Male',
    country: 'Germany',
    academic_level: 'Undergraduate',
    most_used_platform: 'YouTube',
    purpose_of_use: 'Education',
    avg_daily_usage_hours: 1.5,
    daily_unlocks: 20,
    study_hours: 5.0,
    physical_activity_hours: 2.5,
    sleep_hours_per_night: 8.5,
    stress_level: 'Low'
  }
};

document.addEventListener('DOMContentLoaded', () => {
  setupSliders();
  setupPresets();
  setupCountryPills();
  checkBackendHealth();
  setupFormSubmission();
  setupCopyButton();

  // Run initial prediction with default form values
  setTimeout(() => {
    executePrediction();
  }, 400);
});

/**
 * Configure Range Sliders with real-time value badges and gradient track fills
 */
function setupSliders() {
  const sliders = [
    { id: 'ageSlider', badgeId: 'ageVal', unit: ' yrs', min: 10, max: 100 },
    { id: 'usageSlider', badgeId: 'usageVal', unit: ' hrs/day', min: 0, max: 16, step: 0.5 },
    { id: 'unlocksSlider', badgeId: 'unlocksVal', unit: ' unlocks', min: 0, max: 200 },
    { id: 'studySlider', badgeId: 'studyVal', unit: ' hrs/day', min: 0, max: 16, step: 0.5 },
    { id: 'physicalSlider', badgeId: 'physicalVal', unit: ' hrs/day', min: 0, max: 6, step: 0.25 },
    { id: 'sleepSlider', badgeId: 'sleepVal', unit: ' hrs/night', min: 0, max: 12, step: 0.5 }
  ];

  sliders.forEach(s => {
    const el = document.getElementById(s.id);
    const badge = document.getElementById(s.badgeId);
    if (!el || !badge) return;

    const updateSliderDisplay = () => {
      const val = parseFloat(el.value);
      badge.textContent = val + s.unit;
      
      // Calculate percentage for background gradient fill
      const min = parseFloat(el.min) || s.min || 0;
      const max = parseFloat(el.max) || s.max || 100;
      const pct = ((val - min) / (max - min)) * 100;
      el.style.background = `linear-gradient(to right, #6366f1 0%, #a855f7 ${pct}%, #1e293b ${pct}%, #1e293b 100%)`;
    };

    el.addEventListener('input', updateSliderDisplay);
    updateSliderDisplay();
  });
}

/**
 * Quick-select Country Pills
 */
function setupCountryPills() {
  const pills = document.querySelectorAll('.country-pill');
  const countrySelect = document.getElementById('countrySelect');
  if (!countrySelect) return;

  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const val = pill.getAttribute('data-country');
      countrySelect.value = val;
    });
  });

  countrySelect.addEventListener('change', () => {
    pills.forEach(p => {
      if (p.getAttribute('data-country') === countrySelect.value) {
        p.classList.add('active');
      } else {
        p.classList.remove('active');
      }
    });
  });
}

/**
 * Quick Demo Preset Buttons
 */
function setupPresets() {
  const presetBtns = document.querySelectorAll('[data-preset]');
  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const presetKey = btn.getAttribute('data-preset');
      const data = PERSONAS[presetKey];
      if (!data) return;

      applyFormData(data);
      showToast(`Loaded "${btn.textContent.trim()}" preset`);
      executePrediction();
    });
  });
}

/**
 * Apply given data object into all form controls
 */
function applyFormData(data) {
  // Sliders
  setInputValue('ageSlider', data.age, 'ageVal', ' yrs');
  setInputValue('usageSlider', data.avg_daily_usage_hours, 'usageVal', ' hrs/day');
  setInputValue('unlocksSlider', data.daily_unlocks, 'unlocksVal', ' unlocks');
  setInputValue('studySlider', data.study_hours, 'studyVal', ' hrs/day');
  setInputValue('physicalSlider', data.physical_activity_hours, 'physicalVal', ' hrs/day');
  setInputValue('sleepSlider', data.sleep_hours_per_night, 'sleepVal', ' hrs/night');

  // Radio button groups
  setRadioChecked('gender', data.gender);
  setRadioChecked('academic_level', data.academic_level);
  setRadioChecked('most_used_platform', data.most_used_platform);
  setRadioChecked('purpose_of_use', data.purpose_of_use);
  setRadioChecked('stress_level', data.stress_level);

  // Country select & pills
  const countrySelect = document.getElementById('countrySelect');
  if (countrySelect) {
    countrySelect.value = data.country;
    document.querySelectorAll('.country-pill').forEach(pill => {
      pill.classList.toggle('active', pill.getAttribute('data-country') === data.country);
    });
  }
}

function setInputValue(id, val, badgeId, unit) {
  const el = document.getElementById(id);
  const badge = document.getElementById(badgeId);
  if (el) {
    el.value = val;
    el.dispatchEvent(new Event('input'));
  }
  if (badge) {
    badge.textContent = val + unit;
  }
}

function setRadioChecked(name, val) {
  const radio = document.querySelector(`input[name="${name}"][value="${val}"]`);
  if (radio) {
    radio.checked = true;
  }
}

/**
 * Ping backend health
 */
async function checkBackendHealth() {
  const statusEl = document.getElementById('apiStatus');
  const statusText = document.getElementById('statusText');
  if (!statusEl || !statusText) return;

  try {
    const res = await fetch(`${API_BASE}/api/greet`, { method: 'GET' });
    if (res.ok) {
      statusEl.classList.remove('offline');
      statusText.textContent = 'API Connected';
    } else {
      throw new Error('Non-200');
    }
  } catch (err) {
    // Try pinging docs or base
    try {
      const resDocs = await fetch(`${API_BASE}/docs`, { method: 'HEAD', mode: 'no-cors' });
      statusEl.classList.remove('offline');
      statusText.textContent = 'API Live';
    } catch (e) {
      statusEl.classList.add('offline');
      statusText.textContent = 'Backend Offline';
    }
  }
}

/**
 * Collect form values into StudentData model
 */
function collectFormData() {
  const getRadio = (name) => {
    const checked = document.querySelector(`input[name="${name}"]:checked`);
    return checked ? checked.value : null;
  };

  return {
    age                     : parseInt(document.getElementById('ageSlider').value, 10),
    gender                  : getRadio('gender') || 'Female',
    country                 : document.getElementById('countrySelect').value || 'India',
    academic_level          : getRadio('academic_level') || 'Undergraduate',
    most_used_platform      : getRadio('most_used_platform') || 'Instagram',
    purpose_of_use          : getRadio('purpose_of_use') || 'Entertainment',
    avg_daily_usage_hours   : parseFloat(document.getElementById('usageSlider').value),
    daily_unlocks           : parseInt(document.getElementById('unlocksSlider').value, 10),
    study_hours             : parseFloat(document.getElementById('studySlider').value),
    physical_activity_hours : parseFloat(document.getElementById('physicalSlider').value),
    sleep_hours_per_night   : parseFloat(document.getElementById('sleepSlider').value),
    stress_level            : getRadio('stress_level') || 'Medium'
  };
}

/**
 * Handle form submit
 */
function setupFormSubmission() {
  const form = document.getElementById('predictionForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    executePrediction();
  });
}

let lastPredictionScore = null;

async function executePrediction() {
  const btn = document.getElementById('predictBtn');
  const payload = collectFormData();

  if (btn) btn.classList.add('loading');

  try {
    const response = await fetch(`${API_BASE}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorDetail = await response.text();
      throw new Error(`Server returned ${response.status}: ${errorDetail}`);
    }

    const data = await response.json();
    const score = data.predicted_mental_health_score;
    lastPredictionScore = score;
    renderResults(score, payload);
    
  } catch (err) {
    console.error('Prediction request error:', err);
    showToast('Failed to connect to backend: ' + err.message);
  } finally {
    if (btn) btn.classList.remove('loading');
  }
}

/**
 * Render Results: Gauge, Badges, Metrics breakdown, and AI insights
 */
function renderResults(score, payload) {
  const scoreNum = document.getElementById('scoreNumber');
  const scoreBadge = document.getElementById('scoreBadge');
  const gaugeFill = document.getElementById('gaugeFill');
  const gradientStart = document.getElementById('gradientStart');
  const gradientEnd = document.getElementById('gradientEnd');

  // Gauge calculation (circumference = 2 * PI * 90 = 565.48)
  const circumference = 565.48;
  const clampedScore = Math.min(Math.max(score, 0), 10);
  const targetOffset = circumference - (clampedScore / 10) * circumference;

  if (gaugeFill) {
    gaugeFill.style.strokeDashoffset = targetOffset;
  }

  // Animate score roll-up
  animateScoreCounter(scoreNum, score);

  // Status tiers
  let statusText = '';
  let statusClass = '';
  let colorStart = '#10b981';
  let colorEnd = '#06b6d4';

  if (score >= 7.8) {
    statusText = 'Flourishing Mental Health';
    statusClass = 'flourishing';
    colorStart = '#10b981';
    colorEnd = '#34d399';
  } else if (score >= 6.5) {
    statusText = 'Healthy Equilibrium';
    statusClass = 'moderate';
    colorStart = '#06b6d4';
    colorEnd = '#3b82f6';
  } else if (score >= 5.2) {
    statusText = 'Moderate Digital Strain';
    statusClass = 'at-risk';
    colorStart = '#f59e0b';
    colorEnd = '#f97316';
  } else {
    statusText = 'Severe Digital Burnout Risk';
    statusClass = 'severe';
    colorStart = '#f43f5e';
    colorEnd = '#e11d48';
  }

  if (scoreBadge) {
    scoreBadge.className = `score-badge ${statusClass}`;
    scoreBadge.innerHTML = `<span class="badge-dot" style="background:${colorStart}; width:8px; height:8px; border-radius:50%; box-shadow:0 0 8px ${colorStart}"></span> ${statusText}`;
  }

  if (gradientStart && gradientEnd) {
    gradientStart.setAttribute('stop-color', colorStart);
    gradientEnd.setAttribute('stop-color', colorEnd);
  }

  // Calculate Breakdown Bars
  updateBreakdownMetrics(payload);

  // Generate dynamic contextual insights
  generateInsights(score, payload);
}

/**
 * Smooth roll-up animation for score counter
 */
function animateScoreCounter(el, targetScore) {
  if (!el) return;
  const duration = 1200;
  const startTime = performance.now();
  const startVal = 0;

  function updateCount(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const ease = 1 - Math.pow(1 - progress, 3);
    const currentVal = (startVal + (targetScore - startVal) * ease).toFixed(2);
    el.textContent = currentVal;

    if (progress < 1) {
      requestAnimationFrame(updateCount);
    } else {
      el.textContent = targetScore.toFixed(2);
    }
  }

  requestAnimationFrame(updateCount);
}

/**
 * Compute breakdown indices
 */
function updateBreakdownMetrics(data) {
  // 1. Digital vs Sleep balance (ideal is high sleep, low usage)
  const totalSleepUsage = (data.sleep_hours_per_night + data.avg_daily_usage_hours) || 1;
  const sleepRatio = Math.round((data.sleep_hours_per_night / totalSleepUsage) * 100);
  setMetricBar('sleepRatioBar', 'sleepRatioVal', sleepRatio, `${sleepRatio}% Sleep Dominant`);

  // 2. Physical Activity Factor (target >= 1.5 hrs/day)
  const fitnessScore = Math.min(Math.round((data.physical_activity_hours / 2.0) * 100), 100);
  setMetricBar('activityRatioBar', 'activityRatioVal', fitnessScore, `${fitnessScore}% Active Target`);

  // 3. Screen Checking Intensity (based on unlocks + hours)
  const screenLoad = Math.min(Math.round(((data.daily_unlocks / 100) * 50) + ((data.avg_daily_usage_hours / 8) * 50)), 100);
  setMetricBar('screenLoadBar', 'screenLoadVal', screenLoad, `${screenLoad}% Load Index`);
}

function setMetricBar(barId, valId, pct, text) {
  const bar = document.getElementById(barId);
  const label = document.getElementById(valId);
  if (bar) bar.style.width = `${pct}%`;
  if (label) label.textContent = text;
}

/**
 * Generate Tailored Contextual AI Insights based on student data
 */
function generateInsights(score, data) {
  const container = document.getElementById('insightsContent');
  if (!container) return;

  const tips = [];

  // Screen time vs Sleep analysis
  if (data.avg_daily_usage_hours > data.sleep_hours_per_night) {
    tips.push(`📱 <strong>High Screen Displacement:</strong> Daily screen time (${data.avg_daily_usage_hours}h) surpasses sleep (${data.sleep_hours_per_night}h). Reducing nighttime social use by 1.5 hours could significantly elevate restorative sleep.`);
  } else if (data.sleep_hours_per_night >= 7.5) {
    tips.push(`🌙 <strong>Great Sleep Anchor:</strong> Consistently achieving ${data.sleep_hours_per_night}h of sleep acts as a major protective buffer against cognitive burnout.`);
  }

  // Unlocks & dopamine checking
  if (data.daily_unlocks >= 90) {
    tips.push(`🔔 <strong>Frequent Screen Unlocks:</strong> ${data.daily_unlocks} unlocks/day indicates frequent task fragmentation. Consider batching phone checks into dedicated 15-minute intervals.`);
  }

  // Physical activity
  if (data.physical_activity_hours < 0.5) {
    tips.push(`🏃 <strong>Sedentary Alert:</strong> Physical activity is under 30 mins/day. Incorporating a brisk 20-minute daily walk can rapidly counter academic anxiety.`);
  } else if (data.physical_activity_hours >= 1.5) {
    tips.push(`⚡ <strong>Strong Activity Balance:</strong> Your ${data.physical_activity_hours}h daily exercise directly fuels neuroplasticity and stress resilience.`);
  }

  // Stress level context
  if (data.stress_level === 'Very High' || data.stress_level === 'High') {
    tips.push(`🧘 <strong>Stress Mitigation Priority:</strong> Elevated academic stress combined with ${data.most_used_platform} usage may reinforce comparison fatigue. Prioritize deep rest.`);
  }

  if (tips.length === 0) {
    tips.push(`✨ <strong>Harmonious Routine:</strong> Your digital engagement, study habits, and sleep schedules are well-proportioned for balanced academic performance.`);
  }

  container.innerHTML = tips.map(t => `<p class="insights-text" style="margin-bottom:8px;">${t}</p>`).join('');
}

/**
 * Copy Health Report to clipboard
 */
function setupCopyButton() {
  const copyBtn = document.getElementById('copyBtn');
  if (!copyBtn) return;

  copyBtn.addEventListener('click', () => {
    if (lastPredictionScore === null) {
      showToast('Please run a prediction first!');
      return;
    }

    const payload = collectFormData();
    const summary = `MindPulse AI - Student Mental Health Assessment
===================================================
Predicted Mental Health Score: ${lastPredictionScore} / 10.00
Demographics: ${payload.age}yo ${payload.gender}, ${payload.academic_level} in ${payload.country}
Primary Social Platform: ${payload.most_used_platform} (${payload.avg_daily_usage_hours}h/day, ${payload.daily_unlocks} unlocks)
Lifestyle: ${payload.study_hours}h study, ${payload.physical_activity_hours}h exercise, ${payload.sleep_hours_per_night}h sleep
Stress Level: ${payload.stress_level}
Evaluated via Machine Learning Pipeline.`;

    navigator.clipboard.writeText(summary)
      .then(() => showToast('Assessment report copied to clipboard!'))
      .catch(() => showToast('Failed to copy to clipboard'));
  });
}

/**
 * Toast Notification Helper
 */
function showToast(message) {
  let toast = document.getElementById('toastNotice');
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3200);
}

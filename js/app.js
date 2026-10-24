/**
 * Lógica Principal do Aplicativo de Clima / Tempo
 * Integração de Dados, Efeitos Ambientais e Interface de Usuário
 */

// Estado Global da Aplicação
const AppState = {
  currentCity: null,
  weatherData: null,
  airQualityData: null,
  unit: localStorage.getItem('aura_weather_unit') || 'celsius',
  favorites: JSON.parse(localStorage.getItem('aura_weather_favorites') || '[]'),
  searchTimeout: null,
  activeAmbientEffect: null,
  hourlyViewMode: 'cards' // 'cards' ou 'chart'
};

// Cidades padrão recomendadas (caso não haja favoritos salvos)
const DEFAULT_FAVORITES = [
  { name: 'São Paulo', state: 'São Paulo', country: 'Brasil', flag: '🇧🇷', latitude: -23.5475, longitude: -46.6361, timezone: 'America/Sao_Paulo' },
  { name: 'Rio de Janeiro', state: 'Rio de Janeiro', country: 'Brasil', flag: '🇧🇷', latitude: -22.9064, longitude: -43.1822, timezone: 'America/Sao_Paulo' },
  { name: 'Brasília', state: 'Distrito Federal', country: 'Brasil', flag: '🇧🇷', latitude: -15.7797, longitude: -47.9297, timezone: 'America/Sao_Paulo' },
  { name: 'Lisboa', state: 'Lisboa', country: 'Portugal', flag: '🇵🇹', latitude: 38.7167, longitude: -9.139, timezone: 'Europe/Lisbon' }
];

if (AppState.favorites.length === 0) {
  AppState.favorites = [...DEFAULT_FAVORITES];
  localStorage.setItem('aura_weather_favorites', JSON.stringify(AppState.favorites));
}

/* ==========================================================================
   Motor de Partículas Ambientais (Canvas)
   ========================================================================== */
const AmbientEngine = {
  canvas: null,
  ctx: null,
  particles: [],
  animationId: null,
  currentMode: 'clear',

  init() {
    this.canvas = document.getElementById('ambient-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', () => this.resize());
  },

  resize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.createParticles(this.currentMode);
  },

  setMode(mode, isDay = 1) {
    if (this.currentMode === mode && this.isDay === isDay) return;
    this.currentMode = mode;
    this.isDay = isDay;
    this.createParticles(mode);
    if (!this.animationId) {
      this.loop();
    }
  },

  createParticles(mode) {
    this.particles = [];
    const count = mode === 'rain' ? 85 : mode === 'snow' ? 50 : mode === 'storm' ? 100 : mode === 'clear' && !this.isDay ? 60 : 30;

    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: mode === 'rain' || mode === 'storm' ? Math.random() * 2 + 1 : Math.random() * 3 + 1,
        speedX: mode === 'rain' || mode === 'storm' ? (Math.random() - 0.5) * 1.5 : (Math.random() - 0.5) * 0.4,
        speedY: mode === 'rain' ? Math.random() * 8 + 7 : mode === 'storm' ? Math.random() * 12 + 10 : mode === 'snow' ? Math.random() * 1.5 + 0.5 : (Math.random() - 0.5) * 0.3,
        length: mode === 'rain' || mode === 'storm' ? Math.random() * 18 + 12 : 0,
        opacity: Math.random() * 0.6 + 0.2,
        twinkleSpeed: Math.random() * 0.03 + 0.01
      });
    }
  },

  loop() {
    if (!this.ctx || !this.canvas) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const mode = this.currentMode;

    for (let p of this.particles) {
      if (mode === 'rain' || mode === 'storm') {
        this.ctx.strokeStyle = `rgba(186, 230, 253, ${p.opacity * 0.7})`;
        this.ctx.lineWidth = p.size;
        this.ctx.beginPath();
        this.ctx.moveTo(p.x, p.y);
        this.ctx.lineTo(p.x + p.speedX * 2, p.y + p.length);
        this.ctx.stroke();

        p.y += p.speedY;
        p.x += p.speedX;

        if (p.y > this.canvas.height) {
          p.y = -20;
          p.x = Math.random() * this.canvas.width;
        }
      } else if (mode === 'snow') {
        this.ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fill();

        p.y += p.speedY;
        p.x += Math.sin(p.y * 0.02) * 0.8;

        if (p.y > this.canvas.height) {
          p.y = -10;
          p.x = Math.random() * this.canvas.width;
        }
      } else {
        // Estrelas ou poeira solar flutuante
        p.opacity += Math.sin(Date.now() * p.twinkleSpeed) * 0.01;
        p.opacity = Math.max(0.1, Math.min(0.8, p.opacity));

        const color = (!this.isDay) ? `rgba(224, 231, 255, ${p.opacity})` : `rgba(254, 240, 138, ${p.opacity * 0.4})`;
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fill();

        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < 0) p.x = this.canvas.width;
        if (p.x > this.canvas.width) p.x = 0;
        if (p.y < 0) p.y = this.canvas.height;
        if (p.y > this.canvas.height) p.y = 0;
      }
    }

    this.animationId = requestAnimationFrame(() => this.loop());
  }
};

/* ==========================================================================
   Inicialização e Eventos da Interface
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  AmbientEngine.init();
  setupEventListeners();
  updateUnitToggleUI();
  renderFavoritesBar();
  loadInitialLocation();
  registerServiceWorker();
});

/**
 * Registra ouvintes de evento para busca, botões, modais e favoritos
 */
function setupEventListeners() {
  const searchInput = document.getElementById('search-input');
  const searchResults = document.getElementById('search-results');
  const geoBtn = document.getElementById('btn-geolocation');
  const unitBtn = document.getElementById('btn-unit-toggle');
  const favBtn = document.getElementById('btn-toggle-favorite');
  const btnViewCards = document.getElementById('btn-view-cards');
  const btnViewChart = document.getElementById('btn-view-chart');
  const dayModal = document.getElementById('day-modal');
  const btnCloseModal = document.getElementById('btn-close-modal');

  // Alternador de Visualização Horária (Cards vs Gráfico)
  if (btnViewCards && btnViewChart) {
    btnViewCards.addEventListener('click', () => {
      setHourlyViewMode('cards');
    });
    btnViewChart.addEventListener('click', () => {
      setHourlyViewMode('chart');
    });
  }

  // Fechamento de Modal de Detalhes
  if (btnCloseModal && dayModal) {
    btnCloseModal.addEventListener('click', () => {
      closeDayModal();
    });

    dayModal.addEventListener('click', (e) => {
      if (e.target === dayModal) {
        closeDayModal();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && dayModal.classList.contains('active')) {
        closeDayModal();
      }
    });
  }

  // Busca em tempo real com debounce
  searchInput.addEventListener('input', (e) => {
    clearTimeout(AppState.searchTimeout);
    const query = e.target.value;

    if (query.trim().length < 2) {
      searchResults.classList.add('hidden');
      searchResults.innerHTML = '';
      return;
    }

    AppState.searchTimeout = setTimeout(async () => {
      searchResults.innerHTML = `
        <div class="p-3 text-center text-sm text-slate-400 flex items-center justify-center gap-2">
          <i data-lucide="loader-2" class="w-4 h-4 animate-spin text-sky-400"></i>
          <span>Buscando cidades...</span>
        </div>
      `;
      searchResults.classList.remove('hidden');
      lucide.createIcons();

      const cities = await API.searchCities(query);
      renderSearchResults(cities);
    }, 280);
  });

  // Fecha busca ao clicar fora
  document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
      searchResults.classList.add('hidden');
    }
  });

  // Botão de Geolocalização (GPS)
  geoBtn.addEventListener('click', () => {
    getUserLocation();
  });

  // Alternador de Unidade (°C / °F)
  unitBtn.addEventListener('click', () => {
    AppState.unit = AppState.unit === 'celsius' ? 'fahrenheit' : 'celsius';
    localStorage.setItem('aura_weather_unit', AppState.unit);
    updateUnitToggleUI();
    if (AppState.currentCity) {
      loadCityWeather(AppState.currentCity);
    }
  });

  // Botão de Favoritar/Desfavoritar cidade atual
  favBtn.addEventListener('click', () => {
    if (!AppState.currentCity) return;
    toggleFavorite(AppState.currentCity);
  });
}

function setHourlyViewMode(mode) {
  AppState.hourlyViewMode = mode;
  const btnCards = document.getElementById('btn-view-cards');
  const btnChart = document.getElementById('btn-view-chart');
  const cardsList = document.getElementById('hourly-forecast-list');
  const chartView = document.getElementById('hourly-chart-view');

  if (mode === 'cards') {
    btnCards?.classList.add('active');
    btnChart?.classList.remove('active');
    cardsList?.classList.remove('hidden');
    chartView?.classList.add('hidden');
  } else {
    btnChart?.classList.add('active');
    btnCards?.classList.remove('active');
    cardsList?.classList.add('hidden');
    chartView?.classList.remove('hidden');
  }
}

function closeDayModal() {
  const dayModal = document.getElementById('day-modal');
  if (dayModal) {
    dayModal.classList.remove('active');
  }
}

/**
 * Carrega a localização inicial (tenta IP ou cidade padrão)
 */
async function loadInitialLocation() {
  showLoadingState(true);
  try {
    // Tenta primeiro localização aproximada por IP
    const city = await API.getIPLocation();
    await loadCityWeather(city);
  } catch (err) {
    console.error('Falha ao carregar localização inicial:', err);
    // Fallback garantido para São Paulo
    await loadCityWeather(DEFAULT_FAVORITES[0]);
  } finally {
    showLoadingState(false);
  }
}

/**
 * Carrega os dados de clima de uma cidade específica
 */
async function loadCityWeather(city) {
  showLoadingState(true);
  try {
    AppState.currentCity = city;

    // Busca previsão e qualidade do ar em paralelo
    const [weatherData, airQualityData] = await Promise.all([
      API.getForecast(city.latitude, city.longitude, city.timezone, AppState.unit),
      API.getAirQuality(city.latitude, city.longitude)
    ]);

    AppState.weatherData = weatherData;
    AppState.airQualityData = airQualityData;

    renderWeatherData();
    updateFavoriteButtonUI();
  } catch (err) {
    console.error('Erro ao obter clima:', err);
    showToast('Não foi possível carregar os dados meteorológicos. Verifique sua conexão.');
  } finally {
    showLoadingState(false);
  }
}

/**
 * Obtém localização via GPS do navegador
 */
function getUserLocation() {
  if (!navigator.geolocation) {
    showToast('Geolocalização não é suportada pelo seu navegador.');
    return;
  }

  showToast('Obtendo sua localização...');
  const geoIcon = document.querySelector('#btn-geolocation i');
  if (geoIcon) geoIcon.classList.add('animate-spin');

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        const city = await API.reverseGeocode(latitude, longitude);
        await loadCityWeather(city);
        showToast(`Localizado: ${city.name}!`);
      } catch (err) {
        showToast('Erro ao identificar sua cidade.');
      } finally {
        if (geoIcon) geoIcon.classList.remove('animate-spin');
      }
    },
    (error) => {
      if (geoIcon) geoIcon.classList.remove('animate-spin');
      if (error.code === error.PERMISSION_DENIED) {
        showToast('Permissão de GPS negada. Usando localização estimada.');
      } else {
        showToast('Sinal de GPS indisponível.');
      }
    },
    { timeout: 10000, enableHighAccuracy: true }
  );
}

/* ==========================================================================
   Renderização dos Dados na UI
   ========================================================================== */

function renderWeatherData() {
  if (!AppState.weatherData || !AppState.currentCity) return;

  const { current, hourly, daily } = AppState.weatherData;
  const isDay = current.is_day;
  const weatherInfo = getWeatherInfo(current.weather_code, isDay);
  const unitSymbol = AppState.unit === 'celsius' ? '°C' : '°F';
  const windUnit = 'km/h';

  // 1. Atualiza Tema de Fundo e Efeito de Partículas
  const ambientLayer = document.getElementById('ambient-bg');
  if (ambientLayer) {
    ambientLayer.className = `bg-ambient-layer ${weatherInfo.theme}`;
  }
  AmbientEngine.setMode(weatherInfo.ambient, isDay);

  // 2. Banner de Alerta Meteorológico Inteligente
  renderAlertBanner(current, daily);

  // 3. Card Principal de Clima (Hero)
  document.getElementById('city-name').textContent = AppState.currentCity.name;
  
  const subtextParts = [];
  if (AppState.currentCity.state) subtextParts.push(AppState.currentCity.state);
  if (AppState.currentCity.country) subtextParts.push(AppState.currentCity.country);
  document.getElementById('city-location').textContent = `${AppState.currentCity.flag || ''} ${subtextParts.join(', ')}`;

  // Horário e Data local
  updateDateTimeDisplay(AppState.currentCity.timezone);

  // Temperatura Atual e Sensação
  document.getElementById('current-temp').textContent = `${Math.round(current.temperature_2m)}°`;
  document.getElementById('weather-condition').textContent = weatherInfo.label;
  document.getElementById('apparent-temp').textContent = `${Math.round(current.apparent_temperature)}°`;

  // Mínima e Máxima do dia de hoje
  if (daily && daily.temperature_2m_max && daily.temperature_2m_min) {
    document.getElementById('temp-max').textContent = `${Math.round(daily.temperature_2m_max[0])}°`;
    document.getElementById('temp-min').textContent = `${Math.round(daily.temperature_2m_min[0])}°`;
  }

  // Ícone Principal de Clima
  const heroIconContainer = document.getElementById('hero-weather-icon');
  const glowClass = isDay ? 'sun-glow text-amber-300' : 'moon-glow text-indigo-300';
  heroIconContainer.innerHTML = `<i data-lucide="${weatherInfo.icon}" class="w-24 h-24 sm:w-28 sm:h-28 ${glowClass} animate-float"></i>`;

  // 4. Métricas Detalhadas (Cards Secundários)
  renderDetailCards(current, daily, AppState.airQualityData, unitSymbol, windUnit);

  // 5. Previsão Horária (Cards e Gráfico)
  renderHourlyForecast(hourly, AppState.currentCity.timezone);
  renderHourlyChart(hourly, AppState.currentCity.timezone, unitSymbol);

  // 6. Previsão dos Próximos 7 Dias
  renderDailyForecast(daily);

  // Atualiza todos os ícones Lucide criados dinamicamente
  lucide.createIcons();
}

/**
 * Renderiza o banner dinâmico de alertas meteorológicos
 */
function renderAlertBanner(current, daily) {
  const alert = checkWeatherAlert(current, daily);
  const banner = document.getElementById('weather-alert-banner');
  if (!banner) return;

  if (!alert) {
    banner.classList.add('hidden');
    return;
  }

  banner.className = `alert-banner alert-${alert.type} p-4 flex items-center gap-3.5 animate-pulse-subtle`;
  const iconWrap = document.getElementById('alert-icon-wrap');
  if (iconWrap) {
    const iconColors = {
      danger: 'bg-rose-500/20 text-rose-300 border border-rose-500/30',
      warning: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
      info: 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
    };
    iconWrap.className = `w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconColors[alert.type] || iconColors.warning}`;
    iconWrap.innerHTML = `<i data-lucide="${alert.icon || 'alert-triangle'}" class="w-5 h-5"></i>`;
  }

  document.getElementById('alert-title').textContent = alert.title;
  document.getElementById('alert-message').textContent = alert.message;
  banner.classList.remove('hidden');
}

/**
 * Renderiza os cards de detalhes secundários (Vento, Umidade, UV, Visibilidade, Fase da Lua, etc.)
 */
function renderDetailCards(current, daily, airQuality, unitSymbol, windUnit) {
  // Vento
  const windDir = getWindDirection(current.wind_direction_10m);
  document.getElementById('wind-speed').textContent = `${Math.round(current.wind_speed_10m)} ${windUnit}`;
  document.getElementById('wind-dir-text').textContent = `Direção ${windDir} (${current.wind_direction_10m}°)`;
  const compassArrow = document.getElementById('compass-needle');
  if (compassArrow) {
    compassArrow.style.transform = `rotate(${current.wind_direction_10m}deg)`;
  }

  // Umidade
  document.getElementById('humidity-val').textContent = `${current.relative_humidity_2m}%`;
  const humidityBar = document.getElementById('humidity-bar');
  if (humidityBar) {
    humidityBar.style.width = `${Math.min(100, current.relative_humidity_2m)}%`;
  }
  let humidityDesc = 'Confortável';
  if (current.relative_humidity_2m < 30) humidityDesc = 'Ar seco (beba água)';
  else if (current.relative_humidity_2m > 75) humidityDesc = 'Alta umidade no ar';
  document.getElementById('humidity-desc').textContent = humidityDesc;

  // Índice UV
  const uvVal = current.uv_index !== undefined ? current.uv_index : (daily?.uv_index_max?.[0] ?? 0);
  const uvInfo = getUVInfo(uvVal);
  document.getElementById('uv-val').textContent = Math.round(uvVal);
  const uvBadge = document.getElementById('uv-badge');
  if (uvBadge) {
    uvBadge.textContent = uvInfo.label;
    uvBadge.className = `text-xs px-2.5 py-0.5 rounded-full font-semibold border ${uvInfo.bg} ${uvInfo.color} ${uvInfo.border}`;
  }
  document.getElementById('uv-desc').textContent = uvInfo.text;

  // Qualidade do Ar
  const aqiVal = airQuality?.european_aqi ?? null;
  const aqiInfo = getAQIInfo(aqiVal);
  document.getElementById('aqi-val').textContent = aqiVal !== null ? aqiVal : '--';
  const aqiBadge = document.getElementById('aqi-badge');
  if (aqiBadge) {
    aqiBadge.textContent = aqiInfo.label;
    aqiBadge.className = `text-xs px-2.5 py-0.5 rounded-full font-semibold border ${aqiInfo.bg} ${aqiInfo.color} ${aqiInfo.border}`;
  }
  document.getElementById('aqi-desc').textContent = aqiInfo.text;

  // Pressão Atmosférica
  document.getElementById('pressure-val').textContent = `${Math.round(current.surface_pressure || 1013)} hPa`;

  // Probabilidade de Chuva
  const rainChance = daily?.precipitation_probability_max?.[0] ?? 0;
  document.getElementById('rain-chance-val').textContent = `${rainChance}%`;
  const rainBar = document.getElementById('rain-chance-bar');
  if (rainBar) {
    rainBar.style.width = `${rainChance}%`;
  }

  // Visibilidade & Ponto de Orvalho
  const visInfo = getVisibilityInfo(current.visibility);
  const dewInfo = getDewPointInfo(current.dew_point_2m);
  const visEl = document.getElementById('visibility-val');
  if (visEl) visEl.textContent = visInfo.value;
  const dewEl = document.getElementById('dewpoint-val');
  if (dewEl) dewEl.textContent = `Orvalho: ${Math.round(current.dew_point_2m || 0)}° • ${visInfo.label}`;

  // Ciclo Lunar (Fase da Lua)
  const moon = getMoonPhase(new Date());
  const moonNameEl = document.getElementById('moon-phase-name');
  if (moonNameEl) moonNameEl.textContent = moon.name;
  const moonIllumEl = document.getElementById('moon-illumination');
  if (moonIllumEl) moonIllumEl.textContent = `${moon.illumination}% iluminada`;
  const moonIconEl = document.getElementById('moon-phase-icon');
  if (moonIconEl) {
    moonIconEl.innerHTML = `<i data-lucide="${moon.icon}" class="w-4 h-4 text-indigo-300"></i>`;
  }

  // Nascer e Pôr do Sol
  if (daily?.sunrise?.[0] && daily?.sunset?.[0]) {
    const sunriseTime = formatShortTime(daily.sunrise[0]);
    const sunsetTime = formatShortTime(daily.sunset[0]);
    document.getElementById('sunrise-time').textContent = sunriseTime;
    document.getElementById('sunset-time').textContent = sunsetTime;
  }
}

/**
 * Renderiza a previsão horária (24 horas a partir da hora atual)
 */
function renderHourlyForecast(hourly, timezone) {
  const container = document.getElementById('hourly-forecast-list');
  if (!container || !hourly || !hourly.time) return;

  container.innerHTML = '';

  const now = new Date();
  const currentHourISO = now.toISOString().slice(0, 13); // 'YYYY-MM-DDTHH'

  // Encontra o índice da hora atual ou mais próxima
  let startIndex = hourly.time.findIndex(t => t.startsWith(currentHourISO));
  if (startIndex === -1) startIndex = 0;

  // Pega as próximas 24 horas
  const hoursToShow = 24;
  const endIndex = Math.min(hourly.time.length, startIndex + hoursToShow);

  for (let i = startIndex; i < endIndex; i++) {
    const timeStr = hourly.time[i];
    const hourDate = new Date(timeStr);
    const hourNumber = hourDate.getHours();
    const isDayTime = hourNumber >= 6 && hourNumber < 18 ? 1 : 0;
    const weatherInfo = getWeatherInfo(hourly.weather_code[i], isDayTime);
    const temp = Math.round(hourly.temperature_2m[i]);
    const rainProb = hourly.precipitation_probability ? hourly.precipitation_probability[i] : 0;

    const isCurrent = i === startIndex;
    const label = isCurrent ? 'Agora' : `${String(hourNumber).padStart(2, '0')}:00`;

    const card = document.createElement('div');
    card.className = `flex-shrink-0 flex flex-col items-center justify-between p-3.5 rounded-2xl transition-all duration-200 ${
      isCurrent ? 'bg-sky-500/20 border border-sky-400/40 shadow-lg shadow-sky-500/10' : 'bg-white/[0.03] border border-white/5 hover:bg-white/[0.07]'
    } w-[84px] text-center snap-start`;

    card.innerHTML = `
      <span class="text-xs font-medium ${isCurrent ? 'text-sky-300 font-bold' : 'text-slate-400'}">${label}</span>
      <div class="my-2.5 flex items-center justify-center">
        <i data-lucide="${weatherInfo.icon}" class="w-7 h-7 ${isDayTime ? 'text-amber-300' : 'text-indigo-300'}"></i>
      </div>
      <span class="text-base font-bold text-white">${temp}°</span>
      <div class="mt-1 h-4 flex items-center justify-center">
        ${rainProb > 0 ? `
          <span class="flex items-center gap-0.5 text-[10px] text-sky-400 font-medium">
            <i data-lucide="droplet" class="w-2.5 h-2.5"></i>
            ${rainProb}%
          </span>
        ` : '<span class="text-[10px] text-transparent select-none">-</span>'}
      </div>
    `;

    container.appendChild(card);
  }
}

/**
 * Renderiza a previsão dos próximos 7 dias com suporte a clique e modal de detalhes
 */
function renderDailyForecast(daily) {
  const container = document.getElementById('daily-forecast-list');
  if (!container || !daily || !daily.time) return;

  container.innerHTML = '';

  // Calcula min global e max global dos 7 dias para a barra relativa de temperatura
  const globalMin = Math.min(...daily.temperature_2m_min);
  const globalMax = Math.max(...daily.temperature_2m_max);
  const tempRange = Math.max(1, globalMax - globalMin);

  const daysCount = Math.min(7, daily.time.length);
  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  for (let i = 0; i < daysCount; i++) {
    const date = new Date(daily.time[i] + 'T00:00:00');
    const dayName = i === 0 ? 'Hoje' : i === 1 ? 'Amanhã' : dayNames[date.getDay()];
    const dateFormatted = `${date.getDate()} ${date.toLocaleString('pt-BR', { month: 'short' }).replace('.', '')}`;
    
    const weatherInfo = getWeatherInfo(daily.weather_code[i], 1);
    const minTemp = Math.round(daily.temperature_2m_min[i]);
    const maxTemp = Math.round(daily.temperature_2m_max[i]);
    const rainProb = daily.precipitation_probability_max ? daily.precipitation_probability_max[i] : 0;

    // Cálculo da barra de calor proporcional
    const leftPercent = Math.max(0, Math.min(100, ((minTemp - globalMin) / tempRange) * 100));
    const widthPercent = Math.max(15, Math.min(100 - leftPercent, ((maxTemp - minTemp) / tempRange) * 100));

    const row = document.createElement('div');
    row.className = 'cursor-pointer flex items-center justify-between py-3 px-3.5 rounded-xl transition-all hover:bg-white/[0.08] hover:translate-x-1 border-b border-white/[0.04] last:border-0 group select-none';
    row.title = 'Clique para ver detalhes do dia';

    row.innerHTML = `
      <div class="w-24 sm:w-28 flex flex-col">
        <span class="text-sm font-semibold text-white group-hover:text-sky-300 transition-colors ${i === 0 ? 'text-sky-300' : ''}">${dayName}</span>
        <span class="text-xs text-slate-400 capitalize">${dateFormatted}</span>
      </div>

      <div class="flex items-center gap-2 w-32 sm:w-36">
        <i data-lucide="${weatherInfo.icon}" class="w-6 h-6 flex-shrink-0 text-amber-300"></i>
        <div class="flex flex-col">
          <span class="text-xs font-medium text-slate-200 truncate">${weatherInfo.label}</span>
          ${rainProb > 0 ? `
            <span class="text-[11px] text-sky-400 flex items-center gap-1 font-medium">
              <i data-lucide="droplet" class="w-2.5 h-2.5"></i>
              ${rainProb}%
            </span>
          ` : ''}
        </div>
      </div>

      <div class="flex items-center gap-3 flex-1 max-w-[200px] justify-end">
        <span class="text-xs font-medium text-slate-400 w-8 text-right">${minTemp}°</span>
        <div class="temp-bar-track flex-1 max-w-[90px]">
          <div class="temp-bar-fill" style="left: ${leftPercent}%; width: ${widthPercent}%;"></div>
        </div>
        <span class="text-xs font-bold text-white w-8">${maxTemp}°</span>
        <i data-lucide="chevron-right" class="w-3.5 h-3.5 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block"></i>
      </div>
    `;

    row.addEventListener('click', () => {
      openDayDetailsModal(i, daily);
    });

    container.appendChild(row);
  }
}

/**
 * Renderiza o gráfico SVG interativo da tendência de temperatura horária
 */
function renderHourlyChart(hourly, timezone, unitSymbol) {
  const container = document.getElementById('hourly-chart-view');
  if (!container || !hourly || !hourly.time) return;

  const now = new Date();
  const currentHourISO = now.toISOString().slice(0, 13);
  let startIndex = hourly.time.findIndex(t => t.startsWith(currentHourISO));
  if (startIndex === -1) startIndex = 0;

  const count = 24;
  const endIndex = Math.min(hourly.time.length, startIndex + count);
  const temps = [];
  const rainProbs = [];
  const hours = [];

  for (let i = startIndex; i < endIndex; i++) {
    temps.push(hourly.temperature_2m[i]);
    rainProbs.push(hourly.precipitation_probability ? hourly.precipitation_probability[i] : 0);
    const d = new Date(hourly.time[i]);
    hours.push(i === startIndex ? 'Agora' : `${String(d.getHours()).padStart(2, '0')}h`);
  }

  const minTemp = Math.floor(Math.min(...temps)) - 1;
  const maxTemp = Math.ceil(Math.max(...temps)) + 1;
  const tempRange = Math.max(2, maxTemp - minTemp);

  const svgWidth = 720;
  const svgHeight = 160;
  const paddingX = 28;
  const paddingY = 28;
  const chartWidth = svgWidth - paddingX * 2;
  const chartHeight = svgHeight - paddingY * 2 - 16;

  const points = temps.map((t, i) => {
    const x = paddingX + (i / (temps.length - 1)) * chartWidth;
    const y = paddingY + chartHeight - ((t - minTemp) / tempRange) * chartHeight;
    return { x, y, temp: Math.round(t), hour: hours[i], rain: rainProbs[i] };
  });

  // Caminho cúbico suave com interpolação Catmull-Rom / Bezier
  let pathD = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    pathD += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }

  const areaD = `${pathD} L ${points[points.length - 1].x.toFixed(1)} ${svgHeight - 20} L ${points[0].x.toFixed(1)} ${svgHeight - 20} Z`;

  let pointsSvg = '';
  let labelsSvg = '';
  let rainBarsSvg = '';

  points.forEach((pt, idx) => {
    const showLabel = idx === 0 || idx === points.length - 1 || idx % 3 === 0;

    pointsSvg += `
      <circle cx="${pt.x.toFixed(1)}" cy="${pt.y.toFixed(1)}" r="3.5" class="chart-point">
        <title>${pt.hour}: ${pt.temp}${unitSymbol} (Chuva: ${pt.rain}%)</title>
      </circle>
    `;

    if (showLabel) {
      labelsSvg += `
        <text x="${pt.x.toFixed(1)}" y="${(pt.y - 8).toFixed(1)}" fill="#f8fafc" font-size="10" font-weight="700" text-anchor="middle">${pt.temp}°</text>
        <text x="${pt.x.toFixed(1)}" y="${svgHeight - 4}" fill="#94a3b8" font-size="9" text-anchor="middle">${pt.hour}</text>
      `;
    }

    if (pt.rain > 0) {
      const barHeight = Math.min(26, Math.max(4, (pt.rain / 100) * 26));
      const barY = svgHeight - 20 - barHeight;
      rainBarsSvg += `
        <rect x="${(pt.x - 3).toFixed(1)}" y="${barY.toFixed(1)}" width="6" height="${barHeight.toFixed(1)}" rx="2" fill="rgba(56, 189, 248, 0.45)">
          <title>${pt.hour}: ${pt.rain}% chance de chuva</title>
        </rect>
      `;
    }
  });

  container.innerHTML = `
    <svg viewBox="0 0 ${svgWidth} ${svgHeight}" class="hourly-chart-svg w-full">
      <defs>
        <linearGradient id="chart-stroke-gradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#38bdf8" />
          <stop offset="60%" stop-color="#818cf8" />
          <stop offset="100%" stop-color="#f472b6" />
        </linearGradient>
        <linearGradient id="chart-area-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.45" />
          <stop offset="85%" stop-color="#38bdf8" stop-opacity="0.0" />
        </linearGradient>
      </defs>

      <!-- Linhas de Apoio -->
      <line x1="${paddingX}" y1="${paddingY}" x2="${svgWidth - paddingX}" y2="${paddingY}" stroke="rgba(255,255,255,0.06)" stroke-dasharray="3,3" />
      <line x1="${paddingX}" y1="${svgHeight - 20}" x2="${svgWidth - paddingX}" y2="${svgHeight - 20}" stroke="rgba(255,255,255,0.06)" />

      <!-- Barras de Chuva -->
      ${rainBarsSvg}

      <!-- Curva e Área -->
      <path d="${areaD}" class="chart-area" />
      <path d="${pathD}" class="chart-line" />

      <!-- Pontos e Rótulos -->
      ${pointsSvg}
      ${labelsSvg}
    </svg>
  `;
}

/**
 * Abre o Modal com os dados meteorológicos completos de um dia da semana
 */
function openDayDetailsModal(dayIndex, daily) {
  if (!daily || !daily.time || !daily.time[dayIndex]) return;

  const date = new Date(daily.time[dayIndex] + 'T00:00:00');
  const dayNames = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
  const dayTitle = dayIndex === 0 ? 'Hoje' : dayIndex === 1 ? 'Amanhã' : dayNames[date.getDay()];
  const formattedDate = date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });

  const weatherInfo = getWeatherInfo(daily.weather_code[dayIndex], 1);
  const minTemp = Math.round(daily.temperature_2m_min[dayIndex]);
  const maxTemp = Math.round(daily.temperature_2m_max[dayIndex]);
  const rainProb = daily.precipitation_probability_max ? daily.precipitation_probability_max[dayIndex] : 0;
  const uvMax = daily.uv_index_max ? Math.round(daily.uv_index_max[dayIndex]) : 0;
  const uvInfo = getUVInfo(uvMax);
  const windMax = daily.wind_speed_10m_max ? Math.round(daily.wind_speed_10m_max[dayIndex]) : '--';
  const gustsMax = daily.wind_gusts_10m_max ? Math.round(daily.wind_gusts_10m_max[dayIndex]) : '--';
  const sunrise = daily.sunrise ? formatShortTime(daily.sunrise[dayIndex]) : '--:--';
  const sunset = daily.sunset ? formatShortTime(daily.sunset[dayIndex]) : '--:--';

  document.getElementById('modal-day-title').textContent = dayTitle;
  document.getElementById('modal-day-date').innerHTML = `${formattedDate} • <span class="text-sky-300 font-medium">${weatherInfo.label}</span>`;
  document.getElementById('modal-weather-icon').innerHTML = `<i data-lucide="${weatherInfo.icon}" class="w-8 h-8 text-amber-300"></i>`;

  const grid = document.getElementById('modal-details-grid');
  grid.innerHTML = `
    <div class="glass-card p-3">
      <span class="text-xs text-slate-400 block font-medium">Temperaturas</span>
      <span class="text-base font-bold text-white mt-1 block">Mín ${minTemp}° / Máx ${maxTemp}°</span>
    </div>
    <div class="glass-card p-3">
      <span class="text-xs text-slate-400 block font-medium">Chuva</span>
      <span class="text-base font-bold text-sky-400 mt-1 block">${rainProb}% probabilidade</span>
    </div>
    <div class="glass-card p-3">
      <span class="text-xs text-slate-400 block font-medium">Índice UV Máximo</span>
      <span class="text-base font-bold ${uvInfo.color} mt-1 block">${uvMax} (${uvInfo.label})</span>
    </div>
    <div class="glass-card p-3">
      <span class="text-xs text-slate-400 block font-medium">Vento e Rajadas</span>
      <span class="text-base font-bold text-white mt-1 block">${windMax} km/h (raj. ${gustsMax})</span>
    </div>
    <div class="glass-card p-3">
      <span class="text-xs text-slate-400 block font-medium">Nascer do Sol</span>
      <span class="text-base font-bold text-amber-300 mt-1 block">${sunrise}</span>
    </div>
    <div class="glass-card p-3">
      <span class="text-xs text-slate-400 block font-medium">Pôr do Sol</span>
      <span class="text-base font-bold text-indigo-300 mt-1 block">${sunset}</span>
    </div>
  `;

  lucide.createIcons();
  document.getElementById('day-modal').classList.add('active');
}

/**
 * Registra o Service Worker para suporte a PWA e cache offline
 */
function registerServiceWorker() {
  if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('./sw.js').catch(err => {
      console.warn('Service worker em modo offline/local:', err);
    });
  }
}

/* ==========================================================================
   Barra de Favoritos e Busca
   ========================================================================== */

function renderFavoritesBar() {
  const container = document.getElementById('favorites-list');
  if (!container) return;

  container.innerHTML = '';

  AppState.favorites.forEach((fav) => {
    const isCurrent = AppState.currentCity && AppState.currentCity.name === fav.name;
    const btn = document.createElement('button');
    btn.className = `glass-pill px-3.5 py-1.5 text-xs font-medium flex items-center gap-1.5 transition-all ${
      isCurrent ? 'bg-sky-500/25 border-sky-400/50 text-sky-200 shadow-md shadow-sky-500/10' : 'text-slate-300 hover:text-white'
    }`;
    btn.innerHTML = `
      <span>${fav.flag || '📍'}</span>
      <span>${fav.name}</span>
    `;

    btn.addEventListener('click', () => {
      loadCityWeather(fav);
    });

    container.appendChild(btn);
  });
}

function toggleFavorite(city) {
  const index = AppState.favorites.findIndex(f => f.name.toLowerCase() === city.name.toLowerCase() && f.country === city.country);

  if (index >= 0) {
    AppState.favorites.splice(index, 1);
    showToast(`Removido dos favoritos: ${city.name}`);
  } else {
    AppState.favorites.push({
      name: city.name,
      state: city.state,
      country: city.country,
      flag: city.flag,
      latitude: city.latitude,
      longitude: city.longitude,
      timezone: city.timezone
    });
    showToast(`Adicionado aos favoritos: ${city.name}!`);
  }

  localStorage.setItem('aura_weather_favorites', JSON.stringify(AppState.favorites));
  renderFavoritesBar();
  updateFavoriteButtonUI();
}

function updateFavoriteButtonUI() {
  const favBtn = document.getElementById('btn-toggle-favorite');
  if (!favBtn || !AppState.currentCity) return;

  const isFav = AppState.favorites.some(f => f.name.toLowerCase() === AppState.currentCity.name.toLowerCase() && f.country === AppState.currentCity.country);
  
  if (isFav) {
    favBtn.classList.add('text-amber-400', 'bg-amber-500/15', 'border-amber-500/30');
    favBtn.classList.remove('text-slate-400');
    favBtn.innerHTML = `<i data-lucide="star" class="w-5 h-5 fill-amber-400"></i>`;
  } else {
    favBtn.classList.remove('text-amber-400', 'bg-amber-500/15', 'border-amber-500/30');
    favBtn.classList.add('text-slate-400');
    favBtn.innerHTML = `<i data-lucide="star" class="w-5 h-5"></i>`;
  }
  lucide.createIcons();
}

function renderSearchResults(cities) {
  const container = document.getElementById('search-results');
  if (!container) return;

  if (cities.length === 0) {
    container.innerHTML = `
      <div class="p-3 text-center text-sm text-slate-400">
        Nenhuma cidade encontrada
      </div>
    `;
    return;
  }

  container.innerHTML = '';
  cities.forEach(city => {
    const item = document.createElement('button');
    item.className = 'w-full text-left px-4 py-2.5 hover:bg-sky-500/15 flex items-center justify-between transition-colors border-b border-white/[0.04] last:border-0';
    
    const subtitle = [city.state, city.country].filter(Boolean).join(', ');

    item.innerHTML = `
      <div class="flex items-center gap-2.5">
        <span class="text-base">${city.flag}</span>
        <div>
          <span class="text-sm font-semibold text-white block">${city.name}</span>
          <span class="text-xs text-slate-400 block">${subtitle}</span>
        </div>
      </div>
      <i data-lucide="chevron-right" class="w-4 h-4 text-slate-500"></i>
    `;

    item.addEventListener('click', () => {
      container.classList.add('hidden');
      document.getElementById('search-input').value = '';
      loadCityWeather(city);
    });

    container.appendChild(item);
  });

  lucide.createIcons();
}

/* ==========================================================================
   Utilitários & Helpers
   ========================================================================== */

function updateUnitToggleUI() {
  const label = document.getElementById('unit-label');
  if (label) {
    label.textContent = AppState.unit === 'celsius' ? '°C' : '°F';
  }
}

function updateDateTimeDisplay(timezone) {
  const el = document.getElementById('current-date');
  if (!el) return;

  try {
    const options = {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: timezone || undefined
    };
    const formatter = new Intl.DateTimeFormat('pt-BR', options);
    const parts = formatter.format(new Date());
    el.textContent = parts.charAt(0).toUpperCase() + parts.slice(1);
  } catch (err) {
    el.textContent = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  }
}

function formatShortTime(isoTime) {
  try {
    const date = new Date(isoTime);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  } catch (err) {
    return '--:--';
  }
}

function showLoadingState(isLoading) {
  const heroCard = document.getElementById('hero-card');
  if (heroCard) {
    if (isLoading) {
      heroCard.classList.add('opacity-60', 'pointer-events-none');
    } else {
      heroCard.classList.remove('opacity-60', 'pointer-events-none');
    }
  }
}

let toastTimeout = null;
function showToast(message) {
  let toast = document.getElementById('app-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'app-toast';
    toast.className = 'fixed bottom-6 right-6 z-50 glass-card px-4 py-3 text-sm text-white shadow-2xl flex items-center gap-2.5 transition-all duration-300 transform translate-y-12 opacity-0 pointer-events-none';
    document.body.appendChild(toast);
  }

  clearTimeout(toastTimeout);
  toast.innerHTML = `
    <i data-lucide="info" class="w-4 h-4 text-sky-400 flex-shrink-0"></i>
    <span>${message}</span>
  `;
  lucide.createIcons();

  toast.classList.remove('translate-y-12', 'opacity-0', 'pointer-events-none');

  toastTimeout = setTimeout(() => {
    toast.classList.add('translate-y-12', 'opacity-0', 'pointer-events-none');
  }, 3500);
}

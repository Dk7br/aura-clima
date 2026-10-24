/**
 * Planejador de Rota, GPS e Clima de Viagem em Tempo Real
 * Integração com Google Maps, Waze, Exportação GPX e Monitoramento ao Vivo
 */

const RoutePlanner = {
  map: null,
  origin: null,
  destination: null,
  stayDays: 3,
  watchId: null,
  isTracking: false,
  originMarker: null,
  destMarker: null,
  routePolyline: null,
  userMarker: null,
  userAccuracyCircle: null,

  /**
   * Inicialização do módulo de rota
   */
  init() {
    this.setupEventListeners();
    this.initDatePickers();
  },

  /**
   * Configura ouvintes de eventos da tela de rotas
   */
  setupEventListeners() {
    // Alternância de Abas Principais (Clima Local vs Rota & Viagem)
    const tabWeather = document.getElementById('tab-btn-weather');
    const tabRoute = document.getElementById('tab-btn-route');
    const viewWeather = document.getElementById('view-weather-dashboard');
    const viewRoute = document.getElementById('view-route-dashboard');

    if (tabWeather && tabRoute && viewWeather && viewRoute) {
      tabWeather.addEventListener('click', () => {
        tabWeather.classList.add('active', 'bg-sky-500/20', 'text-sky-300', 'border-sky-400/40');
        tabWeather.classList.remove('text-slate-400', 'border-transparent');
        tabRoute.classList.remove('active', 'bg-sky-500/20', 'text-sky-300', 'border-sky-400/40');
        tabRoute.classList.add('text-slate-400', 'border-transparent');

        viewWeather.classList.remove('hidden');
        viewRoute.classList.add('hidden');
      });

      tabRoute.addEventListener('click', () => {
        tabRoute.classList.add('active', 'bg-sky-500/20', 'text-sky-300', 'border-sky-400/40');
        tabRoute.classList.remove('text-slate-400', 'border-transparent');
        tabWeather.classList.remove('active', 'bg-sky-500/20', 'text-sky-300', 'border-sky-400/40');
        tabWeather.classList.add('text-slate-400', 'border-transparent');

        viewWeather.classList.add('hidden');
        viewRoute.classList.remove('hidden');

        // Garante que o container esteja renderizado antes de calcular o tamanho do Leaflet
        setTimeout(() => {
          this.initMap();
        }, 150);
      });
    }

    // Autocomplete Origem
    const originInput = document.getElementById('route-origin-input');
    const originResults = document.getElementById('route-origin-results');
    this.setupCityAutocomplete(originInput, originResults, (city) => {
      this.origin = city;
      originInput.value = `${city.name}, ${city.state || city.country}`;
      this.updateRouteIfReady();
    });

    // Botão GPS para Origem
    const btnOriginGps = document.getElementById('btn-route-origin-gps');
    if (btnOriginGps) {
      btnOriginGps.addEventListener('click', () => {
        this.useCurrentLocationAsOrigin();
      });
    }

    // Autocomplete Destino
    const destInput = document.getElementById('route-dest-input');
    const destResults = document.getElementById('route-dest-results');
    this.setupCityAutocomplete(destInput, destResults, (city) => {
      this.destination = city;
      destInput.value = `${city.name}, ${city.state || city.country}`;
      this.updateRouteIfReady();
    });

    // Seletor de dias de estadia
    const staySelect = document.getElementById('route-stay-days');
    if (staySelect) {
      staySelect.addEventListener('change', (e) => {
        this.stayDays = parseInt(e.target.value, 10) || 3;
        if (this.destination) {
          this.loadDestinationWeather();
        }
      });
    }

    // Botão Google Maps
    const btnGmaps = document.getElementById('btn-open-google-maps');
    if (btnGmaps) {
      btnGmaps.addEventListener('click', () => this.openGoogleMaps());
    }

    // Botão Waze
    const btnWaze = document.getElementById('btn-open-waze');
    if (btnWaze) {
      btnWaze.addEventListener('click', () => this.openWaze());
    }

    // Botão Baixar GPX para GPS
    const btnGpx = document.getElementById('btn-download-gpx');
    if (btnGpx) {
      btnGpx.addEventListener('click', () => this.downloadGPX());
    }

    // Botão Modo Viagem em Tempo Real
    const btnLive = document.getElementById('btn-toggle-live-travel');
    if (btnLive) {
      btnLive.addEventListener('click', () => this.toggleLiveTracking());
    }
  },

  /**
   * Inicializa seletor de data
   */
  initDatePickers() {
    const dateInput = document.getElementById('route-start-date');
    if (dateInput) {
      const today = new Date().toISOString().split('T')[0];
      dateInput.value = today;
      dateInput.min = today;
    }
  },

  /**
   * Configura o autocomplete para um campo de cidade
   */
  setupCityAutocomplete(input, resultsContainer, onSelect) {
    if (!input || !resultsContainer) return;
    let timeout = null;

    input.addEventListener('input', (e) => {
      clearTimeout(timeout);
      const query = e.target.value.trim();

      if (query.length < 2) {
        resultsContainer.classList.add('hidden');
        resultsContainer.innerHTML = '';
        return;
      }

      timeout = setTimeout(async () => {
        resultsContainer.innerHTML = `
          <div class="p-3 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <i data-lucide="loader-2" class="w-3.5 h-3.5 animate-spin text-sky-400"></i>
            <span>Buscando cidades...</span>
          </div>
        `;
        resultsContainer.classList.remove('hidden');
        lucide.createIcons();

        const cities = await API.searchCities(query);
        this.renderAutocompleteResults(cities, resultsContainer, (city) => {
          resultsContainer.classList.add('hidden');
          onSelect(city);
        });
      }, 250);
    });

    document.addEventListener('click', (e) => {
      if (!input.contains(e.target) && !resultsContainer.contains(e.target)) {
        resultsContainer.classList.add('hidden');
      }
    });
  },

  renderAutocompleteResults(cities, container, onSelect) {
    if (cities.length === 0) {
      container.innerHTML = `<div class="p-3 text-center text-xs text-slate-400">Nenhum local encontrado</div>`;
      return;
    }

    container.innerHTML = '';
    cities.forEach(city => {
      const item = document.createElement('button');
      item.className = 'w-full text-left px-3.5 py-2 hover:bg-sky-500/15 flex items-center justify-between transition-colors border-b border-white/[0.04] last:border-0';
      const subtitle = [city.state, city.country].filter(Boolean).join(', ');

      item.innerHTML = `
        <div class="flex items-center gap-2">
          <span class="text-sm">${city.flag}</span>
          <div>
            <span class="text-xs font-semibold text-white block">${city.name}</span>
            <span class="text-[10px] text-slate-400 block">${subtitle}</span>
          </div>
        </div>
        <i data-lucide="chevron-right" class="w-3 h-3 text-slate-500"></i>
      `;

      item.addEventListener('click', () => onSelect(city));
      container.appendChild(item);
    });

    lucide.createIcons();
  },

  /**
   * Usa a localização atual do usuário como origem
   */
  async useCurrentLocationAsOrigin() {
    if (!navigator.geolocation) {
      showToast('GPS não suportado neste navegador.');
      return;
    }

    showToast('Obtendo seu ponto de partida...');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const loc = await API.reverseGeocode(latitude, longitude);
          this.origin = loc;
          const input = document.getElementById('route-origin-input');
          if (input) input.value = `${loc.name} (Minha Localização)`;
          showToast(`Origem definida: ${loc.name}`);
          this.updateRouteIfReady();
        } catch (err) {
          showToast('Erro ao obter sua localização.');
        }
      },
      () => showToast('Permissão de GPS negada.'),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  },

  /**
   * Inicializa o mapa Leaflet com suporte a múltiplos provedores e sem necessidade de API key
   */
  initMap() {
    const mapContainer = document.getElementById('route-map');
    if (!mapContainer) return;

    if (typeof L === 'undefined') {
      console.warn('Leaflet ainda carregando...');
      setTimeout(() => this.initMap(), 250);
      return;
    }

    if (mapContainer._leaflet_id && !this.map) {
      mapContainer._leaflet_id = null;
    }

    // Se a origem ainda não estiver preenchida, usa a cidade atual do Aura Clima ou IP
    if (!this.origin) {
      if (typeof AppState !== 'undefined' && AppState.currentCity) {
        this.origin = AppState.currentCity;
      } else {
        this.origin = { name: 'São Paulo', state: 'São Paulo', country: 'Brasil', latitude: -23.5475, longitude: -46.6361 };
      }
      const originInput = document.getElementById('route-origin-input');
      if (originInput) originInput.value = `${this.origin.name}, ${this.origin.state || this.origin.country}`;
    }

    // Se o destino não estiver preenchido, sugere uma rota padrão para já traçar no mapa
    if (!this.destination) {
      if (this.origin.name.toLowerCase().includes('rio')) {
        this.destination = { name: 'São Paulo', state: 'São Paulo', country: 'Brasil', latitude: -23.5475, longitude: -46.6361 };
      } else {
        this.destination = { name: 'Rio de Janeiro', state: 'Rio de Janeiro', country: 'Brasil', latitude: -22.9064, longitude: -43.1822 };
      }
      const destInput = document.getElementById('route-dest-input');
      if (destInput) destInput.value = `${this.destination.name}, ${this.destination.state || this.destination.country}`;
    }

    if (this.map) {
      setTimeout(() => {
        this.map.invalidateSize();
        this.renderRouteOnMap();
      }, 100);
      return;
    }

    const initialLat = this.origin?.latitude || -23.5475;
    const initialLon = this.origin?.longitude || -46.6361;

    this.map = L.map('route-map', {
      zoomControl: false,
      attributionControl: false
    }).setView([initialLat, initialLon], 7);

    // Provedor 1: CartoDB Dark Matter (tema escuro perfeito para o app)
    const darkTiles = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd'
    });

    // Provedor 2: OpenStreetMap Padrão
    const osmTiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    });

    // Provedor 3: Satélite de Alta Resolução (ESRI)
    const satelliteTiles = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 18
    });

    darkTiles.addTo(this.map);

    // Controle de Zoom
    L.control.zoom({ position: 'bottomright' }).addTo(this.map);

    // Controle de Camadas para o usuário alternar livremente
    L.control.layers({
      '🌙 Escuro': darkTiles,
      '🗺️ Ruas': osmTiles,
      '🛰️ Satélite': satelliteTiles
    }, null, { position: 'topright' }).addTo(this.map);

    setTimeout(() => {
      this.map.invalidateSize();
      this.updateRouteIfReady();
    }, 200);
  },

  /**
   * Atualiza o cálculo da rota e desenha no mapa se Origem e Destino estiverem prontos
   */
  async updateRouteIfReady() {
    if (!this.origin || !this.destination) return;

    const distKm = this.calculateDistance(
      this.origin.latitude, this.origin.longitude,
      this.destination.latitude, this.destination.longitude
    );

    // Estimativa de distância rodoviária (~1.25x da linha reta) e tempo médio (80 km/h)
    const roadDistKm = Math.round(distKm * 1.25);
    const estHours = (roadDistKm / 80).toFixed(1);
    const hoursPart = Math.floor(estHours);
    const minsPart = Math.round((estHours - hoursPart) * 60);
    const durationText = hoursPart > 0 ? `${hoursPart}h ${minsPart}min` : `${minsPart}min`;

    // Atualiza indicadores na UI
    document.getElementById('route-total-distance').textContent = `${roadDistKm} km`;
    document.getElementById('route-total-duration').textContent = `~ ${durationText}`;
    document.getElementById('route-summary-panel').classList.remove('hidden');

    // Atualiza o mapa
    this.renderRouteOnMap();

    // Carrega previsões de clima (Origem e Destino durante os dias de estadia)
    await Promise.all([
      this.loadOriginWeather(),
      this.loadDestinationWeather()
    ]);
  },

  /**
   * Desenha marcadores com SVGs nativos e linha de rota com brilho neon
   */
  renderRouteOnMap() {
    if (!this.map || !this.origin || !this.destination) return;

    // Remove camadas anteriores
    if (this.originMarker) this.map.removeLayer(this.originMarker);
    if (this.destMarker) this.map.removeLayer(this.destMarker);
    if (this.routePolyline) this.map.removeLayer(this.routePolyline);

    // Ícone verde de Partida com SVG embutido
    const originIcon = L.divIcon({
      className: 'custom-map-marker',
      html: `
        <div style="background:#10b981;border:2px solid #ffffff;border-radius:50%;width:34px;height:34px;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(16,185,129,0.5)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17]
    });

    // Ícone vermelho de Chegada com SVG embutido
    const destIcon = L.divIcon({
      className: 'custom-map-marker',
      html: `
        <div style="background:#f43f5e;border:2px solid #ffffff;border-radius:50%;width:34px;height:34px;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(244,63,94,0.5)">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17]
    });

    this.originMarker = L.marker([this.origin.latitude, this.origin.longitude], { icon: originIcon })
      .bindPopup(`<div style="font-family:sans-serif;font-size:12px;padding:2px"><b>Partida:</b> ${this.origin.name}</div>`)
      .addTo(this.map);

    this.destMarker = L.marker([this.destination.latitude, this.destination.longitude], { icon: destIcon })
      .bindPopup(`<div style="font-family:sans-serif;font-size:12px;padding:2px"><b>Destino:</b> ${this.destination.name}</div>`)
      .addTo(this.map);

    // Traçado da rota
    const points = [
      [this.origin.latitude, this.origin.longitude],
      [this.destination.latitude, this.destination.longitude]
    ];

    this.routePolyline = L.polyline(points, {
      color: '#38bdf8',
      weight: 6,
      opacity: 0.95
    }).addTo(this.map);

    setTimeout(() => {
      if (this.map && this.routePolyline) {
        this.map.invalidateSize();
        this.map.fitBounds(this.routePolyline.getBounds(), { padding: [60, 60], maxZoom: 12 });
      }
    }, 150);
  },

    lucide.createIcons();
  },

  /**
   * Carrega o clima na origem
   */
  async loadOriginWeather() {
    try {
      const data = await API.getForecast(this.origin.latitude, this.origin.longitude);
      const curr = data.current;
      const info = getWeatherInfo(curr.weather_code, curr.is_day);

      document.getElementById('origin-weather-temp').textContent = `${Math.round(curr.temperature_2m)}°`;
      document.getElementById('origin-weather-desc').textContent = info.label;
      document.getElementById('origin-weather-icon').innerHTML = `<i data-lucide="${info.icon}" class="w-6 h-6 text-amber-300"></i>`;
      lucide.createIcons();
    } catch (err) {
      console.warn('Erro ao carregar clima de origem:', err);
    }
  },

  /**
   * Carrega o clima e previsão dos dias no destino
   */
  async loadDestinationWeather() {
    try {
      const data = await API.getForecast(this.destination.latitude, this.destination.longitude);
      const curr = data.current;
      const daily = data.daily;
      const info = getWeatherInfo(curr.weather_code, curr.is_day);

      // Clima atual no destino
      document.getElementById('dest-weather-temp').textContent = `${Math.round(curr.temperature_2m)}°`;
      document.getElementById('dest-weather-desc').textContent = info.label;
      document.getElementById('dest-weather-icon').innerHTML = `<i data-lucide="${info.icon}" class="w-6 h-6 text-amber-300"></i>`;

      // Alerta de estrada / viagem
      this.renderRoadWeatherAlert(curr, daily);

      // Renderiza a previsão para os dias específicos da estadia
      this.renderDestinationStayForecast(daily);

      lucide.createIcons();
    } catch (err) {
      console.warn('Erro ao carregar clima de destino:', err);
    }
  },

  /**
   * Gera um alerta inteligente sobre as condições da viagem
   */
  renderRoadWeatherAlert(current, daily) {
    const alertBox = document.getElementById('route-weather-alert');
    if (!alertBox) return;

    const rainProb = daily?.precipitation_probability_max?.[0] || 0;
    const isStorm = current.weather_code >= 80 || current.weather_code === 95;
    const isRain = current.weather_code >= 51 && current.weather_code <= 67;
    const isFog = current.weather_code === 45 || current.weather_code === 48;

    let alertHtml = '';

    if (isStorm) {
      alertHtml = `
        <div class="alert-banner alert-danger p-3.5 flex items-center gap-3">
          <i data-lucide="zap" class="w-5 h-5 text-rose-300 flex-shrink-0"></i>
          <div>
            <h5 class="text-xs font-bold text-white uppercase">Alerta de Tempestade no Trajeto/Destino</h5>
            <p class="text-xs text-rose-200">Risco de ventos fortes e aquaplanagem. Reduza a velocidade e mantenha distância segura.</p>
          </div>
        </div>
      `;
    } else if (isFog) {
      alertHtml = `
        <div class="alert-banner alert-warning p-3.5 flex items-center gap-3">
          <i data-lucide="cloud-fog" class="w-5 h-5 text-amber-300 flex-shrink-0"></i>
          <div>
            <h5 class="text-xs font-bold text-white uppercase">Atenção: Neblina e Baixa Visibilidade</h5>
            <p class="text-xs text-amber-200">Nevoeiro na rota/chegada. Utilize farol baixo e evite ultrapassagens arriscadas.</p>
          </div>
        </div>
      `;
    } else if (isRain || rainProb >= 60) {
      alertHtml = `
        <div class="alert-banner alert-info p-3.5 flex items-center gap-3">
          <i data-lucide="cloud-rain" class="w-5 h-5 text-sky-300 flex-shrink-0"></i>
          <div>
            <h5 class="text-xs font-bold text-white uppercase">Pistas Molhadas Previstas (${rainProb}% chuva)</h5>
            <p class="text-xs text-sky-200">Leve capa/guarda-chuva e dirija com atenção redobrada nas curvas.</p>
          </div>
        </div>
      `;
    } else {
      alertHtml = `
        <div class="glass-card p-3.5 flex items-center gap-3 border-emerald-500/25 bg-emerald-500/10">
          <i data-lucide="sun" class="w-5 h-5 text-emerald-300 flex-shrink-0"></i>
          <div>
            <h5 class="text-xs font-bold text-emerald-200 uppercase">Ótimas Condições para Viagem</h5>
            <p class="text-xs text-slate-300">Tempo estável e sem previsão de chuva significativa no seu destino.</p>
          </div>
        </div>
      `;
    }

    alertBox.innerHTML = alertHtml;
  },

  /**
   * Renderiza a previsão diária para os dias de estadia selecionados
   */
  renderDestinationStayForecast(daily) {
    const container = document.getElementById('destination-stay-forecast');
    if (!container || !daily || !daily.time) return;

    container.innerHTML = '';
    const daysToShow = Math.min(this.stayDays, daily.time.length);
    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    for (let i = 0; i < daysToShow; i++) {
      const date = new Date(daily.time[i] + 'T00:00:00');
      const dayName = i === 0 ? 'Dia da Chegada' : i === 1 ? '2º Dia' : `${i + 1}º Dia (${dayNames[date.getDay()]})`;
      const formattedDate = date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
      const weatherInfo = getWeatherInfo(daily.weather_code[i], 1);
      const minTemp = Math.round(daily.temperature_2m_min[i]);
      const maxTemp = Math.round(daily.temperature_2m_max[i]);
      const rainProb = daily.precipitation_probability_max ? daily.precipitation_probability_max[i] : 0;

      const card = document.createElement('div');
      card.className = 'glass-card p-3 flex flex-col items-center justify-between text-center min-w-[110px] flex-1';

      card.innerHTML = `
        <span class="text-xs font-bold text-sky-300 block">${dayName}</span>
        <span class="text-[10px] text-slate-400 block mb-1">${formattedDate}</span>
        <div class="my-1.5 flex items-center justify-center">
          <i data-lucide="${weatherInfo.icon}" class="w-7 h-7 text-amber-300"></i>
        </div>
        <span class="text-xs font-medium text-slate-200 truncate max-w-[100px] block">${weatherInfo.label}</span>
        <div class="mt-1 flex items-center gap-1 text-xs">
          <span class="text-slate-400">${minTemp}°</span>
          <span class="text-slate-600">/</span>
          <span class="text-white font-bold">${maxTemp}°</span>
        </div>
        ${rainProb > 0 ? `
          <span class="text-[10px] text-sky-400 font-medium flex items-center gap-0.5 mt-1">
            <i data-lucide="droplet" class="w-2.5 h-2.5"></i>
            ${rainProb}%
          </span>
        ` : ''}
      `;

      container.appendChild(card);
    }
  },

  /**
   * Abre no Google Maps oficial (navegação curva a curva pronta)
   */
  openGoogleMaps() {
    if (!this.destination) {
      showToast('Defina ao menos a cidade de destino.');
      return;
    }

    let url = 'https://www.google.com/maps/dir/?api=1';
    if (this.origin) {
      url += `&origin=${encodeURIComponent(this.origin.name + ', ' + this.origin.state)}`;
    }
    url += `&destination=${encodeURIComponent(this.destination.name + ', ' + this.destination.state)}&travelmode=driving`;

    window.open(url, '_blank');
  },

  /**
   * Abre a rota no aplicativo Waze
   */
  openWaze() {
    if (!this.destination) {
      showToast('Defina a cidade de destino.');
      return;
    }

    const url = `https://waze.com/ul?ll=${this.destination.latitude},${this.destination.longitude}&navigate=yes`;
    window.open(url, '_blank');
  },

  /**
   * Gera e faz o download de um arquivo .GPX universal para navegadores GPS (Garmin, OsmAnd, etc.)
   */
  downloadGPX() {
    if (!this.destination) {
      showToast('Defina o ponto de destino para exportar o GPS.');
      return;
    }

    const originName = this.origin?.name || 'Ponto de Partida';
    const destName = this.destination.name;
    const nowISO = new Date().toISOString();

    const gpxData = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Aura Clima - https://dk7br.github.io/aura-clima/" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>Rota: ${originName} para ${destName}</name>
    <desc>Trajeto gerado pelo Aura Clima com previsao meteorologica</desc>
    <time>${nowISO}</time>
  </metadata>
  ${this.origin ? `
  <wpt lat="${this.origin.latitude}" lon="${this.origin.longitude}">
    <name>${originName}</name>
    <desc>Partida</desc>
    <sym>Flag, Green</sym>
  </wpt>` : ''}
  <wpt lat="${this.destination.latitude}" lon="${this.destination.longitude}">
    <name>${destName}</name>
    <desc>Destino com previsao do tempo</desc>
    <sym>Flag, Red</sym>
  </wpt>
  <rte>
    <name>Rota ${originName} - ${destName}</name>
    ${this.origin ? `<rtept lat="${this.origin.latitude}" lon="${this.origin.longitude}"><name>${originName}</name></rtept>` : ''}
    <rtept lat="${this.destination.latitude}" lon="${this.destination.longitude}"><name>${destName}</name></rtept>
  </rte>
</gpx>`;

    const blob = new Blob([gpxData], { type: 'application/gpx+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rota-${destName.toLowerCase().replace(/\s+/g, '-')}.gpx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('Arquivo .GPX baixado com sucesso! Pronto para importar no seu GPS.');
  },

  /**
   * Ativa / Desativa o Modo Viagem em Tempo Real com GPS do celular/carro
   */
  toggleLiveTracking() {
    if (this.isTracking) {
      this.stopLiveTracking();
    } else {
      this.startLiveTracking();
    }
  },

  startLiveTracking() {
    if (!navigator.geolocation) {
      showToast('GPS em tempo real não suportado neste navegador.');
      return;
    }

    this.isTracking = true;
    const btn = document.getElementById('btn-toggle-live-travel');
    const hud = document.getElementById('live-travel-hud');

    if (btn) {
      btn.classList.add('bg-rose-500/25', 'text-rose-300', 'border-rose-400/50');
      btn.innerHTML = `<i data-lucide="square" class="w-4 h-4 fill-rose-300"></i><span>Encerrar Viagem</span>`;
    }
    if (hud) hud.classList.remove('hidden');

    showToast('Modo Viagem Ativo! Acompanhando velocidade e clima em tempo real.');

    this.watchId = navigator.geolocation.watchPosition(
      (pos) => this.handleLivePosition(pos),
      (err) => console.warn('Erro GPS ao vivo:', err),
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 }
    );

    lucide.createIcons();
  },

  stopLiveTracking() {
    this.isTracking = false;
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }

    const btn = document.getElementById('btn-toggle-live-travel');
    const hud = document.getElementById('live-travel-hud');

    if (btn) {
      btn.classList.remove('bg-rose-500/25', 'text-rose-300', 'border-rose-400/50');
      btn.innerHTML = `<i data-lucide="navigation-2" class="w-4 h-4"></i><span>Iniciar Modo Viagem</span>`;
    }
    if (hud) hud.classList.add('hidden');

    showToast('Modo Viagem finalizado.');
    lucide.createIcons();
  },

  handleLivePosition(pos) {
    const { latitude, longitude, speed } = pos.coords;
    const speedKmh = speed ? Math.round(speed * 3.6) : 0;

    // Atualiza velocímetro
    const speedEl = document.getElementById('live-speed-val');
    if (speedEl) speedEl.textContent = speedKmh;

    // Atualiza distância restante até o destino
    if (this.destination) {
      const remainingKm = Math.round(this.calculateDistance(latitude, longitude, this.destination.latitude, this.destination.longitude) * 1.2);
      const remEl = document.getElementById('live-remaining-dist');
      if (remEl) remEl.textContent = `${remainingKm} km`;
    }

    // Atualiza marcador de posição ao vivo no mapa
    if (this.map) {
      if (!this.userMarker) {
        const liveIcon = L.divIcon({
          className: 'live-user-marker',
          html: `<div class="w-4 h-4 rounded-full bg-sky-400 border-2 border-white shadow-lg animate-ping"></div>`,
          iconSize: [16, 16]
        });
        this.userMarker = L.marker([latitude, longitude], { icon: liveIcon }).addTo(this.map);
      } else {
        this.userMarker.setLatLng([latitude, longitude]);
      }
    }
  },

  /**
   * Cálculo de distância geodésica em km (Fórmula de Haversine)
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
};

// Inicializa quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  RoutePlanner.init();
});

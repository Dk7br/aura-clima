/**
 * Camada de API para busca de cidades, dados meteorológicos e geolocalização.
 * Utiliza Open-Meteo (100% gratuita, sem necessidade de chaves de API).
 */

const API = {
  GEOCODING_URL: 'https://geocoding-api.open-meteo.com/v1/search',
  FORECAST_URL: 'https://api.open-meteo.com/v1/forecast',
  AIR_QUALITY_URL: 'https://air-quality-api.open-meteo.com/v1/air-quality',
  REVERSE_GEO_URL: 'https://api.bigdatacloud.net/data/reverse-geocode-client',
  IP_GEO_URL: 'https://get.geojs.io/v1/ip/geo.json',

  /**
   * Converte código de país (2 letras) para emoji de bandeira
   */
  getFlagEmoji(countryCode) {
    if (!countryCode || countryCode.length !== 2) return '🌐';
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  },

  /**
   * Busca cidades por nome
   */
  async searchCities(query) {
    if (!query || query.trim().length < 2) return [];

    try {
      const url = `${this.GEOCODING_URL}?name=${encodeURIComponent(query.trim())}&count=8&language=pt&format=json`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Falha ao buscar cidades');
      const data = await res.json();

      if (!data.results || data.results.length === 0) return [];

      return data.results.map(city => ({
        id: city.id,
        name: city.name,
        state: city.admin1 || '',
        country: city.country || '',
        countryCode: city.country_code || '',
        flag: this.getFlagEmoji(city.country_code),
        latitude: city.latitude,
        longitude: city.longitude,
        timezone: city.timezone || 'auto'
      }));
    } catch (err) {
      console.error('Erro na busca de cidades:', err);
      return [];
    }
  },

  /**
   * Obtém os dados meteorológicos completos (atual, 24h e 7 dias)
   */
  async getForecast(latitude, longitude, timezone = 'auto', unit = 'celsius') {
    const params = new URLSearchParams({
      latitude,
      longitude,
      current: 'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure,uv_index,dew_point_2m,visibility,wind_gusts_10m,cloud_cover',
      hourly: 'temperature_2m,weather_code,precipitation_probability,apparent_temperature,wind_speed_10m',
      daily: 'weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max,uv_index_max,wind_speed_10m_max,wind_gusts_10m_max',
      timezone: timezone || 'auto',
      forecast_days: '7',
      temperature_unit: unit === 'fahrenheit' ? 'fahrenheit' : 'celsius',
      wind_speed_unit: 'kmh'
    });

    const res = await fetch(`${this.FORECAST_URL}?${params.toString()}`);
    if (!res.ok) throw new Error(`Falha ao obter previsão: ${res.statusText}`);
    return await res.json();
  },

  /**
   * Obtém dados de qualidade do ar
   */
  async getAirQuality(latitude, longitude) {
    try {
      const params = new URLSearchParams({
        latitude,
        longitude,
        current: 'european_aqi,pm10,pm2_5'
      });

      const res = await fetch(`${this.AIR_QUALITY_URL}?${params.toString()}`);
      if (!res.ok) return null;
      const data = await res.json();
      return data.current || null;
    } catch (err) {
      console.warn('Qualidade do ar não disponível:', err);
      return null;
    }
  },

  /**
   * Geocodificação reversa de coordenadas (latitude, longitude) -> Nome da cidade
   */
  async reverseGeocode(latitude, longitude) {
    try {
      const res = await fetch(`${this.REVERSE_GEO_URL}?latitude=${latitude}&longitude=${longitude}&localityLanguage=pt`);
      if (!res.ok) throw new Error('Falha na geocodificação reversa');
      const data = await res.json();

      const cityName = data.locality || data.city || data.principalSubdivision || 'Sua Localização';
      const state = data.principalSubdivision || '';
      const country = data.countryName || '';
      const countryCode = data.countryCode || '';

      return {
        name: cityName,
        state,
        country,
        countryCode,
        flag: this.getFlagEmoji(countryCode),
        latitude,
        longitude,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'auto'
      };
    } catch (err) {
      console.warn('Erro ao obter nome do local:', err);
      return {
        name: 'Minha Localização',
        state: '',
        country: '',
        countryCode: '',
        flag: '📍',
        latitude,
        longitude,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'auto'
      };
    }
  },

  /**
   * Obtém a localização estimada por IP (ótimo fallback quando o GPS não está disponível)
   */
  async getIPLocation() {
    try {
      const res = await fetch(this.IP_GEO_URL);
      if (!res.ok) throw new Error('Falha ao obter localização por IP');
      const data = await res.json();

      return {
        name: data.city || 'São Paulo',
        state: data.region || 'São Paulo',
        country: data.country || 'Brasil',
        countryCode: data.country_code || 'BR',
        flag: this.getFlagEmoji(data.country_code || 'BR'),
        latitude: parseFloat(data.latitude) || -23.5475,
        longitude: parseFloat(data.longitude) || -46.6361,
        timezone: data.timezone || 'America/Sao_Paulo'
      };
    } catch (err) {
      console.warn('Erro na geolocalização por IP, usando São Paulo como padrão:', err);
      return {
        name: 'São Paulo',
        state: 'São Paulo',
        country: 'Brasil',
        countryCode: 'BR',
        flag: '🇧🇷',
        latitude: -23.5475,
        longitude: -46.6361,
        timezone: 'America/Sao_Paulo'
      };
    }
  }
};

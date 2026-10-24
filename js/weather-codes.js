/**
 * Mapeamento de Códigos Meteorológicos WMO (World Meteorological Organization)
 * Tradução em Português, ícones Lucide e temas dinâmicos.
 */

const WEATHER_CODES = {
  0: {
    label: 'Céu Limpo',
    iconDay: 'sun',
    iconNight: 'moon',
    themeDay: 'theme-clear-day',
    themeNight: 'theme-clear-night',
    ambient: 'clear'
  },
  1: {
    label: 'Predominantemente Limpo',
    iconDay: 'sun-medium',
    iconNight: 'moon',
    themeDay: 'theme-clear-day',
    themeNight: 'theme-clear-night',
    ambient: 'clear'
  },
  2: {
    label: 'Parcialmente Nublado',
    iconDay: 'cloud-sun',
    iconNight: 'cloud-moon',
    themeDay: 'theme-cloudy-day',
    themeNight: 'theme-cloudy-night',
    ambient: 'clouds'
  },
  3: {
    label: 'Nublado / Encoberto',
    iconDay: 'cloud',
    iconNight: 'cloud',
    themeDay: 'theme-overcast',
    themeNight: 'theme-overcast-night',
    ambient: 'clouds'
  },
  45: {
    label: 'Nevoeiro',
    iconDay: 'cloud-fog',
    iconNight: 'cloud-fog',
    themeDay: 'theme-fog',
    themeNight: 'theme-fog',
    ambient: 'fog'
  },
  48: {
    label: 'Nevoeiro com Geada',
    iconDay: 'cloud-fog',
    iconNight: 'cloud-fog',
    themeDay: 'theme-fog',
    themeNight: 'theme-fog',
    ambient: 'fog'
  },
  51: {
    label: 'Garoa Leve',
    iconDay: 'cloud-drizzle',
    iconNight: 'cloud-drizzle',
    themeDay: 'theme-rain',
    themeNight: 'theme-rain-night',
    ambient: 'rain'
  },
  53: {
    label: 'Garoa Moderada',
    iconDay: 'cloud-drizzle',
    iconNight: 'cloud-drizzle',
    themeDay: 'theme-rain',
    themeNight: 'theme-rain-night',
    ambient: 'rain'
  },
  55: {
    label: 'Garoa Intensa',
    iconDay: 'cloud-rain',
    iconNight: 'cloud-rain',
    themeDay: 'theme-rain',
    themeNight: 'theme-rain-night',
    ambient: 'rain'
  },
  56: {
    label: 'Garoa Congelante Leve',
    iconDay: 'cloud-snow',
    iconNight: 'cloud-snow',
    themeDay: 'theme-snow',
    themeNight: 'theme-snow',
    ambient: 'snow'
  },
  57: {
    label: 'Garoa Congelante Intensa',
    iconDay: 'cloud-snow',
    iconNight: 'cloud-snow',
    themeDay: 'theme-snow',
    themeNight: 'theme-snow',
    ambient: 'snow'
  },
  61: {
    label: 'Chuva Fraca',
    iconDay: 'cloud-rain',
    iconNight: 'cloud-rain',
    themeDay: 'theme-rain',
    themeNight: 'theme-rain-night',
    ambient: 'rain'
  },
  63: {
    label: 'Chuva Moderada',
    iconDay: 'cloud-rain',
    iconNight: 'cloud-rain',
    themeDay: 'theme-rain',
    themeNight: 'theme-rain-night',
    ambient: 'rain'
  },
  65: {
    label: 'Chuva Forte',
    iconDay: 'cloud-rain-wind',
    iconNight: 'cloud-rain-wind',
    themeDay: 'theme-rain-heavy',
    themeNight: 'theme-rain-night',
    ambient: 'rain'
  },
  66: {
    label: 'Chuva Congelante Leve',
    iconDay: 'cloud-snow',
    iconNight: 'cloud-snow',
    themeDay: 'theme-snow',
    themeNight: 'theme-snow',
    ambient: 'snow'
  },
  67: {
    label: 'Chuva Congelante Forte',
    iconDay: 'cloud-snow',
    iconNight: 'cloud-snow',
    themeDay: 'theme-snow',
    themeNight: 'theme-snow',
    ambient: 'snow'
  },
  71: {
    label: 'Neve Fraca',
    iconDay: 'snowflake',
    iconNight: 'snowflake',
    themeDay: 'theme-snow',
    themeNight: 'theme-snow',
    ambient: 'snow'
  },
  73: {
    label: 'Neve Moderada',
    iconDay: 'snowflake',
    iconNight: 'snowflake',
    themeDay: 'theme-snow',
    themeNight: 'theme-snow',
    ambient: 'snow'
  },
  75: {
    label: 'Neve Forte',
    iconDay: 'snowflake',
    iconNight: 'snowflake',
    themeDay: 'theme-snow',
    themeNight: 'theme-snow',
    ambient: 'snow'
  },
  77: {
    label: 'Grãos de Neve',
    iconDay: 'snowflake',
    iconNight: 'snowflake',
    themeDay: 'theme-snow',
    themeNight: 'theme-snow',
    ambient: 'snow'
  },
  80: {
    label: 'Pancadas de Chuva Fracas',
    iconDay: 'cloud-sun-rain',
    iconNight: 'cloud-moon-rain',
    themeDay: 'theme-rain',
    themeNight: 'theme-rain-night',
    ambient: 'rain'
  },
  81: {
    label: 'Pancadas de Chuva',
    iconDay: 'cloud-rain',
    iconNight: 'cloud-rain',
    themeDay: 'theme-rain',
    themeNight: 'theme-rain-night',
    ambient: 'rain'
  },
  82: {
    label: 'Pancadas de Chuva Violentas',
    iconDay: 'cloud-rain-wind',
    iconNight: 'cloud-rain-wind',
    themeDay: 'theme-storm',
    themeNight: 'theme-storm',
    ambient: 'storm'
  },
  85: {
    label: 'Pancadas de Neve Leves',
    iconDay: 'snowflake',
    iconNight: 'snowflake',
    themeDay: 'theme-snow',
    themeNight: 'theme-snow',
    ambient: 'snow'
  },
  86: {
    label: 'Pancadas de Neve Fortes',
    iconDay: 'snowflake',
    iconNight: 'snowflake',
    themeDay: 'theme-snow',
    themeNight: 'theme-snow',
    ambient: 'snow'
  },
  95: {
    label: 'Tempestade com Trovões',
    iconDay: 'cloud-lightning',
    iconNight: 'cloud-lightning',
    themeDay: 'theme-storm',
    themeNight: 'theme-storm',
    ambient: 'storm'
  },
  96: {
    label: 'Tempestade com Granizo Leve',
    iconDay: 'cloud-lightning',
    iconNight: 'cloud-lightning',
    themeDay: 'theme-storm',
    themeNight: 'theme-storm',
    ambient: 'storm'
  },
  99: {
    label: 'Tempestade com Granizo Forte',
    iconDay: 'cloud-lightning',
    iconNight: 'cloud-lightning',
    themeDay: 'theme-storm',
    themeNight: 'theme-storm',
    ambient: 'storm'
  }
};

/**
 * Retorna as informações completas do código meteorológico
 */
function getWeatherInfo(code, isDay = 1) {
  const fallback = {
    label: 'Clima Indeterminado',
    iconDay: 'cloud',
    iconNight: 'cloud',
    themeDay: 'theme-clear-day',
    themeNight: 'theme-clear-night',
    ambient: 'clear'
  };

  const info = WEATHER_CODES[code] || fallback;
  const icon = isDay ? info.iconDay : info.iconNight;
  const theme = isDay ? info.themeDay : info.themeNight;

  return {
    ...info,
    icon,
    theme
  };
}

/**
 * Converte graus de direção do vento em rosa dos ventos em Português
 */
function getWindDirection(degrees) {
  const directions = [
    'N', 'NNE', 'NE', 'ENE',
    'L', 'LSE', 'SE', 'SSE',
    'S', 'SSO', 'SO', 'OSO',
    'O', 'ONO', 'NO', 'NNO'
  ];
  const index = Math.round(((degrees %= 360) < 0 ? degrees + 360 : degrees) / 22.5) % 16;
  return directions[index];
}

/**
 * Interpreta o Índice UV
 */
function getUVInfo(uv) {
  if (uv === null || uv === undefined) return { label: 'N/A', color: 'text-slate-400', level: 'gray' };
  const val = Math.round(uv);
  if (val <= 2) return { label: 'Baixo', text: 'Proteção mínima necessária', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' };
  if (val <= 5) return { label: 'Moderado', text: 'Use óculos e filtro solar', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' };
  if (val <= 7) return { label: 'Alto', text: 'Evite sol no meio do dia', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' };
  if (val <= 10) return { label: 'Muito Alto', text: 'Sombra e proteção máxima', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30' };
  return { label: 'Extremo', text: 'Perigo: evite exposição ao sol', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' };
}

/**
 * Interpreta a Qualidade do Ar (European AQI)
 */
function getAQIInfo(aqi) {
  if (aqi === null || aqi === undefined) return { label: 'N/A', color: 'text-slate-400', bg: 'bg-slate-500/10' };
  if (aqi <= 20) return { label: 'Excelente', text: 'O ar está puro e saudável', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' };
  if (aqi <= 40) return { label: 'Bom', text: 'Qualidade do ar satisfatória', color: 'text-teal-400', bg: 'bg-teal-500/10', border: 'border-teal-500/30' };
  if (aqi <= 60) return { label: 'Moderado', text: 'Pessoas sensíveis devem cuidar', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' };
  if (aqi <= 80) return { label: 'Ruim', text: 'Possível desconforto respiratório', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' };
  if (aqi <= 100) return { label: 'Muito Ruim', text: 'Evite atividades físicas ao ar livre', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30' };
  return { label: 'Perigoso', text: 'Alerta de saúde para todos', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' };
}

/**
 * Calcula a fase da Lua atual e porcentagem de iluminação
 */
function getMoonPhase(date = new Date()) {
  const reference = new Date(Date.UTC(2000, 0, 6, 18, 14, 0));
  const synodicMonth = 29.53058867;
  const diffDays = (date.getTime() - reference.getTime()) / (1000 * 60 * 60 * 24);
  const phase = ((diffDays % synodicMonth) + synodicMonth) % synodicMonth;
  const normalized = phase / synodicMonth;
  const illumination = Math.round((1 - Math.cos(normalized * 2 * Math.PI)) / 2 * 100);

  let name = '';
  let icon = 'moon';

  if (normalized < 0.03 || normalized > 0.97) {
    name = 'Lua Nova';
    icon = 'circle';
  } else if (normalized < 0.22) {
    name = 'Crescente Côncava';
    icon = 'moon';
  } else if (normalized < 0.28) {
    name = 'Quarto Crescente';
    icon = 'moon';
  } else if (normalized < 0.47) {
    name = 'Crescente Gibosa';
    icon = 'moon';
  } else if (normalized < 0.53) {
    name = 'Lua Cheia';
    icon = 'circle-dot';
  } else if (normalized < 0.72) {
    name = 'Minguante Gibosa';
    icon = 'moon';
  } else if (normalized < 0.78) {
    name = 'Quarto Minguante';
    icon = 'moon';
  } else {
    name = 'Minguante Côncava';
    icon = 'moon';
  }

  return {
    name,
    icon,
    illumination,
    ageDays: Math.round(phase)
  };
}

/**
 * Interpreta Visibilidade em metros / km
 */
function getVisibilityInfo(meters) {
  if (meters === undefined || meters === null) return { value: '--', label: 'Indisponível' };
  const km = (meters / 1000).toFixed(1);
  if (meters >= 10000) return { value: `${km} km`, label: 'Excelente visibilidade' };
  if (meters >= 6000) return { value: `${km} km`, label: 'Boa visibilidade' };
  if (meters >= 2000) return { value: `${km} km`, label: 'Moderada / Névoa' };
  return { value: `${km} km`, label: 'Baixa / Nevoeiro denso' };
}

/**
 * Interpreta o Ponto de Orvalho
 */
function getDewPointInfo(dewPoint) {
  if (dewPoint === undefined || dewPoint === null) return { label: 'Indisponível' };
  if (dewPoint < 10) return { label: 'Ar seco e fresco' };
  if (dewPoint <= 15) return { label: 'Confortável e agradável' };
  if (dewPoint <= 20) return { label: 'Sensação de calor úmido' };
  return { label: 'Muito abafado e úmido' };
}

/**
 * Analisa as condições meteorológicas atuais para gerar alertas inteligentes
 */
function checkWeatherAlert(current, daily) {
  if (!current) return null;

  const code = current.weather_code;
  const gusts = current.wind_gusts_10m || 0;
  const wind = current.wind_speed_10m || 0;
  const temp = current.temperature_2m;
  const uv = current.uv_index || daily?.uv_index_max?.[0] || 0;

  // Alerta 1: Tempestades Severas
  if (code === 95 || code === 96 || code === 99) {
    return {
      type: 'danger',
      title: 'Alerta de Tempestade',
      message: 'Tempestade com trovões e raios na região. Evite áreas descampadas e abrigue-se.',
      icon: 'zap'
    };
  }

  // Alerta 2: Chuva Forte / Torrencial
  if (code === 65 || code === 82) {
    return {
      type: 'warning',
      title: 'Alerta de Chuva Intensa',
      message: 'Pancadas torrenciais com risco de pontos de alagamento e baixa visibilidade no trânsito.',
      icon: 'cloud-rain'
    };
  }

  // Alerta 3: Ventania e Rajadas
  if (gusts >= 45 || wind >= 35) {
    return {
      type: 'warning',
      title: 'Alerta de Ventos Fortes',
      message: `Rajadas atingindo até ${Math.round(gusts)} km/h. Cuidado com galhos, árvores e estruturas soltas.`,
      icon: 'wind'
    };
  }

  // Alerta 4: Radiação UV Extrema
  if (uv >= 8 && current.is_day) {
    return {
      type: 'warning',
      title: 'Alerta de Radiação UV Severa',
      message: `Índice UV de nível ${Math.round(uv)}. Evite exposição solar prolongada e utilize protetor FPS 50+.`,
      icon: 'sun'
    };
  }

  // Alerta 5: Calor Excessivo
  if (temp >= 35) {
    return {
      type: 'warning',
      title: 'Alerta de Calor Excessivo',
      message: `Temperatura atingindo ${Math.round(temp)}°C. Mantenha-se bem hidratado e em locais arejados.`,
      icon: 'flame'
    };
  }

  // Alerta 6: Frio Intenso / Risco de Geada
  if (temp <= 4) {
    return {
      type: 'info',
      title: 'Alerta de Baixas Temperaturas',
      message: `Temperatura de ${Math.round(temp)}°C. Agasalhe-se adequadamente e proteja animais e plantas sensíveis.`,
      icon: 'snowflake'
    };
  }

  return null;
}

# 🌤️ Aura Clima - Aplicativo de Previsão do Tempo em Tempo Real

Um aplicativo moderno, ultra-completo e responsivo de **Meteorologia e Previsão do Tempo**, construído com **HTML5**, **Tailwind CSS**, **JavaScript Vanilla**, **Open-Meteo API** e suporte a **PWA (Progressive Web App)**.

O aplicativo utiliza estética **Glassmorphism**, fundos dinâmicos que se adaptam às condições meteorológicas e horário do dia, animação de partículas em Canvas (chuva, neve, poeira solar e estrelas) e gráficos vetoriais interativos.

---

## ✨ Funcionalidades Principais

- 🌍 **Busca Global com Autocomplete:** Pesquise por qualquer cidade ou país do mundo com bandeiras e resultados instantâneos.
- 📍 **Detecção Automática & GPS:** Identifica a sua localização de imediato via IP e conta com botão de alta precisão via GPS.
- ⚠️ **Alertas Meteorológicos Dinâmicos:** Notificações inteligentes na tela para tempestades com raios, chuvas torrenciais, ventos fortes, calor excessivo ou radiação UV extrema.
- 📈 **Previsão Horária com Alternância de Modos:**
  - **Modo Cards:** Carrossel horizontal deslizante hora a hora com temperatura e chance de precipitação.
  - **Modo Gráfico:** Curva vetorial (SVG) suave com gradiente térmico e barras de probabilidade de chuva.
- 📅 **Previsão dos Próximos 7 Dias & Modal de Detalhes:** Visualização semanal com barra térmica proporcional (mínima e máxima). Clique em qualquer dia para abrir um **modal com detalhes completos** (vento máximo, UV, sol, chuva).
- 🌡️ **Painel de Métricas Avançadas (Estilo Apple Weather):**
  - **Vento:** Velocidade em km/h e agulha de bússola com rotação dinâmica.
  - **Umidade:** Porcentagem com barra de nível e diagnóstico de conforto.
  - **Índice UV:** Nível com orientações de proteção solar.
  - **Qualidade do Ar (AQI):** Índice europeu de pureza do ar com recomendações.
  - **Chuva Hoje:** Probabilidade máxima com barra percentual.
  - **Pressão Atmosférica:** Valor em hPa ao nível da superfície.
  - **Visibilidade:** Distância em quilômetros e diagnóstico de névoa/neblina.
  - **Ponto de Orvalho:** Temperatura de condensação e sensação de abafamento.
  - **Ciclo Solar:** Horários precisos de nascer e pôr do sol.
  - **Fase Lunar:** Cálculo astronômico exato da fase da lua (Nova, Crescente, Cheia, Minguante) e porcentagem de iluminação.
- ⭐ **Favoritos Locais:** Salve suas cidades favoritas com 1 clique (armazenadas em `localStorage`).
- 🔄 **Conversor de Unidades:** Alterne instantaneamente entre Celsius (**°C**) e Fahrenheit (**°F**).
- 📱 **PWA & Modo Offline:** Possui `manifest.json`, ícone vetorial e `sw.js` (Service Worker) para instalação no Windows ou celular.
- ⚡ **Zero Configuração:** Não precisa de cadastro, nem de chave de API (`API_KEY`).

---

## 🚀 Como Executar

Não precisa instalar Node.js, Python ou nenhuma dependência!

### Opção 1: Inicializador Rápido (Recomendado no Windows)
Basta dar um duplo clique no arquivo:
```
c:\Users\Duka\Documents\My Games\app-tempo\iniciar-app.bat
```

### Opção 2: Abrir no Navegador
Dê um duplo clique no arquivo `index.html` para abrir diretamente no Chrome, Edge, Firefox, Opera ou Brave.

### Opção 3: Extensão Live Server
Se estiver usando o Visual Studio Code, clique com o botão direito em `index.html` e selecione **Open with Live Server**.

---

## 📁 Estrutura do Projeto

```text
app-tempo/
├── index.html           # Interface visual completa do aplicativo
├── iniciar-app.bat      # Inicializador com 1 clique para Windows
├── icon.svg             # Ícone do aplicativo em alta resolução
├── manifest.json        # Manifesto PWA para instalação no sistema
├── sw.js                # Service Worker para cache e uso offline
├── css/
│   └── style.css        # Efeitos Glassmorphism, temas dinâmicos e gráfico SVG
├── js/
│   ├── weather-codes.js # Códigos WMO, alertas inteligentes, UV, AQI e fase lunar
│   ├── api.js           # Comunicação com APIs Open-Meteo, IP e Geocodificação
│   └── app.js           # Gerenciamento de estado, partículas em Canvas e modais
└── README.md            # Documentação completa
```

---

## 🛠️ Tecnologias Utilizadas

- **HTML5 & CSS3 Moderno**
- **Tailwind CSS (CDN)**
- **JavaScript Vanilla (ES6+)**
- **Lucide Icons**
- **HTML5 Canvas API** (Partículas ambientais: chuva, neve, poeira de sol e estrelas)
- **Open-Meteo API** (Meteorologia global gratuita)
- **Service Worker & Web App Manifest** (PWA)

// importação dos estilos globais e das funções/tipos utilitários
import './style.css'
import { searchWeather } from './services/openMeteo'
import type { CombinedWeatherData } from './types/weather'
import { getWeatherDescription, getWeatherIcon } from './utils/weatherCode'
import { formatWindDirection } from './utils/windDirection'

// busca a div principal onde o aplicativo será montado
const appRoot = document.querySelector<HTMLDivElement>('#app')
if (!appRoot) {throw new Error('Elemento #app não encontrado no documento.')}

// seleção de elementos do formulário e telas de estado
const form = appRoot.querySelector<HTMLFormElement>('#search-form')
const input = appRoot.querySelector<HTMLInputElement>('#city-input')
const button = appRoot.querySelector<HTMLButtonElement>('#search-button')
const emptyState = appRoot.querySelector<HTMLElement>('#empty-state')
const loadingState = appRoot.querySelector<HTMLElement>('#loading-state')
const weatherResult = appRoot.querySelector<HTMLElement>('#weather-result')
const weeklyForecast = appRoot.querySelector<HTMLElement>('#weekly-forecast')
const forecastCards = appRoot.querySelectorAll<HTMLElement>('.forecast-card')

// seleção dos elementos do painel de dados climáticos
const temperatureEl = appRoot.querySelector<HTMLElement>('#weather-temperature')
const cityLineEl = appRoot.querySelector<HTMLElement>('#weather-city')
const dateLineEl = appRoot.querySelector<HTMLElement>('#weather-date')
const weatherDescriptionEl = appRoot.querySelector<HTMLElement>('#weather-description')
const humidityValueEl = appRoot.querySelector<HTMLElement>('#humidity-value')
const feelsLikeValueEl = appRoot.querySelector<HTMLElement>('#feels-like-value')
const precipitationValueEl = appRoot.querySelector<HTMLElement>('#precipitation-value')
const windValueEl = appRoot.querySelector<HTMLElement>('#wind-value')

// validação defensiva: garante que a estrutura HTML necessária existe antes de prosseguir
if (
  !form ||
  !input ||
  !button ||
  !emptyState ||
  !loadingState ||
  !weatherResult ||
  !weeklyForecast ||
  !temperatureEl ||
  !cityLineEl ||
  !dateLineEl ||
  !weatherDescriptionEl ||
  !humidityValueEl ||
  !feelsLikeValueEl ||
  !precipitationValueEl ||
  !windValueEl ||
  forecastCards.length < 7) {
    throw new Error('Estrutura de interface incompleta.')
}

// agrupa as referências da UI em um único objeto para facilitar o acesso
const ui = {
  form,
  input,
  button,
  emptyState,
  loadingState,
  weatherResult,
  weeklyForecast,
  forecastCards,
  temperatureEl,
  cityLineEl,
  dateLineEl,
  weatherDescriptionEl,
  humidityValueEl,
  feelsLikeValueEl,
  precipitationValueEl,
  windValueEl,
}

// alterna a exibição da tela entre os modos: 'empty' (inicial/erro), 'loading' (carregando) e 'result' (sucesso)
function setState(mode: 'empty' | 'loading' | 'result') {
  const isEmpty = mode === 'empty'
  const isLoading = mode === 'loading'
  const isResult = mode === 'result'

  // atualiza visibilidade via propriedade HTML 'hidden'
  ui.emptyState.hidden = !isEmpty
  ui.loadingState.hidden = !isLoading
  ui.weatherResult.hidden = !isResult
  ui.weeklyForecast.hidden = !isResult

  // mantém os atributos de acessibilidade (ARIA) sincronizados
  ui.emptyState.setAttribute('aria-hidden', String(!isEmpty))
  ui.loadingState.setAttribute('aria-hidden', String(!isLoading))
  ui.weatherResult.setAttribute('aria-hidden', String(!isResult))
  ui.weeklyForecast.setAttribute('aria-hidden', String(!isResult))

  // aplica ou remove a classe CSS de animação e transição visual
  ui.emptyState.classList.toggle('is-visible', isEmpty)
  ui.loadingState.classList.toggle('is-visible', isLoading)
  ui.weatherResult.classList.toggle('is-visible', isResult)
  ui.weeklyForecast.classList.toggle('is-visible', isResult)

  // bloqueia as interações de busca durante o carregamento
  ui.input.disabled = isLoading
  ui.button.disabled = isLoading
}

// formata o texto da cidade digitada
function normalizeCityInput(value: string) {
  // substitui múltiplos espaços por apenas um espaço simples
  const sanitized = value.replace(/\s+/g, ' ')
  if (!sanitized.trim()) {return ''}
  const trimmed = sanitized.trimStart()
  const words = trimmed.split(' ')

  // capitaliza a primeira letra de cada palavra, exceto preposições conhecidas
  const normalizedWords = words.map((word, index) => {
    if (!word) {return ''}
    const lowerWord = word.toLowerCase()
    const isPreposition = ['de', 'da', 'do', 'das', 'dos', 'e', 'del', 'della', 'di', 'du'].includes(lowerWord)
    if (index === 0 || !isPreposition) {return word.charAt(0).toUpperCase() + lowerWord.slice(1)}
    return lowerWord
  })

  return normalizedWords.join(' ')
}

// arredonda e formata o valor numérico da temperatura com sua unidade correspondente
function formatTemperature(value: number, unit: string) {
  const rounded = Math.round(value)
  return `${rounded}${unit}`
}

// retorna a data atual formatada (extenso)
function formatDateForCity(timezone: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: timezone,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date())
}

// preenche os cards de previsão do tempo para os próximos 7 dias na interface
function renderForecast(data: CombinedWeatherData) {
  data.forecast.slice(0, 7).forEach((day, index) => {
    const card = ui.forecastCards[index]
    if (!card) return

    // seleciona as sub-tags internas de cada card individual
    const dayEl = card.querySelector<HTMLElement>('.forecast-day')
    const iconEl = card.querySelector<HTMLElement>('.forecast-icon')
    const descriptionEl = card.querySelector<HTMLElement>('.forecast-description')
    const maxEl = card.querySelector<HTMLElement>('.forecast-max')
    const minEl = card.querySelector<HTMLElement>('.forecast-min')
    const rainEl = card.querySelector<HTMLElement>('.forecast-rain')

    // injeta os dados da previsão no respectivo elemento do card
    if (dayEl) dayEl.textContent = day.dayName
    if (iconEl) iconEl.textContent = getWeatherIcon(day.weatherCode)
    if (descriptionEl) descriptionEl.textContent = day.description
    if (maxEl) maxEl.textContent = `${Math.round(day.maxTemp)}°`
    if (minEl) minEl.textContent = `${Math.round(day.minTemp)}°`
    if (rainEl) rainEl.textContent = `${Math.round(day.precipitationProbability)}% chuva`
  })
}

// atualiza todo o painel principal da UI com os dados climáticos atuais recebidos da API
function renderResult(data: CombinedWeatherData) {
  const current = data.current
  const units = data.currentUnits
  
  const weatherDescription = getWeatherDescription(current.weather_code)
  const formattedDate = formatDateForCity(data.timezone)

  // preenche as informações no painel de clima atual
  ui.temperatureEl.textContent = formatTemperature(current.temperature_2m, units.temperature_2m)
  ui.cityLineEl.textContent = `${data.cityName}, ${data.countryCode}`
  ui.dateLineEl.textContent = formattedDate
  
  ui.weatherDescriptionEl.textContent = weatherDescription
  ui.humidityValueEl.textContent = `${current.relative_humidity_2m}${units.relative_humidity_2m}`
  ui.feelsLikeValueEl.textContent = `${current.apparent_temperature}${units.apparent_temperature}`
  ui.precipitationValueEl.textContent = `${current.precipitation_probability}${units.precipitation_probability}`
  ui.windValueEl.textContent = `${Number(current.wind_speed_10m).toFixed(1)} ${units.wind_speed_10m} · ${formatWindDirection(current.wind_direction_10m)}`

  // desenha os cards semanais e muda o estado da tela para o resultado
  renderForecast(data)
  setState('result')
}

// escuta a digitação no campo de busca para aplicar a formatação do nome em tempo real
ui.input.addEventListener('input', () => {
  const normalized = normalizeCityInput(ui.input.value)
  if (normalized !== ui.input.value) {ui.input.value = normalized}
})

// gerencia o envio do formulário de pesquisa
ui.form.addEventListener('submit', async (event) => {
  event.preventDefault()

  const cityName = normalizeCityInput(ui.input.value)
  if (!cityName) {setState('empty'); return} // se o campo estiver vazio, volta para o estado inicial
  ui.input.value = cityName
  setState('loading') // ativa a tela de carregamento

  const result = await searchWeather(cityName) // executa a busca assíncrona na API
  if (!result) {setState('empty'); ui.input.value = ''; return} // trata falhas na consulta

  // limpa a caixa de texto e renderiza os dados retornados
  ui.input.value = ''
  renderResult(result)
})

setState('empty')
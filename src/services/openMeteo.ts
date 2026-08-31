// regras ou formatos que os dados devem seguir
import { getWeatherDescription } from '../utils/weatherCode'
import type {
  CombinedWeatherData,
  ForecastResponse,
  GeocodingResponse,
  GeocodingResult,
  WeatherCurrent,
  WeatherCurrentUnits,
  WeatherDay,
} from '../types/weather'

// endereços da API 
const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search'
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast'

// converte uma data no nome do dia da semana
function formatWeekdayName(date: string, timezone: string): string {
  const safeDate = new Date(date)
  const formatter = new Intl.DateTimeFormat('pt-BR', {
    timeZone: timezone,
    weekday: 'long',
  })

  const weekday = formatter.format(safeDate).replace('-feira', '').trim()
  return weekday.charAt(0).toUpperCase() + weekday.slice(1)
}

// confere o nome da cidade
function isValidCityName(cityName: string): boolean {
  return cityName.trim().length > 0
}

// confere se o valor é um número válido
function isFiniteNumber(value: number): boolean {
  return Number.isFinite(value)
}

// função para buscar dados da cidade
export async function searchCity(cityName: string): Promise<GeocodingResult | null> {
  if (!isValidCityName(cityName)) {return null} // se o nome da cidade for inválido, encerra a busca

  try {
    // monta os parâmetros da busca
    const params = new URLSearchParams({
      name: cityName.trim(),
      count: '1',
      language: 'pt',
      format: 'json',
    })

    const response = await fetch(`${GEOCODING_URL}?${params.toString()}`) // faz a requisição
    if (!response.ok) {return null} // se o servidor respondeu com algum erro, encerra

    // converte a resposta em formato de objeto
    const payload = (await response.json()) as GeocodingResponse
    const city = payload.results?.[0]
    // valida se a cidade encontrada tem todos os dados obrigatórios
    if (!city || !city.name || !isFiniteNumber(city.latitude) || !isFiniteNumber(city.longitude)) {return null}

    // retorna um objeto limpo com as coordenadas da cidade
    return {
      name: city.name,
      latitude: Number(city.latitude),
      longitude: Number(city.longitude),
      country_code: city.country_code,
      timezone: city.timezone,
    }
  } 
  
  catch {return null}
}

// função para buscar o clima da cidade
export async function getWeather(latitude: number, longitude: number, timezone: string): Promise<CombinedWeatherData | null> {
  // verifica se as coordenadas e o fuso horário são válidos
  if (!isFiniteNumber(latitude) || !isFiniteNumber(longitude) || !timezone?.trim()) {return null}

  try {
    // configura os parâmetros pedindo as métricas específicas do clima
    const params = new URLSearchParams({
      latitude: String(latitude),
      longitude: String(longitude),
      current: 'precipitation_probability,temperature_2m,relative_humidity_2m,apparent_temperature,is_day,wind_speed_10m,wind_direction_10m,precipitation,weather_code',
      daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
      timezone: timezone.trim(),
      forecast_days: '8',
    })

    // faz a consulta do clima na API
    const response = await fetch(`${FORECAST_URL}?${params.toString()}`)
    if (!response.ok) {return null}

    const payload = (await response.json()) as ForecastResponse
    const current = payload.current
    const currentUnits = payload.current_units
    const daily = payload.daily
    // se faltar algum dado, encerra
    if (!current || !currentUnits || !daily) {return null}

    // campos obrigátórios para a aplicação funcionar
    const requiredFields: Array<keyof WeatherCurrent> = [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'is_day',
      'wind_speed_10m',
      'wind_direction_10m',
      'precipitation_probability',
      'weather_code',
    ]
    // garantir que nenhum campo obrigátorio falte
    const hasRequiredCurrent = requiredFields.every((field) => current[field] !== undefined)
    if (!hasRequiredCurrent) {return null}

    // padroniza e garante a conversão de todos os dados atuais em tipos numéricos válidos
    const normalizedCurrent: WeatherCurrent = {
      temperature_2m: Number(current.temperature_2m),
      relative_humidity_2m: Number(current.relative_humidity_2m),
      apparent_temperature: Number(current.apparent_temperature),
      is_day: Number(current.is_day),
      wind_speed_10m: Number(current.wind_speed_10m),
      wind_direction_10m: Number(current.wind_direction_10m),
      precipitation_probability: Number(current.precipitation_probability),
      precipitation: Number(current.precipitation ?? 0),
      weather_code: Number(current.weather_code),
    }

    // define valores padrão seguros para as unidades de medida (caso a API não envie alguma)
    const normalizedUnits: WeatherCurrentUnits = {
      temperature_2m: String(currentUnits.temperature_2m ?? '°C'),
      relative_humidity_2m: String(currentUnits.relative_humidity_2m ?? '%'),
      apparent_temperature: String(currentUnits.apparent_temperature ?? '°C'),
      is_day: String(currentUnits.is_day ?? ''),
      wind_speed_10m: String(currentUnits.wind_speed_10m ?? 'km/h'),
      wind_direction_10m: String(currentUnits.wind_direction_10m ?? '°'),
      precipitation_probability: String(currentUnits.precipitation_probability ?? '%'),
      precipitation: String(currentUnits.precipitation ?? 'mm'),
      weather_code: String(currentUnits.weather_code ?? ''),
    }

    // transforma a estrutura em arrays paralelos da API em um array de objetos por dia
    const forecast: WeatherDay[] = (daily.time ?? []).map((date, index) => {
      const weatherCode = Number(daily.weather_code?.[index] ?? 0)
      const maxTemp = Number(daily.temperature_2m_max?.[index] ?? 0)
      const minTemp = Number(daily.temperature_2m_min?.[index] ?? 0)
      const precipitationProbability = Number(daily.precipitation_probability_max?.[index] ?? 0)

      // retorna o objeto completo estruturado de um único dia de previsão
      return {
        date,
        dayName: formatWeekdayName(date, timezone.trim()),
        weatherCode,
        maxTemp,
        minTemp,
        precipitationProbability,
        description: getWeatherDescription(weatherCode),
      }
    })

    // retorna a estrutura final unificada (ainda sem os dados da cidade, que serão preenchidos depois)
    return {
      cityName: '',
      countryCode: '',
      timezone: timezone.trim(),
      current: normalizedCurrent,
      currentUnits: normalizedUnits,
      forecast,
    }
  } 
  
  catch {return null}
}

// função para mostrar a tela da aplicação
export async function searchWeather(cityName: string): Promise<CombinedWeatherData | null> {
  const city = await searchCity(cityName) // busca a cidade e coordenadas
  if (!city) {return null} // não achou, encerra busca

  // usa latitude e longitude para a busca do clima
  const weather = await getWeather(city.latitude, city.longitude, city.timezone) 

  // busca do clima falhou, encerra
  if (!weather) {return null}

  // junta os dados da cidade obtidos e entrega tudo
  return {
    cityName: city.name,
    countryCode: city.country_code,
    timezone: city.timezone,
    current: weather.current,
    currentUnits: weather.currentUnits,
    forecast: weather.forecast,
  }
}
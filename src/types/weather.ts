// define o formato dos dados da cidade encontrada no mapa
export interface GeocodingResult {
  name: string
  latitude: number
  longitude: number
  country_code: string
  timezone: string
}

// representa o resultado da pesquisa
export interface GeocodingResponse {results?: GeocodingResult[] | null}

// guarda os valors numéricos do clima no momento atual
export interface WeatherCurrent {
  temperature_2m: number
  relative_humidity_2m: number
  apparent_temperature: number
  is_day: number
  wind_speed_10m: number
  wind_direction_10m: number
  precipitation_probability: number
  precipitation: number
  weather_code: number
}

// guarda os símbolos ou textos das unidades de medida de cada dado acima
export interface WeatherCurrentUnits {
  temperature_2m: string
  relative_humidity_2m: string
  apparent_temperature: string
  is_day: string
  wind_speed_10m: string
  wind_direction_10m: string
  precipitation_probability: string
  precipitation: string
  weather_code: string
}

// estrutura simplificada e tratada de um único dia de previsão
export interface WeatherDay {
  date: string
  dayName: string
  weatherCode: number
  maxTemp: number
  minTemp: number
  precipitationProbability: number
  description: string
}

// estrutura dos dados brutos de previsão diária vindos da API
export interface WeatherDaily {
  time?: string[] | null
  weather_code?: Array<number | string> | null
  temperature_2m_max?: Array<number | string> | null
  temperature_2m_min?: Array<number | string> | null
  precipitation_probability_max?: Array<number | string> | null
}

// guarda as unidades de medida (ex: "°C", "mm", "%") referentes aos dados da previsão diária da API
export interface WeatherDailyUnits {
  time?: string
  weather_code?: string
  temperature_2m_max?: string
  temperature_2m_min?: string
  precipitation_probability_max?: string
}

// representa a resposta que chega do servidor de meteorologia na internet
export interface ForecastResponse {
  current?: Partial<WeatherCurrent> | null
  current_units?: Partial<WeatherCurrentUnits> | null
  daily?: Partial<WeatherDaily> | null
  daily_units?: Partial<WeatherDailyUnits> | null
}

// junta a cidade escolhida com os dados numéricos e suas respectivas unidades de medida
export interface CombinedWeatherData {
  cityName: string
  countryCode: string
  timezone: string
  current: WeatherCurrent
  currentUnits: WeatherCurrentUnits
  forecast: WeatherDay[]
}